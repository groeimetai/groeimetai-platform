import { Lesson } from '@/lib/data/courses'

export const lesson1_2: Lesson = {
  id: 'lesson-1-2',
  title: 'LangChain componenten overzicht',
  duration: '30 min',
  content: `
# LangChain Componenten Overzicht

LangChain bestaat uit modulaire componenten die je kunt combineren. Laten we elke hoofdcategorie verkennen.

## 🧠 Models - Het Brein

### LLMs (Language Models)
Basis text-in, text-out modellen:
- OpenAI GPT-3.5/4
- Anthropic Claude
- Google PaLM
- Open source (LLaMA, Mistral)

### Chat Models
Geoptimaliseerd voor conversaties:
- ChatGPT
- Claude Chat
- Gemini

### Embeddings
Zet tekst om naar vectors:
- OpenAI Embeddings
- Sentence Transformers
- Cohere Embeddings

## 📝 Prompts - De Instructies

### Prompt Templates
Herbruikbare prompt structuren:
\`\`\`python
template = """Je bent een {role}.
Beantwoord deze vraag: {question}
Gebruik deze context: {context}"""
\`\`\`

### Example Selectors
Dynamisch few-shot examples kiezen

### Output Parsers
Structureer LLM output (JSON, lists, etc.)

## 🔗 Chains - De Workflows

### Simpele Chains
Lineaire flow: A → B → C

### Sequential Chains
Output van één wordt input van volgende

### Router Chains
Conditionele routing based op input

### Map-Reduce Chains
Parallel processing van grote datasets

## 💾 Memory - Het Geheugen

### Conversation Buffer Memory
Bewaar volledige conversatie geschiedenis

### Conversation Summary Memory
Automatische samenvatting van geschiedenis

### Entity Memory
Onthoud specifieke entiteiten/feiten

### Vector Store Memory
Semantic search in conversation history

## 📚 Indexes - De Kennis

### Document Loaders
Laad data uit verschillende bronnen:
- PDF, Word, PowerPoint
- Web pages, YouTube
- Databases, APIs
- Code repositories

### Text Splitters
Verdeel documenten in chunks:
- Character splitter
- Token splitter
- Semantic splitter

### Vector Stores
Bewaar en doorzoek embeddings:
- Pinecone
- Weaviate
- ChromaDB
- FAISS

### Retrievers
Haal relevante informatie op:
- Similarity search
- MMR (Maximum Marginal Relevance)
- Contextual compression

## 🛠️ Agents & Tools - De Acties

### Agents
Autonomous decision makers:
- Zero-shot ReAct
- Conversational
- OpenAI Functions
- Plan-and-Execute

### Tools
Externe functionaliteit:
- Web search (Google, DuckDuckGo)
- Calculator
- Python REPL
- API calls
- Custom tools

## 🧩 Hoe Components Samenwerken

### Voorbeeld: Customer Support System

\`\`\`
1. Document Loader → Laad FAQ documenten
2. Text Splitter → Verdeel in chunks
3. Embeddings → Converteer naar vectors
4. Vector Store → Bewaar voor search
5. Retriever → Vind relevante info
6. Prompt Template → Structureer vraag
7. LLM → Genereer antwoord
8. Output Parser → Format response
9. Memory → Bewaar conversatie
\`\`\`

## Component Selectie Guide

### Voor Document Q&A
- **Loader**: PDF/TextLoader
- **Splitter**: RecursiveCharacterTextSplitter
- **Vector Store**: ChromaDB (lokaal) of Pinecone (cloud)
- **Chain**: RetrievalQA

### Voor Chatbots
- **Model**: ChatOpenAI of ChatAnthropic
- **Memory**: ConversationBufferMemory
- **Chain**: ConversationChain

### Voor Data Analysis
- **Tools**: PythonREPL, Calculator
- **Agent**: Zero-shot ReAct
- **Memory**: ConversationSummaryMemory

### Voor Web Research
- **Tools**: GoogleSearch, WebBrowser
- **Agent**: Plan-and-Execute
- **Chain**: MapReduceDocumentsChain

## Best Practices per Component

### Models
- Kies het juiste model voor je use case
- Overweeg kosten vs performance
- Test verschillende temperature settings

### Prompts
- Gebruik templates voor consistency
- Test prompts grondig
- Version control je prompts

### Memory
- Kies memory type based op conversation length
- Implementeer cleanup strategies
- Monitor memory usage

### Vector Stores
- Index regelmatig updaten
- Optimaliseer chunk size
- Test verschillende embedding modellen
  `,
  codeExamples: [
    {
      id: 'example-3',
      title: 'Component Compositie Voorbeeld',
      language: 'python',
      code: `from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI

# 1. Document Loader
loader = PyPDFLoader("employee_handbook.pdf")
documents = loader.load()

# 2. Text Splitter
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)
splits = text_splitter.split_documents(documents)

# 3. Embeddings & Vector Store
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(
    documents=splits,
    embedding=embeddings
)

# 4. Retriever
retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 3}
)

# 5. QA Chain
qa_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(temperature=0),
    chain_type="stuff",
    retriever=retriever,
    return_source_documents=True
)

# 6. Ask Questions!
result = qa_chain({"query": "Wat is het thuiswerkbeleid?"})
print(f"Antwoord: {result['result']}")
print(f"Bronnen: {[doc.metadata for doc in result['source_documents']]}")`,
      explanation: 'Elke component heeft een specifieke rol en ze werken naadloos samen.'
    },
    {
      id: 'example-4',
      title: 'Memory Types in Actie',
      language: 'python',
      code: `from langchain.memory import (
    ConversationBufferMemory,
    ConversationSummaryMemory,
    ConversationBufferWindowMemory
)
from langchain.chat_models import ChatOpenAI
from langchain.chains import ConversationChain

llm = ChatOpenAI(temperature=0)

# Type 1: Buffer Memory - Bewaart alles
buffer_memory = ConversationBufferMemory()
buffer_chain = ConversationChain(llm=llm, memory=buffer_memory)

# Type 2: Summary Memory - Vat samen
summary_memory = ConversationSummaryMemory(llm=llm)
summary_chain = ConversationChain(llm=llm, memory=summary_memory)

# Type 3: Window Memory - Laatste N messages
window_memory = ConversationBufferWindowMemory(k=3)  # Laatste 3 exchanges
window_chain = ConversationChain(llm=llm, memory=window_memory)

# Test alle drie
conversations = [
    "Hallo, ik ben Jan en werk als developer",
    "Ik gebruik vooral Python en JavaScript", 
    "Mijn favoriete framework is Django",
    "Wat weet je nog over mij?"
]

print("=== BUFFER MEMORY (bewaart alles) ===")
for msg in conversations:
    response = buffer_chain.predict(input=msg)
    print(f"Human: {msg}")
    print(f"AI: {response}\\n")

print("=== SUMMARY MEMORY (samenvattingen) ===")
print(f"Summary: {summary_memory.buffer}")

print("=== WINDOW MEMORY (laatste 3) ===")
print(f"Window: {window_memory.buffer}")`,
      explanation: 'Verschillende memory types voor verschillende use cases - kies based op je needs.'
    },
    {
      id: 'example-5',
      title: 'Custom Tool voor Agents',
      language: 'python',
      code: `from langchain.tools import BaseTool
from langchain.agents import initialize_agent, AgentType
from langchain.chat_models import ChatOpenAI
from typing import Optional
from langchain.callbacks.manager import CallbackManagerForToolRun

# Maak een custom tool
class WeatherTool(BaseTool):
    name = "weather"
    description = "Get current weather for a city"
    
    def _run(
        self, 
        city: str, 
        run_manager: Optional[CallbackManagerForToolRun] = None
    ) -> str:
        """Simuleer weather API call"""
        # In werkelijkheid zou je hier een echte API aanroepen
        weather_data = {
            "Amsterdam": "18°C, Bewolkt",
            "Rotterdam": "17°C, Lichte regen",
            "Utrecht": "19°C, Zonnig"
        }
        return weather_data.get(city, "Stad niet gevonden")
    
    async def _arun(self, city: str) -> str:
        """Async version"""
        raise NotImplementedError("Weather tool does not support async")

# Maak nog een tool
class NewsSearchTool(BaseTool):
    name = "news_search"
    description = "Search for recent news about a topic"
    
    def _run(self, query: str, run_manager=None) -> str:
        # Simuleer news search
        return f"Laatste nieuws over '{query}': [Artikel 1], [Artikel 2], [Artikel 3]"
    
    async def _arun(self, query: str) -> str:
        raise NotImplementedError("News tool does not support async")

# Initialize agent met custom tools
tools = [WeatherTool(), NewsSearchTool()]
llm = ChatOpenAI(temperature=0)

agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True
)

# Test de agent
result = agent.run(
    "Wat is het weer in Amsterdam en zijn er nieuws artikelen over het weer?"
)
print(result)`,
      explanation: 'Custom tools geven agents superkrachten - van weather APIs tot database queries.'
    }
  ],
  assignments: [
    {
      id: 'assignment-1-2',
      title: 'Component Matching Game',
      description: 'Match de juiste LangChain componenten met use cases.',
      difficulty: 'medium',
      type: 'code',
      initialCode: `# Match elke use case met de juiste LangChain componenten

use_cases = {
    "pdf_qa_system": {
        "beschrijving": "Q&A systeem voor technische handleidingen (PDFs)",
        "components_nodig": {
            "loader": "___",      # Welke loader?
            "splitter": "___",    # Welke splitter?
            "vectorstore": "___", # Welke vectorstore?
            "chain": "___",       # Welke chain?
            "memory": "___"       # Welke memory type?
        }
    },
    "customer_chatbot": {
        "beschrijving": "24/7 customer support chatbot met kennisbank",
        "components_nodig": {
            "model": "___",       # Welk model type?
            "memory": "___",      # Welke memory?
            "tools": ["___", "___"],  # Welke tools?
            "agent": "___"        # Welk agent type?
        }
    },
    "code_analyzer": {
        "beschrijving": "Analyseer en leg Python codebases uit",
        "components_nodig": {
            "loader": "___",      # Voor Python files
            "chain": "___",       # Voor analyse
            "tools": ["___"],     # Voor code execution
            "output_parser": "___" # Voor structured output
        }
    },
    "research_assistant": {
        "beschrijving": "Online research met bron verificatie",
        "components_nodig": {
            "tools": ["___", "___", "___"],  # Web + verificatie
            "agent": "___",       # Voor planning
            "memory": "___",      # Voor research trail
            "chain": "___"        # Voor synthesis
        }
    }
}

# Bonus: Rangschik deze vector stores van snelst naar meest schaalbaar
vector_stores_ranking = [
    "___",  # 1. Snelst (lokaal)
    "___",  # 2. 
    "___",  # 3.
    "___"   # 4. Meest schaalbaar (cloud)
]`,
      solution: `use_cases = {
    "pdf_qa_system": {
        "beschrijving": "Q&A systeem voor technische handleidingen (PDFs)",
        "components_nodig": {
            "loader": "PyPDFLoader",
            "splitter": "RecursiveCharacterTextSplitter",
            "vectorstore": "Chroma",
            "chain": "RetrievalQA",
            "memory": "ConversationBufferMemory"
        }
    },
    "customer_chatbot": {
        "beschrijving": "24/7 customer support chatbot met kennisbank",
        "components_nodig": {
            "model": "ChatOpenAI",
            "memory": "ConversationSummaryMemory",
            "tools": ["WebBrowser", "Calculator"],
            "agent": "ConversationalAgent"
        }
    },
    "code_analyzer": {
        "beschrijving": "Analyseer en leg Python codebases uit",
        "components_nodig": {
            "loader": "PythonLoader",
            "chain": "AnalyzeDocumentChain",
            "tools": ["PythonREPL"],
            "output_parser": "PydanticOutputParser"
        }
    },
    "research_assistant": {
        "beschrijving": "Online research met bron verificatie",
        "components_nodig": {
            "tools": ["GoogleSearchTool", "WebBrowser", "RequestsGet"],
            "agent": "PlanAndExecuteAgent",
            "memory": "ConversationSummaryBufferMemory",
            "chain": "MapReduceDocumentsChain"
        }
    }
}

vector_stores_ranking = [
    "FAISS",      # 1. Snelst (lokaal, in-memory)
    "Chroma",     # 2. Snel en persistent lokaal
    "Weaviate",   # 3. Self-hosted of cloud
    "Pinecone"    # 4. Meest schaalbaar (managed cloud)
]`,
      hints: [
        'PDFs hebben specifieke loaders nodig',
        'Customer service heeft conversation memory nodig',
        'Research vereist web tools en planning'
      ]
    }
  ]
}