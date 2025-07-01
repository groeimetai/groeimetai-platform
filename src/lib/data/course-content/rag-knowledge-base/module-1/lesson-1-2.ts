import { Lesson } from '@/lib/data/courses'

export const lesson1_2: Lesson = {
  id: 'lesson-1-2',
  title: 'RAG architectuur: De componenten uitgelegd',
  duration: '30 min',
  content: `# RAG architectuur: De componenten uitgelegd

In deze les duiken we diep in de architectuur van RAG-systemen. Je leert alle componenten kennen, hoe ze samenwerken, en hoe je een robuuste RAG-architectuur opzet.

## Overzicht van de RAG-architectuur

Een RAG-systeem bestaat uit verschillende componenten die naadloos samenwerken:

\`\`\`mermaid
graph TB
    A[Gebruiker] -->|Query| B[Orchestration Layer]
    B --> C[Query Processing]
    C --> D[Embedding Model]
    D -->|Query Vector| E[Vector Database]
    E -->|Relevante Documenten| F[Retriever]
    F -->|Context| G[LLM Generator]
    G -->|Antwoord| B
    B -->|Response| A
    
    H[Document Store] -->|Documenten| I[Document Processing]
    I --> D
    D -->|Document Vectors| E
    
    style B fill:#f9f,stroke:#333,stroke-width:4px
    style E fill:#bbf,stroke:#333,stroke-width:2px
    style G fill:#bfb,stroke:#333,stroke-width:2px
\`\`\`

## 1. Document Store / Knowledge Base

De Document Store is het fundament van je RAG-systeem. Hier worden alle bronmaterialen opgeslagen die je systeem kan raadplegen.

### Kenmerken:
- **Formaat-agnostisch**: Ondersteunt PDF, TXT, HTML, JSON, etc.
- **Metadata management**: Bewaar belangrijke context bij documenten
- **Versioning**: Houd verschillende versies van documenten bij
- **Access control**: Bepaal wie welke documenten mag zien

### Implementatie voorbeeld:

\`\`\`typescript
interface Document {
  id: string
  content: string
  metadata: {
    source: string
    created_at: Date
    updated_at: Date
    author?: string
    tags?: string[]
    version?: number
  }
}

class DocumentStore {
  private documents: Map<string, Document> = new Map()
  
  async addDocument(doc: Document): Promise<void> {
    // Valideer document
    if (!doc.content || doc.content.length === 0) {
      throw new Error('Document moet content bevatten')
    }
    
    // Voeg timestamp toe
    doc.metadata.created_at = new Date()
    doc.metadata.updated_at = new Date()
    
    // Sla op
    this.documents.set(doc.id, doc)
  }
  
  async getDocument(id: string): Promise<Document | null> {
    return this.documents.get(id) || null
  }
  
  async searchByMetadata(query: Partial<Document['metadata']>): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => {
      return Object.entries(query).every(([key, value]) => {
        return doc.metadata[key as keyof typeof doc.metadata] === value
      })
    })
  }
}
\`\`\`

## 2. Embedding Model

Het Embedding Model zet tekst om naar numerieke vectoren die de semantische betekenis vastleggen.

### Belangrijke eigenschappen:
- **Dimensionaliteit**: Meestal 384-1536 dimensies
- **Multilingualiteit**: Ondersteuning voor meerdere talen
- **Domein-specificiteit**: Algemeen vs. gespecialiseerd
- **Performance**: Snelheid vs. kwaliteit trade-off

### Implementatie met verschillende modellen:

\`\`\`typescript
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { HuggingFaceInferenceEmbeddings } from 'langchain/embeddings/hf'

interface EmbeddingProvider {
  embedText(text: string): Promise<number[]>
  embedBatch(texts: string[]): Promise<number[][]>
}

// OpenAI implementatie
class OpenAIEmbeddingProvider implements EmbeddingProvider {
  private embeddings: OpenAIEmbeddings
  
  constructor() {
    this.embeddings = new OpenAIEmbeddings({
      modelName: 'text-embedding-3-small', // 1536 dimensies
      openAIApiKey: process.env.OPENAI_API_KEY
    })
  }
  
  async embedText(text: string): Promise<number[]> {
    return await this.embeddings.embedQuery(text)
  }
  
  async embedBatch(texts: string[]): Promise<number[][]> {
    return await this.embeddings.embedDocuments(texts)
  }
}

// Open-source alternatief
class HuggingFaceEmbeddingProvider implements EmbeddingProvider {
  private embeddings: HuggingFaceInferenceEmbeddings
  
  constructor() {
    this.embeddings = new HuggingFaceInferenceEmbeddings({
      model: 'sentence-transformers/all-MiniLM-L6-v2', // 384 dimensies
      apiKey: process.env.HF_API_KEY
    })
  }
  
  async embedText(text: string): Promise<number[]> {
    return await this.embeddings.embedQuery(text)
  }
  
  async embedBatch(texts: string[]): Promise<number[][]> {
    // Batch processing voor efficiëntie
    const batchSize = 32
    const results: number[][] = []
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize)
      const embeddings = await this.embeddings.embedDocuments(batch)
      results.push(...embeddings)
    }
    
    return results
  }
}
\`\`\`

## 3. Vector Database

De Vector Database slaat embeddings op en maakt snelle similarity search mogelijk.

### Populaire opties:
- **Pinecone**: Cloud-native, schaalbaar
- **Weaviate**: Open-source, GraphQL API
- **Qdrant**: High-performance, Rust-based
- **ChromaDB**: Embedded, Python-first
- **pgvector**: PostgreSQL extensie

### Implementatie met meerdere backends:

\`\`\`typescript
import { PineconeClient } from '@pinecone-database/pinecone'
import { QdrantClient } from '@qdrant/js-client-rest'

interface VectorStore {
  upsert(vectors: Vector[]): Promise<void>
  search(query: number[], topK: number): Promise<SearchResult[]>
  delete(ids: string[]): Promise<void>
}

interface Vector {
  id: string
  values: number[]
  metadata: Record<string, any>
}

interface SearchResult {
  id: string
  score: number
  metadata: Record<string, any>
}

// Pinecone implementatie
class PineconeVectorStore implements VectorStore {
  private client: PineconeClient
  private indexName: string
  
  constructor(indexName: string) {
    this.client = new PineconeClient()
    this.indexName = indexName
  }
  
  async init() {
    await this.client.init({
      apiKey: process.env.PINECONE_API_KEY!,
      environment: process.env.PINECONE_ENVIRONMENT!
    })
  }
  
  async upsert(vectors: Vector[]): Promise<void> {
    const index = this.client.Index(this.indexName)
    
    // Batch upsert voor efficiëntie
    const batchSize = 100
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize)
      await index.upsert({
        upsertRequest: {
          vectors: batch.map(v => ({
            id: v.id,
            values: v.values,
            metadata: v.metadata
          }))
        }
      })
    }
  }
  
  async search(query: number[], topK: number): Promise<SearchResult[]> {
    const index = this.client.Index(this.indexName)
    const results = await index.query({
      queryRequest: {
        vector: query,
        topK,
        includeMetadata: true
      }
    })
    
    return results.matches?.map(match => ({
      id: match.id,
      score: match.score || 0,
      metadata: match.metadata || {}
    })) || []
  }
  
  async delete(ids: string[]): Promise<void> {
    const index = this.client.Index(this.indexName)
    await index.delete1({
      deleteRequest: {
        ids
      }
    })
  }
}
\`\`\`

## 4. Retriever

De Retriever haalt relevante documenten op basis van de query. Moderne retrievers gebruiken hybride zoekstrategieën.

### Retrieval strategieën:

\`\`\`typescript
interface RetrievalStrategy {
  retrieve(query: string, topK: number): Promise<Document[]>
}

// Basis semantic search
class SemanticRetriever implements RetrievalStrategy {
  constructor(
    private embedder: EmbeddingProvider,
    private vectorStore: VectorStore,
    private documentStore: DocumentStore
  ) {}
  
  async retrieve(query: string, topK: number): Promise<Document[]> {
    // Embed de query
    const queryVector = await this.embedder.embedText(query)
    
    // Zoek in vector database
    const results = await this.vectorStore.search(queryVector, topK)
    
    // Haal volledige documenten op
    const documents = await Promise.all(
      results.map(r => this.documentStore.getDocument(r.id))
    )
    
    return documents.filter((d): d is Document => d !== null)
  }
}

// Hybride retriever met keyword search
class HybridRetriever implements RetrievalStrategy {
  constructor(
    private semanticRetriever: SemanticRetriever,
    private keywordIndex: KeywordSearchIndex
  ) {}
  
  async retrieve(query: string, topK: number): Promise<Document[]> {
    // Parallelle retrieval
    const [semanticResults, keywordResults] = await Promise.all([
      this.semanticRetriever.retrieve(query, topK),
      this.keywordIndex.search(query, topK)
    ])
    
    // Reciprocal Rank Fusion
    return this.fuseResults(semanticResults, keywordResults, topK)
  }
  
  private fuseResults(
    semantic: Document[], 
    keyword: Document[], 
    topK: number
  ): Document[] {
    const scores = new Map<string, number>()
    
    // Score semantic results
    semantic.forEach((doc, idx) => {
      const score = 1 / (idx + 60) // RRF constant = 60
      scores.set(doc.id, score)
    })
    
    // Score keyword results
    keyword.forEach((doc, idx) => {
      const score = 1 / (idx + 60)
      const current = scores.get(doc.id) || 0
      scores.set(doc.id, current + score)
    })
    
    // Sorteer en return top K
    return Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK)
      .map(([id]) => semantic.find(d => d.id === id) || keyword.find(d => d.id === id))
      .filter((d): d is Document => d !== undefined)
  }
}
\`\`\`

## 5. LLM Generator

De Generator gebruikt de opgehaalde context om een antwoord te genereren.

### Implementatie met verschillende LLMs:

\`\`\`typescript
interface LLMGenerator {
  generate(prompt: string, context: Document[]): Promise<string>
}

class OpenAIGenerator implements LLMGenerator {
  private model: string = 'gpt-4-turbo-preview'
  
  async generate(prompt: string, context: Document[]): Promise<string> {
    // Bouw de system prompt
    const systemPrompt = \`Je bent een behulpzame assistent die vragen beantwoordt 
    op basis van de gegeven context. Gebruik alleen informatie uit de context.
    Als de context het antwoord niet bevat, zeg dat dan eerlijk.\`
    
    // Format context
    const contextStr = context
      .map((doc, idx) => \`[Document \${idx + 1}]\\n\${doc.content}\`)
      .join('\\n\\n')
    
    // Maak de messages
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: \`Context:\\n\${contextStr}\\n\\nVraag: \${prompt}\` }
    ]
    
    // Genereer antwoord
    const response = await openai.chat.completions.create({
      model: this.model,
      messages,
      temperature: 0.7,
      max_tokens: 1000
    })
    
    return response.choices[0].message.content || ''
  }
}

// Advanced generator met citation support
class CitationAwareGenerator implements LLMGenerator {
  async generate(prompt: string, context: Document[]): Promise<string> {
    const systemPrompt = \`Je bent een behulpzame assistent. 
    Beantwoord vragen op basis van de context.
    Voeg bronvermeldingen toe in het formaat [1], [2], etc.
    
    Formaat:
    - Geef eerst het antwoord
    - Voeg inline citaties toe waar relevant
    - Eindig met een bronnenlijst\`
    
    // Context met ID's
    const contextWithIds = context
      .map((doc, idx) => ({
        id: idx + 1,
        content: doc.content,
        source: doc.metadata.source
      }))
    
    const contextStr = contextWithIds
      .map(c => \`[Document \${c.id}] (Bron: \${c.source})\\n\${c.content}\`)
      .join('\\n\\n')
    
    // Generate met citaties
    const response = await this.callLLM(systemPrompt, prompt, contextStr)
    
    // Voeg bronnenlijst toe
    const sources = contextWithIds
      .map(c => \`[\${c.id}] \${c.source}\`)
      .join('\\n')
    
    return \`\${response}\\n\\n## Bronnen\\n\${sources}\`
  }
  
  private async callLLM(
    system: string, 
    prompt: string, 
    context: string
  ): Promise<string> {
    // LLM aanroep implementatie
    return ''
  }
}
\`\`\`

## 6. Orchestration Layer

De Orchestration Layer coördineert alle componenten en handelt de complete flow af.

\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant O as Orchestrator
    participant QP as Query Processor
    participant R as Retriever
    participant G as Generator
    participant C as Cache
    
    U->>O: Query
    O->>C: Check cache
    alt Cache hit
        C->>O: Cached response
        O->>U: Response
    else Cache miss
        O->>QP: Process query
        QP->>O: Processed query
        O->>R: Retrieve context
        R->>O: Relevant documents
        O->>G: Generate response
        G->>O: Generated answer
        O->>C: Cache response
        O->>U: Response
    end
\`\`\`

### Complete orchestrator implementatie:

\`\`\`typescript
interface RAGConfig {
  embedder: EmbeddingProvider
  vectorStore: VectorStore
  documentStore: DocumentStore
  generator: LLMGenerator
  retriever?: RetrievalStrategy
  cache?: CacheProvider
}

class RAGOrchestrator {
  private config: RAGConfig
  private retriever: RetrievalStrategy
  private cache?: CacheProvider
  
  constructor(config: RAGConfig) {
    this.config = config
    this.retriever = config.retriever || new SemanticRetriever(
      config.embedder,
      config.vectorStore,
      config.documentStore
    )
    this.cache = config.cache
  }
  
  async query(userQuery: string, options?: QueryOptions): Promise<RAGResponse> {
    const startTime = Date.now()
    
    try {
      // 1. Check cache
      if (this.cache) {
        const cached = await this.cache.get(userQuery)
        if (cached) {
          return {
            answer: cached.answer,
            sources: cached.sources,
            cached: true,
            latency: Date.now() - startTime
          }
        }
      }
      
      // 2. Query preprocessing
      const processedQuery = await this.preprocessQuery(userQuery)
      
      // 3. Retrieve relevant documents
      const documents = await this.retriever.retrieve(
        processedQuery, 
        options?.topK || 5
      )
      
      // 4. Rerank indien nodig
      const rerankedDocs = options?.rerank 
        ? await this.rerankDocuments(processedQuery, documents)
        : documents
      
      // 5. Generate response
      const answer = await this.config.generator.generate(
        processedQuery,
        rerankedDocs
      )
      
      // 6. Post-processing
      const finalAnswer = await this.postprocessAnswer(answer, userQuery)
      
      // 7. Cache het resultaat
      const response: RAGResponse = {
        answer: finalAnswer,
        sources: rerankedDocs.map(d => ({
          id: d.id,
          source: d.metadata.source,
          relevance: d.metadata.score || 0
        })),
        cached: false,
        latency: Date.now() - startTime
      }
      
      if (this.cache) {
        await this.cache.set(userQuery, response)
      }
      
      return response
      
    } catch (error) {
      console.error('RAG query failed:', error)
      throw new Error(\`Query verwerking mislukt: \${error.message}\`)
    }
  }
  
  private async preprocessQuery(query: string): Promise<string> {
    // Query expansion, spelling correctie, etc.
    return query.trim().toLowerCase()
  }
  
  private async rerankDocuments(
    query: string, 
    docs: Document[]
  ): Promise<Document[]> {
    // Implementeer cross-encoder reranking
    // Voor nu: return as-is
    return docs
  }
  
  private async postprocessAnswer(
    answer: string, 
    originalQuery: string
  ): Promise<string> {
    // Validatie, formatting, fact-checking
    return answer
  }
}
\`\`\`

## Architectuur Patronen

### 1. Simple RAG
Basis architectuur voor kleine toepassingen:

\`\`\`mermaid
graph LR
    A[Query] --> B[Embed]
    B --> C[Vector Search]
    C --> D[Generate]
    D --> E[Response]
\`\`\`

### 2. Advanced RAG
Productie-klare architectuur met extra features:

\`\`\`mermaid
graph TB
    A[Query] --> B[Query Understanding]
    B --> C{Router}
    C -->|Simple| D[Semantic Search]
    C -->|Complex| E[Multi-hop Reasoning]
    C -->|Factual| F[Knowledge Graph]
    
    D --> G[Reranker]
    E --> G
    F --> G
    
    G --> H[Context Compression]
    H --> I[LLM Generator]
    I --> J[Answer Validation]
    J --> K[Response]
    
    L[Feedback Loop] --> B
    K --> L
\`\`\`

### 3. Agentic RAG
AI agents met RAG capabilities:

\`\`\`typescript
class AgenticRAG {
  private orchestrator: RAGOrchestrator
  private tools: Tool[]
  private memory: ConversationMemory
  
  async process(query: string): Promise<AgentResponse> {
    // 1. Bepaal intent
    const intent = await this.classifyIntent(query)
    
    // 2. Route naar juiste handler
    switch (intent.type) {
      case 'factual_question':
        return await this.handleFactualQuery(query)
        
      case 'analysis_request':
        return await this.handleAnalysis(query)
        
      case 'action_required':
        return await this.executeAction(query, intent.action)
        
      default:
        return await this.handleGeneralQuery(query)
    }
  }
  
  private async handleFactualQuery(query: string): Promise<AgentResponse> {
    // Gebruik RAG voor feitelijke vragen
    const ragResponse = await this.orchestrator.query(query)
    
    // Verrijk met memory context
    const context = await this.memory.getRelevantContext(query)
    
    return {
      answer: ragResponse.answer,
      sources: ragResponse.sources,
      confidence: this.calculateConfidence(ragResponse),
      suggestedActions: []
    }
  }
  
  private async handleAnalysis(query: string): Promise<AgentResponse> {
    // Multi-step reasoning met RAG
    const steps = await this.planAnalysis(query)
    const results = []
    
    for (const step of steps) {
      const stepResult = await this.orchestrator.query(step.query)
      results.push({
        step: step.description,
        finding: stepResult.answer
      })
    }
    
    // Synthesize findings
    const synthesis = await this.synthesizeFindings(results)
    
    return {
      answer: synthesis,
      sources: results.flatMap(r => r.sources),
      confidence: 0.85,
      suggestedActions: ['Visualiseer resultaten', 'Export naar rapport']
    }
  }
}
\`\`\`

## Veelgemaakte Architectuur Fouten

### 1. Geen Error Handling
**Fout:**
\`\`\`typescript
async function queryRAG(query: string) {
  const embedding = await embedder.embed(query)
  const results = await vectorDB.search(embedding)
  return await llm.generate(results)
}
\`\`\`

**Correct:**
\`\`\`typescript
async function queryRAG(query: string) {
  try {
    // Validatie
    if (!query || query.trim().length === 0) {
      throw new Error('Query mag niet leeg zijn')
    }
    
    // Embedding met timeout
    const embedding = await Promise.race([
      embedder.embed(query),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Embedding timeout')), 5000)
      )
    ])
    
    // Search met fallback
    let results
    try {
      results = await vectorDB.search(embedding)
    } catch (error) {
      console.warn('Vector search failed, using backup:', error)
      results = await backupSearch.search(query)
    }
    
    // Generate met retry
    return await retryWithBackoff(
      () => llm.generate(results),
      3, // max retries
      1000 // initial delay
    )
    
  } catch (error) {
    // Structured error response
    return {
      error: true,
      message: 'Query kon niet worden verwerkt',
      details: error.message,
      fallbackResponse: 'Probeer uw vraag anders te formuleren'
    }
  }
}
\`\`\`

### 2. Geen Monitoring/Observability
**Correct patroon:**
\`\`\`typescript
class ObservableRAG {
  private metrics: MetricsCollector
  private tracer: Tracer
  
  async query(userQuery: string): Promise<RAGResponse> {
    const span = this.tracer.startSpan('rag.query')
    const queryId = generateId()
    
    try {
      // Track query
      span.setAttributes({
        'query.id': queryId,
        'query.length': userQuery.length,
        'query.language': detectLanguage(userQuery)
      })
      
      // Embedding latency
      const embedStart = Date.now()
      const embedding = await this.embedder.embed(userQuery)
      this.metrics.recordLatency('embedding', Date.now() - embedStart)
      
      // Retrieval metrics
      const retrievalStart = Date.now()
      const documents = await this.retriever.retrieve(embedding)
      this.metrics.recordLatency('retrieval', Date.now() - retrievalStart)
      this.metrics.recordCount('retrieved_documents', documents.length)
      
      // Generation metrics
      const genStart = Date.now()
      const response = await this.generator.generate(userQuery, documents)
      this.metrics.recordLatency('generation', Date.now() - genStart)
      
      // Quality metrics
      const quality = await this.assessQuality(response, userQuery)
      this.metrics.recordGauge('response_quality', quality.score)
      
      span.setStatus({ code: SpanStatusCode.OK })
      return response
      
    } catch (error) {
      span.setStatus({ 
        code: SpanStatusCode.ERROR,
        message: error.message 
      })
      this.metrics.recordCount('errors', 1, { type: error.constructor.name })
      throw error
      
    } finally {
      span.end()
    }
  }
}
\`\`\`

### 3. Geen Scalability Overwegingen
**Scalable architectuur:**
\`\`\`typescript
class ScalableRAG {
  private loadBalancer: LoadBalancer
  private connectionPool: ConnectionPool
  private rateLimiter: RateLimiter
  
  async initialize() {
    // Connection pooling voor databases
    this.connectionPool = new ConnectionPool({
      min: 5,
      max: 20,
      idleTimeout: 30000
    })
    
    // Load balancing voor embedding services
    this.loadBalancer = new LoadBalancer([
      { url: 'http://embed1.internal', weight: 1 },
      { url: 'http://embed2.internal', weight: 1 },
      { url: 'http://embed3.internal', weight: 2 }
    ])
    
    // Rate limiting per user
    this.rateLimiter = new RateLimiter({
      windowMs: 60000, // 1 minuut
      max: 100 // max requests per window
    })
  }
  
  async query(userQuery: string, userId: string): Promise<RAGResponse> {
    // Check rate limit
    if (!await this.rateLimiter.check(userId)) {
      throw new Error('Rate limit exceeded')
    }
    
    // Async processing voor zware queries
    if (this.isComplexQuery(userQuery)) {
      const jobId = await this.queueJob(userQuery, userId)
      return {
        status: 'processing',
        jobId,
        estimatedTime: 30
      }
    }
    
    // Parallel retrieval van multiple indices
    const retrievalTasks = this.indices.map(index => 
      index.retrieve(userQuery).catch(err => {
        console.error(\`Index \${index.name} failed:\`, err)
        return [] // Fail gracefully
      })
    )
    
    const allResults = await Promise.all(retrievalTasks)
    const mergedResults = this.mergeResults(allResults.flat())
    
    return await this.generateResponse(userQuery, mergedResults)
  }
}
\`\`\`

## Best Practices Samenvatting

1. **Modulaire Architectuur**: Houd componenten losjes gekoppeld
2. **Error Resilience**: Implementeer fallbacks en graceful degradation
3. **Performance Monitoring**: Meet latency van elke component
4. **Caching Strategie**: Cache op multiple niveaus (query, embedding, results)
5. **Security**: Implementeer access control en input validatie
6. **Scalability**: Design voor horizontale scaling vanaf het begin
7. **Testing**: Unit tests per component, integration tests voor de flow

Met deze architecturale kennis ben je klaar om robuuste, schaalbare RAG-systemen te bouwen!`,
  codeExamples: [
    {
      id: 'complete-rag-pipeline',
      title: 'Complete RAG Pipeline',
      language: 'typescript',
      code: `// Complete werkende RAG pipeline
import { OpenAI } from 'openai'
import { Pinecone } from '@pinecone-database/pinecone'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'

class CompletRAGPipeline {
  private openai: OpenAI
  private pinecone: Pinecone
  private splitter: RecursiveCharacterTextSplitter
  
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    this.pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200
    })
  }
  
  // Stap 1: Document processing
  async processDocument(content: string, metadata: any) {
    const chunks = await this.splitter.splitText(content)
    const embeddings = await this.embedDocuments(chunks)
    
    const vectors = chunks.map((chunk, i) => ({
      id: \`doc_\${Date.now()}_\${i}\`,
      values: embeddings[i],
      metadata: {
        ...metadata,
        text: chunk,
        chunk_index: i
      }
    }))
    
    await this.storeVectors(vectors)
    return vectors.length
  }
  
  // Stap 2: Embeddings genereren
  private async embedDocuments(texts: string[]): Promise<number[][]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts
    })
    
    return response.data.map(item => item.embedding)
  }
  
  // Stap 3: Vectors opslaan
  private async storeVectors(vectors: any[]) {
    const index = this.pinecone.index('rag-index')
    
    // Batch upsert
    const batchSize = 100
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize)
      await index.upsert(batch)
    }
  }
  
  // Stap 4: Query verwerken
  async query(question: string): Promise<string> {
    // Embed de vraag
    const queryEmbedding = await this.embedQuery(question)
    
    // Zoek relevante chunks
    const searchResults = await this.searchVectors(queryEmbedding)
    
    // Genereer antwoord
    const answer = await this.generateAnswer(question, searchResults)
    
    return answer
  }
  
  private async embedQuery(query: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query
    })
    
    return response.data[0].embedding
  }
  
  private async searchVectors(queryVector: number[]): Promise<any[]> {
    const index = this.pinecone.index('rag-index')
    
    const results = await index.query({
      vector: queryVector,
      topK: 5,
      includeMetadata: true
    })
    
    return results.matches || []
  }
  
  private async generateAnswer(
    question: string, 
    searchResults: any[]
  ): Promise<string> {
    // Bouw context van search results
    const context = searchResults
      .map(r => r.metadata.text)
      .join('\\n\\n')
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Beantwoord vragen op basis van de gegeven context.'
        },
        {
          role: 'user',
          content: \`Context:\\n\${context}\\n\\nVraag: \${question}\`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })
    
    return response.choices[0].message.content || 'Geen antwoord gevonden'
  }
}

// Gebruik
const rag = new CompletRAGPipeline()

// Document toevoegen
await rag.processDocument(
  'Machine learning is een vorm van AI...',
  { source: 'ml-guide.pdf', author: 'John Doe' }
)

// Query uitvoeren
const answer = await rag.query('Wat is machine learning?')
console.log(answer)`
    },
    {
      id: 'hybrid-retrieval',
      title: 'Hybrid Retrieval Implementatie',
      language: 'typescript',
      code: `// Hybride retrieval met semantic + keyword search
import { BM25 } from 'tiny-bm25'

class HybridRetriever {
  private semanticIndex: VectorIndex
  private keywordIndex: BM25
  private documents: Map<string, Document>
  
  constructor() {
    this.documents = new Map()
    this.keywordIndex = new BM25()
  }
  
  async addDocument(doc: Document) {
    // Bewaar document
    this.documents.set(doc.id, doc)
    
    // Semantic indexing
    const embedding = await this.embedDocument(doc.content)
    await this.semanticIndex.add(doc.id, embedding)
    
    // Keyword indexing
    const tokens = this.tokenize(doc.content)
    this.keywordIndex.addDocument(doc.id, tokens)
  }
  
  async search(query: string, topK: number = 10): Promise<SearchResult[]> {
    // Parallel search
    const [semanticResults, keywordResults] = await Promise.all([
      this.semanticSearch(query, topK * 2),
      this.keywordSearch(query, topK * 2)
    ])
    
    // Reciprocal Rank Fusion
    const fusedResults = this.reciprocalRankFusion(
      semanticResults,
      keywordResults,
      topK
    )
    
    return fusedResults
  }
  
  private async semanticSearch(
    query: string, 
    k: number
  ): Promise<ScoredDocument[]> {
    const queryVector = await this.embedDocument(query)
    const results = await this.semanticIndex.search(queryVector, k)
    
    return results.map(r => ({
      document: this.documents.get(r.id)!,
      score: r.score,
      type: 'semantic'
    }))
  }
  
  private keywordSearch(
    query: string, 
    k: number
  ): Promise<ScoredDocument[]> {
    const tokens = this.tokenize(query)
    const results = this.keywordIndex.search(tokens, k)
    
    return results.map(r => ({
      document: this.documents.get(r.id)!,
      score: r.score,
      type: 'keyword'
    }))
  }
  
  private reciprocalRankFusion(
    semantic: ScoredDocument[],
    keyword: ScoredDocument[],
    topK: number
  ): SearchResult[] {
    const k = 60 // RRF constant
    const scores = new Map<string, number>()
    
    // Score semantic results
    semantic.forEach((doc, rank) => {
      const score = 1 / (rank + k)
      scores.set(doc.document.id, score)
    })
    
    // Score keyword results  
    keyword.forEach((doc, rank) => {
      const score = 1 / (rank + k)
      const existing = scores.get(doc.document.id) || 0
      scores.set(doc.document.id, existing + score)
    })
    
    // Sort en return top K
    return Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK)
      .map(([id, score]) => {
        const doc = this.documents.get(id)!
        const semRank = semantic.findIndex(s => s.document.id === id)
        const keyRank = keyword.findIndex(k => k.document.id === id)
        
        return {
          document: doc,
          score,
          semanticRank: semRank >= 0 ? semRank + 1 : null,
          keywordRank: keyRank >= 0 ? keyRank + 1 : null,
          explanation: this.explainRanking(semRank, keyRank)
        }
      })
  }
  
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2)
  }
  
  private explainRanking(semRank: number, keyRank: number): string {
    if (semRank >= 0 && keyRank >= 0) {
      return \`Gevonden via zowel semantic (#\${semRank + 1}) als keyword (#\${keyRank + 1}) search\`
    } else if (semRank >= 0) {
      return \`Gevonden via semantic search (#\${semRank + 1})\`
    } else {
      return \`Gevonden via keyword search (#\${keyRank + 1})\`
    }
  }
}`
    },
    {
      id: 'production-orchestrator',
      title: 'Production-Ready Orchestrator',
      language: 'typescript',
      code: `// Productie-klare RAG orchestrator met alle features
import { Logger } from 'winston'
import { Histogram, Counter } from 'prom-client'

interface RAGComponents {
  embedder: EmbeddingService
  vectorStore: VectorStore
  documentStore: DocumentStore
  generator: GenerationService
  reranker?: RerankerService
  cache?: CacheService
  logger: Logger
}

class ProductionRAGOrchestrator {
  private components: RAGComponents
  
  // Metrics
  private queryLatency: Histogram
  private queryCounter: Counter
  private errorCounter: Counter
  
  constructor(components: RAGComponents) {
    this.components = components
    this.initializeMetrics()
  }
  
  private initializeMetrics() {
    this.queryLatency = new Histogram({
      name: 'rag_query_duration_seconds',
      help: 'RAG query latency in seconds',
      labelNames: ['status', 'cached'],
      buckets: [0.1, 0.5, 1, 2, 5, 10]
    })
    
    this.queryCounter = new Counter({
      name: 'rag_queries_total',
      help: 'Total number of RAG queries',
      labelNames: ['status']
    })
    
    this.errorCounter = new Counter({
      name: 'rag_errors_total',
      help: 'Total number of RAG errors',
      labelNames: ['error_type']
    })
  }
  
  async query(request: RAGRequest): Promise<RAGResponse> {
    const timer = this.queryLatency.startTimer()
    const queryId = this.generateQueryId()
    
    this.components.logger.info('RAG query started', {
      queryId,
      query: request.query.substring(0, 100),
      userId: request.userId
    })
    
    try {
      // 1. Input validation
      this.validateRequest(request)
      
      // 2. Check cache
      if (this.components.cache && !request.skipCache) {
        const cached = await this.checkCache(request.query)
        if (cached) {
          timer({ status: 'success', cached: 'true' })
          this.queryCounter.inc({ status: 'success' })
          return cached
        }
      }
      
      // 3. Query preprocessing
      const processedQuery = await this.preprocessQuery(request.query)
      
      // 4. Retrieve documents
      const documents = await this.retrieveDocuments(
        processedQuery,
        request.options
      )
      
      // 5. Rerank if available
      const rankedDocs = this.components.reranker
        ? await this.rerankDocuments(processedQuery, documents)
        : documents
      
      // 6. Generate response
      const response = await this.generateResponse(
        processedQuery,
        rankedDocs,
        request.options
      )
      
      // 7. Post-process and validate
      const finalResponse = await this.postProcess(response, request)
      
      // 8. Cache response
      if (this.components.cache) {
        await this.cacheResponse(request.query, finalResponse)
      }
      
      // 9. Log and return
      timer({ status: 'success', cached: 'false' })
      this.queryCounter.inc({ status: 'success' })
      
      this.components.logger.info('RAG query completed', {
        queryId,
        latency: Date.now() - timer.startTime,
        documentsRetrieved: documents.length
      })
      
      return finalResponse
      
    } catch (error) {
      timer({ status: 'error', cached: 'false' })
      this.queryCounter.inc({ status: 'error' })
      this.errorCounter.inc({ error_type: error.constructor.name })
      
      this.components.logger.error('RAG query failed', {
        queryId,
        error: error.message,
        stack: error.stack
      })
      
      throw this.wrapError(error)
    }
  }
  
  private async retrieveDocuments(
    query: string,
    options: QueryOptions
  ): Promise<Document[]> {
    const retrievalOptions = {
      topK: options.topK || 10,
      threshold: options.threshold || 0.7,
      filters: options.filters || {}
    }
    
    // Embed query
    const queryVector = await this.components.embedder.embed(query)
    
    // Search with timeout
    const searchPromise = this.components.vectorStore.search(
      queryVector,
      retrievalOptions
    )
    
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Search timeout')), 5000)
    )
    
    const searchResults = await Promise.race([
      searchPromise,
      timeoutPromise
    ])
    
    // Fetch full documents
    const documents = await Promise.all(
      searchResults.map(result =>
        this.components.documentStore.get(result.id)
      )
    )
    
    return documents.filter(doc => doc !== null) as Document[]
  }
  
  private async generateResponse(
    query: string,
    documents: Document[],
    options: QueryOptions
  ): Promise<GeneratedResponse> {
    const generationOptions = {
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens || 1000,
      model: options.model || 'gpt-4'
    }
    
    // Build context
    const context = this.buildContext(documents)
    
    // Generate with retry
    let attempts = 0
    const maxAttempts = 3
    
    while (attempts < maxAttempts) {
      try {
        const response = await this.components.generator.generate({
          query,
          context,
          options: generationOptions
        })
        
        // Validate response
        if (this.isValidResponse(response)) {
          return response
        }
        
        throw new Error('Invalid response generated')
        
      } catch (error) {
        attempts++
        if (attempts >= maxAttempts) {
          throw error
        }
        
        // Exponential backoff
        await this.sleep(Math.pow(2, attempts) * 1000)
      }
    }
    
    throw new Error('Generation failed after retries')
  }
  
  private buildContext(documents: Document[]): string {
    return documents
      .map((doc, idx) => {
        const metadata = Object.entries(doc.metadata)
          .map(([k, v]) => \`\${k}: \${v}\`)
          .join(', ')
        
        return \`[Document \${idx + 1}] (\${metadata})
\${doc.content}
---\`
      })
      .join('\\n\\n')
  }
  
  private async postProcess(
    response: GeneratedResponse,
    request: RAGRequest
  ): Promise<RAGResponse> {
    // Extract citations
    const citations = this.extractCitations(response.text)
    
    // Check for hallucinations
    const hallucinations = await this.checkHallucinations(
      response.text,
      response.context
    )
    
    // Format final response
    return {
      answer: response.text,
      sources: response.sources.map(s => ({
        id: s.id,
        title: s.metadata.title,
        url: s.metadata.url,
        relevanceScore: s.score
      })),
      citations,
      metadata: {
        queryId: response.queryId,
        model: response.model,
        latency: response.latency,
        tokensUsed: response.tokensUsed,
        confidenceScore: this.calculateConfidence(response),
        hallucinationCheck: hallucinations
      }
    }
  }
  
  private wrapError(error: Error): RAGError {
    if (error.name === 'ValidationError') {
      return new RAGError('Invalid request', 400, error.message)
    } else if (error.message.includes('timeout')) {
      return new RAGError('Request timeout', 504, error.message)
    } else if (error.message.includes('rate limit')) {
      return new RAGError('Rate limit exceeded', 429, error.message)
    } else {
      return new RAGError('Internal error', 500, error.message)
    }
  }
  
  private generateQueryId(): string {
    return \`rag_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}`
    }
  ],
  assignments: [
    {
      id: 'assignment-1',
      title: 'Bouw een Document Processing Pipeline',
      type: 'project',
      difficulty: 'medium',
      description: 'Implementeer een complete pipeline voor het verwerken van documenten, inclusief chunking, embedding en opslag.',
      hints: [
        'Gebruik RecursiveCharacterTextSplitter voor chunking',
        'Implementeer batch processing voor embeddings',
        'Voeg metadata toe aan elke chunk'
      ]
    },
    {
      id: 'assignment-2',
      title: 'Implementeer een Hybrid Retriever',
      type: 'project',
      difficulty: 'hard',
      description: 'Bouw een retriever die zowel semantic als keyword search combineert met Reciprocal Rank Fusion.',
      hints: [
        'Implementeer beide search methodes parallel',
        'Gebruik RRF score = 1/(rank + k) met k=60',
        'Test met verschillende query types'
      ]
    },
    {
      id: 'assignment-3',
      title: 'Maak een Monitoring Dashboard',
      type: 'project',
      difficulty: 'medium',
      description: 'Ontwikkel een monitoring systeem dat latency, errors en quality metrics bijhoudt voor je RAG pipeline.',
      hints: [
        'Track latency per component',
        'Implementeer error rate monitoring',
        'Voeg quality assessment metrics toe'
      ]
    }
  ],
  resources: [
    {
      title: 'RAG Architecture Best Practices',
      url: 'https://www.anyscale.com/blog/a-comprehensive-guide-for-building-rag-based-llm-applications-part-1',
      type: 'article'
    },
    {
      title: 'Vector Database Comparison',
      url: 'https://github.com/erikbern/ann-benchmarks',
      type: 'github'
    },
    {
      title: 'LangChain RAG Tutorial',
      url: 'https://python.langchain.com/docs/use_cases/question_answering/',
      type: 'documentation'
    },
    {
      title: 'Hybrid Search Strategies',
      url: 'https://www.pinecone.io/learn/hybrid-search/',
      type: 'tutorial'
    }
  ]
}