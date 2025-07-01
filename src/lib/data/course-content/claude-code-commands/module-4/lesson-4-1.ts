import type { Lesson } from '@/lib/data/courses';

export const lesson4_1: Lesson = {
  id: 'lesson-4-1',
  title: 'Custom commands ontwikkelen',
  duration: '40 min',
  content: `
# Custom Commands Ontwikkelen

Claude Code's ware kracht ligt in de mogelijkheid om je eigen commands te creëren die perfect aansluiten bij jouw workflow. In deze les leer je de architectuur begrijpen en je eerste custom commands bouwen.

## Command Architecture

Claude Code commands volgen een modulaire architectuur die flexibiliteit en herbruikbaarheid waarborgt.

### Anatomie van een Command

Een Claude Code command bestaat uit verschillende componenten:

\`\`\`typescript
// ~/.claude/commands/my-command.ts
export default {
  name: 'my-command',
  description: 'Beschrijving van wat het command doet',
  version: '1.0.0',
  
  // Command configuratie
  config: {
    requiresAuth: true,
    requiresProject: true,
    allowedModels: ['claude-3-opus', 'claude-3-sonnet']
  },
  
  // Parameters definitie
  parameters: {
    input: {
      type: 'string',
      required: true,
      description: 'Input parameter'
    },
    options: {
      type: 'object',
      properties: {
        verbose: { type: 'boolean', default: false },
        format: { type: 'string', enum: ['json', 'text'] }
      }
    }
  },
  
  // Command logica
  execute: async (params, context) => {
    // Command implementatie
  }
}
\`\`\`

### Command Lifecycle

1. **Initialization**: Command wordt geladen en gevalideerd
2. **Parameter Parsing**: Input parameters worden geparsed en gevalideerd
3. **Context Building**: Project context wordt opgebouwd
4. **Execution**: Command logica wordt uitgevoerd
5. **Output Handling**: Resultaten worden geformatteerd en getoond

## Building Your First Command

Laten we een praktisch command bouwen dat code documentatie genereert.

### Stap 1: Command Structure

\`\`\`bash
# Maak een nieuwe command file
mkdir -p ~/.claude/commands
touch ~/.claude/commands/generate-docs.ts
\`\`\`

### Stap 2: Basic Implementation

\`\`\`typescript
// ~/.claude/commands/generate-docs.ts
import { Command, Context } from '@claude/sdk';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

export default {
  name: 'generate-docs',
  description: 'Genereert documentatie voor TypeScript/JavaScript files',
  version: '1.0.0',
  
  parameters: {
    files: {
      type: 'array',
      items: { type: 'string' },
      description: 'Files om te documenteren',
      required: true
    },
    output: {
      type: 'string',
      description: 'Output directory voor documentatie',
      default: './docs'
    },
    format: {
      type: 'string',
      enum: ['markdown', 'html', 'json'],
      default: 'markdown',
      description: 'Output format'
    }
  },
  
  async execute(params: any, context: Context) {
    const { files, output, format } = params;
    
    console.log(\`📚 Generating documentation for \${files.length} files...\`);
    
    for (const file of files) {
      try {
        const content = await readFile(file, 'utf-8');
        
        // Gebruik Claude om documentatie te genereren
        const docs = await context.claude.complete({
          prompt: \`Generate comprehensive documentation for this code in \${format} format:\n\n\${content}\`,
          model: 'claude-3-opus'
        });
        
        // Schrijf documentatie naar output
        const outputPath = path.join(output, \`\${path.basename(file, path.extname(file))}.docs.\${format}\`);
        await writeFile(outputPath, docs);
        
        console.log(\`✅ Generated docs for \${file}\`);
      } catch (error) {
        console.error(\`❌ Failed to process \${file}:\`, error);
      }
    }
  }
} as Command;
\`\`\`

### Stap 3: Command Registratie

\`\`\`bash
# Registreer het command
claude command register ~/.claude/commands/generate-docs.ts

# Verifieer registratie
claude command list
\`\`\`

## Parameter Handling

Robuuste parameter handling is cruciaal voor bruikbare commands.

### Parameter Types

\`\`\`typescript
// Verschillende parameter types
parameters: {
  // String parameter
  name: {
    type: 'string',
    required: true,
    pattern: '^[a-zA-Z0-9-]+$',
    minLength: 3,
    maxLength: 50
  },
  
  // Number parameter
  threads: {
    type: 'number',
    minimum: 1,
    maximum: 10,
    default: 4
  },
  
  // Boolean parameter
  verbose: {
    type: 'boolean',
    default: false
  },
  
  // Array parameter
  files: {
    type: 'array',
    items: { type: 'string' },
    minItems: 1,
    uniqueItems: true
  },
  
  // Object parameter
  config: {
    type: 'object',
    properties: {
      timeout: { type: 'number' },
      retries: { type: 'number' }
    },
    required: ['timeout']
  },
  
  // Enum parameter
  format: {
    type: 'string',
    enum: ['json', 'yaml', 'toml'],
    default: 'json'
  }
}
\`\`\`

### Advanced Validation

\`\`\`typescript
// Custom validators
parameters: {
  email: {
    type: 'string',
    validate: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        throw new Error('Invalid email format');
      }
      return true;
    }
  },
  
  path: {
    type: 'string',
    validate: async (value) => {
      const exists = await fileExists(value);
      if (!exists) {
        throw new Error(\`Path does not exist: \${value}\`);
      }
      return true;
    }
  }
}
\`\`\`

### Interactive Parameters

\`\`\`typescript
// Interactieve input voor ontbrekende parameters
parameters: {
  projectName: {
    type: 'string',
    required: true,
    interactive: {
      prompt: 'Wat is de naam van je project?',
      validate: (input) => input.length > 0 || 'Project naam is verplicht'
    }
  },
  
  template: {
    type: 'string',
    required: true,
    interactive: {
      type: 'select',
      prompt: 'Selecteer een project template',
      choices: [
        { title: 'React App', value: 'react' },
        { title: 'Vue App', value: 'vue' },
        { title: 'Node API', value: 'node-api' }
      ]
    }
  }
}
\`\`\`

## Command Chaining

Commands kunnen worden gekoppeld voor complexe workflows.

### Sequential Chaining

\`\`\`typescript
// Command dat andere commands aanroept
async execute(params, context) {
  // Stap 1: Lint de code
  await context.runCommand('lint', {
    files: params.files,
    fix: true
  });
  
  // Stap 2: Format de code
  await context.runCommand('format', {
    files: params.files,
    style: 'prettier'
  });
  
  // Stap 3: Genereer documentatie
  await context.runCommand('generate-docs', {
    files: params.files,
    format: 'markdown'
  });
  
  // Stap 4: Commit changes
  await context.runCommand('git-commit', {
    message: 'Auto-format and document code',
    files: params.files
  });
}
\`\`\`

### Parallel Execution

\`\`\`typescript
// Parallel uitvoeren van commands
async execute(params, context) {
  const tasks = params.files.map(file => ({
    command: 'analyze-file',
    params: { file, detailed: true }
  }));
  
  // Voer alle analyses parallel uit
  const results = await Promise.all(
    tasks.map(task => 
      context.runCommand(task.command, task.params)
    )
  );
  
  // Combineer resultaten
  return {
    summary: combinedAnalysis(results),
    details: results
  };
}
\`\`\`

### Conditional Chaining

\`\`\`typescript
// Conditionele command chains
async execute(params, context) {
  const testResult = await context.runCommand('test', {
    files: params.files
  });
  
  if (testResult.passed) {
    // Tests geslaagd, ga door met deployment
    await context.runCommand('build', {
      production: true
    });
    
    await context.runCommand('deploy', {
      environment: params.environment
    });
  } else {
    // Tests gefaald, run debugging
    await context.runCommand('debug-tests', {
      failed: testResult.failed,
      verbose: true
    });
    
    throw new Error('Tests failed, deployment aborted');
  }
}
\`\`\`

## Error Handling in Commands

Robuuste error handling maakt commands betrouwbaar en gebruiksvriendelijk.

### Basic Error Handling

\`\`\`typescript
async execute(params, context) {
  try {
    const result = await riskyOperation(params);
    return { success: true, data: result };
  } catch (error) {
    // Log error details
    context.logger.error('Operation failed', {
      error: error.message,
      stack: error.stack,
      params
    });
    
    // User-friendly error message
    throw new Error(\`Failed to process: \${error.message}\`);
  }
}
\`\`\`

### Advanced Error Strategies

\`\`\`typescript
// Retry mechanisme
async executeWithRetry(operation, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        console.log(\`Attempt \${attempt} failed, retrying...\`);
        await new Promise(resolve => 
          setTimeout(resolve, 1000 * attempt)
        );
      }
    }
  }
  
  throw new Error(\`Failed after \${maxRetries} attempts: \${lastError.message}\`);
}

// Graceful degradation
async execute(params, context) {
  const results = {
    primary: null,
    fallback: null,
    errors: []
  };
  
  try {
    // Probeer primaire operatie
    results.primary = await primaryOperation(params);
  } catch (error) {
    results.errors.push({
      operation: 'primary',
      error: error.message
    });
    
    try {
      // Fallback naar alternatief
      results.fallback = await fallbackOperation(params);
    } catch (fallbackError) {
      results.errors.push({
        operation: 'fallback',
        error: fallbackError.message
      });
    }
  }
  
  return results;
}
\`\`\`

### Error Recovery

\`\`\`typescript
// Cleanup bij errors
async execute(params, context) {
  const cleanup = [];
  
  try {
    // Maak temporary files
    const tempFile = await createTempFile();
    cleanup.push(() => deleteTempFile(tempFile));
    
    // Start process
    const process = await startProcess();
    cleanup.push(() => stopProcess(process));
    
    // Doe werk
    const result = await doWork(tempFile, process);
    
    return result;
  } catch (error) {
    // Cleanup bij error
    for (const cleanupFn of cleanup.reverse()) {
      try {
        await cleanupFn();
      } catch (cleanupError) {
        context.logger.warn('Cleanup failed', cleanupError);
      }
    }
    
    throw error;
  }
}
\`\`\`

## Praktische Custom Commands Voorbeelden

### 1. Code Review Assistant

\`\`\`typescript
// ~/.claude/commands/review-code.ts
export default {
  name: 'review-code',
  description: 'AI-powered code review voor pull requests',
  
  async execute(params, context) {
    const changes = await getGitDiff(params.branch);
    
    const review = await context.claude.complete({
      prompt: \`Review deze code changes en geef feedback op:
      - Code kwaliteit
      - Potentiële bugs
      - Performance issues
      - Security concerns
      - Best practices
      
      Changes:
      \${changes}\`,
      model: 'claude-3-opus'
    });
    
    // Maak GitHub comment
    await createPRComment(params.pr, review);
  }
};
\`\`\`

### 2. Test Generator

\`\`\`typescript
// ~/.claude/commands/generate-tests.ts
export default {
  name: 'generate-tests',
  description: 'Genereert unit tests voor functies',
  
  async execute(params, context) {
    const code = await readFile(params.file);
    const functions = extractFunctions(code);
    
    for (const func of functions) {
      const tests = await context.claude.complete({
        prompt: \`Generate comprehensive unit tests for:
        \${func.code}
        
        Include edge cases, error scenarios, and happy paths.\`,
        model: 'claude-3-sonnet'
      });
      
      await writeTestFile(func.name, tests);
    }
  }
};
\`\`\`

### 3. Dependency Analyzer

\`\`\`typescript
// ~/.claude/commands/analyze-deps.ts
export default {
  name: 'analyze-deps',
  description: 'Analyseert en optimaliseert project dependencies',
  
  async execute(params, context) {
    const deps = await analyzeDependencies();
    
    const analysis = await context.claude.complete({
      prompt: \`Analyze these dependencies:
      - Find unused dependencies
      - Suggest alternatives for deprecated packages
      - Identify security vulnerabilities
      - Recommend version updates
      
      Dependencies: \${JSON.stringify(deps)}\`,
      model: 'claude-3-opus'
    });
    
    return formatAnalysisReport(analysis);
  }
};
\`\`\`

Met deze kennis kun je krachtige custom commands bouwen die perfect aansluiten bij jouw development workflow!
        `,
  codeExamples: [
    {
      id: 'example-4-1',
      title: 'Complete custom command example',
      language: 'typescript',
      code: `// ~/.claude/commands/refactor-imports.ts
import { Command, Context } from '@claude/sdk';
import { readFile, writeFile } from 'fs/promises';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';

export default {
  name: 'refactor-imports',
  description: 'Reorganiseert en optimaliseert import statements',
  version: '1.0.0',
  
  config: {
    requiresAuth: true,
    requiresProject: true,
    allowedModels: ['claude-3-opus', 'claude-3-sonnet']
  },
  
  parameters: {
    files: {
      type: 'array',
      items: { type: 'string' },
      description: 'TypeScript/JavaScript files om te refactoren',
      required: true,
      minItems: 1
    },
    grouping: {
      type: 'string',
      enum: ['type', 'source', 'alphabetical'],
      default: 'type',
      description: 'Hoe imports te groeperen'
    },
    removeUnused: {
      type: 'boolean',
      default: true,
      description: 'Verwijder ongebruikte imports'
    },
    addMissing: {
      type: 'boolean',
      default: false,
      description: 'Voeg ontbrekende imports toe'
    }
  },
  
  async execute(params: any, context: Context) {
    const { files, grouping, removeUnused, addMissing } = params;
    let processedCount = 0;
    
    for (const file of files) {
      try {
        console.log(\`🔧 Processing \${file}...\`);
        
        // Lees file content
        const content = await readFile(file, 'utf-8');
        
        // Parse AST
        const ast = parser.parse(content, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx']
        });
        
        // Analyseer imports
        const imports = [];
        const usedIdentifiers = new Set();
        
        traverse(ast, {
          ImportDeclaration(path) {
            imports.push({
              node: path.node,
              source: path.node.source.value,
              specifiers: path.node.specifiers
            });
          },
          
          Identifier(path) {
            if (!path.isImportSpecifier()) {
              usedIdentifiers.add(path.node.name);
            }
          }
        });
        
        // Gebruik Claude voor intelligente refactoring
        const refactoringPlan = await context.claude.complete({
          prompt: \`Analyze these imports and suggest refactoring:
          
          Current imports:
          \${imports.map(imp => \`import from '\${imp.source}'\`).join('\\n')}
          
          Requirements:
          - Grouping: \${grouping}
          - Remove unused: \${removeUnused}
          - Add missing: \${addMissing}
          - Used identifiers: \${Array.from(usedIdentifiers).join(', ')}
          
          Provide optimal import structure.\`,
          model: 'claude-3-sonnet'
        });
        
        // Pas refactoring toe
        const refactoredCode = applyRefactoring(ast, refactoringPlan);
        
        // Schrijf terug naar file
        await writeFile(file, refactoredCode);
        
        console.log(\`✅ Successfully refactored \${file}\`);
        processedCount++;
        
      } catch (error) {
        console.error(\`❌ Failed to process \${file}:\`, error);
        context.logger.error('Refactoring failed', { file, error });
      }
    }
    
    return {
      success: true,
      processedFiles: processedCount,
      totalFiles: files.length
    };
  }
} as Command;`,
      explanation: 'Dit voorbeeld toont een volledig werkend custom command dat import statements refactort. Het demonstreert AST parsing, Claude integratie, error handling, en complexe parameter configuratie.'
    },
    {
      id: 'example-4-2',
      title: 'Command met interactive parameters',
      language: 'typescript',
      code: `// ~/.claude/commands/create-component.ts
export default {
  name: 'create-component',
  description: 'Genereert een nieuwe React component met alle benodigde files',
  
  parameters: {
    name: {
      type: 'string',
      required: true,
      interactive: {
        prompt: 'Component naam:',
        validate: (input) => {
          if (!/^[A-Z][a-zA-Z]*$/.test(input)) {
            return 'Component naam moet met hoofdletter beginnen';
          }
          return true;
        }
      }
    },
    
    type: {
      type: 'string',
      required: true,
      interactive: {
        type: 'select',
        prompt: 'Component type:',
        choices: [
          { title: 'Functional Component', value: 'functional' },
          { title: 'Class Component', value: 'class' },
          { title: 'Custom Hook', value: 'hook' }
        ]
      }
    },
    
    features: {
      type: 'array',
      interactive: {
        type: 'multiselect',
        prompt: 'Selecteer features:',
        choices: [
          { title: 'TypeScript', value: 'typescript', selected: true },
          { title: 'Tests', value: 'tests', selected: true },
          { title: 'Storybook', value: 'storybook' },
          { title: 'CSS Modules', value: 'css-modules' },
          { title: 'PropTypes', value: 'proptypes' }
        ]
      }
    },
    
    path: {
      type: 'string',
      interactive: {
        prompt: 'Component locatie:',
        initial: './src/components',
        validate: async (input) => {
          const exists = await directoryExists(input);
          if (!exists) {
            return \`Directory \${input} bestaat niet\`;
          }
          return true;
        }
      }
    }
  },
  
  async execute(params, context) {
    const { name, type, features, path } = params;
    const componentPath = \`\${path}/\${name}\`;
    
    // Maak component directory
    await createDirectory(componentPath);
    
    // Genereer component code
    const componentCode = await generateComponent(name, type, features);
    await writeFile(\`\${componentPath}/\${name}.tsx\`, componentCode);
    
    // Genereer bijbehorende files
    if (features.includes('tests')) {
      const testCode = await generateTests(name, type);
      await writeFile(\`\${componentPath}/\${name}.test.tsx\`, testCode);
    }
    
    if (features.includes('storybook')) {
      const storyCode = await generateStory(name);
      await writeFile(\`\${componentPath}/\${name}.stories.tsx\`, storyCode);
    }
    
    console.log(\`✨ Component \${name} succesvol aangemaakt!\`);
  }
};`,
      explanation: 'Dit voorbeeld demonstreert hoe je interactive parameters gebruikt voor een betere gebruikerservaring. Het command vraagt stap voor stap alle benodigde informatie op met validatie.'
    },
    {
      id: 'example-4-3',
      title: 'Command chaining workflow',
      language: 'typescript',
      code: `// ~/.claude/commands/deploy-feature.ts
export default {
  name: 'deploy-feature',
  description: 'Complete workflow voor feature deployment',
  
  parameters: {
    feature: {
      type: 'string',
      required: true,
      description: 'Feature branch naam'
    },
    environment: {
      type: 'string',
      enum: ['development', 'staging', 'production'],
      default: 'staging'
    },
    skipTests: {
      type: 'boolean',
      default: false
    }
  },
  
  async execute(params, context) {
    const { feature, environment, skipTests } = params;
    const results = {
      steps: [],
      success: true,
      deployment: null
    };
    
    try {
      // Step 1: Code quality check
      console.log('🔍 Running code quality checks...');
      const lintResult = await context.runCommand('lint', {
        fix: true,
        strict: environment === 'production'
      });
      
      results.steps.push({
        step: 'lint',
        status: lintResult.errors === 0 ? 'passed' : 'warning',
        details: lintResult
      });
      
      // Step 2: Run tests
      if (!skipTests) {
        console.log('🧪 Running test suite...');
        const testResult = await context.runCommand('test', {
          coverage: true,
          parallel: true
        });
        
        if (!testResult.passed) {
          throw new Error(\`Tests failed: \${testResult.failed} failures\`);
        }
        
        results.steps.push({
          step: 'tests',
          status: 'passed',
          coverage: testResult.coverage
        });
      }
      
      // Step 3: Build
      console.log('🏗️  Building application...');
      const buildResult = await context.runCommand('build', {
        environment,
        optimize: environment === 'production',
        sourcemaps: environment !== 'production'
      });
      
      results.steps.push({
        step: 'build',
        status: 'completed',
        size: buildResult.bundleSize,
        time: buildResult.buildTime
      });
      
      // Step 4: Security scan
      if (environment === 'production') {
        console.log('🔒 Running security scan...');
        const securityResult = await context.runCommand('security-scan', {
          deep: true
        });
        
        if (securityResult.vulnerabilities.high > 0) {
          throw new Error('High severity vulnerabilities detected');
        }
        
        results.steps.push({
          step: 'security',
          status: 'passed',
          vulnerabilities: securityResult.vulnerabilities
        });
      }
      
      // Step 5: Deploy
      console.log(\`🚀 Deploying to \${environment}...\`);
      const deployResult = await context.runCommand('deploy', {
        environment,
        branch: feature,
        rollbackOnError: true
      });
      
      results.deployment = {
        url: deployResult.url,
        version: deployResult.version,
        timestamp: new Date().toISOString()
      };
      
      // Step 6: Post-deployment checks
      console.log('✅ Running post-deployment checks...');
      await context.runCommand('health-check', {
        url: deployResult.url,
        timeout: 30000
      });
      
      // Step 7: Notify team
      await context.runCommand('notify', {
        channel: 'deployments',
        message: \`Feature "\${feature}" deployed to \${environment}\\nURL: \${deployResult.url}\`
      });
      
    } catch (error) {
      results.success = false;
      results.error = error.message;
      
      // Rollback on failure
      if (results.deployment) {
        console.log('⏮️  Rolling back deployment...');
        await context.runCommand('rollback', {
          environment,
          version: results.deployment.version
        });
      }
      
      throw error;
    }
    
    return results;
  }
};`,
      explanation: 'Een complex voorbeeld van command chaining dat een complete deployment workflow implementeert. Het toont sequential execution, error handling, conditional logic, en rollback mechanismes.'
    }
  ],
  assignments: [
    {
      id: 'assignment-4-1',
      title: 'Basic Command: File Analyzer',
      description: 'Bouw een custom command dat bestanden analyseert en statistieken genereert. Het command moet file types detecteren, regels tellen, en complexiteit analyseren.',
      difficulty: 'medium',
      type: 'code',
      initialCode: `// ~/.claude/commands/analyze-files.ts
// TODO: Implementeer een file analyzer command
// Requirements:
// 1. Accepteer een array van file paths
// 2. Detecteer file types (JS, TS, Python, etc.)
// 3. Tel regels code, comments, en lege regels
// 4. Bereken basis complexiteit metrics
// 5. Genereer een mooi geformatteerd rapport

export default {
  name: 'analyze-files',
  description: 'Analyseert bestanden en genereert statistieken',
  
  parameters: {
    // TODO: Definieer parameters
  },
  
  async execute(params, context) {
    // TODO: Implementeer de analyze logica
  }
};`,
      solution: `// ~/.claude/commands/analyze-files.ts
import { readFile } from 'fs/promises';
import path from 'path';

export default {
  name: 'analyze-files',
  description: 'Analyseert bestanden en genereert statistieken',
  version: '1.0.0',
  
  parameters: {
    files: {
      type: 'array',
      items: { type: 'string' },
      required: true,
      minItems: 1,
      description: 'Files om te analyseren'
    },
    detailed: {
      type: 'boolean',
      default: false,
      description: 'Toon gedetailleerde metrics'
    }
  },
  
  async execute(params, context) {
    const { files, detailed } = params;
    const results = [];
    
    for (const file of files) {
      try {
        const content = await readFile(file, 'utf-8');
        const lines = content.split('\\n');
        const ext = path.extname(file);
        
        const stats = {
          file,
          type: getFileType(ext),
          totalLines: lines.length,
          codeLines: 0,
          commentLines: 0,
          emptyLines: 0,
          complexity: 0
        };
        
        // Analyseer elke regel
        for (const line of lines) {
          const trimmed = line.trim();
          
          if (trimmed === '') {
            stats.emptyLines++;
          } else if (isComment(trimmed, stats.type)) {
            stats.commentLines++;
          } else {
            stats.codeLines++;
            stats.complexity += calculateComplexity(trimmed);
          }
        }
        
        if (detailed) {
          // Gebruik Claude voor diepere analyse
          const analysis = await context.claude.complete({
            prompt: \`Analyze this code for quality and suggest improvements:\\n\${content}\`,
            model: 'claude-3-sonnet'
          });
          
          stats.analysis = analysis;
        }
        
        results.push(stats);
      } catch (error) {
        console.error(\`Failed to analyze \${file}:\`, error);
      }
    }
    
    // Genereer rapport
    console.log('\\n📊 File Analysis Report\\n');
    console.log('='.repeat(50));
    
    for (const result of results) {
      console.log(\`\\n📄 \${result.file}\`);
      console.log(\`   Type: \${result.type}\`);
      console.log(\`   Total lines: \${result.totalLines}\`);
      console.log(\`   Code lines: \${result.codeLines}\`);
      console.log(\`   Comment lines: \${result.commentLines}\`);
      console.log(\`   Empty lines: \${result.emptyLines}\`);
      console.log(\`   Complexity: \${result.complexity}\`);
      
      if (result.analysis) {
        console.log(\`\\n   AI Analysis:\\n\${result.analysis}\`);
      }
    }
    
    return results;
  }
};

function getFileType(ext) {
  const types = {
    '.js': 'JavaScript',
    '.ts': 'TypeScript',
    '.py': 'Python',
    '.java': 'Java',
    '.cpp': 'C++',
    '.go': 'Go'
  };
  return types[ext] || 'Unknown';
}

function isComment(line, fileType) {
  const commentPatterns = {
    'JavaScript': /^\\/\\/|^\\/\\*|^\\*/,
    'TypeScript': /^\\/\\/|^\\/\\*|^\\*/,
    'Python': /^#/,
    'Java': /^\\/\\/|^\\/\\*|^\\*/
  };
  
  const pattern = commentPatterns[fileType];
  return pattern ? pattern.test(line) : false;
}

function calculateComplexity(line) {
  let complexity = 0;
  const complexityKeywords = ['if', 'else', 'for', 'while', 'switch', 'catch'];
  
  for (const keyword of complexityKeywords) {
    if (line.includes(keyword)) complexity++;
  }
  
  return complexity;
}`,
      hints: [
        'Begin met het definiëren van de parameter structuur voor files input',
        'Gebruik regex patterns om verschillende soorten comments te detecteren',
        'Implementeer aparte functies voor file type detectie en complexity berekening',
        'Gebruik context.claude voor geavanceerde code analyse wanneer detailed=true'
      ]
    },
    {
      id: 'assignment-4-2',
      title: 'Interactive Command: Project Scaffolder',
      description: 'Creëer een command met interactive parameters dat een complete project structuur opzet op basis van gebruikerskeuzes.',
      difficulty: 'hard',
      type: 'project',
      initialCode: `// ~/.claude/commands/scaffold-project.ts
// TODO: Bouw een interactive project scaffolder
// Requirements:
// 1. Vraag interactief naar project type (React, Vue, Node API, etc.)
// 2. Vraag naar features (TypeScript, Testing, Linting, etc.)
// 3. Genereer complete project structuur
// 4. Installeer dependencies
// 5. Maak initiële configuratie files

export default {
  name: 'scaffold-project',
  description: 'Genereert een nieuwe project structuur',
  
  parameters: {
    // TODO: Implementeer interactive parameters
  },
  
  async execute(params, context) {
    // TODO: Implementeer scaffolding logica
  }
};`,
      solution: `// ~/.claude/commands/scaffold-project.ts
import { mkdir, writeFile } from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';

export default {
  name: 'scaffold-project',
  description: 'Genereert een nieuwe project structuur',
  version: '1.0.0',
  
  parameters: {
    name: {
      type: 'string',
      required: true,
      interactive: {
        prompt: 'Project naam:',
        validate: (input) => {
          if (!/^[a-z0-9-]+$/.test(input)) {
            return 'Gebruik alleen lowercase letters, cijfers en streepjes';
          }
          return true;
        }
      }
    },
    
    type: {
      type: 'string',
      required: true,
      interactive: {
        type: 'select',
        prompt: 'Project type:',
        choices: [
          { title: 'React Application', value: 'react' },
          { title: 'Vue Application', value: 'vue' },
          { title: 'Node.js API', value: 'node-api' },
          { title: 'Full-Stack App', value: 'fullstack' },
          { title: 'CLI Tool', value: 'cli' }
        ]
      }
    },
    
    features: {
      type: 'array',
      interactive: {
        type: 'multiselect',
        prompt: 'Selecteer features:',
        choices: [
          { title: 'TypeScript', value: 'typescript', selected: true },
          { title: 'ESLint', value: 'eslint', selected: true },
          { title: 'Prettier', value: 'prettier', selected: true },
          { title: 'Testing (Jest/Vitest)', value: 'testing', selected: true },
          { title: 'Git Hooks (Husky)', value: 'husky' },
          { title: 'GitHub Actions', value: 'github-actions' },
          { title: 'Docker', value: 'docker' },
          { title: 'Environment Config', value: 'env-config' }
        ]
      }
    },
    
    packageManager: {
      type: 'string',
      interactive: {
        type: 'select',
        prompt: 'Package manager:',
        choices: [
          { title: 'npm', value: 'npm' },
          { title: 'yarn', value: 'yarn' },
          { title: 'pnpm', value: 'pnpm' }
        ]
      }
    },
    
    initGit: {
      type: 'boolean',
      interactive: {
        type: 'confirm',
        prompt: 'Initialize git repository?',
        initial: true
      }
    }
  },
  
  async execute(params, context) {
    const { name, type, features, packageManager, initGit } = params;
    const projectPath = path.join(process.cwd(), name);
    
    console.log(\`\\n🚀 Creating project "\${name}"...\\n\`);
    
    // Stap 1: Maak project directory
    await mkdir(projectPath, { recursive: true });
    process.chdir(projectPath);
    
    // Stap 2: Genereer package.json
    const packageJson = generatePackageJson(name, type, features);
    await writeFile('package.json', JSON.stringify(packageJson, null, 2));
    
    // Stap 3: Maak project structuur
    await createProjectStructure(type, features);
    
    // Stap 4: Genereer configuratie files
    if (features.includes('typescript')) {
      await writeFile('tsconfig.json', generateTsConfig(type));
    }
    
    if (features.includes('eslint')) {
      await writeFile('.eslintrc.js', generateEslintConfig(type, features));
    }
    
    if (features.includes('prettier')) {
      await writeFile('.prettierrc', generatePrettierConfig());
    }
    
    if (features.includes('testing')) {
      await writeFile('jest.config.js', generateJestConfig(features));
    }
    
    if (features.includes('docker')) {
      await writeFile('Dockerfile', generateDockerfile(type));
      await writeFile('docker-compose.yml', generateDockerCompose(name));
    }
    
    if (features.includes('github-actions')) {
      await mkdir('.github/workflows', { recursive: true });
      await writeFile('.github/workflows/ci.yml', generateGithubActions());
    }
    
    // Stap 5: Genereer README met Claude
    const readme = await context.claude.complete({
      prompt: \`Generate a comprehensive README.md for a \${type} project named "\${name}" with these features: \${features.join(', ')}\`,
      model: 'claude-3-sonnet'
    });
    await writeFile('README.md', readme);
    
    // Stap 6: Installeer dependencies
    console.log('\\n📦 Installing dependencies...\\n');
    const installCmd = {
      npm: 'npm install',
      yarn: 'yarn install',
      pnpm: 'pnpm install'
    }[packageManager];
    
    execSync(installCmd, { stdio: 'inherit' });
    
    // Stap 7: Initialize git
    if (initGit) {
      console.log('\\n🔧 Initializing git repository...\\n');
      execSync('git init', { stdio: 'inherit' });
      await writeFile('.gitignore', generateGitignore(type));
      execSync('git add .', { stdio: 'inherit' });
      execSync('git commit -m "Initial commit"', { stdio: 'inherit' });
    }
    
    // Stap 8: Genereer start instructies
    console.log(\`\\n✨ Project "\${name}" created successfully!\\n\`);
    console.log('Next steps:');
    console.log(\`  cd \${name}\`);
    console.log(\`  \${packageManager} run dev\`);
    console.log('\\nHappy coding! 🎉\\n');
    
    return {
      success: true,
      projectPath,
      config: { type, features, packageManager }
    };
  }
};

// Helper functies
function generatePackageJson(name, type, features) {
  const base = {
    name,
    version: '1.0.0',
    description: '',
    scripts: {
      dev: type === 'react' ? 'vite' : 'nodemon src/index.js',
      build: type === 'react' ? 'vite build' : 'tsc',
      test: 'jest',
      lint: 'eslint .',
      format: 'prettier --write .'
    },
    dependencies: {},
    devDependencies: {}
  };
  
  // Voeg dependencies toe op basis van type en features
  if (type === 'react') {
    base.dependencies = {
      'react': '^18.2.0',
      'react-dom': '^18.2.0'
    };
    base.devDependencies['vite'] = '^4.0.0';
  }
  
  if (features.includes('typescript')) {
    base.devDependencies['typescript'] = '^5.0.0';
  }
  
  return base;
}

async function createProjectStructure(type, features) {
  // Maak basis directories
  await mkdir('src', { recursive: true });
  
  if (type === 'react') {
    await mkdir('src/components', { recursive: true });
    await mkdir('src/hooks', { recursive: true });
    await mkdir('src/utils', { recursive: true });
    await mkdir('public', { recursive: true });
  }
  
  if (features.includes('testing')) {
    await mkdir('tests', { recursive: true });
  }
}`,
      hints: [
        'Gebruik interactive parameters met verschillende types (select, multiselect, confirm)',
        'Implementeer validatie functies voor user input',
        'Genereer configuratie files dynamisch op basis van gekozen features',
        'Gebruik execSync voor het uitvoeren van shell commands zoals npm install'
      ]
    },
    {
      id: 'assignment-4-3',
      title: 'Advanced: Workflow Automation Command',
      description: 'Ontwikkel een geavanceerd command dat meerdere andere commands orchestreert voor een complete CI/CD workflow met error recovery.',
      difficulty: 'hard',
      type: 'project',
      initialCode: `// ~/.claude/commands/ci-workflow.ts
// TODO: Implementeer een complete CI/CD workflow command
// Requirements:
// 1. Chain multiple commands (lint, test, build, deploy)
// 2. Implementeer parallel execution waar mogelijk
// 3. Add retry logic voor faalbare operaties
// 4. Implementeer rollback bij failures
// 5. Genereer detailed execution report

export default {
  name: 'ci-workflow',
  description: 'Complete CI/CD workflow automation',
  
  parameters: {
    // TODO: Definieer parameters
  },
  
  async execute(params, context) {
    // TODO: Implementeer workflow orchestration
  }
};`,
      solution: `// ~/.claude/commands/ci-workflow.ts
export default {
  name: 'ci-workflow',
  description: 'Complete CI/CD workflow automation',
  version: '1.0.0',
  
  config: {
    requiresAuth: true,
    requiresProject: true,
    timeout: 1800000 // 30 minutes
  },
  
  parameters: {
    branch: {
      type: 'string',
      required: true,
      description: 'Branch to deploy'
    },
    environment: {
      type: 'string',
      enum: ['development', 'staging', 'production'],
      required: true
    },
    skipTests: {
      type: 'boolean',
      default: false
    },
    parallel: {
      type: 'boolean',
      default: true,
      description: 'Run independent tasks in parallel'
    },
    dryRun: {
      type: 'boolean',
      default: false,
      description: 'Simulate workflow without actual deployment'
    }
  },
  
  async execute(params, context) {
    const { branch, environment, skipTests, parallel, dryRun } = params;
    const startTime = Date.now();
    
    const workflow = {
      id: \`workflow-\${Date.now()}\`,
      status: 'running',
      steps: [],
      artifacts: {},
      metrics: {}
    };
    
    try {
      // Step 1: Pre-flight checks
      await executeStep(workflow, 'preflight', async () => {
        const checks = await Promise.all([
          context.runCommand('git-status', {}),
          context.runCommand('check-dependencies', {}),
          context.runCommand('validate-config', { environment })
        ]);
        
        return { checks };
      });
      
      // Step 2: Quality gates (parallel)
      if (parallel) {
        await executeStep(workflow, 'quality', async () => {
          const [lintResult, typeResult, securityResult] = await Promise.all([
            runWithRetry(() => context.runCommand('lint', { fix: false })),
            runWithRetry(() => context.runCommand('typecheck', {})),
            runWithRetry(() => context.runCommand('security-audit', {}))
          ]);
          
          return { lint: lintResult, types: typeResult, security: securityResult };
        });
      } else {
        await executeStep(workflow, 'lint', () => 
          runWithRetry(() => context.runCommand('lint', { fix: false }))
        );
        await executeStep(workflow, 'typecheck', () => 
          runWithRetry(() => context.runCommand('typecheck', {}))
        );
        await executeStep(workflow, 'security', () => 
          runWithRetry(() => context.runCommand('security-audit', {}))
        );
      }
      
      // Step 3: Tests
      if (!skipTests) {
        await executeStep(workflow, 'tests', async () => {
          const testResult = await runWithRetry(() => 
            context.runCommand('test', {
              coverage: true,
              parallel: true,
              bail: environment === 'production'
            })
          );
          
          workflow.metrics.coverage = testResult.coverage;
          
          if (testResult.failed > 0 && environment === 'production') {
            throw new Error(\`Tests failed: \${testResult.failed} failures\`);
          }
          
          return testResult;
        });
      }
      
      // Step 4: Build
      await executeStep(workflow, 'build', async () => {
        const buildResult = await context.runCommand('build', {
          environment,
          optimize: environment === 'production',
          sourceMaps: environment !== 'production'
        });
        
        workflow.artifacts.build = {
          path: buildResult.outputPath,
          size: buildResult.bundleSize,
          hash: buildResult.contentHash
        };
        
        return buildResult;
      });
      
      // Step 5: Deploy (with rollback capability)
      if (!dryRun) {
        await executeStep(workflow, 'deploy', async () => {
          // Snapshot current state for rollback
          const snapshot = await context.runCommand('create-snapshot', {
            environment
          });
          
          workflow.artifacts.snapshot = snapshot;
          
          try {
            const deployResult = await context.runCommand('deploy', {
              environment,
              branch,
              buildPath: workflow.artifacts.build.path
            });
            
            // Verify deployment
            await verifyDeployment(deployResult.url);
            
            return deployResult;
          } catch (error) {
            console.error('Deployment failed, initiating rollback...');
            
            await context.runCommand('rollback', {
              environment,
              snapshot: snapshot.id
            });
            
            throw new Error(\`Deployment failed and rolled back: \${error.message}\`);
          }
        });
      }
      
      // Step 6: Post-deployment
      await executeStep(workflow, 'post-deploy', async () => {
        const tasks = [
          context.runCommand('clear-cache', { environment }),
          context.runCommand('warm-cache', { environment }),
          context.runCommand('notify-team', {
            message: \`Deployment to \${environment} completed\`,
            channel: 'deployments'
          })
        ];
        
        if (environment === 'production') {
          tasks.push(
            context.runCommand('create-release', {
              version: workflow.artifacts.build.hash,
              notes: await generateReleaseNotes(branch)
            })
          );
        }
        
        return await Promise.all(tasks);
      });
      
      workflow.status = 'success';
      workflow.duration = Date.now() - startTime;
      
      // Generate report
      const report = await generateWorkflowReport(workflow, context);
      console.log(report);
      
      return workflow;
      
    } catch (error) {
      workflow.status = 'failed';
      workflow.error = error.message;
      workflow.duration = Date.now() - startTime;
      
      // Cleanup on failure
      await cleanup(workflow, context);
      
      throw error;
    }
  }
};

// Helper functions
async function executeStep(workflow, name, fn) {
  const step = {
    name,
    startTime: Date.now(),
    status: 'running'
  };
  
  workflow.steps.push(step);
  
  try {
    console.log(\`\\n🔄 Executing: \${name}...\`);
    step.result = await fn();
    step.status = 'success';
    step.duration = Date.now() - step.startTime;
    console.log(\`✅ Completed: \${name} (\${step.duration}ms)\`);
  } catch (error) {
    step.status = 'failed';
    step.error = error.message;
    step.duration = Date.now() - step.startTime;
    console.error(\`❌ Failed: \${name} - \${error.message}\`);
    throw error;
  }
  
  return step;
}

async function runWithRetry(fn, maxRetries = 3) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        console.log(\`Retry \${i + 1}/\${maxRetries} after error: \${error.message}\`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  
  throw lastError;
}

async function verifyDeployment(url) {
  const maxAttempts = 10;
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch (error) {
      if (i === maxAttempts - 1) throw error;
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  throw new Error('Deployment verification failed');
}

async function generateReleaseNotes(branch) {
  // Implementatie voor release notes generatie
  return \`Release from branch \${branch}\`;
}

async function generateWorkflowReport(workflow, context) {
  const report = await context.claude.complete({
    prompt: \`Generate a deployment report for this workflow: \${JSON.stringify(workflow, null, 2)}\`,
    model: 'claude-3-sonnet'
  });
  
  return report;
}

async function cleanup(workflow, context) {
  // Cleanup artifacts en temporary resources
  console.log('🧹 Cleaning up...');
}`,
      hints: [
        'Design een workflow state object om alle steps en results bij te houden',
        'Implementeer executeStep helper voor consistente step execution en logging',
        'Gebruik Promise.all voor parallel execution van onafhankelijke taken',
        'Implementeer retry logic met exponential backoff voor network operations'
      ]
    }
  ]
};