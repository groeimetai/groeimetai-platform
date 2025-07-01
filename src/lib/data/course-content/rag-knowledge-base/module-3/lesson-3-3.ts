import { Lesson } from '@/lib/data/courses'

export const lesson3_3: Lesson = {
  id: 'lesson-3-3',
  title: 'Metadata extraction en document structuur',
  duration: '35 min',
  content: `# Metadata Extraction en Document Structuur

Metadata speelt een cruciale rol in RAG systemen door contextuele informatie toe te voegen die helpt bij het vinden, filteren en rangschikken van relevante documenten. In deze les leer je hoe je effectief metadata extraheert en gebruikt.

## Waarom is Metadata Belangrijk in RAG?

### 1. Verbeterde Retrieval Precisie
- **Contextuele filtering**: Filter resultaten op datum, auteur, of documenttype
- **Relevantie scoring**: Gebruik metadata voor betere ranking
- **Multi-modale search**: Combineer tekst met metadata filters

### 2. Betere Context voor LLMs
- **Source attribution**: Vermeld bronnen in gegenereerde antwoorden
- **Temporal awareness**: Onderscheid tussen actuele en verouderde informatie
- **Domain-specific context**: Geef domein-specifieke context mee

### 3. Gebruikerservaring
- **Faceted search**: Bied gebruikers filter opties
- **Transparantie**: Toon bronnen en metadata in resultaten
- **Personalisatie**: Pas resultaten aan op gebruikersvoorkeuren

## Types Metadata

### Document-level Metadata
Informatie die het hele document beschrijft:
- **Titel en auteur**
- **Publicatiedatum en laatste update**
- **Documenttype** (artikel, rapport, handleiding)
- **Taal en regio**
- **Versienummer**
- **Tags en categorieën**

### Section-level Metadata
Informatie over specifieke delen:
- **Headers en subheaders**
- **Paragraaf nummers**
- **Sectie types** (introductie, conclusie, methodologie)
- **Nesting niveau**

### Semantic Metadata
Betekenisvolle informatie uit de content:
- **Onderwerpen en thema's**
- **Named entities** (personen, organisaties, locaties)
- **Sentimenten en toon**
- **Kernconcepten en termen**

### Structural Metadata
Informatie over de structuur:
- **Tabellen en hun headers**
- **Lijsten en opsommingen**
- **Code blokken en taal**
- **Afbeeldingen en captions**
- **Links en referenties**

## Extraction Technieken

### 1. Regular Expressions
Voor gestructureerde patronen:
\`\`\`python
import re
from datetime import datetime
from typing import Dict, List, Optional

class RegexMetadataExtractor:
    def __init__(self):
        self.patterns = {
            'email': r'\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',
            'date': r'\\b(\\d{1,2}[-/]\\d{1,2}[-/]\\d{2,4}|\\d{4}[-/]\\d{1,2}[-/]\\d{1,2})\\b',
            'url': r'https?://[^\\s]+',
            'header': r'^#{1,6}\\s+(.+)$',
            'code_block': r'\\\`\\\`\\\`(\\w+)?\\n([\\s\\S]*?)\\n\\\`\\\`\\\`'
        }
    
    def extract_emails(self, text: str) -> List[str]:
        return re.findall(self.patterns['email'], text)
    
    def extract_dates(self, text: str) -> List[Dict[str, any]]:
        dates = []
        for match in re.finditer(self.patterns['date'], text):
            try:
                # Probeer verschillende date formats
                date_str = match.group()
                for fmt in ['%d-%m-%Y', '%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y']:
                    try:
                        parsed_date = datetime.strptime(date_str, fmt)
                        dates.append({
                            'text': date_str,
                            'parsed': parsed_date,
                            'position': match.span()
                        })
                        break
                    except ValueError:
                        continue
            except:
                pass
        return dates
    
    def extract_headers(self, markdown_text: str) -> List[Dict[str, any]]:
        headers = []
        for line_num, line in enumerate(markdown_text.split('\\n')):
            match = re.match(self.patterns['header'], line)
            if match:
                level = len(re.match(r'^(#+)', line).group(1))
                headers.append({
                    'text': match.group(1).strip(),
                    'level': level,
                    'line': line_num
                })
        return headers
    
    def extract_code_blocks(self, text: str) -> List[Dict[str, str]]:
        code_blocks = []
        for match in re.finditer(self.patterns['code_block'], text, re.MULTILINE):
            code_blocks.append({
                'language': match.group(1) or 'plain',
                'code': match.group(2),
                'position': match.span()
            })
        return code_blocks
\`\`\`

### 2. NLP-based Extraction
Voor complexere taalelementen:
\`\`\`python
import spacy
from collections import Counter
from typing import Dict, List, Set

class NLPMetadataExtractor:
    def __init__(self, model_name: str = "nl_core_news_lg"):
        self.nlp = spacy.load(model_name)
        
    def extract_entities(self, text: str) -> Dict[str, List[str]]:
        doc = self.nlp(text)
        entities = {
            'persons': [],
            'organizations': [],
            'locations': [],
            'dates': [],
            'money': [],
            'products': []
        }
        
        entity_mapping = {
            'PER': 'persons',
            'ORG': 'organizations',
            'LOC': 'locations',
            'DATE': 'dates',
            'MONEY': 'money',
            'PRODUCT': 'products'
        }
        
        for ent in doc.ents:
            if ent.label_ in entity_mapping:
                entities[entity_mapping[ent.label_]].append(ent.text)
        
        # Dedupliceer
        for key in entities:
            entities[key] = list(set(entities[key]))
            
        return entities
    
    def extract_key_phrases(self, text: str, top_n: int = 10) -> List[tuple]:
        doc = self.nlp(text)
        
        # Extract noun phrases
        noun_phrases = []
        for chunk in doc.noun_chunks:
            # Filter op lengte en relevantie
            if 2 <= len(chunk.text.split()) <= 4:
                noun_phrases.append(chunk.text.lower())
        
        # Tel frequentie
        phrase_freq = Counter(noun_phrases)
        return phrase_freq.most_common(top_n)
    
    def extract_summary_sentences(self, text: str, num_sentences: int = 3) -> List[str]:
        doc = self.nlp(text)
        sentences = list(doc.sents)
        
        # Score sentences based on entity density en positie
        sentence_scores = []
        for i, sent in enumerate(sentences):
            # Hogere score voor eerste en laatste zinnen
            position_score = 1.0 if i < 2 or i >= len(sentences) - 2 else 0.5
            
            # Entity density
            entity_score = len([ent for ent in sent.ents]) / len(sent)
            
            # Lengte score (niet te kort, niet te lang)
            length_score = 1.0 if 10 <= len(sent) <= 30 else 0.5
            
            total_score = position_score + entity_score + length_score
            sentence_scores.append((sent.text, total_score))
        
        # Sorteer en return top sentences
        sentence_scores.sort(key=lambda x: x[1], reverse=True)
        return [sent[0] for sent in sentence_scores[:num_sentences]]
    
    def analyze_sentiment(self, text: str) -> Dict[str, float]:
        # Simpele sentiment analyse (uitbreiden met echte sentiment model)
        doc = self.nlp(text)
        
        positive_words = {'goed', 'uitstekend', 'geweldig', 'positief', 'succesvol'}
        negative_words = {'slecht', 'negatief', 'probleem', 'fout', 'mislukt'}
        
        words = [token.text.lower() for token in doc]
        
        positive_count = sum(1 for word in words if word in positive_words)
        negative_count = sum(1 for word in words if word in negative_words)
        total = len(words)
        
        return {
            'positive': positive_count / total if total > 0 else 0,
            'negative': negative_count / total if total > 0 else 0,
            'neutral': 1 - (positive_count + negative_count) / total if total > 0 else 1
        }
\`\`\`

### 3. LLM-based Extraction
Voor complexe en contextuele metadata:
\`\`\`python
from typing import Dict, List, Optional
import json
from langchain.prompts import PromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

class DocumentMetadata(BaseModel):
    title: str = Field(description="Document title")
    summary: str = Field(description="Brief summary (max 200 chars)")
    main_topics: List[str] = Field(description="Main topics covered")
    document_type: str = Field(description="Type: article, report, tutorial, etc")
    technical_level: str = Field(description="Level: beginner, intermediate, advanced")
    key_concepts: List[str] = Field(description="Key technical concepts")
    target_audience: str = Field(description="Intended audience")
    
class LLMMetadataExtractor:
    def __init__(self, llm):
        self.llm = llm
        self.parser = PydanticOutputParser(pydantic_object=DocumentMetadata)
        
        self.extraction_prompt = PromptTemplate(
            template="""Analyseer het volgende document en extraheer metadata.

Document:
{document}

{format_instructions}

Focus op de belangrijkste informatie en wees beknopt.""",
            input_variables=["document"],
            partial_variables={"format_instructions": self.parser.get_format_instructions()}
        )
        
    async def extract_metadata(self, document: str) -> DocumentMetadata:
        # Beperk document lengte voor LLM
        truncated_doc = document[:3000] if len(document) > 3000 else document
        
        prompt = self.extraction_prompt.format(document=truncated_doc)
        response = await self.llm.ainvoke(prompt)
        
        return self.parser.parse(response)
    
    async def extract_custom_metadata(self, document: str, schema: Dict[str, str]) -> Dict:
        """Extract custom metadata based on user-defined schema"""
        
        schema_description = "\\n".join([f"- {key}: {desc}" for key, desc in schema.items()])
        
        prompt = f"""Analyseer het document en extraheer de volgende informatie:

{schema_description}

Document:
{document[:2000]}

Geef het resultaat als JSON object met de gevraagde velden."""
        
        response = await self.llm.ainvoke(prompt)
        
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            # Fallback: probeer te parsen met regex
            return self._parse_response_fallback(response, schema.keys())
    
    def _parse_response_fallback(self, response: str, keys: List[str]) -> Dict:
        """Fallback parser als JSON parsing faalt"""
        result = {}
        for key in keys:
            # Zoek naar "key: value" patronen
            import re
            pattern = f"{key}:?\\s*([^\\n]+)"
            match = re.search(pattern, response, re.IGNORECASE)
            if match:
                result[key] = match.group(1).strip()
        return result
\`\`\`

### 4. Computer Vision voor PDFs
Voor visuele documenten:
\`\`\`python
import fitz  # PyMuPDF
from PIL import Image
import pytesseract
from typing import Dict, List, Tuple
import io

class PDFMetadataExtractor:
    def __init__(self):
        self.supported_formats = ['.pdf']
        
    def extract_pdf_metadata(self, pdf_path: str) -> Dict:
        """Extract ingebouwde PDF metadata"""
        doc = fitz.open(pdf_path)
        
        metadata = {
            'title': doc.metadata.get('title', ''),
            'author': doc.metadata.get('author', ''),
            'subject': doc.metadata.get('subject', ''),
            'keywords': doc.metadata.get('keywords', ''),
            'creator': doc.metadata.get('creator', ''),
            'producer': doc.metadata.get('producer', ''),
            'creation_date': doc.metadata.get('creationDate', ''),
            'modification_date': doc.metadata.get('modDate', ''),
            'pages': doc.page_count,
            'encrypted': doc.is_encrypted
        }
        
        doc.close()
        return metadata
    
    def extract_table_metadata(self, pdf_path: str) -> List[Dict]:
        """Detecteer en extraheer tabel metadata"""
        doc = fitz.open(pdf_path)
        tables = []
        
        for page_num, page in enumerate(doc):
            # Zoek naar tabel-achtige structuren
            tables_on_page = self._detect_tables(page)
            for table in tables_on_page:
                tables.append({
                    'page': page_num + 1,
                    'bounds': table['bounds'],
                    'rows': table['rows'],
                    'columns': table['columns'],
                    'headers': table.get('headers', [])
                })
        
        doc.close()
        return tables
    
    def _detect_tables(self, page) -> List[Dict]:
        """Detecteer tabellen op een pagina"""
        # Simplified table detection
        tables = []
        
        # Analyseer tekst blocks voor tabel patronen
        blocks = page.get_text("blocks")
        
        # Groepeer blocks die mogelijk tabellen zijn
        potential_tables = []
        current_table = []
        
        for block in blocks:
            x0, y0, x1, y1, text, block_no, block_type = block
            
            # Check voor tabel-achtige content (tabs, pipes, etc)
            if '\\t' in text or '|' in text or self._is_aligned_block(block, blocks):
                current_table.append(block)
            else:
                if current_table:
                    potential_tables.append(current_table)
                    current_table = []
        
        # Converteer naar tabel metadata
        for table_blocks in potential_tables:
            if len(table_blocks) > 2:  # Minimaal 3 rijen voor een tabel
                bounds = self._get_bounds(table_blocks)
                tables.append({
                    'bounds': bounds,
                    'rows': len(table_blocks),
                    'columns': self._estimate_columns(table_blocks),
                    'headers': self._extract_headers(table_blocks)
                })
        
        return tables
    
    def _is_aligned_block(self, block, all_blocks) -> bool:
        """Check of block deel is van aligned content"""
        x0 = block[0]
        aligned_count = sum(1 for b in all_blocks if abs(b[0] - x0) < 5)
        return aligned_count > 3
    
    def _get_bounds(self, blocks) -> Tuple[float, float, float, float]:
        """Bereken bounding box van blocks"""
        x0 = min(b[0] for b in blocks)
        y0 = min(b[1] for b in blocks)
        x1 = max(b[2] for b in blocks)
        y1 = max(b[3] for b in blocks)
        return (x0, y0, x1, y1)
    
    def _estimate_columns(self, blocks) -> int:
        """Schat aantal kolommen"""
        if not blocks:
            return 0
        
        # Analyseer eerste block voor tabs/pipes
        first_text = blocks[0][4]
        if '\\t' in first_text:
            return len(first_text.split('\\t'))
        elif '|' in first_text:
            return len(first_text.split('|')) - 1
        
        return 1
    
    def _extract_headers(self, blocks) -> List[str]:
        """Probeer headers te extraheren"""
        if not blocks:
            return []
        
        first_text = blocks[0][4].strip()
        if '\\t' in first_text:
            return [h.strip() for h in first_text.split('\\t')]
        elif '|' in first_text:
            return [h.strip() for h in first_text.split('|') if h.strip()]
        
        return [first_text]
    
    def extract_images_metadata(self, pdf_path: str) -> List[Dict]:
        """Extract metadata van embedded images"""
        doc = fitz.open(pdf_path)
        images = []
        
        for page_num, page in enumerate(doc):
            image_list = page.get_images()
            
            for img_index, img in enumerate(image_list):
                xref = img[0]
                pix = fitz.Pixmap(doc, xref)
                
                images.append({
                    'page': page_num + 1,
                    'index': img_index,
                    'width': pix.width,
                    'height': pix.height,
                    'colorspace': pix.colorspace.name,
                    'xref': xref,
                    'has_alpha': pix.alpha
                })
                
                pix = None
        
        doc.close()
        return images
\`\`\`

## Metadata Schema Design

### Best Practices voor Schema Ontwerp
\`\`\`python
from typing import Dict, List, Optional, Union
from datetime import datetime
from pydantic import BaseModel, Field, validator
from enum import Enum

class DocumentType(str, Enum):
    ARTICLE = "article"
    REPORT = "report"
    TUTORIAL = "tutorial"
    DOCUMENTATION = "documentation"
    RESEARCH_PAPER = "research_paper"
    BLOG_POST = "blog_post"

class TechnicalLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"

class MetadataSchema(BaseModel):
    """Universeel metadata schema voor RAG documenten"""
    
    # Identificatie
    document_id: str = Field(..., description="Unieke document identifier")
    source_url: Optional[str] = Field(None, description="Originele bron URL")
    
    # Basis informatie
    title: str = Field(..., description="Document titel")
    author: Optional[Union[str, List[str]]] = Field(None, description="Auteur(s)")
    created_date: Optional[datetime] = Field(None, description="Creatie datum")
    modified_date: Optional[datetime] = Field(None, description="Laatste wijziging")
    version: Optional[str] = Field(None, description="Document versie")
    
    # Classificatie
    document_type: DocumentType = Field(..., description="Type document")
    technical_level: TechnicalLevel = Field(..., description="Technisch niveau")
    language: str = Field("nl", description="Taal code (ISO 639-1)")
    
    # Content metadata
    summary: Optional[str] = Field(None, max_length=500, description="Korte samenvatting")
    topics: List[str] = Field(default_factory=list, description="Hoofdonderwerpen")
    keywords: List[str] = Field(default_factory=list, description="Zoekwoorden")
    entities: Dict[str, List[str]] = Field(default_factory=dict, description="Named entities")
    
    # Structurele informatie
    sections: List[Dict[str, Union[str, int]]] = Field(
        default_factory=list, 
        description="Document secties met headers en nesting"
    )
    has_code: bool = Field(False, description="Bevat code voorbeelden")
    has_tables: bool = Field(False, description="Bevat tabellen")
    has_images: bool = Field(False, description="Bevat afbeeldingen")
    
    # Quality en relevantie
    quality_score: Optional[float] = Field(None, ge=0, le=1, description="Kwaliteitsscore")
    completeness: Optional[float] = Field(None, ge=0, le=1, description="Compleetheid")
    freshness_score: Optional[float] = Field(None, ge=0, le=1, description="Actualiteit")
    
    # Custom fields
    custom_metadata: Dict[str, any] = Field(default_factory=dict, description="Domein-specifieke metadata")
    
    @validator('topics', 'keywords')
    def limit_list_size(cls, v):
        """Beperk lijst grootte voor performance"""
        return v[:20] if len(v) > 20 else v
    
    @validator('freshness_score', always=True)
    def calculate_freshness(cls, v, values):
        """Bereken freshness op basis van modified_date"""
        if v is not None:
            return v
        
        modified = values.get('modified_date')
        if modified:
            days_old = (datetime.now() - modified).days
            if days_old < 30:
                return 1.0
            elif days_old < 90:
                return 0.8
            elif days_old < 365:
                return 0.6
            else:
                return 0.4
        
        return 0.5  # Default als geen datum bekend
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# Voorbeeld van domein-specifieke uitbreiding
class TechnicalDocumentMetadata(MetadataSchema):
    """Uitgebreide metadata voor technische documentatie"""
    
    programming_languages: List[str] = Field(default_factory=list)
    frameworks: List[str] = Field(default_factory=list)
    dependencies: List[str] = Field(default_factory=list)
    api_endpoints: List[str] = Field(default_factory=list)
    code_snippets_count: int = Field(0)
    
    # Compatibiliteit informatie
    min_version: Optional[str] = None
    max_version: Optional[str] = None
    deprecated: bool = Field(False)
    replacement_url: Optional[str] = None
\`\`\`

## Storage Strategies

### Metadata Storage Patterns
\`\`\`python
from typing import Dict, List, Optional, Any
import json
from datetime import datetime

class MetadataStorage:
    """Verschillende storage strategies voor metadata"""
    
    def __init__(self, vector_store, metadata_db=None):
        self.vector_store = vector_store
        self.metadata_db = metadata_db  # Optionele dedicated metadata store
    
    def store_with_embedding(self, 
                           document_id: str,
                           text: str,
                           embedding: List[float],
                           metadata: Dict[str, Any]):
        """Store metadata samen met embeddings"""
        
        # Prepareer metadata voor storage
        stored_metadata = self._prepare_metadata(metadata)
        
        # Store in vector database
        self.vector_store.add(
            documents=[text],
            embeddings=[embedding],
            metadatas=[stored_metadata],
            ids=[document_id]
        )
        
        # Optioneel: store uitgebreide metadata in dedicated store
        if self.metadata_db:
            self._store_extended_metadata(document_id, metadata)
    
    def _prepare_metadata(self, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Prepareer metadata voor vector store (vaak beperkt in types)"""
        
        prepared = {}
        
        for key, value in metadata.items():
            # Vector stores ondersteunen vaak alleen strings, numbers, bools
            if isinstance(value, (str, int, float, bool)):
                prepared[key] = value
            elif isinstance(value, datetime):
                prepared[key] = value.isoformat()
            elif isinstance(value, list):
                # Converteer lists naar JSON strings
                prepared[key] = json.dumps(value)
            elif isinstance(value, dict):
                # Flatten nested dicts of converteer naar JSON
                prepared[key] = json.dumps(value)
            else:
                # Skip complexe types
                continue
        
        return prepared
    
    def _store_extended_metadata(self, document_id: str, metadata: Dict[str, Any]):
        """Store uitgebreide metadata in dedicated database"""
        
        # Bijvoorbeeld in MongoDB, PostgreSQL, of DynamoDB
        self.metadata_db.insert({
            '_id': document_id,
            'metadata': metadata,
            'indexed_at': datetime.now(),
            'version': 1
        })
    
    def create_metadata_index(self, fields: List[str]):
        """Creëer indices voor snelle metadata queries"""
        
        if self.metadata_db:
            for field in fields:
                self.metadata_db.create_index(f"metadata.{field}")
        
        # Voor vector stores met metadata filtering
        if hasattr(self.vector_store, 'create_metadata_index'):
            self.vector_store.create_metadata_index(fields)

class HybridMetadataStorage:
    """Hybrid storage met hot/cold tiers"""
    
    def __init__(self, hot_store, cold_store):
        self.hot_store = hot_store  # Frequent accessed metadata
        self.cold_store = cold_store  # Archief metadata
        
    def store_metadata(self, document_id: str, metadata: Dict[str, Any]):
        # Bepaal storage tier op basis van metadata
        if self._is_hot_data(metadata):
            self.hot_store.store(document_id, metadata)
        else:
            self.cold_store.store(document_id, metadata)
    
    def _is_hot_data(self, metadata: Dict[str, Any]) -> bool:
        """Bepaal of data in hot tier moet"""
        
        # Recent documents
        if metadata.get('modified_date'):
            days_old = (datetime.now() - metadata['modified_date']).days
            if days_old < 90:
                return True
        
        # High quality documents
        if metadata.get('quality_score', 0) > 0.8:
            return True
        
        # Frequently accessed types
        if metadata.get('document_type') in ['documentation', 'tutorial']:
            return True
        
        return False
    
    def migrate_to_cold(self, days_threshold: int = 180):
        """Migreer oude data naar cold storage"""
        
        cutoff_date = datetime.now() - timedelta(days=days_threshold)
        
        # Query hot store voor oude documents
        old_docs = self.hot_store.query({
            'metadata.modified_date': {'$lt': cutoff_date}
        })
        
        for doc in old_docs:
            # Move to cold storage
            self.cold_store.store(doc['_id'], doc['metadata'])
            self.hot_store.delete(doc['_id'])
\`\`\`

## Filtering en Faceted Search

### Implementatie van Metadata Filtering
\`\`\`python
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass
class FilterCriteria:
    """Filter criteria voor metadata search"""
    document_types: Optional[List[str]] = None
    authors: Optional[List[str]] = None
    date_range: Optional[Tuple[datetime, datetime]] = None
    technical_levels: Optional[List[str]] = None
    topics: Optional[List[str]] = None
    min_quality_score: Optional[float] = None
    has_code: Optional[bool] = None
    language: Optional[str] = None
    custom_filters: Optional[Dict[str, Any]] = None

class MetadataFilter:
    def __init__(self, vector_store):
        self.vector_store = vector_store
    
    def search_with_filters(self, 
                          query: str,
                          filters: FilterCriteria,
                          top_k: int = 10) -> List[Dict]:
        """Zoek met metadata filters"""
        
        # Bouw filter query
        metadata_filter = self._build_filter_query(filters)
        
        # Voer vector search uit met filters
        results = self.vector_store.similarity_search(
            query=query,
            k=top_k,
            filter=metadata_filter
        )
        
        return results
    
    def _build_filter_query(self, filters: FilterCriteria) -> Dict[str, Any]:
        """Bouw filter query voor vector store"""
        
        query = {}
        
        if filters.document_types:
            query['document_type'] = {'$in': filters.document_types}
        
        if filters.authors:
            query['author'] = {'$in': filters.authors}
        
        if filters.date_range:
            start_date, end_date = filters.date_range
            query['modified_date'] = {
                '$gte': start_date.isoformat(),
                '$lte': end_date.isoformat()
            }
        
        if filters.technical_levels:
            query['technical_level'] = {'$in': filters.technical_levels}
        
        if filters.topics:
            # Topics kunnen in JSON string zijn
            query['$or'] = [
                {'topics': {'$contains': topic}} for topic in filters.topics
            ]
        
        if filters.min_quality_score is not None:
            query['quality_score'] = {'$gte': filters.min_quality_score}
        
        if filters.has_code is not None:
            query['has_code'] = filters.has_code
        
        if filters.language:
            query['language'] = filters.language
        
        if filters.custom_filters:
            query.update(filters.custom_filters)
        
        return query
    
    def get_facets(self, 
                   query: Optional[str] = None,
                   facet_fields: List[str] = None) -> Dict[str, Dict[str, int]]:
        """Krijg facet counts voor UI filters"""
        
        if facet_fields is None:
            facet_fields = [
                'document_type', 
                'technical_level', 
                'language',
                'author',
                'has_code'
            ]
        
        facets = {}
        
        for field in facet_fields:
            # Get unique values en counts
            if hasattr(self.vector_store, 'aggregate'):
                facets[field] = self.vector_store.aggregate([
                    {'$group': {
                        '_id': f'\${field}',
                        'count': {'$sum': 1}
                    }}
                ])
            else:
                # Fallback voor stores zonder aggregatie
                facets[field] = self._get_facets_fallback(field)
        
        return facets
    
    def _get_facets_fallback(self, field: str) -> Dict[str, int]:
        """Fallback facet counting"""
        # Simplified implementation
        all_docs = self.vector_store.get_all_metadata()
        counts = {}
        
        for doc in all_docs:
            value = doc.get(field)
            if value:
                if isinstance(value, list):
                    for v in value:
                        counts[v] = counts.get(v, 0) + 1
                else:
                    counts[value] = counts.get(value, 0) + 1
        
        return counts

class SmartFilter:
    """Intelligente filtering met query understanding"""
    
    def __init__(self, llm, metadata_filter: MetadataFilter):
        self.llm = llm
        self.metadata_filter = metadata_filter
    
    async def parse_natural_query(self, query: str) -> Tuple[str, FilterCriteria]:
        """Parse natuurlijke taal query naar search query + filters"""
        
        prompt = f"""Analyseer deze zoekopdracht en extract de zoekterm en filters:

Query: "{query}"

Extract:
1. De hoofdzoekvraag (zonder filter termen)
2. Filters zoals:
   - Document type (article, tutorial, documentation, etc)
   - Technisch niveau (beginner, intermediate, advanced)
   - Tijdsperiode (laatste week, maand, jaar, of specifieke data)
   - Taal
   - Of code voorbeelden nodig zijn

Geef het resultaat als JSON met 'search_query' en 'filters' velden."""
        
        response = await self.llm.ainvoke(prompt)
        
        try:
            parsed = json.loads(response)
            
            # Converteer naar FilterCriteria
            filters = FilterCriteria()
            
            if 'document_type' in parsed['filters']:
                filters.document_types = [parsed['filters']['document_type']]
            
            if 'technical_level' in parsed['filters']:
                filters.technical_levels = [parsed['filters']['technical_level']]
            
            if 'time_period' in parsed['filters']:
                filters.date_range = self._parse_time_period(parsed['filters']['time_period'])
            
            if 'has_code' in parsed['filters']:
                filters.has_code = parsed['filters']['has_code']
            
            return parsed.get('search_query', query), filters
            
        except:
            # Fallback: gebruik originele query zonder filters
            return query, FilterCriteria()
    
    def _parse_time_period(self, period: str) -> Tuple[datetime, datetime]:
        """Parse tijd periode naar date range"""
        
        now = datetime.now()
        
        period_mapping = {
            'laatste week': timedelta(days=7),
            'laatste maand': timedelta(days=30),
            'laatste jaar': timedelta(days=365),
            'vandaag': timedelta(days=1),
            'gisteren': timedelta(days=2)
        }
        
        for key, delta in period_mapping.items():
            if key in period.lower():
                return (now - delta, now)
        
        # Default: laatste jaar
        return (now - timedelta(days=365), now)
\`\`\`

## Metadata voor Ranking

### Metadata-based Ranking Strategies
\`\`\`python
from typing import List, Dict, Tuple
import math
from datetime import datetime

class MetadataRanker:
    """Rank resultaten op basis van metadata"""
    
    def __init__(self, weights: Dict[str, float] = None):
        self.weights = weights or {
            'semantic_similarity': 0.4,
            'freshness': 0.2,
            'quality': 0.2,
            'relevance': 0.1,
            'completeness': 0.1
        }
    
    def rank_results(self, 
                    results: List[Dict],
                    query_metadata: Dict = None) -> List[Dict]:
        """Rank results met metadata signals"""
        
        scored_results = []
        
        for result in results:
            score = self._calculate_score(result, query_metadata)
            result['metadata_score'] = score
            result['final_score'] = self._combine_scores(result)
            scored_results.append(result)
        
        # Sorteer op final score
        scored_results.sort(key=lambda x: x['final_score'], reverse=True)
        
        return scored_results
    
    def _calculate_score(self, result: Dict, query_metadata: Dict) -> float:
        """Bereken metadata score voor een result"""
        
        metadata = result.get('metadata', {})
        scores = {}
        
        # Freshness score
        scores['freshness'] = self._freshness_score(metadata.get('modified_date'))
        
        # Quality score
        scores['quality'] = metadata.get('quality_score', 0.5)
        
        # Completeness score  
        scores['completeness'] = metadata.get('completeness', 0.5)
        
        # Relevance score (match met query metadata)
        if query_metadata:
            scores['relevance'] = self._relevance_score(metadata, query_metadata)
        else:
            scores['relevance'] = 0.5
        
        # Gewogen gemiddelde
        total_score = sum(
            scores.get(key, 0) * self.weights.get(key, 0)
            for key in ['freshness', 'quality', 'relevance', 'completeness']
        )
        
        return total_score
    
    def _freshness_score(self, modified_date: str) -> float:
        """Bereken freshness score op basis van datum"""
        
        if not modified_date:
            return 0.5
        
        try:
            date = datetime.fromisoformat(modified_date)
            days_old = (datetime.now() - date).days
            
            # Exponential decay
            return math.exp(-days_old / 365)  # Half-life van 1 jaar
            
        except:
            return 0.5
    
    def _relevance_score(self, doc_metadata: Dict, query_metadata: Dict) -> float:
        """Bereken relevance op basis van metadata match"""
        
        score = 0.0
        factors = 0
        
        # Document type match
        if 'document_type' in query_metadata:
            if doc_metadata.get('document_type') == query_metadata['document_type']:
                score += 1.0
            factors += 1
        
        # Technical level match
        if 'technical_level' in query_metadata:
            if doc_metadata.get('technical_level') == query_metadata['technical_level']:
                score += 1.0
            factors += 1
        
        # Topic overlap
        if 'topics' in query_metadata and 'topics' in doc_metadata:
            doc_topics = set(json.loads(doc_metadata['topics']) 
                           if isinstance(doc_metadata['topics'], str) 
                           else doc_metadata['topics'])
            query_topics = set(query_metadata['topics'])
            
            if doc_topics and query_topics:
                overlap = len(doc_topics & query_topics) / len(query_topics)
                score += overlap
                factors += 1
        
        return score / factors if factors > 0 else 0.5
    
    def _combine_scores(self, result: Dict) -> float:
        """Combineer semantic en metadata scores"""
        
        semantic_score = result.get('score', 0.5)  # Van vector search
        metadata_score = result.get('metadata_score', 0.5)
        
        # Gewogen combinatie
        final_score = (
            self.weights['semantic_similarity'] * semantic_score +
            (1 - self.weights['semantic_similarity']) * metadata_score
        )
        
        return final_score

class PersonalizedRanker(MetadataRanker):
    """Personalized ranking op basis van gebruikersprofiel"""
    
    def __init__(self, user_profile: Dict, weights: Dict[str, float] = None):
        super().__init__(weights)
        self.user_profile = user_profile
    
    def rank_results(self, results: List[Dict], query_metadata: Dict = None) -> List[Dict]:
        """Rank met personalisatie"""
        
        # Voeg user preferences toe aan query metadata
        enhanced_query_metadata = {
            **(query_metadata or {}),
            'preferred_level': self.user_profile.get('technical_level'),
            'preferred_types': self.user_profile.get('preferred_document_types', []),
            'interests': self.user_profile.get('interests', [])
        }
        
        return super().rank_results(results, enhanced_query_metadata)
    
    def _calculate_score(self, result: Dict, query_metadata: Dict) -> float:
        """Uitgebreide score met personalisatie"""
        
        base_score = super()._calculate_score(result, query_metadata)
        
        # Voeg personalisatie factor toe
        metadata = result.get('metadata', {})
        personalization_score = 0.0
        
        # Match met user interests
        if 'topics' in metadata and 'interests' in self.user_profile:
            doc_topics = set(json.loads(metadata['topics']) 
                           if isinstance(metadata['topics'], str) 
                           else metadata['topics'])
            user_interests = set(self.user_profile['interests'])
            
            if doc_topics and user_interests:
                interest_match = len(doc_topics & user_interests) / len(user_interests)
                personalization_score += interest_match * 0.5
        
        # Preferred document types
        if metadata.get('document_type') in self.user_profile.get('preferred_document_types', []):
            personalization_score += 0.3
        
        # Learning progress (prefer appropriate level)
        if metadata.get('technical_level') == self.user_profile.get('current_level'):
            personalization_score += 0.2
        
        # Combineer scores
        return base_score * 0.7 + personalization_score * 0.3
\`\`\`

## Complete Metadata Pipeline

\`\`\`python
class MetadataPipeline:
    """Complete pipeline voor metadata extraction, storage en retrieval"""
    
    def __init__(self, 
                 vector_store,
                 llm,
                 metadata_store=None):
        self.vector_store = vector_store
        self.llm = llm
        self.metadata_store = metadata_store
        
        # Initialize extractors
        self.regex_extractor = RegexMetadataExtractor()
        self.nlp_extractor = NLPMetadataExtractor()
        self.llm_extractor = LLMMetadataExtractor(llm)
        self.pdf_extractor = PDFMetadataExtractor()
        
        # Initialize storage en ranking
        self.storage = MetadataStorage(vector_store, metadata_store)
        self.filter = MetadataFilter(vector_store)
        self.ranker = MetadataRanker()
    
    async def process_document(self, 
                             document_path: str,
                             document_content: str) -> Dict:
        """Volledig metadata extraction process"""
        
        # 1. Extract basis metadata
        metadata = {
            'document_id': self._generate_id(document_path),
            'source_path': document_path,
            'processed_at': datetime.now()
        }
        
        # 2. Regex-based extraction
        metadata['emails'] = self.regex_extractor.extract_emails(document_content)
        metadata['dates'] = self.regex_extractor.extract_dates(document_content)
        metadata['headers'] = self.regex_extractor.extract_headers(document_content)
        metadata['code_blocks'] = len(self.regex_extractor.extract_code_blocks(document_content))
        
        # 3. NLP-based extraction
        metadata['entities'] = self.nlp_extractor.extract_entities(document_content)
        metadata['key_phrases'] = self.nlp_extractor.extract_key_phrases(document_content)
        metadata['summary_sentences'] = self.nlp_extractor.extract_summary_sentences(document_content)
        
        # 4. LLM-based extraction
        llm_metadata = await self.llm_extractor.extract_metadata(document_content)
        metadata.update(llm_metadata.dict())
        
        # 5. PDF-specific metadata (if applicable)
        if document_path.endswith('.pdf'):
            pdf_metadata = self.pdf_extractor.extract_pdf_metadata(document_path)
            metadata['pdf_metadata'] = pdf_metadata
        
        # 6. Calculate quality scores
        metadata['quality_score'] = self._calculate_quality_score(metadata)
        metadata['completeness'] = self._calculate_completeness(metadata)
        
        return metadata
    
    def _generate_id(self, path: str) -> str:
        """Genereer unieke ID voor document"""
        import hashlib
        return hashlib.md5(path.encode()).hexdigest()
    
    def _calculate_quality_score(self, metadata: Dict) -> float:
        """Bereken quality score op basis van metadata"""
        
        score = 0.0
        factors = 0
        
        # Has title
        if metadata.get('title'):
            score += 1.0
            factors += 1
        
        # Has summary
        if metadata.get('summary'):
            score += 1.0
            factors += 1
        
        # Has entities
        if metadata.get('entities') and any(metadata['entities'].values()):
            score += 1.0
            factors += 1
        
        # Has structure
        if metadata.get('headers') and len(metadata['headers']) > 3:
            score += 1.0
            factors += 1
        
        # Recent document
        if metadata.get('freshness_score', 0) > 0.7:
            score += 1.0
            factors += 1
        
        return score / factors if factors > 0 else 0.5
    
    def _calculate_completeness(self, metadata: Dict) -> float:
        """Bereken completeness van metadata"""
        
        required_fields = [
            'title', 'summary', 'topics', 'document_type',
            'technical_level', 'author', 'created_date'
        ]
        
        present_fields = sum(1 for field in required_fields if metadata.get(field))
        
        return present_fields / len(required_fields)
\`\`\``,
  codeExamples: [
    {
      id: 'regex-extraction',
      title: 'Regex-based Metadata Extraction',
      language: 'python',
      code: `import re
from datetime import datetime
from typing import Dict, List, Optional

class RegexMetadataExtractor:
    def __init__(self):
        self.patterns = {
            'email': r'\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',
            'date': r'\\b(\\d{1,2}[-/]\\d{1,2}[-/]\\d{2,4}|\\d{4}[-/]\\d{1,2}[-/]\\d{1,2})\\b',
            'url': r'https?://[^\\s]+',
            'header': r'^#{1,6}\\s+(.+)$',
            'code_block': r'\\\`\\\`\\\`(\\w+)?\\n([\\s\\S]*?)\\n\\\`\\\`\\\`'
        }
    
    def extract_emails(self, text: str) -> List[str]:
        return re.findall(self.patterns['email'], text)
    
    def extract_dates(self, text: str) -> List[Dict[str, any]]:
        dates = []
        for match in re.finditer(self.patterns['date'], text):
            try:
                # Probeer verschillende date formats
                date_str = match.group()
                for fmt in ['%d-%m-%Y', '%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y']:
                    try:
                        parsed_date = datetime.strptime(date_str, fmt)
                        dates.append({
                            'text': date_str,
                            'parsed': parsed_date,
                            'position': match.span()
                        })
                        break
                    except ValueError:
                        continue
            except:
                pass
        return dates
    
    def extract_headers(self, markdown_text: str) -> List[Dict[str, any]]:
        headers = []
        for line_num, line in enumerate(markdown_text.split('\\n')):
            match = re.match(self.patterns['header'], line)
            if match:
                level = len(re.match(r'^(#+)', line).group(1))
                headers.append({
                    'text': match.group(1).strip(),
                    'level': level,
                    'line': line_num
                })
        return headers
    
    def extract_code_blocks(self, text: str) -> List[Dict[str, str]]:
        code_blocks = []
        for match in re.finditer(self.patterns['code_block'], text, re.MULTILINE):
            code_blocks.append({
                'language': match.group(1) or 'plain',
                'code': match.group(2),
                'position': match.span()
            })
        return code_blocks

# Gebruik
extractor = RegexMetadataExtractor()
document = """
# Getting Started with Python
Author: John Doe
Date: 2024-01-15

Contact: john.doe@example.com

## Installation
\`\`\`bash
pip install numpy pandas
\`\`\`

Visit https://python.org for more info.
"""

metadata = {
    'emails': extractor.extract_emails(document),
    'dates': extractor.extract_dates(document),
    'headers': extractor.extract_headers(document),
    'code_blocks': extractor.extract_code_blocks(document)
}

print(json.dumps(metadata, indent=2, default=str))`
    },
    {
      id: 'llm-extraction',
      title: 'LLM-based Metadata Extraction',
      language: 'python',
      code: `from typing import Dict, List, Optional
import json
from langchain.prompts import PromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

class DocumentMetadata(BaseModel):
    title: str = Field(description="Document title")
    summary: str = Field(description="Brief summary (max 200 chars)")
    main_topics: List[str] = Field(description="Main topics covered")
    document_type: str = Field(description="Type: article, report, tutorial, etc")
    technical_level: str = Field(description="Level: beginner, intermediate, advanced")
    key_concepts: List[str] = Field(description="Key technical concepts")
    target_audience: str = Field(description="Intended audience")
    
class LLMMetadataExtractor:
    def __init__(self, llm):
        self.llm = llm
        self.parser = PydanticOutputParser(pydantic_object=DocumentMetadata)
        
        self.extraction_prompt = PromptTemplate(
            template="""Analyseer het volgende document en extraheer metadata.

Document:
{document}

{format_instructions}

Focus op de belangrijkste informatie en wees beknopt.""",
            input_variables=["document"],
            partial_variables={"format_instructions": self.parser.get_format_instructions()}
        )
        
    async def extract_metadata(self, document: str) -> DocumentMetadata:
        # Beperk document lengte voor LLM
        truncated_doc = document[:3000] if len(document) > 3000 else document
        
        prompt = self.extraction_prompt.format(document=truncated_doc)
        response = await self.llm.ainvoke(prompt)
        
        return self.parser.parse(response)
    
    async def extract_custom_metadata(self, document: str, schema: Dict[str, str]) -> Dict:
        """Extract custom metadata based on user-defined schema"""
        
        schema_description = "\\n".join([f"- {key}: {desc}" for key, desc in schema.items()])
        
        prompt = f"""Analyseer het document en extraheer de volgende informatie:

{schema_description}

Document:
{document[:2000]}

Geef het resultaat als JSON object met de gevraagde velden."""
        
        response = await self.llm.ainvoke(prompt)
        
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            # Fallback: probeer te parsen met regex
            return self._parse_response_fallback(response, schema.keys())

# Gebruik
from langchain.chat_models import ChatOpenAI

llm = ChatOpenAI(model="gpt-4", temperature=0)
extractor = LLMMetadataExtractor(llm)

# Standaard extraction
document = """
# Advanced React Patterns

This tutorial covers advanced React patterns for experienced developers.
We'll explore render props, higher-order components, and custom hooks.

Topics include:
- Component composition
- State management patterns
- Performance optimization
- Testing strategies
"""

metadata = await extractor.extract_metadata(document)
print(metadata.json(indent=2))

# Custom schema extraction
custom_schema = {
    "prerequisites": "Required knowledge before reading",
    "estimated_time": "Time needed to complete",
    "code_examples": "Number of code examples",
    "difficulty": "Difficulty rating 1-10"
}

custom_metadata = await extractor.extract_custom_metadata(document, custom_schema)`
    },
    {
      id: 'metadata-schema',
      title: 'Comprehensive Metadata Schema',
      language: 'python',
      code: `from typing import Dict, List, Optional, Union
from datetime import datetime
from pydantic import BaseModel, Field, validator
from enum import Enum

class DocumentType(str, Enum):
    ARTICLE = "article"
    REPORT = "report"
    TUTORIAL = "tutorial"
    DOCUMENTATION = "documentation"
    RESEARCH_PAPER = "research_paper"
    BLOG_POST = "blog_post"

class TechnicalLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"

class MetadataSchema(BaseModel):
    """Universeel metadata schema voor RAG documenten"""
    
    # Identificatie
    document_id: str = Field(..., description="Unieke document identifier")
    source_url: Optional[str] = Field(None, description="Originele bron URL")
    
    # Basis informatie
    title: str = Field(..., description="Document titel")
    author: Optional[Union[str, List[str]]] = Field(None, description="Auteur(s)")
    created_date: Optional[datetime] = Field(None, description="Creatie datum")
    modified_date: Optional[datetime] = Field(None, description="Laatste wijziging")
    version: Optional[str] = Field(None, description="Document versie")
    
    # Classificatie
    document_type: DocumentType = Field(..., description="Type document")
    technical_level: TechnicalLevel = Field(..., description="Technisch niveau")
    language: str = Field("nl", description="Taal code (ISO 639-1)")
    
    # Content metadata
    summary: Optional[str] = Field(None, max_length=500, description="Korte samenvatting")
    topics: List[str] = Field(default_factory=list, description="Hoofdonderwerpen")
    keywords: List[str] = Field(default_factory=list, description="Zoekwoorden")
    entities: Dict[str, List[str]] = Field(default_factory=dict, description="Named entities")
    
    # Structurele informatie
    sections: List[Dict[str, Union[str, int]]] = Field(
        default_factory=list, 
        description="Document secties met headers en nesting"
    )
    has_code: bool = Field(False, description="Bevat code voorbeelden")
    has_tables: bool = Field(False, description="Bevat tabellen")
    has_images: bool = Field(False, description="Bevat afbeeldingen")
    
    # Quality en relevantie
    quality_score: Optional[float] = Field(None, ge=0, le=1, description="Kwaliteitsscore")
    completeness: Optional[float] = Field(None, ge=0, le=1, description="Compleetheid")
    freshness_score: Optional[float] = Field(None, ge=0, le=1, description="Actualiteit")
    
    # Custom fields
    custom_metadata: Dict[str, any] = Field(default_factory=dict, description="Domein-specifieke metadata")
    
    @validator('topics', 'keywords')
    def limit_list_size(cls, v):
        """Beperk lijst grootte voor performance"""
        return v[:20] if len(v) > 20 else v
    
    @validator('freshness_score', always=True)
    def calculate_freshness(cls, v, values):
        """Bereken freshness op basis van modified_date"""
        if v is not None:
            return v
        
        modified = values.get('modified_date')
        if modified:
            days_old = (datetime.now() - modified).days
            if days_old < 30:
                return 1.0
            elif days_old < 90:
                return 0.8
            elif days_old < 365:
                return 0.6
            else:
                return 0.4
        
        return 0.5  # Default als geen datum bekend
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# Voorbeeld van domein-specifieke uitbreiding
class TechnicalDocumentMetadata(MetadataSchema):
    """Uitgebreide metadata voor technische documentatie"""
    
    programming_languages: List[str] = Field(default_factory=list)
    frameworks: List[str] = Field(default_factory=list)
    dependencies: List[str] = Field(default_factory=list)
    api_endpoints: List[str] = Field(default_factory=list)
    code_snippets_count: int = Field(0)
    
    # Compatibiliteit informatie
    min_version: Optional[str] = None
    max_version: Optional[str] = None
    deprecated: bool = Field(False)
    replacement_url: Optional[str] = None

# Gebruik
document_metadata = TechnicalDocumentMetadata(
    document_id="doc_12345",
    title="Building Scalable Microservices with Python",
    author=["Jane Smith", "Bob Johnson"],
    created_date=datetime(2024, 1, 15),
    document_type=DocumentType.TUTORIAL,
    technical_level=TechnicalLevel.ADVANCED,
    summary="Comprehensive guide on building microservices",
    topics=["microservices", "python", "docker", "kubernetes"],
    programming_languages=["python", "yaml"],
    frameworks=["FastAPI", "Django"],
    has_code=True,
    code_snippets_count=25
)

# Validatie en serialisatie
print(document_metadata.json(indent=2))`
    },
    {
      id: 'metadata-filtering',
      title: 'Metadata Filtering and Faceted Search',
      language: 'python',
      code: `from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass
class FilterCriteria:
    """Filter criteria voor metadata search"""
    document_types: Optional[List[str]] = None
    authors: Optional[List[str]] = None
    date_range: Optional[Tuple[datetime, datetime]] = None
    technical_levels: Optional[List[str]] = None
    topics: Optional[List[str]] = None
    min_quality_score: Optional[float] = None
    has_code: Optional[bool] = None
    language: Optional[str] = None
    custom_filters: Optional[Dict[str, Any]] = None

class MetadataFilter:
    def __init__(self, vector_store):
        self.vector_store = vector_store
    
    def search_with_filters(self, 
                          query: str,
                          filters: FilterCriteria,
                          top_k: int = 10) -> List[Dict]:
        """Zoek met metadata filters"""
        
        # Bouw filter query
        metadata_filter = self._build_filter_query(filters)
        
        # Voer vector search uit met filters
        results = self.vector_store.similarity_search(
            query=query,
            k=top_k,
            filter=metadata_filter
        )
        
        return results
    
    def _build_filter_query(self, filters: FilterCriteria) -> Dict[str, Any]:
        """Bouw filter query voor vector store"""
        
        query = {}
        
        if filters.document_types:
            query['document_type'] = {'$in': filters.document_types}
        
        if filters.authors:
            query['author'] = {'$in': filters.authors}
        
        if filters.date_range:
            start_date, end_date = filters.date_range
            query['modified_date'] = {
                '$gte': start_date.isoformat(),
                '$lte': end_date.isoformat()
            }
        
        if filters.technical_levels:
            query['technical_level'] = {'$in': filters.technical_levels}
        
        if filters.topics:
            # Topics kunnen in JSON string zijn
            query['$or'] = [
                {'topics': {'$contains': topic}} for topic in filters.topics
            ]
        
        if filters.min_quality_score is not None:
            query['quality_score'] = {'$gte': filters.min_quality_score}
        
        if filters.has_code is not None:
            query['has_code'] = filters.has_code
        
        if filters.language:
            query['language'] = filters.language
        
        if filters.custom_filters:
            query.update(filters.custom_filters)
        
        return query
    
    def get_facets(self, 
                   query: Optional[str] = None,
                   facet_fields: List[str] = None) -> Dict[str, Dict[str, int]]:
        """Krijg facet counts voor UI filters"""
        
        if facet_fields is None:
            facet_fields = [
                'document_type', 
                'technical_level', 
                'language',
                'author',
                'has_code'
            ]
        
        facets = {}
        
        for field in facet_fields:
            # Get unique values en counts
            if hasattr(self.vector_store, 'aggregate'):
                facets[field] = self.vector_store.aggregate([
                    {'$group': {
                        '_id': f'\${field}',
                        'count': {'$sum': 1}
                    }}
                ])
            else:
                # Fallback voor stores zonder aggregatie
                facets[field] = self._get_facets_fallback(field)
        
        return facets

# Gebruik voorbeeld
from chromadb import Client
from chromadb.config import Settings

# Setup vector store
client = Client(Settings(persist_directory="./chroma_db"))
collection = client.get_or_create_collection("documents")

# Initialize filter
metadata_filter = MetadataFilter(collection)

# Definieer filters
filters = FilterCriteria(
    document_types=["tutorial", "documentation"],
    technical_levels=["intermediate", "advanced"],
    date_range=(datetime.now() - timedelta(days=90), datetime.now()),
    min_quality_score=0.7,
    has_code=True,
    topics=["python", "machine learning"]
)

# Zoek met filters
results = metadata_filter.search_with_filters(
    query="implementing neural networks",
    filters=filters,
    top_k=10
)

# Get facets voor UI
facets = metadata_filter.get_facets()
print("Available filters:")
for field, counts in facets.items():
    print(f"\\n{field}:")
    for value, count in counts.items():
        print(f"  - {value}: {count} documents")`
    },
    {
      id: 'metadata-ranking',
      title: 'Metadata-based Result Ranking',
      language: 'python',
      code: `from typing import List, Dict, Tuple
import math
from datetime import datetime

class MetadataRanker:
    """Rank resultaten op basis van metadata"""
    
    def __init__(self, weights: Dict[str, float] = None):
        self.weights = weights or {
            'semantic_similarity': 0.4,
            'freshness': 0.2,
            'quality': 0.2,
            'relevance': 0.1,
            'completeness': 0.1
        }
    
    def rank_results(self, 
                    results: List[Dict],
                    query_metadata: Dict = None) -> List[Dict]:
        """Rank results met metadata signals"""
        
        scored_results = []
        
        for result in results:
            score = self._calculate_score(result, query_metadata)
            result['metadata_score'] = score
            result['final_score'] = self._combine_scores(result)
            scored_results.append(result)
        
        # Sorteer op final score
        scored_results.sort(key=lambda x: x['final_score'], reverse=True)
        
        return scored_results
    
    def _calculate_score(self, result: Dict, query_metadata: Dict) -> float:
        """Bereken metadata score voor een result"""
        
        metadata = result.get('metadata', {})
        scores = {}
        
        # Freshness score
        scores['freshness'] = self._freshness_score(metadata.get('modified_date'))
        
        # Quality score
        scores['quality'] = metadata.get('quality_score', 0.5)
        
        # Completeness score  
        scores['completeness'] = metadata.get('completeness', 0.5)
        
        # Relevance score (match met query metadata)
        if query_metadata:
            scores['relevance'] = self._relevance_score(metadata, query_metadata)
        else:
            scores['relevance'] = 0.5
        
        # Gewogen gemiddelde
        total_score = sum(
            scores.get(key, 0) * self.weights.get(key, 0)
            for key in ['freshness', 'quality', 'relevance', 'completeness']
        )
        
        return total_score
    
    def _freshness_score(self, modified_date: str) -> float:
        """Bereken freshness score op basis van datum"""
        
        if not modified_date:
            return 0.5
        
        try:
            date = datetime.fromisoformat(modified_date)
            days_old = (datetime.now() - date).days
            
            # Exponential decay
            return math.exp(-days_old / 365)  # Half-life van 1 jaar
            
        except:
            return 0.5
    
    def _relevance_score(self, doc_metadata: Dict, query_metadata: Dict) -> float:
        """Bereken relevance op basis van metadata match"""
        
        score = 0.0
        factors = 0
        
        # Document type match
        if 'document_type' in query_metadata:
            if doc_metadata.get('document_type') == query_metadata['document_type']:
                score += 1.0
            factors += 1
        
        # Technical level match
        if 'technical_level' in query_metadata:
            if doc_metadata.get('technical_level') == query_metadata['technical_level']:
                score += 1.0
            factors += 1
        
        # Topic overlap
        if 'topics' in query_metadata and 'topics' in doc_metadata:
            doc_topics = set(json.loads(doc_metadata['topics']) 
                           if isinstance(doc_metadata['topics'], str) 
                           else doc_metadata['topics'])
            query_topics = set(query_metadata['topics'])
            
            if doc_topics and query_topics:
                overlap = len(doc_topics & query_topics) / len(query_topics)
                score += overlap
                factors += 1
        
        return score / factors if factors > 0 else 0.5
    
    def _combine_scores(self, result: Dict) -> float:
        """Combineer semantic en metadata scores"""
        
        semantic_score = result.get('score', 0.5)  # Van vector search
        metadata_score = result.get('metadata_score', 0.5)
        
        # Gewogen combinatie
        final_score = (
            self.weights['semantic_similarity'] * semantic_score +
            (1 - self.weights['semantic_similarity']) * metadata_score
        )
        
        return final_score

# Gebruik
ranker = MetadataRanker()

# Voorbeeld resultaten van vector search
search_results = [
    {
        'id': 'doc1',
        'text': 'Introduction to neural networks...',
        'score': 0.85,  # Semantic similarity
        'metadata': {
            'title': 'Neural Networks for Beginners',
            'document_type': 'tutorial',
            'technical_level': 'beginner',
            'modified_date': '2024-01-15T10:00:00',
            'quality_score': 0.9,
            'completeness': 0.95,
            'topics': '["neural networks", "deep learning", "AI"]'
        }
    },
    {
        'id': 'doc2',
        'text': 'Advanced deep learning architectures...',
        'score': 0.75,
        'metadata': {
            'title': 'Deep Learning Architecture Patterns',
            'document_type': 'research_paper',
            'technical_level': 'advanced',
            'modified_date': '2024-01-20T15:30:00',
            'quality_score': 0.95,
            'completeness': 1.0,
            'topics': '["deep learning", "architectures", "transformers"]'
        }
    }
]

# Query metadata (wat de gebruiker zoekt)
query_metadata = {
    'document_type': 'tutorial',
    'technical_level': 'beginner',
    'topics': ['neural networks', 'AI']
}

# Rank results
ranked_results = ranker.rank_results(search_results, query_metadata)

# Print ranked results
for i, result in enumerate(ranked_results):
    print(\`\\nRank \${i+1}:\`)
    print(\`  Title: \${result['metadata']['title']}\`)
    print(\`  Semantic Score: \${result['score'].toFixed(3)}\`)
    print(\`  Metadata Score: \${result['metadata_score'].toFixed(3)}\`)
    print(\`  Final Score: \${result['final_score'].toFixed(3)}\`)`
    }
  ],
  assignments: [
    {
      id: 'metadata-extractor',
      title: 'Build Complete Metadata Extraction Pipeline',
      type: 'project',
      difficulty: 'hard',
      description: `Bouw een complete metadata extraction pipeline die verschillende document types kan verwerken.

**Requirements:**
1. Ondersteun minimaal 3 document types (PDF, Markdown, HTML)
2. Implementeer regex, NLP en LLM-based extraction
3. Design een flexibel metadata schema
4. Bouw een storage systeem met filtering
5. Implementeer metadata-based ranking

**Deliverables:**
- MetadataExtractor klasse met modulaire extractors
- Configureerbaar schema systeem
- Storage adapter voor verschillende backends
- Filter en search interface
- Performance benchmarks

**Bonus:**
- Incrementele metadata updates
- Metadata versioning
- Multi-language support
- Async processing pipeline`,
      hints: [
        'Begin met een abstract base class voor extractors',
        'Gebruik factory pattern voor document type handling',
        'Implementeer caching voor expensive operations',
        'Test met echte documenten van verschillende bronnen'
      ]
    },
    {
      id: 'smart-filter-ui',
      title: 'Smart Filter Interface',
      type: 'project',
      difficulty: 'medium',
      description: `Ontwikkel een intelligente filter interface die natuurlijke taal queries vertaalt naar metadata filters.

**Features:**
1. Parse natuurlijke taal naar FilterCriteria
2. Genereer faceted search UI componenten
3. Real-time filter preview
4. Query suggestion engine
5. Filter persistence en sharing

**Technical requirements:**
- LLM integration voor query parsing
- Dynamic facet generation
- Efficient count queries
- Responsive UI updates`,
      hints: [
        'Gebruik een query grammar voor common patterns',
        'Cache facet counts voor performance',
        'Implementeer fuzzy matching voor filter values',
        'Bouw een feedback loop voor query verbetering'
      ]
    },
    {
      id: 'metadata-quality',
      title: 'Metadata Quality Analyzer',
      type: 'code',
      difficulty: 'medium',
      description: `Implementeer een systeem dat de kwaliteit van extracted metadata analyseert en verbetert.

**Functionaliteit:**
1. Detecteer incomplete metadata
2. Identificeer inconsistenties
3. Suggereer verbeteringen
4. Auto-fix common issues
5. Generate quality reports

**Metrics:**
- Completeness score
- Consistency score
- Accuracy validation
- Freshness tracking`,
      hints: [
        'Definieer quality rules per document type',
        'Gebruik cross-validation tussen extractors',
        'Implementeer automated testing',
        'Bouw visualisaties voor quality metrics'
      ]
    }
  ],
  resources: [
    {
      title: 'Metadata Standards for Digital Libraries',
      url: 'https://www.dublincore.org/',
      type: 'documentation'
    },
    {
      title: 'spaCy - Industrial NLP',
      url: 'https://spacy.io/',
      type: 'tool'
    },
    {
      title: 'PyMuPDF Documentation',
      url: 'https://pymupdf.readthedocs.io/',
      type: 'documentation'
    },
    {
      title: 'Elasticsearch Metadata Best Practices',
      url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html',
      type: 'guide'
    }
  ]
};