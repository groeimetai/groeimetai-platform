import { Lesson } from '@/lib/data/courses'

export const lesson1_1: Lesson = {
  id: 'lesson-1-1',
  title: 'Introductie tot RAG: Waarom traditionele chatbots tekortschieten',
  duration: '25 min',
  content: `# Introductie tot RAG: Waarom traditionele chatbots tekortschieten

## De Beperkingen van Traditionele AI Chatbots

Traditionele chatbots en LLMs hebben fundamentele beperkingen die hun bruikbaarheid in bedrijfscontexten beperken:

### 1. Verouderde Kennis
- **Probleem**: LLMs zijn getraind op data tot een bepaalde datum
- **Impact**: Geen toegang tot recente informatie of bedrijfsspecifieke data
- **Voorbeeld**: ChatGPT kent jouw productcatalogus of interne procedures niet

### 2. Hallucinaties
- **Probleem**: LLMs verzinnen informatie wanneer ze het antwoord niet weten
- **Impact**: Onbetrouwbare antwoorden in kritieke situaties
- **Voorbeeld**: Verzint niet-bestaande features of prijzen

### 3. Geen Domeinspecifieke Kennis
- **Probleem**: Algemene training mist specifieke bedrijfscontext
- **Impact**: Generieke antwoorden die niet aansluiten bij jouw organisatie
- **Voorbeeld**: Kent jouw bedrijfsprocessen of compliance regels niet

## Wat is RAG?

**Retrieval-Augmented Generation (RAG)** combineert het beste van twee werelden:
- 🔍 **Information Retrieval**: Zoekt relevante informatie in jouw documenten
- 🤖 **Language Generation**: Gebruikt LLMs om natuurlijke antwoorden te genereren

### De RAG Workflow

\`\`\`mermaid
graph LR
    A[User Query] --> B[Embedding]
    B --> C[Vector Search]
    C --> D[Relevant Documents]
    D --> E[Context + Query]
    E --> F[LLM]
    F --> G[Augmented Response]
\`\`\`

## Waarom RAG de Game-Changer is

### 1. Actuele Informatie
- Toegang tot real-time bedrijfsdata
- Altijd up-to-date antwoorden
- Geen hertraining nodig

### 2. Betrouwbaarheid
- Antwoorden gebaseerd op echte documenten
- Bronvermelding mogelijk
- Verminderde hallucinaties

### 3. Domeinexpertise
- Specifieke kennis uit jouw documenten
- Bedrijfscontext in elk antwoord
- Compliance-vriendelijk

### 4. Kostenefficiënt
- Geen dure fine-tuning nodig
- Gebruik bestaande LLMs
- Schaalbaar met groeiende documentsets

## Real-World Toepassingen

### Customer Support
- **Zonder RAG**: "Ik weet niet welke garantievoorwaarden jullie hebben"
- **Met RAG**: "Volgens document X hebben producten van categorie Y een garantie van 2 jaar"

### HR Assistent
- **Zonder RAG**: "Raadpleeg het HR handboek voor verlofregels"
- **Met RAG**: "Je hebt recht op 25 vakantiedagen plus 3 bonusdagen na 5 jaar dienst"

### Technical Documentation
- **Zonder RAG**: "Zoek in de documentatie voor API endpoints"
- **Met RAG**: "De /api/v2/users endpoint accepteert POST requests met deze parameters..."

## De Kracht van Context

RAG transformeert een algemene AI in een domeinexpert door:
1. **Context Injection**: Relevante informatie wordt toegevoegd aan de prompt
2. **Semantic Understanding**: Begrijpt de betekenis achter queries
3. **Dynamic Responses**: Past antwoorden aan op basis van beschikbare data

## Praktijkvoorbeeld

Stel je voor: een medewerker vraagt "Wat is ons retourbeleid voor elektronica?"

**Traditionele Chatbot**:
\`\`\`
"Retourbeleid verschilt per bedrijf. Raadpleeg uw 
bedrijfsrichtlijnen voor specifieke informatie."
\`\`\`

**RAG-powered Chatbot**:
\`\`\`
"Volgens ons retourbeleid (document: Algemene Voorwaarden v2.3):
- Elektronica kan binnen 30 dagen geretourneerd worden
- Product moet in originele verpakking zitten
- Bewijs van aankoop is vereist
- Verzendkosten worden vergoed bij defecten
Zie pagina 12-13 voor uitzonderingen."
\`\`\``,
  codeExamples: [
    {
      id: 'traditional-vs-rag',
      title: 'Traditionele LLM vs RAG Approach',
      language: 'python',
      code: `# Traditionele LLM approach
def traditional_chatbot(query):
    # Alleen toegang tot getrainde kennis
    response = llm.generate(query)
    return response  # Mogelijk verouderd of incorrect

# RAG approach
def rag_chatbot(query):
    # Stap 1: Zoek relevante documenten
    relevant_docs = vector_store.search(query, k=5)
    
    # Stap 2: Construeer context
    context = "\\n".join([doc.content for doc in relevant_docs])
    
    # Stap 3: Genereer antwoord met context
    prompt = f"""
    Gebruik de volgende context om de vraag te beantwoorden:
    
    Context: {context}
    
    Vraag: {query}
    """
    
    response = llm.generate(prompt)
    return response  # Gebaseerd op actuele bedrijfsdata`
    }
  ],
  assignments: [
    {
      id: 'exercise-1',
      title: 'Identificeer RAG Use Cases',
      description: 'Identificeer 3 use cases binnen jouw organisatie waar RAG waarde kan toevoegen. Beschrijf voor elke use case: het probleem zonder RAG, de oplossing met RAG, en de verwachte impact.',
      type: 'quiz',
      difficulty: 'easy',
      solution: `Voorbeelden van goede use cases:

1. **Klantenservice Kennisbank**
   - Probleem: Agents moeten handmatig zoeken in documentatie
   - RAG oplossing: Direct antwoorden op basis van productdocs
   - Impact: 50% snellere response tijd

2. **Compliance Q&A**
   - Probleem: Juridische vragen vereisen expert consultatie
   - RAG oplossing: Instant antwoorden uit compliance documenten
   - Impact: €10k/maand besparing op consultancy

3. **Onboarding Assistent**
   - Probleem: Nieuwe medewerkers verdwalen in documentatie
   - RAG oplossing: Gepersonaliseerde antwoorden uit HR docs
   - Impact: 3 dagen snellere productiviteit`
    }
  ],
  resources: [
    {
      title: 'What is Retrieval-Augmented Generation?',
      url: 'https://aws.amazon.com/what-is/retrieval-augmented-generation/',
      type: 'article'
    },
    {
      title: 'The Illustrated Retrieval-Augmented Generation',
      url: 'https://jalammar.github.io/illustrated-retrieval-augmented-generation/',
      type: 'article'
    },
    {
      title: 'RAG vs Fine-tuning Comparison',
      url: 'https://www.anyscale.com/blog/fine-tuning-vs-rag',
      type: 'documentation'
    }
  ]
}