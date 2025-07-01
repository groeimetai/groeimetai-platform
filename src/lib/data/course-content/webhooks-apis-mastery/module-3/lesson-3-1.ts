export const lesson3_1 = {
  id: 'json-fundamenten',
  title: 'JSON fundamenten en best practices',
  duration: '25 min',
  content: `
# JSON fundamenten en best practices

## Introductie

JSON (JavaScript Object Notation) is het meest gebruikte dataformaat voor moderne APIs en webhooks. In deze les duiken we diep in JSON: de structuur, syntax, veelvoorkomende patronen, validatie, error handling en performance optimalisatie.

## JSON structuur en syntax

### De basis bouwstenen

JSON kent zes basis datatypes:

1. **String**: Tekst tussen dubbele quotes
2. **Number**: Getallen (integer of float)
3. **Boolean**: true of false
4. **Null**: null waarde
5. **Object**: Key-value pairs tussen {}
6. **Array**: Geordende lijst tussen []

### Voorbeeld van alle datatypes

\`\`\`json
{
  "string": "Dit is een string",
  "number": 42,
  "float": 3.14159,
  "boolean": true,
  "nullValue": null,
  "object": {
    "nestedKey": "nestedValue"
  },
  "array": [1, 2, 3, "mixed", true]
}
\`\`\`

### Complex geneste structuur voorbeeld

Hier is een realistisch voorbeeld van een e-commerce order met complexe nesting:

\`\`\`json
{
  "orderId": "ORD-2024-001234",
  "createdAt": "2024-01-15T14:30:00Z",
  "status": "processing",
  "customer": {
    "id": "CUST-789",
    "email": "klant@example.com",
    "profile": {
      "firstName": "Jan",
      "lastName": "Jansen",
      "preferences": {
        "newsletter": true,
        "language": "nl-NL",
        "currency": "EUR"
      }
    },
    "addresses": {
      "billing": {
        "street": "Hoofdstraat 123",
        "city": "Amsterdam",
        "postalCode": "1234 AB",
        "country": "NL",
        "coordinates": {
          "lat": 52.3676,
          "lng": 4.9041
        }
      },
      "shipping": {
        "sameAsBilling": false,
        "street": "Zijstraat 45",
        "city": "Utrecht",
        "postalCode": "3500 CD",
        "country": "NL"
      }
    }
  },
  "items": [
    {
      "productId": "PROD-A1",
      "name": "Premium Laptop",
      "quantity": 1,
      "price": {
        "amount": 1299.99,
        "currency": "EUR",
        "tax": {
          "rate": 0.21,
          "amount": 273.00
        }
      },
      "attributes": {
        "color": "Space Gray",
        "storage": "512GB",
        "warranty": {
          "type": "extended",
          "months": 24,
          "coverages": ["damage", "theft", "malfunction"]
        }
      },
      "metadata": {
        "warehouse": "AMS-01",
        "supplier": "TechCorp",
        "tags": ["electronics", "computers", "premium"]
      }
    },
    {
      "productId": "PROD-B2",
      "name": "Wireless Mouse",
      "quantity": 2,
      "price": {
        "amount": 49.99,
        "currency": "EUR",
        "tax": {
          "rate": 0.21,
          "amount": 10.50
        }
      }
    }
  ],
  "payment": {
    "method": "creditcard",
    "provider": "stripe",
    "details": {
      "last4": "4242",
      "brand": "visa",
      "expiryMonth": 12,
      "expiryYear": 2025
    },
    "transactionId": "ch_3MqL3K2eZvKYlo2C0XN5MZgU",
    "securityChecks": {
      "cvvCheck": "pass",
      "addressCheck": "pass",
      "3dSecure": {
        "authenticated": true,
        "version": "2.2.0"
      }
    }
  },
  "totals": {
    "subtotal": 1399.97,
    "tax": 294.00,
    "shipping": 9.99,
    "discount": {
      "code": "WELCOME10",
      "amount": 139.99,
      "type": "percentage"
    },
    "grand": 1563.97
  }
}
\`\`\`

## Veelvoorkomende JSON patronen in APIs

### 1. Response Envelope Pattern

Veel APIs wrappen hun data in een envelope:

\`\`\`json
{
  "success": true,
  "data": {
    "users": [
      {"id": 1, "name": "Alice"},
      {"id": 2, "name": "Bob"}
    ]
  },
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 42,
    "totalPages": 3
  },
  "errors": []
}
\`\`\`

### 2. HAL (Hypertext Application Language) Pattern

Voor hypermedia APIs:

\`\`\`json
{
  "_links": {
    "self": { "href": "/orders/123" },
    "customer": { "href": "/customers/789" },
    "items": { "href": "/orders/123/items" }
  },
  "orderId": "123",
  "total": 99.99,
  "_embedded": {
    "customer": {
      "_links": {
        "self": { "href": "/customers/789" }
      },
      "name": "John Doe"
    }
  }
}
\`\`\`

### 3. JSON:API Specification Pattern

\`\`\`json
{
  "data": {
    "type": "articles",
    "id": "1",
    "attributes": {
      "title": "JSON:API paints my bikeshed!",
      "body": "The shortest article ever.",
      "created": "2024-01-15T09:00:00.000Z"
    },
    "relationships": {
      "author": {
        "data": {"id": "42", "type": "people"}
      }
    }
  },
  "included": [
    {
      "type": "people",
      "id": "42",
      "attributes": {
        "name": "John Doe"
      }
    }
  ]
}
\`\`\`

## Validatie met JSON Schema

### Basis JSON Schema voorbeeld

\`\`\`javascript
const orderSchema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["orderId", "customer", "items", "totals"],
  "properties": {
    "orderId": {
      "type": "string",
      "pattern": "^ORD-[0-9]{4}-[0-9]{6}$"
    },
    "customer": {
      "type": "object",
      "required": ["email"],
      "properties": {
        "email": {
          "type": "string",
          "format": "email"
        },
        "profile": {
          "type": "object",
          "properties": {
            "firstName": {"type": "string", "minLength": 1},
            "lastName": {"type": "string", "minLength": 1}
          }
        }
      }
    },
    "items": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["productId", "quantity", "price"],
        "properties": {
          "productId": {"type": "string"},
          "quantity": {"type": "integer", "minimum": 1},
          "price": {
            "type": "object",
            "required": ["amount", "currency"],
            "properties": {
              "amount": {"type": "number", "minimum": 0},
              "currency": {"type": "string", "enum": ["EUR", "USD", "GBP"]}
            }
          }
        }
      }
    },
    "totals": {
      "type": "object",
      "required": ["subtotal", "grand"],
      "properties": {
        "subtotal": {"type": "number", "minimum": 0},
        "grand": {"type": "number", "minimum": 0}
      }
    }
  }
};

// Validatie met Ajv (Another JSON Schema Validator)
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv); // Voor email format support

const validate = ajv.compile(orderSchema);

function validateOrder(data) {
  const valid = validate(data);
  if (!valid) {
    console.error('Validation errors:', validate.errors);
    return {
      isValid: false,
      errors: validate.errors
    };
  }
  return { isValid: true };
}
\`\`\`

## Error handling voor malformed JSON

### Robuuste JSON parsing

\`\`\`javascript
class JSONParser {
  /**
   * Veilig JSON parsen met uitgebreide error handling
   */
  static safeParse(jsonString, options = {}) {
    const {
      maxDepth = 10,
      maxSize = 1024 * 1024, // 1MB default
      allowComments = false,
      strict = true
    } = options;

    try {
      // Size check
      if (jsonString.length > maxSize) {
        throw new Error(\`JSON exceeds maximum size of \${maxSize} bytes\`);
      }

      // Basic validation
      if (typeof jsonString !== 'string') {
        throw new TypeError('Input must be a string');
      }

      // Remove comments if allowed
      let cleanJson = jsonString;
      if (allowComments) {
        cleanJson = this.stripComments(jsonString);
      }

      // Parse with reviver for depth checking
      let currentDepth = 0;
      const parsed = JSON.parse(cleanJson, (key, value) => {
        if (value && typeof value === 'object') {
          currentDepth++;
          if (currentDepth > maxDepth) {
            throw new Error(\`Maximum depth of \${maxDepth} exceeded\`);
          }
        }
        return value;
      });

      return {
        success: true,
        data: parsed
      };

    } catch (error) {
      return {
        success: false,
        error: this.formatParseError(error, jsonString)
      };
    }
  }

  /**
   * Format parse errors met context
   */
  static formatParseError(error, jsonString) {
    const result = {
      message: error.message,
      type: error.name
    };

    // Probeer positie te bepalen voor SyntaxError
    if (error instanceof SyntaxError) {
      const match = error.message.match(/position (\d+)/);
      if (match) {
        const position = parseInt(match[1]);
        result.position = position;
        result.context = this.getErrorContext(jsonString, position);
      }
    }

    return result;
  }

  /**
   * Haal context rond error positie op
   */
  static getErrorContext(jsonString, position, contextSize = 40) {
    const start = Math.max(0, position - contextSize);
    const end = Math.min(jsonString.length, position + contextSize);
    
    return {
      before: jsonString.substring(start, position),
      error: jsonString.charAt(position),
      after: jsonString.substring(position + 1, end),
      line: jsonString.substring(0, position).split('\n').length,
      column: position - jsonString.lastIndexOf('\n', position - 1)
    };
  }

  /**
   * Strip comments voor flexibele parsing
   */
  static stripComments(jsonString) {
    // Remove single line comments
    jsonString = jsonString.replace(/\/\/.*$/gm, '');
    // Remove multi-line comments
    jsonString = jsonString.replace(/\/\*[\s\S]*?\*\//g, '');
    return jsonString;
  }
}

// Gebruik voorbeeld
const jsonInput = \`{
  "name": "Test",
  "value": 123,
  "nested": {
    "deep": {
      "deeper": "value" // Dit geeft error zonder allowComments
    }
  }
}\`;

const result = JSONParser.safeParse(jsonInput, {
  allowComments: true,
  maxDepth: 5
});

if (result.success) {
  console.log('Parsed data:', result.data);
} else {
  console.error('Parse error:', result.error);
}
\`\`\`

### Error recovery strategies

\`\`\`javascript
class JSONErrorRecovery {
  /**
   * Probeer beschadigde JSON te herstellen
   */
  static attemptRepair(malformedJson) {
    let repaired = malformedJson;
    const repairs = [];

    // Strategy 1: Fix missing quotes
    repaired = repaired.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
    if (repaired !== malformedJson) {
      repairs.push('Added missing quotes to property names');
    }

    // Strategy 2: Fix trailing commas
    const beforeCommaFix = repaired;
    repaired = repaired.replace(/,\s*([}\]])/g, '$1');
    if (repaired !== beforeCommaFix) {
      repairs.push('Removed trailing commas');
    }

    // Strategy 3: Balance brackets
    const openBrackets = (repaired.match(/[{[]/g) || []).length;
    const closeBrackets = (repaired.match(/[}\]]/g) || []).length;
    
    if (openBrackets > closeBrackets) {
      repaired += '}]'.repeat(openBrackets - closeBrackets);
      repairs.push('Added missing closing brackets');
    }

    // Strategy 4: Fix common escape issues
    repaired = repaired.replace(/\\/g, '\\\\');
    repaired = repaired.replace(/[\x00-\x1f]/g, '');

    try {
      const parsed = JSON.parse(repaired);
      return {
        success: true,
        data: parsed,
        repairs: repairs,
        original: malformedJson,
        repaired: repaired
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        attemptedRepairs: repairs,
        partiallyRepaired: repaired
      };
    }
  }
}
\`\`\`

## Performance optimalisatie

### 1. Streaming JSON parsing

Voor grote JSON responses:

\`\`\`javascript
import { pipeline } from 'stream/promises';
import { createReadStream } from 'fs';
import JSONStream from 'JSONStream';

class StreamingJSONProcessor {
  /**
   * Process large JSON files efficiënt
   */
  static async processLargeJSON(filePath, itemProcessor) {
    const stats = {
      itemsProcessed: 0,
      errors: 0,
      startTime: Date.now()
    };

    try {
      await pipeline(
        createReadStream(filePath),
        JSONStream.parse('items.*'), // Parse items array
        async function* (source) {
          for await (const item of source) {
            try {
              await itemProcessor(item);
              stats.itemsProcessed++;
            } catch (error) {
              stats.errors++;
              console.error('Error processing item:', error);
            }
          }
        }
      );

      stats.duration = Date.now() - stats.startTime;
      return stats;
    } catch (error) {
      throw new Error(\`Stream processing failed: \${error.message}\`);
    }
  }
}
\`\`\`

### 2. JSON serialization optimalisatie

\`\`\`javascript
class OptimizedJSONSerializer {
  /**
   * Snelle JSON serialization met caching
   */
  constructor() {
    this.schemaCache = new Map();
    this.stringifyCache = new WeakMap();
  }

  /**
   * Optimized stringify met schema
   */
  stringify(obj, schema) {
    // Check cache
    if (this.stringifyCache.has(obj)) {
      return this.stringifyCache.get(obj);
    }

    // Build optimized stringifier
    const stringifier = this.buildStringifier(schema);
    const result = stringifier(obj);
    
    // Cache result
    this.stringifyCache.set(obj, result);
    return result;
  }

  /**
   * Build schema-based stringifier
   */
  buildStringifier(schema) {
    const cacheKey = JSON.stringify(schema);
    
    if (this.schemaCache.has(cacheKey)) {
      return this.schemaCache.get(cacheKey);
    }

    // Generate optimized stringifier function
    const properties = Object.keys(schema.properties);
    const required = new Set(schema.required || []);
    
    const functionBody = \`
      const parts = ['{'];
      let first = true;
      \${properties.map(prop => \`
        if (obj.\${prop} !== undefined\${required.has(prop) ? '' : ' || true'}) {
          if (!first) parts.push(',');
          parts.push('"\${prop}":');
          parts.push(JSON.stringify(obj.\${prop}));
          first = false;
        }
      \`).join('')}
      parts.push('}');
      return parts.join('');
    \`;

    const stringifier = new Function('obj', functionBody);
    this.schemaCache.set(cacheKey, stringifier);
    
    return stringifier;
  }
}
\`\`\`

### 3. Memory-efficient JSON handling

\`\`\`javascript
class MemoryEfficientJSON {
  /**
   * Process JSON zonder alles in geheugen te laden
   */
  static async* parseNDJSON(stream) {
    let buffer = '';
    
    for await (const chunk of stream) {
      buffer += chunk;
      const lines = buffer.split('\n');
      
      // Keep last incomplete line in buffer
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            yield JSON.parse(line);
          } catch (error) {
            console.error('Invalid JSON line:', line);
          }
        }
      }
    }
    
    // Process remaining buffer
    if (buffer.trim()) {
      try {
        yield JSON.parse(buffer);
      } catch (error) {
        console.error('Invalid JSON in final buffer:', buffer);
      }
    }
  }

  /**
   * Transformeer grote JSON arrays efficiënt
   */
  static async transformLargeArray(inputPath, outputPath, transformer) {
    const input = createReadStream(inputPath);
    const output = createWriteStream(outputPath);
    
    let first = true;
    output.write('[');
    
    await pipeline(
      input,
      JSONStream.parse('*'),
      async function* (source) {
        for await (const item of source) {
          if (!first) output.write(',');
          first = false;
          
          const transformed = await transformer(item);
          output.write(JSON.stringify(transformed));
        }
      }
    );
    
    output.write(']');
    output.end();
  }
}
\`\`\`

## Best practices samenvatting

### Do's ✅

1. **Valideer altijd input**
   - Gebruik JSON Schema voor structuur validatie
   - Controleer data types en ranges
   - Valideer business logic

2. **Handle errors gracefully**
   - Gebruik try-catch voor parsing
   - Geef duidelijke error messages
   - Log errors voor debugging

3. **Optimaliseer voor performance**
   - Stream grote files
   - Cache waar mogelijk
   - Gebruik efficiënte parsing libraries

4. **Beveilig je applicatie**
   - Limiteer JSON grootte
   - Controleer nesting depth
   - Sanitize user input

### Don'ts ❌

1. **Gebruik geen eval() voor JSON parsing**
2. **Parse niet zonder size limits**
3. **Vertrouw nooit blind op externe JSON**
4. **Vergeet niet te escapen bij output**

## Opdracht

Implementeer een robuuste JSON validator voor webhook payloads die:
1. JSON Schema validatie gebruikt
2. Graceful error handling heeft
3. Performance metrics bijhoudt
4. Repair attempts kan doen bij malformed JSON

Test je implementatie met verschillende scenario's:
- Valide complexe JSON
- Malformed JSON (missing quotes, trailing commas)
- Te grote JSON files
- Te diep geneste structuren

Succes met het bouwen van robuuste JSON handling in je applicaties!
`
};