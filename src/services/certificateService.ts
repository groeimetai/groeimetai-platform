import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
  Timestamp,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import QRCode from 'qrcode'
import { generateCertificatePDF } from './certificatePDFGenerator'
import crypto from 'crypto'
import { db, storage } from '@/lib/firebase'
import { Certificate, User, Course, AssessmentAttempt, Enrollment } from '@/types'
import { BlockchainCertificate, CertificateVerification } from '@/types/certificate'
import { AssessmentService } from './assessmentService'
import { EnrollmentService } from './enrollmentService'

// Certificate configuration
const CERTIFICATE_CONFIG = {
  passingScore: 80, // 80% required to earn certificate
  idLength: 12,
  qrCodeSize: 200,
  organizationName: 'GroeimetAI Academy',
  organizationLogo: '/images/logo.png',
  organizationWebsite: 'https://groeimetai.com',
  linkedinShareUrl: 'https://www.linkedin.com/sharing/share-offsite/?url=',
}

// Blockchain configuration
const BLOCKCHAIN_CONFIG = {
  enabled: true, // Enable blockchain verification
  network: 'polygon' as const,
  explorerBaseUrl: 'https://polygonscan.com',
  mockMode: true, // Use mock blockchain for development
}

// Extended Certificate interface for internal use
interface CertificateData extends Certificate {
  certificateNumber: string
  verificationCode: string
  qrCodeData: string
  grade: string
  score: number
  completionTime: number
  achievements: string[]
  linkedinShareUrl?: string
}

export class CertificateService {
  /**
   * Generate unique certificate ID (12 characters)
   */
  private static generateCertificateId(): string {
    const timestamp = Date.now().toString(36).slice(-6)
    const random = crypto.randomBytes(3).toString('hex')
    return `${timestamp}${random}`.toUpperCase().slice(0, CERTIFICATE_CONFIG.idLength)
  }

  /**
   * Generate certificate number for display
   */
  private static generateCertificateNumber(): string {
    const year = new Date().getFullYear()
    const month = String(new Date().getMonth() + 1).padStart(2, '0')
    const random = crypto.randomBytes(4).toString('hex').toUpperCase()
    return `CERT-${year}${month}-${random}`
  }

  /**
   * Generate verification code
   */
  private static generateVerificationCode(certificateId: string): string {
    const hash = crypto.createHash('sha256')
    const secret = process.env.CERTIFICATE_SECRET || 'default-secret'
    hash.update(certificateId + secret)
    return hash.digest('hex').substring(0, 16).toUpperCase()
  }

  /**
   * Generate certificate for course completion (without assessment)
   */
  static async generateCertificateForCourseCompletion(
    userId: string,
    courseId: string
  ): Promise<string | null> {
    try {
      // Check if certificate already exists
      const existingCertificate = await this.getUserCourseCertificate(userId, courseId)
      if (existingCertificate) {
        return existingCertificate.id
      }

      // Get enrollment data
      const enrollmentData = await EnrollmentService.getUserEnrollment(userId, courseId)
      if (!enrollmentData || !enrollmentData.completedAt) {
        return null // Course not completed
      }

      // Get user and course data
      const [userDoc, courseDoc] = await Promise.all([
        getDoc(doc(db, 'users', userId)),
        getDoc(doc(db, 'courses', courseId))
      ])

      const userData = userDoc.data() as User
      const courseData = courseDoc.data() as Course

      if (!userData || !courseData) {
        throw new Error('Required data not found')
      }

      // Calculate completion time in hours
      const completionTime = Math.floor(
        (enrollmentData.completedAt.getTime() - enrollmentData.enrolledAt.getTime()) / (1000 * 60 * 60)
      )

      // Generate certificate with completion-based values
      return await this.generateCertificate({
        userId,
        courseId,
        studentName: userData.displayName,
        courseName: courseData.title,
        instructorName: courseData.instructor.displayName,
        instructorTitle: 'Course Instructor',
        score: 100, // Full completion
        grade: 'Completed',
        completionTime,
        achievements: ['Course Completed', 'All Lessons Finished'],
      })
    } catch (error) {
      console.error('Generate certificate for course completion error:', error)
      throw error
    }
  }

