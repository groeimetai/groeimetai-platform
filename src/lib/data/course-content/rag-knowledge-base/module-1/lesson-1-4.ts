import { Lesson } from '@/lib/data/courses'

export const lesson1_4: Lesson = {
  id: 'lesson-1-4',
  title: 'Context windows en token limits: Praktische beperkingen',
  duration: '30 min',
  content: `# Context windows en token limits: Praktische beperkingen

## Inleiding

Bij het werken met Large Language Models (LLMs) en RAG-systemen is het begrip van context windows en token limits cruciaal. Deze beperkingen bepalen hoeveel informatie je tegelijk aan een model kunt aanbieden en hebben directe impact op de prestaties, kosten en architectuur van je RAG-implementatie.

## Wat zijn tokens?

Tokens zijn de basiseenheden waarmee LLMs tekst verwerken. Een token kan zijn:
- Een heel woord: "kat" = 1 token
- Een deel van een woord: "ongelooflijk" ≈ 3-4 tokens
- Leestekens: "!" = 1 token
- Spaties en nieuwe regels

### Vuistregel voor tokens
- **Engels**: 1 token ≈ 4 karakters of 0.75 woorden
- **Nederlands**: 1 token ≈ 3-4 karakters (meer samenstellingen)
- **Code**: Vaak meer tokens door syntax en speciale karakters

## Context window groottes per model

### OpenAI GPT modellen
- **GPT-3.5-turbo**: 4,096 tokens (≈ 3,000 woorden)
- **GPT-3.5-turbo-16k**: 16,384 tokens (≈ 12,000 woorden)
- **GPT-4**: 8,192 tokens (≈ 6,000 woorden)
- **GPT-4-32k**: 32,768 tokens (≈ 24,000 woorden)
- **GPT-4-turbo**: 128,000 tokens (≈ 96,000 woorden)

### Anthropic Claude modellen
- **Claude 2**: 100,000 tokens (≈ 75,000 woorden)
- **Claude 3**: 200,000 tokens (≈ 150,000 woorden)
- **Claude 3.5 Sonnet**: 200,000 tokens

### Open source alternatieven
- **Llama 2**: 4,096 tokens
- **Llama 3**: 8,192 tokens
- **Mistral 7B**: 8,192 tokens
- **Mixtral 8x7B**: 32,768 tokens

## Token counting in de praktijk

### Methode 1: OpenAI Tokenizer
\`\`\`python
import tiktoken

def count_tokens(text: str, model: str = "gpt-4") -> int:
    """Tel het aantal tokens voor een gegeven tekst."""
    encoding = tiktoken.encoding_for_model(model)
    tokens = encoding.encode(text)
    return len(tokens)

# Voorbeeld gebruik
text = "Dit is een voorbeeld van een Nederlandse zin met tokens."
token_count = count_tokens(text)
print(f"Aantal tokens: {token_count}")
\`\`\`

### Methode 2: Schatting voor andere modellen
\`\`\`python
def estimate_tokens(text: str, chars_per_token: float = 4.0) -> int:
    """Schat het aantal tokens op basis van karakters."""
    return int(len(text) / chars_per_token)

# Voor verschillende talen
def estimate_tokens_by_language(text: str, language: str = "en") -> int:
    char_ratios = {
        "en": 4.0,    # Engels
        "nl": 3.5,    # Nederlands
        "de": 3.5,    # Duits
        "code": 2.5   # Programmeertalen
    }
    ratio = char_ratios.get(language, 4.0)
    return int(len(text) / ratio)
\`\`\`

## Strategieën voor grote contexten

### 1. Chunking strategieën

\`\`\`python
from typing import List, Tuple
import tiktoken

class TextChunker:
    def __init__(self, model: str = "gpt-4", max_tokens: int = 2000):
        self.encoding = tiktoken.encoding_for_model(model)
        self.max_tokens = max_tokens
    
    def chunk_by_tokens(self, text: str, overlap: int = 200) -> List[str]:
        """Splits tekst in chunks met token limiet en overlap."""
        tokens = self.encoding.encode(text)
        chunks = []
        
        start = 0
        while start < len(tokens):
            end = min(start + self.max_tokens, len(tokens))
            chunk_tokens = tokens[start:end]
            chunks.append(self.encoding.decode(chunk_tokens))
            start = end - overlap  # Overlap voor context continuïteit
            
        return chunks
    
    def chunk_by_semantics(self, text: str) -> List[str]:
        """Splits tekst op natuurlijke grenzen (paragrafen, zinnen)."""
        import re
        
        # Split op dubbele newlines (paragrafen)
        paragraphs = re.split(r'\\n\\n+', text)
        
        chunks = []
        current_chunk = ""
        current_tokens = 0
        
        for para in paragraphs:
            para_tokens = len(self.encoding.encode(para))
            
            if current_tokens + para_tokens > self.max_tokens:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = para
                current_tokens = para_tokens
            else:
                current_chunk += "\\n\\n" + para
                current_tokens += para_tokens
        
        if current_chunk:
            chunks.append(current_chunk.strip())
            
        return chunks
\`\`\`

### 2. Context compressie

\`\`\`python
class ContextCompressor:
    def __init__(self, target_ratio: float = 0.5):
        self.target_ratio = target_ratio
    
    def compress_by_importance(self, text: str, query: str) -> str:
        """Comprimeer tekst door minder relevante delen te verwijderen."""
        from sentence_transformers import SentenceTransformer
        import numpy as np
        
        model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Split in zinnen
        sentences = text.split('. ')
        
        # Bereken relevantie scores
        query_embedding = model.encode(query)
        sentence_embeddings = model.encode(sentences)
        
        similarities = np.dot(sentence_embeddings, query_embedding)
        
        # Selecteer top zinnen
        target_sentences = int(len(sentences) * self.target_ratio)
        top_indices = np.argsort(similarities)[-target_sentences:]
        
        # Behoud volgorde
        top_indices.sort()
        compressed = '. '.join([sentences[i] for i in top_indices])
        
        return compressed + '.'
    
    def summarize_chunk(self, text: str, max_tokens: int = 500) -> str:
        """Vat een chunk samen tot een kleiner aantal tokens."""
        # Dit zou een LLM call zijn
        prompt = f"Vat de volgende tekst samen in maximaal {max_tokens} tokens:\\n{text}"
        # Placeholder voor LLM response
        return f"[Samenvatting van {len(text)} karakters]"
\`\`\`

### 3. Reranking voor efficiënt context gebruik

\`\`\`python
class ContextReranker:
    def __init__(self, max_context_tokens: int = 4000):
        self.max_context_tokens = max_context_tokens
        self.encoding = tiktoken.encoding_for_model("gpt-4")
    
    def rerank_chunks(self, query: str, chunks: List[Tuple[str, float]], 
                     reserved_tokens: int = 1000) -> List[str]:
        """
        Herschik chunks op basis van relevantie binnen token budget.
        reserved_tokens: tokens gereserveerd voor query en response
        """
        available_tokens = self.max_context_tokens - reserved_tokens
        
        # Sorteer chunks op score (hoogste eerst)
        sorted_chunks = sorted(chunks, key=lambda x: x[1], reverse=True)
        
        selected_chunks = []
        total_tokens = 0
        
        for chunk, score in sorted_chunks:
            chunk_tokens = len(self.encoding.encode(chunk))
            
            if total_tokens + chunk_tokens <= available_tokens:
                selected_chunks.append(chunk)
                total_tokens += chunk_tokens
            else:
                # Probeer een kleinere versie
                remaining_tokens = available_tokens - total_tokens
                if remaining_tokens > 100:  # Minimaal 100 tokens
                    truncated = self.truncate_to_tokens(chunk, remaining_tokens)
                    selected_chunks.append(truncated)
                break
        
        return selected_chunks
    
    def truncate_to_tokens(self, text: str, max_tokens: int) -> str:
        """Knip tekst af tot maximaal aantal tokens."""
        tokens = self.encoding.encode(text)
        if len(tokens) <= max_tokens:
            return text
        
        truncated_tokens = tokens[:max_tokens]
        return self.encoding.decode(truncated_tokens) + "..."
\`\`\`

## Kosten berekening

### Kostencalculator
\`\`\`python
class RAGCostCalculator:
    # Prijzen per 1M tokens (November 2024)
    PRICING = {
        "gpt-3.5-turbo": {"input": 0.50, "output": 1.50},
        "gpt-4": {"input": 30.00, "output": 60.00},
        "gpt-4-turbo": {"input": 10.00, "output": 30.00},
        "claude-3-haiku": {"input": 0.25, "output": 1.25},
        "claude-3-sonnet": {"input": 3.00, "output": 15.00},
        "claude-3-opus": {"input": 15.00, "output": 75.00}
    }
    
    def calculate_cost(self, model: str, input_tokens: int, 
                      output_tokens: int) -> float:
        """Bereken kosten voor een enkele query."""
        if model not in self.PRICING:
            raise ValueError(f"Onbekend model: {model}")
        
        prices = self.PRICING[model]
        input_cost = (input_tokens / 1_000_000) * prices["input"]
        output_cost = (output_tokens / 1_000_000) * prices["output"]
        
        return round(input_cost + output_cost, 4)
    
    def estimate_rag_cost(self, model: str, avg_context_size: int,
                         avg_response_size: int, queries_per_day: int,
                         days: int = 30) -> dict:
        """Schat maandelijkse RAG kosten."""
        cost_per_query = self.calculate_cost(
            model, avg_context_size, avg_response_size
        )
        
        daily_cost = cost_per_query * queries_per_day
        total_cost = daily_cost * days
        
        return {
            "model": model,
            "cost_per_query": f"\${cost_per_query:.4f}",
            "daily_cost": f"\${daily_cost:.2f}",
            "monthly_cost": f"\${total_cost:.2f}",
            "context_window_usage": f"{(avg_context_size / self.get_max_tokens(model)) * 100:.1f}%"
        }
    
    def get_max_tokens(self, model: str) -> int:
        """Geef max tokens voor model."""
        limits = {
            "gpt-3.5-turbo": 4096,
            "gpt-4": 8192,
            "gpt-4-turbo": 128000,
            "claude-3-haiku": 200000,
            "claude-3-sonnet": 200000,
            "claude-3-opus": 200000
        }
        return limits.get(model, 4096)
\`\`\`

## Praktisch voorbeeld: Optimale RAG pipeline

\`\`\`python
class OptimizedRAGPipeline:
    def __init__(self, model: str = "gpt-4", max_context_ratio: float = 0.8):
        self.model = model
        self.tokenizer = tiktoken.encoding_for_model(model)
        self.max_tokens = self.get_model_limit(model)
        self.max_context = int(self.max_tokens * max_context_ratio)
        self.chunker = TextChunker(model, max_tokens=2000)
        self.reranker = ContextReranker(self.max_context)
        self.cost_calc = RAGCostCalculator()
    
    def get_model_limit(self, model: str) -> int:
        limits = {
            "gpt-3.5-turbo": 4096,
            "gpt-4": 8192,
            "gpt-4-turbo": 128000
        }
        return limits.get(model, 4096)
    
    def process_query(self, query: str, documents: List[str]) -> dict:
        """Verwerk een query met optimale context management."""
        # 1. Chunk documenten
        all_chunks = []
        for doc in documents:
            chunks = self.chunker.chunk_by_semantics(doc)
            all_chunks.extend(chunks)
        
        # 2. Bereken relevantie scores (placeholder)
        scored_chunks = [(chunk, self.calculate_relevance(query, chunk)) 
                        for chunk in all_chunks]
        
        # 3. Tel query tokens
        query_tokens = len(self.tokenizer.encode(query))
        reserved_tokens = query_tokens + 500  # Reserve voor response
        
        # 4. Selecteer chunks binnen budget
        selected_chunks = self.reranker.rerank_chunks(
            query, scored_chunks, reserved_tokens
        )
        
        # 5. Bouw context
        context = "\\n\\n".join(selected_chunks)
        context_tokens = len(self.tokenizer.encode(context))
        
        # 6. Bereken kosten
        estimated_output = 500  # Geschatte response grootte
        cost = self.cost_calc.calculate_cost(
            self.model, context_tokens + query_tokens, estimated_output
        )
        
        return {
            "context": context,
            "context_tokens": context_tokens,
            "total_chunks": len(all_chunks),
            "selected_chunks": len(selected_chunks),
            "estimated_cost": cost,
            "context_usage": f"{(context_tokens / self.max_tokens) * 100:.1f}%"
        }
    
    def calculate_relevance(self, query: str, chunk: str) -> float:
        """Bereken relevantie score (placeholder voor embedding similarity)."""
        # In praktijk: gebruik embedding model
        import random
        return random.random()
\`\`\`

## Best practices voor prompt engineering met RAG

### 1. Structureer je prompts efficiënt
\`\`\`python
def create_efficient_rag_prompt(query: str, context: str, 
                               instructions: str = None) -> str:
    """Creëer een efficiënte RAG prompt."""
    prompt_parts = []
    
    # Systeem instructies (indien nodig)
    if instructions:
        prompt_parts.append(f"Instructies: {instructions}")
    
    # Context met duidelijke afbakening
    prompt_parts.append("=== CONTEXT ===")
    prompt_parts.append(context)
    prompt_parts.append("=== EINDE CONTEXT ===")
    
    # Query
    prompt_parts.append(f"\\nVraag: {query}")
    prompt_parts.append("\\nAntwoord op basis van de gegeven context:")
    
    return "\\n".join(prompt_parts)
\`\`\`

### 2. Token-bewuste prompt templates
\`\`\`python
class TokenAwarePromptTemplate:
    def __init__(self, model: str, max_context_ratio: float = 0.7):
        self.encoding = tiktoken.encoding_for_model(model)
        self.max_tokens = 4096  # Default
        self.max_context_tokens = int(self.max_tokens * max_context_ratio)
    
    def format_with_budget(self, template: str, **kwargs) -> str:
        """Format template met token budget controle."""
        formatted = template
        remaining_tokens = self.max_context_tokens
        
        for key, value in kwargs.items():
            if key == "context":
                # Knip context af indien nodig
                value_tokens = len(self.encoding.encode(str(value)))
                if value_tokens > remaining_tokens:
                    value = self.truncate_to_tokens(str(value), remaining_tokens)
            
            placeholder = "{" + key + "}"
            formatted = formatted.replace(placeholder, str(value))
            remaining_tokens -= len(self.encoding.encode(str(value)))
        
        return formatted
    
    def truncate_to_tokens(self, text: str, max_tokens: int) -> str:
        tokens = self.encoding.encode(text)
        if len(tokens) <= max_tokens:
            return text
        return self.encoding.decode(tokens[:max_tokens]) + "..."
\`\`\`

## Geavanceerde optimalisatie technieken

### Dynamic context window sizing
\`\`\`python
class DynamicContextManager:
    def __init__(self, models: List[str]):
        self.models = models
        self.model_limits = {
            "gpt-3.5-turbo": 4096,
            "gpt-4": 8192,
            "gpt-4-turbo": 128000,
            "claude-3-sonnet": 200000
        }
    
    def select_optimal_model(self, required_tokens: int, 
                           budget_per_query: float = 0.10) -> str:
        """Selecteer optimaal model op basis van tokens en budget."""
        suitable_models = [
            m for m in self.models 
            if self.model_limits.get(m, 0) >= required_tokens
        ]
        
        if not suitable_models:
            raise ValueError(f"Geen model kan {required_tokens} tokens aan")
        
        # Sorteer op kosten
        cost_calc = RAGCostCalculator()
        model_costs = []
        
        for model in suitable_models:
            cost = cost_calc.calculate_cost(model, required_tokens, 500)
            if cost <= budget_per_query:
                model_costs.append((model, cost))
        
        if not model_costs:
            return suitable_models[0]  # Goedkoopste die past
        
        # Kies model met beste prijs/prestatie verhouding
        return sorted(model_costs, key=lambda x: x[1])[0][0]
\`\`\`

## Conclusie

Het begrijpen en effectief managen van context windows en token limits is essentieel voor succesvolle RAG-implementaties. Door slim om te gaan met chunking, compressie en reranking kun je de prestaties optimaliseren terwijl je de kosten beheersbaar houdt.

### Belangrijkste takeaways:
1. **Ken je limits**: Verschillende modellen hebben zeer verschillende capaciteiten
2. **Tel je tokens**: Gebruik tools zoals tiktoken voor accurate tellingen
3. **Optimaliseer agressief**: Elke token telt voor prestaties en kosten
4. **Chunk slim**: Semantische chunking > vaste grootte chunking
5. **Rerank effectief**: Plaats meest relevante content eerst
6. **Monitor kosten**: Houd token gebruik en kosten nauwlettend in de gaten

In de volgende les gaan we dieper in op de integratie van vector databases voor efficiënte retrieval.`,
  codeExamples: [
    {
      id: 'token-counter-implementation',
      title: 'Token counter implementatie',
      language: 'python',
      code: `import tiktoken
from typing import Dict, List

class TokenCounter:
    def __init__(self):
        self.encodings = {}
    
    def get_encoding(self, model: str):
        """Cache encodings voor betere prestaties."""
        if model not in self.encodings:
            self.encodings[model] = tiktoken.encoding_for_model(model)
        return self.encodings[model]
    
    def count_tokens(self, text: str, model: str = "gpt-4") -> int:
        """Tel tokens voor specifiek model."""
        encoding = self.get_encoding(model)
        return len(encoding.encode(text))
    
    def count_tokens_batch(self, texts: List[str], model: str = "gpt-4") -> Dict[str, int]:
        """Tel tokens voor meerdere teksten."""
        encoding = self.get_encoding(model)
        return {
            f"text_{i}": len(encoding.encode(text))
            for i, text in enumerate(texts)
        }
    
    def analyze_token_distribution(self, text: str, model: str = "gpt-4") -> Dict:
        """Analyseer token distributie in tekst."""
        encoding = self.get_encoding(model)
        tokens = encoding.encode(text)
        
        return {
            "total_tokens": len(tokens),
            "unique_tokens": len(set(tokens)),
            "avg_token_length": sum(len(encoding.decode([t])) for t in tokens) / len(tokens),
            "estimated_cost_gpt4": (len(tokens) / 1000) * 0.03,  # $0.03 per 1K tokens
            "percentage_of_context": (len(tokens) / 8192) * 100  # Voor GPT-4
        }

# Gebruik
counter = TokenCounter()
text = "Dit is een voorbeeld van Nederlandse tekst voor token analyse."
analysis = counter.analyze_token_distribution(text)
print(f"Token analyse: {analysis}")`
    },
    {
      id: 'smart-chunking-overlap',
      title: 'Smart chunking met overlap',
      language: 'python',
      code: `from typing import List, Tuple
import re

class SmartChunker:
    def __init__(self, chunk_size: int = 1000, overlap: int = 200):
        self.chunk_size = chunk_size
        self.overlap = overlap
    
    def chunk_by_sentences(self, text: str) -> List[str]:
        """Chunk tekst op zin-niveau met overlap."""
        # Split op zinnen
        sentences = re.split(r'(?<=[.!?])\\s+', text)
        
        chunks = []
        current_chunk = []
        current_size = 0
        
        for sentence in sentences:
            sentence_size = len(sentence.split())
            
            if current_size + sentence_size > self.chunk_size and current_chunk:
                # Maak chunk
                chunks.append(' '.join(current_chunk))
                
                # Bepaal overlap
                overlap_sentences = []
                overlap_size = 0
                
                for sent in reversed(current_chunk):
                    overlap_size += len(sent.split())
                    overlap_sentences.insert(0, sent)
                    if overlap_size >= self.overlap:
                        break
                
                current_chunk = overlap_sentences
                current_size = overlap_size
            
            current_chunk.append(sentence)
            current_size += sentence_size
        
        if current_chunk:
            chunks.append(' '.join(current_chunk))
        
        return chunks
    
    def chunk_by_paragraphs(self, text: str) -> List[str]:
        """Chunk op paragraaf niveau."""
        paragraphs = re.split(r'\\n\\n+', text)
        
        chunks = []
        current_chunk = []
        current_size = 0
        
        for para in paragraphs:
            para_size = len(para.split())
            
            if current_size + para_size > self.chunk_size and current_chunk:
                chunks.append('\\n\\n'.join(current_chunk))
                current_chunk = []
                current_size = 0
            
            current_chunk.append(para)
            current_size += para_size
        
        if current_chunk:
            chunks.append('\\n\\n'.join(current_chunk))
        
        return chunks
    
    def chunk_code(self, code: str, language: str = "python") -> List[str]:
        """Speciale chunking voor code."""
        if language == "python":
            # Split op functie/class definities
            pattern = r'(^(?:def|class)\\s+\\w+.*?)(?=^(?:def|class)\\s+|\\Z)'
            
            matches = re.findall(pattern, code, re.MULTILINE | re.DOTALL)
            
            chunks = []
            for match in matches:
                if len(match.split('\\n')) > 50:  # Te grote functie
                    # Split verder op logische blokken
                    sub_chunks = self.chunk_by_sentences(match)
                    chunks.extend(sub_chunks)
                else:
                    chunks.append(match)
            
            return chunks
        
        # Fallback voor andere talen
        return self.chunk_by_sentences(code)`
    },
    {
      id: 'context-window-optimizer',
      title: 'Context window optimizer',
      language: 'python',
      code: `import numpy as np
from typing import List, Tuple, Dict
from sentence_transformers import SentenceTransformer

class ContextWindowOptimizer:
    def __init__(self, model_name: str = "gpt-4", embedding_model: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.max_tokens = self.get_max_tokens(model_name)
        self.embedding_model = SentenceTransformer(embedding_model)
        
    def get_max_tokens(self, model: str) -> int:
        limits = {
            "gpt-3.5-turbo": 4096,
            "gpt-4": 8192,
            "gpt-4-turbo": 128000,
            "claude-3-sonnet": 200000
        }
        return limits.get(model, 4096)
    
    def optimize_context(self, query: str, chunks: List[str], 
                        reserved_tokens: int = 1000) -> Tuple[List[str], Dict]:
        """Optimaliseer context selectie binnen token budget."""
        import tiktoken
        encoding = tiktoken.encoding_for_model(self.model_name)
        
        # Bereken beschikbare tokens
        query_tokens = len(encoding.encode(query))
        available_tokens = self.max_tokens - reserved_tokens - query_tokens
        
        # Bereken relevantie scores
        query_embedding = self.embedding_model.encode(query)
        chunk_embeddings = self.embedding_model.encode(chunks)
        
        similarities = np.dot(chunk_embeddings, query_embedding)
        
        # Sorteer chunks op relevantie
        chunk_scores = list(zip(chunks, similarities))
        chunk_scores.sort(key=lambda x: x[1], reverse=True)
        
        # Selecteer chunks binnen budget
        selected_chunks = []
        total_tokens = 0
        stats = {
            "total_chunks": len(chunks),
            "selected_chunks": 0,
            "total_tokens": 0,
            "utilization": 0.0,
            "avg_relevance": 0.0
        }
        
        relevance_scores = []
        
        for chunk, score in chunk_scores:
            chunk_tokens = len(encoding.encode(chunk))
            
            if total_tokens + chunk_tokens <= available_tokens:
                selected_chunks.append(chunk)
                total_tokens += chunk_tokens
                relevance_scores.append(score)
            else:
                # Probeer partial chunk
                remaining = available_tokens - total_tokens
                if remaining > 100:  # Minimaal 100 tokens
                    partial = self.truncate_to_tokens(chunk, remaining, encoding)
                    selected_chunks.append(partial)
                    total_tokens += len(encoding.encode(partial))
                    relevance_scores.append(score * 0.8)  # Penalty voor truncatie
                break
        
        # Update stats
        stats["selected_chunks"] = len(selected_chunks)
        stats["total_tokens"] = total_tokens
        stats["utilization"] = (total_tokens / available_tokens) * 100
        stats["avg_relevance"] = np.mean(relevance_scores) if relevance_scores else 0
        
        return selected_chunks, stats
    
    def truncate_to_tokens(self, text: str, max_tokens: int, encoding) -> str:
        """Knip tekst netjes af op token grens."""
        tokens = encoding.encode(text)
        if len(tokens) <= max_tokens:
            return text
        
        # Probeer op zin grens af te knippen
        truncated = encoding.decode(tokens[:max_tokens])
        last_period = truncated.rfind('.')
        last_newline = truncated.rfind('\\n')
        
        cut_point = max(last_period, last_newline)
        if cut_point > max_tokens * 0.8:  # Niet te veel verliezen
            return truncated[:cut_point + 1]
        
        return truncated + "..."
    
    def suggest_model_upgrade(self, required_tokens: int) -> str:
        """Suggereer model upgrade als nodig."""
        if required_tokens <= 4096:
            return "gpt-3.5-turbo"
        elif required_tokens <= 8192:
            return "gpt-4"
        elif required_tokens <= 32768:
            return "gpt-4-32k"
        elif required_tokens <= 128000:
            return "gpt-4-turbo"
        else:
            return "claude-3-sonnet"  # 200k tokens`
    }
  ],
  assignments: [
    {
      id: 'token-calculation',
      title: 'Token berekening en optimalisatie',
      description: 'Implementeer een token calculator die de kosten voor verschillende modellen vergelijkt.',
      difficulty: 'medium',
      type: 'project',
      hints: [
        'Gebruik tiktoken voor accurate token telling',
        'Vergelijk minimaal 3 verschillende modellen',
        'Bereken kosten voor zowel input als output tokens'
      ]
    },
    {
      id: 'smart-chunker',
      title: 'Bouw een slimme document chunker',
      description: 'Creëer een chunking systeem dat rekening houdt met document structuur en semantische grenzen.',
      difficulty: 'expert',
      type: 'project',
      hints: [
        'Detecteer verschillende content types (tekst, code, tabellen)',
        'Implementeer overlap voor context continuïteit',
        'Zorg voor configureerbare chunk groottes'
      ]
    },
    {
      id: 'context-optimizer',
      title: 'Context window optimization challenge',
      description: 'Gegeven 10 documenten en een query, selecteer de optimale chunks binnen een 4k token budget.',
      difficulty: 'expert',
      type: 'project',
      hints: [
        'Gebruik embeddings voor relevantie scoring',
        'Implementeer een greedy algoritme voor chunk selectie',
        'Maximaliseer zowel relevantie als context window gebruik'
      ]
    }
  ],
  resources: [
    {
      title: 'OpenAI Tokenizer',
      url: 'https://platform.openai.com/tokenizer',
      type: 'tool'
    },
    {
      title: 'Tiktoken Library Documentation',
      url: 'https://github.com/openai/tiktoken',
      type: 'documentation'
    },
    {
      title: 'LangChain Text Splitters',
      url: 'https://python.langchain.com/docs/modules/data_connection/document_transformers/',
      type: 'documentation'
    },
    {
      title: 'Token Limits Comparison Table',
      url: 'https://platform.openai.com/docs/models',
      type: 'reference'
    },
    {
      title: 'Cost Optimization Strategies for LLMs',
      url: 'https://www.anyscale.com/blog/llm-cost-optimization',
      type: 'article'
    }
  ]
}