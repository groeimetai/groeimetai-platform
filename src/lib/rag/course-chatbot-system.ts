/**
 * RAG Chatbot System for Course Platform
 * Production-ready implementation with vector store integration
 */

import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from 'langchain/document';

// ============================================================================
// Type Definitions
// ============================================================================

export interface ChatbotConfig {
  vectorStore: 'pinecone' | 'weaviate' | 'chroma';
  openAIApiKey: string;
  vectorStoreConfig: PineconeConfig | WeaviateConfig | ChromaConfig;
  language: 'nl' | 'en';
  searchConfig?: SearchConfig;
}

export interface PineconeConfig {
  apiKey: string;
  environment: string;
  indexName: string;
  namespace?: string;
}

export interface WeaviateConfig {
  scheme: 'http' | 'https';
  host: string;
  apiKey?: string;
  className: string;
}

export interface ChromaConfig {
  url: string;
  collectionName: string;
  apiKey?: string;
}

export interface SearchConfig {
  topK?: number;
  scoreThreshold?: number;
  hybridAlpha?: number; // 0 = keyword only, 1 = semantic only
  maxTokens?: number;
  temperature?: number;
}

export interface CourseMetadata {
  courseId: string;
  courseName: string;
  moduleId: string;
  moduleName: string;
  lessonId: string;
  lessonName: string;
  lessonType: 'video' | 'text' | 'interactive' | 'quiz';
  language: string;
  difficulty: string;
  tags: string[];
  timestamp?: number;
}

export interface QueryResult {
  content: string;
  metadata: CourseMetadata;
  score: number;
  highlights?: string[];
}

export interface ChatResponse {
  answer: string;
  sources: QueryResult[];
  confidence: number;
  suggestedQuestions?: string[];
}

export interface VectorStore {
  upsert(documents: Document[]): Promise<void>;
  similaritySearch(query: string, k: number, filter?: any): Promise<QueryResult[]>;
  hybridSearch(query: string, k: number, alpha: number, filter?: any): Promise<QueryResult[]>;
  delete(ids: string[]): Promise<void>;
}

// ============================================================================
// Vector Store Implementations
// ============================================================================

class PineconeVectorStore implements VectorStore {
  private client: Pinecone;
  private index: any;
  private embeddings: OpenAIEmbeddings;
  private namespace?: string;

  constructor(config: PineconeConfig, embeddings: OpenAIEmbeddings) {
    this.client = new Pinecone();
    this.embeddings = embeddings;
    this.namespace = config.namespace;
  }

  async initialize(config: PineconeConfig): Promise<void> {
    this.client = new Pinecone({
      apiKey: config.apiKey,
      environment: config.environment,
    });
    this.index = this.client.index(config.indexName);
  }

  async upsert(documents: Document[]): Promise<void> {
    const vectors = await Promise.all(
      documents.map(async (doc) => {
        const embedding = await this.embeddings.embedDocuments([doc.pageContent]);
        return {
          id: doc.metadata.lessonId + '_' + Date.now(),
          values: embedding[0],
          metadata: {
            ...doc.metadata,
            content: doc.pageContent,
          },
        };
      })
    );

    // Batch upsert for better performance
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await this.index.namespace(this.namespace || '').upsert(batch);
    }
  }

  async similaritySearch(query: string, k: number = 5, filter?: any): Promise<QueryResult[]> {
    const queryEmbedding = await this.embeddings.embedQuery(query);
    
    const searchResponse = await this.index.namespace(this.namespace || '').query({
      topK: k,
      includeMetadata: true,
      vector: queryEmbedding,
      filter,
    });

    return searchResponse.matches.map((match: any) => ({
      content: match.metadata.content,
      metadata: match.metadata as CourseMetadata,
      score: match.score,
    }));
  }

  async hybridSearch(query: string, k: number = 5, alpha: number = 0.5, filter?: any): Promise<QueryResult[]> {
    // For Pinecone, we'll implement a simple hybrid search combining semantic and keyword
    const semanticResults = await this.similaritySearch(query, k * 2, filter);
    
    // Simple keyword matching on metadata
    const keywords = query.toLowerCase().split(' ').filter(word => word.length > 2);
    const keywordScores = semanticResults.map(result => {
      const content = result.content.toLowerCase();
      const metadata = JSON.stringify(result.metadata).toLowerCase();
      const keywordMatches = keywords.filter(keyword => 
        content.includes(keyword) || metadata.includes(keyword)
      ).length;
      return {
        ...result,
        keywordScore: keywordMatches / keywords.length,
      };
    });

    // Combine scores
    const hybridResults = keywordScores.map(result => ({
      ...result,
      score: alpha * result.score + (1 - alpha) * result.keywordScore,
    }));

    // Sort and return top k
    return hybridResults
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map(({ keywordScore, ...result }) => result);
  }

  async delete(ids: string[]): Promise<void> {
    await this.index.namespace(this.namespace || '').deleteMany(ids);
  }
}

