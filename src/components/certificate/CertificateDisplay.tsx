'use client'

import { useState, useEffect } from 'react'
import { Certificate } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, Share2, CheckCircle, Calendar, Award, ExternalLink, Shield } from 'lucide-react'
import { format } from 'date-fns'
import Image from 'next/image'
import BlockchainVerification from './BlockchainVerification'

interface CertificateDisplayProps {
  certificate: Certificate & {
    certificateNumber?: string
    grade?: string
    score?: number
    achievements?: string[]
    linkedinShareUrl?: string
    blockchain?: {
      hash: string
      blockNumber: number
      transactionId: string
      networkId: string
      explorerUrl: string
      status: 'pending' | 'confirmed' | 'failed'
    }
  }
  showActions?: boolean
  showShareButton?: boolean
  showDownloadButton?: boolean
  showBlockchainVerification?: boolean
  onShare?: () => void
  onDownload?: () => void
}

export default function CertificateDisplay({
  certificate,
  showActions = true,
  showShareButton = true,
  showDownloadButton = true,
  showBlockchainVerification = true,
  onShare,
  onDownload,
}: CertificateDisplayProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleShare = async () => {
    if (onShare) {
      onShare()
      return
    }

    setIsSharing(true)
    try {
      // Track share event
      await fetch(`/api/certificate/share/${certificate.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'linkedin' }),
      })

      // Open LinkedIn share
      if (certificate.linkedinShareUrl) {
        window.open(certificate.linkedinShareUrl, '_blank')
      } else {
        // Fallback to manual share
        const shareUrl = `${window.location.origin}/certificate/verify/${certificate.id}`
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
        window.open(linkedinUrl, '_blank')
      }
    } catch (error) {
      console.error('Share error:', error)
    } finally {
      setIsSharing(false)
    }
  }

  const handleDownload = async () => {
    if (onDownload) {
      onDownload()
      return
    }

    setIsDownloading(true)
    try {
      // Use API endpoint to download certificate
      const response = await fetch(`/api/certificate/download/${certificate.id}`)
      
      if (!response.ok) {
        throw new Error('Failed to download certificate')
      }
      
      // Get the blob from response
      const blob = await response.blob()
      
      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `certificate-${certificate.id}.pdf`
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)
    } catch (error) {
      console.error('Download error:', error)
      // Fallback to opening certificateUrl if available
      if (certificate.certificateUrl) {
        window.open(certificate.certificateUrl, '_blank')
      }
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <>
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center pb-2">
        <div className="flex items-center justify-center mb-4">
          <Award className="h-12 w-12 text-blue-600" />
        </div>
        <CardTitle className="text-3xl font-bold text-blue-600">
          Certificate of Completion
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Student Information */}
        <div className="text-center space-y-2">
          <p className="text-lg text-muted-foreground">This is to certify that</p>
          <h2 className="text-2xl font-bold">{certificate.studentName}</h2>
          <p className="text-lg text-muted-foreground">has successfully completed</p>
          <h3 className="text-xl font-semibold text-blue-600">{certificate.courseName}</h3>
        </div>

        {/* Grade and Score */}
        {(certificate.grade || certificate.score !== undefined) && (
          <div className="flex justify-center gap-4">
            {certificate.grade && (
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Grade: {certificate.grade}
              </Badge>
            )}
            {certificate.score !== undefined && (
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Score: {certificate.score}%
              </Badge>
            )}
          </div>
        )}

        {/* Achievements */}
        {certificate.achievements && certificate.achievements.length > 0 && (
          <div className="text-center">
            <p className="text-sm font-semibold text-muted-foreground mb-2">Achievements</p>
            <div className="flex flex-wrap justify-center gap-2">
              {certificate.achievements.map((achievement, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {achievement}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Completion Date */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Completed on {format(new Date(certificate.completionDate), 'MMMM d, yyyy')}</span>
        </div>

        {/* Certificate Number */}
        {certificate.certificateNumber && (
          <div className="text-center text-sm text-muted-foreground">
            Certificate No: {certificate.certificateNumber}
          </div>
        )}

        {/* QR Code */}
        {certificate.qrCode && (
          <div className="flex flex-col items-center space-y-2 pt-4">
            <div className="p-4 bg-white rounded-lg border">
              <Image
                src={certificate.qrCode}
                alt="Certificate QR Code"
                width={150}
                height={150}
                className="rounded"
              />
            </div>
            <p className="text-xs text-muted-foreground">Scan to verify authenticity</p>
          </div>
        )}

        {/* Verification Status */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Valid Certificate</span>
          </div>
          {certificate.blockchain?.status === 'confirmed' && (
            <div className="flex items-center gap-2 text-blue-600">
              <Shield className="h-5 w-5" />
              <span className="font-medium">Blockchain Verified</span>
            </div>
          )}
        </div>

        {/* Instructor Information */}
        <div className="text-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">Issued by</p>
          <p className="font-medium">{certificate.instructorName}</p>
          <p className="text-sm text-muted-foreground">Course Instructor</p>
          <p className="text-sm text-muted-foreground mt-2">GroeimetAI Academy</p>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex flex-wrap justify-center gap-4 pt-6">
            {showDownloadButton && (
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                variant="default"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                {isDownloading ? 'Downloading...' : 'Download PDF'}
              </Button>
            )}
            
            {showShareButton && (
              <Button
                onClick={handleShare}
                disabled={isSharing}
                variant="outline"
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                {isSharing ? 'Sharing...' : 'Share on LinkedIn'}
              </Button>
            )}
            
            <Button
              variant="outline"
              className="gap-2"
              asChild
            >
              <a
                href={`/certificate/verify/${certificate.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                View Public Certificate
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
    
    {/* Blockchain Verification Section */}
    {showBlockchainVerification && (certificate.blockchain || certificate.isValid) && (
      <div className="mt-6">
        <BlockchainVerification 
          certificateId={certificate.id}
          blockchainData={certificate.blockchain}
        />
      </div>
    )}
  </>
  )
}