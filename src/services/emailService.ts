interface EmailData {
  to?: string
  userId?: string
  subject: string
  html: string
  text?: string
}

interface CertificateEmailData {
  userId: string
  certificateId: string
  courseName: string
  certificateUrl: string
  linkedinShareUrl?: string
}

export class EmailService {
  /**
   * Send email
   */
  static async sendEmail(data: EmailData): Promise<void> {
    try {
      // In production, this would integrate with an email service like SendGrid, AWS SES, etc.
      console.log('Sending email:', {
        to: data.to || data.userId,
        subject: data.subject
      })
      
      // Placeholder for email sending logic
      // await emailProvider.send(data)
    } catch (error) {
      console.error('Send email error:', error)
      throw error
    }
  }

  /**
   * Send certificate email
   */
  static async sendCertificateEmail(data: CertificateEmailData): Promise<void> {
    try {
      const subject = `Congratulations! Your certificate for ${data.courseName} is ready`
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Congratulations!</h1>
          
          <p>You have successfully earned a certificate for completing <strong>${data.courseName}</strong>.</p>
          
          <p>Your certificate is now available for download and sharing.</p>
          
          <div style="margin: 30px 0;">
            <a href="${data.certificateUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">
              Download Certificate
            </a>
            
            ${data.linkedinShareUrl ? `
            <a href="${data.linkedinShareUrl}" 
               style="background-color: #0077b5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Share on LinkedIn
            </a>
            ` : ''}
          </div>
          
          <p>You can also view and verify your certificate at any time from your dashboard.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="color: #6b7280; font-size: 14px;">
            This certificate is issued by GroeimetAI Academy and can be verified online.
          </p>
        </div>
      `
      
      const text = `
        Congratulations!
        
        You have successfully earned a certificate for completing ${data.courseName}.
        
        Download your certificate: ${data.certificateUrl}
        ${data.linkedinShareUrl ? `Share on LinkedIn: ${data.linkedinShareUrl}` : ''}
        
        You can also view and verify your certificate at any time from your dashboard.
        
        This certificate is issued by GroeimetAI Academy and can be verified online.
      `
      
      await this.sendEmail({
        userId: data.userId,
        subject,
        html,
        text
      })
    } catch (error) {
      console.error('Send certificate email error:', error)
      throw error
    }
  }

  /**
   * Send assessment reminder email
   */
  static async sendAssessmentReminderEmail(data: {
    userId: string
    courseName: string
    assessmentName: string
    dueDate?: Date
  }): Promise<void> {
    try {
      const subject = `Reminder: Complete your assessment for ${data.courseName}`
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Assessment Reminder</h2>
          
          <p>Don't forget to complete your assessment for <strong>${data.courseName}</strong>.</p>
          
          <p>Assessment: <strong>${data.assessmentName}</strong></p>
          
          ${data.dueDate ? `<p>Due date: ${data.dueDate.toLocaleDateString()}</p>` : ''}
          
          <p>Remember, you need to score at least 80% to earn your certificate!</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/courses" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">
            Go to My Courses
          </a>
        </div>
      `
      
      await this.sendEmail({
        userId: data.userId,
        subject,
        html
      })
    } catch (error) {
      console.error('Send assessment reminder email error:', error)
      throw error
    }
  }
}