import type { Lesson } from '@/lib/data/courses';

export const lesson1_2: Lesson = {
  id: 'lesson-1-2',
  title: 'Claude model familie overzicht',
  duration: '35 min',
  content: `
# Claude Model Familie Overzicht

## Introductie

Claude biedt verschillende AI-modellen aan, elk geoptimaliseerd voor specifieke use cases. In deze les leer je de sterke punten van elk model kennen en hoe je de juiste keuze maakt voor jouw toepassing.

## De Claude Model Familie

### Claude 3.5 Sonnet - De Allrounder

**Belangrijkste kenmerken:**
- Beste balans tussen intelligentie, snelheid en kosten
- 200K context window (ongeveer 150.000 woorden)
- Uitstekend in code generatie en technische taken
- Sterke redeneervaardigheden
- Multimodaal: kan afbeeldingen analyseren

**Ideaal voor:**
- Content creatie en editing
- Code development en debugging
- Data analyse en visualisatie
- Klantenservice automatisering
- Algemene bedrijfstoepassingen

**Praktijkvoorbeeld:**
\`\`\`python
# Claude 3.5 Sonnet is perfect voor complexe code taken
def analyze_customer_feedback(feedback_list):
    """
    Sonnet kan deze functie niet alleen schrijven,
    maar ook optimaliseren en edge cases bedenken
    """
    sentiment_scores = []
    for feedback in feedback_list:
        # Complexe sentiment analyse logica
        score = calculate_sentiment(feedback)
        sentiment_scores.append(score)
    return aggregate_results(sentiment_scores)
\`\`\`

### Claude 3 Opus - De Specialist

**Belangrijkste kenmerken:**
- Hoogste intelligentie en begrip
- Beste prestaties op complexe taken
- Superieur in nuance en context begrip
- 200K context window
- Multimodaal met geavanceerde vision capabilities

**Ideaal voor:**
- Complexe research en analyse
- Strategische planning
- Creatieve projecten met hoge kwaliteitseisen
- Wetenschappelijke en technische documentatie
- Taken die diepe redenering vereisen

**Praktijkvoorbeeld:**
Een bedrijf gebruikt Opus voor het analyseren van complexe juridische contracten:
- Identificeert subtiele risico's
- Vergelijkt met precedenten
- Genereert gedetailleerde rapporten
- Adviseert over onderhandelingsstrategieën

### Claude 3 Haiku - De Snelle

**Belangrijkste kenmerken:**
- Ultra-snelle response tijd (sub-seconde)
- Laagste kosten per token
- Compact maar capabel
- 200K context window
- Ideaal voor high-volume toepassingen

**Ideaal voor:**
- Real-time chat applicaties
- Bulk data processing
- Eenvoudige classificatie taken
- API endpoints met lage latency vereisten
- Mobiele applicaties

**Praktijkvoorbeeld:**
\`\`\`javascript
// Haiku voor snelle customer support responses
async function quickResponse(userQuery) {
  // Haiku geeft binnen 200ms antwoord
  const response = await claude.haiku.complete({
    prompt: userQuery,
    max_tokens: 150
  });
  return response;
}
\`\`\`

## Model Vergelijking Matrix

| Aspect | Claude 3.5 Sonnet | Claude 3 Opus | Claude 3 Haiku |
|--------|-------------------|---------------|----------------|
| **Intelligentie** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Snelheid** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Kosten** | $$ | $$$$ | $ |
| **Context Window** | 200K | 200K | 200K |
| **Vision Support** | ✅ | ✅ | ✅ |
| **Response Tijd** | ~2-3 sec | ~3-5 sec | <1 sec |

## Kosten Analyse

### Prijsstructuur (per miljoen tokens)*
- **Claude 3.5 Sonnet**: 
  - Input: $3
  - Output: $15
  
- **Claude 3 Opus**: 
  - Input: $15
  - Output: $75
  
- **Claude 3 Haiku**: 
  - Input: $0.25
  - Output: $1.25

*Prijzen kunnen variëren, check altijd de actuele prijzen

### ROI Berekening Voorbeeld

Voor een customer service toepassing met 10.000 queries per dag:

**Haiku implementatie:**
- Kosten: ~$5/dag
- Responstijd: <1 seconde
- Klanttevredenheid: 85%

**Sonnet implementatie:**
- Kosten: ~$30/dag
- Responstijd: 2-3 seconden
- Klanttevredenheid: 92%

**ROI verschil:** Extra $25/dag voor 7% hogere tevredenheid

## Praktisch Beslissingsframework

### Stap 1: Analyseer je Use Case

**Complexiteit Assessment:**
- **Laag**: Standaard vragen, simpele classificatie → Haiku
- **Medium**: Content generatie, code assistentie → Sonnet
- **Hoog**: Research, strategie, complexe analyse → Opus

### Stap 2: Evalueer je Requirements

**Performance Criteria:**
1. **Latency kritisch** (<1s required)? → Haiku
2. **Kwaliteit kritisch**? → Opus
3. **Balans nodig**? → Sonnet

### Stap 3: Test en Valideer

\`\`\`python
# Test framework voor model selectie
def test_model_performance(task, test_cases):
    results = {}
    
    for model in ['haiku', 'sonnet', 'opus']:
        results[model] = {
            'quality': evaluate_quality(model, test_cases),
            'speed': measure_latency(model, test_cases),
            'cost': calculate_cost(model, test_cases)
        }
    
    return recommend_model(results, task.requirements)
\`\`\`

## Best Practices voor Model Selectie

### 1. Start Klein, Schaal Op
Begin met Haiku voor prototyping, upgrade naar Sonnet/Opus waar nodig.

### 2. Hybride Aanpak
Gebruik verschillende modellen voor verschillende delen van je applicatie:
- Haiku voor initial routing
- Sonnet voor hoofdfunctionaliteit
- Opus voor complexe edge cases

### 3. Context Window Optimalisatie
Alle modellen hebben 200K tokens, maar:
- Haiku: Gebruik voor korte, gefocuste taken
- Sonnet: Ideaal voor medium-length documenten
- Opus: Maximaal benutten voor complexe analyse

### 4. Monitoring en Optimalisatie
\`\`\`javascript
// Monitor model performance
const modelMetrics = {
  track: function(model, task, result) {
    return {
      model: model,
      latency: result.latency,
      tokenCount: result.tokens,
      cost: result.tokens * MODEL_RATES[model],
      quality: assessQuality(result.output)
    };
  }
};
\`\`\`

## Praktijkoefening

**Scenario:** Je bouwt een AI-assistent voor een advocatenkantoor.

**Requirements:**
- Document analyse (contracten tot 50 pagina's)
- Juridisch advies genereren
- Quick search functionaliteit
- Budget: €1000/maand

**Oplossing:**
1. **Quick search**: Haiku (hoge volume, lage latency)
2. **Document screening**: Sonnet (balans kwaliteit/kosten)
3. **Complexe juridische analyse**: Opus (kritieke taken)

**Implementatie strategie:**
- 70% queries naar Haiku (€50/maand)
- 25% naar Sonnet (€300/maand)
- 5% naar Opus (€650/maand)

## Conclusie

De keuze van het juiste Claude model is cruciaal voor het succes van je AI-implementatie. Door de sterke punten van elk model te begrijpen en een doordacht selectieframework te gebruiken, kun je optimale resultaten bereiken binnen je budget.

### Kernpunten om te onthouden:
- **Haiku**: Snelheid en schaalbaarheid
- **Sonnet**: Beste all-round prestaties
- **Opus**: Ongeëvenaarde intelligentie voor complexe taken

### Volgende stappen:
1. Identificeer je primaire use case
2. Test met verschillende modellen
3. Monitor prestaties en kosten
4. Optimaliseer je model mix

In de volgende les gaan we dieper in op praktische implementatie strategieën voor elk model.
  `,
};