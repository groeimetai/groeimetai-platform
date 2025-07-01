import type { Lesson } from '@/lib/data/courses';

export const lesson3_4: Lesson = {
  id: 'lesson-3-4',
  title: 'Advanced debugging technieken',
  duration: '40 min',
  content: `
# Advanced Debugging Technieken

Leer geavanceerde debugging technieken voor complexe enterprise omgevingen met Claude Code.

## Time-Travel Debugging

Time-travel debugging stelt je in staat om terug te gaan in de uitvoering van je code om precies te zien wat er gebeurde.

### Claude Code Time-Travel implementatie

\`\`\`javascript
// Time-travel debug setup met Claude Code
const timeTravelDebug = async (targetFunction, inputs) => {
  const executionStates = [];
  const proxy = new Proxy(targetFunction, {
    apply: (target, thisArg, args) => {
      // Capture state voor elke functie call
      executionStates.push({
        timestamp: Date.now(),
        args: JSON.parse(JSON.stringify(args)),
        stack: new Error().stack,
        memory: process.memoryUsage()
      });
      
      try {
        const result = target.apply(thisArg, args);
        executionStates[executionStates.length - 1].result = result;
        return result;
      } catch (error) {
        executionStates[executionStates.length - 1].error = error;
        throw error;
      }
    }
  });
  
  // Run met Claude Code monitoring
  await claudeCode.debug.runWithTimeTravel(proxy, inputs, {
    captureVariables: true,
    captureHeap: true,
    maxSnapshots: 1000
  });
  
  return {
    states: executionStates,
    replaySession: (stateIndex) => {
      return claudeCode.debug.replayState(executionStates[stateIndex]);
    }
  };
};
\`\`\`

## Distributed System Debugging

Debug microservices en distributed systems met Claude Code's distributed tracing.

### Multi-service debugging

\`\`\`javascript
// Distributed debugging setup
const distributedDebugger = {
  async traceRequest(requestId) {
    // Verzamel traces van alle services
    const traces = await Promise.all([
      claudeCode.trace.getServiceTrace('api-gateway', requestId),
      claudeCode.trace.getServiceTrace('auth-service', requestId),
      claudeCode.trace.getServiceTrace('data-service', requestId),
      claudeCode.trace.getServiceTrace('notification-service', requestId)
    ]);
    
    // Correleer en analyseer
    const analysis = await claudeCode.analyze.correlateTraces(traces, {
      detectBottlenecks: true,
      findErrors: true,
      measureLatency: true,
      identifyDependencies: true
    });
    
    return {
      timeline: analysis.timeline,
      bottlenecks: analysis.bottlenecks,
      errors: analysis.errors,
      recommendations: analysis.recommendations
    };
  }
};

// Enterprise monitoring dashboard
const debugDashboard = await claudeCode.debug.createDashboard({
  services: ['api-gateway', 'auth-service', 'data-service'],
  metrics: ['latency', 'errors', 'throughput'],
  alerts: {
    latencyThreshold: 500, // ms
    errorRateThreshold: 0.01 // 1%
  }
});
\`\`\`

## Async/Concurrent Debugging

Debug complexe async en concurrent code met geavanceerde tracing.

### Race condition detection

\`\`\`javascript
// Race condition detector
const detectRaceConditions = async (codeBlock) => {
  const analysis = await claudeCode.analyze.concurrent(codeBlock, {
    runs: 1000,
    threads: 10,
    detectRaces: true,
    detectDeadlocks: true
  });
  
  if (analysis.raceConditions.length > 0) {
    console.log('Race conditions gedetecteerd:');
    analysis.raceConditions.forEach(race => {
      console.log(\`- \${race.location}: \${race.description}\`);
      console.log(\`  Oplossing: \${race.suggestedFix}\`);
    });
  }
  
  return analysis;
};

// Async flow visualization
const visualizeAsyncFlow = async (asyncFunction) => {
  const flow = await claudeCode.debug.traceAsyncFlow(asyncFunction);
  
  // Genereer interactieve flow diagram
  await claudeCode.visualize.asyncFlow(flow, {
    output: './debug-output/async-flow.html',
    interactive: true,
    showPromiseStates: true,
    highlightBottlenecks: true
  });
};
\`\`\`

## Production Debugging

Veilig debuggen in productie omgevingen zonder performance impact.

### Non-intrusive production debugging

\`\`\`javascript
// Production-safe debugging
const productionDebugger = {
  async attachToProcess(processId) {
    // Attach zonder process te vertragen
    const session = await claudeCode.debug.attachProduction(processId, {
      samplingRate: 0.001, // Sample 0.1% van requests
      maxOverhead: 5, // Max 5% CPU overhead
      autoDetach: true // Detach bij hoge load
    });
    
    // Conditional breakpoints die alleen triggeren bij specifieke condities
    session.setConditionalBreakpoint('UserService.authenticate', {
      condition: 'response.status >= 500',
      captureHeapDump: false, // Voorkom memory overhead
      logOnly: true // Log zonder te pauzeren
    });
    
    return session;
  },
  
  async captureProductionSnapshot() {
    // Capture system state zonder gebruikers te beïnvloeden
    const snapshot = await claudeCode.debug.lightweightSnapshot({
      includeMetrics: true,
      includeTraces: true,
      excludeSensitiveData: true,
      anonymizeUserData: true
    });
    
    // Stuur naar secure debug environment
    await claudeCode.debug.sendToDebugEnvironment(snapshot);
  }
};
\`\`\`

## AI-Assisted Root Cause Analysis

Gebruik Claude's AI capabilities voor intelligente root cause analysis.

### Automatische root cause detection

\`\`\`javascript
// AI-powered root cause analyzer
const aiRootCauseAnalyzer = {
  async analyzeError(error, context) {
    const analysis = await claudeCode.ai.analyzeError({
      error: error,
      stackTrace: error.stack,
      logs: await this.collectRelevantLogs(error),
      codeContext: await this.getCodeContext(error),
      systemMetrics: await this.getSystemMetrics(),
      historicalData: await this.getSimilarErrors()
    });
    
    return {
      rootCause: analysis.rootCause,
      confidence: analysis.confidence,
      suggestedFixes: analysis.fixes,
      preventionStrategies: analysis.prevention,
      relatedIssues: analysis.relatedIssues
    };
  },
  
  async predictFailures() {
    // Voorspel potentiële failures op basis van patterns
    const predictions = await claudeCode.ai.predictFailures({
      timeWindow: '24h',
      services: ['all'],
      confidenceThreshold: 0.8
    });
    
    predictions.forEach(prediction => {
      console.log(\`
        Potentiële failure: \${prediction.type}
        Service: \${prediction.service}
        Waarschijnlijkheid: \${prediction.probability}
        Aanbevolen actie: \${prediction.recommendedAction}
      \`);
    });
  }
};

// Enterprise debugging workflow
const enterpriseDebugWorkflow = async (incidentId) => {
  console.log('Starting enterprise debugging workflow...');
  
  // 1. Verzamel alle relevante data
  const data = await claudeCode.incident.gatherData(incidentId);
  
  // 2. AI root cause analysis
  const rootCause = await aiRootCauseAnalyzer.analyzeError(
    data.error, 
    data.context
  );
  
  // 3. Genereer fix suggesties
  const fixes = await claudeCode.ai.generateFixes({
    rootCause: rootCause,
    codebase: data.affectedCode,
    testSuite: data.relevantTests
  });
  
  // 4. Test fixes in sandbox
  const testResults = await claudeCode.sandbox.testFixes(fixes);
  
  // 5. Genereer incident report
  const report = await claudeCode.report.generateIncidentReport({
    incident: data,
    analysis: rootCause,
    fixes: fixes,
    testResults: testResults
  });
  
  return report;
};
\`\`\`

## Enterprise Debugging Best Practices

1. **Structured Logging**: Implementeer gestructureerde logging voor betere traceability
2. **Correlation IDs**: Gebruik correlation IDs voor request tracking across services
3. **Debug Symbols**: Behoud debug symbols in production builds (encrypted)
4. **Monitoring Integration**: Integreer debugging met monitoring tools
5. **Automated Playbooks**: Creëer automated debug playbooks voor common issues
        `,
  codeExamples: [
    {
      id: 'time-travel-example',
      title: 'Time-travel debugging in actie',
      language: 'javascript',
      code: `// Voorbeeld: Debug een complex algoritme met time-travel
async function debugComplexAlgorithm() {
  const complexFunction = (data) => {
    let result = data;
    for (let i = 0; i < data.length; i++) {
      result = processStep(result, i);
      if (result.error) {
        throw new Error('Processing failed at step ' + i);
      }
    }
    return result;
  };
  
  // Setup time-travel debugging
  const debugSession = await timeTravelDebug(complexFunction, testData);
  
  // Analyseer execution states
  debugSession.states.forEach((state, index) => {
    console.log(\`State \${index}: \${state.timestamp}\`);
    if (state.error) {
      console.log('Error gevonden:', state.error);
      // Replay vorige state
      const previousState = debugSession.replaySession(index - 1);
      console.log('State voor error:', previousState);
    }
  });
}`,
      explanation: 'Time-travel debugging laat je teruggaan in de uitvoering om exact te zien wat er mis ging.'
    },
    {
      id: 'distributed-debug-example',
      title: 'Distributed system debugging',
      language: 'javascript',
      code: `// Debug een microservices request flow
async function debugMicroservicesRequest(requestId) {
  // Start distributed trace
  const trace = await distributedDebugger.traceRequest(requestId);
  
  // Analyseer bottlenecks
  if (trace.bottlenecks.length > 0) {
    console.log('Bottlenecks gevonden:');
    trace.bottlenecks.forEach(bottleneck => {
      console.log(\`
        Service: \${bottleneck.service}
        Latency: \${bottleneck.latency}ms
        Oorzaak: \${bottleneck.cause}
        Aanbeveling: \${bottleneck.recommendation}
      \`);
    });
  }
  
  // Visualiseer request flow
  await claudeCode.visualize.requestFlow(trace.timeline, {
    output: './debug-output/request-flow.html',
    highlightSlowOps: true,
    showDependencies: true
  });
}`,
      explanation: 'Trace requests door meerdere services heen voor complete visibility.'
    },
    {
      id: 'ai-root-cause-example',
      title: 'AI-assisted root cause analysis',
      language: 'javascript',
      code: `// AI-powered debugging voor production incident
async function handleProductionIncident(alertId) {
  try {
    // Verzamel incident data
    const incident = await claudeCode.alerts.getIncident(alertId);
    
    // AI root cause analysis
    const analysis = await aiRootCauseAnalyzer.analyzeError(
      incident.error,
      {
        logs: incident.logs,
        metrics: incident.metrics,
        userReports: incident.userReports
      }
    );
    
    console.log(\`
      Root Cause Analysis:
      ===================
      Oorzaak: \${analysis.rootCause}
      Confidence: \${analysis.confidence}%
      
      Aanbevolen fixes:
    \`);
    
    analysis.suggestedFixes.forEach((fix, index) => {
      console.log(\`\${index + 1}. \${fix.description}\`);
      console.log(\`   Impact: \${fix.impact}\`);
      console.log(\`   Implementatie tijd: \${fix.estimatedTime}\`);
    });
    
    // Auto-genereer fix PR
    if (analysis.confidence > 90) {
      const pr = await claudeCode.github.createFixPR({
        title: \`Fix: \${analysis.rootCause}\`,
        body: analysis.suggestedFixes[0].implementation,
        branch: \`fix/\${alertId}\`
      });
      console.log(\`Fix PR created: \${pr.url}\`);
    }
  } catch (error) {
    console.error('Incident handling failed:', error);
  }
}`,
      explanation: 'Gebruik AI om automatisch root causes te identificeren en fixes voor te stellen.'
    }
  ],
  assignments: [
    {
      id: 'assignment-3-4',
      title: 'Debug een distributed system failure',
      description: 'Gebruik geavanceerde debugging technieken om een complex probleem in een microservices architectuur op te lossen.',
      difficulty: 'hard',
      type: 'code' as const,
      initialCode: `// Microservices met een verborgen race condition
const orderService = {
  async createOrder(userId, items) {
    const user = await userService.getUser(userId);
    const inventory = await inventoryService.checkStock(items);
    
    if (!inventory.available) {
      throw new Error('Items not in stock');
    }
    
    // Race condition: inventory kan veranderen tussen check en reserve
    const order = await db.createOrder({
      userId,
      items,
      status: 'pending'
    });
    
    await inventoryService.reserveItems(items, order.id);
    await paymentService.processPayment(user, order);
    
    return order;
  }
};

// Test scenario dat soms faalt
async function testConcurrentOrders() {
  const promises = [];
  
  // 10 gebruikers proberen tegelijk hetzelfde laatste item te bestellen
  for (let i = 0; i < 10; i++) {
    promises.push(
      orderService.createOrder(\`user-\${i}\`, [
        { productId: 'limited-item', quantity: 1 }
      ])
    );
  }
  
  const results = await Promise.allSettled(promises);
  
  // Probleem: Soms krijgen meerdere users hetzelfde item
  // Debug en fix dit probleem
}`,
      solution: `// Oplossing: Implementeer proper locking en transaction handling
const orderService = {
  async createOrder(userId, items) {
    // Start distributed transaction
    const transaction = await claudeCode.transaction.start({
      services: ['user', 'inventory', 'order', 'payment'],
      timeout: 30000
    });
    
    try {
      const user = await userService.getUser(userId, { transaction });
      
      // Atomic check-and-reserve met distributed lock
      const reservation = await inventoryService.checkAndReserve(
        items,
        {
          transaction,
          lock: true,
          lockTimeout: 5000
        }
      );
      
      if (!reservation.success) {
        await transaction.rollback();
        throw new Error('Items not available');
      }
      
      const order = await db.createOrder({
        userId,
        items,
        status: 'pending',
        reservationId: reservation.id
      }, { transaction });
      
      // Process payment met saga pattern
      const payment = await paymentService.processPayment(
        user,
        order,
        {
          transaction,
          compensate: async () => {
            await inventoryService.releaseReservation(reservation.id);
            await db.cancelOrder(order.id);
          }
        }
      );
      
      await transaction.commit();
      
      // Setup monitoring
      await claudeCode.monitor.trackTransaction({
        transactionId: transaction.id,
        orderId: order.id,
        services: transaction.participants
      });
      
      return order;
    } catch (error) {
      await transaction.rollback();
      
      // AI-assisted error analysis
      const analysis = await aiRootCauseAnalyzer.analyzeError(error, {
        transaction: transaction.id,
        userId,
        items
      });
      
      console.error('Transaction failed:', analysis.rootCause);
      throw error;
    }
  }
};

// Enhanced test met race condition detection
async function testConcurrentOrders() {
  // Setup race condition detector
  const raceDetector = await claudeCode.debug.createRaceDetector({
    services: ['order', 'inventory', 'payment'],
    detectDeadlocks: true
  });
  
  const promises = [];
  
  for (let i = 0; i < 10; i++) {
    promises.push(
      orderService.createOrder(\`user-\${i}\`, [
        { productId: 'limited-item', quantity: 1 }
      ])
    );
  }
  
  const results = await Promise.allSettled(promises);
  
  // Analyseer race conditions
  const analysis = await raceDetector.analyze();
  
  if (analysis.racesDetected === 0) {
    console.log('Geen race conditions gedetecteerd!');
  }
  
  // Verify correctheid
  const successfulOrders = results.filter(r => r.status === 'fulfilled');
  const stockLevel = await inventoryService.getStock('limited-item');
  
  console.assert(
    successfulOrders.length <= stockLevel.initialQuantity,
    'Niet meer orders dan stock!'
  );
}`,
      hints: [
        'Gebruik distributed tracing om te zien waar race conditions optreden',
        'Implementeer proper locking mechanismen voor inventory operations',
        'Overweeg saga pattern voor distributed transactions',
        'Test met claudeCode.debug.createRaceDetector voor automatische detectie'
      ]
    }
  ],
  resources: [
    {
      title: 'Time-Travel Debugging Guide',
      url: 'https://claude.ai/docs/time-travel-debugging',
      type: 'guide'
    },
    {
      title: 'Distributed Systems Debugging',
      url: 'https://claude.ai/docs/distributed-debugging',
      type: 'article'
    },
    {
      title: 'Production Debugging Best Practices',
      url: 'https://claude.ai/docs/production-debugging',
      type: 'guide'
    }
  ]
};