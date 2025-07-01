import type { Lesson } from '@/lib/data/courses';

export const lesson4_4: Lesson = {
  id: 'lesson-4-4',
  title: 'Volgende stappen en resources',
  duration: '25 min',
  content: `
# Volgende stappen en resources

Je hebt nu een solide basis in het werken met Claude's API en het bouwen van AI-gestuurde applicaties. In deze les verkennen we advanced patterns, community resources, en creëren we een roadmap voor je verdere ontwikkeling.

## Advanced integration patterns

### 1. Multi-agent systemen
Combineer meerdere Claude instances voor complexe taken:

\`\`\`typescript
// Multi-agent orchestrator
class MultiAgentSystem {
  private agents: Map<string, ClaudeAgent>;

  constructor() {
    this.agents = new Map([
      ['researcher', new ClaudeAgent({
        system: 'You are a research specialist. Find and analyze information.',
        temperature: 0.3
      })],
      ['writer', new ClaudeAgent({
        system: 'You are a creative writer. Transform research into engaging content.',
        temperature: 0.8
      })],
      ['editor', new ClaudeAgent({
        system: 'You are an editor. Review and improve content for clarity and accuracy.',
        temperature: 0.5
      })]
    ]);
  }

  async processTask(task: string): Promise<string> {
    // Step 1: Research
    const research = await this.agents.get('researcher')!
      .process(\`Research the following topic: \${task}\`);
    
    // Step 2: Write
    const draft = await this.agents.get('writer')!
      .process(\`Write an article based on this research: \${research}\`);
    
    // Step 3: Edit
    const final = await this.agents.get('editor')!
      .process(\`Edit and improve this article: \${draft}\`);
    
    return final;
  }
}
\`\`\`

### 2. RAG (Retrieval Augmented Generation)
Combineer Claude met vector databases voor kennismanagement:

\`\`\`typescript
// RAG implementation met Pinecone
import { PineconeClient } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

class RAGSystem {
  private pinecone: PineconeClient;
  private embeddings: OpenAIEmbeddings;
  private claude: ClaudeService;

  async query(question: string): Promise<string> {
    // 1. Generate embedding for question
    const questionEmbedding = await this.embeddings.embedQuery(question);
    
    // 2. Search vector database
    const results = await this.pinecone.query({
      vector: questionEmbedding,
      topK: 5,
      includeMetadata: true
    });
    
    // 3. Build context from results
    const context = results.matches
      .map(match => match.metadata.text)
      .join('\n\n');
    
    // 4. Generate answer with Claude
    return this.claude.chat(\`
      Based on the following context, answer the question.
      
      Context:
      \${context}
      
      Question: \${question}
    \`, {
      system: 'You are a helpful assistant. Answer based only on the provided context.'
    });
  }
}
\`\`\`

### 3. Function calling patterns
Geef Claude de mogelijkheid om tools te gebruiken:

\`\`\`typescript
interface Tool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (params: any) => Promise<any>;
}

class ToolEnabledClaude {
  private tools: Map<string, Tool>;

  registerTool(tool: Tool) {
    this.tools.set(tool.name, tool);
  }

  async processWithTools(message: string): Promise<string> {
    // First pass: Determine if tools are needed
    const toolPrompt = \`
      Available tools: \${this.getToolDescriptions()}
      
      User request: \${message}
      
      If you need to use a tool, respond with:
      TOOL: <tool_name>
      PARAMS: <json_parameters>
      
      Otherwise, respond normally.
    \`;

    const response = await claude.chat(toolPrompt);
    
    // Parse tool usage
    if (response.startsWith('TOOL:')) {
      const toolName = this.extractToolName(response);
      const params = this.extractParams(response);
      
      // Execute tool
      const toolResult = await this.tools.get(toolName)!.execute(params);
      
      // Second pass: Generate final response
      return claude.chat(\`
        Tool result: \${JSON.stringify(toolResult)}
        Original request: \${message}
        
        Please provide a helpful response based on the tool result.
      \`);
    }
    
    return response;
  }
}

// Example tools
const weatherTool: Tool = {
  name: 'get_weather',
  description: 'Get current weather for a location',
  parameters: { location: 'string' },
  execute: async (params) => {
    // Call weather API
    return { temp: 22, condition: 'sunny' };
  }
};

const calculatorTool: Tool = {
  name: 'calculate',
  description: 'Perform mathematical calculations',
  parameters: { expression: 'string' },
  execute: async (params) => {
    // Safely evaluate math expression
    return { result: eval(params.expression) };
  }
};
\`\`\`

### 4. Streaming met backpressure
Handle grote volumes met flow control:

\`\`\`typescript
class StreamProcessor {
  private queue: string[] = [];
  private processing = false;
  private maxQueueSize = 100;

  async processStream(
    stream: ReadableStream<Uint8Array>,
    onChunk: (chunk: string) => Promise<void>
  ) {
    const reader = stream.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        // Apply backpressure if queue is full
        if (this.queue.length >= this.maxQueueSize) {
          await this.waitForQueue();
        }

        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        this.queue.push(chunk);
        
        if (!this.processing) {
          this.processQueue(onChunk);
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private async processQueue(onChunk: (chunk: string) => Promise<void>) {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const chunk = this.queue.shift()!;
      await onChunk(chunk);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    this.processing = false;
  }

  private waitForQueue(): Promise<void> {
    return new Promise(resolve => {
      const checkQueue = setInterval(() => {
        if (this.queue.length < this.maxQueueSize / 2) {
          clearInterval(checkQueue);
          resolve();
        }
      }, 100);
    });
  }
}
\`\`\`

## Community resources

### 1. **Officiële Anthropic resources**
- **Documentation**: [docs.anthropic.com](https://docs.anthropic.com)
- **API Reference**: Gedetailleerde API specificaties
- **Cookbook**: Praktische voorbeelden en patterns
- **Discord Community**: Direct contact met andere developers

### 2. **Open source projecten**
\`\`\`yaml
Nuttige repositories:
- anthropics/anthropic-sdk-typescript: Officiële TypeScript SDK
- anthropics/anthropic-cookbook: Voorbeeld implementaties
- langchain-ai/langchain: Framework voor LLM applicaties
- microsoft/semantic-kernel: AI orchestration framework
\`\`\`

### 3. **Learning platforms**
- **Anthropic's Claude Course**: Officiële training
- **DeepLearning.AI**: LLM development courses
- **Fast.ai**: Practical deep learning
- **Hugging Face**: Model hub en tutorials

### 4. **Community forums**
- **Reddit r/ClaudeAI**: Discussies en tips
- **Stack Overflow**: Technische vragen
- **GitHub Discussions**: Project-specifieke hulp
- **Twitter/X**: Laatste updates en tips

## Learning paths

### Path 1: Full-Stack AI Developer
\`\`\`mermaid
graph TD
    A[Basis Claude API] --> B[Frontend Frameworks]
    B --> C[Backend Integratie]
    C --> D[Database & Caching]
    D --> E[Deployment & Scaling]
    E --> F[Production Monitoring]
    
    B --> G[React/Vue/Angular]
    C --> H[Node.js/Python/Go]
    D --> I[PostgreSQL/Redis]
    E --> J[Docker/Kubernetes]
    F --> K[Datadog/NewRelic]
\`\`\`

### Path 2: AI/ML Engineer
\`\`\`mermaid
graph TD
    A[Claude Fundamentals] --> B[Prompt Engineering]
    B --> C[Fine-tuning Basics]
    C --> D[RAG Systems]
    D --> E[Multi-Agent Systems]
    E --> F[Production ML Ops]
    
    B --> G[Advanced Prompting]
    C --> H[Model Evaluation]
    D --> I[Vector Databases]
    E --> J[Agent Frameworks]
    F --> K[MLflow/Weights&Biases]
\`\`\`

### Path 3: AI Product Manager
\`\`\`mermaid
graph TD
    A[AI Basics] --> B[Use Case Identification]
    B --> C[Requirements Gathering]
    C --> D[Success Metrics]
    D --> E[Stakeholder Management]
    E --> F[Product Launch]
    
    B --> G[Market Research]
    C --> H[Technical Feasibility]
    D --> I[KPIs & Analytics]
    E --> J[Communication]
    F --> K[User Adoption]
\`\`\`

## Common pitfalls to avoid

### 1. **Over-engineering**
❌ **Verkeerd**:
\`\`\`typescript
// Overly complex abstraction
class AbstractClaudeFactoryProviderSingleton {
  // 500 lines of unnecessary abstraction
}
\`\`\`

✅ **Goed**:
\`\`\`typescript
// Simple, direct implementation
const claude = new Anthropic({ apiKey });
\`\`\`

### 2. **Ignoring rate limits**
❌ **Verkeerd**:
\`\`\`typescript
// Firing requests without control
for (const item of items) {
  await claude.messages.create({...}); // Will hit rate limits
}
\`\`\`

✅ **Goed**:
\`\`\`typescript
// Implementing proper rate limiting
import pLimit from 'p-limit';
const limit = pLimit(5); // Max 5 concurrent requests

await Promise.all(
  items.map(item => 
    limit(() => claude.messages.create({...}))
  )
);
\`\`\`

### 3. **Poor error handling**
❌ **Verkeerd**:
\`\`\`typescript
try {
  const response = await claude.chat(message);
} catch (error) {
  console.log("Error occurred"); // Too generic
}
\`\`\`

✅ **Goed**:
\`\`\`typescript
try {
  const response = await claude.chat(message);
} catch (error) {
  if (error.status === 429) {
    // Rate limit - implement backoff
    await delay(error.retry_after * 1000);
    return retry();
  } else if (error.status === 401) {
    // Auth error - check API key
    throw new AuthenticationError('Invalid API key');
  } else {
    // Log full error context
    logger.error('Claude API error', {
      error,
      message,
      timestamp: new Date()
    });
    throw error;
  }
}
\`\`\`

### 4. **Inefficient context usage**
❌ **Verkeerd**:
\`\`\`typescript
// Sending entire conversation history every time
const allMessages = await db.getAllMessages(); // Could be thousands
await claude.chat(newMessage, { history: allMessages });
\`\`\`

✅ **Goed**:
\`\`\`typescript
// Smart context windowing
const recentMessages = await db.getRecentMessages(20);
const summary = await summarizeOlderMessages();
const context = [summary, ...recentMessages];
\`\`\`

## Building production applications

### 1. **Architecture checklist**
- [ ] Scalable API design
- [ ] Proper authentication & authorization
- [ ] Rate limiting & quotas
- [ ] Caching strategy
- [ ] Error handling & recovery
- [ ] Monitoring & alerting
- [ ] Data privacy compliance
- [ ] Cost optimization

### 2. **Deployment considerations**
\`\`\`yaml
Production Setup:
  Infrastructure:
    - Load balancer voor HA
    - Auto-scaling groups
    - CDN voor static assets
    - Managed database (RDS/CloudSQL)
    
  Security:
    - API key rotation
    - Network isolation
    - Encryption at rest & transit
    - Regular security audits
    
  Monitoring:
    - Application metrics
    - API usage tracking
    - Cost monitoring
    - User analytics
\`\`\`

### 3. **Performance optimization**
\`\`\`typescript
// Caching strategy
class CachedClaudeService {
  private cache: Redis;
  private ttl = 3600; // 1 hour

  async chat(message: string, options: ChatOptions): Promise<string> {
    const cacheKey = this.generateCacheKey(message, options);
    
    // Check cache
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Call API
    const response = await claude.chat(message, options);
    
    // Cache response
    await this.cache.setex(cacheKey, this.ttl, response);
    
    return response;
  }
  
  private generateCacheKey(message: string, options: ChatOptions): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify({ message, options }))
      .digest('hex');
  }
}
\`\`\`

## Roadmap voor verdere ontwikkeling

### Maand 1-2: Fundamentals
- [ ] Master prompt engineering technieken
- [ ] Bouw 3-5 kleine projecten
- [ ] Experimenteer met verschillende use cases
- [ ] Join Anthropic Discord community

### Maand 3-4: Advanced Features
- [ ] Implementeer RAG systeem
- [ ] Bouw multi-agent applicatie
- [ ] Integreer met externe APIs
- [ ] Optimaliseer voor performance

### Maand 5-6: Production Ready
- [ ] Deploy eerste production app
- [ ] Implementeer monitoring
- [ ] Optimize costs
- [ ] Gather user feedback

### Ongoing: Mastery
- [ ] Contribute to open source
- [ ] Share learnings (blog/talks)
- [ ] Explore nieuwe features
- [ ] Build portfolio of AI apps

## Afsluitende tips

### Do's:
- ✅ Start klein en itereer
- ✅ Test thoroughly met edge cases
- ✅ Monitor kosten vanaf dag 1
- ✅ Vraag feedback van gebruikers
- ✅ Blijf op de hoogte van updates

### Don'ts:
- ❌ Over-engineer vroege prototypes
- ❌ Negeer security best practices
- ❌ Vergeet error handling
- ❌ Skip documentation
- ❌ Werk in isolatie

## Conclusie

Je hebt nu de kennis en tools om krachtige AI-applicaties te bouwen met Claude. De mogelijkheden zijn eindeloos - van chatbots tot research assistants, van code generators tot creative writing tools.

Belangrijkste takeaways:
- **Begin met een duidelijk probleem** dat je wilt oplossen
- **Itereer snel** en leer van gebruikersfeedback
- **Focus op waarde** in plaats van technische complexiteit
- **Blijf leren** - het AI landschap evolueert snel
- **Deel je kennis** met de community

Succes met je AI journey! 🚀
  `
};