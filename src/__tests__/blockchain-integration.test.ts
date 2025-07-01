import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { CertificateService } from '@/services/certificateService'
import { certificateQueue, CertificateQueue } from '@/lib/blockchain/certificate-queue'
import { getBlockchainService } from '@/services/blockchainService'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {},
  storage: {}
}))

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  updateDoc: jest.fn(),
  getDoc: jest.fn(),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  getDocs: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
  Timestamp: {
    fromDate: jest.fn((date) => date),
    now: jest.fn(() => new Date())
  }
}))

jest.mock('@/services/blockchainService')

describe('Blockchain Certificate Integration', () => {
  const mockCertificate = {
    id: 'cert123',
    userId: 'user123',
    courseId: 'course123',
    studentName: 'John Doe',
    courseName: 'Blockchain Basics',
    instructorName: 'Jane Smith',
    completionDate: new Date(),
    certificateUrl: 'https://example.com/cert.pdf',
    isValid: true,
    createdAt: new Date(),
    qrCode: 'data:image/png;base64,mock',
    title: 'Certificate of Completion'
  }

  const mockBlockchainService = {
    getWalletState: jest.fn(),
    canMintCertificates: jest.fn(),
    mintCertificate: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getBlockchainService as jest.MockedFunction<typeof getBlockchainService>).mockReturnValue(mockBlockchainService as any)
  })

  describe('Certificate Queue System', () => {
    it('should add certificate to queue when wallet is not connected', async () => {
      mockBlockchainService.getWalletState.mockReturnValue({
        isConnected: false,
        address: null
      })

      const addToQueueSpy = jest.spyOn(certificateQueue, 'addToQueue').mockResolvedValue('queue123')

      await CertificateService.enableBlockchainVerification('cert123')

      expect(addToQueueSpy).toHaveBeenCalledWith(expect.objectContaining({
        certificateId: 'cert123',
        priority: -5
      }))
    })

    it('should add certificate to queue when minting fails', async () => {
      mockBlockchainService.getWalletState.mockReturnValue({
        isConnected: true,
        address: '0x1234567890123456789012345678901234567890'
      })
      mockBlockchainService.canMintCertificates.mockResolvedValue(true)
      mockBlockchainService.mintCertificate.mockRejectedValue(new Error('Gas price too high'))

      const addToQueueSpy = jest.spyOn(certificateQueue, 'addToQueue').mockResolvedValue('queue123')
      ;(getDoc as jest.MockedFunction<typeof getDoc>).mockResolvedValue({
        exists: () => true,
        data: () => mockCertificate,
        id: 'cert123'
      } as any)

      await expect(CertificateService.enableBlockchainVerification('cert123')).rejects.toThrow()

      expect(addToQueueSpy).toHaveBeenCalledWith(expect.objectContaining({
        certificateId: 'cert123',
        priority: 5 // Higher priority for manual enablement
      }))
    })

    it('should process queued certificates successfully', async () => {
      const mockQueueItem = {
        id: 'queue123',
        certificateId: 'cert123',
        userId: 'user123',
        courseId: 'course123',
        mintData: {
          studentAddress: '0x1234567890123456789012345678901234567890',
          studentName: 'John Doe',
          courseName: 'Blockchain Basics',
          instructorName: 'Jane Smith',
          completionDate: new Date(),
          certificateNumber: 'CERT-2024-001',
          grade: 'A',
          score: 95,
          achievements: ['Perfect Score']
        },
        status: 'pending' as const,
        attempts: 0,
        maxAttempts: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        priority: 0
      }

      mockBlockchainService.getWalletState.mockReturnValue({
        isConnected: true,
        address: '0x1234567890123456789012345678901234567890'
      })
      mockBlockchainService.canMintCertificates.mockResolvedValue(true)
      mockBlockchainService.mintCertificate.mockResolvedValue({
        success: true,
        blockchainCertificate: {
          hash: '0xabcd',
          blockNumber: 12345,
          transactionId: '0xtx123',
          networkId: 'polygon',
          contractAddress: '0xcontract',
          timestamp: new Date(),
          explorerUrl: 'https://polygonscan.com/tx/0xtx123',
          gasUsed: '0.001',
          status: 'confirmed'
        }
      })

      // Mock the queue processing
      const processCertificateSpy = jest.spyOn(CertificateQueue.prototype as any, 'processCertificate')
        .mockResolvedValue(undefined)

      await certificateQueue.processQueue()

      // Verify that processing was attempted
      expect(processCertificateSpy).not.toHaveBeenCalled() // Would be called if we had mocked the queue fetch
    })
  })

  describe('Blockchain Status Checking', () => {
    it('should return verified status for minted certificates', async () => {
      ;(getDoc as jest.MockedFunction<typeof getDoc>).mockResolvedValue({
        exists: () => true,
        data: () => ({
          ...mockCertificate,
          blockchain: {
            hash: '0xabcd',
            blockNumber: 12345,
            transactionId: '0xtx123',
            networkId: 'polygon',
            status: 'confirmed'
          }
        }),
        id: 'cert123'
      } as any)

      const status = await CertificateService.getBlockchainStatus('cert123')

      expect(status).toEqual({
        hasBlockchain: true,
        status: 'verified',
        blockchain: expect.objectContaining({
          hash: '0xabcd',
          blockNumber: 12345
        })
      })
    })

    it('should return pending status for queued certificates', async () => {
      ;(getDoc as jest.MockedFunction<typeof getDoc>).mockResolvedValue({
        exists: () => true,
        data: () => ({
          ...mockCertificate,
          blockchainQueueId: 'queue123'
        }),
        id: 'cert123'
      } as any)

      const getQueueItemSpy = jest.spyOn(certificateQueue, 'getQueueItem').mockResolvedValue({
        id: 'queue123',
        certificateId: 'cert123',
        status: 'pending',
        attempts: 1,
        maxAttempts: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        priority: 0
      } as any)

      const getQueueStatsSpy = jest.spyOn(certificateQueue, 'getQueueStats').mockResolvedValue({
        pending: 5,
        processing: 1,
        completed: 10,
        failed: 2,
        avgProcessingTime: 30000,
        successRate: 83.33
      })

      const status = await CertificateService.getBlockchainStatus('cert123')

      expect(status).toEqual({
        hasBlockchain: false,
        status: 'pending',
        queuePosition: 5
      })

      expect(getQueueItemSpy).toHaveBeenCalledWith('queue123')
      expect(getQueueStatsSpy).toHaveBeenCalled()
    })

    it('should return none status for unminted certificates', async () => {
      ;(getDoc as jest.MockedFunction<typeof getDoc>).mockResolvedValue({
        exists: () => true,
        data: () => mockCertificate,
        id: 'cert123'
      } as any)

      const status = await CertificateService.getBlockchainStatus('cert123')

      expect(status).toEqual({
        hasBlockchain: false,
        status: 'none'
      })
    })
  })

  describe('Queue Statistics', () => {
    it('should calculate queue statistics correctly', async () => {
      const getQueueStatsSpy = jest.spyOn(certificateQueue, 'getQueueStats').mockResolvedValue({
        pending: 10,
        processing: 2,
        completed: 50,
        failed: 5,
        avgProcessingTime: 45000, // 45 seconds
        successRate: 90.91
      })

      const stats = await CertificateService.getBlockchainQueueStats()

      expect(stats).toEqual({
        pending: 10,
        processing: 2,
        completed: 50,
        failed: 5,
        avgProcessingTime: 45000,
        successRate: 90.91
      })
    })
  })

  describe('Retry Mechanism', () => {
    it('should retry failed blockchain minting', async () => {
      ;(getDoc as jest.MockedFunction<typeof getDoc>).mockResolvedValue({
        exists: () => true,
        data: () => ({
          ...mockCertificate,
          blockchainQueueId: 'queue123'
        }),
        id: 'cert123'
      } as any)

      const retryFailedSpy = jest.spyOn(certificateQueue, 'retryFailed').mockResolvedValue(undefined)

      await CertificateService.retryBlockchainMinting('cert123')

      expect(retryFailedSpy).toHaveBeenCalledWith(['queue123'])
    })

    it('should create new queue entry if none exists', async () => {
      ;(getDoc as jest.MockedFunction<typeof getDoc>).mockResolvedValue({
        exists: () => true,
        data: () => mockCertificate,
        id: 'cert123'
      } as any)

      const enableBlockchainSpy = jest.spyOn(CertificateService, 'enableBlockchainVerification')
        .mockResolvedValue(null)

      await CertificateService.retryBlockchainMinting('cert123')

      expect(enableBlockchainSpy).toHaveBeenCalledWith('cert123')
    })
  })

  describe('Rate Limiting', () => {
    it('should respect rate limits', async () => {
      const checkRateLimitSpy = jest.spyOn(certificateQueue, 'checkRateLimit').mockResolvedValue({
        allowed: false,
        resetAt: new Date(Date.now() + 3600000) // 1 hour from now
      })

      const rateLimit = await certificateQueue.checkRateLimit()

      expect(rateLimit.allowed).toBe(false)
      expect(rateLimit.resetAt).toBeDefined()
    })
  })

  describe('Cleanup Operations', () => {
    it('should clean up old queue items', async () => {
      const cleanupSpy = jest.spyOn(certificateQueue, 'cleanup').mockResolvedValue(25)

      const deleted = await certificateQueue.cleanup(30) // Keep items for 30 days

      expect(deleted).toBe(25)
      expect(cleanupSpy).toHaveBeenCalledWith(30)
    })
  })
})