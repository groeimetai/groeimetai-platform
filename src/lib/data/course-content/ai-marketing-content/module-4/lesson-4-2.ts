import type { Lesson } from '@/lib/data/courses';

export const lesson4_2: Lesson = {
  id: 'lesson-4-2',
  title: 'Personalisatie op schaal: Segmentatie en targeting',
  duration: '50 min',
  content: `
# Personalisatie op Schaal: Segmentatie en Targeting

Echte 1-op-1 personalisatie was vroeger onmogelijk op grote schaal. Met AI kunnen we nu miljoen klanten een unieke ervaring bieden. Deze les focust op geavanceerde segmentatie en hyper-personalisatie strategieën.

## Overzicht van de les

- **AI-gedreven segmentatie** technieken
- **Predictive analytics** voor targeting
- **Dynamic content** personalisatie
- **Omnichannel** personalisatie
- **Privacy-first** approaches

## 1. Van Segmenten naar Micro-Segments

### Traditionele vs AI Segmentatie
\`\`\`
Traditioneel:
- Demografisch (leeftijd, geslacht, locatie)
- Firmografisch (industrie, grootte, omzet)
- Basis gedrag (gekocht/niet gekocht)

AI-Gedreven:
- Predictive lifetime value clusters
- Behavioral pattern recognition
- Intent-based micro-segments
- Real-time interest graphs
- Psychografische profielen
\`\`\`

### Machine Learning Segmentatie Models

#### K-Means Clustering voor Klantgroepen
\`\`\`python
from sklearn.cluster import KMeans
import pandas as pd

# Customer feature engineering
features = pd.DataFrame({
    'recency': customer_data['days_since_last_purchase'],
    'frequency': customer_data['total_purchases'],
    'monetary': customer_data['total_spent'],
    'engagement': customer_data['email_engagement_score'],
    'product_diversity': customer_data['unique_categories_purchased'],
    'support_tickets': customer_data['support_interactions'],
    'nps_score': customer_data['net_promoter_score']
})

# Optimal clusters bepalen
kmeans = KMeans(n_clusters=8, random_state=42)
customer_data['segment'] = kmeans.fit_predict(features)

# Segment karakteristieken
segment_profiles = {
    0: "Champions - Hoge waarde, zeer engaged",
    1: "Loyal Customers - Regelmatige kopers",
    2: "Potential Loyalists - Recent, goede potentie",
    3: "New Customers - Net binnen, nog onzeker",
    4: "At Risk - Waren actief, nu afnemend",
    5: "Can't Lose Them - Hoge waarde maar inactief",
    6: "Hibernating - Lang inactief",
    7: "Lost - Zeer lang geen activiteit"
}
\`\`\`

## 2. Predictive Personalization

### Next Best Action (NBA) Modellen
\`\`\`javascript
// NBA Recommendation Engine
class NextBestAction {
  constructor(customerProfile) {
    this.profile = customerProfile;
    this.context = this.getCurrentContext();
  }

  async recommendAction() {
    const predictions = await this.mlModel.predict({
      customer_features: this.profile,
      context_features: this.context,
      available_actions: this.getActions()
    });

    return {
      action: predictions.top_action,
      confidence: predictions.confidence,
      expected_value: predictions.estimated_roi,
      personalization: this.generatePersonalization(predictions)
    };
  }

  generatePersonalization(predictions) {
    return {
      channel: predictions.optimal_channel,
      timing: predictions.best_send_time,
      content: {
        tone: predictions.preferred_tone,
        length: predictions.optimal_length,
        visuals: predictions.visual_preference,
        offer: predictions.most_likely_to_convert
      }
    };
  }
}
\`\`\`

### Product Recommendation Engines

#### Collaborative Filtering
\`\`\`python
# User-based collaborative filtering
def recommend_products(user_id, n_recommendations=5):
    # Vind similar users
    similar_users = find_similar_users(user_id, similarity_threshold=0.7)
    
    # Aggregeer hun aankopen
    product_scores = {}
    for similar_user in similar_users:
        for product in get_user_purchases(similar_user):
            if product not in get_user_purchases(user_id):
                product_scores[product] = product_scores.get(product, 0) + 1
    
    # Rank en return top products
    return sorted(product_scores.items(), key=lambda x: x[1], reverse=True)[:n_recommendations]
\`\`\`

#### Content-Based Filtering met NLP
\`\`\`python
from sentence_transformers import SentenceTransformer

# Product embeddings genereren
model = SentenceTransformer('all-MiniLM-L6-v2')

def generate_product_embeddings(products):
    descriptions = [p['name'] + ' ' + p['description'] for p in products]
    return model.encode(descriptions)

def find_similar_products(product_id, embeddings, top_k=10):
    target_embedding = embeddings[product_id]
    similarities = cosine_similarity([target_embedding], embeddings)[0]
    similar_indices = similarities.argsort()[-top_k-1:-1][::-1]
    return similar_indices
\`\`\`

## 3. Dynamic Content Personalization

### AI Content Varianten Generator
\`\`\`
Prompt Template voor Personalisatie:
"Genereer 5 varianten van deze marketing boodschap voor verschillende klantprofielen:

Basis boodschap: [originele tekst]

Profielen:
1. Young Professional (25-35, tech-savvy, tijd is geld)
2. Familie Ouder (35-45, focus op veiligheid/betrouwbaarheid)
3. Senior Decision Maker (45+, ROI-focused, skeptisch)
4. Millennial Entrepreneur (innovatief, duurzaamheid belangrijk)
5. Gen Z Consument (authentiek, social impact, mobile-first)

Voor elk profiel, pas aan:
- Tone of voice
- Value propositions
- Call-to-action
- Voorbeelden/cases"
\`\`\`

### Real-Time Personalization Engine
\`\`\`javascript
// Website personalization
class PersonalizationEngine {
  constructor() {
    this.userProfile = this.loadUserProfile();
    this.contextData = this.gatherContext();
  }

  personalizeContent() {
    return {
      hero: this.selectHeroVariant(),
      products: this.recommendProducts(),
      messaging: this.adaptMessaging(),
      offers: this.selectOffers(),
      navigation: this.prioritizeNavItems()
    };
  }

  selectHeroVariant() {
    const variants = {
      'value_seeker': { 
        headline: 'Bespaar tot 40% op premium producten',
        image: 'sale-banner.jpg',
        cta: 'Bekijk aanbiedingen'
      },
      'quality_focused': {
        headline: 'Ontdek onze award-winning collectie',
        image: 'premium-products.jpg',
        cta: 'Explore premium'
      },
      'trend_follower': {
        headline: 'De nieuwste trends, nu beschikbaar',
        image: 'new-arrivals.jpg',
        cta: 'Shop nieuw'
      }
    };
    
    return variants[this.userProfile.primary_motivation];
  }
}
\`\`\`

## 4. Cross-Channel Orchestration

### Unified Customer Profile
\`\`\`yaml
customer_360_profile:
  identity:
    - email: primary@email.com
    - phone: +31612345678
    - customer_id: CUS123456
    - cookie_ids: [web_cookie_1, app_device_id]
  
  behavioral_data:
    web:
      - page_views: 234
      - avg_session_duration: 4m32s
      - preferred_categories: [electronics, books]
    
    email:
      - open_rate: 0.34
      - click_rate: 0.08
      - best_open_time: "Tuesday 10am"
    
    app:
      - daily_active: true
      - push_enabled: true
      - in_app_purchases: 12
    
    offline:
      - store_visits: 3
      - avg_basket_size: €87
  
  predictive_scores:
    - churn_risk: 0.23
    - ltv_prediction: €1,240
    - next_purchase_probability: 0.67
    - upsell_likelihood: 0.45
\`\`\`

### Omnichannel Journey Mapping
\`\`\`javascript
// Customer journey orchestrator
const journeyOrchestrator = {
  stages: {
    awareness: {
      channels: ['social', 'search', 'display'],
      content: 'educational',
      personalization: 'interest-based'
    },
    consideration: {
      channels: ['email', 'web', 'retargeting'],
      content: 'comparison',
      personalization: 'benefit-focused'
    },
    purchase: {
      channels: ['email', 'sms', 'app'],
      content: 'offer',
      personalization: 'urgency-based'
    },
    retention: {
      channels: ['email', 'app', 'direct mail'],
      content: 'loyalty',
      personalization: 'value-based'
    }
  },
  
  orchestrate(customer) {
    const stage = this.identifyStage(customer);
    const nextBestChannel = this.selectChannel(customer, stage);
    const content = this.generateContent(customer, stage, nextBestChannel);
    
    return {
      action: 'send',
      channel: nextBestChannel,
      content: content,
      timing: this.optimizeTiming(customer, nextBestChannel)
    };
  }
};
\`\`\`

## 5. Privacy-First Personalization

### Zero-Party Data Collection
\`\`\`html
<!-- Progressive profiling form -->
<div class="preference-center">
  <h3>Help ons je beter te helpen</h3>
  
  <form id="zero-party-data">
    <div class="question">
      <label>Waar ben je het meest in geïnteresseerd?</label>
      <select name="primary_interest">
        <option>Nieuwe producten</option>
        <option>Aanbiedingen en kortingen</option>
        <option>Educatieve content</option>
        <option>Exclusieve events</option>
      </select>
    </div>
    
    <div class="question">
      <label>Hoe vaak wil je van ons horen?</label>
      <input type="range" name="frequency" min="1" max="4">
      <span>Weekly → Monthly</span>
    </div>
    
    <div class="benefits">
      <p>Jouw voordelen:</p>
      <ul>
        <li>15% korting op eerste bestelling</li>
        <li>Early access tot sales</li>
        <li>Persoonlijke styling tips</li>
      </ul>
    </div>
  </form>
</div>
\`\`\`

### Contextual Targeting zonder Cookies
\`\`\`python
# Content-based targeting
def contextual_personalization(page_content, user_session):
    # Analyseer pagina content
    page_topics = extract_topics(page_content)
    page_sentiment = analyze_sentiment(page_content)
    
    # Session-based signals (geen persistent tracking)
    session_behavior = {
        'pages_viewed': user_session.page_count,
        'time_on_site': user_session.duration,
        'device_type': user_session.device,
        'referrer': user_session.referrer
    }
    
    # Selecteer relevante content/offers
    recommendations = ml_model.predict(
        page_features=page_topics,
        session_features=session_behavior,
        respect_privacy=True
    )
    
    return recommendations
\`\`\`

## 6. Personalization Metrics & Testing

### KPIs voor Personalisatie Success
\`\`\`python
class PersonalizationMetrics:
    def __init__(self):
        self.baseline_metrics = self.load_baseline()
        self.personalized_metrics = {}
    
    def calculate_uplift(self):
        metrics = {
            'conversion_rate_lift': self.compare('conversion_rate'),
            'aov_increase': self.compare('average_order_value'),
            'engagement_boost': self.compare('engagement_score'),
            'retention_improvement': self.compare('retention_rate'),
            'clv_growth': self.compare('customer_lifetime_value')
        }
        return metrics
    
    def roi_calculation(self):
        revenue_increase = self.personalized_metrics['revenue'] - self.baseline_metrics['revenue']
        personalization_costs = self.calculate_costs()
        
        return {
            'roi': (revenue_increase - personalization_costs) / personalization_costs * 100,
            'payback_period': personalization_costs / (revenue_increase / 12),
            'incremental_revenue': revenue_increase
        }
\`\`\`

### A/B Testing Framework
\`\`\`javascript
// Multivariate testing voor personalisatie
const personalizationTest = {
  name: "Homepage Personalization Impact",
  hypothesis: "AI-driven personalization increases conversion by 25%",
  
  variants: {
    control: {
      description: "Static homepage for all users",
      personalization_level: 0
    },
    variant_a: {
      description: "Basic segmentation (3 segments)",
      personalization_level: 1
    },
    variant_b: {
      description: "Advanced ML personalization",
      personalization_level: 2
    },
    variant_c: {
      description: "Real-time AI personalization",
      personalization_level: 3
    }
  },
  
  success_metrics: [
    "conversion_rate",
    "revenue_per_visitor",
    "bounce_rate",
    "page_value"
  ],
  
  minimum_sample_size: 10000,
  confidence_level: 0.95
};
\`\`\`

## Praktische Opdracht

### Personalisatie Strategy Development
Ontwikkel een complete personalisatie strategie voor een retail e-commerce site:

1. **Segmentatie Model**
   - Definieer 6-8 customer segments
   - Bepaal segmentatie criteria
   - Creëer segment profiles

2. **Personalisatie Matrix**
   - Channel x Segment matrix
   - Content varianten per segment
   - Timing optimization rules

3. **Implementation Roadmap**
   - Quick wins (week 1-2)
   - Medium term (maand 1-3)
   - Long term vision (jaar 1)

4. **Measurement Plan**
   - Success metrics
   - Testing calendar
   - ROI projections

## Tools & Platforms

### Enterprise Personalization
- **Salesforce Marketing Cloud** - Complete personalization suite
- **Adobe Target** - A/B testing en personalisatie
- **Dynamic Yield** - AI-powered personalization
- **Optimizely** - Experimentation platform

### Mid-Market Solutions
- **Segment** - Customer data platform
- **Insider** - Growth management platform
- **VWO** - Testing en personalisatie
- **Bloomreach** - E-commerce personalization

### AI/ML Tools
- **Google Cloud AI** - Custom ML models
- **AWS Personalize** - Recommendation engine
- **Algolia** - AI-powered search
- **Constructor.io** - Product discovery

## Best Practices Checklist

✅ Start met first-party data collection
✅ Implementeer progressive profiling
✅ Test incrementeel (crawl-walk-run)
✅ Monitor data quality continu
✅ Respecteer privacy preferences
✅ Balanceer personalisatie met performance
✅ Document alle personalisatie logica
✅ Train team in ethical AI use

## Volgende Les Preview

In de volgende les behandelen we multi-channel campaign orchestration:
- Campaign automation workflows
- Cross-channel attribution
- Real-time trigger campaigns
- Unified reporting dashboards
`,
  resources: [
    {
      title: 'The Personalization Playbook',
      url: 'https://www.mckinsey.com/capabilities/growth-marketing-and-sales/our-insights/the-value-of-getting-personalization-right-or-wrong-is-multiplying',
      type: 'research'
    },
    {
      title: 'AI Personalization Best Practices',
      url: 'https://www.salesforce.com/resources/articles/personalization/',
      type: 'guide'
    },
    {
      title: 'Privacy-First Marketing Guide',
      url: 'https://iapp.org/resources/article/privacy-first-marketing/',
      type: 'compliance'
    }
  ],
  assignments: [
    {
      id: 'segmentation-strategy',
      title: 'AI Segmentatie & Personalisatie Plan',
      description: 'Ontwikkel een data-gedreven segmentatie model en personalisatie strategie voor een B2C e-commerce bedrijf met 100k+ klanten.',
      difficulty: 'hard',
      type: 'project',
      hints: [
        'Begin met een RFM analyse als basis',
        'Voeg behavioral en psychographic data toe',
        'Denk aan privacy-by-design principes',
        'Test je segmenten met historical data'
      ]
    }
  ]
};