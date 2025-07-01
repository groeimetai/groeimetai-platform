import { Lesson } from '@/lib/data/courses'

export const lesson3_2: Lesson = {
  id: 'lesson-3-2',
  title: 'Content optimalisatie voor zoekmachines',
  duration: '75 minuten',
  content: `
## AI-Gedreven Content Optimalisatie voor SEO

### Overzicht
Content optimalisatie is cruciaal voor SEO-succes. In deze les leer je hoe je AI-tools zoals Surfer SEO, Clearscope, en Frase gebruikt om content te creëren die hoog scoort in zoekmachines terwijl het waardevol blijft voor gebruikers.

### De Content Score Formule

Modern SEO draait om het balanceren van verschillende factoren die AI-tools kunnen analyseren:

1. **Keyword Density** - Natuurlijke keyword integratie
2. **Semantic Coverage** - Gerelateerde termen en entities
3. **Content Structure** - Headers, paragraphs, lists
4. **Readability** - Leesbaarheid en user experience
5. **E-E-A-T Signals** - Expertise, Experience, Authority, Trust

### Content Optimization Workflow

#### Stap 1: SERP Analyse met Surfer SEO
\`\`\`
Surfer SEO Content Editor Setup:
1. Create New Document
2. Target keyword: [jouw keyword]
3. Location: Netherlands
4. Analyze top 10 competitors

Belangrijke metrics:
- Content Score (target: 80+)
- Word count range
- Keyword density
- NLP terms coverage
- Image recommendations
\`\`\`

#### Stap 2: Content Brief met AI
\`\`\`
ChatGPT Prompt voor Content Brief:
"Creëer een gedetailleerde content brief voor het keyword '[keyword]'

Analyseer de top 10 Google resultaten en bepaal:
1. Optimale content lengte (woorden)
2. Must-have H2/H3 headers
3. Belangrijke subtopics om te behandelen
4. Unieke angle/perspectief
5. Content gaps in huidige resultaten
6. Schema markup suggesties

Format: Gestructureerde brief met checkboxes"
\`\`\`

### Real-time Content Optimization

#### Clearscope Integration
\`\`\`javascript
// Real-time content scoring
class ContentOptimizer {
    constructor(apiKey) {
        this.clearscope = new ClearscopeAPI(apiKey);
    }
    
    async analyzeContent(content, targetKeyword) {
        const analysis = await this.clearscope.analyze({
            content: content,
            keyword: targetKeyword,
            language: 'nl'
        });
        
        return {
            grade: analysis.contentGrade,
            missingTerms: analysis.suggestedTerms.filter(t => t.usage === 0),
            overusedTerms: analysis.terms.filter(t => t.density > 3),
            readability: analysis.readabilityScore,
            recommendations: this.generateRecommendations(analysis)
        };
    }
    
    generateRecommendations(analysis) {
        const recs = [];
        
        if (analysis.contentGrade < 'B') {
            recs.push('Voeg meer relevante termen toe');
        }
        
        if (analysis.wordCount < analysis.recommendedMin) {
            recs.push(\`Verleng content tot minimaal \${analysis.recommendedMin} woorden\`);
        }
        
        return recs;
    }
}
\`\`\`

### NLP en Entity Optimization

#### Google's Natural Language API
\`\`\`python
from google.cloud import language_v1
import pandas as pd

def optimize_entities(content, target_entities):
    """
    Analyseer en optimaliseer entity coverage
    """
    client = language_v1.LanguageServiceClient()
    
    # Analyze content
    document = language_v1.Document(
        content=content,
        type_=language_v1.Document.Type.PLAIN_TEXT,
        language="nl"
    )
    
    # Extract entities
    entities = client.analyze_entities(
        request={'document': document}
    ).entities
    
    # Check coverage
    found_entities = [e.name.lower() for e in entities]
    missing = [e for e in target_entities if e.lower() not in found_entities]
    
    return {
        'found': found_entities,
        'missing': missing,
        'coverage_score': len(found_entities) / len(target_entities) * 100
    }
\`\`\`

### Content Structure Optimization

#### Heading Hierarchy met AI
\`\`\`
Frase Outline Builder Process:
1. Import target keyword
2. Analyze SERP headers
3. AI generates optimal outline:
   
   H1: [Main Title - includes keyword]
   
   H2: Wat is [keyword]?
   H2: Voordelen van [keyword]
   H2: Hoe werkt [keyword]?
      H3: Stap 1: [specifiek]
      H3: Stap 2: [specifiek]
   H2: [Keyword] Best Practices
   H2: Veelgestelde vragen over [keyword]
   
4. Customize based on search intent
\`\`\`

### Featured Snippet Optimization

#### AI voor Featured Snippets
\`\`\`python
def optimize_for_featured_snippet(content, snippet_type="paragraph"):
    """
    Optimaliseer content voor featured snippets
    """
    optimizations = {
        "paragraph": {
            "length": "40-60 woorden",
            "format": "Direct antwoord in eerste zin",
            "structure": "Definitie + uitleg"
        },
        "list": {
            "format": "Numbered or bulleted list",
            "items": "5-8 items optimal",
            "structure": "Clear, concise points"
        },
        "table": {
            "format": "Structured data",
            "headers": "Clear column headers",
            "rows": "3-10 rows optimal"
        }
    }
    
    return f"""
    <div class="featured-snippet-target">
        <p class="snippet-{snippet_type}">
            {content}
        </p>
    </div>
    """
\`\`\`

### Schema Markup Generation

#### AI-Powered Schema Creator
\`\`\`javascript
// Schema markup generator
function generateSchema(contentType, data) {
    const schemas = {
        article: {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": data.title,
            "description": data.description,
            "author": {
                "@type": "Person",
                "name": data.author
            },
            "datePublished": data.publishDate,
            "dateModified": data.modifiedDate,
            "image": data.featuredImage,
            "publisher": {
                "@type": "Organization",
                "name": data.siteName,
                "logo": {
                    "@type": "ImageObject",
                    "url": data.logo
                }
            }
        },
        faq: {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": data.questions.map(q => ({
                "@type": "Question",
                "name": q.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": q.answer
                }
            }))
        }
    };
    
    return JSON.stringify(schemas[contentType], null, 2);
}
\`\`\`

### Content Freshness & Updates

#### AI Content Refresh Strategy
\`\`\`
MarketMuse Content Refresh Workflow:

1. Content Inventory Analysis:
   - Identify pages losing rankings
   - Check content decay signals
   - Analyze competitor updates

2. AI-Powered Refresh Plan:
   "Analyseer deze content voor updates:
   [URL of bestaande content]
   
   Identificeer:
   - Verouderde informatie
   - Nieuwe ontwikkelingen in het onderwerp
   - Ontbrekende subtopics (vs. current SERP)
   - Nieuwe keywords om te targeten
   - Structuur verbeteringen"

3. Implementation met Content Score tracking
\`\`\`

### Internal Linking Optimization

#### AI Link Suggestion Engine
\`\`\`python
import networkx as nx
from sentence_transformers import SentenceTransformer

class InternalLinkOptimizer:
    def __init__(self, site_content):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.content_graph = self.build_content_graph(site_content)
    
    def suggest_internal_links(self, current_page, max_links=5):
        """
        Suggest relevant internal links based on content similarity
        """
        current_embedding = self.model.encode(current_page['content'])
        
        similarities = []
        for page_id, page_data in self.content_graph.nodes(data=True):
            if page_id != current_page['id']:
                page_embedding = self.model.encode(page_data['content'])
                similarity = cosine_similarity(
                    [current_embedding], 
                    [page_embedding]
                )[0][0]
                
                similarities.append({
                    'page_id': page_id,
                    'url': page_data['url'],
                    'anchor_text': self.generate_anchor_text(
                        current_page['content'], 
                        page_data['title']
                    ),
                    'relevance_score': similarity
                })
        
        # Sort by relevance and return top suggestions
        return sorted(
            similarities, 
            key=lambda x: x['relevance_score'], 
            reverse=True
        )[:max_links]
\`\`\`

### Praktijkopdracht: Complete Page Optimization

**Project:** Optimaliseer een bestaande pagina voor top 3 ranking

**Deel 1: Audit & Analyse**
1. Kies een pagina die momenteel op positie 4-10 staat
2. Gebruik Surfer SEO voor content audit
3. Analyseer top 3 competitors met Clearscope

**Deel 2: Content Optimization**
1. Herschrijf content met AI-tools:
   - Target content score: 85+
   - Integreer ontbrekende NLP terms
   - Optimaliseer heading structuur
   
2. Technische optimalisatie:
   - Meta title/description met CTR focus
   - Schema markup implementatie
   - Image alt texts optimization

**Deel 3: Monitoring**
- Track rankings daily voor 2 weken
- Monitor content score changes
- A/B test verschillende meta descriptions

### Advanced Optimization Techniques

#### 1. BERT Optimization
\`\`\`python
# BERT-based content relevance checker
from transformers import pipeline

def check_bert_relevance(content, target_query):
    qa_pipeline = pipeline("question-answering")
    
    # Test if content answers the query
    result = qa_pipeline({
        'question': target_query,
        'context': content
    })
    
    return {
        'answers_query': result['score'] > 0.8,
        'confidence': result['score'],
        'relevant_section': result['answer']
    }
\`\`\`

#### 2. Core Web Vitals Content
\`\`\`javascript
// Lazy load optimization for content
const optimizeContentLoading = () => {
    // Implement progressive content loading
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Load heavy content elements
                loadContentSection(entry.target);
            }
        });
    });
    
    document.querySelectorAll('.content-section').forEach(section => {
        observer.observe(section);
    });
};
\`\`\`

### Tools & Resources

**Content Optimization Platforms:**
- Surfer SEO - Real-time optimization
- Clearscope - Content grading
- MarketMuse - Topic modeling
- Frase - AI content briefs
- Page Optimizer Pro - Correlation analysis

**Technical SEO Tools:**
- Screaming Frog - Technical audits
- Schema.org Validator - Schema testing
- Google's Rich Results Test
- Core Web Vitals tools

### Volgende Les
In de volgende les focussen we op competitor analyse met AI en leren we hoe je concurrent content kunt reverse-engineeren voor betere rankings.
`,
  codeExamples: [
    {
      id: 'content-scorer',
      title: 'Real-time Content Scoring System',
      language: 'javascript',
      code: `class AIContentScorer {
    constructor(config) {
        this.targetKeyword = config.keyword;
        this.competitorData = config.competitors;
        this.nlpTerms = config.nlpTerms;
    }
    
    scoreContent(content) {
        const scores = {
            keywordDensity: this.calculateKeywordDensity(content),
            semanticCoverage: this.checkSemanticCoverage(content),
            readability: this.calculateReadability(content),
            structure: this.analyzeStructure(content),
            uniqueness: this.checkUniqueness(content)
        };
        
        // Calculate weighted average
        const weights = {
            keywordDensity: 0.15,
            semanticCoverage: 0.35,
            readability: 0.20,
            structure: 0.20,
            uniqueness: 0.10
        };
        
        const totalScore = Object.keys(scores).reduce((sum, key) => {
            return sum + (scores[key] * weights[key]);
        }, 0);
        
        return {
            totalScore: Math.round(totalScore),
            breakdown: scores,
            recommendations: this.generateRecommendations(scores)
        };
    }
    
    calculateKeywordDensity(content) {
        const words = content.toLowerCase().split(/\\s+/);
        const keywordCount = words.filter(word => 
            word.includes(this.targetKeyword.toLowerCase())
        ).length;
        
        const density = (keywordCount / words.length) * 100;
        
        // Optimal density is 1-2%
        if (density >= 1 && density <= 2) return 100;
        if (density < 1) return density * 100;
        if (density > 2) return Math.max(0, 100 - (density - 2) * 20);
    }
    
    checkSemanticCoverage(content) {
        const contentLower = content.toLowerCase();
        const coveredTerms = this.nlpTerms.filter(term => 
            contentLower.includes(term.toLowerCase())
        );
        
        return (coveredTerms.length / this.nlpTerms.length) * 100;
    }
}`,
      explanation: 'Een real-time content scoring systeem dat verschillende SEO-factoren analyseert en een totaalscore geeft met aanbevelingen.'
    }
  ],
  resources: [
    {
      title: 'Surfer SEO Content Editor Guide',
      url: 'https://surferseo.com/blog/content-editor-guide/',
      type: 'Tutorial'
    },
    {
      title: 'Google BERT Update Guide',
      url: 'https://moz.com/blog/google-bert-update',
      type: 'Article'
    },
    {
      title: 'Schema.org Documentation',
      url: 'https://schema.org/docs/gs.html',
      type: 'Documentation'
    }
  ],
  assignments: [
    {
      id: 'content-optimization',
      title: 'Content Optimization Challenge',
      description: 'Optimaliseer een bestaand artikel voor een competitief keyword met AI-tools',
      difficulty: 'hard',
      type: 'project',
      hints: [
        'Begin met een grondige SERP analyse',
        'Focus op semantic coverage, niet alleen keywords',
        'Test verschillende heading structures',
        'Vergeet schema markup niet'
      ]
    }
  ]
}