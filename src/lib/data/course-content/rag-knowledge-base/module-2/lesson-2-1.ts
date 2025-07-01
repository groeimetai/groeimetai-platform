import { Lesson } from '@/lib/data/courses'

export const lesson2_1: Lesson = {
  id: 'lesson-2-1',
  title: 'Vector databases vergelijken: ChromaDB vs Pinecone vs Weaviate',
  duration: '40 min',
  content: `# Vector databases vergelijken: ChromaDB vs Pinecone vs Weaviate

## Wat zijn vector databases?

Vector databases zijn gespecialiseerde databases die ontworpen zijn voor het opslaan en doorzoeken van high-dimensional vectors (embeddings). In RAG-systemen spelen ze een cruciale rol door:

- **Efficiënte similarity search**: Vind snel de meest relevante documenten
- **Schaalbare opslag**: Miljoenen tot miljarden vectors beheren
- **Real-time updates**: Dynamisch toevoegen/verwijderen van content
- **Metadata filtering**: Combineer vector search met traditionele filters

## Vergelijkingstabel

| Feature | ChromaDB | Pinecone | Weaviate | Qdrant | Milvus | pgvector |
|---------|----------|----------|----------|---------|---------|----------|
| **Type** | Open-source | Managed Cloud | Hybrid | Open-source | Open-source | PostgreSQL Extension |
| **Deployment** | Local/Self-hosted | Cloud-only | Cloud/Self-hosted | Cloud/Self-hosted | Self-hosted | PostgreSQL |
| **Talen** | Python, JS | Python, JS, Go | Python, JS, Go, Java | Python, JS, Rust | Python, Java, Go | SQL + bindings |
| **Max Vectors** | 10M+ (local) | 100M+ | 1B+ | 100M+ | 1B+ | 10M+ |
| **Pricing** | Gratis | $70+/maand | Gratis/$280+/maand | Gratis/$25+/maand | Gratis | Gratis |
| **Best voor** | Prototyping, Small-Medium | Enterprise, Production | Hybrid search, GraphQL | High performance | Large scale | Existing PostgreSQL |

## Performance Benchmarks

### Query Performance (1M vectors, 768 dimensions)
\`\`\`
ChromaDB (local):
- QPS: 100-500
- P95 Latency: 20-50ms
- Recall@10: 0.95+

Pinecone (cloud):
- QPS: 1000-5000
- P95 Latency: 10-30ms
- Recall@10: 0.97+

Weaviate (optimized):
- QPS: 500-2000
- P95 Latency: 15-40ms
- Recall@10: 0.96+
\`\`\`

### Indexing Performance
\`\`\`
ChromaDB: ~1000 vectors/sec
Pinecone: ~5000 vectors/sec (batch)
Weaviate: ~2000 vectors/sec
Qdrant: ~3000 vectors/sec
\`\`\`

## ChromaDB: Local-First Development

### Voordelen
- **Zero setup**: Werkt direct out-of-the-box
- **Privacy**: Data blijft lokaal
- **Gratis**: Geen kosten voor development
- **Simple API**: Intuïtieve interface

### Nadelen
- **Schaalbaarheid**: Beperkt tot enkele miljoenen vectors
- **Performance**: Langzamer dan cloud oplossingen
- **Features**: Minder geavanceerde features

### Wanneer gebruiken?
- Prototyping en development
- Privacy-gevoelige applicaties
- Small tot medium datasets (<10M vectors)
- Edge deployments

## Pinecone: Enterprise Cloud Solution

### Voordelen
- **Managed service**: Geen infrastructuur zorgen
- **Hoge performance**: Geoptimaliseerd voor snelheid
- **Schaalbaarheid**: Tot miljarden vectors
- **Enterprise features**: Security, compliance, SLA

### Nadelen
- **Kosten**: Duur voor grote datasets
- **Vendor lock-in**: Moeilijk te migreren
- **Internet vereist**: Geen offline optie

### Wanneer gebruiken?
- Production workloads
- Enterprise applicaties
- Wanneer performance kritisch is
- Teams zonder DevOps expertise

## Weaviate: Hybrid Search Powerhouse

### Voordelen
- **Hybrid search**: Combineert vector + keyword search
- **GraphQL API**: Flexibele queries
- **Modules**: Extensible architectuur
- **Multi-tenancy**: Built-in isolation

### Nadelen
- **Complexiteit**: Steepere leercurve
- **Resource intensief**: Meer geheugen nodig
- **Setup**: Complexere configuratie

### Wanneer gebruiken?
- Hybrid search requirements
- Complex data relaties
- Multi-tenant applicaties
- GraphQL ecosysteem

## Andere Opties

### Qdrant
- **Rust-based**: Extreme performance
- **Filtering**: Geavanceerde metadata filters
- **Payload storage**: Rijke data opslag

### Milvus
- **Schaal**: Ontworpen voor miljarden vectors
- **GPU support**: Hardware acceleratie
- **Distributed**: Native clustering

### pgvector
- **PostgreSQL**: Gebruik bestaande database
- **SQL**: Familiar query taal
- **Transactions**: ACID compliance

## Kostenanalyse

### ChromaDB (Self-hosted)
\`\`\`
Development: €0
Production (1M vectors):
- Server: €50-100/maand
- Totaal: €50-100/maand
\`\`\`

### Pinecone
\`\`\`
Starter: €70/maand (100K vectors)
Standard: €280/maand (5M vectors)
Enterprise: Custom pricing

Voorbeeld 10M vectors:
- Pods: 2x p1.x2 = €560/maand
- Storage: Included
- Totaal: €560+/maand
\`\`\`

### Weaviate Cloud
\`\`\`
Sandbox: €0 (14 dagen)
Standard: €280/maand
Professional: €700+/maand

Self-hosted:
- Server: €100-200/maand
- Totaal: €100-200/maand
\`\`\`

## Beslissingsmatrix

| Scenario | Aanbeveling | Reden |
|----------|-------------|--------|
| **MVP/Prototype** | ChromaDB | Snelle setup, geen kosten |
| **Production SaaS** | Pinecone | Reliability, performance |
| **Hybrid Search** | Weaviate | Keyword + vector search |
| **High Performance** | Qdrant | Rust performance |
| **Bestaande PostgreSQL** | pgvector | Geen nieuwe infra |
| **Massive Scale (>1B)** | Milvus | Distributed architecture |

## Migratie Strategieën

### ChromaDB → Pinecone
1. Export embeddings en metadata
2. Batch upload naar Pinecone
3. Update connection config
4. Test en valideer

### Algemene Migratie Tips
- **Abstracter layer**: Gebruik interfaces
- **Batch processing**: Voorkom rate limits
- **Parallel migration**: Zero downtime
- **Validation**: Check vector similarity`,
  codeExamples: [
    {
      id: 'chromadb-setup',
      title: 'ChromaDB Setup en Usage',
      language: 'python',
      code: `# ChromaDB installatie en setup
# pip install chromadb

import chromadb
from chromadb.config import Settings

# Local persistent database
client = chromadb.PersistentClient(
    path="./chroma_db",
    settings=Settings(
        anonymized_telemetry=False,
        allow_reset=True
    )
)

# Maak of krijg collection
collection = client.get_or_create_collection(
    name="rag_documents",
    metadata={"hnsw:space": "cosine"}
)

# Voeg documenten toe
collection.add(
    documents=[
        "ChromaDB is een open-source vector database",
        "Het is perfect voor RAG applicaties",
        "Ondersteunt metadata filtering"
    ],
    metadatas=[
        {"source": "docs", "type": "intro"},
        {"source": "blog", "type": "tutorial"},
        {"source": "docs", "type": "feature"}
    ],
    ids=["doc1", "doc2", "doc3"]
)

# Query met filters
results = collection.query(
    query_texts=["Wat is ChromaDB?"],
    n_results=2,
    where={"source": "docs"}
)

# Advanced: Eigen embeddings
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('all-MiniLM-L6-v2')

embeddings = model.encode([
    "Custom embedding example",
    "Met eigen embedding model"
])

collection.add(
    embeddings=embeddings.tolist(),
    documents=["Custom doc 1", "Custom doc 2"],
    ids=["custom1", "custom2"]
)`
    },
    {
      id: 'pinecone-setup',
      title: 'Pinecone Cloud Setup',
      language: 'python',
      code: `# Pinecone installatie en setup
# pip install pinecone-client

import pinecone
from pinecone import Pinecone, ServerlessSpec
import numpy as np

# Initialiseer Pinecone
pc = Pinecone(api_key="YOUR_API_KEY")

# Maak index
if "rag-index" not in pc.list_indexes().names():
    pc.create_index(
        name="rag-index",
        dimension=768,  # Voor all-mpnet-base-v2
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",
            region="us-west-2"
        )
    )

# Connect to index
index = pc.Index("rag-index")

# Upsert vectors met metadata
vectors = [
    {
        "id": "vec1",
        "values": np.random.rand(768).tolist(),
        "metadata": {
            "text": "Pinecone is een managed vector database",
            "source": "documentation",
            "timestamp": "2024-01-15"
        }
    },
    {
        "id": "vec2",
        "values": np.random.rand(768).tolist(),
        "metadata": {
            "text": "Het biedt enterprise-grade performance",
            "source": "blog",
            "timestamp": "2024-01-16"
        }
    }
]

index.upsert(vectors=vectors, namespace="production")

# Query met metadata filter
query_vector = np.random.rand(768).tolist()
results = index.query(
    vector=query_vector,
    top_k=5,
    filter={
        "source": {"$eq": "documentation"},
        "timestamp": {"$gte": "2024-01-01"}
    },
    include_metadata=True,
    namespace="production"
)

# Hybrid search met sparse vectors (nieuw)
from pinecone_text.sparse import BM25Encoder

bm25 = BM25Encoder().default()
bm25.fit(["document corpus here"])

# Combineer dense en sparse vectors
sparse_vector = bm25.encode_documents(["query text"])[0]
index.query(
    vector=query_vector,
    sparse_vector=sparse_vector,
    top_k=10
)`
    },
    {
      id: 'weaviate-setup',
      title: 'Weaviate Hybrid Search',
      language: 'python',
      code: `# Weaviate installatie
# pip install weaviate-client

import weaviate
from weaviate.embedded import EmbeddedOptions
import json

# Embedded Weaviate (development)
client = weaviate.Client(
    embedded_options=EmbeddedOptions()
)

# Of connect naar Weaviate Cloud
client = weaviate.Client(
    url="https://your-cluster.weaviate.network",
    auth_client_secret=weaviate.AuthApiKey(api_key="YOUR_KEY"),
    additional_headers={
        "X-OpenAI-Api-Key": "YOUR_OPENAI_KEY"
    }
)

# Definieer schema
class_obj = {
    "class": "Document",
    "vectorizer": "text2vec-openai",
    "properties": [
        {
            "name": "content",
            "dataType": ["text"],
            "moduleConfig": {
                "text2vec-openai": {
                    "skip": False,
                    "vectorizePropertyName": False
                }
            }
        },
        {
            "name": "source",
            "dataType": ["string"]
        },
        {
            "name": "category",
            "dataType": ["string"]
        },
        {
            "name": "timestamp",
            "dataType": ["date"]
        }
    ],
    "moduleConfig": {
        "text2vec-openai": {
            "model": "ada",
            "type": "text"
        }
    }
}

# Maak schema
client.schema.create_class(class_obj)

# Batch import
with client.batch as batch:
    batch.batch_size = 100
    
    documents = [
        {
            "content": "Weaviate combineert vector en keyword search",
            "source": "documentation",
            "category": "features",
            "timestamp": "2024-01-15T10:00:00Z"
        },
        {
            "content": "GraphQL API voor flexibele queries",
            "source": "tutorial",
            "category": "api",
            "timestamp": "2024-01-16T10:00:00Z"
        }
    ]
    
    for doc in documents:
        batch.add_data_object(
            data_object=doc,
            class_name="Document"
        )

# Hybrid search query
result = client.query.get(
    "Document",
    ["content", "source", "category"]
).with_hybrid(
    query="vector search features",
    alpha=0.75  # 0 = keyword only, 1 = vector only
).with_where({
    "path": ["category"],
    "operator": "Equal",
    "valueString": "features"
}).with_limit(10).do()

# GraphQL query
graphql_query = """
{
  Get {
    Document(
      hybrid: {
        query: "search functionality"
        alpha: 0.5
      }
      where: {
        path: ["source"]
        operator: Equal
        valueString: "documentation"
      }
      limit: 5
    ) {
      content
      source
      _additional {
        score
        explainScore
      }
    }
  }
}
"""

result = client.query.raw(graphql_query)`
    },
    {
      id: 'migration-example',
      title: 'Vector Database Migratie',
      language: 'python',
      code: `# Abstractie layer voor vendor-agnostic code
from abc import ABC, abstractmethod
from typing import List, Dict, Any
import chromadb
from pinecone import Pinecone
import weaviate

class VectorStore(ABC):
    @abstractmethod
    def add_documents(self, documents: List[Dict[str, Any]]) -> None:
        pass
    
    @abstractmethod
    def search(self, query: str, k: int = 10, filters: Dict = None) -> List[Dict]:
        pass
    
    @abstractmethod
    def delete(self, ids: List[str]) -> None:
        pass

class ChromaDBStore(VectorStore):
    def __init__(self, collection_name: str):
        self.client = chromadb.PersistentClient()
        self.collection = self.client.get_or_create_collection(collection_name)
    
    def add_documents(self, documents: List[Dict[str, Any]]) -> None:
        self.collection.add(
            documents=[d["text"] for d in documents],
            metadatas=[d.get("metadata", {}) for d in documents],
            ids=[d["id"] for d in documents]
        )
    
    def search(self, query: str, k: int = 10, filters: Dict = None) -> List[Dict]:
        results = self.collection.query(
            query_texts=[query],
            n_results=k,
            where=filters
        )
        return results

class PineconeStore(VectorStore):
    def __init__(self, index_name: str, api_key: str):
        self.pc = Pinecone(api_key=api_key)
        self.index = self.pc.Index(index_name)
        # Assume embeddings are pre-computed
    
    def add_documents(self, documents: List[Dict[str, Any]]) -> None:
        vectors = []
        for doc in documents:
            vectors.append({
                "id": doc["id"],
                "values": doc["embedding"],
                "metadata": {
                    "text": doc["text"],
                    **doc.get("metadata", {})
                }
            })
        self.index.upsert(vectors=vectors)
    
    def search(self, query: str, k: int = 10, filters: Dict = None) -> List[Dict]:
        # Assume query_embedding is pre-computed
        query_embedding = self._compute_embedding(query)
        return self.index.query(
            vector=query_embedding,
            top_k=k,
            filter=filters,
            include_metadata=True
        )

# Migratie script
def migrate_chromadb_to_pinecone(
    chroma_collection: str,
    pinecone_index: str,
    pinecone_key: str,
    batch_size: int = 100
):
    # Bron en doel stores
    source = ChromaDBStore(chroma_collection)
    target = PineconeStore(pinecone_index, pinecone_key)
    
    # Export alle data uit ChromaDB
    all_data = source.collection.get()
    
    # Process in batches
    documents = []
    for i in range(0, len(all_data["ids"]), batch_size):
        batch_docs = []
        for j in range(i, min(i + batch_size, len(all_data["ids"]))):
            doc = {
                "id": all_data["ids"][j],
                "text": all_data["documents"][j] if all_data["documents"] else "",
                "embedding": all_data["embeddings"][j],
                "metadata": all_data["metadatas"][j] if all_data["metadatas"] else {}
            }
            batch_docs.append(doc)
        
        # Upload batch naar Pinecone
        target.add_documents(batch_docs)
        print(f"Migrated batch {i//batch_size + 1}")
    
    print(f"Migration complete: {len(all_data['ids'])} documents")

# Config-driven vector store selection
class VectorStoreFactory:
    @staticmethod
    def create(config: Dict[str, Any]) -> VectorStore:
        store_type = config["type"]
        
        if store_type == "chromadb":
            return ChromaDBStore(config["collection_name"])
        elif store_type == "pinecone":
            return PineconeStore(
                config["index_name"],
                config["api_key"]
            )
        elif store_type == "weaviate":
            return WeaviateStore(
                config["url"],
                config["api_key"],
                config["class_name"]
            )
        else:
            raise ValueError(f"Unknown store type: {store_type}")

# Gebruik in applicatie
config = {
    "type": "chromadb",  # Makkelijk te switchen
    "collection_name": "rag_documents"
}

vector_store = VectorStoreFactory.create(config)
vector_store.add_documents([
    {
        "id": "doc1",
        "text": "Vector database abstractie",
        "metadata": {"source": "tutorial"}
    }
])`
    },
    {
      id: 'performance-testing',
      title: 'Performance Testing Script',
      language: 'python',
      code: `# Vector Database Performance Testing
import time
import numpy as np
from typing import List, Tuple
import statistics
from concurrent.futures import ThreadPoolExecutor
from sentence_transformers import SentenceTransformer

class VectorDBBenchmark:
    def __init__(self, vector_store, embedding_model="all-MiniLM-L6-v2"):
        self.vector_store = vector_store
        self.model = SentenceTransformer(embedding_model)
        self.dimension = 384  # all-MiniLM-L6-v2 dimension
    
    def generate_test_data(self, n_documents: int) -> List[dict]:
        """Genereer test documenten met embeddings"""
        documents = []
        texts = [
            f"Dit is test document nummer {i} voor benchmark testing"
            for i in range(n_documents)
        ]
        
        # Batch encode voor efficiency
        embeddings = self.model.encode(texts, batch_size=32)
        
        for i, (text, embedding) in enumerate(zip(texts, embeddings)):
            documents.append({
                "id": f"doc_{i}",
                "text": text,
                "embedding": embedding.tolist(),
                "metadata": {
                    "category": f"cat_{i % 10}",
                    "timestamp": f"2024-01-{(i % 28) + 1:02d}"
                }
            })
        
        return documents
    
    def benchmark_insert(self, documents: List[dict], batch_size: int = 100) -> dict:
        """Test insert performance"""
        start_time = time.time()
        
        for i in range(0, len(documents), batch_size):
            batch = documents[i:i+batch_size]
            self.vector_store.add_documents(batch)
        
        total_time = time.time() - start_time
        docs_per_second = len(documents) / total_time
        
        return {
            "total_documents": len(documents),
            "total_time": total_time,
            "docs_per_second": docs_per_second,
            "avg_latency_ms": (total_time / len(documents)) * 1000
        }
    
    def benchmark_query(self, queries: List[str], k: int = 10, 
                       concurrent: bool = False) -> dict:
        """Test query performance"""
        query_embeddings = self.model.encode(queries)
        latencies = []
        
        def single_query(query_embedding):
            start = time.time()
            results = self.vector_store.search(
                query_embedding=query_embedding.tolist(),
                k=k
            )
            return time.time() - start
        
        if concurrent:
            with ThreadPoolExecutor(max_workers=10) as executor:
                latencies = list(executor.map(single_query, query_embeddings))
        else:
            for embedding in query_embeddings:
                latencies.append(single_query(embedding))
        
        return {
            "total_queries": len(queries),
            "avg_latency_ms": statistics.mean(latencies) * 1000,
            "p50_latency_ms": statistics.median(latencies) * 1000,
            "p95_latency_ms": np.percentile(latencies, 95) * 1000,
            "p99_latency_ms": np.percentile(latencies, 99) * 1000,
            "qps": len(queries) / sum(latencies) if concurrent else 1 / statistics.mean(latencies)
        }
    
    def benchmark_filtered_query(self, queries: List[str], filters: dict, k: int = 10) -> dict:
        """Test query performance met filters"""
        query_embeddings = self.model.encode(queries)
        latencies = []
        
        for embedding in query_embeddings:
            start = time.time()
            results = self.vector_store.search(
                query_embedding=embedding.tolist(),
                k=k,
                filters=filters
            )
            latencies.append(time.time() - start)
        
        return {
            "filter": filters,
            "avg_latency_ms": statistics.mean(latencies) * 1000,
            "p95_latency_ms": np.percentile(latencies, 95) * 1000
        }
    
    def run_full_benchmark(self, n_documents: int = 10000, n_queries: int = 100):
        """Voer complete benchmark uit"""
        print(f"Benchmarking {self.vector_store.__class__.__name__}")
        print("="*50)
        
        # Generate test data
        print("Generating test data...")
        documents = self.generate_test_data(n_documents)
        test_queries = [
            f"Zoek informatie over test document {i}"
            for i in np.random.randint(0, n_documents, n_queries)
        ]
        
        # Insert benchmark
        print("Testing insert performance...")
        insert_results = self.benchmark_insert(documents)
        print(f"Insert: {insert_results['docs_per_second']:.1f} docs/sec")
        
        # Query benchmark
        print("Testing query performance...")
        query_results = self.benchmark_query(test_queries[:100])
        print(f"Query: {query_results['avg_latency_ms']:.1f}ms avg, {query_results['p95_latency_ms']:.1f}ms p95")
        
        # Concurrent query benchmark
        print("Testing concurrent queries...")
        concurrent_results = self.benchmark_query(test_queries, concurrent=True)
        print(f"Concurrent: {concurrent_results['qps']:.1f} QPS")
        
        # Filtered query benchmark
        print("Testing filtered queries...")
        filter_results = self.benchmark_filtered_query(
            test_queries[:20],
            {"category": "cat_5"},
            k=10
        )
        print(f"Filtered: {filter_results['avg_latency_ms']:.1f}ms avg")
        
        return {
            "insert": insert_results,
            "query": query_results,
            "concurrent": concurrent_results,
            "filtered": filter_results
        }

# Gebruik
if __name__ == "__main__":
    # Test ChromaDB
    chroma_store = ChromaDBStore("benchmark_test")
    chroma_benchmark = VectorDBBenchmark(chroma_store)
    chroma_results = chroma_benchmark.run_full_benchmark()
    
    # Test Pinecone
    pinecone_store = PineconeStore("benchmark-index", "YOUR_KEY")
    pinecone_benchmark = VectorDBBenchmark(pinecone_store)
    pinecone_results = pinecone_benchmark.run_full_benchmark()
    
    # Vergelijk resultaten
    print("\nPerformance Comparison:")
    print("="*50)
    print(f"Insert Speed: ChromaDB={chroma_results['insert']['docs_per_second']:.0f}, "
          f"Pinecone={pinecone_results['insert']['docs_per_second']:.0f} docs/sec")
    print(f"Query Latency: ChromaDB={chroma_results['query']['p95_latency_ms']:.1f}ms, "
          f"Pinecone={pinecone_results['query']['p95_latency_ms']:.1f}ms (p95)")
    print(f"QPS: ChromaDB={chroma_results['concurrent']['qps']:.0f}, "
          f"Pinecone={pinecone_results['concurrent']['qps']:.0f}")`
    }
  ],
  assignments: [
    {
      id: 'vector-db-selection',
      title: 'Vector Database Selectie Project',
      type: 'project',
      difficulty: 'medium',
      description: `Selecteer en implementeer de beste vector database voor een RAG applicatie met de volgende requirements:

**Scenario**: E-commerce product search
- 1 miljoen producten
- 50 queries per seconde
- Budget: €500/maand
- Hybrid search vereist (keyword + semantic)
- Real-time updates nodig

**Deliverables**:
1. Vergelijk minstens 3 vector databases
2. Implementeer een proof-of-concept
3. Voer performance tests uit
4. Maak een kosten-baten analyse
5. Schrijf een migratie plan`,
      hints: [
        'Overweeg Weaviate voor hybrid search capabilities',
        'Test met realistische data volumes',
        'Denk aan toekomstige schaalbaarheid',
        'Include operational overhead in je analyse'
      ]
    },
    {
      id: 'migration-implementation',
      title: 'Database Migratie Implementatie',
      type: 'project',
      difficulty: 'expert',
      description: `Implementeer een robuuste migratie tool voor vector databases:

**Requirements**:
1. Ondersteun ChromaDB → Pinecone migratie
2. Zero downtime migratie strategie
3. Data validatie en consistency checks
4. Progress tracking en resume capability
5. Rollback mechanisme

**Bonus**:
- Generieke migratie framework
- Performance optimalisaties
- Metadata transformaties`,
      hints: [
        'Gebruik batch processing voor efficiency',
        'Implementeer checksums voor validatie',
        'Denk aan rate limiting',
        'Test met verschillende data volumes'
      ]
    }
  ],
  resources: [
    {
      title: 'ChromaDB Official Documentation',
      url: 'https://docs.trychroma.com/',
      type: 'documentation'
    },
    {
      title: 'Pinecone Performance Tuning Guide',
      url: 'https://docs.pinecone.io/docs/performance-tuning',
      type: 'guide'
    },
    {
      title: 'Weaviate Hybrid Search Tutorial',
      url: 'https://weaviate.io/developers/weaviate/search/hybrid',
      type: 'tutorial'
    },
    {
      title: 'Vector Database Benchmarks',
      url: 'https://ann-benchmarks.com/',
      type: 'benchmark'
    },
    {
      title: 'Qdrant vs Others Comparison',
      url: 'https://qdrant.tech/benchmarks/',
      type: 'comparison'
    }
  ]
}