import { Lesson } from '@/lib/data/courses'

export const lesson2_2: Lesson = {
  id: 'lesson-2-2',
  title: 'Embeddings kiezen: OpenAI, Cohere of open source?',
  duration: '35 min',
  content: `# Embeddings kiezen: OpenAI, Cohere of open source?

De keuze van het juiste embedding model is cruciaal voor de prestaties van je RAG-systeem. In deze les vergelijken we de belangrijkste opties en help ik je de beste keuze maken voor jouw specifieke use case.

## Het Embedding Model Landschap

Het aanbod van embedding modellen is de afgelopen jaren explosief gegroeid. We kunnen ze grofweg indelen in drie categorieën:

### 1. Commerciële API's
- **OpenAI**: Marktleider met sterke algemene prestaties
- **Cohere**: Uitstekende multilingual support
- **Voyage AI**: Gespecialiseerd in domain-specific embeddings
- **Google (Vertex AI)**: Gecko embeddings met goede prestaties

### 2. Open Source Modellen
- **Sentence-BERT**: Pionier in sentence embeddings
- **BGE (BAAI General Embedding)**: State-of-the-art open source
- **E5**: Microsoft's krachtige embedding familie
- **Instructor**: Task-specific embeddings

### 3. Gespecialiseerde Modellen
- **CodeBERT**: Voor code embeddings
- **SciBERT**: Voor wetenschappelijke teksten
- **BioBERT**: Voor biomedische teksten
- **Legal-BERT**: Voor juridische documenten

## OpenAI Embeddings in Detail

### text-embedding-ada-002 (Legacy)
- **Dimensies**: 1536
- **Max tokens**: 8191
- **Kosten**: $0.10 per miljoen tokens
- **Prestaties**: Nog steeds solide, maar achterhaald

### text-embedding-3-small
- **Dimensies**: 512-1536 (configureerbaar)
- **Max tokens**: 8191
- **Kosten**: $0.02 per miljoen tokens
- **Voordelen**:
  - 5x goedkoper dan ada-002
  - Flexibele dimensionaliteit
  - Betere prestaties op benchmarks

### text-embedding-3-large
- **Dimensies**: 256-3072 (configureerbaar)
- **Max tokens**: 8191
- **Kosten**: $0.13 per miljoen tokens
- **Voordelen**:
  - Beste prestaties in OpenAI portfolio
  - Uitstekend voor complexe taken
  - Dimensie reductie zonder veel kwaliteitsverlies

## Cohere Embeddings in Detail

### embed-v3.0
- **Dimensies**: 384-1024
- **Max tokens**: 512
- **Kosten**: $0.10 per miljoen tokens
- **Unieke features**:
  - Input type specificatie (search_document, search_query, classification, clustering)
  - Compressed embeddings optie
  - 100+ talen ondersteund

### embed-multilingual-v3.0
- **Dimensies**: 384-1024
- **Max tokens**: 512
- **Kosten**: $0.10 per miljoen tokens
- **Voordelen**:
  - Beste multilingual prestaties
  - Cross-lingual search
  - Consistent over talen heen

## Open Source Alternatieven

### BGE (BAAI General Embedding)
- **Familie**: bge-small, bge-base, bge-large
- **Dimensies**: 384, 768, 1024
- **Prestaties**: Top scores op MTEB benchmark
- **Voordelen**:
  - Gratis en self-hosted
  - Uitstekende kwaliteit
  - Instruction-tuned varianten beschikbaar

### E5 (Microsoft)
- **Familie**: e5-small, e5-base, e5-large
- **Dimensies**: 384, 768, 1024
- **Specialiteit**: Task-specific prompting
- **Voordeel**: "query:" en "passage:" prefixes voor betere retrieval

### Sentence-BERT Varianten
- **all-MiniLM-L6-v2**: Snel en compact (384 dim)
- **all-mpnet-base-v2**: Beste algemene prestaties (768 dim)
- **multi-qa-mpnet-base-dot-v1**: Geoptimaliseerd voor Q&A

## Kwaliteit Vergelijking: MTEB Scores

De Massive Text Embedding Benchmark (MTEB) is de standaard voor embedding evaluatie:

| Model | Avg Score | Retrieval | Clustering | Classification |
|-------|-----------|-----------|------------|----------------|
| OpenAI text-embedding-3-large | 64.6 | 55.4 | 49.0 | 75.4 |
| Cohere embed-v3 | 64.5 | 55.0 | 47.4 | 76.2 |
| BGE-large-en-v1.5 | 63.5 | 54.3 | 46.1 | 75.9 |
| E5-large-v2 | 62.2 | 50.6 | 44.5 | 76.3 |
| OpenAI ada-002 | 61.0 | 49.2 | 45.9 | 75.5 |

## Kosten Vergelijking

### Per Miljoen Tokens
- **OpenAI 3-small**: $0.02
- **OpenAI 3-large**: $0.13
- **Cohere v3**: $0.10
- **Open source**: $0 (+ hosting kosten)

### Praktisch Voorbeeld (1M documenten, gem. 500 tokens)
- **OpenAI 3-small**: $10
- **OpenAI 3-large**: $65
- **Cohere v3**: $50
- **Self-hosted BGE**: ~$20-50/maand (GPU server)

## Taal Ondersteuning

### Engels Only
- Meeste BERT varianten
- Gespecialiseerde modellen (SciBERT, etc.)

### Multilingual Champions
1. **Cohere embed-v3**: 100+ talen, uitstekende cross-lingual
2. **multilingual-e5**: 100+ talen, goede prestaties
3. **OpenAI**: Redelijk multilingual, maar niet geoptimaliseerd

### Nederlandse Taal Specifiek
- **RobBERT**: Nederlands BERT model
- **BERTje**: Kleiner Nederlands model
- Algemene multilingual modellen presteren vaak beter

## Domain-Specific Overwegingen

### Wanneer Gespecialiseerde Modellen?
- **Medisch**: BioBERT voor medische terminologie
- **Juridisch**: Legal-BERT voor wetteksten
- **Code**: CodeBERT of StarEncoder
- **Wetenschap**: SciBERT voor papers

### Trade-offs
- Betere domain prestaties
- Slechtere algemene prestaties
- Vaak oudere architecturen
- Beperkte taal support

## Fine-tuning Mogelijkheden

### Commerciële Opties
- **OpenAI**: Geen fine-tuning voor embeddings
- **Cohere**: Custom training beschikbaar (enterprise)
- **Voyage**: Biedt domain-specific fine-tuning

### Open Source Fine-tuning
- **Sentence Transformers**: Uitgebreide training toolkit
- **Contrastive learning**: Voor specifieke datasets
- **Domain adaptation**: Met weinig data mogelijk

## Praktische Selectie Criteria

### Kies OpenAI als:
- Je snel wilt starten
- Algemene kwaliteit belangrijk is
- Je geen infrastructuur wilt beheren
- Budget geen grote rol speelt

### Kies Cohere als:
- Multilingual cruciaal is
- Je input types wilt specificeren
- Cross-lingual search nodig is
- Je compressed embeddings wilt

### Kies Open Source als:
- Kosten kritisch zijn
- Je volledige controle wilt
- Privacy belangrijk is
- Je wilt fine-tunen

## Decision Framework

\`\`\`mermaid
graph TD
    A[Start] --> B{Multilingual Nodig?}
    B -->|Ja| C{Budget Beschikbaar?}
    B -->|Nee| D{Privacy Kritisch?}
    C -->|Ja| E[Cohere embed-v3]
    C -->|Nee| F[multilingual-e5]
    D -->|Ja| G[Self-hosted BGE/E5]
    D -->|Nee| H{Snelheid vs Kwaliteit}
    H -->|Snelheid| I[OpenAI 3-small]
    H -->|Kwaliteit| J[OpenAI 3-large]
\`\`\`

## Praktische Tips

### Embedding Dimensies
- Hoger is niet altijd beter
- 768 dimensies vaak sweet spot
- Dimensie reductie kan helpen bij:
  - Storage kosten
  - Search snelheid
  - Zonder veel kwaliteitsverlies

### Batch Processing
- OpenAI: Max 2048 embeddings per request
- Cohere: Max 96 texts per request
- Open source: Alleen geheugen limiet

### Caching Strategie
- Cache embeddings in productie
- Gebruik deterministische IDs
- Overweeg incrementele updates

## Toekomst van Embeddings

### Trends
- **Grotere context windows**: 32k+ tokens
- **Task-specific embeddings**: Automatische optimalisatie
- **Multimodal embeddings**: Text + image + code
- **Efficiëntere modellen**: Betere kwaliteit bij kleinere size

### Upcoming Modellen
- **Jina Embeddings v3**: 8k context window
- **Voyage-3**: Domain-specific families
- **OpenAI**: Mogelijk text-embedding-4 serie

## Conclusie

De "beste" embedding keuze hangt sterk af van je specifieke requirements:

- **Voor algemeen gebruik**: OpenAI text-embedding-3-small
- **Voor maximale kwaliteit**: OpenAI text-embedding-3-large
- **Voor multilingual**: Cohere embed-v3
- **Voor budget-conscious**: BGE of E5 self-hosted
- **Voor specifieke domeinen**: Overweeg specialized models

Begin met een algemeen model en evalueer op je eigen data. De extra complexiteit van specialized models is vaak niet de moeite waard tenzij je echt domain-specific challenges hebt.`,
  codeExamples: [
    {
      id: 'openai-embeddings',
      title: 'OpenAI Embeddings Implementatie',
      language: 'typescript',
      code: `import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Basis embedding generatie
async function generateEmbedding(text: string) {
  const response = await openai.embeddings.create({
    input: text,
    model: "text-embedding-3-small"
  })
  
  return response.data[0].embedding
}

// Met dimensie reductie
async function generateReducedEmbedding(text: string, dimensions: number) {
  const response = await openai.embeddings.create({
    input: text,
    model: "text-embedding-3-small",
    dimensions: dimensions // 512, 1024, of 1536
  })
  
  return response.data[0].embedding
}

// Batch processing
async function generateBatchEmbeddings(texts: string[]) {
  const batchSize = 2048 // OpenAI max
  const results = []
  
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize)
    const response = await openai.embeddings.create({
      input: batch,
      model: "text-embedding-3-large"
    })
    
    results.push(...response.data.map(d => d.embedding))
  }
  
  return results
}

// Cost calculator
function calculateEmbeddingCost(tokenCount: number, model: string) {
  const pricing = {
    'text-embedding-3-small': 0.02,
    'text-embedding-3-large': 0.13,
    'text-embedding-ada-002': 0.10
  }
  
  return (tokenCount / 1_000_000) * pricing[model]
}`
    },
    {
      id: 'cohere-embeddings',
      title: 'Cohere Embeddings met Input Types',
      language: 'typescript',
      code: `import { CohereClient } from 'cohere-ai'

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY
})

// Basis embedding met input type
async function generateCohereEmbedding(
  texts: string[],
  inputType: 'search_document' | 'search_query' | 'classification' | 'clustering'
) {
  const response = await cohere.embed({
    texts: texts,
    model: 'embed-v3',
    inputType: inputType
  })
  
  return response.embeddings
}

// Multilingual embeddings
async function generateMultilingualEmbeddings(texts: string[]) {
  const response = await cohere.embed({
    texts: texts,
    model: 'embed-multilingual-v3',
    inputType: 'search_document'
  })
  
  return response.embeddings
}

// Compressed embeddings voor storage efficiency
async function generateCompressedEmbeddings(texts: string[]) {
  const response = await cohere.embed({
    texts: texts,
    model: 'embed-v3',
    inputType: 'search_document',
    embeddingTypes: ['float', 'int8'] // Get both formats
  })
  
  return {
    float: response.embeddings.float,
    compressed: response.embeddings.int8
  }
}

// Cross-lingual search setup
class CrossLingualSearch {
  async indexDocuments(documents: Array<{ text: string; language: string }>) {
    const embeddings = await cohere.embed({
      texts: documents.map(d => d.text),
      model: 'embed-multilingual-v3',
      inputType: 'search_document'
    })
    
    return documents.map((doc, i) => ({
      ...doc,
      embedding: embeddings.embeddings[i]
    }))
  }
  
  async searchQuery(query: string, queryLanguage: string) {
    const queryEmbedding = await cohere.embed({
      texts: [query],
      model: 'embed-multilingual-v3',
      inputType: 'search_query'
    })
    
    return queryEmbedding.embeddings[0]
  }
}`
    },
    {
      id: 'opensource-embeddings',
      title: 'Open Source Embeddings met Sentence Transformers',
      language: 'python',
      code: `from sentence_transformers import SentenceTransformer
import torch
import numpy as np

# BGE embeddings (beste open source prestaties)
class BGEEmbeddings:
    def __init__(self, model_name='BAAI/bge-large-en-v1.5'):
        self.model = SentenceTransformer(model_name)
        
    def encode(self, texts, batch_size=32):
        # BGE models hebben speciale instructies nodig
        if isinstance(texts, str):
            texts = [texts]
            
        # Add instruction for better performance
        instructed_texts = [
            "Represent this sentence for searching relevant passages: " + text 
            for text in texts
        ]
        
        embeddings = self.model.encode(
            instructed_texts,
            batch_size=batch_size,
            show_progress_bar=True,
            convert_to_tensor=True
        )
        
        return embeddings

# E5 embeddings met task-specific prefixes
class E5Embeddings:
    def __init__(self, model_name='intfloat/e5-large-v2'):
        self.model = SentenceTransformer(model_name)
        
    def encode_documents(self, documents, batch_size=32):
        # E5 gebruikt "passage: " prefix voor documenten
        prefixed_docs = ["passage: " + doc for doc in documents]
        
        return self.model.encode(
            prefixed_docs,
            batch_size=batch_size,
            normalize_embeddings=True
        )
        
    def encode_queries(self, queries, batch_size=32):
        # E5 gebruikt "query: " prefix voor queries
        if isinstance(queries, str):
            queries = [queries]
            
        prefixed_queries = ["query: " + q for q in queries]
        
        return self.model.encode(
            prefixed_queries,
            batch_size=batch_size,
            normalize_embeddings=True
        )

# Multilingual embeddings
class MultilingualEmbeddings:
    def __init__(self):
        self.model = SentenceTransformer('intfloat/multilingual-e5-large')
        
    def encode(self, texts, is_query=False):
        # Prefix based on type
        prefix = "query: " if is_query else "passage: "
        
        if isinstance(texts, str):
            texts = [texts]
            
        prefixed_texts = [prefix + text for text in texts]
        
        return self.model.encode(
            prefixed_texts,
            normalize_embeddings=True
        )

# Performance optimized batch processing
class OptimizedEmbeddings:
    def __init__(self, model_name='BAAI/bge-base-en-v1.5'):
        self.model = SentenceTransformer(model_name)
        
        # Enable GPU if available
        if torch.cuda.is_available():
            self.model = self.model.to('cuda')
            
    def encode_large_dataset(self, texts, batch_size=64):
        """Efficient encoding voor grote datasets"""
        all_embeddings = []
        
        # Process in batches
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            
            # Encode batch
            embeddings = self.model.encode(
                batch,
                batch_size=batch_size,
                show_progress_bar=False,
                convert_to_tensor=True
            )
            
            # Move to CPU and convert to numpy for storage
            all_embeddings.append(embeddings.cpu().numpy())
            
        return np.vstack(all_embeddings)
    
    def encode_with_pooling(self, texts, pooling_strategy='mean'):
        """Custom pooling strategies"""
        encoded = self.model.encode(
            texts,
            output_value='token_embeddings',
            convert_to_tensor=True
        )
        
        if pooling_strategy == 'mean':
            return torch.mean(encoded, dim=1)
        elif pooling_strategy == 'max':
            return torch.max(encoded, dim=1).values
        elif pooling_strategy == 'cls':
            return encoded[:, 0, :]`
    },
    {
      id: 'embedding-comparison',
      title: 'Embedding Modellen Vergelijken',
      language: 'python',
      code: `import time
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd

class EmbeddingBenchmark:
    def __init__(self):
        self.results = []
        
    def benchmark_model(self, model_name, encode_func, texts):
        """Benchmark een embedding model"""
        print(f"Benchmarking {model_name}...")
        
        # Timing
        start_time = time.time()
        embeddings = encode_func(texts)
        encoding_time = time.time() - start_time
        
        # Memory usage
        embedding_size = embeddings.nbytes / 1024 / 1024  # MB
        
        # Quality test (semantic similarity)
        test_pairs = [
            ("The cat sat on the mat", "A feline rested on the rug"),
            ("I love machine learning", "AI and ML are my passion"),
            ("The weather is nice today", "It's a beautiful day outside")
        ]
        
        similarities = []
        for text1, text2 in test_pairs:
            emb1 = encode_func([text1])[0]
            emb2 = encode_func([text2])[0]
            sim = cosine_similarity([emb1], [emb2])[0][0]
            similarities.append(sim)
            
        avg_similarity = np.mean(similarities)
        
        # Store results
        self.results.append({
            'model': model_name,
            'encoding_time': encoding_time,
            'texts_per_second': len(texts) / encoding_time,
            'embedding_dim': embeddings.shape[1],
            'memory_mb': embedding_size,
            'avg_similarity': avg_similarity
        })
        
        return embeddings
    
    def compare_retrieval_quality(self, models_embeddings, queries, documents):
        """Vergelijk retrieval kwaliteit"""
        results = {}
        
        for model_name, (doc_embs, query_embs) in models_embeddings.items():
            # Calculate similarities
            similarities = cosine_similarity(query_embs, doc_embs)
            
            # Get top-k accuracy
            k = 5
            top_k_accuracy = 0
            
            for i, query_sim in enumerate(similarities):
                top_k_indices = np.argsort(query_sim)[-k:][::-1]
                
                # Check if correct document is in top-k
                if i in top_k_indices:
                    top_k_accuracy += 1
                    
            results[model_name] = {
                'top_k_accuracy': top_k_accuracy / len(queries),
                'avg_top_similarity': np.mean(np.max(similarities, axis=1))
            }
            
        return results
    
    def cost_analysis(self, token_count):
        """Analyseer kosten voor verschillende modellen"""
        costs = {
            'OpenAI ada-002': 0.10 * (token_count / 1_000_000),
            'OpenAI 3-small': 0.02 * (token_count / 1_000_000),
            'OpenAI 3-large': 0.13 * (token_count / 1_000_000),
            'Cohere v3': 0.10 * (token_count / 1_000_000),
            'Self-hosted GPU': 50 / 30,  # $50/month, 30 days
            'Self-hosted CPU': 20 / 30   # $20/month, 30 days
        }
        
        return pd.DataFrame([
            {'Model': model, 'Cost': cost, 'Cost per 1M tokens': cost / (token_count / 1_000_000)}
            for model, cost in costs.items()
        ])
    
    def generate_report(self):
        """Genereer vergelijkingsrapport"""
        df = pd.DataFrame(self.results)
        
        print("\\n=== Embedding Model Comparison ===\\n")
        print(df.to_string(index=False))
        
        print("\\n=== Performance Summary ===")
        print(f"Fastest: {df.loc[df['texts_per_second'].idxmax()]['model']}")
        print(f"Most memory efficient: {df.loc[df['memory_mb'].idxmin()]['model']}")
        print(f"Best quality: {df.loc[df['avg_similarity'].idxmax()]['model']}")
        
        return df

# Praktisch gebruik
if __name__ == "__main__":
    # Test data
    test_texts = [
        "Machine learning is transforming industries",
        "The weather forecast predicts rain tomorrow",
        "Python is a versatile programming language",
        # ... meer test teksten
    ] * 100  # 100 copies voor performance testing
    
    benchmark = EmbeddingBenchmark()
    
    # Benchmark verschillende modellen
    # (Implementatie afhankelijk van beschikbare modellen)
    
    # Genereer rapport
    benchmark.generate_report()`
    },
    {
      id: 'fine-tuning-embeddings',
      title: 'Embeddings Fine-tunen voor Specifieke Use Cases',
      language: 'python',
      code: `from sentence_transformers import SentenceTransformer, InputExample, losses
from torch.utils.data import DataLoader
import torch

class EmbeddingFineTuner:
    def __init__(self, base_model='BAAI/bge-base-en-v1.5'):
        self.model = SentenceTransformer(base_model)
        
    def prepare_training_data(self, data):
        """Prepare training data voor contrastive learning"""
        examples = []
        
        for item in data:
            # Positive pair: query en relevant document
            examples.append(InputExample(
                texts=[item['query'], item['positive']],
                label=1.0
            ))
            
            # Negative pair: query en niet-relevant document
            examples.append(InputExample(
                texts=[item['query'], item['negative']],
                label=0.0
            ))
            
        return examples
    
    def fine_tune_for_domain(self, training_data, num_epochs=5):
        """Fine-tune embeddings voor specifiek domein"""
        # Prepare data
        train_examples = self.prepare_training_data(training_data)
        train_dataloader = DataLoader(
            train_examples, 
            shuffle=True, 
            batch_size=32
        )
        
        # Use MultipleNegativesRankingLoss for retrieval tasks
        train_loss = losses.MultipleNegativesRankingLoss(self.model)
        
        # Fine-tune
        self.model.fit(
            train_objectives=[(train_dataloader, train_loss)],
            epochs=num_epochs,
            warmup_steps=100,
            output_path='./fine-tuned-model',
            show_progress_bar=True
        )
        
    def fine_tune_with_triplets(self, triplet_data):
        """Fine-tune met triplet loss voor betere separation"""
        examples = []
        
        for anchor, positive, negative in triplet_data:
            examples.append(InputExample(
                texts=[anchor, positive, negative]
            ))
            
        train_dataloader = DataLoader(examples, shuffle=True, batch_size=16)
        train_loss = losses.TripletLoss(self.model)
        
        self.model.fit(
            train_objectives=[(train_dataloader, train_loss)],
            epochs=5,
            output_path='./triplet-fine-tuned-model'
        )

# Domain-specific fine-tuning example
class MedicalEmbeddingAdapter:
    def __init__(self):
        # Start met BioBERT of algemeen model
        self.base_model = SentenceTransformer('dmis-lab/biobert-v1.1')
        
    def adapt_for_clinical_notes(self, clinical_data):
        """Adapt embeddings voor klinische notities"""
        
        # Prepare medical terminology pairs
        medical_pairs = self._extract_medical_pairs(clinical_data)
        
        # Create training examples
        examples = []
        for term, definition in medical_pairs:
            examples.append(InputExample(
                texts=[term, definition],
                label=1.0
            ))
            
        # Add negative examples
        for i, (term, _) in enumerate(medical_pairs):
            # Random negative from different medical concept
            neg_idx = (i + len(medical_pairs) // 2) % len(medical_pairs)
            neg_definition = medical_pairs[neg_idx][1]
            
            examples.append(InputExample(
                texts=[term, neg_definition],
                label=0.0
            ))
            
        # Fine-tune
        train_dataloader = DataLoader(examples, shuffle=True, batch_size=16)
        train_loss = losses.CosineSimilarityLoss(self.base_model)
        
        self.base_model.fit(
            train_objectives=[(train_dataloader, train_loss)],
            epochs=3,
            output_path='./medical-adapted-model'
        )
        
    def _extract_medical_pairs(self, clinical_data):
        """Extract medical term-definition pairs"""
        # Implementatie afhankelijk van data format
        pass

# Incremental learning voor nieuwe data
class IncrementalEmbeddingLearner:
    def __init__(self, model_path):
        self.model = SentenceTransformer(model_path)
        self.memory_bank = []
        
    def add_new_knowledge(self, new_examples, max_memory=1000):
        """Voeg nieuwe kennis toe zonder catastrophic forgetting"""
        
        # Add to memory bank
        self.memory_bank.extend(new_examples)
        
        # Keep only recent examples
        if len(self.memory_bank) > max_memory:
            self.memory_bank = self.memory_bank[-max_memory:]
            
        # Combine new examples with memory
        all_examples = new_examples + self.memory_bank[:100]  # Sample from memory
        
        # Quick fine-tune
        train_dataloader = DataLoader(all_examples, shuffle=True, batch_size=16)
        train_loss = losses.ContrastiveLoss(self.model)
        
        self.model.fit(
            train_objectives=[(train_dataloader, train_loss)],
            epochs=1,  # Alleen 1 epoch voor incremental
            learning_rate=1e-5,  # Lagere learning rate
            show_progress_bar=False
        )`
    }
  ],
  assignments: [
    {
      id: 'assignment-1',
      title: 'Embedding Model Selectie voor E-commerce Platform',
      type: 'project',
      difficulty: 'medium',
      description: `Je werkt aan een e-commerce platform dat producten in 5 talen aanbiedt (Nederlands, Engels, Duits, Frans, Spaans). 

Ontwikkel een embedding strategie die:
1. Cross-lingual product search ondersteunt
2. Binnen budget van €500/maand blijft
3. <100ms latency voor search queries heeft
4. Product recommendations kan genereren

Implementeer een proof-of-concept met minimaal 2 verschillende embedding modellen en vergelijk de prestaties.`,
      hints: [
        'Overweeg Cohere voor de multilingual requirements',
        'Test zowel een commerciële API als een open source alternatief',
        'Denk aan caching strategieën voor veelvoorkomende queries',
        'Gebruik dimensie reductie om storage en latency te optimaliseren'
      ]
    },
    {
      id: 'assignment-2',
      title: 'Domain-Specific Embeddings voor Juridische Documenten',
      type: 'project',
      difficulty: 'hard',
      description: `Een advocatenkantoor wil hun juridische documenten doorzoekbaar maken met RAG.

Uitdagingen:
- Juridische termen hebben specifieke betekenissen
- Documenten bevatten veel verwijzingen naar wetsartikelen
- Privacy is cruciaal (geen cloud APIs)
- Nederlands en Engels moeten beide ondersteund worden

Ontwikkel een complete embedding pipeline inclusief fine-tuning strategie.`,
      hints: [
        'Begin met een algemeen multilingual model als basis',
        'Creëer een juridisch glossarium voor fine-tuning',
        'Test retrieval kwaliteit op echte juridische queries',
        'Overweeg een hybrid approach met keyword matching'
      ]
    }
  ],
  resources: [
    {
      title: 'MTEB Leaderboard - Embedding Rankings',
      url: 'https://huggingface.co/spaces/mteb/leaderboard',
      type: 'tool'
    },
    {
      title: 'OpenAI Embeddings Guide',
      url: 'https://platform.openai.com/docs/guides/embeddings',
      type: 'documentation'
    },
    {
      title: 'Cohere Embed v3 Documentation',
      url: 'https://docs.cohere.com/docs/embed-api',
      type: 'documentation'
    },
    {
      title: 'Sentence Transformers Documentation',
      url: 'https://www.sbert.net/',
      type: 'tutorial'
    },
    {
      title: 'BGE Embeddings Paper',
      url: 'https://arxiv.org/abs/2309.07597',
      type: 'paper'
    },
    {
      title: 'The Evolution of Text Embeddings',
      url: 'https://www.youtube.com/watch?v=embedding-evolution',
      type: 'video'
    }
  ]
}