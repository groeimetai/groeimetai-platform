import { NextRequest, NextResponse } from 'next/server';
import { getRealChatbot } from '@/lib/rag/real-chatbot';
import { mockChatQuery } from '@/lib/rag/mock-chatbot';

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function POST(request: NextRequest) {
  try {
    // Get user IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    
    // Check rate limit (10 requests per minute)
    const now = Date.now();
    const userLimit = rateLimitMap.get(ip);
    
    if (userLimit) {
      if (now < userLimit.resetTime) {
        if (userLimit.count >= 10) {
          return NextResponse.json(
            { error: 'Rate limit exceeded. Please try again later.' },
            { status: 429 }
          );
        }
        userLimit.count++;
      } else {
        userLimit.count = 1;
        userLimit.resetTime = now + 60000; // Reset after 1 minute
      }
    } else {
      rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    }

    // Parse request body
    const body = await request.json();
    const { message, userId, sessionId, context = {} } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    let response;
    
    // Check if we have the required API keys
    if (process.env.OPENAI_API_KEY && process.env.PINECONE_API_KEY) {
      try {
        // Use real chatbot with RAG
        const chatbot = getRealChatbot();
        response = await chatbot.processQuery(message, {
          language: context.language || 'nl',
          userId,
          sessionId,
        });
      } catch (error) {
        console.error('Real chatbot error:', error);
        // Fallback to mock if real chatbot fails
        response = await mockChatQuery(message, context);
      }
    } else {
      // Use mock chatbot if API keys are not configured
      console.log('Using mock chatbot - configure OPENAI_API_KEY and PINECONE_API_KEY for real responses');
      response = await mockChatQuery(message, context);
    }

    // Stream response if supported
    if (request.headers.get('accept') === 'text/event-stream') {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          // Send response in chunks
          const words = response.answer.split(' ');
          for (const word of words) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ word: word + ' ' })}\n\n`)
            );
            // Small delay for streaming effect
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          
          // Send final message with metadata
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              done: true, 
              recommendations: response.recommendations,
              relatedCourses: response.relatedCourses,
              intent: response.intent,
              sources: response.sources
            })}\n\n`)
          );
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Regular JSON response
    return NextResponse.json({
      answer: response.answer,
      recommendations: response.recommendations,
      relatedCourses: response.relatedCourses,
      intent: response.intent,
      sessionId: sessionId || crypto.randomUUID(),
      sources: response.sources,
      mode: process.env.OPENAI_API_KEY && process.env.PINECONE_API_KEY ? 'real' : 'mock',
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mode: process.env.OPENAI_API_KEY && process.env.PINECONE_API_KEY ? 'real' : 'mock',
    config: {
      openai: !!process.env.OPENAI_API_KEY,
      pinecone: !!process.env.PINECONE_API_KEY,
      pineconeIndex: process.env.PINECONE_INDEX || 'groeimetai-courses',
    }
  });
}