import type { Lesson } from '@/lib/data/courses';

export const lesson1_1: Lesson = {
  id: 'lesson-1-1',
  title: 'Introductie tot Claude Code',
  duration: '30 min',
  content: `
# Introductie tot Claude Code

Claude Code is Anthropic's officiële CLI tool die AI-powered development naar een hoger niveau tilt. Het transformeert je ontwikkelworkflow door Claude's krachtige AI-capaciteiten direct in je terminal te integreren.

## Wat is Claude Code?

Claude Code is een command-line interface (CLI) die:
- **Direct communiceert** met Claude AI voor code-gerelateerde taken
- **Context-aware** is en begrijpt je volledige project structuur
- **Multi-file operaties** ondersteunt voor complexe refactoring
- **Geïntegreerd** werkt met je bestaande development tools

### Hoe werkt het?

Claude Code werkt als een intelligente assistent die:
1. Je natuurlijke taal instructies begrijpt
2. Je codebase analyseert en context behoudt
3. Code genereert, wijzigt en optimaliseert
4. Best practices en patterns toepast

## Installatie en Setup

### Systeemvereisten
- **OS**: macOS, Linux, Windows (met WSL)
- **Node.js**: versie 18.0 of hoger
- **RAM**: minimaal 8GB aanbevolen
- **Disk**: 500MB vrije ruimte

### Installatie stappen

#### 1. Download Claude Code
\`\`\`bash
# Via npm (aanbevolen)
npm install -g claude-code

# Of via Homebrew (macOS)
brew install anthropic/tap/claude-code

# Of via curl (Linux/macOS)
curl -fsSL https://claude.ai/install.sh | bash
\`\`\`

#### 2. Authenticatie setup
\`\`\`bash
# Configureer je API key
claude auth login

# Verifieer de installatie
claude --version

# Test de verbinding
claude ping
\`\`\`

#### 3. Eerste configuratie
\`\`\`bash
# Initialiseer Claude Code in je project
claude init

# Configureer project preferences
claude config set editor vscode
claude config set language nl
claude config set model claude-3-opus
\`\`\`

## Interface Overview

### Terminal Interface
Claude Code werkt volledig vanuit de terminal met een intuïtieve command structuur:

\`\`\`
claude [command] [options] [arguments]
\`\`\`

### Belangrijkste componenten:
1. **Command Prompt**: Waar je instructies geeft
2. **Context Indicator**: Toont huidige project/file context
3. **Response Area**: Claude's antwoorden en code suggesties
4. **Status Bar**: Toont model, tokens gebruikt, en status

### Interface modes:
- **Interactive Mode**: Voor conversaties en iteratieve development
- **Command Mode**: Voor directe opdrachten
- **Watch Mode**: Voor real-time file monitoring

## Basis Commands

### Essentiële commando's om te kennen:

#### 1. Help en documentatie
\`\`\`bash
# Algemene help
claude help

# Command-specifieke help
claude help [command]

# Lijst alle beschikbare commands
claude commands
\`\`\`

#### 2. Project commands
\`\`\`bash
# Analyseer huidige project
claude analyze

# Toon project structuur
claude tree

# Zoek in codebase
claude search "function naam"
\`\`\`

#### 3. Code generatie
\`\`\`bash
# Genereer code vanuit beschrijving
claude generate "Maak een REST API endpoint voor user authentication"

# Genereer tests
claude test "UserService" --framework jest

# Genereer documentatie
claude docs --format markdown
\`\`\`

#### 4. Code modificatie
\`\`\`bash
# Refactor code
claude refactor "Verbeter performance van deze functie"

# Fix bugs
claude fix "TypeError in lijn 42"

# Optimaliseer code
claude optimize --target performance
\`\`\`

## Keyboard Shortcuts

### Globale shortcuts (in interactive mode):
- **Ctrl+C**: Stop huidige operatie
- **Ctrl+D**: Exit Claude Code
- **Ctrl+L**: Clear scherm
- **Tab**: Auto-complete commands
- **↑/↓**: Navigeer door command history

### Editor shortcuts (tijdens code review):
- **Ctrl+A**: Accepteer alle suggesties
- **Ctrl+R**: Reject huidige suggestie
- **Ctrl+N**: Volgende suggestie
- **Ctrl+P**: Vorige suggestie
- **Ctrl+E**: Edit suggestie

### Special mode shortcuts:
- **Ctrl+W**: Toggle watch mode
- **Ctrl+I**: Toggle interactive mode
- **Ctrl+S**: Save huidige sessie
- **Ctrl+O**: Open saved sessie

## Eerste Project Setup

### Stap-voor-stap guide voor je eerste Claude Code project:

#### 1. Maak een nieuw project
\`\`\`bash
# Maak project directory
mkdir mijn-eerste-claude-project
cd mijn-eerste-claude-project

# Initialiseer Claude Code
claude init --template node-typescript
\`\`\`

#### 2. Configureer project settings
\`\`\`bash
# Stel project taal in
claude config set project.language "TypeScript"

# Configureer code style
claude config set style.indent 2
claude config set style.quotes "single"

# Set test framework
claude config set test.framework "jest"
\`\`\`

#### 3. Genereer basis structuur
\`\`\`bash
# Genereer project structuur
claude scaffold mvc --typescript

# Dit creëert:
# - src/
#   - controllers/
#   - models/
#   - views/
# - tests/
# - config/
# - package.json
# - tsconfig.json
\`\`\`

#### 4. Eerste development cycle
\`\`\`bash
# Start interactive development
claude dev

# In interactive mode:
> create a user model with name, email, and password fields
> add validation for email format
> create CRUD operations for the user model
> generate unit tests
\`\`\`

## Best Practices

### Do's:
- ✅ Geef duidelijke, specifieke instructies
- ✅ Gebruik context om betere resultaten te krijgen
- ✅ Review gegenereerde code altijd
- ✅ Maak gebruik van incremental development
- ✅ Sla belangrijke sessies op voor later

### Don'ts:
- ❌ Vertrouw blind op gegenereerde code
- ❌ Negeer security warnings
- ❌ Skip code reviews
- ❌ Gebruik voor gevoelige data zonder encryptie

## Praktisch voorbeeld: Todo App

Laten we een complete todo app maken met Claude Code:

\`\`\`bash
# 1. Setup project
claude init todo-app --template express-typescript

# 2. Navigeer naar project
cd todo-app

# 3. Start development sessie
claude dev --context "Building a REST API for a todo application"

# 4. Genereer de basis componenten
> create a todo model with id, title, description, completed, and timestamps
> create REST endpoints for CRUD operations
> add input validation using express-validator
> implement error handling middleware
> generate integration tests for all endpoints

# 5. Review en test
claude test run
claude lint --fix
\`\`\`

## Troubleshooting Tips

### Veelvoorkomende problemen:

1. **Connection issues**
   \`\`\`bash
   # Check API key
   claude auth status
   
   # Test connection
   claude ping --verbose
   \`\`\`

2. **Performance issues**
   \`\`\`bash
   # Clear cache
   claude cache clear
   
   # Optimize context
   claude context prune
   \`\`\`

3. **Unexpected output**
   \`\`\`bash
   # Reset session
   claude session reset
   
   # Check model settings
   claude config get model
   \`\`\`
  `,
  codeExamples: [
    {
      id: 'example-1',
      title: 'Eerste Claude Code sessie',
      language: 'bash',
      code: `# Start een nieuwe Claude Code sessie
$ claude dev

# Claude Code v1.5.0
# Project: my-awesome-app
# Context: 5 files loaded

> Help me create a user authentication system

Claude: I'll help you create a user authentication system. Let me break this down:

1. First, I'll create the user model
2. Then implement authentication endpoints
3. Add JWT token handling
4. Create middleware for protected routes

Let's start:

[Creating: src/models/User.ts]
[Creating: src/controllers/AuthController.ts]
[Creating: src/middleware/auth.ts]
[Creating: src/routes/auth.ts]

Would you like me to proceed with the implementation?`,
      explanation: 'Dit toont een typische Claude Code sessie waar je natuurlijke taal gebruikt om complexe features te bouwen. Claude begrijpt de context en maakt meerdere gerelateerde files.'
    },
    {
      id: 'example-2',
      title: 'Multi-file refactoring',
      language: 'bash',
      code: `# Refactor een complete module
$ claude refactor "Convert callbacks to async/await in all database operations"

Analyzing codebase...
Found 12 files with callback patterns in database operations

Files to refactor:
- src/models/User.js (8 callbacks)
- src/models/Product.js (6 callbacks)
- src/services/OrderService.js (4 callbacks)
- ... 9 more files

Refactoring strategy:
1. Convert callback functions to async/await
2. Update error handling to try/catch blocks
3. Maintain backward compatibility
4. Update tests accordingly

Proceed with refactoring? [Y/n]`,
      explanation: 'Claude Code kan complexe refactoring taken uitvoeren over meerdere files tegelijk, waarbij het de impact analyseert en een strategie voorstelt.'
    },
    {
      id: 'example-3',
      title: 'Intelligente code generatie met context',
      language: 'typescript',
      code: `// Command: claude generate "Add rate limiting to our API"

// Claude analyseert je bestaande code en genereert:

// src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../config/redis';

export const createRateLimiter = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
}) => {
  return rateLimit({
    store: new RedisStore({
      client: redis,
      prefix: 'rate-limit:',
    }),
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || 100,
    message: options.message || 'Too many requests',
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Specific limiters voor verschillende endpoints
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts',
});

export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
});`,
      explanation: 'Claude Code begrijpt je project structuur en technologie stack. Het genereert code die perfect integreert met je bestaande patterns en dependencies.'
    }
  ],
  assignments: [
    {
      id: 'assignment-1-1-1',
      title: 'Installeer en configureer Claude Code',
      description: 'Installeer Claude Code op je systeem en configureer het voor je eerste project.',
      difficulty: 'easy',
      type: 'project',
      initialCode: `# Opdracht: Installeer Claude Code en verifieer de setup

# Stap 1: Installeer Claude Code
# Kies een van de volgende methodes:
# - npm install -g claude-code
# - brew install anthropic/tap/claude-code

# Stap 2: Verifieer installatie
# Voer dit commando uit en noteer de versie:
claude --version

# Stap 3: Authenticatie
# Login met je API key:
claude auth login

# Stap 4: Test de verbinding
# Voer uit en check of je "Connected" ziet:
claude ping
`,
      hints: [
        'Zorg dat je Node.js 18+ hebt geïnstalleerd voordat je begint',
        'Je kunt je API key vinden in je Claude dashboard onder Settings > API Keys',
        'Als claude ping faalt, check je internetverbinding en firewall settings'
      ]
    },
    {
      id: 'assignment-1-1-2',
      title: 'Je eerste Claude Code project',
      description: 'Gebruik Claude Code om een simpele Node.js applicatie te genereren.',
      difficulty: 'easy',
      type: 'project',
      initialCode: `# Opdracht: Genereer een "Hello World" API met Claude Code

# 1. Maak een nieuwe directory voor je project
mkdir hello-claude
cd hello-claude

# 2. Initialiseer Claude Code
claude init

# 3. Gebruik Claude om een simpele Express API te maken
# Geef het volgende commando:
# claude generate "Create a simple Express API with a hello world endpoint"

# 4. Test je API
# Start de server en test of http://localhost:3000 werkt
`,
      hints: [
        'Gebruik `claude init --list-templates` om alle beschikbare templates te zien',
        'Als je geen template specificeert, vraagt Claude je om er een te kiezen',
        'Gebruik `claude dev` voor interactive mode waar je natuurlijke taal kunt gebruiken'
      ]
    }
  ],
  resources: [
    {
      title: 'Claude Code Official Documentation',
      url: 'https://docs.anthropic.com/claude-code',
      type: 'documentation'
    },
    {
      title: 'Claude Code GitHub Repository',
      url: 'https://github.com/anthropics/claude-code',
      type: 'code'
    },
    {
      title: 'Claude Code Cheat Sheet',
      url: 'https://claude.ai/code/cheatsheet',
      type: 'guide'
    }
  ]
};