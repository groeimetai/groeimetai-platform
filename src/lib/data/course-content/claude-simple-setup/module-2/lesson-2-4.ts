import type { Lesson } from '@/lib/data/courses';

export const lesson2_4: Lesson = {
  id: 'lesson-2-4',
  title: 'Model switching strategieën',
  duration: '30 min',
  content: `
# Model Switching Strategieën

## Introductie

In productieomgevingen is het cruciaal om dynamisch tussen Claude modellen te kunnen wisselen. Deze les behandelt geavanceerde strategieën voor model selectie, fallback patterns, load balancing en kostenoptimalisatie.

## Dynamic Model Selection

### Intelligente Model Router

Implementeer een router die het juiste model kiest op basis van de taak:

\`\`\`typescript
interface ModelSelector {
  selectModel(request: Request): ModelChoice;
}

class DynamicModelSelector implements ModelSelector {
  private readonly rules: SelectionRule[] = [
    {
      condition: (req) => req.complexity === 'high' && req.priority === 'critical',
      model: 'claude-3-opus',
      reason: 'Kritieke taken met hoge complexiteit'
    },
    {
      condition: (req) => req.responseTime < 1000 && req.volume > 1000,
      model: 'claude-3-haiku',
      reason: 'High-volume met lage latency requirements'
    },
    {
      condition: (req) => req.complexity === 'medium',
      model: 'claude-3-5-sonnet',
      reason: 'Standaard balans tussen kwaliteit en kosten'
    }
  ];

  selectModel(request: Request): ModelChoice {
    for (const rule of this.rules) {
      if (rule.condition(request)) {
        return {
          model: rule.model,
          reason: rule.reason,
          confidence: this.calculateConfidence(request, rule)
        };
      }
    }
    return { model: 'claude-3-5-sonnet', reason: 'Default fallback' };
  }

  private calculateConfidence(request: Request, rule: SelectionRule): number {
    // Bereken confidence score op basis van historische performance
    const historicalSuccess = this.getHistoricalMetrics(rule.model, request.type);
    const costEfficiency = this.calculateCostEfficiency(rule.model, request);
    return (historicalSuccess * 0.7 + costEfficiency * 0.3);
  }
}
\`\`\`

### Feature-Based Selection

Selecteer modellen op basis van specifieke features:

\`\`\`python
class FeatureBasedSelector:
    def __init__(self):
        self.feature_matrix = {
            'vision_required': ['claude-3-opus', 'claude-3-5-sonnet'],
            'code_generation': ['claude-3-5-sonnet', 'claude-3-opus'],
            'real_time_chat': ['claude-3-haiku'],
            'deep_analysis': ['claude-3-opus'],
            'bulk_processing': ['claude-3-haiku', 'claude-3-5-sonnet']
        }
    
    def select_model(self, required_features, constraints=None):
        """Selecteer optimaal model op basis van vereiste features"""
        candidate_models = self._get_candidates(required_features)
        
        if constraints:
            candidate_models = self._apply_constraints(
                candidate_models, 
                constraints
            )
        
        return self._rank_models(candidate_models, required_features)
    
    def _get_candidates(self, features):
        candidates = set()
        for feature in features:
            if feature in self.feature_matrix:
                candidates.update(self.feature_matrix[feature])
        return list(candidates)
    
    def _apply_constraints(self, models, constraints):
        filtered = models
        
        if 'max_cost_per_request' in constraints:
            filtered = [m for m in filtered 
                       if self.get_cost(m) <= constraints['max_cost_per_request']]
        
        if 'max_latency' in constraints:
            filtered = [m for m in filtered 
                       if self.get_latency(m) <= constraints['max_latency']]
        
        return filtered
\`\`\`

## Fallback Patterns

### Cascading Fallback Strategy

Implementeer robuuste fallback mechanismen:

\`\`\`javascript
class CascadingFallback {
  constructor() {
    this.modelHierarchy = [
      { model: 'claude-3-opus', retryCount: 2 },
      { model: 'claude-3-5-sonnet', retryCount: 3 },
      { model: 'claude-3-haiku', retryCount: 5 }
    ];
  }

  async executeWithFallback(request, options = {}) {
    const errors = [];
    
    for (const { model, retryCount } of this.modelHierarchy) {
      try {
        // Probeer met exponential backoff
        return await this.executeWithRetry(
          request, 
          model, 
          retryCount,
          options
        );
      } catch (error) {
        errors.push({ model, error });
        
        // Analyseer error voor slimme fallback
        if (this.shouldSkipFallback(error)) {
          throw new Error('Critical error - fallback stopped', { cause: errors });
        }
        
        // Log voor monitoring
        this.logFallback(model, error, request);
        
        // Pas request aan voor volgende model
        request = this.adaptRequestForFallback(request, model, error);
      }
    }
    
    throw new Error('All models failed', { cause: errors });
  }

  async executeWithRetry(request, model, maxRetries, options) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const delay = Math.min(1000 * Math.pow(2, i), 10000);
        if (i > 0) await this.sleep(delay);
        
        return await this.callModel(request, model, options);
      } catch (error) {
        lastError = error;
        
        if (!this.isRetryableError(error)) {
          throw error;
        }
      }
    }
    
    throw lastError;
  }

  isRetryableError(error) {
    return error.status === 429 || // Rate limit
           error.status === 503 || // Service unavailable
           error.code === 'ECONNRESET'; // Connection reset
  }

  shouldSkipFallback(error) {
    return error.status === 400 || // Bad request
           error.status === 401 || // Unauthorized
           error.type === 'invalid_request_error';
  }
}
\`\`\`

### Circuit Breaker Pattern

Voorkom cascade failures met circuit breakers:

\`\`\`typescript
class ModelCircuitBreaker {
  private states: Map<string, CircuitState> = new Map();
  private readonly config = {
    failureThreshold: 5,
    resetTimeout: 60000, // 1 minuut
    halfOpenRequests: 3
  };

  async execute(model: string, request: () => Promise<any>) {
    const state = this.getState(model);
    
    if (state.status === 'OPEN') {
      if (Date.now() - state.lastFailure > this.config.resetTimeout) {
        this.setState(model, 'HALF_OPEN');
      } else {
        throw new Error(\`Circuit breaker OPEN for \${model}\`);
      }
    }
    
    try {
      const result = await request();
      this.onSuccess(model);
      return result;
    } catch (error) {
      this.onFailure(model);
      throw error;
    }
  }

  private onSuccess(model: string) {
    const state = this.getState(model);
    state.failures = 0;
    
    if (state.status === 'HALF_OPEN') {
      state.halfOpenSuccesses++;
      if (state.halfOpenSuccesses >= this.config.halfOpenRequests) {
        this.setState(model, 'CLOSED');
      }
    }
  }

  private onFailure(model: string) {
    const state = this.getState(model);
    state.failures++;
    state.lastFailure = Date.now();
    
    if (state.failures >= this.config.failureThreshold) {
      this.setState(model, 'OPEN');
      this.notifyCircuitOpen(model);
    }
  }
}
\`\`\`

## Load Balancing Strategies

### Round-Robin met Gewichten

Verdeel load over modellen op basis van capaciteit:

\`\`\`python
class WeightedRoundRobin:
    def __init__(self, model_weights):
        """
        model_weights: {
            'claude-3-opus': 1,      # 10% van requests
            'claude-3-5-sonnet': 5,  # 50% van requests  
            'claude-3-haiku': 4      # 40% van requests
        }
        """
        self.models = []
        for model, weight in model_weights.items():
            self.models.extend([model] * weight)
        self.current = 0
        self.request_count = {}
    
    def get_next_model(self):
        model = self.models[self.current]
        self.current = (self.current + 1) % len(self.models)
        
        # Track voor monitoring
        self.request_count[model] = self.request_count.get(model, 0) + 1
        
        return model
    
    def rebalance(self, performance_metrics):
        """Pas weights dynamisch aan op basis van performance"""
        new_weights = {}
        
        for model, metrics in performance_metrics.items():
            # Bereken nieuwe weight op basis van success rate en latency
            score = metrics['success_rate'] / (metrics['avg_latency'] / 1000)
            new_weights[model] = max(1, int(score * 10))
        
        self.__init__(new_weights)
\`\`\`

### Adaptive Load Balancing

Intelligente load balancing op basis van real-time metrics:

\`\`\`javascript
class AdaptiveLoadBalancer {
  constructor() {
    this.modelStats = new Map();
    this.updateInterval = 30000; // 30 seconden
    this.startMonitoring();
  }

  async route(request) {
    const availableModels = this.getAvailableModels(request);
    const selectedModel = this.selectOptimalModel(availableModels, request);
    
    const startTime = Date.now();
    try {
      const result = await this.executeRequest(selectedModel, request);
      this.recordSuccess(selectedModel, Date.now() - startTime);
      return result;
    } catch (error) {
      this.recordFailure(selectedModel, error);
      throw error;
    }
  }

  selectOptimalModel(models, request) {
    const scores = models.map(model => ({
      model,
      score: this.calculateModelScore(model, request)
    }));
    
    // Gebruik epsilon-greedy voor exploration vs exploitation
    if (Math.random() < 0.1) { // 10% exploration
      return models[Math.floor(Math.random() * models.length)];
    }
    
    // 90% exploitation - kies beste model
    return scores.reduce((best, current) => 
      current.score > best.score ? current : best
    ).model;
  }

  calculateModelScore(model, request) {
    const stats = this.modelStats.get(model) || this.getDefaultStats();
    
    // Multi-factor scoring
    const successScore = stats.successRate;
    const latencyScore = 1 / (stats.avgLatency / 1000);
    const costScore = 1 / this.getModelCost(model);
    const loadScore = 1 - (stats.currentLoad / stats.maxLoad);
    
    // Gewogen score op basis van request prioriteit
    const weights = this.getScoreWeights(request.priority);
    
    return (
      weights.success * successScore +
      weights.latency * latencyScore +
      weights.cost * costScore +
      weights.load * loadScore
    );
  }

  getScoreWeights(priority) {
    const weights = {
      critical: { success: 0.5, latency: 0.3, cost: 0.1, load: 0.1 },
      high: { success: 0.4, latency: 0.3, cost: 0.2, load: 0.1 },
      normal: { success: 0.3, latency: 0.2, cost: 0.4, load: 0.1 },
      low: { success: 0.2, latency: 0.1, cost: 0.6, load: 0.1 }
    };
    return weights[priority] || weights.normal;
  }
}
\`\`\`

## Cost Optimization Algorithms

### Budget-Aware Model Selection

Optimaliseer model selectie binnen budget constraints:

\`\`\`python
class BudgetOptimizer:
    def __init__(self, daily_budget, model_costs):
        self.daily_budget = daily_budget
        self.model_costs = model_costs
        self.usage_tracker = UsageTracker()
        
    def select_model_within_budget(self, request):
        remaining_budget = self.get_remaining_budget()
        estimated_tokens = self.estimate_tokens(request)
        
        # Bereken kosten per model
        model_options = []
        for model, costs in self.model_costs.items():
            estimated_cost = self.calculate_cost(
                model, 
                estimated_tokens
            )
            
            if estimated_cost <= remaining_budget * 0.1:  # Max 10% van budget
                model_options.append({
                    'model': model,
                    'cost': estimated_cost,
                    'quality_score': self.get_quality_score(model),
                    'value_ratio': self.get_quality_score(model) / estimated_cost
                })
        
        # Sorteer op value ratio
        model_options.sort(key=lambda x: x['value_ratio'], reverse=True)
        
        if not model_options:
            raise BudgetExceededException("Insufficient budget for any model")
        
        # Selecteer beste value binnen budget
        return self.apply_budget_strategy(model_options, remaining_budget)
    
    def apply_budget_strategy(self, options, remaining_budget):
        hour = datetime.now().hour
        budget_percentage = self.usage_tracker.get_budget_used_percentage()
        
        # Conservatieve strategie later op de dag
        if hour >= 20 or budget_percentage > 80:
            # Kies goedkoopste optie
            return min(options, key=lambda x: x['cost'])['model']
        
        # Agressieve strategie vroeg met veel budget
        elif hour < 12 and budget_percentage < 30:
            # Kies beste kwaliteit
            return max(options, key=lambda x: x['quality_score'])['model']
        
        # Normale strategie - beste value
        else:
            return options[0]['model']  # Hoogste value ratio
\`\`\`

### Token Usage Optimization

Minimaliseer token gebruik zonder kwaliteitsverlies:

\`\`\`typescript
class TokenOptimizer {
  optimizeRequest(request: string, targetModel: string): OptimizedRequest {
    const strategies = [
      this.removeRedundancy,
      this.compressContext,
      this.useTemplates,
      this.cacheCommonPatterns
    ];
    
    let optimized = request;
    const savings = [];
    
    for (const strategy of strategies) {
      const result = strategy.call(this, optimized, targetModel);
      if (result.saved > 0) {
        optimized = result.text;
        savings.push({
          strategy: strategy.name,
          saved: result.saved
        });
      }
    }
    
    return {
      original: request,
      optimized: optimized,
      tokensSaved: savings.reduce((sum, s) => sum + s.saved, 0),
      strategies: savings
    };
  }

  removeRedundancy(text: string, model: string): OptimizationResult {
    // Verwijder dubbele informatie
    const sentences = text.split('. ');
    const unique = [];
    const seen = new Set();
    
    for (const sentence of sentences) {
      const normalized = sentence.toLowerCase().trim();
      const hash = this.semanticHash(normalized);
      
      if (!seen.has(hash)) {
        seen.add(hash);
        unique.push(sentence);
      }
    }
    
    const optimized = unique.join('. ');
    return {
      text: optimized,
      saved: text.length - optimized.length
    };
  }

  compressContext(text: string, model: string): OptimizationResult {
    // Comprimeer context voor modellen met goede inference
    if (model === 'claude-3-opus' || model === 'claude-3-5-sonnet') {
      // Deze modellen kunnen goed infereren uit beperkte context
      const compressed = text
        .replace(/\\b(bijvoorbeeld|namelijk|met andere woorden)\\b/gi, '')
        .replace(/\\s+/g, ' ')
        .trim();
      
      return {
        text: compressed,
        saved: text.length - compressed.length
      };
    }
    
    return { text, saved: 0 };
  }
}
\`\`\`

## Migration Strategies

### Gradual Model Migration

Migreer veilig van oud naar nieuw model:

\`\`\`python
class ModelMigration:
    def __init__(self, old_model, new_model):
        self.old_model = old_model
        self.new_model = new_model
        self.migration_percentage = 0
        self.comparison_mode = True
        self.metrics_collector = MetricsCollector()
    
    async def route_request(self, request):
        """Route request volgens migration strategie"""
        
        # In comparison mode, roep beide modellen aan
        if self.comparison_mode:
            old_response, new_response = await asyncio.gather(
                self.call_model(self.old_model, request),
                self.call_model(self.new_model, request)
            )
            
            # Vergelijk en log resultaten
            self.compare_responses(request, old_response, new_response)
            
            # Return oude model response (safe default)
            return old_response
        
        # In migration mode, gebruik percentage-based routing
        if random.random() * 100 < self.migration_percentage:
            return await self.call_model(self.new_model, request)
        else:
            return await self.call_model(self.old_model, request)
    
    def update_migration_percentage(self, new_percentage):
        """Verhoog migration percentage op basis van metrics"""
        if self.is_new_model_performing_well():
            self.migration_percentage = min(100, new_percentage)
            
            if self.migration_percentage == 100:
                self.complete_migration()
        else:
            # Rollback als performance degradeert
            self.migration_percentage = max(0, self.migration_percentage - 10)
            self.alert_performance_issues()
    
    def is_new_model_performing_well(self):
        metrics = self.metrics_collector.get_comparison_metrics()
        
        return (
            metrics['new_model_success_rate'] >= metrics['old_model_success_rate'] * 0.98 and
            metrics['new_model_latency_p95'] <= metrics['old_model_latency_p95'] * 1.2 and
            metrics['new_model_cost_per_request'] <= metrics['old_model_cost_per_request'] * 1.5
        )
\`\`\`

### A/B Testing Framework

Test nieuwe modellen met productie traffic:

\`\`\`javascript
class ModelABTesting {
  constructor(config) {
    this.experiments = new Map();
    this.userAssignments = new Map();
    this.results = new ResultsCollector();
  }

  createExperiment(name, config) {
    const experiment = {
      name,
      control: config.control,
      variant: config.variant,
      allocation: config.allocation || 0.1, // 10% default
      startTime: Date.now(),
      endTime: config.duration ? Date.now() + config.duration : null,
      metrics: config.metrics || ['latency', 'success_rate', 'user_satisfaction']
    };
    
    this.experiments.set(name, experiment);
  }

  async route(userId, request) {
    const experiment = this.getActiveExperiment();
    if (!experiment) {
      return this.defaultModel.process(request);
    }
    
    const assignment = this.getOrCreateAssignment(userId, experiment);
    const model = assignment === 'variant' ? 
      experiment.variant : experiment.control;
    
    const result = await this.processWithMetrics(model, request);
    
    this.results.record(experiment.name, assignment, {
      userId,
      model,
      ...result
    });
    
    return result.response;
  }

  analyzeResults(experimentName) {
    const data = this.results.get(experimentName);
    
    return {
      control: this.calculateStats(data.control),
      variant: this.calculateStats(data.variant),
      improvement: this.calculateImprovement(data),
      significance: this.calculateStatisticalSignificance(data),
      recommendation: this.generateRecommendation(data)
    };
  }
}
\`\`\`

## Best Practices

### 1. Monitoring en Alerting

\`\`\`python
# Implementeer comprehensive monitoring
monitor = ModelMonitor()
monitor.track_metrics([
    'response_time',
    'token_usage', 
    'error_rate',
    'fallback_rate',
    'cost_per_request'
])

monitor.set_alerts({
    'high_error_rate': lambda m: m['error_rate'] > 0.05,
    'budget_exceeded': lambda m: m['daily_cost'] > daily_budget,
    'high_fallback': lambda m: m['fallback_rate'] > 0.1
})
\`\`\`

### 2. Graceful Degradation

\`\`\`javascript
// Zorg voor graceful degradation
const degradationStrategy = {
  full: ['claude-3-opus', 'all features'],
  degraded: ['claude-3-5-sonnet', 'core features only'],
  minimal: ['claude-3-haiku', 'essential features only'],
  offline: ['cached_responses', 'static fallbacks']
};
\`\`\`

### 3. Cost Tracking Dashboard

\`\`\`typescript
// Real-time cost tracking
interface CostDashboard {
  getCurrentSpend(): number;
  getProjectedDailySpend(): number;
  getModelBreakdown(): ModelCostBreakdown;
  getBudgetAlerts(): BudgetAlert[];
  optimizationSuggestions(): OptimizationSuggestion[];
}
\`\`\`

## Samenvatting

Model switching strategieën zijn essentieel voor:
- **Betrouwbaarheid**: Fallback patterns voorkomen service onderbreking
- **Performance**: Load balancing optimaliseert response tijden
- **Kosten**: Dynamische selectie minimaliseert uitgaven
- **Kwaliteit**: A/B testing waarborgt continue verbetering

Door deze patterns te implementeren bouw je een robuuste, schaalbare en kostenefficiënte Claude integratie.

## Oefeningen

1. Implementeer een basis model router met fallback
2. Bouw een cost tracker die waarschuwt bij budget overschrijding
3. Creëer een A/B test framework voor model vergelijking
4. Ontwerp een migration plan voor je huidige use case
  `,
};