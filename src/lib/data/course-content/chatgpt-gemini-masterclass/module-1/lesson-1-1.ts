import type { Lesson } from '@/lib/data/courses'

export const lesson1_1: Lesson = {
  id: 'lesson-1-1',
  title: 'Model selectie en capabilities (ChatGPT o3 familie)',
  duration: '60 minuten',
  content: `# Model selectie en capabilities: ChatGPT o3 familie

## De o3 Model Familie

OpenAI's o3 familie vertegenwoordigt de nieuwste generatie AI-modellen met ongekende mogelijkheden voor complexe redenering en probleemoplossing.

### o3-mini: Snelle intelligentie
- **Gebruik voor**: Dagelijkse taken, snelle analyses, creatief schrijven
- **Responstijd**: 2-5 seconden
- **Kosten**: $15-20/maand (ChatGPT Plus)
- **Context window**: 128K tokens
- **Sterke punten**: 
  - Uitstekende balans snelheid/kwaliteit
  - Ideaal voor iteratieve werkprocessen
  - Lage latency voor real-time toepassingen

### o3: De gouden standaard
- **Gebruik voor**: Complexe analyses, programmeren, wetenschappelijke vraagstukken
- **Responstijd**: 10-30 seconden
- **Kosten**: Inbegrepen in ChatGPT Plus
- **Context window**: 128K tokens
- **Sterke punten**:
  - Superieure redeneervaardigheden
  - Uitstekend in multi-step problemen
  - Betrouwbare code generatie

### o3-pro: Maximale intelligentie
- **Gebruik voor**: Onderzoek, complexe wiskunde, architectuur design
- **Responstijd**: 1-5 minuten
- **Kosten**: $200/maand (ChatGPT Pro)
- **Context window**: 128K tokens
- **Sterke punten**:
  - State-of-the-art prestaties
  - Doorbraak in wetenschappelijke problemen
  - Diepgaande analyse mogelijkheden

## Wanneer welk model gebruiken?

### o3-mini is ideaal voor:
\`\`\`
- Email drafts en communicatie
- Basis data-analyse
- Content brainstorming
- Eenvoudige scripts en automatisering
- Klantenservice responses
\`\`\`

### o3 is perfect voor:
\`\`\`
- Software development
- Business strategieën
- Technische documentatie
- Data science projecten
- Complexe troubleshooting
\`\`\`

### o3-pro excelleert in:
\`\`\`
- Wetenschappelijk onderzoek
- Wiskundige bewijzen
- Systeem architectuur
- Machine learning model design
- Innovatieve probleemoplossing
\`\`\`

## Praktische model selectie strategie

### De 3-stappen aanpak:
1. **Start met o3-mini** voor verkenning en eerste ideeën
2. **Schakel naar o3** voor implementatie en verfijning
3. **Gebruik o3-pro** alleen voor de meest complexe uitdagingen

### Kosten-effectieve workflow:
\`\`\`
Voorbeeld: Een nieuwe feature ontwikkelen

1. o3-mini: "Brainstorm 5 manieren om gebruikersauthenticatie te verbeteren"
   → Snel overzicht van opties

2. o3: "Implementeer een two-factor authenticatie systeem met SMS en TOTP"
   → Gedetailleerde code en architectuur

3. o3-pro: "Analyseer de security implications en edge cases van onze 2FA implementatie"
   → Diepgaande security audit
\`\`\``,
  codeExamples: [
    {
      id: 'example-1',
      title: 'API Request voor verschillende modellen',
      language: 'python',
      code: `from openai import OpenAI
import time

client = OpenAI(api_key="your-api-key")

# o3-mini: Snelle respons
def quick_analysis(prompt):
    start = time.time()
    response = client.chat.completions.create(
        model="o3-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )
    print(f"Response tijd: {time.time() - start:.2f}s")
    return response.choices[0].message.content

# o3: Gebalanceerde aanpak
def balanced_analysis(prompt):
    response = client.chat.completions.create(
        model="o3",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
        max_tokens=4000
    )
    return response.choices[0].message.content

# o3-pro: Maximale intelligentie (simulatie)
def deep_analysis(prompt):
    # Let op: o3-pro is alleen beschikbaar via ChatGPT Pro interface
    print("o3-pro analyse wordt uitgevoerd...")
    # Gebruik chain-of-thought prompting voor beste resultaten
    cot_prompt = f"""
    Analyseer dit probleem stap voor stap:
    {prompt}
    
    1. Identificeer alle relevante factoren
    2. Overweeg verschillende benaderingen
    3. Evalueer trade-offs
    4. Presenteer de optimale oplossing
    """
    # In praktijk: gebruik ChatGPT Pro interface
    return "Gebruik ChatGPT Pro voor o3-pro toegang"`,
      explanation: 'Deze code toont hoe je verschillende modellen kunt aanroepen via de API. Voor o3-pro is momenteel alleen de ChatGPT Pro interface beschikbaar.'
    },
    {
      id: 'example-2',
      title: 'Model selectie beslisboom',
      language: 'typescript',
      code: `interface Task {
  complexity: 'low' | 'medium' | 'high' | 'extreme';
  timeConstraint: 'immediate' | 'minutes' | 'hours';
  accuracy: 'good' | 'excellent' | 'perfect';
  budget: 'low' | 'medium' | 'high';
}

function selectOptimalModel(task: Task): string {
  // o3-mini voor snelle, eenvoudige taken
  if (task.complexity === 'low' && task.timeConstraint === 'immediate') {
    return 'o3-mini';
  }
  
  // o3-pro voor extreme complexiteit zonder tijdsdruk
  if (task.complexity === 'extreme' && task.accuracy === 'perfect' && 
      task.budget === 'high') {
    return 'o3-pro';
  }
  
  // o3 als standaard voor de meeste taken
  return 'o3';
}

// Praktijkvoorbeelden
const emailTask: Task = {
  complexity: 'low',
  timeConstraint: 'immediate',
  accuracy: 'good',
  budget: 'low'
};
console.log(selectOptimalModel(emailTask)); // o3-mini

const researchTask: Task = {
  complexity: 'extreme',
  timeConstraint: 'hours',
  accuracy: 'perfect',
  budget: 'high'
};
console.log(selectOptimalModel(researchTask)); // o3-pro`,
      explanation: 'Een praktische beslisboom helpt bij het kiezen van het juiste model op basis van taakvereisten.'
    }
  ],
  assignments: [
    {
      id: 'assignment-1-1-1',
      title: 'Model vergelijking in de praktijk',
      description: 'Test dezelfde complexe vraag met verschillende modellen en analyseer de resultaten.',
      difficulty: 'medium',
      type: 'project',
      initialCode: `// Vraag: "Ontwerp een schaalbare microservices architectuur voor een e-commerce platform"

// 1. Stel de vraag aan o3-mini en noteer de responstijd en kwaliteit.
// 2. Herhaal met o3 en vergelijk de diepgang van het antwoord.
// 3. (Optioneel) Test met o3-pro en analyseer de verschillen.
// 4. Maak een vergelijkingstabel: responstijd, detailniveau, bruikbaarheid, kosten-effectiviteit.
`,
      hints: [
        'Gebruik een stopwatch om de responstijd te meten.',
        'Let op de specifieke technologieën en patterns die elk model voorstelt.',
        'Beoordeel hoe compleet en direct toepasbaar de voorgestelde architectuur is.'
      ]
    },
    {
      id: 'assignment-1-1-2',
      title: 'Ontwikkel een model selectie strategie',
      description: 'Creëer een persoonlijke beslismatrix voor jouw use cases.',
      difficulty: 'easy',
      type: 'project',
      initialCode: `// 1. Lijst 10 taken op die je regelmatig met AI uitvoert.
// 2. Categoriseer elke taak op complexiteit (1-10) en tijdsgevoeligheid.
// 3. Bepaal voor elke taak het optimale model (o3-mini, o3, o3-pro).
// 4. Bereken de geschatte maandelijkse kosten bij jouw gebruikspatroon.
// 5. Identificeer taken waar je kosten kunt besparen zonder kwaliteitsverlies.
`,
      hints: [
        'Denk aan zowel professionele als persoonlijke taken.',
        'Gebruik de prijsinformatie uit de les om een kostenschatting te maken.',
        'Wees realistisch over de benodigde kwaliteit voor elke taak.'
      ]
    }
  ]
}