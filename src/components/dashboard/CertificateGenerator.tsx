'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { CertificateService } from '@/services/certificateService'
import { EnrollmentService } from '@/services/enrollmentService'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Award, Loader2, CheckCircle } from 'lucide-react'

export function CertificateGenerator() {
  const { user } = useAuth()
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('')
  const [certificatesGenerated, setCertificatesGenerated] = useState(0)
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    if (user) {
      checkAndGenerateCertificates()
    }
  }, [user])

  const checkAndGenerateCertificates = async () => {
    if (!user) return

    try {
      // Get all user enrollments
      const enrollments = await EnrollmentService.getUserEnrollments(user.uid)
      
      // Filter completed enrollments
      const completedEnrollments = enrollments.filter(enrollment => 
        enrollment.completedAt && enrollment.status === 'active'
      )
      
      if (completedEnrollments.length === 0) return
      
      // Check which ones don't have certificates
      const enrollmentsWithoutCertificates = []
      
      for (const enrollment of completedEnrollments) {
        const existingCertificate = await CertificateService.getUserCourseCertificate(
          user.uid, 
          enrollment.courseId
        )
        
        if (!existingCertificate) {
          enrollmentsWithoutCertificates.push(enrollment)
        }
      }
      
      if (enrollmentsWithoutCertificates.length > 0) {
        setShowAlert(true)
        setMessage(`You have ${enrollmentsWithoutCertificates.length} completed course${enrollmentsWithoutCertificates.length > 1 ? 's' : ''} without certificates!`)
      }
    } catch (error) {
      console.error('Error checking certificates:', error)
    }
  }

  const generateMissingCertificates = async () => {
    if (!user) return

    setIsGenerating(true)
    setProgress(0)
    setCertificatesGenerated(0)

    try {
      // Get all user enrollments
      const enrollments = await EnrollmentService.getUserEnrollments(user.uid)
      
      // Filter completed enrollments
      const completedEnrollments = enrollments.filter(enrollment => 
        enrollment.completedAt && enrollment.status === 'active'
      )
      
      // Check which ones don't have certificates
      const enrollmentsWithoutCertificates = []
      
      for (const enrollment of completedEnrollments) {
        const existingCertificate = await CertificateService.getUserCourseCertificate(
          user.uid, 
          enrollment.courseId
        )
        
        if (!existingCertificate) {
          enrollmentsWithoutCertificates.push(enrollment)
        }
      }
      
      if (enrollmentsWithoutCertificates.length === 0) {
        setMessage('All your completed courses already have certificates!')
        return
      }
      
      // Generate certificates for each completed enrollment
      let generated = 0
      const total = enrollmentsWithoutCertificates.length
      
      for (const enrollment of enrollmentsWithoutCertificates) {
        try {
          setMessage(`Generating certificate ${generated + 1} of ${total}...`)
          
          const certificateId = await CertificateService.generateCertificateForCourseCompletion(
            user.uid,
            enrollment.courseId
          )
          
          if (certificateId) {
            generated++
            setCertificatesGenerated(generated)
          }
          
          setProgress((generated / total) * 100)
        } catch (error) {
          console.error(`Error generating certificate for course ${enrollment.courseId}:`, error)
        }
      }
      
      setMessage(`Successfully generated ${generated} certificate${generated !== 1 ? 's' : ''}!`)
      
      // Hide alert after successful generation
      setTimeout(() => {
        setShowAlert(false)
      }, 5000)
      
    } catch (error) {
      console.error('Error generating certificates:', error)
      setMessage('Error generating certificates. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (!showAlert || !user) return null

  return (
    <Alert className="mb-6">
      <Award className="h-4 w-4" />
      <AlertDescription className="space-y-3">
        <p className="font-medium">{message}</p>
        
        {isGenerating && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              Generating certificates... {certificatesGenerated} completed
            </p>
          </div>
        )}
        
        {!isGenerating && message.includes('without certificates') && (
          <Button
            onClick={generateMissingCertificates}
            size="sm"
            className="mt-2"
          >
            <Award className="h-4 w-4 mr-2" />
            Generate Missing Certificates
          </Button>
        )}
        
        {certificatesGenerated > 0 && !isGenerating && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">All certificates generated successfully!</span>
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}