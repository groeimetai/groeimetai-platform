import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    // Get and verify the auth token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAdminAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Parse request body
    const body = await request.json();
    const { courseId } = body;

    // Create a mock payment
    const paymentRef = getAdminDb().collection('payments').doc();
    await paymentRef.set({
      id: paymentRef.id,
      userId,
      courseId,
      amount: 0, // Mock payment
      currency: 'EUR',
      status: 'paid', // Auto-approve for testing
      description: 'Mock Payment - Development Mode',
      molliePaymentId: `mock_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create enrollment immediately
    const enrollmentId = `${userId}_${courseId}`;
    await getAdminDb().collection('enrollments').doc(enrollmentId).set({
      userId,
      courseId,
      status: 'active',
      paymentId: paymentRef.id,
      enrolledAt: new Date(),
      progress: {
        completed: false,
        completedLessons: [],
        currentLesson: null,
        lastAccessedAt: new Date()
      }
    });

    // Return success with direct redirect to course
    return NextResponse.json({
      success: true,
      paymentId: paymentRef.id,
      redirectUrl: `/cursussen/${courseId}`,
      message: 'Mock payment completed - Direct access granted'
    });

  } catch (error) {
    console.error('Mock checkout error:', error);
    return NextResponse.json(
      { error: 'Mock payment failed' },
      { status: 500 }
    );
  }
}