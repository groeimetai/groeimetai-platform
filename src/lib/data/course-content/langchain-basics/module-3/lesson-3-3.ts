import { Lesson } from '$lib/types/lesson';

export const lesson3_3: Lesson = {
  id: 'langchain-3-3',
  moduleId: 'langchain-module-3',
  title: 'Advanced Agent Patterns',
  objectives: [
    'Implementeer multi-agent systemen voor complexe taken',
    'Bouw supervisor agents voor coördinatie',
    'Ontwikkel agents voor Nederlandse business scenarios',
    'Leer best practices voor agent orchestratie'
  ],
  content: `
# Advanced Agent Patterns

Multi-agent systemen stellen ons in staat om complexe taken op te splitsen en parallel uit te voeren. In deze les leren we geavanceerde patterns voor het bouwen van robuuste agent systemen voor Nederlandse business cases.

## Multi-Agent Architectures

### Hierarchical Agent Systems

In een hiërarchisch systeem heeft elke agent een specifieke rol en rapporteert aan een supervisor:

\`\`\`typescript
import { BaseAgent } from '@langchain/core/agents';

// Supervisor Agent - Coördineert andere agents
class SupervisorAgent {
  private agents: Map<string, BaseAgent>;
  private taskQueue: Task[];
  
  constructor() {
    this.agents = new Map();
    this.taskQueue = [];
  }
  
  registerAgent(name: string, agent: BaseAgent) {
    this.agents.set(name, agent);
  }
  
  async delegateTask(task: Task): Promise<TaskResult> {
    // Analyseer taak en bepaal beste agent
    const analysis = await this.analyzeTask(task);
    const selectedAgent = this.selectAgent(analysis);
    
    // Delegeer en monitor
    const result = await this.executeWithMonitoring(
      selectedAgent,
      task
    );
    
    return this.validateAndReturn(result);
  }
}
\`\`\`

### Collaborative Agent Networks

Agents werken samen als peers zonder centrale autoriteit:

\`\`\`typescript
// Research Agent
const researchAgent = new Agent({
  name: "research_specialist",
  tools: [webSearchTool, documentAnalyzer],
  systemMessage: \`Je bent een research specialist. 
  Verzamel accurate informatie over Nederlandse markten en regelgeving.\`
});

// Analysis Agent
const analysisAgent = new Agent({
  name: "data_analyst",
  tools: [calculator, dataVisualizer, statisticsTools],
  systemMessage: \`Je bent een data analist.
  Analyseer informatie en genereer inzichten voor Nederlandse bedrijven.\`
});

// Report Agent
const reportAgent = new Agent({
  name: "report_writer",
  tools: [documentCreator, chartGenerator],
  systemMessage: \`Je bent een rapport schrijver.
  Creëer professionele rapporten in het Nederlands.\`
});
\`\`\`

## Supervisor Agent Pattern

### Complete Supervisor Implementation

\`\`\`typescript
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor } from '@langchain/core/agents';
import { z } from 'zod';

class DutchBusinessSupervisor {
  private model: ChatOpenAI;
  private agents: {
    legal: AgentExecutor;
    financial: AgentExecutor;
    marketing: AgentExecutor;
    operations: AgentExecutor;
  };
  
  constructor() {
    this.model = new ChatOpenAI({ 
      modelName: "gpt-4",
      temperature: 0 
    });
    this.initializeAgents();
  }
  
  private initializeAgents() {
    // Legal Compliance Agent
    this.agents.legal = this.createAgent({
      name: "Nederlandse Juridische Expert",
      tools: [kvkLookupTool, wettekstSearchTool, complianceChecker],
      expertise: "Nederlandse wet- en regelgeving, AVG/GDPR, arbeidsrecht"
    });
    
    // Financial Agent
    this.agents.financial = this.createAgent({
      name: "Financieel Adviseur Nederland",
      tools: [btwCalculator, salaryCalculator, investmentAnalyzer],
      expertise: "Nederlandse belastingen, BTW, loonheffing, investeringen"
    });
    
    // Marketing Agent
    this.agents.marketing = this.createAgent({
      name: "Marketing Strateeg Nederland",
      tools: [marketResearchTool, competitorAnalyzer, campaignPlanner],
      expertise: "Nederlandse markt, consumentengedrag, digitale marketing"
    });
    
    // Operations Agent
    this.agents.operations = this.createAgent({
      name: "Operations Manager",
      tools: [processOptimizer, supplyChainAnalyzer, resourcePlanner],
      expertise: "Procesoptimalisatie, logistiek, Nederlandse infrastructuur"
    });
  }
  
  async processBusinessQuery(query: string): Promise<BusinessAdvice> {
    // Stap 1: Analyseer de query
    const taskAnalysis = await this.analyzeQuery(query);
    
    // Stap 2: Bepaal welke agents nodig zijn
    const requiredAgents = this.selectAgents(taskAnalysis);
    
    // Stap 3: Creëer executie plan
    const executionPlan = this.createExecutionPlan(
      taskAnalysis,
      requiredAgents
    );
    
    // Stap 4: Voer taken parallel uit waar mogelijk
    const results = await this.executeTasksInParallel(executionPlan);
    
    // Stap 5: Synthesize resultaten
    return this.synthesizeResults(results, query);
  }
  
  private async analyzeQuery(query: string): Promise<TaskAnalysis> {
    const analysisPrompt = \`
Analyseer deze Nederlandse business vraag en bepaal:
1. Hoofdonderwerp (juridisch/financieel/marketing/operationeel)
2. Specifieke deeltaken
3. Vereiste expertise
4. Prioriteit en volgorde

Vraag: \${query}
\`;
    
    const response = await this.model.invoke(analysisPrompt);
    return this.parseTaskAnalysis(response);
  }
  
  private async executeTasksInParallel(
    plan: ExecutionPlan
  ): Promise<AgentResult[]> {
    const parallelTasks = plan.tasks.filter(t => !t.dependencies.length);
    const results: AgentResult[] = [];
    
    // Execute parallel tasks
    const parallelResults = await Promise.all(
      parallelTasks.map(task => 
        this.agents[task.agentType].invoke({
          input: task.description,
          context: plan.context
        })
      )
    );
    
    results.push(...parallelResults);
    
    // Execute dependent tasks
    for (const task of plan.tasks.filter(t => t.dependencies.length > 0)) {
      const dependencies = results.filter(r => 
        task.dependencies.includes(r.taskId)
      );
      
      const result = await this.agents[task.agentType].invoke({
        input: task.description,
        context: plan.context,
        previousResults: dependencies
      });
      
      results.push(result);
    }
    
    return results;
  }
}
\`\`\`

## Dutch Business Scenario Implementations

### Startup Advisory System

\`\`\`typescript
class DutchStartupAdvisor {
  private supervisor: DutchBusinessSupervisor;
  private memoryStore: VectorStore;
  
  async adviseStartup(startupInfo: StartupInfo): Promise<StartupAdvice> {
    // Fase 1: Juridische structuur
    const legalAdvice = await this.getLegalStructureAdvice(startupInfo);
    
    // Fase 2: Financiële planning
    const financialPlan = await this.createFinancialPlan(
      startupInfo,
      legalAdvice
    );
    
    // Fase 3: Markt analyse
    const marketAnalysis = await this.analyzeMarket(startupInfo);
    
    // Fase 4: Operationeel plan
    const operationalPlan = await this.createOperationalPlan(
      startupInfo,
      marketAnalysis
    );
    
    return this.compileComprehensiveAdvice({
      legal: legalAdvice,
      financial: financialPlan,
      market: marketAnalysis,
      operations: operationalPlan
    });
  }
  
  private async getLegalStructureAdvice(
    info: StartupInfo
  ): Promise<LegalAdvice> {
    const query = \`
Nederlandse startup advies nodig:
- Sector: \${info.sector}
- Verwachte omzet jaar 1: €\${info.expectedRevenue}
- Aantal founders: \${info.founders.length}
- Internationale ambities: \${info.international ? 'Ja' : 'Nee'}

Adviseer over:
1. Beste rechtsvorm (BV, VOF, Eenmanszaak, etc.)
2. Oprichtingskosten en proces
3. Belangrijkste juridische aandachtspunten
4. Verplichte verzekeringen
\`;
    
    return await this.supervisor.processBusinessQuery(query);
  }
}
\`\`\`

### Multi-Agent Customer Service System

\`\`\`typescript
class DutchCustomerServiceOrchestrator {
  private agents: {
    intake: IntakeAgent;
    technical: TechnicalSupportAgent;
    billing: BillingAgent;
    escalation: EscalationAgent;
  };
  
  private activeSessions: Map<string, SessionState>;
  
  async handleCustomerQuery(
    customerId: string,
    query: string,
    channel: 'email' | 'chat' | 'phone'
  ): Promise<CustomerResponse> {
    // Get of creëer sessie
    const session = this.getOrCreateSession(customerId);
    
    // Intake agent analyseert query
    const intakeAnalysis = await this.agents.intake.analyze({
      query,
      customerHistory: session.history,
      sentiment: await this.analyzeSentiment(query)
    });
    
    // Route naar juiste specialist
    let response: AgentResponse;
    
    switch (intakeAnalysis.category) {
      case 'technical':
        response = await this.handleTechnicalQuery(
          query,
          intakeAnalysis,
          session
        );
        break;
        
      case 'billing':
        response = await this.handleBillingQuery(
          query,
          intakeAnalysis,
          session
        );
        break;
        
      case 'complex':
        response = await this.handleComplexQuery(
          query,
          intakeAnalysis,
          session
        );
        break;
        
      default:
        response = await this.agents.intake.respond(query);
    }
    
    // Update session
    this.updateSession(customerId, query, response);
    
    // Check voor escalatie
    if (this.shouldEscalate(session, response)) {
      return await this.escalateToHuman(session);
    }
    
    return this.formatResponse(response, channel);
  }
  
  private async handleComplexQuery(
    query: string,
    analysis: IntakeAnalysis,
    session: SessionState
  ): Promise<AgentResponse> {
    // Multi-agent collaboration voor complexe queries
    const agents = this.selectAgentsForQuery(analysis);
    
    // Parallel information gathering
    const insights = await Promise.all(
      agents.map(agent => agent.gatherInsights(query, session))
    );
    
    // Synthesis agent combineert alle insights
    const synthesisAgent = new SynthesisAgent();
    return await synthesisAgent.synthesize(insights, query);
  }
}
\`\`\`

## Best Practices voor Agent Orchestratie

### Error Recovery en Resilience

\`\`\`typescript
class ResilientAgentOrchestrator {
  private circuitBreakers: Map<string, CircuitBreaker>;
  private fallbackStrategies: Map<string, FallbackStrategy>;
  
  async executeWithResilience(
    agent: Agent,
    task: Task
  ): Promise<Result> {
    const breaker = this.getCircuitBreaker(agent.name);
    
    try {
      // Check circuit breaker
      if (breaker.isOpen()) {
        return await this.executeFallback(agent.name, task);
      }
      
      // Execute met timeout
      const result = await this.executeWithTimeout(
        agent,
        task,
        30000 // 30 second timeout
      );
      
      breaker.recordSuccess();
      return result;
      
    } catch (error) {
      breaker.recordFailure();
      
      // Probeer fallback strategy
      if (this.hasFallback(agent.name)) {
        return await this.executeFallback(agent.name, task);
      }
      
      // Als geen fallback, probeer task redistribution
      return await this.redistributeTask(task, agent.name);
    }
  }
  
  private async redistributeTask(
    task: Task,
    failedAgent: string
  ): Promise<Result> {
    // Vind alternatieve agents
    const alternatives = this.findAlternativeAgents(task, failedAgent);
    
    for (const altAgent of alternatives) {
      try {
        return await this.executeWithTimeout(altAgent, task, 20000);
      } catch (e) {
        continue;
      }
    }
    
    throw new Error(\`Geen agent beschikbaar voor taak: \${task.id}\`);
  }
}
\`\`\`

### Performance Monitoring

\`\`\`typescript
class AgentPerformanceMonitor {
  private metrics: Map<string, AgentMetrics>;
  
  trackExecution(agent: string, duration: number, success: boolean) {
    const metrics = this.metrics.get(agent) || this.initMetrics();
    
    metrics.totalExecutions++;
    metrics.totalDuration += duration;
    metrics.successCount += success ? 1 : 0;
    
    // Update moving averages
    metrics.avgResponseTime = metrics.totalDuration / metrics.totalExecutions;
    metrics.successRate = metrics.successCount / metrics.totalExecutions;
    
    // Alert bij performance degradatie
    if (metrics.avgResponseTime > metrics.threshold) {
      this.alertPerformanceIssue(agent, metrics);
    }
  }
  
  async optimizeAgentAllocation(tasks: Task[]): Promise<TaskAllocation> {
    const agentLoads = this.calculateCurrentLoads();
    const agentPerformance = this.getPerformanceScores();
    
    // Allocate tasks based on performance en current load
    return this.optimalAllocation(
      tasks,
      agentLoads,
      agentPerformance
    );
  }
}
\`\`\`

Deze patterns zorgen voor schaalbare, betrouwbare multi-agent systemen die complexe Nederlandse business scenarios aankunnen.
`,
  exercises: [
    {
      id: 'langchain-3-3-ex-1',
      title: 'Bouw een Multi-Agent Vastgoed Adviseur',
      description: 'Ontwikkel een systeem met gespecialiseerde agents voor Nederlandse vastgoed advies',
      difficulty: 'hard',
      starterCode: `// Ontwikkel een multi-agent vastgoed adviseur
import { Agent, AgentExecutor } from '@langchain/core/agents';
import { ChatOpenAI } from '@langchain/openai';

class DutchRealEstateAdvisor {
  private agents: {
    market?: Agent;
    legal?: Agent;
    financial?: Agent;
    location?: Agent;
  } = {};
  
  constructor() {
    this.initializeAgents();
  }
  
  private initializeAgents() {
    // TODO: Implementeer 4 gespecialiseerde agents:
    // 1. Market Analyst - prijzen, trends, vergelijkingen
    // 2. Legal Advisor - koopcontracten, hypotheek voorwaarden
    // 3. Financial Planner - hypotheek berekeningen, kosten
    // 4. Location Expert - buurt informatie, voorzieningen
  }
  
  async adviseOnProperty(address: string, budget: number) {
    // TODO: Coördineer alle agents voor volledig advies
  }
}`,
      solution: `import { Agent, AgentExecutor } from '@langchain/core/agents';
import { ChatOpenAI } from '@langchain/openai';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

class DutchRealEstateAdvisor {
  private agents: {
    market: AgentExecutor;
    legal: AgentExecutor;
    financial: AgentExecutor;
    location: AgentExecutor;
  };
  
  private supervisor: ChatOpenAI;
  
  constructor() {
    this.supervisor = new ChatOpenAI({ modelName: "gpt-4", temperature: 0 });
    this.initializeAgents();
  }
  
  private initializeAgents() {
    // Market Analyst Agent
    const marketTools = [
      new DynamicStructuredTool({
        name: "analyze_property_value",
        description: "Analyseer huizenprijzen in de buurt",
        schema: z.object({
          address: z.string(),
          radius: z.number().default(1000)
        }),
        func: async ({ address, radius }) => {
          // Mock data - in productie: gebruik Funda API
          return \`
Marktanalyse voor \${address}:
- Gemiddelde m² prijs: €4,250
- Prijsontwikkeling laatste jaar: +8.5%
- Vergelijkbare woningen verkocht: 12 (laatste 6 maanden)
- Gemiddelde verkooptijd: 28 dagen
          \`;
        }
      })
    ];
    
    this.agents.market = await createAgentExecutor({
      tools: marketTools,
      model: new ChatOpenAI({ temperature: 0 }),
      systemMessage: "Je bent een Nederlandse vastgoed marktanalist."
    });
    
    // Legal Advisor Agent
    const legalTools = [
      new DynamicStructuredTool({
        name: "check_legal_requirements",
        description: "Controleer juridische aspecten van vastgoed aankoop",
        schema: z.object({
          propertyType: z.string(),
          price: z.number()
        }),
        func: async ({ propertyType, price }) => {
          return \`
Juridisch advies:
- Overdrachtsbelasting: €\${(price * 0.02).toFixed(2)} (2%)
- Notariskosten: €1,500 - €2,000
- Bankgarantie vereist: €\${(price * 0.1).toFixed(2)} (10%)
- Ontbindende voorwaarden aanbevolen:
  * Financieringsvoorbehoud
  * Bouwkundige keuring
  * Nationale Hypotheek Garantie mogelijk: \${price <= 405000 ? 'Ja' : 'Nee'}
          \`;
        }
      })
    ];
    
    this.agents.legal = await createAgentExecutor({
      tools: legalTools,
      model: new ChatOpenAI({ temperature: 0 }),
      systemMessage: "Je bent een Nederlandse vastgoed jurist."
    });
    
    // Financial Planner Agent
    const financialTools = [
      new DynamicStructuredTool({
        name: "calculate_mortgage",
        description: "Bereken hypotheek mogelijkheden",
        schema: z.object({
          income: z.number(),
          price: z.number(),
          savings: z.number()
        }),
        func: async ({ income, price, savings }) => {
          const maxLoan = income * 4.5;
          const downPayment = price - maxLoan;
          const monthlyPayment = (maxLoan * 0.035) / 12;
          
          return \`
Financiële analyse:
- Maximale hypotheek: €\${maxLoan.toFixed(2)}
- Benodigde eigen inleg: €\${Math.max(0, downPayment).toFixed(2)}
- Geschatte maandlasten: €\${monthlyPayment.toFixed(2)}
- Bijkomende kosten (k.k.): €\${(price * 0.06).toFixed(2)}
- Totaal benodigd eigen geld: €\${(Math.max(0, downPayment) + price * 0.06).toFixed(2)}
- Haalbaar met spaargeld: \${savings >= (Math.max(0, downPayment) + price * 0.06) ? 'Ja' : 'Nee'}
          \`;
        }
      })
    ];
    
    this.agents.financial = await createAgentExecutor({
      tools: financialTools,
      model: new ChatOpenAI({ temperature: 0 }),
      systemMessage: "Je bent een Nederlandse hypotheek adviseur."
    });
    
    // Location Expert Agent
    const locationTools = [
      new DynamicStructuredTool({
        name: "analyze_neighborhood",
        description: "Analyseer buurt kenmerken",
        schema: z.object({
          address: z.string()
        }),
        func: async ({ address }) => {
          return \`
Buurtanalyse:
- Veiligheidsindex: 8.2/10
- Voorzieningen:
  * Supermarkt: 300m
  * OV halte: 150m
  * Basisschool: 500m
  * Huisarts: 800m
- Parkeren: Vergunning gebied (€60/jaar)
- Groene omgeving: Park op 200m
- Geluidsoverlast: Minimaal (woonwijk)
          \`;
        }
      })
    ];
    
    this.agents.location = await createAgentExecutor({
      tools: locationTools,
      model: new ChatOpenAI({ temperature: 0 }),
      systemMessage: "Je bent een Nederlandse locatie expert."
    });
  }
  
  async adviseOnProperty(address: string, budget: number, income: number = 50000) {
    // Parallel agent execution
    const [marketAnalysis, legalAdvice, financialPlan, locationInfo] = await Promise.all([
      this.agents.market.invoke({
        input: \`Analyseer de marktwaarde van \${address}\`
      }),
      this.agents.legal.invoke({
        input: \`Juridisch advies voor woning aankoop van €\${budget}\`
      }),
      this.agents.financial.invoke({
        input: \`Hypotheek berekening voor €\${budget} met inkomen €\${income}\`
      }),
      this.agents.location.invoke({
        input: \`Buurt analyse voor \${address}\`
      })
    ]);
    
    // Supervisor synthesizes all advice
    const synthesis = await this.supervisor.invoke(\`
Combineer het volgende advies tot een coherent vastgoed advies:

Marktanalyse: \${marketAnalysis.output}
Juridisch: \${legalAdvice.output}
Financieel: \${financialPlan.output}
Locatie: \${locationInfo.output}

Geef een eindconclusie met koop aanbeveling (Ja/Nee) en belangrijkste overwegingen.
    \`);
    
    return {
      marketAnalysis: marketAnalysis.output,
      legalAdvice: legalAdvice.output,
      financialPlan: financialPlan.output,
      locationInfo: locationInfo.output,
      conclusion: synthesis.content
    };
  }
}

// Helper function
async function createAgentExecutor({ tools, model, systemMessage }) {
  const agent = await createToolCallingAgent({
    llm: model,
    tools,
    systemMessage
  });
  
  return new AgentExecutor({
    agent,
    tools,
    verbose: true
  });
}

// Test
const advisor = new DutchRealEstateAdvisor();
const advice = await advisor.adviseOnProperty(
  "Prinsengracht 123, Amsterdam",
  650000,
  75000
);
console.log(advice);`,
      hint: 'Gebruik Promise.all() voor parallel agent execution, en laat een supervisor agent de resultaten synthesizen'
    }
  ],
  quiz: [
    {
      id: 'langchain-3-3-q-1',
      question: 'Wat is het belangrijkste voordeel van een supervisor agent pattern?',
      options: [
        'Het is sneller dan single agents',
        'Het biedt centrale coördinatie en quality control',
        'Het gebruikt minder tokens',
        'Het is makkelijker te implementeren'
      ],
      correctAnswer: 1,
      explanation: 'Supervisor agents bieden centrale coördinatie, kunnen taken intelligent verdelen, en zorgen voor quality control over de output van specialized agents.'
    },
    {
      id: 'langchain-3-3-q-2',
      question: 'Wanneer is parallel agent execution het meest effectief?',
      options: [
        'Bij alle multi-agent taken',
        'Alleen bij simpele queries',
        'Bij onafhankelijke subtaken zonder dependencies',
        'Nooit, sequential is altijd beter'
      ],
      correctAnswer: 2,
      explanation: 'Parallel execution is het meest effectief wanneer agents onafhankelijke subtaken uitvoeren zonder onderlinge dependencies, zoals verschillende aspecten van een analyse.'
    }
  ]
};