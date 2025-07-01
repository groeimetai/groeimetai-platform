import { CertificateService } from './certificateService'
import { AssessmentService } from './assessmentService'
import { NotificationService } from './notificationService'
import { EmailService } from './emailService'

const PASSING_SCORE = 80 // 80% required to earn certificate

export class CertificateGenerationService {
  /**
   * Process assessment completion and generate certificate if eligible
   */
  static async processAssessmentCompletion(
    userId: string,
    courseId: string,
    attemptId: string
  ): Promise<{ certificateGenerated: boolean; certificateId?: string }> {
    try {
      // Check if certificate should be generated
      const certificateId = await CertificateService.checkAndGenerateCertificate(
        userId,
        courseId,
        attemptId
      )

      if (certificateId) {
        // Send notifications
        await this.sendCertificateNotifications(userId, courseId, certificateId)
        
        return {
          certificateGenerated: true,
          certificateId,
        }
      }

      return {
        certificateGenerated: false,
      }
    } catch (error) {
      console.error('Process assessment completion error:', error)
      throw error
    }
  }

  /**
   * Send certificate notifications to user
   */
  private static async sendCertificateNotifications(
    userId: string,
    courseId: string,
    certificateId: string
  ): Promise<void> {
    try {
      // Get certificate data
      const certificate = await CertificateService.getCertificateById(certificateId)
      if (!certificate) return

      // Send in-app notification
      if (NotificationService) {
        await NotificationService.sendNotification({
          userId,
          title: 'Congratulations! You earned a certificate',
          message: `You have successfully completed "${certificate.courseName}" with a passing score.`,
          type: 'certificate',
          data: {
            certificateId,
            courseId,
          },
        })
      }

      // Send email notification
      try {
        await EmailService.sendCertificateEmail({
          userId,
          certificateId,
          courseName: certificate.courseName,
          certificateUrl: certificate.certificateUrl,
          linkedinShareUrl: (certificate as any).linkedinShareUrl,
        })
      } catch (emailError) {
        console.error('Failed to send certificate email:', emailError)
        // Don't throw - email is not critical
      }
    } catch (error) {
      console.error('Send certificate notifications error:', error)
      // Don't throw - notifications are not critical
    }
  }

  /**
   * Batch process pending assessments for certificate generation
   * This can be used in a scheduled job
   */
  static async batchProcessPendingCertificates(): Promise<{
    processed: number
    generated: number
  }> {
    try {
      let processed = 0
      let generated = 0

      // This would query for completed assessments without certificates
      // Implementation depends on your specific data structure
      
      console.log(`Batch process completed: ${processed} processed, ${generated} generated`)
      
      return {
        processed,
        generated,
      }
    } catch (error) {
      console.error('Batch process pending certificates error:', error)
      throw error
    }
  }
}

// Export a hook that can be integrated with the assessment service
export const onAssessmentCompleted = async (
  userId: string,
  courseId: string,
  attemptId: string
) => {
  return CertificateGenerationService.processAssessmentCompletion(
    userId,
    courseId,
    attemptId
  )
}