// ============================================================================
// Query Processing Pipeline
// ============================================================================

export class QueryProcessor {
  private language: string;

  constructor(language: 'nl' | 'en' = 'nl') {
    this.language = language;
  }

  /**
   * Preprocess query for better search results
   */
  preprocessQuery(query: string): string {
    // Remove extra whitespace
    let processed = query.trim().replace(/\s+/g, ' ');

    // Handle Dutch specific preprocessing
    if (this.language === 'nl') {
      // Common Dutch contractions
      processed = processed
        .replace(/\b't\b/g, 'het')
        .replace(/\b'n\b/g, 'een')
        .replace(/\bz'n\b/g, 'zijn')
        .replace(/\bd'r\b/g, 'haar');
    }

    return processed;
  }

  /**
   * Extract intent and entities from query
   */
  extractQueryIntent(query: string): {
    intent: 'definition' | 'howto' | 'troubleshoot' | 'example' | 'general';
    entities: string[];
  } {
    const lowerQuery = query.toLowerCase();
    
    // Intent patterns
    const patterns = {
      definition: /wat is|what is|uitleg|explain|betekent|means/i,
      howto: /hoe|how|maak|create|implement|bouwen|build/i,
      troubleshoot: /probleem|problem|error|fout|werkt niet|doesn't work/i,
      example: /voorbeeld|example|laat zien|show me|demo/i,
    };

    let intent: any = 'general';
    for (const [key, pattern] of Object.entries(patterns)) {
      if (pattern.test(lowerQuery)) {
        intent = key;
        break;
      }
    }

    // Simple entity extraction (can be enhanced with NER)
    const entities = query
      .split(' ')
      .filter(word => word.length > 3 && !['wat', 'hoe', 'is', 'de', 'het', 'een'].includes(word.toLowerCase()))
      .slice(0, 5);

    return { intent, entities };
  }

  /**
   * Generate search filters based on query analysis
   */
  generateSearchFilters(query: string, userContext?: any): any {
    const { intent, entities } = this.extractQueryIntent(query);
    const filters: any = {};

    // Add intent-based filters
    if (intent === 'example') {
      filters.lessonType = { $in: ['interactive', 'text'] };
    } else if (intent === 'troubleshoot') {
      filters.tags = { $in: ['troubleshooting', 'debugging', 'errors'] };
    }

    // Add user context filters
    if (userContext?.currentCourse) {
      filters.courseId = userContext.currentCourse;
    }

    return filters;
  }
}

// ============================================================================
// Main Chatbot System
// ============================================================================

export class CourseChatbotSystem {
  private vectorStore: VectorStore;
  private embeddings: OpenAIEmbeddings;
  private queryProcessor: QueryProcessor;
  private config: ChatbotConfig;

  constructor(config: ChatbotConfig) {
    this.config = config;
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: config.openAIApiKey,
      modelName: 'text-embedding-3-small',
    });
    this.queryProcessor = new QueryProcessor(config.language);
  }

  async initialize(): Promise<void> {
    switch (this.config.vectorStore) {
      case 'pinecone':
        const pineconeStore = new PineconeVectorStore(
          this.config.vectorStoreConfig as PineconeConfig,
          this.embeddings
        );
        await pineconeStore.initialize(this.config.vectorStoreConfig as PineconeConfig);
        this.vectorStore = pineconeStore;
        break;
      // Add other vector store implementations as needed
      default:
        throw new Error(`Vector store ${this.config.vectorStore} not implemented`);
    }
  }

  /**
   * Process a user query and return a response
   */
  async query(
    userQuery: string,
    userContext?: {
      userId?: string;
      currentCourse?: string;
      currentModule?: string;
      previousQueries?: string[];
    }
  ): Promise<ChatResponse> {
    // Preprocess query
    const processedQuery = this.queryProcessor.preprocessQuery(userQuery);
    
    // Generate search filters
    const filters = this.queryProcessor.generateSearchFilters(processedQuery, userContext);
    
    // Perform hybrid search
    const searchConfig = this.config.searchConfig || {};
    const results = await this.vectorStore.hybridSearch(
      processedQuery,
      searchConfig.topK || 5,
      searchConfig.hybridAlpha || 0.7,
      filters
    );

    // Generate response
    const response = await this.generateResponse(processedQuery, results, userContext);
    
    // Generate suggested questions
    const suggestedQuestions = this.generateSuggestedQuestions(results, userContext);

    return {
      answer: response.answer,
      sources: results,
      confidence: response.confidence,
      suggestedQuestions,
    };
  }

  /**
   * Generate a natural language response based on search results
   */
  private async generateResponse(
    query: string,
    results: QueryResult[],
    userContext?: any
  ): Promise<{ answer: string; confidence: number }> {
    if (results.length === 0) {
      return {
        answer: this.config.language === 'nl'
          ? 'Ik kon geen relevante informatie vinden voor je vraag. Kun je je vraag anders formuleren?'
          : 'I couldn\'t find relevant information for your question. Could you rephrase your question?',
        confidence: 0,
      };
    }

    // Calculate confidence based on top result scores
    const avgScore = results.slice(0, 3).reduce((sum, r) => sum + r.score, 0) / Math.min(3, results.length);
    const confidence = Math.min(avgScore, 1);

    // Format context from results
    const context = results
      .map((r, i) => `[${i + 1}] ${r.content}\n(Bron: ${r.metadata.courseName} - ${r.metadata.moduleName} - ${r.metadata.lessonName})`)
      .join('\n\n');

    // Generate prompt based on language
    const systemPrompt = this.config.language === 'nl'
      ? `Je bent een behulpzame AI-assistent voor het GroeimetAI cursusplatform. Beantwoord vragen op basis van de gegeven context. Wees accuraat, duidelijk en verwijs naar de bronnen waar nodig.`
      : `You are a helpful AI assistant for the GroeimetAI course platform. Answer questions based on the given context. Be accurate, clear, and reference sources when appropriate.`;

    const userPrompt = `Context:\n${context}\n\nVraag: ${query}\n\nGeef een duidelijk en behulpzaam antwoord op basis van de context.`;

    // Here you would call OpenAI or another LLM to generate the response
    // For now, we'll return a structured response based on the results
    const answer = this.formatAnswer(query, results, this.config.language);

    return { answer, confidence };
  }

  /**
   * Format answer based on results (placeholder for LLM integration)
   */
  private formatAnswer(query: string, results: QueryResult[], language: string): string {
    const topResult = results[0];
    const sourceInfo = `${topResult.metadata.courseName} - ${topResult.metadata.lessonName}`;

    if (language === 'nl') {
      return `Op basis van de cursusinhoud:\n\n${topResult.content}\n\n(Bron: ${sourceInfo})`;
    } else {
      return `Based on the course content:\n\n${topResult.content}\n\n(Source: ${sourceInfo})`;
    }
  }

  /**
   * Generate suggested follow-up questions
   */
  private generateSuggestedQuestions(results: QueryResult[], userContext?: any): string[] {
    const suggestions: string[] = [];
    
    // Based on the lesson types in results
    const hasVideo = results.some(r => r.metadata.lessonType === 'video');
    const hasInteractive = results.some(r => r.metadata.lessonType === 'interactive');
    
    if (this.config.language === 'nl') {
      if (hasVideo) suggestions.push('Kun je een video tutorial laten zien?');
      if (hasInteractive) suggestions.push('Zijn er praktische oefeningen beschikbaar?');
      suggestions.push('Wat zijn de vereisten voor deze module?');
      suggestions.push('Hoe lang duurt het om dit te leren?');
    } else {
      if (hasVideo) suggestions.push('Can you show me a video tutorial?');
      if (hasInteractive) suggestions.push('Are there any hands-on exercises available?');
      suggestions.push('What are the prerequisites for this module?');
      suggestions.push('How long does it take to learn this?');
    }

    return suggestions.slice(0, 3);
  }

  /**
   * Index course content into the vector store
   */
  async indexContent(documents: Document[]): Promise<void> {
    await this.vectorStore.upsert(documents);
  }

  /**
   * Delete content from the vector store
   */
  async deleteContent(lessonIds: string[]): Promise<void> {
    await this.vectorStore.delete(lessonIds);
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createCourseChatbot(config: ChatbotConfig): CourseChatbotSystem {
  return new CourseChatbotSystem(config);
}