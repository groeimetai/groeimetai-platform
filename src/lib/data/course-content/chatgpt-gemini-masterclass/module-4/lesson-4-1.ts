import type { Lesson } from '@/lib/data/courses'
import { ApiPlayground } from '@/components/ApiPlayground'
import { CodeSandbox } from '@/components/CodeSandbox'
import { CodingChallenge } from '@/components/LiveCoding/CodingChallenge'

export const lesson4_1: Lesson = {
  id: 'lesson-4-1',
  title: 'API Integration Best Practices',
  duration: '60 minuten',
  content: `
## API Integration Best Practices

In deze les leren we essentiële best practices voor API integratie, inclusief rate limiting, webhook security, error handling en cost optimization.

### 1. Rate Limiting met Token Bucket Algorithm (150 lines)

De Token Bucket is een populair algoritme voor rate limiting dat tokens gebruikt om API calls te beperken.

#### Token Bucket Implementatie

\`\`\`typescript
// Token Bucket implementation for rate limiting
class TokenBucket {
  private capacity: number;
  private tokens: number;
  private refillRate: number;
  private lastRefill: number;
  
  constructor(capacity: number, refillPerSecond: number) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = refillPerSecond;
    this.lastRefill = Date.now();
  }
  
  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000; // Convert to seconds
    const tokensToAdd = elapsed * this.refillRate;
    
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
  
  consume(tokens: number = 1): boolean {
    this.refill();
    
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    
    return false;
  }
  
  getWaitTime(tokens: number = 1): number {
    this.refill();
    
    if (this.tokens >= tokens) {
      return 0;
    }
    
    const deficit = tokens - this.tokens;
    return (deficit / this.refillRate) * 1000; // Return milliseconds
  }
  
  getAvailableTokens(): number {
    this.refill();
    return Math.floor(this.tokens);
  }
}

// Advanced rate limiter with multiple buckets
class MultiTierRateLimiter {
  private buckets: Map<string, TokenBucket>;
  private globalBucket: TokenBucket;
  
  constructor(globalLimit: number, globalRefill: number) {
    this.buckets = new Map();
    this.globalBucket = new TokenBucket(globalLimit, globalRefill);
  }
  
  addUserBucket(userId: string, capacity: number, refillRate: number): void {
    this.buckets.set(userId, new TokenBucket(capacity, refillRate));
  }
  
  async checkLimit(userId: string, tokens: number = 1): Promise<{
    allowed: boolean;
    waitTime: number;
    reason?: string;
  }> {
    // Check global limit first
    if (!this.globalBucket.consume(tokens)) {
      return {
        allowed: false,
        waitTime: this.globalBucket.getWaitTime(tokens),
        reason: 'Global rate limit exceeded'
      };
    }
    
    // Check user-specific limit
    const userBucket = this.buckets.get(userId);
    if (!userBucket) {
      // Create default bucket for new user
      this.addUserBucket(userId, 60, 1); // 60 requests per minute
      return { allowed: true, waitTime: 0 };
    }
    
    if (!userBucket.consume(tokens)) {
      // Restore global token since user limit failed
      this.globalBucket.consume(-tokens);
      
      return {
        allowed: false,
        waitTime: userBucket.getWaitTime(tokens),
        reason: 'User rate limit exceeded'
      };
    }
    
    return { allowed: true, waitTime: 0 };
  }
  
  getStatus(userId?: string): object {
    const status: any = {
      global: {
        available: this.globalBucket.getAvailableTokens(),
        capacity: 1000 // Example capacity
      }
    };
    
    if (userId) {
      const userBucket = this.buckets.get(userId);
      if (userBucket) {
        status.user = {
          available: userBucket.getAvailableTokens(),
          capacity: 60
        };
      }
    }
    
    return status;
  }
}

// Usage example with API client
class RateLimitedAPIClient {
  private rateLimiter: MultiTierRateLimiter;
  
  constructor() {
    // 1000 global requests per minute, 60 per user
    this.rateLimiter = new MultiTierRateLimiter(1000, 16.67);
  }
  
  async makeRequest(userId: string, endpoint: string, data: any): Promise<any> {
    const limit = await this.rateLimiter.checkLimit(userId);
    
    if (!limit.allowed) {
      throw new Error(
        \`Rate limit exceeded: \${limit.reason}. Retry after \${Math.ceil(limit.waitTime / 1000)} seconds\`
      );
    }
    
    try {
      // Make actual API request
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      return await response.json();
    } catch (error) {
      // On error, refund the token
      await this.rateLimiter.checkLimit(userId, -1);
      throw error;
    }
  }
}
\`\`\`

#### Test de Rate Limiter

<ApiPlayground
  initialProvider="openai"
  initialEndpoint="/chat/completions"
  courseId="rate-limiting-demo"
  initialBody={\`{
  "model": "gpt-3.5-turbo",
  "messages": [
    {
      "role": "system", 
      "content": "You are a rate limiting expert. Explain token bucket algorithm benefits."
    },
    {
      "role": "user",
      "content": "Why is token bucket better than fixed window rate limiting?"
    }
  ]
}\`}
/>

### 2. Webhook Security met HMAC (100 lines)

HMAC (Hash-based Message Authentication Code) zorgt voor veilige webhook communicatie.

#### HMAC Webhook Implementation

\`\`\`typescript
import crypto from 'crypto';

// Webhook security with HMAC
class WebhookSecurity {
  private secret: string;
  
  constructor(secret: string) {
    if (!secret || secret.length < 32) {
      throw new Error('Webhook secret must be at least 32 characters');
    }
    this.secret = secret;
  }
  
  generateSignature(payload: any): string {
    const data = typeof payload === 'string' 
      ? payload 
      : JSON.stringify(payload);
    
    return crypto
      .createHmac('sha256', this.secret)
      .update(data, 'utf8')
      .digest('hex');
  }
  
  verifySignature(payload: any, signature: string): boolean {
    const expectedSignature = this.generateSignature(payload);
    
    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
  
  // Create webhook event with signature
  createWebhookEvent(event: string, data: any): {
    payload: any;
    headers: Record<string, string>;
  } {
    const timestamp = Date.now();
    const payload = {
      event,
      data,
      timestamp,
      id: crypto.randomUUID()
    };
    
    const signature = this.generateSignature(payload);
    
    return {
      payload,
      headers: {
        'X-Webhook-Signature': signature,
        'X-Webhook-Timestamp': timestamp.toString(),
        'X-Webhook-Event': event
      }
    };
  }
}

// Webhook receiver with security validation
class WebhookReceiver {
  private security: WebhookSecurity;
  private handlers: Map<string, Function>;
  
  constructor(secret: string) {
    this.security = new WebhookSecurity(secret);
    this.handlers = new Map();
  }
  
  on(event: string, handler: Function): void {
    this.handlers.set(event, handler);
  }
  
  async handleWebhook(
    body: any,
    headers: Record<string, string>
  ): Promise<{ success: boolean; message: string }> {
    // Verify signature
    const signature = headers['x-webhook-signature'];
    if (!signature) {
      return { success: false, message: 'Missing signature' };
    }
    
    if (!this.security.verifySignature(body, signature)) {
      return { success: false, message: 'Invalid signature' };
    }
    
    // Verify timestamp (prevent replay attacks)
    const timestamp = parseInt(headers['x-webhook-timestamp'] || '0');
    const age = Date.now() - timestamp;
    
    if (age > 300000) { // 5 minutes
      return { success: false, message: 'Webhook too old' };
    }
    
    // Process event
    const handler = this.handlers.get(body.event);
    if (!handler) {
      return { success: false, message: 'Unknown event type' };
    }
    
    try {
      await handler(body.data);
      return { success: true, message: 'Webhook processed' };
    } catch (error) {
      return { success: false, message: 'Handler error' };
    }
  }
}
\`\`\`

#### Test Webhook Security

<ApiPlayground
  initialProvider="custom"
  initialEndpoint="/webhook"
  courseId="webhook-security-demo"
  initialBody={\`{
  "event": "api.completion",
  "data": {
    "requestId": "req_123",
    "model": "gpt-3.5-turbo",
    "tokens": 250,
    "cost": 0.0005
  }
}\`}
  customHeaders={\`{
  "X-Webhook-Signature": "your-hmac-signature-here",
  "X-Webhook-Timestamp": "1234567890",
  "X-Webhook-Event": "api.completion"
}\`}
/>

### 3. Error Handling & Retries (100 lines)

Robuuste error handling met exponential backoff voor betrouwbare API integratie.

#### Advanced Error Handling

\`\`\`typescript
// Error types and retry strategies
enum ErrorType {
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  CLIENT_ERROR = 'CLIENT_ERROR',
  TIMEOUT = 'TIMEOUT'
}

interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  factor: number;
  jitter: boolean;
}

class APIError extends Error {
  constructor(
    public type: ErrorType,
    public statusCode?: number,
    public retryAfter?: number,
    message?: string
  ) {
    super(message);
  }
}

// Exponential backoff with jitter
class RetryManager {
  private config: RetryConfig;
  
  constructor(config: Partial<RetryConfig> = {}) {
    this.config = {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 30000,
      factor: 2,
      jitter: true,
      ...config
    };
  }
  
  calculateDelay(attempt: number, retryAfter?: number): number {
    if (retryAfter) {
      return retryAfter * 1000;
    }
    
    let delay = this.config.initialDelay * Math.pow(this.config.factor, attempt);
    delay = Math.min(delay, this.config.maxDelay);
    
    if (this.config.jitter) {
      // Add random jitter (±25%)
      const jitter = delay * 0.25;
      delay += (Math.random() - 0.5) * 2 * jitter;
    }
    
    return Math.floor(delay);
  }
  
  shouldRetry(error: APIError, attempt: number): boolean {
    if (attempt >= this.config.maxRetries) {
      return false;
    }
    
    // Don't retry client errors (4xx) except rate limits
    if (error.type === ErrorType.CLIENT_ERROR && 
        error.statusCode !== 429) {
      return false;
    }
    
    return true;
  }
}

// Resilient API client with retry logic
class ResilientAPIClient {
  private retryManager: RetryManager;
  
  constructor() {
    this.retryManager = new RetryManager();
  }
  
  private classifyError(error: any): APIError {
    if (error.response) {
      const status = error.response.status;
      
      if (status === 429) {
        return new APIError(
          ErrorType.RATE_LIMIT,
          status,
          error.response.headers['retry-after']
        );
      } else if (status >= 500) {
        return new APIError(ErrorType.SERVER_ERROR, status);
      } else if (status >= 400) {
        return new APIError(ErrorType.CLIENT_ERROR, status);
      }
    } else if (error.code === 'ECONNABORTED') {
      return new APIError(ErrorType.TIMEOUT);
    } else if (error.code) {
      return new APIError(ErrorType.NETWORK_ERROR);
    }
    
    return new APIError(ErrorType.NETWORK_ERROR);
  }
  
  async request<T>(
    fn: () => Promise<T>,
    context: string = 'API request'
  ): Promise<T> {
    let lastError: APIError | null = null;
    
    for (let attempt = 0; attempt <= this.retryManager.config.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = this.classifyError(error);
        
        if (!this.retryManager.shouldRetry(lastError, attempt)) {
          throw lastError;
        }
        
        const delay = this.retryManager.calculateDelay(
          attempt,
          lastError.retryAfter
        );
        
        console.log(
          \`\${context} failed (attempt \${attempt + 1}). Retrying in \${delay}ms...\`
        );
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError || new Error('Max retries exceeded');
  }
}
\`\`\`

### 4. Cost Optimization Tips (50 lines)

Praktische strategieën om API kosten te minimaliseren zonder functionaliteit te verliezen.

#### Cost Optimization Strategies

\`\`\`typescript
// Cost optimization utilities
class CostOptimizer {
  private modelCosts = {
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 }
  };
  
  // 1. Smart Model Selection
  selectOptimalModel(taskComplexity: number, budget: number): string {
    if (taskComplexity < 3 && budget < 0.01) {
      return 'gpt-3.5-turbo';
    } else if (taskComplexity < 7 && budget < 0.05) {
      return 'gpt-4-turbo';
    }
    return 'gpt-4';
  }
  
  // 2. Response Caching
  getCacheKey(prompt: string, model: string): string {
    return crypto
      .createHash('md5')
      .update(\`\${model}:\${prompt}\`)
      .digest('hex');
  }
  
  // 3. Prompt Optimization
  optimizePrompt(prompt: string): string {
    // Remove redundant whitespace
    let optimized = prompt.replace(/\\s+/g, ' ').trim();
    
    // Remove common filler words that don't affect output
    const fillers = ['please', 'could you', 'I would like'];
    fillers.forEach(filler => {
      optimized = optimized.replace(new RegExp(filler, 'gi'), '');
    });
    
    return optimized;
  }
  
  // 4. Batch Processing
  createBatch(prompts: string[], maxBatchSize: number = 20): string[][] {
    const batches: string[][] = [];
    for (let i = 0; i < prompts.length; i += maxBatchSize) {
      batches.push(prompts.slice(i, i + maxBatchSize));
    }
    return batches;
  }
  
  // 5. Token Estimation
  estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}

// Cost Optimization Best Practices:
// 1. Use gpt-3.5-turbo for simple tasks (80% cost reduction)
// 2. Implement aggressive caching for repeated queries
// 3. Batch similar requests together
// 4. Set max_tokens appropriately
// 5. Use streaming for long responses
// 6. Monitor usage with detailed tracking
// 7. Implement user quotas
// 8. Use embeddings for semantic search instead of completions
\`\`\`

### Best Practices Summary

1. **Rate Limiting**: Implementeer Token Bucket voor fair gebruik
2. **Security**: Gebruik HMAC signatures voor webhook verificatie
3. **Reliability**: Exponential backoff met jitter voor retries
4. **Cost Control**: Smart model selection en response caching

<ApiPlayground
  initialProvider="openai"
  initialEndpoint="/chat/completions"
  courseId="cost-optimization-demo"
  initialBody={\`{
  "model": "gpt-3.5-turbo",
  "messages": [
    {"role": "user", "content": "Hello"},
  ],
  "max_tokens": 50,
  "temperature": 0.3
}\`}
/>
  `,
  components: {
    ApiPlayground,
    CodeSandbox,
    CodingChallenge
  },
  resources: [
    {
      title: 'Token Bucket Algorithm',
      url: 'https://en.wikipedia.org/wiki/Token_bucket',
      type: 'article'
    },
    {
      title: 'HMAC Security Guide',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API',
      type: 'documentation'
    },
    {
      title: 'API Rate Limiting Best Practices',
      url: 'https://cloud.google.com/architecture/rate-limiting-strategies-techniques',
      type: 'guide'
    }
  ],
  assignments: [
    {
      id: 'implement-rate-limiter',
      title: 'Build a Production Rate Limiter',
      description: 'Implement a distributed rate limiter using Redis with token bucket algorithm',
      difficulty: 'medium',
      type: 'project'
    },
    {
      id: 'webhook-security-system',
      title: 'Create Secure Webhook System',
      description: 'Build a webhook receiver with HMAC verification and replay attack prevention',
      difficulty: 'medium',
      type: 'coding'
    }
  ]
};