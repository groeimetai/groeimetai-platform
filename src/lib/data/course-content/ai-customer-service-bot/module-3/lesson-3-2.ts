export const lesson3_2 = {
  id: 'natural-language-understanding',
  title: 'Natural Language Understanding: Intent training en entities',
  duration: '50 min',
  content: `
# Natural Language Understanding: Intent training en entities

## Introductie

Natural Language Understanding (NLU) is het brein van je customer service bot. Het vertaalt wat klanten zeggen naar acties die je bot kan uitvoeren. In deze les leren we hoe je intents traint, entities extraheert en een robuust NLU systeem bouwt voor real-world customer service scenarios.

## Fundamenten van NLU

### Intent vs Entity

**Intent**: WAT de gebruiker wil bereiken
**Entity**: SPECIFIEKE informatie in de vraag

Voorbeeld:
- Gebruiker: "Ik wil mijn bestelling 12345 annuleren"
- Intent: \`cancel_order\`
- Entity: \`order_number: 12345\`

## Intent classificatie systeem

### Hierarchische intent structuur

\`\`\`typescript
interface IntentHierarchy {
  domain: string;
  primaryIntent: string;
  subIntent?: string;
  confidence: number;
  alternativeIntents: AlternativeIntent[];
}

// Voorbeeld hierarchie voor customer service
const intentStructure = {
  'order_management': {
    'order_status': ['check_status', 'track_package', 'delivery_time'],
    'order_modification': ['cancel_order', 'change_address', 'add_item'],
    'order_issues': ['missing_item', 'wrong_item', 'damaged_item']
  },
  'payment': {
    'payment_methods': ['available_methods', 'add_payment', 'remove_payment'],
    'payment_issues': ['payment_failed', 'double_charge', 'refund_status'],
    'billing': ['invoice_request', 'billing_address', 'tax_info']
  },
  'product': {
    'product_info': ['specifications', 'availability', 'pricing'],
    'product_comparison': ['compare_products', 'alternatives', 'recommendations'],
    'product_issues': ['defect', 'warranty', 'manual_request']
  },
  'account': {
    'account_access': ['reset_password', 'unlock_account', 'two_factor'],
    'account_management': ['update_info', 'delete_account', 'privacy_settings'],
    'preferences': ['notifications', 'language', 'communication']
  }
};

class IntentClassifier {
  private model: NLUModel;
  private threshold: number = 0.7;
  
  async classifyIntent(utterance: string): Promise<IntentHierarchy> {
    // Preprocess input
    const processed = this.preprocessText(utterance);
    
    // Get intent predictions
    const predictions = await this.model.predict(processed);
    
    // Build hierarchical classification
    const topIntent = predictions[0];
    
    return {
      domain: this.extractDomain(topIntent.intent),
      primaryIntent: this.extractPrimaryIntent(topIntent.intent),
      subIntent: this.extractSubIntent(topIntent.intent),
      confidence: topIntent.confidence,
      alternativeIntents: predictions.slice(1, 4).map(p => ({
        intent: p.intent,
        confidence: p.confidence
      }))
    };
  }
  
  private preprocessText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
\`\`\`

## Training data generatie

### Synthetic data augmentation

\`\`\`typescript
class TrainingDataGenerator {
  private templates: Map<string, string[]> = new Map();
  private synonyms: Map<string, string[]> = new Map();
  
  constructor() {
    this.initializeTemplates();
    this.initializeSynonyms();
  }
  
  private initializeTemplates() {
    // Cancel order templates
    this.templates.set('cancel_order', [
      'ik wil mijn bestelling {order_id} annuleren',
      'kan ik order {order_id} cancelen',
      'annuleer bestelling {order_id} alsjeblieft',
      'ik wil {order_id} niet meer',
      'stop mijn order {order_id}',
      'cancel {order_id}',
      'bestelling {order_id} annuleren graag',
      'ik heb me bedacht over {order_id}',
      'kan {order_id} nog geannuleerd worden',
      'hoe annuleer ik order nummer {order_id}'
    ]);
    
    // Check status templates  
    this.templates.set('check_status', [
      'waar is mijn bestelling {order_id}',
      'status van order {order_id}',
      'wanneer komt {order_id} aan',
      'track {order_id}',
      'hoe laat komt mijn pakket {order_id}',
      'is {order_id} al onderweg',
      'bezorgtijd voor {order_id}',
      'wanneer wordt {order_id} geleverd',
      'wat is de status van bestelling {order_id}',
      '{order_id} track and trace'
    ]);
  }
  
  private initializeSynonyms() {
    this.synonyms.set('annuleren', [
      'cancelen', 'stoppen', 'afzeggen', 'opzeggen', 
      'schrappen', 'afbestellen', 'intrekken'
    ]);
    
    this.synonyms.set('bestelling', [
      'order', 'aankoop', 'pakket', 'zending',
      'levering', 'pakketje'
    ]);
  }
  
  generateVariations(intent: string, count: number): TrainingExample[] {
    const templates = this.templates.get(intent) || [];
    const examples: TrainingExample[] = [];
    
    for (let i = 0; i < count; i++) {
      // Random template
      const template = templates[Math.floor(Math.random() * templates.length)];
      
      // Generate variation
      let variation = template;
      
      // Replace entities
      variation = this.replaceEntities(variation);
      
      // Apply synonyms
      variation = this.applySynonyms(variation);
      
      // Add typos (5% chance)
      if (Math.random() < 0.05) {
        variation = this.introduceTypo(variation);
      }
      
      // Add noise (10% chance)
      if (Math.random() < 0.1) {
        variation = this.addNoise(variation);
      }
      
      examples.push({
        text: variation,
        intent: intent,
        entities: this.extractEntities(variation)
      });
    }
    
    return examples;
  }
  
  private replaceEntities(template: string): string {
    return template.replace(/{order_id}/g, () => 
      this.generateOrderId()
    );
  }
  
  private generateOrderId(): string {
    const formats = [
      () => \`ORD-\${Math.floor(Math.random() * 999999)}\`,
      () => \`\${Math.floor(Math.random() * 9999999)}\`,
      () => \`2024-\${Math.floor(Math.random() * 99999)}\`,
      () => \`#\${Math.floor(Math.random() * 999999)}\`
    ];
    
    return formats[Math.floor(Math.random() * formats.length)]();
  }
  
  private applySynonyms(text: string): string {
    let result = text;
    
    this.synonyms.forEach((synonymList, word) => {
      if (result.includes(word) && Math.random() < 0.3) {
        const synonym = synonymList[Math.floor(Math.random() * synonymList.length)];
        result = result.replace(word, synonym);
      }
    });
    
    return result;
  }
  
  private introduceTypo(text: string): string {
    const words = text.split(' ');
    const wordIndex = Math.floor(Math.random() * words.length);
    const word = words[wordIndex];
    
    if (word.length > 3) {
      const charIndex = Math.floor(Math.random() * (word.length - 1)) + 1;
      const chars = word.split('');
      
      // Swap adjacent characters
      [chars[charIndex], chars[charIndex - 1]] = [chars[charIndex - 1], chars[charIndex]];
      words[wordIndex] = chars.join('');
    }
    
    return words.join(' ');
  }
}

// Gebruik
const generator = new TrainingDataGenerator();
const trainingData = generator.generateVariations('cancel_order', 100);
\`\`\`

## Entity extraction

### Multi-type entity recognition

\`\`\`typescript
interface EntityExtractor {
  type: string;
  patterns: RegExp[];
  validator?: (value: string) => boolean;
  normalizer?: (value: string) => string;
}

class EntityExtractionPipeline {
  private extractors: Map<string, EntityExtractor> = new Map();
  
  constructor() {
    this.registerExtractors();
  }
  
  private registerExtractors() {
    // Order ID extractor
    this.extractors.set('order_id', {
      type: 'order_id',
      patterns: [
        /\b(?:ORD|ORDER|BES)[-\s]?\d{4,10}\b/i,
        /\b#?\d{7,10}\b/,
        /\b\d{4}-\d{5,8}\b/,
        /\b(?:bestelling|order)\s*(?:nummer|nr\.?|#)?\s*(\S+)\b/i
      ],
      validator: (value) => {
        // Validate order ID format
        return /^[A-Z0-9\-#]+$/i.test(value) && value.length >= 5;
      },
      normalizer: (value) => {
        return value.toUpperCase().replace(/[^A-Z0-9\-]/g, '');
      }
    });
    
    // Email extractor
    this.extractors.set('email', {
      type: 'email',
      patterns: [
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
      ],
      validator: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
      },
      normalizer: (value) => value.toLowerCase()
    });
    
    // Phone number extractor
    this.extractors.set('phone', {
      type: 'phone',
      patterns: [
        /\b(?:\+31|0031|0)[1-9]\d{8}\b/,
        /\b06[\s-]?\d{8}\b/,
        /\b\d{3}[\s-]?\d{3}[\s-]?\d{4}\b/
      ],
      normalizer: (value) => {
        return value.replace(/\D/g, '').replace(/^31/, '0');
      }
    });
    
    // Date extractor
    this.extractors.set('date', {
      type: 'date',
      patterns: [
        /\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b/,
        /\b(?:vandaag|morgen|overmorgen|gisteren)\b/i,
        /\b(?:maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag|zondag)\b/i,
        /\b\d{1,2}\s+(?:januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december)\b/i
      ],
      normalizer: (value) => {
        // Convert relative dates
        const today = new Date();
        const lowercase = value.toLowerCase();
        
        if (lowercase === 'vandaag') return today.toISOString().split('T')[0];
        if (lowercase === 'morgen') {
          today.setDate(today.getDate() + 1);
          return today.toISOString().split('T')[0];
        }
        if (lowercase === 'gisteren') {
          today.setDate(today.getDate() - 1);
          return today.toISOString().split('T')[0];
        }
        
        return value;
      }
    });
    
    // Product name/SKU extractor
    this.extractors.set('product', {
      type: 'product',
      patterns: [
        /\b[A-Z]{2,4}[-\s]?\d{3,6}\b/, // SKU pattern
        /\b(?:model|artikel|product)\s*(?:nummer|nr\.?|code)?\s*(\S+)\b/i
      ]
    });
    
    // Money amount extractor
    this.extractors.set('amount', {
      type: 'amount',
      patterns: [
        /€\s?\d+(?:[,.]\d{2})?/,
        /\b\d+(?:[,.]\d{2})?\s?(?:euro|EUR)\b/i,
        /\b\d+[,.]\d{2}\b/
      ],
      normalizer: (value) => {
        const amount = value.replace(/[^0-9,.-]/g, '').replace(',', '.');
        return parseFloat(amount).toFixed(2);
      }
    });
  }
  
  extractEntities(text: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    
    this.extractors.forEach((extractor, type) => {
      extractor.patterns.forEach(pattern => {
        const matches = text.matchAll(new RegExp(pattern, 'g'));
        
        for (const match of matches) {
          let value = match[1] || match[0];
          
          // Validate if validator exists
          if (extractor.validator && !extractor.validator(value)) {
            continue;
          }
          
          // Normalize if normalizer exists
          if (extractor.normalizer) {
            value = extractor.normalizer(value);
          }
          
          entities.push({
            type: extractor.type,
            value: value,
            start: match.index!,
            end: match.index! + match[0].length,
            confidence: this.calculateConfidence(match[0], pattern),
            raw: match[0]
          });
        }
      });
    });
    
    // Remove duplicates and overlapping entities
    return this.deduplicateEntities(entities);
  }
  
  private calculateConfidence(match: string, pattern: RegExp): number {
    // Simple confidence calculation
    let confidence = 0.7;
    
    // Exact pattern matches get higher confidence
    if (pattern.test(match) && match.length > 5) {
      confidence += 0.2;
    }
    
    // Well-formatted entities get bonus
    if (/^[A-Z0-9\-]+$/.test(match)) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }
  
  private deduplicateEntities(entities: ExtractedEntity[]): ExtractedEntity[] {
    // Sort by confidence and position
    entities.sort((a, b) => b.confidence - a.confidence || a.start - b.start);
    
    const result: ExtractedEntity[] = [];
    const used = new Set<string>();
    
    for (const entity of entities) {
      const key = \`\${entity.start}-\${entity.end}\`;
      if (!used.has(key)) {
        used.add(key);
        result.push(entity);
      }
    }
    
    return result;
  }
}
\`\`\`

## Context-aware NLU

### Conversation context integration

\`\`\`typescript
interface ConversationContext {
  previousIntents: string[];
  mentionedEntities: Map<string, any>;
  customerProfile: CustomerProfile;
  currentTopic: string;
  sessionDuration: number;
}

class ContextAwareNLU {
  private contextWindow: number = 5; // Last 5 turns
  
  async processWithContext(
    utterance: string, 
    context: ConversationContext
  ): Promise<NLUResult> {
    // Base NLU processing
    const baseResult = await this.baseNLU.process(utterance);
    
    // Apply context corrections
    const contextualResult = this.applyContext(baseResult, context);
    
    // Resolve references
    const resolvedResult = this.resolveReferences(contextualResult, context);
    
    // Intent disambiguation
    const finalResult = this.disambiguateIntent(resolvedResult, context);
    
    return finalResult;
  }
  
  private applyContext(result: NLUResult, context: ConversationContext): NLUResult {
    // Example: "cancel it" after talking about an order
    if (result.intent === 'general_cancel' && context.currentTopic === 'order') {
      result.intent = 'cancel_order';
      result.confidence *= 0.9; // Slight confidence reduction for inference
    }
    
    // Example: "how much?" after product inquiry
    if (result.intent === 'general_inquiry' && 
        context.previousIntents.includes('product_info')) {
      result.intent = 'product_price';
    }
    
    return result;
  }
  
  private resolveReferences(result: NLUResult, context: ConversationContext): NLUResult {
    const pronouns = ['het', 'dat', 'deze', 'die', 'mijn', 'de'];
    
    result.entities.forEach(entity => {
      if (entity.type === 'reference' && pronouns.includes(entity.value.toLowerCase())) {
        // Try to resolve from context
        const resolved = this.findReferent(entity.value, context);
        if (resolved) {
          entity.resolvedValue = resolved.value;
          entity.resolvedType = resolved.type;
        }
      }
    });
    
    return result;
  }
  
  private findReferent(pronoun: string, context: ConversationContext): any {
    // Look for recent entities
    const recentEntities = Array.from(context.mentionedEntities.entries())
      .slice(-3)
      .reverse();
    
    for (const [type, value] of recentEntities) {
      if (this.pronounMatchesType(pronoun, type)) {
        return { type, value };
      }
    }
    
    return null;
  }
}
\`\`\`

## Training best practices

### Active learning pipeline

\`\`\`typescript
class ActiveLearningPipeline {
  private uncertaintyThreshold = 0.6;
  private confidenceGap = 0.2;
  
  async processAndLearn(utterance: string): Promise<LearningResult> {
    const prediction = await this.nluModel.predict(utterance);
    
    // Check if we should ask for clarification
    if (this.shouldRequestFeedback(prediction)) {
      const feedback = await this.requestUserFeedback(utterance, prediction);
      
      if (feedback.correctedIntent) {
        await this.addToTrainingQueue({
          text: utterance,
          intent: feedback.correctedIntent,
          entities: prediction.entities,
          userValidated: true
        });
      }
    }
    
    return {
      prediction,
      learningTriggered: prediction.confidence < this.uncertaintyThreshold
    };
  }
  
  private shouldRequestFeedback(prediction: NLUPrediction): boolean {
    // Low confidence
    if (prediction.confidence < this.uncertaintyThreshold) return true;
    
    // Close second choice
    if (prediction.alternatives.length > 0) {
      const gap = prediction.confidence - prediction.alternatives[0].confidence;
      if (gap < this.confidenceGap) return true;
    }
    
    return false;
  }
  
  async requestUserFeedback(utterance: string, prediction: NLUPrediction): Promise<UserFeedback> {
    // In production: present options to user
    const response = await this.bot.ask(\`
      Ik ben niet helemaal zeker wat u bedoelt met "\${utterance}".
      
      Bedoelt u:
      1. \${this.getIntentDescription(prediction.intent)} 
      2. \${this.getIntentDescription(prediction.alternatives[0]?.intent)}
      3. Iets anders
    \`);
    
    return this.parseFeedbackResponse(response);
  }
}

// Training data quality monitoring
class TrainingDataQuality {
  analyzeDataset(dataset: TrainingExample[]): QualityReport {
    return {
      totalExamples: dataset.length,
      uniqueIntents: this.countUniqueIntents(dataset),
      balanceScore: this.calculateBalance(dataset),
      diversityScore: this.calculateDiversity(dataset),
      ambiguityScore: this.detectAmbiguity(dataset),
      recommendations: this.generateRecommendations(dataset)
    };
  }
  
  private calculateBalance(dataset: TrainingExample[]): number {
    const intentCounts = new Map<string, number>();
    
    dataset.forEach(example => {
      intentCounts.set(example.intent, (intentCounts.get(example.intent) || 0) + 1);
    });
    
    const counts = Array.from(intentCounts.values());
    const mean = counts.reduce((a, b) => a + b) / counts.length;
    const variance = counts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / counts.length;
    
    // Lower variance = better balance
    return 1 / (1 + Math.sqrt(variance) / mean);
  }
  
  private calculateDiversity(dataset: TrainingExample[]): number {
    const uniquePatterns = new Set<string>();
    
    dataset.forEach(example => {
      // Create pattern by replacing entities
      const pattern = example.text
        .replace(/\b\d+\b/g, '<NUMBER>')
        .replace(/\b[A-Z0-9\-]{5,}\b/g, '<ID>')
        .replace(/\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi, '<EMAIL>');
      
      uniquePatterns.add(pattern);
    });
    
    return uniquePatterns.size / dataset.length;
  }
}
\`\`\`

## Multi-language NLU

### Language-agnostic intent detection

\`\`\`typescript
class MultilingualNLU {
  private languages = ['nl', 'en', 'de', 'fr'];
  private models: Map<string, NLUModel> = new Map();
  
  async process(utterance: string): Promise<MultilingualResult> {
    // Detect language
    const language = await this.detectLanguage(utterance);
    
    // Get language-specific model
    const model = this.models.get(language) || this.models.get('nl');
    
    // Process with language model
    const result = await model.process(utterance);
    
    // Map to universal intents
    const universalIntent = this.mapToUniversalIntent(result.intent, language);
    
    return {
      language,
      originalIntent: result.intent,
      universalIntent,
      entities: result.entities,
      confidence: result.confidence * this.getLanguageConfidence(language)
    };
  }
  
  private mapToUniversalIntent(intent: string, language: string): string {
    const intentMappings = {
      'nl': {
        'annuleer_bestelling': 'cancel_order',
        'check_status': 'check_status',
        'retour_aanvragen': 'request_return'
      },
      'en': {
        'cancel_order': 'cancel_order',
        'order_status': 'check_status',
        'return_request': 'request_return'
      },
      'de': {
        'bestellung_stornieren': 'cancel_order',
        'status_prüfen': 'check_status',
        'rücksendung': 'request_return'
      }
    };
    
    return intentMappings[language]?.[intent] || intent;
  }
}
\`\`\`

## Real-world implementation

### Complete NLU pipeline voor customer service

\`\`\`typescript
class CustomerServiceNLU {
  private pipeline: NLUPipeline;
  private entityExtractor: EntityExtractionPipeline;
  private contextManager: ContextAwareNLU;
  private qualityMonitor: TrainingDataQuality;
  
  async processCustomerQuery(
    query: string, 
    sessionId: string
  ): Promise<CustomerServiceResponse> {
    try {
      // Step 1: Preprocess
      const preprocessed = this.preprocess(query);
      
      // Step 2: Extract entities
      const entities = await this.entityExtractor.extractEntities(preprocessed);
      
      // Step 3: Get context
      const context = await this.contextManager.getContext(sessionId);
      
      // Step 4: Classify intent with context
      const nluResult = await this.contextManager.processWithContext(
        preprocessed, 
        context
      );
      
      // Step 5: Validate and enrich
      const enrichedResult = await this.enrichResult(nluResult, entities);
      
      // Step 6: Generate response
      const response = await this.generateResponse(enrichedResult);
      
      // Step 7: Update context
      await this.contextManager.updateContext(sessionId, enrichedResult);
      
      // Step 8: Log for training
      await this.logForTraining(query, enrichedResult, response);
      
      return response;
      
    } catch (error) {
      console.error('NLU processing error:', error);
      return this.getFallbackResponse();
    }
  }
  
  private async enrichResult(
    nluResult: NLUResult, 
    entities: ExtractedEntity[]
  ): Promise<EnrichedNLUResult> {
    // Merge entities from both sources
    const mergedEntities = this.mergeEntities(nluResult.entities, entities);
    
    // Validate required entities for intent
    const validation = this.validateRequiredEntities(nluResult.intent, mergedEntities);
    
    // Fetch additional data
    const enrichments = await this.fetchEnrichments(mergedEntities);
    
    return {
      ...nluResult,
      entities: mergedEntities,
      validation,
      enrichments,
      processingMetadata: {
        timestamp: new Date(),
        processingTime: Date.now() - nluResult.startTime,
        confidence: this.calculateOverallConfidence(nluResult, validation)
      }
    };
  }
  
  private validateRequiredEntities(
    intent: string, 
    entities: ExtractedEntity[]
  ): ValidationResult {
    const requirements = {
      'cancel_order': ['order_id'],
      'check_status': ['order_id'],
      'request_refund': ['order_id', 'amount'],
      'update_address': ['order_id', 'address'],
      'product_inquiry': ['product_id']
    };
    
    const required = requirements[intent] || [];
    const provided = entities.map(e => e.type);
    const missing = required.filter(r => !provided.includes(r));
    
    return {
      isValid: missing.length === 0,
      missing,
      message: missing.length > 0 
        ? \`Om u te kunnen helpen heb ik nog het volgende nodig: \${missing.join(', ')}\`
        : null
    };
  }
}
\`\`\`

## Opdracht

Bouw een complete NLU systeem voor een e-commerce customer service bot:

1. **Intent training**:
   - Definieer 15+ intents met hiërarchie
   - Genereer 50+ training examples per intent
   - Implementeer data augmentation

2. **Entity extraction**:
   - Implementeer extractors voor: order IDs, emails, producten, datums, bedragen
   - Test met real-world voorbeelden
   - Handle edge cases

3. **Context integration**:
   - Bouw conversation memory
   - Implementeer pronoun resolution
   - Test multi-turn conversations

4. **Quality assurance**:
   - Implementeer confidence thresholds
   - Build feedback loop
   - Monitor performance metrics

Deliverables:
- Complete code implementatie
- Training dataset (1000+ examples)
- Test rapport met accuracy metrics
- Documentatie van design keuzes

Test scenarios om te implementeren:
- "Ik wil die bestelling van gisteren annuleren"
- "Hoeveel kost verzending naar België?"
- "Mijn pakket is beschadigd, wat nu?"
- Multi-turn dialogen

Succes met het bouwen van een intelligent NLU systeem!
`
};