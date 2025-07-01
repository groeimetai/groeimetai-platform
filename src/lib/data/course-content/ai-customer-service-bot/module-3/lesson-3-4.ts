export const lesson3_4 = {
  id: 'fallback-strategies',
  title: 'Fallback strategies: Wanneer de bot het niet weet',
  duration: '40 min',
  content: `
# Fallback strategies: Wanneer de bot het niet weet

## Introductie

Geen enkele bot is perfect. Het verschil tussen een frustrerende en een behulpzame bot zit in hoe deze omgaat met situaties waarin hij het antwoord niet weet. In deze les leren we robuuste fallback strategieën, graceful degradation, en intelligente escalatie naar menselijke agents.

## Fallback hiërarchie

### Multi-tier fallback system

\`\`\`typescript
interface FallbackTier {
  level: number;
  name: string;
  trigger: TriggerCondition;
  strategy: FallbackStrategy;
  maxAttempts: number;
  escalationThreshold: number;
}

class FallbackManager {
  private tiers: FallbackTier[] = [
    {
      level: 1,
      name: 'clarification',
      trigger: { 
        confidenceBelow: 0.7,
        multipleIntents: true 
      },
      strategy: new ClarificationStrategy(),
      maxAttempts: 2,
      escalationThreshold: 0.5
    },
    {
      level: 2,
      name: 'guided_assistance',
      trigger: {
        confidenceBelow: 0.5,
        noMatchingIntent: true
      },
      strategy: new GuidedAssistanceStrategy(),
      maxAttempts: 2,
      escalationThreshold: 0.3
    },
    {
      level: 3,
      name: 'knowledge_search',
      trigger: {
        previousFallbackFailed: true,
        searchableQuery: true
      },
      strategy: new KnowledgeSearchStrategy(),
      maxAttempts: 1,
      escalationThreshold: 0.2
    },
    {
      level: 4,
      name: 'human_handoff',
      trigger: {
        allFallbacksFailed: true,
        userFrustration: true,
        complexQuery: true
      },
      strategy: new HumanHandoffStrategy(),
      maxAttempts: 1,
      escalationThreshold: 0
    }
  ];
  
  async handleUncertainty(
    query: string,
    nluResult: NLUResult,
    context: ConversationContext
  ): Promise<FallbackResponse> {
    // Determine appropriate tier
    const tier = this.selectFallbackTier(nluResult, context);
    
    // Check if we've exceeded attempts for this tier
    if (context.fallbackAttempts[tier.name] >= tier.maxAttempts) {
      return this.escalateToNextTier(tier, query, context);
    }
    
    // Execute fallback strategy
    const response = await tier.strategy.execute(query, nluResult, context);
    
    // Track attempt
    context.fallbackAttempts[tier.name] = (context.fallbackAttempts[tier.name] || 0) + 1;
    
    // Evaluate success
    if (response.confidence < tier.escalationThreshold) {
      return this.escalateToNextTier(tier, query, context);
    }
    
    return response;
  }
  
  private selectFallbackTier(
    nluResult: NLUResult,
    context: ConversationContext
  ): FallbackTier {
    for (const tier of this.tiers) {
      if (this.triggerConditionsMet(tier.trigger, nluResult, context)) {
        return tier;
      }
    }
    
    return this.tiers[this.tiers.length - 1]; // Default to human handoff
  }
}
\`\`\`

## Clarification strategies

### Intelligent disambiguation

\`\`\`typescript
class ClarificationStrategy implements FallbackStrategy {
  async execute(
    query: string,
    nluResult: NLUResult,
    context: ConversationContext
  ): Promise<FallbackResponse> {
    const clarificationType = this.determineClarificationType(nluResult);
    
    switch (clarificationType) {
      case 'ambiguous_intent':
        return this.clarifyIntent(nluResult, context);
      case 'missing_entity':
        return this.requestMissingEntity(nluResult, context);
      case 'unclear_reference':
        return this.clarifyReference(query, context);
      case 'multiple_interpretations':
        return this.disambiguateInterpretations(nluResult, context);
      default:
        return this.genericClarification(query);
    }
  }
  
  private async clarifyIntent(
    nluResult: NLUResult,
    context: ConversationContext
  ): Promise<FallbackResponse> {
    const topIntents = nluResult.intents.slice(0, 3);
    
    // Create user-friendly descriptions
    const options = topIntents.map(intent => ({
      intent: intent.name,
      description: this.getIntentDescription(intent.name, context),
      confidence: intent.confidence
    }));
    
    const response = this.buildClarificationResponse(options, context);
    
    return {
      type: 'clarification',
      content: response,
      options: options.map((opt, idx) => ({
        id: \`option_\${idx + 1}\`,
        label: opt.description,
        action: { type: 'select_intent', intent: opt.intent }
      })),
      confidence: 0.6,
      metadata: {
        strategy: 'intent_clarification',
        originalQuery: nluResult.query
      }
    };
  }
  
  private buildClarificationResponse(
    options: any[],
    context: ConversationContext
  ): string {
    const templates = [
      {
        template: "Ik wil u graag helpen! Bedoelt u een van deze opties?",
        condition: () => context.fallbackAttempts.clarification === 0
      },
      {
        template: "Excuses, ik wil zeker weten dat ik u goed begrijp. Kunt u aangeven wat u bedoelt?",
        condition: () => context.fallbackAttempts.clarification === 1
      },
      {
        template: "Om u het beste te kunnen helpen, kunt u kiezen uit deze mogelijkheden:",
        condition: () => context.mood === 'frustrated'
      }
    ];
    
    const template = templates.find(t => t.condition()) || templates[0];
    let response = template.template + "\\n\\n";
    
    options.forEach((option, idx) => {
      response += \`**\${idx + 1}.** \${option.description}\\n\`;
    });
    
    response += "\\n_Kies een nummer of omschrijf uw vraag anders._";
    
    return response;
  }
  
  private async requestMissingEntity(
    nluResult: NLUResult,
    context: ConversationContext
  ): Promise<FallbackResponse> {
    const missingEntities = this.identifyMissingEntities(nluResult.intent, nluResult.entities);
    const primaryMissing = missingEntities[0];
    
    const prompts = {
      order_id: {
        friendly: "Om u te kunnen helpen heb ik uw bestelnummer nodig. Deze vindt u in uw bevestigingsmail.",
        examples: ["Bijvoorbeeld: ORD-2024-12345", "of #987654"],
        validation: /^[A-Z0-9\-#]+$/i
      },
      email: {
        friendly: "Mag ik uw e-mailadres om uw account te vinden?",
        examples: ["Bijvoorbeeld: naam@email.nl"],
        validation: /^[^@]+@[^@]+\.[^@]+$/
      },
      product_name: {
        friendly: "Over welk product gaat uw vraag?",
        examples: ["U kunt de productnaam of het artikelnummer noemen"],
        validation: /.{3,}/
      },
      date: {
        friendly: "Op welke datum heeft dit plaatsgevonden?",
        examples: ["Bijvoorbeeld: 15 januari", "of gisteren"],
        validation: /.+/
      }
    };
    
    const prompt = prompts[primaryMissing.type] || {
      friendly: \`Om u te helpen heb ik \${primaryMissing.displayName} nodig.\`,
      examples: [],
      validation: /.*/
    };
    
    return {
      type: 'entity_request',
      content: \`\${prompt.friendly}\\n\\n\${prompt.examples.join('\\n')}\`,
      expectedEntity: primaryMissing,
      validation: prompt.validation,
      confidence: 0.7,
      metadata: {
        strategy: 'missing_entity_request',
        missingEntities: missingEntities
      }
    };
  }
}
\`\`\`

## Guided assistance

### Structured navigation fallback

\`\`\`typescript
class GuidedAssistanceStrategy implements FallbackStrategy {
  private assistanceTree = {
    root: {
      message: "Ik help u graag! Waar gaat uw vraag over?",
      options: [
        {
          id: 'orders',
          label: '📦 Bestellingen',
          description: 'Status, wijzigen, annuleren',
          children: {
            message: "Wat wilt u weten over uw bestelling?",
            options: [
              {
                id: 'order_status',
                label: 'Bestelstatus bekijken',
                action: { intent: 'check_order_status' }
              },
              {
                id: 'cancel_order',
                label: 'Bestelling annuleren',
                action: { intent: 'cancel_order' }
              },
              {
                id: 'modify_order',
                label: 'Bestelling wijzigen',
                action: { intent: 'modify_order' }
              },
              {
                id: 'order_other',
                label: 'Iets anders',
                children: { /* deeper level */ }
              }
            ]
          }
        },
        {
          id: 'products',
          label: '🛍️ Producten',
          description: 'Info, voorraad, aanbiedingen',
          children: { /* product options */ }
        },
        {
          id: 'account',
          label: '👤 Mijn account',
          description: 'Inloggen, gegevens, voorkeuren',
          children: { /* account options */ }
        },
        {
          id: 'returns',
          label: '↩️ Retourneren',
          description: 'Retour aanmelden, status',
          children: { /* return options */ }
        },
        {
          id: 'other',
          label: '❓ Overig',
          description: 'Andere vragen',
          action: { escalate: true }
        }
      ]
    }
  };
  
  async execute(
    query: string,
    nluResult: NLUResult,
    context: ConversationContext
  ): Promise<FallbackResponse> {
    // Determine current position in tree
    const currentNode = this.getCurrentNode(context);
    
    // Smart suggestions based on query analysis
    const suggestions = await this.generateSmartSuggestions(query, currentNode);
    
    return {
      type: 'guided_assistance',
      content: this.formatGuidedResponse(currentNode, suggestions),
      options: this.formatOptions(currentNode.options, suggestions),
      confidence: 0.5,
      metadata: {
        strategy: 'guided_navigation',
        treeLevel: context.guidedAssistanceLevel || 0,
        suggestionsUsed: suggestions.length > 0
      }
    };
  }
  
  private async generateSmartSuggestions(
    query: string,
    currentNode: any
  ): Promise<any[]> {
    const keywords = this.extractKeywords(query);
    const suggestions = [];
    
    // Search through all options recursively
    const searchOptions = (node: any, path: string[] = []) => {
      if (!node.options) return;
      
      node.options.forEach(option => {
        const relevance = this.calculateRelevance(option, keywords);
        if (relevance > 0.3) {
          suggestions.push({
            ...option,
            relevance,
            path
          });
        }
        
        if (option.children) {
          searchOptions(option.children, [...path, option.id]);
        }
      });
    };
    
    searchOptions(this.assistanceTree.root);
    
    // Sort by relevance and take top 3
    return suggestions
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 3);
  }
  
  private formatGuidedResponse(node: any, suggestions: any[]): string {
    let response = node.message;
    
    if (suggestions.length > 0) {
      response = "Op basis van uw vraag, denk ik dat deze opties relevant kunnen zijn:\\n\\n";
      
      suggestions.forEach((sugg, idx) => {
        response += \`**\${idx + 1}. \${sugg.label}**\\n\`;
        if (sugg.description) {
          response += \`   _\${sugg.description}_\\n\`;
        }
      });
      
      response += "\\n_Of kies uit het complete menu hieronder:_\\n\\n" + node.message;
    }
    
    return response;
  }
}
\`\`\`

## Knowledge search fallback

### Intelligent document search

\`\`\`typescript
class KnowledgeSearchStrategy implements FallbackStrategy {
  private searchEngine: SearchEngine;
  private relevanceThreshold = 0.4;
  
  async execute(
    query: string,
    nluResult: NLUResult,
    context: ConversationContext
  ): Promise<FallbackResponse> {
    // Enhance query with context
    const enhancedQuery = this.enhanceQuery(query, context);
    
    // Multi-stage search
    const searchResults = await this.performMultiStageSearch(enhancedQuery);
    
    if (searchResults.length === 0) {
      return this.noResultsResponse(query);
    }
    
    // Format results based on confidence
    if (searchResults[0].score > 0.8) {
      return this.highConfidenceResponse(searchResults[0]);
    } else {
      return this.multipleResultsResponse(searchResults.slice(0, 3));
    }
  }
  
  private async performMultiStageSearch(query: EnhancedQuery): Promise<SearchResult[]> {
    const stages = [
      { 
        name: 'exact_match',
        searcher: () => this.searchEngine.exactMatch(query.processed)
      },
      {
        name: 'fuzzy_match',
        searcher: () => this.searchEngine.fuzzyMatch(query.processed, 0.8)
      },
      {
        name: 'semantic_search',
        searcher: () => this.searchEngine.semanticSearch(query.embeddings)
      },
      {
        name: 'keyword_expansion',
        searcher: () => this.searchEngine.expandedKeywordSearch(query.keywords)
      }
    ];
    
    let allResults: SearchResult[] = [];
    
    for (const stage of stages) {
      const results = await stage.searcher();
      
      if (results.length > 0 && results[0].score > this.relevanceThreshold) {
        allResults.push(...results.map(r => ({ ...r, stage: stage.name })));
        
        // Stop if we have high-quality results
        if (results[0].score > 0.9) break;
      }
    }
    
    // Deduplicate and rank
    return this.rankAndDeduplicate(allResults);
  }
  
  private enhanceQuery(query: string, context: ConversationContext): EnhancedQuery {
    // Extract key information
    const entities = this.extractQueryEntities(query);
    const keywords = this.extractKeywords(query);
    
    // Add context
    const contextKeywords = this.extractContextKeywords(context);
    const allKeywords = [...new Set([...keywords, ...contextKeywords])];
    
    // Generate embeddings for semantic search
    const embeddings = this.generateEmbeddings(query);
    
    // Reformulate query
    const reformulated = this.reformulateQuery(query, entities, context);
    
    return {
      original: query,
      processed: reformulated,
      keywords: allKeywords,
      entities,
      embeddings,
      context: {
        previousIntents: context.intents.slice(-3),
        customerType: context.customer?.type,
        currentTopic: context.currentTopic
      }
    };
  }
  
  private highConfidenceResponse(result: SearchResult): FallbackResponse {
    const content = \`
Ik heb informatie gevonden die kan helpen:

**\${result.title}**

\${result.excerpt}

\${result.hasMore ? \`[Lees meer](\${result.url})\` : ''}

_Is dit wat u zocht?_
    \`;
    
    return {
      type: 'knowledge_result',
      content,
      confidence: result.score * 0.8, // Slightly reduce confidence
      metadata: {
        strategy: 'knowledge_search',
        resultId: result.id,
        searchStage: result.stage
      },
      options: [
        { label: 'Ja, dit helpt', action: { type: 'confirm_helpful' } },
        { label: 'Nee, niet wat ik zoek', action: { type: 'search_again' } },
        { label: 'Ik wil een medewerker spreken', action: { type: 'escalate' } }
      ]
    };
  }
  
  private multipleResultsResponse(results: SearchResult[]): FallbackResponse {
    let content = "Ik heb verschillende artikelen gevonden die mogelijk kunnen helpen:\\n\\n";
    
    results.forEach((result, idx) => {
      content += \`**\${idx + 1}. \${result.title}**\\n\`;
      content += \`_\${result.excerpt.substring(0, 100)}..._\\n\\n\`;
    });
    
    content += "Welk artikel wilt u lezen?";
    
    return {
      type: 'knowledge_results',
      content,
      confidence: 0.5,
      metadata: {
        strategy: 'knowledge_search_multiple',
        resultCount: results.length
      },
      options: results.map((result, idx) => ({
        label: \`Artikel \${idx + 1}\`,
        action: { type: 'view_article', articleId: result.id }
      })).concat([
        { label: 'Geen van deze', action: { type: 'escalate' } }
      ])
    };
  }
}
\`\`\`

## Human handoff

### Intelligent escalation

\`\`\`typescript
interface EscalationContext {
  reason: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  customerValue: number;
  conversationSummary: string;
  suggestedAgent: AgentProfile;
  handoffData: any;
}

class HumanHandoffStrategy implements FallbackStrategy {
  private agentRouter: AgentRouter;
  private queueManager: QueueManager;
  
  async execute(
    query: string,
    nluResult: NLUResult,
    context: ConversationContext
  ): Promise<FallbackResponse> {
    // Analyze escalation need
    const escalationContext = await this.analyzeEscalation(query, context);
    
    // Find best available agent
    const agent = await this.findBestAgent(escalationContext);
    
    if (!agent.available) {
      return this.queueResponse(escalationContext, agent);
    }
    
    // Prepare handoff
    const handoffData = await this.prepareHandoff(context, escalationContext);
    
    // Initiate transfer
    const transfer = await this.initiateTransfer(agent, handoffData);
    
    return {
      type: 'human_handoff',
      content: this.formatHandoffMessage(agent, transfer),
      confidence: 1.0,
      metadata: {
        strategy: 'human_escalation',
        agentId: agent.id,
        transferId: transfer.id,
        estimatedWait: transfer.estimatedWait
      }
    };
  }
  
  private async analyzeEscalation(
    query: string,
    context: ConversationContext
  ): Promise<EscalationContext> {
    // Determine urgency
    const urgency = this.calculateUrgency(query, context);
    
    // Get customer value
    const customerValue = await this.getCustomerValue(context.customerId);
    
    // Generate conversation summary
    const summary = this.generateConversationSummary(context);
    
    // Determine reason
    const reason = this.determineEscalationReason(context);
    
    // Suggest best agent type
    const suggestedAgent = this.suggestAgentProfile(reason, context);
    
    return {
      reason,
      urgency,
      customerValue,
      conversationSummary: summary,
      suggestedAgent,
      handoffData: {
        originalQuery: query,
        failedIntents: context.failedIntents,
        customerMood: context.mood,
        previousAttempts: context.fallbackAttempts
      }
    };
  }
  
  private calculateUrgency(query: string, context: ConversationContext): string {
    const urgencyIndicators = {
      critical: [/urgent|dringend|emergency|kritiek/i, /legal|juridisch|aanklacht/i],
      high: [/belangrijk|nodig|must|deadline/i, /boos|kwaad|teleurgesteld/i],
      medium: [/vraag|help|assistentie/i, /probleem|issue/i],
      low: [/informatie|info|wanneer/i]
    };
    
    // Check query for urgency keywords
    for (const [level, patterns] of Object.entries(urgencyIndicators)) {
      if (patterns.some(pattern => pattern.test(query))) {
        return level;
      }
    }
    
    // Check context factors
    if (context.customerMood === 'angry') return 'high';
    if (context.fallbackAttempts.total > 5) return 'high';
    if (context.conversationDuration > 600000) return 'medium'; // 10+ minutes
    
    return 'low';
  }
  
  private async findBestAgent(context: EscalationContext): Promise<AgentProfile> {
    const availableAgents = await this.agentRouter.getAvailableAgents();
    
    // Score agents based on match
    const scoredAgents = availableAgents.map(agent => ({
      agent,
      score: this.scoreAgentMatch(agent, context)
    }));
    
    // Sort by score
    scoredAgents.sort((a, b) => b.score - a.score);
    
    if (scoredAgents.length === 0 || scoredAgents[0].score < 0.3) {
      // No good match, return queue info
      return {
        id: 'queue',
        available: false,
        name: 'Wachtrij',
        estimatedWait: await this.queueManager.getEstimatedWait(context.urgency)
      };
    }
    
    return scoredAgents[0].agent;
  }
  
  private scoreAgentMatch(agent: AgentProfile, context: EscalationContext): number {
    let score = 0;
    
    // Skill match
    const requiredSkills = context.suggestedAgent.skills;
    const matchingSkills = agent.skills.filter(s => requiredSkills.includes(s));
    score += (matchingSkills.length / requiredSkills.length) * 0.4;
    
    // Language match
    if (agent.languages.includes(context.suggestedAgent.language)) {
      score += 0.2;
    }
    
    // Availability score
    score += (1 - agent.currentLoad) * 0.2;
    
    // Customer value priority
    if (context.customerValue > 1000 && agent.tier === 'senior') {
      score += 0.2;
    }
    
    return score;
  }
  
  private formatHandoffMessage(agent: AgentProfile, transfer: Transfer): string {
    if (!agent.available) {
      return \`
Ik verbind u door met een van onze medewerkers.

**Geschatte wachttijd**: \${this.formatWaitTime(agent.estimatedWait)}

In de tussentijd kunt u:
- Uw vraag alvast typen zodat de medewerker direct kan helpen
- Onze veelgestelde vragen bekijken
- Uw contactgegevens controleren

U behoudt uw positie in de wachtrij, ook als u even weg moet.
      \`;
    }
    
    return \`
Ik verbind u door met \${agent.name} van ons \${agent.department} team.

\${agent.name} is gespecialiseerd in \${agent.specialization} en kan u het beste helpen met uw vraag.

**Een moment geduld**, de verbinding wordt opgezet...

_Tip: \${agent.name} kan uw hele gespreksgeschiedenis zien._
    \`;
  }
}
\`\`\`

## Error recovery

### Graceful error handling

\`\`\`typescript
class ErrorRecoveryManager {
  private errorHandlers: Map<string, ErrorHandler> = new Map();
  
  constructor() {
    this.registerErrorHandlers();
  }
  
  private registerErrorHandlers() {
    // API errors
    this.errorHandlers.set('api_error', {
      handle: async (error, context) => {
        if (error.code === 'TIMEOUT') {
          return {
            content: "Het duurt wat langer dan normaal om de informatie op te halen. Een momentje nog...",
            retry: true,
            fallback: () => this.getCachedResponse(context)
          };
        }
        
        return {
          content: "Er is een technisch probleem. Ik probeer het opnieuw...",
          retry: true,
          maxRetries: 3
        };
      }
    });
    
    // Data errors
    this.errorHandlers.set('data_not_found', {
      handle: async (error, context) => {
        const alternatives = await this.findAlternatives(error.query);
        
        if (alternatives.length > 0) {
          return {
            content: \`
Ik kan de gevraagde informatie niet vinden. 

Bedoelde u misschien:
\${alternatives.map((alt, idx) => \`\${idx + 1}. \${alt}\`).join('\\n')}
            \`,
            options: alternatives
          };
        }
        
        return {
          content: "De gevraagde informatie is momenteel niet beschikbaar. Kan ik u ergens anders mee helpen?",
          escalate: true
        };
      }
    });
    
    // Permission errors
    this.errorHandlers.set('permission_denied', {
      handle: async (error, context) => {
        return {
          content: \`
Voor deze informatie moet ik eerst uw identiteit verifiëren.

Kunt u een van de volgende gegevens verstrekken?
- Uw klantnummer
- E-mailadres gekoppeld aan uw account
- Laatste 4 cijfers van uw telefoonnummer
          \`,
          requiresAuth: true
        };
      }
    });
  }
  
  async handleError(
    error: BotError,
    context: ConversationContext
  ): Promise<ErrorRecoveryResponse> {
    // Log error for monitoring
    await this.logError(error, context);
    
    // Get appropriate handler
    const handler = this.errorHandlers.get(error.type) || this.defaultHandler;
    
    // Execute recovery
    const recovery = await handler.handle(error, context);
    
    // Track recovery attempt
    context.errorRecoveries.push({
      errorType: error.type,
      timestamp: new Date(),
      strategy: recovery.strategy,
      successful: false // Will be updated based on user response
    });
    
    return recovery;
  }
  
  private defaultHandler: ErrorHandler = {
    handle: async (error, context) => {
      const responses = [
        "Oeps, er ging iets mis. Laten we het opnieuw proberen.",
        "Excuses, ik ondervind een technisch probleem. Een momentje...",
        "Het spijt me, dat ging niet helemaal goed. Ik probeer een andere aanpak."
      ];
      
      const response = responses[Math.min(context.errorCount, responses.length - 1)];
      
      return {
        content: response,
        retry: context.errorCount < 3,
        escalate: context.errorCount >= 3
      };
    }
  };
}
\`\`\`

## Frustration detection

### Emotional state monitoring

\`\`\`typescript
class FrustrationDetector {
  private indicators = {
    linguistic: [
      /waardeloos|slecht|verschrikkelijk/i,
      /niet werk(t|en)|kapot|stuk/i,
      /belachelijk|idioot|dom/i,
      /genoeg|klaar mee|beu/i,
      /wtf|omg|serieus/i
    ],
    behavioral: {
      rapidMessages: { threshold: 3, timeWindow: 5000 }, // 3 messages in 5 seconds
      repeatedQueries: { threshold: 2, similarity: 0.8 },
      capsLockUsage: { threshold: 0.5 }, // 50% of message in caps
      exclamationMarks: { threshold: 3 },
      shortResponses: { threshold: 5, maxLength: 10 } // 5 consecutive short responses
    },
    contextual: {
      fallbackCount: { threshold: 3 },
      conversationLength: { threshold: 15 }, // 15+ turns
      unsuccessfulAttempts: { threshold: 3 }
    }
  };
  
  detectFrustration(
    message: string,
    context: ConversationContext
  ): FrustrationLevel {
    const scores = {
      linguistic: this.analyzeLinguisticIndicators(message),
      behavioral: this.analyzeBehavioralIndicators(message, context),
      contextual: this.analyzeContextualIndicators(context),
      sentiment: this.analyzeSentiment(message)
    };
    
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / 4;
    
    return {
      level: this.scoreToLevel(totalScore),
      score: totalScore,
      indicators: this.getActiveIndicators(scores),
      recommendation: this.getRecommendation(totalScore, context)
    };
  }
  
  private analyzeLinguisticIndicators(message: string): number {
    let score = 0;
    
    this.indicators.linguistic.forEach(pattern => {
      if (pattern.test(message)) {
        score += 0.2;
      }
    });
    
    // Check for swearing (censored)
    if (/\\*{3,}|@#\\$%|!@#/i.test(message)) {
      score += 0.3;
    }
    
    return Math.min(score, 1);
  }
  
  private getRecommendation(score: number, context: ConversationContext): string {
    if (score > 0.8) {
      return 'immediate_escalation';
    } else if (score > 0.6) {
      return 'empathetic_response';
    } else if (score > 0.4) {
      return 'offer_alternatives';
    }
    
    return 'continue_normal';
  }
}

// Empathetic response generator
class EmpatheticResponseGenerator {
  generateResponse(frustrationLevel: FrustrationLevel, context: ConversationContext): string {
    const templates = {
      high: [
        "Ik begrijp dat dit frustrerend is. Laat me u direct doorverbinden met een collega die u persoonlijk kan helpen.",
        "Het spijt me zeer dat u deze ervaring heeft. Ik zorg er direct voor dat een medewerker u verder helpt.",
        "Ik zie dat we u niet de hulp bieden die u verdient. Een moment, ik verbind u door met iemand die dit direct kan oplossen."
      ],
      medium: [
        "Ik merk dat het niet lukt zoals u wilt. Laten we een andere aanpak proberen.",
        "Excuses voor het ongemak. Ik wil u graag beter helpen. Kunt u me vertellen wat het belangrijkste is dat we nu oplossen?",
        "Het spijt me dat het zo moeizaam gaat. Zal ik u doorverbinden met een collega of wilt u dat we het samen nog een keer proberen?"
      ],
      low: [
        "Ik help u graag verder. Laten we stap voor stap kijken wat we kunnen doen.",
        "Geen zorgen, we komen er wel uit. Wat is het belangrijkste waar ik u nu mee kan helpen?",
        "Ik begrijp het. Laten we even een stapje terug doen. Waarmee kan ik u het beste helpen?"
      ]
    };
    
    const level = frustrationLevel.level;
    const options = templates[level] || templates.low;
    
    return options[Math.floor(Math.random() * options.length)];
  }
}
\`\`\`

## Learning from failures

### Continuous improvement system

\`\`\`typescript
class FailureAnalyzer {
  async analyzeFailure(
    conversation: Conversation,
    outcome: ConversationOutcome
  ): Promise<FailureAnalysis> {
    const analysis = {
      conversationId: conversation.id,
      timestamp: new Date(),
      failurePoints: this.identifyFailurePoints(conversation),
      rootCauses: await this.identifyRootCauses(conversation),
      patterns: this.detectPatterns(conversation),
      improvements: this.suggestImprovements(conversation, outcome)
    };
    
    // Store for pattern analysis
    await this.storeAnalysis(analysis);
    
    // Generate training data if applicable
    if (analysis.improvements.includes('training_data')) {
      await this.generateTrainingData(conversation, analysis);
    }
    
    return analysis;
  }
  
  private identifyFailurePoints(conversation: Conversation): FailurePoint[] {
    const points: FailurePoint[] = [];
    
    conversation.turns.forEach((turn, index) => {
      // Check confidence drop
      if (turn.confidence < 0.5) {
        points.push({
          turnIndex: index,
          type: 'low_confidence',
          confidence: turn.confidence,
          query: turn.query
        });
      }
      
      // Check fallback usage
      if (turn.usedFallback) {
        points.push({
          turnIndex: index,
          type: 'fallback_triggered',
          fallbackType: turn.fallbackType,
          reason: turn.fallbackReason
        });
      }
      
      // Check user satisfaction indicators
      if (this.detectDissatisfaction(turn, conversation.turns[index + 1])) {
        points.push({
          turnIndex: index,
          type: 'user_dissatisfaction',
          indicators: turn.dissatisfactionIndicators
        });
      }
    });
    
    return points;
  }
  
  private async generateTrainingData(
    conversation: Conversation,
    analysis: FailureAnalysis
  ): Promise<void> {
    // Extract successful resolution if found
    const resolution = this.findResolution(conversation);
    
    if (resolution) {
      // Create training examples from failed attempts and successful resolution
      const trainingExamples = analysis.failurePoints
        .filter(p => p.type === 'low_confidence')
        .map(failure => ({
          query: failure.query,
          correctIntent: resolution.intent,
          entities: resolution.entities,
          context: this.extractContext(conversation, failure.turnIndex),
          metadata: {
            source: 'failure_recovery',
            confidence: 'high',
            validated: true
          }
        }));
      
      await this.submitTrainingData(trainingExamples);
    }
  }
}

// Pattern detection for systematic improvements
class PatternDetector {
  detectSystemicIssues(failures: FailureAnalysis[]): SystemicIssue[] {
    const issues: SystemicIssue[] = [];
    
    // Group by failure type
    const grouped = this.groupByFailureType(failures);
    
    // Analyze each group
    Object.entries(grouped).forEach(([type, failureGroup]) => {
      if (failureGroup.length > 10) { // Threshold for systemic issue
        const commonalities = this.findCommonalities(failureGroup);
        
        if (commonalities.confidence > 0.7) {
          issues.push({
            type,
            frequency: failureGroup.length,
            commonalities,
            suggestedFixes: this.generateFixes(type, commonalities),
            priority: this.calculatePriority(failureGroup)
          });
        }
      }
    });
    
    return issues.sort((a, b) => b.priority - a.priority);
  }
}
\`\`\`

## Opdracht

Implementeer een volledig fallback systeem voor een travel booking customer service bot:

1. **Fallback hiërarchie**:
   - Implementeer 4+ fallback levels
   - Bouw smart escalation logic
   - Test met verschillende failure scenarios

2. **Clarification strategies**:
   - Intent disambiguation voor travel queries
   - Entity extraction voor: dates, destinations, passengers
   - Multi-turn clarification flows

3. **Knowledge search**:
   - Integreer met travel FAQ database
   - Implementeer semantic search
   - Handle no-results gracefully

4. **Human handoff**:
   - Bouw agent skill matching
   - Implementeer queue management
   - Create smooth transition flow

5. **Learning system**:
   - Track failure patterns
   - Generate improvement recommendations
   - Auto-generate training data

Test scenarios:
- "Ik wil naar daar volgende week" (unclear destination)
- "Het werkt niet!" (vague complaint)
- Rapid-fire frustrated messages
- Complex multi-city booking questions

Deliverables:
- Complete fallback system implementation
- Test results met 20+ failure scenarios
- Frustration detection accuracy report
- Continuous improvement pipeline

Succes met het bouwen van een robuust fallback systeem!
`
};