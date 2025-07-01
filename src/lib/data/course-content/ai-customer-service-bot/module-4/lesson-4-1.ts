import type { Lesson } from '@/lib/data/courses';

export const lesson41: Lesson = {
  id: 'ai-customer-service-bot-4-1',
  title: 'Testing en quality assurance: Van prototype naar productie',
  duration: '45 minuten',
  content: `
# Testing en Quality Assurance voor Chatbots

Het testen van een chatbot gaat verder dan traditionele software testing. In deze les leren we hoe je systematisch je bot test en klaar maakt voor productie.

## Wat gaan we doen?

In deze praktische les leer je:
- **Testing methodologieën** specifiek voor conversational AI
- **Scenario-based testing** voor verschillende user journeys
- **Performance testing** voor schaalbaarheid
- **UAT (User Acceptance Testing)** met echte gebruikers
- **Deployment checklist** voor productie-ready bots

## Testing Framework voor Chatbots

### 1. Unit Testing voor Intents

Test individuele intents en entities recognition:

\`\`\`javascript
// Test framework voor intent recognition
class IntentTester {
  constructor(nlpModel) {
    this.nlpModel = nlpModel;
    this.testResults = [];
  }

  async testIntent(testCase) {
    const { input, expectedIntent, expectedEntities } = testCase;
    
    try {
      const result = await this.nlpModel.process(input);
      
      const passed = 
        result.intent === expectedIntent &&
        this.validateEntities(result.entities, expectedEntities);
      
      this.testResults.push({
        testCase,
        result,
        passed,
        timestamp: new Date()
      });
      
      return passed;
    } catch (error) {
      this.testResults.push({
        testCase,
        error: error.message,
        passed: false,
        timestamp: new Date()
      });
      return false;
    }
  }

  validateEntities(actual, expected) {
    if (!expected) return true;
    
    return Object.keys(expected).every(key => {
      return actual[key] && actual[key].value === expected[key];
    });
  }

  async runTestSuite(testSuite) {
    console.log(\`Running test suite: \${testSuite.name}\`);
    let passed = 0;
    
    for (const test of testSuite.tests) {
      if (await this.testIntent(test)) {
        passed++;
      }
    }
    
    console.log(\`Results: \${passed}/\${testSuite.tests.length} passed\`);
    return this.generateReport();
  }

  generateReport() {
    const total = this.testResults.length;
    const passed = this.testResults.filter(r => r.passed).length;
    const failed = total - passed;
    
    return {
      total,
      passed,
      failed,
      successRate: (passed / total * 100).toFixed(2) + '%',
      details: this.testResults,
      summary: this.generateSummary()
    };
  }

  generateSummary() {
    const failedTests = this.testResults.filter(r => !r.passed);
    const intentAccuracy = {};
    
    this.testResults.forEach(result => {
      if (result.testCase) {
        const intent = result.testCase.expectedIntent;
        if (!intentAccuracy[intent]) {
          intentAccuracy[intent] = { total: 0, correct: 0 };
        }
        intentAccuracy[intent].total++;
        if (result.passed) {
          intentAccuracy[intent].correct++;
        }
      }
    });
    
    return {
      intentAccuracy,
      commonFailures: this.analyzeFailures(failedTests)
    };
  }

  analyzeFailures(failedTests) {
    // Groepeer failures op type
    const failureTypes = {};
    
    failedTests.forEach(test => {
      const type = test.error ? 'error' : 'mismatch';
      if (!failureTypes[type]) {
        failureTypes[type] = [];
      }
      failureTypes[type].push(test);
    });
    
    return failureTypes;
  }
}

// Voorbeeld test suite
const orderTestSuite = {
  name: "Order Status Intent Tests",
  tests: [
    {
      input: "Waar is mijn bestelling?",
      expectedIntent: "check_order_status",
      expectedEntities: null
    },
    {
      input: "Status van order #12345",
      expectedIntent: "check_order_status",
      expectedEntities: {
        orderNumber: "12345"
      }
    },
    {
      input: "Ik wil weten waar mijn pakket is",
      expectedIntent: "check_order_status",
      expectedEntities: null
    },
    {
      input: "Wanneer komt bestelling 98765 aan?",
      expectedIntent: "check_order_status",
      expectedEntities: {
        orderNumber: "98765"
      }
    }
  ]
};
\`\`\`

### 2. Conversation Flow Testing

Test complete conversatie flows:

\`\`\`javascript
// Conversation flow tester
class ConversationTester {
  constructor(bot) {
    this.bot = bot;
    this.sessions = new Map();
  }

  async testConversationFlow(flow) {
    const sessionId = this.generateSessionId();
    const results = [];
    
    console.log(\`Testing flow: \${flow.name}\`);
    
    for (const step of flow.steps) {
      const response = await this.bot.processMessage(
        step.input,
        sessionId
      );
      
      const stepResult = this.validateStep(step, response);
      results.push({
        step: step.name,
        input: step.input,
        expectedOutput: step.expectedOutput,
        actualOutput: response,
        passed: stepResult.passed,
        errors: stepResult.errors
      });
      
      if (!stepResult.passed && step.critical) {
        console.error(\`Critical step failed: \${step.name}\`);
        break;
      }
    }
    
    return {
      flow: flow.name,
      passed: results.every(r => r.passed),
      results,
      coverage: this.calculateCoverage(flow, results)
    };
  }

  validateStep(step, response) {
    const errors = [];
    let passed = true;
    
    // Check response type
    if (step.expectedType && response.type !== step.expectedType) {
      errors.push(\`Expected type \${step.expectedType}, got \${response.type}\`);
      passed = false;
    }
    
    // Check for required keywords
    if (step.requiredKeywords) {
      const responseText = response.text.toLowerCase();
      step.requiredKeywords.forEach(keyword => {
        if (!responseText.includes(keyword.toLowerCase())) {
          errors.push(\`Missing required keyword: \${keyword}\`);
          passed = false;
        }
      });
    }
    
    // Check for forbidden keywords
    if (step.forbiddenKeywords) {
      const responseText = response.text.toLowerCase();
      step.forbiddenKeywords.forEach(keyword => {
        if (responseText.includes(keyword.toLowerCase())) {
          errors.push(\`Contains forbidden keyword: \${keyword}\`);
          passed = false;
        }
      });
    }
    
    // Check buttons/quick replies
    if (step.expectedButtons) {
      const actualButtons = response.buttons || [];
      step.expectedButtons.forEach(expectedButton => {
        if (!actualButtons.some(b => b.text === expectedButton)) {
          errors.push(\`Missing expected button: \${expectedButton}\`);
          passed = false;
        }
      });
    }
    
    // Custom validation
    if (step.customValidation) {
      const customResult = step.customValidation(response);
      if (!customResult.passed) {
        errors.push(...customResult.errors);
        passed = false;
      }
    }
    
    return { passed, errors };
  }

  calculateCoverage(flow, results) {
    const totalSteps = flow.steps.length;
    const passedSteps = results.filter(r => r.passed).length;
    const criticalSteps = flow.steps.filter(s => s.critical).length;
    const passedCriticalSteps = results.filter(
      (r, i) => r.passed && flow.steps[i].critical
    ).length;
    
    return {
      overall: (passedSteps / totalSteps * 100).toFixed(2) + '%',
      critical: (passedCriticalSteps / criticalSteps * 100).toFixed(2) + '%',
      details: {
        totalSteps,
        passedSteps,
        criticalSteps,
        passedCriticalSteps
      }
    };
  }

  generateSessionId() {
    return 'test-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}

// Voorbeeld conversation flow test
const orderStatusFlow = {
  name: "Complete Order Status Check",
  steps: [
    {
      name: "Initial greeting",
      input: "Hallo",
      expectedType: "text",
      requiredKeywords: ["hallo", "welkom"],
      critical: false
    },
    {
      name: "Ask for order status",
      input: "Ik wil mijn orderstatus checken",
      expectedType: "text",
      requiredKeywords: ["order", "nummer"],
      expectedButtons: ["Ordernummer invoeren", "Geen ordernummer"],
      critical: true
    },
    {
      name: "Provide order number",
      input: "12345",
      expectedType: "text",
      customValidation: (response) => {
        const hasStatus = response.text.includes("status") || 
                         response.text.includes("verzonden");
        const hasDate = /\\d{1,2}-\\d{1,2}-\\d{4}/.test(response.text);
        
        return {
          passed: hasStatus && hasDate,
          errors: [
            !hasStatus && "Missing order status information",
            !hasDate && "Missing delivery date"
          ].filter(Boolean)
        };
      },
      critical: true
    }
  ]
};
\`\`\`

### 3. Performance en Load Testing

Test de schaalbaarheid van je bot:

\`\`\`javascript
// Performance tester voor chatbots
class PerformanceTester {
  constructor(bot, config = {}) {
    this.bot = bot;
    this.config = {
      maxConcurrentUsers: config.maxConcurrentUsers || 100,
      testDuration: config.testDuration || 60000, // 1 minuut
      messageInterval: config.messageInterval || 2000, // 2 seconden
      ...config
    };
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      errors: []
    };
  }

  async runLoadTest() {
    console.log('Starting load test...');
    const startTime = Date.now();
    const users = [];
    
    // Creëer virtuele gebruikers
    for (let i = 0; i < this.config.maxConcurrentUsers; i++) {
      users.push(this.simulateUser(\`user-\${i}\`, startTime));
    }
    
    // Wacht tot alle gebruikers klaar zijn
    await Promise.all(users);
    
    return this.generatePerformanceReport();
  }

  async simulateUser(userId, startTime) {
    const sessionId = \`perf-test-\${userId}\`;
    const userScenarios = this.getUserScenarios();
    
    while (Date.now() - startTime < this.config.testDuration) {
      const scenario = userScenarios[
        Math.floor(Math.random() * userScenarios.length)
      ];
      
      for (const message of scenario.messages) {
        const requestStart = Date.now();
        
        try {
          const response = await this.bot.processMessage(
            message,
            sessionId
          );
          
          const responseTime = Date.now() - requestStart;
          this.recordMetric('success', responseTime);
          
          // Simuleer gebruiker die response leest
          await this.sleep(Math.random() * 3000 + 1000);
          
        } catch (error) {
          this.recordMetric('error', Date.now() - requestStart, error);
        }
        
        // Wacht tussen berichten
        await this.sleep(this.config.messageInterval);
      }
    }
  }

  recordMetric(type, responseTime, error = null) {
    this.metrics.totalRequests++;
    
    if (type === 'success') {
      this.metrics.successfulRequests++;
      this.metrics.responseTimes.push(responseTime);
    } else {
      this.metrics.failedRequests++;
      this.metrics.errors.push({
        timestamp: new Date(),
        error: error.message,
        responseTime
      });
    }
  }

  getUserScenarios() {
    return [
      {
        name: "Check order status",
        messages: [
          "Waar is mijn bestelling?",
          "Ordernummer is 12345",
          "Bedankt!"
        ]
      },
      {
        name: "Product information",
        messages: [
          "Hebben jullie rode schoenen?",
          "In maat 42?",
          "Wat is de prijs?"
        ]
      },
      {
        name: "Return request",
        messages: [
          "Ik wil iets retourneren",
          "Order 98765",
          "Product past niet"
        ]
      }
    ];
  }

  generatePerformanceReport() {
    const avgResponseTime = this.calculateAverage(this.metrics.responseTimes);
    const percentiles = this.calculatePercentiles(this.metrics.responseTimes);
    const successRate = (this.metrics.successfulRequests / 
                        this.metrics.totalRequests * 100).toFixed(2);
    
    return {
      summary: {
        totalRequests: this.metrics.totalRequests,
        successfulRequests: this.metrics.successfulRequests,
        failedRequests: this.metrics.failedRequests,
        successRate: successRate + '%',
        avgResponseTime: avgResponseTime.toFixed(2) + 'ms'
      },
      performance: {
        min: Math.min(...this.metrics.responseTimes) + 'ms',
        max: Math.max(...this.metrics.responseTimes) + 'ms',
        median: percentiles.p50.toFixed(2) + 'ms',
        p95: percentiles.p95.toFixed(2) + 'ms',
        p99: percentiles.p99.toFixed(2) + 'ms'
      },
      throughput: {
        requestsPerSecond: (this.metrics.totalRequests / 
                           (this.config.testDuration / 1000)).toFixed(2),
        concurrentUsers: this.config.maxConcurrentUsers
      },
      errors: this.analyzeErrors(),
      recommendations: this.generateRecommendations(avgResponseTime, successRate)
    };
  }

  calculateAverage(times) {
    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  calculatePercentiles(times) {
    const sorted = [...times].sort((a, b) => a - b);
    return {
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  analyzeErrors() {
    const errorTypes = {};
    
    this.metrics.errors.forEach(error => {
      const type = error.error || 'Unknown';
      errorTypes[type] = (errorTypes[type] || 0) + 1;
    });
    
    return {
      types: errorTypes,
      rate: (this.metrics.failedRequests / this.metrics.totalRequests * 100).toFixed(2) + '%'
    };
  }

  generateRecommendations(avgResponseTime, successRate) {
    const recommendations = [];
    
    if (avgResponseTime > 1000) {
      recommendations.push({
        issue: "High response time",
        suggestion: "Consider caching frequent queries or optimizing NLP processing"
      });
    }
    
    if (successRate < 99) {
      recommendations.push({
        issue: "Low success rate",
        suggestion: "Investigate error patterns and implement retry mechanisms"
      });
    }
    
    if (this.metrics.responseTimes.some(t => t > 5000)) {
      recommendations.push({
        issue: "Response time spikes",
        suggestion: "Implement request queuing and rate limiting"
      });
    }
    
    return recommendations;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
\`\`\`

### 4. User Acceptance Testing (UAT)

Structureer UAT met echte gebruikers:

\`\`\`javascript
// UAT framework voor chatbots
class UATFramework {
  constructor() {
    this.testSessions = [];
    this.feedback = [];
    this.metrics = {
      taskCompletion: [],
      userSatisfaction: [],
      issues: []
    };
  }

  createUATSession(participant) {
    const session = {
      id: this.generateSessionId(),
      participant,
      startTime: new Date(),
      tasks: this.getUATTasks(),
      recordings: [],
      feedback: null
    };
    
    this.testSessions.push(session);
    return session;
  }

  getUATTasks() {
    return [
      {
        id: 'task-1',
        description: 'Vraag naar de status van een fictieve bestelling (#TEST123)',
        expectedOutcome: 'Bot geeft duidelijke status informatie',
        successCriteria: [
          'Bot vraagt om ordernummer',
          'Bot geeft status informatie',
          'Bot biedt vervolgopties'
        ]
      },
      {
        id: 'task-2',
        description: 'Probeer een product te retourneren',
        expectedOutcome: 'Bot leidt door retourproces',
        successCriteria: [
          'Bot vraagt naar retour reden',
          'Bot geeft retour instructies',
          'Bot biedt retourlabel aan'
        ]
      },
      {
        id: 'task-3',
        description: 'Stel een complexe vraag die de bot niet kan beantwoorden',
        expectedOutcome: 'Bot escaleert naar human agent',
        successCriteria: [
          'Bot erkent beperking',
          'Bot biedt escalatie optie',
          'Overdracht verloopt soepel'
        ]
      }
    ];
  }

  recordInteraction(sessionId, interaction) {
    const session = this.testSessions.find(s => s.id === sessionId);
    if (session) {
      session.recordings.push({
        timestamp: new Date(),
        userInput: interaction.userInput,
        botResponse: interaction.botResponse,
        responseTime: interaction.responseTime
      });
    }
  }

  completeTask(sessionId, taskId, success, notes) {
    const session = this.testSessions.find(s => s.id === sessionId);
    if (session) {
      const task = session.tasks.find(t => t.id === taskId);
      task.completed = true;
      task.success = success;
      task.notes = notes;
      task.completionTime = new Date();
      
      this.metrics.taskCompletion.push({
        sessionId,
        taskId,
        success,
        duration: task.completionTime - session.startTime
      });
    }
  }

  collectFeedback(sessionId, feedback) {
    const session = this.testSessions.find(s => s.id === sessionId);
    if (session) {
      session.feedback = {
        ...feedback,
        timestamp: new Date()
      };
      
      this.feedback.push({
        sessionId,
        ...feedback
      });
      
      this.metrics.userSatisfaction.push(feedback.overallSatisfaction);
    }
  }

  reportIssue(sessionId, issue) {
    this.metrics.issues.push({
      sessionId,
      ...issue,
      timestamp: new Date()
    });
  }

  generateUATReport() {
    const taskSuccessRate = this.calculateTaskSuccessRate();
    const avgSatisfaction = this.calculateAverageSatisfaction();
    const commonIssues = this.categorizeIssues();
    
    return {
      summary: {
        totalSessions: this.testSessions.length,
        completedSessions: this.testSessions.filter(s => s.feedback).length,
        taskSuccessRate: taskSuccessRate + '%',
        avgSatisfaction: avgSatisfaction.toFixed(1) + '/5'
      },
      taskAnalysis: this.analyzeTaskPerformance(),
      userFeedback: this.analyzeFeedback(),
      issues: {
        total: this.metrics.issues.length,
        categories: commonIssues,
        critical: this.metrics.issues.filter(i => i.severity === 'high')
      },
      recommendations: this.generateUATRecommendations(),
      quotes: this.extractUserQuotes()
    };
  }

  calculateTaskSuccessRate() {
    const successful = this.metrics.taskCompletion.filter(t => t.success).length;
    const total = this.metrics.taskCompletion.length;
    return (successful / total * 100).toFixed(1);
  }

  calculateAverageSatisfaction() {
    const sum = this.metrics.userSatisfaction.reduce((a, b) => a + b, 0);
    return sum / this.metrics.userSatisfaction.length;
  }

  categorizeIssues() {
    const categories = {};
    
    this.metrics.issues.forEach(issue => {
      const category = issue.category || 'Other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(issue);
    });
    
    return categories;
  }

  analyzeTaskPerformance() {
    const taskStats = {};
    
    this.getUATTasks().forEach(task => {
      const taskCompletions = this.metrics.taskCompletion.filter(
        t => t.taskId === task.id
      );
      
      taskStats[task.id] = {
        description: task.description,
        attempts: taskCompletions.length,
        successful: taskCompletions.filter(t => t.success).length,
        avgDuration: this.calculateAvgDuration(taskCompletions),
        successRate: (taskCompletions.filter(t => t.success).length / 
                     taskCompletions.length * 100).toFixed(1) + '%'
      };
    });
    
    return taskStats;
  }

  analyzeFeedback() {
    const feedbackAnalysis = {
      satisfaction: {
        distribution: this.getSatisfactionDistribution(),
        average: this.calculateAverageSatisfaction()
      },
      themes: this.extractFeedbackThemes(),
      improvements: this.extractImprovementSuggestions()
    };
    
    return feedbackAnalysis;
  }

  getSatisfactionDistribution() {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    this.metrics.userSatisfaction.forEach(rating => {
      distribution[rating]++;
    });
    
    return distribution;
  }

  extractFeedbackThemes() {
    // Analyseer feedback voor veelvoorkomende thema's
    const themes = {
      positive: [],
      negative: [],
      neutral: []
    };
    
    this.feedback.forEach(f => {
      if (f.likes) themes.positive.push(f.likes);
      if (f.dislikes) themes.negative.push(f.dislikes);
      if (f.suggestions) themes.neutral.push(f.suggestions);
    });
    
    return themes;
  }

  extractImprovementSuggestions() {
    return this.feedback
      .filter(f => f.suggestions)
      .map(f => f.suggestions);
  }

  generateUATRecommendations() {
    const recommendations = [];
    const avgSatisfaction = this.calculateAverageSatisfaction();
    const taskSuccessRate = parseFloat(this.calculateTaskSuccessRate());
    
    if (avgSatisfaction < 4) {
      recommendations.push({
        priority: 'high',
        area: 'User Satisfaction',
        suggestion: 'Focus on improving conversation flow and response quality'
      });
    }
    
    if (taskSuccessRate < 80) {
      recommendations.push({
        priority: 'high',
        area: 'Task Completion',
        suggestion: 'Simplify complex flows and improve intent recognition'
      });
    }
    
    if (this.metrics.issues.filter(i => i.category === 'Understanding').length > 5) {
      recommendations.push({
        priority: 'medium',
        area: 'NLP',
        suggestion: 'Expand training data for better intent recognition'
      });
    }
    
    return recommendations;
  }

  extractUserQuotes() {
    return this.feedback
      .filter(f => f.comments)
      .map(f => ({
        quote: f.comments,
        satisfaction: f.overallSatisfaction,
        participant: f.participantId
      }))
      .slice(0, 5); // Top 5 quotes
  }

  calculateAvgDuration(completions) {
    if (completions.length === 0) return 0;
    
    const total = completions.reduce((sum, c) => sum + c.duration, 0);
    return Math.round(total / completions.length / 1000); // in seconden
  }

  generateSessionId() {
    return 'uat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}

// UAT feedback form
const uatFeedbackForm = {
  overallSatisfaction: 5, // 1-5 scale
  easeOfUse: 4,
  responseQuality: 4,
  taskCompletion: true,
  wouldRecommend: true,
  likes: "Bot reageert snel en vriendelijk",
  dislikes: "Soms begrijpt de bot mijn vraag niet goed",
  suggestions: "Meer voorbeelden geven bij complexe vragen",
  comments: "Over het algemeen een prettige ervaring"
};
\`\`\`

### 5. Deployment Checklist

Complete checklist voor productie deployment:

\`\`\`javascript
// Deployment readiness checker
class DeploymentChecker {
  constructor(bot) {
    this.bot = bot;
    this.checks = this.defineChecks();
    this.results = [];
  }

  defineChecks() {
    return [
      // Functionele checks
      {
        category: 'Functionality',
        checks: [
          {
            name: 'Intent Recognition Accuracy',
            test: async () => {
              const accuracy = await this.testIntentAccuracy();
              return {
                passed: accuracy >= 0.85,
                value: accuracy,
                message: \`Intent accuracy: \${(accuracy * 100).toFixed(1)}%\`
              };
            },
            critical: true
          },
          {
            name: 'Response Time',
            test: async () => {
              const avgTime = await this.testResponseTime();
              return {
                passed: avgTime < 1000,
                value: avgTime,
                message: \`Average response time: \${avgTime}ms\`
              };
            },
            critical: true
          },
          {
            name: 'Error Rate',
            test: async () => {
              const errorRate = await this.testErrorRate();
              return {
                passed: errorRate < 0.01,
                value: errorRate,
                message: \`Error rate: \${(errorRate * 100).toFixed(2)}%\`
              };
            },
            critical: true
          }
        ]
      },
      
      // Security checks
      {
        category: 'Security',
        checks: [
          {
            name: 'API Key Security',
            test: async () => {
              const secure = this.checkAPIKeySecurity();
              return {
                passed: secure,
                message: secure ? 'API keys properly secured' : 'API keys exposed'
              };
            },
            critical: true
          },
          {
            name: 'Input Validation',
            test: async () => {
              const validated = await this.testInputValidation();
              return {
                passed: validated,
                message: validated ? 'Input validation working' : 'Input validation issues found'
              };
            },
            critical: true
          },
          {
            name: 'Data Encryption',
            test: async () => {
              const encrypted = this.checkDataEncryption();
              return {
                passed: encrypted,
                message: encrypted ? 'Data properly encrypted' : 'Encryption not configured'
              };
            },
            critical: true
          }
        ]
      },
      
      // Performance checks
      {
        category: 'Performance',
        checks: [
          {
            name: 'Concurrent Users',
            test: async () => {
              const maxUsers = await this.testConcurrentUsers();
              return {
                passed: maxUsers >= 100,
                value: maxUsers,
                message: \`Supports \${maxUsers} concurrent users\`
              };
            },
            critical: false
          },
          {
            name: 'Memory Usage',
            test: async () => {
              const memoryOk = await this.checkMemoryUsage();
              return {
                passed: memoryOk,
                message: memoryOk ? 'Memory usage within limits' : 'High memory usage detected'
              };
            },
            critical: false
          },
          {
            name: 'Cache Configuration',
            test: async () => {
              const cacheOk = this.checkCacheConfig();
              return {
                passed: cacheOk,
                message: cacheOk ? 'Cache properly configured' : 'Cache needs configuration'
              };
            },
            critical: false
          }
        ]
      },
      
      // Integration checks
      {
        category: 'Integrations',
        checks: [
          {
            name: 'Database Connection',
            test: async () => {
              const connected = await this.testDatabaseConnection();
              return {
                passed: connected,
                message: connected ? 'Database connected' : 'Database connection failed'
              };
            },
            critical: true
          },
          {
            name: 'External APIs',
            test: async () => {
              const apisOk = await this.testExternalAPIs();
              return {
                passed: apisOk.allPassed,
                details: apisOk.results,
                message: \`\${apisOk.passed}/\${apisOk.total} APIs working\`
              };
            },
            critical: true
          },
          {
            name: 'Webhook Configuration',
            test: async () => {
              const webhooksOk = this.checkWebhooks();
              return {
                passed: webhooksOk,
                message: webhooksOk ? 'Webhooks configured' : 'Webhooks need configuration'
              };
            },
            critical: false
          }
        ]
      },
      
      // Monitoring checks
      {
        category: 'Monitoring',
        checks: [
          {
            name: 'Logging Configuration',
            test: async () => {
              const loggingOk = this.checkLogging();
              return {
                passed: loggingOk,
                message: loggingOk ? 'Logging properly configured' : 'Logging needs configuration'
              };
            },
            critical: false
          },
          {
            name: 'Error Tracking',
            test: async () => {
              const trackingOk = this.checkErrorTracking();
              return {
                passed: trackingOk,
                message: trackingOk ? 'Error tracking active' : 'Error tracking not configured'
              };
            },
            critical: false
          },
          {
            name: 'Analytics Setup',
            test: async () => {
              const analyticsOk = this.checkAnalytics();
              return {
                passed: analyticsOk,
                message: analyticsOk ? 'Analytics configured' : 'Analytics not set up'
              };
            },
            critical: false
          }
        ]
      }
    ];
  }

  async runDeploymentChecks() {
    console.log('Running deployment readiness checks...');
    
    for (const category of this.checks) {
      console.log(\`\\nChecking \${category.category}...\`);
      
      for (const check of category.checks) {
        try {
          const result = await check.test();
          this.results.push({
            category: category.category,
            name: check.name,
            critical: check.critical,
            ...result
          });
          
          console.log(\`  [\${result.passed ? '✓' : '✗'}] \${check.name}: \${result.message}\`);
        } catch (error) {
          this.results.push({
            category: category.category,
            name: check.name,
            critical: check.critical,
            passed: false,
            error: error.message
          });
          
          console.log(\`  [✗] \${check.name}: Error - \${error.message}\`);
        }
      }
    }
    
    return this.generateDeploymentReport();
  }

  generateDeploymentReport() {
    const criticalChecks = this.results.filter(r => r.critical);
    const criticalPassed = criticalChecks.filter(r => r.passed);
    const nonCriticalChecks = this.results.filter(r => !r.critical);
    const nonCriticalPassed = nonCriticalChecks.filter(r => r.passed);
    
    const readyForDeployment = criticalChecks.length === criticalPassed.length;
    
    return {
      readyForDeployment,
      summary: {
        totalChecks: this.results.length,
        passed: this.results.filter(r => r.passed).length,
        failed: this.results.filter(r => !r.passed).length,
        criticalPassed: \`\${criticalPassed.length}/\${criticalChecks.length}\`,
        nonCriticalPassed: \`\${nonCriticalPassed.length}/\${nonCriticalChecks.length}\`
      },
      criticalIssues: criticalChecks.filter(r => !r.passed),
      warnings: nonCriticalChecks.filter(r => !r.passed),
      detailedResults: this.organizeResultsByCategory(),
      recommendations: this.generateRecommendations(),
      deploymentScript: readyForDeployment ? this.generateDeploymentScript() : null
    };
  }

  organizeResultsByCategory() {
    const organized = {};
    
    this.results.forEach(result => {
      if (!organized[result.category]) {
        organized[result.category] = [];
      }
      organized[result.category].push(result);
    });
    
    return organized;
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Analyseer failures en geef recommendations
    const failedChecks = this.results.filter(r => !r.passed);
    
    failedChecks.forEach(check => {
      if (check.name === 'Intent Recognition Accuracy') {
        recommendations.push({
          issue: 'Low intent recognition accuracy',
          action: 'Add more training data and retrain the NLP model',
          priority: 'High'
        });
      }
      
      if (check.name === 'Response Time') {
        recommendations.push({
          issue: 'Slow response times',
          action: 'Implement caching and optimize database queries',
          priority: 'High'
        });
      }
      
      if (check.name === 'Error Rate') {
        recommendations.push({
          issue: 'High error rate',
          action: 'Implement better error handling and retry mechanisms',
          priority: 'High'
        });
      }
    });
    
    return recommendations;
  }

  generateDeploymentScript() {
    return \`#!/bin/bash
# Auto-generated deployment script

echo "Starting deployment..."

# Environment setup
export NODE_ENV=production
export BOT_VERSION=\${new Date().toISOString()}

# Run final tests
npm test

# Build production bundle
npm run build

# Database migrations
npm run migrate:production

# Deploy to production
npm run deploy:production

# Verify deployment
npm run verify:production

echo "Deployment complete!"
\`;
  }

  // Implementatie van test methodes
  async testIntentAccuracy() {
    // Simuleer intent accuracy test
    return 0.92;
  }

  async testResponseTime() {
    // Simuleer response time test
    return 450;
  }

  async testErrorRate() {
    // Simuleer error rate test
    return 0.005;
  }

  checkAPIKeySecurity() {
    // Check of API keys veilig zijn opgeslagen
    return process.env.API_KEY && !process.env.API_KEY.includes('test');
  }

  async testInputValidation() {
    // Test input validation
    return true;
  }

  checkDataEncryption() {
    // Check encryption settings
    return true;
  }

  async testConcurrentUsers() {
    // Test concurrent users capacity
    return 150;
  }

  async checkMemoryUsage() {
    // Check memory usage
    return true;
  }

  checkCacheConfig() {
    // Check cache configuration
    return true;
  }

  async testDatabaseConnection() {
    // Test database connection
    return true;
  }

  async testExternalAPIs() {
    // Test external API connections
    return {
      allPassed: true,
      passed: 3,
      total: 3,
      results: []
    };
  }

  checkWebhooks() {
    // Check webhook configuration
    return true;
  }

  checkLogging() {
    // Check logging configuration
    return true;
  }

  checkErrorTracking() {
    // Check error tracking setup
    return true;
  }

  checkAnalytics() {
    // Check analytics configuration
    return true;
  }
}

// Gebruik deployment checker
async function prepareForDeployment() {
  const checker = new DeploymentChecker(bot);
  const report = await checker.runDeploymentChecks();
  
  if (report.readyForDeployment) {
    console.log('\\n✅ Bot is ready for deployment!');
    console.log('\\nDeployment script saved to: deploy.sh');
    // Save deployment script
    fs.writeFileSync('deploy.sh', report.deploymentScript);
  } else {
    console.log('\\n❌ Bot is not ready for deployment');
    console.log('\\nCritical issues to fix:');
    report.criticalIssues.forEach(issue => {
      console.log(\`  - \${issue.name}: \${issue.message || issue.error}\`);
    });
  }
  
  return report;
}
\`\`\`

## Praktische Opdracht: Complete Testing Suite

Implementeer een complete testing suite voor je chatbot:

\`\`\`javascript
// Complete testing suite voor je customer service bot
class CustomerServiceBotTester {
  constructor(bot) {
    this.bot = bot;
    this.intentTester = new IntentTester(bot.nlpModel);
    this.conversationTester = new ConversationTester(bot);
    this.performanceTester = new PerformanceTester(bot);
    this.uatFramework = new UATFramework();
    this.deploymentChecker = new DeploymentChecker(bot);
  }

  async runCompleteSuite() {
    console.log('Starting complete test suite...');
    
    const results = {
      timestamp: new Date(),
      intentTests: await this.runIntentTests(),
      conversationTests: await this.runConversationTests(),
      performanceTests: await this.runPerformanceTests(),
      deploymentReadiness: await this.runDeploymentChecks()
    };
    
    this.generateTestReport(results);
    return results;
  }

  async runIntentTests() {
    const testSuites = [
      this.createOrderTestSuite(),
      this.createProductTestSuite(),
      this.createReturnTestSuite(),
      this.createGeneralTestSuite()
    ];
    
    const results = [];
    for (const suite of testSuites) {
      results.push(await this.intentTester.runTestSuite(suite));
    }
    
    return results;
  }

  async runConversationTests() {
    const flows = [
      this.createOrderStatusFlow(),
      this.createReturnFlow(),
      this.createProductSearchFlow(),
      this.createEscalationFlow()
    ];
    
    const results = [];
    for (const flow of flows) {
      results.push(await this.conversationTester.testConversationFlow(flow));
    }
    
    return results;
  }

  async runPerformanceTests() {
    const configs = [
      { maxConcurrentUsers: 10, testDuration: 30000 },
      { maxConcurrentUsers: 50, testDuration: 60000 },
      { maxConcurrentUsers: 100, testDuration: 120000 }
    ];
    
    const results = [];
    for (const config of configs) {
      console.log(\`Running performance test with \${config.maxConcurrentUsers} users...\`);
      this.performanceTester.config = config;
      results.push(await this.performanceTester.runLoadTest());
    }
    
    return results;
  }

  async runDeploymentChecks() {
    return await this.deploymentChecker.runDeploymentChecks();
  }

  generateTestReport(results) {
    const report = {
      executiveSummary: this.generateExecutiveSummary(results),
      detailedResults: results,
      recommendations: this.generateRecommendations(results),
      nextSteps: this.generateNextSteps(results)
    };
    
    // Save report
    fs.writeFileSync(
      \`test-report-\${Date.now()}.json\`,
      JSON.stringify(report, null, 2)
    );
    
    // Generate HTML report
    this.generateHTMLReport(report);
    
    return report;
  }

  generateExecutiveSummary(results) {
    // Bereken overall metrics
    const intentAccuracy = this.calculateOverallIntentAccuracy(results.intentTests);
    const conversationSuccess = this.calculateConversationSuccess(results.conversationTests);
    const performanceScore = this.calculatePerformanceScore(results.performanceTests);
    const deploymentReady = results.deploymentReadiness.readyForDeployment;
    
    return {
      overallScore: this.calculateOverallScore(
        intentAccuracy,
        conversationSuccess,
        performanceScore,
        deploymentReady
      ),
      intentAccuracy: (intentAccuracy * 100).toFixed(1) + '%',
      conversationSuccess: (conversationSuccess * 100).toFixed(1) + '%',
      performanceGrade: this.gradePerformance(performanceScore),
      deploymentStatus: deploymentReady ? 'Ready' : 'Not Ready',
      testDate: new Date().toLocaleDateString()
    };
  }

  // Helper methodes voor test suites
  createOrderTestSuite() {
    return {
      name: "Order Management Tests",
      tests: [
        {
          input: "Waar is mijn bestelling?",
          expectedIntent: "check_order_status"
        },
        {
          input: "Ik wil mijn order annuleren",
          expectedIntent: "cancel_order"
        },
        {
          input: "Kan ik mijn bezorgadres wijzigen?",
          expectedIntent: "change_delivery_address"
        }
      ]
    };
  }

  createOrderStatusFlow() {
    return {
      name: "Order Status Check Flow",
      steps: [
        {
          name: "Initial request",
          input: "Ik wil mijn orderstatus checken",
          expectedType: "text",
          requiredKeywords: ["order", "nummer"],
          critical: true
        },
        {
          name: "Provide order number",
          input: "ORD-2024-12345",
          customValidation: (response) => ({
            passed: response.text.includes("status") || response.text.includes("verzonden"),
            errors: []
          }),
          critical: true
        }
      ]
    };
  }

  // ... meer helper methodes
}

// Start de complete test suite
const tester = new CustomerServiceBotTester(bot);
tester.runCompleteSuite().then(results => {
  console.log('Test suite completed!');
  console.log('Report saved to test-report-*.json');
});
\`\`\`

## Samenvatting

In deze les hebben we geleerd hoe je:

1. **Systematisch test** met verschillende methodologieën
2. **Performance meet** onder verschillende omstandigheden
3. **User acceptance organiseert** met echte gebruikers
4. **Deployment voorbereidt** met complete checklists
5. **Kwaliteit waarborgt** door het hele proces

Met deze testing framework ben je klaar om je chatbot met vertrouwen naar productie te brengen!
  `,
  assignments: [
    {
      id: 'intent-testing',
      title: 'Intent Recognition Testing',
      description: 'Bouw een complete test suite voor intent recognition met minimaal 20 test cases per intent.',
      difficulty: 'medium' as const,
      type: 'code' as const,
      hints: [
        'Test verschillende formuleringen voor dezelfde intent',
        'Include edge cases en typfouten',
        'Test ook met entities en zonder entities'
      ]
    },
    {
      id: 'performance-test',
      title: 'Performance Testing Suite',
      description: 'Implementeer performance tests die 100+ concurrent users simuleren met realistische scenarios.',
      difficulty: 'hard' as const,
      type: 'code' as const,
      hints: [
        'Varieer de message intervals',
        'Simuleer verschillende user journeys',
        'Monitor response times en error rates'
      ]
    }
  ],
  resources: [
    {
      title: 'Chatbot Testing Best Practices',
      url: 'https://www.botium.ai/chatbot-testing-best-practices/',
      type: 'article'
    },
    {
      title: 'Load Testing for Conversational AI',
      url: 'https://k6.io/blog/load-testing-chatbots/',
      type: 'guide'
    },
    {
      title: 'UAT Guide for Chatbots',
      url: 'https://chatbotsmagazine.com/user-acceptance-testing-for-chatbots',
      type: 'article'
    }
  ],
  codeExamples: [
    {
      id: 'complete-testing-framework',
      title: 'Complete Testing Framework',
      code: `
// Complete testing orchestrator
class ChatbotTestOrchestrator {
  constructor(bot) {
    this.bot = bot;
    this.testSuites = {
      unit: new UnitTestSuite(bot),
      integration: new IntegrationTestSuite(bot),
      performance: new PerformanceTestSuite(bot),
      uat: new UATTestSuite(bot)
    };
  }

  async runAllTests() {
    const results = {
      timestamp: new Date(),
      environment: process.env.NODE_ENV,
      version: this.bot.version
    };

    // Run tests in sequence
    for (const [type, suite] of Object.entries(this.testSuites)) {
      console.log(\`Running \${type} tests...\`);
      results[type] = await suite.run();
    }

    // Generate comprehensive report
    const report = this.generateReport(results);
    await this.saveReport(report);
    
    return report;
  }

  generateReport(results) {
    return {
      summary: this.generateSummary(results),
      details: results,
      recommendations: this.generateRecommendations(results),
      deploymentReadiness: this.assessDeploymentReadiness(results)
    };
  }

  assessDeploymentReadiness(results) {
    const criteria = {
      unitTestsPassed: results.unit.passRate > 0.95,
      integrationTestsPassed: results.integration.passRate > 0.90,
      performanceAcceptable: results.performance.avgResponseTime < 1000,
      uatCompleted: results.uat.completed && results.uat.satisfaction > 4
    };

    const ready = Object.values(criteria).every(c => c);

    return {
      ready,
      criteria,
      blockers: Object.entries(criteria)
        .filter(([_, passed]) => !passed)
        .map(([criterion]) => criterion)
    };
  }
}
      `,
      language: 'javascript'
    }
  ]
};