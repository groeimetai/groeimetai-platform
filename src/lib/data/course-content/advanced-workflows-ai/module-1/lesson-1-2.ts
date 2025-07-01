import { Lesson } from '@/lib/data/courses'

export const lesson1_2: Lesson = {
  id: 'lesson-1-2',
  title: 'Complexe beslisbomen',
  duration: '30 min',
  content: `
# Complexe beslisbomen

## Introductie

Waar de vorige les zich richtte op basis IF/THEN logica, duiken we nu in geavanceerde beslisstructuren. Complexe beslisbomen zijn essentieel wanneer je workflows moet bouwen die meerdere variabelen evalueren, geneste condities bevatten, en intelligente routing vereisen op basis van business logica.

## Multi-level beslisbomen

### Hiërarchische structuur

Een multi-level beslisboom evalueert condities in lagen:

\`\`\`
Level 1: Hoofdcategorie
    ├─ Level 2: Subcategorie
    │      ├─ Level 3: Specifieke conditie
    │      │      ├─ Level 4: Actie A
    │      │      └─ Level 4: Actie B
    │      └─ Level 3: Andere conditie
    │             └─ Level 4: Actie C
    └─ Level 2: Andere subcategorie
           └─ Level 3: Default actie
\`\`\`

### Implementatie voorbeeld: E-commerce order flow

\`\`\`javascript
// Complexe order routing beslisboom
const orderDecisionTree = {
  evaluateOrder: (order) => {
    // Level 1: Payment status
    if (order.paymentStatus === 'completed') {
      
      // Level 2: Order type
      if (order.type === 'digital') {
        // Level 3: License type
        if (order.licenseType === 'enterprise') {
          // Level 4: Region specific
          if (order.region === 'EU') {
            return {
              action: 'generateEUEnterpiseLicense',
              priority: 'high',
              workflow: 'enterprise-eu-digital'
            };
          } else {
            return {
              action: 'generateGlobalEnterpriseLicense',
              priority: 'high',
              workflow: 'enterprise-global-digital'
            };
          }
        } else {
          return {
            action: 'generateStandardLicense',
            priority: 'normal',
            workflow: 'standard-digital'
          };
        }
      } else if (order.type === 'physical') {
        // Level 3: Shipping method
        if (order.shipping === 'express') {
          // Level 4: Stock availability
          if (order.items.every(item => item.inStock)) {
            return {
              action: 'immediateDispatch',
              priority: 'urgent',
              workflow: 'express-shipping-available'
            };
          } else {
            return {
              action: 'backorderWithPriorityFlag',
              priority: 'high',
              workflow: 'express-shipping-backorder'
            };
          }
        } else {
          return {
            action: 'standardFulfillment',
            priority: 'normal',
            workflow: 'standard-shipping'
          };
        }
      }
      
    } else if (order.paymentStatus === 'pending') {
      // Level 2: Payment method
      if (order.paymentMethod === 'bankTransfer') {
        return {
          action: 'waitForBankConfirmation',
          priority: 'low',
          workflow: 'pending-bank-transfer'
        };
      } else {
        return {
          action: 'retryPayment',
          priority: 'normal',
          workflow: 'payment-retry'
        };
      }
      
    } else {
      // Payment failed
      return {
        action: 'notifyCustomerPaymentFailed',
        priority: 'high',
        workflow: 'payment-failed'
      };
    }
  }
};
\`\`\`

## Geneste condities

### Pattern 1: Guard clauses

Gebruik guard clauses om complexiteit te verminderen:

\`\`\`javascript
// Slecht: Diepe nesting
function processRequest(request) {
  if (request.isValid) {
    if (request.user.isAuthenticated) {
      if (request.user.hasPermission) {
        if (request.data.isComplete) {
          // Eindelijk de actie
          return processData(request.data);
        }
      }
    }
  }
}

// Goed: Guard clauses
function processRequest(request) {
  if (!request.isValid) {
    return { error: 'Invalid request' };
  }
  
  if (!request.user.isAuthenticated) {
    return { error: 'Not authenticated' };
  }
  
  if (!request.user.hasPermission) {
    return { error: 'No permission' };
  }
  
  if (!request.data.isComplete) {
    return { error: 'Incomplete data' };
  }
  
  return processData(request.data);
}
\`\`\`

### Pattern 2: Decision tables

Voor complexe business rules gebruik decision tables:

\`\`\`javascript
// Decision table voor kortingsberekening
const discountDecisionTable = [
  {
    conditions: {
      customerType: 'new',
      orderValue: { min: 0, max: 50 },
      season: 'any'
    },
    result: { discount: 10, freeShipping: false }
  },
  {
    conditions: {
      customerType: 'new',
      orderValue: { min: 50, max: Infinity },
      season: 'any'
    },
    result: { discount: 15, freeShipping: true }
  },
  {
    conditions: {
      customerType: 'returning',
      orderValue: { min: 100, max: Infinity },
      season: 'summer'
    },
    result: { discount: 20, freeShipping: true, bonusPoints: 100 }
  },
  {
    conditions: {
      customerType: 'vip',
      orderValue: { min: 0, max: Infinity },
      season: 'any'
    },
    result: { discount: 25, freeShipping: true, bonusPoints: 200 }
  }
];

// Evaluatie functie
function calculateDiscount(order) {
  for (const rule of discountDecisionTable) {
    if (matchesConditions(order, rule.conditions)) {
      return rule.result;
    }
  }
  return { discount: 0, freeShipping: false };
}

function matchesConditions(order, conditions) {
  return (
    order.customerType === conditions.customerType &&
    order.value >= conditions.orderValue.min &&
    order.value < conditions.orderValue.max &&
    (conditions.season === 'any' || order.season === conditions.season)
  );
}
\`\`\`

## Business logica implementatie

### Voorbeeld: Credit scoring workflow

\`\`\`javascript
// Complexe credit scoring beslisboom
class CreditScoringEngine {
  constructor() {
    this.weightings = {
      income: 0.3,
      creditHistory: 0.25,
      employment: 0.2,
      assets: 0.15,
      liabilities: 0.1
    };
  }
  
  evaluateApplication(application) {
    // Stap 1: Basis eligibility check
    const eligibility = this.checkBasicEligibility(application);
    if (!eligibility.passed) {
      return {
        approved: false,
        reason: eligibility.reason,
        nextSteps: eligibility.nextSteps
      };
    }
    
    // Stap 2: Bereken gewogen score
    const scores = this.calculateScores(application);
    const weightedScore = this.applyWeightings(scores);
    
    // Stap 3: Bepaal loan tier op basis van score
    if (weightedScore >= 80) {
      return this.processHighTierApplication(application, weightedScore);
    } else if (weightedScore >= 60) {
      return this.processMidTierApplication(application, weightedScore);
    } else if (weightedScore >= 40) {
      return this.processLowTierApplication(application, weightedScore);
    } else {
      return {
        approved: false,
        score: weightedScore,
        reason: 'Score below minimum threshold',
        alternatives: this.suggestAlternatives(application)
      };
    }
  }
  
  checkBasicEligibility(app) {
    // Geneste eligibility checks
    if (app.age < 18) {
      return { passed: false, reason: 'Underage applicant' };
    }
    
    if (app.income < 20000) {
      if (app.hasCoSigner) {
        if (app.coSigner.income >= 40000) {
          return { passed: true };
        }
      }
      return { 
        passed: false, 
        reason: 'Insufficient income',
        nextSteps: ['Consider co-signer', 'Increase income proof']
      };
    }
    
    if (app.bankruptcyHistory) {
      const yearsSinceBankruptcy = this.calculateYearsSince(app.bankruptcyDate);
      if (yearsSinceBankruptcy < 7) {
        return {
          passed: false,
          reason: 'Recent bankruptcy',
          nextSteps: [\`Wait \${7 - yearsSinceBankruptcy} more years\`]
        };
      }
    }
    
    return { passed: true };
  }
  
  processHighTierApplication(app, score) {
    // Complexe routing voor high-tier applicaties
    const loanAmount = app.requestedAmount;
    const income = app.income;
    const dti = this.calculateDTI(app);
    
    if (loanAmount <= income * 3 && dti < 30) {
      return {
        approved: true,
        tier: 'Premium',
        rate: 3.5,
        maxAmount: income * 5,
        fastTrack: true
      };
    } else if (loanAmount <= income * 4 && dti < 40) {
      return {
        approved: true,
        tier: 'Standard Premium',
        rate: 4.5,
        maxAmount: income * 4,
        requirements: ['Income verification', 'Asset documentation']
      };
    } else {
      return {
        approved: 'conditional',
        tier: 'Premium with conditions',
        rate: 5.5,
        conditions: this.generateConditions(app, 'premium')
      };
    }
  }
}
\`\`\`

## Performance consideraties

### 1. Evaluatie volgorde optimalisatie

\`\`\`javascript
// Plaats meest discriminerende condities eerst
function optimizedRouting(request) {
  // Check snelle fail conditions eerst
  if (!request.apiKey) return { error: 'No API key' };
  if (request.banned) return { error: 'Account banned' };
  
  // Dan goedkope checks
  if (request.type === 'simple') {
    return handleSimpleRequest(request);
  }
  
  // Expensive checks als laatste
  if (validateComplexBusinessRules(request)) {
    return handleComplexRequest(request);
  }
}
\`\`\`

### 2. Caching strategieën

\`\`\`javascript
// Cache decision results voor herhaalde evaluaties
class DecisionCache {
  constructor(ttl = 300000) { // 5 minuten default
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  getCachedDecision(key, evaluationFunc) {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.result;
    }
    
    const result = evaluationFunc();
    this.cache.set(key, {
      result,
      timestamp: Date.now()
    });
    
    return result;
  }
}
\`\`\`

### 3. Parallelle evaluatie

\`\`\`javascript
// Evalueer onafhankelijke branches parallel
async function parallelDecisionTree(data) {
  const [
    customerScore,
    riskAssessment,
    complianceCheck
  ] = await Promise.all([
    evaluateCustomerScore(data),
    assessRisk(data),
    checkCompliance(data)
  ]);
  
  // Combineer results voor finale decisie
  return makeDecision({
    customerScore,
    riskAssessment,
    complianceCheck
  });
}
\`\`\`

## Best practices voor complexe beslisbomen

1. **Modulariteit**: Breek complexe trees op in herbruikbare sub-trees
2. **Testbaarheid**: Maak elke branch unit-testbaar
3. **Logging**: Log alle decision points voor debugging
4. **Visualisatie**: Gebruik tools om je decision tree te visualiseren
5. **Version control**: Track changes in business rules
6. **Performance monitoring**: Meet execution time per branch

## Common pitfalls

1. **Over-engineering**: Niet elke conditie vereist een complexe tree
2. **Hardcoded values**: Gebruik configuratie voor thresholds
3. **Missing edge cases**: Test alle mogelijke paden
4. **Poor documentation**: Document waarom beslissingen worden genomen
5. **No fallback**: Altijd een default path hebben
        `,
  codeExamples: [
    {
      id: 'example-1',
      title: 'N8N Nested Switch implementatie',
      language: 'json',
      code: `{
  "nodes": [
    {
      "name": "Primary Router",
      "type": "n8n-nodes-base.switch",
      "parameters": {
        "mode": "rules",
        "rules": [
          {
            "value1": "={{\$json.category}}",
            "operation": "equals",
            "value2": "sales",
            "output": 0
          }
        ]
      }
    },
    {
      "name": "Sales Sub-Router",
      "type": "n8n-nodes-base.switch",
      "parameters": {
        "mode": "rules",
        "rules": [
          {
            "value1": "={{\$json.value}}",
            "operation": "larger",
            "value2": 10000,
            "output": 0
          },
          {
            "value1": "={{\$json.region}}",
            "operation": "equals", 
            "value2": "enterprise",
            "output": 1
          }
        ],
        "fallbackOutput": 2
      }
    }
  ],
  "connections": {
    "Primary Router": {
      "main": [
        [
          {
            "node": "Sales Sub-Router",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}`
    },
    {
      id: 'example-2',
      title: 'Decision table implementatie',
      language: 'javascript',
      code: `// Configureerbare decision table
const pricingRules = {
  version: '2.0',
  lastUpdated: '2024-01-15',
  rules: [
    {
      id: 'RULE_001',
      name: 'Enterprise Volume Discount',
      priority: 1,
      conditions: {
        all: [
          { field: 'customer.type', operator: 'equals', value: 'enterprise' },
          { field: 'order.quantity', operator: 'greater_than', value: 1000 },
          { field: 'product.category', operator: 'in', value: ['software', 'saas'] }
        ]
      },
      actions: {
        applyDiscount: 25,
        addBonus: 'premium_support',
        route: 'enterprise_fulfillment'
      }
    },
    {
      id: 'RULE_002', 
      name: 'Loyalty Program',
      priority: 2,
      conditions: {
        all: [
          { field: 'customer.loyaltyYears', operator: 'greater_than', value: 2 },
          { field: 'order.total', operator: 'between', value: [500, 5000] }
        ],
        any: [
          { field: 'customer.tier', operator: 'equals', value: 'gold' },
          { field: 'customer.referrals', operator: 'greater_than', value: 5 }
        ]
      },
      actions: {
        applyDiscount: 15,
        addPoints: 500,
        route: 'loyalty_processing'
      }
    }
  ],
  
  evaluate: function(context) {
    const applicableRules = this.rules
      .filter(rule => this.checkConditions(rule.conditions, context))
      .sort((a, b) => a.priority - b.priority);
    
    return applicableRules.length > 0 ? applicableRules[0].actions : null;
  },
  
  checkConditions: function(conditions, context) {
    if (conditions.all) {
      const allMet = conditions.all.every(cond => 
        this.evaluateCondition(cond, context)
      );
      if (!allMet) return false;
    }
    
    if (conditions.any) {
      const anyMet = conditions.any.some(cond => 
        this.evaluateCondition(cond, context)
      );
      if (!anyMet) return false;
    }
    
    return true;
  }
};`
    }
  ],
  assignments: [
    {
      id: 'assignment-1-2-1',
      title: 'Ontwerp een fraud detection beslisboom',
      description: 'Creëer een multi-level beslisboom die transacties evalueert op basis van bedrag, frequentie, locatie, en historisch gedrag om frauduleuze activiteiten te detecteren.',
      difficulty: 'hard',
      type: 'project',
      initialCode: `// Input: { transactionId: '...', amount: 1500, currency: 'EUR', userId: '...', location: 'NL', historicalData: { ... } }

// Ontwerp de beslisboom met meerdere niveaus
// Level 1: Bedrag
//   - IF amount > 1000 -> High-risk, ga naar Level 2
//   - ELSE -> Medium-risk, ga naar Level 3
// Level 2: Locatie & Frequentie
//   - IF location != historicalData.commonLocation AND frequency > 5/day -> Flag as suspicious
//   - ELSE -> Ga naar Level 3
// Level 3: Historisch gedrag
//   - ... etc.
`,
      hints: [
        'Gebruik een combinatie van Switch nodes (N8N) of Routers (Make.com).',
        'Denk aan het loggen van de beslissingsstappen voor audit doeleinden.',
        'Maak de drempelwaarden configureerbaar.'
      ]
    },
    {
      id: 'assignment-1-2-2',
      title: 'Bouw een dynamic pricing engine',
      description: 'Implementeer een complexe beslisstructuur die prijzen aanpast op basis van vraag, voorraad, seizoen, klanttype, en concurrentie.',
      difficulty: 'expert',
      type: 'project',
      initialCode: `// Input: { productId: '...', stockLevel: 50, demandScore: 0.8, season: 'summer', customerType: 'vip' }

// Implementeer een decision table of een geneste if-structuur
// Voorbeeld regel:
// IF demandScore > 0.7 AND stockLevel < 100 AND season == 'summer' -> price *= 1.2
// IF customerType == 'vip' -> price *= 0.9
`,
      hints: [
        'Een decision table in een Google Sheet kan een goede manier zijn om de regels te beheren.',
        'Zorg voor een basisprijs waarop de aanpassingen worden toegepast.',
        'Test met verschillende scenario\'s om de prijselasticiteit te begrijpen.'
      ]
    }
  ],
  resources: [
    {
      title: 'Decision Model and Notation (DMN) standaard',
      url: 'https://www.omg.org/dmn/',
      type: 'standard'
    },
    {
      title: 'Business Rules Engine patterns',
      url: 'https://martinfowler.com/bliki/RulesEngine.html',
      type: 'article'
    }
  ]
}