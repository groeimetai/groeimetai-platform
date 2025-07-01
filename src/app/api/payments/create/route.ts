import { NextRequest, NextResponse } from 'next/server';
import { createMollieClient } from '@mollie/api-client';
import { auth, firestore } from 'firebase-admin';

const authClient: auth.Auth = auth();
const db: firestore.Firestore = firestore();

// Initialize Mollie client (server-side only)
const mollieClient = createMollieClient({
  apiKey: process.env.MOLLIE_API_KEY!,
});

interface PaymentRequest {
  courseId: string;
  amount: number;
  currency: 'EUR' | 'USD' | 'GBP';
  description: string;
  billingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  discountCode?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get and verify the auth token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await authClient.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Parse request body
    const body: PaymentRequest = await request.json();
    
    // Validate required fields
    if (!body.courseId || !body.amount || !body.currency || !body.billingAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user is already enrolled
    const enrollmentId = `${userId}_${body.courseId}`;
    const enrollmentDoc = await db.collection('enrollments').doc(enrollmentId).get();
    
    if (enrollmentDoc.exists && enrollmentDoc.data()?.status === 'active') {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 400 }
      );
    }

    // Create payment document
    const paymentRef = db.collection('payments').doc();
    const paymentData = {
      id: paymentRef.id,
      userId,
      courseId: body.courseId,
      amount: body.amount,
      currency: body.currency,
      status: 'pending',
      description: body.description,
      billingAddress: body.billingAddress,
      discountCode: body.discountCode || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await paymentRef.set(paymentData);

    // Create Mollie payment
    const molliePayment = await mollieClient.payments.create({
      amount: {
        currency: body.currency,
        value: (body.amount / 100).toFixed(2), // Convert cents to decimal
      },
      description: body.description,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/complete?paymentId=${paymentRef.id}`,
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mollie`,
      metadata: {
        paymentDocId: paymentRef.id,
        userId,
        courseId: body.courseId,
      },
      locale: body.billingAddress.country === 'NL' ? 'nl_NL' as any : 'en_US' as any,
    });

    // Update payment document with Mollie ID
    await paymentRef.update({
      molliePaymentId: molliePayment.id,
      mollieCheckoutUrl: molliePayment._links.checkout?.href,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      paymentId: paymentRef.id,
      checkoutUrl: molliePayment._links.checkout?.href,
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Payment creation failed' },
      { status: 500 }
    );
  }
}
