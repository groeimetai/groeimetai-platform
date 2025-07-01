import { Lesson } from '@/lib/data/courses';

const lesson: Lesson = {
  id: 'lesson-4-4',
  title: 'Deployment en monitoring: Autonomous teams in productie',
  duration: '45 minuten',
  content: `
# Autonomous Teams in Productie

Deze les behandelt alle aspecten van het deployen en managen van AI marketing teams in productie-omgevingen, inclusief monitoring, scaling, en continuous improvement.

## Production Deployment Architecture

### 1. Deployment Infrastructure

\`\`\`python
from crewai import Agent, Task, Crew
from crewai.tools import tool
import json
import logging
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from dataclasses import dataclass, field
import redis
import psycopg2
from prometheus_client import Counter, Histogram, Gauge, start_http_server
import sentry_sdk
from opentelemetry import trace
from opentelemetry.exporter.jaeger import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
import docker
from kubernetes import client, config
import yaml

# Production configuration
@dataclass
class ProductionConfig:
    """Production deployment configuration"""
    environment: str = "production"
    redis_host: str = "redis.production.local"
    postgres_host: str = "postgres.production.local"
    sentry_dsn: str = "https://your-sentry-dsn@sentry.io/project-id"
    jaeger_endpoint: str = "http://jaeger.production.local:14268/api/traces"
    prometheus_port: int = 8000
    max_concurrent_crews: int = 10
    crew_timeout_seconds: int = 3600
    retry_max_attempts: int = 3
    health_check_interval: int = 60
    
    # Scaling configuration
    min_agents_per_crew: int = 3
    max_agents_per_crew: int = 20
    auto_scale_enabled: bool = True
    scale_up_threshold: float = 0.8  # CPU/Memory usage
    scale_down_threshold: float = 0.3

class ProductionDeploymentSystem:
    """Complete production deployment system for AI teams"""
    
    def __init__(self, config: ProductionConfig):
        self.config = config
        
        # Initialize monitoring
        self._init_monitoring()
        
        # Initialize data stores
        self._init_data_stores()
        
        # Initialize container orchestration
        self._init_orchestration()
        
        # Metrics
        self.crew_executions = Counter('crew_executions_total', 'Total crew executions', ['crew_type', 'status'])
        self.crew_duration = Histogram('crew_execution_duration_seconds', 'Crew execution duration', ['crew_type'])
        self.active_agents = Gauge('active_agents', 'Number of active agents', ['agent_role'])
        self.error_rate = Counter('crew_errors_total', 'Total crew errors', ['crew_type', 'error_type'])
    
    def _init_monitoring(self):
        """Initialize monitoring systems"""
        # Sentry for error tracking
        sentry_sdk.init(
            dsn=self.config.sentry_dsn,
            environment=self.config.environment,
            traces_sample_rate=0.1
        )
        
        # OpenTelemetry for distributed tracing
        trace.set_tracer_provider(TracerProvider())
        tracer_provider = trace.get_tracer_provider()
        
        jaeger_exporter = JaegerExporter(
            agent_host_name=self.config.jaeger_endpoint.split(':')[0],
            agent_port=6831,
        )
        
        span_processor = BatchSpanProcessor(jaeger_exporter)
        tracer_provider.add_span_processor(span_processor)
        
        self.tracer = trace.get_tracer(__name__)
        
        # Prometheus metrics server
        start_http_server(self.config.prometheus_port)
        
        # Custom logging
        self.logger = self._setup_structured_logging()
    
    def _setup_structured_logging(self):
        """Setup structured logging for production"""
        logger = logging.getLogger('marketing_crew')
        logger.setLevel(logging.INFO)
        
        # JSON formatter for log aggregation
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '{"time": "%(asctime)s", "level": "%(levelname)s", "service": "marketing-crew", '
            '"message": "%(message)s", "extra": %(extra)s}'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
        return logger
    
    def _init_data_stores(self):
        """Initialize production data stores"""
        # Redis for caching and job queue
        self.redis_client = redis.Redis(
            host=self.config.redis_host,
            port=6379,
            decode_responses=True,
            health_check_interval=30
        )
        
        # PostgreSQL for persistent storage
        self.postgres_conn = psycopg2.connect(
            host=self.config.postgres_host,
            database="marketing_crews",
            user="crew_user",
            password="secure_password"
        )
        
        # Create tables if not exist
        self._init_database_schema()
    
    def _init_database_schema(self):
        """Initialize database schema"""
        with self.postgres_conn.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS crew_executions (
                    id SERIAL PRIMARY KEY,
                    crew_id VARCHAR(255) UNIQUE NOT NULL,
                    crew_type VARCHAR(100) NOT NULL,
                    status VARCHAR(50) NOT NULL,
                    started_at TIMESTAMP NOT NULL,
                    completed_at TIMESTAMP,
                    input_data JSONB,
                    output_data JSONB,
                    error_data JSONB,
                    metrics JSONB,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS agent_activities (
                    id SERIAL PRIMARY KEY,
                    crew_id VARCHAR(255) NOT NULL,
                    agent_role VARCHAR(100) NOT NULL,
                    task_description TEXT,
                    status VARCHAR(50) NOT NULL,
                    started_at TIMESTAMP NOT NULL,
                    completed_at TIMESTAMP,
                    output_summary TEXT,
                    tokens_used INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (crew_id) REFERENCES crew_executions(crew_id)
                );
                
                CREATE INDEX IF NOT EXISTS idx_crew_status ON crew_executions(status);
                CREATE INDEX IF NOT EXISTS idx_crew_type ON crew_executions(crew_type);
                CREATE INDEX IF NOT EXISTS idx_agent_role ON agent_activities(agent_role);
            """)
            self.postgres_conn.commit()
\`\`\`

### 2. Crew Deployment Manager

\`\`\`python
class CrewDeploymentManager:
    """Manages crew deployments in production"""
    
    def __init__(self, deployment_system: ProductionDeploymentSystem):
        self.deployment_system = deployment_system
        self.active_crews: Dict[str, Crew] = {}
        self.crew_health_status: Dict[str, Dict] = {}
        
    async def deploy_marketing_crew(self, crew_config: Dict) -> str:
        """Deploy a marketing crew with full monitoring"""
        crew_id = f"crew_{datetime.now().strftime('%Y%m%d%H%M%S')}_{crew_config['type']}"
        
        with self.deployment_system.tracer.start_as_current_span("deploy_crew") as span:
            span.set_attribute("crew.id", crew_id)
            span.set_attribute("crew.type", crew_config['type'])
            
            try:
                # Log deployment start
                self.deployment_system.logger.info(
                    f"Deploying crew {crew_id}",
                    extra=json.dumps({"crew_id": crew_id, "config": crew_config})
                )
                
                # Create crew based on type
                if crew_config['type'] == 'content_creation':
                    crew = self._create_content_crew(crew_config)
                elif crew_config['type'] == 'analytics':
                    crew = self._create_analytics_crew(crew_config)
                elif crew_config['type'] == 'campaign_management':
                    crew = self._create_campaign_crew(crew_config)
                else:
                    raise ValueError(f"Unknown crew type: {crew_config['type']}")
                
                # Register crew
                self.active_crews[crew_id] = crew
                
                # Store deployment info
                await self._store_deployment_info(crew_id, crew_config)
                
                # Start health monitoring
                asyncio.create_task(self._monitor_crew_health(crew_id))
                
                # Update metrics
                self.deployment_system.crew_executions.labels(
                    crew_type=crew_config['type'],
                    status='deployed'
                ).inc()
                
                return crew_id
                
            except Exception as e:
                self.deployment_system.error_rate.labels(
                    crew_type=crew_config['type'],
                    error_type=type(e).__name__
                ).inc()
                
                sentry_sdk.capture_exception(e)
                raise
    
    def _create_content_crew(self, config: Dict) -> Crew:
        """Create content creation crew"""
        # Content strategist
        strategist = Agent(
            role='Content Strategist',
            goal='Develop winning content strategies',
            backstory='Expert content strategist with data-driven approach',
            verbose=config.get('verbose', True),
            max_iter=config.get('max_iterations', 5),
            memory=True
        )
        
        # Content writer
        writer = Agent(
            role='Content Writer',
            goal='Create engaging content that converts',
            backstory='Experienced writer across all formats',
            verbose=config.get('verbose', True),
            max_iter=config.get('max_iterations', 5),
            memory=True
        )
        
        # SEO optimizer
        seo_optimizer = Agent(
            role='SEO Optimizer',
            goal='Maximize organic search visibility',
            backstory='Technical SEO expert with proven results',
            verbose=config.get('verbose', True),
            max_iter=config.get('max_iterations', 5),
            memory=True
        )
        
        # Create tasks based on config
        tasks = self._create_content_tasks(config, strategist, writer, seo_optimizer)
        
        return Crew(
            agents=[strategist, writer, seo_optimizer],
            tasks=tasks,
            verbose=config.get('verbose', True),
            process=config.get('process', 'sequential')
        )
    
    async def _monitor_crew_health(self, crew_id: str):
        """Monitor crew health continuously"""
        while crew_id in self.active_crews:
            try:
                health_status = await self._check_crew_health(crew_id)
                self.crew_health_status[crew_id] = health_status
                
                # Log health status
                self.deployment_system.logger.info(
                    f"Crew health check: {crew_id}",
                    extra=json.dumps(health_status)
                )
                
                # Take action if unhealthy
                if health_status['status'] == 'unhealthy':
                    await self._handle_unhealthy_crew(crew_id, health_status)
                
                await asyncio.sleep(self.deployment_system.config.health_check_interval)
                
            except Exception as e:
                self.deployment_system.logger.error(
                    f"Health check failed for crew {crew_id}",
                    extra=json.dumps({"error": str(e)})
                )
                sentry_sdk.capture_exception(e)
\`\`\`

### 3. Monitoring and Observability

\`\`\`python
class CrewMonitoringSystem:
    """Comprehensive monitoring for production crews"""
    
    def __init__(self, deployment_system: ProductionDeploymentSystem):
        self.deployment_system = deployment_system
        
        # Initialize monitoring dashboards
        self.dashboards = {
            "performance": self._create_performance_dashboard(),
            "errors": self._create_error_dashboard(),
            "costs": self._create_cost_dashboard(),
            "sla": self._create_sla_dashboard()
        }
    
    @tool("Real-time Performance Monitor")
    def monitor_crew_performance(self, crew_id: str) -> str:
        """Monitor real-time crew performance"""
        with self.deployment_system.tracer.start_as_current_span("monitor_performance") as span:
            span.set_attribute("crew.id", crew_id)
            
            performance_data = {
                "crew_id": crew_id,
                "timestamp": datetime.now().isoformat(),
                "metrics": {}
            }
            
            # Collect performance metrics
            with self.deployment_system.postgres_conn.cursor() as cursor:
                # Execution metrics
                cursor.execute("""
                    SELECT 
                        COUNT(*) as total_executions,
                        AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_duration,
                        COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful,
                        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
                    FROM crew_executions
                    WHERE crew_id = %s
                    AND started_at > NOW() - INTERVAL '1 hour'
                """, (crew_id,))
                
                execution_metrics = cursor.fetchone()
                
                performance_data["metrics"]["executions"] = {
                    "total": execution_metrics[0],
                    "avg_duration_seconds": execution_metrics[1] or 0,
                    "success_rate": execution_metrics[2] / execution_metrics[0] if execution_metrics[0] > 0 else 0,
                    "failure_rate": execution_metrics[3] / execution_metrics[0] if execution_metrics[0] > 0 else 0
                }
                
                # Agent activity metrics
                cursor.execute("""
                    SELECT 
                        agent_role,
                        COUNT(*) as tasks_completed,
                        AVG(tokens_used) as avg_tokens,
                        AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_task_duration
                    FROM agent_activities
                    WHERE crew_id = %s
                    AND started_at > NOW() - INTERVAL '1 hour'
                    GROUP BY agent_role
                """, (crew_id,))
                
                agent_metrics = cursor.fetchall()
                performance_data["metrics"]["agents"] = {
                    row[0]: {
                        "tasks_completed": row[1],
                        "avg_tokens": row[2] or 0,
                        "avg_duration_seconds": row[3] or 0
                    } for row in agent_metrics
                }
            
            # Real-time resource usage
            performance_data["metrics"]["resources"] = self._get_resource_usage(crew_id)
            
            # Calculate performance score
            performance_data["performance_score"] = self._calculate_performance_score(
                performance_data["metrics"]
            )
            
            # Generate insights
            performance_data["insights"] = self._generate_performance_insights(
                performance_data["metrics"]
            )
            
            return json.dumps(performance_data, indent=2)
    
    def _get_resource_usage(self, crew_id: str) -> Dict:
        """Get real-time resource usage"""
        # In production, this would query container metrics
        return {
            "cpu_usage_percent": 45.2,
            "memory_usage_mb": 512,
            "network_io_mb": 125,
            "api_calls_per_minute": 23,
            "token_usage_per_minute": 4500
        }
    
    @tool("Error Analysis Dashboard")
    def analyze_errors(self, time_range: str) -> str:
        """Analyze errors across all crews"""
        range_data = json.loads(time_range)
        
        error_analysis = {
            "time_range": range_data,
            "timestamp": datetime.now().isoformat(),
            "error_summary": {},
            "error_patterns": [],
            "recommendations": []
        }
        
        with self.deployment_system.postgres_conn.cursor() as cursor:
            # Get error summary
            cursor.execute("""
                SELECT 
                    crew_type,
                    error_data->>'error_type' as error_type,
                    COUNT(*) as error_count,
                    MAX(created_at) as last_occurrence
                FROM crew_executions
                WHERE status = 'failed'
                AND created_at BETWEEN %s AND %s
                AND error_data IS NOT NULL
                GROUP BY crew_type, error_data->>'error_type'
                ORDER BY error_count DESC
            """, (range_data['start'], range_data['end']))
            
            errors = cursor.fetchall()
            
            for crew_type, error_type, count, last_occurrence in errors:
                if crew_type not in error_analysis["error_summary"]:
                    error_analysis["error_summary"][crew_type] = {}
                
                error_analysis["error_summary"][crew_type][error_type] = {
                    "count": count,
                    "last_occurrence": last_occurrence.isoformat()
                }
            
            # Identify error patterns
            error_analysis["error_patterns"] = self._identify_error_patterns(errors)
            
            # Generate recommendations
            error_analysis["recommendations"] = self._generate_error_recommendations(
                error_analysis["error_summary"],
                error_analysis["error_patterns"]
            )
        
        return json.dumps(error_analysis, indent=2)
    
    def _identify_error_patterns(self, errors: List) -> List[Dict]:
        """Identify patterns in errors"""
        patterns = []
        
        # Time-based patterns
        error_times = {}
        for _, error_type, count, last_occurrence in errors:
            hour = last_occurrence.hour
            if hour not in error_times:
                error_times[hour] = 0
            error_times[hour] += count
        
        # Check for peak error hours
        if error_times:
            peak_hour = max(error_times, key=error_times.get)
            if error_times[peak_hour] > sum(error_times.values()) * 0.3:
                patterns.append({
                    "type": "temporal",
                    "description": f"High error concentration at hour {peak_hour}",
                    "severity": "medium",
                    "recommendation": "Investigate resource constraints during peak hours"
                })
        
        return patterns
\`\`\`

### 4. Auto-scaling and Recovery

\`\`\`python
class AutoScalingManager:
    """Manages auto-scaling for marketing crews"""
    
    def __init__(self, deployment_system: ProductionDeploymentSystem):
        self.deployment_system = deployment_system
        self.scaling_policies = self._load_scaling_policies()
        
    def _load_scaling_policies(self) -> Dict:
        """Load scaling policies"""
        return {
            "content_creation": {
                "min_instances": 2,
                "max_instances": 10,
                "target_cpu": 70,
                "target_memory": 80,
                "scale_up_cooldown": 300,  # 5 minutes
                "scale_down_cooldown": 600  # 10 minutes
            },
            "analytics": {
                "min_instances": 1,
                "max_instances": 5,
                "target_cpu": 80,
                "target_memory": 85,
                "scale_up_cooldown": 180,
                "scale_down_cooldown": 600
            }
        }
    
    async def auto_scale_crews(self):
        """Auto-scale crews based on load"""
        while True:
            try:
                for crew_type, policy in self.scaling_policies.items():
                    current_metrics = await self._get_crew_metrics(crew_type)
                    scaling_decision = self._make_scaling_decision(current_metrics, policy)
                    
                    if scaling_decision["action"] != "none":
                        await self._execute_scaling(crew_type, scaling_decision)
                
                await asyncio.sleep(60)  # Check every minute
                
            except Exception as e:
                self.deployment_system.logger.error(
                    "Auto-scaling error",
                    extra=json.dumps({"error": str(e)})
                )
                sentry_sdk.capture_exception(e)
    
    def _make_scaling_decision(self, metrics: Dict, policy: Dict) -> Dict:
        """Decide whether to scale up, down, or maintain"""
        current_instances = metrics["instances"]
        avg_cpu = metrics["avg_cpu"]
        avg_memory = metrics["avg_memory"]
        
        # Check if we need to scale up
        if (avg_cpu > policy["target_cpu"] or avg_memory > policy["target_memory"]) and \\
           current_instances < policy["max_instances"]:
            return {
                "action": "scale_up",
                "target_instances": min(current_instances + 1, policy["max_instances"]),
                "reason": f"High resource usage: CPU {avg_cpu}%, Memory {avg_memory}%"
            }
        
        # Check if we can scale down
        elif (avg_cpu < policy["target_cpu"] * 0.5 and avg_memory < policy["target_memory"] * 0.5) and \\
             current_instances > policy["min_instances"]:
            return {
                "action": "scale_down",
                "target_instances": max(current_instances - 1, policy["min_instances"]),
                "reason": f"Low resource usage: CPU {avg_cpu}%, Memory {avg_memory}%"
            }
        
        return {"action": "none"}

class ErrorRecoverySystem:
    """Automated error recovery for crews"""
    
    def __init__(self, deployment_system: ProductionDeploymentSystem):
        self.deployment_system = deployment_system
        self.recovery_strategies = {
            "timeout": self._recover_from_timeout,
            "resource_exhausted": self._recover_from_resource_exhaustion,
            "api_error": self._recover_from_api_error,
            "agent_failure": self._recover_from_agent_failure
        }
    
    async def handle_crew_failure(self, crew_id: str, error_data: Dict) -> Dict:
        """Handle crew failure with appropriate recovery strategy"""
        error_type = error_data.get("error_type", "unknown")
        
        self.deployment_system.logger.warning(
            f"Handling crew failure: {crew_id}",
            extra=json.dumps({"crew_id": crew_id, "error": error_data})
        )
        
        recovery_result = {
            "crew_id": crew_id,
            "error_type": error_type,
            "recovery_attempted": False,
            "recovery_successful": False,
            "action_taken": None
        }
        
        if error_type in self.recovery_strategies:
            try:
                recovery_action = await self.recovery_strategies[error_type](crew_id, error_data)
                recovery_result.update(recovery_action)
                recovery_result["recovery_attempted"] = True
                
            except Exception as e:
                recovery_result["recovery_error"] = str(e)
                sentry_sdk.capture_exception(e)
        
        # Log recovery attempt
        await self._log_recovery_attempt(recovery_result)
        
        return recovery_result
    
    async def _recover_from_timeout(self, crew_id: str, error_data: Dict) -> Dict:
        """Recover from timeout errors"""
        # Check if task can be split
        if error_data.get("task_size", 0) > 1000:
            # Split into smaller tasks
            return {
                "action_taken": "task_split",
                "recovery_successful": True,
                "details": "Split large task into smaller chunks"
            }
        else:
            # Retry with extended timeout
            return {
                "action_taken": "timeout_extension",
                "recovery_successful": True,
                "details": "Extended timeout from 3600s to 7200s"
            }
    
    async def _recover_from_resource_exhaustion(self, crew_id: str, error_data: Dict) -> Dict:
        """Recover from resource exhaustion"""
        # Trigger auto-scaling
        return {
            "action_taken": "auto_scale",
            "recovery_successful": True,
            "details": "Triggered auto-scaling to add more instances"
        }
\`\`\`

### 5. Continuous Improvement Pipeline

\`\`\`python
class ContinuousImprovementPipeline:
    """Automated continuous improvement for marketing crews"""
    
    def __init__(self, deployment_system: ProductionDeploymentSystem):
        self.deployment_system = deployment_system
        self.improvement_cycles = []
        
    @tool("Performance Optimization Pipeline")
    def run_improvement_cycle(self, crew_type: str, time_period: str) -> str:
        """Run continuous improvement cycle"""
        period = json.loads(time_period)
        
        improvement_report = {
            "crew_type": crew_type,
            "period": period,
            "timestamp": datetime.now().isoformat(),
            "analysis": {},
            "optimizations": [],
            "results": {}
        }
        
        # Step 1: Analyze historical performance
        performance_data = self._analyze_historical_performance(crew_type, period)
        improvement_report["analysis"]["performance"] = performance_data
        
        # Step 2: Identify optimization opportunities
        opportunities = self._identify_optimization_opportunities(performance_data)
        improvement_report["analysis"]["opportunities"] = opportunities
        
        # Step 3: Implement optimizations
        for opportunity in opportunities:
            if opportunity["auto_implementable"]:
                optimization_result = self._implement_optimization(crew_type, opportunity)
                improvement_report["optimizations"].append(optimization_result)
        
        # Step 4: A/B test optimizations
        test_results = self._run_optimization_tests(crew_type, improvement_report["optimizations"])
        improvement_report["results"]["ab_tests"] = test_results
        
        # Step 5: Deploy winning variations
        deployment_results = self._deploy_winning_variations(test_results)
        improvement_report["results"]["deployments"] = deployment_results
        
        # Step 6: Generate improvement insights
        improvement_report["insights"] = self._generate_improvement_insights(improvement_report)
        
        return json.dumps(improvement_report, indent=2)
    
    def _identify_optimization_opportunities(self, performance_data: Dict) -> List[Dict]:
        """Identify areas for optimization"""
        opportunities = []
        
        # Check for slow agents
        for agent_role, metrics in performance_data.get("agent_metrics", {}).items():
            if metrics["avg_duration"] > 300:  # 5 minutes
                opportunities.append({
                    "type": "agent_optimization",
                    "target": agent_role,
                    "issue": "slow_execution",
                    "recommendation": "Optimize prompts or split tasks",
                    "potential_improvement": "30-50% speed increase",
                    "auto_implementable": True
                })
        
        # Check for high error rates
        if performance_data.get("error_rate", 0) > 0.05:  # 5%
            opportunities.append({
                "type": "error_reduction",
                "target": "crew_configuration",
                "issue": "high_error_rate",
                "recommendation": "Add retry logic and validation",
                "potential_improvement": "80% error reduction",
                "auto_implementable": True
            })
        
        # Check for resource inefficiency
        if performance_data.get("resource_efficiency", 1) < 0.7:
            opportunities.append({
                "type": "resource_optimization",
                "target": "crew_sizing",
                "issue": "resource_inefficiency",
                "recommendation": "Adjust crew size and agent allocation",
                "potential_improvement": "25% cost reduction",
                "auto_implementable": True
            })
        
        return opportunities
    
    def _implement_optimization(self, crew_type: str, opportunity: Dict) -> Dict:
        """Implement specific optimization"""
        optimization_result = {
            "opportunity": opportunity,
            "implementation": {},
            "status": "pending"
        }
        
        if opportunity["type"] == "agent_optimization":
            # Optimize agent configuration
            new_config = self._optimize_agent_config(crew_type, opportunity["target"])
            optimization_result["implementation"] = new_config
            optimization_result["status"] = "implemented"
            
        elif opportunity["type"] == "error_reduction":
            # Add error handling
            error_config = self._add_error_handling(crew_type)
            optimization_result["implementation"] = error_config
            optimization_result["status"] = "implemented"
            
        elif opportunity["type"] == "resource_optimization":
            # Optimize resource allocation
            resource_config = self._optimize_resources(crew_type)
            optimization_result["implementation"] = resource_config
            optimization_result["status"] = "implemented"
        
        return optimization_result

# Complete Production Deployment Example
async def deploy_production_marketing_system():
    """Deploy complete marketing system to production"""
    
    # Initialize production configuration
    config = ProductionConfig(
        environment="production",
        redis_host="redis.prod.example.com",
        postgres_host="postgres.prod.example.com",
        max_concurrent_crews=20,
        auto_scale_enabled=True
    )
    
    # Initialize deployment system
    deployment_system = ProductionDeploymentSystem(config)
    
    # Initialize managers
    deployment_manager = CrewDeploymentManager(deployment_system)
    monitoring_system = CrewMonitoringSystem(deployment_system)
    scaling_manager = AutoScalingManager(deployment_system)
    recovery_system = ErrorRecoverySystem(deployment_system)
    improvement_pipeline = ContinuousImprovementPipeline(deployment_system)
    
    # Deploy initial crews
    crew_configs = [
        {
            "type": "content_creation",
            "name": "content_crew_prod",
            "agents": 5,
            "max_iterations": 10,
            "verbose": False
        },
        {
            "type": "analytics",
            "name": "analytics_crew_prod",
            "agents": 3,
            "max_iterations": 5,
            "verbose": False
        },
        {
            "type": "campaign_management",
            "name": "campaign_crew_prod",
            "agents": 4,
            "max_iterations": 8,
            "verbose": False
        }
    ]
    
    # Deploy all crews
    deployed_crews = []
    for config in crew_configs:
        crew_id = await deployment_manager.deploy_marketing_crew(config)
        deployed_crews.append(crew_id)
        print(f"Deployed crew: {crew_id}")
    
    # Start monitoring tasks
    monitoring_tasks = [
        asyncio.create_task(scaling_manager.auto_scale_crews()),
        asyncio.create_task(monitor_all_crews(monitoring_system, deployed_crews)),
        asyncio.create_task(run_improvement_cycles(improvement_pipeline))
    ]
    
    # Wait for all tasks
    await asyncio.gather(*monitoring_tasks)

async def monitor_all_crews(monitoring_system: CrewMonitoringSystem, crew_ids: List[str]):
    """Monitor all deployed crews"""
    while True:
        for crew_id in crew_ids:
            try:
                performance = monitoring_system.monitor_crew_performance(crew_id)
                print(f"Crew {crew_id} performance: {performance}")
            except Exception as e:
                print(f"Monitoring error for {crew_id}: {e}")
        
        await asyncio.sleep(60)  # Check every minute

async def run_improvement_cycles(improvement_pipeline: ContinuousImprovementPipeline):
    """Run continuous improvement cycles"""
    while True:
        # Run improvement cycle daily
        await asyncio.sleep(86400)  # 24 hours
        
        for crew_type in ["content_creation", "analytics", "campaign_management"]:
            try:
                improvement_report = improvement_pipeline.run_improvement_cycle(
                    crew_type,
                    json.dumps({
                        "start": (datetime.now() - timedelta(days=7)).isoformat(),
                        "end": datetime.now().isoformat()
                    })
                )
                print(f"Improvement cycle completed for {crew_type}: {improvement_report}")
            except Exception as e:
                print(f"Improvement cycle error for {crew_type}: {e}")

# Run the deployment
if __name__ == "__main__":
    asyncio.run(deploy_production_marketing_system())
\`\`\`

## Production Best Practices

### 1. Deployment Strategy
- Use blue-green deployments voor zero-downtime updates
- Implement canary releases voor nieuwe features
- Maintain rollback capabilities

### 2. Monitoring and Alerting
- Set up comprehensive dashboards
- Configure intelligent alerting thresholds
- Implement anomaly detection

### 3. Security
- Use service mesh voor secure communication
- Implement API rate limiting
- Regular security audits

### 4. Cost Optimization
- Monitor token usage per agent
- Implement cost alerts
- Use spot instances waar mogelijk

### 5. Compliance
- Maintain audit logs
- Implement data retention policies
- Ensure GDPR compliance

## Oefeningen

### Oefening 1: Disaster Recovery
Implementeer een complete disaster recovery plan voor marketing crews

### Oefening 2: Multi-Region Deployment
Deploy crews across multiple regions met failover

### Oefening 3: Performance Testing
Bouw een load testing framework voor crew capacity planning
`,
  assignments: [
    {
      id: 'ex1',
      title: 'Disaster Recovery Implementation',
      description: 'Implementeer een complete disaster recovery system met automated backup, failover, en recovery procedures',
      difficulty: 'expert',
      type: 'project',
      hints: [
        'Implementeer automated backups van crew states',
        'Bouw failover mechanisms voor critical crews',
        'Test recovery procedures met chaos engineering'
      ]
    }
  ],
  resources: [
    {
      title: 'Production Deployment Best Practices',
      url: 'https://kubernetes.io/docs/concepts/workloads/',
      type: 'documentation'
    },
    {
      title: 'Monitoring AI Systems in Production',
      url: 'https://www.oreilly.com/library/view/building-machine-learning/9781492053187/',
      type: 'book'
    },
    {
      title: 'CrewAI Production Guide',
      url: 'https://docs.crewai.com/deployment/production',
      type: 'documentation'
    }
  ]
};

export default lesson;