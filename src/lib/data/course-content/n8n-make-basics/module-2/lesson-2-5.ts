import type { Lesson } from '@/lib/data/courses';

export const lesson2_5: Lesson = {
  id: 'lesson-2-5',
  title: 'Foutafhandeling in verbindingen',
  duration: '25 min',
  content: `
# Foutafhandeling in Verbindingen

## Overzicht
Fouten zijn onvermijdelijk in automations. Het verschil tussen een amateur en professional automation is hoe je met deze fouten omgaat. Goede error handling zorgt voor betrouwbare, self-healing workflows.

## Connection Error Types

### 1. Authentication Errors (401/403)
**Oorzaken:**
- Verlopen API keys of tokens
- Onvoldoende permissions
- Verkeerde credentials

**Herkenning:**
\`\`\`json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid API key or token expired"
}
\`\`\`

**Oplossingen:**
- Automatische token refresh implementeren
- Credential rotation schema
- Permission audit regelmatig uitvoeren

### 2. Rate Limiting (429)
**Oorzaken:**
- Te veel requests in korte tijd
- API quota overschreden
- Concurrent request limits

**Herkenning:**
\`\`\`json
{
  "status": 429,
  "error": "Too Many Requests",
  "headers": {
    "X-RateLimit-Limit": "100",
    "X-RateLimit-Remaining": "0",
    "X-RateLimit-Reset": "1642521600"
  }
}
\`\`\`

**Oplossingen:**
- Exponential backoff implementeren
- Request batching
- Queue systeem voor requests

### 3. Timeout Errors
**Oorzaken:**
- Trage server response
- Network issues
- Te grote data payloads

**Herkenning:**
- Connection timeout (geen verbinding)
- Read timeout (verbinding traag)
- Gateway timeout (502/504)

### 4. Data Validation Errors (400)
**Oorzaken:**
- Missende required fields
- Verkeerd data format
- Business logic violations

**Herkenning:**
\`\`\`json
{
  "status": 400,
  "error": "Bad Request",
  "details": {
    "email": "Invalid email format",
    "age": "Must be a positive number"
  }
}
\`\`\`

### 5. Server Errors (500+)
**Oorzaken:**
- Server crashes
- Database issues
- Deployment problems

## Retry Strategies

### 1. Simple Retry
Basis retry met fixed delay:
\`\`\`javascript
async function simpleRetry(fn, maxAttempts = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      console.log(\`Attempt \${attempt} failed, retrying in \${delay}ms...\`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
\`\`\`

### 2. Exponential Backoff
Verhoog delay exponentieel:
\`\`\`javascript
async function exponentialBackoff(fn, maxAttempts = 5) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts - 1) throw error;
      
      const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
      console.log(\`Attempt \${attempt + 1} failed, retrying in \${delay}ms...\`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
\`\`\`

### 3. Smart Retry Logic
Retry alleen bij specifieke errors:
\`\`\`javascript
async function smartRetry(fn, options = {}) {
  const {
    maxAttempts = 3,
    retryableErrors = [429, 502, 503, 504],
    onRetry = () => {}
  } = options;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isRetryable = retryableErrors.includes(error.status);
      const isLastAttempt = attempt === maxAttempts;
      
      if (!isRetryable || isLastAttempt) {
        throw error;
      }
      
      // Calculate delay based on error type
      let delay = 1000 * attempt;
      if (error.status === 429 && error.headers?.['X-RateLimit-Reset']) {
        delay = new Date(error.headers['X-RateLimit-Reset'] * 1000) - Date.now();
      }
      
      await onRetry({ attempt, error, delay });
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
\`\`\`

## Error Notifications

### N8N Error Handling
\`\`\`json
{
  "nodes": [
    {
      "name": "Try API Call",
      "type": "n8n-nodes-base.httpRequest",
      "onError": "continueErrorOutput"
    },
    {
      "name": "Handle Error",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "boolean": [{
            "value1": "={{$json.error}}",
            "value2": true
          }]
        }
      }
    },
    {
      "name": "Send Error Alert",
      "type": "n8n-nodes-base.slack",
      "parameters": {
        "channel": "#automation-errors",
        "text": "🚨 API Error: {{$json.error.message}}\\nWorkflow: {{$workflow.name}}\\nTime: {{$now.toISO()}}",
        "attachments": [{
          "color": "danger",
          "fields": [
            {
              "title": "Error Code",
              "value": "{{$json.error.code}}"
            },
            {
              "title": "Endpoint",
              "value": "{{$json.error.endpoint}}"
            }
          ]
        }]
      }
    }
  ]
}
\`\`\`

### Make Error Handling
\`\`\`javascript
// Error handler module
{
  "name": "Error Handler",
  "type": "error-handler",
  "routes": [
    {
      "filter": {
        "condition": "{{error.status === 429}}"
      },
      "modules": [
        {
          "name": "Wait for Rate Limit",
          "type": "tools:sleep",
          "duration": "{{error.retryAfter || 60}}"
        },
        {
          "name": "Retry Operation",
          "type": "flow:resume"
        }
      ]
    },
    {
      "filter": {
        "condition": "{{error.status >= 500}}"
      },
      "modules": [
        {
          "name": "Log to Database",
          "type": "database:insert",
          "table": "error_log"
        },
        {
          "name": "Alert Team",
          "type": "email:send",
          "to": "team@company.com",
          "subject": "Critical API Error"
        }
      ]
    }
  ]
}
\`\`\`

### Multi-Channel Alerting
\`\`\`javascript
class ErrorNotifier {
  constructor(channels = []) {
    this.channels = channels;
  }
  
  async notify(error, context) {
    const severity = this.calculateSeverity(error);
    const message = this.formatMessage(error, context);
    
    // Notify based on severity
    const promises = [];
    
    if (severity >= 3) {
      // Critical: all channels
      promises.push(...this.channels.map(ch => ch.send(message)));
    } else if (severity === 2) {
      // High: email + slack
      promises.push(
        this.channels.find(ch => ch.type === 'email')?.send(message),
        this.channels.find(ch => ch.type === 'slack')?.send(message)
      );
    } else {
      // Low: just log
      promises.push(
        this.channels.find(ch => ch.type === 'log')?.send(message)
      );
    }
    
    await Promise.allSettled(promises);
  }
  
  calculateSeverity(error) {
    if (error.status >= 500) return 3; // Critical
    if (error.status === 401 || error.status === 403) return 3; // Auth issues
    if (error.status === 429) return 1; // Low - expected
    if (error.type === 'timeout') return 2; // High
    return 2; // Default medium
  }
  
  formatMessage(error, context) {
    return {
      title: \`🚨 \${error.type || 'API'} Error in \${context.workflow}\`,
      description: error.message,
      fields: {
        'Error Code': error.code || error.status,
        'Workflow': context.workflow,
        'Node': context.node,
        'Time': new Date().toISOString(),
        'Environment': process.env.NODE_ENV
      },
      color: this.getSeverityColor(this.calculateSeverity(error))
    };
  }
  
  getSeverityColor(severity) {
    return ['#ffc107', '#ff9800', '#f44336', '#d32f2f'][severity];
  }
}

// Usage
const notifier = new ErrorNotifier([
  new SlackChannel('#alerts'),
  new EmailChannel('ops@company.com'),
  new LogChannel('errors.log')
]);

// In workflow
try {
  await apiCall();
} catch (error) {
  await notifier.notify(error, {
    workflow: 'Customer Sync',
    node: 'Create Contact'
  });
}
\`\`\`

## Best Practices voor Error Handling

### 1. Categoriseer Errors
\`\`\`javascript
const ErrorCategories = {
  TRANSIENT: ['TIMEOUT', 'RATE_LIMIT', 'SERVER_ERROR'],
  PERMANENT: ['NOT_FOUND', 'INVALID_DATA', 'UNAUTHORIZED'],
  UNKNOWN: ['UNKNOWN_ERROR']
};

function categorizeError(error) {
  if (error.status === 429 || error.code === 'ECONNRESET') {
    return 'TRANSIENT';
  }
  if (error.status === 404 || error.status === 400) {
    return 'PERMANENT';
  }
  if (error.status >= 500) {
    return 'TRANSIENT';
  }
  return 'UNKNOWN';
}
\`\`\`

### 2. Implement Circuit Breaker
\`\`\`javascript
class CircuitBreaker {
  constructor(fn, options = {}) {
    this.fn = fn;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000;
    this.state = 'CLOSED';
    this.failures = 0;
    this.nextAttempt = Date.now();
  }
  
  async call(...args) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }
    
    try {
      const result = await this.fn(...args);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failures = 0;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
    }
  }
  
  onFailure() {
    this.failures++;
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
    }
  }
}
\`\`\`

### 3. Log Everything
\`\`\`javascript
function createErrorLog(error, context) {
  return {
    timestamp: new Date().toISOString(),
    errorId: generateUUID(),
    type: error.name || 'UnknownError',
    message: error.message,
    stack: error.stack,
    context: {
      workflow: context.workflowId,
      execution: context.executionId,
      node: context.nodeId,
      input: context.input,
      user: context.userId
    },
    metadata: {
      status: error.status,
      headers: error.headers,
      response: error.response
    }
  };
}
\`\`\`

### 4. Graceful Degradation
\`\`\`javascript
async function fetchWithFallback(primaryFn, fallbackFn, cacheFn) {
  try {
    // Try primary source
    const result = await primaryFn();
    // Cache for future fallback
    await cacheFn?.(result);
    return result;
  } catch (primaryError) {
    console.warn('Primary source failed:', primaryError);
    
    try {
      // Try fallback
      return await fallbackFn();
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      
      // Return cached data if available
      const cached = await cacheFn?.get();
      if (cached) {
        console.log('Using cached data');
        return cached;
      }
      
      throw new Error('All data sources failed');
    }
  }
}
\`\`\`

## Common Error Patterns & Solutions

### Pattern 1: Authentication Refresh
\`\`\`javascript
class AuthManager {
  async makeAuthenticatedRequest(requestFn) {
    try {
      return await requestFn(this.token);
    } catch (error) {
      if (error.status === 401) {
        // Token expired, refresh
        this.token = await this.refreshToken();
        // Retry with new token
        return await requestFn(this.token);
      }
      throw error;
    }
  }
}
\`\`\`

### Pattern 2: Batch Processing with Error Recovery
\`\`\`javascript
async function processBatchWithRecovery(items, processFn) {
  const results = {
    successful: [],
    failed: []
  };
  
  for (const [index, item] of items.entries()) {
    try {
      const result = await processFn(item);
      results.successful.push({ index, item, result });
    } catch (error) {
      results.failed.push({ 
        index, 
        item, 
        error: error.message,
        retryable: categorizeError(error) === 'TRANSIENT'
      });
    }
  }
  
  // Retry failed items
  if (results.failed.some(f => f.retryable)) {
    const retryItems = results.failed
      .filter(f => f.retryable)
      .map(f => f.item);
    
    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Recursive retry with remaining items
    const retryResults = await processBatchWithRecovery(retryItems, processFn);
    results.successful.push(...retryResults.successful);
    results.failed = results.failed.filter(f => !f.retryable);
  }
  
  return results;
}
\`\`\`
  `,
  codeExamples: [
    {
      id: 'example-2-5-1',
      title: 'Complete Error Handling System',
      language: 'javascript',
      code: `// Comprehensive error handling framework
class AutomationErrorHandler {
  constructor(config = {}) {
    this.retryConfig = {
      maxAttempts: config.maxRetries || 3,
      backoffMultiplier: config.backoffMultiplier || 2,
      maxDelay: config.maxDelay || 30000,
      jitter: config.jitter || true
    };
    
    this.notifications = config.notifications || [];
    this.errorLog = [];
    this.metrics = {
      totalErrors: 0,
      errorsByType: {},
      recoveryRate: 0
    };
  }
  
  async execute(fn, context = {}) {
    const startTime = Date.now();
    let lastError;
    
    for (let attempt = 1; attempt <= this.retryConfig.maxAttempts; attempt++) {
      try {
        // Execute function
        const result = await fn();
        
        // Success - update metrics
        if (attempt > 1) {
          this.metrics.recoveryRate = 
            (this.metrics.recoveryRate * this.metrics.totalErrors + 1) / 
            (this.metrics.totalErrors + 1);
        }
        
        return result;
        
      } catch (error) {
        lastError = error;
        this.metrics.totalErrors++;
        this.metrics.errorsByType[error.name] = 
          (this.metrics.errorsByType[error.name] || 0) + 1;
        
        // Log error
        const errorEntry = this.logError(error, {
          ...context,
          attempt,
          duration: Date.now() - startTime
        });
        
        // Check if retryable
        if (!this.isRetryable(error) || attempt === this.retryConfig.maxAttempts) {
          // Final failure
          await this.handleFinalFailure(errorEntry);
          throw error;
        }
        
        // Calculate retry delay
        const delay = this.calculateDelay(attempt, error);
        
        // Notify about retry
        await this.notifyRetry(errorEntry, delay);
        
        // Wait before retry
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }
  
  isRetryable(error) {
    // Network errors
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      return true;
    }
    
    // HTTP status codes
    const retryableStatuses = [408, 429, 502, 503, 504];
    if (error.status && retryableStatuses.includes(error.status)) {
      return true;
    }
    
    // Custom retry logic
    if (error.retryable === true) {
      return true;
    }
    
    return false;
  }
  
  calculateDelay(attempt, error) {
    let delay;
    
    // Check for rate limit headers
    if (error.status === 429 && error.headers?.['retry-after']) {
      delay = parseInt(error.headers['retry-after']) * 1000;
    } else {
      // Exponential backoff
      delay = Math.min(
        1000 * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1),
        this.retryConfig.maxDelay
      );
      
      // Add jitter
      if (this.retryConfig.jitter) {
        delay = delay * (0.5 + Math.random() * 0.5);
      }
    }
    
    return Math.round(delay);
  }
  
  logError(error, context) {
    const errorEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code,
        status: error.status
      },
      context,
      recovery: {
        attempt: context.attempt,
        retryable: this.isRetryable(error)
      }
    };
    
    this.errorLog.push(errorEntry);
    
    // Keep only last 1000 errors
    if (this.errorLog.length > 1000) {
      this.errorLog.shift();
    }
    
    return errorEntry;
  }
  
  async handleFinalFailure(errorEntry) {
    // Send notifications
    const notifications = this.notifications.filter(n => 
      n.severity <= this.calculateSeverity(errorEntry.error)
    );
    
    await Promise.allSettled(
      notifications.map(n => n.send(errorEntry))
    );
    
    // Store in persistent storage if configured
    if (this.persistentStorage) {
      await this.persistentStorage.store(errorEntry);
    }
  }
  
  async notifyRetry(errorEntry, delay) {
    const message = {
      type: 'retry',
      error: errorEntry.error.message,
      attempt: errorEntry.context.attempt,
      nextRetryIn: delay,
      context: errorEntry.context
    };
    
    // Only notify on specific conditions
    if (errorEntry.context.attempt > 1) {
      await Promise.allSettled(
        this.notifications
          .filter(n => n.notifyOnRetry)
          .map(n => n.send(message))
      );
    }
  }
  
  calculateSeverity(error) {
    if (error.status >= 500 || error.code === 'ECONNREFUSED') return 1; // Critical
    if (error.status === 401 || error.status === 403) return 1; // Critical
    if (error.status === 429) return 3; // Low
    if (error.status >= 400) return 2; // Medium
    return 2; // Default medium
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  // Utility methods
  getMetrics() {
    return {
      ...this.metrics,
      recentErrors: this.errorLog.slice(-10),
      errorRate: this.calculateErrorRate()
    };
  }
  
  calculateErrorRate() {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const recentErrors = this.errorLog.filter(e => 
      new Date(e.timestamp).getTime() > fiveMinutesAgo
    );
    return recentErrors.length;
  }
  
  reset() {
    this.errorLog = [];
    this.metrics = {
      totalErrors: 0,
      errorsByType: {},
      recoveryRate: 0
    };
  }
}

// Usage example
const errorHandler = new AutomationErrorHandler({
  maxRetries: 3,
  notifications: [
    {
      severity: 1,
      send: async (error) => {
        // Send to Slack
        await slackClient.send({
          channel: '#critical-errors',
          text: \`Critical error: \${error.error.message}\`
        });
      }
    },
    {
      severity: 2,
      notifyOnRetry: true,
      send: async (error) => {
        // Log to monitoring system
        await monitoringClient.log(error);
      }
    }
  ]
});

// Wrap any async operation
const result = await errorHandler.execute(
  async () => {
    return await apiClient.createCustomer(customerData);
  },
  {
    workflow: 'customer-sync',
    node: 'create-customer',
    input: customerData
  }
);`
    }
  ],
  assignments: [
    {
      id: 'error-handling-1',
      title: 'Implement Retry Logic',
      description: 'Voeg exponential backoff retry logic toe aan een bestaande API integratie',
      difficulty: 'medium',
      type: 'code',
      initialCode: `// Basis API call zonder error handling
async function fetchUserData(userId) {
  const response = await fetch(\`https://api.example.com/users/\${userId}\`);
  return response.json();
}

// TODO: Voeg toe:
// 1. Retry logic met exponential backoff
// 2. Max 3 retries
// 3. Specifieke error handling voor 429 (rate limit)
// 4. Logging van retry attempts`,
      hints: [
        'Start delay bij 1 seconde, verdubbel elke retry',
        'Check response.status voor verschillende error types',
        'Gebruik setTimeout met Promises voor delays'
      ]
    },
    {
      id: 'error-handling-2',
      title: 'Build Error Dashboard',
      description: 'Maak een monitoring dashboard voor automation errors met Slack notifications',
      difficulty: 'hard',
      type: 'project',
      initialCode: `// Error monitoring systeem opzetten
class ErrorMonitor {
  constructor() {
    this.errors = [];
    this.slackWebhook = process.env.SLACK_WEBHOOK;
  }
  
  // TODO: Implementeer:
  // 1. logError(error, context)
  // 2. getErrorStats() - groepeer per type
  // 3. sendSlackAlert(error) - voor critical errors
  // 4. generateDashboard() - HTML output
}`,
      hints: [
        'Groepeer errors op type en severity',
        'Gebruik timestamps voor trending',
        'Critical errors: direct Slack, andere: batch per uur'
      ]
    }
  ],
  resources: [
    {
      title: 'N8N Error Workflow Guide',
      url: 'https://docs.n8n.io/workflows/error-workflows/',
      type: 'docs'
    },
    {
      title: 'Make Error Handling Best Practices',
      url: 'https://www.make.com/en/help/errors-and-warnings',
      type: 'guide'
    },
    {
      title: 'Circuit Breaker Pattern',
      url: 'https://martinfowler.com/bliki/CircuitBreaker.html',
      type: 'article'
    }
  ]
};