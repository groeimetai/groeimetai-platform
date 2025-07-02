import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp, 
  Timestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getBlockchainService } from '@/services/blockchainService'
import { BlockchainCertificate } from '@/types/certificate'

export interface QueuedCertificate {
  id: string
  certificateId: string
  userId: string
  courseId: string
  mintData: {
    studentAddress: string
    studentName: string
    courseName: string
    instructorName: string
    completionDate: Date
    certificateNumber: string
    grade: string
    score: number
    achievements: string[]
  }
  status: 'pending' | 'processing' | 'completed' | 'failed'
  attempts: number
  maxAttempts: number
  lastAttemptAt?: Date
  nextRetryAt?: Date
  error?: string
  blockchainData?: BlockchainCertificate
  createdAt: Date
  updatedAt: Date
  priority: number // Higher number = higher priority
}

export interface QueueStats {
  pending: number
  processing: number
  completed: number
  failed: number
  avgProcessingTime: number
  successRate: number
}

export interface QueueConfig {
  maxConcurrent: number
  maxRetries: number
  retryDelay: number // Base delay in ms
  batchSize: number
  gasLimit: number
  priorityBoost: number // Boost for priority certificates
  rateLimitPerHour: number
}

const DEFAULT_CONFIG: QueueConfig = {
  maxConcurrent: 3,
  maxRetries: 5,
  retryDelay: 60000, // 1 minute base delay
  batchSize: 10,
  gasLimit: 500000,
  priorityBoost: 100,
  rateLimitPerHour: 50,
}

export class CertificateQueue {
  private static instance: CertificateQueue
  private config: QueueConfig
  private processing: Set<string> = new Set()
  private processInterval: NodeJS.Timer | null = null
  
  private constructor(config: Partial<QueueConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }
  
  static getInstance(config?: Partial<QueueConfig>): CertificateQueue {
    if (!CertificateQueue.instance) {
      CertificateQueue.instance = new CertificateQueue(config)
    }
    return CertificateQueue.instance
  }
  
