import { Lesson } from '@/lib/data/courses'

export const lesson3_4: Lesson = {
  id: 'lesson-3-4',
  title: 'Local SEO en voice search optimalisatie',
  duration: '90 minuten',
  content: `
## AI-Powered Local SEO & Voice Search Optimization

### Overzicht
Local SEO en voice search zijn twee van de snelst groeiende gebieden in search. Met meer dan 50% van alle zoekopdrachten nu voice-based en 46% met local intent, is optimalisatie hiervoor cruciaal. In deze les leer je AI-tools gebruiken voor dominantie in local search en voice results.

### De Local SEO Revolution

Modern local SEO gaat veel verder dan alleen Google My Business:

1. **Google Business Profile** - Het fundament
2. **Local Citations** - NAP consistency met AI
3. **Review Management** - Sentiment analysis en response automation
4. **Local Content** - Hyper-local targeting
5. **Voice Search Optimization** - Conversational SEO

### Google Business Profile Optimization met AI

#### AI-Powered GMB Content Generator
\`\`\`python
import openai
import googlemaps

class GMBOptimizer:
    def __init__(self, api_keys):
        self.gmaps = googlemaps.Client(key=api_keys['google_maps'])
        self.openai = openai.OpenAI(api_key=api_keys['openai'])
        
    def optimize_business_description(self, business_info):
        """
        Generate optimized GMB description with local keywords
        """
        # Get local insights
        local_data = self.get_local_insights(
            business_info['location'],
            business_info['category']
        )
        
        prompt = f"""
        Creëer een geoptimaliseerde Google Business Profile beschrijving:
        
        Bedrijf: {business_info['name']}
        Type: {business_info['category']}
        Locatie: {business_info['city']}, {business_info['neighborhood']}
        USPs: {business_info['unique_points']}
        
        Local insights:
        - Populaire zoektermen: {local_data['search_terms']}
        - Lokale landmarks: {local_data['landmarks']}
        - Demografie: {local_data['demographics']}
        
        Requirements:
        - Max 750 karakters
        - Natuurlijke integratie local keywords
        - Call-to-action
        - Unieke value proposition
        - Voice search friendly
        """
        
        response = self.openai.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
        
        return response.choices[0].message.content
    
    def generate_posts_calendar(self, business_info, months=3):
        """
        Create GMB posts calendar with local events
        """
        local_events = self.get_local_events(
            business_info['location'], 
            months
        )
        
        prompt = f"""
        Maak een {months} maanden GMB posts calendar:
        
        Business: {business_info['name']}
        Industry: {business_info['category']}
        
        Lokale events: {local_events}
        
        Voor elke week:
        - Post type (offer/event/product/update)
        - Title (max 58 chars)
        - Description (max 1500 chars)
        - CTA button tekst
        - Relevant voor voice search
        - Local keywords integratie
        """
        
        return self.openai.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
\`\`\`

### Local Citation Building met AI

#### Automated Citation Audit & Builder
\`\`\`javascript
class LocalCitationManager {
    constructor(config) {
        this.business = config.businessInfo;
        this.apis = config.apis;
    }
    
    async auditCitations() {
        // Core citation sites for Netherlands
        const citationSites = [
            'google.com',
            'bing.com',
            'apple.com/maps',
            'facebook.com',
            'yelp.com',
            'tripadvisor.com',
            'goudengids.nl',
            'detelefoongids.nl',
            'opendi.nl',
            'tupalo.com',
            'cylex.nl'
        ];
        
        const results = await Promise.all(
            citationSites.map(site => this.checkCitation(site))
        );
        
        return this.analyzeConsistency(results);
    }
    
    async checkCitation(site) {
        // Search for business on citation site
        const searchResults = await this.searchBusiness(site);
        
        if (searchResults.found) {
            return {
                site: site,
                found: true,
                napScore: this.calculateNAPScore(searchResults.listing),
                issues: this.identifyIssues(searchResults.listing)
            };
        }
        
        return {
            site: site,
            found: false,
            action: 'Create new listing'
        };
    }
    
    calculateNAPScore(listing) {
        const correct = {
            name: this.business.name,
            address: this.business.address,
            phone: this.business.phone,
            website: this.business.website
        };
        
        let score = 0;
        
        // Exact match checking with fuzzy logic
        if (this.fuzzyMatch(listing.name, correct.name) > 0.9) score += 25;
        if (this.fuzzyMatch(listing.address, correct.address) > 0.9) score += 25;
        if (this.normalizePhone(listing.phone) === this.normalizePhone(correct.phone)) score += 25;
        if (listing.website?.toLowerCase() === correct.website?.toLowerCase()) score += 25;
        
        return score;
    }
}
\`\`\`

### Voice Search Optimization Strategy

#### Conversational Keyword Research
\`\`\`python
def voice_search_keyword_research(business_type, location):
    """
    Generate voice search optimized keywords
    """
    prompt = f"""
    Genereer 50 voice search queries voor:
    Business type: {business_type}
    Locatie: {location}
    
    Categorieën:
    1. "Near me" searches (10x)
       - "beste {business_type} bij mij in de buurt"
       
    2. Question-based (15x)
       - "waar kan ik..."
       - "hoe laat is..."
       - "wat kost..."
       
    3. Conversational long-tail (15x)
       - Natuurlijke spreektaal
       
    4. Local intent (10x)
       - Met specifieke wijken/straten
    
    Voor elke query geef:
    - De exacte voice query
    - Optimale content type (FAQ/Blog/Service page)
    - Schema markup suggestie
    """
    
    response = ai_generate(prompt)
    
    return parse_voice_keywords(response)

def optimize_for_voice(content, voice_keywords):
    """
    Optimize existing content for voice search
    """
    optimizations = {
        'faq_sections': generate_faq_schema(content, voice_keywords),
        'conversational_headers': create_question_headers(voice_keywords),
        'natural_language': rewrite_conversational(content),
        'local_modifiers': add_local_context(content),
        'quick_answers': create_featured_snippets(content, voice_keywords)
    }
    
    return optimizations
\`\`\`

### Review Management met AI

#### Sentiment Analysis & Auto-Response
\`\`\`javascript
class AIReviewManager {
    constructor(config) {
        this.sentiment = new SentimentAnalyzer();
        this.responseGen = new ResponseGenerator(config);
    }
    
    async processReview(review) {
        // Analyze sentiment and extract insights
        const analysis = await this.analyzeReview(review);
        
        // Generate appropriate response
        const response = await this.generateResponse(analysis);
        
        // Flag for manual review if needed
        if (analysis.requiresAttention) {
            await this.flagForReview(review, analysis);
        }
        
        return {
            analysis,
            suggestedResponse: response,
            autoRespond: analysis.sentiment.score > 0.3
        };
    }
    
    async analyzeReview(review) {
        const sentiment = await this.sentiment.analyze(review.text);
        
        const insights = {
            sentiment: sentiment,
            topics: await this.extractTopics(review.text),
            emotions: await this.detectEmotions(review.text),
            keywords: await this.extractKeywords(review.text),
            actionableInsights: await this.findActionables(review.text)
        };
        
        return {
            ...insights,
            requiresAttention: sentiment.score < -0.5 || 
                               insights.emotions.includes('anger') ||
                               review.rating <= 2
        };
    }
    
    async generateResponse(analysis) {
        const prompt = \`
        Generate review response:
        
        Review sentiment: \${analysis.sentiment.label} (\${analysis.sentiment.score})
        Topics mentioned: \${analysis.topics.join(', ')}
        Emotions: \${analysis.emotions.join(', ')}
        Rating: \${analysis.rating}/5
        
        Requirements:
        - Personalized (gebruik reviewer naam)
        - Address specific points
        - Professional maar warm
        - Include local touch
        - 50-150 words
        - Als negatief: empathie + oplossing
        - Als positief: dankbaarheid + invite back
        \`;
        
        return await this.responseGen.generate(prompt);
    }
}
\`\`\`

### Local Content Strategy

#### Hyper-Local Content Generator
\`\`\`python
class LocalContentStrategy:
    def __init__(self, business_data):
        self.business = business_data
        self.local_api = LocalDataAPI()
        
    def generate_local_content_calendar(self):
        """
        Create hyper-local content calendar
        """
        # Gather local data
        local_events = self.local_api.get_events(self.business.city)
        local_news = self.local_api.get_news(self.business.city)
        seasonal_trends = self.get_seasonal_trends()
        neighborhoods = self.get_neighborhoods()
        
        content_ideas = []
        
        # Event-based content
        for event in local_events:
            content_ideas.append({
                'title': f"{self.business.service} Tips voor {event.name}",
                'type': 'blog',
                'local_keywords': [event.location, event.type],
                'publish_date': event.date - timedelta(days=14)
            })
        
        # Neighborhood guides
        for neighborhood in neighborhoods:
            content_ideas.append({
                'title': f"Gids voor {self.business.service} in {neighborhood}",
                'type': 'location_page',
                'local_keywords': self.get_neighborhood_keywords(neighborhood),
                'schema': 'LocalBusiness + AreaServed'
            })
        
        return self.prioritize_content(content_ideas)
    
    def create_location_page(self, neighborhood):
        """
        Generate neighborhood-specific landing page
        """
        local_data = self.gather_neighborhood_data(neighborhood)
        
        prompt = f"""
        Creëer location page content voor:
        Business: {self.business.name}
        Service: {self.business.service}
        Wijk: {neighborhood}
        
        Lokale data:
        - Populatie: {local_data['population']}
        - Kenmerken: {local_data['characteristics']}
        - Landmarks: {local_data['landmarks']}
        - Veel gezochte diensten: {local_data['search_trends']}
        
        Include:
        1. H1 met neighborhood + service
        2. Introductie met local references
        3. Waarom kiezen voor [business] in [wijk]
        4. Specifieke diensten voor deze wijk
        5. Klantenverhalen uit de wijk
        6. Route/bereikbaarheid vanuit wijk
        7. FAQ voor wijk-specifieke vragen
        
        Optimaliseer voor:
        - "[service] [wijk]" searches
        - Voice search queries
        - Mobile users
        """
        
        return self.ai_generate(prompt)
\`\`\`

### Schema Markup voor Local SEO

#### Advanced Local Schema Generator
\`\`\`javascript
function generateLocalBusinessSchema(businessData) {
    const schema = {
        "@context": "https://schema.org",
        "@type": businessData.type || "LocalBusiness",
        "@id": businessData.website + "#business",
        "name": businessData.name,
        "image": businessData.images,
        "logo": businessData.logo,
        "telephone": businessData.phone,
        "email": businessData.email,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": businessData.address.street,
            "addressLocality": businessData.address.city,
            "postalCode": businessData.address.zip,
            "addressCountry": "NL"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": businessData.coordinates.lat,
            "longitude": businessData.coordinates.lng
        },
        "url": businessData.website,
        "sameAs": businessData.socialProfiles,
        "openingHoursSpecification": generateOpeningHours(businessData.hours),
        "priceRange": businessData.priceRange,
        "servesCuisine": businessData.cuisine, // for restaurants
        "hasMenu": businessData.menuUrl, // for restaurants
        "acceptsReservations": businessData.reservations,
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": businessData.rating.average,
            "reviewCount": businessData.rating.count
        },
        "review": businessData.reviews.map(review => ({
            "@type": "Review",
            "reviewRating": {
                "@type": "Rating",
                "ratingValue": review.rating
            },
            "author": {
                "@type": "Person",
                "name": review.author
            },
            "datePublished": review.date,
            "reviewBody": review.text
        })),
        "areaServed": businessData.serviceAreas.map(area => ({
            "@type": "City",
            "name": area
        }))
    };
    
    // Add FAQ schema for voice search
    if (businessData.faqs) {
        schema.mainEntity = {
            "@type": "FAQPage",
            "mainEntity": businessData.faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                }
            }))
        };
    }
    
    return JSON.stringify(schema, null, 2);
}
\`\`\`

### Voice Search Content Optimization

#### FAQ Generator voor Voice Search
\`\`\`python
def generate_voice_optimized_faqs(business_info, search_queries):
    """
    Create FAQs optimized for voice search results
    """
    prompt = f"""
    Genereer 20 FAQ's geoptimaliseerd voor voice search:
    
    Business: {business_info['name']}
    Service: {business_info['service']}
    Locatie: {business_info['location']}
    
    Top voice searches:
    {json.dumps(search_queries, indent=2)}
    
    Voor elke FAQ:
    1. Natural language question (zoals mensen echt vragen)
    2. Beknopt antwoord (40-60 woorden voor featured snippet)
    3. Uitgebreid antwoord met:
       - Lokale context
       - Specifieke info (prijzen, tijden, locaties)
       - Call-to-action
    
    Focus op:
    - "Hoe laat..." vragen
    - "Waar kan ik..." vragen  
    - "Wat kost..." vragen
    - "Is er ... bij mij in de buurt"
    - Procedure/proces vragen
    """
    
    faqs = ai_generate(prompt)
    
    # Format for schema markup
    return format_faqs_for_schema(faqs)
\`\`\`

### Local Link Building

#### Local Link Opportunity Finder
\`\`\`javascript
async function findLocalLinkOpportunities(businessInfo) {
    const opportunities = [];
    
    // Local news sites
    const localMedia = await searchLocalMedia(businessInfo.city);
    opportunities.push(...localMedia.map(site => ({
        type: 'media',
        site: site,
        strategy: 'Press release / local story pitch'
    })));
    
    // Local business directories
    const directories = await findLocalDirectories(businessInfo.city);
    opportunities.push(...directories.map(dir => ({
        type: 'directory',
        site: dir,
        strategy: 'Submit business listing'
    })));
    
    // Local organizations
    const organizations = await findLocalOrgs(businessInfo.industry, businessInfo.city);
    opportunities.push(...organizations.map(org => ({
        type: 'organization',
        site: org,
        strategy: 'Membership / sponsorship'
    })));
    
    // Complementary businesses
    const partners = await findComplementaryBusinesses(businessInfo);
    opportunities.push(...partners.map(partner => ({
        type: 'partnership',
        site: partner,
        strategy: 'Cross-promotion / guest content'
    })));
    
    // Score and prioritize
    return prioritizeLinkOpportunities(opportunities);
}
\`\`\`

### Praktijkopdracht: Complete Local SEO Campaign

**Project:** Implementeer complete local SEO strategie met voice optimization

**Week 1: Foundation**
1. Google Business Profile optimization:
   - Complete profile met AI-generated description
   - 12 weeks aan GMB posts scheduled
   - Review response templates

2. Citation audit & cleanup:
   - Check 20+ citation sites
   - Fix NAP inconsistencies
   - Submit to missing directories

**Week 2: Content Creation**
1. Create 5 location pages:
   - Target verschillende wijken/steden
   - Voice search optimized FAQ sections
   - Local schema markup

2. Local content calendar:
   - 3 maanden aan local content ideas
   - Event-based content
   - Seasonal optimization

**Week 3: Voice Search Optimization**
1. Voice keyword research:
   - 100+ conversational queries
   - FAQ content voor top queries
   - Optimize existing content

2. Technical implementation:
   - Schema markup voor alle pages
   - Featured snippet optimization
   - Mobile speed optimization

**Week 4: Monitoring & Refinement**
1. Setup tracking:
   - Local rank tracking
   - GMB insights monitoring
   - Voice search appearance tracking

2. Analyze & adjust:
   - Review performance data
   - A/B test GMB posts
   - Refine content based on voice queries

**Deliverables:**
- Fully optimized GMB profile
- 5 location-specific landing pages
- 50+ voice-optimized FAQs
- Complete local citation profile
- 3-month content calendar
- Performance tracking dashboard

### Tools & Resources

**Local SEO Tools:**
- BrightLocal - Citation tracking
- Whitespark - Local citation finder
- GMB Everywhere - Chrome extension
- LocalFalcon - Accurate local rankings
- ReviewTrackers - Review management

**Voice Search Tools:**
- Answer The Public - Question research
- AlsoAsked.com - Related questions
- Schema markup generators
- Google's Structured Data Testing Tool

**AI Enhancement:**
- ChatGPT/Claude for content
- Local data APIs
- Review sentiment analysis
- Automated response systems

### Belangrijke Takeaways

1. **Consistency is Key**: NAP consistency across all platforms
2. **Reviews Matter**: Actief review management verhoogt rankings
3. **Voice = Conversational**: Schrijf zoals mensen praten
4. **Local Content Wins**: Hyper-local content domineert
5. **Schema Everything**: Structured data voor voice results

### Conclusie Module 3
Je hebt nu een complete toolkit voor AI-powered SEO. Van keyword research tot local optimization, je kunt AI inzetten voor betere rankings en meer organisch verkeer. In de volgende module gaan we dieper in op sociale media marketing met AI.
`,
  codeExamples: [
    {
      id: 'voice-search-optimizer',
      title: 'Complete Voice Search Optimization System',
      language: 'python',
      code: `import speech_recognition as sr
from transformers import pipeline
import json

class VoiceSearchOptimizer:
    def __init__(self):
        self.nlp = pipeline("question-answering")
        self.recognizer = sr.Recognizer()
        
    def analyze_voice_query(self, audio_file):
        """
        Analyze voice search query and optimize content
        """
        # Convert speech to text
        with sr.AudioFile(audio_file) as source:
            audio = self.recognizer.record(source)
            query = self.recognizer.recognize_google(audio, language="nl-NL")
        
        # Analyze query intent
        intent = self.classify_intent(query)
        
        # Generate optimized response
        response = self.generate_voice_response(query, intent)
        
        return {
            'query': query,
            'intent': intent,
            'optimized_response': response,
            'schema_markup': self.generate_schema(query, response),
            'content_recommendations': self.suggest_content(query, intent)
        }
    
    def classify_intent(self, query):
        """
        Classify voice search intent
        """
        intents = {
            'location': ['waar', 'dichtbij', 'in de buurt', 'bij mij'],
            'hours': ['wanneer open', 'hoe laat', 'geopend'],
            'price': ['wat kost', 'prijs', 'hoeveel'],
            'how_to': ['hoe kan ik', 'hoe moet', 'hoe werkt'],
            'comparison': ['beste', 'verschil tussen', 'of'],
            'availability': ['hebben jullie', 'is er', 'verkopen jullie']
        }
        
        query_lower = query.lower()
        detected_intents = []
        
        for intent, keywords in intents.items():
            if any(keyword in query_lower for keyword in keywords):
                detected_intents.append(intent)
        
        return detected_intents or ['general']
    
    def generate_voice_response(self, query, intent):
        """
        Generate voice-optimized response
        """
        response_templates = {
            'location': "Wij zijn gevestigd op {address}. U vindt ons {directions}. We zijn {distance} van uw locatie.",
            'hours': "We zijn geopend {hours}. {special_hours}",
            'price': "De prijs voor {service} is {price}. {price_factors}",
            'how_to': "Om {action} te doen: {steps}. {additional_help}"
        }
        
        # Generate response based on intent
        if 'location' in intent:
            return self.generate_location_response(query)
        elif 'hours' in intent:
            return self.generate_hours_response(query)
        elif 'price' in intent:
            return self.generate_price_response(query)
        else:
            return self.generate_general_response(query)
    
    def generate_schema(self, query, response):
        """
        Generate schema markup for voice search
        """
        schema = {
            "@context": "https://schema.org",
            "@type": "Question",
            "name": query,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": response
            }
        }
        
        return json.dumps(schema, indent=2, ensure_ascii=False)
    
    def suggest_content(self, query, intent):
        """
        Suggest content optimizations for voice search
        """
        suggestions = []
        
        # Analyze query structure
        if len(query.split()) > 7:  # Long-tail query
            suggestions.append({
                'type': 'faq',
                'content': f'Add FAQ: "{query}"',
                'priority': 'high'
            })
        
        # Intent-based suggestions
        for intent_type in intent:
            if intent_type == 'location':
                suggestions.extend([
                    {'type': 'schema', 'content': 'Add LocalBusiness schema'},
                    {'type': 'content', 'content': 'Create location-specific landing pages'}
                ])
            elif intent_type == 'price':
                suggestions.extend([
                    {'type': 'schema', 'content': 'Add PriceSpecification schema'},
                    {'type': 'content', 'content': 'Create clear pricing table'}
                ])
        
        return suggestions

# Usage example
optimizer = VoiceSearchOptimizer()
result = optimizer.analyze_voice_query("voice_search_recording.wav")
print(json.dumps(result, indent=2, ensure_ascii=False))`,
      explanation: 'Een compleet voice search optimization systeem dat spraak analyseert, intent bepaalt, en content optimaliseert voor voice search results.'
    }
  ],
  resources: [
    {
      title: 'Google Business Profile Help',
      url: 'https://support.google.com/business',
      type: 'Documentation'
    },
    {
      title: 'BrightLocal Local SEO Tools',
      url: 'https://www.brightlocal.com/',
      type: 'Tool'
    },
    {
      title: 'Voice Search Optimization Guide',
      url: 'https://moz.com/blog/voice-search-optimization',
      type: 'Guide'
    }
  ],
  assignments: [
    {
      id: 'local-seo-campaign',
      title: 'Complete Local SEO & Voice Search Campaign',
      description: 'Implementeer een complete local SEO strategie met voice search optimization voor een lokaal bedrijf',
      difficulty: 'hard',
      type: 'project',
      hints: [
        'Begin met een grondige GMB audit',
        'Focus op NAP consistency across citations',
        'Creëer location-specific content',
        'Optimaliseer voor conversational queries',
        'Implementeer uitgebreide schema markup'
      ]
    }
  ]
}