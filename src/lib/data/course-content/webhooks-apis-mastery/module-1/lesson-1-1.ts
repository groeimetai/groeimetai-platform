import type { Lesson, CodeExample, Assignment } from '@/lib/data/courses';

export const lesson1_1: Lesson = {
  id: 'wat-zijn-webhooks',
  title: 'Wat zijn webhooks en waarom zijn ze belangrijk?',
  duration: '25 min',
  content: `
# Wat zijn webhooks en waarom zijn ze belangrijk?

## Introductie

In de wereld van moderne software-integraties zijn webhooks een onmisbaar concept geworden. In deze les leer je wat webhooks zijn, hoe ze verschillen van traditionele APIs, en waarom ze zo belangrijk zijn voor het bouwen van real-time applicaties.

## Wat is een webhook?

Een webhook is een **HTTP callback** - een simpele manier voor één applicatie om automatisch informatie naar een andere applicatie te sturen wanneer er iets gebeurt. 

### Visuele representatie van webhooks

\`\`\`
┌─────────────────┐                    ┌─────────────────┐
│   Bron App      │  Gebeurtenis       │   Jouw App      │
│  (bijv. Stripe) │  ───────────>      │   (Ontvanger)   │
│                 │  HTTP POST         │                 │
│  ┌───────────┐  │                    │  ┌───────────┐  │
│  │ Event:    │  │  Webhook URL:      │  │ Verwerk   │  │
│  │ Payment   │  │  yourapp.com/      │  │ Event     │  │
│  │ Success   │  │  webhooks/stripe   │  │           │  │
│  └───────────┘  │                    │  └───────────┘  │
└─────────────────┘                    └─────────────────┘
\`\`\`

### Analogie uit het dagelijks leven

Stel je voor dat je een pakketje verwacht:
- **API (Pull)**: Je moet steeds naar het raam lopen om te kijken of de bezorger er al is
- **Webhook (Push)**: De bezorger belt aan wanneer hij er is - je wordt automatisch geïnformeerd

## Push vs Pull Architectures

### Pull Architecture (Traditionele API polling)

\`\`\`
┌─────────────────┐                    ┌─────────────────┐
│   Jouw App      │  "Zijn er updates?"│   Externe API   │
│                 │  ───────────>      │                 │
│                 │  GET /api/status   │                 │
│                 │  <───────────      │                 │
│                 │  "Nee"             │                 │
│                 │                    │                 │
│                 │  ...wacht 30 sec...│                 │
│                 │                    │                 │
│                 │  "Zijn er updates?"│                 │
│                 │  ───────────>      │                 │
│                 │  GET /api/status   │                 │
│                 │  <───────────      │                 │
│                 │  "Ja! Nieuwe data" │                 │
└─────────────────┘                    └─────────────────┘
\`\`\`

**Nadelen van polling:**
- 🔄 Verspilling van resources (veel onnodige requests)
- ⏱️ Vertraging (je moet wachten tot de volgende poll)
- 💰 Hogere kosten (API rate limits)
- 🔌 Constante serverbelasting

### Push Architecture (Webhooks)

\`\`\`
┌─────────────────┐                    ┌─────────────────┐
│   Externe App   │  Event gebeurt!    │   Jouw App      │
│                 │  ───────────>      │                 │
│                 │  POST /webhook     │                 │
│                 │  {                 │                 │
│                 │    "event": "...", │                 │
│                 │    "data": {...}   │                 │
│                 │  }                 │                 │
└─────────────────┘                    └─────────────────┘
\`\`\`

**Voordelen van webhooks:**
- ⚡ Real-time updates
- 🎯 Efficiënt (alleen verkeer bij events)
- 💸 Kosteneffectief
- 🚀 Schaalbaarder

## Real-world use cases

### 1. E-commerce & Betalingen
**Stripe webhook voorbeeld:**
\`\`\`javascript
// Wanneer een klant betaalt, stuurt Stripe een webhook
{
  "id": "evt_1N3K4...",
  "object": "event",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_1N3K4...",
      "amount": 2000,  // €20,00
      "currency": "eur",
      "customer": "cus_N3K4..."
    }
  }
}
\`\`\`

### 2. Continuous Integration/Deployment
**GitHub webhook voorbeeld:**
\`\`\`javascript
// Bij een nieuwe push naar main branch
{
  "ref": "refs/heads/main",
  "before": "a84d88e...",
  "after": "0d1a26e...",
  "pusher": {
    "name": "developer",
    "email": "dev@company.com"
  },
  "commits": [...]
}
\`\`\`

### 3. Customer Support
**Intercom webhook:**
- Nieuwe conversatie gestart
- Klant heeft gereageerd
- Ticket toegewezen aan agent

### 4. Marketing Automation
**Mailchimp webhook:**
- Nieuwsbrief geopend
- Link geklikt
- Uitgeschreven van lijst

### 5. Social Media Monitoring
**Twitter/X webhook:**
- Nieuwe mention van je merk
- Nieuwe follower
- Direct message ontvangen

## Benefits van webhooks

### ✅ Voordelen

1. **Real-time communicatie**
   - Onmiddellijke updates zonder vertraging
   - Perfect voor tijdkritische processen

2. **Resource-efficiënt**
   - Geen onnodige API calls
   - Lagere serverbelasting

3. **Event-driven architectuur**
   - Natuurlijke flow voor moderne applicaties
   - Makkelijk te begrijpen en implementeren

4. **Schaalbaarheid**
   - Groeit mee met je applicatie
   - Geen polling-bottlenecks

5. **Kostenbesparend**
   - Minder API calls = lagere kosten
   - Efficiënter gebruik van resources

### ❌ Beperkingen

1. **Complexiteit in error handling**
   - Wat als de webhook faalt?
   - Retry mechanismes nodig

2. **Security uitdagingen**
   - Webhook endpoints zijn publiek
   - Verificatie van bron noodzakelijk

3. **Geen garantie van levering**
   - Network issues kunnen webhooks blokkeren
   - Idempotentie belangrijk

4. **Debugging uitdagingen**
   - Moeilijker te testen lokaal
   - Logs en monitoring cruciaal

5. **Vendor lock-in risico**
   - Elke provider heeft eigen webhook formaat
   - Migratie kan complex zijn

## Common webhook providers

### 🏦 Financiële diensten
- **Stripe**: Betalingen, subscripties, refunds
- **PayPal**: Transacties, disputes
- **Mollie**: iDEAL, creditcard betalingen
- **Adyen**: Enterprise betalingen

### 💻 Development tools
- **GitHub**: Code pushes, pull requests, issues
- **GitLab**: CI/CD pipelines, merge requests
- **Bitbucket**: Repository events
- **Jenkins**: Build status updates

### 📧 Communicatie & Marketing
- **SendGrid**: Email events (open, click, bounce)
- **Mailchimp**: Campaign events, lijst updates
- **Twilio**: SMS/WhatsApp status updates
- **Slack**: App events, mentions

### 🛍️ E-commerce
- **Shopify**: Orders, products, inventory
- **WooCommerce**: WordPress shop events
- **Magento**: Order lifecycle events

### 📊 Analytics & Monitoring
- **Segment**: User events, tracking
- **Mixpanel**: Custom events
- **Sentry**: Error alerts

### 🎯 CRM & Support
- **HubSpot**: Contact updates, deal changes
- **Salesforce**: Record changes
- **Intercom**: Conversations, user events
- **Zendesk**: Ticket updates

## Praktisch voorbeeld: Webhook vs API

Laten we een concreet voorbeeld bekijken van een e-commerce order tracking systeem:

### Met traditionele API (polling):
\`\`\`javascript
// Inefficiënte polling approach
setInterval(async () => {
  const response = await fetch('https://api.shop.com/orders/12345');
  const order = await response.json();
  
  if (order.status !== lastKnownStatus) {
    // Update gevonden!
    updateOrderStatus(order);
    lastKnownStatus = order.status;
  }
}, 30000); // Check elke 30 seconden
\`\`\`

### Met webhooks:
\`\`\`javascript
// Efficiënte webhook endpoint
app.post('/webhooks/order-updates', (req, res) => {
  const { orderId, status, timestamp } = req.body;
  
  // Direct verwerken zodra update binnenkomt
  updateOrderStatus({ orderId, status });
  
  // Bevestig ontvangst
  res.status(200).send('OK');
});
\`\`\`

## Samenvatting

Webhooks zijn een fundamenteel concept in moderne software-integraties:

- **Push > Pull**: Webhooks sturen data naar jou toe in plaats van dat je moet vragen
- **Real-time**: Onmiddellijke updates zonder polling delays
- **Efficiënt**: Minder resources, lagere kosten
- **Event-driven**: Natuurlijke architectuur voor moderne apps

In de volgende lessen gaan we dieper in op de technische implementatie, security aspecten, en best practices voor het werken met webhooks.

## 🎯 Key takeaways

1. Webhooks = HTTP callbacks voor real-time events
2. Push architectuur is efficiënter dan pull/polling
3. Breed gebruikt door moderne SaaS providers
4. Balanceer voordelen met security/reliability uitdagingen
5. Essentieel voor het bouwen van reactive, event-driven systemen
`,
  codeExamples: [
    {
      id: 'webhook-receiver-example',
      title: 'Basis webhook receiver in Node.js',
      language: 'javascript',
      code: `// Eenvoudige webhook receiver met Express.js
const express = require('express');
const crypto = require('crypto');
const app = express();

// Middleware voor raw body (nodig voor signature verificatie)
app.use(express.raw({ type: 'application/json' }));

// Webhook endpoint
app.post('/webhooks/stripe', (req, res) => {
  // Verificatie van webhook signature
  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  try {
    // Verifieer dat webhook echt van Stripe komt
    const event = verifyWebhookSignature(
      req.body,
      signature,
      webhookSecret
    );
    
    // Handle verschillende event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        handlePaymentSuccess(event.data.object);
        break;
      case 'customer.subscription.deleted':
        handleSubscriptionCanceled(event.data.object);
        break;
      default:
        console.log(\`Unhandled event type: \${event.type}\`);
    }
    
    // Bevestig ontvangst
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(400).send(\`Webhook Error: \${error.message}\`);
  }
});

function handlePaymentSuccess(paymentIntent) {
  console.log('Payment successful:', paymentIntent.id);
  // Update database, stuur email, etc.
}

function handleSubscriptionCanceled(subscription) {
  console.log('Subscription canceled:', subscription.id);
  // Update user access, notify team, etc.
}`,
      explanation: 'Dit voorbeeld toont een basis webhook receiver met signature verificatie voor security. De webhook verwerkt verschillende event types en bevestigt ontvangst naar de sender.'
    },
    {
      id: 'polling-vs-webhook-comparison',
      title: 'Polling vs Webhook vergelijking',
      language: 'javascript',
      code: `// ❌ OUDE MANIER: Polling approach (inefficiënt)
class OrderTracker {
  constructor(orderId) {
    this.orderId = orderId;
    this.lastStatus = null;
    this.pollInterval = 30000; // 30 seconden
  }
  
  startPolling() {
    setInterval(async () => {
      try {
        const response = await fetch(
          \`https://api.shop.com/orders/\${this.orderId}\`
        );
        const order = await response.json();
        
        if (order.status !== this.lastStatus) {
          console.log('Status update:', order.status);
          this.handleStatusChange(order);
          this.lastStatus = order.status;
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, this.pollInterval);
  }
  
  handleStatusChange(order) {
    // 30 seconden vertraging in het slechtste geval!
    notifyCustomer(order);
  }
}

// ✅ NIEUWE MANIER: Webhook approach (efficiënt)
class WebhookOrderTracker {
  constructor() {
    this.setupWebhookEndpoint();
  }
  
  setupWebhookEndpoint() {
    app.post('/webhooks/orders', (req, res) => {
      const { orderId, status, timestamp } = req.body;
      
      // Real-time update, geen vertraging!
      console.log('Instant update:', status);
      this.handleStatusChange(req.body);
      
      res.status(200).send('OK');
    });
  }
  
  handleStatusChange(orderUpdate) {
    // Onmiddellijke notificatie
    notifyCustomer(orderUpdate);
  }
}

// Performance vergelijking:
// Polling: 1440 requests per dag (elke 30 sec)
// Webhook: ~10 requests per dag (alleen bij updates)
// Besparing: 99.3% minder API calls!`,
      explanation: 'Deze code vergelijkt polling met webhooks. Polling verspilt resources met constante checks, terwijl webhooks alleen communiceren wanneer nodig.'
    }
  ],
  assignments: [
    {
      id: 'assignment-1-1-1',
      title: 'Identificeer webhook use cases',
      description: 'Analyseer je huidige projecten of werkprocessen en identificeer 3 situaties waar webhooks een verbetering zouden zijn over polling.',
      difficulty: 'easy',
      type: 'project',
      initialCode: `// Use Case 1: ...
// Use Case 2: ...
// Use Case 3: ...

// Voor elke use case, beschrijf:
// - Het huidige proces (indien aanwezig).
// - Waarom een webhook een verbetering zou zijn.
// - Welke data de webhook zou moeten bevatten.
`,
      hints: [
        'Denk aan processen waar je nu handmatig moet checken voor updates',
        'Overweeg situaties waar real-time informatie belangrijk is',
        'Kijk naar integraties met externe services die je gebruikt'
      ]
    },
    {
      id: 'assignment-1-1-2',
      title: 'Webhook vs API vergelijkingstabel',
      description: 'Maak een vergelijkingstabel tussen webhooks en traditionele API polling voor een specifiek scenario (bijv. order tracking, social media monitoring, of payment processing).',
      difficulty: 'medium',
      type: 'project',
      initialCode: `// Scenario: ...

// Maak een tabel met de volgende kolommen:
// - Aspect (bijv. Real-time, Efficiëntie, Kosten, Implementatie complexiteit)
// - Webhook
// - API Polling

// Vul de tabel in met de voor- en nadelen van elke aanpak voor het gekozen scenario.
`,
      hints: [
        'Wees specifiek in je vergelijking.',
        'Denk aan zowel technische als business aspecten.',
        'Gebruik kwantitatieve data waar mogelijk (bijv. aantal API calls).'
      ]
    }
  ],
  resources: [
    {
      title: 'Webhook.site - Test webhooks online',
      url: 'https://webhook.site',
      type: 'tool'
    },
    {
      title: 'RequestBin - Inspect webhook requests',
      url: 'https://requestbin.com',
      type: 'tool'
    }
  ]
};