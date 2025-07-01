import type { Lesson } from '$lib/types/lessons';

export const lesson: Lesson = {
	id: 'langchain-basics-module-4-lesson-2',
	moduleId: 'langchain-basics-module-4',
	title: 'Vector Stores & Embeddings',
	description: 'Leer werken met embedding modellen, vector stores zoals FAISS en Chroma, en optimaliseer similarity search voor Nederlandse documenten.',
	duration: 55,
	objectives: [
		'Vergelijk verschillende embedding modellen en hun prestaties',
		'Implementeer vector stores met FAISS en Chroma',
		'Optimaliseer similarity search voor snelheid en relevantie',
		'Werk met Nederlandse embeddings voor betere resultaten',
		'Pas production-ready patterns toe voor schaalbare oplossingen'
	],
	content: `
# Vector Stores & Embeddings

In deze les duiken we diep in vector stores en embeddings - de fundamentele bouwstenen voor semantic search en RAG applicaties.

## Embedding Model Comparison Table

### Performance Benchmarks voor Nederlandse Tekst

\`\`\`python
# Embedding Model Benchmark Script
import time
import numpy as np
from typing import Dict, List, Tuple
from langchain.embeddings import OpenAIEmbeddings, HuggingFaceEmbeddings
from langchain.embeddings.cohere import CohereEmbeddings

class EmbeddingBenchmark:
    """Compare embedding models for Dutch content"""
    
    def __init__(self):
        self.test_texts = [
            "De Nederlandse economie groeit sterker dan verwacht",
            "Machine learning revolutioneert de gezondheidszorg",
            "Amsterdam wordt een belangrijke tech hub in Europa",
            "Duurzame energie is de toekomst voor Nederland",
            "Artificial intelligence transformeert bedrijfsprocessen"
        ]
        
        self.models = {
            "openai-ada-002": {
                "embeddings": OpenAIEmbeddings(model="text-embedding-ada-002"),
                "dimensions": 1536,
                "cost_per_1k_tokens": 0.0001,
                "multilingual": True,
                "max_tokens": 8191
            },
            "openai-3-small": {
                "embeddings": OpenAIEmbeddings(model="text-embedding-3-small"),
                "dimensions": 1536,
                "cost_per_1k_tokens": 0.00002,
                "multilingual": True,
                "max_tokens": 8191
            },
            "openai-3-large": {
                "embeddings": OpenAIEmbeddings(model="text-embedding-3-large"),
                "dimensions": 3072,
                "cost_per_1k_tokens": 0.00013,
                "multilingual": True,
                "max_tokens": 8191
            },
            "multilingual-e5-base": {
                "embeddings": HuggingFaceEmbeddings(
                    model_name="intfloat/multilingual-e5-base"
                ),
                "dimensions": 768,
                "cost_per_1k_tokens": 0,  # Free
                "multilingual": True,
                "max_tokens": 512
            },
            "paraphrase-multilingual-MiniLM": {
                "embeddings": HuggingFaceEmbeddings(
                    model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
                ),
                "dimensions": 384,
                "cost_per_1k_tokens": 0,
                "multilingual": True,
                "max_tokens": 512
            },
            "cohere-multilingual-v3": {
                "embeddings": CohereEmbeddings(
                    model="embed-multilingual-v3.0",
                    cohere_api_key="YOUR_KEY"
                ),
                "dimensions": 1024,
                "cost_per_1k_tokens": 0.0001,
                "multilingual": True,
                "max_tokens": 512
            }
        }
    
    def benchmark_all(self) -> Dict[str, Dict]:
        """Run comprehensive benchmark"""
        results = {}
        
        for model_name, model_info in self.models.items():
            print(f"\nBenchmarking {model_name}...")
            
            try:
                # Speed test
                start_time = time.time()
                embeddings = model_info["embeddings"].embed_documents(self.test_texts)
                embed_time = time.time() - start_time
                
                # Quality test - semantic similarity
                similarity_scores = self._test_semantic_similarity(embeddings)
                
                # Dutch language test
                dutch_performance = self._test_dutch_understanding(
                    model_info["embeddings"]
                )
                
                results[model_name] = {
                    "embed_time": embed_time,
                    "tokens_per_second": len(" ".join(self.test_texts).split()) / embed_time,
                    "dimensions": model_info["dimensions"],
                    "cost_per_1k_tokens": model_info["cost_per_1k_tokens"],
                    "avg_similarity_score": np.mean(similarity_scores),
                    "dutch_score": dutch_performance,
                    "memory_usage_mb": len(embeddings) * model_info["dimensions"] * 4 / 1024 / 1024
                }
                
            except Exception as e:
                results[model_name] = {"error": str(e)}
        
        return results
    
    def _test_semantic_similarity(self, embeddings: List[List[float]]) -> List[float]:
        """Test how well model captures semantic similarity"""
        # Cosine similarity between semantically similar pairs
        from sklearn.metrics.pairwise import cosine_similarity
        
        similarities = []
        # Tekst 0 en 3 gaan beide over economie/energie
        sim_1 = cosine_similarity([embeddings[0]], [embeddings[3]])[0][0]
        similarities.append(sim_1)
        
        # Tekst 1 en 4 gaan beide over AI/ML
        sim_2 = cosine_similarity([embeddings[1]], [embeddings[4]])[0][0]
        similarities.append(sim_2)
        
        return similarities
    
    def _test_dutch_understanding(self, embedding_model) -> float:
        """Test Dutch language specific understanding"""
        dutch_pairs = [
            ("fiets", "bicycle"),  # Translation
            ("gezellig", "cozy"),  # Cultural concept
            ("polder", "reclaimed land"),  # Dutch specific
            ("stroopwafel", "syrup waffle"),  # Dutch food
            ("grachten", "canals")  # Dutch architecture
        ]
        
        scores = []
        for dutch, english in dutch_pairs:
            dutch_emb = embedding_model.embed_query(dutch)
            english_emb = embedding_model.embed_query(english)
            
            # Calculate similarity
            similarity = np.dot(dutch_emb, english_emb) / (
                np.linalg.norm(dutch_emb) * np.linalg.norm(english_emb)
            )
            scores.append(similarity)
        
        return np.mean(scores)

# Print comparison table
benchmark = EmbeddingBenchmark()
results = benchmark.benchmark_all()

print("\n=== EMBEDDING MODEL COMPARISON ===")
print(f"{'Model':<30} {'Speed (tok/s)':<15} {'Dimensions':<12} {'Cost/1k':<10} {'Dutch Score':<12}")
print("-" * 90)
for model, metrics in results.items():
    if "error" not in metrics:
        print(f"{model:<30} {metrics['tokens_per_second']:<15.1f} {metrics['dimensions']:<12} "
              f"$\{metrics['cost_per_1k_tokens']:<9.5f\} {metrics['dutch_score']:<12.3f}")
\`\`\`

### Model Selection Guide

| Model | Best For | Pros | Cons |
|-------|----------|------|------|
| OpenAI Ada-002 | General purpose | Balanced performance | Higher cost |
| OpenAI 3-small | Cost-sensitive apps | 5x cheaper than Ada | Slightly lower quality |
| OpenAI 3-large | High accuracy needs | Best quality | Most expensive |
| Multilingual-E5 | On-premise deployment | Free, good Dutch support | Requires local compute |
| Cohere Multilingual | Non-English focus | Excellent multilingual | API dependency |

## FAISS Setup voor Nederlandse Documenten

### Complete FAISS Implementation

\`\`\`python
import faiss
import numpy as np
from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings
from typing import List, Dict, Tuple, Optional
import pickle
import os

class DutchFAISSVectorStore:
    """FAISS vector store optimized for Dutch documents"""
    
    def __init__(
        self, 
        embedding_model: str = "text-embedding-3-small",
        index_type: str = "Flat",  # Flat, IVF, HNSW
        dimension: int = 1536
    ):
        self.embeddings = OpenAIEmbeddings(model=embedding_model)
        self.dimension = dimension
        self.index_type = index_type
        self.index = None
        self.docstore = {}
        self.index_to_id = {}
        self.id_to_index = {}
        self.document_count = 0
        
        # Initialize FAISS index
        self._create_index()
    
    def _create_index(self):
        """Create FAISS index based on type"""
        if self.index_type == "Flat":
            # Exact search - best for < 10k vectors
            self.index = faiss.IndexFlatL2(self.dimension)
            
        elif self.index_type == "IVF":
            # Inverted file index - good for 10k-1M vectors
            quantizer = faiss.IndexFlatL2(self.dimension)
            self.index = faiss.IndexIVFFlat(
                quantizer, 
                self.dimension, 
                100  # number of clusters
            )
            
        elif self.index_type == "HNSW":
            # Hierarchical Navigable Small World - best for speed
            self.index = faiss.IndexHNSWFlat(
                self.dimension,
                32  # number of neighbors
            )
            
        elif self.index_type == "IVF_PQ":
            # Product Quantization - best for memory efficiency
            quantizer = faiss.IndexFlatL2(self.dimension)
            self.index = faiss.IndexIVFPQ(
                quantizer,
                self.dimension,
                100,  # number of clusters
                8,    # number of sub-quantizers
                8     # bits per sub-quantizer
            )
    
    def add_dutch_documents(
        self, 
        texts: List[str], 
        metadatas: List[Dict] = None,
        batch_size: int = 100
    ):
        """Add Dutch documents with preprocessing"""
        
        # Preprocess Dutch text
        processed_texts = []
        for text in texts:
            # Clean and normalize
            text = self._preprocess_dutch_text(text)
            processed_texts.append(text)
        
        # Process in batches for efficiency
        for i in range(0, len(processed_texts), batch_size):
            batch_texts = processed_texts[i:i + batch_size]
            batch_metadatas = metadatas[i:i + batch_size] if metadatas else None
            
            # Generate embeddings
            embeddings = self.embeddings.embed_documents(batch_texts)
            embeddings_np = np.array(embeddings).astype('float32')
            
            # Normalize vectors for cosine similarity
            faiss.normalize_L2(embeddings_np)
            
            # Add to index
            start_idx = self.document_count
            if self.index_type == "IVF" and not self.index.is_trained:
                # Train IVF index on first batch
                self.index.train(embeddings_np)
            
            self.index.add(embeddings_np)
            
            # Update document store
            for j, (text, embedding) in enumerate(zip(batch_texts, embeddings)):
                doc_id = f"doc_{start_idx + j}"
                self.docstore[doc_id] = {
                    "text": texts[i + j],  # Original text
                    "processed_text": text,
                    "embedding": embedding,
                    "metadata": batch_metadatas[j] if batch_metadatas else {}
                }
                self.index_to_id[start_idx + j] = doc_id
                self.id_to_index[doc_id] = start_idx + j
            
            self.document_count += len(batch_texts)
            print(f"Added batch {i//batch_size + 1}, total docs: {self.document_count}")
    
    def _preprocess_dutch_text(self, text: str) -> str:
        """Preprocess Dutch text for better embedding"""
        # Remove excessive whitespace
        text = " ".join(text.split())
        
        # Handle Dutch-specific characters
        dutch_chars = {
            'ĳ': 'ij', 'IJ': 'IJ',
            'é': 'e', 'è': 'e', 'ë': 'e',
            'ó': 'o', 'ò': 'o', 'ö': 'o',
            'á': 'a', 'à': 'a', 'ä': 'a',
            'ú': 'u', 'ù': 'u', 'ü': 'u',
            'í': 'i', 'ì': 'i', 'ï': 'i'
        }
        
        # Optionally normalize (depends on use case)
        # for old, new in dutch_chars.items():
        #     text = text.replace(old, new)
        
        return text
    
    def similarity_search_with_score(
        self, 
        query: str, 
        k: int = 4,
        filter_metadata: Optional[Dict] = None
    ) -> List[Tuple[Dict, float]]:
        """Search with similarity scores and metadata filtering"""
        
        # Preprocess query
        query = self._preprocess_dutch_text(query)
        
        # Generate query embedding
        query_embedding = self.embeddings.embed_query(query)
        query_vec = np.array([query_embedding]).astype('float32')
        faiss.normalize_L2(query_vec)
        
        # Search
        distances, indices = self.index.search(query_vec, k * 3)  # Get more for filtering
        
        results = []
        for distance, idx in zip(distances[0], indices[0]):
            if idx == -1:  # No result
                continue
                
            doc_id = self.index_to_id.get(idx)
            if not doc_id:
                continue
                
            doc = self.docstore[doc_id]
            
            # Apply metadata filter
            if filter_metadata:
                match = all(
                    doc["metadata"].get(key) == value 
                    for key, value in filter_metadata.items()
                )
                if not match:
                    continue
            
            # Convert distance to similarity score (0-1)
            similarity = 1 - (distance / 2)  # L2 normalized
            
            results.append((doc, similarity))
            
            if len(results) >= k:
                break
        
        return results
    
    def save_index(self, path: str):
        """Save FAISS index and metadata"""
        os.makedirs(path, exist_ok=True)
        
        # Save FAISS index
        faiss.write_index(self.index, os.path.join(path, "index.faiss"))
        
        # Save metadata
        metadata = {
            "docstore": self.docstore,
            "index_to_id": self.index_to_id,
            "id_to_index": self.id_to_index,
            "document_count": self.document_count,
            "dimension": self.dimension,
            "index_type": self.index_type
        }
        
        with open(os.path.join(path, "metadata.pkl"), "wb") as f:
            pickle.dump(metadata, f)
    
    def load_index(self, path: str):
        """Load FAISS index and metadata"""
        # Load FAISS index
        self.index = faiss.read_index(os.path.join(path, "index.faiss"))
        
        # Load metadata
        with open(os.path.join(path, "metadata.pkl"), "rb") as f:
            metadata = pickle.load(f)
        
        self.docstore = metadata["docstore"]
        self.index_to_id = metadata["index_to_id"]
        self.id_to_index = metadata["id_to_index"]
        self.document_count = metadata["document_count"]
        self.dimension = metadata["dimension"]
        self.index_type = metadata["index_type"]
    
    def update_document(self, doc_id: str, new_text: str, new_metadata: Dict = None):
        """Update existing document"""
        if doc_id not in self.id_to_index:
            raise ValueError(f"Document {doc_id} not found")
        
        # Get index
        idx = self.id_to_index[doc_id]
        
        # Generate new embedding
        processed_text = self._preprocess_dutch_text(new_text)
        new_embedding = self.embeddings.embed_query(processed_text)
        new_embedding_np = np.array([new_embedding]).astype('float32')
        faiss.normalize_L2(new_embedding_np)
        
        # Update in FAISS (remove and re-add)
        # Note: This is not efficient for frequent updates
        self.index.remove_ids(np.array([idx]))
        self.index.add(new_embedding_np)
        
        # Update docstore
        self.docstore[doc_id] = {
            "text": new_text,
            "processed_text": processed_text,
            "embedding": new_embedding,
            "metadata": new_metadata or self.docstore[doc_id]["metadata"]
        }

# Usage example
dutch_vectorstore = DutchFAISSVectorStore(
    embedding_model="text-embedding-3-small",
    index_type="IVF"  # Good for medium-sized collections
)

# Add documents
documents = [
    "De Nederlandse AI-strategie richt zich op ethische ontwikkeling",
    "Amsterdam wordt een centrum voor kunstmatige intelligentie",
    "Privacy en data bescherming zijn kernwaarden in Nederland"
]

metadatas = [
    {"category": "policy", "year": 2024},
    {"category": "news", "year": 2024},
    {"category": "privacy", "year": 2023}
]

dutch_vectorstore.add_dutch_documents(documents, metadatas)

# Search
results = dutch_vectorstore.similarity_search_with_score(
    "AI ethiek in Nederland",
    k=3,
    filter_metadata={"year": 2024}
)

for doc, score in results:
    print(f"Score: {score:.3f} - {doc['text'][:50]}...")
\`\`\`

## Chroma DB met Metadata Filtering

### Advanced Chroma Implementation

\`\`\`python
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings
from chromadb.config import Settings
import chromadb
from typing import List, Dict, Optional, Any
from datetime import datetime
import json

class DutchChromaVectorStore:
    """Chroma vector store with advanced metadata filtering for Dutch docs"""
    
    def __init__(
        self,
        collection_name: str = "dutch_documents",
        persist_directory: str = "./chroma_db",
        embedding_model: str = "text-embedding-3-small"
    ):
        self.collection_name = collection_name
        self.persist_directory = persist_directory
        
        # Initialize embeddings
        self.embeddings = OpenAIEmbeddings(model=embedding_model)
        
        # Initialize Chroma client with settings
        self.client = chromadb.PersistentClient(
            path=persist_directory,
            settings=Settings(
                allow_reset=True,
                anonymized_telemetry=False
            )
        )
        
        # Create or get collection
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            metadata={"description": "Dutch document collection"}
        )
        
        # Track metadata schema
        self.metadata_schema = {
            "category": "string",
            "language": "string",
            "date_created": "string",
            "author": "string",
            "source": "string",
            "confidence_score": "float",
            "word_count": "int",
            "is_verified": "bool"
        }
    
    def add_documents_with_metadata(
        self,
        texts: List[str],
        metadatas: List[Dict[str, Any]],
        ids: Optional[List[str]] = None
    ):
        """Add documents with rich metadata"""
        
        # Validate and enrich metadata
        enriched_metadatas = []
        for i, (text, metadata) in enumerate(zip(texts, metadatas)):
            # Add automatic metadata
            enriched_metadata = {
                **metadata,
                "word_count": len(text.split()),
                "char_count": len(text),
                "date_added": datetime.now().isoformat(),
                "language": "nl",  # Dutch
                "embedding_model": self.embeddings.model
            }
            
            # Validate metadata types
            enriched_metadata = self._validate_metadata(enriched_metadata)
            enriched_metadatas.append(enriched_metadata)
        
        # Generate IDs if not provided
        if ids is None:
            ids = [f"doc_{datetime.now().timestamp()}_{i}" for i in range(len(texts))]
        
        # Generate embeddings
        embeddings = self.embeddings.embed_documents(texts)
        
        # Add to Chroma
        self.collection.add(
            embeddings=embeddings,
            documents=texts,
            metadatas=enriched_metadatas,
            ids=ids
        )
        
        print(f"Added {len(texts)} documents to collection '{self.collection_name}'")
    
    def _validate_metadata(self, metadata: Dict) -> Dict:
        """Validate and convert metadata types for Chroma"""
        validated = {}
        
        for key, value in metadata.items():
            if value is None:
                continue
                
            # Convert to appropriate type
            if isinstance(value, bool):
                validated[key] = str(value).lower()
            elif isinstance(value, (int, float)):
                validated[key] = float(value)
            elif isinstance(value, datetime):
                validated[key] = value.isoformat()
            elif isinstance(value, (list, dict)):
                validated[key] = json.dumps(value)
            else:
                validated[key] = str(value)
        
        return validated
    
    def advanced_search(
        self,
        query: str,
        filter_conditions: Optional[Dict] = None,
        k: int = 4,
        include_embeddings: bool = False
    ) -> List[Dict]:
        """Advanced search with complex metadata filtering"""
        
        # Build where clause for Chroma
        where_clause = None
        if filter_conditions:
            where_clause = self._build_where_clause(filter_conditions)
        
        # Perform search
        results = self.collection.query(
            query_embeddings=[self.embeddings.embed_query(query)],
            n_results=k,
            where=where_clause,
            include=["documents", "metadatas", "distances"] + 
                   (["embeddings"] if include_embeddings else [])
        )
        
        # Format results
        formatted_results = []
        for i in range(len(results["documents"][0])):
            result = {
                "document": results["documents"][0][i],
                "metadata": results["metadatas"][0][i],
                "score": 1 - results["distances"][0][i],  # Convert distance to similarity
                "id": results["ids"][0][i] if "ids" in results else None
            }
            
            if include_embeddings:
                result["embedding"] = results["embeddings"][0][i]
            
            formatted_results.append(result)
        
        return formatted_results
    
    def _build_where_clause(self, conditions: Dict) -> Dict:
        """Build complex where clause for Chroma filtering"""
        
        # Handle different condition types
        where_clause = {}
        
        for key, value in conditions.items():
            if isinstance(value, dict):
                # Complex conditions like $gte, $lte, $ne
                where_clause[key] = value
            elif isinstance(value, list):
                # IN condition
                where_clause[key] = {"$in": value}
            else:
                # Exact match
                where_clause[key] = {"$eq": value}
        
        return where_clause
    
    def semantic_search_with_reranking(
        self,
        query: str,
        initial_k: int = 10,
        final_k: int = 4,
        filter_conditions: Optional[Dict] = None
    ) -> List[Dict]:
        """Search with semantic reranking"""
        
        # Get initial results
        initial_results = self.advanced_search(
            query=query,
            filter_conditions=filter_conditions,
            k=initial_k,
            include_embeddings=True
        )
        
        if not initial_results:
            return []
        
        # Rerank using cross-encoder or custom logic
        reranked = self._rerank_results(query, initial_results)
        
        return reranked[:final_k]
    
    def _rerank_results(self, query: str, results: List[Dict]) -> List[Dict]:
        """Custom reranking logic for Dutch content"""
        
        # Simple reranking based on multiple factors
        for result in results:
            score = result["score"]
            metadata = result["metadata"]
            
            # Boost recent documents
            if "date_created" in metadata:
                date_created = datetime.fromisoformat(metadata["date_created"])
                days_old = (datetime.now() - date_created).days
                recency_boost = max(0, 1 - (days_old / 365))  # Decay over a year
                score *= (1 + 0.1 * recency_boost)
            
            # Boost verified documents
            if metadata.get("is_verified") == "true":
                score *= 1.2
            
            # Boost by confidence score
            if "confidence_score" in metadata:
                confidence = float(metadata["confidence_score"])
                score *= (1 + 0.1 * confidence)
            
            # Boost Dutch-specific content
            if "gezellig" in result["document"].lower() or \
               "polder" in result["document"].lower():
                score *= 1.1
            
            result["reranked_score"] = score
        
        # Sort by reranked score
        results.sort(key=lambda x: x["reranked_score"], reverse=True)
        
        return results
    
    def update_metadata(self, doc_id: str, new_metadata: Dict):
        """Update document metadata"""
        # Get current document
        current = self.collection.get(ids=[doc_id])
        
        if not current["documents"]:
            raise ValueError(f"Document {doc_id} not found")
        
        # Merge metadata
        current_metadata = current["metadatas"][0]
        updated_metadata = {**current_metadata, **new_metadata}
        updated_metadata["date_modified"] = datetime.now().isoformat()
        
        # Validate
        updated_metadata = self._validate_metadata(updated_metadata)
        
        # Update in Chroma
        self.collection.update(
            ids=[doc_id],
            metadatas=[updated_metadata]
        )
    
    def get_collection_stats(self) -> Dict:
        """Get statistics about the collection"""
        count = self.collection.count()
        
        # Get sample of metadata to analyze
        sample = self.collection.get(limit=min(count, 1000))
        
        stats = {
            "total_documents": count,
            "collection_name": self.collection_name,
            "unique_categories": set(),
            "date_range": {"min": None, "max": None},
            "avg_word_count": 0,
            "languages": set()
        }
        
        total_words = 0
        for metadata in sample["metadatas"]:
            if "category" in metadata:
                stats["unique_categories"].add(metadata["category"])
            if "language" in metadata:
                stats["languages"].add(metadata["language"])
            if "word_count" in metadata:
                total_words += float(metadata["word_count"])
            if "date_created" in metadata:
                date = metadata["date_created"]
                if stats["date_range"]["min"] is None or date < stats["date_range"]["min"]:
                    stats["date_range"]["min"] = date
                if stats["date_range"]["max"] is None or date > stats["date_range"]["max"]:
                    stats["date_range"]["max"] = date
        
        stats["avg_word_count"] = total_words / len(sample["metadatas"]) if sample["metadatas"] else 0
        stats["unique_categories"] = list(stats["unique_categories"])
        stats["languages"] = list(stats["languages"])
        
        return stats

# Usage example
dutch_chroma = DutchChromaVectorStore(
    collection_name="nederlandse_documenten",
    persist_directory="./chroma_dutch"
)

# Add documents with rich metadata
documents = [
    {
        "text": "De Nederlandse overheid investeert in AI voor betere dienstverlening",
        "metadata": {
            "category": "overheid",
            "source": "rijksoverheid.nl",
            "date_created": "2024-01-15",
            "author": "Ministerie van BZK",
            "confidence_score": 0.9,
            "is_verified": True
        }
    },
    {
        "text": "Privacy-by-design is essentieel voor AI-systemen in Nederland",
        "metadata": {
            "category": "privacy",
            "source": "autoriteitpersoonsgegevens.nl",
            "date_created": "2024-02-01",
            "author": "AP",
            "confidence_score": 0.95,
            "is_verified": True
        }
    }
]

# Add to collection
dutch_chroma.add_documents_with_metadata(
    texts=[doc["text"] for doc in documents],
    metadatas=[doc["metadata"] for doc in documents]
)

# Complex search with filters
results = dutch_chroma.advanced_search(
    query="AI privacy Nederland",
    filter_conditions={
        "category": ["privacy", "overheid"],
        "confidence_score": {"$gte": 0.8},
        "is_verified": "true"
    },
    k=5
)

# Get collection statistics
stats = dutch_chroma.get_collection_stats()
print(f"Collection stats: {json.dumps(stats, indent=2)}")
\`\`\`

## Similarity Search Optimization

### Performance Optimization Techniques

\`\`\`python
import numpy as np
from typing import List, Tuple, Dict
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
import asyncio
from functools import lru_cache

class OptimizedSimilaritySearch:
    """Optimized similarity search for production environments"""
    
    def __init__(self, vector_store, cache_size: int = 1000):
        self.vector_store = vector_store
        self.cache = {}
        self.cache_size = cache_size
        self.query_cache = lru_cache(maxsize=cache_size)(self._cached_embedding)
        
        # Performance metrics
        self.metrics = {
            "cache_hits": 0,
            "cache_misses": 0,
            "avg_search_time": 0,
            "total_searches": 0
        }
    
    def batch_similarity_search(
        self,
        queries: List[str],
        k: int = 4,
        batch_size: int = 10
    ) -> List[List[Tuple[Dict, float]]]:
        """Batch process multiple queries efficiently"""
        
        results = []
        
        # Process in batches
        for i in range(0, len(queries), batch_size):
            batch = queries[i:i + batch_size]
            
            # Generate embeddings in batch
            embeddings = self.vector_store.embeddings.embed_documents(batch)
            
            # Parallel search
            with ThreadPoolExecutor(max_workers=min(len(batch), 5)) as executor:
                futures = []
                for query, embedding in zip(batch, embeddings):
                    future = executor.submit(
                        self._search_with_embedding,
                        embedding,
                        k
                    )
                    futures.append(future)
                
                # Collect results
                for future in as_completed(futures):
                    results.append(future.result())
        
        return results
    
    def _search_with_embedding(
        self,
        embedding: List[float],
        k: int
    ) -> List[Tuple[Dict, float]]:
        """Search using pre-computed embedding"""
        
        # Convert to numpy array
        query_vec = np.array([embedding]).astype('float32')
        
        # Normalize for cosine similarity
        query_vec = query_vec / np.linalg.norm(query_vec)
        
        # Search in vector store
        if hasattr(self.vector_store, 'index'):  # FAISS
            distances, indices = self.vector_store.index.search(query_vec, k)
            results = []
            for dist, idx in zip(distances[0], indices[0]):
                if idx != -1:
                    doc = self.vector_store.docstore.get(
                        self.vector_store.index_to_id.get(idx)
                    )
                    if doc:
                        similarity = 1 - (dist / 2)
                        results.append((doc, similarity))
        else:  # Chroma or other
            results = self.vector_store.similarity_search_with_score(
                query_vec.tolist()[0], k
            )
        
        return results
    
    async def async_similarity_search(
        self,
        query: str,
        k: int = 4
    ) -> List[Tuple[Dict, float]]:
        """Async similarity search for better concurrency"""
        
        start_time = time.time()
        
        # Check cache
        cache_key = f"{query}:{k}"
        if cache_key in self.cache:
            self.metrics["cache_hits"] += 1
            return self.cache[cache_key]
        
        self.metrics["cache_misses"] += 1
        
        # Generate embedding asynchronously
        embedding = await self._async_embed(query)
        
        # Search
        results = await asyncio.to_thread(
            self._search_with_embedding,
            embedding,
            k
        )
        
        # Update cache
        self._update_cache(cache_key, results)
        
        # Update metrics
        search_time = time.time() - start_time
        self._update_metrics(search_time)
        
        return results
    
    async def _async_embed(self, text: str) -> List[float]:
        """Generate embedding asynchronously"""
        return await asyncio.to_thread(
            self.vector_store.embeddings.embed_query,
            text
        )
    
    def _cached_embedding(self, text: str) -> List[float]:
        """Cached embedding generation"""
        return self.vector_store.embeddings.embed_query(text)
    
    def _update_cache(self, key: str, value: Any):
        """Update cache with LRU eviction"""
        if len(self.cache) >= self.cache_size:
            # Remove oldest entry
            oldest_key = next(iter(self.cache))
            del self.cache[oldest_key]
        
        self.cache[key] = value
    
    def _update_metrics(self, search_time: float):
        """Update performance metrics"""
        self.metrics["total_searches"] += 1
        
        # Calculate running average
        n = self.metrics["total_searches"]
        avg = self.metrics["avg_search_time"]
        self.metrics["avg_search_time"] = (avg * (n - 1) + search_time) / n
    
    def optimize_index(self):
        """Optimize vector index for better performance"""
        
        if hasattr(self.vector_store, 'index'):  # FAISS
            # Add IVF training if not done
            if hasattr(self.vector_store.index, 'is_trained'):
                if not self.vector_store.index.is_trained:
                    # Get sample vectors for training
                    sample_size = min(10000, self.vector_store.document_count)
                    sample_vectors = []
                    
                    for i in range(0, sample_size, 100):
                        batch_ids = list(range(i, min(i + 100, sample_size)))
                        for doc_id in batch_ids:
                            doc = self.vector_store.docstore.get(f"doc_{doc_id}")
                            if doc and "embedding" in doc:
                                sample_vectors.append(doc["embedding"])
                    
                    if sample_vectors:
                        training_data = np.array(sample_vectors).astype('float32')
                        self.vector_store.index.train(training_data)
                        print(f"Trained index with {len(sample_vectors)} vectors")
    
    def get_performance_report(self) -> Dict:
        """Get detailed performance report"""
        
        total = self.metrics["cache_hits"] + self.metrics["cache_misses"]
        cache_hit_rate = self.metrics["cache_hits"] / total if total > 0 else 0
        
        return {
            "total_searches": self.metrics["total_searches"],
            "avg_search_time_ms": self.metrics["avg_search_time"] * 1000,
            "cache_hit_rate": cache_hit_rate,
            "cache_size": len(self.cache),
            "recommendations": self._get_optimization_recommendations()
        }
    
    def _get_optimization_recommendations(self) -> List[str]:
        """Get optimization recommendations based on metrics"""
        
        recommendations = []
        
        # Check cache hit rate
        total = self.metrics["cache_hits"] + self.metrics["cache_misses"]
        if total > 0:
            hit_rate = self.metrics["cache_hits"] / total
            if hit_rate < 0.3:
                recommendations.append(
                    "Low cache hit rate. Consider increasing cache size."
                )
        
        # Check search time
        if self.metrics["avg_search_time"] > 0.1:  # > 100ms
            recommendations.append(
                "High average search time. Consider using IVF or HNSW index."
            )
        
        return recommendations

# Usage example
optimizer = OptimizedSimilaritySearch(dutch_vectorstore)

# Batch search
queries = [
    "AI ethiek Nederland",
    "Privacy wetgeving GDPR",
    "Machine learning toepassingen"
]

results = optimizer.batch_similarity_search(queries, k=3)

# Async search
async def main():
    result = await optimizer.async_similarity_search(
        "Nederlandse AI strategie",
        k=5
    )
    return result

# Get performance report
report = optimizer.get_performance_report()
print(f"Performance Report: {json.dumps(report, indent=2)}")
\`\`\`

## Production Deployment Tips

### Deployment Best Practices

\`\`\`python
# Production configuration for vector stores

class ProductionVectorStore:
    """Production-ready vector store configuration"""
    
    def __init__(self):
        self.config = {
            # Model selection
            "embedding_model": {
                "development": "text-embedding-3-small",
                "production": "text-embedding-3-small",  # Balance cost/quality
                "high_accuracy": "text-embedding-3-large"
            },
            
            # Index configuration
            "faiss_config": {
                "small": {  # < 10k vectors
                    "index_type": "Flat",
                    "metric": "cosine"
                },
                "medium": {  # 10k - 100k vectors
                    "index_type": "IVF",
                    "nlist": 100,
                    "metric": "cosine"
                },
                "large": {  # 100k - 1M vectors
                    "index_type": "IVF_HNSW",
                    "nlist": 1000,
                    "m": 32,
                    "metric": "cosine"
                },
                "xlarge": {  # > 1M vectors
                    "index_type": "IVF_PQ",
                    "nlist": 4096,
                    "m": 64,
                    "nbits": 8
                }
            },
            
            # Chroma configuration
            "chroma_config": {
                "batch_size": 1000,
                "persist_interval": 100,
                "anonymized_telemetry": False
            },
            
            # Performance settings
            "performance": {
                "embedding_batch_size": 100,
                "search_batch_size": 10,
                "cache_size": 10000,
                "max_workers": 5
            },
            
            # Monitoring
            "monitoring": {
                "log_level": "INFO",
                "metrics_interval": 60,  # seconds
                "health_check_interval": 30
            }
        }
    
    def get_deployment_checklist(self) -> List[str]:
        """Production deployment checklist"""
        return [
            "✓ Choose appropriate embedding model for cost/quality balance",
            "✓ Select vector index type based on collection size",
            "✓ Implement caching layer (Redis/Memcached)",
            "✓ Set up monitoring and alerting",
            "✓ Configure rate limiting",
            "✓ Implement backup and recovery",
            "✓ Set up horizontal scaling if needed",
            "✓ Configure security (API keys, encryption)",
            "✓ Implement graceful error handling",
            "✓ Set up A/B testing framework",
            "✓ Configure logging and analytics",
            "✓ Test disaster recovery procedures"
        ]
    
    def estimate_costs(
        self,
        documents: int,
        avg_doc_length: int,
        queries_per_day: int
    ) -> Dict[str, float]:
        """Estimate monthly costs"""
        
        # Embedding costs (OpenAI)
        total_tokens = documents * (avg_doc_length / 4)  # ~4 chars per token
        embedding_cost = (total_tokens / 1000) * 0.0001  # Ada pricing
        
        # Query costs
        monthly_queries = queries_per_day * 30
        query_tokens = monthly_queries * 50  # Avg query length
        query_cost = (query_tokens / 1000) * 0.0001
        
        # Storage costs (estimate)
        storage_gb = (documents * 1536 * 4) / (1024**3)  # 1536 dims, 4 bytes per float
        storage_cost = storage_gb * 0.023  # S3 pricing
        
        # Compute costs (estimate)
        compute_hours = (monthly_queries / 3600) * 0.1  # 100ms per query
        compute_cost = compute_hours * 0.10  # t3.medium pricing
        
        return {
            "embedding_cost": embedding_cost,
            "query_cost": query_cost,
            "storage_cost": storage_cost,
            "compute_cost": compute_cost,
            "total_monthly": embedding_cost + query_cost + storage_cost + compute_cost
        }
    
    def get_scaling_strategy(self, expected_growth: float) -> Dict[str, str]:
        """Get scaling recommendations"""
        
        if expected_growth < 2:  # Less than 2x growth
            return {
                "strategy": "Vertical Scaling",
                "recommendation": "Increase instance size as needed",
                "index_type": "Keep current index type"
            }
        elif expected_growth < 10:  # 2-10x growth
            return {
                "strategy": "Horizontal Scaling",
                "recommendation": "Implement sharding across multiple instances",
                "index_type": "Migrate to IVF or HNSW index"
            }
        else:  # > 10x growth
            return {
                "strategy": "Distributed System",
                "recommendation": "Consider managed solutions like Pinecone/Weaviate",
                "index_type": "Use distributed index with product quantization"
            }
    
    def security_recommendations(self) -> Dict[str, List[str]]:
        """Security best practices"""
        return {
            "api_security": [
                "Use API key rotation",
                "Implement rate limiting per key",
                "Use HTTPS everywhere",
                "Validate and sanitize all inputs"
            ],
            "data_security": [
                "Encrypt vectors at rest",
                "Use encryption in transit",
                "Implement access control lists",
                "Regular security audits"
            ],
            "compliance": [
                "GDPR compliance for EU data",
                "Data retention policies",
                "Right to deletion implementation",
                "Audit logging for all operations"
            ]
        }

# Initialize production config
prod_config = ProductionVectorStore()

# Estimate costs
costs = prod_config.estimate_costs(
    documents=100000,
    avg_doc_length=500,
    queries_per_day=10000
)
print(f"Estimated monthly costs: $\\{costs['total_monthly']:.2f\\}")

# Get scaling strategy
scaling = prod_config.get_scaling_strategy(expected_growth=5.0)
print(f"Scaling strategy: {scaling['strategy']}")

# Security checklist
security = prod_config.security_recommendations()
print("Security checklist:", json.dumps(security, indent=2))
\`\`\``,
  codeExamples: [
    {
      id: 'example-1',
      title: 'Production FAISS Implementation',
      language: 'python',
      code: `import faiss
import numpy as np
from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings
from typing import List, Dict, Optional, Tuple
import pickle
import logging
from dataclasses import dataclass
from datetime import datetime

@dataclass
class SearchResult:
    """Structured search result"""
    text: str
    metadata: Dict
    score: float
    doc_id: str

class ProductionFAISS:
    """Production-ready FAISS implementation with monitoring"""
    
    def __init__(
        self,
        embedding_model: str = "text-embedding-3-small",
        index_factory_string: str = "IVF1024,Flat",
        dimension: int = 1536
    ):
        self.logger = logging.getLogger(__name__)
        self.embeddings = OpenAIEmbeddings(model=embedding_model)
        self.dimension = dimension
        
        # Create index from factory string for flexibility
        self.index = faiss.index_factory(
            dimension,
            index_factory_string,
            faiss.METRIC_INNER_PRODUCT  # Cosine similarity
        )
        
        # Document storage
        self.documents = {}
        self.doc_count = 0
        
        # Performance tracking
        self.stats = {
            "total_searches": 0,
            "total_additions": 0,
            "avg_search_time": 0,
            "index_trained": False
        }
    
    def add_documents_batch(
        self,
        texts: List[str],
        metadatas: List[Dict] = None,
        batch_size: int = 1000
    ) -> List[str]:
        """Add documents in optimized batches"""
        
        doc_ids = []
        all_embeddings = []
        
        # Process in batches
        for i in range(0, len(texts), batch_size):
            batch_end = min(i + batch_size, len(texts))
            batch_texts = texts[i:batch_end]
            batch_metas = metadatas[i:batch_end] if metadatas else [{}] * len(batch_texts)
            
            self.logger.info(f"Processing batch {i//batch_size + 1} ({len(batch_texts)} docs)")
            
            # Generate embeddings
            try:
                embeddings = self.embeddings.embed_documents(batch_texts)
                embeddings_np = np.array(embeddings).astype('float32')
                
                # Normalize for cosine similarity
                faiss.normalize_L2(embeddings_np)
                
                all_embeddings.append(embeddings_np)
                
                # Store documents
                for j, (text, meta, embedding) in enumerate(
                    zip(batch_texts, batch_metas, embeddings)
                ):
                    doc_id = f"doc_{self.doc_count + j}"
                    self.documents[doc_id] = {
                        "text": text,
                        "metadata": {
                            **meta,
                            "added_at": datetime.now().isoformat(),
                            "doc_id": doc_id
                        },
                        "embedding": embedding
                    }
                    doc_ids.append(doc_id)
                
                self.doc_count += len(batch_texts)
                
            except Exception as e:
                self.logger.error(f"Error in batch {i//batch_size + 1}: {e}")
                raise
        
        # Concatenate all embeddings
        if all_embeddings:
            all_embeddings_np = np.vstack(all_embeddings)
            
            # Train index if needed
            if hasattr(self.index, 'is_trained') and not self.index.is_trained:
                self.logger.info("Training FAISS index...")
                self.index.train(all_embeddings_np)
                self.stats["index_trained"] = True
            
            # Add to index
            self.index.add(all_embeddings_np)
            self.stats["total_additions"] += len(texts)
            
        return doc_ids
    
    def similarity_search_with_score(
        self,
        query: str,
        k: int = 4,
        filter_fn: Optional[callable] = None,
        score_threshold: float = 0.0
    ) -> List[SearchResult]:
        """Search with optional filtering and score threshold"""
        
        start_time = datetime.now()
        
        # Generate query embedding
        query_embedding = self.embeddings.embed_query(query)
        query_vec = np.array([query_embedding]).astype('float32')
        faiss.normalize_L2(query_vec)
        
        # Search - get extra results for filtering
        search_k = k * 3 if filter_fn else k
        distances, indices = self.index.search(query_vec, search_k)
        
        # Process results
        results = []
        for distance, idx in zip(distances[0], indices[0]):
            if idx == -1:  # No result
                continue
            
            # Get document
            doc_id = f"doc_{idx}"
            if doc_id not in self.documents:
                continue
            
            doc = self.documents[doc_id]
            
            # Apply filter if provided
            if filter_fn and not filter_fn(doc["metadata"]):
                continue
            
            # Convert distance to similarity score
            score = float(distance)  # Already normalized
            
            # Apply score threshold
            if score < score_threshold:
                continue
            
            result = SearchResult(
                text=doc["text"],
                metadata=doc["metadata"],
                score=score,
                doc_id=doc_id
            )
            results.append(result)
            
            if len(results) >= k:
                break
        
        # Update stats
        search_time = (datetime.now() - start_time).total_seconds()
        self._update_search_stats(search_time)
        
        return results
    
    def hybrid_search(
        self,
        query: str,
        k: int = 4,
        keyword_weight: float = 0.3
    ) -> List[SearchResult]:
        """Hybrid search combining semantic and keyword matching"""
        
        # Semantic search
        semantic_results = self.similarity_search_with_score(query, k=k*2)
        
        # Simple keyword matching (production would use BM25)
        query_terms = set(query.lower().split())
        keyword_scores = {}
        
        for doc_id, doc in self.documents.items():
            text_lower = doc["text"].lower()
            # Count matching terms
            matches = sum(1 for term in query_terms if term in text_lower)
            if matches > 0:
                keyword_scores[doc_id] = matches / len(query_terms)
        
        # Combine scores
        final_scores = {}
        
        # Add semantic scores
        for result in semantic_results:
            final_scores[result.doc_id] = (1 - keyword_weight) * result.score
        
        # Add keyword scores
        for doc_id, k_score in keyword_scores.items():
            if doc_id in final_scores:
                final_scores[doc_id] += keyword_weight * k_score
            else:
                final_scores[doc_id] = keyword_weight * k_score
        
        # Sort and return top k
        sorted_ids = sorted(final_scores.items(), key=lambda x: x[1], reverse=True)[:k]
        
        results = []
        for doc_id, score in sorted_ids:
            doc = self.documents[doc_id]
            results.append(SearchResult(
                text=doc["text"],
                metadata=doc["metadata"],
                score=score,
                doc_id=doc_id
            ))
        
        return results
    
    def save(self, path: str):
        """Save index and documents to disk"""
        
        # Save FAISS index
        faiss.write_index(self.index, f"{path}.index")
        
        # Save documents and metadata
        with open(f"{path}.pkl", "wb") as f:
            pickle.dump({
                "documents": self.documents,
                "doc_count": self.doc_count,
                "stats": self.stats,
                "dimension": self.dimension
            }, f)
        
        self.logger.info(f"Saved {self.doc_count} documents to {path}")
    
    def load(self, path: str):
        """Load index and documents from disk"""
        
        # Load FAISS index
        self.index = faiss.read_index(f"{path}.index")
        
        # Load documents and metadata
        with open(f"{path}.pkl", "rb") as f:
            data = pickle.load(f)
            self.documents = data["documents"]
            self.doc_count = data["doc_count"]
            self.stats = data["stats"]
            self.dimension = data["dimension"]
        
        self.logger.info(f"Loaded {self.doc_count} documents from {path}")
    
    def _update_search_stats(self, search_time: float):
        """Update search statistics"""
        n = self.stats["total_searches"]
        avg = self.stats["avg_search_time"]
        self.stats["avg_search_time"] = (avg * n + search_time) / (n + 1)
        self.stats["total_searches"] += 1
    
    def get_stats(self) -> Dict:
        """Get performance statistics"""
        return {
            **self.stats,
            "document_count": self.doc_count,
            "index_size_mb": self.index.ntotal * self.dimension * 4 / (1024 * 1024),
            "avg_search_time_ms": self.stats["avg_search_time"] * 1000
        }

# Example usage
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Initialize
    vector_store = ProductionFAISS(
        embedding_model="text-embedding-3-small",
        index_factory_string="IVF256,Flat"  # Good for 10k-100k docs
    )
    
    # Add documents
    documents = [
        {"text": "Nederlandse AI ethiek richtlijnen voor verantwoord gebruik", 
         "metadata": {"category": "ethics", "language": "nl"}},
        {"text": "Machine learning toepassingen in de gezondheidszorg",
         "metadata": {"category": "healthcare", "language": "nl"}},
        {"text": "Privacy wetgeving en GDPR compliance voor AI systemen",
         "metadata": {"category": "privacy", "language": "nl"}}
    ]
    
    doc_ids = vector_store.add_documents_batch(
        texts=[d["text"] for d in documents],
        metadatas=[d["metadata"] for d in documents]
    )
    
    # Search with filter
    results = vector_store.similarity_search_with_score(
        "AI privacy Nederland",
        k=2,
        filter_fn=lambda meta: meta.get("category") in ["privacy", "ethics"],
        score_threshold=0.5
    )
    
    for result in results:
        print(f"Score: {result.score:.3f} | {result.text[:50]}...")
    
    # Get stats
    print("\nPerformance Stats:")
    print(vector_store.get_stats())`,
      explanation: 'Complete production-ready FAISS implementation met batching, filtering, hybrid search en monitoring.',
      sandboxUrl: 'https://codesandbox.io/s/production-faiss-vector-store'
    },
    {
      id: 'example-2',
      title: 'Chroma Advanced Features',
      language: 'python',
      code: `from chromadb import Client, Settings
from chromadb.utils import embedding_functions
import chromadb
from typing import List, Dict, Optional, Any, Tuple
from datetime import datetime, timedelta
import json
import pandas as pd

class AdvancedChromaStore:
    """Advanced Chroma features for production use"""
    
    def __init__(
        self,
        collection_name: str = "dutch_documents",
        persist_directory: str = "./chroma_db"
    ):
        # Initialize client with custom settings
        self.client = chromadb.PersistentClient(
            path=persist_directory,
            settings=Settings(
                chroma_db_impl="duckdb+parquet",
                persist_directory=persist_directory,
                anonymized_telemetry=False
            )
        )
        
        # Custom embedding function for Dutch
        self.embedding_function = embedding_functions.OpenAIEmbeddingFunction(
            api_key=os.getenv("OPENAI_API_KEY"),
            model_name="text-embedding-3-small"
        )
        
        # Create or get collection with custom distance metric
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            embedding_function=self.embedding_function,
            metadata={"hnsw:space": "cosine"}  # Use cosine similarity
        )
        
        # Metadata schema for validation
        self.metadata_schema = {
            "required": ["source", "language", "created_at"],
            "optional": ["author", "category", "tags", "version"],
            "types": {
                "created_at": "datetime",
                "version": "float",
                "tags": "list"
            }
        }
    
    def add_documents_with_validation(
        self,
        documents: List[Dict[str, Any]],
        batch_size: int = 100
    ) -> Dict[str, Any]:
        """Add documents with metadata validation and enrichment"""
        
        results = {
            "added": 0,
            "failed": 0,
            "errors": []
        }
        
        for i in range(0, len(documents), batch_size):
            batch = documents[i:i + batch_size]
            
            texts = []
            metadatas = []
            ids = []
            
            for doc in batch:
                try:
                    # Validate required fields
                    for field in self.metadata_schema["required"]:
                        if field not in doc.get("metadata", {}):
                            raise ValueError(f"Missing required field: {field}")
                    
                    # Enrich metadata
                    enriched_metadata = self._enrich_metadata(doc["metadata"])
                    
                    # Validate metadata types
                    validated_metadata = self._validate_metadata_types(enriched_metadata)
                    
                    texts.append(doc["text"])
                    metadatas.append(validated_metadata)
                    ids.append(doc.get("id", f"doc_{datetime.now().timestamp()}_{i}"))
                    
                except Exception as e:
                    results["failed"] += 1
                    results["errors"].append({
                        "document": doc.get("id", "unknown"),
                        "error": str(e)
                    })
            
            if texts:
                # Add to collection
                self.collection.add(
                    documents=texts,
                    metadatas=metadatas,
                    ids=ids
                )
                results["added"] += len(texts)
        
        return results
    
    def _enrich_metadata(self, metadata: Dict) -> Dict:
        """Enrich metadata with computed fields"""
        enriched = metadata.copy()
        
        # Add processing timestamp
        enriched["processed_at"] = datetime.now().isoformat()
        
        # Add text statistics if not present
        if "word_count" not in enriched and "text" in metadata:
            enriched["word_count"] = len(metadata["text"].split())
        
        # Ensure language is set
        if "language" not in enriched:
            enriched["language"] = "nl"  # Default to Dutch
        
        return enriched
    
    def _validate_metadata_types(self, metadata: Dict) -> Dict:
        """Validate and convert metadata types"""
        validated = {}
        
        for key, value in metadata.items():
            if key in self.metadata_schema["types"]:
                expected_type = self.metadata_schema["types"][key]
                
                if expected_type == "datetime" and isinstance(value, str):
                    # Parse datetime
                    try:
                        validated[key] = datetime.fromisoformat(value).isoformat()
                    except:
                        validated[key] = value
                elif expected_type == "list" and isinstance(value, str):
                    # Parse JSON list
                    try:
                        validated[key] = json.dumps(json.loads(value))
                    except:
                        validated[key] = json.dumps([value])
                else:
                    validated[key] = value
            else:
                # Convert to string for Chroma compatibility
                if isinstance(value, (list, dict)):
                    validated[key] = json.dumps(value)
                elif isinstance(value, bool):
                    validated[key] = str(value).lower()
                else:
                    validated[key] = str(value)
        
        return validated
    
    def time_range_search(
        self,
        query: str,
        start_date: datetime,
        end_date: datetime,
        k: int = 10
    ) -> List[Dict]:
        """Search within a specific time range"""
        
        # Build where clause for time range
        where = {
            "$and": [
                {"created_at": {"$gte": start_date.isoformat()}},
                {"created_at": {"$lte": end_date.isoformat()}}
            ]
        }
        
        results = self.collection.query(
            query_texts=[query],
            n_results=k,
            where=where,
            include=["documents", "metadatas", "distances"]
        )
        
        # Format results
        formatted = []
        for i in range(len(results["documents"][0])):
            formatted.append({
                "text": results["documents"][0][i],
                "metadata": results["metadatas"][0][i],
                "score": 1 - results["distances"][0][i]
            })
        
        return formatted
    
    def faceted_search(
        self,
        query: str,
        facets: Dict[str, List[str]],
        k: int = 10
    ) -> Dict[str, List[Dict]]:
        """Search with faceted filtering"""
        
        results = {}
        
        # Search for each facet combination
        for facet_name, facet_values in facets.items():
            for value in facet_values:
                where = {facet_name: {"$eq": value}}
                
                facet_results = self.collection.query(
                    query_texts=[query],
                    n_results=k,
                    where=where,
                    include=["documents", "metadatas", "distances"]
                )
                
                # Store results by facet
                key = f"{facet_name}:{value}"
                results[key] = []
                
                for i in range(len(facet_results["documents"][0])):
                    results[key].append({
                        "text": facet_results["documents"][0][i],
                        "metadata": facet_results["metadatas"][0][i],
                        "score": 1 - facet_results["distances"][0][i]
                    })
        
        return results
    
    def get_similar_documents(
        self,
        document_id: str,
        k: int = 5,
        exclude_self: bool = True
    ) -> List[Dict]:
        """Find documents similar to a given document"""
        
        # Get the document
        doc = self.collection.get(ids=[document_id], include=["embeddings"])
        
        if not doc["embeddings"]:
            raise ValueError(f"Document {document_id} not found")
        
        # Search using its embedding
        results = self.collection.query(
            query_embeddings=doc["embeddings"],
            n_results=k + (1 if exclude_self else 0),
            include=["documents", "metadatas", "distances", "ids"]
        )
        
        # Format and filter results
        formatted = []
        for i in range(len(results["documents"][0])):
            if exclude_self and results["ids"][0][i] == document_id:
                continue
            
            formatted.append({
                "id": results["ids"][0][i],
                "text": results["documents"][0][i],
                "metadata": results["metadatas"][0][i],
                "similarity": 1 - results["distances"][0][i]
            })
        
        return formatted[:k]
    
    def update_document_metadata(
        self,
        document_id: str,
        metadata_updates: Dict
    ):
        """Update metadata for existing document"""
        
        # Get current document
        current = self.collection.get(
            ids=[document_id],
            include=["metadatas", "documents", "embeddings"]
        )
        
        if not current["ids"]:
            raise ValueError(f"Document {document_id} not found")
        
        # Merge metadata
        current_metadata = current["metadatas"][0]
        updated_metadata = {**current_metadata, **metadata_updates}
        updated_metadata["last_updated"] = datetime.now().isoformat()
        
        # Validate
        validated_metadata = self._validate_metadata_types(updated_metadata)
        
        # Update (Chroma requires delete + add)
        self.collection.delete(ids=[document_id])
        self.collection.add(
            ids=[document_id],
            documents=current["documents"],
            metadatas=[validated_metadata],
            embeddings=current["embeddings"][0] if current["embeddings"] else None
        )
    
    def export_to_dataframe(
        self,
        include_embeddings: bool = False
    ) -> pd.DataFrame:
        """Export collection to pandas DataFrame"""
        
        # Get all documents
        all_docs = self.collection.get(
            include=["documents", "metadatas", "ids"] + 
                   (["embeddings"] if include_embeddings else [])
        )
        
        # Create DataFrame
        data = []
        for i in range(len(all_docs["ids"])):
            row = {
                "id": all_docs["ids"][i],
                "text": all_docs["documents"][i],
                **all_docs["metadatas"][i]
            }
            
            if include_embeddings and all_docs.get("embeddings"):
                row["embedding"] = all_docs["embeddings"][i]
            
            data.append(row)
        
        return pd.DataFrame(data)
    
    def get_collection_analytics(self) -> Dict[str, Any]:
        """Get detailed analytics about the collection"""
        
        # Get collection count
        count = self.collection.count()
        
        # Sample for statistics (max 1000)
        sample_size = min(count, 1000)
        sample = self.collection.get(
            limit=sample_size,
            include=["metadatas"]
        )
        
        # Analyze metadata
        analytics = {
            "total_documents": count,
            "sample_size": sample_size,
            "metadata_fields": {},
            "categories": {},
            "date_range": {
                "earliest": None,
                "latest": None
            },
            "languages": {}
        }
        
        # Process sample
        for metadata in sample["metadatas"]:
            # Track fields
            for field in metadata:
                if field not in analytics["metadata_fields"]:
                    analytics["metadata_fields"][field] = 0
                analytics["metadata_fields"][field] += 1
            
            # Track categories
            if "category" in metadata:
                cat = metadata["category"]
                if cat not in analytics["categories"]:
                    analytics["categories"][cat] = 0
                analytics["categories"][cat] += 1
            
            # Track languages
            if "language" in metadata:
                lang = metadata["language"]
                if lang not in analytics["languages"]:
                    analytics["languages"][lang] = 0
                analytics["languages"][lang] += 1
            
            # Track date range
            if "created_at" in metadata:
                date = metadata["created_at"]
                if not analytics["date_range"]["earliest"] or date < analytics["date_range"]["earliest"]:
                    analytics["date_range"]["earliest"] = date
                if not analytics["date_range"]["latest"] or date > analytics["date_range"]["latest"]:
                    analytics["date_range"]["latest"] = date
        
        # Calculate percentages
        for field in analytics["metadata_fields"]:
            analytics["metadata_fields"][field] = {
                "count": analytics["metadata_fields"][field],
                "percentage": (analytics["metadata_fields"][field] / sample_size) * 100
            }
        
        return analytics

# Example usage
if __name__ == "__main__":
    store = AdvancedChromaStore(collection_name="dutch_news")
    
    # Add documents with validation
    documents = [
        {
            "text": "Nieuwe AI wetgeving van kracht in Nederland",
            "metadata": {
                "source": "nos.nl",
                "language": "nl",
                "created_at": "2024-01-15T10:00:00",
                "category": "technology",
                "tags": ["AI", "wetgeving", "Nederland"],
                "author": "Tech Redactie"
            }
        },
        {
            "text": "Privacy concerns bij gebruik van AI in gezondheidszorg",
            "metadata": {
                "source": "nrc.nl",
                "language": "nl",
                "created_at": "2024-02-01T14:30:00",
                "category": "privacy",
                "tags": ["privacy", "AI", "gezondheidszorg"]
            }
        }
    ]
    
    result = store.add_documents_with_validation(documents)
    print(f"Added: {result['added']}, Failed: {result['failed']}")
    
    # Time range search
    results = store.time_range_search(
        "AI wetgeving",
        start_date=datetime(2024, 1, 1),
        end_date=datetime(2024, 3, 1),
        k=5
    )
    
    # Get analytics
    analytics = store.get_collection_analytics()
    print(f"Collection Analytics: {json.dumps(analytics, indent=2)}")`,
      explanation: 'Advanced Chroma features including validation, time-range search, faceted search, en analytics.',
      sandboxUrl: 'https://codesandbox.io/s/chroma-advanced-features'
    },
    {
      id: 'example-3',
      title: 'Embedding Model Optimizer',
      language: 'python',
      code: `import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
import time
from sklearn.metrics.pairwise import cosine_similarity
from langchain.embeddings import OpenAIEmbeddings, HuggingFaceEmbeddings
import matplotlib.pyplot as plt
import seaborn as sns

@dataclass
class EmbeddingModelConfig:
    """Configuration for embedding models"""
    name: str
    model_id: str
    dimensions: int
    max_tokens: int
    cost_per_1k_tokens: float
    requires_api: bool
    supports_batching: bool
    
class EmbeddingModelOptimizer:
    """Optimize embedding model selection for specific use cases"""
    
    def __init__(self):
        self.models = {
            "openai-3-small": EmbeddingModelConfig(
                name="OpenAI 3 Small",
                model_id="text-embedding-3-small",
                dimensions=1536,
                max_tokens=8191,
                cost_per_1k_tokens=0.00002,
                requires_api=True,
                supports_batching=True
            ),
            "openai-3-large": EmbeddingModelConfig(
                name="OpenAI 3 Large",
                model_id="text-embedding-3-large",
                dimensions=3072,
                max_tokens=8191,
                cost_per_1k_tokens=0.00013,
                requires_api=True,
                supports_batching=True
            ),
            "multilingual-e5": EmbeddingModelConfig(
                name="Multilingual E5 Base",
                model_id="intfloat/multilingual-e5-base",
                dimensions=768,
                max_tokens=512,
                cost_per_1k_tokens=0.0,
                requires_api=False,
                supports_batching=True
            ),
            "gte-base": EmbeddingModelConfig(
                name="GTE Base",
                model_id="thenlper/gte-base",
                dimensions=768,
                max_tokens=512,
                cost_per_1k_tokens=0.0,
                requires_api=False,
                supports_batching=True
            )
        }
        
        self.test_queries = {
            "nl": [
                "Wat zijn de voordelen van machine learning?",
                "Hoe werkt kunstmatige intelligentie?",
                "Privacy wetgeving in Nederland",
                "Duurzame energie oplossingen",
                "Digitale transformatie in bedrijven"
            ],
            "en": [
                "What are the benefits of machine learning?",
                "How does artificial intelligence work?",
                "Privacy legislation in Netherlands",
                "Sustainable energy solutions",
                "Digital transformation in business"
            ]
        }
    
    def benchmark_models(
        self,
        documents: List[str],
        queries: List[str],
        models_to_test: List[str] = None
    ) -> Dict[str, Dict]:
        """Comprehensive benchmark of embedding models"""
        
        if models_to_test is None:
            models_to_test = list(self.models.keys())
        
        results = {}
        
        for model_name in models_to_test:
            print(f"\nBenchmarking {model_name}...")
            config = self.models[model_name]
            
            try:
                # Initialize embeddings
                if "openai" in model_name:
                    embeddings = OpenAIEmbeddings(model=config.model_id)
                else:
                    embeddings = HuggingFaceEmbeddings(model_name=config.model_id)
                
                # Test embedding speed
                start_time = time.time()
                doc_embeddings = embeddings.embed_documents(documents[:10])
                embed_time = time.time() - start_time
                
                # Test query speed
                start_time = time.time()
                query_embeddings = [embeddings.embed_query(q) for q in queries[:5]]
                query_time = time.time() - start_time
                
                # Test quality - semantic similarity
                quality_score = self._test_embedding_quality(
                    doc_embeddings, query_embeddings
                )
                
                # Calculate costs
                total_tokens = sum(len(d.split()) for d in documents) * 1.3  # Rough estimate
                embedding_cost = (total_tokens / 1000) * config.cost_per_1k_tokens
                
                # Memory usage
                memory_usage = len(doc_embeddings) * config.dimensions * 4 / (1024 * 1024)  # MB
                
                results[model_name] = {
                    "embed_time": embed_time,
                    "query_time": query_time,
                    "quality_score": quality_score,
                    "dimensions": config.dimensions,
                    "cost_per_1k_docs": embedding_cost * 1000 / len(documents),
                    "memory_usage_mb": memory_usage,
                    "throughput": len(documents[:10]) / embed_time
                }
                
            except Exception as e:
                results[model_name] = {"error": str(e)}
        
        return results
    
    def _test_embedding_quality(
        self,
        doc_embeddings: List[List[float]],
        query_embeddings: List[List[float]]
    ) -> float:
        """Test embedding quality using similarity metrics"""
        
        # Convert to numpy arrays
        doc_matrix = np.array(doc_embeddings)
        query_matrix = np.array(query_embeddings)
        
        # Calculate similarities
        similarities = cosine_similarity(query_matrix, doc_matrix)
        
        # Quality metrics
        # 1. Average max similarity (should be high for relevant pairs)
        avg_max_sim = np.mean(np.max(similarities, axis=1))
        
        # 2. Similarity variance (should be high - good discrimination)
        sim_variance = np.var(similarities)
        
        # 3. Similarity range (should be wide)
        sim_range = np.max(similarities) - np.min(similarities)
        
        # Combined quality score
        quality_score = (avg_max_sim * 0.4 + sim_variance * 0.3 + sim_range * 0.3)
        
        return float(quality_score)
    
    def optimize_for_use_case(
        self,
        use_case: str,
        constraints: Dict[str, Any]
    ) -> Tuple[str, Dict[str, Any]]:
        """Recommend best model for specific use case"""
        
        use_case_profiles = {
            "high_accuracy": {
                "quality_weight": 0.7,
                "speed_weight": 0.2,
                "cost_weight": 0.1
            },
            "low_latency": {
                "quality_weight": 0.3,
                "speed_weight": 0.6,
                "cost_weight": 0.1
            },
            "cost_sensitive": {
                "quality_weight": 0.3,
                "speed_weight": 0.2,
                "cost_weight": 0.5
            },
            "offline": {
                "quality_weight": 0.5,
                "speed_weight": 0.4,
                "cost_weight": 0.1,
                "requires_local": True
            }
        }
        
        profile = use_case_profiles.get(use_case, use_case_profiles["high_accuracy"])
        
        # Filter models based on constraints
        eligible_models = {}
        for name, config in self.models.items():
            # Check API requirement
            if profile.get("requires_local") and config.requires_api:
                continue
            
            # Check dimension constraints
            if "max_dimensions" in constraints and config.dimensions > constraints["max_dimensions"]:
                continue
            
            # Check token limit
            if "max_tokens" in constraints and config.max_tokens < constraints["max_tokens"]:
                continue
            
            eligible_models[name] = config
        
        if not eligible_models:
            return None, {"error": "No models meet the constraints"}
        
        # Score models
        scores = {}
        for name, config in eligible_models.items():
            # Estimate scores (would use real benchmark data in production)
            quality_score = 0.9 if "large" in name else 0.7 if "openai" in name else 0.6
            speed_score = 0.9 if config.dimensions < 1000 else 0.6
            cost_score = 1.0 if config.cost_per_1k_tokens == 0 else 0.5
            
            # Weighted score
            total_score = (
                quality_score * profile["quality_weight"] +
                speed_score * profile["speed_weight"] +
                cost_score * profile["cost_weight"]
            )
            
            scores[name] = {
                "total_score": total_score,
                "quality_score": quality_score,
                "speed_score": speed_score,
                "cost_score": cost_score,
                "config": config
            }
        
        # Get best model
        best_model = max(scores.items(), key=lambda x: x[1]["total_score"])
        
        return best_model[0], best_model[1]
    
    def dimension_reduction_analysis(
        self,
        embeddings: List[List[float]],
        target_dimensions: List[int] = [128, 256, 512, 768]
    ) -> Dict[str, Any]:
        """Analyze impact of dimension reduction"""
        
        from sklearn.decomposition import PCA
        from sklearn.random_projection import GaussianRandomProjection
        
        embeddings_np = np.array(embeddings)
        original_dim = embeddings_np.shape[1]
        
        results = {
            "original_dimensions": original_dim,
            "reduction_results": {}
        }
        
        for target_dim in target_dimensions:
            if target_dim >= original_dim:
                continue
            
            # PCA reduction
            pca = PCA(n_components=target_dim)
            pca_embeddings = pca.fit_transform(embeddings_np)
            
            # Random projection
            rp = GaussianRandomProjection(n_components=target_dim)
            rp_embeddings = rp.fit_transform(embeddings_np)
            
            # Measure quality preservation
            # Original similarities
            original_sim = cosine_similarity(embeddings_np)
            
            # Reduced similarities
            pca_sim = cosine_similarity(pca_embeddings)
            rp_sim = cosine_similarity(rp_embeddings)
            
            # Calculate correlation with original
            pca_correlation = np.corrcoef(
                original_sim.flatten(),
                pca_sim.flatten()
            )[0, 1]
            
            rp_correlation = np.corrcoef(
                original_sim.flatten(),
                rp_sim.flatten()
            )[0, 1]
            
            results["reduction_results"][target_dim] = {
                "pca": {
                    "correlation": float(pca_correlation),
                    "variance_explained": float(sum(pca.explained_variance_ratio_)),
                    "compression_ratio": original_dim / target_dim
                },
                "random_projection": {
                    "correlation": float(rp_correlation),
                    "compression_ratio": original_dim / target_dim
                }
            }
        
        return results
    
    def visualize_benchmark_results(self, benchmark_results: Dict):
        """Create visualization of benchmark results"""
        
        # Prepare data for visualization
        models = []
        metrics = {
            "quality": [],
            "speed": [],
            "cost": [],
            "memory": []
        }
        
        for model, results in benchmark_results.items():
            if "error" not in results:
                models.append(model)
                metrics["quality"].append(results.get("quality_score", 0))
                metrics["speed"].append(results.get("throughput", 0))
                metrics["cost"].append(1 / (results.get("cost_per_1k_docs", 0.1) + 0.1))
                metrics["memory"].append(1 / (results.get("memory_usage_mb", 1) + 1))
        
        # Create radar chart
        fig, ax = plt.subplots(figsize=(10, 8), subplot_kw=dict(projection='polar'))
        
        # Number of variables
        categories = list(metrics.keys())
        N = len(categories)
        
        # Compute angle for each axis
        angles = np.linspace(0, 2 * np.pi, N, endpoint=False).tolist()
        angles += angles[:1]
        
        # Plot for each model
        for i, model in enumerate(models):
            values = [metrics[cat][i] for cat in categories]
            values += values[:1]
            
            ax.plot(angles, values, 'o-', linewidth=2, label=model)
            ax.fill(angles, values, alpha=0.25)
        
        # Fix axis to go in the right order
        ax.set_theta_offset(np.pi / 2)
        ax.set_theta_direction(-1)
        
        # Draw axis lines for each angle and label
        ax.set_xticks(angles[:-1])
        ax.set_xticklabels(categories)
        
        # Add legend
        plt.legend(loc='upper right', bbox_to_anchor=(1.3, 1.0))
        plt.title("Embedding Model Comparison", size=20, y=1.08)
        
        return fig

# Example usage
if __name__ == "__main__":
    optimizer = EmbeddingModelOptimizer()
    
    # Test documents
    test_docs = [
        "Nederlandse AI strategie voor ethische ontwikkeling",
        "Machine learning in de gezondheidszorg",
        "Privacy wetgeving en GDPR compliance",
        "Duurzame energie transitie in Nederland",
        "Digitale innovatie in het onderwijs"
    ]
    
    # Benchmark models
    results = optimizer.benchmark_models(
        documents=test_docs,
        queries=optimizer.test_queries["nl"][:3]
    )
    
    print("\nBenchmark Results:")
    for model, metrics in results.items():
        if "error" not in metrics:
            print(f"\n{model}:")
            print(f"  Quality Score: {metrics['quality_score']:.3f}")
            print(f"  Throughput: {metrics['throughput']:.1f} docs/sec")
            print(f"  Cost per 1k docs: $\\{metrics['cost_per_1k_docs']:.4f\\}")
    
    # Get recommendation
    best_model, analysis = optimizer.optimize_for_use_case(
        use_case="low_latency",
        constraints={"max_dimensions": 1000}
    )
    
    print(f"\nRecommended model for low latency: {best_model}")
    print(f"Score: {analysis['total_score']:.3f}")`,
      explanation: 'Complete embedding model optimizer met benchmarking, use case analysis, en dimension reduction.',
      sandboxUrl: 'https://codesandbox.io/s/embedding-model-optimizer'
    }
  ],
  assignments: [
    {
      id: 'assignment-4-2',
      title: 'Build Production Vector Store',
      description: 'Bouw een production-ready vector store met FAISS of Chroma voor Nederlandse documenten.',
      difficulty: 'hard',
      type: 'project',
      initialCode: `# Build a production-ready vector store
# Requirements:
# 1. Support for 100k+ documents
# 2. Metadata filtering
# 3. Hybrid search (semantic + keyword)
# 4. Performance monitoring
# 5. Cost optimization

from typing import List, Dict, Any, Optional
import time

class ProductionVectorStore:
    def __init__(self, store_type: str = "faiss"):
        # Initialize your vector store
        self.store_type = store_type
        # TODO: Setup embedding model
        # TODO: Initialize vector store
        
    def add_documents(
        self, 
        documents: List[Dict[str, Any]], 
        batch_size: int = 1000
    ) -> Dict[str, Any]:
        """Add documents with metadata in batches"""
        # TODO: Implement batch processing
        # TODO: Add progress tracking
        # TODO: Handle errors gracefully
        pass
    
    def search(
        self,
        query: str,
        k: int = 10,
        filters: Optional[Dict] = None,
        search_type: str = "hybrid"
    ) -> List[Dict]:
        """Advanced search with multiple strategies"""
        # TODO: Implement semantic search
        # TODO: Implement keyword search
        # TODO: Combine results for hybrid
        # TODO: Apply metadata filters
        pass
    
    def optimize_performance(self):
        """Optimize index for better performance"""
        # TODO: Analyze current performance
        # TODO: Apply optimizations
        # TODO: Report improvements
        pass

# Test your implementation
if __name__ == "__main__":
    # Initialize store
    store = ProductionVectorStore("faiss")
    
    # Test data
    test_docs = [
        {
            "text": "AI ontwikkelingen in Nederland",
            "metadata": {"source": "news", "date": "2024-01-15"}
        }
    ]
    
    # Add documents
    result = store.add_documents(test_docs)
    print(f"Added {result['success']} documents")
    
    # Search
    results = store.search("kunstmatige intelligentie", k=5)
    print(f"Found {len(results)} results")`,
      solution: 'See the complete FAISS and Chroma implementations in the code examples above',
      hints: [
        'Choose index type based on collection size',
        'Implement caching for frequent queries',
        'Use batch processing for embeddings',
        'Monitor performance metrics continuously'
      ]
    }
  ],
  resources: [
    {
      title: 'FAISS Documentation',
      url: 'https://github.com/facebookresearch/faiss/wiki',
      type: 'documentation'
    },
    {
      title: 'Chroma DB Docs',
      url: 'https://docs.trychroma.com/',
      type: 'documentation'
    },
    {
      title: 'OpenAI Embeddings Guide',
      url: 'https://platform.openai.com/docs/guides/embeddings',
      type: 'guide'
    },
    {
      title: 'Vector Database Comparison',
      url: 'https://github.com/erikbern/ann-benchmarks',
      type: 'benchmark'
    }
  ]
}
