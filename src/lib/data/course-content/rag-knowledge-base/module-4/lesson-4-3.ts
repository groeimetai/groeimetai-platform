import { Lesson } from '@/lib/data/courses'

export const lesson4_3: Lesson = {
  id: 'lesson-4-3',
  title: 'RAG Performance Optimization: Snelheid & Efficiëntie',
  duration: '45 min',
  content: `# RAG Performance Optimization: Snelheid & Efficiëntie

De performance van je RAG-systeem bepaalt direct de gebruikerservaring. In deze les leer je geavanceerde technieken om de snelheid, accuraatheid en efficiëntie van je RAG-implementatie drastisch te verbeteren.

## Query Optimization: Hybrid Search Implementation

Hybrid search combineert de kracht van semantische en keyword-based search voor optimale resultaten:

\`\`\`python
# Hybrid search implementation
import numpy as np
from typing import List, Tuple, Dict
from sentence_transformers import SentenceTransformer
from rank_bm25 import BM25Okapi

class HybridSearchEngine:
    def __init__(self, embedding_model: str = "all-MiniLM-L6-v2"):
        self.encoder = SentenceTransformer(embedding_model)
        self.documents = []
        self.embeddings = None
        self.bm25 = None
    
    def hybrid_search(
        self, 
        query: str, 
        k: int = 10,
        alpha: float = 0.7
    ) -> List[Tuple[int, float, str]]:
        """
        Hybrid search combining semantic and keyword search
        
        Args:
            query: Search query
            k: Number of results to return
            alpha: Weight for semantic search (1-alpha for BM25)
        
        Returns:
            List of (index, score, document) tuples
        """
        # Semantic search
        query_embedding = self.encoder.encode([query])
        semantic_scores = np.dot(self.embeddings, query_embedding.T).squeeze()
        semantic_scores = (semantic_scores + 1) / 2  # Normalize to [0, 1]
        
        # BM25 keyword search
        tokenized_query = query.lower().split()
        bm25_scores = self.bm25.get_scores(tokenized_query)
        bm25_scores = bm25_scores / (bm25_scores.max() + 1e-6)  # Normalize
        
        # Combine scores
        combined_scores = (
            alpha * semantic_scores + 
            (1 - alpha) * bm25_scores
        )
        
        # Get top k results
        top_indices = np.argsort(combined_scores)[::-1][:k]
        
        results = []
        for idx in top_indices:
            results.append((
                idx,
                combined_scores[idx],
                self.documents[idx]
            ))
        
        return results
    
    def index_documents(self, documents: List[str]):
        """Index documents for hybrid search"""
        self.documents = documents
        
        # Create embeddings for semantic search
        self.embeddings = self.encoder.encode(
            documents,
            show_progress_bar=True,
            batch_size=32
        )
        
        # Normalize embeddings
        self.embeddings = self.embeddings / np.linalg.norm(
            self.embeddings, axis=1, keepdims=True
        )
        
        # Create BM25 index
        tokenized_docs = [doc.lower().split() for doc in documents]
        self.bm25 = BM25Okapi(tokenized_docs)
\`\`\`

### Geavanceerde Hybrid Search met Re-ranking

\`\`\`python
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

class AdvancedHybridSearch(HybridSearchEngine):
    def __init__(
        self,
        embedding_model: str = "all-MiniLM-L6-v2",
        reranker_model: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"
    ):
        super().__init__(embedding_model)
        
        # Initialize reranker
        self.reranker_tokenizer = AutoTokenizer.from_pretrained(reranker_model)
        self.reranker_model = AutoModelForSequenceClassification.from_pretrained(
            reranker_model
        )
        self.reranker_model.eval()
    
    def search_with_reranking(
        self,
        query: str,
        k: int = 10,
        rerank_top_n: int = 20,
        alpha: float = 0.7
    ) -> List[Dict]:
        """
        Hybrid search with cross-encoder reranking
        """
        # Get initial candidates
        initial_results = self.hybrid_search(
            query, 
            k=rerank_top_n, 
            alpha=alpha
        )
        
        # Prepare pairs for reranking
        pairs = []
        for idx, _, doc in initial_results:
            pairs.append([query, doc])
        
        # Rerank with cross-encoder
        with torch.no_grad():
            inputs = self.reranker_tokenizer(
                pairs,
                padding=True,
                truncation=True,
                max_length=512,
                return_tensors="pt"
            )
            
            scores = self.reranker_model(**inputs).logits.squeeze()
            
            if len(scores.shape) == 0:
                scores = scores.unsqueeze(0)
        
        # Sort by reranker scores
        reranked_indices = torch.argsort(scores, descending=True)[:k]
        
        # Return reranked results
        final_results = []
        for i in reranked_indices:
            original_idx = initial_results[i][0]
            final_results.append({
                "document": self.documents[original_idx],
                "hybrid_score": initial_results[i][1],
                "rerank_score": scores[i].item(),
                "index": original_idx
            })
        
        return final_results
\`\`\`

## Embedding Benchmarks

### Vergelijking van populaire embedding modellen:

\`\`\`python
import time
import pandas as pd
from typing import Dict, List
import matplotlib.pyplot as plt

class EmbeddingBenchmark:
    def __init__(self):
        self.models = {
            "OpenAI/ada-002": {
                "dimension": 1536,
                "max_tokens": 8191,
                "cost_per_1k_tokens": 0.0001,
                "type": "proprietary"
            },
            "OpenAI/text-embedding-3-small": {
                "dimension": 1536,
                "max_tokens": 8191,
                "cost_per_1k_tokens": 0.00002,
                "type": "proprietary"
            },
            "OpenAI/text-embedding-3-large": {
                "dimension": 3072,
                "max_tokens": 8191,
                "cost_per_1k_tokens": 0.00013,
                "type": "proprietary"
            },
            "BAAI/bge-large-en": {
                "dimension": 1024,
                "max_tokens": 512,
                "cost_per_1k_tokens": 0,
                "type": "open_source"
            },
            "intfloat/e5-large-v2": {
                "dimension": 1024,
                "max_tokens": 512,
                "cost_per_1k_tokens": 0,
                "type": "open_source"
            },
            "hkunlp/instructor-large": {
                "dimension": 768,
                "max_tokens": 512,
                "cost_per_1k_tokens": 0,
                "type": "open_source"
            }
        }
        
    def benchmark_models(
        self,
        test_queries: List[str],
        test_documents: List[str]
    ) -> pd.DataFrame:
        """Benchmark different embedding models"""
        results = []
        
        for model_name, specs in self.models.items():
            print(f"\\nBenchmarking {model_name}...")
            
            # Simulate performance metrics
            if specs["type"] == "proprietary":
                # API-based models
                avg_latency = 150 + specs["dimension"] * 0.01  # ms
                throughput = 100  # requests/second
            else:
                # Local models
                avg_latency = 20 + specs["dimension"] * 0.005  # ms
                throughput = 500  # requests/second
            
            # Calculate costs
            total_tokens = sum(len(q.split()) for q in test_queries)
            total_tokens += sum(len(d.split()) for d in test_documents)
            cost = (total_tokens / 1000) * specs["cost_per_1k_tokens"]
            
            results.append({
                "Model": model_name,
                "Type": specs["type"],
                "Dimension": specs["dimension"],
                "Max Tokens": specs["max_tokens"],
                "Avg Latency (ms)": avg_latency,
                "Throughput (req/s)": throughput,
                "Cost per 1M tokens": specs["cost_per_1k_tokens"] * 1000,
                "Test Cost": cost
            })
        
        return pd.DataFrame(results)
    
    def plot_performance_vs_cost(self, df: pd.DataFrame):
        """Create performance vs cost visualization"""
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
        
        # Latency vs Cost
        for model_type in df['Type'].unique():
            data = df[df['Type'] == model_type]
            ax1.scatter(
                data['Cost per 1M tokens'],
                data['Avg Latency (ms)'],
                label=model_type,
                s=data['Dimension']/10
            )
        
        ax1.set_xlabel('Cost per 1M tokens ($)')
        ax1.set_ylabel('Average Latency (ms)')
        ax1.set_title('Latency vs Cost (size = dimension)')
        ax1.legend()
        ax1.set_xscale('log')
        
        # Throughput vs Dimension
        ax2.scatter(df['Dimension'], df['Throughput (req/s)'])
        for idx, row in df.iterrows():
            ax2.annotate(
                row['Model'].split('/')[-1],
                (row['Dimension'], row['Throughput (req/s)']),
                fontsize=8
            )
        
        ax2.set_xlabel('Embedding Dimension')
        ax2.set_ylabel('Throughput (requests/second)')
        ax2.set_title('Throughput vs Embedding Dimension')
        
        plt.tight_layout()
        return fig

# Usage example
benchmark = EmbeddingBenchmark()
test_queries = ["What is RAG?"] * 100
test_documents = ["RAG combines retrieval and generation..."] * 1000

results_df = benchmark.benchmark_models(test_queries, test_documents)
print(results_df.to_string())
\`\`\`

## Chunk Size Optimization

\`\`\`python
import numpy as np
from typing import List, Dict, Tuple
from dataclasses import dataclass
import nltk
from nltk.tokenize import sent_tokenize

@dataclass
class ChunkingStrategy:
    chunk_size: int
    overlap: int
    method: str  # 'tokens', 'sentences', 'semantic'
    
class ChunkOptimizer:
    def __init__(self):
        nltk.download('punkt', quiet=True)
        self.strategies = [
            ChunkingStrategy(256, 50, 'tokens'),
            ChunkingStrategy(512, 100, 'tokens'),
            ChunkingStrategy(1024, 200, 'tokens'),
            ChunkingStrategy(3, 1, 'sentences'),
            ChunkingStrategy(5, 2, 'sentences'),
        ]
    
    def chunk_by_tokens(
        self,
        text: str,
        chunk_size: int,
        overlap: int
    ) -> List[str]:
        """Chunk text by token count"""
        tokens = text.split()
        chunks = []
        
        for i in range(0, len(tokens), chunk_size - overlap):
            chunk = ' '.join(tokens[i:i + chunk_size])
            chunks.append(chunk)
            
            if i + chunk_size >= len(tokens):
                break
        
        return chunks
    
    def chunk_by_sentences(
        self,
        text: str,
        chunk_size: int,
        overlap: int
    ) -> List[str]:
        """Chunk text by sentence count"""
        sentences = sent_tokenize(text)
        chunks = []
        
        for i in range(0, len(sentences), chunk_size - overlap):
            chunk = ' '.join(sentences[i:i + chunk_size])
            chunks.append(chunk)
            
            if i + chunk_size >= len(sentences):
                break
        
        return chunks
    
    def chunk_with_metadata(
        self,
        text: str,
        chunk_size: int,
        overlap: int,
        doc_metadata: Dict
    ) -> List[Dict]:
        """Create chunks with enriched metadata"""
        chunks = self.chunk_by_tokens(text, chunk_size, overlap)
        
        enriched_chunks = []
        for i, chunk in enumerate(chunks):
            chunk_metadata = {
                **doc_metadata,
                "chunk_index": i,
                "chunk_total": len(chunks),
                "chunk_size": len(chunk.split()),
                "position_ratio": i / len(chunks),
                "contains_title": i == 0,
                "chunk_text": chunk
            }
            
            # Add semantic metadata
            if i == 0:
                chunk_metadata["chunk_type"] = "introduction"
            elif i == len(chunks) - 1:
                chunk_metadata["chunk_type"] = "conclusion"
            else:
                chunk_metadata["chunk_type"] = "body"
            
            enriched_chunks.append(chunk_metadata)
        
        return enriched_chunks
    
    def test_chunk_sizes(
        self,
        documents: List[str],
        queries: List[str],
        search_engine
    ) -> pd.DataFrame:
        """Test different chunk sizes and measure performance"""
        results = []
        
        for strategy in self.strategies:
            print(f"\\nTesting {strategy}...")
            
            # Create chunks
            all_chunks = []
            for doc in documents:
                if strategy.method == 'tokens':
                    chunks = self.chunk_by_tokens(
                        doc, 
                        strategy.chunk_size, 
                        strategy.overlap
                    )
                else:
                    chunks = self.chunk_by_sentences(
                        doc, 
                        strategy.chunk_size, 
                        strategy.overlap
                    )
                all_chunks.extend(chunks)
            
            # Index chunks
            search_engine.index_documents(all_chunks)
            
            # Test retrieval performance
            avg_precision = 0
            avg_recall = 0
            avg_time = 0
            
            for query in queries:
                start_time = time.time()
                results_search = search_engine.hybrid_search(query, k=5)
                search_time = time.time() - start_time
                
                # Calculate metrics (simplified)
                avg_time += search_time
                # In real scenario, calculate actual precision/recall
                avg_precision += 0.8  # Placeholder
                avg_recall += 0.75    # Placeholder
            
            avg_time /= len(queries)
            avg_precision /= len(queries)
            avg_recall /= len(queries)
            
            results.append({
                "Strategy": f"{strategy.method}_{strategy.chunk_size}",
                "Chunk Size": strategy.chunk_size,
                "Overlap": strategy.overlap,
                "Total Chunks": len(all_chunks),
                "Avg Precision": avg_precision,
                "Avg Recall": avg_recall,
                "Avg Search Time (ms)": avg_time * 1000,
                "F1 Score": 2 * (avg_precision * avg_recall) / (avg_precision + avg_recall)
            })
        
        return pd.DataFrame(results)
\`\`\`

## Caching Layer Implementation

\`\`\`python
import redis
import hashlib
import json
import pickle
from typing import Optional, Any, Dict
from datetime import datetime, timedelta
import asyncio
from functools import wraps

class RAGCacheLayer:
    def __init__(
        self,
        redis_host: str = "localhost",
        redis_port: int = 6379,
        default_ttl: int = 3600
    ):
        self.redis_client = redis.Redis(
            host=redis_host,
            port=redis_port,
            decode_responses=False
        )
        self.default_ttl = default_ttl
        self.hit_count = 0
        self.miss_count = 0
    
    def _generate_cache_key(self, query: str, params: Dict) -> str:
        """Generate unique cache key for query"""
        cache_data = {
            "query": query.lower().strip(),
            "params": params
        }
        serialized = json.dumps(cache_data, sort_keys=True)
        return f"rag:query:{hashlib.md5(serialized.encode()).hexdigest()}"
    
    def get_cached_result(
        self,
        query: str,
        params: Optional[Dict] = None
    ) -> Optional[Dict]:
        """Get cached result if available"""
        if params is None:
            params = {}
            
        cache_key = self._generate_cache_key(query, params)
        
        try:
            cached_data = self.redis_client.get(cache_key)
            if cached_data:
                self.hit_count += 1
                result = pickle.loads(cached_data)
                
                # Update access timestamp
                self.redis_client.zadd(
                    "rag:access_times",
                    {cache_key: datetime.now().timestamp()}
                )
                
                return result
        except Exception as e:
            print(f"Cache retrieval error: {e}")
        
        self.miss_count += 1
        return None
    
    def cache_result(
        self,
        query: str,
        result: Dict,
        params: Optional[Dict] = None,
        ttl: Optional[int] = None
    ):
        """Cache query result"""
        if params is None:
            params = {}
        
        cache_key = self._generate_cache_key(query, params)
        ttl = ttl or self.default_ttl
        
        try:
            # Store result
            self.redis_client.setex(
                cache_key,
                ttl,
                pickle.dumps(result)
            )
            
            # Track access time for analytics
            self.redis_client.zadd(
                "rag:access_times",
                {cache_key: datetime.now().timestamp()}
            )
            
            # Update query frequency
            self.redis_client.zincrby("rag:query_frequency", 1, query)
            
        except Exception as e:
            print(f"Cache storage error: {e}")
    
    def cache_embeddings(
        self,
        text: str,
        embedding: np.ndarray,
        model_name: str
    ):
        """Cache text embeddings"""
        cache_key = f"rag:embedding:{model_name}:{hashlib.md5(text.encode()).hexdigest()}"
        
        try:
            self.redis_client.setex(
                cache_key,
                86400,  # 24 hours TTL for embeddings
                pickle.dumps(embedding)
            )
        except Exception as e:
            print(f"Embedding cache error: {e}")
    
    def get_cached_embedding(
        self,
        text: str,
        model_name: str
    ) -> Optional[np.ndarray]:
        """Get cached embedding if available"""
        cache_key = f"rag:embedding:{model_name}:{hashlib.md5(text.encode()).hexdigest()}"
        
        try:
            cached_data = self.redis_client.get(cache_key)
            if cached_data:
                return pickle.loads(cached_data)
        except Exception as e:
            print(f"Embedding retrieval error: {e}")
        
        return None
    
    def get_cache_stats(self) -> Dict:
        """Get cache performance statistics"""
        total_requests = self.hit_count + self.miss_count
        hit_rate = self.hit_count / total_requests if total_requests > 0 else 0
        
        # Get most frequent queries
        top_queries = self.redis_client.zrevrange(
            "rag:query_frequency",
            0,
            9,
            withscores=True
        )
        
        return {
            "hit_count": self.hit_count,
            "miss_count": self.miss_count,
            "hit_rate": hit_rate,
            "total_requests": total_requests,
            "top_queries": [
                (q.decode() if isinstance(q, bytes) else q, int(score))
                for q, score in top_queries
            ]
        }
    
    def implement_ttl_strategy(self):
        """Implement intelligent TTL based on query patterns"""
        # Get query frequencies
        frequencies = self.redis_client.zrevrange(
            "rag:query_frequency",
            0,
            -1,
            withscores=True
        )
        
        for query, frequency in frequencies:
            if isinstance(query, bytes):
                query = query.decode()
            
            # Adaptive TTL based on frequency
            if frequency > 100:
                ttl = 7200  # 2 hours for very frequent
            elif frequency > 50:
                ttl = 3600  # 1 hour for frequent
            elif frequency > 10:
                ttl = 1800  # 30 min for moderate
            else:
                ttl = 900   # 15 min for rare
            
            # Update TTL for existing cache entries
            # (Implementation depends on specific needs)

# Decorator for automatic caching
def cached_rag_query(cache_layer: RAGCacheLayer, ttl: Optional[int] = None):
    def decorator(func):
        @wraps(func)
        async def async_wrapper(query: str, *args, **kwargs):
            # Check cache first
            cached_result = cache_layer.get_cached_result(query, kwargs)
            if cached_result:
                return cached_result
            
            # Execute function
            result = await func(query, *args, **kwargs)
            
            # Cache result
            cache_layer.cache_result(query, result, kwargs, ttl)
            
            return result
        
        @wraps(func)
        def sync_wrapper(query: str, *args, **kwargs):
            # Check cache first
            cached_result = cache_layer.get_cached_result(query, kwargs)
            if cached_result:
                return cached_result
            
            # Execute function
            result = func(query, *args, **kwargs)
            
            # Cache result
            cache_layer.cache_result(query, result, kwargs, ttl)
            
            return result
        
        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    return decorator

# Usage example
cache = RAGCacheLayer()

@cached_rag_query(cache, ttl=3600)
def search_documents(query: str, k: int = 10):
    # Your RAG search implementation
    return {"results": ["doc1", "doc2"], "query": query}
\`\`\`

## Live Demo: Performance Testing

<iframe src="https://codesandbox.io/embed/rag-performance-testing-demo-forked-xyz123?fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="RAG Performance Testing Demo"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

## Performance Monitoring Dashboard

\`\`\`python
import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime, timedelta
import pandas as pd

class RAGPerformanceDashboard:
    def __init__(self, cache_layer, search_engine):
        self.cache = cache_layer
        self.search_engine = search_engine
        
    def create_dashboard(self):
        st.set_page_config(
            page_title="RAG Performance Dashboard",
            layout="wide"
        )
        
        st.title("RAG System Performance Dashboard")
        
        # Metrics row
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            cache_stats = self.cache.get_cache_stats()
            st.metric(
                "Cache Hit Rate",
                f"{cache_stats['hit_rate']:.1%}",
                delta=f"+{cache_stats['hit_rate'] - 0.5:.1%}"
            )
        
        with col2:
            st.metric(
                "Avg Query Latency",
                "145ms",
                delta="-23ms"
            )
        
        with col3:
            st.metric(
                "Queries/Second",
                "52.3",
                delta="+5.2"
            )
        
        with col4:
            st.metric(
                "Active Users",
                "1,234",
                delta="+123"
            )
        
        # Charts
        col1, col2 = st.columns(2)
        
        with col1:
            self.plot_latency_distribution()
        
        with col2:
            self.plot_cache_performance()
        
        # Query analysis
        st.subheader("Query Analysis")
        self.show_query_analysis()
        
        # Real-time monitoring
        st.subheader("Real-time Performance")
        self.show_realtime_metrics()
    
    def plot_latency_distribution(self):
        # Simulated data
        data = pd.DataFrame({
            'component': ['Embedding', 'Vector Search', 'BM25', 'Reranking', 'Generation'],
            'latency': [25, 35, 15, 40, 30]
        })
        
        fig = px.bar(
            data,
            x='component',
            y='latency',
            title='Latency by Component',
            color='latency',
            color_continuous_scale='RdYlGn_r'
        )
        
        st.plotly_chart(fig, use_container_width=True)
    
    def plot_cache_performance(self):
        # Simulated time series data
        times = pd.date_range(
            start=datetime.now() - timedelta(hours=24),
            end=datetime.now(),
            freq='H'
        )
        
        hit_rates = [0.7 + 0.2 * np.sin(i/4) + np.random.normal(0, 0.05) for i in range(len(times))]
        
        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=times,
            y=hit_rates,
            mode='lines+markers',
            name='Cache Hit Rate',
            line=dict(color='green', width=2)
        ))
        
        fig.update_layout(
            title='Cache Hit Rate (24h)',
            yaxis_tickformat='.0%',
            hovermode='x unified'
        )
        
        st.plotly_chart(fig, use_container_width=True)
    
    def show_query_analysis(self):
        cache_stats = self.cache.get_cache_stats()
        
        # Top queries table
        df = pd.DataFrame(
            cache_stats['top_queries'],
            columns=['Query', 'Frequency']
        )
        
        st.dataframe(
            df.style.highlight_max(axis=0),
            use_container_width=True
        )
    
    def show_realtime_metrics(self):
        placeholder = st.empty()
        
        # Simulate real-time updates
        for i in range(10):
            with placeholder.container():
                metric_col1, metric_col2, metric_col3 = st.columns(3)
                
                with metric_col1:
                    st.metric(
                        "Current QPS",
                        f"{50 + np.random.randint(-5, 5)}",
                        delta=f"{np.random.randint(-2, 3)}"
                    )
                
                with metric_col2:
                    st.metric(
                        "P95 Latency",
                        f"{180 + np.random.randint(-20, 20)}ms",
                        delta=f"{np.random.randint(-10, 10)}ms"
                    )
                
                with metric_col3:
                    st.metric(
                        "Error Rate",
                        f"{0.1 + np.random.random() * 0.05:.2%}",
                        delta=f"{np.random.random() * 0.02:.2%}"
                    )
            
            time.sleep(1)

# Usage
if __name__ == "__main__":
    cache = RAGCacheLayer()
    search_engine = HybridSearchEngine()
    dashboard = RAGPerformanceDashboard(cache, search_engine)
    dashboard.create_dashboard()
\`\`\`

## Best Practices Samenvatting

### 1. Query Optimization
- Implementeer altijd hybrid search (semantic + keyword)
- Gebruik re-ranking voor top resultaten
- Optimaliseer alpha parameter per use case
- Cache frequent queries agressief

### 2. Embedding Strategy
- Start met open-source modellen voor prototyping
- Overweeg OpenAI text-embedding-3-small voor productie
- Benchmark altijd op je eigen data
- Cache embeddings voor hergebruik

### 3. Chunk Optimization
- Test verschillende chunk sizes (256-1024 tokens)
- Gebruik overlap voor context continuïteit
- Voeg metadata toe voor betere filtering
- Overweeg semantic chunking voor complexe documenten

### 4. Caching Best Practices
- Implementeer multi-level caching (query, embedding, result)
- Gebruik intelligente TTL strategieën
- Monitor cache hit rates continue
- Implementeer cache warming voor populaire queries

### 5. Performance Monitoring
- Track alle componenten afzonderlijk
- Stel alerts in voor performance degradatie
- Analyseer query patterns voor optimalisatie
- A/B test verschillende configuraties`,
  codeExamples: [
    {
      id: 'hybrid-search-api',
      title: 'Complete Hybrid Search API',
      language: 'python',
      code: `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import asyncio
import time

app = FastAPI()

class SearchRequest(BaseModel):
    query: str
    k: int = 10
    alpha: float = 0.7
    use_reranking: bool = True
    filters: Optional[dict] = None

class SearchResponse(BaseModel):
    results: List[dict]
    search_time_ms: float
    cache_hit: bool
    query_id: str

# Initialize components
search_engine = AdvancedHybridSearch()
cache_layer = RAGCacheLayer()

@app.post("/api/search", response_model=SearchResponse)
async def hybrid_search(request: SearchRequest):
    """
    Production-ready hybrid search endpoint with caching
    """
    start_time = time.time()
    
    # Check cache first
    cache_key_params = {
        "k": request.k,
        "alpha": request.alpha,
        "use_reranking": request.use_reranking,
        "filters": request.filters
    }
    
    cached_result = cache_layer.get_cached_result(
        request.query,
        cache_key_params
    )
    
    if cached_result:
        return SearchResponse(
            results=cached_result["results"],
            search_time_ms=(time.time() - start_time) * 1000,
            cache_hit=True,
            query_id=cached_result.get("query_id", "")
        )
    
    # Perform search
    try:
        if request.use_reranking:
            results = await asyncio.to_thread(
                search_engine.search_with_reranking,
                request.query,
                k=request.k,
                alpha=request.alpha
            )
        else:
            results = await asyncio.to_thread(
                search_engine.hybrid_search,
                request.query,
                k=request.k,
                alpha=request.alpha
            )
        
        # Apply filters if provided
        if request.filters:
            results = apply_filters(results, request.filters)
        
        # Cache the results
        query_id = generate_query_id()
        cache_data = {
            "results": results,
            "query_id": query_id,
            "timestamp": time.time()
        }
        
        cache_layer.cache_result(
            request.query,
            cache_data,
            cache_key_params,
            ttl=3600  # 1 hour TTL
        )
        
        search_time = (time.time() - start_time) * 1000
        
        return SearchResponse(
            results=results,
            search_time_ms=search_time,
            cache_hit=False,
            query_id=query_id
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Search failed: {str(e)}"
        )

@app.get("/api/performance/stats")
async def get_performance_stats():
    """Get real-time performance statistics"""
    cache_stats = cache_layer.get_cache_stats()
    
    return {
        "cache": cache_stats,
        "search_engine": {
            "total_documents": len(search_engine.documents),
            "embedding_model": search_engine.encoder.device.type,
            "index_size_mb": get_index_size_mb()
        },
        "system": {
            "cpu_percent": psutil.cpu_percent(),
            "memory_percent": psutil.virtual_memory().percent,
            "uptime_hours": get_uptime_hours()
        }
    }

@app.post("/api/optimize/chunk-size")
async def optimize_chunk_size(
    documents: List[str],
    test_queries: List[str]
):
    """Test and recommend optimal chunk size"""
    optimizer = ChunkOptimizer()
    
    results_df = await asyncio.to_thread(
        optimizer.test_chunk_sizes,
        documents,
        test_queries,
        search_engine
    )
    
    # Find optimal configuration
    best_config = results_df.loc[results_df['F1 Score'].idxmax()]
    
    return {
        "recommendation": {
            "chunk_size": int(best_config['Chunk Size']),
            "overlap": int(best_config['Overlap']),
            "method": best_config['Strategy'].split('_')[0]
        },
        "test_results": results_df.to_dict('records'),
        "performance_gain": {
            "f1_improvement": float(best_config['F1 Score'] - results_df['F1 Score'].mean()),
            "latency_reduction": float(results_df['Avg Search Time (ms)'].mean() - best_config['Avg Search Time (ms)'])
        }
    }`
    },
    {
      id: 'performance-monitoring',
      title: 'Real-time Performance Monitoring',
      language: 'typescript',
      code: `import { useEffect, useState, useRef } from 'react'
import { Line, Bar } from 'react-chartjs-2'
import { io, Socket } from 'socket.io-client'

interface PerformanceMetrics {
  timestamp: number
  queryLatency: number
  cacheHitRate: number
  qps: number
  errorRate: number
  activeUsers: number
}

interface ComponentLatency {
  embedding: number
  vectorSearch: number
  bm25: number
  reranking: number
  generation: number
}

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([])
  const [componentLatency, setComponentLatency] = useState<ComponentLatency | null>(null)
  const [alerts, setAlerts] = useState<string[]>([])
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Connect to monitoring WebSocket
    socketRef.current = io('/performance', {
      transports: ['websocket']
    })

    socketRef.current.on('metrics', (data: PerformanceMetrics) => {
      setMetrics(prev => {
        const updated = [...prev, data]
        // Keep last 100 data points
        return updated.slice(-100)
      })

      // Check for performance alerts
      checkPerformanceAlerts(data)
    })

    socketRef.current.on('component-latency', (data: ComponentLatency) => {
      setComponentLatency(data)
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [])

  const checkPerformanceAlerts = (data: PerformanceMetrics) => {
    const newAlerts: string[] = []

    if (data.queryLatency > 500) {
      newAlerts.push(\`High query latency: \${data.queryLatency}ms\`)
    }

    if (data.cacheHitRate < 0.5) {
      newAlerts.push(\`Low cache hit rate: \${(data.cacheHitRate * 100).toFixed(1)}%\`)
    }

    if (data.errorRate > 0.05) {
      newAlerts.push(\`High error rate: \${(data.errorRate * 100).toFixed(1)}%\`)
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 10))
    }
  }

  // Chart data preparation
  const latencyChartData = {
    labels: metrics.map(m => new Date(m.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Query Latency (ms)',
        data: metrics.map(m => m.queryLatency),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Target (200ms)',
        data: metrics.map(() => 200),
        borderColor: 'rgb(255, 99, 132)',
        borderDash: [5, 5]
      }
    ]
  }

  const cacheHitChartData = {
    labels: metrics.map(m => new Date(m.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Cache Hit Rate',
        data: metrics.map(m => m.cacheHitRate * 100),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgb(75, 192, 192)',
        fill: true
      }
    ]
  }

  const componentLatencyData = componentLatency ? {
    labels: Object.keys(componentLatency),
    datasets: [{
      label: 'Latency (ms)',
      data: Object.values(componentLatency),
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)'
      ]
    }]
  } : null

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">RAG Performance Dashboard</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Avg Latency"
          value={metrics.length > 0 ? 
            \`\${Math.round(metrics[metrics.length - 1].queryLatency)}ms\` : '-'}
          trend={calculateTrend(metrics, 'queryLatency')}
          status={metrics[metrics.length - 1]?.queryLatency < 200 ? 'good' : 'warning'}
        />
        <MetricCard
          title="Cache Hit Rate"
          value={metrics.length > 0 ?
            \`\${(metrics[metrics.length - 1].cacheHitRate * 100).toFixed(1)}%\` : '-'}
          trend={calculateTrend(metrics, 'cacheHitRate')}
          status={metrics[metrics.length - 1]?.cacheHitRate > 0.7 ? 'good' : 'warning'}
        />
        <MetricCard
          title="QPS"
          value={metrics.length > 0 ?
            metrics[metrics.length - 1].qps.toFixed(1) : '-'}
          trend={calculateTrend(metrics, 'qps')}
        />
        <MetricCard
          title="Active Users"
          value={metrics.length > 0 ?
            metrics[metrics.length - 1].activeUsers.toString() : '-'}
          trend={calculateTrend(metrics, 'activeUsers')}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Query Latency Trend</h3>
          <Line data={latencyChartData} options={{
            responsive: true,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }} />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Cache Performance</h3>
          <Line data={cacheHitChartData} options={{
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                max: 100
              }
            }
          }} />
        </div>
      </div>

      {/* Component Breakdown */}
      {componentLatencyData && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Component Latency Breakdown</h3>
          <Bar data={componentLatencyData} options={{
            responsive: true,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }} />
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-red-800">Performance Alerts</h3>
          <ul className="space-y-1">
            {alerts.map((alert, idx) => (
              <li key={idx} className="text-sm text-red-700">
                • {alert}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function MetricCard({ 
  title, 
  value, 
  trend, 
  status = 'neutral' 
}: {
  title: string
  value: string
  trend: number
  status?: 'good' | 'warning' | 'neutral'
}) {
  const statusColors = {
    good: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    neutral: 'bg-gray-100 text-gray-800'
  }

  return (
    <div className={\`p-4 rounded-lg \${statusColors[status]}\`}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <p className={\`text-sm mt-1 \${trend > 0 ? 'text-green-600' : 'text-red-600'}\`}>
        {trend > 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
      </p>
    </div>
  )
}

function calculateTrend(metrics: PerformanceMetrics[], field: keyof PerformanceMetrics): number {
  if (metrics.length < 2) return 0
  
  const recent = metrics.slice(-10)
  const older = metrics.slice(-20, -10)
  
  if (older.length === 0) return 0
  
  const recentAvg = recent.reduce((sum, m) => sum + (m[field] as number), 0) / recent.length
  const olderAvg = older.reduce((sum, m) => sum + (m[field] as number), 0) / older.length
  
  return ((recentAvg - olderAvg) / olderAvg) * 100
}`
    },
    {
      id: 'embedding-benchmark',
      title: 'Embedding Model Benchmark Tool',
      language: 'python',
      code: `import asyncio
import numpy as np
from typing import Dict, List, Tuple
import time
from dataclasses import dataclass
from concurrent.futures import ThreadPoolExecutor
import matplotlib.pyplot as plt
import seaborn as sns

@dataclass
class BenchmarkResult:
    model_name: str
    avg_latency_ms: float
    throughput_rps: float
    memory_usage_mb: float
    accuracy_score: float
    cost_per_million: float

class EmbeddingBenchmarkTool:
    def __init__(self):
        self.models = {
            "openai/text-embedding-3-small": {
                "loader": self.load_openai_model,
                "dimension": 1536,
                "batch_size": 2048
            },
            "openai/text-embedding-3-large": {
                "loader": self.load_openai_model,
                "dimension": 3072,
                "batch_size": 2048
            },
            "BAAI/bge-large-en-v1.5": {
                "loader": self.load_sentence_transformer,
                "dimension": 1024,
                "batch_size": 32
            },
            "intfloat/e5-large-v2": {
                "loader": self.load_sentence_transformer,
                "dimension": 1024,
                "batch_size": 32
            },
            "hkunlp/instructor-xl": {
                "loader": self.load_instructor,
                "dimension": 768,
                "batch_size": 16
            }
        }
        
        self.test_data = self.load_test_dataset()
    
    async def run_comprehensive_benchmark(
        self,
        test_queries: List[str],
        test_documents: List[str],
        ground_truth: List[Tuple[int, int]]  # Query-doc relevance pairs
    ) -> Dict[str, BenchmarkResult]:
        """Run comprehensive benchmark on all models"""
        results = {}
        
        for model_name, config in self.models.items():
            print(f"\\nBenchmarking {model_name}...")
            
            try:
                # Load model
                model = await config["loader"](model_name)
                
                # Measure performance
                latency = await self.measure_latency(model, test_queries[:100])
                throughput = await self.measure_throughput(model, test_queries)
                memory = self.measure_memory_usage(model)
                accuracy = await self.measure_accuracy(
                    model, 
                    test_queries, 
                    test_documents,
                    ground_truth
                )
                cost = self.calculate_cost(model_name, len(test_queries))
                
                results[model_name] = BenchmarkResult(
                    model_name=model_name,
                    avg_latency_ms=latency,
                    throughput_rps=throughput,
                    memory_usage_mb=memory,
                    accuracy_score=accuracy,
                    cost_per_million=cost
                )
                
            except Exception as e:
                print(f"Failed to benchmark {model_name}: {e}")
        
        return results
    
    async def measure_latency(
        self,
        model,
        queries: List[str]
    ) -> float:
        """Measure average embedding latency"""
        latencies = []
        
        for query in queries:
            start = time.time()
            _ = await self.encode_async(model, [query])
            latencies.append((time.time() - start) * 1000)
        
        return np.mean(latencies)
    
    async def measure_throughput(
        self,
        model,
        queries: List[str],
        duration_seconds: int = 10
    ) -> float:
        """Measure requests per second"""
        start_time = time.time()
        completed = 0
        
        with ThreadPoolExecutor(max_workers=4) as executor:
            futures = []
            
            while time.time() - start_time < duration_seconds:
                for i in range(0, len(queries), 10):
                    batch = queries[i:i+10]
                    future = executor.submit(
                        asyncio.run,
                        self.encode_async(model, batch)
                    )
                    futures.append(future)
                    
                    if time.time() - start_time >= duration_seconds:
                        break
            
            # Wait for completion
            for future in futures:
                try:
                    future.result(timeout=1)
                    completed += 10
                except:
                    pass
        
        return completed / duration_seconds
    
    async def measure_accuracy(
        self,
        model,
        queries: List[str],
        documents: List[str],
        ground_truth: List[Tuple[int, int]]
    ) -> float:
        """Measure retrieval accuracy using ground truth"""
        # Encode all documents
        doc_embeddings = await self.encode_async(model, documents)
        doc_embeddings = np.array(doc_embeddings)
        
        correct_top1 = 0
        correct_top5 = 0
        
        for query_idx, relevant_doc_idx in ground_truth:
            # Encode query
            query_embedding = await self.encode_async(
                model, 
                [queries[query_idx]]
            )
            query_embedding = np.array(query_embedding).squeeze()
            
            # Calculate similarities
            similarities = np.dot(doc_embeddings, query_embedding)
            top_indices = np.argsort(similarities)[::-1]
            
            if top_indices[0] == relevant_doc_idx:
                correct_top1 += 1
            if relevant_doc_idx in top_indices[:5]:
                correct_top5 += 1
        
        accuracy = (correct_top1 + 0.5 * correct_top5) / len(ground_truth)
        return accuracy
    
    def visualize_results(
        self,
        results: Dict[str, BenchmarkResult]
    ):
        """Create comprehensive visualization of benchmark results"""
        fig, axes = plt.subplots(2, 3, figsize=(15, 10))
        fig.suptitle("Embedding Model Benchmark Results", fontsize=16)
        
        models = list(results.keys())
        
        # 1. Latency comparison
        ax = axes[0, 0]
        latencies = [r.avg_latency_ms for r in results.values()]
        ax.bar(range(len(models)), latencies)
        ax.set_xticks(range(len(models)))
        ax.set_xticklabels([m.split('/')[-1] for m in models], rotation=45)
        ax.set_ylabel("Avg Latency (ms)")
        ax.set_title("Embedding Latency")
        
        # 2. Throughput comparison
        ax = axes[0, 1]
        throughputs = [r.throughput_rps for r in results.values()]
        ax.bar(range(len(models)), throughputs, color='green')
        ax.set_xticks(range(len(models)))
        ax.set_xticklabels([m.split('/')[-1] for m in models], rotation=45)
        ax.set_ylabel("Requests/Second")
        ax.set_title("Throughput")
        
        # 3. Accuracy comparison
        ax = axes[0, 2]
        accuracies = [r.accuracy_score for r in results.values()]
        ax.bar(range(len(models)), accuracies, color='orange')
        ax.set_xticks(range(len(models)))
        ax.set_xticklabels([m.split('/')[-1] for m in models], rotation=45)
        ax.set_ylabel("Accuracy Score")
        ax.set_title("Retrieval Accuracy")
        
        # 4. Cost comparison
        ax = axes[1, 0]
        costs = [r.cost_per_million for r in results.values()]
        ax.bar(range(len(models)), costs, color='red')
        ax.set_xticks(range(len(models)))
        ax.set_xticklabels([m.split('/')[-1] for m in models], rotation=45)
        ax.set_ylabel("Cost per 1M tokens ($)")
        ax.set_title("Cost Analysis")
        
        # 5. Performance vs Cost scatter
        ax = axes[1, 1]
        for model, result in results.items():
            ax.scatter(
                result.cost_per_million,
                result.accuracy_score,
                s=100,
                label=model.split('/')[-1]
            )
        ax.set_xlabel("Cost per 1M tokens ($)")
        ax.set_ylabel("Accuracy Score")
        ax.set_title("Cost-Performance Trade-off")
        ax.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
        
        # 6. Overall scores (normalized)
        ax = axes[1, 2]
        overall_scores = []
        for result in results.values():
            # Normalize and combine metrics
            norm_accuracy = result.accuracy_score
            norm_latency = 1 - (result.avg_latency_ms / max(latencies))
            norm_cost = 1 - (result.cost_per_million / max(costs))
            overall = (norm_accuracy * 0.5 + norm_latency * 0.3 + norm_cost * 0.2)
            overall_scores.append(overall)
        
        ax.bar(range(len(models)), overall_scores, color='purple')
        ax.set_xticks(range(len(models)))
        ax.set_xticklabels([m.split('/')[-1] for m in models], rotation=45)
        ax.set_ylabel("Overall Score")
        ax.set_title("Combined Performance Score")
        
        plt.tight_layout()
        return fig

# Usage example
async def main():
    benchmark = EmbeddingBenchmarkTool()
    
    # Load test data
    test_queries = ["What is RAG?", "How does semantic search work?"] * 50
    test_documents = ["RAG combines retrieval...", "Semantic search uses..."] * 100
    ground_truth = [(0, 0), (1, 1)] * 50
    
    # Run benchmark
    results = await benchmark.run_comprehensive_benchmark(
        test_queries,
        test_documents,
        ground_truth
    )
    
    # Print results
    for model, result in results.items():
        print(f"\\n{model}:")
        print(f"  Latency: {result.avg_latency_ms:.2f}ms")
        print(f"  Throughput: {result.throughput_rps:.1f} req/s")
        print(f"  Accuracy: {result.accuracy_score:.3f}")
        print(f"  Cost: $\\{result.cost_per_million:.4f\\}/1M tokens")
    
    # Visualize
    fig = benchmark.visualize_results(results)
    fig.savefig("embedding_benchmark_results.png", dpi=300)

if __name__ == "__main__":
    asyncio.run(main())`
    }
  ],
  assignments: [
    {
      id: 'assignment-1',
      title: 'Build a High-Performance RAG System',
      type: 'project',
      difficulty: 'expert',
      description: `Ontwikkel een production-ready RAG systeem met focus op performance optimalisatie:

1. **Hybrid Search Implementation**
   - Implementeer semantic + keyword search
   - Configureerbare alpha parameter
   - Cross-encoder re-ranking
   - Query expansion technieken

2. **Intelligent Caching**
   - Multi-level cache (query, embedding, result)
   - Redis implementation met TTL strategies
   - Cache warming voor populaire queries
   - Hit rate monitoring en analytics

3. **Performance Benchmarking**
   - Test verschillende embedding modellen
   - Benchmark chunk sizes (256, 512, 1024 tokens)
   - Measure end-to-end latency
   - A/B testing framework

4. **Monitoring Dashboard**
   - Real-time performance metrics
   - Component-level latency tracking
   - Alert system voor degradatie
   - Historical performance trends

5. **Load Testing**
   - Simuleer 1000+ concurrent users
   - Identify bottlenecks
   - Auto-scaling strategies
   - Performance onder stress

Deliverables:
- Complete FastAPI backend
- Performance dashboard (Streamlit/Grafana)
- Benchmark rapport met aanbevelingen
- Deployment guide met best practices`,
      hints: [
        'Gebruik asyncio voor concurrent processing',
        'Implementeer connection pooling voor databases',
        'Overweeg GPU acceleration voor embeddings',
        'Profile code met cProfile en memory_profiler',
        'Gebruik load balancing voor horizontal scaling'
      ]
    },
    {
      id: 'assignment-2',
      title: 'Optimize Enterprise RAG Pipeline',
      type: 'project',
      difficulty: 'expert',
      description: `Optimaliseer een bestaande enterprise RAG pipeline voor 10x betere performance:

1. **Query Optimization**
   - Implement query caching met Redis
   - Parallel retrieval strategies
   - Batch processing voor bulk queries
   - Smart query routing

2. **Embedding Optimization**
   - Benchmark 5+ embedding modellen
   - Implement embedding cache
   - Quantization voor memory efficiency
   - GPU batching strategies

3. **Infrastructure Optimization**
   - Kubernetes deployment met auto-scaling
   - CDN voor static content
   - Database query optimization
   - Connection pooling

4. **Cost Optimization**
   - Analyze cost per query
   - Implement tiered caching
   - Optimize API calls
   - Resource utilization monitoring

Requirements:
- Handle 10,000+ queries/minute
- P95 latency < 200ms
- 99.9% uptime SLA
- Cost reduction van 50%+`,
      hints: [
        'Profile eerst om bottlenecks te identificeren',
        'Gebruik horizontal scaling voor vector stores',
        'Implementeer circuit breakers voor resilience',
        'Monitor alles met Prometheus/Grafana',
        'Overweeg edge caching voor global deployment'
      ]
    }
  ],
  resources: [
    {
      title: 'High Performance RAG Systems',
      url: 'https://arxiv.org/abs/2024.rag-performance',
      type: 'paper'
    },
    {
      title: 'Vector Database Benchmarks',
      url: 'https://ann-benchmarks.com/',
      type: 'benchmark'
    },
    {
      title: 'Redis for ML Caching',
      url: 'https://redis.io/docs/stack/vector/',
      type: 'documentation'
    },
    {
      title: 'MTEB Leaderboard - Embedding Models',
      url: 'https://huggingface.co/spaces/mteb/leaderboard',
      type: 'benchmark'
    },
    {
      title: 'Production RAG Best Practices',
      url: 'https://www.anyscale.com/blog/a-comprehensive-guide-for-building-rag-based-llm-applications',
      type: 'guide'
    }
  ]
}