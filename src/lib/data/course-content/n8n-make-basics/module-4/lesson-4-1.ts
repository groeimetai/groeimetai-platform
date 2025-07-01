import type { Lesson } from '@/lib/data/courses';

export const lesson4_1: Lesson = {
  id: 'lesson-4-1',
  title: 'Nederlandse Tool Integraties: Moneybird, Exact Online & Mollie',
  duration: '90 min',
  content: `
# Nederlandse Tool Integraties: Complete API Implementaties

## Introductie

In deze les duiken we diep in de integratie van populaire Nederlandse business tools met N8N en Make. We bouwen production-ready workflows voor Moneybird (boekhouding), Exact Online (ERP), en Mollie (betalingen). Je leert niet alleen hoe je deze APIs integreert, maar ook hoe je robuuste webhook security, error handling, en retry mechanisms implementeert.

## 1. Moneybird API Integratie

### API Setup en Authenticatie

Moneybird gebruikt OAuth2 voor authenticatie. Hier is de complete setup:

\`\`\`javascript
// Moneybird API Configuration
const moneybirdConfig = {
  baseURL: 'https://moneybird.com/api/v2',
  auth: {
    type: 'OAuth2',
    clientId: process.env.MONEYBIRD_CLIENT_ID,
    clientSecret: process.env.MONEYBIRD_CLIENT_SECRET,
    redirectUri: 'https://your-domain.com/oauth/callback',
    scope: 'sales_invoices documents estimates bank'
  },
  endpoints: {
    invoices: '/{administration_id}/sales_invoices',
    contacts: '/{administration_id}/contacts',
    ledgerAccounts: '/{administration_id}/ledger_accounts',
    webhooks: '/{administration_id}/webhooks'
  }
};

// OAuth2 Token Refresh Handler
async function refreshMoneybirdToken(refreshToken) {
  const response = await fetch('https://moneybird.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: moneybirdConfig.auth.clientId,
      client_secret: moneybirdConfig.auth.clientSecret
    })
  });
  
  if (!response.ok) {
    throw new Error(\`Token refresh failed: \${response.statusText}\`);
  }
  
  return response.json();
}
\`\`\`

### Moneybird Webhook Implementation

\`\`\`javascript
// Secure Moneybird Webhook Handler
class MoneybirdWebhookHandler {
  constructor(webhookSecret) {
    this.webhookSecret = webhookSecret;
    this.allowedIPs = [
      '185.14.185.0/24', // Moneybird IP range
      '2a02:2c40:200::/48'
    ];
  }
  
  validateSignature(payload, signature) {
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
  
  validateIP(requestIP) {
    return this.allowedIPs.some(range => {
      // IP validation logic
      return ipRangeCheck(requestIP, range);
    });
  }
  
  async handleWebhook(request) {
    // 1. Validate IP
    if (!this.validateIP(request.ip)) {
      throw new Error('Unauthorized IP address');
    }
    
    // 2. Validate signature
    const signature = request.headers['x-moneybird-signature'];
    if (!this.validateSignature(request.body, signature)) {
      throw new Error('Invalid webhook signature');
    }
    
    // 3. Parse and validate payload
    const event = JSON.parse(request.body);
    
    // 4. Handle based on event type
    switch (event.entity) {
      case 'sales_invoice':
        return this.handleInvoiceEvent(event);
      case 'contact':
        return this.handleContactEvent(event);
      case 'payment':
        return this.handlePaymentEvent(event);
      default:
        console.log(\`Unhandled event type: \${event.entity}\`);
    }
  }
}
\`\`\`

## 2. Exact Online Integratie

### Exact Online API Setup

\`\`\`javascript
// Exact Online Configuration
const exactOnlineConfig = {
  baseURL: 'https://start.exactonline.nl/api/v1',
  auth: {
    type: 'OAuth2',
    authUrl: 'https://start.exactonline.nl/api/oauth2/auth',
    tokenUrl: 'https://start.exactonline.nl/api/oauth2/token',
    clientId: process.env.EXACT_CLIENT_ID,
    clientSecret: process.env.EXACT_CLIENT_SECRET
  },
  division: process.env.EXACT_DIVISION, // Your division code
  endpoints: {
    accounts: '/crm/Accounts',
    invoices: '/salesinvoice/SalesInvoices',
    items: '/logistics/Items',
    projects: '/project/Projects'
  }
};

// Exact Online API Client
class ExactOnlineClient {
  constructor(config) {
    this.config = config;
    this.accessToken = null;
    this.tokenExpiry = null;
  }
  
  async ensureAuthenticated() {
    if (!this.accessToken || Date.now() >= this.tokenExpiry) {
      await this.refreshToken();
    }
  }
  
  async makeRequest(endpoint, method = 'GET', data = null) {
    await this.ensureAuthenticated();
    
    const url = \`\${this.config.baseURL}/\${this.config.division}\${endpoint}\`;
    const headers = {
      'Authorization': \`Bearer \${this.accessToken}\`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    
    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : null
    });
    
    if (response.status === 429) {
      // Handle rate limiting
      const retryAfter = response.headers.get('Retry-After') || 60;
      await this.delay(retryAfter * 1000);
      return this.makeRequest(endpoint, method, data);
    }
    
    if (!response.ok) {
      throw new Error(\`Exact API error: \${response.statusText}\`);
    }
    
    return response.json();
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
\`\`\`

### Exact Online Sync Workflow

\`\`\`javascript
// Bi-directional sync between Exact Online and Moneybird
class ExactMoneybirdSync {
  constructor(exactClient, moneybirdClient) {
    this.exact = exactClient;
    this.moneybird = moneybirdClient;
    this.syncLog = [];
  }
  
  async syncContacts() {
    try {
      // Fetch contacts from Exact
      const exactContacts = await this.exact.makeRequest('/crm/Accounts');
      
      // Fetch contacts from Moneybird
      const moneybirdContacts = await this.moneybird.getContacts();
      
      // Create lookup maps
      const exactMap = new Map(exactContacts.d.results.map(c => [c.Email, c]));
      const moneybirdMap = new Map(moneybirdContacts.map(c => [c.email, c]));
      
      // Sync logic
      for (const [email, exactContact] of exactMap) {
        if (!moneybirdMap.has(email)) {
          // Create in Moneybird
          await this.createMoneybirdContact(exactContact);
        } else {
          // Update if needed
          await this.updateContactIfNeeded(exactContact, moneybirdMap.get(email));
        }
      }
      
      return {
        processed: exactMap.size,
        created: this.syncLog.filter(l => l.action === 'create').length,
        updated: this.syncLog.filter(l => l.action === 'update').length
      };
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }
}
\`\`\`

## 3. Mollie Payment Integration

### Mollie API Configuration

\`\`\`javascript
// Mollie Payment Configuration
const mollieConfig = {
  baseURL: 'https://api.mollie.com/v2',
  apiKey: process.env.MOLLIE_API_KEY,
  testMode: process.env.NODE_ENV !== 'production',
  webhookUrl: 'https://your-domain.com/webhooks/mollie',
  endpoints: {
    payments: '/payments',
    customers: '/customers',
    subscriptions: '/subscriptions',
    refunds: '/refunds'
  }
};

// Mollie Payment Handler
class MolliePaymentHandler {
  constructor(config) {
    this.config = config;
    this.headers = {
      'Authorization': \`Bearer \${config.apiKey}\`,
      'Content-Type': 'application/json'
    };
  }
  
  async createPayment(orderData) {
    const payment = {
      amount: {
        currency: 'EUR',
        value: orderData.amount.toFixed(2)
      },
      description: orderData.description,
      redirectUrl: \`\${process.env.APP_URL}/orders/\${orderData.id}/complete\`,
      webhookUrl: this.config.webhookUrl,
      metadata: {
        orderId: orderData.id,
        customerEmail: orderData.customerEmail
      },
      method: orderData.paymentMethod || null // null = all methods
    };
    
    const response = await fetch(\`\${this.config.baseURL}/payments\`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(payment)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(\`Mollie error: \${error.detail}\`);
    }
    
    return response.json();
  }
  
  async handleWebhook(paymentId) {
    // Fetch payment details
    const payment = await this.getPayment(paymentId);
    
    // Handle based on status
    switch (payment.status) {
      case 'paid':
        await this.handlePaidPayment(payment);
        break;
      case 'failed':
        await this.handleFailedPayment(payment);
        break;
      case 'canceled':
        await this.handleCanceledPayment(payment);
        break;
      case 'expired':
        await this.handleExpiredPayment(payment);
        break;
    }
    
    return payment;
  }
  
  async handlePaidPayment(payment) {
    const orderId = payment.metadata.orderId;
    
    // Update order status
    await this.updateOrderStatus(orderId, 'paid');
    
    // Create invoice in Moneybird
    await this.createInvoice(payment);
    
    // Send confirmation email
    await this.sendConfirmationEmail(payment);
  }
}
\`\`\`

### Webhook Security Implementation

\`\`\`javascript
// Advanced Webhook Security
class WebhookSecurityManager {
  constructor() {
    this.rateLimiter = new Map();
    this.blacklist = new Set();
  }
  
  // HMAC Signature Validation
  validateHMAC(payload, signature, secret) {
    const hash = crypto
      .createHmac('sha256', secret)
      .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
      .digest('hex');
    
    // Timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(hash)
    );
  }
  
  // Rate Limiting
  checkRateLimit(identifier, limit = 100, window = 3600000) {
    const now = Date.now();
    const userLimits = this.rateLimiter.get(identifier) || { count: 0, resetAt: now + window };
    
    if (now > userLimits.resetAt) {
      userLimits.count = 0;
      userLimits.resetAt = now + window;
    }
    
    if (userLimits.count >= limit) {
      return false;
    }
    
    userLimits.count++;
    this.rateLimiter.set(identifier, userLimits);
    return true;
  }
  
  // IP Whitelisting
  validateIP(requestIP, allowedRanges) {
    return allowedRanges.some(range => {
      if (range.includes('/')) {
        return this.ipInCIDR(requestIP, range);
      }
      return requestIP === range;
    });
  }
  
  // Replay Attack Prevention
  validateTimestamp(timestamp, maxAge = 300000) { // 5 minutes
    const now = Date.now();
    const requestTime = new Date(timestamp).getTime();
    
    if (isNaN(requestTime)) {
      return false;
    }
    
    return Math.abs(now - requestTime) <= maxAge;
  }
}
\`\`\`

## 4. Error Handling & Retry Patterns

### Circuit Breaker Implementation

\`\`\`javascript
// Circuit Breaker for API Calls
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000;
    this.monitoringPeriod = options.monitoringPeriod || 10000;
    
    this.state = 'CLOSED';
    this.failures = 0;
    this.nextAttempt = Date.now();
    this.successCount = 0;
    this.lastFailureTime = null;
  }
  
  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failures = 0;
    
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= 3) {
        this.state = 'CLOSED';
        this.successCount = 0;
      }
    }
  }
  
  onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
      this.successCount = 0;
    }
  }
}

// Retry with Exponential Backoff
class RetryHandler {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.baseDelay = options.baseDelay || 1000;
    this.maxDelay = options.maxDelay || 30000;
    this.exponentialFactor = options.exponentialFactor || 2;
  }
  
  async executeWithRetry(fn, context = {}) {
    let lastError;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Don't retry on certain errors
        if (this.isNonRetryableError(error)) {
          throw error;
        }
        
        if (attempt < this.maxRetries) {
          const delay = this.calculateDelay(attempt);
          console.log(\`Retry attempt \${attempt + 1} after \${delay}ms\`);
          await this.sleep(delay);
        }
      }
    }
    
    throw lastError;
  }
  
  calculateDelay(attempt) {
    const delay = this.baseDelay * Math.pow(this.exponentialFactor, attempt);
    return Math.min(delay, this.maxDelay);
  }
  
  isNonRetryableError(error) {
    // Don't retry on client errors (4xx)
    if (error.statusCode >= 400 && error.statusCode < 500) {
      return true;
    }
    return false;
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
\`\`\`

## 5. Complete Workflow Implementaties

### Workflow 1: Moneybird naar Slack Notificaties

\`\`\`json
{
  "name": "Moneybird Invoice Notifications to Slack",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "moneybird-webhook",
        "responseMode": "responseNode",
        "options": {}
      },
      "name": "Moneybird Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "functionCode": "// Validate webhook signature\\nconst crypto = require('crypto');\\n\\nconst payload = JSON.stringify($input.first().json);\\nconst signature = $input.first().headers['x-moneybird-signature'];\\nconst secret = $credentials.moneybirdWebhookSecret;\\n\\nconst expectedSignature = crypto\\n  .createHmac('sha256', secret)\\n  .update(payload)\\n  .digest('hex');\\n\\nif (signature !== expectedSignature) {\\n  throw new Error('Invalid webhook signature');\\n}\\n\\nreturn $input.all();"
      },
      "name": "Validate Signature",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "dataPropertyName": "entity",
        "rules": {
          "rules": [
            {
              "operation": "equals",
              "value": "sales_invoice",
              "output": 0
            },
            {
              "operation": "equals",
              "value": "payment",
              "output": 1
            },
            {
              "operation": "equals",
              "value": "contact",
              "output": 2
            }
          ]
        },
        "fallbackOutput": 3
      },
      "name": "Event Router",
      "type": "n8n-nodes-base.switch",
      "typeVersion": 1,
      "position": [650, 300]
    },
    {
      "parameters": {
        "authentication": "oAuth2",
        "resource": "invoice",
        "operation": "get",
        "invoiceId": "={{$json.id}}"
      },
      "name": "Get Invoice Details",
      "type": "n8n-nodes-custom.moneybird",
      "typeVersion": 1,
      "position": [850, 200],
      "credentials": {
        "moneybirdOAuth2Api": "Moneybird OAuth2"
      }
    },
    {
      "parameters": {
        "channel": "#finance-notifications",
        "text": ":moneybag: Nieuwe factuur aangemaakt!",
        "attachments": [
          {
            "color": "#28a745",
            "fields": {
              "item": [
                {
                  "short": true,
                  "name": "Factuurnummer",
                  "value": "={{$json.invoice_id}}"
                },
                {
                  "short": true,
                  "name": "Klant",
                  "value": "={{$json.contact.company_name}}"
                },
                {
                  "short": true,
                  "name": "Bedrag",
                  "value": "€{{$json.total_price_incl_tax}}"
                },
                {
                  "short": true,
                  "name": "Status",
                  "value": "={{$json.state}}"
                }
              ]
            },
            "footer": "Moneybird Integration",
            "ts": "={{Date.now() / 1000}}"
          }
        ]
      },
      "name": "Send to Slack",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 1,
      "position": [1050, 200],
      "credentials": {
        "slackApi": "Slack API"
      }
    },
    {
      "parameters": {
        "mode": "responseNode",
        "responseCode": 200,
        "responseData": "={\\\"status\\\":\\\"received\\\"}"
      },
      "name": "Webhook Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [1250, 300]
    }
  ],
  "connections": {
    "Moneybird Webhook": {
      "main": [[{"node": "Validate Signature", "type": "main", "index": 0}]]
    },
    "Validate Signature": {
      "main": [[{"node": "Event Router", "type": "main", "index": 0}]]
    },
    "Event Router": {
      "main": [
        [{"node": "Get Invoice Details", "type": "main", "index": 0}],
        [],
        [],
        []
      ]
    },
    "Get Invoice Details": {
      "main": [[{"node": "Send to Slack", "type": "main", "index": 0}]]
    },
    "Send to Slack": {
      "main": [[{"node": "Webhook Response", "type": "main", "index": 0}]]
    }
  }
}
\`\`\`

### Workflow 2: Exact Online Synchronisatie

\`\`\`json
{
  "name": "Exact Online to Moneybird Sync",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "hours",
              "hoursInterval": 6
            }
          ]
        }
      },
      "name": "Every 6 Hours",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "resource": "account",
        "operation": "getAll",
        "returnAll": true,
        "filters": {
          "Modified": {
            "value": "={{$today.minus(1, 'day').toISO()}}",
            "operation": "gt"
          }
        }
      },
      "name": "Get Exact Accounts",
      "type": "n8n-nodes-custom.exactOnline",
      "typeVersion": 1,
      "position": [450, 300],
      "credentials": {
        "exactOnlineOAuth2Api": "Exact Online OAuth2"
      }
    },
    {
      "parameters": {
        "batchSize": 10,
        "options": {}
      },
      "name": "Split In Batches",
      "type": "n8n-nodes-base.splitInBatches",
      "typeVersion": 1,
      "position": [650, 300]
    },
    {
      "parameters": {
        "functionCode": "// Map Exact to Moneybird format\\nconst exactAccount = $input.first().json;\\n\\nreturn [{\\n  json: {\\n    contact: {\\n      company_name: exactAccount.Name,\\n      firstname: exactAccount.FirstName,\\n      lastname: exactAccount.LastName,\\n      address1: exactAccount.AddressLine1,\\n      zipcode: exactAccount.Postcode,\\n      city: exactAccount.City,\\n      country: exactAccount.Country,\\n      email: exactAccount.Email,\\n      phone: exactAccount.Phone,\\n      chamber_of_commerce: exactAccount.ChamberOfCommerce,\\n      tax_number: exactAccount.VATNumber,\\n      custom_fields: {\\n        exact_id: exactAccount.ID\\n      }\\n    }\\n  }\\n}];"
      },
      "name": "Transform Data",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [850, 300]
    },
    {
      "parameters": {
        "resource": "contact",
        "operation": "upsert",
        "updateKey": "email",
        "additionalFields": {}
      },
      "name": "Upsert in Moneybird",
      "type": "n8n-nodes-custom.moneybird",
      "typeVersion": 1,
      "position": [1050, 300],
      "credentials": {
        "moneybirdOAuth2Api": "Moneybird OAuth2"
      }
    },
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "status",
              "value": "completed"
            }
          ],
          "number": [
            {
              "name": "processed",
              "value": "={{$items().length}}"
            }
          ]
        },
        "options": {}
      },
      "name": "Set Status",
      "type": "n8n-nodes-base.set",
      "typeVersion": 1,
      "position": [1250, 300]
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": "{{$env.SYNC_LOG_SHEET_ID}}",
        "sheetName": "SyncLog",
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "timestamp": "={{$now}}",
            "source": "Exact Online",
            "destination": "Moneybird",
            "records_processed": "={{$json.processed}}",
            "status": "={{$json.status}}"
          }
        }
      },
      "name": "Log to Sheet",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 2,
      "position": [1450, 300],
      "credentials": {
        "googleSheetsOAuth2Api": "Google Sheets"
      }
    }
  ]
}
\`\`\`

### Workflow 3: Mollie Payment Webhook Handler

\`\`\`json
{
  "name": "Mollie Payment Webhook Handler",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "mollie-webhook",
        "responseMode": "responseNode",
        "options": {
          "ipWhitelist": [
            "87.233.217.24/29",
            "87.233.217.240/28"
          ]
        }
      },
      "name": "Mollie Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "method": "GET",
        "url": "=https://api.mollie.com/v2/payments/{{$json.id}}",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "mollieApi",
        "options": {}
      },
      "name": "Get Payment Status",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 2,
      "position": [450, 300],
      "credentials": {
        "mollieApi": "Mollie API"
      }
    },
    {
      "parameters": {
        "dataPropertyName": "status",
        "rules": {
          "rules": [
            {
              "operation": "equals",
              "value": "paid",
              "output": 0
            },
            {
              "operation": "equals",
              "value": "failed",
              "output": 1
            },
            {
              "operation": "equals",
              "value": "canceled",
              "output": 2
            },
            {
              "operation": "equals",
              "value": "expired",
              "output": 3
            }
          ]
        }
      },
      "name": "Payment Status Router",
      "type": "n8n-nodes-base.switch",
      "typeVersion": 1,
      "position": [650, 300]
    },
    {
      "parameters": {
        "operation": "update",
        "table": "orders",
        "updateKey": "id",
        "columns": "status,payment_id,paid_at",
        "additionalFields": {
          "id": "={{$json.metadata.orderId}}",
          "status": "paid",
          "payment_id": "={{$json.id}}",
          "paid_at": "={{$json.paidAt}}"
        }
      },
      "name": "Update Order Status",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 1,
      "position": [850, 100],
      "credentials": {
        "postgres": "PostgreSQL"
      }
    },
    {
      "parameters": {
        "resource": "invoice",
        "operation": "create",
        "additionalFields": {
          "contact_id": "={{$json.metadata.contactId}}",
          "invoice_date": "={{$now.toISODate()}}",
          "reference": "={{$json.metadata.orderId}}",
          "details_attributes": [
            {
              "description": "={{$json.description}}",
              "price": "={{$json.amount.value}}",
              "tax_rate_id": "{{$env.DEFAULT_TAX_RATE_ID}}"
            }
          ]
        }
      },
      "name": "Create Invoice",
      "type": "n8n-nodes-custom.moneybird",
      "typeVersion": 1,
      "position": [1050, 100],
      "credentials": {
        "moneybirdOAuth2Api": "Moneybird OAuth2"
      }
    },
    {
      "parameters": {
        "fromEmail": "noreply@company.nl",
        "toEmail": "={{$json.metadata.customerEmail}}",
        "subject": "Betaling ontvangen - Order #{{$json.metadata.orderId}}",
        "emailType": "html",
        "htmlBody": "<h2>Bedankt voor je betaling!</h2><p>We hebben je betaling van €{{$json.amount.value}} ontvangen.</p><p>Je order wordt nu verwerkt.</p>"
      },
      "name": "Send Confirmation",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 1,
      "position": [1250, 100]
    },
    {
      "parameters": {
        "channel": "#payments",
        "text": ":x: Betaling mislukt voor order {{$json.metadata.orderId}}",
        "attachments": [
          {
            "color": "#dc3545",
            "fields": {
              "item": [
                {
                  "short": true,
                  "name": "Order ID",
                  "value": "={{$json.metadata.orderId}}"
                },
                {
                  "short": true,
                  "name": "Bedrag",
                  "value": "€{{$json.amount.value}}"
                },
                {
                  "short": true,
                  "name": "Methode",
                  "value": "={{$json.method}}"
                },
                {
                  "short": true,
                  "name": "Fout",
                  "value": "={{$json.details.failureReason}}"
                }
              ]
            }
          }
        ]
      },
      "name": "Notify Failed Payment",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 1,
      "position": [850, 300]
    },
    {
      "parameters": {
        "mode": "responseNode",
        "responseCode": 200
      },
      "name": "OK Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [1450, 300]
    }
  ]
}
\`\`\`

### Workflow 4: Multi-Channel Invoice Distribution

\`\`\`json
{
  "name": "Automated Invoice Distribution",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "0 9 * * 1"
            }
          ]
        }
      },
      "name": "Weekly Monday 9AM",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "resource": "invoice",
        "operation": "getAll",
        "filters": {
          "state": "draft",
          "created_after": "={{$today.minus(7, 'days').toISODate()}}"
        }
      },
      "name": "Get Draft Invoices",
      "type": "n8n-nodes-custom.moneybird",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "functionCode": "// Validate invoice data\\nconst invoices = $input.all();\\nconst validInvoices = [];\\nconst errors = [];\\n\\nfor (const item of invoices) {\\n  const invoice = item.json;\\n  \\n  // Validation checks\\n  if (!invoice.contact || !invoice.contact.email) {\\n    errors.push({\\n      invoice_id: invoice.id,\\n      error: 'Missing contact email'\\n    });\\n    continue;\\n  }\\n  \\n  if (!invoice.details || invoice.details.length === 0) {\\n    errors.push({\\n      invoice_id: invoice.id,\\n      error: 'No invoice lines'\\n    });\\n    continue;\\n  }\\n  \\n  validInvoices.push(item);\\n}\\n\\nif (errors.length > 0) {\\n  // Send errors to error handler\\n  await $send('errorHandler', [{json: {errors}}]);\\n}\\n\\nreturn validInvoices;"
      },
      "name": "Validate Invoices",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [650, 300]
    },
    {
      "parameters": {
        "resource": "invoice",
        "operation": "send",
        "invoiceId": "={{$json.id}}",
        "sendMethod": "email",
        "additionalFields": {
          "email_message": "Beste {{$json.contact.firstname}},\\n\\nHierbij ontvangt u factuur {{$json.invoice_id}} voor de geleverde diensten.\\n\\nMet vriendelijke groet,\\n{{$env.COMPANY_NAME}}"
        }
      },
      "name": "Send Invoice",
      "type": "n8n-nodes-custom.moneybird",
      "typeVersion": 1,
      "position": [850, 300]
    },
    {
      "parameters": {
        "resource": "invoice",
        "operation": "update",
        "invoiceId": "={{$json.id}}",
        "updateFields": {
          "state": "sent"
        }
      },
      "name": "Mark as Sent",
      "type": "n8n-nodes-custom.moneybird",
      "typeVersion": 1,
      "position": [1050, 300]
    },
    {
      "parameters": {
        "operation": "create",
        "table": "invoice_log",
        "columns": "invoice_id,action,timestamp,status",
        "additionalFields": {
          "invoice_id": "={{$json.id}}",
          "action": "sent",
          "timestamp": "={{$now}}",
          "status": "success"
        }
      },
      "name": "Log Activity",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 1,
      "position": [1250, 300]
    }
  ]
}
\`\`\`

### Workflow 5: Intelligent Payment Reminder System

\`\`\`json
{
  "name": "Smart Payment Reminder System",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "days",
              "daysInterval": 1
            }
          ]
        }
      },
      "name": "Daily Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "resource": "invoice",
        "operation": "getAll",
        "filters": {
          "state": "sent",
          "due_date_before": "={{$today.toISODate()}}"
        }
      },
      "name": "Get Overdue Invoices",
      "type": "n8n-nodes-custom.moneybird",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "functionCode": "// Calculate reminder level\\nconst invoice = $input.first().json;\\nconst dueDate = new Date(invoice.due_date);\\nconst today = new Date();\\nconst daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));\\n\\nlet reminderLevel = 1;\\nlet template = 'friendly_reminder';\\n\\nif (daysOverdue > 30) {\\n  reminderLevel = 3;\\n  template = 'final_notice';\\n} else if (daysOverdue > 14) {\\n  reminderLevel = 2;\\n  template = 'second_reminder';\\n}\\n\\n// Check previous reminders\\nconst lastReminder = invoice.custom_fields?.last_reminder_sent;\\nif (lastReminder) {\\n  const lastReminderDate = new Date(lastReminder);\\n  const daysSinceReminder = Math.floor((today - lastReminderDate) / (1000 * 60 * 60 * 24));\\n  \\n  // Don't send if reminded in last 7 days\\n  if (daysSinceReminder < 7) {\\n    return [];\\n  }\\n}\\n\\nreturn [{\\n  json: {\\n    ...invoice,\\n    reminderLevel,\\n    template,\\n    daysOverdue\\n  }\\n}];"
      },
      "name": "Calculate Reminder",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [650, 300]
    },
    {
      "parameters": {
        "dataPropertyName": "reminderLevel",
        "rules": {
          "rules": [
            {
              "operation": "equals",
              "value": 1,
              "output": 0
            },
            {
              "operation": "equals",
              "value": 2,
              "output": 1
            },
            {
              "operation": "equals",
              "value": 3,
              "output": 2
            }
          ]
        }
      },
      "name": "Reminder Router",
      "type": "n8n-nodes-base.switch",
      "typeVersion": 1,
      "position": [850, 300]
    },
    {
      "parameters": {
        "fromEmail": "finance@company.nl",
        "toEmail": "={{$json.contact.email}}",
        "subject": "Vriendelijke herinnering - Factuur {{$json.invoice_id}}",
        "emailType": "html",
        "htmlBody": "<p>Beste {{$json.contact.firstname}},</p><p>We willen u vriendelijk herinneren aan factuur {{$json.invoice_id}} van €{{$json.total_price_incl_tax}}.</p><p>Deze factuur is {{$json.daysOverdue}} dagen verlopen. Zou u zo vriendelijk willen zijn deze te voldoen?</p><p>Met vriendelijke groet,<br>{{$env.COMPANY_NAME}}</p>",
        "attachments": {
          "binaryPropertyName": "invoice_pdf"
        }
      },
      "name": "First Reminder",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 1,
      "position": [1050, 200]
    },
    {
      "parameters": {
        "resource": "invoice",
        "operation": "update",
        "invoiceId": "={{$json.id}}",
        "updateFields": {
          "custom_fields": {
            "last_reminder_sent": "={{$now}}",
            "reminder_count": "={{($json.custom_fields?.reminder_count || 0) + 1}}"
          }
        }
      },
      "name": "Update Reminder Status",
      "type": "n8n-nodes-custom.moneybird",
      "typeVersion": 1,
      "position": [1250, 300]
    }
  ]
}
\`\`\`

## Best Practices voor Nederlandse Tool Integraties

### 1. Data Privacy & GDPR Compliance
- Implementeer data retention policies
- Log alleen noodzakelijke informatie
- Encrypt sensitive data in transit en at rest
- Implementeer right to deletion workflows

### 2. Webhook Security Checklist
- [ ] Valideer HMAC signatures voor elke webhook
- [ ] Implementeer IP whitelisting waar mogelijk
- [ ] Add rate limiting op webhook endpoints
- [ ] Log alle webhook attempts voor audit trails
- [ ] Implementeer replay attack protection

### 3. Error Handling Strategie
- Gebruik circuit breakers voor externe APIs
- Implementeer exponential backoff voor retries
- Log errors met voldoende context
- Stuur alerts alleen voor actionable errors

### 4. Performance Optimalisatie
- Batch API calls waar mogelijk
- Cache frequently accessed data
- Gebruik async processing voor heavy operations
- Monitor API rate limits proactief

### 5. Testing & Monitoring
- Test met production-like data volumes
- Implementeer end-to-end monitoring
- Set up alerts voor critical failures
- Regular audit van API permissions

## Conclusie

Deze les heeft je de tools en kennis gegeven om robuuste integraties te bouwen met Nederlandse business tools. Door de combinatie van secure webhooks, intelligent error handling, en production-ready workflows ben je klaar om complexe automatiseringen te implementeren die echte business value leveren.

Remember: start met een MVP, test thoroughly, en bouw incrementeel uit naar een complete oplossing.
  `,
  codeExamples: [
    {
      id: 'example-4-1-1',
      title: 'Complete Moneybird API Client',
      language: 'javascript',
      code: `// Production-ready Moneybird API Client
class MoneybirdAPIClient {
  constructor(config) {
    this.config = config;
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    this.rateLimiter = new RateLimiter();
    this.circuitBreaker = new CircuitBreaker();
  }
  
  async request(endpoint, options = {}) {
    return this.circuitBreaker.execute(async () => {
      await this.ensureAuthenticated();
      await this.rateLimiter.checkLimit();
      
      const url = \`\${this.config.baseURL}\${endpoint}\`;
      const headers = {
        'Authorization': \`Bearer \${this.accessToken}\`,
        'Content-Type': 'application/json',
        ...options.headers
      };
      
      try {
        const response = await fetch(url, {
          ...options,
          headers
        });
        
        if (response.status === 401) {
          await this.refreshAccessToken();
          return this.request(endpoint, options);
        }
        
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After') || 60;
          await this.delay(retryAfter * 1000);
          return this.request(endpoint, options);
        }
        
        if (!response.ok) {
          throw new APIError(response.status, await response.text());
        }
        
        return response.json();
      } catch (error) {
        console.error('Moneybird API Error:', error);
        throw error;
      }
    });
  }
  
  async ensureAuthenticated() {
    if (!this.accessToken || Date.now() >= this.tokenExpiry) {
      await this.refreshAccessToken();
    }
  }
  
  async refreshAccessToken() {
    const response = await fetch('https://moneybird.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
        client_id: this.config.auth.clientId,
        client_secret: this.config.auth.clientSecret
      })
    });
    
    if (!response.ok) {
      throw new Error('Token refresh failed');
    }
    
    const data = await response.json();
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000);
  }
  
  // API Methods
  async getInvoices(administrationId, filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(\`/\${administrationId}/sales_invoices?\${params}\`);
  }
  
  async createInvoice(administrationId, invoiceData) {
    return this.request(\`/\${administrationId}/sales_invoices\`, {
      method: 'POST',
      body: JSON.stringify({ sales_invoice: invoiceData })
    });
  }
  
  async sendInvoice(administrationId, invoiceId, options = {}) {
    return this.request(\`/\${administrationId}/sales_invoices/\${invoiceId}/send_invoice\`, {
      method: 'PATCH',
      body: JSON.stringify({ sales_invoice_sending: options })
    });
  }
  
  async getContacts(administrationId, filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(\`/\${administrationId}/contacts?\${params}\`);
  }
  
  async createWebhook(administrationId, webhookData) {
    return this.request(\`/\${administrationId}/webhooks\`, {
      method: 'POST',
      body: JSON.stringify({ webhook: webhookData })
    });
  }
}`
    },
    {
      id: 'example-4-1-2',
      title: 'Mollie Webhook Security Implementation',
      language: 'javascript',
      code: `// Secure Mollie Webhook Handler with all security measures
class MollieWebhookHandler {
  constructor(config) {
    this.config = config;
    this.processedPayments = new Set();
    this.rateLimiter = new Map();
  }
  
  async handleWebhook(request, response) {
    try {
      // 1. Validate request method
      if (request.method !== 'POST') {
        return response.status(405).send('Method Not Allowed');
      }
      
      // 2. Validate Content-Type
      if (!request.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
        return response.status(400).send('Invalid Content-Type');
      }
      
      // 3. Rate limiting
      if (!this.checkRateLimit(request.ip)) {
        return response.status(429).send('Too Many Requests');
      }
      
      // 4. Parse and validate payload
      const paymentId = request.body.id;
      if (!paymentId || !paymentId.startsWith('tr_')) {
        return response.status(400).send('Invalid payment ID');
      }
      
      // 5. Prevent replay attacks
      if (this.processedPayments.has(paymentId)) {
        console.log(\`Duplicate webhook for payment \${paymentId}\`);
        return response.status(200).send('OK');
      }
      
      // 6. Fetch payment from Mollie API
      const payment = await this.fetchPayment(paymentId);
      
      // 7. Validate webhook URL matches
      if (payment.webhookUrl !== this.config.webhookUrl) {
        console.error('Webhook URL mismatch');
        return response.status(403).send('Forbidden');
      }
      
      // 8. Process payment based on status
      await this.processPayment(payment);
      
      // 9. Mark as processed
      this.processedPayments.add(paymentId);
      
      // 10. Clean old entries (prevent memory leak)
      if (this.processedPayments.size > 10000) {
        const oldestEntries = Array.from(this.processedPayments).slice(0, 5000);
        oldestEntries.forEach(id => this.processedPayments.delete(id));
      }
      
      return response.status(200).send('OK');
      
    } catch (error) {
      console.error('Webhook processing error:', error);
      
      // Don't expose internal errors
      return response.status(500).send('Internal Server Error');
    }
  }
  
  checkRateLimit(ip, limit = 100, window = 60000) {
    const now = Date.now();
    const userLimits = this.rateLimiter.get(ip) || { count: 0, resetAt: now + window };
    
    if (now > userLimits.resetAt) {
      userLimits.count = 0;
      userLimits.resetAt = now + window;
    }
    
    if (userLimits.count >= limit) {
      return false;
    }
    
    userLimits.count++;
    this.rateLimiter.set(ip, userLimits);
    
    // Cleanup old entries
    if (this.rateLimiter.size > 1000) {
      const cutoff = now - window;
      for (const [key, value] of this.rateLimiter.entries()) {
        if (value.resetAt < cutoff) {
          this.rateLimiter.delete(key);
        }
      }
    }
    
    return true;
  }
  
  async fetchPayment(paymentId) {
    const response = await fetch(\`https://api.mollie.com/v2/payments/\${paymentId}\`, {
      headers: {
        'Authorization': \`Bearer \${this.config.apiKey}\`
      }
    });
    
    if (!response.ok) {
      throw new Error(\`Failed to fetch payment: \${response.statusText}\`);
    }
    
    return response.json();
  }
  
  async processPayment(payment) {
    const handlers = {
      'paid': this.handlePaidPayment.bind(this),
      'failed': this.handleFailedPayment.bind(this),
      'canceled': this.handleCanceledPayment.bind(this),
      'expired': this.handleExpiredPayment.bind(this),
      'refunded': this.handleRefundedPayment.bind(this),
      'chargeback': this.handleChargebackPayment.bind(this)
    };
    
    const handler = handlers[payment.status];
    if (handler) {
      await handler(payment);
    } else {
      console.log(\`Unhandled payment status: \${payment.status}\`);
    }
  }
  
  async handlePaidPayment(payment) {
    const orderId = payment.metadata?.orderId;
    if (!orderId) {
      console.error('No orderId in payment metadata');
      return;
    }
    
    // Update order status
    await this.updateOrderStatus(orderId, 'paid', {
      paymentId: payment.id,
      paidAt: payment.paidAt,
      amount: payment.amount.value,
      method: payment.method
    });
    
    // Create invoice
    await this.createInvoice(orderId, payment);
    
    // Send confirmation
    await this.sendConfirmationEmail(orderId, payment);
    
    // Trigger fulfillment
    await this.triggerFulfillment(orderId);
  }
  
  async handleFailedPayment(payment) {
    const orderId = payment.metadata?.orderId;
    
    await this.updateOrderStatus(orderId, 'payment_failed', {
      paymentId: payment.id,
      failedAt: new Date().toISOString(),
      reason: payment.details?.failureReason
    });
    
    // Notify customer
    await this.sendPaymentFailedEmail(orderId, payment);
    
    // Alert support team
    await this.notifySupport('payment_failed', payment);
  }
}`
    },
    {
      id: 'example-4-1-3',
      title: 'Exact Online Sync Engine',
      language: 'javascript',
      code: `// Advanced Exact Online Synchronization Engine
class ExactOnlineSyncEngine {
  constructor(exactClient, targetSystems) {
    this.exact = exactClient;
    this.targets = targetSystems;
    this.syncState = new Map();
    this.conflictResolver = new ConflictResolver();
  }
  
  async performFullSync() {
    const syncReport = {
      startTime: new Date(),
      entities: {},
      errors: [],
      conflicts: []
    };
    
    try {
      // 1. Sync Accounts/Contacts
      syncReport.entities.accounts = await this.syncEntity('accounts', {
        exactEndpoint: '/crm/Accounts',
        transform: this.transformAccount.bind(this),
        identifierField: 'Email'
      });
      
      // 2. Sync Products/Items
      syncReport.entities.items = await this.syncEntity('items', {
        exactEndpoint: '/logistics/Items',
        transform: this.transformItem.bind(this),
        identifierField: 'Code'
      });
      
      // 3. Sync Invoices
      syncReport.entities.invoices = await this.syncEntity('invoices', {
        exactEndpoint: '/salesinvoice/SalesInvoices',
        transform: this.transformInvoice.bind(this),
        identifierField: 'InvoiceNumber',
        dependencies: ['accounts', 'items']
      });
      
      // 4. Sync Projects
      syncReport.entities.projects = await this.syncEntity('projects', {
        exactEndpoint: '/project/Projects',
        transform: this.transformProject.bind(this),
        identifierField: 'Code'
      });
      
      syncReport.endTime = new Date();
      syncReport.duration = syncReport.endTime - syncReport.startTime;
      
      // 5. Handle conflicts
      if (syncReport.conflicts.length > 0) {
        await this.resolveConflicts(syncReport.conflicts);
      }
      
      // 6. Send sync report
      await this.sendSyncReport(syncReport);
      
      return syncReport;
      
    } catch (error) {
      syncReport.errors.push({
        type: 'fatal',
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
  
  async syncEntity(entityType, config) {
    const result = {
      fetched: 0,
      created: 0,
      updated: 0,
      errors: 0
    };
    
    try {
      // Fetch all records from Exact
      const exactRecords = await this.fetchAllPages(config.exactEndpoint);
      result.fetched = exactRecords.length;
      
      // Process in batches
      const batchSize = 50;
      for (let i = 0; i < exactRecords.length; i += batchSize) {
        const batch = exactRecords.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (record) => {
          try {
            // Transform record
            const transformed = await config.transform(record);
            
            // Check if exists in target
            const existing = await this.findInTarget(
              entityType,
              config.identifierField,
              record[config.identifierField]
            );
            
            if (existing) {
              // Check for conflicts
              const hasConflict = this.detectConflict(existing, transformed);
              if (hasConflict) {
                const resolved = await this.conflictResolver.resolve(
                  existing,
                  transformed,
                  entityType
                );
                await this.updateInTarget(entityType, resolved);
                result.updated++;
              } else if (this.hasChanges(existing, transformed)) {
                await this.updateInTarget(entityType, transformed);
                result.updated++;
              }
            } else {
              // Create new record
              await this.createInTarget(entityType, transformed);
              result.created++;
            }
            
          } catch (error) {
            console.error(\`Error syncing \${entityType} record:\`, error);
            result.errors++;
          }
        }));
      }
      
      return result;
      
    } catch (error) {
      console.error(\`Failed to sync \${entityType}:\`, error);
      throw error;
    }
  }
  
  async fetchAllPages(endpoint, pageSize = 100) {
    const allRecords = [];
    let skip = 0;
    let hasMore = true;
    
    while (hasMore) {
      const response = await this.exact.makeRequest(
        \`\${endpoint}?\\$top=\${pageSize}&\\$skip=\${skip}\`
      );
      
      if (response.d && response.d.results) {
        allRecords.push(...response.d.results);
        hasMore = response.d.results.length === pageSize;
        skip += pageSize;
      } else {
        hasMore = false;
      }
      
      // Rate limiting
      await this.delay(100);
    }
    
    return allRecords;
  }
  
  transformAccount(exactAccount) {
    return {
      name: exactAccount.Name,
      email: exactAccount.Email,
      phone: exactAccount.Phone,
      address: {
        street: exactAccount.AddressLine1,
        city: exactAccount.City,
        postalCode: exactAccount.Postcode,
        country: exactAccount.Country
      },
      taxNumber: exactAccount.VATNumber,
      chamberOfCommerce: exactAccount.ChamberOfCommerce,
      exactId: exactAccount.ID,
      modified: exactAccount.Modified
    };
  }
  
  transformInvoice(exactInvoice) {
    return {
      invoiceNumber: exactInvoice.InvoiceNumber,
      invoiceDate: exactInvoice.InvoiceDate,
      dueDate: exactInvoice.DueDate,
      customer: {
        exactId: exactInvoice.OrderedBy,
        name: exactInvoice.OrderedByName
      },
      lines: exactInvoice.SalesInvoiceLines.map(line => ({
        description: line.Description,
        quantity: line.Quantity,
        unitPrice: line.UnitPrice,
        amount: line.AmountFC,
        vatCode: line.VATCode
      })),
      totalAmount: exactInvoice.AmountFC,
      status: this.mapInvoiceStatus(exactInvoice.Status),
      exactId: exactInvoice.ID
    };
  }
  
  detectConflict(existing, incoming) {
    // Smart conflict detection
    const existingModified = new Date(existing.modified);
    const incomingModified = new Date(incoming.modified);
    
    // If both were modified after last sync
    const lastSync = this.syncState.get('lastSyncTime') || new Date(0);
    
    return existingModified > lastSync && incomingModified > lastSync;
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}`
    }
  ],
  assignments: [
    {
      id: 'assignment-4-1-1',
      title: 'Build Complete Moneybird Integration',
      description: 'Bouw een complete Moneybird integratie met OAuth2 authenticatie, webhook handling, en automatische factuur synchronisatie. Implementeer proper error handling en rate limiting.',
      difficulty: 'hard',
      type: 'project',
      initialCode: `// Moneybird Integration Project
// Requirements:
// 1. OAuth2 authentication flow
// 2. Webhook signature validation
// 3. Automatic invoice creation from orders
// 4. Bi-directional contact sync
// 5. Payment status updates

class MoneybirdIntegration {
  constructor(config) {
    // TODO: Initialize OAuth2 client
    // TODO: Setup webhook handler
    // TODO: Configure rate limiting
  }
  
  async authenticate() {
    // TODO: Implement OAuth2 flow
    // 1. Generate authorization URL
    // 2. Handle callback
    // 3. Exchange code for tokens
    // 4. Store tokens securely
  }
  
  async handleWebhook(request) {
    // TODO: Implement webhook handling
    // 1. Validate signature
    // 2. Parse event type
    // 3. Route to appropriate handler
    // 4. Update local database
  }
  
  async syncContacts() {
    // TODO: Implement contact synchronization
    // 1. Fetch contacts from Moneybird
    // 2. Compare with local database
    // 3. Handle creates/updates/deletes
    // 4. Log sync results
  }
  
  async createInvoiceFromOrder(order) {
    // TODO: Create invoice in Moneybird
    // 1. Map order data to invoice format
    // 2. Create or find contact
    // 3. Add invoice lines
    // 4. Handle taxes correctly
    // 5. Send invoice if requested
  }
}`,
      hints: [
        'Use refresh tokens to maintain authentication',
        'Implement exponential backoff for rate limits',
        'Always validate webhook signatures',
        'Handle partial sync failures gracefully'
      ]
    },
    {
      id: 'assignment-4-1-2',
      title: 'Mollie Payment Workflow',
      description: 'Ontwikkel een complete payment workflow met Mollie inclusief webhook handling, payment status updates, en automatische refund processing.',
      difficulty: 'hard',
      type: 'project',
      initialCode: `// Mollie Payment Workflow
// Requirements:
// 1. Create payments with metadata
// 2. Handle all payment statuses
// 3. Implement refund logic
// 4. Webhook security
// 5. Recurring payments support

class MolliePaymentWorkflow {
  constructor(apiKey) {
    this.apiKey = apiKey;
    // TODO: Initialize components
  }
  
  async createPayment(order) {
    // TODO: Create Mollie payment
    // 1. Validate order data
    // 2. Calculate amount including taxes
    // 3. Set correct redirect URLs
    // 4. Add order metadata
    // 5. Handle payment methods
  }
  
  async processWebhook(paymentId) {
    // TODO: Process payment webhook
    // 1. Fetch payment status
    // 2. Validate webhook authenticity
    // 3. Update order status
    // 4. Trigger side effects (invoice, email, etc)
    // 5. Handle edge cases
  }
  
  async createRefund(paymentId, amount) {
    // TODO: Implement refund logic
    // 1. Validate refund possibility
    // 2. Calculate refund amount
    // 3. Create refund in Mollie
    // 4. Update accounting
    // 5. Notify customer
  }
  
  async setupRecurringPayment(customer, plan) {
    // TODO: Setup subscription
    // 1. Create customer in Mollie
    // 2. Setup mandate
    // 3. Create subscription
    // 4. Handle trial periods
    // 5. Implement cancellation
  }
}`,
      hints: [
        'Always store payment IDs for reconciliation',
        'Implement idempotency for webhook processing',
        'Handle currency conversion if needed',
        'Test with Mollie test mode first'
      ]
    }
  ],
  resources: [
    {
      title: 'Moneybird API Documentation',
      url: 'https://developer.moneybird.com/',
      type: 'docs'
    },
    {
      title: 'Exact Online API Reference',
      url: 'https://start.exactonline.nl/docs/HlpRestAPIResources.aspx',
      type: 'docs'
    },
    {
      title: 'Mollie API Documentation',
      url: 'https://docs.mollie.com/',
      type: 'docs'
    },
    {
      title: 'N8N Custom Nodes Development',
      url: 'https://docs.n8n.io/integrations/creating-nodes/',
      type: 'tutorial'
    }
  ]
};