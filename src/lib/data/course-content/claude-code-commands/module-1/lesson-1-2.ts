import type { Lesson } from '@/lib/data/courses';

export const lesson1_2: Lesson = {
  id: 'lesson-1-2',
  title: 'Context management en project understanding',
  duration: '35 min',
  content: `
# Context Management en Project Understanding

Claude Code bouwt intelligent context op om je codebase te begrijpen. In deze les leer je hoe je deze context optimaal benut en beheert.

## Hoe Claude Code Context Bouwt

Claude Code gebruikt verschillende strategieën om context op te bouwen:

### 1. Automatische Context Detectie
- **Project root detectie**: Claude herkent automatisch project roots via markers zoals \`.git\`, \`package.json\`, \`pom.xml\`, etc.
- **Taalspecifieke patterns**: Herkent framework-specifieke structuren (React, Vue, Django, Spring)
- **Dependency analysis**: Analyseert import statements en module dependencies

### 2. Incrementele Context Opbouw
Claude bouwt context op in lagen:
1. Direct gevraagde bestanden
2. Gerelateerde bestanden (imports/exports)
3. Configuratiebestanden
4. Test bestanden
5. Documentatie

## File Inclusion Strategieën

### Expliciete File Inclusion
\`\`\`bash
# Include specifieke bestanden in je vraag
"Analyseer src/components/UserAuth.tsx en src/hooks/useAuth.ts"

# Gebruik wildcards voor meerdere bestanden
"Review alle bestanden in src/api/*.ts"
\`\`\`

### Pattern-Based Inclusion
\`\`\`bash
# Include alle React componenten
"Analyseer **/*.tsx bestanden in src/components"

# Include test bestanden
"Review alle *.test.ts en *.spec.ts bestanden"
\`\`\`

### Context Windows Management
- Claude heeft een context window limiet
- Prioriteer relevante bestanden
- Gebruik \`.claudeignore\` voor exclusies

## Project Structure Analysis

### Effectieve Project Analyse Commando's

#### Voor een React/TypeScript Project:
\`\`\`bash
"Analyseer de project structuur, focus op:
1. Component hierarchy in src/components
2. State management setup
3. API integratie patterns
4. Routing configuratie"
\`\`\`

#### Voor een Python/Django Project:
\`\`\`bash
"Geef een overzicht van:
1. App structuur en models
2. URL patterns en views
3. Middleware configuratie
4. Database schema relaties"
\`\`\`

#### Voor een Java/Spring Boot Project:
\`\`\`bash
"Analyseer:
1. Package structuur en architectuur
2. REST endpoints en controllers
3. Service layer implementaties
4. Entity relationships"
\`\`\`

## Werken met Grote Codebases

### Strategie 1: Modulaire Benadering
\`\`\`bash
# Begin met high-level overzicht
"Geef een architectuur overzicht van het project"

# Zoom in op specifieke modules
"Focus nu op de authentication module in detail"

# Analyseer inter-module dependencies
"Hoe communiceert de auth module met de user service?"
\`\`\`

### Strategie 2: Incrementele Exploratie
\`\`\`bash
# Start met entry points
"Begin bij main.ts en volg de belangrijkste execution paths"

# Volg de data flow
"Trace hoe user data van de API naar de UI stroomt"
\`\`\`

### Strategie 3: Problem-Focused Analysis
\`\`\`bash
# Focus op specifieke functionaliteit
"Ik wil de payment processing begrijpen. Welke bestanden zijn relevant?"

# Claude zal automatisch relevante bestanden identificeren
\`\`\`

## Context Optimalisatie

### 1. Gebruik .claudeignore
\`\`\`bash
# .claudeignore voorbeeld
node_modules/
dist/
build/
*.log
coverage/
.env*
*.min.js
*.map
\`\`\`

### 2. Prioriteer Relevante Context
\`\`\`bash
# Goed: Specifiek en gericht
"Analyseer de user authentication flow, focus op:
- src/auth/*.ts
- src/middleware/auth.ts
- src/models/User.ts"

# Minder effectief: Te breed
"Analyseer alle TypeScript bestanden in het project"
\`\`\`

### 3. Context Caching Strategies
- Claude onthoudt eerder geanalyseerde bestanden in de sessie
- Refereer naar eerder besproken concepten
- Bouw voort op bestaande context

### 4. Smart Context Queries
\`\`\`bash
# Gebruik Claude's begrip van je project
"Gezien de architectuur die we besproken hebben, 
hoe kunnen we caching toevoegen aan de API endpoints?"

# Claude gebruikt eerder opgebouwde context
\`\`\`

## Best Practices voor Verschillende Project Types

### Frontend (React/Vue/Angular)
- Begin met component tree analyse
- Focus op state management patterns
- Includeer relevante styling en config files

### Backend (Node/Python/Java)
- Start met API routes/endpoints
- Analyseer data models en database schema
- Include middleware en authentication

### Full-Stack Applicaties
- Behandel frontend en backend als aparte contexten
- Focus op API contracts tussen layers
- Analyseer shared types/interfaces

### Microservices
- Analyseer service boundaries
- Focus op inter-service communicatie
- Include API gateway configuratie

## Pro Tips

1. **Gebruik Claude's Memory**: Refereer naar eerder besproken concepten
2. **Iteratieve Verfijning**: Start breed, zoom in op details
3. **Context Boundaries**: Weet wanneer je context moet resetten
4. **Performance**: Grote bestanden kunnen de response vertragen
5. **Collaborative Context**: Deel context tussen team members via gestructureerde vragen
  `,
  codeExamples: [
    {
      id: 'context-example-1',
      title: 'Effectieve Context Opbouw voor React Project',
      language: 'bash',
      code: `# Stap 1: Project overzicht
"Geef een overzicht van de React app structuur in src/"

# Stap 2: Component analyse
"Analyseer de component hierarchie starting vanaf App.tsx,
includeer belangrijke hooks en context providers"

# Stap 3: State management focus
"Focus op Redux setup:
- src/store/
- src/slices/
- src/hooks/redux.ts"

# Stap 4: API integratie
"Hoe worden API calls gemaakt? Analyseer:
- src/services/api.ts
- src/hooks/useApi.ts
- relevante .env configuratie"`,
      explanation: 'Deze aanpak bouwt systematisch context op, van algemeen naar specifiek. Claude begrijpt de relaties tussen componenten en kan effectiever helpen.'
    },
    {
      id: 'context-example-2',
      title: 'Context Management voor Node.js Backend',
      language: 'javascript',
      code: `// Vraag 1: Architectuur overzicht
"Analyseer de Express app structuur:
- server.js of app.js entry point
- Routes organizatie
- Middleware stack
- Database connectie setup"

// Vraag 2: API Endpoints mapping
"Maak een overzicht van alle API endpoints:
- Method (GET/POST/etc)
- Route path
- Controller functie
- Required middleware"

// Vraag 3: Business logic deep dive
"Focus op de order processing logic:
- src/services/orderService.js
- src/models/Order.js
- src/controllers/orderController.js
- Relevante validation en middleware"`,
      explanation: 'Voor backend projecten is het belangrijk om de request flow te begrijpen. Deze vragen helpen Claude de volledige context op te bouwen.'
    },
    {
      id: 'context-example-3',
      title: 'Working with Large Monorepo',
      language: 'bash',
      code: `# Monorepo root analyse
"Analyseer de monorepo structuur:
- Workspace configuratie (package.json, lerna.json, nx.json)
- Package structuur in packages/
- Shared dependencies en configs"

# Focus op specifieke package
"Focus op packages/web-app/:
- Belangrijkste dependencies van andere packages
- Build configuratie
- Environment setup"

# Cross-package dependencies
"Hoe gebruikt packages/web-app/ de packages/shared-ui/ componenten?
Includeer relevante imports en exports"

# Build pipeline understanding
"Verklaar de build pipeline voor packages/web-app/,
inclusief dependencies van andere packages"`,
      explanation: 'Bij monorepos is het cruciaal om de package boundaries en dependencies te begrijpen. Start breed en zoom in op specifieke packages.'
    },
    {
      id: 'context-example-4',
      title: 'Smart .claudeignore Configuration',
      language: 'bash',
      code: `# .claudeignore voor optimale context

# Dependencies en build output
node_modules/
dist/
build/
.next/
out/

# Test coverage en reports
coverage/
.nyc_output/
test-results/

# Logs en temp files
*.log
*.tmp
.DS_Store

# Environment en secrets
.env*
!.env.example
secrets/

# Large generated files
*.min.js
*.min.css
*.map
package-lock.json
yarn.lock

# Media files (meestal niet relevant voor code analyse)
*.png
*.jpg
*.gif
*.mp4
*.pdf

# IDE specifieke files
.idea/
.vscode/settings.json
*.swp

# Database files
*.sqlite
*.db

# Backup files
*.backup
*.bak
*~`,
      explanation: 'Een goed geconfigureerde .claudeignore file voorkomt dat irrelevante bestanden context vervuilen en maakt analyse sneller en effectiever.'
    }
  ],
  assignments: [
    {
      id: 'assignment-1-2-1',
      title: 'Analyseer een Open Source Project',
      description: 'Kies een middelgroot open source project (bijv. React Router, Axios, of Express) en gebruik Claude Code om de architectuur te analyseren.',
      difficulty: 'medium',
      type: 'project',
      initialCode: `# Opdracht: Open Source Project Analyse

## Stap 1: Kies een project
# Suggesties:
# - https://github.com/remix-run/react-router
# - https://github.com/axios/axios  
# - https://github.com/expressjs/express

## Stap 2: Clone het project
git clone [GEKOZEN_PROJECT_URL]
cd [PROJECT_NAAM]

## Stap 3: Gebruik Claude Code voor analyse
# Vraag 1: "Geef een architectuur overzicht van dit project"
# Vraag 2: "Wat zijn de belangrijkste modules en hun verantwoordelijkheden?"
# Vraag 3: "Hoe is de test structuur opgezet?"
# Vraag 4: "Identificeer de core abstractions en design patterns"

## Stap 4: Documenteer je bevindingen
# Maak een markdown file met:
# - Project structuur diagram
# - Belangrijkste componenten/modules
# - Data flow
# - Interessante design decisions`,
      hints: [
        'Begin met het lezen van README.md en CONTRIBUTING.md voor project context',
        'Kijk naar de folder structuur in src/ of lib/ voor een eerste indruk',
        'Identificeer entry points (meestal index.js of main.js)',
        'Let op configuratie bestanden die hints geven over de architectuur',
        'Gebruik Claude om design patterns te identificeren'
      ]
    },
    {
      id: 'assignment-1-2-2',
      title: 'Optimaliseer Context voor je Eigen Project',
      description: 'Neem een van je eigen projecten en optimaliseer de context setup voor Claude Code.',
      difficulty: 'easy',
      type: 'code',
      initialCode: `# Context Optimalisatie Opdracht

## 1. Creëer een .claudeignore file
# Maak een .claudeignore file in je project root
# Include alle irrelevante bestanden en folders

## 2. Test verschillende context strategies
# Probeer deze verschillende benaderingen:

# A. Breed naar specifiek
"Geef een overzicht van de hele applicatie architectuur"
"Focus nu op de [SPECIFIEK_DEEL] module"

# B. Follow the data
"Hoe stroomt data van gebruikers input naar de database?"

# C. Feature focused
"Verklaar hoe [SPECIFIEKE_FEATURE] werkt, van UI tot database"

## 3. Vergelijk de resultaten
# Welke aanpak gaf de beste resultaten?
# Hoeveel context was nodig voor accurate antwoorden?

## 4. Documenteer best practices voor jouw project type`,
      solution: `# Voorbeeld oplossing voor een React/Node full-stack app

## .claudeignore
\`\`\`
node_modules/
build/
dist/
coverage/
.env*
*.log
.DS_Store
public/assets/images/
public/assets/videos/
*.test.js.snap
\`\`\`

## Optimale context strategy:
1. Start met package.json voor dependencies overzicht
2. Analyseer src/App.js en server/index.js als entry points  
3. Include relevante config files (.env.example, webpack.config.js)
4. Focus op feature-specific files bij detailed vragen

## Gevonden best practices:
- Groepeer gerelateerde files in je vragen
- Refereer naar eerder geanalyseerde concepten
- Gebruik folder wildcards voor component groepen
- Exclude test files tenzij specifiek nodig`,
      hints: [
        'Test hoeveel files Claude kan analyseren voordat responses trager worden',
        'Experimenteer met verschillende .claudeignore patterns',
        'Probeer dezelfde vraag met verschillende context hoeveelheden'
      ]
    },
    {
      id: 'assignment-1-2-3',
      title: 'Cross-Technology Context Challenge',
      description: 'Analyseer een project dat meerdere technologieën combineert (bijv. React frontend + Python backend) en optimaliseer de context strategie.',
      difficulty: 'hard',
      type: 'project',
      initialCode: `# Multi-Technology Context Challenge

## Doel: Optimaliseer context voor een multi-tech stack project

## Optie 1: Gebruik een bestaand full-stack project
# Bijvoorbeeld:
# - MERN stack (MongoDB, Express, React, Node)
# - Django + React
# - Spring Boot + Angular
# - FastAPI + Vue

## Optie 2: Analyseer een open source voorbeeld
# - https://github.com/gothinkster/realworld (multiple implementations)

## Taken:

### 1. Identificeer technology boundaries
# - Waar eindigt frontend en begint backend?
# - Welke files zijn shared (types, constants)?
# - Hoe communiceren de verschillende delen?

### 2. Ontwikkel context strategieën per technology
# Frontend context:
"Analyseer de React componenten structuur en state management"

# Backend context:  
"Focus op de API endpoints en database models"

# Integration context:
"Hoe worden API calls vanuit frontend naar backend gemaakt?"

### 3. Test cross-technology vragen
"Trace een user login vanaf UI form tot database opslag"
"Hoe wordt data validatie gedeeld tussen frontend en backend?"

### 4. Creëer een context management guide
# Documenteer:
# - Wanneer include je beide technologieën?
# - Wanneer focus je op één technology?
# - Hoe manage je de context window limiet?`,
      hints: [
        'Behandel elke technology stack als een aparte context zone',
        'Focus op de integration points tussen technologies',
        'Shared types/interfaces zijn cruciaal voor begrip',
        'API contracts zijn de belangrijkste link tussen frontend en backend',
        'Test of Claude beide contexts tegelijk kan vasthouden'
      ]
    }
  ],
  resources: [
    {
      title: 'Claude Code Context Best Practices',
      url: 'https://docs.anthropic.com/claude/docs/context-management',
      type: 'documentation'
    },
    {
      title: 'Working with Large Codebases',
      url: 'https://www.anthropic.com/claude-code/large-codebases',
      type: 'guide'
    },
    {
      title: 'Project Structure Patterns',
      url: 'https://github.com/anthropics/claude-code-examples',
      type: 'examples'
    }
  ]
};