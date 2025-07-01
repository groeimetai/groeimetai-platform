import type { Lesson } from '@/lib/data/courses';

export const lesson2_1: Lesson = {
  id: 'lesson-2-1',
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
Voor moderne APIs die JWT gebruiken:

\`\`\`javascript
const jwt = require('jsonwebtoken');

// Generate JWT
const token = jwt.sign(
  { sub: userId, iat: Math.floor(Date.now() / 1000) },
  privateKey,
  { expiresIn: '1h', algorithm: 'RS256' }
);

// Use in request
const response = await fetch(apiUrl, {
  headers: { 'Authorization': \`Bearer \${token}\` }
});
\`\`\`

## Troubleshooting Guide

### Common Errors
1. **401 Unauthorized**: Check je credentials
2. **403 Forbidden**: Check je scopes/permissions
3. **Invalid redirect_uri**: Exact match vereist
4. **Token expired**: Implement auto-refresh

### Debug Checklist
- [ ] Zijn alle redirect URIs correct?
- [ ] Heb je de juiste scopes?
- [ ] Is je client secret veilig opgeslagen?
- [ ] Werkt token refresh correct?
`,
  codeExamples: [
    {
      id: 'example-2-1-1',
      title: 'Complete OAuth implementatie in N8N',
      language: 'javascript',
      code: `// N8N Function node voor OAuth token management
const oauthConfig = {
  client_id: \$env.GOOGLE_CLIENT_ID,
  client_secret: \$env.GOOGLE_CLIENT_SECRET,
  redirect_uri: 'https://n8n.yourdomain.com/rest/oauth2-credential/callback',
  scope: 'https://www.googleapis.com/auth/gmail.readonly'
};

// Check if token needs refresh
const tokenExpiry = new Date(items[0].json.token_expiry);
const now = new Date();

if (now >= tokenExpiry) {
  // Refresh the token
  const refreshResponse = await this.helpers.httpRequest({
    method: 'POST',
    url: 'https://oauth2.googleapis.com/token',
    body: {
      client_id: oauthConfig.client_id,
      client_secret: oauthConfig.client_secret,
      refresh_token: items[0].json.refresh_token,
      grant_type: 'refresh_token'
    }
  });
  
  // Update token info
  items[0].json.access_token = refreshResponse.access_token;
  items[0].json.token_expiry = new Date(Date.now() + refreshResponse.expires_in * 1000);
}

return items;`
    }
  ],
  assignments: [
    {
      id: 'assignment-2-1-1',
      title: 'OAuth Setup Challenge',
      description: 'Configureer OAuth 2.0 authenticatie voor Google Sheets in N8N of Make. Maak een workflow die data uit een Google Sheet leest.',
      difficulty: 'medium',
      type: 'project',
      initialCode: `// Stappen:
// 1. Registreer app in Google Cloud Console
// 2. Enable Google Sheets API
// 3. Maak OAuth 2.0 credentials
// 4. Configureer in N8N/Make
// 5. Test met een simpele read operatie`,
      hints: [
        'Vergeet niet om de Google Sheets API te enablen',
        'De redirect URI moet exact matchen',
        'Start met read-only scope voor testing'
      ]
    },
    {
      id: 'assignment-2-1-2',
      title: 'API Key Security Audit',
      description: 'Maak een security audit tool die checkt of API keys veilig zijn opgeslagen in je workflows.',
      difficulty: 'hard',
      type: 'project',
      initialCode: `// Controleer voor:
// - Hardcoded API keys
// - Keys in plain text
// - Keys zonder restrictions
// - Expired tokens`,
      hints: [
        'Gebruik regex om patterns te detecteren',
        'Check environment variable usage',
        'Implementeer een scoring systeem'
      ]
    }
  ],
  resources: [
    {
      title: 'OAuth 2.0 Simplified',
      url: 'https://oauth.net/2/',
      type: 'documentation'
    },
    {
      title: 'N8N OAuth2 Setup Guide',
      url: 'https://docs.n8n.io/credentials/oauth2/',
      type: 'guide'
    },
    {
      title: 'Google OAuth 2.0 Playground',
      url: 'https://developers.google.com/oauthplayground/',
      type: 'tool'
    }
  ]
}