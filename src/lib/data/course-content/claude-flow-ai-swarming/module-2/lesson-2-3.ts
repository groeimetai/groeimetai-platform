import type { Lesson } from '@/lib/data/courses';

export const lesson23: Lesson = {
  id: 'lesson-2-3',
  title: 'Memory en context sharing',
  duration: '35 min',
  content: `
# Memory en Context Sharing

Een van de krachtigste features van Claude Flow is het geavanceerde memory systeem dat agents in staat stelt om kennis te delen, context te behouden, en gezamenlijk te leren. In deze les duiken we diep in de architectuur en implementatie van memory management binnen AI swarms.

## 1. Shared Memory Architecture

### Conceptueel overzicht
Het Claude Flow memory systeem is gebaseerd op een gedistribueerde architectuur die zowel lokale als globale geheugenopslag ondersteunt.

\`\`\`typescript
// Memory architectuur componenten
interface MemoryArchitecture {
  // Lokale agent memory
  localMemory: {
    shortTerm: Map<string, any>      // Volatile, task-specific
    workingMemory: LRUCache<string>  // Recent context
    episodic: IndexedDB              // Agent ervaringen
  }
  
  // Shared swarm memory
  sharedMemory: {
    semantic: VectorDatabase         // Conceptuele kennis
    procedural: SkillRegistry        // Geleerde procedures
    declarative: KnowledgeGraph      // Feiten en relaties
  }
  
  // Persistent storage
  persistentMemory: {
    sessions: SQLiteDB               // Sessie geschiedenis
    artifacts: ObjectStorage         // Generated content
    metrics: TimeSeriesDB           // Performance data
  }
}
\`\`\`

### Memory Hierarchie
Claude Flow implementeert een hiërarchische memory structuur voor optimale performance:

1. **L1 Cache** (Agent-level): Ultra-snelle toegang tot recente data
2. **L2 Cache** (Swarm-level): Gedeelde context tussen agents
3. **L3 Storage** (Persistent): Lange-termijn kennis opslag

\`\`\`bash
# Configureer memory hierarchie
./claude-flow config set memory.hierarchy.l1.size "100MB"
./claude-flow config set memory.hierarchy.l2.size "1GB"
./claude-flow config set memory.hierarchy.l3.type "sqlite"
\`\`\`

### Memory Access Patterns

\`\`\`typescript
// Efficient memory access patterns
class MemoryManager {
  // Write-through pattern voor kritieke data
  async writeThrough(key: string, value: any): Promise<void> {
    // Schrijf naar alle layers tegelijk
    await Promise.all([
      this.l1Cache.set(key, value),
      this.l2Cache.set(key, value),
      this.l3Storage.persist(key, value)
    ])
  }
  
  // Read-through pattern met fallback
  async readThrough(key: string): Promise<any> {
    // Check L1 first
    let value = await this.l1Cache.get(key)
    if (value) return value
    
    // Check L2
    value = await this.l2Cache.get(key)
    if (value) {
      await this.l1Cache.set(key, value) // Promote to L1
      return value
    }
    
    // Load from L3
    value = await this.l3Storage.load(key)
    if (value) {
      await this.promoteToCache(key, value)
      return value
    }
    
    return null
  }
}
\`\`\`

## 2. Context Propagation

Context propagation zorgt ervoor dat relevante informatie efficiënt wordt gedeeld tussen agents zonder onnodige overhead.

### Context Types
\`\`\`typescript
// Verschillende context types in Claude Flow
enum ContextType {
  TASK_CONTEXT = 'task',        // Taak-specifieke informatie
  USER_CONTEXT = 'user',        // Gebruikers voorkeuren/historie
  DOMAIN_CONTEXT = 'domain',    // Domein kennis
  TEMPORAL_CONTEXT = 'temporal', // Tijd-gerelateerde context
  SPATIAL_CONTEXT = 'spatial'    // Locatie/structuur context
}

interface ContextFrame {
  type: ContextType
  scope: 'local' | 'shared' | 'global'
  priority: number
  ttl?: number // Time to live in seconds
  data: any
  metadata: {
    created: Date
    lastAccessed: Date
    accessCount: number
    agentIds: string[]
  }
}
\`\`\`

### Context Propagation Strategies

\`\`\`typescript
// Context propagation implementatie
class ContextPropagator {
  private contexts: Map<string, ContextFrame> = new Map()
  private subscriptions: Map<string, Set<string>> = new Map()
  
  // Broadcast context updates
  async propagateContext(
    contextId: string, 
    targetAgents?: string[]
  ): Promise<void> {
    const context = this.contexts.get(contextId)
    if (!context) return
    
    // Determine target agents
    const targets = targetAgents || this.getSubscribedAgents(contextId)
    
    // Propagate based on priority
    if (context.priority > 0.8) {
      // High priority: direct push
      await this.pushToAgents(context, targets)
    } else if (context.priority > 0.5) {
      // Medium priority: lazy propagation
      await this.queueForPropagation(context, targets)
    } else {
      // Low priority: pull on demand
      await this.markAvailable(contextId, targets)
    }
  }
  
  // Smart context filtering
  async filterRelevantContext(
    agentId: string,
    taskType: string
  ): Promise<ContextFrame[]> {
    const agentProfile = await this.getAgentProfile(agentId)
    const taskRequirements = await this.analyzeTaskRequirements(taskType)
    
    return Array.from(this.contexts.values())
      .filter(context => {
        // Relevance scoring
        const relevanceScore = this.calculateRelevance(
          context,
          agentProfile,
          taskRequirements
        )
        return relevanceScore > 0.6
      })
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 10) // Top 10 most relevant contexts
  }
}
\`\`\`

### Praktisch voorbeeld: Context sharing in development swarm

\`\`\`bash
# Start development swarm met context sharing
./claude-flow swarm "Build e-commerce platform" \\
  --strategy development \\
  --mode hierarchical \\
  --context-sharing enabled \\
  --context-ttl 3600

# Sla architectuur decisions op als shared context
./claude-flow memory store "architecture_context" '{
  "type": "domain",
  "scope": "shared",
  "data": {
    "pattern": "microservices",
    "database": "PostgreSQL",
    "frontend": "React",
    "api": "GraphQL"
  }
}'

# Agents kunnen nu deze context gebruiken
./claude-flow sparc run coder "Implement user service using architecture_context"
\`\`\`

## 3. Knowledge Graphs

Knowledge graphs stellen Claude Flow in staat om complexe relaties tussen concepten te begrijpen en te navigeren.

### Graph Structure
\`\`\`typescript
// Knowledge graph implementatie
interface KnowledgeNode {
  id: string
  type: 'concept' | 'entity' | 'relation' | 'attribute'
  value: any
  embedding?: number[] // Vector representation
  metadata: {
    confidence: number
    source: string
    timestamp: Date
  }
}

interface KnowledgeEdge {
  from: string
  to: string
  relation: string
  weight: number
  bidirectional: boolean
}

class KnowledgeGraph {
  private nodes: Map<string, KnowledgeNode> = new Map()
  private edges: Map<string, KnowledgeEdge[]> = new Map()
  private embeddings: VectorIndex
  
  // Add knowledge with automatic relation extraction
  async addKnowledge(
    content: string,
    source: string
  ): Promise<void> {
    // Extract entities and relations
    const extracted = await this.extractKnowledge(content)
    
    // Create nodes
    for (const entity of extracted.entities) {
      const node: KnowledgeNode = {
        id: this.generateId(entity),
        type: 'entity',
        value: entity,
        embedding: await this.generateEmbedding(entity),
        metadata: {
          confidence: 0.9,
          source,
          timestamp: new Date()
        }
      }
      this.nodes.set(node.id, node)
    }
    
    // Create edges
    for (const relation of extracted.relations) {
      const edge: KnowledgeEdge = {
        from: this.generateId(relation.subject),
        to: this.generateId(relation.object),
        relation: relation.predicate,
        weight: relation.confidence,
        bidirectional: relation.bidirectional || false
      }
      this.addEdge(edge)
    }
    
    // Update embeddings index
    await this.updateEmbeddingsIndex()
  }
  
  // Query knowledge graph
  async query(
    query: string,
    maxHops: number = 3
  ): Promise<QueryResult> {
    // Convert query to embedding
    const queryEmbedding = await this.generateEmbedding(query)
    
    // Find relevant starting nodes
    const startNodes = await this.findSimilarNodes(queryEmbedding, 5)
    
    // Traverse graph
    const subgraph = await this.traverseGraph(
      startNodes,
      maxHops,
      queryEmbedding
    )
    
    return {
      nodes: subgraph.nodes,
      edges: subgraph.edges,
      confidence: this.calculateConfidence(subgraph, queryEmbedding)
    }
  }
}
\`\`\`

### Semantic Search in Knowledge Graph

\`\`\`typescript
// Semantic search capabilities
class SemanticSearch {
  constructor(private knowledgeGraph: KnowledgeGraph) {}
  
  async semanticQuery(query: string): Promise<SearchResult[]> {
    // Multi-modal search
    const results = await Promise.all([
      this.embeddingSearch(query),      // Vector similarity
      this.graphTraversal(query),       // Graph relationships
      this.patternMatching(query)       // Structural patterns
    ])
    
    // Merge and rank results
    return this.rankResults(
      this.mergeResults(results),
      query
    )
  }
  
  private async embeddingSearch(
    query: string
  ): Promise<SearchResult[]> {
    const embedding = await this.generateEmbedding(query)
    const similar = await this.knowledgeGraph.findSimilar(
      embedding,
      topK: 20
    )
    
    return similar.map(node => ({
      node,
      score: node.similarity,
      type: 'embedding',
      path: [node.id]
    }))
  }
}
\`\`\`

## 4. Session Persistence

Session persistence zorgt ervoor dat swarm state behouden blijft over meerdere uitvoeringen.

### Session Management
\`\`\`typescript
// Session persistence framework
interface SwarmSession {
  id: string
  startTime: Date
  endTime?: Date
  state: 'active' | 'paused' | 'completed' | 'failed'
  agents: AgentSession[]
  memory: SessionMemory
  checkpoints: Checkpoint[]
}

class SessionManager {
  private activeSessions: Map<string, SwarmSession> = new Map()
  private storage: PersistentStorage
  
  // Create new session with auto-save
  async createSession(
    swarmConfig: SwarmConfig
  ): Promise<SwarmSession> {
    const session: SwarmSession = {
      id: generateSessionId(),
      startTime: new Date(),
      state: 'active',
      agents: [],
      memory: new SessionMemory(),
      checkpoints: []
    }
    
    // Setup auto-save
    const autoSaveInterval = setInterval(
      () => this.saveSession(session),
      30000 // Every 30 seconds
    )
    
    session.autoSaveInterval = autoSaveInterval
    this.activeSessions.set(session.id, session)
    
    return session
  }
  
  // Resume from checkpoint
  async resumeSession(
    sessionId: string,
    checkpointId?: string
  ): Promise<SwarmSession> {
    // Load session from storage
    const savedSession = await this.storage.loadSession(sessionId)
    if (!savedSession) {
      throw new Error(\`Session \${sessionId} not found\`)
    }
    
    // Restore to checkpoint if specified
    if (checkpointId) {
      const checkpoint = savedSession.checkpoints.find(
        cp => cp.id === checkpointId
      )
      if (checkpoint) {
        await this.restoreFromCheckpoint(savedSession, checkpoint)
      }
    }
    
    // Restore agent states
    for (const agentSession of savedSession.agents) {
      await this.restoreAgent(agentSession)
    }
    
    // Restore memory
    await this.restoreMemory(savedSession.memory)
    
    savedSession.state = 'active'
    this.activeSessions.set(sessionId, savedSession)
    
    return savedSession
  }
  
  // Create checkpoint
  async createCheckpoint(
    sessionId: string,
    name?: string
  ): Promise<Checkpoint> {
    const session = this.activeSessions.get(sessionId)
    if (!session) {
      throw new Error(\`Active session \${sessionId} not found\`)
    }
    
    const checkpoint: Checkpoint = {
      id: generateCheckpointId(),
      sessionId,
      name: name || \`Checkpoint \${session.checkpoints.length + 1}\`,
      timestamp: new Date(),
      state: await this.captureState(session),
      memory: await this.captureMemory(session),
      agents: await this.captureAgents(session)
    }
    
    session.checkpoints.push(checkpoint)
    await this.saveCheckpoint(checkpoint)
    
    return checkpoint
  }
}
\`\`\`

### Praktisch gebruik van sessions

\`\`\`bash
# Start een nieuwe sessie
SESSION_ID=$(./claude-flow session create --name "product-development")

# Start swarm met session persistence
./claude-flow swarm "Develop SaaS platform" \\
  --session $SESSION_ID \\
  --checkpoint-interval 300 \\
  --auto-resume

# Creëer manual checkpoint
./claude-flow session checkpoint $SESSION_ID --name "After research phase"

# List sessions
./claude-flow session list

# Resume session
./claude-flow session resume $SESSION_ID

# Resume from specific checkpoint
./claude-flow session resume $SESSION_ID --checkpoint "After research phase"
\`\`\`

## 5. Memory Optimization

Effectief memory management is cruciaal voor performance, vooral bij grote swarms.

### Memory Optimization Strategies

\`\`\`typescript
// Memory optimization implementatie
class MemoryOptimizer {
  private memoryPool: MemoryPool
  private gcScheduler: GarbageCollectionScheduler
  
  // Adaptive memory allocation
  async optimizeMemoryAllocation(
    swarmSize: number,
    taskComplexity: number
  ): Promise<MemoryConfig> {
    const baseMemory = 100 // MB per agent
    const complexityMultiplier = 1 + (taskComplexity * 0.5)
    const sharedMemoryRatio = 0.3
    
    const totalMemory = swarmSize * baseMemory * complexityMultiplier
    
    return {
      perAgentMemory: baseMemory * complexityMultiplier,
      sharedMemory: totalMemory * sharedMemoryRatio,
      cacheSize: Math.min(totalMemory * 0.2, 500), // Max 500MB cache
      compressionEnabled: totalMemory > 1000,
      swapEnabled: totalMemory > 2000
    }
  }
  
  // Memory compression for large datasets
  async compressMemory(
    data: any,
    compressionLevel: number = 6
  ): Promise<CompressedData> {
    const serialized = JSON.stringify(data)
    const compressed = await zlib.compress(serialized, compressionLevel)
    
    return {
      compressed,
      originalSize: serialized.length,
      compressedSize: compressed.length,
      compressionRatio: compressed.length / serialized.length
    }
  }
  
  // Intelligent garbage collection
  async runGarbageCollection(): Promise<GCReport> {
    const startMemory = process.memoryUsage()
    
    // Identify unused memory
    const unusedKeys = await this.identifyUnusedMemory()
    
    // Clean up in batches
    const batchSize = 100
    let cleaned = 0
    
    for (let i = 0; i < unusedKeys.length; i += batchSize) {
      const batch = unusedKeys.slice(i, i + batchSize)
      await this.cleanupBatch(batch)
      cleaned += batch.length
      
      // Yield to prevent blocking
      await new Promise(resolve => setImmediate(resolve))
    }
    
    const endMemory = process.memoryUsage()
    
    return {
      itemsCleaned: cleaned,
      memoryFreed: startMemory.heapUsed - endMemory.heapUsed,
      duration: Date.now() - startTime,
      nextScheduled: this.gcScheduler.getNextRun()
    }
  }
  
  // Memory usage monitoring
  async monitorMemoryUsage(): Promise<MemoryMetrics> {
    const usage = process.memoryUsage()
    const systemMemory = await this.getSystemMemory()
    
    return {
      heap: {
        used: usage.heapUsed,
        total: usage.heapTotal,
        percentage: (usage.heapUsed / usage.heapTotal) * 100
      },
      system: {
        used: systemMemory.used,
        total: systemMemory.total,
        available: systemMemory.available
      },
      recommendations: this.generateRecommendations(usage, systemMemory)
    }
  }
}
\`\`\`

### Memory Pooling voor Efficiency

\`\`\`typescript
// Memory pool implementation
class MemoryPool {
  private pools: Map<string, ObjectPool> = new Map()
  
  // Get or create pool for specific type
  getPool<T>(type: string, factory: () => T): ObjectPool<T> {
    if (!this.pools.has(type)) {
      this.pools.set(type, new ObjectPool(factory, {
        min: 10,
        max: 100,
        idleTimeout: 60000 // 1 minute
      }))
    }
    return this.pools.get(type) as ObjectPool<T>
  }
  
  // Reuse objects from pool
  async acquire<T>(type: string): Promise<T> {
    const pool = this.getPool(type, this.getFactory(type))
    return pool.acquire()
  }
  
  // Return objects to pool
  async release<T>(type: string, obj: T): Promise<void> {
    const pool = this.pools.get(type)
    if (pool) {
      await pool.release(obj)
    }
  }
}
\`\`\`

### Praktische Memory Management

\`\`\`bash
# Monitor memory usage
./claude-flow monitor memory --interval 5s

# Optimize memory voor grote swarm
./claude-flow config optimize-memory --swarm-size 50 --task-complexity high

# Enable memory compression
./claude-flow config set memory.compression.enabled true
./claude-flow config set memory.compression.threshold "10MB"

# Configure garbage collection
./claude-flow config set memory.gc.interval "5m"
./claude-flow config set memory.gc.aggressive false

# Export memory snapshot
./claude-flow memory snapshot --output memory-dump.json

# Analyze memory usage
./claude-flow memory analyze memory-dump.json
\`\`\`

## Best Practices voor Memory Management

### 1. Memory Hierarchie Design
- Gebruik hot/warm/cold tiers voor data
- Implementeer LRU caching voor frequent gebruikte data
- Sla alleen essentiële data persistent op

### 2. Context Scoping
- Limiteer context grootte per agent
- Gebruik TTL voor tijdelijke context
- Implementeer context inheritance voor sub-tasks

### 3. Knowledge Graph Maintenance
- Regelmatige graph pruning
- Embedding updates bij nieuwe kennis
- Relationship strength decay over time

### 4. Session Management
- Automatische checkpoints bij milestones
- Compress oude sessions
- Implementeer session expiry policies

### 5. Performance Monitoring
- Track memory metrics per agent
- Monitor cache hit rates
- Alert bij memory pressure

## Praktijkoefening: Bouw een Memory-Intensive Swarm

\`\`\`bash
#!/bin/bash
# Memory-intensive research swarm met optimization

# Setup memory configuration
./claude-flow config set memory.hierarchy.l1.size "500MB"
./claude-flow config set memory.hierarchy.l2.size "2GB"
./claude-flow config set memory.compression.enabled true

# Create session
SESSION_ID=$(./claude-flow session create --name "deep-research")

# Start research swarm met knowledge graph
./claude-flow swarm "Deep research on quantum computing applications" \\
  --session $SESSION_ID \\
  --strategy research \\
  --mode distributed \\
  --max-agents 20 \\
  --memory-mode "knowledge-graph" \\
  --context-sharing "aggressive" \\
  --checkpoint-interval 300 \\
  --monitor

# Monitor memory usage
./claude-flow monitor memory --session $SESSION_ID --dashboard

# Query knowledge graph
./claude-flow memory query "quantum entanglement applications" \\
  --graph-depth 3 \\
  --return-context

# Create checkpoint after research phase
./claude-flow session checkpoint $SESSION_ID --name "research-complete"

# Export knowledge graph
./claude-flow memory export-graph --session $SESSION_ID \\
  --format "graphml" \\
  --output "quantum-research-graph.graphml"
\`\`\`

## Samenvatting

Memory en context sharing vormen het hart van effectieve AI swarm coördinatie. Door slim gebruik te maken van:
- Hiërarchische memory architectuur
- Intelligente context propagation
- Knowledge graphs voor relatie management
- Session persistence voor continuïteit
- Memory optimization voor schaalbaarheid

...kunnen Claude Flow swarms complexe taken aanpakken met behoud van context en efficiënt resource gebruik. De combinatie van deze technieken stelt swarms in staat om te leren, te onthouden, en voort te bouwen op eerdere ervaringen.
  `,
  codeExamples: [
    {
      id: 'code-2-3-1',
      title: 'Complete Memory Management Setup',
      code: `#!/bin/bash
# Complete memory management setup voor production swarm

# 1. Configure memory hierarchy
echo "=== Configuring Memory Hierarchy ==="
./claude-flow config set memory.hierarchy.l1.size "256MB"
./claude-flow config set memory.hierarchy.l1.ttl "300"
./claude-flow config set memory.hierarchy.l2.size "2GB"
./claude-flow config set memory.hierarchy.l2.ttl "3600"
./claude-flow config set memory.hierarchy.l3.type "sqlite"
./claude-flow config set memory.hierarchy.l3.path "./swarm-memory.db"

# 2. Enable advanced features
echo "=== Enabling Advanced Features ==="
./claude-flow config set memory.compression.enabled true
./claude-flow config set memory.compression.algorithm "zstd"
./claude-flow config set memory.compression.level 3
./claude-flow config set memory.deduplication.enabled true
./claude-flow config set memory.encryption.enabled true
./claude-flow config set memory.encryption.algorithm "aes-256-gcm"

# 3. Setup knowledge graph
echo "=== Initializing Knowledge Graph ==="
./claude-flow memory init-graph \\
  --type "semantic" \\
  --embedding-model "text-embedding-ada-002" \\
  --vector-dimensions 1536 \\
  --index-type "hnsw"

# 4. Configure context propagation
echo "=== Setting up Context Propagation ==="
./claude-flow config set context.propagation.strategy "adaptive"
./claude-flow config set context.propagation.priority-threshold 0.6
./claude-flow config set context.propagation.max-hops 3
./claude-flow config set context.retention.default-ttl 3600

# 5. Import existing knowledge base
if [ -f "knowledge-base.json" ]; then
  echo "=== Importing Knowledge Base ==="
  ./claude-flow memory import knowledge-base.json \\
    --type "declarative" \\
    --deduplicate \\
    --validate
fi

# 6. Start memory monitoring
echo "=== Starting Memory Monitor ==="
./claude-flow monitor memory \\
  --metrics "usage,cache-hits,gc-stats" \\
  --interval 30s \\
  --alert-threshold 80 \\
  --dashboard-port 3001 &

echo "Memory management setup complete!"`,
      language: 'bash'
    },
    {
      id: 'code-2-3-2',
      title: 'Knowledge Graph Implementation',
      code: `// knowledge-graph.ts
// Advanced knowledge graph implementation for Claude Flow

import { VectorDatabase } from '@claude-flow/vector-db';
import { GraphDatabase } from '@claude-flow/graph-db';

interface KnowledgeNode {
  id: string;
  type: 'concept' | 'entity' | 'fact' | 'skill';
  content: any;
  embedding: number[];
  metadata: {
    source: string;
    confidence: number;
    created: Date;
    lastAccessed: Date;
    accessCount: number;
    relationships: number;
  };
}

interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  type: RelationType;
  weight: number;
  metadata: {
    evidence: string[];
    confidence: number;
    bidirectional: boolean;
  };
}

enum RelationType {
  IS_A = 'is_a',
  PART_OF = 'part_of',
  RELATES_TO = 'relates_to',
  CAUSES = 'causes',
  USED_FOR = 'used_for',
  SIMILAR_TO = 'similar_to',
  OPPOSITE_OF = 'opposite_of',
  DEPENDS_ON = 'depends_on'
}

export class KnowledgeGraph {
  private vectorDB: VectorDatabase;
  private graphDB: GraphDatabase;
  private embeddingCache: Map<string, number[]>;
  
  constructor(config: KnowledgeGraphConfig) {
    this.vectorDB = new VectorDatabase(config.vectorDB);
    this.graphDB = new GraphDatabase(config.graphDB);
    this.embeddingCache = new Map();
  }
  
  async addKnowledge(input: {
    content: string;
    type: KnowledgeNode['type'];
    source: string;
    extractRelations?: boolean;
  }): Promise<KnowledgeNode> {
    // Generate embedding
    const embedding = await this.generateEmbedding(input.content);
    
    // Create node
    const node: KnowledgeNode = {
      id: this.generateNodeId(input.content),
      type: input.type,
      content: input.content,
      embedding,
      metadata: {
        source: input.source,
        confidence: 1.0,
        created: new Date(),
        lastAccessed: new Date(),
        accessCount: 0,
        relationships: 0
      }
    };
    
    // Store in vector DB for similarity search
    await this.vectorDB.insert({
      id: node.id,
      vector: embedding,
      metadata: node
    });
    
    // Store in graph DB
    await this.graphDB.createNode(node);
    
    // Extract and create relationships
    if (input.extractRelations) {
      await this.extractAndCreateRelations(node);
    }
    
    return node;
  }
  
  async query(input: {
    query: string;
    type?: 'semantic' | 'structural' | 'hybrid';
    maxDepth?: number;
    minConfidence?: number;
  }): Promise<QueryResult> {
    const queryType = input.type || 'hybrid';
    const maxDepth = input.maxDepth || 3;
    const minConfidence = input.minConfidence || 0.7;
    
    let results: QueryResult;
    
    switch (queryType) {
      case 'semantic':
        results = await this.semanticQuery(input.query, minConfidence);
        break;
        
      case 'structural':
        results = await this.structuralQuery(input.query, maxDepth);
        break;
        
      case 'hybrid':
        results = await this.hybridQuery(
          input.query, 
          maxDepth, 
          minConfidence
        );
        break;
    }
    
    // Update access metadata
    await this.updateAccessMetadata(results.nodes);
    
    return results;
  }
  
  private async semanticQuery(
    query: string,
    minConfidence: number
  ): Promise<QueryResult> {
    const queryEmbedding = await this.generateEmbedding(query);
    
    // Find similar nodes
    const similarNodes = await this.vectorDB.search({
      vector: queryEmbedding,
      topK: 20,
      minScore: minConfidence
    });
    
    // Load full nodes
    const nodes = await Promise.all(
      similarNodes.map(result => 
        this.graphDB.getNode(result.id)
      )
    );
    
    // Get relationships between found nodes
    const edges = await this.graphDB.getEdgesBetweenNodes(
      nodes.map(n => n.id)
    );
    
    return {
      nodes,
      edges,
      confidence: this.calculateAverageConfidence(similarNodes)
    };
  }
  
  private async structuralQuery(
    query: string,
    maxDepth: number
  ): Promise<QueryResult> {
    // Parse query for structural patterns
    const pattern = this.parseStructuralQuery(query);
    
    // Find matching subgraphs
    const subgraphs = await this.graphDB.findPattern({
      pattern,
      maxDepth,
      limit: 10
    });
    
    // Merge subgraphs
    const merged = this.mergeSubgraphs(subgraphs);
    
    return {
      nodes: merged.nodes,
      edges: merged.edges,
      confidence: 0.9 // High confidence for exact matches
    };
  }
  
  private async hybridQuery(
    query: string,
    maxDepth: number,
    minConfidence: number
  ): Promise<QueryResult> {
    // Run both queries in parallel
    const [semantic, structural] = await Promise.all([
      this.semanticQuery(query, minConfidence),
      this.structuralQuery(query, maxDepth)
    ]);
    
    // Merge results with weighted scoring
    const merged = this.mergeQueryResults(
      semantic,
      structural,
      { semanticWeight: 0.6, structuralWeight: 0.4 }
    );
    
    return merged;
  }
  
  async propagateContext(
    nodeId: string,
    agentIds: string[],
    options?: {
      maxHops?: number;
      decayFactor?: number;
      includeTypes?: RelationType[];
    }
  ): Promise<PropagationResult> {
    const maxHops = options?.maxHops || 2;
    const decayFactor = options?.decayFactor || 0.8;
    const includeTypes = options?.includeTypes || Object.values(RelationType);
    
    // Get subgraph around node
    const subgraph = await this.graphDB.getSubgraph({
      centerNode: nodeId,
      maxDepth: maxHops,
      relationTypes: includeTypes
    });
    
    // Calculate relevance scores with decay
    const relevanceScores = this.calculateRelevanceWithDecay(
      subgraph,
      nodeId,
      decayFactor
    );
    
    // Create context package
    const contextPackage = {
      primaryNode: await this.graphDB.getNode(nodeId),
      relatedNodes: subgraph.nodes.filter(n => n.id !== nodeId),
      edges: subgraph.edges,
      relevanceScores,
      timestamp: new Date()
    };
    
    // Send to agents
    await this.sendContextToAgents(contextPackage, agentIds);
    
    return {
      nodesShared: subgraph.nodes.length,
      agents: agentIds.length,
      averageRelevance: this.calculateAverageRelevance(relevanceScores)
    };
  }
  
  async optimizeGraph(): Promise<OptimizationResult> {
    const startTime = Date.now();
    
    // Remove weak edges
    const weakEdges = await this.graphDB.findEdges({
      weightLessThan: 0.1
    });
    await this.graphDB.removeEdges(weakEdges.map(e => e.id));
    
    // Merge similar nodes
    const duplicates = await this.findDuplicateNodes();
    const merged = await this.mergeNodes(duplicates);
    
    // Recompute embeddings for changed nodes
    const updatedNodes = await this.updateEmbeddings(merged);
    
    // Rebuild indexes
    await Promise.all([
      this.vectorDB.rebuildIndex(),
      this.graphDB.rebuildIndexes()
    ]);
    
    return {
      duration: Date.now() - startTime,
      edgesRemoved: weakEdges.length,
      nodesMerged: merged.length,
      embeddingsUpdated: updatedNodes.length
    };
  }
  
  private async generateEmbedding(text: string): Promise<number[]> {
    // Check cache first
    if (this.embeddingCache.has(text)) {
      return this.embeddingCache.get(text)!;
    }
    
    // Generate new embedding
    const embedding = await this.embeddingModel.embed(text);
    
    // Cache with LRU eviction
    if (this.embeddingCache.size > 10000) {
      const firstKey = this.embeddingCache.keys().next().value;
      this.embeddingCache.delete(firstKey);
    }
    this.embeddingCache.set(text, embedding);
    
    return embedding;
  }
}

// Usage example
const knowledgeGraph = new KnowledgeGraph({
  vectorDB: {
    provider: 'pinecone',
    index: 'claude-flow-knowledge',
    dimension: 1536
  },
  graphDB: {
    provider: 'neo4j',
    uri: 'bolt://localhost:7687',
    auth: { user: 'neo4j', password: 'password' }
  }
});

// Add knowledge
await knowledgeGraph.addKnowledge({
  content: 'React is a JavaScript library for building user interfaces',
  type: 'fact',
  source: 'documentation',
  extractRelations: true
});

// Query knowledge
const results = await knowledgeGraph.query({
  query: 'frontend frameworks similar to React',
  type: 'hybrid',
  maxDepth: 3,
  minConfidence: 0.7
});`,
      language: 'typescript'
    },
    {
      id: 'code-2-3-3',
      title: 'Session Persistence Example',
      code: `// session-persistence.ts
// Complete session persistence implementation

import { ClaudeFlow } from '@claude-flow/core';
import { Database } from 'sqlite3';
import { compress, decompress } from 'zstd-wasm';

interface SessionState {
  id: string;
  name: string;
  created: Date;
  lastModified: Date;
  status: 'active' | 'paused' | 'completed';
  swarmConfig: SwarmConfig;
  agentStates: Map<string, AgentState>;
  memorySnapshot: MemorySnapshot;
  checkpoints: Checkpoint[];
  metrics: SessionMetrics;
}

class PersistentSession {
  private db: Database;
  private flow: ClaudeFlow;
  private autoSaveInterval?: NodeJS.Timer;
  
  constructor(dbPath: string = './sessions.db') {
    this.db = new Database(dbPath);
    this.flow = new ClaudeFlow();
    this.initializeDatabase();
  }
  
  async createSession(config: {
    name: string;
    swarmConfig: SwarmConfig;
    autoSave?: boolean;
    autoSaveInterval?: number;
  }): Promise<SessionState> {
    const session: SessionState = {
      id: this.generateSessionId(),
      name: config.name,
      created: new Date(),
      lastModified: new Date(),
      status: 'active',
      swarmConfig: config.swarmConfig,
      agentStates: new Map(),
      memorySnapshot: await this.createMemorySnapshot(),
      checkpoints: [],
      metrics: this.initializeMetrics()
    };
    
    // Save initial state
    await this.saveSession(session);
    
    // Setup auto-save if enabled
    if (config.autoSave) {
      const interval = config.autoSaveInterval || 60000; // Default 1 minute
      this.autoSaveInterval = setInterval(
        () => this.autoSave(session),
        interval
      );
    }
    
    return session;
  }
  
  async saveSession(session: SessionState): Promise<void> {
    const serialized = this.serializeSession(session);
    const compressed = await compress(serialized);
    
    await this.db.run(
      'INSERT OR REPLACE INTO sessions (id, data, compressed_size, original_size) VALUES (?, ?, ?, ?)',
      [session.id, compressed, compressed.length, serialized.length]
    );
    
    // Save checkpoints separately for quick access
    for (const checkpoint of session.checkpoints) {
      await this.saveCheckpoint(session.id, checkpoint);
    }
  }
  
  async loadSession(sessionId: string): Promise<SessionState | null> {
    const row = await this.db.get(
      'SELECT data FROM sessions WHERE id = ?',
      [sessionId]
    );
    
    if (!row) return null;
    
    const decompressed = await decompress(row.data);
    return this.deserializeSession(decompressed);
  }
  
  async resumeSession(
    sessionId: string,
    options?: {
      checkpointId?: string;
      resumeAgents?: boolean;
      restoreMemory?: boolean;
    }
  ): Promise<SessionState> {
    const session = await this.loadSession(sessionId);
    if (!session) {
      throw new Error(\`Session \${sessionId} not found\`);
    }
    
    // Restore to checkpoint if specified
    if (options?.checkpointId) {
      const checkpoint = await this.loadCheckpoint(
        sessionId,
        options.checkpointId
      );
      if (checkpoint) {
        await this.restoreFromCheckpoint(session, checkpoint);
      }
    }
    
    // Resume agents
    if (options?.resumeAgents !== false) {
      await this.resumeAgents(session);
    }
    
    // Restore memory
    if (options?.restoreMemory !== false) {
      await this.restoreMemory(session.memorySnapshot);
    }
    
    session.status = 'active';
    session.lastModified = new Date();
    
    // Restart auto-save if it was enabled
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = setInterval(
        () => this.autoSave(session),
        60000
      );
    }
    
    return session;
  }
  
  async createCheckpoint(
    session: SessionState,
    name?: string
  ): Promise<Checkpoint> {
    const checkpoint: Checkpoint = {
      id: this.generateCheckpointId(),
      sessionId: session.id,
      name: name || \`Checkpoint \${session.checkpoints.length + 1}\`,
      created: new Date(),
      agentStates: await this.captureAgentStates(session),
      memorySnapshot: await this.createMemorySnapshot(),
      metrics: { ...session.metrics }
    };
    
    session.checkpoints.push(checkpoint);
    await this.saveCheckpoint(session.id, checkpoint);
    
    return checkpoint;
  }
  
  private async captureAgentStates(
    session: SessionState
  ): Promise<Map<string, AgentState>> {
    const states = new Map<string, AgentState>();
    
    for (const [agentId, _] of session.agentStates) {
      const agent = await this.flow.getAgent(agentId);
      if (agent) {
        states.set(agentId, await agent.captureState());
      }
    }
    
    return states;
  }
  
  private async createMemorySnapshot(): Promise<MemorySnapshot> {
    const memory = await this.flow.memory.getAll();
    
    return {
      timestamp: new Date(),
      entries: memory.entries,
      indices: memory.indices,
      statistics: {
        totalEntries: memory.entries.size,
        totalSize: this.calculateMemorySize(memory),
        oldestEntry: this.findOldestEntry(memory),
        newestEntry: this.findNewestEntry(memory)
      }
    };
  }
  
  private async resumeAgents(session: SessionState): Promise<void> {
    const resumePromises = [];
    
    for (const [agentId, state] of session.agentStates) {
      resumePromises.push(
        this.flow.agent.spawn(state.type, {
          id: agentId,
          name: state.name,
          state: state,
          resumeFromState: true
        })
      );
    }
    
    await Promise.all(resumePromises);
  }
  
  private async restoreMemory(snapshot: MemorySnapshot): Promise<void> {
    // Clear current memory
    await this.flow.memory.clear();
    
    // Restore entries
    for (const [key, value] of snapshot.entries) {
      await this.flow.memory.store(key, value);
    }
    
    // Rebuild indices
    await this.flow.memory.rebuildIndices();
  }
  
  async pauseSession(sessionId: string): Promise<void> {
    const session = await this.loadSession(sessionId);
    if (!session) return;
    
    session.status = 'paused';
    await this.saveSession(session);
    
    // Pause all agents
    for (const [agentId, _] of session.agentStates) {
      await this.flow.agent.pause(agentId);
    }
  }
  
  async listSessions(filter?: {
    status?: SessionState['status'];
    createdAfter?: Date;
    namePattern?: string;
  }): Promise<SessionSummary[]> {
    let query = 'SELECT id, data FROM sessions WHERE 1=1';
    const params: any[] = [];
    
    if (filter?.status) {
      query += ' AND json_extract(data, "$.status") = ?';
      params.push(filter.status);
    }
    
    const rows = await this.db.all(query, params);
    
    const sessions = await Promise.all(
      rows.map(async row => {
        const session = await this.deserializeSession(
          await decompress(row.data)
        );
        return {
          id: session.id,
          name: session.name,
          status: session.status,
          created: session.created,
          lastModified: session.lastModified,
          checkpointCount: session.checkpoints.length,
          agentCount: session.agentStates.size
        };
      })
    );
    
    return sessions;
  }
  
  async exportSession(
    sessionId: string,
    format: 'json' | 'archive'
  ): Promise<Buffer> {
    const session = await this.loadSession(sessionId);
    if (!session) {
      throw new Error(\`Session \${sessionId} not found\`);
    }
    
    if (format === 'json') {
      return Buffer.from(JSON.stringify(session, null, 2));
    } else {
      // Create archive with session data and related files
      const archive = await this.createSessionArchive(session);
      return archive;
    }
  }
  
  async importSession(
    data: Buffer,
    format: 'json' | 'archive'
  ): Promise<SessionState> {
    let session: SessionState;
    
    if (format === 'json') {
      session = JSON.parse(data.toString());
    } else {
      session = await this.extractSessionFromArchive(data);
    }
    
    // Generate new ID to avoid conflicts
    session.id = this.generateSessionId();
    
    await this.saveSession(session);
    return session;
  }
}

// Usage example
async function runPersistentSwarm() {
  const sessionManager = new PersistentSession();
  
  // Create new session
  const session = await sessionManager.createSession({
    name: 'market-analysis-2024',
    swarmConfig: {
      objective: 'Analyze AI market trends',
      strategy: 'research',
      mode: 'distributed',
      maxAgents: 10
    },
    autoSave: true,
    autoSaveInterval: 30000 // Save every 30 seconds
  });
  
  console.log(\`Session created: \${session.id}\`);
  
  // Start swarm
  const swarm = await flow.swarm.start(session.swarmConfig);
  
  // Create checkpoint after research phase
  await sessionManager.createCheckpoint(session, 'research-complete');
  
  // Simulate interruption
  await sessionManager.pauseSession(session.id);
  
  // Resume later
  const resumed = await sessionManager.resumeSession(session.id, {
    checkpointId: 'research-complete',
    resumeAgents: true,
    restoreMemory: true
  });
  
  console.log(\`Session resumed from checkpoint\`);
  
  // Export session when complete
  const exportData = await sessionManager.exportSession(
    session.id,
    'archive'
  );
  
  fs.writeFileSync('session-backup.tar.gz', exportData);
}`,
      language: 'typescript'
    }
  ],
  assignments: [
    {
      id: 'assignment-2-3-1',
      title: 'Implementeer een Knowledge Graph Query System',
      description: 'Bouw een systeem dat natural language queries kan uitvoeren op een knowledge graph. Het systeem moet semantic search, graph traversal, en result ranking ondersteunen.',
      type: 'project',
      difficulty: 'hard',
    },
    {
      id: 'assignment-2-3-2',
      title: 'Ontwerp een Memory Optimization Strategy',
      description: 'Ontwerp een complete memory optimization strategie voor een swarm van 50 agents die een week lang actief blijft.',
      type: 'project',
      difficulty: 'medium',
    }
  ],
  resources: [
    {
      title: 'Claude Flow Memory Architecture Deep Dive',
      type: 'documentation',
      url: 'https://docs.claude-flow.ai/architecture/memory'
    },
    {
      title: 'Knowledge Graphs in AI Systems',
      type: 'article',
      url: 'https://arxiv.org/papers/knowledge-graphs-ai'
    },
    {
      title: 'Video: Building Scalable Memory Systems',
      type: 'video',
      url: 'https://youtube.com/watch?v=memory-systems'
    },
    {
      title: 'Session Persistence Best Practices',
      type: 'guide',
      url: 'https://claude-flow.ai/guides/session-persistence'
    }
  ]
};