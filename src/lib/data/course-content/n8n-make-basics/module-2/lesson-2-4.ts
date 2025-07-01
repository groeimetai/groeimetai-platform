import type { Lesson } from '@/lib/data/courses';

export const lesson2_4: Lesson = {
  id: 'lesson-2-4',
  title: 'Werken met JSON en data structuren',
  duration: '35 min',
  content: `
# Werken met JSON en Data Structuren

## JSON Basics voor Non-Developers

### Wat is JSON?
JSON (JavaScript Object Notation) is de universele taal voor data in automations. Het is een gestructureerde manier om informatie op te slaan.

### JSON Bouwstenen

#### 1. Objects (Objecten)
Een container met naam-waarde paren:
\`\`\`json
{
  "naam": "Jan de Vries",
  "email": "jan@example.com",
  "leeftijd": 35
}
\`\`\`

#### 2. Arrays (Lijsten)
Een geordende lijst van waarden:
\`\`\`json
[
  "appel",
  "peer",
  "banaan"
]
\`\`\`

#### 3. Basis Data Types
- **String**: \`"Dit is tekst"\` (altijd tussen quotes)
- **Number**: \`42\` of \`29.99\` (geen quotes)
- **Boolean**: \`true\` of \`false\` (geen quotes)
- **Null**: \`null\` (geen waarde)

### JSON Structuur Regels
1. Gebruik dubbele quotes voor strings
2. Geen komma na het laatste item
3. Keys moeten strings zijn
4. Geen comments toegestaan

## Array Handling

### Arrays in Automations
Arrays komen vaak voor bij:
- Lijst met producten in een order
- Multiple email adressen
- Batch operaties
- API responses met meerdere items

### Basic Array Operations

#### Toegang tot Array Items
\`\`\`javascript
// N8N
{{$json.items[0]}}  // Eerste item
{{$json.items[$json.items.length - 1]}}  // Laatste item

// Make
{1.items[1]}  // Let op: Make begint bij 1, niet 0!
{last(1.items)}  // Laatste item
\`\`\`

#### Loop Through Arrays
N8N - gebruik SplitInBatches of Item Lists node:
\`\`\`javascript
// In Function node
const results = [];
for (const item of $input.all()) {
  results.push({
    name: item.json.name.toUpperCase(),
    value: item.json.price * 1.21  // BTW toevoegen
  });
}
return results;
\`\`\`

Make - gebruik Iterator module:
\`\`\`json
{
  "array": "{{1.items}}",
  "output": {
    "name": "{{toUpperCase(item.name)}}",
    "valueWithTax": "{{item.price * 1.21}}"
  }
}
\`\`\`

### Array Transformations

#### Filter Arrays
\`\`\`javascript
// Alleen actieve items
items.filter(item => item.status === 'active')

// Items boven bepaalde prijs
products.filter(product => product.price > 100)

// Make filter syntax
{{filter(1.items; status = "active")}}
\`\`\`

#### Map Arrays
\`\`\`javascript
// Extract email addresses
contacts.map(contact => contact.email)

// Create new structure
orders.map(order => ({
  id: order.order_id,
  total: order.amount * 1.21,
  customer: order.customer_name
}))
\`\`\`

#### Reduce Arrays
\`\`\`javascript
// Som van alle bedragen
items.reduce((total, item) => total + item.amount, 0)

// Groepeer per categorie
products.reduce((groups, product) => {
  groups[product.category] = groups[product.category] || [];
  groups[product.category].push(product);
  return groups;
}, {})
\`\`\`

## Nested Data Structures

### Understanding Nesting
Real-world data is vaak genest:
\`\`\`json
{
  "order": {
    "id": "ORD-001",
    "customer": {
      "name": "Jan de Vries",
      "address": {
        "street": "Hoofdstraat 1",
        "city": "Amsterdam",
        "country": "NL"
      }
    },
    "items": [
      {
        "product": {
          "id": "PROD-A",
          "name": "Widget",
          "category": {
            "id": "CAT-1",
            "name": "Electronics"
          }
        },
        "quantity": 2,
        "price": 29.99
      }
    ]
  }
}
\`\`\`

### Accessing Nested Data
\`\`\`javascript
// Direct access
order.customer.address.city

// Safe access with optional chaining
order?.customer?.address?.city

// Default values voor missing data
order.customer?.phone || "Geen telefoon"

// Array binnen object
order.items[0].product.name

// Make syntax
{{1.order.customer.address.city}}
{{ifempty(1.order.customer.phone; "Geen telefoon")}}
\`\`\`

### Flattening Nested Data
Maak geneste data plat voor eenvoudiger gebruik:
\`\`\`javascript
function flattenOrder(order) {
  return {
    orderId: order.id,
    customerName: order.customer.name,
    customerEmail: order.customer.email,
    shippingStreet: order.customer.address.street,
    shippingCity: order.customer.address.city,
    shippingCountry: order.customer.address.country,
    itemCount: order.items.length,
    totalAmount: order.items.reduce((sum, item) => 
      sum + (item.quantity * item.price), 0
    ),
    productNames: order.items.map(item => item.product.name).join(', ')
  };
}
\`\`\`

## Praktische JSON Scenarios

### Scenario 1: API Response Handling
\`\`\`json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "profile": {
          "firstName": "Jan",
          "lastName": "de Vries",
          "preferences": {
            "newsletter": true,
            "language": "nl"
          }
        },
        "activity": {
          "lastLogin": "2024-01-15T10:30:00Z",
          "loginCount": 42
        }
      }
    ],
    "pagination": {
      "page": 1,
      "totalPages": 5,
      "totalItems": 123
    }
  }
}
\`\`\`

Extractie logic:
\`\`\`javascript
// Check of request succesvol was
if (response.success) {
  // Loop door users
  const processedUsers = response.data.users.map(user => ({
    fullName: \`\${user.profile.firstName} \${user.profile.lastName}\`,
    isActive: new Date(user.activity.lastLogin) > new Date(Date.now() - 30*24*60*60*1000),
    needsOnboarding: user.activity.loginCount < 5,
    language: user.profile.preferences.language
  }));
  
  // Check voor meer pagina's
  if (response.data.pagination.page < response.data.pagination.totalPages) {
    // Fetch next page
  }
}
\`\`\`

### Scenario 2: Building Complex JSON
Voor een CRM API request:
\`\`\`javascript
function buildCRMPayload(formData) {
  return {
    "contact": {
      "firstName": formData.name.split(' ')[0],
      "lastName": formData.name.split(' ').slice(1).join(' '),
      "email": formData.email.toLowerCase(),
      "phone": formData.phone?.replace(/\\D/g, ''), // Alleen cijfers
      "customFields": {
        "source": "Website Form",
        "submittedAt": new Date().toISOString(),
        "interests": formData.interests || []
      }
    },
    "company": formData.companyName ? {
      "name": formData.companyName,
      "size": formData.companySize,
      "industry": formData.industry
    } : null,
    "tags": [
      formData.newsletter ? "newsletter-subscriber" : null,
      formData.demo ? "demo-requested" : null,
      "web-form"
    ].filter(Boolean), // Verwijder null values
    "automation": {
      "enrollInWorkflow": formData.demo,
      "workflowId": "demo-followup"
    }
  };
}
\`\`\`

## Common JSON Patterns

### Pattern 1: Safe Data Access
\`\`\`javascript
// Gebruik optional chaining en defaults
const city = data?.address?.city || 'Unknown';

// Check array voor access
const firstItem = Array.isArray(data.items) && data.items.length > 0 
  ? data.items[0] 
  : null;

// Nested with fallback
const price = data?.pricing?.amount ?? data?.price ?? 0;
\`\`\`

### Pattern 2: Dynamic Key Access
\`\`\`javascript
// Wanneer key naam variabel is
const fieldName = 'email';
const value = data[fieldName];

// Multiple dynamic keys
const fields = ['name', 'email', 'phone'];
const extracted = fields.reduce((acc, field) => {
  acc[field] = data[field];
  return acc;
}, {});
\`\`\`

### Pattern 3: Merge and Combine
\`\`\`javascript
// Merge twee objecten
const merged = { ...defaults, ...userInput };

// Combine arrays
const allItems = [...array1, ...array2];

// Conditional merge
const finalData = {
  ...baseData,
  ...(includeExtras ? extraData : {}),
  ...(user.isPremium ? premiumFeatures : {})
};
\`\`\`

## Debugging JSON Issues

### Common Errors
1. **"Unexpected token"**: Meestal een syntax error (missing comma, quote)
2. **"Cannot read property of undefined"**: Toegang tot non-existent path
3. **"Not a function"**: Probeer array method op non-array
4. **"Invalid JSON"**: Format probleem

### Debug Techniques
\`\`\`javascript
// Log structure
console.log(JSON.stringify(data, null, 2));

// Check data type
console.log(typeof data);
console.log(Array.isArray(data));

// Safe logging
console.log('User email:', data?.user?.email || 'not found');

// Validation
function isValidResponse(data) {
  return data 
    && typeof data === 'object'
    && data.success === true
    && Array.isArray(data.items)
    && data.items.length > 0;
}
\`\`\`

## Best Practices

1. **Always Validate**: Check data bestaat voor gebruik
2. **Use Defaults**: Geef fallback waarden
3. **Keep It Simple**: Nest niet te diep
4. **Document Structure**: Maak comments over verwachte format
5. **Test Edge Cases**: Empty arrays, null values, missing fields
  `,
  codeExamples: [
    {
      id: 'example-2-4-1',
      title: 'Advanced JSON Processor',
      language: 'javascript',
      code: `// Complete JSON processing toolkit
class JSONProcessor {
  // Safely get nested value
  static get(obj, path, defaultValue = null) {
    try {
      return path.split('.').reduce((curr, prop) => {
        if (curr === null || curr === undefined) return defaultValue;
        return curr[prop];
      }, obj) ?? defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }
  
  // Set nested value
  static set(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((curr, key) => {
      if (!curr[key]) curr[key] = {};
      return curr[key];
    }, obj);
    target[lastKey] = value;
    return obj;
  }
  
  // Flatten nested object
  static flatten(obj, prefix = '') {
    return Object.keys(obj).reduce((acc, key) => {
      const newKey = prefix ? \`\${prefix}.\${key}\` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(acc, this.flatten(obj[key], newKey));
      } else {
        acc[newKey] = obj[key];
      }
      return acc;
    }, {});
  }
  
  // Unflatten to nested
  static unflatten(obj) {
    const result = {};
    for (const key in obj) {
      this.set(result, key, obj[key]);
    }
    return result;
  }
  
  // Deep merge objects
  static merge(...objects) {
    return objects.reduce((acc, obj) => {
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          acc[key] = this.merge(acc[key] || {}, obj[key]);
        } else {
          acc[key] = obj[key];
        }
      });
      return acc;
    }, {});
  }
  
  // Transform arrays of objects
  static transformArray(array, mapping) {
    return array.map(item => {
      const result = {};
      for (const [targetKey, sourceKey] of Object.entries(mapping)) {
        if (typeof sourceKey === 'function') {
          result[targetKey] = sourceKey(item);
        } else {
          result[targetKey] = this.get(item, sourceKey);
        }
      }
      return result;
    });
  }
  
  // Validate structure
  static validate(obj, schema) {
    for (const [key, rules] of Object.entries(schema)) {
      const value = this.get(obj, key);
      
      // Check required
      if (rules.required && (value === null || value === undefined)) {
        return { valid: false, error: \`Missing required field: \${key}\` };
      }
      
      // Check type
      if (value !== null && value !== undefined && rules.type) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== rules.type) {
          return { valid: false, error: \`Invalid type for \${key}: expected \${rules.type}, got \${actualType}\` };
        }
      }
      
      // Check custom validation
      if (rules.validate && !rules.validate(value)) {
        return { valid: false, error: \`Validation failed for \${key}\` };
      }
    }
    
    return { valid: true };
  }
}

// Usage examples
const data = {
  user: {
    profile: {
      name: "Jan",
      email: "jan@example.com"
    }
  },
  orders: [
    { id: 1, total: 100 },
    { id: 2, total: 200 }
  ]
};

// Safe access
const email = JSONProcessor.get(data, 'user.profile.email', 'no-email');

// Transform array
const orderSummary = JSONProcessor.transformArray(data.orders, {
  orderId: 'id',
  amount: 'total',
  formattedAmount: (order) => \`€\${order.total.toFixed(2)}\`
});

// Validate structure
const schema = {
  'user.profile.email': { 
    required: true, 
    type: 'string',
    validate: (v) => v.includes('@')
  },
  'orders': { 
    required: true, 
    type: 'array' 
  }
};

const validation = JSONProcessor.validate(data, schema);`
    }
  ],
  assignments: [
    {
      id: 'json-exercise-1',
      title: 'Parse Complex API Response',
      description: 'Neem een complexe API response en extract de relevante data voor je automation',
      difficulty: 'medium',
      type: 'code',
      initialCode: `// API response om te parsen
const apiResponse = {
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "profile": {
          "firstName": "Jan",
          "lastName": "de Vries",
          "preferences": {
            "newsletter": true,
            "language": "nl"
          }
        },
        "activity": {
          "lastLogin": "2024-01-15T10:30:00Z",
          "loginCount": 42
        }
      }
    ],
    "pagination": {
      "page": 1,
      "totalPages": 5
    }
  }
};

// TODO: Extract en transformeer de data
// 1. Haal alle user emails op
// 2. Filter actieve users (laatste 30 dagen)
// 3. Maak een simplified user object`,
      hints: [
        'Gebruik optional chaining (?.) voor safe access',
        'Array methods zoals map() en filter() zijn je vrienden',
        'Denk aan edge cases zoals lege arrays'
      ]
    },
    {
      id: 'json-exercise-2',
      title: 'Build Multi-Level JSON Structure',
      description: 'Bouw een geneste JSON structure voor een product catalogus met categories, products en variants',
      difficulty: 'hard',
      type: 'project',
      initialCode: `// Bouw een product catalog structuur
// Input data
const products = [
  { id: 1, name: 'T-Shirt', category: 'Kleding', variants: ['S', 'M', 'L'] },
  { id: 2, name: 'Laptop', category: 'Elektronica', variants: ['13 inch', '15 inch'] }
];

// TODO: Transform naar geneste structuur:
// {
//   categories: {
//     "Kleding": {
//       products: [...],
//       productCount: 1
//     }
//   }
// }`,
      hints: [
        'Gebruik reduce() voor het groeperen per categorie',
        'Denk aan het toevoegen van metadata zoals counts',
        'Test met edge cases zoals producten zonder categorie'
      ]
    }
  ],
  resources: [
    {
      title: 'JSON.org - Official JSON Documentation',
      url: 'https://www.json.org',
      type: 'docs'
    },
    {
      title: 'JSONPath Online Evaluator',
      url: 'https://jsonpath.com',
      type: 'tool'
    },
    {
      title: 'N8N Data Transformation Guide',
      url: 'https://docs.n8n.io/data/transforming-data/',
      type: 'guide'
    }
  ]
};