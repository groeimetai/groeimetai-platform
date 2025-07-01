import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

import { createMollieClient } from '@mollie/api-client';

const mollieClient = createMollieClient({
  apiKey: process.env.MOLLIE_API_KEY!,
});

export async function GET(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    // Get and verify the auth token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { paymentId } = params;

    // Get payment document
    const paymentDoc = await adminDb.collection('payments').doc(paymentId).get();
    
    if (!paymentDoc.exists) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const paymentData = paymentDoc.data();
    
    // Verify the payment belongs to the authenticated user
    if (paymentData?.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // For localhost development: Check Mollie status directly
    const isLocalhost = process.env.NEXT_PUBLIC_APP_URL?.includes('localhost');
    if (isLocalhost && paymentData?.molliePaymentId && paymentData.status === 'pending') {
      console.log('🔄 Checking payment status with Mollie for localhost...');
      
      try {
        const molliePayment = await mollieClient.payments.get(paymentData.molliePaymentId);
        
        // Update local status if changed
        if (molliePayment.status !== paymentData.status) {
          await adminDb.collection('payments').doc(paymentId).update({
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

          // If paid, create enrollment
          if (molliePayment.status === 'paid') {
            const enrollmentId = `${userId}_${paymentData.courseId}`;
            await adminDb.collection('enrollments').doc(enrollmentId).set({
              id: enrollmentId,
              userId,
              courseId: paymentData.courseId,
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
            console.log('✅ Enrollment created for localhost payment');
          }

          paymentData.status = molliePayment.status;
        }
      } catch (mollieError) {
        console.error('Mollie status check error:', mollieError);
      }
    }

    return NextResponse.json({
      success: true,
      paymentId,
      status: paymentData.status,
      amount: paymentData.amount,
      currency: paymentData.currency,
      courseId: paymentData.courseId,
      createdAt: paymentData.createdAt,
      completedAt: paymentData.completedAt || null,
      checkoutUrl: paymentData.mollieCheckoutUrl || null,
    });

  } catch (error) {
    console.error('Payment status error:', error);
    return NextResponse.json(
      { error: 'Failed to get payment status' },
      { status: 500 }
    );
  }
}
