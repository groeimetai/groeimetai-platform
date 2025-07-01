import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Testing PDF generation...')
    
    // Test data with all required fields
    const testData = {
      id: 'test-123',
      studentName: 'Test Student',
      courseName: 'Test Course',
      instructorName: 'Test Instructor',
      completionDate: new Date(),
      certificateNumber: 'CERT-TEST-123',
      grade: 'A',
      score: 95,
      achievements: ['Test Achievement'],
      qrCode: '',
      organizationName: 'GroeiMetAI Academy',
      organizationLogo: '/images/logo/GroeimetAi_logo_image_black.png',
      organizationWebsite: 'https://groeimetai.com',
    }
    
    // Try to generate PDF
    try {
      const { generateCertificatePDFSafe } = await import('@/services/certificatePDFGeneratorWrapper')
      const pdfBlob = await generateCertificatePDFSafe(testData)
      
      const buffer = Buffer.from(await pdfBlob.arrayBuffer())
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': pdfBlob.type,
          'Content-Disposition': 'attachment; filename="test-certificate.pdf"',
        },
      })
    } catch (pdfError) {
      console.error('PDF generation failed:', pdfError)
      
      // Return error details
      return NextResponse.json({
        error: 'PDF generation failed',
        details: pdfError instanceof Error ? pdfError.message : 'Unknown error',
        stack: pdfError instanceof Error ? pdfError.stack : undefined
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}