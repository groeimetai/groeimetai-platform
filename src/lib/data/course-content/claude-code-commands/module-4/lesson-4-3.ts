import type { Lesson } from '@/lib/data/courses';

export const lesson4_3: Lesson = {
  id: 'lesson-4-3',
  title: 'Workflow automation',
  duration: '40 min',
  content: `
# Workflow Automation met Claude Code

Automatiseer je complete development workflow met Claude Code. Van build pipelines tot deployment - leer praktische automation scripts die je direct kunt toepassen.

## Task Automation Fundamentals

Claude Code blinkt uit in het automatiseren van repetitieve development taken. Begin met het identificeren van processen die tijd kosten.

### Automation Strategy

\`\`\`typescript
// claude-automation.config.ts
export default {
  workflows: {
    // Definieer je automation workflows
    'daily-standup': {
      triggers: ['schedule:daily:09:00', 'command:standup'],
      steps: ['collect-commits', 'analyze-progress', 'generate-report']
    },
    'pre-commit': {
      triggers: ['git:pre-commit'],
      steps: ['lint', 'test', 'security-scan']
    },
    'release': {
      triggers: ['tag:v*', 'command:release'],
      steps: ['test', 'build', 'changelog', 'deploy']
    }
  }
}
\`\`\`

### Basic Task Automation

\`\`\`bash
# Automatische code review voor elke PR
claude task create "review-pr" \\
  --trigger "github:pull_request" \\
  --steps "analyze-changes,suggest-improvements,check-standards"

# Daily codebase health check
claude task schedule "health-check" \\
  --cron "0 9 * * *" \\
  --script "./scripts/health-check.js"
\`\`\`

## Build Pipeline Integration

Integreer Claude Code naadloos in je build pipelines voor intelligente automation.

### CI/CD Integration

\`\`\`yaml
# .github/workflows/claude-integration.yml
name: Claude Code Automation
on: [push, pull_request]

jobs:
  claude-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Claude Code Analysis
        run: |
          # Installeer Claude CLI
          npm install -g @claude/cli
          
          # Run automated code analysis
          claude analyze --format json > analysis.json
          
          # Generate improvement suggestions
          claude suggest improvements --based-on analysis.json
          
      - name: Claude Test Generation
        if: github.event_name == 'pull_request'
        run: |
          # Genereer tests voor nieuwe code
          claude generate tests --changed-files
          
          # Run de gegenereerde tests
          npm test -- --coverage
\`\`\`

### Build Optimization Script

\`\`\`javascript
// scripts/optimize-build.js
import { claude } from '@claude/sdk';

async function optimizeBuild() {
  console.log('🔍 Analyzing build performance...');
  
  // Analyseer webpack bundle
  const bundleAnalysis = await claude.analyze({
    type: 'webpack-bundle',
    path: './dist',
    metrics: ['size', 'dependencies', 'duplicates']
  });
  
  // Genereer optimalisatie suggesties
  const optimizations = await claude.suggest({
    context: bundleAnalysis,
    goals: ['reduce-size', 'improve-performance']
  });
  
  // Pas automatisch safe optimizations toe
  for (const opt of optimizations.filter(o => o.risk === 'low')) {
    console.log(\`✨ Applying: \${opt.description}\`);
    await claude.apply(opt);
  }
  
  // Rebuild met optimalisaties
  console.log('🏗️ Rebuilding with optimizations...');
  await claude.run('npm run build');
  
  // Vergelijk resultaten
  const newAnalysis = await claude.analyze({
    type: 'webpack-bundle',
    path: './dist'
  });
  
  console.log('📊 Build optimization results:');
  console.log(\`  Size reduction: \${formatBytes(bundleAnalysis.size - newAnalysis.size)}\`);
  console.log(\`  Load time improvement: \${newAnalysis.metrics.loadTime}ms\`);
}

optimizeBuild().catch(console.error);
\`\`\`

## Git Workflow Automation

Automatiseer je complete Git workflow met intelligente Claude Code integraties.

### Smart Commit Messages

\`\`\`bash
# ~/.gitconfig
[alias]
  # Claude-powered commit
  ccommit = "!f() { \\
    changes=$(git diff --staged); \\
    msg=$(claude generate commit-message --changes \"$changes\"); \\
    git commit -m \"$msg\"; \\
  }; f"
  
  # Automatic branch naming
  cbranch = "!f() { \\
    desc=\"$1\"; \\
    branch=$(claude generate branch-name --description \"$desc\"); \\
    git checkout -b \"$branch\"; \\
  }; f"
\`\`\`

### Git Hooks Integration

\`\`\`bash
#!/bin/bash
# .git/hooks/pre-push

echo "🔍 Running Claude Code pre-push checks..."

# Check for security issues
claude security scan --staged
if [ $? -ne 0 ]; then
  echo "❌ Security issues detected. Push aborted."
  exit 1
fi

# Verify test coverage
coverage=$(claude test coverage --min 80)
if [ $? -ne 0 ]; then
  echo "❌ Test coverage below 80%. Push aborted."
  exit 1
fi

# Check for breaking changes
claude analyze breaking-changes --target origin/main
if [ $? -eq 0 ]; then
  echo "⚠️  Breaking changes detected. Please update CHANGELOG.md"
  claude generate changelog --breaking-changes
fi

echo "✅ All checks passed. Pushing to remote..."
\`\`\`

### Automated PR Workflow

\`\`\`javascript
// scripts/auto-pr.js
import { claude, github } from './utils';

async function createSmartPR() {
  const branch = await claude.git.currentBranch();
  const baseBranch = 'main';
  
  // Analyseer changes
  const changes = await claude.analyze({
    type: 'git-diff',
    base: baseBranch,
    head: branch
  });
  
  // Genereer PR content
  const prContent = await claude.generate({
    type: 'pull-request',
    changes: changes,
    include: ['summary', 'testing-notes', 'breaking-changes']
  });
  
  // Voeg visualisaties toe
  const impact = await claude.visualize({
    type: 'code-impact',
    changes: changes,
    format: 'mermaid'
  });
  
  // Creëer PR
  const pr = await github.createPullRequest({
    title: prContent.title,
    body: \`
\${prContent.summary}

## Changes
\${prContent.changesList}

## Testing
\${prContent.testingNotes}

## Impact Analysis
\\\`\\\`\\\`mermaid
\${impact}
\\\`\\\`\\\`

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Performance impact assessed
    \`,
    base: baseBranch,
    head: branch,
    labels: prContent.suggestedLabels
  });
  
  console.log(\`✅ PR created: \${pr.url}\`);
  
  // Start automated checks
  await claude.run('pr-checks', { pr: pr.number });
}

createSmartPR().catch(console.error);
\`\`\`

## Deploy Automation

Automatiseer je deployment process met intelligente safeguards en rollback capabilities.

### Smart Deployment Script

\`\`\`javascript
// scripts/smart-deploy.js
import { claude } from '@claude/sdk';

async function smartDeploy(environment) {
  console.log(\`🚀 Starting smart deployment to \${environment}...\`);
  
  // Pre-deployment checks
  const checks = await claude.runChecks([
    'tests:all',
    'security:scan',
    'performance:baseline',
    'dependencies:audit'
  ]);
  
  if (!checks.allPassed) {
    console.error('❌ Pre-deployment checks failed:', checks.failures);
    return;
  }
  
  // Genereer deployment plan
  const plan = await claude.generate({
    type: 'deployment-plan',
    environment,
    changes: await claude.git.changesSince('last-deploy'),
    riskAssessment: true
  });
  
  console.log('📋 Deployment Plan:', plan.summary);
  
  // Feature flag configuration
  if (plan.hasBreakingChanges) {
    console.log('🏴 Configuring feature flags for gradual rollout...');
    await claude.featureFlags.configure({
      flags: plan.featureFlags,
      rollout: 'gradual',
      percentage: 10
    });
  }
  
  // Execute deployment
  const deployment = await claude.deploy({
    environment,
    strategy: plan.recommendedStrategy,
    monitoring: true
  });
  
  // Monitor deployment health
  const health = await claude.monitor({
    deployment: deployment.id,
    duration: '5m',
    metrics: ['errors', 'performance', 'availability']
  });
  
  if (health.status === 'unhealthy') {
    console.error('❌ Deployment health check failed. Rolling back...');
    await claude.rollback(deployment.id);
    return;
  }
  
  console.log('✅ Deployment successful!');
  
  // Post-deployment tasks
  await claude.notify({
    channel: 'deployments',
    message: \`Deployed to \${environment}: \${deployment.version}\`,
    details: deployment.summary
  });
}

// Multi-stage deployment
async function deployToProduction() {
  // Deploy to staging first
  await smartDeploy('staging');
  
  // Run smoke tests
  const smokeTests = await claude.test({
    environment: 'staging',
    suite: 'smoke'
  });
  
  if (!smokeTests.passed) {
    console.error('❌ Staging smoke tests failed');
    return;
  }
  
  // Wait for manual approval or timeout
  const approved = await claude.waitForApproval({
    timeout: '30m',
    approvers: ['team-lead', 'product-owner']
  });
  
  if (approved) {
    await smartDeploy('production');
  }
}

// Run deployment
const environment = process.argv[2] || 'staging';
smartDeploy(environment).catch(console.error);
\`\`\`

### Rollback Automation

\`\`\`bash
#!/bin/bash
# scripts/auto-rollback.sh

# Monitor deployment health
claude monitor deployment --real-time | while read -r line; do
  if echo "$line" | grep -q "ERROR_THRESHOLD_EXCEEDED"; then
    echo "🚨 Error threshold exceeded! Initiating rollback..."
    
    # Capture current state for analysis
    claude capture state --deployment current > deployment-failure.json
    
    # Perform rollback
    claude rollback --automatic --reason "Error threshold exceeded"
    
    # Analyze failure
    claude analyze failure --data deployment-failure.json
    
    # Create incident report
    claude generate incident-report \\
      --severity high \\
      --notify-team \\
      --create-ticket
    
    exit 1
  fi
done
\`\`\`

## Testing Automation

Automatiseer je complete testing workflow met intelligente test generation en execution.

### Automated Test Generation

\`\`\`javascript
// scripts/auto-test.js
import { claude } from '@claude/sdk';

async function generateMissingTests() {
  // Analyseer code coverage
  const coverage = await claude.analyze({
    type: 'test-coverage',
    detailed: true
  });
  
  // Identificeer untested code
  const untested = coverage.files.filter(f => f.coverage < 80);
  
  for (const file of untested) {
    console.log(\`📝 Generating tests for \${file.path}...\`);
    
    // Genereer tests voor uncovered functies
    const tests = await claude.generate({
      type: 'unit-tests',
      file: file.path,
      coverage: file.uncoveredLines,
      style: 'jest',
      includeEdgeCases: true
    });
    
    // Schrijf tests naar file
    const testFile = file.path.replace('.js', '.test.js');
    await claude.write(testFile, tests);
    
    // Valideer gegenereerde tests
    const validation = await claude.run(\`jest \${testFile} --no-coverage\`);
    
    if (!validation.success) {
      console.log('⚠️  Fixing generated tests...');
      await claude.fix({
        file: testFile,
        errors: validation.errors
      });
    }
  }
  
  // Run complete test suite
  console.log('🧪 Running full test suite...');
  await claude.run('npm test');
}

generateMissingTests().catch(console.error);
\`\`\`

### Continuous Testing Workflow

\`\`\`yaml
# .claude/workflows/continuous-testing.yml
name: Continuous Testing
triggers:
  - file:change:src/**/*.js
  - schedule:hourly

steps:
  - name: Identify Changed Components
    run: |
      claude identify changes --since last-run
      
  - name: Generate Focused Tests
    run: |
      claude generate tests \\
        --focus changed-components \\
        --types "unit,integration" \\
        --coverage-target 90
        
  - name: Run Test Suite
    run: |
      claude test run \\
        --parallel \\
        --fail-fast \\
        --report detailed
        
  - name: Analyze Failures
    if: failure()
    run: |
      claude analyze test-failures \\
        --suggest-fixes \\
        --create-issues
        
  - name: Update Test Documentation
    run: |
      claude generate test-report \\
        --format markdown \\
        --include-coverage \\
        --output docs/test-report.md
\`\`\`

## Practical Automation Examples

### Morning Routine Automation

\`\`\`bash
#!/bin/bash
# scripts/morning-routine.sh

echo "☕ Good morning! Starting your dev environment..."

# Update dependencies
echo "📦 Checking for dependency updates..."
claude check dependencies --update-minor --test-after-update

# Pull latest changes
echo "🔄 Syncing with remote..."
git pull --rebase
claude analyze merge-conflicts --auto-resolve-simple

# Run health checks
echo "🏥 Running project health checks..."
claude health-check --fix-issues --create-todos

# Generate daily summary
echo "📊 Generating daily summary..."
claude generate daily-summary \\
  --include "open-prs,failing-tests,tech-debt" \\
  --format slack \\
  --send-to "#team-channel"

# Start development server
echo "🚀 Starting development environment..."
claude dev start --open-browser --watch

echo "✅ Ready to code! Have a productive day!"
\`\`\`

### End-of-Day Automation

\`\`\`javascript
// scripts/eod-routine.js
async function endOfDayRoutine() {
  console.log('🌙 Running end-of-day routine...');
  
  // Commit work in progress
  const hasChanges = await claude.git.hasUncommittedChanges();
  if (hasChanges) {
    await claude.git.stashWithMessage('WIP: End of day');
    console.log('📦 Work in progress saved');
  }
  
  // Generate progress report
  const report = await claude.generate({
    type: 'daily-progress',
    includeMetrics: true,
    format: 'markdown'
  });
  
  // Update project board
  await claude.updateProjectBoard({
    completedTasks: report.completedTasks,
    moveToColumn: 'Done'
  });
  
  // Plan tomorrow
  const tomorrow = await claude.suggest({
    type: 'daily-tasks',
    basedOn: report,
    prioritize: true
  });
  
  await claude.createTodos(tomorrow.tasks);
  
  console.log('✅ End of day routine complete!');
  console.log(\`📈 Today's stats: \${report.summary}\`);
}

endOfDayRoutine().catch(console.error);
\`\`\`

Deze automation scripts transformeren je workflow van handmatig naar intelligent geautomatiseerd.`,
  assignments: [
    {
      id: 'task-automation-setup',
      title: 'Task Automation Setup',
      description: 'Configureer een complete task automation workflow voor je project. Creëer een automation workflow die: 1) Bij elke code change automatisch tests runt, 2) Code quality checks uitvoert, 3) Security scans draait, 4) Documentatie genereert.',
      difficulty: 'medium',
      type: 'code',
      initialCode: `// automation-workflow.js
import { claude } from '@claude/sdk';

// TODO: Implementeer task automation workflow
async function setupAutomation() {
  // 1. Definieer workflow triggers
  
  // 2. Configureer automation steps
  
  // 3. Implementeer error handling
  
  // 4. Setup monitoring
}

// Test je automation
setupAutomation()
  .then(() => console.log('✅ Automation configured'))
  .catch(console.error);`,
      solution: `// automation-workflow.js
import { claude } from '@claude/sdk';

async function setupAutomation() {
  // 1. Definieer workflow triggers
  const triggers = {
    'code-change': {
      pattern: 'src/**/*.{js,ts}',
      events: ['change', 'add', 'delete']
    },
    'pre-commit': {
      git: 'pre-commit'
    },
    'scheduled': {
      cron: '0 */2 * * *' // Every 2 hours
    }
  };
  
  // 2. Configureer automation steps
  const workflow = await claude.workflow.create({
    name: 'code-quality-automation',
    triggers: triggers['code-change'],
    steps: [
      {
        name: 'lint',
        command: 'npm run lint',
        continueOnError: false
      },
      {
        name: 'test',
        command: 'npm test -- --coverage',
        timeout: 300000, // 5 minutes
        retries: 2
      },
      {
        name: 'security-scan',
        run: async () => {
          const scan = await claude.security.scan({
            paths: ['src', 'tests'],
            severity: 'medium'
          });
          
          if (scan.vulnerabilities.high > 0) {
            throw new Error(\`Found \${scan.vulnerabilities.high} high severity issues\`);
          }
          
          return scan;
        }
      },
      {
        name: 'generate-docs',
        run: async () => {
          const files = await claude.files.find({
            pattern: 'src/**/*.js',
            modified: 'last-24h'
          });
          
          for (const file of files) {
            await claude.generate({
              type: 'documentation',
              file: file,
              output: file.replace('src/', 'docs/').replace('.js', '.md')
            });
          }
        }
      }
    ],
    notifications: {
      onSuccess: {
        slack: '#dev-channel',
        message: '✅ Code quality checks passed'
      },
      onFailure: {
        slack: '#dev-alerts',
        email: 'team@company.com',
        message: '❌ Code quality checks failed: {{error}}'
      }
    }
  });
  
  // 3. Implementeer error handling
  workflow.on('step:error', async (step, error) => {
    console.error(\`Step \${step.name} failed:\`, error);
    
    // Auto-fix common issues
    if (step.name === 'lint' && error.fixable) {
      console.log('🔧 Attempting auto-fix...');
      await claude.run('npm run lint -- --fix');
      
      // Retry the step
      return { retry: true };
    }
    
    // Log detailed error info
    await claude.log({
      level: 'error',
      step: step.name,
      error: error.message,
      stack: error.stack,
      context: await claude.git.getCurrentContext()
    });
  });
  
  // 4. Setup monitoring
  const monitor = await claude.monitor.create({
    workflow: workflow.id,
    metrics: [
      'execution-time',
      'success-rate',
      'error-frequency'
    ],
    alerts: {
      'slow-execution': {
        condition: 'execution-time > 600000', // 10 minutes
        notify: 'slack'
      },
      'high-failure-rate': {
        condition: 'success-rate < 0.8',
        notify: ['slack', 'email']
      }
    }
  });
  
  // Log workflow status
  console.log('📊 Workflow Status:');
  console.log(\`  ID: \${workflow.id}\`);
  console.log(\`  Triggers: \${Object.keys(triggers).join(', ')}\`);
  console.log(\`  Steps: \${workflow.steps.length}\`);
  console.log(\`  Monitoring: \${monitor.id}\`);
  
  return { workflow, monitor };
}

// Test je automation
setupAutomation()
  .then((result) => {
    console.log('✅ Automation configured successfully');
    console.log(\`🔗 View dashboard: http://localhost:3000/workflows/\${result.workflow.id}\`);
  })
  .catch(console.error);`,
      hints: [
        'Begin met simpele triggers en voeg complexiteit gradueel toe',
        'Test elke step individueel voordat je de complete workflow test',
        'Implementeer goede error handling voor robuustheid',
        'Gebruik monitoring om bottlenecks te identificeren',
        'Overweeg parallel execution voor onafhankelijke steps'
      ]
    },
    {
      id: 'ci-cd-integration',
      title: 'CI/CD Pipeline Integration',
      description: 'Integreer Claude Code in je CI/CD pipeline. Bouw een complete CI/CD pipeline met Claude Code integratie: 1) Setup GitHub Actions workflow, 2) Integreer Claude Code analysis, 3) Automatiseer test generation, 4) Implementeer smart deployment. Requirements: Pull request checks, Automatic test generation, Performance monitoring, Rollback capability.',
      difficulty: 'hard',
      type: 'code',
      initialCode: `# .github/workflows/claude-ci-cd.yml
name: Claude CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  claude-analysis:
    runs-on: ubuntu-latest
    steps:
      # TODO: Implementeer Claude Code CI/CD integratie
      - uses: actions/checkout@v3
      
      - name: Setup Claude Code
        run: |
          # Install Claude CLI
          
      - name: Code Analysis
        run: |
          # Run Claude analysis
          
      - name: Test Generation
        run: |
          # Generate missing tests
          
      - name: Deploy
        if: github.ref == 'refs/heads/main'
        run: |
          # Smart deployment`,
      solution: `# .github/workflows/claude-ci-cd.yml
name: Claude CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  CLAUDE_API_KEY: \${{ secrets.CLAUDE_API_KEY }}

jobs:
  claude-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Full history for better analysis
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Setup Claude Code
        run: |
          # Install Claude CLI globally
          npm install -g @claude/cli
          
          # Verify installation
          claude --version
          
          # Configure Claude
          claude config set api.key "$CLAUDE_API_KEY"
          claude config set ci.mode true
      
      - name: Code Analysis
        id: analysis
        run: |
          echo "🔍 Running comprehensive code analysis..."
          
          # Analyze code quality
          claude analyze quality \\
            --format json \\
            --output analysis-report.json
          
          # Check for security issues
          claude security scan \\
            --severity medium \\
            --fail-on high
          
          # Analyze complexity
          claude analyze complexity \\
            --threshold 10 \\
            --report complexity-report.md
          
          # Set outputs for next steps
          echo "quality_score=$(jq .score analysis-report.json)" >> $GITHUB_OUTPUT
          
      - name: Test Generation
        if: github.event_name == 'pull_request'
        run: |
          echo "🧪 Generating tests for changed files..."
          
          # Get changed files
          CHANGED_FILES=$(git diff --name-only origin/main...HEAD | grep -E '\\.(js|ts)$' | grep -v test)
          
          # Generate tests for each changed file
          for file in $CHANGED_FILES; do
            echo "Generating tests for $file..."
            
            claude generate tests \\
              --file "$file" \\
              --coverage-target 90 \\
              --include-edge-cases \\
              --framework jest
          done
          
          # Run all tests including generated ones
          npm test -- --coverage --json --outputFile=test-results.json
          
          # Analyze test results
          claude analyze test-results \\
            --input test-results.json \\
            --suggest-improvements
      
      - name: Performance Analysis
        run: |
          echo "⚡ Analyzing performance impact..."
          
          # Build the project
          npm run build
          
          # Analyze bundle size
          claude analyze bundle \\
            --path dist \\
            --compare-with origin/main \\
            --fail-on "size-increase>10%"
          
          # Run performance tests
          claude test performance \\
            --scenarios "load,interaction,api" \\
            --baseline main \\
            --report performance-report.html
      
      - name: Generate PR Comment
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            
            // Read analysis results
            const analysis = JSON.parse(fs.readFileSync('analysis-report.json', 'utf8'));
            const complexity = fs.readFileSync('complexity-report.md', 'utf8');
            
            // Generate comprehensive PR comment
            const comment = \`## 🤖 Claude Code Analysis Results
            
            ### 📊 Code Quality Score: \${analysis.score}/100
            
            #### ✅ Strengths
            \${analysis.strengths.map(s => \`- \${s}\`).join('\\n')}
            
            #### ⚠️ Areas for Improvement
            \${analysis.improvements.map(i => \`- \${i}\`).join('\\n')}
            
            ### 📈 Complexity Analysis
            \${complexity}
            
            ### 🧪 Test Coverage
            - Current: \${analysis.coverage.current}%
            - Target: 90%
            - New tests generated: \${analysis.testsGenerated}
            
            ### ⚡ Performance Impact
            - Bundle size change: \${analysis.bundleSizeChange}
            - Estimated load time impact: \${analysis.loadTimeImpact}ms
            
            <details>
            <summary>View detailed recommendations</summary>
            
            \${analysis.detailedRecommendations}
            
            </details>\`;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
      
      - name: Upload Artifacts
        uses: actions/upload-artifact@v3
        with:
          name: claude-analysis-reports
          path: |
            analysis-report.json
            complexity-report.md
            performance-report.html
            test-results.json
  
  deploy:
    needs: claude-analysis
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Deployment
        run: |
          npm install -g @claude/cli
          claude config set api.key "$CLAUDE_API_KEY"
      
      - name: Pre-deployment Validation
        run: |
          echo "🔐 Running pre-deployment checks..."
          
          # Security validation
          claude security validate \\
            --environment production \\
            --strict
          
          # Dependency audit
          claude audit dependencies \\
            --fix-vulnerabilities \\
            --fail-on critical
      
      - name: Smart Deployment
        id: deploy
        run: |
          echo "🚀 Starting intelligent deployment..."
          
          # Generate deployment plan
          claude deploy plan \\
            --environment production \\
            --strategy blue-green \\
            --output deploy-plan.json
          
          # Execute deployment with monitoring
          claude deploy execute \\
            --plan deploy-plan.json \\
            --monitor \\
            --rollback-on-error \\
            --health-check-interval 30s
          
          # Get deployment ID
          DEPLOY_ID=$(jq -r .deploymentId deploy-plan.json)
          echo "deployment_id=$DEPLOY_ID" >> $GITHUB_OUTPUT
      
      - name: Post-deployment Verification
        run: |
          echo "✅ Verifying deployment..."
          
          # Run smoke tests
          claude test smoke \\
            --environment production \\
            --timeout 5m
          
          # Monitor initial performance
          claude monitor deployment \\
            --id \${{ steps.deploy.outputs.deployment_id }} \\
            --duration 10m \\
            --metrics "response-time,error-rate,throughput"
      
      - name: Notify Team
        if: always()
        uses: actions/github-script@v6
        with:
          script: |
            const status = \${{ job.status }};
            const deploymentId = '\${{ steps.deploy.outputs.deployment_id }}';
            
            const notification = {
              title: status === 'success' ? '✅ Deployment Successful' : '❌ Deployment Failed',
              description: \`Deployment \${deploymentId} to production \${status}\`,
              color: status === 'success' ? 'good' : 'danger'
            };
            
            // Send Slack notification
            // await sendSlackNotification(notification);
            
            console.log(\`Deployment \${status}: \${deploymentId}\`);`,
      hints: [
        'Cache Claude CLI installation voor snellere builds',
        'Gebruik GitHub Secrets voor API keys',
        'Implementeer gradual rollout voor production deployments',
        'Monitor key metrics na deployment',
        'Setup automated rollback triggers',
        'Gebruik artifacts voor report sharing tussen jobs'
      ]
    }
  ],
  resources: [
    {
      title: 'Claude Code Automation Guide',
      url: 'https://docs.claude.ai/automation',
      type: 'documentation'
    },
    {
      title: 'CI/CD Best Practices',
      url: 'https://docs.github.com/actions/deployment/about-deployments',
      type: 'guide'
    },
    {
      title: 'Git Hooks Documentation',
      url: 'https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks',
      type: 'documentation'
    },
    {
      title: 'Deployment Automation Patterns',
      url: 'https://martinfowler.com/articles/patterns-of-distributed-systems/',
      type: 'article'
    }
  ]
};