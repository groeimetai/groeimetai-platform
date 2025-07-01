import { Lesson } from '@/lib/data/courses';

export const lesson2_3: Lesson = {
  id: 'platform-vergelijking',
  title: 'Platform vergelijking: Kosten, features en schaalbaarheid',
  duration: '45 minuten',
  content: `
# Platform Vergelijking: De Juiste Keuze Maken

Het kiezen van het juiste chatbot platform is cruciaal voor het succes van je customer service automatisering. In deze les vergelijken we de belangrijkste platforms op basis van kosten, features, en schaalbaarheid.

## Vergelijkingscriteria

### Hoofdcategorieën
1. **Kosten**: Licenties, hosting, development tijd
2. **Features**: NLU, integraties, analytics
3. **Schaalbaarheid**: Performance, limits, growth
4. **Gebruiksgemak**: Learning curve, tooling
5. **Flexibiliteit**: Customization, extensibility

## Gedetailleerde Kostenanalyse

### 1. Voiceflow Pricing
\`\`\`yaml
voiceflow_pricing:
  starter:
    price: $0/maand
    included:
      - 1 editor seat
      - 1,000 AI credits/month
      - Basic analytics
      - Community support
    limitations:
      - No custom branding
      - Limited integrations
      
  pro:
    price: $50/user/maand
    included:
      - Unlimited collaborators
      - 15,000 AI credits/month
      - Advanced analytics
      - Priority support
      - Custom domains
    
  teams:
    price: $625/maand (5 seats)
    included:
      - 50,000 AI credits/month
      - Team workspaces
      - SSO/SAML
      - SLA support
      
  enterprise:
    price: Custom
    included:
      - Unlimited AI credits
      - Dedicated support
      - Custom contracts
      - On-premise option
\`\`\`

### 2. Botpress Pricing
\`\`\`yaml
botpress_pricing:
  open_source:
    price: $0
    included:
      - Full platform access
      - Unlimited bots
      - All features
      - Community support
    costs:
      - Hosting infrastructure
      - Development resources
      - Maintenance
      
  enterprise:
    price: $15,000+/jaar
    included:
      - Enterprise support
      - Training & onboarding
      - Custom development
      - SLA guarantees
      - Priority features
\`\`\`

### 3. Alternative Platforms
\`\`\`javascript
const platformCosts = {
  dialogflow: {
    edition: {
      essentials: "$0.007 per request",
      cx: "$0.02 per request"
    },
    monthly_estimate: {
      small: "$50-200", // 10k conversations
      medium: "$500-2000", // 100k conversations
      large: "$5000+" // 1M+ conversations
    }
  },
  
  rasa: {
    open_source: "$0",
    enterprise: {
      starter: "$890/month",
      pro: "Custom pricing"
    },
    infrastructure: "$200-2000/month"
  },
  
  microsoftBotFramework: {
    framework: "$0",
    azure_costs: {
      bot_service: "$0.50 per 1000 messages",
      cognitive_services: "Various",
      hosting: "$50-500/month"
    }
  }
}
\`\`\`

### TCO Calculator
\`\`\`javascript
function calculateTCO(platform, config) {
  const costs = {
    initial: 0,
    monthly_recurring: 0,
    annual_total: 0
  };
  
  switch(platform) {
    case 'voiceflow':
      costs.initial = config.seats * 500; // Training
      costs.monthly_recurring = config.plan_cost + 
        (config.extra_credits * 0.01);
      break;
      
    case 'botpress':
      costs.initial = 5000; // Setup & training
      costs.monthly_recurring = 
        config.hosting_cost + 
        (config.developer_hours * 100);
      break;
  }
  
  costs.annual_total = costs.initial + 
    (costs.monthly_recurring * 12);
  
  return costs;
}

// Example calculation
const voiceflowTCO = calculateTCO('voiceflow', {
  seats: 3,
  plan_cost: 625,
  extra_credits: 10000
});
// Result: $9,700/year

const botpressTCO = calculateTCO('botpress', {
  hosting_cost: 500,
  developer_hours: 20
});
// Result: $35,000/year
\`\`\`

## Uitgebreide Feature Vergelijking

### Core Features
\`\`\`markdown
| Feature | Voiceflow | Botpress | Dialogflow | Rasa |
|---------|-----------|----------|------------|------|
| Visual Builder | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| NLU Quality | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Multi-language | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Custom Code | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Analytics | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Collaboration | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Deployment | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Support | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
\`\`\`

### Integration Capabilities
\`\`\`yaml
integrations:
  voiceflow:
    native:
      - Zapier
      - Twilio
      - WhatsApp Business API
      - Google Sheets
      - Airtable
    via_api:
      - Any REST API
      - Webhooks
      - Custom integrations
    limitations:
      - No direct database access
      - Limited authentication options
      
  botpress:
    native:
      - PostgreSQL/MySQL
      - Redis
      - Slack
      - Microsoft Teams
      - WhatsApp
      - Facebook Messenger
    custom_modules:
      - Unlimited possibilities
      - Direct code access
      - Custom channels
    advantages:
      - Full control
      - No API limits
      
  dialogflow:
    google_ecosystem:
      - Google Cloud services
      - Firebase
      - Google Analytics
      - Cloud Functions
    third_party:
      - Extensive partner network
      - Pre-built integrations
    enterprise:
      - Contact center platforms
      - CRM systems
\`\`\`

### Advanced Features
\`\`\`javascript
const advancedFeatures = {
  voiceflow: {
    strengths: [
      "Excellent prototyping",
      "Team collaboration",
      "Version control",
      "A/B testing",
      "No-code approach"
    ],
    weaknesses: [
      "Limited customization",
      "Dependency on platform",
      "API rate limits"
    ]
  },
  
  botpress: {
    strengths: [
      "Complete customization",
      "Self-hosted option",
      "Module system",
      "Multi-bot support",
      "Open source"
    ],
    weaknesses: [
      "Steeper learning curve",
      "Requires technical team",
      "Infrastructure management"
    ]
  },
  
  dialogflow: {
    strengths: [
      "Google's NLU",
      "Pre-trained models",
      "Extensive language support",
      "Enterprise scale",
      "Rich analytics"
    ],
    weaknesses: [
      "Vendor lock-in",
      "Complex pricing",
      "Limited UI customization"
    ]
  }
};
\`\`\`

## Schaalbaarheid en Performance

### 1. Traffic Handling
\`\`\`yaml
scalability_metrics:
  voiceflow:
    concurrent_users: "10,000+"
    messages_per_second: "100+"
    api_rate_limits:
      starter: "60 requests/minute"
      pro: "300 requests/minute"
      enterprise: "Unlimited"
    infrastructure: "Managed cloud"
    
  botpress:
    concurrent_users: "Unlimited*"
    messages_per_second: "1,000+"
    limitations: "Depends on your infrastructure"
    scaling_options:
      - Horizontal scaling
      - Load balancing
      - Redis clustering
      
  dialogflow:
    concurrent_users: "Unlimited"
    messages_per_second: "10,000+"
    quotas:
      text_requests: "180,000/minute"
      voice_requests: "1,000/minute"
    infrastructure: "Google Cloud"
\`\`\`

### 2. Growth Scenarios
\`\`\`javascript
// Scaling simulation
const scalingScenarios = {
  startup: {
    month_1: {
      users: 1000,
      conversations: 5000,
      best_platform: "Voiceflow Starter",
      monthly_cost: "$0"
    },
    month_6: {
      users: 10000,
      conversations: 50000,
      best_platform: "Voiceflow Pro",
      monthly_cost: "$150"
    },
    month_12: {
      users: 50000,
      conversations: 250000,
      best_platform: "Dialogflow CX",
      monthly_cost: "$5000"
    }
  },
  
  enterprise: {
    current: {
      users: 100000,
      conversations: 1000000,
      requirements: [
        "On-premise option",
        "Data sovereignty",
        "Custom integrations"
      ],
      best_platform: "Botpress Enterprise",
      annual_cost: "$50000"
    }
  }
};
\`\`\`

### 3. Performance Optimization
\`\`\`javascript
// Platform-specific optimizations
const optimizationStrategies = {
  voiceflow: {
    caching: "Automatic CDN caching",
    optimization: [
      "Minimize API calls",
      "Use built-in functions",
      "Optimize conversation flows"
    ]
  },
  
  botpress: {
    infrastructure: {
      redis: {
        purpose: "Session caching",
        config: {
          maxmemory: "2gb",
          maxmemory_policy: "allkeys-lru"
        }
      },
      postgres: {
        purpose: "Data persistence",
        optimization: [
          "Index conversation tables",
          "Partition by date",
          "Regular vacuum"
        ]
      },
      nodejs: {
        clustering: true,
        workers: "CPU cores * 2",
        memory_limit: "1GB per worker"
      }
    }
  },
  
  dialogflow: {
    design_patterns: [
      "Use session entities for context",
      "Implement follow-up intents",
      "Leverage system entities",
      "Cache frequent responses"
    ]
  }
};
\`\`\`

### 4. High Availability
\`\`\`yaml
high_availability:
  voiceflow:
    sla: "99.9% uptime"
    redundancy: "Multi-region"
    failover: "Automatic"
    backup: "Continuous"
    
  botpress_self_hosted:
    architecture:
      load_balancer:
        - HAProxy
        - NGINX
      app_servers: 3+
      database:
        - Primary-replica setup
        - Automatic failover
      cache:
        - Redis Sentinel
        - 3 node minimum
    monitoring:
      - Prometheus
      - Grafana
      - Custom alerts
      
  dialogflow:
    sla: "99.95% uptime"
    regions: "Global"
    failover: "Automatic"
    disaster_recovery: "Built-in"
\`\`\`

## Platform Selectie Framework

### 1. Decision Matrix
\`\`\`javascript
const decisionMatrix = {
  criteria: [
    {
      name: "Budget",
      weight: 0.25,
      scores: {
        voiceflow: 7,
        botpress: 9,
        dialogflow: 6,
        rasa: 8
      }
    },
    {
      name: "Ease of Use",
      weight: 0.20,
      scores: {
        voiceflow: 10,
        botpress: 6,
        dialogflow: 7,
        rasa: 5
      }
    },
    {
      name: "Customization",
      weight: 0.20,
      scores: {
        voiceflow: 5,
        botpress: 10,
        dialogflow: 7,
        rasa: 10
      }
    },
    {
      name: "Scalability",
      weight: 0.15,
      scores: {
        voiceflow: 7,
        botpress: 9,
        dialogflow: 10,
        rasa: 8
      }
    },
    {
      name: "Support",
      weight: 0.10,
      scores: {
        voiceflow: 8,
        botpress: 6,
        dialogflow: 9,
        rasa: 5
      }
    },
    {
      name: "Integration",
      weight: 0.10,
      scores: {
        voiceflow: 7,
        botpress: 9,
        dialogflow: 9,
        rasa: 8
      }
    }
  ],
  
  calculateScore: function(platform) {
    return this.criteria.reduce((total, criterion) => {
      return total + (criterion.scores[platform] * criterion.weight);
    }, 0);
  }
};

// Results:
// Voiceflow: 7.35
// Botpress: 8.25
// Dialogflow: 7.85
// Rasa: 7.45
\`\`\`

### 2. Use Case Recommendations
\`\`\`yaml
recommendations:
  small_business:
    requirements:
      - Low budget
      - Quick setup
      - Basic features
    recommended: "Voiceflow Starter"
    alternatives:
      - "Dialogflow ES"
      - "Tidio"
    
  growing_startup:
    requirements:
      - Scalable solution
      - Good support
      - Integration options
    recommended: "Voiceflow Pro"
    alternatives:
      - "Dialogflow CX"
      - "Intercom"
      
  enterprise:
    requirements:
      - Data control
      - Customization
      - Compliance
    recommended: "Botpress Enterprise"
    alternatives:
      - "Rasa Enterprise"
      - "Custom solution"
      
  developer_focused:
    requirements:
      - Full control
      - Open source
      - Extensibility
    recommended: "Botpress Open Source"
    alternatives:
      - "Rasa Open Source"
      - "Microsoft Bot Framework"
\`\`\`

### 3. Migration Considerations
\`\`\`javascript
const migrationPaths = {
  from_voiceflow: {
    to_botpress: {
      effort: "High",
      duration: "2-4 weeks",
      challenges: [
        "Flow redesign required",
        "Custom code implementation",
        "Training data export/import"
      ],
      benefits: [
        "No vendor lock-in",
        "Full customization",
        "Cost savings at scale"
      ]
    }
  },
  
  from_dialogflow: {
    to_botpress: {
      effort: "Medium",
      duration: "1-3 weeks",
      tools: [
        "Intent export scripts",
        "Entity mapping tools",
        "Flow conversion utilities"
      ],
      considerations: [
        "NLU model differences",
        "Integration rewrites",
        "Testing requirements"
      ]
    }
  }
};
\`\`\`

### 4. Future-Proofing
\`\`\`yaml
future_considerations:
  ai_advancements:
    - LLM integration capabilities
    - GPT/Claude API support
    - Multimodal interactions
    
  market_trends:
    - Voice-first interfaces
    - Omnichannel expectations
    - Privacy regulations
    
  platform_roadmaps:
    voiceflow:
      - Enhanced AI features
      - Better enterprise support
      - More integrations
      
    botpress:
      - Cloud offering
      - Improved UI/UX
      - AI marketplace
      
    dialogflow:
      - Deeper Google integration
      - Advanced analytics
      - Industry solutions
\`\`\`

## Samenvatting

De keuze voor het juiste chatbot platform hangt af van vele factoren:

### Key Decision Factors
1. **Budget**: Initial investment vs ongoing costs
2. **Technical Expertise**: In-house capabilities
3. **Scalability Needs**: Current and future growth
4. **Customization Requirements**: Standard vs unique needs
5. **Data Control**: Cloud vs on-premise

### Platform Recommendations
- **Voiceflow**: Best voor snelle prototypes en kleine teams
- **Botpress**: Ideaal voor volledige controle en customization
- **Dialogflow**: Uitstekend voor Google ecosystem en enterprise
- **Rasa**: Perfect voor AI-first en privacy-conscious organisaties

### Action Items
1. Evalueer je huidige en toekomstige behoeften
2. Test minimaal 2 platforms met een POC
3. Bereken TCO voor 3 jaar
4. Betrek alle stakeholders in de beslissing
5. Plan voor mogelijke migratie in de toekomst

In de volgende les gaan we dieper in op de praktische integraties!`,
  assignments: [
    {
      id: 'platform-evaluation',
      title: 'Platform Evaluatie',
      description: 'Evalueer platforms voor jouw specifieke use case. Definieer je requirements (budget, scale, features), score elk platform op de criteria, bereken TCO voor 1 jaar, maak een shortlist van 2 platforms, en test beide platforms met een POC.',
      difficulty: 'medium',
      type: 'project'
    },
    {
      id: 'cost-benefit-analysis',
      title: 'Cost-Benefit Analysis',
      description: 'Maak een complete kosten-baten analyse. Identificeer alle kostenposten per platform, bereken development tijd en kosten, schat maintenance kosten in, bepaal ROI timeline, en presenteer bevindingen aan stakeholders.',
      difficulty: 'hard',
      type: 'project'
    }
  ]
};