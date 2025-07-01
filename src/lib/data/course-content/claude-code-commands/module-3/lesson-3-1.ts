import type { Lesson } from '@/lib/data/courses';

export const lesson3_1: Lesson = {
  id: 'lesson-3-1',
  title: 'Intelligente bug detection',
  duration: '35 min',
  content: `
# Intelligente Bug Detection met Claude Code

Claude Code's AI-powered debugging capabilities kunnen automatisch complexe bugs detecteren en analyseren die traditionele tools vaak missen. In deze les leer je hoe Claude Code patronen herkent, root causes identificeert en oplossingen voorstelt.

## Automatic Error Pattern Recognition

Claude Code herkent automatisch veelvoorkomende en complexe error patterns in je code:

### Pattern Detection Capabilities
- **Syntax patterns**: Subtiele syntax fouten die compilers missen
- **Logic patterns**: Incorrecte business logic implementaties
- **Anti-patterns**: Code smells en problematische design patterns
- **Performance patterns**: Inefficiënte algoritmes en bottlenecks

### Activeren van Pattern Recognition
\`\`\`bash
# Scan hele project voor error patterns
claude debug --patterns

# Focus op specifieke directory
claude debug src/ --patterns --deep

# Real-time pattern monitoring
claude debug --watch --patterns
\`\`\`

### Voorbeeld: Async Pattern Detection
\`\`\`javascript
// Claude detecteert: Missing await in async chain
async function processUserData(userId) {
  const user = getUser(userId); // ❌ Missing await
  const profile = await getProfile(user.id); // Will fail
  return profile;
}

// Claude's suggestie:
async function processUserData(userId) {
  const user = await getUser(userId); // ✅ Added await
  const profile = await getProfile(user.id);
  return profile;
}
\`\`\`

## Root Cause Analysis

Claude Code gaat verder dan symptomen en identificeert de werkelijke oorzaak van bugs:

### Deep Analysis Process
1. **Symptom identification**: Wat gaat er mis?
2. **Trace backwards**: Volg de execution flow
3. **Identify origin**: Vind waar het probleem begint
4. **Context analysis**: Begrijp waarom het gebeurt

### Root Cause Analysis Command
\`\`\`bash
# Analyseer een specifieke error
claude debug --analyze "TypeError: Cannot read property 'x' of undefined"

# Analyseer met stack trace
claude debug --analyze-trace error.log

# Interactieve root cause sessie
claude debug --interactive --root-cause
\`\`\`

### Complex Voorbeeld: Cascading Failures
\`\`\`javascript
// Probleem: Applicatie crasht random bij user actions
class EventManager {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    // Bug: No check if listeners exist
    this.listeners.get(event).forEach(cb => cb(data));
  }

  off(event, callback) {
    // Bug: Doesn't handle cleanup properly
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    callbacks.splice(index, 1);
  }
}

// Claude's root cause analysis:
// 1. emit() crashes when event has no listeners
// 2. off() doesn't check if callbacks exist
// 3. off() doesn't clean up empty arrays
// 4. Memory leak: empty arrays remain in Map
\`\`\`

## Stack Trace Interpretation

Claude Code maakt complexe stack traces begrijpelijk en actionable:

### Stack Trace Analysis Features
- **Noise reduction**: Filter irrelevante framework calls
- **Path highlighting**: Markeer je eigen code in de trace
- **Variable state**: Toon variabele waarden op crash moment
- **Suggestion generation**: Concrete fix suggesties

### Stack Trace Commands
\`\`\`bash
# Analyseer stack trace uit file
claude debug trace error.log

# Parse en vereenvoudig stack trace
claude debug trace --simplify

# Genereer fix suggesties
claude debug trace --suggest-fixes
\`\`\`

### Voorbeeld: Complex Stack Trace
\`\`\`
Error: Maximum call stack size exceeded
    at AsyncSeriesWaterfallHook.eval (webpack://./node_modules/tapable/lib/AsyncSeriesWaterfallHook.js:36:15)
    at AsyncSeriesWaterfallHook.lazyCompileHook (webpack://./node_modules/tapable/lib/Hook.js:154:20)
    at userAuthentication (/src/middleware/auth.js:45:12)
    at processRequest (/src/middleware/auth.js:23:8)
    at userAuthentication (/src/middleware/auth.js:47:16)
    ... 10000 more lines

Claude's interpretatie:
"Infinite recursion gedetecteerd in userAuthentication functie.
De functie roept zichzelf aan op regel 47 zonder exit conditie.
Waarschijnlijke oorzaak: middleware wordt twee keer geregistreerd."
\`\`\`

## Memory Leak Detection

Claude Code identificeert memory leaks door heap analysis en object lifecycle tracking:

### Memory Leak Detection Capabilities
- **Heap growth analysis**: Detecteer abnormale memory groei
- **Reference tracking**: Vind objecten die niet vrijgegeven worden
- **Event listener leaks**: Identificeer vergeten cleanup
- **Closure leaks**: Spot problematische closures

### Memory Analysis Commands
\`\`\`bash
# Start memory profiling
claude debug memory --profile

# Analyseer heap dump
claude debug memory --analyze heap-dump.json

# Monitor memory in real-time
claude debug memory --monitor --threshold 100MB
\`\`\`

### Complex Memory Leak Voorbeeld
\`\`\`javascript
// Memory leak door event listeners en closures
class DataProcessor {
  constructor() {
    this.cache = new Map();
    this.results = [];
  }

  processLargeDataset(data) {
    data.forEach((item, index) => {
      // Leak 1: Closure houdt hele data array vast
      const processor = () => {
        return data.filter(d => d.id === item.id);
      };
      
      // Leak 2: Event listener wordt nooit verwijderd
      globalEventBus.on('process', processor);
      
      // Leak 3: Cache groeit onbeperkt
      this.cache.set(\`item-\${index}\`, {
        data: item,
        processor: processor,
        timestamp: Date.now()
      });
    });
  }

  // Geen cleanup method!
}

// Claude's detectie en oplossing:
class DataProcessor {
  constructor() {
    this.cache = new Map();
    this.results = [];
    this.listeners = new Map(); // Track listeners
  }

  processLargeDataset(data) {
    data.forEach((item, index) => {
      // Fix 1: Gebruik alleen benodigde data
      const itemId = item.id;
      const processor = () => {
        return this.cache.get(\`item-\${index}\`)?.data;
      };
      
      // Fix 2: Track listener voor cleanup
      globalEventBus.on('process', processor);
      this.listeners.set(\`process-\${index}\`, processor);
      
      // Fix 3: Implementeer cache limiet
      if (this.cache.size > 1000) {
        const oldestKey = this.cache.keys().next().value;
        this.cache.delete(oldestKey);
      }
      
      this.cache.set(\`item-\${index}\`, {
        data: item,
        timestamp: Date.now()
      });
    });
  }

  cleanup() {
    // Verwijder alle event listeners
    this.listeners.forEach((listener, key) => {
      globalEventBus.off(key.split('-')[0], listener);
    });
    this.listeners.clear();
    this.cache.clear();
  }
}
\`\`\`

## Race Condition Identification

Claude Code detecteert race conditions door async flow analysis en timing simulation:

### Race Condition Detection
- **Async flow analysis**: Visualiseer async execution paths
- **Shared state detection**: Identificeer problematische shared resources
- **Timing simulation**: Test verschillende execution orders
- **Lock suggestions**: Stel synchronisatie oplossingen voor

### Race Condition Commands
\`\`\`bash
# Scan voor race conditions
claude debug race-conditions

# Analyseer specifieke async flow
claude debug async --analyze src/services/

# Simuleer verschillende timings
claude debug race --simulate --iterations 1000
\`\`\`

### Complex Race Condition Voorbeeld
\`\`\`javascript
// Race condition in order processing
class OrderService {
  constructor() {
    this.inventory = new Map();
    this.processing = new Set();
  }

  async processOrder(orderId, items) {
    // Race condition: Multiple orders kunnen tegelijk draaien
    for (const item of items) {
      const stock = await this.checkStock(item.productId);
      
      if (stock >= item.quantity) {
        // Critical section zonder locking!
        await this.updateStock(item.productId, stock - item.quantity);
        await this.reserveItem(orderId, item);
      } else {
        throw new Error(\`Insufficient stock for \${item.productId}\`);
      }
    }
  }

  async checkStock(productId) {
    // Simuleert database call
    await delay(Math.random() * 100);
    return this.inventory.get(productId) || 0;
  }

  async updateStock(productId, newStock) {
    // Simuleert database update
    await delay(Math.random() * 100);
    this.inventory.set(productId, newStock);
  }
}

// Claude's race condition fix met locking:
class OrderService {
  constructor() {
    this.inventory = new Map();
    this.processing = new Set();
    this.locks = new Map(); // Product-level locks
  }

  async acquireLock(productId) {
    while (this.locks.get(productId)) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    this.locks.set(productId, true);
  }

  releaseLock(productId) {
    this.locks.delete(productId);
  }

  async processOrder(orderId, items) {
    const acquiredLocks = [];
    
    try {
      // Acquire locks for all products first (in sorted order to prevent deadlock)
      const sortedItems = [...items].sort((a, b) => a.productId.localeCompare(b.productId));
      
      for (const item of sortedItems) {
        await this.acquireLock(item.productId);
        acquiredLocks.push(item.productId);
      }

      // Process with locks held
      for (const item of items) {
        const stock = await this.checkStock(item.productId);
        
        if (stock >= item.quantity) {
          await this.updateStock(item.productId, stock - item.quantity);
          await this.reserveItem(orderId, item);
        } else {
          throw new Error(\`Insufficient stock for \${item.productId}\`);
        }
      }
    } finally {
      // Always release locks
      acquiredLocks.forEach(productId => this.releaseLock(productId));
    }
  }
}
\`\`\`

## Best Practices voor AI-Powered Debugging

### 1. Proactieve Bug Detection
\`\`\`bash
# Setup pre-commit hook
claude debug install-hooks

# Continuous monitoring
claude debug monitor --notify slack
\`\`\`

### 2. Debug Session Management
\`\`\`bash
# Start debug sessie met context
claude debug session start --name "memory-leak-investigation"

# Sla findings op
claude debug session save

# Deel met team
claude debug session export --format markdown
\`\`\`

### 3. Integration met Development Workflow
- Gebruik Claude's debug mode tijdens development
- Integreer met je CI/CD pipeline
- Setup automatic bug reports
- Configureer smart notifications

## Oefening: Debug een Production Bug

Gebruik Claude Code om deze production bug te analyseren:
\`\`\`javascript
// Users report: "App becomes unresponsive after ~5 minutes"
// Memory usage grows from 50MB to 2GB
// No obvious errors in logs

// Start je onderzoek met:
claude debug investigate --symptom "unresponsive after 5 min" --memory-growth
\`\`\`

## Samenvatting

Claude Code's intelligente bug detection capabilities:
- **Pattern Recognition**: Herkent complexe error patterns automatisch
- **Root Cause Analysis**: Vindt de echte oorzaak, niet alleen symptomen  
- **Stack Trace Intelligence**: Maakt complexe traces begrijpelijk
- **Memory Leak Detection**: Identificeert en lost memory leaks op
- **Race Condition Finding**: Detecteert en voorkomt race conditions

Met deze tools kun je bugs sneller vinden en oplossen dan ooit tevoren!
        `,
  codeExamples: [
    {
      id: 'example-3-1-1',
      title: 'Automatic Error Pattern Recognition',
      language: 'javascript',
      code: `// Probleem: Subtiele async/await bug
class UserService {
  async getUsers() {
    const users = await db.query('SELECT * FROM users');
    return users.map(user => {
      // Bug: vergeten await in map
      user.profile = this.getProfile(user.id);
      return user;
    });
  }

  async getProfile(userId) {
    return await db.query('SELECT * FROM profiles WHERE userId = ?', [userId]);
  }
}

// Claude detecteert en corrigeert:
class UserService {
  async getUsers() {
    const users = await db.query('SELECT * FROM users');
    // Fix: gebruik Promise.all met async map
    return await Promise.all(users.map(async (user) => {
      user.profile = await this.getProfile(user.id);
      return user;
    }));
  }

  async getProfile(userId) {
    return await db.query('SELECT * FROM profiles WHERE userId = ?', [userId]);
  }
}`,
      explanation: 'Claude herkent dat async operaties binnen een map() functie niet correct afgehandeld worden. De AI detecteert dat getProfile() een Promise returnt maar niet ge-await wordt, waardoor user.profile een Promise object wordt in plaats van de werkelijke data. Claude stelt een fix voor met Promise.all() en async/await in de map functie.'
    },
    {
      id: 'example-3-1-2',
      title: 'Memory Leak Detection in Event System',
      language: 'typescript',
      code: `// Memory leak door niet verwijderde event listeners
class RealtimeChart {
  private data: number[] = [];
  private updateHandlers: Map<string, Function> = new Map();

  constructor(private eventBus: EventEmitter) {
    this.setupListeners();
  }

  private setupListeners() {
    // Memory leak: listeners worden nooit verwijderd
    this.eventBus.on('data-update', (newData) => {
      this.data.push(...newData);
      this.render();
    });

    // Memory leak: closure houdt hele class instance vast
    setInterval(() => {
      this.eventBus.emit('chart-tick', {
        timestamp: Date.now(),
        data: this.data // Houdt alle historische data vast!
      });
    }, 1000);
  }

  render() {
    // Render logic
  }
}

// Claude's memory-safe implementatie:
class RealtimeChart {
  private data: number[] = [];
  private updateHandlers: Map<string, Function> = new Map();
  private intervalId: NodeJS.Timeout | null = null;
  private maxDataPoints = 1000; // Limiteer data grootte

  constructor(private eventBus: EventEmitter) {
    this.setupListeners();
  }

  private setupListeners() {
    // Sla listener referentie op voor cleanup
    const dataUpdateHandler = (newData: number[]) => {
      this.data.push(...newData);
      
      // Beperk array grootte om memory leak te voorkomen
      if (this.data.length > this.maxDataPoints) {
        this.data = this.data.slice(-this.maxDataPoints);
      }
      
      this.render();
    };

    this.updateHandlers.set('data-update', dataUpdateHandler);
    this.eventBus.on('data-update', dataUpdateHandler);

    // Sla interval ID op voor cleanup
    this.intervalId = setInterval(() => {
      this.eventBus.emit('chart-tick', {
        timestamp: Date.now(),
        // Stuur alleen recente data, niet hele array
        data: this.data.slice(-10)
      });
    }, 1000);
  }

  render() {
    // Render logic
  }

  // Cleanup method om memory leaks te voorkomen
  destroy() {
    // Verwijder alle event listeners
    this.updateHandlers.forEach((handler, event) => {
      this.eventBus.off(event, handler);
    });
    this.updateHandlers.clear();

    // Stop interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Clear data
    this.data = [];
  }
}`,
      explanation: 'Claude identificeert meerdere memory leaks: event listeners die nooit verwijderd worden, een setInterval zonder cleanup, en onbeperkte data groei. De oplossing implementeert proper cleanup met een destroy() method, beperkt data grootte, en houdt referenties bij voor alle listeners en timers.'
    },
    {
      id: 'example-3-1-3',
      title: 'Race Condition in Concurrent Updates',
      language: 'javascript',
      code: `// Race condition in collaborative editing
class DocumentEditor {
  constructor() {
    this.content = '';
    this.version = 0;
  }

  async updateContent(userId, changes) {
    // Race condition: concurrent updates overschrijven elkaar
    const currentContent = await this.loadContent();
    const newContent = this.applyChanges(currentContent, changes);
    
    // Tijd tussen read en write = race condition window!
    await this.saveContent(newContent);
    this.version++;
    
    await this.notifyUsers(userId, changes);
  }

  async loadContent() {
    // Simuleert database read
    await delay(50);
    return this.content;
  }

  async saveContent(content) {
    // Simuleert database write  
    await delay(100);
    this.content = content;
  }
}

// Claude's oplossing met optimistic locking:
class DocumentEditor {
  constructor() {
    this.content = '';
    this.version = 0;
    this.locks = new Map();
  }

  async updateContent(userId, changes) {
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        // Atomic read with version
        const { content: currentContent, version: currentVersion } = 
          await this.loadContentWithVersion();
        
        // Apply changes
        const newContent = this.applyChanges(currentContent, changes);
        
        // Conditional update - only if version matches
        const updated = await this.saveContentIfVersionMatches(
          newContent, 
          currentVersion
        );

        if (updated) {
          await this.notifyUsers(userId, changes);
          return { success: true, version: currentVersion + 1 };
        }

        // Version mismatch - retry with exponential backoff
        retries++;
        await delay(Math.pow(2, retries) * 100);
        
      } catch (error) {
        console.error('Update failed:', error);
        throw error;
      }
    }

    throw new Error('Failed to update after max retries - too many concurrent edits');
  }

  async loadContentWithVersion() {
    await delay(50);
    return { 
      content: this.content, 
      version: this.version 
    };
  }

  async saveContentIfVersionMatches(content, expectedVersion) {
    await delay(100);
    
    // Atomic check-and-set
    if (this.version === expectedVersion) {
      this.content = content;
      this.version++;
      return true;
    }
    
    return false;
  }

  // Alternative: gebruik queue voor serialization
  async queuedUpdate(userId, changes) {
    return await this.updateQueue.add(async () => {
      const currentContent = await this.loadContent();
      const newContent = this.applyChanges(currentContent, changes);
      await this.saveContent(newContent);
      this.version++;
      await this.notifyUsers(userId, changes);
    });
  }
}`,
      explanation: 'Claude detecteert een klassieke read-modify-write race condition waarbij concurrent updates elkaar kunnen overschrijven. De oplossing implementeert optimistic locking met version checking en retry logic. Als alternatief wordt ook een queue-based approach getoond die updates serialiseert.'
    }
  ],
  assignments: [
    {
      id: 'assignment-3-1',
      title: 'Debug een Complex Memory Leak',
      description: 'Gebruik Claude Code om een memory leak te vinden en op te lossen in een Node.js applicatie. De app gebruikt steeds meer geheugen en crasht na enkele uren.',
      difficulty: 'hard',
      type: 'code',
      initialCode: `// Production code met memory leak
// Symptomen: Memory groeit van 100MB naar 4GB in 2 uur
// App wordt trager en crasht uiteindelijk

const express = require('express');
const app = express();

// Global caches en data structures
const userSessions = new Map();
const requestCache = new Map();
const analyticsData = [];

class SessionManager {
  constructor() {
    this.activeSessions = new Map();
    this.sessionTimers = new Map();
  }

  createSession(userId, userData) {
    const sessionId = generateSessionId();
    
    // Store session
    this.activeSessions.set(sessionId, {
      userId,
      userData,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      requests: []
    });

    // Setup activity monitoring
    const timer = setInterval(() => {
      const session = this.activeSessions.get(sessionId);
      if (session) {
        // Check for inactivity
        if (Date.now() - session.lastActivity > 30 * 60 * 1000) {
          console.log(\`Session \${sessionId} inactive\`);
        }
      }
    }, 60000);

    this.sessionTimers.set(sessionId, timer);
    userSessions.set(userId, sessionId);
    
    return sessionId;
  }

  updateActivity(sessionId, requestData) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
      session.requests.push(requestData);
    }
  }
}

const sessionManager = new SessionManager();

// API endpoints
app.post('/login', async (req, res) => {
  const { userId, userData } = req.body;
  const sessionId = sessionManager.createSession(userId, userData);
  
  res.json({ sessionId });
});

app.use((req, res, next) => {
  const sessionId = req.headers['session-id'];
  
  // Cache all requests
  const requestId = generateRequestId();
  requestCache.set(requestId, {
    url: req.url,
    method: req.method,
    headers: req.headers,
    body: req.body,
    timestamp: Date.now()
  });

  // Update session activity
  if (sessionId) {
    sessionManager.updateActivity(sessionId, {
      requestId,
      url: req.url,
      timestamp: Date.now()
    });
  }

  // Collect analytics
  analyticsData.push({
    sessionId,
    requestId,
    url: req.url,
    timestamp: Date.now(),
    memoryUsage: process.memoryUsage()
  });

  next();
});

app.get('/data/:id', async (req, res) => {
  const { id } = req.params;
  
  // Simulated data fetch with caching
  let data = requestCache.get(\`data-\${id}\`);
  
  if (!data) {
    data = await fetchLargeDataset(id);
    requestCache.set(\`data-\${id}\`, data);
  }

  res.json(data);
});

// Background tasks
setInterval(() => {
  // "Cleanup" old sessions - but heeft bugs!
  for (const [sessionId, session] of sessionManager.activeSessions) {
    if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
      sessionManager.activeSessions.delete(sessionId);
      // Timers worden niet opgeruimd!
    }
  }
}, 60 * 60 * 1000);

// Helper functions
function generateSessionId() {
  return Math.random().toString(36).substr(2, 9);
}

function generateRequestId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

async function fetchLargeDataset(id) {
  // Simuleert grote dataset
  return new Array(10000).fill(null).map((_, i) => ({
    id: \`\${id}-\${i}\`,
    data: new Array(1000).fill(Math.random()),
    metadata: {
      created: new Date(),
      large: new Array(100).fill('x'.repeat(1000))
    }
  }));
}

// Start your debugging with:
// claude debug memory --profile
// claude debug investigate --memory-leak`,
      solution: `// Oplossing: Memory leaks gefixt
const express = require('express');
const app = express();

// Configureerbare limieten
const MAX_SESSIONS = 10000;
const MAX_CACHE_SIZE = 1000;
const MAX_ANALYTICS_RECORDS = 10000;
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minuten

// Gebruik WeakMap waar mogelijk voor automatic garbage collection
const userSessions = new Map();
const requestCache = new LRUCache(MAX_CACHE_SIZE); // LRU cache met size limit
const analyticsData = new CircularBuffer(MAX_ANALYTICS_RECORDS);

class SessionManager {
  constructor() {
    this.activeSessions = new Map();
    this.sessionTimers = new Map();
  }

  createSession(userId, userData) {
    const sessionId = generateSessionId();
    
    // Cleanup oude sessie van dezelfde user
    if (userSessions.has(userId)) {
      const oldSessionId = userSessions.get(userId);
      this.destroySession(oldSessionId);
    }

    // Beperk session data grootte
    this.activeSessions.set(sessionId, {
      userId,
      userData: this.sanitizeUserData(userData), // Limiteer data grootte
      createdAt: Date.now(),
      lastActivity: Date.now(),
      requests: new CircularBuffer(100) // Limiteer request history
    });

    // Setup activity monitoring met cleanup
    const timer = setInterval(() => {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        // Session bestaat niet meer, cleanup timer
        clearInterval(timer);
        this.sessionTimers.delete(sessionId);
        return;
      }

      // Auto-cleanup inactive sessions
      if (Date.now() - session.lastActivity > SESSION_TIMEOUT) {
        this.destroySession(sessionId);
      }
    }, 60000);

    this.sessionTimers.set(sessionId, timer);
    userSessions.set(userId, sessionId);
    
    // Enforce session limit
    if (this.activeSessions.size > MAX_SESSIONS) {
      this.cleanupOldestSessions();
    }
    
    return sessionId;
  }

  destroySession(sessionId) {
    // Proper cleanup
    this.activeSessions.delete(sessionId);
    
    // Stop en verwijder timer
    const timer = this.sessionTimers.get(sessionId);
    if (timer) {
      clearInterval(timer);
      this.sessionTimers.delete(sessionId);
    }

    // Cleanup user mapping
    for (const [userId, sid] of userSessions) {
      if (sid === sessionId) {
        userSessions.delete(userId);
        break;
      }
    }
  }

  cleanupOldestSessions() {
    // Verwijder oudste 10% sessions
    const sessions = Array.from(this.activeSessions.entries())
      .sort((a, b) => a[1].lastActivity - b[1].lastActivity);
    
    const toRemove = Math.floor(sessions.length * 0.1);
    for (let i = 0; i < toRemove; i++) {
      this.destroySession(sessions[i][0]);
    }
  }

  sanitizeUserData(userData) {
    // Beperk userData grootte
    const sanitized = {};
    const maxStringLength = 1000;
    
    for (const [key, value] of Object.entries(userData)) {
      if (typeof value === 'string' && value.length > maxStringLength) {
        sanitized[key] = value.substring(0, maxStringLength);
      } else if (typeof value === 'object') {
        // Shallow copy, geen deep nesting
        sanitized[key] = { ...value };
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  updateActivity(sessionId, requestData) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
      session.requests.push({
        url: requestData.url,
        timestamp: requestData.timestamp
        // Sla geen volledige request data op
      });
    }
  }
}

// LRU Cache implementatie
class LRUCache {
  constructor(maxSize) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  set(key, value) {
    // Delete en re-add om LRU order te behouden
    this.cache.delete(key);
    this.cache.set(key, value);
    
    // Verwijder oudste als limiet bereikt
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  get(key) {
    const value = this.cache.get(key);
    if (value) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }
}

// Circular buffer voor analytics
class CircularBuffer {
  constructor(size) {
    this.size = size;
    this.buffer = new Array(size);
    this.pointer = 0;
  }

  push(item) {
    this.buffer[this.pointer] = item;
    this.pointer = (this.pointer + 1) % this.size;
  }

  toArray() {
    return this.buffer.filter(item => item !== undefined);
  }
}

const sessionManager = new SessionManager();

// API endpoints met betere memory management
app.post('/login', async (req, res) => {
  const { userId, userData } = req.body;
  const sessionId = sessionManager.createSession(userId, userData);
  
  res.json({ sessionId });
});

app.use((req, res, next) => {
  const sessionId = req.headers['session-id'];
  
  // Cache alleen essentiële request info
  const requestId = generateRequestId();
  requestCache.set(requestId, {
    url: req.url,
    method: req.method,
    timestamp: Date.now()
    // Geen headers of body caching
  });

  // Update session activity
  if (sessionId) {
    sessionManager.updateActivity(sessionId, {
      url: req.url,
      timestamp: Date.now()
    });
  }

  // Minimale analytics data
  analyticsData.push({
    sessionId,
    url: req.url,
    timestamp: Date.now(),
    // Geen memory usage tracking in production
  });

  next();
});

app.get('/data/:id', async (req, res) => {
  const { id } = req.params;
  
  // Stream large data instead of caching
  res.setHeader('Content-Type', 'application/json');
  res.write('[');
  
  let first = true;
  for (let i = 0; i < 10000; i++) {
    if (!first) res.write(',');
    first = false;
    
    res.write(JSON.stringify({
      id: \`\${id}-\${i}\`,
      data: Math.random()
    }));
  }
  
  res.end(']');
});

// Proper cleanup on shutdown
process.on('SIGTERM', () => {
  // Cleanup all timers
  for (const timer of sessionManager.sessionTimers.values()) {
    clearInterval(timer);
  }
  
  // Clear all data structures
  sessionManager.activeSessions.clear();
  sessionManager.sessionTimers.clear();
  userSessions.clear();
  requestCache.cache.clear();
  
  process.exit(0);
});`,
      hints: [
        'Begin met "claude debug memory --profile" om het memory gebruik te monitoren',
        'Zoek naar data structures die onbeperkt groeien (Maps, Arrays zonder size limits)',
        'Check of timers en event listeners proper opgeruimd worden',
        'Let op circular references en closures die grote objecten vasthouden',
        'Gebruik "claude debug memory --analyze" om heap dumps te analyseren'
      ]
    }
  ],
  resources: [
    {
      title: 'Claude Code Debugging Guide',
      url: 'https://claude.ai/docs/debugging',
      type: 'guide'
    },
    {
      title: 'Memory Leak Detection Best Practices',
      url: 'https://claude.ai/docs/memory-leaks',
      type: 'article'
    },
    {
      title: 'Race Condition Analysis Tools',
      url: 'https://claude.ai/docs/race-conditions',
      type: 'tutorial'
    },
    {
      title: 'Advanced Debugging Techniques',
      url: 'https://claude.ai/docs/advanced-debugging',
      type: 'video'
    }
  ]
};