  /**
   * Add certificate to minting queue
   */
  async addToQueue(params: {
    certificateId: string
    userId: string
    courseId: string
    mintData: QueuedCertificate['mintData']
    priority?: number
  }): Promise<string> {
    try {
      const queueId = `${params.certificateId}_${Date.now()}`
      const queueItem: QueuedCertificate = {
        id: queueId,
        certificateId: params.certificateId,
        userId: params.userId,
        courseId: params.courseId,
        mintData: params.mintData,
        status: 'pending',
        attempts: 0,
        maxAttempts: this.config.maxRetries,
        createdAt: new Date(),
        updatedAt: new Date(),
        priority: params.priority || 0,
      }
      
      await setDoc(doc(db, 'certificate_queue', queueId), {
        ...queueItem,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      
      // Start processing if not already running
      this.startProcessing()
      
      return queueId
    } catch (error) {
      console.error('Error adding to queue:', error)
      throw error
    }
  }
  
  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<QueueStats> {
    try {
      const [pending, processing, completed, failed] = await Promise.all([
        this.countByStatus('pending'),
        this.countByStatus('processing'),
        this.countByStatus('completed'),
        this.countByStatus('failed'),
      ])
      
      // Calculate average processing time
      const completedQuery = query(
        collection(db, 'certificate_queue'),
        where('status', '==', 'completed'),
        orderBy('updatedAt', 'desc'),
        limit(100)
      )
      const completedDocs = await getDocs(completedQuery)
      
      let totalProcessingTime = 0
      let count = 0
      
      completedDocs.forEach(doc => {
        const data = doc.data()
        if (data.createdAt && data.updatedAt) {
          const created = data.createdAt.toDate()
          const updated = data.updatedAt.toDate()
          totalProcessingTime += updated.getTime() - created.getTime()
          count++
        }
      })
      
      const avgProcessingTime = count > 0 ? totalProcessingTime / count : 0
      const total = completed + failed
      const successRate = total > 0 ? (completed / total) * 100 : 0
      
      return {
        pending,
        processing,
        completed,
        failed,
        avgProcessingTime,
        successRate,
      }
    } catch (error) {
      console.error('Error getting queue stats:', error)
      throw error
    }
  }
  
  /**
   * Process queued certificates
   */
  async processQueue(): Promise<void> {
    try {
      // Check if already processing max concurrent
      if (this.processing.size >= this.config.maxConcurrent) {
        return
      }
      
      // Get next batch of pending certificates
      const pendingQuery = query(
        collection(db, 'certificate_queue'),
        where('status', '==', 'pending'),
        orderBy('priority', 'desc'),
        orderBy('createdAt', 'asc'),
        limit(this.config.batchSize)
      )
      
      const pendingDocs = await getDocs(pendingQuery)
      
      // Process each certificate
      const promises = pendingDocs.docs
        .slice(0, this.config.maxConcurrent - this.processing.size)
        .map(doc => this.processCertificate(doc.id, doc.data() as QueuedCertificate))
      
      await Promise.allSettled(promises)
    } catch (error) {
      console.error('Error processing queue:', error)
    }
  }
  
  /**
   * Process single certificate
   */
  private async processCertificate(queueId: string, queueItem: QueuedCertificate): Promise<void> {
    if (this.processing.has(queueId)) {
      return
    }
    
    this.processing.add(queueId)
    
    try {
      // Update status to processing
      await updateDoc(doc(db, 'certificate_queue', queueId), {
        status: 'processing',
        attempts: queueItem.attempts + 1,
        lastAttemptAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      
      // Get blockchain service
      const blockchainService = getBlockchainService()
      
      // Check if wallet is connected
      const walletState = blockchainService.getWalletState()
      if (!walletState.isConnected || !walletState.address) {
        throw new Error('Wallet not connected')
      }
      
      // Check minting permissions
      const canMint = await blockchainService.canMintCertificates(walletState.address)
      if (!canMint) {
        throw new Error('Wallet does not have minting permissions')
      }
      
      // Mint certificate
      const mintResult = await blockchainService.mintCertificate({
        ...queueItem.mintData,
        certificateId: queueItem.certificateId,
      })
      
      if (mintResult.success && mintResult.blockchainCertificate) {
        // Update queue item as completed
        await updateDoc(doc(db, 'certificate_queue', queueId), {
          status: 'completed',
          blockchainData: mintResult.blockchainCertificate,
          updatedAt: serverTimestamp(),
        })
        
        // Update original certificate with blockchain data
        await updateDoc(doc(db, 'certificates', queueItem.certificateId), {
          blockchain: mintResult.blockchainCertificate,
          updatedAt: serverTimestamp(),
        })
        
        // Log success
        await this.logQueueEvent('certificate_minted', {
          queueId,
          certificateId: queueItem.certificateId,
          transactionId: mintResult.blockchainCertificate.transactionId,
        })
      } else {
        throw new Error(mintResult.error || 'Minting failed')
      }
    } catch (error: any) {
      console.error('Error processing certificate:', error)
      
      // Calculate next retry time with exponential backoff
      const retryDelay = this.config.retryDelay * Math.pow(2, queueItem.attempts)
      const nextRetryAt = new Date(Date.now() + retryDelay)
      
      // Update queue item with error
      const isLastAttempt = queueItem.attempts + 1 >= this.config.maxRetries
      
      await updateDoc(doc(db, 'certificate_queue', queueId), {
        status: isLastAttempt ? 'failed' : 'pending',
        error: error.message,
        nextRetryAt: isLastAttempt ? null : nextRetryAt,
        updatedAt: serverTimestamp(),
      })
      
      // Log error
      await this.logQueueEvent('certificate_mint_failed', {
        queueId,
        certificateId: queueItem.certificateId,
        error: error.message,
        attempt: queueItem.attempts + 1,
        isLastAttempt,
      })
    } finally {
      this.processing.delete(queueId)
    }
  }
  
  /**
   * Retry failed certificates
   */
  async retryFailed(queueIds?: string[]): Promise<void> {
    try {
      let failedQuery
      
      if (queueIds && queueIds.length > 0) {
        // Retry specific certificates
        for (const queueId of queueIds) {
          await updateDoc(doc(db, 'certificate_queue', queueId), {
            status: 'pending',
            attempts: 0,
            error: null,
            nextRetryAt: null,
            updatedAt: serverTimestamp(),
          })
        }
      } else {
        // Retry all failed certificates
        failedQuery = query(
          collection(db, 'certificate_queue'),
          where('status', '==', 'failed')
        )
        const failedDocs = await getDocs(failedQuery)
        
        const updates = failedDocs.docs.map(doc =>
          updateDoc(doc.ref, {
            status: 'pending',
            attempts: 0,
            error: null,
            nextRetryAt: null,
            updatedAt: serverTimestamp(),
          })
        )
        
        await Promise.all(updates)
      }
      
      // Start processing
      this.startProcessing()
    } catch (error) {
      console.error('Error retrying failed certificates:', error)
      throw error
    }
  }
  
  /**
   * Clean up old completed/failed items
   */
  async cleanup(daysToKeep = 30): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
      
      const oldItemsQuery = query(
        collection(db, 'certificate_queue'),
        where('status', 'in', ['completed', 'failed']),
        where('updatedAt', '<', cutoffDate)
      )
      
      const oldItems = await getDocs(oldItemsQuery)
      
      // Delete in batches
      const batchSize = 500
      let deleted = 0
      
      for (let i = 0; i < oldItems.docs.length; i += batchSize) {
        const batch = oldItems.docs.slice(i, i + batchSize)
        await Promise.all(batch.map(doc => doc.ref.delete()))
        deleted += batch.length
      }
      
      return deleted
    } catch (error) {
      console.error('Error cleaning up queue:', error)
      throw error
    }
  }
  
  /**
   * Start automatic queue processing
   */
  startProcessing(): void {
    if (this.processInterval) {
      return
    }
    
    // Process immediately
    this.processQueue()
    
    // Set up interval for continuous processing
    this.processInterval = setInterval(() => {
      this.processQueue()
    }, 10000) // Process every 10 seconds
  }
  
  /**
   * Stop automatic queue processing
   */
  stopProcessing(): void {
    if (this.processInterval) {
      clearInterval(this.processInterval)
      this.processInterval = null
    }
  }
  
  /**
   * Count certificates by status
   */
  private async countByStatus(status: QueuedCertificate['status']): Promise<number> {
    const statusQuery = query(
      collection(db, 'certificate_queue'),
      where('status', '==', status)
    )
    const snapshot = await getDocs(statusQuery)
    return snapshot.size
  }
  
  /**
   * Log queue events
   */
  private async logQueueEvent(event: string, data: any): Promise<void> {
    try {
      await setDoc(doc(collection(db, 'certificate_queue_logs')), {
        event,
        data,
        timestamp: serverTimestamp(),
        source: 'certificate-queue',
      })
    } catch (error) {
      console.error('Failed to log queue event:', error)
    }
  }
  
  /**
   * Get queue item by ID
   */
  async getQueueItem(queueId: string): Promise<QueuedCertificate | null> {
    try {
      const docSnap = await getDoc(doc(db, 'certificate_queue', queueId))
      
      if (!docSnap.exists()) {
        return null
      }
      
      return docSnap.data() as QueuedCertificate
    } catch (error) {
      console.error('Error getting queue item:', error)
      throw error
    }
  }
  
  /**
   * Get queue items for a certificate
   */
  async getCertificateQueueItems(certificateId: string): Promise<QueuedCertificate[]> {
    try {
      const itemsQuery = query(
        collection(db, 'certificate_queue'),
        where('certificateId', '==', certificateId),
        orderBy('createdAt', 'desc')
      )
      
      const snapshot = await getDocs(itemsQuery)
      
      return snapshot.docs.map(doc => doc.data() as QueuedCertificate)
    } catch (error) {
      console.error('Error getting certificate queue items:', error)
      throw error
    }
  }
  
  /**
   * Check rate limits
   */
  async checkRateLimit(): Promise<{ allowed: boolean; resetAt?: Date }> {
    try {
      const hourAgo = new Date()
      hourAgo.setHours(hourAgo.getHours() - 1)
      
      const recentQuery = query(
        collection(db, 'certificate_queue'),
        where('status', '==', 'completed'),
        where('updatedAt', '>', hourAgo)
      )
      
      const snapshot = await getDocs(recentQuery)
      const recentCount = snapshot.size
      
      if (recentCount >= this.config.rateLimitPerHour) {
        return {
          allowed: false,
          resetAt: new Date(Date.now() + 3600000), // 1 hour from now
        }
      }
      
      return { allowed: true }
    } catch (error) {
      console.error('Error checking rate limit:', error)
      return { allowed: true } // Allow on error
    }
  }
}

// Export singleton instance
export const certificateQueue = CertificateQueue.getInstance()