import type { Lesson } from '@/lib/data/courses';

export const lesson1_5: Lesson = {
  id: 'lesson-1-5',
  title: 'Data flow en execution concepten',
  duration: '25 min',
  content: `
# Data flow en execution concepten

## Hoe stroomt data door je automation?

Stel je een automation voor als een rivier: data stroomt van de bron (trigger) via verschillende punten (nodes/modules) naar de monding (eindresultaat). Het begrijpen van deze flow is cruciaal voor het bouwen van betrouwbare automations.

## Core concepten

### 1. **Items en Bundles**
In automation-land bestaat data uit discrete eenheden:

- **N8N**: "Items" - individuele data objecten
- **Make**: "Bundles" - pakketten van data

\`\`\`javascript
// N8N Item structuur
{
  json: {
    name: "John Doe",
    email: "john@example.com",
    orders: [
      { id: 1, product: "Laptop", price: 999 },
      { id: 2, product: "Mouse", price: 29 }
    ]
  }
}

// Make Bundle structuur  
{
  name: "John Doe",
  email: "john@example.com",
  orders: {
    1: { product: "Laptop", price: 999 },
    2: { product: "Mouse", price: 29 }
  }
}
\`\`\`

### 2. **Execution modes**

#### Linear execution
Stappen worden één voor één uitgevoerd:
\`\`\`
[A] → [B] → [C] → [D]
\`\`\`
- Makkelijk te volgen
- Foutopsporing simpel
- Geschikt voor simpele flows

#### Parallel execution
Meerdere paden tegelijkertijd:
\`\`\`
     ┌→ [B] →┐
[A] →┤       ├→ [D]
     └→ [C] →┘
\`\`\`
- Sneller voor onafhankelijke taken
- Complexer om te debuggen
- Efficiënter resource gebruik

#### Loop execution
Herhaling voor lijsten/arrays:
\`\`\`
[A] → [For Each Item] → [Process] → [Collect Results]
         ↑___________________|
\`\`\`

### 3. **Data persistence tussen nodes**

Data wordt doorgegeven en kan worden:
- **Getransformeerd**: Veranderd naar nieuw formaat
- **Gefilterd**: Alleen relevante data door
- **Verrijkt**: Extra informatie toegevoegd
- **Gesplitst**: Opgedeeld in meerdere outputs

## Execution context begrijpen

### Global vs Local scope

\`\`\`javascript
// N8N Global context
const workflow = {
  id: \$workflow.id,
  name: \$workflow.name,
  active: \$workflow.active
};

// Node specifieke context
const currentNode = {
  name: \$node.name,
  type: \$node.type,
  parameters: \$node.parameters
};

// Vorige node data
const previousData = \$items("Previous Node Name")[0].json;

// Make global variables
const execution = {
  id: {{executionId}},
  timestamp: {{timestamp}},
  scenario: {{scenario.name}}
};
\`\`\`

## Data transformatie patterns

### 1. **One-to-One mapping**
Elke input produceert één output:
\`\`\`javascript
// Input: { firstName: "John", lastName: "Doe" }
// Output: { fullName: "John Doe" }

items.map(item => ({
  json: {
    fullName: \`\${item.json.firstName} \${item.json.lastName}\`
  }
}));
\`\`\`

### 2. **One-to-Many splitting**
Één input wordt meerdere outputs:
\`\`\`javascript
// Input: { order: { items: [...] } }
// Output: Individuele items

const allItems = [];
items.forEach(item => {
  item.json.order.items.forEach(orderItem => {
    allItems.push({
      json: {
        orderId: item.json.order.id,
        ...orderItem
      }
    });
  });
});
return allItems;
\`\`\`

### 3. **Many-to-One aggregation**
Meerdere inputs worden één output:
\`\`\`javascript
// Input: Meerdere order items
// Output: Totaal overzicht

const summary = {
  totalItems: 0,
  totalValue: 0,
  items: []
};

items.forEach(item => {
  summary.totalItems++;
  summary.totalValue += item.json.price;
  summary.items.push(item.json.name);
});

return [{json: summary}];
\`\`\`

## Memory en state management

### Tijdelijke opslag tijdens execution:
\`\`\`javascript
// N8N Static Data
const staticData = \$getWorkflowStaticData('global');

// Initialize counter
if (!staticData.executionCount) {
  staticData.executionCount = 0;
}
staticData.executionCount++;

// Make Data Store
// Gebruik Data Store module voor persistent storage
{
  "action": "add",
  "key": "execution_{{executionId}}",
  "value": {
    "timestamp": "{{now}}",
    "status": "processing"
  }
}
\`\`\`

## Error propagation en handling

### Error flow patterns:

#### 1. **Fail-fast**
Stop bij eerste fout:
\`\`\`
[A] → [B] → [ERROR] ✗ [C] [D]
            ↓
        [Error Handler]
\`\`\`

#### 2. **Continue-on-error**
Ga door ondanks fouten:
\`\`\`
[A] → [B] → [ERROR] → [C] → [D]
            ↓
        [Log Error]
\`\`\`

#### 3. **Retry pattern**
Probeer opnieuw bij falen:
\`\`\`javascript
// N8N retry implementation
async function retryOperation(operation, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
}
\`\`\`

## Performance optimalisatie

### 1. **Batch processing**
Verwerk meerdere items tegelijk:
\`\`\`javascript
// Inefficiënt: één voor één
for (const item of items) {
  await processItem(item);
}

// Efficiënt: in batches
const batchSize = 10;
for (let i = 0; i < items.length; i += batchSize) {
  const batch = items.slice(i, i + batchSize);
  await Promise.all(batch.map(processItem));
}
\`\`\`

### 2. **Caching strategieën**
\`\`\`javascript
// Simple in-memory cache
const cache = new Map();

function getCachedData(key) {
  if (cache.has(key)) {
    const cached = cache.get(key);
    if (cached.expires > Date.now()) {
      return cached.data;
    }
  }
  
  // Fetch fresh data
  const data = fetchData(key);
  cache.set(key, {
    data,
    expires: Date.now() + 3600000 // 1 hour
  });
  
  return data;
}
\`\`\`

### 3. **Resource pooling**
Hergebruik connections:
\`\`\`javascript
// Connection pool voor database
const pool = {
  connections: [],
  maxSize: 10,
  
  async getConnection() {
    if (this.connections.length > 0) {
      return this.connections.pop();
    }
    return await createNewConnection();
  },
  
  releaseConnection(conn) {
    if (this.connections.length < this.maxSize) {
      this.connections.push(conn);
    } else {
      conn.close();
    }
  }
};
\`\`\`

## Monitoring en debugging

### Execution logs analyseren:
\`\`\`javascript
// Add debug information
const debug = {
  nodeStart: new Date().toISOString(),
  inputCount: items.length,
  memoryUsage: process.memoryUsage().heapUsed
};

// Process data
const results = processData(items);

// Log execution details
console.log({
  ...debug,
  nodeEnd: new Date().toISOString(),
  outputCount: results.length,
  duration: Date.now() - new Date(debug.nodeStart).getTime()
});
\`\`\`

## Best practices voor data flow

1. **Keep it simple**: Complexiteit = meer kans op fouten
2. **Document data structures**: Vooral bij transformaties
3. **Validate early**: Check data zo vroeg mogelijk
4. **Handle edge cases**: Lege arrays, null values, etc.
5. **Monitor performance**: Meet execution times
6. **Test with real data**: Gebruik production-like datasets
7. **Plan for scale**: Wat gebeurt bij 10x volume?
  `,
  codeExamples: [
    {
      id: 'code-1-5-1',
      title: 'Advanced data flow control',
      language: 'javascript',
      code: `// N8N Function node voor geavanceerde flow control
const items = \$input.all();
const config = {
  batchSize: 50,
  maxConcurrent: 5,
  retryAttempts: 3,
  timeout: 30000
};

// Batch processor met error handling
async function processBatch(batch, batchIndex) {
  const results = [];
  const errors = [];
  
  for (const item of batch) {
    try {
      // Simulate API call met retry
      const result = await withRetry(
        () => processItem(item),
        config.retryAttempts
      );
      
      results.push({
        json: {
          ...result,
          _meta: {
            batchIndex,
            processedAt: new Date().toISOString(),
            attempts: result._attempts || 1
          }
        }
      });
    } catch (error) {
      errors.push({
        item: item.json,
        error: error.message,
        batchIndex
      });
    }
  }
  
  return { results, errors };
}

// Retry wrapper
async function withRetry(fn, maxAttempts) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fn();
      result._attempts = attempt;
      return result;
    } catch (error) {
      lastError = error;
      
      if (attempt < maxAttempts) {
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// Process item (placeholder for actual logic)
async function processItem(item) {
  // Your processing logic here
  return {
    id: item.json.id,
    processed: true,
    timestamp: Date.now()
  };
}

// Main execution
async function execute() {
  const allResults = [];
  const allErrors = [];
  
  // Split into batches
  const batches = [];
  for (let i = 0; i < items.length; i += config.batchSize) {
    batches.push(items.slice(i, i + config.batchSize));
  }
  
  // Process batches with concurrency control
  const activeBatches = new Set();
  
  for (let i = 0; i < batches.length; i++) {
    // Wait if too many concurrent batches
    while (activeBatches.size >= config.maxConcurrent) {
      await Promise.race(activeBatches);
    }
    
    // Start new batch
    const batchPromise = processBatch(batches[i], i)
      .then(({ results, errors }) => {
        allResults.push(...results);
        allErrors.push(...errors);
        activeBatches.delete(batchPromise);
      });
    
    activeBatches.add(batchPromise);
  }
  
  // Wait for remaining batches
  await Promise.all(activeBatches);
  
  // Return results with summary
  return [
    ...allResults,
    {
      json: {
        _summary: {
          totalProcessed: allResults.length,
          totalErrors: allErrors.length,
          errors: allErrors,
          executionTime: new Date().toISOString()
        }
      }
    }
  ];
}

// Execute and return results
return execute();`
    }
  ],
  assignments: [
    {
      id: 'assignment-1-5-1',
      title: 'Analyseer een complexe workflow',
      description: 'Neem een bestaande workflow met minstens 10 nodes. Documenteer de data flow, identificeer bottlenecks, en stel optimalisaties voor.',
      difficulty: 'hard',
      type: 'project',
      initialCode: `// 1. Kies een complexe workflow (bijv. een van de N8N of Make templates).
// 2. Maak een diagram van de data flow.
// 3. Identificeer punten waar de workflow kan falen.
// 4. Stel verbeteringen voor op het gebied van performance en betrouwbaarheid.
`,
      hints: [
        'Gebruik een tool als Miro of Lucidchart om de data flow te visualiseren.',
        'Let op nodes die veel data verwerken of externe API calls maken.',
        'Denk aan het toevoegen van error handling en logging.'
      ]
    },
    {
      id: 'assignment-1-5-2',
      title: 'Bouw een error-resilient workflow',
      description: 'Creëer een workflow die data uit 3 verschillende APIs haalt, waarbij elke API kan falen. Implementeer proper error handling en retry logic.',
      difficulty: 'expert',
      type: 'project',
      initialCode: `// 1. Kies 3 gratis APIs (bijv. een weer API, een nieuws API, en een crypto API).
// 2. Bouw een workflow die data van alle 3 ophaalt en combineert.
// 3. Implementeer een retry mechanisme voor elke API call.
// 4. Zorg ervoor dat de workflow niet stopt als één van de APIs faalt.
// 5. Stuur een notificatie met de details van de gefaalde API call.
`,
      hints: [
        'Gebruik de `Continue on Fail` optie in N8N.',
        'In Make kun je een error handler route toevoegen.',
        'Implementeer exponential backoff voor de retries om de API niet te overbelasten.'
      ]
    }
  ],
  resources: [
    {
      title: 'N8N Execution data documentation',
      url: 'https://docs.n8n.io/data/data-structure/',
      type: 'documentation'
    },
    {
      title: 'Make Execution flow guide',
      url: 'https://www.make.com/en/help/scenarios/execution-flow',
      type: 'guide'
    }
  ]
};