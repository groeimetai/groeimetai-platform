import { NextRequest, NextResponse } from 'next/server';
import type { CourseIndexingService } from '@/services/indexing-service-mock';

let indexingService: CourseIndexingService | null = null;

// Use mock service temporarily to avoid build issues
async function getIndexingServiceInstance() {
  if (!indexingService) {
    // TODO: Switch back to real indexing service when build issues are resolved
    const { getIndexingService } = await import('@/services/indexing-service-mock');
    indexingService = getIndexingService({
      contentPath: process.env.COURSE_CONTENT_PATH || './src/lib/data/course-content',
      redisConfig: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD
      },
      openAIApiKey: process.env.OPENAI_API_KEY || 'mock-api-key',
      enableFileWatcher: false // Disabled in mock
    });
    
    // Start the service
    if (process.env.NODE_ENV === 'production') {
      indexingService.start().catch(console.error);
    }
  }
  return indexingService;
}

export async function GET(request: NextRequest) {
  try {
    const service = await getIndexingServiceInstance();
    const status = await service.getStatus();
    
    return NextResponse.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Failed to get indexing status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get indexing status' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, courseId } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'reindex':
        if (!courseId) {
          return NextResponse.json(
            { success: false, error: 'Course ID is required for reindex' },
            { status: 400 }
          );
        }
        
        const service = await getIndexingServiceInstance();
        const jobId = await service.reindexCourse(courseId);
        
        return NextResponse.json({
          success: true,
          jobId,
          message: `Course ${courseId} queued for reindexing`
        });

      case 'start':
        const startService = await getIndexingServiceInstance();
        await startService.start();
        return NextResponse.json({
          success: true,
          message: 'Indexing service started'
        });

      case 'stop':
        const stopService = await getIndexingServiceInstance();
        await stopService.stop();
        return NextResponse.json({
          success: true,
          message: 'Indexing service stopped'
        });

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Indexing API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}