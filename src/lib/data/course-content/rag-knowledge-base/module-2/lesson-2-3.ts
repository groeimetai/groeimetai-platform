import { Lesson } from '@/lib/data/courses'

export const lesson2_3: Lesson = {
  id: 'lesson-2-3',
  title: 'Implementeer ChromaDB: Van setup tot query',
  duration: '45 min',
  content: `# Implementeer ChromaDB: Van setup tot query

ChromaDB is een open-source vector database die specifiek ontworpen is voor AI-applicaties. In deze les leer je ChromaDB van A tot Z implementeren, van installatie tot productie-ready queries.

## Wat je gaat leren

- ChromaDB installeren en configureren
- Werken met local en client/server mode
- Collections aanmaken en beheren
- Documenten toevoegen met metadata
- Embeddings configureren
- Query operaties uitvoeren
- Performance optimaliseren
- Integreren met LangChain

## Waarom ChromaDB?

ChromaDB biedt unieke voordelen:
- **Eenvoudige setup**: Geen complexe configuratie nodig
- **Flexibele deployment**: Local of distributed
- **Rich metadata**: Krachtige filtering mogelijkheden
- **Embedding agnostic**: Werkt met elke embedding
- **Persistent storage**: Automatische data persistentie

## 1. Installatie en Setup

### Basic Installation

\`\`\`bash
# Python installatie
pip install chromadb

# Met extra features
pip install chromadb[all]  # Alle dependencies
pip install chromadb[client]  # Alleen client
\`\`\`

### TypeScript/JavaScript Installation

\`\`\`bash
# NPM
npm install chromadb chromadb-default-embed

# Yarn
yarn add chromadb chromadb-default-embed
\`\`\`

## 2. Local vs Client/Server Mode

### Local Mode (Development)

\`\`\`python
import chromadb

# In-memory database (geen persistentie)
client = chromadb.Client()

# Persistent local database
client = chromadb.PersistentClient(path="./chroma_db")
\`\`\`

### Client/Server Mode (Production)

\`\`\`python
# Server starten
# Terminal: chroma run --host localhost --port 8000

import chromadb

# Connect to server
client = chromadb.HttpClient(
    host="localhost",
    port=8000,
    ssl=False,
    headers={"Authorization": "Bearer YOUR_TOKEN"}
)
\`\`\`

### Docker Deployment

\`\`\`yaml
# docker-compose.yml
version: '3.9'

services:
  chromadb:
    image: chromadb/chroma:latest
    environment:
      - IS_PERSISTENT=TRUE
      - PERSIST_DIRECTORY=/chroma/data
      - ANONYMIZED_TELEMETRY=FALSE
      - ALLOW_RESET=FALSE
    volumes:
      - ./chroma_data:/chroma/data
    ports:
      - "8000:8000"
    restart: unless-stopped
\`\`\`

## 3. Collections Aanmaken en Beheren

### Collection Basics

\`\`\`python
# Create or get collection
collection = client.create_collection(
    name="documents",
    metadata={"hnsw:space": "cosine"}  # Distance metric
)

# Get existing collection
collection = client.get_collection(name="documents")

# List all collections
collections = client.list_collections()

# Delete collection
client.delete_collection(name="documents")
\`\`\`

### Collection Configuration

\`\`\`python
from chromadb.utils import embedding_functions

# Custom embedding function
sentence_transformer_ef = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

# Create collection with custom embeddings
collection = client.create_collection(
    name="multilingual_docs",
    embedding_function=sentence_transformer_ef,
    metadata={
        "hnsw:space": "cosine",
        "hnsw:construction_ef": 100,
        "hnsw:M": 16
    }
)
\`\`\`

## 4. Documenten Toevoegen met Metadata

### Single Document

\`\`\`python
collection.add(
    documents=["Dit is een voorbeeld document over AI."],
    metadatas=[{
        "source": "manual",
        "category": "AI",
        "language": "nl",
        "date_created": "2024-01-15",
        "importance": 8
    }],
    ids=["doc1"]
)
\`\`\`

### Batch Insert

\`\`\`python
# Prepare batch data
documents = [
    "Machine learning is een subset van AI.",
    "Deep learning gebruikt neurale netwerken.",
    "NLP verwerkt natuurlijke taal.",
    "Computer vision analyseert beelden."
]

metadatas = [
    {"category": "ML", "difficulty": "intermediate"},
    {"category": "DL", "difficulty": "advanced"},
    {"category": "NLP", "difficulty": "intermediate"},
    {"category": "CV", "difficulty": "advanced"}
]

ids = [f"doc_{i}" for i in range(len(documents))]

# Batch insert
collection.add(
    documents=documents,
    metadatas=metadatas,
    ids=ids
)
\`\`\`

### Met Embeddings

\`\`\`python
# Als je pre-computed embeddings hebt
embeddings = [[0.1, 0.2, ...], [0.3, 0.4, ...]]  # Your embeddings

collection.add(
    embeddings=embeddings,
    documents=documents,
    metadatas=metadatas,
    ids=ids
)
\`\`\`

## 5. Query Operations

### Similarity Search

\`\`\`python
# Basic query
results = collection.query(
    query_texts=["Wat is deep learning?"],
    n_results=5
)

# Met metadata filtering
results = collection.query(
    query_texts=["neural networks"],
    n_results=3,
    where={"category": {"$eq": "DL"}},
    where_document={"$contains": "neural"}
)
\`\`\`

### Advanced Filtering

\`\`\`python
# Complex metadata filters
results = collection.query(
    query_texts=["AI applications"],
    n_results=10,
    where={
        "$and": [
            {"difficulty": {"$in": ["intermediate", "advanced"]}},
            {"importance": {"$gte": 7}},
            {"date_created": {"$gte": "2024-01-01"}}
        ]
    }
)

# Document content filtering
results = collection.query(
    query_texts=["machine learning"],
    n_results=5,
    where_document={
        "$or": [
            {"$contains": "supervised"},
            {"$contains": "unsupervised"}
        ]
    }
)
\`\`\`

### Include Options

\`\`\`python
# Specificeer wat je wilt terugkrijgen
results = collection.query(
    query_texts=["AI"],
    n_results=3,
    include=[
        "metadatas",
        "documents", 
        "distances",
        "embeddings"
    ]
)

# Process results
for i, doc in enumerate(results['documents'][0]):
    print(f"Document: {doc}")
    print(f"Distance: {results['distances'][0][i]}")
    print(f"Metadata: {results['metadatas'][0][i]}")
    print("---")
\`\`\`

## 6. Batch Operations voor Performance

### Efficient Batch Processing

\`\`\`python
import time
from typing import List, Dict, Any

class ChromaBatchProcessor:
    def __init__(self, collection, batch_size: int = 100):
        self.collection = collection
        self.batch_size = batch_size
        
    def add_documents_batch(
        self, 
        documents: List[str], 
        metadatas: List[Dict[str, Any]],
        ids: List[str]
    ):
        """Add documents in batches for better performance"""
        total = len(documents)
        
        for i in range(0, total, self.batch_size):
            batch_end = min(i + self.batch_size, total)
            
            batch_docs = documents[i:batch_end]
            batch_meta = metadatas[i:batch_end]
            batch_ids = ids[i:batch_end]
            
            self.collection.add(
                documents=batch_docs,
                metadatas=batch_meta,
                ids=batch_ids
            )
            
            print(f"Processed {batch_end}/{total} documents")
            time.sleep(0.1)  # Rate limiting
    
    def parallel_query(self, queries: List[str], n_results: int = 5):
        """Execute multiple queries efficiently"""
        # ChromaDB handles batch queries internally
        results = self.collection.query(
            query_texts=queries,
            n_results=n_results
        )
        return results

# Gebruik
processor = ChromaBatchProcessor(collection, batch_size=500)
processor.add_documents_batch(documents, metadatas, ids)
\`\`\`

## 7. Update en Delete Operations

### Update Documents

\`\`\`python
# Update existing documents
collection.update(
    ids=["doc1", "doc2"],
    documents=[
        "Updated: Machine learning is fascinating.",
        "Updated: Deep learning revolutionizes AI."
    ],
    metadatas=[
        {"category": "ML", "updated": True},
        {"category": "DL", "updated": True}
    ]
)

# Update alleen metadata
collection.update(
    ids=["doc3"],
    metadatas=[{"importance": 10, "reviewed": True}]
)
\`\`\`

### Delete Documents

\`\`\`python
# Delete by ID
collection.delete(ids=["doc1", "doc2"])

# Delete by metadata filter
collection.delete(
    where={"category": {"$eq": "obsolete"}}
)

# Delete by combined filters
collection.delete(
    where={"importance": {"$lt": 3}},
    where_document={"$contains": "deprecated"}
)
\`\`\`

## 8. Persistence en Backup

### Local Persistence

\`\`\`python
import shutil
import os
from datetime import datetime

class ChromaBackupManager:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.backup_dir = "chroma_backups"
        
    def create_backup(self) -> str:
        """Create timestamped backup"""
        os.makedirs(self.backup_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = os.path.join(
            self.backup_dir, 
            f"backup_{timestamp}"
        )
        
        shutil.copytree(self.db_path, backup_path)
        print(f"Backup created: {backup_path}")
        return backup_path
    
    def restore_backup(self, backup_path: str):
        """Restore from backup"""
        if os.path.exists(self.db_path):
            shutil.rmtree(self.db_path)
            
        shutil.copytree(backup_path, self.db_path)
        print(f"Restored from: {backup_path}")
    
    def export_collection(self, collection_name: str):
        """Export collection data"""
        client = chromadb.PersistentClient(path=self.db_path)
        collection = client.get_collection(collection_name)
        
        # Get all data
        data = collection.get(
            include=["metadatas", "documents", "embeddings"]
        )
        
        # Save to file
        import json
        with open(f"{collection_name}_export.json", "w") as f:
            json.dump(data, f, indent=2)
        
        return data

# Gebruik
backup_manager = ChromaBackupManager("./chroma_db")
backup_path = backup_manager.create_backup()
\`\`\`

## 9. LangChain Integratie

### Basic Integration

\`\`\`python
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import TextLoader

# Setup
embeddings = OpenAIEmbeddings()
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)

# Load and split documents
loader = TextLoader("document.txt")
documents = loader.load()
texts = text_splitter.split_documents(documents)

# Create Chroma vectorstore
vectorstore = Chroma.from_documents(
    documents=texts,
    embedding=embeddings,
    persist_directory="./chroma_langchain",
    collection_name="langchain_docs"
)

# Query
results = vectorstore.similarity_search(
    "Wat is machine learning?",
    k=3
)
\`\`\`

### Advanced RAG Pipeline

\`\`\`python
from langchain.chains import RetrievalQA
from langchain.llms import OpenAI

class ChromaRAGPipeline:
    def __init__(self, persist_directory: str):
        self.embeddings = OpenAIEmbeddings()
        self.llm = OpenAI(temperature=0)
        
        # Load existing vectorstore
        self.vectorstore = Chroma(
            persist_directory=persist_directory,
            embedding_function=self.embeddings
        )
        
        # Create retriever with filters
        self.retriever = self.vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={
                "k": 5,
                "filter": {"source": "trusted"}
            }
        )
        
        # Create QA chain
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=self.retriever,
            return_source_documents=True
        )
    
    def query(self, question: str):
        """Execute RAG query"""
        result = self.qa_chain({"query": question})
        
        return {
            "answer": result["result"],
            "sources": [
                {
                    "content": doc.page_content,
                    "metadata": doc.metadata
                }
                for doc in result["source_documents"]
            ]
        }
    
    def add_documents(self, texts: List[str], metadatas: List[dict]):
        """Add new documents to vectorstore"""
        self.vectorstore.add_texts(
            texts=texts,
            metadatas=metadatas
        )
        self.vectorstore.persist()

# Gebruik
rag_pipeline = ChromaRAGPipeline("./chroma_langchain")
result = rag_pipeline.query("Explain neural networks")
print(result["answer"])
\`\`\`

## 10. Production Deployment

### Environment Configuration

\`\`\`python
import os
from dataclasses import dataclass
from typing import Optional

@dataclass
class ChromaConfig:
    """Production configuration for ChromaDB"""
    host: str = os.getenv("CHROMA_HOST", "localhost")
    port: int = int(os.getenv("CHROMA_PORT", 8000))
    ssl: bool = os.getenv("CHROMA_SSL", "false").lower() == "true"
    api_key: Optional[str] = os.getenv("CHROMA_API_KEY")
    persist_directory: str = os.getenv("CHROMA_PERSIST_DIR", "./chroma_data")
    
    # Performance settings
    batch_size: int = int(os.getenv("CHROMA_BATCH_SIZE", 100))
    max_connections: int = int(os.getenv("CHROMA_MAX_CONN", 10))
    
    # Collection settings
    default_ef: int = int(os.getenv("CHROMA_EF", 100))
    default_m: int = int(os.getenv("CHROMA_M", 16))
    
    def get_client(self):
        """Get configured ChromaDB client"""
        if self.host == "localhost" and not self.api_key:
            return chromadb.PersistentClient(path=self.persist_directory)
        
        headers = {}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
            
        return chromadb.HttpClient(
            host=self.host,
            port=self.port,
            ssl=self.ssl,
            headers=headers
        )

# Production setup
config = ChromaConfig()
client = config.get_client()
\`\`\`

### Health Monitoring

\`\`\`python
import time
import logging
from typing import Dict, Any

class ChromaHealthMonitor:
    def __init__(self, client, check_interval: int = 60):
        self.client = client
        self.check_interval = check_interval
        self.logger = logging.getLogger(__name__)
        
    def check_health(self) -> Dict[str, Any]:
        """Comprehensive health check"""
        health_status = {
            "status": "healthy",
            "timestamp": time.time(),
            "checks": {}
        }
        
        try:
            # Check connection
            collections = self.client.list_collections()
            health_status["checks"]["connection"] = "ok"
            health_status["checks"]["collections_count"] = len(collections)
            
            # Check collection operations
            test_collection = self.client.get_or_create_collection("health_check")
            test_collection.add(
                documents=["health check"],
                ids=["health_check_doc"]
            )
            
            # Query test
            results = test_collection.query(
                query_texts=["health"],
                n_results=1
            )
            
            if results["ids"][0]:
                health_status["checks"]["query"] = "ok"
            
            # Cleanup
            test_collection.delete(ids=["health_check_doc"])
            
        except Exception as e:
            health_status["status"] = "unhealthy"
            health_status["error"] = str(e)
            self.logger.error(f"Health check failed: {e}")
            
        return health_status
    
    def continuous_monitor(self):
        """Run continuous monitoring"""
        while True:
            health = self.check_health()
            
            if health["status"] == "unhealthy":
                self.logger.warning(f"ChromaDB unhealthy: {health}")
                # Trigger alerts here
                
            time.sleep(self.check_interval)
\`\`\`

## 11. Performance Optimalisatie

### Index Optimization

\`\`\`python
class ChromaOptimizer:
    def __init__(self, client):
        self.client = client
        
    def optimize_collection(self, collection_name: str, expected_size: int):
        """Optimize collection based on expected size"""
        # HNSW parameters based on dataset size
        if expected_size < 10000:
            # Small dataset
            ef_construction = 100
            M = 16
        elif expected_size < 100000:
            # Medium dataset
            ef_construction = 200
            M = 32
        else:
            # Large dataset
            ef_construction = 400
            M = 48
            
        # Create optimized collection
        collection = self.client.create_collection(
            name=collection_name,
            metadata={
                "hnsw:space": "cosine",
                "hnsw:construction_ef": ef_construction,
                "hnsw:M": M,
                "hnsw:search_ef": ef_construction,
                "hnsw:num_threads": 4
            }
        )
        
        return collection
    
    def benchmark_queries(self, collection, test_queries: List[str]):
        """Benchmark query performance"""
        import time
        
        times = []
        for query in test_queries:
            start = time.time()
            collection.query(query_texts=[query], n_results=10)
            times.append(time.time() - start)
            
        avg_time = sum(times) / len(times)
        print(f"Average query time: {avg_time:.3f}s")
        print(f"Min time: {min(times):.3f}s")
        print(f"Max time: {max(times):.3f}s")
        
        return times
\`\`\`

### Caching Strategy

\`\`\`python
from functools import lru_cache
import hashlib

class ChromaQueryCache:
    def __init__(self, collection, cache_size: int = 1000):
        self.collection = collection
        self.cache_size = cache_size
        
    @lru_cache(maxsize=1000)
    def _cached_query(self, query_hash: str, n_results: int):
        """Internal cached query method"""
        # This won't work directly, just for illustration
        # In practice, you'd need to store the actual query
        pass
    
    def query_with_cache(
        self, 
        query_text: str, 
        n_results: int = 5,
        where: Dict = None
    ):
        """Query with caching"""
        # Create cache key
        cache_key = hashlib.md5(
            f"{query_text}_{n_results}_{str(where)}".encode()
        ).hexdigest()
        
        # Check if we have cached results
        # In production, use Redis or similar
        
        # Execute query
        results = self.collection.query(
            query_texts=[query_text],
            n_results=n_results,
            where=where
        )
        
        return results
\`\`\`

## 12. Common Pitfalls en Solutions

### Pitfall 1: Embedding Mismatch

\`\`\`python
# PROBLEEM: Different embeddings voor index en query
# collection gebruikt all-MiniLM-L6-v2
# query gebruikt text-embedding-ada-002

# OPLOSSING: Consistency checker
class EmbeddingConsistencyChecker:
    def __init__(self, collection):
        self.collection = collection
        
    def verify_embedding_dimension(self, test_text: str):
        """Verify embedding dimensions match"""
        try:
            # Add test document
            self.collection.add(
                documents=[test_text],
                ids=["dim_test"]
            )
            
            # Query to check
            results = self.collection.query(
                query_texts=[test_text],
                n_results=1
            )
            
            # Cleanup
            self.collection.delete(ids=["dim_test"])
            
            return True
            
        except Exception as e:
            print(f"Embedding mismatch: {e}")
            return False
\`\`\`

### Pitfall 2: Memory Leaks

\`\`\`python
# PROBLEEM: Large result sets causing memory issues

# OPLOSSING: Streaming results
def stream_large_results(collection, query: str, batch_size: int = 100):
    """Stream results in batches"""
    offset = 0
    
    while True:
        # Get batch
        results = collection.query(
            query_texts=[query],
            n_results=batch_size,
            offset=offset  # Note: ChromaDB doesn't support offset directly
        )
        
        if not results["ids"][0]:
            break
            
        # Process batch
        yield results
        
        offset += batch_size
\`\`\`

### Pitfall 3: Duplicate Documents

\`\`\`python
# PROBLEEM: Duplicate content with different IDs

# OPLOSSING: Content-based deduplication
import hashlib

class ChromaDeduplicator:
    def __init__(self, collection):
        self.collection = collection
        self.content_hashes = set()
        
    def add_with_dedup(self, documents: List[str], metadatas: List[dict]):
        """Add documents with deduplication"""
        unique_docs = []
        unique_meta = []
        unique_ids = []
        
        for i, doc in enumerate(documents):
            # Create content hash
            doc_hash = hashlib.md5(doc.encode()).hexdigest()
            
            if doc_hash not in self.content_hashes:
                self.content_hashes.add(doc_hash)
                unique_docs.append(doc)
                unique_meta.append(metadatas[i])
                unique_ids.append(f"doc_{doc_hash[:8]}")
                
        if unique_docs:
            self.collection.add(
                documents=unique_docs,
                metadatas=unique_meta,
                ids=unique_ids
            )
            
        return len(unique_docs)
\`\`\`

## Complete Working Example

\`\`\`python
"""
Complete ChromaDB RAG implementation
"""
import chromadb
from typing import List, Dict, Any
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ChromaRAGSystem:
    def __init__(self, persist_path: str = "./chroma_rag"):
        """Initialize complete RAG system with ChromaDB"""
        self.client = chromadb.PersistentClient(path=persist_path)
        self.setup_collections()
        
    def setup_collections(self):
        """Setup optimized collections"""
        # Documents collection
        self.docs_collection = self.client.get_or_create_collection(
            name="documents",
            metadata={
                "hnsw:space": "cosine",
                "hnsw:construction_ef": 200,
                "hnsw:M": 16
            }
        )
        
        # Q&A pairs collection
        self.qa_collection = self.client.get_or_create_collection(
            name="qa_pairs",
            metadata={"hnsw:space": "cosine"}
        )
        
        logger.info("Collections initialized")
    
    def ingest_documents(self, file_paths: List[str]):
        """Ingest documents into the system"""
        from langchain.document_loaders import TextLoader
        from langchain.text_splitter import RecursiveCharacterTextSplitter
        
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50
        )
        
        all_chunks = []
        all_metadatas = []
        all_ids = []
        
        for file_path in file_paths:
            loader = TextLoader(file_path)
            documents = loader.load()
            
            chunks = splitter.split_documents(documents)
            
            for i, chunk in enumerate(chunks):
                all_chunks.append(chunk.page_content)
                all_metadatas.append({
                    "source": file_path,
                    "chunk_index": i,
                    "timestamp": datetime.now().isoformat()
                })
                all_ids.append(f"{file_path}_{i}")
        
        # Batch add
        self.docs_collection.add(
            documents=all_chunks,
            metadatas=all_metadatas,
            ids=all_ids
        )
        
        logger.info(f"Ingested {len(all_chunks)} chunks from {len(file_paths)} files")
    
    def semantic_search(
        self, 
        query: str, 
        n_results: int = 5,
        filter_source: str = None
    ) -> List[Dict[str, Any]]:
        """Perform semantic search with optional filtering"""
        where_filter = None
        if filter_source:
            where_filter = {"source": {"$eq": filter_source}}
        
        results = self.docs_collection.query(
            query_texts=[query],
            n_results=n_results,
            where=where_filter,
            include=["metadatas", "documents", "distances"]
        )
        
        # Format results
        formatted_results = []
        for i in range(len(results["ids"][0])):
            formatted_results.append({
                "id": results["ids"][0][i],
                "content": results["documents"][0][i],
                "metadata": results["metadatas"][0][i],
                "similarity_score": 1 - results["distances"][0][i]
            })
        
        return formatted_results
    
    def add_qa_pair(self, question: str, answer: str, category: str = "general"):
        """Add Q&A pair for retrieval"""
        self.qa_collection.add(
            documents=[question],  # Index on question
            metadatas=[{
                "answer": answer,
                "category": category,
                "timestamp": datetime.now().isoformat()
            }],
            ids=[f"qa_{hash(question)}"]
        )
    
    def find_similar_questions(self, question: str, n_results: int = 3):
        """Find similar questions with answers"""
        results = self.qa_collection.query(
            query_texts=[question],
            n_results=n_results
        )
        
        qa_pairs = []
        for i in range(len(results["ids"][0])):
            qa_pairs.append({
                "question": results["documents"][0][i],
                "answer": results["metadatas"][0][i]["answer"],
                "category": results["metadatas"][0][i]["category"]
            })
        
        return qa_pairs
    
    def generate_answer(self, question: str) -> Dict[str, Any]:
        """Generate answer using RAG"""
        # Find relevant documents
        context_docs = self.semantic_search(question, n_results=3)
        
        # Find similar Q&As
        similar_qas = self.find_similar_questions(question, n_results=2)
        
        # Combine context
        context = "\\n\\n".join([doc["content"] for doc in context_docs])
        
        # Here you would use an LLM to generate the answer
        # For demo purposes, we'll create a structured response
        response = {
            "question": question,
            "context_used": context_docs,
            "similar_questions": similar_qas,
            "answer": f"Based on the context: {context[:200]}...",
            "sources": [doc["metadata"]["source"] for doc in context_docs]
        }
        
        return response
    
    def export_analytics(self) -> Dict[str, Any]:
        """Export system analytics"""
        docs_count = len(self.docs_collection.get()["ids"])
        qa_count = len(self.qa_collection.get()["ids"])
        
        return {
            "total_documents": docs_count,
            "total_qa_pairs": qa_count,
            "collections": self.client.list_collections(),
            "timestamp": datetime.now().isoformat()
        }

# Gebruik van het complete systeem
if __name__ == "__main__":
    # Initialize system
    rag_system = ChromaRAGSystem()
    
    # Ingest documents
    rag_system.ingest_documents([
        "data/doc1.txt",
        "data/doc2.txt"
    ])
    
    # Add Q&A pairs
    rag_system.add_qa_pair(
        "Wat is machine learning?",
        "Machine learning is een vorm van AI waarbij computers leren van data.",
        "AI"
    )
    
    # Search
    results = rag_system.semantic_search("neural networks")
    print("Search results:", results)
    
    # Generate answer
    answer = rag_system.generate_answer("Hoe werken neural networks?")
    print("Generated answer:", answer)
    
    # Analytics
    analytics = rag_system.export_analytics()
    print("System analytics:", analytics)
\`\`\`

## Best Practices Checklist

✅ **Setup & Configuration**
- Gebruik environment variables voor configuratie
- Implementeer health checks voor production
- Setup proper logging en monitoring

✅ **Data Management**
- Gebruik batch operations voor grote datasets
- Implementeer deduplicatie strategieën
- Plan backup en recovery procedures

✅ **Performance**
- Tune HNSW parameters voor je dataset size
- Implementeer caching waar mogelijk
- Monitor query latency

✅ **Security**
- Gebruik authentication in production
- Encrypt sensitive metadata
- Implement access control

✅ **Maintenance**
- Regular cleanup van oude data
- Monitor storage gebruik
- Plan voor scaling

ChromaDB biedt een krachtige en flexibele oplossing voor vector storage in RAG applicaties. Met de juiste configuratie en optimalisaties kun je schaalbare en performante AI-applicaties bouwen.`,
  codeExamples: [
    {
      id: 'example-1',
      title: 'Basic ChromaDB Setup',
      language: 'python',
      code: `import chromadb
from chromadb.utils import embedding_functions

# Local persistent client
client = chromadb.PersistentClient(path="./chroma_db")

# Create collection with custom embeddings
sentence_transformer_ef = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

collection = client.create_collection(
    name="my_documents",
    embedding_function=sentence_transformer_ef,
    metadata={"hnsw:space": "cosine"}
)

# Add documents
collection.add(
    documents=["This is a document about AI.", "Machine learning is powerful."],
    metadatas=[{"topic": "AI"}, {"topic": "ML"}],
    ids=["doc1", "doc2"]
)

# Query
results = collection.query(
    query_texts=["artificial intelligence"],
    n_results=2
)

print(results)`
    },
    {
      id: 'example-2',
      title: 'LangChain Integration',
      language: 'python',
      code: `from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.llms import OpenAI

# Setup
embeddings = OpenAIEmbeddings()
llm = OpenAI(temperature=0)

# Create vectorstore
vectorstore = Chroma(
    persist_directory="./chroma_langchain",
    embedding_function=embeddings,
    collection_name="docs"
)

# Create retriever
retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 4}
)

# Create QA chain
qa = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=retriever,
    return_source_documents=True
)

# Query
result = qa({"query": "What is machine learning?"})
print(result["result"])`
    },
    {
      id: 'example-3',
      title: 'Production Docker Setup',
      language: 'yaml',
      code: `# docker-compose.yml
version: '3.9'

services:
  chromadb:
    image: chromadb/chroma:latest
    container_name: chromadb_prod
    environment:
      - IS_PERSISTENT=TRUE
      - PERSIST_DIRECTORY=/chroma/data
      - ANONYMIZED_TELEMETRY=FALSE
      - ALLOW_RESET=FALSE
      - CHROMA_SERVER_AUTH_PROVIDER=chromadb.auth.token.TokenAuthServerProvider
      - CHROMA_SERVER_AUTH_CREDENTIALS_PROVIDER=chromadb.auth.token.TokenConfigServerCredentialsProvider
      - CHROMA_SERVER_AUTH_TOKEN_TRANSPORT_HEADER=AUTHORIZATION
      - CHROMA_SERVER_AUTH_TOKEN=your-secret-token
    volumes:
      - ./chroma_data:/chroma/data
      - ./chroma_logs:/chroma/logs
    ports:
      - "8000:8000"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/v1/heartbeat"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - chroma_network

  nginx:
    image: nginx:alpine
    container_name: chroma_nginx
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - chromadb
    networks:
      - chroma_network

networks:
  chroma_network:
    driver: bridge`
    }
  ],
  assignments: [
    {
      id: 'assignment-1',
      title: 'Build een Document Q&A System',
      type: 'project',
      difficulty: 'medium',
      description: `Bouw een complete document Q&A systeem met ChromaDB:

1. **Setup ChromaDB** (20%)
   - Configureer persistent storage
   - Implementeer proper error handling
   - Setup collection met optimale parameters

2. **Document Processing** (30%)
   - Implementeer document loader voor PDF/TXT
   - Chunk documents intelligent (met overlap)
   - Extract en store metadata

3. **Query Interface** (25%)
   - Semantic search functionaliteit
   - Metadata filtering opties
   - Result ranking en scoring

4. **Performance** (15%)
   - Batch processing voor uploads
   - Query caching mechanisme
   - Performance monitoring

5. **Testing** (10%)
   - Unit tests voor core functionaliteit
   - Integration tests met sample data
   - Performance benchmarks

**Deliverables:**
- Working Q&A system
- API endpoints voor upload/query
- Performance report
- Documentation`,
      hints: [
        'Gebruik RecursiveCharacterTextSplitter voor betere chunks',
        'Implementeer retry logic voor ChromaDB operations',
        'Cache frequent queries met Redis',
        'Monitor embedding generation tijd'
      ]
    },
    {
      id: 'assignment-2',
      title: 'ChromaDB Performance Benchmark',
      type: 'project',
      difficulty: 'expert',
      description: `Voer een uitgebreide performance benchmark uit:

1. **Test Setup**
   - Genereer synthetic dataset (10k, 100k, 1M docs)
   - Varieer document sizes en metadata complexity
   - Test verschillende embedding models

2. **Metrics to Measure**
   - Index tijd per batch size
   - Query latency vs result count
   - Memory usage patterns
   - Concurrent query performance

3. **Optimization Tests**
   - HNSW parameter tuning
   - Batch size optimization
   - Connection pooling effects

4. **Report**
   - Performance curves en graphs
   - Optimization recommendations
   - Scaling projections`,
      hints: [
        'Gebruik asyncio voor concurrent testing',
        'Profile memory met memory_profiler',
        'Test met realistic query distribution',
        'Compare local vs client/server performance'
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
      title: 'ChromaDB GitHub Repository',
      url: 'https://github.com/chroma-core/chroma',
      type: 'repository'
    },
    {
      title: 'Vector Database Comparison',
      url: 'https://github.com/erikbern/ann-benchmarks',
      type: 'benchmark'
    },
    {
      title: 'HNSW Algorithm Explained',
      url: 'https://arxiv.org/abs/1603.09320',
      type: 'paper'
    },
    {
      title: 'ChromaDB + LangChain Tutorial',
      url: 'https://python.langchain.com/docs/integrations/vectorstores/chroma',
      type: 'tutorial'
    }
  ]
}