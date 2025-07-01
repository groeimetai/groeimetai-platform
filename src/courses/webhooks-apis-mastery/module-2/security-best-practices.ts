export const securityBestPractices = {
  id: 'security-best-practices',
  title: 'Security best practices',
  duration: '30 min',
  content: `
# Security Best Practices voor APIs en Webhooks

In deze les behandelen we essentiële security practices voor productie-klare API's en webhook systemen. Je leert hoe je je endpoints beschermt tegen aanvallen en een veilige infrastructuur opzet.

## Overzicht

We behandelen vijf kritieke security componenten:
1. **Rate limiting** - Bescherm tegen DoS aanvallen
2. **CORS configuratie** - Controleer wie toegang heeft
3. **API versioning** - Beheer breaking changes veilig
4. **Security headers** - Extra beschermingslagen
5. **Audit logging** - Track alle API activiteit

## 1. Rate Limiting Implementation

Rate limiting beschermt je API tegen misbruik door het aantal requests per tijdseenheid te beperken.

### Waarom rate limiting essentieel is:
- **DoS preventie**: Voorkom dat aanvallers je API overbelasten
- **Fair usage**: Zorg dat alle gebruikers eerlijke toegang hebben
- **Cost control**: Bescherm tegen onverwachte kosten
- **Resource protection**: Behoud server performance

### Rate limiting strategieën:

#### Token Bucket Algorithm
De meest flexibele benadering voor rate limiting:

\`\`\`javascript
// Token bucket rate limiter implementatie
class TokenBucketRateLimiter {
  constructor(options = {}) {
    this.capacity = options.capacity || 100; // Max tokens
    this.refillRate = options.refillRate || 10; // Tokens per seconde
    this.buckets = new Map(); // Per user/IP buckets
  }
  
  async checkLimit(identifier) {
    const now = Date.now();
    let bucket = this.buckets.get(identifier);
    
    if (!bucket) {
      bucket = {
        tokens: this.capacity,
        lastRefill: now
      };
      this.buckets.set(identifier, bucket);
    }
    
    // Bereken nieuwe tokens
    const timePassed = (now - bucket.lastRefill) / 1000;
    const tokensToAdd = timePassed * this.refillRate;
    bucket.tokens = Math.min(this.capacity, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
    
    // Check of request toegestaan is
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return {
        allowed: true,
        remaining: Math.floor(bucket.tokens),
        resetAt: this.calculateResetTime(bucket)
      };
    }
    
    return {
      allowed: false,
      remaining: 0,
      retryAfter: this.calculateRetryAfter(bucket)
    };
  }
  
  calculateResetTime(bucket) {
    const tokensNeeded = this.capacity - bucket.tokens;
    const secondsToReset = tokensNeeded / this.refillRate;
    return new Date(Date.now() + secondsToReset * 1000);
  }
  
  calculateRetryAfter(bucket) {
    return Math.ceil((1 - bucket.tokens) / this.refillRate);
  }
}

// Express middleware voor rate limiting
const rateLimiter = new TokenBucketRateLimiter({
  capacity: 100, // 100 requests
  refillRate: 2  // 2 per seconde (7200 per uur)
});

app.use('/api', async (req, res, next) => {
  // Identificeer gebruiker (API key, IP, user ID)
  const identifier = req.headers['x-api-key'] || req.ip;
  
  const result = await rateLimiter.checkLimit(identifier);
  
  // Voeg rate limit headers toe
  res.setHeader('X-RateLimit-Limit', rateLimiter.capacity);
  res.setHeader('X-RateLimit-Remaining', result.remaining);
  res.setHeader('X-RateLimit-Reset', result.resetAt?.toISOString());
  
  if (!result.allowed) {
    res.setHeader('Retry-After', result.retryAfter);
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded',
      retryAfter: result.retryAfter
    });
  }
  
  next();
});
\`\`\`

#### Redis-based Distributed Rate Limiting
Voor gedistribueerde systemen met meerdere servers:

\`\`\`javascript
import Redis from 'ioredis';
import { RateLimiterRedis } from 'rate-limiter-flexible';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  enableOfflineQueue: false
});

// Verschillende rate limiters voor verschillende endpoints
const rateLimiters = {
  // Standaard API endpoints
  standard: new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'rl:standard',
    points: 100, // Aantal requests
    duration: 3600, // Per uur
    blockDuration: 60 // Block voor 60 seconden bij overschrijding
  }),
  
  // Zware endpoints (data export, reports)
  heavy: new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'rl:heavy',
    points: 10,
    duration: 3600,
    blockDuration: 300
  }),
  
  // Auth endpoints (login, register)
  auth: new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'rl:auth',
    points: 5,
    duration: 900, // 15 minuten
    blockDuration: 900
  })
};

// Middleware factory
function createRateLimitMiddleware(limiterName) {
  return async (req, res, next) => {
    const limiter = rateLimiters[limiterName];
    const key = req.ip; // Of gebruik user ID, API key
    
    try {
      const rateLimiterRes = await limiter.consume(key);
      
      res.setHeader('X-RateLimit-Limit', limiter.points);
      res.setHeader('X-RateLimit-Remaining', rateLimiterRes.remainingPoints);
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString());
      
      next();
    } catch (rateLimiterRes) {
      res.setHeader('X-RateLimit-Limit', limiter.points);
      res.setHeader('X-RateLimit-Remaining', rateLimiterRes.remainingPoints || 0);
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString());
      res.setHeader('Retry-After', Math.round(rateLimiterRes.msBeforeNext / 1000) || 60);
      
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded',
        retryAfter: Math.round(rateLimiterRes.msBeforeNext / 1000)
      });
    }
  };
}

// Gebruik verschillende rate limits
app.use('/api/auth', createRateLimitMiddleware('auth'));
app.use('/api/export', createRateLimitMiddleware('heavy'));
app.use('/api', createRateLimitMiddleware('standard'));
\`\`\`

## 2. CORS Configuration

Cross-Origin Resource Sharing (CORS) controleert welke externe domeinen toegang hebben tot je API.

### Veilige CORS setup:

\`\`\`javascript
import cors from 'cors';

// Basis CORS configuratie
const corsOptions = {
  // Whitelist van toegestane origins
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://app.example.com',
      'https://staging.example.com',
      process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null
    ].filter(Boolean);
    
    // Allow requests zonder origin (bijv. Postman, server-to-server)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  
  // Toegestane HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  
  // Toegestane headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-API-Key',
    'X-Webhook-Signature'
  ],
  
  // Exposed headers (toegankelijk voor client)
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'X-Total-Count'
  ],
  
  // Support credentials (cookies, auth headers)
  credentials: true,
  
  // Cache preflight response
  maxAge: 86400 // 24 uur
};

app.use(cors(corsOptions));

// Dynamic CORS voor verschillende environments
class DynamicCORS {
  constructor() {
    this.allowedOrigins = new Map();
    this.loadAllowedOrigins();
  }
  
  async loadAllowedOrigins() {
    // Laad uit database of config
    const origins = await db.getAllowedOrigins();
    origins.forEach(origin => {
      this.allowedOrigins.set(origin.domain, {
        methods: origin.methods,
        headers: origin.headers,
        maxAge: origin.maxAge
      });
    });
  }
  
  middleware() {
    return (req, res, next) => {
      const origin = req.headers.origin;
      
      if (!origin) {
        return next();
      }
      
      const config = this.allowedOrigins.get(origin);
      
      if (!config) {
        return res.status(403).json({
          error: 'CORS policy violation',
          message: 'Origin not allowed'
        });
      }
      
      // Set CORS headers dynamisch
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', config.methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', config.headers.join(', '));
      res.setHeader('Access-Control-Max-Age', config.maxAge);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      
      // Handle preflight
      if (req.method === 'OPTIONS') {
        return res.status(204).end();
      }
      
      next();
    };
  }
}

const dynamicCORS = new DynamicCORS();
app.use(dynamicCORS.middleware());
\`\`\`

## 3. API Versioning Strategies

API versioning zorgt voor backward compatibility terwijl je nieuwe features toevoegt.

### Versioning implementatie opties:

#### URL Path Versioning
Meest gebruikte methode:

\`\`\`javascript
// Route-based versioning
const v1Routes = require('./routes/v1');
const v2Routes = require('./routes/v2');

app.use('/api/v1', v1Routes);
app.use('/api/v2', v2Routes);

// Automatische versie routing
class APIVersionRouter {
  constructor() {
    this.versions = new Map();
  }
  
  register(version, routes) {
    this.versions.set(version, routes);
  }
  
  middleware() {
    return (req, res, next) => {
      // Extract versie uit URL
      const match = req.path.match(/^\\/api\\/v(\\d+)/);
      
      if (!match) {
        return res.status(400).json({
          error: 'Invalid API version',
          message: 'Please specify API version in URL (e.g., /api/v1/...)'
        });
      }
      
      const version = parseInt(match[1]);
      const versionRoutes = this.versions.get(version);
      
      if (!versionRoutes) {
        return res.status(404).json({
          error: 'API version not found',
          message: \`Version v\${version} is not supported\`,
          supportedVersions: Array.from(this.versions.keys()).map(v => \`v\${v}\`)
        });
      }
      
      // Check deprecation status
      if (version < 2) {
        res.setHeader('X-API-Deprecation-Warning', 'This API version is deprecated and will be removed on 2025-01-01');
        res.setHeader('X-API-Deprecation-Info', 'https://api.example.com/deprecation/v1');
      }
      
      req.apiVersion = version;
      next();
    };
  }
}

const versionRouter = new APIVersionRouter();
versionRouter.register(1, v1Routes);
versionRouter.register(2, v2Routes);

app.use(versionRouter.middleware());
\`\`\`

#### Header-based Versioning
Voor meer flexibiliteit:

\`\`\`javascript
// Accept header versioning
app.use((req, res, next) => {
  const acceptHeader = req.headers.accept || '';
  const versionMatch = acceptHeader.match(/application\\/vnd\\.api\\+json;version=(\\d+)/);
  
  req.apiVersion = versionMatch ? parseInt(versionMatch[1]) : 2; // Default v2
  
  // Set response content type
  res.setHeader('Content-Type', \`application/vnd.api+json;version=\${req.apiVersion}\`);
  
  next();
});

// Versie-specifieke middleware
function versionedEndpoint(handlers) {
  return (req, res, next) => {
    const handler = handlers[req.apiVersion] || handlers.default;
    
    if (!handler) {
      return res.status(501).json({
        error: 'Not Implemented',
        message: \`This endpoint is not available in API version \${req.apiVersion}\`
      });
    }
    
    handler(req, res, next);
  };
}

// Gebruik
app.get('/api/users', versionedEndpoint({
  1: getUsersV1,
  2: getUsersV2,
  default: getUsersV2
}));
\`\`\`

## 4. Security Headers

Security headers voegen extra beschermingslagen toe tegen veel voorkomende aanvallen.

### Complete security headers setup:

\`\`\`javascript
import helmet from 'helmet';

// Basis Helmet configuratie
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Custom security headers middleware
app.use((req, res, next) => {
  // Voorkom clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Voorkom MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS filter
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Feature policy / Permissions policy
  res.setHeader('Permissions-Policy', 
    'geolocation=(), microphone=(), camera=(), payment=()');
  
  // Cache control voor security
  if (req.path.includes('/api/auth')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
  }
  
  // Remove server header
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  
  next();
});

// API-specifieke security headers
class APISecurityHeaders {
  static apply(req, res, next) {
    // API versie header
    res.setHeader('X-API-Version', req.apiVersion || 'latest');
    
    // Request ID voor tracking
    const requestId = req.headers['x-request-id'] || generateUUID();
    res.setHeader('X-Request-ID', requestId);
    req.requestId = requestId;
    
    // Timestamp
    res.setHeader('X-Response-Time', Date.now());
    
    // Security nonce voor inline scripts (indien nodig)
    req.nonce = crypto.randomBytes(16).toString('base64');
    res.setHeader('X-Nonce', req.nonce);
    
    next();
  }
}

app.use('/api', APISecurityHeaders.apply);
\`\`\`

## 5. Audit Logging

Audit logging is cruciaal voor security monitoring en compliance.

### Comprehensive audit logging system:

\`\`\`javascript
import winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

// Audit logger configuratie
const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'api-audit' },
  transports: [
    // File transport voor lokale opslag
    new winston.transports.File({ 
      filename: 'logs/audit.log',
      maxsize: 100 * 1024 * 1024, // 100MB
      maxFiles: 10
    }),
    
    // Elasticsearch voor analysis
    new ElasticsearchTransport({
      index: 'api-audit',
      clientOpts: {
        node: process.env.ELASTICSEARCH_URL,
        auth: {
          username: process.env.ELASTIC_USER,
          password: process.env.ELASTIC_PASSWORD
        }
      }
    })
  ]
});

// Audit event class
class AuditEvent {
  constructor(req, res) {
    this.timestamp = new Date().toISOString();
    this.requestId = req.requestId;
    this.method = req.method;
    this.path = req.path;
    this.query = req.query;
    this.ip = req.ip;
    this.userAgent = req.headers['user-agent'];
    this.userId = req.user?.id;
    this.apiKey = req.headers['x-api-key'];
    this.statusCode = res.statusCode;
    this.responseTime = Date.now() - req.startTime;
  }
  
  addSecurityContext(context) {
    this.security = {
      authenticated: !!this.userId || !!this.apiKey,
      authMethod: this.userId ? 'user' : this.apiKey ? 'apikey' : 'none',
      rateLimitRemaining: context.rateLimitRemaining,
      suspiciousActivity: context.suspiciousActivity || false
    };
    return this;
  }
  
  addDataContext(context) {
    this.data = {
      requestBody: this.sanitizeData(context.requestBody),
      responseBody: this.sanitizeData(context.responseBody),
      errors: context.errors
    };
    return this;
  }
  
  sanitizeData(data) {
    if (!data) return null;
    
    // Verwijder gevoelige velden
    const sanitized = { ...data };
    const sensitiveFields = ['password', 'token', 'secret', 'creditCard', 'ssn'];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
}

// Audit middleware
app.use((req, res, next) => {
  req.startTime = Date.now();
  
  // Intercept response
  const originalSend = res.send;
  res.send = function(data) {
    res.auditData = data;
    originalSend.call(this, data);
  };
  
  // Log audit event on response
  res.on('finish', () => {
    const auditEvent = new AuditEvent(req, res)
      .addSecurityContext({
        rateLimitRemaining: res.getHeader('X-RateLimit-Remaining'),
        suspiciousActivity: req.suspiciousActivity
      })
      .addDataContext({
        requestBody: req.body,
        responseBody: res.auditData,
        errors: res.errors
      });
    
    // Log based on severity
    if (res.statusCode >= 500) {
      auditLogger.error('API Error', auditEvent);
    } else if (res.statusCode >= 400) {
      auditLogger.warn('Client Error', auditEvent);
    } else {
      auditLogger.info('API Request', auditEvent);
    }
    
    // Real-time alerting voor verdachte activiteit
    if (req.suspiciousActivity) {
      sendSecurityAlert(auditEvent);
    }
  });
  
  next();
});

// Suspicious activity detection
app.use((req, res, next) => {
  const suspicious = [];
  
  // Check voor SQL injection patronen
  const sqlPatterns = /(\b(union|select|insert|update|delete|drop)\b|;|--)/i;
  if (sqlPatterns.test(JSON.stringify(req.query)) || 
      sqlPatterns.test(JSON.stringify(req.body))) {
    suspicious.push('Potential SQL injection');
  }
  
  // Check voor path traversal
  if (req.path.includes('../') || req.path.includes('..\\\\')) {
    suspicious.push('Path traversal attempt');
  }
  
  // Check voor abnormaal grote payloads
  if (req.headers['content-length'] > 10 * 1024 * 1024) { // 10MB
    suspicious.push('Abnormally large payload');
  }
  
  if (suspicious.length > 0) {
    req.suspiciousActivity = suspicious;
    auditLogger.warn('Suspicious activity detected', {
      requestId: req.requestId,
      ip: req.ip,
      suspicious
    });
  }
  
  next();
});

// Audit log query endpoint (voor admins)
app.get('/api/admin/audit-logs', authenticate, authorize('admin'), async (req, res) => {
  const { startDate, endDate, userId, statusCode, path } = req.query;
  
  // Query Elasticsearch
  const query = {
    bool: {
      must: [
        { range: { timestamp: { gte: startDate, lte: endDate } } }
      ]
    }
  };
  
  if (userId) query.bool.must.push({ term: { userId } });
  if (statusCode) query.bool.must.push({ term: { statusCode } });
  if (path) query.bool.must.push({ match: { path } });
  
  const results = await elasticsearchClient.search({
    index: 'api-audit',
    body: { query },
    size: 100,
    sort: [{ timestamp: { order: 'desc' } }]
  });
  
  res.json({
    total: results.hits.total.value,
    logs: results.hits.hits.map(hit => hit._source)
  });
});
\`\`\`

## Production Security Checklist

### Pre-deployment checklist:

\`\`\`javascript
// Security audit script
const securityChecklist = {
  authentication: {
    'API keys properly validated': checkAPIKeyValidation(),
    'JWT tokens expire': checkJWTExpiration(),
    'Passwords hashed with bcrypt/argon2': checkPasswordHashing(),
    'Multi-factor authentication available': checkMFAImplementation()
  },
  
  authorization: {
    'Role-based access control implemented': checkRBAC(),
    'Resource ownership verified': checkResourceOwnership(),
    'Admin endpoints protected': checkAdminProtection()
  },
  
  rateLimit: {
    'Rate limiting enabled': checkRateLimiting(),
    'Different limits for different endpoints': checkGranularLimits(),
    'Distributed rate limiting for multiple servers': checkDistributedLimits()
  },
  
  cors: {
    'CORS properly configured': checkCORSConfig(),
    'Whitelist maintained': checkCORSWhitelist(),
    'Credentials handled correctly': checkCORSCredentials()
  },
  
  headers: {
    'Security headers present': checkSecurityHeaders(),
    'HSTS enabled': checkHSTS(),
    'CSP configured': checkCSP()
  },
  
  logging: {
    'Audit logging enabled': checkAuditLogging(),
    'Sensitive data sanitized': checkDataSanitization(),
    'Log retention policy': checkLogRetention()
  },
  
  encryption: {
    'HTTPS enforced': checkHTTPS(),
    'TLS 1.2+ only': checkTLSVersion(),
    'Strong cipher suites': checkCipherSuites()
  },
  
  validation: {
    'Input validation on all endpoints': checkInputValidation(),
    'SQL injection prevention': checkSQLInjectionPrevention(),
    'XSS prevention': checkXSSPrevention()
  },
  
  secrets: {
    'No hardcoded secrets': checkHardcodedSecrets(),
    'Environment variables used': checkEnvVars(),
    'Secret rotation implemented': checkSecretRotation()
  },
  
  monitoring: {
    'Error monitoring active': checkErrorMonitoring(),
    'Performance monitoring': checkPerfMonitoring(),
    'Security alerts configured': checkSecurityAlerts()
  }
};

// Run security audit
async function runSecurityAudit() {
  console.log('🔒 Running Security Audit...\\n');
  
  const results = {};
  let passed = 0;
  let failed = 0;
  
  for (const [category, checks] of Object.entries(securityChecklist)) {
    console.log(\`📋 \${category.toUpperCase()}\`);
    results[category] = {};
    
    for (const [checkName, checkFn] of Object.entries(checks)) {
      try {
        const result = await checkFn;
        results[category][checkName] = result;
        
        if (result.passed) {
          console.log(\`  ✅ \${checkName}\`);
          passed++;
        } else {
          console.log(\`  ❌ \${checkName}: \${result.message}\`);
          failed++;
        }
      } catch (error) {
        console.log(\`  ⚠️  \${checkName}: Error - \${error.message}\`);
        failed++;
      }
    }
    console.log('');
  }
  
  console.log(\`\\n📊 Security Audit Complete: \${passed} passed, \${failed} failed\`);
  
  if (failed > 0) {
    console.log('\\n⚠️  Security issues detected! Fix before deploying to production.');
    process.exit(1);
  }
  
  return results;
}

// Example check implementation
async function checkRateLimiting() {
  const testEndpoints = ['/api/users', '/api/auth/login', '/api/data/export'];
  
  for (const endpoint of testEndpoints) {
    const response = await fetch(\`http://localhost:3000\${endpoint}\`, {
      method: 'GET',
      headers: { 'X-Test-Mode': 'security-audit' }
    });
    
    if (!response.headers.get('X-RateLimit-Limit')) {
      return {
        passed: false,
        message: \`Rate limiting headers missing on \${endpoint}\`
      };
    }
  }
  
  return { passed: true };
}
\`\`\`

### Monitoring en alerting setup:

\`\`\`javascript
// Security monitoring configuration
const securityMonitor = {
  // Track failed authentication attempts
  trackFailedAuth: async (ip, username) => {
    const key = \`failed_auth:\${ip}\`;
    const count = await redis.incr(key);
    await redis.expire(key, 3600); // 1 hour window
    
    if (count > 5) {
      await sendSecurityAlert({
        type: 'BRUTE_FORCE_ATTEMPT',
        severity: 'high',
        ip,
        username,
        attempts: count
      });
    }
  },
  
  // Monitor rate limit violations
  trackRateLimitViolation: async (ip, endpoint) => {
    await metricsClient.increment('security.rate_limit_violation', {
      tags: { endpoint, ip }
    });
  },
  
  // Track suspicious patterns
  trackSuspiciousActivity: async (activity) => {
    await auditLogger.security('suspicious_activity', activity);
    
    if (activity.severity === 'critical') {
      await sendSecurityAlert(activity);
    }
  }
};
\`\`\`

Deze security best practices zorgen voor een veilige API en webhook infrastructuur die klaar is voor productie gebruik!`,
  codeExamples: [
    {
      id: 'complete-security-setup',
      title: 'Complete production security setup',
      language: 'javascript',
      code: `// Complete API security setup voor productie
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import winston from 'winston';

const app = express();
const redis = new Redis(process.env.REDIS_URL);

// 1. Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// 2. CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
  maxAge: 86400
};

app.use(cors(corsOptions));

// 3. Rate Limiting
const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl',
  points: 100,
  duration: 3600,
  blockDuration: 300
});

app.use(async (req, res, next) => {
  try {
    const key = req.ip;
    await rateLimiter.consume(key);
    next();
  } catch (rateLimiterRes) {
    res.setHeader('Retry-After', rateLimiterRes.msBeforeNext / 1000);
    res.status(429).json({
      error: 'Too Many Requests',
      retryAfter: Math.round(rateLimiterRes.msBeforeNext / 1000)
    });
  }
});

// 4. Audit Logging
const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'audit.log' })
  ]
});

app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    auditLogger.info({
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime: Date.now() - startTime,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
  });
  
  next();
});

// 5. API Versioning
app.use('/api/v:version', (req, res, next) => {
  const version = parseInt(req.params.version);
  
  if (version < 1 || version > 2) {
    return res.status(400).json({
      error: 'Invalid API version',
      supportedVersions: ['v1', 'v2']
    });
  }
  
  req.apiVersion = version;
  
  if (version === 1) {
    res.setHeader('X-API-Deprecation-Warning', 
      'API v1 is deprecated and will be removed on 2025-01-01');
  }
  
  next();
});

// Security check endpoint
app.get('/api/health/security', (req, res) => {
  res.json({
    status: 'secure',
    features: {
      rateLimiting: true,
      cors: true,
      securityHeaders: true,
      auditLogging: true,
      https: req.secure,
      apiVersioning: true
    }
  });
});

export default app;`,
      explanation: 'Deze complete setup combineert alle security best practices in één productie-klare configuratie. Het includeert rate limiting, CORS, security headers, audit logging en API versioning.'
    },
    {
      id: 'advanced-rate-limiting',
      title: 'Geavanceerde rate limiting met verschillende strategieën',
      language: 'javascript',
      code: `// Geavanceerde rate limiting met meerdere strategieën
import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible';

class AdvancedRateLimiter {
  constructor(redis) {
    // Verschillende limiters voor verschillende use cases
    this.limiters = {
      // Per IP rate limiting
      perIP: new RateLimiterRedis({
        storeClient: redis,
        keyPrefix: 'rl:ip',
        points: 100,
        duration: 3600, // per uur
        blockDuration: 600 // 10 min block
      }),
      
      // Per user rate limiting
      perUser: new RateLimiterRedis({
        storeClient: redis,
        keyPrefix: 'rl:user',
        points: 1000,
        duration: 3600,
        blockDuration: 0 // geen block, alleen limit
      }),
      
      // Per API key rate limiting (betaalde tiers)
      basicTier: new RateLimiterRedis({
        storeClient: redis,
        keyPrefix: 'rl:basic',
        points: 1000,
        duration: 86400 // per dag
      }),
      
      proTier: new RateLimiterRedis({
        storeClient: redis,
        keyPrefix: 'rl:pro',
        points: 10000,
        duration: 86400
      }),
      
      enterpriseTier: new RateLimiterRedis({
        storeClient: redis,
        keyPrefix: 'rl:enterprise',
        points: 100000,
        duration: 86400
      }),
      
      // Burst protection (korte termijn)
      burst: new RateLimiterRedis({
        storeClient: redis,
        keyPrefix: 'rl:burst',
        points: 10,
        duration: 1, // 10 requests per seconde
        blockDuration: 5
      }),
      
      // Endpoint-specifieke limits
      heavyEndpoint: new RateLimiterRedis({
        storeClient: redis,
        keyPrefix: 'rl:heavy',
        points: 10,
        duration: 3600
      })
    };
    
    // Fallback in-memory limiter voor Redis failures
    this.fallbackLimiter = new RateLimiterMemory({
      points: 50,
      duration: 60
    });
  }
  
  async checkLimit(req, limitType = 'perIP') {
    const limiter = this.limiters[limitType];
    const key = this.getKey(req, limitType);
    
    try {
      const result = await limiter.consume(key);
      return {
        allowed: true,
        remaining: result.remainingPoints,
        resetAt: new Date(Date.now() + result.msBeforeNext)
      };
    } catch (rateLimiterRes) {
      // Als Redis down is, gebruik fallback
      if (rateLimiterRes instanceof Error) {
        console.error('Redis error, using fallback limiter');
        return this.checkFallback(key);
      }
      
      return {
        allowed: false,
        remaining: rateLimiterRes.remainingPoints || 0,
        resetAt: new Date(Date.now() + rateLimiterRes.msBeforeNext),
        retryAfter: Math.round(rateLimiterRes.msBeforeNext / 1000)
      };
    }
  }
  
  async checkMultipleLimits(req, user) {
    const checks = [];
    
    // Check IP limit
    checks.push(this.checkLimit(req, 'perIP'));
    
    // Check burst limit
    checks.push(this.checkLimit(req, 'burst'));
    
    // Check user/API key limits
    if (user) {
      if (user.apiTier) {
        checks.push(this.checkLimit(req, \`\${user.apiTier}Tier\`));
      } else {
        checks.push(this.checkLimit(req, 'perUser'));
      }
    }
    
    // Check endpoint-specific limits
    if (req.path.includes('/export') || req.path.includes('/report')) {
      checks.push(this.checkLimit(req, 'heavyEndpoint'));
    }
    
    const results = await Promise.all(checks);
    
    // Als één van de checks faalt, block het request
    const blocked = results.find(r => !r.allowed);
    if (blocked) {
      return blocked;
    }
    
    // Return de meest restrictieve remaining count
    const minRemaining = Math.min(...results.map(r => r.remaining));
    return {
      allowed: true,
      remaining: minRemaining,
      resetAt: results[0].resetAt
    };
  }
  
  getKey(req, limitType) {
    switch (limitType) {
      case 'perIP':
      case 'burst':
        return req.ip;
      case 'perUser':
        return req.user?.id || req.ip;
      case 'basicTier':
      case 'proTier':
      case 'enterpriseTier':
        return req.apiKey || req.user?.id;
      case 'heavyEndpoint':
        return \`\${req.ip}:\${req.path}\`;
      default:
        return req.ip;
    }
  }
  
  // Dynamische rate limit aanpassing
  async adjustLimits(metrics) {
    // Verhoog limits tijdens lage load
    if (metrics.avgResponseTime < 100 && metrics.errorRate < 0.01) {
      await this.increaseLimits(1.2);
    }
    
    // Verlaag limits tijdens hoge load
    if (metrics.avgResponseTime > 500 || metrics.errorRate > 0.05) {
      await this.decreaseLimits(0.8);
    }
  }
  
  middleware() {
    return async (req, res, next) => {
      const user = req.user || { apiKey: req.headers['x-api-key'] };
      const result = await this.checkMultipleLimits(req, user);
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', result.limit || 100);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());
      
      if (!result.allowed) {
        res.setHeader('Retry-After', result.retryAfter);
        
        // Log rate limit violation
        logger.warn('Rate limit exceeded', {
          ip: req.ip,
          user: user?.id,
          path: req.path,
          remaining: result.remaining
        });
        
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded',
          retryAfter: result.retryAfter
        });
      }
      
      next();
    };
  }
}

// Gebruik
const rateLimiter = new AdvancedRateLimiter(redis);
app.use('/api', rateLimiter.middleware());

// Specifieke endpoint rate limiting
app.post('/api/data/export', 
  rateLimiter.middleware('heavyEndpoint'),
  exportController
);`,
      explanation: 'Deze geavanceerde rate limiting setup biedt verschillende strategieën voor verschillende use cases, inclusief per-user limits, API tier limits, burst protection en endpoint-specifieke limits.'
    }
  ],
  assignments: [
    {
      id: 'implement-rate-limiting',
      title: 'Implementeer rate limiting voor je API',
      description: 'Bouw een rate limiting systeem met Redis dat verschillende limieten ondersteunt voor verschillende gebruikerstypes (gratis, pro, enterprise). Implementeer ook burst protection.',
      difficulty: 'medium',
      type: 'project',
      hints: [
        'Gebruik Redis voor gedistribueerde rate limiting',
        'Implementeer verschillende limiet strategieën',
        'Voeg goede error messages en retry headers toe',
        'Test met meerdere gelijktijdige requests'
      ]
    },
    {
      id: 'security-audit-checklist',
      title: 'Voer een security audit uit',
      description: 'Gebruik de production security checklist om een bestaande API te auditen. Documenteer alle gevonden problemen en stel oplossingen voor.',
      difficulty: 'hard',
      type: 'analysis'
    },
    {
      id: 'cors-configuration',
      title: 'Configureer CORS voor multi-domain setup',
      description: 'Stel CORS in voor een API die gebruikt wordt door meerdere frontend applicaties op verschillende domeinen. Implementeer dynamic CORS configuration.',
      difficulty: 'medium',
      type: 'project'
    }
  ],
  resources: [
    {
      title: 'OWASP API Security Top 10',
      url: 'https://owasp.org/www-project-api-security/',
      type: 'guide'
    },
    {
      title: 'Helmet.js Documentation',
      url: 'https://helmetjs.github.io/',
      type: 'documentation'
    },
    {
      title: 'Rate Limiter Flexible',
      url: 'https://github.com/animir/node-rate-limiter-flexible',
      type: 'library'
    },
    {
      title: 'Security Headers Explained',
      url: 'https://securityheaders.com/',
      type: 'tool'
    },
    {
      title: 'API Versioning Best Practices',
      url: 'https://www.freecodecamp.org/news/how-to-version-a-rest-api/',
      type: 'article'
    }
  ]
};