/**
 * GroeimetAI Platform - Mollie Webhook Handler
 * Processes payment status updates from Mollie
 */

import { NextRequest, NextResponse } from 'next/server';
import { createMollieClient } from '@mollie/api-client';
import { getAdminDb } from '@/lib/firebase-admin';
import { processCourseSaleServer } from '@/services/revenueService.server';
import { AffiliateService } from '@/services/affiliateService';
import { Payment } from '@/types';
import { referralService } from '@/services/referralService';

// Initialize Mollie client (server-side only)
const mollieClient = createMollieClient({
  apiKey: process.env.MOLLIE_API_KEY!,
});

// Verify webhook signature (optional but recommended for production)
function verifyWebhookSignature(request: NextRequest): boolean {
  // In production, you should verify the webhook signature
  // For now, we'll check if the request comes from Mollie's IP range
  // This is a simplified version - implement proper signature verification
  const mollieIpRanges = [
    '34.91.0.0/16',
    '35.204.0.0/16'
  ];
  
  // For development, always return true
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }
  
  // In production, implement proper verification
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook authenticity
    if (!verifyWebhookSignature(request)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    // Parse webhook payload (Mollie sends form-encoded data)
    const formData = await request.formData();
    const paymentId = formData.get('id') as string;
    
    // Validate webhook payload
    if (!paymentId) {
      return NextResponse.json(
        { error: 'Invalid webhook payload - missing payment ID' },
        { status: 400 }
      );
    }

    console.log('Webhook received for payment:', paymentId);

    // Process the webhook directly (server-side only)
    await processPaymentWebhook(paymentId);

    // Return success response
    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Return error response
    // Important: Mollie will retry the webhook if we return an error
    return NextResponse.json(
      { 
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Process payment webhook (server-side only)
 */
async function processPaymentWebhook(molliePaymentId: string): Promise<void> {
  try {
    console.log('Processing payment webhook for:', molliePaymentId);

    // Get payment from Mollie
    const molliePayment = await mollieClient.payments.get(molliePaymentId);
    
    // Find corresponding payment document
    const paymentsQuery = await getAdminDb()
      .collection('payments')
      .where('molliePaymentId', '==', molliePaymentId)
      .limit(1)
      .get();

    if (paymentsQuery.empty) {
      console.error('Payment document not found for Mollie payment:', molliePaymentId);
      return;
    }

    const paymentDoc = paymentsQuery.docs[0];
    const paymentData = paymentDoc.data();
    const paymentId = paymentDoc.id;

    // Only process if status has changed
    if (molliePayment.status === paymentData.status) {
      return;
    }

    // Update payment status
    await paymentDoc.ref.update({
      status: molliePayment.status,
      updatedAt: new Date(),
      ...(molliePayment.status === 'paid' && {
        completedAt: new Date(),
        molliePaymentDetails: {
          paidAt: molliePayment.paidAt,
          method: molliePayment.method,
        },
      }),
    });

    // Handle payment success
    if (molliePayment.status === 'paid') {
      const { userId, courseId } = paymentData;
      const enrollmentId = `${userId}_${courseId}`;

      // Create enrollment
      await getAdminDb().collection('enrollments').doc(enrollmentId).set({
        id: enrollmentId,
        userId,
        courseId,
        paymentId,
        paymentStatus: 'paid',
        paymentMethod: molliePayment.method,
        amountPaid: parseFloat(molliePayment.amount.value),
        currency: molliePayment.amount.currency,
        enrolledAt: new Date(),
        status: 'active',
        progress: {
          completedLessons: [],
          completedModules: [],
          overallProgress: 0,
          totalTimeSpent: 0,
          lastAccessedAt: new Date(),
          streakDays: 0,
          bookmarks: [],
          notes: [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log('Payment successful, enrollment created:', enrollmentId);

      // Distribute revenue after successful payment
      try {
        // Extract affiliate code from payment metadata if present
        const affiliateCode = paymentData.metadata?.affiliateCode || molliePayment.metadata?.affiliateCode;
        
        // Create payment object for revenue distribution
        const payment: Payment = {
          id: paymentId,
          userId,
          courseId,
          amount: parseFloat(molliePayment.amount.value),
          currency: molliePayment.amount.currency,
          status: 'completed',
          paymentMethod: molliePayment.method || 'unknown',
          molliePaymentId,
          createdAt: paymentData.createdAt?.toDate() || new Date(),
          updatedAt: new Date()
        };

        // Process revenue distribution
        await processCourseSaleServer(
          courseId,
          payment.amount,
          paymentId,
          userId,
          affiliateCode
        );

        console.log('Revenue distributed for payment:', paymentId);

        // Process affiliate conversion if affiliate code is present
        if (affiliateCode) {
          // TODO: Implement server-side affiliate processing
          console.log('Affiliate conversion skipped (needs server-side implementation):', affiliateCode);
        }

        // Check if this is the user's first purchase for referral rewards
        try {
          // Check if user has any other completed payments
          const previousPayments = await getAdminDb()
            .collection('payments')
            .where('userId', '==', userId)
            .where('status', '==', 'paid')
            .where('molliePaymentId', '!=', molliePaymentId)
            .limit(1)
            .get();

          // If no previous successful payments, process referral reward
          if (previousPayments.empty) {
            console.log('Processing first purchase for referral reward:', userId);
            await referralService.trackFirstPurchase(userId, payment.amount);
          }
        } catch (referralError) {
          // Log error but don't fail the webhook
          console.error('Error processing referral reward:', referralError);
        }
      } catch (revenueError) {
        // Log error but don't fail the webhook
        console.error('Error distributing revenue:', revenueError);
        // Could implement a retry mechanism or queue this for later processing
      }
    }

    // Handle payment failure or cancellation
    if (molliePayment.status === 'failed' || molliePayment.status === 'canceled') {
      // Update enrollment status if it exists
      const enrollmentId = `${paymentData.userId}_${paymentData.courseId}`;
      const enrollmentRef = getAdminDb().collection('enrollments').doc(enrollmentId);
      const enrollment = await enrollmentRef.get();
      
      if (enrollment.exists && enrollment.data()?.paymentId === paymentId) {
        await enrollmentRef.update({
          status: 'cancelled',
          paymentStatus: molliePayment.status,
          updatedAt: new Date()
        });
      }
    }

  } catch (error) {
    console.error('Error processing payment webhook:', error);
    throw error;
  }
}

// Handle GET requests (for webhook verification)
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      status: 'active',
      endpoint: 'mollie-webhook',
      version: '1.0.0'
    },
    { status: 200 }
  );
}