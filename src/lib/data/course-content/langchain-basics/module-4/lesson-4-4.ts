import { LessonContent } from '$lib/types/lesson';

const lesson: LessonContent = {
  title: 'Production RAG Systems',
  description: 'Build scalable, reliable RAG systems with caching, load balancing, and monitoring',
  duration: '45 min',
  learningObjectives: [
    'Implement Redis caching for RAG systems',
    'Configure load balancing strategies',
    'Set up monitoring and observability',
    'Deploy production-ready Dutch document search'
  ],
  content: `
# Production RAG Systems

In deze les leren we hoe we robuuste, schaalbare RAG systemen bouwen voor productie-omgevingen. We behandelen caching, load balancing, monitoring, en implementeren een Nederlands overheids-document zoeksysteem.

## Scaling met Redis Cache

### Redis Configuratie

\`\`\`typescript
// redis-config.ts
import Redis from 'ioredis';
import { createHash } from 'crypto';

export class RedisCache {
  private client: Redis;
  private defaultTTL = 3600; // 1 uur

  constructor(config: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  }) {
    this.client = new Redis({
      ...config,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 50, 2000)
    });
  }

  // Genereer cache key
  private generateKey(query: string, metadata?: any): string {
    const data = { query, metadata };
    return createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  // Cache embeddings
  async cacheEmbedding(
    text: string, 
    embedding: number[]
  ): Promise<void> {
    const key = \`embedding:\${this.generateKey(text)}\`;
    await this.client.setex(
      key, 
      this.defaultTTL,
      JSON.stringify(embedding)
    );
  }

  // Haal embedding op
  async getEmbedding(text: string): Promise<number[] | null> {
    const key = \`embedding:\${this.generateKey(text)}\`;
    const cached = await this.client.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  // Cache search resultaten
  async cacheSearchResults(
    query: string,
    results: any[],
    ttl = this.defaultTTL
  ): Promise<void> {
    const key = \`search:\${this.generateKey(query)}\`;
    await this.client.setex(key, ttl, JSON.stringify(results));
  }

  // Haal search resultaten op
  async getSearchResults(query: string): Promise<any[] | null> {
    const key = \`search:\${this.generateKey(query)}\`;
    const cached = await this.client.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  // Cache statistieken
  async getStats(): Promise<{
    hitRate: number;
    totalRequests: number;
    cacheSize: number;
  }> {
    const [hits, misses, size] = await Promise.all([
      this.client.get('stats:hits'),
      this.client.get('stats:misses'),
      this.client.dbsize()
    ]);

    const totalHits = parseInt(hits || '0');
    const totalMisses = parseInt(misses || '0');
    const total = totalHits + totalMisses;

    return {
      hitRate: total > 0 ? totalHits / total : 0,
      totalRequests: total,
      cacheSize: size
    };
  }

  async close(): Promise<void> {
    await this.client.quit();
  }
}
\`\`\`

## Load Balancing Strategies

### Multi-Node RAG Setup

\`\`\`typescript
// load-balancer.ts
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";

interface RAGNode {
  id: string;
  embeddings: OpenAIEmbeddings;
  vectorStore: PineconeStore;
  load: number;
  maxLoad: number;
  healthy: boolean;
}

export class LoadBalancedRAG {
  private nodes: RAGNode[] = [];
  private currentIndex = 0;

  constructor(private healthCheckInterval = 30000) {
    this.startHealthChecks();
  }

  // Voeg node toe
  async addNode(config: {
    id: string;
    openAIKey: string;
    pineconeConfig: any;
    maxLoad?: number;
  }): Promise<void> {
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: config.openAIKey,
      maxRetries: 3,
      timeout: 10000
    });

    const vectorStore = await PineconeStore.fromExistingIndex(
      embeddings,
      config.pineconeConfig
    );

    this.nodes.push({
      id: config.id,
      embeddings,
      vectorStore,
      load: 0,
      maxLoad: config.maxLoad || 100,
      healthy: true
    });
  }

  // Round-robin strategy
  private selectNodeRoundRobin(): RAGNode | null {
    const healthyNodes = this.nodes.filter(n => n.healthy);
    if (healthyNodes.length === 0) return null;

    const node = healthyNodes[this.currentIndex % healthyNodes.length];
    this.currentIndex++;
    return node;
  }

  // Least-connections strategy
  private selectNodeLeastConnections(): RAGNode | null {
    const availableNodes = this.nodes.filter(
      n => n.healthy && n.load < n.maxLoad
    );

    if (availableNodes.length === 0) return null;

    return availableNodes.reduce((min, node) => 
      node.load < min.load ? node : min
    );
  }

  // Weighted round-robin
  private selectNodeWeighted(): RAGNode | null {
    const healthyNodes = this.nodes.filter(n => n.healthy);
    if (healthyNodes.length === 0) return null;

    const weights = healthyNodes.map(n => 
      (n.maxLoad - n.load) / n.maxLoad
    );

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < healthyNodes.length; i++) {
      random -= weights[i];
      if (random <= 0) return healthyNodes[i];
    }

    return healthyNodes[0];
  }

  // Zoek met load balancing
  async search(
    query: string,
    strategy: 'round-robin' | 'least-connections' | 'weighted' = 'least-connections'
  ): Promise<any[]> {
    let node: RAGNode | null;

    switch (strategy) {
      case 'round-robin':
        node = this.selectNodeRoundRobin();
        break;
      case 'least-connections':
        node = this.selectNodeLeastConnections();
        break;
      case 'weighted':
        node = this.selectNodeWeighted();
        break;
    }

    if (!node) {
      throw new Error('Geen beschikbare nodes');
    }

    node.load++;
    try {
      const results = await node.vectorStore.similaritySearch(query, 4);
      return results;
    } finally {
      node.load--;
    }
  }

  // Health checks
  private startHealthChecks(): void {
    setInterval(async () => {
      for (const node of this.nodes) {
        try {
          // Test embedding generatie
          await node.embeddings.embedQuery('health check');
          node.healthy = true;
        } catch (error) {
          console.error(\`Node \${node.id} health check failed:\`, error);
          node.healthy = false;
        }
      }
    }, this.healthCheckInterval);
  }

  // Node statistieken
  getNodeStats(): Array<{
    id: string;
    load: number;
    maxLoad: number;
    healthy: boolean;
    utilization: number;
  }> {
    return this.nodes.map(node => ({
      id: node.id,
      load: node.load,
      maxLoad: node.maxLoad,
      healthy: node.healthy,
      utilization: node.load / node.maxLoad
    }));
  }
}
\`\`\`

## Monitoring & Observability

### Prometheus Metrics

\`\`\`typescript
// monitoring.ts
import { Registry, Counter, Histogram, Gauge } from 'prom-client';
import { Logger } from 'winston';

export class RAGMonitoring {
  private registry: Registry;
  private queryCounter: Counter<string>;
  private queryDuration: Histogram<string>;
  private activeQueries: Gauge<string>;
  private embeddingCacheHitRate: Gauge<string>;
  private vectorStoreSize: Gauge<string>;
  private errorCounter: Counter<string>;

  constructor(private logger: Logger) {
    this.registry = new Registry();

    // Query metrics
    this.queryCounter = new Counter({
      name: 'rag_queries_total',
      help: 'Totaal aantal RAG queries',
      labelNames: ['type', 'status'],
      registers: [this.registry]
    });

    this.queryDuration = new Histogram({
      name: 'rag_query_duration_seconds',
      help: 'RAG query duratie in seconden',
      labelNames: ['type'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [this.registry]
    });

    this.activeQueries = new Gauge({
      name: 'rag_active_queries',
      help: 'Aantal actieve RAG queries',
      registers: [this.registry]
    });

    // Cache metrics
    this.embeddingCacheHitRate = new Gauge({
      name: 'rag_embedding_cache_hit_rate',
      help: 'Embedding cache hit rate',
      registers: [this.registry]
    });

    // Vector store metrics
    this.vectorStoreSize = new Gauge({
      name: 'rag_vector_store_size',
      help: 'Aantal documenten in vector store',
      labelNames: ['index'],
      registers: [this.registry]
    });

    // Error metrics
    this.errorCounter = new Counter({
      name: 'rag_errors_total',
      help: 'Totaal aantal RAG errors',
      labelNames: ['type', 'component'],
      registers: [this.registry]
    });
  }

  // Track query
  async trackQuery<T>(
    type: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const timer = this.queryDuration.startTimer({ type });
    this.activeQueries.inc();

    try {
      const result = await operation();
      this.queryCounter.inc({ type, status: 'success' });
      this.logger.info('Query completed', { type, duration: timer() });
      return result;
    } catch (error) {
      this.queryCounter.inc({ type, status: 'error' });
      this.errorCounter.inc({ 
        type: 'query', 
        component: type 
      });
      this.logger.error('Query failed', { type, error });
      throw error;
    } finally {
      this.activeQueries.dec();
    }
  }

  // Update cache metrics
  updateCacheMetrics(hitRate: number): void {
    this.embeddingCacheHitRate.set(hitRate);
  }

  // Update vector store metrics
  updateVectorStoreSize(index: string, size: number): void {
    this.vectorStoreSize.set({ index }, size);
  }

  // Structured logging
  createQueryLog(data: {
    queryId: string;
    query: string;
    resultCount: number;
    duration: number;
    cacheHit: boolean;
  }): void {
    this.logger.info('RAG Query', {
      ...data,
      timestamp: new Date().toISOString(),
      service: 'rag-system'
    });
  }

  // Performance tracking
  async trackPerformance(): Promise<{
    avgQueryTime: number;
    p95QueryTime: number;
    throughput: number;
    errorRate: number;
  }> {
    const metrics = await this.registry.getMetricsAsJSON();
    
    // Bereken statistieken
    const queryMetrics = metrics.find(
      m => m.name === 'rag_query_duration_seconds'
    );
    
    const errorMetrics = metrics.find(
      m => m.name === 'rag_errors_total'
    );

    return {
      avgQueryTime: queryMetrics?.values[0]?.value || 0,
      p95QueryTime: queryMetrics?.values[1]?.value || 0,
      throughput: this.queryCounter.get().values[0]?.value || 0,
      errorRate: errorMetrics?.values[0]?.value || 0
    };
  }

  // Export metrics voor Prometheus
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
\`\`\`

## Nederlandse Overheids-documenten Voorbeeld

### Document Processing Pipeline

\`\`\`typescript
// dutch-gov-rag.ts
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { RedisCache } from './redis-config';
import { RAGMonitoring } from './monitoring';
import winston from 'winston';

export class DutchGovernmentRAG {
  private embeddings: OpenAIEmbeddings;
  private vectorStore: PineconeStore;
  private cache: RedisCache;
  private monitoring: RAGMonitoring;
  private splitter: RecursiveCharacterTextSplitter;

  constructor(config: {
    openAIApiKey: string;
    pineconeConfig: any;
    redisConfig: any;
  }) {
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: config.openAIApiKey,
      modelName: "text-embedding-3-small"
    });

    this.cache = new RedisCache(config.redisConfig);
    
    const logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [
        new winston.transports.File({ filename: 'rag.log' }),
        new winston.transports.Console()
      ]
    });

    this.monitoring = new RAGMonitoring(logger);

    // Nederlandse text splitter configuratie
    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ["\\n\\n", "\\n", ". ", ", ", " "],
      keepSeparator: true
    });
  }

  // Initialiseer vector store
  async initialize(): Promise<void> {
    this.vectorStore = await PineconeStore.fromExistingIndex(
      this.embeddings,
      {
        pineconeIndex: await this.createPineconeIndex(),
        namespace: "dutch-government-docs"
      }
    );
  }

  // Process overheids PDF
  async processGovernmentPDF(
    pdfPath: string,
    metadata: {
      ministry: string;
      documentType: string;
      year: number;
      language: 'nl' | 'en';
    }
  ): Promise<void> {
    await this.monitoring.trackQuery('document-processing', async () => {
      // Laad PDF
      const loader = new PDFLoader(pdfPath, {
        splitPages: true,
        pdfjs: () => import('pdfjs-dist/legacy/build/pdf.js')
      });

      const docs = await loader.load();

      // Voeg metadata toe
      const enrichedDocs = docs.map(doc => ({
        ...doc,
        metadata: {
          ...doc.metadata,
          ...metadata,
          source: pdfPath,
          processedAt: new Date().toISOString()
        }
      }));

      // Split documenten
      const splitDocs = await this.splitter.splitDocuments(enrichedDocs);

      // Batch processing voor efficiency
      const batchSize = 100;
      for (let i = 0; i < splitDocs.length; i += batchSize) {
        const batch = splitDocs.slice(i, i + batchSize);
        
        // Check cache voor bestaande embeddings
        const embeddings = await Promise.all(
          batch.map(async (doc) => {
            const cached = await this.cache.getEmbedding(doc.pageContent);
            if (cached) return cached;

            const embedding = await this.embeddings.embedQuery(doc.pageContent);
            await this.cache.cacheEmbedding(doc.pageContent, embedding);
            return embedding;
          })
        );

        // Voeg toe aan vector store
        await this.vectorStore.addVectors(
          embeddings,
          batch
        );
      }

      // Update metrics
      this.monitoring.updateVectorStoreSize(
        'dutch-government-docs',
        splitDocs.length
      );
    });
  }

  // Zoek in documenten met caching
  async search(query: string, filters?: {
    ministry?: string;
    year?: number;
    documentType?: string;
  }): Promise<any[]> {
    const queryId = crypto.randomUUID();
    const startTime = Date.now();

    return await this.monitoring.trackQuery('search', async () => {
      // Check cache
      const cacheKey = JSON.stringify({ query, filters });
      const cachedResults = await this.cache.getSearchResults(cacheKey);
      
      if (cachedResults) {
        this.monitoring.createQueryLog({
          queryId,
          query,
          resultCount: cachedResults.length,
          duration: Date.now() - startTime,
          cacheHit: true
        });
        return cachedResults;
      }

      // Zoek in vector store
      const filter = this.buildPineconeFilter(filters);
      const results = await this.vectorStore.similaritySearchWithScore(
        query,
        4,
        filter
      );

      // Format resultaten
      const formattedResults = results.map(([doc, score]) => ({
        content: doc.pageContent,
        metadata: doc.metadata,
        relevanceScore: score,
        highlight: this.generateHighlight(doc.pageContent, query)
      }));

      // Cache resultaten
      await this.cache.cacheSearchResults(cacheKey, formattedResults);

      this.monitoring.createQueryLog({
        queryId,
        query,
        resultCount: formattedResults.length,
        duration: Date.now() - startTime,
        cacheHit: false
      });

      return formattedResults;
    });
  }

  // Genereer highlight voor zoekresultaat
  private generateHighlight(content: string, query: string): string {
    const words = query.toLowerCase().split(' ');
    const sentences = content.split('. ');
    
    // Vind meest relevante zin
    let bestSentence = sentences[0];
    let maxMatches = 0;

    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      const matches = words.filter(word => lowerSentence.includes(word)).length;
      
      if (matches > maxMatches) {
        maxMatches = matches;
        bestSentence = sentence;
      }
    }

    return bestSentence.substring(0, 200) + '...';
  }

  // Bouw Pinecone filter
  private buildPineconeFilter(filters?: any): any {
    if (!filters) return undefined;

    const conditions: any[] = [];

    if (filters.ministry) {
      conditions.push({ ministry: { $eq: filters.ministry } });
    }

    if (filters.year) {
      conditions.push({ year: { $eq: filters.year } });
    }

    if (filters.documentType) {
      conditions.push({ documentType: { $eq: filters.documentType } });
    }

    return conditions.length > 0 ? { $and: conditions } : undefined;
  }

  // Health check
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    components: Record<string, boolean>;
  }> {
    const checks = {
      embeddings: false,
      vectorStore: false,
      cache: false
    };

    try {
      await this.embeddings.embedQuery('health check');
      checks.embeddings = true;
    } catch (e) {}

    try {
      await this.vectorStore.similaritySearch('test', 1);
      checks.vectorStore = true;
    } catch (e) {}

    try {
      await this.cache.getStats();
      checks.cache = true;
    } catch (e) {}

    const allHealthy = Object.values(checks).every(v => v);

    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      components: checks
    };
  }
}
\`\`\`

Deze les behandelt alle aspecten van productie-klare RAG systemen, inclusief schaling, monitoring en een praktisch voorbeeld met Nederlandse overheidsdocumenten.
  `,
  exercises: [
    {
      id: 'prod-rag-1',
      title: 'Implementeer Cache Warming',
      description: 'Bouw een cache warming systeem voor populaire queries',
      difficulty: 'intermediate' as const,
      type: 'coding' as const,
      points: 25,
      hints: [
        'Analyseer query logs voor populaire zoektermen',
        'Pre-compute embeddings tijdens daluren',
        'Implementeer TTL-based refresh strategie'
      ],
      validate: async (answer: string) => {
        const required = [
          'analyzeQueryLogs',
          'warmCache',
          'scheduleRefresh',
          'priorityQueue'
        ];
        return {
          isCorrect: required.every(req => answer.includes(req)),
          feedback: answer.includes('analyzeQueryLogs') && answer.includes('warmCache')
            ? 'Uitstekend! Je cache warming strategie is compleet.'
            : 'Implementeer query analyse en scheduled warming.'
        };
      }
    },
    {
      id: 'prod-rag-2',
      title: 'Circuit Breaker Pattern',
      description: 'Implementeer circuit breaker voor failover handling',
      difficulty: 'advanced' as const,
      type: 'coding' as const,
      points: 30,
      hints: [
        'Track failure rates per node',
        'Implementeer exponential backoff',
        'Auto-recovery met health checks'
      ],
      validate: async (answer: string) => {
        const required = [
          'CircuitBreaker',
          'failureThreshold',
          'resetTimeout',
          'halfOpen'
        ];
        return {
          isCorrect: required.every(req => answer.includes(req)),
          feedback: answer.includes('CircuitBreaker') && answer.includes('halfOpen')
            ? 'Perfect! Je circuit breaker implementatie is robuust.'
            : 'Voeg failure tracking en recovery logica toe.'
        };
      }
    }
  ],
  resources: [
    {
      type: 'video' as const,
      title: 'Production RAG Architecture',
      url: 'https://youtube.com/production-rag-arch',
      duration: '15 min'
    },
    {
      type: 'documentation' as const,
      title: 'Redis Caching Best Practices',
      url: 'https://redis.io/docs/manual/patterns/'
    },
    {
      type: 'tutorial' as const,
      title: 'Monitoring with Prometheus',
      url: 'https://prometheus.io/docs/practices/'
    }
  ]
};

export default lesson;