import type { Lesson } from '@/lib/data/courses';

export const lesson3_2: Lesson = {
  id: 'lesson-3-2',
  title: 'Werken met lange contexten',
  duration: '40 min',
  content: `
# Werken met lange contexten in Claude

Claude's vermogen om tot 200.000 tokens (ongeveer 150.000 woorden) te verwerken opent unieke mogelijkheden voor het werken met grote documenten, complexe codebases en uitgebreide conversaties. In deze les leer je hoe je deze capaciteit effectief kunt benutten.

## Organizing 200K token contexts

### Het token budget begrijpen
- **1 token ≈ 0.75 woorden** (Engels)
- **1 token ≈ 0.6 woorden** (Nederlands)
- **200K tokens ≈ 500 pagina's tekst**
- Code telt vaak meer tokens per regel vanwege syntax

### Structurering van grote contexten

\`\`\`markdown
## CONTEXT STRUCTUUR VOORBEELD

### 1. METADATA EN OVERZICHT (1-2K tokens)
- Document titel en versie
- Inhoudsopgave met sectiemarkeringen
- Kernpunten samenvatting

### 2. REFERENTIE DOCUMENTEN (50-100K tokens)
- Technische specificaties
- API documentatie
- Bedrijfsrichtlijnen

### 3. WERKDOCUMENTEN (30-50K tokens)
- Actieve code bestanden
- Recente wijzigingen
- Test resultaten

### 4. HISTORISCHE CONTEXT (20-30K tokens)
- Eerdere conversaties
- Besluitvorming geschiedenis
- Probleemoplossing logs
\`\`\`

## Document structure strategies

### 1. Hiërarchische organisatie
Gebruik duidelijke hiërarchie voor navigatie:

\`\`\`markdown
# HOOFDDOCUMENT: Project Architectuur

## SECTIE A: Frontend Architectuur
### A.1 Component Structuur
#### A.1.1 Atomic Design Principes
[Content...]

### A.2 State Management
#### A.2.1 Redux Store Design
[Content...]

## SECTIE B: Backend Architectuur
### B.1 API Design
#### B.1.1 RESTful Endpoints
[Content...]
\`\`\`

### 2. Modulaire aanpak
Verdeel grote documenten in logische modules:

\`\`\`python
"""
MODULE: UserAuthentication
VERSIE: 2.1.0
DEPENDENCIES: jwt, bcrypt, database

OVERZICHT:
Dit module behandelt alle gebruikersauthenticatie functionaliteit
inclusief login, registratie, wachtwoord reset en sessie management.
"""

# === IMPORTS ===
import jwt
import bcrypt
from database import User, Session

# === CONFIGURATIE ===
JWT_SECRET = "..."
TOKEN_EXPIRY = 3600

# === HOOFDFUNCTIES ===
def authenticate_user(email, password):
    """
    Authenticeer gebruiker met email en wachtwoord.
    
    Args:
        email (str): Gebruiker's email
        password (str): Plain text wachtwoord
    
    Returns:
        dict: User object met JWT token of None
    """
    # Implementatie...
\`\`\`

### 3. Cross-referentie systeem
Maak verbindingen tussen documenten expliciet:

\`\`\`markdown
## Database Schema Ontwerp

Zie ook:
- [API Endpoints Specificatie](#sectie-b1)
- [Frontend Data Models](#sectie-a3)
- [Security Overwegingen](#sectie-c2)

### User Table
REF: UserAuthentication.py:15-45
\`\`\`

## Reference systems

### 1. Unieke identificatiesysteem
Gebruik consistent ID systeem voor verwijzingen:

\`\`\`markdown
[DOC-001] Hoofdarchitectuur Document
[DOC-002] API Specificatie
[DOC-003] Database Ontwerp

In [DOC-001] sectie 3.2 wordt verwezen naar de API design
principes die in detail beschreven zijn in [DOC-002].
\`\`\`

### 2. Semantische ankers
Creëer betekenisvolle ankers voor snelle navigatie:

\`\`\`markdown
<!-- ANKER: auth-flow-diagram -->
## Authenticatie Flow Diagram

<!-- ANKER: security-considerations -->
## Security Overwegingen

Later in document:
Zoals beschreven in [auth-flow-diagram](#auth-flow-diagram),
moet rekening gehouden worden met [security](#security-considerations).
\`\`\`

### 3. Index en glossary
Voeg navigatiehulpmiddelen toe:

\`\`\`markdown
## INDEX
- Authenticatie: p. 12, 45, 78
- Database queries: p. 23, 56
- Error handling: p. 34, 67, 89

## GLOSSARY
- **JWT**: JSON Web Token, gebruikt voor stateless authenticatie
- **ORM**: Object-Relational Mapping, abstractielaag voor database
- **API Gateway**: Centraal punt voor API request routing
\`\`\`

## Context window management

### 1. Progressive disclosure strategie
Begin met overzicht, voeg details toe indien nodig:

\`\`\`python
# NIVEAU 1: Overzicht
"""
SystemArchitecture/
├── Frontend/ (React + TypeScript)
├── Backend/ (Python + FastAPI)
├── Database/ (PostgreSQL)
└── Infrastructure/ (Docker + K8s)
"""

# NIVEAU 2: Gedetailleerd (voeg toe bij vragen)
"""
Frontend/
├── src/
│   ├── components/
│   │   ├── atoms/
│   │   ├── molecules/
│   │   └── organisms/
│   ├── pages/
│   ├── hooks/
│   └── utils/
"""
\`\`\`

### 2. Context prioritering
Plaats belangrijkste informatie eerst:

\`\`\`markdown
## PRIORITEIT 1: Kritieke informatie
- Huidige bugs in productie
- Deadline: 15 december
- Blocking issues

## PRIORITEIT 2: Actieve taken
- Feature X implementatie
- Code review voor PR #123

## PRIORITEIT 3: Achtergrond informatie
- Historische beslissingen
- Toekomstige plannen
\`\`\`

### 3. Sliding window techniek
Behoud relevante geschiedenis, verwijder verouderde info:

\`\`\`python
class ContextManager:
    def __init__(self, max_tokens=180000):
        self.max_tokens = max_tokens
        self.context_window = []
        
    def add_content(self, content, priority):
        """Voeg content toe met prioriteit"""
        self.context_window.append({
            'content': content,
            'priority': priority,
            'timestamp': datetime.now()
        })
        self._optimize_window()
        
    def _optimize_window(self):
        """Verwijder lage prioriteit items als nodig"""
        while self._count_tokens() > self.max_tokens:
            # Verwijder oudste, laagste prioriteit item
            self._remove_lowest_priority()
\`\`\`

## Memory techniques

### 1. Checkpoint systeem
Creëer restore points in lange conversaties:

\`\`\`markdown
=== CHECKPOINT 1: Project Setup Compleet ===
Datum: 2024-01-15
Status:
- ✓ Repository geïnitialiseerd
- ✓ Dependencies geïnstalleerd
- ✓ Basis structuur opgezet

Volgende stappen:
- Implementeer user authentication
- Setup database schema
===
\`\`\`

### 2. Beslissingen log
Documenteer belangrijke keuzes:

\`\`\`markdown
## BESLISSINGEN LOG

### 2024-01-10: Database keuze
**Beslissing**: PostgreSQL over MySQL
**Reden**: Better JSON support, advanced indexing
**Alternatieven overwogen**: MySQL, MongoDB
**Impact**: Vereist PostgreSQL-specifieke features

### 2024-01-12: Frontend framework
**Beslissing**: React met TypeScript
**Reden**: Type safety, team expertise
**Alternatieven**: Vue.js, Angular
\`\`\`

### 3. Context compressie
Vat periodiek samen voor efficiëntie:

\`\`\`python
def compress_context(full_context):
    """
    Comprimeer context door samenvattingen te maken
    """
    compressed = {
        'summary': generate_summary(full_context),
        'key_decisions': extract_decisions(full_context),
        'open_issues': extract_open_issues(full_context),
        'code_snippets': extract_important_code(full_context)
    }
    return compressed

# Voorbeeld output:
"""
GECOMPRIMEERDE CONTEXT:
- Ontwikkelen e-commerce platform
- Stack: React/FastAPI/PostgreSQL
- 15 endpoints geïmplementeerd
- 3 open bugs (zie BUGS sectie)
- Huidige focus: payment integratie
"""
\`\`\`

## Praktijkvoorbeeld: Grote codebase analyse

### Voorbeeld prompt voor 100K+ tokens project:

\`\`\`markdown
Ik ga je een grote codebase geven voor analyse. De structuur is als volgt:

## PROJECT METADATA
- Naam: E-commerce Platform
- Talen: Python, TypeScript, SQL
- Frameworks: FastAPI, React, PostgreSQL

## DOCUMENT STRUCTUUR
1. [ARCH-001] Systeem Architectuur (5K tokens)
2. [CODE-001] Backend Source Code (40K tokens)
3. [CODE-002] Frontend Source Code (35K tokens)
4. [TEST-001] Test Suite (15K tokens)
5. [DOCS-001] API Documentatie (20K tokens)

## ANALYSE OPDRACHT
Analyseer de codebase voor:
1. Security vulnerabilities
2. Performance bottlenecks
3. Code quality issues
4. Architectural improvements

Begin met [ARCH-001] voor overzicht, gebruik dan CODE secties voor detail analyse.

---
[ARCH-001] SYSTEEM ARCHITECTUUR
[Content...]

[CODE-001] BACKEND SOURCE CODE
[Content...]

[Etc...]
\`\`\`

### Best practices voor grote documenten:

1. **Start met een manifest**: Lijst alle documenten met ID's en omvang
2. **Gebruik consistent formatting**: Maakt parsing makkelijker
3. **Voeg navigatie hints toe**: Help Claude efficiënt door content navigeren
4. **Prioriteer relevantie**: Plaats belangrijkste info vooraan
5. **Test incrementeel**: Begin klein, voeg geleidelijk meer context toe

## Oefening: Context optimalisatie

Probeer deze technieken uit:

1. Neem een groot document (>50 pagina's)
2. Structureer het volgens bovenstaande principes
3. Test verschillende organisaties
4. Meet response kwaliteit en snelheid
5. Optimaliseer op basis van resultaten

Door deze technieken te beheersen, kun je Claude's volledige 200K token capaciteit effectief benutten voor complexe, grootschalige projecten.
  `,
};