import type { Lesson } from '@/lib/data/courses';

export const lesson43: Lesson = {
  id: 'lesson-4-3',
  title: 'Performance metrics en alerting',
  duration: '35 min',
  content: `
# Performance Metrics en Alerting

## Key Performance Indicators voor AI Swarms

### Core Swarm Metrics
\`\`\`typescript
interface SwarmKPIs {
  // Operational metrics
  agentAvailability: number;      // % agents operational
  taskThroughput: number;         // tasks/second
  avgResponseTime: number;        // milliseconds
  errorRate: number;              // % failed tasks
  
  // Business metrics
  taskCompletionRate: number;     // % successful completions
  slaCompliance: number;          // % within SLA
  costPerTask: number;            // $ per task
  
  // Resource metrics
  cpuEfficiency: number;          // % CPU utilized effectively
  memoryEfficiency: number;       // % memory utilized
  networkUtilization: number;     // Mbps
}
\`\`\`

## Agent-level vs Swarm-level Metrics

### Agent-level Metrics
Focus op individuele agent performance:
- Task execution time
- Memory consumption
- Error frequency
- Communication latency

### Swarm-level Metrics
Aggregated metrics voor het hele systeem:
- Total throughput
- System-wide error rate
- Load distribution fairness
- Inter-agent communication efficiency

## SLA Monitoring en Compliance

### SLA Framework Implementation
\`\`\`typescript
class SLAMonitor {
  private slaTargets: Map<string, SLATarget> = new Map();
  
  async checkCompliance(metric: string, value: number): Promise<ComplianceResult> {
    const target = this.slaTargets.get(metric);
    if (!target) return { compliant: true, reason: 'No SLA defined' };
    
    const compliant = this.evaluateTarget(value, target);
    
    if (!compliant) {
      await this.triggerSLABreach({
        metric,
        actual: value,
        target: target.value,
        severity: target.severity
      });
    }
    
    return {
      compliant,
      actual: value,
      target: target.value,
      margin: Math.abs(value - target.value) / target.value
    };
  }
}
\`\`\`

## Anomaly Detection in Swarm Behavior

### Statistical Anomaly Detection
\`\`\`typescript
class AnomalyDetector {
  private history: MetricHistory = new Map();
  private detectors: AnomalyAlgorithm[] = [
    new ZScoreDetector(3.0),
    new IsolationForestDetector(),
    new LSTMPredictor()
  ];
  
  async detectAnomalies(metrics: SwarmMetrics): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];
    
    for (const [metric, value] of Object.entries(metrics)) {
      const isAnomaly = await this.evaluateMetric(metric, value);
      
      if (isAnomaly) {
        anomalies.push({
          metric,
          value,
          expectedRange: this.getExpectedRange(metric),
          severity: this.calculateSeverity(metric, value),
          timestamp: new Date()
        });
      }
    }
    
    return anomalies;
  }
}
\`\`\`

## Alert Fatigue Prevention

### Intelligent Alert Aggregation
\`\`\`typescript
class AlertAggregator {
  private alertBuffer: Alert[] = [];
  private aggregationWindow = 300000; // 5 minutes
  
  async processAlert(alert: Alert): Promise<void> {
    // Check for similar recent alerts
    const similar = this.findSimilarAlerts(alert);
    
    if (similar.length > 0) {
      // Aggregate instead of sending new alert
      await this.aggregateAlerts([...similar, alert]);
    } else {
      // New alert pattern, send immediately
      await this.sendAlert(alert);
    }
    
    this.alertBuffer.push(alert);
    this.cleanupOldAlerts();
  }
  
  private findSimilarAlerts(alert: Alert): Alert[] {
    return this.alertBuffer.filter(buffered => 
      buffered.type === alert.type &&
      buffered.component === alert.component &&
      Date.now() - buffered.timestamp < this.aggregationWindow
    );
  }
}
\`\`\`

## Incident Response Automation

### Automated Playbooks
\`\`\`typescript
class IncidentResponseAutomation {
  private playbooks: Map<string, Playbook> = new Map();
  
  async handleIncident(incident: Incident): Promise<ResponseResult> {
    const playbook = this.selectPlaybook(incident);
    
    if (!playbook) {
      return this.escalateToHuman(incident);
    }
    
    const result = await this.executePlaybook(playbook, incident);
    
    await this.logResponse({
      incident,
      playbook: playbook.name,
      actions: result.executedActions,
      outcome: result.outcome,
      duration: result.duration
    });
    
    return result;
  }
  
  private async executePlaybook(playbook: Playbook, incident: Incident) {
    const context = { incident, startTime: Date.now() };
    const executedActions: Action[] = [];
    
    for (const step of playbook.steps) {
      try {
        const result = await this.executeStep(step, context);
        executedActions.push(result);
        
        if (step.stopOnSuccess && result.success) {
          break;
        }
      } catch (error) {
        if (step.critical) {
          throw error;
        }
      }
    }
    
    return {
      executedActions,
      outcome: 'resolved',
      duration: Date.now() - context.startTime
    };
  }
}
\`\`\``,
  codeExamples: [
    {
      id: 'complete-kpi-dashboard-implementation',
      title: 'Complete KPI Dashboard Implementation',
      language: 'typescript',
      code: `import { WebSocket } from 'ws';
import { EventEmitter } from 'events';

class SwarmKPIDashboard extends EventEmitter {
  private metrics: Map<string, MetricStream> = new Map();
  private wsServer: WebSocket.Server;
  private updateInterval: number = 1000; // 1 second
  
  constructor(port: number = 3001) {
    super();
    this.wsServer = new WebSocket.Server({ port });
    this.setupWebSocket();
    this.startMetricStreaming();
  }
  
  private setupWebSocket() {
    this.wsServer.on('connection', (ws) => {
      console.log('Dashboard client connected');
      
      // Send initial state
      ws.send(JSON.stringify({
        type: 'initial',
        data: this.getCurrentMetrics()
      }));
      
      // Setup real-time updates
      const interval = setInterval(() => {
        ws.send(JSON.stringify({
          type: 'update',
          data: this.getCurrentMetrics()
        }));
      }, this.updateInterval);
      
      ws.on('close', () => {
        clearInterval(interval);
      });
    });
  }
  
  private getCurrentMetrics(): DashboardData {
    return {
      kpis: {
        agentAvailability: this.calculateAvailability(),
        taskThroughput: this.calculateThroughput(),
        avgResponseTime: this.calculateAvgResponseTime(),
        errorRate: this.calculateErrorRate(),
        slaCompliance: this.calculateSLACompliance()
      },
      trends: this.calculateTrends(),
      alerts: this.getActiveAlerts(),
      timestamp: Date.now()
    };
  }
  
  registerMetricStream(name: string, stream: MetricStream) {
    this.metrics.set(name, stream);
    
    stream.on('data', (data) => {
      this.emit('metric', { name, data });
      this.updateCalculations(name, data);
    });
  }
}`
    },
    {
      id: 'intelligent-alerting-system',
      title: 'Intelligent Alerting System',
      language: 'typescript',
      code: `interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  cooldown: number;
  actions: AlertAction[];
}

class IntelligentAlertManager {
  private rules: Map<string, AlertRule> = new Map();
  private alertHistory: Alert[] = [];
  private mlPredictor: AlertPredictor;
  
  constructor() {
    this.mlPredictor = new AlertPredictor();
    this.trainPredictor();
  }
  
  async evaluateMetrics(metrics: SwarmMetrics): Promise<Alert[]> {
    const alerts: Alert[] = [];
    
    // Rule-based evaluation
    for (const rule of this.rules.values()) {
      if (this.evaluateRule(rule, metrics)) {
        alerts.push(await this.createAlert(rule, metrics));
      }
    }
    
    // ML-based anomaly detection
    const anomalies = await this.mlPredictor.detectAnomalies(metrics);
    alerts.push(...anomalies.map(a => this.anomalyToAlert(a)));
    
    // Intelligent filtering
    const filtered = this.filterAlerts(alerts);
    
    // Route to appropriate channels
    await this.routeAlerts(filtered);
    
    return filtered;
  }
  
  private filterAlerts(alerts: Alert[]): Alert[] {
    // Remove duplicate alerts
    const unique = this.deduplicateAlerts(alerts);
    
    // Apply intelligent suppression
    const suppressed = this.applySuppression(unique);
    
    // Correlate related alerts
    const correlated = this.correlateAlerts(suppressed);
    
    return correlated;
  }
  
  private async routeAlerts(alerts: Alert[]) {
    const router = new AlertRouter();
    
    for (const alert of alerts) {
      const route = router.determineRoute(alert);
      
      switch (route.channel) {
        case 'pagerduty':
          await this.sendToPagerDuty(alert, route.priority);
          break;
        case 'slack':
          await this.sendToSlack(alert, route.channel);
          break;
        case 'email':
          await this.sendEmail(alert, route.recipients);
          break;
        case 'webhook':
          await this.sendWebhook(alert, route.url);
          break;
      }
    }
  }
}`
    },
    {
      id: 'anomaly-detection-for-agent-behavior',
      title: 'Anomaly Detection for Agent Behavior',
      language: 'python',
      code: `import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import pandas as pd

class SwarmAnomalyDetector:
    def __init__(self, contamination=0.1):
        self.isolation_forest = IsolationForest(
            contamination=contamination,
            random_state=42
        )
        self.scaler = StandardScaler()
        self.is_trained = False
        
    def train(self, historical_data: pd.DataFrame):
        """Train on historical swarm metrics"""
        # Feature engineering
        features = self.extract_features(historical_data)
        
        # Scale features
        scaled_features = self.scaler.fit_transform(features)
        
        # Train isolation forest
        self.isolation_forest.fit(scaled_features)
        self.is_trained = True
        
    def detect_anomalies(self, current_metrics: dict) -> list:
        """Detect anomalies in current metrics"""
        if not self.is_trained:
            raise ValueError("Detector must be trained first")
            
        # Convert to feature vector
        features = self.metrics_to_features(current_metrics)
        scaled = self.scaler.transform([features])
        
        # Predict anomaly
        anomaly_score = self.isolation_forest.decision_function(scaled)[0]
        is_anomaly = self.isolation_forest.predict(scaled)[0] == -1
        
        if is_anomaly:
            return [{
                'type': 'behavioral_anomaly',
                'score': float(anomaly_score),
                'metrics': current_metrics,
                'explanation': self.explain_anomaly(features, anomaly_score)
            }]
        
        return []
    
    def extract_features(self, data: pd.DataFrame) -> np.ndarray:
        """Extract relevant features for anomaly detection"""
        features = []
        
        # Task completion patterns
        features.append(data['task_completion_rate'].values)
        features.append(data['avg_task_duration'].values)
        
        # Communication patterns
        features.append(data['inter_agent_messages'].values)
        features.append(data['message_latency'].values)
        
        # Resource utilization
        features.append(data['cpu_usage'].values)
        features.append(data['memory_usage'].values)
        
        # Error patterns
        features.append(data['error_rate'].values)
        features.append(data['retry_rate'].values)
        
        return np.array(features).T

# Ensemble anomaly detection
class EnsembleAnomalyDetector:
    def __init__(self):
        self.detectors = [
            IsolationForestDetector(),
            StatisticalDetector(),
            LSTMAnomalyDetector(),
            ClusteringDetector()
        ]
        
    async def detect(self, metrics: SwarmMetrics) -> List[Anomaly]:
        # Run all detectors in parallel
        results = await asyncio.gather(*[
            detector.detect(metrics) for detector in self.detectors
        ])
        
        # Combine results with voting
        return self.ensemble_vote(results)`
    }
  ],
  assignments: [
    {
      id: 'assignment-4-3-1',
      title: 'Design een complete metrics strategie voor production swarm',
      description: 'Ontwerp een uitgebreide metrics strategie voor een productie AI swarm met 100+ agents, inclusief KPIs, SLAs, en alerting thresholds.',
      type: 'project',
      difficulty: 'hard',
      checklist: [
        'Identificeer alle relevante KPIs',
        'Definieer SLA targets per metric',
        'Ontwerp alerting hierarchie',
        'Plan dashboard layouts',
        'Documenteer escalatie procedures',
        'Test met gesimuleerde scenarios'
      ]
    },
    {
      id: 'assignment-4-3-2',
      title: 'Implementeer een alert routing system',
      description: 'Bouw een intelligent alert routing systeem dat alerts naar de juiste kanalen stuurt gebaseerd op severity, tijd, en on-call schedules.',
      type: 'project',
      difficulty: 'hard',
      checklist: [
        'Design routing rules engine',
        'Implement multiple notification channels',
        'Add on-call schedule integration',
        'Create alert deduplication logic',
        'Build escalation mechanisms',
        'Test all alert paths'
      ]
    }
  ],
  resources: [
    {
      title: 'SRE Book - Monitoring Distributed Systems',
      type: 'book',
      url: 'https://sre.google/sre-book/monitoring-distributed-systems/'
    },
    {
      title: 'The USE Method for Performance Analysis',
      type: 'article',
      url: 'https://www.brendangregg.com/usemethod.html'
    },
    {
      title: 'Anomaly Detection Algorithms',
      type: 'paper',
      url: 'https://arxiv.org/abs/anomaly-detection-survey'
    }
  ]
};