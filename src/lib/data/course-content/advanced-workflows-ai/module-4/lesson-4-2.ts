import { Lesson } from '@/lib/data/courses';

export const lesson4_2: Lesson = {
  id: 'lesson-4-2',
  title: 'Queue management en job processing',
  duration: '40 min',
  content: `
# Queue management en job processing

## Introductie

Queue management is een fundamenteel concept in moderne workflow automatisering. Het stelt je in staat om taken asynchroon te verwerken, resources efficiënt te gebruiken, en robuuste systemen te bouwen die bestand zijn tegen pieken in werkbelasting. In deze les duiken we diep in queue concepten en leren we werken met Bull/BullMQ, de populairste queue libraries voor Node.js.

## Queue concepts and patterns

### Wat is een queue?

Een queue (wachtrij) is een datastructuur die werkt volgens het FIFO principe (First In, First Out). In workflow automatisering gebruiken we queues om:

- **Taken te ontkoppelen**: Producers en consumers werken onafhankelijk
- **Load balancing**: Verdeel werk over meerdere workers
- **Reliability**: Taken gaan niet verloren bij crashes
- **Scalability**: Voeg workers toe naarmate de workload groeit

### Queue componenten

1. **Producer**: Voegt jobs toe aan de queue
2. **Queue**: Bewaart jobs in volgorde
3. **Worker/Consumer**: Verwerkt jobs uit de queue
4. **Job**: Een taak met data en metadata

### Bull/BullMQ setup

\`\`\`javascript
// Bull setup (legacy)
const Bull = require('bull');
const myQueue = new Bull('email-queue', {
  redis: {
    port: 6379,
    host: '127.0.0.1',
    password: 'mypassword'
  }
});

// BullMQ setup (modern)
const { Queue, Worker } = require('bullmq');
const myQueue = new Queue('email-queue', {
  connection: {
    host: 'localhost',
    port: 6379
  }
});
\`\`\`

## Priority queues

Priority queues maken het mogelijk om bepaalde jobs voorrang te geven. Dit is essentieel voor systemen waar sommige taken urgenter zijn dan andere.

### Implementatie van priorities

\`\`\`javascript
// Add jobs with different priorities
await myQueue.add('send-email', {
  to: 'vip@customer.com',
  subject: 'Urgent: Account Issue'
}, {
  priority: 1 // Hoogste prioriteit
});

await myQueue.add('send-email', {
  to: 'regular@customer.com',
  subject: 'Monthly Newsletter'
}, {
  priority: 10 // Lagere prioriteit
});

// Worker processes high priority jobs first
const worker = new Worker('email-queue', async (job) => {
  console.log(\`Processing job with priority \${job.opts.priority}\`);
  await sendEmail(job.data);
}, {
  connection: {
    host: 'localhost',
    port: 6379
  }
});
\`\`\`

### Priority strategies

1. **Numeric priorities**: Lagere nummers = hogere prioriteit
2. **Named priorities**: Map namen naar numerieke waarden
3. **Dynamic priorities**: Pas prioriteit aan op basis van wachttijd

\`\`\`javascript
// Named priority system
const PRIORITIES = {
  CRITICAL: 1,
  HIGH: 5,
  NORMAL: 10,
  LOW: 20
};

// Add job with named priority
await myQueue.add('process-order', orderData, {
  priority: PRIORITIES.HIGH
});

// Dynamic priority based on customer tier
function calculatePriority(customer) {
  const basePriority = PRIORITIES.NORMAL;
  const tierBonus = {
    'platinum': -5,
    'gold': -3,
    'silver': -1,
    'bronze': 0
  };
  
  return basePriority + (tierBonus[customer.tier] || 0);
}
\`\`\`

## Dead letter queues

Dead letter queues (DLQ) zijn een veiligheidsmechanisme voor jobs die herhaaldelijk falen. Ze voorkomen dat problematische jobs het systeem blijven belasten.

### DLQ implementatie

\`\`\`javascript
// Configure queue with retry and DLQ settings
const emailQueue = new Queue('email-queue', {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: true,
    removeOnFail: false // Keep failed jobs for inspection
  }
});

// Dead letter queue for failed jobs
const deadLetterQueue = new Queue('email-dlq');

// Worker with error handling
const worker = new Worker('email-queue', async (job) => {
  try {
    await processEmail(job.data);
  } catch (error) {
    // Log the error
    console.error(\`Job \${job.id} failed:\`, error);
    
    // Check if max attempts reached
    if (job.attemptsMade >= job.opts.attempts) {
      // Move to dead letter queue
      await deadLetterQueue.add('failed-email', {
        originalJobId: job.id,
        data: job.data,
        error: error.message,
        attempts: job.attemptsMade,
        timestamp: new Date()
      });
    }
    
    throw error; // Re-throw to mark job as failed
  }
});

// Process dead letter queue separately
const dlqWorker = new Worker('email-dlq', async (job) => {
  // Manual intervention or alternative processing
  await notifyAdministrator(job.data);
  await logToErrorTracking(job.data);
});
\`\`\`

### DLQ strategies

1. **Manual review**: Administrator bekijkt en herprobeert jobs
2. **Alternative processing**: Gebruik fallback methode
3. **Notification**: Alert operations team
4. **Auto-retry with delay**: Probeer later opnieuw

## Parallel vs sequential processing

De keuze tussen parallel en sequentiële verwerking heeft grote impact op performance en resource gebruik.

### Sequential processing

\`\`\`javascript
// Sequential worker - processes one job at a time
const sequentialWorker = new Worker('order-queue', 
  async (job) => {
    console.log(\`Processing order \${job.data.orderId}\`);
    await processOrder(job.data);
  }, 
  {
    concurrency: 1 // Process one job at a time
  }
);

// Use case: Database transactions that must be ordered
const dbWorker = new Worker('db-queue', async (job) => {
  const connection = await getDbConnection();
  try {
    await connection.beginTransaction();
    await connection.query(job.data.query);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  }
}, { concurrency: 1 });
\`\`\`

### Parallel processing

\`\`\`javascript
// Parallel worker - processes multiple jobs simultaneously
const parallelWorker = new Worker('image-processing', 
  async (job) => {
    console.log(\`Processing image \${job.data.imageId}\`);
    await resizeImage(job.data);
  }, 
  {
    concurrency: 5 // Process up to 5 jobs simultaneously
  }
);

// Dynamic concurrency based on system resources
const cpuCount = require('os').cpus().length;
const dynamicWorker = new Worker('cpu-intensive-queue', 
  async (job) => {
    await performCalculation(job.data);
  }, 
  {
    concurrency: Math.max(1, cpuCount - 1) // Leave one CPU free
  }
);

// Parallel processing with rate limiting
const rateLimitedWorker = new Worker('api-queue', 
  async (job) => {
    await callExternalAPI(job.data);
  }, 
  {
    concurrency: 10,
    limiter: {
      max: 100,
      duration: 60000 // Max 100 jobs per minute
    }
  }
);
\`\`\`

### Hybrid approach

\`\`\`javascript
// Group jobs by type for optimal processing
const hybridWorker = new Worker('mixed-queue', async (job) => {
  switch (job.name) {
    case 'database-write':
      // Process sequentially
      await processWithLock(job.data);
      break;
    
    case 'file-upload':
      // Can be parallel
      await uploadFile(job.data);
      break;
    
    case 'email-send':
      // Rate limited parallel
      await sendWithRateLimit(job.data);
      break;
  }
});
\`\`\`

## Queue monitoring

Effectieve monitoring is cruciaal voor het beheren van productie queues.

### Key metrics

1. **Queue depth**: Aantal wachtende jobs
2. **Processing rate**: Jobs per seconde/minuut
3. **Failure rate**: Percentage gefaalde jobs
4. **Processing time**: Gemiddelde verwerkingstijd
5. **Worker utilization**: Percentage actieve workers

### BullMQ monitoring implementatie

\`\`\`javascript
// Queue metrics collector
class QueueMonitor {
  constructor(queue) {
    this.queue = queue;
    this.metrics = {
      processed: 0,
      failed: 0,
      completed: 0,
      activeJobs: 0,
      waitingJobs: 0,
      delayedJobs: 0
    };
  }

  async collectMetrics() {
    this.metrics.waitingJobs = await this.queue.getWaitingCount();
    this.metrics.activeJobs = await this.queue.getActiveCount();
    this.metrics.delayedJobs = await this.queue.getDelayedCount();
    this.metrics.completed = await this.queue.getCompletedCount();
    this.metrics.failed = await this.queue.getFailedCount();
    
    return this.metrics;
  }

  async getHealthStatus() {
    const metrics = await this.collectMetrics();
    const queueDepth = metrics.waitingJobs + metrics.activeJobs;
    
    if (queueDepth > 10000) return 'critical';
    if (queueDepth > 5000) return 'warning';
    if (metrics.failed / metrics.completed > 0.1) return 'unhealthy';
    
    return 'healthy';
  }
}

// Real-time monitoring with events
worker.on('completed', (job) => {
  console.log(\`Job \${job.id} completed in \${job.finishedOn - job.processedOn}ms\`);
  metrics.recordCompletion(job.finishedOn - job.processedOn);
});

worker.on('failed', (job, error) => {
  console.error(\`Job \${job.id} failed:\`, error.message);
  metrics.recordFailure(job.id, error);
  alerting.checkThresholds();
});

// Dashboard endpoint
app.get('/queue/metrics', async (req, res) => {
  const monitor = new QueueMonitor(myQueue);
  const metrics = await monitor.collectMetrics();
  const health = await monitor.getHealthStatus();
  
  res.json({
    health,
    metrics,
    timestamp: new Date()
  });
});
\`\`\`

### Monitoring best practices

1. **Set up alerts**: Waarschuw bij hoge queue depth of failure rate
2. **Track trends**: Monitor metrics over tijd
3. **Log job details**: Bewaar context voor debugging
4. **Health checks**: Implementeer health endpoints
5. **Graceful shutdown**: Handel running jobs correct af

\`\`\`javascript
// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing worker...');
  
  // Stop accepting new jobs
  await worker.close();
  
  // Wait for current jobs to complete (max 30 seconds)
  await worker.disconnect();
  
  console.log('Worker shut down gracefully');
  process.exit(0);
});
\`\`\`

## Praktijkoefening: Multi-tier job processing system

Bouw een complete job processing systeem met:
1. Priority queue voor verschillende job types
2. Dead letter queue voor gefaalde jobs
3. Parallel processing voor images, sequential voor database updates
4. Real-time monitoring dashboard
5. Graceful shutdown handling
  `,
  codeExamples: [
    {
      id: 'example-1',
      title: 'Complete BullMQ setup with Redis Sentinel',
      language: 'javascript',
      code: `// Production-ready BullMQ configuration
const { Queue, Worker, QueueScheduler } = require('bullmq');
const IORedis = require('ioredis');

// Redis Sentinel configuration for high availability
const redisOptions = {
  sentinels: [
    { host: 'sentinel-1', port: 26379 },
    { host: 'sentinel-2', port: 26379 },
    { host: 'sentinel-3', port: 26379 }
  ],
  name: 'mymaster',
  password: process.env.REDIS_PASSWORD,
  sentinelPassword: process.env.SENTINEL_PASSWORD,
  // Retry strategy
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
};

// Create queue with advanced options
const jobQueue = new Queue('job-processing', {
  connection: redisOptions,
  defaultJobOptions: {
    removeOnComplete: {
      age: 3600, // Keep completed jobs for 1 hour
      count: 100 // Keep last 100 completed jobs
    },
    removeOnFail: {
      age: 86400 // Keep failed jobs for 24 hours
    },
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
});

// Queue scheduler for delayed jobs
const queueScheduler = new QueueScheduler('job-processing', {
  connection: redisOptions
});

// Worker with comprehensive error handling
const worker = new Worker('job-processing', 
  async (job) => {
    // Add job context to all logs
    const logger = createJobLogger(job.id);
    
    try {
      logger.info('Starting job processing', { data: job.data });
      
      const result = await processJob(job);
      
      logger.info('Job completed successfully', { result });
      return result;
      
    } catch (error) {
      logger.error('Job processing failed', { 
        error: error.message, 
        stack: error.stack,
        attempt: job.attemptsMade
      });
      
      // Check if error is retryable
      if (error.retryable === false) {
        // Move directly to DLQ
        await moveToDeadLetter(job, error);
        return; // Don't retry
      }
      
      throw error; // Retry
    }
  },
  {
    connection: redisOptions,
    concurrency: 10,
    limiter: {
      max: 100,
      duration: 60000
    }
  }
);`
    },
    {
      id: 'example-2',
      title: 'Advanced priority queue with dynamic adjustment',
      language: 'javascript',
      code: `// Dynamic priority queue system
class PriorityQueueManager {
  constructor(queueName) {
    this.queue = new Queue(queueName);
    this.priorityRules = new Map();
  }

  // Register priority rules
  addPriorityRule(name, calculator) {
    this.priorityRules.set(name, calculator);
  }

  // Calculate priority based on multiple factors
  calculatePriority(jobData) {
    let priority = 10; // Default priority
    
    // Apply all registered rules
    for (const [name, calculator] of this.priorityRules) {
      const adjustment = calculator(jobData);
      priority += adjustment;
    }
    
    // Ensure priority is within bounds (1-100)
    return Math.max(1, Math.min(100, priority));
  }

  // Add job with calculated priority
  async addJob(name, data, options = {}) {
    const priority = this.calculatePriority(data);
    
    const job = await this.queue.add(name, data, {
      ...options,
      priority,
      // Store priority factors for debugging
      data: {
        ...data,
        _priorityFactors: this.getPriorityFactors(data)
      }
    });
    
    return job;
  }

  getPriorityFactors(data) {
    const factors = {};
    for (const [name, calculator] of this.priorityRules) {
      factors[name] = calculator(data);
    }
    return factors;
  }
}

// Usage example
const priorityQueue = new PriorityQueueManager('orders');

// Customer tier priority
priorityQueue.addPriorityRule('customerTier', (data) => {
  const tierPriorities = {
    'enterprise': -8,
    'premium': -5,
    'standard': 0,
    'trial': 3
  };
  return tierPriorities[data.customerTier] || 0;
});

// Order value priority
priorityQueue.addPriorityRule('orderValue', (data) => {
  if (data.orderValue > 10000) return -5;
  if (data.orderValue > 5000) return -3;
  if (data.orderValue > 1000) return -1;
  return 0;
});

// Time-based priority (increase priority for older jobs)
priorityQueue.addPriorityRule('age', (data) => {
  const ageInMinutes = (Date.now() - data.createdAt) / 60000;
  return Math.floor(ageInMinutes / 10) * -1; // -1 priority per 10 minutes
});

// Add jobs
await priorityQueue.addJob('process-order', {
  orderId: '12345',
  customerTier: 'enterprise',
  orderValue: 15000,
  createdAt: Date.now()
});`
    },
    {
      id: 'example-3',
      title: 'Comprehensive queue monitoring system',
      language: 'javascript',
      code: `// Real-time queue monitoring and alerting
class QueueMonitoringSystem {
  constructor(queues) {
    this.queues = queues; // Map of queue name to queue instance
    this.metrics = new Map();
    this.alerts = [];
    this.thresholds = {
      queueDepth: 1000,
      failureRate: 0.05,
      processingTime: 5000,
      workerUtilization: 0.9
    };
  }

  // Start monitoring
  async startMonitoring(intervalMs = 5000) {
    setInterval(() => this.collectMetrics(), intervalMs);
    
    // Set up event listeners for real-time updates
    for (const [name, queue] of this.queues) {
      this.setupQueueListeners(name, queue);
    }
  }

  setupQueueListeners(queueName, queue) {
    queue.on('completed', (job, result) => {
      this.recordJobCompletion(queueName, job);
    });
    
    queue.on('failed', (job, error) => {
      this.recordJobFailure(queueName, job, error);
    });
    
    queue.on('stalled', (job) => {
      this.recordStalledJob(queueName, job);
    });
  }

  async collectMetrics() {
    for (const [name, queue] of this.queues) {
      const metrics = await this.getQueueMetrics(queue);
      this.metrics.set(name, metrics);
      
      // Check thresholds and create alerts
      this.checkThresholds(name, metrics);
    }
    
    // Emit metrics for external monitoring
    this.emitMetrics();
  }

  async getQueueMetrics(queue) {
    const [
      waiting,
      active,
      completed,
      failed,
      delayed,
      paused
    ] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
      queue.getPausedCount()
    ]);
    
    // Calculate rates
    const total = completed + failed;
    const failureRate = total > 0 ? failed / total : 0;
    
    // Get job processing times
    const recentJobs = await queue.getCompleted(0, 100);
    const processingTimes = recentJobs.map(job => 
      job.finishedOn - job.processedOn
    );
    const avgProcessingTime = processingTimes.length > 0
      ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
      : 0;
    
    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      paused,
      failureRate,
      avgProcessingTime,
      queueDepth: waiting + active,
      timestamp: Date.now()
    };
  }

  checkThresholds(queueName, metrics) {
    const alerts = [];
    
    if (metrics.queueDepth > this.thresholds.queueDepth) {
      alerts.push({
        severity: 'warning',
        queue: queueName,
        metric: 'queueDepth',
        value: metrics.queueDepth,
        threshold: this.thresholds.queueDepth,
        message: \`Queue depth (\${metrics.queueDepth}) exceeds threshold\`
      });
    }
    
    if (metrics.failureRate > this.thresholds.failureRate) {
      alerts.push({
        severity: 'error',
        queue: queueName,
        metric: 'failureRate',
        value: metrics.failureRate,
        threshold: this.thresholds.failureRate,
        message: \`Failure rate (\${(metrics.failureRate * 100).toFixed(2)}%) exceeds threshold\`
      });
    }
    
    if (metrics.avgProcessingTime > this.thresholds.processingTime) {
      alerts.push({
        severity: 'warning',
        queue: queueName,
        metric: 'processingTime',
        value: metrics.avgProcessingTime,
        threshold: this.thresholds.processingTime,
        message: \`Average processing time (\${metrics.avgProcessingTime}ms) exceeds threshold\`
      });
    }
    
    // Send alerts
    alerts.forEach(alert => this.sendAlert(alert));
  }

  sendAlert(alert) {
    // Log alert
    console.error(\`[\${alert.severity.toUpperCase()}] \${alert.queue}: \${alert.message}\`);
    
    // Store alert
    this.alerts.push({
      ...alert,
      timestamp: Date.now()
    });
    
    // Send to external monitoring (e.g., Slack, PagerDuty)
    if (alert.severity === 'error') {
      this.notifyOpsTeam(alert);
    }
  }

  async generateReport() {
    const report = {
      timestamp: Date.now(),
      queues: {},
      alerts: this.alerts.filter(a => 
        Date.now() - a.timestamp < 3600000 // Last hour
      )
    };
    
    for (const [name, metrics] of this.metrics) {
      report.queues[name] = {
        current: metrics,
        health: this.calculateHealth(metrics)
      };
    }
    
    return report;
  }

  calculateHealth(metrics) {
    let score = 100;
    
    // Deduct points for various issues
    if (metrics.queueDepth > this.thresholds.queueDepth) score -= 20;
    if (metrics.failureRate > this.thresholds.failureRate) score -= 30;
    if (metrics.avgProcessingTime > this.thresholds.processingTime) score -= 15;
    if (metrics.paused > 0) score -= 10;
    
    if (score >= 90) return 'healthy';
    if (score >= 70) return 'degraded';
    if (score >= 50) return 'unhealthy';
    return 'critical';
  }
}

// Usage
const monitor = new QueueMonitoringSystem(new Map([
  ['emails', emailQueue],
  ['orders', orderQueue],
  ['reports', reportQueue]
]));

await monitor.startMonitoring();

// API endpoint for monitoring dashboard
app.get('/api/queue-health', async (req, res) => {
  const report = await monitor.generateReport();
  res.json(report);
});`
    }
  ],
  assignments: [
    {
      id: 'assignment-4-2',
      title: 'Build a Multi-Queue Job Processing System',
      description: 'Implementeer een volledig job processing systeem met meerdere queues (emails, orders, reports), priority handling, dead letter queues, en een real-time monitoring dashboard. Gebruik BullMQ en implementeer graceful shutdown.',
      difficulty: 'expert',
      type: 'project'
    }
  ],
  resources: [
    {
      title: 'BullMQ Official Documentation',
      url: 'https://docs.bullmq.io/',
      type: 'documentation'
    },
    {
      title: 'Redis Pub/Sub Guide',
      url: 'https://redis.io/topics/pubsub',
      type: 'documentation'
    },
    {
      title: 'Queue Theory Fundamentals',
      url: 'https://www.rabbitmq.com/tutorials/tutorial-one-javascript.html',
      type: 'tutorial'
    },
    {
      title: 'Building Resilient Queue Systems',
      url: 'https://aws.amazon.com/builders-library/avoiding-insurmountable-queue-backlogs/',
      type: 'article'
    }
  ]
};