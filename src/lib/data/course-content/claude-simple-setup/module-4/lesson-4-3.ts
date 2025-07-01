import type { Lesson } from '@/lib/data/courses';

export const lesson4_3: Lesson = {
  id: 'lesson-4-3',
  title: 'Best practices voor productie',
  duration: '30 min',
  content: `
# Best practices voor productie

Bij het deployen van Claude applicaties naar productie zijn er belangrijke overwegingen voor security, performance, en schaalbaarheid.

## Security best practices

### 1. API key management
\`\`\`javascript
// NOOIT API keys in code
// ❌ Verkeerd
const apiKey = "sk-ant-api03-...";

// ✅ Goed - gebruik environment variables
const apiKey = process.env.ANTHROPIC_API_KEY;

// Voor client-side apps: gebruik een backend proxy
app.post('/api/claude-proxy', authenticate, async (req, res) => {
  const response = await anthropic.messages.create({
    ...req.body,
    // API key alleen op server
  });
  res.json(response);
});
\`\`\`

### 2. Input validatie en sanitization
\`\`\`typescript
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Schema voor validatie
const ChatRequestSchema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().uuid().optional(),
  temperature: z.number().min(0).max(1).optional(),
});

// Sanitize user input
function sanitizeInput(input: string): string {
  // Remove potential injection attempts
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [] 
  });
}

// API endpoint met validatie
app.post('/api/chat', async (req, res) => {
  try {
    // Validate request
    const validated = ChatRequestSchema.parse(req.body);
    
    // Sanitize message
    const sanitizedMessage = sanitizeInput(validated.message);
    
    // Process with Claude
    const response = await processWithClaude(sanitizedMessage);
    res.json({ response });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid request format' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});
\`\`\`

### 3. Rate limiting en DDoS protection
\`\`\`typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

// Global rate limiter
const globalLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:global:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minuten
  max: 100, // max 100 requests per window
  message: 'Te veel verzoeken, probeer het later opnieuw',
});

// Stricter limiter voor Claude API
const claudeLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:claude:',
  }),
  windowMs: 60 * 1000, // 1 minuut
  max: 10, // max 10 Claude requests per minuut
  keyGenerator: (req) => req.user?.id || req.ip,
});

// Cost-based rate limiting
class CostBasedRateLimiter {
  async checkLimit(userId: string, estimatedCost: number): Promise<boolean> {
    const key = \`cost:\${userId}:\${new Date().toISOString().split('T')[0]}\`;
    const currentCost = await redis.get(key) || 0;
    
    if (currentCost + estimatedCost > MAX_DAILY_COST) {
      return false;
    }
    
    await redis.incrby(key, estimatedCost);
    await redis.expire(key, 86400); // 24 hour expiry
    return true;
  }
}
\`\`\`

## Performance optimalisatie

### 1. Response caching
\`\`\`typescript
class CacheManager {
  private redis: Redis;
  private ttl: number = 3600; // 1 hour default

  async getCachedResponse(
    prompt: string, 
    options: ChatOptions
  ): Promise<string | null> {
    const key = this.generateCacheKey(prompt, options);
    return await this.redis.get(key);
  }

  async cacheResponse(
    prompt: string, 
    options: ChatOptions, 
    response: string
  ): Promise<void> {
    const key = this.generateCacheKey(prompt, options);
    await this.redis.setex(key, this.ttl, response);
  }

  private generateCacheKey(prompt: string, options: ChatOptions): string {
    // Create deterministic cache key
    const normalized = {
      prompt: prompt.toLowerCase().trim(),
      model: options.model || 'default',
      temperature: options.temperature || 0.7,
    };
    
    return \`claude:cache:\${crypto
      .createHash('sha256')
      .update(JSON.stringify(normalized))
      .digest('hex')}\`;
  }
}

// Gebruik in API
app.post('/api/chat', async (req, res) => {
  const { message, options } = req.body;
  
  // Check cache first
  const cached = await cacheManager.getCachedResponse(message, options);
  if (cached) {
    return res.json({ response: cached, cached: true });
  }
  
  // Call Claude
  const response = await claude.chat(message, options);
  
  // Cache response
  await cacheManager.cacheResponse(message, options, response);
  
  res.json({ response, cached: false });
});
\`\`\`

### 2. Connection pooling en retries
\`\`\`typescript
import retry from 'async-retry';

class ResilientClaudeClient {
  private maxRetries = 3;
  private backoffMultiplier = 2;

  async chat(message: string, options: ChatOptions): Promise<string> {
    return retry(
      async (bail, attempt) => {
        try {
          return await this.executeRequest(message, options);
        } catch (error) {
          // Don't retry on 4xx errors
          if (error.status >= 400 && error.status < 500) {
            bail(error);
          }
          
          // Log retry attempt
          console.warn(\`Retry attempt \${attempt} after error:\`, error);
          
          throw error;
        }
      },
      {
        retries: this.maxRetries,
        factor: this.backoffMultiplier,
        minTimeout: 1000,
        maxTimeout: 10000,
        onRetry: (error, attempt) => {
          console.log(\`Retrying request, attempt \${attempt}\`);
        },
      }
    );
  }

  private async executeRequest(
    message: string, 
    options: ChatOptions
  ): Promise<string> {
    const response = await anthropic.messages.create({
      model: options.model || 'claude-3-5-sonnet-20241022',
      max_tokens: options.maxTokens || 1024,
      messages: [{ role: 'user', content: message }],
    });
    
    return response.content[0].text;
  }
}
\`\`\`

### 3. Database query optimalisatie
\`\`\`typescript
// Efficient conversation loading
class ConversationRepository {
  async getConversationWithMessages(
    conversationId: string,
    limit: number = 50
  ): Promise<ConversationWithMessages> {
    // Single query met JOIN
    const result = await db.query(\`
      SELECT 
        c.id, c.created_at, c.user_id,
        m.id as message_id, m.role, m.content, m.timestamp
      FROM conversations c
      LEFT JOIN messages m ON m.conversation_id = c.id
      WHERE c.id = $1
      ORDER BY m.timestamp DESC
      LIMIT $2
    \`, [conversationId, limit]);
    
    // Transform to nested structure
    return this.transformToConversation(result.rows);
  }

  async batchLoadConversations(
    userId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<ConversationSummary[]> {
    // Gebruik window function voor efficient counting
    const result = await db.query(\`
      WITH ranked_messages AS (
        SELECT 
          conversation_id,
          content,
          timestamp,
          ROW_NUMBER() OVER (
            PARTITION BY conversation_id 
            ORDER BY timestamp DESC
          ) as rn
        FROM messages
      )
      SELECT 
        c.id,
        c.created_at,
        rm.content as last_message,
        rm.timestamp as last_message_time,
        COUNT(*) OVER() as total_count
      FROM conversations c
      LEFT JOIN ranked_messages rm 
        ON rm.conversation_id = c.id AND rm.rn = 1
      WHERE c.user_id = $1
      ORDER BY rm.timestamp DESC
      LIMIT $2 OFFSET $3
    \`, [userId, pageSize, (page - 1) * pageSize]);
    
    return result.rows;
  }
}
\`\`\`

## Monitoring en observability

### 1. Structured logging
\`\`\`typescript
import winston from 'winston';
import { trace, context, SpanStatusCode } from '@opentelemetry/api';

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// OpenTelemetry tracing
const tracer = trace.getTracer('claude-app');

async function tracedClaudeCall(message: string): Promise<string> {
  const span = tracer.startSpan('claude.chat');
  
  try {
    span.setAttributes({
      'claude.model': 'claude-3-5-sonnet-20241022',
      'claude.message_length': message.length,
      'claude.user_id': context.active().getValue('userId'),
    });
    
    const startTime = Date.now();
    const response = await claude.chat(message);
    const duration = Date.now() - startTime;
    
    span.setAttributes({
      'claude.response_length': response.length,
      'claude.duration_ms': duration,
      'claude.tokens_used': estimateTokens(message + response),
    });
    
    logger.info('Claude API call successful', {
      duration,
      messageLength: message.length,
      responseLength: response.length,
    });
    
    return response;
  } catch (error) {
    span.recordException(error);
    span.setStatus({ code: SpanStatusCode.ERROR });
    
    logger.error('Claude API call failed', {
      error: error.message,
      stack: error.stack,
      message: message.substring(0, 100) + '...',
    });
    
    throw error;
  } finally {
    span.end();
  }
}
\`\`\`

### 2. Metrics collection
\`\`\`typescript
import { Counter, Histogram, Gauge } from 'prom-client';

// Define metrics
const claudeRequestsTotal = new Counter({
  name: 'claude_requests_total',
  help: 'Total number of Claude API requests',
  labelNames: ['status', 'model'],
});

const claudeRequestDuration = new Histogram({
  name: 'claude_request_duration_seconds',
  help: 'Claude API request duration in seconds',
  labelNames: ['model'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

const activeConversations = new Gauge({
  name: 'active_conversations',
  help: 'Number of active conversations',
});

const tokenUsage = new Counter({
  name: 'claude_tokens_used_total',
  help: 'Total tokens used',
  labelNames: ['model', 'type'],
});

// Gebruik in applicatie
async function monitoredClaudeCall(message: string): Promise<string> {
  const timer = claudeRequestDuration.startTimer({ model: 'claude-3-sonnet' });
  
  try {
    const response = await claude.chat(message);
    
    claudeRequestsTotal.inc({ status: 'success', model: 'claude-3-sonnet' });
    tokenUsage.inc({ 
      model: 'claude-3-sonnet', 
      type: 'input' 
    }, estimateTokens(message));
    tokenUsage.inc({ 
      model: 'claude-3-sonnet', 
      type: 'output' 
    }, estimateTokens(response));
    
    return response;
  } catch (error) {
    claudeRequestsTotal.inc({ status: 'error', model: 'claude-3-sonnet' });
    throw error;
  } finally {
    timer();
  }
}

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
});
\`\`\`

### 3. Health checks en readiness probes
\`\`\`typescript
interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  checks: {
    database: boolean;
    redis: boolean;
    claude: boolean;
  };
  timestamp: Date;
}

class HealthChecker {
  async checkHealth(): Promise<HealthCheckResult> {
    const checks = {
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
      claude: await this.checkClaude(),
    };
    
    const status = Object.values(checks).every(check => check) 
      ? 'healthy' 
      : 'unhealthy';
    
    return {
      status,
      checks,
      timestamp: new Date(),
    };
  }
  
  private async checkDatabase(): Promise<boolean> {
    try {
      await db.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
  
  private async checkRedis(): Promise<boolean> {
    try {
      await redis.ping();
      return true;
    } catch {
      return false;
    }
  }
  
  private async checkClaude(): Promise<boolean> {
    try {
      // Simple API key validation
      await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'Hi' }],
      });
      return true;
    } catch {
      return false;
    }
  }
}

// Health endpoints
app.get('/health', async (req, res) => {
  const health = await healthChecker.checkHealth();
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

app.get('/ready', async (req, res) => {
  const health = await healthChecker.checkHealth();
  if (health.status === 'healthy') {
    res.status(200).send('Ready');
  } else {
    res.status(503).send('Not ready');
  }
});
\`\`\`

## Deployment strategies

### 1. Containerization met Docker
\`\`\`dockerfile
# Multi-stage build voor optimale image size
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Install dumb-init voor proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD node healthcheck.js

# Use dumb-init to handle signals
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/server.js"]
\`\`\`

### 2. Kubernetes deployment
\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: claude-app
  labels:
    app: claude-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: claude-app
  template:
    metadata:
      labels:
        app: claude-app
    spec:
      containers:
      - name: claude-app
        image: your-registry/claude-app:latest
        ports:
        - containerPort: 3000
        env:
        - name: ANTHROPIC_API_KEY
          valueFrom:
            secretKeyRef:
              name: claude-secrets
              key: api-key
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: claude-app-service
spec:
  selector:
    app: claude-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
\`\`\`

### 3. Auto-scaling configuratie
\`\`\`yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: claude-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: claude-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  - type: Pods
    pods:
      metric:
        name: claude_requests_per_second
      target:
        type: AverageValue
        averageValue: "30"
\`\`\`

## Cost optimization strategies

### 1. Model selection optimization
\`\`\`typescript
class ModelSelector {
  private models = {
    'claude-3-haiku-20240307': { cost: 0.25, speed: 'fast', quality: 'good' },
    'claude-3-sonnet-20240229': { cost: 3, speed: 'medium', quality: 'better' },
    'claude-3-opus-20240229': { cost: 15, speed: 'slow', quality: 'best' }
  };

  selectModel(requirements: {
    maxCost?: number;
    minQuality?: string;
    maxLatency?: number;
  }): string {
    // Logic to select optimal model based on requirements
    if (requirements.maxCost && requirements.maxCost < 1) {
      return 'claude-3-haiku-20240307';
    }
    
    if (requirements.minQuality === 'best') {
      return 'claude-3-opus-20240229';
    }
    
    // Default to balanced option
    return 'claude-3-sonnet-20240229';
  }
}
\`\`\`

### 2. Token usage optimization
\`\`\`typescript
class TokenOptimizer {
  compressPrompt(prompt: string): string {
    // Remove unnecessary whitespace
    let compressed = prompt.replace(/\\s+/g, ' ').trim();
    
    // Remove redundant instructions
    const redundantPhrases = [
      'Please ',
      'Could you please ',
      'I would like you to ',
    ];
    
    redundantPhrases.forEach(phrase => {
      compressed = compressed.replace(new RegExp(phrase, 'gi'), '');
    });
    
    return compressed;
  }

  truncateContext(messages: Message[], maxTokens: number): Message[] {
    const estimated = messages.reduce((sum, msg) => 
      sum + this.estimateTokens(msg.content), 0
    );
    
    if (estimated <= maxTokens) {
      return messages;
    }
    
    // Keep most recent messages that fit
    const truncated = [];
    let tokenCount = 0;
    
    for (let i = messages.length - 1; i >= 0; i--) {
      const msgTokens = this.estimateTokens(messages[i].content);
      if (tokenCount + msgTokens <= maxTokens) {
        truncated.unshift(messages[i]);
        tokenCount += msgTokens;
      } else {
        break;
      }
    }
    
    return truncated;
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
\`\`\`

## Conclusie

Deze best practices helpen je om robuuste, schaalbare Claude applicaties te bouwen:

- **Security**: Protect API keys, validate input, implement rate limiting
- **Performance**: Use caching, connection pooling, database optimization
- **Monitoring**: Implement logging, metrics, health checks
- **Deployment**: Use containers, orchestration, auto-scaling
- **Cost**: Track usage, optimize model selection

In de volgende les gaan we dieper in op geavanceerde integratie patronen!
  `
};