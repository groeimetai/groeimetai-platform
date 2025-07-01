import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

export interface ApiProvider {
  name: 'openai' | 'anthropic' | 'google' | 'cohere' | 'huggingface';
  baseUrl: string;
  models: string[];
  headers: Record<string, string>;
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  costPerRequest: number;
  maxBudget: number;
}

export interface UsageMetrics {
  totalRequests: number;
  totalCost: number;
  requestsByProvider: Record<string, number>;
  lastRequestAt: Date | null;
  errors: number;
}

export interface SandboxRequest {
  provider: ApiProvider['name'];
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

export interface SandboxResponse {
  success: boolean;
  data?: any;
  error?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    cost?: number;
  };
  cached?: boolean;
  duration?: number;
}

const API_PROVIDERS: Record<string, ApiProvider> = {
  openai: {
    name: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'dall-e-3', 'whisper-1'],
    headers: {
      'Content-Type': 'application/json',
    },
  },
  anthropic: {
    name: 'anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku', 'claude-2.1'],
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
  },
  google: {
    name: 'google',
    baseUrl: 'https://generativelanguage.googleapis.com/v1',
    models: ['gemini-pro', 'gemini-pro-vision', 'gemini-ultra'],
    headers: {
      'Content-Type': 'application/json',
    },
  },
  cohere: {
    name: 'cohere',
    baseUrl: 'https://api.cohere.ai/v1',
    models: ['command', 'command-light', 'command-nightly'],
    headers: {
      'Content-Type': 'application/json',
    },
  },
  huggingface: {
    name: 'huggingface',
    baseUrl: 'https://api-inference.huggingface.co',
    models: ['gpt2', 'bert-base-uncased', 'stable-diffusion-v1-5'],
    headers: {
      'Content-Type': 'application/json',
    },
  },
};

const DEFAULT_RATE_LIMITS: RateLimitConfig = {
  requestsPerMinute: 10,
  requestsPerHour: 100,
  requestsPerDay: 1000,
  costPerRequest: 0.001,
  maxBudget: 10.0,
};

// Simple encryption utilities for browser environment
// In production, use a proper client-side encryption library
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-encryption-key-change-in-production';

function encrypt(text: string): string {
  // Simple obfuscation for demo - in production use proper encryption
  try {
    const encoded = btoa(text);
    const shifted = encoded.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) + (i % 10))
    ).join('');
    return btoa(shifted);
  } catch (e) {
    console.error('Encryption error:', e);
    return text;
  }
}

function decrypt(text: string): string {
  // Simple deobfuscation for demo - in production use proper encryption
  try {
    const shifted = atob(text);
    const decoded = shifted.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) - (i % 10))
    ).join('');
    return atob(decoded);
  } catch (e) {
    console.error('Decryption error:', e);
    return text;
  }
}

// Request sanitization
function sanitizeRequest(request: any): any {
  // Remove potential prompt injection patterns
  const dangerousPatterns = [
    /ignore previous instructions/gi,
    /disregard all prior/gi,
    /forget everything/gi,
    /system prompt/gi,
    /\bsudo\b/gi,
    /\bexec\b/gi,
    /<script[^>]*>/gi,
    /javascript:/gi,
  ];

  let sanitized = JSON.stringify(request);
  
  dangerousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[SANITIZED]');
  });

  return JSON.parse(sanitized);
}

// Rate limiting cache
const rateLimitCache = new Map<string, {
  requests: { timestamp: number }[];
  totalCost: number;
}>();

class ApiSandboxService {
  private mockMode: boolean = false;
  private responseCache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 15 * 60 * 1000; // 15 minutes

  constructor() {
    // Initialize service
    this.setupCleanupInterval();
  }

  private setupCleanupInterval() {
    // Clean up old cache entries every 5 minutes
    setInterval(() => {
      const now = Date.now();
      this.responseCache.forEach((value, key) => {
        if (now - value.timestamp > this.cacheTimeout) {
          this.responseCache.delete(key);
        }
      });
    }, 5 * 60 * 1000);
  }

