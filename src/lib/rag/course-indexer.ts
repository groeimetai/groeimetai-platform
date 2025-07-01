import { readdir, readFile } from 'fs/promises';
import { join, basename } from 'path';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Course, Module, Lesson, CodeExample } from '@/lib/data/courses';

// Types for indexing results
export interface IndexingStats {
  totalCourses: number;
  totalModules: number;
  totalLessons: number;
  totalChunks: number;
  totalCodeExamples: number;
  indexingTime: number;
  errors: IndexingError[];
}

export interface IndexingError {
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
  error: string;
  stack?: string;
}

export interface CourseChunk {
  content: string;
  metadata: {
    courseId: string;
    courseTitle: string;
    moduleId: string;
    moduleTitle: string;
    lessonId: string;
    lessonTitle: string;
    lessonDuration: string;
    chunkType: 'content' | 'code' | 'assignment' | 'resource';
    chunkIndex: number;
    codeLanguage?: string;
    codeTitle?: string;
  };
}

export interface IndexingProgress {
  currentCourse?: string;
  currentModule?: string;
  currentLesson?: string;
  processedCourses: number;
  processedModules: number;
  processedLessons: number;
  processedChunks: number;
  totalCourses: number;
  progress: number;
}

// Progress callback type
type ProgressCallback = (progress: IndexingProgress) => void;

export class CourseIndexer {
  private embeddings: OpenAIEmbeddings;
  private vectorStore: MemoryVectorStore;
  private textSplitter: RecursiveCharacterTextSplitter;
  private stats: IndexingStats = {
    totalCourses: 0,
    totalModules: 0,
    totalLessons: 0,
    totalChunks: 0,
    totalCodeExamples: 0,
    indexingTime: 0,
    errors: []
  };
  private progressCallback?: ProgressCallback;
  private courseContentPath: string;

