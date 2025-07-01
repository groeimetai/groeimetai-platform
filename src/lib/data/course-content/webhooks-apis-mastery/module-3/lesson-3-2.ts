export const lesson3_2 = {
  id: 'data-transformatie-patterns',
  title: 'Data transformatie patterns',
  duration: '35 min',
  content: `
# Data transformatie patterns

## Introductie

In de wereld van API integraties is data transformatie cruciaal. Verschillende systemen gebruiken verschillende data structuren, formats en conventies. In deze les leer je essentiële patterns en technieken om data effectief te transformeren tussen verschillende systemen.

## Mapping tussen verschillende schemas

Schema mapping is het proces van het vertalen van data van één structuur naar een andere. Dit is een van de meest voorkomende uitdagingen bij integraties.

### Voorbeeld: E-commerce order mapping

**Bron systeem (Shopify):**
\`\`\`json
{
  "order": {
    "id": 450789469,
    "email": "bob.norman@mail.example.com",
    "created_at": "2024-03-13T12:00:00-04:00",
    "line_items": [
      {
        "variant_id": 808950810,
        "quantity": 1,
        "price": "199.00"
      }
    ],
    "customer": {
      "first_name": "Bob",
      "last_name": "Norman"
    }
  }
}
\`\`\`

**Doel systeem (ERP):**
\`\`\`json
{
  "purchaseOrder": {
    "orderNumber": "ORD-450789469",
    "customerEmail": "bob.norman@mail.example.com",
    "orderDate": "2024-03-13T16:00:00Z",
    "items": [
      {
        "sku": "SKU-808950810",
        "qty": 1,
        "unitPrice": 199.00
      }
    ],
    "billTo": {
      "name": "Bob Norman"
    }
  }
}
\`\`\`

### Mapping patterns

#### 1. Direct Field Mapping
De simpelste vorm - één-op-één veld mapping:

\`\`\`javascript
// N8N Code node
const mappedData = {
  orderNumber: \`ORD-\${$input.item.json.order.id}\`,
  customerEmail: $input.item.json.order.email,
  orderDate: new Date($input.item.json.order.created_at).toISOString()
};

return mappedData;
\`\`\`

#### 2. Nested Structure Transformation
Transformeer geneste objecten:

\`\`\`javascript
// Van platte structuur naar genest
const source = {
  customer_first_name: "Bob",
  customer_last_name: "Norman",
  customer_email: "bob@example.com"
};

const transformed = {
  customer: {
    fullName: \`\${source.customer_first_name} \${source.customer_last_name}\`,
    contact: {
      email: source.customer_email
    }
  }
};
\`\`\`

#### 3. Array Transformation
Verwerk arrays met verschillende structuren:

\`\`\`javascript
// Transform line items
const transformedItems = sourceOrder.line_items.map(item => ({
  sku: \`SKU-\${item.variant_id}\`,
  qty: item.quantity,
  unitPrice: parseFloat(item.price),
  total: item.quantity * parseFloat(item.price)
}));
\`\`\`

## Data Enrichment Techniques

Data enrichment voegt waardevolle informatie toe aan bestaande data, waardoor het bruikbaarder wordt voor downstream systemen.

### Enrichment Patterns

#### 1. Lookup Enrichment
Voeg extra data toe via lookups:

\`\`\`javascript
// N8N workflow pattern
// 1. Haal order data op
// 2. Lookup klantgegevens in CRM
// 3. Combineer data

const enrichedOrder = {
  ...orderData,
  customer: {
    ...orderData.customer,
    // Toegevoegde CRM data
    customerLifetimeValue: crmData.ltv,
    segment: crmData.segment,
    lastPurchaseDate: crmData.lastPurchase
  }
};
\`\`\`

#### 2. Calculated Fields
Voeg berekende velden toe:

\`\`\`javascript
const enrichWithCalculations = (order) => {
  return {
    ...order,
    // Nieuwe berekende velden
    totalAmount: order.items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    ),
    averageItemPrice: order.totalAmount / order.items.length,
    isHighValue: order.totalAmount > 1000,
    processingPriority: order.totalAmount > 1000 ? 'HIGH' : 'NORMAL'
  };
};
\`\`\`

#### 3. External API Enrichment
Verrijk met externe services:

\`\`\`javascript
// Voorbeeld: Verrijk met geolocatie data
async function enrichWithGeoData(customer) {
  const geoData = await fetchGeoLocation(customer.ipAddress);
  
  return {
    ...customer,
    location: {
      country: geoData.country,
      city: geoData.city,
      timezone: geoData.timezone,
      currency: geoData.currency
    }
  };
}
\`\`\`

## Aggregation en Filtering

### Aggregation Patterns

#### 1. Groeperen en Samenvatten
\`\`\`javascript
// Groepeer orders per klant
const ordersByCustomer = orders.reduce((groups, order) => {
  const customerId = order.customerId;
  if (!groups[customerId]) {
    groups[customerId] = {
      customerId: customerId,
      orders: [],
      totalSpent: 0,
      orderCount: 0
    };
  }
  
  groups[customerId].orders.push(order);
  groups[customerId].totalSpent += order.total;
  groups[customerId].orderCount += 1;
  
  return groups;
}, {});
\`\`\`

#### 2. Time-based Aggregation
\`\`\`javascript
// Aggregeer verkopen per dag
const salesByDay = sales.reduce((daily, sale) => {
  const date = new Date(sale.timestamp).toDateString();
  
  if (!daily[date]) {
    daily[date] = {
      date: date,
      totalSales: 0,
      transactions: 0,
      products: new Set()
    };
  }
  
  daily[date].totalSales += sale.amount;
  daily[date].transactions += 1;
  daily[date].products.add(sale.productId);
  
  return daily;
}, {});
\`\`\`

### Filtering Patterns

#### 1. Conditional Filtering
\`\`\`javascript
// Filter op meerdere condities
const filteredOrders = orders.filter(order => {
  return order.status === 'completed' &&
         order.total > 100 &&
         order.items.length > 2 &&
         new Date(order.date) > thirtyDaysAgo;
});
\`\`\`

#### 2. Dynamic Filtering
\`\`\`javascript
// Bouw filters dynamisch op basis van input
function buildFilter(criteria) {
  return (item) => {
    for (const [key, value] of Object.entries(criteria)) {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && value.min !== undefined) {
          // Range filter
          if (item[key] < value.min || item[key] > value.max) {
            return false;
          }
        } else if (item[key] !== value) {
          return false;
        }
      }
    }
    return true;
  };
}

// Gebruik
const criteria = {
  status: 'active',
  price: { min: 10, max: 100 }
};
const filtered = products.filter(buildFilter(criteria));
\`\`\`

## Normalization Strategies

Data normalisatie zorgt voor consistente, gestandaardiseerde data formats.

### Common Normalization Patterns

#### 1. String Normalization
\`\`\`javascript
const normalizeString = (str) => {
  return str
    .trim()
    .toLowerCase()
    .replace(/\\s+/g, ' ')  // Meerdere spaties naar één
    .replace(/[^a-z0-9\\s]/g, ''); // Verwijder speciale karakters
};

// Email normalisatie
const normalizeEmail = (email) => {
  return email.trim().toLowerCase();
};

// Telefoonnummer normalisatie
const normalizePhone = (phone) => {
  return phone.replace(/\\D/g, ''); // Alleen cijfers
};
\`\`\`

#### 2. Date/Time Normalization
\`\`\`javascript
// Converteer verschillende date formats naar ISO 8601
const normalizeDate = (dateInput) => {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    // Probeer verschillende formats
    const formats = [
      /^(\\d{2})\\/(\\d{2})\\/(\\d{4})$/, // DD/MM/YYYY
      /^(\\d{2})-(\\d{2})-(\\d{4})$/,     // DD-MM-YYYY
    ];
    
    for (const format of formats) {
      const match = dateInput.match(format);
      if (match) {
        return new Date(\`\${match[3]}-\${match[2]}-\${match[1]}\`).toISOString();
      }
    }
    throw new Error('Invalid date format');
  }
  return date.toISOString();
};
\`\`\`

#### 3. Currency Normalization
\`\`\`javascript
// Normaliseer currency naar cents
const normalizeCurrency = (amount, currency = 'EUR') => {
  // Verwijder currency symbols en formatting
  const cleanAmount = amount
    .toString()
    .replace(/[€$£¥,]/g, '')
    .replace(/\\s/g, '')
    .replace(',', '.');
  
  // Converteer naar cents voor precisie
  const cents = Math.round(parseFloat(cleanAmount) * 100);
  
  return {
    amount: cents,
    currency: currency.toUpperCase(),
    formatted: new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: currency
    }).format(cents / 100)
  };
};
\`\`\`

## Stream Processing

Voor grote datasets is stream processing essentieel om geheugen efficiënt te gebruiken.

### Stream Processing Patterns

#### 1. Batch Processing
Verwerk data in batches:

\`\`\`javascript
async function processBatches(items, batchSize = 100) {
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    // Verwerk batch
    const batchResults = await Promise.all(
      batch.map(item => transformItem(item))
    );
    
    results.push(...batchResults);
    
    // Geef systeem tijd om te ademen
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}
\`\`\`

#### 2. Pipeline Pattern
Bouw een transformation pipeline:

\`\`\`javascript
class TransformationPipeline {
  constructor() {
    this.transforms = [];
  }
  
  add(transform) {
    this.transforms.push(transform);
    return this;
  }
  
  async process(data) {
    let result = data;
    
    for (const transform of this.transforms) {
      result = await transform(result);
    }
    
    return result;
  }
}

// Gebruik
const pipeline = new TransformationPipeline()
  .add(normalizeData)
  .add(enrichWithMetadata)
  .add(filterInvalid)
  .add(aggregateResults);

const processed = await pipeline.process(rawData);
\`\`\`

#### 3. Event-Driven Processing
\`\`\`javascript
// N8N pattern voor event-driven processing
class DataProcessor extends EventEmitter {
  async processStream(dataStream) {
    let processed = 0;
    
    for await (const chunk of dataStream) {
      try {
        // Transform chunk
        const transformed = await this.transform(chunk);
        
        // Emit voor verdere processing
        this.emit('data', transformed);
        
        processed++;
        
        // Progress update
        if (processed % 100 === 0) {
          this.emit('progress', { processed });
        }
      } catch (error) {
        this.emit('error', { error, chunk });
      }
    }
    
    this.emit('complete', { total: processed });
  }
  
  async transform(data) {
    // Implementeer transformatie logica
    return data;
  }
}
\`\`\`

## Best Practices

### 1. Error Handling
Implementeer robuuste error handling:

\`\`\`javascript
const safeTransform = async (data, transformFn) => {
  try {
    return {
      success: true,
      data: await transformFn(data)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      originalData: data
    };
  }
};
\`\`\`

### 2. Data Validation
Valideer data voor en na transformatie:

\`\`\`javascript
const validateTransformation = (input, output, schema) => {
  // Valideer output tegen schema
  const validation = schema.validate(output);
  
  if (!validation.valid) {
    console.error('Transformation validation failed:', {
      input,
      output,
      errors: validation.errors
    });
    throw new Error('Invalid transformation result');
  }
  
  return output;
};
\`\`\`

### 3. Performance Monitoring
Monitor transformatie performance:

\`\`\`javascript
const measureTransformation = async (name, fn) => {
  const start = Date.now();
  const startMemory = process.memoryUsage().heapUsed;
  
  const result = await fn();
  
  const duration = Date.now() - start;
  const memoryDelta = process.memoryUsage().heapUsed - startMemory;
  
  console.log(\`Transformation "\${name}": \${duration}ms, Memory: \${memoryDelta / 1024 / 1024}MB\`);
  
  return result;
};
\`\`\`

## Praktijkvoorbeeld: Complete Transformatie Pipeline

Laten we alle concepten combineren in een real-world voorbeeld:

\`\`\`javascript
// Complete order transformatie pipeline
async function transformOrderData(rawOrders) {
  const pipeline = new TransformationPipeline()
    // Stap 1: Normaliseer raw data
    .add(async (orders) => {
      return orders.map(order => ({
        ...order,
        email: normalizeEmail(order.customer_email),
        phone: normalizePhone(order.customer_phone),
        orderDate: normalizeDate(order.created_at),
        currency: normalizeCurrency(order.total)
      }));
    })
    
    // Stap 2: Filter ongeldige orders
    .add(async (orders) => {
      return orders.filter(order => 
        order.status !== 'cancelled' &&
        order.currency.amount > 0
      );
    })
    
    // Stap 3: Verrijk met klantdata
    .add(async (orders) => {
      const enriched = [];
      
      for (const order of orders) {
        const customerData = await fetchCustomerData(order.email);
        enriched.push({
          ...order,
          customer: {
            ...order.customer,
            segment: customerData.segment,
            lifetimeValue: customerData.ltv
          }
        });
      }
      
      return enriched;
    })
    
    // Stap 4: Aggregeer per klant
    .add(async (orders) => {
      const grouped = orders.reduce((acc, order) => {
        const key = order.email;
        if (!acc[key]) {
          acc[key] = {
            customer: order.customer,
            orders: [],
            metrics: {
              totalOrders: 0,
              totalSpent: 0,
              averageOrderValue: 0
            }
          };
        }
        
        acc[key].orders.push(order);
        acc[key].metrics.totalOrders++;
        acc[key].metrics.totalSpent += order.currency.amount;
        
        return acc;
      }, {});
      
      // Bereken gemiddelden
      Object.values(grouped).forEach(customer => {
        customer.metrics.averageOrderValue = 
          customer.metrics.totalSpent / customer.metrics.totalOrders;
      });
      
      return grouped;
    });
  
  // Process in batches voor performance
  const results = await processBatches(rawOrders, 50, 
    batch => pipeline.process(batch)
  );
  
  return results;
}
\`\`\`

## Samenvatting

Data transformatie is een cruciale vaardigheid voor succesvolle API integraties. De belangrijkste takeaways:

1. **Schema Mapping**: Begrijp beide systemen goed voordat je begint met mappen
2. **Enrichment**: Voeg waarde toe door data te verrijken met extra context
3. **Aggregation**: Groepeer en vat data samen voor betere inzichten
4. **Normalization**: Zorg voor consistente data formats
5. **Stream Processing**: Gebruik efficiënte patterns voor grote datasets
6. **Error Handling**: Implementeer robuuste foutafhandeling
7. **Performance**: Monitor en optimaliseer je transformaties

Met deze patterns en technieken ben je uitgerust om complexe data transformaties te bouwen die schaalbaar, betrouwbaar en onderhoudbaar zijn.
`
};