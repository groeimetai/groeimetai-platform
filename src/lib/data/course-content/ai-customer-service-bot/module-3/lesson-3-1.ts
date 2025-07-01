export const lesson3_1 = {
  id: 'knowledge-base-structuur',
  title: 'Knowledge base structuur: FAQ\'s en documentatie organiseren',
  duration: '45 min',
  content: `
# Knowledge base structuur: FAQ's en documentatie organiseren

## Introductie

Een goed gestructureerde knowledge base is het fundament van elke succesvolle customer service bot. In deze les leren we hoe je FAQ's, documentatie en productinformatie zodanig organiseert dat je bot snel en accuraat kan antwoorden. We behandelen praktische voorbeelden uit e-commerce, SaaS en service-industrie.

## Waarom knowledge base structuur cruciaal is

### Impact op bot performance

Een gestructureerde knowledge base zorgt voor:
- **Snellere response times**: Bot vindt relevante informatie direct
- **Hogere accuracy**: Minder verwarring tussen vergelijkbare onderwerpen
- **Betere schaalbaarheid**: Makkelijk nieuwe content toevoegen
- **Eenvoudiger onderhoud**: Updates zijn gerichter uit te voeren

## Hierarchische structuur ontwerpen

### Basis architectuur

\`\`\`typescript
interface KnowledgeBaseStructure {
  categories: Category[];
  globalMetadata: GlobalMetadata;
  searchIndex: SearchIndex;
}

interface Category {
  id: string;
  name: string;
  description: string;
  priority: number;
  subcategories?: Category[];
  articles: Article[];
  metadata: CategoryMetadata;
}

interface Article {
  id: string;
  title: string;
  content: string;
  category_id: string;
  tags: string[];
  created_at: Date;
  updated_at: Date;
  relevance_score: number;
  usage_stats: UsageStats;
  related_articles: string[];
  variants: ContentVariant[];
}

interface ContentVariant {
  language: string;
  tone: 'formal' | 'casual' | 'technical';
  customer_segment: string;
  content: string;
}
\`\`\`

### Praktisch voorbeeld: E-commerce knowledge base

\`\`\`typescript
const ecommerceKnowledgeBase = {
  categories: [
    {
      id: 'orders',
      name: 'Bestellingen',
      description: 'Alles over bestellingen, status en tracking',
      priority: 1,
      subcategories: [
        {
          id: 'order-status',
          name: 'Bestelstatus',
          articles: [
            {
              id: 'check-order-status',
              title: 'Hoe check ik mijn bestelstatus?',
              content: \`
                U kunt uw bestelstatus op verschillende manieren controleren:
                
                1. **Via uw account**
                   - Log in op uw account
                   - Ga naar "Mijn bestellingen"
                   - Klik op het ordernummer
                
                2. **Via track & trace**
                   - Gebruik de link in uw bevestigingsmail
                   - Vul uw ordernummer en postcode in
                
                3. **Via onze app**
                   - Open de app
                   - Tap op "Orders"
                   - Selecteer uw bestelling
              \`,
              tags: ['status', 'tracking', 'order', 'check'],
              relevance_score: 0.95,
              related_articles: ['track-package', 'order-delays']
            }
          ]
        },
        {
          id: 'order-changes',
          name: 'Wijzigingen',
          articles: [
            {
              id: 'cancel-order',
              title: 'Kan ik mijn bestelling annuleren?',
              content: \`
                Annuleren is mogelijk onder deze voorwaarden:
                
                **Binnen 30 minuten na bestelling**: 
                - Automatisch via uw account
                - 100% terugbetaling
                
                **Na 30 minuten maar voor verzending**:
                - Contact opnemen met service
                - Afhankelijk van verwerkingsstatus
                
                **Na verzending**:
                - Niet meer mogelijk
                - Wel retourneren na ontvangst
              \`,
              variants: [
                {
                  language: 'nl',
                  tone: 'casual',
                  customer_segment: 'consumer',
                  content: 'Hey! Spijt van je bestelling? Geen zorgen...'
                },
                {
                  language: 'nl',
                  tone: 'formal',
                  customer_segment: 'business',
                  content: 'Geachte klant, annulering van uw order is mogelijk...'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'shipping',
      name: 'Verzending',
      description: 'Leveringstijden, kosten en opties',
      priority: 2,
      // ... meer subcategorieën
    },
    {
      id: 'returns',
      name: 'Retourneren',
      description: 'Retourbeleid en procedures',
      priority: 3,
      // ... meer subcategorieën
    }
  ]
};
\`\`\`

## Content organisatie strategieën

### 1. Topic clustering

Groepeer gerelateerde onderwerpen voor betere context:

\`\`\`typescript
class TopicClusterManager {
  private clusters: Map<string, TopicCluster> = new Map();
  
  createCluster(mainTopic: string, relatedTopics: string[]) {
    const cluster: TopicCluster = {
      id: this.generateClusterId(mainTopic),
      mainTopic,
      relatedTopics,
      commonIntents: this.extractCommonIntents(mainTopic, relatedTopics),
      sharedContext: this.buildSharedContext(mainTopic, relatedTopics)
    };
    
    this.clusters.set(cluster.id, cluster);
    return cluster;
  }
  
  findRelatedContent(query: string): Article[] {
    const cluster = this.findBestCluster(query);
    if (!cluster) return [];
    
    return this.searchWithinCluster(cluster, query);
  }
  
  private extractCommonIntents(main: string, related: string[]): Intent[] {
    // Analyse gemeenschappelijke user intents
    const intents: Intent[] = [];
    
    // Voorbeeld voor "shipping" cluster
    if (main === 'shipping') {
      intents.push(
        { name: 'check_delivery_time', confidence: 0.9 },
        { name: 'track_package', confidence: 0.85 },
        { name: 'shipping_costs', confidence: 0.8 }
      );
    }
    
    return intents;
  }
}

// Praktisch gebruik
const clusterManager = new TopicClusterManager();

// Shipping cluster
clusterManager.createCluster('shipping', [
  'delivery-time',
  'shipping-costs', 
  'track-trace',
  'delivery-options',
  'international-shipping'
]);

// Payment cluster  
clusterManager.createCluster('payment', [
  'payment-methods',
  'payment-failed',
  'refunds',
  'invoices',
  'payment-security'
]);
\`\`\`

### 2. Dynamic content templates

Maak herbruikbare templates voor consistente antwoorden:

\`\`\`typescript
interface ContentTemplate {
  id: string;
  name: string;
  structure: TemplateStructure;
  variables: TemplateVariable[];
  conditions: TemplateCondition[];
}

class TemplateEngine {
  private templates: Map<string, ContentTemplate> = new Map();
  
  registerTemplate(template: ContentTemplate) {
    this.templates.set(template.id, template);
  }
  
  renderTemplate(templateId: string, context: any): string {
    const template = this.templates.get(templateId);
    if (!template) throw new Error('Template not found');
    
    let content = this.buildBaseContent(template.structure);
    
    // Replace variables
    template.variables.forEach(variable => {
      const value = this.resolveVariable(variable, context);
      content = content.replace(\`{{\${variable.name}}}\`, value);
    });
    
    // Apply conditions
    template.conditions.forEach(condition => {
      if (this.evaluateCondition(condition, context)) {
        content = this.applyConditionalContent(content, condition);
      }
    });
    
    return content;
  }
}

// Voorbeeld template voor order status
const orderStatusTemplate: ContentTemplate = {
  id: 'order-status-response',
  name: 'Order Status Template',
  structure: {
    intro: 'Ik heb uw bestelling {{orderId}} gevonden.',
    status: 'Status: {{status}}',
    details: '{{statusDetails}}',
    nextSteps: '{{nextSteps}}',
    additionalInfo: '{{additionalInfo}}'
  },
  variables: [
    { name: 'orderId', type: 'string', required: true },
    { name: 'status', type: 'string', required: true },
    { name: 'statusDetails', type: 'string', required: true }
  ],
  conditions: [
    {
      if: 'status === "shipped"',
      then: {
        additionalInfo: 'Track uw pakket via: {{trackingUrl}}'
      }
    },
    {
      if: 'status === "delayed"',
      then: {
        additionalInfo: 'We verwachten uw pakket op {{newDeliveryDate}}',
        priority: 'high'
      }
    }
  ]
};
\`\`\`

## Metadata en tagging systeem

### Intelligent tagging voor betere retrieval

\`\`\`typescript
interface TaggingSystem {
  automaticTags: AutomaticTagGenerator;
  manualTags: string[];
  semanticTags: SemanticTag[];
  contextualTags: ContextualTag[];
}

class AutomaticTagGenerator {
  generateTags(article: Article): string[] {
    const tags: Set<string> = new Set();
    
    // Extract key terms
    const keyTerms = this.extractKeyTerms(article.content);
    keyTerms.forEach(term => tags.add(term));
    
    // Add category-based tags
    const categoryTags = this.getCategoryTags(article.category_id);
    categoryTags.forEach(tag => tags.add(tag));
    
    // Add intent-based tags
    const intents = this.detectIntents(article.content);
    intents.forEach(intent => tags.add(\`intent:\${intent}\`));
    
    // Add entity tags
    const entities = this.extractEntities(article.content);
    entities.forEach(entity => tags.add(\`entity:\${entity.type}:\${entity.value}\`));
    
    return Array.from(tags);
  }
  
  private extractKeyTerms(content: string): string[] {
    // Gebruik NLP voor key term extraction
    const terms: string[] = [];
    
    // Simpel voorbeeld
    const importantWords = content.match(/\\b(bestelling|levering|betaling|retour|klacht)\\b/gi);
    if (importantWords) {
      terms.push(...importantWords.map(w => w.toLowerCase()));
    }
    
    return terms;
  }
  
  private detectIntents(content: string): string[] {
    const intents: string[] = [];
    
    // Intent detection patterns
    const patterns = {
      'how-to': /hoe (kan ik|moet ik|doe ik)/i,
      'troubleshoot': /(probleem|werkt niet|fout|error)/i,
      'policy': /(beleid|voorwaarden|regels)/i,
      'cost': /(kost|prijs|tarief|gratis)/i
    };
    
    Object.entries(patterns).forEach(([intent, pattern]) => {
      if (pattern.test(content)) {
        intents.push(intent);
      }
    });
    
    return intents;
  }
}
\`\`\`

## Search optimization

### Multi-layer search strategy

\`\`\`typescript
class KnowledgeBaseSearch {
  private searchLayers: SearchLayer[] = [
    new ExactMatchLayer(),
    new FuzzyMatchLayer(),
    new SemanticSearchLayer(),
    new MLPredictiveLayer()
  ];
  
  async search(query: string, context?: SearchContext): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    // Layer 1: Exact match
    const exactMatches = await this.searchLayers[0].search(query);
    if (exactMatches.length > 0 && exactMatches[0].confidence > 0.95) {
      return exactMatches;
    }
    
    // Layer 2: Fuzzy match
    const fuzzyMatches = await this.searchLayers[1].search(query);
    results.push(...fuzzyMatches);
    
    // Layer 3: Semantic search
    const semanticMatches = await this.searchLayers[2].search(query, context);
    results.push(...semanticMatches);
    
    // Layer 4: ML predictions
    if (results.length < 3) {
      const predictions = await this.searchLayers[3].predict(query, context);
      results.push(...predictions);
    }
    
    // Rank and deduplicate
    return this.rankResults(results);
  }
  
  private rankResults(results: SearchResult[]): SearchResult[] {
    // Combineer scores van verschillende layers
    const grouped = this.groupByArticleId(results);
    
    return Object.values(grouped)
      .map(group => ({
        ...group[0],
        combinedScore: this.calculateCombinedScore(group),
        sources: group.map(r => r.source)
      }))
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, 5);
  }
}
\`\`\`

## Integratie met bestaande systemen

### CRM en database koppeling

\`\`\`typescript
class SystemIntegration {
  private connectors: Map<string, SystemConnector> = new Map();
  
  async syncKnowledgeBase() {
    // Sync met CRM voor klant-specifieke info
    const crmData = await this.connectors.get('crm').fetchUpdates();
    await this.updateCustomerSpecificArticles(crmData);
    
    // Sync met product database
    const productData = await this.connectors.get('products').fetchCatalog();
    await this.updateProductArticles(productData);
    
    // Sync met order systeem
    const orderPolicies = await this.connectors.get('orders').fetchPolicies();
    await this.updatePolicyArticles(orderPolicies);
  }
  
  private async updateCustomerSpecificArticles(crmData: any) {
    // Update articles met klant-specifieke informatie
    for (const customer of crmData.customers) {
      if (customer.hasSpecialTerms) {
        await this.createCustomArticleVariant({
          baseArticleId: 'return-policy',
          customerId: customer.id,
          customContent: this.generateCustomContent(customer.specialTerms)
        });
      }
    }
  }
}
\`\`\`

## Best practices voor knowledge base onderhoud

### 1. Versioning en change tracking

\`\`\`typescript
interface ArticleVersion {
  version: number;
  content: string;
  author: string;
  timestamp: Date;
  changeReason: string;
  reviewedBy?: string;
}

class VersionControl {
  async updateArticle(articleId: string, newContent: string, metadata: UpdateMetadata) {
    const article = await this.getArticle(articleId);
    
    // Create new version
    const newVersion: ArticleVersion = {
      version: article.versions.length + 1,
      content: newContent,
      author: metadata.author,
      timestamp: new Date(),
      changeReason: metadata.reason
    };
    
    // Quality checks
    await this.runQualityChecks(newVersion);
    
    // Save version
    article.versions.push(newVersion);
    article.content = newContent;
    article.updated_at = new Date();
    
    await this.saveArticle(article);
    
    // Notify relevant systems
    await this.notifyUpdate(article);
  }
}
\`\`\`

### 2. Performance monitoring

\`\`\`typescript
class KnowledgeBaseAnalytics {
  trackArticleUsage(articleId: string, context: UsageContext) {
    const metrics = {
      articleId,
      timestamp: new Date(),
      helpfulness: context.wasHelpful,
      resolvedQuery: context.queryResolved,
      escalationNeeded: context.escalated,
      searchPath: context.searchPath,
      timeToFind: context.searchDuration
    };
    
    this.saveMetrics(metrics);
    this.updateArticleRelevance(articleId, metrics);
  }
  
  generateInsights(): KnowledgeBaseInsights {
    return {
      mostUsedArticles: this.getTopArticles(10),
      leastEffectiveArticles: this.getLowPerformingArticles(),
      commonSearchFailures: this.getFailedSearches(),
      recommendedNewArticles: this.suggestNewContent(),
      outdatedContent: this.findOutdatedArticles()
    };
  }
}
\`\`\`

## Opdracht

Ontwerp en implementeer een knowledge base structuur voor een fictieve telecom provider met de volgende requirements:

1. **Categorieën**: Minimaal 5 hoofdcategorieën met subcategorieën
2. **Articles**: 20+ articles verdeeld over de categorieën
3. **Search**: Implementeer multi-layer search
4. **Templates**: Maak 3 herbruikbare content templates
5. **Analytics**: Track article usage en effectiveness

Test je implementatie met:
- Verschillende zoekqueries
- Performance bij 1000+ articles
- Update scenarios
- Multi-language support

Lever op:
- Complete code implementatie
- Documentatie van je design choices
- Test resultaten
- Optimalisatie suggesties

Succes met het bouwen van een schaalbare knowledge base!
`
};