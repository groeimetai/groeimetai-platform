import { Lesson } from '@/lib/data/courses'

export const lesson3_1: Lesson = {
  id: 'lesson-3-1',
  title: 'Document loaders: PDF, Word, websites en databases',
  duration: '40 min',
  content: `
## Introductie tot Document Loaders

Document loaders zijn de eerste stap in je RAG pipeline. Ze zijn verantwoordelijk voor het extraheren van tekst uit verschillende bestandsformaten en bronnen. In deze les leren we hoe je professionele document loaders implementeert voor de meest voorkomende formaten.

### Waarom zijn Document Loaders belangrijk?

- **Veelzijdigheid**: Ondersteuning voor verschillende formaten
- **Kwaliteit**: Behoud van structuur en metadata
- **Schaalbaarheid**: Efficiënt verwerken van grote volumes
- **Flexibiliteit**: Aanpasbaar aan specifieke behoeften

## PDF Document Loaders

PDF's zijn het meest voorkomende formaat voor documenten. Er zijn verschillende strategieën voor PDF extraction:

### 1. PyPDF Loader

De eenvoudigste manier voor basic PDF extraction:

\`\`\`python
from langchain_community.document_loaders import PyPDFLoader

# Basic PDF loading
loader = PyPDFLoader("path/to/document.pdf")
documents = loader.load()

# Met pagina-informatie
for i, doc in enumerate(documents):
    print(f"Pagina {i+1}: {len(doc.page_content)} karakters")
    print(f"Metadata: {doc.metadata}")
\`\`\`

### 2. PDFPlumber Loader

Voor meer controle over extraction en tabel-ondersteuning:

\`\`\`python
from langchain_community.document_loaders import PDFPlumberLoader

loader = PDFPlumberLoader("path/to/document.pdf")
documents = loader.load()

# PDFPlumber behoudt tabellen beter
for doc in documents:
    if "table" in doc.metadata:
        print("Tabel gevonden op pagina", doc.metadata["page"])
\`\`\`

### 3. Unstructured PDF Loader

Voor complexe PDF's met afbeeldingen en layouts:

\`\`\`python
from langchain_community.document_loaders import UnstructuredPDFLoader

loader = UnstructuredPDFLoader(
    "path/to/document.pdf",
    mode="elements",  # Voor gedetailleerde element extraction
    strategy="hi_res"  # Voor OCR ondersteuning
)

elements = loader.load()

# Categoriseer elementen
for element in elements:
    if element.metadata.get("category") == "Title":
        print(f"Titel: {element.page_content}")
    elif element.metadata.get("category") == "Table":
        print(f"Tabel: {element.page_content}")
\`\`\`

## Structured vs Unstructured Data

Voordat we specifieke loaders bespreken, is het belangrijk om het verschil tussen structured en unstructured data te begrijpen:

### Structured Data
- **Kenmerken**: Vaste schema's, tabellen, relaties
- **Voorbeelden**: Databases, CSV, Excel, JSON
- **Voordelen**: Makkelijk te parsen, consistent format
- **Uitdagingen**: Beperkte flexibiliteit

### Unstructured Data
- **Kenmerken**: Vrije tekst, variabele formats
- **Voorbeelden**: PDF, Word, websites, emails
- **Voordelen**: Rijk aan informatie, natuurlijke taal
- **Uitdagingen**: Complexe extraction, inconsistent

## Word en Excel Document Loaders

Voor Microsoft Office documenten:

\`\`\`python
from langchain_community.document_loaders import Docx2txtLoader
from langchain_community.document_loaders import UnstructuredWordDocumentLoader

# Simpele text extraction
loader = Docx2txtLoader("path/to/document.docx")
documents = loader.load()

# Met behoud van structuur
loader = UnstructuredWordDocumentLoader(
    "path/to/document.docx",
    mode="elements"
)
elements = loader.load()

# Verwerk verschillende elementen
headers = []
paragraphs = []
tables = []

for element in elements:
    category = element.metadata.get("category", "")
    if "Header" in category:
        headers.append(element.page_content)
    elif category == "Table":
        tables.append(element.page_content)
    else:
        paragraphs.append(element.page_content)
\`\`\`

### Excel Document Loader

Voor Excel spreadsheets (.xlsx):

\`\`\`python
from langchain_community.document_loaders import UnstructuredExcelLoader
import pandas as pd
from typing import List
from langchain.schema import Document

# Met Unstructured
loader = UnstructuredExcelLoader("data.xlsx", mode="elements")
documents = loader.load()

# Custom Excel loader met pandas
class ExcelLoader:
    """Custom Excel loader met sheet handling."""
    
    def __init__(self, file_path: str):
        self.file_path = file_path
    
    def load(self) -> List[Document]:
        """Laad alle sheets uit Excel bestand."""
        documents = []
        
        # Lees Excel file
        excel_file = pd.ExcelFile(self.file_path)
        
        for sheet_name in excel_file.sheet_names:
            df = pd.read_excel(self.file_path, sheet_name=sheet_name)
            
            # Converteer DataFrame naar document
            content = df.to_string()
            
            # Of verwerk rij voor rij
            for idx, row in df.iterrows():
                row_content = " | ".join([f"{col}: {val}" for col, val in row.items()])
                
                doc = Document(
                    page_content=row_content,
                    metadata={
                        'source': self.file_path,
                        'sheet': sheet_name,
                        'row': idx,
                        'columns': list(df.columns)
                    }
                )
                documents.append(doc)
        
        return documents

# Gebruik
excel_loader = ExcelLoader("financial_data.xlsx")
docs = excel_loader.load()
\`\`\`

## Encoding en Character Set Handling

Het correct omgaan met verschillende encodings is cruciaal:

\`\`\`python
from langchain_community.document_loaders import TextLoader
import chardet

class SmartTextLoader:
    """Text loader met automatische encoding detectie."""
    
    def __init__(self, file_path: str):
        self.file_path = file_path
    
    def detect_encoding(self) -> str:
        """Detecteer bestand encoding."""
        with open(self.file_path, 'rb') as file:
            raw_data = file.read(10000)  # Eerste 10KB
            result = chardet.detect(raw_data)
            return result['encoding']
    
    def load(self) -> List[Document]:
        """Laad met gedetecteerde encoding."""
        encoding = self.detect_encoding()
        
        try:
            loader = TextLoader(self.file_path, encoding=encoding)
            return loader.load()
        except UnicodeDecodeError:
            # Fallback encodings proberen
            fallback_encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
            
            for enc in fallback_encodings:
                try:
                    loader = TextLoader(self.file_path, encoding=enc)
                    return loader.load()
                except UnicodeDecodeError:
                    continue
            
            # Laatste poging met error handling
            loader = TextLoader(
                self.file_path, 
                encoding='utf-8', 
                errors='ignore'
            )
            return loader.load()

# Voor verschillende bestandstypes
def load_with_encoding(file_path: str, file_type: str) -> List[Document]:
    """Laad bestand met correcte encoding handling."""
    
    if file_type in ['.txt', '.log', '.csv']:
        loader = SmartTextLoader(file_path)
        return loader.load()
    elif file_type == '.pdf':
        # PDFs hebben interne encoding
        loader = PyPDFLoader(file_path)
        return loader.load()
    elif file_type == '.html':
        # HTML kan encoding in meta tag hebben
        loader = UnstructuredHTMLLoader(
            file_path,
            encoding='auto'  # Auto-detect van meta tag
        )
        return loader.load()
\`\`\`

## Memory-Efficient Loading Strategies

Voor grote bestanden en datasets:

\`\`\`python
from typing import Iterator, List
import mmap
from langchain.text_splitter import RecursiveCharacterTextSplitter

class StreamingLoader:
    """Memory-efficient streaming document loader."""
    
    def __init__(self, file_path: str, chunk_size: int = 1024 * 1024):
        self.file_path = file_path
        self.chunk_size = chunk_size
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
    
    def stream_file(self) -> Iterator[str]:
        """Stream bestand in chunks."""
        with open(self.file_path, 'r', encoding='utf-8') as file:
            while True:
                chunk = file.read(self.chunk_size)
                if not chunk:
                    break
                yield chunk
    
    def load_lazy(self) -> Iterator[Document]:
        """Lazy loading met yield."""
        buffer = ""
        
        for chunk in self.stream_file():
            buffer += chunk
            
            # Split wanneer buffer groot genoeg is
            if len(buffer) > self.chunk_size * 2:
                docs = self.text_splitter.create_documents([buffer])
                for doc in docs[:-1]:  # Houd laatste doc voor overlap
                    yield doc
                buffer = docs[-1].page_content if docs else ""
        
        # Process laatste buffer
        if buffer:
            docs = self.text_splitter.create_documents([buffer])
            for doc in docs:
                yield doc
    
    def load_mmap(self) -> List[Document]:
        """Gebruik memory-mapped files voor grote bestanden."""
        documents = []
        
        with open(self.file_path, 'r+b') as file:
            with mmap.mmap(file.fileno(), 0, access=mmap.ACCESS_READ) as mmapped:
                # Lees in blokken
                file_size = len(mmapped)
                offset = 0
                
                while offset < file_size:
                    # Zoek naar natuurlijke breekpunt (newline)
                    end = min(offset + self.chunk_size, file_size)
                    while end < file_size and mmapped[end:end+1] != b'\\n':
                        end += 1
                    
                    # Extract chunk
                    chunk = mmapped[offset:end].decode('utf-8', errors='ignore')
                    
                    doc = Document(
                        page_content=chunk,
                        metadata={
                            'source': self.file_path,
                            'offset': offset,
                            'size': end - offset
                        }
                    )
                    documents.append(doc)
                    
                    offset = end + 1
        
        return documents

# Voor CSV streaming
class StreamingCSVLoader:
    """Stream grote CSV bestanden."""
    
    def __init__(self, file_path: str, chunksize: int = 10000):
        self.file_path = file_path
        self.chunksize = chunksize
    
    def load_lazy(self) -> Iterator[Document]:
        """Laad CSV in chunks."""
        import pandas as pd
        
        for chunk_df in pd.read_csv(
            self.file_path, 
            chunksize=self.chunksize,
            encoding='utf-8'
        ):
            # Process chunk
            for idx, row in chunk_df.iterrows():
                content = " | ".join([
                    f"{col}: {val}" 
                    for col, val in row.items() 
                    if pd.notna(val)
                ])
                
                yield Document(
                    page_content=content,
                    metadata={
                        'source': self.file_path,
                        'row_index': idx,
                        'chunk': idx // self.chunksize
                    }
                )

# Gebruik streaming loaders
stream_loader = StreamingLoader("large_document.txt")

# Process documenten één voor één
for doc in stream_loader.load_lazy():
    # Process document zonder alles in memory te laden
    process_document(doc)

# Voor CSV
csv_stream = StreamingCSVLoader("big_data.csv")
for doc in csv_stream.load_lazy():
    # Process row-by-row
    process_document(doc)
\`\`\`

## Website Loaders

Voor het scrapen en laden van web content:

### 1. Web Base Loader

Voor simpele web scraping:

\`\`\`python
from langchain_community.document_loaders import WebBaseLoader
import bs4

# Basic web loading
loader = WebBaseLoader("https://example.com")
documents = loader.load()

# Met BeautifulSoup parsing
loader = WebBaseLoader(
    web_paths=["https://example.com/page1", "https://example.com/page2"],
    bs_kwargs=dict(
        parse_only=bs4.SoupStrainer(
            class_=("post-content", "post-title", "post-header")
        )
    )
)
documents = loader.load()
\`\`\`

### 2. Sitemap Loader

Voor het laden van complete websites:

\`\`\`python
from langchain_community.document_loaders import SitemapLoader

# Laad alle pagina's van een sitemap
loader = SitemapLoader(
    "https://example.com/sitemap.xml",
    filter_urls=["https://example.com/docs/.*"],  # Filter specifieke URLs
    parsing_function=lambda content: content.get_text(separator=" ", strip=True)
)

documents = loader.load()
print(f"Geladen: {len(documents)} pagina's")
\`\`\`

### 3. Playwright Loader

Voor JavaScript-rendered content:

\`\`\`python
from langchain_community.document_loaders import PlaywrightURLLoader

# Voor dynamische websites
loader = PlaywrightURLLoader(
    urls=["https://example.com/dynamic-page"],
    remove_selectors=["header", "footer", ".ads"],  # Verwijder ongewenste elementen
    wait_time=3000  # Wacht op JavaScript rendering
)

documents = loader.load()
\`\`\`

## Database Loaders

Voor het laden van data uit databases:

### 1. SQL Database Loader

\`\`\`python
from langchain_community.document_loaders import SQLDatabaseLoader
from sqlalchemy import create_engine

# Maak database connectie
engine = create_engine("postgresql://user:password@localhost/dbname")

# Laad data met custom query
loader = SQLDatabaseLoader(
    query="SELECT title, content, created_at FROM articles WHERE status = 'published'",
    engine=engine,
    page_content_columns=["title", "content"],  # Kolommen voor content
    metadata_columns=["created_at"]  # Kolommen voor metadata
)

documents = loader.load()
\`\`\`

### 2. MongoDB Loader

\`\`\`python
from langchain_community.document_loaders import MongodbLoader

loader = MongodbLoader(
    connection_string="mongodb://localhost:27017/",
    db_name="mydatabase",
    collection_name="documents",
    filter_criteria={"status": "active"},
    field_names=["title", "content", "summary"]
)

documents = loader.load()
\`\`\`

## CSV en JSON Loaders

Voor gestructureerde data:

### CSV Loader

\`\`\`python
from langchain_community.document_loaders import CSVLoader

# Basic CSV loading
loader = CSVLoader(
    file_path="data.csv",
    csv_args={
        'delimiter': ',',
        'quotechar': '"',
        'fieldnames': ['name', 'description', 'category']
    }
)

documents = loader.load()

# Met custom parsing
loader = CSVLoader(
    file_path="data.csv",
    source_column="description",  # Kolom voor page_content
    metadata_columns=["name", "category"]  # Kolommen voor metadata
)
\`\`\`

### JSON Loader

\`\`\`python
from langchain_community.document_loaders import JSONLoader

# Voor simpele JSON
loader = JSONLoader(
    file_path='data.json',
    jq_schema='.[]',  # JQ query voor data selectie
    text_content=False
)

# Voor geneste JSON met JQ
loader = JSONLoader(
    file_path='complex_data.json',
    jq_schema='.articles[] | {title: .title, content: .body, author: .author.name}',
    content_key="content",
    metadata_func=lambda record, metadata: metadata.update({
        "title": record.get("title"),
        "author": record.get("author")
    }) or metadata
)

documents = loader.load()
\`\`\`

## Custom Document Loaders

Voor specifieke behoeften kun je custom loaders maken:

\`\`\`python
from langchain.document_loaders.base import BaseLoader
from langchain.schema import Document
from typing import List
import xml.etree.ElementTree as ET

class XMLLoader(BaseLoader):
    """Custom loader voor XML bestanden."""
    
    def __init__(self, file_path: str, encoding: str = "utf-8"):
        self.file_path = file_path
        self.encoding = encoding
    
    def load(self) -> List[Document]:
        """Laad XML en converteer naar Documents."""
        tree = ET.parse(self.file_path)
        root = tree.getroot()
        
        documents = []
        for article in root.findall('.//article'):
            content = article.find('content').text
            metadata = {
                'title': article.find('title').text,
                'author': article.find('author').text,
                'date': article.find('date').text,
                'source': self.file_path
            }
            
            doc = Document(
                page_content=content,
                metadata=metadata
            )
            documents.append(doc)
        
        return documents

# Gebruik custom loader
loader = XMLLoader("articles.xml")
documents = loader.load()
\`\`\`

## Batch Processing en Error Handling

Voor productie-omgevingen:

\`\`\`python
import asyncio
from typing import List, Dict, Any
from concurrent.futures import ThreadPoolExecutor
import logging

class RobustDocumentLoader:
    """Production-ready document loader met error handling."""
    
    def __init__(self, max_workers: int = 4):
        self.max_workers = max_workers
        self.logger = logging.getLogger(__name__)
    
    def load_document_safe(self, file_path: str, loader_class: Any) -> Dict[str, Any]:
        """Laad document met error handling."""
        try:
            loader = loader_class(file_path)
            documents = loader.load()
            return {
                'status': 'success',
                'file': file_path,
                'documents': documents,
                'count': len(documents)
            }
        except Exception as e:
            self.logger.error(f"Error loading {file_path}: {e}")
            return {
                'status': 'error',
                'file': file_path,
                'error': str(e)
            }
    
    def load_batch(self, file_paths: List[str], loader_map: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Laad meerdere documenten parallel."""
        results = []
        
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            futures = []
            
            for file_path in file_paths:
                # Bepaal loader op basis van extensie
                ext = file_path.split('.')[-1].lower()
                loader_class = loader_map.get(ext)
                
                if loader_class:
                    future = executor.submit(self.load_document_safe, file_path, loader_class)
                    futures.append(future)
                else:
                    results.append({
                        'status': 'error',
                        'file': file_path,
                        'error': f'No loader for extension: {ext}'
                    })
            
            # Verzamel resultaten
            for future in futures:
                results.append(future.result())
        
        return results

# Gebruik batch loader
loader_map = {
    'pdf': PyPDFLoader,
    'docx': Docx2txtLoader,
    'txt': TextLoader,
    'csv': CSVLoader,
    'json': JSONLoader
}

batch_loader = RobustDocumentLoader(max_workers=4)
files = ['doc1.pdf', 'doc2.docx', 'data.csv', 'info.json']
results = batch_loader.load_batch(files, loader_map)

# Verwerk resultaten
successful = [r for r in results if r['status'] == 'success']
failed = [r for r in results if r['status'] == 'error']

print(f"Succesvol geladen: {len(successful)} documenten")
print(f"Gefaald: {len(failed)} documenten")
\`\`\`

## Best Practices

1. **Kies de juiste loader**: Match de loader met je document type en requirements
2. **Test extraction kwaliteit**: Controleer altijd de output
3. **Handle errors gracefully**: Implementeer robuuste error handling
4. **Bewaar metadata**: Metadata is cruciaal voor retrieval
5. **Overweeg performance**: Gebruik async/parallel processing voor grote volumes
6. **Monitor memory gebruik**: Stream grote bestanden indien mogelijk
`,
  codeExamples: [
    {
      id: 'pdf-loader-comparison',
      title: 'PDF Loader Vergelijking',
      language: 'python',
      code: `# Vergelijk performance en capabilities van verschillende PDF loaders
from langchain_community.document_loaders import PyPDFLoader, PDFPlumberLoader, UnstructuredPDFLoader
import time

def compare_pdf_loaders(pdf_path: str):
    """Vergelijk verschillende PDF loaders."""
    results = {}
    
    # Test PyPDFLoader
    start = time.time()
    loader = PyPDFLoader(pdf_path)
    pypdf_docs = loader.load()
    results['PyPDF'] = {
        'time': time.time() - start,
        'pages': len(pypdf_docs),
        'chars': sum(len(doc.page_content) for doc in pypdf_docs)
    }
    
    # Test PDFPlumberLoader
    start = time.time()
    loader = PDFPlumberLoader(pdf_path)
    plumber_docs = loader.load()
    results['PDFPlumber'] = {
        'time': time.time() - start,
        'pages': len(plumber_docs),
        'chars': sum(len(doc.page_content) for doc in plumber_docs),
        'tables': sum(1 for doc in plumber_docs if 'table' in str(doc.metadata))
    }
    
    # Test UnstructuredPDFLoader
    start = time.time()
    loader = UnstructuredPDFLoader(pdf_path, mode="elements")
    unstructured_docs = loader.load()
    results['Unstructured'] = {
        'time': time.time() - start,
        'elements': len(unstructured_docs),
        'categories': set(doc.metadata.get('category', 'Unknown') for doc in unstructured_docs)
    }
    
    return results

# Gebruik
results = compare_pdf_loaders("research_paper.pdf")
for loader, stats in results.items():
    print(f"\\n{loader}:")
    for key, value in stats.items():
        print(f"  {key}: {value}")`
    },
    {
      id: 'multi-format-loader',
      title: 'Multi-Format Document Loader',
      language: 'python',
      code: `# Universele loader die automatisch het juiste format detecteert
from typing import List, Dict, Any, Optional
from pathlib import Path
import mimetypes
from langchain.schema import Document
from langchain_community.document_loaders import (
    PyPDFLoader, Docx2txtLoader, TextLoader,
    CSVLoader, JSONLoader, UnstructuredHTMLLoader
)

class MultiFormatLoader:
    """Universele document loader voor verschillende formaten."""
    
    def __init__(self):
        self.loader_map = {
            'application/pdf': PyPDFLoader,
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': Docx2txtLoader,
            'text/plain': TextLoader,
            'text/csv': CSVLoader,
            'application/json': JSONLoader,
            'text/html': UnstructuredHTMLLoader,
        }
        
        self.extension_map = {
            '.pdf': PyPDFLoader,
            '.docx': Docx2txtLoader,
            '.txt': TextLoader,
            '.csv': CSVLoader,
            '.json': JSONLoader,
            '.html': UnstructuredHTMLLoader,
        }
    
    def detect_file_type(self, file_path: str) -> Optional[str]:
        """Detecteer bestandstype."""
        mime_type, _ = mimetypes.guess_type(file_path)
        return mime_type
    
    def load(self, file_path: str, **kwargs) -> List[Document]:
        """Laad document met automatische format detectie."""
        path = Path(file_path)
        
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        # Probeer eerst op MIME type
        mime_type = self.detect_file_type(file_path)
        loader_class = self.loader_map.get(mime_type)
        
        # Fallback naar extensie
        if not loader_class:
            ext = path.suffix.lower()
            loader_class = self.extension_map.get(ext)
        
        if not loader_class:
            raise ValueError(f"Unsupported file type: {file_path}")
        
        # Speciale handling voor verschillende loaders
        if loader_class == CSVLoader and 'csv_args' not in kwargs:
            kwargs['csv_args'] = {'delimiter': ',', 'quotechar': '"'}
        
        if loader_class == JSONLoader and 'jq_schema' not in kwargs:
            kwargs['jq_schema'] = '.'
        
        # Laad document
        try:
            loader = loader_class(file_path, **kwargs)
            documents = loader.load()
            
            # Voeg source metadata toe
            for doc in documents:
                doc.metadata['source_type'] = loader_class.__name__
                doc.metadata['file_size'] = path.stat().st_size
                doc.metadata['file_name'] = path.name
            
            return documents
            
        except Exception as e:
            raise Exception(f"Error loading {file_path}: {str(e)}")
    
    def load_directory(self, directory: str, 
                      pattern: str = "*", 
                      recursive: bool = True) -> Dict[str, List[Document]]:
        """Laad alle documenten uit een directory."""
        path = Path(directory)
        if not path.is_dir():
            raise NotADirectoryError(f"Not a directory: {directory}")
        
        results = {}
        
        # Zoek bestanden
        if recursive:
            files = list(path.rglob(pattern))
        else:
            files = list(path.glob(pattern))
        
        # Laad elk bestand
        for file_path in files:
            if file_path.is_file():
                try:
                    documents = self.load(str(file_path))
                    results[str(file_path)] = documents
                except Exception as e:
                    print(f"Error loading {file_path}: {e}")
                    results[str(file_path)] = []
        
        return results

# Gebruik
loader = MultiFormatLoader()

# Laad enkel bestand
docs = loader.load("report.pdf")

# Laad directory
all_docs = loader.load_directory(
    "/path/to/documents",
    pattern="*.{pdf,docx,txt}",
    recursive=True
)

# Verwerk resultaten
total_docs = sum(len(docs) for docs in all_docs.values())
print(f"Totaal geladen: {total_docs} documenten uit {len(all_docs)} bestanden")`
    },
    {
      id: 'web-scraper-pipeline',
      title: 'Advanced Web Scraping Pipeline',
      language: 'python',
      code: `# Production-ready web scraping met async processing
from typing import List, Dict, Any, Optional
from urllib.parse import urljoin, urlparse
import asyncio
import aiohttp
from bs4 import BeautifulSoup
from langchain.schema import Document
from langchain_community.document_loaders import AsyncHtmlLoader, AsyncChromiumLoader
import hashlib
from datetime import datetime

class AdvancedWebScraper:
    """Production-ready web scraping pipeline."""
    
    def __init__(self, 
                 max_depth: int = 2,
                 max_pages: int = 100,
                 allowed_domains: Optional[List[str]] = None,
                 exclude_patterns: Optional[List[str]] = None):
        self.max_depth = max_depth
        self.max_pages = max_pages
        self.allowed_domains = allowed_domains or []
        self.exclude_patterns = exclude_patterns or []
        self.visited_urls = set()
        self.documents = []
    
    def is_valid_url(self, url: str) -> bool:
        """Check of URL geldig is voor scraping."""
        parsed = urlparse(url)
        
        # Check domain
        if self.allowed_domains:
            if not any(domain in parsed.netloc for domain in self.allowed_domains):
                return False
        
        # Check exclude patterns
        for pattern in self.exclude_patterns:
            if pattern in url:
                return False
        
        # Skip non-http(s) URLs
        if parsed.scheme not in ['http', 'https']:
            return False
        
        return True
    
    async def fetch_page(self, session: aiohttp.ClientSession, url: str) -> Optional[str]:
        """Fetch een pagina asynchroon."""
        try:
            async with session.get(url, timeout=10) as response:
                if response.status == 200:
                    return await response.text()
        except Exception as e:
            print(f"Error fetching {url}: {e}")
        return None
    
    def extract_links(self, html: str, base_url: str) -> List[str]:
        """Extract alle links uit HTML."""
        soup = BeautifulSoup(html, 'html.parser')
        links = []
        
        for tag in soup.find_all(['a', 'link']):
            href = tag.get('href')
            if href:
                absolute_url = urljoin(base_url, href)
                if self.is_valid_url(absolute_url):
                    links.append(absolute_url)
        
        return list(set(links))
    
    def extract_content(self, html: str, url: str) -> Document:
        """Extract relevante content uit HTML."""
        soup = BeautifulSoup(html, 'html.parser')
        
        # Verwijder script en style tags
        for tag in soup(['script', 'style', 'nav', 'footer', 'header']):
            tag.decompose()
        
        # Extract metadata
        title = soup.find('title')
        title_text = title.get_text(strip=True) if title else ''
        
        meta_description = soup.find('meta', attrs={'name': 'description'})
        description = meta_description.get('content', '') if meta_description else ''
        
        # Extract main content
        # Probeer verschillende content selectors
        content_selectors = [
            'main',
            'article',
            '[role="main"]',
            '.content',
            '#content',
            '.post-content'
        ]
        
        content = None
        for selector in content_selectors:
            element = soup.select_one(selector)
            if element:
                content = element.get_text(separator='\\n', strip=True)
                break
        
        # Fallback naar body
        if not content:
            body = soup.find('body')
            content = body.get_text(separator='\\n', strip=True) if body else ''
        
        # Maak document
        doc = Document(
            page_content=content,
            metadata={
                'source': url,
                'title': title_text,
                'description': description,
                'scraped_at': datetime.now().isoformat(),
                'content_hash': hashlib.md5(content.encode()).hexdigest(),
                'url_depth': len(urlparse(url).path.split('/')) - 1
            }
        )
        
        return doc
    
    async def scrape_recursive(self, url: str, depth: int = 0):
        """Scrape website recursief."""
        if depth > self.max_depth or len(self.visited_urls) >= self.max_pages:
            return
        
        if url in self.visited_urls:
            return
        
        self.visited_urls.add(url)
        
        async with aiohttp.ClientSession() as session:
            html = await self.fetch_page(session, url)
            if not html:
                return
            
            # Extract content
            doc = self.extract_content(html, url)
            self.documents.append(doc)
            
            # Extract en volg links
            if depth < self.max_depth:
                links = self.extract_links(html, url)
                
                # Scrape links parallel
                tasks = []
                for link in links[:10]:  # Limiteer parallel requests
                    if link not in self.visited_urls:
                        task = self.scrape_recursive(link, depth + 1)
                        tasks.append(task)
                
                if tasks:
                    await asyncio.gather(*tasks)
    
    async def scrape(self, start_urls: List[str]) -> List[Document]:
        """Start het scraping proces."""
        tasks = []
        for url in start_urls:
            task = self.scrape_recursive(url)
            tasks.append(task)
        
        await asyncio.gather(*tasks)
        
        # Dedupliceer op basis van content hash
        unique_docs = {}
        for doc in self.documents:
            hash_key = doc.metadata['content_hash']
            if hash_key not in unique_docs:
                unique_docs[hash_key] = doc
        
        return list(unique_docs.values())

# Gebruik
async def main():
    scraper = AdvancedWebScraper(
        max_depth=2,
        max_pages=50,
        allowed_domains=['example.com'],
        exclude_patterns=['/admin', '/login', '.pdf']
    )
    
    documents = await scraper.scrape([
        'https://example.com',
        'https://example.com/docs'
    ])
    
    print(f"Scraped {len(documents)} unique pages")
    
    # Analyseer content
    total_chars = sum(len(doc.page_content) for doc in documents)
    avg_chars = total_chars / len(documents) if documents else 0
    
    print(f"Totaal karakters: {total_chars}")
    print(f"Gemiddeld per pagina: {avg_chars:.0f}")

# Run scraper
asyncio.run(main())`
    },
    {
      id: 'database-batch-loader',
      title: 'Database Batch Loader',
      language: 'python',
      code: `# Efficiënte batch loading uit SQL databases met pagination
from sqlalchemy import create_engine, text
from typing import List, Iterator, Optional
from langchain.schema import Document
import json

class DatabaseBatchLoader:
    """Batch loader voor grote database resultsets."""
    
    def __init__(self, connection_string: str, batch_size: int = 1000):
        self.engine = create_engine(connection_string)
        self.batch_size = batch_size
    
    def count_records(self, query: str) -> int:
        """Tel aantal records voor query."""
        count_query = f"SELECT COUNT(*) FROM ({query}) as subquery"
        with self.engine.connect() as conn:
            result = conn.execute(text(count_query))
            return result.scalar()
    
    def load_batch(self, 
                   query: str,
                   content_columns: List[str],
                   metadata_columns: List[str],
                   offset: int = 0,
                   limit: Optional[int] = None) -> List[Document]:
        """Laad een batch documenten."""
        # Voeg LIMIT en OFFSET toe aan query
        paginated_query = f"{query} LIMIT :limit OFFSET :offset"
        
        documents = []
        with self.engine.connect() as conn:
            result = conn.execute(
                text(paginated_query),
                {"limit": limit or self.batch_size, "offset": offset}
            )
            
            for row in result:
                # Combineer content columns
                content_parts = []
                for col in content_columns:
                    value = getattr(row, col, None)
                    if value:
                        content_parts.append(f"{col}: {value}")
                
                content = "\\n".join(content_parts)
                
                # Verzamel metadata
                metadata = {
                    'source': 'database',
                    'batch_offset': offset
                }
                
                for col in metadata_columns:
                    value = getattr(row, col, None)
                    # Converteer complex types naar JSON
                    if isinstance(value, (dict, list)):
                        metadata[col] = json.dumps(value)
                    else:
                        metadata[col] = str(value) if value is not None else None
                
                doc = Document(
                    page_content=content,
                    metadata=metadata
                )
                documents.append(doc)
        
        return documents
    
    def load_all_batches(self,
                        query: str,
                        content_columns: List[str],
                        metadata_columns: List[str]) -> Iterator[List[Document]]:
        """Generator die alle batches yieldt."""
        offset = 0
        total_records = self.count_records(query)
        
        print(f"Loading {total_records} records in batches of {self.batch_size}")
        
        while offset < total_records:
            batch = self.load_batch(
                query=query,
                content_columns=content_columns,
                metadata_columns=metadata_columns,
                offset=offset
            )
            
            if not batch:
                break
                
            yield batch
            offset += self.batch_size
            
            # Progress update
            progress = min(100, (offset / total_records) * 100)
            print(f"Progress: {progress:.1f}% ({offset}/{total_records})")
    
    def load_with_joins(self,
                       main_table: str,
                       joins: List[Dict[str, str]],
                       content_mapping: Dict[str, List[str]],
                       where_clause: Optional[str] = None) -> Iterator[List[Document]]:
        """Laad data met complexe joins."""
        # Bouw query dynamisch
        select_columns = []
        from_clause = main_table
        
        # Voeg columns toe van main table
        for col in content_mapping.get(main_table, []):
            select_columns.append(f"{main_table}.{col}")
        
        # Voeg joins en columns toe
        for join in joins:
            table = join['table']
            from_clause += f" {join['type']} JOIN {table} ON {join['on']}"
            
            for col in content_mapping.get(table, []):
                select_columns.append(f"{table}.{col} as {table}_{col}")
        
        # Bouw complete query
        query = f"SELECT {', '.join(select_columns)} FROM {from_clause}"
        if where_clause:
            query += f" WHERE {where_clause}"
        
        # Bepaal content en metadata columns
        all_columns = [col.split(' as ')[-1] for col in select_columns]
        content_columns = all_columns[:len(content_mapping[main_table])]
        metadata_columns = all_columns[len(content_mapping[main_table]):]
        
        # Yield batches
        yield from self.load_all_batches(
            query=query,
            content_columns=content_columns,
            metadata_columns=metadata_columns
        )

# Gebruik
loader = DatabaseBatchLoader(
    connection_string="postgresql://user:pass@localhost/db",
    batch_size=500
)

# Simpele batch loading
for batch in loader.load_all_batches(
    query="SELECT * FROM articles WHERE status = 'published'",
    content_columns=['title', 'content'],
    metadata_columns=['author', 'created_at', 'tags']
):
    # Process batch
    for doc in batch:
        vector_store.add_documents([doc])

# Complex query met joins
for batch in loader.load_with_joins(
    main_table="articles",
    joins=[
        {
            'table': 'authors',
            'type': 'LEFT',
            'on': 'articles.author_id = authors.id'
        },
        {
            'table': 'categories',
            'type': 'LEFT',
            'on': 'articles.category_id = categories.id'
        }
    ],
    content_mapping={
        'articles': ['title', 'content', 'summary'],
        'authors': ['name', 'bio'],
        'categories': ['name', 'description']
    },
    where_clause="articles.status = 'published'"
):
    # Process joined data
    process_batch(batch)`
    }
  ],
  assignments: [
    {
      id: 'multi-format-loader',
      title: 'Multi-Format Document Loader',
      description: 'Implementeer een document loader die automatisch het juiste formaat detecteert en laadt.',
      type: 'code',
      difficulty: 'medium',
      hints: [
        'Gebruik pathlib.Path voor bestandsoperaties',
        'Implementeer een mapping van extensies naar loader classes',
        'Voeg error handling toe voor elk bestandstype',
        'Denk aan metadata enrichment voor elk document'
      ],
      solution: `def create_universal_loader(file_paths: List[str]) -> List[Document]:
    """Laad documenten van verschillende formaten."""
    from pathlib import Path
    
    all_documents = []
    loader_stats = {'success': 0, 'failed': 0, 'types': {}}
    
    for file_path in file_paths:
        try:
            path = Path(file_path)
            ext = path.suffix.lower()
            
            # Selecteer loader op basis van extensie
            if ext == '.pdf':
                loader = PyPDFLoader(file_path)
            elif ext == '.docx':
                loader = Docx2txtLoader(file_path)
            elif ext == '.txt':
                loader = TextLoader(file_path, encoding='utf-8')
            elif ext == '.csv':
                loader = CSVLoader(file_path)
            elif ext == '.json':
                loader = JSONLoader(file_path, jq_schema='.')
            elif ext in ['.html', '.htm']:
                loader = UnstructuredHTMLLoader(file_path)
            else:
                print(f"Unsupported format: {ext}")
                loader_stats['failed'] += 1
                continue
            
            # Laad document
            docs = loader.load()
            
            # Voeg extra metadata toe
            for doc in docs:
                doc.metadata['file_type'] = ext
                doc.metadata['file_size'] = path.stat().st_size
                doc.metadata['loaded_at'] = datetime.now().isoformat()
            
            all_documents.extend(docs)
            loader_stats['success'] += 1
            loader_stats['types'][ext] = loader_stats['types'].get(ext, 0) + 1
            
        except Exception as e:
            print(f"Error loading {file_path}: {e}")
            loader_stats['failed'] += 1
    
    # Print statistieken
    print(f"\\nLoader Statistics:")
    print(f"Success: {loader_stats['success']}")
    print(f"Failed: {loader_stats['failed']}")
    print(f"Types: {loader_stats['types']}")
    
    return all_documents`
    },
    {
      id: 'database-sync',
      title: 'Database naar Vector Store Sync',
      description: 'Bouw een systeem dat data uit een database synchroniseert met een vector store.',
      type: 'code',
      difficulty: 'expert',
      hints: [
        'Gebruik content hashing voor change detection',
        'Implementeer batch processing voor performance',
        'Denk aan incrementele sync strategieën',
        'Handle database connection errors gracefully'
      ],
      solution: `import hashlib
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy import create_engine, text
from langchain.schema import Document

class DatabaseVectorSync:
    """Synchroniseer database content met vector store."""
    
    def __init__(self, db_url: str, vector_store):
        self.engine = create_engine(db_url)
        self.vector_store = vector_store
        self.sync_state = {}
    
    def generate_content_hash(self, content: str) -> str:
        """Genereer hash voor content."""
        return hashlib.sha256(content.encode()).hexdigest()
    
    def load_from_database(self, query: str, 
                          content_columns: List[str],
                          metadata_columns: List[str],
                          id_column: str = 'id') -> List[Document]:
        """Laad documenten uit database."""
        documents = []
        
        with self.engine.connect() as conn:
            result = conn.execute(text(query))
            
            for row in result:
                # Combineer content columns
                content_parts = []
                for col in content_columns:
                    value = getattr(row, col, '')
                    if value:
                        content_parts.append(str(value))
                
                content = '\\n\\n'.join(content_parts)
                
                # Verzamel metadata
                metadata = {
                    'db_id': getattr(row, id_column),
                    'source': 'database',
                    'synced_at': datetime.now().isoformat()
                }
                
                for col in metadata_columns:
                    metadata[col] = getattr(row, col, None)
                
                # Voeg content hash toe voor change detection
                content_hash = self.generate_content_hash(content)
                metadata['content_hash'] = content_hash
                
                doc = Document(
                    page_content=content,
                    metadata=metadata
                )
                documents.append(doc)
        
        return documents
    
    def sync_to_vector_store(self, documents: List[Document], 
                            batch_size: int = 100) -> Dict[str, Any]:
        """Synchroniseer documenten naar vector store."""
        stats = {
            'new': 0,
            'updated': 0,
            'unchanged': 0,
            'deleted': 0
        }
        
        # Check bestaande documenten
        existing_ids = set()
        
        # Process in batches
        for i in range(0, len(documents), batch_size):
            batch = documents[i:i + batch_size]
            
            for doc in batch:
                db_id = doc.metadata['db_id']
                content_hash = doc.metadata['content_hash']
                
                existing_ids.add(db_id)
                
                # Check of document bestaat en is veranderd
                if db_id in self.sync_state:
                    if self.sync_state[db_id] != content_hash:
                        # Update document
                        self.vector_store.update_document(db_id, doc)
                        stats['updated'] += 1
                        self.sync_state[db_id] = content_hash
                    else:
                        stats['unchanged'] += 1
                else:
                    # Nieuw document
                    self.vector_store.add_documents([doc])
                    stats['new'] += 1
                    self.sync_state[db_id] = content_hash
        
        # Check voor verwijderde documenten
        for db_id in list(self.sync_state.keys()):
            if db_id not in existing_ids:
                self.vector_store.delete_document(db_id)
                del self.sync_state[db_id]
                stats['deleted'] += 1
        
        return stats
    
    def incremental_sync(self, query: str, 
                        content_columns: List[str],
                        metadata_columns: List[str],
                        timestamp_column: str = 'updated_at') -> Dict[str, Any]:
        """Doe incrementele sync op basis van timestamp."""
        # Bepaal laatste sync tijd
        last_sync = datetime.min
        if self.sync_state:
            last_sync = max(
                datetime.fromisoformat(state.get('synced_at', datetime.min.isoformat()))
                for state in self.sync_state.values()
            )
        
        # Pas query aan voor incrementele sync
        incremental_query = f"""
        {query} 
        WHERE {timestamp_column} > :last_sync
        ORDER BY {timestamp_column}
        """
        
        # Laad alleen nieuwe/gewijzigde documenten
        documents = self.load_from_database(
            incremental_query,
            content_columns,
            metadata_columns
        )
        
        # Sync naar vector store
        return self.sync_to_vector_store(documents)

# Gebruik
sync = DatabaseVectorSync(
    db_url="postgresql://user:pass@localhost/db",
    vector_store=vector_store
)

# Initial full sync
documents = sync.load_from_database(
    query="SELECT * FROM articles WHERE status = 'published'",
    content_columns=['title', 'content', 'summary'],
    metadata_columns=['author', 'category', 'created_at']
)
stats = sync.sync_to_vector_store(documents)
print(f"Initial sync: {stats}")

# Incremental sync
stats = sync.incremental_sync(
    query="SELECT * FROM articles WHERE status = 'published'",
    content_columns=['title', 'content', 'summary'],
    metadata_columns=['author', 'category', 'created_at'],
    timestamp_column='updated_at'
)
print(f"Incremental sync: {stats}")`
    },
    {
      id: 'web-scraper-rate-limit',
      title: 'Web Scraper met Rate Limiting',
      description: 'Implementeer een web scraper met rate limiting, retry logic en robots.txt respect.',
      type: 'project',
      difficulty: 'expert',
      hints: [
        'Gebruik asyncio voor concurrent scraping met rate limits',
        'Implementeer exponential backoff voor retries',
        'Parse robots.txt om crawl delays te respecteren',
        'Cache scraped content om duplicate requests te vermijden'
      ],
      solution: `import asyncio
import aiohttp
from typing import List, Dict, Any, Optional
from urllib.parse import urlparse, urljoin
from urllib.robotparser import RobotFileParser
import time
from collections import deque
import hashlib
from datetime import datetime, timedelta
from langchain.schema import Document

class RateLimitedWebScraper:
    """Web scraper met rate limiting en robots.txt compliance."""
    
    def __init__(self,
                 rate_limit: float = 1.0,  # Requests per second
                 max_retries: int = 3,
                 respect_robots: bool = True,
                 cache_duration: int = 3600):  # Cache duration in seconds
        self.rate_limit = rate_limit
        self.max_retries = max_retries
        self.respect_robots = respect_robots
        self.cache_duration = cache_duration
        
        # Rate limiting
        self.request_times = deque(maxlen=100)
        self.semaphore = asyncio.Semaphore(10)  # Max concurrent requests
        
        # Cache
        self.cache = {}
        self.robots_cache = {}
    
    async def check_robots_txt(self, url: str) -> Dict[str, Any]:
        """Check robots.txt voor URL."""
        parsed = urlparse(url)
        robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
        
        # Check cache
        if robots_url in self.robots_cache:
            return self.robots_cache[robots_url]
        
        # Parse robots.txt
        rp = RobotFileParser()
        rp.set_url(robots_url)
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(robots_url) as response:
                    if response.status == 200:
                        content = await response.text()
                        rp.parse(content.splitlines())
        except:
            # Als robots.txt niet bestaat, sta alles toe
            pass
        
        # Cache resultaat
        result = {
            'can_fetch': rp.can_fetch("*", url),
            'crawl_delay': rp.crawl_delay("*") or 0,
            'request_rate': rp.request_rate("*")
        }
        self.robots_cache[robots_url] = result
        
        return result
    
    async def rate_limit_check(self):
        """Implementeer rate limiting."""
        now = time.time()
        
        # Verwijder oude request times
        while self.request_times and self.request_times[0] < now - 1:
            self.request_times.popleft()
        
        # Check rate limit
        if len(self.request_times) >= self.rate_limit:
            # Wacht tot we weer kunnen requesten
            sleep_time = 1 - (now - self.request_times[0])
            if sleep_time > 0:
                await asyncio.sleep(sleep_time)
        
        # Registreer nieuwe request
        self.request_times.append(now)
    
    def get_cache_key(self, url: str) -> str:
        """Genereer cache key voor URL."""
        return hashlib.md5(url.encode()).hexdigest()
    
    def is_cached(self, url: str) -> bool:
        """Check of URL in cache zit."""
        cache_key = self.get_cache_key(url)
        if cache_key in self.cache:
            cached_time, _ = self.cache[cache_key]
            if datetime.now() - cached_time < timedelta(seconds=self.cache_duration):
                return True
        return False
    
    async def fetch_with_retry(self, 
                              session: aiohttp.ClientSession,
                              url: str) -> Optional[str]:
        """Fetch URL met retry logic."""
        for attempt in range(self.max_retries):
            try:
                # Rate limiting
                await self.rate_limit_check()
                
                # Fetch URL
                async with session.get(
                    url,
                    timeout=aiohttp.ClientTimeout(total=30),
                    headers={
                        'User-Agent': 'Mozilla/5.0 (compatible; RAGBot/1.0)'
                    }
                ) as response:
                    if response.status == 200:
                        return await response.text()
                    elif response.status == 429:  # Too Many Requests
                        # Exponential backoff
                        wait_time = 2 ** attempt
                        await asyncio.sleep(wait_time)
                    else:
                        print(f"Error {response.status} for {url}")
                        return None
                        
            except asyncio.TimeoutError:
                print(f"Timeout for {url}, attempt {attempt + 1}")
                await asyncio.sleep(2 ** attempt)
            except Exception as e:
                print(f"Error fetching {url}: {e}")
                await asyncio.sleep(2 ** attempt)
        
        return None
    
    async def scrape_url(self, url: str) -> Optional[Document]:
        """Scrape een enkele URL."""
        # Check cache
        cache_key = self.get_cache_key(url)
        if cache_key in self.cache:
            cached_time, cached_doc = self.cache[cache_key]
            if datetime.now() - cached_time < timedelta(seconds=self.cache_duration):
                print(f"Using cached version of {url}")
                return cached_doc
        
        # Check robots.txt
        if self.respect_robots:
            robots_info = await self.check_robots_txt(url)
            if not robots_info['can_fetch']:
                print(f"Robots.txt disallows fetching {url}")
                return None
            
            # Respect crawl delay
            if robots_info['crawl_delay'] > 0:
                await asyncio.sleep(robots_info['crawl_delay'])
        
        # Fetch content
        async with self.semaphore:  # Limit concurrent requests
            async with aiohttp.ClientSession() as session:
                html = await self.fetch_with_retry(session, url)
                
                if html:
                    # Parse content
                    from bs4 import BeautifulSoup
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    # Extract text
                    for tag in soup(['script', 'style', 'nav', 'footer']):
                        tag.decompose()
                    
                    text = soup.get_text(separator='\\n', strip=True)
                    
                    # Extract metadata
                    title = soup.find('title')
                    title_text = title.get_text(strip=True) if title else ''
                    
                    # Create document
                    doc = Document(
                        page_content=text,
                        metadata={
                            'source': url,
                            'title': title_text,
                            'scraped_at': datetime.now().isoformat(),
                            'domain': urlparse(url).netloc
                        }
                    )
                    
                    # Cache document
                    self.cache[cache_key] = (datetime.now(), doc)
                    
                    return doc
        
        return None
    
    async def scrape_urls(self, urls: List[str]) -> List[Document]:
        """Scrape meerdere URLs met rate limiting."""
        tasks = []
        
        for url in urls:
            task = self.scrape_url(url)
            tasks.append(task)
        
        # Gather results
        results = await asyncio.gather(*tasks)
        
        # Filter None values
        documents = [doc for doc in results if doc is not None]
        
        return documents
    
    def get_stats(self) -> Dict[str, Any]:
        """Get scraper statistics."""
        return {
            'cache_size': len(self.cache),
            'robots_cache_size': len(self.robots_cache),
            'current_rate': len(self.request_times),
            'max_rate': self.rate_limit
        }

# Gebruik
async def main():
    # Initialiseer scraper
    scraper = RateLimitedWebScraper(
        rate_limit=2.0,  # 2 requests per second
        max_retries=3,
        respect_robots=True,
        cache_duration=3600
    )
    
    # URLs om te scrapen
    urls = [
        'https://example.com/page1',
        'https://example.com/page2',
        'https://example.com/page3',
        # ... meer URLs
    ]
    
    # Scrape met rate limiting
    documents = await scraper.scrape_urls(urls)
    
    print(f"Scraped {len(documents)} documents")
    print(f"Stats: {scraper.get_stats()}")
    
    # Process documents
    for doc in documents:
        print(f"Title: {doc.metadata['title']}")
        print(f"Length: {len(doc.page_content)} chars")
        print("---")

# Run
asyncio.run(main())`
    }
  ],
  resources: [
    {
      title: 'LangChain Document Loaders Documentation',
      url: 'https://python.langchain.com/docs/modules/data_connection/document_loaders/',
      type: 'documentation'
    },
    {
      title: 'Unstructured Library Guide',
      url: 'https://unstructured-io.github.io/unstructured/',
      type: 'tutorial'
    },
    {
      title: 'PDF Processing Best Practices',
      url: 'https://arxiv.org/abs/2304.08485',
      type: 'article'
    },
    {
      title: 'Web Scraping with BeautifulSoup',
      url: 'https://realpython.com/beautiful-soup-web-scraper-python/',
      type: 'tutorial'
    }
  ]
}