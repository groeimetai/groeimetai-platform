import { Lesson } from '@/lib/data/courses';

export const lesson4_1: Lesson = {
  id: 'api-documentation-understanding',
  title: 'API documentatie lezen en begrijpen',
  duration: '30 min',
  content: `# API documentatie lezen en begrijpen

## Waarom API documentatie cruciaal is

API documentatie is je roadmap naar succesvolle integratie. Het vertelt je:
      
• Welke endpoints beschikbaar zijn
• Hoe authenticatie werkt
• Welke data je kunt versturen en ontvangen
• Rate limits en usage constraints
• Error handling en response codes

Het vermogen om documentatie snel te doorgronden bespaart uren aan debugging en trial-and-error.

## Types API documentatie

Er zijn verschillende formaten waarin API's gedocumenteerd worden:

**1. OpenAPI/Swagger Specification**
De industriestandaard voor RESTful APIs. Machine-readable en genereerbaar naar interactieve documentatie.

**2. GraphQL Schema Documentation**
Introspective documentatie die direct uit de GraphQL schema komt.

**3. Postman Collections**
Ready-to-run API requests met voorbeelden en test scripts.

**4. Developer Portals**
Uitgebreide documentatie sites met guides, tutorials, en sandboxes.

**5. README/Markdown Documentation**
Simpele maar effectieve documentatie, vaak voor kleinere APIs.

## OpenAPI/Swagger specifications lezen

OpenAPI specs bevatten gestructureerde informatie over een API:

**Key secties:**
• **Paths**: Alle beschikbare endpoints
• **Components/Definitions**: Data models en schemas
• **Security**: Authenticatie methodes
• **Servers**: Base URLs en environments

**Voorbeeld structuur:**
\`\`\`yaml
openapi: 3.0.0
info:
  title: Payment API
  version: 1.0.0
servers:
  - url: https://api.payment.com/v1
paths:
  /payments:
    post:
      summary: Create a payment
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Payment'
      responses:
        201:
          description: Payment created
\`\`\`

**Tools voor OpenAPI:**
• Swagger UI - Interactieve documentatie viewer
• Swagger Editor - Online spec editor met preview
• Postman - Import OpenAPI specs direct

## GraphQL schema documentatie

GraphQL APIs zijn self-documenting door hun typed schema:

**Schema exploratie:**
• Use GraphQL playground of GraphiQL
• Introspection queries voor schema info
• Type definitions vertellen exact wat mogelijk is

**Voorbeeld GraphQL schema:**
\`\`\`graphql
type Query {
  # Get user by ID
  user(id: ID!): User
  # List all products with pagination
  products(first: Int, after: String): ProductConnection!
}

type User {
  id: ID!
  name: String!
  email: String!
  orders: [Order!]!
}

type Mutation {
  # Create a new order
  createOrder(input: CreateOrderInput!): Order!
}
\`\`\`

**GraphQL documentation tools:**
• GraphQL Playground
• Apollo Studio
• GraphiQL
• Altair GraphQL Client

## Postman collections gebruiken

Postman collections zijn praktische API documentatie:

**Voordelen:**
• Direct uitvoerbare requests
• Environment variables voor verschillende stages
• Pre-request scripts en tests
• Response examples
• Gedeelde team workspaces

**Collection structuur:**
\`\`\`json
{
  "info": {
    "name": "Stripe API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/"
  },
  "item": [
    {
      "name": "Customers",
      "item": [
        {
          "name": "Create Customer",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{api_key}}"
              }
            ],
            "url": "{{base_url}}/customers",
            "body": {
              "mode": "raw",
              "raw": "{\\"email\\": \\"test@example.com\\"}"
            }
          }
        }
      ]
    }
  ]
}
\`\`\`

**Tips voor Postman:**
• Fork official collections wanneer beschikbaar
• Gebruik environments voor API keys
• Schrijf tests voor response validation
• Genereer code snippets voor je programmeertaal

## API documentatie checklist

Bij het evalueren van API documentatie, zoek naar:

**Essentiële informatie:**
□ Authentication methods (API keys, OAuth, JWT)
□ Base URL en versioning strategie
□ Rate limiting details
□ Error response formats
□ Request/response examples
□ SDK's of client libraries
□ Webhook event types (indien van toepassing)
□ Sandbox/test environment

**Quality indicators:**
□ Up-to-date changelog
□ Interactive API explorer
□ Code examples in meerdere talen
□ Duidelijke data type definitions
□ Status page voor uptime monitoring
□ Community forum of support kanaal

**Red flags:**
□ Laatste update > 1 jaar geleden
□ Geen versioning informatie
□ Ontbrekende error documentatie
□ Geen response examples
□ Inconsistente naming conventions

## Endpoints testen en exploreren

Voordat je begint met coderen, test endpoints handmatig:

**1. Start met authenticatie**
Test eerst of je correct kunt authenticeren:
\`\`\`bash
# API Key authentication
curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://api.example.com/v1/test

# Basic auth
curl -u username:password \\
  https://api.example.com/v1/test
\`\`\`

**2. Test read-only endpoints eerst**
Begin met GET requests om de data structuur te begrijpen.

**3. Gebruik tools voor exploratie:**
• **httpie** - User-friendly command line HTTP client
• **Insomnia** - REST en GraphQL client
• **Thunder Client** - VS Code extension
• **RapidAPI** - API marketplace met ingebouwde testing

**4. Let op response headers:**
\`\`\`
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1619827200
Content-Type: application/json
X-Request-Id: 12345-67890
\`\`\`

**5. Test error scenarios:**
• Ongeldige parameters
• Missing required fields  
• Exceeded rate limits
• Unauthorized requests`,
  codeExamples: [
    {
      id: 'openapi-spec-parser',
      title: 'OpenAPI Spec Parser',
      language: 'javascript',
      code: `// Parse en analyseer een OpenAPI specification
import SwaggerParser from '@apidevtools/swagger-parser';

class APIDocAnalyzer {
  async analyzeOpenAPISpec(specUrl) {
    try {
      // Parse de OpenAPI spec
      const api = await SwaggerParser.validate(specUrl);
      
      console.log('API Name:', api.info.title);
      console.log('Version:', api.info.version);
      console.log('Base URL:', api.servers[0].url);
      
      // Analyseer endpoints
      const endpoints = this.extractEndpoints(api.paths);
      console.log('\\nAvailable endpoints:');
      endpoints.forEach(ep => {
        console.log(\`  \${ep.method.toUpperCase()} \${ep.path}\`);
        if (ep.summary) console.log(\`    → \${ep.summary}\`);
      });
      
      // Analyseer authenticatie
      const auth = this.extractAuthentication(api.components?.securitySchemes);
      console.log('\\nAuthentication methods:', auth);
      
      // Analyseer data models
      const models = this.extractModels(api.components?.schemas);
      console.log('\\nData models:', Object.keys(models));
      
      return {
        info: api.info,
        servers: api.servers,
        endpoints,
        authentication: auth,
        models
      };
      
    } catch (error) {
      console.error('Error parsing OpenAPI spec:', error);
      throw error;
    }
  }
  
  extractEndpoints(paths) {
    const endpoints = [];
    
    for (const [path, methods] of Object.entries(paths)) {
      for (const [method, details] of Object.entries(methods)) {
        if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
          endpoints.push({
            path,
            method,
            summary: details.summary,
            operationId: details.operationId,
            parameters: details.parameters,
            requestBody: details.requestBody,
            responses: Object.keys(details.responses)
          });
        }
      }
    }
    
    return endpoints;
  }
  
  extractAuthentication(securitySchemes) {
    if (!securitySchemes) return [];
    
    return Object.entries(securitySchemes).map(([name, scheme]) => ({
      name,
      type: scheme.type,
      scheme: scheme.scheme,
      in: scheme.in,
      description: scheme.description
    }));
  }
  
  extractModels(schemas) {
    if (!schemas) return {};
    
    const models = {};
    
    for (const [name, schema] of Object.entries(schemas)) {
      models[name] = {
        type: schema.type,
        required: schema.required || [],
        properties: Object.keys(schema.properties || {})
      };
    }
    
    return models;
  }
}

// Gebruik
const analyzer = new APIDocAnalyzer();

// Analyseer Stripe API
analyzer.analyzeOpenAPISpec('https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json')
  .then(analysis => {
    console.log('\\nAPI Analysis complete!');
    console.log('Total endpoints:', analysis.endpoints.length);
  });`,
      explanation: 'Deze code parseert OpenAPI specificaties en extraheert belangrijke informatie zoals endpoints, authenticatie methodes, en data models.'
    },
    {
      id: 'graphql-explorer',
      title: 'GraphQL Schema Explorer',
      language: 'javascript',
      code: `// GraphQL schema introspection en documentatie explorer
import { buildClientSchema, getIntrospectionQuery, printSchema } from 'graphql';

class GraphQLDocExplorer {
  constructor(endpoint, headers = {}) {
    this.endpoint = endpoint;
    this.headers = headers;
  }
  
  async exploreSchema() {
    try {
      // Run introspection query
      const introspectionResult = await this.runIntrospectionQuery();
      
      // Build client schema
      const schema = buildClientSchema(introspectionResult.data);
      
      // Extract useful information
      const types = this.extractTypes(schema);
      const queries = this.extractQueries(schema);
      const mutations = this.extractMutations(schema);
      const subscriptions = this.extractSubscriptions(schema);
      
      return {
        schemaSDL: printSchema(schema),
        types,
        queries,
        mutations,
        subscriptions
      };
      
    } catch (error) {
      console.error('Schema exploration failed:', error);
      throw error;
    }
  }
  
  async runIntrospectionQuery() {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.headers
      },
      body: JSON.stringify({
        query: getIntrospectionQuery()
      })
    });
    
    return response.json();
  }
  
  extractTypes(schema) {
    const typeMap = schema.getTypeMap();
    const customTypes = {};
    
    for (const [typeName, type] of Object.entries(typeMap)) {
      // Skip built-in types
      if (typeName.startsWith('__')) continue;
      if (['String', 'Int', 'Float', 'Boolean', 'ID'].includes(typeName)) continue;
      
      customTypes[typeName] = {
        kind: type.constructor.name,
        description: type.description,
        fields: this.extractFields(type)
      };
    }
    
    return customTypes;
  }
  
  extractFields(type) {
    if (!type.getFields) return null;
    
    const fields = type.getFields();
    const fieldInfo = {};
    
    for (const [fieldName, field] of Object.entries(fields)) {
      fieldInfo[fieldName] = {
        type: field.type.toString(),
        description: field.description,
        args: field.args?.map(arg => ({
          name: arg.name,
          type: arg.type.toString(),
          description: arg.description
        }))
      };
    }
    
    return fieldInfo;
  }
  
  extractQueries(schema) {
    const queryType = schema.getQueryType();
    return queryType ? this.extractFields(queryType) : {};
  }
  
  extractMutations(schema) {
    const mutationType = schema.getMutationType();
    return mutationType ? this.extractFields(mutationType) : {};
  }
  
  extractSubscriptions(schema) {
    const subscriptionType = schema.getSubscriptionType();
    return subscriptionType ? this.extractFields(subscriptionType) : {};
  }
  
  async testQuery(query, variables = {}) {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.headers
      },
      body: JSON.stringify({ query, variables })
    });
    
    return response.json();
  }
}

// Gebruik met GitHub GraphQL API
const explorer = new GraphQLDocExplorer(
  'https://api.github.com/graphql',
  {
    'Authorization': \`Bearer \${process.env.GITHUB_TOKEN}\`
  }
);

// Exploreer schema
explorer.exploreSchema().then(schema => {
  console.log('Available Types:', Object.keys(schema.types));
  console.log('\\nQueries:', Object.keys(schema.queries));
  console.log('\\nMutations:', Object.keys(schema.mutations));
  
  // Test een query
  return explorer.testQuery(\`
    query {
      viewer {
        login
        repositories(first: 5) {
          nodes {
            name
            description
          }
        }
      }
    }
  \`);
}).then(result => {
  console.log('\\nQuery result:', result);
});`,
      explanation: 'Deze GraphQL explorer gebruikt introspection om het complete schema te analyseren en maakt het makkelijk om queries te testen.'
    },
    {
      id: 'postman-runner',
      title: 'Postman Collection Runner',
      language: 'javascript',
      code: `// Postman collection parser en test runner
const newman = require('newman');
const fs = require('fs').promises;

class PostmanCollectionRunner {
  constructor(collectionPath, environmentPath = null) {
    this.collectionPath = collectionPath;
    this.environmentPath = environmentPath;
    this.results = [];
  }
  
  async analyzeCollection() {
    const collection = JSON.parse(
      await fs.readFile(this.collectionPath, 'utf8')
    );
    
    const analysis = {
      name: collection.info.name,
      description: collection.info.description,
      variables: this.extractVariables(collection),
      requests: this.extractRequests(collection.item),
      auth: collection.auth,
      events: collection.event
    };
    
    console.log('Collection Analysis:');
    console.log('Name:', analysis.name);
    console.log('Total requests:', analysis.requests.length);
    console.log('Variables used:', Object.keys(analysis.variables));
    
    return analysis;
  }
  
  extractVariables(collection) {
    const variables = {};
    
    // Extract from collection variables
    if (collection.variable) {
      collection.variable.forEach(v => {
        variables[v.key] = v.value;
      });
    }
    
    return variables;
  }
  
  extractRequests(items, path = '') {
    const requests = [];
    
    items.forEach(item => {
      if (item.request) {
        // This is a request
        requests.push({
          name: item.name,
          path: path + '/' + item.name,
          method: item.request.method,
          url: item.request.url?.raw || item.request.url,
          headers: item.request.header,
          body: item.request.body,
          auth: item.request.auth,
          tests: item.event?.find(e => e.listen === 'test')
        });
      } else if (item.item) {
        // This is a folder
        const folderPath = path + '/' + item.name;
        requests.push(...this.extractRequests(item.item, folderPath));
      }
    });
    
    return requests;
  }
  
  async runCollection(options = {}) {
    return new Promise((resolve, reject) => {
      const runOptions = {
        collection: this.collectionPath,
        reporters: ['cli', 'json'],
        reporter: {
          json: {
            export: './postman-run-report.json'
          }
        },
        ...options
      };
      
      if (this.environmentPath) {
        runOptions.environment = this.environmentPath;
      }
      
      newman.run(runOptions, (err, summary) => {
        if (err) {
          reject(err);
          return;
        }
        
        const results = {
          collection: summary.collection.name,
          iterations: summary.run.stats.iterations,
          requests: {
            total: summary.run.stats.requests.total,
            failed: summary.run.stats.requests.failed
          },
          assertions: {
            total: summary.run.stats.assertions.total,
            failed: summary.run.stats.assertions.failed
          },
          duration: summary.run.timings.completed - summary.run.timings.started,
          failures: []
        };
        
        // Extract failures
        summary.run.failures.forEach(failure => {
          results.failures.push({
            request: failure.source.name,
            test: failure.error.test,
            message: failure.error.message
          });
        });
        
        resolve(results);
      });
    });
  }
  
  async generateAPIClient(language = 'javascript') {
    const collection = JSON.parse(
      await fs.readFile(this.collectionPath, 'utf8')
    );
    
    const requests = this.extractRequests(collection.item);
    let clientCode = '';
    
    switch (language) {
      case 'javascript':
        clientCode = this.generateJavaScriptClient(collection, requests);
        break;
      case 'python':
        clientCode = this.generatePythonClient(collection, requests);
        break;
      default:
        throw new Error(\`Unsupported language: \${language}\`);
    }
    
    return clientCode;
  }
  
  generateJavaScriptClient(collection, requests) {
    const className = collection.info.name.replace(/[^a-zA-Z0-9]/g, '');
    
    let code = \`// Auto-generated API client from Postman collection
class \${className}Client {
  constructor(baseURL, headers = {}) {
    this.baseURL = baseURL;
    this.headers = headers;
  }
  
  async request(method, path, options = {}) {
    const url = this.baseURL + path;
    const response = await fetch(url, {
      method,
      headers: { ...this.headers, ...options.headers },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    
    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    }
    
    return response.json();
  }
\`;
    
    // Generate methods for each request
    requests.forEach(request => {
      const methodName = request.name
        .replace(/[^a-zA-Z0-9]/g, '')
        .replace(/^[0-9]/, '_$&');
      
      const urlPattern = request.url
        .replace(/{{(.*?)}}/g, '\${$1}')
        .replace(this.baseURL, '');
      
      code += \`
  
  async \${methodName}(params = {}, body = null) {
    return this.request('\${request.method}', \\\`\${urlPattern}\\\`, {
      body
    });
  }\`;
    });
    
    code += \`
}

module.exports = \${className}Client;\`;
    
    return code;
  }
  
  generatePythonClient(collection, requests) {
    // Python client generation implementation
    return '# Python client implementation here';
  }
}

// Gebruik
async function analyzeAndTestAPI() {
  const runner = new PostmanCollectionRunner(
    './stripe-api-collection.json',
    './stripe-environment.json'
  );
  
  // Analyseer collection
  const analysis = await runner.analyzeCollection();
  
  // Run tests
  console.log('\\nRunning collection tests...');
  const results = await runner.runCollection({
    iterationCount: 1,
    bail: false  // Continue on failures
  });
  
  console.log('\\nTest Results:');
  console.log('Total requests:', results.requests.total);
  console.log('Failed requests:', results.requests.failed);
  console.log('Duration:', results.duration + 'ms');
  
  if (results.failures.length > 0) {
    console.log('\\nFailures:');
    results.failures.forEach(f => {
      console.log(\`  - \${f.request}: \${f.message}\`);
    });
  }
  
  // Generate client
  const clientCode = await runner.generateAPIClient('javascript');
  await fs.writeFile('./generated-api-client.js', clientCode);
  console.log('\\nGenerated API client saved to generated-api-client.js');
}

analyzeAndTestAPI();`,
      explanation: 'Deze Postman collection runner kan collections analyseren, tests uitvoeren, en zelfs API clients genereren op basis van de collection.'
    },
    {
      id: 'api-examples',
      title: 'Popular API Examples',
      language: 'javascript',
      code: `// Voorbeelden van populaire API documentatie patronen

// 1. Stripe API - Uitstekende documentatie
const stripeExample = {
  documentation: 'https://stripe.com/docs/api',
  features: [
    'Interactieve API explorer',
    'Code examples in 8+ talen',
    'Versioning met datum-based headers',
    'Uitgebreide webhook documentatie',
    'Test mode met fake credit cards'
  ],
  authentication: 'Bearer token (sk_test_... / sk_live_...)',
  example: async () => {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    // Create customer
    const customer = await stripe.customers.create({
      email: 'customer@example.com',
      description: 'Test customer'
    });
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000, // in cents
      currency: 'eur',
      customer: customer.id
    });
  }
};

// 2. Twilio API - SMS en Voice
const twilioExample = {
  documentation: 'https://www.twilio.com/docs',
  features: [
    'Helper libraries voor alle major languages',
    'Webhook debugger in console',
    'Sandbox environment voor testing',
    'TwiML (Twilio Markup Language)'
  ],
  authentication: 'Basic Auth (Account SID + Auth Token)',
  example: async () => {
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    
    // Send SMS
    const message = await client.messages.create({
      body: 'Hello from Twilio!',
      from: '+1234567890',
      to: '+0987654321'
    });
  }
};

// 3. GitHub API - REST en GraphQL
const githubExample = {
  documentation: 'https://docs.github.com',
  features: [
    'REST API v3 en GraphQL v4',
    'OAuth en Personal Access Tokens',
    'Webhook events voor alle acties',
    'Rate limiting met clear headers'
  ],
  authentication: 'Bearer token of OAuth',
  example: async () => {
    // REST API
    const response = await fetch('https://api.github.com/user/repos', {
      headers: {
        'Authorization': \`Bearer \${process.env.GITHUB_TOKEN}\`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    // GraphQL API
    const graphqlResponse = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${process.env.GITHUB_TOKEN}\`
      },
      body: JSON.stringify({
        query: \`
          query {
            viewer {
              repositories(first: 10) {
                nodes {
                  name
                  stargazerCount
                }
              }
            }
          }
        \`
      })
    });
  }
};

// 4. SendGrid API - Email delivery
const sendgridExample = {
  documentation: 'https://docs.sendgrid.com',
  features: [
    'Email templates met handlebars',
    'Webhook events voor delivery tracking',
    'Batch sending capabilities',
    'IP warming voor high volume'
  ],
  authentication: 'Bearer token (API Key)',
  example: async () => {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const msg = {
      to: 'recipient@example.com',
      from: 'sender@example.com',
      subject: 'Hello from SendGrid',
      text: 'Plain text content',
      html: '<strong>HTML content</strong>'
    };
    
    await sgMail.send(msg);
  }
};

// 5. Shopify API - E-commerce platform
const shopifyExample = {
  documentation: 'https://shopify.dev/api',
  features: [
    'REST en GraphQL APIs',
    'Webhook verificatie met HMAC',
    'API versioning per quarter',
    'Rate limiting met bucket system',
    'Bulk operations voor grote datasets'
  ],
  authentication: 'OAuth of Private App credentials',
  example: async () => {
    const { Shopify } = require('@shopify/shopify-api');
    
    const client = new Shopify.Clients.Rest(
      shop,
      accessToken
    );
    
    // Get products
    const products = await client.get({
      path: 'products',
      query: { limit: 10 }
    });
    
    // GraphQL voor complexe queries
    const graphQLClient = new Shopify.Clients.Graphql(
      shop,
      accessToken
    );
    
    const productQuery = \`
      {
        products(first: 10) {
          edges {
            node {
              id
              title
              variants(first: 5) {
                edges {
                  node {
                    price
                    inventoryQuantity
                  }
                }
              }
            }
          }
        }
      }
    \`;
    
    const response = await graphQLClient.query({
      data: productQuery
    });
  }
};

// API Documentation Quality Scorecard
function evaluateAPIDocumentation(apiName, criteria) {
  const scores = {
    authentication: 0,
    examples: 0,
    errorHandling: 0,
    versioning: 0,
    sandbox: 0,
    sdks: 0,
    webhooks: 0,
    rateLimit: 0,
    changelog: 0,
    support: 0
  };
  
  let totalScore = 0;
  for (const [key, value] of Object.entries(criteria)) {
    if (value) {
      scores[key] = 1;
      totalScore++;
    }
  }
  
  return {
    api: apiName,
    scores,
    totalScore,
    percentage: (totalScore / 10) * 100
  };
}

// Evalueer verschillende APIs
const evaluations = [
  evaluateAPIDocumentation('Stripe', {
    authentication: true,
    examples: true,
    errorHandling: true,
    versioning: true,
    sandbox: true,
    sdks: true,
    webhooks: true,
    rateLimit: true,
    changelog: true,
    support: true
  }),
  evaluateAPIDocumentation('Random API', {
    authentication: true,
    examples: false,
    errorHandling: false,
    versioning: false,
    sandbox: false,
    sdks: false,
    webhooks: false,
    rateLimit: true,
    changelog: false,
    support: false
  })
];

console.log('API Documentation Quality Scores:');
evaluations.forEach(eval => {
  console.log(\`\${eval.api}: \${eval.percentage}% (\${eval.totalScore}/10)\`);
});`,
      explanation: 'Deze voorbeelden tonen best practices van populaire APIs zoals Stripe, Twilio, GitHub, SendGrid, en Shopify, plus een scorecard voor het evalueren van API documentatie kwaliteit.'
    }
  ],
  assignments: [
    {
      id: 'analyze-three-apis',
      title: 'Analyseer drie verschillende APIs',
      description: 'Kies drie APIs uit verschillende categorieën (payment, communication, data) en maak een vergelijkende analyse van hun documentatie kwaliteit, authenticatie methodes, en developer experience.',
      difficulty: 'medium',
      type: 'project'
    },
    {
      id: 'openapi-to-client',
      title: 'OpenAPI naar API client',
      description: 'Download een OpenAPI specification van een publieke API en schrijf een tool die automatisch een typed TypeScript client genereert met alle endpoints en models.',
      difficulty: 'hard',
      type: 'project'
    },
    {
      id: 'documentation-improver',
      title: 'API documentatie verbeteren',
      description: 'Vind een API met matige documentatie en creëer een verbeterde versie met: interactive examples, error scenario\'s, rate limit info, en webhook documentatie.',
      difficulty: 'medium',
      type: 'project'
    }
  ],
  resources: [
    {
      title: 'OpenAPI Initiative',
      url: 'https://www.openapis.org/',
      type: 'website'
    },
    {
      title: 'Swagger Editor Online',
      url: 'https://editor.swagger.io/',
      type: 'tool'
    },
    {
      title: 'Postman Learning Center',
      url: 'https://learning.postman.com/',
      type: 'tutorial'
    },
    {
      title: 'GraphQL Official Documentation',
      url: 'https://graphql.org/learn/',
      type: 'documentation'
    },
    {
      title: 'RapidAPI - API Marketplace',
      url: 'https://rapidapi.com/',
      type: 'marketplace'
    }
  ]
};