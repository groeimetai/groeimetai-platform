/**
 * RAG (Retrieval-Augmented Generation) Module
 * Export main functionality for course chatbot system
 */

export {
  // Main classes
  CourseChatbotSystem,
  QueryProcessor,
  
  // Factory functions
  createCourseChatbot,
  
  // Types - Chatbot
  type ChatbotConfig,
  type PineconeConfig,
  type WeaviateConfig,
  type ChromaConfig,
  type SearchConfig,
  type CourseMetadata,
  type QueryResult,
  type ChatResponse,
  type VectorStore,
} from './course-chatbot-system';

export {
  // Main classes
  EmbeddingsManager,
  ContentProcessor,
  
  // Factory function
  createEmbeddingsManager,
  
  // Types - Embeddings
  type EmbeddingConfig,
  type ChunkMetadata,
  type ProcessingResult,
  type ContentOptimization,
} from './embeddings-manager';

// Re-export for convenience
export { Document } from 'langchain/document';