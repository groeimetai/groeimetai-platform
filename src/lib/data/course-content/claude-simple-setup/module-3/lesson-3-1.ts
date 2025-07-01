import type { Lesson } from '@/lib/data/courses';

export const lesson3_1: Lesson = {
  id: 'lesson-3-1',
  title: 'Claude-specifieke prompt technieken',
  duration: '35 min',
  content: `
# Claude-specifieke prompt technieken

Het effectief communiceren met Claude vereist begrip van zijn unieke response stijl en specifieke technieken die zijn prestaties optimaliseren. In deze les verkennen we bewezen strategieën om het meeste uit Claude te halen.

## Understanding Claude's response style

Claude heeft een onderscheidende manier van reageren die verschilt van andere AI-assistenten:

### Kernkenmerken van Claude's stijl:

1. **Thoughtful en genuanceerd**
   - Claude geeft doordachte, evenwichtige antwoorden
   - Erkent complexiteit en nuance in onderwerpen
   - Vermijdt oversimplificatie

2. **Gestructureerd en georganiseerd**
   - Gebruikt natuurlijke hiërarchie in antwoorden
   - Breekt complexe informatie op in behapbare delen
   - Houdt van duidelijke formatting

3. **Eerlijk over beperkingen**
   - Geeft aan wanneer hij onzeker is
   - Erkent kennisbeperkingen
   - Biedt alternatieve perspectieven

### Voorbeeld van Claude's natuurlijke stijl:
\`\`\`
User: "Wat is de beste programmeertaal?"

Claude: "Er is geen objectief 'beste' programmeertaal, omdat verschillende talen excelleren in verschillende contexten:

Voor webontwikkeling:
- JavaScript/TypeScript voor frontend
- Python, Ruby, of Node.js voor backend

Voor systeemprogrammering:
- C/C++ voor performance-kritieke applicaties
- Rust voor memory-safe systeemcode

De beste keuze hangt af van:
- Je specifieke use case
- Team expertise
- Performance vereisten
- Ecosystem en libraries"
\`\`\`

## XML tags voor structuur

Claude reageert uitstekend op XML-tags voor het structureren van complexe prompts. Dit is een krachtige techniek voor duidelijke communicatie.

### Basis XML structuur:

\`\`\`xml
<context>
Hier plaats je achtergrondinfornatie die Claude moet weten
</context>

<task>
De specifieke taak die je wilt dat Claude uitvoert
</task>

<requirements>
- Requirement 1
- Requirement 2
- Requirement 3
</requirements>

<format>
Het gewenste output formaat
</format>
\`\`\`

### Geavanceerde XML patronen:

#### Voor code generatie:
\`\`\`xml
<system_context>
Je bent een senior Python developer die werkt aan een e-commerce platform
</system_context>

<current_code>
def calculate_discount(price, discount_percent):
    return price * (1 - discount_percent / 100)
</current_code>

<task>
Refactor deze functie met:
1. Type hints
2. Input validatie
3. Docstring
4. Unit tests
</task>

<constraints>
- Gebruik Python 3.10+
- Volg PEP 8
- Maximaal 50 regels code
</constraints>
\`\`\`

#### Voor document analyse:
\`\`\`xml
<document>
[Plaats hier het te analyseren document]
</document>

<analysis_framework>
1. Hoofdpunten identificeren
2. Onderliggende argumenten evalueren
3. Sterke en zwakke punten aangeven
4. Conclusie en aanbevelingen
</analysis_framework>

<output_style>
Professioneel rapport format met:
- Executive summary
- Gedetailleerde analyse
- Actiepunten
</output_style>
\`\`\`

## Step-by-step reasoning

Claude excelleert in stapsgewijze redenering. Dit kun je expliciet vragen voor betere resultaten.

### Chain-of-Thought prompting:

\`\`\`
Ik moet een complex probleem oplossen. Laten we dit stap voor stap aanpakken:

<problem>
Een bedrijf heeft 3 servers die elk 99.9% uptime hebben. 
Wat is de kans dat alle drie tegelijk offline zijn?
</problem>

<approach>
1. Eerst: bereken de downtime per server
2. Dan: bepaal de onafhankelijkheid van failures
3. Vervolgens: bereken de gezamenlijke waarschijnlijkheid
4. Tot slot: converteer naar een praktisch antwoord
</approach>

Werk elke stap in detail uit voordat je naar de volgende gaat.
\`\`\`

### Voorbeeld template voor complexe reasoning:

\`\`\`
<reasoning_task>
[Beschrijf het probleem]
</reasoning_task>

<thinking_process>
Stap 1: Identificeer de kerncomponenten
- Component A: ...
- Component B: ...

Stap 2: Analyseer relaties
- Hoe beïnvloedt A component B?
- Welke afhankelijkheden bestaan?

Stap 3: Overweeg alternatieven
- Optie 1: [beschrijving]
- Optie 2: [beschrijving]

Stap 4: Evalueer trade-offs
- Voordelen van elke optie
- Nadelen en risico's

Stap 5: Formuleer conclusie
- Beste aanpak gebaseerd op analyse
- Implementatie aanbevelingen
</thinking_process>
\`\`\`

## Role-based prompting

Claude reageert uitstekend op rol-gebaseerde prompts die context en expertise definiëren.

### Effectieve rol definities:

#### Expert consultant:
\`\`\`
Je bent een senior cloud architect met 15 jaar ervaring in:
- AWS, Azure, en Google Cloud
- Microservices architectuur
- DevOps en CI/CD
- Cost optimization

Een startup vraagt je advies over hun cloud strategie.
Ze hebben:
- 50.000 actieve gebruikers
- €10.000/maand budget
- 5-koppig development team
- Monolithische Node.js applicatie

Geef gedetailleerd advies over:
1. Cloud provider selectie
2. Migration strategie
3. Architectuur aanbevelingen
4. Cost optimization tips
\`\`\`

#### Teacher/instructor:
\`\`\`
Je bent een ervaren programmeer instructor die complexe concepten 
helder kan uitleggen aan beginners.

<topic>Recursie in programmeren</topic>

<audience>
- Beginners met 2 maanden programmeerervaring
- Kennis van functies en loops
- Geen computer science achtergrond
</audience>

<teaching_style>
- Gebruik analogieën uit het dagelijks leven
- Begin met het simpelste voorbeeld
- Bouw geleidelijk complexiteit op
- Include interactieve oefeningen
</teaching_style>
\`\`\`

### Template voor verschillende rollen:

\`\`\`xml
<role>
[Specifieke rol en expertise niveau]
</role>

<background>
[Relevante ervaring en kennis]
</background>

<personality_traits>
- [Trait 1: bijv. "Analytisch en data-gedreven"]
- [Trait 2: bijv. "Praktisch en resultaatgericht"]
- [Trait 3: bijv. "Empathisch en geduldig"]
</personality_traits>

<communication_style>
[Hoe deze rol typisch communiceert]
</communication_style>

<task>
[De specifieke taak vanuit deze rol]
</task>
\`\`\`

## Context setting strategies

Effectieve context setting is cruciaal voor optimale Claude responses.

### Hiërarchische context structuur:

\`\`\`xml
<global_context>
Overkoepelend project: E-learning platform modernisering
Doel: Migratie van legacy PHP naar moderne microservices
Timeline: 6 maanden
Budget: €500.000
</global_context>

<current_sprint_context>
Sprint 3: User authentication service
Team: 4 developers, 1 architect, 1 DevOps
Sprint goals:
- JWT implementation
- OAuth2 integration
- User profile service
</current_sprint_context>

<immediate_task_context>
Taak: Design API endpoints voor user service
Moet voldoen aan:
- RESTful principles
- OpenAPI 3.0 specification
- Backwards compatibility met legacy system
</immediate_task_context>

<question>
Ontwerp de API endpoints voor user registration en authentication
</question>
\`\`\`

### Context templates voor verschillende scenarios:

#### Technical problem solving:
\`\`\`xml
<environment>
- Programmeer taal: [taal en versie]
- Framework: [framework en versie]
- Database: [type en versie]
- Deployment: [platform]
</environment>

<problem_description>
[Gedetailleerde beschrijving van het probleem]
</problem_description>

<attempted_solutions>
1. [Wat je al geprobeerd hebt]
2. [Resultaat van elke poging]
</attempted_solutions>

<constraints>
- [Technische beperkingen]
- [Business requirements]
- [Performance eisen]
</constraints>

<desired_outcome>
[Wat de ideale oplossing zou bereiken]
</desired_outcome>
\`\`\`

#### Creative writing:
\`\`\`xml
<genre>
[Type content: blog, documentatie, marketing, etc.]
</genre>

<audience>
- Primair: [hoofddoelgroep]
- Secundair: [nevendoelgroep]
- Kennis niveau: [beginner/intermediate/expert]
</audience>

<tone>
- Formaliteit: [formeel/informeel/casual]
- Emotie: [inspirerend/informatief/overtuigend]
- Stijl: [academisch/conversational/technisch]
</tone>

<key_messages>
1. [Hoofdboodschap 1]
2. [Hoofdboodschap 2]
3. [Hoofdboodschap 3]
</key_messages>

<call_to_action>
[Wat moet de lezer doen na het lezen]
</call_to_action>
\`\`\`

## Claude-geoptimaliseerde prompt templates

### Master template voor complexe taken:

\`\`\`xml
<meta_instructions>
Lees alle secties zorgvuldig voordat je begint.
Vraag om verduidelijking als iets onduidelijk is.
</meta_instructions>

<role_definition>
[Definieer expertise en perspectief]
</role_definition>

<context_layers>
  <business_context>
    [Waarom deze taak belangrijk is]
  </business_context>
  
  <technical_context>
    [Technische omgeving en beperkingen]
  </technical_context>
  
  <team_context>
    [Wie zijn de stakeholders]
  </team_context>
</context_layers>

<primary_task>
[Hoofdtaak heel specifiek beschreven]
</primary_task>

<subtasks>
1. [Subtaak 1]
2. [Subtaak 2]
3. [Subtaak 3]
</subtasks>

<success_criteria>
- [Meetbaar criterium 1]
- [Meetbaar criterium 2]
- [Meetbaar criterium 3]
</success_criteria>

<output_specification>
  <format>
    [Gewenst format: code, document, lijst, etc.]
  </format>
  
  <structure>
    [Hoe de output georganiseerd moet zijn]
  </structure>
  
  <examples>
    [Voorbeelden van gewenste output]
  </examples>
</output_specification>

<reasoning_request>
Leg je denkproces uit voor belangrijke beslissingen
</reasoning_request>
\`\`\`

### Quick templates voor veelvoorkomende taken:

#### Code review:
\`\`\`
Review deze code als een senior developer:

<code>
[Code hier]
</code>

Focus op:
1. Correctheid en bugs
2. Performance 
3. Leesbaarheid
4. Best practices
5. Security concerns

Geef concrete suggesties voor verbetering.
\`\`\`

#### Documentatie schrijven:
\`\`\`
<function_to_document>
[functie code]
</function_to_document>

Schrijf uitgebreide documentatie inclusief:
- Doel en use case
- Parameters met types
- Return waarde
- Voorbeelden
- Edge cases
- Performance overwegingen
\`\`\`

## Praktische oefening

Probeer deze optimale prompt structuur voor een real-world scenario:

\`\`\`xml
<scenario>
Je moet een REST API ontwerpen voor een boekingssysteem
</scenario>

<your_task>
1. Identificeer de belangrijkste resources
2. Ontwerp de URL structuur  
3. Specificeer HTTP methods voor elke operatie
4. Definieer request/response formats
5. Include error handling
</your_task>

<constraints>
- RESTful principles
- JSON format
- Versioning strategie
- Rate limiting considerations
</constraints>

<deliverable>
Complete API specificatie in OpenAPI 3.0 format
</deliverable>
\`\`\`

## Key takeaways

1. **XML tags** maken complexe prompts duidelijk en gestructureerd
2. **Step-by-step reasoning** helpt Claude bij complexe problemen
3. **Role-based prompting** geeft context en expertise
4. **Hiërarchische context** van globaal naar specifiek werkt het beste
5. **Templates** besparen tijd en verbeteren consistentie

In de volgende les gaan we dieper in op conversation design en hoe je lange, productieve dialogen met Claude kunt voeren.
  `,
};