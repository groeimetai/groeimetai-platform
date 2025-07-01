import type { Lesson } from '@/lib/data/courses';

export const lesson21: Lesson = {
  id: 'lesson-2-1',
  title: 'Claude Flow componenten',
  duration: '35 min',
  content: `
# Claude Flow Componenten

In deze les verkennen we de core componenten van Claude Flow's architectuur. We bekijken hoe het systeem is opgebouwd, welke componenten samenwerken, en hoe de verschillende lagen van de architectuur een robuust en schaalbaar AI swarm platform vormen.

## Core System Architecture

Claude Flow is gebouwd op een modulaire, event-driven architectuur die maximale flexibiliteit en schaalbaarheid biedt.

### Architectuur Overview

\`\`\`
┌─────────────────────────────────────────────────────────────────────┐
│                        Claude Flow Platform                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │     CLI      │  │   Web UI     │  │     API      │              │
│  │  Interface   │  │  Dashboard   │  │   Gateway    │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                  │                  │                      │
│  ┌──────┴──────────────────┴──────────────────┴───────┐            │
│  │              Orchestration Layer                     │            │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │            │
│  │  │   Swarm     │  │    Task     │  │  Workflow   │ │            │
│  │  │ Coordinator │  │   Manager   │  │   Engine    │ │            │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │            │
│  └─────────────────────────┬───────────────────────────┘            │
│                            │                                         │
│  ┌─────────────────────────┴───────────────────────────┐            │
│  │              Agent Runtime Environment               │            │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │            │
│  │  │   Agent     │  │   Agent     │  │   Agent     │ │            │
│  │  │  Container  │  │ Lifecycle   │  │ Capability  │ │            │
│  │  │   Manager   │  │  Manager    │  │  Registry   │ │            │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │            │
│  └─────────────────────────┬───────────────────────────┘            │
│                            │                                         │
│  ┌─────────────────────────┴───────────────────────────┐            │
│  │           Communication Infrastructure               │            │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │            │
│  │  │   Message   │  │   Event     │  │   Inter-    │ │            │
│  │  │    Queue    │  │     Bus     │  │   Agent     │ │            │
│  │  │   System    │  │   System    │  │   Comms     │ │            │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │            │
│  └─────────────────────────┬───────────────────────────┘            │
│                            │                                         │
│  ┌─────────────────────────┴───────────────────────────┐            │
│  │           Memory Management System                   │            │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │            │
│  │  │  Semantic   │  │  Temporal   │  │  Persistent │ │            │
│  │  │   Memory    │  │   Memory    │  │   Storage   │ │            │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │            │
│  └─────────────────────────┬───────────────────────────┘            │
│                            │                                         │
│  ┌─────────────────────────┴───────────────────────────┐            │
│  │              Tool Ecosystem                          │            │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │            │
│  │  │   Native    │  │     MCP     │  │   Custom    │ │            │
│  │  │    Tools    │  │   Servers   │  │   Plugins   │ │            │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │            │
│  └──────────────────────────────────────────────────────┘            │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
\`\`\`

### Component Layers

**1. Interface Layer**
- CLI voor command-line interactie
- Web UI voor visuele monitoring en control
- API Gateway voor programmatische toegang

**2. Orchestration Layer**
- Swarm Coordinator voor multi-agent management
- Task Manager voor werk distributie
- Workflow Engine voor complexe processen

**3. Runtime Layer**
- Agent containers voor isolated execution
- Lifecycle management voor agent states
- Capability registry voor skill tracking

**4. Communication Layer**
- Message queuing voor async communication
- Event bus voor real-time updates
- Inter-agent protocol voor direct messaging

**5. Memory Layer**
- Semantic memory voor context understanding
- Temporal memory voor history tracking
- Persistent storage voor long-term retention

**6. Tool Layer**
- Native tools voor basis functionaliteit
- MCP integration voor externe tools
- Plugin system voor extensibility

## Agent Runtime Environment

Het Agent Runtime Environment is het hart van Claude Flow, waar agents worden gecreëerd, beheerd en uitgevoerd.

### Agent Container Architecture

\`\`\`
┌─────────────────────────────────────────────┐
│           Agent Container                    │
├─────────────────────────────────────────────┤
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │         Agent Core                     │  │
│  │  ┌─────────────┐  ┌─────────────────┐ │  │
│  │  │    LLM      │  │    Context      │ │  │
│  │  │  Interface  │  │    Manager      │ │  │
│  │  └─────────────┘  └─────────────────┘ │  │
│  │  ┌─────────────┐  ┌─────────────────┐ │  │
│  │  │   State     │  │    Decision     │ │  │
│  │  │  Machine    │  │     Engine      │ │  │
│  │  └─────────────┘  └─────────────────┘ │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │       Tool Interface Layer            │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ │  │
│  │  │  File   │ │  Web    │ │  Data   │ │  │
│  │  │  System │ │  Access │ │  Query  │ │  │
│  │  └─────────┘ └─────────┘ └─────────┘ │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │      Resource Management              │  │
│  │  ┌─────────────┐  ┌─────────────────┐ │  │
│  │  │   Memory    │  │      CPU        │ │  │
│  │  │   Limits    │  │    Throttle     │ │  │
│  │  └─────────────┘  └─────────────────┘ │  │
│  └───────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
\`\`\`

### Agent Lifecycle States

\`\`\`
        ┌─────────┐
        │  INIT   │
        └────┬────┘
             │
        ┌────▼────┐
        │ LOADING │
        └────┬────┘
             │
        ┌────▼────┐      ┌─────────┐
        │  READY  │◄─────┤ PAUSED  │
        └────┬────┘      └─────────┘
             │                 ▲
        ┌────▼────┐           │
        │ ACTIVE  ├───────────┘
        └────┬────┘
             │
        ┌────▼────┐
        │ CLEANUP │
        └────┬────┘
             │
        ┌────▼────┐
        │TERMINATED│
        └─────────┘
\`\`\`

### Runtime Configuration

\`\`\`typescript
interface AgentRuntimeConfig {
  // Resource constraints
  resources: {
    maxMemoryMB: number      // Default: 512
    maxCPUPercent: number    // Default: 25
    maxExecutionTime: number // Default: 300000ms
  }
  
  // Capability configuration
  capabilities: {
    allowedTools: string[]   // Whitelist van tools
    maxConcurrentTasks: number
    enableParallelExecution: boolean
  }
  
  // Security settings
  security: {
    sandboxMode: boolean     // Isolatie niveau
    networkAccess: boolean   // Internet toegang
    fileSystemScope: string  // Read/write permissions
  }
  
  // Performance tuning
  performance: {
    cacheEnabled: boolean
    compressionLevel: number
    batchSize: number
  }
}
\`\`\`

## Memory Management System

Het Memory Management System vormt het collectieve geheugen van de swarm, essentieel voor coördinatie en kennisdeling.

### Memory Architecture

\`\`\`
┌──────────────────────────────────────────────────────┐
│              Memory Management System                 │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │           Semantic Memory Layer                │  │
│  │  ┌──────────────┐  ┌──────────────────────┐  │  │
│  │  │   Concept    │  │    Relationship      │  │  │
│  │  │    Graph     │  │      Network         │  │  │
│  │  └──────────────┘  └──────────────────────┘  │  │
│  │  ┌──────────────┐  ┌──────────────────────┐  │  │
│  │  │  Embedding   │  │   Similarity         │  │  │
│  │  │    Store     │  │     Search           │  │  │
│  │  └──────────────┘  └──────────────────────┘  │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │           Temporal Memory Layer                │  │
│  │  ┌──────────────┐  ┌──────────────────────┐  │  │
│  │  │   Event      │  │     Timeline         │  │  │
│  │  │   History    │  │    Indexing          │  │  │
│  │  └──────────────┘  └──────────────────────┘  │  │
│  │  ┌──────────────┐  ┌──────────────────────┐  │  │
│  │  │  Causality   │  │    Pattern           │  │  │
│  │  │   Tracking   │  │   Recognition        │  │  │
│  │  └──────────────┘  └──────────────────────┘  │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │         Persistent Storage Layer               │  │
│  │  ┌──────────────┐  ┌──────────────────────┐  │  │
│  │  │   SQLite     │  │      Redis           │  │  │
│  │  │  Database    │  │      Cache           │  │  │
│  │  └──────────────┘  └──────────────────────┘  │  │
│  │  ┌──────────────┐  ┌──────────────────────┐  │  │
│  │  │    File      │  │     Vector           │  │  │
│  │  │   System     │  │    Database          │  │  │
│  │  └──────────────┘  └──────────────────────┘  │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
\`\`\`

### Memory Operations

\`\`\`typescript
// Memory API structuur
class MemoryManager {
  // Semantic operations
  async store(key: string, value: any, metadata?: MemoryMetadata): Promise<void> {
    // Semantic enrichment
    const embeddings = await this.generateEmbeddings(value)
    const concepts = await this.extractConcepts(value)
    
    // Store met relationships
    await this.semanticStore.add({
      key,
      value,
      embeddings,
      concepts,
      timestamp: Date.now(),
      ...metadata
    })
  }
  
  async retrieve(query: string, options?: RetrievalOptions): Promise<MemoryResult[]> {
    // Multi-strategy retrieval
    const results = await Promise.all([
      this.semanticSearch(query),
      this.temporalSearch(query),
      this.patternMatch(query)
    ])
    
    return this.rankAndMerge(results, options)
  }
  
  // Temporal operations
  async getTimeline(startTime: number, endTime: number): Promise<TimelineEntry[]> {
    return this.temporalStore.queryRange(startTime, endTime)
  }
  
  async findPatterns(criteria: PatternCriteria): Promise<Pattern[]> {
    return this.patternEngine.analyze(criteria)
  }
}
\`\`\`

### Memory Coordination Patterns

\`\`\`
Agent A                Memory System              Agent B
   │                        │                        │
   ├──Store("research")────>│                        │
   │                        ├──Index & Embed         │
   │                        │                        │
   │                        │<──Query("research")────┤
   │                        ├──Semantic Search       │
   │                        │                        │
   │                        ├──Return Results───────>│
   │                        │                        │
   │<──Subscribe("update")──┤                        │
   │                        │                        │
   │                        │<──Update("research")───┤
   ├──Notify("change")─────>│                        │
   │                        │                        │
\`\`\`

## Communication Infrastructure

De Communication Infrastructure zorgt voor betrouwbare, schaalbare communicatie tussen alle componenten.

### Message Queue Architecture

\`\`\`
┌────────────────────────────────────────────────────────┐
│              Message Queue System                       │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────┐     ┌─────────────┐                 │
│  │   Producer   │────>│    Queue    │                 │
│  │   (Agent)    │     │   Manager   │                 │
│  └──────────────┘     └──────┬──────┘                 │
│                              │                         │
│                    ┌─────────┴──────────┐              │
│                    │                    │              │
│           ┌────────▼─────┐     ┌───────▼──────┐       │
│           │  Priority    │     │   Standard   │       │
│           │   Queue      │     │    Queue     │       │
│           └────────┬─────┘     └───────┬──────┘       │
│                    │                    │              │
│                    └─────────┬──────────┘              │
│                              │                         │
│                     ┌────────▼────────┐                │
│                     │   Dispatcher    │                │
│                     └────────┬────────┘                │
│                              │                         │
│         ┌───────────┬────────┴────────┬───────────┐   │
│         │           │                 │           │   │
│    ┌────▼───┐ ┌────▼───┐       ┌────▼───┐ ┌────▼───┐│
│    │Consumer│ │Consumer│       │Consumer│ │Consumer││
│    │(Agent) │ │(Agent) │  ...  │(Agent) │ │(Agent) ││
│    └────────┘ └────────┘       └────────┘ └────────┘│
│                                                        │
└────────────────────────────────────────────────────────┘
\`\`\`

### Event Bus System

\`\`\`typescript
// Event-driven architectuur
interface SwarmEvent {
  id: string
  type: EventType
  source: string
  timestamp: number
  payload: any
  metadata: {
    priority: Priority
    ttl?: number
    correlationId?: string
    causationId?: string
  }
}

class EventBus {
  private subscribers: Map<string, Set<EventHandler>> = new Map()
  private eventStore: EventStore
  
  // Publish event to all subscribers
  async publish(event: SwarmEvent): Promise<void> {
    // Persist event
    await this.eventStore.append(event)
    
    // Notify subscribers
    const handlers = this.subscribers.get(event.type) || new Set()
    
    await Promise.allSettled(
      Array.from(handlers).map(handler => 
        this.executeHandler(handler, event)
      )
    )
  }
  
  // Subscribe to event types
  subscribe(eventType: string, handler: EventHandler): Unsubscribe {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set())
    }
    
    this.subscribers.get(eventType)!.add(handler)
    
    // Return unsubscribe function
    return () => {
      this.subscribers.get(eventType)?.delete(handler)
    }
  }
}
\`\`\`

### Inter-Agent Communication Protocol

\`\`\`
┌─────────────────────────────────────────────────┐
│          Inter-Agent Protocol Stack             │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │         Application Layer                 │  │
│  │   (Business Logic & Agent Behaviors)      │  │
│  └───────────────────────────────────────────┘  │
│                      ▲                          │
│                      │                          │
│  ┌───────────────────▼───────────────────────┐  │
│  │         Protocol Layer                    │  │
│  │   (Message Format & Routing)              │  │
│  └───────────────────────────────────────────┘  │
│                      ▲                          │
│                      │                          │
│  ┌───────────────────▼───────────────────────┐  │
│  │         Transport Layer                   │  │
│  │   (Reliable Delivery & Ordering)          │  │
│  └───────────────────────────────────────────┘  │
│                      ▲                          │
│                      │                          │
│  ┌───────────────────▼───────────────────────┐  │
│  │         Network Layer                     │  │
│  │   (Connection Management)                 │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
\`\`\`

## Tool Ecosystem

Het Tool Ecosystem biedt agents toegang tot externe functionaliteit en services.

### Tool Architecture

\`\`\`
┌───────────────────────────────────────────────────────┐
│                 Tool Ecosystem                         │
├───────────────────────────────────────────────────────┤
│                                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │              Tool Registry                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │  │
│  │  │   Native    │  │     MCP     │  │  Custom │ │  │
│  │  │   Tools     │  │   Servers   │  │ Plugins │ │  │
│  │  └──────┬──────┘  └──────┬──────┘  └────┬────┘ │  │
│  │         │                 │              │      │  │
│  │         └────────┬────────┴──────────────┘      │  │
│  │                  │                              │  │
│  │            ┌─────▼─────┐                        │  │
│  │            │   Tool    │                        │  │
│  │            │ Discovery │                        │  │
│  │            └─────┬─────┘                        │  │
│  └──────────────────┼──────────────────────────────┘  │
│                     │                                 │
│  ┌──────────────────▼──────────────────────────────┐  │
│  │              Tool Adapter Layer                 │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │  │
│  │  │   Schema    │  │ Permission  │  │  Rate   │ │  │
│  │  │ Validation  │  │   Control   │  │ Limiting│ │  │
│  │  └─────────────┘  └─────────────┘  └─────────┘ │  │
│  └─────────────────────────────────────────────────┘  │
│                                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │            Tool Execution Engine                │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │  │
│  │  │   Async     │  │   Error     │  │ Result  │ │  │
│  │  │ Execution   │  │  Handling   │  │ Caching │ │  │
│  │  └─────────────┘  └─────────────┘  └─────────┘ │  │
│  └─────────────────────────────────────────────────┘  │
│                                                       │
└───────────────────────────────────────────────────────┘
\`\`\`

### Native Tools

Claude Flow komt met een uitgebreide set native tools:

\`\`\`typescript
// Native tool categories
const nativeTools = {
  fileSystem: ['Read', 'Write', 'Edit', 'MultiEdit', 'LS', 'Glob'],
  web: ['WebSearch', 'WebFetch'],
  data: ['Grep', 'JSONParse', 'CSVParse'],
  notebook: ['NotebookRead', 'NotebookEdit', 'ExecuteCode'],
  workflow: ['TodoRead', 'TodoWrite', 'Bash'],
  memory: ['MemoryStore', 'MemoryRetrieve', 'MemorySearch']
}

// Tool capability mapping
interface ToolCapability {
  id: string
  name: string
  description: string
  inputSchema: JSONSchema
  outputSchema: JSONSchema
  permissions: string[]
  rateLimit?: RateLimit
}
\`\`\`

### MCP Server Integration

\`\`\`typescript
// MCP (Model Context Protocol) integration
class MCPToolAdapter {
  private mcpClient: MCPClient
  private toolCache: Map<string, MCPTool> = new Map()
  
  async initialize(serverUrl: string): Promise<void> {
    this.mcpClient = await MCPClient.connect(serverUrl)
    await this.discoverTools()
  }
  
  private async discoverTools(): Promise<void> {
    const tools = await this.mcpClient.listTools()
    
    for (const tool of tools) {
      this.toolCache.set(tool.name, {
        ...tool,
        invoke: this.createInvoker(tool)
      })
    }
  }
  
  private createInvoker(tool: MCPToolDef) {
    return async (params: any) => {
      // Validate parameters
      const validatedParams = await this.validateParams(params, tool.schema)
      
      // Execute via MCP
      const result = await this.mcpClient.invoke({
        tool: tool.name,
        parameters: validatedParams
      })
      
      // Transform result
      return this.transformResult(result, tool.outputSchema)
    }
  }
}
\`\`\`

### Custom Plugin System

\`\`\`typescript
// Plugin architecture voor custom tools
interface ClaudeFlowPlugin {
  name: string
  version: string
  tools: ToolDefinition[]
  
  // Lifecycle hooks
  onInstall?: () => Promise<void>
  onUninstall?: () => Promise<void>
  onActivate?: () => Promise<void>
  onDeactivate?: () => Promise<void>
}

class PluginManager {
  private plugins: Map<string, ClaudeFlowPlugin> = new Map()
  
  async installPlugin(pluginPath: string): Promise<void> {
    const plugin = await this.loadPlugin(pluginPath)
    
    // Validate plugin
    await this.validatePlugin(plugin)
    
    // Register tools
    for (const tool of plugin.tools) {
      await this.toolRegistry.register(tool)
    }
    
    // Run install hook
    await plugin.onInstall?.()
    
    this.plugins.set(plugin.name, plugin)
  }
}
\`\`\`

## Performance & Monitoring

Claude Flow biedt uitgebreide monitoring en performance optimalisatie:

\`\`\`
┌─────────────────────────────────────────────┐
│         Monitoring Dashboard                 │
├─────────────────────────────────────────────┤
│                                             │
│  Active Agents: 12    Tasks: 45            │
│  Memory Usage: 2.3GB  CPU: 45%             │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │     Agent Performance Metrics        │   │
│  │  ┌────────┬────────┬────────┐      │   │
│  │  │ Agent  │ Tasks  │ Avg    │      │   │
│  │  │ Type   │ /hour  │ Time   │      │   │
│  │  ├────────┼────────┼────────┤      │   │
│  │  │Research│   120  │ 1.2s   │      │   │
│  │  │Coder   │    45  │ 3.5s   │      │   │
│  │  │Analyst │    78  │ 2.1s   │      │   │
│  │  └────────┴────────┴────────┘      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │        System Health                 │   │
│  │  Queue Depth: ████░░░░ 125 msgs    │   │
│  │  Memory Pool: ████████░ 85%        │   │
│  │  Error Rate:  ██░░░░░░ 2.1%       │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
\`\`\`

## Best Practices

1. **Component Isolation**: Houd componenten loosely coupled
2. **Event-Driven Design**: Gebruik events voor inter-component communicatie
3. **Memory Efficiency**: Implementeer garbage collection strategieën
4. **Tool Safety**: Valideer altijd tool inputs en outputs
5. **Monitoring**: Implementeer comprehensive logging en metrics

## Samenvatting

Claude Flow's architectuur is ontworpen voor maximale flexibiliteit, schaalbaarheid en robuustheid. Door de modulaire opbouw kunnen componenten onafhankelijk worden geschaald en vervangen. Het event-driven design zorgt voor responsive systeem gedrag, terwijl de memory en communication layers effectieve agent coördinatie mogelijk maken.

In de volgende les gaan we dieper in op de MCP integratie en het bouwen van custom tools.
  `,
  codeExamples: [
    {
      id: 'code-2-1-1',
      title: 'Basic Component Initialization',
      code: `// Initialize Claude Flow core components
import { ClaudeFlow } from '@claude-flow/core'

async function initializeSystem() {
  const flow = new ClaudeFlow({
    // Core configuration
    orchestration: {
      maxConcurrentAgents: 20,
      defaultTimeout: 300000,
      retryPolicy: {
        maxRetries: 3,
        backoffMultiplier: 2
      }
    },
    
    // Memory configuration
    memory: {
      backend: 'sqlite',
      persistentStorage: './claude-flow-data',
      cache: {
        type: 'redis',
        host: 'localhost',
        port: 6379
      },
      semanticSearch: {
        enabled: true,
        embeddingModel: 'text-embedding-ada-002'
      }
    },
    
    // Communication settings
    communication: {
      messageQueue: {
        type: 'in-memory', // or 'rabbitmq', 'kafka'
        maxQueueSize: 10000
      },
      eventBus: {
        persistEvents: true,
        eventRetention: '7d'
      }
    },
    
    // Tool ecosystem
    tools: {
      native: true,
      mcpServers: [
        'http://localhost:3000/mcp'
      ],
      customPlugins: './plugins'
    }
  })
  
  // Initialize subsystems
  await flow.initialize()
  
  // Start monitoring
  const monitor = await flow.startMonitoring({
    port: 8080,
    metrics: ['agents', 'memory', 'tasks', 'errors']
  })
  
  return { flow, monitor }
}

// Usage
const { flow, monitor } = await initializeSystem()
console.log('Claude Flow initialized at http://localhost:8080')`,
      language: 'typescript'
    },
    {
      id: 'code-2-1-2',
      title: 'Agent Runtime Example',
      code: `// Creating and managing agents in the runtime environment
class AgentRuntime {
  private containers: Map<string, AgentContainer> = new Map()
  
  async spawnAgent(config: AgentConfig): Promise<Agent> {
    // Create container with resource limits
    const container = new AgentContainer({
      id: generateId(),
      resources: {
        maxMemoryMB: config.memoryLimit || 512,
        maxCPUPercent: config.cpuLimit || 25,
        maxExecutionTime: config.timeout || 300000
      },
      security: {
        sandboxMode: true,
        networkAccess: config.requiresNetwork || false,
        fileSystemScope: config.fileAccess || 'readonly'
      }
    })
    
    // Initialize agent within container
    const agent = await container.createAgent({
      type: config.type,
      capabilities: config.capabilities,
      tools: config.allowedTools
    })
    
    // Setup lifecycle management
    agent.on('stateChange', (oldState, newState) => {
      this.handleStateTransition(agent, oldState, newState)
    })
    
    // Resource monitoring
    container.on('resourceThreshold', (resource, usage) => {
      this.handleResourceAlert(agent, resource, usage)
    })
    
    // Register in runtime
    this.containers.set(agent.id, container)
    
    // Start agent
    await agent.start()
    
    return agent
  }
  
  private async handleStateTransition(
    agent: Agent, 
    oldState: AgentState, 
    newState: AgentState
  ): Promise<void> {
    console.log(\`Agent \${agent.id}: \${oldState} -> \${newState}\`)
    
    // Handle cleanup on termination
    if (newState === 'TERMINATED') {
      await this.cleanupAgent(agent.id)
    }
    
    // Emit state change event
    this.eventBus.emit({
      type: 'agent.stateChange',
      agentId: agent.id,
      oldState,
      newState,
      timestamp: Date.now()
    })
  }
  
  private async cleanupAgent(agentId: string): Promise<void> {
    const container = this.containers.get(agentId)
    if (container) {
      await container.destroy()
      this.containers.delete(agentId)
    }
  }
}

// Usage example
const runtime = new AgentRuntime()

const researcher = await runtime.spawnAgent({
  type: 'researcher',
  capabilities: ['web_search', 'document_analysis'],
  allowedTools: ['WebSearch', 'WebFetch', 'Read'],
  memoryLimit: 1024,
  requiresNetwork: true
})

// Agent is now running in isolated container
await researcher.execute({
  task: 'Research AI trends 2024',
  timeout: 60000
})`,
      language: 'typescript'
    },
    {
      id: 'code-2-1-3',
      title: 'Memory System Integration',
      code: `// Advanced memory operations with semantic search
class SemanticMemory {
  private embeddings: EmbeddingStore
  private graph: ConceptGraph
  private temporal: TemporalIndex
  
  async store(key: string, data: any, context?: MemoryContext): Promise<void> {
    // Generate embeddings for semantic search
    const embedding = await this.generateEmbedding(data)
    
    // Extract concepts and entities
    const analysis = await this.analyzeContent(data)
    
    // Build relationships
    const relationships = await this.findRelationships(analysis.concepts)
    
    // Create memory entry
    const entry: MemoryEntry = {
      id: generateId(),
      key,
      data,
      embedding,
      concepts: analysis.concepts,
      entities: analysis.entities,
      relationships,
      timestamp: Date.now(),
      context: context || {},
      metadata: {
        dataType: typeof data,
        size: JSON.stringify(data).length,
        agent: context?.agentId
      }
    }
    
    // Store in multiple indices
    await Promise.all([
      this.embeddings.store(entry.id, embedding),
      this.graph.addNode(entry),
      this.temporal.index(entry)
    ])
    
    // Update concept graph
    for (const concept of analysis.concepts) {
      await this.graph.strengthenConnection(key, concept)
    }
  }
  
  async retrieve(
    query: string, 
    options: RetrievalOptions = {}
  ): Promise<MemoryResult[]> {
    const { 
      limit = 10, 
      threshold = 0.7,
      timeRange,
      concepts,
      agents 
    } = options
    
    // Multi-strategy search
    const strategies = []
    
    // Semantic similarity search
    strategies.push(this.semanticSearch(query, limit * 2, threshold))
    
    // Concept-based search if specified
    if (concepts?.length) {
      strategies.push(this.conceptSearch(concepts, limit))
    }
    
    // Temporal search if time range specified
    if (timeRange) {
      strategies.push(this.temporalSearch(timeRange, query))
    }
    
    // Agent-specific search
    if (agents?.length) {
      strategies.push(this.agentMemorySearch(agents, query))
    }
    
    // Execute all strategies in parallel
    const results = await Promise.all(strategies)
    
    // Merge and rank results
    return this.mergeAndRank(results.flat(), limit)
  }
  
  private async semanticSearch(
    query: string, 
    limit: number, 
    threshold: number
  ): Promise<MemoryResult[]> {
    const queryEmbedding = await this.generateEmbedding(query)
    
    const matches = await this.embeddings.search({
      vector: queryEmbedding,
      limit,
      threshold
    })
    
    return matches.map(match => ({
      entry: this.getEntry(match.id),
      score: match.similarity,
      strategy: 'semantic'
    }))
  }
  
  private async conceptSearch(
    concepts: string[], 
    limit: number
  ): Promise<MemoryResult[]> {
    const subgraph = await this.graph.getSubgraph(concepts)
    
    return subgraph.nodes
      .sort((a, b) => b.centrality - a.centrality)
      .slice(0, limit)
      .map(node => ({
        entry: node.data,
        score: node.centrality,
        strategy: 'concept'
      }))
  }
}

// Usage
const memory = new SemanticMemory()

// Store research findings
await memory.store('market_analysis_2024', {
  findings: 'AI adoption growing 45% YoY',
  segments: ['enterprise', 'startup', 'government'],
  keyTrends: ['automation', 'llm_integration', 'edge_ai']
}, {
  agentId: 'researcher-001',
  taskId: 'market-research',
  confidence: 0.92
})

// Retrieve related memories
const related = await memory.retrieve('AI market growth trends', {
  limit: 5,
  concepts: ['ai_adoption', 'market_growth'],
  timeRange: { start: Date.now() - 30*24*60*60*1000 } // Last 30 days
})`,
      language: 'typescript'
    }
  ],
  assignments: [
    {
      id: 'assignment-2-1-1',
      title: 'Ontwerp Component Integratie',
      description: 'Ontwerp hoe je een nieuwe component zou toevoegen aan Claude Flow. Beschrijf de interfaces, communicatie patronen, en integratie punten.',
      type: 'project',
      difficulty: 'medium'
    },
    {
      id: 'assignment-2-1-2',
      title: 'Implementeer Memory Cache',
      description: 'Bouw een eenvoudige in-memory cache voor het Memory Management System met TTL support en LRU eviction.',
      type: 'project',
      difficulty: 'hard'
    }
  ],
  resources: [
    {
      title: 'Claude Flow Architecture Deep Dive',
      type: 'documentation',
      url: 'https://docs.claude-flow.ai/architecture/overview'
    },
    {
      title: 'Event-Driven Architecture Patterns',
      type: 'article',
      url: 'https://martinfowler.com/articles/event-driven.html'
    },
    {
      title: 'Building Scalable Agent Systems',
      type: 'video',
      url: 'https://youtube.com/watch?v=scalable-agents'
    },
    {
      title: 'Memory Systems for AI Applications',
      type: 'paper',
      url: 'https://arxiv.org/papers/ai-memory-systems'
    }
  ]
};