import { Lesson } from '@/lib/data/courses';

export const lesson1_3: Lesson = {
  id: 'lesson-1-3',
  title: 'Embeddings en semantic search: De basis van RAG',
  duration: '35 min',
  content: `
# Embeddings en Semantic Search: De Basis van RAG

In deze les duiken we diep in de technologie die RAG mogelijk maakt: **embeddings** en **semantic search**. Je leert hoe computers betekenis kunnen begrijpen en hoe we dit gebruiken om relevante informatie te vinden.

## Wat zijn Embeddings en Waarom zijn ze Belangrijk?

### Van Tekst naar Getallen

Computers begrijpen geen tekst, alleen getallen. Embeddings zijn de brug:

- **Embedding**: Een numerieke representatie van tekst in een hoog-dimensionale ruimte
- **Vector**: Een lijst van getallen die de betekenis van tekst vastlegt
- **Dimensies**: Meestal 384 tot 3072 getallen per embedding

### Waarom Embeddings Cruciaal zijn voor RAG

1. **Semantisch Begrip**: Embeddings vangen betekenis, niet alleen keywords
2. **Efficiënte Zoekacties**: Miljoenen documenten doorzoekbaar in milliseconden
3. **Taal-agnostisch**: Moderne embeddings werken cross-linguaal
4. **Context-bewust**: Begrijpen nuances en relaties tussen concepten

### Visuele Representatie van Embeddings

\`\`\`python
# Voorbeeld embedding vectoren (vereenvoudigd tot 3D voor visualisatie)
"hond"      = [0.2, 0.8, 0.1]  # Huisdier, viervoeter, trouw
"kat"       = [0.3, 0.7, 0.2]  # Huisdier, viervoeter, onafhankelijk
"wolf"      = [0.15, 0.6, 0.3] # Wild dier, viervoeter, roedel
"auto"      = [0.9, 0.1, 0.5]  # Voertuig, mechanisch, snel
"fiets"     = [0.8, 0.2, 0.4]  # Voertuig, mechanisch, milieuvriendelijk
"wandelen"  = [0.7, 0.3, 0.2]  # Vervoer, menselijk, langzaam
\`\`\`

### Het Magische van Embeddings: Semantische Ruimte

\`\`\`
    Dimensie 2 (Levend wezen)
    ^
    |
    | kat • • hond
    |     • wolf
    |
    |          • wandelen
    |
    |              • fiets
    |                  • auto
    +-------------------------> Dimensie 1 (Transport)
\`\`\`

Observaties:
- 🐾 Dieren clusteren samen (semantische groepering)
- 🚗 Transportmiddelen vormen een eigen cluster
- 🔗 "Wandelen" zit tussen beide (menselijke activiteit)
- 📏 Afstand = semantische verschillen

## Hoe Tekst Vectoren Wordt: De Technische Details

### 1. Tokenization: Tekst Opdelen

\`\`\`python
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")

text = "RAG combineert zoeken met AI generatie"
tokens = tokenizer.tokenize(text)
print(tokens)
# Output: ['rag', 'combine', '##ert', 'zoeken', 'met', 'ai', 'genera', '##tie']

token_ids = tokenizer.encode(text)
print(token_ids)
# Output: [101, 27700, 11624, 19941, 23564, 2007, 9932, 11470, 102]
\`\`\`

### 2. Transformer Processing

De tokens gaan door meerdere transformer lagen:

1. **Positional Encoding**: Voeg positie-informatie toe
2. **Multi-Head Attention**: Analyseer relaties tussen woorden
3. **Feed-Forward Networks**: Transformeer representaties
4. **Layer Normalization**: Stabiliseer de training

### 3. Pooling: Van Tokens naar Document Embedding

\`\`\`python
# Mean pooling: gemiddelde van alle token embeddings
def mean_pooling(model_output, attention_mask):
    token_embeddings = model_output[0]
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    return torch.sum(token_embeddings * input_mask_expanded, 1) / torch.clamp(input_mask_expanded.sum(1), min=1e-9)
\`\`\`

## Vergelijking van Embedding Modellen

### 1. OpenAI Embeddings

**text-embedding-ada-002 (Legacy)**
- 📊 Dimensies: 1536
- 💰 Kosten: $0.0001 per 1K tokens
- ⚡ Snelheid: Zeer snel
- 🎯 Use case: General purpose, productie-ready

**text-embedding-3-small**
- 📊 Dimensies: 1536
- 💰 Kosten: $0.00002 per 1K tokens (5x goedkoper!)
- ⚡ Snelheid: Ultrafast
- 🎯 Use case: Grote volumes, real-time applicaties

**text-embedding-3-large**
- 📊 Dimensies: 3072
- 💰 Kosten: $0.00013 per 1K tokens
- 🎯 Kwaliteit: State-of-the-art
- 🎯 Use case: Hoogste precisie vereist

### 2. Open-Source Alternatieven

**Sentence-BERT Familie**
\`\`\`python
from sentence_transformers import SentenceTransformer

# Verschillende modellen voor verschillende doelen
models = {
    "all-MiniLM-L6-v2": {
        "dimensies": 384,
        "snelheid": "22K zinnen/sec",
        "kwaliteit": "Goed",
        "talen": "Engels"
    },
    "all-mpnet-base-v2": {
        "dimensies": 768,
        "snelheid": "2.8K zinnen/sec", 
        "kwaliteit": "Uitstekend",
        "talen": "Engels"
    },
    "paraphrase-multilingual-mpnet-base-v2": {
        "dimensies": 768,
        "snelheid": "2.5K zinnen/sec",
        "kwaliteit": "Zeer goed",
        "talen": "50+ talen"
    }
}
\`\`\`

### 3. Multilingual Modellen

**BGE (BAAI General Embedding)**
- 🌍 100+ talen ondersteund
- 📊 768-1024 dimensies
- 🏆 Top scores op MTEB benchmark
- 💻 Self-hostable

**Cohere Multilingual**
- 🌍 100+ talen native support
- 📊 768 dimensies
- 🔄 Re-ranking capabilities
- ☁️ Managed service

### Model Selectie Matrix

| Criterium | OpenAI Ada-002 | OpenAI 3-small | SBERT | BGE | Cohere |
|-----------|----------------|----------------|-------|-----|---------|
| Kosten | $$$ | $ | Gratis | Gratis | $$ |
| Snelheid | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Kwaliteit | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Multilingua | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Self-host | ❌ | ❌ | ✅ | ✅ | ❌ |

## Embedding Dimensies en Trade-offs

### De Impact van Dimensionaliteit

\`\`\`python
import numpy as np
import matplotlib.pyplot as plt

# Simuleer performance vs dimensies
dimensions = [128, 256, 384, 512, 768, 1024, 1536, 3072]
accuracy = [0.75, 0.82, 0.86, 0.88, 0.90, 0.91, 0.92, 0.93]
speed = [10000, 8000, 6000, 4500, 3000, 2000, 1200, 600]
storage_gb = [0.5, 1.0, 1.5, 2.0, 3.0, 4.0, 6.0, 12.0]

fig, (ax1, ax2, ax3) = plt.subplots(1, 3, figsize=(15, 5))

ax1.plot(dimensions, accuracy, 'b-', marker='o')
ax1.set_xlabel('Dimensies')
ax1.set_ylabel('Accuracy')
ax1.set_title('Accuracy vs Dimensies')

ax2.plot(dimensions, speed, 'r-', marker='o')
ax2.set_xlabel('Dimensies')
ax2.set_ylabel('Queries/sec')
ax2.set_title('Snelheid vs Dimensies')

ax3.plot(dimensions, storage_gb, 'g-', marker='o')
ax3.set_xlabel('Dimensies')
ax3.set_ylabel('Opslag (GB per miljoen vectors)')
ax3.set_title('Opslag vs Dimensies')

plt.tight_layout()
plt.show()
\`\`\`

### Praktische Overwegingen

**Lage Dimensies (128-384)**
- ✅ Snel, weinig geheugen
- ✅ Geschikt voor keyword-achtige matching
- ❌ Mist nuance en context
- 📱 Use case: Mobile apps, edge devices

**Medium Dimensies (512-768)**
- ✅ Goede balans snelheid/kwaliteit
- ✅ Voldoende voor meeste use cases
- ⚖️ Sweet spot voor productie
- 💼 Use case: Bedrijfsapplicaties

**Hoge Dimensies (1024-3072)**
- ✅ Maximale semantische precisie
- ✅ Beste voor complexe queries
- ❌ Duur in opslag en compute
- 🔬 Use case: Research, high-stakes applicaties

## Similarity Metrics: Meer dan Alleen Cosine

### 1. Cosine Similarity (Standaard)

\`\`\`python
def cosine_similarity(a, b):
    """
    Hoek tussen vectoren: -1 tot 1
    1 = identiek, 0 = orthogonaal, -1 = tegengesteld
    """
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# Voorbeeld
vec1 = np.array([1, 2, 3])
vec2 = np.array([2, 4, 6])  # Zelfde richting, andere magnitude
print(f"Cosine similarity: {cosine_similarity(vec1, vec2):.3f}")  # 1.000
\`\`\`

### 2. Euclidean Distance

\`\`\`python
def euclidean_distance(a, b):
    """
    Rechte lijn afstand tussen punten
    0 = identiek, groter = verder weg
    """
    return np.linalg.norm(a - b)

# Dezelfde vectoren als boven
print(f"Euclidean distance: {euclidean_distance(vec1, vec2):.3f}")  # 3.742
\`\`\`

### 3. Dot Product

\`\`\`python
def dot_product_similarity(a, b):
    """
    Som van producten: houdt rekening met magnitude
    Groter = meer similar (geen vaste bounds)
    """
    return np.dot(a, b)

print(f"Dot product: {dot_product_similarity(vec1, vec2):.3f}")  # 28.000
\`\`\`

### 4. Manhattan Distance (L1)

\`\`\`python
def manhattan_distance(a, b):
    """
    Som van absolute verschillen
    Robuust tegen outliers
    """
    return np.sum(np.abs(a - b))

print(f"Manhattan distance: {manhattan_distance(vec1, vec2):.3f}")  # 6.000
\`\`\`

### Wanneer Welke Metric Gebruiken?

| Metric | Gebruik wanneer | Voordelen | Nadelen |
|--------|----------------|-----------|---------|
| **Cosine** | Semantische similarity | Magnitude-onafhankelijk | Geen absolute afstand |
| **Euclidean** | Absolute verschillen belangrijk | Intuïtief | Gevoelig voor schaal |
| **Dot Product** | Magnitude matters | Snel te berekenen | Ongebonden waarden |
| **Manhattan** | Robuustheid nodig | Outlier-resistant | Minder smooth |

### Performance Vergelijking

\`\`\`python
import time

# Test performance verschillende metrics
n_vectors = 10000
dimension = 768
vectors = np.random.randn(n_vectors, dimension)
query = np.random.randn(dimension)

# Cosine (genormaliseerd)
start = time.time()
normalized_vectors = vectors / np.linalg.norm(vectors, axis=1)[:, np.newaxis]
normalized_query = query / np.linalg.norm(query)
cosine_scores = np.dot(normalized_vectors, normalized_query)
print(f"Cosine tijd: {time.time() - start:.3f}s")

# Dot product (snelste)
start = time.time()
dot_scores = np.dot(vectors, query)
print(f"Dot product tijd: {time.time() - start:.3f}s")

# Euclidean
start = time.time()
euclidean_scores = -np.linalg.norm(vectors - query, axis=1)
print(f"Euclidean tijd: {time.time() - start:.3f}s")
\`\`\`

## Semantic Search in Actie

### 1. Indexering: Je Knowledge Base Voorbereiden

\`\`\`python
import openai
from pinecone import Pinecone

# Initialiseer embedding model en vector database
openai.api_key = "jouw-api-key"
pc = Pinecone(api_key="jouw-pinecone-key")
index = pc.Index("knowledge-base")

# Functie om tekst te embedden
def embed_text(text):
    response = openai.Embedding.create(
        model="text-embedding-3-small",
        input=text
    )
    return response['data'][0]['embedding']

# Documenten voorbereiden en opslaan
documents = [
    {
        "id": "doc1",
        "text": "RAG combineert retrieval met generatie voor betere AI antwoorden.",
        "metadata": {"source": "rag_guide.pdf", "page": 1}
    },
    {
        "id": "doc2", 
        "text": "Embeddings zetten tekst om in numerieke vectoren.",
        "metadata": {"source": "embeddings_tutorial.pdf", "page": 5}
    }
]

# Embed en indexeer documenten
for doc in documents:
    embedding = embed_text(doc['text'])
    index.upsert([(
        doc['id'],
        embedding,
        doc['metadata']
    )])
\`\`\`

### 2. Zoeken: Relevante Informatie Vinden

\`\`\`python
def semantic_search(query, top_k=5):
    # Embed de zoekvraag
    query_embedding = embed_text(query)
    
    # Zoek in vector database
    results = index.query(
        vector=query_embedding,
        top_k=top_k,
        include_metadata=True
    )
    
    # Retourneer gevonden documenten
    return [
        {
            'text': match['metadata']['text'],
            'score': match['score'],
            'source': match['metadata']['source']
        }
        for match in results['matches']
    ]

# Voorbeeld zoekopdracht
query = "Hoe werken embeddings in RAG systemen?"
relevante_docs = semantic_search(query)

for doc in relevante_docs:
    print(f"Score: {doc['score']:.3f}")
    print(f"Bron: {doc['source']}")
    print(f"Tekst: {doc['text']}\\n")
\`\`\`

## Cosine Similarity: De Wiskunde achter Semantic Search

### Hoe Meten we Gelijkenis?

**Cosine similarity** meet de hoek tussen twee vectoren:

\`\`\`python
import numpy as np

def cosine_similarity(vec1, vec2):
    """
    Bereken cosine similarity tussen twee vectoren.
    Resultaat tussen -1 (tegengesteld) en 1 (identiek).
    """
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    
    return dot_product / (norm1 * norm2)

# Voorbeeld
embedding_hond = np.array([0.2, 0.8, 0.1])
embedding_kat = np.array([0.3, 0.7, 0.2])
embedding_auto = np.array([0.9, 0.1, 0.5])

print(f"Hond vs Kat: {cosine_similarity(embedding_hond, embedding_kat):.3f}")
print(f"Hond vs Auto: {cosine_similarity(embedding_hond, embedding_auto):.3f}")
\`\`\`

### Waarom Cosine Similarity?

- **Schaal-onafhankelijk**: Lengte van vector maakt niet uit
- **Intuïtief**: 1 = identiek, 0 = ongerelateerd, -1 = tegengesteld
- **Efficiënt**: Snel te berekenen, zelfs voor miljoenen vectoren

## Vector Databases: De Backbone van RAG

### Waarom een Speciale Database?

Traditionele databases zijn niet geoptimaliseerd voor vector search:

| Aspect | SQL Database | Vector Database |
|--------|--------------|-----------------|
| Zoeken | Exacte matches | Semantische gelijkenis |
| Index | B-tree, Hash | HNSW, IVF, LSH |
| Query | WHERE clause | Nearest neighbors |
| Schaal | Miljoenen rows | Miljarden vectoren |

### Populaire Vector Databases

1. **Pinecone**
   - ☁️ Fully managed cloud service
   - 🚀 Extreem snel en schaalbaar
   - 💰 Betaald, maar genereuze gratis tier

2. **Weaviate**
   - 🔧 Open-source met cloud optie
   - 🎯 GraphQL API
   - 🏢 Self-hosted of managed

3. **Qdrant**
   - 🦀 Geschreven in Rust (super snel)
   - 🔍 Rijke filtering opties
   - 🌍 Geografisch gedistribueerd

4. **Chroma**
   - 🐍 Python-first design
   - 💻 Embedded database optie
   - 🎓 Perfect voor prototypes

## Best Practices voor Embeddings

### 1. Chunk Size Matters

\`\`\`python
def create_chunks(text, chunk_size=500, overlap=50):
    """
    Split tekst in overlappende chunks voor betere context.
    """
    words = text.split()
    chunks = []
    
    for i in range(0, len(words), chunk_size - overlap):
        chunk = ' '.join(words[i:i + chunk_size])
        chunks.append(chunk)
    
    return chunks

# Voorbeeld
document = "Lange tekst over RAG..." * 100
chunks = create_chunks(document)
print(f"Document opgesplitst in {len(chunks)} chunks")
\`\`\`

### 2. Metadata is Goud Waard

\`\`\`python
# Sla altijd rijke metadata op
document_metadata = {
    "text": chunk_text,
    "source_file": "handbook.pdf",
    "page_number": 42,
    "chapter": "RAG Architectuur",
    "last_updated": "2024-01-15",
    "language": "nl",
    "permissions": ["public", "employees"]
}
\`\`\`

### 3. Hybrid Search

Combineer semantic search met traditionele filters:

\`\`\`python
# Zoek semantisch EN filter op metadata
results = index.query(
    vector=query_embedding,
    top_k=10,
    filter={
        "language": {"$eq": "nl"},
        "permissions": {"$in": user_permissions},
        "last_updated": {"$gte": "2024-01-01"}
    }
)
\`\`\`

## Common Pitfalls met Embeddings

### 1. Het "Exacte Match" Probleem

**Pitfall**: Embeddings vinden soms niet de exacte term die gezocht wordt.

\`\`\`python
# Probleem demonstratie
query = "GPT-4"
documents = [
    "GPT-4 is een krachtig taalmodel",  # Exacte match
    "Het nieuwste model van OpenAI presteert uitstekend",  # Semantisch relevant
    "Gpt-4 heeft 1.76 triljoen parameters"  # Case variation
]

# Embeddings kunnen doc 2 hoger ranken dan doc 1!
\`\`\`

**Oplossing**: Hybrid search
\`\`\`python
def hybrid_search(query, documents, alpha=0.7):
    """
    Combineer keyword search met semantic search.
    alpha: weight voor semantic search (0-1)
    """
    # Semantic scores
    semantic_scores = get_embedding_scores(query, documents)
    
    # Keyword scores (BM25 of TF-IDF)
    keyword_scores = get_keyword_scores(query, documents)
    
    # Combineer scores
    final_scores = (alpha * semantic_scores + 
                   (1 - alpha) * keyword_scores)
    
    return rank_by_scores(documents, final_scores)
\`\`\`

### 2. Domain Shift

**Pitfall**: Algemene embedding modellen presteren slecht op specialistische domeinen.

\`\`\`python
# Medisch domein voorbeeld
medical_terms = [
    "myocardiale infarct",  # Hartaanval
    "cerebrovasculair accident",  # Beroerte
    "pneumonie",  # Longontsteking
]

# Algemene embeddings begrijpen deze relaties mogelijk niet
\`\`\`

**Oplossing**: Domain-specific fine-tuning
\`\`\`python
from sentence_transformers import SentenceTransformer, InputExample, losses
from torch.utils.data import DataLoader

# Fine-tune op domein data
model = SentenceTransformer('all-MiniLM-L6-v2')

# Maak training examples
train_examples = [
    InputExample(texts=['hartaanval', 'myocardiaal infarct'], label=0.9),
    InputExample(texts=['beroerte', 'CVA'], label=0.9),
    InputExample(texts=['hartaanval', 'verkoudheid'], label=0.1),
]

# Train het model
train_dataloader = DataLoader(train_examples, shuffle=True, batch_size=16)
train_loss = losses.CosineSimilarityLoss(model)

model.fit(
    train_objectives=[(train_dataloader, train_loss)],
    epochs=10,
    warmup_steps=100
)
\`\`\`

### 3. Lengte Bias

**Pitfall**: Kortere teksten krijgen vaak lagere similarity scores.

\`\`\`python
# Probleem
short_text = "Python"
long_text = "Python is een high-level programmeer taal die bekend staat om zijn leesbaarheid en veelzijdigheid in verschillende domeinen."

# Query: "programmeer taal"
# Long text scoort vaak hoger door meer context
\`\`\`

**Oplossing**: Normalisatie strategieën
\`\`\`python
def length_normalized_similarity(query_emb, doc_emb, doc_length):
    """
    Pas similarity score aan voor document lengte.
    """
    base_similarity = cosine_similarity(query_emb, doc_emb)
    
    # Logaritmische normalisatie
    length_penalty = 1 / (1 + np.log(1 + doc_length / 100))
    
    return base_similarity * length_penalty
\`\`\`

### 4. Taalverschillen

**Pitfall**: Cross-linguale embeddings zijn niet perfect.

\`\`\`python
# Deze zouden hoog moeten scoren, maar...
nl_text = "kunstmatige intelligentie"
en_text = "artificial intelligence"
de_text = "künstliche Intelligenz"

# Kwaliteit varieert per taalpaar
\`\`\`

**Oplossing**: Taal-specifieke preprocessing
\`\`\`python
from langdetect import detect
import translators as ts

def multilingual_embedding(text, target_lang='en'):
    """
    Vertaal naar gemeenschappelijke taal voor betere alignment.
    """
    detected_lang = detect(text)
    
    if detected_lang != target_lang:
        # Vertaal naar Engels voor consistentie
        translated = ts.google(text, from_language=detected_lang, 
                              to_language=target_lang)
        # Embed beide versies
        original_emb = get_embedding(text)
        translated_emb = get_embedding(translated)
        
        # Gemiddelde voor robuustheid
        return (original_emb + translated_emb) / 2
    
    return get_embedding(text)
\`\`\`

### 5. Negatie Blindheid

**Pitfall**: Embeddings missen vaak negaties.

\`\`\`python
# Deze zijn semantisch tegengesteld, maar embeddings zien ze als similar
positive = "Dit product is geweldig"
negative = "Dit product is niet geweldig"

# Similarity score kan verrassend hoog zijn!
\`\`\`

**Oplossing**: Sentiment-aware embeddings
\`\`\`python
def sentiment_adjusted_embedding(text):
    """
    Voeg sentiment dimensie toe aan embeddings.
    """
    # Basis embedding
    base_embedding = get_embedding(text)
    
    # Sentiment score
    sentiment = get_sentiment_score(text)  # -1 tot 1
    
    # Voeg sentiment toe als extra dimensies
    sentiment_vector = [sentiment] * 10  # 10 sentiment dimensies
    
    return np.concatenate([base_embedding, sentiment_vector])
\`\`\`

### 6. Update Lag

**Pitfall**: Embeddings van nieuwe concepten ontbreken.

\`\`\`python
# Model getraind voor 2023 kent deze niet
new_concepts = [
    "GPT-5",
    "Apple Vision Pro gebruikerservaring",
    "Nieuwe COVID variant XYZ"
]
\`\`\`

**Oplossing**: Incremental learning
\`\`\`python
class AdaptiveEmbeddings:
    def __init__(self, base_model):
        self.base_model = base_model
        self.new_concepts = {}  # Cache voor nieuwe embeddings
        
    def add_concept(self, concept, similar_concepts):
        """
        Voeg nieuw concept toe door interpolatie.
        """
        # Embed similar concepts
        similar_embeddings = [
            self.get_embedding(c) for c in similar_concepts
        ]
        
        # Gemiddelde als proxy
        new_embedding = np.mean(similar_embeddings, axis=0)
        self.new_concepts[concept] = new_embedding
        
    def get_embedding(self, text):
        # Check cache eerst
        if text in self.new_concepts:
            return self.new_concepts[text]
        
        # Anders gebruik base model
        return self.base_model.encode(text)
\`\`\`

### 7. Chunk Boundary Issues

**Pitfall**: Belangrijke informatie wordt gesplitst over chunks.

\`\`\`python
# Problematische split
chunk1 = "De prijs van het product is 50"
chunk2 = "euro exclusief BTW."

# Query: "Wat kost het product?"
# Chunk 1 mist valuta, Chunk 2 mist prijs
\`\`\`

**Oplossing**: Sliding window met smart boundaries
\`\`\`python
def smart_chunking(text, max_tokens=400, overlap=50):
    """
    Chunk op natuurlijke grenzen met overlap.
    """
    sentences = split_into_sentences(text)
    chunks = []
    current_chunk = []
    current_tokens = 0
    
    for sent in sentences:
        sent_tokens = count_tokens(sent)
        
        # Als zin te lang is voor chunk
        if current_tokens + sent_tokens > max_tokens:
            # Sla huidige chunk op
            if current_chunk:
                chunk_text = ' '.join(current_chunk)
                chunks.append(chunk_text)
                
                # Overlap: neem laatste paar zinnen mee
                overlap_sents = get_overlap_sentences(
                    current_chunk, overlap
                )
                current_chunk = overlap_sents
                current_tokens = count_tokens(' '.join(overlap_sents))
        
        current_chunk.append(sent)
        current_tokens += sent_tokens
    
    # Laatste chunk
    if current_chunk:
        chunks.append(' '.join(current_chunk))
    
    return chunks
\`\`\`

## Uitdagingen en Geavanceerde Oplossingen

### 1. Embedding Quality voor Specifieke Use Cases

**Probleem**: Algemene modellen presteren niet optimaal voor alle toepassingen.

**Geavanceerde Oplossing**: Multi-stage retrieval
\`\`\`python
class MultiStageRetriever:
    def __init__(self):
        self.coarse_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.fine_model = SentenceTransformer('all-mpnet-base-v2')
        self.reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
    
    def retrieve(self, query, documents, top_k=10):
        # Stage 1: Snelle coarse retrieval
        coarse_embeddings = self.coarse_model.encode(documents)
        query_embedding = self.coarse_model.encode(query)
        
        coarse_scores = cosine_similarity([query_embedding], coarse_embeddings)[0]
        top_indices = np.argsort(coarse_scores)[-top_k*3:][::-1]
        
        # Stage 2: Fine-grained embeddings
        candidate_docs = [documents[i] for i in top_indices]
        fine_embeddings = self.fine_model.encode(candidate_docs)
        query_fine = self.fine_model.encode(query)
        
        fine_scores = cosine_similarity([query_fine], fine_embeddings)[0]
        top_fine = np.argsort(fine_scores)[-top_k*2:][::-1]
        
        # Stage 3: Cross-encoder reranking
        rerank_candidates = [candidate_docs[i] for i in top_fine]
        pairs = [[query, doc] for doc in rerank_candidates]
        rerank_scores = self.reranker.predict(pairs)
        
        # Final ranking
        final_indices = np.argsort(rerank_scores)[-top_k:][::-1]
        return [rerank_candidates[i] for i in final_indices]
\`\`\`

### 2. Multimodaliteit

**Probleem**: Documenten bevatten afbeeldingen, tabellen, en grafieken.

**Oplossing**: Multimodal embeddings
\`\`\`python
from transformers import CLIPModel, CLIPProcessor

class MultimodalRAG:
    def __init__(self):
        self.clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
        self.clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
        self.text_model = SentenceTransformer('all-mpnet-base-v2')
    
    def encode_multimodal(self, content):
        """
        Encode tekst en afbeeldingen in gemeenschappelijke ruimte.
        """
        embeddings = []
        
        for item in content:
            if item['type'] == 'text':
                # Tekst embedding
                text_emb = self.text_model.encode(item['content'])
                embeddings.append({
                    'type': 'text',
                    'embedding': text_emb,
                    'content': item['content']
                })
            
            elif item['type'] == 'image':
                # Image embedding via CLIP
                inputs = self.clip_processor(
                    images=item['content'], 
                    return_tensors="pt"
                )
                image_emb = self.clip_model.get_image_features(**inputs)
                
                # Project naar zelfde dimensie als tekst
                projected = self.project_embedding(
                    image_emb.numpy()[0], 
                    target_dim=768
                )
                
                embeddings.append({
                    'type': 'image',
                    'embedding': projected,
                    'content': item['path']
                })
        
        return embeddings
\`\`\`

### 3. Real-time Updates

**Probleem**: Knowledge base moet constant bijgewerkt worden.

**Oplossing**: Incremental indexing
\`\`\`python
class IncrementalVectorIndex:
    def __init__(self, dimension=768):
        self.dimension = dimension
        self.index = None
        self.id_map = {}
        self.deleted_ids = set()
        
    def add_vectors(self, vectors, ids):
        """
        Voeg nieuwe vectors toe zonder volledige reindex.
        """
        if self.index is None:
            # Initiële index
            self.index = faiss.IndexFlatL2(self.dimension)
        
        # Filter bestaande IDs
        new_vectors = []
        new_ids = []
        
        for vec, id in zip(vectors, ids):
            if id not in self.id_map and id not in self.deleted_ids:
                new_vectors.append(vec)
                new_ids.append(id)
                self.id_map[id] = len(self.id_map)
        
        if new_vectors:
            self.index.add(np.array(new_vectors))
            
    def soft_delete(self, ids):
        """
        Markeer vectors als verwijderd zonder reindex.
        """
        self.deleted_ids.update(ids)
        
    def search(self, query_vector, k=10):
        """
        Zoek met filtering van verwijderde items.
        """
        # Zoek meer resultaten om deletions te compenseren
        distances, indices = self.index.search(
            query_vector.reshape(1, -1), 
            k * 2
        )
        
        # Filter verwijderde resultaten
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            id = self.get_id_from_index(idx)
            if id not in self.deleted_ids:
                results.append((id, dist))
                
            if len(results) >= k:
                break
                
        return results
\`\`\`

## Praktische Implementatie Tips

### 1. Start Klein

\`\`\`python
# Begin met een in-memory vector store
from sentence_transformers import SentenceTransformer
import faiss

# Laad embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Creëer FAISS index
dimension = 384  # Dimensie van embeddings
index = faiss.IndexFlatL2(dimension)

# Embed en indexeer
texts = ["tekst1", "tekst2", "tekst3"]
embeddings = model.encode(texts)
index.add(embeddings)
\`\`\`

### 2. Monitor Performance

- **Latency**: Hoe snel zijn queries?
- **Recall**: Vind je de juiste documenten?
- **Kosten**: Hoeveel API calls maak je?

### 3. Itereer en Verbeter

- A/B test verschillende chunk sizes
- Experimenteer met re-ranking
- Verzamel feedback van gebruikers

## Samenvatting

In deze les hebben we de fundamentele technologieën achter RAG grondig verkend:

### Kernconcepten
✅ **Embeddings** transformeren tekst naar hoog-dimensionale vectoren die semantische betekenis vastleggen
✅ **Embedding modellen** variëren van OpenAI's ada-002 tot open-source alternatieven zoals Sentence-BERT
✅ **Dimensionaliteit** bepaalt de trade-off tussen precisie, snelheid en opslagkosten
✅ **Similarity metrics** zoals cosine, euclidean en dot product hebben elk hun toepassingsgebieden

### Praktische Inzichten
✅ **Semantic search** overtreft keyword search door betekenis te begrijpen
✅ **Vector databases** zijn essentieel voor schaalbare RAG implementaties
✅ **Hybrid search** combineert het beste van semantic en keyword matching
✅ **Chunking strategieën** bepalen retrieval kwaliteit

### Belangrijke Valkuilen
✅ **Exacte match problemen** vereisen hybrid search oplossingen
✅ **Domain shift** vraagt om fine-tuning of domein-specifieke modellen
✅ **Lengte bias** moet gecompenseerd worden met normalisatie
✅ **Negatie blindheid** en andere semantische nuances vereisen speciale aandacht

### Best Practices
✅ Begin met proven modellen en itereer op basis van resultaten
✅ Monitor performance metrics continu
✅ Implementeer multi-stage retrieval voor optimale kwaliteit
✅ Overweeg multimodale embeddings voor rijke content

Met deze kennis ben je klaar om effectieve RAG systemen te bouwen die schaalbaar, accuraat en robuust zijn. In de volgende les duiken we in de praktische beperkingen: context windows en token limits.
`,
  codeExamples: [
    {
      id: 'embedding-example',
      title: 'Complete RAG Pipeline met Embeddings',
      language: 'python',
      code: `import openai
from typing import List, Dict
import numpy as np
from dataclasses import dataclass

@dataclass
class Document:
    id: str
    text: str
    embedding: List[float] = None
    metadata: Dict = None

class SimpleRAG:
    def __init__(self, openai_key: str):
        openai.api_key = openai_key
        self.documents = []
        self.model = "text-embedding-3-small"
    
    def add_document(self, text: str, metadata: Dict = None):
        """Voeg document toe aan knowledge base."""
        doc_id = f"doc_{len(self.documents)}"
        embedding = self._create_embedding(text)
        
        doc = Document(
            id=doc_id,
            text=text,
            embedding=embedding,
            metadata=metadata or {}
        )
        self.documents.append(doc)
        return doc_id
    
    def _create_embedding(self, text: str) -> List[float]:
        """Creëer embedding voor tekst."""
        response = openai.Embedding.create(
            model=self.model,
            input=text
        )
        return response['data'][0]['embedding']
    
    def search(self, query: str, top_k: int = 3) -> List[Document]:
        """Zoek relevante documenten voor query."""
        query_embedding = self._create_embedding(query)
        
        # Bereken similarities
        similarities = []
        for doc in self.documents:
            sim = self._cosine_similarity(query_embedding, doc.embedding)
            similarities.append((sim, doc))
        
        # Sorteer en return top k
        similarities.sort(key=lambda x: x[0], reverse=True)
        return [doc for _, doc in similarities[:top_k]]
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Bereken cosine similarity tussen twee vectoren."""
        vec1 = np.array(vec1)
        vec2 = np.array(vec2)
        
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        return dot_product / (norm1 * norm2)
    
    def query(self, question: str) -> str:
        """Beantwoord vraag met RAG."""
        # Zoek relevante documenten
        relevant_docs = self.search(question, top_k=3)
        
        # Bouw context
        context = "\\n\\n".join([
            f"Bron {i+1}: {doc.text}"
            for i, doc in enumerate(relevant_docs)
        ])
        
        # Genereer antwoord
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Beantwoord vragen op basis van de gegeven context."},
                {"role": "user", "content": f"Context:\\n{context}\\n\\nVraag: {question}"}
            ]
        )
        
        return response.choices[0].message['content']

# Gebruik
rag = SimpleRAG("jouw-openai-key")

# Voeg documenten toe
rag.add_document(
    "RAG staat voor Retrieval-Augmented Generation. Het combineert zoeken met AI generatie.",
    {"source": "intro.pdf", "chapter": 1}
)

rag.add_document(
    "Embeddings zijn numerieke representaties van tekst die semantische betekenis vastleggen.",
    {"source": "embeddings.pdf", "chapter": 3}
)

# Stel een vraag
antwoord = rag.query("Wat is RAG en hoe werken embeddings?")
print(antwoord)`
    },
    {
      id: 'vector-db-example',
      title: 'Vector Database Implementatie met Qdrant',
      language: 'python',
      code: `from qdrant_client import QdrantClient
from qdrant_client.http import models
from sentence_transformers import SentenceTransformer
import uuid

class QdrantRAG:
    def __init__(self, collection_name: str = "knowledge_base"):
        # Initialiseer Qdrant client (lokaal of cloud)
        self.client = QdrantClient("localhost", port=6333)
        self.collection_name = collection_name
        
        # Laad embedding model
        self.encoder = SentenceTransformer('all-MiniLM-L6-v2')
        self.dimension = 384
        
        # Maak collection aan
        self._create_collection()
    
    def _create_collection(self):
        """Maak vector collection aan als deze niet bestaat."""
        try:
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(
                    size=self.dimension,
                    distance=models.Distance.COSINE
                )
            )
            print(f"Collection '{self.collection_name}' aangemaakt")
        except:
            print(f"Collection '{self.collection_name}' bestaat al")
    
    def index_documents(self, documents: List[Dict]):
        """
        Indexeer documenten in Qdrant.
        
        documents = [
            {
                "text": "Document tekst",
                "metadata": {"source": "file.pdf", "page": 1}
            }
        ]
        """
        points = []
        
        for doc in documents:
            # Genereer unieke ID
            doc_id = str(uuid.uuid4())
            
            # Creëer embedding
            embedding = self.encoder.encode(doc['text']).tolist()
            
            # Maak Qdrant point
            point = models.PointStruct(
                id=doc_id,
                vector=embedding,
                payload={
                    "text": doc['text'],
                    **doc.get('metadata', {})
                }
            )
            points.append(point)
        
        # Upload naar Qdrant
        self.client.upsert(
            collection_name=self.collection_name,
            points=points
        )
        
        print(f"{len(points)} documenten geïndexeerd")
    
    def search(self, query: str, limit: int = 5, filters: Dict = None):
        """
        Zoek relevante documenten.
        
        filters = {
            "must": [
                {"key": "source", "match": {"value": "handbook.pdf"}}
            ]
        }
        """
        # Embed query
        query_vector = self.encoder.encode(query).tolist()
        
        # Bouw filter indien nodig
        query_filter = None
        if filters:
            query_filter = models.Filter(**filters)
        
        # Zoek in Qdrant
        results = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            limit=limit,
            query_filter=query_filter,
            with_payload=True
        )
        
        return [
            {
                "text": hit.payload['text'],
                "score": hit.score,
                "metadata": {k: v for k, v in hit.payload.items() if k != 'text'}
            }
            for hit in results
        ]
    
    def hybrid_search(self, query: str, keywords: List[str], limit: int = 5):
        """
        Combineer semantic search met keyword filtering.
        """
        # Semantic search
        semantic_results = self.search(query, limit=limit*2)
        
        # Filter op keywords
        filtered_results = []
        for result in semantic_results:
            text_lower = result['text'].lower()
            if any(keyword.lower() in text_lower for keyword in keywords):
                filtered_results.append(result)
        
        return filtered_results[:limit]

# Gebruik
rag = QdrantRAG("rag_knowledge_base")

# Indexeer documenten
documents = [
    {
        "text": "RAG architectuur bestaat uit drie componenten: retrieval, augmentation en generation.",
        "metadata": {"source": "architecture.pdf", "chapter": "2", "language": "nl"}
    },
    {
        "text": "Vector databases zoals Qdrant maken efficiënte similarity search mogelijk.",
        "metadata": {"source": "databases.pdf", "chapter": "5", "language": "nl"}
    },
    {
        "text": "Embeddings worden gegenereerd met transformer modellen zoals BERT of GPT.",
        "metadata": {"source": "embeddings.pdf", "chapter": "3", "language": "nl"}
    }
]

rag.index_documents(documents)

# Zoek met filters
results = rag.search(
    "Hoe werkt RAG architectuur?",
    filters={
        "must": [
            {"key": "language", "match": {"value": "nl"}}
        ]
    }
)

for result in results:
    print(f"Score: {result['score']:.3f}")
    print(f"Bron: {result['metadata']['source']}")
    print(f"Tekst: {result['text']}\\n")`
    },
    {
      id: 'chunking-strategy',
      title: 'Slimme Document Chunking Strategie',
      language: 'typescript',
      code: `interface ChunkOptions {
  maxTokens: number;
  overlap: number;
  splitStrategy: 'sentence' | 'paragraph' | 'semantic';
}

interface Chunk {
  text: string;
  metadata: {
    sourceId: string;
    chunkIndex: number;
    startChar: number;
    endChar: number;
    tokens: number;
  };
}

class DocumentChunker {
  private encoder: any; // Token encoder (bijv. tiktoken)
  
  constructor(encoder: any) {
    this.encoder = encoder;
  }
  
  /**
   * Split document in chunks met overlap.
   */
  chunkDocument(
    text: string,
    sourceId: string,
    options: ChunkOptions
  ): Chunk[] {
    switch (options.splitStrategy) {
      case 'sentence':
        return this.chunkBySentence(text, sourceId, options);
      case 'paragraph':
        return this.chunkByParagraph(text, sourceId, options);
      case 'semantic':
        return this.chunkBySemantic(text, sourceId, options);
      default:
        throw new Error(\`Unknown strategy: \${options.splitStrategy}\`);
    }
  }
  
  private chunkBySentence(
    text: string,
    sourceId: string,
    options: ChunkOptions
  ): Chunk[] {
    // Split op zinnen
    const sentences = this.splitIntoSentences(text);
    const chunks: Chunk[] = [];
    
    let currentChunk = '';
    let currentTokens = 0;
    let chunkIndex = 0;
    let startChar = 0;
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const sentenceTokens = this.countTokens(sentence);
      
      // Check of zin past in huidige chunk
      if (currentTokens + sentenceTokens <= options.maxTokens) {
        currentChunk += sentence + ' ';
        currentTokens += sentenceTokens;
      } else {
        // Sla huidige chunk op
        if (currentChunk) {
          chunks.push({
            text: currentChunk.trim(),
            metadata: {
              sourceId,
              chunkIndex: chunkIndex++,
              startChar,
              endChar: startChar + currentChunk.length,
              tokens: currentTokens
            }
          });
        }
        
        // Start nieuwe chunk met overlap
        const overlapSentences = this.getOverlapSentences(
          sentences,
          i,
          options.overlap
        );
        
        currentChunk = overlapSentences + sentence + ' ';
        currentTokens = this.countTokens(currentChunk);
        startChar += currentChunk.length - this.countTokens(overlapSentences);
      }
    }
    
    // Laatste chunk
    if (currentChunk) {
      chunks.push({
        text: currentChunk.trim(),
        metadata: {
          sourceId,
          chunkIndex: chunkIndex++,
          startChar,
          endChar: text.length,
          tokens: currentTokens
        }
      });
    }
    
    return chunks;
  }
  
  private chunkBySemantic(
    text: string,
    sourceId: string,
    options: ChunkOptions
  ): Chunk[] {
    // Semantic chunking: splits op natuurlijke grenzen
    const sections = this.identifySemanticSections(text);
    const chunks: Chunk[] = [];
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const tokens = this.countTokens(section.text);
      
      if (tokens <= options.maxTokens) {
        // Section past in één chunk
        chunks.push({
          text: section.text,
          metadata: {
            sourceId,
            chunkIndex: i,
            startChar: section.start,
            endChar: section.end,
            tokens
          }
        });
      } else {
        // Split grote sections verder op
        const subChunks = this.chunkBySentence(
          section.text,
          sourceId,
          options
        );
        
        // Pas metadata aan
        subChunks.forEach((chunk, idx) => {
          chunk.metadata.chunkIndex = i + idx * 0.1;
          chunk.metadata.startChar += section.start;
          chunk.metadata.endChar += section.start;
        });
        
        chunks.push(...subChunks);
      }
    }
    
    return chunks;
  }
  
  private identifySemanticSections(text: string): any[] {
    const sections = [];
    
    // Identificeer secties op basis van:
    // 1. Headers (# , ## , ### etc)
    // 2. Lege regels
    // 3. Topic shifts
    
    const lines = text.split('\\n');
    let currentSection = '';
    let sectionStart = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check voor header
      if (line.match(/^#+\\s/)) {
        if (currentSection) {
          sections.push({
            text: currentSection.trim(),
            start: sectionStart,
            end: sectionStart + currentSection.length
          });
        }
        
        currentSection = line + '\\n';
        sectionStart += currentSection.length;
      } else if (line.trim() === '' && currentSection.length > 500) {
        // Natuurlijke break bij lege regel
        sections.push({
          text: currentSection.trim(),
          start: sectionStart,
          end: sectionStart + currentSection.length
        });
        
        currentSection = '';
        sectionStart += line.length + 1;
      } else {
        currentSection += line + '\\n';
      }
    }
    
    // Laatste sectie
    if (currentSection) {
      sections.push({
        text: currentSection.trim(),
        start: sectionStart,
        end: text.length
      });
    }
    
    return sections;
  }
  
  private splitIntoSentences(text: string): string[] {
    // Simpele zin splitter (productie: gebruik NLP library)
    return text.match(/[^.!?]+[.!?]+/g) || [text];
  }
  
  private countTokens(text: string): number {
    return this.encoder.encode(text).length;
  }
  
  private getOverlapSentences(
    sentences: string[],
    currentIndex: number,
    overlapTokens: number
  ): string {
    let overlap = '';
    let tokens = 0;
    
    // Loop achteruit door vorige zinnen
    for (let i = currentIndex - 1; i >= 0 && tokens < overlapTokens; i--) {
      const sentence = sentences[i];
      const sentenceTokens = this.countTokens(sentence);
      
      if (tokens + sentenceTokens <= overlapTokens) {
        overlap = sentence + ' ' + overlap;
        tokens += sentenceTokens;
      } else {
        break;
      }
    }
    
    return overlap;
  }
}

// Gebruik
import { encoding_for_model } from 'tiktoken';

const encoder = encoding_for_model('gpt-3.5-turbo');
const chunker = new DocumentChunker(encoder);

const document = \`
# RAG Architectuur

Retrieval-Augmented Generation combineert het beste van twee werelden.

## Componenten

De architectuur bestaat uit drie hoofdcomponenten:

1. Retriever: Zoekt relevante documenten
2. Augmenter: Combineert context met query
3. Generator: Produceert het antwoord

Dit is een revolutionaire aanpak die...
\`;

const chunks = chunker.chunkDocument(
  document,
  'doc-001',
  {
    maxTokens: 200,
    overlap: 50,
    splitStrategy: 'semantic'
  }
);

chunks.forEach((chunk, i) => {
  console.log(\`Chunk \${i + 1}:\`);
  console.log(\`Tokens: \${chunk.metadata.tokens}\`);
  console.log(\`Text: \${chunk.text.substring(0, 100)}...\\n\`);
});`
    },
    {
      id: 'embedding-comparison',
      title: 'Vergelijk Embedding Modellen en Metrics',
      language: 'python',
      code: `import numpy as np
from sentence_transformers import SentenceTransformer
import openai
import time
from typing import List, Dict
import matplotlib.pyplot as plt

class EmbeddingBenchmark:
    """
    Vergelijk verschillende embedding modellen en similarity metrics.
    """
    def __init__(self, openai_key: str = None):
        self.models = {
            'minilm': SentenceTransformer('all-MiniLM-L6-v2'),
            'mpnet': SentenceTransformer('all-mpnet-base-v2'),
            'multilingual': SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')
        }
        
        if openai_key:
            openai.api_key = openai_key
            self.use_openai = True
        else:
            self.use_openai = False
    
    def embed_texts(self, texts: List[str], model_name: str) -> np.ndarray:
        """
        Embed teksten met specifiek model.
        """
        if model_name in self.models:
            return self.models[model_name].encode(texts)
        
        elif model_name == 'openai-ada' and self.use_openai:
            embeddings = []
            for text in texts:
                response = openai.Embedding.create(
                    model="text-embedding-ada-002",
                    input=text
                )
                embeddings.append(response['data'][0]['embedding'])
            return np.array(embeddings)
        
        else:
            raise ValueError(f"Onbekend model: {model_name}")
    
    def compare_similarities(
        self, 
        query: str, 
        documents: List[str],
        models_to_test: List[str] = None
    ) -> Dict:
        """
        Vergelijk hoe verschillende modellen documenten ranken.
        """
        if models_to_test is None:
            models_to_test = list(self.models.keys())
        
        results = {}
        
        for model_name in models_to_test:
            # Embed query en documenten
            query_emb = self.embed_texts([query], model_name)[0]
            doc_embs = self.embed_texts(documents, model_name)
            
            # Bereken verschillende similarity metrics
            metrics = {}
            
            # Cosine similarity
            query_norm = query_emb / np.linalg.norm(query_emb)
            doc_norms = doc_embs / np.linalg.norm(doc_embs, axis=1)[:, np.newaxis]
            metrics['cosine'] = np.dot(doc_norms, query_norm)
            
            # Euclidean distance (negated voor consistency)
            metrics['euclidean'] = -np.linalg.norm(doc_embs - query_emb, axis=1)
            
            # Dot product
            metrics['dot_product'] = np.dot(doc_embs, query_emb)
            
            # Manhattan distance (negated)
            metrics['manhattan'] = -np.sum(np.abs(doc_embs - query_emb), axis=1)
            
            results[model_name] = metrics
        
        return results
    
    def visualize_results(self, results: Dict, documents: List[str]):
        """
        Visualiseer ranking verschillen tussen modellen en metrics.
        """
        fig, axes = plt.subplots(2, 2, figsize=(15, 12))
        axes = axes.ravel()
        
        metrics = ['cosine', 'euclidean', 'dot_product', 'manhattan']
        
        for idx, metric in enumerate(metrics):
            ax = axes[idx]
            
            # Verzamel scores per model
            model_scores = {}
            for model, metrics_dict in results.items():
                scores = metrics_dict[metric]
                # Normaliseer scores naar 0-1 range
                min_score, max_score = scores.min(), scores.max()
                normalized = (scores - min_score) / (max_score - min_score)
                model_scores[model] = normalized
            
            # Plot bars
            x = np.arange(len(documents))
            width = 0.25
            
            for i, (model, scores) in enumerate(model_scores.items()):
                ax.bar(x + i * width, scores, width, label=model)
            
            ax.set_xlabel('Document Index')
            ax.set_ylabel('Normalized Score')
            ax.set_title(f'{metric.title()} Similarity')
            ax.set_xticks(x + width)
            ax.set_xticklabels([f'Doc {i+1}' for i in range(len(documents))])
            ax.legend()
        
        plt.tight_layout()
        plt.show()
    
    def benchmark_speed(self, texts: List[str], n_runs: int = 5) -> Dict:
        """
        Benchmark embedding snelheid van verschillende modellen.
        """
        timings = {}
        
        for model_name in self.models.keys():
            times = []
            
            for _ in range(n_runs):
                start = time.time()
                _ = self.embed_texts(texts, model_name)
                elapsed = time.time() - start
                times.append(elapsed)
            
            avg_time = np.mean(times)
            texts_per_second = len(texts) / avg_time
            
            timings[model_name] = {
                'avg_time': avg_time,
                'texts_per_second': texts_per_second
            }
        
        return timings

# Gebruik voorbeeld
benchmark = EmbeddingBenchmark()

# Test documenten
query = "Wat zijn de voordelen van machine learning?"
documents = [
    "Machine learning biedt automatisering en verbeterde besluitvorming.",
    "Deep learning is een subset van machine learning met neurale netwerken.",
    "Python is de populairste taal voor data science projecten.",
    "Kunstmatige intelligentie transformeert verschillende industrieën.",
    "ML algoritmes kunnen patronen ontdekken in grote datasets."
]

# Vergelijk modellen en metrics
results = benchmark.compare_similarities(query, documents)

# Visualiseer resultaten
benchmark.visualize_results(results, documents)

# Benchmark snelheid
speed_results = benchmark.benchmark_speed(documents * 100)
for model, stats in speed_results.items():
    print(f"{model}: {stats['texts_per_second']:.0f} texts/sec")

# Analyseer ranking verschillen
print("\\nRanking verschillen tussen metrics (MiniLM model):")
minilm_results = results['minilm']
for metric in ['cosine', 'euclidean', 'dot_product']:
    scores = minilm_results[metric]
    ranking = np.argsort(scores)[::-1]
    print(f"\\n{metric.title()}:")
    for rank, idx in enumerate(ranking[:3]):
        print(f"  {rank+1}. Doc {idx+1}: {documents[idx][:50]}...")`
    }
  ],
  assignments: [
    {
      id: 'exercise-1',
      title: 'Bereken Embedding Similarities',
      description: 'Schrijf een functie die de cosine similarity berekent tussen meerdere embeddings en de meest vergelijkbare paren identificeert.',
      type: 'code',
      difficulty: 'easy',
      solution: `import numpy as np
from typing import List, Tuple

def find_similar_pairs(embeddings: dict, threshold: float = 0.8) -> List[Tuple[str, str, float]]:
    """
    Vind alle paren van embeddings met similarity boven threshold.
    
    Args:
        embeddings: Dictionary met naam -> embedding vector
        threshold: Minimale similarity score
    
    Returns:
        List van tuples (naam1, naam2, similarity_score)
    """
    def cosine_similarity(vec1, vec2):
        vec1 = np.array(vec1)
        vec2 = np.array(vec2)
        
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        return dot_product / (norm1 * norm2)
    
    similar_pairs = []
    names = list(embeddings.keys())
    
    # Vergelijk alle paren
    for i in range(len(names)):
        for j in range(i + 1, len(names)):
            name1, name2 = names[i], names[j]
            similarity = cosine_similarity(
                embeddings[name1],
                embeddings[name2]
            )
            
            if similarity >= threshold:
                similar_pairs.append((name1, name2, similarity))
    
    # Sorteer op similarity (hoogste eerst)
    similar_pairs.sort(key=lambda x: x[2], reverse=True)
    
    return similar_pairs

# Test
embeddings = {
    "Python programmeren": [0.8, 0.6, 0.2, 0.1],
    "JavaScript coderen": [0.7, 0.5, 0.3, 0.2],
    "Machine learning": [0.2, 0.3, 0.9, 0.8],
    "Deep learning": [0.1, 0.2, 0.95, 0.85],
    "Koken": [0.9, 0.1, 0.1, 0.1]
}

similar = find_similar_pairs(embeddings, threshold=0.7)
for name1, name2, score in similar:
    print(f"{name1} <-> {name2}: {score:.3f}")`
    },
    {
      id: 'exercise-2',
      title: 'Implementeer een Simple Vector Store',
      description: 'Bouw een in-memory vector store met basis CRUD operaties en similarity search.',
      type: 'code',
      difficulty: 'medium',
      solution: `from typing import List, Dict, Any, Optional
import numpy as np
import json

class InMemoryVectorStore:
    def __init__(self, dimension: int):
        """
        Initialiseer vector store.
        
        Args:
            dimension: Dimensie van de embeddings
        """
        self.dimension = dimension
        self.vectors = {}  # id -> vector
        self.metadata = {}  # id -> metadata
        self.index = []  # lijst van ids voor snelle iteratie
    
    def add(self, id: str, vector: List[float], metadata: Dict[str, Any] = None):
        """Voeg vector toe aan store."""
        if len(vector) != self.dimension:
            raise ValueError(f"Vector moet {self.dimension} dimensies hebben")
        
        self.vectors[id] = np.array(vector)
        self.metadata[id] = metadata or {}
        
        if id not in self.index:
            self.index.append(id)
    
    def get(self, id: str) -> Optional[Dict[str, Any]]:
        """Haal vector op met metadata."""
        if id not in self.vectors:
            return None
        
        return {
            "id": id,
            "vector": self.vectors[id].tolist(),
            "metadata": self.metadata.get(id, {})
        }
    
    def delete(self, id: str) -> bool:
        """Verwijder vector uit store."""
        if id not in self.vectors:
            return False
        
        del self.vectors[id]
        del self.metadata[id]
        self.index.remove(id)
        return True
    
    def search(self, query_vector: List[float], top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Zoek meest vergelijkbare vectoren.
        
        Args:
            query_vector: Query vector
            top_k: Aantal resultaten
        
        Returns:
            Lijst met resultaten gesorteerd op similarity
        """
        if len(query_vector) != self.dimension:
            raise ValueError(f"Query vector moet {self.dimension} dimensies hebben")
        
        query = np.array(query_vector)
        similarities = []
        
        # Bereken similarities
        for id in self.index:
            vector = self.vectors[id]
            
            # Cosine similarity
            dot_product = np.dot(query, vector)
            norm_query = np.linalg.norm(query)
            norm_vector = np.linalg.norm(vector)
            similarity = dot_product / (norm_query * norm_vector)
            
            similarities.append({
                "id": id,
                "score": float(similarity),
                "metadata": self.metadata.get(id, {})
            })
        
        # Sorteer en return top k
        similarities.sort(key=lambda x: x["score"], reverse=True)
        return similarities[:top_k]
    
    def save(self, filepath: str):
        """Sla vector store op naar bestand."""
        data = {
            "dimension": self.dimension,
            "vectors": {id: vec.tolist() for id, vec in self.vectors.items()},
            "metadata": self.metadata,
            "index": self.index
        }
        
        with open(filepath, 'w') as f:
            json.dump(data, f)
    
    def load(self, filepath: str):
        """Laad vector store van bestand."""
        with open(filepath, 'r') as f:
            data = json.load(f)
        
        self.dimension = data["dimension"]
        self.vectors = {id: np.array(vec) for id, vec in data["vectors"].items()}
        self.metadata = data["metadata"]
        self.index = data["index"]
    
    def stats(self) -> Dict[str, Any]:
        """Krijg statistieken over de store."""
        return {
            "total_vectors": len(self.vectors),
            "dimension": self.dimension,
            "memory_usage_mb": sum(
                vec.nbytes for vec in self.vectors.values()
            ) / (1024 * 1024)
        }

# Test de implementatie
store = InMemoryVectorStore(dimension=4)

# Voeg vectors toe
store.add("doc1", [0.1, 0.2, 0.3, 0.4], {"title": "Intro to ML"})
store.add("doc2", [0.2, 0.3, 0.4, 0.5], {"title": "Deep Learning"})
store.add("doc3", [0.9, 0.8, 0.1, 0.0], {"title": "Cooking 101"})

# Zoek
results = store.search([0.15, 0.25, 0.35, 0.45], top_k=2)
for result in results:
    print(f"ID: {result['id']}, Score: {result['score']:.3f}, Title: {result['metadata']['title']}")`
    },
    {
      id: 'exercise-3',
      title: 'Optimaliseer Chunk Size',
      description: 'Experimenteer met verschillende chunk sizes en meet de impact op search quality.',
      type: 'quiz',
      difficulty: 'expert',
      solution: `# Optimale Chunk Size Analyse

## Factoren om te overwegen:

1. **Token Limits**
   - Te groot: Past niet in context window
   - Te klein: Mist belangrijke context
   - Sweet spot: 200-800 tokens

2. **Content Type**
   - Technische docs: Kleinere chunks (200-400 tokens)
   - Narratieve tekst: Grotere chunks (500-800 tokens)
   - Code: Functie/class niveau chunking

3. **Overlap Strategy**
   - 10-20% overlap voorkomt context verlies
   - Meer overlap = betere context, maar meer opslag
   - Minder overlap = efficiënter, maar risico op gemiste info

4. **Meetmethoden**
   A. Precision/Recall op test queries
   B. Human evaluation van retrieved chunks
   C. End-to-end RAG performance

5. **Best Practices**
   - Start met 400 tokens, 50 token overlap
   - A/B test verschillende configuraties
   - Monitor gebruikersfeedback
   - Pas aan per document type

## Voorbeeld Experiment:

\`\`\`python
chunk_configs = [
    {"size": 200, "overlap": 20},
    {"size": 400, "overlap": 50},
    {"size": 600, "overlap": 100},
    {"size": 800, "overlap": 100}
]

for config in chunk_configs:
    # Chunk documents
    chunks = create_chunks(docs, **config)
    
    # Index in vector store
    index_chunks(chunks)
    
    # Test met query set
    results = evaluate_retrieval(test_queries)
    
    print(f"Config {config}: Precision={results['precision']:.3f}, Recall={results['recall']:.3f}")
\`\`\`

Optimale chunk size hangt af van jouw specifieke use case!`
    },
    {
      id: 'exercise-4',
      title: 'Los Common Embedding Pitfalls Op',
      description: 'Implementeer oplossingen voor veelvoorkomende problemen met embeddings zoals exact match failures en negation blindness.',
      type: 'code',
      difficulty: 'expert',
      solution: `from typing import List, Tuple, Dict
import numpy as np
from sentence_transformers import SentenceTransformer
import re
from collections import Counter

class RobustEmbeddingSearch:
    """
    Implementeer robuuste search die common pitfalls aanpakt.
    """
    def __init__(self):
        self.semantic_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.negation_words = {'not', 'no', 'never', 'neither', 'nor', 'geen', 'niet', 'nooit'}
        
    def hybrid_search(
        self, 
        query: str, 
        documents: List[str], 
        alpha: float = 0.7
    ) -> List[Tuple[int, float]]:
        """
        Combineer semantic en keyword search om exact match problemen op te lossen.
        
        Args:
            query: Zoekopdracht
            documents: Lijst van documenten
            alpha: Weight voor semantic search (0-1)
        
        Returns:
            Gesorteerde lijst van (doc_index, combined_score)
        """
        # 1. Semantic search
        query_embedding = self.semantic_model.encode([query])
        doc_embeddings = self.semantic_model.encode(documents)
        
        semantic_scores = np.dot(doc_embeddings, query_embedding.T).flatten()
        semantic_scores = (semantic_scores - semantic_scores.min()) / (semantic_scores.max() - semantic_scores.min())
        
        # 2. Keyword search (TF-IDF simplified)
        query_tokens = set(self._tokenize(query.lower()))
        keyword_scores = []
        
        for doc in documents:
            doc_tokens = self._tokenize(doc.lower())
            
            # Exact match bonus
            exact_match_score = 1.0 if query.lower() in doc.lower() else 0.0
            
            # Token overlap
            doc_token_set = set(doc_tokens)
            overlap = len(query_tokens.intersection(doc_token_set))
            overlap_score = overlap / len(query_tokens) if query_tokens else 0
            
            # Combine keyword scores
            keyword_score = 0.7 * overlap_score + 0.3 * exact_match_score
            keyword_scores.append(keyword_score)
        
        keyword_scores = np.array(keyword_scores)
        
        # 3. Combine scores
        combined_scores = alpha * semantic_scores + (1 - alpha) * keyword_scores
        
        # 4. Sort and return
        ranked_indices = np.argsort(combined_scores)[::-1]
        return [(idx, combined_scores[idx]) for idx in ranked_indices]
    
    def negation_aware_search(
        self, 
        query: str, 
        documents: List[str]
    ) -> List[Tuple[int, float]]:
        """
        Handle negations in search queries.
        """
        # Check for negations in query
        query_has_negation = self._contains_negation(query)
        
        # Get base semantic scores
        query_embedding = self.semantic_model.encode([query])
        doc_embeddings = self.semantic_model.encode(documents)
        semantic_scores = np.dot(doc_embeddings, query_embedding.T).flatten()
        
        # Adjust scores based on negation alignment
        adjusted_scores = []
        
        for idx, (doc, score) in enumerate(zip(documents, semantic_scores)):
            doc_has_negation = self._contains_negation(doc)
            
            if query_has_negation:
                # Query contains negation
                if doc_has_negation:
                    # Both have negation - might be aligned
                    adjusted_score = score
                else:
                    # Query has negation, doc doesn't - penalize high similarity
                    if score > 0.7:
                        adjusted_score = score * 0.5  # Reduce score
                    else:
                        adjusted_score = score
            else:
                # Query doesn't contain negation
                if doc_has_negation and score > 0.7:
                    # Doc has negation, query doesn't - penalize
                    adjusted_score = score * 0.6
                else:
                    adjusted_score = score
            
            adjusted_scores.append((idx, adjusted_score))
        
        # Sort by adjusted scores
        adjusted_scores.sort(key=lambda x: x[1], reverse=True)
        return adjusted_scores
    
    def length_normalized_search(
        self, 
        query: str, 
        documents: List[str],
        optimal_length: int = 100
    ) -> List[Tuple[int, float]]:
        """
        Normaliseer scores voor document lengte.
        """
        query_embedding = self.semantic_model.encode([query])
        doc_embeddings = self.semantic_model.encode(documents)
        base_scores = np.dot(doc_embeddings, query_embedding.T).flatten()
        
        normalized_results = []
        
        for idx, (doc, score) in enumerate(zip(documents, base_scores)):
            doc_length = len(doc.split())
            
            # Length penalty - documents too short or too long are penalized
            if doc_length < 10:
                # Very short documents
                length_penalty = 0.5
            elif doc_length < optimal_length:
                # Shorter than optimal
                length_penalty = 0.8 + (0.2 * (doc_length / optimal_length))
            elif doc_length < optimal_length * 3:
                # Near optimal or slightly longer
                length_penalty = 1.0
            else:
                # Very long documents
                length_penalty = 1.0 / (1 + np.log(doc_length / optimal_length))
            
            adjusted_score = score * length_penalty
            normalized_results.append((idx, adjusted_score))
        
        normalized_results.sort(key=lambda x: x[1], reverse=True)
        return normalized_results
    
    def domain_specific_boost(
        self,
        query: str,
        documents: List[str],
        domain_terms: Dict[str, List[str]]
    ) -> List[Tuple[int, float]]:
        """
        Boost documents met domain-specific termen.
        
        Args:
            domain_terms: Dict van domain -> [termen]
        """
        # Base semantic search
        results = self.hybrid_search(query, documents)
        
        # Identify domain from query
        query_lower = query.lower()
        detected_domains = []
        
        for domain, terms in domain_terms.items():
            if any(term.lower() in query_lower for term in terms):
                detected_domains.append(domain)
        
        if not detected_domains:
            return results
        
        # Boost documents containing domain terms
        boosted_results = []
        
        for idx, score in results:
            doc_lower = documents[idx].lower()
            boost_factor = 1.0
            
            for domain in detected_domains:
                domain_term_count = sum(
                    1 for term in domain_terms[domain] 
                    if term.lower() in doc_lower
                )
                
                if domain_term_count > 0:
                    # Apply boost based on number of domain terms
                    boost_factor *= (1 + 0.1 * min(domain_term_count, 5))
            
            boosted_results.append((idx, score * boost_factor))
        
        boosted_results.sort(key=lambda x: x[1], reverse=True)
        return boosted_results
    
    def _tokenize(self, text: str) -> List[str]:
        """Simple tokenization."""
        return re.findall(r'\\b\\w+\\b', text.lower())
    
    def _contains_negation(self, text: str) -> bool:
        """Check if text contains negation words."""
        tokens = set(self._tokenize(text))
        return bool(tokens.intersection(self.negation_words))

# Test de implementatie
searcher = RobustEmbeddingSearch()

# Test 1: Exact match problem
print("=== Test 1: Exact Match Problem ===")
documents = [
    "GPT-4 is the latest language model from OpenAI",
    "The newest AI model shows impressive capabilities",
    "gpt-4 has 1.76 trillion parameters"
]
query = "GPT-4"

results = searcher.hybrid_search(query, documents, alpha=0.5)
for idx, score in results[:2]:
    print(f"Score: {score:.3f} - {documents[idx]}")

# Test 2: Negation handling
print("\\n=== Test 2: Negation Handling ===")
documents = [
    "This product is amazing and works perfectly",
    "This product is not amazing and has issues",
    "Great product without any problems"
]
query = "product not working"

results = searcher.negation_aware_search(query, documents)
for idx, score in results:
    print(f"Score: {score:.3f} - {documents[idx]}")

# Test 3: Length normalization
print("\\n=== Test 3: Length Normalization ===")
documents = [
    "Python",
    "Python is a programming language",
    "Python is a high-level, interpreted programming language known for its simplicity and readability, making it ideal for beginners and experts alike in various domains including web development, data science, machine learning, and automation"
]
query = "Python programming"

results = searcher.length_normalized_search(query, documents)
for idx, score in results:
    print(f"Score: {score:.3f} - {documents[idx][:50]}...")

# Test 4: Domain-specific boosting
print("\\n=== Test 4: Domain-Specific Boosting ===")
domain_terms = {
    "medical": ["patient", "diagnosis", "treatment", "symptoms", "medication"],
    "legal": ["contract", "liability", "jurisdiction", "plaintiff", "defendant"]
}

documents = [
    "The patient showed symptoms requiring immediate treatment",
    "The contract clearly states the liability terms",
    "General document about various topics"
]
query = "patient treatment plan"

results = searcher.domain_specific_boost(query, documents, domain_terms)
for idx, score in results:
    print(f"Score: {score:.3f} - {documents[idx]}")`
    }
  ],
  resources: [
    {
      title: 'OpenAI Embeddings Guide',
      url: 'https://platform.openai.com/docs/guides/embeddings',
      type: 'documentation'
    },
    {
      title: 'Understanding Vector Databases',
      url: 'https://www.pinecone.io/learn/vector-database/',
      type: 'article'
    },
    {
      title: 'Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks',
      url: 'https://arxiv.org/abs/1908.10084',
      type: 'article'
    },
    {
      title: 'Faiss: A Library for Efficient Similarity Search',
      url: 'https://github.com/facebookresearch/faiss',
      type: 'documentation'
    },
    {
      title: 'MTEB Leaderboard - Massive Text Embedding Benchmark',
      url: 'https://huggingface.co/spaces/mteb/leaderboard',
      type: 'tool'
    },
    {
      title: 'Common Pitfalls with Embeddings and How to Avoid Them',
      url: 'https://www.pinecone.io/learn/series/nlp/common-pitfalls-with-embeddings/',
      type: 'article'
    },
    {
      title: 'The Illustrated Word2vec',
      url: 'https://jalammar.github.io/illustrated-word2vec/',
      type: 'article'
    },
    {
      title: 'Vector Database Comparison',
      url: 'https://github.com/erikbern/ann-benchmarks',
      type: 'tool'
    }
  ]
}
