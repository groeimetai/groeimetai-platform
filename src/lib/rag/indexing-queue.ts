import Bull, { Job, Queue, JobOptions } from 'bull';
import Redis from 'ioredis';

export interface IndexingJobData {
  type: 'file' | 'course' | 'module' | 'lesson';
  action: 'index' | 'reindex' | 'delete';
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  filePath?: string;
  priority?: number;
  metadata?: Record<string, any>;
  retryAttempt?: number;
  timestamp?: Date;
}

export interface IndexingProgress {
  jobId: string;
  progress: number;
  stage: string;
  message?: string;
  timestamp: Date;
}

export interface QueueConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  defaultJobOptions?: JobOptions;
  maxConcurrency?: number;
  rateLimiter?: {
    max: number;
    duration: number;
  };
}

export class IndexingQueue {
  private queue: Queue<IndexingJobData>;
  private redis: Redis;
  private config: QueueConfig;
  private activeJobs: Map<string, Job<IndexingJobData>> = new Map();

  constructor(config: QueueConfig) {
    this.config = config;
    
    // Initialize Redis connection
    this.redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      maxRetriesPerRequest: 3
    });

    // Initialize Bull queue
    this.queue = new Bull<IndexingJobData>('course-indexing', {
      redis: {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password
      },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000
        },
        ...config.defaultJobOptions
      }
    });

    this.setupEventHandlers();
  }

  /**
   * Add a new indexing job to the queue
   */
  async addIndexingJob(data: IndexingJobData): Promise<Job<IndexingJobData>> {
    const jobData: IndexingJobData = {
      ...data,
      timestamp: data.timestamp || new Date(),
      retryAttempt: data.retryAttempt || 0
    };

    const jobOptions: JobOptions = {
      priority: data.priority || 0,
      delay: this.calculateDelay(data),
      attempts: data.type === 'course' ? 5 : 3
    };

    // Check for duplicate jobs
    const existingJob = await this.findExistingJob(data);
    if (existingJob && existingJob.opts.priority! < jobOptions.priority!) {
      // Remove lower priority duplicate
      await existingJob.remove();
    } else if (existingJob) {
      // Skip if existing job has higher priority
      console.log(`Skipping duplicate job for ${data.courseId}`);
      return existingJob;
    }

    const job = await this.queue.add(jobData, jobOptions);
    this.activeJobs.set(job.id.toString(), job);
    
    return job;
  }

  /**
   * Add multiple indexing jobs as a batch
   */
  async addBatch(jobs: IndexingJobData[]): Promise<Job<IndexingJobData>[]> {
    const bulkJobs = jobs.map(data => ({
      data: {
        ...data,
        timestamp: data.timestamp || new Date(),
        retryAttempt: data.retryAttempt || 0
      },
      opts: {
        priority: data.priority || 0,
        delay: this.calculateDelay(data),
        attempts: data.type === 'course' ? 5 : 3
      }
    }));

    const addedJobs = await this.queue.addBulk(bulkJobs);
    addedJobs.forEach(job => this.activeJobs.set(job.id.toString(), job));
    
    return addedJobs;
  }

  /**
   * Process indexing jobs
   */
  startProcessing(processor: (job: Job<IndexingJobData>) => Promise<any>): void {
    const concurrency = this.config.maxConcurrency || 3;
    
    this.queue.process(concurrency, async (job) => {
      try {
        console.log(`Processing job ${job.id}: ${job.data.type} for ${job.data.courseId}`);
        
        // Update progress
        await job.progress(10);
        
        const result = await processor(job);
        
        // Clean up
        this.activeJobs.delete(job.id.toString());
        
        return result;
      } catch (error) {
        console.error(`Job ${job.id} failed:`, error);
        
        // Check if should retry
        if (job.attemptsMade < job.opts.attempts!) {
          throw error; // Bull will retry
        } else {
          // Max retries reached, move to dead letter queue
          await this.moveToDeadLetter(job, error as Error);
          throw error;
        }
      }
    });
  }

  /**
   * Update job progress
   */
  async updateProgress(jobId: string, progress: number, stage: string, message?: string): Promise<void> {
    const job = this.activeJobs.get(jobId);
    if (!job) {
      console.warn(`Job ${jobId} not found in active jobs`);
      return;
    }

    await job.progress(progress);
    
    const progressData: IndexingProgress = {
      jobId,
      progress,
      stage,
      message,
      timestamp: new Date()
    };

    // Store progress in Redis for external monitoring
    await this.redis.setex(
      `indexing:progress:${jobId}`,
      300, // 5 minutes TTL
      JSON.stringify(progressData)
    );
  }

  /**
   * Get job progress
   */
  async getProgress(jobId: string): Promise<IndexingProgress | null> {
    const data = await this.redis.get(`indexing:progress:${jobId}`);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: boolean;
  }> {
    const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
      this.queue.getDelayedCount(),
      this.queue.isPaused()
    ]);

    return { waiting, active, completed, failed, delayed, paused };
  }

  /**
   * Pause/resume queue processing
   */
  async pause(): Promise<void> {
    await this.queue.pause();
  }

  async resume(): Promise<void> {
    await this.queue.resume();
  }

  /**
   * Clean completed jobs older than specified hours
   */
  async cleanOldJobs(hoursOld: number = 24): Promise<void> {
    const gracePeriod = hoursOld * 60 * 60 * 1000; // Convert to milliseconds
    const completedJobs = await this.queue.getCompleted();
    const failedJobs = await this.queue.getFailed();
    
    const jobsToRemove = [...completedJobs, ...failedJobs].filter(job => {
      const finishedOn = job.finishedOn || job.processedOn || 0;
      return Date.now() - finishedOn > gracePeriod;
    });

    await Promise.all(jobsToRemove.map(job => job.remove()));
    console.log(`Cleaned ${jobsToRemove.length} old jobs`);
  }

  /**
   * Setup event handlers for monitoring
   */
  private setupEventHandlers(): void {
    this.queue.on('completed', (job, result) => {
      console.log(`Job ${job.id} completed:`, result);
      this.activeJobs.delete(job.id.toString());
    });

    this.queue.on('failed', (job, err) => {
      console.error(`Job ${job.id} failed:`, err);
      this.activeJobs.delete(job.id.toString());
    });

    this.queue.on('stalled', (job) => {
      console.warn(`Job ${job.id} stalled and will be retried`);
    });

    this.queue.on('error', (error) => {
      console.error('Queue error:', error);
    });
  }

  /**
   * Calculate delay based on job type and current load
   */
  private calculateDelay(data: IndexingJobData): number {
    // Immediate for high priority or delete actions
    if (data.priority && data.priority > 10 || data.action === 'delete') {
      return 0;
    }

    // Delay course reindexing to avoid overload
    if (data.type === 'course' && data.action === 'reindex') {
      return 10000; // 10 seconds
    }

    // Default delay for regular indexing
    return 1000; // 1 second
  }

  /**
   * Find existing job with same parameters
   */
  private async findExistingJob(data: IndexingJobData): Promise<Job<IndexingJobData> | null> {
    const jobs = await this.queue.getJobs(['waiting', 'active', 'delayed']);
    
    return jobs.find(job => 
      job.data.courseId === data.courseId &&
      job.data.type === data.type &&
      job.data.action === data.action &&
      job.data.filePath === data.filePath
    ) || null;
  }

  /**
   * Move failed job to dead letter queue
   */
  private async moveToDeadLetter(job: Job<IndexingJobData>, error: Error): Promise<void> {
    const deadLetterData = {
      originalJob: job.toJSON(),
      error: error.message,
      stack: error.stack,
      failedAt: new Date()
    };

    await this.redis.lpush(
      'indexing:dead-letter',
      JSON.stringify(deadLetterData)
    );

    // Keep only last 1000 dead letter entries
    await this.redis.ltrim('indexing:dead-letter', 0, 999);
  }

  /**
   * Get dead letter queue items
   */
  async getDeadLetterJobs(limit: number = 10): Promise<any[]> {
    const items = await this.redis.lrange('indexing:dead-letter', 0, limit - 1);
    return items.map(item => JSON.parse(item));
  }

  /**
   * Retry a dead letter job
   */
  async retryDeadLetterJob(index: number): Promise<Job<IndexingJobData> | null> {
    const item = await this.redis.lindex('indexing:dead-letter', index);
    if (!item) {
      return null;
    }

    const deadLetterData = JSON.parse(item);
    const originalJobData = deadLetterData.originalJob.data;

    // Remove from dead letter queue
    await this.redis.lrem('indexing:dead-letter', 1, item);

    // Re-queue with increased retry attempt
    return this.addIndexingJob({
      ...originalJobData,
      retryAttempt: (originalJobData.retryAttempt || 0) + 1,
      priority: 15 // Higher priority for retry
    });
  }

  /**
   * Gracefully shutdown the queue
   */
  async shutdown(): Promise<void> {
    await this.queue.close();
    this.redis.disconnect();
  }
}