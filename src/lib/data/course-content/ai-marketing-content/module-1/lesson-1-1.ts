import { Lesson } from '@/lib/data/courses'

export const lesson1_1: Lesson = {
  id: 'lesson-1-1',
  title: 'AI tools voor marketeers: Het complete overzicht',
  duration: '25 min',
  content: `# AI tools voor marketeers: Het complete overzicht

## Inleiding
Welkom bij de eerste les van onze AI Marketing cursus! In deze les maak je kennis met de belangrijkste AI-tools die jouw marketingwerk kunnen transformeren. We bespreken praktische toepassingen, kosten en hoe je de juiste tool kiest voor jouw behoeften.

## De revolutie van AI in marketing

AI heeft marketing fundamenteel veranderd. Waar we vroeger uren besteedden aan het schrijven van content, kunnen we nu in minuten hoogwaardige teksten genereren. Maar het gaat verder dan alleen tijdsbesparing - AI helpt ons kreatievere ideeën te ontwikkelen, beter te targeten en effectiever te communiceren.

## Overzicht van essentiële AI-tools

### 1. ChatGPT (OpenAI)
**Wat is het?** De meest bekende AI-assistent voor algemeen gebruik.

**Sterktes voor marketeers:**
- Brainstormen over campagne-ideeën
- Social media posts schrijven
- E-mailcampagnes opstellen
- SEO-geoptimaliseerde content creëren
- Klantpersona's ontwikkelen

**Prijs:** Gratis versie beschikbaar, Plus versie €20/maand

### 2. Claude (Anthropic)
**Wat is het?** Een geavanceerde AI-assistent met sterke analytische capaciteiten.

**Sterktes voor marketeers:**
- Lange-vorm content schrijven
- Complexe marketingstrategieën analyseren
- Gedetailleerde rapporten opstellen
- Concurrentieanalyses uitvoeren

**Prijs:** Gratis versie beschikbaar, Pro versie $20/maand

### 3. Jasper AI
**Wat is het?** Specifiek ontwikkeld voor marketing en content creatie.

**Sterktes voor marketeers:**
- Kant-en-klare templates voor marketing
- Brand voice consistency
- Bulk content generatie
- Integratie met SEO-tools

**Prijs:** Vanaf $49/maand

### 4. Copy.ai
**Wat is het?** AI-tool gefocust op korte marketing copy.

**Sterktes voor marketeers:**
- Advertentieteksten schrijven
- Product beschrijvingen
- Landing page copy
- E-mail onderwerpen

**Prijs:** Gratis versie beschikbaar, Pro vanaf $49/maand

### 5. Midjourney & DALL-E
**Wat zijn het?** AI-tools voor het genereren van afbeeldingen.

**Sterktes voor marketeers:**
- Social media visuals
- Blog illustraties
- Advertentie afbeeldingen
- Concept visualisaties

**Prijs:** Midjourney vanaf $10/maand, DALL-E pay-per-use

### 6. Canva AI
**Wat is het?** Design tool met geïntegreerde AI-functies.

**Sterktes voor marketeers:**
- Magic Design voor automatische layouts
- Text to Image functionaliteit
- Background remover
- Magic Resize voor verschillende formaten

**Prijs:** Gratis versie, Pro vanaf €11,99/maand

## Hoe kies je de juiste tool?

Bij het kiezen van AI-tools voor jouw marketingwerk, overweeg:

1. **Budget**: Begin met gratis versies om te testen
2. **Use case**: Waar heb je de meeste hulp bij nodig?
3. **Integraties**: Past het in je huidige workflow?
4. **Learning curve**: Hoe snel kun je ermee aan de slag?
5. **Output kwaliteit**: Test met echte projecten

## Praktijkvoorbeeld: Een social media campagne opzetten

Laten we kijken hoe verschillende AI-tools samenwerken in een echte marketingworkflow:

1. **ChatGPT**: Brainstorm campagne thema's
2. **Jasper**: Schrijf de hoofdboodschappen
3. **Copy.ai**: Creëer variaties voor A/B testing
4. **Midjourney**: Genereer visuele content
5. **Canva AI**: Combineer alles in professionele designs

## Best practices voor AI-tool gebruik

### Do's:
- Test meerdere tools voor je investeert
- Gebruik AI als startpunt, niet eindpunt
- Bewaar succesvolle prompts voor hergebruik
- Combineer tools voor betere resultaten
- Blijf de output controleren en aanpassen

### Don'ts:
- Vertrouw niet blind op AI-output
- Kopieer nooit 1-op-1 zonder controle
- Vergeet niet je brand voice toe te voegen
- Negeer privacy en copyright aspecten niet

## Oefening: Jouw eerste AI-experiment

Kies één van de gratis tools (ChatGPT of Claude) en probeer het volgende:
1. Vraag om 5 social media post ideeën voor jouw product/dienst
2. Laat één idee uitwerken tot complete post
3. Vraag om 3 variaties met verschillende tonen (formeel, casual, humoristisch)
4. Analyseer: Wat werkt wel/niet voor jouw merk?

## Conclusie

AI-tools zijn geen vervanging voor jouw creativiteit en marketingkennis - ze zijn krachtige assistenten die je werk versnellen en verbeteren. Door de juiste tools te kiezen en effectief te gebruiken, kun je meer bereiken in minder tijd.

In de volgende les duiken we dieper in prompt engineering - de kunst van het stellen van de juiste vragen aan AI voor optimale resultaten.`,
  codeExamples: [
    {
      id: 'example-1',
      title: 'Basis prompt voor productbeschrijving',
      language: 'markdown',
      code: `Schrijf een productbeschrijving voor [product naam]

Doelgroep: [beschrijf je doelgroep]
Tone of voice: [formeel/informeel/speels/professioneel]
Lengte: [aantal woorden]
Focus op: [belangrijkste voordelen]

Gebruik deze structuur:
1. Pakkende openingszin
2. Probleem dat het oplost
3. Belangrijkste features
4. Call-to-action`
    },
    {
      id: 'example-2',
      title: 'Social media content calendar prompt',
      language: 'markdown',
      code: `Creëer een social media content calendar voor [bedrijfsnaam]

Platform: [LinkedIn/Instagram/Facebook]
Periode: [bijv. 1 week]
Posting frequentie: [bijv. 3x per week]
Doelen: [brand awareness/engagement/conversie]

Inclusief:
- Post thema
- Hoofdboodschap
- Hashtag suggesties
- Beste posting tijd`
    }
  ],
  assignments: [
    {
      id: 'assignment-1',
      title: 'Tool vergelijking en selectie',
      type: 'project',
      difficulty: 'easy',
      description: 'Test minimaal 3 verschillende AI-tools met dezelfde marketingopdracht. Schrijf een korte evaluatie (200 woorden) waarin je vergelijkt: gebruiksgemak, output kwaliteit, en geschiktheid voor jouw marketingdoelen.',
      hints: [
        'Gebruik dezelfde prompt bij alle tools voor eerlijke vergelijking',
        'Let op verschillen in schrijfstijl en creativiteit',
        'Noteer hoeveel aanpassingen je moet maken aan de output'
      ]
    },
    {
      id: 'assignment-2',
      title: 'Creëer je AI-toolkit',
      type: 'project',
      difficulty: 'easy',
      description: 'Stel jouw ideale AI-toolkit samen voor je specifieke marketingrol. Maak een overzicht met: welke tools je kiest, waarvoor je ze gebruikt, geschatte kosten, en hoe ze elkaar aanvullen.',
      hints: [
        'Denk aan je dagelijkse taken en uitdagingen',
        'Begin met gratis versies voor testen',
        'Overweeg de leercurve per tool'
      ]
    }
  ],
  resources: [
    {
      title: 'ChatGPT voor beginners',
      url: 'https://openai.com/chatgpt',
      type: 'tool'
    },
    {
      title: 'Claude AI',
      url: 'https://claude.ai',
      type: 'tool'
    },
    {
      title: 'Jasper AI Marketing Templates',
      url: 'https://www.jasper.ai/templates',
      type: 'guide'
    },
    {
      title: 'Copy.ai Free Tools',
      url: 'https://www.copy.ai/tools',
      type: 'tool'
    },
    {
      title: 'Midjourney Beginners Guide',
      url: 'https://docs.midjourney.com/docs/quick-start',
      type: 'tutorial'
    }
  ]
};