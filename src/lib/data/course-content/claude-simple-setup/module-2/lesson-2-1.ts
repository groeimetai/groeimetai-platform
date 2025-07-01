import type { Lesson } from '@/lib/data/courses';

export const lesson2_1: Lesson = {
  id: 'lesson-2-1',
  title: 'Use case analyse en requirements',
  duration: '30 min',
  content: `
# Use Case Analyse en Requirements

Het succesvol implementeren van Claude begint met een grondige analyse van jouw specifieke behoeften. In deze les doorloop je een gestructureerd proces om de juiste Claude configuratie te bepalen voor jouw use case.

## Waarom Use Case Analyse Cruciaal is

Voordat je begint met implementeren, is het essentieel om helder te hebben:
- **Wat** je precies wilt bereiken met Claude
- **Wie** de eindgebruikers zijn
- **Hoeveel** budget en resources beschikbaar zijn
- **Wanneer** je welke performance nodig hebt

Een verkeerde modelkeuze kan leiden tot:
- Onnodig hoge kosten (overengineering)
- Teleurstellende resultaten (underengineering)
- Schaalbaarheidsuitdagingen
- Gebruikersfrustatie door trage responses

## Stap 1: Identificeer Je Specifieke Behoeften

### Use Case Categorisatie Framework

**1. Content & Creatieve Taken**
- Blog posts en artikelen schrijven
- Marketing copy genereren
- Verhalen en scripts ontwikkelen
- Social media content creëren

**2. Analyse & Onderzoek**
- Document samenvatting
- Data interpretatie
- Marktonderzoek analyse
- Wetenschappelijke literatuur review

**3. Technische Assistentie**
- Code generatie en debugging
- Architectuur ontwerp
- API documentatie
- Technische troubleshooting

**4. Conversationele AI**
- Klantenservice chatbots
- Virtuele assistenten
- FAQ automatisering
- Lead kwalificatie

**5. Enterprise Toepassingen**
- Contract analyse
- Compliance checking
- Risk assessment
- Knowledge management

### Requirements Checklist

Voor elke use case, evalueer:

\`\`\`markdown
□ Volume: Hoeveel requests per dag/maand?
□ Complexiteit: Simpele Q&A of complexe redenering?
□ Context: Korte prompts of lange documenten?
□ Kwaliteit: Acceptabel foutpercentage?
□ Snelheid: Real-time of batch processing?
□ Budget: Maximale kosten per maand?
□ Integratie: Standalone of embedded in applicatie?
□ Compliance: Privacy/security requirements?
\`\`\`

## Stap 2: Performance vs Cost Trade-offs

### Cost-Performance Matrix

| Use Case Type | Recommended Model | Kosten/maand* | Performance |
|---------------|-------------------|---------------|-------------|
| **High-Volume Chat** | Haiku | €50-200 | ⭐⭐⭐ |
| **Content Creation** | Sonnet 3.5 | €200-1000 | ⭐⭐⭐⭐ |
| **Complex Analysis** | Opus | €1000-5000 | ⭐⭐⭐⭐⭐ |
| **Hybrid System** | Mix | €500-2000 | ⭐⭐⭐⭐ |

*Gebaseerd op 10K-100K requests/maand

### ROI Calculatie Tool

\`\`\`python
def calculate_claude_roi(use_case_params):
    """
    Bereken ROI voor Claude implementatie
    """
    # Input parameters
    daily_requests = use_case_params['daily_requests']
    avg_tokens_per_request = use_case_params['avg_tokens']
    time_saved_per_request = use_case_params['time_saved'] # minuten
    hourly_rate = use_case_params['hourly_rate'] # €
    
    # Model kosten (per miljoen tokens)
    model_costs = {
        'haiku': {'input': 0.25, 'output': 1.25},
        'sonnet': {'input': 3.00, 'output': 15.00},
        'opus': {'input': 15.00, 'output': 75.00}
    }
    
    # Bereken maandelijkse kosten per model
    monthly_costs = {}
    for model, costs in model_costs.items():
        input_cost = (daily_requests * 30 * avg_tokens_per_request * 
                     costs['input']) / 1_000_000
        output_cost = (daily_requests * 30 * avg_tokens_per_request * 2 * 
                      costs['output']) / 1_000_000
        monthly_costs[model] = input_cost + output_cost
    
    # Bereken tijdsbesparing
    monthly_time_saved = daily_requests * 30 * time_saved_per_request / 60
    monthly_value = monthly_time_saved * hourly_rate
    
    # ROI per model
    roi_results = {}
    for model, cost in monthly_costs.items():
        roi_results[model] = {
            'cost': cost,
            'value': monthly_value,
            'roi_percentage': ((monthly_value - cost) / cost) * 100,
            'payback_days': (cost / (monthly_value / 30)) if monthly_value > 0 else float('inf')
        }
    
    return roi_results
\`\`\`

### Praktijkvoorbeeld: E-commerce Support

**Scenario**: Online retailer wil klantenservice automatiseren

\`\`\`python
use_case = {
    'daily_requests': 500,
    'avg_tokens': 200,
    'time_saved': 5,  # 5 minuten per interactie
    'hourly_rate': 25  # €25 per uur support medewerker
}

roi = calculate_claude_roi(use_case)

# Resultaat:
# Haiku: €15/maand, ROI: 20,833%
# Sonnet: €180/maand, ROI: 1,736%
# Opus: €900/maand, ROI: 347%
\`\`\`

**Conclusie**: Voor high-volume, simpele support queries is Haiku overduidelijk de beste keuze.

## Stap 3: Latency Requirements

### Response Time Benchmarks

| Model | Gemiddelde Latency | 95th Percentile | Use Cases |
|-------|-------------------|-----------------|-----------|
| **Haiku** | 200-500ms | <1s | Real-time chat, autocomplete |
| **Sonnet 3.5** | 1-3s | <5s | Content generation, analysis |
| **Opus** | 2-5s | <8s | Complex reasoning, research |

### Latency Optimalisatie Strategieën

**1. Streaming Responses**
\`\`\`python
# Stream tokens zodra ze gegenereerd worden
async def stream_claude_response(prompt):
    async with client.messages.stream(
        model="claude-3-5-sonnet-20241022",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1000
    ) as stream:
        async for chunk in stream:
            yield chunk.delta.text
\`\`\`

**2. Response Caching**
\`\`\`python
# Cache veelvoorkomende queries
from functools import lru_cache
import hashlib

@lru_cache(maxsize=1000)
def get_cached_response(prompt_hash):
    return stored_responses.get(prompt_hash)

def process_request(prompt):
    prompt_hash = hashlib.md5(prompt.encode()).hexdigest()
    cached = get_cached_response(prompt_hash)
    if cached:
        return cached
    
    # Anders: nieuwe API call
    response = claude_api_call(prompt)
    store_response(prompt_hash, response)
    return response
\`\`\`

**3. Model Routing**
\`\`\`python
def route_to_model(query_complexity):
    """
    Route naar juiste model based op complexiteit
    """
    if query_complexity < 3:
        return "claude-3-haiku"
    elif query_complexity < 7:
        return "claude-3-5-sonnet"
    else:
        return "claude-3-opus"
\`\`\`

## Stap 4: Context Window Planning

### Context Window Gebruik per Use Case

| Use Case | Typisch Context Gebruik | Aanbevolen Buffer |
|----------|------------------------|-------------------|
| **Chat Support** | 1-2K tokens | 5K tokens |
| **Document Analyse** | 20-50K tokens | 100K tokens |
| **Code Review** | 5-20K tokens | 50K tokens |
| **Research Tasks** | 50-150K tokens | 200K tokens |

### Context Management Best Practices

**1. Conversatie Pruning**
\`\`\`python
def manage_conversation_context(messages, max_tokens=50000):
    """
    Houd conversatie context binnen grenzen
    """
    total_tokens = 0
    pruned_messages = []
    
    # Begin vanaf meest recente berichten
    for msg in reversed(messages):
        msg_tokens = count_tokens(msg['content'])
        if total_tokens + msg_tokens > max_tokens:
            break
        pruned_messages.insert(0, msg)
        total_tokens += msg_tokens
    
    # Voeg altijd system prompt toe
    if pruned_messages[0]['role'] != 'system':
        pruned_messages.insert(0, {
            'role': 'system',
            'content': 'Belangrijke context is mogelijk verwijderd.'
        })
    
    return pruned_messages
\`\`\`

**2. Document Chunking**
\`\`\`python
def chunk_large_document(document, chunk_size=30000, overlap=1000):
    """
    Split grote documenten in overlappende chunks
    """
    tokens = tokenize(document)
    chunks = []
    
    for i in range(0, len(tokens), chunk_size - overlap):
        chunk = tokens[i:i + chunk_size]
        chunks.append(detokenize(chunk))
    
    return chunks
\`\`\`

## Stap 5: Budget Planning

### Budget Allocatie Framework

**Maandelijks Budget Verdeling:**
\`\`\`
Totaal Budget: €1000

1. Development/Testing (20%): €200
   - Haiku voor rapid prototyping
   - Sonnet voor feature development

2. Production - Primary (60%): €600
   - Sonnet 3.5 voor hoofdfunctionaliteit
   - Geoptimaliseerde prompts

3. Production - Premium (15%): €150
   - Opus voor complexe edge cases
   - High-value gebruikers

4. Buffer/Overage (5%): €50
   - Onverwachte pieken
   - Nieuwe features testen
\`\`\`

### Cost Control Implementatie

\`\`\`python
class BudgetManager:
    def __init__(self, monthly_budget):
        self.monthly_budget = monthly_budget
        self.daily_budget = monthly_budget / 30
        self.spent_today = 0
        self.spent_month = 0
    
    def can_make_request(self, estimated_cost):
        """Check of request binnen budget past"""
        if self.spent_today + estimated_cost > self.daily_budget:
            return False, "Daily limit reached"
        if self.spent_month + estimated_cost > self.monthly_budget:
            return False, "Monthly limit reached"
        return True, "OK"
    
    def track_request(self, actual_cost):
        """Update budget tracking"""
        self.spent_today += actual_cost
        self.spent_month += actual_cost
        
        # Alert bij 80% budget gebruik
        if self.spent_month > self.monthly_budget * 0.8:
            send_budget_alert()
\`\`\`

## Decision Matrix Tool

### Interactieve Model Selectie Matrix

Beantwoord deze vragen om het juiste model te kiezen:

\`\`\`yaml
1. Wat is je primaire use case?
   a) Customer support → Score: +3 Haiku
   b) Content creation → Score: +3 Sonnet
   c) Complex analysis → Score: +3 Opus
   d) Mixed gebruik → Score: +1 alle modellen

2. Hoeveel requests verwacht je per dag?
   a) <100 → Score: +1 Opus
   b) 100-1000 → Score: +2 Sonnet
   c) >1000 → Score: +3 Haiku

3. Wat is je response time requirement?
   a) <1 seconde → Score: +3 Haiku
   b) 1-5 seconden → Score: +2 Sonnet
   c) >5 seconden OK → Score: +1 Opus

4. Hoe complex zijn de taken?
   a) Simpele Q&A → Score: +3 Haiku
   b) Moderate complexiteit → Score: +3 Sonnet
   c) Hoge complexiteit → Score: +3 Opus

5. Wat is je maandbudget voor AI?
   a) <€100 → Score: +3 Haiku
   b) €100-1000 → Score: +2 Sonnet
   c) >€1000 → Score: +1 Opus

Resultaat:
- Hoogste score = aanbevolen model
- Gelijke scores = overweeg hybrid approach
\`\`\`

## Praktijkcasus: SaaS Startup

**Bedrijf**: TechStartup B.V.
**Use Case**: AI-powered project management assistant

### Requirements Analyse:
- 50 actieve gebruikers
- ~20 interacties per gebruiker per dag
- Complexe project queries
- Budget: €750/maand
- Latency: <3 seconden acceptabel

### Model Selectie Process:
1. **Volume**: 1000 requests/dag = Medium
2. **Complexiteit**: Project planning = Medium-High
3. **Context**: Project documenten = Medium (10-20K tokens)
4. **Budget**: €750 = Medium

### Beslissing:
**Primair**: Claude 3.5 Sonnet (85% van requests)
**Fallback**: Claude 3 Haiku (simpele queries, 10%)
**Premium**: Claude 3 Opus (complexe analyses, 5%)

### Implementatie:
\`\`\`python
def select_model_for_query(query, user_tier, complexity_score):
    """
    Dynamische model selectie based op query eigenschappen
    """
    # Premium gebruikers krijgen altijd beste model
    if user_tier == 'premium' and complexity_score > 7:
        return 'claude-3-opus'
    
    # Route based op complexiteit
    if complexity_score < 3:
        return 'claude-3-haiku'
    elif complexity_score < 7:
        return 'claude-3-5-sonnet'
    else:
        # Check budget voordat Opus gebruikt wordt
        if budget_manager.can_afford_opus():
            return 'claude-3-opus'
        else:
            return 'claude-3-5-sonnet'
\`\`\`

## Conclusie en Actieplan

Na deze analyse heb je:
1. ✅ Je specifieke requirements geïdentificeerd
2. ✅ Performance vs kosten afgewogen
3. ✅ Latency behoeften bepaald
4. ✅ Context window strategie
5. ✅ Budget allocatie plan

### Volgende Stappen:
1. Vul de decision matrix in voor jouw use case
2. Bereken ROI met de meegeleverde tool
3. Start met een kleine pilot
4. Monitor en optimaliseer based op werkelijke usage

In de volgende les gaan we dieper in op de technische specificaties van elk model en hoe je deze optimaal configureert.
  `,
};