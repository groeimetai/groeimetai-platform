/**
 * Embeddings Manager for Course Content
 * Handles embedding generation, chunking, and metadata extraction
 */

import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Course, CourseModule, CourseLesson, LessonContent } from '../../types';

// ============================================================================
// Type Definitions
// ============================================================================

export interface EmbeddingConfig {
  openAIApiKey: string;
  modelName?: string;
  chunkSize?: number;
  chunkOverlap?: number;
  batchSize?: number;
}

export interface ChunkMetadata {
  courseId: string;
  courseName: string;
  moduleId: string;
  moduleName: string;
  moduleOrder: number;
  lessonId: string;
  lessonName: string;
  lessonType: string;
  lessonOrder: number;
  chunkIndex: number;
  totalChunks: number;
  contentType: 'text' | 'transcript' | 'code' | 'slide' | 'document';
  language: string;
  difficulty: string;
  tags: string[];
  estimatedReadTime?: number;
  keywords?: string[];
}

export interface ProcessingResult {
  documents: Document[];
  totalChunks: number;
  processingTime: number;
  errors?: Array<{ lessonId: string; error: string }>;
}

export interface ContentOptimization {
  minChunkSize?: number;
  maxChunkSize?: number;
  preserveCodeBlocks?: boolean;
  preserveSentences?: boolean;
  customSeparators?: string[];
}

// ============================================================================
// Content Processing Utilities
// ============================================================================

export class ContentProcessor {
  private textSplitter: RecursiveCharacterTextSplitter;
  private optimization: ContentOptimization;

  constructor(chunkSize: number = 1000, chunkOverlap: number = 200, optimization?: ContentOptimization) {
    this.optimization = {
      minChunkSize: 100,
      maxChunkSize: 2000,
      preserveCodeBlocks: true,
      preserveSentences: true,
      customSeparators: ['\n\n', '\n', '. ', '! ', '? ', '; '],
      ...optimization,
    };

    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: Math.min(chunkSize, this.optimization.maxChunkSize!),
      chunkOverlap,
      separators: this.optimization.customSeparators,
    });
  }

  /**
   * Extract text content from lesson
   */
  extractLessonContent(lesson: CourseLesson): string[] {
    const contents: string[] = [];
    const lessonContent = lesson.content as LessonContent;

    // Extract main description
    if (lesson.description) {
      contents.push(`# ${lesson.title}\n\n${lesson.description}`);
    }

    // Extract video transcript
    if (lessonContent.transcript) {
      contents.push(`## Transcript\n\n${lessonContent.transcript}`);
    }

    // Extract code examples
    if (lessonContent.codeExamples?.length) {
      lessonContent.codeExamples.forEach(example => {
        contents.push(`## Code Example: ${example.title}\n\n${example.description || ''}\n\n\`\`\`${example.language}\n${example.code}\n\`\`\``);
      });
    }

    // Extract slide content (if text-based)
    if (lessonContent.slides?.length) {
      lessonContent.slides.forEach((slide, index) => {
        if (typeof slide === 'string' && !slide.startsWith('http')) {
          contents.push(`## Slide ${index + 1}\n\n${slide}`);
        }
      });
    }

    return contents;
  }

  /**
   * Smart chunking that preserves context
   */
  async createChunks(content: string, preserveStructure: boolean = true): Promise<string[]> {
    if (preserveStructure && this.optimization.preserveCodeBlocks) {
      return this.smartChunkWithCodeBlocks(content);
    }

    const chunks = await this.textSplitter.splitText(content);
    
    // Filter out chunks that are too small
    return chunks.filter(chunk => chunk.length >= this.optimization.minChunkSize!);
  }

  /**
   * Smart chunking that preserves code blocks
   */
  private smartChunkWithCodeBlocks(content: string): string[] {
    const codeBlockRegex = /```[\s\S]*?```/g;
    const codeBlocks: Array<{ block: string; placeholder: string }> = [];
    let processedContent = content;

    // Extract code blocks and replace with placeholders
    let match;
    let index = 0;
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const placeholder = `__CODE_BLOCK_${index}__`;
      codeBlocks.push({ block: match[0], placeholder });
      processedContent = processedContent.replace(match[0], placeholder);
      index++;
    }

    // Split text without code blocks
    const textChunks = this.textSplitter.splitTextSync(processedContent);
    
    // Restore code blocks in chunks
    const finalChunks: string[] = [];
    textChunks.forEach(chunk => {
      let restoredChunk = chunk;
      codeBlocks.forEach(({ block, placeholder }) => {
        if (chunk.includes(placeholder)) {
          restoredChunk = restoredChunk.replace(placeholder, block);
        }
      });
      finalChunks.push(restoredChunk);
    });

    return finalChunks;
  }

  /**
   * Extract keywords from content (simple implementation)
   */
  extractKeywords(content: string, language: string = 'nl'): string[] {
    const stopWords = language === 'nl' 
      ? ['de', 'het', 'een', 'van', 'en', 'in', 'is', 'op', 'met', 'voor', 'aan', 'bij', 'om', 'dat', 'dit', 'zijn', 'wordt', 'worden', 'werd', 'werden']
      : ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'been', 'be'];

    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word));

    // Count word frequency
    const wordFreq = new Map<string, number>();
    words.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });

    // Return top keywords
    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Calculate estimated read time (words per minute)
   */
  calculateReadTime(content: string, wordsPerMinute: number = 200): number {
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }
}

