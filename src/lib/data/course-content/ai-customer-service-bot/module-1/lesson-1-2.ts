import { Lesson } from '@/lib/data/courses'

export const lesson1_2: Lesson = {
  id: 'lesson-1-2',
  title: 'Conversation design fundamentals: De kunst van dialoog',
  duration: '35 min',
  content: `# Conversation design fundamentals: De kunst van dialoog

## Wat is conversation design?

Conversation design is de discipline van het ontwerpen van natuurlijke, effectieve dialogen tussen mensen en AI. Het combineert psychologie, taalwetenschap, UX design en technologie om gesprekken te creëren die aanvoelen als praten met een behulpzame, begripvolle assistent.

### Het verschil tussen goed en slecht design

**Slecht conversation design:**
Bot: "Hallo. Kies optie: 1. Bestelling 2. Klacht 3. Anders"
User: "Mijn pakket is niet aangekomen"
Bot: "Ongeldige invoer. Kies 1, 2 of 3."

**Goed conversation design:**
Bot: "Hoi! Waarmee kan ik je helpen? 👋"
User: "Mijn pakket is niet aangekomen"
Bot: "Wat vervelend dat je pakket er nog niet is! Laten we dat even uitzoeken. Mag ik je ordernummer?"

## De bouwstenen van goede conversaties

### 1. Opening: De eerste indruk

De opening zet de toon voor het hele gesprek:

**Do's:**
- Vriendelijke begroeting
- Duidelijke value proposition
- Open vraagstelling
- Verwachtingen managen

**Don'ts:**
- Te formeel of robotisch
- Teveel opties direct
- Gesloten ja/nee start
- Onduidelijke mogelijkheden

### 2. Turn-taking: Het gesprekritme

Natuurlijke gesprekken hebben een ritme:
- **User turn**: Vraag of input
- **Bot turn**: Reactie en eventuele vervolgvraag
- **Pauzes**: Tijd om na te denken
- **Interruptions**: Omgaan met onderbrekingen

### 3. Context management: Het geheugen

Een goede conversatie onthoudt wat er gezegd is:

\`\`\`
User: "Ik zoek een blauwe jas"
Bot: "Wat voor soort blauwe jas zoek je?"
User: "Een winterjas"
Bot: "Perfect! Ik laat je onze blauwe winterjassen zien."
(Niet: "Welke kleur zoek je?")
\`\`\`

### 4. Error handling: Elegante herstel

Fouten zijn onvermijdelijk, maar herstel kan elegant:

**Progressieve hulp:**
1. Eerste poging: "Sorry, dat begreep ik niet helemaal. Kun je het anders verwoorden?"
2. Tweede poging: "Ik snap het nog niet. Bedoel je misschien [suggestie A] of [suggestie B]?"
3. Derde poging: "Laat me je doorverbinden met een collega die je beter kan helpen."

## Design patterns voor conversaties

### 1. The Guided Journey
Perfect voor complexe processen:
\`\`\`
Bot: "Ik help je graag een nieuwe verzekering te vinden! Dit duurt ongeveer 5 minuten."
Bot: "Laten we beginnen. Wat wil je verzekeren?"
User: "Mijn auto"
Bot: "Prima! Wat is het kenteken van je auto?"
[Stap voor stap begeleiden]
\`\`\`

### 2. The Quick Resolution
Voor veelvoorkomende vragen:
\`\`\`
Bot: "Hoi! De 3 meest gestelde vragen zijn:"
- 📦 Waar is mijn bestelling?
- 🔄 Hoe kan ik retourneren?
- 💳 Betaalmethoden wijzigen

Bot: "Of typ je eigen vraag!"
\`\`\`

### 3. The Empathetic Companion
Voor emotionele situaties:
\`\`\`
User: "Ik ben mijn pincode vergeten en sta bij de pinautomaat!"
Bot: "Wat een vervelende situatie! Ik help je direct."
Bot: "Voor je veiligheid blokkeer ik eerst je pas. Dat is binnen 10 seconden geregeld."
Bot: "✅ Je pas is geblokkeerd. Nu regel ik een nieuwe pas voor je."
\`\`\`

## De psychologie van conversatie

### Menselijke conversatie principes

**Grice's Maxims** - de basis van goede communicatie:
1. **Quantity**: Niet te veel, niet te weinig informatie
2. **Quality**: Eerlijk en accuraat
3. **Relation**: Relevant blijven
4. **Manner**: Helder en georganiseerd

### Cognitieve belasting verminderen

**Te veel keuzes vermijden:**
❌ "Je kunt kiezen uit: verzenden, retourneren, ruilen, klacht, product info, winkel zoeken, contact, account, betalen..."

✅ "Waar kan ik je mee helpen? Bijvoorbeeld met een bestelling of product vraag?"

### Personality consistency

Je bot personality moet consistent zijn:
- **Tone**: Formeel vs. informeel
- **Emoji gebruik**: Wel of niet? 
- **Humor**: Passend bij het merk
- **Taalgebruik**: Je/jij, u, jullie

## Praktische implementatie tips

### 1. Start met user research
- Analyseer bestaande chat logs
- Interview klantenservice medewerkers  
- Observeer echte klantgesprekken
- Test met verschillende user personas

### 2. Schrijf natuurlijke dialogen
**Van flowchart naar script:**
1. Maak eerst een flowchart
2. Schrijf de dialogen uit als filmscript
3. Lees hardop voor (echt!)
4. Verfijn tot het natuurlijk klinkt

### 3. Design voor verschillende modaliteiten
- **Text**: Kort en scanbaar
- **Voice**: Natuurlijke zinnen
- **Buttons**: Duidelijke labels
- **Rich media**: Ondersteunend, niet leidend

### 4. Test en itereer
- A/B test verschillende benaderingen
- Monitor drop-off punten
- Analyseer user feedback
- Update regelmatig

## Tools en methodes

### Conversation design tools:
- **Voiceflow**: Visuele flow builder
- **Botpress**: Open source platform
- **Figma/Miro**: Voor initial designs
- **Dialogflow**: Google's NLU engine

### Documentatie formaten:
1. **Sample dialogs**: Complete gesprekken
2. **Flow diagrams**: Logische structuur
3. **Intent mapping**: User inputs → Bot responses
4. **Error matrices**: Foutscenarios

## De 10 gouden regels

1. **Be brief**: Korte, heldere berichten
2. **Be relevant**: Altijd on-topic blijven
3. **Be helpful**: Focus op oplossingen
4. **Be consistent**: Zelfde stijl overal
5. **Be transparent**: Duidelijk over mogelijkheden
6. **Be forgiving**: Flexibel met input
7. **Be predictable**: Geen verrassingen
8. **Be accessible**: Voor iedereen bruikbaar
9. **Be contextual**: Onthoud het gesprek
10. **Be humble**: Erken beperkingen

## Samenvatting

Goed conversation design draait om:
- Natuurlijke, menselijke dialogen creëren
- Cognitieve belasting minimaliseren
- Context behouden door het gesprek
- Elegante error handling
- Consistente personality
- Continue testing en verbetering

In de volgende les gaan we dieper in op user intent mapping - hoe je écht begrijpt wat gebruikers willen en hoe je daar effectief op reageert.`,
  codeExamples: [
    {
      id: 'example-1',
      title: 'Conversatie flow met context management',
      language: 'yaml',
      code: `# E-commerce support bot conversation flow
conversation:
  welcome:
    triggers:
      - user_opens_chat
    response:
      type: text_with_buttons
      text: "Hoi! Ik ben Emma, je virtuele shopping assistent 🛍️ Waar kan ik je mee helpen?"
      buttons:
        - label: "Mijn bestelling tracken"
          intent: track_order
        - label: "Product zoeken"
          intent: product_search
        - label: "Retour aanmelden"
          intent: return_request
        - label: "Iets anders"
          intent: free_text_input

  track_order:
    context_required: []
    slots:
      - name: order_number
        type: text
        prompt: "Wat is je ordernummer? (Je vindt dit in je bestelbevestiging)"
        validation: "^[A-Z0-9]{8}$"
        error: "Hmm, dat lijkt geen geldig ordernummer. Het bestaat uit 8 tekens, bijvoorbeeld: AB123456"
    
    response:
      - condition: order_found
        text: "Top! Ik heb je bestelling gevonden 📦"
        followup: order_status_details
      - condition: order_not_found
        text: "Ik kan deze bestelling niet vinden. Laten we het anders proberen."
        followup: alternative_lookup

  order_status_details:
    context_required: [order_data]
    response:
      - text: "Je bestelling van {order_date} met {item_count} artikel(en):"
      - type: card
        title: "Status: {order_status}"
        elements:
          - "Verwachte levering: {delivery_date}"
          - "Track & Trace: {tracking_url}"
      - text: "Is er nog iets specifiek over deze bestelling?"
      
  error_recovery:
    max_attempts: 3
    strategies:
      attempt_1:
        text: "Sorry, dat snap ik niet helemaal. Kun je het misschien anders zeggen?"
      attempt_2:
        text: "Ik begrijp het nog steeds niet goed. Bedoel je een van deze opties?"
        quick_replies: [dynamic_suggestions]
      attempt_3:
        text: "Ik merk dat ik je niet goed kan helpen via chat. Zal ik je doorverbinden met een collega?"
        escalate: true`
    },
    {
      id: 'example-2',
      title: 'Personality en tone configuratie in Botpress',
      language: 'javascript',
      code: `// Conversation personality configuratie
const personalityConfig = {
  name: "Emma",
  role: "Shopping Assistent",
  
  personality: {
    traits: ["behulpzaam", "vriendelijk", "efficiënt", "empathisch"],
    formality: "informal", // formal, informal, adaptive
    humor: "light", // none, light, moderate
    emoji_usage: "moderate", // none, minimal, moderate, frequent
  },
  
  language: {
    personal_pronouns: "je/jij", // u, je/jij
    greeting_variations: [
      "Hoi! Ik ben Emma 👋",
      "Hey daar! Emma hier om je te helpen",
      "Hallo! Fijn dat je er bent"
    ],
    
    acknowledgments: {
      understanding: [
        "Helder!",
        "Got it!",
        "Duidelijk",
        "Ik snap het"
      ],
      empathy: [
        "Wat vervelend voor je",
        "Dat begrijp ik helemaal",
        "Ik snap dat dat frustrerend is",
        "Daar baal je natuurlijk van"
      ],
      appreciation: [
        "Bedankt voor je geduld",
        "Fijn dat je dit doorgeeft",
        "Thanks voor de info!"
      ]
    }
  },
  
  response_templates: {
    clarification: "Help me even - {question}?",
    waiting: "Een momentje, ik zoek het voor je op... ⏳",
    success: "Gelukt! {result} ✅",
    apology: "Sorry dat het even duurde. {explanation}",
    handoff: "Ik verbind je door met {agent_name} die je verder helpt"
  },
  
  // Dynamische tone aanpassing op sentiment
  adaptiveTone: {
    enabled: true,
    rules: [
      {
        userSentiment: "negative",
        adjustments: {
          emoji_usage: "minimal",
          empathy_level: "high",
          response_speed: "immediate"
        }
      },
      {
        userSentiment: "positive", 
        adjustments: {
          emoji_usage: "frequent",
          humor: "moderate",
          enthusiasm: "high"
        }
      }
    ]
  }
}`
    }
  ],
  assignments: [
    {
      id: 'assignment-1',
      title: 'Ontwerp een complete customer service conversatie',
      type: 'project',
      difficulty: 'medium',
      description: `Ontwerp een complete conversatieflow voor een specifiek customer service scenario.

**Scenario keuzes:**
1. Restaurant reserveringssysteem
2. Telecom provider support (internet storing)
3. Online fashion retailer (retour proces)
4. Bank/financiële diensten (card verloren)

**Requirements:**
- Minimaal 5 verschillende user intents
- Happy path + 2 error scenarios
- Context management tussen turns
- Progressive disclosure voor complexe info
- Personality definitie voor de bot

**Deliverables:**
1. Conversation flow diagram (gebruik Miro/Figma)
2. Sample dialogs (5 complete gesprekken)
3. Personality guide (1 A4)
4. Error handling matrix`,
      hints: [
        'Begin met het in kaart brengen van de meest voorkomende user journeys',
        'Test je dialogen door ze hardop voor te lezen met een collega',
        'Denk aan edge cases: wat als gebruiker halverwege van onderwerp wisselt?',
        'Houd rekening met verschillende user types (gehaast, gedetailleerd, boos, etc.)'
      ]
    }
  ],
  resources: [
    {
      title: 'Conversation Design Best Practices - Voiceflow',
      url: 'https://www.voiceflow.com/blog/conversation-design-best-practices',
      type: 'article'
    },
    {
      title: 'Writing for Conversation Design - Google',
      url: 'https://developers.google.com/assistant/conversation-design/write-dialogs',
      type: 'guide'
    },
    {
      title: 'The Elements of Conversation Design',
      url: 'https://uxdesign.cc/the-elements-of-conversation-design-4a6c3b5f98e1',
      type: 'article'
    },
    {
      title: 'Conversational UX Design Workshop',
      url: 'https://www.youtube.com/watch?v=wuDP_R8mOwQ',
      type: 'video'
    }
  ]
}