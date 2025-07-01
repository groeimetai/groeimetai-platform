import { Lesson } from '@/lib/data/courses';

export const lesson2_3: Lesson = {
  id: 'lesson-2-3',
  title: 'Data aggregatie en merging',
  duration: '30 min',
  content: `
# Data aggregatie en merging

## Introductie

In moderne workflow automatisering kom je vaak situaties tegen waar je data uit meerdere bronnen moet combineren, aggregeren en samenvoegen. Dit is essentieel voor het creëren van complete overzichten, rapportages en het nemen van geïnformeerde beslissingen. In deze les leer je geavanceerde technieken voor data aggregatie en merging zonder traditionele databases.

## Combining data from multiple sources

### Data bronnen identificeren en normaliseren

Voordat je data kunt samenvoegen, moet je eerst begrijpen welke bronnen je hebt en hoe je ze kunt normaliseren:

\`\`\`javascript
// Voorbeeld: Verschillende data bronnen
const salesDataFromCRM = [
  { customerId: 'C001', orderDate: '2024-01-15', amount: 1500, product: 'Software License' },
  { customerId: 'C002', orderDate: '2024-01-16', amount: 2200, product: 'Consulting' }
];

const customerDataFromDB = [
  { id: 'C001', name: 'TechCorp BV', email: 'info@techcorp.nl', tier: 'enterprise' },
  { id: 'C002', name: 'StartupXYZ', email: 'hello@startupxyz.com', tier: 'startup' }
];

const supportTicketsFromAPI = [
  { custId: 'C001', ticketCount: 3, avgResolutionTime: 24 },
  { custId: 'C002', ticketCount: 1, avgResolutionTime: 12 }
];

// Normaliseer field namen voor consistentie
function normalizeDataSources(sales, customers, tickets) {
  // Standaardiseer customer ID velden
  const normalizedTickets = tickets.map(ticket => ({
    ...ticket,
    customerId: ticket.custId // Hernoem naar consistent veld
  }));
  
  const normalizedCustomers = customers.map(customer => ({
    ...customer,
    customerId: customer.id // Hernoem naar consistent veld
  }));
  
  return {
    sales: sales,
    customers: normalizedCustomers,
    tickets: normalizedTickets
  };
}
\`\`\`

### Merge strategieën

Er zijn verschillende manieren om data samen te voegen:

1. **Nested merge**: Embed gerelateerde data als sub-objecten
2. **Flat merge**: Voeg alle velden samen op hetzelfde niveau
3. **Selective merge**: Kies specifieke velden om samen te voegen

\`\`\`javascript
// Nested merge strategie
function nestedMerge(sales, customers, tickets) {
  return sales.map(sale => ({
    ...sale,
    customer: customers.find(c => c.customerId === sale.customerId),
    support: tickets.find(t => t.customerId === sale.customerId)
  }));
}

// Flat merge strategie
function flatMerge(sales, customers, tickets) {
  return sales.map(sale => {
    const customer = customers.find(c => c.customerId === sale.customerId) || {};
    const ticket = tickets.find(t => t.customerId === sale.customerId) || {};
    
    return {
      ...sale,
      customerName: customer.name,
      customerEmail: customer.email,
      customerTier: customer.tier,
      ticketCount: ticket.ticketCount || 0,
      avgResolutionTime: ticket.avgResolutionTime || 0
    };
  });
}

// Selective merge met field mapping
function selectiveMerge(sales, customers, tickets, fieldMap) {
  return sales.map(sale => {
    const result = { ...sale };
    
    // Merge customer fields
    const customer = customers.find(c => c.customerId === sale.customerId);
    if (customer && fieldMap.customer) {
      fieldMap.customer.forEach(field => {
        result[\`customer_\${field}\`] = customer[field];
      });
    }
    
    // Merge ticket fields
    const ticket = tickets.find(t => t.customerId === sale.customerId);
    if (ticket && fieldMap.tickets) {
      fieldMap.tickets.forEach(field => {
        result[\`support_\${field}\`] = ticket[field];
      });
    }
    
    return result;
  });
}
\`\`\`

## JOIN operations without databases

### Implementatie van SQL-achtige JOINs in JavaScript

Hoewel we geen database gebruiken, kunnen we dezelfde JOIN concepten implementeren:

\`\`\`javascript
// INNER JOIN implementatie
function innerJoin(left, right, leftKey, rightKey) {
  const result = [];
  
  left.forEach(leftItem => {
    const matches = right.filter(rightItem => 
      leftItem[leftKey] === rightItem[rightKey]
    );
    
    matches.forEach(match => {
      result.push({
        ...leftItem,
        ...match
      });
    });
  });
  
  return result;
}

// LEFT JOIN implementatie
function leftJoin(left, right, leftKey, rightKey) {
  return left.map(leftItem => {
    const match = right.find(rightItem => 
      leftItem[leftKey] === rightItem[rightKey]
    );
    
    return {
      ...leftItem,
      ...(match || {})
    };
  });
}

// FULL OUTER JOIN implementatie
function fullOuterJoin(left, right, leftKey, rightKey) {
  // Start met LEFT JOIN
  const leftJoined = leftJoin(left, right, leftKey, rightKey);
  
  // Voeg unmatched items van right toe
  const matchedRightKeys = new Set(
    left.map(l => l[leftKey]).filter(key => 
      right.some(r => r[rightKey] === key)
    )
  );
  
  const unmatchedRight = right.filter(r => 
    !matchedRightKeys.has(r[rightKey])
  );
  
  return [...leftJoined, ...unmatchedRight];
}

// Gebruik voorbeeld met sales en customer data
const enrichedSales = leftJoin(
  salesDataFromCRM,
  customerDataFromDB,
  'customerId',
  'customerId'
);
\`\`\`

### Multi-table JOINs

Voor complexere scenario's waar je meerdere data sets moet joinen:

\`\`\`javascript
// Chain multiple joins
function multiJoin(datasets) {
  const { base, joins } = datasets;
  
  return joins.reduce((result, joinConfig) => {
    const { data, type, leftKey, rightKey } = joinConfig;
    
    switch(type) {
      case 'inner':
        return innerJoin(result, data, leftKey, rightKey);
      case 'left':
        return leftJoin(result, data, leftKey, rightKey);
      case 'full':
        return fullOuterJoin(result, data, leftKey, rightKey);
      default:
        return result;
    }
  }, base);
}

// Voorbeeld: Sales + Customers + Products + Regions
const completeData = multiJoin({
  base: salesData,
  joins: [
    {
      data: customerData,
      type: 'left',
      leftKey: 'customerId',
      rightKey: 'id'
    },
    {
      data: productData,
      type: 'left',
      leftKey: 'productId',
      rightKey: 'productId'
    },
    {
      data: regionData,
      type: 'left',
      leftKey: 'regionCode',
      rightKey: 'code'
    }
  ]
});
\`\`\`

## Aggregation functions

### Basis aggregatie functies

Implementeer SQL-achtige aggregatie functies voor data analyse:

\`\`\`javascript
// SUM functie
function sum(data, field) {
  return data.reduce((total, item) => total + (item[field] || 0), 0);
}

// AVG (average) functie
function avg(data, field) {
  if (data.length === 0) return 0;
  return sum(data, field) / data.length;
}

// COUNT functies
function count(data, condition = null) {
  if (!condition) return data.length;
  return data.filter(condition).length;
}

function countDistinct(data, field) {
  return new Set(data.map(item => item[field])).size;
}

// MIN/MAX functies
function min(data, field) {
  return Math.min(...data.map(item => item[field] || Infinity));
}

function max(data, field) {
  return Math.max(...data.map(item => item[field] || -Infinity));
}

// Gebruik voorbeelden
const salesStats = {
  totalRevenue: sum(salesData, 'amount'),
  averageOrderValue: avg(salesData, 'amount'),
  orderCount: count(salesData),
  uniqueCustomers: countDistinct(salesData, 'customerId'),
  highestOrder: max(salesData, 'amount'),
  lowestOrder: min(salesData, 'amount')
};
\`\`\`

### GROUP BY implementatie

Groepeer data voor complexere aggregaties:

\`\`\`javascript
// GROUP BY functie
function groupBy(data, keyFunction) {
  return data.reduce((groups, item) => {
    const key = typeof keyFunction === 'string' 
      ? item[keyFunction] 
      : keyFunction(item);
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
}

// Aggregeer per groep
function aggregateGroups(groupedData, aggregations) {
  const results = [];
  
  for (const [key, group] of Object.entries(groupedData)) {
    const result = { groupKey: key };
    
    for (const [name, aggFunc] of Object.entries(aggregations)) {
      result[name] = aggFunc(group);
    }
    
    results.push(result);
  }
  
  return results;
}

// Voorbeeld: Sales per customer tier
const salesByTier = groupBy(enrichedSales, 'customerTier');
const tierAnalysis = aggregateGroups(salesByTier, {
  totalRevenue: (group) => sum(group, 'amount'),
  avgOrderValue: (group) => avg(group, 'amount'),
  orderCount: (group) => count(group),
  topProduct: (group) => {
    const products = groupBy(group, 'product');
    const productCounts = Object.entries(products)
      .map(([product, sales]) => ({ product, count: sales.length }))
      .sort((a, b) => b.count - a.count);
    return productCounts[0]?.product || 'N/A';
  }
});
\`\`\`

### Window functions

Implementeer window functions voor running totals en rankings:

\`\`\`javascript
// Running total
function runningTotal(data, valueField, orderField) {
  const sorted = [...data].sort((a, b) => 
    new Date(a[orderField]) - new Date(b[orderField])
  );
  
  let total = 0;
  return sorted.map(item => ({
    ...item,
    runningTotal: total += item[valueField]
  }));
}

// Ranking functie
function rank(data, field, ascending = false) {
  const sorted = [...data].sort((a, b) => 
    ascending ? a[field] - b[field] : b[field] - a[field]
  );
  
  let currentRank = 1;
  let previousValue = null;
  
  return sorted.map((item, index) => {
    if (previousValue !== null && item[field] !== previousValue) {
      currentRank = index + 1;
    }
    previousValue = item[field];
    
    return {
      ...item,
      rank: currentRank
    };
  });
}

// Percentile berekening
function percentile(data, field, percentiles = [25, 50, 75]) {
  const sorted = [...data]
    .map(item => item[field])
    .filter(val => val !== null && val !== undefined)
    .sort((a, b) => a - b);
  
  const results = {};
  percentiles.forEach(p => {
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    results[\`p\${p}\`] = sorted[index];
  });
  
  return results;
}
\`\`\`

## Deduplication strategies

### Identificeer en verwijder duplicaten

Verschillende strategieën voor het omgaan met duplicate data:

\`\`\`javascript
// Basis deduplicatie op exact match
function deduplicateExact(data, keyField) {
  const seen = new Set();
  return data.filter(item => {
    const key = item[keyField];
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// Deduplicatie op meerdere velden
function deduplicateMultiField(data, keyFields) {
  const seen = new Set();
  return data.filter(item => {
    const key = keyFields.map(field => item[field]).join('|');
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// Fuzzy deduplicatie voor tekst
function fuzzyDeduplicate(data, field, threshold = 0.8) {
  const results = [];
  const processed = [];
  
  data.forEach(item => {
    const value = item[field].toLowerCase().trim();
    
    // Check similarity met eerder verwerkte items
    const isDuplicate = processed.some(processedValue => 
      calculateSimilarity(value, processedValue) > threshold
    );
    
    if (!isDuplicate) {
      results.push(item);
      processed.push(value);
    }
  });
  
  return results;
}

// Levenshtein distance voor string similarity
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

// Keep best record strategie
function deduplicateKeepBest(data, keyField, scoreFunction) {
  const groups = groupBy(data, keyField);
  
  return Object.values(groups).map(group => {
    // Sorteer op score en neem de beste
    return group.sort((a, b) => 
      scoreFunction(b) - scoreFunction(a)
    )[0];
  });
}

// Voorbeeld: Keep most recent customer record
const dedupedCustomers = deduplicateKeepBest(
  customerRecords,
  'email',
  (record) => new Date(record.lastUpdated).getTime()
);
\`\`\`

## Conflict resolution

### Strategieën voor het oplossen van data conflicten

Wanneer je data uit meerdere bronnen samenvoegt, kunnen conflicten ontstaan:

\`\`\`javascript
// Conflict resolution strategies
const ResolutionStrategy = {
  NEWEST_WINS: 'newest_wins',
  OLDEST_WINS: 'oldest_wins',
  HIGHEST_PRIORITY: 'highest_priority',
  MERGE_ALL: 'merge_all',
  MANUAL_REVIEW: 'manual_review'
};

// Conflict resolver class
class ConflictResolver {
  constructor(strategy = ResolutionStrategy.NEWEST_WINS) {
    this.strategy = strategy;
    this.conflicts = [];
  }
  
  resolve(records, keyField) {
    const groups = groupBy(records, keyField);
    const resolved = [];
    
    for (const [key, group] of Object.entries(groups)) {
      if (group.length === 1) {
        resolved.push(group[0]);
        continue;
      }
      
      // Conflict gedetecteerd
      const resolution = this.resolveConflict(group, key);
      resolved.push(resolution);
    }
    
    return {
      resolved,
      conflicts: this.conflicts
    };
  }
  
  resolveConflict(records, key) {
    // Detecteer welke velden conflicteren
    const fieldConflicts = this.detectFieldConflicts(records);
    
    if (Object.keys(fieldConflicts).length === 0) {
      return records[0]; // Geen echte conflicten
    }
    
    // Log conflict voor audit
    this.conflicts.push({
      key,
      records: records,
      conflicts: fieldConflicts,
      strategy: this.strategy,
      timestamp: new Date()
    });
    
    // Pas resolution strategy toe
    switch (this.strategy) {
      case ResolutionStrategy.NEWEST_WINS:
        return this.newestWins(records);
      
      case ResolutionStrategy.OLDEST_WINS:
        return this.oldestWins(records);
      
      case ResolutionStrategy.HIGHEST_PRIORITY:
        return this.highestPriority(records);
      
      case ResolutionStrategy.MERGE_ALL:
        return this.mergeAll(records, fieldConflicts);
      
      case ResolutionStrategy.MANUAL_REVIEW:
        return this.flagForReview(records, fieldConflicts);
      
      default:
        return records[0];
    }
  }
  
  detectFieldConflicts(records) {
    const conflicts = {};
    const firstRecord = records[0];
    
    Object.keys(firstRecord).forEach(field => {
      const values = records.map(r => r[field]);
      const uniqueValues = [...new Set(values)];
      
      if (uniqueValues.length > 1) {
        conflicts[field] = uniqueValues;
      }
    });
    
    return conflicts;
  }
  
  newestWins(records) {
    return records.sort((a, b) => 
      new Date(b.lastModified || b.timestamp) - 
      new Date(a.lastModified || a.timestamp)
    )[0];
  }
  
  oldestWins(records) {
    return records.sort((a, b) => 
      new Date(a.created || a.timestamp) - 
      new Date(b.created || b.timestamp)
    )[0];
  }
  
  highestPriority(records) {
    const priorityMap = {
      'crm': 100,
      'erp': 90,
      'manual': 80,
      'api': 70,
      'import': 60
    };
    
    return records.sort((a, b) => 
      (priorityMap[b.source] || 0) - (priorityMap[a.source] || 0)
    )[0];
  }
  
  mergeAll(records, conflicts) {
    const merged = { ...records[0] };
    
    // Voor elk conflicterend veld, merge de waarden
    Object.keys(conflicts).forEach(field => {
      const values = records.map(r => r[field]).filter(v => v != null);
      
      if (typeof values[0] === 'string') {
        // Concatenate strings
        merged[field] = values.join(' | ');
      } else if (typeof values[0] === 'number') {
        // Average numbers
        merged[field] = values.reduce((a, b) => a + b, 0) / values.length;
      } else if (Array.isArray(values[0])) {
        // Merge arrays
        merged[field] = [...new Set(values.flat())];
      } else {
        // Keep most recent for other types
        merged[field] = this.newestWins(records)[field];
      }
    });
    
    merged._merged = true;
    merged._sourceCount = records.length;
    return merged;
  }
  
  flagForReview(records, conflicts) {
    return {
      ...records[0],
      _requiresReview: true,
      _conflicts: conflicts,
      _allVersions: records,
      _conflictCount: Object.keys(conflicts).length
    };
  }
}

// Gebruik voorbeeld
const resolver = new ConflictResolver(ResolutionStrategy.MERGE_ALL);
const { resolved, conflicts } = resolver.resolve(
  customerDataFromMultipleSources,
  'email'
);
\`\`\`

### Praktijkvoorbeeld: Complete sales data pipeline

\`\`\`javascript
// Complete data aggregatie en merge pipeline
class SalesDataPipeline {
  constructor() {
    this.sources = {
      sales: [],
      customers: [],
      products: [],
      regions: []
    };
  }
  
  async loadData() {
    // Laad data van verschillende bronnen (gesimuleerd)
    this.sources.sales = await this.fetchSalesData();
    this.sources.customers = await this.fetchCustomerData();
    this.sources.products = await this.fetchProductData();
    this.sources.regions = await this.fetchRegionData();
  }
  
  process() {
    // Stap 1: Normaliseer data
    const normalized = this.normalizeData();
    
    // Stap 2: Dedupliceer
    const deduped = this.deduplicateData(normalized);
    
    // Stap 3: Join data sets
    const joined = this.joinData(deduped);
    
    // Stap 4: Resolve conflicts
    const resolved = this.resolveConflicts(joined);
    
    // Stap 5: Aggregeer
    const aggregated = this.aggregateData(resolved);
    
    // Stap 6: Enrich met berekende velden
    const enriched = this.enrichData(aggregated);
    
    return enriched;
  }
  
  normalizeData() {
    // Standaardiseer datums
    this.sources.sales = this.sources.sales.map(sale => ({
      ...sale,
      orderDate: new Date(sale.orderDate).toISOString(),
      amount: parseFloat(sale.amount)
    }));
    
    // Standaardiseer customer IDs
    this.sources.customers = this.sources.customers.map(customer => ({
      ...customer,
      customerId: customer.id || customer.customerId,
      name: customer.name.trim()
    }));
    
    return this.sources;
  }
  
  deduplicateData(data) {
    // Dedupliceer customers op email
    data.customers = deduplicateKeepBest(
      data.customers,
      'email',
      (customer) => new Date(customer.lastUpdated).getTime()
    );
    
    // Dedupliceer sales op order ID
    data.sales = deduplicateExact(data.sales, 'orderId');
    
    return data;
  }
  
  joinData(data) {
    // Multi-table join
    let result = leftJoin(data.sales, data.customers, 'customerId', 'customerId');
    result = leftJoin(result, data.products, 'productId', 'productId');
    result = leftJoin(result, data.regions, 'regionCode', 'regionCode');
    
    return result;
  }
  
  resolveConflicts(data) {
    const resolver = new ConflictResolver(ResolutionStrategy.HIGHEST_PRIORITY);
    const { resolved } = resolver.resolve(data, 'orderId');
    return resolved;
  }
  
  aggregateData(data) {
    // Groepeer per customer tier en region
    const grouped = {};
    
    data.forEach(record => {
      const key = \`\${record.customerTier}-\${record.regionName}\`;
      if (!grouped[key]) {
        grouped[key] = {
          tier: record.customerTier,
          region: record.regionName,
          sales: []
        };
      }
      grouped[key].sales.push(record);
    });
    
    // Bereken aggregaties
    return Object.values(grouped).map(group => ({
      ...group,
      totalRevenue: sum(group.sales, 'amount'),
      avgOrderValue: avg(group.sales, 'amount'),
      orderCount: count(group.sales),
      topProduct: this.getTopProduct(group.sales),
      customerCount: countDistinct(group.sales, 'customerId'),
      revenueGrowth: this.calculateGrowth(group.sales)
    }));
  }
  
  enrichData(data) {
    return data.map(item => ({
      ...item,
      revenuePerCustomer: item.totalRevenue / item.customerCount,
      marketShare: (item.totalRevenue / sum(data, 'totalRevenue')) * 100,
      performanceScore: this.calculatePerformanceScore(item)
    }));
  }
  
  getTopProduct(sales) {
    const products = groupBy(sales, 'productName');
    const sorted = Object.entries(products)
      .map(([name, sales]) => ({
        name,
        revenue: sum(sales, 'amount')
      }))
      .sort((a, b) => b.revenue - a.revenue);
    
    return sorted[0]?.name || 'N/A';
  }
  
  calculateGrowth(sales) {
    const byMonth = groupBy(sales, (sale) => 
      sale.orderDate.substring(0, 7) // YYYY-MM
    );
    
    const months = Object.keys(byMonth).sort();
    if (months.length < 2) return 0;
    
    const firstMonth = sum(byMonth[months[0]], 'amount');
    const lastMonth = sum(byMonth[months[months.length - 1]], 'amount');
    
    return ((lastMonth - firstMonth) / firstMonth) * 100;
  }
  
  calculatePerformanceScore(item) {
    // Gewogen score op basis van verschillende metrics
    const weights = {
      revenue: 0.4,
      growth: 0.3,
      avgOrder: 0.2,
      customers: 0.1
    };
    
    const normalizedRevenue = item.totalRevenue / 100000; // Normalize to 0-1 scale
    const normalizedGrowth = Math.max(0, item.revenueGrowth / 100);
    const normalizedAvgOrder = item.avgOrderValue / 1000;
    const normalizedCustomers = item.customerCount / 100;
    
    return (
      normalizedRevenue * weights.revenue +
      normalizedGrowth * weights.growth +
      normalizedAvgOrder * weights.avgOrder +
      normalizedCustomers * weights.customers
    ) * 100;
  }
}

// Gebruik de pipeline
const pipeline = new SalesDataPipeline();
await pipeline.loadData();
const results = pipeline.process();

// Output voorbeeld
console.log('Sales Analysis Results:', results);
\`\`\`

## Best practices

1. **Data validatie**: Valideer altijd input data voordat je gaat mergen
2. **Performance**: Gebruik indexes/maps voor grote datasets
3. **Memory management**: Stream grote datasets in plaats van alles in memory te laden
4. **Error handling**: Implementeer robuuste error handling voor missing data
5. **Audit trail**: Log alle merge operaties en conflicten voor traceability
6. **Testing**: Test edge cases zoals lege datasets, null values, en type mismatches

## Common pitfalls

1. **Type coercion**: Wees voorzichtig met JavaScript's automatische type conversie
2. **Reference vs copy**: Zorg dat je data kopieert in plaats van references te delen
3. **Performance bottlenecks**: Vermijd nested loops waar mogelijk
4. **Memory leaks**: Clean up grote data structures na gebruik
5. **Inconsistent formats**: Normaliseer altijd datums, getallen en strings
  `,
  codeExamples: [
    {
      id: 'complete-data-merge-workflow',
      title: 'Complete data merge workflow in N8N',
      language: 'javascript',
      code: `// N8N Function node voor complete data merge
const salesData = \$node["Sales API"].json;
const customerData = \$node["Customer DB"].json;
const productData = \$node["Product Service"].json;

// Helper functions
function leftJoin(left, right, leftKey, rightKey) {
  return left.map(leftItem => {
    const match = right.find(rightItem => 
      leftItem[leftKey] === rightItem[rightKey]
    );
    return { ...leftItem, ...(match || {}) };
  });
}

function groupBy(data, key) {
  return data.reduce((groups, item) => {
    const groupKey = item[key];
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(item);
    return groups;
  }, {});
}

// Main processing
try {
  // Step 1: Normalize data
  const normalizedSales = salesData.map(sale => ({
    ...sale,
    amount: parseFloat(sale.amount),
    date: new Date(sale.date).toISOString()
  }));
  
  // Step 2: Join datasets
  let enrichedData = leftJoin(normalizedSales, customerData, 'customerId', 'id');
  enrichedData = leftJoin(enrichedData, productData, 'productId', 'sku');
  
  // Step 3: Aggregate by customer tier
  const byTier = groupBy(enrichedData, 'customerTier');
  
  const aggregatedResults = Object.entries(byTier).map(([tier, sales]) => ({
    tier,
    totalRevenue: sales.reduce((sum, sale) => sum + sale.amount, 0),
    orderCount: sales.length,
    avgOrderValue: sales.reduce((sum, sale) => sum + sale.amount, 0) / sales.length,
    topProducts: Object.entries(
      sales.reduce((products, sale) => {
        products[sale.productName] = (products[sale.productName] || 0) + 1;
        return products;
      }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name, count]) => ({ name, count }))
  }));
  
  // Return formatted results
  return aggregatedResults.map(result => ({
    json: result
  }));
  
} catch (error) {
  throw new Error(\`Data merge failed: \${error.message}\`);
}`
    },
    {
      id: 'conflict-resolution-implementation',
      title: 'Conflict resolution implementation',
      language: 'javascript',
      code: `// Advanced conflict resolution for customer data merge
const sources = {
  crm: \$node["CRM Export"].json,
  erp: \$node["ERP System"].json,
  manual: \$node["Manual Updates"].json
};

class DataMerger {
  constructor() {
    this.conflicts = [];
    this.resolutions = [];
  }
  
  mergeCustomerRecords(sources) {
    // Collect all unique customers by email
    const allCustomers = [
      ...sources.crm.map(c => ({ ...c, _source: 'crm' })),
      ...sources.erp.map(c => ({ ...c, _source: 'erp' })),
      ...sources.manual.map(c => ({ ...c, _source: 'manual' }))
    ];
    
    const customersByEmail = {};
    
    // Group by email
    allCustomers.forEach(customer => {
      const email = customer.email.toLowerCase().trim();
      if (!customersByEmail[email]) {
        customersByEmail[email] = [];
      }
      customersByEmail[email].push(customer);
    });
    
    // Process each customer group
    const mergedCustomers = [];
    
    for (const [email, records] of Object.entries(customersByEmail)) {
      if (records.length === 1) {
        mergedCustomers.push(records[0]);
        continue;
      }
      
      // Conflict detected - resolve it
      const resolved = this.resolveCustomerConflict(email, records);
      mergedCustomers.push(resolved);
    }
    
    return {
      customers: mergedCustomers,
      conflicts: this.conflicts,
      resolutions: this.resolutions
    };
  }
  
  resolveCustomerConflict(email, records) {
    // Detect conflicting fields
    const conflicts = this.detectConflicts(records);
    
    if (conflicts.length === 0) {
      return records[0]; // No real conflicts
    }
    
    // Log conflict
    this.conflicts.push({
      email,
      records: records.length,
      conflictingFields: conflicts,
      sources: records.map(r => r._source)
    });
    
    // Apply resolution strategy
    const resolved = this.applyResolutionStrategy(records, conflicts);
    
    // Log resolution
    this.resolutions.push({
      email,
      strategy: resolved._resolutionStrategy,
      conflictsResolved: conflicts.length
    });
    
    return resolved;
  }
  
  detectConflicts(records) {
    const conflicts = [];
    const fields = Object.keys(records[0]).filter(f => !f.startsWith('_'));
    
    fields.forEach(field => {
      const values = records.map(r => r[field]);
      const uniqueValues = [...new Set(values.map(v => JSON.stringify(v)))];
      
      if (uniqueValues.length > 1) {
        conflicts.push({
          field,
          values: uniqueValues.map(v => JSON.parse(v))
        });
      }
    });
    
    return conflicts;
  }
  
  applyResolutionStrategy(records, conflicts) {
    // Priority-based resolution
    const sourcePriority = { manual: 3, crm: 2, erp: 1 };
    
    // Start with highest priority source
    const baseRecord = records.sort((a, b) => 
      sourcePriority[b._source] - sourcePriority[a._source]
    )[0];
    
    const resolved = { ...baseRecord };
    
    // For each conflict, apply specific resolution
    conflicts.forEach(conflict => {
      const field = conflict.field;
      
      if (field === 'lastModified' || field === 'updatedAt') {
        // Take most recent
        resolved[field] = records
          .map(r => r[field])
          .sort()
          .reverse()[0];
      } else if (field === 'tags' || field === 'categories') {
        // Merge arrays
        resolved[field] = [...new Set(records.flatMap(r => r[field] || []))];
      } else if (field === 'notes' || field === 'description') {
        // Concatenate text fields
        resolved[field] = records
          .map(r => r[field])
          .filter(v => v)
          .join('\\n---\\n');
      } else {
        // Use highest priority source
        const priorityRecord = records.find(r => 
          r[field] === conflict.values[0]
        );
        resolved[field] = priorityRecord[field];
      }
    });
    
    // Add metadata
    resolved._merged = true;
    resolved._mergedFrom = records.map(r => r._source);
    resolved._resolutionStrategy = 'priority_with_field_rules';
    resolved._conflictsResolved = conflicts.length;
    
    return resolved;
  }
}

// Execute merge
const merger = new DataMerger();
const result = merger.mergeCustomerRecords(sources);

// Return results with metadata
return [{
  json: {
    summary: {
      totalCustomers: result.customers.length,
      conflictsDetected: result.conflicts.length,
      resolutionsApplied: result.resolutions.length
    },
    customers: result.customers,
    auditLog: {
      conflicts: result.conflicts,
      resolutions: result.resolutions
    }
  }
}];`
    }
  ],
  assignments: [
    {
      id: 'assignment-2-3-1',
      title: 'Build een complete sales dashboard data pipeline',
      description: 'Creëer een workflow die sales data uit 3 verschillende bronnen (CRM, ERP, en Excel exports) samenvoegt, conflicten oplost, en een rijk dashboard dataset genereert met customer insights, product performance, en regionale analyses.',
      difficulty: 'hard',
      type: 'project'
    },
    {
      id: 'assignment-2-3-2',
      title: 'Implementeer een customer 360 view aggregator',
      description: 'Bouw een systeem dat customer data uit verschillende touchpoints (website, support tickets, sales, marketing campaigns) aggregeert tot een complete customer view met intelligent conflict resolution en deduplicatie.',
      difficulty: 'expert',
      type: 'project'
    }
  ],
  resources: [
    {
      title: 'N8N Data transformation guide',
      url: 'https://docs.n8n.io/data-transformation/',
      type: 'guide'
    },
    {
      title: 'JavaScript array methods documentation',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array',
      type: 'documentation'
    },
    {
      title: 'Data aggregation patterns',
      url: 'https://www.patterns.dev/posts/aggregation-pattern/',
      type: 'article'
    }
  ]
};