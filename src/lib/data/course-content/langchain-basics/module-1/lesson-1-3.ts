import { Lesson } from '@/lib/data/courses'

export const lesson1_3: Lesson = {
  id: 'lesson-1-3',
  title: 'Je ontwikkelomgeving opzetten',
  duration: '25 min',
  content: `
# Je Ontwikkelomgeving Opzetten

Laten we stap voor stap je LangChain ontwikkelomgeving opzetten. We zorgen voor een professionele setup die je direct kunt gebruiken.

## 📋 Prerequisites

### Python Versie
- **Minimum**: Python 3.8
- **Aanbevolen**: Python 3.9 of hoger
- **Check**: \`python --version\`

### Package Manager
- **pip**: Standaard Python package manager
- **conda**: Voor environment isolation (optioneel)
- **poetry**: Voor dependency management (geavanceerd)

## 🚀 Installatie Stappen

### Stap 1: Virtual Environment

#### Optie A: venv (Aanbevolen)
\`\`\`bash
# Maak virtual environment
python -m venv langchain-env

# Activeer (Windows)
langchain-env\\Scripts\\activate

# Activeer (Mac/Linux)
source langchain-env/bin/activate
\`\`\`

#### Optie B: conda
\`\`\`bash
# Maak conda environment
conda create -n langchain python=3.9

# Activeer
conda activate langchain
\`\`\`

### Stap 2: Installeer LangChain

#### Basis Installatie
\`\`\`bash
# Core LangChain
pip install langchain

# Met OpenAI support
pip install langchain openai

# Met alle common dependencies
pip install langchain[all]
\`\`\`

#### Specifieke Modules
\`\`\`bash
# Voor verschillende LLM providers
pip install langchain-openai      # OpenAI
pip install langchain-anthropic   # Claude
pip install langchain-google-genai # Google

# Voor vector stores
pip install chromadb              # ChromaDB
pip install pinecone-client       # Pinecone
pip install faiss-cpu            # FAISS

# Voor document processing
pip install pypdf                 # PDF support
pip install docx2txt             # Word support
pip install youtube-transcript-api # YouTube
\`\`\`

### Stap 3: Environment Variables

#### .env File Setup
\`\`\`bash
# Maak .env file in je project root
touch .env
\`\`\`

#### Inhoud van .env
\`\`\`env
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic (Claude)
ANTHROPIC_API_KEY=sk-ant-...

# Google
GOOGLE_API_KEY=...

# Pinecone (indien gebruikt)
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...

# LangChain Tracing (optioneel)
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=ls__...
LANGCHAIN_PROJECT=my-project
\`\`\`

#### Load Environment Variables
\`\`\`python
from dotenv import load_dotenv
load_dotenv()  # Laad .env file
\`\`\`

## 🏗️ Project Structuur

### Aanbevolen Folder Structure
\`\`\`
my-langchain-project/
├── .env                    # Environment variables
├── .gitignore             # Git ignore file
├── requirements.txt       # Dependencies
├── README.md             # Project docs
├── src/
│   ├── __init__.py
│   ├── chains/           # Custom chains
│   ├── agents/           # Custom agents
│   ├── tools/            # Custom tools
│   ├── prompts/          # Prompt templates
│   └── utils/            # Helper functions
├── data/
│   ├── documents/        # Source documents
│   └── vectorstores/     # Persisted vectors
├── notebooks/            # Jupyter notebooks
└── tests/               # Unit tests
\`\`\`

## 🛠️ Development Tools

### VS Code Extensions
1. **Python** - Microsoft's Python extension
2. **Pylance** - Advanced type checking
3. **Python Docstring Generator** - Auto docstrings
4. **GitLens** - Git integration
5. **.env** - Environment file support

### Jupyter Setup
\`\`\`bash
# Installeer Jupyter
pip install jupyter ipykernel

# Registreer kernel
python -m ipykernel install --user --name=langchain
\`\`\`

### Debugging Tools
\`\`\`python
# Enable LangChain debug mode
import langchain
langchain.debug = True

# Enable verbose mode for chains
chain = SomeChain(verbose=True)
\`\`\`

## 🧪 Test Je Setup

### Verificatie Script
\`\`\`python
# verify_setup.py
import sys
print(f"Python: {sys.version}")

try:
    import langchain
    print(f"LangChain: {langchain.__version__}")
except ImportError:
    print("❌ LangChain niet geïnstalleerd")

try:
    import openai
    print(f"OpenAI: {openai.__version__}")
except ImportError:
    print("❌ OpenAI niet geïnstalleerd")

try:
    from dotenv import load_dotenv
    import os
    load_dotenv()
    
    if os.getenv("OPENAI_API_KEY"):
        print("✅ OpenAI API key gevonden")
    else:
        print("⚠️ OpenAI API key niet gevonden in .env")
except ImportError:
    print("❌ python-dotenv niet geïnstalleerd")
\`\`\`

## 💰 Kosten Management

### API Kosten Monitoring
\`\`\`python
from langchain.callbacks import get_openai_callback

with get_openai_callback() as cb:
    # Je LangChain operations hier
    result = chain.run(input)
    
    print(f"Tokens gebruikt: {cb.total_tokens}")
    print(f"Kosten: \${cb.total_cost:.4f}")
\`\`\`

### Rate Limiting
\`\`\`python
import time
from typing import Any, Dict
from langchain.callbacks.base import BaseCallbackHandler

class RateLimitHandler(BaseCallbackHandler):
    def __init__(self, requests_per_minute: int = 20):
        self.requests_per_minute = requests_per_minute
        self.request_times = []
    
    def on_llm_start(self, *args, **kwargs):
        current_time = time.time()
        # Implementeer rate limiting logic
\`\`\`

## 🚨 Common Setup Issues

### Issue 1: Module Not Found
**Oplossing**: Zorg dat je virtual environment actief is

### Issue 2: API Key Errors
**Oplossing**: Check .env file en spelling van variabelen

### Issue 3: Version Conflicts
**Oplossing**: Gebruik pinned versions in requirements.txt

### Issue 4: Memory/Performance
**Oplossing**: Gebruik streaming en async waar mogelijk

## 📝 requirements.txt Template
\`\`\`txt
# Core
langchain==0.1.0
langchain-openai==0.0.5
langchain-anthropic==0.0.2

# LLM Providers
openai==1.12.0
anthropic==0.18.0

# Vector Stores
chromadb==0.4.22
faiss-cpu==1.7.4

# Document Processing
pypdf==3.17.0
python-docx==1.1.0

# Utilities
python-dotenv==1.0.0
requests==2.31.0
beautifulsoup4==4.12.0

# Development
jupyter==1.0.0
pytest==7.4.0
black==23.12.0
\`\`\`
  `,
  codeExamples: [
    {
      id: 'example-6',
      title: 'Complete Setup Test Script',
      language: 'python',
      code: `#!/usr/bin/env python3
"""
LangChain Setup Verificatie Script
Voer dit uit om te checken of alles correct is geïnstalleerd
"""

import sys
import os
from pathlib import Path

def check_python_version():
    """Check of Python versie compatibel is"""
    version = sys.version_info
    print(f"Python versie: {version.major}.{version.minor}.{version.micro}")
    
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8+ is vereist")
        return False
    print("✅ Python versie OK")
    return True

def check_imports():
    """Test alle belangrijke imports"""
    modules = {
        'langchain': 'Core LangChain',
        'openai': 'OpenAI integration',
        'chromadb': 'ChromaDB vector store',
        'dotenv': 'Environment management',
        'pypdf': 'PDF processing'
    }
    
    all_good = True
    for module, description in modules.items():
        try:
            __import__(module)
            print(f"✅ {description} ({module})")
        except ImportError:
            print(f"❌ {description} ({module}) - Installeer met: pip install {module}")
            all_good = False
    
    return all_good

def check_environment():
    """Check environment variables"""
    from dotenv import load_dotenv
    
    # Probeer .env te laden
    env_path = Path('.env')
    if env_path.exists():
        load_dotenv()
        print("✅ .env file gevonden en geladen")
    else:
        print("⚠️ Geen .env file gevonden")
    
    # Check belangrijke API keys
    api_keys = {
        'OPENAI_API_KEY': 'OpenAI',
        'ANTHROPIC_API_KEY': 'Anthropic (optioneel)',
        'LANGCHAIN_API_KEY': 'LangChain Tracing (optioneel)'
    }
    
    for key, service in api_keys.items():
        if os.getenv(key):
            masked = os.getenv(key)[:10] + '...' if len(os.getenv(key)) > 10 else '***'
            print(f"✅ {service} key gevonden: {masked}")
        else:
            optional = "(optioneel)" in service
            symbol = "ℹ️" if optional else "❌"
            print(f"{symbol} {service} key niet gevonden")

def test_basic_langchain():
    """Test basis LangChain functionaliteit"""
    try:
        from langchain.chat_models import ChatOpenAI
        from langchain.schema import HumanMessage
        
        print("\\n🧪 Test basis LangChain...")
        
        # Test zonder daadwerkelijke API call
        llm = ChatOpenAI(temperature=0)
        print("✅ ChatOpenAI model aangemaakt")
        
        # Test prompt template
        from langchain.prompts import PromptTemplate
        template = PromptTemplate(
            input_variables=["product"],
            template="Wat is een {product}?"
        )
        print("✅ PromptTemplate werkt")
        
        return True
        
    except Exception as e:
        print(f"❌ LangChain test gefaald: {e}")
        return False

def create_project_structure():
    """Optioneel: maak project structuur"""
    directories = [
        'src/chains',
        'src/agents', 
        'src/tools',
        'src/prompts',
        'src/utils',
        'data/documents',
        'data/vectorstores',
        'notebooks',
        'tests'
    ]
    
    print("\\n📁 Project structuur aanmaken...")
    for dir_path in directories:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
        print(f"✅ {dir_path}")
    
    # Maak __init__.py files
    for dir_path in directories:
        if dir_path.startswith('src'):
            init_file = Path(dir_path) / '__init__.py'
            init_file.touch()

if __name__ == "__main__":
    print("🚀 LangChain Setup Verificatie\\n")
    
    # Run alle checks
    python_ok = check_python_version()
    print()
    
    imports_ok = check_imports()
    print()
    
    check_environment()
    
    if python_ok and imports_ok:
        test_basic_langchain()
    
    # Vraag of project structuur aangemaakt moet worden
    print("\\nWil je de aanbevolen project structuur aanmaken? (y/n): ", end="")
    if input().lower() == 'y':
        create_project_structure()
    
    print("\\n✨ Setup verificatie compleet!")`,
      explanation: 'Dit script checkt je volledige setup en helpt met troubleshooting.'
    },
    {
      id: 'example-7',
      title: 'Development Helper Functions',
      language: 'python',
      code: `# langchain_helpers.py - Nuttige development helpers

import os
import json
from typing import Dict, Any
from datetime import datetime
from langchain.callbacks.base import BaseCallbackHandler

class DevelopmentHelper:
    """Helper class voor LangChain development"""
    
    @staticmethod
    def setup_environment(env_file: str = ".env"):
        """Setup environment met error checking"""
        from dotenv import load_dotenv
        
        if not os.path.exists(env_file):
            print(f"⚠️ {env_file} niet gevonden. Maak aan met:")
            print("OPENAI_API_KEY=your-key-here")
            return False
        
        load_dotenv(env_file)
        
        required_keys = ["OPENAI_API_KEY"]
        missing = [k for k in required_keys if not os.getenv(k)]
        
        if missing:
            print(f"❌ Missende keys: {missing}")
            return False
        
        print("✅ Environment geladen")
        return True
    
    @staticmethod
    def cost_tracker(func):
        """Decorator om kosten te tracken"""
        from langchain.callbacks import get_openai_callback
        
        def wrapper(*args, **kwargs):
            with get_openai_callback() as cb:
                result = func(*args, **kwargs)
                print(f"\\n💰 Kosten rapport:")
                print(f"  Tokens: {cb.total_tokens}")
                print(f"  Kosten: \${cb.total_cost:.4f}")
                return result
        return wrapper
    
    @staticmethod
    def create_test_documents(num_docs: int = 5) -> list:
        """Maak test documenten voor development"""
        from langchain.schema import Document
        
        test_content = [
            "LangChain is een framework voor LLM applicaties.",
            "Vector stores slaan embeddings op voor similarity search.",
            "Agents kunnen tools gebruiken om taken uit te voeren.",
            "Memory componenten bewaren conversatie geschiedenis.",
            "Chains verbinden meerdere LLM calls in een workflow."
        ]
        
        docs = []
        for i in range(min(num_docs, len(test_content))):
            docs.append(Document(
                page_content=test_content[i],
                metadata={"source": f"test_doc_{i}", "id": i}
            ))
        
        return docs

class DebugCallbackHandler(BaseCallbackHandler):
    """Custom callback voor debugging"""
    
    def __init__(self, verbose: bool = True):
        self.verbose = verbose
        self.logs = []
    
    def on_llm_start(self, serialized: Dict[str, Any], prompts: list, **kwargs):
        if self.verbose:
            print(f"\\n🚀 LLM Start: {datetime.now()}")
            print(f"📝 Prompt: {prompts[0][:100]}...")
        
        self.logs.append({
            "event": "llm_start",
            "time": datetime.now().isoformat(),
            "prompt_preview": prompts[0][:100]
        })
    
    def on_llm_end(self, response, **kwargs):
        if self.verbose:
            print(f"✅ LLM Complete: {datetime.now()}")
        
        self.logs.append({
            "event": "llm_end",
            "time": datetime.now().isoformat()
        })
    
    def save_logs(self, filepath: str = "debug_logs.json"):
        """Sla logs op voor analyse"""
        with open(filepath, 'w') as f:
            json.dump(self.logs, f, indent=2)
        print(f"📁 Logs opgeslagen in {filepath}")

# Voorbeeld gebruik
if __name__ == "__main__":
    helper = DevelopmentHelper()
    
    # Setup environment
    if helper.setup_environment():
        
        # Test met cost tracking
        @helper.cost_tracker
        def test_langchain_call():
            from langchain.chat_models import ChatOpenAI
            from langchain.schema import HumanMessage
            
            llm = ChatOpenAI()
            response = llm([HumanMessage(content="Say hello")])
            return response
        
        # Run met debugging
        debug_handler = DebugCallbackHandler()
        
        from langchain.chat_models import ChatOpenAI
        llm = ChatOpenAI(callbacks=[debug_handler])
        
        # Test call
        response = llm.predict("What is LangChain?")
        
        # Save debug logs
        debug_handler.save_logs()`,
      explanation: 'Development helpers maken debugging en kosten tracking veel makkelijker.'
    }
  ],
  assignments: [
    {
      id: 'assignment-1-3',
      title: 'Setup Troubleshooting Challenge',
      description: 'Debug common LangChain setup problemen en maak een werkende environment.',
      difficulty: 'medium',
      type: 'code',
      initialCode: `# Setup Troubleshooting Challenge
# Fix alle problemen in deze setup code

import os
import sys

# Probleem 1: Python versie check
def check_python():
    # Deze check is incorrect - fix it!
    if sys.version_info[0] > 2:
        return True
    return False

# Probleem 2: Import error handling
def test_imports():
    required_modules = [
        'langchain',
        'openai',
        'chromadb',
        'dotenv'  # Fout in module naam?
    ]
    
    for module in required_modules:
        try:
            __import__(module)
            print(f"✅ {module}")
        except ImportError:
            # Wat moet hier gebeuren?
            pass

# Probleem 3: Environment setup
def setup_env():
    # Deze code laadt geen .env file
    api_key = os.environ['OPENAI_API_KEY']  # Wat als deze niet bestaat?
    return api_key

# Probleem 4: LangChain initialisatie
def init_langchain():
    from langchain.llms import OpenAI  # Is dit de juiste import?
    
    llm = OpenAI(
        temperature=1.5,  # Is dit een goede temperature?
        max_tokens=-1     # Wat is fout aan deze value?
    )
    return llm

# Probleem 5: Project structure
def create_folders():
    folders = [
        'src',
        'data',
        'src/chains',
        'src\\agents'  # Cross-platform issue?
    ]
    
    for folder in folders:
        os.mkdir(folder)  # Wat als folder al bestaat?

# BONUS: Schrijf een complete setup functie
def complete_setup():
    """
    Schrijf een robuuste setup functie die:
    1. Python versie checkt (3.8+)
    2. Virtual environment detecteert
    3. Alle modules installeert indien nodig
    4. .env file aanmaakt met template
    5. Project structuur opzet
    6. Alles test
    """
    # Jouw implementatie hier
    pass`,
      solution: `# Gefixte versie:

import os
import sys
from pathlib import Path

# Fix 1: Correcte Python versie check
def check_python():
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        return True
    return False

# Fix 2: Proper import error handling
def test_imports():
    required_modules = [
        ('langchain', 'langchain'),
        ('openai', 'openai'),
        ('chromadb', 'chromadb'),
        ('dotenv', 'python-dotenv')  # Correcte pip naam
    ]
    
    missing = []
    for import_name, pip_name in required_modules:
        try:
            __import__(import_name)
            print(f"✅ {import_name}")
        except ImportError:
            print(f"❌ {import_name} - Installeer met: pip install {pip_name}")
            missing.append(pip_name)
    
    return missing

# Fix 3: Veilige environment setup
def setup_env():
    from dotenv import load_dotenv
    
    # Laad .env file als deze bestaat
    if Path('.env').exists():
        load_dotenv()
    
    # Veilig ophalen met fallback
    api_key = os.getenv('OPENAI_API_KEY')
    
    if not api_key:
        print("⚠️ OPENAI_API_KEY niet gevonden")
        return None
    
    return api_key

# Fix 4: Correcte LangChain initialisatie
def init_langchain():
    from langchain.chat_models import ChatOpenAI  # Correcte import
    
    llm = ChatOpenAI(
        temperature=0.7,     # Redelijke default
        max_tokens=None      # None voor ongelimiteerd
    )
    return llm

# Fix 5: Cross-platform folder creation
def create_folders():
    folders = [
        'src',
        'data',
        'src/chains',
        'src/agents'  # Forward slashes werken overal
    ]
    
    for folder in folders:
        Path(folder).mkdir(parents=True, exist_ok=True)

# BONUS: Complete setup functie
def complete_setup():
    print("🚀 Starting LangChain Setup\\n")
    
    # 1. Python versie check
    if not check_python():
        print("❌ Python 3.8+ is vereist")
        return False
    print("✅ Python versie OK\\n")
    
    # 2. Virtual environment check
    if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("✅ Virtual environment actief\\n")
    else:
        print("⚠️ Geen virtual environment gedetecteerd\\n")
    
    # 3. Check modules
    missing = test_imports()
    if missing:
        print(f"\\nInstalleer missende modules met:")
        print(f"pip install {' '.join(missing)}\\n")
    
    # 4. Create .env template
    if not Path('.env').exists():
        with open('.env', 'w') as f:
            f.write("# LangChain Environment Variables\\n")
            f.write("OPENAI_API_KEY=your-key-here\\n")
            f.write("LANGCHAIN_TRACING_V2=true\\n")
        print("✅ .env template aangemaakt\\n")
    
    # 5. Create project structure
    create_folders()
    print("✅ Project folders aangemaakt\\n")
    
    # 6. Test setup
    if setup_env():
        try:
            llm = init_langchain()
            print("✅ LangChain succesvol geïnitialiseerd!")
            return True
        except Exception as e:
            print(f"❌ LangChain init failed: {e}")
    
    return False`,
      hints: [
        'Python 3.8+ check heeft major EN minor versie nodig',
        'Import namen en pip install namen zijn soms verschillend',
        'Gebruik Path() voor cross-platform file operations'
      ]
    }
  ],
  resources: [
    {
      title: 'LangChain Installation Guide',
      url: 'https://python.langchain.com/docs/get_started/installation',
      type: 'documentation'
    },
    {
      title: 'Python Virtual Environments',
      url: 'https://docs.python.org/3/tutorial/venv.html',
      type: 'guide'
    },
    {
      title: 'VS Code Python Setup',
      url: 'https://code.visualstudio.com/docs/python/python-tutorial',
      type: 'tutorial'
    }
  ]
}