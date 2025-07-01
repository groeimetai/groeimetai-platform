import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// import { getServerSession } from 'next-auth'; // Uncomment when using NextAuth
import apiSandbox, { ApiProvider } from '@/services/apiSandboxService';

// Environment variables for API keys
const API_KEYS = {
  openai: process.env.OPENAI_API_KEY,
  anthropic: process.env.ANTHROPIC_API_KEY,
  google: process.env.GOOGLE_API_KEY,
  cohere: process.env.COHERE_API_KEY,
  huggingface: process.env.HUGGINGFACE_API_KEY,
};

// Request validation schema
const requestSchema = z.object({
  endpoint: z.string(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
  headers: z.record(z.string()).optional(),
  body: z.any().optional(),
});

// Provider configurations
const PROVIDER_CONFIGS: Record<string, {
  baseUrl: string;
  authHeader: (apiKey: string) => Record<string, string>;
}> = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    authHeader: (apiKey: string) => ({
      'Authorization': `Bearer ${apiKey}`,
    }),
  },
  anthropic: {
    baseUrl: 'https://api.anthropic.com/v1',
    authHeader: (apiKey: string) => ({
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    }),
  },
  google: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1',
    authHeader: (apiKey: string) => ({
      'x-goog-api-key': apiKey,
    }),
  },
  cohere: {
    baseUrl: 'https://api.cohere.ai/v1',
    authHeader: (apiKey: string) => ({
      'Authorization': `Bearer ${apiKey}`,
    }),
  },
  huggingface: {
    baseUrl: 'https://api-inference.huggingface.co',
    authHeader: (apiKey: string) => ({
      'Authorization': `Bearer ${apiKey}`,
    }),
  },
};

// IP Whitelist (optional)
const IP_WHITELIST = process.env.API_SANDBOX_IP_WHITELIST?.split(',') || [];

