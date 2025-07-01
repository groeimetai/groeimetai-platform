import { CourseFileWatcher, createCourseFileWatcher } from '@/lib/rag/file-watcher';
import { IndexingQueue, IndexingJobData, QueueConfig } from '@/lib/rag/indexing-queue';
import { Job } from 'bull';
import * as path from 'path';
import * as fs from 'fs/promises';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from '@langchain/openai';
import { db } from '@/lib/firebase-admin';

export interface IndexingServiceConfig {
  contentPath: string;
  redisConfig: QueueConfig['redis'];
  openAIApiKey: string;
  chunkSize?: number;
  chunkOverlap?: number;
  maxConcurrency?: number;
  enableFileWatcher?: boolean;
}

export interface IndexingResult {
  success: boolean;
  documentsIndexed?: number;
  error?: string;
  duration?: number;
}

export class CourseIndexingService {
  private fileWatcher: CourseFileWatcher | null = null;
  private indexingQueue: IndexingQueue;
  private embeddings: OpenAIEmbeddings;
  private textSplitter: RecursiveCharacterTextSplitter;
  private config: IndexingServiceConfig;
  private isRunning: boolean = false;

  constructor(config: IndexingServiceConfig) {
    this.config = config;
    
    // Initialize queue
    this.indexingQueue = new IndexingQueue({
      redis: config.redisConfig,
      maxConcurrency: config.maxConcurrency || 3,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50
      }
    });

