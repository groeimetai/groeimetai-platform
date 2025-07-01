import type { Lesson, CodeExample, Assignment } from '@/lib/data/courses';

export const lesson1_4: Lesson = {
  id: 'lesson-4',
  title: 'Best practices en error handling',
  duration: '25 min',
  content: `
# Best Practices en Error Handling voor Webhooks

In deze les behandelen we essentiële best practices voor het bouwen van betrouwbare webhook-systemen die klaar zijn voor productie.

## Idempotency: Dubbele verwerking voorkomen

### Wat is idempotency?
Idempotency betekent dat een operatie meerdere keren uitgevoerd kan worden zonder dat het resultaat verandert. Dit is cruciaal voor webhooks omdat:
- Systemen soms dezelfde webhook meerdere keren kunnen sturen
- Netwerkproblemen kunnen leiden tot retries
- Je applicatie crashes kan ervaren tijdens verwerking

### Implementatie van idempotency:

\`\`\`javascript
// Gebruik een unieke webhook ID of event ID
async function processWebhook(webhookData) {
  const eventId = webhookData.id || webhookData.event_id;
  
  // Check of we dit event al verwerkt hebben
  const existingEvent = await db.webhookEvents.findOne({ eventId });
  
  if (existingEvent) {
    console.log(\`Event \${eventId} already processed, skipping...\`);
    return { status: 'already_processed' };
  }
  
  // Markeer het event als "in verwerking"
  await db.webhookEvents.create({
    eventId,
    status: 'processing',
    receivedAt: new Date()
  });
  
  try {
    // Verwerk de webhook
    const result = await handleWebhookLogic(webhookData);
    
    // Update status naar voltooid
    await db.webhookEvents.update(
      { eventId },
      { status: 'completed', completedAt: new Date() }
    );
    
    return result;
  } catch (error) {
    // Markeer als mislukt voor retry
    await db.webhookEvents.update(
      { eventId },
      { status: 'failed', error: error.message }
    );
    throw error;
  }
}
\`\`\`

## Retry Logic: Betrouwbare verwerking

### Exponential backoff strategie:

\`\`\`javascript
class WebhookRetryHandler {
  constructor(maxRetries = 5) {
    this.maxRetries = maxRetries;
    this.baseDelay = 1000; // 1 seconde
  }
  
  async processWithRetry(webhookData, handler) {
    let lastError;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await handler(webhookData);
      } catch (error) {
        lastError = error;
        
        if (attempt < this.maxRetries - 1) {
          // Exponential backoff: 1s, 2s, 4s, 8s, 16s
          const delay = this.baseDelay * Math.pow(2, attempt);
          
          console.log(\`Retry attempt \${attempt + 1} after \${delay}ms\`);
          await this.sleep(delay);
          
          // Jitter toevoegen om thundering herd te voorkomen
          const jitter = Math.random() * 1000;
          await this.sleep(jitter);
        }
      }
    }
    
    // Alle retries zijn mislukt
    throw new Error(\`Failed after \${this.maxRetries} attempts: \${lastError.message}\`);
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Gebruik:
const retryHandler = new WebhookRetryHandler();
await retryHandler.processWithRetry(webhookData, async (data) => {
  // Je webhook verwerkingslogica hier
  return await processOrder(data);
});
\`\`\`

## Queue Management: Schaalbare verwerking

### Redis-based queue implementatie:

\`\`\`javascript
import Bull from 'bull';
import Redis from 'ioredis';

// Maak een webhook queue
const webhookQueue = new Bull('webhook-processing', {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  }
});

// Webhook endpoint
app.post('/webhook/:provider', async (req, res) => {
  try {
    // Direct een 200 OK response sturen
    res.status(200).json({ received: true });
    
    // Voeg webhook toe aan queue voor async verwerking
    await webhookQueue.add('process-webhook', {
      provider: req.params.provider,
      headers: req.headers,
      body: req.body,
      receivedAt: new Date().toISOString()
    }, {
      // Prioriteit gebaseerd op provider
      priority: req.params.provider === 'payment' ? 1 : 10
    });
    
  } catch (error) {
    console.error('Failed to queue webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Queue processor
webhookQueue.process('process-webhook', async (job) => {
  const { provider, headers, body } = job.data;
  
  // Verificatie
  const isValid = await verifyWebhookSignature(provider, headers, body);
  if (!isValid) {
    throw new Error('Invalid webhook signature');
  }
  
  // Verwerk op basis van provider
  switch (provider) {
    case 'stripe':
      return await processStripeWebhook(body);
    case 'shopify':
      return await processShopifyWebhook(body);
    default:
      throw new Error(\`Unknown provider: \${provider}\`);
  }
});

// Monitor queue events
webhookQueue.on('completed', (job, result) => {
  console.log(\`Webhook \${job.id} completed successfully\`);
});

webhookQueue.on('failed', (job, err) => {
  console.error(\`Webhook \${job.id} failed:\`, err);
  // Stuur alert naar monitoring systeem
  alerting.sendAlert({
    type: 'webhook_failure',
    jobId: job.id,
    error: err.message,
    data: job.data
  });
});
\`\`\`

## Response Codes: Correcte HTTP status communicatie

### Best practices voor response codes:

\`\`\`javascript
// Webhook endpoint met uitgebreide error handling
app.post('/webhook', async (req, res) => {
  try {
    // Validatie
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body is required'
      });
    }
    
    // Signature verificatie
    const signature = req.headers['x-webhook-signature'];
    if (!signature) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing webhook signature'
      });
    }
    
    const isValid = verifySignature(req.body, signature);
    if (!isValid) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Invalid webhook signature'
      });
    }
    
    // Check rate limits
    const rateLimitOk = await checkRateLimit(req.ip);
    if (!rateLimitOk) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded',
        retryAfter: 60 // seconds
      });
    }
    
    // Process webhook (async)
    queueWebhook(req.body);
    
    // Altijd 200 OK terugsturen voor succesvolle ontvangst
    res.status(200).json({
      status: 'received',
      message: 'Webhook queued for processing'
    });
    
  } catch (error) {
    console.error('Webhook error:', error);
    
    // Bepaal juiste error code
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message
      });
    }
    
    // Default naar 500 voor onverwachte errors
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
});

// Response code guide:
// 200 OK - Webhook succesvol ontvangen
// 400 Bad Request - Ongeldige webhook data
// 401 Unauthorized - Missende authenticatie
// 403 Forbidden - Ongeldige authenticatie
// 404 Not Found - Onbekend webhook endpoint
// 429 Too Many Requests - Rate limit overschreden
// 500 Internal Server Error - Server fout
// 503 Service Unavailable - Tijdelijk niet beschikbaar
\`\`\`

## Monitoring Webhooks: Observability en alerting

### Comprehensive monitoring setup:

\`\`\`javascript
import { StatsD } from 'node-statsd';
import winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

// Metrics client
const metrics = new StatsD({
  host: process.env.STATSD_HOST,
  port: 8125,
  prefix: 'webhooks.'
});

// Structured logging
const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new ElasticsearchTransport({
      index: 'webhooks',
      clientOpts: {
        node: process.env.ELASTICSEARCH_URL
      }
    })
  ]
});

// Webhook monitoring middleware
class WebhookMonitor {
  constructor() {
    this.activeWebhooks = new Map();
  }
  
  async trackWebhook(provider, webhookData, processingFn) {
    const startTime = Date.now();
    const webhookId = webhookData.id || generateId();
    
    // Track actieve webhook
    this.activeWebhooks.set(webhookId, {
      provider,
      startTime,
      data: webhookData
    });
    
    // Metrics
    metrics.increment(\`\${provider}.received\`);
    
    try {
      // Log incoming webhook
      logger.info('Webhook received', {
        webhookId,
        provider,
        eventType: webhookData.event || webhookData.type,
        timestamp: new Date().toISOString()
      });
      
      // Process webhook
      const result = await processingFn(webhookData);
      
      // Success metrics
      const duration = Date.now() - startTime;
      metrics.timing(\`\${provider}.processing_time\`, duration);
      metrics.increment(\`\${provider}.success\`);
      
      logger.info('Webhook processed successfully', {
        webhookId,
        provider,
        duration,
        result
      });
      
      return result;
      
    } catch (error) {
      // Error tracking
      metrics.increment(\`\${provider}.error\`);
      metrics.increment(\`error.type.\${error.name}\`);
      
      logger.error('Webhook processing failed', {
        webhookId,
        provider,
        error: {
          message: error.message,
          stack: error.stack,
          type: error.name
        },
        duration: Date.now() - startTime
      });
      
      // Alert voor kritieke fouten
      if (this.isCriticalError(error)) {
        await this.sendAlert({
          severity: 'critical',
          provider,
          error: error.message,
          webhookId
        });
      }
      
      throw error;
      
    } finally {
      this.activeWebhooks.delete(webhookId);
    }
  }
  
  // Health check endpoint
  getHealthStatus() {
    const activeCount = this.activeWebhooks.size;
    const oldestWebhook = this.getOldestActiveWebhook();
    
    return {
      status: activeCount > 100 ? 'warning' : 'healthy',
      activeWebhooks: activeCount,
      oldestProcessingTime: oldestWebhook ? 
        Date.now() - oldestWebhook.startTime : 0,
      metrics: {
        lastHourSuccess: metrics.get('*.success', '1h'),
        lastHourErrors: metrics.get('*.error', '1h'),
        avgProcessingTime: metrics.get('*.processing_time', '1h')
      }
    };
  }
  
  isCriticalError(error) {
    return error.name === 'DatabaseError' || 
           error.name === 'AuthenticationError' ||
           error.message.includes('payment');
  }
  
  async sendAlert(alert) {
    // Integratie met je alerting systeem (PagerDuty, Slack, etc.)
    await fetch(process.env.ALERT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert)
    });
  }
}

// Dashboard endpoint voor monitoring
app.get('/webhook-health', (req, res) => {
  const monitor = getWebhookMonitor();
  res.json(monitor.getHealthStatus());
});
\`\`\`

## Production-ready patterns samenvatting

### 1. Webhook receiver template:

\`\`\`javascript
class ProductionWebhookReceiver {
  constructor(config) {
    this.queue = new Bull(config.queueName);
    this.monitor = new WebhookMonitor();
    this.rateLimiter = new RateLimiter(config.rateLimit);
  }
  
  async handleWebhook(provider, headers, body) {
    // 1. Rate limiting
    await this.rateLimiter.checkLimit(provider);
    
    // 2. Signature verificatie
    this.verifySignature(provider, headers, body);
    
    // 3. Idempotency check
    const eventId = this.extractEventId(provider, body);
    if (await this.isDuplicate(eventId)) {
      return { status: 'already_processed' };
    }
    
    // 4. Queue voor async processing
    const job = await this.queue.add({
      provider,
      eventId,
      body,
      receivedAt: Date.now()
    });
    
    // 5. Monitor
    this.monitor.trackReceived(provider, eventId);
    
    return {
      status: 'queued',
      jobId: job.id
    };
  }
}
\`\`\`

### 2. Error recovery pattern:

\`\`\`javascript
// Dead letter queue voor mislukte webhooks
const deadLetterQueue = new Bull('webhook-dlq');

webhookQueue.on('failed', async (job, err) => {
  if (job.attemptsMade >= job.opts.attempts) {
    // Verplaats naar dead letter queue
    await deadLetterQueue.add('failed-webhook', {
      originalJob: job.data,
      error: err.message,
      failedAt: new Date().toISOString()
    });
  }
});

// Periodieke check van dead letter queue
cron.schedule('*/30 * * * *', async () => {
  const failedJobs = await deadLetterQueue.getJobs(['waiting']);
  
  for (const job of failedJobs) {
    // Probeer opnieuw of stuur notificatie
    await retryOrNotify(job.data);
  }
});
\`\`\`

Deze patterns zorgen voor een robuust webhook systeem dat betrouwbaar werkt in productie!`
};