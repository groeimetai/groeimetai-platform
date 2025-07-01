import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAI } from 'openai';

export interface ChatResponse {
  answer: string;
  intent: string;
  relatedCourses?: string[];
  recommendations?: any[];
  sources?: any[];
}

export class RealCourseChatbot {
  private pinecone: Pinecone;
  private openai: OpenAI;
  private index: any;

  constructor() {
    // Initialize OpenAI
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not found');
    }
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Initialize Pinecone
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY not found');
    }
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
  }

  async initialize() {
    const indexName = process.env.PINECONE_INDEX || 'groeimetai-courses';
    this.index = this.pinecone.index(indexName);
  }

  async searchContext(query: string, topK: number = 5) {
    try {
      // Generate embedding for the query
      const embeddingResponse = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query,
        dimensions: 1024, // Match je Pinecone index dimensie!
      });
      const queryEmbedding = embeddingResponse.data[0].embedding;

      // Search in Pinecone
      const searchResults = await this.index.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
      });

      return searchResults.matches || [];
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  async generateResponse(query: string, context: any[], language: string = 'nl') {
    // Prepare context from search results
    const contextText = context
      .map(match => {
        const metadata = match.metadata;
        return `Course: ${metadata.courseId}, Lesson: ${metadata.lessonTitle}\n${metadata.content}`;
      })
      .join('\n\n---\n\n');

    // Create system prompt
    const systemPrompt = language === 'nl' 
      ? `Je bent een AI-assistent voor het GroeimetAI leerplatform. Je helpt studenten met het vinden van de juiste cursussen, het beantwoorden van vragen over AI-onderwerpen, en het maken van studieplanning. 

Gebruik de volgende context uit onze cursussen om je antwoorden te baseren:

${contextText}

Belangrijke richtlijnen:
- Geef specifieke voorbeelden uit de cursussen
- Verwijs naar relevante lessen wanneer mogelijk
- Wees behulpzaam en moedig leren aan
- Als je het antwoord niet weet op basis van de context, geef dat eerlijk aan`
      : `You are an AI assistant for the GroeimetAI learning platform. You help students find the right courses, answer questions about AI topics, and create study plans.

Use the following context from our courses to base your answers on:

${contextText}

Important guidelines:
- Give specific examples from the courses
- Reference relevant lessons when possible
- Be helpful and encourage learning
- If you don't know the answer based on the context, be honest about it`;

    try {
      // Generate response using GPT
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo-0125', // Veel goedkoper dan GPT-4, maar nog steeds goed
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: false,
      });

      return completion.choices[0].message.content || 'Sorry, ik kon geen antwoord genereren.';
    } catch (error) {
      console.error('OpenAI error:', error);
      throw error;
    }
  }

  async processQuery(query: string, options: any = {}): Promise<ChatResponse> {
    try {
      // Initialize if not already done
      if (!this.index) {
        await this.initialize();
      }

      // Search for relevant context
      const searchResults = await this.searchContext(query, 5);
      
      // Detect intent based on query
      const intent = this.detectIntent(query);
      
      // Generate response
      const answer = await this.generateResponse(
        query, 
        searchResults,
        options.language || 'nl'
      );

      // Extract course references from search results
      const relatedCourses = [...new Set(
        searchResults
          .filter(match => match.metadata?.courseId)
          .map(match => match.metadata.courseId)
      )];

      return {
        answer,
        intent,
        relatedCourses,
        sources: searchResults.map(match => ({
          courseId: match.metadata?.courseId,
          lessonTitle: match.metadata?.lessonTitle,
          score: match.score,
        })),
      };
    } catch (error) {
      console.error('Query processing error:', error);
      
      // Fallback response
      return {
        answer: 'Sorry, er ging iets mis bij het verwerken van je vraag. Probeer het opnieuw of check of de API keys correct zijn geconfigureerd.',
        intent: 'error',
        relatedCourses: [],
      };
    }
  }

  private detectIntent(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('cursus') || lowerQuery.includes('course') || 
        lowerQuery.includes('aanbevel') || lowerQuery.includes('recommend')) {
      return 'course_selection';
    }
    
    if (lowerQuery.includes('leerpad') || lowerQuery.includes('learning path') ||
        lowerQuery.includes('studieplan') || lowerQuery.includes('study plan')) {
      return 'learning_path';
    }
    
    if (lowerQuery.includes('wat is') || lowerQuery.includes('what is') ||
        lowerQuery.includes('hoe werkt') || lowerQuery.includes('how does')) {
      return 'content_question';
    }
    
    if (lowerQuery.includes('prijs') || lowerQuery.includes('price') ||
        lowerQuery.includes('kost') || lowerQuery.includes('cost')) {
      return 'pricing';
    }
    
    return 'general';
  }
}

// Export singleton instance
let chatbotInstance: RealCourseChatbot | null = null;

export function getRealChatbot(): RealCourseChatbot {
  if (!chatbotInstance) {
    chatbotInstance = new RealCourseChatbot();
  }
  return chatbotInstance;
}