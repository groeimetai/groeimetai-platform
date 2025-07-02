import { certificateQueue } from './certificate-queue'
import { getServerBlockchainService } from '@/services/serverBlockchainService'
import { getServerWalletInfo } from './server-wallet'

/**
 * Process the certificate minting queue
 * This function is called periodically to process pending certificates
 */
export async function processCertificateQueue() {
  console.log('🔄 Starting certificate queue processing...')
  
  try {
    // Check if server wallet is ready
    const walletInfo = await getServerWalletInfo('polygon')
    
    if (!walletInfo.canMint) {
      console.warn('⚠️ Server wallet cannot mint:', {
        balance: walletInfo.balance,
        isLow: walletInfo.isLow
      })
      
      // Send alert if balance is low
      if (walletInfo.isLow) {
        console.error('🚨 Server wallet balance is critically low! Current balance:', walletInfo.balance, 'POL')
        // Here you could send an email/notification to admin
      }
      
      return {
        processed: 0,
        failed: 0,
        skipped: 0,
        message: 'Server wallet not ready for minting'
      }
    }
    
    // Get pending items from queue
    const stats = await certificateQueue.getQueueStats()
    console.log('📊 Queue stats:', stats)
    
    if (stats.pending === 0) {
      console.log('✅ No pending certificates to process')
      return {
        processed: 0,
        failed: 0,
        skipped: 0,
        message: 'Queue is empty'
      }
    }
    
    // Process the queue
    const result = await certificateQueue.processQueue({
      maxItems: 10, // Process up to 10 items per run
      maxRetries: 3
    })
    
    console.log('✅ Queue processing complete:', result)
    
    return result
  } catch (error) {
    console.error('❌ Error processing certificate queue:', error)
    return {
      processed: 0,
      failed: 0,
      skipped: 0,
      message: 'Error processing queue',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Initialize the queue processor
 * Sets up periodic processing of the certificate queue
 */
export function initializeQueueProcessor(intervalMinutes: number = 5) {
  console.log(`🚀 Initializing certificate queue processor (interval: ${intervalMinutes} minutes)`)
  
  // Process immediately on startup
  processCertificateQueue()
  
  // Then process periodically
  const interval = setInterval(() => {
    processCertificateQueue()
  }, intervalMinutes * 60 * 1000)
  
  // Return cleanup function
  return () => {
    console.log('🛑 Stopping certificate queue processor')
    clearInterval(interval)
  }
}

/**
 * Manual queue processing trigger
 * Can be called from API endpoints or admin tools
 */
export async function triggerQueueProcessing() {
  console.log('🔧 Manual queue processing triggered')
  return await processCertificateQueue()
}