  async initializeStudent(userId: string, config?: Partial<RateLimitConfig>) {
    const userDoc = doc(db, 'apiSandbox', userId);
    const rateLimits = { ...DEFAULT_RATE_LIMITS, ...config };
    
    await setDoc(userDoc, {
      userId,
      rateLimits,
      usage: {
        totalRequests: 0,
        totalCost: 0,
        requestsByProvider: {},
        lastRequestAt: null,
        errors: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }, { merge: true });
  }

  async checkRateLimit(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const userCache = rateLimitCache.get(userId) || { requests: [], totalCost: 0 };
    const now = Date.now();
    
    // Clean old requests
    userCache.requests = userCache.requests.filter(req => {
      const age = now - req.timestamp;
      return age < 24 * 60 * 60 * 1000; // Keep last 24 hours
    });

    // Get user config from database
    const userDoc = await getDoc(doc(db, 'apiSandbox', userId));
    const config = userDoc.data()?.rateLimits || DEFAULT_RATE_LIMITS;

    // Check rate limits
    const lastMinute = userCache.requests.filter(req => now - req.timestamp < 60 * 1000);
    const lastHour = userCache.requests.filter(req => now - req.timestamp < 60 * 60 * 1000);
    const lastDay = userCache.requests.filter(req => now - req.timestamp < 24 * 60 * 60 * 1000);

    if (lastMinute.length >= config.requestsPerMinute) {
      return { allowed: false, reason: 'Rate limit exceeded: too many requests per minute' };
    }

    if (lastHour.length >= config.requestsPerHour) {
      return { allowed: false, reason: 'Rate limit exceeded: too many requests per hour' };
    }

    if (lastDay.length >= config.requestsPerDay) {
      return { allowed: false, reason: 'Rate limit exceeded: too many requests per day' };
    }

    if (userCache.totalCost >= config.maxBudget) {
      return { allowed: false, reason: 'Budget exceeded: maximum spending limit reached' };
    }

    return { allowed: true };
  }

  async makeRequest(userId: string, request: SandboxRequest): Promise<SandboxResponse> {
    const startTime = Date.now();

    try {
      // Sanitize request
      const sanitizedRequest = sanitizeRequest(request);

      // Check rate limits
      const rateLimitCheck = await this.checkRateLimit(userId);
      if (!rateLimitCheck.allowed) {
        return {
          success: false,
          error: rateLimitCheck.reason,
        };
      }

      // Check cache
      const cacheKey = `${request.provider}:${request.endpoint}:${JSON.stringify(request.body)}`;
      const cached = this.responseCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return {
          success: true,
          data: cached.data,
          cached: true,
          duration: Date.now() - startTime,
        };
      }

      // Get provider config
      const provider = API_PROVIDERS[request.provider];
      if (!provider) {
        return {
          success: false,
          error: `Unknown provider: ${request.provider}`,
        };
      }

      // Handle mock mode
      if (this.mockMode) {
        return this.getMockResponse(request);
      }

      // Make actual API request with timeout
      const timeout = request.timeout || 30000; // Default 30s timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(`/api/sandbox/${request.provider}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint: request.endpoint,
            method: request.method,
            headers: request.headers,
            body: sanitizedRequest.body,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`API request failed: ${response.statusText}`);
        }

        const data = await response.json();

