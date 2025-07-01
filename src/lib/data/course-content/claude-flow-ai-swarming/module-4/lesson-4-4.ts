import type { Lesson } from '@/lib/data/courses';

export const lesson44: Lesson = {
  id: 'lesson-4-4',
  title: 'Production deployment best practices',
  duration: '45 min',
  content: `
# Production Deployment Best Practices

## Deployment Architecture Patterns

### Multi-Region Deployment
\`\`\`yaml
# kubernetes/multi-region-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: claude-flow-swarm
spec:
  replicas: 3
  selector:
    matchLabels:
      app: claude-flow
  template:
    spec:
      topologySpreadConstraints:
      - maxSkew: 1
        topologyKey: topology.kubernetes.io/zone
        whenUnsatisfiable: DoNotSchedule
      containers:
      - name: orchestrator
        image: claude-flow:v2.0.0
        resources:
          requests:
            memory: "4Gi"
            cpu: "2"
          limits:
            memory: "8Gi"
            cpu: "4"
\`\`\`

## Zero-Downtime Deployment Strategies

### Blue-Green Deployment
\`\`\`typescript
export class BlueGreenDeployer {
  async deploy(version: string): Promise<DeploymentResult> {
    // Deploy green environment
    await this.deployGreenEnvironment(version);
    
    // Health check and warm-up
    await this.warmUpEnvironment('green');
    
    // Gradual traffic shift
    await this.performTrafficShift();
    
    // Monitor and validate
    const valid = await this.validateDeployment('green');
    
    if (valid) {
      await this.completeSwitchover();
      await this.cleanupBlueEnvironment();
    } else {
      await this.rollbackDeployment();
    }
  }
}
\`\`\`

### Canary Deployment
\`\`\`typescript
class CanaryDeployer {
  async deployCanary(version: string, percentage: number = 5) {
    // Deploy canary pods
    await this.deployCanaryPods(version, percentage);
    
    // Monitor canary metrics
    const metrics = await this.monitorCanary(3600); // 1 hour
    
    if (this.analyzeMetrics(metrics).healthy) {
      await this.promoteCanary(version);
    } else {
      await this.rollbackCanary();
    }
  }
}
\`\`\`

## Configuration Management

### Secure Configuration
\`\`\`typescript
export class ConfigurationManager {
  async loadConfiguration(env: string): Promise<SwarmConfig> {
    const config = {
      deployment: await this.loadDeploymentConfig(env),
      security: await this.loadSecurityConfig(env),
      swarm: await this.loadSwarmConfig(env),
      monitoring: await this.loadMonitoringConfig(env)
    };
    
    await this.validateConfiguration(config);
    await this.updateConfigMap(env, config);
    
    return config;
  }
}
\`\`\`

## Security Best Practices

### Secure Communication
\`\`\`typescript
export class SecureCommunication {
  async encryptMessage(message: any, recipientId: string): Promise<string> {
    const key = await this.keyStore.get(recipientId);
    
    const jwe = await JWE.createEncrypt({
      format: 'compact',
      contentAlg: 'A256GCM',
      fields: { alg: 'RSA-OAEP-256' }
    }, key).update(JSON.stringify(message)).final();
    
    return jwe;
  }
  
  async setupMutualTLS() {
    return {
      ca: await this.loadCA(),
      cert: await this.loadCert(),
      key: await this.loadKey(),
      rejectUnauthorized: true
    };
  }
}
\`\`\`

### Compliance and Audit
\`\`\`typescript
export class AuditLogger {
  async logDeploymentEvent(event: DeploymentEvent) {
    const entry = {
      timestamp: new Date().toISOString(),
      eventType: event.type,
      actor: event.actor,
      resource: event.resource,
      action: event.action,
      result: event.result,
      hash: await this.calculateHash(event)
    };
    
    await this.immutableStorage.append(entry);
    
    if (process.env.SIEM_ENDPOINT) {
      await this.sendToSIEM(entry);
    }
  }
}
\`\`\`

## Disaster Recovery

### Automated Recovery
\`\`\`typescript
export class RecoveryOrchestrator {
  async handleFailure(event: FailureEvent) {
    switch (event.severity) {
      case 'critical':
        await this.initiateEmergencyFailover();
        break;
      case 'high':
        await this.performPartialFailover();
        break;
      case 'medium':
        await this.attemptRecovery();
        break;
    }
  }
  
  async initiateEmergencyFailover() {
    // Activate DR site
    await this.failoverController.activateDRSite();
    
    // Redirect traffic
    await this.updateGlobalLoadBalancer('dr-region');
    
    // Restore from backup
    const backup = await this.backupManager.getLatest();
    await this.restoreFromBackup(backup);
    
    // Verify health
    await this.verifySystemHealth();
  }
}
\`\`\`

## CI/CD Pipeline

### Production Pipeline
\`\`\`yaml
name: Production Deployment

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          
  deploy-production:
    needs: [security-scan, test]
    runs-on: ubuntu-latest
    steps:
      - name: Deploy with blue-green
        run: |
          ./scripts/blue-green-deploy.sh \${{ github.ref_name }}
      
      - name: Verify deployment
        run: |
          ./scripts/verify-deployment.sh
\`\`\``,
  codeExamples: [
    {
      id: 'enterprise-deployment-configuration',
      title: 'Enterprise Deployment Configuration',
      language: 'typescript',
      code: `export interface EnterpriseDeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  regions: string[];
  highAvailability: {
    enabled: boolean;
    minReplicas: number;
    maxReplicas: number;
  };
  security: {
    encryption: {
      enabled: boolean;
      algorithm: string;
      keyRotationDays: number;
    };
    authentication: {
      provider: string;
      mfaRequired: boolean;
    };
  };
  monitoring: {
    prometheus: PrometheusConfig;
    logging: LoggingConfig;
    tracing: TracingConfig;
  };
  backup: {
    enabled: boolean;
    schedule: string;
    retention: number;
  };
}

export class EnterpriseDeployer {
  async deploy(version: string): Promise<DeploymentResult> {
    // Pre-deployment checks
    await this.runPreDeploymentChecks();
    
    // Deploy to all regions
    const deployments = await Promise.all(
      this.config.regions.map(region => 
        this.deployToRegion(region, version)
      )
    );
    
    // Configure global load balancing
    await this.configureGlobalLoadBalancing(deployments);
    
    // Setup monitoring
    await this.setupMonitoring(version);
    
    return {
      version,
      regions: deployments,
      timestamp: new Date().toISOString()
    };
  }
}`
    },
    {
      id: 'zero-downtime-update-process',
      title: 'Zero-Downtime Update Process',
      language: 'bash',
      code: `#!/bin/bash
# Zero-downtime update script

VERSION=$1
ENVIRONMENT=$2

# Pre-update backup
./scripts/backup-swarm-state.sh $ENVIRONMENT

# Create green deployment
kubectl apply -f k8s/$ENVIRONMENT/deployment-green.yaml

# Update with new version
kubectl set image deployment/claude-flow-green \\
  claude-flow=gcr.io/claude-flow/claude-flow:$VERSION

# Health check
if ! check_swarm_health "green"; then
  kubectl delete deployment claude-flow-green
  exit 1
fi

# Gradual traffic shift
for percentage in 10 25 50 75 100; do
  echo "Shifting $percentage% traffic to green"
  kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: claude-flow-vs
spec:
  http:
  - route:
    - destination:
        host: claude-flow-blue
      weight: $((100 - percentage))
    - destination:
        host: claude-flow-green
      weight: $percentage
EOF
  
  # Monitor for issues
  if ! monitor_update "claude-flow-green" 60; then
    kubectl apply -f k8s/$ENVIRONMENT/virtualservice-blue.yaml
    kubectl delete deployment claude-flow-green
    exit 1
  fi
done

# Complete switchover
kubectl delete deployment claude-flow-blue
kubectl label deployment claude-flow-green environment=blue --overwrite`
    },
    {
      id: 'disaster-recovery-automation',
      title: 'Disaster Recovery Automation',
      language: 'typescript',
      code: `export class DisasterRecoveryAutomation extends EventEmitter {
  private recoveryInProgress = false;

  async initiateDisasterRecovery(event: FailureEvent): Promise<RecoveryResult> {
    this.recoveryInProgress = true;
    
    try {
      // Assess damage
      const assessment = await this.assessDamage(event);
      
      // Determine strategy
      const strategy = this.determineRecoveryStrategy(assessment);
      
      // Execute recovery
      const result = await this.executeRecovery(strategy);
      
      // Verify recovery
      await this.verifyRecovery(result);
      
      // Update documentation
      await this.updateRecoveryDocumentation(event, result);
      
      return {
        success: true,
        recoveryTime: Date.now() - event.timestamp,
        strategy,
        result
      };
    } finally {
      this.recoveryInProgress = false;
    }
  }

  private async executeRecovery(strategy: RecoveryStrategy) {
    switch (strategy.type) {
      case 'full-restore':
        return await this.performFullRestore();
      case 'failover':
        return await this.performFailover(strategy.target);
      case 'rebuild':
        return await this.performRebuild();
    }
  }
  
  private async performFullRestore() {
    const backup = await this.backupManager.getLatestVerified();
    
    await this.prepareRestoreEnvironment();
    await Promise.all([
      this.restoreConfiguration(backup),
      this.restoreSwarmState(backup),
      this.restoreAgentMemory(backup)
    ]);
    
    await this.restartServices();
    await this.verifySystemIntegrity();
  }
}`
    }
  ],
  assignments: [
    {
      id: 'assignment-4-4-1',
      title: 'Ontwerp een enterprise deployment strategie',
      description: 'Creëer een complete deployment strategie voor een global AI swarm system met multi-region support, zero-downtime updates, en disaster recovery.',
      type: 'project',
      difficulty: 'hard',
      checklist: [
        'Design multi-region architecture',
        'Plan blue-green deployment process',
        'Create disaster recovery runbooks',
        'Setup security compliance',
        'Design monitoring strategy',
        'Document rollback procedures'
      ]
    },
    {
      id: 'assignment-4-4-2',
      title: 'Implementeer een zero-downtime update proces',
      description: 'Bouw een volledig geautomatiseerd update systeem met canary deployment, health checks, en automatic rollback.',
      type: 'project',
      difficulty: 'hard',
      checklist: [
        'Implement canary deployment logic',
        'Add comprehensive health checks',
        'Create traffic management system',
        'Build rollback automation',
        'Add deployment verification',
        'Test failure scenarios'
      ]
    }
  ],
  resources: [
    {
      title: 'Kubernetes Best Practices',
      type: 'book',
      url: 'https://kubernetes.io/docs/concepts/configuration/overview/'
    },
    {
      title: 'Zero Trust Security Model',
      type: 'guide',
      url: 'https://www.nist.gov/publications/zero-trust-architecture'
    },
    {
      title: 'Site Reliability Engineering',
      type: 'book',
      url: 'https://sre.google/books/'
    }
  ]
};