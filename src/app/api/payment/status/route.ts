/**
 * GroeimetAI Platform - Payment Status API Route
 * Checks the status of a payment
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPaymentStatus } from '@/services/paymentService';
import { adminAuth } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    // Get auth token from headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the user token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Get payment ID from query params
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // Get payment status
    const result = await getPaymentStatus(paymentId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        status: result.status,
        paymentId: result.paymentId
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: result.error 
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Payment status API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'server-error',
          message: 'Internal server error',
          userFriendlyMessage: 'Er is een serverfout opgetreden. Probeer het later opnieuw.'
        }
      },
      { status: 500 }
    );
  }
}