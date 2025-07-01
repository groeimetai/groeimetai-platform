import type { Lesson } from '@/lib/data/courses';

export const lesson2_2: Lesson = {
  id: 'lesson-2-2',
  title: 'Architecture discovery en documentatie',
  duration: '40 min',
  content: `
# Architecture Discovery en Documentatie

Claude Code biedt krachtige mogelijkheden voor het automatisch analyseren en documenteren van software architectuur. In deze les leer je hoe je deze tools effectief inzet.

## Automatic Architecture Analysis

Claude Code kan automatisch de structuur van je codebase analyseren en architectuurpatronen herkennen.

### Basis Architecture Discovery
\`\`\`bash
# Analyseer de complete architectuur
claude analyze architecture

# Focus op specifieke delen
claude analyze architecture --focus backend
claude analyze architecture --focus frontend

# Genereer een architectuur rapport
claude analyze architecture --report
\`\`\`

### Diepgaande Analyse Opties
\`\`\`bash
# Analyseer met verschillende detail niveaus
claude analyze architecture --depth shallow  # Hoofdstructuur
claude analyze architecture --depth medium   # Inclusief modules
claude analyze architecture --depth deep     # Volledig detail

# Export naar verschillende formaten
claude analyze architecture --output json
claude analyze architecture --output markdown
claude analyze architecture --output mermaid
\`\`\`

## Design Pattern Recognition

Claude Code herkent automatisch design patterns en architectuurstijlen in je code.

### Pattern Detection
\`\`\`bash
# Detecteer alle patterns
claude detect patterns

# Zoek specifieke patterns
claude detect patterns --type creational
claude detect patterns --type structural
claude detect patterns --type behavioral

# Analyseer pattern kwaliteit
claude detect patterns --analyze-quality
\`\`\`

### Pattern Voorbeelden
\`\`\`bash
# MVC architectuur detectie
claude detect patterns --architecture mvc
# Output: Found MVC pattern:
# - Models: /src/models (15 files)
# - Views: /src/views (23 files)  
# - Controllers: /src/controllers (12 files)

# Microservices detectie
claude detect patterns --architecture microservices
# Output: Detected 5 microservices:
# - auth-service (port 3001)
# - user-service (port 3002)
# - payment-service (port 3003)
# - notification-service (port 3004)
# - analytics-service (port 3005)
\`\`\`

## Component Relationship Mapping

Visualiseer hoe componenten met elkaar verbonden zijn en welke dependencies er bestaan.

### Dependency Mapping
\`\`\`bash
# Genereer component dependency map
claude map dependencies

# Focus op specifieke component
claude map dependencies --component UserService

# Toon circular dependencies
claude map dependencies --show-circular

# Export als interactieve visualisatie
claude map dependencies --interactive
\`\`\`

### Relationship Analysis
\`\`\`bash
# Analyseer component relaties
claude analyze relationships

# Toon coupling metrics
claude analyze relationships --metrics coupling

# Identificeer tight coupling
claude analyze relationships --find-issues

# Suggesties voor ontkoppeling
claude analyze relationships --suggest-improvements
\`\`\`

## Data Flow Analysis

Begrijp hoe data door je applicatie stroomt en identificeer potentiële bottlenecks.

### Flow Tracking
\`\`\`bash
# Trace data flow vanaf entry point
claude trace dataflow --entry /api/users

# Analyseer database queries flow
claude trace dataflow --type database

# Track API call chains
claude trace dataflow --type api-calls

# Identificeer data transformaties
claude trace dataflow --show-transformations
\`\`\`

### Performance Impact
\`\`\`bash
# Analyseer dataflow performance
claude analyze dataflow --performance

# Vind N+1 query problemen
claude analyze dataflow --find n+1

# Detecteer onnodige data fetching
claude analyze dataflow --optimize

# Genereer optimalisatie suggesties
claude analyze dataflow --suggest-caching
\`\`\`

## Architecture Diagram Generation

Automatisch genereren van architectuurdiagrammen in verschillende formaten.

### Diagram Types
\`\`\`bash
# Component diagram
claude generate diagram --type component

# Sequence diagram voor specifieke flow
claude generate diagram --type sequence --flow user-login

# Class diagram voor domein model
claude generate diagram --type class --package domain

# Deployment diagram
claude generate diagram --type deployment
\`\`\`

### Advanced Diagram Options
\`\`\`bash
# Interactief diagram met drill-down
claude generate diagram --interactive --depth 3

# Diagram met performance metrics
claude generate diagram --include-metrics

# Versie vergelijking diagram
claude generate diagram --compare v1.0..v2.0

# Real-time update diagram
claude generate diagram --watch
\`\`\`

## Praktijkvoorbeelden

### Voorbeeld 1: Monolith Architectuur
\`\`\`bash
# Analyseer een Laravel monolith
cd ~/projects/laravel-shop
claude analyze architecture

# Output:
# Architecture Type: Monolithic MVC
# Framework: Laravel 10.x
# 
# Structure:
# ├── Controllers (45 files)
# ├── Models (23 files)
# ├── Services (15 files)
# ├── Repositories (12 files)
# └── Views (67 files)
#
# Patterns Detected:
# - Repository Pattern
# - Service Layer
# - Observer Pattern (Events)
# - Factory Pattern (Factories)
\`\`\`

### Voorbeeld 2: Microservices Architectuur
\`\`\`bash
# Analyseer microservices project
cd ~/projects/ecommerce-microservices
claude analyze architecture --type distributed

# Output:
# Architecture Type: Microservices
# Communication: REST + RabbitMQ
# 
# Services Detected:
# 1. API Gateway (Node.js/Express)
#    - Port: 3000
#    - Routes to all services
# 
# 2. Auth Service (Node.js)
#    - Port: 3001
#    - JWT token management
#    - PostgreSQL database
# 
# 3. Product Service (Python/FastAPI)
#    - Port: 3002
#    - MongoDB database
#    - Redis cache
# 
# 4. Order Service (Java/Spring Boot)
#    - Port: 3003
#    - PostgreSQL database
#    - Saga pattern implementation
\`\`\`

### Voorbeeld 3: Event-Driven Architectuur
\`\`\`bash
# Analyseer event-driven systeem
cd ~/projects/streaming-platform
claude analyze architecture --focus events

# Output:
# Architecture Type: Event-Driven
# Message Broker: Apache Kafka
# 
# Event Flows:
# 1. User Events Topic
#    - Producers: auth-service, user-service
#    - Consumers: analytics-service, notification-service
# 
# 2. Video Events Topic
#    - Producers: video-service, transcoding-service
#    - Consumers: recommendation-service, cdn-service
# 
# 3. Payment Events Topic
#    - Producers: payment-service
#    - Consumers: billing-service, notification-service
\`\`\`

## Best Practices

### 1. Regelmatige Architecture Reviews
\`\`\`bash
# Schedule wekelijkse architecture check
claude schedule "analyze architecture --report" --weekly

# Monitor architecture drift
claude watch architecture --alert-on-changes
\`\`\`

### 2. Documentation as Code
\`\`\`bash
# Genereer documentatie vanuit code
claude generate docs --from-architecture

# Update diagrammen automatisch
claude generate diagram --auto-update
\`\`\`

### 3. Architecture Decision Records
\`\`\`bash
# Track architecture decisions
claude adr create "Migrate to microservices"

# Analyseer impact van decisions
claude adr analyze --impact
\`\`\`

### 4. Continuous Architecture Validation
\`\`\`bash
# Valideer tegen architecture rules
claude validate architecture --rules .architecture-rules

# Check conformiteit
claude check conformance --baseline approved-architecture.json
\`\`\`

## Integration met CI/CD

### GitHub Actions Voorbeeld
\`\`\`yaml
name: Architecture Analysis
on: [pull_request]

jobs:
  architecture-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Architecture Analysis
        run: |
          claude analyze architecture --report
          claude detect patterns --find-violations
          claude validate architecture --fail-on-issues
      
      - name: Upload Architecture Report
        uses: actions/upload-artifact@v3
        with:
          name: architecture-report
          path: architecture-report.html
\`\`\`

### Monitoring Dashboard
\`\`\`bash
# Start architecture monitoring dashboard
claude dashboard architecture --port 8080

# Features:
# - Real-time component health
# - Dependency graph visualization
# - Pattern conformance metrics
# - Historical architecture evolution
\`\`\`
  `,
  codeExamples: [
    {
      id: 'example-2-2-1',
      title: 'Complete Architecture Analysis Script',
      language: 'bash',
      code: `#!/bin/bash
# Comprehensive architecture analysis script

echo "Starting Complete Architecture Analysis..."

# 1. Basic architecture scan
echo "1. Analyzing architecture structure..."
claude analyze architecture --depth deep --output architecture-report.json

# 2. Pattern detection
echo "2. Detecting design patterns..."
claude detect patterns --all --export patterns.json

# 3. Dependency analysis
echo "3. Mapping component dependencies..."
claude map dependencies --include-external --format graphviz > dependencies.dot

# 4. Data flow analysis
echo "4. Analyzing data flows..."
claude trace dataflow --all-endpoints --performance > dataflow-report.txt

# 5. Generate visualizations
echo "5. Generating architecture diagrams..."
claude generate diagram --type component --format svg --output component-diagram.svg
claude generate diagram --type deployment --format png --output deployment-diagram.png

# 6. Generate comprehensive report
echo "6. Creating final report..."
claude report architecture --comprehensive --format html --output final-report.html

echo "Analysis complete! Check the generated files."`,
      explanation: 'Dit script voert een complete architectuuranalyse uit en genereert verschillende rapporten en diagrammen. Perfect voor architecture reviews of documentatie updates.'
    },
    {
      id: 'example-2-2-2',
      title: 'Microservices Architecture Discovery',
      language: 'javascript',
      code: `// Microservices discovery and documentation script
const { exec } = require('child_process');
const fs = require('fs').promises;

async function discoverMicroservices() {
  console.log('Discovering microservices architecture...');
  
  // Discover all services
  const services = await executeCommand('claude analyze architecture --type microservices --json');
  
  // Analyze each service
  for (const service of services.services) {
    console.log(\`\\nAnalyzing \${service.name}...\`);
    
    // Get service details
    const details = await executeCommand(
      \`claude analyze service --name \${service.name} --detailed\`
    );
    
    // Check health endpoints
    const health = await executeCommand(
      \`claude check health --service \${service.name}\`
    );
    
    // Map inter-service communication
    const communications = await executeCommand(
      \`claude map communications --service \${service.name}\`
    );
    
    // Generate service documentation
    await generateServiceDoc(service, details, health, communications);
  }
  
  // Generate overall architecture diagram
  await executeCommand('claude generate diagram --type microservices --interactive');
  
  console.log('\\nMicroservices discovery complete!');
}

async function generateServiceDoc(service, details, health, communications) {
  const doc = \`# \${service.name}

## Overview
- **Type**: \${details.type}
- **Language**: \${details.language}
- **Framework**: \${details.framework}
- **Port**: \${service.port}

## Health Status
- **Endpoint**: \${health.endpoint}
- **Status**: \${health.status}
- **Uptime**: \${health.uptime}

## Dependencies
\${details.dependencies.map(dep => \`- \${dep}\`).join('\\n')}

## API Endpoints
\${details.endpoints.map(ep => \`- \${ep.method} \${ep.path}\`).join('\\n')}

## Inter-Service Communication
\${communications.map(comm => \`- Communicates with \${comm.target} via \${comm.protocol}\`).join('\\n')}
\`;

  await fs.writeFile(\`docs/services/\${service.name}.md\`, doc);
}

function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      else resolve(JSON.parse(stdout));
    });
  });
}

// Run the discovery
discoverMicroservices().catch(console.error);`,
      explanation: 'Een Node.js script dat automatisch microservices ontdekt, analyseert en documenteert. Het genereert markdown documentatie voor elke service.'
    },
    {
      id: 'example-2-2-3',
      title: 'Real-time Architecture Monitoring',
      language: 'python',
      code: `# Real-time architecture monitoring with Claude Code
import subprocess
import json
import time
from datetime import datetime
import matplotlib.pyplot as plt
from collections import defaultdict

class ArchitectureMonitor:
    def __init__(self):
        self.metrics_history = defaultdict(list)
        self.alerts = []
        
    def run_analysis(self):
        """Run architecture analysis and collect metrics"""
        # Analyze current architecture state
        result = subprocess.run(
            ['claude', 'analyze', 'architecture', '--metrics', '--json'],
            capture_output=True, text=True
        )
        return json.loads(result.stdout)
    
    def check_patterns(self):
        """Check for pattern violations"""
        result = subprocess.run(
            ['claude', 'detect', 'patterns', '--check-violations', '--json'],
            capture_output=True, text=True
        )
        return json.loads(result.stdout)
    
    def analyze_dependencies(self):
        """Analyze dependency health"""
        result = subprocess.run(
            ['claude', 'map', 'dependencies', '--health-check', '--json'],
            capture_output=True, text=True
        )
        return json.loads(result.stdout)
    
    def monitor_loop(self, interval=300):  # 5 minutes default
        """Main monitoring loop"""
        print("Starting architecture monitoring...")
        
        while True:
            timestamp = datetime.now()
            print(f"\\n[{timestamp}] Running analysis...")
            
            # Collect metrics
            arch_metrics = self.run_analysis()
            pattern_check = self.check_patterns()
            dep_health = self.analyze_dependencies()
            
            # Store metrics
            self.metrics_history['complexity'].append(arch_metrics['complexity'])
            self.metrics_history['coupling'].append(arch_metrics['coupling'])
            self.metrics_history['cohesion'].append(arch_metrics['cohesion'])
            
            # Check for issues
            self.check_alerts(arch_metrics, pattern_check, dep_health)
            
            # Generate report if needed
            if len(self.metrics_history['complexity']) % 12 == 0:  # Every hour
                self.generate_report()
            
            # Update dashboard
            self.update_dashboard()
            
            time.sleep(interval)
    
    def check_alerts(self, arch_metrics, pattern_check, dep_health):
        """Check for architecture degradation alerts"""
        # Complexity threshold
        if arch_metrics['complexity'] > 100:
            self.alerts.append({
                'type': 'HIGH_COMPLEXITY',
                'message': f"Architecture complexity ({arch_metrics['complexity']}) exceeds threshold",
                'timestamp': datetime.now()
            })
        
        # Pattern violations
        if pattern_check['violations']:
            for violation in pattern_check['violations']:
                self.alerts.append({
                    'type': 'PATTERN_VIOLATION',
                    'message': f"Pattern violation: {violation['description']}",
                    'timestamp': datetime.now()
                })
        
        # Circular dependencies
        if dep_health['circular_dependencies']:
            self.alerts.append({
                'type': 'CIRCULAR_DEPENDENCY',
                'message': f"Found {len(dep_health['circular_dependencies'])} circular dependencies",
                'timestamp': datetime.now()
            })
    
    def generate_report(self):
        """Generate architecture health report"""
        print("Generating architecture health report...")
        
        subprocess.run([
            'claude', 'report', 'architecture',
            '--include-trends',
            '--format', 'html',
            '--output', f'architecture-report-{datetime.now().strftime("%Y%m%d-%H%M%S")}.html'
        ])
    
    def update_dashboard(self):
        """Update monitoring dashboard"""
        # Create visualization
        fig, axes = plt.subplots(2, 2, figsize=(12, 8))
        
        # Complexity trend
        axes[0, 0].plot(self.metrics_history['complexity'])
        axes[0, 0].set_title('Architecture Complexity')
        axes[0, 0].set_xlabel('Time')
        axes[0, 0].set_ylabel('Complexity Score')
        
        # Coupling trend
        axes[0, 1].plot(self.metrics_history['coupling'])
        axes[0, 1].set_title('Component Coupling')
        axes[0, 1].set_xlabel('Time')
        axes[0, 1].set_ylabel('Coupling Score')
        
        # Cohesion trend
        axes[1, 0].plot(self.metrics_history['cohesion'])
        axes[1, 0].set_title('Component Cohesion')
        axes[1, 0].set_xlabel('Time')
        axes[1, 0].set_ylabel('Cohesion Score')
        
        # Recent alerts
        axes[1, 1].text(0.1, 0.9, 'Recent Alerts:', fontsize=12, fontweight='bold')
        alert_text = '\\n'.join([f"- {a['type']}: {a['message'][:30]}..." 
                                for a in self.alerts[-5:]])
        axes[1, 1].text(0.1, 0.7, alert_text, fontsize=10)
        axes[1, 1].axis('off')
        
        plt.tight_layout()
        plt.savefig('architecture-dashboard.png')
        plt.close()
        
        print("Dashboard updated: architecture-dashboard.png")

# Start monitoring
if __name__ == "__main__":
    monitor = ArchitectureMonitor()
    monitor.monitor_loop()`,
      explanation: 'Een Python monitoring script dat continu de architectuur analyseert, metrics bijhoudt, en waarschuwingen genereert bij architectuur degradatie.'
    }
  ],
  assignments: [
    {
      id: 'assignment-2-2-1',
      title: 'Architectuur Analyse van een Bestaand Project',
      description: 'Gebruik Claude Code om een complete architectuuranalyse uit te voeren van een open-source project naar keuze. Genereer documentatie en identificeer verbeterpunten.',
      difficulty: 'medium',
      type: 'project',
      initialCode: `# Kies een open-source project (bijvoorbeeld: https://github.com/facebook/react)
# Clone het project lokaal
git clone [PROJECT_URL]
cd [PROJECT_NAME]

# Voer hier je architectuur analyse uit
# TODO: Implementeer de volgende stappen:
# 1. Basis architectuur analyse
# 2. Pattern detectie
# 3. Dependency mapping
# 4. Data flow analyse
# 5. Genereer diagrammen
# 6. Maak een samenvattend rapport`,
      solution: `# Voorbeeld oplossing voor React project analyse
git clone https://github.com/facebook/react.git
cd react

# 1. Basis architectuur analyse
claude analyze architecture --depth deep --output reports/architecture.json

# 2. Pattern detectie
claude detect patterns --all > reports/patterns.txt
claude detect patterns --type structural --analyze-quality

# 3. Dependency mapping
claude map dependencies --interactive
claude map dependencies --show-circular > reports/circular-deps.txt
claude analyze relationships --metrics coupling > reports/coupling-metrics.txt

# 4. Data flow analyse
claude trace dataflow --entry packages/react/src/React.js
claude analyze dataflow --performance > reports/performance.txt

# 5. Genereer diagrammen
mkdir diagrams
claude generate diagram --type component --output diagrams/components.svg
claude generate diagram --type package --output diagrams/packages.png
claude generate diagram --type class --package react-dom --output diagrams/react-dom-classes.svg

# 6. Samenvattend rapport
claude report architecture --comprehensive --include-all \\
  --metrics reports/architecture.json \\
  --patterns reports/patterns.txt \\
  --dependencies reports/circular-deps.txt \\
  --performance reports/performance.txt \\
  --format html \\
  --output react-architecture-analysis.html

# Bonus: Architecture Decision Records
claude adr extract --from-commits --output adrs/`,
      hints: [
        'Begin met een high-level analyse voordat je in details duikt',
        'Gebruik --json output voor gestructureerde data die je later kunt verwerken',
        'Focus op één aspect tegelijk (patterns, dependencies, etc.)',
        'Genereer visualisaties om complexe relaties beter te begrijpen'
      ]
    },
    {
      id: 'assignment-2-2-2',
      title: 'Creëer een Architecture Monitoring Dashboard',
      description: 'Bouw een monitoring systeem dat continu de architectuur van je project analyseert en waarschuwt bij degradatie.',
      difficulty: 'hard',
      type: 'code',
      initialCode: `// Implementeer een architecture monitoring systeem
// Requirements:
// 1. Periodieke architecture scans (elke 15 minuten)
// 2. Track metrics: complexity, coupling, cohesion
// 3. Alert bij pattern violations
// 4. Genereer trend visualisaties
// 5. Export rapporten

const architectureMonitor = {
  // TODO: Implementeer monitoring logica
};

// Start de monitor
architectureMonitor.start();`,
      solution: `const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const express = require('express');
const WebSocket = require('ws');

class ArchitectureMonitor {
  constructor(config = {}) {
    this.interval = config.interval || 15 * 60 * 1000; // 15 minutes
    this.thresholds = config.thresholds || {
      complexity: 100,
      coupling: 0.7,
      cohesion: 0.3
    };
    this.metrics = [];
    this.alerts = [];
    this.app = express();
    this.setupServer();
  }

  async analyzeArchitecture() {
    console.log(\`[\${new Date().toISOString()}] Running architecture analysis...\`);
    
    const metrics = {};
    
    // Run various analyses
    const analyses = [
      { cmd: 'claude analyze architecture --metrics --json', key: 'architecture' },
      { cmd: 'claude detect patterns --check-violations --json', key: 'patterns' },
      { cmd: 'claude map dependencies --metrics --json', key: 'dependencies' },
      { cmd: 'claude analyze dataflow --performance --json', key: 'dataflow' }
    ];

    for (const analysis of analyses) {
      try {
        const result = await this.executeCommand(analysis.cmd);
        metrics[analysis.key] = JSON.parse(result);
      } catch (error) {
        console.error(\`Error in \${analysis.key} analysis:\`, error);
      }
    }

    // Calculate combined metrics
    const currentMetrics = {
      timestamp: new Date(),
      complexity: metrics.architecture?.complexity || 0,
      coupling: metrics.dependencies?.avgCoupling || 0,
      cohesion: metrics.architecture?.avgCohesion || 0,
      patternViolations: metrics.patterns?.violations?.length || 0,
      circularDeps: metrics.dependencies?.circularDependencies?.length || 0
    };

    this.metrics.push(currentMetrics);
    this.checkThresholds(currentMetrics);
    
    // Broadcast to connected clients
    this.broadcast({ type: 'metrics', data: currentMetrics });
    
    return currentMetrics;
  }

  checkThresholds(metrics) {
    // Complexity check
    if (metrics.complexity > this.thresholds.complexity) {
      this.addAlert({
        type: 'HIGH_COMPLEXITY',
        severity: 'warning',
        message: \`Architecture complexity (\${metrics.complexity}) exceeds threshold (\${this.thresholds.complexity})\`,
        value: metrics.complexity
      });
    }

    // Coupling check
    if (metrics.coupling > this.thresholds.coupling) {
      this.addAlert({
        type: 'HIGH_COUPLING',
        severity: 'warning',
        message: \`Average coupling (\${metrics.coupling.toFixed(2)}) exceeds threshold (\${this.thresholds.coupling})\`,
        value: metrics.coupling
      });
    }

    // Pattern violations
    if (metrics.patternViolations > 0) {
      this.addAlert({
        type: 'PATTERN_VIOLATIONS',
        severity: 'error',
        message: \`Found \${metrics.patternViolations} pattern violations\`,
        value: metrics.patternViolations
      });
    }

    // Circular dependencies
    if (metrics.circularDeps > 0) {
      this.addAlert({
        type: 'CIRCULAR_DEPENDENCIES',
        severity: 'error',
        message: \`Found \${metrics.circularDeps} circular dependencies\`,
        value: metrics.circularDeps
      });
    }
  }

  addAlert(alert) {
    alert.timestamp = new Date();
    this.alerts.push(alert);
    this.broadcast({ type: 'alert', data: alert });
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }

  async generateReport() {
    const report = {
      generatedAt: new Date(),
      summary: {
        totalScans: this.metrics.length,
        currentMetrics: this.metrics[this.metrics.length - 1],
        alerts: this.alerts.length,
        criticalAlerts: this.alerts.filter(a => a.severity === 'error').length
      },
      trends: this.calculateTrends(),
      recentAlerts: this.alerts.slice(-10)
    };

    // Generate HTML report
    const html = this.generateHTMLReport(report);
    const filename = \`architecture-report-\${Date.now()}.html\`;
    await fs.writeFile(filename, html);
    
    // Also run Claude's comprehensive report
    await this.executeCommand(
      \`claude report architecture --comprehensive --format pdf --output \${filename.replace('.html', '.pdf')}\`
    );
    
    return filename;
  }

  calculateTrends() {
    if (this.metrics.length < 2) return null;
    
    const recent = this.metrics.slice(-10);
    const older = this.metrics.slice(-20, -10);
    
    return {
      complexity: this.calculateTrend(older, recent, 'complexity'),
      coupling: this.calculateTrend(older, recent, 'coupling'),
      cohesion: this.calculateTrend(older, recent, 'cohesion')
    };
  }

  calculateTrend(older, recent, metric) {
    const oldAvg = older.reduce((sum, m) => sum + m[metric], 0) / older.length;
    const recentAvg = recent.reduce((sum, m) => sum + m[metric], 0) / recent.length;
    const change = ((recentAvg - oldAvg) / oldAvg) * 100;
    
    return {
      direction: change > 0 ? 'increasing' : 'decreasing',
      percentage: Math.abs(change).toFixed(1)
    };
  }

  setupServer() {
    this.app.use(express.static('public'));
    
    // API endpoints
    this.app.get('/api/metrics', (req, res) => {
      res.json(this.metrics.slice(-100));
    });
    
    this.app.get('/api/alerts', (req, res) => {
      res.json(this.alerts);
    });
    
    this.app.post('/api/analyze', async (req, res) => {
      const metrics = await this.analyzeArchitecture();
      res.json(metrics);
    });
    
    this.app.post('/api/report', async (req, res) => {
      const filename = await this.generateReport();
      res.json({ filename });
    });
    
    // WebSocket for real-time updates
    const server = this.app.listen(3001, () => {
      console.log('Architecture Monitor running on http://localhost:3001');
    });
    
    this.wss = new WebSocket.Server({ server });
    this.wss.on('connection', (ws) => {
      ws.send(JSON.stringify({ 
        type: 'init', 
        data: { 
          metrics: this.metrics.slice(-20),
          alerts: this.alerts.slice(-10)
        }
      }));
    });
  }

  broadcast(message) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  executeCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) reject(error);
        else resolve(stdout);
      });
    });
  }

  generateHTMLReport(report) {
    return \`<!DOCTYPE html>
<html>
<head>
  <title>Architecture Report - \${report.generatedAt.toLocaleString()}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .metric { display: inline-block; margin: 20px; padding: 20px; border: 1px solid #ddd; }
    .alert { padding: 10px; margin: 10px 0; border-left: 4px solid; }
    .alert.error { border-color: #f44336; background: #ffebee; }
    .alert.warning { border-color: #ff9800; background: #fff3e0; }
  </style>
</head>
<body>
  <h1>Architecture Health Report</h1>
  <p>Generated: \${report.generatedAt.toLocaleString()}</p>
  
  <h2>Current Metrics</h2>
  <div class="metric">
    <h3>Complexity</h3>
    <p>\${report.summary.currentMetrics.complexity}</p>
  </div>
  <div class="metric">
    <h3>Coupling</h3>
    <p>\${report.summary.currentMetrics.coupling.toFixed(3)}</p>
  </div>
  <div class="metric">
    <h3>Cohesion</h3>
    <p>\${report.summary.currentMetrics.cohesion.toFixed(3)}</p>
  </div>
  
  <h2>Recent Alerts</h2>
  \${report.recentAlerts.map(alert => \`
    <div class="alert \${alert.severity}">
      <strong>\${alert.type}</strong>: \${alert.message}
    </div>
  \`).join('')}
</body>
</html>\`;
  }

  start() {
    console.log('Starting Architecture Monitor...');
    
    // Initial analysis
    this.analyzeArchitecture();
    
    // Schedule periodic analyses
    this.intervalId = setInterval(() => {
      this.analyzeArchitecture();
    }, this.interval);
    
    // Generate report every hour
    this.reportIntervalId = setInterval(() => {
      this.generateReport();
    }, 60 * 60 * 1000);
  }

  stop() {
    clearInterval(this.intervalId);
    clearInterval(this.reportIntervalId);
    this.wss.close();
  }
}

// Create and start monitor
const monitor = new ArchitectureMonitor({
  interval: 15 * 60 * 1000, // 15 minutes
  thresholds: {
    complexity: 100,
    coupling: 0.7,
    cohesion: 0.3
  }
});

monitor.start();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\\nShutting down Architecture Monitor...');
  monitor.stop();
  process.exit(0);
});`,
      hints: [
        'Gebruik WebSockets voor real-time updates naar een dashboard',
        'Sla metrics op in een tijdreeks voor trend analyse',
        'Implementeer verschillende severity levels voor alerts',
        'Maak de thresholds configureerbaar',
        'Overweeg een webhook systeem voor alert notificaties'
      ]
    }
  ],
  resources: [
    {
      title: 'Claude Code Architecture Analysis Guide',
      url: 'https://claude.ai/docs/architecture-analysis',
      type: 'guide'
    },
    {
      title: 'Software Architecture Patterns',
      url: 'https://patterns.claude.ai/architecture',
      type: 'reference'
    },
    {
      title: 'Architecture Decision Records met Claude',
      url: 'https://claude.ai/docs/adr',
      type: 'tutorial'
    }
  ]
};