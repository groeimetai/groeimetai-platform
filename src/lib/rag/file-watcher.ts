import * as chokidar from 'chokidar';
import * as path from 'path';
import { EventEmitter } from 'events';
import { IndexingQueue } from './indexing-queue';

export interface FileChangeEvent {
  type: 'add' | 'change' | 'unlink';
  filePath: string;
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
  timestamp: Date;
}

export interface FileWatcherConfig {
  contentPath: string;
  debounceMs?: number;
  ignored?: string[];
  depth?: number;
}

export class CourseFileWatcher extends EventEmitter {
  private watcher: chokidar.FSWatcher | null = null;
  private indexingQueue: IndexingQueue;
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private config: Required<FileWatcherConfig>;
  private pendingChanges: Map<string, FileChangeEvent> = new Map();

  constructor(config: FileWatcherConfig, indexingQueue: IndexingQueue) {
    super();
    this.config = {
      contentPath: config.contentPath,
      debounceMs: config.debounceMs || 5000,
      ignored: config.ignored || ['**/node_modules/**', '**/.git/**', '**/*.test.ts'],
      depth: config.depth || 5
    };
    this.indexingQueue = indexingQueue;
  }

  /**
   * Start watching the course content directory
   */
  async start(): Promise<void> {
    if (this.watcher) {
      console.warn('FileWatcher is already running');
      return;
    }

    const watchPath = path.join(this.config.contentPath, '**/*.{ts,tsx,md,json}');
    
    this.watcher = chokidar.watch(watchPath, {
      ignored: this.config.ignored,
      persistent: true,
      ignoreInitial: true,
      depth: this.config.depth,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    });

    this.watcher
      .on('add', (filePath) => this.handleFileChange('add', filePath))
      .on('change', (filePath) => this.handleFileChange('change', filePath))
      .on('unlink', (filePath) => this.handleFileChange('unlink', filePath))
      .on('error', (error) => this.emit('error', error))
      .on('ready', () => {
        console.log('FileWatcher is ready and monitoring:', this.config.contentPath);
        this.emit('ready');
      });
  }

  /**
   * Stop watching files
   */
  async stop(): Promise<void> {
    if (!this.watcher) {
      return;
    }

    // Clear all pending timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
    this.pendingChanges.clear();

    await this.watcher.close();
    this.watcher = null;
    this.emit('stopped');
  }

  /**
   * Handle file changes with debouncing
   */
  private handleFileChange(type: 'add' | 'change' | 'unlink', filePath: string): void {
    const normalizedPath = path.normalize(filePath);
    const { courseId, moduleId, lessonId } = this.extractCourseInfo(normalizedPath);

    if (!courseId) {
      console.warn('Could not extract course info from path:', normalizedPath);
      return;
    }

    const event: FileChangeEvent = {
      type,
      filePath: normalizedPath,
      courseId,
      moduleId,
      lessonId,
      timestamp: new Date()
    };

    // Store the latest change for this file
    this.pendingChanges.set(normalizedPath, event);

    // Clear existing timer for this file
    const existingTimer = this.debounceTimers.get(normalizedPath);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new debounced timer
    const timer = setTimeout(() => {
      this.processPendingChange(normalizedPath);
    }, this.config.debounceMs);

    this.debounceTimers.set(normalizedPath, timer);
  }

  /**
   * Process a pending change after debounce period
   */
  private async processPendingChange(filePath: string): Promise<void> {
    const event = this.pendingChanges.get(filePath);
    if (!event) {
      return;
    }

    this.pendingChanges.delete(filePath);
    this.debounceTimers.delete(filePath);

    try {
      // Queue the indexing job
      const job = await this.indexingQueue.addIndexingJob({
        type: 'file',
        filePath: event.filePath,
        courseId: event.courseId!,
        moduleId: event.moduleId,
        lessonId: event.lessonId,
        action: event.type === 'unlink' ? 'delete' : 'index',
        priority: this.calculatePriority(event)
      });

      this.emit('queued', { event, jobId: job.id });
      console.log(`Queued indexing job ${job.id} for ${event.type} on ${event.filePath}`);
    } catch (error) {
      console.error('Failed to queue indexing job:', error);
      this.emit('error', { error, event });
    }
  }

  /**
   * Extract course, module, and lesson IDs from file path
   */
  private extractCourseInfo(filePath: string): {
    courseId?: string;
    moduleId?: string;
    lessonId?: string;
  } {
    const relativePath = path.relative(this.config.contentPath, filePath);
    const parts = relativePath.split(path.sep);

    // Expected structure: course-id/module-id/lesson-id.ts
    const courseId = parts[0];
    const moduleId = parts[1]?.startsWith('module-') ? parts[1] : undefined;
    const lessonFile = parts[parts.length - 1];
    const lessonId = lessonFile?.match(/lesson-(\d+-\d+)\.ts$/)?.[1];

    return { courseId, moduleId, lessonId };
  }

  /**
   * Calculate priority based on file type and location
   */
  private calculatePriority(event: FileChangeEvent): number {
    // Higher priority for index files and main course files
    if (event.filePath.endsWith('index.ts')) {
      return 10;
    }
    // Medium priority for lesson files
    if (event.lessonId) {
      return 5;
    }
    // Lower priority for other files
    return 1;
  }

  /**
   * Force re-index of a specific course
   */
  async reindexCourse(courseId: string): Promise<void> {
    const coursePath = path.join(this.config.contentPath, courseId);
    
    try {
      const job = await this.indexingQueue.addIndexingJob({
        type: 'course',
        courseId,
        action: 'reindex',
        priority: 20 // High priority for manual reindex
      });

      console.log(`Queued full course reindex job ${job.id} for ${courseId}`);
      this.emit('reindex-queued', { courseId, jobId: job.id });
    } catch (error) {
      console.error('Failed to queue course reindex:', error);
      this.emit('error', { error, courseId });
    }
  }

  /**
   * Get current watcher status
   */
  getStatus(): {
    isWatching: boolean;
    pendingChanges: number;
    watchedPath: string;
  } {
    return {
      isWatching: !!this.watcher,
      pendingChanges: this.pendingChanges.size,
      watchedPath: this.config.contentPath
    };
  }
}

// Factory function for creating a file watcher
export function createCourseFileWatcher(
  contentPath: string,
  indexingQueue: IndexingQueue,
  config?: Partial<FileWatcherConfig>
): CourseFileWatcher {
  const fullConfig: FileWatcherConfig = {
    contentPath,
    ...config
  };

  return new CourseFileWatcher(fullConfig, indexingQueue);
}