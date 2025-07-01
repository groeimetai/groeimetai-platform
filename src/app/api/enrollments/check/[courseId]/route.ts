import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';



export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
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

    const { courseId } = params;

    // Check enrollment
    const enrollmentId = `${userId}_${courseId}`;
    const enrollmentDoc = await adminDb.collection('enrollments').doc(enrollmentId).get();
    
    const enrolled = enrollmentDoc.exists && enrollmentDoc.data()?.status === 'active';

    return NextResponse.json({
      enrolled,
      courseId,
      userId,
    });

  } catch (error) {
    console.error('Enrollment check error:', error);
    return NextResponse.json(
      { error: 'Failed to check enrollment' },
      { status: 500 }
    );
  }
}
