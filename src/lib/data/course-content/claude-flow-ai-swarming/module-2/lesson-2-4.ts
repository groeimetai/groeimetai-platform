import type { Lesson } from '@/lib/data/courses';

export const lesson24: Lesson = {
  id: 'lesson-2-4',
  title: 'Tool integration en MCP',
  duration: '30 min',
  content: `
# Tool Integration en Model Context Protocol (MCP)

In deze les verkennen we hoe Claude Flow agents kunnen worden uitgebreid met tools via het Model Context Protocol (MCP), een open standaard voor AI-tool integratie.

## Model Context Protocol Basics

### Wat is MCP?
Het Model Context Protocol is een gestandaardiseerd protocol dat AI models in staat stelt om veilig en efficiënt externe tools te gebruiken. Het biedt een uniforme interface voor tool discovery, registratie en uitvoering.

### Kernconcepten van MCP:

1. **Tool Descriptors**: Gestandaardiseerde beschrijvingen van tool capabilities
2. **Permission Model**: Granulaire controle over tool toegang
3. **Execution Context**: Veilige sandboxed uitvoering
4. **Result Streaming**: Real-time feedback van tool executie

### MCP Architectuur:

\`\`\`typescript
// MCP Server configuratie
interface MCPServerConfig {
  name: string
  version: string
  description: string
  tools: ToolDescriptor[]
  permissions: PermissionSchema
  rateLimit?: RateLimitConfig
}

// Tool descriptor format
interface ToolDescriptor {
  name: string
  description: string
  inputSchema: JSONSchema
  outputSchema: JSONSchema
  permissions: string[]
  timeout?: number
  retryPolicy?: RetryPolicy
}
\`\`\`

## Tool Registration in Claude Flow

### 1. Built-in Tools
Claude Flow komt met een uitgebreide set van built-in tools:

\`\`\`bash
# List alle beschikbare MCP tools
./claude-flow mcp tools

# Output:
Available MCP Tools:
- WebSearch: Search the web for current information
- WebFetch: Fetch and process web content
- FileSystem: Read/write files with sandboxed access
- Database: Query SQL databases
- API: Make HTTP requests to external APIs
- Git: Version control operations
- Docker: Container management
- Kubernetes: K8s cluster operations
\`\`\`

### 2. Tool Registration Process

\`\`\`typescript
// Tool registratie in Claude Flow
import { MCPToolRegistry } from '@claude-flow/mcp'

class CustomToolRegistration {
  private registry: MCPToolRegistry
  
  constructor() {
    this.registry = new MCPToolRegistry()
  }
  
  async registerTool(toolConfig: ToolConfig): Promise<void> {
    // Validate tool schema
    const validation = await this.validateToolSchema(toolConfig)
    if (!validation.valid) {
      throw new Error(\`Invalid tool schema: \${validation.errors}\`)
    }
    
    // Register with MCP server
    const tool = {
      name: toolConfig.name,
      description: toolConfig.description,
      handler: this.createToolHandler(toolConfig),
      permissions: toolConfig.permissions || ['read'],
      inputSchema: toolConfig.inputSchema,
      outputSchema: toolConfig.outputSchema
    }
    
    await this.registry.register(tool)
    
    // Make available to agents
    await this.publishToAgents(tool)
  }
  
  private createToolHandler(config: ToolConfig) {
    return async (input: any, context: ExecutionContext) => {
      // Pre-execution validation
      await this.validateInput(input, config.inputSchema)
      
      // Execute with timeout and retry
      const result = await this.executeWithPolicy(
        () => config.execute(input, context),
        config.timeout || 30000,
        config.retryPolicy
      )
      
      // Post-execution validation
      await this.validateOutput(result, config.outputSchema)
      
      return result
    }
  }
}
\`\`\`

### 3. Tool Discovery
Agents kunnen dynamisch tools ontdekken:

\`\`\`typescript
// Agent tool discovery
class ToolAwareAgent extends BaseAgent {
  private availableTools: Map<string, Tool> = new Map()
  
  async discoverTools(): Promise<void> {
    // Query MCP server voor beschikbare tools
    const tools = await this.mcpClient.listTools({
      capabilities: this.requiredCapabilities,
      permissions: this.grantedPermissions
    })
    
    // Filter op relevantie
    const relevantTools = tools.filter(tool => 
      this.isRelevantForTask(tool)
    )
    
    // Cache tool references
    relevantTools.forEach(tool => {
      this.availableTools.set(tool.name, tool)
    })
  }
  
  async selectToolForTask(task: Task): Promise<Tool | null> {
    const taskRequirements = this.analyzeTaskRequirements(task)
    
    // Score tools op geschiktheid
    const toolScores = Array.from(this.availableTools.values())
      .map(tool => ({
        tool,
        score: this.calculateToolFitness(tool, taskRequirements)
      }))
      .filter(({ score }) => score > 0.7)
      .sort((a, b) => b.score - a.score)
    
    return toolScores[0]?.tool || null
  }
}
\`\`\`

## Custom Tool Development

### 1. Basis Tool Template

\`\`\`typescript
// Custom tool development template
import { MCPTool, ToolContext, ToolResult } from '@claude-flow/mcp'

export class CustomAnalyticsTool implements MCPTool {
  name = 'custom-analytics'
  description = 'Advanced analytics for business metrics'
  version = '1.0.0'
  
  // Define input schema
  inputSchema = {
    type: 'object',
    properties: {
      dataset: {
        type: 'string',
        description: 'Dataset identifier'
      },
      metrics: {
        type: 'array',
        items: { type: 'string' },
        description: 'Metrics to calculate'
      },
      timeRange: {
        type: 'object',
        properties: {
          start: { type: 'string', format: 'date' },
          end: { type: 'string', format: 'date' }
        }
      }
    },
    required: ['dataset', 'metrics']
  }
  
  // Define output schema
  outputSchema = {
    type: 'object',
    properties: {
      results: {
        type: 'object',
        additionalProperties: {
          type: 'object',
          properties: {
            value: { type: 'number' },
            trend: { type: 'string' },
            confidence: { type: 'number' }
          }
        }
      },
      metadata: {
        type: 'object',
        properties: {
          processingTime: { type: 'number' },
          dataPoints: { type: 'number' }
        }
      }
    }
  }
  
  // Tool implementation
  async execute(input: any, context: ToolContext): Promise<ToolResult> {
    const startTime = Date.now()
    
    try {
      // Validate permissions
      await this.checkPermissions(context)
      
      // Load dataset
      const data = await this.loadDataset(input.dataset, input.timeRange)
      
      // Calculate metrics
      const results = {}
      for (const metric of input.metrics) {
        results[metric] = await this.calculateMetric(data, metric)
      }
      
      return {
        success: true,
        data: {
          results,
          metadata: {
            processingTime: Date.now() - startTime,
            dataPoints: data.length
          }
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        errorCode: 'ANALYTICS_ERROR'
      }
    }
  }
  
  private async calculateMetric(data: any[], metric: string): Promise<any> {
    // Metric calculation logic
    switch (metric) {
      case 'revenue':
        return this.calculateRevenue(data)
      case 'growth':
        return this.calculateGrowth(data)
      case 'churn':
        return this.calculateChurn(data)
      default:
        throw new Error(\`Unknown metric: \${metric}\`)
    }
  }
  
  // Permission checking
  private async checkPermissions(context: ToolContext): Promise<void> {
    if (!context.permissions.includes('analytics:read')) {
      throw new Error('Missing required permission: analytics:read')
    }
  }
}
\`\`\`

### 2. Advanced Tool met State Management

\`\`\`typescript
// Stateful tool voor complexe operaties
export class StatefulProcessingTool implements MCPTool {
  name = 'stateful-processor'
  private sessions: Map<string, ProcessingSession> = new Map()
  
  async execute(input: any, context: ToolContext): Promise<ToolResult> {
    const sessionId = input.sessionId || this.generateSessionId()
    
    let session = this.sessions.get(sessionId)
    if (!session) {
      session = await this.createSession(sessionId, context)
      this.sessions.set(sessionId, session)
    }
    
    // Process based on session state
    switch (input.operation) {
      case 'start':
        return await this.startProcessing(session, input)
      case 'status':
        return await this.getStatus(session)
      case 'stop':
        return await this.stopProcessing(session)
      case 'results':
        return await this.getResults(session)
      default:
        throw new Error(\`Unknown operation: \${input.operation}\`)
    }
  }
  
  private async createSession(
    sessionId: string, 
    context: ToolContext
  ): Promise<ProcessingSession> {
    return {
      id: sessionId,
      state: 'idle',
      startTime: null,
      progress: 0,
      results: [],
      context: context
    }
  }
  
  // Cleanup oude sessies
  async cleanup(): Promise<void> {
    const now = Date.now()
    const timeout = 3600000 // 1 hour
    
    for (const [id, session] of this.sessions) {
      if (now - session.lastActivity > timeout) {
        await this.cleanupSession(session)
        this.sessions.delete(id)
      }
    }
  }
}
\`\`\`

## Tool Sharing Between Agents

### 1. Shared Tool Pool
Agents kunnen tools delen via een centrale pool:

\`\`\`typescript
// Shared tool pool architectuur
class SharedToolPool {
  private tools: Map<string, MCPTool> = new Map()
  private usage: Map<string, ToolUsageStats> = new Map()
  
  async requestTool(
    agentId: string, 
    toolName: string
  ): Promise<ToolHandle> {
    const tool = this.tools.get(toolName)
    if (!tool) {
      throw new Error(\`Tool not found: \${toolName}\`)
    }
    
    // Check rate limits
    await this.checkRateLimit(agentId, toolName)
    
    // Create scoped handle
    const handle = new ToolHandle(tool, {
      agentId,
      permissions: await this.getAgentPermissions(agentId),
      rateLimit: this.getRateLimit(agentId, toolName)
    })
    
    // Track usage
    this.trackUsage(agentId, toolName)
    
    return handle
  }
  
  async shareTool(
    fromAgent: string,
    toAgent: string,
    toolName: string,
    permissions?: string[]
  ): Promise<void> {
    // Validate sharing permissions
    if (!await this.canShare(fromAgent, toolName)) {
      throw new Error('Agent lacks sharing permission')
    }
    
    // Create shared reference
    const sharedTool = {
      originalTool: toolName,
      sharedBy: fromAgent,
      sharedWith: toAgent,
      permissions: permissions || ['read', 'execute'],
      expiresAt: Date.now() + 86400000 // 24 hours
    }
    
    await this.registerSharedTool(sharedTool)
  }
}
\`\`\`

### 2. Tool Orchestration
Coordineer tool gebruik tussen multiple agents:

\`\`\`bash
# Tool orchestration workflow
./claude-flow workflow tool-pipeline.yaml

# tool-pipeline.yaml:
name: multi-tool-analysis
tools:
  - name: data-extractor
    assign-to: researcher
    
  - name: data-processor
    assign-to: analyst
    depends-on: data-extractor
    
  - name: report-generator
    assign-to: documenter
    depends-on: data-processor

agents:
  - type: researcher
    tools: [data-extractor, web-search]
    
  - type: analyst
    tools: [data-processor, statistics-engine]
    
  - type: documenter
    tools: [report-generator, chart-builder]
\`\`\`

## MCP Integration Examples

### 1. Web Research Pipeline

\`\`\`bash
# Complete web research met MCP tools
./claude-flow sparc run researcher "Research AI trends" \\
  --tools "WebSearch,WebFetch,DocumentParser" \\
  --mcp-server "http://localhost:3000"

# Monitor tool usage
./claude-flow mcp status --details
\`\`\`

### 2. Database Analytics Swarm

\`\`\`typescript
// Database analytics met MCP integration
const analyticsSwarm = new ClaudeFlow.Swarm({
  objective: 'Analyze customer behavior patterns',
  agents: [
    {
      type: 'data-engineer',
      tools: ['SQLQuery', 'DataTransform']
    },
    {
      type: 'analyst',
      tools: ['StatisticalAnalysis', 'MLPredictor']
    },
    {
      type: 'visualizer',
      tools: ['ChartGenerator', 'DashboardBuilder']
    }
  ],
  mcp: {
    server: 'http://mcp-server:3000',
    authentication: process.env.MCP_TOKEN
  }
})

// Execute pipeline
const results = await analyticsSwarm.execute({
  database: 'customer_analytics',
  timeRange: { start: '2024-01-01', end: '2024-12-31' }
})
\`\`\`

### 3. Full Stack Development Tools

\`\`\`bash
# Development swarm met complete toolset
./claude-flow swarm "Build REST API" \\
  --strategy development \\
  --tools "CodeGenerator,DatabaseDesigner,APITester,DocGenerator" \\
  --mcp-config ./mcp-dev-tools.json

# mcp-dev-tools.json:
{
  "tools": {
    "CodeGenerator": {
      "languages": ["TypeScript", "Python"],
      "frameworks": ["Express", "FastAPI"]
    },
    "DatabaseDesigner": {
      "databases": ["PostgreSQL", "MongoDB"],
      "features": ["migrations", "seeders"]
    },
    "APITester": {
      "types": ["unit", "integration", "load"],
      "formats": ["REST", "GraphQL"]
    }
  }
}
\`\`\`

## Best Practices

### 1. Tool Selection Strategy
- **Specificity**: Kies tools die exact matchen met de taak requirements
- **Performance**: Overweeg latency en resource gebruik
- **Reliability**: Prefereer tools met proven track record
- **Compatibility**: Zorg voor goede integratie tussen tools

### 2. Security Considerations
\`\`\`typescript
// Secure tool configuration
const secureToolConfig = {
  permissions: {
    filesystem: ['read'], // Geen write access
    network: ['http', 'https'], // Alleen secure protocols
    execution: ['sandboxed'] // Altijd sandboxed
  },
  rateLimit: {
    requestsPerMinute: 60,
    requestsPerHour: 1000
  },
  timeout: 30000, // 30 seconden max
  retryPolicy: {
    maxRetries: 3,
    backoff: 'exponential'
  }
}
\`\`\`

### 3. Error Handling
\`\`\`typescript
// Robuuste error handling voor tools
class RobustToolExecutor {
  async executeTool(tool: MCPTool, input: any): Promise<any> {
    try {
      // Primary execution
      return await tool.execute(input)
    } catch (error) {
      // Categorize error
      const errorType = this.categorizeError(error)
      
      switch (errorType) {
        case 'RATE_LIMIT':
          await this.handleRateLimit(error)
          break
        case 'TIMEOUT':
          return await this.retryWithExtendedTimeout(tool, input)
        case 'PERMISSION_DENIED':
          return await this.requestPermissionEscalation(tool, input)
        default:
          // Log and fallback
          this.logger.error('Tool execution failed', { error, tool, input })
          return this.getFallbackResponse(tool, input)
      }
    }
  }
}
\`\`\`

### 4. Performance Optimization
- **Tool Caching**: Cache frequent tool results
- **Batch Operations**: Groepeer gelijkaardige tool calls
- **Async Execution**: Gebruik parallel execution waar mogelijk
- **Resource Pooling**: Hergebruik tool connections

### 5. Monitoring en Observability
\`\`\`bash
# Monitor tool performance
./claude-flow mcp monitor \\
  --metrics "latency,success_rate,usage" \\
  --dashboard

# Export tool usage analytics
./claude-flow mcp analytics export \\
  --format csv \\
  --period "last-7-days"
\`\`\`

## Conclusie

Tool integration via MCP is een kerncomponent van Claude Flow's kracht. Door het effectief gebruiken van tools kunnen agents hun capabilities exponentieel uitbreiden. De key is om de juiste balans te vinden tussen tool complexiteit, performance, en maintainability.

In de volgende modules gaan we deze concepten toepassen in praktische projecten.
  `,
  codeExamples: [
    {
      id: 'code-2-4-1',
      title: 'MCP Server Setup en Configuratie',
      code: `// mcp-server-config.ts
// Complete MCP server setup voor Claude Flow

import { MCPServer, ToolRegistry } from '@claude-flow/mcp-server'
import { SecurityMiddleware } from '@claude-flow/security'

// Initialize MCP Server
const mcpServer = new MCPServer({
  port: 3000,
  host: 'localhost',
  
  // Security configuration
  security: {
    authentication: 'bearer-token',
    encryption: 'tls-1.3',
    cors: {
      origins: ['http://localhost:*'],
      credentials: true
    }
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 60000, // 1 minute
    max: 100, // requests per window
    standardHeaders: true,
    legacyHeaders: false
  },
  
  // Logging
  logging: {
    level: 'info',
    format: 'json',
    destination: './logs/mcp-server.log'
  }
})

// Register built-in tools
const toolRegistry = new ToolRegistry(mcpServer)

// Web tools
toolRegistry.register({
  name: 'WebSearch',
  description: 'Search the web for current information',
  category: 'research',
  handler: async (params) => {
    // Implementation
    return webSearchHandler(params)
  },
  schema: {
    input: {
      type: 'object',
      properties: {
        query: { type: 'string', minLength: 1 },
        maxResults: { type: 'number', default: 10 },
        domains: { 
          type: 'array', 
          items: { type: 'string' } 
        }
      },
      required: ['query']
    }
  }
})

// Database tools
toolRegistry.register({
  name: 'DatabaseQuery',
  description: 'Execute SQL queries safely',
  category: 'data',
  handler: async (params, context) => {
    // Validate permissions
    if (!context.permissions.includes('database:read')) {
      throw new Error('Insufficient permissions')
    }
    
    // Execute with connection pooling
    return await databasePool.query(params.query, {
      timeout: params.timeout || 30000,
      readOnly: !context.permissions.includes('database:write')
    })
  },
  schema: {
    input: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        database: { type: 'string' },
        timeout: { type: 'number' }
      },
      required: ['query', 'database']
    }
  }
})

// Analytics tools
toolRegistry.register({
  name: 'DataAnalyzer',
  description: 'Advanced data analysis and statistics',
  category: 'analytics',
  handler: new DataAnalyzerTool(),
  schema: dataAnalyzerSchema
})

// Start server with middleware
mcpServer.use(SecurityMiddleware())
mcpServer.use(MetricsMiddleware())
mcpServer.use(CacheMiddleware({ ttl: 300 }))

mcpServer.start(() => {
  console.log('MCP Server running on http://localhost:3000')
  console.log(\`Registered tools: \${toolRegistry.list().length}\`)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  await mcpServer.shutdown()
  process.exit(0)
})`,
      language: 'typescript'
    },
    {
      id: 'code-2-4-2',
      title: 'Custom Tool Development',
      code: `// custom-code-analysis-tool.ts
// Geavanceerde code analysis tool voor Claude Flow agents

import { MCPTool, ToolContext, ToolResult } from '@claude-flow/mcp'
import { AST, parseCode } from '@claude-flow/parser'
import { CodeMetrics } from './metrics'

export class CodeAnalysisTool implements MCPTool {
  name = 'code-analyzer'
  description = 'Comprehensive code analysis with metrics and suggestions'
  version = '2.0.0'
  category = 'development'
  
  // Supported languages
  private languages = ['typescript', 'javascript', 'python', 'java', 'go']
  
  inputSchema = {
    type: 'object',
    properties: {
      code: {
        type: 'string',
        description: 'Source code to analyze'
      },
      language: {
        type: 'string',
        enum: this.languages,
        description: 'Programming language'
      },
      analysisType: {
        type: 'array',
        items: {
          type: 'string',
          enum: [
            'complexity',
            'performance',
            'security',
            'style',
            'dependencies',
            'test-coverage'
          ]
        },
        default: ['complexity', 'style']
      },
      options: {
        type: 'object',
        properties: {
          maxComplexity: { type: 'number', default: 10 },
          securityLevel: { 
            type: 'string', 
            enum: ['basic', 'standard', 'strict'],
            default: 'standard'
          }
        }
      }
    },
    required: ['code', 'language']
  }
  
  outputSchema = {
    type: 'object',
    properties: {
      metrics: {
        type: 'object',
        properties: {
          complexity: { type: 'number' },
          linesOfCode: { type: 'number' },
          functions: { type: 'number' },
          classes: { type: 'number' }
        }
      },
      issues: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            severity: { 
              type: 'string',
              enum: ['error', 'warning', 'info']
            },
            line: { type: 'number' },
            column: { type: 'number' },
            message: { type: 'string' },
            suggestion: { type: 'string' }
          }
        }
      },
      suggestions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            description: { type: 'string' },
            example: { type: 'string' }
          }
        }
      }
    }
  }
  
  async execute(input: any, context: ToolContext): Promise<ToolResult> {
    try {
      // Parse code into AST
      const ast = await this.parseCode(input.code, input.language)
      
      // Initialize results
      const results = {
        metrics: {},
        issues: [],
        suggestions: []
      }
      
      // Run requested analyses
      for (const analysisType of input.analysisType) {
        switch (analysisType) {
          case 'complexity':
            const complexity = await this.analyzeComplexity(
              ast, 
              input.options?.maxComplexity
            )
            results.metrics.complexity = complexity.score
            results.issues.push(...complexity.issues)
            break
            
          case 'performance':
            const perf = await this.analyzePerformance(ast, input.language)
            results.issues.push(...perf.issues)
            results.suggestions.push(...perf.suggestions)
            break
            
          case 'security':
            const security = await this.analyzeSecurity(
              ast, 
              input.language,
              input.options?.securityLevel
            )
            results.issues.push(...security.vulnerabilities)
            break
            
          case 'style':
            const style = await this.analyzeStyle(ast, input.language)
            results.issues.push(...style.violations)
            break
            
          case 'dependencies':
            const deps = await this.analyzeDependencies(ast, input.language)
            results.metrics.dependencies = deps.count
            results.suggestions.push(...deps.recommendations)
            break
            
          case 'test-coverage':
            const coverage = await this.estimateTestCoverage(ast)
            results.metrics.estimatedCoverage = coverage.percentage
            results.suggestions.push(...coverage.suggestions)
            break
        }
      }
      
      // Calculate basic metrics
      results.metrics = {
        ...results.metrics,
        linesOfCode: this.countLines(input.code),
        functions: this.countFunctions(ast),
        classes: this.countClasses(ast)
      }
      
      // Sort issues by severity
      results.issues.sort((a, b) => {
        const severityOrder = { error: 0, warning: 1, info: 2 }
        return severityOrder[a.severity] - severityOrder[b.severity]
      })
      
      return {
        success: true,
        data: results
      }
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        errorCode: 'ANALYSIS_ERROR'
      }
    }
  }
  
  private async analyzeComplexity(
    ast: AST, 
    maxComplexity: number = 10
  ): Promise<any> {
    const metrics = new CodeMetrics(ast)
    const complexity = metrics.calculateCyclomaticComplexity()
    const issues = []
    
    // Check functions for high complexity
    ast.functions.forEach(func => {
      const funcComplexity = metrics.getFunctionComplexity(func)
      if (funcComplexity > maxComplexity) {
        issues.push({
          type: 'complexity',
          severity: funcComplexity > maxComplexity * 2 ? 'error' : 'warning',
          line: func.location.start.line,
          column: func.location.start.column,
          message: \`Function '\${func.name}' has high complexity: \${funcComplexity}\`,
          suggestion: 'Consider breaking this function into smaller, more focused functions'
        })
      }
    })
    
    return { score: complexity, issues }
  }
  
  private async analyzePerformance(
    ast: AST, 
    language: string
  ): Promise<any> {
    const issues = []
    const suggestions = []
    
    // Language-specific performance patterns
    const patterns = this.getPerformancePatterns(language)
    
    for (const pattern of patterns) {
      const matches = this.findPattern(ast, pattern)
      matches.forEach(match => {
        issues.push({
          type: 'performance',
          severity: pattern.severity,
          line: match.line,
          column: match.column,
          message: pattern.message,
          suggestion: pattern.suggestion
        })
      })
    }
    
    // General performance suggestions
    if (ast.loops.some(loop => loop.nested > 2)) {
      suggestions.push({
        type: 'performance',
        description: 'Deep nested loops detected',
        example: 'Consider using more efficient algorithms or data structures'
      })
    }
    
    return { issues, suggestions }
  }
  
  private async analyzeSecurity(
    ast: AST,
    language: string,
    level: string = 'standard'
  ): Promise<any> {
    const vulnerabilities = []
    
    // Common security patterns
    const securityPatterns = {
      sqlInjection: /\\.query\\(.*\\$\\{.*\\}.*\\)/,
      xss: /innerHTML\\s*=\\s*[^'"].*$/,
      hardcodedSecrets: /(?:password|api_key|secret)\\s*=\\s*["'][^"']+["']/i
    }
    
    // Check for vulnerabilities
    for (const [vuln, pattern] of Object.entries(securityPatterns)) {
      const matches = this.searchCodePattern(ast, pattern)
      matches.forEach(match => {
        vulnerabilities.push({
          type: 'security',
          severity: 'error',
          line: match.line,
          column: match.column,
          message: \`Potential \${vuln} vulnerability detected\`,
          suggestion: this.getSecuritySuggestion(vuln)
        })
      })
    }
    
    return { vulnerabilities }
  }
  
  // Helper methods
  private async parseCode(code: string, language: string): Promise<AST> {
    const parser = this.getParser(language)
    return parser.parse(code)
  }
  
  private getParser(language: string) {
    // Return appropriate parser based on language
    const parsers = {
      typescript: new TypeScriptParser(),
      javascript: new JavaScriptParser(),
      python: new PythonParser(),
      java: new JavaParser(),
      go: new GoParser()
    }
    return parsers[language] || new GenericParser()
  }
  
  private countLines(code: string): number {
    return code.split('\\n').filter(line => line.trim().length > 0).length
  }
  
  private countFunctions(ast: AST): number {
    return ast.functions?.length || 0
  }
  
  private countClasses(ast: AST): number {
    return ast.classes?.length || 0
  }
}

// Register tool with MCP
export function registerCodeAnalysisTool(mcpServer: MCPServer) {
  const tool = new CodeAnalysisTool()
  
  mcpServer.registerTool({
    ...tool,
    middleware: [
      rateLimitMiddleware({ maxRequestsPerMinute: 30 }),
      cacheMiddleware({ ttl: 600 }), // Cache for 10 minutes
      metricsMiddleware()
    ]
  })
}`,
      language: 'typescript'
    },
    {
      id: 'code-2-4-3',
      title: 'Agent Tool Integration Workflow',
      code: `#!/bin/bash
# Complete workflow voor tool-integrated agent development

# 1. Start MCP server met custom tools
echo "Starting MCP server with development tools..."
./claude-flow mcp start \\
  --config ./mcp-config.yaml \\
  --tools-dir ./custom-tools \\
  --port 3000 &

MCP_PID=$!

# 2. Wait for server to be ready
sleep 5

# 3. Verify tools are loaded
echo "Verifying tool registration..."
./claude-flow mcp tools --format json > available-tools.json

# 4. Create specialized agent swarm with tools
echo "Creating development swarm with tool integration..."
cat > dev-swarm-config.yaml << EOF
name: full-stack-development
description: Complete development pipeline with integrated tools

agents:
  - id: architect
    type: architect
    tools:
      - DatabaseDesigner
      - APISpecGenerator
      - ArchitectureDiagrammer
    
  - id: backend-team
    type: coder
    count: 3
    tools:
      - CodeGenerator
      - DatabaseQuery
      - APIBuilder
      - TestGenerator
    
  - id: frontend-team
    type: coder
    count: 2
    tools:
      - ReactComponentBuilder
      - StyleGenerator
      - StateManager
    
  - id: qa-team
    type: tester
    count: 2
    tools:
      - TestRunner
      - SecurityScanner
      - PerformanceProfiler
      - CodeAnalyzer

coordination:
  mode: hierarchical
  lead: architect
  communication: event-driven

workflow:
  - phase: design
    agents: [architect]
    duration: 2h
    outputs:
      - api-spec.yaml
      - database-schema.sql
      - architecture.md
  
  - phase: implementation
    agents: [backend-team, frontend-team]
    parallel: true
    duration: 6h
    dependencies: [design]
    
  - phase: testing
    agents: [qa-team]
    duration: 2h
    dependencies: [implementation]
    
  - phase: deployment
    agents: [architect]
    tools: [DockerBuilder, KubernetesDeployer]
    dependencies: [testing]

monitoring:
  dashboard: true
  metrics:
    - tool-usage
    - agent-performance
    - task-completion
    - error-rate
EOF

# 5. Execute the swarm
echo "Executing development swarm..."
./claude-flow swarm execute \\
  --config dev-swarm-config.yaml \\
  --objective "Build complete e-commerce API with frontend" \\
  --monitor \\
  --output ./project-output

# 6. Monitor tool usage in real-time
echo "Opening monitoring dashboard..."
./claude-flow mcp monitor \\
  --dashboard \\
  --port 8080 &

MONITOR_PID=$!

# 7. Wait for completion
echo "Waiting for swarm completion..."
while [ ! -f ./project-output/completion-report.json ]; do
  sleep 30
  echo "Progress: $(./claude-flow swarm status --format json | jq -r .progress)%"
done

# 8. Generate tool usage report
echo "Generating tool usage analytics..."
./claude-flow mcp analytics \\
  --period "session" \\
  --format html \\
  --output tool-usage-report.html

# 9. Cleanup
echo "Cleaning up..."
kill $MCP_PID $MONITOR_PID

echo "Development completed! Check ./project-output for results."`,
      language: 'bash'
    }
  ],
  assignments: [
    {
      id: 'assignment-2-4-1',
      title: 'Ontwikkel een Custom MCP Tool',
      description: 'Creëer een custom tool voor Claude Flow agents die een specifiek probleem oplost in jouw domein. De tool moet volledig MCP-compliant zijn met proper schema validatie.',
      type: 'project',
      difficulty: 'hard',
    },
    {
      id: 'assignment-2-4-2',
      title: 'Multi-Tool Agent Workflow',
      description: 'Ontwerp en implementeer een agent workflow die minstens 3 verschillende MCP tools gebruikt om een complexe taak te voltooien.',
      type: 'project',
      difficulty: 'hard',
    },
    {
      id: 'assignment-2-4-3',
      title: 'Tool Performance Benchmarking',
      description: 'Creëer een benchmark suite die de performance van verschillende MCP tools meet en vergelijkt voor jouw use case.',
      type: 'project',
      difficulty: 'medium',
    }
  ],
  resources: [
    {
      title: 'Model Context Protocol Specification',
      type: 'documentation',
      url: 'https://github.com/anthropics/model-context-protocol'
    },
    {
      title: 'Claude Flow MCP Integration Guide',
      type: 'documentation',
      url: 'https://docs.claude-flow.ai/mcp/integration'
    },
    {
      title: 'Building Custom Tools for AI Agents',
      type: 'video',
      url: 'https://youtube.com/watch?v=custom-mcp-tools'
    },
    {
      title: 'MCP Security Best Practices',
      type: 'article',
      url: 'https://claude-flow.ai/blog/mcp-security'
    },
    {
      title: 'Tool Development SDK',
      type: 'tool',
      url: 'https://github.com/claude-flow/tool-sdk'
    }
  ]
};