import type { Lesson } from '@/lib/data/courses'
import { CodeSandbox } from '@/components/CodeSandbox'
import { ApiPlayground } from '@/components/ApiPlayground'
import { Quiz } from '@/components/Quiz'
import { CodingChallenge } from '@/components/LiveCoding/CodingChallenge'

export const lesson3_2: Lesson = {
  id: 'lesson-3-2',
  title: 'Context Management & Memory',
  duration: '50 minuten',
  content: `
## Context Management & Memory: Het Geheim van Effectieve AI-Conversaties

### Inleiding

Een van de grootste uitdagingen bij het werken met Large Language Models is het effectief beheren van context en geheugen. In deze les leer je geavanceerde technieken voor het optimaliseren van conversaties, het omgaan met token limits, en het creëren van coherente multi-turn dialogen. Deze vaardigheden zijn essentieel voor het bouwen van complexe AI-toepassingen en het voeren van productieve langdurige conversaties.

### Token Limits: De Fundamentele Constraint

Tokens zijn de basiseenheden waarmee LLMs tekst verwerken. Elk woord, leesteken, of deel van een woord kan een token zijn. Het begrijpen van tokenisatie is cruciaal voor effectief context management.

#### Token Basics

**Wat is een token?**
- Gemiddeld: 1 token ≈ 0.75 woorden
- In het Nederlands: 1 token ≈ 0.7 woorden (door langere woorden)
- Speciale karakters en emoji's kunnen meerdere tokens zijn

**Live Token Counting Demo:**

<CodeSandbox
  type="runner"
  title="Token Counter met Tiktoken"
  language="javascript"
  code={\`// Real-time Token Counter voor GPT Models
import { encodingForModel } from 'js-tiktoken';

// Initialize tokenizers voor verschillende modellen
const tokenizers = {
  'gpt-3.5-turbo': encodingForModel('gpt-3.5-turbo'),
  'gpt-4': encodingForModel('gpt-4'),
  'gpt-4-turbo': encodingForModel('gpt-4-turbo-preview')
};

function countTokens(text, model = 'gpt-3.5-turbo') {
  const encoder = tokenizers[model];
  const tokens = encoder.encode(text);
  return tokens.length;
}

// Interactieve demo
const testTexts = [
  { text: "Hallo wereld", label: "Simpele groet" },
  { text: "ChatGPT is een grote taalmodel", label: "Nederlandse zin" },
  { text: "Kunstmatige intelligentie revolutioneert de technologie sector", label: "Complexe zin" },
  { text: "🚀💡🎯", label: "Emoji's" },
  { text: "info@example.com", label: "Email adres" },
  { text: "https://www.openai.com/api/pricing", label: "URL" }
];

console.log("=== Token Counting Voorbeelden ===");

testTexts.forEach(({ text, label }) => {
  const tokens = {};
  
  // Tel voor elk model
  Object.keys(tokenizers).forEach(model => {
    tokens[model] = countTokens(text, model);
  });
  
  console.log(\`\n\${label}: "\${text}"\`);
  console.log(\`- GPT-3.5-turbo: \${tokens['gpt-3.5-turbo']} tokens\`);
  console.log(\`- GPT-4: \${tokens['gpt-4']} tokens\`);
  console.log(\`- GPT-4-turbo: \${tokens['gpt-4-turbo']} tokens\`);
});

// Cost calculator
const prices = {
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 }
};

const longText = \`Dit is een langere tekst om de kosten te demonstreren.
Stel je voor dat dit een uitgebreide conversatie is tussen een gebruiker
en een AI-assistent over een complex technisch onderwerp. De conversatie
bevat technische termen, code voorbeelden, en gedetailleerde uitleg.\`;

console.log("\n=== Kosten Berekening ===");
console.log(\`Tekst: \${longText.substring(0, 50)}...\`);

Object.entries(prices).forEach(([model, price]) => {
  const tokenCount = countTokens(longText, model);
  const inputCost = (tokenCount / 1000) * price.input;
  const outputCost = (tokenCount / 1000) * price.output;
  
  console.log(\`\n\${model}:\`);
  console.log(\`- Tokens: \${tokenCount}\`);
  console.log(\`- Input kosten: $\${inputCost.toFixed(4)}\`);
  console.log(\`- Output kosten: $\${outputCost.toFixed(4)}\`);
  console.log(\`- Totaal (in+out): $\${(inputCost + outputCost).toFixed(4)}\`);
});\`}
  expectedOutput={\`=== Token Counting Voorbeelden ===

Simpele groet: "Hallo wereld"
- GPT-3.5-turbo: 2 tokens
- GPT-4: 2 tokens
- GPT-4-turbo: 2 tokens

Nederlandse zin: "ChatGPT is een grote taalmodel"
- GPT-3.5-turbo: 7 tokens
- GPT-4: 7 tokens
- GPT-4-turbo: 7 tokens

Complexe zin: "Kunstmatige intelligentie revolutioneert de technologie sector"
- GPT-3.5-turbo: 11 tokens
- GPT-4: 11 tokens
- GPT-4-turbo: 11 tokens

Emoji's: "🚀💡🎯"
- GPT-3.5-turbo: 3 tokens
- GPT-4: 3 tokens
- GPT-4-turbo: 3 tokens

Email adres: "info@example.com"
- GPT-3.5-turbo: 5 tokens
- GPT-4: 5 tokens
- GPT-4-turbo: 5 tokens

URL: "https://www.openai.com/api/pricing"
- GPT-3.5-turbo: 11 tokens
- GPT-4: 11 tokens
- GPT-4-turbo: 11 tokens

=== Kosten Berekening ===
Tekst: Dit is een langere tekst om de kosten te demonst...

gpt-3.5-turbo:
- Tokens: 47
- Input kosten: $0.0000
- Output kosten: $0.0001
- Totaal (in+out): $0.0001

gpt-4:
- Tokens: 47
- Input kosten: $0.0014
- Output kosten: $0.0028
- Totaal (in+out): $0.0042

gpt-4-turbo:
- Tokens: 47
- Input kosten: $0.0005
- Output kosten: $0.0014
- Totaal (in+out): $0.0019\`}
/>

**Voorbeelden van tokenisatie met tiktoken:**
\`\`\`python
import tiktoken

# Initialize tokenizer voor GPT-3.5/GPT-4
encoding = tiktoken.encoding_for_model("gpt-3.5-turbo")

# Tel tokens
examples = [
    "Hallo wereld",  # 2 tokens
    "ChatGPT",       # 2 tokens
    "Kunstmatige intelligentie",  # 4 tokens
    "🚀",            # 1 token
    "info@example.com"  # 5 tokens
]

for text in examples:
    tokens = encoding.encode(text)
    print(f'"{text}" = {len(tokens)} tokens')
    print(f'Tokens: {tokens}\n')
\`\`\`

#### Model-Specifieke Token Limits Uitleg

**GPT-3.5 Varianten:**
- **GPT-3.5-turbo (4k context)**: 4,096 tokens totaal
  - Geschikt voor: Korte conversaties, Q&A, eenvoudige taken
  - Input + Output samen: max 4,096 tokens
  - Kosten: $0.0005 per 1K input tokens
  
- **GPT-3.5-turbo-16k**: 16,385 tokens totaal
  - Geschikt voor: Langere documenten, complexe conversaties
  - 4x meer context dan standaard versie
  - Kosten: $0.003 per 1K input tokens (6x duurder)

**GPT-4 Varianten:**
- **GPT-4 (8k)**: 8,192 tokens
  - Standaard GPT-4 model
  - Balans tussen capaciteit en kosten
  - Kosten: $0.03 per 1K input tokens
  
- **GPT-4-32k**: 32,768 tokens
  - Voor zeer lange documenten en conversaties
  - Ideaal voor technische documentatie analyse
  - Kosten: $0.06 per 1K input tokens
  
- **GPT-4-turbo (128k)**: 128,000 tokens
  - Grootste context window
  - Kan volledige boeken/rapporten verwerken
  - Kosten: $0.01 per 1K input tokens (optimaal geprijsd)

**Token Counting met tiktoken:**
\`\`\`python
def count_tokens(text, model="gpt-3.5-turbo"):
    """
    Tel exact aantal tokens voor een gegeven tekst en model
    """
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        # Fallback naar cl100k_base encoding
        encoding = tiktoken.get_encoding("cl100k_base")
    
    num_tokens = len(encoding.encode(text))
    return num_tokens

# Voorbeeld gebruik
text = "Dit is een voorbeeld van hoe je tokens kunt tellen."
tokens = count_tokens(text)
print(f"Aantal tokens: {tokens}")
\`\`\`

### Token Optimalisatie Strategieën

#### 1. Efficiënte Prompt Engineering

**Vermijd onnodige herhalingen:**
\`\`\`python
# Inefficiënt (meer tokens)
prompt = """
Analyseer de volgende klantenservice email.
De email is van een klant.
De klant heeft een probleem.
Analyseer wat het probleem is.
Geef een oplossing voor het probleem.

Email: [klant email]
"""

# Efficiënt (minder tokens)
prompt = """
Analyseer deze klantenservice email en identificeer:
1. Het hoofdprobleem
2. Mogelijke oplossing

Email: [klant email]
"""
\`\`\`

**Gebruik afkortingen waar logisch:**
\`\`\`python
# Definieer afkortingen aan het begin
prompt = """
Definities:
- CS = Customer Service
- ROI = Return on Investment
- KPI = Key Performance Indicator

Analyseer de CS metrics en bereken ROI voor onze KPIs.
"""
\`\`\`

#### 2. Context Compressie Technieken

**Samenvattingen voor lange documenten:**
\`\`\`python
def compress_document(document, max_tokens=1000):
    """
    Comprimeert een lang document tot kernpunten
    """
    compression_prompt = f"""
    Vat dit document samen in maximaal {max_tokens} tokens.
    Behoud alle essentiële informatie, data, en conclusies.
    
    Document:
    {document}
    
    Gecomprimeerde versie:
    """
    return call_api(compression_prompt)

# Gebruik in conversation chain
compressed_context = compress_document(long_report)
analysis_prompt = f"Analyseer deze samenvatting: {compressed_context}"
\`\`\`

**Bullet-point conversie:**
\`\`\`python
def convert_to_bullets(text):
    """
    Converteert prose naar efficiënte bullet points
    """
    bullet_prompt = """
    Converteer naar beknopte bullet points:
    - Behoud alle feitelijke informatie
    - Verwijder onnodige woorden
    - Gebruik telegrafische stijl
    
    Tekst: {text}
    
    Bullets:
    """
    return call_api(bullet_prompt)
\`\`\`

#### 3. Selectieve Context Inclusie

**Relevantie-gebaseerde filtering:**
\`\`\`python
class ContextManager:
    def __init__(self, max_tokens=4000):
        self.max_tokens = max_tokens
        self.context_items = []
    
    def add_context(self, text, relevance_score):
        """Voegt context toe met relevantie score"""
        self.context_items.append({
            'text': text,
            'tokens': count_tokens(text),
            'relevance': relevance_score
        })
    
    def get_optimized_context(self):
        """Selecteert meest relevante context binnen token limit"""
        # Sorteer op relevantie
        sorted_items = sorted(self.context_items, 
                            key=lambda x: x['relevance'], 
                            reverse=True)
        
        selected = []
        total_tokens = 0
        
        for item in sorted_items:
            if total_tokens + item['tokens'] <= self.max_tokens:
                selected.append(item['text'])
                total_tokens += item['tokens']
        
        return '\n'.join(selected)
\`\`\`

### Context Window Management Strategies

#### Context Window Optimalisatie

De kern van effectief context management is het intelligent selecteren en comprimeren van informatie binnen de token limits:

\`\`\`python
def optimize_context(messages, max_tokens=3000):
    """
    Optimaliseert conversatie context binnen token limit
    
    Args:
        messages: List van message dictionaries met 'role' en 'content'
        max_tokens: Maximum aantal tokens voor context
    
    Returns:
        Geoptimaliseerde lijst van messages
    """
    # Stap 1: Bereken huidige token usage
    total_tokens = sum(count_tokens(msg['content']) for msg in messages)
    
    if total_tokens <= max_tokens:
        return messages  # Geen optimalisatie nodig
    
    # Stap 2: Prioriteer messages
    prioritized_messages = []
    
    # Altijd behouden: System message en laatste user/assistant exchange
    if messages and messages[0]['role'] == 'system':
        prioritized_messages.append(messages[0])
        remaining_messages = messages[1:]
    else:
        remaining_messages = messages
    
    # Laatste exchange altijd behouden
    if len(remaining_messages) >= 2:
        prioritized_messages.extend(remaining_messages[-2:])
        remaining_messages = remaining_messages[:-2]
    
    # Stap 3: Smart truncation voor overige messages
    if remaining_messages:
        # Sliding window: behoud recentste messages
        window_messages = []
        current_tokens = sum(count_tokens(msg['content']) for msg in prioritized_messages)
        
        # Voeg messages toe van nieuw naar oud totdat limit bereikt is
        for msg in reversed(remaining_messages):
            msg_tokens = count_tokens(msg['content'])
            if current_tokens + msg_tokens <= max_tokens * 0.8:  # 20% buffer
                window_messages.insert(0, msg)
                current_tokens += msg_tokens
            else:
                # Probeer message te comprimeren
                compressed = compress_message(msg['content'])
                compressed_tokens = count_tokens(compressed)
                if current_tokens + compressed_tokens <= max_tokens * 0.9:
                    window_messages.insert(0, {
                        'role': msg['role'],
                        'content': compressed
                    })
                    current_tokens += compressed_tokens
                    break
        
        # Stap 4: Message prioritering
        # Identificeer belangrijke messages (met keywords, entities, etc.)
        important_messages = identify_important_messages(window_messages)
        
        # Combineer prioritized messages
        final_messages = prioritized_messages[:1]  # System message
        final_messages.extend(important_messages)
        final_messages.extend(prioritized_messages[1:])  # Laatste exchange
    
    return final_messages

def compress_message(content, target_ratio=0.6):
    """Comprimeert een message naar target ratio van originele lengte"""
    # Implementatie van intelligente compressie
    sentences = content.split('.')
    
    # Behoud belangrijkste zinnen
    important_sentences = []
    for sentence in sentences:
        if any(keyword in sentence.lower() for keyword in ['belangrijk', 'moet', 'kritiek', 'beslissing']):
            important_sentences.append(sentence)
    
    # Vul aan met overige zinnen tot target bereikt
    remaining = [s for s in sentences if s not in important_sentences]
    target_length = int(len(content) * target_ratio)
    current_length = sum(len(s) for s in important_sentences)
    
    for sentence in remaining:
        if current_length + len(sentence) <= target_length:
            important_sentences.append(sentence)
            current_length += len(sentence)
    
    return '. '.join(important_sentences)

def identify_important_messages(messages):
    """Identificeert messages met hoge prioriteit"""
    scored_messages = []
    
    for msg in messages:
        score = 0
        content_lower = msg['content'].lower()
        
        # Score op basis van content
        if any(keyword in content_lower for keyword in ['besluit', 'conclusie', 'samenvatting']):
            score += 3
        if any(keyword in content_lower for keyword in ['probleem', 'oplossing', 'actie']):
            score += 2
        if msg['role'] == 'user':
            score += 1  # User messages zijn vaak belangrijker
        
        scored_messages.append((score, msg))
    
    # Sorteer op score en behoud top messages
    scored_messages.sort(key=lambda x: x[0], reverse=True)
    return [msg for score, msg in scored_messages[:5]]  # Top 5
\`\`\`

#### Sliding Window Aanpak

Voor lange conversaties kun je een "sliding window" gebruiken die alleen de meest recente en relevante delen behoudt:

\`\`\`python
class SlidingWindowChat:
    def __init__(self, window_size=3000):
        self.window_size = window_size
        self.conversation_history = []
        self.summary = ""
    
    def add_message(self, role, content):
        """Voegt bericht toe aan geschiedenis"""
        self.conversation_history.append({
            'role': role,
            'content': content,
            'tokens': count_tokens(content)
        })
        
        # Check of we window moeten updaten
        if self._total_tokens() > self.window_size:
            self._compress_old_messages()
    
    def _compress_old_messages(self):
        """Comprimeert oude berichten tot samenvatting"""
        # Pak oudste 50% van berichten
        messages_to_compress = self.conversation_history[:len(self.conversation_history)//2]
        
        # Creëer samenvatting
        summary_prompt = f"""
        Vat deze conversatie samen in kernpunten:
        {self._format_messages(messages_to_compress)}
        
        Focus op: beslissingen, acties, belangrijke informatie
        """
        
        new_summary = call_api(summary_prompt)
        self.summary = self.summary + "\n" + new_summary
        
        # Verwijder gecomprimeerde berichten
        self.conversation_history = self.conversation_history[len(messages_to_compress):]
    
    def get_context(self):
        """Retourneert geoptimaliseerde context voor API call"""
        context = []
        
        if self.summary:
            context.append({
                'role': 'system',
                'content': f'Eerdere conversatie samenvatting: {self.summary}'
            })
        
        context.extend(self.conversation_history)
        return context
\`\`\`

#### Hierarchische Context Structuur

Organiseer context in hiërarchische niveaus voor betere controle:

\`\`\`python
class HierarchicalContext:
    def __init__(self):
        self.levels = {
            'critical': [],      # Altijd include (max 500 tokens)
            'important': [],     # Include als ruimte (max 1000 tokens)
            'relevant': [],      # Include indien mogelijk (max 2000 tokens)
            'background': []     # Alleen als veel ruimte over
        }
    
    def add_information(self, info, level='relevant'):
        """Voegt informatie toe op specifiek niveau"""
        self.levels[level].append({
            'content': info,
            'tokens': count_tokens(info),
            'timestamp': datetime.now()
        })
    
    def build_context(self, available_tokens):
        """Bouwt context op basis van beschikbare tokens"""
        context = []
        remaining_tokens = available_tokens
        
        # Prioriteitsvolgorde
        for level in ['critical', 'important', 'relevant', 'background']:
            level_items = self.levels[level]
            
            # Sorteer op timestamp (nieuwste eerst)
            sorted_items = sorted(level_items, 
                                key=lambda x: x['timestamp'], 
                                reverse=True)
            
            for item in sorted_items:
                if item['tokens'] <= remaining_tokens:
                    context.append(item['content'])
                    remaining_tokens -= item['tokens']
                else:
                    break
        
        return '\n'.join(context)
\`\`\`

### Memory Technieken voor Conversaties

#### 1. Conversation Summarization

Implementeer intelligente samenvattingen om lange conversaties te comprimeren:

\`\`\`python
class ConversationSummarizer:
    def __init__(self):
        self.summary_levels = {
            'brief': 100,      # Ultra-kort, alleen hoofdpunten
            'standard': 300,   # Standaard samenvatting
            'detailed': 500    # Gedetailleerd met context
        }
        self.summaries = []
    
    def summarize_conversation(self, messages, level='standard'):
        """
        Creëert hiërarchische samenvattingen van conversaties
        """
        max_tokens = self.summary_levels[level]
        
        # Extract key points
        key_points = self._extract_key_points(messages)
        
        summary_prompt = f"""
        Maak een {level} samenvatting van deze conversatie in max {max_tokens} tokens.
        
        Focus op:
        1. Hoofdonderwerpen besproken
        2. Genomen beslissingen
        3. Actiepunten
        4. Onopgeloste vragen
        
        Conversatie:
        {self._format_messages(messages)}
        
        Key points geïdentificeerd:
        {key_points}
        """
        
        summary = call_api(summary_prompt)
        
        # Store met metadata
        self.summaries.append({
            'summary': summary,
            'level': level,
            'message_count': len(messages),
            'timestamp': datetime.now(),
            'topics': self._extract_topics(messages)
        })
        
        return summary
    
    def get_progressive_summary(self):
        """Combineert meerdere samenvattingen tot één coherent overzicht"""
        if not self.summaries:
            return "Geen samenvattingen beschikbaar"
        
        # Combineer van oud naar nieuw
        combined = "Conversatie overzicht:\n\n"
        for summary in self.summaries:
            combined += f"[{summary['timestamp'].strftime('%H:%M')}] "
            combined += f"({summary['message_count']} berichten)\n"
            combined += summary['summary'] + "\n\n"
        
        return combined
\`\`\`

#### 2. Entity Tracking

Houd belangrijke entiteiten bij gedurende de conversatie:

\`\`\`python
class EntityTracker:
    def __init__(self):
        self.entities = {
            'persons': {},      # Namen en rollen
            'organizations': {}, # Bedrijven, afdelingen
            'locations': {},    # Plaatsen, adressen
            'dates': {},        # Belangrijke data
            'products': {},     # Producten, services
            'concepts': {},     # Abstracte concepten
            'numbers': {}       # Getallen, bedragen, IDs
        }
        self.entity_relationships = []
    
    def extract_and_track(self, text, context=None):
        """
        Extraheert entities uit tekst en update tracking
        """
        # NER extraction
        extraction_prompt = f"""
        Extraheer alle belangrijke entities uit deze tekst:
        
        Tekst: {text}
        Context: {context or "Geen"}
        
        Categoriseer als:
        - persons: Namen van mensen met hun rol
        - organizations: Bedrijfsnamen, afdelingen
        - locations: Plaatsen, adressen
        - dates: Specifieke data, deadlines
        - products: Product/service namen
        - concepts: Belangrijke concepten, onderwerpen
        - numbers: Bedragen, IDs, percentages
        
        Format als JSON met voor elke entity:
        {{
            "text": "entity naam",
            "type": "category",
            "context": "korte beschrijving",
            "confidence": 0.0-1.0
        }}
        """
        
        entities = json.loads(call_api(extraction_prompt))
        
        # Update tracking
        for entity in entities:
            category = entity['type']
            name = entity['text']
            
            if name not in self.entities[category]:
                self.entities[category][name] = {
                    'first_mention': datetime.now(),
                    'mentions': 0,
                    'contexts': [],
                    'aliases': set()
                }
            
            # Update entity info
            self.entities[category][name]['mentions'] += 1
            self.entities[category][name]['contexts'].append(entity['context'])
            
            # Detect relationships
            self._detect_relationships(entities)
    
    def resolve_reference(self, reference, recent_context):
        """
        Lost referenties op naar tracked entities
        """
        # Check pronouns
        if reference.lower() in ['hij', 'zij', 'het', 'deze', 'die']:
            # Vind meest waarschijnlijke entity
            candidates = self._find_recent_entities(recent_context)
            if candidates:
                return candidates[0]
        
        # Check aliases
        for category in self.entities:
            for entity_name, entity_info in self.entities[category].items():
                if reference.lower() in [alias.lower() for alias in entity_info['aliases']]:
                    return entity_name
        
        return reference
    
    def get_entity_summary(self):
        """Genereert overzicht van belangrijke entities"""
        summary = {}
        
        for category, entities in self.entities.items():
            # Filter op relevantie (min 2 mentions)
            relevant = {
                name: info for name, info in entities.items() 
                if info['mentions'] >= 2
            }
            
            if relevant:
                summary[category] = relevant
        
        return summary
\`\`\`

#### 3. Topic Modeling

Identificeer en track onderwerpen door de conversatie heen:

\`\`\`python
class TopicModeler:
    def __init__(self):
        self.topics = {}
        self.topic_transitions = []
        self.current_topic = None
    
    def analyze_topic(self, text, previous_topic=None):
        """
        Identificeert het hoofdonderwerp van een tekst
        """
        topic_prompt = f"""
        Analyseer het hoofdonderwerp van deze tekst.
        
        Tekst: {text}
        Vorig onderwerp: {previous_topic or "Geen"}
        
        Identificeer:
        1. Hoofdonderwerp (kort label)
        2. Subtopics (max 3)
        3. Topic shift (ja/nee)
        4. Relevantie score (0-10)
        
        Format als JSON
        """
        
        analysis = json.loads(call_api(topic_prompt))
        
        # Track topic
        topic = analysis['hoofdonderwerp']
        if topic not in self.topics:
            self.topics[topic] = {
                'first_mention': datetime.now(),
                'occurrences': 0,
                'subtopics': set(),
                'related_topics': set()
            }
        
        self.topics[topic]['occurrences'] += 1
        self.topics[topic]['subtopics'].update(analysis['subtopics'])
        
        # Track transitions
        if previous_topic and analysis['topic_shift']:
            self.topic_transitions.append({
                'from': previous_topic,
                'to': topic,
                'timestamp': datetime.now()
            })
        
        self.current_topic = topic
        return topic
    
    def get_topic_flow(self):
        """Genereert visualisatie van topic flow"""
        flow = "Topic Flow:\n"
        
        for i, transition in enumerate(self.topic_transitions):
            flow += f"{i+1}. {transition['from']} → {transition['to']}\n"
        
        return flow
    
    def predict_next_topics(self, current_topic):
        """Voorspelt waarschijnlijke volgende onderwerpen"""
        # Analyseer historische transitions
        next_topics = {}
        
        for transition in self.topic_transitions:
            if transition['from'] == current_topic:
                next_topic = transition['to']
                next_topics[next_topic] = next_topics.get(next_topic, 0) + 1
        
        # Sorteer op waarschijnlijkheid
        sorted_topics = sorted(next_topics.items(), key=lambda x: x[1], reverse=True)
        
        return [topic for topic, count in sorted_topics[:3]]
\`\`\`

#### 4. Integrated Memory System

Combineer alle memory technieken in één systeem:

\`\`\`python
class IntegratedMemorySystem:
    def __init__(self):
        self.summarizer = ConversationSummarizer()
        self.entity_tracker = EntityTracker()
        self.topic_modeler = TopicModeler()
        self.memory_store = {
            'short_term': [],  # Laatste 5-10 exchanges
            'working': {},     # Actieve taak context
            'long_term': {}    # Persistent knowledge
        }
    
    def process_exchange(self, user_input, assistant_response):
        """
        Verwerkt een conversatie exchange door alle memory systemen
        """
        exchange = {
            'user': user_input,
            'assistant': assistant_response,
            'timestamp': datetime.now()
        }
        
        # Update short-term memory
        self.memory_store['short_term'].append(exchange)
        if len(self.memory_store['short_term']) > 10:
            # Compress oudste exchanges
            old_exchanges = self.memory_store['short_term'][:5]
            summary = self.summarizer.summarize_conversation(
                old_exchanges, 
                level='brief'
            )
            self.memory_store['long_term']['summaries'] = \
                self.memory_store['long_term'].get('summaries', [])
            self.memory_store['long_term']['summaries'].append(summary)
            self.memory_store['short_term'] = self.memory_store['short_term'][5:]
        
        # Extract entities
        self.entity_tracker.extract_and_track(
            user_input + " " + assistant_response,
            context=self.topic_modeler.current_topic
        )
        
        # Update topic model
        self.topic_modeler.analyze_topic(
            user_input,
            previous_topic=self.topic_modeler.current_topic
        )
        
        # Update working memory voor actieve taken
        self._update_working_memory(exchange)
    
    def get_relevant_context(self, query):
        """
        Haalt alle relevante context op voor een query
        """
        context = {
            'current_topic': self.topic_modeler.current_topic,
            'recent_exchanges': self.memory_store['short_term'][-3:],
            'relevant_entities': self._find_relevant_entities(query),
            'related_summaries': self._find_relevant_summaries(query),
            'working_context': self.memory_store['working']
        }
        
        return self._format_context(context)
    
    def _format_context(self, context):
        """Formatteert context voor gebruik in prompt"""
        formatted = f"""
        Huidige Context:
        
        Topic: {context['current_topic']}
        
        Relevante Entities:
        {self._format_entities(context['relevant_entities'])}
        
        Recente Conversatie:
        {self._format_exchanges(context['recent_exchanges'])}
        
        Actieve Taken:
        {self._format_working_memory(context['working_context'])}
        """
        
        return formatted
\`\`\`

#### 2. Semantic Memory Chunking

Organiseer informatie in semantische chunks voor betere retrieval:

\`\`\`python
class SemanticMemory:
    def __init__(self):
        self.memory_chunks = {}
        self.embeddings = {}  # Voor similarity search
    
    def store_information(self, information, category=None):
        """Slaat informatie op in semantische chunks"""
        # Genereer embedding voor similarity search
        embedding = self._generate_embedding(information)
        
        # Auto-categoriseer indien niet opgegeven
        if not category:
            category = self._categorize_information(information)
        
        chunk_id = str(uuid.uuid4())
        self.memory_chunks[chunk_id] = {
            'content': information,
            'category': category,
            'embedding': embedding,
            'timestamp': datetime.now(),
            'access_count': 0
        }
        
        return chunk_id
    
    def retrieve_relevant(self, query, top_k=5):
        """Haalt meest relevante chunks op"""
        query_embedding = self._generate_embedding(query)
        
        # Bereken similarity scores
        similarities = []
        for chunk_id, chunk in self.memory_chunks.items():
            similarity = self._cosine_similarity(
                query_embedding, 
                chunk['embedding']
            )
            similarities.append((chunk_id, similarity))
        
        # Sorteer en return top K
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        relevant_chunks = []
        for chunk_id, score in similarities[:top_k]:
            if score > 0.7:  # Threshold voor relevantie
                chunk = self.memory_chunks[chunk_id]
                chunk['access_count'] += 1
                relevant_chunks.append(chunk['content'])
        
        return relevant_chunks
    
    def garbage_collect(self, max_age_days=30, max_chunks=1000):
        """Verwijdert oude of weinig gebruikte chunks"""
        current_time = datetime.now()
        chunks_to_remove = []
        
        for chunk_id, chunk in self.memory_chunks.items():
            age = (current_time - chunk['timestamp']).days
            
            # Verwijder oude chunks met lage access count
            if age > max_age_days and chunk['access_count'] < 3:
                chunks_to_remove.append(chunk_id)
        
        # Als nog steeds te veel chunks, verwijder minst gebruikte
        if len(self.memory_chunks) - len(chunks_to_remove) > max_chunks:
            sorted_chunks = sorted(
                self.memory_chunks.items(),
                key=lambda x: x[1]['access_count']
            )
            
            excess = len(self.memory_chunks) - max_chunks
            for chunk_id, _ in sorted_chunks[:excess]:
                if chunk_id not in chunks_to_remove:
                    chunks_to_remove.append(chunk_id)
        
        # Cleanup
        for chunk_id in chunks_to_remove:
            del self.memory_chunks[chunk_id]
\`\`\`

### Multi-turn Dialogue Optimalisatie

#### Conversation State Tracking

Houd de staat van de conversatie bij voor betere coherentie:

\`\`\`python
class DialogueStateTracker:
    def __init__(self):
        self.state = {
            'current_topic': None,
            'user_goal': None,
            'completed_subtasks': [],
            'pending_questions': [],
            'context_switches': 0,
            'user_preferences': {},
            'conversation_phase': 'initialization'  # init, exploration, execution, closing
        }
    
    def update_state(self, user_input, assistant_response):
        """Update conversatie staat op basis van nieuwe exchange"""
        # Detecteer topic changes
        new_topic = self._detect_topic(user_input)
        if new_topic != self.state['current_topic']:
            self.state['context_switches'] += 1
            self.state['current_topic'] = new_topic
        
        # Update conversation phase
        self.state['conversation_phase'] = self._determine_phase(
            user_input, 
            assistant_response
        )
        
        # Track progress
        completed = self._extract_completed_tasks(assistant_response)
        self.state['completed_subtasks'].extend(completed)
        
        # Identify pending items
        questions = self._extract_questions(assistant_response)
        self.state['pending_questions'] = questions
    
    def get_state_summary(self):
        """Genereert samenvatting van huidige staat"""
        return f"""
        Conversatie staat:
        - Topic: {self.state['current_topic']}
        - Doel: {self.state['user_goal']}
        - Fase: {self.state['conversation_phase']}
        - Voltooid: {len(self.state['completed_subtasks'])} taken
        - Openstaand: {len(self.state['pending_questions'])} vragen
        - Context switches: {self.state['context_switches']}
        """
    
    def suggest_next_action(self):
        """Suggereert volgende actie op basis van staat"""
        if self.state['pending_questions']:
            return f"Beantwoord openstaande vragen: {self.state['pending_questions']}"
        
        elif self.state['conversation_phase'] == 'exploration':
            return "Verfijn requirements of stel verduidelijkende vragen"
        
        elif self.state['completed_subtasks']:
            return "Vat voortgang samen en vraag om feedback"
        
        else:
            return "Vraag om verduidelijking van het hoofddoel"
\`\`\`

#### Coherentie Technieken

**1. Reference Resolution:**
\`\`\`python
class ReferenceResolver:
    def __init__(self):
        self.entity_mentions = {}
        self.pronoun_map = {}
    
    def process_text(self, text):
        """Lost referenties op in tekst"""
        # Track entities
        entities = self._extract_entities(text)
        for entity in entities:
            if entity not in self.entity_mentions:
                self.entity_mentions[entity] = []
            self.entity_mentions[entity].append(text)
        
        # Resolve pronouns
        resolved_text = self._resolve_pronouns(text)
        
        return resolved_text
    
    def _resolve_pronouns(self, text):
        """Vervangt pronouns met expliciete referenties waar nodig"""
        # Simpel voorbeeld - in praktijk complexer
        pronouns = ['hij', 'zij', 'het', 'deze', 'die']
        
        for pronoun in pronouns:
            if pronoun in text.lower():
                # Vind meest waarschijnlijke referent
                referent = self._find_referent(pronoun, text)
                if referent:
                    # Add clarification
                    text = text.replace(
                        pronoun, 
                        f"{pronoun} ({referent})"
                    )
        
        return text
\`\`\`

**2. Topic Continuity:**
\`\`\`python
def maintain_topic_continuity(conversation_history, new_response):
    """Zorgt voor vloeiende topic transitions"""
    
    # Analyseer topic shift
    previous_topic = extract_topic(conversation_history[-1])
    current_topic = extract_topic(new_response)
    
    if previous_topic != current_topic:
        # Voeg transitie toe
        transition = generate_transition(previous_topic, current_topic)
        new_response = f"{transition} {new_response}"
    
    return new_response

def generate_transition(old_topic, new_topic):
    """Genereert natuurlijke transitie tussen topics"""
    transitions = {
        ('technisch', 'business'): "Om dit in business context te plaatsen:",
        ('problem', 'solution'): "Nu we het probleem begrijpen, laten we naar oplossingen kijken:",
        ('general', 'specific'): "Laten we specifieker ingaan op",
        ('analysis', 'action'): "Op basis van deze analyse zijn de volgende stappen:"
    }
    
    # Vind beste match of genereer default
    key = (categorize_topic(old_topic), categorize_topic(new_topic))
    return transitions.get(key, "Daarnaast is het belangrijk om te kijken naar")
\`\`\`

### Context Compressie zonder Informatieverlies

#### Advanced Compression Strategies

**1. Abstractive Summarization:**
\`\`\`python
class AbstractiveSummarizer:
    def __init__(self):
        self.compression_levels = {
            'high': 0.2,      # 80% reductie
            'medium': 0.4,    # 60% reductie  
            'low': 0.6        # 40% reductie
        }
    
    def compress(self, text, level='medium', preserve_list=None):
        """
        Comprimeert tekst met behoud van kritieke informatie
        
        Args:
            text: Te comprimeren tekst
            level: Compressie niveau
            preserve_list: Lijst van termen die behouden moeten blijven
        """
        target_ratio = self.compression_levels[level]
        original_tokens = count_tokens(text)
        target_tokens = int(original_tokens * target_ratio)
        
        compression_prompt = f"""
        Comprimeer deze tekst naar ongeveer {target_tokens} tokens.
        
        Regels:
        1. Behoud ALLE feitelijke informatie (namen, nummers, data)
        2. Behoud logische structuur en volgorde
        3. Verwijder alleen redundantie en onnodige woorden
        4. Deze termen MOETEN behouden blijven: {preserve_list or 'geen'}
        
        Originele tekst:
        {text}
        
        Gecomprimeerde versie:
        """
        
        compressed = call_api(compression_prompt)
        
        # Verificatie check
        if not self._verify_compression(text, compressed, preserve_list):
            # Probeer opnieuw met minder agressieve compressie
            return self.compress(text, 'low', preserve_list)
        
        return compressed
    
    def _verify_compression(self, original, compressed, preserve_list):
        """Verifieert dat kritieke informatie behouden is"""
        # Extract key facts from both
        original_facts = self._extract_facts(original)
        compressed_facts = self._extract_facts(compressed)
        
        # Check preserve list
        if preserve_list:
            for term in preserve_list:
                if term.lower() not in compressed.lower():
                    return False
        
        # Check fact preservation (allow 95% retention)
        preserved_ratio = len(compressed_facts) / len(original_facts)
        return preserved_ratio >= 0.95
\`\`\`

**2. Structured Information Extraction:**
\`\`\`python
class StructuredExtractor:
    def __init__(self):
        self.extraction_schemas = {
            'meeting': {
                'attendees': list,
                'decisions': list,
                'action_items': list,
                'deadlines': list,
                'key_discussions': list
            },
            'technical': {
                'problem_statement': str,
                'requirements': list,
                'constraints': list,
                'proposed_solution': str,
                'implementation_steps': list
            },
            'analysis': {
                'data_sources': list,
                'methodology': str,
                'findings': list,
                'conclusions': list,
                'recommendations': list
            }
        }
    
    def extract_and_compress(self, text, schema_type='general'):
        """Extraheert gestructureerde info volgens schema"""
        schema = self.extraction_schemas.get(schema_type, {})
        
        extraction_prompt = f"""
        Extraheer de volgende informatie uit de tekst:
        
        Schema: {json.dumps(schema, indent=2)}
        
        Tekst:
        {text}
        
        Output als JSON. Wees beknopt maar volledig.
        """
        
        structured_data = json.loads(call_api(extraction_prompt))
        
        # Converteer terug naar beknopte tekst
        compressed_text = self._structured_to_text(structured_data, schema_type)
        
        return compressed_text
    
    def _structured_to_text(self, data, schema_type):
        """Converteert gestructureerde data naar beknopte tekst"""
        if schema_type == 'meeting':
            return f"""
            Meeting samenvatting:
            Aanwezig: {', '.join(data['attendees'])}
            
            Beslissingen:
            {self._format_list(data['decisions'])}
            
            Acties ({len(data['action_items'])}):
            {self._format_action_items(data['action_items'], data['deadlines'])}
            
            Key topics: {', '.join(data['key_discussions'])}
            """
        
        # Implement andere schema types...
        return json.dumps(data, indent=2)
\`\`\`

### Message History Management

#### Intelligent History Pruning

\`\`\`python
class MessageHistoryManager:
    def __init__(self, max_messages=50, max_tokens=8000):
        self.messages = []
        self.max_messages = max_messages
        self.max_tokens = max_tokens
        self.importance_scores = {}
    
    def add_message(self, message, importance=5):
        """Voegt bericht toe met importance score (1-10)"""
        msg_id = str(uuid.uuid4())
        
        self.messages.append({
            'id': msg_id,
            'content': message,
            'timestamp': datetime.now(),
            'tokens': count_tokens(str(message)),
            'importance': importance,
            'references': self._extract_references(message)
        })
        
        self._maintain_limits()
    
    def _maintain_limits(self):
        """Houdt geschiedenis binnen grenzen"""
        # Check token limit
        total_tokens = sum(m['tokens'] for m in self.messages)
        
        if total_tokens > self.max_tokens or len(self.messages) > self.max_messages:
            self._intelligent_prune()
    
    def _intelligent_prune(self):
        """Verwijdert minder belangrijke berichten intelligent"""
        # Bereken scores voor elk bericht
        for msg in self.messages:
            score = self._calculate_retention_score(msg)
            self.importance_scores[msg['id']] = score
        
        # Sorteer op score
        sorted_messages = sorted(
            self.messages,
            key=lambda m: self.importance_scores[m['id']],
            reverse=True
        )
        
        # Behoud belangrijkste berichten binnen limits
        retained = []
        total_tokens = 0
        
        for msg in sorted_messages:
            if total_tokens + msg['tokens'] <= self.max_tokens * 0.8:  # 80% om ruimte te houden
                retained.append(msg)
                total_tokens += msg['tokens']
            else:
                # Check of dit een kritiek referentie bericht is
                if self._is_critical_reference(msg, retained):
                    retained.append(msg)
                    total_tokens += msg['tokens']
        
        self.messages = sorted(retained, key=lambda m: m['timestamp'])
    
    def _calculate_retention_score(self, message):
        """Berekent retentie score op basis van meerdere factoren"""
        score = message['importance']  # Base score
        
        # Recency bonus
        age_hours = (datetime.now() - message['timestamp']).total_seconds() / 3600
        recency_multiplier = max(0.5, 1 - (age_hours / 168))  # Decay over week
        score *= recency_multiplier
        
        # Reference bonus
        reference_count = len(message['references'])
        score += reference_count * 0.5
        
        # Content type bonus
        if any(key in str(message['content']).lower() 
               for key in ['beslissing', 'decision', 'belangrijk', 'critical']):
            score *= 1.5
        
        return score
    
    def get_optimized_history(self, include_summary=True):
        """Retourneert geoptimaliseerde geschiedenis voor API"""
        if include_summary and len(self.messages) > 10:
            # Genereer samenvatting van oudere berichten
            old_messages = self.messages[:-10]
            summary = self._generate_summary(old_messages)
            
            history = [{'role': 'system', 'content': f'Eerdere context: {summary}'}]
            history.extend(self.messages[-10:])
            
            return history
        
        return self.messages
\`\`\`

### Praktische Code Voorbeelden met API Sandbox

#### Live Context Management Demo

<ApiPlayground
  initialProvider="openai"
  initialEndpoint="/chat/completions"
  initialBody={\`{
  "model": "gpt-3.5-turbo",
  "messages": [
    {
      "role": "system",
      "content": "Je bent een context-aware AI assistent. Gebruik de conversation history om coherente antwoorden te geven."
    },
    {
      "role": "user",
      "content": "Ik werk aan een e-commerce platform voor Nederlandse retailers."
    },
    {
      "role": "assistant",
      "content": "Interessant! Een e-commerce platform voor Nederlandse retailers. Waar kan ik je mee helpen? Denk je aan specifieke features zoals iDEAL integratie, BTW berekeningen, of misschien PostNL/DHL koppeling?"
    },
    {
      "role": "user",
      "content": "Ja, vooral de payment integraties. Wat raad je aan?"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 500
}\`}
  courseId="chatgpt-context-management"
/>

#### Complete Context Management Systeem

\`\`\`python
import json
import time
from datetime import datetime
from typing import List, Dict, Optional, Tuple
import hashlib

class AdvancedContextManager:
    """
    Volledig context management systeem voor productie gebruik
    """
    
    def __init__(self, model='gpt-3.5-turbo', max_tokens=4000):
        self.model = model
        self.max_tokens = max_tokens
        self.conversation_history = []
        self.memory_store = SemanticMemory()
        self.state_tracker = DialogueStateTracker()
        self.compression_cache = {}
        
    def add_exchange(self, user_input: str, assistant_response: str):
        """Voegt een uitwisseling toe aan de conversatie"""
        exchange = {
            'user': user_input,
            'assistant': assistant_response,
            'timestamp': datetime.now(),
            'tokens': count_tokens(user_input + assistant_response)
        }
        
        self.conversation_history.append(exchange)
        self.state_tracker.update_state(user_input, assistant_response)
        
        # Extract en store belangrijke informatie
        important_info = self._extract_important_info(exchange)
        if important_info:
            self.memory_store.store_information(important_info)
    
    def prepare_context(self, new_input: str) -> List[Dict]:
        """Bereidt optimale context voor nieuwe input"""
        # Haal relevante memories op
        relevant_memories = self.memory_store.retrieve_relevant(new_input)
        
        # Bepaal beschikbare tokens
        system_prompt_tokens = 200  # Reserve voor system prompt
        new_input_tokens = count_tokens(new_input)
        available_tokens = self.max_tokens - system_prompt_tokens - new_input_tokens - 500  # Buffer
        
        # Bouw context op
        context = []
        
        # System prompt met state en memories
        system_content = self._build_system_prompt(relevant_memories)
        context.append({'role': 'system', 'content': system_content})
        
        # Selecteer relevante conversation history
        selected_history = self._select_relevant_history(new_input, available_tokens)
        context.extend(selected_history)
        
        # Voeg nieuwe input toe
        context.append({'role': 'user', 'content': new_input})
        
        return context
    
    def _build_system_prompt(self, memories: List[str]) -> str:
        """Bouwt system prompt met context"""
        state_summary = self.state_tracker.get_state_summary()
        
        prompt = f"""Je bent een behulpzame AI-assistent.
        
        {state_summary}
        
        Relevante informatie uit geheugen:
        {chr(10).join(memories[:3]) if memories else 'Geen'}
        
        Instructies:
        - Wees consistent met eerdere conversaties
        - Refereer naar relevante eerdere informatie waar nuttig
        - Vraag om verduidelijking bij onduidelijkheden
        """
        
        return prompt
    
    def _select_relevant_history(self, new_input: str, available_tokens: int) -> List[Dict]:
        """Selecteert meest relevante geschiedenis binnen token budget"""
        if not self.conversation_history:
            return []
        
        # Scoor elk exchange op relevantie
        scored_exchanges = []
        for exchange in self.conversation_history:
            score = self._calculate_relevance(exchange, new_input)
            scored_exchanges.append((score, exchange))
        
        # Sorteer op score (hoogste eerst)
        scored_exchanges.sort(key=lambda x: x[0], reverse=True)
        
        # Selecteer binnen token budget
        selected = []
        used_tokens = 0
        
        # Altijd laatste exchange toevoegen
        if self.conversation_history:
            last_exchange = self.conversation_history[-1]
            selected.append({
                'role': 'user',
                'content': last_exchange['user']
            })
            selected.append({
                'role': 'assistant',
                'content': last_exchange['assistant']
            })
            used_tokens += last_exchange['tokens']
        
        # Voeg andere relevante exchanges toe
        for score, exchange in scored_exchanges[:-1]:  # Skip laatste (al toegevoegd)
            if used_tokens + exchange['tokens'] <= available_tokens:
                selected.insert(0, {'role': 'user', 'content': exchange['user']})
                selected.insert(1, {'role': 'assistant', 'content': exchange['assistant']})
                used_tokens += exchange['tokens']
        
        return selected
    
    def _calculate_relevance(self, exchange: Dict, new_input: str) -> float:
        """Berekent relevantie score tussen exchange en nieuwe input"""
        # Simpele keyword overlap (in productie: gebruik embeddings)
        exchange_text = exchange['user'] + ' ' + exchange['assistant']
        exchange_words = set(exchange_text.lower().split())
        input_words = set(new_input.lower().split())
        
        overlap = len(exchange_words.intersection(input_words))
        
        # Recency factor
        age_minutes = (datetime.now() - exchange['timestamp']).total_seconds() / 60
        recency_score = 1 / (1 + age_minutes / 60)  # Decay over hours
        
        # Combineer scores
        relevance = (overlap * 0.7) + (recency_score * 0.3)
        
        return relevance
    
    def compress_context(self, force=False):
        """Comprimeert conversatie geschiedenis"""
        total_tokens = sum(e['tokens'] for e in self.conversation_history)
        
        if force or total_tokens > self.max_tokens * 0.7:
            # Comprimeer oudste 50%
            to_compress = self.conversation_history[:len(self.conversation_history)//2]
            
            # Check cache
            cache_key = self._generate_cache_key(to_compress)
            if cache_key in self.compression_cache:
                compressed = self.compression_cache[cache_key]
            else:
                compressed = self._compress_exchanges(to_compress)
                self.compression_cache[cache_key] = compressed
            
            # Update history
            self.conversation_history = [
                {'role': 'system', 'content': f'Samenvatting eerdere conversatie: {compressed}', 
                 'tokens': count_tokens(compressed), 'timestamp': datetime.now()}
            ] + self.conversation_history[len(to_compress):]
    
    def export_state(self) -> Dict:
        """Exporteert complete staat voor persistence"""
        return {
            'conversation_history': self.conversation_history,
            'memory_store': self.memory_store.export(),
            'state_tracker': self.state_tracker.state,
            'timestamp': datetime.now().isoformat()
        }
    
    def import_state(self, state: Dict):
        """Importeert eerder geëxporteerde staat"""
        self.conversation_history = state['conversation_history']
        self.memory_store.import_data(state['memory_store'])
        self.state_tracker.state = state['state_tracker']

# Helper functies
def count_tokens(text: str) -> int:
    """Schat aantal tokens (productie: gebruik tiktoken)"""
    return len(text.split()) * 1.3

def call_api(prompt: str) -> str:
    """Placeholder voor API call"""
    # In productie: echte API call
    return "API response"
\`\`\`

### Case Study: Customer Service Chatbot

Laten we de geleerde technieken toepassen op een real-world scenario:

\`\`\`python
class CustomerServiceBot:
    """
    Geavanceerde customer service chatbot met context management
    """
    
    def __init__(self):
        self.context_manager = AdvancedContextManager(max_tokens=8000)
        self.customer_data = {}
        self.ticket_history = {}
        self.knowledge_base = KnowledgeBase()
        
    def handle_customer_query(self, customer_id: str, query: str) -> str:
        """Verwerkt klantquery met volledige context"""
        
        # Laad klantcontext
        customer_context = self._load_customer_context(customer_id)
        
        # Bereid query voor met context
        enhanced_query = f"""
        Klant: {customer_context['name']} (ID: {customer_id})
        Account type: {customer_context['account_type']}
        Eerdere issues: {len(customer_context['previous_tickets'])}
        
        Huidige vraag: {query}
        """
        
        # Zoek relevante KB artikelen
        kb_articles = self.knowledge_base.search(query, limit=3)
        
        # Bouw context
        context = self.context_manager.prepare_context(enhanced_query)
        
        # Voeg KB informatie toe aan system prompt
        if kb_articles:
            kb_summary = self._summarize_kb_articles(kb_articles)
            context[0]['content'] += f"\n\nRelevante kennis:\n{kb_summary}"
        
        # Genereer response
        response = self._call_llm(context)
        
        # Update context manager
        self.context_manager.add_exchange(query, response)
        
        # Log voor quality assurance
        self._log_interaction(customer_id, query, response)
        
        return response
    
    def _load_customer_context(self, customer_id: str) -> Dict:
        """Laadt klantspecifieke context"""
        if customer_id not in self.customer_data:
            # Haal uit database
            self.customer_data[customer_id] = {
                'name': 'John Doe',  # Placeholder
                'account_type': 'Premium',
                'previous_tickets': self._get_ticket_history(customer_id),
                'preferences': self._get_customer_preferences(customer_id)
            }
        
        return self.customer_data[customer_id]
    
    def _summarize_kb_articles(self, articles: List[Dict]) -> str:
        """Vat KB artikelen samen voor context"""
        summary = []
        for article in articles:
            summary.append(f"- {article['title']}: {article['summary']}")
        
        return '\n'.join(summary)
    
    def escalate_to_human(self, customer_id: str, reason: str):
        """Escaleert naar menselijke agent met volledige context"""
        # Genereer context samenvatting voor agent
        context_summary = f"""
        ESCALATIE SAMENVATTING
        
        Klant: {self.customer_data[customer_id]['name']}
        Reden escalatie: {reason}
        
        Conversatie samenvatting:
        {self.context_manager.state_tracker.get_state_summary()}
        
        Laatste 3 exchanges:
        {self._get_recent_exchanges(3)}
        
        Suggested actions:
        {self.context_manager.state_tracker.suggest_next_action()}
        """
        
        return context_summary
    
    def _get_recent_exchanges(self, n: int) -> str:
        """Haalt recente exchanges op"""
        recent = self.context_manager.conversation_history[-n:]
        formatted = []
        
        for exchange in recent:
            formatted.append(f"Klant: {exchange['user']}")
            formatted.append(f"Bot: {exchange['assistant']}")
            formatted.append("---")
        
        return '\n'.join(formatted)

# Voorbeeld gebruik
bot = CustomerServiceBot()

# Klant 1 - Eerste contact
response1 = bot.handle_customer_query(
    "CUST123",
    "Mijn internet is traag sinds gisteren"
)

# Klant 1 - Follow up (bot onthoudt context)
response2 = bot.handle_customer_query(
    "CUST123", 
    "Ik heb de router gereset zoals je zei, maar het is nog steeds traag"
)

# Klant 2 - Andere conversatie (aparte context)
response3 = bot.handle_customer_query(
    "CUST456",
    "Ik wil mijn abonnement upgraden"
)

# Klant 1 - Komt terug na 2 dagen (context behouden)
response4 = bot.handle_customer_query(
    "CUST123",
    "Het internet probleem is nog niet opgelost"
)

# Escalatie nodig
escalation_summary = bot.escalate_to_human(
    "CUST123",
    "Technisch probleem niet op te lossen via standaard troubleshooting"
)
\`\`\`

### Best Practices & Pro Tips

#### 1. Token Budget Planning

Verdeel je token budget strategisch:
- 20% voor system prompt en instructies
- 60% voor conversatie geschiedenis
- 15% voor relevante context/memories
- 5% buffer voor onverwachte content

#### 2. Context Prioritization Framework

Prioriteer informatie in deze volgorde:
1. **Critical**: Gebruikersdoel, belangrijke constraints
2. **Important**: Recente beslissingen, actieve taken
3. **Relevant**: Achtergrond info, eerdere voorbeelden
4. **Nice-to-have**: Algemene context, oude conversaties

#### 3. Performance Optimalisatie

\`\`\`python
# Cache compressies
compression_cache = TTLCache(maxsize=100, ttl=3600)

# Batch operations
def batch_compress(texts, batch_size=5):
    compressed = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i+batch_size]
        compressed.extend(compress_batch(batch))
    return compressed

# Async processing voor non-blocking operations
async def async_memory_update(memory_store, information):
    await memory_store.store_information_async(information)
\`\`\`

#### 4. Monitoring en Debugging

\`\`\`python
class ContextMonitor:
    def __init__(self):
        self.metrics = {
            'avg_context_size': [],
            'compression_ratio': [],
            'relevance_scores': [],
            'cache_hits': 0,
            'cache_misses': 0
        }
    
    def log_context_usage(self, original_size, compressed_size, relevance_score):
        self.metrics['avg_context_size'].append(compressed_size)
        self.metrics['compression_ratio'].append(compressed_size / original_size)
        self.metrics['relevance_scores'].append(relevance_score)
    
    def get_performance_report(self):
        return {
            'avg_context_size': np.mean(self.metrics['avg_context_size']),
            'avg_compression': np.mean(self.metrics['compression_ratio']),
            'avg_relevance': np.mean(self.metrics['relevance_scores']),
            'cache_efficiency': self.metrics['cache_hits'] / 
                              (self.metrics['cache_hits'] + self.metrics['cache_misses'])
        }
\`\`\`

### Interactieve Oefeningen

<Quiz
  questions={[
    {
      id: "token-limits-1",
      type: "multiple-choice",
      question: "Wat is het token limiet van GPT-4-turbo (128k)?\n\nContext: Je hebt een 50-pagina rapport (ongeveer 25.000 woorden) dat je wilt analyseren.",
      options: [
        "Het rapport past ruim binnen het limiet",
        "Het rapport past precies binnen het limiet",
        "Het rapport is te groot voor één keer",
        "Alleen met compressie past het"
      ],
      correctAnswer: 0,
      explanation: "25.000 woorden ≈ 33.000 tokens (1.3x factor). GPT-4-turbo's 128k limiet kan dit ruim aan. Je houdt zelfs ~95k tokens over voor conversatie!"
    },
    {
      id: "context-optimization-1",
      type: "multiple-choice",
      question: "Je conversatie gebruikt 3.500 van 4.096 tokens (GPT-3.5). Wat is de beste strategie?",
      options: [
        "Direct oude berichten verwijderen",
        "Comprimeer oude exchanges naar samenvattingen",
        "Switch naar GPT-4 voor meer tokens",
        "Ignoreer het limiet en ga door"
      ],
      correctAnswer: 1,
      explanation: "Compressie behoudt belangrijke informatie terwijl tokens worden bespaard. Dit is efficiënter dan verwijderen of model switchen."
    },
    {
      id: "memory-technique-1",
      type: "code-completion",
      question: "Implementeer een sliding window voor conversation history:",
      starterCode: \`def maintain_conversation_window(messages, window_size=5, max_tokens=3000):
    """Houdt alleen recente en belangrijke messages"""
    # Implementeer hier
    if len(messages) <= window_size:
        return ___________
    
    # Prioriteer system message en recente exchanges
    priority_messages = []
    
    # TODO: Voeg system message toe indien aanwezig
    
    # TODO: Voeg laatste window_size messages toe
    
    return priority_messages\`,
      expectedOutput: \`messages\`,
      hints: [
        "Check eerst of we onder window_size zitten",
        "System message is meestal messages[0] met role='system'",
        "Gebruik list slicing voor laatste N messages: messages[-N:]"
      ]
    }
  ]}
  onComplete={(score) => console.log(\`Quiz completed with score: \${score}\`)}
/>

### Praktijk Challenge

<CodingChallenge
  id="context-compression-challenge"
  title="Context Compression Challenge"
  description="Implementeer een intelligente context compressor die lange conversaties samenvat zonder belangrijke informatie te verliezen."
  initialCode={\`class ContextCompressor:
    def __init__(self, target_ratio=0.5):
        self.target_ratio = target_ratio
        self.important_keywords = [
            'beslissing', 'actie', 'probleem', 
            'oplossing', 'deadline', 'belangrijk'
        ]
    
    def compress(self, messages):
        """
        Comprimeer messages naar target_ratio van originele grootte
        
        Args:
            messages: List van message dicts met 'role' en 'content'
            
        Returns:
            Gecomprimeerde messages list
        """
        # TODO: Implementeer compressie logica
        pass
    
    def _score_importance(self, message):
        """Score message importance van 0-10"""
        # TODO: Implementeer scoring
        pass
    
    def _extract_key_points(self, content):
        """Extract belangrijkste punten uit content"""
        # TODO: Implementeer extractie
        pass

# Test je implementatie
test_messages = [
    {"role": "user", "content": "Ik heb een probleem met de checkout flow."},
    {"role": "assistant", "content": "Ik begrijp het. Kun je beschrijven wat er precies gebeurt? Krijg je een foutmelding?"},
    {"role": "user", "content": "Ja, bij het selecteren van iDEAL krijg ik een 500 error. Dit gebeurt alleen bij bedragen boven €1000."},
    {"role": "assistant", "content": "Dat klinkt als een limiet issue. Laten we het volgende proberen: 1) Check de Mollie dashboard voor limieten, 2) Controleer de error logs voor meer details, 3) Test met een bedrag van €999 om te bevestigen."},
    {"role": "user", "content": "Ok, ik ga dat nu checken. Even wachten..."},
    {"role": "user", "content": "Je had gelijk! In Mollie stond een dagelijks limiet van €1000. Ik heb het verhoogd naar €10.000."},
    {"role": "assistant", "content": "Uitstekend! De beslissing om het limiet te verhogen naar €10.000 zou het probleem moeten oplossen. Test het nu even met een bestelling boven €1000 om te bevestigen dat alles werkt."}
]

compressor = ContextCompressor(target_ratio=0.4)
compressed = compressor.compress(test_messages)

print(f"Origineel: {len(test_messages)} messages")
print(f"Gecomprimeerd: {len(compressed)} messages")
print("\nGecomprimeerde content:")
for msg in compressed:
    print(f"{msg['role']}: {msg['content'][:100]}...")\`}
  testCases={[
    {
      input: "test_messages",
      expected: "Compressed to ~40% while keeping key information"
    }
  ]}
  hints={[
    "Score messages op basis van belangrijke keywords",
    "Combineer opeenvolgende messages van zelfde role",
    "Behoud altijd messages met beslissingen of acties"
  ]}
  solution={\`class ContextCompressor:
    def __init__(self, target_ratio=0.5):
        self.target_ratio = target_ratio
        self.important_keywords = [
            'beslissing', 'actie', 'probleem', 
            'oplossing', 'deadline', 'belangrijk'
        ]
    
    def compress(self, messages):
        if not messages:
            return []
        
        # Score all messages
        scored_messages = [
            (self._score_importance(msg), msg) 
            for msg in messages
        ]
        
        # Sort by importance
        scored_messages.sort(key=lambda x: x[0], reverse=True)
        
        # Calculate target message count
        target_count = max(1, int(len(messages) * self.target_ratio))
        
        # Select top messages
        selected = [msg for score, msg in scored_messages[:target_count]]
        
        # Maintain chronological order
        selected.sort(key=lambda m: messages.index(m))
        
        # Compress consecutive assistant messages
        compressed = []
        for msg in selected:
            if compressed and compressed[-1]['role'] == msg['role'] == 'assistant':
                compressed[-1]['content'] += ' ' + self._extract_key_points(msg['content'])
            else:
                compressed.append({
                    'role': msg['role'],
                    'content': self._extract_key_points(msg['content'])
                })
        
        return compressed
    
    def _score_importance(self, message):
        score = 5.0  # Base score
        content_lower = message['content'].lower()
        
        # Check for important keywords
        for keyword in self.important_keywords:
            if keyword in content_lower:
                score += 2.0
        
        # Questions are important
        if '?' in message['content']:
            score += 1.0
        
        # Numbers/amounts are important
        if '€' in message['content'] or any(c.isdigit() for c in message['content']):
            score += 1.5
        
        # User messages slightly more important
        if message['role'] == 'user':
            score += 0.5
        
        return min(10, score)
    
    def _extract_key_points(self, content):
        # Simple extraction - in production use NLP
        sentences = content.split('.')
        key_sentences = []
        
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
            
            # Keep sentences with important keywords
            if any(kw in sentence.lower() for kw in self.important_keywords):
                key_sentences.append(sentence)
            # Keep sentences with numbers/amounts
            elif '€' in sentence or any(c.isdigit() for c in sentence):
                key_sentences.append(sentence)
            # Keep short sentences (likely important)
            elif len(sentence.split()) < 10:
                key_sentences.append(sentence)
        
        # If no key sentences found, return shortened version
        if not key_sentences:
            words = content.split()
            return ' '.join(words[:20]) + '...' if len(words) > 20 else content
        
        return '. '.join(key_sentences[:2]) + '.'\`}
/>

### Conclusie

Effectief context management is de sleutel tot het bouwen van geavanceerde AI-applicaties. Door het beheersen van token optimalisatie, slimme compressie technieken, en intelligente memory systemen kun je coherente, context-aware conversaties voeren die de beperkingen van standaard chatbots ver overstijgen.

De technieken in deze les - van sliding windows tot semantic memory, van state tracking tot intelligent pruning - vormen een complete toolkit voor professioneel context management. Begin met het implementeren van basis technieken en bouw geleidelijk meer geavanceerde features toe naarmate je applicatie groeit.

In de volgende les duiken we in Custom Instructions Mastery, waar je leert hoe je consistente, herbruikbare AI-personas creëert die perfect aansluiten bij specifieke use cases en industrieën.
  `,
  components: {
    CodeSandbox,
    ApiPlayground,
    Quiz,
    CodingChallenge
  },
  resources: [
    {
      title: 'Context Management Best Practices',
      url: 'https://example.com/context-management',
      type: 'guide'
    },
    {
      title: 'Token Optimization Toolkit',
      url: 'https://example.com/token-toolkit',
      type: 'tool'
    },
    {
      title: 'Memory System Templates',
      url: 'https://example.com/memory-templates',
      type: 'template'
    }
  ],
  assignments: [
    {
      id: 'build-context-manager',
      title: 'Bouw een Complete Context Manager',
      description: 'Implementeer een volledig functionele context manager met sliding window, compression, en memory features. Test met een 20+ beurt conversatie.',
      difficulty: 'hard',
      type: 'coding'
    },
    {
      id: 'optimize-token-usage',
      title: 'Token Optimalisatie Challenge',
      description: 'Neem een bestaande conversatie van 10,000+ tokens en optimaliseer deze naar <4,000 tokens zonder verlies van essentiële informatie.',
      difficulty: 'medium',
      type: 'optimization'
    },
    {
      id: 'customer-service-bot',
      title: 'Customer Service Bot Case Study',
      description: 'Ontwikkel een customer service bot met advanced context management. Implementeer customer history, ticket tracking, en intelligent escalation.',
      difficulty: 'hard',
      type: 'project'
    }
  ]
};