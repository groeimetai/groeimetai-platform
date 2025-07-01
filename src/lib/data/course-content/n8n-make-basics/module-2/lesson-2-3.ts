import type { Lesson } from '@/lib/data/courses';

export const lesson2_3: Lesson = {
  id: 'lesson-2-3',
  title: 'JWT tokens en Bearer auth',
  duration: '30 min',
  content: `
# JWT Tokens en Bearer Authentication

## Overzicht
JWT (JSON Web Tokens) en Bearer authentication zijn moderne standaarden voor API authenticatie. Ze bieden een veilige en schaalbare manier om toegang tot resources te beheren zonder telkens credentials te hoeven versturen.

## Wat zijn JWT Tokens?

### JWT Structuur
Een JWT bestaat uit drie delen, gescheiden door punten:
- **Header**: Metadata over het token (type en algoritme)
- **Payload**: De daadwerkelijke data (claims)
- **Signature**: Verificatie dat het token niet is gemanipuleerd

\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
\`\`\`

### JWT Voordelen
- **Stateless**: Server hoeft geen sessies bij te houden
- **Self-contained**: Alle info zit in het token
- **Verifiable**: Digitaal gesigneerd voor integriteit
- **Portable**: Werkt across different domains

## Bearer Authentication

### Wat is Bearer Auth?
Bearer authentication is een HTTP authenticatie schema waarbij je een token meestuurt in de Authorization header:

\`\`\`
Authorization: Bearer <token>
\`\`\`

Het token kan zijn:
- Een simpele API key
- Een OAuth2 access token
- Een JWT token

### Bearer Token Format
\`\`\`javascript
// HTTP Request met Bearer token
const response = await fetch('https://api.example.com/data', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIs...',
    'Content-Type': 'application/json'
  }
});
\`\`\`

## JWT Bearer Tokens Implementatie

### Genereren van JWT Tokens
\`\`\`javascript
const jwt = require('jsonwebtoken');

// JWT token aanmaken
const token = jwt.sign(
  {
    iss: API_KEY,                              // Issuer
    sub: 'user123',                            // Subject (user ID)
    aud: 'api.example.com',                    // Audience
    exp: Math.floor(Date.now() / 1000) + 3600, // Expiry (1 uur)
    iat: Math.floor(Date.now() / 1000),        // Issued at
    scope: 'read:users write:posts'            // Permissions
  },
  API_SECRET,
  { algorithm: 'HS256' }
);

console.log('JWT Token:', token);
\`\`\`

### JWT Verificatie
\`\`\`javascript
// Verify JWT token
function verifyJWT(token, secret) {
  try {
    const decoded = jwt.verify(token, secret);
    console.log('Token is valid:', decoded);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.error('Token is expired');
    } else if (error.name === 'JsonWebTokenError') {
      console.error('Invalid token');
    }
    throw error;
  }
}
\`\`\`

### JWT in N8N
In N8N kun je JWT tokens gebruiken in HTTP Request nodes:

\`\`\`javascript
// Function node voor JWT generatie
const jwt = require('jsonwebtoken');

const payload = {
  userId: items[0].json.userId,
  email: items[0].json.email,
  permissions: ['read', 'write']
};

const token = jwt.sign(
  payload,
  $env.JWT_SECRET,
  { 
    expiresIn: '1h',
    algorithm: 'HS256'
  }
);

return [{
  json: {
    token: token,
    type: 'Bearer',
    expiresIn: 3600
  }
}];
\`\`\`

### JWT in Make
In Make gebruik je de HTTP module met custom headers:

\`\`\`
Headers configuratie:
- Authorization: Bearer {{1.token}}
- Content-Type: application/json
\`\`\`

## Praktische Implementaties

### Voorbeeld 1: Zoom API met JWT
Zoom gebruikt JWT tokens voor server-to-server authenticatie:

\`\`\`javascript
// Zoom JWT generator
const zoomJWT = {
  generateToken: function(apiKey, apiSecret, meetingNumber, role) {
    const iat = Math.round(new Date().getTime() / 1000) - 30;
    const exp = iat + 60 * 60 * 2; // 2 uur geldig
    
    const payload = {
      sdkKey: apiKey,
      mn: meetingNumber,
      role: role,
      iat: iat,
      exp: exp,
      tokenExp: exp
    };
    
    return jwt.sign(payload, apiSecret);
  }
};

// Gebruik voor Zoom API call
const token = zoomJWT.generateToken(
  process.env.ZOOM_API_KEY,
  process.env.ZOOM_API_SECRET,
  '123456789',
  0 // 0 = participant, 1 = host
);
\`\`\`

### Voorbeeld 2: Custom API met JWT Auth
\`\`\`javascript
// API Client met automatische token refresh
class APIClient {
  constructor(config) {
    this.baseURL = config.baseURL;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.token = null;
    this.tokenExpiry = null;
  }
  
  async getToken() {
    // Check of huidige token nog geldig is
    if (this.token && this.tokenExpiry > Date.now()) {
      return this.token;
    }
    
    // Genereer nieuwe token
    const payload = {
      iss: this.clientId,
      exp: Math.floor(Date.now() / 1000) + 3600,
      scope: 'api:access'
    };
    
    this.token = jwt.sign(payload, this.clientSecret);
    this.tokenExpiry = Date.now() + 3500000; // 5 min voor expiry
    
    return this.token;
  }
  
  async request(endpoint, options = {}) {
    const token = await this.getToken();
    
    const response = await fetch(\`\${this.baseURL}\${endpoint}\`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': \`Bearer \${token}\`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 401) {
      // Token expired, reset en probeer opnieuw
      this.token = null;
      return this.request(endpoint, options);
    }
    
    return response.json();
  }
}
\`\`\`

## Security Best Practices

### 1. Token Opslag
\`\`\`javascript
// GOED: Environment variables
const secret = process.env.JWT_SECRET;

// FOUT: Hardcoded secrets
const secret = 'my-super-secret-key-123';

// GOED: Encrypted storage voor refresh tokens
const encryptedToken = encrypt(refreshToken, masterKey);
\`\`\`

### 2. Token Expiry
\`\`\`javascript
// Korte expiry voor access tokens
const accessToken = jwt.sign(payload, secret, {
  expiresIn: '15m' // 15 minuten
});

// Langere expiry voor refresh tokens
const refreshToken = jwt.sign(payload, secret, {
  expiresIn: '7d' // 7 dagen
});
\`\`\`

### 3. Token Validation
\`\`\`javascript
// Complete validation middleware
async function validateBearerToken(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Extra checks
    if (decoded.exp < Date.now() / 1000) {
      throw new Error('Token expired');
    }
    
    if (!decoded.scope.includes('api:access')) {
      throw new Error('Insufficient permissions');
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
\`\`\`

## Debugging JWT Tokens

### JWT Decoder
\`\`\`bash
# Decode JWT token via command line
echo "YOUR_JWT_TOKEN" | cut -d. -f2 | base64 -d | jq

# Of gebruik jwt.io voor visual debugging
\`\`\`

### Common JWT Errors
1. **"Invalid signature"**: Secret key komt niet overeen
2. **"Token expired"**: Check de exp claim
3. **"Malformed token"**: Token format is incorrect
4. **"Algorithm mismatch"**: Verwacht vs gebruikt algoritme

### Test Bearer Auth
\`\`\`bash
# Test API met Bearer token
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.example.com/test

# Test met verbose output
curl -v -H "Authorization: Bearer YOUR_TOKEN" https://api.example.com/test
\`\`\`

## Integratie Patronen

### Pattern 1: Token Caching
\`\`\`javascript
const tokenCache = new Map();

async function getCachedToken(key, generator) {
  const cached = tokenCache.get(key);
  
  if (cached && cached.expiry > Date.now()) {
    return cached.token;
  }
  
  const newToken = await generator();
  tokenCache.set(key, {
    token: newToken.token,
    expiry: Date.now() + (newToken.expiresIn * 1000)
  });
  
  return newToken.token;
}
\`\`\`

### Pattern 2: Multi-Tenant JWT
\`\`\`javascript
// JWT voor multi-tenant applications
function generateTenantToken(tenantId, userId, permissions) {
  return jwt.sign({
    tenant: tenantId,
    user: userId,
    permissions: permissions,
    iss: 'auth.example.com',
    aud: \`tenant:\${tenantId}\`
  }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
}
\`\`\`

## Veelvoorkomende Use Cases

### 1. Service-to-Service Auth
Voor communicatie tussen microservices:
\`\`\`javascript
// Service A genereert token voor Service B
const serviceToken = jwt.sign({
  service: 'serviceA',
  purpose: 'data-sync',
  permissions: ['read:users', 'write:logs']
}, SERVICE_SECRET, { expiresIn: '5m' });
\`\`\`

### 2. Webhook Verificatie
Verificatie van webhook calls:
\`\`\`javascript
// Webhook met JWT signature
function createWebhookSignature(payload, secret) {
  const token = jwt.sign({
    payload: crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex'),
    timestamp: Date.now()
  }, secret, { expiresIn: '5m' });
  
  return token;
}
\`\`\`

### 3. API Rate Limiting
JWT claims voor rate limiting:
\`\`\`javascript
const rateLimitedToken = jwt.sign({
  sub: userId,
  rateLimit: {
    requests: 1000,
    window: '1h'
  },
  tier: 'premium'
}, API_SECRET);
\`\`\`
  `,
  codeExamples: [
    {
      id: 'example-2-3-1',
      title: 'Complete JWT Authentication System',
      language: 'javascript',
      code: `// Volledig JWT authenticatie systeem
class JWTAuthSystem {
  constructor(options) {
    this.secret = options.secret;
    this.accessTokenExpiry = options.accessTokenExpiry || '15m';
    this.refreshTokenExpiry = options.refreshTokenExpiry || '7d';
    this.issuer = options.issuer || 'api.example.com';
  }
  
  // Generate token pair
  generateTokens(userId, claims = {}) {
    const basePayload = {
      sub: userId,
      iss: this.issuer,
      iat: Math.floor(Date.now() / 1000)
    };
    
    const accessToken = jwt.sign(
      { ...basePayload, ...claims, type: 'access' },
      this.secret,
      { expiresIn: this.accessTokenExpiry }
    );
    
    const refreshToken = jwt.sign(
      { ...basePayload, type: 'refresh' },
      this.secret,
      { expiresIn: this.refreshTokenExpiry }
    );
    
    return { accessToken, refreshToken };
  }
  
  // Verify and decode token
  verifyToken(token, type = 'access') {
    try {
      const decoded = jwt.verify(token, this.secret, {
        issuer: this.issuer
      });
      
      if (decoded.type !== type) {
        throw new Error(\`Invalid token type. Expected \${type}\`);
      }
      
      return decoded;
    } catch (error) {
      throw new Error(\`Token verification failed: \${error.message}\`);
    }
  }
  
  // Refresh access token
  async refreshAccessToken(refreshToken) {
    const decoded = this.verifyToken(refreshToken, 'refresh');
    
    // Optional: Check if refresh token is blacklisted
    // if (await this.isBlacklisted(refreshToken)) {
    //   throw new Error('Refresh token is blacklisted');
    // }
    
    return this.generateTokens(decoded.sub, {
      // Preserve original claims if needed
    });
  }
  
  // Extract token from Bearer header
  extractBearerToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
  
  // Middleware for Express/Node.js
  middleware(requiredScopes = []) {
    return async (req, res, next) => {
      try {
        const token = this.extractBearerToken(req.headers.authorization);
        if (!token) {
          return res.status(401).json({ error: 'No token provided' });
        }
        
        const decoded = this.verifyToken(token);
        
        // Check scopes if required
        if (requiredScopes.length > 0) {
          const tokenScopes = decoded.scope?.split(' ') || [];
          const hasRequiredScopes = requiredScopes.every(scope => 
            tokenScopes.includes(scope)
          );
          
          if (!hasRequiredScopes) {
            return res.status(403).json({ error: 'Insufficient permissions' });
          }
        }
        
        req.user = decoded;
        next();
      } catch (error) {
        res.status(401).json({ error: error.message });
      }
    };
  }
}

// Usage example
const auth = new JWTAuthSystem({
  secret: process.env.JWT_SECRET,
  issuer: 'my-api.com'
});

// Generate tokens for login
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Verify credentials (simplified)
  const user = await verifyCredentials(email, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const tokens = auth.generateTokens(user.id, {
    email: user.email,
    role: user.role,
    scope: user.permissions.join(' ')
  });
  
  res.json(tokens);
});

// Protected route
app.get('/api/users', auth.middleware(['read:users']), async (req, res) => {
  // req.user contains the decoded token
  const users = await getUsers();
  res.json(users);
});

// Refresh endpoint
app.post('/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await auth.refreshAccessToken(refreshToken);
    res.json(tokens);
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});`
    }
  ],
  assignments: [
    {
      id: 'jwt-implementation-1',
      title: 'Implementeer JWT authenticatie',
      description: 'Bouw een complete JWT authenticatie flow met access en refresh tokens voor een API',
      difficulty: 'medium',
      type: 'project',
      initialCode: `// Start met een basis JWT implementatie
const jwt = require('jsonwebtoken');

// TODO: Implementeer de volgende functies:
// 1. generateAccessToken(userId, email)
// 2. generateRefreshToken(userId)
// 3. verifyToken(token, type)
// 4. refreshAccessToken(refreshToken)

const SECRET = process.env.JWT_SECRET || 'your-secret-key';`,
      hints: [
        'Gebruik verschillende expiry times voor access en refresh tokens',
        'Access tokens: 15 minuten, Refresh tokens: 7 dagen',
        'Implementeer proper error handling voor expired tokens'
      ]
    },
    {
      id: 'jwt-implementation-2',
      title: 'Debug en fix JWT problemen',
      description: 'Analyseer een set van JWT tokens met verschillende problemen en fix de security issues',
      difficulty: 'hard',
      type: 'code',
      initialCode: `// Problematische JWT implementatie - vind en fix de issues
const token1 = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.';
const token2 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ';
const token3 = generateToken({ userId: 123, role: 'admin' }, 'weak-secret');`,
      hints: [
        'Check het algoritme in de header van token1',
        'Token2 mist een belangrijke claim voor security',
        'Token3 gebruikt een zwakke secret key'
      ]
    }
  ],
  resources: [
    {
      title: 'JWT.io - JWT Debugger',
      url: 'https://jwt.io/',
      type: 'tool'
    },
    {
      title: 'RFC 7519 - JSON Web Token',
      url: 'https://tools.ietf.org/html/rfc7519',
      type: 'specification'
    },
    {
      title: 'OAuth 2.0 Bearer Token Usage',
      url: 'https://tools.ietf.org/html/rfc6750',
      type: 'specification'
    },
    {
      title: 'JWT Best Practices',
      url: 'https://datatracker.ietf.org/doc/html/rfc8725',
      type: 'guide'
    }
  ]
};