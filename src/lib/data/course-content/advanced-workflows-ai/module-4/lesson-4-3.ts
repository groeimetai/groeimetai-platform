import { Lesson } from '@/lib/data/courses';

export const lesson4_3: Lesson = {
  id: 'lesson-4-3',
  title: 'Error handling strategieën',
  duration: '35 min',
  content: `
# Error handling strategieën

## Introductie

In moderne workflow automatisering is robuuste error handling cruciaal voor betrouwbare systemen. Deze les behandelt uitgebreide strategieën voor het omgaan met fouten, van basis error types tot geavanceerde patronen zoals circuit breakers en compensating transactions.

## Error types and classification

### Technische fouten categorieën

Workflow fouten kunnen worden geclassificeerd in verschillende categorieën, elk met eigen handling strategieën:

#### 1. Transient Errors (Tijdelijke fouten)
Fouten die tijdelijk zijn en vaak vanzelf oplossen:

\`\`\`javascript
// N8N Error classification
const errorTypes = {
  transient: {
    networkTimeout: {
      code: 'ETIMEDOUT',
      retryable: true,
      maxRetries: 3,
      backoffStrategy: 'exponential'
    },
    rateLimitExceeded: {
      code: 'RATE_LIMIT',
      retryable: true,
      maxRetries: 5,
      backoffStrategy: 'linear',
      waitTime: 60000 // 1 minuut
    },
    temporaryUnavailable: {
      code: 'SERVICE_UNAVAILABLE',
      retryable: true,
      maxRetries: 3,
      backoffStrategy: 'exponential'
    }
  }
};
\`\`\`

#### 2. Permanent Errors (Permanente fouten)
Fouten die niet vanzelf oplossen en interventie vereisen:

\`\`\`javascript
const permanentErrors = {
  authenticationFailed: {
    code: 'AUTH_FAILED',
    retryable: false,
    action: 'notify_admin',
    severity: 'high'
  },
  invalidData: {
    code: 'VALIDATION_ERROR',
    retryable: false,
    action: 'log_and_skip',
    severity: 'medium'
  },
  resourceNotFound: {
    code: 'NOT_FOUND',
    retryable: false,
    action: 'compensate',
    severity: 'low'
  }
};
\`\`\`

#### 3. Business Logic Errors
Fouten gerelateerd aan business regels:

\`\`\`javascript
// Business logic error handling
class BusinessRuleError extends Error {
  constructor(rule, context) {
    super(\`Business rule violation: \${rule}\`);
    this.name = 'BusinessRuleError';
    this.rule = rule;
    this.context = context;
    this.retryable = false;
    this.requiresCompensation = true;
  }
}

// Voorbeeld implementatie
function validateOrder(order) {
  if (order.total > order.customer.creditLimit) {
    throw new BusinessRuleError(
      'CREDIT_LIMIT_EXCEEDED',
      {
        orderTotal: order.total,
        creditLimit: order.customer.creditLimit,
        customerId: order.customer.id
      }
    );
  }
}
\`\`\`

### Error Classification Framework

\`\`\`javascript
// Comprehensive error classification system
class ErrorClassifier {
  constructor() {
    this.classificationRules = new Map([
      ['ETIMEDOUT', { type: 'transient', severity: 'low', retryable: true }],
      ['ECONNREFUSED', { type: 'transient', severity: 'medium', retryable: true }],
      ['401', { type: 'permanent', severity: 'high', retryable: false }],
      ['403', { type: 'permanent', severity: 'high', retryable: false }],
      ['404', { type: 'permanent', severity: 'low', retryable: false }],
      ['429', { type: 'transient', severity: 'low', retryable: true }],
      ['500', { type: 'transient', severity: 'high', retryable: true }],
      ['503', { type: 'transient', severity: 'medium', retryable: true }]
    ]);
  }

  classify(error) {
    const errorCode = error.code || error.statusCode?.toString();
    const classification = this.classificationRules.get(errorCode) || {
      type: 'unknown',
      severity: 'medium',
      retryable: false
    };

    return {
      ...classification,
      timestamp: new Date().toISOString(),
      errorCode,
      message: error.message,
      stack: error.stack
    };
  }
}
\`\`\`

## Retry patterns

### Linear Retry Pattern

Het meest basale retry patroon met vaste intervals:

\`\`\`javascript
// Linear retry implementation
async function linearRetry(fn, options = {}) {
  const {
    maxAttempts = 3,
    delay = 1000,
    onRetry = () => {}
  } = options;

  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts) {
        throw new Error(\`Failed after \${maxAttempts} attempts: \${error.message}\`);
      }
      
      onRetry({ attempt, error, nextDelay: delay });
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// Gebruik in N8N Function node
const result = await linearRetry(
  async () => {
    const response = await \$http.get('https://api.example.com/data');
    return response.data;
  },
  {
    maxAttempts: 5,
    delay: 2000,
    onRetry: ({ attempt, error }) => {
      console.log(\`Retry attempt \${attempt} after error: \${error.message}\`);
    }
  }
);
\`\`\`

### Exponential Backoff Pattern

Geavanceerder patroon met exponentieel toenemende wachttijden:

\`\`\`javascript
// Exponential backoff implementation
class ExponentialBackoff {
  constructor(options = {}) {
    this.baseDelay = options.baseDelay || 1000;
    this.maxDelay = options.maxDelay || 60000;
    this.factor = options.factor || 2;
    this.jitter = options.jitter || true;
    this.maxAttempts = options.maxAttempts || 5;
  }

  calculateDelay(attempt) {
    let delay = Math.min(
      this.baseDelay * Math.pow(this.factor, attempt - 1),
      this.maxDelay
    );

    if (this.jitter) {
      // Add random jitter to prevent thundering herd
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return Math.floor(delay);
  }

  async execute(fn) {
    let lastError;

    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (attempt === this.maxAttempts) {
          throw new Error(
            \`Exponential backoff failed after \${this.maxAttempts} attempts: \${error.message}\`
          );
        }

        const delay = this.calculateDelay(attempt);
        console.log(\`Attempt \${attempt} failed, retrying in \${delay}ms\`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
}

// Gebruik voorbeeld
const backoff = new ExponentialBackoff({
  baseDelay: 1000,
  maxDelay: 30000,
  factor: 2,
  jitter: true,
  maxAttempts: 6
});

const data = await backoff.execute(async () => {
  return await fetchDataFromAPI();
});
\`\`\`

### Advanced Retry Strategies

\`\`\`javascript
// Adaptive retry met circuit breaker integratie
class AdaptiveRetryStrategy {
  constructor() {
    this.successRate = new Map();
    this.errorCounts = new Map();
  }

  async executeWithRetry(endpoint, fn, options = {}) {
    const {
      initialDelay = 1000,
      maxAttempts = 5,
      backoffMultiplier = 1.5
    } = options;

    // Check circuit breaker status
    if (this.isCircuitOpen(endpoint)) {
      throw new Error(\`Circuit breaker is open for \${endpoint}\`);
    }

    let delay = initialDelay;
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await fn();
        this.recordSuccess(endpoint);
        return result;
      } catch (error) {
        lastError = error;
        this.recordError(endpoint);

        if (!this.shouldRetry(error) || attempt === maxAttempts) {
          throw error;
        }

        // Adaptive delay based on error rate
        const errorRate = this.getErrorRate(endpoint);
        const adaptiveMultiplier = 1 + (errorRate * 0.5);
        delay = delay * backoffMultiplier * adaptiveMultiplier;

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  shouldRetry(error) {
    const nonRetryableErrors = [401, 403, 404, 422];
    return !nonRetryableErrors.includes(error.statusCode);
  }

  recordSuccess(endpoint) {
    const current = this.successRate.get(endpoint) || { success: 0, total: 0 };
    current.success++;
    current.total++;
    this.successRate.set(endpoint, current);
  }

  recordError(endpoint) {
    const current = this.errorCounts.get(endpoint) || 0;
    this.errorCounts.set(endpoint, current + 1);
    
    const rate = this.successRate.get(endpoint) || { success: 0, total: 0 };
    rate.total++;
    this.successRate.set(endpoint, rate);
  }

  getErrorRate(endpoint) {
    const stats = this.successRate.get(endpoint);
    if (!stats || stats.total === 0) return 0;
    return (stats.total - stats.success) / stats.total;
  }

  isCircuitOpen(endpoint) {
    const errorCount = this.errorCounts.get(endpoint) || 0;
    const errorRate = this.getErrorRate(endpoint);
    return errorCount > 10 && errorRate > 0.5;
  }
}
\`\`\`

## Circuit Breaker Pattern

Het Circuit Breaker patroon voorkomt cascade failures door tijdelijk requests te blokkeren naar falende services:

\`\`\`javascript
// Complete Circuit Breaker implementatie
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 1 minuut
    this.monitoringPeriod = options.monitoringPeriod || 10000; // 10 seconden
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.successes = 0;
    this.nextAttempt = Date.now();
    this.monitoringWindow = [];
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;
    this.monitoringWindow.push({ timestamp: Date.now(), success: true });
    
    if (this.state === 'HALF_OPEN') {
      this.successes++;
      if (this.successes > 2) {
        this.state = 'CLOSED';
        this.successes = 0;
      }
    }
    
    this.cleanMonitoringWindow();
  }

  onFailure() {
    this.failures++;
    this.monitoringWindow.push({ timestamp: Date.now(), success: false });
    
    if (this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
      this.successes = 0;
    } else if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
    }
    
    this.cleanMonitoringWindow();
  }

  cleanMonitoringWindow() {
    const cutoff = Date.now() - this.monitoringPeriod;
    this.monitoringWindow = this.monitoringWindow.filter(
      event => event.timestamp > cutoff
    );
  }

  getMetrics() {
    this.cleanMonitoringWindow();
    const total = this.monitoringWindow.length;
    const failures = this.monitoringWindow.filter(e => !e.success).length;
    
    return {
      state: this.state,
      totalRequests: total,
      failureCount: failures,
      failureRate: total > 0 ? failures / total : 0,
      nextAttempt: this.state === 'OPEN' ? new Date(this.nextAttempt) : null
    };
  }
}

// N8N implementatie met Circuit Breaker
const apiBreaker = new CircuitBreaker({
  failureThreshold: 3,
  resetTimeout: 30000,
  monitoringPeriod: 60000
});

// In N8N Function node
try {
  const result = await apiBreaker.execute(async () => {
    return await \$http.get('https://api.example.com/data');
  });
  
  return { success: true, data: result.data };
} catch (error) {
  if (error.message === 'Circuit breaker is OPEN') {
    // Fallback logic
    return { success: false, fallback: true, cachedData: getCachedData() };
  }
  throw error;
}
\`\`\`

## Compensating Transactions

Compensating transactions zijn acties die de effecten van eerdere operaties ongedaan maken bij fouten:

\`\`\`javascript
// Saga pattern implementation voor compensating transactions
class WorkflowSaga {
  constructor() {
    this.steps = [];
    this.compensations = [];
    this.executedSteps = [];
  }

  addStep(name, forward, compensate) {
    this.steps.push({
      name,
      forward,
      compensate: compensate || (() => {})
    });
  }

  async execute() {
    const results = [];

    try {
      // Execute forward operations
      for (const step of this.steps) {
        console.log(\`Executing step: \${step.name}\`);
        const result = await step.forward();
        results.push(result);
        this.executedSteps.push(step);
      }

      return { success: true, results };
    } catch (error) {
      console.error(\`Error in step \${this.executedSteps.length}: \${error.message}\`);
      
      // Execute compensations in reverse order
      await this.compensate();
      
      throw new Error(\`Saga failed and was compensated: \${error.message}\`);
    }
  }

  async compensate() {
    console.log('Starting compensation process...');
    
    // Reverse the executed steps
    const stepsToCompensate = [...this.executedSteps].reverse();
    
    for (const step of stepsToCompensate) {
      try {
        console.log(\`Compensating step: \${step.name}\`);
        await step.compensate();
      } catch (compensationError) {
        console.error(
          \`Failed to compensate \${step.name}: \${compensationError.message}\`
        );
        // Log but continue with other compensations
      }
    }
  }
}

// Praktisch voorbeeld: Order processing saga
async function processOrderSaga(order) {
  const saga = new WorkflowSaga();

  // Step 1: Reserve inventory
  saga.addStep(
    'reserveInventory',
    async () => {
      const reservation = await inventoryService.reserve(order.items);
      return { reservationId: reservation.id };
    },
    async () => {
      await inventoryService.cancelReservation(order.id);
    }
  );

  // Step 2: Process payment
  saga.addStep(
    'processPayment',
    async () => {
      const payment = await paymentService.charge(order.payment);
      return { transactionId: payment.id };
    },
    async () => {
      await paymentService.refund(order.payment.transactionId);
    }
  );

  // Step 3: Create shipment
  saga.addStep(
    'createShipment',
    async () => {
      const shipment = await shippingService.createLabel(order.shipping);
      return { trackingNumber: shipment.tracking };
    },
    async () => {
      await shippingService.cancelShipment(order.shipmentId);
    }
  );

  // Step 4: Send confirmation
  saga.addStep(
    'sendConfirmation',
    async () => {
      await emailService.sendOrderConfirmation(order);
      return { emailSent: true };
    },
    async () => {
      await emailService.sendCancellationNotice(order);
    }
  );

  try {
    const result = await saga.execute();
    return { success: true, order: { ...order, ...result } };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      compensated: true 
    };
  }
}
\`\`\`

### Advanced Compensation Patterns

\`\`\`javascript
// Two-phase commit pattern voor distributed transactions
class TwoPhaseCommit {
  constructor(participants) {
    this.participants = participants;
    this.transactionId = this.generateTransactionId();
    this.votes = new Map();
  }

  generateTransactionId() {
    return \`txn_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
  }

  async execute(operation) {
    try {
      // Phase 1: Prepare
      const prepareResults = await this.prepare(operation);
      
      // Check all votes
      const allVotedYes = prepareResults.every(result => result.vote === 'YES');
      
      if (!allVotedYes) {
        await this.abort();
        throw new Error('Transaction aborted: Not all participants voted YES');
      }

      // Phase 2: Commit
      await this.commit();
      
      return { 
        success: true, 
        transactionId: this.transactionId 
      };
    } catch (error) {
      await this.abort();
      throw error;
    }
  }

  async prepare(operation) {
    const preparePromises = this.participants.map(async participant => {
      try {
        const vote = await participant.prepare(this.transactionId, operation);
        this.votes.set(participant.id, vote);
        return { 
          participantId: participant.id, 
          vote: vote ? 'YES' : 'NO' 
        };
      } catch (error) {
        return { 
          participantId: participant.id, 
          vote: 'NO', 
          error: error.message 
        };
      }
    });

    return await Promise.all(preparePromises);
  }

  async commit() {
    const commitPromises = this.participants.map(participant =>
      participant.commit(this.transactionId)
    );
    
    await Promise.all(commitPromises);
  }

  async abort() {
    const abortPromises = this.participants.map(participant =>
      participant.abort(this.transactionId).catch(error => {
        console.error(\`Failed to abort for \${participant.id}: \${error.message}\`);
      })
    );
    
    await Promise.all(abortPromises);
  }
}

// Participant implementation
class TransactionParticipant {
  constructor(id, service) {
    this.id = id;
    this.service = service;
    this.preparedTransactions = new Map();
  }

  async prepare(transactionId, operation) {
    try {
      // Validate and prepare the operation
      const canExecute = await this.service.validate(operation);
      
      if (canExecute) {
        // Store the prepared state
        this.preparedTransactions.set(transactionId, {
          operation,
          timestamp: Date.now(),
          state: 'PREPARED'
        });
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  async commit(transactionId) {
    const prepared = this.preparedTransactions.get(transactionId);
    if (!prepared) {
      throw new Error(\`No prepared transaction found: \${transactionId}\`);
    }

    try {
      await this.service.execute(prepared.operation);
      prepared.state = 'COMMITTED';
    } finally {
      this.preparedTransactions.delete(transactionId);
    }
  }

  async abort(transactionId) {
    const prepared = this.preparedTransactions.get(transactionId);
    if (prepared && prepared.state === 'PREPARED') {
      await this.service.rollback(prepared.operation);
    }
    this.preparedTransactions.delete(transactionId);
  }
}
\`\`\`

## Error Aggregation

Error aggregation verzamelt en analyseert fouten voor betere inzichten:

\`\`\`javascript
// Error aggregation system
class ErrorAggregator {
  constructor(options = {}) {
    this.errors = [];
    this.maxErrors = options.maxErrors || 1000;
    this.aggregationWindow = options.aggregationWindow || 300000; // 5 minuten
    this.patterns = new Map();
  }

  addError(error, context = {}) {
    const errorEntry = {
      timestamp: Date.now(),
      type: error.constructor.name,
      message: error.message,
      code: error.code || error.statusCode,
      stack: error.stack,
      context,
      fingerprint: this.generateFingerprint(error)
    };

    this.errors.push(errorEntry);
    this.updatePatterns(errorEntry);
    
    // Maintain size limit
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    return errorEntry;
  }

  generateFingerprint(error) {
    // Create unique fingerprint for error grouping
    const components = [
      error.constructor.name,
      error.code || error.statusCode || 'UNKNOWN',
      error.message.split(' ').slice(0, 5).join(' ')
    ];
    
    return components.join(':');
  }

  updatePatterns(errorEntry) {
    const pattern = this.patterns.get(errorEntry.fingerprint) || {
      count: 0,
      firstSeen: errorEntry.timestamp,
      lastSeen: errorEntry.timestamp,
      contexts: []
    };

    pattern.count++;
    pattern.lastSeen = errorEntry.timestamp;
    pattern.contexts.push(errorEntry.context);

    this.patterns.set(errorEntry.fingerprint, pattern);
  }

  getAggregatedReport() {
    const now = Date.now();
    const windowStart = now - this.aggregationWindow;
    
    // Filter recent errors
    const recentErrors = this.errors.filter(e => e.timestamp > windowStart);
    
    // Calculate statistics
    const errorsByType = {};
    const errorsByCode = {};
    const errorTimeline = [];

    recentErrors.forEach(error => {
      // By type
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
      
      // By code
      if (error.code) {
        errorsByCode[error.code] = (errorsByCode[error.code] || 0) + 1;
      }
      
      // Timeline (per minute)
      const minute = Math.floor(error.timestamp / 60000) * 60000;
      const timelineEntry = errorTimeline.find(e => e.minute === minute);
      
      if (timelineEntry) {
        timelineEntry.count++;
      } else {
        errorTimeline.push({ minute, count: 1 });
      }
    });

    // Get top patterns
    const topPatterns = Array.from(this.patterns.entries())
      .map(([fingerprint, data]) => ({
        fingerprint,
        ...data,
        rate: data.count / ((data.lastSeen - data.firstSeen) / 1000 / 60)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      summary: {
        totalErrors: recentErrors.length,
        uniquePatterns: this.patterns.size,
        timeWindow: this.aggregationWindow / 1000 / 60 + ' minutes'
      },
      byType: errorsByType,
      byCode: errorsByCode,
      timeline: errorTimeline.sort((a, b) => a.minute - b.minute),
      topPatterns,
      alerts: this.generateAlerts(recentErrors, topPatterns)
    };
  }

  generateAlerts(recentErrors, topPatterns) {
    const alerts = [];
    
    // High error rate alert
    const errorRate = recentErrors.length / (this.aggregationWindow / 1000 / 60);
    if (errorRate > 10) {
      alerts.push({
        severity: 'HIGH',
        type: 'ERROR_RATE',
        message: \`High error rate detected: \${errorRate.toFixed(2)} errors/minute\`
      });
    }

    // Spike detection
    topPatterns.forEach(pattern => {
      if (pattern.rate > 5 && pattern.count > 10) {
        alerts.push({
          severity: 'MEDIUM',
          type: 'ERROR_SPIKE',
          message: \`Error spike detected for pattern: \${pattern.fingerprint}\`,
          details: pattern
        });
      }
    });

    return alerts;
  }

  exportMetrics() {
    const report = this.getAggregatedReport();
    
    return {
      timestamp: new Date().toISOString(),
      metrics: {
        error_count: report.summary.totalErrors,
        unique_patterns: report.summary.uniquePatterns,
        error_rate: report.summary.totalErrors / (this.aggregationWindow / 1000 / 60),
        top_error_type: Object.entries(report.byType)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none',
        alerts_count: report.alerts.length
      },
      report
    };
  }
}

// Integration with N8N workflow
const errorAggregator = new ErrorAggregator({
  maxErrors: 500,
  aggregationWindow: 600000 // 10 minuten
});

// In error handling nodes
function handleWorkflowError(error, nodeContext) {
  // Add to aggregator
  errorAggregator.addError(error, {
    nodeId: nodeContext.nodeId,
    workflowId: nodeContext.workflowId,
    executionId: nodeContext.executionId,
    inputData: nodeContext.inputData
  });

  // Get current status
  const report = errorAggregator.getAggregatedReport();
  
  // Check for alerts
  if (report.alerts.length > 0) {
    // Send notifications
    report.alerts.forEach(alert => {
      if (alert.severity === 'HIGH') {
        sendSlackNotification({
          channel: '#workflow-alerts',
          message: alert.message,
          details: alert.details
        });
      }
    });
  }

  // Return for workflow decision
  return {
    shouldRetry: isRetryableError(error),
    aggregationReport: report,
    suggestedAction: determineSuggestedAction(error, report)
  };
}
\`\`\`

## Best Practices voor Error Handling

### 1. Structured Error Logging

\`\`\`javascript
// Structured logging voor betere error tracking
class WorkflowLogger {
  constructor(workflowId) {
    this.workflowId = workflowId;
    this.correlationId = this.generateCorrelationId();
  }

  generateCorrelationId() {
    return \`\${this.workflowId}-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
  }

  logError(error, context = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      correlationId: this.correlationId,
      workflowId: this.workflowId,
      error: {
        type: error.constructor.name,
        message: error.message,
        code: error.code,
        stack: error.stack
      },
      context,
      metadata: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage()
      }
    };

    // Send to logging service
    console.error(JSON.stringify(logEntry));
    
    return logEntry;
  }
}
\`\`\`

### 2. Graceful Degradation

\`\`\`javascript
// Fallback strategies voor graceful degradation
class GracefulDegradation {
  constructor() {
    this.fallbackStrategies = new Map();
  }

  registerFallback(serviceName, fallbackFn) {
    this.fallbackStrategies.set(serviceName, fallbackFn);
  }

  async executeWithFallback(serviceName, primaryFn) {
    try {
      return await primaryFn();
    } catch (error) {
      console.warn(\`Primary service failed: \${serviceName}, using fallback\`);
      
      const fallback = this.fallbackStrategies.get(serviceName);
      if (!fallback) {
        throw new Error(\`No fallback registered for \${serviceName}\`);
      }

      return await fallback(error);
    }
  }
}

// Voorbeeld gebruik
const degradation = new GracefulDegradation();

// Register fallbacks
degradation.registerFallback('user-service', async (error) => {
  // Return cached user data
  return getCachedUserData();
});

degradation.registerFallback('payment-service', async (error) => {
  // Queue for later processing
  return { status: 'queued', message: 'Payment will be processed when service is available' };
});
\`\`\`

## Praktijkvoorbeeld: Complete Error Handling Setup

\`\`\`javascript
// Complete error handling setup voor N8N workflow
class WorkflowErrorHandler {
  constructor(config = {}) {
    this.circuitBreaker = new CircuitBreaker(config.circuitBreaker);
    this.retryStrategy = new AdaptiveRetryStrategy();
    this.errorAggregator = new ErrorAggregator(config.aggregator);
    this.logger = new WorkflowLogger(config.workflowId);
    this.degradation = new GracefulDegradation();
  }

  async executeWithFullProtection(operation, options = {}) {
    const {
      serviceName,
      fallback,
      compensate,
      retryable = true
    } = options;

    try {
      // Register fallback if provided
      if (fallback) {
        this.degradation.registerFallback(serviceName, fallback);
      }

      // Execute with circuit breaker
      const result = await this.circuitBreaker.execute(async () => {
        if (retryable) {
          // Execute with retry
          return await this.retryStrategy.executeWithRetry(
            serviceName,
            operation
          );
        } else {
          // Execute directly
          return await operation();
        }
      });

      return { success: true, data: result };

    } catch (error) {
      // Log error
      this.logger.logError(error, { serviceName });
      
      // Add to aggregator
      this.errorAggregator.addError(error, { serviceName });

      // Try fallback
      if (fallback) {
        try {
          const fallbackResult = await this.degradation.executeWithFallback(
            serviceName,
            operation
          );
          return { success: true, data: fallbackResult, fallback: true };
        } catch (fallbackError) {
          this.logger.logError(fallbackError, { 
            serviceName, 
            context: 'fallback_failed' 
          });
        }
      }

      // Execute compensation if needed
      if (compensate) {
        try {
          await compensate(error);
        } catch (compensationError) {
          this.logger.logError(compensationError, { 
            serviceName, 
            context: 'compensation_failed' 
          });
        }
      }

      // Get aggregation report for context
      const report = this.errorAggregator.getAggregatedReport();

      throw {
        originalError: error,
        serviceName,
        aggregationReport: report,
        suggestions: this.getSuggestions(error, report)
      };
    }
  }

  getSuggestions(error, report) {
    const suggestions = [];

    if (report.alerts.some(a => a.type === 'ERROR_RATE')) {
      suggestions.push('Consider scaling up resources or implementing rate limiting');
    }

    if (error.code === 'ETIMEDOUT') {
      suggestions.push('Increase timeout values or check network connectivity');
    }

    if (error.statusCode === 429) {
      suggestions.push('Implement better rate limiting or request batching');
    }

    return suggestions;
  }
}

// Usage in N8N Function node
const errorHandler = new WorkflowErrorHandler({
  workflowId: \$workflow.id,
  circuitBreaker: {
    failureThreshold: 5,
    resetTimeout: 60000
  },
  aggregator: {
    maxErrors: 1000,
    aggregationWindow: 600000
  }
});

// Execute API call with full protection
const result = await errorHandler.executeWithFullProtection(
  async () => {
    return await \$http.get('https://api.example.com/data');
  },
  {
    serviceName: 'example-api',
    retryable: true,
    fallback: async () => {
      // Return cached data as fallback
      return { data: getCachedData(), cached: true };
    },
    compensate: async (error) => {
      // Clean up any partial operations
      await cleanupPartialData();
    }
  }
);

return result;
\`\`\`

Deze uitgebreide error handling strategieën bieden een robuust framework voor het bouwen van betrouwbare workflow automatiseringen die graceful omgaan met fouten en maximale uptime garanderen.
  `,
  codeExamples: [
    {
      id: 'error-classification',
      title: 'Complete Error Classification System',
      language: 'javascript',
      code: `// Comprehensive error classification and handling
class ErrorManagementSystem {
  constructor() {
    this.errorTypes = {
      transient: ['ETIMEDOUT', 'ECONNREFUSED', '429', '503'],
      permanent: ['401', '403', '404', '422'],
      business: ['VALIDATION_ERROR', 'BUSINESS_RULE_VIOLATION']
    };
    
    this.handlers = new Map();
    this.metrics = new Map();
  }

  classifyError(error) {
    const code = error.code || error.statusCode?.toString();
    
    for (const [type, codes] of Object.entries(this.errorTypes)) {
      if (codes.includes(code)) {
        return {
          type,
          code,
          retryable: type === 'transient',
          severity: this.calculateSeverity(type, code)
        };
      }
    }
    
    return {
      type: 'unknown',
      code,
      retryable: false,
      severity: 'medium'
    };
  }

  calculateSeverity(type, code) {
    if (type === 'permanent' && ['401', '403'].includes(code)) {
      return 'high';
    }
    if (type === 'transient') {
      return 'low';
    }
    return 'medium';
  }

  async handleError(error, context) {
    const classification = this.classifyError(error);
    this.recordMetrics(classification);
    
    const handler = this.handlers.get(classification.type) || this.defaultHandler;
    return await handler(error, classification, context);
  }

  recordMetrics(classification) {
    const key = \`\${classification.type}:\${classification.code}\`;
    const current = this.metrics.get(key) || 0;
    this.metrics.set(key, current + 1);
  }
}`
    },
    {
      id: 'smart-retry',
      title: 'Advanced Retry with Jitter and Backoff',
      language: 'javascript',
      code: `// Production-ready retry implementation
class SmartRetry {
  constructor(options = {}) {
    this.config = {
      maxAttempts: options.maxAttempts || 5,
      baseDelay: options.baseDelay || 1000,
      maxDelay: options.maxDelay || 30000,
      factor: options.factor || 2,
      jitter: options.jitter !== false,
      retryCondition: options.retryCondition || (() => true)
    };
  }

  async execute(fn, context = {}) {
    let lastError;
    const startTime = Date.now();

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        const result = await fn();
        this.logSuccess(attempt, Date.now() - startTime);
        return result;
      } catch (error) {
        lastError = error;
        
        if (!this.shouldRetry(error, attempt)) {
          throw error;
        }

        const delay = this.calculateDelay(attempt);
        await this.wait(delay);
        
        this.logRetry(attempt, delay, error);
      }
    }

    throw new Error(
      \`Failed after \${this.config.maxAttempts} attempts: \${lastError.message}\`
    );
  }

  shouldRetry(error, attempt) {
    if (attempt >= this.config.maxAttempts) return false;
    return this.config.retryCondition(error, attempt);
  }

  calculateDelay(attempt) {
    let delay = Math.min(
      this.config.baseDelay * Math.pow(this.config.factor, attempt - 1),
      this.config.maxDelay
    );

    if (this.config.jitter) {
      // Full jitter strategy
      delay = Math.random() * delay;
    }

    return Math.floor(delay);
  }

  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  logSuccess(attempt, duration) {
    console.log(\`Success on attempt \${attempt} after \${duration}ms\`);
  }

  logRetry(attempt, delay, error) {
    console.log(
      \`Retry attempt \${attempt} in \${delay}ms due to: \${error.message}\`
    );
  }
}`
    },
    {
      id: 'circuit-breaker-health',
      title: 'Circuit Breaker with Health Checks',
      language: 'javascript',
      code: `// Enterprise Circuit Breaker implementation
class EnhancedCircuitBreaker {
  constructor(options = {}) {
    this.config = {
      failureThreshold: options.failureThreshold || 5,
      successThreshold: options.successThreshold || 2,
      timeout: options.timeout || 60000,
      volumeThreshold: options.volumeThreshold || 10,
      errorThresholdPercentage: options.errorThresholdPercentage || 50,
      healthCheckInterval: options.healthCheckInterval || 30000
    };
    
    this.state = 'CLOSED';
    this.stats = this.initStats();
    this.healthChecker = null;
  }

  initStats() {
    return {
      requests: 0,
      failures: 0,
      successes: 0,
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
      lastFailureTime: null,
      lastSuccessTime: null
    };
  }

  async execute(fn, fallback) {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
      } else if (fallback) {
        return await fallback();
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await this.executeWithTimeout(fn);
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      
      if (this.state === 'OPEN' && fallback) {
        return await fallback();
      }
      
      throw error;
    }
  }

  async executeWithTimeout(fn) {
    return Promise.race([
      fn(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Circuit breaker timeout')), 
        this.config.timeout)
      )
    ]);
  }

  recordSuccess() {
    this.stats.requests++;
    this.stats.successes++;
    this.stats.consecutiveSuccesses++;
    this.stats.consecutiveFailures = 0;
    this.stats.lastSuccessTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      if (this.stats.consecutiveSuccesses >= this.config.successThreshold) {
        this.close();
      }
    }
  }

  recordFailure() {
    this.stats.requests++;
    this.stats.failures++;
    this.stats.consecutiveFailures++;
    this.stats.consecutiveSuccesses = 0;
    this.stats.lastFailureTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      this.open();
    } else if (this.state === 'CLOSED') {
      if (this.shouldOpen()) {
        this.open();
      }
    }
  }

  shouldOpen() {
    if (this.stats.requests < this.config.volumeThreshold) {
      return false;
    }

    const failurePercentage = (this.stats.failures / this.stats.requests) * 100;
    
    return (
      this.stats.consecutiveFailures >= this.config.failureThreshold ||
      failurePercentage >= this.config.errorThresholdPercentage
    );
  }

  shouldAttemptReset() {
    return Date.now() - this.stats.lastFailureTime > this.config.timeout;
  }

  open() {
    this.state = 'OPEN';
    this.startHealthCheck();
  }

  close() {
    this.state = 'CLOSED';
    this.stopHealthCheck();
    this.stats = this.initStats();
  }

  startHealthCheck() {
    if (!this.healthChecker) {
      this.healthChecker = setInterval(() => {
        if (this.shouldAttemptReset()) {
          this.state = 'HALF_OPEN';
        }
      }, this.config.healthCheckInterval);
    }
  }

  stopHealthCheck() {
    if (this.healthChecker) {
      clearInterval(this.healthChecker);
      this.healthChecker = null;
    }
  }

  getMetrics() {
    return {
      state: this.state,
      stats: { ...this.stats },
      errorRate: this.stats.requests > 0 
        ? (this.stats.failures / this.stats.requests) * 100 
        : 0
    };
  }
}`
    },
    {
      id: 'saga-orchestrator',
      title: 'Saga Pattern for Distributed Transactions',
      language: 'javascript',
      code: `// Complete Saga orchestrator for complex workflows
class SagaOrchestrator {
  constructor() {
    this.sagas = new Map();
    this.executionLog = [];
  }

  defineSaga(name, steps) {
    const saga = {
      name,
      steps: steps.map((step, index) => ({
        id: \`\${name}_step_\${index}\`,
        ...step,
        status: 'pending'
      }))
    };
    
    this.sagas.set(name, saga);
    return saga;
  }

  async executeSaga(sagaName, context = {}) {
    const saga = this.sagas.get(sagaName);
    if (!saga) {
      throw new Error(\`Saga not found: \${sagaName}\`);
    }

    const execution = {
      id: this.generateExecutionId(),
      sagaName,
      startTime: Date.now(),
      context,
      completedSteps: [],
      status: 'running'
    };

    try {
      for (const step of saga.steps) {
        execution.currentStep = step.id;
        
        const stepResult = await this.executeStep(step, context);
        
        execution.completedSteps.push({
          stepId: step.id,
          result: stepResult,
          timestamp: Date.now()
        });
        
        // Update context for next steps
        context = { ...context, ...stepResult };
      }

      execution.status = 'completed';
      execution.endTime = Date.now();
      
      this.executionLog.push(execution);
      return { success: true, execution };

    } catch (error) {
      execution.status = 'failed';
      execution.error = error.message;
      execution.endTime = Date.now();

      // Compensate in reverse order
      await this.compensate(execution.completedSteps, saga);
      
      this.executionLog.push(execution);
      throw new Error(\`Saga failed: \${error.message}\`);
    }
  }

  async executeStep(step, context) {
    console.log(\`Executing step: \${step.name}\`);
    
    try {
      const result = await step.action(context);
      return result;
    } catch (error) {
      console.error(\`Step failed: \${step.name} - \${error.message}\`);
      throw error;
    }
  }

  async compensate(completedSteps, saga) {
    console.log('Starting compensation process...');
    
    for (const completed of completedSteps.reverse()) {
      const step = saga.steps.find(s => s.id === completed.stepId);
      
      if (step && step.compensate) {
        try {
          console.log(\`Compensating: \${step.name}\`);
          await step.compensate(completed.result);
        } catch (error) {
          console.error(\`Compensation failed for \${step.name}: \${error.message}\`);
        }
      }
    }
  }

  generateExecutionId() {
    return \`exec_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
  }

  getExecutionHistory(sagaName) {
    return this.executionLog.filter(e => e.sagaName === sagaName);
  }
}

// Example usage
const orchestrator = new SagaOrchestrator();

orchestrator.defineSaga('orderProcessing', [
  {
    name: 'validateOrder',
    action: async (context) => {
      const validation = await orderService.validate(context.order);
      if (!validation.isValid) throw new Error(validation.error);
      return { validationId: validation.id };
    }
  },
  {
    name: 'reserveInventory',
    action: async (context) => {
      const reservation = await inventoryService.reserve(context.order.items);
      return { reservationId: reservation.id };
    },
    compensate: async (result) => {
      await inventoryService.releaseReservation(result.reservationId);
    }
  },
  {
    name: 'processPayment',
    action: async (context) => {
      const payment = await paymentService.process(context.order.payment);
      return { paymentId: payment.transactionId };
    },
    compensate: async (result) => {
      await paymentService.refund(result.paymentId);
    }
  },
  {
    name: 'createShipment',
    action: async (context) => {
      const shipment = await shippingService.create(context.order);
      return { shipmentId: shipment.id, tracking: shipment.trackingNumber };
    },
    compensate: async (result) => {
      await shippingService.cancel(result.shipmentId);
    }
  }
]);`
    },
    {
      id: 'error-monitoring',
      title: 'Error Aggregation and Monitoring',
      language: 'javascript',
      code: `// Advanced error aggregation with alerting
class ErrorMonitor {
  constructor(options = {}) {
    this.config = {
      windowSize: options.windowSize || 300000, // 5 minutes
      alertThresholds: options.alertThresholds || {
        errorRate: 10, // errors per minute
        errorSpike: 2, // multiplier of baseline
        criticalErrors: 5 // count of critical errors
      }
    };
    
    this.errorWindow = [];
    this.baseline = null;
    this.alerts = [];
  }

  recordError(error, context = {}) {
    const errorRecord = {
      timestamp: Date.now(),
      type: error.constructor.name,
      message: error.message,
      severity: this.calculateSeverity(error),
      context,
      fingerprint: this.generateFingerprint(error),
      stackTrace: error.stack
    };

    this.errorWindow.push(errorRecord);
    this.cleanWindow();
    this.checkAlerts();
    
    return errorRecord;
  }

  calculateSeverity(error) {
    if (error.code === 'AUTH_FAILED' || error.statusCode === 401) {
      return 'critical';
    }
    if (error.code === 'RATE_LIMIT' || error.statusCode === 429) {
      return 'warning';
    }
    if (error.code === 'TIMEOUT') {
      return 'info';
    }
    return 'error';
  }

  generateFingerprint(error) {
    const key = [
      error.constructor.name,
      error.code || error.statusCode,
      error.message.substring(0, 50)
    ].join(':');
    
    return Buffer.from(key).toString('base64');
  }

  cleanWindow() {
    const cutoff = Date.now() - this.config.windowSize;
    this.errorWindow = this.errorWindow.filter(e => e.timestamp > cutoff);
  }

  checkAlerts() {
    const metrics = this.getMetrics();
    
    // Check error rate
    if (metrics.errorRate > this.config.alertThresholds.errorRate) {
      this.createAlert('HIGH_ERROR_RATE', {
        current: metrics.errorRate,
        threshold: this.config.alertThresholds.errorRate
      });
    }

    // Check for spikes
    if (this.baseline && metrics.errorRate > this.baseline * this.config.alertThresholds.errorSpike) {
      this.createAlert('ERROR_SPIKE', {
        current: metrics.errorRate,
        baseline: this.baseline,
        multiplier: metrics.errorRate / this.baseline
      });
    }

    // Check critical errors
    const criticalCount = this.errorWindow.filter(e => e.severity === 'critical').length;
    if (criticalCount >= this.config.alertThresholds.criticalErrors) {
      this.createAlert('CRITICAL_ERRORS', {
        count: criticalCount,
        errors: this.errorWindow.filter(e => e.severity === 'critical')
      });
    }
  }

  createAlert(type, details) {
    const alert = {
      id: \`alert_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`,
      type,
      timestamp: Date.now(),
      details,
      acknowledged: false
    };

    this.alerts.push(alert);
    this.notifyAlert(alert);
    
    return alert;
  }

  notifyAlert(alert) {
    // Send to monitoring systems
    console.error(\`ALERT [\${alert.type}]:\`, alert.details);
    
    // Would integrate with real alerting systems:
    // - Slack
    // - PagerDuty
    // - Email
    // - SMS
  }

  getMetrics() {
    this.cleanWindow();
    
    const now = Date.now();
    const windowMinutes = this.config.windowSize / 60000;
    
    // Group errors by type
    const errorsByType = {};
    const errorsBySeverity = {};
    const errorsByFingerprint = {};

    this.errorWindow.forEach(error => {
      // By type
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
      
      // By severity
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
      
      // By fingerprint
      if (!errorsByFingerprint[error.fingerprint]) {
        errorsByFingerprint[error.fingerprint] = {
          count: 0,
          firstSeen: error.timestamp,
          lastSeen: error.timestamp,
          example: error
        };
      }
      errorsByFingerprint[error.fingerprint].count++;
      errorsByFingerprint[error.fingerprint].lastSeen = error.timestamp;
    });

    // Calculate patterns
    const patterns = Object.entries(errorsByFingerprint)
      .map(([fingerprint, data]) => ({
        fingerprint,
        ...data,
        frequency: data.count / windowMinutes
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalErrors: this.errorWindow.length,
      errorRate: this.errorWindow.length / windowMinutes,
      byType: errorsByType,
      bySeverity: errorsBySeverity,
      topPatterns: patterns.slice(0, 10),
      recentAlerts: this.alerts.filter(a => !a.acknowledged)
    };
  }

  updateBaseline() {
    const metrics = this.getMetrics();
    this.baseline = metrics.errorRate;
  }

  acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = Date.now();
    }
  }

  generateReport() {
    const metrics = this.getMetrics();
    
    return {
      summary: {
        totalErrors: metrics.totalErrors,
        errorRate: \`\${metrics.errorRate.toFixed(2)} errors/min\`,
        dominantErrorType: Object.entries(metrics.byType)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none',
        criticalErrors: metrics.bySeverity.critical || 0,
        activeAlerts: metrics.recentAlerts.length
      },
      details: metrics,
      recommendations: this.generateRecommendations(metrics)
    };
  }

  generateRecommendations(metrics) {
    const recommendations = [];

    if (metrics.errorRate > 10) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Scale up infrastructure or implement rate limiting'
      });
    }

    const timeoutErrors = metrics.byType['TimeoutError'] || 0;
    if (timeoutErrors > metrics.totalErrors * 0.3) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Increase timeout values or optimize slow operations'
      });
    }

    if (metrics.bySeverity.critical > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        action: 'Investigate and fix authentication/authorization issues'
      });
    }

    return recommendations;
  }
}`
    }
  ],
  assignments: [
    {
      id: 'error-handler-implementation',
      title: 'Implementeer complete error handler',
      description: 'Bouw een robuuste error handling oplossing voor je workflow met retry logic, circuit breaker en error aggregation.',
      difficulty: 'expert',
      type: 'project'
    },
    {
      id: 'saga-pattern-workflow',
      title: 'Bouw Saga pattern workflow',
      description: 'Implementeer een complete order processing workflow met compensating transactions volgens het Saga pattern.',
      difficulty: 'expert',
      type: 'project'
    }
  ],
  resources: [
    {
      title: 'Circuit Breaker Pattern Guide',
      url: 'https://martinfowler.com/bliki/CircuitBreaker.html',
      type: 'article'
    },
    {
      title: 'Saga Pattern Explained',
      url: 'https://microservices.io/patterns/data/saga.html',
      type: 'article'
    },
    {
      title: 'Error Handling Best Practices',
      url: 'https://docs.n8n.io/error-handling/',
      type: 'documentation'
    },
    {
      title: 'Exponential Backoff Algorithm',
      url: 'https://cloud.google.com/storage/docs/exponential-backoff',
      type: 'article'
    }
  ]
};