import { Lesson } from '@/lib/data/courses'

export const lesson41: Lesson = {
  id: 'lesson-4-1',
  title: 'Document Loaders & Processing',
  duration: '45 min',
  content: `
# Document Loaders & Processing

In deze les leren we documenten laden en verwerken voor gebruik in LangChain applicaties. We focussen op praktische voorbeelden met Nederlandse content.

## PDF Loader Example

PDFs zijn een van de meest voorkomende document types. Hier is een complete implementatie:

\`\`\`python
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os

# Load Nederlandse belastingdienst PDF
loader = PyPDFLoader("belastingaangifte_2024.pdf")
documents = loader.load()

# Split into chunks
splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)
chunks = splitter.split_documents(documents)

print(f"Loaded {len(documents)} pages, split into {len(chunks)} chunks")
\`\`\`

## Web Scraping Dutch News

Scrape Nederlandse nieuwssites voor actuele informatie:

\`\`\`python
from langchain.document_loaders import WebBaseLoader
import bs4

# Scrape NOS.nl
loader = WebBaseLoader(
    web_paths=["https://nos.nl/"],
    bs_kwargs=dict(
        parse_only=bs4.SoupStrainer(
            class_=("article__content", "article__title")
        )
    )
)

docs = loader.load()
\`\`\`

## Excel Financial Data

Laad Nederlandse financiële data uit Excel:

\`\`\`python
from langchain.document_loaders import UnstructuredExcelLoader

# Load Dutch financial report
loader = UnstructuredExcelLoader(
    "kwartaalcijfers_2024.xlsx",
    mode="elements"
)
docs = loader.load()

# Extract specific sheets
import pandas as pd
df = pd.read_excel("kwartaalcijfers_2024.xlsx", sheet_name="Winst_Verlies")
\`\`\`

## Text Splitter Comparison

Verschillende splitters voor verschillende use cases:

\`\`\`python
from langchain.text_splitter import (
    CharacterTextSplitter,
    RecursiveCharacterTextSplitter,
    TokenTextSplitter
)

text = "Dit is een lange Nederlandse tekst..."

# Character-based
char_splitter = CharacterTextSplitter(
    separator="\\n",
    chunk_size=1000,
    chunk_overlap=200
)

# Recursive (best for most cases)
recursive_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separators=["\\n\\n", "\\n", ". ", " ", ""]
)

# Token-based (for LLM limits)
token_splitter = TokenTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)
\`\`\`

## Dutch Text Handling

Tips voor Nederlandse tekst:

\`\`\`python
# Handle Dutch special characters
text = text.encode('utf-8').decode('utf-8')

# Dutch-specific splitting
dutch_splitter = RecursiveCharacterTextSplitter(
    separators=["\\n\\n", "\\n", ". ", "? ", "! ", "; ", ", ", " ", ""],
    chunk_size=1000
)

# Language detection
from langdetect import detect
if detect(text) == 'nl':
    # Apply Dutch-specific processing
    pass
\`\`\``,
  codeExamples: [
    {
      id: 'example-1',
      title: 'PDF Loader Implementation',
      language: 'python',
      code: `from langchain.document_loaders import PyPDFLoader, PDFMinerLoader, PDFPlumberLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from typing import List, Dict, Any
import hashlib
from datetime import datetime

class DutchPDFProcessor:
    """Process Dutch PDF documents with metadata extraction"""
    
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\\n\\n", "\\n", ". ", "? ", "! ", "; ", ", ", " ", ""]
        )
    
    def load_pdf(self, file_path: str, method: str = "pypdf") -> List[Dict[str, Any]]:
        """Load PDF with fallback methods"""
        try:
            # Try PyPDF first (fastest)
            if method == "pypdf":
                loader = PyPDFLoader(file_path)
                pages = loader.load()
            
            # Fallback to PDFMiner (better text extraction)
            elif method == "pdfminer":
                loader = PDFMinerLoader(file_path)
                pages = loader.load()
            
            # PDFPlumber for complex layouts
            else:
                loader = PDFPlumberLoader(file_path)
                pages = loader.load()
            
            # Extract metadata
            metadata = self._extract_metadata(file_path, pages)
            
            # Process pages
            processed_docs = []
            for i, page in enumerate(pages):
                # Clean Dutch text
                content = self._clean_dutch_text(page.page_content)
                
                # Split into chunks
                chunks = self.splitter.split_text(content)
                
                for j, chunk in enumerate(chunks):
                    doc = {
                        'content': chunk,
                        'metadata': {
                            **metadata,
                            'page': i + 1,
                            'chunk': j + 1,
                            'total_chunks': len(chunks),
                            'chunk_hash': hashlib.md5(chunk.encode()).hexdigest()
                        }
                    }
                    processed_docs.append(doc)
            
            return processed_docs
            
        except Exception as e:
            print(f"Error loading PDF: {e}")
            # Try alternative method
            if method == "pypdf":
                return self.load_pdf(file_path, "pdfminer")
            raise
    
    def _extract_metadata(self, file_path: str, pages: List) -> Dict[str, Any]:
        """Extract PDF metadata"""
        import os
        
        # Basic file info
        file_stats = os.stat(file_path)
        
        # Content analysis
        full_text = " ".join([p.page_content for p in pages])
        
        return {
            'source': file_path,
            'filename': os.path.basename(file_path),
            'file_size': file_stats.st_size,
            'pages': len(pages),
            'processed_at': datetime.now().isoformat(),
            'language': 'nl',
            'word_count': len(full_text.split()),
            'has_tables': any('|' in p.page_content for p in pages),
            'encoding': 'utf-8'
        }
    
    def _clean_dutch_text(self, text: str) -> str:
        """Clean Dutch text and fix common issues"""
        # Fix Dutch special characters
        replacements = {
            'â€™': "'",
            'â€œ': '"',
            'â€': '"',
            'â€"': '-',
            'â‚¬': '€',
            'Ã©': 'é',
            'Ã«': 'ë',
            'Ã¯': 'ï',
            'Ã¶': 'ö',
            'Ã¼': 'ü'
        }
        
        for old, new in replacements.items():
            text = text.replace(old, new)
        
        # Remove excessive whitespace
        text = ' '.join(text.split())
        
        return text
    
    def process_dutch_legal_pdf(self, file_path: str) -> List[Dict[str, Any]]:
        """Special processing for Dutch legal documents"""
        docs = self.load_pdf(file_path)
        
        # Extract artikel references
        import re
        artikel_pattern = r'artikel\\s+\\d+[a-z]?'
        
        for doc in docs:
            # Find artikel references
            artikels = re.findall(artikel_pattern, doc['content'], re.IGNORECASE)
            doc['metadata']['artikel_refs'] = list(set(artikels))
            
            # Detect document type
            content_lower = doc['content'].lower()
            if 'wetboek' in content_lower:
                doc['metadata']['doc_type'] = 'wetboek'
            elif 'vonnis' in content_lower:
                doc['metadata']['doc_type'] = 'vonnis'
            elif 'beschikking' in content_lower:
                doc['metadata']['doc_type'] = 'beschikking'
        
        return docs

# Example usage
processor = DutchPDFProcessor(chunk_size=800, chunk_overlap=100)

# Process belastingdienst PDF
tax_docs = processor.load_pdf("aangifte_inkomstenbelasting_2024.pdf")
print(f"Processed {len(tax_docs)} chunks from tax document")

# Process legal document
legal_docs = processor.process_dutch_legal_pdf("burgerlijk_wetboek.pdf")
print(f"Found {len(set(doc['metadata'].get('artikel_refs', []) for doc in legal_docs))} unique artikel references")`,
      explanation: 'Complete PDF processor voor Nederlandse documenten met fallback methods en metadata extraction.',
      sandboxUrl: 'https://codesandbox.io/s/langchain-pdf-loader-dutch'
    },
    {
      id: 'example-2',
      title: 'Dutch News Web Scraper',
      language: 'python',
      code: `from langchain.document_loaders import WebBaseLoader
from bs4 import BeautifulSoup
import requests
from typing import List, Dict
from datetime import datetime
import time

class DutchNewsLoader:
    """Scrape Dutch news websites"""
    
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        # Dutch news sources
        self.sources = {
            'nos': {
                'base_url': 'https://nos.nl',
                'article_class': 'article__content',
                'title_class': 'article__title'
            },
            'nu': {
                'base_url': 'https://nu.nl',
                'article_class': 'article-body',
                'title_class': 'article-title'
            },
            'telegraaf': {
                'base_url': 'https://telegraaf.nl',
                'article_class': 'article-body',
                'title_class': 'article__title'
            }
        }
    
    def scrape_nos_article(self, url: str) -> Dict[str, Any]:
        """Scrape single NOS article"""
        try:
            # Use WebBaseLoader with custom parsing
            loader = WebBaseLoader(
                web_paths=[url],
                bs_kwargs=dict(
                    parse_only=BeautifulSoup.SoupStrainer(
                        class_=("article__content", "article__title", "article-meta__time")
                    )
                ),
                header_template=self.headers
            )
            
            docs = loader.load()
            
            if docs:
                content = docs[0].page_content
                
                # Extract metadata
                response = requests.get(url, headers=self.headers)
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Get publish time
                time_elem = soup.find(class_='article-meta__time')
                publish_time = time_elem.text if time_elem else None
                
                # Get category
                category_elem = soup.find(class_='article-meta__section')
                category = category_elem.text if category_elem else 'Algemeen'
                
                return {
                    'content': content,
                    'url': url,
                    'source': 'NOS',
                    'publish_time': publish_time,
                    'category': category,
                    'scraped_at': datetime.now().isoformat(),
                    'language': 'nl'
                }
            
        except Exception as e:
            print(f"Error scraping {url}: {e}")
            return None
    
    def scrape_news_category(self, source: str, category: str, max_articles: int = 10) -> List[Dict]:
        """Scrape articles from specific category"""
        articles = []
        
        if source == 'nos':
            category_urls = {
                'binnenland': 'https://nos.nl/nieuws/binnenland',
                'buitenland': 'https://nos.nl/nieuws/buitenland',
                'politiek': 'https://nos.nl/nieuws/politiek',
                'economie': 'https://nos.nl/nieuws/economie',
                'tech': 'https://nos.nl/nieuws/tech'
            }
            
            if category in category_urls:
                # Get category page
                response = requests.get(category_urls[category], headers=self.headers)
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Find article links
                links = soup.find_all('a', class_='link-block')[:max_articles]
                
                for link in links:
                    href = link.get('href')
                    if href:
                        full_url = f"https://nos.nl{href}"
                        article = self.scrape_nos_article(full_url)
                        if article:
                            articles.append(article)
                        
                        # Rate limiting
                        time.sleep(1)
        
        return articles
    
    def search_dutch_news(self, query: str, source: str = 'nos') -> List[Dict]:
        """Search for Dutch news articles"""
        search_urls = {
            'nos': f'https://nos.nl/zoeken/?q={query}',
            'nu': f'https://www.nu.nl/zoeken?q={query}'
        }
        
        if source not in search_urls:
            return []
        
        articles = []
        
        # Implement search scraping
        # ... (similar to category scraping)
        
        return articles

# Example usage
loader = DutchNewsLoader()

# Scrape single article
article = loader.scrape_nos_article("https://nos.nl/artikel/12345")
if article:
    print(f"Scraped: {article['content'][:200]}...")

# Scrape category
politiek_articles = loader.scrape_news_category('nos', 'politiek', max_articles=5)
print(f"Scraped {len(politiek_articles)} political articles")

# Create document collection
from langchain.schema import Document

documents = []
for article in politiek_articles:
    doc = Document(
        page_content=article['content'],
        metadata={
            'source': article['source'],
            'url': article['url'],
            'category': article['category'],
            'publish_time': article['publish_time']
        }
    )
    documents.append(doc)`,
      explanation: 'Web scraper voor Nederlandse nieuwssites met category support en metadata extraction.',
      sandboxUrl: 'https://codesandbox.io/s/dutch-news-scraper'
    },
    {
      id: 'example-3',
      title: 'Excel Financial Data Loader',
      language: 'python',
      code: `from langchain.document_loaders import UnstructuredExcelLoader
import pandas as pd
from typing import List, Dict, Any
import numpy as np

class DutchFinancialExcelLoader:
    """Load and process Dutch financial Excel files"""
    
    def __init__(self):
        self.currency_symbol = '€'
        self.decimal_separator = ','
        self.thousands_separator = '.'
    
    def load_excel_structured(self, file_path: str) -> Dict[str, pd.DataFrame]:
        """Load Excel with multiple sheets"""
        # Read all sheets
        excel_file = pd.ExcelFile(file_path)
        sheets = {}
        
        for sheet_name in excel_file.sheet_names:
            df = pd.read_excel(
                file_path, 
                sheet_name=sheet_name,
                decimal=self.decimal_separator,
                thousands=self.thousands_separator
            )
            
            # Clean column names
            df.columns = [self._clean_dutch_column(col) for col in df.columns]
            
            # Convert Dutch number formats
            df = self._convert_dutch_numbers(df)
            
            sheets[sheet_name] = df
        
        return sheets
    
    def load_financial_report(self, file_path: str) -> List[Dict[str, Any]]:
        """Load Dutch financial report and convert to documents"""
        loader = UnstructuredExcelLoader(file_path, mode="elements")
        raw_docs = loader.load()
        
        # Process with pandas for structured data
        sheets = self.load_excel_structured(file_path)
        
        documents = []
        
        # Process Winst & Verlies (Profit & Loss)
        if 'Winst_Verlies' in sheets:
            pnl_doc = self._process_pnl_sheet(sheets['Winst_Verlies'])
            documents.append(pnl_doc)
        
        # Process Balans (Balance Sheet)
        if 'Balans' in sheets:
            balance_doc = self._process_balance_sheet(sheets['Balans'])
            documents.append(balance_doc)
        
        # Process Cashflow
        if 'Kasstroom' in sheets:
            cashflow_doc = self._process_cashflow(sheets['Kasstroom'])
            documents.append(cashflow_doc)
        
        return documents
    
    def _clean_dutch_column(self, col: str) -> str:
        """Clean Dutch column names"""
        translations = {
            'omzet': 'revenue',
            'kosten': 'costs',
            'winst': 'profit',
            'verlies': 'loss',
            'activa': 'assets',
            'passiva': 'liabilities',
            'eigen_vermogen': 'equity',
            'kwartaal': 'quarter',
            'jaar': 'year'
        }
        
        col_clean = col.lower().replace(' ', '_')
        for dutch, english in translations.items():
            col_clean = col_clean.replace(dutch, english)
        
        return col_clean
    
    def _convert_dutch_numbers(self, df: pd.DataFrame) -> pd.DataFrame:
        """Convert Dutch number formats to standard"""
        for col in df.columns:
            if df[col].dtype == object:
                # Try to convert string numbers
                try:
                    # Remove currency symbols and convert
                    df[col] = df[col].astype(str).str.replace('€', '')
                    df[col] = df[col].str.replace('.', '')  # Remove thousands
                    df[col] = df[col].str.replace(',', '.')  # Convert decimal
                    df[col] = pd.to_numeric(df[col], errors='ignore')
                except:
                    pass
        
        return df
    
    def _process_pnl_sheet(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Process Profit & Loss statement"""
        # Calculate key metrics
        if 'revenue' in df.columns and 'costs' in df.columns:
            df['gross_margin'] = (df['revenue'] - df['costs']) / df['revenue'] * 100
        
        # Create summary
        summary = {
            'type': 'profit_loss',
            'content': f"""
Winst & Verlies Overzicht:

Totale Omzet: €{df['revenue'].sum():,.2f}
Totale Kosten: €{df['costs'].sum():,.2f}
Nettowinst: €{(df['revenue'].sum() - df['costs'].sum()):,.2f}

Gemiddelde Brutomarge: {df.get('gross_margin', pd.Series()).mean():.1f}%

Kwartaaloverzicht:
{df.to_string()}
""",
            'metadata': {
                'document_type': 'financial_pnl',
                'currency': 'EUR',
                'period': f"{df['year'].min()}-{df['year'].max()}",
                'metrics': {
                    'total_revenue': float(df['revenue'].sum()),
                    'total_costs': float(df['costs'].sum()),
                    'net_profit': float(df['revenue'].sum() - df['costs'].sum())
                }
            }
        }
        
        return summary
    
    def _process_balance_sheet(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Process balance sheet"""
        return {
            'type': 'balance_sheet',
            'content': f"Balans:\\n{df.to_string()}",
            'metadata': {
                'document_type': 'financial_balance',
                'total_assets': float(df.get('assets', pd.Series()).sum()),
                'total_liabilities': float(df.get('liabilities', pd.Series()).sum()),
                'equity': float(df.get('equity', pd.Series()).sum())
            }
        }
    
    def _process_cashflow(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Process cashflow statement"""
        return {
            'type': 'cashflow',
            'content': f"Kasstroom Overzicht:\\n{df.to_string()}",
            'metadata': {
                'document_type': 'financial_cashflow'
            }
        }

# Example usage
loader = DutchFinancialExcelLoader()

# Load quarterly report
docs = loader.load_financial_report("kwartaalcijfers_2024_Q1.xlsx")

for doc in docs:
    print(f"\\nDocument Type: {doc['type']}")
    print(f"Content Preview: {doc['content'][:200]}...")
    print(f"Metrics: {doc['metadata'].get('metrics', {})}")`,
      explanation: 'Excel loader specifiek voor Nederlandse financiële rapporten met currency en number format handling.',
      sandboxUrl: 'https://codesandbox.io/s/dutch-excel-loader'
    },
    {
      id: 'example-4',
      title: 'Text Splitter Comparison',
      language: 'python',
      code: `from langchain.text_splitter import (
    CharacterTextSplitter,
    RecursiveCharacterTextSplitter,
    TokenTextSplitter,
    SentenceTransformersTokenTextSplitter
)
import tiktoken
from typing import List, Dict
import time

class TextSplitterBenchmark:
    """Compare different text splitters for Dutch content"""
    
    def __init__(self):
        self.sample_texts = {
            'legal': """Dit is artikel 1 van het Burgerlijk Wetboek. 
            De wet bepaalt dat alle natuurlijke personen rechten en plichten hebben.
            In het tweede lid staat beschreven dat rechtspersonen gelijkgesteld worden aan natuurlijke personen.
            Artikel 2 behandelt de rechtsbevoegdheid. Deze begint bij de geboorte en eindigt bij overlijden.""",
            
            'news': """Amsterdam, 15 maart 2024 - De Nederlandse economie groeit harder dan verwacht.
            Het CBS meldde vandaag dat het BBP in het eerste kwartaal met 2,3% is gestegen.
            Minister van Financiën reageerde positief op deze cijfers.
            'Dit toont aan dat ons beleid werkt,' aldus de minister tijdens een persconferentie.""",
            
            'technical': """De nieuwe AI-wetgeving van de EU heeft grote gevolgen voor Nederlandse bedrijven.
            Machine learning modellen moeten transparant zijn en discriminatie voorkomen.
            Bedrijven krijgen twee jaar om te voldoen aan de nieuwe regelgeving.
            Boetes kunnen oplopen tot 6% van de wereldwijde jaaromzet."""
        }
        
        self.encoding = tiktoken.get_encoding("cl100k_base")
    
    def compare_splitters(self, text: str, chunk_size: int = 100) -> Dict[str, Dict]:
        """Compare different splitters on the same text"""
        results = {}
        
        # 1. Character Text Splitter
        char_splitter = CharacterTextSplitter(
            separator="\\n",
            chunk_size=chunk_size,
            chunk_overlap=20,
            length_function=len
        )
        
        start = time.time()
        char_chunks = char_splitter.split_text(text)
        char_time = time.time() - start
        
        results['character'] = {
            'chunks': char_chunks,
            'count': len(char_chunks),
            'time': char_time,
            'avg_size': sum(len(c) for c in char_chunks) / len(char_chunks) if char_chunks else 0
        }
        
        # 2. Recursive Character Text Splitter
        recursive_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=20,
            length_function=len,
            separators=["\\n\\n", "\\n", ". ", "? ", "! ", "; ", ", ", " ", ""]
        )
        
        start = time.time()
        recursive_chunks = recursive_splitter.split_text(text)
        recursive_time = time.time() - start
        
        results['recursive'] = {
            'chunks': recursive_chunks,
            'count': len(recursive_chunks),
            'time': recursive_time,
            'avg_size': sum(len(c) for c in recursive_chunks) / len(recursive_chunks) if recursive_chunks else 0
        }
        
        # 3. Token Text Splitter
        token_splitter = TokenTextSplitter(
            chunk_size=chunk_size // 4,  # Tokens are ~4 chars
            chunk_overlap=5
        )
        
        start = time.time()
        token_chunks = token_splitter.split_text(text)
        token_time = time.time() - start
        
        results['token'] = {
            'chunks': token_chunks,
            'count': len(token_chunks),
            'time': token_time,
            'avg_tokens': sum(len(self.encoding.encode(c)) for c in token_chunks) / len(token_chunks) if token_chunks else 0
        }
        
        # 4. Sentence Transformers Token Splitter
        sentence_splitter = SentenceTransformersTokenTextSplitter(
            chunk_overlap=20,
            tokens_per_chunk=chunk_size // 4
        )
        
        start = time.time()
        sentence_chunks = sentence_splitter.split_text(text)
        sentence_time = time.time() - start
        
        results['sentence_transformer'] = {
            'chunks': sentence_chunks,
            'count': len(sentence_chunks),
            'time': sentence_time,
            'semantic_preservation': self._check_semantic_preservation(text, sentence_chunks)
        }
        
        return results
    
    def _check_semantic_preservation(self, original: str, chunks: List[str]) -> float:
        """Check how well semantic units are preserved"""
        # Count complete sentences
        sentences_original = original.count('.') + original.count('!') + original.count('?')
        sentences_chunks = sum(c.count('.') + c.count('!') + c.count('?') for c in chunks)
        
        return sentences_chunks / sentences_original if sentences_original > 0 else 0
    
    def analyze_dutch_specifics(self, text: str) -> Dict[str, Any]:
        """Analyze Dutch-specific splitting challenges"""
        # Dutch compound words
        compound_words = ['samenwerkingsverband', 'arbeidsongeschiktheidsverzekering', 
                         'meervoudigepersoonlijkheidsstoornis']
        
        # Test different splitters
        results = self.compare_splitters(text, chunk_size=150)
        
        analysis = {
            'splitter_comparison': results,
            'dutch_challenges': {
                'compound_words_split': {},
                'abbreviation_handling': {},
                'quote_preservation': {}
            }
        }
        
        # Check compound word handling
        for splitter_name, result in results.items():
            chunks = result['chunks']
            for word in compound_words:
                if word in text:
                    # Check if compound word is split
                    word_intact = any(word in chunk for chunk in chunks)
                    analysis['dutch_challenges']['compound_words_split'][splitter_name] = word_intact
        
        return analysis
    
    def benchmark_all(self) -> None:
        """Run comprehensive benchmark"""
        print("=== Text Splitter Comparison for Dutch Content ===\\n")
        
        for text_type, text in self.sample_texts.items():
            print(f"\\nTesting {text_type} text ({len(text)} chars):")
            print("-" * 50)
            
            results = self.compare_splitters(text, chunk_size=200)
            
            for splitter, data in results.items():
                print(f"\\n{splitter.upper()}:")
                print(f"  Chunks: {data['count']}")
                print(f"  Time: {data['time']*1000:.2f}ms")
                print(f"  Avg size: {data.get('avg_size', data.get('avg_tokens', 0)):.1f}")
                
                if data['chunks']:
                    print(f"  First chunk: '{data['chunks'][0][:50]}...'")

# Example usage
benchmark = TextSplitterBenchmark()

# Run full benchmark
benchmark.benchmark_all()

# Test specific text
custom_text = """De Algemene Verordening Gegevensbescherming (AVG) is sinds 25 mei 2018 van kracht.
Organisaties moeten kunnen aantonen dat zij voldoen aan de AVG-vereisten.
Dit betekent dat zij een register moeten bijhouden van alle verwerkingsactiviteiten."""

results = benchmark.compare_splitters(custom_text)
print(f"\\nCustom text results: {len(results)} splitters tested")`,
      explanation: 'Uitgebreide vergelijking van verschillende text splitters met Dutch-specific testing.',
      sandboxUrl: 'https://codesandbox.io/s/text-splitter-comparison'
    },
    {
      id: 'example-5',
      title: 'Dutch Text Handling Guide',
      language: 'python',
      code: `import re
from typing import List, Dict, Tuple
import unicodedata
from langdetect import detect
import spacy

class DutchTextHandler:
    """Comprehensive Dutch text handling utilities"""
    
    def __init__(self):
        # Dutch-specific patterns
        self.dutch_abbreviations = {
            'dhr.': 'de heer',
            'mevr.': 'mevrouw',
            'mw.': 'mevrouw',
            'dr.': 'doctor',
            'mr.': 'meester',
            'ing.': 'ingenieur',
            'drs.': 'doctorandus',
            'prof.': 'professor',
            'b.v.': 'bijvoorbeeld',
            'd.w.z.': 'dat wil zeggen',
            'enz.': 'enzovoort',
            'etc.': 'et cetera',
            'nl.': 'namelijk',
            'o.a.': 'onder andere',
            't.a.v.': 'ter attentie van'
        }
        
        # Load Dutch spaCy model if available
        try:
            self.nlp = spacy.load("nl_core_news_sm")
        except:
            self.nlp = None
            print("Dutch spaCy model not found. Install with: python -m spacy download nl_core_news_sm")
    
    def preprocess_dutch_text(self, text: str) -> str:
        """Complete preprocessing pipeline for Dutch text"""
        # 1. Fix encoding issues
        text = self.fix_dutch_encoding(text)
        
        # 2. Normalize unicode
        text = unicodedata.normalize('NFC', text)
        
        # 3. Expand abbreviations
        text = self.expand_abbreviations(text)
        
        # 4. Handle Dutch quotes
        text = self.normalize_quotes(text)
        
        # 5. Fix spacing around punctuation
        text = self.fix_punctuation_spacing(text)
        
        return text
    
    def fix_dutch_encoding(self, text: str) -> str:
        """Fix common Dutch encoding issues"""
        # Common mojibake patterns
        replacements = {
            'Ã¡': 'á', 'Ã©': 'é', 'Ã­': 'í', 'Ã³': 'ó', 'Ãº': 'ú',
            'Ã€': 'à', 'Ã¨': 'è', 'Ã¬': 'ì', 'Ã²': 'ò', 'Ã¹': 'ù',
            'Ã‰': 'É', 'Ã«': 'ë', 'Ã¯': 'ï', 'Ã¶': 'ö', 'Ã¼': 'ü',
            'Ã„': 'Ä', 'Ã‹': 'Ë', 'Ãœ': 'Ï', 'Ã–': 'Ö', 'Ãœ': 'Ü',
            'â€™': "'", 'â€œ': '"', 'â€': '"', 'â€"': '–',
            'â‚¬': '€', 'â€¦': '...', 'â€¢': '•'
        }
        
        for old, new in replacements.items():
            text = text.replace(old, new)
        
        return text
    
    def expand_abbreviations(self, text: str) -> str:
        """Expand Dutch abbreviations for better processing"""
        for abbr, expansion in self.dutch_abbreviations.items():
            # Use word boundaries to avoid partial matches
            pattern = r'\\b' + re.escape(abbr)
            text = re.sub(pattern, expansion, text, flags=re.IGNORECASE)
        
        return text
    
    def normalize_quotes(self, text: str) -> str:
        """Normalize Dutch quotation marks"""
        # Dutch uses „aanhalingstekens" or "aanhalingstekens"
        quote_pairs = [
            ('„', '"'), ('"', '"'),  # Dutch low-high quotes
            ('‚', '''), (''', '''),  # Single quotes
            ('«', '"'), ('»', '"'),  # French quotes sometimes used
            ('"', '"'), ('"', '"')   # English quotes
        ]
        
        for old, new in quote_pairs:
            text = text.replace(old, new)
        
        return text
    
    def fix_punctuation_spacing(self, text: str) -> str:
        """Fix spacing around Dutch punctuation"""
        # Remove space before punctuation
        text = re.sub(r'\\s+([.,!?;:])', r'\\1', text)
        
        # Add space after punctuation if missing
        text = re.sub(r'([.,!?;:])([A-Za-z])', r'\\1 \\2', text)
        
        # Fix Dutch decimal numbers (1.000,50 format)
        text = re.sub(r'(\\d)\\.(\\d{3})', r'\\1.\\2', text)  # Keep thousand separator
        
        return text
    
    def split_dutch_sentences(self, text: str) -> List[str]:
        """Split Dutch text into sentences properly"""
        if self.nlp:
            # Use spaCy for accurate sentence splitting
            doc = self.nlp(text)
            return [sent.text.strip() for sent in doc.sents]
        else:
            # Fallback regex-based splitting
            # Handle abbreviations
            for abbr in self.dutch_abbreviations:
                text = text.replace(abbr, abbr.replace('.', '@@@'))
            
            # Split sentences
            sentences = re.split(r'(?<=[.!?])\\s+(?=[A-Z])', text)
            
            # Restore periods
            sentences = [s.replace('@@@', '.') for s in sentences]
            
            return sentences
    
    def extract_dutch_entities(self, text: str) -> Dict[str, List[str]]:
        """Extract Dutch named entities"""
        entities = {
            'persons': [],
            'organizations': [],
            'locations': [],
            'dates': [],
            'money': []
        }
        
        if self.nlp:
            doc = self.nlp(text)
            for ent in doc.ents:
                if ent.label_ == "PER":
                    entities['persons'].append(ent.text)
                elif ent.label_ == "ORG":
                    entities['organizations'].append(ent.text)
                elif ent.label_ in ["LOC", "GPE"]:
                    entities['locations'].append(ent.text)
                elif ent.label_ == "DATE":
                    entities['dates'].append(ent.text)
                elif ent.label_ == "MONEY":
                    entities['money'].append(ent.text)
        
        # Deduplicate
        for key in entities:
            entities[key] = list(set(entities[key]))
        
        return entities
    
    def validate_dutch_text(self, text: str) -> Tuple[bool, List[str]]:
        """Validate if text is proper Dutch with feedback"""
        issues = []
        
        # Check language
        try:
            if detect(text) != 'nl':
                issues.append("Text appears not to be Dutch")
        except:
            issues.append("Could not detect language")
        
        # Check for common encoding issues
        if any(char in text for char in ['Ã', 'â€', 'Â']):
            issues.append("Possible encoding issues detected")
        
        # Check for proper Dutch characters
        dutch_chars = set('áàäéèëíìïóòöúùüÁÀÄÉÈËÍÌÏÓÒÖÚÙÜ')
        if not any(char in text for char in dutch_chars) and len(text) > 100:
            issues.append("No Dutch diacritics found in substantial text")
        
        return len(issues) == 0, issues

# Example usage
handler = DutchTextHandler()

# Test text with various issues
test_text = """Dhr. J. van der Berg is werkzaam bij ABC B.V. te Amsterdam.
Het bedrijf heeft een omzet van â‚¬ 1.500.000,- per jaar.
D.w.z. , ze behoren tot de grote bedrijven in Nederland ."""

# Process text
clean_text = handler.preprocess_dutch_text(test_text)
print("Original:", test_text)
print("Cleaned:", clean_text)

# Extract entities
entities = handler.extract_dutch_entities(clean_text)
print("\\nEntities found:", entities)

# Validate
is_valid, issues = handler.validate_dutch_text(clean_text)
print(f"\\nValid Dutch: {is_valid}")
if issues:
    print("Issues:", issues)`,
      explanation: 'Complete toolkit voor Dutch text preprocessing, validation en entity extraction.',
      sandboxUrl: 'https://codesandbox.io/s/dutch-text-handler'
    }
  ],
  assignments: [
    {
      id: 'assignment-4-1',
      title: 'Build Dutch Document Pipeline',
      description: 'Bouw een complete document processing pipeline voor Nederlandse documenten.',
      difficulty: 'medium',
      type: 'project',
      initialCode: `# Build a Dutch document processing pipeline
# Requirements:
# 1. Support PDF, Web, and Excel sources
# 2. Handle Dutch text properly
# 3. Smart chunking with overlap
# 4. Extract and store metadata

from typing import List, Dict, Any
import asyncio

class DutchDocumentPipeline:
    def __init__(self):
        # Initialize your pipeline
        pass
    
    async def process_documents(self, sources: List[str]) -> List[Dict]:
        """Process multiple document sources"""
        # TODO: Implement document processing
        pass
    
    def chunk_dutch_text(self, text: str) -> List[str]:
        """Smart chunking for Dutch text"""
        # TODO: Implement chunking
        pass

# Test your pipeline
async def test_pipeline():
    pipeline = DutchDocumentPipeline()
    
    sources = [
        "belastingaangifte.pdf",
        "https://nos.nl/artikel/12345",
        "jaarverslag_2024.xlsx"
    ]
    
    results = await pipeline.process_documents(sources)
    print(f"Processed {len(results)} documents")

if __name__ == "__main__":
    asyncio.run(test_pipeline())`,
      solution: 'See full implementation in the code examples above',
      hints: [
        'Use appropriate loaders for each file type',
        'Handle Dutch encoding issues properly',
        'Consider sentence boundaries for chunking',
        'Extract meaningful metadata for retrieval'
      ]
    }
  ],
  resources: [
    {
      title: 'LangChain Document Loaders',
      url: 'https://python.langchain.com/docs/modules/data_connection/document_loaders/',
      type: 'documentation'
    },
    {
      title: 'Dutch NLP with spaCy',
      url: 'https://spacy.io/models/nl',
      type: 'documentation'
    },
    {
      title: 'Text Splitting Strategies',
      url: 'https://www.pinecone.io/learn/chunking-strategies/',
      type: 'article'
    }
  ]
}