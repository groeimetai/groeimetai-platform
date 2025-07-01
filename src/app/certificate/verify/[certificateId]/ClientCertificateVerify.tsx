'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Shield, Loader2 } from 'lucide-react'

// Use simple display to avoid complex component issues
import SimpleCertificateDisplay from '@/components/certificate/SimpleCertificateDisplay'

interface ClientCertificateVerifyProps {
  certificateId: string
}

export default function ClientCertificateVerify({ certificateId }: ClientCertificateVerifyProps) {
  const [loading, setLoading] = useState(true)
  const [certificate, setCertificate] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        console.log('Client-side certificate verification:', certificateId)
        
        const certificateRef = doc(db, 'certificates', certificateId)
        const certificateDoc = await getDoc(certificateRef)
        
        if (!certificateDoc.exists()) {
          setError('Certificate not found')
          return
        }
        
        const data = certificateDoc.data()
        
        if (!data.isValid) {
          setError('Certificate has been revoked or is invalid')
          return
        }
        
        setCertificate({
          id: certificateDoc.id,
          ...data,
          completionDate: data.completionDate?.toDate ? data.completionDate.toDate() : data.completionDate,
        })
      } catch (err) {
        console.error('Error verifying certificate:', err)
        setError('Failed to verify certificate')
      } finally {
        setLoading(false)
      }
    }

    verifyCertificate()
  }, [certificateId])

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-muted-foreground">Verifying certificate...</p>
        </div>
      </div>
    )
  }

  if (error || !certificate) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <Card className="border-red-200">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-red-500" />
            </div>
            <CardTitle className="text-2xl text-red-600">
              Certificate Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                {error || 'The certificate you are looking for could not be found or may have been revoked.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Verification Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Shield className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold">Certificate Verified</h1>
          <p className="text-muted-foreground">
            This certificate has been verified and is authentic
          </p>
        </div>
        
        {/* Certificate Display */}
        <SimpleCertificateDisplay certificate={certificate} />
        
        {/* Additional Information */}
        <div className="text-center text-sm text-muted-foreground">
          <p>This certificate was issued by GroeimetAI Academy</p>
          <p>For questions about this certificate, please contact support@groeimetai.com</p>
        </div>
      </div>
    </div>
  )
}