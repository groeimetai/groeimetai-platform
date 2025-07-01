import { Lesson } from '@/lib/data/courses'

export const lesson2_2: Lesson = {
  id: 'oauth-in-practice',
  title: 'OAuth 2.0 in de praktijk',
  duration: '40 min',
  content: `
# OAuth 2.0 in de praktijk

## Introductie

OAuth 2.0 is de industriestandaard voor autorisatie en wordt gebruikt door vrijwel alle moderne API's. In deze les leer je niet alleen hoe OAuth werkt, maar vooral hoe je het implementeert in je automations en integraties.

## Wat is OAuth 2.0?

OAuth 2.0 is een **autorisatieprotocol** (niet authenticatie!) dat gebruikers toestaat om applicaties beperkte toegang te geven tot hun resources zonder hun wachtwoord te delen.

### OAuth vs traditionele authenticatie

**Traditionele methode (gevaarlijk):**
\`\`\`
Gebruiker → Geeft username/password → Third-party app → Onbeperkte toegang
\`\`\`

**OAuth 2.0 (veilig):**
\`\`\`
Gebruiker → Authorizeert bij provider → Third-party app → Beperkte toegang via token
\`\`\`

### De vier belangrijkste rollen in OAuth

1. **Resource Owner**: De gebruiker die toegang verleent
2. **Client**: De applicatie die toegang vraagt
3. **Authorization Server**: Server die tokens uitgeeft (bijv. Google Auth)
4. **Resource Server**: Server met de beveiligde resources (bijv. Google Drive API)

## OAuth 2.0 Flow Explained

### De complete OAuth dans in 5 stappen:

\`\`\`
┌─────────────┐                               ┌──────────────┐
│   Browser   │                               │ Your App     │
│  (User)     │                               │ (Client)     │
└──────┬──────┘                               └──────┬───────┘
       │                                             │
       │  1. "Ik wil inloggen met Google"           │
       │─────────────────────────────────────────────>
       │                                             │
       │  2. Redirect naar Google OAuth              │
       │<─────────────────────────────────────────────
       │                                             │
       │    ┌─────────────────────────────────┐     │
       │    │  3. Login bij Google             │     │
       │    │     + Geef toestemming           │     │
       │    └─────────────────────────────────┘     │
       │                                             │
       │  4. Redirect terug met auth code            │
       │─────────────────────────────────────────────>
       │                                             │
       │                      5. Wissel code voor token
       │                      ──────────────────────────>
       │                                             │ Google
       │                      <──────────────────────────
       │                        Access token         │
       │                                             │
       │  "Je bent ingelogd!"                        │
       │<─────────────────────────────────────────────
\`\`\`

## OAuth Grant Types

OAuth 2.0 kent verschillende "grant types" voor verschillende use cases:

### 1. Authorization Code (meest gebruikt)

Voor web en mobile apps waar de user aanwezig is:

\`\`\`javascript
// Stap 1: Redirect user naar authorization endpoint
const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
authUrl.searchParams.append('client_id', CLIENT_ID);
authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
authUrl.searchParams.append('response_type', 'code');
authUrl.searchParams.append('scope', 'email profile');
authUrl.searchParams.append('state', generateRandomState());

window.location.href = authUrl.toString();

// Stap 2: Handle de callback
app.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  
  // Verificatie state tegen CSRF
  if (state !== savedState) {
    return res.status(400).send('Invalid state');
  }
  
  // Stap 3: Wissel code voor token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });
  
  const tokens = await tokenResponse.json();
  // Nu heb je access_token en refresh_token!
});
\`\`\`

### 2. Client Credentials (voor server-to-server)

Wanneer er geen user interactie is:

\`\`\`javascript
// Direct token request voor machine-to-machine
const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
  }),
});

const { access_token } = await tokenResponse.json();
\`\`\`

### 3. Refresh Token

Voor het vernieuwen van verlopen tokens:

\`\`\`javascript
const refreshTokens = async (refreshToken) => {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });
  
  return response.json();
};
\`\`\`

### 4. PKCE (Proof Key for Code Exchange)

Extra beveiliging voor mobile en SPA's:

\`\`\`javascript
// Genereer code verifier en challenge
const codeVerifier = generateRandomString(128);
const codeChallenge = await sha256(codeVerifier);

// Voeg toe aan authorization request
authUrl.searchParams.append('code_challenge', codeChallenge);
authUrl.searchParams.append('code_challenge_method', 'S256');

// Bij token exchange
body.append('code_verifier', codeVerifier);
\`\`\`

## OAuth Scopes

Scopes bepalen welke permissies je app krijgt:

\`\`\`javascript
// Google scopes voorbeelden
const scopes = [
  'https://www.googleapis.com/auth/userinfo.email',     // Email adres
  'https://www.googleapis.com/auth/userinfo.profile',   // Profiel info
  'https://www.googleapis.com/auth/drive.readonly',     // Drive lezen
  'https://www.googleapis.com/auth/calendar',           // Calendar full access
];

// GitHub scopes
const githubScopes = [
  'repo',          // Full repo access
  'repo:status',   // Alleen commit status
  'user:email',    // Email addresses
  'read:org',      // Org membership
];

// Best practice: vraag minimale scopes
const minimalScopes = ['openid', 'email']; // Alleen basis info
\`\`\`

## OAuth Security Best Practices

### 1. State Parameter (CSRF Protection)

\`\`\`javascript
// Genereer unieke state voor elke auth request
const generateState = () => {
  const state = crypto.randomBytes(32).toString('hex');
  // Sla op in session
  req.session.oauthState = state;
  return state;
};

// Valideer bij callback
if (req.query.state !== req.session.oauthState) {
  throw new Error('Invalid state - possible CSRF attack');
}
\`\`\`

### 2. Veilige Token Opslag

\`\`\`javascript
// ❌ NIET DOEN: Tokens in localStorage
localStorage.setItem('access_token', token);

// ✅ WEL DOEN: HttpOnly cookies of server-side session
res.cookie('auth_token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 3600000, // 1 hour
});

// Of encrypt en sla op in database
const encryptedToken = encrypt(token, process.env.ENCRYPTION_KEY);
await db.tokens.create({
  user_id: userId,
  encrypted_token: encryptedToken,
  expires_at: new Date(Date.now() + 3600000),
});
\`\`\`

### 3. Token Lifecycle Management

\`\`\`javascript
class TokenManager {
  constructor(db) {
    this.db = db;
  }
  
  async getValidToken(userId) {
    const tokenRecord = await this.db.tokens.findOne({
      where: { user_id: userId }
    });
    
    if (!tokenRecord) {
      throw new Error('No token found');
    }
    
    // Check expiry met buffer
    const expiryBuffer = 5 * 60 * 1000; // 5 minuten
    const expiresAt = new Date(tokenRecord.expires_at);
    const now = new Date();
    
    if (expiresAt - now < expiryBuffer) {
      // Token verloopt bijna, refresh het
      const newTokens = await this.refreshToken(tokenRecord.refresh_token);
      await this.saveTokens(userId, newTokens);
      return newTokens.access_token;
    }
    
    return decrypt(tokenRecord.encrypted_token);
  }
  
  async refreshToken(refreshToken) {
    const response = await fetch('https://oauth.provider.com/token', {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Token refresh failed');
    }
    
    return response.json();
  }
}
\`\`\`

## OAuth implementatie in N8N

### Custom OAuth2 Credentials

\`\`\`javascript
{
  "credentials": [
    {
      "name": "myServiceOAuth2Api",
      "required": true,
      "displayOptions": {
        "show": {
          "authentication": ["oAuth2"]
        }
      }
    }
  ],
  "properties": [
    {
      "displayName": "Authentication",
      "name": "authentication",
      "type": "options",
      "options": [
        {
          "name": "OAuth2",
          "value": "oAuth2"
        },
        {
          "name": "API Key",
          "value": "apiKey"
        }
      ],
      "default": "oAuth2"
    }
  ]
}

// OAuth2 credential configuration
{
  "name": "myServiceOAuth2Api",
  "displayName": "My Service OAuth2 API",
  "documentationUrl": "https://docs.myservice.com/oauth",
  "properties": [
    {
      "displayName": "Grant Type",
      "name": "grantType",
      "type": "hidden",
      "default": "authorizationCode"
    },
    {
      "displayName": "Authorization URL",
      "name": "authUrl",
      "type": "hidden",
      "default": "https://myservice.com/oauth/authorize"
    },
    {
      "displayName": "Access Token URL",
      "name": "accessTokenUrl",
      "type": "hidden",
      "default": "https://myservice.com/oauth/token"
    },
    {
      "displayName": "Scope",
      "name": "scope",
      "type": "hidden",
      "default": "read write"
    },
    {
      "displayName": "Auth URI Query Parameters",
      "name": "authQueryParameters",
      "type": "hidden",
      "default": "response_type=code"
    },
    {
      "displayName": "Authentication",
      "name": "authentication",
      "type": "hidden",
      "default": "body"
    }
  ]
}
\`\`\`

## OAuth in Make.com

### OAuth2 Connection Setup

\`\`\`json
{
  "connection": {
    "name": "oauth2",
    "label": "OAuth 2.0 Connection",
    "type": "oauth2",
    "version": 1,
    "baseUrl": "https://api.myservice.com",
    "testUrl": "/me",
    "clientId": "{{clientId}}",
    "clientSecret": "{{clientSecret}}",
    "authorizationUrl": "https://myservice.com/oauth/authorize",
    "tokenUrl": "https://myservice.com/oauth/token",
    "scope": ["read", "write"],
    "scopeDelimiter": " ",
    "authorizationQueryParameters": {
      "access_type": "offline",
      "prompt": "consent"
    },
    "tokenQueryParameters": {},
    "refreshTokenQueryParameters": {},
    "customHeaders": {},
    "authType": "bearer",
    "tokenPlacement": "header"
  }
}
\`\`\`

## Real-world OAuth implementaties

### 1. Google OAuth volledig voorbeeld

\`\`\`javascript
const { google } = require('googleapis');
const express = require('express');
const session = require('express-session');

const app = express();

// OAuth2 client setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/auth/google/callback'
);

// Scopes voor Google services
const scopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/drive.readonly'
];

// Start OAuth flow
app.get('/auth/google', (req, res) => {
  const state = crypto.randomBytes(32).toString('hex');
  req.session.state = state;
  
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: state,
    prompt: 'consent' // Force consent voor refresh token
  });
  
  res.redirect(authUrl);
});

// Handle OAuth callback
app.get('/auth/google/callback', async (req, res) => {
  const { code, state } = req.query;
  
  // Verify state
  if (state !== req.session.state) {
    return res.status(400).send('State mismatch');
  }
  
  try {
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();
    
    // Save tokens securely
    await saveUserTokens(data.id, tokens);
    
    // Create user session
    req.session.user = {
      id: data.id,
      email: data.email,
      name: data.name,
      picture: data.picture
    };
    
    res.redirect('/dashboard');
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).send('Authentication failed');
  }
});

// Use Google APIs with stored tokens
app.get('/api/drive/files', async (req, res) => {
  try {
    const tokens = await getUserTokens(req.session.user.id);
    oauth2Client.setCredentials(tokens);
    
    // Check if token needs refresh
    if (tokens.expiry_date <= Date.now()) {
      const { credentials } = await oauth2Client.refreshAccessToken();
      await saveUserTokens(req.session.user.id, credentials);
      oauth2Client.setCredentials(credentials);
    }
    
    // Use Drive API
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const { data } = await drive.files.list({
      pageSize: 10,
      fields: 'files(id, name, mimeType, modifiedTime)'
    });
    
    res.json(data.files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
\`\`\`

### 2. GitHub OAuth met Octokit

\`\`\`javascript
const { App } = require('octokit');
const { createOAuthAppAuth } = require('@octokit/auth-oauth-app');

// OAuth App setup
const auth = createOAuthAppAuth({
  clientType: 'oauth-app',
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
});

// Start OAuth flow
app.get('/auth/github', (req, res) => {
  const state = generateState();
  req.session.githubState = state;
  
  const authUrl = \`https://github.com/login/oauth/authorize?\` +
    \`client_id=\${process.env.GITHUB_CLIENT_ID}&\` +
    \`redirect_uri=\${encodeURIComponent(REDIRECT_URI)}&\` +
    \`scope=repo,user&\` +
    \`state=\${state}\`;
  
  res.redirect(authUrl);
});

// Handle callback
app.get('/auth/github/callback', async (req, res) => {
  const { code, state } = req.query;
  
  if (state !== req.session.githubState) {
    return res.status(400).send('Invalid state');
  }
  
  try {
    // Exchange code for token
    const { authentication } = await auth({
      type: 'oauth-user',
      code,
      state,
    });
    
    // Create authenticated Octokit instance
    const octokit = new Octokit({
      auth: authentication.token
    });
    
    // Get user data
    const { data: user } = await octokit.rest.users.getAuthenticated();
    
    // Save token (encrypted!)
    await saveGitHubToken(user.id, authentication.token);
    
    res.redirect('/dashboard');
  } catch (error) {
    res.status(500).send('GitHub auth failed');
  }
});

// Use GitHub API
app.get('/api/github/repos', async (req, res) => {
  const token = await getGitHubToken(req.session.user.id);
  
  const octokit = new Octokit({ auth: token });
  
  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: 'updated',
    per_page: 10
  });
  
  res.json(data);
});
\`\`\`

### 3. Microsoft OAuth (MSAL)

\`\`\`javascript
const msal = require('@azure/msal-node');

// MSAL configuration
const msalConfig = {
  auth: {
    clientId: process.env.MICROSOFT_CLIENT_ID,
    authority: 'https://login.microsoftonline.com/common',
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: msal.LogLevel.Verbose,
    }
  }
};

// Create MSAL instance
const cca = new msal.ConfidentialClientApplication(msalConfig);

// Auth endpoints
app.get('/auth/microsoft', (req, res) => {
  const authCodeUrlParameters = {
    scopes: ['user.read', 'mail.read'],
    redirectUri: REDIRECT_URI,
    state: generateState(),
  };
  
  cca.getAuthCodeUrl(authCodeUrlParameters)
    .then((response) => {
      req.session.state = authCodeUrlParameters.state;
      res.redirect(response);
    })
    .catch((error) => console.log(error));
});

app.get('/auth/microsoft/callback', (req, res) => {
  const tokenRequest = {
    code: req.query.code,
    scopes: ['user.read', 'mail.read'],
    redirectUri: REDIRECT_URI,
  };
  
  cca.acquireTokenByCode(tokenRequest)
    .then(async (response) => {
      // Store tokens
      await saveMicrosoftTokens(response.account.homeAccountId, {
        accessToken: response.accessToken,
        idToken: response.idToken,
        account: response.account,
      });
      
      res.redirect('/dashboard');
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send('Auth failed');
    });
});
\`\`\`

## OAuth Debugging Tips

### 1. Common OAuth Errors

\`\`\`javascript
// Error handling middleware
const handleOAuthError = (error, req, res, next) => {
  console.error('OAuth Error:', error);
  
  const errorMessages = {
    'invalid_grant': 'The authorization code is invalid or expired',
    'invalid_client': 'Client authentication failed',
    'invalid_scope': 'The requested scope is invalid or exceeds granted scope',
    'access_denied': 'The user denied access',
  };
  
  const message = errorMessages[error.error] || 'Authentication failed';
  
  res.status(400).json({
    error: error.error,
    message: message,
    description: error.error_description
  });
};
\`\`\`

### 2. OAuth Testing Tools

\`\`\`javascript
// OAuth test helper
class OAuthTester {
  async testAuthorizationFlow(config) {
    console.log('Testing OAuth flow for:', config.provider);
    
    // Test 1: Authorization URL generation
    const authUrl = this.generateAuthUrl(config);
    console.log('✓ Auth URL:', authUrl);
    
    // Test 2: Simulate callback
    const mockCode = 'test_auth_code_123';
    const tokenResponse = await this.testTokenExchange(config, mockCode);
    console.log('✓ Token exchange:', tokenResponse ? 'Success' : 'Failed');
    
    // Test 3: Token refresh
    if (tokenResponse?.refresh_token) {
      const refreshResponse = await this.testTokenRefresh(
        config, 
        tokenResponse.refresh_token
      );
      console.log('✓ Token refresh:', refreshResponse ? 'Success' : 'Failed');
    }
    
    // Test 4: API call with token
    const apiResponse = await this.testAPICall(
      config, 
      tokenResponse?.access_token
    );
    console.log('✓ API call:', apiResponse ? 'Success' : 'Failed');
    
    return {
      authUrl: !!authUrl,
      tokenExchange: !!tokenResponse,
      tokenRefresh: !!refreshResponse,
      apiCall: !!apiResponse
    };
  }
}
\`\`\`

### 3. OAuth Monitoring

\`\`\`javascript
// Monitor OAuth health
class OAuthMonitor {
  constructor(redis) {
    this.redis = redis;
  }
  
  async trackAuthEvent(event) {
    const key = \`oauth:stats:\${event.provider}:\${event.type}\`;
    await this.redis.hincrby(key, 'count', 1);
    
    if (event.error) {
      await this.redis.hincrby(key, 'errors', 1);
      await this.redis.lpush(
        \`oauth:errors:\${event.provider}\`,
        JSON.stringify({
          error: event.error,
          timestamp: new Date().toISOString()
        })
      );
    }
  }
  
  async getStats(provider) {
    const stats = {};
    const keys = await this.redis.keys(\`oauth:stats:\${provider}:*\`);
    
    for (const key of keys) {
      const type = key.split(':').pop();
      stats[type] = await this.redis.hgetall(key);
    }
    
    return stats;
  }
}
\`\`\`

## Best Practices Samengevat

### Do's:
1. **Gebruik altijd state parameter** voor CSRF protection
2. **Implementeer token refresh** voor seamless UX
3. **Encrypt tokens** bij opslag in database
4. **Minimaliseer scopes** tot wat echt nodig is
5. **Monitor OAuth flows** voor problemen

### Don'ts:
1. **Nooit client secrets in frontend** code
2. **Geen tokens in localStorage** (gebruik secure cookies)
3. **Niet vergeten tokens te refreshen** voor expiry
4. **Geen hardcoded redirect URIs** in productie
5. **Niet skippen op error handling**

## Praktijkopdrachten

1. **Implementeer complete OAuth flow**
   - Kies een provider (Google, GitHub, Microsoft)
   - Bouw authorization, callback, en refresh flows
   - Implementeer secure token opslag
   - Test met echte API calls

2. **Multi-provider OAuth systeem**
   - Support minimaal 3 OAuth providers
   - Unified interface voor token management
   - Provider-agnostic API calls
   - Account linking functionaliteit

3. **OAuth in automation**
   - Maak N8N workflow met OAuth
   - Implementeer token refresh in Make.com
   - Monitor en log OAuth events
   - Handle errors gracefully

## Resources

- [OAuth 2.0 RFC](https://tools.ietf.org/html/rfc6749)
- [OAuth 2.0 Security Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)
- [OpenID Connect](https://openid.net/connect/)
- [PKCE Extension](https://tools.ietf.org/html/rfc7636)

## Conclusie

OAuth 2.0 is complex maar essentieel voor moderne API integraties. De key takeaways:

- **Authorization ≠ Authentication**: OAuth is voor autorisatie
- **Security first**: State, PKCE, en encryptie zijn must-haves
- **Automation**: OAuth werkt uitstekend in N8N en Make.com

In de volgende les duiken we in API rate limiting en quota management.
`,
  codeExamples: [
    {
      id: 'complete-oauth-flow',
      title: 'Complete OAuth 2.0 Authorization Code Flow',
      language: 'javascript',
      code: `// Complete OAuth 2.0 Implementation with Security Best Practices
const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');

class OAuth2Server {
  constructor(config) {
    this.config = config;
    this.db = this.initDatabase();
    this.initModels();
  }

  initDatabase() {
    return new Sequelize({
      dialect: 'postgres',
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      logging: false
    });
  }

  initModels() {
    // User model
    this.User = this.db.define('User', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      name: DataTypes.STRING,
      picture: DataTypes.STRING
    });

    // OAuth State model (voor CSRF protection)
    this.OAuthState = this.db.define('OAuthState', {
      state: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      userId: DataTypes.UUID,
      provider: DataTypes.STRING,
      codeVerifier: DataTypes.STRING, // Voor PKCE
      expiresAt: DataTypes.DATE,
      used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    });

    // OAuth Token model
    this.OAuthToken = this.db.define('OAuthToken', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      provider: DataTypes.STRING,
      accessToken: DataTypes.TEXT, // Encrypted!
      refreshToken: DataTypes.TEXT, // Encrypted!
      expiresAt: DataTypes.DATE,
      scopes: DataTypes.ARRAY(DataTypes.STRING)
    });
  }

  // Genereer veilige random strings
  generateSecureRandom(length = 32) {
    return crypto.randomBytes(length).toString('base64url');
  }

  // PKCE challenge generatie
  async generatePKCEChallenge(verifier) {
    const hash = crypto.createHash('sha256');
    hash.update(verifier);
    return hash.digest('base64url');
  }

  // Encrypt/decrypt tokens
  encryptToken(token) {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  decryptToken(encryptedData) {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const decipher = crypto.createDecipheriv(
      algorithm, 
      key, 
      Buffer.from(encryptedData.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Start OAuth flow
  async initiateOAuth(provider, userId = null) {
    const state = this.generateSecureRandom();
    const codeVerifier = this.generateSecureRandom(128);
    const codeChallenge = await this.generatePKCEChallenge(codeVerifier);
    
    // Save state voor verificatie
    await this.OAuthState.create({
      state,
      userId,
      provider,
      codeVerifier,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
      used: false
    });
    
    // Bouw authorization URL
    const params = new URLSearchParams({
      client_id: this.config[provider].clientId,
      redirect_uri: this.config[provider].redirectUri,
      response_type: 'code',
      scope: this.config[provider].scopes.join(' '),
      state,
      access_type: 'offline', // Voor refresh token
      prompt: 'consent',
      // PKCE parameters
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });
    
    const authUrl = \`\${this.config[provider].authUrl}?\${params}\`;
    
    return { authUrl, state };
  }

  // Handle OAuth callback
  async handleCallback(provider, code, state) {
    // Verify state
    const stateRecord = await this.OAuthState.findOne({
      where: { state, provider, used: false }
    });
    
    if (!stateRecord) {
      throw new Error('Invalid or expired state');
    }
    
    if (new Date() > stateRecord.expiresAt) {
      throw new Error('State expired');
    }
    
    // Mark state as used
    await stateRecord.update({ used: true });
    
    // Exchange code for tokens
    const tokenResponse = await this.exchangeCodeForTokens(
      provider, 
      code, 
      stateRecord.codeVerifier
    );
    
    // Get user info
    const userInfo = await this.getUserInfo(provider, tokenResponse.access_token);
    
    // Create or update user
    let user = await this.User.findOne({
      where: { email: userInfo.email }
    });
    
    if (!user) {
      user = await this.User.create({
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture
      });
    }
    
    // Store tokens (encrypted)
    const encryptedAccess = this.encryptToken(tokenResponse.access_token);
    const encryptedRefresh = tokenResponse.refresh_token ? 
      this.encryptToken(tokenResponse.refresh_token) : null;
    
    await this.OAuthToken.create({
      userId: user.id,
      provider,
      accessToken: JSON.stringify(encryptedAccess),
      refreshToken: encryptedRefresh ? JSON.stringify(encryptedRefresh) : null,
      expiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000),
      scopes: this.config[provider].scopes
    });
    
    // Create session token
    const sessionToken = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        provider 
      },
      process.env.SESSION_SECRET,
      { expiresIn: '24h' }
    );
    
    return { user, sessionToken };
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(provider, code, codeVerifier) {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.config[provider].redirectUri,
      client_id: this.config[provider].clientId,
      client_secret: this.config[provider].clientSecret,
      code_verifier: codeVerifier // PKCE
    });
    
    const response = await fetch(this.config[provider].tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(\`Token exchange failed: \${error.error_description}\`);
    }
    
    return response.json();
  }

  // Get user info from provider
  async getUserInfo(provider, accessToken) {
    const response = await fetch(this.config[provider].userInfoUrl, {
      headers: {
        'Authorization': \`Bearer \${accessToken}\`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get user info');
    }
    
    const data = await response.json();
    
    // Normalize user data across providers
    return this.normalizeUserInfo(provider, data);
  }

  // Normalize user info across different providers
  normalizeUserInfo(provider, data) {
    const normalizers = {
      google: (data) => ({
        id: data.id,
        email: data.email,
        name: data.name,
        picture: data.picture
      }),
      github: (data) => ({
        id: data.id.toString(),
        email: data.email,
        name: data.name,
        picture: data.avatar_url
      }),
      microsoft: (data) => ({
        id: data.id,
        email: data.mail || data.userPrincipalName,
        name: data.displayName,
        picture: null
      })
    };
    
    return normalizers[provider](data);
  }

  // Get valid access token (with auto-refresh)
  async getValidToken(userId, provider) {
    const tokenRecord = await this.OAuthToken.findOne({
      where: { userId, provider },
      order: [['createdAt', 'DESC']]
    });
    
    if (!tokenRecord) {
      throw new Error('No token found');
    }
    
    // Check if token is expired
    const now = new Date();
    const expiryBuffer = 5 * 60 * 1000; // 5 min buffer
    
    if (tokenRecord.expiresAt - now < expiryBuffer) {
      // Token needs refresh
      if (!tokenRecord.refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const refreshToken = this.decryptToken(
        JSON.parse(tokenRecord.refreshToken)
      );
      
      const newTokens = await this.refreshAccessToken(provider, refreshToken);
      
      // Update stored tokens
      const encryptedAccess = this.encryptToken(newTokens.access_token);
      const encryptedRefresh = newTokens.refresh_token ? 
        this.encryptToken(newTokens.refresh_token) : 
        tokenRecord.refreshToken;
      
      await tokenRecord.update({
        accessToken: JSON.stringify(encryptedAccess),
        refreshToken: encryptedRefresh,
        expiresAt: new Date(Date.now() + newTokens.expires_in * 1000)
      });
      
      return newTokens.access_token;
    }
    
    // Return decrypted token
    return this.decryptToken(JSON.parse(tokenRecord.accessToken));
  }

  // Refresh access token
  async refreshAccessToken(provider, refreshToken) {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.config[provider].clientId,
      client_secret: this.config[provider].clientSecret
    });
    
    const response = await fetch(this.config[provider].tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(\`Token refresh failed: \${error.error_description}\`);
    }
    
    return response.json();
  }

  // Revoke tokens
  async revokeTokens(userId, provider) {
    const tokenRecord = await this.OAuthToken.findOne({
      where: { userId, provider }
    });
    
    if (!tokenRecord) {
      return;
    }
    
    // Some providers support token revocation
    if (this.config[provider].revokeUrl) {
      const accessToken = this.decryptToken(
        JSON.parse(tokenRecord.accessToken)
      );
      
      await fetch(this.config[provider].revokeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          token: accessToken,
          token_type_hint: 'access_token'
        })
      });
    }
    
    // Delete from database
    await tokenRecord.destroy();
  }

  // Express middleware
  authMiddleware() {
    return async (req, res, next) => {
      const token = req.headers.authorization?.split(' ')[1] || 
                   req.cookies?.sessionToken;
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }
      
      try {
        const decoded = jwt.verify(token, process.env.SESSION_SECRET);
        req.user = decoded;
        next();
      } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
      }
    };
  }
}

// Usage example
const oauthConfig = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    redirectUri: 'http://localhost:3000/auth/google/callback',
    scopes: ['openid', 'email', 'profile']
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user',
    redirectUri: 'http://localhost:3000/auth/github/callback',
    scopes: ['user:email', 'read:user']
  }
};

// Initialize OAuth server
const oauth = new OAuth2Server(oauthConfig);

// Express routes
const app = express();

// Start OAuth flow
app.get('/auth/:provider', async (req, res) => {
  const { provider } = req.params;
  
  try {
    const { authUrl } = await oauth.initiateOAuth(provider);
    res.redirect(authUrl);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Handle OAuth callback
app.get('/auth/:provider/callback', async (req, res) => {
  const { provider } = req.params;
  const { code, state, error } = req.query;
  
  if (error) {
    return res.status(400).json({ error: req.query.error_description });
  }
  
  try {
    const { user, sessionToken } = await oauth.handleCallback(
      provider, 
      code, 
      state
    );
    
    // Set secure cookie
    res.cookie('sessionToken', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    res.redirect('/dashboard');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Protected API endpoint
app.get('/api/user', oauth.authMiddleware(), async (req, res) => {
  const user = await oauth.User.findByPk(req.user.userId);
  res.json(user);
});

// Use OAuth token for API calls
app.get('/api/:provider/data', oauth.authMiddleware(), async (req, res) => {
  const { provider } = req.params;
  
  try {
    const accessToken = await oauth.getValidToken(req.user.userId, provider);
    
    // Make API call with token
    const response = await fetch(\`https://api.\${provider}.com/user/data\`, {
      headers: {
        'Authorization': \`Bearer \${accessToken}\`
      }
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout
app.post('/auth/logout', oauth.authMiddleware(), async (req, res) => {
  // Optionally revoke tokens
  if (req.query.revoke === 'true') {
    await oauth.revokeTokens(req.user.userId, req.user.provider);
  }
  
  res.clearCookie('sessionToken');
  res.json({ message: 'Logged out successfully' });
});

// Start server
app.listen(3000, () => {
  console.log('OAuth server running on http://localhost:3000');
});`
    },
    {
      id: 'client-credentials-implementation',
      title: 'Client Credentials Flow voor Server-to-Server',
      language: 'javascript',
      code: `// OAuth 2.0 Client Credentials Flow Implementation
// Voor server-to-server communicatie zonder user interaction

class ClientCredentialsOAuth {
  constructor(config) {
    this.config = config;
    this.tokenCache = new Map();
  }

  // Token cache key
  getCacheKey(provider, scopes = []) {
    return \`\${provider}:\${scopes.sort().join(',')}\`;
  }

  // Get access token with caching
  async getAccessToken(provider, scopes = []) {
    const cacheKey = this.getCacheKey(provider, scopes);
    const cached = this.tokenCache.get(cacheKey);
    
    // Check cache
    if (cached && cached.expiresAt > Date.now()) {
      return cached.token;
    }
    
    // Request new token
    const tokenData = await this.requestToken(provider, scopes);
    
    // Cache token
    this.tokenCache.set(cacheKey, {
      token: tokenData.access_token,
      expiresAt: Date.now() + (tokenData.expires_in - 300) * 1000 // 5 min buffer
    });
    
    return tokenData.access_token;
  }

  // Request token from provider
  async requestToken(provider, scopes) {
    const config = this.config[provider];
    
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      scope: scopes.join(' ') || config.defaultScopes.join(' ')
    });
    
    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: params
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(\`Token request failed: \${error.error_description}\`);
    }
    
    return response.json();
  }

  // Make authenticated API request
  async makeRequest(provider, endpoint, options = {}) {
    const accessToken = await this.getAccessToken(
      provider, 
      options.scopes
    );
    
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': \`Bearer \${accessToken}\`
      }
    });
    
    if (response.status === 401) {
      // Token might be expired, clear cache and retry
      const cacheKey = this.getCacheKey(provider, options.scopes);
      this.tokenCache.delete(cacheKey);
      
      // Retry once
      return this.makeRequest(provider, endpoint, options);
    }
    
    return response;
  }
}

// Microsoft Graph API Example
class MicrosoftGraphClient extends ClientCredentialsOAuth {
  constructor() {
    super({
      microsoft: {
        clientId: process.env.AZURE_CLIENT_ID,
        clientSecret: process.env.AZURE_CLIENT_SECRET,
        tokenUrl: \`https://login.microsoftonline.com/\${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token\`,
        defaultScopes: ['https://graph.microsoft.com/.default']
      }
    });
  }

  // Get all users
  async getUsers() {
    const response = await this.makeRequest(
      'microsoft',
      'https://graph.microsoft.com/v1.0/users'
    );
    
    return response.json();
  }

  // Send email
  async sendMail(from, to, subject, body) {
    const message = {
      message: {
        subject,
        body: {
          contentType: 'Text',
          content: body
        },
        toRecipients: [
          {
            emailAddress: {
              address: to
            }
          }
        ]
      }
    };
    
    const response = await this.makeRequest(
      'microsoft',
      \`https://graph.microsoft.com/v1.0/users/\${from}/sendMail\`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      }
    );
    
    return response.ok;
  }
}

// Google Service Account Example
class GoogleServiceAccount {
  constructor(keyFile) {
    this.keyFile = keyFile;
    this.tokenCache = new Map();
  }

  // Create JWT for service account
  createJWT(scopes) {
    const now = Math.floor(Date.now() / 1000);
    
    const payload = {
      iss: this.keyFile.client_email,
      scope: scopes.join(' '),
      aud: this.keyFile.token_uri,
      exp: now + 3600, // 1 hour
      iat: now
    };
    
    return jwt.sign(payload, this.keyFile.private_key, {
      algorithm: 'RS256'
    });
  }

  // Get access token
  async getAccessToken(scopes) {
    const cacheKey = scopes.sort().join(',');
    const cached = this.tokenCache.get(cacheKey);
    
    if (cached && cached.expiresAt > Date.now()) {
      return cached.token;
    }
    
    const assertion = this.createJWT(scopes);
    
    const response = await fetch(this.keyFile.token_uri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion
      })
    });
    
    const data = await response.json();
    
    this.tokenCache.set(cacheKey, {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in - 300) * 1000
    });
    
    return data.access_token;
  }
}

// Salesforce JWT Bearer Flow
class SalesforceJWTBearer {
  constructor(config) {
    this.config = config;
    this.instanceUrl = null;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // Create JWT
  createJWT() {
    const now = Math.floor(Date.now() / 1000);
    
    const payload = {
      iss: this.config.clientId,
      sub: this.config.username,
      aud: this.config.audience || 'https://login.salesforce.com',
      exp: now + 300 // 5 minutes
    };
    
    return jwt.sign(payload, this.config.privateKey, {
      algorithm: 'RS256'
    });
  }

  // Get access token
  async authenticate() {
    if (this.accessToken && this.tokenExpiry > Date.now()) {
      return {
        accessToken: this.accessToken,
        instanceUrl: this.instanceUrl
      };
    }
    
    const assertion = this.createJWT();
    
    const response = await fetch(\`\${this.config.audience}/services/oauth2/token\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(\`Salesforce auth failed: \${error.error_description}\`);
    }
    
    const data = await response.json();
    
    this.accessToken = data.access_token;
    this.instanceUrl = data.instance_url;
    this.tokenExpiry = Date.now() + 3600000; // 1 hour
    
    return {
      accessToken: this.accessToken,
      instanceUrl: this.instanceUrl
    };
  }

  // Make Salesforce API request
  async query(soql) {
    const { accessToken, instanceUrl } = await this.authenticate();
    
    const response = await fetch(
      \`\${instanceUrl}/services/data/v56.0/query?q=\${encodeURIComponent(soql)}\`,
      {
        headers: {
          'Authorization': \`Bearer \${accessToken}\`,
          'Accept': 'application/json'
        }
      }
    );
    
    return response.json();
  }
}

// Usage Examples

// Microsoft Graph
const graphClient = new MicrosoftGraphClient();

// Get users
const users = await graphClient.getUsers();
console.log('Users:', users.value);

// Send email
await graphClient.sendMail(
  'sender@company.com',
  'recipient@company.com',
  'Test Email',
  'This is a test email sent via Microsoft Graph API'
);

// Google Service Account
const googleKeyFile = require('./service-account-key.json');
const googleClient = new GoogleServiceAccount(googleKeyFile);

// Access Google Sheets API
const sheetsToken = await googleClient.getAccessToken([
  'https://www.googleapis.com/auth/spreadsheets'
]);

const sheetsResponse = await fetch(
  'https://sheets.googleapis.com/v4/spreadsheets/SPREADSHEET_ID/values/A1:B10',
  {
    headers: {
      'Authorization': \`Bearer \${sheetsToken}\`
    }
  }
);

// Salesforce
const sfClient = new SalesforceJWTBearer({
  clientId: process.env.SF_CLIENT_ID,
  username: process.env.SF_USERNAME,
  privateKey: fs.readFileSync('./sf-private-key.pem', 'utf8'),
  audience: 'https://login.salesforce.com'
});

// Query Salesforce
const accounts = await sfClient.query(
  'SELECT Id, Name, Type FROM Account LIMIT 10'
);
console.log('Accounts:', accounts.records);

// Token Monitoring and Management
class TokenManager {
  constructor() {
    this.clients = new Map();
    this.metrics = {
      requests: 0,
      tokenRefreshes: 0,
      errors: 0
    };
  }

  // Register OAuth client
  registerClient(name, client) {
    this.clients.set(name, client);
  }

  // Get client
  getClient(name) {
    const client = this.clients.get(name);
    if (!client) {
      throw new Error(\`Client \${name} not registered\`);
    }
    return client;
  }

  // Make monitored request
  async request(clientName, endpoint, options = {}) {
    this.metrics.requests++;
    
    try {
      const client = this.getClient(clientName);
      const response = await client.makeRequest(
        clientName,
        endpoint,
        options
      );
      
      return response;
    } catch (error) {
      this.metrics.errors++;
      throw error;
    }
  }

  // Get metrics
  getMetrics() {
    return {
      ...this.metrics,
      clients: Array.from(this.clients.keys()),
      uptime: process.uptime()
    };
  }
}

// Initialize token manager
const tokenManager = new TokenManager();

// Register clients
tokenManager.registerClient('microsoft', new MicrosoftGraphClient());
tokenManager.registerClient('google', googleClient);
tokenManager.registerClient('salesforce', sfClient);

// API endpoint for metrics
app.get('/api/oauth/metrics', (req, res) => {
  res.json(tokenManager.getMetrics());
});

// Health check endpoint
app.get('/api/oauth/health', async (req, res) => {
  const health = {
    status: 'healthy',
    clients: {}
  };
  
  for (const [name, client] of tokenManager.clients) {
    try {
      // Test token acquisition
      await client.getAccessToken(name);
      health.clients[name] = 'ok';
    } catch (error) {
      health.status = 'degraded';
      health.clients[name] = 'error';
    }
  }
  
  res.json(health);
});`
    }
  ],
  assignments: [
    {
      id: 'implement-oauth-flow',
      title: 'Implementeer een OAuth 2.0 flow',
      difficulty: 'medium',
      type: 'project',
      hints: [
        'Kies een OAuth provider (Google, GitHub, of Microsoft)',
        'Implementeer de complete authorization code flow',
        'Voeg PKCE toe voor extra security',
        'Bouw token refresh functionaliteit',
        'Test met echte API calls'
      ],
      description: 'Implementeer een complete OAuth 2.0 authorization code flow met een provider naar keuze, inclusief PKCE voor extra beveiliging en token refresh functionaliteit.'
    },
    {
      id: 'oauth-security-audit',
      title: 'OAuth Security Audit',
      difficulty: 'hard',
      type: 'project',
      hints: [
        'Analyseer een bestaande OAuth implementatie',
        'Identificeer security vulnerabilities',
        'Implementeer state parameter correct',
        'Voeg token encryption toe',
        'Schrijf security test suite'
      ],
      description: 'Voer een grondige security audit uit op een bestaande OAuth implementatie en implementeer verbeteringen voor gevonden kwetsbaarheden.'
    }
  ],
  videoUrl: 'https://vimeo.com/oauth-practice'
}