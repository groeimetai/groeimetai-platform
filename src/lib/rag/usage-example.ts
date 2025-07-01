/**
 * Usage Example for RAG Chatbot System
 * Demonstrates how to integrate the chatbot into the course platform
 */

import {
  createCourseChatbot,
  createEmbeddingsManager,
  type ChatbotConfig,
  type Course,
} from './index';

// ============================================================================
// Configuration Example
// ============================================================================

const chatbotConfig: ChatbotConfig = {
  vectorStore: 'pinecone',
  openAIApiKey: process.env.OPENAI_API_KEY!,
  language: 'nl',
  vectorStoreConfig: {
    apiKey: process.env.PINECONE_API_KEY!,
    environment: process.env.PINECONE_ENVIRONMENT || 'us-east-1',
    indexName: 'groeimetai-courses',
    namespace: 'production',
  },
  searchConfig: {
    topK: 5,
    scoreThreshold: 0.7,
    hybridAlpha: 0.75, // Favor semantic search
    maxTokens: 1500,
    temperature: 0.7,
  },
};

// ============================================================================
// Initialization Example
// ============================================================================

export async function initializeChatbot() {
  // Create and initialize chatbot
  const chatbot = createCourseChatbot(chatbotConfig);
  await chatbot.initialize();
  
  console.log('Chatbot initialized successfully');
  return chatbot;
}

// ============================================================================
// Indexing Course Content Example
// ============================================================================

export async function indexCourseContent(courses: Course[]) {
  // Create embeddings manager
  const embeddingsManager = createEmbeddingsManager({
    openAIApiKey: process.env.OPENAI_API_KEY!,
    modelName: 'text-embedding-3-small',
    chunkSize: 1000,
    chunkOverlap: 200,
    batchSize: 5,
  });

  // Process courses with progress tracking
  const results = await embeddingsManager.processCourses(courses, (current, total) => {
    console.log(`Processing courses: ${current}/${total}`);
  });

  // Initialize chatbot
  const chatbot = await initializeChatbot();

  // Index all documents
  for (const result of results) {
    if (result.documents.length > 0) {
      await chatbot.indexContent(result.documents);
      console.log(`Indexed ${result.totalChunks} chunks in ${result.processingTime}ms`);
    }
    
    // Log any errors
    if (result.errors) {
      result.errors.forEach(error => {
        console.error(`Error in lesson ${error.lessonId}: ${error.error}`);
      });
    }
  }
}

// ============================================================================
// Query Examples
// ============================================================================

export async function exampleQueries() {
  const chatbot = await initializeChatbot();

  // Example 1: Simple question
  const response1 = await chatbot.query('Wat is LangChain en waarvoor wordt het gebruikt?');
  console.log('Response 1:', response1.answer);
  console.log('Confidence:', response1.confidence);
  console.log('Sources:', response1.sources.map(s => s.metadata.lessonName));

  // Example 2: Question with context
  const response2 = await chatbot.query(
    'Hoe maak ik een chatbot met geheugen?',
    {
      userId: 'user123',
      currentCourse: 'langchain-basics',
      previousQueries: ['Wat is LangChain?'],
    }
  );
  console.log('Response 2:', response2.answer);
  console.log('Suggested questions:', response2.suggestedQuestions);

  // Example 3: Troubleshooting question
  const response3 = await chatbot.query('Mijn API calls werken niet, wat kan het probleem zijn?');
  console.log('Response 3:', response3.answer);

  // Example 4: Code example request
  const response4 = await chatbot.query('Geef een voorbeeld van een webhook in Node.js');
  console.log('Response 4:', response4.answer);
}

// ============================================================================
// Update Specific Lessons Example
// ============================================================================

export async function updateLessonContent(
  course: Course,
  moduleId: string,
  lessonIds: string[]
) {
  const embeddingsManager = createEmbeddingsManager({
    openAIApiKey: process.env.OPENAI_API_KEY!,
  });

  const module = course.content.modules.find(m => m.id === moduleId);
  if (!module) {
    throw new Error(`Module ${moduleId} not found`);
  }

  // Process only specific lessons
  const result = await embeddingsManager.updateLessonEmbeddings(
    course,
    module,
    lessonIds
  );

  // Update in vector store
  const chatbot = await initializeChatbot();
  
  // First delete old embeddings
  await chatbot.deleteContent(lessonIds);
  
  // Then index new ones
  await chatbot.indexContent(result.documents);
  
  console.log(`Updated ${result.totalChunks} chunks for ${lessonIds.length} lessons`);
}

// ============================================================================
// React Hook Example
// ============================================================================

/**
 * Example React hook for using the chatbot in components
 */
export function useChatbot() {
  const [chatbot, setChatbot] = useState<CourseChatbotSystem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeChatbot()
      .then(setChatbot)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const askQuestion = useCallback(async (
    question: string,
    context?: any
  ): Promise<ChatResponse | null> => {
    if (!chatbot) return null;
    
    try {
      return await chatbot.query(question, context);
    } catch (err) {
      console.error('Chatbot query error:', err);
      return null;
    }
  }, [chatbot]);

  return { chatbot, askQuestion, loading, error };
}

// ============================================================================
// API Route Example (Next.js)
// ============================================================================

/**
 * Example API route handler for chatbot queries
 */
export async function chatbotApiHandler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { question, context } = await req.json();
    
    if (!question) {
      return new Response('Question is required', { status: 400 });
    }

    const chatbot = await initializeChatbot();
    const response = await chatbot.query(question, context);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Chatbot API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

// ============================================================================
// Batch Processing Example
// ============================================================================

export async function batchProcessAllCourses() {
  // This would typically fetch from your database
  const courses: Course[] = []; // Fetch courses from Firestore
  
  // Process in batches to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < courses.length; i += batchSize) {
    const batch = courses.slice(i, i + batchSize);
    await indexCourseContent(batch);
    
    // Add delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Note: Add these imports at the top of your actual implementation
// import { useState, useEffect, useCallback } from 'react';
// import type { ChatResponse, CourseChatbotSystem } from './index';