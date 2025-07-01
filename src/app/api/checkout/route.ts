import { NextRequest, NextResponse } from 'next/server';
import { createMollieClient } from '@mollie/api-client';
import { getCourseById } from '@/lib/data/courses';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

// Initialize Mollie client (server-side only)
const mollieClient = createMollieClient({
  apiKey: process.env.MOLLIE_API_KEY!,
});

interface CheckoutRequest {
  courseId: string;
  billingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
    street: string;
    streetAdditional?: string;
    city: string;
    postalCode: string;
    country: string;
    region?: string;
    vatNumber?: string;
    phone?: string;
  };
  discountCode?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Checkout API called');
    
    // Check if Firebase is initialized
    if (!adminAuth || !adminDb) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }
    
    // Get and verify the auth token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ No auth header provided');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;
    
    console.log('✅ User authenticated:', userId);

    // Parse request body
    const body: CheckoutRequest = await request.json();
    console.log('📝 Request body:', { courseId: body.courseId, hasAddress: !!body.billingAddress });
    
    // Validate required fields
    if (!body.courseId || !body.billingAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get course data
    const course = getCourseById(body.courseId);
    if (!course) {
      console.log('❌ Course not found:', body.courseId);
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    
    console.log('📚 Course found:', { id: course.id, title: course.title, price: course.price });

    // Check if user is already enrolled
    const enrollmentId = `${userId}_${body.courseId}`;
    const enrollmentDoc = await adminDb.collection('enrollments').doc(enrollmentId).get();
    
    if (enrollmentDoc.exists && enrollmentDoc.data()?.status === 'active') {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 400 }
      );
    }

    // Calculate final price (with discount if applicable)
    // Note: Course prices are stored as euros (e.g., 199.00)
    // Mollie expects cents, so we need to multiply by 100
    const priceInCents = Math.round(course.price * 100);
    let finalPriceInCents = priceInCents;
    const discountAmount = 0; // Implement discount logic if needed

    // Get affiliate data from cookies
    const affiliateCode = request.cookies.get('affiliate_code')?.value;
    const affiliateCourse = request.cookies.get('affiliate_course')?.value;

    // Create payment document
    const paymentRef = adminDb.collection('payments').doc();
    const paymentData = {
      id: paymentRef.id,
      userId,
      courseId: body.courseId,
      amount: finalPriceInCents, // Store in cents
      originalAmount: priceInCents,
      currency: course.currency || 'EUR',
      status: 'pending',
      description: `Cursus: ${course.title}`,
      billingAddress: body.billingAddress,
      discountCode: body.discountCode || null,
      discountAmount,
      // Store affiliate data if present
      ...(affiliateCode && {
        metadata: {
          affiliateCode,
          ...(affiliateCourse && { affiliateCourse })
        }
      }),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await paymentRef.set(paymentData);

    console.log('💰 Price calculation:', {
      coursePrice: course.price,
      priceInCents,
      mollieValue: (finalPriceInCents / 100).toFixed(2)
    });

    // Create Mollie payment
    const molliePaymentData: any = {
      amount: {
        currency: course.currency || 'EUR',
        value: (finalPriceInCents / 100).toFixed(2), // Convert cents back to decimal for Mollie
      },
      description: `Cursus: ${course.title}`,
      // Use API redirect as workaround for Next.js routing issues
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/redirect?paymentId=${paymentRef.id}`,
      metadata: {
        paymentDocId: paymentRef.id,
        userId,
        courseId: body.courseId,
      },
      locale: body.billingAddress.country === 'NL' ? 'nl_NL' : 'en_US',
    };

    // Add webhook URL only if not localhost
    const isLocalhost = process.env.NEXT_PUBLIC_APP_URL?.includes('localhost');
    if (!isLocalhost) {
      molliePaymentData.webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mollie`;
    } else {
      console.log('⚠️ Webhook disabled for localhost development');
      console.log('💡 Payment status will be checked when user returns');
      console.log('📌 Use ngrok for real-time webhook testing');
    }

    const molliePayment = await mollieClient.payments.create(molliePaymentData);

    console.log('📝 Mollie payment created:', {
      id: molliePayment.id,
      status: molliePayment.status,
      checkoutUrl: molliePayment._links?.checkout?.href,
      hasCheckout: !!molliePayment._links?.checkout,
      links: Object.keys(molliePayment._links || {})
    });

    // Update payment document with Mollie ID
    await paymentRef.update({
      molliePaymentId: molliePayment.id,
      mollieCheckoutUrl: molliePayment._links.checkout?.href,
      updatedAt: new Date(),
    });

    console.log('✅ Payment created successfully:', {
      paymentId: paymentRef.id,
      molliePaymentId: molliePayment.id,
      courseId: body.courseId,
      userId,
      checkoutUrl: molliePayment._links.checkout?.href
    });

    // Check if we have a checkout URL
    const checkoutUrl = molliePayment._links?.checkout?.href;
    
    if (!checkoutUrl) {
      console.error('⚠️ No checkout URL received from Mollie');
      console.error('Mollie response:', JSON.stringify(molliePayment, null, 2));
      
      // For development, provide a fallback URL
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          success: true,
          paymentId: paymentRef.id,
          checkoutUrl: null,
          message: 'Development mode: No checkout URL available. Check Mollie API key.',
          molliePaymentId: molliePayment.id,
          fallbackUrl: `/payment/complete?paymentId=${paymentRef.id}&status=pending`
        });
      }
    }

    return NextResponse.json({
      success: true,
      paymentId: paymentRef.id,
      checkoutUrl: checkoutUrl,
    });

  } catch (error) {
    console.error('❌ Checkout error:', error);
    
    // Return specific error messages for debugging
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Payment creation failed',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Payment creation failed' },
      { status: 500 }
    );
  }
}