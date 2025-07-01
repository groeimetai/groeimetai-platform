import type { Lesson } from '@/lib/data/courses';

export const lesson42: Lesson = {
  id: 'lesson-4-2',
  title: 'Monitoring architectuur voor AI Swarms',
  duration: '40 min',
  content: `
# Monitoring architectuur voor AI Swarms

## Introductie tot Swarm Monitoring Challenges

AI swarms presenteren unieke monitoring uitdagingen door hun distributed nature, dynamische scaling, en complexe inter-agent communicatie patterns.

## Metrics Architectuur met Prometheus

### Time-series Data Model
\`\`\`typescript
interface AgentMetrics {
  // Performance metrics
  taskCompletionTime: Histogram;
  memoryUsage: Gauge;
  cpuUtilization: Gauge;
  
  // Business metrics
  tasksProcessed: Counter;
  errorRate: Gauge;
  
  // Swarm metrics
  activeConnections: Gauge;
  messagesSent: Counter;
  messagesReceived: Counter;
}
\`\`\`

## Distributed Tracing met OpenTelemetry

Distributed tracing maakt het mogelijk om de complete flow van een request door meerdere agents te volgen.

### Trace Context Propagation
\`\`\`typescript
import { trace, context, SpanStatusCode } from '@opentelemetry/api';

class SwarmTracer {
  private tracer = trace.getTracer('ai-swarm', '1.0.0');
  
  async traceAgentTask(
    agentId: string,
    taskId: string,
    operation: () => Promise<any>
  ) {
    const span = this.tracer.startSpan('agent.task.execute', {
      attributes: {
        'agent.id': agentId,
        'task.id': taskId,
        'swarm.id': process.env.SWARM_ID
      }
    });
    
    try {
      return await context.with(
        trace.setSpan(context.active(), span),
        operation
      );
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error).message
      });
      throw error;
    } finally {
      span.end();
    }
  }
}
\`\`\`

## Log Aggregation Architecture

Structured logging is essentieel voor debugging in distributed systems.

### ELK Stack Integration
\`\`\`typescript
import winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

class SwarmLogger {
  private logger: winston.Logger;
  
  constructor(agentId: string) {
    this.logger = winston.createLogger({
      defaultMeta: {
        agentId,
        swarmId: process.env.SWARM_ID,
        nodeId: process.env.NODE_ID
      },
      transports: [
        new ElasticsearchTransport({
          level: 'info',
          clientOpts: {
            node: process.env.ELASTICSEARCH_URL
          },
          index: 'swarm-logs'
        })
      ]
    });
  }
}
\`\`\`

## Real-time Dashboards met Grafana

### Swarm Performance Dashboard
\`\`\`json
{
  "dashboard": {
    "title": "AI Swarm Performance",
    "panels": [
      {
        "title": "Active Agents by Type",
        "targets": [{
          "expr": "sum by(agent_type) (up{job='ai-swarm-agents'})"
        }]
      },
      {
        "title": "Task Processing Rate",
        "targets": [{
          "expr": "rate(tasks_processed_total[5m])"
        }]
      }
    ]
  }
}
\`\`\`

## Alerting Strategieën

### Alert Configuration
\`\`\`yaml
groups:
  - name: swarm_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(agent_errors_total[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
      
      - alert: SwarmScaleDown
        expr: delta(count(up{job="ai-swarm-agents"})[5m:1m]) < -5
        for: 1m
        labels:
          severity: critical
\`\`\``,
  codeExamples: [
    {
      id: 'complete-monitoring-stack-setup',
      title: 'Complete Monitoring Stack Setup',
      language: 'yaml',
      code: `# docker-compose.yml voor complete monitoring stack
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - monitoring

  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"
    networks:
      - monitoring

  elasticsearch:
    image: elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - es_data:/usr/share/elasticsearch/data
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge

volumes:
  prometheus_data:
  grafana_data:
  es_data:`
    },
    {
      id: 'advanced-distributed-tracing',
      title: 'Advanced Distributed Tracing',
      language: 'typescript',
      code: `import { trace, context, SpanKind } from '@opentelemetry/api';

export class DistributedTracer {
  private tracer = trace.getTracer('ai-swarm-tracer', '1.0.0');
  
  async traceAgentCommunication(
    fromAgent: string,
    toAgent: string,
    messageType: string,
    handler: () => Promise<any>
  ) {
    const span = this.tracer.startSpan('agent.communication', {
      kind: SpanKind.INTERNAL,
      attributes: {
        'agent.from': fromAgent,
        'agent.to': toAgent,
        'message.type': messageType
      }
    });
    
    span.addEvent('message.sent');
    
    try {
      const result = await context.with(
        trace.setSpan(context.active(), span),
        handler
      );
      
      span.addEvent('message.processed');
      return result;
    } catch (error) {
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  }
}`
    },
    {
      id: 'custom-metrics-collector',
      title: 'Custom Metrics Collector',
      language: 'typescript',
      code: `import { metrics } from '@opentelemetry/api';

class AgentMetricsCollector {
  private meter = metrics.getMeter('ai-swarm-agent', '1.0.0');
  private taskCounter: Counter;
  private taskDuration: Histogram;
  private memoryGauge: ObservableGauge;
  
  constructor(private agentId: string) {
    this.initializeMetrics();
  }
  
  private initializeMetrics() {
    this.taskCounter = this.meter.createCounter('tasks_processed_total');
    this.taskDuration = this.meter.createHistogram('task_duration_seconds');
    
    this.memoryGauge = this.meter.createObservableGauge('memory_usage_bytes');
    this.memoryGauge.addCallback((observableResult) => {
      const usage = process.memoryUsage();
      observableResult.observe(usage.heapUsed, {
        agent_id: this.agentId,
        memory_type: 'heap'
      });
    });
  }
  
  recordTaskCompletion(taskType: string, duration: number, success: boolean) {
    const labels = {
      agent_id: this.agentId,
      task_type: taskType,
      status: success ? 'success' : 'failure'
    };
    
    this.taskCounter.add(1, labels);
    this.taskDuration.record(duration, labels);
  }
}`
    }
  ],
  assignments: [
    {
      id: 'assignment-4-2-1',
      title: 'Bouw een monitoring dashboard voor een 10-agent swarm',
      description: 'Implementeer een complete monitoring setup met real-time metrics, distributed tracing, en alerting voor een productie AI swarm.',
      type: 'project',
      difficulty: 'hard',
      checklist: [
        'Setup Prometheus metrics collection',
        'Configure Grafana dashboards',
        'Implement custom agent metrics',
        'Create alerting rules',
        'Test with simulated load'
      ]
    },
    {
      id: 'assignment-4-2-2',
      title: 'Implementeer custom alerts voor swarm health',
      description: 'Creëer intelligente alerting regels die rekening houden met de unieke eigenschappen van AI swarms.',
      type: 'project',
      difficulty: 'medium',
      checklist: [
        'Define swarm-specific metrics',
        'Create alert thresholds',
        'Setup notification channels',
        'Test alert triggering',
        'Document runbooks'
      ]
    }
  ],
  resources: [
    {
      title: 'OpenTelemetry Documentation',
      type: 'documentation',
      url: 'https://opentelemetry.io/docs/'
    },
    {
      title: 'Prometheus Best Practices',
      type: 'guide',
      url: 'https://prometheus.io/docs/practices/'
    },
    {
      title: 'Grafana Dashboard Examples',
      type: 'examples',
      url: 'https://grafana.com/grafana/dashboards/'
    }
  ]
};