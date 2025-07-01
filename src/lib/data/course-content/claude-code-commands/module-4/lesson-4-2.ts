import type { Lesson } from '@/lib/data/courses';

export const lesson4_2: Lesson = {
  id: 'lesson-4-2',
  title: 'Workbench configuratie en optimalisatie',
  duration: '35 min',
  content: `
# Workbench Configuratie en Optimalisatie

Leer hoe je Claude Code Workbench volledig naar jouw hand zet voor maximale productiviteit en een optimale development experience.

## Workbench Layout Customization

### Layout Presets
Claude Code Workbench biedt verschillende voorgedefinieerde layouts voor verschillende workflows:

\`\`\`bash
# Bekijk beschikbare layouts
claude workbench layouts

# Activeer een specifieke layout
claude workbench layout --preset focused
claude workbench layout --preset multi-monitor
claude workbench layout --preset minimal
claude workbench layout --preset debugging
\`\`\`

### Custom Layout Configuratie
Creëer je eigen perfecte werkruimte:

\`\`\`json
// .claude/workbench.config.json
{
  "layout": {
    "panels": {
      "explorer": {
        "position": "left",
        "width": 250,
        "visible": true,
        "collapsed": false
      },
      "terminal": {
        "position": "bottom",
        "height": 300,
        "split": "horizontal",
        "tabs": ["main", "logs", "output"]
      },
      "claude-chat": {
        "position": "right",
        "width": 400,
        "pinned": true,
        "transparency": 0.95
      },
      "preview": {
        "position": "center-right",
        "autoRefresh": true,
        "theme": "dark"
      }
    },
    "grid": {
      "columns": 12,
      "rows": 8,
      "gutterSize": 4
    }
  }
}
\`\`\`

### Advanced Panel Management
\`\`\`bash
# Panel operaties
claude workbench panel create --name "custom-tools" --position right
claude workbench panel resize --name terminal --height 400
claude workbench panel float --name preview
claude workbench panel dock --name preview --position center

# Saved layouts
claude workbench save-layout --name "backend-development"
claude workbench load-layout --name "frontend-design"
claude workbench export-layout > my-layout.json
\`\`\`

## Theme en Appearance Settings

### Theme Installatie en Configuratie
\`\`\`bash
# Bekijk geïnstalleerde themes
claude theme list

# Installeer themes uit de gallery
claude theme install night-owl
claude theme install dracula-pro
claude theme install github-dark

# Activeer een theme
claude theme set night-owl

# Custom theme timing
claude theme schedule --light "github-light" --dark "night-owl" --auto
\`\`\`

### Custom Theme Development
Maak je eigen Claude Code theme:

\`\`\`json
// .claude/themes/my-custom-theme.json
{
  "name": "My Custom Theme",
  "type": "dark",
  "colors": {
    "editor.background": "#1e1e1e",
    "editor.foreground": "#d4d4d4",
    "claude.chat.background": "#252526",
    "claude.chat.userMessage": "#007acc",
    "claude.chat.aiMessage": "#4ec9b0",
    "terminal.background": "#1e1e1e",
    "statusBar.background": "#007acc",
    "sidebar.background": "#252526"
  },
  "tokenColors": [
    {
      "scope": ["comment", "punctuation.definition.comment"],
      "settings": {
        "foreground": "#6A9955",
        "fontStyle": "italic"
      }
    },
    {
      "scope": ["keyword", "storage.type"],
      "settings": {
        "foreground": "#569cd6"
      }
    }
  ],
  "claude": {
    "syntax": {
      "highlightActiveContext": true,
      "contextIndicatorColor": "#007acc",
      "suggestionHighlight": "#ffd700"
    }
  }
}
\`\`\`

### UI Customization
\`\`\`bash
# Font settings
claude config set editor.fontFamily "JetBrains Mono"
claude config set editor.fontSize 14
claude config set editor.lineHeight 1.6
claude config set terminal.fontSize 13

# UI density
claude config set workbench.density compact
claude config set workbench.sideBar.width 220
claude config set workbench.activityBar.visible false

# Animations en effects
claude config set workbench.animations true
claude config set workbench.smoothScrolling true
claude config set claude.chat.typewriterEffect false
\`\`\`

## Extension Integration

### Essential Extensions voor Claude Code
\`\`\`bash
# Claude Code Extension Pack
claude ext install claude-essentials

# Individual extensions
claude ext install claude-snippets
claude ext install claude-refactor
claude ext install claude-test-generator
claude ext install claude-doc-writer
claude ext install claude-code-review
\`\`\`

### Extension Configuratie
\`\`\`json
// .claude/extensions.config.json
{
  "extensions": {
    "claude-snippets": {
      "autoSuggest": true,
      "contextAware": true,
      "language": "nl",
      "customSnippetsPath": "./snippets"
    },
    "claude-refactor": {
      "autoDetectCodeSmells": true,
      "suggestRefactoring": true,
      "preserveComments": true
    },
    "claude-test-generator": {
      "framework": "jest",
      "coverage": 80,
      "mockStrategy": "auto",
      "testLocation": "adjacent"
    }
  },
  "autoUpdate": true,
  "checkUpdatesOnStartup": true
}
\`\`\`

### Custom Extension Development
\`\`\`typescript
// claude-extension-template/index.ts
import { ClaudeExtension, ExtensionContext } from '@claude/extension-api';

export class MyCustomExtension implements ClaudeExtension {
  activate(context: ExtensionContext) {
    // Register custom commands
    context.registerCommand('myext.customAction', async () => {
      const claude = context.claude;
      const result = await claude.ask('Generate optimized function');
      context.showOutput(result);
    });

    // Add custom UI elements
    context.ui.addStatusBarItem({
      text: '$(rocket) Claude Ready',
      command: 'myext.showMenu',
      tooltip: 'Custom Claude Actions'
    });

    // Hook into Claude events
    context.claude.onResponse((response) => {
      // Post-process Claude responses
      return this.enhanceResponse(response);
    });
  }

  private enhanceResponse(response: string): string {
    // Add custom formatting or validation
    return response;
  }
}
\`\`\`

## Performance Tuning

### Memory Optimization
\`\`\`bash
# Memory settings
claude config set performance.maxMemory 4096
claude config set performance.cacheSize 2048
claude config set performance.enableGC true

# Context window optimization
claude config set claude.contextWindow.max 100000
claude config set claude.contextWindow.strategy "sliding"
claude config set claude.contextWindow.compression true
\`\`\`

### Response Time Optimization
\`\`\`json
// .claude/performance.config.json
{
  "performance": {
    "streaming": {
      "enabled": true,
      "chunkSize": 1024,
      "bufferSize": 4096
    },
    "caching": {
      "responses": true,
      "ttl": 3600,
      "maxSize": "500MB",
      "strategy": "lru"
    },
    "indexing": {
      "enabled": true,
      "incremental": true,
      "threads": 4,
      "excludePatterns": ["node_modules", "dist", "*.log"]
    },
    "network": {
      "timeout": 30000,
      "retries": 3,
      "compression": "gzip"
    }
  }
}
\`\`\`

### Profiling en Monitoring
\`\`\`bash
# Enable performance profiling
claude perf start --detailed

# Monitor resource usage
claude perf monitor --interval 1000

# Generate performance report
claude perf report --format html > performance-report.html

# Analyze bottlenecks
claude perf analyze --threshold 100ms
\`\`\`

## Multi-Project Setups

### Workspace Configuratie
\`\`\`json
// claude.workspace.json
{
  "folders": [
    {
      "name": "frontend",
      "path": "./apps/web",
      "settings": {
        "claude.model": "claude-3-opus",
        "claude.language": "typescript",
        "claude.framework": "react"
      }
    },
    {
      "name": "backend",
      "path": "./apps/api",
      "settings": {
        "claude.model": "claude-3-sonnet",
        "claude.language": "python",
        "claude.framework": "fastapi"
      }
    },
    {
      "name": "shared",
      "path": "./packages/shared",
      "settings": {
        "claude.contextPriority": "high"
      }
    }
  ],
  "settings": {
    "claude.workspace.syncSettings": false,
    "claude.workspace.sharedContext": true
  }
}
\`\`\`

### Project Switching en Context
\`\`\`bash
# Quick project switching
claude project switch frontend
claude project switch backend

# Multi-project commands
claude analyze --all-projects
claude refactor --projects frontend,shared
claude test --workspace

# Context management
claude context add ./packages/shared --priority high
claude context link frontend backend --through shared
\`\`\`

### Monorepo Optimization
\`\`\`typescript
// .claude/monorepo.config.ts
export default {
  monorepo: {
    type: 'pnpm', // or 'yarn', 'npm', 'lerna'
    packages: {
      pattern: 'apps/*',
      shared: 'packages/*'
    },
    claude: {
      contextStrategy: 'smart', // 'full', 'minimal', 'smart'
      crossProjectAnalysis: true,
      sharedTypes: {
        location: 'packages/types',
        autoImport: true
      }
    },
    performance: {
      parallelAnalysis: true,
      incrementalIndexing: true,
      cacheStrategy: 'aggressive'
    }
  }
};
\`\`\`

### Advanced Project Templates
\`\`\`bash
# Create project from template
claude create project --template enterprise-fullstack
claude create project --template microservices --preset kubernetes

# Custom template definition
cat > .claude/templates/my-stack.json << EOF
{
  "name": "my-custom-stack",
  "projects": [
    {
      "type": "frontend",
      "framework": "next.js",
      "path": "apps/web",
      "dependencies": ["shared-types", "ui-components"]
    },
    {
      "type": "backend",
      "framework": "nest.js",
      "path": "apps/api",
      "dependencies": ["shared-types", "database"]
    }
  ],
  "claude": {
    "workspaceSettings": "inherit",
    "defaultModel": "claude-3-opus",
    "autoSetup": true
  }
}
EOF
\`\`\`
        `,
  codeExamples: [
    {
      id: 'workbench-advanced-config',
      title: 'Geavanceerde Workbench Configuratie',
      language: 'typescript',
      code: `// .claude/workbench.advanced.ts
import { WorkbenchConfig, PanelLayout, ThemeSchedule } from '@claude/types';

export const advancedConfig: WorkbenchConfig = {
  // Dynamic layout based on project type
  layouts: {
    'frontend': {
      panels: {
        explorer: { width: 200, position: 'left' },
        preview: { width: '40%', position: 'right', autoRefresh: true },
        claude: { height: 300, position: 'bottom', tabbed: true }
      }
    },
    'backend': {
      panels: {
        explorer: { width: 250, position: 'left' },
        terminal: { height: 400, position: 'bottom', split: 2 },
        claude: { width: 350, position: 'right', floating: false }
      }
    },
    'fullstack': {
      panels: {
        explorer: { width: 200, position: 'left' },
        preview: { width: '30%', position: 'right' },
        terminal: { height: 250, position: 'bottom' },
        claude: { width: 300, position: 'right', docked: 'preview' }
      }
    }
  },

  // Intelligent theme switching
  themes: {
    schedule: {
      mode: 'auto', // 'auto', 'manual', 'location'
      light: {
        theme: 'github-light',
        hours: { start: 9, end: 17 }
      },
      dark: {
        theme: 'night-owl',
        hours: { start: 17, end: 9 }
      }
    },
    overrides: {
      'focus-mode': {
        theme: 'zen-dark',
        triggers: ['claude focus', 'workbench zen']
      }
    }
  },

  // Performance profiles
  performance: {
    profiles: {
      'power-saver': {
        maxMemory: 2048,
        indexing: 'lazy',
        streaming: { chunkSize: 512 },
        animations: false
      },
      'balanced': {
        maxMemory: 4096,
        indexing: 'incremental',
        streaming: { chunkSize: 1024 },
        animations: true
      },
      'performance': {
        maxMemory: 8192,
        indexing: 'aggressive',
        streaming: { chunkSize: 2048 },
        animations: true,
        gpu: true
      }
    },
    autoSwitch: {
      enabled: true,
      battery: { threshold: 20, profile: 'power-saver' },
      cpu: { threshold: 80, profile: 'balanced' }
    }
  },

  // Multi-project orchestration
  orchestration: {
    projects: {
      sync: {
        settings: false,
        commands: true,
        snippets: true
      },
      context: {
        sharing: 'smart', // 'none', 'all', 'smart'
        priority: ['shared', 'current', 'related'],
        maxTokens: 100000
      }
    },
    workflows: {
      'full-stack-development': {
        layout: 'fullstack',
        commands: ['frontend:dev', 'backend:dev', 'shared:watch'],
        autoStart: true
      }
    }
  }
};

// Extension integration
export const extensionIntegration = {
  'claude-snippets': {
    providers: ['project', 'workspace', 'global'],
    contextAware: true,
    ai: {
      suggest: true,
      generate: true,
      improve: true
    }
  },
  'claude-refactor': {
    rules: 'custom',
    configPath: './refactor-rules.json',
    autoFix: false,
    preview: true
  },
  'claude-test': {
    frameworks: {
      frontend: 'jest',
      backend: 'pytest',
      e2e: 'playwright'
    },
    coverage: {
      threshold: 80,
      enforce: true
    }
  }
};`,
      explanation: 'Geavanceerde configuratie die dynamic layouts, intelligent theme switching, performance profiles en multi-project orchestration combineert voor een optimale development experience.'
    },
    {
      id: 'performance-monitoring',
      title: 'Performance Monitoring Dashboard',
      language: 'typescript',
      code: `// .claude/scripts/performance-monitor.ts
import { ClaudeAPI, PerformanceMetrics } from '@claude/sdk';
import { Chart } from 'chart.js';
import * as blessed from 'blessed';

class PerformanceMonitor {
  private claude: ClaudeAPI;
  private metrics: PerformanceMetrics[] = [];
  private screen: blessed.Widgets.Screen;

  constructor() {
    this.claude = new ClaudeAPI();
    this.initializeUI();
    this.startMonitoring();
  }

  private initializeUI() {
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Claude Performance Monitor'
    });

    // CPU usage chart
    const cpuBox = blessed.box({
      top: 0,
      left: 0,
      width: '50%',
      height: '50%',
      label: ' CPU Usage ',
      border: { type: 'line' },
      style: { border: { fg: 'cyan' } }
    });

    // Memory usage chart
    const memBox = blessed.box({
      top: 0,
      left: '50%',
      width: '50%',
      height: '50%',
      label: ' Memory Usage ',
      border: { type: 'line' },
      style: { border: { fg: 'green' } }
    });

    // Response time graph
    const responseBox = blessed.box({
      top: '50%',
      left: 0,
      width: '50%',
      height: '50%',
      label: ' Response Times ',
      border: { type: 'line' },
      style: { border: { fg: 'yellow' } }
    });

    // Active operations
    const opsBox = blessed.list({
      top: '50%',
      left: '50%',
      width: '50%',
      height: '50%',
      label: ' Active Operations ',
      border: { type: 'line' },
      style: { 
        border: { fg: 'magenta' },
        selected: { bg: 'blue' }
      },
      mouse: true,
      keys: true
    });

    this.screen.append(cpuBox);
    this.screen.append(memBox);
    this.screen.append(responseBox);
    this.screen.append(opsBox);

    // Hotkeys
    this.screen.key(['escape', 'q', 'C-c'], () => process.exit(0));
    this.screen.key(['r'], () => this.resetMetrics());
    this.screen.key(['s'], () => this.saveReport());
  }

  private async startMonitoring() {
    setInterval(async () => {
      const metrics = await this.claude.performance.getMetrics();
      this.metrics.push(metrics);
      this.updateDisplay(metrics);
    }, 1000);
  }

  private updateDisplay(metrics: PerformanceMetrics) {
    // Update UI components with new metrics
    this.screen.render();
  }

  private resetMetrics() {
    this.metrics = [];
    this.claude.performance.reset();
  }

  private async saveReport() {
    const report = await this.claude.performance.generateReport({
      metrics: this.metrics,
      format: 'html',
      includeRecommendations: true
    });
    
    await fs.writeFile('performance-report.html', report);
    this.screen.log('Report saved to performance-report.html');
  }
}

// Performance optimization recommendations
export async function analyzeAndOptimize() {
  const claude = new ClaudeAPI();
  const analysis = await claude.performance.analyze();

  if (analysis.bottlenecks.length > 0) {
    console.log('Found performance bottlenecks:');
    
    for (const bottleneck of analysis.bottlenecks) {
      console.log(\`- \${bottleneck.component}: \${bottleneck.impact}\`);
      
      // Apply automatic optimizations
      if (bottleneck.autoFix) {
        await claude.performance.optimize(bottleneck.component);
      }
    }
  }

  // Generate optimization config
  const optimizedConfig = await claude.performance.generateOptimalConfig({
    hardware: await claude.system.getHardware(),
    workload: analysis.workloadProfile,
    preferences: {
      responseTime: 'fast',
      memoryUsage: 'balanced',
      cpuUsage: 'efficient'
    }
  });

  return optimizedConfig;
}`,
      explanation: 'Uitgebreide performance monitoring tool die real-time metrics visualiseert en automatische optimalisatie aanbevelingen genereert.'
    },
    {
      id: 'multi-project-orchestrator',
      title: 'Multi-Project Orchestrator',
      language: 'typescript',
      code: `// .claude/orchestrator/multi-project.ts
import { ClaudeOrchestrator, Project, WorkspaceConfig } from '@claude/orchestrator';
import { EventEmitter } from 'events';

interface ProjectDependency {
  from: string;
  to: string;
  type: 'build' | 'runtime' | 'dev';
}

class MultiProjectOrchestrator extends EventEmitter {
  private orchestrator: ClaudeOrchestrator;
  private projects: Map<string, Project> = new Map();
  private dependencies: ProjectDependency[] = [];

  constructor(private workspace: WorkspaceConfig) {
    super();
    this.orchestrator = new ClaudeOrchestrator(workspace);
    this.initializeProjects();
  }

  private async initializeProjects() {
    // Discover all projects in workspace
    const discovered = await this.orchestrator.discover({
      patterns: ['apps/*', 'packages/*', 'services/*'],
      configFiles: ['package.json', 'claude.json', 'pyproject.toml']
    });

    // Initialize each project with appropriate settings
    for (const projectPath of discovered) {
      const project = await this.createProject(projectPath);
      this.projects.set(project.name, project);
    }

    // Analyze dependencies
    await this.analyzeDependencies();
  }

  private async createProject(path: string): Promise<Project> {
    const config = await this.loadProjectConfig(path);
    
    return {
      name: config.name,
      path: path,
      type: this.detectProjectType(path),
      language: config.language || 'typescript',
      framework: config.framework,
      claudeSettings: {
        model: this.selectOptimalModel(config),
        contextStrategy: config.contextStrategy || 'smart',
        maxTokens: config.maxTokens || 50000
      },
      scripts: config.scripts || {},
      dependencies: config.dependencies || {}
    };
  }

  private selectOptimalModel(config: any): string {
    // Smart model selection based on project complexity
    if (config.complexity === 'high' || config.loc > 50000) {
      return 'claude-3-opus';
    } else if (config.type === 'frontend') {
      return 'claude-3-sonnet';
    } else {
      return 'claude-3-haiku';
    }
  }

  private async analyzeDependencies() {
    // Build dependency graph
    for (const [name, project] of this.projects) {
      const deps = await this.orchestrator.analyzeDependencies(project);
      
      for (const dep of deps) {
        if (this.projects.has(dep.name)) {
          this.dependencies.push({
            from: name,
            to: dep.name,
            type: dep.type
          });
        }
      }
    }

    // Detect circular dependencies
    const circular = this.detectCircularDependencies();
    if (circular.length > 0) {
      this.emit('warning', { 
        type: 'circular-dependency', 
        projects: circular 
      });
    }
  }

  async executeCommand(command: string, options: any = {}) {
    const { projects = 'all', parallel = true, watch = false } = options;

    // Determine which projects to run
    const targetProjects = projects === 'all' 
      ? Array.from(this.projects.values())
      : projects.split(',').map(p => this.projects.get(p)).filter(Boolean);

    // Sort by dependency order
    const sorted = this.topologicalSort(targetProjects);

    if (parallel && this.canRunParallel(sorted, command)) {
      await this.runParallel(sorted, command);
    } else {
      await this.runSequential(sorted, command);
    }

    if (watch) {
      this.setupWatchers(sorted, command);
    }
  }

  private async runParallel(projects: Project[], command: string) {
    const groups = this.groupByDependencyLevel(projects);
    
    for (const group of groups) {
      await Promise.all(
        group.map(project => this.runProjectCommand(project, command))
      );
    }
  }

  private async runProjectCommand(project: Project, command: string) {
    this.emit('command:start', { project: project.name, command });

    try {
      // Set Claude context for this project
      await this.orchestrator.setContext(project);

      // Execute command with Claude assistance
      const result = await this.orchestrator.execute(command, {
        cwd: project.path,
        env: this.getProjectEnv(project),
        claudeAssist: true
      });

      this.emit('command:success', { 
        project: project.name, 
        command, 
        result 
      });

      return result;
    } catch (error) {
      this.emit('command:error', { 
        project: project.name, 
        command, 
        error 
      });
      throw error;
    }
  }

  // Advanced workspace synchronization
  async synchronize(options: any = {}) {
    const { 
      syncTypes = true, 
      syncConfigs = true, 
      syncDependencies = true 
    } = options;

    if (syncTypes) {
      await this.synchronizeTypes();
    }

    if (syncConfigs) {
      await this.synchronizeConfigs();
    }

    if (syncDependencies) {
      await this.synchronizeDependencies();
    }
  }

  private async synchronizeTypes() {
    // Find all shared type definitions
    const sharedTypes = await this.orchestrator.findSharedTypes();

    // Generate type sync configuration
    const syncConfig = {
      sources: sharedTypes.map(t => t.path),
      targets: Array.from(this.projects.values())
        .filter(p => p.language === 'typescript')
        .map(p => ({
          project: p.name,
          path: \`\${p.path}/src/types/shared\`
        }))
    };

    // Apply synchronization
    await this.orchestrator.syncTypes(syncConfig);
  }
}

// Usage example
export async function setupMultiProjectWorkspace() {
  const workspace = {
    root: process.cwd(),
    config: '.claude/workspace.json'
  };

  const orchestrator = new MultiProjectOrchestrator(workspace);

  // Set up event handlers
  orchestrator.on('command:start', ({ project, command }) => {
    console.log(\`[\${project}] Starting: \${command}\`);
  });

  orchestrator.on('command:error', ({ project, error }) => {
    console.error(\`[\${project}] Error: \${error.message}\`);
  });

  // Execute commands across projects
  await orchestrator.executeCommand('build', { 
    parallel: true 
  });

  await orchestrator.executeCommand('test', { 
    projects: 'frontend,backend',
    watch: true 
  });

  // Synchronize workspace
  await orchestrator.synchronize({
    syncTypes: true,
    syncConfigs: true
  });

  return orchestrator;
}`,
      explanation: 'Geavanceerde multi-project orchestrator die dependency management, parallel execution, en intelligent workspace synchronization biedt voor complexe monorepo setups.'
    }
  ],
  assignments: [
    {
      id: 'assignment-4-2-1',
      title: 'Optimaliseer je Workbench Setup',
      description: 'Creëer een volledig gecustomiseerde Claude Code Workbench configuratie die perfect aansluit bij jouw workflow. Implementeer dynamic layouts, theme switching, en performance optimalisaties.',
      difficulty: 'hard' as const,
      type: 'project' as const,
      initialCode: `// Opdracht: Bouw een complete workbench configuratie
// 
// Requirements:
// 1. Maak minimaal 3 verschillende layout presets (frontend, backend, fullstack)
// 2. Implementeer automatic theme switching op basis van tijd
// 3. Configureer extensions voor jouw tech stack
// 4. Optimaliseer performance settings
// 5. Setup multi-project ondersteuning

// Start hier met je configuratie:
export const myWorkbenchConfig = {
  // Layout configuratie
  layouts: {
    // TODO: Definieer je layouts
  },
  
  // Theme configuratie
  themes: {
    // TODO: Setup theme switching
  },
  
  // Extension integratie
  extensions: {
    // TODO: Configureer extensions
  },
  
  // Performance tuning
  performance: {
    // TODO: Optimaliseer settings
  },
  
  // Multi-project setup
  projects: {
    // TODO: Configureer workspace
  }
};

// Implementeer een setup functie
export async function setupWorkbench() {
  // TODO: Implementeer workbench initialisatie
}

// Bonus: Maak een performance monitor
export class WorkbenchMonitor {
  // TODO: Implementeer monitoring
}`,
      solution: `// Complete workbench configuratie oplossing
import { WorkbenchConfig, ThemeSchedule, PerformanceProfile } from '@claude/types';
import * as os from 'os';

export const myWorkbenchConfig: WorkbenchConfig = {
  // Dynamic layouts voor verschillende workflows
  layouts: {
    frontend: {
      name: 'Frontend Development',
      panels: {
        explorer: { 
          position: 'left', 
          width: 220, 
          collapsible: true 
        },
        preview: { 
          position: 'right', 
          width: '45%', 
          autoRefresh: true,
          splitView: true 
        },
        terminal: { 
          position: 'bottom', 
          height: 200, 
          tabs: ['dev', 'test', 'build'] 
        },
        claude: { 
          position: 'right-bottom', 
          width: 350, 
          height: 400,
          transparency: 0.95 
        }
      },
      shortcuts: {
        'cmd+shift+p': 'preview.toggle',
        'cmd+shift+r': 'preview.refresh',
        'cmd+\`': 'terminal.focus'
      }
    },
    backend: {
      name: 'Backend Development',
      panels: {
        explorer: { 
          position: 'left', 
          width: 250 
        },
        terminal: { 
          position: 'bottom', 
          height: 350, 
          split: 'vertical',
          tabs: ['server', 'database', 'logs', 'test'] 
        },
        claude: { 
          position: 'right', 
          width: 400,
          tabs: ['chat', 'analysis', 'docs'] 
        },
        debug: { 
          position: 'left-bottom', 
          height: 300,
          autoHide: true 
        }
      }
    },
    fullstack: {
      name: 'Fullstack Development',
      panels: {
        explorer: { 
          position: 'left', 
          width: 200,
          showGitStatus: true 
        },
        preview: { 
          position: 'center-right', 
          width: '35%' 
        },
        terminal: { 
          position: 'bottom', 
          height: 250,
          tabs: ['frontend', 'backend', 'shared', 'docker'] 
        },
        claude: { 
          position: 'right', 
          width: 300,
          floating: true,
          opacity: 0.9 
        }
      },
      autoArrange: true
    }
  },
  
  // Intelligent theme switching met context awareness
  themes: {
    schedule: {
      enabled: true,
      mode: 'smart', // tijd + ambient light sensor
      transitions: {
        duration: 500,
        easing: 'ease-in-out'
      },
      rules: [
        {
          name: 'morning',
          theme: 'github-light',
          time: { start: '06:00', end: '09:00' },
          brightness: { min: 0.9, max: 1.0 }
        },
        {
          name: 'day',
          theme: 'one-light',
          time: { start: '09:00', end: '17:00' },
          brightness: { min: 0.85, max: 0.95 }
        },
        {
          name: 'evening',
          theme: 'monokai-pro',
          time: { start: '17:00', end: '20:00' },
          brightness: { min: 0.7, max: 0.85 }
        },
        {
          name: 'night',
          theme: 'night-owl',
          time: { start: '20:00', end: '06:00' },
          brightness: { min: 0.6, max: 0.75 },
          blueLight: { filter: true, strength: 0.3 }
        }
      ],
      overrides: {
        presentation: 'github-light',
        focus: 'zen-dark',
        debugging: 'dracula'
      }
    },
    customTheme: {
      name: 'My Optimal Theme',
      extends: 'night-owl',
      colors: {
        'editor.background': '#011627',
        'claude.chat.background': '#01121f',
        'claude.suggestion.background': '#0e293f',
        'terminal.background': '#010e1a'
      }
    }
  },
  
  // Extension ecosystem configuratie
  extensions: {
    core: [
      {
        id: 'claude-snippets',
        config: {
          autoSuggest: true,
          contextAware: true,
          learningMode: true,
          customSnippetsPath: './snippets',
          shareSnippets: true
        }
      },
      {
        id: 'claude-refactor',
        config: {
          autoDetect: true,
          codeSmells: ['long-method', 'duplicate', 'complex-conditional'],
          autoFix: false,
          preview: true
        }
      },
      {
        id: 'claude-test-generator',
        config: {
          frameworks: {
            javascript: 'jest',
            python: 'pytest',
            go: 'testing'
          },
          coverage: { target: 85, enforce: false },
          mockGeneration: true
        }
      }
    ],
    language: {
      typescript: ['claude-ts-helper', 'claude-type-generator'],
      python: ['claude-py-assistant', 'claude-django-helper'],
      react: ['claude-react-helper', 'claude-hooks-analyzer']
    },
    project: {
      git: ['claude-git-helper', 'claude-pr-assistant'],
      docker: ['claude-docker-helper', 'claude-compose-generator'],
      ci: ['claude-ci-helper', 'claude-github-actions']
    }
  },
  
  // Geavanceerde performance optimalisatie
  performance: {
    profiles: {
      development: {
        name: 'Development Mode',
        memory: {
          max: Math.floor(os.totalmem() * 0.5), // 50% of system RAM
          cache: 2048,
          gcInterval: 60000
        },
        cpu: {
          maxThreads: os.cpus().length - 2,
          priority: 'normal'
        },
        indexing: {
          strategy: 'incremental',
          threads: 4,
          exclude: ['node_modules', 'dist', '.git', '*.log'],
          refreshInterval: 30000
        },
        claude: {
          streaming: true,
          chunkSize: 2048,
          contextCompression: true,
          responseCache: true
        }
      },
      presentation: {
        name: 'Presentation Mode',
        memory: { max: 2048, cache: 512 },
        cpu: { maxThreads: 2, priority: 'low' },
        animations: false,
        claude: { streaming: false }
      },
      power: {
        name: 'Maximum Performance',
        memory: { max: Math.floor(os.totalmem() * 0.8) },
        cpu: { maxThreads: os.cpus().length, priority: 'high' },
        gpu: { enabled: true, acceleration: 'full' },
        indexing: { strategy: 'aggressive', threads: 8 },
        claude: { 
          model: 'claude-3-opus',
          parallelRequests: 3,
          prefetch: true 
        }
      }
    },
    autoSwitch: {
      rules: [
        { condition: 'battery < 20%', profile: 'battery-saver' },
        { condition: 'cpu > 80%', profile: 'balanced' },
        { condition: 'memory > 90%', profile: 'low-memory' }
      ]
    },
    monitoring: {
      enabled: true,
      interval: 5000,
      metrics: ['cpu', 'memory', 'response-time', 'token-usage'],
      alerts: {
        cpu: { threshold: 90, action: 'notify' },
        memory: { threshold: 85, action: 'gc' },
        responseTime: { threshold: 5000, action: 'optimize' }
      }
    }
  },
  
  // Multi-project workspace configuratie
  projects: {
    workspace: {
      type: 'monorepo',
      root: process.cwd(),
      structure: {
        apps: 'apps/*',
        packages: 'packages/*',
        services: 'services/*',
        tools: 'tools/*'
      }
    },
    synchronization: {
      settings: {
        strategy: 'inherit-override',
        exclude: ['local', 'personal']
      },
      dependencies: {
        autoLink: true,
        sharedTypes: true,
        versionSync: true
      },
      commands: {
        shared: ['build', 'test', 'lint', 'format'],
        parallel: ['dev', 'watch'],
        sequential: ['deploy', 'migrate']
      }
    },
    orchestration: {
      defaultStrategy: 'smart',
      parallelism: {
        max: 4,
        cpuThreshold: 0.7
      },
      dependencies: {
        buildOrder: 'topological',
        cache: true
      }
    },
    templates: {
      microservice: {
        structure: ['src', 'tests', 'docs'],
        files: ['Dockerfile', 'claude.json', 'README.md'],
        claudeConfig: { model: 'claude-3-sonnet' }
      },
      frontend: {
        structure: ['src', 'public', 'tests'],
        files: ['package.json', '.env.example'],
        claudeConfig: { contextStrategy: 'ui-focused' }
      }
    }
  }
};

// Setup functie met progress tracking
export async function setupWorkbench() {
  const steps = [
    { name: 'Validating configuration', weight: 10 },
    { name: 'Installing extensions', weight: 25 },
    { name: 'Setting up layouts', weight: 20 },
    { name: 'Configuring themes', weight: 15 },
    { name: 'Optimizing performance', weight: 20 },
    { name: 'Initializing projects', weight: 10 }
  ];
  
  let progress = 0;
  const progressBar = new ProgressBar(steps.length);
  
  for (const step of steps) {
    progressBar.update(progress, step.name);
    
    try {
      switch (step.name) {
        case 'Validating configuration':
          await validateConfig(myWorkbenchConfig);
          break;
        case 'Installing extensions':
          await installExtensions(myWorkbenchConfig.extensions);
          break;
        case 'Setting up layouts':
          await setupLayouts(myWorkbenchConfig.layouts);
          break;
        case 'Configuring themes':
          await configureThemes(myWorkbenchConfig.themes);
          break;
        case 'Optimizing performance':
          await optimizePerformance(myWorkbenchConfig.performance);
          break;
        case 'Initializing projects':
          await initializeProjects(myWorkbenchConfig.projects);
          break;
      }
      
      progress += step.weight;
      progressBar.update(progress, \`✓ \${step.name}\`);
      
    } catch (error) {
      progressBar.error(\`✗ \${step.name}: \${error.message}\`);
      throw error;
    }
  }
  
  progressBar.complete('Workbench setup complete!');
  return true;
}

// Performance monitor klasse
export class WorkbenchMonitor {
  private metrics: Map<string, any[]> = new Map();
  private intervals: Map<string, NodeJS.Timer> = new Map();
  
  constructor(private config: WorkbenchConfig) {
    this.initializeMonitoring();
  }
  
  private initializeMonitoring() {
    // CPU monitoring
    this.startMetric('cpu', 1000, async () => {
      const usage = await this.getCPUUsage();
      return { timestamp: Date.now(), value: usage, unit: '%' };
    });
    
    // Memory monitoring
    this.startMetric('memory', 2000, async () => {
      const usage = await this.getMemoryUsage();
      return { 
        timestamp: Date.now(), 
        value: usage.used, 
        total: usage.total,
        unit: 'MB' 
      };
    });
    
    // Claude response time
    this.startMetric('claude-response', 0, async () => {
      // Passive collection from Claude events
      return this.claudeResponseTimes;
    });
    
    // Active panel monitoring
    this.startMetric('panel-usage', 5000, async () => {
      const usage = await this.getPanelUsage();
      return { timestamp: Date.now(), panels: usage };
    });
  }
  
  private startMetric(name: string, interval: number, collector: Function) {
    if (interval > 0) {
      const timer = setInterval(async () => {
        const data = await collector();
        this.addMetric(name, data);
        this.checkThresholds(name, data);
      }, interval);
      
      this.intervals.set(name, timer);
    }
  }
  
  private addMetric(name: string, data: any) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const metrics = this.metrics.get(name)!;
    metrics.push(data);
    
    // Keep only last 1000 entries
    if (metrics.length > 1000) {
      metrics.shift();
    }
  }
  
  private checkThresholds(name: string, data: any) {
    const alerts = this.config.performance?.monitoring?.alerts;
    if (!alerts) return;
    
    const alert = alerts[name];
    if (alert && data.value > alert.threshold) {
      this.handleAlert(name, alert.action, data);
    }
  }
  
  private async handleAlert(metric: string, action: string, data: any) {
    switch (action) {
      case 'notify':
        console.warn(\`Performance alert: \${metric} = \${data.value}\`);
        break;
      case 'gc':
        if (global.gc) global.gc();
        break;
      case 'optimize':
        await this.autoOptimize(metric);
        break;
    }
  }
  
  public getReport(timeRange?: { start: Date; end: Date }) {
    const report = {
      summary: this.generateSummary(),
      metrics: {},
      recommendations: this.generateRecommendations()
    };
    
    for (const [name, data] of this.metrics) {
      report.metrics[name] = this.analyzeMetric(name, data, timeRange);
    }
    
    return report;
  }
  
  private generateRecommendations(): string[] {
    const recommendations = [];
    
    // Analyze CPU usage
    const cpuData = this.metrics.get('cpu');
    if (cpuData) {
      const avgCpu = this.calculateAverage(cpuData.map(d => d.value));
      if (avgCpu > 70) {
        recommendations.push('Consider reducing parallel operations or upgrading CPU');
      }
    }
    
    // Analyze memory usage
    const memData = this.metrics.get('memory');
    if (memData) {
      const avgMem = this.calculateAverage(memData.map(d => d.value));
      const totalMem = memData[0]?.total || 0;
      if (avgMem / totalMem > 0.8) {
        recommendations.push('Memory usage is high, consider increasing memory limits');
      }
    }
    
    return recommendations;
  }
  
  public stop() {
    for (const timer of this.intervals.values()) {
      clearInterval(timer);
    }
    this.intervals.clear();
    this.metrics.clear();
  }
}`,
      hints: [
        'Begin met het definiëren van layouts voor verschillende development scenarios',
        'Implementeer theme switching met tijd-gebaseerde regels en brightness aanpassingen',
        'Configureer extensions op basis van je meest gebruikte tech stack',
        'Gebruik OS-level informatie voor intelligente performance tuning',
        'Test je configuratie stap voor stap met de setup functie',
        'Monitor resource usage om bottlenecks te identificeren'
      ]
    },
    {
      id: 'assignment-4-2-2',
      title: 'Multi-Project Workflow Orchestrator',
      description: 'Bouw een geavanceerde orchestrator voor het managen van complexe multi-project workspaces met dependency tracking, parallel execution, en intelligent resource management.',
      difficulty: 'hard' as const,
      type: 'project' as const,
      initialCode: `// Opdracht: Implementeer een Multi-Project Orchestrator
//
// Requirements:
// 1. Automatic project discovery in workspace
// 2. Dependency graph building en circular dependency detection
// 3. Parallel en sequential command execution
// 4. Resource-aware scheduling
// 5. Real-time progress monitoring
// 6. Cross-project type synchronization

interface Project {
  name: string;
  path: string;
  type: string;
  // TODO: Voeg meer properties toe
}

export class ProjectOrchestrator {
  private projects: Map<string, Project> = new Map();
  
  constructor() {
    // TODO: Initialize orchestrator
  }
  
  async discoverProjects(): Promise<void> {
    // TODO: Implement project discovery
  }
  
  async analyzeDependencies(): Promise<void> {
    // TODO: Build dependency graph
  }
  
  async executeCommand(command: string, options?: any): Promise<void> {
    // TODO: Implement command execution with dependency awareness
  }
  
  async monitor(): Promise<void> {
    // TODO: Implement real-time monitoring
  }
}

// Gebruik de orchestrator
async function main() {
  const orchestrator = new ProjectOrchestrator();
  await orchestrator.discoverProjects();
  // TODO: Implementeer workflow
}`,
      solution: `// Complete Multi-Project Orchestrator implementatie
import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { Worker } from 'worker_threads';

interface Project {
  name: string;
  path: string;
  type: 'frontend' | 'backend' | 'library' | 'service';
  language: string;
  framework?: string;
  dependencies: Record<string, string>;
  scripts: Record<string, string>;
  metadata: {
    loc?: number;
    complexity?: number;
    lastModified?: Date;
  };
}

interface Dependency {
  from: string;
  to: string;
  type: 'build' | 'runtime' | 'dev';
}

interface ExecutionOptions {
  projects?: string;
  parallel?: boolean;
  watch?: boolean;
  maxConcurrency?: number;
  env?: Record<string, string>;
}

interface OrchestratorReport {
  workspace: any;
  projects: any[];
  dependencies: any;
  health: number;
  recommendations: string[];
}

export class ProjectOrchestrator extends EventEmitter {
  private projects: Map<string, Project> = new Map();
  private dependencies: Dependency[] = [];
  private workspaceRoot: string;
  private resourceMonitor: ResourceMonitor;
  private executionQueue: Map<string, Promise<any>> = new Map();
  
  constructor(workspaceRoot: string = process.cwd()) {
    super();
    this.workspaceRoot = workspaceRoot;
    this.resourceMonitor = new ResourceMonitor();
  }
  
  async discoverProjects(): Promise<void> {
    this.emit('discovery:start');
    
    const patterns = [
      'apps/*',
      'packages/*',
      'services/*',
      'libs/*'
    ];
    
    const configFiles = [
      'package.json',
      'claude.json',
      'tsconfig.json',
      'pyproject.toml',
      'Cargo.toml'
    ];
    
    const discovered: string[] = [];
    
    // Scan for projects
    for (const pattern of patterns) {
      const dirs = await this.glob(path.join(this.workspaceRoot, pattern));
      
      for (const dir of dirs) {
        // Check for config files
        for (const configFile of configFiles) {
          const configPath = path.join(dir, configFile);
          if (await this.fileExists(configPath)) {
            discovered.push(dir);
            break;
          }
        }
      }
    }
    
    // Initialize projects
    for (const projectPath of discovered) {
      const project = await this.loadProject(projectPath);
      this.projects.set(project.name, project);
      this.emit('project:discovered', project);
    }
    
    this.emit('discovery:complete', { count: this.projects.size });
  }
  
  private async loadProject(projectPath: string): Promise<Project> {
    const configPath = path.join(projectPath, 'package.json');
    const config = await this.readJson(configPath);
    
    const project: Project = {
      name: config.name || path.basename(projectPath),
      path: projectPath,
      type: this.detectProjectType(projectPath, config),
      language: this.detectLanguage(projectPath),
      framework: this.detectFramework(config),
      dependencies: config.dependencies || {},
      scripts: config.scripts || {},
      metadata: {
        loc: await this.countLinesOfCode(projectPath),
        lastModified: new Date()
      }
    };
    
    return project;
  }
  
  private detectProjectType(projectPath: string, config: any): Project['type'] {
    if (config.dependencies?.react || config.dependencies?.vue || config.dependencies?.angular) {
      return 'frontend';
    }
    if (config.dependencies?.express || config.dependencies?.fastify || config.dependencies?.nestjs) {
      return 'backend';
    }
    if (projectPath.includes('services')) {
      return 'service';
    }
    return 'library';
  }
  
  private detectLanguage(projectPath: string): string {
    // Simple detection based on files
    if (this.fileExists(path.join(projectPath, 'tsconfig.json'))) {
      return 'typescript';
    }
    if (this.fileExists(path.join(projectPath, 'package.json'))) {
      return 'javascript';
    }
    if (this.fileExists(path.join(projectPath, 'pyproject.toml'))) {
      return 'python';
    }
    return 'unknown';
  }
  
  private detectFramework(config: any): string | undefined {
    const deps = { ...config.dependencies, ...config.devDependencies };
    
    if (deps.react) return 'react';
    if (deps.vue) return 'vue';
    if (deps.angular) return 'angular';
    if (deps.express) return 'express';
    if (deps.nestjs) return 'nestjs';
    if (deps.fastify) return 'fastify';
    
    return undefined;
  }
  
  async analyzeDependencies(): Promise<void> {
    this.emit('analysis:start');
    this.dependencies = [];
    
    // Analyze internal dependencies
    for (const [name, project] of this.projects) {
      const deps = { ...project.dependencies };
      
      for (const [depName, version] of Object.entries(deps)) {
        if (this.projects.has(depName)) {
          this.dependencies.push({
            from: name,
            to: depName,
            type: this.isDevDependency(project, depName) ? 'dev' : 'runtime'
          });
        }
      }
    }
    
    // Check for circular dependencies
    const circular = this.detectCircularDependencies();
    if (circular.length > 0) {
      this.emit('warning', {
        type: 'circular-dependencies',
        cycles: circular
      });
    }
    
    this.emit('analysis:complete', {
      dependencies: this.dependencies.length,
      circular: circular.length
    });
  }
  
  private detectCircularDependencies(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const dfs = (node: string, path: string[]): void => {
      visited.add(node);
      recursionStack.add(node);
      path.push(node);
      
      const edges = this.dependencies.filter(d => d.from === node);
      
      for (const edge of edges) {
        if (!visited.has(edge.to)) {
          dfs(edge.to, [...path]);
        } else if (recursionStack.has(edge.to)) {
          // Found cycle
          const cycleStart = path.indexOf(edge.to);
          cycles.push(path.slice(cycleStart));
        }
      }
      
      recursionStack.delete(node);
    };
    
    for (const project of this.projects.keys()) {
      if (!visited.has(project)) {
        dfs(project, []);
      }
    }
    
    return cycles;
  }
  
  async executeCommand(command: string, options: ExecutionOptions = {}): Promise<void> {
    const {
      projects = 'all',
      parallel = true,
      watch = false,
      maxConcurrency = os.cpus().length,
      env = {}
    } = options;
    
    // Determine target projects
    const targetProjects = this.getTargetProjects(projects);
    
    // Sort by dependency order
    const sorted = this.topologicalSort(targetProjects);
    
    // Check resource availability
    const resources = await this.resourceMonitor.checkAvailability();
    const concurrency = Math.min(
      maxConcurrency,
      Math.floor(resources.cpu.available / 25) // 25% CPU per task
    );
    
    this.emit('execution:start', {
      command,
      projects: sorted.map(p => p.name),
      parallel,
      concurrency
    });
    
    if (parallel) {
      await this.executeParallel(sorted, command, concurrency, env);
    } else {
      await this.executeSequential(sorted, command, env);
    }
    
    if (watch) {
      this.setupWatchers(sorted, command, env);
    }
    
    this.emit('execution:complete', { command });
  }
  
  private async executeParallel(
    projects: Project[],
    command: string,
    concurrency: number,
    env: Record<string, string>
  ): Promise<void> {
    const groups = this.groupByDependencyLevel(projects);
    
    for (const group of groups) {
      // Execute each dependency level in parallel
      const chunks = this.chunk(group, concurrency);
      
      for (const chunk of chunks) {
        await Promise.all(
          chunk.map(project => this.executeProjectCommand(project, command, env))
        );
      }
    }
  }
  
  private async executeSequential(
    projects: Project[],
    command: string,
    env: Record<string, string>
  ): Promise<void> {
    for (const project of projects) {
      await this.executeProjectCommand(project, command, env);
    }
  }
  
  private async executeProjectCommand(
    project: Project,
    command: string,
    env: Record<string, string>
  ): Promise<any> {
    const key = \`\${project.name}:\${command}\`;
    
    // Check if already executing
    if (this.executionQueue.has(key)) {
      return this.executionQueue.get(key);
    }
    
    const execution = this.doExecute(project, command, env);
    this.executionQueue.set(key, execution);
    
    try {
      const result = await execution;
      this.executionQueue.delete(key);
      return result;
    } catch (error) {
      this.executionQueue.delete(key);
      throw error;
    }
  }
  
  private async doExecute(
    project: Project,
    command: string,
    env: Record<string, string>
  ): Promise<any> {
    this.emit('command:start', { project: project.name, command });
    
    try {
      // Execute in worker thread for isolation
      const worker = new Worker(path.join(__dirname, 'command-worker.js'), {
        workerData: {
          projectPath: project.path,
          command,
          script: project.scripts[command],
          env: { ...process.env, ...env }
        }
      });
      
      const result = await new Promise((resolve, reject) => {
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
          if (code !== 0) {
            reject(new Error(\`Worker exited with code \${code}\`));
          }
        });
      });
      
      this.emit('command:success', {
        project: project.name,
        command,
        result
      });
      
      return result;
    } catch (error) {
      this.emit('command:error', {
        project: project.name,
        command,
        error
      });
      throw error;
    }
  }
  
  async monitor(): Promise<void> {
    const interval = setInterval(async () => {
      const status = {
        projects: Array.from(this.projects.values()).map(p => ({
          name: p.name,
          status: this.getProjectStatus(p)
        })),
        queue: this.executionQueue.size,
        resources: await this.resourceMonitor.checkAvailability()
      };
      
      this.emit('monitor:update', status);
    }, 1000);
    
    // Cleanup on exit
    process.on('SIGINT', () => {
      clearInterval(interval);
      process.exit();
    });
  }
  
  private getProjectStatus(project: Project): string {
    const key = Array.from(this.executionQueue.keys())
      .find(k => k.startsWith(\`\${project.name}:\`));
    
    if (key) {
      return \`executing: \${key.split(':')[1]}\`;
    }
    
    return 'idle';
  }
  
  private topologicalSort(projects: Project[]): Project[] {
    const sorted: Project[] = [];
    const visited = new Set<string>();
    
    const visit = (name: string) => {
      if (visited.has(name)) return;
      visited.add(name);
      
      const deps = this.dependencies
        .filter(d => d.from === name)
        .map(d => d.to);
      
      for (const dep of deps) {
        if (this.projects.has(dep)) {
          visit(dep);
        }
      }
      
      const project = this.projects.get(name);
      if (project && projects.includes(project)) {
        sorted.push(project);
      }
    };
    
    for (const project of projects) {
      visit(project.name);
    }
    
    return sorted;
  }
  
  private groupByDependencyLevel(projects: Project[]): Project[][] {
    const levels = new Map<string, number>();
    
    const calculateLevel = (name: string): number => {
      if (levels.has(name)) return levels.get(name)!;
      
      const deps = this.dependencies
        .filter(d => d.from === name && d.type !== 'dev')
        .map(d => d.to);
      
      let level = 0;
      for (const dep of deps) {
        if (this.projects.has(dep)) {
          level = Math.max(level, calculateLevel(dep) + 1);
        }
      }
      
      levels.set(name, level);
      return level;
    };
    
    projects.forEach(p => calculateLevel(p.name));
    
    // Groepeer op level
    const groups: Map<number, Project[]> = new Map();
    for (const project of projects) {
      const level = levels.get(project.name) || 0;
      if (!groups.has(level)) {
        groups.set(level, []);
      }
      groups.get(level)!.push(project);
    }
    
    // Return gesorteerd op level
    return Array.from(groups.entries())
      .sort(([a], [b]) => a - b)
      .map(([_, projects]) => projects);
  }
  
  public generateReport(): OrchestratorReport {
    const dependencyMatrix = this.generateDependencyMatrix();
    const healthScore = this.calculateHealthScore();
    
    return {
      workspace: {
        root: this.workspaceRoot,
        projects: this.projects.size,
        totalLOC: Array.from(this.projects.values())
          .reduce((sum, p) => sum + (p.metadata.loc || 0), 0)
      },
      projects: Array.from(this.projects.values()).map(p => ({
        name: p.name,
        type: p.type,
        health: this.calculateProjectHealth(p),
        dependencies: {
          internal: this.dependencies.filter(d => d.from === p.name).length,
          external: Object.keys(p.dependencies).length
        }
      })),
      dependencies: {
        total: this.dependencies.length,
        circular: this.detectCircularDependencies(),
        matrix: dependencyMatrix
      },
      health: healthScore,
      recommendations: this.generateRecommendations()
    };
  }
}

// Resource Monitor voor intelligent scheduling
class ResourceMonitor {
  async checkAvailability(): Promise<ResourceInfo> {
    const cpuUsage = await this.getCPUUsage();
    const memoryInfo = await this.getMemoryInfo();
    const diskInfo = await this.getDiskInfo();
    
    return {
      cpu: {
        cores: os.cpus().length,
        usage: cpuUsage,
        available: 100 - cpuUsage
      },
      memory: {
        total: memoryInfo.total,
        used: memoryInfo.used,
        available: memoryInfo.available,
        percentage: (memoryInfo.used / memoryInfo.total) * 100
      },
      disk: diskInfo
    };
  }
  
  private async getCPUUsage(): Promise<number> {
    // Implementeer CPU usage monitoring
    return new Promise(resolve => {
      const startUsage = process.cpuUsage();
      setTimeout(() => {
        const usage = process.cpuUsage(startUsage);
        const total = usage.user + usage.system;
        const percentage = (total / 1000000) * 100; // microseconds to percentage
        resolve(Math.min(percentage, 100));
      }, 100);
    });
  }
  
  private async getMemoryInfo() {
    const total = os.totalmem();
    const free = os.freemem();
    return {
      total: total / 1024 / 1024, // MB
      used: (total - free) / 1024 / 1024,
      available: free / 1024 / 1024
    };
  }
  
  private async getDiskInfo() {
    // Platform-specific disk info
    // Simplified version
    return {
      available: 10000, // MB
      used: 50000,
      total: 60000
    };
  }
}

// Visual Dependency Viewer
export class DependencyVisualizer {
  constructor(private orchestrator: ProjectOrchestrator) {}
  
  async generateGraph(format: 'mermaid' | 'dot' | 'ascii' = 'mermaid'): Promise<string> {
    const report = this.orchestrator.generateReport();
    
    switch (format) {
      case 'mermaid':
        return this.generateMermaid(report);
      case 'dot':
        return this.generateDot(report);
      case 'ascii':
        return this.generateAscii(report);
    }
  }
  
  private generateMermaid(report: any): string {
    let mermaid = 'graph TD\\n';
    
    // Add nodes
    for (const project of report.projects) {
      const style = this.getNodeStyle(project.type);
      mermaid += \`  \${project.name}[\${project.name}]\${style}\\n\`;
    }
    
    // Add edges
    for (const dep of report.dependencies.matrix) {
      const style = dep.type === 'dev' ? ' -.-> ' : ' --> ';
      mermaid += \`  \${dep.from}\${style}\${dep.to}\\n\`;
    }
    
    // Add styling
    mermaid += \`\\n  classDef frontend fill:#e1f5fe,stroke:#01579b\\n\`;
    mermaid += \`  classDef backend fill:#f3e5f5,stroke:#4a148c\\n\`;
    mermaid += \`  classDef library fill:#e8f5e9,stroke:#1b5e20\\n\`;
    mermaid += \`  classDef service fill:#fff3e0,stroke:#e65100\\n\`;
    
    return mermaid;
  }
  
  private getNodeStyle(type: string): string {
    switch (type) {
      case 'frontend': return ':::frontend';
      case 'backend': return ':::backend';
      case 'library': return ':::library';
      case 'service': return ':::service';
      default: return '';
    }
  }
  
  private generateAscii(report: any): string {
    // Simple ASCII representation
    let ascii = 'Project Dependency Graph\\n';
    ascii += '========================\\n\\n';
    
    for (const project of report.projects) {
      ascii += \`[\${project.name}] (\${project.type})\\n\`;
      
      const deps = report.dependencies.matrix
        .filter(d => d.from === project.name)
        .map(d => \`  └─> \${d.to} (\${d.type})\`);
      
      if (deps.length > 0) {
        ascii += deps.join('\\n') + '\\n';
      }
      ascii += '\\n';
    }
    
    return ascii;
  }
  
  async renderInteractive(): Promise<void> {
    // Render interactive terminal UI
    const blessed = require('blessed');
    const screen = blessed.screen({
      smartCSR: true,
      title: 'Project Dependencies'
    });
    
    // Create dependency tree widget
    const tree = blessed.tree({
      top: 0,
      left: 0,
      width: '50%',
      height: '100%',
      border: 'line',
      label: ' Projects ',
      style: {
        border: { fg: 'cyan' }
      }
    });
    
    // Create info panel
    const info = blessed.box({
      top: 0,
      left: '50%',
      width: '50%',
      height: '100%',
      border: 'line',
      label: ' Details ',
      content: 'Select a project to view details',
      style: {
        border: { fg: 'green' }
      }
    });
    
    screen.append(tree);
    screen.append(info);
    
    // Populate tree
    const report = this.orchestrator.generateReport();
    const treeData = this.buildTreeData(report);
    tree.setData(treeData);
    
    // Handle selection
    tree.on('select', (node) => {
      const project = report.projects.find(p => p.name === node.name);
      if (project) {
        info.setContent(this.formatProjectInfo(project, report));
        screen.render();
      }
    });
    
    // Key bindings
    screen.key(['escape', 'q', 'C-c'], () => process.exit(0));
    
    tree.focus();
    screen.render();
  }
  
  private buildTreeData(report: any): any {
    return {
      extended: true,
      children: report.projects.map(project => ({
        name: project.name,
        extended: false,
        children: report.dependencies.matrix
          .filter(d => d.from === project.name)
          .map(d => ({
            name: \`→ \${d.to} (\${d.type})\`
          }))
      }))
    };
  }
  
  private formatProjectInfo(project: any, report: any): string {
    return \`
Project: \${project.name}
Type: \${project.type}
Health: \${project.health}/100

Dependencies:
- Internal: \${project.dependencies.internal}
- External: \${project.dependencies.external}

Commands available:
\${Object.keys(project.scripts || {}).map(s => \`- \${s}\`).join('\\n')}
    \`;
  }
}`,
      hints: [
        'Start met project discovery door verschillende config files te scannen',
        'Bouw een dependency graph met circular dependency detection',
        'Implementeer parallel execution met resource-aware scheduling',
        'Gebruik worker threads voor command isolation',
        'Cache command results voor snellere herhaalde executions',
        'Maak een interactieve visualisatie van de project dependencies'
      ]
    }
  ],
  resources: [
    {
      title: 'Claude Code Workbench Documentation',
      url: 'https://docs.anthropic.com/claude-code/workbench',
      type: 'documentation' as const
    },
    {
      title: 'Advanced Configuration Guide',
      url: 'https://docs.anthropic.com/claude-code/configuration',
      type: 'guide' as const
    },
    {
      title: 'Performance Optimization Best Practices',
      url: 'https://docs.anthropic.com/claude-code/performance',
      type: 'guide' as const
    },
    {
      title: 'Multi-Project Workspace Examples',
      url: 'https://github.com/anthropic/claude-code-examples/workspaces',
      type: 'examples' as const
    }
  ]
};