  /**
   * Check if user has passed assessment and generate certificate if eligible
   */
  static async checkAndGenerateCertificate(
    userId: string,
    courseId: string,
    attemptId: string
  ): Promise<string | null> {
    try {
      // Get assessment attempt
      const attempt = await AssessmentService.getAttemptById(attemptId)
      if (!attempt || !attempt.passed || attempt.score < CERTIFICATE_CONFIG.passingScore) {
        return null
      }

      // Check if certificate already exists
      const existingCertificate = await this.getUserCourseCertificate(userId, courseId)
      if (existingCertificate) {
        return existingCertificate.id
      }

      // Get user and course data
      const [userDoc, courseDoc, enrollmentData] = await Promise.all([
        getDoc(doc(db, 'users', userId)),
        getDoc(doc(db, 'courses', courseId)),
        EnrollmentService.getUserEnrollment(userId, courseId)
      ])

      const userData = userDoc.data() as User
      const courseData = courseDoc.data() as Course

      if (!userData || !courseData || !enrollmentData) {
        throw new Error('Required data not found')
      }

      // Generate certificate
      return await this.generateCertificate({
        userId,
        courseId,
        studentName: userData.displayName,
        courseName: courseData.title,
        instructorName: courseData.instructor.displayName,
        instructorTitle: 'Course Instructor',
        score: attempt.score,
        grade: this.calculateGrade(attempt.score),
        completionTime: enrollmentData.completedAt ? 
          Math.floor((enrollmentData.completedAt.getTime() - enrollmentData.enrolledAt.getTime()) / (1000 * 60 * 60)) : 0,
        achievements: this.calculateAchievements(attempt.score, attempt.timeSpent),
      })
    } catch (error) {
      console.error('Check and generate certificate error:', error)
      throw error
    }
  }

  /**
   * Calculate grade based on score
   */
  private static calculateGrade(score: number): string {
    if (score >= 95) return 'A+'
    if (score >= 90) return 'A'
    if (score >= 85) return 'B+'
    if (score >= 80) return 'B'
    if (score >= 75) return 'C+'
    if (score >= 70) return 'C'
    if (score >= 65) return 'D'
    return 'F'
  }

  /**
   * Calculate achievements based on performance
   */
  private static calculateAchievements(score: number, timeSpent: number): string[] {
    const achievements: string[] = []
    
    if (score === 100) achievements.push('Perfect Score')
    if (score >= 95) achievements.push('Excellence Award')
    if (score >= 90) achievements.push('High Achiever')
    if (timeSpent < 1800) achievements.push('Speed Learner') // Less than 30 minutes
    
    return achievements
  }

