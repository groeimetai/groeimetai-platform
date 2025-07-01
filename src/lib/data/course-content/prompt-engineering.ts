import { Module } from '@/lib/data/courses'

const promptEngineeringModules: Module[] = [
  {
    id: 'module-1',
    title: 'Introductie tot Large Language Models (LLMs)',
    description: 'Ontdek hoe LLMs werken, hun mogelijkheden en beperkingen',
    lessons: [
      {
        id: 'lesson-1-1',
        title: 'Wat zijn Large Language Models?',
        duration: '15 min',
        content: `
# Wat zijn Large Language Models?

Large Language Models (LLMs) zijn AI-systemen die getraind zijn op enorme hoeveelheden tekst om menselijke taal te begrijpen en te genereren.

## Kernconcepten

### 1. Training
LLMs worden getraind door:
- **Voorspellen van het volgende woord** in miljoenen teksten
- **Pattern herkenning** in taalstructuren
- **Context begrijpen** over meerdere zinnen

### 2. Parameters
- GPT-3: 175 miljard parameters
- GPT-4: >1 biljoen parameters (geschat)
- Claude 3: Vergelijkbaar met GPT-4

### 3. Capabilities
- Tekstgeneratie
- Vertaling
- Samenvatten
- Code schrijven
- Redeneren
- En veel meer!

## Belangrijke LLMs in 2024

1. **OpenAI GPT-4**: De standaard voor algemene AI-taken
2. **Anthropic Claude 3**: Focus op veiligheid en lange context
3. **Google Gemini**: Multimodaal (tekst + beeld)
4. **Meta LLaMA**: Open-source alternatieven

## Beperkingen om te onthouden

⚠️ **Hallucinaties**: LLMs kunnen overtuigend onjuiste informatie genereren
⚠️ **Geen real-time kennis**: Training data heeft een cutoff datum
⚠️ **Context limieten**: Er is een maximum aan hoeveel tekst ze kunnen verwerken
⚠️ **Bias**: Reflecteren biases uit training data
        `,
        codeExamples: [
          {
            id: 'example-1',
            title: 'Simpele API Call naar OpenAI',
            language: 'python',
            code: `import openai

# Configureer je API key
openai.api_key = "jouw-api-key"

# Maak een simpele request
response = openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "user", "content": "Wat is de hoofdstad van Nederland?"}
    ]
)

print(response.choices[0].message.content)
# Output: De hoofdstad van Nederland is Amsterdam.`,
            explanation: 'Dit is de meest basale manier om met een LLM te communiceren via een API.'
          }
        ],
        assignments: [
          {
            id: 'assignment-1-1',
            title: 'Vergelijk LLM Outputs',
            description: 'Stel dezelfde vraag aan verschillende LLMs en vergelijk de antwoorden.',
            difficulty: 'easy',
            type: 'quiz',
            initialCode: `# Probeer deze vraag bij verschillende AI tools:
# "Leg in 3 zinnen uit wat fotosynthese is"

# ChatGPT antwoord:
chatgpt_response = ""

# Claude antwoord:
claude_response = ""

# Gemini antwoord:
gemini_response = ""

# Analyseer de verschillen:
# - Welke is het meest wetenschappelijk accuraat?
# - Welke is het makkelijkst te begrijpen?
# - Welke geeft de meeste details?`,
            hints: [
              'Let op de schrijfstijl van elke AI',
              'Kijk naar de gebruikte voorbeelden',
              'Check of alle kernpunten genoemd worden'
            ]
          }
        ],
        resources: [
          {
            title: 'OpenAI Documentation',
            url: 'https://platform.openai.com/docs',
            type: 'documentation'
          },
          {
            title: 'Anthropic Claude Intro',
            url: 'https://www.anthropic.com/claude',
            type: 'article'
          }
        ]
      },
      {
        id: 'lesson-1-2',
        title: 'Hoe werkt text generation?',
        duration: '20 min',
        content: `
# Hoe werkt Text Generation?

LLMs genereren tekst door het voorspellen van het meest waarschijnlijke volgende woord (token) gegeven de context.

## Het Generation Process

### 1. Tokenization
Tekst wordt opgedeeld in tokens (delen van woorden):
- "Hallo wereld" → ["Hal", "lo", " wer", "eld"]
- Elk token heeft een uniek ID

### 2. Context Window
De hoeveelheid tekst die het model kan "onthouden":
- GPT-3.5: 4,096 tokens (~3,000 woorden)
- GPT-4: 8,192 - 128,000 tokens
- Claude 3: Tot 200,000 tokens!

### 3. Probability Distribution
Voor elk mogelijk volgend token berekent het model een waarschijnlijkheid.

## Temperature en Sampling

### Temperature
Controleert hoe "creatief" of "random" de output is:
- **Temperature = 0**: Meest voorspelbare output
- **Temperature = 1**: Balanced
- **Temperature = 2**: Zeer creatief/chaotisch

### Top-k en Top-p Sampling
- **Top-k**: Kies alleen uit de k meest waarschijnlijke tokens
- **Top-p**: Kies tokens tot cumulatieve probability = p

## Praktisch Voorbeeld

Stel we hebben de prompt: "De kat zat op de..."

Het model voorspelt waarschijnlijkheden:
- "mat" - 45%
- "stoel" - 20%
- "bank" - 15%
- "tafel" - 10%
- andere - 10%

Bij temperature=0 krijg je altijd "mat"
Bij temperature=1 krijg je variatie based op de percentages
        `,
        codeExamples: [
          {
            id: 'example-2',
            title: 'Temperature in actie',
            language: 'python',
            code: `import openai

prompt = "Schrijf een openingszin voor een spannend verhaal:"

# Lage temperature - voorspelbaar
response_low = openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": prompt}],
    temperature=0.2
)

# Hoge temperature - creatief
response_high = openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": prompt}],
    temperature=1.5
)

print("Low temp:", response_low.choices[0].message.content)
# Output: "Het was een donkere en stormachtige nacht toen..."

print("High temp:", response_high.choices[0].message.content)
# Output: "De paarse flamingo's dansten op het dak terwijl..."`,
            explanation: 'Temperature beïnvloedt direct hoe voorspelbaar of creatief de AI output is.'
          }
        ],
        assignments: [
          {
            id: 'assignment-1-2',
            title: 'Experimenteer met Temperature',
            description: 'Test verschillende temperature settings voor verschillende use cases.',
            difficulty: 'medium',
            type: 'code',
            initialCode: `# Gebruik deze template om te experimenteren
def generate_with_temperature(prompt, temperature):
    # Simulatie van AI response
    # In werkelijkheid zou je hier de API aanroepen
    responses = {
        0.0: "zeer voorspelbare output",
        0.5: "gebalanceerde output",
        1.0: "creatieve output",
        1.5: "zeer creatieve output"
    }
    return responses.get(temperature, "onbekende temperature")

# Test cases - vul de juiste temperature in
email_prompt = "Schrijf een formele email opening"
best_temp_email = ___  # Vul in: 0.0, 0.5, 1.0, of 1.5?

story_prompt = "Verzin een fantasie character naam"  
best_temp_story = ___  # Vul in: 0.0, 0.5, 1.0, of 1.5?

code_prompt = "Schrijf een Python functie voor sorteer"
best_temp_code = ___   # Vul in: 0.0, 0.5, 1.0, of 1.5?`,
            solution: `best_temp_email = 0.0  # Formele emails moeten consistent zijn
best_temp_story = 1.5  # Creativiteit is gewenst voor fantasy
best_temp_code = 0.0   # Code moet correct en voorspelbaar zijn`,
            hints: [
              'Formele taken vereisen lage temperature',
              'Creatieve taken kunnen hogere temperature gebruiken',
              'Code generatie werkt best met temperature 0'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'module-2',
    title: 'De anatomie van een perfecte prompt',
    description: 'Leer de componenten: Context, Instructie, Persona, en Formaat',
    lessons: [
      {
        id: 'lesson-2-1',
        title: 'De CIPF Methode',
        duration: '25 min',
        content: `
# De CIPF Methode voor Perfect Prompting

Een effectieve prompt bestaat uit vier kerncomponenten die we de **CIPF Methode** noemen:

## C - Context
Geef de AI de nodige achtergrondinformatie.

### Waarom Context?
- Voorkomt misverstanden
- Verbetert relevantie
- Bespaart tokens door minder clarificatie

### Voorbeelden:
❌ "Schrijf een email"
✅ "Schrijf een email aan een klant die klaagt over een late levering van hun bestelling #12345"

## I - Instructie
De specifieke taak die je wilt laten uitvoeren.

### Heldere Instructies:
- Gebruik actieve werkwoorden (schrijf, analyseer, genereer)
- Wees specifiek over het gewenste resultaat
- Geef constraints mee (lengte, stijl, etc.)

## P - Persona
De rol die de AI moet aannemen.

### Effectieve Personas:
- "Je bent een ervaren SEO specialist"
- "Handel als een vriendelijke klantenservice medewerker"
- "Je bent een strenge code reviewer"

## F - Formaat
De structuur van de gewenste output.

### Format Voorbeelden:
- "Geef je antwoord in bullet points"
- "Structureer als JSON"
- "Gebruik markdown headers"

## De Complete CIPF Formule

\`\`\`
[CONTEXT] Achtergrondinformatie
[PERSONA] Je bent een [rol]
[INSTRUCTIE] [Actie werkwoord] [specifieke taak]
[FORMAAT] Structureer je antwoord als [format]
\`\`\`
        `,
        codeExamples: [
          {
            id: 'example-3',
            title: 'CIPF in de praktijk',
            language: 'text',
            code: `# Voorbeeld 1: Email naar klant
[CONTEXT] Een klant heeft 3 keer gebeld over hun kapotte wasmachine (model WM-2000) die nog in garantie is.
[PERSONA] Je bent een empathische customer service manager.
[INSTRUCTIE] Schrijf een email waarin je excuses aanbiedt en een oplossing voorstelt.
[FORMAAT] Professionele email met duidelijke kopjes voor: Excuses, Oplossing, Vervolgstappen.

# Voorbeeld 2: Code Review
[CONTEXT] Junior developer heeft een Python functie geschreven voor gebruikersauthenticatie.
[PERSONA] Je bent een senior developer met 10 jaar ervaring in security.
[INSTRUCTIE] Review de code op security vulnerabilities en best practices.
[FORMAAT] 
- Samenvatting (1 zin)
- Gevonden issues (genummerde lijst)
- Verbeterde code
- Extra tips`,
            explanation: 'Door CIPF consequent toe te passen krijg je altijd relevante, goed gestructureerde antwoorden.'
          }
        ],
        assignments: [
          {
            id: 'assignment-2-1',
            title: 'Bouw je eigen CIPF Prompt',
            description: 'Maak een complete CIPF prompt voor een real-world scenario.',
            difficulty: 'medium',
            type: 'code',
            initialCode: `# Scenario: Je moet een productbeschrijving schrijven voor een webshop

# Vul de CIPF componenten in:
context = "___"  # Welke informatie heeft de AI nodig?
persona = "___"  # Welke rol moet de AI aannemen?
instructie = "___"  # Wat moet er precies gebeuren?
formaat = "___"  # Hoe moet het resultaat eruitzien?

# Combineer tot complete prompt:
complete_prompt = f"""
[CONTEXT] {context}
[PERSONA] {persona}
[INSTRUCTIE] {instructie}
[FORMAAT] {formaat}
"""

print(complete_prompt)`,
            solution: `context = "We verkopen handgemaakte houten speelgoed voor kinderen 3-8 jaar. Product: Houten treinset met 50 delen, prijs €89,99"
persona = "Je bent een creatieve copywriter gespecialiseerd in kinderspeelgoed"
instructie = "Schrijf een aantrekkelijke productbeschrijving die ouders overtuigt om dit educatieve speelgoed te kopen"
formaat = "150-200 woorden, met bullet points voor de belangrijkste kenmerken"`,
            hints: [
              'Context moet productdetails bevatten',
              'Persona moet relevant zijn voor de doelgroep',
              'Instructie moet het doel duidelijk maken'
            ]
          }
        ]
      },
      {
        id: 'lesson-2-2',
        title: 'Geavanceerde Prompt Structuren',
        duration: '30 min',
        content: `
# Geavanceerde Prompt Structuren

Nu je CIPF beheerst, laten we kijken naar geavanceerdere technieken voor complexe taken.

## 1. Structured Output Prompting

Voor consistente, parseable output:

### JSON Output
\`\`\`
Analyseer deze review en geef output in exact dit JSON format:
{
  "sentiment": "positive/negative/neutral",
  "score": 1-10,
  "key_points": ["punt1", "punt2"],
  "recommendation": "yes/no"
}
\`\`\`

### Tabel Output
\`\`\`
Geef je analyse in deze tabel structuur:
| Aspect | Score | Toelichting |
|--------|-------|-------------|
| [naam] | [1-5] | [uitleg]    |
\`\`\`

## 2. Multi-Step Prompting

Complexe taken opdelen in stappen:

\`\`\`
Volg deze stappen exact:
1. ANALYSEER: Identificeer de hoofdpunten in de tekst
2. CATEGORISEER: Groepeer punten in maximaal 3 categorieën  
3. PRIORITEER: Rangschik op belangrijkheid
4. FORMULEER: Schrijf een samenvatting per categorie
\`\`\`

## 3. Conditional Prompting

Verschillende outputs based op condities:

\`\`\`
ALS het sentiment positief is:
  → Schrijf een bedankbrief
ANDERS ALS het sentiment negatief is:
  → Schrijf excuses en oplossing
ANDERS:
  → Vraag om meer feedback
\`\`\`

## 4. Template-Based Prompting

Herbruikbare templates maken:

\`\`\`
Template: [PRODUCT_REVIEW]
Product: {product_name}
Prijs: {price}
Doelgroep: {target_audience}

Taak: Schrijf een eerlijke review die {target_audience} aanspreekt
Focus op: prijs-kwaliteit verhouding
Lengte: 100-150 woorden
\`\`\`

## 5. Chain-of-Thought (CoT) Prompting

Forceer stap-voor-stap redenering:

\`\`\`
Los dit probleem stap voor stap op. 
Toon je denkproces voor elke stap.

Probleem: [beschrijving]

Stap 1: [wat ga je eerst doen]
Stap 2: [volgende actie]
...
Conclusie: [eindresultaat]
\`\`\`
        `,
        codeExamples: [
          {
            id: 'example-4',
            title: 'Template System in Python',
            language: 'python',
            code: `# Maak een herbruikbaar prompt template systeem

class PromptTemplate:
    def __init__(self, template):
        self.template = template
    
    def fill(self, **kwargs):
        prompt = self.template
        for key, value in kwargs.items():
            prompt = prompt.replace(f"{{{key}}}", str(value))
        return prompt

# Email template
email_template = PromptTemplate("""
[CONTEXT] Klant: {customer_name}, Product: {product}, Probleem: {issue}
[PERSONA] Je bent een vriendelijke customer service medewerker
[INSTRUCTIE] Schrijf een email die het probleem erkent en een oplossing biedt
[FORMAAT] 
- Aanhef
- Erkenning probleem
- Oplossing
- Vervolgstappen
- Afsluiting
""")

# Gebruik de template
prompt = email_template.fill(
    customer_name="Jan Jansen",
    product="Laptop XYZ",
    issue="Scherm flikkert na 10 minuten gebruik"
)

print(prompt)`,
            explanation: 'Templates maken je prompts herbruikbaar en consistent.'
          },
          {
            id: 'example-5',
            title: 'Multi-Step Analysis Prompt',
            language: 'text',
            code: `# Complexe Sentiment Analyse met Stappen

Analyseer deze productreview in 4 stappen:

Review: "De koffiezetapparaat maakt heerlijke koffie, maar is wel erg luid. 
De bediening is intuïtief en het design past perfect in mijn keuken. 
Jammer dat de melkopschuimer na 2 weken al haperde."

STAP 1 - IDENTIFICEER ASPECTEN:
- Smaak: ___
- Geluid: ___
- Bediening: ___
- Design: ___
- Duurzaamheid: ___

STAP 2 - SENTIMENT PER ASPECT:
[Gebruik: ++ zeer positief, + positief, 0 neutraal, - negatief, -- zeer negatief]

STAP 3 - WEGING:
Bepaal het belang van elk aspect (1-5)

STAP 4 - EINDOORDEEL:
Combineer alles tot een score (1-10) met korte conclusie`,
            explanation: 'Door analyse op te delen in stappen krijg je meer gedetailleerde en accurate resultaten.'
          }
        ],
        assignments: [
          {
            id: 'assignment-2-2',
            title: 'Ontwerp een Multi-Step Prompt',
            description: 'Maak een complexe prompt die een taak opdeelt in logische stappen.',
            difficulty: 'hard',
            type: 'code',
            initialCode: `# Opdracht: Maak een multi-step prompt voor het schrijven van een blog post

def create_blog_prompt(topic, target_audience, word_count):
    """
    Maak een gestructureerde prompt die een AI begeleidt
    door het complete blog schrijfproces.
    """
    
    prompt = f"""
    Schrijf een blog post over: {topic}
    Doelgroep: {target_audience}
    Lengte: {word_count} woorden
    
    Volg deze stappen:
    
    STAP 1 - RESEARCH & OUTLINE:
    # Vul hier aan wat de AI moet doen
    ___
    
    STAP 2 - HEADLINE & INTRO:
    # Vul hier aan
    ___
    
    STAP 3 - BODY CONTENT:
    # Vul hier aan
    ___
    
    STAP 4 - CONCLUSIE & CTA:
    # Vul hier aan
    ___
    
    STAP 5 - SEO OPTIMALISATIE:
    # Vul hier aan
    ___
    """
    
    return prompt

# Test je functie
blog_prompt = create_blog_prompt(
    topic="AI in Healthcare",
    target_audience="Medical professionals",
    word_count=800
)`,
            solution: `STAP 1 - RESEARCH & OUTLINE:
- Identificeer 3-5 hoofdpunten over AI in healthcare
- Maak een logische structuur met sub-onderwerpen
- Verzamel 2-3 relevante statistieken of case studies

STAP 2 - HEADLINE & INTRO:
- Schrijf 3 alternatieve headlines
- Kies de meest pakkende
- Schrijf een intro (50-75 woorden) met een hook

STAP 3 - BODY CONTENT:
- Ontwikkel elk hoofdpunt in een eigen paragraaf
- Gebruik concrete voorbeelden voor medici
- Houd taal professioneel maar toegankelijk

STAP 4 - CONCLUSIE & CTA:
- Vat de belangrijkste inzichten samen
- Geef praktische next steps voor medici
- Eindig met een thought-provoking vraag

STAP 5 - SEO OPTIMALISATIE:
- Identificeer 3-5 relevante keywords
- Zorg dat het main keyword 3-4x voorkomt
- Schrijf een meta description (150 chars)`,
            hints: [
              'Elke stap moet een duidelijk doel hebben',
              'Geef concrete instructies, niet vage aanwijzingen',
              'Denk aan de logische volgorde van taken'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'module-3',
    title: 'Essentiële Prompt Technieken',
    description: 'Beheers Zero-shot, Few-shot, en Chain-of-Thought prompting',
    lessons: [
      {
        id: 'lesson-3-1',
        title: 'Zero-shot vs Few-shot Learning',
        duration: '20 min',
        content: `
# Zero-shot vs Few-shot Learning

Deze fundamentele technieken bepalen hoeveel voorbeelden je de AI geeft.

## Zero-shot Prompting

De AI krijgt **geen voorbeelden** - alleen instructies.

### Wanneer gebruiken?
- Simpele, duidelijke taken
- Wanneer je snel resultaat wilt
- Voor algemene kennis vragen

### Voorbeeld:
\`\`\`
Vertaal naar het Frans: "Good morning"
\`\`\`

## Few-shot Prompting

Je geeft **enkele voorbeelden** om het gewenste patroon te tonen.

### Wanneer gebruiken?
- Specifieke output formats
- Consistente stijl nodig
- Complexe patronen
- Custom classificaties

### Structuur:
\`\`\`
Voorbeeld 1: [input] → [output]
Voorbeeld 2: [input] → [output]
Voorbeeld 3: [input] → [output]
Nu jij: [nieuwe input] → ?
\`\`\`

## One-shot vs Few-shot

### One-shot (1 voorbeeld)
Goed voor simpele patronen:
\`\`\`
Maak een product SKU:
Rode Trui Maat L → RT-L-001
Blauwe Broek Maat M → ?
\`\`\`

### Few-shot (2-5 voorbeelden)
Voor complexere patronen:
\`\`\`
Sentiment analyse:
"Dit product is geweldig!" → Positief (5/5)
"Best wel oké" → Neutraal (3/5)
"Totale verspilling van geld" → Negatief (1/5)
"Werkt goed maar duur" → ?
\`\`\`

## Best Practices

### 1. Kwaliteit > Kwantiteit
3 goede voorbeelden > 10 slechte voorbeelden

### 2. Diversiteit
Kies voorbeelden die verschillende aspecten tonen

### 3. Relevantie
Voorbeelden moeten lijken op je werkelijke use case

### 4. Consistentie
Houd format en stijl consistent tussen voorbeelden
        `,
        codeExamples: [
          {
            id: 'example-6',
            title: 'Zero-shot vs Few-shot Vergelijking',
            language: 'python',
            code: `# Zero-shot prompt
zero_shot_prompt = """
Classificeer deze email als: spam, important, normal

Email: "Gefeliciteerd! U heeft 1 miljoen euro gewonnen! Klik hier!"
"""

# Few-shot prompt (veel effectiever voor deze taak)
few_shot_prompt = """
Classificeer emails als: spam, important, normal

Email: "GRATIS iPhone 15! Claim NU!" → spam
Email: "Meeting morgen om 10:00" → important  
Email: "Nieuwsbrief week 42" → normal
Email: "Vergeet niet je wachtwoord te wijzigen voor vrijdag" → important
Email: "50% KORTING op alle producten!!!" → spam

Email: "Gefeliciteerd! U heeft 1 miljoen euro gewonnen! Klik hier!" → 
"""

# Few-shot geeft meer accurate classificatie`,
            explanation: 'Few-shot helpt de AI het patroon te herkennen dat jij wilt.'
          },
          {
            id: 'example-7',
            title: 'Dynamic Few-shot Generator',
            language: 'python',
            code: `def create_few_shot_prompt(examples, new_input, task_description):
    """
    Bouw dynamisch een few-shot prompt
    
    Args:
        examples: lijst van (input, output) tuples
        new_input: de nieuwe input om te verwerken
        task_description: beschrijving van de taak
    """
    prompt = f"{task_description}\\n\\n"
    
    # Voeg voorbeelden toe
    for i, (inp, out) in enumerate(examples, 1):
        prompt += f"Voorbeeld {i}:\\n"
        prompt += f"Input: {inp}\\n"
        prompt += f"Output: {out}\\n\\n"
    
    # Voeg de nieuwe input toe
    prompt += f"Nu jij:\\n"
    prompt += f"Input: {new_input}\\n"
    prompt += f"Output: "
    
    return prompt

# Gebruik voor sentiment analyse
sentiment_examples = [
    ("Het eten was heerlijk!", "Positief 😊"),
    ("Service was verschrikkelijk", "Negatief 😞"),
    ("Prima restaurant, niks bijzonders", "Neutraal 😐")
]

prompt = create_few_shot_prompt(
    examples=sentiment_examples,
    new_input="Beste pizza die ik ooit heb gehad!",
    task_description="Bepaal het sentiment van restaurant reviews:"
)

print(prompt)`,
            explanation: 'Een herbruikbare functie maakt few-shot prompting efficiënter.'
          }
        ],
        assignments: [
          {
            id: 'assignment-3-1',
            title: 'Zero-shot vs Few-shot Experiment',
            description: 'Test wanneer few-shot beter werkt dan zero-shot.',
            difficulty: 'medium',
            type: 'code',
            initialCode: `# Experiment: Wanneer is few-shot nodig?

# Taak 1: Email onderwerp genereren
def email_subject_test():
    # Zero-shot poging
    zero_shot = """
    Schrijf een onderwerp voor een email over: Team lunch volgende week
    """
    
    # Few-shot poging  
    few_shot = """
    Schrijf email onderwepen:
    
    Meeting over Q4 resultaten → "Q4 Resultaten Bespreking - Dinsdag 14:00"
    Nieuwe collega Marie → "Welkom Marie bij het Marketing Team! 🎉"
    Server maintenance → "⚠️ Gepland Onderhoud: Zaterdag 02:00-06:00"
    
    Team lunch volgende week → ___
    """
    
    # Welke is beter en waarom?
    return "your_analysis_here"

# Taak 2: Data extractie
def data_extraction_test():
    text = "Jan Jansen woont in Amsterdam en is 32 jaar oud"
    
    # Zero-shot poging
    zero_shot = """
    Extract naam, stad, en leeftijd uit: {text}
    """
    
    # Few-shot poging
    few_shot = """
    Extract persoonsinformatie:
    
    "Marie de Vries uit Rotterdam, 28 jaar" → 
    Naam: Marie de Vries | Stad: Rotterdam | Leeftijd: 28
    
    "45-jarige Peter Smit wonend in Utrecht" →
    Naam: Peter Smit | Stad: Utrecht | Leeftijd: 45
    
    "{text}" → ___
    """
    
    # Welke geeft meer consistente output?
    return "your_analysis_here"

# Vraag: Voor welke taken is few-shot essentieel?
# 1. ___
# 2. ___
# 3. ___`,
            solution: `# Voor welke taken is few-shot essentieel?
# 1. Custom classificaties (bijv. bedrijfsspecifieke categorieën)
# 2. Specifieke output formaten (bijv. bedrijf's huisstijl)
# 3. Complexe patronen die niet algemeen bekend zijn`,
            hints: [
              'Zero-shot werkt goed voor algemene taken',
              'Few-shot is nodig voor bedrijfsspecifieke patronen',
              'Output consistentie is belangrijker bij few-shot'
            ]
          }
        ]
      },
      {
        id: 'lesson-3-2',
        title: 'Chain-of-Thought Prompting',
        duration: '25 min',
        content: `
# Chain-of-Thought (CoT) Prompting

Chain-of-Thought prompting is een krachtige techniek waarbij je de AI vraagt om **stap voor stap te redeneren** voordat het een antwoord geeft.

## Waarom CoT gebruiken?

### Voordelen:
- ✅ Verbetert accuracy bij complexe taken
- ✅ Maakt redenering transparant
- ✅ Vermindert fouten
- ✅ Helpt bij debugging

### Perfect voor:
- Wiskundige problemen
- Logische puzzels
- Multi-step analyses
- Complexe beslissingen

## De CoT Trigger Phrases

### Standaard triggers:
- "Denk stap voor stap"
- "Los dit stap voor stap op"
- "Leg je redenering uit"
- "Toon je denkproces"

### Geavanceerde triggers:
- "Laten we dit systematisch aanpakken"
- "Breek dit probleem op in delen"
- "Overweeg alle aspecten voordat je antwoordt"

## CoT Formats

### 1. Vrije vorm CoT
\`\`\`
Los dit op en leg elke stap uit:
Als een trein 120 km/u rijdt en 180 km moet afleggen, 
maar halverwege 15 minuten moet stoppen, hoe lang duurt de reis?
\`\`\`

### 2. Gestructureerde CoT
\`\`\`
Beantwoord deze vraag met deze structuur:
1. GEGEVEN: Wat weten we?
2. GEVRAAGD: Wat moeten we vinden?
3. AANPAK: Hoe gaan we dit oplossen?
4. UITWERKING: Stap voor stap berekening
5. CONTROLE: Klopt het antwoord?
6. ANTWOORD: Het eindresultaat
\`\`\`

### 3. Zero-shot CoT
Simpelweg toevoegen: "Denk stap voor stap" aan je prompt

### 4. Few-shot CoT
Geef voorbeelden van stap-voor-stap redenering

## Advanced CoT Techniques

### Self-Consistency
Vraag meerdere redeneringen en kies het meest voorkomende antwoord

### Tree of Thoughts
Exploreer meerdere denkpaden parallel

### Least-to-Most
Begin met het simpelste deel, bouw op naar complex
        `,
        codeExamples: [
          {
            id: 'example-8',
            title: 'CoT voor Probleem Oplossing',
            language: 'text',
            code: `# Zonder CoT:
"Hoeveel kost 3 shirts van €25 met 20% korting?"
→ "€60"  (Fout! Korting vergeten)

# Met CoT:
"Hoeveel kost 3 shirts van €25 met 20% korting? Denk stap voor stap."

→ Stap 1: Bereken totaal zonder korting
  3 shirts × €25 = €75
  
→ Stap 2: Bereken korting bedrag  
  20% van €75 = 0.20 × €75 = €15
  
→ Stap 3: Trek korting af
  €75 - €15 = €60
  
→ Antwoord: De 3 shirts kosten €60 met korting.`,
            explanation: 'CoT forceert de AI om alle stappen te doorlopen en vermindert rekenfouten.'
          },
          {
            id: 'example-9',
            title: 'CoT Template voor Business Beslissingen',
            language: 'python',
            code: `def create_decision_cot_prompt(decision, factors, constraints):
    """
    Maak een CoT prompt voor complexe business beslissingen
    """
    prompt = f"""
    Help mij deze business beslissing maken: {decision}
    
    Gebruik dit Chain-of-Thought proces:
    
    STAP 1 - SITUATIE ANALYSE:
    - Wat is de huidige situatie?
    - Welke factoren spelen mee: {', '.join(factors)}
    - Wat zijn de constraints: {', '.join(constraints)}
    
    STAP 2 - OPTIES IDENTIFICEREN:
    - Lijst alle mogelijke opties
    - Kort beschrijf elke optie
    
    STAP 3 - VOOR/NADELEN PER OPTIE:
    Voor elke optie:
    - Voordelen
    - Nadelen  
    - Risico's
    
    STAP 4 - IMPACT ANALYSE:
    - Korte termijn impact (0-6 maanden)
    - Lange termijn impact (6+ maanden)
    - Stakeholder impact
    
    STAP 5 - AANBEVELING:
    - Beste optie en waarom
    - Implementatie suggesties
    - Mitigatie strategieën voor risico's
    """
    return prompt

# Gebruik
decision_prompt = create_decision_cot_prompt(
    decision="Moeten we overstappen naar een nieuwe CRM?",
    factors=["Kosten", "Training tijd", "Integraties", "Schaalbaarheid"],
    constraints=["Budget: €50k", "Go-live binnen 3 maanden", "Minimale downtime"]
)`,
            explanation: 'Een gestructureerde CoT template zorgt voor consistente, doordachte analyses.'
          }
        ],
        assignments: [
          {
            id: 'assignment-3-2',
            title: 'Ontwerp een CoT Prompt voor Debugging',
            description: 'Maak een Chain-of-Thought prompt die helpt bij het debuggen van code.',
            difficulty: 'hard',
            type: 'code',
            initialCode: `# Opdracht: Maak een CoT prompt voor het debuggen van Python code

def create_debug_cot_prompt(code_snippet, error_message, expected_behavior):
    """
    Genereer een CoT prompt die systematisch helpt bij debugging
    
    Parameters:
    - code_snippet: De problematische code
    - error_message: De error die je krijgt  
    - expected_behavior: Wat de code zou moeten doen
    """
    
    # Vul de CoT structuur aan
    prompt = f"""
    Debug deze Python code systematisch:
    
    CODE:
    {code_snippet}
    
    ERROR:
    {error_message}
    
    VERWACHT GEDRAG:
    {expected_behavior}
    
    DEBUGGING PROCES:
    
    STAP 1 - ERROR ANALYSE:
    # Wat moet hier gebeuren?
    ___
    
    STAP 2 - CODE FLOW TRACE:
    # Wat moet hier gebeuren?
    ___
    
    STAP 3 - IDENTIFICEER OORZAAK:
    # Wat moet hier gebeuren?
    ___
    
    STAP 4 - OPLOSSING FORMULEREN:
    # Wat moet hier gebeuren?
    ___
    
    STAP 5 - TEST & VALIDATIE:
    # Wat moet hier gebeuren?
    ___
    """
    
    return prompt

# Test case
test_prompt = create_debug_cot_prompt(
    code_snippet="def divide(a, b): return a / b",
    error_message="ZeroDivisionError: division by zero",
    expected_behavior="Safely divide two numbers"
)`,
            solution: `STAP 1 - ERROR ANALYSE:
- Lees de error message: wat type error is het?
- Op welke regel gebeurt de error?
- Wat zijn mogelijke oorzaken van deze error?

STAP 2 - CODE FLOW TRACE:
- Volg de code regel voor regel
- Identificeer waar de variabelen vandaan komen
- Check welke waardes kunnen leiden tot de error

STAP 3 - IDENTIFICEER OORZAAK:
- De directe oorzaak van de error
- Waarom kan b gelijk zijn aan 0?
- Zijn er edge cases niet afgevangen?

STAP 4 - OPLOSSING FORMULEREN:
- Voeg input validatie toe
- Implementeer error handling
- Geef de gefixte code

STAP 5 - TEST & VALIDATIE:
- Test met b = 0
- Test met normale waardes
- Test met edge cases (negative, float, etc.)`,
            hints: [
              'Denk aan het systematisch proces van debugging',
              'Elke stap moet concreet en actionable zijn',
              'Vergeet edge cases niet in je analyse'
            ]
          }
        ],
        resources: [
          {
            title: 'Chain-of-Thought Paper (Google)',
            url: 'https://arxiv.org/abs/2201.11903',
            type: 'research'
          },
          {
            title: 'CoT Prompting Guide',
            url: 'https://www.promptingguide.ai/techniques/cot',
            type: 'guide'
          }
        ]
      }
    ]
  },
  {
    id: 'module-4',
    title: 'Praktijkopdrachten',
    description: 'Pas je kennis toe op tekstgeneratie, samenvatten en analyseren',
    lessons: [
      {
        id: 'lesson-4-1',
        title: 'Tekstgeneratie Projecten',
        duration: '45 min',
        content: `
# Tekstgeneratie Projecten

Nu gaan we al je geleerde technieken toepassen in real-world projecten.

## Project 1: Automated Email Responder

Bouw een systeem dat verschillende soorten emails kan beantwoorden.

### Requirements:
- Herken het type email (klacht, vraag, compliment)
- Pas de juiste toon aan
- Gebruik bedrijfsspecifieke informatie
- Houd antwoorden onder 150 woorden

### Technieken om te gebruiken:
- CIPF voor structuur
- Few-shot voor consistente stijl
- Conditional prompting voor verschillende types

## Project 2: Blog Post Generator

Creëer een tool die complete blog posts genereert.

### Features:
- SEO-geoptimaliseerde titels
- Engaging introductie
- Gestructureerde body met H2/H3
- Call-to-action afsluiting
- Meta description

### Advanced features:
- Tone aanpassing (formeel/informeel)
- Doelgroep targeting
- Keyword integratie
- Variabele lengte (500-2000 woorden)

## Project 3: Product Description Wizard

Maak een systeem voor e-commerce product beschrijvingen.

### Inputs:
- Product specificaties
- Doelgroep
- Unique selling points
- Prijs positionering

### Outputs:
- Korte beschrijving (50 woorden)
- Lange beschrijving (200 woorden)
- Bullet points met features
- SEO keywords

## Best Practices voor Productie

### 1. Error Handling
- Valideer inputs
- Handel edge cases af
- Geef duidelijke foutmeldingen

### 2. Consistency
- Gebruik templates
- Bewaar succesvolle prompts
- A/B test variaties

### 3. Quality Control
- Implementeer output validatie
- Check op verboden content
- Monitor gebruikersfeedback
        `,
        codeExamples: [
          {
            id: 'example-10',
            title: 'Email Responder System',
            language: 'python',
            code: `class EmailResponder:
    def __init__(self):
        self.company_info = {
            "name": "TechSupport BV",
            "return_policy": "30 dagen niet goed, geld terug",
            "support_hours": "Ma-Vr 9:00-17:00",
            "response_time": "binnen 24 uur"
        }
    
    def classify_email(self, email_text):
        """Classificeer het type email"""
        classification_prompt = f"""
        Classificeer deze email als: complaint, question, compliment, other
        
        Email: "{email_text}"
        
        Classificatie:"""
        
        # Hier zou je de AI API aanroepen
        return "classification_result"
    
    def generate_response(self, email_text, email_type):
        """Genereer passend antwoord based op type"""
        
        base_prompt = f"""
        [CONTEXT] 
        Bedrijf: {self.company_info['name']}
        Email type: {email_type}
        Beleid: {self.company_info['return_policy']}
        
        [PERSONA] Je bent een vriendelijke customer service medewerker
        
        [INSTRUCTIE] Schrijf een antwoord op deze email
        
        [FORMAAT]
        - Maximaal 150 woorden
        - Professioneel maar warm
        - Sluit af met vervolgstappen
        
        ORIGINELE EMAIL:
        {email_text}
        
        ANTWOORD:"""
        
        # Few-shot examples voor consistency
        if email_type == "complaint":
            base_prompt = self._add_complaint_examples(base_prompt)
        elif email_type == "question":
            base_prompt = self._add_question_examples(base_prompt)
            
        return base_prompt
    
    def _add_complaint_examples(self, prompt):
        examples = """
        VOORBEELDEN:
        
        Klacht: "Product kapot na 1 week!"
        Antwoord: "Wat vervelend dat uw product defect is geraakt. Dit moet natuurlijk niet gebeuren. Ik regel direct een vervanging voor u. U ontvangt binnen 24 uur een retourlabel per email. Zodra wij het defecte product ontvangen, sturen we kosteloos een nieuw exemplaar. Onze excuses voor het ongemak."
        
        """ + prompt
        return examples

# Gebruik
responder = EmailResponder()
email = "Ik heb 3 weken geleden een laptop besteld maar nog niks ontvangen!"
email_type = responder.classify_email(email)
response = responder.generate_response(email, email_type)`,
            explanation: 'Een productie-waardig systeem combineert classificatie, templating, en context-aware generation.'
          },
          {
            id: 'example-11',
            title: 'SEO Blog Generator',
            language: 'python',
            code: `def generate_seo_blog_post(topic, keywords, target_audience, word_count=800):
    """
    Genereer een SEO-geoptimaliseerde blog post
    """
    
    # Stap 1: Research & Outline
    outline_prompt = f"""
    Maak een blog outline over: {topic}
    Doelgroep: {target_audience}
    
    Include deze keywords natuurlijk: {', '.join(keywords)}
    
    Structuur:
    - H1 titel (met main keyword)
    - 3-4 H2 secties
    - Per H2: 2-3 H3 subsecties
    
    Maak de outline:"""
    
    # Stap 2: Generate sections met Chain-of-Thought
    section_prompt = f"""
    Schrijf deze blog sectie. Denk stap voor stap:
    
    1. Wat is het hoofdpunt van deze sectie?
    2. Welke keywords passen hier natuurlijk?
    3. Welke voorbeelden zijn relevant voor {target_audience}?
    4. Hoe link ik naar de volgende sectie?
    
    Sectie titel: [H2_TITLE]
    Doellengte: ~200 woorden
    Keywords om te gebruiken: {keywords[0]}, {keywords[1]}
    
    Schrijf de sectie:"""
    
    # Stap 3: Meta description
    meta_prompt = f"""
    Schrijf een meta description voor een blog over {topic}.
    
    Eisen:
    - Exact 155 karakters
    - Bevat keyword: {keywords[0]}
    - Actionable (gebruik werkwoord)
    - Unique value proposition
    
    Meta description:"""
    
    # Stap 4: Title variations voor A/B testing
    title_prompt = f"""
    Genereer 5 SEO-vriendelijke titels voor een blog over {topic}.
    
    Regels:
    - 50-60 karakters
    - Main keyword ({keywords[0]}) vooraan
    - Power words gebruiken
    - Nummer/lijst format waar mogelijk
    
    Titels:
    1."""
    
    return {
        "outline_prompt": outline_prompt,
        "section_prompt": section_prompt,
        "meta_prompt": meta_prompt,
        "title_prompt": title_prompt
    }

# Gebruik voor AI healthcare blog
blog_prompts = generate_seo_blog_post(
    topic="AI in Healthcare 2024",
    keywords=["AI healthcare", "medical AI", "healthcare automation"],
    target_audience="Healthcare IT managers",
    word_count=1200
)`,
            explanation: 'Een complete blog generator moet rekening houden met SEO, structuur, en doelgroep.'
          }
        ],
        assignments: [
          {
            id: 'assignment-4-1',
            title: 'Bouw een Product Description Generator',
            description: 'Maak een complete product beschrijving generator met alle geleerde technieken.',
            difficulty: 'hard',
            type: 'project',
            initialCode: `# Project: Product Description Generator
# Gebruik ALLE geleerde technieken om een productie-waardig systeem te bouwen

class ProductDescriptionGenerator:
    def __init__(self):
        self.templates = {}
        self.tone_modifiers = {
            "luxury": "Use sophisticated, premium language",
            "budget": "Focus on value and affordability",
            "technical": "Emphasize specifications and features",
            "lifestyle": "Focus on benefits and experiences"
        }
    
    def generate_description(self, product_data):
        """
        Genereer complete product beschrijving
        
        product_data = {
            "name": str,
            "category": str,
            "price": float,
            "features": list,
            "target_audience": str,
            "positioning": str,  # luxury/budget/technical/lifestyle
            "unique_selling_points": list
        }
        """
        
        # TODO: Implementeer de volgende componenten:
        
        # 1. Short description (50 woorden)
        short_desc = self._generate_short_description(product_data)
        
        # 2. Long description (200 woorden)  
        long_desc = self._generate_long_description(product_data)
        
        # 3. Feature bullets
        bullets = self._generate_feature_bullets(product_data)
        
        # 4. SEO keywords
        keywords = self._extract_seo_keywords(product_data)
        
        # 5. Call-to-action
        cta = self._generate_cta(product_data)
        
        return {
            "short": short_desc,
            "long": long_desc,
            "bullets": bullets,
            "keywords": keywords,
            "cta": cta
        }
    
    def _generate_short_description(self, data):
        # Implementeer met CIPF methode
        prompt = f"""
        ___  # Vul aan
        """
        return prompt
    
    def _generate_long_description(self, data):
        # Implementeer met Chain-of-Thought
        prompt = f"""
        ___  # Vul aan
        """
        return prompt
    
    def _generate_feature_bullets(self, data):
        # Implementeer met Few-shot learning
        prompt = f"""
        ___  # Vul aan
        """
        return prompt
    
    def _extract_seo_keywords(self, data):
        # Implementeer keyword extraction
        prompt = f"""
        ___  # Vul aan
        """
        return prompt
    
    def _generate_cta(self, data):
        # Implementeer met conditional prompting
        prompt = f"""
        ___  # Vul aan
        """
        return prompt

# Test je generator
test_product = {
    "name": "EcoSmart Waterkoker Pro",
    "category": "Keukenapparatuur",
    "price": 89.99,
    "features": [
        "Temperatuur instelbaar 40-100°C",
        "1.7L capaciteit",
        "Energiezuinig A++ label",
        "30 min warmhoudfunctie",
        "BPA-vrij"
    ],
    "target_audience": "Milieubewuste theeliefhebbers",
    "positioning": "lifestyle",
    "unique_selling_points": [
        "Bespaart 50% energie",
        "Perfect voor verschillende theesoorten",
        "5 jaar garantie"
    ]
}

generator = ProductDescriptionGenerator()
result = generator.generate_description(test_product)`,
            solution: `def _generate_short_description(self, data):
    prompt = f"""
    [CONTEXT] Product: {data['name']}, Prijs: €{data['price']}, Doelgroep: {data['target_audience']}
    [PERSONA] Je bent een ervaren copywriter voor {data['positioning']} producten
    [INSTRUCTIE] Schrijf een aantrekkelijke productbeschrijving van exact 50 woorden
    [FORMAAT] Één vloeiende paragraaf die het product introduceert en de belangrijkste USP benadrukt
    
    Focus op: {', '.join(data['unique_selling_points'][:2])}
    """
    return prompt

def _generate_long_description(self, data):
    prompt = f"""
    Schrijf een uitgebreide productbeschrijving voor {data['name']}. Denk stap voor stap:
    
    STAP 1: Identificeer het hoofdprobleem dat dit product oplost voor {data['target_audience']}
    STAP 2: Introduceer het product als DE oplossing
    STAP 3: Beschrijf de top 3 features met concrete voordelen
    STAP 4: Adresseer mogelijke zorgen/twijfels
    STAP 5: Eindig met een sterke value proposition
    
    Toon: {self.tone_modifiers[data['positioning']]}
    Lengte: 200 woorden
    """
    return prompt`,
            hints: [
              'Gebruik CIPF voor short description',
              'CoT werkt goed voor long description',
              'Few-shot is perfect voor consistent bullet format'
            ]
          }
        ]
      }
    ],
    moduleProject: {
      id: 'final-project',
      title: 'Bouw je eigen AI Writing Assistant',
      description: 'Combineer alle geleerde technieken in een complete AI writing assistant voor jouw use case.',
      difficulty: 'hard',
      type: 'project',
      initialCode: `# Final Project: Jouw Persoonlijke AI Writing Assistant

"""
Kies één van deze projecten of bedenk je eigen:

1. Email Marketing Assistant
   - Genereert complete email campaigns
   - A/B test suggesties
   - Personalisatie opties
   
2. Social Media Content Planner
   - Genereert posts voor meerdere platforms
   - Hashtag suggesties
   - Optimale posting tijden
   
3. Academic Writing Helper
   - Essay outlines
   - Bronnen samenvatten
   - Citatie formatting
   
4. Technical Documentation Generator
   - API documentatie
   - Code comments
   - README files

Requirements:
- Gebruik minstens 3 verschillende prompt technieken
- Implementeer error handling
- Maak het herbruikbaar met templates
- Voeg quality checks toe
"""

class MyAIWritingAssistant:
    def __init__(self, assistant_type):
        self.type = assistant_type
        self.setup_configuration()
    
    def setup_configuration(self):
        # Jouw configuratie hier
        pass
    
    def generate_content(self, input_data):
        # Jouw implementatie hier
        pass
    
    def validate_output(self, generated_content):
        # Quality checks
        pass
    
    def save_template(self, name, prompt):
        # Template management
        pass

# Start met jouw implementatie!`,
      hints: [
        'Begin met een duidelijke use case',
        'Maak eerst een proof of concept',
        'Itereer op basis van output kwaliteit',
        'Documenteer je prompt templates'
      ]
    }
  }
]

export default promptEngineeringModules;