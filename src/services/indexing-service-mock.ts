// Mock implementation of indexing service to avoid build issues
export interface IndexingServiceConfig {
  contentPath: string;
  redisConfig: any;
  openAIApiKey: string;
  chunkSize?: number;
  chunkOverlap?: number;
  maxConcurrency?: number;
  enableFileWatcher?: boolean;
}

export class CourseIndexingService {
  private config: IndexingServiceConfig;
  private isRunning: boolean = false;

  constructor(config: IndexingServiceConfig) {
    this.config = config;
  }

  async start() {
    this.isRunning = true;
    console.log('Mock indexing service started');
  }

  async stop() {
    this.isRunning = false;
    console.log('Mock indexing service stopped');
  }

  async getStatus() {
    return {
      isRunning: this.isRunning,
      processedFiles: 0,
      pendingJobs: 0,
      lastProcessed: null
    };
  }

  async reindexCourse(courseId: string) {
    console.log(`Mock reindexing course: ${courseId}`);
    return `job-${Date.now()}`;
  }
}

let serviceInstance: CourseIndexingService | null = null;

export function getIndexingService(config: IndexingServiceConfig): CourseIndexingService {
  if (!serviceInstance) {
    serviceInstance = new CourseIndexingService(config);
  }
  return serviceInstance;
}