  /**
   * Generate certificate for user course completion
   */
  static async generateCertificate(params: {
    userId: string
    courseId: string
    studentName: string
    courseName: string
    instructorName: string
    instructorTitle?: string
    score: number
    grade: string
    completionTime: number
    achievements: string[]
  }): Promise<string> {
    try {
      // Check if certificate already exists
      const existingCertificate = await this.getUserCourseCertificate(params.userId, params.courseId)
      if (existingCertificate) {
        return existingCertificate.id
      }

      // Generate unique certificate ID (12 chars)
      const certificateId = this.generateCertificateId()
      const certificateNumber = this.generateCertificateNumber()
      const verificationCode = this.generateVerificationCode(certificateId)
      
      // Generate QR code for verification with embedded data
      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/certificate/verify/${certificateId}`
      const qrData = {
        certificateId,
        verificationUrl,
        verificationCode,
        timestamp: Date.now(),
        issuer: CERTIFICATE_CONFIG.organizationName
      }
      
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: CERTIFICATE_CONFIG.qrCodeSize,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      })
      
      // Record certificate on blockchain if enabled
      let blockchainData: BlockchainCertificate | undefined = undefined
      if (BLOCKCHAIN_CONFIG.enabled) {
        try {
          // Create temporary certificate object for blockchain recording
          const tempCertificate = {
            id: certificateNumber,
            studentName: params.studentName,
            courseName: params.courseName,
            completionDate: new Date(),
            certificateNumber,
          }
          
          blockchainData = await this.simulateBlockchainRecord(tempCertificate)
        } catch (error) {
          console.error('Blockchain recording failed:', error)
          // Continue without blockchain data - set to undefined explicitly
          blockchainData = undefined
        }
      }
      
      // Create certificate document with extended data
      const certificateData: Omit<CertificateData, 'id'> & { blockchain?: BlockchainCertificate } = {
        userId: params.userId,
        courseId: params.courseId,
        title: `Certificate of Completion - ${params.courseName}`,
        studentName: params.studentName,
        courseName: params.courseName,
        instructorName: params.instructorName,
        completionDate: new Date(),
        qrCode: qrCodeDataUrl,
        certificateUrl: '', // Will be set after PDF generation
        isValid: true,
        createdAt: new Date(),
        certificateNumber,
        verificationCode,
        qrCodeData: JSON.stringify(qrData),
        grade: params.grade,
        score: params.score,
        completionTime: params.completionTime,
        achievements: params.achievements,
        linkedinShareUrl: '',
        blockchain: blockchainData,
      }

      // Save certificate to Firestore
      const docRef = await addDoc(collection(db, 'certificates'), certificateData)
      
      // Generate PDF certificate and upload to storage
      const pdfUrl = await this.generateCertificatePDF(certificateId, certificateData)
      
      // Generate LinkedIn share URL
      const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/certificate/share/${certificateId}`
      const linkedinUrl = `${CERTIFICATE_CONFIG.linkedinShareUrl}${encodeURIComponent(shareUrl)}`
      
      // Update certificate with URLs
      await updateDoc(doc(db, 'certificates', docRef.id), {
        certificateUrl: pdfUrl,
        linkedinShareUrl: linkedinUrl,
        updatedAt: serverTimestamp(),
      })
      
      // Update user statistics
      await updateDoc(doc(db, 'users', params.userId), {
        'stats.certificatesEarned': increment(1),
        updatedAt: serverTimestamp(),
      })
      
      // Send certificate email notification
      try {
        const { EmailService } = await import('./emailService')
        await EmailService.sendCertificateEmail({
          userId: params.userId,
          certificateId,
          courseName: params.courseName,
          certificateUrl: pdfUrl,
          linkedinShareUrl: linkedinUrl,
        })
      } catch (emailError) {
        console.error('Failed to send certificate email:', emailError)
        // Don't throw - email is not critical
      }
      
      // Send in-app notification
      try {
        const { NotificationService } = await import('./notificationService')
        await NotificationService.sendNotification({
          userId: params.userId,
          title: 'Congratulations! You earned a certificate',
          message: `You have successfully completed "${params.courseName}" with a passing score.`,
          type: 'certificate',
          data: {
            certificateId,
            courseId: params.courseId,
          },
        })
      } catch (notificationError) {
        console.error('Failed to send certificate notification:', notificationError)
        // Don't throw - notifications are not critical
      }
      
      // Log certificate generation
      await this.logCertificateEvent('certificate_generated', {
        certificateId,
        userId: params.userId,
        courseId: params.courseId,
        grade: params.grade,
        score: params.score,
      })

      return docRef.id
    } catch (error) {
      console.error('Generate certificate error:', error)
      throw error
    }
  }

  /**
   * Get certificate by ID
   */
  static async getCertificateById(certificateId: string): Promise<Certificate | null> {
    try {
      const certificateDoc = await getDoc(doc(db, 'certificates', certificateId))
      if (!certificateDoc.exists()) return null

      return {
        id: certificateDoc.id,
        ...certificateDoc.data(),
      } as Certificate
    } catch (error) {
      console.error('Get certificate by ID error:', error)
      throw error
    }
  }

