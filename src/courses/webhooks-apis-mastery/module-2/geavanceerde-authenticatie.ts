export const geavanceerdeAuthenticatie = {
  id: 'geavanceerde-authenticatie',
  title: 'Geavanceerde authenticatie methodes',
  duration: '35 min',
  content: `
# Geavanceerde authenticatie methodes

In deze les duiken we diep in moderne authenticatie methodes voor APIs. We behandelen implementaties die verder gaan dan basis API keys en leren hoe je enterprise-grade security implementeert.

## Overzicht van authenticatie methodes

### Authenticatie spectrum
Van simpel naar complex:
1. **API Keys** - Basis authenticatie met een secret key
2. **OAuth 2.0** - Gedelegeerde autorisatie
3. **JWT** - Stateless authenticatie tokens
4. **HMAC Signing** - Request integriteit verificatie
5. **mTLS** - Wederzijdse certificaat authenticatie
6. **Multi-factor** - Meerdere authenticatie lagen

## 1. JWT (JSON Web Tokens)

### Wat is JWT?
JWT is een open standaard (RFC 7519) voor het veilig uitwisselen van informatie tussen parties als een JSON object. Deze informatie kan geverifieerd en vertrouwd worden omdat het digitaal ondertekend is.

### JWT structuur
Een JWT bestaat uit drie delen gescheiden door punten:
\`\`\`
header.payload.signature
\`\`\`

**Voorbeeld JWT:**
\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbiBKYW5zZW4iLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
\`\`\`

### JWT implementatie

#### Server-side JWT generatie:
\`\`\`javascript
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class JWTAuthService {
  constructor() {
    // Genereer een sterk secret voor productie
    this.jwtSecret = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
    this.jwtOptions = {
      expiresIn: '1h',
      issuer: 'api.company.com',
      audience: 'api-users'
    };
  }
  
  // Genereer een JWT token
  generateToken(user) {
    const payload = {
      sub: user.id,           // Subject (user ID)
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      iat: Math.floor(Date.now() / 1000),  // Issued at
      jti: crypto.randomBytes(16).toString('hex')  // JWT ID voor blacklisting
    };
    
    return jwt.sign(payload, this.jwtSecret, this.jwtOptions);
  }
  
  // Verifieer en decodeer JWT
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: this.jwtOptions.issuer,
        audience: this.jwtOptions.audience
      });
      
      // Extra validatie
      if (this.isTokenBlacklisted(decoded.jti)) {
        throw new Error('Token is blacklisted');
      }
      
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }
  
  // Refresh token implementatie
  async refreshToken(refreshToken) {
    // Verifieer refresh token
    const decoded = await this.verifyRefreshToken(refreshToken);
    
    // Haal user op
    const user = await this.getUserById(decoded.sub);
    
    // Genereer nieuwe tokens
    const newAccessToken = this.generateToken(user);
    const newRefreshToken = this.generateRefreshToken(user);
    
    // Invalideer oude refresh token
    await this.invalidateRefreshToken(refreshToken);
    
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 3600  // 1 hour
    };
  }
  
  // Middleware voor Express
  authenticateJWT() {
    return async (req, res, next) => {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
      }
      
      const token = authHeader.split(' ')[1];  // Bearer <token>
      
      try {
        const decoded = this.verifyToken(token);
        req.user = decoded;
        next();
      } catch (error) {
        return res.status(401).json({ error: error.message });
      }
    };
  }
}

// Gebruik in Express app
const authService = new JWTAuthService();
const app = express();

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Valideer credentials
  const user = await validateUserCredentials(email, password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Genereer tokens
  const accessToken = authService.generateToken(user);
  const refreshToken = authService.generateRefreshToken(user);
  
  res.json({
    accessToken,
    refreshToken,
    tokenType: 'Bearer',
    expiresIn: 3600
  });
});

// Protected route
app.get('/api/profile', authService.authenticateJWT(), (req, res) => {
  res.json({
    userId: req.user.sub,
    email: req.user.email,
    role: req.user.role
  });
});
\`\`\`

#### Client-side JWT gebruik:
\`\`\`javascript
class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.accessToken = null;
    this.refreshToken = null;
  }
  
  // Login en sla tokens op
  async login(email, password) {
    const response = await fetch(\`\${this.baseURL}/api/login\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    const data = await response.json();
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
    
    // Sla tokens veilig op
    this.storeTokens(data);
    
    // Setup auto-refresh
    this.setupTokenRefresh(data.expiresIn);
    
    return data;
  }
  
  // Maak authenticated request
  async makeAuthenticatedRequest(endpoint, options = {}) {
    const response = await fetch(\`\${this.baseURL}\${endpoint}\`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': \`Bearer \${this.accessToken}\`
      }
    });
    
    // Handle token expiration
    if (response.status === 401) {
      await this.refreshAccessToken();
      // Retry request
      return this.makeAuthenticatedRequest(endpoint, options);
    }
    
    return response;
  }
  
  // Automatic token refresh
  setupTokenRefresh(expiresIn) {
    // Refresh 5 minuten voor expiry
    const refreshTime = (expiresIn - 300) * 1000;
    
    setTimeout(async () => {
      await this.refreshAccessToken();
    }, refreshTime);
  }
  
  async refreshAccessToken() {
    const response = await fetch(\`\${this.baseURL}/api/refresh\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken })
    });
    
    if (!response.ok) {
      // Refresh failed, user moet opnieuw inloggen
      this.logout();
      throw new Error('Session expired');
    }
    
    const data = await response.json();
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
    this.storeTokens(data);
    this.setupTokenRefresh(data.expiresIn);
  }
}
\`\`\`

## 2. Mutual TLS (mTLS)

### Wat is mTLS?
Mutual TLS is een uitbreiding van standaard TLS waarbij zowel de client als de server elkaar authenticeren met certificaten. Dit biedt de hoogste vorm van transport-level security.

### mTLS implementatie

#### Server configuratie:
\`\`\`javascript
const https = require('https');
const fs = require('fs');
const express = require('express');

// mTLS server setup
const app = express();

// Server certificaten
const serverOptions = {
  // Server certificaat en private key
  cert: fs.readFileSync('./certs/server-cert.pem'),
  key: fs.readFileSync('./certs/server-key.pem'),
  
  // CA certificaat voor client verificatie
  ca: fs.readFileSync('./certs/client-ca.pem'),
  
  // Vereis client certificaat
  requestCert: true,
  rejectUnauthorized: true
};

// Middleware voor client certificaat info
app.use((req, res, next) => {
  // Client certificaat details
  const cert = req.socket.getPeerCertificate();
  
  if (req.client.authorized) {
    // Extract client info uit certificaat
    req.clientInfo = {
      subject: cert.subject,
      issuer: cert.issuer,
      serialNumber: cert.serialNumber,
      fingerprint: cert.fingerprint,
      validFrom: cert.valid_from,
      validTo: cert.valid_to
    };
    
    console.log(\`Authenticated client: \${cert.subject.CN}\`);
    next();
  } else {
    res.status(401).json({ 
      error: 'Client certificate required' 
    });
  }
});

// API endpoints
app.get('/api/secure-data', (req, res) => {
  res.json({
    message: 'This is secured with mTLS',
    client: req.clientInfo.subject.CN,
    timestamp: new Date().toISOString()
  });
});

// Start HTTPS server met mTLS
const server = https.createServer(serverOptions, app);
server.listen(443, () => {
  console.log('mTLS server running on port 443');
});

// Certificate validation met extra checks
app.use((req, res, next) => {
  const cert = req.socket.getPeerCertificate();
  
  // Extra validatie checks
  if (cert.subject) {
    // Check certificate CN tegen whitelist
    const allowedCNs = ['client1.company.com', 'client2.company.com'];
    
    if (!allowedCNs.includes(cert.subject.CN)) {
      return res.status(403).json({ 
        error: 'Client not authorized' 
      });
    }
    
    // Check certificate expiry
    const now = new Date();
    const validTo = new Date(cert.valid_to);
    
    if (validTo < now) {
      return res.status(401).json({ 
        error: 'Client certificate expired' 
      });
    }
  }
  
  next();
});
\`\`\`

#### Client implementatie:
\`\`\`javascript
const https = require('https');
const fs = require('fs');

class mTLSClient {
  constructor(clientCertPath, clientKeyPath, caCertPath) {
    this.httpsAgent = new https.Agent({
      cert: fs.readFileSync(clientCertPath),
      key: fs.readFileSync(clientKeyPath),
      ca: fs.readFileSync(caCertPath),
      rejectUnauthorized: true
    });
  }
  
  async makeRequest(url, options = {}) {
    const fetch = require('node-fetch');
    
    try {
      const response = await fetch(url, {
        ...options,
        agent: this.httpsAgent
      });
      
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('mTLS request failed:', error);
      throw error;
    }
  }
}

// Gebruik
const client = new mTLSClient(
  './certs/client-cert.pem',
  './certs/client-key.pem',
  './certs/server-ca.pem'
);

// Maak mTLS request
client.makeRequest('https://api.company.com/secure-data')
  .then(data => console.log('Secure data:', data))
  .catch(err => console.error('Error:', err));

// Generate self-signed certificates voor testing
const { exec } = require('child_process');

function generateTestCertificates() {
  // CA certificate
  exec('openssl req -new -x509 -days 365 -nodes -out ca.pem -keyout ca-key.pem -subj "/C=NL/ST=State/L=City/O=Company/CN=Test CA"');
  
  // Server certificate
  exec('openssl req -new -nodes -out server.csr -keyout server-key.pem -subj "/C=NL/ST=State/L=City/O=Company/CN=localhost"');
  exec('openssl x509 -req -in server.csr -days 365 -CA ca.pem -CAkey ca-key.pem -set_serial 01 -out server-cert.pem');
  
  // Client certificate
  exec('openssl req -new -nodes -out client.csr -keyout client-key.pem -subj "/C=NL/ST=State/L=City/O=Company/CN=client1"');
  exec('openssl x509 -req -in client.csr -days 365 -CA ca.pem -CAkey ca-key.pem -set_serial 02 -out client-cert.pem');
}
\`\`\`

## 3. HMAC Request Signing

### Wat is HMAC signing?
HMAC (Hash-based Message Authentication Code) signing zorgt ervoor dat de inhoud van een request niet gewijzigd is en afkomstig is van een vertrouwde bron.

### HMAC implementatie

#### Server-side verificatie:
\`\`\`javascript
const crypto = require('crypto');
const express = require('express');

class HMACAuthService {
  constructor() {
    // Map van client IDs naar secrets
    this.clientSecrets = new Map([
      ['client-001', 'secret-key-for-client-001'],
      ['client-002', 'secret-key-for-client-002']
    ]);
  }
  
  // Genereer HMAC signature
  generateSignature(method, path, timestamp, body, secret) {
    // Canonical request string
    const canonicalString = [
      method.toUpperCase(),
      path,
      timestamp,
      crypto.createHash('sha256').update(body || '').digest('hex')
    ].join('\\n');
    
    // Generate HMAC
    return crypto
      .createHmac('sha256', secret)
      .update(canonicalString)
      .digest('hex');
  }
  
  // Middleware voor HMAC verificatie
  verifyHMAC() {
    return (req, res, next) => {
      const clientId = req.headers['x-client-id'];
      const timestamp = req.headers['x-timestamp'];
      const signature = req.headers['x-signature'];
      
      // Validatie
      if (!clientId || !timestamp || !signature) {
        return res.status(401).json({ 
          error: 'Missing authentication headers' 
        });
      }
      
      // Check timestamp (prevent replay attacks)
      const requestTime = parseInt(timestamp);
      const currentTime = Date.now();
      const timeDiff = Math.abs(currentTime - requestTime);
      
      if (timeDiff > 300000) { // 5 minuten window
        return res.status(401).json({ 
          error: 'Request timestamp too old' 
        });
      }
      
      // Get client secret
      const clientSecret = this.clientSecrets.get(clientId);
      if (!clientSecret) {
        return res.status(401).json({ 
          error: 'Unknown client' 
        });
      }
      
      // Generate expected signature
      const body = JSON.stringify(req.body) || '';
      const expectedSignature = this.generateSignature(
        req.method,
        req.originalUrl,
        timestamp,
        body,
        clientSecret
      );
      
      // Compare signatures
      const signaturesMatch = crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
      
      if (!signaturesMatch) {
        return res.status(401).json({ 
          error: 'Invalid signature' 
        });
      }
      
      // Attach client info to request
      req.client = { id: clientId };
      next();
    };
  }
}

// Setup Express app met HMAC auth
const app = express();
const hmacAuth = new HMACAuthService();

app.use(express.json());
app.use(hmacAuth.verifyHMAC());

app.post('/api/orders', (req, res) => {
  console.log(\`Authenticated request from client: \${req.client.id}\`);
  res.json({ 
    message: 'Order created',
    orderId: generateOrderId(),
    clientId: req.client.id
  });
});
\`\`\`

#### Client implementatie:
\`\`\`javascript
class HMACAPIClient {
  constructor(baseURL, clientId, clientSecret) {
    this.baseURL = baseURL;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }
  
  generateSignature(method, path, timestamp, body) {
    const crypto = require('crypto');
    
    const canonicalString = [
      method.toUpperCase(),
      path,
      timestamp,
      crypto.createHash('sha256').update(body || '').digest('hex')
    ].join('\\n');
    
    return crypto
      .createHmac('sha256', this.clientSecret)
      .update(canonicalString)
      .digest('hex');
  }
  
  async makeRequest(method, path, data = null) {
    const timestamp = Date.now().toString();
    const body = data ? JSON.stringify(data) : '';
    
    // Generate signature
    const signature = this.generateSignature(
      method,
      path,
      timestamp,
      body
    );
    
    // Make request
    const response = await fetch(\`\${this.baseURL}\${path}\`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Id': this.clientId,
        'X-Timestamp': timestamp,
        'X-Signature': signature
      },
      body: body || undefined
    });
    
    if (!response.ok) {
      throw new Error(\`Request failed: \${response.status}\`);
    }
    
    return response.json();
  }
  
  // Helper methods
  async get(path) {
    return this.makeRequest('GET', path);
  }
  
  async post(path, data) {
    return this.makeRequest('POST', path, data);
  }
  
  async put(path, data) {
    return this.makeRequest('PUT', path, data);
  }
  
  async delete(path) {
    return this.makeRequest('DELETE', path);
  }
}

// Gebruik
const client = new HMACAPIClient(
  'https://api.company.com',
  'client-001',
  'secret-key-for-client-001'
);

// Maak authenticated request
client.post('/api/orders', {
  product: 'Widget',
  quantity: 5,
  price: 99.99
})
.then(response => console.log('Order created:', response))
.catch(error => console.error('Error:', error));
\`\`\`

## 4. API Gateway Patterns

### Wat is een API Gateway?
Een API Gateway is een centraal punt dat alle API requests afhandelt en functies biedt zoals authenticatie, rate limiting, monitoring, en request routing.

### API Gateway implementatie:
\`\`\`javascript
const express = require('express');
const httpProxy = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

class APIGateway {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }
  
  setupMiddleware() {
    // Request logging
    this.app.use((req, res, next) => {
      console.log(\`\${new Date().toISOString()} \${req.method} \${req.path}\`);
      next();
    });
    
    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      next();
    });
    
    // Rate limiting per API key
    this.rateLimiters = new Map();
  }
  
  // Dynamic rate limiter based on API key tier
  getRateLimiter(apiKey) {
    if (!this.rateLimiters.has(apiKey)) {
      const tier = this.getApiKeyTier(apiKey);
      
      const limits = {
        basic: { windowMs: 60000, max: 10 },      // 10 req/min
        standard: { windowMs: 60000, max: 100 },  // 100 req/min
        premium: { windowMs: 60000, max: 1000 }   // 1000 req/min
      };
      
      this.rateLimiters.set(apiKey, rateLimit({
        ...limits[tier],
        keyGenerator: () => apiKey,
        handler: (req, res) => {
          res.status(429).json({
            error: 'Too many requests',
            retryAfter: req.rateLimit.resetTime
          });
        }
      }));
    }
    
    return this.rateLimiters.get(apiKey);
  }
  
  // Authentication middleware
  authenticate() {
    return async (req, res, next) => {
      const apiKey = req.headers['x-api-key'];
      const authHeader = req.headers.authorization;
      
      // API Key authentication
      if (apiKey) {
        const keyInfo = await this.validateApiKey(apiKey);
        if (!keyInfo) {
          return res.status(401).json({ error: 'Invalid API key' });
        }
        
        req.auth = { 
          type: 'apikey', 
          client: keyInfo.clientId,
          tier: keyInfo.tier
        };
        
        // Apply rate limiting
        const limiter = this.getRateLimiter(apiKey);
        return limiter(req, res, next);
      }
      
      // JWT authentication
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          req.auth = { 
            type: 'jwt', 
            userId: decoded.sub,
            role: decoded.role 
          };
          next();
        } catch (error) {
          return res.status(401).json({ error: 'Invalid token' });
        }
      } else {
        return res.status(401).json({ error: 'Authentication required' });
      }
    };
  }
  
  // Request transformation
  transformRequest() {
    return (req, res, next) => {
      // Add gateway headers
      req.headers['x-gateway-timestamp'] = Date.now().toString();
      req.headers['x-gateway-request-id'] = generateRequestId();
      
      // Add auth info to forwarded headers
      if (req.auth) {
        req.headers['x-auth-type'] = req.auth.type;
        req.headers['x-auth-client'] = req.auth.client || req.auth.userId;
      }
      
      next();
    };
  }
  
  // Response transformation
  transformResponse() {
    return (req, res, next) => {
      const originalJson = res.json;
      
      res.json = function(data) {
        // Wrap response in standard format
        const wrappedResponse = {
          success: res.statusCode < 400,
          data: res.statusCode < 400 ? data : undefined,
          error: res.statusCode >= 400 ? data : undefined,
          meta: {
            requestId: req.headers['x-gateway-request-id'],
            timestamp: new Date().toISOString()
          }
        };
        
        originalJson.call(this, wrappedResponse);
      };
      
      next();
    };
  }
  
  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', uptime: process.uptime() });
    });
    
    // Service discovery endpoint
    this.app.get('/services', this.authenticate(), (req, res) => {
      res.json({
        services: [
          { name: 'users', version: 'v1', url: '/api/v1/users' },
          { name: 'orders', version: 'v1', url: '/api/v1/orders' },
          { name: 'products', version: 'v1', url: '/api/v1/products' }
        ]
      });
    });
    
    // Proxy to microservices
    const services = {
      '/api/v1/users': 'http://users-service:3001',
      '/api/v1/orders': 'http://orders-service:3002',
      '/api/v1/products': 'http://products-service:3003'
    };
    
    Object.entries(services).forEach(([path, target]) => {
      this.app.use(path, 
        this.authenticate(),
        this.transformRequest(),
        this.transformResponse(),
        httpProxy.createProxyMiddleware({
          target,
          changeOrigin: true,
          onError: (err, req, res) => {
            console.error(\`Proxy error: \${err.message}\`);
            res.status(503).json({ 
              error: 'Service temporarily unavailable' 
            });
          }
        })
      );
    });
  }
  
  // Circuit breaker pattern
  setupCircuitBreaker() {
    const CircuitBreaker = require('opossum');
    
    this.breakers = new Map();
    
    // Wrap service calls in circuit breaker
    this.callService = (serviceName, requestFn) => {
      if (!this.breakers.has(serviceName)) {
        const options = {
          timeout: 3000,
          errorThresholdPercentage: 50,
          resetTimeout: 30000
        };
        
        const breaker = new CircuitBreaker(requestFn, options);
        
        breaker.on('open', () => {
          console.log(\`Circuit breaker OPEN for \${serviceName}\`);
        });
        
        breaker.on('halfOpen', () => {
          console.log(\`Circuit breaker HALF-OPEN for \${serviceName}\`);
        });
        
        this.breakers.set(serviceName, breaker);
      }
      
      return this.breakers.get(serviceName);
    };
  }
  
  start(port = 3000) {
    this.app.listen(port, () => {
      console.log(\`API Gateway running on port \${port}\`);
    });
  }
}

// Start gateway
const gateway = new APIGateway();
gateway.start();
\`\`\`

## 5. Multi-factor Authentication (MFA)

### MFA implementatie met TOTP:
\`\`\`javascript
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

class MFAService {
  constructor() {
    this.userSecrets = new Map(); // In productie: gebruik database
  }
  
  // Genereer MFA secret voor user
  async setupMFA(userId, userEmail) {
    // Genereer secret
    const secret = speakeasy.generateSecret({
      name: \`MyApp (\${userEmail})\`,
      issuer: 'MyApp',
      length: 32
    });
    
    // Sla secret op
    this.userSecrets.set(userId, {
      secret: secret.base32,
      tempSecret: secret.base32,
      verified: false
    });
    
    // Genereer QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    
    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      manualEntryKey: secret.base32
    };
  }
  
  // Verifieer TOTP token
  verifyToken(userId, token) {
    const userSecret = this.userSecrets.get(userId);
    
    if (!userSecret) {
      return { verified: false, message: 'MFA not setup' };
    }
    
    const verified = speakeasy.totp.verify({
      secret: userSecret.tempSecret || userSecret.secret,
      encoding: 'base32',
      token: token,
      window: 2 // Accepteer tokens van 2 time steps voor/na
    });
    
    if (verified && !userSecret.verified) {
      // Eerste succesvolle verificatie, activeer MFA
      userSecret.verified = true;
      userSecret.secret = userSecret.tempSecret;
      delete userSecret.tempSecret;
    }
    
    return { verified, message: verified ? 'Valid token' : 'Invalid token' };
  }
  
  // Genereer backup codes
  generateBackupCodes(userId) {
    const codes = [];
    
    for (let i = 0; i < 10; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    
    // Hash en sla backup codes op
    const hashedCodes = codes.map(code => 
      crypto.createHash('sha256').update(code).digest('hex')
    );
    
    this.storeBackupCodes(userId, hashedCodes);
    
    return codes; // Return plain codes aan user (eenmalig)
  }
  
  // Complete MFA login flow
  async authenticateWithMFA(email, password, mfaToken) {
    // Stap 1: Valideer email/password
    const user = await this.validateCredentials(email, password);
    
    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }
    
    // Stap 2: Check of MFA enabled
    if (!user.mfaEnabled) {
      // Geen MFA, genereer tokens
      return {
        success: true,
        tokens: this.generateAuthTokens(user),
        mfaRequired: false
      };
    }
    
    // Stap 3: MFA token vereist
    if (!mfaToken) {
      return {
        success: false,
        error: 'MFA token required',
        mfaRequired: true,
        tempToken: this.generateTempToken(user.id)
      };
    }
    
    // Stap 4: Verifieer MFA token
    const mfaResult = this.verifyToken(user.id, mfaToken);
    
    if (!mfaResult.verified) {
      // Check backup code
      const backupValid = await this.verifyBackupCode(user.id, mfaToken);
      
      if (!backupValid) {
        return {
          success: false,
          error: 'Invalid MFA token',
          mfaRequired: true
        };
      }
    }
    
    // Stap 5: MFA succesvol, genereer tokens
    return {
      success: true,
      tokens: this.generateAuthTokens(user),
      mfaRequired: false
    };
  }
}

// Express routes voor MFA
app.post('/api/mfa/setup', authenticate(), async (req, res) => {
  const mfaService = new MFAService();
  const result = await mfaService.setupMFA(req.user.id, req.user.email);
  
  res.json({
    qrCode: result.qrCode,
    secret: result.secret,
    backupCodes: mfaService.generateBackupCodes(req.user.id)
  });
});

app.post('/api/mfa/verify', authenticate(), async (req, res) => {
  const { token } = req.body;
  const mfaService = new MFAService();
  
  const result = mfaService.verifyToken(req.user.id, token);
  
  if (result.verified) {
    // Update user record om MFA te activeren
    await updateUserMFAStatus(req.user.id, true);
  }
  
  res.json(result);
});

app.post('/api/login', async (req, res) => {
  const { email, password, mfaToken } = req.body;
  const mfaService = new MFAService();
  
  const result = await mfaService.authenticateWithMFA(
    email, 
    password, 
    mfaToken
  );
  
  if (result.success) {
    res.json({
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      expiresIn: 3600
    });
  } else {
    res.status(401).json({
      error: result.error,
      mfaRequired: result.mfaRequired,
      tempToken: result.tempToken
    });
  }
});
\`\`\`

## Security best practices samenvatting

### 1. Defense in depth
Combineer meerdere authenticatie methodes:
- API keys voor machine-to-machine
- JWT voor user sessions
- mTLS voor high-security endpoints
- MFA voor gevoelige operaties

### 2. Token lifecycle management
- Korte expiry times voor access tokens (15-60 min)
- Refresh tokens voor langere sessions
- Token revocation mechanismes
- Blacklisting voor compromised tokens

### 3. Monitoring en alerting
- Log alle authentication attempts
- Monitor voor verdachte patronen
- Alert bij security events
- Audit trails voor compliance

### 4. Regular security updates
- Rotate secrets regelmatig
- Update dependencies
- Security audits
- Penetration testing

## Praktijkopdracht

Implementeer een volledig authentication systeem dat:
1. JWT gebruikt voor basis authenticatie
2. HMAC signing toevoegt voor API requests
3. MFA optioneel maakt voor users
4. Een API Gateway pattern gebruikt voor centralized auth
5. Proper logging en monitoring heeft

Test je implementatie met:
- Valid en invalid tokens
- Expired tokens
- MFA flow
- Rate limiting
- Security headers

## Volgende stap

In de volgende les duiken we in OAuth 2.0 en OpenID Connect voor third-party authenticatie en autorisatie.
`,
  codeExamples: [
    {
      id: 'jwt-implementation',
      title: 'Complete JWT authenticatie systeem',
      language: 'javascript',
      code: `// Complete JWT authentication implementation
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

class AuthenticationSystem {
  constructor() {
    this.app = express();
    this.app.use(express.json());
    
    // In-memory storage (gebruik database in productie)
    this.users = new Map();
    this.refreshTokens = new Map();
    this.blacklistedTokens = new Set();
    
    // JWT configuratie
    this.accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || crypto.randomBytes(64).toString('hex');
    this.refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || crypto.randomBytes(64).toString('hex');
    
    this.setupRoutes();
  }
  
  // Genereer tokens
  generateTokens(user) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    };
    
    const accessToken = jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: '15m',
      issuer: 'auth-service',
      audience: 'api-service'
    });
    
    const refreshToken = jwt.sign(
      { sub: user.id }, 
      this.refreshTokenSecret, 
      { expiresIn: '7d' }
    );
    
    // Store refresh token
    this.refreshTokens.set(refreshToken, {
      userId: user.id,
      createdAt: new Date()
    });
    
    return { accessToken, refreshToken };
  }
  
  // Middleware voor token verificatie
  authenticateToken() {
    return (req, res, next) => {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'Access token required' });
      }
      
      // Check blacklist
      if (this.blacklistedTokens.has(token)) {
        return res.status(401).json({ error: 'Token has been revoked' });
      }
      
      jwt.verify(token, this.accessTokenSecret, {
        issuer: 'auth-service',
        audience: 'api-service'
      }, (err, user) => {
        if (err) {
          return res.status(403).json({ error: 'Invalid token' });
        }
        
        req.user = user;
        next();
      });
    };
  }
  
  // Routes
  setupRoutes() {
    // Register
    this.app.post('/auth/register', async (req, res) => {
      const { email, password, name } = req.body;
      
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }
      
      // Check existing user
      if (this.users.has(email)) {
        return res.status(409).json({ error: 'User already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = {
        id: crypto.randomUUID(),
        email,
        password: hashedPassword,
        name,
        role: 'user',
        permissions: ['read:own_profile'],
        createdAt: new Date()
      };
      
      this.users.set(email, user);
      
      // Generate tokens
      const tokens = this.generateTokens(user);
      
      res.status(201).json({
        message: 'User created successfully',
        ...tokens,
        expiresIn: 900 // 15 minutes
      });
    });
    
    // Login
    this.app.post('/auth/login', async (req, res) => {
      const { email, password } = req.body;
      
      // Find user
      const user = this.users.get(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Generate tokens
      const tokens = this.generateTokens(user);
      
      res.json({
        ...tokens,
        expiresIn: 900
      });
    });
    
    // Refresh token
    this.app.post('/auth/refresh', (req, res) => {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token required' });
      }
      
      // Check if refresh token exists
      const tokenData = this.refreshTokens.get(refreshToken);
      if (!tokenData) {
        return res.status(403).json({ error: 'Invalid refresh token' });
      }
      
      // Verify refresh token
      jwt.verify(refreshToken, this.refreshTokenSecret, (err, decoded) => {
        if (err) {
          this.refreshTokens.delete(refreshToken);
          return res.status(403).json({ error: 'Invalid refresh token' });
        }
        
        // Find user
        const user = Array.from(this.users.values())
          .find(u => u.id === decoded.sub);
        
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        // Delete old refresh token
        this.refreshTokens.delete(refreshToken);
        
        // Generate new tokens
        const tokens = this.generateTokens(user);
        
        res.json({
          ...tokens,
          expiresIn: 900
        });
      });
    });
    
    // Logout
    this.app.post('/auth/logout', this.authenticateToken(), (req, res) => {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      // Add token to blacklist
      this.blacklistedTokens.add(token);
      
      // Remove associated refresh tokens
      for (const [refreshToken, data] of this.refreshTokens.entries()) {
        if (data.userId === req.user.sub) {
          this.refreshTokens.delete(refreshToken);
        }
      }
      
      res.json({ message: 'Logged out successfully' });
    });
    
    // Protected route example
    this.app.get('/api/profile', this.authenticateToken(), (req, res) => {
      const user = Array.from(this.users.values())
        .find(u => u.id === req.user.sub);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions
      });
    });
    
    // Role-based access control
    this.app.get('/api/admin', 
      this.authenticateToken(), 
      this.requireRole('admin'), 
      (req, res) => {
        res.json({ message: 'Admin access granted' });
      }
    );
  }
  
  // Role checking middleware
  requireRole(role) {
    return (req, res, next) => {
      if (req.user.role !== role) {
        return res.status(403).json({ 
          error: 'Insufficient permissions' 
        });
      }
      next();
    };
  }
  
  // Permission checking middleware
  requirePermission(permission) {
    return (req, res, next) => {
      if (!req.user.permissions.includes(permission)) {
        return res.status(403).json({ 
          error: 'Missing required permission' 
        });
      }
      next();
    };
  }
  
  // Start server
  start(port = 3000) {
    this.app.listen(port, () => {
      console.log(\`Auth service running on port \${port}\`);
    });
  }
}

// Start the authentication system
const authSystem = new AuthenticationSystem();
authSystem.start();

// Client-side usage example
class AuthClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }
  
  async login(email, password) {
    const response = await fetch(\`\${this.baseURL}/auth/login\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    const data = await response.json();
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
    
    // Store tokens
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    
    // Setup auto refresh
    this.scheduleTokenRefresh(data.expiresIn);
    
    return data;
  }
  
  async makeAuthenticatedRequest(endpoint, options = {}) {
    const response = await fetch(\`\${this.baseURL}\${endpoint}\`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': \`Bearer \${this.accessToken}\`
      }
    });
    
    if (response.status === 401) {
      // Try to refresh token
      await this.refreshAccessToken();
      // Retry request
      return this.makeAuthenticatedRequest(endpoint, options);
    }
    
    return response;
  }
  
  scheduleTokenRefresh(expiresIn) {
    // Refresh 1 minute before expiry
    const refreshTime = (expiresIn - 60) * 1000;
    
    setTimeout(() => {
      this.refreshAccessToken();
    }, refreshTime);
  }
}`,
      explanation: 'Dit is een complete JWT implementatie met registratie, login, token refresh, logout, en role-based access control. Het systeem gebruikt access tokens voor korte authenticatie en refresh tokens voor langere sessions.'
    },
    {
      id: 'api-gateway-complete',
      title: 'Enterprise API Gateway met alle auth methodes',
      language: 'javascript',
      code: `// Enterprise-grade API Gateway implementation
const express = require('express');
const httpProxy = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

class EnterpriseAPIGateway {
  constructor() {
    this.app = express();
    this.setupSecurityMiddleware();
    this.setupAuthStrategies();
    this.setupRouting();
    this.setupMonitoring();
  }
  
  setupSecurityMiddleware() {
    // Security headers
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }));
    
    // CORS configuration
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
      exposedHeaders: ['X-RateLimit-Remaining', 'X-RateLimit-Reset']
    }));
    
    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Request ID middleware
    this.app.use((req, res, next) => {
      req.id = req.headers['x-request-id'] || crypto.randomUUID();
      res.setHeader('X-Request-ID', req.id);
      next();
    });
  }
  
  setupAuthStrategies() {
    this.authStrategies = {
      // API Key authentication
      apiKey: async (req) => {
        const apiKey = req.headers['x-api-key'];
        if (!apiKey) return null;
        
        // Lookup API key in database
        const keyInfo = await this.validateApiKey(apiKey);
        if (!keyInfo) return null;
        
        return {
          type: 'apiKey',
          clientId: keyInfo.clientId,
          tier: keyInfo.tier,
          rateLimit: keyInfo.rateLimit
        };
      },
      
      // JWT Bearer token
      jwt: async (req) => {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) return null;
        
        const token = authHeader.substring(7);
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          return {
            type: 'jwt',
            userId: decoded.sub,
            email: decoded.email,
            role: decoded.role,
            permissions: decoded.permissions
          };
        } catch (error) {
          return null;
        }
      },
      
      // HMAC signature
      hmac: async (req) => {
        const clientId = req.headers['x-client-id'];
        const timestamp = req.headers['x-timestamp'];
        const signature = req.headers['x-signature'];
        
        if (!clientId || !timestamp || !signature) return null;
        
        // Validate timestamp freshness
        const now = Date.now();
        const requestTime = parseInt(timestamp);
        if (Math.abs(now - requestTime) > 300000) return null; // 5 min window
        
        // Get client secret
        const secret = await this.getClientSecret(clientId);
        if (!secret) return null;
        
        // Verify signature
        const expectedSig = this.generateHMACSignature(req, secret);
        if (!crypto.timingSafeEqual(
          Buffer.from(signature, 'hex'),
          Buffer.from(expectedSig, 'hex')
        )) return null;
        
        return {
          type: 'hmac',
          clientId,
          tier: 'premium'
        };
      },
      
      // mTLS client certificate
      mtls: async (req) => {
        const cert = req.socket.getPeerCertificate();
        
        if (!cert || !req.client.authorized) return null;
        
        // Validate certificate
        const subject = cert.subject;
        if (!this.isValidClientCert(subject)) return null;
        
        return {
          type: 'mtls',
          clientId: subject.CN,
          organization: subject.O,
          tier: 'enterprise'
        };
      }
    };
  }
  
  // Unified authentication middleware
  authenticate() {
    return async (req, res, next) => {
      let authInfo = null;
      
      // Try auth strategies in order of preference
      const strategies = ['mtls', 'jwt', 'hmac', 'apiKey'];
      
      for (const strategy of strategies) {
        authInfo = await this.authStrategies[strategy](req);
        if (authInfo) break;
      }
      
      if (!authInfo) {
        return res.status(401).json({
          error: 'Authentication required',
          supportedMethods: ['Bearer token', 'API Key', 'HMAC', 'mTLS']
        });
      }
      
      // Attach auth info to request
      req.auth = authInfo;
      
      // Apply rate limiting based on tier
      const limiter = this.getRateLimiter(authInfo.tier);
      limiter(req, res, next);
    };
  }
  
  getRateLimiter(tier) {
    const limits = {
      basic: { windowMs: 60000, max: 60 },        // 60 req/min
      standard: { windowMs: 60000, max: 600 },    // 600 req/min
      premium: { windowMs: 60000, max: 6000 },    // 6000 req/min
      enterprise: { windowMs: 60000, max: 60000 } // 60000 req/min
    };
    
    return rateLimit({
      ...limits[tier] || limits.basic,
      keyGenerator: (req) => req.auth.clientId || req.auth.userId,
      skip: (req) => req.auth.tier === 'unlimited',
      handler: (req, res) => {
        res.status(429).json({
          error: 'Too many requests',
          retryAfter: req.rateLimit.resetTime,
          limit: req.rateLimit.limit,
          tier: req.auth.tier
        });
      }
    });
  }
  
  setupRouting() {
    // Service registry
    this.services = {
      users: {
        path: '/api/v1/users',
        target: process.env.USERS_SERVICE_URL || 'http://users:3001',
        requiredAuth: ['jwt', 'hmac', 'mtls'],
        requiredPermissions: ['users:read']
      },
      orders: {
        path: '/api/v1/orders',
        target: process.env.ORDERS_SERVICE_URL || 'http://orders:3002',
        requiredAuth: ['jwt', 'hmac', 'mtls'],
        requiredPermissions: ['orders:read']
      },
      payments: {
        path: '/api/v1/payments',
        target: process.env.PAYMENTS_SERVICE_URL || 'http://payments:3003',
        requiredAuth: ['mtls'], // Only mTLS for payments
        requiredPermissions: ['payments:process']
      },
      public: {
        path: '/api/v1/public',
        target: process.env.PUBLIC_SERVICE_URL || 'http://public:3004',
        requiredAuth: ['apiKey', 'jwt', 'hmac', 'mtls']
      }
    };
    
    // Setup routes for each service
    Object.entries(this.services).forEach(([name, config]) => {
      this.app.use(config.path,
        this.authenticate(),
        this.checkAuthMethod(config.requiredAuth),
        this.checkPermissions(config.requiredPermissions),
        this.transformRequest(),
        this.createProxy(name, config.target)
      );
    });
    
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      const healthChecks = this.performHealthChecks();
      const healthy = Object.values(healthChecks).every(h => h.status === 'healthy');
      
      res.status(healthy ? 200 : 503).json({
        status: healthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        services: healthChecks,
        uptime: process.uptime()
      });
    });
    
    // Metrics endpoint
    this.app.get('/metrics', this.authenticate(), (req, res) => {
      res.json({
        requests: this.metrics.requests,
        errors: this.metrics.errors,
        latency: this.metrics.latency,
        activeConnections: this.metrics.activeConnections
      });
    });
  }
  
  checkAuthMethod(allowedMethods) {
    return (req, res, next) => {
      if (!allowedMethods.includes(req.auth.type)) {
        return res.status(403).json({
          error: 'Authentication method not allowed for this endpoint',
          allowedMethods,
          usedMethod: req.auth.type
        });
      }
      next();
    };
  }
  
  checkPermissions(requiredPermissions) {
    return (req, res, next) => {
      if (!requiredPermissions || requiredPermissions.length === 0) {
        return next();
      }
      
      const userPermissions = req.auth.permissions || [];
      const hasPermission = requiredPermissions.some(perm => 
        userPermissions.includes(perm) || 
        userPermissions.includes('*') ||
        req.auth.tier === 'enterprise'
      );
      
      if (!hasPermission) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          required: requiredPermissions,
          provided: userPermissions
        });
      }
      
      next();
    };
  }
  
  transformRequest() {
    return (req, res, next) => {
      // Add gateway headers
      req.headers['x-gateway-request-id'] = req.id;
      req.headers['x-gateway-timestamp'] = Date.now().toString();
      req.headers['x-gateway-auth-type'] = req.auth.type;
      req.headers['x-gateway-client-id'] = req.auth.clientId || req.auth.userId;
      
      // Remove sensitive headers before forwarding
      delete req.headers['x-api-key'];
      delete req.headers['authorization'];
      
      next();
    };
  }
  
  createProxy(serviceName, target) {
    const CircuitBreaker = require('opossum');
    
    // Create circuit breaker for the service
    const breaker = new CircuitBreaker(
      async (req, res) => {
        return new Promise((resolve, reject) => {
          const proxy = httpProxy.createProxyMiddleware({
            target,
            changeOrigin: true,
            timeout: 30000,
            proxyTimeout: 30000,
            onProxyReq: (proxyReq, req) => {
              // Log outgoing request
              this.logger.info('Proxying request', {
                service: serviceName,
                method: req.method,
                path: req.path,
                requestId: req.id
              });
            },
            onProxyRes: (proxyRes, req, res) => {
              // Add response headers
              proxyRes.headers['x-served-by'] = serviceName;
              proxyRes.headers['x-response-time'] = Date.now() - req.startTime;
              
              // Log response
              this.logger.info('Proxy response', {
                service: serviceName,
                status: proxyRes.statusCode,
                requestId: req.id
              });
              
              resolve();
            },
            onError: (err, req, res) => {
              this.logger.error('Proxy error', {
                service: serviceName,
                error: err.message,
                requestId: req.id
              });
              
              reject(err);
            }
          });
          
          proxy(req, res);
        });
      },
      {
        timeout: 30000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        rollingCountTimeout: 10000,
        rollingCountBuckets: 10,
        name: serviceName
      }
    );
    
    // Circuit breaker events
    breaker.on('open', () => {
      this.logger.warn(\`Circuit breaker OPEN for \${serviceName}\`);
      this.metrics.circuitBreakerOpen[serviceName] = true;
    });
    
    breaker.on('halfOpen', () => {
      this.logger.info(\`Circuit breaker HALF-OPEN for \${serviceName}\`);
    });
    
    breaker.on('close', () => {
      this.logger.info(\`Circuit breaker CLOSED for \${serviceName}\`);
      this.metrics.circuitBreakerOpen[serviceName] = false;
    });
    
    return async (req, res, next) => {
      req.startTime = Date.now();
      
      try {
        await breaker.fire(req, res);
      } catch (error) {
        // Circuit breaker open or request failed
        res.status(503).json({
          error: 'Service temporarily unavailable',
          service: serviceName,
          retryAfter: 30
        });
      }
    };
  }
  
  setupMonitoring() {
    this.metrics = {
      requests: 0,
      errors: 0,
      latency: [],
      activeConnections: 0,
      circuitBreakerOpen: {}
    };
    
    this.logger = require('winston').createLogger({
      level: 'info',
      format: require('winston').format.json(),
      transports: [
        new require('winston').transports.Console(),
        new require('winston').transports.File({ 
          filename: 'gateway.log' 
        })
      ]
    });
    
    // Request tracking
    this.app.use((req, res, next) => {
      this.metrics.requests++;
      this.metrics.activeConnections++;
      
      const startTime = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        this.metrics.latency.push(duration);
        this.metrics.activeConnections--;
        
        if (res.statusCode >= 400) {
          this.metrics.errors++;
        }
        
        // Keep only last 1000 latency measurements
        if (this.metrics.latency.length > 1000) {
          this.metrics.latency.shift();
        }
      });
      
      next();
    });
  }
  
  performHealthChecks() {
    const checks = {};
    
    Object.entries(this.services).forEach(([name, config]) => {
      checks[name] = {
        status: this.metrics.circuitBreakerOpen[name] ? 'unhealthy' : 'healthy',
        circuitBreaker: this.metrics.circuitBreakerOpen[name] ? 'open' : 'closed'
      };
    });
    
    return checks;
  }
  
  generateHMACSignature(req, secret) {
    const canonicalString = [
      req.method.toUpperCase(),
      req.originalUrl,
      req.headers['x-timestamp'],
      crypto.createHash('sha256').update(JSON.stringify(req.body) || '').digest('hex')
    ].join('\\n');
    
    return crypto
      .createHmac('sha256', secret)
      .update(canonicalString)
      .digest('hex');
  }
  
  start(port = 3000) {
    this.app.listen(port, () => {
      this.logger.info(\`API Gateway started on port \${port}\`);
    });
  }
}

// Start the gateway
const gateway = new EnterpriseAPIGateway();
gateway.start();`,
      explanation: 'Dit is een complete enterprise API Gateway implementatie die alle behandelde authenticatie methodes ondersteunt: API keys, JWT, HMAC signing, en mTLS. Het bevat ook circuit breakers, rate limiting, monitoring, en health checks.'
    }
  ],
  assignments: [
    {
      id: 'implement-jwt-system',
      title: 'Implementeer een JWT authenticatie systeem',
      description: 'Bouw een complete JWT-based authenticatie systeem met login, logout, token refresh, en protected routes. Implementeer ook role-based access control.',
      difficulty: 'hard',
      type: 'project',
      hints: [
        'Gebruik separate secrets voor access en refresh tokens',
        'Implementeer token blacklisting voor logout',
        'Voeg expiry times toe aan tokens',
        'Test met expired en invalid tokens'
      ]
    },
    {
      id: 'setup-mtls',
      title: 'Configureer mTLS voor een API',
      description: 'Zet een mTLS verbinding op tussen een client en server. Genereer de benodigde certificaten en test de wederzijdse authenticatie.',
      difficulty: 'hard',
      type: 'project',
      hints: [
        'Gebruik OpenSSL voor certificaat generatie',
        'Test eerst met self-signed certificates',
        'Verifieer client certificaat details op de server',
        'Implementeer certificate pinning voor extra security'
      ]
    },
    {
      id: 'build-api-gateway',
      title: 'Bouw een API Gateway met multiple auth',
      description: 'Creëer een API Gateway die meerdere authenticatie methodes ondersteunt (API key, JWT, HMAC) en requests doorstuurt naar backend services.',
      difficulty: 'expert',
      type: 'project',
      hints: [
        'Begin met één authenticatie methode',
        'Voeg rate limiting toe per client',
        'Implementeer request/response transformatie',
        'Voeg circuit breaker pattern toe voor resilience'
      ]
    }
  ],
  resources: [
    {
      title: 'JWT.io - JWT Debugger en Libraries',
      url: 'https://jwt.io',
      type: 'tool'
    },
    {
      title: 'OAuth 2.0 Specification',
      url: 'https://oauth.net/2/',
      type: 'specification'
    },
    {
      title: 'Let\'s Encrypt - Gratis SSL Certificaten',
      url: 'https://letsencrypt.org',
      type: 'tool'
    },
    {
      title: 'OWASP API Security Top 10',
      url: 'https://owasp.org/www-project-api-security/',
      type: 'guide'
    },
    {
      title: 'Kong API Gateway',
      url: 'https://konghq.com',
      type: 'tool'
    },
    {
      title: 'Express Gateway',
      url: 'https://www.express-gateway.io',
      type: 'tool'
    }
  ]
};