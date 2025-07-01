import type { Lesson } from '$lib/types/course';

export const lesson: Lesson = {
  id: 'crewai-prod-scaling',
  title: 'CrewAI Production Scaling',
  description: 'Scale CrewAI agent teams to production with Docker, orchestration, and performance optimization',
  duration: 90,
  objectives: [
    'Containerize CrewAI applications with Docker',
    'Implement agent orchestration strategies',
    'Monitor performance metrics in production',
    'Apply Dutch enterprise scaling patterns'
  ],
  sections: [
    {
      id: 'docker-containerization',
      title: 'Docker Containerization for CrewAI',
      content: `# Docker Containerization for CrewAI

## Building Production-Ready Containers

### Multi-Stage Dockerfile

\`\`\`dockerfile
# Dockerfile
FROM python:3.11-slim AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \\
    build-essential \\
    git \\
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \\
    pip install --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.11-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Create non-root user
RUN useradd -m -u 1000 crewai
USER crewai
WORKDIR /home/crewai/app

# Copy application code
COPY --chown=crewai:crewai . .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \\
  CMD curl -f http://localhost:8000/health || exit 1

# Start CrewAI application
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
\`\`\`

### Docker Compose for Development

\`\`\`yaml
# docker-compose.yml
version: '3.8'

services:
  crewai-api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=\${OPENAI_API_KEY}
      - REDIS_URL=redis://redis:6379
      - POSTGRES_URL=postgresql://crewai:password@postgres:5432/crewai
    depends_on:
      - redis
      - postgres
    volumes:
      - ./logs:/home/crewai/app/logs
    networks:
      - crewai-network

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    networks:
      - crewai-network

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=crewai
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=crewai
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - crewai-network

  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - crewai-network

  grafana:
    image: grafana/grafana:latest
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana
    ports:
      - "3000:3000"
    networks:
      - crewai-network

networks:
  crewai-network:
    driver: bridge

volumes:
  redis-data:
  postgres-data:
  prometheus-data:
  grafana-data:
\`\`\`

## Container Optimization

### Minimal Base Images

\`\`\`dockerfile
# Optimized Dockerfile with distroless
FROM python:3.11-slim AS builder

# Build stage remains the same
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt --target /app

# Use distroless for production
FROM gcr.io/distroless/python3-debian11
COPY --from=builder /app /app
WORKDIR /app
COPY . .

ENV PYTHONPATH=/app
ENTRYPOINT ["python", "main.py"]
\`\`\``,
      exercises: []
    },
    {
      id: 'agent-orchestration',
      title: 'Agent Orchestration Strategies',
      content: `# Agent Orchestration for CrewAI

## Kubernetes Deployment

### CrewAI Agent Deployment

\`\`\`yaml
# crewai-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: crewai-agents
  namespace: production
spec:
  replicas: 5
  selector:
    matchLabels:
      app: crewai
  template:
    metadata:
      labels:
        app: crewai
        version: v1
    spec:
      containers:
      - name: crewai-agent
        image: your-registry/crewai:latest
        ports:
        - containerPort: 8000
        env:
        - name: AGENT_ROLE
          value: "researcher"
        - name: MAX_CONCURRENT_TASKS
          value: "10"
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: crewai-secrets
              key: openai-api-key
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: crewai-service
  namespace: production
spec:
  selector:
    app: crewai
  ports:
  - port: 80
    targetPort: 8000
  type: ClusterIP
\`\`\`

## Load Balancing Strategies

### Agent Pool Management

\`\`\`python
# agent_orchestrator.py
from typing import List, Dict, Optional
import asyncio
from dataclasses import dataclass
from datetime import datetime
import redis
import json

@dataclass
class AgentInstance:
    id: str
    role: str
    endpoint: str
    current_load: int
    max_capacity: int
    last_heartbeat: datetime
    specializations: List[str]

class CrewAIOrchestrator:
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
        self.agents: Dict[str, AgentInstance] = {}
        self.task_queue = asyncio.Queue()
        
    async def register_agent(self, agent: AgentInstance):
        """Register a new agent with the orchestrator"""
        self.agents[agent.id] = agent
        await self.redis.hset(
            "crewai:agents",
            agent.id,
            json.dumps({
                "role": agent.role,
                "endpoint": agent.endpoint,
                "capacity": agent.max_capacity,
                "specializations": agent.specializations
            })
        )
        
    async def assign_task(self, task: Dict) -> Optional[AgentInstance]:
        """Assign task to the most suitable available agent"""
        suitable_agents = self.find_suitable_agents(task)
        
        if not suitable_agents:
            await self.task_queue.put(task)
            return None
            
        # Select agent with lowest load
        selected_agent = min(
            suitable_agents,
            key=lambda a: a.current_load / a.max_capacity
        )
        
        # Update agent load
        selected_agent.current_load += 1
        await self.update_agent_metrics(selected_agent)
        
        return selected_agent
    
    def find_suitable_agents(self, task: Dict) -> List[AgentInstance]:
        """Find agents capable of handling the task"""
        task_type = task.get("type", "general")
        required_skills = task.get("required_skills", [])
        
        suitable_agents = []
        for agent in self.agents.values():
            # Check if agent is healthy
            if not self.is_agent_healthy(agent):
                continue
                
            # Check capacity
            if agent.current_load >= agent.max_capacity:
                continue
                
            # Check specializations
            if required_skills:
                if not all(skill in agent.specializations for skill in required_skills):
                    continue
                    
            suitable_agents.append(agent)
            
        return suitable_agents
    
    def is_agent_healthy(self, agent: AgentInstance) -> bool:
        """Check if agent is responding and healthy"""
        time_since_heartbeat = datetime.now() - agent.last_heartbeat
        return time_since_heartbeat.total_seconds() < 60
        
    async def update_agent_metrics(self, agent: AgentInstance):
        """Update agent metrics in Redis"""
        await self.redis.hset(
            f"crewai:metrics:{agent.id}",
            mapping={
                "current_load": agent.current_load,
                "utilization": agent.current_load / agent.max_capacity,
                "last_update": datetime.now().isoformat()
            }
        )

# Celery task distribution
from celery import Celery
from celery.result import AsyncResult

app = Celery('crewai', broker='redis://localhost:6379')

@app.task(bind=True)
def execute_agent_task(self, task_data: Dict):
    """Execute task on assigned agent"""
    try:
        # Get assigned agent
        agent_id = task_data['assigned_agent']
        agent = get_agent_instance(agent_id)
        
        # Execute task
        result = agent.execute(task_data)
        
        # Update metrics
        update_task_metrics(task_data['id'], 'completed')
        
        return result
    except Exception as e:
        # Retry with backoff
        raise self.retry(exc=e, countdown=60)
\`\`\`

## Dutch Enterprise Integration

### ASML Production Pattern

\`\`\`python
# asml_pattern.py
"""
Production pattern inspired by ASML's semiconductor manufacturing
Applies precision and redundancy principles to AI agent orchestration
"""

class ASMLProductionPattern:
    def __init__(self):
        self.primary_agents = []
        self.backup_agents = []
        self.quality_threshold = 0.99
        
    async def execute_with_redundancy(self, task):
        """Execute task with ASML-style redundancy"""
        # Primary execution
        primary_result = await self.execute_primary(task)
        
        # Parallel verification
        verification_result = await self.execute_verification(task)
        
        # Quality check
        if self.quality_score(primary_result, verification_result) < self.quality_threshold:
            # Failover to backup agents
            return await self.execute_backup(task)
            
        return primary_result
    
    async def execute_primary(self, task):
        """Execute on primary agent pool"""
        agent = self.select_primary_agent(task)
        return await agent.execute(task)
        
    async def execute_verification(self, task):
        """Verify results with secondary agent"""
        agent = self.select_verification_agent(task)
        return await agent.verify(task)
        
    def quality_score(self, primary, verification):
        """Calculate quality score based on agreement"""
        # Implementation specific to use case
        return calculate_agreement_score(primary, verification)
\`\`\``,
      exercises: [
        {
          id: 'orchestration-setup',
          title: 'Set Up Agent Orchestration',
          description: 'Implement a basic orchestration system for CrewAI agents',
          type: 'coding',
          difficulty: 'intermediate',
          estimatedTime: 30,
          instructions: [
            'Create agent registration system',
            'Implement load balancing logic',
            'Add health checking',
            'Test with multiple agents'
          ],
          hints: [
            'Use Redis for state management',
            'Implement circuit breakers',
            'Monitor agent performance'
          ]
        }
      ]
    },
    {
      id: 'performance-metrics',
      title: 'Performance Metrics and Monitoring',
      content: `# Performance Monitoring for CrewAI

## Metrics Collection

### Custom Metrics Implementation

\`\`\`python
# metrics.py
from prometheus_client import Counter, Histogram, Gauge, Info
from functools import wraps
import time
from typing import Callable

# Define metrics
task_counter = Counter(
    'crewai_tasks_total',
    'Total number of tasks processed',
    ['agent_role', 'task_type', 'status']
)

task_duration = Histogram(
    'crewai_task_duration_seconds',
    'Task execution duration',
    ['agent_role', 'task_type'],
    buckets=[0.1, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0, 60.0]
)

active_agents = Gauge(
    'crewai_active_agents',
    'Number of active agents',
    ['role']
)

agent_utilization = Gauge(
    'crewai_agent_utilization_ratio',
    'Agent utilization percentage',
    ['agent_id', 'role']
)

llm_tokens_used = Counter(
    'crewai_llm_tokens_total',
    'Total LLM tokens consumed',
    ['model', 'agent_role']
)

agent_info = Info(
    'crewai_agent',
    'Agent information'
)

def track_performance(task_type: str):
    """Decorator to track task performance"""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(self, *args, **kwargs):
            start_time = time.time()
            
            # Increment active tasks
            task_counter.labels(
                agent_role=self.role,
                task_type=task_type,
                status='started'
            ).inc()
            
            try:
                result = await func(self, *args, **kwargs)
                
                # Record success
                task_counter.labels(
                    agent_role=self.role,
                    task_type=task_type,
                    status='completed'
                ).inc()
                
                return result
                
            except Exception as e:
                # Record failure
                task_counter.labels(
                    agent_role=self.role,
                    task_type=task_type,
                    status='failed'
                ).inc()
                raise e
                
            finally:
                # Record duration
                duration = time.time() - start_time
                task_duration.labels(
                    agent_role=self.role,
                    task_type=task_type
                ).observe(duration)
                
        return wrapper
    return decorator

class MonitoredAgent:
    """Base class for monitored CrewAI agents"""
    
    def __init__(self, role: str, agent_id: str):
        self.role = role
        self.agent_id = agent_id
        self.current_tasks = 0
        self.max_tasks = 10
        
        # Register agent
        active_agents.labels(role=role).inc()
        agent_info.info({
            'agent_id': agent_id,
            'role': role,
            'version': '1.0.0'
        })
        
    @track_performance('research')
    async def research_task(self, query: str):
        """Execute research task with monitoring"""
        self.current_tasks += 1
        self.update_utilization()
        
        try:
            # Actual research logic here
            result = await self.perform_research(query)
            
            # Track token usage
            tokens_used = self.count_tokens(result)
            llm_tokens_used.labels(
                model='gpt-4',
                agent_role=self.role
            ).inc(tokens_used)
            
            return result
            
        finally:
            self.current_tasks -= 1
            self.update_utilization()
            
    def update_utilization(self):
        """Update agent utilization metrics"""
        utilization = self.current_tasks / self.max_tasks
        agent_utilization.labels(
            agent_id=self.agent_id,
            role=self.role
        ).set(utilization)
\`\`\`

## Grafana Dashboard Configuration

### Production Dashboard

\`\`\`json
{
  "dashboard": {
    "title": "CrewAI Production Metrics",
    "panels": [
      {
        "title": "Task Processing Rate",
        "targets": [
          {
            "expr": "rate(crewai_tasks_total{status='completed'}[5m])",
            "legendFormat": "{{agent_role}} - {{task_type}}"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Task Duration P95",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(crewai_task_duration_seconds_bucket[5m]))",
            "legendFormat": "{{agent_role}}"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Agent Utilization",
        "targets": [
          {
            "expr": "crewai_agent_utilization_ratio",
            "legendFormat": "{{agent_id}}"
          }
        ],
        "type": "heatmap"
      },
      {
        "title": "LLM Token Usage",
        "targets": [
          {
            "expr": "rate(crewai_llm_tokens_total[1h])",
            "legendFormat": "{{model}} - {{agent_role}}"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(crewai_tasks_total{status='failed'}[5m]) / rate(crewai_tasks_total[5m])",
            "legendFormat": "{{agent_role}}"
          }
        ],
        "type": "graph"
      }
    ]
  }
}
\`\`\`

## Performance Optimization

### Caching Strategy

\`\`\`python
# caching.py
import hashlib
import json
from typing import Any, Optional
import redis
from datetime import timedelta

class CrewAICache:
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
        self.default_ttl = timedelta(hours=1)
        
    def generate_key(self, agent_role: str, task_type: str, params: Dict) -> str:
        """Generate cache key based on task parameters"""
        key_data = {
            "role": agent_role,
            "type": task_type,
            "params": params
        }
        key_str = json.dumps(key_data, sort_keys=True)
        return f"crewai:cache:{hashlib.md5(key_str.encode()).hexdigest()}"
        
    async def get(self, key: str) -> Optional[Any]:
        """Get cached result"""
        result = await self.redis.get(key)
        if result:
            return json.loads(result)
        return None
        
    async def set(self, key: str, value: Any, ttl: Optional[timedelta] = None):
        """Cache result with TTL"""
        ttl = ttl or self.default_ttl
        await self.redis.setex(
            key,
            ttl,
            json.dumps(value)
        )
        
    def cached_task(self, task_type: str, ttl: Optional[timedelta] = None):
        """Decorator for caching task results"""
        def decorator(func):
            async def wrapper(self, *args, **kwargs):
                # Generate cache key
                cache_key = self.generate_key(
                    self.role,
                    task_type,
                    {"args": args, "kwargs": kwargs}
                )
                
                # Check cache
                cached_result = await self.cache.get(cache_key)
                if cached_result:
                    return cached_result
                    
                # Execute task
                result = await func(self, *args, **kwargs)
                
                # Cache result
                await self.cache.set(cache_key, result, ttl)
                
                return result
            return wrapper
        return decorator
\`\`\``,
      exercises: []
    },
    {
      id: 'dutch-enterprise-patterns',
      title: 'Dutch Enterprise Scaling Examples',
      content: `# Dutch Enterprise Scaling Patterns

## ING Bank Pattern: Financial Agent Teams

\`\`\`python
# ing_pattern.py
"""
ING's approach to scaling AI agents for financial analysis
Emphasizes compliance, auditability, and risk management
"""

class INGFinancialAgentPattern:
    def __init__(self):
        self.compliance_checker = ComplianceAgent()
        self.risk_analyzer = RiskAgent()
        self.market_researcher = MarketAgent()
        
    async def analyze_transaction(self, transaction_data):
        """Multi-agent transaction analysis with ING patterns"""
        
        # Parallel analysis with timeout
        tasks = [
            self.compliance_checker.check(transaction_data),
            self.risk_analyzer.assess_risk(transaction_data),
            self.market_researcher.analyze_context(transaction_data)
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Aggregate results with compliance priority
        if results[0].compliance_status == "BLOCKED":
            return {
                "status": "rejected",
                "reason": "compliance_violation",
                "details": results[0].details
            }
            
        return {
            "status": "approved",
            "risk_score": results[1].score,
            "market_context": results[2].context,
            "timestamp": datetime.now().isoformat()
        }

# Deployment configuration for ING pattern
ing_deployment_config = {
    "agents": {
        "compliance": {
            "replicas": 3,
            "resources": {
                "memory": "2Gi",
                "cpu": "1000m"
            },
            "env": {
                "COMPLIANCE_DB": "postgresql://compliance-db:5432",
                "AUDIT_ENABLED": "true"
            }
        },
        "risk": {
            "replicas": 5,
            "resources": {
                "memory": "4Gi",
                "cpu": "2000m"
            },
            "env": {
                "RISK_MODEL": "advanced_v2",
                "CACHE_TTL": "300"
            }
        },
        "market": {
            "replicas": 2,
            "resources": {
                "memory": "1Gi",
                "cpu": "500m"
            }
        }
    }
}
\`\`\`

## Philips HealthTech Pattern

\`\`\`python
# philips_pattern.py
"""
Philips' approach to scaling AI agents for healthcare
Focus on reliability, privacy, and medical compliance
"""

class PhilipsHealthAgentPattern:
    def __init__(self):
        self.diagnostic_agents = []
        self.privacy_guardian = PrivacyAgent()
        self.medical_validator = MedicalValidationAgent()
        
    async def process_medical_data(self, patient_data):
        """Process medical data with Philips patterns"""
        
        # Privacy check first
        anonymized_data = await self.privacy_guardian.anonymize(patient_data)
        
        # Distributed diagnosis with consensus
        diagnoses = await self.distributed_diagnosis(anonymized_data)
        
        # Medical validation
        validated_result = await self.medical_validator.validate(diagnoses)
        
        return {
            "diagnosis": validated_result.consensus_diagnosis,
            "confidence": validated_result.confidence_score,
            "recommendations": validated_result.recommendations,
            "privacy_preserved": True
        }
        
    async def distributed_diagnosis(self, data):
        """Run diagnosis across multiple specialized agents"""
        tasks = []
        for agent in self.diagnostic_agents:
            tasks.append(agent.diagnose(data))
            
        results = await asyncio.gather(*tasks)
        
        # Consensus algorithm
        return self.calculate_consensus(results)

# Kubernetes deployment for Philips pattern
philips_k8s_config = """
apiVersion: v1
kind: ConfigMap
metadata:
  name: philips-health-config
data:
  privacy_config.yaml: |
    anonymization:
      method: "differential_privacy"
      epsilon: 1.0
    data_retention:
      medical_data: "7_years"
      diagnostic_logs: "30_days"
    compliance:
      standards: ["HIPAA", "GDPR", "MDR"]
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: diagnostic-agents
spec:
  serviceName: diagnostic
  replicas: 3
  template:
    spec:
      containers:
      - name: diagnostic-agent
        image: philips/diagnostic-agent:latest
        env:
        - name: PRIVACY_MODE
          value: "strict"
        - name: MEDICAL_DB
          value: "encrypted-medical-store"
        volumeMounts:
        - name: medical-certs
          mountPath: /certs
          readOnly: true
"""
\`\`\`

## Port of Rotterdam Pattern

\`\`\`python
# rotterdam_pattern.py
"""
Port of Rotterdam's approach to scaling logistics AI
Emphasizes real-time processing and IoT integration
"""

class RotterdamLogisticsPattern:
    def __init__(self):
        self.vessel_tracker = VesselTrackingAgent()
        self.cargo_optimizer = CargoOptimizationAgent()
        self.weather_monitor = WeatherAgent()
        self.port_scheduler = SchedulingAgent()
        
    async def optimize_port_operations(self):
        """Real-time port optimization with Rotterdam patterns"""
        
        # Continuous monitoring loop
        while True:
            # Gather real-time data
            vessel_positions = await self.vessel_tracker.get_positions()
            weather_conditions = await self.weather_monitor.get_forecast()
            port_capacity = await self.get_current_capacity()
            
            # Optimize scheduling
            schedule = await self.port_scheduler.optimize(
                vessels=vessel_positions,
                weather=weather_conditions,
                capacity=port_capacity
            )
            
            # Execute optimizations
            await self.execute_schedule(schedule)
            
            # Sleep for next iteration
            await asyncio.sleep(60)  # 1-minute intervals

# High-performance deployment
rotterdam_deployment = """
apiVersion: v1
kind: Service
metadata:
  name: rotterdam-logistics
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 8080
  selector:
    app: logistics-optimizer
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: logistics-optimizer
spec:
  replicas: 10
  template:
    spec:
      nodeSelector:
        workload: high-performance
      containers:
      - name: optimizer
        image: rotterdam/logistics-ai:latest
        resources:
          requests:
            memory: "8Gi"
            cpu: "4000m"
            nvidia.com/gpu: "1"  # GPU for ML models
          limits:
            memory: "16Gi"
            cpu: "8000m"
            nvidia.com/gpu: "1"
        env:
        - name: KAFKA_BROKERS
          value: "kafka-cluster:9092"
        - name: IOT_ENDPOINT
          value: "wss://iot.portofrotterdam.com"
"""
\`\`\``,
      exercises: [
        {
          id: 'enterprise-pattern',
          title: 'Implement Enterprise Pattern',
          description: 'Create a production-ready agent system using Dutch enterprise patterns',
          type: 'project',
          difficulty: 'advanced',
          estimatedTime: 60,
          instructions: [
            'Choose an enterprise pattern (ING, Philips, or Rotterdam)',
            'Implement the core agent structure',
            'Add monitoring and compliance features',
            'Create deployment configuration'
          ],
          hints: [
            'Focus on the specific requirements of the industry',
            'Consider compliance and regulatory needs',
            'Implement proper error handling and recovery'
          ]
        }
      ]
    }
  ],
  resources: [
    {
      title: 'Docker Best Practices',
      url: 'https://docs.docker.com/develop/dev-best-practices/',
      type: 'documentation'
    },
    {
      title: 'Kubernetes Production Checklist',
      url: 'https://kubernetes.io/docs/setup/production-environment/',
      type: 'guide'
    },
    {
      title: 'Dutch AI Strategy',
      url: 'https://www.government.nl/topics/artificial-intelligence',
      type: 'reference'
    }
  ]
};