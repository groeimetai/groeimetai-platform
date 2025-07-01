import { CourseLessonContent } from '$lib/types/course';

export const lesson4_4: CourseLessonContent = {
  title: 'RAG Production Deployment',
  duration: '55 min',
  objectives: [
    'Set up Docker containers for RAG systems',
    'Scale vector databases for production workloads',
    'Implement security best practices for RAG',
    'Monitor RAG systems with Grafana',
    'Deploy a Dutch legal document RAG system'
  ],
  sections: [
    {
      title: 'Docker Setup for RAG Systems',
      content: `
## Production-Ready RAG with Docker

### Multi-Container Architecture
\`\`\`yaml
# docker-compose.yml
version: '3.8'

services:
  # RAG API Service
  rag-api:
    build:
      context: .
      dockerfile: Dockerfile.api
    environment:
      - REDIS_URL=redis://redis:6379
      - VECTOR_DB_URL=http://weaviate:8080
      - POSTGRES_URL=postgresql://user:pass@postgres:5432/ragdb
      - OPENAI_API_KEY=\${OPENAI_API_KEY}
    ports:
      - "8000:8000"
    depends_on:
      - redis
      - postgres
      - weaviate
    volumes:
      - ./models:/app/models
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '2'
          memory: 4G

  # Document Processing Worker
  doc-processor:
    build:
      context: .
      dockerfile: Dockerfile.worker
    environment:
      - REDIS_URL=redis://redis:6379
      - VECTOR_DB_URL=http://weaviate:8080
    depends_on:
      - redis
      - weaviate
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1'
          memory: 2G

  # Weaviate Vector Database
  weaviate:
    image: semitechnologies/weaviate:1.22.4
    environment:
      - QUERY_DEFAULTS_LIMIT=100
      - AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=false
      - PERSISTENCE_DATA_PATH=/var/lib/weaviate
      - DEFAULT_VECTORIZER_MODULE=text2vec-openai
      - ENABLE_MODULES=text2vec-openai,ref2vec-centroid
      - CLUSTER_HOSTNAME=weaviate
    ports:
      - "8080:8080"
    volumes:
      - weaviate_data:/var/lib/weaviate

  # Redis for caching and job queue
  redis:
    image: redis:7-alpine
    command: redis-server --maxmemory 2gb --maxmemory-policy allkeys-lru
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # PostgreSQL for metadata
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=ragdb
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Nginx Load Balancer
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - rag-api

volumes:
  weaviate_data:
  redis_data:
  postgres_data:
\`\`\`

### API Dockerfile
\`\`\`dockerfile
# Dockerfile.api
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

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 raguser && chown -R raguser:raguser /app
USER raguser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:8000/health || exit 1

# Run with gunicorn
CMD ["gunicorn", "app:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
\`\`\`
      `
    },
    {
      title: 'Vector Database Scaling',
      content: `
## Scaling Vector Databases for Production

### Weaviate Production Configuration
\`\`\`python
import weaviate
from weaviate.classes import config
import os

class WeaviateProductionClient:
    def __init__(self):
        self.client = weaviate.connect_to_custom(
            http_host="weaviate.production.com",
            http_port=80,
            http_secure=True,
            grpc_host="weaviate.production.com",
            grpc_port=50051,
            grpc_secure=True,
            auth_client_secret=weaviate.AuthApiKey(
                api_key=os.getenv("WEAVIATE_API_KEY")
            )
        )
    
    def create_optimized_collection(self, name: str):
        """Create collection with production optimizations"""
        self.client.collections.create(
            name=name,
            vectorizer_config=config.Configure.Vectorizer.text2vec_openai(
                model="text-embedding-3-small",
                dimensions=1536,
                vectorize_collection_name=False
            ),
            vector_index_config=config.Configure.VectorIndex.hnsw(
                distance_metric=config.VectorDistances.COSINE,
                ef_construction=384,
                ef=256,
                max_connections=64,
                dynamic_ef_min=100,
                dynamic_ef_max=500,
                dynamic_ef_factor=8,
                vector_cache_max_objects=2000000,
                flat_search_cutoff=40000,
                skip=False,
                cleanup_interval_seconds=300,
                pq=config.Configure.VectorIndex.PQ(
                    enabled=True,
                    training_limit=100000,
                    segments=0  # Auto-determine
                )
            ),
            properties=[
                config.Property(
                    name="content",
                    data_type=config.DataType.TEXT,
                    tokenization=config.Tokenization.WORD,
                    index_filterable=True,
                    index_searchable=True
                ),
                config.Property(
                    name="document_id",
                    data_type=config.DataType.TEXT,
                    index_filterable=True,
                    index_searchable=False
                ),
                config.Property(
                    name="metadata",
                    data_type=config.DataType.OBJECT,
                    nested_properties=[
                        config.Property(
                            name="source",
                            data_type=config.DataType.TEXT
                        ),
                        config.Property(
                            name="timestamp",
                            data_type=config.DataType.DATE
                        )
                    ]
                )
            ],
            inverted_index_config=config.Configure.inverted_index(
                bm25_b=0.75,
                bm25_k1=1.2,
                index_timestamps=True,
                index_null_state=True,
                index_property_length=True
            ),
            multi_tenancy_config=config.Configure.multi_tenancy(
                enabled=True,
                auto_tenant_creation=True
            ),
            replication_config=config.Configure.replication(
                factor=3,
                async_enabled=True
            ),
            sharding_config=config.Configure.sharding(
                virtual_per_physical=128,
                desired_count=4,
                actual_count=4,
                desired_virtual_count=512,
                key="_id",
                strategy="hash",
                function="murmur3"
            )
        )

### Pinecone Production Setup
\`\`\`python
import pinecone
from pinecone import ServerlessSpec, PodSpec
import numpy as np
from typing import List, Dict
import asyncio

class PineconeProductionClient:
    def __init__(self):
        self.pc = pinecone.Pinecone(
            api_key=os.getenv("PINECONE_API_KEY"),
            environment=os.getenv("PINECONE_ENVIRONMENT")
        )
    
    def create_production_index(self, name: str, dimension: int = 1536):
        """Create index with production specifications"""
        # For high-throughput production workloads
        self.pc.create_index(
            name=name,
            dimension=dimension,
            metric="cosine",
            spec=PodSpec(
                environment="us-east-1-aws",
                pod_type="p2.x8",  # High performance pods
                pods=4,  # Number of pods
                replicas=2,  # Replicas per pod
                metadata_config={
                    "indexed": ["document_type", "language", "date"]
                }
            )
        )
    
    async def batch_upsert_with_retry(
        self,
        index_name: str,
        vectors: List[Dict],
        batch_size: int = 100
    ):
        """Batch upsert with retry logic"""
        index = self.pc.Index(index_name)
        
        for i in range(0, len(vectors), batch_size):
            batch = vectors[i:i + batch_size]
            retry_count = 0
            max_retries = 3
            
            while retry_count < max_retries:
                try:
                    await asyncio.to_thread(
                        index.upsert,
                        vectors=batch,
                        async_req=False
                    )
                    break
                except Exception as e:
                    retry_count += 1
                    if retry_count >= max_retries:
                        raise e
                    await asyncio.sleep(2 ** retry_count)  # Exponential backoff

### Load Balancing for Vector Search
\`\`\`python
import random
from typing import List, Any
import asyncio
from dataclasses import dataclass

@dataclass
class VectorDBNode:
    host: str
    port: int
    weight: float = 1.0
    healthy: bool = True

class VectorDBLoadBalancer:
    def __init__(self, nodes: List[VectorDBNode]):
        self.nodes = nodes
        self.current_index = 0
    
    async def health_check(self):
        """Periodic health checks for nodes"""
        while True:
            for node in self.nodes:
                try:
                    # Implement actual health check
                    response = await self._check_node_health(node)
                    node.healthy = response.status == 200
                except:
                    node.healthy = False
            await asyncio.sleep(30)  # Check every 30 seconds
    
    def get_node(self) -> VectorDBNode:
        """Get next available node using weighted round-robin"""
        healthy_nodes = [n for n in self.nodes if n.healthy]
        if not healthy_nodes:
            raise Exception("No healthy vector DB nodes available")
        
        # Weighted selection
        total_weight = sum(n.weight for n in healthy_nodes)
        random_weight = random.uniform(0, total_weight)
        
        current_weight = 0
        for node in healthy_nodes:
            current_weight += node.weight
            if random_weight <= current_weight:
                return node
        
        return healthy_nodes[-1]
\`\`\`
      `
    },
    {
      title: 'Security Best Practices',
      content: `
## RAG Security Implementation

### API Security Layer
\`\`\`python
from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from datetime import datetime, timedelta
import hashlib
import hmac
from typing import Optional
import redis
import ipaddress

security = HTTPBearer()

class RAGSecurityMiddleware:
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
        self.secret_key = os.getenv("JWT_SECRET_KEY")
        self.rate_limit_window = 3600  # 1 hour
        self.max_requests = 1000
    
    async def verify_token(
        self,
        credentials: HTTPAuthorizationCredentials = Security(security)
    ) -> dict:
        """Verify JWT token"""
        token = credentials.credentials
        
        try:
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=["HS256"]
            )
            
            # Check if token is blacklisted
            if await self.is_token_blacklisted(token):
                raise HTTPException(status_code=401, detail="Token revoked")
            
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid token")
    
    async def rate_limit(self, user_id: str, endpoint: str) -> bool:
        """Implement rate limiting per user per endpoint"""
        key = f"rate_limit:{user_id}:{endpoint}"
        
        try:
            current = self.redis.incr(key)
            if current == 1:
                self.redis.expire(key, self.rate_limit_window)
            
            if current > self.max_requests:
                raise HTTPException(
                    status_code=429,
                    detail="Rate limit exceeded"
                )
            return True
        except redis.RedisError:
            # Fail open if Redis is down
            return True
    
    async def sanitize_input(self, query: str) -> str:
        """Sanitize user input to prevent injection attacks"""
        # Remove potential command injections
        dangerous_patterns = [
            r'\\\\x[0-9a-fA-F]{2}',  # Hex escapes
            r'\\\\[0-7]{1,3}',       # Octal escapes
            r'<script.*?>.*?</script>',  # Script tags
            r'javascript:',          # JavaScript protocol
            r'data:text/html',       # Data URLs
        ]
        
        import re
        sanitized = query
        for pattern in dangerous_patterns:
            sanitized = re.sub(pattern, '', sanitized, flags=re.IGNORECASE)
        
        # Limit query length
        max_length = 10000
        if len(sanitized) > max_length:
            sanitized = sanitized[:max_length]
        
        return sanitized.strip()

### Data Encryption
\`\`\`python
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64

class DocumentEncryption:
    def __init__(self, master_key: str):
        # Derive encryption key from master key
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=b'stable_salt',  # Use proper salt in production
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(master_key.encode()))
        self.cipher = Fernet(key)
    
    def encrypt_document(self, content: str) -> bytes:
        """Encrypt sensitive document content"""
        return self.cipher.encrypt(content.encode())
    
    def decrypt_document(self, encrypted: bytes) -> str:
        """Decrypt document content"""
        return self.cipher.decrypt(encrypted).decode()
    
    def encrypt_metadata(self, metadata: dict) -> str:
        """Encrypt sensitive metadata"""
        import json
        json_str = json.dumps(metadata)
        return self.cipher.encrypt(json_str.encode()).decode()

### Access Control
\`\`\`python
from enum import Enum
from typing import List, Dict
import asyncpg

class Permission(Enum):
    READ = "read"
    WRITE = "write"
    DELETE = "delete"
    ADMIN = "admin"

class RBACManager:
    def __init__(self, db_pool: asyncpg.Pool):
        self.db = db_pool
    
    async def check_document_access(
        self,
        user_id: str,
        document_id: str,
        required_permission: Permission
    ) -> bool:
        """Check if user has permission to access document"""
        query = """
        SELECT EXISTS (
            SELECT 1 FROM document_permissions dp
            JOIN user_roles ur ON dp.role_id = ur.role_id
            JOIN role_permissions rp ON ur.role_id = rp.role_id
            WHERE ur.user_id = $1
            AND dp.document_id = $2
            AND rp.permission = $3
            AND ur.is_active = true
            AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        )
        """
        
        async with self.db.acquire() as conn:
            has_access = await conn.fetchval(
                query,
                user_id,
                document_id,
                required_permission.value
            )
        
        return has_access
    
    async def get_user_document_scope(
        self,
        user_id: str
    ) -> List[str]:
        """Get all documents user has access to"""
        query = """
        SELECT DISTINCT dp.document_id
        FROM document_permissions dp
        JOIN user_roles ur ON dp.role_id = ur.role_id
        WHERE ur.user_id = $1
        AND ur.is_active = true
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        """
        
        async with self.db.acquire() as conn:
            rows = await conn.fetch(query, user_id)
            return [row['document_id'] for row in rows]
\`\`\`
      `
    },
    {
      title: 'Monitoring with Grafana',
      content: `
## RAG System Monitoring

### Prometheus Metrics Collection
\`\`\`python
from prometheus_client import Counter, Histogram, Gauge, CollectorRegistry
from prometheus_client import start_http_server
import time
from functools import wraps

# Create metrics
registry = CollectorRegistry()

# Request metrics
request_count = Counter(
    'rag_requests_total',
    'Total RAG requests',
    ['method', 'endpoint', 'status'],
    registry=registry
)

request_duration = Histogram(
    'rag_request_duration_seconds',
    'RAG request duration',
    ['method', 'endpoint'],
    registry=registry
)

# Vector search metrics
vector_search_duration = Histogram(
    'rag_vector_search_duration_seconds',
    'Vector search duration',
    ['index', 'operation'],
    registry=registry
)

vector_db_connections = Gauge(
    'rag_vector_db_connections',
    'Active vector DB connections',
    ['database'],
    registry=registry
)

# Document processing metrics
documents_processed = Counter(
    'rag_documents_processed_total',
    'Total documents processed',
    ['status', 'document_type'],
    registry=registry
)

embedding_generation_duration = Histogram(
    'rag_embedding_generation_seconds',
    'Embedding generation duration',
    ['model'],
    registry=registry
)

# Cache metrics
cache_hits = Counter(
    'rag_cache_hits_total',
    'Cache hits',
    ['cache_type'],
    registry=registry
)

cache_misses = Counter(
    'rag_cache_misses_total',
    'Cache misses',
    ['cache_type'],
    registry=registry
)

# Custom metrics decorator
def track_metrics(endpoint: str):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            status = "success"
            
            try:
                result = await func(*args, **kwargs)
                return result
            except Exception as e:
                status = "error"
                raise e
            finally:
                duration = time.time() - start_time
                request_count.labels(
                    method="POST",
                    endpoint=endpoint,
                    status=status
                ).inc()
                request_duration.labels(
                    method="POST",
                    endpoint=endpoint
                ).observe(duration)
        
        return wrapper
    return decorator

### Grafana Dashboard Configuration
\`\`\`json
{
  "dashboard": {
    "title": "RAG System Monitoring",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(rag_requests_total[5m])",
            "legendFormat": "{{method}} {{endpoint}} - {{status}}"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Response Time (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(rag_request_duration_seconds_bucket[5m]))",
            "legendFormat": "{{endpoint}}"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Vector Search Performance",
        "targets": [
          {
            "expr": "histogram_quantile(0.99, rate(rag_vector_search_duration_seconds_bucket[5m]))",
            "legendFormat": "{{index}} - {{operation}}"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Cache Hit Rate",
        "targets": [
          {
            "expr": "rate(rag_cache_hits_total[5m]) / (rate(rag_cache_hits_total[5m]) + rate(rag_cache_misses_total[5m]))",
            "legendFormat": "{{cache_type}}"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Document Processing Queue",
        "targets": [
          {
            "expr": "rate(rag_documents_processed_total[5m])",
            "legendFormat": "{{document_type}} - {{status}}"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(rag_requests_total{status='error'}[5m]) / rate(rag_requests_total[5m])",
            "legendFormat": "{{endpoint}}"
          }
        ],
        "type": "graph"
      }
    ]
  }
}
\`\`\`

### Logging and Tracing
\`\`\`python
import logging
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
import structlog

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

# Configure OpenTelemetry
trace.set_tracer_provider(TracerProvider())
tracer = trace.get_tracer(__name__)

otlp_exporter = OTLPSpanExporter(
    endpoint="localhost:4317",
    insecure=True,
)

span_processor = BatchSpanProcessor(otlp_exporter)
trace.get_tracer_provider().add_span_processor(span_processor)

class RAGMonitoring:
    def __init__(self):
        self.logger = structlog.get_logger()
    
    async def log_query(self, query: str, user_id: str, context: dict):
        """Log query with context"""
        self.logger.info(
            "rag_query",
            query=query,
            user_id=user_id,
            context=context,
            timestamp=datetime.utcnow().isoformat()
        )
    
    @tracer.start_as_current_span("vector_search")
    async def trace_vector_search(self, query_embedding, index_name: str):
        """Trace vector search operation"""
        span = trace.get_current_span()
        span.set_attribute("index.name", index_name)
        span.set_attribute("embedding.dimension", len(query_embedding))
        
        # Perform search
        start_time = time.time()
        results = await self.perform_search(query_embedding, index_name)
        duration = time.time() - start_time
        
        span.set_attribute("search.duration", duration)
        span.set_attribute("search.results_count", len(results))
        
        return results
\`\`\`
      `
    },
    {
      title: 'Dutch Legal Document RAG Example',
      content: `
## Dutch Legal Document RAG System

### Complete Production Implementation
\`\`\`python
from typing import List, Dict, Optional
import asyncio
from datetime import datetime
from dataclasses import dataclass
import hashlib

@dataclass
class DutchLegalDocument:
    id: str
    title: str
    content: str
    document_type: str  # wet, besluit, regeling, jurisprudentie
    date_published: datetime
    source: str  # overheid.nl, rechtspraak.nl
    metadata: Dict

class DutchLegalRAG:
    def __init__(self):
        self.vector_client = WeaviateProductionClient()
        self.llm_client = OpenAI()
        self.cache = redis.Redis()
        self.security = RAGSecurityMiddleware(self.cache)
        self.monitoring = RAGMonitoring()
    
    async def process_legal_document(self, document: DutchLegalDocument):
        """Process Dutch legal document with special handling"""
        # Extract legal entities and references
        entities = await self.extract_legal_entities(document.content)
        
        # Chunk with legal context preservation
        chunks = await self.chunk_legal_text(
            document.content,
            preserve_articles=True,
            max_chunk_size=1000
        )
        
        # Generate embeddings with legal-specific model
        embeddings = []
        for chunk in chunks:
            embedding = await self.generate_legal_embedding(chunk)
            embeddings.append({
                "id": hashlib.sha256(f"{document.id}_{chunk[:50]}".encode()).hexdigest(),
                "embedding": embedding,
                "content": chunk,
                "document_id": document.id,
                "document_title": document.title,
                "document_type": document.document_type,
                "entities": entities,
                "metadata": {
                    **document.metadata,
                    "date_published": document.date_published.isoformat(),
                    "source": document.source
                }
            })
        
        # Store in vector database
        await self.vector_client.batch_upsert_with_retry(
            "dutch_legal_documents",
            embeddings
        )
        
        # Update search index
        await self.update_legal_search_index(document)
    
    async def extract_legal_entities(self, text: str) -> Dict:
        """Extract Dutch legal entities and references"""
        entities = {
            "wetten": [],  # Laws
            "artikelen": [],  # Articles
            "rechters": [],  # Judges
            "partijen": [],  # Parties
            "uitspraken": []  # Verdicts
        }
        
        # Extract law references (e.g., "Wet op de Rechtsbijstand")
        import re
        wet_pattern = r'\\b(?:Wet|Wetboek)\\s+[^,.;]+(?:van\\s+\\d{4})?'
        entities["wetten"] = re.findall(wet_pattern, text)
        
        # Extract article references (e.g., "artikel 3:15 BW")
        artikel_pattern = r'\\bartikel\\s+\\d+(?::\\d+)?(?:\\s+\\w+)?'
        entities["artikelen"] = re.findall(artikel_pattern, text, re.IGNORECASE)
        
        # Extract case numbers (e.g., "ECLI:NL:HR:2023:1234")
        ecli_pattern = r'ECLI:NL:[A-Z]+:\\d{4}:\\d+'
        entities["uitspraken"] = re.findall(ecli_pattern, text)
        
        return entities
    
    async def chunk_legal_text(
        self,
        text: str,
        preserve_articles: bool = True,
        max_chunk_size: int = 1000
    ) -> List[str]:
        """Chunk legal text while preserving structure"""
        chunks = []
        
        if preserve_articles:
            # Split by articles while keeping context
            article_splits = re.split(r'(\\bArtikel\\s+\\d+[^\\n]*\\n)', text)
            
            current_chunk = ""
            for i, part in enumerate(article_splits):
                if part.strip().startswith("Artikel"):
                    # Start new chunk if current is too large
                    if len(current_chunk) > max_chunk_size / 2:
                        chunks.append(current_chunk.strip())
                        current_chunk = part
                    else:
                        current_chunk += part
                else:
                    # Add content to current chunk
                    if len(current_chunk + part) > max_chunk_size:
                        # Split long content
                        sentences = re.split(r'(?<=[.!?])\\s+', part)
                        for sentence in sentences:
                            if len(current_chunk + sentence) > max_chunk_size:
                                chunks.append(current_chunk.strip())
                                current_chunk = sentence
                            else:
                                current_chunk += " " + sentence
                    else:
                        current_chunk += part
            
            if current_chunk.strip():
                chunks.append(current_chunk.strip())
        else:
            # Standard chunking
            chunks = self.standard_chunk(text, max_chunk_size)
        
        return chunks
    
    async def search_legal_documents(
        self,
        query: str,
        user_id: str,
        filters: Optional[Dict] = None
    ) -> List[Dict]:
        """Search Dutch legal documents with RBAC"""
        # Check user permissions
        user_scope = await self.security.get_user_document_scope(user_id)
        
        # Sanitize query
        safe_query = await self.security.sanitize_input(query)
        
        # Check cache
        cache_key = f"legal_search:{hashlib.md5(safe_query.encode()).hexdigest()}"
        cached_result = self.cache.get(cache_key)
        if cached_result:
            self.monitoring.cache_hits.labels(cache_type="search").inc()
            return json.loads(cached_result)
        
        # Generate query embedding
        query_embedding = await self.generate_legal_embedding(safe_query)
        
        # Build Weaviate query with filters
        where_filter = {
            "operator": "And",
            "operands": [
                {
                    "path": ["document_id"],
                    "operator": "ContainsAny",
                    "valueTextArray": user_scope
                }
            ]
        }
        
        if filters:
            if "document_type" in filters:
                where_filter["operands"].append({
                    "path": ["document_type"],
                    "operator": "Equal",
                    "valueText": filters["document_type"]
                })
            
            if "date_from" in filters:
                where_filter["operands"].append({
                    "path": ["metadata", "date_published"],
                    "operator": "GreaterThanEqual",
                    "valueDate": filters["date_from"]
                })
        
        # Perform hybrid search
        results = await self.vector_client.hybrid_search(
            collection_name="dutch_legal_documents",
            query=safe_query,
            vector=query_embedding,
            where=where_filter,
            limit=20,
            alpha=0.75  # Balance between vector and keyword search
        )
        
        # Post-process results
        processed_results = []
        for result in results:
            processed_results.append({
                "document_id": result["document_id"],
                "title": result["document_title"],
                "content": result["content"],
                "score": result["score"],
                "document_type": result["document_type"],
                "entities": result.get("entities", {}),
                "metadata": result.get("metadata", {})
            })
        
        # Cache results
        self.cache.setex(
            cache_key,
            300,  # 5 minutes
            json.dumps(processed_results)
        )
        
        # Log search
        await self.monitoring.log_query(
            safe_query,
            user_id,
            {
                "filters": filters,
                "results_count": len(processed_results)
            }
        )
        
        return processed_results
    
    async def generate_legal_answer(
        self,
        query: str,
        context: List[Dict],
        user_id: str
    ) -> str:
        """Generate answer with legal citations"""
        # Build context with citations
        context_text = ""
        citations = []
        
        for i, doc in enumerate(context[:5]):  # Top 5 results
            context_text += f"\\n[{i+1}] {doc['content']}\\n"
            citations.append({
                "number": i+1,
                "title": doc['title'],
                "document_id": doc['document_id'],
                "document_type": doc['document_type']
            })
        
        # Legal-specific prompt
        prompt = f"""Je bent een Nederlandse juridisch expert. Beantwoord de volgende vraag op basis van de gegeven context uit Nederlandse wetgeving en jurisprudentie.

Vraag: {query}

Context:
{context_text}

Instructies:
1. Geef een duidelijk en nauwkeurig antwoord in het Nederlands
2. Verwijs naar specifieke wetsartikelen en uitspraken met [nummer] citaties
3. Leg juridische termen uit waar nodig
4. Wees voorzichtig met interpretaties en geef aan wanneer iets onduidelijk is
5. Structureer je antwoord logisch

Antwoord:"""

        response = await self.llm_client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": "Je bent een ervaren Nederlandse jurist."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,  # Low temperature for accuracy
            max_tokens=2000
        )
        
        answer = response.choices[0].message.content
        
        # Add citations footer
        citation_text = "\\n\\nBronnen:\\n"
        for citation in citations:
            citation_text += f"[{citation['number']}] {citation['title']} ({citation['document_type']})\\n"
        
        return answer + citation_text

### Production API Endpoint
\`\`\`python
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="Dutch Legal RAG API")

class LegalSearchRequest(BaseModel):
    query: str
    filters: Optional[Dict] = None
    include_answer: bool = True

class LegalSearchResponse(BaseModel):
    results: List[Dict]
    answer: Optional[str]
    search_id: str
    timestamp: datetime

@app.post("/api/v1/legal/search")
@track_metrics("/api/v1/legal/search")
async def search_legal_documents(
    request: LegalSearchRequest,
    user_id: str = Depends(security.verify_token)
):
    """Search Dutch legal documents"""
    try:
        # Rate limiting
        await security.rate_limit(user_id, "/api/v1/legal/search")
        
        # Perform search
        results = await dutch_legal_rag.search_legal_documents(
            request.query,
            user_id,
            request.filters
        )
        
        # Generate answer if requested
        answer = None
        if request.include_answer and results:
            answer = await dutch_legal_rag.generate_legal_answer(
                request.query,
                results,
                user_id
            )
        
        search_id = str(uuid.uuid4())
        
        return LegalSearchResponse(
            results=results,
            answer=answer,
            search_id=search_id,
            timestamp=datetime.utcnow()
        )
    
    except Exception as e:
        logger.error("Legal search error", error=str(e), user_id=user_id)
        raise HTTPException(status_code=500, detail="Search failed")

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        workers=4,
        loop="uvloop",
        log_config="logging.yaml"
    )
\`\`\`
      `
    }
  ],
  exercises: [
    {
      title: 'Deploy Multi-Container RAG System',
      difficulty: 'expert',
      estimatedTime: '90 min',
      description: 'Set up a production RAG system with Docker, including vector database, caching, and monitoring.'
    },
    {
      title: 'Implement Production Security',
      difficulty: 'hard',
      estimatedTime: '60 min',
      description: 'Add authentication, rate limiting, and encryption to your RAG API.'
    },
    {
      title: 'Create Grafana Dashboard',
      difficulty: 'medium',
      estimatedTime: '45 min',
      description: 'Build a comprehensive monitoring dashboard for your RAG system with custom metrics.'
    }
  ],
  resources: [
    {
      title: 'Docker Best Practices for Production',
      url: 'https://docs.docker.com/develop/dev-best-practices/',
      type: 'documentation'
    },
    {
      title: 'Weaviate Production Guide',
      url: 'https://weaviate.io/developers/weaviate/configuration/replication',
      type: 'documentation'
    },
    {
      title: 'Grafana RAG Monitoring',
      url: 'https://grafana.com/docs/grafana/latest/getting-started/',
      type: 'tutorial'
    }
  ]
};