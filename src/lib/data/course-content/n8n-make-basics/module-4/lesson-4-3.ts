import type { Lesson } from '@/lib/data/courses';

export const lesson4_3: Lesson = {
  id: 'lesson-4-3',
  title: 'Performance optimalisatie',
  duration: '30 min',
  content: `
# Performance optimalisatie

Optimaliseer je workflows voor snelheid, efficiëntie en schaalbaarheid. Leer bottlenecks identificeren en oplossen.

## Performance metrics

### Key Performance Indicators (KPIs)

1. **Execution Time**
   - Target: < 30 seconden voor simpele workflows
   - Target: < 5 minuten voor complexe workflows
   - Measure: Total tijd van start tot finish

2. **Resource Usage**
   - CPU: Monitor spikes boven 80%
   - Memory: Blijf onder 1GB voor standaard workflows
   - API calls: Minimaliseer externe requests

3. **Throughput**
   - Items per seconde processing rate
   - Concurrent execution capacity
   - Queue processing efficiency

## Optimalisatie strategieën

### 1. Batch processing

**Inefficiënt:**
\`\`\`javascript
// Process items één voor één
for (const item of items) {
  await processItem(item);
}
\`\`\`

**Geoptimaliseerd:**
\`\`\`javascript
// Process in batches
const batchSize = 100;
const batches = [];

for (let i = 0; i < items.length; i += batchSize) {
  batches.push(items.slice(i, i + batchSize));
}

// Parallel processing
const results = await Promise.all(
  batches.map(batch => processBatch(batch))
);
\`\`\`

### 2. Caching strategieën

**Implementeer smart caching:**
\`\`\`javascript
const cache = new Map();
const CACHE_TTL = 3600000; // 1 hour

const getCachedData = async (key) => {
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const freshData = await fetchData(key);
  cache.set(key, {
    data: freshData,
    timestamp: Date.now()
  });
  
  return freshData;
};
\`\`\`

### 3. Query optimalisatie

**Database query best practices:**
- Gebruik indexes voor frequent gebruikte queries
- Limiteer result sets met pagination
- Gebruik SELECT alleen voor benodigde velden
- Implementeer connection pooling

### 4. Parallel processing

**Workflow splitting:**
\`\`\`javascript
// Split workflow in parallel branches
const parallelTasks = [
  processCustomerData(),
  updateInventory(),
  sendNotifications(),
  generateReports()
];

// Execute simultaneously
const results = await Promise.allSettled(parallelTasks);

// Handle results
results.forEach((result, index) => {
  if (result.status === 'rejected') {
    console.error(\`Task \${index} failed:\`, result.reason);
  }
});
\`\`\`

## Memory management

### Prevent memory leaks:

1. **Clear large variables**
\`\`\`javascript
let largeData = await fetchLargeDataset();
// Process data
processData(largeData);
// Clear reference
largeData = null;
\`\`\`

2. **Stream processing voor grote files**
\`\`\`javascript
const stream = fs.createReadStream('large-file.csv');
const csvParser = csv.parse({ columns: true });

stream.pipe(csvParser)
  .on('data', (row) => {
    // Process row by row
    processRow(row);
  })
  .on('end', () => {
    console.log('Processing complete');
  });
\`\`\`

## Performance monitoring dashboard

### Metrics to track:
- Average execution time per workflow
- Error rate percentage
- Resource utilization graphs
- API response time distribution
- Queue length and processing time

## Optimization checklist

- [ ] Identify slow nodes with execution timeline
- [ ] Implement batch processing where possible
- [ ] Add caching for repeated API calls
- [ ] Use parallel execution for independent tasks
- [ ] Optimize database queries
- [ ] Implement proper error handling
- [ ] Set up performance monitoring
- [ ] Regular performance reviews
  `,
  codeExamples: [
    {
      id: 'example-4-3-1',
      title: 'Performance monitoring setup',
      language: 'javascript',
      code: `// Performance monitoring class
class WorkflowPerformanceMonitor {
  constructor() {
    this.metrics = {
      executions: [],
      errors: [],
      apiCalls: new Map()
    };
  }
  
  startExecution(workflowId) {
    const execution = {
      id: crypto.randomUUID(),
      workflowId,
      startTime: Date.now(),
      nodes: new Map()
    };
    this.metrics.executions.push(execution);
    return execution;
  }
  
  trackNode(execution, nodeName, operation) {
    const nodeStart = Date.now();
    
    return {
      complete: (data = {}) => {
        const duration = Date.now() - nodeStart;
        execution.nodes.set(nodeName, {
          duration,
          success: true,
          itemsProcessed: data.items || 0,
          memoryUsed: process.memoryUsage().heapUsed
        });
      },
      error: (error) => {
        const duration = Date.now() - nodeStart;
        execution.nodes.set(nodeName, {
          duration,
          success: false,
          error: error.message
        });
        this.metrics.errors.push({
          node: nodeName,
          error: error.message,
          timestamp: new Date()
        });
      }
    };
  }
  
  generateReport() {
    const report = {
      summary: {
        totalExecutions: this.metrics.executions.length,
        averageTime: this.calculateAverageTime(),
        errorRate: this.calculateErrorRate(),
        slowestNodes: this.identifySlowNodes()
      },
      recommendations: this.generateRecommendations()
    };
    
    return report;
  }
  
  calculateAverageTime() {
    const times = this.metrics.executions.map(e => 
      e.endTime - e.startTime
    ).filter(t => t > 0);
    
    return times.reduce((a, b) => a + b, 0) / times.length;
  }
  
  identifySlowNodes() {
    const nodeStats = new Map();
    
    this.metrics.executions.forEach(execution => {
      execution.nodes.forEach((stats, nodeName) => {
        if (!nodeStats.has(nodeName)) {
          nodeStats.set(nodeName, []);
        }
        nodeStats.get(nodeName).push(stats.duration);
      });
    });
    
    return Array.from(nodeStats.entries())
      .map(([node, durations]) => ({
        node,
        avgDuration: durations.reduce((a, b) => a + b) / durations.length
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 5);
  }
}`
    }
  ],
  assignments: [
    {
      id: 'assignment-4-3-1',
      title: 'Workflow optimalisatie project',
      description: 'Neem een bestaande workflow en optimaliseer deze voor 50% betere performance. Meet en documenteer de verbeteringen.',
      difficulty: 'hard',
      type: 'project',
      initialCode: `// Slow workflow - optimize for better performance
class SlowWorkflow {
  async processData(items) {
    const results = [];
    
    // Problem 1: Sequential processing
    for (const item of items) {
      const enriched = await this.enrichData(item);
      const validated = await this.validateData(enriched);
      const saved = await this.saveToDatabase(validated);
      results.push(saved);
    }
    
    // Problem 2: No caching
    async enrichData(item) {
      // This makes the same API call for duplicate items
      return await fetch(\`/api/enrich/\${item.type}\`);
    }
    
    // Problem 3: Individual DB operations
    async saveToDatabase(item) {
      return await db.insert('items', item);
    }
  }
  
  // TODO: Optimize this workflow for:
  // 1. Parallel processing where possible
  // 2. Implement caching for repeated API calls
  // 3. Batch database operations
  // 4. Add performance monitoring
}`,
      hints: [
        'Use Promise.all() for parallel operations',
        'Implement a Map() for caching API responses',
        'Batch database inserts in groups of 100',
        'Measure time before and after optimization'
      ]
    }
  ],
  resources: [
    {
      title: 'Performance Best Practices Guide',
      url: 'https://performance-guide.io',
      type: 'guide' as const
    }
  ]
};