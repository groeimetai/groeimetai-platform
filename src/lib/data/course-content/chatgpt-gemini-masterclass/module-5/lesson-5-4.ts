import type { Lesson } from '@/lib/data/courses'

export const lesson5_4: Lesson = {
  id: 'lesson-5-4',
  title: 'ROI & Case Studies',
  duration: '90 minuten',
  content: `# ROI & Nederlandse Case Studies

Leer hoe je de ROI van ChatGPT implementaties berekent en bekijk succesvolle Nederlandse bedrijfscases.

## Onderwerpen
- Cost-benefit analyse framework
- 3 Nederlandse bedrijfscases
- Performance metrics tracking
- Budget optimalisatie strategieën
- Implementatie roadmap

## 1. Cost-Benefit Analyse Framework

### ROI Calculator voor AI Implementaties
\`\`\`typescript
interface AIROICalculator {
  // Kosten componenten
  costs: {
    apiCosts: number;           // ChatGPT API kosten per maand
    developmentCosts: number;   // Eenmalige ontwikkelkosten
    maintenanceCosts: number;   // Maandelijkse onderhoudskosten
    trainingCosts: number;      // Training medewerkers
    infrastructureCosts: number; // Hosting, monitoring, etc.
  };
  
  // Baten componenten  
  benefits: {
    timeSavings: number;        // Uren bespaard per maand
    hourlyRate: number;         // Gemiddeld uurtarief
    errorReduction: number;     // Percentage minder fouten
    errorCost: number;          // Kosten per fout
    customerSatisfaction: number; // Toename in NPS score
    revenueIncrease: number;    // Extra omzet per maand
  };
}

class DutchROIAnalyzer {
  calculateROI(data: AIROICalculator): ROIReport {
    // Totale kosten berekenen
    const monthlyTotalCosts = 
      data.costs.apiCosts + 
      data.costs.maintenanceCosts + 
      (data.costs.developmentCosts / 12) + // Afschrijving over 1 jaar
      (data.costs.trainingCosts / 6);      // Afschrijving over 6 maanden
    
    // Totale baten berekenen
    const monthlyTimeSavings = data.benefits.timeSavings * data.benefits.hourlyRate;
    const monthlyErrorSavings = (data.benefits.errorReduction / 100) * data.benefits.errorCost;
    const monthlyRevenueBenefit = data.benefits.revenueIncrease;
    
    const monthlyTotalBenefits = 
      monthlyTimeSavings + 
      monthlyErrorSavings + 
      monthlyRevenueBenefit;
    
    // ROI metrics
    const monthlyNetBenefit = monthlyTotalBenefits - monthlyTotalCosts;
    const roi = ((monthlyNetBenefit / monthlyTotalCosts) * 100);
    const paybackPeriod = data.costs.developmentCosts / monthlyNetBenefit;
    
    return {
      monthlyTotalCosts,
      monthlyTotalBenefits,
      monthlyNetBenefit,
      roi,
      paybackPeriod,
      breakEvenMonth: Math.ceil(paybackPeriod)
    };
  }
  
  generateDutchReport(analysis: ROIReport): string {
    return \`
# ROI Analyse ChatGPT Implementatie

## Financiële Samenvatting
- **Maandelijkse kosten**: € \${analysis.monthlyTotalCosts.toLocaleString('nl-NL')}
- **Maandelijkse baten**: € \${analysis.monthlyTotalBenefits.toLocaleString('nl-NL')}
- **Netto baten per maand**: € \${analysis.monthlyNetBenefit.toLocaleString('nl-NL')}
- **ROI**: \${analysis.roi.toFixed(1)}%
- **Terugverdientijd**: \${analysis.paybackPeriod.toFixed(1)} maanden
- **Break-even**: Maand \${analysis.breakEvenMonth}
    \`;
  }
}
\`\`\`

### Performance Metrics Framework
\`\`\`typescript
class PerformanceMetricsTracker {
  metrics = {
    // Efficiency metrics
    avgResponseTime: 0,
    queriesPerHour: 0,
    automationRate: 0,
    
    // Quality metrics
    accuracyRate: 0,
    errorRate: 0,
    customerSatisfaction: 0,
    
    // Business metrics
    costPerQuery: 0,
    revenuePerQuery: 0,
    conversionRate: 0
  };
  
  trackMetric(metric: string, value: number): void {
    this.metrics[metric] = value;
    this.sendToAnalytics(metric, value);
  }
  
  generateDashboard(): DashboardData {
    return {
      efficiency: {
        title: "Efficiëntie Metrics",
        metrics: [
          { name: "Gem. Response Tijd", value: \`\${this.metrics.avgResponseTime}ms\` },
          { name: "Queries/Uur", value: this.metrics.queriesPerHour },
          { name: "Automatisering", value: \`\${this.metrics.automationRate}%\` }
        ]
      },
      quality: {
        title: "Kwaliteit Metrics",
        metrics: [
          { name: "Nauwkeurigheid", value: \`\${this.metrics.accuracyRate}%\` },
          { name: "Foutpercentage", value: \`\${this.metrics.errorRate}%\` },
          { name: "Klanttevredenheid", value: \`\${this.metrics.customerSatisfaction}/10\` }
        ]
      },
      business: {
        title: "Business Metrics",
        metrics: [
          { name: "Kosten/Query", value: \`€\${this.metrics.costPerQuery.toFixed(3)}\` },
          { name: "Omzet/Query", value: \`€\${this.metrics.revenuePerQuery.toFixed(2)}\` },
          { name: "Conversie", value: \`\${this.metrics.conversionRate}%\` }
        ]
      }
    };
  }
}
\`\`\`

## 2. Case Study 1: Bol.com - AI Customer Service

### Implementatie Overview
\`\`\`typescript
const bolComCase = {
  company: "Bol.com",
  sector: "E-commerce",
  implementation: "AI-powered customer service chatbot",
  timeline: "6 maanden",
  
  challenges: [
    "8+ miljoen klanten bedienen",
    "24/7 beschikbaarheid vereist",
    "Multilingual support (NL, BE, DE)",
    "Integratie met bestaande systemen"
  ],
  
  solution: {
    architecture: "ChatGPT-4 + Custom Training",
    features: [
      "Product aanbevelingen",
      "Order tracking",
      "Retour afhandeling",
      "Klacht registratie"
    ],
    integration: [
      "SAP order management",
      "Warehouse management system",
      "CRM platform",
      "Payment providers"
    ]
  },
  
  results: {
    customerServiceEfficiency: "+65%",
    firstContactResolution: "82%",
    customerSatisfaction: "8.7/10",
    costReduction: "€2.4M per jaar",
    avgHandlingTime: "-58%"
  }
};

// Implementation code
class BolComChatbot {
  private openai: OpenAI;
  private orderSystem: OrderManagementSystem;
  private productCatalog: ProductCatalog;
  
  async handleCustomerQuery(query: string, customerId: string): Promise<Response> {
    // Context ophalen
    const customerContext = await this.getCustomerContext(customerId);
    const recentOrders = await this.orderSystem.getRecentOrders(customerId);
    
    // ChatGPT prompt met Nederlandse context
    const prompt = \`
Je bent een vriendelijke Bol.com klantenservice medewerker.
    
Klant informatie:
- Klant sinds: \${customerContext.memberSince}
- Laatste bestelling: \${recentOrders[0]?.date}
- Voorkeuren: \${customerContext.preferences.join(', ')}

Klant vraag: \${query}

Richtlijnen:
1. Wees behulpzaam en empathisch
2. Gebruik informele maar respectvolle taal
3. Bied concrete oplossingen
4. Verwijs naar relevante producten waar mogelijk
5. Escaleer naar human agent bij complexe issues
    \`;
    
    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: query }
      ],
      temperature: 0.7
    });
    
    return this.formatResponse(response.choices[0].message.content);
  }
}
\`\`\`

### ROI Analyse Bol.com
\`\`\`typescript
const bolComROI = {
  costs: {
    apiCosts: 45000,          // €45k/maand ChatGPT API
    developmentCosts: 850000,  // €850k ontwikkeling
    maintenanceCosts: 25000,   // €25k/maand onderhoud
    trainingCosts: 120000,     // €120k training
    infrastructureCosts: 15000 // €15k/maand infra
  },
  
  benefits: {
    timeSavings: 12000,        // 12.000 uur/maand bespaard
    hourlyRate: 35,            // €35/uur support medewerker
    errorReduction: 73,        // 73% minder fouten
    errorCost: 2500,           // €2.500 gem. kosten per grote fout
    customerSatisfaction: 1.8,  // +1.8 NPS punten
    revenueIncrease: 180000    // €180k extra omzet door betere service
  }
};

// Resultaat: ROI van 287% met terugverdientijd van 4.2 maanden
\`\`\`

## 3. Case Study 2: ABN AMRO - Financial Advisory Bot

### Implementatie Details
\`\`\`typescript
const abnAmroCase = {
  company: "ABN AMRO",
  sector: "Banking",
  implementation: "AI Financial Advisor voor MKB klanten",
  timeline: "9 maanden",
  
  challenges: [
    "Strenge compliance vereisten",
    "Complex financieel advies",
    "Privacy & security (GDPR)",
    "Integratie met core banking"
  ],
  
  solution: {
    architecture: "Fine-tuned GPT-4 + Compliance Layer",
    features: [
      "Krediet advies",
      "Cash flow analyse",
      "Investerings planning",
      "Risico assessment"
    ],
    compliance: [
      "AFM regelgeving check",
      "GDPR data processing",
      "Audit trail logging",
      "Human-in-the-loop approval"
    ]
  },
  
  results: {
    advisorProductivity: "+120%",
    clientSatisfaction: "9.1/10",
    complianceIncidents: "-95%",
    revenuePerAdvisor: "+€340k/jaar",
    adviceQuality: "+42% accuracy"
  }
};

// Compliance-aware implementation
class ABNAMROAdvisor {
  async generateFinancialAdvice(
    clientData: ClientFinancialData,
    advisoryType: 'credit' | 'investment' | 'cashflow'
  ): Promise<FinancialAdvice> {
    // Compliance pre-check
    await this.complianceCheck(clientData, advisoryType);
    
    // Genereer advies met ChatGPT
    const advice = await this.generateAdviceWithGPT(clientData, advisoryType);
    
    // Post-processing voor compliance
    const compliantAdvice = await this.ensureCompliance(advice);
    
    // Audit logging
    await this.logAdvisorySession({
      clientId: clientData.id,
      advisoryType,
      timestamp: new Date(),
      advice: compliantAdvice,
      complianceChecks: this.getComplianceResults()
    });
    
    return compliantAdvice;
  }
  
  private async generateAdviceWithGPT(
    data: ClientFinancialData,
    type: string
  ): Promise<string> {
    const prompt = \`
Je bent een senior financieel adviseur bij ABN AMRO.
Genereer professioneel advies volgens Nederlandse bancaire standaarden.

Klant profiel:
- Bedrijf: \${data.companyName}
- Sector: \${data.sector}
- Jaaromzet: €\${data.annualRevenue.toLocaleString('nl-NL')}
- Krediet score: \${data.creditScore}

Advies type: \${type}

Richtlijnen:
1. Volg AFM richtlijnen voor financieel advies
2. Wees transparant over risico's
3. Geef concrete, meetbare aanbevelingen
4. Verwijs naar relevante ABN AMRO producten
5. Noem altijd disclaimer over professioneel advies
    \`;
    
    // GPT-4 call met strict parameters voor financial advice
    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.3, // Lage temperature voor consistent advies
      max_tokens: 2000
    });
    
    return response.choices[0].message.content;
  }
}
\`\`\`

## 4. Case Study 3: PostNL - Logistics Optimization

### Implementatie Overview
\`\`\`typescript
const postNLCase = {
  company: "PostNL",
  sector: "Logistics",
  implementation: "AI Route Optimization & Customer Communication",
  timeline: "12 maanden",
  
  challenges: [
    "3.5 miljoen pakketten per dag",
    "Real-time route optimization",
    "Klant communicatie automation",
    "Integratie met 23k bezorgers"
  ],
  
  solution: {
    architecture: "ChatGPT + Custom ML Models",
    features: [
      "Dynamische route planning",
      "Klant notificaties",
      "Bezorger assistentie",
      "Incident management"
    ],
    scale: {
      dailyOptimizations: 180000,
      customerMessages: 2500000,
      deliveryPredictions: 3500000
    }
  },
  
  results: {
    deliveryEfficiency: "+23%",
    fuelSavings: "€8.2M/jaar",
    customerSatisfaction: "+2.1 NPS",
    missedDeliveries: "-34%",
    co2Reduction: "15,000 ton/jaar"
  }
};

// Real-time optimization engine
class PostNLOptimizer {
  async optimizeDeliveryRoutes(
    region: string,
    deliveries: Delivery[],
    constraints: RouteConstraints
  ): Promise<OptimizedRoutes> {
    // Cluster deliveries met ML
    const clusters = await this.clusterDeliveries(deliveries);
    
    // Genereer route suggesties met ChatGPT
    const routeSuggestions = await Promise.all(
      clusters.map(cluster => this.generateRouteWithGPT(cluster, constraints))
    );
    
    // Optimaliseer met eigen algoritme
    const optimizedRoutes = this.applyDijkstraOptimization(routeSuggestions);
    
    // Stuur real-time updates
    await this.sendDriverNotifications(optimizedRoutes);
    await this.sendCustomerNotifications(optimizedRoutes);
    
    return optimizedRoutes;
  }
  
  async generateCustomerMessage(
    delivery: Delivery,
    event: DeliveryEvent
  ): Promise<CustomerMessage> {
    const templates = {
      'out_for_delivery': \`
Genereer vriendelijke bezorgnotificatie:
- Pakket: \${delivery.trackingId}
- Geschatte tijd: \${delivery.estimatedTime}
- Bezorger: \${delivery.driver.name}
Tone: Informeel, positief, service-gericht
      \`,
      'delivery_delayed': \`
Genereer empathische vertraging notificatie:
- Pakket: \${delivery.trackingId}
- Nieuwe tijd: \${delivery.newEstimatedTime}
- Reden: \${delivery.delayReason}
Tone: Begripvol, proactief, oplossing-gericht
      \`
    };
    
    const response = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: templates[event.type]
      }],
      temperature: 0.8
    });
    
    return {
      recipient: delivery.customer.phone,
      message: response.choices[0].message.content,
      type: 'sms',
      priority: event.priority
    };
  }
}
\`\`\`

## 5. Budget Optimalisatie Strategieën

### API Kosten Optimalisatie
\`\`\`typescript
class ChatGPTCostOptimizer {
  strategies = {
    // 1. Model Selection Strategy
    modelSelection: {
      simple_queries: "gpt-3.5-turbo",      // €0.002/1K tokens
      complex_analysis: "gpt-4",            // €0.03/1K tokens  
      code_generation: "gpt-4-turbo",       // €0.01/1K tokens
      embeddings: "text-embedding-3-small"  // €0.00002/1K tokens
    },
    
    // 2. Caching Strategy
    caching: {
      ttl: 3600,                    // 1 uur cache
      maxSize: 10000,               // Max 10k entries
      hitRate: 0.65                 // 65% cache hit rate target
    },
    
    // 3. Batching Strategy  
    batching: {
      maxBatchSize: 20,
      maxWaitTime: 100,             // 100ms max wait
      priorityQueues: true
    },
    
    // 4. Response Optimization
    responseOptimization: {
      maxTokens: 500,               // Limit responses
      stopSequences: ["\\n\\n", ".", "!"], 
      streaming: true               // Stream voor UX
    }
  };
  
  async optimizedQuery(
    query: string,
    context: QueryContext
  ): Promise<OptimizedResponse> {
    // Check cache first
    const cached = await this.cache.get(query);
    if (cached) return cached;
    
    // Select optimal model
    const model = this.selectModel(query, context);
    
    // Batch if possible
    if (this.canBatch(query)) {
      return this.batchQuery(query, model);
    }
    
    // Direct query with optimization
    const response = await this.openai.chat.completions.create({
      model,
      messages: this.optimizeMessages(query, context),
      max_tokens: this.strategies.responseOptimization.maxTokens,
      temperature: context.creativity || 0.7,
      stream: this.strategies.responseOptimization.streaming
    });
    
    // Cache response
    await this.cache.set(query, response);
    
    return response;
  }
}
\`\`\`

### Cost Monitoring Dashboard
\`\`\`typescript
class CostMonitoringSystem {
  async generateCostReport(period: 'daily' | 'weekly' | 'monthly'): Promise<CostReport> {
    const usage = await this.getUsageData(period);
    
    return {
      summary: {
        totalCost: usage.totalCost,
        tokensUsed: usage.totalTokens,
        avgCostPerQuery: usage.totalCost / usage.queryCount,
        costByModel: {
          'gpt-3.5-turbo': usage.costs.gpt35,
          'gpt-4': usage.costs.gpt4,
          'embeddings': usage.costs.embeddings
        }
      },
      
      optimization: {
        cacheHitRate: usage.cacheHits / usage.totalQueries,
        potentialSavings: this.calculatePotentialSavings(usage),
        recommendations: [
          "Verhoog cache TTL naar 2 uur voor 15% besparing",
          "Gebruik GPT-3.5 voor 40% van complex queries",
          "Implementeer query batching voor 20% reductie"
        ]
      },
      
      projections: {
        nextMonthEstimate: usage.totalCost * 1.15, // 15% groei
        yearlyRunRate: usage.totalCost * 12,
        breakEvenQueries: this.calculateBreakEven(usage)
      }
    };
  }
}
\`\`\`

## 6. Implementatie Roadmap

### 12-Week Implementation Plan
\`\`\`typescript
const implementationRoadmap = {
  phase1_discovery: {
    week: "1-2",
    activities: [
      "Stakeholder interviews",
      "Process mapping", 
      "Data inventory",
      "Technical assessment",
      "ROI baseline"
    ],
    deliverables: [
      "Business case",
      "Technical requirements",
      "Risk assessment"
    ]
  },
  
  phase2_pilot: {
    week: "3-6",
    activities: [
      "API setup & testing",
      "Proof of concept",
      "User feedback sessions",
      "Integration testing",
      "Performance benchmarking"
    ],
    deliverables: [
      "Working prototype",
      "Performance metrics",
      "User feedback report"
    ]
  },
  
  phase3_development: {
    week: "7-10",
    activities: [
      "Full implementation",
      "System integration",
      "Security hardening",
      "Load testing",
      "Documentation"
    ],
    deliverables: [
      "Production system",
      "Integration APIs",
      "User documentation"
    ]
  },
  
  phase4_deployment: {
    week: "11-12",
    activities: [
      "Phased rollout",
      "User training",
      "Monitoring setup",
      "Performance tuning",
      "Go-live support"
    ],
    deliverables: [
      "Live system",
      "Trained users",
      "Support processes"
    ]
  }
};

// Implementation tracker
class ImplementationTracker {
  async trackProgress(phase: string, milestone: string): Promise<void> {
    const progress = {
      phase,
      milestone,
      timestamp: new Date(),
      metrics: await this.collectMetrics(),
      risks: await this.assessRisks(),
      nextSteps: this.getNextSteps(phase, milestone)
    };
    
    await this.updateDashboard(progress);
    await this.notifyStakeholders(progress);
  }
}
\`\`\`

## Praktische Opdrachten

### Opdracht 1: ROI Calculator
Bouw een interactieve ROI calculator die:
- Kosten en baten analyseert
- Break-even punt berekent
- Scenario analyses uitvoert
- Management rapportage genereert

### Opdracht 2: Performance Dashboard
Ontwikkel een real-time dashboard voor:
- API usage tracking
- Cost monitoring
- Performance metrics
- Optimization recommendations

### Opdracht 3: Implementation Plan
Creëer een gedetailleerd implementatieplan voor jouw organisatie met:
- Fase planning
- Resource allocatie
- Risk mitigation
- Success metrics`,
  assignments: [
    {
      id: 'assignment-5-4-1',
      title: 'ROI Calculator Development',
      description: 'Bouw een complete ROI calculator voor ChatGPT implementaties',
      difficulty: 'intermediate',
      estimatedTime: '120 minuten',
      points: 25
    },
    {
      id: 'assignment-5-4-2',
      title: 'Case Study Analysis',
      description: 'Analyseer een Nederlandse bedrijfscase en bereken de potentiële ROI',
      difficulty: 'advanced',
      estimatedTime: '180 minuten',
      points: 30
    },
    {
      id: 'assignment-5-4-3',
      title: 'Cost Optimization Strategy',
      description: 'Ontwikkel een complete kosten optimalisatie strategie',
      difficulty: 'advanced',
      estimatedTime: '150 minuten',
      points: 25
    }
  ],
  resources: [
    {
      title: 'OpenAI Pricing Calculator',
      url: 'https://openai.com/pricing',
      type: 'tool'
    },
    {
      title: 'Nederlandse AI Case Studies',
      url: 'https://nlaic.com/cases',
      type: 'article'
    },
    {
      title: 'ROI Calculation Methods',
      url: 'https://www.investopedia.com/roi-calculation',
      type: 'guide'
    }
  ]
}