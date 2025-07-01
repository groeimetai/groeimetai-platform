import { NextRequest, NextResponse } from 'next/server'
import { CertificateService } from '@/services/certificateService'

/**
 * GET /api/certificate/verify/[certificateId]
 * Verify certificate by ID or QR code
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { certificateId: string } }
) {
  try {
    const certificateId = params.certificateId
    const qrCode = request.nextUrl.searchParams.get('qr')
    const verificationCode = request.nextUrl.searchParams.get('code')

    // Verify certificate
    const result = await CertificateService.verifyCertificate({
      certificateId: !qrCode && !verificationCode ? certificateId : undefined,
      qrCode: qrCode || undefined,
      verificationCode: verificationCode || undefined,
    })

    if (!result.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      certificate: {
        id: result.certificate!.id,
        studentName: result.certificate!.studentName,
        courseName: result.certificate!.courseName,
        completionDate: result.certificate!.completionDate,
        grade: result.certificate!.grade,
        score: result.certificate!.score,
        certificateNumber: result.certificate!.certificateNumber,
        achievements: result.certificate!.achievements,
        instructorName: result.certificate!.instructorName,
        isValid: result.certificate!.isValid,
      },
      verificationDetails: result.verificationDetails,
      message: result.message,
    })
  } catch (error) {
    console.error('Certificate verification error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to verify certificate',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/certificate/verify/[certificateId]
 * Verify certificate by QR code data
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { certificateId: string } }
) {
  try {
    const body = await request.json()
    const { qrCodeData } = body

    if (!qrCodeData) {
      return NextResponse.json(
        {
          success: false,
          message: 'QR code data is required',
        },
        { status: 400 }
      )
    }

    // Verify certificate using QR code data
    const result = await CertificateService.verifyCertificate({
      qrCode: qrCodeData,
    })

    if (!result.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      certificate: {
        id: result.certificate!.id,
        studentName: result.certificate!.studentName,
        courseName: result.certificate!.courseName,
        completionDate: result.certificate!.completionDate,
        grade: result.certificate!.grade,
        score: result.certificate!.score,
        certificateNumber: result.certificate!.certificateNumber,
        achievements: result.certificate!.achievements,
        instructorName: result.certificate!.instructorName,
        isValid: result.certificate!.isValid,
      },
      verificationDetails: result.verificationDetails,
      message: result.message,
    })
  } catch (error) {
    console.error('Certificate verification error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to verify certificate',
      },
      { status: 500 }
    )
  }
}