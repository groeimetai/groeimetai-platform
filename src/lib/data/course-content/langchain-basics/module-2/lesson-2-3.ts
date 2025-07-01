import { Lesson } from '@/lib/data/courses'

export const lesson23: Lesson = {
  id: 'lesson-2-3',
  title: 'Memory Management',
  duration: '30 min',
  content: `# Memory Management in LangChain

Memory management is cruciaal voor het bouwen van conversationele AI applicaties. In deze les verkennen we verschillende memory types en hun toepassingen.

## ConversationBufferMemory

De meest eenvoudige vorm van memory - slaat alle conversaties op in een buffer.

<iframe src="https://codesandbox.io/embed/langchain-buffer-memory-nl-x7k9m2?fontsize=14&hidenavigation=1&theme=dark&view=editor"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="LangChain Buffer Memory Nederlands"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

### Belangrijke Eigenschappen

\`\`\`python
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain.llms import OpenAI

# Basis setup
memory = ConversationBufferMemory()
llm = OpenAI(temperature=0.7)
conversation = ConversationChain(
    llm=llm,
    memory=memory,
    verbose=True
)

# Nederlandse conversatie
response = conversation.predict(input="Hoi, ik ben Lisa uit Utrecht")
# Output: "Hallo Lisa! Leuk je te ontmoeten. Hoe is het in Utrecht?"

response = conversation.predict(input="Ken je mijn naam nog?")
# Output: "Ja natuurlijk, jij bent Lisa uit Utrecht!"
\`\`\`

### Voordelen en Nadelen

**Voordelen:**
- Simpel te implementeren
- Behoudt volledige context
- Perfect voor korte gesprekken

**Nadelen:**
- Geheugengebruik groeit lineair
- Wordt duur bij lange gesprekken
- Geen intelligente filtering

## ConversationSummaryMemory met Nederlandse Prompts

Voor langere gesprekken kun je beter summaries gebruiken.

<iframe src="https://codesandbox.io/embed/langchain-summary-memory-nl-m3n8k5?fontsize=14&hidenavigation=1&theme=dark&view=editor"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="LangChain Summary Memory Nederlands"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

### Nederlandse Summary Prompts

\`\`\`python
from langchain.memory import ConversationSummaryMemory
from langchain.prompts import PromptTemplate

# Custom Nederlandse summary prompt
dutch_summary_prompt = PromptTemplate(
    input_variables=["summary", "new_lines"],
    template="""Huidige samenvatting van het gesprek:
{summary}

Nieuwe conversatielijnen:
{new_lines}

Maak een beknopte nieuwe samenvatting in het Nederlands, 
behoud belangrijke details zoals namen, locaties en afspraken."""
)

memory = ConversationSummaryMemory(
    llm=llm,
    prompt=dutch_summary_prompt,
    memory_key="chat_history",
    return_messages=True
)

# Lange conversatie wordt automatisch samengevat
conversation = ConversationChain(
    llm=llm,
    memory=memory
)
\`\`\`

### Progressive Summarization

\`\`\`python
# Start met details
memory.save_context(
    {"input": "Ik ben Mark van der Berg, CEO van TechStart BV"},
    {"output": "Aangenaam kennis te maken, meneer Van der Berg!"}
)

memory.save_context(
    {"input": "We zoeken een AI oplossing voor klantenservice"},
    {"output": "Interessant! Wat voor soort vragen krijgen jullie veel?"}
)

# Na meerdere berichten wordt het samengevat tot:
# "Mark van der Berg (CEO TechStart BV) zoekt AI oplossing voor klantenservice"
\`\`\`

## Vector Store Memory Integration

Voor semantische zoekfunctionaliteit in conversatiegeschiedenis.

<iframe src="https://codesandbox.io/embed/langchain-vector-memory-nl-p9k3m7?fontsize=14&hidenavigation=1&theme=dark&view=editor"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="LangChain Vector Store Memory"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

### Implementatie met Nederlandse Embeddings

\`\`\`python
from langchain.memory import VectorStoreRetrieverMemory
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
import faiss

# Nederlandse embeddings setup
embeddings = OpenAIEmbeddings()
embedding_size = 1536
index = faiss.IndexFlatL2(embedding_size)
vectorstore = FAISS(
    embeddings.embed_query,
    index,
    InMemoryDocstore({}),
    {}
)

# Vector memory met Nederlandse context
memory = VectorStoreRetrieverMemory(
    retriever=vectorstore.as_retriever(
        search_kwargs=dict(k=3)  # Top 3 relevante memories
    ),
    memory_key="relevant_history"
)

# Sla Nederlandse business context op
memory.save_context(
    {"input": "Onze hoofdvestiging is in Amsterdam"},
    {"output": "Amsterdam, mooi! Het tech hub van Nederland."}
)

memory.save_context(
    {"input": "We hebben ook kantoren in Eindhoven en Groningen"},
    {"output": "Uitstekende spreiding over Nederland!"}
)

# Later in gesprek - haalt relevante locatie info op
relevant_docs = memory.retriever.get_relevant_documents(
    "Waar zijn jullie gevestigd?"
)
\`\`\`

## Entity Memory voor Nederlandse Namen en Bedrijven

Specifiek ontworpen voor het bijhouden van entiteiten.

<iframe src="https://codesandbox.io/embed/langchain-entity-memory-nl-t5m9k2?fontsize=14&hidenavigation=1&theme=dark&view=editor"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="LangChain Entity Memory Nederlands"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

### Nederlandse Entity Extraction

\`\`\`python
from langchain.memory import ConversationEntityMemory
from langchain.memory.entity import SQLiteEntityStore

# Nederlandse entity memory met custom prompts
entity_memory = ConversationEntityMemory(
    llm=llm,
    entity_store=SQLiteEntityStore(),
    entity_extraction_prompt=PromptTemplate(
        input_variables=["history", "input"],
        template="""Extracteer Nederlandse namen, bedrijven en locaties:

Gesprek:
{history}

Laatste bericht: {input}

Entiteiten (gescheiden door komma's):"""
    )
)

# Voorbeeld conversatie
entity_memory.save_context(
    {"input": "Jan de Vries van Philips komt morgen langs"},
    {"output": "Prima, ik noteer de afspraak met meneer De Vries"}
)

entity_memory.save_context(
    {"input": "Hij brengt zijn collega Marieke mee"},
    {"output": "Goed om te weten, dan reserveer ik voor twee personen"}
)

# Check entities
entities = entity_memory.entity_store.get_all()
# {'Jan de Vries': 'Werkt bij Philips, heeft afspraak morgen',
#  'Philips': 'Bedrijf waar Jan de Vries werkt',
#  'Marieke': 'Collega van Jan de Vries bij Philips'}
\`\`\`

### BSN en Privacy Handling

\`\`\`python
# Privacy-aware entity memory
class DutchPrivacyEntityMemory(ConversationEntityMemory):
    def _extract_entities(self, input_text: str) -> List[str]:
        # Filter BSN patronen
        bsn_pattern = r'\b\d{9}\b'
        cleaned_text = re.sub(bsn_pattern, '[BSN]', input_text)
        
        # Extract entities van cleaned text
        return super()._extract_entities(cleaned_text)
    
    def save_context(self, inputs: Dict, outputs: Dict):
        # Hash gevoelige data
        if "bsn" in inputs.get("input", "").lower():
            inputs["input"] = self._anonymize_sensitive_data(inputs["input"])
        
        super().save_context(inputs, outputs)
\`\`\`

## Performance Vergelijking

<iframe src="https://codesandbox.io/embed/langchain-memory-performance-nl-v8k5m9?fontsize=14&hidenavigation=1&theme=dark&view=editor"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="Memory Performance Comparison"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

### Benchmark Resultaten

| Memory Type | Token Usage (1000 msgs) | Response Time | Best Use Case |
|------------|------------------------|---------------|---------------|
| Buffer | 50,000+ tokens | 50ms | Korte gesprekken (<20 berichten) |
| Summary | ~2,000 tokens | 200ms | Lange gesprekken, algemene context |
| Vector Store | ~3,000 tokens | 150ms | Knowledge retrieval, FAQ bots |
| Entity | ~1,500 tokens | 180ms | CRM integratie, contactbeheer |

### Memory Selection Strategy

\`\`\`python
def select_memory_strategy(conversation_type: str, expected_length: int):
    """Selecteer optimale memory strategy voor Nederlandse use case"""
    
    if expected_length < 20:
        return ConversationBufferMemory()
    
    elif conversation_type == "customer_service":
        # Combineer summary + entity voor klantenservice
        return CombinedMemory(
            memories=[
                ConversationSummaryMemory(llm=llm),
                ConversationEntityMemory(llm=llm)
            ]
        )
    
    elif conversation_type == "technical_support":
        # Vector store voor technische documentatie
        return VectorStoreRetrieverMemory(
            retriever=vectorstore.as_retriever()
        )
    
    else:
        # Default naar summary memory
        return ConversationSummaryMemory(llm=llm)
\`\`\`

## Best Practices

1. **Start simpel**: Begin met BufferMemory, upgrade wanneer nodig
2. **Monitor token usage**: Stel limieten in voor production
3. **Privacy first**: Hash of verwijder gevoelige data zoals BSN
4. **Test retrieval quality**: Vooral belangrijk voor vector stores
5. **Combineer strategies**: Gebruik meerdere memory types voor complexe apps

## Oefeningen

1. Implementeer een chatbot met BufferMemory die na 10 berichten automatisch switcht naar SummaryMemory
2. Bouw een entity tracker voor Nederlandse bedrijfsnamen met KvK nummer validatie
3. Creëer een privacy-compliant memory system dat BSN en andere PII data filtert
4. Benchmark verschillende memory strategies voor jouw use case`
}