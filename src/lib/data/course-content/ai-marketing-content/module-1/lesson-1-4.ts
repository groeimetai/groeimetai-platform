import { Lesson } from '@/lib/data/courses'

export const lesson1_4: Lesson = {
  id: 'lesson-1-4',
  title: 'Content kwaliteit en merkidentiteit bewaken',
  duration: '25 min',
  content: `# Content kwaliteit en merkidentiteit bewaken

## De uitdaging van AI en merkidentiteit

AI-tools zijn krachtig, maar ze kennen jouw merk niet zoals jij dat doet. Zonder de juiste sturing kan AI-gegenereerde content generiek aanvoelen en je merkidentiteit verdunnen. In deze les leer je hoe je de efficiëntie van AI combineert met het behouden van je unieke brand voice en kwaliteitsstandaarden.

## Het Brand Guardian Framework

Ik introduceer het Brand Guardian Framework - een systematische aanpak om merkidentiteit te waarborgen in AI-content:

### De 5 pijlers:
1. **Voice** - Hoe klinkt je merk?
2. **Values** - Waar staat je merk voor?
3. **Visuals** - Hoe ziet je merk eruit?
4. **Vocabulary** - Welke woorden gebruik je (niet)?
5. **Vibe** - Welk gevoel geef je mensen?

## Pijler 1: Voice - Je merk laten klinken

### Brand voice matrix ontwikkelen

Creëer een duidelijke voice guide voor AI:

**Voice Dimensies:**
- **Formaliteit**: Zakelijk ↔ Casual
- **Energie**: Kalm ↔ Enthousiast  
- **Humor**: Serieus ↔ Speels
- **Autoriteit**: Bescheiden ↔ Expert

**Voorbeeld brand voice prompt:**
"Schrijf in onze brand voice:
- Toegankelijk maar professioneel (70% casual, 30% formeel)
- Optimistisch en energiek zonder overdreven te zijn
- Light humor is ok, maar geen grappen forceren
- Positioneer als helpful expert, niet als alwetende autoriteit"

### Do's and Don'ts lijst

Maak concrete lijsten voor AI-instructies:

**DO's:**
- Gebruik actieve zinnen
- Spreek direct tot de lezer ("je/jij")
- Deel praktische tips
- Wees concreet en specifiek

**DON'Ts:**
- Geen jargon zonder uitleg
- Vermijd superlatieven
- Geen clichés ("in het digitale tijdperk")
- Geen valse urgentie

## Pijler 2: Values - Waarden consistent communiceren

### Merkwaarden vertalen naar content richtlijnen

**Voorbeeld: Duurzaamheid als kernwaarde**

AI Instructie template:
"Onze content moet altijd onze commitment aan duurzaamheid reflecteren:
- Benadruk lange termijn voordelen boven quick wins
- Include eco-friendly alternatieven waar relevant
- Wees transparant over onze environmental impact
- Vermijd greenwashing taal"

### Values check prompt

Na content generatie:
"Analyseer deze content op alignment met onze merkwaarden:
[Content]
Check specifiek:
1. Komt [waarde 1] duidelijk naar voren?
2. Is er consistentie met [waarde 2]?
3. Zijn er conflicten met onze waarden?
Geef concrete verbeterpunten."

## Pijler 3: Visuals - Consistente beeldtaal

### Visual guidelines voor AI-tools

Bij gebruik van AI voor visual content:

**Stijl instructies template:**
"Genereer afbeeldingen in onze huisstijl:
- Kleurenpalet: [hex codes]
- Stijl: [minimalistisch/bold/organic/etc]
- Sfeer: [professioneel/warm/modern/etc]
- Must-haves: [specifieke elementen]
- Avoid: [wat niet past bij het merk]"

### Visual consistency checklist
- □ Kleuren matchen brand palette
- □ Typography consistent met guidelines
- □ Imagery style past bij merk
- □ Logo gebruik correct
- □ Algemene look & feel klopt

## Pijler 4: Vocabulary - De juiste woorden

### Brand dictionary creëren

**Preferred terms:**
- Wij zeggen: "oplossing" niet "product"
- Wij zeggen: "klant" niet "gebruiker"
- Wij zeggen: "investering" niet "kosten"

**Banned words lijst:**
- Revolutionair (overused)
- Baanbrekend (cliché)
- Synergie (corporate jargon)
- Bleeding-edge (te technisch)

### Terminology consistency prompt

"Vervang de volgende termen met onze preferred vocabulary:
[lijst van te vervangen woorden]
Onze preferred terms:
[lijst van gewenste alternatieven]
Pas toe op deze content: [content]"

## Pijler 5: Vibe - Het juiste gevoel creëren

### Emotionele brand blueprint

Definieer de emoties die je content moet oproepen:

**Primary emotions:**
- Vertrouwen (40%)
- Inspiratie (30%)
- Belonging (30%)

**Emotion check prompt:**
"Lees deze content alsof je onze ideale klant bent:
[content]
Welke emoties roept dit op?
Past dit bij ons gewenste gevoel van [emotions lijst]?
Suggesties om de juiste vibe te versterken?"

## Quality Control Systeem

### De 3-fase review process

**Fase 1: AI Self-Check**
Direct na generatie:
"Review deze content op:
- Grammatica en spelling
- Logische flow
- Feitelijke accuraatheid
- Compleetheid
Markeer issues en verbeter."

**Fase 2: Brand Alignment Check**
"Evalueer deze content tegen onze brand guidelines:
- Voice: [score 1-10]
- Values: [score 1-10]
- Vocabulary: [score 1-10]
- Vibe: [score 1-10]
Geef specifieke voorbeelden waar verbetering nodig is."

**Fase 3: Human Final Review**
Altijd een menselijke check voor:
- Nuance en context
- Culturele gevoeligheid
- Actuele relevantie
- Finale goedkeuring

## Red Flags: Wanneer AI content faalt

### Waarschuwingssignalen
1. **Generic statements**: "In de wereld van vandaag..."
2. **Overuse superlatieven**: Alles is "revolutionair"
3. **Inconsistente tone**: Switching tussen formeel/informeel
4. **Factual errors**: Verouderde of incorrecte info
5. **Cultural missteps**: Ongevoelige of tone-deaf content

### Recovery strategieën

Wanneer content niet aan standaarden voldoet:

**Quick Fix Prompt:**
"Deze content voelt te generiek. Maak het specifieker voor ons merk door:
- Concrete voorbeelden uit onze industrie toe te voegen
- Onze unieke aanpak te benadrukken
- Persoonlijke touch toe te voegen
- Generieke frasen te vervangen"

## Brand Voice Training voor AI

### Creëer een brand voice dataset

Verzamel je beste content voor AI-training:

**Few-shot learning prompt:**
"Hier zijn 3 voorbeelden van perfecte brand voice content:
[Voorbeeld 1]
[Voorbeeld 2]
[Voorbeeld 3]

Analyseer de gemeenschappelijke elementen in:
- Toon en stijl
- Woordkeuze
- Zinsstructuur
- Emotionele impact

Gebruik deze stijl voor: [nieuwe content opdracht]"

### Continuous improvement loop

1. **Collect**: Bewaar excellent examples
2. **Analyze**: Wat maakt ze goed?
3. **Codify**: Vertaal naar AI-instructies
4. **Test**: Probeer met nieuwe content
5. **Refine**: Pas prompts aan based op resultaten

## Tools voor Quality Control

### Automated checking tools
- **Grammarly**: Grammar en tone consistency
- **Hemingway**: Readability scores
- **Brand24**: Brand mention monitoring
- **Copyscape**: Originality checking

### Custom quality metrics

Ontwikkel je eigen KPIs:
- Brand voice consistency score
- Value alignment rating
- Emotional impact measure
- Engagement quality metrics

## Case Study: Voor en Na Brand Guardian

**Voor implementatie:**
- Generic blog post
- Inconsistente tone
- Geen duidelijke brand personality
- Low engagement

**Na implementatie:**
- Unieke brand voice
- Consistente messaging
- Clear personality shines through
- 3x hogere engagement

## Best Practices Checklist

### Pre-AI Generation
- □ Brand guidelines document ready
- □ Voice examples verzameld
- □ Values clearly defined
- □ Vocabulary lijst compleet

### During Generation
- □ Use detailed brand prompts
- □ Generate multiple versies
- □ Check tegen guidelines
- □ Iterate based op feedback

### Post-Generation  
- □ Run quality checks
- □ Human review completed
- □ Track performance
- □ Update guidelines based op learnings

## Conclusie

AI is een krachtig hulpmiddel, maar jouw merkidentiteit is wat je onderscheidt. Door het Brand Guardian Framework te implementeren, kun je de efficiëntie van AI benutten terwijl je je unieke stem behoudt. Remember: AI genereert, jij dirigeert.

Dit was de laatste les van Module 1. Je hebt nu een solide fundament in AI-tools, prompt engineering, workflows en quality control. Klaar om deze kennis in de praktijk te brengen!`,
  codeExamples: [
    {
      id: 'example-1',
      title: 'Complete Brand Voice Guide Template',
      language: 'markdown',
      code: `# [Merk Naam] Brand Voice Guide voor AI

## Voice Personality Profile
**We zijn:** Friendly experts die complexe zaken simpel uitleggen
**We zijn niet:** Intimiderende know-it-alls of vage generalisten

## Voice Dimensions
- Formaliteit: 30% Formeel / 70% Conversational
- Energie: 80% Energiek / 20% Calm
- Humor: 20% Light humor / 80% Serious
- Autoriteit: 60% Expert / 40% Peer

## Schrijfstijl Regels

### Always:
✓ Gebruik "je/jij" voor directe connectie
✓ Start zinnen met actieve werkwoorden
✓ Deel concrete voorbeelden
✓ Schrijf korte, heldere zinnen (max 20 woorden)
✓ Gebruik bullets voor opsommingen

### Never:
✗ Gebruik geen buzzwords zonder uitleg
✗ Schrijf geen zinnen langer dan 2 regels
✗ Vermijd passieve zinconstructies
✗ Geen overdreven claims of superlatieven
✗ Skip de clichés ("cutting-edge", "game-changer")

## Tone per Content Type

### Social Media Posts
- Extra casual en engaging
- Emoji's toegestaan (max 2-3)
- Vraag stellen aan het eind
- Max 3 zinnen

### Blog Articles  
- Informatief maar toegankelijk
- Subheadings elke 150 woorden
- Concrete examples verplicht
- CTA natuurlijk integreren

### Email Newsletters
- Persoonlijk en warm
- Storytelling elementen
- Clear value upfront
- Single focused CTA

## Vocabulary Guide

### Preferred Terms
- "Investering" → niet "Kosten"
- "Uitdaging" → niet "Probleem"
- "Oplossing" → niet "Product"
- "Partner" → niet "Vendor"
- "Reis" → niet "Process"

### Power Words (gebruik spaarzaam)
- Transform
- Unlock
- Accelerate
- Elevate
- Empower

### Banned Words
- Synergy
- Leverage (als werkwoord)
- Disruptive
- Bleeding-edge
- Revolutionary
- Best-in-class`
    },
    {
      id: 'example-2',
      title: 'Quality Control Prompt Chain',
      language: 'markdown',
      code: `# AI Content Quality Control Workflow

## Step 1: Initial Generation
"Schrijf een [content type] over [onderwerp] voor [doelgroep].
Gebruik onze brand voice guide: [plak guide]
Lengte: [woorden]
Doel: [specifiek doel]"

## Step 2: Brand Voice Check
"Evalueer deze content op brand voice consistency:
[Plak gegenereerde content]

Score op:
1. Formaliteit niveau (moet zijn: 30% formeel)
2. Energie level (moet zijn: 80% energiek)
3. Gebruik van preferred vocabulary
4. Algemene brand fit (1-10)

Geef specifieke voorbeelden van wat wel/niet werkt."

## Step 3: Value Alignment Check
"Check of deze content aligned met onze core values:

Content: [plak content]

Onze values:
1. Transparantie - Zijn we open en eerlijk?
2. Innovatie - Tonen we vooruitstrevend denken?
3. Klantfocus - Staat klantwaarde centraal?

Markeer passages die values versterken of verzwakken."

## Step 4: Emotional Impact Assessment
"Lees deze content vanuit klantperspectief:
[content]

Beoogde emoties: Vertrouwen (40%), Inspiratie (30%), Verbondenheid (30%)

1. Welke emoties roept het werkelijk op?
2. Matcht dit onze beoogde mix?
3. Welke zinnen versterken/verzwakken de juiste emoties?"

## Step 5: Final Polish
"Verfijn deze content:
[content na eerdere checks]

Focus op:
- Vervang overgebleven generic phrases
- Versterk brand personality
- Optimize voor [specifiek kanaal]
- Ensure smooth flow en leesbaarheidd
- Add one unique brand element"`
    },
    {
      id: 'example-3',
      title: 'Brand Consistency Scorecard',
      language: 'markdown',
      code: `# Content Quality Scorecard

## Content Details
**Type:** [Blog/Social/Email/etc]
**Topic:** [Onderwerp]
**Author:** [Human/AI/Hybrid]
**Date:** [Datum]

## Brand Voice Score (40 punten)
□ Tone consistency (0-10): ___
□ Vocabulary alignment (0-10): ___
□ Style guide adherence (0-10): ___
□ Personality shine-through (0-10): ___

## Content Quality Score (30 punten)
□ Clarity and structure (0-10): ___
□ Value for audience (0-10): ___
□ Originality/uniqueness (0-10): ___

## Technical Score (20 punten)
□ Grammar and spelling (0-10): ___
□ SEO optimization (0-10): ___

## Emotional Impact Score (10 punten)
□ Desired emotions achieved (0-10): ___

## Total Score: ___/100

## Qualitative Assessment

### Strengths:
- 
- 
- 

### Areas for Improvement:
- 
- 
- 

### Action Items:
1. 
2. 
3. 

## Approval Status
□ Approved as-is
□ Approved with minor edits
□ Needs major revision
□ Rejected - start over

**Reviewer:** ___________
**Date:** ___________`
    }
  ],
  assignments: [
    {
      id: 'assignment-1',
      title: 'Creëer Je Brand Guardian Toolkit',
      type: 'project',
      difficulty: 'medium',
      description: 'Ontwikkel een complete Brand Guardian toolkit voor jouw merk of een merk naar keuze. Include: brand voice guide, vocabulary lists, value statements, en quality control checklists. Test met 3 verschillende content pieces.',
      hints: [
        'Begin met het analyseren van bestaande succesvolle content',
        'Maak je guide specifiek en meetbaar',
        'Test met verschillende content types (social, blog, email)',
        'Vraag collega feedback op consistentie'
      ]
    },
    {
      id: 'assignment-2',
      title: 'AI Content Quality Audit',
      type: 'project',
      difficulty: 'easy',
      description: 'Genereer 5 pieces of content met AI zonder brand guidelines, en 5 met je Brand Guardian framework. Laat anderen blind testen welke content authentieker voelt. Analyseer de verschillen.',
      hints: [
        'Use dezelfde onderwerpen voor eerlijke vergelijking',
        'Vraag testers te scoren op authenticiteit en merkherkenning',
        'Documenteer specifieke verschillen in woordkeuze en toon',
        'Trek conclusies over meest impactvolle brand elements'
      ]
    },
    {
      id: 'assignment-3',
      title: 'Build Your Quality Control Workflow',
      type: 'project',
      difficulty: 'medium',
      description: 'Design een step-by-step quality control workflow voor AI-generated content. Include checkpoints, tools, en decision criteria. Implementeer voor één week en evalueer effectiveness.',
      hints: [
        'Start simpel met 3-5 checkpoints',
        'Gebruik zowel automated tools als human review',
        'Maak go/no-go criteria expliciet',
        'Track tijd per review om efficiency te meten'
      ]
    }
  ],
  resources: [
    {
      title: 'Brand Voice Guide Examples',
      url: 'https://www.examples.com/business/brand-voice.html',
      type: 'reference'
    },
    {
      title: 'Grammarly Business for Brand Consistency',
      url: 'https://www.grammarly.com/business/brand-tones',
      type: 'tool'
    },
    {
      title: 'Content Marketing Institute - Brand Guidelines',
      url: 'https://contentmarketinginstitute.com/articles/brand-style-guide-examples/',
      type: 'guide'
    },
    {
      title: 'Writer.com - AI Brand Governance',
      url: 'https://writer.com/product/brand-governance/',
      type: 'platform'
    },
    {
      title: 'Frontify Brand Guidelines Platform',
      url: 'https://www.frontify.com/en/',
      type: 'tool'
    }
  ]
};