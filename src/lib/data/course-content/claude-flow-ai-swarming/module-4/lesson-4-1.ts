import type { Lesson } from '@/lib/data/courses';

// Section content to be combined
const sections = [
  {
    id: 'kubernetes-architecture',
    title: 'Kubernetes Architecture for AI Swarms',
    content: `# Kubernetes Architecture for Claude Flow

## Container Structure

Claude Flow agents run as containerized microservices in Kubernetes, enabling:
- **Horizontal scaling** of agent instances
- **Resource isolation** between different agent types
- **Automatic failover** and recovery
- **Load distribution** across nodes

### Base Container Design

\`\`\`dockerfile
# Dockerfile.claude-flow
FROM node:20-alpine AS builder

# Install Claude Flow dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --production

# Copy application code
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache python3 py3-pip git
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Create non-root user
RUN addgroup -g 1001 -S claude && \\
    adduser -S claude -u 1001
USER claude

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \\
  CMD node dist/health-check.js || exit 1

EXPOSE 3000
CMD ["node", "dist/index.js"]
\`\`\`

### Agent-Specific Containers

Each agent type gets its own optimized container:

\`\`\`yaml
# docker-compose.yml for development
version: '3.8'
services:
  orchestrator:
    build:
      context: .
      dockerfile: Dockerfile.orchestrator
    environment:
      - AGENT_TYPE=orchestrator
      - MEMORY_BACKEND=redis
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
      - postgres

  researcher:
    build:
      context: .
      dockerfile: Dockerfile.researcher
    environment:
      - AGENT_TYPE=researcher
      - MAX_CONCURRENT_SEARCHES=10
    deploy:
      replicas: 3

  coder:
    build:
      context: .
      dockerfile: Dockerfile.coder
    environment:
      - AGENT_TYPE=coder
      - CODE_EXECUTION_TIMEOUT=300000
    volumes:
      - ./workspace:/workspace
\`\`\``
  },
  {
    id: 'k8s-deployment',
    title: 'Kubernetes Deployment Configuration',
    content: `# Kubernetes Deployment for Claude Flow

## Namespace and RBAC Setup

\`\`\`yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: claude-flow
  labels:
    name: claude-flow
    monitoring: prometheus

---
# rbac.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: claude-flow-sa
  namespace: claude-flow

---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: claude-flow
  name: claude-flow-role
rules:
- apiGroups: [""]
  resources: ["pods", "services"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments"]
  verbs: ["get", "list", "watch", "update", "patch"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: claude-flow-binding
  namespace: claude-flow
subjects:
- kind: ServiceAccount
  name: claude-flow-sa
  namespace: claude-flow
roleRef:
  kind: Role
  name: claude-flow-role
  apiGroup: rbac.authorization.k8s.io
\`\`\`

## Core Deployments

### Orchestrator Deployment

\`\`\`yaml
# orchestrator-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: claude-orchestrator
  namespace: claude-flow
  labels:
    app: claude-orchestrator
    component: orchestration
spec:
  replicas: 2
  selector:
    matchLabels:
      app: claude-orchestrator
  template:
    metadata:
      labels:
        app: claude-orchestrator
        component: orchestration
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "9090"
        prometheus.io/path: "/metrics"
    spec:
      serviceAccountName: claude-flow-sa
      containers:
      - name: orchestrator
        image: your-registry/claude-flow-orchestrator:latest
        ports:
        - containerPort: 3000
          name: http
        - containerPort: 9090
          name: metrics
        env:
        - name: NODE_ENV
          value: "production"
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: claude-flow-secrets
              key: redis-url
        - name: CLAUDE_API_KEY
          valueFrom:
            secretKeyRef:
              name: claude-flow-secrets
              key: claude-api-key
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: http
          initialDelaySeconds: 5
          periodSeconds: 5
\`\`\`

### Agent Pool Deployment

\`\`\`yaml
# agent-pool-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: claude-agent-pool
  namespace: claude-flow
spec:
  replicas: 10
  selector:
    matchLabels:
      app: claude-agent
  template:
    metadata:
      labels:
        app: claude-agent
        component: worker
    spec:
      containers:
      - name: agent
        image: your-registry/claude-flow-agent:latest
        env:
        - name: AGENT_MODE
          value: "pool"
        - name: MAX_CONCURRENT_TASKS
          value: "5"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
# Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: agent-pool-hpa
  namespace: claude-flow
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: claude-agent-pool
  minReplicas: 5
  maxReplicas: 50
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
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
\`\`\``
  },
  {
    id: 'load-balancing',
    title: 'Load Balancing for Agent Workloads',
    content: `# Load Balancing AI Agent Workloads

## Service Configuration

### Internal Load Balancing

\`\`\`yaml
# services.yaml
apiVersion: v1
kind: Service
metadata:
  name: orchestrator-service
  namespace: claude-flow
  labels:
    app: claude-orchestrator
spec:
  type: ClusterIP
  selector:
    app: claude-orchestrator
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
    name: http
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 3600

---
# Agent pool service with load distribution
apiVersion: v1
kind: Service
metadata:
  name: agent-pool-service
  namespace: claude-flow
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: "nlb"
spec:
  type: LoadBalancer
  selector:
    app: claude-agent
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
\`\`\`

## Ingress Configuration

\`\`\`yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: claude-flow-ingress
  namespace: claude-flow
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "300"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "300"
spec:
  tls:
  - hosts:
    - api.claude-flow.yourdomain.com
    secretName: claude-flow-tls
  rules:
  - host: api.claude-flow.yourdomain.com
    http:
      paths:
      - path: /orchestrator
        pathType: Prefix
        backend:
          service:
            name: orchestrator-service
            port:
              number: 80
      - path: /agents
        pathType: Prefix
        backend:
          service:
            name: agent-pool-service
            port:
              number: 80
\`\`\`

## Advanced Load Distribution

### Custom Agent Router

\`\`\`typescript
// src/load-balancer/agent-router.ts
import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';

interface AgentPool {
  id: string;
  endpoint: string;
  capacity: number;
  currentLoad: number;
  specializations: string[];
}

export class AgentLoadBalancer {
  private pools: Map<string, AgentPool> = new Map();
  private healthChecks: Map<string, boolean> = new Map();

  constructor(private readonly redisClient: any) {
    this.initializePools();
    this.startHealthChecks();
  }

  async routeRequest(req: Request, res: Response, next: NextFunction) {
    const taskType = req.body.taskType || 'general';
    const complexity = this.estimateComplexity(req.body);
    
    // Get available pools for this task type
    const availablePools = await this.getAvailablePools(taskType);
    
    if (availablePools.length === 0) {
      return res.status(503).json({
        error: 'No available agents for this task type'
      });
    }

    // Select optimal pool based on load and specialization
    const selectedPool = this.selectOptimalPool(
      availablePools,
      taskType,
      complexity
    );

    // Update load metrics
    await this.incrementPoolLoad(selectedPool.id);

    // Forward request
    req.headers['x-agent-pool'] = selectedPool.id;
    req.headers['x-task-complexity'] = complexity.toString();
    
    next();
  }

  private selectOptimalPool(
    pools: AgentPool[],
    taskType: string,
    complexity: number
  ): AgentPool {
    // Score each pool
    const scoredPools = pools.map(pool => {
      let score = 100;
      
      // Reduce score based on current load
      const loadRatio = pool.currentLoad / pool.capacity;
      score -= loadRatio * 50;
      
      // Bonus for specialization match
      if (pool.specializations.includes(taskType)) {
        score += 20;
      }
      
      // Penalty for high complexity on loaded pools
      if (complexity > 0.7 && loadRatio > 0.5) {
        score -= 30;
      }
      
      return { pool, score };
    });

    // Sort by score and return best option
    scoredPools.sort((a, b) => b.score - a.score);
    return scoredPools[0].pool;
  }

  private estimateComplexity(taskData: any): number {
    // Estimate based on task parameters
    let complexity = 0.5; // baseline
    
    if (taskData.codeGeneration) complexity += 0.2;
    if (taskData.researchDepth > 3) complexity += 0.15;
    if (taskData.parallelTasks > 5) complexity += 0.15;
    
    return Math.min(complexity, 1.0);
  }
}
\`\`\``
  },
  {
    id: 'prometheus-monitoring',
    title: 'Prometheus Monitoring Setup',
    content: `# Monitoring Claude Flow with Prometheus

## Metrics Implementation

### Custom Metrics Collection

\`\`\`typescript
// src/monitoring/metrics.ts
import { register, Counter, Histogram, Gauge } from 'prom-client';

export class ClaudeFlowMetrics {
  // Agent metrics
  private agentTasksTotal = new Counter({
    name: 'claude_flow_agent_tasks_total',
    help: 'Total number of tasks processed by agents',
    labelNames: ['agent_type', 'task_type', 'status']
  });

  private agentTaskDuration = new Histogram({
    name: 'claude_flow_agent_task_duration_seconds',
    help: 'Duration of agent task execution',
    labelNames: ['agent_type', 'task_type'],
    buckets: [0.1, 0.5, 1, 5, 10, 30, 60, 120, 300]
  });

  private activeAgents = new Gauge({
    name: 'claude_flow_active_agents',
    help: 'Number of currently active agents',
    labelNames: ['agent_type']
  });

  // Swarm metrics
  private swarmSize = new Gauge({
    name: 'claude_flow_swarm_size',
    help: 'Current size of agent swarm',
    labelNames: ['swarm_id', 'strategy']
  });

  private swarmEfficiency = new Gauge({
    name: 'claude_flow_swarm_efficiency',
    help: 'Swarm task completion efficiency',
    labelNames: ['swarm_id']
  });

  // Resource metrics
  private memoryUsage = new Gauge({
    name: 'claude_flow_memory_usage_bytes',
    help: 'Memory usage by component',
    labelNames: ['component']
  });

  private apiCalls = new Counter({
    name: 'claude_flow_api_calls_total',
    help: 'Total API calls to Claude',
    labelNames: ['model', 'status']
  });

  recordTaskStart(agentType: string, taskType: string): () => void {
    const timer = this.agentTaskDuration.startTimer({
      agent_type: agentType,
      task_type: taskType
    });

    return () => {
      timer();
      this.agentTasksTotal.inc({
        agent_type: agentType,
        task_type: taskType,
        status: 'completed'
      });
    };
  }

  updateSwarmMetrics(swarmId: string, data: any) {
    this.swarmSize.set(
      { swarm_id: swarmId, strategy: data.strategy },
      data.agentCount
    );
    
    this.swarmEfficiency.set(
      { swarm_id: swarmId },
      data.completedTasks / data.totalTasks
    );
  }

  getMetrics(): string {
    return register.metrics();
  }
}
\`\`\`

## Prometheus Configuration

\`\`\`yaml
# prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: claude-flow
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s

    scrape_configs:
    - job_name: 'claude-flow-pods'
      kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
          - claude-flow
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?::\\d+)?;(\\d+)
        replacement: $1:$2
        target_label: __address__

    - job_name: 'kubernetes-nodes'
      kubernetes_sd_configs:
      - role: node
      relabel_configs:
      - action: labelmap
        regex: __meta_kubernetes_node_label_(.+)

---
# prometheus-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
  namespace: claude-flow
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      serviceAccountName: prometheus
      containers:
      - name: prometheus
        image: prom/prometheus:latest
        args:
          - '--config.file=/etc/prometheus/prometheus.yml'
          - '--storage.tsdb.path=/prometheus/'
          - '--web.console.libraries=/etc/prometheus/console_libraries'
          - '--web.console.templates=/etc/prometheus/consoles'
          - '--storage.tsdb.retention.time=30d'
        ports:
        - containerPort: 9090
        volumeMounts:
        - name: prometheus-config-volume
          mountPath: /etc/prometheus/
        - name: prometheus-storage-volume
          mountPath: /prometheus/
        resources:
          requests:
            cpu: 500m
            memory: 500Mi
          limits:
            cpu: 1
            memory: 1Gi
      volumes:
      - name: prometheus-config-volume
        configMap:
          defaultMode: 420
          name: prometheus-config
      - name: prometheus-storage-volume
        persistentVolumeClaim:
          claimName: prometheus-pvc
\`\`\`

## Grafana Dashboards

\`\`\`json
{
  "dashboard": {
    "title": "Claude Flow Production Metrics",
    "panels": [
      {
        "title": "Active Agents by Type",
        "targets": [
          {
            "expr": "sum by (agent_type) (claude_flow_active_agents)"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Task Processing Rate",
        "targets": [
          {
            "expr": "rate(claude_flow_agent_tasks_total[5m])"
          }
        ],
        "type": "graph"
      },
      {
        "title": "API Call Success Rate",
        "targets": [
          {
            "expr": "rate(claude_flow_api_calls_total{status='success'}[5m]) / rate(claude_flow_api_calls_total[5m])"
          }
        ],
        "type": "stat"
      }
    ]
  }
}
\`\`\``
  },
  {
    id: 'cost-optimization',
    title: 'Cost Optimization Strategies',
    content: `# Cost Optimization for AI Deployments

## Resource Optimization

### Dynamic Scaling Configuration

\`\`\`typescript
// src/optimization/cost-manager.ts
interface CostProfile {
  agentType: string;
  cpuCost: number;
  memoryCost: number;
  apiCost: number;
  optimalBatchSize: number;
}

export class CostOptimizer {
  private costProfiles: Map<string, CostProfile> = new Map();
  private budgetLimit: number;
  private currentSpend: number = 0;

  async optimizeDeployment() {
    const metrics = await this.collectMetrics();
    const recommendations = [];

    // Analyze agent utilization
    for (const [agentType, utilization] of metrics.utilization) {
      if (utilization < 0.3) {
        recommendations.push({
          action: 'scale_down',
          target: agentType,
          reason: 'Low utilization',
          savings: this.calculateSavings(agentType, 'scale_down')
        });
      }
    }

    // Optimize batch processing
    const batchOpportunities = this.identifyBatchOpportunities(metrics);
    for (const opportunity of batchOpportunities) {
      recommendations.push({
        action: 'batch_tasks',
        target: opportunity.taskType,
        batchSize: opportunity.optimalSize,
        savings: opportunity.estimatedSavings
      });
    }

    return recommendations;
  }

  private identifyBatchOpportunities(metrics: any) {
    const opportunities = [];
    
    // Group similar tasks that arrive within time windows
    const taskPatterns = this.analyzeTaskPatterns(metrics.tasks);
    
    for (const pattern of taskPatterns) {
      if (pattern.frequency > 10 && pattern.similarity > 0.8) {
        opportunities.push({
          taskType: pattern.type,
          optimalSize: Math.min(pattern.avgBurst, 50),
          estimatedSavings: this.estimateBatchSavings(pattern)
        });
      }
    }
    
    return opportunities;
  }
}
\`\`\`

### Spot Instance Management

\`\`\`yaml
# spot-instance-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: spot-instance-config
  namespace: claude-flow
data:
  config.yaml: |
    spotAllocation:
      enabled: true
      maxSpotPercentage: 70
      fallbackToOnDemand: true
      
    nodeGroups:
      - name: agent-workers-spot
        instanceTypes:
          - t3.medium
          - t3a.medium
          - t2.medium
        spotBidPrice: 0.0464  # 70% of on-demand
        labels:
          workload-type: batch
          instance-type: spot
        taints:
          - key: spot-instance
            value: "true"
            effect: NoSchedule
            
      - name: agent-workers-ondemand
        instanceTypes:
          - t3.medium
        minSize: 2
        maxSize: 10
        labels:
          workload-type: batch
          instance-type: on-demand

---
# Spot-tolerant deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: batch-processor-spot
  namespace: claude-flow
spec:
  replicas: 20
  selector:
    matchLabels:
      app: batch-processor
  template:
    metadata:
      labels:
        app: batch-processor
    spec:
      tolerations:
      - key: spot-instance
        operator: Equal
        value: "true"
        effect: NoSchedule
      nodeSelector:
        instance-type: spot
      containers:
      - name: processor
        image: your-registry/batch-processor:latest
        env:
        - name: GRACEFUL_SHUTDOWN_TIMEOUT
          value: "30"
        lifecycle:
          preStop:
            exec:
              command: ["/bin/sh", "-c", "sleep 15"]
\`\`\`

## Budget Controls

\`\`\`typescript
// src/optimization/budget-controller.ts
export class BudgetController {
  private dailyLimit: number;
  private hourlyLimit: number;
  private alertThresholds = [0.7, 0.9, 0.95];

  async enforcebudgets() {
    const currentUsage = await this.getCurrentUsage();
    
    // Check against limits
    if (currentUsage.hourly > this.hourlyLimit * 0.95) {
      await this.throttleExpensiveOperations();
    }
    
    if (currentUsage.daily > this.dailyLimit * 0.9) {
      await this.switchToEconomyMode();
    }
  }

  private async switchToEconomyMode() {
    // Use smaller models
    await this.updateConfig({
      defaultModel: 'claude-3-haiku',
      maxTokens: 1000,
      batchingEnabled: true,
      minBatchSize: 5
    });

    // Scale down non-critical services
    await this.scaleDeployment('researcher-pool', 2);
    await this.scaleDeployment('analyzer-pool', 1);
  }
}
\`\`\``
  }
];

