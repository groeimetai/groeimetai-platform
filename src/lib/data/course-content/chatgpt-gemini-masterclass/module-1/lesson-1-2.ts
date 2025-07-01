import type { Lesson } from '@/lib/data/courses'

export const lesson1_2: Lesson = {
  id: 'lesson-1-2',
  title: 'Gemini 2.5 model familie: Pro, Flash en Deep Think',
  duration: '60 minuten',
  content: `# Gemini 2.5 Model Familie

## De Gemini 2.5 Revolutie

Google's Gemini 2.5 familie biedt unieke mogelijkheden die ChatGPT aanvullen, vooral op het gebied van multimodale taken en context window grootte.

### Gemini 2.5 Flash
- **Context window**: 1 miljoen tokens (!!)
- **Snelheid**: Ultra-snel, <2 seconden
- **Kosten**: Gratis tier beschikbaar
- **Beste voor**: 
  - Lange documenten analyseren
  - Multimodale taken (tekst + afbeeldingen)
  - Real-time applicaties
  - Bulk processing

### Gemini 2.5 Pro
- **Context window**: 2 miljoen tokens (!!!!)
- **Snelheid**: 5-10 seconden
- **Kosten**: $20/maand (Gemini Advanced)
- **Beste voor**:
  - Complete codebases analyseren
  - Boeken en rapporten verwerken
  - Complexe research projecten
  - Video analyse

### Deep Think Mode (Experimental)
- **Denkproces**: Tot 5 minuten deliberatie
- **Use cases**: Complexe problemen die deep reasoning vereisen
- **Uniek**: Toont het volledige denkproces
- **Vergelijkbaar met**: OpenAI o1, maar met transparantie

## Het Context Window Voordeel

### Wat betekent 1-2 miljoen tokens?
\`\`\`
1 miljoen tokens ≈
- 750.000 woorden
- 1.500 pagina's tekst
- Een complete codebase
- 10 uur aan transcripties

2 miljoen tokens ≈
- Harry Potter serie (2x)
- Een technisch handboek
- Maanden aan chat geschiedenis
- Meerdere boeken tegelijk
\`\`\`

### Praktische toepassingen:

#### Document Analyse
\`\`\`
Prompt voor Gemini 2.5 Pro:
"Ik upload mijn complete jaarverslag (500 pagina's).
Analyseer:
1. Alle financiële trends
2. Risico's en kansen
3. Vergelijk met vorig jaar (ook uploaded)
4. Genereer executive summary
5. Identificeer inconsistenties"
\`\`\`

#### Codebase Review
\`\`\`
"Hier is onze complete React applicatie.
- Identificeer security vulnerabilities
- Vind performance bottlenecks
- Suggereer refactoring opportunities
- Check voor best practice violations
- Genereer updated documentatie"
\`\`\`

## Multimodale Superkrachten

### Gemini's unieke mogelijkheden:

1. **Video Analyse**
   - Upload tot 1 uur video
   - Frame-by-frame analyse
   - Audio transcriptie + visual understanding

2. **Document + Image Combinaties**
   - Technische diagrammen begrijpen
   - Handgeschreven notities transcriberen
   - UI/UX designs analyseren

3. **Real-time Processing**
   - Live data streams
   - Continuous monitoring
   - Instant feedback loops

## Deep Think Mode Begrijpen

### Wanneer Deep Think gebruiken:
\`\`\`
✓ Wiskundige bewijzen
✓ Complexe debugging
✓ Strategische planning
✓ Wetenschappelijke hypotheses
✓ Architectuur beslissingen

✗ Simpele vragen
✗ Creatief schrijven
✗ Tijdgevoelige taken
\`\`\`

### Deep Think Prompt Template:
\`\`\`
"Gebruik Deep Think mode om dit probleem op te lossen:

Context: [Gedetailleerde achtergrond]
Probleem: [Specifieke uitdaging]
Constraints: [Beperkingen en vereisten]

Toon je volledige redeneerproces inclusief:
- Aannames die je maakt
- Verschillende benaderingen overwogen
- Waarom je bepaalde paden verwerpt
- Stap-voor-stap naar de oplossing"
\`\`\``,
  codeExamples: [
    {
      id: 'example-1',
      title: 'Gemini API voor grote context',
      language: 'python',
      code: `import google.generativeai as genai
import PyPDF2
import time

# Configureer Gemini
genai.configure(api_key="your-api-key")

# Functie voor grote document analyse
def analyze_large_document(file_path, model_name="gemini-2.5-pro"):
    # Kies model op basis van document grootte
    if get_file_size(file_path) > 1_000_000:  # 1MB
        model = genai.GenerativeModel('gemini-2.5-pro')
        print("Gebruik Gemini 2.5 Pro voor grote context")
    else:
        model = genai.GenerativeModel('gemini-2.5-flash')
        print("Gebruik Gemini 2.5 Flash voor snelheid")
    
    # Upload en analyseer
    uploaded_file = genai.upload_file(file_path)
    
    prompt = """
    Analyseer dit document volledig:
    1. Hoofdthema's en kernboodschappen
    2. Structuur en organisatie
    3. Belangrijkste inzichten
    4. Actionable recommendations
    5. Ontbrekende informatie of gaps
    
    Wees zeer gedetailleerd in je analyse.
    """
    
    response = model.generate_content([prompt, uploaded_file])
    return response.text

# Multimodale analyse
def analyze_presentation_with_slides(pdf_path, notes_path):
    model = genai.GenerativeModel('gemini-2.5-pro')
    
    # Upload beide bestanden
    slides = genai.upload_file(pdf_path)
    notes = genai.upload_file(notes_path)
    
    prompt = """
    Combineer de slides en speaker notes om:
    1. Een volledig presentation script te genereren
    2. Timing suggesties per slide
    3. Verbeterpunten voor visualisaties
    4. Q&A voorbereiding
    """
    
    response = model.generate_content([prompt, slides, notes])
    return response.text

# Deep Think simulatie
def deep_think_problem(problem_statement):
    model = genai.GenerativeModel('gemini-2.5-pro')
    
    # Forceer diepgaande analyse met chain-of-thought
    prompt = f"""
    Los dit probleem op met deep thinking approach:
    
    {problem_statement}
    
    BELANGRIJKE INSTRUCTIES:
    1. Begin met het identificeren van alle aannames
    2. Overweeg minstens 3 verschillende benaderingen
    3. Evalueer elke benadering kritisch
    4. Toon je volledige redeneerproces
    5. Kom tot een weloverwogen conclusie
    
    Denk hardop en wees zeer uitgebreid in je analyse.
    """
    
    start_time = time.time()
    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            temperature=0.1,  # Lage temperature voor reasoning
            max_output_tokens=8192,  # Ruimte voor uitgebreide analyse
        )
    )
    thinking_time = time.time() - start_time
    
    print(f"Denktijd: {thinking_time:.2f} seconden")
    return response.text`,
      explanation: 'Deze code demonstreert hoe je Gemini\'s grote context window en multimodale capaciteiten optimaal benut.'
    },
    {
      id: 'example-2',
      title: 'Model selectie strategie voor Gemini',
      language: 'typescript',
      code: `interface GeminiTask {
  contextSize: number;  // in tokens
  hasMedia: boolean;
  requiresSpeed: boolean;
  complexity: 'simple' | 'moderate' | 'complex' | 'extreme';
}

class GeminiModelSelector {
  static selectModel(task: GeminiTask): {
    model: string;
    reasoning: string;
    config: any;
  } {
    // Deep Think voor extreme complexiteit
    if (task.complexity === 'extreme') {
      return {
        model: 'gemini-2.5-pro-deep-think',
        reasoning: 'Deep thinking mode voor complexe reasoning',
        config: {
          temperature: 0.1,
          thinkingTime: 'extended',
          showReasoning: true
        }
      };
    }
    
    // Flash voor snelheid met redelijke context
    if (task.requiresSpeed && task.contextSize < 1_000_000) {
      return {
        model: 'gemini-2.5-flash',
        reasoning: 'Flash voor snelle respons met grote context',
        config: {
          temperature: 0.7,
          maxOutputTokens: 4096,
          topP: 0.9
        }
      };
    }
    
    // Pro voor maximale context of media
    if (task.contextSize > 1_000_000 || task.hasMedia) {
      return {
        model: 'gemini-2.5-pro',
        reasoning: 'Pro voor enormous context of multimodale taken',
        config: {
          temperature: 0.5,
          maxOutputTokens: 8192,
          topP: 0.95
        }
      };
    }
    
    // Default naar Flash
    return {
      model: 'gemini-2.5-flash',
      reasoning: 'Flash als efficiënte standaard',
      config: {
        temperature: 0.7,
        maxOutputTokens: 4096
      }
    };
  }
}

// Praktijkvoorbeelden
const videoAnalysis: GeminiTask = {
  contextSize: 500_000,
  hasMedia: true,
  requiresSpeed: false,
  complexity: 'moderate'
};
console.log(GeminiModelSelector.selectModel(videoAnalysis));
// Output: gemini-2.5-pro voor media verwerking

const quickSummary: GeminiTask = {
  contextSize: 10_000,
  hasMedia: false,
  requiresSpeed: true,
  complexity: 'simple'
};
console.log(GeminiModelSelector.selectModel(quickSummary));
// Output: gemini-2.5-flash voor snelheid`,
      explanation: 'Een intelligente selector die het optimale Gemini model kiest op basis van taakvereisten.'
    }
  ],
  assignments: [
    {
      id: 'assignment-1-2-1',
      title: 'Context Window Experiment',
      description: 'Test de grenzen van Gemini\'s context window en vergelijk de prestaties.',
      difficulty: 'hard',
      type: 'project',
      initialCode: `// 1. Verzamel 3-5 grote documenten (PDFs, lange artikelen, of code).
// 2. Upload ze samen naar Gemini 2.5 Pro.
// 3. Vraag om een cross-document analyse en zoek naar verbanden.
// 4. Test hoeveel context je kunt uploaden voordat je een limiet bereikt.
// 5. Vergelijk de kwaliteit van de analyse bij verschillende contextgroottes.
`,
      hints: [
        'Gebruik documenten over gerelateerde onderwerpen om de cross-document analyse te testen.',
        'Let op de responstijd bij het vergroten van de context.',
        'Probeer specifieke vragen te stellen die informatie uit meerdere documenten vereisen.'
      ]
    },
    {
      id: 'assignment-1-2-2',
      title: 'Multimodale Masterclass',
      description: 'Ontdek Gemini\'s unieke multimodale capaciteiten door verschillende media te combineren.',
      difficulty: 'medium',
      type: 'project',
      initialCode: `// 1. Maak screenshots van een complexe applicatie of website.
// 2. Upload deze samen met design documenten naar Gemini.
// 3. Vraag om een UI/UX analyse en verbetervoorstellen.
// 4. Test video analyse: upload een instructievideo en vraag om een geschreven tutorial.
// 5. Vergelijk de resultaten met wat mogelijk is in ChatGPT.
`,
      hints: [
        'Zorg voor afbeeldingen van hoge kwaliteit voor de beste resultaten.',
        'Combineer tekst en afbeeldingen in je prompts voor complexere taken.',
        'Experimenteer met het stellen van vragen over specifieke frames in een video.'
      ]
    },
    {
      id: 'assignment-1-2-3',
      title: 'ChatGPT vs Gemini Shootout',
      description: 'Een directe vergelijking voor verschillende use cases om de sterktes van elk model te bepalen.',
      difficulty: 'medium',
      type: 'project',
      initialCode: `// 1. Identificeer 5 taken uit je dagelijkse workflow.
// 2. Test elke taak in zowel ChatGPT (o3) als Gemini (2.5 Pro).
// 3. Evalueer op: snelheid, accuraatheid, bruikbaarheid, en kosten.
// 4. Maak een beslismatrix: welk model voor welke taak.
// 5. Ontwikkel een hybrid workflow die beide platforms optimaal benut.
`,
      hints: [
        'Kies taken die de verschillende capaciteiten van de modellen testen (bijv. creativiteit, redeneren, code generatie).',
        'Wees objectief in je evaluatie en gebruik een score-systeem.',
        'Denk na over hoe je de sterke punten van beide modellen kunt combineren in één workflow.'
      ]
    }
  ]
}