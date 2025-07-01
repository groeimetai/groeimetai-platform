import type { Lesson } from '@/lib/data/courses';

export const lesson2_4: Lesson = {
  id: 'lesson-2-4',
  title: 'Legacy code understanding',
  duration: '40 min',
  content: `
# Legacy Code Understanding met Claude Code

Leer hoe je Claude Code gebruikt om legacy codebases te analyseren, te begrijpen en te moderniseren. Deze les behandelt strategieën voor het werken met bestaande systemen en het plannen van migraties.

## Reverse Engineering Technieken

### 1. Codebase Archeologie
Claude Code helpt je bij het ontrafelen van complexe legacy systemen:

\`\`\`bash
# Analyseer de structuur van een legacy project
claude analyze-structure --depth 3 --include-patterns "*.java,*.jsp"

# Identificeer code hotspots en complexiteit
claude analyze-complexity --threshold high --output complexity-report.md

# Vind verouderde patterns en anti-patterns
claude detect-patterns --type anti-patterns --legacy-mode
\`\`\`

### 2. Dependency Mapping
Begrijp hoe verschillende delen van het systeem met elkaar verbonden zijn:

\`\`\`bash
# Genereer een dependency graph
claude map-dependencies --format dot --output dependencies.svg

# Analyseer circular dependencies
claude find-circular-deps --severity high

# Identificeer externe dependencies en versies
claude list-dependencies --outdated --security-issues
\`\`\`

### 3. Control Flow Analysis
Volg de uitvoeringsstroom door complexe legacy code:

\`\`\`bash
# Trace een specifieke functie door het systeem
claude trace-function "processOrder" --show-call-stack

# Analyseer conditionele logica complexiteit
claude analyze-conditions --max-depth 5 --highlight-complex
\`\`\`

## Business Logic Extraction

### 1. Business Rules Identificatie
Claude Code helpt bij het identificeren en documenteren van business rules:

\`\`\`bash
# Extract business rules uit code
claude extract-rules --format markdown --categorize

# Genereer een business logic overzicht
claude "Analyseer deze codebase en identificeer alle business rules 
       gerelateerd aan order processing, pricing en inventory management"

# Validatie rules mapping
claude map-validations --group-by-entity
\`\`\`

### 2. Domain Model Reconstructie
Herbouw het domeinmodel uit legacy code:

\`\`\`javascript
// Claude prompt voor domain model extractie
claude chat --context . << 'EOF'
Analyseer deze legacy codebase en:
1. Identificeer alle domain entities
2. Map de relaties tussen entities
3. Extract business invariants
4. Genereer een modern domain model diagram
5. Suggereer Domain-Driven Design improvements
EOF
\`\`\`

### 3. Workflow Documentatie
Documenteer bestaande business workflows:

\`\`\`bash
# Genereer workflow documentatie
claude document-workflows --format bpmn --include-exceptions

# Identificeer kritieke business processes
claude find-critical-paths --business-impact high
\`\`\`

## Database Schema Understanding

### 1. Schema Reverse Engineering
Analyseer en documenteer bestaande database structuren:

\`\`\`sql
-- Claude prompt voor schema analyse
claude analyze-db --connection "mysql://legacy_db" << 'EOF'
Analyseer dit database schema en:
1. Identificeer alle tabellen en hun relaties
2. Vind missing foreign keys en constraints
3. Detecteer denormalisatie problemen
4. Suggereer index optimalisaties
5. Genereer een ERD diagram
EOF
\`\`\`

### 2. Data Quality Assessment
Evalueer de kwaliteit van bestaande data:

\`\`\`bash
# Analyseer data kwaliteit issues
claude assess-data-quality --tables "*" --report detailed

# Vind data inconsistenties
claude find-data-issues --check-referential-integrity

# Genereer data migration warnings
claude migration-analysis --target-version modern --show-risks
\`\`\`

### 3. Query Pattern Analysis
Begrijp hoe de applicatie met de database interacteert:

\`\`\`bash
# Analyseer query patterns
claude analyze-queries --source-code . --group-by-frequency

# Identificeer N+1 query problemen
claude detect-n-plus-one --framework hibernate

# Optimalisatie suggesties
claude suggest-query-optimizations --impact high
\`\`\`

## API Contract Discovery

### 1. API Endpoint Mapping
Documenteer alle bestaande API endpoints:

\`\`\`bash
# Scan voor API endpoints
claude discover-apis --frameworks "spring,jax-rs" --output openapi.yaml

# Analyseer API gebruik patterns
claude analyze-api-usage --include-deprecated

# Genereer API documentatie
claude generate-api-docs --format swagger --include-examples
\`\`\`

### 2. Contract Testing Generation
Genereer contract tests voor bestaande APIs:

\`\`\`javascript
// Claude prompt voor contract test generatie
claude generate-tests --type contract << 'EOF'
Genereer Pact contract tests voor alle REST endpoints in /api/v1/:
- Include request/response validatie
- Test edge cases en error scenarios
- Genereer consumer en provider tests
- Include backwards compatibility checks
EOF
\`\`\`

### 3. API Evolution Strategy
Plan API modernisering met backwards compatibility:

\`\`\`bash
# Analyseer API breaking changes
claude api-diff --base-version v1 --new-version v2

# Genereer migration guide
claude generate-migration-guide --format markdown

# Deprecation strategy
claude plan-deprecation --timeline "6 months" --notify-consumers
\`\`\`

## Migration Planning

### 1. Modernization Strategie Development
Ontwikkel een gefaseerde moderniseringsstrategie:

\`\`\`bash
# Genereer modernization assessment
claude assess-modernization --output modernization-plan.md

# Prioriteer componenten voor migratie
claude prioritize-migration --criteria "risk,value,effort"

# Genereer een roadmap
claude create-roadmap --phases 4 --timeline "12 months"
\`\`\`

### 2. Technology Stack Analysis
Evalueer en plan technology stack updates:

\`\`\`javascript
// Claude prompt voor stack modernisering
claude analyze-stack << 'EOF'
Analyseer de huidige technology stack en:
1. Identificeer verouderde technologieën
2. Suggereer moderne alternatieven
3. Evalueer migration effort per component
4. Creëer een technology radar
5. Plan incremental migration path
EOF
\`\`\`

### 3. Risk Assessment
Identificeer en mitigeer migratie risico's:

\`\`\`bash
# Genereer risk assessment
claude assess-risks --categories "technical,business,operational"

# Creëer contingency plans
claude plan-contingencies --high-risk-areas

# Test strategy voor migratie
claude generate-test-strategy --coverage-target 95
\`\`\`

## Legacy Modernization Strategies

### 1. Strangler Fig Pattern
Implementeer graduele vervanging van legacy componenten:

\`\`\`javascript
// Claude implementatie van Strangler Fig
claude implement-strangler --component "OrderService" << 'EOF'
Implementeer Strangler Fig pattern voor OrderService:
1. Creëer nieuwe service naast legacy
2. Implementeer facade/proxy layer
3. Route traffic incrementeel
4. Monitor beide implementaties
5. Plan legacy decommissioning
EOF
\`\`\`

### 2. Event Sourcing Migration
Migreer van CRUD naar Event Sourcing:

\`\`\`bash
# Analyseer voor event sourcing geschiktheid
claude analyze-for-es --entities "Order,Customer,Product"

# Genereer event definitions
claude generate-events --from-mutations --aggregate Order

# Creëer projection handlers
claude generate-projections --read-models "OrderList,OrderDetail"
\`\`\`

### 3. Microservices Decomposition
Decomponeer monoliths naar microservices:

\`\`\`bash
# Identificeer service boundaries
claude identify-boundaries --method "bounded-context"

# Genereer service extraction plan
claude plan-extraction --service "InventoryService" --dependencies

# Creëer API gateway configuratie
claude generate-gateway --services "extracted-services.json"
\`\`\`

## Best Practices voor Legacy Code Understanding

### Do's:
- **Start met high-level overzicht** voordat je in details duikt
- **Documenteer assumptions** tijdens reverse engineering
- **Gebruik automated tools** voor repetitieve analyse taken
- **Betrek domain experts** bij business logic extractie
- **Test thoroughly** tijdens elke migratie fase

### Don'ts:
- **Niet alles in één keer** proberen te moderniseren
- **Geen assumptions maken** over undocumented behavior
- **Legacy patterns niet blindly** naar nieuwe code kopiëren
- **Business value niet negeren** bij technische beslissingen

## Praktische Tips

### 1. Legacy Code Checklist
\`\`\`markdown
□ Identificeer core business logic
□ Map alle externe dependencies
□ Document API contracts
□ Analyseer database schema en gebruik
□ Evalueer security vulnerabilities
□ Plan incremental migration path
□ Setup comprehensive monitoring
□ Create rollback procedures
\`\`\`

### 2. Communication Templates
Gebruik Claude voor stakeholder communicatie:

\`\`\`bash
# Genereer executive summary
claude summarize-findings --audience executives --length concise

# Technical debt rapport
claude report-tech-debt --impact-analysis --roi-calculation

# Migration progress dashboard
claude generate-dashboard --metrics "progress,risks,blockers"
\`\`\`

Deze technieken helpen je om legacy codebases effectief te begrijpen en te moderniseren met behulp van Claude Code's krachtige analyse capabilities.
  `,
  codeExamples: [
    {
      id: 'example-legacy-1',
      title: 'Legacy Code Analysis Workflow',
      language: 'bash',
      code: `# Complete legacy code analysis workflow met Claude Code

# Stap 1: Initial project scan
claude analyze-structure --output project-overview.md

# Stap 2: Identificeer probleem gebieden
claude detect-code-smells --severity high --format json > issues.json

# Stap 3: Analyseer business logic
claude extract-business-rules --context src/ --categorize --output rules.md

# Stap 4: Database schema understanding
claude analyze-db-schema --connection $DB_URL --generate-erd

# Stap 5: API contract discovery
claude discover-apis --scan-depth full --output api-contracts.yaml

# Stap 6: Genereer modernization plan
claude create-modernization-plan --risk-assessment --phases 6

# Stap 7: Start met eerste migratie
claude implement-strangler --component "LegacyAuthService" \\
  --new-stack "node,typescript,jwt" \\
  --migration-strategy incremental`,
      explanation: 'Een complete workflow voor het analyseren en moderniseren van legacy code, van initial scan tot implementatie van modernization patterns.'
    },
    {
      id: 'example-legacy-2',
      title: 'Business Logic Extraction met Claude',
      language: 'javascript',
      code: `// Claude prompt voor business logic extraction uit legacy Java code

const extractBusinessLogic = async () => {
  const claudePrompt = \`
Analyseer deze legacy Java codebase en extract alle business logic:

Context: E-commerce platform uit 2008, J2EE architectuur

Tasks:
1. Identificeer alle business rules in OrderProcessor.java
2. Map de pricing logic inclusief:
   - Discount calculations
   - Tax rules per region  
   - Shipping cost logic
   - Promotion engine rules

3. Documenteer de order workflow:
   - Validation steps
   - Inventory checks
   - Payment processing
   - Fulfillment triggers

4. Genereer moderne TypeScript interfaces voor:
   - Domain entities
   - Business rule definitions
   - Workflow steps

5. Creëer unit tests die de extracted business logic valideren

Output format: 
- Markdown documentatie met mermaid diagrams
- TypeScript code voor nieuwe implementatie
- Jest test suite

Focus op business logic, negeer technical implementation details.
\`;

  // Execute Claude analysis
  const result = await claude.analyze({
    prompt: claudePrompt,
    context: './legacy-src',
    outputDir: './modernization/business-logic'
  });

  // Generate migration mapping
  await claude.generateMapping({
    from: result.extractedRules,
    to: 'modern-typescript',
    preserveBusinessLogic: true
  });
};`,
      explanation: 'Demonstreert hoe Claude Code gebruikt kan worden om complexe business logic uit legacy systemen te extraheren en te documenteren voor modernisering.'
    },
    {
      id: 'example-legacy-3',
      title: 'Database Migration Planning',
      language: 'sql',
      code: `-- Claude database modernization workflow

-- Prompt voor Claude schema analyse
/*
Claude, analyseer dit legacy database schema en creëer een modernization plan:

1. Identificeer schema problemen:
   - Missing foreign keys
   - Denormalized tables  
   - Incorrect data types
   - Missing indexes

2. Genereer migration scripts voor:
   - Schema normalisatie
   - Data type corrections
   - Performance optimizations
   - Constraint additions

3. Creëer rollback procedures voor elke migratie stap
*/

-- Claude genereert:

-- Phase 1: Add missing constraints
ALTER TABLE orders 
ADD CONSTRAINT fk_customer 
FOREIGN KEY (customer_id) REFERENCES customers(id);

ALTER TABLE order_items
ADD CONSTRAINT fk_order
FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

-- Phase 2: Normalize product_categories
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  parent_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- Migration script voor data
INSERT INTO categories (name, parent_id)
SELECT DISTINCT 
  SUBSTRING_INDEX(product_category, '/', -1) as name,
  NULL as parent_id
FROM products
WHERE product_category IS NOT NULL;

-- Phase 3: Performance optimizations
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Rollback procedures
-- Rollback Phase 3
DROP INDEX IF EXISTS idx_orders_date;
DROP INDEX IF EXISTS idx_orders_status;
DROP INDEX IF EXISTS idx_order_items_product;

-- Rollback Phase 2  
DROP TABLE IF EXISTS categories;

-- Rollback Phase 1
ALTER TABLE orders DROP FOREIGN KEY fk_customer;
ALTER TABLE order_items DROP FOREIGN KEY fk_order;`,
      explanation: 'Toont hoe Claude Code een legacy database schema kan analyseren en een gefaseerde migration plan kan genereren met proper rollback procedures.'
    }
  ],
  assignments: [
    {
      id: 'assignment-2-4-1',
      title: 'Legacy Codebase Analysis',
      description: 'Gebruik Claude Code om een legacy codebase te analyseren en een modernization rapport te genereren.',
      difficulty: 'hard',
      type: 'code',
      initialCode: `# Legacy Code Analysis Opdracht

# Je hebt een legacy PHP e-commerce applicatie uit 2010
# De codebase bevat:
# - 500+ PHP files (procedural style)
# - MySQL database met 80+ tables
# - No documentation
# - Mixed business logic en presentation
# - Custom framework zonder documentatie

# Gebruik Claude Code om:
# 1. De codebase structuur te analyseren
# 2. Business logic te identificeren en extraheren
# 3. Database schema te reverse engineeren
# 4. API endpoints te discoveren
# 5. Een modernization plan te creëren

# Start hier met je analyse workflow:
`,
      solution: `# Oplossing: Complete Legacy Analysis Workflow

# 1. Initial project assessment
claude analyze-structure \\
  --include "*.php,*.inc,*.sql" \\
  --exclude "vendor/,cache/" \\
  --output initial-assessment.md

# 2. Code quality en complexity analysis
claude analyze-complexity \\
  --language php \\
  --metrics "cyclomatic,coupling,cohesion" \\
  --threshold medium \\
  --output complexity-report.json

# 3. Business logic extraction
claude chat --context . << 'EOF'
Analyseer alle PHP files in /includes/business/ en:
1. Identificeer alle business rules voor:
   - Product pricing en discounts
   - Order processing workflow
   - Inventory management
   - Customer tier system
2. Documenteer elke rule met:
   - Current implementation
   - Business purpose
   - Dependencies
   - Test scenarios
3. Genereer pseudocode voor moderne implementatie
EOF

# 4. Database reverse engineering
claude analyze-db \\
  --connection "mysql://root:pass@localhost/legacy_shop" \\
  --generate-erd \\
  --find-relationships \\
  --suggest-indexes \\
  --output database-analysis/

# 5. API endpoint discovery
find . -name "*.php" -path "*/api/*" -o -path "*/ajax/*" | \\
xargs claude analyze-endpoints \\
  --detect-patterns \\
  --generate-openapi \\
  --include-auth-info \\
  --output api-specification.yaml

# 6. Security vulnerability scan
claude security-scan \\
  --check "sql-injection,xss,csrf,auth-bypass" \\
  --severity high \\
  --generate-fixes \\
  --output security-report.md

# 7. Generate modernization roadmap
claude create-modernization-plan \\
  --target-stack "symfony,doctrine,react" \\
  --migration-strategy "strangler-fig" \\
  --phases 8 \\
  --timeline "18-months" \\
  --risk-mitigation \\
  --output modernization-roadmap.md

# 8. Create proof of concept
claude implement-poc \\
  --component "ProductCatalog" \\
  --modern-stack \\
  --include-tests \\
  --docker-ready \\
  --output poc/`,
      hints: [
        'Begin met een high-level structuur analyse voordat je in details duikt',
        'Gebruik Claude\'s pattern detection voor het identificeren van framework conventies',
        'Focus eerst op core business logic voordat je naar randgevallen kijkt',
        'Documenteer alle assumptions die je maakt over undocumented gedrag',
        'Genereer visualisaties voor complexe relaties en workflows'
      ]
    },
    {
      id: 'assignment-2-4-2',
      title: 'API Contract Recovery',
      description: 'Reverse engineer en documenteer API contracts uit een legacy REST API zonder documentatie.',
      difficulty: 'medium',
      type: 'code',
      initialCode: `# API Contract Recovery Opdracht

# Een legacy Node.js applicatie heeft 50+ API endpoints
# maar geen documentatie of API specificaties.

# De API structure:
# - /routes/api/v1/*.js (Express routers)
# - Inconsistente response formats
# - Mixed authentication methods
# - No input validation schemas

# Jouw taak:
# 1. Discover alle API endpoints
# 2. Bepaal request/response formats
# 3. Identificeer authentication requirements
# 4. Genereer OpenAPI specification
# 5. Creëer Postman collection

# Begin met je discovery process:
`,
      solution: `# API Contract Recovery Solution

# 1. Scan voor alle API endpoints
claude discover-apis \\
  --framework express \\
  --base-path "routes/api" \\
  --recursive \\
  --output discovered-endpoints.json

# 2. Analyze endpoint patterns en conventions
claude analyze-patterns << 'EOF'
Analyseer de discovered endpoints en identificeer:
1. URL naming conventions
2. HTTP method usage patterns
3. Common response structures
4. Error handling patterns
5. Authentication patterns (JWT, API key, session, etc)
6. Versioning strategy
EOF

# 3. Generate request/response schemas
for endpoint in $(cat discovered-endpoints.json | jq -r '.endpoints[].path'); do
  claude infer-schema \\
    --endpoint "$endpoint" \\
    --analyze-code \\
    --sample-requests logs/api-access.log \\
    --output "schemas/$endpoint.json"
done

# 4. Create comprehensive API documentation
claude generate-api-spec \\
  --format openapi-3.0 \\
  --include-examples \\
  --infer-auth-schema \\
  --base-url "https://api.legacy-app.com" \\
  --output api-specification.yaml

# 5. Validate generated specification
claude validate-api-spec \\
  --spec api-specification.yaml \\
  --test-against-live https://api.legacy-app.com \\
  --fix-discrepancies

# 6. Generate Postman collection
claude convert-spec \\
  --from api-specification.yaml \\
  --to postman-collection \\
  --include-tests \\
  --environment-vars \\
  --output legacy-api.postman_collection.json

# 7. Create API test suite
claude generate-api-tests \\
  --spec api-specification.yaml \\
  --framework jest \\
  --coverage-target 100 \\
  --include-edge-cases \\
  --output api-tests/

# 8. Generate migration guide for API consumers
claude create-migration-guide \\
  --old-patterns discovered-endpoints.json \\
  --new-spec api-specification.yaml \\
  --breaking-changes \\
  --deprecation-timeline \\
  --output api-migration-guide.md`,
      hints: [
        'Check log files voor actual API usage patterns',
        'Zoek naar test files die API calls demonstreren',
        'Analyseer frontend code voor API consumption patterns',
        'Let op inconsistenties in error responses'
      ]
    }
  ]
};