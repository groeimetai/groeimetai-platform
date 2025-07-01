import type { Lesson } from '@/lib/data/courses';

export const lesson2_2: Lesson = {
  id: 'lesson-2-2',
  title: 'Model testing en benchmarking',
  duration: '40 min',
  content: `
# Model testing en benchmarking

## Introductie

Het kiezen van het juiste Claude model voor jouw toepassing vereist systematisch testen en benchmarken. In deze les leer je hoe je testscenario's opzet, prestaties meet en data-gedreven beslissingen neemt over model selectie.

## Setting up test scenarios

### 1. Definieer je testcases

Begin met het identificeren van representatieve use cases voor je applicatie:

\`\`\`typescript
interface TestCase {
  id: string;
  category: string;
  input: string;
  expectedOutput?: string;
  evaluationCriteria: {
    accuracy: boolean;
    relevance: boolean;
    completeness: boolean;
    tone: boolean;
    formatting: boolean;
  };
}

const testCases: TestCase[] = [
  {
    id: "tc-001",
    category: "customer-support",
    input: "Mijn bestelling #12345 is nog niet aangekomen na 2 weken",
    evaluationCriteria: {
      accuracy: true,      // Correcte informatie
      relevance: true,     // Relevant antwoord
      completeness: true,  // Alle aspecten behandeld
      tone: true,         // Empathische toon
      formatting: true    // Duidelijke structuur
    }
  },
  {
    id: "tc-002",
    category: "technical-analysis",
    input: "Analyseer deze Python functie en identificeer performance bottlenecks",
    evaluationCriteria: {
      accuracy: true,
      relevance: true,
      completeness: true,
      tone: false,        // Minder belangrijk voor technische taken
      formatting: true
    }
  }
];
\`\`\`

### 2. Test harness opzetten

Creëer een herbruikbaar framework voor het uitvoeren van tests:

\`\`\`python
import anthropic
import time
import json
from datetime import datetime
from typing import Dict, List, Any

class ClaudeBenchmark:
    def __init__(self, api_key: str):
        self.client = anthropic.Anthropic(api_key=api_key)
        self.results = []
        
    def run_test(self, 
                 model: str, 
                 test_case: Dict[str, Any],
                 temperature: float = 0.7,
                 max_tokens: int = 1000) -> Dict[str, Any]:
        """
        Voer een enkele test uit en meet prestaties
        """
        start_time = time.time()
        
        try:
            response = self.client.messages.create(
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[
                    {"role": "user", "content": test_case['input']}
                ]
            )
            
            end_time = time.time()
            
            return {
                'test_id': test_case['id'],
                'model': model,
                'success': True,
                'response': response.content[0].text,
                'latency': end_time - start_time,
                'input_tokens': response.usage.input_tokens,
                'output_tokens': response.usage.output_tokens,
                'total_tokens': response.usage.input_tokens + response.usage.output_tokens,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'test_id': test_case['id'],
                'model': model,
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def run_benchmark_suite(self, 
                           models: List[str], 
                           test_cases: List[Dict[str, Any]],
                           iterations: int = 3) -> List[Dict[str, Any]]:
        """
        Voer complete benchmark suite uit
        """
        for model in models:
            print(f"\\nTesting model: {model}")
            
            for test_case in test_cases:
                print(f"  Running test: {test_case['id']}")
                
                for i in range(iterations):
                    result = self.run_test(model, test_case)
                    self.results.append(result)
                    
                    # Rate limiting respect
                    time.sleep(1)
        
        return self.results
\`\`\`

## Measuring response quality

### 1. Automatische kwaliteitsmetrieken

Implementeer objectieve metrieken voor response evaluatie:

\`\`\`python
import re
from textstat import flesch_reading_ease
from typing import Dict, Any

class QualityEvaluator:
    def __init__(self):
        self.metrics = {}
    
    def evaluate_response(self, 
                         response: str, 
                         test_case: Dict[str, Any]) -> Dict[str, float]:
        """
        Evalueer response kwaliteit op meerdere dimensies
        """
        metrics = {
            'length': len(response.split()),
            'readability': flesch_reading_ease(response),
            'has_structure': self._check_structure(response),
            'sentiment_score': self._analyze_sentiment(response),
            'keyword_coverage': self._check_keywords(response, test_case),
            'response_time': test_case.get('latency', 0)
        }
        
        # Bereken overall quality score
        metrics['quality_score'] = self._calculate_quality_score(metrics)
        
        return metrics
    
    def _check_structure(self, response: str) -> float:
        """
        Check voor structuurelementen (headers, lists, etc.)
        """
        structure_elements = [
            (r'#+ ', 0.2),      # Headers
            (r'\\* |\\- |\\d+\\.', 0.2),  # Lists
            (r'\`\`\`', 0.2),    # Code blocks
            (r'\\n\\n', 0.2),      # Paragraphs
            (r'\\*\\*.*?\\*\\*', 0.2)  # Bold text
        ]
        
        score = 0.0
        for pattern, weight in structure_elements:
            if re.search(pattern, response):
                score += weight
        
        return min(score, 1.0)
    
    def _check_keywords(self, 
                       response: str, 
                       test_case: Dict[str, Any]) -> float:
        """
        Check coverage van belangrijke keywords
        """
        if 'expected_keywords' not in test_case:
            return 1.0
        
        keywords = test_case['expected_keywords']
        found = sum(1 for kw in keywords if kw.lower() in response.lower())
        
        return found / len(keywords) if keywords else 1.0
    
    def _analyze_sentiment(self, response: str) -> float:
        """
        Basis sentiment analyse (0-1, waar 1 = zeer positief)
        """
        positive_words = ['goed', 'uitstekend', 'perfect', 'graag', 'zeker']
        negative_words = ['slecht', 'probleem', 'fout', 'helaas', 'jammer']
        
        words = response.lower().split()
        pos_count = sum(1 for w in words if w in positive_words)
        neg_count = sum(1 for w in words if w in negative_words)
        
        if pos_count + neg_count == 0:
            return 0.5
        
        return pos_count / (pos_count + neg_count)
    
    def _calculate_quality_score(self, metrics: Dict[str, float]) -> float:
        """
        Bereken gewogen kwaliteitsscore
        """
        weights = {
            'readability': 0.2,
            'has_structure': 0.3,
            'keyword_coverage': 0.3,
            'sentiment_score': 0.2
        }
        
        score = sum(metrics.get(key, 0) * weight 
                   for key, weight in weights.items())
        
        return round(score, 2)
\`\`\`

### 2. Human-in-the-loop evaluatie

Voor complexere evaluaties, integreer menselijke beoordeling:

\`\`\`typescript
interface HumanEvaluation {
  responseId: string;
  evaluatorId: string;
  ratings: {
    accuracy: number;      // 1-5
    helpfulness: number;   // 1-5
    clarity: number;       // 1-5
    completeness: number;  // 1-5
  };
  comments: string;
  timestamp: Date;
}

class EvaluationPlatform {
  async createEvaluationTask(
    response: string,
    context: TestCase
  ): Promise<string> {
    // Maak evaluatie interface
    const taskId = generateId();
    
    const evaluationForm = {
      taskId,
      response,
      context,
      questions: [
        {
          id: 'accuracy',
          question: 'Hoe accuraat is het antwoord?',
          type: 'rating',
          scale: 5
        },
        {
          id: 'helpfulness',
          question: 'Hoe behulpzaam is het antwoord?',
          type: 'rating',
          scale: 5
        },
        {
          id: 'clarity',
          question: 'Hoe duidelijk is het antwoord?',
          type: 'rating',
          scale: 5
        },
        {
          id: 'completeness',
          question: 'Hoe volledig is het antwoord?',
          type: 'rating',
          scale: 5
        },
        {
          id: 'comments',
          question: 'Aanvullende opmerkingen?',
          type: 'text'
        }
      ]
    };
    
    await this.saveEvaluationTask(evaluationForm);
    return taskId;
  }
}
\`\`\`

## Performance metrics

### 1. Latency en throughput meting

\`\`\`python
class PerformanceMonitor:
    def __init__(self):
        self.metrics = []
    
    def measure_latency_distribution(self, results: List[Dict]) -> Dict:
        """
        Analyseer latency distributie
        """
        latencies = [r['latency'] for r in results if 'latency' in r]
        
        if not latencies:
            return {}
        
        return {
            'min': min(latencies),
            'max': max(latencies),
            'mean': sum(latencies) / len(latencies),
            'p50': self._percentile(latencies, 50),
            'p95': self._percentile(latencies, 95),
            'p99': self._percentile(latencies, 99)
        }
    
    def calculate_throughput(self, results: List[Dict]) -> Dict:
        """
        Bereken tokens per seconde
        """
        throughput_data = []
        
        for result in results:
            if result.get('success') and 'output_tokens' in result:
                tokens_per_second = result['output_tokens'] / result['latency']
                throughput_data.append({
                    'model': result['model'],
                    'tokens_per_second': tokens_per_second,
                    'latency': result['latency']
                })
        
        return throughput_data
    
    def _percentile(self, data: List[float], percentile: float) -> float:
        """
        Bereken percentiel
        """
        sorted_data = sorted(data)
        index = int(len(sorted_data) * (percentile / 100))
        return sorted_data[min(index, len(sorted_data) - 1)]
\`\`\`

### 2. Kosten analyse

\`\`\`typescript
interface CostAnalysis {
  model: string;
  totalCost: number;
  costPerRequest: number;
  costPerThousandTokens: number;
  projectedMonthlyCost: number;
}

class CostCalculator {
  private readonly pricing = {
    'claude-3-5-sonnet-20241022': {
      input: 3.00,   // per 1M tokens
      output: 15.00  // per 1M tokens
    },
    'claude-3-opus-20240229': {
      input: 15.00,
      output: 75.00
    },
    'claude-3-haiku-20240307': {
      input: 0.25,
      output: 1.25
    }
  };
  
  calculateCosts(results: BenchmarkResult[]): CostAnalysis[] {
    const costByModel = new Map<string, CostData>();
    
    results.forEach(result => {
      if (!result.success) return;
      
      const modelPricing = this.pricing[result.model];
      const inputCost = (result.input_tokens / 1_000_000) * modelPricing.input;
      const outputCost = (result.output_tokens / 1_000_000) * modelPricing.output;
      const totalCost = inputCost + outputCost;
      
      const current = costByModel.get(result.model) || {
        totalCost: 0,
        requestCount: 0,
        totalTokens: 0
      };
      
      costByModel.set(result.model, {
        totalCost: current.totalCost + totalCost,
        requestCount: current.requestCount + 1,
        totalTokens: current.totalTokens + result.total_tokens
      });
    });
    
    return Array.from(costByModel.entries()).map(([model, data]) => ({
      model,
      totalCost: data.totalCost,
      costPerRequest: data.totalCost / data.requestCount,
      costPerThousandTokens: (data.totalCost / data.totalTokens) * 1000,
      projectedMonthlyCost: (data.totalCost / data.requestCount) * 30000 // 30k requests/month
    }));
  }
}
\`\`\`

## A/B testing strategies

### 1. Split testing framework

\`\`\`python
import random
from typing import Dict, List, Callable

class ABTestFramework:
    def __init__(self):
        self.experiments = {}
        self.results = {}
    
    def create_experiment(self, 
                         experiment_id: str,
                         variants: Dict[str, Dict],
                         traffic_split: Dict[str, float] = None):
        """
        Creëer een A/B test experiment
        
        variants: {
            'control': {'model': 'claude-3-haiku', 'temperature': 0.7},
            'variant_a': {'model': 'claude-3-5-sonnet', 'temperature': 0.7},
            'variant_b': {'model': 'claude-3-5-sonnet', 'temperature': 0.3}
        }
        """
        if traffic_split is None:
            # Gelijke verdeling als niet gespecificeerd
            split = 1.0 / len(variants)
            traffic_split = {k: split for k in variants}
        
        self.experiments[experiment_id] = {
            'variants': variants,
            'traffic_split': traffic_split,
            'start_time': datetime.now(),
            'results': {k: [] for k in variants}
        }
    
    def get_variant(self, experiment_id: str, user_id: str = None) -> str:
        """
        Bepaal welke variant een gebruiker krijgt
        """
        experiment = self.experiments.get(experiment_id)
        if not experiment:
            raise ValueError(f"Experiment {experiment_id} not found")
        
        # Gebruik user_id voor consistente variant toewijzing
        if user_id:
            random.seed(f"{experiment_id}:{user_id}")
        
        rand = random.random()
        cumulative = 0.0
        
        for variant, split in experiment['traffic_split'].items():
            cumulative += split
            if rand < cumulative:
                return variant
        
        return list(experiment['variants'].keys())[-1]
    
    def record_result(self, 
                     experiment_id: str, 
                     variant: str, 
                     metrics: Dict[str, Any]):
        """
        Registreer resultaten van een variant
        """
        if experiment_id not in self.experiments:
            raise ValueError(f"Experiment {experiment_id} not found")
        
        self.experiments[experiment_id]['results'][variant].append({
            'timestamp': datetime.now(),
            'metrics': metrics
        })
    
    def analyze_results(self, experiment_id: str) -> Dict:
        """
        Analyseer A/B test resultaten
        """
        experiment = self.experiments.get(experiment_id)
        if not experiment:
            raise ValueError(f"Experiment {experiment_id} not found")
        
        analysis = {}
        
        for variant, results in experiment['results'].items():
            if not results:
                continue
            
            # Bereken gemiddelde metrics
            metrics_summary = {}
            all_metrics = [r['metrics'] for r in results]
            
            if all_metrics:
                metric_keys = all_metrics[0].keys()
                for key in metric_keys:
                    values = [m[key] for m in all_metrics if key in m]
                    if values and all(isinstance(v, (int, float)) for v in values):
                        metrics_summary[key] = {
                            'mean': sum(values) / len(values),
                            'min': min(values),
                            'max': max(values),
                            'count': len(values)
                        }
            
            analysis[variant] = {
                'sample_size': len(results),
                'metrics': metrics_summary,
                'config': experiment['variants'][variant]
            }
        
        # Bepaal winnaar op basis van quality_score
        if all('quality_score' in a['metrics'] for a in analysis.values() if a['metrics']):
            scores = {
                v: data['metrics']['quality_score']['mean'] 
                for v, data in analysis.items() 
                if 'quality_score' in data['metrics']
            }
            if scores:
                winner = max(scores.items(), key=lambda x: x[1])
                analysis['winner'] = {
                    'variant': winner[0],
                    'score': winner[1],
                    'improvement': self._calculate_improvement(scores)
                }
        
        return analysis
    
    def _calculate_improvement(self, scores: Dict[str, float]) -> float:
        """
        Bereken verbetering t.o.v. control
        """
        if 'control' not in scores:
            return 0.0
        
        control_score = scores['control']
        best_score = max(scores.values())
        
        if control_score == 0:
            return 0.0
        
        return ((best_score - control_score) / control_score) * 100
\`\`\`

### 2. Live A/B testing implementatie

\`\`\`typescript
class LiveABTest {
  private abTest: ABTestFramework;
  private claude: ClaudeClient;
  
  async handleRequest(
    userQuery: string,
    userId: string,
    experimentId: string
  ): Promise<Response> {
    // Bepaal variant voor gebruiker
    const variant = this.abTest.getVariant(experimentId, userId);
    const config = this.abTest.getVariantConfig(experimentId, variant);
    
    // Track request start
    const startTime = Date.now();
    
    try {
      // Maak API call met variant configuratie
      const response = await this.claude.messages.create({
        model: config.model,
        temperature: config.temperature,
        max_tokens: config.maxTokens || 1000,
        messages: [{ role: 'user', content: userQuery }]
      });
      
      const endTime = Date.now();
      
      // Record metrics
      await this.abTest.recordResult(experimentId, variant, {
        latency: endTime - startTime,
        tokens: response.usage.total_tokens,
        success: true,
        userId: userId
      });
      
      return {
        response: response.content[0].text,
        variant: variant,
        experimentId: experimentId
      };
      
    } catch (error) {
      // Record failure
      await this.abTest.recordResult(experimentId, variant, {
        latency: Date.now() - startTime,
        success: false,
        error: error.message,
        userId: userId
      });
      
      throw error;
    }
  }
}
\`\`\`

## Creating evaluation criteria

### 1. Domein-specifieke criteria

\`\`\`python
class EvaluationCriteria:
    """
    Flexibel framework voor domein-specifieke evaluatie
    """
    
    def __init__(self, domain: str):
        self.domain = domain
        self.criteria = self._load_domain_criteria(domain)
    
    def _load_domain_criteria(self, domain: str) -> List[Dict]:
        """
        Laad criteria specifiek voor het domein
        """
        domain_criteria = {
            'customer_support': [
                {
                    'name': 'empathy',
                    'weight': 0.3,
                    'keywords': ['begrijp', 'snap', 'vervelend', 'excuses'],
                    'patterns': [r'het spijt (me|ons)', r'ik begrijp']
                },
                {
                    'name': 'solution_oriented',
                    'weight': 0.4,
                    'keywords': ['oplossing', 'helpen', 'regelen', 'zorgen'],
                    'patterns': [r'ik (kan|zal) .* voor u']
                },
                {
                    'name': 'clarity',
                    'weight': 0.3,
                    'max_sentence_length': 25,
                    'readability_target': 60
                }
            ],
            'technical_documentation': [
                {
                    'name': 'technical_accuracy',
                    'weight': 0.5,
                    'required_elements': ['code_examples', 'parameters', 'return_values']
                },
                {
                    'name': 'completeness',
                    'weight': 0.3,
                    'sections': ['description', 'usage', 'examples', 'errors']
                },
                {
                    'name': 'consistency',
                    'weight': 0.2,
                    'style_guide': 'technical_writing_v2'
                }
            ],
            'creative_writing': [
                {
                    'name': 'originality',
                    'weight': 0.4,
                    'diversity_threshold': 0.8
                },
                {
                    'name': 'engagement',
                    'weight': 0.4,
                    'min_descriptive_words': 10,
                    'variety_score': 0.7
                },
                {
                    'name': 'coherence',
                    'weight': 0.2,
                    'flow_score': 0.8
                }
            ]
        }
        
        return domain_criteria.get(domain, [])
    
    def evaluate(self, response: str, context: Dict = None) -> Dict[str, float]:
        """
        Evalueer response tegen domein criteria
        """
        scores = {}
        total_weight = 0
        
        for criterion in self.criteria:
            score = self._evaluate_criterion(response, criterion, context)
            scores[criterion['name']] = score
            total_weight += criterion['weight']
        
        # Bereken gewogen totaal
        weighted_score = sum(
            scores[c['name']] * c['weight'] 
            for c in self.criteria
        ) / total_weight if total_weight > 0 else 0
        
        scores['total'] = weighted_score
        
        return scores
\`\`\`

### 2. Automated testing pipeline

\`\`\`typescript
class BenchmarkPipeline {
  private benchmark: ClaudeBenchmark;
  private evaluator: QualityEvaluator;
  private costCalculator: CostCalculator;
  
  async runCompleteBenchmark(
    config: BenchmarkConfig
  ): Promise<BenchmarkReport> {
    console.log('Starting benchmark pipeline...');
    
    // 1. Setup test cases
    const testCases = await this.loadTestCases(config.testSuite);
    
    // 2. Run benchmarks
    const results = await this.benchmark.runBenchmarkSuite(
      config.models,
      testCases,
      config.iterations
    );
    
    // 3. Evaluate quality
    const qualityScores = await this.evaluateAllResponses(results);
    
    // 4. Calculate performance metrics
    const performanceMetrics = this.calculatePerformanceMetrics(results);
    
    // 5. Cost analysis
    const costAnalysis = this.costCalculator.calculateCosts(results);
    
    // 6. Generate report
    const report = this.generateReport({
      config,
      results,
      qualityScores,
      performanceMetrics,
      costAnalysis
    });
    
    // 7. Save results
    await this.saveResults(report);
    
    return report;
  }
  
  private generateReport(data: any): BenchmarkReport {
    return {
      summary: {
        timestamp: new Date().toISOString(),
        totalTests: data.results.length,
        modelsTestd: data.config.models,
        recommendations: this.generateRecommendations(data)
      },
      detailedResults: {
        byModel: this.groupResultsByModel(data),
        byTestCase: this.groupResultsByTestCase(data),
        qualityComparison: data.qualityScores,
        performanceComparison: data.performanceMetrics,
        costComparison: data.costAnalysis
      },
      visualizations: {
        latencyChart: this.generateLatencyChart(data),
        qualityRadar: this.generateQualityRadar(data),
        costBenefitMatrix: this.generateCostBenefitMatrix(data)
      }
    };
  }
  
  private generateRecommendations(data: any): string[] {
    const recommendations = [];
    
    // Analyseer resultaten en genereer aanbevelingen
    const bestQuality = this.findBestByMetric(data, 'quality');
    const bestSpeed = this.findBestByMetric(data, 'latency');
    const bestValue = this.findBestByMetric(data, 'cost_efficiency');
    
    recommendations.push(
      \`Voor hoogste kwaliteit: gebruik \${bestQuality.model}\`,
      \`Voor snelste responses: gebruik \${bestSpeed.model}\`,
      \`Voor beste prijs/kwaliteit: gebruik \${bestValue.model}\`
    );
    
    return recommendations;
  }
}
\`\`\`

## Best practices

### 1. Test suite onderhoud
- Update test cases regelmatig
- Voeg edge cases toe wanneer ze voorkomen
- Versiebeheer voor test scenarios

### 2. Statistische significantie
- Minimaal 30 samples per test
- Gebruik confidence intervals
- Account voor variabiliteit

### 3. Continuous benchmarking
\`\`\`yaml
# GitHub Action voor automated benchmarking
name: Claude Model Benchmark

on:
  schedule:
    - cron: '0 2 * * 1'  # Weekly op maandag
  workflow_dispatch:

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      
      - name: Install dependencies
        run: |
          pip install anthropic pandas matplotlib
      
      - name: Run benchmarks
        env:
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          python benchmark.py --models all --iterations 5
      
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: benchmark-results
          path: results/
\`\`\`

## Oefening

Bouw je eigen benchmark suite:

1. **Identificeer 5 kritieke use cases** voor jouw applicatie
2. **Creëer test scenarios** met verwachte outputs
3. **Implementeer automated testing** met de code uit deze les
4. **Voer benchmarks uit** voor alle Claude modellen
5. **Analyseer resultaten** en maak een model selectie

Door systematisch te testen en benchmarken, kun je data-gedreven beslissingen nemen over welk Claude model het beste past bij jouw specifieke requirements.
  `,
};