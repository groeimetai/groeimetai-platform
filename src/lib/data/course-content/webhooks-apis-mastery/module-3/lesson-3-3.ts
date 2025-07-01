export const lesson3_3 = {
  id: 'xml-en-andere-formaten',
  title: 'XML en andere formaten',
  duration: '30 min',
  content: `
# XML en andere formaten

## Introductie

Hoewel JSON de de facto standaard is voor moderne APIs, kom je in de praktijk vaak andere dataformaten tegen. XML wordt nog veel gebruikt in enterprise systemen, CSV is populair voor data-export, YAML voor configuratie, en Protocol Buffers voor high-performance communicatie. In deze les leer je hoe je effectief met deze formaten werkt.

## XML Parsing Strategies

### XML Basics

XML (eXtensible Markup Language) is een markup language die menselijk leesbaar en machine-verwerkbaar is:

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<order>
  <orderId>12345</orderId>
  <customer>
    <name>Jan Jansen</name>
    <email>jan@example.com</email>
  </customer>
  <items>
    <item>
      <productId>SKU-001</productId>
      <name>Laptop</name>
      <quantity>1</quantity>
      <price currency="EUR">999.00</price>
    </item>
    <item>
      <productId>SKU-002</productId>
      <name>Mouse</name>
      <quantity>2</quantity>
      <price currency="EUR">29.99</price>
    </item>
  </items>
  <total currency="EUR">1058.98</total>
</order>
\`\`\`

### DOM vs SAX Parsing

Er zijn twee hoofdstrategieën voor XML parsing:

**DOM (Document Object Model) Parsing**
- Laadt het hele document in geheugen
- Maakt een boomstructuur van het document
- Geschikt voor kleine tot middelgrote documenten
- Willekeurige toegang tot elementen

**SAX (Simple API for XML) Parsing**
- Event-driven parsing (streaming)
- Gebruikt weinig geheugen
- Geschikt voor grote documenten
- Alleen voorwaartse lezing

### XML Namespaces

XML namespaces voorkomen naamconflicten:

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <m:GetOrderResponse xmlns:m="http://example.com/orders">
      <m:Order>
        <m:OrderId>12345</m:OrderId>
        <m:Status>Shipped</m:Status>
      </m:Order>
    </m:GetOrderResponse>
  </soap:Body>
</soap:Envelope>
\`\`\`

## CSV/TSV Handling

### CSV Parsing Best Practices

CSV lijkt simpel maar heeft veel edge cases:

\`\`\`csv
"Order ID","Customer Name","Product","Quantity","Price"
"12345","Jan Jansen","Laptop, 15""",1,"999.00"
"12346","Marie \"De Vries\"","Mouse",2,"29.99"
"12347","Company, Inc.","Keyboard
with Enter key",1,"79.99"
\`\`\`

Belangrijke overwegingen:
- **Escaping**: Quotes binnen quotes
- **Delimiters**: Komma's in data
- **Newlines**: Regeleindes in velden
- **Encoding**: UTF-8, ISO-8859-1, etc.
- **Headers**: Eerste rij als kolomnamen
- **Lege velden**: NULL vs lege string

### TSV (Tab-Separated Values)

TSV gebruikt tabs als delimiter, wat sommige problemen oplost:

\`\`\`tsv
Order ID	Customer Name	Product	Quantity	Price
12345	Jan Jansen	Laptop	1	999.00
12346	Marie de Vries	Mouse	2	29.99
12347	Company, Inc.	Keyboard	1	79.99
\`\`\`

## YAML voor Configuratie

### YAML Basics

YAML is populair voor configuratiebestanden vanwege de leesbaarheid:

\`\`\`yaml
# API Configuration
api:
  version: v2
  base_url: https://api.example.com
  
authentication:
  type: oauth2
  client_id: \${CLIENT_ID}
  client_secret: \${CLIENT_SECRET}
  scopes:
    - read:orders
    - write:orders
    
endpoints:
  orders:
    list:
      path: /orders
      method: GET
      rate_limit: 100/hour
    create:
      path: /orders
      method: POST
      rate_limit: 50/hour
      
webhooks:
  - event: order.created
    url: https://myapp.com/webhooks/order-created
    retry:
      max_attempts: 3
      backoff: exponential
      
  - event: order.shipped
    url: https://myapp.com/webhooks/order-shipped
    headers:
      X-Webhook-Secret: \${WEBHOOK_SECRET}
\`\`\`

### YAML Features

- **Anchors & References**: Hergebruik van configuratie
- **Multi-line strings**: Voor lange teksten
- **Type inference**: Automatische type detectie
- **Comments**: Voor documentatie

\`\`\`yaml
# Anchors en references
defaults: &defaults
  timeout: 30
  retries: 3
  
production:
  <<: *defaults
  url: https://api.prod.example.com
  
staging:
  <<: *defaults
  url: https://api.staging.example.com
  timeout: 60  # Override default
\`\`\`

## Protocol Buffers Basics

### Wat zijn Protocol Buffers?

Protocol Buffers (protobuf) is Google's language-neutral, platform-neutral mechanisme voor het serialiseren van gestructureerde data:

\`\`\`protobuf
syntax = "proto3";

package orders;

message Order {
  int32 order_id = 1;
  Customer customer = 2;
  repeated Item items = 3;
  double total = 4;
  string currency = 5;
}

message Customer {
  string name = 1;
  string email = 2;
}

message Item {
  string product_id = 1;
  string name = 2;
  int32 quantity = 3;
  double price = 4;
}
\`\`\`

### Voordelen van Protocol Buffers

- **Compact**: Tot 10x kleiner dan JSON
- **Snel**: Tot 20x sneller parseren
- **Type-safe**: Schema-based met validatie
- **Backward compatible**: Veld toevoegen breekt oude code niet
- **Multi-language**: Ondersteund in 10+ talen

## Format Conversie Technieken

### Universele Conversie Patterns

\`\`\`javascript
// Generic converter interface
class DataConverter {
  constructor(parser, serializer) {
    this.parser = parser;
    this.serializer = serializer;
  }
  
  convert(input, targetFormat) {
    // Parse to intermediate format
    const data = this.parser.parse(input);
    
    // Serialize to target format
    return this.serializer[targetFormat](data);
  }
}
\`\`\`

### Schema Mapping

Bij conversie tussen formaten moet je vaak schema's mappen:

\`\`\`javascript
// Schema mapping configuration
const schemaMap = {
  xml_to_json: {
    'order/orderId': 'order_id',
    'order/customer/name': 'customer.full_name',
    'order/items/item': 'line_items[]',
    'order/items/item/productId': 'line_items[].sku',
    'order/items/item/quantity': 'line_items[].qty',
    'order/total': 'total_amount'
  }
};
\`\`\`

### Streaming Conversie

Voor grote bestanden gebruik je streaming:

\`\`\`javascript
// Stream-based conversion
async function* streamConvert(inputStream, converter) {
  const parser = createStreamingParser();
  
  for await (const chunk of inputStream) {
    const records = parser.parseChunk(chunk);
    
    for (const record of records) {
      yield converter.convert(record);
    }
  }
}
\`\`\`

## Best Practices

### 1. Format Selection

Kies het juiste formaat voor je use case:

| Format | Use Case | Pros | Cons |
|--------|----------|------|------|
| JSON | REST APIs, Web | Menselijk leesbaar, breed ondersteund | Groter dan binaire formaten |
| XML | Enterprise, SOAP | Schema validatie, namespaces | Verbose, complex |
| CSV | Data export/import | Simpel, Excel compatible | Geen nested data |
| YAML | Configuratie | Zeer leesbaar, comments | Indentatie-gevoelig |
| Protobuf | High-performance APIs | Compact, snel | Schema vereist |

### 2. Error Handling

Robuuste error handling voor alle formaten:

\`\`\`javascript
class FormatParser {
  parse(data, format) {
    try {
      switch(format) {
        case 'json':
          return this.parseJSON(data);
        case 'xml':
          return this.parseXML(data);
        case 'csv':
          return this.parseCSV(data);
        case 'yaml':
          return this.parseYAML(data);
        default:
          throw new Error(\`Unsupported format: \${format}\`);
      }
    } catch (error) {
      throw new ParseError(\`Failed to parse \${format}: \${error.message}\`, {
        format,
        originalError: error,
        data: data.substring(0, 100) // First 100 chars for debugging
      });
    }
  }
}
\`\`\`

### 3. Performance Optimalisatie

- **Lazy parsing**: Parse alleen wat je nodig hebt
- **Streaming**: Voor grote bestanden
- **Caching**: Cache geparseerde resultaten
- **Parallellisatie**: Process meerdere bestanden tegelijk

### 4. Validatie

Valideer altijd input data:

\`\`\`javascript
const validators = {
  xml: (data) => {
    // Check XML well-formedness
    const doc = new DOMParser().parseFromString(data, 'text/xml');
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      throw new ValidationError('Invalid XML', parseError.textContent);
    }
  },
  
  csv: (data) => {
    // Check consistent column count
    const lines = data.split('\\n');
    const headerCount = lines[0].split(',').length;
    
    lines.forEach((line, index) => {
      if (line && line.split(',').length !== headerCount) {
        throw new ValidationError(\`Inconsistent columns at line \${index + 1}\`);
      }
    });
  }
};
\`\`\`

## Samenvatting

- **XML**: Gebruik DOM voor kleine documenten, SAX voor grote
- **CSV**: Let op edge cases zoals quotes en newlines
- **YAML**: Ideaal voor configuratie met zijn leesbaarheid
- **Protocol Buffers**: Voor high-performance scenarios
- **Conversie**: Gebruik intermediate formats en schema mapping
- **Best practices**: Kies het juiste formaat, handle errors, optimaliseer performance`,
  codeExamples: [
    {
      title: 'XML Parser met Error Handling',
      code: `// Complete XML parser met namespace support
const xml2js = require('xml2js');
const { DOMParser } = require('xmldom');

class XMLParser {
  constructor(options = {}) {
    this.options = {
      explicitArray: false,
      mergeAttrs: true,
      normalizeTags: true,
      explicitRoot: false,
      ...options
    };
  }
  
  // DOM-based parsing voor kleine documenten
  parseDOM(xmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');
    
    // Check for parse errors
    const parseError = doc.getElementsByTagName('parsererror');
    if (parseError.length > 0) {
      throw new Error('XML Parse Error: ' + parseError[0].textContent);
    }
    
    return this.domToObject(doc.documentElement);
  }
  
  // Convert DOM to JavaScript object
  domToObject(node) {
    const obj = {};
    
    // Handle attributes
    if (node.attributes) {
      for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i];
        obj['@' + attr.name] = attr.value;
      }
    }
    
    // Handle child nodes
    const children = {};
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      
      if (child.nodeType === 1) { // Element node
        const childObj = this.domToObject(child);
        
        if (children[child.nodeName]) {
          // Convert to array if multiple elements
          if (!Array.isArray(children[child.nodeName])) {
            children[child.nodeName] = [children[child.nodeName]];
          }
          children[child.nodeName].push(childObj);
        } else {
          children[child.nodeName] = childObj;
        }
      } else if (child.nodeType === 3) { // Text node
        const text = child.nodeValue.trim();
        if (text) {
          obj['#text'] = text;
        }
      }
    }
    
    // Merge children into object
    Object.assign(obj, children);
    
    // Simplify if only text content
    if (Object.keys(obj).length === 1 && obj['#text']) {
      return obj['#text'];
    }
    
    return obj;
  }
  
  // Streaming SAX parser voor grote documenten
  async parseStream(xmlStream) {
    const parser = new xml2js.Parser(this.options);
    const results = [];
    
    return new Promise((resolve, reject) => {
      const saxStream = require('sax').createStream(true);
      
      let currentElement = null;
      let elementStack = [];
      
      saxStream.on('opentag', (node) => {
        currentElement = {
          name: node.name,
          attributes: node.attributes,
          children: [],
          text: ''
        };
        
        if (elementStack.length > 0) {
          const parent = elementStack[elementStack.length - 1];
          parent.children.push(currentElement);
        }
        
        elementStack.push(currentElement);
      });
      
      saxStream.on('text', (text) => {
        if (currentElement) {
          currentElement.text += text;
        }
      });
      
      saxStream.on('closetag', () => {
        const element = elementStack.pop();
        
        if (elementStack.length === 0) {
          results.push(this.elementToObject(element));
        }
        
        currentElement = elementStack[elementStack.length - 1];
      });
      
      saxStream.on('end', () => resolve(results));
      saxStream.on('error', reject);
      
      xmlStream.pipe(saxStream);
    });
  }
  
  // Convert SAX element to object
  elementToObject(element) {
    const obj = {};
    
    // Add attributes
    Object.keys(element.attributes).forEach(key => {
      obj['@' + key] = element.attributes[key];
    });
    
    // Add text content
    if (element.text.trim()) {
      obj['#text'] = element.text.trim();
    }
    
    // Add children
    element.children.forEach(child => {
      const childObj = this.elementToObject(child);
      
      if (obj[child.name]) {
        if (!Array.isArray(obj[child.name])) {
          obj[child.name] = [obj[child.name]];
        }
        obj[child.name].push(childObj);
      } else {
        obj[child.name] = childObj;
      }
    });
    
    // Simplify if only text
    if (Object.keys(obj).length === 1 && obj['#text']) {
      return obj['#text'];
    }
    
    return obj;
  }
  
  // Parse with namespace support
  parseWithNamespaces(xmlString) {
    const parser = new xml2js.Parser({
      ...this.options,
      xmlns: true,
      explicitChildren: true,
      preserveChildrenOrder: true
    });
    
    return new Promise((resolve, reject) => {
      parser.parseString(xmlString, (err, result) => {
        if (err) reject(err);
        else resolve(this.resolveNamespaces(result));
      });
    });
  }
  
  // Resolve namespace prefixes
  resolveNamespaces(obj, namespaces = {}) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    const resolved = Array.isArray(obj) ? [] : {};
    
    for (const [key, value] of Object.entries(obj)) {
      let resolvedKey = key;
      
      // Handle namespace declarations
      if (key.startsWith('xmlns:')) {
        namespaces[key.substring(6)] = value;
        continue;
      }
      
      // Resolve namespace prefixes
      const colonIndex = key.indexOf(':');
      if (colonIndex > 0) {
        const prefix = key.substring(0, colonIndex);
        const localName = key.substring(colonIndex + 1);
        
        if (namespaces[prefix]) {
          resolvedKey = \`{\${namespaces[prefix]}}\${localName}\`;
        }
      }
      
      resolved[resolvedKey] = this.resolveNamespaces(value, { ...namespaces });
    }
    
    return resolved;
  }
}

// Usage
const parser = new XMLParser();

// Parse small XML document
const xmlData = \`
<?xml version="1.0" encoding="UTF-8"?>
<orders xmlns:ord="http://example.com/orders">
  <ord:order id="12345">
    <ord:customer>
      <name>Jan Jansen</name>
      <email>jan@example.com</email>
    </ord:customer>
    <ord:items>
      <item sku="LAPTOP-15">
        <name>Laptop 15"</name>
        <quantity>1</quantity>
        <price currency="EUR">999.00</price>
      </item>
    </ord:items>
  </ord:order>
</orders>
\`;

try {
  const result = parser.parseDOM(xmlData);
  console.log('Parsed:', JSON.stringify(result, null, 2));
} catch (error) {
  console.error('Parse error:', error.message);
}

// Stream large XML file
const fs = require('fs');
const xmlStream = fs.createReadStream('large-orders.xml');

parser.parseStream(xmlStream)
  .then(results => {
    console.log(\`Parsed \${results.length} orders\`);
  })
  .catch(error => {
    console.error('Stream parse error:', error);
  });`,
      explanation: 'Deze XML parser ondersteunt zowel DOM-based parsing voor kleine documenten als SAX streaming voor grote bestanden. Het handelt namespaces, attributes, en complexe nested structuren correct af.'
    },
    {
      title: 'CSV Parser met Edge Cases',
      code: `// Robuuste CSV parser die alle edge cases aankan
class CSVParser {
  constructor(options = {}) {
    this.options = {
      delimiter: ',',
      quote: '"',
      escape: '"',
      newline: '\\n',
      headers: true,
      skipEmptyLines: true,
      trim: true,
      ...options
    };
  }
  
  parse(csvString) {
    const lines = this.splitLines(csvString);
    const headers = this.options.headers ? this.parseLine(lines[0]) : null;
    const startIndex = this.options.headers ? 1 : 0;
    const results = [];
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      
      if (this.options.skipEmptyLines && !line.trim()) {
        continue;
      }
      
      const values = this.parseLine(line);
      
      if (headers) {
        const record = {};
        headers.forEach((header, index) => {
          record[header] = values[index] || '';
        });
        results.push(record);
      } else {
        results.push(values);
      }
    }
    
    return results;
  }
  
  parseLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (inQuotes) {
        if (char === this.options.quote) {
          if (nextChar === this.options.quote) {
            // Escaped quote
            current += char;
            i += 2;
            continue;
          } else {
            // End of quoted field
            inQuotes = false;
            i++;
            continue;
          }
        } else {
          // Regular character in quotes
          current += char;
          i++;
        }
      } else {
        if (char === this.options.quote) {
          // Start of quoted field
          inQuotes = true;
          i++;
        } else if (char === this.options.delimiter) {
          // End of field
          values.push(this.options.trim ? current.trim() : current);
          current = '';
          i++;
        } else {
          // Regular character
          current += char;
          i++;
        }
      }
    }
    
    // Add last field
    values.push(this.options.trim ? current.trim() : current);
    
    return values;
  }
  
  splitLines(csvString) {
    const lines = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < csvString.length; i++) {
      const char = csvString[i];
      
      if (char === this.options.quote) {
        const prevChar = csvString[i - 1];
        const nextChar = csvString[i + 1];
        
        if (inQuotes && nextChar === this.options.quote) {
          // Escaped quote
          current += char + nextChar;
          i++;
        } else if (!inQuotes || prevChar !== this.options.escape) {
          // Toggle quotes
          inQuotes = !inQuotes;
          current += char;
        } else {
          current += char;
        }
      } else if (char === '\\n' && !inQuotes) {
        // End of line
        lines.push(current);
        current = '';
      } else if (char === '\\r' && csvString[i + 1] === '\\n' && !inQuotes) {
        // Windows line ending
        lines.push(current);
        current = '';
        i++; // Skip \\n
      } else {
        current += char;
      }
    }
    
    // Add last line
    if (current) {
      lines.push(current);
    }
    
    return lines;
  }
  
  // Streaming parser voor grote bestanden
  createReadStream(filePath) {
    const fs = require('fs');
    const { Transform } = require('stream');
    
    const parser = new Transform({
      objectMode: true,
      transform: (chunk, encoding, callback) => {
        const lines = chunk.toString().split(this.options.newline);
        
        lines.forEach(line => {
          if (line) {
            const values = this.parseLine(line);
            this.push(values);
          }
        });
        
        callback();
      }
    });
    
    return fs.createReadStream(filePath).pipe(parser);
  }
  
  // CSV serializer
  serialize(data, options = {}) {
    const opts = { ...this.options, ...options };
    const lines = [];
    
    if (Array.isArray(data) && data.length > 0) {
      // Extract headers
      if (opts.headers && typeof data[0] === 'object') {
        const headers = Object.keys(data[0]);
        lines.push(this.serializeLine(headers, opts));
      }
      
      // Serialize data
      data.forEach(row => {
        if (typeof row === 'object') {
          const values = Object.values(row);
          lines.push(this.serializeLine(values, opts));
        } else if (Array.isArray(row)) {
          lines.push(this.serializeLine(row, opts));
        }
      });
    }
    
    return lines.join(opts.newline);
  }
  
  serializeLine(values, options) {
    return values.map(value => {
      const stringValue = value == null ? '' : String(value);
      
      // Check if quoting is needed
      const needsQuoting = 
        stringValue.includes(options.delimiter) ||
        stringValue.includes(options.quote) ||
        stringValue.includes('\\n') ||
        stringValue.includes('\\r');
      
      if (needsQuoting) {
        // Escape quotes
        const escaped = stringValue.replace(
          new RegExp(options.quote, 'g'),
          options.quote + options.quote
        );
        return options.quote + escaped + options.quote;
      }
      
      return stringValue;
    }).join(options.delimiter);
  }
}

// TSV Parser (extends CSV)
class TSVParser extends CSVParser {
  constructor(options = {}) {
    super({
      delimiter: '\\t',
      ...options
    });
  }
}

// Usage examples
const csvParser = new CSVParser();
const tsvParser = new TSVParser();

// Parse CSV with complex data
const csvData = \`"Order ID","Customer Name","Product","Quantity","Price"
"12345","Jan ""The Man"" Jansen","Laptop, 15""",1,"999.00"
"12346","Marie de Vries","Gaming Mouse
with RGB",2,"59.99"
"12347","Company, Inc.","Keyboard",1,"79.99"\`;

const orders = csvParser.parse(csvData);
console.log('Parsed orders:', orders);

// Stream large CSV file
const stream = csvParser.createReadStream('large-dataset.csv');
let recordCount = 0;

stream.on('data', (record) => {
  recordCount++;
  if (recordCount % 10000 === 0) {
    console.log(\`Processed \${recordCount} records\`);
  }
});

stream.on('end', () => {
  console.log(\`Total records: \${recordCount}\`);
});

// Serialize data back to CSV
const newData = [
  { id: 1, name: 'Product A', price: 29.99 },
  { id: 2, name: 'Product B, Special', price: 49.99 },
  { id: 3, name: 'Product "C"', price: 19.99 }
];

const csvOutput = csvParser.serialize(newData);
console.log('Serialized CSV:', csvOutput);`,
      explanation: 'Deze CSV parser handelt alle edge cases correct af: quotes binnen quotes, newlines in velden, verschillende delimiters, en meer. Het bevat ook een streaming parser voor grote bestanden en een serializer om data terug naar CSV te converteren.'
    },
    {
      title: 'Universal Format Converter',
      code: `// Universele data format converter
const yaml = require('js-yaml');
const xml2js = require('xml2js');
const Papa = require('papaparse');
const protobuf = require('protobufjs');

class UniversalConverter {
  constructor() {
    this.parsers = {
      json: this.parseJSON.bind(this),
      xml: this.parseXML.bind(this),
      yaml: this.parseYAML.bind(this),
      csv: this.parseCSV.bind(this),
      protobuf: this.parseProtobuf.bind(this)
    };
    
    this.serializers = {
      json: this.serializeJSON.bind(this),
      xml: this.serializeXML.bind(this),
      yaml: this.serializeYAML.bind(this),
      csv: this.serializeCSV.bind(this),
      protobuf: this.serializeProtobuf.bind(this)
    };
    
    this.schemas = new Map();
  }
  
  // Register schema for format conversion
  registerSchema(name, schema) {
    this.schemas.set(name, schema);
  }
  
  // Convert between any two formats
  async convert(data, fromFormat, toFormat, options = {}) {
    // Parse source format
    const parsed = await this.parse(data, fromFormat, options);
    
    // Apply schema transformation if specified
    const transformed = options.schema 
      ? this.transformSchema(parsed, options.schema)
      : parsed;
    
    // Serialize to target format
    return await this.serialize(transformed, toFormat, options);
  }
  
  // Parse any format
  async parse(data, format, options = {}) {
    const parser = this.parsers[format.toLowerCase()];
    
    if (!parser) {
      throw new Error(\`Unsupported input format: \${format}\`);
    }
    
    try {
      return await parser(data, options);
    } catch (error) {
      throw new Error(\`Failed to parse \${format}: \${error.message}\`);
    }
  }
  
  // Serialize to any format
  async serialize(data, format, options = {}) {
    const serializer = this.serializers[format.toLowerCase()];
    
    if (!serializer) {
      throw new Error(\`Unsupported output format: \${format}\`);
    }
    
    try {
      return await serializer(data, options);
    } catch (error) {
      throw new Error(\`Failed to serialize to \${format}: \${error.message}\`);
    }
  }
  
  // Parsers
  parseJSON(data) {
    return JSON.parse(data);
  }
  
  async parseXML(data, options = {}) {
    const parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true,
      ...options.parserOptions
    });
    
    return new Promise((resolve, reject) => {
      parser.parseString(data, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
  
  parseYAML(data) {
    return yaml.load(data);
  }
  
  parseCSV(data, options = {}) {
    const result = Papa.parse(data, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      ...options.parserOptions
    });
    
    if (result.errors.length > 0) {
      throw new Error(\`CSV parse errors: \${JSON.stringify(result.errors)}\`);
    }
    
    return result.data;
  }
  
  async parseProtobuf(data, options = {}) {
    if (!options.schema) {
      throw new Error('Protobuf parsing requires a schema');
    }
    
    const root = await protobuf.load(options.schema);
    const MessageType = root.lookupType(options.messageType);
    
    return MessageType.decode(data);
  }
  
  // Serializers
  serializeJSON(data, options = {}) {
    return JSON.stringify(data, null, options.indent || 2);
  }
  
  serializeXML(data, options = {}) {
    const builder = new xml2js.Builder({
      renderOpts: { pretty: true },
      ...options.builderOptions
    });
    
    return builder.buildObject(data);
  }
  
  serializeYAML(data, options = {}) {
    return yaml.dump(data, {
      indent: 2,
      ...options.dumpOptions
    });
  }
  
  serializeCSV(data, options = {}) {
    if (!Array.isArray(data)) {
      throw new Error('CSV serialization requires an array of objects');
    }
    
    return Papa.unparse(data, {
      header: true,
      ...options.unparseOptions
    });
  }
  
  async serializeProtobuf(data, options = {}) {
    if (!options.schema) {
      throw new Error('Protobuf serialization requires a schema');
    }
    
    const root = await protobuf.load(options.schema);
    const MessageType = root.lookupType(options.messageType);
    
    const message = MessageType.create(data);
    return MessageType.encode(message).finish();
  }
  
  // Schema transformation
  transformSchema(data, schemaName) {
    const schema = this.schemas.get(schemaName);
    
    if (!schema) {
      throw new Error(\`Schema not found: \${schemaName}\`);
    }
    
    return this.applyTransformation(data, schema);
  }
  
  applyTransformation(data, schema) {
    if (Array.isArray(data)) {
      return data.map(item => this.applyTransformation(item, schema));
    }
    
    const result = {};
    
    for (const [targetPath, sourcePath] of Object.entries(schema)) {
      const value = this.getValueByPath(data, sourcePath);
      this.setValueByPath(result, targetPath, value);
    }
    
    return result;
  }
  
  getValueByPath(obj, path) {
    return path.split('.').reduce((current, key) => {
      if (key.endsWith('[]')) {
        const actualKey = key.slice(0, -2);
        return current?.[actualKey] || [];
      }
      return current?.[key];
    }, obj);
  }
  
  setValueByPath(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    
    const target = keys.reduce((current, key) => {
      if (!current[key]) {
        current[key] = {};
      }
      return current[key];
    }, obj);
    
    target[lastKey] = value;
  }
  
  // Batch conversion
  async convertBatch(files, fromFormat, toFormat, options = {}) {
    const results = [];
    const errors = [];
    
    for (const file of files) {
      try {
        const converted = await this.convert(
          file.data,
          fromFormat,
          toFormat,
          options
        );
        
        results.push({
          name: file.name,
          data: converted,
          success: true
        });
      } catch (error) {
        errors.push({
          name: file.name,
          error: error.message
        });
      }
    }
    
    return { results, errors };
  }
  
  // Format detection
  detectFormat(data) {
    const trimmed = data.trim();
    
    // JSON
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        JSON.parse(trimmed);
        return 'json';
      } catch {}
    }
    
    // XML
    if (trimmed.startsWith('<?xml') || 
        (trimmed.startsWith('<') && trimmed.endsWith('>'))) {
      return 'xml';
    }
    
    // YAML
    if (trimmed.includes(':\\n') || trimmed.includes(': ')) {
      try {
        yaml.load(trimmed);
        return 'yaml';
      } catch {}
    }
    
    // CSV
    if (trimmed.includes(',') && trimmed.includes('\\n')) {
      return 'csv';
    }
    
    return 'unknown';
  }
}

// Usage examples
const converter = new UniversalConverter();

// Register schema for XML to JSON conversion
converter.registerSchema('order-xml-to-json', {
  'id': 'order.@id',
  'customer.name': 'order.customer.name',
  'customer.email': 'order.customer.email',
  'items': 'order.items.item',
  'total': 'order.total'
});

// Convert XML to JSON
const xmlOrder = \`
<?xml version="1.0" encoding="UTF-8"?>
<order id="12345">
  <customer>
    <name>Jan Jansen</name>
    <email>jan@example.com</email>
  </customer>
  <items>
    <item>
      <name>Laptop</name>
      <quantity>1</quantity>
      <price>999.00</price>
    </item>
    <item>
      <name>Mouse</name>
      <quantity>2</quantity>
      <price>29.99</price>
    </item>
  </items>
  <total>1058.98</total>
</order>
\`;

// Simple conversion
converter.convert(xmlOrder, 'xml', 'json')
  .then(json => {
    console.log('XML to JSON:', json);
    
    // Convert to YAML
    return converter.convert(json, 'json', 'yaml');
  })
  .then(yaml => {
    console.log('JSON to YAML:', yaml);
    
    // Convert to CSV (need to flatten first)
    const flattened = [
      { product: 'Laptop', quantity: 1, price: 999.00 },
      { product: 'Mouse', quantity: 2, price: 29.99 }
    ];
    
    return converter.convert(flattened, 'json', 'csv');
  })
  .then(csv => {
    console.log('JSON to CSV:', csv);
  })
  .catch(error => {
    console.error('Conversion error:', error);
  });

// Batch conversion
const files = [
  { name: 'order1.xml', data: xmlOrder },
  { name: 'order2.json', data: '{"id": 12346, "total": 199.99}' }
];

converter.convertBatch(files, 'auto', 'yaml')
  .then(({ results, errors }) => {
    console.log('Batch conversion results:', results);
    if (errors.length > 0) {
      console.error('Batch conversion errors:', errors);
    }
  });

// Auto-detect format
const unknownData = \`
id: 12345
customer:
  name: Jan Jansen
  email: jan@example.com
\`;

const detectedFormat = converter.detectFormat(unknownData);
console.log('Detected format:', detectedFormat); // 'yaml'`,
      explanation: 'Deze universele converter kan tussen alle populaire data formaten converteren: JSON, XML, YAML, CSV, en Protocol Buffers. Het ondersteunt schema mapping, batch conversie, en automatische format detectie.'
    }
  ],
  assignments: [
    {
      id: 'xml-soap-parser',
      title: 'Bouw een SOAP XML parser',
      description: 'Implementeer een parser die SOAP envelopes kan verwerken, namespaces correct afhandelt, en SOAP faults kan detecteren. De parser moet zowel SOAP 1.1 als 1.2 ondersteunen.',
      difficulty: 'medium',
      type: 'code',
      hints: [
        'Begin met namespace resolution',
        'Handle SOAP headers apart van de body',
        'Implementeer fault detection en parsing',
        'Test met verschillende SOAP services'
      ]
    },
    {
      id: 'csv-excel-converter',
      title: 'CSV naar Excel converter',
      description: 'Bouw een converter die CSV bestanden kan omzetten naar Excel formaat met behoud van data types, support voor meerdere sheets, en basis formatting.',
      difficulty: 'medium',
      type: 'code',
      hints: [
        'Gebruik een library zoals xlsx of exceljs',
        'Detecteer automatisch data types',
        'Voeg header formatting toe',
        'Implementeer formule support voor totalen'
      ]
    },
    {
      id: 'config-migration-tool',
      title: 'Configuratie migratie tool',
      description: 'Creëer een tool die configuratie files kan migreren tussen verschillende formaten (JSON, YAML, TOML, INI) met schema validatie en environment variable substitution.',
      difficulty: 'hard',
      type: 'project',
      hints: [
        'Implementeer format auto-detectie',
        'Voeg schema validatie toe met JSON Schema',
        'Support environment variable placeholders',
        'Maak een CLI tool met commander.js'
      ]
    }
  ],
  resources: [
    {
      title: 'XML.com - XML Standards and Best Practices',
      url: 'https://www.xml.com',
      type: 'documentation'
    },
    {
      title: 'Protocol Buffers Documentation',
      url: 'https://developers.google.com/protocol-buffers',
      type: 'documentation'
    },
    {
      title: 'Papa Parse - Powerful CSV Parser',
      url: 'https://www.papaparse.com',
      type: 'library'
    },
    {
      title: 'YAML Specification',
      url: 'https://yaml.org/spec/',
      type: 'specification'
    },
    {
      title: 'Fast XML Parser',
      url: 'https://github.com/NaturalIntelligence/fast-xml-parser',
      type: 'library'
    }
  ]
};