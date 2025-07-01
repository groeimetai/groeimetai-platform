import { Lesson } from '@/lib/data/courses';

export const lesson31: Lesson = {
  id: 'lesson-3-1',
  title: 'Multi-Agent Architectures',
  duration: '90 min',
  hasInteractivePlayground: true,
  playgroundConfig: {
    title: 'Live Multi-Agent Architecture Demo',
    initialCode: `// Dutch E-commerce Multi-Agent Swarm Example
const ecommerceSwarm = new ClaudeFlowSwarm({
  name: 'BolComNextGen',
  architecture: 'hierarchical',
  agents: [
    { role: 'director', level: 1, capabilities: ['strategic_planning', 'resource_allocation'] },
    { role: 'payment_lead', level: 2, capabilities: ['ideal_integration', 'klarna_api'] },
    { role: 'logistics_lead', level: 2, capabilities: ['postnl_api', 'dhl_integration'] },
    { role: 'developer', level: 3, capabilities: ['api_development', 'testing'] }
  ]
});

// Execute coordinated task
await ecommerceSwarm.execute({
  objective: 'Launch sustainable marketplace',
  requirements: ['Payment integration', 'Shipping setup', 'GDPR compliance']
});`,
    endpoint: '/api/claude-flow/swarm',
    features: ['realTimeMonitoring', 'agentCommunication', 'taskDistribution']
  },
  content: `
# Multi-Agent Architectures

Learn practical patterns for designing and implementing multi-agent systems with hierarchical structures, communication protocols, and task distribution algorithms.

## 🏗️ Hierarchical Agent Design

### Core Principles

Hierarchical architectures organize agents in levels of authority and responsibility, enabling efficient coordination for complex tasks.

\`\`\`javascript
class HierarchicalAgentSystem {
  constructor(config) {
    this.config = config;
    this.levels = new Map();
    this.communicationChannels = new Map();
  }

  async createHierarchy(structure) {
    // Level 1: Executive Agents
    const executive = await this.spawnAgent('orchestrator', {
      name: 'Executive_Director',
      level: 1,
      capabilities: ['strategic_planning', 'resource_allocation', 'decision_making'],
      maxSubordinates: 5
    });

    // Level 2: Manager Agents
    const managers = await Promise.all([
      this.spawnAgent('architect', {
        name: 'Technical_Manager',
        level: 2,
        capabilities: ['technical_leadership', 'architecture_design'],
        reportsTo: executive.id
      }),
      this.spawnAgent('specialist', {
        name: 'Business_Manager',
        level: 2,
        capabilities: ['business_analysis', 'requirement_gathering'],
        reportsTo: executive.id
      })
    ]);

    // Level 3: Worker Agents
    const workers = await this.createWorkerAgents(managers);

    return { executive, managers, workers };
  }

  async delegateTask(task, startLevel = 1) {
    const agent = this.levels.get(startLevel)[0];
    
    // Analyze task complexity
    const analysis = await agent.analyzeTask(task);
    
    if (analysis.canHandle) {
      return await agent.execute(task);
    }
    
    // Delegate to subordinates
    const subtasks = await agent.decomposeTask(task);
    const delegations = await agent.delegateSubtasks(subtasks);
    
    // Aggregate results
    const results = await Promise.all(delegations);
    return await agent.aggregateResults(results);
  }
}
\`\`\`

### Dutch E-commerce Implementation

\`\`\`javascript
class DutchEcommerceSwarm {
  constructor() {
    this.config = {
      name: 'BolComNextGen',
      market: 'Netherlands',
      compliance: ['GDPR', 'Dutch Consumer Law', 'EU Regulations']
    };
  }

  async buildEcommerceHierarchy() {
    // CTO at the top
    const cto = await this.spawnAgent('orchestrator', {
      name: 'CTO',
      level: 1,
      responsibilities: ['Platform strategy', 'Team coordination']
    });

    // Department heads
    const heads = {
      engineering: await this.spawnAgent('architect', {
        name: 'Engineering_Head',
        level: 2,
        reportsTo: cto,
        manages: ['backend', 'frontend', 'devops']
      }),
      payments: await this.spawnAgent('specialist', {
        name: 'Payment_Head',
        level: 2,
        reportsTo: cto,
        expertise: ['iDEAL', 'Klarna', 'AfterPay']
      }),
      logistics: await this.spawnAgent('coordinator', {
        name: 'Logistics_Head',
        level: 2,
        reportsTo: cto,
        integrations: ['PostNL', 'DHL', 'DPD']
      })
    };

    // Team members
    const teams = await this.createTeams(heads);

    return { cto, heads, teams };
  }

  async executeMarketplaceLaunch() {
    const hierarchy = await this.buildEcommerceHierarchy();
    
    // Top-down task distribution
    const launchPlan = await hierarchy.cto.createLaunchPlan({
      objective: 'Launch sustainable product marketplace',
      timeline: '3 months',
      budget: '€500,000'
    });

    // Parallel execution by departments
    const results = await Promise.all([
      hierarchy.heads.engineering.implement(launchPlan.technical),
      hierarchy.heads.payments.setupPayments(launchPlan.payments),
      hierarchy.heads.logistics.configureShipping(launchPlan.logistics)
    ]);

    return await hierarchy.cto.consolidateResults(results);
  }
}
\`\`\`

## 📡 Communication Protocols

### Message-Based Protocol

\`\`\`javascript
class AgentCommunicationProtocol {
  constructor() {
    this.messageTypes = {
      TASK: { priority: 2, timeout: 30000 },
      QUERY: { priority: 3, timeout: 10000 },
      ALERT: { priority: 1, timeout: 5000 },
      REPORT: { priority: 4, timeout: 60000 }
    };
    this.messageQueue = new PriorityQueue();
  }

  async sendMessage(from, to, content, type = 'TASK') {
    const message = {
      id: crypto.randomUUID(),
      from: from.id,
      to: to.id,
      type,
      content,
      priority: this.messageTypes[type].priority,
      timestamp: Date.now()
    };

    // Route based on recipient type
    if (to.id === 'broadcast') {
      return await this.broadcast(message);
    } else if (Array.isArray(to)) {
      return await this.multicast(message, to);
    } else {
      return await this.unicast(message, to);
    }
  }

  async handleMessage(agent, message) {
    // Priority-based handling
    switch (message.type) {
      case 'ALERT':
        return await agent.handleAlert(message);
      case 'TASK':
        return await agent.queueTask(message);
      case 'QUERY':
        return await agent.processQuery(message);
      case 'REPORT':
        return await agent.storeReport(message);
    }
  }
}
\`\`\`

### Event-Driven Protocol

\`\`\`javascript
class EventDrivenProtocol {
  constructor() {
    this.eventBus = new EventEmitter();
    this.subscriptions = new Map();
  }

  setupEventHandlers() {
    // Critical events
    this.eventBus.on('system.error', async (event) => {
      await this.handleSystemError(event);
    });

    // Task lifecycle events
    this.eventBus.on('task.created', async (event) => {
      await this.notifyAvailableAgents(event);
    });

    this.eventBus.on('task.completed', async (event) => {
      await this.updateDependencies(event);
      await this.triggerNextTasks(event);
    });

    // Performance events
    this.eventBus.on('agent.overloaded', async (event) => {
      await this.rebalanceLoad(event.agent);
    });
  }

  async publish(eventType, data) {
    const event = {
      type: eventType,
      data,
      timestamp: Date.now(),
      correlationId: crypto.randomUUID()
    };

    await this.eventBus.emit(eventType, event);
    await this.logEvent(event);
  }

  subscribe(agent, eventPattern) {
    const subscription = this.eventBus.on(eventPattern, 
      async (event) => await agent.handleEvent(event)
    );
    
    this.subscriptions.set(agent.id, subscription);
  }
}
\`\`\`

## 🎯 Task Distribution Algorithms

### Load-Balanced Distribution

\`\`\`javascript
class LoadBalancer {
  constructor() {
    this.agentLoad = new Map();
    this.loadThreshold = 0.8;
  }

  async distributeTask(task, agents) {
    // Calculate load scores
    const scores = await this.calculateLoadScores(agents);
    
    // Find best agent
    const bestAgent = this.selectOptimalAgent(scores, task);
    
    // Assign task
    await this.assignTask(bestAgent, task);
    
    // Update load metrics
    this.updateLoad(bestAgent.id, task.estimatedLoad);
    
    return bestAgent;
  }

  calculateLoadScores(agents) {
    return agents.map(agent => {
      const currentLoad = this.agentLoad.get(agent.id) || 0;
      const capacity = agent.maxCapacity || 1.0;
      
      return {
        agent,
        score: 1 - (currentLoad / capacity),
        currentLoad,
        available: currentLoad < this.loadThreshold
      };
    });
  }

  selectOptimalAgent(scores, task) {
    // Filter available agents
    const available = scores.filter(s => s.available);
    
    if (available.length === 0) {
      throw new Error('No agents available');
    }
    
    // Consider task requirements
    const suitable = available.filter(s => 
      this.hasRequiredCapabilities(s.agent, task)
    );
    
    // Select agent with lowest load
    return suitable.sort((a, b) => b.score - a.score)[0].agent;
  }
}
\`\`\`

### Capability-Based Distribution

\`\`\`javascript
class CapabilityMatcher {
  constructor() {
    this.capabilityIndex = new Map();
  }

  async matchTaskToAgents(task, agents) {
    const requirements = this.extractRequirements(task);
    
    // Find capable agents
    const matches = agents.filter(agent => 
      this.meetsRequirements(agent, requirements)
    );

    if (matches.length === 0) {
      // Create agent team
      return await this.assembleTeam(requirements, agents);
    }

    // Rank by capability score
    const ranked = matches.map(agent => ({
      agent,
      score: this.calculateCapabilityScore(agent, requirements)
    }));

    return ranked.sort((a, b) => b.score - a.score)[0].agent;
  }

  assembleTeam(requirements, agents) {
    const team = [];
    const uncovered = new Set(requirements);

    while (uncovered.size > 0) {
      // Find agent covering most requirements
      const best = this.findBestCoverage(agents, uncovered);
      
      if (!best) break;
      
      team.push(best);
      best.capabilities.forEach(cap => uncovered.delete(cap));
    }

    return team;
  }
}
\`\`\`

## 💼 Dutch E-commerce Swarm Example

\`\`\`javascript
class DutchMarketplaceSwarm {
  constructor() {
    this.config = {
      name: 'SustainableMarketplaceNL',
      features: ['iDEAL payments', 'PostNL shipping', 'GDPR compliance']
    };
  }

  async deploySwarm() {
    // Create hierarchical structure
    const hierarchy = await this.createHierarchy();
    
    // Setup communication
    const comms = await this.setupCommunication(hierarchy);
    
    // Initialize task distribution
    const distributor = await this.setupDistribution();
    
    return { hierarchy, comms, distributor };
  }

  async launchMarketplace() {
    const swarm = await this.deploySwarm();
    
    // Phase 1: Setup infrastructure
    const infrastructure = await this.executePhase({
      name: 'Infrastructure Setup',
      tasks: [
        { type: 'backend', agent: 'backend_team', work: 'Setup API servers' },
        { type: 'database', agent: 'devops_team', work: 'Configure PostgreSQL' },
        { type: 'cdn', agent: 'devops_team', work: 'Setup CloudFlare' }
      ]
    });

    // Phase 2: Payment integration
    const payments = await this.executePhase({
      name: 'Payment Integration',
      tasks: [
        { type: 'ideal', agent: 'payment_team', work: 'iDEAL API integration' },
        { type: 'klarna', agent: 'payment_team', work: 'Klarna checkout' },
        { type: 'testing', agent: 'qa_team', work: 'Payment flow testing' }
      ]
    });

    // Phase 3: Logistics setup
    const logistics = await this.executePhase({
      name: 'Logistics Integration',
      tasks: [
        { type: 'postnl', agent: 'logistics_team', work: 'PostNL API setup' },
        { type: 'tracking', agent: 'logistics_team', work: 'Track & trace system' },
        { type: 'labels', agent: 'logistics_team', work: 'Shipping label generation' }
      ]
    });

    return { infrastructure, payments, logistics };
  }

  async executePhase(phase) {
    console.log(\`Starting phase: \${phase.name}\`);
    
    // Distribute tasks using capability matching
    const assignments = await Promise.all(
      phase.tasks.map(task => 
        this.distributor.assignTask(task, this.getAgentsByType(task.agent))
      )
    );

    // Execute in parallel
    const results = await Promise.all(
      assignments.map(a => a.agent.execute(a.task))
    );

    // Report to hierarchy
    await this.reportPhaseCompletion(phase.name, results);
    
    return results;
  }
}

// Usage example
const marketplace = new DutchMarketplaceSwarm();
const deployment = await marketplace.launchMarketplace();
console.log('Marketplace launched:', deployment);
\`\`\`

## 📊 Performance Monitoring

### Real-Time Monitoring System

\`\`\`javascript
class SwarmPerformanceMonitor {
  constructor(swarmName) {
    this.swarmName = swarmName;
    this.metrics = {
      agents: new Map(),
      tasks: new Map(),
      communication: new Map()
    };
    this.thresholds = {
      responseTime: 1000,
      errorRate: 0.05,
      loadFactor: 0.8
    };
  }

  async startMonitoring() {
    // Agent health monitoring
    setInterval(() => this.checkAgentHealth(), 5000);
    
    // Task performance tracking
    setInterval(() => this.analyzeTaskPerformance(), 10000);
    
    // Communication latency
    setInterval(() => this.measureCommunication(), 3000);
  }

  async checkAgentHealth() {
    for (const [agentId, agent] of this.swarm.agents) {
      const health = {
        status: agent.status,
        load: await agent.getCurrentLoad(),
        responseTime: await this.measureResponseTime(agent),
        errorRate: await agent.getErrorRate(),
        timestamp: Date.now()
      };

      this.metrics.agents.set(agentId, health);

      // Alert on issues
      if (health.load > this.thresholds.loadFactor) {
        await this.alert('agent_overloaded', { agentId, load: health.load });
      }
    }
  }

  async analyzeTaskPerformance() {
    const taskMetrics = {
      completed: 0,
      failed: 0,
      avgDuration: 0,
      queueLength: 0
    };

    for (const task of this.swarm.taskQueue) {
      if (task.status === 'completed') {
        taskMetrics.completed++;
        taskMetrics.avgDuration += task.duration;
      } else if (task.status === 'failed') {
        taskMetrics.failed++;
      } else if (task.status === 'queued') {
        taskMetrics.queueLength++;
      }
    }

    taskMetrics.avgDuration /= taskMetrics.completed || 1;
    this.metrics.tasks.set(Date.now(), taskMetrics);
  }

  async generateReport() {
    return {
      swarm: this.swarmName,
      timestamp: Date.now(),
      summary: {
        totalAgents: this.metrics.agents.size,
        healthyAgents: this.countHealthyAgents(),
        taskThroughput: this.calculateThroughput(),
        avgResponseTime: this.calculateAvgResponseTime()
      },
      alerts: this.getActiveAlerts(),
      recommendations: await this.generateRecommendations()
    };
  }
}
\`\`\`

### Performance Optimization

\`\`\`javascript
class PerformanceOptimizer {
  async optimizeSwarm(monitor) {
    const report = await monitor.generateReport();
    const optimizations = [];

    // Agent rebalancing
    if (report.summary.avgResponseTime > 2000) {
      optimizations.push(await this.rebalanceAgents());
    }

    // Task redistribution
    const overloadedAgents = this.findOverloadedAgents(report);
    if (overloadedAgents.length > 0) {
      optimizations.push(await this.redistributeTasks(overloadedAgents));
    }

    // Communication optimization
    if (report.communicationLatency > 100) {
      optimizations.push(await this.optimizeCommunication());
    }

    return optimizations;
  }

  async rebalanceAgents() {
    // Move tasks from overloaded to underutilized agents
    const balanced = await this.loadBalancer.rebalance();
    return { type: 'rebalance', result: balanced };
  }

  async redistributeTasks(overloadedAgents) {
    const redistributed = [];
    
    for (const agent of overloadedAgents) {
      const tasks = await agent.getQueuedTasks();
      const available = await this.findAvailableAgents();
      
      for (const task of tasks.slice(0, Math.floor(tasks.length / 2))) {
        const newAgent = await this.loadBalancer.selectAgent(available);
        await this.transferTask(task, agent, newAgent);
        redistributed.push({ task, from: agent, to: newAgent });
      }
    }
    
    return { type: 'redistribute', result: redistributed };
  }
}
\`\`\`

## 🏆 Best Practices

### Architecture Selection Guide

1. **Hierarchical**: Best for command-and-control scenarios
   - Banking systems
   - Government applications
   - Enterprise workflows

2. **Flat/Peer-to-Peer**: Best for collaborative scenarios
   - Research projects
   - Consensus-based decisions
   - Distributed systems

3. **Hybrid**: Best for complex organizations
   - E-commerce platforms
   - Manufacturing systems
   - Multi-department operations

### Communication Design Principles

- Implement retry mechanisms for network failures
- Use event-driven patterns for loose coupling
- Monitor message queues and latency
- Implement circuit breakers for failing agents

### Task Distribution Strategies

- Balance between capability matching and load distribution
- Implement priority queues for critical tasks
- Monitor and adapt distribution algorithms
- Use predictive analytics for proactive scaling

## 💡 Key Takeaways

1. **Start Simple**: Begin with 3-5 agents and scale incrementally
2. **Monitor Everything**: Comprehensive monitoring from day one
3. **Test Failure Modes**: Simulate agent failures and network issues
4. **Optimize Iteratively**: Continuous performance improvements
5. **Document Patterns**: Create reusable architecture templates

Ready to implement advanced swarm orchestration techniques in Module 4!
  `,
  codeExamples: [
    {
      id: 'complete-hierarchical-system',
      title: 'Complete Hierarchical E-commerce System',
      language: 'javascript',
      code: `// complete-ecommerce-hierarchy.js
import { ClaudeFlow } from '@claude-flow/core';

class DutchEcommerceHierarchy {
  constructor() {
    this.claudeFlow = new ClaudeFlow();
    this.hierarchy = new Map();
  }

  async deployFullHierarchy() {
    console.log('🚀 Deploying Dutch E-commerce Hierarchy...');
    
    // Build organizational structure
    await this.buildOrganization();
    
    // Setup communication channels
    await this.establishCommunication();
    
    // Initialize monitoring
    await this.startMonitoring();
    
    // Execute launch sequence
    return await this.executeLaunch();
  }

  async buildOrganization() {
    // Executive level
    const cto = await this.claudeFlow.spawnAgent('orchestrator', {
      name: 'CTO',
      level: 1,
      maxSubordinates: 5
    });
    
    this.hierarchy.set(1, [cto]);

    // Director level
    const directors = await Promise.all([
      this.claudeFlow.spawnAgent('architect', {
        name: 'Engineering_Director',
        level: 2,
        reportsTo: cto.id
      }),
      this.claudeFlow.spawnAgent('specialist', {
        name: 'Payment_Director',
        level: 2,
        reportsTo: cto.id
      }),
      this.claudeFlow.spawnAgent('coordinator', {
        name: 'Logistics_Director',
        level: 2,
        reportsTo: cto.id
      })
    ]);
    
    this.hierarchy.set(2, directors);

    // Team level
    const teams = await this.createTeams(directors);
    this.hierarchy.set(3, teams);
  }

  async createTeams(directors) {
    const teams = [];
    
    // Engineering teams
    const engTeams = await Promise.all([
      this.claudeFlow.spawnAgent('developer', {
        name: 'Backend_Team',
        reportsTo: directors[0].id,
        skills: ['Node.js', 'PostgreSQL', 'Redis']
      }),
      this.claudeFlow.spawnAgent('developer', {
        name: 'Frontend_Team',
        reportsTo: directors[0].id,
        skills: ['React', 'TypeScript', 'Tailwind']
      })
    ]);
    
    teams.push(...engTeams);
    
    // Payment team
    const paymentTeam = await this.claudeFlow.spawnAgent('specialist', {
      name: 'Payment_Integration_Team',
      reportsTo: directors[1].id,
      expertise: ['iDEAL', 'Klarna', 'Stripe']
    });
    
    teams.push(paymentTeam);
    
    // Logistics team
    const logisticsTeam = await this.claudeFlow.spawnAgent('coordinator', {
      name: 'Shipping_Integration_Team',
      reportsTo: directors[2].id,
      integrations: ['PostNL', 'DHL', 'DPD']
    });
    
    teams.push(logisticsTeam);
    
    return teams;
  }

  async executeLaunch() {
    const cto = this.hierarchy.get(1)[0];
    
    // CTO creates master plan
    const masterPlan = await cto.createPlan({
      objective: 'Launch sustainable marketplace',
      timeline: '3 months',
      budget: '€500,000'
    });

    // Delegate to directors
    const directorTasks = await cto.delegate(masterPlan, this.hierarchy.get(2));
    
    // Directors delegate to teams
    const teamResults = await Promise.all(
      directorTasks.map(async (task) => {
        const director = this.hierarchy.get(2).find(d => d.id === task.assignedTo);
        const teams = this.hierarchy.get(3).filter(t => t.reportsTo === director.id);
        return await director.executeWithTeams(task, teams);
      })
    );

    // Consolidate results
    return await cto.consolidate(teamResults);
  }
}

// Deploy the hierarchy
const ecommerce = new DutchEcommerceHierarchy();
const result = await ecommerce.deployFullHierarchy();
console.log('✅ Deployment complete:', result);`
    },
    {
      id: 'performance-monitoring-dashboard',
      title: 'Real-Time Performance Monitoring',
      language: 'javascript',
      code: `// swarm-performance-monitor.js
class SwarmMonitoringDashboard {
  constructor(swarmName) {
    this.swarmName = swarmName;
    this.metrics = new MetricsCollector();
    this.alerts = new AlertManager();
    this.dashboard = new Dashboard();
  }

  async initialize() {
    // Start metric collection
    this.startMetricCollection();
    
    // Setup alert rules
    this.configureAlerts();
    
    // Launch dashboard
    await this.dashboard.launch({ port: 3001 });
  }

  startMetricCollection() {
    // Agent metrics every 5 seconds
    setInterval(() => this.collectAgentMetrics(), 5000);
    
    // Task metrics every 10 seconds
    setInterval(() => this.collectTaskMetrics(), 10000);
    
    // System metrics every 3 seconds
    setInterval(() => this.collectSystemMetrics(), 3000);
  }

  async collectAgentMetrics() {
    const agents = await this.swarm.getAgents();
    
    for (const agent of agents) {
      const metrics = {
        id: agent.id,
        name: agent.name,
        status: agent.status,
        load: await agent.getCurrentLoad(),
        tasksCompleted: await agent.getCompletedTasks(),
        errorRate: await agent.getErrorRate(),
        responseTime: await this.measureResponseTime(agent),
        timestamp: Date.now()
      };
      
      await this.metrics.record('agent', metrics);
      
      // Check thresholds
      if (metrics.load > 0.8) {
        await this.alerts.trigger('high_load', {
          agent: agent.name,
          load: metrics.load
        });
      }
    }
  }

  async collectTaskMetrics() {
    const taskQueue = await this.swarm.getTaskQueue();
    
    const metrics = {
      queued: taskQueue.filter(t => t.status === 'queued').length,
      running: taskQueue.filter(t => t.status === 'running').length,
      completed: taskQueue.filter(t => t.status === 'completed').length,
      failed: taskQueue.filter(t => t.status === 'failed').length,
      avgDuration: this.calculateAvgDuration(taskQueue),
      throughput: this.calculateThroughput(taskQueue),
      timestamp: Date.now()
    };
    
    await this.metrics.record('tasks', metrics);
  }

  configureAlerts() {
    // High load alert
    this.alerts.addRule({
      name: 'high_load',
      condition: (data) => data.load > 0.8,
      action: async (data) => {
        console.warn(\`⚠️  Agent \${data.agent} overloaded: \${data.load}\`);
        await this.rebalanceLoad(data.agent);
      }
    });

    // Task queue buildup
    this.alerts.addRule({
      name: 'queue_buildup',
      condition: (data) => data.queued > 50,
      action: async (data) => {
        console.warn(\`⚠️  Task queue buildup: \${data.queued} tasks\`);
        await this.scaleAgents();
      }
    });

    // Error rate threshold
    this.alerts.addRule({
      name: 'high_error_rate',
      condition: (data) => data.errorRate > 0.05,
      action: async (data) => {
        console.error(\`❌ High error rate: \${data.errorRate}\`);
        await this.investigateErrors(data.agent);
      }
    });
  }

  async generateReport() {
    const agentMetrics = await this.metrics.getLatest('agent');
    const taskMetrics = await this.metrics.getLatest('tasks');
    
    return {
      swarm: this.swarmName,
      timestamp: new Date().toISOString(),
      agents: {
        total: agentMetrics.length,
        healthy: agentMetrics.filter(a => a.status === 'healthy').length,
        avgLoad: this.average(agentMetrics.map(a => a.load)),
        avgResponseTime: this.average(agentMetrics.map(a => a.responseTime))
      },
      tasks: {
        throughput: taskMetrics.throughput,
        queued: taskMetrics.queued,
        avgDuration: taskMetrics.avgDuration,
        successRate: taskMetrics.completed / (taskMetrics.completed + taskMetrics.failed)
      },
      recommendations: await this.generateRecommendations()
    };
  }

  async generateRecommendations() {
    const recommendations = [];
    const report = await this.generateReport();
    
    if (report.agents.avgLoad > 0.7) {
      recommendations.push({
        type: 'scaling',
        action: 'Add more agents',
        reason: 'Average load above 70%'
      });
    }
    
    if (report.tasks.queued > 30) {
      recommendations.push({
        type: 'optimization',
        action: 'Optimize task distribution',
        reason: 'High number of queued tasks'
      });
    }
    
    return recommendations;
  }
}

// Launch monitoring
const monitor = new SwarmMonitoringDashboard('DutchEcommerce');
await monitor.initialize();
console.log('📊 Monitoring dashboard running at http://localhost:3001');`
    }
  ],
  assignments: [
    {
      id: 'assignment-3-1-1',
      title: 'Build Multi-Agent Banking System',
      description: 'Create a hierarchical multi-agent system for a Dutch bank with compliance monitoring, fraud detection, and transaction processing. Implement proper communication protocols and performance monitoring.',
      type: 'project',
      difficulty: 'hard',
      hints: [
        'Use hierarchical structure: Director → Department Heads → Teams',
        'Implement message-based communication with priorities',
        'Add real-time fraud detection with consensus',
        'Include DNB compliance checks'
      ]
    },
    {
      id: 'assignment-3-1-2',
      title: 'Optimize Task Distribution Algorithm',
      description: 'Implement an advanced task distribution algorithm that considers agent capabilities, current load, and task requirements. Test with a simulated e-commerce workload.',
      type: 'implementation',
      difficulty: 'medium',
      hints: [
        'Consider both load and capability matching',
        'Implement predictive load balancing',
        'Add task priority handling',
        'Test with various workload patterns'
      ]
    }
  ],
  resources: [
    {
      title: 'Claude Flow Architecture Guide',
      type: 'documentation',
      url: 'https://docs.claude-flow.ai/architectures'
    },
    {
      title: 'Multi-Agent Communication Patterns',
      type: 'article',
      url: 'https://claude-flow.ai/patterns/communication'
    },
    {
      title: 'Performance Monitoring Best Practices',
      type: 'guide',
      url: 'https://claude-flow.ai/guides/monitoring'
    }
  ]
};