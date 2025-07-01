import { Lesson } from '@/lib/data/courses';

export const lesson2_2: Lesson = {
  id: 'botpress-essentials',
  title: 'Botpress essentials: Open-source power',
  duration: '60 minuten',
  content: `
# Botpress: Open-Source Conversational AI Platform

Botpress is een krachtig open-source platform voor het bouwen van enterprise-grade chatbots. Met volledige controle over je data en infrastructuur is het ideaal voor organisaties met specifieke security of customization requirements.

## Waarom Botpress?

### Voordelen
- **Open Source**: Volledige transparantie en controle
- **Self-Hosted**: Data blijft binnen je eigen infrastructuur
- **Extensible**: Custom modules en integraties
- **Developer-Friendly**: Code-first approach mogelijk
- **Enterprise Features**: Built-in analytics, user management, multi-bot

### Architecture Overview
- **Botpress Server**: Core engine en API
- **Studio**: Visual flow builder
- **NLU Engine**: Natural Language Understanding
- **Database**: PostgreSQL voor persistence
- **Messaging Channels**: Omnichannel support

## Botpress Installatie

### 1. Docker Installation (Recommended)
\`\`\`bash
# Docker Compose configuration
version: '3.7'

services:
  botpress:
    image: botpress/server:latest
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://bp_user:password@postgres:5432/botpress
      BP_PRODUCTION: "true"
      EXTERNAL_URL: "https://bot.company.com"
    volumes:
      - ./data:/botpress/data
      - ./custom-modules:/botpress/modules
    depends_on:
      - postgres

  postgres:
    image: postgres:13
    environment:
      POSTGRES_USER: bp_user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: botpress
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
\`\`\`

### 2. Configuration Files
\`\`\`javascript
// botpress.config.json
{
  "version": "12.26.0",
  "httpServer": {
    "host": "0.0.0.0",
    "port": 3000,
    "cors": {
      "enabled": true,
      "origin": "*"
    }
  },
  "database": {
    "type": "postgres",
    "migrations": {
      "enabled": true
    }
  },
  "nlu": {
    "ducklingEnabled": true,
    "ducklingURL": "http://duckling:8000",
    "languageSources": [
      {
        "endpoint": "https://lang-server.botpress.io"
      }
    ]
  },
  "modules": [
    {
      "location": "MODULES_ROOT/analytics",
      "enabled": true
    },
    {
      "location": "MODULES_ROOT/nlu",
      "enabled": true
    },
    {
      "location": "MODULES_ROOT/channel-web",
      "enabled": true
    }
  ]
}
\`\`\`

### 3. Bot Configuration
\`\`\`yaml
# bot.config.yml
id: customer-service-bot
name: Customer Service Assistant
description: Automated customer support bot
version: 1.0.0

languages:
  - nl
  - en

nlu:
  provider: native
  confidence: 0.7
  fuzzyTolerance: 0.1
  
dialog:
  timeoutInterval: 10m
  sessionTimeoutInterval: 30m
\`\`\`

## Visual Flow Development

### 1. Node Types
\`\`\`javascript
// Text Node
{
  id: "welcome-message",
  type: "say_something",
  content: {
    text: {
      nl: "Welkom bij onze klantenservice! Hoe kan ik u helpen?",
      en: "Welcome to our customer service! How can I help you?"
    },
    typing: true,
    markdown: true
  }
}

// Single Choice Node
{
  id: "main-menu",
  type: "single-choice",
  content: {
    text: "Kies een optie:",
    choices: [
      {
        title: "Bestelling informatie",
        value: "order_info"
      },
      {
        title: "Technische ondersteuning",
        value: "tech_support"
      },
      {
        title: "Algemene vragen",
        value: "general_faq"
      }
    ]
  },
  transitions: [
    {
      condition: "temp.choice === 'order_info'",
      node: "order-flow"
    }
  ]
}
\`\`\`

### 2. Custom Actions
\`\`\`javascript
// actions/fetchOrderStatus.js
const axios = require('axios')

async function action(bp, event, args) {
  const { orderNumber, email } = args
  
  try {
    // Validate input
    if (!orderNumber || !email) {
      await bp.events.replyToEvent(event, {
        type: 'text',
        text: 'Ik heb uw ordernummer en e-mail nodig.'
      })
      return
    }

    // Fetch order data
    const response = await axios.get(\`\${process.env.API_URL}/orders/\${orderNumber}\`, {
      headers: {
        'Authorization': \`Bearer \${process.env.API_TOKEN}\`
      },
      params: { email }
    })

    // Store in session
    event.state.session.orderData = response.data
    
    // Reply with status
    await bp.events.replyToEvent(event, {
      type: 'text',
      text: \`Uw bestelling \${orderNumber} heeft status: \${response.data.status}\`,
      markdown: true
    })
    
  } catch (error) {
    await bp.events.replyToEvent(event, {
      type: 'text',
      text: 'Sorry, ik kon uw bestelling niet vinden. Controleer uw gegevens.'
    })
  }
}

return action(bp, event, args)
\`\`\`

### 3. Hooks Implementation
\`\`\`javascript
// hooks/before_incoming_middleware.js
async function hook(bp, event) {
  // Log all incoming messages
  await bp.logger.info('Incoming message:', {
    userId: event.target,
    channel: event.channel,
    text: event.preview
  })
  
  // Check for business hours
  const currentHour = new Date().getHours()
  if (currentHour < 9 || currentHour > 17) {
    event.state.session.outsideBusinessHours = true
  }
  
  // Rate limiting check
  const userMessageCount = await bp.kvs.get(\`msg_count_\${event.target}\`)
  if (userMessageCount > 50) {
    await bp.events.replyToEvent(event, {
      type: 'text',
      text: 'U heeft het maximum aantal berichten bereikt. Probeer later opnieuw.'
    })
    event.setFlag(bp.IO.WellKnownFlags.SKIP_DIALOG_ENGINE, true)
  }
}

return hook(bp, event)
\`\`\`

## Natural Language Understanding

### 1. Intent Definition
\`\`\`yaml
# intents/order_tracking.yml
name: order_tracking
utterances:
  nl:
    - waar is mijn bestelling
    - ik wil mijn order tracken
    - wanneer komt mijn pakket aan
    - track and trace informatie
    - bestelstatus opvragen
    - order [ORDER_NUMBER] tracken
  en:
    - where is my order
    - track my package
    - order status
    - delivery status for [ORDER_NUMBER]

slots:
  - name: ORDER_NUMBER
    entity: custom.order_number
    required: true
    prompts:
      nl: "Wat is uw ordernummer?"
      en: "What is your order number?"
\`\`\`

### 2. Entity Configuration
\`\`\`javascript
// entities/order_number.js
module.exports = {
  name: 'order_number',
  type: 'pattern',
  sensitive: false,
  patterns: [
    {
      lang: 'nl',
      regex: /ORD-[0-9]{6}/i,
      examples: ['ORD-123456', 'ord-789012']
    }
  ],
  fuzzy: {
    minLength: 10,
    maxTypos: 1
  }
}
\`\`\`

### 3. NLU Pipeline Configuration
\`\`\`javascript
// nlu.config.js
module.exports = {
  pipelines: {
    main: [
      {
        name: 'language_detector',
        enabled: true
      },
      {
        name: 'tokenizer',
        config: {
          type: 'whitespace',
          lowercase: true
        }
      },
      {
        name: 'intent_classifier',
        config: {
          model: 'svm',
          confidence_threshold: 0.7,
          ambiguity_threshold: 0.1
        }
      },
      {
        name: 'entity_extractor',
        config: {
          duckling_enabled: true,
          custom_entities: true
        }
      },
      {
        name: 'slot_filler',
        config: {
          intent_slots: true,
          max_retries: 3
        }
      }
    ]
  },
  training: {
    batch_size: 10,
    epochs: 300,
    learning_rate: 0.001
  }
}
\`\`\`

### 4. Context Management
\`\`\`javascript
// Dialog context handling
{
  onEnter: async (bp, event, { node }) => {
    // Initialize context
    if (!event.state.session.context) {
      event.state.session.context = {
        topic: null,
        history: [],
        entities: {}
      }
    }
    
    // Update context based on intent
    const intent = event.nlu.intent.name
    if (intent === 'order_tracking') {
      event.state.session.context.topic = 'orders'
    }
  },
  
  onReceive: async (bp, event, { node }) => {
    // Extract and store entities
    const entities = event.nlu.entities
    entities.forEach(entity => {
      event.state.session.context.entities[entity.type] = entity.value
    })
    
    // Maintain conversation history
    event.state.session.context.history.push({
      user: event.preview,
      intent: event.nlu.intent.name,
      timestamp: new Date()
    })
  }
}
\`\`\`

## Geavanceerde Functionaliteiten

### 1. Multi-Bot Architecture
\`\`\`javascript
// Bot orchestration configuration
{
  bots: [
    {
      id: "sales-bot",
      name: "Sales Assistant",
      mount_point: "/sales",
      languages: ["nl", "en"],
      handoff_to: ["support-bot"]
    },
    {
      id: "support-bot",
      name: "Support Assistant",
      mount_point: "/support",
      languages: ["nl", "en", "de"],
      handoff_to: ["human-agent"]
    }
  ],
  routing: {
    default: "sales-bot",
    rules: [
      {
        condition: "event.text.includes('support')",
        target: "support-bot"
      }
    ]
  }
}
\`\`\`

### 2. Custom Module Development
\`\`\`javascript
// modules/crm-integration/index.js
module.exports = {
  definition: {
    name: 'crm-integration',
    menuIcon: 'database',
    menuText: 'CRM Integration',
    fullName: 'CRM Integration Module'
  },
  
  actions: [
    {
      name: 'fetchCustomer',
      description: 'Fetch customer data from CRM',
      args: {
        email: { type: 'string', required: true }
      }
    },
    {
      name: 'updateTicket',
      description: 'Update support ticket in CRM',
      args: {
        ticketId: { type: 'string', required: true },
        status: { type: 'string', required: true }
      }
    }
  ],
  
  onServerStarted: async (bp) => {
    // Initialize CRM connection
    const crmClient = await initializeCRM({
      apiKey: process.env.CRM_API_KEY,
      endpoint: process.env.CRM_ENDPOINT
    })
    
    bp.crm = crmClient
  },
  
  onBotMount: async (bp, botId) => {
    // Register bot-specific webhooks
    await bp.http.createRouterForBot(botId, {
      path: '/crm/webhook',
      method: 'POST',
      handler: async (req, res) => {
        // Handle CRM webhooks
        const event = req.body
        await bp.events.sendEvent(bp.events.Event({
          type: 'crm_update',
          channel: 'webhook',
          direction: 'incoming',
          payload: event
        }))
        res.sendStatus(200)
      }
    })
  }
}
\`\`\`

### 3. Analytics & Monitoring
\`\`\`javascript
// Analytics configuration
{
  analytics: {
    enabled: true,
    providers: [
      {
        name: "built-in",
        config: {
          retention_days: 90,
          sample_rate: 1.0
        }
      },
      {
        name: "elasticsearch",
        config: {
          host: "http://elasticsearch:9200",
          index_prefix: "botpress_",
          batch_size: 100
        }
      }
    ],
    custom_events: [
      {
        name: "order_completed",
        properties: ["order_id", "amount", "channel"]
      },
      {
        name: "escalation_triggered",
        properties: ["reason", "wait_time", "previous_intents"]
      }
    ]
  }
}
\`\`\`

### 4. Human Handoff
\`\`\`javascript
// Human handoff implementation
const handoffModule = {
  actions: {
    initiateHandoff: async (event, args) => {
      // Check agent availability
      const availableAgent = await findAvailableAgent(args.department)
      
      if (!availableAgent) {
        await bp.events.replyToEvent(event, {
          type: 'text',
          text: 'Momenteel zijn alle medewerkers bezet. U staat op positie #' + 
                await getQueuePosition(event.target)
        })
        
        // Add to queue
        await addToQueue({
          userId: event.target,
          priority: args.priority || 'normal',
          context: event.state.session
        })
        return
      }
      
      // Create handoff session
      const session = await createHandoffSession({
        userId: event.target,
        agentId: availableAgent.id,
        context: event.state.session
      })
      
      // Notify agent
      await notifyAgent(availableAgent, session)
      
      // Update user
      await bp.events.replyToEvent(event, {
        type: 'text',
        text: \`U wordt doorverbonden met \${availableAgent.name}...\`
      })
    }
  }
}
\`\`\`

## Production Deployment

### 1. Kubernetes Deployment
\`\`\`yaml
# botpress-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: botpress
spec:
  replicas: 3
  selector:
    matchLabels:
      app: botpress
  template:
    metadata:
      labels:
        app: botpress
    spec:
      containers:
      - name: botpress
        image: botpress/server:v12.26.0
        ports:
        - containerPort: 3000
        env:
        - name: BP_PRODUCTION
          value: "true"
        - name: CLUSTER_ENABLED
          value: "true"
        - name: REDIS_URL
          value: "redis://redis-service:6379"
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10

---
apiVersion: v1
kind: Service
metadata:
  name: botpress-service
spec:
  selector:
    app: botpress
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
\`\`\`

### 2. High Availability Setup
\`\`\`javascript
// cluster.config.js
module.exports = {
  clustering: {
    enabled: true,
    mode: 'redis',
    redis: {
      host: process.env.REDIS_HOST,
      port: 6379,
      password: process.env.REDIS_PASSWORD,
      options: {
        enableReadyCheck: true,
        maxRetriesPerRequest: 3
      }
    },
    heartbeat: {
      interval: 5000,
      timeout: 15000
    }
  },
  loadBalancing: {
    algorithm: 'round-robin',
    sticky_sessions: true,
    health_check: {
      path: '/health',
      interval: 10000
    }
  }
}
\`\`\`

### 3. Monitoring & Logging
\`\`\`yaml
# monitoring setup
monitoring:
  prometheus:
    enabled: true
    port: 9090
    metrics:
      - http_requests_total
      - nlu_predictions_total
      - dialog_transitions_total
      - api_response_time_seconds
      
  logging:
    level: info
    outputs:
      - type: console
        format: json
      - type: file
        path: /var/log/botpress
        rotation:
          max_size: 100MB
          max_files: 10
      - type: elasticsearch
        host: http://elastic:9200
        index: botpress-logs
\`\`\`

### 4. Backup & Disaster Recovery
\`\`\`bash
#!/bin/bash
# backup.sh

# Database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Bot configurations backup
tar -czf bots_backup_$(date +%Y%m%d_%H%M%S).tar.gz /botpress/data/bots

# Upload to S3
aws s3 cp backup_*.sql s3://botpress-backups/database/
aws s3 cp bots_backup_*.tar.gz s3://botpress-backups/configs/

# Cleanup old backups
find . -name "backup_*" -mtime +7 -delete
\`\`\`

### Performance Tuning
\`\`\`javascript
// performance.config.js
{
  nlu: {
    cache: {
      enabled: true,
      ttl: 3600,
      max_size: 1000
    },
    batch_predictions: true,
    max_concurrent: 10
  },
  dialog: {
    state_expiry: 1800, // 30 minutes
    garbage_collection: {
      interval: 300000, // 5 minutes
      batch_size: 100
    }
  },
  api: {
    rate_limiting: {
      enabled: true,
      window: 60000, // 1 minute
      max_requests: 100
    },
    compression: true,
    cache_control: {
      static_assets: 86400,
      api_responses: 0
    }
  }
}
\`\`\`

## Samenvatting

Botpress biedt een krachtige open-source oplossing voor enterprise chatbots:

### Key Takeaways
- **Full Control**: Self-hosted met volledige data controle
- **Extensible**: Custom modules en integraties
- **Enterprise Ready**: Clustering, HA, monitoring
- **Developer Friendly**: Code-first mogelijk
- **Multi-lingual**: Native Nederlandse ondersteuning

### Vergelijking met Voiceflow
| Feature | Botpress | Voiceflow |
|---------|----------|------------|
| Hosting | Self-hosted | Cloud-based |
| Pricing | Open source | Subscription |
| Customization | Unlimited | Limited |
| Learning curve | Steeper | Easier |
| Control | Complete | Managed |

### Volgende Stappen
1. Experimenteer met custom actions
2. Train je eigen NLU model
3. Implementeer externe integraties
4. Deploy naar test omgeving
5. Monitor performance metrics

In de volgende les vergelijken we alle platforms op kosten, features en schaalbaarheid!`,
  assignments: [
    {
      id: 'botpress-install',
      title: 'Installeer en Configureer Botpress',
      description: 'Setup een lokale Botpress instantie voor development. Installeer Botpress via Docker, configureer PostgreSQL database, maak eerste bot aan via Studio, configureer Nederlandse taal support, en test de admin interface.',
      difficulty: 'medium',
      type: 'project'
    },
    {
      id: 'botpress-service-bot',
      title: 'Bouw een Customer Service Bot',
      description: 'Implementeer een complete customer service flow. Design conversation flows voor FAQ, orders, en support. Implementeer custom actions voor API integratie, train NLU model met Nederlandse utterances, voeg human handoff functionaliteit toe, en test met verschillende scenarios.',
      difficulty: 'hard',
      type: 'project'
    }
  ]
};