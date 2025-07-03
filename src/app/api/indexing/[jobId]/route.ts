import { NextRequest, NextResponse } from 'next/server';
import { IndexingQueue } from '@/lib/rag/indexing-queue';

// Lazy initialize queue connection for progress monitoring
let indexingQueue: IndexingQueue | null = null;

function getIndexingQueue(): IndexingQueue {
  if (!indexingQueue) {
    indexingQueue = new IndexingQueue({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD
      }
    });
  }
  return indexingQueue;
}

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
    let progress;
    try {
      progress = await getIndexingQueue().getProgress(jobId);
    } catch (error) {
      console.error('Failed to connect to indexing queue:', error);
      return NextResponse.json(
        { success: false, error: 'Indexing service temporarily unavailable' },
        { status: 503 }
      );
    }
    
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