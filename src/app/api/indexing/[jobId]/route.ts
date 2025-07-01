import { NextRequest, NextResponse } from 'next/server';
import { IndexingQueue } from '@/lib/rag/indexing-queue';

// Initialize queue connection for progress monitoring
const indexingQueue = new IndexingQueue({
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  }
});

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;
    
    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Get job progress
    const progress = await indexingQueue.getProgress(jobId);
    
    if (!progress) {
      return NextResponse.json(
        { success: false, error: 'Job not found or no progress data available' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Failed to get job progress:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get job progress' 
      },
      { status: 500 }
    );
  }
}