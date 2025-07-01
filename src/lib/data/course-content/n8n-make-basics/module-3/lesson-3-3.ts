import type { Lesson } from '@/lib/data/courses';

export const lesson3_3: Lesson = {
  id: 'lesson-3-3',
  title: 'Loop Patterns & Batch Processing',
  duration: '35 min',
  content: `
# Loop Patterns & Batch Processing in N8N

## Overzicht
Leer hoe je grote datasets efficiënt verwerkt met loops, batch processing, en pagination in N8N voor schaalbare automatisering.

## Business Value
- **Performance**: 10x snellere verwerking van grote datasets
- **Stabiliteit**: Error recovery voorkomt data verlies
- **Schaalbaarheid**: Van 100 naar 100.000+ items
- **Resource Management**: 80% minder geheugengebruik

## Workflow 1: Batch Email Processing voor Nederlandse Marketing

### N8N Workflow Export
<iframe
  src="https://codesandbox.io/embed/n8n-batch-email-processing-nl?autoresize=1&fontsize=14&hidenavigation=1&theme=dark&view=preview"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="N8N Batch Email Processing NL"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

\`\`\`json
{
  "name": "Batch Email Marketing Campaign NL",
  "nodes": [
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT email, naam, stad, laatste_aankoop FROM klanten WHERE marketing_consent = true AND land = 'Nederland' LIMIT 10000"
      },
      "name": "Get Dutch Customers",
      "type": "n8n-nodes-base.postgres",
      "position": [250, 300]
    },
    {
      "parameters": {
        "batchSize": 100,
        "options": {
          "reset": false
        }
      },
      "name": "Split In Batches",
      "type": "n8n-nodes-base.splitInBatches",
      "position": [450, 300]
    },
    {
      "parameters": {
        "functionCode": "// Personaliseer email content voor Nederlandse markt\\nreturn items.map(item => {\\n  const customer = item.json;\\n  \\n  // Bepaal regio-specifieke aanbiedingen\\n  const regionOffers = {\\n    'Amsterdam': { discount: 15, product: 'Stadsfiets Deluxe' },\\n    'Rotterdam': { discount: 20, product: 'Haven Collectie' },\\n    'Utrecht': { discount: 10, product: 'Dom Toren Special' },\\n    'Eindhoven': { discount: 25, product: 'Tech Bundle' }\\n  };\\n  \\n  const offer = regionOffers[customer.stad] || { discount: 10, product: 'Algemene Aanbieding' };\\n  \\n  return {\\n    json: {\\n      ...customer,\\n      emailSubject: \`Exclusief voor ${customer.stad}: ${offer.discount}% korting!\`,\\n      emailBody: \`Beste ${customer.naam},\\n\\nSpeciaal voor inwoners van ${customer.stad} hebben we een geweldige aanbieding!\\n\\n${offer.product} nu met ${offer.discount}% korting.\\n\\nGebaseerd op uw laatste aankoop op ${new Date(customer.laatste_aankoop).toLocaleDateString('nl-NL')}, hebben we speciaal voor u geselecteerd.\\n\\nMet vriendelijke groet,\\nHet Marketing Team\`,\\n      personalized: true,\\n      offer: offer\\n    }\\n  };\\n});"
      },
      "name": "Personalize Content",
      "type": "n8n-nodes-base.function",
      "position": [650, 300]
    },
    {
      "parameters": {
        "sendTo": "={{$json.email}}",
        "subject": "={{$json.emailSubject}}",
        "emailType": "html",
        "html": "={{$json.emailBody}}",
        "options": {
          "appendAttribution": false
        }
      },
      "name": "Send Email Batch",
      "type": "n8n-nodes-base.emailSend",
      "position": [850, 300]
    },
    {
      "parameters": {
        "amount": 5,
        "unit": "seconds"
      },
      "name": "Rate Limit Wait",
      "type": "n8n-nodes-base.wait",
      "position": [1050, 300]
    },
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "status",
              "value": "sent"
            },
            {
              "name": "sentAt",
              "value": "={{$now.toISO()}}"
            }
          ],
          "number": [
            {
              "name": "batchNumber",
              "value": "={{$context['Split In Batches'].currentRunIndex}}"
            }
          ]
        }
      },
      "name": "Track Progress",
      "type": "n8n-nodes-base.set",
      "position": [1250, 300]
    },
    {
      "parameters": {
        "operation": "insert",
        "table": "email_campaign_log",
        "columns": "email,status,sent_at,batch_number,campaign_id",
        "values": "={{$json.email}},{{$json.status}},{{$json.sentAt}},{{$json.batchNumber}},NL_CAMPAIGN_2024"
      },
      "name": "Log to Database",
      "type": "n8n-nodes-base.postgres",
      "position": [1450, 300]
    }
  ]
}
\`\`\`

## Workflow 2: Multi-Warehouse Inventory Synchronization

### N8N Workflow Export
<iframe
  src="https://codesandbox.io/embed/n8n-warehouse-inventory-sync?autoresize=1&fontsize=14&hidenavigation=1&theme=dark&view=preview"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="N8N Warehouse Inventory Sync"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

\`\`\`json
{
  "name": "Multi-Warehouse Inventory Sync",
  "nodes": [
    {
      "parameters": {
        "resource": "sheet",
        "operation": "readRows",
        "sheetId": "{{warehouseInventorySheet}}",
        "range": "A2:Z"
      },
      "name": "Get Central Inventory",
      "type": "n8n-nodes-base.googleSheets",
      "position": [250, 400]
    },
    {
      "parameters": {
        "functionCode": "// Pagination handler voor grote inventaris\\nconst ITEMS_PER_PAGE = 500;\\nconst totalItems = items.length;\\nconst totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);\\n\\nconst paginatedData = [];\\n\\nfor (let page = 0; page < totalPages; page++) {\\n  const start = page * ITEMS_PER_PAGE;\\n  const end = Math.min(start + ITEMS_PER_PAGE, totalItems);\\n  \\n  paginatedData.push({\\n    json: {\\n      page: page + 1,\\n      totalPages: totalPages,\\n      items: items.slice(start, end),\\n      itemCount: end - start\\n    }\\n  });\\n}\\n\\nreturn paginatedData;"
      },
      "name": "Paginate Data",
      "type": "n8n-nodes-base.function",
      "position": [450, 400]
    },
    {
      "parameters": {
        "batchSize": 1,
        "options": {}
      },
      "name": "Process Pages",
      "type": "n8n-nodes-base.splitInBatches",
      "position": [650, 400]
    },
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "warehouses",
              "value": "Amsterdam,Rotterdam,Eindhoven,Groningen"
            }
          ]
        }
      },
      "name": "Define Warehouses",
      "type": "n8n-nodes-base.set",
      "position": [850, 400]
    },
    {
      "parameters": {
        "fieldToSplitOut": "warehouses",
        "options": {
          "splitBy": ","
        }
      },
      "name": "Split Warehouses",
      "type": "n8n-nodes-base.itemLists",
      "position": [1050, 400]
    },
    {
      "parameters": {
        "functionCode": "// Sync inventory with error handling\\nconst warehouse = $item(0).json.warehouses;\\nconst inventoryItems = $item(0).json.items;\\nconst results = [];\\n\\nfor (const item of inventoryItems) {\\n  try {\\n    // Simulate API call to warehouse system\\n    const updateData = {\\n      warehouse: warehouse,\\n      sku: item.json.sku,\\n      quantity: item.json.quantity,\\n      location: item.json.location,\\n      lastUpdated: new Date().toISOString()\\n    };\\n    \\n    // Add warehouse-specific rules\\n    if (warehouse === 'Amsterdam' && item.json.category === 'Electronics') {\\n      updateData.priority = 'HIGH';\\n      updateData.zone = 'SECURE';\\n    } else if (warehouse === 'Rotterdam' && item.json.weight > 50) {\\n      updateData.handling = 'HEAVY_GOODS';\\n      updateData.zone = 'DOCK_B';\\n    }\\n    \\n    results.push({\\n      json: {\\n        ...updateData,\\n        status: 'synced',\\n        syncTime: Date.now()\\n      }\\n    });\\n  } catch (error) {\\n    results.push({\\n      json: {\\n        warehouse: warehouse,\\n        sku: item.json.sku,\\n        status: 'error',\\n        error: error.message,\\n        retryCount: 0\\n      }\\n    });\\n  }\\n}\\n\\nreturn results;"
      },
      "name": "Sync Inventory",
      "type": "n8n-nodes-base.function",
      "position": [1250, 400]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.status}}",
              "value2": "error"
            }
          ]
        }
      },
      "name": "Check Errors",
      "type": "n8n-nodes-base.if",
      "position": [1450, 400]
    },
    {
      "parameters": {
        "functionCode": "// Retry mechanism met exponential backoff\\nconst maxRetries = 3;\\nconst baseDelay = 1000; // 1 second\\n\\nreturn items.map(item => {\\n  const retryCount = item.json.retryCount || 0;\\n  \\n  if (retryCount < maxRetries) {\\n    const delay = baseDelay * Math.pow(2, retryCount);\\n    \\n    return {\\n      json: {\\n        ...item.json,\\n        retryCount: retryCount + 1,\\n        nextRetry: new Date(Date.now() + delay).toISOString(),\\n        retryDelay: delay\\n      }\\n    };\\n  }\\n  \\n  // Max retries reached\\n  return {\\n    json: {\\n      ...item.json,\\n      status: 'failed',\\n      reason: 'Max retries exceeded'\\n    }\\n  };\\n});"
      },
      "name": "Retry Logic",
      "type": "n8n-nodes-base.function",
      "position": [1650, 500]
    }
  ]
}
\`\`\`

## Key Concepts: Loop Patterns & Performance

### 1. SplitInBatches Node Usage
\`\`\`javascript
// Optimal batch sizing voor verschillende scenarios
const batchSizeCalculator = {
  email: (totalRecords) => {
    // Email providers hebben rate limits
    if (totalRecords < 1000) return 50;
    if (totalRecords < 10000) return 100;
    return 250; // Max voor stabiliteit
  },
  
  api: (totalRecords, apiRateLimit) => {
    // Bereken based op API rate limits
    const optimalSize = Math.floor(apiRateLimit / 4);
    return Math.min(optimalSize, 500);
  },
  
  database: (totalRecords) => {
    // Database operations kunnen meer aan
    if (totalRecords < 5000) return 500;
    if (totalRecords < 50000) return 1000;
    return 2000;
  }
};
\`\`\`

### 2. Pagination Implementation
\`\`\`javascript
class PaginationHandler {
  constructor(pageSize = 100) {
    this.pageSize = pageSize;
    this.currentPage = 0;
    this.hasMore = true;
  }
  
  async fetchPage(apiClient, endpoint) {
    const offset = this.currentPage * this.pageSize;
    
    const response = await apiClient.get(endpoint, {
      params: {
        limit: this.pageSize,
        offset: offset
      }
    });
    
    this.hasMore = response.data.length === this.pageSize;
    this.currentPage++;
    
    return {
      data: response.data,
      page: this.currentPage,
      hasMore: this.hasMore,
      totalProcessed: offset + response.data.length
    };
  }
  
  async fetchAll(apiClient, endpoint, processor) {
    const allResults = [];
    
    while (this.hasMore) {
      const page = await this.fetchPage(apiClient, endpoint);
      
      // Process in chunks to avoid memory issues
      const processed = await processor(page.data);
      allResults.push(...processed);
      
      // Add delay to respect rate limits
      await this.delay(100);
    }
    
    return allResults;
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
\`\`\`

### 3. Error Recovery Patterns
\`\`\`javascript
// Robuuste error handling voor batch operations
const batchProcessor = {
  async processBatch(items, operation, options = {}) {
    const results = {
      successful: [],
      failed: [],
      retryQueue: []
    };
    
    const maxRetries = options.maxRetries || 3;
    const retryDelay = options.retryDelay || 1000;
    
    for (const item of items) {
      try {
        const result = await operation(item);
        results.successful.push({
          item: item,
          result: result,
          timestamp: new Date()
        });
      } catch (error) {
        const errorData = {
          item: item,
          error: error.message,
          attemptNumber: item._retryCount || 1
        };
        
        if (errorData.attemptNumber < maxRetries) {
          // Add to retry queue with exponential backoff
          errorData.item._retryCount = errorData.attemptNumber + 1;
          errorData.nextRetryTime = Date.now() + (retryDelay * Math.pow(2, errorData.attemptNumber));
          results.retryQueue.push(errorData);
        } else {
          // Max retries reached
          results.failed.push(errorData);
        }
      }
    }
    
    // Process retry queue if needed
    if (results.retryQueue.length > 0 && options.autoRetry) {
      await this.processRetryQueue(results.retryQueue, operation, options);
    }
    
    return results;
  }
};
\`\`\`

### 4. Memory Management
\`\`\`javascript
// Stream processing voor grote datasets
class StreamProcessor {
  constructor(options = {}) {
    this.chunkSize = options.chunkSize || 1000;
    this.maxMemory = options.maxMemory || 100 * 1024 * 1024; // 100MB
  }
  
  async processLargeDataset(source, transformer, destination) {
    let processedCount = 0;
    let chunk = [];
    
    // Monitor memory usage
    const startMemory = process.memoryUsage().heapUsed;
    
    for await (const item of source) {
      chunk.push(item);
      
      if (chunk.length >= this.chunkSize) {
        // Process and clear chunk
        const transformed = await transformer(chunk);
        await destination.write(transformed);
        
        processedCount += chunk.length;
        chunk = []; // Clear memory
        
        // Force garbage collection if memory is high
        const currentMemory = process.memoryUsage().heapUsed;
        if (currentMemory - startMemory > this.maxMemory) {
          if (global.gc) global.gc();
        }
      }
    }
    
    // Process remaining items
    if (chunk.length > 0) {
      const transformed = await transformer(chunk);
      await destination.write(transformed);
      processedCount += chunk.length;
    }
    
    return { processedCount };
  }
}
\`\`\`

## Best Practices

### 1. Batch Size Optimization
- **Email**: 50-250 items per batch
- **API Calls**: Respecteer rate limits
- **Database**: 500-2000 items per batch
- **File Processing**: Based on memory constraints

### 2. Error Handling Strategies
- Implement exponential backoff
- Log failed items separately
- Create retry queues
- Set maximum retry limits

### 3. Performance Monitoring
- Track processing time per batch
- Monitor memory usage
- Log success/failure rates
- Implement health checks

## ROI Calculation

### Time Savings
- Manual processing: 1 min/record × 10,000 = 167 hours
- Automated batch: 10,000 records in 30 minutes
- **Besparing: 166.5 uur per run**

### Error Reduction
- Manual error rate: 2-5%
- Automated error rate: <0.1%
- **99% minder fouten**

### Scalability Benefits
- Linear scaling met volume
- Geen extra personeel nodig
- 24/7 processing mogelijk
- **Onbeperkte groei capacity**

### Financial Impact
- Tijdsbesparing: €5,827.50/run (166.5u × €35)
- Foutreductie: €2,000/maand bespaard
- Schaalbaarheid: +300% throughput
- **Totaal: €25,000+/maand ROI**
`,
  codeExamples: [
    {
      id: 'example-3-3-1',
      title: 'Advanced Batch Processor with Circuit Breaker',
      language: 'typescript',
      code: `// Advanced batch processor met circuit breaker pattern
interface BatchProcessorOptions {
  batchSize: number;
  maxRetries: number;
  retryDelay: number;
  circuitBreakerThreshold: number;
  cooldownPeriod: number;
}

class AdvancedBatchProcessor {
  private circuitState: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;
  
  constructor(private options: BatchProcessorOptions) {}
  
  async processBatches<T>(
    items: T[],
    processor: (batch: T[]) => Promise<any>
  ) {
    const results = {
      processed: 0,
      failed: 0,
      batches: [] as any[]
    };
    
    // Split into batches
    const batches = this.createBatches(items, this.options.batchSize);
    
    for (const [index, batch] of batches.entries()) {
      // Check circuit breaker
      if (!this.canProcess()) {
        console.log('Circuit breaker OPEN - skipping batch');
        results.failed += batch.length;
        continue;
      }
      
      try {
        const result = await this.processWithRetry(batch, processor);
        results.batches.push({
          batchNumber: index + 1,
          success: true,
          itemCount: batch.length,
          result
        });
        results.processed += batch.length;
        
        // Reset failure count on success
        this.failureCount = 0;
        
      } catch (error) {
        this.handleFailure();
        results.failed += batch.length;
        results.batches.push({
          batchNumber: index + 1,
          success: false,
          itemCount: batch.length,
          error: error.message
        });
      }
      
      // Add delay between batches
      await this.delay(100);
    }
    
    return results;
  }
  
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }
  
  private async processWithRetry<T>(
    batch: T[],
    processor: (batch: T[]) => Promise<any>
  ): Promise<any> {
    let lastError: Error;
    
    for (let attempt = 0; attempt < this.options.maxRetries; attempt++) {
      try {
        return await processor(batch);
      } catch (error) {
        lastError = error;
        const delay = this.options.retryDelay * Math.pow(2, attempt);
        await this.delay(delay);
      }
    }
    
    throw lastError!;
  }
  
  private canProcess(): boolean {
    if (this.circuitState === 'CLOSED') return true;
    
    if (this.circuitState === 'OPEN') {
      const now = Date.now();
      if (now - this.lastFailureTime > this.options.cooldownPeriod) {
        this.circuitState = 'HALF_OPEN';
        return true;
      }
      return false;
    }
    
    return true; // HALF_OPEN state
  }
  
  private handleFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.options.circuitBreakerThreshold) {
      this.circuitState = 'OPEN';
      console.log('Circuit breaker triggered - OPEN');
    }
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage example
const processor = new AdvancedBatchProcessor({
  batchSize: 100,
  maxRetries: 3,
  retryDelay: 1000,
  circuitBreakerThreshold: 5,
  cooldownPeriod: 60000 // 1 minute
});

// Process inventory updates
const inventoryUpdates = await processor.processBatches(
  inventoryItems,
  async (batch) => {
    return await updateWarehouseAPI(batch);
  }
);`
    }
  ],
  assignments: [
    {
      id: 'batch-processing-1',
      title: 'Build a Resilient Batch Email System',
      description: 'Create a batch email processor that handles 10,000+ emails with proper error recovery and rate limiting',
      difficulty: 'hard',
      type: 'project',
      initialCode: `// Batch Email Processor with Dutch market focus
class BatchEmailProcessor {
  constructor() {
    this.batchSize = 100;
    this.rateLimit = 10; // emails per second
    this.maxRetries = 3;
  }
  
  // TODO: Implement these methods
  // 1. splitIntoBatches(recipients)
  // 2. personalizeEmail(recipient, template)
  // 3. sendBatch(batch) with rate limiting
  // 4. handleFailures(failedEmails)
  // 5. generateReport(results)
  
  async processCampaign(recipients, template) {
    // Your implementation here
  }
}

// Test data
const dutchRecipients = [
  { email: 'jan@example.nl', name: 'Jan', city: 'Amsterdam' },
  { email: 'marie@example.nl', name: 'Marie', city: 'Rotterdam' },
  // ... more recipients
];`,
      hints: [
        'Use Promise.allSettled() for batch processing',
        'Implement exponential backoff for retries',
        'Add memory usage monitoring',
        'Create detailed logging for debugging'
      ]
    }
  ],
  resources: [
    {
      title: 'N8N Loop & Batch Documentation',
      url: 'https://docs.n8n.io/code-examples/methods/looping/',
      type: 'docs'
    },
    {
      title: 'Circuit Breaker Pattern Guide',
      url: 'https://martinfowler.com/bliki/CircuitBreaker.html',
      type: 'article'
    }
  ]
};