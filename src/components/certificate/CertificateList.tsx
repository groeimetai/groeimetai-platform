'use client'

import { useState, useEffect } from 'react'
import { Certificate } from '@/types'
import { CertificateService } from '@/services/certificateService'
import CertificateDisplay from './CertificateDisplay'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Award, Calendar, Download, ExternalLink, Share2 } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

interface CertificateListProps {
  userId: string
  showTitle?: boolean
  limit?: number
}

interface ExtendedCertificate extends Certificate {
  certificateNumber?: string
  grade?: string
  score?: number
  achievements?: string[]
  linkedinShareUrl?: string
}

export default function CertificateList({ 
  userId, 
  showTitle = true,
  limit 
}: CertificateListProps) {
  const [certificates, setCertificates] = useState<ExtendedCertificate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCertificate, setSelectedCertificate] = useState<ExtendedCertificate | null>(null)

  useEffect(() => {
    loadCertificates()
  }, [userId])

  const loadCertificates = async () => {
    try {
      setLoading(true)
      const userCertificates = await CertificateService.getUserCertificates(userId)
      const certificatesToShow = limit ? userCertificates.slice(0, limit) : userCertificates
      setCertificates(certificatesToShow as ExtendedCertificate[])
    } catch (error) {
      console.error('Load certificates error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {showTitle && (
          <h2 className="text-2xl font-bold">My Certificates</h2>
        )}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-4" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (certificates.length === 0) {
    return (
      <div className="space-y-4">
        {showTitle && (
          <h2 className="text-2xl font-bold">My Certificates</h2>
        )}
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No certificates earned yet. Complete courses with a score of 80% or higher to earn certificates.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (selectedCertificate) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => setSelectedCertificate(null)}
          className="mb-4"
        >
          ← Back to certificates
        </Button>
        <CertificateDisplay certificate={selectedCertificate} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">My Certificates</h2>
          <Badge variant="secondary" className="text-lg">
            {certificates.length} Certificate{certificates.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      )}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {certificates.map((certificate) => (
          <Card 
            key={certificate.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedCertificate(certificate)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <Award className="h-8 w-8 text-blue-600 flex-shrink-0" />
                {certificate.grade && (
                  <Badge variant="secondary">{certificate.grade}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="font-semibold line-clamp-2">{certificate.courseName}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Instructor: {certificate.instructorName}
                </p>
              </div>
              
              {certificate.score !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Score:</span>
                  <span className="text-sm text-muted-foreground">{certificate.score}%</span>
                </div>
              )}
              
              {certificate.achievements && certificate.achievements.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {certificate.achievements.slice(0, 2).map((achievement, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {achievement}
                    </Badge>
                  ))}
                  {certificate.achievements.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{certificate.achievements.length - 2}
                    </Badge>
                  )}
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(certificate.completionDate), 'MMM d, yyyy')}</span>
              </div>
              
              {certificate.certificateNumber && (
                <p className="text-xs text-muted-foreground">
                  Certificate No: {certificate.certificateNumber}
                </p>
              )}
              
              <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  asChild
                >
                  <a href={certificate.certificateUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="h-3 w-3 mr-1" />
                    PDF
                  </a>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  asChild
                >
                  <Link href={`/certificate/verify/${certificate.id}`} target="_blank">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </Link>
                </Button>
                {certificate.linkedinShareUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    asChild
                  >
                    <a href={certificate.linkedinShareUrl} target="_blank" rel="noopener noreferrer">
                      <Share2 className="h-3 w-3 mr-1" />
                      Share
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}