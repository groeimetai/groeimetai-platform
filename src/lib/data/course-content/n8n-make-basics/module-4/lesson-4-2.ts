import type { Lesson } from '@/lib/data/courses';

export const lesson4_2: Lesson = {
  id: 'lesson-4-2',
  title: 'Effectief debuggen van workflows',
  duration: '25 min',
  content: `
# Effectief debuggen van workflows

Leer systematisch problemen opsporen en oplossen in je automation workflows met professionele debugging technieken.

## Debug technieken

### 1. Step-by-step execution

**In N8N:**
- Gebruik de **"Execute Node"** functie om elke node individueel te testen
- Activeer **"Execution Data"** view om real-time data flow te zien
- Gebruik **"Pin Data"** om test data vast te zetten

**In Make:**
- Gebruik **"Run Once"** mode voor stapsgewijze executie
- Activeer **"Dev Tool"** voor gedetailleerde logs
- Gebruik **"History"** tab voor execution analysis

### 2. Logging strategieën

#### Structured logging implementeren:
\`\`\`javascript
// Debug logger function
const debugLog = (stage, data, metadata = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    stage: stage,
    data: data,
    metadata: metadata,
    executionId: $execution.id
  };
  
  console.log(JSON.stringify(logEntry, null, 2));
  return logEntry;
};

// Gebruik in je workflow
debugLog('API_CALL_START', { endpoint: url });
debugLog('API_CALL_SUCCESS', { response: data });
debugLog('API_CALL_ERROR', { error: error.message });
\`\`\`

### 3. Data inspection tools

**Technieken voor data analyse:**
- JSON formatter nodes voor complexe data structures
- Conditional breakpoints op specifieke data waardes
- Data snapshot comparison tussen executions

### 4. Performance profiling

**Metrics om te monitoren:**
- Execution time per node
- Memory usage patterns
- API response times
- Queue processing speeds

## Debug workflow template

### Stap 1: Isoleer het probleem
1. Identificeer de failing node
2. Check input data format
3. Verifieer output expectations
4. Test met minimal data set

### Stap 2: Reproduceer de fout
1. Creëer test scenario
2. Document exact steps
3. Save execution data
4. Note environment variables

### Stap 3: Implementeer fix
1. Apply targeted solution
2. Test edge cases
3. Verify no side effects
4. Document the solution

## Advanced debugging tools

### Custom debug nodes
\`\`\`javascript
// Debug helper node
const debugNode = {
  name: 'Debug Inspector',
  execute: function() {
    const input = this.getInputData();
    
    // Log all data types
    console.log('Data Types:', {
      items: input.length,
      firstItem: typeof input[0]?.json,
      keys: Object.keys(input[0]?.json || {})
    });
    
    // Validate data structure
    const validation = validateDataStructure(input);
    if (!validation.valid) {
      throw new Error(\`Validation failed: \${validation.errors.join(', ')}\`);
    }
    
    return input;
  }
};
\`\`\`

## Debugging checklist

- [ ] Enable verbose logging
- [ ] Check all node configurations
- [ ] Verify API endpoints and credentials
- [ ] Test with sample data
- [ ] Monitor resource usage
- [ ] Review execution history
- [ ] Document found issues
  `,
  codeExamples: [
    {
      id: 'example-4-2-1',
      title: 'Debug workflow met logging',
      language: 'javascript',
      code: `// Comprehensive debug workflow
const debugWorkflow = {
  // Initialize debug context
  init: function() {
    return {
      startTime: Date.now(),
      logs: [],
      errors: [],
      metrics: {}
    };
  },
  
  // Log execution step
  logStep: function(context, step, data) {
    const entry = {
      timestamp: Date.now() - context.startTime,
      step: step,
      data: JSON.stringify(data),
      memory: process.memoryUsage().heapUsed
    };
    context.logs.push(entry);
    return entry;
  },
  
  // Error capture
  captureError: function(context, error, node) {
    const errorEntry = {
      node: node,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      inputData: this.getInputData()
    };
    context.errors.push(errorEntry);
    
    // Send to monitoring service
    this.sendToMonitoring(errorEntry);
    return errorEntry;
  },
  
  // Generate debug report
  generateReport: function(context) {
    return {
      execution: {
        duration: Date.now() - context.startTime,
        steps: context.logs.length,
        errors: context.errors.length
      },
      logs: context.logs,
      errors: context.errors,
      recommendations: this.analyzeIssues(context)
    };
  }
};`
    }
  ],
  assignments: [
    {
      id: 'assignment-4-2-1',
      title: 'Debug challenge',
      description: 'Los een complexe workflow bug op gebruikmakend van systematische debug technieken. Document je aanpak en oplossing.',
      difficulty: 'hard',
      type: 'code',
      initialCode: `// Buggy workflow - vind en fix de problemen
// Deze workflow faalt random. Debug en fix!

const problematicWorkflow = {
  async processOrders(orders) {
    const results = [];
    
    for (const order of orders) {
      // Sometimes this fails silently
      const customer = await this.getCustomer(order.customerId);
      
      // This might throw an error
      const invoice = this.generateInvoice(order, customer);
      
      // This could timeout
      await this.sendEmail(customer.email, invoice);
      
      results.push({ orderId: order.id, status: 'processed' });
    }
    
    return results;
  },
  
  // Hint: Deze functies hebben hidden bugs
  getCustomer: async (id) => { /* implementation */ },
  generateInvoice: (order, customer) => { /* implementation */ },
  sendEmail: async (email, content) => { /* implementation */ }
};`,
      hints: [
        'Check for null/undefined customer responses',
        'Add try-catch blocks voor error isolation',
        'Implementeer logging op strategic points',
        'Test met edge cases zoals lege orders array'
      ]
    }
  ],
  resources: [
    {
      title: 'Professional Debugging Techniques',
      url: 'https://debugging-guide.com',
      type: 'tutorial' as const
    }
  ]
};