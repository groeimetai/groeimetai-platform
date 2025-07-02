import { NextRequest, NextResponse } from 'next/server'
import { CertificateService } from '@/services/certificateService'

export async function GET(
  request: NextRequest,
  { params }: { params: { certificateId: string } }
) {
  try {
    const { certificateId } = params
    
    // Get certificate data
    const certificate = await CertificateService.getCertificateById(certificateId)
    
    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      )
    }
    
    // If certificate has a valid URL, redirect to it
    if (certificate.certificateUrl && certificate.certificateUrl.startsWith('http')) {
      return NextResponse.redirect(certificate.certificateUrl)
    }
    
    // For now, return a simple text certificate
    const certificateText = `
CERTIFICATE OF COMPLETION

This is to certify that

${certificate.studentName}

has successfully completed

${certificate.courseName}

Completed on: ${new Date(certificate.completionDate).toLocaleDateString()}
Certificate ID: ${certificateId}
Instructor: ${certificate.instructorName}

GroeimetAI Academy
`.trim()
    
    // Return as text file for now
    return new NextResponse(certificateText, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="certificate-${certificateId}.txt"`,
      },
    })
  } catch (error) {
    console.error('Certificate download error:', error)
    return NextResponse.json(
      { error: 'Failed to download certificate' },
      { status: 500 }
    )
  }
}