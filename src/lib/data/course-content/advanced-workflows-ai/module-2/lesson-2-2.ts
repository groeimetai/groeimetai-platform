import { Lesson } from '@/lib/data/courses';

export const lesson2_2: Lesson = {
  id: 'lesson-2-2',
  title: 'Werken met complexe datastructuren',
  duration: '35 min',
  content: `
# Werken met complexe datastructuren

## Introductie

In moderne workflows werk je vaak met complexe datastructuren uit APIs, databases, en andere bronnen. Deze les leert je hoe je effectief navigeert, manipuleert, en transformeert door geneste JSON objecten, arrays, en hybride structuren. Je leert de kracht van JavaScript's array methods en hoe je deze toepast in workflow automatisering.

## Nested JSON handling

### Navigeren door diepe structuren

Complexe API responses bevatten vaak diep geneste data. Leer veilig door deze structuren te navigeren:

\`\`\`javascript
// Voorbeeld API response van een e-commerce platform
const orderResponse = {
  order: {
    id: "ORD-12345",
    customer: {
      profile: {
        personal: {
          firstName: "Jan",
          lastName: "Jansen",
          email: "jan@example.com"
        },
        address: {
          shipping: {
            street: "Kalverstraat 1",
            city: "Amsterdam",
            country: "NL"
          },
          billing: {
            street: "Damrak 50",
            city: "Amsterdam",
            country: "NL"
          }
        }
      },
      preferences: {
        notifications: {
          email: true,
          sms: false
        }
      }
    },
    items: [
      {
        product: {
          id: "PROD-789",
          details: {
            name: "Laptop",
            specifications: {
              processor: "Intel i7",
              memory: "16GB"
            }
          }
        },
        quantity: 1,
        price: {
          amount: 999.99,
          currency: "EUR"
        }
      }
    ]
  }
};

// Veilige navigatie met optional chaining
const customerEmail = orderResponse?.order?.customer?.profile?.personal?.email;
const shippingCity = orderResponse?.order?.customer?.profile?.address?.shipping?.city;

// Destructuring voor cleaner code
const { 
  order: { 
    customer: { 
      profile: { 
        personal: { firstName, lastName } 
      } 
    } 
  } 
} = orderResponse;

// Helper functie voor veilige pad navigatie
function getNestedValue(obj, path, defaultValue = null) {
  return path.split('.').reduce((current, key) => 
    current?.[key] ?? defaultValue, obj
  );
}

// Gebruik:
const email = getNestedValue(orderResponse, 'order.customer.profile.personal.email', 'no-email');
\`\`\`

### Werken met onvoorspelbare structuren

API responses kunnen variëren in structuur. Implementeer robuuste parsing:

\`\`\`javascript
// Flexibele data extractor
class DataExtractor {
  constructor(data) {
    this.data = data;
  }
  
  // Extract met fallback strategieën
  extractCustomerInfo() {
    // Probeer verschillende paden
    const paths = [
      'order.customer.profile',
      'customer.profile',
      'profile',
      'user'
    ];
    
    for (const path of paths) {
      const value = this.getPath(path);
      if (value) return value;
    }
    
    return null;
  }
  
  // Recursief zoeken naar specifieke keys
  findAllByKey(key, obj = this.data, results = []) {
    if (obj && typeof obj === 'object') {
      for (const [k, v] of Object.entries(obj)) {
        if (k === key) {
          results.push(v);
        }
        if (typeof v === 'object') {
          this.findAllByKey(key, v, results);
        }
      }
    }
    return results;
  }
  
  getPath(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this.data);
  }
}

// Gebruik
const extractor = new DataExtractor(orderResponse);
const allEmails = extractor.findAllByKey('email'); // Vindt alle email velden
\`\`\`

## Array operations

### Map: Transformeer elk element

De map methode transformeert arrays door een functie toe te passen op elk element:

\`\`\`javascript
// API response met producten
const productsResponse = {
  products: [
    { id: 1, name: "Laptop", price: 999, tax: 0.21, inStock: true },
    { id: 2, name: "Mouse", price: 29, tax: 0.21, inStock: false },
    { id: 3, name: "Keyboard", price: 79, tax: 0.21, inStock: true }
  ]
};

// Transform products voor frontend display
const displayProducts = productsResponse.products.map(product => ({
  id: product.id,
  displayName: product.name.toUpperCase(),
  finalPrice: (product.price * (1 + product.tax)).toFixed(2),
  availability: product.inStock ? 'Beschikbaar' : 'Uitverkocht',
  badge: product.price > 100 ? 'Premium' : 'Budget'
}));

// Complexere transformatie met conditionele logica
const enrichedProducts = productsResponse.products.map(product => {
  const basePrice = product.price;
  const taxAmount = basePrice * product.tax;
  const finalPrice = basePrice + taxAmount;
  
  return {
    ...product, // Behoud originele properties
    pricing: {
      base: basePrice,
      tax: taxAmount,
      final: finalPrice,
      formatted: \`€\${finalPrice.toFixed(2)}\`
    },
    metadata: {
      addedAt: new Date().toISOString(),
      source: 'api',
      processed: true
    }
  };
});

// Nested arrays transformeren
const orderItems = [
  {
    orderId: "ORD-1",
    items: [
      { name: "Item A", qty: 2 },
      { name: "Item B", qty: 1 }
    ]
  },
  {
    orderId: "ORD-2",
    items: [
      { name: "Item C", qty: 3 }
    ]
  }
];

// Flatten en transform nested items
const allItems = orderItems.flatMap(order => 
  order.items.map(item => ({
    ...item,
    orderId: order.orderId,
    totalQty: item.qty
  }))
);
\`\`\`

### Filter: Selecteer specifieke elementen

Filter creëert een nieuwe array met alleen elementen die aan een conditie voldoen:

\`\`\`javascript
// Database records van gebruikers
const users = [
  { id: 1, name: "Alice", age: 28, role: "admin", active: true, lastLogin: "2024-01-15" },
  { id: 2, name: "Bob", age: 35, role: "user", active: true, lastLogin: "2024-01-10" },
  { id: 3, name: "Carol", age: 42, role: "admin", active: false, lastLogin: "2023-12-01" },
  { id: 4, name: "David", age: 25, role: "user", active: true, lastLogin: "2024-01-14" }
];

// Simpele filters
const activeUsers = users.filter(user => user.active);
const adminUsers = users.filter(user => user.role === 'admin');

// Complexe filter condities
const recentActiveAdmins = users.filter(user => {
  const lastLoginDate = new Date(user.lastLogin);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return user.active && 
         user.role === 'admin' && 
         lastLoginDate > thirtyDaysAgo;
});

// Filter met meerdere criteria functies
const filterCriteria = {
  byAge: (min, max) => user => user.age >= min && user.age <= max,
  byRole: (role) => user => user.role === role,
  byActivity: (daysAgo) => user => {
    const lastLogin = new Date(user.lastLogin);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysAgo);
    return lastLogin > cutoff;
  }
};

// Combineer filters
const targetUsers = users
  .filter(filterCriteria.byAge(25, 40))
  .filter(filterCriteria.byRole('user'))
  .filter(filterCriteria.byActivity(7));

// Dynamic filter builder
function buildFilter(conditions) {
  return (item) => {
    return conditions.every(condition => {
      const { field, operator, value } = condition;
      
      switch(operator) {
        case 'equals': return item[field] === value;
        case 'contains': return item[field].includes(value);
        case 'greater': return item[field] > value;
        case 'less': return item[field] < value;
        case 'in': return value.includes(item[field]);
        default: return true;
      }
    });
  };
}

// Gebruik dynamic filter
const dynamicConditions = [
  { field: 'age', operator: 'greater', value: 25 },
  { field: 'role', operator: 'in', value: ['admin', 'moderator'] },
  { field: 'active', operator: 'equals', value: true }
];

const filteredUsers = users.filter(buildFilter(dynamicConditions));
\`\`\`

### Reduce: Aggregeer data

Reduce is de meest krachtige array methode voor het aggregeren en transformeren van data:

\`\`\`javascript
// Sales data van een API
const salesData = [
  { date: "2024-01-01", product: "Laptop", amount: 999, quantity: 1, category: "Electronics" },
  { date: "2024-01-01", product: "Mouse", amount: 29, quantity: 2, category: "Electronics" },
  { date: "2024-01-02", product: "Desk", amount: 299, quantity: 1, category: "Furniture" },
  { date: "2024-01-02", product: "Chair", amount: 199, quantity: 2, category: "Furniture" },
  { date: "2024-01-03", product: "Laptop", amount: 999, quantity: 1, category: "Electronics" }
];

// Basis aggregatie: totale omzet
const totalRevenue = salesData.reduce((sum, sale) => sum + sale.amount, 0);

// Groepeer per categorie
const salesByCategory = salesData.reduce((acc, sale) => {
  if (!acc[sale.category]) {
    acc[sale.category] = {
      totalAmount: 0,
      totalQuantity: 0,
      products: new Set()
    };
  }
  
  acc[sale.category].totalAmount += sale.amount;
  acc[sale.category].totalQuantity += sale.quantity;
  acc[sale.category].products.add(sale.product);
  
  return acc;
}, {});

// Complex: Creëer een pivot table
const pivotTable = salesData.reduce((acc, sale) => {
  const { date, category, amount, quantity } = sale;
  
  // Initialize date if not exists
  if (!acc[date]) {
    acc[date] = {};
  }
  
  // Initialize category if not exists
  if (!acc[date][category]) {
    acc[date][category] = {
      revenue: 0,
      units: 0,
      transactions: 0
    };
  }
  
  // Aggregate data
  acc[date][category].revenue += amount;
  acc[date][category].units += quantity;
  acc[date][category].transactions += 1;
  
  return acc;
}, {});

// Geavanceerd: Multi-level statistics
const statistics = salesData.reduce((stats, sale) => {
  // Update overall stats
  stats.total.revenue += sale.amount;
  stats.total.transactions += 1;
  stats.total.units += sale.quantity;
  
  // Update product stats
  if (!stats.byProduct[sale.product]) {
    stats.byProduct[sale.product] = {
      revenue: 0,
      units: 0,
      avgPrice: 0,
      transactions: 0
    };
  }
  
  const productStats = stats.byProduct[sale.product];
  productStats.revenue += sale.amount;
  productStats.units += sale.quantity;
  productStats.transactions += 1;
  productStats.avgPrice = productStats.revenue / productStats.units;
  
  // Find min/max
  if (sale.amount > stats.maxSale.amount) {
    stats.maxSale = sale;
  }
  if (sale.amount < stats.minSale.amount) {
    stats.minSale = sale;
  }
  
  return stats;
}, {
  total: { revenue: 0, transactions: 0, units: 0 },
  byProduct: {},
  maxSale: { amount: 0 },
  minSale: { amount: Infinity }
});
\`\`\`

## Object manipulation

### Deep cloning en merging

Werk veilig met objecten zonder originelen te muteren:

\`\`\`javascript
// Deep clone functie
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  
  const clonedObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }
  return clonedObj;
}

// Deep merge functie
function deepMerge(target, source) {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }
  
  return output;
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// Gebruik in workflow context
const defaultConfig = {
  api: {
    endpoint: 'https://api.example.com',
    timeout: 5000,
    retries: 3
  },
  features: {
    logging: true,
    cache: false
  }
};

const userConfig = {
  api: {
    timeout: 10000,
    headers: { 'X-API-Key': 'secret' }
  },
  features: {
    cache: true
  }
};

const finalConfig = deepMerge(defaultConfig, userConfig);
\`\`\`

### Object transformaties

Transform objecten voor verschillende use cases:

\`\`\`javascript
// Object key/value manipulatie
const apiResponse = {
  user_id: 123,
  first_name: "John",
  last_name: "Doe",
  email_address: "john@example.com",
  created_at: "2024-01-15T10:00:00Z"
};

// Snake_case naar camelCase
function toCamelCase(obj) {
  const transformed = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    transformed[camelKey] = value;
  }
  
  return transformed;
}

// Pick specifieke velden
function pick(obj, fields) {
  return fields.reduce((result, field) => {
    if (field in obj) {
      result[field] = obj[field];
    }
    return result;
  }, {});
}

// Omit specifieke velden
function omit(obj, fields) {
  const result = { ...obj };
  fields.forEach(field => delete result[field]);
  return result;
}

// Rename keys
function renameKeys(obj, keyMap) {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const newKey = keyMap[key] || key;
    acc[newKey] = value;
    return acc;
  }, {});
}

// Gebruik
const camelCased = toCamelCase(apiResponse);
const picked = pick(camelCased, ['userId', 'email']);
const omitted = omit(camelCased, ['createdAt']);
const renamed = renameKeys(camelCased, {
  userId: 'id',
  emailAddress: 'email'
});
\`\`\`

## Data flattening en normalization

### Flatten nested structures

Converteer geneste structuren naar platte formaten:

\`\`\`javascript
// Flatten functie met pad notatie
function flattenObject(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, key) => {
    const pre = prefix.length ? \`\${prefix}.\` : '';
    
    if (obj[key] === null || obj[key] === undefined) {
      acc[pre + key] = obj[key];
    } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
      Object.assign(acc, flattenObject(obj[key], pre + key));
    } else {
      acc[pre + key] = obj[key];
    }
    
    return acc;
  }, {});
}

// Voorbeeld gebruik
const nestedData = {
  user: {
    profile: {
      name: "John Doe",
      contact: {
        email: "john@example.com",
        phone: "+31612345678"
      }
    },
    settings: {
      notifications: {
        email: true,
        sms: false
      }
    }
  }
};

const flattened = flattenObject(nestedData);
// Result:
// {
//   "user.profile.name": "John Doe",
//   "user.profile.contact.email": "john@example.com",
//   "user.profile.contact.phone": "+31612345678",
//   "user.settings.notifications.email": true,
//   "user.settings.notifications.sms": false
// }

// Unflatten terug naar nested
function unflattenObject(obj) {
  const result = {};
  
  for (const key in obj) {
    const keys = key.split('.');
    let current = result;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = obj[key];
  }
  
  return result;
}
\`\`\`

### Normalize relational data

Normaliseer data voor efficiente opslag en verwerking:

\`\`\`javascript
// Denormalized data van API
const blogPosts = [
  {
    id: 1,
    title: "First Post",
    author: {
      id: 101,
      name: "Alice",
      email: "alice@example.com"
    },
    comments: [
      {
        id: 201,
        text: "Great post!",
        user: {
          id: 102,
          name: "Bob"
        }
      },
      {
        id: 202,
        text: "Thanks for sharing",
        user: {
          id: 103,
          name: "Carol"
        }
      }
    ]
  },
  {
    id: 2,
    title: "Second Post",
    author: {
      id: 101,
      name: "Alice",
      email: "alice@example.com"
    },
    comments: [
      {
        id: 203,
        text: "Interesting",
        user: {
          id: 102,
          name: "Bob"
        }
      }
    ]
  }
];

// Normalize functie
function normalizeData(posts) {
  const normalized = {
    posts: {},
    authors: {},
    comments: {},
    users: {}
  };
  
  posts.forEach(post => {
    // Store author
    normalized.authors[post.author.id] = post.author;
    
    // Store post zonder nested data
    normalized.posts[post.id] = {
      id: post.id,
      title: post.title,
      authorId: post.author.id,
      commentIds: post.comments.map(c => c.id)
    };
    
    // Store comments en users
    post.comments.forEach(comment => {
      normalized.users[comment.user.id] = comment.user;
      
      normalized.comments[comment.id] = {
        id: comment.id,
        text: comment.text,
        userId: comment.user.id,
        postId: post.id
      };
    });
  });
  
  return normalized;
}

// Denormalize functie voor display
function denormalizePost(postId, normalized) {
  const post = normalized.posts[postId];
  
  return {
    ...post,
    author: normalized.authors[post.authorId],
    comments: post.commentIds.map(commentId => {
      const comment = normalized.comments[commentId];
      return {
        ...comment,
        user: normalized.users[comment.userId]
      };
    })
  };
}
\`\`\`

## Schema validation

### Implementeer robuuste validatie

Valideer data structuren voor betrouwbare workflows:

\`\`\`javascript
// Schema validator class
class SchemaValidator {
  constructor(schema) {
    this.schema = schema;
  }
  
  validate(data) {
    const errors = [];
    this._validateObject(data, this.schema, '', errors);
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
  
  _validateObject(data, schema, path, errors) {
    // Check required fields
    if (schema.required) {
      schema.required.forEach(field => {
        if (!(field in data)) {
          errors.push({
            path: path ? \`\${path}.\${field}\` : field,
            message: 'Required field missing'
          });
        }
      });
    }
    
    // Validate properties
    if (schema.properties) {
      Object.entries(schema.properties).forEach(([key, propSchema]) => {
        const value = data[key];
        const currentPath = path ? \`\${path}.\${key}\` : key;
        
        if (value !== undefined) {
          this._validateValue(value, propSchema, currentPath, errors);
        }
      });
    }
  }
  
  _validateValue(value, schema, path, errors) {
    // Type validation
    if (schema.type) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      
      if (actualType !== schema.type) {
        errors.push({
          path,
          message: \`Expected type \${schema.type}, got \${actualType}\`
        });
        return;
      }
    }
    
    // String validations
    if (schema.type === 'string') {
      if (schema.minLength && value.length < schema.minLength) {
        errors.push({
          path,
          message: \`String length must be at least \${schema.minLength}\`
        });
      }
      
      if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
        errors.push({
          path,
          message: \`String does not match pattern \${schema.pattern}\`
        });
      }
    }
    
    // Number validations
    if (schema.type === 'number') {
      if (schema.minimum !== undefined && value < schema.minimum) {
        errors.push({
          path,
          message: \`Value must be at least \${schema.minimum}\`
        });
      }
      
      if (schema.maximum !== undefined && value > schema.maximum) {
        errors.push({
          path,
          message: \`Value must be at most \${schema.maximum}\`
        });
      }
    }
    
    // Array validations
    if (schema.type === 'array') {
      if (schema.minItems && value.length < schema.minItems) {
        errors.push({
          path,
          message: \`Array must have at least \${schema.minItems} items\`
        });
      }
      
      if (schema.items) {
        value.forEach((item, index) => {
          this._validateValue(item, schema.items, \`\${path}[\${index}]\`, errors);
        });
      }
    }
    
    // Object validations
    if (schema.type === 'object' && schema.properties) {
      this._validateObject(value, schema, path, errors);
    }
  }
}

// Definieer schema voor order data
const orderSchema = {
  type: 'object',
  required: ['orderId', 'customer', 'items', 'totalAmount'],
  properties: {
    orderId: {
      type: 'string',
      pattern: '^ORD-[0-9]+$'
    },
    customer: {
      type: 'object',
      required: ['email', 'name'],
      properties: {
        email: {
          type: 'string',
          pattern: '^[^@]+@[^@]+\\.[^@]+$'
        },
        name: {
          type: 'string',
          minLength: 2
        }
      }
    },
    items: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['productId', 'quantity', 'price'],
        properties: {
          productId: { type: 'string' },
          quantity: { 
            type: 'number',
            minimum: 1
          },
          price: {
            type: 'number',
            minimum: 0
          }
        }
      }
    },
    totalAmount: {
      type: 'number',
      minimum: 0
    }
  }
};

// Gebruik validator
const validator = new SchemaValidator(orderSchema);

const orderData = {
  orderId: "ORD-12345",
  customer: {
    email: "john@example.com",
    name: "John Doe"
  },
  items: [
    {
      productId: "PROD-001",
      quantity: 2,
      price: 29.99
    }
  ],
  totalAmount: 59.98
};

const validation = validator.validate(orderData);
console.log(\`Valid: \${validation.valid}\`);
if (!validation.valid) {
  console.log('Errors:', validation.errors);
}
\`\`\`

### Praktische schema validatie in workflows

\`\`\`javascript
// N8N Function node voor API response validatie
const items = \$input.all();
const validatedItems = [];

// Schema voor verwachte API response
const apiResponseSchema = {
  type: 'object',
  required: ['status', 'data'],
  properties: {
    status: {
      type: 'string',
      enum: ['success', 'error', 'pending']
    },
    data: {
      type: 'object',
      properties: {
        results: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'name'],
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              metadata: { type: 'object' }
            }
          }
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            totalPages: { type: 'number' },
            hasMore: { type: 'boolean' }
          }
        }
      }
    }
  }
};

// Valideer elke response
items.forEach(item => {
  const validator = new SchemaValidator(apiResponseSchema);
  const validation = validator.validate(item.json);
  
  if (validation.valid) {
    validatedItems.push({
      json: {
        ...item.json,
        _validated: true,
        _processedAt: new Date().toISOString()
      }
    });
  } else {
    // Route naar error handling
    validatedItems.push({
      json: {
        _error: true,
        _originalData: item.json,
        _validationErrors: validation.errors,
        _needsManualReview: true
      }
    });
  }
});

return validatedItems;
\`\`\`

## Best practices

1. **Defensive programming**: Gebruik altijd optional chaining (?.) en nullish coalescing (??)
2. **Immutability**: Vermijd het muteren van originele data structures
3. **Type checking**: Valideer data types voordat je transformaties uitvoert
4. **Error boundaries**: Implementeer try-catch blocks voor robuuste error handling
5. **Performance**: Overweeg data grootte bij het kiezen van transformatie methodes
6. **Documentation**: Documenteer complexe transformaties voor toekomstig onderhoud

## Praktijkopdracht

Bouw een complete data processing pipeline die:
1. Een complexe API response (geneste JSON) ontvangt
2. De data valideert tegen een schema
3. Geneste structuren flattent voor database opslag
4. Arrays filtert en transformeert op basis van business rules
5. Data aggregeert voor reporting doeleinden
6. Error handling implementeert voor ongeldige data

De pipeline moet robuust zijn en verschillende data formaten aankunnen.
  `,
  codeExamples: [
    {
      id: 'complete-data-transformation-pipeline',
      title: 'Complete data transformation pipeline',
      language: 'javascript',
      code: `// N8N Function node: Complete data transformation pipeline

// Input: Raw API response with complex nested structure
const apiResponse = \$input.first().json;

// Step 1: Schema Validator
class DataValidator {
  constructor(schema) {
    this.schema = schema;
  }
  
  validate(data, path = '') {
    const errors = [];
    
    for (const [field, rules] of Object.entries(this.schema)) {
      const value = data[field];
      const fieldPath = path ? \`\${path}.\${field}\` : field;
      
      // Required check
      if (rules.required && (value === undefined || value === null)) {
        errors.push({ path: fieldPath, error: 'Field is required' });
        continue;
      }
      
      // Type check
      if (value !== undefined && rules.type) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== rules.type) {
          errors.push({ 
            path: fieldPath, 
            error: \`Expected \${rules.type}, got \${actualType}\` 
          });
        }
      }
      
      // Nested validation
      if (rules.type === 'object' && rules.properties && value) {
        const nestedValidator = new DataValidator(rules.properties);
        errors.push(...nestedValidator.validate(value, fieldPath));
      }
      
      // Array validation
      if (rules.type === 'array' && rules.items && value) {
        value.forEach((item, index) => {
          const itemValidator = new DataValidator(rules.items);
          errors.push(...itemValidator.validate(item, \`\${fieldPath}[\${index}]\`));
        });
      }
    }
    
    return errors;
  }
}

// Step 2: Data Transformer
class DataTransformer {
  constructor(data) {
    this.data = data;
  }
  
  // Flatten nested objects
  flatten(prefix = '') {
    const flattened = {};
    
    const flattenObject = (obj, currentPrefix) => {
      for (const [key, value] of Object.entries(obj)) {
        const newKey = currentPrefix ? \`\${currentPrefix}.\${key}\` : key;
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          flattenObject(value, newKey);
        } else {
          flattened[newKey] = value;
        }
      }
    };
    
    flattenObject(this.data, prefix);
    return flattened;
  }
  
  // Normalize relational data
  normalize() {
    const entities = {
      customers: {},
      orders: {},
      products: {},
      orderItems: {}
    };
    
    // Extract customers
    if (this.data.customers) {
      this.data.customers.forEach(customer => {
        entities.customers[customer.id] = {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          orderIds: customer.orders ? customer.orders.map(o => o.id) : []
        };
        
        // Extract orders
        if (customer.orders) {
          customer.orders.forEach(order => {
            entities.orders[order.id] = {
              id: order.id,
              customerId: customer.id,
              date: order.date,
              status: order.status,
              itemIds: []
            };
            
            // Extract order items
            if (order.items) {
              order.items.forEach((item, index) => {
                const itemId = \`\${order.id}-\${index}\`;
                entities.orderItems[itemId] = {
                  id: itemId,
                  orderId: order.id,
                  productId: item.productId,
                  quantity: item.quantity,
                  price: item.price
                };
                entities.orders[order.id].itemIds.push(itemId);
                
                // Extract product info
                if (item.product) {
                  entities.products[item.productId] = item.product;
                }
              });
            }
          });
        }
      });
    }
    
    return entities;
  }
  
  // Apply business transformations
  transform(rules) {
    const transformed = JSON.parse(JSON.stringify(this.data)); // Deep clone
    
    rules.forEach(rule => {
      const { path, transformation } = rule;
      const pathParts = path.split('.');
      let current = transformed;
      
      // Navigate to the target
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (!current[pathParts[i]]) return;
        current = current[pathParts[i]];
      }
      
      const lastKey = pathParts[pathParts.length - 1];
      if (current[lastKey] !== undefined) {
        current[lastKey] = transformation(current[lastKey]);
      }
    });
    
    return transformed;
  }
}

// Step 3: Data Aggregator
class DataAggregator {
  constructor(data) {
    this.data = data;
  }
  
  aggregate(config) {
    const results = {};
    
    for (const [name, aggregation] of Object.entries(config)) {
      if (aggregation.type === 'sum') {
        results[name] = this.sum(aggregation.field);
      } else if (aggregation.type === 'average') {
        results[name] = this.average(aggregation.field);
      } else if (aggregation.type === 'count') {
        results[name] = this.count(aggregation.condition);
      } else if (aggregation.type === 'groupBy') {
        results[name] = this.groupBy(aggregation.field, aggregation.aggregate);
      }
    }
    
    return results;
  }
  
  sum(field) {
    return this.data.reduce((total, item) => {
      const value = this.getNestedValue(item, field);
      return total + (Number(value) || 0);
    }, 0);
  }
  
  average(field) {
    const sum = this.sum(field);
    return this.data.length > 0 ? sum / this.data.length : 0;
  }
  
  count(condition) {
    if (!condition) return this.data.length;
    return this.data.filter(item => condition(item)).length;
  }
  
  groupBy(field, aggregate) {
    const groups = {};
    
    this.data.forEach(item => {
      const key = this.getNestedValue(item, field);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });
    
    // Apply aggregation to each group
    if (aggregate) {
      const aggregatedGroups = {};
      for (const [key, items] of Object.entries(groups)) {
        const aggregator = new DataAggregator(items);
        aggregatedGroups[key] = aggregator.aggregate(aggregate);
      }
      return aggregatedGroups;
    }
    
    return groups;
  }
  
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

// Define schema for validation
const orderSchema = {
  customers: {
    type: 'array',
    required: true,
    items: {
      id: { type: 'string', required: true },
      name: { type: 'string', required: true },
      email: { type: 'string', required: true },
      orders: {
        type: 'array',
        items: {
          id: { type: 'string', required: true },
          date: { type: 'string', required: true },
          status: { type: 'string', required: true },
          items: {
            type: 'array',
            required: true,
            items: {
              productId: { type: 'string', required: true },
              quantity: { type: 'number', required: true },
              price: { type: 'number', required: true }
            }
          }
        }
      }
    }
  }
};

// Main processing pipeline
try {
  // Step 1: Validate
  const validator = new DataValidator(orderSchema);
  const errors = validator.validate(apiResponse);
  
  if (errors.length > 0) {
    return [{
      json: {
        success: false,
        errors: errors,
        message: 'Validation failed',
        timestamp: new Date().toISOString()
      }
    }];
  }
  
  // Step 2: Transform
  const transformer = new DataTransformer(apiResponse);
  
  // Flatten for database storage
  const flattened = transformer.flatten();
  
  // Normalize relational data
  const normalized = transformer.normalize();
  
  // Apply business rules
  const transformed = transformer.transform([
    {
      path: 'customers',
      transformation: (customers) => customers.map(c => ({
        ...c,
        displayName: c.name.toUpperCase(),
        isVip: c.orders && c.orders.length > 5
      }))
    }
  ]);
  
  // Step 3: Aggregate
  if (apiResponse.customers) {
    const allOrders = apiResponse.customers.flatMap(c => c.orders || []);
    const aggregator = new DataAggregator(allOrders);
    
    const aggregations = aggregator.aggregate({
      totalOrders: { type: 'count' },
      totalRevenue: { type: 'sum', field: 'items' },
      ordersByStatus: { 
        type: 'groupBy', 
        field: 'status',
        aggregate: {
          count: { type: 'count' },
          avgValue: { type: 'average', field: 'totalAmount' }
        }
      }
    });
    
    // Return processed data
    return [{
      json: {
        success: true,
        timestamp: new Date().toISOString(),
        original: apiResponse,
        flattened: flattened,
        normalized: normalized,
        transformed: transformed,
        aggregations: aggregations,
        metadata: {
          recordCount: apiResponse.customers?.length || 0,
          processingTime: Date.now() - startTime + 'ms'
        }
      }
    }];
  }
  
} catch (error) {
  return [{
    json: {
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }
  }];
}

const startTime = Date.now();`
    },
    {
      id: 'advanced-array-operations-combination',
      title: 'Advanced array operations combinatie',
      language: 'javascript',
      code: `// Complex data processing met gecombineerde array operations

// Sample database export
const salesData = [
  {
    id: 'TX-001',
    date: '2024-01-15',
    customer: { id: 'C-101', name: 'ABC Corp', tier: 'premium' },
    items: [
      { sku: 'LAPTOP-01', name: 'Pro Laptop', qty: 2, price: 1200, category: 'electronics' },
      { sku: 'MOUSE-01', name: 'Wireless Mouse', qty: 5, price: 50, category: 'accessories' }
    ],
    payment: { method: 'credit', status: 'completed' },
    shipping: { method: 'express', cost: 25 }
  },
  {
    id: 'TX-002',
    date: '2024-01-16',
    customer: { id: 'C-102', name: 'XYZ Ltd', tier: 'standard' },
    items: [
      { sku: 'DESK-01', name: 'Standing Desk', qty: 1, price: 500, category: 'furniture' },
      { sku: 'CHAIR-01', name: 'Ergonomic Chair', qty: 2, price: 300, category: 'furniture' }
    ],
    payment: { method: 'invoice', status: 'pending' },
    shipping: { method: 'standard', cost: 50 }
  }
];

// Advanced processing pipeline
const processingPipeline = {
  // Step 1: Flatten and enrich items
  extractItems: (sales) => {
    return sales.flatMap(sale => 
      sale.items.map(item => ({
        ...item,
        transactionId: sale.id,
        transactionDate: sale.date,
        customerId: sale.customer.id,
        customerName: sale.customer.name,
        customerTier: sale.customer.tier,
        paymentStatus: sale.payment.status,
        totalValue: item.qty * item.price
      }))
    );
  },
  
  // Step 2: Filter and transform based on business rules
  applyBusinessRules: (items) => {
    return items
      .filter(item => item.paymentStatus === 'completed') // Only completed payments
      .map(item => ({
        ...item,
        discount: item.customerTier === 'premium' ? 0.1 : 0,
        finalPrice: item.price * (1 - (item.customerTier === 'premium' ? 0.1 : 0))
      }))
      .filter(item => item.totalValue > 100); // Only significant transactions
  },
  
  // Step 3: Complex aggregations
  generateAnalytics: (items) => {
    // Group by multiple dimensions
    const analytics = items.reduce((acc, item) => {
      // By category
      if (!acc.byCategory[item.category]) {
        acc.byCategory[item.category] = {
          items: [],
          totalRevenue: 0,
          totalUnits: 0,
          uniqueCustomers: new Set()
        };
      }
      
      acc.byCategory[item.category].items.push(item);
      acc.byCategory[item.category].totalRevenue += item.totalValue;
      acc.byCategory[item.category].totalUnits += item.qty;
      acc.byCategory[item.category].uniqueCustomers.add(item.customerId);
      
      // By customer tier
      if (!acc.byTier[item.customerTier]) {
        acc.byTier[item.customerTier] = {
          transactions: 0,
          revenue: 0,
          avgOrderValue: 0
        };
      }
      
      acc.byTier[item.customerTier].transactions += 1;
      acc.byTier[item.customerTier].revenue += item.totalValue;
      
      // Top products
      if (!acc.topProducts[item.sku]) {
        acc.topProducts[item.sku] = {
          name: item.name,
          totalSold: 0,
          revenue: 0,
          transactions: 0
        };
      }
      
      acc.topProducts[item.sku].totalSold += item.qty;
      acc.topProducts[item.sku].revenue += item.totalValue;
      acc.topProducts[item.sku].transactions += 1;
      
      return acc;
    }, {
      byCategory: {},
      byTier: {},
      topProducts: {}
    });
    
    // Calculate averages and convert Sets to counts
    Object.values(analytics.byCategory).forEach(cat => {
      cat.uniqueCustomerCount = cat.uniqueCustomers.size;
      delete cat.uniqueCustomers; // Remove Set from final output
      cat.avgOrderValue = cat.totalRevenue / cat.items.length;
    });
    
    Object.entries(analytics.byTier).forEach(([tier, data]) => {
      data.avgOrderValue = data.revenue / data.transactions;
    });
    
    // Sort top products
    analytics.topProductsList = Object.entries(analytics.topProducts)
      .sort(([,a], [,b]) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(([sku, data]) => ({ sku, ...data }));
    
    return analytics;
  },
  
  // Step 4: Generate summary report
  generateReport: (sales, analytics) => {
    const totalRevenue = sales
      .filter(s => s.payment.status === 'completed')
      .reduce((sum, sale) => {
        const saleTotal = sale.items.reduce((itemSum, item) => 
          itemSum + (item.qty * item.price), 0
        );
        return sum + saleTotal + sale.shipping.cost;
      }, 0);
    
    const report = {
      summary: {
        totalTransactions: sales.length,
        completedTransactions: sales.filter(s => s.payment.status === 'completed').length,
        totalRevenue: totalRevenue,
        avgTransactionValue: totalRevenue / sales.filter(s => s.payment.status === 'completed').length
      },
      categoryBreakdown: analytics.byCategory,
      customerTierAnalysis: analytics.byTier,
      topProducts: analytics.topProductsList,
      alerts: []
    };
    
    // Generate alerts based on data
    if (sales.some(s => s.payment.status === 'pending')) {
      report.alerts.push({
        type: 'warning',
        message: 'Pending payments detected',
        count: sales.filter(s => s.payment.status === 'pending').length
      });
    }
    
    return report;
  }
};

// Execute pipeline
const items = processingPipeline.extractItems(salesData);
const processed = processingPipeline.applyBusinessRules(items);
const analytics = processingPipeline.generateAnalytics(processed);
const report = processingPipeline.generateReport(salesData, analytics);

// Output for N8N
return [{
  json: {
    success: true,
    timestamp: new Date().toISOString(),
    report: report,
    processedItems: processed.length,
    debug: {
      originalCount: salesData.length,
      extractedItems: items.length,
      afterFiltering: processed.length
    }
  }
}];`
    }
  ],
  assignments: [
    {
      id: 'assignment-2-2-1',
      title: 'API Response Processor',
      description: 'Bouw een workflow die complexe API responses van verschillende endpoints verwerkt. De workflow moet: geneste JSON structuren kunnen navigeren, data valideren tegen dynamische schema\'s, arrays filteren en transformeren op basis van configureerbare regels, en genormaliseerde output genereren voor database opslag.',
      difficulty: 'hard',
      type: 'project'
    },
    {
      id: 'assignment-2-2-2',
      title: 'Database Migration Tool',
      description: 'Creëer een data transformatie pipeline die records uit een oude database structuur (gesimuleerd met nested JSON) migreert naar een nieuwe genormaliseerde structuur. Implementeer data flattening, relatie mapping, en uitgebreide validatie met error reporting.',
      difficulty: 'expert',
      type: 'project'
    }
  ],
  resources: [
    {
      title: 'MDN JavaScript Array Methods',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array',
      type: 'documentation'
    },
    {
      title: 'JSON Schema Validation',
      url: 'https://json-schema.org/learn/getting-started-step-by-step',
      type: 'guide'
    },
    {
      title: 'Data Normalization Patterns',
      url: 'https://redux.js.org/usage/structuring-reducers/normalizing-state-shape',
      type: 'article'
    }
  ]
};