  constructor(options?: {
    openAIApiKey?: string;
    chunkSize?: number;
    chunkOverlap?: number;
    progressCallback?: ProgressCallback;
    courseContentPath?: string;
  }) {
    // Initialize embeddings
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: options?.openAIApiKey || process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-3-small'
    });

    // Initialize text splitter
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: options?.chunkSize || 1000,
      chunkOverlap: options?.chunkOverlap || 200,
      separators: ['\n\n', '\n', ' ', '']
    });

    // Initialize vector store
    this.vectorStore = new MemoryVectorStore(this.embeddings);
    
    // Set progress callback
    this.progressCallback = options?.progressCallback;
    
    // Set course content path
    this.courseContentPath = options?.courseContentPath || 
      join(process.cwd(), 'src/lib/data/course-content');
  }

  /**
   * Index all courses in the course content directory
   */
  async indexAllCourses(): Promise<IndexingStats> {
    const startTime = Date.now();
    
    try {
      // Get all course directories
      const courseDirs = await this.getCourseDirectories();
      const totalCourses = courseDirs.length;
      
      this.reportProgress({
        processedCourses: 0,
        processedModules: 0,
        processedLessons: 0,
        processedChunks: 0,
        totalCourses,
        progress: 0
      });

      // Process each course
      for (let i = 0; i < courseDirs.length; i++) {
        const courseDir = courseDirs[i];
        try {
          await this.indexCourse(courseDir);
          this.stats.totalCourses++;
          
          this.reportProgress({
            currentCourse: courseDir,
            processedCourses: i + 1,
            processedModules: this.stats.totalModules,
            processedLessons: this.stats.totalLessons,
            processedChunks: this.stats.totalChunks,
            totalCourses,
            progress: ((i + 1) / totalCourses) * 100
          });
        } catch (error) {
          this.stats.errors.push({
            courseId: courseDir,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
          });
        }
      }
      
      this.stats.indexingTime = Date.now() - startTime;
      return this.stats;
    } catch (error) {
      this.stats.errors.push({
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      this.stats.indexingTime = Date.now() - startTime;
      throw error;
    }
  }

  /**
   * Index a single course
   */
  async indexCourse(courseId: string): Promise<void> {
    const coursePath = join(this.courseContentPath, courseId);
    
    try {
      // Import course index using dynamic import with file protocol
      const courseIndexPath = join(coursePath, 'index.ts');
      const courseModule = await import(`file://${courseIndexPath}`);
      
      // Find the exported course object
      const course: Course = this.findCourseExport(courseModule, courseId);
      
      if (!course) {
        throw new Error(`No course export found in ${courseIndexPath}`);
      }

      // Process each module
      for (let moduleIndex = 0; moduleIndex < course.modules.length; moduleIndex++) {
        const module = course.modules[moduleIndex];
        try {
          await this.indexModule(course, module, moduleIndex);
          this.stats.totalModules++;
        } catch (error) {
          this.stats.errors.push({
            courseId: course.id,
            moduleId: module.id,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
          });
        }
      }
    } catch (error) {
      throw new Error(`Failed to index course ${courseId}: ${error}`);
    }
  }

  /**
   * Index a single module
   */
  private async indexModule(course: Course, module: Module, moduleIndex: number): Promise<void> {
    this.reportProgress({
      currentCourse: course.id,
      currentModule: module.id,
      processedCourses: this.stats.totalCourses,
      processedModules: this.stats.totalModules,
      processedLessons: this.stats.totalLessons,
      processedChunks: this.stats.totalChunks,
      totalCourses: 0,
      progress: 0
    });

    // Process each lesson
    for (let lessonIndex = 0; lessonIndex < module.lessons.length; lessonIndex++) {
      const lesson = module.lessons[lessonIndex];
      try {
        await this.indexLesson(course, module, lesson, lessonIndex);
        this.stats.totalLessons++;
      } catch (error) {
        this.stats.errors.push({
          courseId: course.id,
          moduleId: module.id,
          lessonId: lesson.id,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
      }
    }
  }

  /**
   * Index a single lesson
   */
  private async indexLesson(
    course: Course, 
    module: Module, 
    lesson: Lesson, 
    lessonIndex: number
  ): Promise<void> {
    this.reportProgress({
      currentCourse: course.id,
      currentModule: module.id,
      currentLesson: lesson.id,
      processedCourses: this.stats.totalCourses,
      processedModules: this.stats.totalModules,
      processedLessons: this.stats.totalLessons,
      processedChunks: this.stats.totalChunks,
      totalCourses: 0,
      progress: 0
    });

    const chunks: CourseChunk[] = [];

    // Process main content
    if (lesson.content) {
      const contentChunks = await this.splitContent(lesson.content);
      contentChunks.forEach((chunk, index) => {
        chunks.push({
          content: chunk,
          metadata: {
            courseId: course.id,
            courseTitle: course.title,
            moduleId: module.id,
            moduleTitle: module.title,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            lessonDuration: lesson.duration,
            chunkType: 'content',
            chunkIndex: index
          }
        });
      });
    }

    // Process code examples
    if (lesson.codeExamples) {
      for (const codeExample of lesson.codeExamples) {
        const codeContent = this.formatCodeExample(codeExample);
        chunks.push({
          content: codeContent,
          metadata: {
            courseId: course.id,
            courseTitle: course.title,
            moduleId: module.id,
            moduleTitle: module.title,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            lessonDuration: lesson.duration,
            chunkType: 'code',
            chunkIndex: 0,
            codeLanguage: codeExample.language,
            codeTitle: codeExample.title
          }
        });
        this.stats.totalCodeExamples++;
      }
    }

    // Process assignments
    if (lesson.assignments) {
      for (const assignment of lesson.assignments) {
        const assignmentContent = this.formatAssignment(assignment);
        chunks.push({
          content: assignmentContent,
          metadata: {
            courseId: course.id,
            courseTitle: course.title,
            moduleId: module.id,
            moduleTitle: module.title,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            lessonDuration: lesson.duration,
            chunkType: 'assignment',
            chunkIndex: 0
          }
        });
      }
    }

    // Process resources
    if (lesson.resources) {
      const resourcesContent = this.formatResources(lesson.resources);
      if (resourcesContent) {
        chunks.push({
          content: resourcesContent,
          metadata: {
            courseId: course.id,
            courseTitle: course.title,
            moduleId: module.id,
            moduleTitle: module.title,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            lessonDuration: lesson.duration,
            chunkType: 'resource',
            chunkIndex: 0
          }
        });
      }
    }

    // Add chunks to vector store
    if (chunks.length > 0) {
      const documents = chunks.map(chunk => new Document({
        pageContent: chunk.content,
        metadata: chunk.metadata
      }));

      await this.vectorStore.addDocuments(documents);
      this.stats.totalChunks += chunks.length;
    }
  }

  /**
   * Get all course directories
   */
  private async getCourseDirectories(): Promise<string[]> {
    const entries = await readdir(this.courseContentPath, { withFileTypes: true });
    return entries
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => entry.name);
  }

  /**
   * Find the course export in a module
   */
  private findCourseExport(module: any, courseId: string): Course | null {
    // Look for a named export matching the courseId
    const camelCaseId = courseId.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    
    if (module[camelCaseId]) {
      return module[camelCaseId];
    }
    
    // Look for default export
    if (module.default) {
      return module.default;
    }
    
    // Look for any export that has a course structure
    for (const key of Object.keys(module)) {
      const value = module[key];
      if (value && typeof value === 'object' && 'id' in value && 'modules' in value) {
        return value;
      }
    }
    
    return null;
  }

  /**
   * Split content into chunks
   */
  private async splitContent(content: string): Promise<string[]> {
    const documents = await this.textSplitter.createDocuments([content]);
    return documents.map(doc => doc.pageContent);
  }

  /**
   * Format code example for indexing
   */
  private formatCodeExample(codeExample: CodeExample): string {
    const parts = [
      `Code Example: ${codeExample.title}`,
      `Language: ${codeExample.language}`,
      '',
      '```' + codeExample.language,
      codeExample.code,
      '```'
    ];
    
    if (codeExample.explanation) {
      parts.push('', 'Explanation:', codeExample.explanation);
    }
    
    return parts.join('\n');
  }

  /**
   * Format assignment for indexing
   */
  private formatAssignment(assignment: any): string {
    const parts = [
      `Assignment: ${assignment.title}`,
      `Difficulty: ${assignment.difficulty}`,
      `Type: ${assignment.type}`,
      '',
      assignment.description
    ];
    
    if (assignment.initialCode) {
      parts.push('', 'Initial Code:', '```', assignment.initialCode, '```');
    }
    
    if (assignment.hints?.length > 0) {
      parts.push('', 'Hints:', ...assignment.hints.map((hint: string) => `- ${hint}`));
    }
    
    return parts.join('\n');
  }

  /**
   * Format resources for indexing
   */
  private formatResources(resources: any[]): string {
    if (!resources || resources.length === 0) return '';
    
    const parts = ['Resources:'];
    for (const resource of resources) {
      parts.push(`- ${resource.title} (${resource.type}): ${resource.url}`);
    }
    
    return parts.join('\n');
  }

  /**
   * Report progress
   */
  private reportProgress(progress: IndexingProgress): void {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }

  /**
   * Get the vector store for querying
   */
  getVectorStore(): MemoryVectorStore {
    return this.vectorStore;
  }

  /**
   * Get indexing statistics
   */
  getStats(): IndexingStats {
    return this.stats;
  }

  /**
   * Clear the index
   */
  async clearIndex(): Promise<void> {
    this.vectorStore = new MemoryVectorStore(this.embeddings);
    this.stats = {
      totalCourses: 0,
      totalModules: 0,
      totalLessons: 0,
      totalChunks: 0,
      totalCodeExamples: 0,
      indexingTime: 0,
      errors: []
    };
  }

  /**
   * Search the indexed content
   */
  async search(query: string, k: number = 5): Promise<Document[]> {
    return await this.vectorStore.similaritySearch(query, k);
  }

  /**
   * Export index to JSON for persistence
   */
  async exportIndex(): Promise<string> {
    const docs = await this.vectorStore.memoryVectors;
    return JSON.stringify({
      documents: docs,
      stats: this.stats,
      timestamp: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Import index from JSON
   */
  async importIndex(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    
    // Clear existing index
    await this.clearIndex();
    
    // Import documents
    if (data.documents && Array.isArray(data.documents)) {
      for (const doc of data.documents) {
        await this.vectorStore.addDocuments([new Document({
          pageContent: doc.content,
          metadata: doc.metadata
        })]);
      }
    }
    
    // Import stats
    if (data.stats) {
      this.stats = data.stats;
    }
  }
}