  /**
   * Get user's certificates
   */
  static async getUserCertificates(userId: string): Promise<Certificate[]> {
    try {
      const q = query(
        collection(db, 'certificates'),
        where('userId', '==', userId),
        where('isValid', '==', true),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Certificate[]
    } catch (error) {
      console.error('Get user certificates error:', error)
      throw error
    }
  }

  /**
   * Get certificate for specific user and course
   */
  static async getUserCourseCertificate(userId: string, courseId: string): Promise<Certificate | null> {
    try {
      const q = query(
        collection(db, 'certificates'),
        where('userId', '==', userId),
        where('courseId', '==', courseId),
        where('isValid', '==', true)
      )
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) return null

      const doc = querySnapshot.docs[0]
      return {
        id: doc.id,
        ...doc.data(),
      } as Certificate
    } catch (error) {
      console.error('Get user course certificate error:', error)
      throw error
    }
  }

  /**
   * Verify certificate authenticity
   */
  static async verifyCertificate(params: {
    certificateId?: string
    qrCode?: string
    verificationCode?: string
  }): Promise<{
    isValid: boolean
    certificate?: CertificateData
    verificationDetails?: {
      verifiedAt: Date
      verificationMethod: 'id' | 'qr' | 'code'
      scanCount?: number
    }
    message: string
  }> {
    try {
      let certificateId: string | undefined
      let verificationMethod: 'id' | 'qr' | 'code' = 'id'
      
      // Extract certificate ID from different sources
      if (params.certificateId) {
        certificateId = params.certificateId
        verificationMethod = 'id'
      } else if (params.qrCode) {
        try {
          const qrData = JSON.parse(params.qrCode)
          certificateId = qrData.certificateId
          verificationMethod = 'qr'
        } catch (error) {
          return {
            isValid: false,
            message: 'Invalid QR code format'
          }
        }
      } else if (params.verificationCode) {
        // Would need to implement reverse lookup
        verificationMethod = 'code'
        return {
          isValid: false,
          message: 'Verification by code not yet implemented'
        }
      }
      
      if (!certificateId) {
        return {
          isValid: false,
          message: 'No certificate identifier provided'
        }
      }
      
      const certificate = await this.getCertificateById(certificateId) as CertificateData
      
      if (!certificate) {
        return {
          isValid: false,
          message: 'Certificate not found'
        }
      }

      if (!certificate.isValid) {
        return {
          isValid: false,
          certificate,
          message: 'Certificate has been revoked'
        }
      }

      // Update verification statistics
      await updateDoc(doc(db, 'certificates', certificateId), {
        'stats.scanCount': increment(1),
        'stats.lastScannedAt': serverTimestamp(),
      })
      
      // Log verification event
      await this.logCertificateEvent('certificate_verified', {
        certificateId,
        verificationMethod,
      })
      
      return {
        isValid: true,
        certificate,
        verificationDetails: {
          verifiedAt: new Date(),
          verificationMethod,
          scanCount: (certificate as any).stats?.scanCount || 1,
        },
        message: 'Certificate is valid and authentic'
      }
    } catch (error) {
      console.error('Verify certificate error:', error)
      return {
        isValid: false,
        message: 'Error verifying certificate'
      }
    }
  }

  /**
   * Revoke certificate
   */
  static async revokeCertificate(certificateId: string): Promise<void> {
    try {
      const certificateRef = doc(db, 'certificates', certificateId)
      await updateDoc(certificateRef, {
        isValid: false,
      })
    } catch (error) {
      console.error('Revoke certificate error:', error)
      throw error
    }
  }

