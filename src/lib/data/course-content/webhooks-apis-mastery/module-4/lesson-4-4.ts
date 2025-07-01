import { Lesson } from '@/lib/data/courses';

export const lesson4_4: Lesson = {
  id: 'production-ready-integrations',
  title: 'Productie-ready integraties',
  duration: '40 min',
  content: `# Productie-ready integraties

## Monitoring and alerting setup

Een production integratie zonder goede monitoring is als vliegen zonder instrumenten. Je moet weten wat er gebeurt, wanneer het gebeurt, en waarom het gebeurt.

**Essentiële monitoring metrics:**

• **Availability metrics**
  - Uptime percentage (target: 99.9%+)
  - Health check status
  - Circuit breaker state
  - Connection pool status

• **Performance metrics**
  - Response time (p50, p95, p99)
  - Request rate (requests/second)
  - Error rate (4xx, 5xx responses)
  - Queue depth en processing lag

• **Business metrics**
  - Successful transactions
  - Failed transactions met reasons
  - Data volume processed
  - Cost per transaction

• **Resource metrics**
  - CPU en memory usage
  - Database connections
  - API rate limit usage
  - Network I/O

## Monitoring stack implementatie

Een complete monitoring stack voor production integraties:

\`\`\`javascript
// 1. Structured logging met Winston
import winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'api-integration',
    environment: process.env.NODE_ENV
  },
  transports: [
    // Console voor development
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    // Elasticsearch voor production
    new ElasticsearchTransport({
      level: 'info',
      clientOpts: { node: process.env.ELASTICSEARCH_URL },
      index: 'api-logs'
    })
  ]
});

// 2. Metrics collection met Prometheus
import { register, Counter, Histogram, Gauge } from 'prom-client';

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  labelNames: ['type']
});

// 3. Custom metrics middleware
export const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const labels = {
      method: req.method,
      route: req.route?.path || 'unknown',
      status_code: res.statusCode
    };
    
    httpRequestDuration.observe(labels, duration);
    httpRequestTotal.inc(labels);
    
    // Log slow requests
    if (duration > 1) {
      logger.warn('Slow request detected', {
        ...labels,
        duration,
        path: req.path,
        query: req.query
      });
    }
  });
  
  next();
};

// 4. Health checks en alerting
import { createTerminus } from '@godaddy/terminus';

const healthCheck = async () => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    externalAPI: await checkExternalAPI(),
    diskSpace: await checkDiskSpace()
  };
  
  const healthy = Object.values(checks).every(check => check.status === 'healthy');
  
  if (!healthy) {
    logger.error('Health check failed', checks);
    await sendAlert({
      severity: 'critical',
      message: 'Service health check failed',
      details: checks
    });
  }
  
  return {
    status: healthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks
  };
};

// 5. Distributed tracing met OpenTelemetry
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';

const provider = new NodeTracerProvider();
const jaegerExporter = new JaegerExporter({
  endpoint: process.env.JAEGER_ENDPOINT
});

provider.addSpanProcessor(
  new BatchSpanProcessor(jaegerExporter)
);

registerInstrumentations({
  instrumentations: [
    new HttpInstrumentation({
      requestHook: (span, request) => {
        span.setAttributes({
          'http.request.body': JSON.stringify(request.body)
        });
      }
    })
  ]
});

// 6. Alerting setup met PagerDuty
import { PagerDuty } from 'node-pagerduty';

const pd = new PagerDuty(process.env.PAGERDUTY_TOKEN);

export const sendAlert = async ({ severity, message, details }) => {
  const alertLevels = {
    critical: 'trigger',
    warning: 'trigger',
    info: 'resolve'
  };
  
  await pd.incidents.createIncident({
    incident: {
      type: 'incident',
      title: message,
      service: {
        id: process.env.PAGERDUTY_SERVICE_ID,
        type: 'service_reference'
      },
      urgency: severity === 'critical' ? 'high' : 'low',
      body: {
        type: 'incident_body',
        details: JSON.stringify(details, null, 2)
      }
    }
  });
  
  // Also send to Slack for visibility
  await sendSlackNotification({
    channel: '#alerts',
    text: \`🚨 \${severity.toUpperCase()}: \${message}\`,
    attachments: [{
      color: severity === 'critical' ? 'danger' : 'warning',
      fields: Object.entries(details).map(([key, value]) => ({
        title: key,
        value: JSON.stringify(value),
        short: true
      }))
    }]
  });
};
\`\`\`

## Monitoring dashboard setup

Grafana dashboard configuration voor complete visibility:

\`\`\`json
{
  "dashboard": {
    "title": "API Integration Monitor",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [{
          "expr": "rate(http_requests_total[5m])",
          "legendFormat": "{{method}} {{route}}"
        }],
        "type": "graph"
      },
      {
        "title": "Error Rate",
        "targets": [{
          "expr": "rate(http_requests_total{status_code=~'4..|5..'}[5m])",
          "legendFormat": "{{status_code}}"
        }],
        "type": "graph",
        "alert": {
          "conditions": [{
            "evaluator": { "params": [0.01], "type": "gt" },
            "operator": { "type": "and" },
            "query": { "params": ["A", "5m", "now"] },
            "reducer": { "params": [], "type": "avg" },
            "type": "query"
          }],
          "message": "High error rate detected"
        }
      },
      {
        "title": "Response Time",
        "targets": [{
          "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
          "legendFormat": "p95"
        }],
        "type": "graph"
      },
      {
        "title": "Active Connections",
        "targets": [{
          "expr": "active_connections",
          "legendFormat": "{{type}}"
        }],
        "type": "stat"
      }
    ]
  }
}
\`\`\`

## Documentation generation

Automatische documentatie generatie is cruciaal voor maintenance en onboarding. Implementeer deze tools en patterns:

**1. API Documentation met OpenAPI**
- Genereer specs vanuit code annotations
- Host interactieve docs met Swagger UI
- Automatische client SDK generatie
- Postman collection export

**2. Code documentation**
- JSDoc voor alle publieke functies
- README templates voor elke module
- Architecture Decision Records (ADRs)
- Inline examples en usage patterns

**3. Integration guides**
- Getting started guide
- Authentication flow diagrams
- Error handling reference
- Rate limiting guidelines

## Automated documentation pipeline

Complete documentation generation setup:

\`\`\`javascript
// 1. OpenAPI spec generation
import { generateOpenAPIDocument } from '@tsoa/spec';
import { SwaggerUIBundle } from 'swagger-ui-dist';

export const generateAPIDocs = async () => {
  const spec = await generateOpenAPIDocument({
    basePath: '/api',
    entryFile: './src/app.ts',
    specVersion: 3,
    outputDirectory: './docs',
    controllerPathGlobs: ['./src/controllers/**/*.ts'],
    securityDefinitions: {
      api_key: {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header'
      },
      oauth2: {
        type: 'oauth2',
        flows: {
          authorizationCode: {
            authorizationUrl: 'https://auth.example.com/oauth/authorize',
            tokenUrl: 'https://auth.example.com/oauth/token',
            scopes: {
              read: 'Read access',
              write: 'Write access'
            }
          }
        }
      }
    }
  });
  
  // Add custom examples
  spec.paths['/webhooks'].post.examples = {
    'payment-success': {
      summary: 'Payment successful webhook',
      value: {
        event: 'payment.success',
        data: {
          amount: 9999,
          currency: 'EUR',
          customer_id: 'cus_123'
        }
      }
    }
  };
  
  return spec;
};

// 2. Markdown documentation generator
import { TypeDocReader, TypeDocWriter } from 'typedoc';

export const generateCodeDocs = async () => {
  const app = new TypeDoc.Application();
  
  app.options.addReader(new TypeDocReader());
  app.options.addWriter(new TypeDocWriter());
  
  app.bootstrap({
    entryPoints: ['./src'],
    exclude: ['**/*.test.ts'],
    plugin: ['typedoc-plugin-markdown'],
    theme: 'markdown',
    readme: './README.md',
    includes: './docs/includes',
    out: './docs/api'
  });
  
  const project = app.convert();
  await app.generateDocs(project, './docs/api');
  
  // Generate integration examples
  await generateIntegrationExamples();
};

// 3. Integration examples generator
async function generateIntegrationExamples() {
  const languages = ['javascript', 'python', 'php', 'java', 'go'];
  const examples = {};
  
  for (const lang of languages) {
    examples[lang] = generateClientExample(lang);
  }
  
  await fs.writeFile(
    './docs/examples/clients.md',
    formatExamples(examples)
  );
}

// 4. Architecture documentation
import { ADR } from 'adr-tools';

export const documentArchitectureDecision = async (decision) => {
  const adr = new ADR({
    directory: './docs/adr',
    template: 'madr'
  });
  
  await adr.create({
    title: decision.title,
    status: 'accepted',
    context: decision.context,
    decision: decision.decision,
    consequences: decision.consequences,
    alternatives: decision.alternatives
  });
};

// 5. Postman collection generator
export const generatePostmanCollection = (openApiSpec) => {
  const collection = {
    info: {
      name: openApiSpec.info.title,
      description: openApiSpec.info.description,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    auth: {
      type: 'apikey',
      apikey: [{
        key: 'key',
        value: 'X-API-Key'
      }]
    },
    item: []
  };
  
  // Convert OpenAPI paths to Postman requests
  for (const [path, methods] of Object.entries(openApiSpec.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      collection.item.push({
        name: operation.summary,
        request: {
          method: method.toUpperCase(),
          url: {
            raw: '{{baseUrl}}' + path,
            host: ['{{baseUrl}}'],
            path: path.split('/').filter(p => p)
          },
          header: operation.parameters
            ?.filter(p => p.in === 'header')
            ?.map(p => ({
              key: p.name,
              value: p.example || '',
              description: p.description
            })),
          body: operation.requestBody ? {
            mode: 'raw',
            raw: JSON.stringify(
              operation.requestBody.content['application/json'].example,
              null,
              2
            )
          } : undefined
        },
        response: Object.entries(operation.responses).map(([code, response]) => ({
          name: response.description,
          originalRequest: { method: method.toUpperCase(), url: path },
          status: response.description,
          code: parseInt(code),
          body: JSON.stringify(
            response.content?.['application/json']?.example,
            null,
            2
          )
        }))
      });
    }
  }
  
  return collection;
};

// 6. README generator
export const generateReadme = async (projectInfo) => {
  const template = \`# \${projectInfo.name}

\${projectInfo.description}

## Quick Start

\\\`\\\`\\\`bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Run development server
npm run dev
\\\`\\\`\\\`

## API Documentation

- [OpenAPI Spec](./docs/openapi.json)
- [Interactive Docs](https://api.example.com/docs)
- [Postman Collection](./docs/postman-collection.json)

## Architecture

See [Architecture Overview](./docs/ARCHITECTURE.md)

## Integration Examples

- [JavaScript](./docs/examples/javascript.md)
- [Python](./docs/examples/python.md)
- [PHP](./docs/examples/php.md)

## Monitoring

- [Grafana Dashboard](https://grafana.example.com/d/api-integration)
- [Logs (Kibana)](https://kibana.example.com)

## Support

- Email: \${projectInfo.supportEmail}
- Slack: #\${projectInfo.slackChannel}
\`;

  await fs.writeFile('./README.md', template);
};
\`\`\`

## Versioning strategies

API versioning is cruciaal voor backward compatibility. Hier zijn de beste practices:

**1. Semantic Versioning (SemVer)**
- MAJOR: Breaking changes
- MINOR: Nieuwe features (backward compatible)
- PATCH: Bug fixes

**2. API Versioning Patterns**
- URL versioning: /api/v1/users
- Header versioning: Accept: application/vnd.api+json;version=1
- Query parameter: /api/users?version=1

**3. Deprecation Policy**
- Minimum 6 maanden deprecation notice
- Clear migration guides
- Sunset headers in responses
- Monitoring van deprecated endpoint usage

## Versioning implementation

Complete versioning strategy implementation:

\`\`\`javascript
// 1. Version middleware
export const versionMiddleware = (req, res, next) => {
  // Extract version from different sources
  const version = 
    req.headers['api-version'] ||
    req.query.version ||
    req.path.match(/\\/v(\\d+)/)?.[1] ||
    '1';
  
  req.apiVersion = parseInt(version);
  
  // Add deprecation warnings
  if (req.apiVersion < CURRENT_VERSION) {
    res.setHeader('Sunset', DEPRECATION_DATE);
    res.setHeader('Deprecation', 'true');
    res.setHeader('Link', \`</api/v\${CURRENT_VERSION}>; rel="successor-version"\`);
  }
  
  next();
};

// 2. Version-specific routing
import { Router } from 'express';

export const createVersionedRouter = () => {
  const router = Router();
  
  // Version 1 routes
  router.use('/v1', v1Routes);
  
  // Version 2 routes
  router.use('/v2', v2Routes);
  
  // Latest version alias
  router.use('/latest', v2Routes);
  
  // Default to latest
  router.use('/', v2Routes);
  
  return router;
};

// 3. Controller versioning
export class UserController {
  @Version('1')
  @Get('/users/:id')
  async getUserV1(req, res) {
    const user = await this.userService.findById(req.params.id);
    
    // V1 response format
    return res.json({
      id: user.id,
      name: user.name,
      email: user.email
    });
  }
  
  @Version('2')
  @Get('/users/:id')
  async getUserV2(req, res) {
    const user = await this.userService.findById(req.params.id);
    
    // V2 response format with nested structure
    return res.json({
      id: user.id,
      profile: {
        name: user.name,
        email: user.email,
        avatar: user.avatar
      },
      metadata: {
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  }
}

// 4. Database migrations for versioning
export class VersionMigration {
  async up() {
    // Add version tracking
    await this.db.schema.createTable('api_versions', table => {
      table.increments('id');
      table.string('version').notNullable();
      table.json('changes').notNullable();
      table.timestamp('released_at').notNullable();
      table.timestamp('deprecated_at').nullable();
      table.timestamp('sunset_at').nullable();
    });
    
    // Track client versions
    await this.db.schema.createTable('client_versions', table => {
      table.increments('id');
      table.string('client_id').notNullable();
      table.string('api_version').notNullable();
      table.timestamp('last_used_at').notNullable();
      table.index(['client_id', 'api_version']);
    });
  }
}

// 5. Version compatibility layer
export class VersionAdapter {
  constructor(private fromVersion: number, private toVersion: number) {}
  
  async adaptRequest(req) {
    if (this.fromVersion === 1 && this.toVersion === 2) {
      // Transform v1 request to v2 format
      if (req.body.user_name) {
        req.body.profile = {
          name: req.body.user_name,
          email: req.body.user_email
        };
        delete req.body.user_name;
        delete req.body.user_email;
      }
    }
    
    return req;
  }
  
  async adaptResponse(response) {
    if (this.fromVersion === 1 && this.toVersion === 2) {
      // Transform v2 response to v1 format
      if (response.profile) {
        response.name = response.profile.name;
        response.email = response.profile.email;
        delete response.profile;
        delete response.metadata;
      }
    }
    
    return response;
  }
}

// 6. Version analytics
export class VersionAnalytics {
  async trackUsage(clientId, version, endpoint) {
    await this.db('api_usage').insert({
      client_id: clientId,
      api_version: version,
      endpoint,
      timestamp: new Date()
    });
    
    // Alert if deprecated version usage increases
    const deprecatedUsage = await this.getDeprecatedVersionUsage();
    if (deprecatedUsage.trend === 'increasing') {
      await sendAlert({
        severity: 'warning',
        message: 'Deprecated API version usage increasing',
        details: deprecatedUsage
      });
    }
  }
  
  async getVersionDistribution() {
    return this.db('api_usage')
      .select('api_version')
      .count('* as count')
      .groupBy('api_version')
      .orderBy('api_version', 'desc');
  }
}
\`\`\`

## Deployment patterns

Modern deployment patterns voor zero-downtime releases:

**1. Blue-Green Deployment**
- Twee identieke production environments
- Switch traffic met load balancer
- Instant rollback mogelijk
- Geen downtime

**2. Canary Deployment**
- Gradual rollout naar subset van users
- Monitor metrics tijdens rollout
- Automatische rollback bij problemen
- Risk mitigation

**3. Rolling Deployment**
- Update instances één voor één
- Health checks tussen updates
- Zero downtime
- Geschikt voor stateless services

**4. Feature Flags**
- Deploy code zonder activation
- Gradual feature rollout
- A/B testing capabilities
- Quick disable zonder redeploy

## Deployment automation

Complete deployment pipeline met GitHub Actions:

\`\`\`yaml
# .github/workflows/deploy.yml
name: Production Deployment

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      deployment_type:
        description: 'Deployment type'
        required: true
        default: 'canary'
        type: choice
        options:
          - canary
          - blue-green
          - rolling

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          TEST_API_KEY: \${{ secrets.TEST_API_KEY }}

  build:
    needs: test
    runs-on: ubuntu-latest
    outputs:
      version: \${{ steps.meta.outputs.version }}
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Log in to Container Registry
        uses: docker/login-action@v2
        with:
          registry: \${{ env.REGISTRY }}
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-
            type=semver,pattern={{version}}
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: \${{ steps.meta.outputs.tags }}
          labels: \${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-canary:
    if: github.event.inputs.deployment_type == 'canary' || github.event_name == 'push'
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes (Canary)
        uses: azure/k8s-deploy@v4
        with:
          manifests: |
            k8s/deployment-canary.yaml
            k8s/service.yaml
          images: |
            \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:\${{ needs.build.outputs.version }}
          strategy: canary
          percentage: 10
          
      - name: Run smoke tests
        run: |
          npm run test:smoke -- --url https://api-canary.example.com
          
      - name: Monitor canary metrics
        run: |
          node scripts/monitor-canary.js \\
            --duration 300 \\
            --error-threshold 0.01 \\
            --latency-threshold 100
          
      - name: Promote canary
        if: success()
        run: |
          kubectl set image deployment/api-integration \\
            api=\${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:\${{ needs.build.outputs.version }} \\
            --record

  deploy-blue-green:
    if: github.event.inputs.deployment_type == 'blue-green'
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Blue environment
        run: |
          kubectl apply -f k8s/deployment-blue.yaml
          kubectl set image deployment/api-integration-blue \\
            api=\${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:\${{ needs.build.outputs.version }}
          kubectl wait --for=condition=available --timeout=300s \\
            deployment/api-integration-blue
            
      - name: Run health checks
        run: |
          ./scripts/health-check.sh https://api-blue.example.com
          
      - name: Switch traffic to Blue
        run: |
          kubectl patch service api-integration \\
            -p '{"spec":{"selector":{"version":"blue"}}}'
            
      - name: Monitor after switch
        run: |
          sleep 60
          ./scripts/monitor-deployment.sh
          
      - name: Update Green to match Blue
        if: success()
        run: |
          kubectl set image deployment/api-integration-green \\
            api=\${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:\${{ needs.build.outputs.version }}

  rollback:
    if: failure()
    needs: [deploy-canary, deploy-blue-green]
    runs-on: ubuntu-latest
    steps:
      - name: Rollback deployment
        run: |
          kubectl rollout undo deployment/api-integration
          
      - name: Send alert
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          text: 'Deployment failed and rolled back!'
          webhook_url: \${{ secrets.SLACK_WEBHOOK }}

# Kubernetes manifests
---
# k8s/deployment-canary.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-integration-canary
  labels:
    app: api-integration
    version: canary
spec:
  replicas: 1
  selector:
    matchLabels:
      app: api-integration
      version: canary
  template:
    metadata:
      labels:
        app: api-integration
        version: canary
    spec:
      containers:
      - name: api
        image: ghcr.io/company/api-integration:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: production
        - name: CANARY
          value: "true"
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
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
\`\`\`

## Maintenance procedures

Structured maintenance procedures voor production integraties:

**1. Regular Maintenance Tasks**
• Log rotation en cleanup
• Database optimization
• Certificate renewal
• Dependency updates
• Performance tuning

**2. Emergency Procedures**
• Incident response playbooks
• Rollback procedures
• Data recovery plans
• Communication templates

**3. Scheduled Maintenance**
• Maintenance windows
• User notifications
• Gradual degradation
• Service restoration

**4. Post-Incident Reviews**
• Root cause analysis
• Timeline reconstruction
• Action items
• Process improvements

## Maintenance automation scripts

Complete maintenance automation setup:

\`\`\`javascript
// 1. Automated maintenance scheduler
import { CronJob } from 'cron';
import { MaintenanceService } from './services/maintenance';

export class MaintenanceScheduler {
  private jobs: Map<string, CronJob> = new Map();
  
  constructor(private maintenance: MaintenanceService) {
    this.initializeJobs();
  }
  
  initializeJobs() {
    // Daily log cleanup
    this.addJob('log-cleanup', '0 2 * * *', async () => {
      await this.maintenance.cleanupLogs({
        olderThan: '30d',
        keepErrors: '90d',
        compress: true
      });
    });
    
    // Weekly database optimization
    this.addJob('db-optimization', '0 3 * * 0', async () => {
      await this.maintenance.optimizeDatabase({
        vacuum: true,
        analyze: true,
        reindex: true
      });
    });
    
    // Monthly certificate check
    this.addJob('cert-check', '0 4 1 * *', async () => {
      const expiringSoon = await this.maintenance.checkCertificates({
        warningDays: 30
      });
      
      if (expiringSoon.length > 0) {
        await this.maintenance.renewCertificates(expiringSoon);
      }
    });
    
    // Hourly health check aggregation
    this.addJob('health-aggregation', '0 * * * *', async () => {
      await this.maintenance.aggregateHealthMetrics();
    });
  }
  
  addJob(name: string, schedule: string, task: () => Promise<void>) {
    const job = new CronJob(schedule, async () => {
      console.log(\`Starting maintenance job: \${name}\`);
      const start = Date.now();
      
      try {
        await task();
        await this.recordSuccess(name, Date.now() - start);
      } catch (error) {
        await this.recordFailure(name, error);
        await this.notifyFailure(name, error);
      }
    });
    
    job.start();
    this.jobs.set(name, job);
  }
}

// 2. Database maintenance procedures
export class DatabaseMaintenance {
  async performMaintenance() {
    const maintenanceWindow = await this.acquireMaintenanceWindow();
    
    try {
      // Enable read-only mode
      await this.enableReadOnlyMode();
      
      // Backup current state
      const backupId = await this.createBackup();
      
      // Perform maintenance tasks
      await this.runVacuum();
      await this.updateStatistics();
      await this.rebuildIndexes();
      await this.archiveOldData();
      
      // Validate database health
      const health = await this.validateDatabase();
      if (!health.isHealthy) {
        throw new Error('Database validation failed');
      }
      
      // Disable read-only mode
      await this.disableReadOnlyMode();
      
    } catch (error) {
      // Rollback on failure
      await this.restoreFromBackup(backupId);
      throw error;
    } finally {
      await this.releaseMaintenanceWindow(maintenanceWindow);
    }
  }
  
  async archiveOldData() {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 6);
    
    // Archive old webhook logs
    await this.db.transaction(async trx => {
      const oldLogs = await trx('webhook_logs')
        .where('created_at', '<', cutoffDate)
        .select();
      
      // Write to archive storage
      await this.archiveStorage.write(
        \`webhook_logs_\${cutoffDate.toISOString()}.json\`,
        oldLogs
      );
      
      // Delete from main database
      await trx('webhook_logs')
        .where('created_at', '<', cutoffDate)
        .delete();
    });
  }
}

// 3. Incident response automation
export class IncidentResponse {
  async handleIncident(alert: Alert) {
    const incident = await this.createIncident(alert);
    
    // Execute response playbook
    const playbook = this.getPlaybook(alert.type);
    
    for (const step of playbook.steps) {
      try {
        await this.executeStep(step, incident);
        await this.updateIncident(incident, {
          status: \`Completed: \${step.name}\`
        });
      } catch (error) {
        await this.escalateIncident(incident, error);
        break;
      }
    }
  }
  
  getPlaybook(alertType: string) {
    const playbooks = {
      'high_error_rate': {
        steps: [
          { name: 'Enable circuit breaker', action: this.enableCircuitBreaker },
          { name: 'Scale up instances', action: this.scaleUp },
          { name: 'Analyze error logs', action: this.analyzeErrors },
          { name: 'Notify on-call', action: this.notifyOnCall }
        ]
      },
      'database_connection_pool_exhausted': {
        steps: [
          { name: 'Kill idle connections', action: this.killIdleConnections },
          { name: 'Increase pool size', action: this.increasePoolSize },
          { name: 'Analyze slow queries', action: this.analyzeSlowQueries },
          { name: 'Enable read replica', action: this.enableReadReplica }
        ]
      },
      'api_rate_limit_exceeded': {
        steps: [
          { name: 'Identify heavy users', action: this.identifyHeavyUsers },
          { name: 'Apply emergency limits', action: this.applyEmergencyLimits },
          { name: 'Cache frequent requests', action: this.enableAggressiveCaching },
          { name: 'Contact affected users', action: this.contactAffectedUsers }
        ]
      }
    };
    
    return playbooks[alertType] || this.getDefaultPlaybook();
  }
}

// 4. Dependency update automation
export class DependencyManager {
  async performUpdates() {
    // Check for updates
    const updates = await this.checkForUpdates();
    
    // Filter based on update policy
    const approvedUpdates = updates.filter(update => {
      if (update.type === 'major') return false; // Manual approval required
      if (update.type === 'security') return true; // Always update
      if (update.type === 'patch') return true; // Auto-update patches
      return false;
    });
    
    // Create update branch
    await this.git.createBranch('deps/automated-update');
    
    // Apply updates
    for (const update of approvedUpdates) {
      await this.applyUpdate(update);
      await this.runTests();
    }
    
    // Create pull request
    await this.createPullRequest({
      title: 'Automated dependency updates',
      body: this.generateUpdateSummary(approvedUpdates),
      labels: ['dependencies', 'automated']
    });
  }
  
  async monitorVulnerabilities() {
    const vulnerabilities = await this.scanForVulnerabilities();
    
    if (vulnerabilities.critical.length > 0) {
      await this.createEmergencyPatch(vulnerabilities.critical);
      await this.notifySecurityTeam(vulnerabilities);
    }
  }
}

// 5. Performance optimization procedures
export class PerformanceOptimizer {
  async optimizeSystem() {
    const metrics = await this.collectPerformanceMetrics();
    
    // Analyze bottlenecks
    const bottlenecks = this.identifyBottlenecks(metrics);
    
    for (const bottleneck of bottlenecks) {
      switch (bottleneck.type) {
        case 'slow_query':
          await this.optimizeQuery(bottleneck);
          break;
        case 'memory_leak':
          await this.fixMemoryLeak(bottleneck);
          break;
        case 'inefficient_cache':
          await this.optimizeCache(bottleneck);
          break;
        case 'api_latency':
          await this.optimizeAPICall(bottleneck);
          break;
      }
    }
    
    // Verify improvements
    const newMetrics = await this.collectPerformanceMetrics();
    await this.reportImprovements(metrics, newMetrics);
  }
}
\`\`\`

## Production deployment checklist

Complete checklist voor production-ready deployments:

**Pre-deployment Checklist**

□ **Code Quality**
  - All tests passing (unit, integration, e2e)
  - Code coverage > 80%
  - No critical security vulnerabilities
  - Linting rules satisfied
  - Performance benchmarks met

□ **Documentation**
  - API documentation up-to-date
  - README volledig
  - Architecture diagrams current
  - Runbooks voor common issues
  - Migration guide (indien nodig)

□ **Infrastructure**
  - Load balancer configured
  - Auto-scaling policies set
  - Backup strategy implemented
  - Disaster recovery plan tested
  - SSL certificates valid

□ **Monitoring**
  - All endpoints have health checks
  - Metrics dashboards configured
  - Alerts configured met thresholds
  - Log aggregation working
  - Distributed tracing enabled

□ **Security**
  - Authentication/authorization tested
  - Rate limiting configured
  - Input validation comprehensive
  - CORS policies correct
  - Secrets in secure vault

□ **Dependencies**
  - All dependencies up-to-date
  - License compliance checked
  - Vulnerability scan clean
  - Lock files committed
  - Docker base images recent

**Deployment Checklist**

□ **Pre-deployment**
  - Maintenance window scheduled
  - Stakeholders notified
  - Rollback plan ready
  - Database migrations tested
  - Feature flags configured

□ **During Deployment**
  - Blue-green environments ready
  - Health checks passing
  - Smoke tests successful
  - Monitoring shows normal metrics
  - No critical errors in logs

□ **Post-deployment**
  - All features working correctly
  - Performance metrics normal
  - No increase in error rates
  - Customer notifications sent
  - Documentation updated

**Emergency Rollback Procedure**

1. **Identificeer het probleem**
   - Check error logs
   - Monitor metrics dashboards
   - Review recent changes

2. **Beslis over rollback**
   - Impact assessment
   - Can it be hotfixed?
   - Stakeholder communication

3. **Execute rollback**
   \`\`\`bash
   # Kubernetes rollback
   kubectl rollout undo deployment/api-integration
   
   # Docker Swarm rollback
   docker service rollback api-integration
   
   # Blue-green switch back
   ./scripts/switch-to-green.sh
   \`\`\`

4. **Verify rollback**
   - Health checks passing
   - Features working
   - Data integrity maintained

5. **Post-mortem**
   - Timeline of events
   - Root cause analysis
   - Action items
   - Process improvements`,
  codeExamples: [
    {
      id: 'complete-production-monitoring-setup',
      title: 'Complete production monitoring setup',
      language: 'javascript',
      code: `// monitoring-stack.js
import express from 'express';
import { register } from 'prom-client';
import winston from 'winston';
import { createTerminus } from '@godaddy/terminus';

// Create Express app with monitoring
const app = express();

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.APP_VERSION
  });
});

// Readiness check
app.get('/ready', async (req, res) => {
  try {
    // Check all dependencies
    await checkDatabase();
    await checkRedis();
    await checkExternalAPIs();
    
    res.json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error.message
    });
  }
});

// Graceful shutdown
createTerminus(server, {
  signal: 'SIGINT',
  healthChecks: { '/health': onHealthCheck },
  onSignal,
  onShutdown
});

async function onSignal() {
  logger.info('Server is starting cleanup');
  // Start cleanup of resources
  await closeDatabase();
  await closeRedis();
}

async function onShutdown() {
  logger.info('Cleanup finished, server is shutting down');
}

// docker-compose.monitoring.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
  
  grafana:
    image: grafana/grafana
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
  
  alertmanager:
    image: prom/alertmanager
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
    ports:
      - "9093:9093"
  
  elasticsearch:
    image: elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - es_data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"
  
  kibana:
    image: kibana:8.11.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200

volumes:
  prometheus_data:
  grafana_data:
  es_data:`,
      explanation: 'Complete monitoring stack met Prometheus, Grafana, Elasticsearch en health checks voor production deployments.'
    }
  ],
  assignments: [
    {
      id: 'monitoring-setup',
      title: 'Production monitoring implementatie',
      description: 'Implementeer een complete monitoring oplossing voor een bestaande API integratie, inclusief metrics, logging, alerting en dashboards.',
      difficulty: 'medium',
      type: 'project'
    },
    {
      id: 'zero-downtime-deployment',
      title: 'Zero-downtime deployment pipeline',
      description: 'Bouw een complete CI/CD pipeline met blue-green deployment, automated testing, en rollback capabilities voor een production API.',
      difficulty: 'hard',
      type: 'project'
    },
    {
      id: 'incident-response-playbook',
      title: 'Incident response automation',
      description: 'Ontwikkel een automated incident response systeem met playbooks voor common scenarios, automatic remediation, en post-mortem generation.',
      difficulty: 'hard',
      type: 'project'
    }
  ],
  resources: [
    {
      title: 'Site Reliability Engineering',
      url: 'https://sre.google/books/',
      type: 'book'
    },
    {
      title: 'The Twelve-Factor App',
      url: 'https://12factor.net/',
      type: 'guide'
    },
    {
      title: 'Prometheus Best Practices',
      url: 'https://prometheus.io/docs/practices/',
      type: 'documentation'
    },
    {
      title: 'Grafana Dashboard Examples',
      url: 'https://grafana.com/grafana/dashboards/',
      type: 'resource'
    },
    {
      title: 'API Versioning Best Practices',
      url: 'https://www.freecodecamp.org/news/how-to-version-a-rest-api/',
      type: 'article'
    }
  ]
};