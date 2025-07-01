import { NextResponse } from 'next/server';

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {
      envVariables: {
        openAI: !!process.env.OPENAI_API_KEY,
        pinecone: !!process.env.PINECONE_API_KEY,
        redis: !!process.env.REDIS_URL,
        firebase: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        mollie: !!process.env.MOLLIE_API_KEY,
      },
      services: {
        chatEndpoint: false,
        searchEndpoint: false,
        recommendEndpoint: false,
        healthEndpoint: false,
      },
      features: {
        chatbot: false,
        courseSearch: false,
        recommendations: false,
        indexing: false,
      }
    }
  };

  // Test health endpoint
  try {
    const healthUrl = new URL('/api/health', process.env.NEXT_PUBLIC_API_URL || `http://localhost:${process.env.PORT || 3000}`);
    const healthResponse = await fetch(healthUrl.toString());
    results.checks.services.healthEndpoint = healthResponse.ok;
  } catch (error) {
    console.error('Health check failed:', error);
  }

  // Test chat endpoint (without making actual API call)
  results.checks.services.chatEndpoint = !!process.env.OPENAI_API_KEY;
  results.checks.features.chatbot = !!process.env.OPENAI_API_KEY && !!process.env.PINECONE_API_KEY;

  // Test search/recommend endpoints
  results.checks.services.searchEndpoint = !!process.env.PINECONE_API_KEY;
  results.checks.services.recommendEndpoint = !!process.env.OPENAI_API_KEY;
  results.checks.features.courseSearch = !!process.env.PINECONE_API_KEY;
  results.checks.features.recommendations = !!process.env.OPENAI_API_KEY;

  // Test Redis connection (without actually connecting)
  results.checks.features.indexing = !!process.env.REDIS_URL;

  // Calculate overall status
  const allChecks = [
    ...Object.values(results.checks.envVariables),
    ...Object.values(results.checks.services),
    ...Object.values(results.checks.features),
  ];
  const passedChecks = allChecks.filter(Boolean).length;
  const totalChecks = allChecks.length;
  const status = passedChecks === totalChecks ? 'healthy' : 
                 passedChecks > totalChecks / 2 ? 'partial' : 'unhealthy';

  return NextResponse.json({
    ...results,
    summary: {
      status,
      passed: passedChecks,
      total: totalChecks,
      percentage: Math.round((passedChecks / totalChecks) * 100),
    },
    recommendations: getRecommendations(results.checks),
  });
}

function getRecommendations(checks: any): string[] {
  const recommendations = [];

  if (!checks.envVariables.openAI) {
    recommendations.push('Set OPENAI_API_KEY in .env.local for chatbot functionality');
  }
  if (!checks.envVariables.pinecone) {
    recommendations.push('Set PINECONE_API_KEY in .env.local for search functionality');
  }
  if (!checks.envVariables.redis) {
    recommendations.push('Set REDIS_URL in .env.local or run: docker run -d -p 6379:6379 redis:alpine');
  }
  if (!checks.envVariables.firebase) {
    recommendations.push('Set Firebase configuration in .env.local for authentication');
  }
  if (!checks.envVariables.mollie) {
    recommendations.push('Set MOLLIE_API_KEY in .env.local for payment processing');
  }

  if (recommendations.length === 0) {
    recommendations.push('All services configured! Run npm run index-courses to index course content.');
  }

  return recommendations;
}