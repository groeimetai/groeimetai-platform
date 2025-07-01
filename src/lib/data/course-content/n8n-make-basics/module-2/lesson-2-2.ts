import type { Lesson } from '@/lib/data/courses';

export const lesson2_2: Lesson = {
  id: 'lesson-2-2',
  title: 'OAuth en API key authenticatie',
  duration: '30 min',
  content: `
# OAuth en API key authenticatie

## Authenticatie in Automation Tools

Voordat je apps kunt verbinden, moet je ze toegang geven tot elkaars data. Dit gebeurt via authenticatie - het proces waarbij je bewijst dat je bent wie je zegt dat je bent, en toestemming geeft om data uit te wisselen.

## API Keys: De Basis

### Wat is een API Key?
Een API key is als een digitale sleutel voor je applicatie:
- **Unieke identifier**: Elke key is uniek voor jouw account
- **Direct toegang**: Geen extra stappen nodig na configuratie
- **Permanent**: Blijft geldig tot je hem intrekt

### API Key Workflow
\`\`\`mermaid
graph LR
    A[Jouw App] -->|API Key in header| B[API Service]
    B -->|Verificatie OK| C[Data Response]
    B -->|Verificatie Fout| D[401 Unauthorized]
\`\`\`

### Implementatie in N8N
\`\`\`json
{
  "credentials": {
    "apiKey": {
      "name": "My API Credentials",
      "type": "apiKey",
      "data": {
        "apiKey": "sk_live_XXXXXXXXXXXXXXXXXXXXXX"
      }
    }
  }
}
\`\`\`

### Implementatie in Make
In Make gebruik je de HTTP module met custom headers:
\`\`\`
Headers:
- Authorization: Bearer YOUR_API_KEY
- Content-Type: application/json
\`\`\`

## OAuth 2.0: De Gouden Standaard

### Waarom OAuth?
OAuth lost het probleem op van wachtwoorden delen:
- **Geen wachtwoord delen**: Je deelt nooit je wachtwoord
- **Beperkte toegang**: Je bepaalt exact welke permissies
- **Intrekbaar**: Je kunt toegang altijd intrekken
- **Tijdelijk**: Access tokens verlopen automatisch

### OAuth Flow Uitgelegd
\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant A as Jouw App
    participant O as OAuth Provider
    participant R as Resource Server
    
    U->>A: Start automation
    A->>O: Request authorization
    O->>U: Login + Approve permissions
    U->>O: Approve
    O->>A: Authorization code
    A->>O: Exchange code for token
    O->>A: Access token + Refresh token
    A->>R: Request data with token
    R->>A: Protected data
\`\`\`

### OAuth Implementatie Stappen

#### 1. App Registratie
Voordat je OAuth kunt gebruiken, moet je je app registreren:

**Google Cloud Console voorbeeld:**
1. Ga naar console.cloud.google.com
2. Maak een nieuw project
3. Enable relevante APIs (Gmail, Sheets, etc.)
4. Maak OAuth 2.0 credentials
5. Stel redirect URIs in

**Redirect URIs voor populaire tools:**
- N8N: \`https://your-n8n-url.com/rest/oauth2-credential/callback\`
- Make: \`https://www.integromat.com/oauth/cb/oauth2\`

#### 2. Scopes Configureren
Scopes bepalen welke permissies je app krijgt:

\`\`\`javascript
// Minimale Gmail scopes
const minimalScopes = [
  'https://www.googleapis.com/auth/gmail.readonly'
];

// Uitgebreide Gmail scopes
const fullScopes = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.labels'
];
\`\`\`

### Token Management

#### Access Tokens
- **Levensduur**: Meestal 1 uur
- **Usage**: Voor API calls
- **Format**: Bearer token

#### Refresh Tokens
- **Levensduur**: Lang (maanden/jaren)
- **Usage**: Om nieuwe access tokens te krijgen
- **Opslag**: Veilig bewaren!

\`\`\`javascript
// Token refresh logic
async function refreshAccessToken(refreshToken) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });
  
  return response.json();
}
\`\`\`

## Security Best Practices

### 1. API Key Beveiliging
- **Nooit in code**: Gebruik environment variables
- **Restrictie**: Beperk key tot specifieke IPs/domains
- **Rotatie**: Vernieuw keys regelmatig
- **Monitoring**: Track usage voor anomalieën

\`\`\`javascript
// GOED: Environment variable
const apiKey = process.env.API_KEY;

// FOUT: Hardcoded
const apiKey = 'sk_live_XXXXXXXXXXXXXXXXXXXXXX';
\`\`\`

### 2. OAuth Security
- **HTTPS only**: Gebruik altijd encrypted connections
- **State parameter**: Voorkom CSRF attacks
- **PKCE**: Voor public clients (mobile/SPA)
- **Scope minimalisatie**: Vraag alleen wat je nodig hebt

### 3. Token Opslag
\`\`\`javascript
// N8N: Automatisch veilig opgeslagen
// Make: Automatisch encrypted

// Custom implementatie:
const crypto = require('crypto');

function encryptToken(token, secret) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', secret, iv);
  
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: cipher.getAuthTag().toString('hex')
  };
}
\`\`\`

## Common Authentication Patterns

### 1. Service Accounts
Voor server-to-server communicatie zonder user interaction:

\`\`\`javascript
// Google Service Account
const {google} = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: './service-account-key.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({version: 'v4', auth});
\`\`\`

### 2. JWT Bearer Tokens
Voor moderne APIs zoals Zoom, Box:

\`\`\`javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  {
    iss: API_KEY,
    exp: Math.floor(Date.now() / 1000) + 60
  },
  API_SECRET,
  { algorithm: 'HS256' }
);
\`\`\`

### 3. Webhook Signatures
Voor het verifiëren van incoming webhooks:

\`\`\`javascript
function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
\`\`\`

## Troubleshooting Guide

### Veelvoorkomende Fouten

1. **401 Unauthorized**
   - Check: Is de API key/token geldig?
   - Check: Zijn de scopes correct?
   - Check: Is de token expired?

2. **403 Forbidden**
   - Check: Heeft de user de juiste permissies?
   - Check: Is de API enabled voor dit project?
   - Check: Rate limiting?

3. **Invalid Grant**
   - Check: Is de refresh token nog geldig?
   - Check: Is de redirect URI exact hetzelfde?
   - Check: Time sync tussen servers?

### Debug Workflow
\`\`\`bash
# Test API key
curl -H "Authorization: Bearer YOUR_API_KEY" https://api.example.com/test

# Test OAuth token
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" https://api.example.com/user

# Decode JWT token (for debugging)
echo "YOUR_JWT_TOKEN" | cut -d. -f2 | base64 -d | jq
\`\`\`

## Platform-Specifieke Tips

### N8N
- Gebruik built-in OAuth2 credentials waar mogelijk
- Credentials worden centraal beheerd
- Automatische token refresh
- Test credentials direct in de UI

### Make/Integromat
- Connections worden account-wide gedeeld
- Gebruik de connection wizard
- Let op rate limits per connection
- Maak separate connections voor test/productie
  `,
  codeExamples: [
    {
      id: 'oauth2-implementation',
      title: 'Complete OAuth2 Implementation',
      language: 'javascript',
      code: `// OAuth2 Helper Class
class OAuth2Client {
  constructor(config) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri;
    this.authUrl = config.authUrl;
    this.tokenUrl = config.tokenUrl;
    this.scopes = config.scopes;
  }
  
  // Generate authorization URL
  getAuthUrl(state) {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: this.scopes.join(' '),
      state: state,
      access_type: 'offline',
      prompt: 'consent'
    });
    
    return \`\${this.authUrl}?\${params}\`;
  }
  
  // Exchange code for tokens
  async getTokens(code) {
    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code'
      })
    });
    
    if (!response.ok) {
      throw new Error(\`Token exchange failed: \${response.statusText}\`);
    }
    
    return response.json();
  }
  
  // Refresh access token
  async refreshToken(refreshToken) {
    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token'
      })
    });
    
    if (!response.ok) {
      throw new Error(\`Token refresh failed: \${response.statusText}\`);
    }
    
    return response.json();
  }
  
  // Make authenticated request
  async makeRequest(url, accessToken, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': \`Bearer \${accessToken}\`
      }
    });
    
    if (response.status === 401) {
      throw new Error('Token expired or invalid');
    }
    
    return response;
  }
}

// Usage example
const googleOAuth = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: 'http://localhost:3000/callback',
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  scopes: ['https://www.googleapis.com/auth/gmail.readonly']
});`
    },
    {
      id: 'api-key-manager',
      title: 'API Key Manager with Rate Limiting',
      language: 'javascript',
      code: `// API Key Manager with built-in rate limiting and retry logic
class APIKeyManager {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.baseUrl = options.baseUrl;
    this.rateLimitPerMinute = options.rateLimitPerMinute || 60;
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000;
    
    // Track requests for rate limiting
    this.requests = [];
  }
  
  // Check if we're within rate limit
  async checkRateLimit() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Remove old requests
    this.requests = this.requests.filter(time => time > oneMinuteAgo);
    
    if (this.requests.length >= this.rateLimitPerMinute) {
      const oldestRequest = this.requests[0];
      const waitTime = 60000 - (now - oldestRequest);
      
      console.log(\`Rate limit reached. Waiting \${waitTime}ms...\`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requests.push(now);
  }
  
  // Make authenticated request with retry logic
  async request(endpoint, options = {}) {
    await this.checkRateLimit();
    
    const url = \`\${this.baseUrl}\${endpoint}\`;
    let lastError;
    
    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': \`Bearer \${this.apiKey}\`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.status === 429) {
          // Rate limited by server
          const retryAfter = response.headers.get('Retry-After') || 60;
          console.log(\`Server rate limit. Waiting \${retryAfter}s...\`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          continue;
        }
        
        if (!response.ok && attempt < this.retryAttempts - 1) {
          throw new Error(\`Request failed: \${response.statusText}\`);
        }
        
        return response.json();
        
      } catch (error) {
        lastError = error;
        console.log(\`Attempt \${attempt + 1} failed: \${error.message}\`);
        
        if (attempt < this.retryAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempt + 1)));
        }
      }
    }
    
    throw lastError;
  }
}

// Usage
const apiManager = new APIKeyManager(process.env.API_KEY, {
  baseUrl: 'https://api.example.com',
  rateLimitPerMinute: 30,
  retryAttempts: 3
});

// Make requests with automatic rate limiting and retry
const data = await apiManager.request('/users');`
    }
  ],
  assignments: [
    {
      id: 'auth-setup-1',
      title: 'Setup OAuth voor Google Services',
      description: 'Configureer OAuth2 authenticatie voor Gmail en Google Sheets. Test de connection en maak een simpele automation die emails leest.',
      difficulty: 'medium',
      type: 'project'
    },
    {
      id: 'auth-setup-2',
      title: 'API Key Security Audit',
      description: 'Controleer je bestaande automations op hardcoded API keys. Verplaats alle keys naar environment variables of credential stores.',
      difficulty: 'easy',
      type: 'project'
    }
  ],
  resources: [
    {
      title: 'OAuth 2.0 Playground',
      url: 'https://developers.google.com/oauthplayground/',
      type: 'tool'
    },
    {
      title: 'N8N Credentials Documentation',
      url: 'https://docs.n8n.io/credentials/',
      type: 'docs'
    },
    {
      title: 'Make/Integromat Connections Guide',
      url: 'https://www.make.com/en/help/connections',
      type: 'guide'
    },
    {
      title: 'JWT.io - JWT Debugger',
      url: 'https://jwt.io/',
      type: 'tool'
    }
  ]
};