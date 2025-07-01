import type { Lesson } from '@/lib/data/courses';

export const lesson3_3: Lesson = {
  id: 'lesson-3-3',
  title: 'Performance debugging',
  duration: '35 min',
  content: `
# Performance Debugging met Claude Code

Performance optimalisatie is cruciaal voor moderne applicaties. Claude Code biedt krachtige tools om performance bottlenecks te identificeren en op te lossen.

## Performance Profiling

Claude Code kan je helpen bij het analyseren van performance metrics en het identificeren van trage code.

### CPU Profiling

**Start een performance analyse:**
\`\`\`bash
# Analyseer CPU gebruik van je applicatie
claude performance profile --cpu "npm start"

# Analyseer een specifieke functie
claude performance analyze-function "processLargeDataset"

# Genereer een flame graph
claude performance flamegraph --duration 30s
\`\`\`

### Memory Profiling

**Memory gebruik analyseren:**
\`\`\`bash
# Start memory profiling
claude performance memory --heap-snapshot

# Detecteer memory leaks
claude performance detect-leaks --watch

# Analyseer heap allocaties
claude performance heap-analysis --verbose
\`\`\`

## Bottleneck Identificatie

Claude Code kan automatisch performance bottlenecks detecteren en suggesties geven voor optimalisatie.

### Automatische Bottleneck Detection

\`\`\`bash
# Scan codebase voor performance issues
claude analyze performance --deep

# Output:
# 🔴 Critical: Database query in UserService.findAll() - 2.3s avg
# 🟡 Warning: Synchronous file read in ConfigLoader - 450ms
# 🟡 Warning: Large array operation in DataProcessor - 890ms
\`\`\`

### Query Analysis

\`\`\`bash
# Analyseer database queries
claude performance analyze-queries --database postgres

# Stel query optimalisaties voor
claude optimize query "SELECT * FROM users WHERE status = 'active'"

# Genereer index suggesties
claude suggest indexes --table users
\`\`\`

## Memory Optimalisatie

Optimaliseer memory gebruik met Claude's intelligente suggesties.

### Memory Leak Detection

\`\`\`javascript
// Claude detecteert dit memory leak patroon
class EventManager {
  constructor() {
    this.listeners = [];
  }
  
  addListener(fn) {
    this.listeners.push(fn);
    // ⚠️ Claude: Memory leak - listeners worden nooit verwijderd
  }
}

// Claude's suggestie:
class EventManager {
  constructor() {
    this.listeners = new WeakMap();
  }
  
  addListener(target, fn) {
    this.listeners.set(target, fn);
    // ✅ WeakMap voorkomt memory leaks
  }
}
\`\`\`

### Object Pool Pattern

\`\`\`javascript
// Claude suggereert object pooling voor heavy objects
claude suggest optimization --pattern "object-pool" --file GameEngine.js

// Genereert:
class ParticlePool {
  constructor(size = 1000) {
    this.pool = [];
    this.active = [];
    
    // Pre-allocate particles
    for (let i = 0; i < size; i++) {
      this.pool.push(new Particle());
    }
  }
  
  acquire() {
    return this.pool.pop() || new Particle();
  }
  
  release(particle) {
    particle.reset();
    this.pool.push(particle);
  }
}
\`\`\`

## Query Optimalisatie

Optimaliseer database queries met Claude's SQL expertise.

### Query Performance Analysis

\`\`\`sql
-- Claude analyseert deze query
SELECT u.*, p.*, o.*
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01';

-- Claude's optimalisatie suggestie:
-- 1. Selecteer alleen benodigde columns
-- 2. Voeg indexes toe
-- 3. Gebruik subqueries voor betere performance

SELECT 
  u.id, u.name, u.email,
  p.avatar_url,
  (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as order_count
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.created_at > '2024-01-01'
  AND u.status = 'active'
INDEX (created_at, status);
\`\`\`

### ORM Optimalisatie

\`\`\`javascript
// Claude detecteert N+1 query probleem
const users = await User.findAll();
for (const user of users) {
  const orders = await user.getOrders(); // ❌ N+1 probleem
}

// Claude's oplossing:
const users = await User.findAll({
  include: [{
    model: Order,
    as: 'orders',
    where: { status: 'completed' }
  }]
}); // ✅ Eager loading voorkomt N+1
\`\`\`

## Load Testing

Test de performance van je applicatie onder load.

### Load Test Setup

\`\`\`bash
# Genereer load test scenario
claude generate load-test --endpoint "/api/users" --concurrent 100

# Run load test met verschillende scenarios
claude load-test run --scenario "peak-traffic"

# Analyseer resultaten
claude load-test analyze results.json
\`\`\`

### Performance Benchmarking

\`\`\`javascript
// Claude genereert benchmark tests
claude generate benchmark --function "dataProcessor"

// Output:
import { bench, describe } from 'vitest';

describe('DataProcessor Performance', () => {
  bench('process small dataset', () => {
    dataProcessor(smallDataset);
  });
  
  bench('process large dataset', () => {
    dataProcessor(largeDataset);
  });
  
  bench('process with caching', () => {
    cachedDataProcessor(largeDataset);
  });
});
\`\`\`

## Performance Improvement Workflows

### Complete Performance Audit Workflow

\`\`\`bash
# 1. Initial performance scan
claude performance audit --comprehensive

# 2. Genereer performance rapport
claude report performance --format html

# 3. Implementeer top 5 optimalisaties
claude implement optimizations --top 5 --auto-commit

# 4. Vergelijk before/after metrics
claude performance compare --baseline main --current optimization-branch
\`\`\`

### Continuous Performance Monitoring

\`\`\`yaml
# .claude/performance.yml
performance:
  thresholds:
    page_load: 3s
    api_response: 200ms
    memory_usage: 512MB
  
  monitors:
    - type: cpu
      alert_threshold: 80%
    - type: memory
      alert_threshold: 90%
    - type: response_time
      endpoints: ["/api/*"]
      
  optimization:
    auto_suggest: true
    implement_critical: false
\`\`\`

### Performance Regression Prevention

\`\`\`bash
# Voeg performance checks toe aan CI/CD
claude generate ci-performance-check

# Monitor performance trends
claude performance trend --days 30

# Automatische performance regression detection
claude protect performance --threshold 10%
\`\`\`
        `,
  codeExamples: [
    {
      id: 'example-perf-analysis',
      title: 'Performance bottleneck analyse',
      language: 'javascript',
      code: `// Problematische code met performance issues
async function processUserData(userIds) {
  const results = [];
  
  // ❌ Synchrone loop met async operations
  for (const userId of userIds) {
    const user = await fetchUser(userId);
    const profile = await fetchProfile(userId);
    const orders = await fetchOrders(userId);
    
    results.push({
      ...user,
      profile,
      orders
    });
  }
  
  return results;
}

// Claude's geoptimaliseerde versie
async function processUserDataOptimized(userIds) {
  // ✅ Parallel processing met Promise.all
  const userPromises = userIds.map(userId => 
    Promise.all([
      fetchUser(userId),
      fetchProfile(userId),
      fetchOrders(userId)
    ]).then(([user, profile, orders]) => ({
      ...user,
      profile,
      orders
    }))
  );
  
  // ✅ Batch processing voor grote datasets
  const batchSize = 10;
  const results = [];
  
  for (let i = 0; i < userPromises.length; i += batchSize) {
    const batch = userPromises.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
  }
  
  return results;
}`,
      explanation: 'Claude identificeert sequentiële async operations als bottleneck en suggereert parallel processing met batching voor optimale performance.'
    },
    {
      id: 'example-memory-optimization',
      title: 'Memory leak detectie en fix',
      language: 'javascript',
      code: `// Memory leak voorbeeld
class DataCache {
  constructor() {
    this.cache = {};
    this.timers = {};
  }
  
  set(key, value, ttl = 60000) {
    this.cache[key] = value;
    
    // ❌ Memory leak: timer references blijven bestaan
    this.timers[key] = setTimeout(() => {
      delete this.cache[key];
    }, ttl);
  }
  
  // ❌ Geen cleanup bij object destruction
}

// Claude's memory-safe implementatie
class DataCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }
  
  set(key, value, ttl = 60000) {
    // ✅ Clear existing timer
    this.clear(key);
    
    this.cache.set(key, value);
    
    // ✅ Store timer reference properly
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl);
    
    this.timers.set(key, timer);
  }
  
  clear(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    this.cache.delete(key);
  }
  
  // ✅ Proper cleanup
  destroy() {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.cache.clear();
    this.timers.clear();
  }
}`,
      explanation: 'Claude detecteert memory leaks door timer references en missing cleanup, en suggereert proper memory management met Map en cleanup methods.'
    },
    {
      id: 'example-query-optimization',
      title: 'Database query optimalisatie',
      language: 'sql',
      code: `-- Originele trage query
SELECT 
  c.id,
  c.name,
  c.email,
  COUNT(DISTINCT o.id) as order_count,
  SUM(oi.quantity * oi.price) as total_spent,
  MAX(o.created_at) as last_order_date
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE c.created_at >= '2024-01-01'
GROUP BY c.id, c.name, c.email
HAVING COUNT(DISTINCT o.id) > 0
ORDER BY total_spent DESC;

-- Claude's geoptimaliseerde query met subqueries
WITH customer_orders AS (
  SELECT 
    customer_id,
    COUNT(*) as order_count,
    MAX(created_at) as last_order_date
  FROM orders
  WHERE created_at >= '2024-01-01'
  GROUP BY customer_id
),
customer_spending AS (
  SELECT 
    o.customer_id,
    SUM(oi.quantity * oi.price) as total_spent
  FROM orders o
  INNER JOIN order_items oi ON o.id = oi.order_id
  WHERE o.created_at >= '2024-01-01'
  GROUP BY o.customer_id
)
SELECT 
  c.id,
  c.name,
  c.email,
  COALESCE(co.order_count, 0) as order_count,
  COALESCE(cs.total_spent, 0) as total_spent,
  co.last_order_date
FROM customers c
INNER JOIN customer_orders co ON c.id = co.customer_id
LEFT JOIN customer_spending cs ON c.id = cs.customer_id
WHERE c.created_at >= '2024-01-01'
ORDER BY cs.total_spent DESC;

-- Claude's index suggesties:
CREATE INDEX idx_orders_customer_date ON orders(customer_id, created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_customers_created ON customers(created_at);`,
      explanation: 'Claude herschrijft de query met CTEs voor betere performance, elimineert onnodige GROUP BY columns, en suggereert strategische indexes.'
    }
  ],
  assignments: [
    {
      id: 'assignment-3-3',
      title: 'Optimaliseer een trage API endpoint',
      description: 'Gebruik Claude Code om performance bottlenecks te identificeren en op te lossen in een trage API endpoint.',
      difficulty: 'hard',
      type: 'project',
      initialCode: `// API endpoint met performance problemen
const express = require('express');
const router = express.Router();

// Trage endpoint die geoptimaliseerd moet worden
router.get('/api/dashboard/stats', async (req, res) => {
  try {
    // Haal alle users op
    const users = await db.query('SELECT * FROM users');
    
    // Voor elke user, haal orders op
    const userStats = [];
    for (const user of users) {
      const orders = await db.query(
        'SELECT * FROM orders WHERE user_id = ?',
        [user.id]
      );
      
      const orderItems = [];
      for (const order of orders) {
        const items = await db.query(
          'SELECT * FROM order_items WHERE order_id = ?',
          [order.id]
        );
        orderItems.push(...items);
      }
      
      // Bereken totalen
      const totalSpent = orderItems.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      );
      
      userStats.push({
        userId: user.id,
        name: user.name,
        orderCount: orders.length,
        totalSpent: totalSpent
      });
    }
    
    // Sorteer op total spent
    userStats.sort((a, b) => b.totalSpent - a.totalSpent);
    
    res.json({
      topUsers: userStats.slice(0, 10),
      totalUsers: users.length,
      timestamp: new Date()
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* OPDRACHT:
 * 1. Identificeer alle performance bottlenecks
 * 2. Optimaliseer database queries
 * 3. Implementeer caching waar nodig
 * 4. Voeg performance monitoring toe
 * 5. Test met load testing
 */`,
      solution: `// Geoptimaliseerde API endpoint
const express = require('express');
const router = express.Router();
const NodeCache = require('node-cache');

// Setup caching
const statsCache = new NodeCache({ stdTTL: 300 }); // 5 minuten cache

// Geoptimaliseerde endpoint
router.get('/api/dashboard/stats', async (req, res) => {
  try {
    // Check cache eerst
    const cacheKey = 'dashboard_stats';
    const cached = statsCache.get(cacheKey);
    
    if (cached) {
      return res.json({
        ...cached,
        cached: true,
        timestamp: new Date()
      });
    }
    
    // Gebruik een enkele geoptimaliseerde query
    const query = \`
      WITH user_orders AS (
        SELECT 
          u.id as user_id,
          u.name,
          COUNT(DISTINCT o.id) as order_count,
          COALESCE(SUM(oi.quantity * oi.price), 0) as total_spent
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY u.id, u.name
        HAVING COUNT(DISTINCT o.id) > 0
      )
      SELECT * FROM user_orders
      ORDER BY total_spent DESC
      LIMIT 10
    \`;
    
    // Parallel queries voor betere performance
    const [topUsersResult, userCountResult] = await Promise.all([
      db.query(query),
      db.query('SELECT COUNT(*) as count FROM users')
    ]);
    
    const response = {
      topUsers: topUsersResult.rows.map(row => ({
        userId: row.user_id,
        name: row.name,
        orderCount: parseInt(row.order_count),
        totalSpent: parseFloat(row.total_spent)
      })),
      totalUsers: userCountResult.rows[0].count,
      timestamp: new Date()
    };
    
    // Cache het resultaat
    statsCache.set(cacheKey, response);
    
    // Performance monitoring
    console.log(\`Dashboard stats generated in \${Date.now() - req.startTime}ms\`);
    
    res.json(response);
    
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware voor request timing
router.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

// Cache invalidation endpoint
router.post('/api/dashboard/refresh', async (req, res) => {
  statsCache.flushAll();
  res.json({ message: 'Cache cleared' });
});

// Health check met performance metrics
router.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    cache: {
      keys: statsCache.keys().length,
      stats: statsCache.getStats()
    }
  });
});`,
      hints: [
        'Let op de N+1 query probleem in de loops',
        'Overweeg om JOINs te gebruiken in plaats van separate queries',
        'Implementeer caching voor data die niet vaak verandert',
        'Gebruik Promise.all() voor parallel query execution',
        'Voeg indexes toe op foreign keys voor betere query performance'
      ]
    }
  ],
  resources: [
    {
      title: 'Claude Performance Optimization Guide',
      url: 'https://claude.ai/performance',
      type: 'guide'
    },
    {
      title: 'Database Query Optimization',
      url: 'https://claude.ai/docs/query-optimization',
      type: 'documentation'
    },
    {
      title: 'Memory Profiling Best Practices',
      url: 'https://claude.ai/memory-profiling',
      type: 'tutorial'
    }
  ]
};