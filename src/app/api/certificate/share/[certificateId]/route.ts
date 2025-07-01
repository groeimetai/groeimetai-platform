import { NextRequest, NextResponse } from 'next/server'
import { CertificateService } from '@/services/certificateService'

/**
 * GET /api/certificate/share/[certificateId]
 * Get certificate sharing metadata for social media
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { certificateId: string } }
) {
  try {
    const certificateId = params.certificateId

    // Get certificate data
    const certificate = await CertificateService.getCertificateById(certificateId)
    if (!certificate) {
      return NextResponse.json(
        {
          success: false,
          message: 'Certificate not found',
        },
        { status: 404 }
      )
    }

    // Generate LinkedIn share data
    const shareData = await CertificateService.generateLinkedInShareData(certificateId)

    return NextResponse.json({
      success: true,
      certificate: {
        id: certificate.id,
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        completionDate: certificate.completionDate,
        certificateUrl: certificate.certificateUrl,
      },
      shareData,
      linkedinUrl: shareData.shareUrl,
    })
  } catch (error) {
    console.error('Certificate share error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to generate share data',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/certificate/share/[certificateId]
 * Track certificate share event
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { certificateId: string } }
) {
  try {
    const certificateId = params.certificateId
    const body = await request.json()
    const { platform = 'linkedin', userId } = body

    // Log share event
    await CertificateService['logCertificateEvent']('certificate_shared', {
      certificateId,
      platform,
      userId,
      timestamp: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: 'Share event tracked successfully',
    })
  } catch (error) {
    console.error('Track share event error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to track share event',
      },
      { status: 500 }
    )
  }
}