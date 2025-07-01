import type { Lesson } from '@/lib/data/courses';

export const lesson2_1: Lesson = {
  id: 'lesson-2-1',
  title: 'Intelligente codebase navigatie',
  duration: '35 min',
  content: `
# Intelligente Codebase Navigatie

Claude Code transformeert de manier waarop je door complexe codebases navigeert. Met intelligente AI-powered tools kun je snel inzicht krijgen in projectstructuren, dependencies, en code relaties.

## Smart File Exploration

Claude Code's intelligente file exploration gaat verder dan simpele file browsing. Het begrijpt de context en structuur van je project.

### Contextual File Discovery

**Find gerelateerde files:**
\`\`\`bash
# Vind alle files gerelateerd aan een specifieke functionaliteit
claude find "authentication" --context

# Output toont:
# - Source files met auth logic
# - Test files voor auth
# - Config files met auth settings
# - Documentation over auth
\`\`\`

### Intelligent Pattern Matching

\`\`\`bash
# Vind files op basis van hun rol in de architectuur
claude explore --type "controller" --framework "express"

# Vind alle React componenten met hooks
claude find --pattern "use*.jsx?" --type "component"

# Analyseer file structuur patronen
claude analyze structure --suggest-improvements
\`\`\`

### Project Topology Understanding

\`\`\`bash
# Genereer een overzicht van de project structuur
claude map project --depth 3

# Output:
# src/
# ├── components/     [47 files] - React UI componenten
# ├── services/       [12 files] - Business logic & API calls
# ├── utils/          [23 files] - Helper functies
# └── hooks/          [15 files] - Custom React hooks
\`\`\`

## Dependency Mapping

Begrijp hoe verschillende delen van je codebase met elkaar verbonden zijn.

### Import/Export Analysis

\`\`\`bash
# Analyseer dependencies van een specifiek bestand
claude deps analyze src/components/UserProfile.tsx

# Output:
# Direct dependencies:
# - ./UserAvatar (component)
# - ../hooks/useUser (custom hook)
# - ../services/api/user (API service)
# - react (external)
# - @mui/material (external)
# 
# Used by:
# - src/pages/Profile.tsx
# - src/pages/Dashboard.tsx
# - src/components/Header.tsx
\`\`\`

### Circular Dependency Detection

\`\`\`bash
# Detecteer circular dependencies in je project
claude deps check --circular

# Output:
# ⚠️  Circular dependency detected:
# src/services/auth.ts → src/utils/token.ts → src/services/auth.ts
#
# Suggested fix:
# Extract shared logic to src/utils/auth-helpers.ts
\`\`\`

### Dependency Visualization

\`\`\`bash
# Genereer een dependency graph
claude deps visualize src/App.tsx --format mermaid

# Genereer interactieve HTML visualisatie
claude deps visualize --interactive --output deps.html
\`\`\`

## Call Hierarchy Analysis

Volg function calls door je hele codebase heen.

### Function Call Tracking

\`\`\`bash
# Vind alle plekken waar een functie wordt aangeroepen
claude calls find "validateUser"

# Output:
# Function 'validateUser' called in:
# 1. src/api/auth.ts:45        - in login()
# 2. src/api/auth.ts:78        - in register()
# 3. src/middleware/auth.ts:23 - in authenticateRequest()
# 4. src/tests/auth.test.ts:12 - in test suite
\`\`\`

### Call Stack Analysis

\`\`\`bash
# Analyseer de volledige call stack voor een functie
claude calls trace "processPayment" --depth 5

# Output:
# processPayment()
# ├── validatePaymentData()
# │   ├── checkCardNumber()
# │   └── verifyCVV()
# ├── calculateTotal()
# │   ├── getCartItems()
# │   ├── applyDiscounts()
# │   └── addTaxes()
# └── chargeCard()
#     ├── connectToPaymentGateway()
#     └── logTransaction()
\`\`\`

### Impact Analysis

\`\`\`bash
# Analyseer de impact van het wijzigen van een functie
claude impact analyze "updateUserProfile"

# Output:
# Changing 'updateUserProfile' will affect:
# - 3 API endpoints
# - 5 UI components
# - 2 test suites
# - 1 background job
#
# Risk assessment: MEDIUM
# Recommended: Update tests first, then implementation
\`\`\`

## Symbol Navigation

Navigate intelligently naar classes, functions, en variabelen.

### Smart Symbol Search

\`\`\`bash
# Zoek symbolen met context-aware matching
claude symbols find "User" --smart

# Output:
# Classes:
# - UserModel (src/models/User.ts)
# - UserController (src/controllers/UserController.ts)
# - UserService (src/services/UserService.ts)
#
# Interfaces:
# - IUser (src/types/user.ts)
# - IUserResponse (src/types/api.ts)
#
# Functions:
# - createUser() (src/services/UserService.ts:23)
# - updateUser() (src/services/UserService.ts:45)
# - deleteUser() (src/services/UserService.ts:67)
\`\`\`

### Type-aware Navigation

\`\`\`bash
# Navigate naar type definities
claude goto definition "OrderStatus"

# Navigate naar alle implementaties van een interface
claude goto implementations "IPaymentProcessor"

# Vind alle references naar een type
claude find references "ProductSchema"
\`\`\`

### Symbol Refactoring

\`\`\`bash
# Rename een symbol door de hele codebase
claude refactor rename "oldFunctionName" "newFunctionName" --preview

# Extract een interface uit een class
claude refactor extract-interface "UserService" --name "IUserService"
\`\`\`

## Cross-reference Understanding

Begrijp complexe relaties tussen verschillende delen van je code.

### Code Relationship Analysis

\`\`\`bash
# Analyseer relaties tussen modules
claude xref analyze src/modules/payment src/modules/order

# Output:
# Cross-references found:
# - Order.processPayment() → Payment.charge()
# - Order.refund() → Payment.refund()
# - Payment.onSuccess() → Order.updateStatus()
# - Shared types: TransactionID, Amount, Currency
\`\`\`

### Pattern Detection

\`\`\`bash
# Detecteer design patterns in je codebase
claude patterns detect --type "design"

# Output:
# Detected patterns:
# 1. Singleton: DatabaseConnection, Logger
# 2. Factory: UserFactory, ProductFactory
# 3. Observer: EventEmitter usage in 5 modules
# 4. Repository: UserRepository, OrderRepository
\`\`\`

### Architecture Validation

\`\`\`bash
# Valideer architectuur regels
claude arch validate --rules .architecture.yml

# Output:
# ✓ Controllers only import from services
# ✗ Service layer imports from controllers (2 violations)
# ✓ Utils have no external dependencies
# ✓ Models don't import from services
\`\`\`

## Real-world Voorbeeld: Express.js API Analyse

Laten we een complete analyse doen van een Express.js API:

\`\`\`bash
# 1. Start met een project overzicht
claude analyze . --type express-api

# 2. Map alle API endpoints
claude api map --format table

# Output:
# METHOD  PATH                    HANDLER                   MIDDLEWARE
# GET     /api/users             UserController.list       auth, paginate
# GET     /api/users/:id         UserController.get        auth
# POST    /api/users             UserController.create     auth, validate
# PUT     /api/users/:id         UserController.update     auth, validate
# DELETE  /api/users/:id         UserController.delete     auth, admin

# 3. Analyseer middleware flow
claude analyze middleware --endpoint "/api/users"

# 4. Vind security issues
claude security scan --focus authentication

# 5. Genereer documentatie
claude docs generate --type api --output api-docs.md
\`\`\`

## Best Practices voor Codebase Navigatie

### 1. Begin met een Overview
\`\`\`bash
# Always start met een project analyse
claude analyze . --summary
\`\`\`

### 2. Gebruik Smart Filters
\`\`\`bash
# Filter op relevantie
claude find "payment" --relevant-only

# Filter op recente wijzigingen
claude find --modified-since "1 week ago"
\`\`\`

### 3. Combineer Commands
\`\`\`bash
# Vind files en analyseer hun dependencies
claude find "*.service.ts" | claude deps analyze --batch
\`\`\`

### 4. Save Navigation Patterns
\`\`\`bash
# Save frequent navigations
claude nav save "auth-flow" --commands "find auth; deps analyze; calls trace login"

# Reuse saved navigations
claude nav run "auth-flow"
\`\`\`

## Oefeningen

1. **Analyseer een Open Source Project**: Download een populair open source project (bijv. Express.js) en gebruik Claude Code om de architectuur te begrijpen.

2. **Dependency Optimization**: Vind en los circular dependencies op in een bestaand project.

3. **Call Flow Documentation**: Genereer automatisch documentatie voor een complexe functie call flow.

4. **Architecture Validation**: Schrijf architectuur regels en valideer een codebase.
  `,
  codeExamples: [
    {
      id: 'example-2-1',
      title: 'Complete project analyse workflow',
      language: 'bash',
      code: `# 1. Start met project overview
claude analyze . --summary

# Output:
# Project: e-commerce-api
# Type: Node.js Express API
# Size: 2,847 files, 145,239 LOC
# Main technologies: TypeScript, Express, PostgreSQL, Redis
# Test coverage: 78%

# 2. Analyseer de architectuur
claude arch discover

# Output:
# Architecture: Layered (MVC + Services)
# - Controllers: 23 files
# - Services: 31 files
# - Models: 18 files
# - Middleware: 12 files
# - Utils: 45 files

# 3. Map alle API endpoints
claude api map --grouped

# 4. Analyseer dependencies
claude deps analyze --summary

# 5. Check voor problemen
claude health check --comprehensive`,
      explanation: 'Een complete workflow om snel inzicht te krijgen in een onbekend project. Start altijd met een high-level overview voordat je in details duikt.'
    },
    {
      id: 'example-2-2',
      title: 'Dependency graph voor React app',
      language: 'bash',
      code: `# Analyseer component dependencies
claude deps analyze src/components/ShoppingCart.tsx --visual

# Output:
# ShoppingCart.tsx dependencies:
# 
# Internal:
# ├── components/
# │   ├── CartItem.tsx
# │   ├── CartSummary.tsx
# │   └── EmptyCart.tsx
# ├── hooks/
# │   ├── useCart.ts
# │   └── useAuth.ts
# ├── services/
# │   └── cartService.ts
# └── utils/
#     └── formatPrice.ts
# 
# External:
# ├── react (v18.2.0)
# ├── react-redux (v8.1.0)
# └── @mui/material (v5.14.0)

# Genereer interactieve visualisatie
claude deps visualize src/components/ShoppingCart.tsx \\
  --format d3 \\
  --output cart-deps.html \\
  --include-external`,
      explanation: 'Dependency visualisatie helpt bij het begrijpen van component relaties en het identificeren van tight coupling of missing abstractions.'
    },
    {
      id: 'example-2-3',
      title: 'Call hierarchy voor debugging',
      language: 'bash',
      code: `# Trace een bug door de call hierarchy
claude calls trace "processOrder" --with-params

# Output:
# Call trace for processOrder(orderId: "ORD-12345"):
# 
# 1. POST /api/orders/process
#    └── OrderController.process(req, res)
#        └── OrderService.processOrder(orderId: "ORD-12345")
#            ├── validateOrder(order) ✓
#            ├── checkInventory(items) ✓
#            ├── calculatePricing(order)
#            │   ├── getBasePrice(items) ✓
#            │   ├── applyDiscounts(order, customer) ✓
#            │   └── calculateTax(order, address) ✗ Error here!
#            └── [Execution stopped due to error]
#
# Error location: src/services/pricing/taxCalculator.ts:45
# Error: Invalid tax region code: "XX"

# Analyseer de specifieke error locatie
claude analyze src/services/pricing/taxCalculator.ts:45 --context 10`,
      explanation: 'Call tracing is essentieel voor het debuggen van complexe flows. Het toont exact waar in de chain een probleem optreedt.'
    },
    {
      id: 'example-2-4',
      title: 'Smart navigation met context',
      language: 'bash',
      code: `# Navigeer naar gerelateerde code met AI context
claude navigate "where is user authentication implemented"

# Claude analyseert en vindt:
# 
# Main authentication logic:
# - src/middleware/auth.ts (JWT validation)
# - src/services/authService.ts (login/logout logic)
# - src/controllers/authController.ts (API endpoints)
# 
# Related files:
# - src/models/User.ts (User model)
# - src/utils/jwt.ts (Token utilities)
# - src/config/auth.ts (Auth configuration)
# - tests/auth.test.ts (Test suite)
#
# Would you like to:
# 1. Open main auth service
# 2. See auth flow diagram  
# 3. List all auth endpoints
# 4. Check auth test coverage

# Kies optie 2 voor flow diagram
2

# Claude genereert:
# Auth Flow:
# Client → POST /login → authController.login()
#   ↓
# Validate credentials → authService.authenticate()
#   ↓
# Generate JWT → jwt.sign()
#   ↓
# Return token → Client stores in localStorage
#   ↓
# Subsequent requests → auth middleware validates token`,
      explanation: 'Claude Code begrijpt natuurlijke taal queries en kan je intelligent naar de juiste code navigeren zonder exacte file namen te weten.'
    }
  ],
  assignments: [
    {
      id: 'assignment-2-1',
      title: 'Complete project analyse van Express.js',
      description: 'Download de Express.js repository en voer een complete analyse uit om de architectuur en code organisatie te begrijpen.',
      difficulty: 'medium',
      type: 'code',
      initialCode: `# Clone eerst de Express.js repository
git clone https://github.com/expressjs/express.git
cd express

# Opdracht: Voer een complete analyse uit en beantwoord:
# 1. Wat is de hoofdarchitectuur van Express?
# 2. Hoeveel middleware functies zijn er?
# 3. Wat zijn de core dependencies?
# 4. Hoe is de test structuur georganiseerd?
# 5. Zijn er circular dependencies?

# Start hier met je analyse:
claude analyze . --summary`,
      solution: `# Complete analyse van Express.js

# 1. Project overview
claude analyze . --summary

# 2. Architectuur analyse
claude arch discover --detailed

# Output toont:
# - Modular architectuur met core en middleware layers
# - Hoofdcomponenten: Router, Application, Request, Response

# 3. Middleware analyse
claude find "middleware" --type function | claude analyze --count

# 4. Dependencies mapping
claude deps tree --depth 2

# Core dependencies:
# - body-parser: Request body parsing
# - cookie-parser: Cookie parsing
# - debug: Debug logging
# - depd: Deprecation warnings

# 5. Test structuur
claude analyze test/ --structure

# 6. Circular dependencies check
claude deps check --circular

# 7. API endpoints documentatie
claude api discover --from-tests

# 8. Performance hotspots
claude analyze --performance-hints

# Samenvatting rapport genereren:
claude report generate --output express-analysis.md`,
      hints: [
        'Begin altijd met een high-level summary voor overzicht',
        'Gebruik --detailed flags voor diepere analyse',
        'Combineer meerdere commands met pipes voor efficientie',
        'Check de test files voor API gebruik voorbeelden'
      ]
    },
    {
      id: 'assignment-2-2',
      title: 'Dependency optimization challenge',
      description: 'Identificeer en los circular dependencies op in een voorbeeldproject met complexe module structuur.',
      difficulty: 'hard',
      type: 'code',
      initialCode: `# Je hebt een project met de volgende structuur:
# src/
#   services/
#     userService.ts    (imports authService)
#     authService.ts    (imports userService)
#     orderService.ts   (imports userService, paymentService)
#     paymentService.ts (imports orderService)
#   utils/
#     validation.ts     (imports from services)
#   models/
#     user.ts          (imports validation)

# Opdracht:
# 1. Detecteer alle circular dependencies
# 2. Visualiseer de dependency graph
# 3. Stel een refactoring plan voor
# 4. Implementeer de oplossing

# Start analyse:
claude deps check --circular src/`,
      solution: `# Dependency Optimization Solution

# 1. Detecteer circular dependencies
claude deps check --circular src/ --verbose

# Output:
# ⚠️ 2 circular dependencies found:
# 1. userService ↔ authService
# 2. orderService ↔ paymentService

# 2. Visualiseer voor beter begrip
claude deps visualize src/services --format mermaid --highlight-circular

# 3. Analyseer de specifieke imports
claude analyze imports src/services/userService.ts src/services/authService.ts

# 4. Genereer refactoring suggesties
claude refactor suggest --fix-circular src/services

# Suggested solution:
# - Extract shared interfaces naar src/interfaces/
# - Create service facades voor cross-service communication
# - Use dependency injection pattern

# 5. Implementeer de oplossing

# Stap 1: Extract interfaces
claude refactor extract-interface src/services/userService.ts --to src/interfaces/IUserService.ts
claude refactor extract-interface src/services/authService.ts --to src/interfaces/IAuthService.ts

# Stap 2: Create service registry
cat > src/services/serviceRegistry.ts << 'EOF'
export class ServiceRegistry {
  private static services = new Map();
  
  static register(name: string, service: any) {
    this.services.set(name, service);
  }
  
  static get<T>(name: string): T {
    return this.services.get(name);
  }
}
EOF

# Stap 3: Refactor services om interfaces te gebruiken
claude refactor apply --pattern "dependency-injection" src/services/

# 6. Valideer de fix
claude deps check --circular src/

# 7. Genereer updated dependency graph
claude deps visualize src/services --format svg --output deps-fixed.svg`,
      hints: [
        'Circular dependencies ontstaan vaak door tight coupling',
        'Overweeg het Dependency Inversion Principle (DIP)',
        'Interfaces en abstractions kunnen circular deps breken',
        'Service registries of DI containers zijn goede oplossingen'
      ]
    },
    {
      id: 'assignment-2-3',
      title: 'Build een custom navigation tool',
      description: 'Creëer een custom Claude Code command die intelligente navigatie combineert met je team\'s specifieke conventies.',
      difficulty: 'hard',
      type: 'code',
      initialCode: `# Maak een custom command: 'claude nav-smart'
# 
# Requirements:
# 1. Moet zoeken op natuurlijke taal input
# 2. Moet team conventies respecteren:
#    - Controllers eindigen op 'Controller.ts'
#    - Services eindigen op 'Service.ts'  
#    - Tests zijn in __tests__ folders
# 3. Moet relevantie scores tonen
# 4. Moet geschiedenis bijhouden
#
# Start met command definitie:
claude command create nav-smart`,
      solution: `# Custom Navigation Tool Implementation

# 1. Create command definition
cat > .claude/commands/nav-smart.js << 'EOF'
#!/usr/bin/env node

const { Command } = require('commander');
const { analyzeQuery, findFiles, scoreRelevance } = require('../lib/navigation');

const program = new Command();

program
  .name('nav-smart')
  .description('Intelligent navigation with team conventions')
  .argument('<query>', 'Natural language search query')
  .option('-t, --type <type>', 'File type filter (controller|service|test|component)')
  .option('-l, --limit <n>', 'Max results', '10')
  .option('--history', 'Show navigation history')
  .action(async (query, options) => {
    // Parse natural language query
    const intent = await analyzeQuery(query);
    
    // Apply team conventions
    const patterns = {
      controller: '*Controller.ts',
      service: '*Service.ts',
      test: '**/__tests__/**/*.{ts,js}',
      component: '**/components/**/*.{tsx,jsx}'
    };
    
    // Find matching files
    const files = await findFiles({
      query: intent.searchTerms,
      pattern: patterns[options.type] || '**/*',
      excludes: ['node_modules', 'dist', 'build']
    });
    
    // Score relevance
    const scored = files.map(file => ({
      path: file,
      score: scoreRelevance(file, intent),
      type: detectFileType(file)
    })).sort((a, b) => b.score - a.score);
    
    // Display results
    console.log(\`\\nSearch: "\${query}"\\n\`);
    scored.slice(0, options.limit).forEach((item, idx) => {
      console.log(\`\${idx + 1}. [\${item.score}%] \${item.path}\`);
      console.log(\`   Type: \${item.type}\`);
    });
    
    // Save to history
    if (!options.history) {
      saveToHistory(query, scored[0]?.path);
    }
  });

// Helper functions
function detectFileType(filepath) {
  if (filepath.includes('Controller.')) return 'Controller';
  if (filepath.includes('Service.')) return 'Service';
  if (filepath.includes('__tests__')) return 'Test';
  if (filepath.includes('/components/')) return 'Component';
  return 'Other';
}

function saveToHistory(query, result) {
  // Implementation voor history tracking
}

program.parse();
EOF

# 2. Create supporting library
mkdir -p .claude/lib
cat > .claude/lib/navigation.js << 'EOF'
const { claudeAPI } = require('./api');

async function analyzeQuery(query) {
  // Use Claude AI to understand intent
  const response = await claudeAPI.analyze({
    prompt: \`Extract search intent from: "\${query}"\`,
    type: 'navigation'
  });
  
  return {
    searchTerms: response.keywords,
    fileType: response.suggestedType,
    context: response.context
  };
}

async function findFiles(options) {
  // Smart file finding implementation
  // Combines glob patterns with content analysis
}

function scoreRelevance(filepath, intent) {
  // Scoring algorithm considering:
  // - Filename match
  // - Path match  
  // - Recent modifications
  // - Team conventions
  let score = 0;
  
  // Implementation here...
  
  return Math.min(100, Math.max(0, score));
}

module.exports = { analyzeQuery, findFiles, scoreRelevance };
EOF

# 3. Register command
claude command register nav-smart

# 4. Test the command
claude nav-smart "where is user authentication"

# Example output:
# Search: "where is user authentication"
#
# 1. [95%] src/services/AuthService.ts
#    Type: Service
# 2. [88%] src/controllers/AuthController.ts  
#    Type: Controller
# 3. [76%] src/middleware/authenticate.ts
#    Type: Other
# 4. [72%] src/__tests__/auth.test.ts
#    Type: Test`,
      hints: [
        'Gebruik Claude\'s AI capabilities voor natuurlijke taal parsing',
        'Implementeer een scoring algoritme voor relevantie',
        'Cache resultaten voor snellere subsequent searches',
        'Overweeg fuzzy matching voor typos'
      ]
    }
  ]
};