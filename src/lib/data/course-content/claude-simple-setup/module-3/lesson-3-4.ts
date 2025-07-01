import type { Lesson } from '@/lib/data/courses';

export const lesson3_4: Lesson = {
  id: 'lesson-3-4',
  title: 'Geavanceerde prompt patronen',
  duration: '35 min',
  content: `
# Geavanceerde prompt patronen

In deze les verkennen we geavanceerde technieken om de kracht van Claude volledig te benutten. Deze patronen helpen je complexe taken op te lossen en hoogwaardige resultaten te behalen.

## Chain of Thought prompting

Chain of Thought (CoT) prompting moedigt Claude aan om stap voor stap te redeneren voordat een eindantwoord te geven.

### Basis CoT prompt
\`\`\`
Los dit probleem stap voor stap op:

Een bedrijf heeft 120 werknemers. 60% werkt fulltime, de rest parttime.
Fulltime werknemers werken 40 uur per week, parttime werknemers 24 uur.
Hoeveel uur wordt er in totaal per week gewerkt?

Laat elke stap van je berekening zien.
\`\`\`

### Geavanceerd CoT voorbeeld
\`\`\`
Analyseer de volgende businesscase methodisch:

Context: Een e-commerce bedrijf overweegt om AI-chatbots te implementeren voor klantenservice.
- Huidige kosten: €500.000/jaar aan klantenservice medewerkers
- Geschatte AI implementatiekosten: €150.000 eenmalig + €50.000/jaar
- Verwachte efficiëntiewinst: 70% minder menselijke interventie nodig

Doorloop de volgende stappen:
1. Identificeer alle relevante kosten en baten
2. Bereken de ROI over 3 jaar
3. Analyseer mogelijke risico's
4. Geef een gewogen aanbeveling

Werk elke stap gedetailleerd uit voordat je verder gaat.
\`\`\`

## Few-shot learning voorbeelden

Few-shot learning gebruikt voorbeelden om Claude te laten zien wat je verwacht.

### Sentimentanalyse met few-shot
\`\`\`
Analyseer het sentiment van klantreviews. Gebruik deze schaal: Zeer Negatief, Negatief, Neutraal, Positief, Zeer Positief.

Voorbeelden:
Review: "Dit product is een complete teleurstelling. Het werkt niet zoals beloofd."
Sentiment: Zeer Negatief

Review: "Prima product voor de prijs, doet wat het moet doen."
Sentiment: Neutraal

Review: "Fantastisch! Overtreft alle verwachtingen, zou het iedereen aanraden!"
Sentiment: Zeer Positief

Analyseer nu deze review:
Review: "De levering was snel, maar de kwaliteit valt tegen. Voor deze prijs had ik meer verwacht."
Sentiment:
\`\`\`

### Complex few-shot voorbeeld voor code review
\`\`\`
Voer een code review uit volgens onderstaand format:

Voorbeeld 1:
Code:
def calculate_discount(price, discount):
    return price * discount / 100

Review:
- **Probleem**: Functie berekent het kortingsbedrag, niet de eindprijs
- **Ernst**: Medium
- **Suggestie**: Hernoem naar \`calculate_discount_amount\` of pas aan: \`return price * (1 - discount/100)\`
- **Code kwaliteit**: 6/10

Voorbeeld 2:
Code:
async function fetchUserData(userId) {
    const response = await fetch(\`/api/users/\${userId}\`);
    return await response.json();
}

Review:
- **Probleem**: Geen error handling voor mislukte requests
- **Ernst**: Hoog
- **Suggestie**: Voeg try-catch toe en controleer response.ok
- **Code kwaliteit**: 4/10

Review nu deze code:
Code:
function processPayment(amount, cardNumber) {
    console.log(\`Processing payment of \${amount} for card \${cardNumber}\`);
    // Payment logic here
    return true;
}
\`\`\`

## Taak decompositie

Complexe taken opdelen in behapbare subtaken verbetert de kwaliteit van Claude's output.

### Basis decompositie
\`\`\`
Help me een volledig marketingplan te ontwikkelen voor een nieuwe fitness app.

Deel dit op in de volgende componenten:
1. Doelgroep analyse
2. Concurrentie onderzoek
3. Unique Selling Proposition (USP)
4. Marketing kanalen strategie
5. Content kalender (eerste maand)
6. Budget allocatie
7. KPI's en meetplan

Begin met component 1 en werk ze één voor één uit.
\`\`\`

### Geavanceerde hiërarchische decompositie
\`\`\`
Ontwerp een microservices architectuur voor een online bankplatform.

Hoofdtaken:
A. Identificeer core services
   A1. User management service
   A2. Account service
   A3. Transaction service
   A4. Notification service
   
B. Voor elke service, definieer:
   B1. API endpoints
   B2. Data model
   B3. Security requirements
   B4. Scalability considerations
   
C. Integratie design:
   C1. Service communication patterns
   C2. Data consistency strategie
   C3. Error handling approach
   
Start met taak A en werk systematisch door de hiërarchie.
\`\`\`

## Output formatting

Gestructureerde output maakt resultaten direct bruikbaar.

### JSON output format
\`\`\`
Analyseer de volgende vacaturetekst en extraheer de key informatie in JSON format:

Vacature: "Senior Python Developer gezocht voor fintech startup in Amsterdam. 
5+ jaar ervaring vereist, kennis van Django en PostgreSQL is een must. 
Salaris €70k-€90k, remote mogelijk, 32-40 uur per week."

Output het resultaat in dit exacte JSON format:
{
  "functie": "",
  "niveau": "",
  "locatie": "",
  "industrie": "",
  "vereiste_skills": [],
  "ervaring_jaren": 0,
  "salaris_range": {
    "min": 0,
    "max": 0,
    "valuta": ""
  },
  "werkuren": {
    "min": 0,
    "max": 0
  },
  "remote_mogelijk": true/false
}
\`\`\`

### Markdown tabel format
\`\`\`
Vergelijk de top 5 cloud providers op de volgende criteria en presenteer 
het resultaat in een markdown tabel:

Criteria:
- Marktaandeel
- Aantal services
- Prijsmodel
- Sterke punten
- Zwakke punten
- Beste use case

Gebruik dit format:
| Provider | Marktaandeel | Services | Prijsmodel | Sterk | Zwak | Best voor |
|----------|--------------|----------|------------|-------|------|-----------|
| ...      | ...          | ...      | ...        | ...   | ...  | ...       |

Houd elke cel beknopt (max 10 woorden).
\`\`\`

## Prompt chaining

Gebruik de output van één prompt als input voor de volgende voor complexe workflows.

### Voorbeeld: Research naar rapport workflow
\`\`\`
# Prompt 1: Research
Verzamel informatie over de laatste trends in renewable energy voor 2024.
Focus op: solar, wind, hydrogen. 
Geef 5 key insights per technologie.

# Prompt 2: Analyse (gebruik output van prompt 1)
Neem de verzamelde insights over renewable energy trends.
Analyseer:
1. Welke technologie heeft de meeste potentie voor Nederland?
2. Wat zijn de belangrijkste investeringskansen?
3. Welke beleidswijzigingen zijn nodig?

# Prompt 3: Rapport (gebruik output van prompt 2)
Schrijf een executive summary (max 300 woorden) gebaseerd op de analyse.
Structuur:
- Opening statement
- Top 3 kansen voor Nederland
- Aanbevolen acties
- Conclusie met call-to-action
\`\`\`

### Complex voorbeeld: Code generatie pipeline
\`\`\`
# Chain voor het bouwen van een complete feature

## Stap 1: Requirements analyse
"Analyseer deze user story en extraheer technische requirements:
'Als gebruiker wil ik mijn profiel foto kunnen uploaden en automatisch 
laten croppen naar een vierkant formaat, zodat alle profielfoto's 
consistent zijn.'"

## Stap 2: API Design (gebruik requirements)
"Ontwerp een RESTful API endpoint voor de profile photo upload feature.
Include: endpoint naam, HTTP method, request/response format, error cases."

## Stap 3: Implementation (gebruik API design)
"Implementeer de backend handler voor het photo upload endpoint in Python/FastAPI.
Include: file validation, image processing, error handling."

## Stap 4: Tests (gebruik implementation)
"Schrijf comprehensive unit tests voor de photo upload handler.
Cover: happy path, file size limits, format validation, processing errors."

## Stap 5: Documentation (gebruik alle vorige outputs)
"Creëer API documentatie voor de photo upload feature.
Include: endpoint description, parameters, examples, error codes."
\`\`\`

## Best practices voor complexe prompts

### 1. **Gebruik duidelijke sectie markers**
\`\`\`
=== CONTEXT ===
[Achtergrond informatie hier]

=== TAAK ===
[Specifieke instructies hier]

=== CONSTRAINTS ===
[Beperkingen en vereisten hier]

=== OUTPUT FORMAT ===
[Gewenst output formaat hier]
\`\`\`

### 2. **Combineer meerdere technieken**
\`\`\`
Analyseer deze software architectuur beslissing:

<<CONTEXT>>
Ons team moet kiezen tussen een monolithische of microservices architectuur
voor een nieuwe e-learning platform. Verwachte gebruikers: 100k in jaar 1,
1M in jaar 3.

<<VOORBEELDEN>>
Monolith voordelen: Simpeler te ontwikkelen, minder operationele complexiteit
Microservices voordelen: Betere schaalbaarheid, team autonomie

<<TAAK DECOMPOSITIE>>
1. Evalueer technische requirements
2. Analyseer team capaciteiten (5 developers, 2 DevOps)
3. Bereken kosten voor beide opties
4. Overweeg toekomstige groei scenario's

<<OUTPUT>>
Geef je analyse in dit format:
# Architectuur Analyse
## 1. Requirements Evaluatie
## 2. Team Assessment  
## 3. Kosten Vergelijking
## 4. Groei Scenarios
## 5. Finale Aanbeveling

<<CHAIN OF THOUGHT>>
Werk elke sectie methodisch uit voordat je naar de volgende gaat.
Overweeg voor- en nadelen expliciet.
\`\`\`

### 3. **Meta-prompting voor zelf-verbetering**
\`\`\`
Verbeter de volgende prompt door het specifieker, duidelijker en effectiever te maken:

Originele prompt: "Schrijf een blog post over AI"

Verbeter door toe te voegen:
1. Specifieke doelgroep
2. Gewenste toon en stijl
3. Lengte en structuur requirements
4. Key points om te behandelen
5. Call-to-action

Geef eerst je analyse van wat er mist, dan de verbeterde prompt.
\`\`\`

## Oefeningen

### Oefening 1: Chain of Thought
Creëer een CoT prompt voor het analyseren van een investeringskans in een startup.
Include financiële analyse, marktpotentieel, en risico assessment.

### Oefening 2: Few-shot learning
Ontwerp een few-shot prompt voor het categoriseren van customer support tickets
in: Technical Issue, Billing Question, Feature Request, General Inquiry.

### Oefening 3: Complex prompt chain
Bouw een 4-stap prompt chain voor het ontwikkelen van een nieuwe product feature
van idee tot implementatieplan.

## Conclusie

Geavanceerde prompt patronen stellen je in staat om Claude's volledige potentieel
te benutten. Door technieken te combineren en systematisch te werk te gaan,
kun je complexe taken efficiënt oplossen met hoogwaardige resultaten.

Belangrijkste takeaways:
- Chain of Thought helpt bij complexe redenering
- Few-shot examples geven context en verwachtingen
- Taak decompositie maakt grote projecten behapbaar
- Goede formatting maakt output direct bruikbaar
- Prompt chaining automatiseert complete workflows

Experimenteer met deze technieken en pas ze aan voor jouw specifieke use cases!
  `,
};