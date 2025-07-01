import { Lesson } from '@/lib/data/courses'

export const lesson1_3: Lesson = {
  id: 'lesson-1-3',
  title: 'Coordinatie en orchestratie patronen',
  duration: '35 min',
  content: `
# Coordinatie en orchestratie patronen

In deze les verkennen we verschillende patronen voor het coördineren en orchestreren van AI agent swarms. Elk patroon heeft zijn eigen sterke punten en is geschikt voor verschillende soorten taken.

## 1. Centralized Orchestration

Bij **centralized orchestration** fungeert één centrale controller als de dirigent van het hele systeem.

### Kenmerken:
- Eén centrale orchestrator die alle taken verdeelt
- Directe controle over alle agents
- Eenvoudige monitoring en debugging
- Single point of failure

### Wanneer te gebruiken:
- Taken met duidelijke hiërarchie
- Wanneer consistentie cruciaal is
- Voor kleinere tot middelgrote swarms

### Voorbeeld workflow:
\`\`\`bash
# Start een gecentraliseerde research swarm
./claude-flow swarm "Analyseer markttrends voor AI tools" \\
  --strategy research \\
  --mode centralized \\
  --max-agents 5 \\
  --monitor
\`\`\`

## 2. Distributed Coordination

**Distributed coordination** verdeelt de controle over meerdere agents die onderling communiceren.

### Kenmerken:
- Geen centrale controller
- Agents communiceren peer-to-peer
- Hoge schaalbaarheid
- Robuust tegen uitval

### Wanneer te gebruiken:
- Grote, complexe taken
- Wanneer schaalbaarheid belangrijk is
- Voor taken die parallel kunnen lopen

### Voorbeeld workflow:
\`\`\`bash
# Gedistribueerde development swarm
./claude-flow swarm "Bouw microservices architectuur" \\
  --strategy development \\
  --mode distributed \\
  --max-agents 10 \\
  --parallel \\
  --output json
\`\`\`

## 3. Hierarchical Patterns

**Hierarchical patterns** organiseren agents in lagen met duidelijke rapportagelijnen.

### Kenmerken:
- Meerdere lagen van controle
- Team leads coördineren sub-teams
- Gestructureerde informatiestroom
- Efficiënt voor grote projecten

### Wanneer te gebruiken:
- Complexe projecten met sub-taken
- Wanneer specialisatie nodig is
- Voor enterprise-scale operaties

### Voorbeeld workflow:
\`\`\`bash
# Hiërarchische projectstructuur
./claude-flow swarm "Ontwikkel complete e-commerce platform" \\
  --strategy development \\
  --mode hierarchical \\
  --max-agents 15 \\
  --monitor

# Memory-based coordinatie tussen teams
./claude-flow memory store "frontend_specs" "React componenten met TypeScript"
./claude-flow memory store "backend_specs" "Node.js met PostgreSQL"
\`\`\`

## 4. Mesh Networks

**Mesh networks** creëren een volledig verbonden netwerk waar elke agent met elke andere agent kan communiceren.

### Kenmerken:
- Volledig verbonden netwerk
- Maximale flexibiliteit
- Hoge communicatie-overhead
- Zelf-organiserend

### Wanneer te gebruiken:
- Creatieve taken
- Onderzoek en innovatie
- Wanneer emergent gedrag gewenst is

### Voorbeeld workflow:
\`\`\`bash
# Mesh network voor innovatie
./claude-flow swarm "Brainstorm nieuwe product features" \\
  --strategy analysis \\
  --mode mesh \\
  --max-agents 8 \\
  --parallel
\`\`\`

## 5. Hybrid Approaches

**Hybrid approaches** combineren het beste van meerdere patronen voor optimale resultaten.

### Kenmerken:
- Flexibele architectuur
- Aanpasbaar per taak-type
- Combineert sterke punten
- Complexere implementatie

### Wanneer te gebruiken:
- Multi-fase projecten
- Wanneer verschillende taken verschillende aanpakken vereisen
- Voor maximale efficiëntie

### Voorbeeld workflow:
\`\`\`bash
# Hybrid approach voor complete ontwikkeling
# Fase 1: Gecentraliseerd onderzoek
./claude-flow swarm "Research gebruikersvereisten" \\
  --strategy research \\
  --mode centralized \\
  --output sqlite

# Fase 2: Hiërarchische ontwikkeling
./claude-flow swarm "Implementeer features" \\
  --strategy development \\
  --mode hierarchical \\
  --max-agents 12

# Fase 3: Gedistribueerd testen
./claude-flow swarm "Uitgebreide testing suite" \\
  --strategy testing \\
  --mode distributed \\
  --parallel
\`\`\`

## Best Practices voor Coordinatie

### 1. Memory-Driven Coordination
Gebruik het Memory systeem voor het delen van informatie tussen agents:

\`\`\`bash
# Sla architectuur beslissingen op
./claude-flow memory store "system_design" "Event-driven microservices"

# Agents kunnen deze informatie gebruiken
./claude-flow sparc run coder "Implementeer service volgens system_design"
\`\`\`

### 2. Task Dependencies
Definieer duidelijke dependencies tussen taken:

\`\`\`javascript
TodoWrite([
  {
    id: "design_api",
    content: "Ontwerp REST API endpoints",
    status: "in_progress",
    priority: "high"
  },
  {
    id: "implement_backend",
    content: "Implementeer API endpoints",
    status: "pending",
    priority: "high",
    dependencies: ["design_api"]
  }
]);
\`\`\`

### 3. Monitoring en Feedback
Gebruik real-time monitoring voor betere coordinatie:

\`\`\`bash
# Start met monitoring dashboard
./claude-flow monitor

# In een andere terminal, start de swarm
./claude-flow swarm "Complex project" --monitor
\`\`\`

## Praktijkoefening

Experimenteer met verschillende coordinatiepatronen voor een webshop project:

1. Start met gecentraliseerd onderzoek naar requirements
2. Gebruik hiërarchische ontwikkeling voor de implementatie
3. Pas gedistribueerde testing toe
4. Monitor de voortgang en pas de strategie aan waar nodig

Door het begrijpen en toepassen van deze coordinatiepatronen kun je Claude Flow optimaal inzetten voor elk type project, van kleine taken tot enterprise-scale implementaties.
  `,
  codeExamples: [
    {
      id: 'example-1-3-1',
      title: 'Centralized Research Swarm',
      code: `#!/bin/bash
# Gecentraliseerde research swarm met monitoring

# Start de swarm
./claude-flow swarm "Onderzoek AI markttrends 2024" \\
  --strategy research \\
  --mode centralized \\
  --max-agents 5 \\
  --monitor \\
  --output html

# Sla resultaten op in memory
./claude-flow memory store "market_research_2024" "$(cat research_output.html)"

# Gebruik resultaten voor vervolganalyse
./claude-flow sparc run analyzer "Analyseer market_research_2024 voor kansen"`,
      language: 'bash'
    },
    {
      id: 'example-1-3-2',
      title: 'Hierarchical Development Pattern',
      code: `#!/bin/bash
# Hiërarchische ontwikkeling met team coordinatie

# Definieer team structuur in memory
./claude-flow memory store "team_structure" '{
  "frontend": ["ui_designer", "react_developer", "css_specialist"],
  "backend": ["api_architect", "database_engineer", "security_expert"],
  "devops": ["ci_cd_specialist", "cloud_architect"]
}'

# Start hiërarchische swarm
./claude-flow swarm "Bouw SaaS platform" \\
  --strategy development \\
  --mode hierarchical \\
  --max-agents 12 \\
  --parallel \\
  --monitor

# Coordineer tussen teams
./claude-flow memory store "api_contracts" "OpenAPI 3.0 specificaties"
./claude-flow task create "Frontend integratie met API contracts"`,
      language: 'bash'
    },
    {
      id: 'example-1-3-3',
      title: 'Hybrid Coordination Workflow',
      code: `#!/bin/bash
# Hybrid workflow voor complete product ontwikkeling

# Fase 1: Centralized Planning
echo "=== Fase 1: Planning ==="
./claude-flow swarm "Plan product roadmap" \\
  --strategy research \\
  --mode centralized \\
  --output json > roadmap.json

# Fase 2: Distributed Research
echo "=== Fase 2: Parallel Research ==="
./claude-flow swarm "Research technologie stack opties" \\
  --strategy research \\
  --mode distributed \\
  --parallel \\
  --max-agents 8

# Fase 3: Hierarchical Development
echo "=== Fase 3: Development ==="
./claude-flow swarm "Implementeer MVP features" \\
  --strategy development \\
  --mode hierarchical \\
  --max-agents 15 \\
  --monitor

# Fase 4: Mesh Testing Network
echo "=== Fase 4: Testing ==="
./claude-flow swarm "Comprehensive testing en QA" \\
  --strategy testing \\
  --mode mesh \\
  --parallel \\
  --output sqlite

# Consolideer resultaten
./claude-flow memory export project_summary.json`,
      language: 'bash'
    }
  ],
  assignments: [
    {
      id: 'assignment-1-3-1',
      title: 'Vergelijk Coordinatiepatronen',
      description: 'Voer dezelfde taak uit met verschillende coordinatiepatronen en analyseer de resultaten.',
      difficulty: 'medium',
      type: 'project',
      initialCode: `// Taak: "Analyseer de belangrijkste nieuwsberichten van vandaag"

// 1. Voer de taak uit met een 'centralized' swarm.
// 2. Voer dezelfde taak uit met een 'distributed' swarm.
// 3. Vergelijk de resultaten op basis van snelheid, volledigheid, en diversiteit van de gevonden berichten.
// 4. Documenteer je bevindingen en geef aan welk patroon beter werkte voor deze taak.
`,
      hints: [
        'Gebruik de `--mode` flag in de `claude-flow swarm` commando.',
        'Let op de communicatie-overhead in de gedistribueerde modus.',
        'Analyseer de logs om te zien hoe de agents samenwerken in elke modus.'
      ]
    },
    {
      id: 'assignment-1-3-2',
      title: 'Ontwerp een Hybrid Workflow',
      description: 'Ontwerp een hybrid workflow voor een complex project naar keuze, combineer minimaal 3 verschillende coordinatiepatronen.',
      difficulty: 'hard',
      type: 'project',
      initialCode: `// Project: Het lanceren van een nieuw product

// 1. Fase 1: Marktonderzoek (welk patroon is hier het beste?)
// 2. Fase 2: Productontwikkeling (welk patroon?)
// 3. Fase 3: Marketing campagne (welk patroon?)

// Documenteer je keuzes en beargumenteer waarom je de verschillende patronen combineert.
`,
      hints: [
        'Denk aan de sterke en zwakke punten van elk coördinatiepatroon.',
        'Gebruik de output van de ene fase als input voor de volgende.',
        'Visualiseer de workflow met een diagram.'
      ]
    }
  ],
  resources: [
    {
      title: 'Claude Flow Coordination Patterns',
      type: 'documentation',
      url: 'https://docs.claude-flow.ai/patterns/coordination'
    },
    {
      title: 'Distributed Systems Fundamentals',
      type: 'article',
      url: 'https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/'
    }
  ]
}