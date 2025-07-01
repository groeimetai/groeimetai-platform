import type { Lesson } from '@/lib/data/courses';

export const lesson1_4: Lesson = {
  id: 'lesson-1-4',
  title: 'Best practices en productiviteit tips',
  duration: '30 min',
  content: `
# Best Practices en Productiviteit Tips voor Claude Code

Master de kunst van efficiënt werken met Claude Code door deze bewezen best practices en productiviteitshacks toe te passen.

## 1. Effective Prompting voor Claude Code

### De STAR Methode
Gebruik de STAR methode voor complexe taken:
- **S**ituatie: Beschrijf de context
- **T**aak: Wat moet er gebeuren
- **A**ctie: Specifieke stappen
- **R**esultaat: Gewenst eindresultaat

### Prompt Templates
\`\`\`
"Analyseer [bestand/directory] en identificeer [specifiek patroon/probleem].
Focus op [aspect] en negeer [irrelevante delen].
Output: [gewenst formaat]"
\`\`\`

### Do's en Don'ts
✅ **DO:**
- Wees specifiek over context en constraints
- Geef voorbeelden van gewenste output
- Vraag om stapsgewijze uitleg
- Gebruik technische termen correct

❌ **DON'T:**
- Vage instructies geven
- Te veel vragen in één prompt
- Context informatie weglaten
- Aannames maken over Claude's kennis

## 2. Keyboard Shortcuts Mastery

### Essential Shortcuts
| Shortcut | Actie | Wanneer gebruiken |
|----------|-------|-------------------|
| \`Cmd/Ctrl + K\` | Open Claude Command Palette | Snel commando's uitvoeren |
| \`Cmd/Ctrl + Shift + P\` | VS Code Command Palette | Editor acties |
| \`Cmd/Ctrl + Shift + E\` | Explorer focus | File navigatie |
| \`Cmd/Ctrl + B\` | Toggle sidebar | Meer schermruimte |
| \`Alt + ↑/↓\` | Move line up/down | Code reorganiseren |
| \`Cmd/Ctrl + D\` | Select next occurrence | Multi-cursor editing |
| \`Cmd/Ctrl + /\` | Toggle comment | Snel code uit/aan |

### Claude-Specific Shortcuts
- \`Cmd/Ctrl + K, C\`: Start Claude chat
- \`Cmd/Ctrl + K, A\`: Analyze current file
- \`Cmd/Ctrl + K, R\`: Refactor selection
- \`Cmd/Ctrl + K, T\`: Generate tests

### Productivity Hack: Custom Keybindings
Maak je eigen shortcuts in VS Code:
\`\`\`json
{
  "key": "ctrl+alt+c",
  "command": "claude.analyzeCodebase",
  "when": "editorTextFocus"
}
\`\`\`

## 3. Workspace Organization

### Project Structuur voor Claude
\`\`\`
project/
├── .claude/
│   ├── commands/      # Custom Claude commands
│   ├── templates/     # Prompt templates
│   └── config.json    # Claude configuratie
├── src/
├── tests/
└── docs/
\`\`\`

### Claude Context Files
Gebruik \`.claude-context\` files voor projectspecifieke info:
\`\`\`yaml
# .claude-context
project_type: "React TypeScript"
conventions:
  - "Use functional components"
  - "Prefer hooks over HOCs"
  - "Follow Airbnb style guide"
ignore_patterns:
  - "node_modules/**"
  - "build/**"
\`\`\`

### Workspace Tips
1. **Gebruik workspaces** voor multi-repo projecten
2. **Pin belangrijke files** in VS Code voor snelle toegang
3. **Maak task runners** voor repetitieve Claude acties
4. **Organiseer terminals** per context (frontend/backend/tests)

## 4. Performance Optimization

### Response Snelheid Verhogen
1. **Beperk context**: Selecteer alleen relevante code
2. **Gebruik ignore patterns**: Sluit build/node_modules uit
3. **Cache responses**: Hergebruik eerdere analyses
4. **Batch operations**: Combineer gerelateerde vragen

### Memory Management
\`\`\`javascript
// Claude memory optimization
const optimizedPrompt = {
  context: "minimal", // alleen essentiële context
  depth: "shallow",   // niet te diep in dependencies
  format: "concise"   // beknopte responses
};
\`\`\`

### Async Workflows
Gebruik async patterns voor betere performance:
\`\`\`typescript
// Parallel Claude operations
const tasks = await Promise.all([
  claude.analyzeFile(file1),
  claude.analyzeFile(file2),
  claude.generateTests(component)
]);
\`\`\`

## 5. Common Pitfalls en Oplossingen

### Pitfall 1: Te Grote Context
**Probleem**: Claude wordt traag of geeft incomplete antwoorden
**Oplossing**: 
- Split grote taken in kleinere delen
- Gebruik file filters en ignore patterns
- Focus op specifieke modules/functies

### Pitfall 2: Vage Instructions
**Probleem**: Claude begrijpt niet wat je wilt
**Oplossing**:
- Gebruik concrete voorbeelden
- Specificeer exact het gewenste formaat
- Geef duidelijke success criteria

### Pitfall 3: Context Switching
**Probleem**: Claude "vergeet" eerdere context
**Oplossing**:
- Gebruik Claude memory features
- Maak summary prompts
- Werk met sessie-gebaseerde contexten

### Pitfall 4: Over-reliance
**Probleem**: Te veel vertrouwen op Claude zonder verificatie
**Oplossing**:
- Always review generated code
- Run tests na elke generatie
- Gebruik Claude als assistent, niet als vervanging

## Pro Tips & Hacks

### 🚀 Speed Hacks
1. **Snippet Library**: Maak Claude snippets voor common patterns
2. **Alias Commands**: Kort lange commando's af
3. **Template Responses**: Hergebruik succesvolle prompt formats
4. **Batch Mode**: Analyseer meerdere files tegelijk

### 🧠 Smart Workflows
1. **Morning Routine**: Start met \`claude analyze --daily-summary\`
2. **Code Review Bot**: Integreer Claude in je PR workflow
3. **Test-First Development**: Laat Claude tests schrijven vóór implementatie
4. **Documentation Generator**: Automatisch docs updaten met Claude

### ⚡ Advanced Techniques
1. **Chain Prompting**: Link multiple Claude responses
2. **Conditional Logic**: Gebruik if-then patterns in prompts
3. **Meta-Programming**: Laat Claude code genereren die code genereert
4. **Custom Analyzers**: Train Claude op je team's patterns

## Checklist voor Optimale Productiviteit

- [ ] Keyboard shortcuts geconfigureerd
- [ ] Custom commands geïnstalleerd
- [ ] Workspace georganiseerd
- [ ] .claude-context file aangemaakt
- [ ] Prompt templates library opgezet
- [ ] Performance settings geoptimaliseerd
- [ ] Common pitfalls checklist doorgenomen
- [ ] Team conventions gedocumenteerd voor Claude

Remember: Claude Code is een tool om je productiviteit te verhogen, niet om je volledig te vervangen. Gebruik het slim, blijf kritisch, en blijf je skills ontwikkelen!
  `,
  codeExamples: [
    {
      id: 'example-1',
      title: 'Effective Prompt Template',
      language: 'javascript',
      code: `// STAR Method Prompt Example
const analyzeCodePrompt = \`
SITUATION: Large React codebase met performance issues
TASK: Identificeer componenten met onnodige re-renders
ACTION: 
1. Scan alle componenten voor missing memo/useMemo
2. Check voor props drilling patterns
3. Identify state lifting opportunities
RESULT: Lijst van componenten met optimalisatie suggesties
\`;

// Usage
await claude.analyze(analyzeCodePrompt, {
  files: 'src/components/**/*.tsx',
  depth: 'moderate',
  outputFormat: 'actionable-list'
});`,
      explanation: 'De STAR methode helpt Claude precies te begrijpen wat je wilt bereiken.'
    },
    {
      id: 'example-2',
      title: 'Custom Keybinding Configuration',
      language: 'json',
      code: `// keybindings.json in VS Code
[
  {
    "key": "ctrl+shift+a",
    "command": "claude.analyzeCurrentFile",
    "when": "editorTextFocus && resourceExtname == .ts"
  },
  {
    "key": "ctrl+shift+t",
    "command": "claude.generateTests",
    "when": "editorTextFocus && editorHasSelection"
  },
  {
    "key": "ctrl+shift+r",
    "command": "claude.refactorSelection",
    "when": "editorHasSelection"
  },
  {
    "key": "ctrl+alt+d",
    "command": "claude.explainCode",
    "when": "editorTextFocus"
  }
]`,
      explanation: 'Custom keybindings maken repetitieve Claude acties supersnel toegankelijk.'
    },
    {
      id: 'example-3',
      title: 'Performance Optimized Workflow',
      language: 'typescript',
      code: `// Optimized Claude workflow for large codebases
class ClaudeOptimizer {
  private cache = new Map<string, any>();
  
  async analyzeWithCache(file: string, options?: AnalyzeOptions) {
    const cacheKey = \`\${file}-\${JSON.stringify(options)}\`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 3600000) { // 1 hour
        return cached.result;
      }
    }
    
    // Optimize context before sending to Claude
    const optimizedContext = await this.minimizeContext(file, options);
    
    // Batch similar operations
    const result = await claude.analyze(optimizedContext, {
      ...options,
      streamResponse: true,
      maxTokens: 2000,
      temperature: 0.3 // More deterministic for caching
    });
    
    // Cache the result
    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });
    
    return result;
  }
  
  private async minimizeContext(file: string, options?: AnalyzeOptions) {
    // Only include relevant imports and dependencies
    const deps = await this.getDirectDependencies(file);
    return {
      targetFile: file,
      dependencies: deps.filter(d => !d.includes('node_modules')),
      ignorePatterns: ['*.test.*', '*.spec.*', '*.d.ts']
    };
  }
}

// Usage for maximum performance
const optimizer = new ClaudeOptimizer();
const results = await Promise.all([
  optimizer.analyzeWithCache('src/components/UserList.tsx'),
  optimizer.analyzeWithCache('src/components/UserDetail.tsx'),
  optimizer.analyzeWithCache('src/hooks/useUser.ts')
]);`,
      explanation: 'Caching en context optimalisatie verhogen de snelheid drastisch bij grote projecten.'
    },
    {
      id: 'example-4',
      title: 'Smart Workspace Configuration',
      language: 'yaml',
      code: `# .claude/config.yaml
workspace:
  name: "E-commerce Platform"
  type: "monorepo"
  
contexts:
  frontend:
    root: "./packages/web"
    language: "typescript"
    framework: "next.js"
    conventions:
      - "Use server components by default"
      - "Client components only when needed"
      - "Tailwind for styling"
    
  backend:
    root: "./packages/api"
    language: "typescript"
    framework: "nest.js"
    conventions:
      - "Use dependency injection"
      - "Follow SOLID principles"
      - "PostgreSQL with TypeORM"
    
  shared:
    root: "./packages/shared"
    purpose: "Shared types and utilities"

analyze_defaults:
  ignore_patterns:
    - "**/node_modules/**"
    - "**/dist/**"
    - "**/.next/**"
    - "**/*.test.ts"
  
  include_patterns:
    - "src/**/*.ts"
    - "src/**/*.tsx"
  
  max_depth: 3
  context_window: "focused"

shortcuts:
  dbg: "analyze --debug --verbose"
  perf: "analyze --performance --suggestions"
  sec: "analyze --security --owasp"
  clean: "refactor --clean-code --solid"`,
      explanation: 'Een goed geconfigureerde workspace bespaart tijd en voorkomt fouten.'
    }
  ],
  assignments: [
    {
      id: 'assignment-1-4',
      title: 'Optimaliseer je Claude Workflow',
      description: 'Creëer een gepersonaliseerde Claude Code setup die je productiviteit maximaliseert.',
      difficulty: 'medium',
      type: 'project',
      initialCode: `// Assignment: Create your optimized Claude workflow
// 
// 1. Maak een .claude directory in je project
// 2. Configureer custom keybindings
// 3. Schrijf 3 prompt templates voor veel voorkomende taken
// 4. Implementeer een performance optimization
// 5. Documenteer je workflow

// Start hier met je configuratie:
const myClaudeSetup = {
  // TODO: Add your configuration
};`,
      solution: `// Optimized Claude Workflow Solution
import { ClaudeConfig, PromptTemplate } from '@claude/types';

// 1. Claude Configuration
const claudeConfig: ClaudeConfig = {
  workspace: {
    name: "My Optimized Setup",
    contexts: {
      development: {
        root: "./src",
        conventions: [
          "TypeScript strict mode",
          "ESLint + Prettier",
          "Jest for testing"
        ]
      }
    }
  },
  performance: {
    cacheEnabled: true,
    cacheDuration: 3600,
    maxContextSize: 5000,
    batchOperations: true
  }
};

// 2. Prompt Templates
const promptTemplates: Record<string, PromptTemplate> = {
  codeReview: {
    name: "Code Review Assistant",
    template: \`
      Review this {language} code for:
      1. Best practices violations
      2. Performance issues
      3. Security concerns
      4. Maintainability
      
      Code: {code}
      
      Output format: Markdown with severity levels
    \`
  },
  
  testGeneration: {
    name: "Test Generator",
    template: \`
      Generate comprehensive tests for: {component}
      
      Requirements:
      - Unit tests with Jest
      - Edge cases coverage
      - Mocking external dependencies
      - Clear test descriptions
      
      Style: {testStyle}
    \`
  },
  
  refactoring: {
    name: "Smart Refactoring",
    template: \`
      Refactor this code following:
      - SOLID principles
      - DRY principle
      - Current file conventions
      
      Focus on: {focusArea}
      Preserve: {preserveBehavior}
    \`
  }
};

// 3. Keybindings (save to keybindings.json)
const customKeybindings = [
  {
    key: "cmd+k cmd+r",
    command: "claude.codeReview",
    args: { template: "codeReview" }
  },
  {
    key: "cmd+k cmd+t", 
    command: "claude.generateTests",
    args: { template: "testGeneration" }
  },
  {
    key: "cmd+k cmd+f",
    command: "claude.refactor",
    args: { template: "refactoring" }
  }
];

// 4. Performance Optimizer
class ClaudeWorkflowOptimizer {
  private requestQueue: Array<() => Promise<any>> = [];
  private processing = false;
  
  async queueOperation<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }
  
  private async processQueue() {
    if (this.processing || this.requestQueue.length === 0) return;
    
    this.processing = true;
    const batch = this.requestQueue.splice(0, 3); // Process 3 at a time
    
    await Promise.all(batch.map(op => op()));
    
    this.processing = false;
    
    // Continue processing if more in queue
    if (this.requestQueue.length > 0) {
      setTimeout(() => this.processQueue(), 100);
    }
  }
}

// 5. Workflow Documentation
const workflowDocs = \`
# My Optimized Claude Code Workflow

## Quick Start
1. Use Cmd+K, Cmd+R for instant code reviews
2. Use Cmd+K, Cmd+T to generate tests for selected code  
3. Use Cmd+K, Cmd+F for smart refactoring

## Performance Tips
- Batch operations are automatically queued
- Cache is enabled for 1 hour
- Context is limited to 5000 tokens for speed

## Custom Templates
Access via command palette:
- "Claude: Code Review" - Comprehensive code analysis
- "Claude: Generate Tests" - Smart test generation
- "Claude: Refactor" - SOLID-based refactoring
\`;

// Export configuration
export default {
  config: claudeConfig,
  templates: promptTemplates,
  keybindings: customKeybindings,
  optimizer: new ClaudeWorkflowOptimizer(),
  documentation: workflowDocs
};`,
      hints: [
        'Begin met het identificeren van je meest gebruikte Claude acties',
        'Test verschillende keybinding combinaties voor ergonomie',
        'Gebruik template variables voor herbruikbare prompts',
        'Monitor Claude response times om bottlenecks te vinden'
      ]
    }
  ],
  resources: [
    {
      title: 'Claude Code Performance Guide',
      url: 'https://claude.ai/docs/performance',
      type: 'guide'
    },
    {
      title: 'VS Code Keyboard Shortcuts PDF',
      url: 'https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf',
      type: 'documentation'
    },
    {
      title: 'Effective Prompting for AI Assistants',
      url: 'https://www.anthropic.com/prompting-guide',
      type: 'article'
    }
  ]
};