import { Lesson } from '@/lib/data/courses'

export const lesson1_3: Lesson = {
  id: 'lesson-1-3',
  title: 'User intent mapping: Wat wil je klant écht?',
  duration: '35 min',
  content: `# User intent mapping: Wat wil je klant écht?

## De kunst van begrijpen

"Mijn internet doet het niet" - Een simpele zin, maar wat bedoelt de klant precies? Wil hij:
- Een storing melden?
- Hulp bij troubleshooting?
- Compensatie voor uitval?
- Een technicus laten komen?
- Zijn contract opzeggen uit frustratie?

User intent mapping is de foundation van elke succesvolle AI customer service bot. Het gaat om het vertalen van menselijke taal naar acties die waarde leveren.

## Wat zijn user intents?

### Definitie
Een **intent** is het onderliggende doel van een gebruiker wanneer hij iets zegt of typt. Het is niet WAT ze zeggen, maar WAT ze willen bereiken.

### Anatomie van een intent

\`\`\`
User input: "Wanneer krijg ik mijn geld terug?"
├── Intent: request_refund_status
├── Entities: 
│   └── refund_item: implicit (niet gespecificeerd)
├── Sentiment: impatient/concerned
└── Context needed: order_details, refund_policy
\`\`\`

## Types of intents

### 1. Informational intents
Gebruiker zoekt informatie:
- "Wat zijn jullie openingstijden?"
- "Hoeveel kost verzending?"
- "Welke maten hebben jullie?"

### 2. Transactional intents
Gebruiker wil een actie uitvoeren:
- "Ik wil mijn bestelling annuleren"
- "Pas mijn adres aan"
- "Boek een afspraak"

### 3. Navigational intents
Gebruiker zoekt een specifieke locatie/functie:
- "Waar vind ik mijn facturen?"
- "Hoe kom ik bij mijn account?"
- "Toon me de retourpagina"

### 4. Troubleshooting intents
Gebruiker heeft een probleem:
- "Het werkt niet"
- "Ik krijg een foutmelding"
- "Mijn wachtwoord is geblokkeerd"

### 5. Emotional intents
Gebruiker uit emotie/feedback:
- "Dit is belachelijk!"
- "Jullie service is geweldig"
- "Ik ben teleurgesteld"

## Het intent discovery proces

### Stap 1: Data verzameling
**Bronnen voor intent discovery:**
- Chat logs analyse (historische data)
- Customer service call transcripts
- Email/ticket categorieën
- FAQ pagina analytics
- Social media mentions
- App store reviews

### Stap 2: Clustering en categorisatie

**Van ruwe data naar intents:**
\`\`\`
Ruwe user inputs:
- "pakket niet ontvangen"
- "waar blijft mijn bestelling"
- "nog steeds geen levering"
- "track and trace werkt niet"
- "wanneer komt mijn order"

↓ Clustering ↓

Intent: check_order_status
Variaties: 15+ verschillende formuleringen
Frequentie: 34% van alle queries
\`\`\`

### Stap 3: Intent hierarchie bouwen

**Parent-child structuur:**
\`\`\`
order_management/
├── check_order_status/
│   ├── track_shipment
│   ├── delivery_timeframe
│   └── order_confirmation
├── modify_order/
│   ├── cancel_order
│   ├── change_address
│   └── update_items
└── order_issues/
    ├── missing_items
    ├── wrong_product
    └── damaged_goods
\`\`\`

## Training phrases: De variatie vangen

### Het belang van diversiteit

Voor elk intent verzamel je training phrases die de natuurlijke variatie in taal vangen:

**Intent: cancel_subscription**
\`\`\`
Training phrases:
- "Ik wil mijn abonnement opzeggen"
- "Stop mijn subscription"
- "Hoe kan ik cancellen?"
- "Zeg mijn lidmaatschap op"
- "Ik wil niet meer lid zijn"
- "Beëindig mijn account"
- "Unsubscribe me"
- "Geen interesse meer"
- "Te duur, wil stoppen"
- "Opzeggen per direct"
\`\`\`

### Entiteiten extractie

Identificeer belangrijke variabelen binnen intents:

\`\`\`
"Ik wil mijn blauwe Nike sneakers maat 42 retourneren"

Intent: return_product
Entities:
- product_color: blauw
- product_brand: Nike  
- product_type: sneakers
- product_size: 42
\`\`\`

## Intent prioritization matrix

### Impact vs. Frequentie

Prioriteer welke intents je eerst implementeert:

\`\`\`
High Frequency + High Impact = MUST HAVE
├── check_order_status (34%)
├── return_request (18%)
└── product_availability (12%)

Low Frequency + High Impact = IMPORTANT
├── payment_failed (3%)
├── account_hacked (1%)
└── urgent_complaint (2%)

High Frequency + Low Impact = AUTOMATE
├── business_hours (8%)
├── shipping_costs (6%)
└── store_locations (4%)

Low Frequency + Low Impact = DEFER
├── partnership_request (0.5%)
├── press_inquiry (0.3%)
└── job_application (0.8%)
\`\`\`

## Advanced intent detection technieken

### 1. Context-aware intents

Dezelfde vraag, verschillende context = verschillende intent:

\`\`\`
"Kan dit nog?"

Context A: Na product view → Intent: check_availability
Context B: Na delivery date → Intent: reschedule_delivery  
Context C: Na warranty info → Intent: warranty_validity
\`\`\`

### 2. Multi-intent handling

Gebruikers combineren vaak meerdere intents:

\`\`\`
"Waar blijft mijn bestelling en kan ik die nog annuleren?"

Detected intents:
1. check_order_status (primary)
2. cancel_order (secondary)

Response strategie:
- Eerst status tonen
- Dan annulatie opties bieden
\`\`\`

### 3. Implicit intent detection

Wat gebruikers NIET zeggen is vaak belangrijker:

\`\`\`
User: "Jullie website is echt slecht"
Explicit: complaint_website
Implicit: difficulty_completing_task

Follow-up: "Wat probeerde je te doen?"
\`\`\`

## Intent confidence en fallbacks

### Confidence thresholds

\`\`\`javascript
if (intent.confidence >= 0.8) {
  // Direct uitvoeren
  executeIntent(intent)
} else if (intent.confidence >= 0.5) {
  // Bevestiging vragen
  confirmIntent(intent)
} else {
  // Fallback strategie
  clarifyIntent()
}
\`\`\`

### Smart fallback strategies

**Level 1: Disambiguation**
"Ik zie dat je hulp nodig hebt met je bestelling. Wil je:
- De status checken?
- Iets wijzigen?
- Een probleem melden?"

**Level 2: Rephrase request**
"Ik weet niet zeker of ik je goed begrijp. Kun je het anders omschrijven?"

**Level 3: Human handoff**
"Ik verbind je door met een specialist die je beter kan helpen."

## Intent analytics en optimalisatie

### Key metrics to track:

1. **Intent coverage**: % van queries succesvol gematched
2. **Confidence distribution**: Spreiding van confidence scores
3. **False positive rate**: Incorrect gematchte intents
4. **Disambiguation rate**: Hoe vaak clarification nodig is
5. **Intent evolution**: Nieuwe intents over tijd

### Continuous improvement cycle:

\`\`\`
Analyze logs → Identify gaps → Add training phrases → 
Test changes → Deploy updates → Monitor impact → Repeat
\`\`\`

## Praktische implementatie

### Intent design document template:

\`\`\`yaml
intent_name: request_refund
description: "User wants to get money back for a purchase"
priority: HIGH
frequency: 15% of queries

training_phrases:
  - "geld terug"
  - "refund aanvragen"
  - "kan ik mijn geld terugkrijgen"
  # ... minimaal 20 variaties

entities:
  - order_number (optional)
  - reason (required)
  - amount (extracted)

required_context:
  - user_authenticated
  - purchase_history_available

response_strategy:
  - validate_eligibility
  - explain_process
  - initiate_refund
  - provide_timeline

success_criteria:
  - refund_initiated: true
  - user_satisfaction: >= 4/5
\`\`\`

## De psychologie achter intents

### Waarom mensen niet zeggen wat ze bedoelen:

1. **Assumptie van kennis**: "Dit moet toch te doen zijn?"
2. **Emotionele staat**: Boosheid maskeert echte behoefte
3. **Culturele verschillen**: Directheid varieert
4. **Technische onwetendheid**: Weten niet hoe het te vragen

### Design voor menselijke natuur:

- Anticipeer op indirecte communicatie
- Bouw empathie in je responses
- Gebruik progressive disclosure
- Bied altijd alternatieven

## Samenvatting

Effectieve intent mapping vereist:
- Grondige analyse van echte gebruikersdata
- Begrip van context en impliciete behoeften
- Flexibele handling van multi-intent scenarios
- Continue optimalisatie op basis van analytics
- Balans tussen automatisering en menselijke fallback

Goede intent mapping is het verschil tussen een bot die frustreert en één die werkelijk helpt. Het is de foundation waarop alle andere conversatie elementen bouwen.

In de volgende les duiken we in tone of voice en personality design - hoe geef je je bot een consistent, merkwaardig karakter?`,
  codeExamples: [
    {
      id: 'example-1',
      title: 'Intent configuratie in Voiceflow met entities',
      language: 'yaml',
      code: `# Intent configuratie voor order management
intents:
  check_order_status:
    description: "User wants to know where their order is"
    training_phrases:
      - "waar is mijn bestelling"
      - "track mijn pakket"
      - "wanneer komt mijn order"
      - "bestelstatus checken"
      - "waar blijft pakket {order_number}"
      - "track {order_number}"
      - "status van order {order_number}"
    
    entities:
      order_number:
        type: "@sys.number"
        required: false
        prompts:
          - "Wat is je bestelnummer? Je vindt dit in je bevestigingsmail."
    
    fulfillment:
      webhook: "https://api.shop.nl/orders/status"
      parameters:
        orderNumber: "$order_number"
        userId: "$session.userId"
    
    responses:
      success: 
        - text: "Je bestelling {order_number} is onderweg! 🚚"
        - card:
            title: "Status: {status}"
            subtitle: "Verwachte levering: {delivery_date}"
            buttons:
              - title: "Track pakket"
                url: "{tracking_url}"
      
      not_found:
        - text: "Ik kan geen bestelling vinden met nummer {order_number}."
        - text: "Zullen we het op een andere manier proberen?"
        - suggestions:
            - "Zoek op email"
            - "Recente bestellingen"
            - "Contact support"

  cancel_order:
    description: "User wants to cancel their order"
    training_phrases:
      - "annuleer mijn bestelling"
      - "order cancellen"
      - "bestelling annuleren"
      - "stop de verzending"
      - "ik wil niet meer"
      - "cancel order {order_number}"
    
    entities:
      order_number:
        type: "@sys.number"
        required: true
      
      reason:
        type: "@custom.cancel_reason"
        required: false
        values:
          - "te laat"
          - "niet meer nodig"
          - "verkeerd product"
          - "te duur"
          - "andere reden"
    
    conditions:
      - expression: "order.status != 'shipped'"
        response: "confirm_cancellation"
      - expression: "order.status == 'shipped'"
        response: "suggest_return"
    
    responses:
      confirm_cancellation:
        - text: "Weet je zeker dat je bestelling {order_number} wilt annuleren?"
        - quick_replies:
            - "Ja, annuleer"
            - "Nee, behouden"
      
      suggest_return:
        - text: "Je bestelling is al verzonden. Je kunt het pakket retourneren zodra je het ontvangt."
        - text: "Zal ik alvast een retourlabel voor je klaarmaken?"`
    },
    {
      id: 'example-2',
      title: 'Multi-intent detection en confidence handling',
      language: 'javascript',
      code: `// Botpress intent detection met confidence handling
const intentDetection = {
  // Multi-intent detection configuratie
  multiIntentConfig: {
    enabled: true,
    maxIntents: 3,
    minConfidence: 0.3,
    
    // Intent combinaties die vaak voorkomen
    commonCombinations: [
      ['check_order_status', 'cancel_order'],
      ['product_info', 'check_availability'],
      ['return_request', 'refund_status']
    ]
  },
  
  // Process user input voor intent detection
  async processUserInput(input, context) {
    const detectedIntents = await nlu.detectIntents(input, {
      includeAllIntents: true,
      contextualHints: context.previousIntents,
      userProfile: context.userProfile
    });
    
    // Sorteer op confidence
    const rankedIntents = detectedIntents
      .filter(i => i.confidence >= this.multiIntentConfig.minConfidence)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, this.multiIntentConfig.maxIntents);
    
    return this.handleIntentConfidence(rankedIntents, input, context);
  },
  
  // Confidence-based response strategy
  handleIntentConfidence(intents, originalInput, context) {
    const primaryIntent = intents[0];
    
    if (!primaryIntent) {
      return this.fallbackStrategy('no_intent', originalInput);
    }
    
    // High confidence: Direct execution
    if (primaryIntent.confidence >= 0.85) {
      return {
        strategy: 'execute',
        intent: primaryIntent,
        secondaryIntents: intents.slice(1)
      };
    }
    
    // Medium confidence: Confirm with user
    if (primaryIntent.confidence >= 0.6) {
      return {
        strategy: 'confirm',
        intent: primaryIntent,
        alternativeIntents: intents.slice(1, 3),
        message: this.generateConfirmationMessage(primaryIntent, intents[1])
      };
    }
    
    // Low confidence: Disambiguation needed
    return {
      strategy: 'disambiguate',
      possibleIntents: intents,
      message: this.generateDisambiguationMessage(intents)
    };
  },
  
  // Smart confirmation messages
  generateConfirmationMessage(primary, alternative) {
    const confirmations = {
      'check_order_status': "Je wilt je bestelstatus checken, toch?",
      'cancel_order': "Wil je je bestelling annuleren?",
      'return_request': "Je wilt iets retourneren, klopt dat?"
    };
    
    let message = confirmations[primary.name] || "Bedoel je: " + primary.displayName + "?";
    
    if (alternative && alternative.confidence > 0.5) {
      message += " Of wilde je " + alternative.displayName + "?";
    }
    
    return message;
  },
  
  // Disambiguation voor unclear intents
  generateDisambiguationMessage(intents) {
    const topIntents = intents.slice(0, 3);
    
    return {
      text: "Ik wil je graag helpen. Wat wil je precies doen?",
      quick_replies: topIntents.map(intent => ({
        title: this.getIntentFriendlyName(intent.name),
        payload: intent.name
      })).concat([{
        title: "Iets anders",
        payload: "other_intent"
      }])
    };
  },
  
  // Fallback strategies based on context
  fallbackStrategy(reason, input) {
    const strategies = {
      'no_intent': {
        attempts: [
          {
            message: "Sorry, ik begrijp niet helemaal wat je bedoelt. Kun je het anders formuleren?",
            action: "rephrase_request"
          },
          {
            message: "Ik kan je het beste helpen met:",
            action: "show_capabilities",
            capabilities: ["Bestellingen tracken", "Retourneren", "Product informatie", "Account hulp"]
          },
          {
            message: "Ik verbind je door met een medewerker die je verder kan helpen.",
            action: "human_handoff"
          }
        ]
      },
      'ambiguous_intent': {
        message: "Je vraag kan verschillende dingen betekenen. Kies wat je wilt doen:",
        action: "show_options"
      }
    };
    
    return strategies[reason] || strategies['no_intent'];
  },
  
  // Intent analytics tracking
  analytics: {
    trackIntentDetection(input, detectedIntents, finalIntent, strategy) {
      return {
        timestamp: new Date().toISOString(),
        input: input,
        detected_intents: detectedIntents.map(i => ({
          name: i.name,
          confidence: i.confidence
        })),
        selected_intent: finalIntent,
        strategy_used: strategy,
        session_id: context.sessionId,
        user_id: context.userId
      };
    }
  }
};`
    }
  ],
  assignments: [
    {
      id: 'assignment-1',
      title: 'Bouw een intent library voor een specifieke business',
      type: 'project',
      difficulty: 'medium',
      description: `Creëer een complete intent library voor een gekozen business case met alle benodigde componenten.

**Kies één business case:**
1. Online supermarkt (zoals Picnic/AH)
2. Streaming service (zoals Netflix/Spotify)
3. Reisorganisatie (zoals Booking.com/TUI)
4. Fitness app/gym (zoals Basic-Fit)

**Deliverables:**

1. **Intent Hierarchy Document** (Excel/Sheets)
   - Minimaal 20 unieke intents
   - Gegroepeerd in logische categorieën
   - Priority scoring (High/Medium/Low)
   - Geschatte frequentie per intent

2. **Training Phrases Collection**
   - 15-20 phrases per intent
   - Nederlandse taalvariaties
   - Inclusief typos/spreektaal
   - Entity annotations

3. **Intent Flow Diagram**
   - Visualisatie van intent relations
   - Multi-intent scenarios
   - Fallback paths
   - Context dependencies

4. **Test Scenarios**
   - 10 realistische gesprekken
   - Edge cases coverage
   - Confidence threshold testing
   - Multi-intent examples`,
      hints: [
        'Analyseer eerst echte customer service vragen uit reviews/social media',
        'Groepeer vergelijkbare intents maar houd ze specifiek genoeg',
        'Denk aan seizoensgebonden intents (bijv. vakantie, feestdagen)',
        'Vergeet de "angry customer" intents niet - deze zijn cruciaal voor escalatie'
      ]
    }
  ],
  resources: [
    {
      title: 'Natural Language Understanding Guide - Rasa',
      url: 'https://rasa.com/docs/rasa/nlu-training-data/',
      type: 'documentation'
    },
    {
      title: 'Intent Design Best Practices - Dialogflow',
      url: 'https://cloud.google.com/dialogflow/cx/docs/concept/intent',
      type: 'guide'
    },
    {
      title: 'Understanding User Intent in Conversational AI',
      url: 'https://www.youtube.com/watch?v=intent-mapping-workshop',
      type: 'video'
    },
    {
      title: 'The Intent Taxonomy Playbook',
      url: 'https://voiceflow.com/blog/intent-taxonomy-conversational-design',
      type: 'article'
    }
  ]
}