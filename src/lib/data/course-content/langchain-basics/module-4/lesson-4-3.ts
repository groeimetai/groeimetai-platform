import { CourseModule } from '$lib/types/course';

export const lesson4_3: CourseModule = {
  id: 'langchain-4-3',
  title: 'Retrieval Optimization',
  description: 'Master advanced retrieval optimization techniques for high-performance RAG systems',
  duration: 60,
  difficulty: 'advanced',
  objectives: [
    'Implement query transformation techniques',
    'Build hybrid search systems',
    'Use cross-encoders for re-ranking',
    'Optimize retrieval for Dutch legal documents'
  ],
  sections: [
    {
      id: 'query-transformation',
      title: 'Query Transformation Techniques',
      content: `
Query transformation is crucial for improving retrieval accuracy. Let's explore advanced techniques:

### Multi-Query Generation

Transform single queries into multiple variations to improve recall:

\`\`\`typescript
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";

class MultiQueryRetriever {
  private llm: ChatOpenAI;
  private queryGenerator: RunnableSequence;
  
  constructor() {
    this.llm = new ChatOpenAI({ temperature: 0.1 });
    
    // Create query generation chain
    const queryPrompt = PromptTemplate.fromTemplate(\`
      You are an AI assistant helping to generate alternative queries.
      Original query: {query}
      
      Generate 3 different versions of this query that:
      1. Use different terminology but maintain the same intent
      2. Are more specific or detailed
      3. Approach the topic from different angles
      
      Return only the queries, one per line.
    \`);
    
    this.queryGenerator = RunnableSequence.from([
      queryPrompt,
      this.llm,
      (output) => output.content.split('\\n').filter(q => q.trim())
    ]);
  }
  
  async generateQueries(originalQuery: string): Promise<string[]> {
    const variations = await this.queryGenerator.invoke({ 
      query: originalQuery 
    });
    
    return [originalQuery, ...variations];
  }
}

// Advanced query decomposition for complex questions
class QueryDecomposer {
  private llm: ChatOpenAI;
  
  constructor() {
    this.llm = new ChatOpenAI({ temperature: 0 });
  }
  
  async decomposeQuery(complexQuery: string): Promise<string[]> {
    const decompositionPrompt = PromptTemplate.fromTemplate(\`
      Decompose this complex query into simpler sub-queries:
      
      Query: {query}
      
      Rules:
      1. Each sub-query should focus on one specific aspect
      2. Sub-queries should be self-contained
      3. Together they should cover the full scope
      
      Return sub-queries as a numbered list.
    \`);
    
    const chain = decompositionPrompt.pipe(this.llm);
    const result = await chain.invoke({ query: complexQuery });
    
    return result.content
      .split('\\n')
      .filter(line => /^\\d+\\./.test(line))
      .map(line => line.replace(/^\\d+\\.\\s*/, ''));
  }
}

// Query expansion with semantic understanding
class SemanticQueryExpander {
  private embeddings: OpenAIEmbeddings;
  private synonymCache: Map<string, string[]> = new Map();
  
  async expandQuery(query: string): Promise<string> {
    // Extract key terms
    const keyTerms = await this.extractKeyTerms(query);
    
    // Find semantic expansions
    const expansions = await Promise.all(
      keyTerms.map(term => this.findSemanticExpansions(term))
    );
    
    // Combine original query with expansions
    const expandedTerms = expansions.flat();
    return \`\${query} \${expandedTerms.join(' ')}\`;
  }
  
  private async extractKeyTerms(query: string): Promise<string[]> {
    // Simple implementation - in production use NLP library
    return query
      .split(' ')
      .filter(word => word.length > 3)
      .filter(word => !['what', 'when', 'where', 'which'].includes(word));
  }
  
  private async findSemanticExpansions(term: string): Promise<string[]> {
    if (this.synonymCache.has(term)) {
      return this.synonymCache.get(term)!;
    }
    
    // In production, use WordNet or similar
    const expansions = await this.generateExpansions(term);
    this.synonymCache.set(term, expansions);
    
    return expansions;
  }
}
\`\`\`
      `,
      exercises: []
    },
    {
      id: 'hybrid-search',
      title: 'Hybrid Search Implementation',
      content: `
Combine multiple search strategies for optimal retrieval performance:

### Hybrid Search Architecture

\`\`\`typescript
import { VectorStore } from "@langchain/core/vectorstores";
import { Document } from "@langchain/core/documents";

interface SearchResult {
  document: Document;
  score: number;
  source: 'vector' | 'keyword' | 'hybrid';
}

class HybridSearchEngine {
  private vectorStore: VectorStore;
  private keywordIndex: KeywordSearchIndex;
  private fusionWeights = {
    vector: 0.7,
    keyword: 0.3
  };
  
  constructor(vectorStore: VectorStore) {
    this.vectorStore = vectorStore;
    this.keywordIndex = new KeywordSearchIndex();
  }
  
  async search(
    query: string, 
    k: number = 10,
    filters?: Record<string, any>
  ): Promise<SearchResult[]> {
    // Parallel search execution
    const [vectorResults, keywordResults] = await Promise.all([
      this.vectorSearch(query, k * 2, filters),
      this.keywordSearch(query, k * 2, filters)
    ]);
    
    // Reciprocal Rank Fusion (RRF)
    return this.fuseResults(vectorResults, keywordResults, k);
  }
  
  private async vectorSearch(
    query: string, 
    k: number,
    filters?: Record<string, any>
  ): Promise<SearchResult[]> {
    const results = await this.vectorStore.similaritySearchWithScore(
      query, 
      k,
      filters
    );
    
    return results.map(([doc, score]) => ({
      document: doc,
      score: score,
      source: 'vector' as const
    }));
  }
  
  private fuseResults(
    vectorResults: SearchResult[],
    keywordResults: SearchResult[],
    k: number
  ): Promise<SearchResult[]> {
    const fusedScores = new Map<string, number>();
    const documentMap = new Map<string, Document>();
    
    // RRF scoring
    const rrfK = 60; // RRF parameter
    
    // Score vector results
    vectorResults.forEach((result, idx) => {
      const docId = this.getDocumentId(result.document);
      const rrfScore = 1 / (rrfK + idx + 1);
      fusedScores.set(
        docId, 
        rrfScore * this.fusionWeights.vector
      );
      documentMap.set(docId, result.document);
    });
    
    // Score keyword results
    keywordResults.forEach((result, idx) => {
      const docId = this.getDocumentId(result.document);
      const rrfScore = 1 / (rrfK + idx + 1);
      const currentScore = fusedScores.get(docId) || 0;
      fusedScores.set(
        docId,
        currentScore + (rrfScore * this.fusionWeights.keyword)
      );
      documentMap.set(docId, result.document);
    });
    
    // Sort by fused score and return top k
    return Array.from(fusedScores.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, k)
      .map(([docId, score]) => ({
        document: documentMap.get(docId)!,
        score,
        source: 'hybrid' as const
      }));
  }
}

// Advanced keyword search with BM25
class KeywordSearchIndex {
  private documents: Map<string, Document> = new Map();
  private invertedIndex: Map<string, Set<string>> = new Map();
  private documentLengths: Map<string, number> = new Map();
  private avgDocLength: number = 0;
  
  // BM25 parameters
  private k1 = 1.2;
  private b = 0.75;
  
  async addDocuments(documents: Document[]): Promise<void> {
    for (const doc of documents) {
      const docId = this.generateDocId(doc);
      this.documents.set(docId, doc);
      
      // Tokenize and index
      const tokens = this.tokenize(doc.pageContent);
      this.documentLengths.set(docId, tokens.length);
      
      for (const token of tokens) {
        if (!this.invertedIndex.has(token)) {
          this.invertedIndex.set(token, new Set());
        }
        this.invertedIndex.get(token)!.add(docId);
      }
    }
    
    // Update average document length
    this.updateAvgDocLength();
  }
  
  search(query: string, k: number): SearchResult[] {
    const queryTokens = this.tokenize(query);
    const scores = new Map<string, number>();
    
    for (const token of queryTokens) {
      const docIds = this.invertedIndex.get(token);
      if (!docIds) continue;
      
      const idf = this.calculateIDF(docIds.size);
      
      for (const docId of docIds) {
        const tf = this.calculateTF(token, docId);
        const docLength = this.documentLengths.get(docId)!;
        const normalization = this.k1 * (
          (1 - this.b) + this.b * (docLength / this.avgDocLength)
        );
        
        const bm25Score = idf * (
          (tf * (this.k1 + 1)) / (tf + normalization)
        );
        
        scores.set(docId, (scores.get(docId) || 0) + bm25Score);
      }
    }
    
    // Return top k results
    return Array.from(scores.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, k)
      .map(([docId, score]) => ({
        document: this.documents.get(docId)!,
        score,
        source: 'keyword' as const
      }));
  }
  
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\\s]/g, '')
      .split(/\\s+/)
      .filter(token => token.length > 0);
  }
}
\`\`\`
      `,
      exercises: []
    },
    {
      id: 'cross-encoder-reranking',
      title: 'Re-ranking with Cross-Encoders',
      content: `
Cross-encoders provide superior relevance scoring at the cost of latency. Here's how to implement efficient re-ranking:

### Cross-Encoder Re-ranking System

\`\`\`typescript
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";

class CrossEncoderReranker {
  private model: any; // Cross-encoder model
  private batchSize = 32;
  private cache = new Map<string, number>();
  
  constructor(modelName: string = "cross-encoder/ms-marco-MiniLM-L-6-v2") {
    // In production, load actual cross-encoder model
    this.initializeModel(modelName);
  }
  
  async rerank(
    query: string,
    documents: Document[],
    topK?: number
  ): Promise<Array<{ document: Document; score: number }>> {
    // Create query-document pairs
    const pairs = documents.map(doc => ({
      query,
      text: doc.pageContent,
      document: doc
    }));
    
    // Score in batches for efficiency
    const scores = await this.scoreBatches(pairs);
    
    // Sort by score and return top K
    const results = documents
      .map((doc, idx) => ({
        document: doc,
        score: scores[idx]
      }))
      .sort((a, b) => b.score - a.score);
    
    return topK ? results.slice(0, topK) : results;
  }
  
  private async scoreBatches(
    pairs: Array<{ query: string; text: string; document: Document }>
  ): Promise<number[]> {
    const scores: number[] = [];
    
    for (let i = 0; i < pairs.length; i += this.batchSize) {
      const batch = pairs.slice(i, i + this.batchSize);
      const batchScores = await this.scoreBatch(batch);
      scores.push(...batchScores);
    }
    
    return scores;
  }
  
  private async scoreBatch(
    batch: Array<{ query: string; text: string }>
  ): Promise<number[]> {
    // Check cache first
    const scores = batch.map(pair => {
      const cacheKey = \`\${pair.query}::\${pair.text.substring(0, 100)}\`;
      return this.cache.get(cacheKey);
    });
    
    // Score uncached pairs
    const uncachedIndices: number[] = [];
    const uncachedPairs: Array<{ query: string; text: string }> = [];
    
    scores.forEach((score, idx) => {
      if (score === undefined) {
        uncachedIndices.push(idx);
        uncachedPairs.push(batch[idx]);
      }
    });
    
    if (uncachedPairs.length > 0) {
      // In production, use actual model inference
      const newScores = await this.modelInference(uncachedPairs);
      
      // Update cache and results
      uncachedIndices.forEach((idx, i) => {
        const pair = batch[idx];
        const score = newScores[i];
        const cacheKey = \`\${pair.query}::\${pair.text.substring(0, 100)}\`;
        
        this.cache.set(cacheKey, score);
        scores[idx] = score;
      });
    }
    
    return scores as number[];
  }
  
  private async modelInference(
    pairs: Array<{ query: string; text: string }>
  ): Promise<number[]> {
    // Simulate cross-encoder scoring
    // In production, use actual transformer model
    return pairs.map(pair => {
      // Simple relevance heuristic for demo
      const queryTerms = new Set(pair.query.toLowerCase().split(' '));
      const textTerms = pair.text.toLowerCase().split(' ');
      let matchCount = 0;
      
      for (const term of textTerms) {
        if (queryTerms.has(term)) matchCount++;
      }
      
      return matchCount / queryTerms.size;
    });
  }
}

// Optimized two-stage retrieval pipeline
class TwoStageRetriever {
  private hybridSearch: HybridSearchEngine;
  private crossEncoder: CrossEncoderReranker;
  private initialK = 50; // Retrieve more initially
  private finalK = 10;   // Return fewer after re-ranking
  
  async retrieve(
    query: string,
    filters?: Record<string, any>
  ): Promise<Document[]> {
    // Stage 1: Fast hybrid retrieval
    console.time('Stage 1: Hybrid Search');
    const candidates = await this.hybridSearch.search(
      query,
      this.initialK,
      filters
    );
    console.timeEnd('Stage 1: Hybrid Search');
    
    // Stage 2: Precise cross-encoder re-ranking
    console.time('Stage 2: Cross-Encoder Re-ranking');
    const reranked = await this.crossEncoder.rerank(
      query,
      candidates.map(r => r.document),
      this.finalK
    );
    console.timeEnd('Stage 2: Cross-Encoder Re-ranking');
    
    return reranked.map(r => r.document);
  }
}
\`\`\`
      `,
      exercises: []
    },
    {
      id: 'dutch-legal-example',
      title: 'Dutch Legal Document Optimization',
      content: `
Let's apply these optimization techniques to Dutch legal document retrieval:

### Specialized Legal Document Retriever

\`\`\`typescript
class DutchLegalRetriever {
  private retriever: TwoStageRetriever;
  private legalTermExpander: LegalTermExpander;
  
  constructor() {
    this.legalTermExpander = new LegalTermExpander();
    this.setupOptimizedRetriever();
  }
  
  async searchLegalDocuments(
    query: string,
    documentType?: 'wet' | 'jurisprudentie' | 'kamerstuk'
  ): Promise<Document[]> {
    // Expand legal terminology
    const expandedQuery = await this.legalTermExpander.expand(query);
    
    // Apply document type filter
    const filters = documentType ? { type: documentType } : undefined;
    
    // Use optimized retrieval pipeline
    return this.retriever.retrieve(expandedQuery, filters);
  }
}

class LegalTermExpander {
  private legalSynonyms = new Map([
    ['overeenkomst', ['contract', 'akkoord', 'afspraak']],
    ['aansprakelijkheid', ['verantwoordelijkheid', 'schuld']],
    ['rechtspersoon', ['vennootschap', 'onderneming', 'bedrijf']],
    ['onrechtmatige daad', ['delict', 'schade', 'fout']]
  ]);
  
  async expand(query: string): Promise<string> {
    let expanded = query;
    
    for (const [term, synonyms] of this.legalSynonyms) {
      if (query.toLowerCase().includes(term)) {
        expanded += ' ' + synonyms.join(' ');
      }
    }
    
    return expanded;
  }
}

// Performance monitoring
class RetrievalPerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  
  async measureRetrieval<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    this.metrics.get(operation)!.push(duration);
    
    return result;
  }
  
  getPerformanceReport(): Record<string, any> {
    const report: Record<string, any> = {};
    
    for (const [operation, durations] of this.metrics) {
      report[operation] = {
        avg: durations.reduce((a, b) => a + b, 0) / durations.length,
        min: Math.min(...durations),
        max: Math.max(...durations),
        p95: this.percentile(durations, 0.95)
      };
    }
    
    return report;
  }
  
  private percentile(arr: number[], p: number): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.ceil(sorted.length * p) - 1;
    return sorted[idx];
  }
}

// Usage example
const legalRetriever = new DutchLegalRetriever();
const monitor = new RetrievalPerformanceMonitor();

const results = await monitor.measureRetrieval(
  'legal_search',
  () => legalRetriever.searchLegalDocuments(
    "aansprakelijkheid bij contractbreuk",
    'jurisprudentie'
  )
);

console.log('Performance Report:', monitor.getPerformanceReport());
\`\`\`
      `,
      exercises: [
        {
          id: 'exercise-1',
          title: 'Implement Query Caching',
          description: 'Add a caching layer to the hybrid search system that caches frequently used queries',
          difficulty: 'medium',
          solution: `
class CachedHybridSearch extends HybridSearchEngine {
  private queryCache = new LRUCache<string, SearchResult[]>(1000);
  private cacheTTL = 3600000; // 1 hour
  
  async search(query: string, k: number): Promise<SearchResult[]> {
    const cacheKey = \`\${query}::\${k}\`;
    const cached = this.queryCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.results;
    }
    
    const results = await super.search(query, k);
    this.queryCache.set(cacheKey, { results, timestamp: Date.now() });
    
    return results;
  }
}
          `
        },
        {
          id: 'exercise-2',
          title: 'Optimize Cross-Encoder Batching',
          description: 'Implement dynamic batch sizing based on document length',
          difficulty: 'hard',
          solution: `
class DynamicBatchCrossEncoder extends CrossEncoderReranker {
  private calculateOptimalBatchSize(documents: Document[]): number {
    const avgLength = documents.reduce(
      (sum, doc) => sum + doc.pageContent.length, 0
    ) / documents.length;
    
    // Smaller batches for longer documents
    if (avgLength > 1000) return 8;
    if (avgLength > 500) return 16;
    return 32;
  }
  
  async rerank(query: string, documents: Document[]): Promise<any[]> {
    this.batchSize = this.calculateOptimalBatchSize(documents);
    return super.rerank(query, documents);
  }
}
          `
        }
      ]
    }
  ]
};