// ============================================================================
// Main Embeddings Manager
// ============================================================================

export class EmbeddingsManager {
  private embeddings: OpenAIEmbeddings;
  private contentProcessor: ContentProcessor;
  private config: EmbeddingConfig;

  constructor(config: EmbeddingConfig) {
    this.config = config;
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: config.openAIApiKey,
      modelName: config.modelName || 'text-embedding-3-small',
    });
    
    this.contentProcessor = new ContentProcessor(
      config.chunkSize || 1000,
      config.chunkOverlap || 200
    );
  }

  /**
   * Process a single course and generate embeddings
   */
  async processCourse(course: Course): Promise<ProcessingResult> {
    const startTime = Date.now();
    const documents: Document[] = [];
    const errors: Array<{ lessonId: string; error: string }> = [];

    try {
      // Process each module
      for (const module of course.content.modules) {
        const moduleDocuments = await this.processModule(course, module);
        documents.push(...moduleDocuments);
      }

      // Add course-level document
      const courseDoc = this.createCourseDocument(course);
      documents.push(courseDoc);

    } catch (error) {
      console.error('Error processing course:', error);
      errors.push({ lessonId: 'course', error: error.message });
    }

    return {
      documents,
      totalChunks: documents.length,
      processingTime: Date.now() - startTime,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Process a module and its lessons
   */
  private async processModule(course: Course, module: CourseModule): Promise<Document[]> {
    const documents: Document[] = [];

    // Process each lesson
    for (const lesson of module.lessons) {
      try {
        const lessonDocuments = await this.processLesson(course, module, lesson);
        documents.push(...lessonDocuments);
      } catch (error) {
        console.error(`Error processing lesson ${lesson.id}:`, error);
      }
    }

    // Add module-level document
    const moduleDoc = this.createModuleDocument(course, module);
    documents.push(moduleDoc);

    return documents;
  }

  /**
   * Process a single lesson into chunks
   */
  private async processLesson(
    course: Course,
    module: CourseModule,
    lesson: CourseLesson
  ): Promise<Document[]> {
    const documents: Document[] = [];
    
    // Extract all content from lesson
    const contents = this.contentProcessor.extractLessonContent(lesson);
    const fullContent = contents.join('\n\n');

    // Create chunks
    const chunks = await this.contentProcessor.createChunks(fullContent);
    
    // Extract keywords for the entire lesson
    const keywords = this.contentProcessor.extractKeywords(fullContent, course.metadata.language);

    // Create documents for each chunk
    chunks.forEach((chunk, index) => {
      const metadata: ChunkMetadata = {
        courseId: course.id,
        courseName: course.title,
        moduleId: module.id,
        moduleName: module.title,
        moduleOrder: module.order,
        lessonId: lesson.id,
        lessonName: lesson.title,
        lessonType: lesson.type,
        lessonOrder: lesson.order,
        chunkIndex: index,
        totalChunks: chunks.length,
        contentType: this.detectContentType(chunk),
        language: course.metadata.language,
        difficulty: course.content.difficulty,
        tags: [...course.metadata.tags, ...(keywords.slice(0, 5))],
        estimatedReadTime: this.contentProcessor.calculateReadTime(chunk),
        keywords: keywords,
      };

      documents.push(new Document({
        pageContent: chunk,
        metadata: metadata as any,
      }));
    });

    return documents;
  }

  /**
   * Create a course-level summary document
   */
  private createCourseDocument(course: Course): Document {
    const content = `
# ${course.title}

## Beschrijving
${course.description}

## Leerdoelen
${course.content.learningObjectives.join('\n- ')}

## Vereisten
${course.content.prerequisites.join('\n- ')}

## Modules
${course.content.modules.map(m => `- ${m.title}: ${m.description}`).join('\n')}

## Niveau: ${course.content.difficulty}
## Geschatte duur: ${course.metadata.estimatedHours} uur
    `.trim();

    return new Document({
      pageContent: content,
      metadata: {
        courseId: course.id,
        courseName: course.title,
        moduleId: 'course-overview',
        moduleName: 'Cursusoverzicht',
        moduleOrder: 0,
        lessonId: 'course-summary',
        lessonName: 'Cursusbeschrijving',
        lessonType: 'text',
        lessonOrder: 0,
        chunkIndex: 0,
        totalChunks: 1,
        contentType: 'text',
        language: course.metadata.language,
        difficulty: course.content.difficulty,
        tags: course.metadata.tags,
      },
    });
  }

  /**
   * Create a module-level summary document
   */
  private createModuleDocument(course: Course, module: CourseModule): Document {
    const content = `
# Module: ${module.title}

## Beschrijving
${module.description}

## Lessen
${module.lessons.map(l => `- ${l.title}: ${l.description}`).join('\n')}

## Geschatte duur: ${module.duration} minuten
    `.trim();

    return new Document({
      pageContent: content,
      metadata: {
        courseId: course.id,
        courseName: course.title,
        moduleId: module.id,
        moduleName: module.title,
        moduleOrder: module.order,
        lessonId: `${module.id}-summary`,
        lessonName: 'Module Overzicht',
        lessonType: 'text',
        lessonOrder: 0,
        chunkIndex: 0,
        totalChunks: 1,
        contentType: 'text',
        language: course.metadata.language,
        difficulty: course.content.difficulty,
        tags: [...course.metadata.tags, 'module-overzicht'],
      },
    });
  }

  /**
   * Detect content type from chunk content
   */
  private detectContentType(chunk: string): 'text' | 'transcript' | 'code' | 'slide' | 'document' {
    if (chunk.includes('```') || chunk.includes('function') || chunk.includes('class')) {
      return 'code';
    }
    if (chunk.includes('## Transcript')) {
      return 'transcript';
    }
    if (chunk.includes('## Slide')) {
      return 'slide';
    }
    return 'text';
  }

  /**
   * Batch process multiple courses
   */
  async processCourses(
    courses: Course[],
    onProgress?: (current: number, total: number) => void
  ): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = [];
    const batchSize = this.config.batchSize || 5;

    for (let i = 0; i < courses.length; i += batchSize) {
      const batch = courses.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(course => this.processCourse(course))
      );
      results.push(...batchResults);

      if (onProgress) {
        onProgress(Math.min(i + batchSize, courses.length), courses.length);
      }
    }

    return results;
  }

  /**
   * Generate embeddings for documents (for testing/debugging)
   */
  async generateEmbeddings(documents: Document[]): Promise<number[][]> {
    const texts = documents.map(doc => doc.pageContent);
    return await this.embeddings.embedDocuments(texts);
  }

  /**
   * Update embeddings for specific lessons
   */
  async updateLessonEmbeddings(
    course: Course,
    module: CourseModule,
    lessonIds: string[]
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    const documents: Document[] = [];
    const errors: Array<{ lessonId: string; error: string }> = [];

    for (const lesson of module.lessons) {
      if (lessonIds.includes(lesson.id)) {
        try {
          const lessonDocuments = await this.processLesson(course, module, lesson);
          documents.push(...lessonDocuments);
        } catch (error) {
          errors.push({ lessonId: lesson.id, error: error.message });
        }
      }
    }

    return {
      documents,
      totalChunks: documents.length,
      processingTime: Date.now() - startTime,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createEmbeddingsManager(config: EmbeddingConfig): EmbeddingsManager {
  return new EmbeddingsManager(config);
}