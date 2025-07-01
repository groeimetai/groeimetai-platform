import { Lesson } from '@/lib/data/courses'

export const lesson1_1: Lesson = {
  id: 'lesson-1-1',
  title: 'Introductie tot AI customer service: Van frustratie naar tevredenheid',
  duration: '40 min',
  content: `# Introductie tot AI customer service: Van frustratie naar tevredenheid

## De revolutie in klantenservice

Stel je voor: het is 22:00 uur en je hebt een probleem met je internetverbinding. Vroeger betekende dit wachten tot de volgende ochtend. Nu wordt je direct geholpen door een AI-assistent die je probleem begrijpt en oplost. Dit is de kracht van moderne AI customer service.

### Waarom AI in customer service?

**De uitdagingen van traditionele klantenservice:**
- Lange wachttijden (gemiddeld 11 minuten in Nederland)
- Beperkte openingstijden
- Inconsistente service kwaliteit
- Hoge operationele kosten
- Frustratie bij zowel klanten als medewerkers

**De AI-oplossing biedt:**
- 24/7 beschikbaarheid
- Directe respons (< 1 seconde)
- Consistente service kwaliteit
- Schaalbare oplossingen
- Data-gedreven verbeteringen

## Van frustratie naar tevredenheid

### De klantreis transformeren

**Traditioneel scenario:**
1. Klant belt → 15 minuten wachttijd
2. Uitleg probleem → 5 minuten
3. Doorverbonden → nogmaals uitleggen
4. Oplossing → mogelijk niet direct
5. Totaal: 30-45 minuten frustratie

**AI-powered scenario:**
1. Klant opent chat → direct contact
2. AI begrijpt context → 30 seconden
3. Gepersonaliseerde oplossing → 2 minuten
4. Probleem opgelost of escalatie → helder pad
5. Totaal: 3-5 minuten tevredenheid

### De psychologie achter tevredenheid

Klanten waarderen vooral:
- **Snelheid**: Direct antwoord krijgen
- **Begrip**: Het gevoel gehoord te worden
- **Oplossing**: Daadwerkelijk geholpen worden
- **Controle**: Zelf kiezen wanneer en hoe

## Praktische toepassingen

### Succesvolle implementaties

**E-commerce (Bol.com style):**
- "Waar is mijn bestelling?"
- "Kan ik dit retourneren?"
- "Is dit product op voorraad?"

**Telecom (KPN/Ziggo style):**
- "Mijn internet werkt niet"
- "Wat kost dit abonnement?"
- "Ik wil overstappen"

**Banking (ING/ABN style):**
- "Blokkeer mijn pas"
- "Wat is mijn saldo?"
- "Hoe vraag ik een lening aan?"

### De menselijke touch behouden

AI vervangt mensen niet, maar versterkt ze:
- Routine vragen → AI
- Complexe emotionele situaties → Mens
- First-line support → AI
- Escalatie en empathie → Mens

## Best practices voor implementatie

### 1. Start klein en specifiek
Begin met één duidelijk use case:
- FAQ automatisering
- Order status tracking
- Appointment scheduling

### 2. Meet vanaf dag één
- Response tijd
- Oplossingspercentage
- Klanttevredenheid (CSAT)
- Escalatie ratio

### 3. Itereer constant
- Analyseer gesprekken wekelijks
- Identificeer nieuwe intents
- Verbeter responses
- Train je team

## De toekomst van AI customer service

### Trends voor 2024-2025:
- **Multimodaal**: Voice + chat + video
- **Proactief**: Problemen voorkomen
- **Emotie AI**: Sentiment herkenning
- **Hyperpersonalisatie**: Individuele ervaringen

### Ethische overwegingen
- Transparantie: Klanten weten dat ze met AI praten
- Privacy: GDPR-compliant data gebruik
- Inclusiviteit: Toegankelijk voor iedereen
- Human fallback: Altijd een mens beschikbaar

## Kernprincipes voor succes

1. **Empathie first**: Technologie dient de mens
2. **Continuous learning**: Elke interactie is data
3. **Hybrid approach**: AI + Mens = Optimaal
4. **Customer centricity**: De klant bepaalt het succes

## Samenvatting

AI customer service transformeert frustratie naar tevredenheid door:
- Directe beschikbaarheid en snelle response
- Consistente en schaalbare service
- Data-gedreven personalisatie
- Naadloze mens-machine samenwerking

In de volgende les duiken we dieper in conversation design - de kunst van het creëren van natuurlijke, effectieve dialogen tussen mens en machine.`,
  codeExamples: [
    {
      id: 'example-1',
      title: 'Basis conversatie flow in Voiceflow',
      language: 'yaml',
      code: `# Welcome Flow
start:
  - text: "Hallo! Ik ben je virtuele assistent. Waarmee kan ik je helpen?"
  - buttons:
      - title: "Bestelling tracken"
        payload: track_order
      - title: "Product informatie"
        payload: product_info
      - title: "Contact opnemen"
        payload: contact_human

track_order:
  - text: "Ik help je graag met het tracken van je bestelling."
  - text: "Wat is je ordernummer?"
  - capture:
      variable: order_number
      validation: regex:^[0-9]{8}$
  - api:
      endpoint: "https://api.shop.nl/orders/{order_number}"
      method: GET
  - condition:
      if: api.status == "delivered"
      then: "Je bestelling is bezorgd op {api.delivery_date}"
      else: "Je bestelling wordt momenteel verwerkt. Verwachte levering: {api.expected_date}"`
    },
    {
      id: 'example-2',
      title: 'Sentiment detectie configuratie',
      language: 'javascript',
      code: `// Botpress sentiment analysis configuratie
const sentimentConfig = {
  enabled: true,
  thresholds: {
    negative: -0.5,  // Trigger escalatie
    positive: 0.5    // Positieve feedback flow
  },
  
  // Reactie op negatief sentiment
  onNegativeSentiment: async (event) => {
    await bp.dialog.send(event, [
      {
        type: 'text',
        text: 'Ik merk dat je gefrustreerd bent. Dat begrijp ik volledig.'
      },
      {
        type: 'single-choice',
        text: 'Wil je dat ik je doorverbind met een medewerker?',
        choices: ['Ja, graag', 'Nee, laten we het nog een keer proberen']
      }
    ])
  },
  
  // Keywords voor directe escalatie
  escalationTriggers: [
    'klacht', 'boos', 'ontevreden', 'schandalig', 
    'juridisch', 'advocaat', 'media'
  ]
}`
    }
  ],
  assignments: [
    {
      id: 'assignment-1',
      title: 'Analyseer je eigen klantenservice ervaring',
      type: 'project',
      difficulty: 'easy',
      description: `Onderzoek een recente klantenservice ervaring en ontwerp een betere AI-powered oplossing.

**Stappen:**
1. Kies een frustrerende klantenservice ervaring uit je eigen leven
2. Documenteer het huidige proces (stappen, tijdsduur, pijnpunten)
3. Ontwerp een AI-powered alternatief
4. Maak een simpele flowchart van de nieuwe customer journey
5. Identificeer waar AI waarde toevoegt en waar menselijke interactie nodig blijft

**Deliverables:**
- Customer journey map (before & after)
- Flowchart van AI conversatie flow
- Liste met verbeterpunten en KPIs`,
      hints: [
        'Denk aan de meest voorkomende vragen in die specifieke industrie',
        'Overweeg verschillende user personas (tech-savvy vs. beginner)',
        'Vergeet de edge cases niet (wat als het systeem het antwoord niet weet?)'
      ]
    }
  ],
  resources: [
    {
      title: 'The State of Conversational AI 2024 - Voiceflow Report',
      url: 'https://www.voiceflow.com/blog/conversational-ai-report-2024',
      type: 'article'
    },
    {
      title: 'Customer Service Benchmark Report Nederland',
      url: 'https://www.customerservicebenchmark.nl/rapport-2024',
      type: 'report'
    },
    {
      title: 'Designing Voice User Interfaces - Google',
      url: 'https://designguidelines.withgoogle.com/conversation/',
      type: 'guide'
    },
    {
      title: 'Conversational AI Success Stories',
      url: 'https://www.youtube.com/watch?v=conversational-ai-cases',
      type: 'video'
    }
  ]
}