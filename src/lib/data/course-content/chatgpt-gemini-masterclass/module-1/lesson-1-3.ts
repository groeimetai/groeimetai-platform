import type { Lesson } from '@/lib/data/courses'

export const lesson1_3: Lesson = {
  id: 'lesson-1-3',
  title: 'Reasoning en chain-of-thought',
  duration: '60 minuten',
  content: `# Reasoning en chain-of-thought

## De evolutie van AI reasoning

Met de introductie van o3 en Gemini's thinking mode hebben AI-modellen een enorme sprong gemaakt in hun vermogen om complex te redeneren. Deze les verkent de nieuwste ontwikkelingen en hoe je ze optimaal kunt benutten.

## OpenAI o3's reasoning capabilities

### Wat maakt o3 bijzonder?

o3 representeert een paradigmaverschuiving in AI-reasoning:

- **Deliberative reasoning**: o3 "denkt" daadwerkelijk na voordat het antwoordt
- **Private chain of thought**: Interne redeneerstappen die niet zichtbaar zijn
- **Compute scaling**: Meer denktijd = betere resultaten
- **ARC-AGI benchmark**: Haalt 87.5% op tests voor algemene intelligentie

### Praktische toepassingen van o3

#### Complex probleem oplossen
\`\`\`
Prompt: "Een trein vertrekt om 14:23 uit Amsterdam naar Parijs (480 km). 
De eerste helft rijdt hij 120 km/u, de tweede helft 160 km/u. 
Er zijn twee stops van elk 12 minuten. Hoe laat komt de trein aan?"

o3 zal:
1. De afstanden berekenen (240 km per deel)
2. Reistijden uitrekenen (2u + 1.5u = 3.5u)
3. Stops optellen (24 min)
4. Totaal: 3u 54min
5. Aankomst: 18:17
\`\`\`

#### Wetenschappelijk redeneren
\`\`\`
Prompt: "Als we aannemen dat donkere materie bestaat uit axionen met massa 
10^-5 eV, wat zou de De Broglie golflengte zijn bij typische galactische 
snelheden (220 km/s)? Wat betekent dit voor detectie?"

o3 redeneert door:
- Natuurkundige principes toepassen
- Berekeningen stap voor stap uitvoeren
- Implicaties voor experimenten afleiden
\`\`\`

## Gemini's thinking mode

### Flash Thinking: Zichtbaar redeneren

Gemini 2.0 Flash introduceert een transparante benadering:

- **Zichtbare gedachtestroom**: Je ziet hoe het model redeneert
- **20.000+ tokens reasoning**: Uitgebreide denkprocessen
- **Snelle respons**: Ondanks diep nadenken blijft het snel
- **Kostenefficiënt**: $0.15 per miljoen tokens

### Thinking mode activeren

\`\`\`
# In de Gemini interface
Klik op het model dropdown → Selecteer "Gemini 2.0 Flash (Thinking)"

# Via API
model = "gemini-2.0-flash-thinking-exp"
\`\`\`

### Voorbeelden van Gemini thinking

#### Logisch puzzel
\`\`\`
User: "Er zijn 3 huizen: rood, blauw en groen. De Engelsman woont niet 
in het rode huis. De Spanjaard heeft een hond. De persoon in het blauwe 
huis heeft een kat. De Fransman woont naast de persoon met de hond. 
Wie woont waar en welk huisdier hebben ze?"

<thinking>
Laat me dit stap voor stap oplossen...
- 3 huizen: rood, blauw, groen
- 3 nationaliteiten: Engels, Spaans, Frans
- Minimaal 2 huisdieren: hond, kat

Constraint 1: Engelsman niet in rood huis
Constraint 2: Spanjaard heeft hond
Constraint 3: Blauw huis heeft kat
Constraint 4: Fransman woont naast persoon met hond

Als Spanjaard hond heeft, en Fransman naast hond woont...
[verdere reasoning stappen]
</thinking>

Oplossing: 
- Rood huis: Spanjaard met hond
- Blauw huis: Fransman met kat  
- Groen huis: Engelsman met [derde huisdier]
\`\`\`

## Chain-of-thought prompting technieken

### Expliciete CoT prompting

#### Zero-shot CoT
\`\`\`
"Los dit probleem stap voor stap op:"
"Denk hier zorgvuldig over na en leg je reasoning uit:"
"Laten we dit systematisch aanpakken:"
\`\`\`

#### Few-shot CoT
\`\`\`
Voorbeeld 1:
Vraag: "Als ik 3 appels heb en er 2 weggeef, hoeveel hou ik over?"
Reasoning: Ik begin met 3 appels → Geef 2 weg → 3 - 2 = 1
Antwoord: 1 appel

Nu jouw vraag:
Vraag: "Als ik 8 peren heb en de helft weggeef, hoeveel hou ik over?"
\`\`\`

### Geavanceerde CoT strategieën

#### Tree of Thoughts (ToT)
\`\`\`
"Genereer 3 verschillende benaderingen voor dit probleem.
Evalueer elk op haalbaarheid.
Kies de beste en werk deze volledig uit."
\`\`\`

#### Self-consistency
\`\`\`
"Los dit probleem op 3 verschillende manieren op.
Vergelijk de antwoorden.
Als ze verschillen, identificeer waar de fout zit."
\`\`\`

#### Recursive reasoning
\`\`\`
"Breek dit complexe probleem op in subproblemen.
Los elk subprobleem op.
Combineer de oplossingen voor het eindantwoord."
\`\`\`

## Praktische voorbeelden

### Voorbeeld 1: Bedrijfsstrategie
\`\`\`
Prompt voor o3/Gemini thinking:
"Een startup heeft €500k funding, 5 medewerkers, en een SaaS product 
met 100 betalende klanten (€50/maand per klant). Burn rate is €40k/maand.
Ze kunnen:
A) 3 developers aannemen voor snellere ontwikkeling
B) Marketing budget verdubbelen
C) Enterprise features bouwen

Analyseer elke optie en adviseer met reasoning."
\`\`\`

### Voorbeeld 2: Technische architectuur
\`\`\`
Prompt: "Ontwerp een schaalbare architectuur voor een real-time 
collaboratie app (zoals Figma). Requirements:
- 10k gelijktijdige gebruikers
- <100ms latency
- Offline-first
- Conflict resolution

Denk na over trade-offs en leg je keuzes uit."
\`\`\`

### Voorbeeld 3: Ethisch dilemma
\`\`\`
Prompt: "Een zelfrijdende auto detecteert 5 mensen op de weg. 
Uitwijken betekent 1 persoon op het trottoir raken. 
Rechtdoor betekent mogelijk 5 slachtoffers.
Analyseer dit dilemma vanuit verschillende ethische frameworks."
\`\`\`

## Best practices voor reasoning

### Do's
- ✅ Vraag om stapsgewijze uitleg
- ✅ Moedig het model aan fouten te corrigeren
- ✅ Gebruik "denk hardop" instructies
- ✅ Vraag om alternatieve benaderingen
- ✅ Laat assumptions expliciet maken

### Don'ts
- ❌ Onderbreek het denkproces
- ❌ Forceer een specifiek antwoord
- ❌ Sla reasoning stappen over
- ❌ Accepteer het eerste antwoord zonder verificatie

## Reasoning voor verschillende use cases

### Wiskunde & Wetenschap
- Stapsgewijze afleidingen
- Verificatie van berekeningen
- Hypothese testing
- Experimenteel design

### Programmeren
- Algoritme ontwikkeling
- Bug analysis
- Performance optimalisatie
- Architecture decisions

### Business & Strategie
- SWOT analyses
- Scenario planning
- Risk assessment
- Decision trees

### Creatief werk
- Plot ontwikkeling
- Karakter motivaties
- Wereldbouw consistentie
- Thematische coherentie`,
  codeExamples: [
    {
      id: 'example-1',
      title: 'Chain-of-thought voor complexe berekening',
      language: 'text',
      code: `Prompt: "Een investeerder heeft €100.000 en wil dit verdelen over 3 fondsen:
- Fonds A: Verwacht rendement 8%, risico 15%
- Fonds B: Verwacht rendement 12%, risico 25%  
- Fonds C: Verwacht rendement 5%, risico 8%

Hij wil maximaal 18% portfolio risico en minimaal 9% verwacht rendement.
Wat is de optimale verdeling?"

AI Reasoning:
Stap 1: Definieer variabelen
- x = fractie in Fonds A
- y = fractie in Fonds B
- z = fractie in Fonds C
- x + y + z = 1

Stap 2: Stel constraints op
- Portfolio rendement: 8x + 12y + 5z ≥ 9
- Portfolio risico: √(15²x² + 25²y² + 8²z²) ≤ 18
- Som constraint: x + y + z = 1
- Non-negativiteit: x,y,z ≥ 0

Stap 3: Vereenvoudig portfolio risico (aangenomen geen correlatie)
- 225x² + 625y² + 64z² ≤ 324

Stap 4: Gebruik z = 1 - x - y om te reduceren tot 2 variabelen
- Rendement: 8x + 12y + 5(1-x-y) ≥ 9
- Vereenvoudigd: 3x + 7y ≥ 4

Stap 5: Test grensgevallen
- Als y = 0: x ≥ 4/3 (onmogelijk want x ≤ 1)
- Als x = 0: y ≥ 4/7 ≈ 0.57
- Balans nodig tussen A en B

Stap 6: Optimalisatie via Lagrange of numeriek
- Optimaal: x ≈ 0.30, y ≈ 0.35, z ≈ 0.35
- Check: Rendement = 9.05% ✓
- Check: Risico = 17.8% ✓

Advies: 30% in Fonds A, 35% in Fonds B, 35% in Fonds C`,
      explanation: 'Dit toont hoe AI stap voor stap een complex optimalisatieprobleem oplost met expliciete reasoning.'
    },
    {
      id: 'example-2',
      title: 'Gemini thinking mode voor debugging',
      language: 'text',
      code: `User: "Deze Python functie geeft soms verkeerde resultaten. Wat is er mis?"

def calculate_average(numbers):
    total = 0
    for i in range(len(numbers)):
        total += numbers[i]
    return total / len(numbers) - 1

<thinking>
Laat me deze functie analyseren:

1. Functie naam: calculate_average - suggereert gemiddelde berekening
2. Loop: telt alle getallen op - dat klopt
3. Return statement: total / len(numbers) - 1

Wacht, hier zit de fout! Het berekent:
(som van getallen / aantal) - 1

Maar een gemiddelde is gewoon: som / aantal

Die "- 1" hoort er niet bij. Misschien verwarring met:
- Zero-indexed arrays (maar dat is hier niet relevant)
- Andere formule zoals variantie

De fout zorgt ervoor dat het gemiddelde altijd 1 te laag is.
</thinking>

Ik zie het probleem! In de return statement staat:
\`return total / len(numbers) - 1\`

Die \`- 1\` aan het einde hoort er niet bij. De functie trekt nu altijd 1 af van het gemiddelde.

De correcte versie zou zijn:
\`\`\`python
def calculate_average(numbers):
    total = 0
    for i in range(len(numbers)):
        total += numbers[i]
    return total / len(numbers)  # Geen -1!
\`\`\`

Of nog pythonischer:
\`\`\`python
def calculate_average(numbers):
    return sum(numbers) / len(numbers) if numbers else 0
\`\`\``,
      explanation: 'Gemini thinking mode laat je zien hoe het model stap voor stap het probleem analyseert.'
    }
  ],
  assignments: [
    {
      id: 'assignment-1-3-1',
      title: 'Reasoning Challenge',
      description: 'Test de reasoning capabilities van verschillende modellen met een complexe puzzel.',
      difficulty: 'hard',
      type: 'project',
      initialCode: `// Probleem: Een logische puzzel naar keuze (bijv. Einstein's Riddle).

// 1. Test hetzelfde probleem op ChatGPT (met CoT prompting) en Gemini thinking mode.
// 2. Documenteer de verschillen in aanpak en resultaat.
// 3. Analyseer de redeneerstappen van elk model.
// 4. Probeer het probleem moeilijker te maken tot een model faalt.
`,
      hints: [
        'Kies een puzzel die meerdere stappen van logisch redeneren vereist.',
        'Let op hoe elk model omgaat met onzekerheid en aannames.',
        'Vergelijk de helderheid en correctheid van de redeneerprocessen.'
      ]
    }
  ],
  resources: [
    {
      title: 'OpenAI o3 Announcement',
      url: 'https://openai.com/blog/o3-announcement',
      type: 'article'
    },
    {
      title: 'Gemini 2.0 Flash Thinking Documentation',
      url: 'https://ai.google.dev/gemini/thinking',
      type: 'documentation'
    }
  ]
}