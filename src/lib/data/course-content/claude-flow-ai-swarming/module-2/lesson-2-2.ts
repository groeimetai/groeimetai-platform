import type { Lesson } from '@/lib/data/courses';

export const lesson22: Lesson = {
  id: 'lesson-2-2',
  title: 'Agent lifecycle management',
  duration: '40 min',
  content: `
# Agent Lifecycle Management

Een effectief AI swarm systeem vereist robuust lifecycle management voor individuele agents. In deze les verkennen we de complete levenscyclus van een agent: van creatie tot graceful shutdown.

## 1. Agent Creation en Initialization

### Spawn Mechanismen
Claude Flow biedt verschillende manieren om agents te creëren, elk met specifieke use cases:

\`\`\`bash
# Direct spawning met CLI
./claude-flow agent spawn researcher --name "market-analyst"

# Batch spawning voor swarms
./claude-flow swarm "Research project" --max-agents 10

# Programmatisch spawnen
./claude-flow sparc run orchestrator "Create specialized agent team"
\`\`\`

### Initialization Process
Elke agent doorloopt een gestructureerd initialization proces:

\`\`\`typescript
// Agent initialization lifecycle
class AgentLifecycle {
  private state: AgentState = 'uninitialized';
  private resources: ResourcePool;
  private healthChecker: HealthMonitor;
  
  async initialize(config: AgentConfig): Promise<void> {
    try {
      // Phase 1: Validate configuration
      await this.validateConfig(config);
      this.state = 'configuring';
      
      // Phase 2: Allocate resources
      this.resources = await this.allocateResources(config.resourceRequirements);
      this.state = 'provisioning';
      
      // Phase 3: Load knowledge base
      await this.loadKnowledgeBase(config.knowledgeSource);
      
      // Phase 4: Initialize tools
      await this.initializeTools(config.requiredTools);
      
      // Phase 5: Connect to communication channels
      await this.connectToCommunicationBus();
      
      // Phase 6: Start health monitoring
      this.healthChecker = new HealthMonitor(this);
      await this.healthChecker.start();
      
      this.state = 'ready';
      this.emit('agent:ready', { agentId: this.id });
      
    } catch (error) {
      this.state = 'failed';
      await this.cleanup();
      throw new AgentInitializationError(error);
    }
  }
}
\`\`\`

### Agent Configuration Schema
\`\`\`typescript
interface AgentConfig {
  id: string;
  type: AgentType;
  name: string;
  capabilities: Capability[];
  resourceRequirements: {
    memory: number;      // MB
    cpu: number;         // cores
    timeout: number;     // seconds
    priority: Priority;
  };
  knowledgeSource?: {
    type: 'memory' | 'file' | 'remote';
    location: string;
  };
  requiredTools: string[];
  communicationMode: 'sync' | 'async' | 'hybrid';
  persistenceStrategy: 'ephemeral' | 'persistent';
}
\`\`\`

## 2. State Management

### Agent State Machine
Agents kunnen zich in verschillende states bevinden tijdens hun lifecycle:

\`\`\`typescript
enum AgentState {
  UNINITIALIZED = 'uninitialized',
  CONFIGURING = 'configuring',
  PROVISIONING = 'provisioning',
  READY = 'ready',
  BUSY = 'busy',
  IDLE = 'idle',
  SUSPENDED = 'suspended',
  SHUTTING_DOWN = 'shutting_down',
  TERMINATED = 'terminated',
  FAILED = 'failed'
}

class AgentStateMachine {
  private currentState: AgentState = AgentState.UNINITIALIZED;
  private stateHistory: StateTransition[] = [];
  private stateHandlers: Map<AgentState, StateHandler> = new Map();
  
  async transitionTo(newState: AgentState, context?: any): Promise<void> {
    // Validate state transition
    if (!this.isValidTransition(this.currentState, newState)) {
      throw new InvalidStateTransitionError(
        \`Cannot transition from \${this.currentState} to \${newState}\`
      );
    }
    
    // Execute exit handler for current state
    const exitHandler = this.stateHandlers.get(this.currentState)?.onExit;
    if (exitHandler) {
      await exitHandler(context);
    }
    
    // Record transition
    this.stateHistory.push({
      from: this.currentState,
      to: newState,
      timestamp: Date.now(),
      context
    });
    
    // Update state
    const previousState = this.currentState;
    this.currentState = newState;
    
    // Execute entry handler for new state
    const entryHandler = this.stateHandlers.get(newState)?.onEntry;
    if (entryHandler) {
      await entryHandler(context);
    }
    
    // Emit state change event
    this.emit('state:changed', {
      previousState,
      currentState: this.currentState,
      context
    });
  }
  
  private isValidTransition(from: AgentState, to: AgentState): boolean {
    const validTransitions: Record<AgentState, AgentState[]> = {
      [AgentState.UNINITIALIZED]: [AgentState.CONFIGURING],
      [AgentState.CONFIGURING]: [AgentState.PROVISIONING, AgentState.FAILED],
      [AgentState.PROVISIONING]: [AgentState.READY, AgentState.FAILED],
      [AgentState.READY]: [AgentState.BUSY, AgentState.IDLE, AgentState.SUSPENDED, AgentState.SHUTTING_DOWN],
      [AgentState.BUSY]: [AgentState.IDLE, AgentState.SUSPENDED, AgentState.FAILED, AgentState.SHUTTING_DOWN],
      [AgentState.IDLE]: [AgentState.BUSY, AgentState.SUSPENDED, AgentState.SHUTTING_DOWN],
      [AgentState.SUSPENDED]: [AgentState.READY, AgentState.SHUTTING_DOWN],
      [AgentState.SHUTTING_DOWN]: [AgentState.TERMINATED],
      [AgentState.FAILED]: [AgentState.SHUTTING_DOWN],
      [AgentState.TERMINATED]: []
    };
    
    return validTransitions[from]?.includes(to) ?? false;
  }
}
\`\`\`

### Persistent State Storage
Voor langlopende agents is persistent state storage cruciaal:

\`\`\`typescript
class PersistentAgentState {
  private stateStore: StateStore;
  private checkpointInterval: number = 60000; // 1 minute
  
  async saveCheckpoint(agent: Agent): Promise<void> {
    const checkpoint: AgentCheckpoint = {
      agentId: agent.id,
      state: agent.getState(),
      memory: await agent.exportMemory(),
      taskProgress: agent.getCurrentTaskProgress(),
      metrics: agent.getMetrics(),
      timestamp: Date.now()
    };
    
    await this.stateStore.save(\`checkpoint:\${agent.id}\`, checkpoint);
    
    // Keep laatste 5 checkpoints voor rollback
    await this.pruneOldCheckpoints(agent.id, 5);
  }
  
  async restoreFromCheckpoint(agentId: string): Promise<AgentCheckpoint | null> {
    const checkpoint = await this.stateStore.load(\`checkpoint:\${agentId}\`);
    
    if (checkpoint && this.isValidCheckpoint(checkpoint)) {
      return checkpoint;
    }
    
    return null;
  }
  
  private isValidCheckpoint(checkpoint: AgentCheckpoint): boolean {
    const age = Date.now() - checkpoint.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    return age < maxAge && checkpoint.state !== AgentState.FAILED;
  }
}
\`\`\`

## 3. Task Assignment

### Intelligent Task Routing
Task assignment gebeurt op basis van agent capabilities en beschikbaarheid:

\`\`\`typescript
class TaskAssigner {
  private agentRegistry: AgentRegistry;
  private taskQueue: PriorityQueue<Task>;
  private assignmentStrategy: AssignmentStrategy;
  
  async assignTask(task: Task): Promise<Assignment> {
    // Find eligible agents
    const eligibleAgents = await this.findEligibleAgents(task);
    
    if (eligibleAgents.length === 0) {
      // Spawn new agent if needed
      const newAgent = await this.spawnSpecializedAgent(task);
      eligibleAgents.push(newAgent);
    }
    
    // Score agents based on suitability
    const scoredAgents = await this.scoreAgents(eligibleAgents, task);
    
    // Select optimal agent
    const selectedAgent = this.assignmentStrategy.selectAgent(scoredAgents);
    
    // Create assignment
    const assignment = new Assignment({
      task,
      agent: selectedAgent,
      assignedAt: Date.now(),
      deadline: this.calculateDeadline(task),
      priority: task.priority
    });
    
    // Notify agent
    await selectedAgent.receiveAssignment(assignment);
    
    // Update agent state
    await selectedAgent.transitionTo(AgentState.BUSY);
    
    return assignment;
  }
  
  private async scoreAgents(agents: Agent[], task: Task): Promise<ScoredAgent[]> {
    return Promise.all(agents.map(async agent => {
      const score = await this.calculateAgentScore(agent, task);
      return { agent, score };
    }));
  }
  
  private async calculateAgentScore(agent: Agent, task: Task): Promise<number> {
    let score = 0;
    
    // Capability match (40%)
    const capabilityScore = this.calculateCapabilityMatch(agent.capabilities, task.requirements);
    score += capabilityScore * 0.4;
    
    // Current workload (30%)
    const workloadScore = 1 - (agent.getCurrentWorkload() / agent.getMaxWorkload());
    score += workloadScore * 0.3;
    
    // Historical performance (20%)
    const performanceScore = await agent.getPerformanceScore(task.type);
    score += performanceScore * 0.2;
    
    // Affinity score (10%)
    const affinityScore = await this.calculateAffinityScore(agent, task);
    score += affinityScore * 0.1;
    
    return score;
  }
}
\`\`\`

### Task Lifecycle Integration
\`\`\`typescript
class TaskLifecycleManager {
  async executeTask(assignment: Assignment): Promise<TaskResult> {
    const { agent, task } = assignment;
    
    try {
      // Pre-execution phase
      await this.prepareAgent(agent, task);
      
      // Monitor task execution
      const monitor = new TaskMonitor(assignment);
      monitor.start();
      
      // Execute task
      const result = await agent.executeTask(task);
      
      // Post-execution phase
      await this.processResult(agent, task, result);
      
      // Update metrics
      await this.updateMetrics(assignment, result);
      
      return result;
      
    } catch (error) {
      // Handle task failure
      await this.handleTaskFailure(assignment, error);
      throw error;
      
    } finally {
      // Always transition agent back to ready state
      if (agent.getState() === AgentState.BUSY) {
        await agent.transitionTo(AgentState.IDLE);
      }
    }
  }
  
  private async handleTaskFailure(assignment: Assignment, error: Error): Promise<void> {
    // Log failure
    await this.logger.error('Task execution failed', {
      assignment,
      error: error.message,
      stack: error.stack
    });
    
    // Attempt retry if applicable
    if (this.shouldRetry(assignment, error)) {
      await this.scheduleRetry(assignment);
    } else {
      // Reassign to different agent
      await this.reassignTask(assignment.task);
    }
  }
}
\`\`\`

## 4. Resource Allocation

### Dynamic Resource Management
Agents moeten resources efficiënt gebruiken en delen:

\`\`\`typescript
class ResourceManager {
  private resourcePools: Map<ResourceType, ResourcePool> = new Map();
  private allocations: Map<string, ResourceAllocation[]> = new Map();
  
  async allocateResources(agentId: string, requirements: ResourceRequirements): Promise<ResourceAllocation[]> {
    const allocations: ResourceAllocation[] = [];
    
    try {
      // CPU allocation
      if (requirements.cpu) {
        const cpuAllocation = await this.allocateCPU(agentId, requirements.cpu);
        allocations.push(cpuAllocation);
      }
      
      // Memory allocation
      if (requirements.memory) {
        const memoryAllocation = await this.allocateMemory(agentId, requirements.memory);
        allocations.push(memoryAllocation);
      }
      
      // Tool allocation
      if (requirements.tools) {
        for (const tool of requirements.tools) {
          const toolAllocation = await this.allocateTool(agentId, tool);
          allocations.push(toolAllocation);
        }
      }
      
      // Network bandwidth allocation
      if (requirements.bandwidth) {
        const bandwidthAllocation = await this.allocateBandwidth(agentId, requirements.bandwidth);
        allocations.push(bandwidthAllocation);
      }
      
      // Store allocations
      this.allocations.set(agentId, allocations);
      
      return allocations;
      
    } catch (error) {
      // Rollback on failure
      await this.rollbackAllocations(allocations);
      throw new ResourceAllocationError(error);
    }
  }
  
  async releaseResources(agentId: string): Promise<void> {
    const allocations = this.allocations.get(agentId);
    
    if (!allocations) {
      return;
    }
    
    // Release all allocated resources
    for (const allocation of allocations) {
      await this.releaseAllocation(allocation);
    }
    
    // Remove from tracking
    this.allocations.delete(agentId);
    
    // Notify waiting agents
    await this.notifyWaitingAgents();
  }
  
  // Resource monitoring
  async monitorResourceUsage(agentId: string): Promise<ResourceUsageMetrics> {
    const allocations = this.allocations.get(agentId);
    if (!allocations) {
      throw new Error(\`No allocations found for agent \${agentId}\`);
    }
    
    const usage: ResourceUsageMetrics = {
      cpu: 0,
      memory: 0,
      bandwidth: 0,
      tools: []
    };
    
    for (const allocation of allocations) {
      const currentUsage = await allocation.getCurrentUsage();
      
      switch (allocation.type) {
        case ResourceType.CPU:
          usage.cpu = currentUsage;
          break;
        case ResourceType.MEMORY:
          usage.memory = currentUsage;
          break;
        case ResourceType.BANDWIDTH:
          usage.bandwidth = currentUsage;
          break;
        case ResourceType.TOOL:
          usage.tools.push({
            name: allocation.resourceId,
            usage: currentUsage
          });
          break;
      }
    }
    
    return usage;
  }
}
\`\`\`

### Resource Pooling Strategy
\`\`\`typescript
class ResourcePool {
  private totalCapacity: number;
  private availableCapacity: number;
  private waitQueue: Queue<ResourceRequest>;
  
  async request(amount: number, priority: Priority = Priority.NORMAL): Promise<ResourceGrant> {
    // Check immediate availability
    if (this.availableCapacity >= amount) {
      return this.allocateImmediate(amount);
    }
    
    // High priority can preempt
    if (priority === Priority.HIGH) {
      const preempted = await this.preemptLowPriority(amount);
      if (preempted) {
        return this.allocateImmediate(amount);
      }
    }
    
    // Queue the request
    return new Promise((resolve, reject) => {
      const request = new ResourceRequest({
        amount,
        priority,
        resolve,
        reject,
        timestamp: Date.now()
      });
      
      this.waitQueue.enqueue(request);
      
      // Timeout handling
      setTimeout(() => {
        if (this.waitQueue.remove(request)) {
          reject(new ResourceTimeoutError());
        }
      }, 30000); // 30 second timeout
    });
  }
}
\`\`\`

## 5. Graceful Shutdown

### Shutdown Orchestration
Een proper shutdown proces is essentieel voor data integriteit:

\`\`\`typescript
class GracefulShutdown {
  private shutdownHandlers: ShutdownHandler[] = [];
  private shutdownTimeout: number = 30000; // 30 seconds
  
  async initiateShutdown(agent: Agent, reason: ShutdownReason): Promise<void> {
    console.log(\`Initiating graceful shutdown for agent \${agent.id}: \${reason}\`);
    
    try {
      // Step 1: Transition to shutting down state
      await agent.transitionTo(AgentState.SHUTTING_DOWN);
      
      // Step 2: Stop accepting new tasks
      await agent.stopAcceptingTasks();
      
      // Step 3: Complete or save current tasks
      await this.handleInProgressTasks(agent);
      
      // Step 4: Save state checkpoint
      await this.saveAgentState(agent);
      
      // Step 5: Release resources
      await this.releaseAgentResources(agent);
      
      // Step 6: Disconnect from communication channels
      await agent.disconnect();
      
      // Step 7: Execute custom shutdown handlers
      await this.executeShutdownHandlers(agent);
      
      // Step 8: Final cleanup
      await agent.cleanup();
      
      // Step 9: Mark as terminated
      await agent.transitionTo(AgentState.TERMINATED);
      
      console.log(\`Agent \${agent.id} shutdown completed successfully\`);
      
    } catch (error) {
      console.error(\`Error during shutdown of agent \${agent.id}:\`, error);
      
      // Force shutdown if graceful fails
      await this.forceShutdown(agent);
    }
  }
  
  private async handleInProgressTasks(agent: Agent): Promise<void> {
    const tasks = agent.getInProgressTasks();
    
    for (const task of tasks) {
      if (task.canBeSuspended()) {
        // Save task state for resumption
        await this.suspendTask(task);
      } else if (task.timeRemaining() < this.shutdownTimeout) {
        // Try to complete the task
        await this.waitForTaskCompletion(task);
      } else {
        // Reassign to another agent
        await this.reassignTask(task);
      }
    }
  }
  
  private async saveAgentState(agent: Agent): Promise<void> {
    const state: AgentShutdownState = {
      agentId: agent.id,
      configuration: agent.getConfiguration(),
      memory: await agent.exportMemory(),
      suspendedTasks: agent.getSuspendedTasks(),
      metrics: agent.getLifetimeMetrics(),
      shutdownReason: agent.getShutdownReason(),
      shutdownTime: Date.now()
    };
    
    await this.stateStore.save(\`shutdown:state:\${agent.id}\`, state);
  }
  
  private async forceShutdown(agent: Agent): Promise<void> {
    console.warn(\`Force shutdown initiated for agent \${agent.id}\`);
    
    // Immediate resource release
    await this.resourceManager.forceRelease(agent.id);
    
    // Kill any running processes
    await agent.terminate();
    
    // Mark as terminated
    agent.forceState(AgentState.TERMINATED);
  }
}
\`\`\`

### Shutdown Hooks en Cleanup
\`\`\`typescript
class ShutdownHooks {
  static registerHooks(agent: Agent): void {
    // Register process signals
    process.on('SIGTERM', async () => {
      await agent.gracefulShutdown('SIGTERM received');
    });
    
    process.on('SIGINT', async () => {
      await agent.gracefulShutdown('SIGINT received');
    });
    
    // Unhandled rejection handler
    process.on('unhandledRejection', async (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      await agent.emergencyShutdown('Unhandled rejection');
    });
    
    // Memory pressure handler
    if (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal > 0.9) {
      agent.on('memory:pressure', async () => {
        await agent.gracefulShutdown('Memory pressure');
      });
    }
  }
}
\`\`\`

## Praktijkvoorbeeld: Complete Agent Lifecycle

\`\`\`bash
# Complete lifecycle workflow
#!/bin/bash

# 1. Create and initialize agent
AGENT_ID=$(./claude-flow agent spawn researcher \\
  --name "market-researcher-001" \\
  --memory-limit 512MB \\
  --cpu-limit 2 \\
  --timeout 3600)

echo "Created agent: $AGENT_ID"

# 2. Monitor agent state
./claude-flow agent status $AGENT_ID --watch &
MONITOR_PID=$!

# 3. Assign tasks
./claude-flow task assign $AGENT_ID "Research AI market trends 2024"
./claude-flow task assign $AGENT_ID "Analyze competitor landscape"

# 4. Monitor resource usage
./claude-flow agent resources $AGENT_ID --interval 5

# 5. Suspend agent if needed
# ./claude-flow agent suspend $AGENT_ID

# 6. Resume agent
# ./claude-flow agent resume $AGENT_ID

# 7. Graceful shutdown
./claude-flow agent shutdown $AGENT_ID --graceful --timeout 30

# 8. Cleanup monitoring
kill $MONITOR_PID

echo "Agent lifecycle completed"
\`\`\`

## Best Practices

1. **Always use graceful shutdown**: Voorkom data loss door proper shutdown procedures
2. **Implement health checks**: Monitor agent health continu
3. **Use resource limits**: Voorkom dat één agent alle resources gebruikt
4. **Save checkpoints**: Enable recovery bij crashes
5. **Log state transitions**: Voor debugging en auditing
6. **Test failure scenarios**: Zorg dat agents robuust zijn tegen fouten

## Samenvatting

Effectief lifecycle management is de foundation van een betrouwbaar AI swarm systeem. Door proper initialization, state management, resource allocation en graceful shutdown te implementeren, creëer je een robuust systeem dat schaalbaar en betrouwbaar is in productie-omgevingen.
  `,
  codeExamples: [
    {
      id: 'code-2-2-1',
      title: 'Complete Agent Lifecycle Implementation',
      code: `// Complete agent lifecycle example
import { ClaudeFlow, Agent, AgentConfig } from '@claude-flow/core';

class ManagedAgent {
  private agent: Agent;
  private lifecycleManager: AgentLifecycleManager;
  private resourceMonitor: ResourceMonitor;
  private stateRecorder: StateRecorder;
  
  async create(config: AgentConfig): Promise<void> {
    console.log(\`Creating agent: \${config.name}\`);
    
    // Initialize lifecycle manager
    this.lifecycleManager = new AgentLifecycleManager({
      checkpointInterval: 60000,
      healthCheckInterval: 5000,
      resourceLimits: config.resourceRequirements
    });
    
    try {
      // Phase 1: Pre-initialization
      await this.lifecycleManager.validateEnvironment();
      
      // Phase 2: Create agent
      this.agent = await ClaudeFlow.createAgent(config);
      
      // Phase 3: Initialize monitoring
      this.resourceMonitor = new ResourceMonitor(this.agent);
      await this.resourceMonitor.start();
      
      // Phase 4: Setup state recording
      this.stateRecorder = new StateRecorder(this.agent);
      this.stateRecorder.startRecording();
      
      // Phase 5: Register lifecycle handlers
      this.registerLifecycleHandlers();
      
      // Phase 6: Start agent
      await this.agent.start();
      
      console.log(\`Agent \${config.name} created successfully\`);
      
    } catch (error) {
      console.error(\`Failed to create agent: \${error.message}\`);
      await this.cleanup();
      throw error;
    }
  }
  
  private registerLifecycleHandlers(): void {
    // State change handler
    this.agent.on('state:changed', async (event) => {
      console.log(\`State changed: \${event.previousState} -> \${event.currentState}\`);
      await this.stateRecorder.recordTransition(event);
    });
    
    // Task assignment handler
    this.agent.on('task:assigned', async (task) => {
      console.log(\`Task assigned: \${task.id}\`);
      await this.lifecycleManager.onTaskAssigned(task);
    });
    
    // Task completion handler
    this.agent.on('task:completed', async (result) => {
      console.log(\`Task completed: \${result.taskId}\`);
      await this.lifecycleManager.onTaskCompleted(result);
    });
    
    // Error handler
    this.agent.on('error', async (error) => {
      console.error(\`Agent error: \${error.message}\`);
      await this.handleError(error);
    });
    
    // Resource pressure handler
    this.resourceMonitor.on('pressure:high', async (metrics) => {
      console.warn(\`High resource pressure detected: \${JSON.stringify(metrics)}\`);
      await this.handleResourcePressure(metrics);
    });
  }
  
  async executeTask(taskDefinition: TaskDefinition): Promise<TaskResult> {
    // Check agent readiness
    if (!this.agent.isReady()) {
      throw new Error('Agent not ready to accept tasks');
    }
    
    // Check resource availability
    const resourceCheck = await this.resourceMonitor.checkAvailability(
      taskDefinition.resourceRequirements
    );
    
    if (!resourceCheck.available) {
      throw new Error(\`Insufficient resources: \${resourceCheck.reason}\`);
    }
    
    // Create task with lifecycle tracking
    const task = new TrackedTask(taskDefinition);
    
    try {
      // Assign and execute
      const result = await this.agent.execute(task);
      
      // Record metrics
      await this.recordTaskMetrics(task, result);
      
      return result;
      
    } catch (error) {
      // Handle task failure
      await this.handleTaskFailure(task, error);
      throw error;
    }
  }
  
  async suspend(): Promise<void> {
    console.log(\`Suspending agent \${this.agent.id}\`);
    
    // Save current state
    const checkpoint = await this.createCheckpoint();
    await this.lifecycleManager.saveCheckpoint(checkpoint);
    
    // Suspend agent
    await this.agent.suspend();
    
    // Reduce resource allocation
    await this.resourceMonitor.enterLowPowerMode();
  }
  
  async resume(): Promise<void> {
    console.log(\`Resuming agent \${this.agent.id}\`);
    
    // Restore from checkpoint
    const checkpoint = await this.lifecycleManager.loadCheckpoint(this.agent.id);
    if (checkpoint) {
      await this.restoreFromCheckpoint(checkpoint);
    }
    
    // Resume agent
    await this.agent.resume();
    
    // Restore full resource allocation
    await this.resourceMonitor.exitLowPowerMode();
  }
  
  async shutdown(options: ShutdownOptions = {}): Promise<void> {
    const timeout = options.timeout || 30000;
    const force = options.force || false;
    
    console.log(\`Initiating shutdown for agent \${this.agent.id}\`);
    
    try {
      // Graceful shutdown with timeout
      await Promise.race([
        this.gracefulShutdown(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Shutdown timeout')), timeout)
        )
      ]);
      
    } catch (error) {
      if (force) {
        console.warn('Graceful shutdown failed, forcing shutdown');
        await this.forceShutdown();
      } else {
        throw error;
      }
    }
  }
  
  private async gracefulShutdown(): Promise<void> {
    // Step 1: Stop accepting new tasks
    await this.agent.stopAcceptingTasks();
    
    // Step 2: Wait for current tasks to complete
    const activeTasks = this.agent.getActiveTasks();
    if (activeTasks.length > 0) {
      console.log(\`Waiting for \${activeTasks.length} tasks to complete\`);
      await Promise.all(activeTasks.map(task => 
        this.waitForTaskCompletion(task)
      ));
    }
    
    // Step 3: Save final state
    const finalCheckpoint = await this.createCheckpoint();
    await this.lifecycleManager.saveFinalState(finalCheckpoint);
    
    // Step 4: Stop monitoring
    await this.resourceMonitor.stop();
    await this.stateRecorder.stopRecording();
    
    // Step 5: Release resources
    await this.lifecycleManager.releaseAllResources();
    
    // Step 6: Disconnect
    await this.agent.disconnect();
    
    // Step 7: Cleanup
    await this.cleanup();
    
    console.log(\`Agent \${this.agent.id} shutdown completed\`);
  }
  
  private async cleanup(): Promise<void> {
    // Remove event listeners
    this.agent.removeAllListeners();
    
    // Clear timers
    if (this.resourceMonitor) {
      this.resourceMonitor.clearTimers();
    }
    
    // Clear state
    this.agent = null;
    this.lifecycleManager = null;
    this.resourceMonitor = null;
    this.stateRecorder = null;
  }
}

// Usage example
async function main() {
  const agent = new ManagedAgent();
  
  try {
    // Create agent
    await agent.create({
      name: 'managed-researcher',
      type: 'researcher',
      capabilities: ['web_search', 'analysis'],
      resourceRequirements: {
        memory: 512,
        cpu: 2,
        timeout: 3600
      }
    });
    
    // Execute task
    const result = await agent.executeTask({
      type: 'research',
      description: 'Analyze market trends',
      priority: 'high'
    });
    
    console.log('Task result:', result);
    
    // Graceful shutdown
    await agent.shutdown({ timeout: 30000 });
    
  } catch (error) {
    console.error('Error:', error);
    await agent.shutdown({ force: true });
  }
}

main().catch(console.error);`,
      language: 'typescript'
    },
    {
      id: 'code-2-2-2',
      title: 'Resource Management System',
      code: `// Advanced resource management for agent lifecycle
class AgentResourceManager {
  private resourcePools: Map<string, ResourcePool> = new Map();
  private allocations: Map<string, AgentAllocation> = new Map();
  private quotas: Map<string, ResourceQuota> = new Map();
  
  constructor() {
    // Initialize resource pools
    this.resourcePools.set('cpu', new CPUPool({ totalCores: 16 }));
    this.resourcePools.set('memory', new MemoryPool({ totalGB: 32 }));
    this.resourcePools.set('gpu', new GPUPool({ devices: 4 }));
    this.resourcePools.set('network', new NetworkPool({ bandwidthMbps: 1000 }));
  }
  
  async allocateForAgent(agentId: string, requirements: ResourceRequirements): Promise<AllocationResult> {
    console.log(\`Allocating resources for agent \${agentId}\`);
    
    const allocation = new AgentAllocation(agentId);
    
    try {
      // Check quotas first
      await this.checkQuotas(agentId, requirements);
      
      // Allocate each resource type
      for (const [resourceType, amount] of Object.entries(requirements)) {
        const pool = this.resourcePools.get(resourceType);
        if (!pool) {
          throw new Error(\`Unknown resource type: \${resourceType}\`);
        }
        
        const grant = await pool.allocate(amount, {
          agentId,
          priority: requirements.priority || 'normal',
          timeout: 10000
        });
        
        allocation.addGrant(resourceType, grant);
      }
      
      // Store allocation
      this.allocations.set(agentId, allocation);
      
      // Start monitoring
      this.startResourceMonitoring(agentId, allocation);
      
      return {
        success: true,
        allocation,
        limits: this.calculateLimits(allocation)
      };
      
    } catch (error) {
      // Rollback partial allocations
      await allocation.rollback();
      
      return {
        success: false,
        error: error.message,
        suggestions: this.suggestAlternatives(requirements)
      };
    }
  }
  
  private startResourceMonitoring(agentId: string, allocation: AgentAllocation): void {
    const monitor = setInterval(async () => {
      const usage = await allocation.getCurrentUsage();
      
      // Check for overuse
      for (const [resource, metrics] of Object.entries(usage)) {
        if (metrics.percentage > 90) {
          this.emit('resource:pressure', {
            agentId,
            resource,
            usage: metrics
          });
        }
        
        if (metrics.percentage > 100) {
          // Throttle or terminate
          await this.handleOveruse(agentId, resource, metrics);
        }
      }
      
      // Update metrics
      await this.updateMetrics(agentId, usage);
      
    }, 5000); // Check every 5 seconds
    
    allocation.setMonitor(monitor);
  }
  
  async releaseAgentResources(agentId: string): Promise<void> {
    const allocation = this.allocations.get(agentId);
    if (!allocation) {
      return;
    }
    
    console.log(\`Releasing resources for agent \${agentId}\`);
    
    // Stop monitoring
    allocation.stopMonitoring();
    
    // Release all grants
    for (const [resourceType, grant] of allocation.getGrants()) {
      const pool = this.resourcePools.get(resourceType);
      await pool.release(grant);
    }
    
    // Remove allocation
    this.allocations.delete(agentId);
    
    // Notify waiting agents
    this.notifyWaitingAgents();
  }
  
  async adjustAllocation(agentId: string, adjustments: ResourceAdjustments): Promise<boolean> {
    const allocation = this.allocations.get(agentId);
    if (!allocation) {
      throw new Error(\`No allocation found for agent \${agentId}\`);
    }
    
    for (const [resourceType, adjustment] of Object.entries(adjustments)) {
      const pool = this.resourcePools.get(resourceType);
      const currentGrant = allocation.getGrant(resourceType);
      
      if (adjustment.action === 'increase') {
        // Try to allocate more
        const additionalGrant = await pool.allocate(adjustment.amount);
        allocation.mergeGrant(resourceType, additionalGrant);
        
      } else if (adjustment.action === 'decrease') {
        // Release some resources
        await pool.partialRelease(currentGrant, adjustment.amount);
        allocation.updateGrant(resourceType, adjustment.amount);
      }
    }
    
    return true;
  }
  
  getResourceReport(): ResourceReport {
    const report: ResourceReport = {
      timestamp: Date.now(),
      pools: {},
      allocations: {},
      trends: {}
    };
    
    // Pool statistics
    for (const [type, pool] of this.resourcePools) {
      report.pools[type] = {
        total: pool.getTotal(),
        available: pool.getAvailable(),
        allocated: pool.getAllocated(),
        utilizationPercent: pool.getUtilization()
      };
    }
    
    // Agent allocations
    for (const [agentId, allocation] of this.allocations) {
      report.allocations[agentId] = allocation.getSummary();
    }
    
    // Usage trends
    report.trends = this.calculateTrends();
    
    return report;
  }
}

// Resource pool implementation
class ResourcePool {
  protected total: number;
  protected available: number;
  protected allocations: Map<string, number> = new Map();
  protected waitQueue: PriorityQueue<AllocationRequest> = new PriorityQueue();
  
  async allocate(amount: number, options: AllocationOptions): Promise<ResourceGrant> {
    // Fast path: immediate availability
    if (this.available >= amount) {
      return this.createGrant(amount, options);
    }
    
    // Check if preemption is possible
    if (options.priority === 'high') {
      const preempted = await this.tryPreemption(amount);
      if (preempted) {
        return this.createGrant(amount, options);
      }
    }
    
    // Queue the request
    return new Promise((resolve, reject) => {
      const request = {
        amount,
        options,
        resolve,
        reject,
        timestamp: Date.now()
      };
      
      this.waitQueue.enqueue(request, this.calculatePriority(options));
      
      // Timeout handling
      if (options.timeout) {
        setTimeout(() => {
          if (this.waitQueue.remove(request)) {
            reject(new AllocationTimeoutError());
          }
        }, options.timeout);
      }
    });
  }
  
  private createGrant(amount: number, options: AllocationOptions): ResourceGrant {
    const grantId = \`grant-\${Date.now()}-\${Math.random()}\`;
    
    this.available -= amount;
    this.allocations.set(grantId, amount);
    
    return new ResourceGrant({
      id: grantId,
      amount,
      agentId: options.agentId,
      grantedAt: Date.now(),
      expiresAt: options.duration ? Date.now() + options.duration : null
    });
  }
}`,
      language: 'typescript'
    },
    {
      id: 'code-2-2-3',
      title: 'State Management Example',
      code: `# Praktisch voorbeeld van state management
#!/bin/bash

# Agent state monitoring script
AGENT_ID="researcher-001"

# Function to check agent state
check_state() {
  ./claude-flow agent status $AGENT_ID --format json | jq -r '.state'
}

# Function to wait for specific state
wait_for_state() {
  local target_state=$1
  local timeout=$2
  local elapsed=0
  
  echo "Waiting for agent to reach state: $target_state"
  
  while [ $elapsed -lt $timeout ]; do
    current_state=$(check_state)
    
    if [ "$current_state" = "$target_state" ]; then
      echo "Agent reached state: $target_state"
      return 0
    fi
    
    sleep 1
    elapsed=$((elapsed + 1))
  done
  
  echo "Timeout waiting for state: $target_state"
  return 1
}

# Main lifecycle flow
echo "Starting agent lifecycle demo..."

# 1. Create agent
echo "Creating agent..."
./claude-flow agent spawn researcher \
  --name "$AGENT_ID" \
  --capabilities "web_search,analysis" \
  --memory 512MB \
  --cpu 2

# 2. Wait for ready state
wait_for_state "ready" 30

# 3. Assign task
echo "Assigning task..."
TASK_ID=$(./claude-flow task create research \
  "Analyze cloud computing trends" \
  --assign-to "$AGENT_ID")

# 4. Monitor busy state
wait_for_state "busy" 5

# 5. Check resource usage while busy
echo "Monitoring resource usage..."
for i in {1..10}; do
  ./claude-flow agent resources $AGENT_ID
  sleep 2
done

# 6. Wait for task completion
wait_for_state "idle" 300

# 7. Suspend agent
echo "Suspending agent..."
./claude-flow agent suspend $AGENT_ID

wait_for_state "suspended" 10

# 8. Resume agent
echo "Resuming agent..."
./claude-flow agent resume $AGENT_ID

wait_for_state "ready" 10

# 9. Graceful shutdown
echo "Initiating graceful shutdown..."
./claude-flow agent shutdown $AGENT_ID --graceful --timeout 30

# 10. Verify termination
wait_for_state "terminated" 35

echo "Agent lifecycle demo completed!"

# Generate lifecycle report
./claude-flow agent history $AGENT_ID --format json > lifecycle_report.json
echo "Lifecycle report saved to lifecycle_report.json"`,
      language: 'bash'
    }
  ],
  assignments: [
    {
      id: 'assignment-2-2-1',
      title: 'Implementeer een Agent Health Monitor',
      description: 'Bouw een health monitoring systeem dat de gezondheid van agents tracked inclusief CPU gebruik, geheugen, response times, en error rates. Implementeer automatic recovery bij problemen.',
      type: 'project',
      difficulty: 'medium',
    },
    {
      id: 'assignment-2-2-2',
      title: 'Design een Resource Allocation Strategy',
      description: 'Ontwerp en implementeer een resource allocation strategie die fair sharing garandeert tussen agents terwijl het prioriteiten respecteert.',
      type: 'project',
      difficulty: 'hard',
    }
  ],
  resources: [
    {
      title: 'Claude Flow Lifecycle Management Guide',
      type: 'documentation',
      url: 'https://docs.claude-flow.ai/agents/lifecycle'
    },
    {
      title: 'Best Practices for Agent State Management',
      type: 'article',
      url: 'https://claude-flow.ai/blog/agent-state-management'
    },
    {
      title: 'Resource Management in Distributed Systems',
      type: 'video',
      url: 'https://youtube.com/watch?v=resource-management'
    }
  ]
};