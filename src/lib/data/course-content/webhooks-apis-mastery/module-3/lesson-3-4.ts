export const lesson3_4 = {
  id: 'performance-grote-datasets',
  title: 'Performance en grote datasets',
  duration: '30 min',
  content: `
# Performance en grote datasets

## Introductie

Bij het werken met webhooks en APIs kom je vaak grote datasets tegen. Het efficiënt verwerken van deze data is cruciaal voor de performance en schaalbaarheid van je applicatie. In deze les leer je verschillende technieken om grote hoeveelheden data te verwerken zonder je systeem te overbelasten.

## Wat gaan we behandelen?

1. **Streaming vs Buffering** - Wanneer gebruik je welke aanpak?
2. **Pagination handling** - Verwerk grote datasets in hapklare brokken
3. **Batch processing** - Efficiënt meerdere records tegelijk verwerken
4. **Memory optimization** - Voorkom out-of-memory errors
5. **Parallel processing** - Gebruik alle CPU cores optimaal

## 1. Streaming vs Buffering

### Het probleem met grote responses

Stel je voor: je ontvangt een webhook met 100.000 records. Als je alles in het geheugen laadt, gebruik je mogelijk gigabytes aan RAM. Dit kan je applicatie laten crashen of extreem traag maken.

### Buffering (traditionele aanpak)

\`\`\`javascript
// ❌ PROBLEEM: Alles in geheugen laden
app.post('/webhook/large-dataset', async (req, res) => {
  try {
    // Dit laadt ALLE data in geheugen
    const allData = req.body; // Kan gigabytes zijn!
    
    // Verwerk alle data in één keer
    const results = await processAllData(allData);
    
    res.json({ processed: results.length });
  } catch (error) {
    // Out of memory error!
    console.error('Memory exhausted:', error);
    res.status(500).send('Server error');
  }
});
\`\`\`

### Streaming (efficiënte aanpak)

\`\`\`javascript
// ✅ OPLOSSING: Stream-based processing
const { Transform } = require('stream');
const JSONStream = require('JSONStream');

app.post('/webhook/large-dataset', (req, res) => {
  let processedCount = 0;
  
  // Parse JSON stream
  req
    .pipe(JSONStream.parse('data.*')) // Parse array items één voor één
    .pipe(new Transform({
      objectMode: true,
      transform: async (record, encoding, callback) => {
        try {
          // Verwerk één record tegelijk
          await processRecord(record);
          processedCount++;
          
          // Geef geheugen vrij
          callback();
        } catch (error) {
          callback(error);
        }
      }
    }))
    .on('finish', () => {
      res.json({ processed: processedCount });
    })
    .on('error', (error) => {
      console.error('Stream error:', error);
      res.status(500).send('Processing error');
    });
});

async function processRecord(record) {
  // Verwerk individuele record
  await saveToDatabase(record);
  
  // Optional: batch saves voor efficiency
  if (processedCount % 100 === 0) {
    await flushBatch();
  }
}
\`\`\`

### Wanneer gebruik je wat?

**Use Buffering wanneer:**
- Dataset klein is (< 10MB)
- Je alle data tegelijk nodig hebt
- Complexe transformaties nodig zijn

**Use Streaming wanneer:**
- Dataset groot is (> 10MB)
- Records onafhankelijk verwerkt kunnen worden
- Memory gebruik kritisch is

## 2. Pagination Handling

Veel APIs retourneren data in pagina's. Correct omgaan met pagination is essentieel voor complete data retrieval.

### REST API Pagination Patterns

\`\`\`javascript
// Offset-based pagination
async function fetchAllDataOffset(apiUrl, pageSize = 100) {
  const allData = [];
  let offset = 0;
  let hasMore = true;
  
  while (hasMore) {
    const response = await fetch(
      \`\${apiUrl}?limit=\${pageSize}&offset=\${offset}\`
    );
    const data = await response.json();
    
    allData.push(...data.results);
    
    // Check of er meer data is
    hasMore = data.results.length === pageSize;
    offset += pageSize;
    
    // Rate limiting protection
    await sleep(100); // 100ms tussen requests
  }
  
  return allData;
}

// Cursor-based pagination (efficiënter)
async function* fetchAllDataCursor(apiUrl, pageSize = 100) {
  let cursor = null;
  
  while (true) {
    const params = new URLSearchParams({
      limit: pageSize,
      ...(cursor && { cursor })
    });
    
    const response = await fetch(\`\${apiUrl}?\${params}\`);
    const data = await response.json();
    
    // Yield current page data
    yield* data.results;
    
    // Update cursor voor volgende pagina
    cursor = data.nextCursor;
    
    if (!cursor) break;
    
    // Rate limiting
    await sleep(100);
  }
}

// Gebruik met async iterator
async function processLargeDataset() {
  for await (const record of fetchAllDataCursor('/api/data')) {
    await processRecord(record);
    
    // Memory blijft laag omdat we maar één pagina tegelijk in geheugen hebben
  }
}
\`\`\`

### GraphQL Pagination

\`\`\`javascript
// GraphQL cursor-based pagination
async function* fetchGraphQLData(client, query, variables = {}) {
  let hasNextPage = true;
  let endCursor = null;
  
  while (hasNextPage) {
    const result = await client.request(query, {
      ...variables,
      after: endCursor
    });
    
    const { edges, pageInfo } = result.data.repository.issues;
    
    // Yield current page items
    for (const edge of edges) {
      yield edge.node;
    }
    
    hasNextPage = pageInfo.hasNextPage;
    endCursor = pageInfo.endCursor;
  }
}

// GraphQL query met pagination
const ISSUES_QUERY = \`
  query GetIssues($owner: String!, $repo: String!, $after: String) {
    repository(owner: $owner, name: $repo) {
      issues(first: 100, after: $after) {
        edges {
          node {
            id
            title
            body
            createdAt
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
\`;
\`\`\`

## 3. Batch Processing

Verwerk meerdere records tegelijk voor betere performance, maar balanceer tussen efficiency en geheugengebruik.

### Implementatie van batch processing

\`\`\`javascript
class BatchProcessor {
  constructor(options = {}) {
    this.batchSize = options.batchSize || 100;
    this.flushInterval = options.flushInterval || 5000; // 5 seconden
    this.batch = [];
    this.processing = false;
    
    // Auto-flush op interval
    this.intervalId = setInterval(() => {
      if (this.batch.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }
  
  async add(item) {
    this.batch.push(item);
    
    // Flush wanneer batch vol is
    if (this.batch.length >= this.batchSize) {
      await this.flush();
    }
  }
  
  async flush() {
    if (this.batch.length === 0 || this.processing) return;
    
    this.processing = true;
    const itemsToProcess = [...this.batch];
    this.batch = [];
    
    try {
      await this.processBatch(itemsToProcess);
    } catch (error) {
      console.error('Batch processing error:', error);
      // Optioneel: voeg items terug voor retry
      this.batch.unshift(...itemsToProcess);
    } finally {
      this.processing = false;
    }
  }
  
  async processBatch(items) {
    // Bulk insert in database
    await db.collection('records').insertMany(items);
    
    // Of bulk API call
    await fetch('/api/bulk-process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records: items })
    });
  }
  
  destroy() {
    clearInterval(this.intervalId);
    this.flush(); // Process remaining items
  }
}

// Gebruik in webhook handler
const processor = new BatchProcessor({ batchSize: 500 });

app.post('/webhook/stream', async (req, res) => {
  req
    .pipe(JSONStream.parse('items.*'))
    .on('data', async (item) => {
      await processor.add(item);
    })
    .on('end', async () => {
      await processor.flush(); // Process laatste items
      res.json({ status: 'completed' });
    });
});
\`\`\`

### Database bulk operations

\`\`\`javascript
// MongoDB bulk operations
async function bulkUpsert(records) {
  const bulkOps = records.map(record => ({
    updateOne: {
      filter: { _id: record.id },
      update: { $set: record },
      upsert: true
    }
  }));
  
  // Voer alle operations in één keer uit
  const result = await db.collection('records').bulkWrite(bulkOps);
  
  return {
    inserted: result.insertedCount,
    updated: result.modifiedCount
  };
}

// PostgreSQL bulk insert met conflict handling
async function bulkInsertPostgres(records) {
  const values = records.map(r => [r.id, r.name, r.data]);
  
  const query = \`
    INSERT INTO records (id, name, data)
    VALUES \${values.map((_, i) => 
      \`($\${i*3+1}, $\${i*3+2}, $\${i*3+3})\`
    ).join(', ')}
    ON CONFLICT (id) 
    DO UPDATE SET 
      name = EXCLUDED.name,
      data = EXCLUDED.data,
      updated_at = NOW()
  \`;
  
  await db.query(query, values.flat());
}
\`\`\`

## 4. Memory Optimization

Voorkom memory leaks en out-of-memory errors bij het verwerken van grote datasets.

### Memory monitoring en limits

\`\`\`javascript
// Monitor memory gebruik
function getMemoryUsage() {
  const used = process.memoryUsage();
  return {
    rss: Math.round(used.rss / 1024 / 1024), // MB
    heapTotal: Math.round(used.heapTotal / 1024 / 1024), // MB
    heapUsed: Math.round(used.heapUsed / 1024 / 1024), // MB
    external: Math.round(used.external / 1024 / 1024) // MB
  };
}

// Memory-aware processing
class MemoryAwareProcessor {
  constructor(maxMemoryMB = 500) {
    this.maxMemory = maxMemoryMB;
    this.queue = [];
    this.processing = false;
  }
  
  async process(item) {
    this.queue.push(item);
    
    if (!this.processing) {
      this.startProcessing();
    }
  }
  
  async startProcessing() {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const memory = getMemoryUsage();
      
      // Pause als memory te hoog is
      if (memory.heapUsed > this.maxMemory) {
        console.log('Memory limit reached, triggering GC...');
        
        // Force garbage collection (requires --expose-gc flag)
        if (global.gc) {
          global.gc();
        }
        
        // Wacht even
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Process next item
      const item = this.queue.shift();
      await this.processItem(item);
    }
    
    this.processing = false;
  }
  
  async processItem(item) {
    // Process logic hier
    await someAsyncOperation(item);
    
    // Explicitly null om GC te helpen
    item = null;
  }
}
\`\`\`

### Stream transformaties met backpressure

\`\`\`javascript
const { pipeline, Transform } = require('stream');
const { promisify } = require('util');
const pipelineAsync = promisify(pipeline);

// Transform stream met backpressure handling
class RateLimitedTransform extends Transform {
  constructor(options = {}) {
    super({ objectMode: true });
    this.rateLimit = options.rateLimit || 10; // items per seconde
    this.lastProcessTime = 0;
  }
  
  async _transform(chunk, encoding, callback) {
    // Bereken delay voor rate limiting
    const now = Date.now();
    const timeSinceLastProcess = now - this.lastProcessTime;
    const minInterval = 1000 / this.rateLimit;
    
    if (timeSinceLastProcess < minInterval) {
      await sleep(minInterval - timeSinceLastProcess);
    }
    
    try {
      // Process chunk
      const result = await this.processChunk(chunk);
      this.lastProcessTime = Date.now();
      
      callback(null, result);
    } catch (error) {
      callback(error);
    }
  }
  
  async processChunk(chunk) {
    // Implementeer processing logic
    return transformData(chunk);
  }
}

// Gebruik met pipeline voor automatic backpressure
app.post('/webhook/large-stream', async (req, res) => {
  try {
    await pipelineAsync(
      req,
      JSONStream.parse('records.*'),
      new RateLimitedTransform({ rateLimit: 100 }),
      new BatchTransform({ batchSize: 50 }),
      new DatabaseWriteStream()
    );
    
    res.json({ status: 'success' });
  } catch (error) {
    console.error('Pipeline error:', error);
    res.status(500).json({ error: error.message });
  }
});
\`\`\`

## 5. Parallel Processing

Gebruik meerdere CPU cores voor snellere verwerking van grote datasets.

### Worker Threads implementatie

\`\`\`javascript
const { Worker, isMainThread, parentPort } = require('worker_threads');
const os = require('os');

// Worker pool voor parallel processing
class WorkerPool {
  constructor(workerScript, poolSize = os.cpus().length) {
    this.workerScript = workerScript;
    this.poolSize = poolSize;
    this.workers = [];
    this.queue = [];
    this.activeWorkers = 0;
    
    this.initializeWorkers();
  }
  
  initializeWorkers() {
    for (let i = 0; i < this.poolSize; i++) {
      const worker = new Worker(this.workerScript);
      
      worker.on('message', (result) => {
        this.activeWorkers--;
        this.processQueue();
        
        // Resolve promise
        const task = this.queue.find(t => t.id === result.id);
        if (task) {
          task.resolve(result.data);
          this.queue = this.queue.filter(t => t.id !== result.id);
        }
      });
      
      worker.on('error', (error) => {
        console.error('Worker error:', error);
        this.activeWorkers--;
        this.processQueue();
      });
      
      this.workers.push(worker);
    }
  }
  
  async process(data) {
    return new Promise((resolve, reject) => {
      const task = {
        id: Math.random().toString(36),
        data,
        resolve,
        reject
      };
      
      this.queue.push(task);
      this.processQueue();
    });
  }
  
  processQueue() {
    while (this.queue.length > 0 && this.activeWorkers < this.poolSize) {
      const task = this.queue.shift();
      const worker = this.workers[this.activeWorkers];
      
      this.activeWorkers++;
      worker.postMessage({ id: task.id, data: task.data });
    }
  }
  
  async terminate() {
    await Promise.all(
      this.workers.map(worker => worker.terminate())
    );
  }
}

// Worker script (worker.js)
if (!isMainThread) {
  parentPort.on('message', async ({ id, data }) => {
    try {
      // Heavy processing
      const result = await processData(data);
      
      parentPort.postMessage({ id, data: result });
    } catch (error) {
      parentPort.postMessage({ id, error: error.message });
    }
  });
}

// Gebruik worker pool
const pool = new WorkerPool('./worker.js');

app.post('/webhook/parallel-process', async (req, res) => {
  const records = req.body.records;
  
  // Process records in parallel
  const promises = records.map(record => pool.process(record));
  const results = await Promise.all(promises);
  
  res.json({ 
    processed: results.length,
    results: results 
  });
});
\`\`\`

### Cluster module voor multi-process

\`\`\`javascript
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(\`Master \${process.pid} is running\`);
  
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(\`Worker \${worker.process.pid} died\`);
    // Restart worker
    cluster.fork();
  });
  
} else {
  // Worker processes
  const express = require('express');
  const app = express();
  
  app.use(express.json({ limit: '50mb' }));
  
  app.post('/webhook/process', async (req, res) => {
    console.log(\`Worker \${process.pid} processing request\`);
    
    // Each worker handles requests independently
    const result = await processLargeDataset(req.body);
    
    res.json({ 
      processedBy: process.pid,
      result 
    });
  });
  
  app.listen(3000, () => {
    console.log(\`Worker \${process.pid} started\`);
  });
}
\`\`\`

## Best Practices Samenvatting

### Do's ✅

1. **Stream grote datasets** in plaats van alles in geheugen te laden
2. **Implementeer pagination** correct met error handling
3. **Gebruik batch processing** voor database operations
4. **Monitor memory usage** en implementeer limits
5. **Parallelliseer** CPU-intensive taken

### Don'ts ❌

1. **Laad geen gigabytes** aan data in geheugen
2. **Vermijd synchroon processing** van grote datasets
3. **Vergeet geen backpressure** handling in streams
4. **Negeer geen memory leaks** in long-running processes
5. **Blokkeer de event loop niet** met zware berekeningen

## Praktijkvoorbeeld: Complete implementatie

\`\`\`javascript
// Complete webhook handler voor grote datasets
const { Transform, Writable } = require('stream');
const JSONStream = require('JSONStream');
const { Worker } = require('worker_threads');

class LargeDatasetHandler {
  constructor(options = {}) {
    this.batchSize = options.batchSize || 100;
    this.maxConcurrency = options.maxConcurrency || 4;
    this.maxMemoryMB = options.maxMemoryMB || 512;
    
    this.stats = {
      processed: 0,
      failed: 0,
      startTime: Date.now()
    };
  }
  
  async handleWebhook(req, res) {
    const processingStream = new Transform({
      objectMode: true,
      highWaterMark: this.batchSize,
      transform: async (chunk, encoding, callback) => {
        try {
          // Check memory
          if (this.isMemoryHigh()) {
            await this.waitForMemory();
          }
          
          // Process chunk
          await this.processChunk(chunk);
          this.stats.processed++;
          
          callback();
        } catch (error) {
          this.stats.failed++;
          callback(error);
        }
      }
    });
    
    const writeStream = new Writable({
      objectMode: true,
      write: async (chunk, encoding, callback) => {
        await this.saveResult(chunk);
        callback();
      }
    });
    
    // Setup pipeline
    req
      .pipe(JSONStream.parse('data.*'))
      .pipe(processingStream)
      .pipe(writeStream)
      .on('finish', () => {
        const duration = Date.now() - this.stats.startTime;
        res.json({
          success: true,
          stats: {
            ...this.stats,
            duration,
            throughput: Math.round(this.stats.processed / (duration / 1000))
          }
        });
      })
      .on('error', (error) => {
        console.error('Processing error:', error);
        res.status(500).json({ error: error.message });
      });
  }
  
  isMemoryHigh() {
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    return used > this.maxMemoryMB;
  }
  
  async waitForMemory() {
    if (global.gc) global.gc();
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  async processChunk(data) {
    // Implementeer processing logic
    return transformData(data);
  }
  
  async saveResult(result) {
    // Save to database of external service
    await db.collection('results').insertOne(result);
  }
}

// Gebruik
const handler = new LargeDatasetHandler({
  batchSize: 500,
  maxConcurrency: 8,
  maxMemoryMB: 1024
});

app.post('/webhook/large-dataset', (req, res) => {
  handler.handleWebhook(req, res);
});
\`\`\`

## Conclusie

Het efficiënt verwerken van grote datasets vereist een combinatie van technieken:

- **Streaming** voorkomt memory problemen
- **Pagination** maakt grote datasets beheersbaar
- **Batch processing** verhoogt throughput
- **Memory management** houdt je applicatie stabiel
- **Parallel processing** benut alle beschikbare resources

Door deze technieken te combineren kun je robuuste webhook handlers bouwen die schalen met je data volume.
`,
  codeExamples: [
    {
      id: 'stream-vs-buffer-example',
      title: 'Streaming vs Buffering vergelijking',
      language: 'javascript',
      code: `// ❌ SLECHT: Buffer alles in memory
app.post('/webhook/bad-approach', express.json({ limit: '1gb' }), async (req, res) => {
  try {
    // Dit kan crashen bij grote payloads!
    const allRecords = req.body.records; // Array met 1 miljoen items
    
    console.log(\`Processing \${allRecords.length} records...\`);
    
    // Process alle records in memory
    const results = allRecords.map(record => {
      return {
        ...record,
        processed: true,
        timestamp: new Date()
      };
    });
    
    // Save alles in één keer
    await database.bulkInsert(results);
    
    res.json({ processed: results.length });
  } catch (error) {
    // Waarschijnlijk: JavaScript heap out of memory
    res.status(500).json({ error: 'Out of memory' });
  }
});

// ✅ GOED: Stream-based processing
const JSONStream = require('JSONStream');
const { Transform } = require('stream');

app.post('/webhook/good-approach', (req, res) => {
  let processedCount = 0;
  const startTime = Date.now();
  
  // Create transform stream voor processing
  const processStream = new Transform({
    objectMode: true,
    transform: async (record, encoding, callback) => {
      try {
        // Process één record per keer
        const processed = {
          ...record,
          processed: true,
          timestamp: new Date()
        };
        
        // Save direct (of buffer in kleine batches)
        await database.insert(processed);
        
        processedCount++;
        
        // Log progress elke 1000 records
        if (processedCount % 1000 === 0) {
          const memUsage = process.memoryUsage();
          console.log(\`Processed: \${processedCount}, Memory: \${Math.round(memUsage.heapUsed / 1024 / 1024)}MB\`);
        }
        
        callback(null); // Geen data doorsturen, alleen tellen
      } catch (error) {
        callback(error);
      }
    }
  });
  
  // Setup streaming pipeline
  req
    .pipe(JSONStream.parse('records.*'))
    .pipe(processStream)
    .on('finish', () => {
      const duration = Date.now() - startTime;
      const throughput = Math.round(processedCount / (duration / 1000));
      
      res.json({ 
        processed: processedCount,
        durationMs: duration,
        recordsPerSecond: throughput
      });
    })
    .on('error', (error) => {
      console.error('Stream error:', error);
      res.status(500).json({ error: error.message });
    });
});`,
      explanation: 'Dit voorbeeld toont het verschil tussen het bufferen van alle data in memory (slecht) versus streaming (goed). Streaming gebruikt constant weinig memory ongeacht de grootte van de dataset.'
    },
    {
      id: 'pagination-complete-example',
      title: 'Complete pagination handler met verschillende patterns',
      language: 'javascript',
      code: `// Universele pagination handler voor verschillende API styles
class PaginationHandler {
  constructor(options = {}) {
    this.pageSize = options.pageSize || 100;
    this.maxPages = options.maxPages || Infinity;
    this.retryAttempts = options.retryAttempts || 3;
    this.rateLimitMs = options.rateLimitMs || 100;
  }
  
  // Offset-based pagination (bijv. limit/offset)
  async *fetchWithOffset(baseUrl, headers = {}) {
    let offset = 0;
    let pageCount = 0;
    
    while (pageCount < this.maxPages) {
      const url = \`\${baseUrl}?\${new URLSearchParams({
        limit: this.pageSize,
        offset: offset
      })}\`;
      
      try {
        const response = await this.fetchWithRetry(url, { headers });
        const data = await response.json();
        
        // Yield current page results
        if (data.results && data.results.length > 0) {
          yield* data.results;
          
          // Check for more data
          if (data.results.length < this.pageSize) {
            break; // No more data
          }
          
          offset += this.pageSize;
          pageCount++;
          
          // Rate limiting
          await this.sleep(this.rateLimitMs);
        } else {
          break; // No results
        }
      } catch (error) {
        console.error(\`Error fetching page at offset \${offset}:\`, error);
        throw error;
      }
    }
  }
  
  // Cursor-based pagination (meer efficiënt)
  async *fetchWithCursor(baseUrl, headers = {}) {
    let cursor = null;
    let pageCount = 0;
    
    while (pageCount < this.maxPages) {
      const params = new URLSearchParams({ 
        limit: this.pageSize,
        ...(cursor && { cursor })
      });
      
      const url = \`\${baseUrl}?\${params}\`;
      
      try {
        const response = await this.fetchWithRetry(url, { headers });
        const data = await response.json();
        
        // Yield current page results
        if (data.items && data.items.length > 0) {
          yield* data.items;
          
          // Update cursor for next page
          if (data.nextCursor) {
            cursor = data.nextCursor;
            pageCount++;
            await this.sleep(this.rateLimitMs);
          } else {
            break; // No more pages
          }
        } else {
          break;
        }
      } catch (error) {
        console.error(\`Error fetching page with cursor \${cursor}:\`, error);
        throw error;
      }
    }
  }
  
  // Link header-based pagination (GitHub style)
  async *fetchWithLinkHeader(startUrl, headers = {}) {
    let nextUrl = startUrl;
    let pageCount = 0;
    
    while (nextUrl && pageCount < this.maxPages) {
      try {
        const response = await this.fetchWithRetry(nextUrl, { headers });
        const data = await response.json();
        
        // Yield current page
        yield* data;
        
        // Parse Link header for next page
        const linkHeader = response.headers.get('Link');
        nextUrl = this.parseNextLink(linkHeader);
        
        if (nextUrl) {
          pageCount++;
          await this.sleep(this.rateLimitMs);
        }
      } catch (error) {
        console.error(\`Error fetching \${nextUrl}:\`, error);
        throw error;
      }
    }
  }
  
  // Helper: Parse Link header
  parseNextLink(linkHeader) {
    if (!linkHeader) return null;
    
    const links = linkHeader.split(',').map(link => {
      const [url, rel] = link.split(';').map(s => s.trim());
      const urlMatch = url.match(/<(.+)>/);
      const relMatch = rel.match(/rel="(.+)"/);
      
      return {
        url: urlMatch ? urlMatch[1] : null,
        rel: relMatch ? relMatch[1] : null
      };
    });
    
    const nextLink = links.find(link => link.rel === 'next');
    return nextLink ? nextLink.url : null;
  }
  
  // Helper: Fetch with retry logic
  async fetchWithRetry(url, options, attempt = 1) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      
      return response;
    } catch (error) {
      if (attempt < this.retryAttempts) {
        console.log(\`Retry attempt \${attempt} for \${url}\`);
        await this.sleep(1000 * attempt); // Exponential backoff
        return this.fetchWithRetry(url, options, attempt + 1);
      }
      throw error;
    }
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Gebruik voorbeelden
async function demonstratePagination() {
  const paginator = new PaginationHandler({
    pageSize: 50,
    rateLimitMs: 200
  });
  
  // Voorbeeld 1: Offset-based
  console.log('Fetching with offset pagination...');
  for await (const item of paginator.fetchWithOffset('https://api.example.com/data')) {
    console.log('Processing item:', item.id);
  }
  
  // Voorbeeld 2: Cursor-based
  console.log('Fetching with cursor pagination...');
  for await (const item of paginator.fetchWithCursor('https://api.example.com/v2/data')) {
    console.log('Processing item:', item.id);
  }
  
  // Voorbeeld 3: Link header (GitHub)
  console.log('Fetching GitHub issues...');
  const githubHeaders = {
    'Authorization': \`token \${process.env.GITHUB_TOKEN}\`,
    'Accept': 'application/vnd.github.v3+json'
  };
  
  for await (const issue of paginator.fetchWithLinkHeader(
    'https://api.github.com/repos/microsoft/vscode/issues?per_page=30',
    githubHeaders
  )) {
    console.log(\`Issue #\${issue.number}: \${issue.title}\`);
  }
}`,
      explanation: 'Deze PaginationHandler class ondersteunt verschillende pagination patterns die je tegenkomt bij APIs. Het bevat retry logic, rate limiting, en verschillende pagination strategieën.'
    },
    {
      id: 'batch-processor-advanced',
      title: 'Geavanceerde batch processor met error handling',
      language: 'javascript',
      code: `// Productie-ready batch processor
class AdvancedBatchProcessor {
  constructor(options = {}) {
    this.batchSize = options.batchSize || 100;
    this.flushInterval = options.flushInterval || 5000;
    this.maxRetries = options.maxRetries || 3;
    this.onError = options.onError || console.error;
    this.onSuccess = options.onSuccess || (() => {});
    
    this.batches = new Map(); // Multiple typed batches
    this.metrics = {
      processed: 0,
      failed: 0,
      retries: 0
    };
    
    // Start flush interval
    this.intervalId = setInterval(() => this.flushAll(), this.flushInterval);
  }
  
  // Add item to typed batch
  async add(type, item) {
    if (!this.batches.has(type)) {
      this.batches.set(type, {
        items: [],
        processing: false
      });
    }
    
    const batch = this.batches.get(type);
    batch.items.push({
      data: item,
      attempts: 0,
      addedAt: Date.now()
    });
    
    // Auto-flush when batch is full
    if (batch.items.length >= this.batchSize) {
      await this.flush(type);
    }
  }
  
  // Flush specific batch type
  async flush(type) {
    const batch = this.batches.get(type);
    if (!batch || batch.items.length === 0 || batch.processing) {
      return;
    }
    
    batch.processing = true;
    const itemsToProcess = [...batch.items];
    batch.items = [];
    
    try {
      // Process with retry logic
      const { success, failed } = await this.processBatchWithRetry(
        type, 
        itemsToProcess
      );
      
      // Update metrics
      this.metrics.processed += success.length;
      this.metrics.failed += failed.length;
      
      // Handle failed items
      if (failed.length > 0) {
        await this.handleFailedItems(type, failed);
      }
      
      // Callback
      this.onSuccess(type, success);
      
    } catch (error) {
      this.onError(error);
      // Return items to batch for retry
      batch.items.unshift(...itemsToProcess);
    } finally {
      batch.processing = false;
    }
  }
  
  // Process batch with retry logic
  async processBatchWithRetry(type, items, attempt = 1) {
    try {
      // Implementeer je eigen batch processing logic
      const results = await this.executeBatch(type, items);
      
      return {
        success: items.filter((_, i) => results[i].success),
        failed: items.filter((_, i) => !results[i].success)
      };
      
    } catch (error) {
      if (attempt < this.maxRetries) {
        this.metrics.retries++;
        
        // Exponential backoff
        await this.sleep(Math.pow(2, attempt) * 1000);
        
        return this.processBatchWithRetry(type, items, attempt + 1);
      }
      
      // Max retries reached
      return {
        success: [],
        failed: items
      };
    }
  }
  
  // Execute batch based on type
  async executeBatch(type, items) {
    const data = items.map(item => item.data);
    
    switch (type) {
      case 'database':
        return this.executeDatabaseBatch(data);
        
      case 'api':
        return this.executeApiBatch(data);
        
      case 'email':
        return this.executeEmailBatch(data);
        
      default:
        throw new Error(\`Unknown batch type: \${type}\`);
    }
  }
  
  // Database batch operations
  async executeDatabaseBatch(records) {
    const results = [];
    
    try {
      // Begin transaction
      await db.query('BEGIN');
      
      for (const record of records) {
        try {
          await db.query(
            'INSERT INTO records (data) VALUES ($1) ON CONFLICT DO UPDATE',
            [JSON.stringify(record)]
          );
          results.push({ success: true });
        } catch (error) {
          results.push({ success: false, error });
        }
      }
      
      // Commit transaction
      await db.query('COMMIT');
      
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
    
    return results;
  }
  
  // API batch operations
  async executeApiBatch(items) {
    const response = await fetch('/api/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    
    const results = await response.json();
    return results.map(r => ({ success: r.status === 'ok' }));
  }
  
  // Email batch operations
  async executeEmailBatch(emails) {
    // Implementeer email batch sending
    return emails.map(() => ({ success: true }));
  }
  
  // Handle permanently failed items
  async handleFailedItems(type, items) {
    // Log to dead letter queue
    for (const item of items) {
      await this.saveToDeadLetterQueue(type, item);
    }
  }
  
  // Save to dead letter queue
  async saveToDeadLetterQueue(type, item) {
    await db.query(
      'INSERT INTO dead_letter_queue (type, data, error, created_at) VALUES ($1, $2, $3, $4)',
      [type, JSON.stringify(item.data), item.error, new Date()]
    );
  }
  
  // Flush all batches
  async flushAll() {
    const promises = [];
    
    for (const [type] of this.batches) {
      promises.push(this.flush(type));
    }
    
    await Promise.all(promises);
  }
  
  // Get metrics
  getMetrics() {
    return {
      ...this.metrics,
      batches: Array.from(this.batches.entries()).map(([type, batch]) => ({
        type,
        pending: batch.items.length,
        processing: batch.processing
      }))
    };
  }
  
  // Cleanup
  async destroy() {
    clearInterval(this.intervalId);
    await this.flushAll();
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Gebruik in productie
const processor = new AdvancedBatchProcessor({
  batchSize: 500,
  flushInterval: 3000,
  maxRetries: 3,
  onError: (error) => {
    console.error('Batch processing error:', error);
    // Send to monitoring service
    monitoring.logError(error);
  },
  onSuccess: (type, items) => {
    console.log(\`Successfully processed \${items.length} \${type} items\`);
  }
});

// Webhook handler
app.post('/webhook/events', async (req, res) => {
  const events = req.body.events;
  
  for (const event of events) {
    // Route to appropriate batch
    switch (event.type) {
      case 'order.created':
        await processor.add('database', event);
        break;
        
      case 'user.updated':
        await processor.add('api', event);
        break;
        
      case 'notification.send':
        await processor.add('email', event);
        break;
    }
  }
  
  // Return metrics
  res.json({
    received: events.length,
    metrics: processor.getMetrics()
  });
});`,
      explanation: 'Deze AdvancedBatchProcessor biedt productie-ready batch processing met meerdere batch types, retry logic, dead letter queue, en uitgebreide metrics.'
    }
  ],
  assignments: [
    {
      id: 'implement-stream-processor',
      title: 'Implementeer een stream processor',
      description: 'Bouw een webhook endpoint die een CSV file van 1GB kan streamen en verwerken zonder meer dan 100MB RAM te gebruiken. Meet en log het memory gebruik tijdens processing.',
      difficulty: 'hard',
      type: 'project'
    },
    {
      id: 'pagination-handler',
      title: 'Universele pagination handler',
      description: 'Schrijf een pagination handler die automatisch detecteert welk type pagination een API gebruikt (offset, cursor, of link header) en de juiste strategie toepast.',
      difficulty: 'medium',
      type: 'project'
    },
    {
      id: 'optimize-batch-processor',
      title: 'Optimaliseer batch processing',
      description: 'Gegeven een webhook die 10,000 records per seconde ontvangt, ontwerp een batch processing systeem dat deze throughput aankan met minimale latency. Include benchmarks.',
      difficulty: 'hard',
      type: 'project'
    }
  ],
  resources: [
    {
      title: 'Node.js Streams documentation',
      url: 'https://nodejs.org/api/stream.html',
      type: 'documentation'
    },
    {
      title: 'JSONStream - Streaming JSON parser',
      url: 'https://github.com/dominictarr/JSONStream',
      type: 'library'
    },
    {
      title: 'Understanding backpressure in Node.js',
      url: 'https://nodejs.org/en/docs/guides/backpressuring-in-streams/',
      type: 'article'
    },
    {
      title: 'Worker Threads documentation',
      url: 'https://nodejs.org/api/worker_threads.html',
      type: 'documentation'
    }
  ]
};