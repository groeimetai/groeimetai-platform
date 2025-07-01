import type { Lesson } from '@/lib/data/courses';

export const lesson2_3: Lesson = {
  id: 'lesson-2-3',
  title: 'Code quality analyse',
  duration: '35 min',
  content: `
# Code Quality Analyse met Claude Code

Leer hoe je Claude Code kunt gebruiken voor uitgebreide code quality analyse, van het detecteren van code smells tot het identificeren van security vulnerabilities.

## Code Smell Detection

Claude Code kan verschillende soorten code smells detecteren die kunnen wijzen op onderliggende problemen in je codebase.

### Veelvoorkomende Code Smells

1. **Duplicate Code**
   - Gedupliceerde logica in verschillende bestanden
   - Copy-paste programmeren
   - Vergelijkbare functies met kleine verschillen

2. **Long Methods**
   - Functies die te veel verantwoordelijkheden hebben
   - Methoden langer dan 20-30 regels
   - Complexe nested structures

3. **Large Classes**
   - Classes met te veel verantwoordelijkheden
   - God objects die alles doen
   - Violation van Single Responsibility Principle

### Detectie Workflow

\`\`\`bash
# Start code smell analyse
./claude-flow sparc run analyzer "Detect code smells in src/"

# Specifieke smell detectie
./claude-flow sparc "Find duplicate code patterns in authentication module"

# Geautomatiseerde smell rapportage
./claude-flow swarm "Analyze code quality issues" --strategy analysis --output html
\`\`\`

## Complexity Analysis

Analyseer de complexiteit van je code om maintenance hotspots te identificeren.

### Cyclomatic Complexity

Meet de complexiteit van functies door het aantal onafhankelijke paden te tellen:

\`\`\`bash
# Complexity analyse voor hele project
./claude-flow sparc run analyzer "Calculate cyclomatic complexity for all functions"

# Focus op high-complexity functies
./claude-flow sparc "Identify functions with complexity > 10"

# Genereer complexity heatmap
./claude-flow sparc "Create complexity heatmap visualization"
\`\`\`

### Cognitive Complexity

Analyseer hoe moeilijk code is om te begrijpen:

\`\`\`bash
# Cognitive complexity analyse
./claude-flow sparc "Analyze cognitive complexity of business logic"

# Refactoring suggesties
./claude-flow sparc "Suggest refactoring for high cognitive complexity areas"
\`\`\`

## Security Vulnerability Scanning

Identificeer potentiële security issues in je codebase.

### Common Vulnerabilities

1. **SQL Injection**
\`\`\`bash
./claude-flow sparc run reviewer "Scan for SQL injection vulnerabilities"
\`\`\`

2. **XSS (Cross-Site Scripting)**
\`\`\`bash
./claude-flow sparc "Check for XSS vulnerabilities in React components"
\`\`\`

3. **Authentication Issues**
\`\`\`bash
./claude-flow sparc "Review authentication implementation for security flaws"
\`\`\`

### Security Audit Workflow

\`\`\`bash
# Comprehensive security scan
./claude-flow swarm "Perform security audit" --strategy analysis --mode centralized

# Store findings voor tracking
./claude-flow memory store "security_audit_$(date +%Y%m%d)" "Security findings report"

# Generate remediation plan
./claude-flow sparc "Create security remediation plan based on audit findings"
\`\`\`

## Performance Bottleneck Identification

Vind performance problemen voordat ze productie bereiken.

### Performance Analysis Patterns

\`\`\`bash
# Database query analysis
./claude-flow sparc run analyzer "Identify N+1 queries and slow database operations"

# Frontend performance
./claude-flow sparc "Analyze React component render performance"

# API endpoint analysis
./claude-flow sparc "Profile API endpoints for performance bottlenecks"
\`\`\`

### Memory Leak Detection

\`\`\`bash
# Memory usage patterns
./claude-flow sparc "Detect potential memory leaks in Node.js application"

# Frontend memory analysis
./claude-flow sparc "Analyze memory usage in React components"
\`\`\`

## Technical Debt Assessment

Systematisch technical debt identificeren en prioriteren.

### Debt Categorization

1. **Design Debt**
   - Architectural violations
   - Missing abstractions
   - Tight coupling

2. **Code Debt**
   - Code smells
   - Missing tests
   - Poor documentation

3. **Infrastructure Debt**
   - Outdated dependencies
   - Missing monitoring
   - Manual processes

### Technical Debt Workflow

\`\`\`bash
# Comprehensive debt assessment
./claude-flow swarm "Assess technical debt across codebase" \\
  --strategy analysis \\
  --mode hierarchical \\
  --max-agents 5

# Prioritize debt items
./claude-flow sparc "Prioritize technical debt by impact and effort"

# Create debt reduction roadmap
./claude-flow sparc run architect "Create technical debt reduction roadmap"
\`\`\`

## Quality Improvement Workflows

### Continuous Quality Monitoring

\`\`\`bash
# Setup quality gates
./claude-flow workflow quality-gates.yaml

# Automated quality checks
./claude-flow sparc "Create pre-commit hooks for quality checks"

# Quality dashboard
./claude-flow monitor --metrics quality
\`\`\`

### Refactoring Workflow

\`\`\`bash
# Identify refactoring candidates
./claude-flow sparc run analyzer "Identify top 10 refactoring opportunities"

# Plan refactoring
./claude-flow sparc run architect "Design refactoring plan for identified issues"

# Execute refactoring
./claude-flow sparc tdd "Refactor UserService with test coverage"

# Verify improvements
./claude-flow sparc "Compare code quality metrics before and after refactoring"
\`\`\`

### Quality Report Generation

\`\`\`bash
# Generate comprehensive quality report
./claude-flow swarm "Generate code quality report" \\
  --strategy analysis \\
  --output html \\
  --parallel

# Store in memory for tracking
./claude-flow memory store "quality_baseline_$(date +%Y%m%d)" "Quality metrics snapshot"

# Track quality trends
./claude-flow sparc "Analyze quality trends over past month"
\`\`\`

## Best Practices

1. **Regular Analysis**
   - Run quality checks weekly
   - Integrate into CI/CD pipeline
   - Track metrics over time

2. **Actionable Results**
   - Focus op high-impact issues
   - Create concrete improvement tasks
   - Measure improvement progress

3. **Team Collaboration**
   - Share quality reports
   - Collaborative refactoring sessions
   - Knowledge sharing on quality patterns

## Integration met Development Workflow

\`\`\`bash
# Pre-commit quality check
./claude-flow sparc "Setup pre-commit quality validation"

# Pull request analysis
./claude-flow sparc "Analyze PR for quality issues"

# Automated quality feedback
./claude-flow workflow quality-feedback.yaml
\`\`\`
  `,
  codeExamples: [
    {
      id: 'code-smell-detection',
      title: 'Code Smell Detection Script',
      language: 'bash',
      code: `# Comprehensive code smell detection
./claude-flow swarm "Detect code smells in src/" \\
  --strategy analysis \\
  --mode distributed \\
  --parallel \\
  --output json

# Parse results and create tasks
./claude-flow sparc "Parse smell detection results and create refactoring tasks"

# Store findings for tracking
./claude-flow memory store "code_smells_$(date +%Y%m%d)" \\
  "$(cat smell_detection_results.json)"`,
      explanation: 'Dit script voert een uitgebreide code smell detectie uit met parallel analysis agents, parseert de resultaten, en slaat ze op voor tracking.'
    },
    {
      id: 'security-scan-workflow',
      title: 'Security Vulnerability Scan Workflow',
      language: 'bash',
      code: `#!/bin/bash
# security-scan.sh - Comprehensive security scanning workflow

echo "Starting security vulnerability scan..."

# Phase 1: Dependency scanning
./claude-flow sparc run analyzer \\
  "Scan npm dependencies for known vulnerabilities"

# Phase 2: Code security analysis
./claude-flow swarm "Analyze code for security vulnerabilities" \\
  --strategy analysis \\
  --mode centralized \\
  --max-agents 3 << 'EOF'
Focus areas:
- SQL injection patterns
- XSS vulnerabilities  
- Authentication flaws
- Insecure data handling
- API security issues
EOF

# Phase 3: Generate report and remediation plan
./claude-flow sparc run architect \\
  "Create security remediation plan based on findings"

# Store results
./claude-flow memory store "security_scan_$(date +%Y%m%d)" \\
  "Security scan completed with findings"

echo "Security scan complete. Check reports/ for details."`,
      explanation: 'Een complete security scanning workflow die dependencies, code patterns, en security best practices analyseert.'
    },
    {
      id: 'performance-analysis',
      title: 'Performance Bottleneck Analysis',
      language: 'typescript',
      code: `// performance-analyzer.ts
import { ClaudeFlow } from '@claude-flow/core';

async function analyzePerformance() {
  const flow = new ClaudeFlow();
  
  // Analyze database queries
  const dbAnalysis = await flow.sparc.run('analyzer', {
    task: 'Identify slow database queries and N+1 problems',
    options: {
      include: ['src/api', 'src/services'],
      threshold: { queryTime: 100 } // ms
    }
  });
  
  // Analyze API endpoints
  const apiAnalysis = await flow.sparc.run('analyzer', {
    task: 'Profile API endpoint performance',
    options: {
      measureMemory: true,
      measureCPU: true,
      includeCallStack: true
    }
  });
  
  // Analyze frontend components
  const frontendAnalysis = await flow.sparc.run('analyzer', {
    task: 'Measure React component render performance',
    options: {
      detectMemoryLeaks: true,
      analyzeReRenders: true
    }
  });
  
  // Generate comprehensive report
  const report = await flow.swarm({
    objective: 'Create performance optimization roadmap',
    strategy: 'analysis',
    context: {
      dbAnalysis,
      apiAnalysis,
      frontendAnalysis
    }
  });
  
  // Store baseline for comparison
  await flow.memory.store(
    'performance_baseline',
    JSON.stringify(report)
  );
  
  return report;
}

// Run analysis
analyzePerformance()
  .then(report => console.log('Analysis complete:', report))
  .catch(err => console.error('Analysis failed:', err));`,
      explanation: 'Een TypeScript script dat verschillende performance aspecten analyseert en een optimization roadmap genereert.'
    }
  ],
  assignments: [
    {
      id: 'assignment-2-3-1',
      title: 'Code Quality Audit',
      description: 'Voer een complete code quality audit uit op een bestaand project en creëer een improvement plan.',
      difficulty: 'hard',
      type: 'project',
      initialCode: `#!/bin/bash
# quality-audit.sh - Voer een code quality audit uit

# TODO: Implementeer de volgende stappen:
# 1. Code smell detection
# 2. Complexity analysis  
# 3. Security scanning
# 4. Performance analysis
# 5. Technical debt assessment
# 6. Generate comprehensive report
# 7. Create improvement roadmap

echo "Starting quality audit..."

# Jouw implementatie hier`,
      solution: `#!/bin/bash
# quality-audit.sh - Complete code quality audit implementation

echo "Starting comprehensive quality audit..."

# Initialize audit tracking
AUDIT_ID="audit_$(date +%Y%m%d_%H%M%S)"
mkdir -p "reports/$AUDIT_ID"

# Step 1: Code smell detection
echo "Phase 1: Detecting code smells..."
./claude-flow swarm "Detect all code smells in src/" \\
  --strategy analysis \\
  --mode distributed \\
  --parallel \\
  --output "reports/$AUDIT_ID/code_smells.json"

# Step 2: Complexity analysis
echo "Phase 2: Analyzing code complexity..."
./claude-flow sparc run analyzer \\
  "Calculate cyclomatic and cognitive complexity for all modules" \\
  > "reports/$AUDIT_ID/complexity_report.txt"

# Step 3: Security scanning
echo "Phase 3: Scanning for security vulnerabilities..."
./claude-flow swarm "Perform comprehensive security audit" \\
  --strategy analysis \\
  --mode centralized \\
  --max-agents 3 \\
  --output "reports/$AUDIT_ID/security_findings.json"

# Step 4: Performance analysis
echo "Phase 4: Analyzing performance bottlenecks..."
./claude-flow sparc run analyzer \\
  "Identify performance bottlenecks in database, API, and frontend" \\
  > "reports/$AUDIT_ID/performance_analysis.txt"

# Step 5: Technical debt assessment
echo "Phase 5: Assessing technical debt..."
./claude-flow swarm "Assess and categorize technical debt" \\
  --strategy analysis \\
  --mode hierarchical \\
  --output "reports/$AUDIT_ID/tech_debt.json"

# Step 6: Generate comprehensive report
echo "Phase 6: Generating comprehensive report..."
./claude-flow sparc run documenter \\
  "Create executive summary of all quality findings in reports/$AUDIT_ID" \\
  > "reports/$AUDIT_ID/executive_summary.md"

# Step 7: Create improvement roadmap
echo "Phase 7: Creating improvement roadmap..."
./claude-flow sparc run architect \\
  "Create prioritized improvement roadmap based on audit findings" \\
  > "reports/$AUDIT_ID/improvement_roadmap.md"

# Store audit results in memory
./claude-flow memory store "$AUDIT_ID" \\
  "Quality audit completed. Reports available in reports/$AUDIT_ID"

# Generate HTML dashboard
./claude-flow sparc "Generate HTML quality dashboard from audit results" \\
  > "reports/$AUDIT_ID/dashboard.html"

echo "Quality audit complete!"
echo "Results saved in: reports/$AUDIT_ID/"
echo "View dashboard: open reports/$AUDIT_ID/dashboard.html"`,
      hints: [
        'Begin met het organiseren van de audit in duidelijke fasen',
        'Gebruik swarm mode voor parallelle analyse waar mogelijk',
        'Sla alle resultaten op in een gestructureerde folder',
        'Gebruik memory om audit resultaten te tracken',
        'Genereer zowel technische als executive reports'
      ]
    },
    {
      id: 'assignment-2-3-2',
      title: 'Refactoring Workflow Automation',
      description: 'Creëer een geautomatiseerde workflow voor het identificeren en refactoren van problematische code.',
      difficulty: 'medium',
      type: 'code',
      initialCode: `// refactoring-workflow.js
// Implementeer een workflow die:
// 1. Code quality issues identificeert
// 2. Refactoring suggesties genereert
// 3. Tests schrijft voor de refactoring
// 4. De refactoring uitvoert
// 5. Verifieert dat alles nog werkt

async function automatedRefactoring(targetModule) {
  // TODO: Implementeer de workflow
}`,
      solution: `// refactoring-workflow.js
const { ClaudeFlow } = require('@claude-flow/core');

async function automatedRefactoring(targetModule) {
  const flow = new ClaudeFlow();
  const timestamp = new Date().toISOString();
  
  console.log(\`Starting automated refactoring for: \${targetModule}\`);
  
  try {
    // Step 1: Identify quality issues
    console.log('Step 1: Identifying code quality issues...');
    const issues = await flow.sparc.run('analyzer', {
      task: \`Analyze code quality issues in \${targetModule}\`,
      options: {
        checkComplexity: true,
        checkSmells: true,
        checkDuplication: true
      }
    });
    
    // Store initial state
    await flow.memory.store(\`refactor_\${timestamp}_before\`, {
      module: targetModule,
      issues: issues
    });
    
    // Step 2: Generate refactoring suggestions
    console.log('Step 2: Generating refactoring suggestions...');
    const suggestions = await flow.sparc.run('architect', {
      task: 'Generate refactoring plan based on identified issues',
      context: issues
    });
    
    // Step 3: Write tests for refactoring
    console.log('Step 3: Writing tests for safe refactoring...');
    await flow.sparc.tdd({
      feature: \`Comprehensive tests for \${targetModule} refactoring\`,
      requirements: suggestions.testRequirements
    });
    
    // Step 4: Execute refactoring
    console.log('Step 4: Executing refactoring...');
    const refactoringTasks = suggestions.tasks.map(task => ({
      id: \`refactor_\${task.id}\`,
      content: task.description,
      status: 'pending',
      priority: task.priority
    }));
    
    // Use TodoWrite to track refactoring progress
    await flow.todo.write(refactoringTasks);
    
    // Execute refactoring with swarm
    const refactoringResult = await flow.swarm({
      objective: \`Refactor \${targetModule} according to plan\`,
      strategy: 'development',
      mode: 'centralized',
      tasks: refactoringTasks
    });
    
    // Step 5: Verify everything works
    console.log('Step 5: Verifying refactoring...');
    const verification = await flow.sparc.run('tester', {
      task: 'Run all tests and verify refactoring success'
    });
    
    // Compare before/after metrics
    const afterMetrics = await flow.sparc.run('analyzer', {
      task: \`Re-analyze \${targetModule} after refactoring\`,
      options: {
        compareWithBaseline: true
      }
    });
    
    // Store final state
    await flow.memory.store(\`refactor_\${timestamp}_after\`, {
      module: targetModule,
      result: refactoringResult,
      verification: verification,
      metrics: afterMetrics
    });
    
    // Generate report
    const report = await flow.sparc.run('documenter', {
      task: 'Generate refactoring report with before/after comparison'
    });
    
    console.log('Refactoring completed successfully!');
    return {
      success: true,
      report: report,
      improvements: afterMetrics.improvements
    };
    
  } catch (error) {
    console.error('Refactoring failed:', error);
    
    // Rollback if needed
    await flow.sparc.run('coder', {
      task: 'Rollback refactoring changes due to failure'
    });
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Example usage
automatedRefactoring('src/services/UserService')
  .then(result => {
    if (result.success) {
      console.log('Improvements:', result.improvements);
    } else {
      console.log('Failed:', result.error);
    }
  });`,
      hints: [
        'Gebruik TodoWrite om refactoring taken te tracken',
        'Schrijf eerst tests voordat je gaat refactoren',
        'Gebruik memory om before/after states te vergelijken',
        'Implementeer rollback functionaliteit voor veiligheid'
      ]
    }
  ]
};