        // Cache successful response
        this.responseCache.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });

        // Update usage metrics
        await this.updateUsage(userId, request.provider, data.usage?.cost || DEFAULT_RATE_LIMITS.costPerRequest);

        return {
          success: true,
          data: data.data,
          usage: data.usage,
          duration: Date.now() - startTime,
        };
      } catch (error: any) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout',
          };
        }
        throw error;
      }
    } catch (error: any) {
      // Update error count
      await this.updateUsage(userId, request.provider, 0, true);

      return {
        success: false,
        error: error.message || 'Unknown error occurred',
        duration: Date.now() - startTime,
      };
    }
  }

  private async updateUsage(userId: string, provider: string, cost: number, isError: boolean = false) {
    // Update cache
    const userCache = rateLimitCache.get(userId) || { requests: [], totalCost: 0 };
    userCache.requests.push({ timestamp: Date.now() });
    userCache.totalCost += cost;
    rateLimitCache.set(userId, userCache);

    // Update database
    const userDoc = doc(db, 'apiSandbox', userId);
    await updateDoc(userDoc, {
      'usage.totalRequests': increment(1),
      'usage.totalCost': increment(cost),
      [`usage.requestsByProvider.${provider}`]: increment(1),
      'usage.lastRequestAt': new Date(),
      ...(isError && { 'usage.errors': increment(1) }),
      updatedAt: new Date(),
    });
  }

  async getUsageMetrics(userId: string): Promise<UsageMetrics> {
    const userDoc = await getDoc(doc(db, 'apiSandbox', userId));
    return userDoc.data()?.usage || {
      totalRequests: 0,
      totalCost: 0,
      requestsByProvider: {},
      lastRequestAt: null,
      errors: 0,
    };
  }

  async storeApiKey(userId: string, provider: string, apiKey: string) {
    const encryptedKey = encrypt(apiKey);
    const userDoc = doc(db, 'apiSandbox', userId);
    
    await updateDoc(userDoc, {
      [`apiKeys.${provider}`]: encryptedKey,
      updatedAt: new Date(),
    });
  }

  async getApiKey(userId: string, provider: string): Promise<string | null> {
    const userDoc = await getDoc(doc(db, 'apiSandbox', userId));
    const encryptedKey = userDoc.data()?.apiKeys?.[provider];
    
    if (!encryptedKey) return null;
    
    return decrypt(encryptedKey);
  }

  enableMockMode() {
    this.mockMode = true;
  }

  disableMockMode() {
    this.mockMode = false;
  }

  private getMockResponse(request: SandboxRequest): SandboxResponse {
    // Simulate network delay
    const delay = Math.random() * 500 + 200;

    // Generate mock responses based on provider and endpoint
    const mockResponses: Record<string, any> = {
      'openai:/chat/completions': {
        id: 'mock-chat-completion',
        object: 'chat.completion',
        created: Date.now(),
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: 'This is a mock response from the OpenAI sandbox.',
          },
          finish_reason: 'stop',
        }],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 15,
          total_tokens: 25,
        },
      },
      'anthropic:/messages': {
        id: 'mock-message',
        type: 'message',
        role: 'assistant',
        content: [{
          type: 'text',
          text: 'This is a mock response from the Anthropic sandbox.',
        }],
        model: 'claude-3-haiku',
        usage: {
          input_tokens: 10,
          output_tokens: 15,
        },
      },
      'google:/models/gemini-pro:generateContent': {
        candidates: [{
          content: {
            parts: [{
              text: 'This is a mock response from the Google Gemini sandbox.',
            }],
            role: 'model',
          },
          finishReason: 'STOP',
        }],
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 15,
          totalTokenCount: 25,
        },
      },
    };

    const mockKey = `${request.provider}:${request.endpoint}`;
    const mockData = mockResponses[mockKey] || {
      message: 'Mock response',
      timestamp: new Date().toISOString(),
      provider: request.provider,
    };

    return {
      success: true,
      data: mockData,
      usage: {
        promptTokens: 10,
        completionTokens: 15,
        totalTokens: 25,
        cost: 0.0001,
      },
      cached: false,
      duration: delay,
    };
  }

  // Error simulation for testing
  simulateError(errorType: 'timeout' | 'rate-limit' | 'auth' | 'server') {
    switch (errorType) {
      case 'timeout':
        throw new Error('Request timeout after 30000ms');
      case 'rate-limit':
        throw new Error('Rate limit exceeded');
      case 'auth':
        throw new Error('Authentication failed');
      case 'server':
        throw new Error('Internal server error');
    }
  }

  // Get available models for a provider
  getAvailableModels(provider: ApiProvider['name']): string[] {
    return API_PROVIDERS[provider]?.models || [];
  }

  // Get all available providers
  getProviders(): ApiProvider[] {
    return Object.values(API_PROVIDERS);
  }

  // Calculate estimated cost
  calculateEstimatedCost(provider: string, model: string, tokens: number): number {
    // Simplified cost calculation - in production, use actual pricing
    const costPerToken: Record<string, number> = {
      'openai:gpt-4': 0.00003,
      'openai:gpt-3.5-turbo': 0.000002,
      'anthropic:claude-3-opus': 0.00003,
      'anthropic:claude-3-sonnet': 0.00001,
      'google:gemini-pro': 0.000001,
    };

    const key = `${provider}:${model}`;
    const rate = costPerToken[key] || 0.000001;
    
    return tokens * rate;
  }
}

export const apiSandbox = new ApiSandboxService();
export default apiSandbox;