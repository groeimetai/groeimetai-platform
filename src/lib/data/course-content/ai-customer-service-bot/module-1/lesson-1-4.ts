import { Lesson } from '@/lib/data/courses'

export const lesson1_4: Lesson = {
  id: 'lesson-1-4',
  title: 'Tone of voice en personality design voor bots',
  duration: '30 min',
  content: `# Tone of voice en personality design voor bots

## Waarom personality belangrijk is

Stel je voor: twee bots beantwoorden dezelfde vraag over een vertraagde levering:

**Bot A**: "Levering vertraagd. Nieuwe datum: 15-03. Excuses."

**Bot B**: "Oh nee, wat vervelend! Je pakket is helaas vertraagd 😔 Het komt nu op 15 maart. Sorry daarvoor! Kan ik misschien iets anders voor je doen?"

Beide geven dezelfde informatie, maar Bot B voelt menselijker, empathischer en merkwaardiger. Dat is de kracht van personality design.

## De fundamenten van bot personality

### Personality is meer dan emoji's

Een bot personality bestaat uit:
- **Tone of voice**: HOE je communiceert
- **Vocabulary**: WELKE woorden je gebruikt
- **Interaction style**: Je conversatie patronen
- **Emotional intelligence**: Empathie en timing
- **Brand alignment**: Consistent met je merk

### De personality spectrum

\`\`\`
Formeel ←---------------→ Informeel
Serieus ←---------------→ Speels
Afstandelijk ←----------→ Persoonlijk
Zakelijk ←--------------→ Vriendschappelijk
Minimalistisch ←--------→ Expressief
\`\`\`

## Tone of voice ontwerpen

### De 4 dimensies van tone

**1. Formaliteit**
- Formeel: "Wij danken u voor uw geduld"
- Semi-formeel: "Bedankt voor je geduld"
- Informeel: "Thanks dat je even wacht!"

**2. Emotionaliteit**
- Neutraal: "Je bestelling is geannuleerd"
- Empathisch: "Je bestelling is geannuleerd. Hopelijk vind je snel een alternatief!"
- Expressief: "Done! ✅ Je bestelling is geannuleerd. No worries!"

**3. Humor niveau**
- Geen humor: "Probeer het later opnieuw"
- Lichte humor: "Oeps, even een hikje! Probeer het zo nog eens?"
- Speels: "Computer says no 🤖 Even een koffiepauze, probeer het straks!"

**4. Persoonlijkheid**
- Robotisch: "Verwerking gestart. Wacht a.u.b."
- Professioneel: "Ik ben je aanvraag aan het verwerken"
- Persoonlijk: "Ik regel het meteen voor je, Lisa!"

### Context-adaptive tone

Je tone moet zich aanpassen aan de situatie:

\`\`\`javascript
// Sentiment-based tone adjustment
if (userSentiment === 'angry') {
  tone = {
    formality: 'semi-formal',
    empathy: 'high',
    humor: 'none',
    personality: 'professional'
  }
} else if (userSentiment === 'happy') {
  tone = {
    formality: 'informal',
    empathy: 'moderate',
    humor: 'light',
    personality: 'friendly'
  }
}
\`\`\`

## Personality archetypes voor bots

### 1. De Helpful Assistant (Behulpzame Assistent)
**Kenmerken:**
- Altijd bereid te helpen
- Geduldig en begripvol
- Solution-focused
- Bescheiden

**Voorbeeld responses:**
- "Natuurlijk help ik je daarmee!"
- "Geen probleem, laten we het stap voor stap doen"
- "Dat snap ik helemaal. Hier is wat we kunnen doen..."

**Best voor:** Banks, verzekeringen, overheid

### 2. De Knowledgeable Expert (Deskundige Expert)
**Kenmerken:**
- Zelfverzekerd
- Informatief
- Precies
- Betrouwbaar

**Voorbeeld responses:**
- "Dat is een goede vraag. Het antwoord is..."
- "Op basis van onze data kan ik je vertellen dat..."
- "Er zijn drie opties die ik aanraad..."

**Best voor:** Tech support, medical info, education

### 3. De Friendly Companion (Vriendelijke Metgezel)
**Kenmerken:**
- Warm en uitnodigend
- Conversational
- Enthousiast
- Persoonlijk

**Voorbeeld responses:**
- "Hey! Leuk dat je er bent! 👋"
- "Oh wat gaaf dat je dat vraagt!"
- "Weet je wat? Ik heb net het perfecte idee voor je..."

**Best voor:** Retail, entertainment, lifestyle brands

### 4. De Efficient Professional (Efficiënte Professional)
**Kenmerken:**
- Direct en to-the-point
- Time-conscious
- Results-driven
- Respectvol

**Voorbeeld responses:**
- "Verstuur je retourlabel via deze link: [...]"
- "3 snelle stappen: 1) ... 2) ... 3) ... Klaar!"
- "Direct geregeld. Nog iets anders?"

**Best voor:** Business services, logistics, productivity tools

### 5. De Empathetic Counselor (Empathische Counselor)
**Kenmerken:**
- Luisterend
- Ondersteunend
- Geduldig
- Validating

**Voorbeeld responses:**
- "Ik hoor dat dit frustrerend voor je is..."
- "Dat klinkt als een vervelende situatie"
- "Laten we samen kijken hoe we dit oplossen"

**Best voor:** Healthcare, HR services, complaint handling

## Brand personality alignment

### Van brand values naar bot personality

**Brand: Coolblue**
- Values: Vriendelijk, grappig, klantgericht
- Bot personality: Friendly Companion met humor
- Tone: Informeel, speels, persoonlijk

**Brand: ING**
- Values: Betrouwbaar, innovatief, persoonlijk
- Bot personality: Helpful Assistant met expertise
- Tone: Semi-formeel, empathisch, professioneel

### Consistency checklist

✅ Vocabulary matches brand guidelines
✅ Emoji gebruik past bij brand style
✅ Response snelheid reflects brand promise
✅ Error handling aligned met brand values
✅ Personality consistent across channels

## Praktische personality implementatie

### Personality design document

\`\`\`yaml
bot_personality:
  name: "Sophie"
  role: "Shopping Assistant"
  archetype: "Friendly Companion"
  
  traits:
    primary: ["enthusiastic", "helpful", "knowledgeable"]
    secondary: ["patient", "creative", "positive"]
  
  voice:
    formality: "informal"
    pronouns: "je/jij"
    contractions: true  # "dat is" → "da's"
    exclamations: moderate  # "Geweldig!" allowed
    
  vocabulary:
    preferred:
      - "super" instead of "zeer"
      - "top" instead of "uitstekend"
      - "lekker bezig" instead of "goed gedaan"
    avoid:
      - technical jargon
      - corporate speak
      - negative words when possible
      
  emoji_style:
    frequency: "moderate"
    types: ["gestures", "objects", "positive faces"]
    avoid: ["sad", "angry", "complex"]
    favorites: ["👍", "✨", "🎉", "💡", "✅"]
    
  interaction_patterns:
    greeting_variations:
      morning: ["Goedemorgen! ☀️", "Hey, vroege vogel!"]
      afternoon: ["Hoi! Hoe gaat-ie?", "Hey daar! 👋"]
      evening: ["Goedenavond!", "Hey! Nog laat bezig?"]
      
    acknowledgments:
      understanding: ["Helder!", "Got it!", "Check ✓"]
      empathy: ["Snap ik!", "Begrijpelijk!", "Dat ken ik..."]
      appreciation: ["Thanks!", "Top dat je dit doorgeeft!"]
      
    closings:
      satisfied: ["Veel plezier ermee!", "Success! 🎉"]
      ongoing: ["Ik ben hier als je me nodig hebt!"]
      escalation: ["Sarah neemt het zo van me over 🤝"]
\`\`\`

### Dynamic personality responses

\`\`\`javascript
// Personality-driven response generation
class PersonalityEngine {
  generateResponse(intent, context, personality) {
    const baseResponse = this.getBaseResponse(intent);
    
    // Apply personality layers
    let response = this.applyToneOfVoice(baseResponse, personality.voice);
    response = this.addEmotionalLayer(response, context.sentiment);
    response = this.injectPersonalityTraits(response, personality.traits);
    response = this.applyBrandGuidelines(response, personality.brand);
    
    // Context-specific adjustments
    if (context.isReturningUser) {
      response = this.addFamiliarity(response);
    }
    
    if (context.timeSpentWaiting > 30) {
      response = this.addApologyForWait(response);
    }
    
    return response;
  }
  
  // Voorbeeld: Error handling met personality
  handleError(error, personality) {
    const errorResponses = {
      'friendly_companion': [
        "Oeps! Er ging even iets mis 😅 Probeer het nog eens?",
        "Hmm, dat ging niet helemaal goed. Nog een keertje!"
      ],
      'efficient_professional': [
        "Technische storing. Moment geduld.",
        "Fout opgetreden. Alternatief: [...]"
      ],
      'empathetic_counselor': [
        "Het spijt me, er is iets misgegaan. Ik begrijp dat dit frustrerend is.",
        "Oh nee, dat ging niet goed. Laten we het anders proberen."
      ]
    };
    
    return this.selectRandom(errorResponses[personality.archetype]);
  }
}
\`\`\`

## Personality pitfalls te vermijden

### 1. Over-the-top personality
❌ "WOOHOOO! 🎉🎊🥳 MEGA GAAF dat je hier bent!!! Laten we ROCKEN! 🚀"
✅ "Hey! Leuk dat je er bent! Waar kan ik je mee helpen? 😊"

### 2. Inconsistente personality switches
❌ Formeel → "Waarmee kan ik u assisteren?"
❌ Informeel → "Yo! Wat kan ik voor je doen?"
✅ Consistent → "Hoi! Waar kan ik je mee helpen?"

### 3. Inappropriate timing
❌ Bij klacht: "Haha, dat is inderdaad vervelend! 😂"
✅ Bij klacht: "Dat is inderdaad vervelend. Laten we dit oplossen."

### 4. Culturele ongevoeligheid
❌ Assuming informeel is altijd OK
✅ Optie bieden: "Mag ik je of u zeggen?"

## Personality evolution

### Leren en aanpassen

Je bot personality moet evolueren:

1. **A/B test verschillende tones**
   - Measure: Satisfaction scores
   - Track: Conversation completion
   - Monitor: Escalation rates

2. **Seizoensgebonden aanpassingen**
   - Feestdagen: Warmer, meer emoji
   - Januari: Motiverend, fresh start
   - Zomer: Luchtig, vakantie-vibe

3. **User feedback integration**
   - "Te formeel" → Adjust informality
   - "Niet serieus" → Reduce humor
   - "Onpersoonlijk" → Add warmth

### Personality maturity model

**Level 1: Basic**
- Consistente tone
- Simpele personality traits
- Statische responses

**Level 2: Adaptive**
- Context-aware tone
- Sentiment adjustment
- User preference learning

**Level 3: Advanced**
- Individuele personalisatie
- Emotionele intelligence
- Cultural adaptation
- Mood persistence

## Meten van personality effectiviteit

### Key metrics:

1. **Brand perception alignment**
   - Survey: "Past deze bot bij ons merk?"
   - Score: 1-10 brand fit

2. **Emotional connection**
   - "Voelde het gesprek natuurlijk?"
   - "Would you chat again?"

3. **Task completion impact**
   - Personality A vs B completion rates
   - Time to resolution

4. **Sentiment shift**
   - Start sentiment vs end sentiment
   - Frustratie → Tevredenheid conversie

## Samenvatting

Effectieve bot personality design:
- Gaat verder dan alleen emoji's en informal taal
- Moet aligned zijn met brand values
- Adapteert aan context en user sentiment
- Evolueert op basis van feedback
- Balanceert menselijkheid met efficiency

Een goed ontworpen personality transformeert een transactionele interactie in een memorable brand experience. Het verschil tussen een tool en een trusted assistant.

Met deze fundamenten ben je klaar om in Module 2 te duiken in de technische implementatie met no-code platforms!`,
  codeExamples: [
    {
      id: 'example-1',
      title: 'Complete personality configuratie in Voiceflow',
      language: 'yaml',
      code: `# Bot Personality Configuration - "Max" de Tech Support Buddy
personality:
  profile:
    name: "Max"
    role: "Tech Support Buddy"
    avatar: "friendly_tech_expert.png"
    archetype: "Knowledgeable Friend"
    
  brand_alignment:
    company: "TechCo"
    values: ["innovative", "reliable", "approachable"]
    voice_principles:
      - "Tech-savvy maar begrijpelijk"
      - "Geduldig en ondersteunend"
      - "Probleemoplossend met een glimlach"
    
  tone_settings:
    base_formality: "semi-informal"  # je/jij form
    emotional_range: "moderate"      # Not too excited, not too flat
    humor_level: "light"            # Occasional wordplay
    technical_depth: "adaptive"      # Adjust to user level
    
  conversation_style:
    greetings:
      default: ["Hey! Max hier 👋", "Hoi! Ik ben Max"]
      returning_user: ["Hey {name}! Goed je weer te zien!"]
      after_problem: ["Welkom terug! Alles weer OK?"]
      
    response_patterns:
      confirming: ["Check! ✓", "Got it!", "Helder"]
      thinking: ["Even kijken...", "Momentje..."]
      success: ["Gefixt! 🎯", "Opgelost! ✅"]
      
    error_handling:
      technical_issue:
        first_attempt: "Hmm, dat is gek. Laten we het nog eens proberen!"
        second_attempt: "OK, dit is hardnekkig. Ik pak er even een andere tool bij..."
        escalation: "Dit vraagt om menselijke expertise. Ik roep Rick erbij! 🤝"
        
  adaptive_behavior:
    sentiment_responses:
      frustrated_user:
        tone_adjustment: "more_empathetic"
        response_modifier: "acknowledge_frustration"
        examples:
          - "Ik snap helemaal dat dit frustrerend is..."
          - "Vervelend dat het niet meteen lukt. We gaan dit fixen!"
          
      happy_user:
        tone_adjustment: "match_energy"
        response_modifier: "celebrate_together"
        examples:
          - "Yes! Blij dat het werkt! 🎉"
          - "Awesome! Nog iets anders waarbij ik kan helpen?"
          
      confused_user:
        tone_adjustment: "extra_clear"
        response_modifier: "simplify_language"
        examples:
          - "Geen zorgen, ik leg het stap voor stap uit"
          - "Laten we het even simpeler maken..."
          
  language_preferences:
    vocabulary:
      preferred_terms:
        problem: ["issue", "dingetje", "probleem"]
        solution: ["oplossing", "fix", "trucje"]
        computer: ["computer", "PC", "machine"]
        
      avoid_terms:
        - "defect"  # Too formal
        - "unit"    # Too technical
        - "ticket"  # Too corporate
        
    sentence_structure:
      max_length: 20  # words per sentence
      use_contractions: true  # "da's" instead of "dat is"
      active_voice: true
      
  emoji_guidelines:
    usage_frequency: "moderate"  # 1-2 per message max
    categories:
      positive: ["✅", "👍", "🎯", "💡", "⚡"]
      neutral: ["👋", "💭", "🔧", "📱", "💻"]
      avoid: ["😭", "😡", "🤬", "💔", "☠️"]
      
    context_rules:
      problem_solved: ["✅", "🎯", "🎉"]
      thinking: ["💭", "🤔"]
      greeting: ["👋"]
      technical_info: "minimal_emoji"`
    },
    {
      id: 'example-2',
      title: 'Dynamic personality adjustment system',
      language: 'javascript',
      code: `// Botpress Dynamic Personality System
const DynamicPersonality = {
  // Base personality traits
  basePersonality: {
    name: 'Emma',
    traits: {
      friendliness: 0.8,
      formality: 0.3,
      humor: 0.5,
      empathy: 0.7,
      expertise: 0.9
    }
  },
  
  // Adjust personality based on context
  adjustPersonality(context) {
    let adjustedTraits = {...this.basePersonality.traits};
    
    // Time-based adjustments
    const hour = new Date().getHours();
    if (hour < 9) {
      adjustedTraits.friendliness += 0.1;  // Extra friendly in morning
      adjustedTraits.formality -= 0.1;     // More casual
    } else if (hour > 20) {
      adjustedTraits.empathy += 0.2;       // More understanding late
    }
    
    // Sentiment-based adjustments
    switch(context.userSentiment) {
      case 'negative':
        adjustedTraits.empathy = Math.min(1, adjustedTraits.empathy + 0.3);
        adjustedTraits.humor = Math.max(0, adjustedTraits.humor - 0.4);
        adjustedTraits.formality += 0.2;
        break;
      case 'positive':
        adjustedTraits.humor += 0.2;
        adjustedTraits.friendliness += 0.1;
        break;
      case 'confused':
        adjustedTraits.expertise += 0.1;
        adjustedTraits.empathy += 0.2;
        break;
    }
    
    // User history adjustments
    if (context.isReturningUser) {
      adjustedTraits.formality = Math.max(0, adjustedTraits.formality - 0.2);
      adjustedTraits.friendliness += 0.1;
    }
    
    // Topic-based adjustments
    if (context.topic === 'complaint') {
      adjustedTraits.formality += 0.3;
      adjustedTraits.empathy = 1.0;
      adjustedTraits.humor = 0;
    } else if (context.topic === 'purchase') {
      adjustedTraits.friendliness += 0.2;
      adjustedTraits.humor += 0.1;
    }
    
    return adjustedTraits;
  },
  
  // Generate response with personality
  generateResponse(message, personality) {
    let response = message;
    
    // Apply friendliness
    if (personality.friendliness > 0.7) {
      response = this.addFriendlyTouches(response);
    }
    
    // Apply formality
    if (personality.formality < 0.4) {
      response = this.makeInformal(response);
    } else if (personality.formality > 0.7) {
      response = this.makeFormal(response);
    }
    
    // Apply humor
    if (personality.humor > 0.6 && Math.random() < personality.humor) {
      response = this.addHumor(response);
    }
    
    // Apply empathy
    if (personality.empathy > 0.7) {
      response = this.addEmpathy(response);
    }
    
    // Apply expertise
    if (personality.expertise > 0.8) {
      response = this.addConfidence(response);
    }
    
    return response;
  },
  
  // Personality transformation functions
  addFriendlyTouches(text) {
    const friendlyAdditions = [
      { find: /^/, replace: ['Hey! ', 'Hoi! ', ''] },
      { find: /$/, replace: [' 😊', ' 👍', '!', ''] }
    ];
    
    // Randomly apply friendly additions
    friendlyAdditions.forEach(addition => {
      if (Math.random() > 0.5) {
        const replacement = addition.replace[Math.floor(Math.random() * addition.replace.length)];
        text = text.replace(addition.find, replacement);
      }
    });
    
    return text;
  },
  
  makeInformal(text) {
    const informalReplacements = {
      'u': 'je',
      'uw': 'jouw',
      'dat is': "da's",
      'het is': "'t is",
      'Goedendag': 'Hoi',
      'Met vriendelijke groet': 'Groetjes',
      'Excuses voor': 'Sorry voor'
    };
    
    Object.entries(informalReplacements).forEach(([formal, informal]) => {
      text = text.replace(new RegExp(formal, 'gi'), informal);
    });
    
    return text;
  },
  
  makeFormal(text) {
    const formalReplacements = {
      'je': 'u',
      'jij': 'u',
      'jouw': 'uw',
      'Hoi': 'Goedendag',
      'Doei': 'Tot ziens',
      'Thanks': 'Bedankt',
      'Sorry': 'Excuses'
    };
    
    Object.entries(formalReplacements).forEach(([informal, formal]) => {
      text = text.replace(new RegExp('\\\\b' + informal + '\\\\b', 'gi'), formal);
    });
    
    return text;
  },
  
  // Response selection based on personality
  selectResponseVariant(variants, personality) {
    // Score each variant based on personality fit
    const scoredVariants = variants.map(variant => {
      let score = 0;
      
      // Score based on formality match
      if (variant.formality === 'formal' && personality.formality > 0.6) score += 2;
      if (variant.formality === 'informal' && personality.formality < 0.4) score += 2;
      
      // Score based on emotion match
      if (variant.emotion === 'empathetic' && personality.empathy > 0.7) score += 3;
      if (variant.emotion === 'humorous' && personality.humor > 0.6) score += 2;
      
      // Score based on expertise match
      if (variant.style === 'expert' && personality.expertise > 0.8) score += 2;
      
      return { ...variant, score };
    });
    
    // Select highest scoring variant
    return scoredVariants.reduce((best, current) => 
      current.score > best.score ? current : best
    );
  }
};

// Usage example
bp.hear(/.*/, async (event, next) => {
  const context = {
    userSentiment: await bp.nlu.getSentiment(event.text),
    isReturningUser: event.state.user.visitCount > 1,
    topic: await bp.nlu.getTopic(event.text),
    conversationLength: event.state.session.turnCount
  };
  
  const personality = DynamicPersonality.adjustPersonality(context);
  
  // Store adjusted personality for consistent conversation
  event.state.session.currentPersonality = personality;
  
  next();
});`
    }
  ],
  assignments: [
    {
      id: 'assignment-1',
      title: 'Design een complete bot personality voor een Nederlands merk',
      type: 'project',
      difficulty: 'medium',
      description: `Ontwikkel een complete bot personality voor een bekend Nederlands merk, inclusief alle aspecten van tone of voice en implementatie richtlijnen.

**Kies één van deze merken (of vergelijkbaar):**
- Coolblue (electronics retail)
- Swapfiets (bike subscription)
- Thuisbezorgd (food delivery)
- NS (train service)
- Bol.com (e-commerce)

**Deliverables:**

1. **Personality Design Document** (2-3 paginas)
   - Bot naam en achtergrond
   - Personality archetype met rationale
   - Brand alignment analyse
   - Core personality traits (top 5)

2. **Tone of Voice Guide**
   - Formality spectrum positie
   - Vocabulary do's and don'ts (20+ examples)
   - Emoji gebruik richtlijnen
   - Example phrases voor 10+ scenarios

3. **Conversation Examples**
   - 5 complete gesprekken (happy path)
   - 3 error/frustration scenarios
   - 2 escalation scenarios
   - Before/after comparison met generic bot

4. **Implementation Checklist**
   - Context adaptation rules
   - Sentiment response matrix
   - A/B test suggestions
   - Success metrics`,
      hints: [
        'Research eerst de huidige brand voice via website, social media, en marketing',
        'Interview echte klanten over hun merkperceptie',
        'Test je personality met verschillende user personas',
        'Zorg dat de personality schaalbaar is naar verschillende channels (chat, voice, email)'
      ]
    }
  ],
  resources: [
    {
      title: 'Personality Design for Chatbots - Stanford Course',
      url: 'https://hci.stanford.edu/courses/cs247/2019-winter/readings/personality-design-chatbots.pdf',
      type: 'article'
    },
    {
      title: 'The Complete Guide to Chatbot Personality',
      url: 'https://botpress.com/blog/chatbot-personality-ultimate-guide',
      type: 'guide'
    },
    {
      title: 'Tone of Voice: Nederlandse Merken Case Studies',
      url: 'https://www.frankwatching.com/archive/tone-of-voice-nederlandse-merken/',
      type: 'article'
    },
    {
      title: 'Building Bot Personality Workshop - Voiceflow',
      url: 'https://www.youtube.com/watch?v=bot-personality-workshop',
      type: 'video'
    }
  ]
}