    // Initialize embeddings
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: config.openAIApiKey,
      modelName: 'text-embedding-3-small'
    });

    // Initialize text splitter
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: config.chunkSize || 1000,
      chunkOverlap: config.chunkOverlap || 200,
      separators: ['\n\n', '\n', '. ', ' ', '']
    });
  }

  /**
   * Start the indexing service
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('Indexing service is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting Course Indexing Service...');

    // Start queue processing
    this.indexingQueue.startProcessing(this.processIndexingJob.bind(this));

    // Start file watcher if enabled
    if (this.config.enableFileWatcher) {
      this.fileWatcher = createCourseFileWatcher(
        this.config.contentPath,
        this.indexingQueue,
        {
          debounceMs: 5000,
          ignored: ['**/*.test.ts', '**/*.spec.ts', '**/node_modules/**']
        }
      );

      await this.fileWatcher.start();
    }

    // Start periodic cleanup
    this.startPeriodicCleanup();

    console.log('Course Indexing Service started successfully');
  }

  /**
   * Stop the indexing service
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    console.log('Stopping Course Indexing Service...');
    this.isRunning = false;

    // Stop file watcher
    if (this.fileWatcher) {
      await this.fileWatcher.stop();
      this.fileWatcher = null;
    }

    // Pause queue processing
    await this.indexingQueue.pause();

    console.log('Course Indexing Service stopped');
  }

  /**
   * Process an indexing job
   */
  private async processIndexingJob(job: Job<IndexingJobData>): Promise<IndexingResult> {
    const startTime = Date.now();
    const { data } = job;

    try {
      await this.indexingQueue.updateProgress(job.id.toString(), 10, 'Starting indexing');

      let result: IndexingResult;

      switch (data.action) {
        case 'index':
        case 'reindex':
          result = await this.indexContent(job);
          break;
        case 'delete':
          result = await this.deleteContent(job);
          break;
        default:
          throw new Error(`Unknown action: ${data.action}`);
      }

      result.duration = Date.now() - startTime;
      await this.indexingQueue.updateProgress(job.id.toString(), 100, 'Completed');
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Job ${job.id} failed:`, errorMessage);
      
      await this.indexingQueue.updateProgress(
        job.id.toString(), 
        0, 
        'Failed', 
        errorMessage
      );

      return {
        success: false,
        error: errorMessage,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Index content based on job type
   */
  private async indexContent(job: Job<IndexingJobData>): Promise<IndexingResult> {
    const { data } = job;

    switch (data.type) {
      case 'file':
        return this.indexFile(job);
      case 'lesson':
        return this.indexLesson(job);
      case 'module':
        return this.indexModule(job);
      case 'course':
        return this.indexCourse(job);
      default:
        throw new Error(`Unknown indexing type: ${data.type}`);
    }
  }

  /**
   * Index a single file
   */
  private async indexFile(job: Job<IndexingJobData>): Promise<IndexingResult> {
    const { filePath, courseId, moduleId, lessonId } = job.data;
    
    if (!filePath) {
      throw new Error('File path is required for file indexing');
    }

    await this.indexingQueue.updateProgress(job.id.toString(), 20, 'Reading file');

    // Read file content
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Extract lesson data if it's a lesson file
    let lessonData: any = null;
    if (lessonId && filePath.endsWith('.ts')) {
      try {
        // Dynamic import for TypeScript files
        const module = await import(filePath);
        lessonData = module.default || module.lesson;
      } catch (error) {
        console.warn('Could not import lesson file:', error);
      }
    }

    await this.indexingQueue.updateProgress(job.id.toString(), 40, 'Splitting text');

    // Split content into chunks
    const chunks = await this.textSplitter.splitText(
      lessonData ? this.extractTextFromLesson(lessonData) : content
    );

    await this.indexingQueue.updateProgress(job.id.toString(), 60, 'Generating embeddings');

    // Generate embeddings
    const embeddings = await this.embeddings.embedDocuments(chunks);

    await this.indexingQueue.updateProgress(job.id.toString(), 80, 'Storing vectors');

    // Store in Firestore
    const batch = db.batch();
    const vectorsRef = db.collection('course_vectors');

    chunks.forEach((chunk, index) => {
      const docRef = vectorsRef.doc();
      batch.set(docRef, {
        courseId,
        moduleId,
        lessonId,
        filePath,
        content: chunk,
        embedding: embeddings[index],
        metadata: {
          chunkIndex: index,
          totalChunks: chunks.length,
          ...(lessonData && {
            title: lessonData.title,
            type: lessonData.type,
            duration: lessonData.duration
          })
        },
        indexedAt: new Date(),
        version: 1
      });
    });

    await batch.commit();

    return {
      success: true,
      documentsIndexed: chunks.length
    };
  }

  /**
   * Index an entire lesson
   */
  private async indexLesson(job: Job<IndexingJobData>): Promise<IndexingResult> {
    const { courseId, moduleId, lessonId } = job.data;
    
    const lessonPath = path.join(
      this.config.contentPath,
      courseId,
      moduleId || '',
      `lesson-${lessonId}.ts`
    );

    job.data.filePath = lessonPath;
    return this.indexFile(job);
  }

  /**
   * Index an entire module
   */
  private async indexModule(job: Job<IndexingJobData>): Promise<IndexingResult> {
    const { courseId, moduleId } = job.data;
    
    if (!moduleId) {
      throw new Error('Module ID is required for module indexing');
    }

    const modulePath = path.join(this.config.contentPath, courseId, moduleId);
    const files = await fs.readdir(modulePath);
    
    const lessonFiles = files.filter(f => f.match(/lesson-\d+-\d+\.ts$/));
    let totalIndexed = 0;

    for (let i = 0; i < lessonFiles.length; i++) {
      const progress = 20 + (60 * i / lessonFiles.length);
      await this.indexingQueue.updateProgress(
        job.id.toString(), 
        progress, 
        `Indexing lesson ${i + 1} of ${lessonFiles.length}`
      );

      const filePath = path.join(modulePath, lessonFiles[i]);
      const lessonJob = { ...job, data: { ...job.data, filePath, type: 'file' as const } };
      const result = await this.indexFile(lessonJob);
      
      if (result.success && result.documentsIndexed) {
        totalIndexed += result.documentsIndexed;
      }
    }

    return {
      success: true,
      documentsIndexed: totalIndexed
    };
  }

  /**
   * Index an entire course
   */
  private async indexCourse(job: Job<IndexingJobData>): Promise<IndexingResult> {
    const { courseId } = job.data;
    const coursePath = path.join(this.config.contentPath, courseId);
    
    await this.indexingQueue.updateProgress(job.id.toString(), 10, 'Scanning course structure');

    // Delete existing vectors for this course if reindexing
    if (job.data.action === 'reindex') {
      await this.deleteAllCourseVectors(courseId);
    }

    const modules = await fs.readdir(coursePath);
    const moduleDirs = [];

    for (const item of modules) {
      const itemPath = path.join(coursePath, item);
      const stat = await fs.stat(itemPath);
      if (stat.isDirectory() && item.startsWith('module-')) {
        moduleDirs.push(item);
      }
    }

    let totalIndexed = 0;

    for (let i = 0; i < moduleDirs.length; i++) {
      const progress = 20 + (70 * i / moduleDirs.length);
      await this.indexingQueue.updateProgress(
        job.id.toString(), 
        progress, 
        `Indexing module ${i + 1} of ${moduleDirs.length}`
      );

      const moduleJob = { 
        ...job, 
        data: { 
          ...job.data, 
          moduleId: moduleDirs[i], 
          type: 'module' as const 
        } 
      };
      const result = await this.indexModule(moduleJob);
      
      if (result.success && result.documentsIndexed) {
        totalIndexed += result.documentsIndexed;
      }
    }

    // Index course index file if exists
    const indexPath = path.join(coursePath, 'index.ts');
    try {
      await fs.access(indexPath);
      const indexJob = { 
        ...job, 
        data: { 
          ...job.data, 
          filePath: indexPath, 
          type: 'file' as const 
        } 
      };
      const result = await this.indexFile(indexJob);
      if (result.success && result.documentsIndexed) {
        totalIndexed += result.documentsIndexed;
      }
    } catch {
      // Index file doesn't exist, skip
    }

    return {
      success: true,
      documentsIndexed: totalIndexed
    };
  }

  /**
   * Delete content from vector store
   */
  private async deleteContent(job: Job<IndexingJobData>): Promise<IndexingResult> {
    const { data } = job;

    if (data.type === 'file' && data.filePath) {
      await this.deleteFileVectors(data.filePath);
    } else if (data.type === 'course') {
      await this.deleteAllCourseVectors(data.courseId);
    }

    return { success: true };
  }

  /**
   * Delete vectors for a specific file
   */
  private async deleteFileVectors(filePath: string): Promise<void> {
    const snapshot = await db
      .collection('course_vectors')
      .where('filePath', '==', filePath)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }

  /**
   * Delete all vectors for a course
   */
  private async deleteAllCourseVectors(courseId: string): Promise<void> {
    const snapshot = await db
      .collection('course_vectors')
      .where('courseId', '==', courseId)
      .get();

    // Delete in batches of 500
    const batchSize = 500;
    for (let i = 0; i < snapshot.docs.length; i += batchSize) {
      const batch = db.batch();
      const batchDocs = snapshot.docs.slice(i, i + batchSize);
      batchDocs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
  }

  /**
   * Extract text content from lesson data
   */
  private extractTextFromLesson(lessonData: any): string {
    const parts: string[] = [];

    if (lessonData.title) parts.push(`Title: ${lessonData.title}`);
    if (lessonData.description) parts.push(`Description: ${lessonData.description}`);
    if (lessonData.content) parts.push(`Content: ${lessonData.content}`);
    
    if (lessonData.codeExample) {
      parts.push(`Code Example: ${lessonData.codeExample.code}`);
      if (lessonData.codeExample.explanation) {
        parts.push(`Explanation: ${lessonData.codeExample.explanation}`);
      }
    }

    if (lessonData.keyTakeaways?.length) {
      parts.push(`Key Takeaways: ${lessonData.keyTakeaways.join(', ')}`);
    }

    return parts.join('\n\n');
  }

  /**
   * Start periodic cleanup of old jobs
   */
  private startPeriodicCleanup(): void {
    setInterval(async () => {
      if (!this.isRunning) return;
      
      try {
        await this.indexingQueue.cleanOldJobs(24); // Clean jobs older than 24 hours
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }, 60 * 60 * 1000); // Run every hour
  }

  /**
   * Manually trigger course reindexing
   */
  async reindexCourse(courseId: string): Promise<string> {
    const job = await this.indexingQueue.addIndexingJob({
      type: 'course',
      courseId,
      action: 'reindex',
      priority: 20
    });

    return job.id.toString();
  }

  /**
   * Get service status
   */
  async getStatus(): Promise<{
    running: boolean;
    fileWatcher: any;
    queue: any;
  }> {
    const queueStats = await this.indexingQueue.getStats();
    
    return {
      running: this.isRunning,
      fileWatcher: this.fileWatcher?.getStatus() || null,
      queue: queueStats
    };
  }
}

// Singleton instance
let indexingService: CourseIndexingService | null = null;

export function getIndexingService(config?: IndexingServiceConfig): CourseIndexingService {
  if (!indexingService && config) {
    indexingService = new CourseIndexingService(config);
  } else if (!indexingService) {
    throw new Error('Indexing service not initialized. Please provide config.');
  }
  
  return indexingService;
}