import { Lesson } from '@/lib/data/courses'

export const lesson1_1: Lesson = {
  id: 'lesson-1-1',
  title: 'Router nodes en IF/THEN logica',
  duration: '25 min',
  content: `
# Router nodes en IF/THEN logica

## Introductie

Router nodes zijn de basis van conditionele logica in workflow automatisering. Ze fungeren als verkeersregelaars die data naar verschillende paden leiden op basis van vooraf gedefinieerde voorwaarden. In deze les leer je hoe je router nodes effectief inzet voor IF/THEN logica in N8N en Make.com.

## Router nodes begrijpen

Een router node evalueert inkomende data en stuurt deze naar verschillende outputs op basis van condities. Dit is vergelijkbaar met een IF/THEN statement in programmeren:

- **IF** (voorwaarde is waar) → **THEN** (voer actie A uit)
- **ELSE IF** (andere voorwaarde) → **THEN** (voer actie B uit)
- **ELSE** → (voer standaard actie uit)

### Basisstructuur in N8N

In N8N gebruik je de "Switch" node voor routing:

\`\`\`json
{
  "mode": "rules",
  "rules": [
    {
      "output": 0,
      "value1": "{{\$json.status}}",
      "operation": "equals",
      "value2": "approved"
    },
    {
      "output": 1,
      "value1": "{{\$json.status}}",
      "operation": "equals",
      "value2": "rejected"
    }
  ],
  "fallbackOutput": 2
}
\`\`\`

### Basisstructuur in Make.com

In Make.com gebruik je router modules met filters:

\`\`\`
Route 1: Status = "Approved"
Route 2: Status = "Rejected"
Route 3: All other cases (fallback)
\`\`\`

## Eenvoudige IF/THEN patronen

### Voorbeeld 1: Order verwerking

Een e-commerce workflow die orders anders verwerkt op basis van het bedrag:

\`\`\`javascript
// N8N Expression
{{\$json.orderAmount > 100 ? "premium" : "standard"}}

// Routing logic
if (orderAmount > 100) {
  // Route naar premium verwerking
  // - Prioriteit verzending
  // - Gratis gift toevoegen
  // - VIP email sturen
} else {
  // Route naar standaard verwerking
  // - Normale verzending
  // - Standaard email
}
\`\`\`

### Voorbeeld 2: Lead kwalificatie

Automatische lead scoring op basis van meerdere criteria:

\`\`\`javascript
// Evaluatie criteria
const leadScore = {
  hasCompanyEmail: email.includes('@company.') ? 20 : 0,
  budgetSize: budget > 10000 ? 30 : 10,
  urgency: timeframe === 'immediate' ? 25 : 5,
  companySize: employees > 50 ? 25 : 10
};

const totalScore = Object.values(leadScore).reduce((a, b) => a + b, 0);

// Routing beslissing
if (totalScore >= 80) {
  // Route naar sales team (hot lead)
} else if (totalScore >= 50) {
  // Route naar nurturing campaign
} else {
  // Route naar algemene nieuwsbrief
}
\`\`\`

## Meerdere output paden

### Parallelle verwerking

Soms wil je data naar meerdere paden tegelijk sturen:

\`\`\`javascript
// N8N Workflow structuur
Switch Node → {
  Output 0: Email notificatie EN
  Output 0: Slack bericht EN
  Output 0: Database update
  
  Output 1: Error log EN
  Output 1: Admin alert
}
\`\`\`

### Sequentiële routing

Voor complexere scenario's kun je routers in serie schakelen:

\`\`\`
Router 1: Taal detectie
  ├─ NL → Router 2: Regio
  │        ├─ Noord → Actie A
  │        └─ Zuid → Actie B
  ├─ EN → Router 3: Product type
  │        ├─ Software → Actie C
  │        └─ Hardware → Actie D
  └─ Other → Standaard actie
\`\`\`

## Praktische voorbeelden

### Customer support routing

\`\`\`javascript
// Ticket routing op basis van prioriteit en type
const routingRules = {
  highPriority: {
    condition: (ticket) => ticket.priority === 'urgent' || ticket.customerTier === 'enterprise',
    action: 'directToSeniorSupport',
    sla: '1 hour'
  },
  technical: {
    condition: (ticket) => ticket.category === 'technical' && ticket.complexity === 'high',
    action: 'assignToTechTeam',
    sla: '4 hours'
  },
  billing: {
    condition: (ticket) => ticket.category === 'billing',
    action: 'assignToBillingTeam',
    sla: '24 hours'
  },
  default: {
    condition: () => true,
    action: 'generalQueue',
    sla: '48 hours'
  }
};

// Implementatie in workflow
function routeTicket(ticket) {
  for (const [key, rule] of Object.entries(routingRules)) {
    if (rule.condition(ticket)) {
      return {
        route: rule.action,
        sla: rule.sla,
        priority: key
      };
    }
  }
}
\`\`\`

### Dynamic pricing workflow

\`\`\`javascript
// Prijs aanpassing op basis van verschillende factoren
const pricingRouter = {
  evaluateCustomer: (customer) => {
    const factors = {
      isNewCustomer: !customer.previousOrders,
      isVIP: customer.totalSpent > 1000,
      hasPromoCode: !!customer.promoCode,
      orderSize: customer.cartItems.length
    };
    
    // Router output bepaling
    if (factors.isVIP) {
      return 'vipPricing'; // 20% korting
    } else if (factors.isNewCustomer && factors.hasPromoCode) {
      return 'newCustomerPromo'; // 15% korting
    } else if (factors.orderSize > 5) {
      return 'bulkDiscount'; // 10% korting
    } else {
      return 'standardPricing'; // Geen korting
    }
  }
};
\`\`\`

## Best practices

1. **Keep it simple**: Begin met eenvoudige IF/THEN logica en bouw geleidelijk complexiteit op
2. **Document routes**: Voeg duidelijke labels en beschrijvingen toe aan elke route
3. **Handle edge cases**: Zorg altijd voor een fallback route voor onverwachte situaties
4. **Test thoroughly**: Test alle mogelijke paden met verschillende scenario's
5. **Monitor performance**: Houd bij welke routes het meest gebruikt worden

## Performance tips

- Plaats meest voorkomende condities bovenaan
- Gebruik efficiente vergelijkingen (exact match > contains > regex)
- Vermijd te diepe nesting (max 3-4 levels)
- Overweeg parallelle verwerking waar mogelijk
        `,
  codeExamples: [
    {
      id: 'example-1',
      title: 'N8N Switch Node configuratie',
      language: 'json',
      code: `{
  "nodes": [
    {
      "name": "Order Router",
      "type": "n8n-nodes-base.switch",
      "position": [450, 300],
      "parameters": {
        "mode": "rules",
        "rules": [
          {
            "value1": "={{\$json.orderTotal}}",
            "operation": "larger",
            "value2": 100,
            "output": 0
          },
          {
            "value1": "={{\$json.customerType}}",
            "operation": "equals",
            "value2": "vip",
            "output": 1
          }
        ],
        "fallbackOutput": 2
      }
    }
  ]
}`
    },
    {
      id: 'example-2',
      title: 'Make.com Router met filters',
      language: 'javascript',
      code: `// Filter voor Route 1
{
  "condition": "and",
  "rules": [
    {
      "field": "status",
      "operator": "equal",
      "value": "new"
    },
    {
      "field": "priority",
      "operator": "equal", 
      "value": "high"
    }
  ]
}

// Filter voor Route 2
{
  "condition": "or",
  "rules": [
    {
      "field": "category",
      "operator": "equal",
      "value": "support"
    },
    {
      "field": "urgency",
      "operator": "greater",
      "value": 8
    }
  ]
}`
    }
  ],
  assignments: [
    {
      id: 'assignment-1-1-1',
      title: 'Build een customer onboarding router',
      description: 'Creëer een workflow die nieuwe klanten routeert op basis van hun accounttype (free/pro/enterprise) naar verschillende onboarding flows.',
      difficulty: 'medium',
      type: 'project',
      initialCode: `// Pseudocode voor de router logica
// Input: { customerId: '...', accountType: 'pro' }

// Implementeer de router in N8N of Make.com
// 1. Trigger: Webhook voor nieuwe klant
// 2. Router:
//    - IF accountType == 'free' -> Route naar 'Free Onboarding'
//    - IF accountType == 'pro' -> Route naar 'Pro Onboarding'
//    - IF accountType == 'enterprise' -> Route naar 'Enterprise Onboarding'
// 3. Acties: Stuur welkomstmail, voeg toe aan mailinglijst, etc.
`,
      hints: [
        'Gebruik een Switch node in N8N.',
        'Gebruik een Router module in Make.com.',
        'Denk aan een fallback route voor onbekende account types.'
      ]
    },
    {
      id: 'assignment-1-1-2',
      title: 'Implementeer een content moderation systeem',
      description: 'Bouw een router die user-generated content analyseert en routeert naar: auto-approve, manual review, of auto-reject.',
      difficulty: 'hard',
      type: 'project',
      initialCode: `// Input: { contentId: '...', text: '...', authorId: '...' }

// 1. Analyseer de content (bijv. met een AI model)
//    - Krijg een 'moderation_score' (0-1)
//    - Krijg een 'category' (bijv. 'safe', 'spam', 'hate_speech')

// 2. Implementeer de router
//    - IF moderation_score > 0.9 -> Auto-approve
//    - IF moderation_score < 0.4 -> Auto-reject
//    - ELSE -> Manual review
`,
      hints: [
        'Je kunt een externe API aanroepen voor de content analyse.',
        'Zorg voor een duidelijke logging van elke beslissing.',
        'De manual review flow kan een taak aanmaken in een project management tool.'
      ]
    }
  ],
  resources: [
    {
      title: 'N8N Switch Node documentatie',
      url: 'https://docs.n8n.io/nodes/n8n-nodes-base.switch/',
      type: 'documentation'
    },
    {
      title: 'Make.com Router module guide',
      url: 'https://www.make.com/en/help/modules/router',
      type: 'guide'
    }
  ]
}