// Combine all section contents into a single content string
const combinedContent = sections.map(section => section.content).join('\n\n---\n\n');

export const lesson: Lesson = {
  id: 'claude-flow-prod-deployment',
  title: 'Production Claude Flow Deployment',
  duration: '90 minuten',
  content: combinedContent,
  codeExamples: [
    {
      id: 'k8s-deployment-example',
      title: 'Complete Kubernetes Deployment',
      language: 'yaml',
      code: `# Complete deployment for Claude Flow
apiVersion: apps/v1
kind: Deployment
metadata:
  name: claude-flow-orchestrator
  namespace: claude-flow
spec:
  replicas: 3
  selector:
    matchLabels:
      app: claude-flow
      component: orchestrator
  template:
    metadata:
      labels:
        app: claude-flow
        component: orchestrator
    spec:
      containers:
      - name: orchestrator
        image: claude-flow:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: production
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"`,
      explanation: 'Complete deployment configuration for Claude Flow orchestrator with resource limits and environment configuration'
    },
    {
      id: 'monitoring-setup',
      title: 'Prometheus Monitoring Setup',
      language: 'typescript',
      code: `import { Counter, Histogram, register } from 'prom-client';

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const agentTaskCounter = new Counter({
  name: 'agent_tasks_total',
  help: 'Total number of agent tasks',
  labelNames: ['agent_type', 'status']
});

// Middleware to track HTTP metrics
export const metricsMiddleware = (req, res, next) => {
  const timer = httpRequestDuration.startTimer();
  
  res.on('finish', () => {
    timer({ 
      method: req.method, 
      route: req.route?.path || 'unknown',
      status_code: res.statusCode 
    });
  });
  
  next();
};`,
      explanation: 'Basic Prometheus metrics setup for monitoring Claude Flow agents and HTTP requests'
    }
  ],
  assignments: [
    {
      id: 'k8s-setup',
      title: 'Kubernetes Setup Exercise',
      description: 'Deploy a basic Claude Flow setup to Kubernetes',
      type: 'project',
      difficulty: 'hard',
      checklist: [
        'Create namespace and RBAC configurations',
        'Deploy orchestrator with 2 replicas',
        'Configure HPA for agent pool',
        'Verify all pods are running'
      ],
      hints: [
        'Check pod logs with kubectl logs',
        'Use kubectl describe for debugging',
        'Ensure secrets are created first'
      ]
    },
    {
      id: 'cost-optimization',
      title: 'Implement Cost Controls',
      description: 'Set up cost optimization for your deployment',
      type: 'project',
      difficulty: 'hard',
      checklist: [
        'Configure spot instances for batch workloads',
        'Implement budget monitoring',
        'Set up automatic scaling based on cost',
        'Create cost allocation tags'
      ],
      hints: [
        'Use node affinity for spot instances',
        'Implement graceful shutdown for spot termination',
        'Monitor spot instance interruption rates'
      ]
    }
  ],
  resources: [
    {
      title: 'Kubernetes Documentation',
      url: 'https://kubernetes.io/docs/',
      type: 'documentation'
    },
    {
      title: 'Prometheus Operator',
      url: 'https://prometheus-operator.dev/',
      type: 'tool'
    },
    {
      title: 'Cost Optimization Guide',
      url: 'https://cloud.google.com/kubernetes-engine/docs/how-to/cost-optimization',
      type: 'guide'
    }
  ]
};