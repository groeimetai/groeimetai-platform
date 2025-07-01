import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const paymentId = searchParams.get('paymentId');
  
  if (!paymentId) {
    return NextResponse.redirect(new URL('/cursussen', request.url));
  }
  
  // In development, force HTTP redirect to avoid HTTPS issues
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3001'
    : process.env.NEXT_PUBLIC_APP_URL || request.url;
  
  // Redirect to the payment complete page
  return NextResponse.redirect(new URL(`/payment/complete?paymentId=${paymentId}`, baseUrl));
}