import type { Lesson } from '@/lib/data/courses';

export const lesson4_4: Lesson = {
  id: 'lesson-4-4',
  title: 'Enterprise Claude Code deployment',
  duration: '45 min',
  content: `
# Enterprise Claude Code Deployment

Een complete gids voor het implementeren van Claude Code op enterprise-schaal, met focus op team collaboration, security, en best practices.

## Team Collaboration Features

### 1. Shared Configurations

Claude Code ondersteunt gedeelde configuraties voor teams via verschillende mechanismen:

#### Centralized Configuration Management
\`\`\`bash
# Initialiseer team configuratie
claude config init --team

# Creëer gedeelde configuratie repository
claude config share --repo git@github.com:company/claude-configs.git

# Sync team configuraties
claude config sync --team
\`\`\`

#### Team Templates
\`\`\`yaml
# .claude/team-config.yaml
team:
  name: "Engineering Team"
  preferences:
    model: claude-3-opus
    language: en
    code-style: company-standard
  
  templates:
    - name: "microservice"
      path: "./templates/microservice"
    - name: "api-endpoint"
      path: "./templates/api"
  
  shared-commands:
    - name: "deploy-staging"
      script: "./scripts/deploy-staging.sh"
    - name: "run-security-scan"
      script: "./scripts/security-scan.sh"
\`\`\`

#### Role-Based Access Control
\`\`\`bash
# Configureer team rollen
claude team roles create --name "senior-dev" --permissions "all"
claude team roles create --name "junior-dev" --permissions "read,suggest"
claude team roles create --name "reviewer" --permissions "read,review,approve"

# Assign rollen aan team members
claude team members add john@company.com --role "senior-dev"
claude team members add jane@company.com --role "reviewer"
\`\`\`

### 2. Collaborative Workflows

#### Code Review Integration
\`\`\`bash
# Initieer Claude-powered code review
claude review --pr 1234 --team

# Configureer automatische review triggers
claude hooks add --event "pull-request" --action "review"

# Team review dashboard
claude review dashboard --team
\`\`\`

#### Shared Knowledge Base
\`\`\`bash
# Creëer team knowledge base
claude knowledge init --team

# Voeg project documentatie toe
claude knowledge add ./docs --type "architecture"
claude knowledge add ./api-specs --type "api-documentation"

# Query team knowledge
claude ask "What's our authentication strategy?" --context team-knowledge
\`\`\`

## Security and Compliance

### 1. Security Configuration

#### API Key Management
\`\`\`bash
# Enterprise key vault integration
claude auth configure --provider vault --url https://vault.company.com

# Roteer API keys automatisch
claude security rotate-keys --schedule "weekly"

# Audit key usage
claude security audit keys --last 30d
\`\`\`

#### Code Security Scanning
\`\`\`yaml
# .claude/security-config.yaml
security:
  pre-commit:
    - scan-secrets: true
    - check-vulnerabilities: true
    - validate-dependencies: true
  
  blocked-operations:
    - delete-production-data
    - modify-security-configs
    - access-sensitive-files
  
  compliance:
    - standard: "SOC2"
    - standard: "GDPR"
    - standard: "HIPAA"
\`\`\`

### 2. Compliance Features

#### Audit Logging
\`\`\`bash
# Enable comprehensive audit logging
claude audit enable --level "detailed"

# Configure log retention
claude audit configure --retention "365d" --storage "s3://audit-logs"

# Generate compliance reports
claude compliance report --standard "SOC2" --period "Q1-2024"
\`\`\`

#### Data Residency Controls
\`\`\`yaml
# .claude/data-residency.yaml
data-residency:
  regions:
    - eu-west-1: ["*.eu.company.com"]
    - us-east-1: ["*.us.company.com"]
  
  restrictions:
    - no-cross-region-data: true
    - encrypt-in-transit: true
    - encrypt-at-rest: true
\`\`\`

## Monitoring and Analytics

### 1. Performance Monitoring

#### Real-time Metrics
\`\`\`bash
# Start monitoring dashboard
claude monitor start --port 3000

# Configure alerts
claude monitor alerts add --metric "response-time" --threshold "5s"
claude monitor alerts add --metric "error-rate" --threshold "5%"

# Export metrics
claude monitor export --format "prometheus" --interval "1m"
\`\`\`

#### Usage Analytics
\`\`\`javascript
// claude-analytics.js
const analytics = {
  // Track command usage
  trackCommand: (command, user, duration) => {
    return {
      command,
      user,
      duration,
      timestamp: new Date().toISOString(),
      model: process.env.CLAUDE_MODEL,
      tokens: calculateTokenUsage()
    }
  },
  
  // Generate team insights
  generateReport: async (period) => {
    const usage = await getUsageData(period)
    return {
      topCommands: getTopCommands(usage),
      activeUsers: getActiveUsers(usage),
      tokenUsage: calculateTotalTokens(usage),
      costEstimate: estimateCost(usage),
      trends: analyzeTrends(usage)
    }
  }
}
\`\`\`

### 2. Team Analytics Dashboard

#### Dashboard Configuration
\`\`\`yaml
# .claude/dashboard-config.yaml
dashboard:
  widgets:
    - type: "usage-chart"
      position: [0, 0]
      size: "large"
    
    - type: "cost-tracker"
      position: [1, 0]
      size: "medium"
    
    - type: "team-leaderboard"
      position: [0, 1]
      size: "medium"
    
    - type: "model-performance"
      position: [1, 1]
      size: "large"
  
  refresh-interval: "30s"
  data-retention: "90d"
\`\`\`

## Best Practices at Scale

### 1. Infrastructure as Code

#### Claude Configuration as Code
\`\`\`terraform
# claude-infrastructure.tf
resource "claude_team" "engineering" {
  name = "engineering-team"
  
  configuration {
    model = "claude-3-opus"
    max_tokens = 4096
    temperature = 0.7
  }
  
  integrations {
    github = true
    gitlab = true
    jira = true
    slack = true
  }
}

resource "claude_policy" "security_policy" {
  name = "enterprise-security"
  
  rules {
    enforce_code_signing = true
    require_2fa = true
    audit_all_operations = true
  }
}
\`\`\`

### 2. Scalability Patterns

#### Load Balancing
\`\`\`yaml
# .claude/load-balancer.yaml
load-balancer:
  strategy: "round-robin"
  
  endpoints:
    - url: "https://claude-1.company.com"
      weight: 3
    - url: "https://claude-2.company.com"
      weight: 2
    - url: "https://claude-3.company.com"
      weight: 1
  
  health-check:
    interval: "10s"
    timeout: "5s"
    path: "/health"
\`\`\`

#### Caching Strategy
\`\`\`javascript
// claude-cache.js
const cacheConfig = {
  // Response caching voor common queries
  responseCache: {
    ttl: 3600, // 1 hour
    maxSize: '1GB',
    strategy: 'LRU'
  },
  
  // Context caching voor projecten
  contextCache: {
    ttl: 86400, // 24 hours
    storage: 'redis',
    compression: true
  },
  
  // Invalidatie strategie
  invalidation: {
    onFileChange: true,
    onConfigChange: true,
    scheduled: '0 2 * * *' // Daily at 2 AM
  }
}
\`\`\`

### 3. Enterprise Integration Patterns

#### CI/CD Integration
\`\`\`yaml
# .github/workflows/claude-ci.yml
name: Claude Code CI/CD

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  claude-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Claude Security Scan
        run: |
          claude security scan --strict
          claude compliance check --standard SOC2
      
      - name: Claude Code Review
        run: |
          claude review --pr \${{ github.event.pull_request.number }}
          claude suggest improvements --auto-commit
      
      - name: Generate Documentation
        run: |
          claude docs generate --format markdown
          claude docs publish --platform confluence
\`\`\`

#### Monitoring Integration
\`\`\`javascript
// monitoring-integration.js
const monitoringIntegration = {
  // Datadog integration
  datadog: {
    apiKey: process.env.DD_API_KEY,
    metrics: [
      'claude.requests.count',
      'claude.response.time',
      'claude.tokens.used',
      'claude.errors.rate'
    ]
  },
  
  // Splunk integration
  splunk: {
    endpoint: process.env.SPLUNK_HEC_URL,
    token: process.env.SPLUNK_HEC_TOKEN,
    index: 'claude-logs'
  },
  
  // Custom alerting
  alerts: {
    highErrorRate: {
      threshold: 0.05,
      action: 'pagerduty',
      severity: 'critical'
    },
    highLatency: {
      threshold: 5000,
      action: 'slack',
      channel: '#claude-alerts'
    }
  }
}
\`\`\`

### 4. Cost Optimization

#### Usage Optimization
\`\`\`bash
# Analyseer token usage patterns
claude analytics tokens --period "last-month" --by-user

# Identificeer optimization opportunities
claude optimize suggest --target "cost"

# Implementeer token budgets
claude budget set --team "engineering" --monthly 1000000
claude budget alert --threshold 80 --notify "team-lead@company.com"
\`\`\`

#### Model Selection Strategy
\`\`\`yaml
# .claude/model-strategy.yaml
model-strategy:
  routing-rules:
    - pattern: "simple-refactor|format|lint"
      model: "claude-instant"
      max-tokens: 1024
    
    - pattern: "architecture|design|complex"
      model: "claude-3-opus"
      max-tokens: 4096
    
    - pattern: "test|documentation"
      model: "claude-3-sonnet"
      max-tokens: 2048
  
  fallback-model: "claude-3-haiku"
  cost-optimization: true
\`\`\`

## Enterprise Deployment Guide

### Phase 1: Planning (Week 1-2)
1. **Assess Requirements**
   - Team size and structure
   - Security requirements
   - Compliance needs
   - Integration points

2. **Design Architecture**
   - Network topology
   - Security zones
   - Backup strategy
   - Disaster recovery

### Phase 2: Pilot (Week 3-4)
1. **Select Pilot Team**
   - 5-10 developers
   - Mix of seniority levels
   - Different use cases

2. **Initial Setup**
   - Basic configuration
   - Initial integrations
   - Monitoring setup

### Phase 3: Rollout (Week 5-8)
1. **Gradual Expansion**
   - Team by team rollout
   - Training sessions
   - Feedback collection

2. **Production Hardening**
   - Security audit
   - Performance tuning
   - Process refinement

### Phase 4: Optimization (Ongoing)
1. **Continuous Improvement**
   - Usage analytics review
   - Cost optimization
   - Feature adoption

2. **Scaling Strategy**
   - Capacity planning
   - Performance monitoring
   - Team expansion

## Conclusie

Enterprise deployment van Claude Code vereist zorgvuldige planning en implementatie. Focus op:
- Team collaboration en shared configurations
- Security en compliance vanaf het begin
- Proactieve monitoring en analytics
- Continue optimalisatie van kosten en performance

Met de juiste aanpak kan Claude Code de productivity van je hele development team significant verhogen.`,
  codeExamples: [
    {
      id: 'enterprise-config',
      title: 'Enterprise Configuration Template',
      language: 'yaml',
      code: `# .claude/enterprise-config.yaml
enterprise:
  organization: "TechCorp"
  
  teams:
    - name: "backend-team"
      lead: "john.doe@techcorp.com"
      members: 15
      permissions:
        - create-resources
        - modify-code
        - deploy-staging
    
    - name: "frontend-team"
      lead: "jane.smith@techcorp.com"
      members: 12
      permissions:
        - modify-ui-code
        - create-components
        - deploy-preview
  
  security:
    authentication:
      provider: "okta"
      mfa: required
      session-timeout: "8h"
    
    encryption:
      at-rest: "AES-256"
      in-transit: "TLS-1.3"
    
    audit:
      enabled: true
      retention: "365d"
      storage: "s3://audit-logs-bucket"
  
  integrations:
    vcs: "github-enterprise"
    ci-cd: "jenkins"
    monitoring: "datadog"
    secrets: "hashicorp-vault"
  
  compliance:
    standards:
      - "SOC2-Type2"
      - "ISO-27001"
      - "GDPR"
    
    automated-checks:
      - dependency-scanning
      - secret-detection
      - vulnerability-assessment`,
      explanation: 'Complete enterprise configuratie template met teams, security, integrations en compliance settings. Deze configuratie dient als basis voor een veilige en schaalbare Claude Code deployment.'
    },
    {
      id: 'monitoring-setup',
      title: 'Monitoring en Analytics Setup',
      language: 'javascript',
      code: `// claude-monitoring.js
import { CloudWatch, Datadog, Prometheus } from './monitoring-providers'

class EnterpriseMonitoring {
  constructor(config) {
    this.providers = this.initializeProviders(config)
    this.metrics = new Map()
    this.alerts = []
  }

  // Initialize monitoring providers
  initializeProviders(config) {
    const providers = {}
    
    if (config.cloudwatch) {
      providers.cloudwatch = new CloudWatch({
        region: config.cloudwatch.region,
        namespace: 'Claude/Enterprise'
      })
    }
    
    if (config.datadog) {
      providers.datadog = new Datadog({
        apiKey: config.datadog.apiKey,
        appKey: config.datadog.appKey
      })
    }
    
    if (config.prometheus) {
      providers.prometheus = new Prometheus({
        pushgateway: config.prometheus.gateway
      })
    }
    
    return providers
  }

  // Track Claude command execution
  async trackCommand(command, metadata) {
    const metric = {
      name: 'claude.command.execution',
      value: 1,
      timestamp: Date.now(),
      dimensions: {
        command: command.name,
        user: metadata.user,
        team: metadata.team,
        model: metadata.model,
        status: command.status
      },
      metrics: {
        duration: command.duration,
        tokens_used: command.tokensUsed,
        cost_estimate: this.calculateCost(command)
      }
    }
    
    // Send to all configured providers
    await Promise.all(
      Object.values(this.providers).map(provider => 
        provider.sendMetric(metric)
      )
    )
    
    // Check for alerts
    await this.checkAlerts(metric)
  }

  // Calculate cost based on model and tokens
  calculateCost(command) {
    const pricing = {
      'claude-3-opus': { input: 0.015, output: 0.075 },
      'claude-3-sonnet': { input: 0.003, output: 0.015 },
      'claude-3-haiku': { input: 0.00025, output: 0.00125 }
    }
    
    const model = command.model || 'claude-3-sonnet'
    const rate = pricing[model]
    
    return {
      input: (command.inputTokens / 1000) * rate.input,
      output: (command.outputTokens / 1000) * rate.output,
      total: ((command.inputTokens / 1000) * rate.input) + 
             ((command.outputTokens / 1000) * rate.output)
    }
  }

  // Configure alerts
  addAlert(config) {
    this.alerts.push({
      name: config.name,
      metric: config.metric,
      condition: config.condition,
      threshold: config.threshold,
      actions: config.actions
    })
  }

  // Check and trigger alerts
  async checkAlerts(metric) {
    for (const alert of this.alerts) {
      if (this.evaluateAlert(alert, metric)) {
        await this.triggerAlert(alert, metric)
      }
    }
  }

  // Generate analytics report
  async generateReport(period) {
    const endTime = Date.now()
    const startTime = endTime - (period * 24 * 60 * 60 * 1000)
    
    const queries = {
      totalCommands: this.queryTotalCommands(startTime, endTime),
      topUsers: this.queryTopUsers(startTime, endTime),
      costByTeam: this.queryCostByTeam(startTime, endTime),
      errorRate: this.queryErrorRate(startTime, endTime),
      performanceMetrics: this.queryPerformance(startTime, endTime)
    }
    
    const results = await Promise.all(
      Object.entries(queries).map(async ([key, query]) => ({
        [key]: await query
      }))
    )
    
    return Object.assign({}, ...results)
  }
}

// Export configured instance
export default new EnterpriseMonitoring({
  cloudwatch: {
    region: process.env.AWS_REGION
  },
  datadog: {
    apiKey: process.env.DD_API_KEY,
    appKey: process.env.DD_APP_KEY
  },
  prometheus: {
    gateway: process.env.PROMETHEUS_GATEWAY
  }
})`,
      explanation: 'Enterprise monitoring setup met support voor multiple providers (CloudWatch, Datadog, Prometheus). Tracks commands, calculeert kosten, en genereert analytics reports voor management insights.'
    },
    {
      id: 'team-workflow',
      title: 'Team Collaboration Workflow',
      language: 'bash',
      code: `#!/bin/bash
# team-claude-workflow.sh

# Enterprise Claude Code Team Workflow Setup

echo "Setting up Claude Code for team collaboration..."

# 1. Initialize team workspace
claude team init --name "engineering" --org "techcorp"

# 2. Configure shared settings
cat > .claude/team-settings.json << EOF
{
  "model": "claude-3-opus",
  "codeStyle": {
    "formatter": "prettier",
    "linter": "eslint",
    "conventions": "@techcorp/code-standards"
  },
  "review": {
    "autoReview": true,
    "requiredApprovals": 2,
    "blockOnFailure": true
  },
  "security": {
    "scanOnCommit": true,
    "blockSecrets": true,
    "requireSignedCommits": true
  }
}
EOF

# 3. Setup team knowledge base
claude knowledge init --team
claude knowledge import ./docs --recursive
claude knowledge import ./architecture --type "diagrams"
claude knowledge index --build

# 4. Configure CI/CD integration
claude ci configure --provider "github-actions"
claude ci add-check --name "security-scan" --required
claude ci add-check --name "code-review" --required
claude ci add-check --name "test-coverage" --min 80

# 5. Setup monitoring and alerts
claude monitor configure --provider "datadog"
claude monitor alert add \
  --name "high-error-rate" \
  --metric "error_rate" \
  --threshold 0.05 \
  --notify "#claude-alerts"

claude monitor alert add \
  --name "budget-warning" \
  --metric "monthly_cost" \
  --threshold 5000 \
  --notify "finance@techcorp.com"

# 6. Create team dashboards
claude dashboard create "engineering-overview" \
  --widget usage-by-team \
  --widget cost-tracking \
  --widget performance-metrics \
  --widget active-users

# 7. Setup automated workflows
claude workflow create "pr-review" << 'EOF'
on:
  pull_request:
    - opened
    - synchronized

steps:
  - name: Security Scan
    run: claude security scan --fail-on-high

  - name: Code Review
    run: claude review --comprehensive

  - name: Generate Tests
    run: claude test generate --coverage-target 80

  - name: Update Documentation
    run: claude docs update --auto-commit
EOF

# 8. Configure team templates
claude template create "microservice" \
  --from "./templates/microservice-template" \
  --variables "name,port,database"

claude template create "api-endpoint" \
  --from "./templates/api-template" \
  --variables "resource,methods,auth"

# 9. Setup role-based access
claude rbac configure << EOF
roles:
  - name: lead-developer
    permissions: ["*"]
  
  - name: senior-developer
    permissions: ["code:*", "review:*", "deploy:staging"]
  
  - name: developer
    permissions: ["code:write", "review:comment"]
  
  - name: intern
    permissions: ["code:read", "review:read"]
EOF

# 10. Initialize team onboarding
claude onboarding create --interactive

echo "Team setup complete! Run 'claude team status' to verify."`,
      explanation: 'Complete bash script voor het opzetten van Claude Code in een team environment. Configureert shared settings, knowledge base, CI/CD, monitoring, en RBAC voor optimale team collaboration.'
    }
  ],
  assignments: [
    {
      id: 'assignment-4-4',
      title: 'Enterprise Deployment Plan',
      description: 'Ontwerp en implementeer een complete enterprise deployment strategie voor Claude Code binnen een fictieve organisatie met 100+ developers.',
      difficulty: 'hard',
      type: 'project',
      initialCode: `# Enterprise Claude Code Deployment Project

## Organisatie: TechCorp International
- 100+ developers verdeeld over 5 teams
- Offices in EU en US (data residency requirements)
- Werkt met microservices architectuur
- Strict security en compliance requirements (SOC2, GDPR)

## Jouw opdracht:

### 1. Deployment Architecture (architecture.yaml)
Ontwerp de complete deployment architectuur including:
- Network topology
- Security zones  
- Load balancing strategy
- Failover planning

### 2. Team Configuration (team-config.yaml)
Configureer:
- Team structuur en hierarchie
- Role-based access control
- Shared resources en templates
- Collaboration workflows

### 3. Security Implementation (security-config.yaml)
Implementeer:
- Authentication en authorization
- Secrets management
- Audit logging
- Compliance checks

### 4. Monitoring Setup (monitoring.js)
Creëer monitoring voor:
- Performance metrics
- Cost tracking
- Usage analytics
- Alert configuration

### 5. Rollout Plan (rollout-plan.md)
Documenteer:
- Phased rollout strategy
- Training programma
- Success metrics
- Risk mitigation

Start hier met je deployment plan:`,
      solution: `# Complete Enterprise Claude Code Deployment Solution

## 1. Deployment Architecture (architecture.yaml)

\`\`\`yaml
# architecture.yaml
infrastructure:
  regions:
    eu-west-1:
      name: "EU Primary"
      vpc: "10.0.0.0/16"
      availability_zones: ["eu-west-1a", "eu-west-1b", "eu-west-1c"]
      
    us-east-1:
      name: "US Primary"
      vpc: "10.1.0.0/16"
      availability_zones: ["us-east-1a", "us-east-1b", "us-east-1c"]
  
  load_balancing:
    global:
      type: "geo-dns"
      health_check: "/health"
      failover: "automatic"
    
    regional:
      type: "application-load-balancer"
      algorithm: "least-connections"
      sticky_sessions: true
  
  compute:
    claude_api_gateway:
      instances: 6
      type: "c5.2xlarge"
      auto_scaling:
        min: 6
        max: 20
        target_cpu: 70
    
    cache_layer:
      type: "redis-cluster"
      nodes: 3
      replication: "multi-az"
    
    monitoring:
      type: "prometheus-grafana"
      retention: "90d"
      
  security:
    network:
      - dmz: "Public subnet for ALB"
      - app: "Private subnet for Claude API"
      - data: "Private subnet for cache/storage"
    
    firewall_rules:
      - allow: "443/tcp from 0.0.0.0/0 to dmz"
      - allow: "8080/tcp from dmz to app"
      - allow: "6379/tcp from app to data"
      - deny: "all other traffic"
\`\`\`

## 2. Team Configuration (team-config.yaml)

\`\`\`yaml
# team-config.yaml
organization:
  name: "TechCorp International"
  
  teams:
    platform-team:
      size: 20
      lead: "alice.johnson@techcorp.com"
      focus: "Core platform services"
      claude_config:
        model: "claude-3-opus"
        max_concurrent: 10
        priority: "high"
      permissions:
        - "admin:*"
        - "deploy:all-environments"
    
    backend-team:
      size: 30
      lead: "bob.smith@techcorp.com"
      focus: "API and microservices"
      claude_config:
        model: "claude-3-opus"
        max_concurrent: 8
        priority: "high"
      permissions:
        - "code:*"
        - "deploy:staging"
        - "review:*"
    
    frontend-team:
      size: 25
      lead: "carol.davis@techcorp.com"
      focus: "Web and mobile apps"
      claude_config:
        model: "claude-3-sonnet"
        max_concurrent: 8
        priority: "medium"
      permissions:
        - "code:frontend"
        - "deploy:preview"
        - "review:frontend"
    
    qa-team:
      size: 15
      lead: "david.wilson@techcorp.com"
      focus: "Testing and quality"
      claude_config:
        model: "claude-3-sonnet"
        max_concurrent: 5
        priority: "medium"
      permissions:
        - "test:*"
        - "review:tests"
        - "report:quality"
    
    devops-team:
      size: 10
      lead: "eve.brown@techcorp.com"
      focus: "Infrastructure and deployment"
      claude_config:
        model: "claude-3-opus"
        max_concurrent: 5
        priority: "high"
      permissions:
        - "infra:*"
        - "deploy:*"
        - "monitor:*"

  shared_resources:
    templates:
      - name: "microservice-template"
        path: "/templates/microservice"
        maintainer: "platform-team"
      
      - name: "react-component"
        path: "/templates/react"
        maintainer: "frontend-team"
    
    knowledge_bases:
      - name: "architecture-docs"
        path: "/knowledge/architecture"
        access: "all-teams"
      
      - name: "api-specifications"
        path: "/knowledge/apis"
        access: "backend,frontend,qa"
    
    workflows:
      code_review:
        trigger: "pull_request"
        steps:
          - security_scan
          - automated_review
          - test_generation
          - documentation_update
        
      deployment:
        trigger: "merge_to_main"
        steps:
          - build_validation
          - integration_tests
          - staging_deploy
          - smoke_tests
\`\`\`

## 3. Security Implementation (security-config.yaml)

\`\`\`yaml
# security-config.yaml
security:
  authentication:
    provider: "okta"
    config:
      domain: "techcorp.okta.com"
      client_id: "\${OKTA_CLIENT_ID}"
      require_mfa: true
      session_timeout: "8h"
      
  authorization:
    type: "rbac"
    roles:
      admin:
        description: "Full system access"
        permissions: ["*"]
        
      lead_developer:
        description: "Team lead access"
        permissions:
          - "code:*"
          - "review:*"
          - "deploy:staging"
          - "monitor:read"
          
      developer:
        description: "Standard developer access"
        permissions:
          - "code:write"
          - "review:own-team"
          - "deploy:preview"
          
      contractor:
        description: "Limited contractor access"
        permissions:
          - "code:read"
          - "code:write:assigned"
          
  secrets_management:
    provider: "hashicorp-vault"
    config:
      url: "https://vault.techcorp.com"
      namespace: "claude"
      auth_method: "oidc"
      
    policies:
      api_keys:
        path: "secret/claude/api-keys"
        rotation: "30d"
        
      certificates:
        path: "pki/claude"
        ttl: "365d"
  
  audit_logging:
    enabled: true
    
    destinations:
      - type: "s3"
        bucket: "techcorp-claude-audit-logs"
        encryption: "AES256"
        retention: "365d"
        
      - type: "splunk"
        endpoint: "\${SPLUNK_HEC_URL}"
        index: "claude_audit"
    
    log_events:
      - authentication
      - authorization
      - code_generation
      - file_modification
      - deployment_action
      - configuration_change
  
  compliance:
    standards:
      soc2:
        controls:
          - access_control
          - encryption
          - monitoring
          - incident_response
          
      gdpr:
        requirements:
          - data_minimization
          - right_to_deletion
          - consent_management
          - data_portability
    
    automated_checks:
      - secret_scanning:
          tool: "trufflehog"
          schedule: "on_commit"
          
      - vulnerability_scanning:
          tool: "snyk"
          schedule: "daily"
          
      - dependency_checking:
          tool: "dependabot"
          schedule: "weekly"
\`\`\`

## 4. Monitoring Setup (monitoring.js)

\`\`\`javascript
// monitoring.js
const { DatadogClient } = require('@datadog/datadog-api-client');
const { CloudWatchClient } = require('@aws-sdk/client-cloudwatch');
const promClient = require('prom-client');

class EnterpriseMonitoring {
  constructor() {
    this.dd = new DatadogClient();
    this.cw = new CloudWatchClient({ region: 'us-east-1' });
    this.register = new promClient.Registry();
    
    this.initializeMetrics();
    this.setupAlerts();
  }

  initializeMetrics() {
    // Performance metrics
    this.responseTime = new promClient.Histogram({
      name: 'claude_response_time_seconds',
      help: 'Claude API response time',
      labelNames: ['team', 'model', 'operation'],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30]
    });

    // Usage metrics
    this.tokenUsage = new promClient.Counter({
      name: 'claude_tokens_total',
      help: 'Total tokens used',
      labelNames: ['team', 'model', 'type']
    });

    // Cost tracking
    this.costMetric = new promClient.Gauge({
      name: 'claude_cost_dollars',
      help: 'Estimated cost in dollars',
      labelNames: ['team', 'model', 'period']
    });

    // Error tracking
    this.errorRate = new promClient.Counter({
      name: 'claude_errors_total',
      help: 'Total errors',
      labelNames: ['team', 'error_type', 'severity']
    });

    // Register all metrics
    [this.responseTime, this.tokenUsage, this.costMetric, this.errorRate]
      .forEach(metric => this.register.registerMetric(metric));
  }

  setupAlerts() {
    this.alerts = [
      {
        name: 'HighErrorRate',
        metric: 'claude_errors_total',
        condition: 'rate > 0.05',
        severity: 'critical',
        notify: ['pagerduty', 'slack:#incidents']
      },
      {
        name: 'HighResponseTime',
        metric: 'claude_response_time_seconds',
        condition: 'p95 > 5',
        severity: 'warning',
        notify: ['slack:#claude-alerts']
      },
      {
        name: 'BudgetAlert80',
        metric: 'claude_cost_dollars',
        condition: 'monthly_total > budget * 0.8',
        severity: 'warning',
        notify: ['email:finance@techcorp.com']
      },
      {
        name: 'BudgetAlert100',
        metric: 'claude_cost_dollars',
        condition: 'monthly_total >= budget',
        severity: 'critical',
        notify: ['email:cto@techcorp.com', 'slack:#leadership']
      }
    ];
  }

  async trackRequest(request) {
    const labels = {
      team: request.team,
      model: request.model,
      operation: request.operation
    };

    // Track response time
    const timer = this.responseTime.startTimer(labels);
    
    try {
      const response = await this.processRequest(request);
      
      // Track token usage
      this.tokenUsage.inc({
        ...labels,
        type: 'input'
      }, request.inputTokens);
      
      this.tokenUsage.inc({
        ...labels,
        type: 'output'
      }, response.outputTokens);

      // Calculate and track cost
      const cost = this.calculateCost(request, response);
      this.costMetric.set({
        ...labels,
        period: 'current_month'
      }, cost);

      // Send to external monitoring
      await this.sendToDatadog(request, response, cost);
      await this.sendToCloudWatch(request, response, cost);

      return response;
    } catch (error) {
      // Track errors
      this.errorRate.inc({
        team: request.team,
        error_type: error.constructor.name,
        severity: this.getErrorSeverity(error)
      });

      throw error;
    } finally {
      timer();
    }
  }

  calculateCost(request, response) {
    const pricing = {
      'claude-3-opus': { input: 15, output: 75 },    // per million tokens
      'claude-3-sonnet': { input: 3, output: 15 },   // per million tokens
      'claude-3-haiku': { input: 0.25, output: 1.25 } // per million tokens
    };

    const modelPricing = pricing[request.model];
    const inputCost = (request.inputTokens / 1_000_000) * modelPricing.input;
    const outputCost = (response.outputTokens / 1_000_000) * modelPricing.output;

    return inputCost + outputCost;
  }

  async generateDashboard() {
    const metrics = await this.register.metrics();
    
    return {
      performance: {
        responseTimeP50: await this.getPercentile('responseTime', 50),
        responseTimeP95: await this.getPercentile('responseTime', 95),
        responseTimeP99: await this.getPercentile('responseTime', 99),
        throughput: await this.getThroughput()
      },
      usage: {
        totalTokens: await this.getTotalTokens(),
        tokensByTeam: await this.getTokensByTeam(),
        tokensByModel: await this.getTokensByModel()
      },
      cost: {
        currentMonth: await this.getCurrentMonthCost(),
        projectedMonth: await this.getProjectedMonthCost(),
        costByTeam: await this.getCostByTeam(),
        costTrend: await this.getCostTrend()
      },
      errors: {
        errorRate: await this.getErrorRate(),
        errorsByType: await this.getErrorsByType(),
        errorTrend: await this.getErrorTrend()
      }
    };
  }
}

module.exports = new EnterpriseMonitoring();
\`\`\`

## 5. Rollout Plan (rollout-plan.md)

\`\`\`markdown
# Claude Code Enterprise Rollout Plan

## Executive Summary
Phased rollout of Claude Code across TechCorp International, targeting 100+ developers across 5 teams over 8 weeks.

## Phase 1: Foundation (Weeks 1-2)

### Week 1: Infrastructure Setup
- [ ] Deploy infrastructure in EU and US regions
- [ ] Configure load balancers and auto-scaling
- [ ] Setup monitoring and logging infrastructure
- [ ] Implement security controls and compliance checks

### Week 2: Integration and Testing
- [ ] Integrate with Okta authentication
- [ ] Configure Vault for secrets management
- [ ] Setup CI/CD pipelines
- [ ] Conduct security audit
- [ ] Performance and load testing

## Phase 2: Pilot Program (Weeks 3-4)

### Pilot Team Selection
- Platform Team: 5 senior developers
- Backend Team: 3 developers
- Frontend Team: 2 developers

### Week 3: Pilot Launch
- [ ] Onboard pilot users
- [ ] Conduct training sessions (2 x 2-hour sessions)
- [ ] Setup feedback channels
- [ ] Daily check-ins with pilot users

### Week 4: Pilot Optimization
- [ ] Analyze usage patterns and feedback
- [ ] Optimize configurations based on data
- [ ] Address identified issues
- [ ] Prepare for wider rollout

## Phase 3: Team Rollout (Weeks 5-7)

### Week 5: Platform and DevOps Teams
- [ ] Full rollout to Platform team (20 developers)
- [ ] Full rollout to DevOps team (10 developers)
- [ ] Team-specific training sessions
- [ ] Setup team dashboards

### Week 6: Backend and QA Teams
- [ ] Rollout to Backend team (30 developers)
- [ ] Rollout to QA team (15 developers)
- [ ] Integration with existing workflows
- [ ] Custom workflow implementation

### Week 7: Frontend Team and Contractors
- [ ] Rollout to Frontend team (25 developers)
- [ ] Limited rollout to contractors (10 developers)
- [ ] Mobile development integration
- [ ] Final adjustments

## Phase 4: Full Production (Week 8)

### Production Readiness
- [ ] All teams fully onboarded
- [ ] Monitoring and alerts configured
- [ ] Runbooks documented
- [ ] Support processes established

### Success Metrics
- **Adoption Rate**: >90% active users within 30 days
- **Productivity**: 25% reduction in code review time
- **Quality**: 15% reduction in bugs reported
- **Cost**: Stay within $50k monthly budget

## Training Program

### Developer Training (4 hours)
1. Claude Code Basics (1 hour)
2. Team Workflows (1 hour)
3. Advanced Features (1 hour)
4. Hands-on Lab (1 hour)

### Team Lead Training (2 hours additional)
1. Monitoring and Analytics
2. Cost Management
3. Team Administration

### Ongoing Support
- Weekly office hours
- Slack channel: #claude-support
- Internal wiki documentation
- Video tutorials library

## Risk Mitigation

### Technical Risks
- **Risk**: API rate limiting
  - **Mitigation**: Implement caching and request queuing
  
- **Risk**: Model availability
  - **Mitigation**: Fallback to alternative models

### Organizational Risks
- **Risk**: Low adoption
  - **Mitigation**: Executive sponsorship, success stories
  
- **Risk**: Budget overrun
  - **Mitigation**: Usage monitoring, team quotas

### Security Risks
- **Risk**: Data leakage
  - **Mitigation**: DLP policies, audit logging
  
- **Risk**: Unauthorized access
  - **Mitigation**: MFA, regular access reviews

## Communication Plan

### Stakeholders
- **Executive Team**: Weekly status reports
- **Team Leads**: Daily standups during rollout
- **Developers**: Regular updates via Slack
- **Security Team**: Audit reports

### Channels
- Email: Weekly newsletter
- Slack: Real-time updates
- Town Halls: Monthly presentations
- Wiki: Documentation and FAQs

## Post-Rollout

### Month 1
- Daily monitoring of adoption metrics
- Weekly optimization reviews
- Continuous feedback collection

### Month 2-3
- Monthly business reviews
- Quarterly planning sessions
- ROI analysis

### Ongoing
- Continuous improvement
- Feature adoption tracking
- Cost optimization
\`\`\``,
      hints: [
        'Begin met een grondige analyse van de organisatie requirements',
        'Ontwerp voor high availability met geo-redundancy',
        'Implementeer defense-in-depth security strategie',
        'Plan voor gradual rollout met duidelijke success metrics',
        'Vergeet training en change management niet'
      ]
    }
  ]
};