  /**
   * Generate certificate PDF with proper template
   */
  private static async generateCertificatePDF(
    certificateId: string,
    certificate: Omit<CertificateData, 'id'>
  ): Promise<string> {
    try {
      // Prepare certificate data for PDF generation
      const certificateData = {
        id: certificateId,
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        instructorName: certificate.instructorName,
        completionDate: certificate.completionDate,
        certificateNumber: certificate.certificateNumber,
        grade: certificate.grade,
        score: certificate.score,
        achievements: certificate.achievements,
        qrCode: certificate.qrCode,
        organizationName: CERTIFICATE_CONFIG.organizationName,
        organizationLogo: CERTIFICATE_CONFIG.organizationLogo,
        organizationWebsite: CERTIFICATE_CONFIG.organizationWebsite,
      }
      
      // Generate PDF using React PDF
      const pdfBlob = await generateCertificatePDF(certificateData)
      
      // Upload to Firebase Storage
      const storageRef = ref(storage, `certificates/${certificateId}.pdf`)
      await uploadBytes(storageRef, pdfBlob, {
        contentType: 'application/pdf',
        customMetadata: {
          certificateId,
          studentName: certificate.studentName,
          courseName: certificate.courseName,
        }
      })
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef)
      return downloadURL
    } catch (error) {
      console.error('Generate certificate PDF error:', error)
      throw error
    }
  }


  /**
   * Log certificate events for audit trail
   */
  private static async logCertificateEvent(event: string, data: any): Promise<void> {
    try {
      await addDoc(collection(db, 'certificate_logs'), {
        event,
        data,
        timestamp: serverTimestamp(),
        source: 'certificate-service'
      })
    } catch (error) {
      console.error('Failed to log certificate event:', error)
    }
  }
  
  /**
   * Generate LinkedIn share metadata
   */
  static async generateLinkedInShareData(certificateId: string): Promise<{
    title: string
    description: string
    imageUrl: string
    shareUrl: string
  }> {
    try {
      const certificate = await this.getCertificateById(certificateId) as CertificateData
      if (!certificate) {
        throw new Error('Certificate not found')
      }
      
      const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/certificate/share/${certificateId}`
      
      return {
        title: `I earned a Certificate in ${certificate.courseName}!`,
        description: `I successfully completed "${certificate.courseName}" with a grade of ${certificate.grade} (${certificate.score}%) at ${CERTIFICATE_CONFIG.organizationName}.`,
        imageUrl: certificate.certificateUrl,
        shareUrl,
      }
    } catch (error) {
      console.error('Generate LinkedIn share data error:', error)
      throw error
    }
  }
  
  /**
   * Get certificate statistics for admin
   */
  static async getCertificateStats(): Promise<{
    totalCertificates: number
    validCertificates: number
    revokedCertificates: number
    certificatesByGrade: Record<string, number>
    averageScore: number
  }> {
    try {
      // Get all certificates
      const allCertificatesQuery = query(collection(db, 'certificates'))
      const allCertificatesSnapshot = await getDocs(allCertificatesQuery)
      const totalCertificates = allCertificatesSnapshot.size

      // Get valid certificates
      const validCertificatesQuery = query(
        collection(db, 'certificates'),
        where('isValid', '==', true)
      )
      const validCertificatesSnapshot = await getDocs(validCertificatesQuery)
      const validCertificates = validCertificatesSnapshot.size

      const revokedCertificates = totalCertificates - validCertificates
      
      // Calculate additional statistics
      const certificatesByGrade: Record<string, number> = {}
      let totalScore = 0
      
      allCertificatesSnapshot.docs.forEach(doc => {
        const data = doc.data() as CertificateData
        if (data.grade) {
          certificatesByGrade[data.grade] = (certificatesByGrade[data.grade] || 0) + 1
        }
        if (data.score) {
          totalScore += data.score
        }
      })
      
      const averageScore = totalCertificates > 0 ? Math.round(totalScore / totalCertificates) : 0

      return {
        totalCertificates,
        validCertificates,
        revokedCertificates,
        certificatesByGrade,
        averageScore,
      }
    } catch (error) {
      console.error('Get certificate stats error:', error)
      throw error
    }
  }

  /**
   * Generate blockchain hash for certificate data
   */
  static generateBlockchainHash(certificateData: {
    studentName: string
    courseName: string
    completionDate: Date
    certificateNumber: string
  }): string {
    const dataString = JSON.stringify({
      ...certificateData,
      issuer: CERTIFICATE_CONFIG.organizationName,
      version: '1.0',
    })
    
    return crypto
      .createHash('sha256')
      .update(dataString)
      .digest('hex')
  }

  /**
   * Simulate blockchain recording (mock implementation)
   * In production, this would interact with actual blockchain network
   */
  static async simulateBlockchainRecord(certificate: any): Promise<BlockchainCertificate> {
    const hash = this.generateBlockchainHash({
      studentName: certificate.studentName,
      courseName: certificate.courseName,
      completionDate: certificate.completionDate,
      certificateNumber: certificate.certificateNumber || certificate.id,
    })
    
    // Simulate blockchain transaction
    const blockNumber = Math.floor(Math.random() * 1000000) + 15000000
    const transactionId = '0x' + crypto.randomBytes(32).toString('hex')
    
    const blockchainData: BlockchainCertificate = {
      hash,
      blockNumber,
      transactionId,
      networkId: 'polygon',
      contractAddress: '0x' + crypto.randomBytes(20).toString('hex'),
      timestamp: new Date(),
      explorerUrl: `https://polygonscan.com/tx/${transactionId}`,
      gasUsed: '0.001',
      status: 'confirmed',
    }
    
    // Don't update here - let the caller handle updates
    return blockchainData
  }

  /**
   * Verify certificate on blockchain
   */
  static async verifyCertificateOnChain(certificateId: string): Promise<CertificateVerification> {
    try {
      const certificate = await this.getCertificateById(certificateId)
      if (!certificate) {
        return {
          certificateId,
          isValid: false,
          verifiedAt: new Date(),
          blockchainStatus: 'not_found',
          details: {
            originalHash: '',
            currentHash: '',
            matchesBlockchain: false,
            certificateData: {
              studentName: '',
              courseName: '',
              completionDate: new Date(),
              issuer: '',
            },
          },
        }
      }
      
      // Generate current hash
      const currentHash = this.generateBlockchainHash({
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        completionDate: certificate.completionDate,
        certificateNumber: (certificate as any).certificateNumber || certificate.id,
      })
      
      // Check if certificate has blockchain data
      const blockchain = (certificate as any).blockchain as BlockchainCertificate | undefined
      
      if (!blockchain) {
        return {
          certificateId,
          isValid: certificate.isValid,
          verifiedAt: new Date(),
          blockchainStatus: 'pending',
          details: {
            originalHash: '',
            currentHash,
            matchesBlockchain: false,
            certificateData: {
              studentName: certificate.studentName,
              courseName: certificate.courseName,
              completionDate: certificate.completionDate,
              issuer: CERTIFICATE_CONFIG.organizationName,
            },
          },
        }
      }
      
      // Verify hash matches
      const matchesBlockchain = blockchain.hash === currentHash
      
      return {
        certificateId,
        isValid: certificate.isValid && matchesBlockchain,
        verifiedAt: new Date(),
        blockchainStatus: matchesBlockchain ? 'verified' : 'invalid',
        details: {
          originalHash: blockchain.hash,
          currentHash,
          matchesBlockchain,
          certificateData: {
            studentName: certificate.studentName,
            courseName: certificate.courseName,
            completionDate: certificate.completionDate,
            issuer: CERTIFICATE_CONFIG.organizationName,
          },
        },
        verificationProof: {
          merkleRoot: blockchain.hash,
          signature: blockchain.transactionId,
        },
      }
    } catch (error) {
      console.error('Verify certificate on chain error:', error)
      throw error
    }
  }

  /**
   * Enable blockchain verification for existing certificate
   */
  static async enableBlockchainVerification(certificateId: string): Promise<BlockchainCertificate | null> {
    try {
      const certificate = await this.getCertificateById(certificateId)
      if (!certificate) return null
      
      return await this.simulateBlockchainRecord(certificate)
    } catch (error) {
      console.error('Enable blockchain verification error:', error)
      throw error
    }
  }
}