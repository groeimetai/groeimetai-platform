export const lesson3_3 = {
  id: 'contextual-responses',
  title: 'Contextual responses: Dynamische antwoorden met variabelen',
  duration: '45 min',
  content: `
# Contextual responses: Dynamische antwoorden met variabelen

## Introductie

Statische antwoorden maken je bot saai en onpersoonlijk. In deze les leren we hoe je dynamische, contextrijke responses genereert die inspelen op de specifieke situatie van elke klant. We behandelen template engines, personalisatie, tone-of-voice aanpassingen en real-time data integratie.

## Response generatie architectuur

### Layered response system

\`\`\`typescript
interface ResponseLayer {
  base: string;
  personalizations: Personalization[];
  contextualElements: ContextualElement[];
  dynamicData: DynamicDataSource[];
  toneModifiers: ToneModifier[];
}

class DynamicResponseGenerator {
  private templateEngine: TemplateEngine;
  private dataResolver: DataResolver;
  private personalizer: ResponsePersonalizer;
  private toneAdapter: ToneAdapter;
  
  async generateResponse(
    intent: string,
    entities: Entity[],
    context: ConversationContext
  ): Promise<GeneratedResponse> {
    // 1. Get base template
    const template = await this.templateEngine.getTemplate(intent);
    
    // 2. Resolve dynamic data
    const data = await this.dataResolver.resolveData(entities, context);
    
    // 3. Apply personalization
    const personalized = await this.personalizer.personalize(template, context.user);
    
    // 4. Adapt tone
    const toneAdjusted = await this.toneAdapter.adjustTone(personalized, context);
    
    // 5. Render final response
    const rendered = await this.templateEngine.render(toneAdjusted, data);
    
    // 6. Post-process
    return this.postProcess(rendered, context);
  }
}
\`\`\`

## Template engine implementation

### Advanced template system

\`\`\`typescript
interface ResponseTemplate {
  id: string;
  intent: string;
  variants: TemplateVariant[];
  requiredData: string[];
  optionalData: string[];
  conditions: TemplateCondition[];
  metadata: TemplateMetadata;
}

interface TemplateVariant {
  id: string;
  content: string;
  conditions: VariantCondition[];
  weight: number;
  performance: PerformanceMetrics;
}

class AdvancedTemplateEngine {
  private templates: Map<string, ResponseTemplate> = new Map();
  private parser: TemplateParser;
  
  constructor() {
    this.parser = new TemplateParser();
    this.loadTemplates();
  }
  
  private loadTemplates() {
    // Order status template
    this.templates.set('order_status', {
      id: 'order_status_response',
      intent: 'check_order_status',
      variants: [
        {
          id: 'detailed',
          content: \`
            {{#greeting}}Hallo {{customer.name}}, {{/greeting}}
            
            Ik heb uw bestelling {{order.id}} gevonden! {{emoji.happy}}
            
            📦 **Status**: {{order.status.display}}
            {{#if order.isShipped}}
            🚚 **Tracking**: [{{order.trackingNumber}}]({{order.trackingUrl}})
            📅 **Verwachte levering**: {{order.estimatedDelivery | formatDate}}
            {{/if}}
            
            {{#if order.hasUpdates}}
            🔔 **Laatste update**: {{order.lastUpdate.message}}
            {{/if}}
            
            {{#each order.items as item}}
            • {{item.name}} ({{item.quantity}}x)
            {{/each}}
            
            {{#if order.nextSteps}}
            **Wat gebeurt er nu?**
            {{order.nextSteps}}
            {{/if}}
            
            {{contextualHelp}}
          \`,
          conditions: [
            { type: 'preference', field: 'detailLevel', value: 'high' }
          ],
          weight: 0.7,
          performance: { satisfactionRate: 0.92, resolutionRate: 0.88 }
        },
        {
          id: 'concise',
          content: \`
            {{order.status.emoji}} Bestelling {{order.id}}: **{{order.status.display}}**
            {{#if order.isShipped}}
            Track: {{order.trackingUrl | shortUrl}}
            Levering: {{order.estimatedDelivery | formatDate}}
            {{/if}}
            {{quickActions}}
          \`,
          conditions: [
            { type: 'preference', field: 'detailLevel', value: 'low' },
            { type: 'channel', value: 'sms' }
          ],
          weight: 0.3,
          performance: { satisfactionRate: 0.85, resolutionRate: 0.82 }
        }
      ],
      requiredData: ['order.id', 'order.status'],
      optionalData: ['customer.name', 'order.items', 'order.trackingNumber'],
      conditions: [
        {
          if: 'order.status === "delayed"',
          then: { 
            addContent: '⚠️ **Let op**: Er is een kleine vertraging. We doen ons best om uw pakket zo snel mogelijk te bezorgen.',
            priority: 'high'
          }
        }
      ],
      metadata: {
        category: 'order_management',
        lastUpdated: new Date('2024-01-15'),
        author: 'system',
        approvedBy: 'customer_success_team'
      }
    });
    
    // Product recommendation template
    this.templates.set('product_recommendation', {
      id: 'product_rec_response',
      intent: 'get_product_recommendation',
      variants: [
        {
          id: 'personalized',
          content: \`
            {{#if customer.name}}Op basis van uw eerdere aankopen, {{customer.name}},{{else}}Op basis van uw interesses{{/if}} heb ik enkele geweldige suggesties voor u:
            
            {{#each recommendations as product}}
            **{{@index+1}}. {{product.name}}** {{#if product.isNew}}🆕{{/if}}
            {{product.shortDescription}}
            💰 {{product.price | formatCurrency}}
            {{#if product.discount}}
            🏷️ **{{product.discount.percentage}}% korting** (bespaar {{product.discount.amount | formatCurrency}})
            {{/if}}
            {{#if product.inStock}}✅ Op voorraad{{else}}⏳ Binnenkort weer leverbaar{{/if}}
            ⭐ {{product.rating}}/5 ({{product.reviewCount}} reviews)
            
            {{#if product.matchReason}}
            _Aanbevolen omdat: {{product.matchReason}}_
            {{/if}}
            
            [Bekijk product]({{product.url}}) | [Voeg toe aan winkelwagen]({{product.addToCartUrl}})
            {{/each}}
            
            {{#if hasMoreRecommendations}}
            Wilt u meer suggesties zien? Ik heb nog {{remainingCount}} andere producten die bij u passen!
            {{/if}}
          \`,
          conditions: [],
          weight: 1.0,
          performance: { satisfactionRate: 0.89, resolutionRate: 0.76 }
        }
      ],
      requiredData: ['recommendations'],
      optionalData: ['customer.name', 'customer.preferences'],
      conditions: [],
      metadata: {
        category: 'product_discovery',
        lastUpdated: new Date('2024-01-20'),
        author: 'marketing_team'
      }
    });
  }
  
  async render(templateId: string, data: any): Promise<string> {
    const template = this.templates.get(templateId);
    if (!template) throw new Error(\`Template \${templateId} not found\`);
    
    // Select best variant
    const variant = this.selectVariant(template, data);
    
    // Parse and render
    let rendered = await this.parser.parse(variant.content, data);
    
    // Apply conditional content
    rendered = this.applyConditions(rendered, template.conditions, data);
    
    // Clean up
    rendered = this.cleanupOutput(rendered);
    
    return rendered;
  }
  
  private selectVariant(template: ResponseTemplate, data: any): TemplateVariant {
    // Filter applicable variants
    const applicable = template.variants.filter(variant => 
      this.checkConditions(variant.conditions, data)
    );
    
    if (applicable.length === 0) return template.variants[0];
    
    // Weighted random selection based on performance
    const totalWeight = applicable.reduce((sum, v) => sum + v.weight * v.performance.satisfactionRate, 0);
    let random = Math.random() * totalWeight;
    
    for (const variant of applicable) {
      random -= variant.weight * variant.performance.satisfactionRate;
      if (random <= 0) return variant;
    }
    
    return applicable[0];
  }
}

// Template parser with advanced features
class TemplateParser {
  private helpers: Map<string, HelperFunction> = new Map();
  
  constructor() {
    this.registerHelpers();
  }
  
  private registerHelpers() {
    // Date formatter
    this.helpers.set('formatDate', (date: string, format?: string) => {
      const d = new Date(date);
      if (format === 'short') {
        return d.toLocaleDateString('nl-NL');
      }
      return d.toLocaleDateString('nl-NL', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    });
    
    // Currency formatter
    this.helpers.set('formatCurrency', (amount: number) => {
      return new Intl.NumberFormat('nl-NL', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount);
    });
    
    // URL shortener
    this.helpers.set('shortUrl', (url: string) => {
      return url.replace(/https?:\\/\\/(www\\.)?/, '').split('/')[0] + '/...';
    });
    
    // Pluralize
    this.helpers.set('pluralize', (count: number, singular: string, plural: string) => {
      return count === 1 ? singular : plural;
    });
  }
  
  async parse(template: string, data: any): Promise<string> {
    let result = template;
    
    // Handle conditionals
    result = await this.parseConditionals(result, data);
    
    // Handle loops
    result = await this.parseLoops(result, data);
    
    // Handle variables
    result = await this.parseVariables(result, data);
    
    // Apply helpers
    result = await this.applyHelpers(result, data);
    
    return result;
  }
  
  private async parseConditionals(template: string, data: any): Promise<string> {
    const conditionalRegex = /{{#if\s+(.+?)}}([\s\S]*?)(?:{{else}}([\s\S]*?))?{{\/if}}/g;
    
    return template.replace(conditionalRegex, (match, condition, ifContent, elseContent) => {
      const result = this.evaluateCondition(condition, data);
      return result ? ifContent : (elseContent || '');
    });
  }
  
  private evaluateCondition(condition: string, data: any): boolean {
    try {
      // Safe evaluation using Function constructor
      const func = new Function('data', \`with(data) { return \${condition}; }\`);
      return func(data);
    } catch {
      return false;
    }
  }
}
\`\`\`

## Personalisatie strategieën

### Multi-level personalization

\`\`\`typescript
interface PersonalizationProfile {
  demographics: Demographics;
  preferences: UserPreferences;
  history: InteractionHistory;
  psychographics: Psychographics;
  context: CurrentContext;
}

class ResponsePersonalizer {
  private strategies: PersonalizationStrategy[] = [
    new NamePersonalization(),
    new TonePersonalization(),
    new ContentDepthPersonalization(),
    new ChannelPersonalization(),
    new TimingPersonalization(),
    new CulturalPersonalization()
  ];
  
  async personalize(
    response: string, 
    profile: PersonalizationProfile
  ): Promise<PersonalizedResponse> {
    let personalized = response;
    const appliedStrategies: string[] = [];
    
    for (const strategy of this.strategies) {
      if (strategy.shouldApply(profile)) {
        personalized = await strategy.apply(personalized, profile);
        appliedStrategies.push(strategy.name);
      }
    }
    
    return {
      content: personalized,
      strategies: appliedStrategies,
      score: this.calculatePersonalizationScore(appliedStrategies)
    };
  }
}

// Specific personalization strategies
class TonePersonalization implements PersonalizationStrategy {
  name = 'tone';
  
  shouldApply(profile: PersonalizationProfile): boolean {
    return profile.preferences.communicationStyle !== 'default';
  }
  
  async apply(response: string, profile: PersonalizationProfile): Promise<string> {
    const style = profile.preferences.communicationStyle;
    
    switch (style) {
      case 'formal':
        return this.formalize(response);
      case 'casual':
        return this.casualize(response);
      case 'technical':
        return this.technicalize(response);
      case 'empathetic':
        return this.empathize(response);
      default:
        return response;
    }
  }
  
  private formalize(text: string): string {
    const replacements = {
      'je': 'u',
      'jouw': 'uw',
      'hoi': 'goedendag',
      'doei': 'tot ziens',
      'thanks': 'dank u wel',
      'sorry': 'excuses'
    };
    
    let formal = text;
    Object.entries(replacements).forEach(([casual, formal_word]) => {
      formal = formal.replace(new RegExp(\`\\b\${casual}\\b\`, 'gi'), formal_word);
    });
    
    return formal;
  }
  
  private casualize(text: string): string {
    const replacements = {
      'u': 'je',
      'uw': 'jouw',
      'goedendag': 'hey',
      'met vriendelijke groet': 'groetjes',
      'excuses': 'sorry'
    };
    
    let casual = text;
    Object.entries(replacements).forEach(([formal, casual_word]) => {
      casual = casual.replace(new RegExp(\`\\b\${formal}\\b\`, 'gi'), casual_word);
    });
    
    // Add casual elements
    casual = casual.replace(/\\./g, (match, offset, string) => {
      // Randomly replace some periods with exclamation marks
      return Math.random() > 0.7 && offset !== string.length - 1 ? '!' : '.';
    });
    
    return casual;
  }
}

class ContentDepthPersonalization implements PersonalizationStrategy {
  name = 'content_depth';
  
  shouldApply(profile: PersonalizationProfile): boolean {
    return true; // Always applicable
  }
  
  async apply(response: string, profile: PersonalizationProfile): Promise<string> {
    const expertise = profile.psychographics.expertiseLevel;
    const timeConstraint = profile.context.timeConstraint;
    
    if (expertise === 'expert' && !timeConstraint) {
      return this.addTechnicalDetails(response, profile);
    } else if (expertise === 'beginner' || timeConstraint === 'urgent') {
      return this.simplify(response, profile);
    }
    
    return response;
  }
  
  private addTechnicalDetails(response: string, profile: PersonalizationProfile): string {
    // Add technical information based on context
    const additions = {
      order_status: '\\n\\n**Technische details**: Uw pakket bevindt zich in sorteercentrum {{technical.sortingCenter}} met scan code {{technical.lastScan}}.',
      payment_issue: '\\n\\n**Foutcode**: {{technical.errorCode}} - {{technical.errorDescription}}\\n**Transactie ID**: {{technical.transactionId}}'
    };
    
    // Add relevant technical details based on intent
    return response + (additions[profile.context.currentIntent] || '');
  }
  
  private simplify(response: string, profile: PersonalizationProfile): string {
    // Remove technical jargon and complex explanations
    let simplified = response;
    
    // Remove content between technical markers
    simplified = simplified.replace(/\\[TECH\\].*?\\[\\/TECH\\]/gs, '');
    
    // Shorten sentences
    simplified = simplified.split('. ')
      .filter((sentence, index) => index < 3 || sentence.length < 50)
      .join('. ');
    
    return simplified;
  }
}
\`\`\`

## Dynamic data integration

### Real-time data resolution

\`\`\`typescript
interface DataSource {
  name: string;
  type: 'api' | 'database' | 'cache' | 'computed';
  resolver: DataResolver;
  cacheDuration?: number;
  fallback?: any;
}

class DynamicDataResolver {
  private sources: Map<string, DataSource> = new Map();
  private cache: DataCache;
  
  constructor() {
    this.registerDataSources();
    this.cache = new DataCache();
  }
  
  private registerDataSources() {
    // Order data source
    this.sources.set('order', {
      name: 'order',
      type: 'api',
      resolver: async (params: any) => {
        const orderId = params.orderId;
        const cached = await this.cache.get(\`order:\${orderId}\`);
        
        if (cached) return cached;
        
        const orderData = await this.fetchOrderData(orderId);
        await this.cache.set(\`order:\${orderId}\`, orderData, 300); // 5 min cache
        
        return orderData;
      },
      cacheDuration: 300,
      fallback: {
        status: { display: 'Bezig met laden...', emoji: '⏳' },
        error: true
      }
    });
    
    // Customer data source
    this.sources.set('customer', {
      name: 'customer',
      type: 'database',
      resolver: async (params: any) => {
        const customerId = params.customerId || params.context?.userId;
        return await this.fetchCustomerData(customerId);
      },
      cacheDuration: 3600 // 1 hour
    });
    
    // Computed data source
    this.sources.set('recommendations', {
      name: 'recommendations',
      type: 'computed',
      resolver: async (params: any) => {
        const customer = await this.resolveData('customer', params);
        const orderHistory = await this.fetchOrderHistory(customer.id);
        
        return this.computeRecommendations(customer, orderHistory);
      }
    });
    
    // Real-time inventory
    this.sources.set('inventory', {
      name: 'inventory',
      type: 'api',
      resolver: async (params: any) => {
        const productId = params.productId;
        const location = params.location || 'default';
        
        return await this.checkInventory(productId, location);
      },
      cacheDuration: 60 // 1 minute for inventory
    });
  }
  
  async resolveData(sourceName: string, params: any): Promise<any> {
    const source = this.sources.get(sourceName);
    if (!source) {
      console.warn(\`Data source '\${sourceName}' not found\`);
      return null;
    }
    
    try {
      const result = await source.resolver(params);
      return result;
    } catch (error) {
      console.error(\`Error resolving data from \${sourceName}:\`, error);
      return source.fallback || null;
    }
  }
  
  async resolveTemplate(template: string, context: any): Promise<any> {
    const dataRequirements = this.extractDataRequirements(template);
    const resolvedData: any = {};
    
    // Parallel data resolution
    await Promise.all(
      dataRequirements.map(async (requirement) => {
        const [source, ...path] = requirement.split('.');
        const data = await this.resolveData(source, context);
        
        // Set nested data
        this.setNestedValue(resolvedData, requirement, this.getNestedValue(data, path));
      })
    );
    
    return { ...context, ...resolvedData };
  }
  
  private extractDataRequirements(template: string): string[] {
    const requirements = new Set<string>();
    const regex = /{{([^}]+)}}/g;
    let match;
    
    while ((match = regex.exec(template)) !== null) {
      const expression = match[1].trim();
      
      // Extract variable names
      const variables = expression.match(/\\b\\w+(\\.\\w+)*\\b/g) || [];
      variables.forEach(v => requirements.add(v));
    }
    
    return Array.from(requirements);
  }
}

// Advanced caching system
class DataCache {
  private cache: Map<string, CacheEntry> = new Map();
  private refreshQueue: RefreshQueue;
  
  async get(key: string): Promise<any> {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (this.isExpired(entry)) {
      // Trigger background refresh
      this.refreshQueue.add(key);
      
      // Return stale data if not too old
      if (this.isUsableStale(entry)) {
        return entry.data;
      }
      
      return null;
    }
    
    return entry.data;
  }
  
  async set(key: string, data: any, ttl: number): Promise<void> {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0
    });
  }
  
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl * 1000;
  }
  
  private isUsableStale(entry: CacheEntry): boolean {
    const staleness = Date.now() - entry.timestamp;
    const maxStale = entry.ttl * 1000 * 2; // 2x TTL
    return staleness < maxStale;
  }
}
\`\`\`

## Context-aware response elements

### Dynamic help suggestions

\`\`\`typescript
class ContextualHelpGenerator {
  generateHelp(context: ResponseContext): string {
    const helps: string[] = [];
    
    // Based on intent
    if (context.intent === 'check_order_status') {
      if (context.data.order?.status === 'shipped') {
        helps.push('💡 **Tip**: U kunt push notificaties inschakelen voor real-time updates');
      } else if (context.data.order?.status === 'processing') {
        helps.push('ℹ️ Gemiddelde verwerkingstijd is 1-2 werkdagen');
      }
    }
    
    // Based on user history
    if (context.userHistory.frequentIssues.includes('delivery_delays')) {
      helps.push('📦 Overweeg onze Priority Shipping voor snellere levering');
    }
    
    // Based on time
    const hour = new Date().getHours();
    if (hour >= 17 && context.intent.includes('urgent')) {
      helps.push('🕐 Onze klantenservice is telefonisch bereikbaar tot 20:00');
    }
    
    // Based on previous failures
    if (context.previousAttempts > 2) {
      helps.push('🤝 Zal ik u doorverbinden met een medewerker?');
    }
    
    return helps.join('\\n');
  }
}

// Quick action generator
class QuickActionGenerator {
  generateActions(context: ResponseContext): QuickAction[] {
    const actions: QuickAction[] = [];
    
    // Context-specific actions
    switch (context.intent) {
      case 'check_order_status':
        if (context.data.order?.status === 'delivered') {
          actions.push(
            { label: 'Start retour', action: 'start_return' },
            { label: 'Geef review', action: 'write_review' }
          );
        } else {
          actions.push(
            { label: 'Wijzig adres', action: 'change_address' },
            { label: 'Contact opnemen', action: 'contact_support' }
          );
        }
        break;
        
      case 'product_inquiry':
        actions.push(
          { label: 'Voeg toe aan winkelwagen', action: 'add_to_cart' },
          { label: 'Vergelijk producten', action: 'compare_products' },
          { label: 'Stel een vraag', action: 'ask_question' }
        );
        break;
    }
    
    // Always available actions
    actions.push(
      { label: 'Hoofdmenu', action: 'main_menu' },
      { label: 'Mens spreken', action: 'human_agent' }
    );
    
    return actions;
  }
}
\`\`\`

## Response optimization

### A/B testing framework

\`\`\`typescript
class ResponseABTesting {
  private experiments: Map<string, Experiment> = new Map();
  
  async selectVariant(
    responseOptions: ResponseVariant[], 
    context: TestContext
  ): Promise<SelectedVariant> {
    const experiment = this.getOrCreateExperiment(context.intent);
    
    // Check if user is already in experiment
    const userVariant = await this.getUserVariant(context.userId, experiment.id);
    if (userVariant) {
      return responseOptions.find(v => v.id === userVariant) || responseOptions[0];
    }
    
    // Assign variant
    const variant = this.assignVariant(experiment, responseOptions);
    await this.recordAssignment(context.userId, experiment.id, variant.id);
    
    return variant;
  }
  
  async recordOutcome(
    userId: string, 
    experimentId: string, 
    outcome: ExperimentOutcome
  ): Promise<void> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return;
    
    // Record metrics
    await this.metricsDB.record({
      experimentId,
      variantId: outcome.variantId,
      userId,
      timestamp: new Date(),
      metrics: {
        resolved: outcome.resolved,
        escalated: outcome.escalated,
        satisfaction: outcome.satisfaction,
        responseTime: outcome.responseTime
      }
    });
    
    // Check for statistical significance
    if (await this.checkSignificance(experiment)) {
      await this.concludeExperiment(experiment);
    }
  }
  
  private assignVariant(
    experiment: Experiment, 
    options: ResponseVariant[]
  ): ResponseVariant {
    // Use epsilon-greedy algorithm
    if (Math.random() < experiment.explorationRate) {
      // Explore: random selection
      return options[Math.floor(Math.random() * options.length)];
    } else {
      // Exploit: select best performing
      return this.selectBestPerforming(experiment, options);
    }
  }
  
  private selectBestPerforming(
    experiment: Experiment, 
    options: ResponseVariant[]
  ): ResponseVariant {
    const performance = experiment.variantPerformance;
    
    let bestVariant = options[0];
    let bestScore = -Infinity;
    
    options.forEach(variant => {
      const stats = performance.get(variant.id);
      if (stats && stats.score > bestScore) {
        bestScore = stats.score;
        bestVariant = variant;
      }
    });
    
    return bestVariant;
  }
}
\`\`\`

## Multi-channel response adaptation

### Channel-specific formatting

\`\`\`typescript
class ChannelAdapter {
  adaptResponse(
    response: string, 
    channel: CommunicationChannel
  ): ChannelAdaptedResponse {
    switch (channel.type) {
      case 'web_chat':
        return this.adaptForWebChat(response, channel);
      case 'whatsapp':
        return this.adaptForWhatsApp(response, channel);
      case 'sms':
        return this.adaptForSMS(response, channel);
      case 'email':
        return this.adaptForEmail(response, channel);
      case 'voice':
        return this.adaptForVoice(response, channel);
      default:
        return { content: response, metadata: {} };
    }
  }
  
  private adaptForWhatsApp(
    response: string, 
    channel: WhatsAppChannel
  ): ChannelAdaptedResponse {
    let adapted = response;
    
    // Convert markdown to WhatsApp format
    adapted = adapted.replace(/\\*\\*(.+?)\\*\\*/g, '*$1*'); // Bold
    adapted = adapted.replace(/__(.+?)__/g, '_$1_'); // Italic
    adapted = adapted.replace(/~~(.+?)~~/g, '~$1~'); // Strikethrough
    
    // Handle media
    const media: any[] = [];
    adapted = adapted.replace(/\\[IMAGE:(.+?)\\]/g, (match, url) => {
      media.push({ type: 'image', url });
      return '';
    });
    
    // Split long messages
    const chunks = this.splitMessage(adapted, 4096); // WhatsApp limit
    
    return {
      content: chunks[0],
      additionalMessages: chunks.slice(1),
      media,
      metadata: {
        formatting: 'whatsapp',
        interactive: this.createWhatsAppButtons(response)
      }
    };
  }
  
  private adaptForSMS(
    response: string, 
    channel: SMSChannel
  ): ChannelAdaptedResponse {
    let adapted = response;
    
    // Remove all formatting
    adapted = adapted.replace(/[*_~\`]/g, '');
    
    // Shorten URLs
    adapted = adapted.replace(/https?:\\/\\/[^\\s]+/g, (url) => 
      this.shortenUrl(url)
    );
    
    // Remove images and media
    adapted = adapted.replace(/\\[IMAGE:.*?\\]/g, '');
    adapted = adapted.replace(/\\[VIDEO:.*?\\]/g, '');
    
    // Truncate to SMS limit
    if (adapted.length > 160) {
      adapted = adapted.substring(0, 157) + '...';
    }
    
    return {
      content: adapted,
      metadata: {
        characterCount: adapted.length,
        segments: Math.ceil(adapted.length / 160)
      }
    };
  }
  
  private createWhatsAppButtons(response: string): any {
    const buttons = [];
    
    // Extract quick actions from response
    const actionMatches = response.matchAll(/\\[ACTION:(.+?):(.+?)\\]/g);
    
    for (const match of actionMatches) {
      buttons.push({
        type: 'reply',
        reply: {
          id: match[1],
          title: match[2]
        }
      });
    }
    
    return buttons.slice(0, 3); // WhatsApp limit
  }
}
\`\`\`

## Performance monitoring

### Response effectiveness tracking

\`\`\`typescript
class ResponseEffectivenessTracker {
  private metrics: ResponseMetrics[] = [];
  
  async trackResponse(
    response: GeneratedResponse,
    outcome: ResponseOutcome
  ): Promise<void> {
    const metric: ResponseMetrics = {
      timestamp: new Date(),
      responseId: response.id,
      templateId: response.templateId,
      variantId: response.variantId,
      intent: response.intent,
      channel: response.channel,
      personalizationStrategies: response.personalizationStrategies,
      outcome: {
        resolved: outcome.resolved,
        escalated: outcome.escalated,
        userSatisfaction: outcome.satisfaction,
        timeToResolution: outcome.timeToResolution,
        followUpNeeded: outcome.followUpNeeded
      },
      performance: {
        generationTime: response.generationTime,
        dataFetchTime: response.dataFetchTime,
        characterCount: response.content.length,
        dynamicElements: response.dynamicElementCount
      }
    };
    
    await this.saveMetric(metric);
    await this.updateTemplatePerformance(metric);
  }
  
  async generateReport(period: TimePeriod): Promise<EffectivenessReport> {
    const metrics = await this.getMetricsForPeriod(period);
    
    return {
      period,
      totalResponses: metrics.length,
      resolutionRate: this.calculateResolutionRate(metrics),
      averageSatisfaction: this.calculateAverageSatisfaction(metrics),
      topPerformingTemplates: this.getTopTemplates(metrics, 5),
      worstPerformingTemplates: this.getWorstTemplates(metrics, 5),
      personalizationImpact: this.analyzePersonalizationImpact(metrics),
      channelPerformance: this.analyzeChannelPerformance(metrics),
      recommendations: this.generateRecommendations(metrics)
    };
  }
  
  private analyzePersonalizationImpact(metrics: ResponseMetrics[]): any {
    const grouped = this.groupByPersonalizationLevel(metrics);
    
    return {
      none: this.calculateStats(grouped.none),
      light: this.calculateStats(grouped.light),
      medium: this.calculateStats(grouped.medium),
      heavy: this.calculateStats(grouped.heavy),
      correlation: this.calculateCorrelation(
        metrics.map(m => m.personalizationStrategies.length),
        metrics.map(m => m.outcome.userSatisfaction || 0)
      )
    };
  }
}
\`\`\`

## Opdracht

Implementeer een volledig dynamisch response systeem voor een e-commerce customer service bot:

1. **Template Engine**:
   - Maak 10+ response templates voor verschillende intents
   - Implementeer conditional logic en loops
   - Add helper functions voor formatting

2. **Personalization**:
   - Bouw 5+ personalization strategies
   - Implementeer user profiling
   - Test met verschillende personas

3. **Dynamic Data**:
   - Integreer met mock APIs voor orders, products, inventory
   - Implementeer caching strategy
   - Handle failures gracefully

4. **Multi-channel**:
   - Adapteer responses voor: web chat, WhatsApp, SMS, email
   - Behoud context over channels
   - Test character limits en formatting

5. **Performance**:
   - Track response effectiveness
   - Implementeer A/B testing
   - Generate insights report

Test scenarios:
- "Waar is mijn bestelling?" (verschillende order statussen)
- Product aanbevelingen voor verschillende klantprofielen
- Escalatie scenarios met context behoud
- Multi-language responses

Deliverables:
- Complete implementatie met alle componenten
- Test suite met 20+ test cases
- Performance rapport
- Documentatie van template syntax

Succes met het bouwen van een intelligent response systeem!
`
};