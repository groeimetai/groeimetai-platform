import type { Lesson } from '@/lib/data/courses'

export const lesson1_4: Lesson = {
  id: 'lesson-1-4',
  title: 'Multimodal features',
  duration: '75 minuten',
  content: `# Multimodal features

## De multimodale revolutie

AI is niet langer beperkt tot tekst. Moderne modellen zoals GPT-4V, o3, en Gemini kunnen zien, horen, en multiple modaliteiten combineren. Deze les verkent hoe je deze krachtige features optimaal benut.

## Vision capabilities

### GPT-4V & o3 Image Understanding

#### Wat kunnen vision models?

**Object detectie & beschrijving**
- Identificeer objecten, personen, dieren
- Beschrijf scènes in detail
- Analyseer compositie en context
- Herken tekst (OCR) in afbeeldingen

**Technische analyse**
- Lees grafieken en diagrammen
- Interpreteer technische tekeningen
- Analyseer UI/UX designs
- Code screenshots begrijpen

**Creatieve interpretatie**
- Kunstanalyse en stijlherkenning
- Meme en humor begrip
- Emotionele context van beelden
- Metaforen en symboliek

### o3's geavanceerde image reasoning

o3 brengt reasoning naar vision:

\`\`\`
Voorbeeld prompt met afbeelding van een schaakbord:
"Analyseer deze schaakpositie. Wat is de beste zet voor wit? 
Overweeg tactische motieven en positionele factoren."

o3 zal:
1. Alle stukken identificeren
2. Bedreigingen analyseren
3. Tactische patronen herkennen
4. Kandidaat zetten evalueren
5. De beste zet adviseren met uitleg
\`\`\`

### Gemini's native vision

Gemini excelleert in:
- **Real-time video analyse** (tot 1 uur video)
- **Multi-image conversaties**
- **Spatial reasoning**
- **Native multimodaal** (geen aparte vision mode)

#### Gemini vision voorbeelden

**Document analyse**
\`\`\`
Upload: [Foto van handgeschreven notities]
Prompt: "Transcribeer deze notities en structureer ze als markdown met:
- Hoofdpunten als headers
- Subpunten als bullets
- Belangrijke termen bold
- Datums en getallen gemarkeerd"
\`\`\`

**UI/UX Review**
\`\`\`
Upload: [Screenshot van app interface]
Prompt: "Analyseer deze UI volgens Nielsen's heuristieken.
Identificeer usability issues en geef concrete verbeteringen.
Focus op accessibility en mobile responsiveness."
\`\`\`

## Audio capabilities

### ChatGPT Advanced Voice Mode

#### Features
- **Natural conversation**: Vloeiende, menselijke interactie
- **Emotion detection**: Herkent toon en emotie
- **Multiple voices**: Verschillende stem personas
- **Interruption handling**: Natural turn-taking

#### Use cases
\`\`\`
1. Taalonderwijs
"Laten we Frans oefenen. Corrigeer mijn uitspraak en 
geef feedback op mijn grammatica."

2. Brainstorming
"Ik wil hardop nadenken over mijn startup idee. 
Stel kritische vragen en help me denken."

3. Rollenspel
"Speel een sollicitatiegesprek. Jij bent de interviewer 
voor een product manager rol bij Google."
\`\`\`

### Gemini's native audio processing

#### Unieke features
- **Audio file analyse**: Upload MP3, WAV, etc.
- **Transcript + audio understanding**: Begrijpt toon én inhoud
- **Multilingual support**: 40+ talen native
- **Audio generation**: Tekst naar natuurlijke spraak

#### Praktische toepassingen

**Podcast/Interview analyse**
\`\`\`
Upload: [30 min podcast audio]
Prompt: "Analyseer dit interview:
1. Hoofdthema's en key insights
2. Spreektijd verdeling
3. Emotionele arc van het gesprek
4. Quotes die viraal kunnen gaan
5. Timestamps van belangrijke momenten"
\`\`\`

**Meeting transcriptie & analyse**
\`\`\`
Upload: [Teams meeting opname]
Prompt: "Maak een executive summary met:
- Actie items per persoon
- Belangrijke beslissingen
- Open vragen
- Follow-up taken
- Sentiment analyse per deelnemer"
\`\`\`

## File upload capabilities

### Ondersteunde bestandstypen

#### Documenten
- **PDF**: Rapporten, papers, ebooks
- **Word/Docs**: Manuscripts, templates
- **Excel/Sheets**: Data analyse, financiën
- **PowerPoint**: Presentaties, pitch decks
- **Text/Code**: Scripts, logs, configs

#### Media
- **Images**: JPG, PNG, GIF, WebP, SVG
- **Audio**: MP3, WAV, M4A, FLAC
- **Video**: MP4, AVI, MOV (Gemini)

#### Data
- **CSV/TSV**: Datasets, exports
- **JSON/XML**: API responses, configs
- **SQL**: Database dumps
- **Log files**: System logs, analytics

### Geavanceerde file processing

#### Multi-file analyse
\`\`\`
Upload: [10 financial reports]
Prompt: "Vergelijk deze kwartaalrapporten:
1. Identificeer trends over tijd
2. Benchmark prestaties tussen bedrijven
3. Voorspel Q4 op basis van patterns
4. Maak een executive dashboard"
\`\`\`

#### Code repository analyse
\`\`\`
Upload: [Project folder als ZIP]
Prompt: "Analyseer deze codebase:
- Architecture overview
- Code quality metrics
- Security vulnerabilities
- Performance bottlenecks
- Refactoring suggesties"
\`\`\`

## Multimodale combinaties

### Vision + Text

**Product fotografie analyse**
\`\`\`
Upload: [Product foto's]
Prompt: "Schrijf SEO-geoptimaliseerde productbeschrijvingen:
- Titel (max 60 karakters)
- Korte beschrijving (150 karakters)
- Lange beschrijving met features
- Alt-text voor accessibility
- Schema markup JSON-LD"
\`\`\`

### Audio + Vision + Text

**Video content analyse** (Gemini)
\`\`\`
Upload: [YouTube video]
Prompt: "Maak een complete content strategie:
1. Transcriptie met timestamps
2. Thumbnail suggesties op key moments
3. Short-form clips (onder 60 sec)
4. SEO tags en beschrijving
5. Social media posts per platform"
\`\`\`

### Document + Data + Vision

**Business intelligence dashboard**
\`\`\`
Upload: [Sales data CSV + Product images + Reports PDF]
Prompt: "Creëer een volledig sales analysis rapport:
- Performance per product (met visuals)
- Geografische heatmaps
- Voorspellingsmodellen
- Actionable recommendations
- Interactive dashboard mockup"
\`\`\`

## Best practices voor multimodaal

### Image uploads
- **Resolutie**: Hoge kwaliteit voor detail analyse
- **Context**: Geef altijd context bij de afbeelding
- **Multiple views**: Upload meerdere hoeken indien relevant
- **Annotations**: Vraag om visuele annotaties terug

### Audio processing
- **Kwaliteit**: Minimaliseer achtergrondgeluid
- **Lengte**: Deel lange audio op in segmenten
- **Context**: Beschrijf setting en sprekers
- **Format**: Gebruik gangbare formaten (MP3, WAV)

### File handling
- **Organisatie**: Structureer files logisch
- **Naming**: Gebruik descriptieve bestandsnamen
- **Size**: Respecteer upload limieten
- **Privacy**: Verwijder gevoelige informatie

## Praktijkvoorbeelden

### Voorbeeld 1: Real Estate analyse
\`\`\`
Input:
- 20 foto's van een woning
- Plattegrond PDF
- Buurt statistieken CSV

Prompt: "Maak een complete vastgoed analyse:
1. Waardebepaling op basis van visuele staat
2. Renovatie suggesties met kostenschatting
3. Vergelijking met buurtgemiddelden
4. Marketing strategie voor verkoop
5. Virtual staging suggesties"
\`\`\`

### Voorbeeld 2: Medical image interpretation
\`\`\`
Input: [X-ray afbeelding]
Disclaimer: "Dit is voor educatieve doeleinden, geen medisch advies"

Prompt: "Beschrijf wat je ziet in deze röntgenfoto:
- Anatomische structuren
- Mogelijke afwijkingen
- Kwaliteit van de opname
- Vergelijking met normale anatomie"
\`\`\`

### Voorbeeld 3: Multimodal content creation
\`\`\`
Input:
- Brand guidelines PDF
- Product foto's
- Competitor ads (screenshots)
- Target audience data CSV

Prompt: "Ontwikkel een complete advertentie campagne:
1. 5 verschillende ad concepts
2. Copy variaties per platform
3. Visual style recommendations
4. A/B test suggesties
5. KPI tracking plan"
\`\`\`

## Platform-specifieke tips

### ChatGPT/o3
- Gebruik GPT-4V voor complexe visual reasoning
- Combineer met code interpreter voor data + vision
- Chain multiple images in één conversatie
- Vraag om visual output (graphs, annotated images)

### Gemini
- Benut native video voor motion analyse
- Upload tot 1 uur video content
- Gebruik voor real-time streaming scenarios
- Combineer alle modaliteiten naadloos

### Claude
- Excel in document understanding
- Sterk in technische diagrammen
- Gebruik voor code + screenshot debugging
- Vraag om gestructureerde output`,
  codeExamples: [
    {
      id: 'example-1',
      title: 'Multimodale product analyse',
      language: 'python',
      code: `# Voorbeeld van hoe AI deze multimodale analyse zou aanpakken

# Stap 1: Image Analysis
product_images = ["front.jpg", "back.jpg", "detail.jpg", "lifestyle.jpg"]
image_analysis = {
    "colors": ["Navy Blue", "Gold accents", "White stitching"],
    "materials": ["Premium leather", "Metal hardware", "Canvas lining"],
    "style": "Luxury handbag, minimalist design",
    "target_audience": "Professional women, 25-45",
    "price_perception": "High-end, $800-1200 range"
}

# Stap 2: Competitor Analysis (van screenshots)
competitor_data = {
    "Coach": {"price": "$850", "features": ["Similar size", "Less hardware"]},
    "Michael Kors": {"price": "$450", "features": ["More colors", "Synthetic"]},
    "Tory Burch": {"price": "$698", "features": ["Similar style", "Brand focus"]}
}

# Stap 3: Generate Marketing Copy
marketing_copy = {
    "headline": "Timeless Elegance Meets Modern Function",
    "tagline": "Carry Your World in Style",
    "description": """
        Crafted from premium Italian leather with meticulous attention 
        to detail, our signature handbag seamlessly blends classic 
        sophistication with contemporary functionality.
    """,
    "key_features": [
        "Full-grain Italian leather exterior",
        "Spacious interior with 6 organizational pockets",
        "Adjustable shoulder strap for versatile wear",
        "Signature gold-tone hardware",
        "Dust bag and authenticity card included"
    ]
}

# Stap 4: SEO Optimization
seo_data = {
    "title": "Luxury Leather Handbag - Navy Blue Designer Tote | Brand",
    "meta_description": "Shop our premium navy leather handbag. Italian craftsmanship meets modern style. Free shipping & returns. Perfect for work & weekend.",
    "keywords": ["luxury handbag", "leather tote", "designer bag", "navy purse"],
    "alt_texts": {
        "front.jpg": "Navy blue leather luxury handbag front view",
        "lifestyle.jpg": "Professional woman carrying navy designer handbag"
    }
}

# Stap 5: Social Media Strategy
social_strategy = {
    "instagram": {
        "caption": "Monday blues never looked so good 💙 #LuxuryLeather",
        "hashtags": ["#HandbagLove", "#ItalianLeather", "#WorkStyle"],
        "story_ideas": ["Unboxing", "5 ways to style", "Behind the craftsmanship"]
    },
    "pinterest": {
        "board": "Timeless Work Bags",
        "description": "The perfect companion for the modern professional"
    }
}`,
      explanation: 'Dit toont hoe AI multimodale input (afbeeldingen, competitor data, brand guidelines) combineert tot een complete marketing strategie.'
    },
    {
      id: 'example-2',
      title: 'Audio meeting analyse met Gemini',
      language: 'text',
      code: `Input: 45-minute product planning meeting (audio file)

Gemini's analyse output:

## Meeting Summary: Q1 Product Roadmap Planning

**Participants detected:** 4 speakers
- Speaker A (Product Manager): 35% talk time
- Speaker B (Lead Developer): 28% talk time  
- Speaker C (Designer): 22% talk time
- Speaker D (Marketing): 15% talk time

### Key Decisions Made:

1. **Feature Prioritization** [08:45]
   - Mobile app redesign moved to Q1 priority
   - API v2 postponed to Q2
   - Decision confidence: High (unanimous)

2. **Resource Allocation** [23:10]
   - 2 additional developers for mobile team
   - Designer bandwidth increased 50%
   - Budget approved: $150k

### Action Items by Person:

**Speaker A (PM):**
- [ ] Update roadmap document by Friday
- [ ] Schedule stakeholder reviews
- [ ] Create mobile app PRD

**Speaker B (Dev Lead):**
- [ ] Technical spike on React Native vs Flutter
- [ ] Interview 5 developer candidates
- [ ] Migration plan for existing users

### Emotional Tone Analysis:

- Overall sentiment: Positive (78%)
- Tension points:
  - [15:30] Budget discussion - mild concern
  - [31:20] Timeline debate - resolved constructively
- High enthusiasm moments:
  - [12:00] New design concepts
  - [38:45] Team expansion approval

### Notable Quotes:

"This could be our breakthrough quarter" - Speaker A [05:23]
"We need to be realistic about technical debt" - Speaker B [19:45]
"The new design tested off the charts" - Speaker C [11:30]

### Follow-up Required:

1. Technical feasibility review - Due: Jan 15
2. User research findings - Present: Jan 20
3. Budget reforecast if scope increases - Feb 1

### Meeting Effectiveness Score: 8.5/10
- Clear outcomes: ✓
- All voices heard: ✓
- Time management: Good (5 min over)
- Action items assigned: ✓
- Next steps defined: ✓`,
      explanation: 'Gemini analyseert niet alleen wat er gezegd wordt, maar ook HOE het gezegd wordt, spreektijd verdeling, en emotionele dynamiek.'
    }
  ],
  assignments: [
    {
      id: 'assignment-1-4-1',
      title: 'Multimodal Project',
      description: 'Creëer een volledig project gebruikmakend van multiple modaliteiten.',
      difficulty: 'expert',
      type: 'project',
      initialCode: `// Project Idee: Genereer een marketing campagne voor een nieuw product.

// 1. Verzamel diverse inputs: product afbeeldingen, design documenten, doelgroep data (CSV).
// 2. Gebruik ChatGPT/o3 voor het project.
// 3. Herhaal met Gemini.
// 4. Documenteer verschillen in aanpak en output kwaliteit.
// 5. Maak een final deliverable door de beste elementen te combineren.
`,
      hints: [
        'Combineer minimaal 3 verschillende modaliteiten (bijv. tekst, beeld, data).',
        'Vergelijk hoe elk model de verschillende inputs integreert in zijn output.',
        'Focus op een real-world probleem dat je met deze technologieën kunt oplossen.'
      ]
    }
  ],
  resources: [
    {
      title: 'OpenAI Vision Guide',
      url: 'https://platform.openai.com/docs/guides/vision',
      type: 'documentation'
    },
    {
      title: 'Gemini Multimodal Cookbook',
      url: 'https://github.com/google-gemini/cookbook',
      type: 'code'
    }
  ]
}