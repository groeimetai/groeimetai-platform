import { Lesson } from '@/lib/data/courses';

export const lesson2_1: Lesson = {
  id: 'api-keys-bearer-tokens',
  title: 'API Keys en Bearer tokens',
  duration: '30 min',
  content: `
# API Keys en Bearer tokens

## Introductie

In deze les duiken we diep in de wereld van API authenticatie. Je leert hoe API keys en Bearer tokens werken, waarom ze belangrijk zijn voor beveiliging, en hoe je ze correct implementeert in N8N en Make.com.

## Wat zijn API keys?

Een API key is een **unieke identificatiecode** die gebruikt wordt om een applicatie of gebruiker te authenticeren bij een API. Het is vergelijkbaar met een wachtwoord, maar specifiek ontworpen voor programmatische toegang.

### Anatomie van een API key:

\`\`\`
sk_live_XXXXXXXXXXXXXXXXXXXXXX
└─┬──┘ └─┬─┘ └───────────────┬─────────────────┘
  │      │                   │
  │      │                   └── Random string (32-64 karakters)
  │      └────────────────────── Environment (live/test)
  └────────────────────────────── Prefix voor identificatie
\`\`\`

### Verschillende types API keys:

1. **Public keys** (Client-side)
   - Kunnen veilig in frontend code
   - Beperkte permissies
   - Voorbeeld: \`pk_test_XXXXXXXXXXXXXXXXXXXXXX\`

2. **Secret keys** (Server-side)
   - NOOIT in frontend code!
   - Volledige toegang
   - Voorbeeld: \`sk_live_XXXXXXXXXXXXXXXXXXXXXX\`

3. **Restricted keys**
   - Specifieke permissies
   - Tijdelijk of permanent
   - Voorbeeld: \`rk_live_kPOu8VgS3FQD4xJM9hRqFnCZ\`

### API key authenticatie flow:

\`\`\`
┌─────────────┐                     ┌─────────────┐
│   Client    │  Request + API Key  │  API Server │
│             │ ─────────────────>  │             │
│             │                     │ Verificatie │
│             │  Response/Error     │     ↓       │
│             │ <─────────────────  │  Database   │
└─────────────┘                     └─────────────┘
\`\`\`

## Hoe werken API keys?

### 1. Header-based authentication:

\`\`\`javascript
// Meest voorkomende methode
fetch('https://api.example.com/data', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

// Alternatief: Custom header
fetch('https://api.example.com/data', {
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});
\`\`\`

### 2. Query parameter authentication:

\`\`\`javascript
// Minder veilig, maar soms nodig
const apiKey = 'YOUR_API_KEY';
const url = \`https://api.example.com/data?api_key=\${apiKey}\`;

fetch(url)
  .then(response => response.json())
  .then(data => console.log(data));
\`\`\`

### 3. Request body authentication:

\`\`\`javascript
// Zeldzaam, maar wordt soms gebruikt
fetch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    api_key: 'YOUR_API_KEY',
    data: { /* je data */ }
  })
});
\`\`\`

## Bearer Token Authentication

Bearer tokens zijn een specifiek type authenticatie token dat vaak gebruikt wordt met OAuth 2.0. Het woord "Bearer" betekent letterlijk "drager" - wie de token heeft, krijgt toegang.

### Bearer token structuur:

\`\`\`
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
                └─┬──┘ └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─────────────────────────────────────────────┘
                  │                                                            JWT Token                                                                    │
                  └── Token type                                                                                                                          └── Digital signature
\`\`\`

### JWT (JSON Web Token) anatomie:

\`\`\`javascript
// Header
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022,
  "exp": 1516242622,  // Expiration time
  "scope": "read:users write:posts"
}

// Signature
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)
\`\`\`

### Bearer token vs API key:

| Aspect | API Key | Bearer Token |
|--------|---------|--------------|
| Levensduur | Permanent (tot revoked) | Tijdelijk (heeft expiry) |
| Informatie | Alleen identificatie | Kan claims/data bevatten |
| Refresh | Moet handmatig | Automatisch met refresh token |
| Stateless | Nee (DB lookup nodig) | Ja (self-contained) |
| Use case | Long-lived access | Session-based access |

## API Key generatie en management

### Best practices voor API key generatie:

\`\`\`javascript
const crypto = require('crypto');

class APIKeyManager {
  // Genereer een veilige API key
  generateAPIKey(prefix = 'sk') {
    // Gebruik crypto voor veilige random bytes
    const randomBytes = crypto.randomBytes(32);
    const key = randomBytes.toString('base64url');
    
    // Voeg prefix toe voor identificatie
    return \`\${prefix}_\${key}\`;
  }
  
  // Hash API key voor opslag
  hashAPIKey(apiKey) {
    return crypto
      .createHash('sha256')
      .update(apiKey)
      .digest('hex');
  }
  
  // Verificatie van API key
  async verifyAPIKey(providedKey, storedHash) {
    const providedHash = this.hashAPIKey(providedKey);
    
    // Gebruik timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(providedHash),
      Buffer.from(storedHash)
    );
  }
  
  // API key met metadata
  async createAPIKey(userId, permissions = []) {
    const key = this.generateAPIKey();
    const hashedKey = this.hashAPIKey(key);
    
    // Sla op in database
    await db.apiKeys.create({
      user_id: userId,
      key_hash: hashedKey,
      permissions: permissions,
      created_at: new Date(),
      last_used_at: null,
      active: true
    });
    
    // Return de unhashed key (alleen deze keer!)
    return key;
  }
}
\`\`\`

### API key opslag best practices:

1. **NOOIT plain text opslaan**
   - Altijd hashen met SHA-256 of bcrypt
   - Gebruik salts voor extra veiligheid

2. **Metadata bijhouden**
   - Creation date
   - Last used date
   - Permissions/scopes
   - Rate limits

3. **Key rotation**
   - Periodiek nieuwe keys genereren
   - Oude keys geleidelijk uitfaseren
   - Audit trail bijhouden

## Bearer Token implementation

### JWT generatie:

\`\`\`javascript
const jwt = require('jsonwebtoken');

class JWTManager {
  constructor(secret) {
    this.secret = secret;
    this.defaultOptions = {
      expiresIn: '1h',
      algorithm: 'HS256'
    };
  }
  
  // Genereer access token
  generateAccessToken(payload) {
    return jwt.sign(payload, this.secret, {
      ...this.defaultOptions,
      expiresIn: '15m'  // Korte levensduur
    });
  }
  
  // Genereer refresh token
  generateRefreshToken(userId) {
    return jwt.sign(
      { userId, type: 'refresh' },
      this.secret,
      { expiresIn: '7d' }
    );
  }
  
  // Verifieer token
  verifyToken(token) {
    try {
      return {
        valid: true,
        payload: jwt.verify(token, this.secret)
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }
  
  // Token refresh flow
  async refreshAccessToken(refreshToken) {
    const { valid, payload } = this.verifyToken(refreshToken);
    
    if (!valid || payload.type !== 'refresh') {
      throw new Error('Invalid refresh token');
    }
    
    // Genereer nieuwe tokens
    const newAccessToken = this.generateAccessToken({
      userId: payload.userId,
      scope: 'api'
    });
    
    const newRefreshToken = this.generateRefreshToken(payload.userId);
    
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }
}
\`\`\`

### Middleware voor token verificatie:

\`\`\`javascript
// Express middleware voor Bearer token auth
function bearerTokenAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Missing or invalid authorization header'
    });
  }
  
  const token = authHeader.substring(7); // Remove "Bearer "
  const jwtManager = new JWTManager(process.env.JWT_SECRET);
  const { valid, payload, error } = jwtManager.verifyToken(token);
  
  if (!valid) {
    return res.status(401).json({
      error: 'Invalid token',
      details: error
    });
  }
  
  // Voeg user info toe aan request
  req.user = payload;
  next();
}

// Gebruik in routes
app.get('/api/protected', bearerTokenAuth, (req, res) => {
  res.json({
    message: 'Access granted',
    user: req.user
  });
});
\`\`\`

## API Key vs Bearer Token: Wanneer wat gebruiken?

### Gebruik API Keys voor:

1. **Server-to-server communicatie**
   - Webhooks
   - Backend integraties
   - CI/CD pipelines

2. **Long-lived access**
   - Developer APIs
   - Third-party integraties
   - Machine accounts

3. **Simpele use cases**
   - Rate limiting per client
   - Basic authenticatie
   - Public APIs

### Gebruik Bearer Tokens voor:

1. **User sessions**
   - Web applicaties
   - Mobile apps
   - SPAs (Single Page Applications)

2. **Temporary access**
   - OAuth flows
   - Delegated authorization
   - Limited-time access

3. **Complex permission models**
   - Role-based access
   - Dynamic scopes
   - Multi-tenant systems

## Praktijkvoorbeelden

### 1. Stripe API (API Key):

\`\`\`javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// API key wordt automatisch meegestuurd
const customer = await stripe.customers.create({
  email: 'customer@example.com',
  name: 'John Doe'
});
\`\`\`

### 2. GitHub API (Bearer Token):

\`\`\`javascript
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

// Bearer token in Authorization header
const { data } = await octokit.rest.users.getAuthenticated();
\`\`\`

### 3. Custom API implementation:

\`\`\`javascript
// Server setup
const express = require('express');
const app = express();

// API Key authentication
app.use('/api/v1', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  // Verify API key
  verifyAPIKey(apiKey)
    .then(valid => {
      if (valid) {
        next();
      } else {
        res.status(401).json({ error: 'Invalid API key' });
      }
    })
    .catch(err => {
      res.status(500).json({ error: 'Authentication error' });
    });
});

// Bearer token authentication voor user endpoints
app.use('/api/user', bearerTokenAuth);

// Routes
app.get('/api/v1/data', (req, res) => {
  res.json({ data: 'API key authenticated data' });
});

app.get('/api/user/profile', (req, res) => {
  res.json({ 
    profile: 'Bearer token authenticated data',
    user: req.user 
  });
});
\`\`\`

## Security overwegingen

### 1. API Key security:

- **Environment variables**: Gebruik altijd environment variables
- **HTTPS only**: Verzend keys alleen over versleutelde verbindingen
- **Rotation policy**: Implementeer key rotation
- **Audit logging**: Log alle key gebruik
- **Rate limiting**: Beperk requests per key
- **IP whitelisting**: Optioneel voor extra security

### 2. Bearer Token security:

- **Short expiry**: Gebruik korte expiry times (15-30 min)
- **Refresh tokens**: Implementeer refresh token flow
- **Secure storage**: Store tokens veilig client-side
- **CSRF protection**: Gebruik anti-CSRF tokens
- **Token revocation**: Implementeer blacklisting

### 3. Common security mistakes:

\`\`\`javascript
// ❌ FOUT: API key in code
const apiKey = 'sk_live_XXXXXXXXXXXXXXXXXXXXXX';

// ✅ GOED: Environment variable
const apiKey = process.env.API_KEY;

// ❌ FOUT: Token in localStorage (XSS vulnerable)
localStorage.setItem('token', bearerToken);

// ✅ GOED: HttpOnly cookie
res.cookie('token', bearerToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});

// ❌ FOUT: Geen expiry
const token = jwt.sign({ userId }, secret);

// ✅ GOED: Met expiry
const token = jwt.sign({ userId }, secret, { expiresIn: '15m' });
\`\`\`

## Implementatie in N8N en Make.com

### N8N HTTP Request node met API key:

\`\`\`json
{
  "authentication": "genericCredentialType",
  "genericAuthType": "httpHeaderAuth",
  "httpHeaderAuth": {
    "name": "X-API-Key",
    "value": "={{$credentials.apiKey}}"
  }
}
\`\`\`

### Make.com HTTP module met Bearer token:

\`\`\`json
{
  "url": "https://api.example.com/data",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer {{access_token}}",
    "Content-Type": "application/json"
  }
}
\`\`\`

## Best practices samenvatting

### API Keys:
1. Gebruik sterke, random generated keys
2. Hash keys voor opslag
3. Implementeer key rotation
4. Monitor en log gebruik
5. Gebruik rate limiting

### Bearer Tokens:
1. Gebruik korte expiry times
2. Implementeer refresh token flow
3. Valideer tokens server-side
4. Gebruik HTTPS altijd
5. Store tokens veilig

### Algemeen:
1. Gebruik environment variables
2. Implementeer proper error handling
3. Log security events
4. Regular security audits
5. Keep dependencies updated

## Praktijkopdracht

Implementeer een volledig authenticatie systeem met zowel API keys als Bearer tokens:

1. **API Key system**:
   - Key generatie endpoint
   - Key verificatie middleware
   - Rate limiting per key
   - Key management dashboard

2. **Bearer token system**:
   - Login endpoint met JWT generatie
   - Token refresh endpoint
   - Protected routes
   - Token revocation

3. **Integratie**:
   - N8N workflow met API key auth
   - Make.com scenario met Bearer token
   - Error handling en logging
   - Security audit

## Resources

- [JWT.io - JWT Debugger](https://jwt.io)
- [OAuth 2.0 Specification](https://oauth.net/2/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [N8N Authentication Docs](https://docs.n8n.io/credentials/)
- [Make.com HTTP Module](https://www.make.com/en/help/tools/http)

## Conclusie

API keys en Bearer tokens zijn fundamentele bouwstenen voor moderne API security. Door de juiste keuze te maken tussen deze twee methodes en ze correct te implementeren, creëer je veilige en schaalbare systemen. 

In de volgende les duiken we dieper in OAuth 2.0 flows!`,
  codeExamples: [
    {
      id: 'secure-api-key-generation',
      title: 'Veilige API key generatie en opslag',
      language: 'javascript',
      code: `// Secure API Key Management System
const crypto = require('crypto');
const bcrypt = require('bcrypt');

class SecureAPIKeyManager {
  constructor(db) {
    this.db = db;
    this.saltRounds = 10;
  }

  // Genereer cryptografisch veilige API key
  generateAPIKey(type = 'secret') {
    const timestamp = Date.now().toString(36);
    const randomBytes = crypto.randomBytes(32).toString('base64url');
    const prefix = type === 'secret' ? 'sk' : 'pk';
    
    return \`\${prefix}_\${process.env.NODE_ENV}_\${timestamp}_\${randomBytes}\`;
  }

  // Hash API key voor veilige opslag
  async hashAPIKey(apiKey) {
    // Gebruik bcrypt voor extra veiligheid
    const hash = await bcrypt.hash(apiKey, this.saltRounds);
    return hash;
  }

  // Creëer nieuwe API key met metadata
  async createAPIKey(userId, config = {}) {
    const apiKey = this.generateAPIKey(config.type || 'secret');
    const hashedKey = await this.hashAPIKey(apiKey);
    
    // Extract prefix voor identificatie (eerste 15 karakters)
    const keyPrefix = apiKey.substring(0, 15);
    const keyId = crypto.randomBytes(8).toString('hex');
    
    // Sla metadata op in database
    const keyRecord = await this.db.apiKeys.create({
      id: keyId,
      user_id: userId,
      key_hash: hashedKey,
      key_prefix: keyPrefix,
      key_type: config.type || 'secret',
      name: config.name || 'API Key',
      permissions: config.permissions || ['read'],
      rate_limit: config.rateLimit || 1000,
      expires_at: config.expiresIn ? 
        new Date(Date.now() + config.expiresIn) : null,
      created_at: new Date(),
      last_used_at: null,
      status: 'active'
    });
    
    // Log key creation (zonder de actual key!)
    await this.logKeyEvent(keyId, 'created', userId);
    
    // Return de unhashed key (alleen deze keer!)
    return {
      apiKey: apiKey,
      keyId: keyId,
      prefix: keyPrefix,
      type: config.type || 'secret',
      createdAt: keyRecord.created_at,
      expiresAt: keyRecord.expires_at
    };
  }

  // Verifieer API key
  async verifyAPIKey(providedKey) {
    if (!providedKey) {
      return { valid: false, error: 'No API key provided' };
    }
    
    // Extract prefix
    const keyPrefix = providedKey.substring(0, 15);
    
    // Zoek key record op basis van prefix
    const keyRecords = await this.db.apiKeys.findAll({
      where: {
        key_prefix: keyPrefix,
        status: 'active'
      }
    });
    
    // Probeer elke mogelijke match
    for (const record of keyRecords) {
      const isValid = await bcrypt.compare(providedKey, record.key_hash);
      
      if (isValid) {
        // Check expiry
        if (record.expires_at && new Date() > record.expires_at) {
          await this.logKeyEvent(record.id, 'expired', record.user_id);
          return { valid: false, error: 'API key expired' };
        }
        
        // Update last used
        await this.db.apiKeys.update(
          { last_used_at: new Date() },
          { where: { id: record.id } }
        );
        
        // Log successful use
        await this.logKeyEvent(record.id, 'used', record.user_id);
        
        return {
          valid: true,
          keyId: record.id,
          userId: record.user_id,
          permissions: record.permissions,
          rateLimit: record.rate_limit
        };
      }
    }
    
    // Log failed attempt
    await this.logKeyEvent(null, 'invalid_attempt', null, {
      prefix: keyPrefix
    });
    
    return { valid: false, error: 'Invalid API key' };
  }

  // Revoke API key
  async revokeAPIKey(keyId, userId, reason = 'User requested') {
    const result = await this.db.apiKeys.update(
      { 
        status: 'revoked',
        revoked_at: new Date(),
        revoked_reason: reason
      },
      { 
        where: { 
          id: keyId,
          user_id: userId 
        } 
      }
    );
    
    if (result[0] > 0) {
      await this.logKeyEvent(keyId, 'revoked', userId, { reason });
      return { success: true };
    }
    
    return { success: false, error: 'Key not found' };
  }

  // List user's API keys (zonder de actual keys!)
  async listUserKeys(userId) {
    const keys = await this.db.apiKeys.findAll({
      where: { user_id: userId },
      attributes: [
        'id', 'key_prefix', 'key_type', 'name',
        'permissions', 'created_at', 'last_used_at',
        'expires_at', 'status'
      ],
      order: [['created_at', 'DESC']]
    });
    
    return keys;
  }

  // Log API key events
  async logKeyEvent(keyId, event, userId, metadata = {}) {
    await this.db.apiKeyLogs.create({
      key_id: keyId,
      user_id: userId,
      event: event,
      metadata: metadata,
      ip_address: metadata.ipAddress || null,
      user_agent: metadata.userAgent || null,
      timestamp: new Date()
    });
  }

  // Cleanup expired keys
  async cleanupExpiredKeys() {
    const result = await this.db.apiKeys.update(
      { status: 'expired' },
      {
        where: {
          expires_at: { [Op.lt]: new Date() },
          status: 'active'
        }
      }
    );
    
    console.log(\`Cleaned up \${result[0]} expired keys\`);
    return result[0];
  }
}`
    },
    {
      id: 'jwt-bearer-implementation',
      title: 'JWT Bearer token implementatie',
      language: 'javascript',
      code: `// Complete JWT Bearer Token System
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class BearerTokenSystem {
  constructor(config = {}) {
    this.accessSecret = config.accessSecret || process.env.JWT_ACCESS_SECRET;
    this.refreshSecret = config.refreshSecret || process.env.JWT_REFRESH_SECRET;
    this.accessExpiry = config.accessExpiry || '15m';
    this.refreshExpiry = config.refreshExpiry || '7d';
    this.issuer = config.issuer || 'api.example.com';
  }

  // Genereer token pair
  generateTokenPair(user) {
    const tokenId = crypto.randomBytes(16).toString('hex');
    
    // Access token met user info en permissions
    const accessToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        permissions: user.permissions || [],
        type: 'access'
      },
      this.accessSecret,
      {
        expiresIn: this.accessExpiry,
        issuer: this.issuer,
        jwtid: tokenId
      }
    );
    
    // Refresh token met minimale info
    const refreshToken = jwt.sign(
      {
        sub: user.id,
        type: 'refresh',
        tokenFamily: tokenId
      },
      this.refreshSecret,
      {
        expiresIn: this.refreshExpiry,
        issuer: this.issuer
      }
    );
    
    return {
      accessToken,
      refreshToken,
      tokenId,
      expiresIn: this.getExpirySeconds(this.accessExpiry)
    };
  }

  // Verifieer access token
  verifyAccessToken(token) {
    try {
      const payload = jwt.verify(token, this.accessSecret, {
        issuer: this.issuer,
        algorithms: ['HS256']
      });
      
      if (payload.type !== 'access') {
        throw new Error('Invalid token type');
      }
      
      return {
        valid: true,
        payload,
        userId: payload.sub,
        permissions: payload.permissions
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        expired: error.name === 'TokenExpiredError'
      };
    }
  }

  // Refresh access token
  async refreshAccessToken(refreshToken, db) {
    try {
      // Verifieer refresh token
      const payload = jwt.verify(refreshToken, this.refreshSecret, {
        issuer: this.issuer,
        algorithms: ['HS256']
      });
      
      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      
      // Check of token family is gerevoked
      const revokedToken = await db.revokedTokens.findOne({
        where: { token_family: payload.tokenFamily }
      });
      
      if (revokedToken) {
        // Token reuse detected! Revoke hele family
        await this.revokeTokenFamily(payload.tokenFamily, db);
        throw new Error('Token reuse detected');
      }
      
      // Haal user op
      const user = await db.users.findByPk(payload.sub);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Genereer nieuwe tokens
      const newTokens = this.generateTokenPair(user);
      
      // Invalideer oude refresh token
      await db.usedTokens.create({
        token_id: payload.jti,
        token_family: payload.tokenFamily,
        used_at: new Date()
      });
      
      return newTokens;
    } catch (error) {
      throw new Error(\`Token refresh failed: \${error.message}\`);
    }
  }

  // Revoke token family (bij security breach)
  async revokeTokenFamily(tokenFamily, db) {
    await db.revokedTokens.create({
      token_family: tokenFamily,
      revoked_at: new Date(),
      reason: 'security_breach'
    });
  }

  // Express middleware
  authMiddleware(options = {}) {
    return async (req, res, next) => {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).json({
          error: 'No authorization header'
        });
      }
      
      const [type, token] = authHeader.split(' ');
      
      if (type !== 'Bearer') {
        return res.status(401).json({
          error: 'Invalid authorization type'
        });
      }
      
      const result = this.verifyAccessToken(token);
      
      if (!result.valid) {
        const status = result.expired ? 401 : 403;
        return res.status(status).json({
          error: result.error,
          code: result.expired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
        });
      }
      
      // Check permissions als nodig
      if (options.requiredPermissions) {
        const hasPermission = options.requiredPermissions.every(
          perm => result.permissions.includes(perm)
        );
        
        if (!hasPermission) {
          return res.status(403).json({
            error: 'Insufficient permissions'
          });
        }
      }
      
      // Voeg user info toe aan request
      req.user = result.payload;
      req.userId = result.userId;
      next();
    };
  }

  // Helper functies
  getExpirySeconds(expiry) {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 0;
    
    const [, num, unit] = match;
    const multipliers = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400
    };
    
    return parseInt(num) * multipliers[unit];
  }

  // Decode token zonder verificatie (voor debugging)
  decodeToken(token) {
    return jwt.decode(token, { complete: true });
  }
}

// Gebruik voorbeeld
const tokenSystem = new BearerTokenSystem();

// Login endpoint
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Validate credentials
  const user = await validateUserCredentials(email, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Genereer tokens
  const tokens = tokenSystem.generateTokenPair(user);
  
  // Set refresh token als httpOnly cookie
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dagen
  });
  
  // Return access token
  res.json({
    accessToken: tokens.accessToken,
    expiresIn: tokens.expiresIn,
    tokenType: 'Bearer'
  });
});

// Refresh endpoint
app.post('/auth/refresh', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token' });
  }
  
  try {
    const tokens = await tokenSystem.refreshAccessToken(refreshToken, db);
    
    // Set nieuwe refresh token
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.json({
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
      tokenType: 'Bearer'
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Protected route
app.get('/api/profile',
  tokenSystem.authMiddleware(),
  (req, res) => {
    res.json({
      user: req.user,
      message: 'Authenticated successfully'
    });
  }
);

// Admin route met permission check
app.get('/api/admin',
  tokenSystem.authMiddleware({
    requiredPermissions: ['admin']
  }),
  (req, res) => {
    res.json({
      message: 'Admin access granted'
    });
  }
);`
    },
    {
      id: 'n8n-make-api-auth',
      title: 'API authenticatie in N8N en Make.com',
      language: 'javascript',
      code: `// N8N Custom Node met API Key Authentication
export class MyAPINode implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'My API',
    name: 'myApi',
    icon: 'file:myapi.svg',
    group: ['transform'],
    version: 1,
    description: 'Interact with My API',
    defaults: {
      name: 'My API',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'myApiCredentials',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        options: [
          {
            name: 'Get Data',
            value: 'getData',
          },
          {
            name: 'Create Record',
            value: 'createRecord',
          },
        ],
        default: 'getData',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const credentials = await this.getCredentials('myApiCredentials');
    const operation = this.getNodeParameter('operation', 0) as string;
    
    const options: IHttpRequestOptions = {
      method: 'GET',
      url: 'https://api.example.com/data',
      headers: {
        'Authorization': \`Bearer \${credentials.apiKey}\`,
        'Content-Type': 'application/json',
      },
    };

    if (operation === 'createRecord') {
      options.method = 'POST';
      options.body = this.getNodeParameter('data', 0) as IDataObject;
    }

    const response = await this.helpers.httpRequest(options);
    
    return [this.helpers.returnJsonArray(response)];
  }
}

// Credential Definition
export class MyApiCredentials implements ICredentialType {
  name = 'myApiCredentials';
  displayName = 'My API Credentials';
  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'The API Key for My API',
    },
    {
      displayName: 'Environment',
      name: 'environment',
      type: 'options',
      options: [
        {
          name: 'Production',
          value: 'production',
        },
        {
          name: 'Sandbox',
          value: 'sandbox',
        },
      ],
      default: 'production',
    },
  ];

  async authenticate(
    credentials: ICredentialDataDecryptedObject,
    requestOptions: IHttpRequestOptions,
  ): Promise<IHttpRequestOptions> {
    // Add authentication to requests
    requestOptions.headers = {
      ...requestOptions.headers,
      'Authorization': \`Bearer \${credentials.apiKey}\`,
    };
    
    // Use different base URL based on environment
    const baseUrl = credentials.environment === 'production'
      ? 'https://api.example.com'
      : 'https://sandbox-api.example.com';
    
    if (requestOptions.url && !requestOptions.url.startsWith('http')) {
      requestOptions.url = \`\${baseUrl}\${requestOptions.url}\`;
    }
    
    return requestOptions;
  }
}

// Make.com Custom App Definition
const makeComApp = {
  "name": "My API",
  "description": "Connect to My API service",
  "version": "1.0.0",
  "connections": [
    {
      "name": "myapi",
      "label": "My API Connection",
      "type": "apikey",
      "base": "https://api.example.com",
      "headers": {
        "Authorization": "Bearer {{connection.apiKey}}"
      },
      "parameters": [
        {
          "name": "apiKey",
          "label": "API Key",
          "type": "text",
          "required": true,
          "help": "Enter your My API key"
        },
        {
          "name": "environment",
          "label": "Environment",
          "type": "select",
          "required": true,
          "default": "production",
          "options": [
            {
              "label": "Production",
              "value": "production"
            },
            {
              "label": "Sandbox",
              "value": "sandbox"
            }
          ]
        }
      ],
      "validation": {
        "url": "/validate",
        "method": "GET"
      }
    }
  ],
  "modules": [
    {
      "name": "getData",
      "label": "Get Data",
      "description": "Retrieve data from My API",
      "connection": "myapi",
      "endpoint": {
        "url": "/data",
        "method": "GET",
        "headers": {
          "Accept": "application/json"
        },
        "qs": {
          "limit": "{{parameters.limit}}",
          "offset": "{{parameters.offset}}"
        }
      },
      "parameters": [
        {
          "name": "limit",
          "label": "Limit",
          "type": "number",
          "default": 10
        },
        {
          "name": "offset",
          "label": "Offset",
          "type": "number",
          "default": 0
        }
      ],
      "response": {
        "output": "{{body}}"
      }
    },
    {
      "name": "createRecord",
      "label": "Create Record",
      "description": "Create a new record in My API",
      "connection": "myapi",
      "endpoint": {
        "url": "/records",
        "method": "POST",
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "name": "{{parameters.name}}",
          "data": "{{parameters.data}}"
        }
      },
      "parameters": [
        {
          "name": "name",
          "label": "Name",
          "type": "text",
          "required": true
        },
        {
          "name": "data",
          "label": "Data",
          "type": "collection",
          "spec": [
            {
              "name": "field1",
              "type": "text"
            },
            {
              "name": "field2",
              "type": "number"
            }
          ]
        }
      ]
    }
  ],
  "webhooks": [
    {
      "name": "recordCreated",
      "label": "Record Created",
      "description": "Triggers when a new record is created",
      "connection": "myapi",
      "subscribe": {
        "url": "/webhooks/subscribe",
        "method": "POST",
        "body": {
          "url": "{{webhook.url}}",
          "events": ["record.created"]
        }
      },
      "unsubscribe": {
        "url": "/webhooks/{{webhook.id}}",
        "method": "DELETE"
      },
      "parameters": [],
      "output": "{{body}}"
    }
  ]
};

// N8N Workflow met OAuth2
{
  "nodes": [
    {
      "name": "OAuth2 API",
      "type": "n8n-nodes-base.httpRequest",
      "position": [250, 300],
      "parameters": {
        "authentication": "oAuth2",
        "url": "https://api.example.com/user",
        "method": "GET",
        "responseFormat": "json"
      },
      "credentials": {
        "oAuth2Api": {
          "id": "1",
          "name": "OAuth2 Account"
        }
      }
    }
  ],
  "credentials": {
    "oAuth2Api": {
      "clientId": "your-client-id",
      "clientSecret": "your-client-secret",
      "accessTokenUrl": "https://auth.example.com/oauth/token",
      "authorizationUrl": "https://auth.example.com/oauth/authorize",
      "scope": "read:user write:data",
      "authMethod": "header",
      "grantType": "authorizationCode"
    }
  }
}`
    }
  ],
  assignments: [
    {
      id: 'create-api-key-system',
      title: 'Bouw een API key management systeem',
      difficulty: 'medium',
      type: 'project',
      hints: [
        'Implementeer veilige API key generatie',
        'Bouw een key verificatie systeem',
        'Creëer een management interface',
        'Implementeer rate limiting per key'
      ],
      description: 'Bouw een volledig API key management systeem met generatie, verificatie, en beheer functionaliteiten.'
    },
    {
      id: 'implement-jwt-auth',
      title: 'JWT authenticatie implementeren',
      difficulty: 'medium',
      type: 'project',
      hints: [
        'Genereer JWT access en refresh tokens',
        'Implementeer token verificatie middleware',
        'Bouw refresh token flow',
        'Handel token expiry correct af'
      ],
      description: 'Implementeer een complete JWT-based authenticatie flow met access en refresh tokens.'
    },
    {
      id: 'n8n-api-workflow',
      title: 'N8N API integratie workflow',
      difficulty: 'easy',
      type: 'project',
      hints: [
        'Configureer API credentials in N8N',
        'Bouw een workflow met API authenticatie',
        'Test verschillende auth methodes',
        'Implementeer error handling'
      ],
      description: 'Creëer een N8N workflow die verschillende API authenticatie methodes gebruikt.'
    }
  ]
}