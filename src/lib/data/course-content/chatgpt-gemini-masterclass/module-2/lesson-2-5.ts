import type { Lesson } from '@/lib/data/courses'
export const lesson2_5: Lesson = {
  id: 'lesson-2-5',
  title: "Gemini's data processing mogelijkheden",
  duration: '60 minuten',
  content: `# Gemini's Data Processing Mogelijkheden

## Google Gemini vs ChatGPT voor Data Analyse

Hoewel ChatGPT's Advanced Data Analysis krachtige code-gebaseerde analyse biedt, heeft Google Gemini zijn eigen unieke voordelen voor data processing.

## Gemini's Sterke Punten

### 1. Multimodale Data Analyse
Gemini kan verschillende data types simultaan verwerken:
- **Tekst + Afbeeldingen**: Analyseer grafieken in rapporten
- **Tabellen + Context**: Begrijp data in context van documenten
- **Screenshots + Vragen**: Upload Excel screenshots voor quick insights

### 2. Google Workspace Integratie
\`\`\`
"@Google Sheets analyseer mijn verkoop spreadsheet en:
- Identificeer trends in Q4 2024
- Vergelijk met vorig jaar
- Maak een management summary"
\`\`\`

### 3. Real-time Data Access
In tegenstelling tot ChatGPT kan Gemini:
- Actuele marktdata ophalen
- Live currency conversies uitvoeren  
- Recente nieuwsgebeurtenissen meenemen in analyse

## Praktische Gemini Data Workflows

### Excel Screenshot Analyse
\`\`\`
"Ik upload een screenshot van mijn Excel dashboard.
Kun je:
1. De data interpreteren
2. Verbeterpunten voor de visualisaties geven
3. De belangrijkste insights samenvatten"
\`\`\`

### Google Sheets Formules
\`\`\`
"Help me een Google Sheets formule schrijven die:
- Zoekt naar de hoogste verkoop per regio
- Alleen data van dit kwartaal meeneemt
- Een dynamisch dashboard update"
\`\`\`

### BigQuery Integration
Voor enterprise gebruikers:
\`\`\`
"Schrijf een BigQuery SQL query die:
- Customer lifetime value berekent
- Segmenteert op basis van koopgedrag
- Optimaliseert voor performance"
\`\`\`

## Gemini Extensions voor Data

### 1. Google Workspace Extension
- Direct toegang tot Sheets, Docs, Drive
- Analyseer data zonder downloaden
- Automatische updates bij wijzigingen

### 2. Export naar Google Services
- Sheets: Directe data manipulatie
- Slides: Automatische presentaties
- Looker Studio: Professionele dashboards

## Vergelijking: Wanneer Gemini, Wanneer ChatGPT?

### Gebruik Gemini voor:
✅ Google Workspace geïntegreerde workflows
✅ Real-time data met internet toegang
✅ Multimodale analyse (tekst + afbeeldingen)
✅ Snelle screenshot-gebaseerde inzichten
✅ SQL en BigQuery taken

### Gebruik ChatGPT Advanced Data Analysis voor:
✅ Complexe Python-based analyses
✅ Machine learning modellen
✅ Grote datasets (>100MB)
✅ Custom visualisaties met code
✅ Statistische testing en modeling

## Gemini Prompt Engineering voor Data

### Effectieve Data Prompts
1. **Context-rijk**:
   "Als financial analyst, analyseer deze sales data met focus op seasonality"

2. **Output-specifiek**:
   "Geef resultaten in een tabel format geschikt voor executive presentation"

3. **Actie-georiënteerd**:
   "Identificeer de top 3 acties om sales te verbeteren based op deze data"

## Geavanceerde Gemini Features

### Code Generation voor Data Science
\`\`\`
"Genereer Python code voor Google Colab die:
- Mijn CSV data inlaadt van Google Drive
- Een predictive model bouwt
- Resultaten visualiseert met Plotly"
\`\`\`

### Data Storytelling
\`\`\`
"Transform deze data analyse in een compelling story:
- Begin met de business challenge
- Presenteer key findings visueel
- Eindig met concrete aanbevelingen
- Maak het geschikt voor C-level audience"
\`\`\`

## Combineer Gemini met Other Tools

### Gemini + Looker Studio
1. Laat Gemini je data analyseren
2. Genereer Looker Studio compatible formats
3. Bouw interactieve dashboards

### Gemini + AppSheet
1. Analyseer business requirements met Gemini
2. Genereer data modellen
3. Bouw no-code apps met AppSheet

## Best Practices voor Gemini Data Analysis

### 1. Data Privacy
- Gebruik Gemini Enterprise voor gevoelige data
- Anonimiseer persoonlijke informatie
- Check data retention policies

### 2. Iteratieve Analyse
- Start breed, zoom in op details
- Vraag om verschillende perspectieven
- Valideer resultaten met brondata

### 3. Documentatie
- Laat Gemini analyses documenteren
- Genereer reproduceerbare workflows
- Maak audit trails voor beslissingen`,
  codeExamples: [
    {
      id: 'example-5-1',
      title: 'Gemini genereert: Google Sheets formules',
      language: 'text',
      code: `// Gemini's respons op complexe Google Sheets formule verzoek

Voor jouw requirement genereer ik een dynamische formule die:
1. De hoogste verkoop per regio vindt
2. Alleen Q4 2024 data gebruikt
3. Automatisch update bij nieuwe data

=QUERY(
  Verkoop!A:F,
  "SELECT B, MAX(E) 
   WHERE A >= DATE '2024-10-01' 
   AND A <= DATE '2024-12-31' 
   GROUP BY B 
   ORDER BY MAX(E) DESC
   LABEL B 'Regio', MAX(E) 'Hoogste Verkoop Q4'",
  1
)

// Voor een volledig dashboard, gebruik deze array formule:
=ARRAYFORMULA({
  "Dashboard Q4 2024";
  "";
  {"Regio", "Hoogste Verkoop", "Aantal Trans", "Gem. Order"};
  QUERY(
    Verkoop!A:F,
    "SELECT B, 
            MAX(E), 
            COUNT(A), 
            AVG(E)
     WHERE A >= DATE '2024-10-01' 
     GROUP BY B 
     ORDER BY MAX(E) DESC",
    0
  )
})

// Voor conditional formatting based op targets:
=IF(E2>=VLOOKUP(B2,Targets!A:B,2,FALSE),
    "✓ Target Behaald",
    "↓ " & TEXT(VLOOKUP(B2,Targets!A:B,2,FALSE)-E2,"€#,##0"))`,
      explanation: 'Gemini genereert complexe Google Sheets formules met QUERY functie voor dynamische rapportages'
    },
    {
      id: 'example-5-2',
      title: 'Gemini genereert: BigQuery optimized SQL',
      language: 'sql',
      code: `-- Gemini's geoptimaliseerde BigQuery query voor CLV analyse

WITH customer_metrics AS (
  -- Bereken RFM metrics per klant
  SELECT
    customer_id,
    MAX(order_date) as last_order_date,
    COUNT(DISTINCT order_id) as frequency,
    SUM(order_value) as monetary_value,
    DATE_DIFF(CURRENT_DATE(), MAX(order_date), DAY) as recency_days,
    AVG(order_value) as avg_order_value,
    STDDEV(order_value) as order_value_stddev
  FROM \`project.dataset.orders\`
  WHERE order_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 2 YEAR)
  GROUP BY customer_id
),

customer_segments AS (
  -- Segmenteer klanten op basis van RFM
  SELECT
    customer_id,
    CASE
      WHEN recency_days <= 30 AND frequency >= 10 AND monetary_value >= 1000 THEN 'Champions'
      WHEN recency_days <= 90 AND frequency >= 5 AND monetary_value >= 500 THEN 'Loyal Customers'
      WHEN recency_days <= 90 AND frequency < 5 THEN 'Potential Loyalists'
      WHEN recency_days > 180 AND frequency >= 5 THEN 'At Risk'
      WHEN recency_days > 365 THEN 'Lost'
      ELSE 'Regular'
    END as segment,
    recency_days,
    frequency,
    monetary_value,
    avg_order_value
  FROM customer_metrics
),

clv_calculation AS (
  -- Bereken predicted CLV met statistical model
  SELECT
    cs.*,
    -- Simple CLV formula: (Avg Order Value * Purchase Frequency * Customer Lifespan)
    avg_order_value * 
    (frequency / DATE_DIFF(CURRENT_DATE(), DATE_SUB(CURRENT_DATE(), INTERVAL 2 YEAR), DAY) * 365) * 
    CASE segment
      WHEN 'Champions' THEN 5  -- Expected 5 year lifespan
      WHEN 'Loyal Customers' THEN 3
      WHEN 'Potential Loyalists' THEN 2
      WHEN 'At Risk' THEN 1
      WHEN 'Lost' THEN 0.5
      ELSE 1.5
    END as predicted_clv,
    
    -- Bereken CLV confidence score
    CASE 
      WHEN frequency >= 10 THEN 0.9
      WHEN frequency >= 5 THEN 0.7
      WHEN frequency >= 3 THEN 0.5
      ELSE 0.3
    END as clv_confidence
    
  FROM customer_segments cs
)

-- Final output met aggregaties per segment
SELECT
  segment,
  COUNT(customer_id) as customer_count,
  ROUND(AVG(predicted_clv), 2) as avg_clv,
  ROUND(SUM(predicted_clv), 2) as total_clv,
  ROUND(AVG(monetary_value), 2) as avg_historical_value,
  ROUND(AVG(frequency), 1) as avg_frequency,
  ROUND(AVG(recency_days), 0) as avg_recency_days,
  ROUND(AVG(clv_confidence), 2) as avg_confidence_score
FROM clv_calculation
GROUP BY segment
ORDER BY avg_clv DESC;

-- Voor individual customer deep-dive
-- Uncomment onderstaande query:
/*
SELECT 
  customer_id,
  segment,
  ROUND(predicted_clv, 2) as clv,
  ROUND(monetary_value, 2) as historical_value,
  frequency,
  recency_days,
  ROUND(avg_order_value, 2) as aov
FROM clv_calculation
WHERE segment = 'Champions'
ORDER BY predicted_clv DESC
LIMIT 100;
*/`,
      explanation: 'Gemini optimaliseert BigQuery queries voor performance en levert enterprise-grade SQL met CLV berekeningen'
    }
  ],
  assignments: [
    {
      id: 'assignment-5-1',
      title: 'Google Workspace Data Pipeline',
      description: 'Bouw een geautomatiseerde data pipeline van Google Sheets naar een Looker Studio dashboard met Gemini hulp',
      difficulty: 'medium',
      type: 'project',
      hints: [
        'Start met data structuur in Sheets',
        'Gebruik Gemini voor QUERY formules',
        'Connect Sheets met Looker Studio',
        'Laat Gemini het dashboard design optimaliseren'
      ]
    },
    {
      id: 'assignment-5-2',
      title: 'Multimodal Data Analysis',
      description: 'Upload screenshots van verschillende data bronnen naar Gemini en laat een coherente analyse maken',
      difficulty: 'easy',
      type: 'project',
      hints: [
        'Combineer Excel screenshots met PDF rapporten',
        'Vraag Gemini om verbanden te leggen',
        'Genereer een executive summary',
        'Maak actionable recommendations'
      ]
    }
  ],
  resources: [
    {
      title: 'Google Workspace Learning Center',
      url: 'https://workspace.google.com/training/',
      type: 'tutorials'
    },
    {
      title: 'BigQuery ML Documentation',
      url: 'https://cloud.google.com/bigquery-ml/docs',
      type: 'documentation'
    },
    {
      title: 'Looker Studio Templates',
      url: 'https://lookerstudio.google.com/gallery',
      type: 'templates'
    }
  ]
};