'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Award, Download, Share2, CheckCircle, PartyPopper, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'
import { Certificate } from '@/types'

interface CourseCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  courseName: string
  courseId: string
  certificate?: Certificate
  onGenerateCertificate?: () => Promise<void>
  isGeneratingCertificate?: boolean
}

export function CourseCompletionModal({
  isOpen,
  onClose,
  courseName,
  courseId,
  certificate,
  onGenerateCertificate,
  isGeneratingCertificate = false,
}: CourseCompletionModalProps) {
  const router = useRouter()
  const [showCertificate, setShowCertificate] = useState(false)

  // Trigger confetti when modal opens
  const triggerConfetti = () => {
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min
    }

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    }, 250)
  }

  // Trigger confetti when modal opens with certificate
  if (isOpen && certificate && !showCertificate) {
    triggerConfetti()
    setShowCertificate(true)
  }

  const handleViewCertificate = () => {
    router.push(`/certificate/verify/${certificate?.id}`)
  }

  const handleDownloadCertificate = () => {
    if (certificate?.certificateUrl) {
      window.open(certificate.certificateUrl, '_blank')
    }
  }

  const handleShareLinkedIn = () => {
    if (certificate) {
      const shareUrl = `${window.location.origin}/certificate/verify/${certificate.id}`
      const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
      window.open(linkedinUrl, '_blank')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <PartyPopper className="h-16 w-16 text-yellow-500" />
              <Sparkles className="h-8 w-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>
          <DialogTitle className="text-center text-3xl font-bold">
            Congratulations! 🎉
          </DialogTitle>
          <DialogDescription className="text-center text-lg mt-2">
            You've successfully completed <span className="font-semibold">{courseName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Course Progress</span>
              <span className="font-medium text-green-600">100% Complete</span>
            </div>
            <Progress value={100} className="h-3" />
            <div className="flex items-center gap-2 justify-center mt-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-600 font-medium">All lessons completed!</span>
            </div>
          </div>

          {/* Certificate section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Award className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-lg">Certificate of Completion</h3>
                <p className="text-sm text-muted-foreground">
                  {certificate ? 'Your certificate is ready!' : 'Generate your certificate to showcase your achievement'}
                </p>
              </div>
            </div>

            {certificate ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm">
                    Certificate ID: {certificate.id}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleViewCertificate}
                    variant="default"
                    className="flex-1 min-w-[150px]"
                  >
                    View Certificate
                  </Button>
                  <Button
                    onClick={handleDownloadCertificate}
                    variant="outline"
                    className="flex-1 min-w-[150px]"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    onClick={handleShareLinkedIn}
                    variant="outline"
                    className="flex-1 min-w-[150px]"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share on LinkedIn
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={onGenerateCertificate}
                disabled={isGeneratingCertificate}
                className="w-full"
              >
                {isGeneratingCertificate ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Generating Certificate...
                  </>
                ) : (
                  <>
                    <Award className="h-4 w-4 mr-2" />
                    Generate Certificate
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Next steps */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">What's Next?</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span>Explore more courses to continue your learning journey</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span>Share your achievement with your network</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span>Apply your new skills in real-world projects</span>
              </li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="flex-1"
            >
              Go to Dashboard
            </Button>
            <Button
              onClick={() => router.push('/cursussen')}
              variant="default"
              className="flex-1"
            >
              Browse More Courses
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}