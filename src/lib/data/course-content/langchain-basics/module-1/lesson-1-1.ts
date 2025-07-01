import { Lesson } from '@/lib/data/courses'

export const lesson1_1: Lesson = {
  id: 'lesson-1-1',
  title: 'Wat is LangChain en waarom gebruiken?',
  duration: '20 min',
  content: `
# Wat is LangChain en waarom gebruiken?

LangChain is een krachtig framework voor het bouwen van applicaties met Large Language Models (LLMs). Het lost de grootste uitdagingen op bij het werken met AI in productie.

## Wat is LangChain?

LangChain is een **open-source framework** dat het eenvoudig maakt om:
- 🔗 LLMs te verbinden met externe data bronnen
- 🧠 Complexe AI workflows te bouwen
- 💾 Context en geheugen toe te voegen aan AI applicaties
- 🔧 Tools en functies te integreren met LLMs

## De Problemen die LangChain Oplost

### 1. Context Limitaties
**Probleem**: LLMs hebben beperkte context windows
**Oplossing**: LangChain's document loaders en vector stores

### 2. Geen Toegang tot Real-time Data
**Probleem**: LLMs kennen alleen training data
**Oplossing**: Tools en API integraties via LangChain

### 3. Geen Geheugen tussen Sessies
**Probleem**: Elke chat is een nieuwe conversatie
**Oplossing**: Memory componenten voor persistente context

### 4. Complexe Prompt Management
**Probleem**: Prompts worden snel onbeheersbaar
**Oplossing**: Prompt templates en chains

## Waarom LangChain Gebruiken?

### Voor Developers
- **Snellere ontwikkeling**: Pre-built componenten
- **Modulair design**: Mix & match functionaliteit
- **Best practices**: Ingebouwde optimalisaties
- **Community**: Grote ecosystem van tools

### Voor Businesses
- **Production-ready**: Schaalbare architectuur
- **Vendor-agnostic**: Werkt met alle LLMs
- **Cost-effective**: Optimaliseer API calls
- **Maintainable**: Gestructureerde codebase

## Real-World Use Cases

### 1. Customer Support Bot
- Verbind met kennisbank
- Behoud conversatie context
- Escaleer naar menselijke agent

### 2. Document Analysis
- Analyseer PDF/Word documenten
- Beantwoord vragen over content
- Genereer samenvattingen

### 3. Code Assistant
- Doorzoek codebases
- Genereer code snippets
- Debug met context

### 4. Research Assistant
- Web search integratie
- Bron verificatie
- Rapport generatie

## LangChain vs Alternatieven

| Feature | LangChain | Direct API | Custom Solution |
|---------|-----------|------------|-----------------|
| Setup tijd | Minutes | Uren | Dagen/Weken |
| Flexibiliteit | Hoog | Laag | Zeer Hoog |
| Maintenance | Community | Zelf | Volledig Zelf |
| Learning curve | Medium | Laag | Hoog |
| Schaalbaarheid | Excellent | Beperkt | Variabel |

## Wanneer WEL LangChain gebruiken

✅ Je bouwt een productie AI applicatie
✅ Je hebt externe data bronnen nodig
✅ Je wilt snel prototypen
✅ Je werkt met meerdere LLMs
✅ Je hebt complexe workflows

## Wanneer NIET LangChain gebruiken

❌ Simpele one-off API calls
❌ Je hebt zeer specifieke requirements
❌ Minimale dependencies vereist
❌ Learning curve is een blocker

## De Kracht van Composability

LangChain's grootste kracht is **composability** - het combineren van simpele componenten tot complexe systemen:

\`\`\`
Document Loader → Text Splitter → Embeddings → Vector Store → Retriever → LLM → Output Parser
\`\`\`

Elke component is:
- Zelfstandig te gebruiken
- Makkelijk te vervangen
- Goed gedocumenteerd
- Battle-tested
        `,
  codeExamples: [
    {
      id: 'example-1',
      title: 'LangChain vs Directe OpenAI API',
      language: 'python',
      code: `# Directe OpenAI API - Basis maar beperkt
import openai

response = openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Wat is de hoofdstad van Frankrijk?"}]
)
print(response.choices[0].message.content)

# LangChain - Krachtig en uitbreidbaar
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage
from langchain.memory import ConversationBufferMemory

# Initialize met memory
llm = ChatOpenAI(temperature=0)
memory = ConversationBufferMemory()

# Eerste vraag
response1 = llm([HumanMessage(content="Wat is de hoofdstad van Frankrijk?")])
memory.save_context(
    {"input": "Wat is de hoofdstad van Frankrijk?"}, 
    {"output": response1.content}
)

# Tweede vraag - met context!
response2 = llm([
    HumanMessage(content=f"{memory.buffer}\\nHoeveel inwoners heeft deze stad?")
])
print(response2.content)  # Weet dat het over Parijs gaat!`,
      explanation: 'LangChain voegt automatisch memory, context, en structure toe aan je LLM interacties.'
    },
    {
      id: 'example-2',
      title: 'Document Q&A in 10 regels',
      language: 'python',
      code: `from langchain.document_loaders import TextLoader
from langchain.indexes import VectorstoreIndexCreator
from langchain.chat_models import ChatOpenAI

# Laad document
loader = TextLoader("bedrijfshandboek.txt")

# Maak searchable index
index = VectorstoreIndexCreator().from_loaders([loader])

# Stel vraag over document
query = "Wat is het vakantiebeleid?"
response = index.query(query, llm=ChatOpenAI())

print(response)
# Output: "Volgens het bedrijfshandboek hebben medewerkers recht op 25 vakantiedagen..."`,
      explanation: 'Wat normaal honderden regels code zou zijn, doet LangChain in 10 regels.'
    }
  ],
  assignments: [
    {
      id: 'assignment-1-1',
      title: 'LangChain Use Case Analyse',
      description: 'Analyseer verschillende scenarios en bepaal of LangChain de juiste tool is.',
      difficulty: 'easy',
      type: 'quiz',
      initialCode: `# Bepaal voor elk scenario of LangChain een goede keuze is (Ja/Nee) en waarom

scenarios = {
    "scenario_1": {
        "beschrijving": "Een chatbot die vragen beantwoordt over 1000+ product handleidingen",
        "langchain_geschikt": "___",  # Ja/Nee
        "reden": "___"
    },
    "scenario_2": {
        "beschrijving": "Een simpele vertaal-API wrapper",
        "langchain_geschikt": "___",  # Ja/Nee
        "reden": "___"
    },
    "scenario_3": {
        "beschrijving": "Een AI assistent die code kan schrijven EN uitvoeren",
        "langchain_geschikt": "___",  # Ja/Nee
        "reden": "___"
    },
    "scenario_4": {
        "beschrijving": "Een one-time script om 10 product beschrijvingen te genereren",
        "langchain_geschikt": "___",  # Ja/Nee
        "reden": "___"
    },
    "scenario_5": {
        "beschrijving": "Een research tool die web search, PDFs, en databases combineert",
        "langchain_geschikt": "___",  # Ja/Nee
        "reden": "___"
    }
}

# Bonus vraag: Wat zijn de top 3 features van LangChain die het meest waardevol zijn?
top_3_features = [
    "1. ___",
    "2. ___", 
    "3. ___"
]`,
      solution: `scenarios = {
    "scenario_1": {
        "beschrijving": "Een chatbot die vragen beantwoordt over 1000+ product handleidingen",
        "langchain_geschikt": "Ja",
        "reden": "Perfect use case - heeft document loading, vector search, en Q&A chains nodig"
    },
    "scenario_2": {
        "beschrijving": "Een simpele vertaal-API wrapper",
        "langchain_geschikt": "Nee",
        "reden": "Overkill - directe API call is simpeler en efficiënter"
    },
    "scenario_3": {
        "beschrijving": "Een AI assistent die code kan schrijven EN uitvoeren",
        "langchain_geschikt": "Ja",
        "reden": "Heeft tools/agents nodig voor code execution - LangChain excel hierin"
    },
    "scenario_4": {
        "beschrijving": "Een one-time script om 10 product beschrijvingen te genereren",
        "langchain_geschikt": "Nee",
        "reden": "Te simpel - directe API calls zijn sneller voor one-time tasks"
    },
    "scenario_5": {
        "beschrijving": "Een research tool die web search, PDFs, en databases combineert",
        "langchain_geschikt": "Ja",
        "reden": "Complex multi-source systeem - precies waar LangChain voor gemaakt is"
    }
}

top_3_features = [
    "1. Document loaders en vector stores voor knowledge bases",
    "2. Memory componenten voor conversatie context", 
    "3. Tools en agents voor externe integraties"
]`,
      hints: [
        'LangChain is best voor complexe, multi-component systemen',
        'Voor simpele one-off taken is directe API vaak beter',
        'Denk aan schaalbaarheid en maintenance'
      ]
    }
  ],
  resources: [
    {
      title: 'LangChain Official Documentation',
      url: 'https://python.langchain.com/docs/get_started/introduction',
      type: 'documentation'
    },
    {
      title: 'LangChain Conceptual Guide',
      url: 'https://python.langchain.com/docs/get_started/concepts',
      type: 'guide'
    },
    {
      title: 'LangChain GitHub Repository',
      url: 'https://github.com/langchain-ai/langchain',
      type: 'code'
    }
  ]
}