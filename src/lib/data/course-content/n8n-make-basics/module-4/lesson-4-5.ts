import type { Lesson } from '@/lib/data/courses';

export const lesson4_5: Lesson = {
  id: 'lesson-4-5',
  title: 'Scaling en maintenance',
  duration: '40 min',
  content: `
# Scaling en maintenance

Leer hoe je workflows schaalt van prototype naar productie en maintain voor lange-termijn stabiliteit.

## Scaling strategieën

### 1. Horizontale scaling

**Load balancing implementatie:**
\`\`\`javascript
class WorkflowLoadBalancer {
  constructor(workers = 4) {
    this.workers = [];
    this.currentWorker = 0;
    
    // Initialize worker pool
    for (let i = 0; i < workers; i++) {
      this.workers.push(new WorkflowWorker(i));
    }
  }
  
  // Round-robin distribution
  async execute(task) {
    const worker = this.workers[this.currentWorker];
    this.currentWorker = (this.currentWorker + 1) % this.workers.length;
    
    return worker.process(task);
  }
  
  // Dynamic scaling
  async scale(factor) {
    const currentCount = this.workers.length;
    const targetCount = Math.ceil(currentCount * factor);
    
    if (targetCount > currentCount) {
      // Scale up
      for (let i = currentCount; i < targetCount; i++) {
        this.workers.push(new WorkflowWorker(i));
      }
    } else {
      // Scale down gracefully
      const toRemove = currentCount - targetCount;
      for (let i = 0; i < toRemove; i++) {
        const worker = this.workers.pop();
        await worker.gracefulShutdown();
      }
    }
  }
}
\`\`\`

### 2. Queue management

**Implementeer robuste queue processing:**
\`\`\`javascript
class WorkflowQueue {
  constructor(options = {}) {
    this.maxConcurrent = options.maxConcurrent || 10;
    this.retryAttempts = options.retryAttempts || 3;
    this.queue = [];
    this.processing = new Map();
    this.failed = [];
  }
  
  async add(job) {
    const jobId = crypto.randomUUID();
    const jobEntry = {
      id: jobId,
      data: job,
      attempts: 0,
      createdAt: Date.now(),
      priority: job.priority || 0
    };
    
    this.queue.push(jobEntry);
    this.queue.sort((a, b) => b.priority - a.priority);
    
    this.processNext();
    return jobId;
  }
  
  async processNext() {
    if (this.processing.size >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }
    
    const job = this.queue.shift();
    this.processing.set(job.id, job);
    
    try {
      const result = await this.executeJob(job);
      this.processing.delete(job.id);
      
      // Process next job
      this.processNext();
      
      return result;
    } catch (error) {
      job.attempts++;
      
      if (job.attempts < this.retryAttempts) {
        // Exponential backoff
        const delay = Math.pow(2, job.attempts) * 1000;
        setTimeout(() => {
          this.queue.push(job);
          this.processNext();
        }, delay);
      } else {
        // Move to failed queue
        this.failed.push({
          ...job,
          error: error.message,
          failedAt: Date.now()
        });
      }
      
      this.processing.delete(job.id);
      this.processNext();
    }
  }
}
\`\`\`

### 3. Resource optimization

**Memory-efficient data processing:**
\`\`\`javascript
// Stream processing voor grote datasets
class StreamProcessor {
  constructor(options = {}) {
    this.chunkSize = options.chunkSize || 1000;
    this.maxMemory = options.maxMemory || 100 * 1024 * 1024; // 100MB
  }
  
  async *processLargeDataset(source) {
    let buffer = [];
    let memoryUsed = 0;
    
    for await (const item of source) {
      buffer.push(item);
      memoryUsed += this.estimateSize(item);
      
      if (buffer.length >= this.chunkSize || memoryUsed >= this.maxMemory) {
        yield this.processChunk(buffer);
        buffer = [];
        memoryUsed = 0;
        
        // Garbage collection hint
        if (global.gc) {
          global.gc();
        }
      }
    }
    
    // Process remaining items
    if (buffer.length > 0) {
      yield this.processChunk(buffer);
    }
  }
}
\`\`\`

## Maintenance schedules

### Daily maintenance tasks
- [ ] Check error logs en fix kritieke issues
- [ ] Monitor resource usage (CPU, memory, API limits)
- [ ] Verify alle scheduled workflows runnen correct
- [ ] Clear temporary files en caches

### Weekly maintenance
- [ ] Review performance metrics
- [ ] Update dependencies (security patches)
- [ ] Backup critical workflow configurations
- [ ] Clean up old execution logs
- [ ] Test disaster recovery procedures

### Monthly maintenance
- [ ] Full system health check
- [ ] Performance optimization review
- [ ] Security audit
- [ ] Update documentation
- [ ] Team training on new features

### Quarterly maintenance
- [ ] Major version updates
- [ ] Architecture review
- [ ] Capacity planning
- [ ] Cost optimization
- [ ] Compliance audits

## Monitoring en alerting

### Implementeer comprehensive monitoring:
\`\`\`javascript
class WorkflowMonitor {
  constructor() {
    this.metrics = {
      executions: new Map(),
      errors: [],
      performance: new Map(),
      alerts: []
    };
    
    this.thresholds = {
      errorRate: 0.05, // 5%
      avgExecutionTime: 60000, // 1 minute
      memoryUsage: 0.8, // 80%
      queueLength: 1000
    };
  }
  
  checkHealth() {
    const health = {
      status: 'healthy',
      checks: [],
      timestamp: new Date()
    };
    
    // Check error rate
    const errorRate = this.calculateErrorRate();
    if (errorRate > this.thresholds.errorRate) {
      health.status = 'unhealthy';
      health.checks.push({
        name: 'error_rate',
        status: 'critical',
        message: \`Error rate \${(errorRate * 100).toFixed(2)}% exceeds threshold\`
      });
      this.sendAlert('HIGH_ERROR_RATE', { rate: errorRate });
    }
    
    // Check performance
    const avgTime = this.getAverageExecutionTime();
    if (avgTime > this.thresholds.avgExecutionTime) {
      health.status = 'degraded';
      health.checks.push({
        name: 'performance',
        status: 'warning',
        message: \`Average execution time \${avgTime}ms exceeds threshold\`
      });
    }
    
    return health;
  }
  
  async sendAlert(type, data) {
    const alert = {
      type,
      data,
      timestamp: new Date(),
      severity: this.getSeverity(type)
    };
    
    this.alerts.push(alert);
    
    // Send to notification channels
    await this.notifySlack(alert);
    await this.notifyEmail(alert);
    
    if (alert.severity === 'critical') {
      await this.notifyPagerDuty(alert);
    }
  }
}
\`\`\`

## Production readiness checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Security scan completed
- [ ] Documentation updated
- [ ] Rollback plan prepared

### Deployment
- [ ] Blue-green deployment setup
- [ ] Health checks configured
- [ ] Monitoring enabled
- [ ] Alerts configured
- [ ] Backup verified

### Post-deployment
- [ ] Verify all workflows running
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] User acceptance testing
- [ ] Document lessons learned
  `,
  codeExamples: [
    {
      id: 'example-4-5-1',
      title: 'Production-ready workflow system',
      language: 'javascript',
      code: `// Complete production workflow system
class ProductionWorkflowSystem {
  constructor(config) {
    this.config = config;
    this.loadBalancer = new WorkflowLoadBalancer(config.workers);
    this.queue = new WorkflowQueue(config.queue);
    this.monitor = new WorkflowMonitor();
    this.cache = new CacheManager(config.cache);
    
    // Auto-scaling
    this.setupAutoScaling();
    
    // Health checks
    this.startHealthChecks();
  }
  
  setupAutoScaling() {
    setInterval(async () => {
      const metrics = await this.monitor.getMetrics();
      
      // Scale based on queue length
      if (metrics.queueLength > 1000) {
        await this.loadBalancer.scale(1.5);
      } else if (metrics.queueLength < 100) {
        await this.loadBalancer.scale(0.8);
      }
      
      // Scale based on response time
      if (metrics.avgResponseTime > 5000) {
        await this.loadBalancer.scale(1.2);
      }
    }, 60000); // Check every minute
  }
  
  startHealthChecks() {
    // Health endpoint
    this.healthEndpoint = async () => {
      const health = await this.monitor.checkHealth();
      const systemInfo = {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        workers: this.loadBalancer.workers.length,
        queueLength: this.queue.queue.length,
        cacheStats: await this.cache.getStats()
      };
      
      return {
        ...health,
        system: systemInfo
      };
    };
    
    // Liveness probe
    this.livenessProbe = async () => {
      try {
        // Test critical components
        await this.queue.health();
        await this.cache.ping();
        return { status: 'ok' };
      } catch (error) {
        return { status: 'error', message: error.message };
      }
    };
    
    // Readiness probe
    this.readinessProbe = async () => {
      const health = await this.healthEndpoint();
      return {
        ready: health.status !== 'unhealthy',
        details: health
      };
    };
  }
  
  async execute(workflow) {
    const execution = {
      id: crypto.randomUUID(),
      workflow,
      startTime: Date.now()
    };
    
    try {
      // Add to queue
      const jobId = await this.queue.add({
        execution,
        priority: workflow.priority || 0
      });
      
      // Track execution
      this.monitor.startExecution(execution.id);
      
      // Execute through load balancer
      const result = await this.loadBalancer.execute(execution);
      
      // Update metrics
      this.monitor.completeExecution(execution.id, {
        duration: Date.now() - execution.startTime,
        success: true
      });
      
      return result;
      
    } catch (error) {
      // Handle failure
      this.monitor.completeExecution(execution.id, {
        duration: Date.now() - execution.startTime,
        success: false,
        error: error.message
      });
      
      // Implement circuit breaker
      if (this.monitor.getErrorRate() > 0.5) {
        await this.circuitBreaker.open();
      }
      
      throw error;
    }
  }
}`
    }
  ],
  assignments: [
    {
      id: 'assignment-4-5-1',
      title: 'Production deployment',
      description: 'Bereid een complete workflow voor op production deployment. Inclusief monitoring, scaling strategy en maintenance plan.',
      difficulty: 'expert',
      type: 'project',
      initialCode: `// Production deployment checklist en setup
class ProductionDeployment {
  constructor() {
    this.environment = process.env.NODE_ENV;
    this.config = this.loadConfig();
  }
  
  // TODO: Implement production-ready features:
  
  // 1. Health checks
  async healthCheck() {
    // Check all critical services
    // Return detailed health status
  }
  
  // 2. Monitoring setup
  setupMonitoring() {
    // Configure metrics collection
    // Set up alerts and dashboards
  }
  
  // 3. Auto-scaling logic
  async autoScale() {
    // Monitor load and scale workers
    // Implement graceful scaling
  }
  
  // 4. Backup and recovery
  async backupWorkflows() {
    // Automated backup strategy
    // Test recovery procedures
  }
  
  // 5. Zero-downtime deployment
  async deploy(newVersion) {
    // Blue-green deployment
    // Rollback capability
  }
  
  // Create a complete production readiness plan
}`,
      hints: [
        'Implement health endpoints for load balancers',
        'Use Prometheus/Grafana for monitoring',
        'Test auto-scaling under load',
        'Document rollback procedures',
        'Create runbooks for common issues'
      ]
    }
  ],
  resources: [
    {
      title: 'Production Operations Guide',
      url: 'https://prod-ops.guide',
      type: 'guide'
    },
    {
      title: 'Scaling Workflows Best Practices',
      url: 'https://scaling-workflows.io',
      type: 'tutorial'
    }
  ]
};