import { Lesson } from '@/lib/data/courses'

export const lesson2_4: Lesson = {
  id: 'lesson-2-4',
  title: 'Advanced retrieval strategies: Hybrid search en re-ranking',
  duration: '40 min',
  content: `# Advanced retrieval strategies: Hybrid search en re-ranking

## Van simpele similarity search naar productie-klare retrieval

Basic similarity search is vaak niet voldoende voor productie-omgevingen. Gebruikers zoeken op verschillende manieren, embeddings missen soms belangrijke keywords, en niet alle gevonden resultaten zijn even relevant. In deze les leren we geavanceerde retrieval strategieën die de kwaliteit van je RAG systeem significant verbeteren.

## Hybrid Search: Het beste van twee werelden

### Waarom hybrid search?

Semantic search (met embeddings) en keyword search (zoals BM25) hebben elk hun sterke punten:

- **Semantic search**: Begrijpt context en synoniemen
- **Keyword search**: Precies voor specifieke termen, acroniemen en codes

Door beide te combineren krijg je robuustere retrieval.

### Implementatie met dense + sparse vectors

\`\`\`python
from typing import List, Tuple
import numpy as np
from rank_bm25 import BM25Okapi
from sentence_transformers import SentenceTransformer

class HybridSearcher:
    def __init__(self, documents: List[str]):
        self.documents = documents
        
        # Semantic search setup
        self.embedder = SentenceTransformer('all-MiniLM-L6-v2')
        self.embeddings = self.embedder.encode(documents)
        
        # Keyword search setup
        tokenized_docs = [doc.lower().split() for doc in documents]
        self.bm25 = BM25Okapi(tokenized_docs)
    
    def search(self, query: str, k: int = 10, 
               semantic_weight: float = 0.5) -> List[Tuple[int, float]]:
        """
        Hybrid search met instelbare weights
        """
        # Semantic search
        query_embedding = self.embedder.encode([query])[0]
        semantic_scores = np.dot(self.embeddings, query_embedding)
        
        # Normalize scores to [0, 1]
        semantic_scores = (semantic_scores - semantic_scores.min()) / \
                         (semantic_scores.max() - semantic_scores.min())
        
        # Keyword search
        tokenized_query = query.lower().split()
        keyword_scores = self.bm25.get_scores(tokenized_query)
        
        # Normalize BM25 scores
        if keyword_scores.max() > 0:
            keyword_scores = keyword_scores / keyword_scores.max()
        
        # Combine scores
        hybrid_scores = (semantic_weight * semantic_scores + 
                        (1 - semantic_weight) * keyword_scores)
        
        # Get top-k results
        top_indices = np.argsort(hybrid_scores)[::-1][:k]
        
        return [(idx, hybrid_scores[idx]) for idx in top_indices]
\`\`\`

### Reciprocal Rank Fusion (RRF)

Een alternatieve methode om rankings te combineren zonder weights te tunen:

\`\`\`python
def reciprocal_rank_fusion(
    rankings: List[List[int]], 
    k: int = 60
) -> List[Tuple[int, float]]:
    """
    Combineert multiple rankings met RRF
    
    Args:
        rankings: List van rankings (elk een lijst van document IDs)
        k: Constante voor rank berekening (default 60)
    """
    rrf_scores = {}
    
    for ranking in rankings:
        for rank, doc_id in enumerate(ranking):
            if doc_id not in rrf_scores:
                rrf_scores[doc_id] = 0
            # RRF formula: 1 / (k + rank)
            rrf_scores[doc_id] += 1 / (k + rank + 1)
    
    # Sorteer op RRF score
    sorted_docs = sorted(
        rrf_scores.items(), 
        key=lambda x: x[1], 
        reverse=True
    )
    
    return sorted_docs
\`\`\`

## Re-ranking voor precisie

### Cross-encoder models

Cross-encoders scoren query-document pairs direct voor betere relevantie:

\`\`\`python
from sentence_transformers import CrossEncoder

class ReRanker:
    def __init__(self, model_name='cross-encoder/ms-marco-MiniLM-L-6-v2'):
        self.cross_encoder = CrossEncoder(model_name)
    
    def rerank(self, query: str, documents: List[str], 
               top_k: int = 10) -> List[Tuple[str, float]]:
        """
        Re-rank documents met cross-encoder
        """
        # Maak query-document pairs
        pairs = [[query, doc] for doc in documents]
        
        # Score alle pairs
        scores = self.cross_encoder.predict(pairs)
        
        # Sorteer op score
        doc_scores = list(zip(documents, scores))
        doc_scores.sort(key=lambda x: x[1], reverse=True)
        
        return doc_scores[:top_k]

# Gebruik in pipeline
def advanced_search_pipeline(query: str, documents: List[str]):
    # Stap 1: Hybrid search voor initial retrieval
    hybrid_searcher = HybridSearcher(documents)
    initial_results = hybrid_searcher.search(query, k=50)
    
    # Stap 2: Re-rank top resultaten
    candidate_docs = [documents[idx] for idx, _ in initial_results[:50]]
    reranker = ReRanker()
    final_results = reranker.rerank(query, candidate_docs, top_k=10)
    
    return final_results
\`\`\`

### Maximum Marginal Relevance (MMR)

Voorkom redundantie in resultaten:

\`\`\`python
def mmr_rerank(
    query_embedding: np.ndarray,
    doc_embeddings: np.ndarray,
    lambda_param: float = 0.5,
    k: int = 10
) -> List[int]:
    """
    Maximum Marginal Relevance voor diverse resultaten
    """
    # Bereken similarities met query
    similarities = np.dot(doc_embeddings, query_embedding)
    
    # Initialize
    selected_indices = []
    remaining_indices = list(range(len(doc_embeddings)))
    
    # Selecteer eerste document (hoogste similarity)
    best_idx = np.argmax(similarities)
    selected_indices.append(best_idx)
    remaining_indices.remove(best_idx)
    
    # Iteratief selecteer volgende documenten
    while len(selected_indices) < k and remaining_indices:
        mmr_scores = []
        
        for idx in remaining_indices:
            # Relevance score
            relevance = similarities[idx]
            
            # Diversity score (max similarity met al geselecteerde docs)
            selected_embeddings = doc_embeddings[selected_indices]
            diversity_scores = np.dot(selected_embeddings, doc_embeddings[idx])
            max_similarity = np.max(diversity_scores)
            
            # MMR score
            mmr = lambda_param * relevance - (1 - lambda_param) * max_similarity
            mmr_scores.append(mmr)
        
        # Selecteer document met hoogste MMR
        best_mmr_idx = remaining_indices[np.argmax(mmr_scores)]
        selected_indices.append(best_mmr_idx)
        remaining_indices.remove(best_mmr_idx)
    
    return selected_indices
\`\`\`

### Lost in the Middle probleem

LLMs presteren vaak slechter met informatie in het midden van lange contexten:

\`\`\`python
def reorder_for_llm(documents: List[str], scores: List[float]) -> List[str]:
    """
    Herorden documenten om 'lost in the middle' te voorkomen
    
    Plaats belangrijkste docs aan begin en eind
    """
    # Sorteer op score
    doc_score_pairs = sorted(
        zip(documents, scores), 
        key=lambda x: x[1], 
        reverse=True
    )
    
    sorted_docs = [doc for doc, _ in doc_score_pairs]
    
    # Herverdeel: beste docs aan begin en eind
    n = len(sorted_docs)
    reordered = []
    
    for i in range(n):
        if i % 2 == 0:
            # Even indices: neem van begin
            reordered.append(sorted_docs[i // 2])
        else:
            # Oneven indices: neem van eind
            reordered.append(sorted_docs[n - 1 - i // 2])
    
    return reordered
\`\`\`

## Query Expansion en Refinement

### Multi-query retrieval

Genereer variaties van de query voor betere coverage:

\`\`\`python
class QueryExpander:
    def __init__(self, llm_client):
        self.llm = llm_client
    
    def generate_queries(self, original_query: str, n: int = 3) -> List[str]:
        """
        Genereer query variaties met LLM
        """
        prompt = f"""
        Gegeven de vraag: "{original_query}"
        
        Genereer {n} alternatieve formuleringen die:
        1. Dezelfde informatiebehoefte uitdrukken
        2. Verschillende keywords of synoniemen gebruiken
        3. Vanuit verschillende perspectieven benaderen
        
        Formaat: één query per regel
        """
        
        response = self.llm.generate(prompt)
        queries = [original_query] + response.strip().split('\\n')
        
        return queries[:n+1]
    
    def multi_query_search(self, query: str, searcher, k: int = 10):
        """
        Zoek met multiple query variaties
        """
        # Genereer query variaties
        queries = self.generate_queries(query)
        
        # Verzamel resultaten per query
        all_results = []
        for q in queries:
            results = searcher.search(q, k=k*2)
            all_results.append([doc_id for doc_id, _ in results])
        
        # Combineer met RRF
        combined = reciprocal_rank_fusion(all_results)
        
        return combined[:k]
\`\`\`

### Query decomposition

Breek complexe queries op in deelvragen:

\`\`\`python
def decompose_query(query: str, llm_client) -> List[str]:
    """
    Decompositie van complexe queries
    """
    prompt = f"""
    Analyseer deze complexe vraag: "{query}"
    
    Breek de vraag op in simpelere deelvragen die:
    1. Elk één specifiek aspect behandelen
    2. Samen het complete antwoord vormen
    3. Onafhankelijk beantwoord kunnen worden
    
    Formaat: één deelvraag per regel
    """
    
    response = llm_client.generate(prompt)
    sub_queries = response.strip().split('\\n')
    
    return sub_queries
\`\`\`

## Contextual Compression

Reduceer ruis door alleen relevante delen te selecteren:

\`\`\`python
class ContextualCompressor:
    def __init__(self, llm_client):
        self.llm = llm_client
    
    def compress(self, query: str, document: str, 
                 max_length: int = 500) -> str:
        """
        Extract alleen relevante passages
        """
        prompt = f"""
        Document: {document}
        
        Vraag: {query}
        
        Extract alleen de passages die direct relevant zijn voor de vraag.
        Behoud belangrijke context maar verwijder irrelevante informatie.
        Maximum lengte: {max_length} woorden.
        """
        
        compressed = self.llm.generate(prompt)
        return compressed
    
    def compress_results(self, query: str, documents: List[str]) -> List[str]:
        """
        Comprimeer alle search results
        """
        compressed_docs = []
        
        for doc in documents:
            # Skip als document al kort genoeg is
            if len(doc.split()) <= 200:
                compressed_docs.append(doc)
            else:
                compressed = self.compress(query, doc)
                compressed_docs.append(compressed)
        
        return compressed_docs
\`\`\`

## Performance vs Accuracy Trade-offs

### Cascade retrieval strategy

Balanceer snelheid en kwaliteit:

\`\`\`python
class CascadeRetriever:
    def __init__(self, fast_model: str, accurate_model: str):
        self.fast_embedder = SentenceTransformer(fast_model)
        self.reranker = CrossEncoder(accurate_model)
        
    def retrieve(self, query: str, documents: List[str], 
                 final_k: int = 10, cascade_factor: int = 5):
        """
        Cascade: snel model → veel candidates → accuraat model → top-k
        """
        # Fase 1: Snelle retrieval (veel candidates)
        query_emb = self.fast_embedder.encode([query])[0]
        doc_embs = self.fast_embedder.encode(documents)
        
        scores = np.dot(doc_embs, query_emb)
        top_indices = np.argsort(scores)[::-1][:final_k * cascade_factor]
        
        # Fase 2: Accurate re-ranking (alleen top candidates)
        candidates = [documents[i] for i in top_indices]
        pairs = [[query, doc] for doc in candidates]
        rerank_scores = self.reranker.predict(pairs)
        
        # Sorteer en return top-k
        final_results = sorted(
            zip(candidates, rerank_scores),
            key=lambda x: x[1],
            reverse=True
        )[:final_k]
        
        return final_results
\`\`\`

## A/B Testing retrieval kwaliteit

### Metrics implementatie

\`\`\`python
from typing import Dict, List
import numpy as np

class RetrievalEvaluator:
    def __init__(self):
        self.metrics = {}
    
    def precision_at_k(self, retrieved: List[str], 
                      relevant: List[str], k: int) -> float:
        """Precision@K metric"""
        retrieved_k = retrieved[:k]
        relevant_in_k = sum(1 for doc in retrieved_k if doc in relevant)
        return relevant_in_k / k if k > 0 else 0
    
    def recall_at_k(self, retrieved: List[str], 
                   relevant: List[str], k: int) -> float:
        """Recall@K metric"""
        retrieved_k = retrieved[:k]
        relevant_in_k = sum(1 for doc in retrieved_k if doc in relevant)
        return relevant_in_k / len(relevant) if relevant else 0
    
    def mrr(self, retrieved: List[str], relevant: List[str]) -> float:
        """Mean Reciprocal Rank"""
        for i, doc in enumerate(retrieved):
            if doc in relevant:
                return 1 / (i + 1)
        return 0
    
    def ndcg_at_k(self, retrieved: List[str], 
                  relevance_scores: Dict[str, float], k: int) -> float:
        """Normalized Discounted Cumulative Gain"""
        def dcg(scores):
            return sum(
                score / np.log2(i + 2) 
                for i, score in enumerate(scores)
            )
        
        # Actual DCG
        retrieved_scores = [
            relevance_scores.get(doc, 0) 
            for doc in retrieved[:k]
        ]
        actual_dcg = dcg(retrieved_scores)
        
        # Ideal DCG
        ideal_scores = sorted(relevance_scores.values(), reverse=True)[:k]
        ideal_dcg = dcg(ideal_scores)
        
        return actual_dcg / ideal_dcg if ideal_dcg > 0 else 0

# A/B test framework
class ABTestFramework:
    def __init__(self, retriever_a, retriever_b):
        self.retriever_a = retriever_a
        self.retriever_b = retriever_b
        self.evaluator = RetrievalEvaluator()
        
    def run_test(self, test_queries: List[Dict]):
        """
        test_queries: List van dicts met 'query' en 'relevant_docs'
        """
        results_a = []
        results_b = []
        
        for test_case in test_queries:
            query = test_case['query']
            relevant = test_case['relevant_docs']
            
            # Test beide retrievers
            retrieved_a = self.retriever_a.search(query)
            retrieved_b = self.retriever_b.search(query)
            
            # Bereken metrics
            metrics_a = {
                'p@5': self.evaluator.precision_at_k(retrieved_a, relevant, 5),
                'r@10': self.evaluator.recall_at_k(retrieved_a, relevant, 10),
                'mrr': self.evaluator.mrr(retrieved_a, relevant)
            }
            
            metrics_b = {
                'p@5': self.evaluator.precision_at_k(retrieved_b, relevant, 5),
                'r@10': self.evaluator.recall_at_k(retrieved_b, relevant, 10),
                'mrr': self.evaluator.mrr(retrieved_b, relevant)
            }
            
            results_a.append(metrics_a)
            results_b.append(metrics_b)
        
        # Aggregeer resultaten
        return {
            'retriever_a': self._aggregate_metrics(results_a),
            'retriever_b': self._aggregate_metrics(results_b)
        }
\`\`\`

## Productie-ready implementatie

### Complete advanced retrieval pipeline

\`\`\`python
class AdvancedRAGRetriever:
    def __init__(self, config: Dict):
        self.config = config
        
        # Initialize components
        self.hybrid_searcher = HybridSearcher(config['documents'])
        self.query_expander = QueryExpander(config['llm_client'])
        self.reranker = ReRanker(config['reranker_model'])
        self.compressor = ContextualCompressor(config['llm_client'])
        
    def retrieve(self, query: str, k: int = 10, 
                 use_expansion: bool = True,
                 use_compression: bool = True) -> List[Dict]:
        """
        Complete retrieval pipeline met alle optimalisaties
        """
        # Stap 1: Query expansion (optioneel)
        if use_expansion:
            queries = self.query_expander.generate_queries(query, n=3)
        else:
            queries = [query]
        
        # Stap 2: Hybrid search voor elke query
        all_results = []
        for q in queries:
            results = self.hybrid_searcher.search(q, k=k*3)
            all_results.append([idx for idx, _ in results])
        
        # Stap 3: Combineer results met RRF
        combined = reciprocal_rank_fusion(all_results)
        top_indices = [idx for idx, _ in combined[:k*2]]
        
        # Stap 4: Re-rank met cross-encoder
        candidates = [self.config['documents'][idx] for idx in top_indices]
        reranked = self.reranker.rerank(query, candidates, top_k=k)
        
        # Stap 5: MMR voor diversiteit
        doc_embeddings = self.hybrid_searcher.embeddings[top_indices]
        query_embedding = self.hybrid_searcher.embedder.encode([query])[0]
        mmr_indices = mmr_rerank(query_embedding, doc_embeddings, k=k)
        
        # Stap 6: Contextual compression (optioneel)
        final_docs = [candidates[i] for i in mmr_indices]
        if use_compression:
            final_docs = self.compressor.compress_results(query, final_docs)
        
        # Stap 7: Reorder voor LLM
        scores = [reranked[i][1] for i in mmr_indices]
        final_docs = reorder_for_llm(final_docs, scores)
        
        return [
            {
                'content': doc,
                'score': score,
                'metadata': self._get_metadata(doc)
            }
            for doc, score in zip(final_docs, scores)
        ]
\`\`\`

## Best practices voor productie

1. **Caching**: Cache embeddings en frequent gebruikte queries
2. **Async processing**: Parallelliseer waar mogelijk
3. **Monitoring**: Track retrieval metrics en latency
4. **Fallbacks**: Implementeer fallback strategies voor failures
5. **Configuratie**: Maak alle parameters configureerbaar
6. **Testing**: Automated tests voor retrieval kwaliteit`,
  codeExamples: [
    {
      id: 'hybrid-search-example',
      title: 'Complete Hybrid Search Implementation',
      language: 'python',
      code: `# Complete hybrid search met Pinecone en LangChain
from pinecone import Pinecone, ServerlessSpec
from langchain.embeddings import OpenAIEmbeddings
from langchain.retrievers import PineconeHybridSearchRetriever
from rank_bm25 import BM25Okapi
import os

# Initialize Pinecone
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

# Create hybrid index (sparse + dense vectors)
index_name = "hybrid-search-index"
if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name,
        dimension=1536,  # OpenAI embedding dimension
        metric="dotproduct",
        spec=ServerlessSpec(
            cloud='aws',
            region='us-east-1'
        )
    )

# Setup embeddings
embeddings = OpenAIEmbeddings()

# Custom Hybrid Retriever
class CustomHybridRetriever:
    def __init__(self, index, embeddings, documents):
        self.index = index
        self.embeddings = embeddings
        self.documents = documents
        
        # Setup BM25 for sparse vectors
        tokenized_docs = [doc.lower().split() for doc in documents]
        self.bm25 = BM25Okapi(tokenized_docs)
        
    def encode_sparse(self, text: str) -> dict:
        """Convert text to sparse vector using BM25"""
        tokens = text.lower().split()
        scores = self.bm25.get_scores(tokens)
        
        # Convert to sparse vector format for Pinecone
        sparse_vec = {
            'indices': [i for i, score in enumerate(scores) if score > 0],
            'values': [score for score in scores if score > 0]
        }
        return sparse_vec
    
    def upsert_documents(self, documents: list, ids: list):
        """Index documents with both dense and sparse vectors"""
        # Generate dense embeddings
        dense_vecs = self.embeddings.embed_documents(
            [doc['content'] for doc in documents]
        )
        
        # Prepare vectors for upsert
        vectors = []
        for i, doc in enumerate(documents):
            sparse_vec = self.encode_sparse(doc['content'])
            
            vectors.append({
                'id': ids[i],
                'values': dense_vecs[i],
                'sparse_values': sparse_vec,
                'metadata': doc.get('metadata', {})
            })
        
        # Upsert to Pinecone
        self.index.upsert(vectors=vectors)
    
    def hybrid_search(self, query: str, alpha: float = 0.5, top_k: int = 10):
        """
        Hybrid search met alpha parameter
        alpha=1.0: alleen dense search
        alpha=0.0: alleen sparse search
        alpha=0.5: 50/50 mix
        """
        # Dense vector voor query
        dense_q = self.embeddings.embed_query(query)
        
        # Sparse vector voor query
        sparse_q = self.encode_sparse(query)
        
        # Hybrid query naar Pinecone
        results = self.index.query(
            vector=dense_q,
            sparse_vector=sparse_q,
            top_k=top_k,
            include_metadata=True,
            # Alpha parameter bepaalt de mix
            sparse_weight=1-alpha
        )
        
        return results.matches

# Gebruik
retriever = CustomHybridRetriever(
    index=pc.Index(index_name),
    embeddings=embeddings,
    documents=documents
)

# Index some documents
docs_to_index = [
    {
        'content': 'Machine learning is een subset van AI...',
        'metadata': {'source': 'ml_basics.pdf', 'page': 1}
    },
    {
        'content': 'Deep learning gebruikt neural networks...',
        'metadata': {'source': 'dl_intro.pdf', 'page': 5}
    }
]

retriever.upsert_documents(
    documents=docs_to_index,
    ids=['doc1', 'doc2']
)

# Search
results = retriever.hybrid_search(
    query="Wat is het verschil tussen ML en deep learning?",
    alpha=0.7  # 70% semantic, 30% keyword
)`
    },
    {
      id: 'reranking-pipeline',
      title: 'Production Re-ranking Pipeline',
      language: 'python',
      code: `# Production-ready re-ranking pipeline met caching en monitoring
from sentence_transformers import CrossEncoder
from typing import List, Dict, Tuple
import time
import redis
import json
from dataclasses import dataclass
import hashlib

@dataclass
class RerankResult:
    document: str
    score: float
    original_rank: int
    reranked_rank: int
    metadata: Dict

class ProductionReranker:
    def __init__(
        self,
        model_name: str = 'cross-encoder/ms-marco-MiniLM-L-6-v2',
        cache_ttl: int = 3600,
        enable_monitoring: bool = True
    ):
        self.model = CrossEncoder(model_name)
        self.cache = redis.Redis(decode_responses=True)
        self.cache_ttl = cache_ttl
        self.enable_monitoring = enable_monitoring
        
        # Warm up model
        self._warmup()
    
    def _warmup(self):
        """Warm up the model with dummy data"""
        dummy_pairs = [["query", "document"]]
        self.model.predict(dummy_pairs)
    
    def _get_cache_key(self, query: str, doc_ids: List[str]) -> str:
        """Generate cache key for query-documents combination"""
        content = f"{query}:{':'.join(sorted(doc_ids))}"
        return f"rerank:{hashlib.md5(content.encode()).hexdigest()}"
    
    def _log_metrics(self, metrics: Dict):
        """Log metrics for monitoring"""
        if self.enable_monitoring:
            # In production: send to monitoring service
            print(f"Reranking metrics: {json.dumps(metrics)}")
    
    def rerank_with_mmr(
        self,
        query: str,
        documents: List[Dict[str, any]],
        top_k: int = 10,
        diversity_weight: float = 0.3,
        use_cache: bool = True
    ) -> List[RerankResult]:
        """
        Re-rank met MMR voor diversity
        """
        start_time = time.time()
        
        # Check cache
        doc_ids = [doc.get('id', str(i)) for i, doc in enumerate(documents)]
        cache_key = self._get_cache_key(query, doc_ids)
        
        if use_cache:
            cached = self.cache.get(cache_key)
            if cached:
                self._log_metrics({
                    'cache_hit': True,
                    'latency_ms': (time.time() - start_time) * 1000
                })
                return json.loads(cached)
        
        # Extract content
        contents = [doc['content'] for doc in documents]
        
        # Score all documents
        pairs = [[query, content] for content in contents]
        scores = self.model.predict(pairs)
        
        # Apply MMR
        selected_indices = []
        selected_scores = []
        remaining = list(range(len(documents)))
        
        # Select first document (highest score)
        first_idx = int(np.argmax(scores))
        selected_indices.append(first_idx)
        selected_scores.append(scores[first_idx])
        remaining.remove(first_idx)
        
        # Iteratively select diverse documents
        while len(selected_indices) < min(top_k, len(documents)) and remaining:
            mmr_scores = []
            
            for idx in remaining:
                # Relevance score
                relevance = scores[idx]
                
                # Calculate diversity (min similarity to selected)
                similarities = []
                for sel_idx in selected_indices:
                    # Simple text similarity (in production: use embeddings)
                    sim = len(set(contents[idx].split()) & 
                             set(contents[sel_idx].split())) / \
                          len(set(contents[idx].split()) | 
                             set(contents[sel_idx].split()))
                    similarities.append(sim)
                
                max_similarity = max(similarities) if similarities else 0
                
                # MMR score
                mmr = (1 - diversity_weight) * relevance - \
                      diversity_weight * max_similarity
                mmr_scores.append(mmr)
            
            # Select best MMR score
            best_idx = remaining[np.argmax(mmr_scores)]
            selected_indices.append(best_idx)
            selected_scores.append(scores[best_idx])
            remaining.remove(best_idx)
        
        # Create results
        results = []
        for new_rank, (idx, score) in enumerate(zip(selected_indices, selected_scores)):
            results.append(RerankResult(
                document=contents[idx],
                score=float(score),
                original_rank=idx,
                reranked_rank=new_rank,
                metadata=documents[idx].get('metadata', {})
            ))
        
        # Cache results
        if use_cache:
            self.cache.setex(
                cache_key,
                self.cache_ttl,
                json.dumps([r.__dict__ for r in results])
            )
        
        # Log metrics
        self._log_metrics({
            'cache_hit': False,
            'num_documents': len(documents),
            'top_k': top_k,
            'latency_ms': (time.time() - start_time) * 1000,
            'model': self.model._model_name
        })
        
        return results

# Advanced reranking met fallback
class FallbackReranker:
    def __init__(self):
        self.primary = ProductionReranker(
            'cross-encoder/ms-marco-MiniLM-L-12-v2'
        )
        self.fallback = ProductionReranker(
            'cross-encoder/ms-marco-MiniLM-L-6-v2'
        )
    
    def rerank(self, query: str, documents: List[Dict], 
               timeout: float = 1.0) -> List[RerankResult]:
        """Rerank with timeout and fallback"""
        import concurrent.futures
        
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(
                self.primary.rerank_with_mmr,
                query, documents
            )
            
            try:
                return future.result(timeout=timeout)
            except concurrent.futures.TimeoutError:
                print("Primary reranker timeout, using fallback")
                return self.fallback.rerank_with_mmr(query, documents)`
    },
    {
      id: 'query-expansion',
      title: 'Advanced Query Expansion',
      language: 'python',
      code: `# Query expansion met LLM en semantic similarity
from typing import List, Set
import numpy as np
from collections import defaultdict

class AdvancedQueryExpander:
    def __init__(self, llm_client, embedder):
        self.llm = llm_client
        self.embedder = embedder
        self.expansion_cache = {}
        
    def expand_with_llm(self, query: str) -> List[str]:
        """Generate query variations using LLM"""
        prompt = """Given the search query: "{query}"
        
        Generate search variations that:
        1. Use synonyms and related terms
        2. Include both broader and narrower concepts
        3. Consider different user intents
        4. Add relevant context words
        
        Format: One variation per line
        
        Examples:
        Original: "machine learning algorithms"
        Variations:
        - ML algorithms and techniques
        - artificial intelligence methods
        - supervised and unsupervised learning approaches
        - neural networks and deep learning
        - statistical learning models
        
        Now generate 5 variations for: "{query}"
        """.format(query=query)
        
        response = self.llm.generate(prompt, max_tokens=200)
        variations = [query] + response.strip().split('\\n')
        
        return [v.strip() for v in variations if v.strip()]
    
    def expand_with_synonyms(self, query: str) -> Set[str]:
        """Expand using WordNet synonyms"""
        from nltk.corpus import wordnet
        import nltk
        
        # Ensure WordNet is downloaded
        try:
            wordnet.synsets('test')
        except:
            nltk.download('wordnet')
        
        # Tokenize query
        words = query.lower().split()
        expanded_queries = {query}
        
        # For each word, find synonyms
        for i, word in enumerate(words):
            synonyms = set()
            for syn in wordnet.synsets(word):
                for lemma in syn.lemmas():
                    synonym = lemma.name().replace('_', ' ')
                    if synonym != word:
                        synonyms.add(synonym)
            
            # Create variations with synonyms
            for synonym in list(synonyms)[:3]:  # Limit synonyms
                new_query = words.copy()
                new_query[i] = synonym
                expanded_queries.add(' '.join(new_query))
        
        return expanded_queries
    
    def semantic_expansion(self, query: str, 
                          reference_docs: List[str],
                          top_k_terms: int = 10) -> List[str]:
        """
        Expand query using terms from semantically similar documents
        """
        # Embed query
        query_embedding = self.embedder.encode([query])[0]
        
        # Find most similar documents
        doc_embeddings = self.embedder.encode(reference_docs)
        similarities = np.dot(doc_embeddings, query_embedding)
        top_doc_indices = np.argsort(similarities)[::-1][:5]
        
        # Extract important terms from similar docs
        from sklearn.feature_extraction.text import TfidfVectorizer
        
        similar_docs = [reference_docs[i] for i in top_doc_indices]
        vectorizer = TfidfVectorizer(max_features=top_k_terms, stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(similar_docs)
        
        # Get top terms
        feature_names = vectorizer.get_feature_names_out()
        expanded_terms = set()
        
        for doc_idx in range(len(similar_docs)):
            doc_tfidf = tfidf_matrix[doc_idx].toarray()[0]
            top_indices = np.argsort(doc_tfidf)[::-1][:5]
            for idx in top_indices:
                if doc_tfidf[idx] > 0:
                    expanded_terms.add(feature_names[idx])
        
        # Create expanded queries
        expanded_queries = [query]
        query_words = set(query.lower().split())
        
        # Add queries with additional context terms
        relevant_terms = [term for term in expanded_terms 
                         if term not in query_words]
        
        for term in relevant_terms[:3]:
            expanded_queries.append(f"{query} {term}")
        
        return expanded_queries
    
    def multi_strategy_expansion(self, query: str, 
                                reference_docs: List[str] = None) -> List[str]:
        """
        Combine multiple expansion strategies
        """
        # Check cache
        if query in self.expansion_cache:
            return self.expansion_cache[query]
        
        all_variations = set()
        
        # Strategy 1: LLM expansion
        llm_variations = self.expand_with_llm(query)
        all_variations.update(llm_variations)
        
        # Strategy 2: Synonym expansion
        synonym_variations = self.expand_with_synonyms(query)
        all_variations.update(synonym_variations)
        
        # Strategy 3: Semantic expansion (if reference docs available)
        if reference_docs:
            semantic_variations = self.semantic_expansion(
                query, reference_docs
            )
            all_variations.update(semantic_variations)
        
        # Remove duplicates and limit total variations
        final_variations = list(all_variations)[:10]
        
        # Cache results
        self.expansion_cache[query] = final_variations
        
        return final_variations

# Query routing based on intent
class QueryRouter:
    def __init__(self, llm_client):
        self.llm = llm_client
        
    def classify_query_intent(self, query: str) -> Dict[str, any]:
        """Classify query intent for better routing"""
        prompt = f"""Analyze this search query: "{query}"
        
        Classify the query into:
        1. Type: [factual|conceptual|procedural|comparative|exploratory]
        2. Complexity: [simple|moderate|complex]
        3. Scope: [narrow|broad]
        4. Domain: [technical|general|academic|business]
        
        Return as JSON.
        """
        
        response = self.llm.generate(prompt)
        return json.loads(response)
    
    def route_query(self, query: str, intent: Dict) -> Dict[str, any]:
        """Route query based on intent"""
        routing_config = {
            'expansion_needed': intent['complexity'] in ['moderate', 'complex'],
            'semantic_weight': 0.8 if intent['type'] == 'conceptual' else 0.5,
            'rerank_needed': intent['complexity'] == 'complex',
            'compression_needed': intent['scope'] == 'broad',
            'num_results': 15 if intent['scope'] == 'broad' else 10
        }
        
        return routing_config`
    }
  ],
  assignments: [
    {
      id: 'hybrid-search-implementation',
      title: 'Build a Hybrid Search System',
      type: 'project',
      difficulty: 'hard',
      description: `Implementeer een volledig hybrid search systeem dat semantic en keyword search combineert.

Requirements:
1. Implementeer zowel dense (semantic) als sparse (BM25) vectors
2. Maak weights configureerbaar (semantic vs keyword)
3. Implementeer Reciprocal Rank Fusion als alternatief
4. Voeg caching toe voor performance
5. Implementeer A/B testing tussen pure semantic en hybrid

Evaluatie criteria:
- Test met verschillende query types (keywords, natuurlijke vragen, technische termen)
- Meet precision@k en recall@k voor beide methodes
- Analyseer wanneer hybrid beter presteert dan pure semantic
- Optimaliseer de weight parameter voor jouw use case`,
      hints: [
        'Begin met een simple weighted sum approach',
        'Test verschillende normalisatie methodes voor scores',
        'Overweeg verschillende tokenization strategies voor BM25',
        'Cache BM25 scores voor frequent gebruikte documenten'
      ]
    },
    {
      id: 'reranking-pipeline',
      title: 'Create a Multi-stage Reranking Pipeline',
      type: 'project',
      difficulty: 'hard',
      description: `Bouw een complete reranking pipeline met multiple stages en strategies.

Implementeer:
1. Initial retrieval met lightweight model (top-100)
2. First-stage reranking met medium model (top-25)
3. Final reranking met heavy cross-encoder (top-10)
4. MMR voor diversity in final results
5. Query-adaptive reranking (verschillende strategies per query type)

Bonus:
- Implementeer parallel processing voor batches
- Voeg timeout handling toe met fallbacks
- Monitor latency per stage
- Implementeer dynamic batching voor efficiency`,
      hints: [
        'Profile elke stage om bottlenecks te identificeren',
        'Experiment met verschillende cascade factors',
        'Overweeg GPU acceleration voor cross-encoders',
        'Test trade-offs tussen latency en accuracy'
      ]
    },
    {
      id: 'query-understanding',
      title: 'Advanced Query Understanding System',
      type: 'project',
      difficulty: 'medium',
      description: `Ontwikkel een query understanding systeem dat queries analyseert en optimaliseert.

Features:
1. Query intent classification (factual, analytical, navigational)
2. Query expansion met multiple strategies
3. Query decomposition voor complexe vragen
4. Spell checking en correction
5. Entity recognition in queries

Implementeer een router die based op query analysis de juiste retrieval strategy kiest.`,
      hints: [
        'Gebruik een small LLM voor query analysis',
        'Cache expansion results voor common queries',
        'Test met real user queries uit logs',
        'Implementeer fallbacks voor edge cases'
      ]
    }
  ],
  resources: [
    {
      title: 'Pinecone Hybrid Search Documentation',
      url: 'https://docs.pinecone.io/docs/hybrid-search',
      type: 'documentation'
    },
    {
      title: 'BEIR: Heterogeneous Benchmark for Information Retrieval',
      url: 'https://github.com/beir-cellar/beir',
      type: 'repository'
    },
    {
      title: 'Lost in the Middle: How Language Models Use Long Contexts',
      url: 'https://arxiv.org/abs/2307.03172',
      type: 'paper'
    },
    {
      title: 'RankGPT: LLMs as Re-Ranking Agents',
      url: 'https://arxiv.org/abs/2304.09542',
      type: 'paper'
    },
    {
      title: 'Query2Doc: Query Expansion with LLMs',
      url: 'https://arxiv.org/abs/2303.07678',
      type: 'paper'
    }
  ]
}