import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get all enrollments for user
    const enrollmentsQuery = await adminDb
      .collection('enrollments')
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .get();

    const courseIds = enrollmentsQuery.docs.map(doc => doc.data().courseId);

    return NextResponse.json({
      courseIds,
      count: courseIds.length,
    });

  } catch (error) {
    console.error('Enrollments list error:', error);
    return NextResponse.json(
      { error: 'Failed to get enrollments' },
      { status: 500 }
    );
  }
}
