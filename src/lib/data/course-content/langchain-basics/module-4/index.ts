import { Module } from '@/lib/data/courses'
import { lesson41 } from './lesson-4-1'
import { lesson42 } from './lesson-4-2'
import { lesson43 } from './lesson-4-3'

export const module4: Module = {
  id: 'module-4',
  title: 'Production-Ready RAG Systems',
  description: 'Bouw enterprise-grade Retrieval Augmented Generation systemen met document processing, vector stores, retrieval optimization, en production deployment',
  lessons: [lesson41, lesson42, lesson43],
  moduleProject: {
    id: 'project-4',
    title: 'Enterprise RAG Platform',
    description: 'Bouw een complete production-ready RAG platform met advanced document processing, multi-database support, hybrid search, re-ranking, caching, monitoring, en A/B testing capabilities.',
    difficulty: 'hard',
    type: 'project',
    initialCode: `# Final Project: Enterprise RAG Platform

"""
Bouw een Production-Ready RAG Platform met:

1. **Document Processing Pipeline**:
   - Multi-format loaders (PDF, Web, CSV, JSON, Images)
   - Smart chunking strategies met overlap optimization
   - Metadata extraction en enrichment
   - Batch processing voor grote datasets

2. **Vector Store Infrastructure**:
   - Multi-database support (ChromaDB, Pinecone, Weaviate)
   - Hybrid search (keyword + semantic + metadata filtering)
   - Embedding optimization (OpenAI vs open-source)
   - Index management en optimization

3. **Advanced Retrieval**:
   - Query expansion techniques
   - Re-ranking met cross-encoders
   - Context compression
   - Caching strategies

4. **Production Features**:
   - RESTful API met streaming
   - Monitoring en analytics
   - A/B testing framework
   - Cost optimization
   - Security (rate limiting, auth)

Requirements:
- Schaalbaar tot 10K+ documenten
- < 2s response time (P95)
- 99.9% uptime
- Multi-tenant support
- GDPR compliant
"""

# Enterprise RAG Project Structure
import os
from pathlib import Path
from typing import Dict, List, Any

def create_enterprise_rag_structure():
    """Create production-grade project structure"""
    structure = {
        # Core RAG Components
        "src/document_processing": [
            "__init__.py",
            "loaders.py",          # Multi-format document loaders
            "chunkers.py",         # Smart chunking strategies
            "preprocessors.py",    # Text cleaning & normalization
            "metadata_extractors.py"  # Extract & enrich metadata
        ],
        
        # Vector Store Layer
        "src/vector_stores": [
            "__init__.py",
            "base.py",            # Abstract base class
            "chroma_store.py",    # ChromaDB implementation
            "pinecone_store.py",  # Pinecone implementation
            "weaviate_store.py",  # Weaviate implementation
            "hybrid_store.py"     # Multi-store orchestration
        ],
        
        # Retrieval & Ranking
        "src/retrieval": [
            "__init__.py",
            "query_expansion.py",  # Query enhancement
            "retrievers.py",       # Multiple retrieval strategies
            "rerankers.py",        # Cross-encoder reranking
            "compression.py"       # Context compression
        ],
        
        # Production API
        "src/api": [
            "__init__.py",
            "main.py",            # FastAPI application
            "routes.py",          # API endpoints
            "middleware.py",      # Auth, rate limiting
            "streaming.py",       # SSE/WebSocket support
            "models.py"           # Pydantic models
        ],
        
        # Caching & Performance
        "src/caching": [
            "__init__.py",
            "redis_cache.py",     # Distributed cache
            "embedding_cache.py", # Cache embeddings
            "result_cache.py"     # Cache query results
        ],
        
        # Monitoring & Analytics
        "src/monitoring": [
            "__init__.py",
            "metrics.py",         # Prometheus metrics
            "logging.py",         # Structured logging
            "analytics.py",       # Usage analytics
            "ab_testing.py"       # A/B test framework
        ],
        
        # Configuration
        "config": [
            "__init__.py",
            "settings.py",        # Environment config
            "prompts.py",         # Prompt templates
            "schemas.py"          # Data schemas
        ],
        
        # Tests
        "tests": [
            "unit/",
            "integration/",
            "load/",
            "fixtures/"
        ],
        
        # Infrastructure
        "infrastructure": [
            "docker/",
            "kubernetes/",
            "terraform/",
            "scripts/"
        ]
    }
    
    # Create all directories and files
    for path, files in structure.items():
        Path(path).mkdir(parents=True, exist_ok=True)
        for file in files:
            if not file.endswith('/'):
                (Path(path) / file).touch()
    
    print("✅ Enterprise RAG structure created!")
    return structure

# Initialize project
if __name__ == "__main__":
    create_enterprise_rag_structure()`,
    solution: `# Complete Enterprise RAG Platform Implementation
# Full code available at: github.com/enterprise-rag/production-platform

# src/config/settings.py
from pydantic import BaseSettings, Field
from typing import List, Dict, Optional
import os

class Settings(BaseSettings):
    # API Keys
    openai_api_key: str = Field(..., env="OPENAI_API_KEY")
    pinecone_api_key: Optional[str] = Field(None, env="PINECONE_API_KEY")
    cohere_api_key: Optional[str] = Field(None, env="COHERE_API_KEY")
    
    # Vector Store Configuration
    vector_store_type: str = Field("chroma", env="VECTOR_STORE_TYPE")
    chroma_persist_dir: str = Field("./chroma_db", env="CHROMA_PERSIST_DIR")
    pinecone_index_name: str = Field("rag-index", env="PINECONE_INDEX_NAME")
    
    # Document Processing
    chunk_size: int = Field(1000, env="CHUNK_SIZE")
    chunk_overlap: int = Field(200, env="CHUNK_OVERLAP")
    max_file_size: int = Field(50 * 1024 * 1024, env="MAX_FILE_SIZE")  # 50MB
    allowed_file_types: List[str] = Field(
        default=[".pdf", ".txt", ".md", ".csv", ".json", ".html"],
        env="ALLOWED_FILE_TYPES"
    )
    
    # Retrieval Configuration
    retrieval_k: int = Field(10, env="RETRIEVAL_K")
    rerank_top_k: int = Field(4, env="RERANK_TOP_K")
    use_reranking: bool = Field(True, env="USE_RERANKING")
    
    # Caching
    redis_url: str = Field("redis://localhost:6379", env="REDIS_URL")
    cache_ttl: int = Field(3600, env="CACHE_TTL")  # 1 hour
    embedding_cache_size: int = Field(10000, env="EMBEDDING_CACHE_SIZE")
    
    # API Configuration
    api_rate_limit: int = Field(100, env="API_RATE_LIMIT")
    api_rate_window: int = Field(3600, env="API_RATE_WINDOW")
    max_concurrent_requests: int = Field(50, env="MAX_CONCURRENT_REQUESTS")
    
    # Monitoring
    enable_monitoring: bool = Field(True, env="ENABLE_MONITORING")
    prometheus_port: int = Field(9090, env="PROMETHEUS_PORT")
    log_level: str = Field("INFO", env="LOG_LEVEL")
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()

# src/document_processing/smart_chunker.py
from typing import List, Dict, Any, Optional
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
import tiktoken
import re
from dataclasses import dataclass

@dataclass
class ChunkingStrategy:
    """Configuration for different chunking strategies"""
    name: str
    chunk_size: int
    chunk_overlap: int
    separators: List[str]
    length_function: callable

class SmartChunker:
    """Advanced document chunking with multiple strategies"""
    
    def __init__(self):
        self.encoding = tiktoken.get_encoding("cl100k_base")
        self.strategies = self._initialize_strategies()
    
    def _initialize_strategies(self) -> Dict[str, ChunkingStrategy]:
        """Initialize different chunking strategies"""
        return {
            "semantic": ChunkingStrategy(
                name="semantic",
                chunk_size=1000,
                chunk_overlap=200,
                separators=["\\n\\n", "\\n", ". ", " ", ""],
                length_function=self._token_length
            ),
            "sliding_window": ChunkingStrategy(
                name="sliding_window",
                chunk_size=512,
                chunk_overlap=128,
                separators=["\\n", " "],
                length_function=self._token_length
            ),
            "sentence_based": ChunkingStrategy(
                name="sentence_based",
                chunk_size=5,  # Number of sentences
                chunk_overlap=1,
                separators=[".", "!", "?"],
                length_function=lambda x: len(re.findall(r'[.!?]+', x))
            ),
            "markdown_aware": ChunkingStrategy(
                name="markdown_aware",
                chunk_size=1500,
                chunk_overlap=300,
                separators=["\\n# ", "\\n## ", "\\n### ", "\\n\\n", "\\n"],
                length_function=self._token_length
            )
        }
    
    def _token_length(self, text: str) -> int:
        """Calculate token length using tiktoken"""
        return len(self.encoding.encode(text))
    
    def chunk_documents(
        self,
        documents: List[Document],
        strategy: str = "semantic",
        custom_chunk_size: Optional[int] = None,
        custom_overlap: Optional[int] = None
    ) -> List[Document]:
        """Chunk documents using specified strategy"""
        
        if strategy not in self.strategies:
            raise ValueError(f"Unknown strategy: {strategy}")
        
        config = self.strategies[strategy]
        
        # Override with custom values if provided
        chunk_size = custom_chunk_size or config.chunk_size
        chunk_overlap = custom_overlap or config.chunk_overlap
        
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=config.separators,
            length_function=config.length_function
        )
        
        chunked_docs = []
        for doc in documents:
            chunks = splitter.split_text(doc.page_content)
            
            for i, chunk in enumerate(chunks):
                # Enrich metadata
                chunk_metadata = doc.metadata.copy()
                chunk_metadata.update({
                    "chunk_index": i,
                    "total_chunks": len(chunks),
                    "chunk_strategy": strategy,
                    "chunk_size": chunk_size,
                    "chunk_overlap": chunk_overlap,
                    "token_count": self._token_length(chunk),
                    "char_count": len(chunk)
                })
                
                chunked_docs.append(Document(
                    page_content=chunk,
                    metadata=chunk_metadata
                ))
        
        return chunked_docs

# src/retrieval/hybrid_retriever.py
from typing import List, Dict, Any, Optional, Tuple
from langchain.schema import Document
from langchain.embeddings.base import Embeddings
from langchain.vectorstores.base import VectorStore
from langchain.retrievers import BM25Retriever, EnsembleRetriever
from sentence_transformers import CrossEncoder
import numpy as np
from dataclasses import dataclass
import asyncio
from concurrent.futures import ThreadPoolExecutor

@dataclass
class RetrievalResult:
    """Container for retrieval results with metadata"""
    documents: List[Document]
    scores: List[float]
    method: str
    query_expansion: Optional[List[str]] = None
    total_candidates: int = 0
    retrieval_time: float = 0.0

class HybridRetriever:
    """Production-grade hybrid retrieval with re-ranking"""
    
    def __init__(
        self,
        vector_store: VectorStore,
        embeddings: Embeddings,
        cross_encoder_model: str = "cross-encoder/ms-marco-MiniLM-L-6-v2",
        use_query_expansion: bool = True
    ):
        self.vector_store = vector_store
        self.embeddings = embeddings
        self.cross_encoder = CrossEncoder(cross_encoder_model)
        self.use_query_expansion = use_query_expansion
        
        # Initialize BM25 retriever
        self._initialize_bm25()
        
        # Thread pool for parallel operations
        self.executor = ThreadPoolExecutor(max_workers=4)
    
    def _initialize_bm25(self):
        """Initialize BM25 retriever with all documents"""
        # Get all documents from vector store
        all_docs = self.vector_store.get()
        self.bm25_retriever = BM25Retriever.from_documents(all_docs)
        self.bm25_retriever.k = 20  # Get more candidates for re-ranking
    
    async def retrieve(
        self,
        query: str,
        k: int = 4,
        filters: Optional[Dict[str, Any]] = None,
        alpha: float = 0.5  # Weight for semantic search (1-alpha for keyword)
    ) -> RetrievalResult:
        """Perform hybrid retrieval with re-ranking"""
        
        import time
        start_time = time.time()
        
        # Step 1: Query expansion (if enabled)
        expanded_queries = [query]
        if self.use_query_expansion:
            expanded_queries = await self._expand_query(query)
        
        # Step 2: Parallel retrieval (keyword + semantic)
        keyword_task = asyncio.create_task(
            self._keyword_search(query, k=20)
        )
        semantic_task = asyncio.create_task(
            self._semantic_search(expanded_queries, k=20, filters=filters)
        )
        
        keyword_docs, semantic_docs = await asyncio.gather(
            keyword_task, semantic_task
        )
        
        # Step 3: Merge and deduplicate
        merged_docs = self._merge_results(
            keyword_docs, semantic_docs, alpha=alpha
        )
        
        # Step 4: Re-rank with cross-encoder
        reranked_docs = await self._rerank_documents(
            query, merged_docs[:30], k=k  # Re-rank top 30
        )
        
        # Step 5: Final filtering and scoring
        final_docs = reranked_docs[:k]
        
        retrieval_time = time.time() - start_time
        
        return RetrievalResult(
            documents=[doc for doc, _ in final_docs],
            scores=[score for _, score in final_docs],
            method=f"hybrid_alpha_{alpha}",
            query_expansion=expanded_queries if self.use_query_expansion else None,
            total_candidates=len(merged_docs),
            retrieval_time=retrieval_time
        )

# src/api/main.py (Production API)
from fastapi import FastAPI, HTTPException, Depends, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import uvicorn
from typing import Optional, List, Dict, Any
import asyncio
import json
from datetime import datetime
from pydantic import BaseModel

class QueryRequest(BaseModel):
    query: str
    k: Optional[int] = 4
    filters: Optional[Dict[str, Any]] = None
    alpha: Optional[float] = 0.5
    stream: bool = False

app = FastAPI(
    title="Enterprise RAG API",
    version="1.0.0",
    description="Production-ready Retrieval Augmented Generation Platform"
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

@app.post("/api/v1/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    chunking_strategy: str = "adaptive",
    metadata: Optional[str] = None
):
    """Upload and process documents with smart chunking"""
    
    # Validate file
    if file.size > settings.max_file_size:
        raise HTTPException(400, "File too large")
    
    if not any(file.filename.endswith(ext) for ext in settings.allowed_file_types):
        raise HTTPException(400, f"File type not supported. Allowed: {settings.allowed_file_types}")
    
    # Process document
    try:
        # Save file temporarily
        temp_path = f"/tmp/{file.filename}"
        content = await file.read()
        with open(temp_path, "wb") as f:
            f.write(content)
        
        # Load and chunk document
        from langchain.document_loaders import UnstructuredFileLoader
        loader = UnstructuredFileLoader(temp_path)
        documents = loader.load()
        
        # Add metadata
        parsed_metadata = json.loads(metadata) if metadata else {}
        for doc in documents:
            doc.metadata.update(parsed_metadata)
            doc.metadata["upload_time"] = datetime.utcnow().isoformat()
            doc.metadata["filename"] = file.filename
        
        # Smart chunking
        chunker = SmartChunker()
        if chunking_strategy == "adaptive":
            chunks = chunker.adaptive_chunk(documents)
        else:
            chunks = chunker.chunk_documents(documents, strategy=chunking_strategy)
        
        # Add to vector store
        # vector_store.add_documents(chunks)
        
        return {
            "status": "success",
            "filename": file.filename,
            "chunks_created": len(chunks),
            "chunking_strategy": chunking_strategy,
            "metadata": parsed_metadata
        }
    
    except Exception as e:
        raise HTTPException(500, f"Processing error: {str(e)}")
    finally:
        # Cleanup
        import os
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/api/v1/query")
async def query_documents(request: QueryRequest):
    """Query documents with hybrid retrieval and re-ranking"""
    
    # Check cache
    cache_key = f"query:{hash(request.query)}"
    # cached_result = await cache.get(cache_key)
    # if cached_result:
    #     return {...cached_result, "cached": True}
    
    # Perform retrieval
    # retrieval_result = await retriever.retrieve(
    #     query=request.query,
    #     k=request.k or settings.retrieval_k,
    #     filters=request.filters,
    #     alpha=request.alpha or 0.5
    # )
    
    # Mock response for demo
    return {
        "query": request.query,
        "answer": "This is a demo response. In production, this would use the hybrid retriever with re-ranking.",
        "sources": [
            {
                "content": "Example source content...",
                "metadata": {"filename": "doc1.pdf", "page": 1},
                "score": 0.92
            }
        ],
        "retrieval_metadata": {
            "method": f"hybrid_alpha_{request.alpha}",
            "total_candidates": 30,
            "retrieval_time": 1.23,
            "query_expansion": [request.query]
        },
        "cached": False
    }

@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

# Production Monitoring & Analytics
"""
# src/monitoring/metrics.py
from prometheus_client import Counter, Histogram, Gauge
import functools
import time

# Define metrics
request_count = Counter(
    'rag_requests_total', 
    'Total RAG requests',
    ['endpoint', 'status']
)

request_duration = Histogram(
    'rag_request_duration_seconds',
    'RAG request duration',
    ['endpoint']
)

active_requests = Gauge(
    'rag_active_requests',
    'Active RAG requests'
)

token_usage = Counter(
    'rag_tokens_total',
    'Total tokens used',
    ['model', 'operation']
)

cache_hits = Counter(
    'rag_cache_hits_total',
    'Cache hit count',
    ['cache_type']
)

def track_request(func):
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        active_requests.inc()
        
        try:
            result = await func(*args, **kwargs)
            request_count.labels(
                endpoint=func.__name__,
                status='success'
            ).inc()
            return result
        except Exception as e:
            request_count.labels(
                endpoint=func.__name__,
                status='error'
            ).inc()
            raise
        finally:
            duration = time.time() - start_time
            request_duration.labels(
                endpoint=func.__name__
            ).observe(duration)
            active_requests.dec()
    
    return wrapper
"""

# Docker deployment
"""
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    build-essential \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Run as non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

# Run application
CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]

# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=\${OPENAI_API_KEY}
      - REDIS_URL=redis://redis:6379
      - VECTOR_STORE_TYPE=chroma
    depends_on:
      - redis
      - chroma
    volumes:
      - ./data:/app/data
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '2'
          memory: 4G

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  chroma:
    image: chromadb/chroma:latest
    ports:
      - "8001:8000"
    volumes:
      - chroma_data:/chroma/chroma

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - api

volumes:
  redis_data:
  chroma_data:
"""`,
    hints: [
      'Test verschillende chunking strategies om te zien welke het beste werkt voor jouw documenten',
      'Start met ChromaDB lokaal voordat je overschakelt naar cloud vector stores',
      'Monitor token usage vanaf het begin om kosten te controleren',
      'Implementeer caching op meerdere levels voor optimale performance',
      'Gebruik re-ranking alleen wanneer nodig - het voegt latency toe',
      'Test met echte productie data volumes om bottlenecks te vinden'
    ]
  }
}

// Export lessons individueel voor makkelijke toegang
export { lesson41, lesson42, lesson43 }