export async function POST(
  req: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const { provider } = params;

    // Validate provider
    if (!PROVIDER_CONFIGS[provider]) {
      return NextResponse.json(
        { error: `Unknown provider: ${provider}` },
        { status: 400 }
      );
    }

    // Check IP whitelist if configured
    if (IP_WHITELIST.length > 0) {
      const clientIp = req.headers.get('x-forwarded-for') || 
                      req.headers.get('x-real-ip') || 
                      'unknown';
      
      if (!IP_WHITELIST.includes(clientIp)) {
        return NextResponse.json(
          { error: 'IP not whitelisted' },
          { status: 403 }
        );
      }
    }

    // Get session (if using NextAuth)
    // const session = await getServerSession();
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    // Parse and validate request
    const body = await req.json();
    const validatedData = requestSchema.parse(body);

    // Get API key for provider
    const apiKey = API_KEYS[provider as keyof typeof API_KEYS];
    
    if (!apiKey || apiKey === 'mock') {
      // Return mock response if no API key
      return NextResponse.json({
        success: true,
        data: {
          message: `Mock response from ${provider}`,
          timestamp: new Date().toISOString(),
          provider,
          endpoint: validatedData.endpoint,
        },
        usage: {
          promptTokens: 10,
          completionTokens: 15,
          totalTokens: 25,
          cost: 0.0001,
        },
      });
    }

    // Build full URL
    const config = PROVIDER_CONFIGS[provider];
    const url = `${config.baseUrl}${validatedData.endpoint}`;

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      ...config.authHeader(apiKey),
      ...validatedData.headers,
    };

    // Make request to actual API
    const response = await fetch(url, {
      method: validatedData.method,
      headers,
      body: validatedData.body ? JSON.stringify(validatedData.body) : undefined,
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    // Handle response
    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        {
          success: false,
          error: `${provider} API error`,
          details: errorData,
          status: response.status,
        },
        { status: response.status }
      );
    }

    // Parse response
    const responseData = await response.json();

    // Calculate usage metrics (provider-specific)
    const usage = calculateUsageMetrics(provider, validatedData, responseData);

    return NextResponse.json({
      success: true,
      data: responseData,
      usage,
    });

  } catch (error) {
    console.error('API Sandbox error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid request',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Request timeout',
          message: 'Request took longer than 30 seconds',
        },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Calculate usage metrics based on provider response
function calculateUsageMetrics(provider: string, request: any, response: any) {
  let usage = {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    cost: 0,
  };

  switch (provider) {
    case 'openai':
      if (response.usage) {
        usage.promptTokens = response.usage.prompt_tokens || 0;
        usage.completionTokens = response.usage.completion_tokens || 0;
        usage.totalTokens = response.usage.total_tokens || 0;
        
        // Simplified cost calculation
        const model = request.body?.model || 'gpt-3.5-turbo';
        if (model.includes('gpt-4')) {
          usage.cost = (usage.promptTokens * 0.00003) + (usage.completionTokens * 0.00006);
        } else {
          usage.cost = (usage.promptTokens * 0.0000015) + (usage.completionTokens * 0.000002);
        }
      }
      break;

    case 'anthropic':
      if (response.usage) {
        usage.promptTokens = response.usage.input_tokens || 0;
        usage.completionTokens = response.usage.output_tokens || 0;
        usage.totalTokens = usage.promptTokens + usage.completionTokens;
        
        const model = request.body?.model || 'claude-3-haiku';
        if (model.includes('opus')) {
          usage.cost = (usage.promptTokens * 0.000015) + (usage.completionTokens * 0.000075);
        } else if (model.includes('sonnet')) {
          usage.cost = (usage.promptTokens * 0.000003) + (usage.completionTokens * 0.000015);
        } else {
          usage.cost = (usage.promptTokens * 0.0000025) + (usage.completionTokens * 0.00000125);
        }
      }
      break;

    case 'google':
      if (response.usageMetadata) {
        usage.promptTokens = response.usageMetadata.promptTokenCount || 0;
        usage.completionTokens = response.usageMetadata.candidatesTokenCount || 0;
        usage.totalTokens = response.usageMetadata.totalTokenCount || 0;
        usage.cost = usage.totalTokens * 0.000001; // Simplified pricing
      }
      break;

    case 'cohere':
      if (response.meta) {
        usage.totalTokens = response.meta.billed_units?.input_tokens || 0;
        usage.promptTokens = usage.totalTokens;
        usage.cost = usage.totalTokens * 0.000001;
      }
      break;

    case 'huggingface':
      // HuggingFace typically doesn't provide token counts
      usage.totalTokens = 100; // Estimate
      usage.cost = 0; // Free tier
      break;
  }

  return usage;
}

// GET endpoint for checking sandbox status
export async function GET(
  req: NextRequest,
  { params }: { params: { provider: string } }
) {
  const { provider } = params;

  if (!PROVIDER_CONFIGS[provider]) {
    return NextResponse.json(
      { error: `Unknown provider: ${provider}` },
      { status: 400 }
    );
  }

  const apiKey = API_KEYS[provider as keyof typeof API_KEYS];
  const isConfigured = !!apiKey && apiKey !== 'mock';

  return NextResponse.json({
    provider,
    configured: isConfigured,
    mockMode: !isConfigured,
    models: apiSandbox.getAvailableModels(provider as ApiProvider['name']),
    endpoints: getProviderEndpoints(provider),
  });
}

// Get available endpoints for a provider
function getProviderEndpoints(provider: string): string[] {
  const endpoints: Record<string, string[]> = {
    openai: [
      '/chat/completions',
      '/completions',
      '/embeddings',
      '/images/generations',
      '/images/edits',
      '/images/variations',
      '/audio/transcriptions',
      '/audio/translations',
      '/moderations',
    ],
    anthropic: [
      '/messages',
      '/complete',
    ],
    google: [
      '/models/gemini-pro:generateContent',
      '/models/gemini-pro:streamGenerateContent',
      '/models/gemini-pro-vision:generateContent',
      '/models/embedding-001:embedContent',
    ],
    cohere: [
      '/generate',
      '/embed',
      '/classify',
      '/tokenize',
      '/detokenize',
      '/summarize',
    ],
    huggingface: [
      '/models/{model}',
    ],
  };

  return endpoints[provider] || [];
}