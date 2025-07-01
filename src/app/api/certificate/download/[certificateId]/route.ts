import { NextRequest, NextResponse } from 'next/server'
import { CertificateService } from '@/services/certificateService'
import { generateCertificatePDF } from '@/services/certificatePDFGenerator'
import { CERTIFICATE_CONFIG } from '@/lib/config/certificates'

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
    
    // Otherwise, generate PDF on the fly
    console.log('Generating certificate PDF on the fly for:', certificateId)
    
    // Prepare certificate data for PDF generation
    const certificateData = {
      id: certificateId,
      studentName: certificate.studentName,
      courseName: certificate.courseName,
      instructorName: certificate.instructorName,
      completionDate: certificate.completionDate,
      certificateNumber: (certificate as any).certificateNumber || certificateId,
      grade: (certificate as any).grade || 'Completed',
      score: (certificate as any).score || 100,
      achievements: (certificate as any).achievements || [],
      qrCode: certificate.qrCode,
      organizationName: CERTIFICATE_CONFIG.organizationName,
      organizationLogo: CERTIFICATE_CONFIG.organizationLogo,
      organizationWebsite: CERTIFICATE_CONFIG.organizationWebsite,
    }
    
    // Generate PDF
    const pdfBlob = await generateCertificatePDF(certificateData)
    
    // Convert blob to buffer
    const buffer = Buffer.from(await pdfBlob.arrayBuffer())
    
    // Return PDF with proper headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificate-${certificateId}.pdf"`,
        'Content-Length': buffer.length.toString(),
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