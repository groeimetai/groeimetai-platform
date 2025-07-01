import { Lesson } from '@/lib/data/courses'

export const lesson1_2: Lesson = {
  id: 'lesson-1-2',
  title: 'Agent types en capabilities',
  duration: '40 min',
  content: `
# Agent Types en Capabilities

In deze les onderzoeken we de verschillende types AI agents binnen het Claude Flow ecosysteem, hun unieke capabilities, en hoe ze effectief samenwerken in swarm architecturen.

## 1. Specialist Agents

Specialist agents zijn ontworpen voor specifieke taken en hebben diepgaande expertise in hun domein.

### Researcher Agent
De researcher agent is geoptimaliseerd voor informatievergaring en analyse:

\`\`\`typescript
// Researcher agent configuratie
const researcherConfig = {
  type: 'researcher',
  capabilities: [
    'web_search',
    'document_analysis',
    'data_extraction',
    'fact_checking',
    'trend_analysis'
  ],
  memory: {
    type: 'semantic',
    retention: 'long-term'
  },
  tools: [
    'WebSearch',
    'WebFetch',
    'DocumentParser',
    'CitationManager'
  ]
}
\`\`\`

**Kenmerken:**
- Geavanceerde zoekstrategieën
- Cross-referentie validatie
- Bronverificatie
- Contextbehoud over meerdere queries

### Coder Agent
De coder agent excelleert in software ontwikkeling taken:

\`\`\`typescript
// Coder agent architectuur
class CoderAgent extends BaseAgent {
  capabilities = {
    languages: ['TypeScript', 'Python', 'JavaScript', 'Rust'],
    paradigms: ['OOP', 'Functional', 'Reactive'],
    frameworks: ['React', 'Next.js', 'FastAPI', 'Django'],
    testing: ['Unit', 'Integration', 'E2E']
  }
  
  async generateCode(specification: CodeSpec): Promise<CodeOutput> {
    // Intelligente code generatie met context awareness
    const context = await this.loadProjectContext()
    const style = await this.analyzeCodeStyle(context)
    
    return this.llm.generate({
      prompt: this.buildCodePrompt(specification, context, style),
      temperature: 0.2,
      maxTokens: 4000
    })
  }
}
\`\`\`

### Analyst Agent
Gespecialiseerd in data-analyse en business intelligence:

\`\`\`typescript
// Analyst agent pipeline
const analyticsWorkflow = {
  stages: [
    {
      name: 'data_ingestion',
      tools: ['SQLQuery', 'APIFetch', 'CSVParser']
    },
    {
      name: 'transformation',
      tools: ['DataCleaner', 'Normalizer', 'Aggregator']
    },
    {
      name: 'analysis',
      tools: ['StatisticalAnalysis', 'TrendDetector', 'AnomalyFinder']
    },
    {
      name: 'visualization',
      tools: ['ChartGenerator', 'ReportBuilder', 'DashboardCreator']
    }
  ]
}
\`\`\`

## 2. Generalist Agents

Generalist agents zijn veelzijdig en kunnen verschillende taken uitvoeren:

\`\`\`typescript
// Generalist agent configuratie
interface GeneralistAgent {
  id: string
  type: 'generalist'
  adaptability: number // 0-1 score
  taskHistory: Task[]
  
  // Dynamische capability learning
  async adaptToTask(task: Task): Promise<void> {
    const requiredSkills = await this.analyzeTaskRequirements(task)
    const currentSkills = this.getCapabilities()
    
    const skillGap = requiredSkills.filter(
      skill => !currentSkills.includes(skill)
    )
    
    if (skillGap.length > 0) {
      await this.learnNewCapabilities(skillGap)
    }
  }
}
\`\`\`

**Voordelen van generalist agents:**
- Flexibele inzetbaarheid
- Lagere overhead voor simpele taken
- Snelle context switching
- Ideaal voor exploratieve taken

## 3. Coordinator Agents

Coordinator agents managen de workflow en communicatie tussen andere agents:

\`\`\`typescript
// Hierarchische coordinator architectuur
class SwarmCoordinator {
  private agents: Map<string, Agent> = new Map()
  private taskQueue: PriorityQueue<Task> = new PriorityQueue()
  private communicationBus: EventEmitter = new EventEmitter()
  
  async orchestrateSwarm(objective: SwarmObjective): Promise<SwarmResult> {
    // Task decomposition
    const subtasks = await this.decomposeObjective(objective)
    
    // Agent assignment
    const assignments = await this.assignTasksToAgents(subtasks)
    
    // Execution monitoring
    const results = await this.executeWithMonitoring(assignments)
    
    // Result synthesis
    return this.synthesizeResults(results)
  }
  
  private async assignTasksToAgents(tasks: Task[]): Promise<Assignment[]> {
    return tasks.map(task => ({
      task,
      agent: this.selectOptimalAgent(task),
      priority: this.calculatePriority(task),
      dependencies: this.identifyDependencies(task, tasks)
    }))
  }
}
\`\`\`

### Coordinator Communication Patterns

**1. Broadcast Pattern**
\`\`\`typescript
coordinator.broadcast({
  type: 'TASK_UPDATE',
  payload: {
    taskId: 'research-001',
    status: 'completed',
    results: analysisData
  }
})
\`\`\`

**2. Request-Response Pattern**
\`\`\`typescript
const capability = await coordinator.requestCapability({
  type: 'CODE_GENERATION',
  requirements: {
    language: 'TypeScript',
    framework: 'React'
  }
})
\`\`\`

**3. Pub-Sub Pattern**
\`\`\`typescript
// Agents subscriben op relevante events
researchAgent.subscribe('NEW_DATA_AVAILABLE', async (data) => {
  await researchAgent.analyzeNewData(data)
})

coderAgent.subscribe('SPEC_UPDATED', async (spec) => {
  await coderAgent.refactorCode(spec)
})
\`\`\`

## 4. Tool-Using Agents

Tool-using agents hebben toegang tot externe tools en API's:

\`\`\`typescript
// Tool-augmented agent architectuur
class ToolAugmentedAgent extends BaseAgent {
  private toolRegistry: ToolRegistry
  
  async executeWithTools(task: Task): Promise<Result> {
    // Tool selection based on task requirements
    const requiredTools = await this.identifyRequiredTools(task)
    
    // Tool availability check
    const availableTools = await this.toolRegistry.checkAvailability(requiredTools)
    
    // Fallback strategieën
    if (availableTools.length < requiredTools.length) {
      const alternatives = await this.findAlternativeTools(
        requiredTools.filter(t => !availableTools.includes(t))
      )
      availableTools.push(...alternatives)
    }
    
    // Tool execution pipeline
    return this.executePipeline(task, availableTools)
  }
  
  // Tool capability mapping
  private toolCapabilities = {
    'WebSearch': ['research', 'fact_checking', 'trend_analysis'],
    'CodeAnalyzer': ['code_review', 'security_audit', 'performance_analysis'],
    'DatabaseQuery': ['data_extraction', 'aggregation', 'reporting'],
    'FileSystem': ['file_management', 'batch_processing', 'archiving']
  }
}
\`\`\`

### MCP (Model Context Protocol) Integration

\`\`\`typescript
// MCP tool integration voor Claude Flow
const mcpToolAdapter = {
  async invokeTool(toolName: string, params: any): Promise<any> {
    const tool = await this.mcpClient.getTool(toolName)
    
    if (!tool) {
      throw new Error(\`Tool \\\${toolName} not available in MCP server\`)
    }
    
    return this.mcpClient.invoke({
      tool: toolName,
      parameters: this.validateParams(params, tool.schema)
    })
  }
}
\`\`\`

## 5. Agent Communication Patterns

### Direct Messaging
\`\`\`typescript
// Point-to-point communication
interface AgentMessage {
  from: string
  to: string
  type: MessageType
  payload: any
  timestamp: number
  correlationId?: string
}

class AgentCommunicator {
  async sendMessage(message: AgentMessage): Promise<void> {
    const targetAgent = this.agentRegistry.get(message.to)
    
    if (!targetAgent) {
      throw new Error(\`Agent \\\${message.to} not found\`)
    }
    
    await targetAgent.receiveMessage(message)
    
    // Log voor monitoring
    this.logger.log('message_sent', {
      from: message.from,
      to: message.to,
      type: message.type
    })
  }
}
\`\`\`

### Shared Memory Pattern
\`\`\`typescript
// Collaborative memory architecture
class SharedMemory {
  private store: Map<string, MemoryEntry> = new Map()
  private locks: Map<string, string> = new Map() // key -> agentId
  
  async write(key: string, value: any, agentId: string): Promise<void> {
    await this.acquireLock(key, agentId)
    
    try {
      this.store.set(key, {
        value,
        lastModified: Date.now(),
        modifiedBy: agentId,
        version: this.getNextVersion(key)
      })
      
      // Notify interested agents
      await this.notifySubscribers(key, value)
    } finally {
      this.releaseLock(key, agentId)
    }
  }
  
  async read(key: string): Promise<any> {
    const entry = this.store.get(key)
    return entry?.value
  }
}
\`\`\`

### Event-Driven Architecture
\`\`\`typescript
// Event-driven swarm coordination
class SwarmEventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map()
  
  // Agents registreren event handlers
  on(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set())
    }
    this.handlers.get(eventType)!.add(handler)
  }
  
  // Event broadcasting
  async emit(event: SwarmEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || new Set()
    
    // Parallel event processing
    await Promise.all(
      Array.from(handlers).map(handler => 
        handler(event).catch(err => 
          this.handleError(err, event, handler)
        )
      )
    )
  }
}
\`\`\`

## Praktijkvoorbeeld: Multi-Agent Collaboration

\`\`\`typescript
// Voorbeeld van een complete agent swarm voor product development
async function productDevelopmentSwarm(productIdea: string) {
  const coordinator = new SwarmCoordinator()
  
  // 1. Research fase
  const marketResearch = await coordinator.dispatch({
    agent: 'researcher',
    task: 'analyze_market',
    params: { idea: productIdea }
  })
  
  // 2. Design fase (parallel)
  const [technicalDesign, uiDesign] = await Promise.all([
    coordinator.dispatch({
      agent: 'architect',
      task: 'design_architecture',
      params: { requirements: marketResearch.requirements }
    }),
    coordinator.dispatch({
      agent: 'designer',
      task: 'create_ui_mockups',
      params: { userPersonas: marketResearch.personas }
    })
  ])
  
  // 3. Development fase
  const implementation = await coordinator.dispatch({
    agent: 'coder',
    task: 'implement_mvp',
    params: {
      architecture: technicalDesign,
      designs: uiDesign
    }
  })
  
  // 4. Testing & Analysis
  const qualityReport = await coordinator.dispatch({
    agent: 'tester',
    task: 'comprehensive_testing',
    params: { codebase: implementation }
  })
  
  return {
    research: marketResearch,
    design: { technical: technicalDesign, ui: uiDesign },
    implementation,
    qualityReport
  }
}
\`\`\`

## Best Practices

1. **Agent Specialisatie**: Houd agents gefocust op hun kerncompetentie
2. **Loose Coupling**: Minimaliseer directe dependencies tussen agents
3. **Failure Handling**: Implementeer robuuste error handling en fallback mechanismen
4. **Resource Management**: Monitor en limiteer resource gebruik per agent
5. **Observability**: Log alle agent interacties voor debugging en optimalisatie

## Samenvatting

De kracht van Claude Flow ligt in de diversiteit en specialisatie van agents. Door de juiste combinatie van specialist, generalist, coordinator en tool-using agents kunnen complexe taken efficiënt worden opgelost. De verschillende communicatiepatronen zorgen voor flexibele en schaalbare swarm architecturen.

In de volgende les gaan we dieper in op de MCP integration en hoe je custom tools kunt bouwen voor je agents.
  `,
  codeExamples: [
    {
      id: 'example-1-2-1',
      title: 'Basis Agent Swarm Setup',
      language: 'bash',
      code: `# Start een research swarm met verschillende agent types
./claude-flow swarm "Analyze competitor landscape for SaaS product" \\
  --strategy research \\
  --agents "researcher:2,analyst:1,coordinator:1" \\
  --mode hierarchical \\
  --parallel \\
  --monitor

# Custom agent configuratie
./claude-flow agent spawn researcher \\
  --name "market-researcher" \\
  --capabilities "web_search,trend_analysis,report_generation" \\
  --memory-type "persistent"

# Coordinator met sub-agents
./claude-flow agent spawn coordinator \\
  --name "project-lead" \\
  --sub-agents "researcher:tech-scout,coder:backend-dev,analyst:data-analyst"`
    },
    {
      id: 'example-1-2-2',
      title: 'Agent Communication Voorbeeld',
      language: 'typescript',
      code: `// Praktisch voorbeeld van agent communicatie
import { ClaudeFlow } from '@claude-flow/core'

const flow = new ClaudeFlow()

// Spawn specialized agents
const researcher = await flow.spawnAgent('researcher', {
  name: 'market-analyst',
  tools: ['WebSearch', 'DataAnalysis']
})

const coder = await flow.spawnAgent('coder', {
  name: 'api-developer',
  language: 'TypeScript',
  framework: 'Express'
})

const coordinator = await flow.spawnAgent('coordinator', {
  name: 'project-manager'
})

// Setup communication channels
coordinator.on('task:assigned', async (task) => {
  console.log(\`Task assigned: \\\${task.description}\`)
})

researcher.on('research:complete', async (results) => {
  // Forward results to coder
  await coder.send('specifications', {
    requirements: results.findings,
    priority: results.marketUrgency
  })
})

// Execute coordinated workflow
const projectResult = await coordinator.orchestrate({
  objective: 'Build API for market analysis tool',
  phases: [
    { agent: researcher, task: 'Analyze market requirements' },
    { agent: coder, task: 'Implement REST API based on research' }
  ]
})

console.log('Project completed:', projectResult)`
    }
  ],
  assignments: [
    {
      id: 'assignment-1-2-1',
      title: 'Design een Multi-Agent Systeem',
      description: 'Ontwerp een agent swarm architectuur voor een specifieke use case naar keuze (bijv. content creatie, data analyse, of software development). Beschrijf welke agent types je zou gebruiken en hoe ze zouden communiceren.',
      difficulty: 'medium',
      type: 'project',
      initialCode: `// Use Case: Geautomatiseerde content creatie voor een blog

// 1. Definieer de benodigde agent types (bijv. researcher, writer, editor, seo_specialist).
// 2. Beschrijf de capabilities van elke agent.
// 3. Ontwerp de communicatie flow tussen de agents (bijv. met een message queue of shared memory).
// 4. Teken een diagram van de swarm architectuur.
`,
      hints: [
        'Denk na over de data die elke agent nodig heeft en produceert.',
        'Kies een coördinatiepatroon dat past bij de use case (bijv. hiërarchisch).',
        'Beschrijf hoe je de kwaliteit van de output waarborgt.'
      ]
    },
    {
      id: 'assignment-1-2-2',
      title: 'Implementeer Agent Communication',
      description: 'Schrijf een TypeScript class die basic agent-to-agent communicatie implementeert met event handling en message passing. Include error handling en een simple retry mechanisme.',
      difficulty: 'hard',
      type: 'project',
      initialCode: `// Implementeer een AgentCommunicator class met de volgende methodes:
// - sendMessage(to: string, message: any)
// - broadcast(message: any)
// - on(event: string, handler: (message: any) => void)
// - Implementeer een simpele retry logica voor het versturen van berichten.
`,
      hints: [
        'Gebruik een event emitter library (bijv. `events` in Node.js).',
        'Denk na over hoe je omgaat met berichten die niet afgeleverd kunnen worden.',
        'Maak de class generiek zodat deze voor verschillende agent types gebruikt kan worden.'
      ]
    }
  ],
  resources: [
    {
      title: 'Claude Flow Agent Types Documentation',
      type: 'documentation',
      url: 'https://claude-flow.ai/docs/agents/types'
    },
    {
      title: 'Multi-Agent Systems: A Modern Approach',
      type: 'book',
      url: 'https://www.amazon.com/Multi-Agent-Systems-Modern-Approach-Intelligent/dp/0262232259'
    }
  ]
}