import { NextRequest, NextResponse } from 'next/server'
import { AffiliateService } from '@/services/affiliateService'

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params
    const searchParams = request.nextUrl.searchParams
    const courseId = searchParams.get('course')

    // Track the click
    try {
      await AffiliateService.trackAffiliateClick(code)
    } catch (error) {
      console.error('Error tracking affiliate click:', error)
      // Continue with redirect even if tracking fails
    }

    // Set affiliate cookie (30 days)
    const response = NextResponse.redirect(
      new URL(courseId ? `/cursussen/${courseId}` : '/cursussen', request.url)
    )
    
    response.cookies.set('affiliate_code', code, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })

    if (courseId) {
      response.cookies.set('affiliate_course', courseId, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      })
    }

    return response
  } catch (error) {
    console.error('Error processing affiliate link:', error)
    // Redirect to courses page even if there's an error
    return NextResponse.redirect(new URL('/cursussen', request.url))
  }
}