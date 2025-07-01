import type { Lesson, CodeExample, Assignment } from '@/lib/data/courses';

export const lesson1_3: Lesson = {
  id: 'lesson-3',
  title: 'Webhook security basics',
  duration: '30 min',
  content: `
## Webhook Security Basics

In deze les leer je hoe je webhooks veilig implementeert en beschermt tegen aanvallen. We behandelen essentiële security maatregelen die elke webhook implementatie moet hebben.

### Wat gaan we behandelen?

1. Signature verificatie
2. IP whitelisting  
3. HTTPS requirements
4. Replay attack preventie
5. Secret management

### 1. Waarom webhook security belangrijk is

Webhooks ontvangen data van externe systemen, waardoor ze kwetsbaar zijn voor aanvallen. Zonder goede beveiliging kan iedereen nepdata naar je webhook sturen.

**Belangrijke risico's:**
- **Data integriteit**: Aanvallers kunnen valse data sturen
- **Authenticatie**: Ongeautoriseerde toegang tot je systeem
- **Replay attacks**: Oude requests opnieuw versturen

### 2. Signature verificatie

De meeste webhook providers gebruiken cryptografische handtekeningen om de authenticiteit van requests te garanderen. Dit werkt met een gedeeld geheim (secret) dat gebruikt wordt om een hash te maken van de request body.

#### Hoe werkt HMAC-SHA256?

1. Provider berekent hash van payload + secret
2. Hash wordt meegestuurd in header
3. Jij berekent dezelfde hash
4. Vergelijk hashes - match = authentiek

#### Implementatie voorbeeld:

\`\`\`javascript
// Express.js webhook met signature verificatie
const express = require('express');
const crypto = require('crypto');
const app = express();

// Middleware voor raw body (nodig voor signature verificatie)
app.use(express.raw({ type: 'application/json' }));

// Webhook secret (uit environment variable)
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

function verifySignature(payload, signature, secret) {
  // Bereken de verwachte signature
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  // Gebruik timingSafeEqual om timing attacks te voorkomen
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');
  const receivedBuffer = Buffer.from(signature, 'hex');
  
  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

app.post('/webhook', (req, res) => {
  // Haal signature uit header
  const signature = req.headers['x-webhook-signature'];
  
  if (!signature) {
    return res.status(401).json({ error: 'No signature provided' });
  }
  
  // Verifieer signature
  const isValid = verifySignature(req.body, signature, WEBHOOK_SECRET);
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Parse JSON na verificatie
  const data = JSON.parse(req.body.toString());
  
  // Verwerk webhook data
  console.log('Valid webhook received:', data);
  
  res.status(200).json({ success: true });
});

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
\`\`\`

**Belangrijke details:**
- Gebruik altijd \`crypto.timingSafeEqual\` voor vergelijking
- Verifieer signature VOOR JSON parsing
- Bewaar raw body voor verificatie

### 3. IP whitelisting

Accepteer alleen webhook requests van bekende IP-adressen van de service provider. Dit voegt een extra beveiligingslaag toe naast signature verificatie.

#### Implementatie met dynamische IP lijst:

\`\`\`javascript
// IP whitelisting middleware
const ALLOWED_IPS = [
  '192.168.1.100',
  '203.0.113.0/24', // CIDR range
  '::1' // IPv6 localhost
];

const ipRangeCheck = require('ip-range-check');

function ipWhitelistMiddleware(req, res, next) {
  // Haal client IP op (rekening houdend met proxies)
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() 
    || req.connection.remoteAddress;
  
  // Check of IP in whitelist staat
  if (!ipRangeCheck(clientIp, ALLOWED_IPS)) {
    console.log(\`Blocked request from unauthorized IP: \${clientIp}\`);
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  next();
}

// Gebruik middleware voor webhook endpoint
app.post('/webhook', ipWhitelistMiddleware, (req, res) => {
  // Webhook logic hier
});

// Dynamische IP whitelist met provider API
async function updateAllowedIPs() {
  try {
    // Haal actuele IP lijst op van provider
    const response = await fetch('https://api.provider.com/webhook-ips');
    const data = await response.json();
    
    // Update allowed IPs
    ALLOWED_IPS.length = 0;
    ALLOWED_IPS.push(...data.ip_addresses);
    
    console.log('Updated webhook IP whitelist:', ALLOWED_IPS);
  } catch (error) {
    console.error('Failed to update IP whitelist:', error);
  }
}

// Update IP lijst elke 24 uur
setInterval(updateAllowedIPs, 24 * 60 * 60 * 1000);
updateAllowedIPs(); // Initial load
\`\`\`

**Pro tips:**
- Veel providers publiceren hun webhook IP ranges
- Update regelmatig de IP lijst
- Combineer altijd met signature verificatie

### 4. HTTPS requirements

Gebruik ALTIJD HTTPS voor je webhook endpoints. Dit zorgt voor encryptie tijdens transport en voorkomt man-in-the-middle aanvallen.

**Waarom HTTPS essentieel is:**
- **Encryptie**: Data kan niet onderschept worden
- **Integriteit**: Data kan niet aangepast worden onderweg  
- **Authenticatie**: Zekerheid over server identiteit

**SSL/TLS setup checklist:**
- ✓ Geldig SSL certificaat (Let's Encrypt is gratis)
- ✓ Force HTTPS redirects
- ✓ Disable oude TLS versies (< 1.2)
- ✓ Gebruik sterke cipher suites
- ✓ Enable HSTS headers

### 5. Replay attack preventie

Voorkom dat aanvallers oude webhook requests opnieuw kunnen versturen door timestamps en request IDs te controleren.

#### Complete replay preventie implementatie:

\`\`\`javascript
// Replay attack preventie
const processedRequests = new Map();

// Cleanup oude entries elke 5 minuten
setInterval(() => {
  const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
  for (const [id, timestamp] of processedRequests.entries()) {
    if (timestamp < fiveMinutesAgo) {
      processedRequests.delete(id);
    }
  }
}, 5 * 60 * 1000);

function validateTimestamp(timestamp, maxAgeSeconds = 300) {
  const requestTime = parseInt(timestamp);
  const currentTime = Math.floor(Date.now() / 1000);
  
  // Check of timestamp geldig is
  if (isNaN(requestTime)) {
    return false;
  }
  
  // Check of request niet te oud is
  const age = currentTime - requestTime;
  if (age > maxAgeSeconds) {
    return false;
  }
  
  // Check of timestamp niet in de toekomst ligt
  if (requestTime > currentTime + 60) { // 60 sec tolerance
    return false;
  }
  
  return true;
}

app.post('/webhook', async (req, res) => {
  // Headers van webhook provider
  const requestId = req.headers['x-webhook-id'];
  const timestamp = req.headers['x-webhook-timestamp'];
  const signature = req.headers['x-webhook-signature'];
  
  // Valideer timestamp
  if (!validateTimestamp(timestamp)) {
    return res.status(401).json({ 
      error: 'Invalid or expired timestamp' 
    });
  }
  
  // Check voor replay
  if (processedRequests.has(requestId)) {
    return res.status(409).json({ 
      error: 'Duplicate request' 
    });
  }
  
  // Verifieer signature (inclusief timestamp)
  const payload = \`\${timestamp}.\${req.body}\`;
  const isValid = verifySignature(payload, signature, WEBHOOK_SECRET);
  
  if (!isValid) {
    return res.status(401).json({ 
      error: 'Invalid signature' 
    });
  }
  
  // Markeer request als verwerkt
  processedRequests.set(requestId, Date.now());
  
  // Verwerk webhook
  const data = JSON.parse(req.body.toString());
  await processWebhook(data);
  
  res.status(200).json({ success: true });
});
\`\`\`

### 6. Secret management

Bewaar webhook secrets veilig en roteer ze regelmatig. Gebruik environment variables en secret management tools.

#### Best practices voor secret management:

\`\`\`javascript
// Environment-based secret management
require('dotenv').config();

// Secret rotatie implementatie
class WebhookSecretManager {
  constructor() {
    this.secrets = new Map();
    this.loadSecrets();
  }
  
  loadSecrets() {
    // Laad actieve secret
    this.secrets.set('current', {
      value: process.env.WEBHOOK_SECRET_CURRENT,
      createdAt: new Date(process.env.WEBHOOK_SECRET_CURRENT_DATE)
    });
    
    // Laad vorige secret (voor grace period tijdens rotatie)
    if (process.env.WEBHOOK_SECRET_PREVIOUS) {
      this.secrets.set('previous', {
        value: process.env.WEBHOOK_SECRET_PREVIOUS,
        createdAt: new Date(process.env.WEBHOOK_SECRET_PREVIOUS_DATE)
      });
    }
  }
  
  verifyWithAnySecret(payload, signature) {
    // Probeer eerst current secret
    if (verifySignature(payload, signature, this.secrets.get('current').value)) {
      return true;
    }
    
    // Probeer previous secret (grace period)
    const previous = this.secrets.get('previous');
    if (previous) {
      const gracePeriodHours = 24;
      const gracePeriodEnd = new Date(previous.createdAt);
      gracePeriodEnd.setHours(gracePeriodEnd.getHours() + gracePeriodHours);
      
      if (new Date() < gracePeriodEnd) {
        return verifySignature(payload, signature, previous.value);
      } else {
        // Grace period verlopen, verwijder oude secret
        this.secrets.delete('previous');
      }
    }
    
    return false;
  }
  
  async rotateSecret() {
    // Genereer nieuw secret
    const newSecret = crypto.randomBytes(32).toString('hex');
    
    // Update secrets
    const current = this.secrets.get('current');
    this.secrets.set('previous', current);
    this.secrets.set('current', {
      value: newSecret,
      createdAt: new Date()
    });
    
    // Update webhook provider
    await this.updateProviderSecret(newSecret);
    
    // Sla op in secure storage (bijv. AWS Secrets Manager)
    await this.saveToSecureStorage();
    
    console.log('Webhook secret rotated successfully');
  }
  
  async updateProviderSecret(newSecret) {
    // API call naar webhook provider
    const response = await fetch('https://api.provider.com/webhooks/secret', {
      method: 'PUT',
      headers: {
        'Authorization': \`Bearer \${process.env.PROVIDER_API_KEY}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ secret: newSecret })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update provider secret');
    }
  }
  
  async saveToSecureStorage() {
    // Voorbeeld: AWS Secrets Manager
    const AWS = require('aws-sdk');
    const secretsManager = new AWS.SecretsManager();
    
    await secretsManager.putSecretValue({
      SecretId: 'webhook-secrets',
      SecretString: JSON.stringify({
        current: {
          value: this.secrets.get('current').value,
          createdAt: this.secrets.get('current').createdAt
        },
        previous: this.secrets.get('previous') ? {
          value: this.secrets.get('previous').value,
          createdAt: this.secrets.get('previous').createdAt
        } : null
      })
    }).promise();
  }
}

// Gebruik in webhook handler
const secretManager = new WebhookSecretManager();

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  
  if (!secretManager.verifyWithAnySecret(req.body, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Verwerk webhook
  res.status(200).json({ success: true });
});

// Automatische secret rotatie elke 30 dagen
setInterval(() => {
  secretManager.rotateSecret().catch(console.error);
}, 30 * 24 * 60 * 60 * 1000);
\`\`\`

### Security checklist

Voor elke webhook implementatie:

**Minimale beveiliging:**
- [ ] HTTPS endpoint
- [ ] Signature verificatie
- [ ] Proper error handling
- [ ] Logging van alle requests

**Aanbevolen beveiliging:**
- [ ] IP whitelisting
- [ ] Timestamp validatie
- [ ] Request ID tracking
- [ ] Rate limiting

**Enterprise beveiliging:**
- [ ] Secret rotation
- [ ] Multi-region redundancy
- [ ] Audit logging
- [ ] Security monitoring

### Praktijkopdracht

Implementeer een volledig beveiligde webhook receiver:

1. **Setup basis webhook** met Express.js
2. **Voeg signature verificatie toe** met HMAC-SHA256
3. **Implementeer IP whitelisting** voor extra beveiliging
4. **Voeg replay preventie toe** met timestamps en request IDs
5. **Test security** met verschillende attack scenarios

**Test scenarios:**
- Verstuur request zonder signature
- Verstuur request met verkeerde signature
- Verstuur oud request opnieuw (replay)
- Verstuur vanaf onbekend IP adres

### Pro tips

1. **Defense in depth**: Gebruik meerdere security lagen
2. **Fail secure**: Bij twijfel, weiger de request
3. **Monitor alles**: Log security events voor analyse
4. **Stay updated**: Volg security best practices van je provider
5. **Test regelmatig**: Voer security audits uit

### Common pitfalls

**Vermijd deze fouten:**
- String comparison voor signatures (timing attacks!)
- Secrets hardcoded in code
- HTTP in plaats van HTTPS
- Geen request validation
- Te generieke error messages

### Volgende stap

In de volgende les leren we over best practices voor webhook implementaties en error handling strategies.
`
};