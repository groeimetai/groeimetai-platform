import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CertificateDisplay from '@/components/certificate/CertificateDisplay'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Shield } from 'lucide-react'
import { adminDb } from '@/lib/firebase/admin'
import ClientCertificateVerify from './ClientCertificateVerify'

interface PageProps {
  params: { certificateId: string }
}

async function verifyCertificate(certificateId: string) {
  try {
    console.log('Verifying certificate:', certificateId)
    
    // Check if Firebase Admin is initialized
    if (!adminDb) {
      console.error('Firebase Admin not initialized')
      return { 
        success: false, 
        message: 'Service temporarily unavailable' 
      }
    }
    
    // Get certificate directly from Firestore Admin
    const certificateDoc = await adminDb.collection('certificates').doc(certificateId).get()
    
    if (!certificateDoc.exists) {
      console.log('Certificate not found')
      return { 
        success: false, 
        message: 'Certificate not found' 
      }
    }
    
    const certificateData = certificateDoc.data()
    
    if (!certificateData || !certificateData.isValid) {
      console.log('Certificate not valid')
      return { 
        success: false, 
        message: 'Certificate has been revoked or is invalid' 
      }
    }
    
    // Update scan count
    await adminDb.collection('certificates').doc(certificateId).update({
      'stats.scanCount': (certificateData.stats?.scanCount || 0) + 1,
      'stats.lastScannedAt': new Date()
    })
    
    return {
      success: true,
      certificate: {
        id: certificateDoc.id,
        studentName: certificateData.studentName,
        courseName: certificateData.courseName,
        completionDate: certificateData.completionDate?.toDate ? certificateData.completionDate.toDate() : certificateData.completionDate,
        grade: certificateData.grade || 'Completed',
        score: certificateData.score || 100,
        certificateNumber: certificateData.certificateNumber,
        achievements: certificateData.achievements || [],
        instructorName: certificateData.instructorName,
        isValid: certificateData.isValid,
        certificateUrl: certificateData.certificateUrl,
        qrCode: certificateData.qrCode,
      },
      verificationDetails: {
        verifiedAt: new Date(),
        verificationMethod: 'id' as const,
        scanCount: (certificateData.stats?.scanCount || 0) + 1,
      },
      message: 'Certificate is valid and authentic',
    }
  } catch (error) {
    console.error('Verify certificate error:', error)
    return { 
      success: false, 
      message: 'Failed to verify certificate' 
    }
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // If Firebase Admin is not initialized, return default metadata
  if (!adminDb) {
    return {
      title: 'Certificate Verification | GroeimetAI',
      description: 'Verify certificate authenticity',
    }
  }
  
  const result = await verifyCertificate(params.certificateId)
  
  if (result.success && result.certificate) {
    return {
      title: `Certificate - ${result.certificate.studentName} | GroeimetAI`,
      description: `Certificate of completion for ${result.certificate.courseName}`,
      openGraph: {
        title: `${result.certificate.studentName} earned a certificate!`,
        description: `Successfully completed "${result.certificate.courseName}" at GroeimetAI Academy`,
        type: 'article',
      },
    }
  }
  
  return {
    title: 'Certificate Verification | GroeimetAI',
    description: 'Verify certificate authenticity',
  }
}

export default async function CertificateVerificationPage({ params }: PageProps) {
  // If Firebase Admin is not initialized, use client-side verification
  if (!adminDb) {
    console.log('Using client-side certificate verification')
    return <ClientCertificateVerify certificateId={params.certificateId} />
  }
  
  const result = await verifyCertificate(params.certificateId)
  
  if (!result.success) {
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
                {result.message || 'The certificate you are looking for could not be found or may have been revoked.'}
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
        <CertificateDisplay
          certificate={result.certificate}
          showActions={true}
          showShareButton={true}
          showDownloadButton={true}
        />
        
        {/* Verification Details */}
        {result.verificationDetails && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Verification Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Verified on {new Date(result.verificationDetails.verifiedAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Verification method: {result.verificationDetails.verificationMethod}</span>
              </div>
              {result.verificationDetails.scanCount && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>This certificate has been verified {result.verificationDetails.scanCount} time(s)</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Additional Information */}
        <div className="text-center text-sm text-muted-foreground">
          <p>This certificate was issued by GroeimetAI Academy</p>
          <p>For questions about this certificate, please contact support@groeimetai.com</p>
        </div>
      </div>
    </div>
  )
}