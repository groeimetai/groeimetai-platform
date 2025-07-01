import { Lesson } from '@/lib/data/courses'

export const lesson3_1: Lesson = {
  id: 'lesson-3-1',
  title: 'SEO basics: Keywords en search intent met AI',
  duration: '60 minuten',
  content: `
## SEO Fundamenten met AI-ondersteuning

### Overzicht
In deze les leer je de fundamenten van SEO en hoe AI-tools je kunnen helpen bij het identificeren van de juiste keywords en het begrijpen van search intent. We behandelen moderne AI-tools zoals Surfer SEO, MarketMuse en ChatGPT voor SEO-analyse.

### Wat is Search Intent?

Search intent (zoekintentie) is de reden waarom iemand een zoekopdracht uitvoert. AI kan helpen bij het categoriseren van vier hoofdtypen:

1. **Informational** - Gebruiker zoekt informatie
2. **Navigational** - Gebruiker zoekt specifieke website
3. **Commercial** - Gebruiker onderzoekt producten/diensten
4. **Transactional** - Gebruiker wil iets kopen/doen

### AI Tools voor Keyword Research

#### 1. Surfer SEO Keyword Research
\`\`\`
Workflow voor Surfer SEO:
1. Open Keyword Research tool
2. Voer seed keyword in: [jouw hoofdkeyword]
3. Selecteer locatie: Nederland
4. Analyseer:
   - Search volume
   - Keyword difficulty
   - SERP similarity
   - Content score

Output: Keyword clusters met intent-classificatie
\`\`\`

#### 2. ChatGPT voor Keyword Ideation
\`\`\`
Prompt template:
"Genereer 30 long-tail keywords voor [hoofdkeyword] in het Nederlands.
Categoriseer per search intent:
- Informational (hoe, wat, waarom)
- Commercial (beste, review, vergelijk)
- Transactional (kopen, prijs, korting)

Voor elk keyword:
- Geschat zoekvolume (laag/medium/hoog)
- Competitie niveau
- Content type suggestie"
\`\`\`

#### 3. MarketMuse Topic Modeling
\`\`\`python
# MarketMuse API integratie voorbeeld
import requests

def analyze_topic(keyword, api_key):
    """
    Analyseer topic met MarketMuse voor content gaps
    """
    headers = {'Authorization': f'Bearer {api_key}'}
    
    response = requests.post(
        'https://api.marketmuse.com/v1/topics/analyze',
        headers=headers,
        json={
            'topic': keyword,
            'language': 'nl',
            'intent_analysis': True
        }
    )
    
    return response.json()

# Gebruik: topic_data = analyze_topic("AI marketing tools", "YOUR_API_KEY")
\`\`\`

### Semantic Keyword Clustering met AI

#### Google NLP API voor Entity Extraction
\`\`\`javascript
// Entity extraction voor semantic keywords
async function extractEntities(text) {
    const language = new Language.LanguageServiceClient();
    
    const document = {
        content: text,
        type: 'PLAIN_TEXT',
        language: 'nl'
    };
    
    const [result] = await language.analyzeEntities({document});
    
    return result.entities.map(entity => ({
        name: entity.name,
        type: entity.type,
        salience: entity.salience,
        metadata: entity.metadata
    }));
}
\`\`\`

### SERP Analyse met AI

#### Clearscope Integration
\`\`\`
Clearscope workflow voor content optimization:

1. Nieuwe report aanmaken:
   - Target keyword: [keyword]
   - Competitor URLs: top 10 Google resultaten
   
2. Analyseer rapport:
   - Content Grade (A+ target)
   - Word count recommendations
   - Related terms coverage
   - Heading structure

3. Export terms naar content brief
\`\`\`

### Praktische Toepassing: Keyword Mapping

#### AI-gedreven Keyword Mapping Template
\`\`\`
ChatGPT Prompt:
"Creëer een keyword mapping schema voor [website]:

Voor elke pagina bepaal:
1. Primary keyword (1)
2. Secondary keywords (3-5)
3. LSI keywords (5-10)
4. Search intent match
5. Content type (blog/product/category)
6. Interne link opportunties

Formaat: tabel met kolommen voor elk element"
\`\`\`

### Search Intent Optimization

#### Intent-Based Content Framework
\`\`\`python
def classify_search_intent(keyword, ai_model="gpt-4"):
    """
    Classificeer search intent met AI
    """
    prompt = f"""
    Analyseer de search intent voor: "{keyword}"
    
    Classificeer als:
    - Informational (info zoeken)
    - Navigational (site zoeken)  
    - Commercial (producten vergelijken)
    - Transactional (kopen/actie)
    
    Geef ook:
    - Content type aanbeveling
    - Optimale pagina structuur
    - CTA suggesties
    """
    
    # AI response processing
    return ai_classification
\`\`\`

### Competitor Gap Analysis

#### SEMrush API Integration
\`\`\`javascript
// Competitor keyword gap analysis
const analyzeCompetitorGap = async (domain, competitors) => {
    const api = new SEMrushAPI(API_KEY);
    
    const gaps = await api.keywordGap({
        domains: [domain, ...competitors],
        database: 'nl',
        limit: 100
    });
    
    return gaps.filter(gap => 
        gap.difficulty < 70 && 
        gap.volume > 100
    );
};
\`\`\`

### Opdracht: Complete Keyword Research

**Doel:** Voer een complete keyword research uit voor jouw niche

**Stappen:**
1. Kies een hoofdonderwerp in jouw expertise gebied
2. Gebruik minstens 3 AI-tools voor research:
   - ChatGPT voor ideation (30+ keywords)
   - Surfer/Clearscope voor SERP analyse
   - Google Trends voor seizoenstrends

3. Creëer een keyword mapping document met:
   - 10 primary keywords
   - Search intent classificatie
   - Content type per keyword
   - Geschatte moeilijkheidsgraad

4. Maak een content kalender voor 3 maanden

**Deliverables:**
- Excel/Google Sheets met keyword mapping
- Content kalender met publicatiedata
- Intent-based content briefs (3 stuks)

### Best Practices

1. **Volume vs. Relevantie**: Kies keywords met balans tussen zoekvolume en relevantie
2. **Long-tail Focus**: 70% long-tail keywords voor snellere resultaten
3. **Intent Matching**: Zorg dat content perfect aansluit bij search intent
4. **Semantic Variations**: Gebruik synoniemen en gerelateerde termen
5. **Local Intent**: Vergeet local SEO keywords niet voor lokale businesses

### Tools Overzicht

- **Gratis**: Google Keyword Planner, Google Trends, Answer The Public
- **Freemium**: Ubersuggest, Keywords Everywhere
- **Premium**: Surfer SEO, Clearscope, MarketMuse, SEMrush
- **AI-Native**: Jasper AI, Copy.ai met SEO mode, ChatGPT met plugins

### Volgende Les
In de volgende les duiken we dieper in content optimalisatie en leren we hoe je AI gebruikt om content te creëren die zowel voor gebruikers als zoekmachines geoptimaliseerd is.
`,
  codeExamples: [
    {
      id: 'keyword-clustering',
      title: 'Python Script voor Keyword Clustering',
      language: 'python',
      code: `import pandas as pd
from sklearn.cluster import KMeans
from sentence_transformers import SentenceTransformer
import numpy as np

def cluster_keywords(keywords, n_clusters=5):
    """
    Cluster keywords based on semantic similarity
    """
    # Initialize BERT model for embeddings
    model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
    
    # Generate embeddings
    embeddings = model.encode(keywords)
    
    # Perform clustering
    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    clusters = kmeans.fit_predict(embeddings)
    
    # Create dataframe with results
    df = pd.DataFrame({
        'keyword': keywords,
        'cluster': clusters
    })
    
    # Group by cluster
    clustered = df.groupby('cluster')['keyword'].apply(list).to_dict()
    
    return clustered

# Example usage
keywords = [
    "AI marketing tools",
    "artificial intelligence marketing",
    "machine learning marketing automation",
    "AI content creation",
    "automated marketing software"
]

clusters = cluster_keywords(keywords)
print(clusters)`,
      explanation: 'Dit script gebruikt BERT embeddings om keywords semantisch te clusteren, wat helpt bij het identificeren van content themes.'
    }
  ],
  resources: [
    {
      title: 'Surfer SEO Academy',
      url: 'https://surferseo.com/academy/',
      type: 'Course'
    },
    {
      title: 'Google Search Central',
      url: 'https://developers.google.com/search',
      type: 'Documentation'
    },
    {
      title: 'MarketMuse Content Strategy',
      url: 'https://www.marketmuse.com/resources/',
      type: 'Guide'
    }
  ],
  assignments: [
    {
      id: 'keyword-research-project',
      title: 'Complete Keyword Research Project',
      description: 'Voer een uitgebreide keyword research uit voor een gekozen niche met AI-tools',
      difficulty: 'medium',
      type: 'project',
      hints: [
        'Begin met een breed hoofdkeyword en vernauw geleidelijk',
        'Gebruik meerdere tools voor cross-validatie',
        'Let op seizoensgebonden trends in je analyse'
      ]
    }
  ]
}