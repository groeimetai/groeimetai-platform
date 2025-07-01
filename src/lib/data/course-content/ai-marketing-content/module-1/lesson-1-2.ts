import { Lesson } from '@/lib/data/courses'

export const lesson1_2: Lesson = {
  id: 'lesson-1-2',
  title: 'Prompt engineering voor marketing content',
  duration: '30 min',
  content: `# Prompt engineering voor marketing content

## Wat is prompt engineering?

Prompt engineering is de kunst van het formuleren van instructies aan AI-tools om de beste resultaten te krijgen. Voor marketeers is dit een essentiële vaardigheid - het verschil tussen generieke output en content die perfect aansluit bij je merk en doelgroep.

## De anatomie van een effectieve prompt

Een goede marketing prompt bestaat uit deze elementen:

### 1. Context
Geef de AI achtergrondinformatie over je merk, product of situatie.

### 2. Rol
Vraag de AI om een specifieke rol aan te nemen (bijv. "Je bent een ervaren copywriter").

### 3. Taak
Beschrijf precies wat je wilt dat de AI doet.

### 4. Format
Specificeer het gewenste formaat van de output.

### 5. Constraints
Geef beperkingen mee zoals woordenaantal, tone of voice, of specifieke elementen.

## Het CRISP framework voor marketing prompts

Ik introduceer het CRISP framework - een systematische aanpak voor marketing prompts:

- **C**ontext: Achtergrond en situatie
- **R**ol: Wie is de AI in deze situatie?
- **I**nstructie: Wat moet er precies gebeuren?
- **S**pecificaties: Format, lengte, stijl
- **P**ubliek: Voor wie is de content bedoeld?

## Praktische prompt templates

### Template 1: Social Media Post
\`\`\`
Context: [Beschrijf je merk/product]
Rol: Je bent een social media specialist met 10 jaar ervaring
Instructie: Schrijf een [platform] post over [onderwerp]
Specificaties: 
- Max [aantal] woorden/karakters
- Tone of voice: [beschrijving]
- Inclusief [aantal] hashtags
- Eindig met call-to-action
Publiek: [Beschrijf je doelgroep]
\`\`\`

### Template 2: E-mail Campagne
\`\`\`
Context: Wij zijn [bedrijf] en lanceren [product/dienst]
Rol: Je bent een e-mail marketing expert
Instructie: Schrijf een e-mail serie van 3 mails voor [doel]
Specificaties:
- Mail 1: Introductie (max 150 woorden)
- Mail 2: Voordelen uitlichten (max 200 woorden)  
- Mail 3: Urgentie en CTA (max 150 woorden)
- Pakkende onderwerpregel per mail
Publiek: [Demografische en psychografische kenmerken]
\`\`\`

### Template 3: Blog Artikel
\`\`\`
Context: [Industrie/niche] blog voor [doel website]
Rol: Je bent een SEO-copywriter gespecialiseerd in [industrie]
Instructie: Schrijf een artikel over [onderwerp]
Specificaties:
- 800-1000 woorden
- SEO-geoptimaliseerd voor: [keywords]
- Inclusief H2 en H3 koppen
- Praktische tips en voorbeelden
- Meta description (max 160 karakters)
Publiek: [Expertise niveau en interesses]
\`\`\`

## Geavanceerde prompt technieken

### 1. Chain-of-Thought Prompting
Vraag de AI om stap voor stap te denken:
"Denk eerst na over de doelgroep, bepaal dan de beste aanpak, en schrijf vervolgens de content."

### 2. Few-Shot Learning
Geef voorbeelden van wat je wilt:
"Hier zijn 3 voorbeelden van onze brand voice: [voorbeelden]. Schrijf nu een nieuwe post in dezelfde stijl."

### 3. Iteratieve Verfijning
Bouw voort op eerdere output:
"Maak deze tekst 20% korter maar behoud alle hoofdpunten" of "Voeg meer emotie toe aan deze copy"

### 4. Contrast Prompting
Vraag om variaties:
"Schrijf deze boodschap op 3 manieren: formeel, casual, en humoristisch"

## Veelgemaakte fouten (en hoe ze te vermijden)

### Fout 1: Te vage instructies
❌ "Schrijf een social media post"
✅ "Schrijf een LinkedIn post van 150 woorden over duurzaam ondernemen voor HR managers"

### Fout 2: Geen doelgroep specificeren
❌ "Maak een advertentie voor onze nieuwe app"
✅ "Maak een Facebook advertentie voor onze fitness app, gericht op drukke moeders van 30-45 jaar"

### Fout 3: Vergeten brand voice mee te geven
❌ "Schrijf productbeschrijving"
✅ "Schrijf productbeschrijving in onze speelse, optimistische brand voice met korte zinnen"

### Fout 4: Geen format specificaties
❌ "Maak een e-mail"
✅ "Maak een e-mail met: onderwerpregel (max 50 karakters), preview tekst (max 90 karakters), body (max 200 woorden)"

## Prompt optimalisatie workshop

### Stap 1: Begin Basis
Start met een simpele prompt en noteer wat mist in de output.

### Stap 2: Voeg Elements Toe
Voeg één voor één CRISP elementen toe en observeer verbeteringen.

### Stap 3: Test Variaties
Probeer verschillende formuleringen en vergelijk resultaten.

### Stap 4: Creëer Template
Maak een herbruikbare template van je beste prompt.

## Praktijkcase: Van basis naar pro prompt

**Basis prompt:**
"Schrijf een Instagram post over onze nieuwe smoothie"

**Verbeterde prompt:**
"Context: Wij zijn FreshBlend, een merk voor gezonde smoothies
Rol: Je bent onze social media manager met focus op wellness
Instructie: Schrijf een Instagram post voor de lancering van onze nieuwe Tropical Paradise smoothie
Specificaties:
- Max 125 woorden
- Emoji's gebruiken
- 5 relevante hashtags
- Eindigen met vraag voor engagement
Publiek: Gezondheidsbewuste millennials die van tropische smaken houden"

## Prompt bibliotheek voor marketeers

Bouw je eigen bibliotheek op met succesvolle prompts voor:
- Product lanceringen
- Seizoensgebonden campagnes  
- Customer testimonials
- FAQ content
- Nieuwsbrieven
- Webinar aankondigingen
- Case studies
- Social media series

## Meten en verbeteren

Houd bij welke prompts de beste resultaten geven:
1. Hoeveel editing was nodig?
2. Presteerde de content goed? 
3. Bleef de brand voice consistent?
4. Was de CTA effectief?

Gebruik deze data om je prompts continu te verbeteren.

## Conclusie

Prompt engineering is geen exacte wetenschap maar een vaardigheid die je ontwikkelt met oefening. Door het CRISP framework te gebruiken en systematisch te experimenteren, zul je steeds betere resultaten krijgen van AI-tools.

In de volgende les combineren we deze kennis in een complete AI workflow voor content creatie.`,
  codeExamples: [
    {
      id: 'example-1',
      title: 'CRISP Framework Voorbeeld - Product Launch',
      language: 'markdown',
      code: `Context: SportTech is een innovatief fitnessmerk dat smart home gym equipment maakt. We lanceren de "FlexPro 3000" - een compacte all-in-one trainingsstation voor thuisgebruik.

Rol: Je bent een ervaren product marketing manager met expertise in fitness technologie en consumer electronics.

Instructie: Schrijf een product announcement voor onze e-mail lijst die enthousiasme opwekt en pre-orders stimuleert.

Specificaties:
- E-mail formaat met pakkende subject line
- 200-250 woorden
- Tone: Energiek maar professioneel
- Include: 3 key features, prijs, beschikbaarheidsdatum
- Sterke CTA voor pre-order met early bird korting

Publiek: Fitness enthusiasten (25-45 jaar) die thuis trainen, tech-savvy zijn, en bereid zijn te investeren in premium equipment.`
    },
    {
      id: 'example-2',
      title: 'Iteratieve Prompt Verfijning',
      language: 'markdown',
      code: `// Eerste prompt:
"Schrijf social media posts voor onze nieuwe koffielijn"

// Verfijning 1 - Voeg specificaties toe:
"Schrijf 3 Instagram posts voor onze nieuwe premium koffielijn
- Elk 100-150 woorden
- Focus op verschillende aspecten: smaak, origine, duurzaamheid"

// Verfijning 2 - Voeg context en publiek toe:
"Context: Ambacht Koffie lanceert 3 single origin koffies uit Peru, Ethiopia en Colombia
Schrijf 3 Instagram posts (100-150 woorden elk) voor koffieliefhebbers die waarde hechten aan:
- Authentieke smaakprofielen
- Eerlijke handel
- Ambachtelijke bereiding
Include relevante emoji's en 5 hashtags per post"

// Verfijning 3 - Voeg brand voice toe:
"Context: Ambacht Koffie - premium koffiemerk met warme, kennisdelende brand voice
Rol: Je bent onze content creator die complexe koffiekennis toegankelijk maakt
[Rest van de prompt...]
Tone: Warm, uitnodigend, educatief zonder pretentieus te zijn"`
    },
    {
      id: 'example-3',
      title: 'A/B Test Prompt Template',
      language: 'markdown',
      code: `Ik wil A/B testen met verschillende marketing angles.

Product: [Product naam en korte beschrijving]

Creëer 3 versies van een [type content] met deze verschillende invalshoeken:

Versie A - Focus op [angle 1, bijv. "tijdsbesparing"]
Versie B - Focus op [angle 2, bijv. "kostenbesparing"]  
Versie C - Focus op [angle 3, bijv. "gemak"]

Voor elke versie:
- [Specificaties zoals lengte, format]
- Zelfde structure maar verschillende messaging
- Consistente brand voice: [omschrijving]
- Eindig met meetbare CTA

Doelgroep blijft gelijk: [doelgroep omschrijving]`
    }
  ],
  assignments: [
    {
      id: 'assignment-1',
      title: 'CRISP Framework Toepassen',
      type: 'project',
      difficulty: 'easy',
      description: 'Kies een product of dienst uit jouw branche. Schrijf een complete CRISP prompt voor 3 verschillende marketing materialen: een social media post, een e-mail, en een advertentietekst. Test elke prompt en documenteer de resultaten.',
      hints: [
        'Begin met het invullen van alle 5 CRISP elementen voor elk materiaal',
        'Wees specifiek in je rol omschrijving - dit beïnvloedt de tone sterk',
        'Test of de output consistent is door de prompt 2-3 keer te gebruiken'
      ]
    },
    {
      id: 'assignment-2',
      title: 'Prompt Optimalisatie Challenge',
      type: 'project',
      difficulty: 'medium',
      description: 'Neem een basis marketing prompt en verbeter deze in 5 iteraties. Documenteer na elke iteratie wat je hebt toegevoegd en hoe dit de output verbeterde. Deel je bevindingen inclusief de voor/na resultaten.',
      hints: [
        'Start heel basic en voeg steeds één element toe',
        'Let op: wanneer wordt de output echt merkbaar beter?',
        'Experimenteer met verschillende volgorde van informatie'
      ]
    },
    {
      id: 'assignment-3',
      title: 'Bouw Je Prompt Bibliotheek',
      type: 'project',
      difficulty: 'easy',
      description: 'Creëer een persoonlijke prompt bibliotheek met minimaal 10 templates voor verschillende marketing scenarios die relevant zijn voor jouw werk. Organiseer ze per categorie en voeg notities toe over beste use cases.',
      hints: [
        'Denk aan terugkerende taken in je werk',
        'Maak templates aanpasbaar met [brackets] voor variabelen',
        'Test elke template voordat je hem opslaat'
      ]
    }
  ],
  resources: [
    {
      title: 'OpenAI Prompt Engineering Guide',
      url: 'https://platform.openai.com/docs/guides/prompt-engineering',
      type: 'guide'
    },
    {
      title: 'Anthropic Prompt Engineering',
      url: 'https://docs.anthropic.com/claude/docs/prompt-engineering',
      type: 'tutorial'
    },
    {
      title: 'Marketing Prompt Examples Database',
      url: 'https://github.com/f/awesome-chatgpt-prompts#marketing',
      type: 'reference'
    },
    {
      title: 'Learn Prompting - Marketing Section',
      url: 'https://learnprompting.org/docs/applied_prompting/marketing',
      type: 'course'
    }
  ]
};