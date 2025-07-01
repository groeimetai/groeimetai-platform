import { Lesson } from '@/lib/data/courses';

export const lesson2_1: Lesson = {
  id: 'voiceflow-deep-dive',
  title: 'Voiceflow deep dive: Visual bot building',
  duration: '60 minuten',
  content: `
# Voiceflow: Visual Bot Building Platform

Voiceflow is een krachtig platform voor het visueel bouwen van conversational AI zonder code. In deze les duiken we diep in alle mogelijkheden voor customer service bots.

## Waarom Voiceflow?

### Voordelen
- **Visuele interface**: Intuïtieve drag-and-drop canvas
- **Collaboratie**: Real-time samenwerken met teams
- **Prototyping**: Snel testen zonder deployment
- **Integraties**: Native koppelingen met populaire platforms
- **Analytics**: Ingebouwde conversation analytics

### Use Cases
- Customer support chatbots
- Lead generation bots
- FAQ automatisering
- Product recommendation engines
- Appointment scheduling

## Getting Started met Voiceflow

### 1. Account Setup en Workspace
\`\`\`yaml
project_settings:
  name: "Customer Service Bot"
  type: "Chat Assistant"
  language: "Dutch"
  timezone: "Europe/Amsterdam"
  
workspace_structure:
  - Development
  - Staging  
  - Production
\`\`\`

### 2. Canvas Overzicht
- **Blocks**: Bouwstenen van je conversatie
- **Connections**: Logische flow tussen blocks
- **Variables**: Data opslag tijdens conversatie
- **Components**: Herbruikbare flows

### 3. Essential Blocks

#### Text Block
\`\`\`javascript
{
  type: "text",
  content: "Welkom bij onze klantenservice! Hoe kan ik u helpen?",
  variants: [
    "Goedendag! Waarmee kan ik u van dienst zijn?",
    "Hallo! Heeft u een vraag voor ons?"
  ]
}
\`\`\`

#### Choice Block
\`\`\`javascript
{
  type: "choice",
  options: [
    {
      label: "Bestelling tracken",
      intent: "track_order"
    },
    {
      label: "Product informatie",
      intent: "product_info"
    },
    {
      label: "Retourneren",
      intent: "return_request"
    }
  ]
}
\`\`\`

## Natural Language Understanding

### Intent Configuratie
\`\`\`json
{
  "intents": [
    {
      "name": "track_order",
      "utterances": [
        "waar is mijn bestelling",
        "ik wil mijn pakket tracken",
        "wanneer komt mijn order aan",
        "track and trace informatie",
        "bezorgstatus opvragen"
      ],
      "entities": ["order_number", "email"]
    },
    {
      "name": "product_inquiry",
      "utterances": [
        "informatie over product",
        "specificaties van",
        "wat kost het",
        "is dit product op voorraad",
        "wanneer weer leverbaar"
      ],
      "entities": ["product_name", "product_id"]
    }
  ]
}
\`\`\`

### Entity Extraction
\`\`\`javascript
// Order Number Entity
{
  name: "order_number",
  type: "pattern",
  pattern: "ORD-[0-9]{6}",
  examples: ["ORD-123456", "ORD-789012"]
}

// Email Entity
{
  name: "email",
  type: "system",
  system_entity: "@sys.email"
}
\`\`\`

### Slot Filling Flow
\`\`\`yaml
slot_filling:
  order_tracking:
    required_slots:
      - order_number:
          prompt: "Wat is uw ordernummer?"
          validation: "pattern:ORD-[0-9]{6}"
      - email:
          prompt: "Op welk e-mailadres is de bestelling geplaatst?"
          validation: "email"
    
    completion_action: "fetch_order_status"
\`\`\`

## Geavanceerde Functionaliteiten

### 1. API Integraties
\`\`\`javascript
// API Block Configuration
{
  type: "api",
  method: "GET",
  url: "https://api.company.com/orders/{order_number}",
  headers: {
    "Authorization": "Bearer {api_token}",
    "Content-Type": "application/json"
  },
  response_mapping: {
    "status": "order.status",
    "delivery_date": "order.estimated_delivery",
    "tracking_url": "order.tracking.url"
  }
}
\`\`\`

### 2. Conditional Logic
\`\`\`javascript
// If Block voor order status
{
  type: "if",
  condition: "{order.status} == 'delivered'",
  then: {
    message: "Uw bestelling is afgeleverd op {order.delivery_date}"
  },
  else_if: [
    {
      condition: "{order.status} == 'in_transit'",
      message: "Uw pakket is onderweg. Verwachte levering: {order.estimated_delivery}"
    }
  ],
  else: {
    message: "We kunnen de status momenteel niet ophalen."
  }
}
\`\`\`

### 3. Knowledge Base Integration
\`\`\`yaml
knowledge_base:
  type: "faq"
  source: "csv"
  structure:
    question_column: "question"
    answer_column: "answer"
    category_column: "category"
    
  matching:
    algorithm: "semantic_search"
    threshold: 0.75
    fallback: "Ik kon geen passend antwoord vinden. Wilt u contact met een medewerker?"
\`\`\`

### 4. Multi-Channel Variables
\`\`\`javascript
// Channel-specific responses
{
  web: {
    format: "rich_text",
    features: ["buttons", "cards", "images"]
  },
  whatsapp: {
    format: "plain_text",
    features: ["quick_replies", "media"]
  },
  voice: {
    format: "ssml",
    features: ["speech_marks", "pauses"]
  }
}
\`\`\`

## Bot Testing Strategieën

### 1. Prototype Testing
\`\`\`yaml
test_scenarios:
  happy_path:
    - input: "Ik wil mijn bestelling tracken"
    - expected: "choice_prompt"
    - input: "ORD-123456"
    - expected: "email_prompt"
    - input: "klant@email.com"
    - expected: "order_status_display"
    
  edge_cases:
    - scenario: "invalid_order_number"
      input: "ABC123"
      expected: "validation_error"
    
    - scenario: "conversation_reset"
      input: "begin opnieuw"
      expected: "welcome_message"
\`\`\`

### 2. A/B Testing
\`\`\`javascript
// Variant testing configuration
{
  experiment: "welcome_message_test",
  variants: [
    {
      id: "formal",
      weight: 50,
      message: "Goedendag, welkom bij onze klantenservice."
    },
    {
      id: "casual", 
      weight: 50,
      message: "Hey! Waarmee kunnen we je helpen?"
    }
  ],
  metrics: ["engagement_rate", "completion_rate"]
}
\`\`\`

### 3. Analytics Setup
\`\`\`javascript
// Custom analytics events
{
  events: [
    {
      name: "order_tracked",
      properties: {
        order_status: "{order.status}",
        channel: "{channel}",
        session_duration: "{session.duration}"
      }
    },
    {
      name: "fallback_triggered",
      properties: {
        user_input: "{last_utterance}",
        intent_confidence: "{nlu.confidence}"
      }
    }
  ]
}
\`\`\`

### 4. Deployment Configuration
\`\`\`yaml
deployment:
  environments:
    development:
      version_control: true
      auto_save: true
      debug_mode: true
      
    staging:
      approval_required: true
      rollback_enabled: true
      analytics: "verbose"
      
    production:
      cdn_enabled: true
      rate_limiting: 
        requests_per_minute: 100
      error_handling: "graceful"
      monitoring: "datadog"
\`\`\`

## Voiceflow Best Practices

### 1. Conversation Design
- **Start simpel**: Begin met happy path, voeg complexiteit geleidelijk toe
- **Error handling**: Altijd fallback opties inbouwen
- **Context behoud**: Gebruik session variables effectief
- **Persoonlijkheid**: Consistente tone of voice

### 2. Performance Optimalisatie
\`\`\`javascript
// Efficient variable usage
{
  session_variables: {
    user_context: {
      ttl: 3600, // 1 hour
      persist: false
    },
    order_data: {
      ttl: 300, // 5 minutes
      persist: true
    }
  }
}
\`\`\`

### 3. Maintenance Workflow
\`\`\`yaml
maintenance_checklist:
  weekly:
    - Review fallback triggers
    - Update FAQ content
    - Check API response times
    
  monthly:
    - Analyze conversation metrics
    - Retrain NLU model
    - Update integration tokens
    
  quarterly:
    - Full conversation audit
    - Performance optimization
    - User feedback implementation
\`\`\`

### 4. Cost Management
\`\`\`javascript
// Resource monitoring
{
  quotas: {
    monthly_interactions: 10000,
    api_calls: 5000,
    knowledge_base_queries: 2000
  },
  alerts: {
    usage_threshold: 80,
    notification_channel: "email"
  }
}
\`\`\`

### Common Pitfalls
1. **Over-complexe flows**: Houd het simpel en modulair
2. **Slechte error handling**: Plan voor edge cases
3. **Geen analytics**: Meet vanaf dag 1
4. **Vergeten te testen**: Test elke wijziging

## Samenvatting

Voiceflow biedt een krachtige visuele omgeving voor het bouwen van customer service bots:

### Key Takeaways
- **Visual Development**: Geen code nodig voor complexe flows
- **Collaboration**: Teams kunnen real-time samenwerken
- **Testing**: Ingebouwde prototype testing
- **Analytics**: Detailed conversation insights
- **Scalability**: Van prototype tot production

### Volgende Stappen
1. Experimenteer met verschillende block types
2. Bouw je eerste complete conversation flow
3. Integreer met externe APIs
4. Deploy naar een test omgeving
5. Analyseer gebruikersinteracties

In de volgende les bekijken we Botpress als open-source alternatief!`,
  assignments: [
    {
      id: 'voiceflow-order-tracking',
      title: 'Bouw een Order Tracking Bot',
      description: 'Creëer een complete flow voor order tracking met Voiceflow. Maak een nieuw Voiceflow project aan, design de conversation flow voor order tracking, implementeer intent recognition voor verschillende vraagtypen, voeg API integratie toe voor order status, en test de bot met verschillende scenarios.',
      difficulty: 'medium',
      type: 'project'
    },
    {
      id: 'voiceflow-multichannel',
      title: 'Multi-Channel Deployment',
      description: 'Deploy dezelfde bot naar meerdere kanalen. Configureer channel-specific responses, test op web widget, configureer WhatsApp integratie, en implementeer fallback naar human agent.',
      difficulty: 'hard',
      type: 'project'
    }
  ]
};