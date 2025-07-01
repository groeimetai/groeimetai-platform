import type { Lesson } from '@/lib/data/courses'

export const lesson3_4: Lesson = {
  id: 'lesson-3-4',
  title: 'Advanced Output Control',
  duration: '45 minuten',
  content: `
## Advanced Output Control: Precisie in AI-Gegenereerde Content

### Inleiding

Het beheersen van output control is essentieel voor het creëren van AI-content die perfect aansluit bij jouw specifieke behoeften. In deze les leer je geavanceerde technieken voor het sturen van formaat, structuur, lengte, stijl en taal van AI-output. Van gestructureerde data formats tot complexe multi-language outputs - je krijgt complete controle over hoe AI communiceert.

### Structured Output Formats

#### JSON Output Mastery

JSON is de lingua franca van moderne applicaties. Leer hoe je ChatGPT consistent JSON laat genereren:

**Basis JSON Template:**
\`\`\`json
"Genereer product data in dit exacte JSON format:
{
  "product": {
    "id": "string",
    "name": "string",
    "description": "string (max 200 chars)",
    "price": {
      "amount": number,
      "currency": "EUR"
    },
    "specifications": {
      "dimensions": {
        "length": number,
        "width": number,
        "height": number,
        "unit": "cm"
      },
      "weight": {
        "value": number,
        "unit": "kg"
      }
    },
    "availability": {
      "inStock": boolean,
      "quantity": number,
      "nextRestock": "YYYY-MM-DD"
    },
    "tags": ["string array"],
    "metadata": {
      "createdAt": "ISO 8601 timestamp",
      "lastModified": "ISO 8601 timestamp",
      "version": "semver format"
    }
  }
}

Product info: [beschrijving van product]"
\`\`\`

**Advanced JSON met Validatie:**
\`\`\`
"Creëer een API response volgens deze OpenAPI specificatie:

Schema:
{
  "UserProfile": {
    "type": "object",
    "required": ["id", "email", "profile"],
    "properties": {
      "id": {
        "type": "string",
        "format": "uuid"
      },
      "email": {
        "type": "string",
        "format": "email"
      },
      "profile": {
        "type": "object",
        "properties": {
          "firstName": {"type": "string", "minLength": 1},
          "lastName": {"type": "string", "minLength": 1},
          "dateOfBirth": {"type": "string", "format": "date"},
          "preferences": {
            "type": "object",
            "properties": {
              "language": {"enum": ["nl", "en", "de", "fr"]},
              "timezone": {"type": "string"},
              "notifications": {
                "type": "object",
                "properties": {
                  "email": {"type": "boolean"},
                  "sms": {"type": "boolean"},
                  "push": {"type": "boolean"}
                }
              }
            }
          }
        }
      }
    }
  }
}

Genereer sample data voor 3 verschillende gebruikers met realistische Nederlandse namen."
\`\`\`

#### CSV Format Control

CSV generatie voor data analyse en import/export:

**Standaard CSV:**
\`\`\`
"Genereer een CSV met klantdata:

Headers:
customer_id,company_name,contact_person,email,phone,country,annual_revenue,customer_since,status

Requirements:
- 10 sample records
- Realistische Nederlandse bedrijfsnamen
- Annual revenue in EUR (format: 1000000)
- Customer since in YYYY-MM-DD format
- Status: active/inactive/prospect
- Proper CSV escaping voor company names met komma's
- UTF-8 encoding compatible"
\`\`\`

**Complex CSV met Relaties:**
\`\`\`
"Creëer een multi-table CSV export:

Table 1: orders.csv
order_id,customer_id,order_date,total_amount,status,payment_method

Table 2: order_items.csv
item_id,order_id,product_id,quantity,unit_price,discount_percentage

Table 3: products.csv
product_id,product_name,category,sku,base_price

Requirements:
- Relaties moeten kloppen tussen tables
- 5 orders met elk 2-4 items
- Consistent pricing (base_price * quantity - discount = line total)
- Nederlandse productcategorieën
- Datums in ISO 8601 format"
\`\`\`

#### Markdown Formatting Excellence

Markdown voor documentatie en content management:

**Technical Documentation Template:**
\`\`\`
"Genereer technische documentatie in Markdown:

# [Component Naam]

## Overzicht
[2-3 zinnen beschrijving]

## Installatie
\`\`\`bash
# Installation commando's
\`\`\`

## Configuratie
\`\`\`yaml
# Config file voorbeeld
\`\`\`

## API Referentie

### Method: [methodName]

**Endpoint:** \`/api/v1/[endpoint]\`  
**Method:** \`POST\`  
**Auth Required:** Yes

#### Request
\`\`\`json
{
  // Request body
}
\`\`\`

#### Response
\`\`\`json
{
  // Response body
}
\`\`\`

#### Error Codes
| Code | Description |
|------|-------------|
| 400  | Bad Request |
| 401  | Unauthorized |
| 404  | Not Found |

## Voorbeelden

### Voorbeeld 1: [Use Case]
\`\`\`javascript
// Code voorbeeld
\`\`\`

## Troubleshooting

<details>
<summary>Probleem: [Common Issue]</summary>

**Oplossing:**
1. Stap 1
2. Stap 2
3. Stap 3

</details>

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-01 | Initial release |"
\`\`\`

#### XML voor Enterprise Integratie

XML formatting voor legacy systems en enterprise integraties:

\`\`\`
"Genereer order data in XML volgens dit schema:

<?xml version="1.0" encoding="UTF-8"?>
<Orders xmlns="http://example.com/orders/v1">
  <Order orderID="[UUID]" createdDate="[ISO-8601]">
    <Customer>
      <CustomerID>[ID]</CustomerID>
      <CompanyName><![CDATA[Naam met speciale tekens & symbolen]]></CompanyName>
      <Contact>
        <FirstName>[Naam]</FirstName>
        <LastName>[Achternaam]</LastName>
        <Email>[email]</Email>
      </Contact>
    </Customer>
    <OrderItems>
      <Item lineNumber="1">
        <ProductCode>[SKU]</ProductCode>
        <Description>[Beschrijving]</Description>
        <Quantity unit="pieces">[aantal]</Quantity>
        <UnitPrice currency="EUR">[prijs]</UnitPrice>
        <Tax rate="21">[BTW bedrag]</Tax>
      </Item>
    </OrderItems>
    <Totals>
      <Subtotal>[bedrag]</Subtotal>
      <TaxTotal>[BTW totaal]</TaxTotal>
      <GrandTotal>[eindbedrag]</GrandTotal>
    </Totals>
  </Order>
</Orders>

Genereer 2 complete orders met Nederlandse klantdata."
\`\`\`

### Response Length Control

#### Precision Length Management

**Character-Level Control:**
\`\`\`
"Schrijf een productbeschrijving van EXACT 150 karakters (inclusief spaties):
Product: Ergonomische bureaustoel
Focus: Comfort en gezondheid
Doelgroep: Kantoorwerkers"

"Genereer social media posts:
- Twitter: Max 280 karakters (gebruik 250-270 voor retweet ruimte)
- LinkedIn: 600-700 karakters (optimaal voor engagement)
- Instagram: 2000-2100 karakters (met emoji's en hashtags)"
\`\`\`

**Word Count Precision:**
\`\`\`
"Schrijf een executive summary van PRECIES 250 woorden over [onderwerp].

Structuur:
- Opening: 50 woorden
- Probleem: 50 woorden  
- Oplossing: 100 woorden
- Impact: 30 woorden
- Next steps: 20 woorden

Tel mee en geef word count per sectie."
\`\`\`

**Dynamic Length Adjustment:**
\`\`\`
"Creëer 3 versies van dezelfde boodschap:

Elevator pitch (30 seconden = ~75 woorden):
[Kern boodschap ultra compact]

Management summary (2 minuten = ~300 woorden):
[Uitgebreidere versie met context]

Detailed proposal (10 minuten leestijd = ~1500 woorden):
[Complete uitwerking met alle details]

Behoud dezelfde key messages in alle versies."
\`\`\`

#### Adaptive Content Scaling

\`\`\`python
# Prompt template voor schaalbare content
def create_scalable_content_prompt(topic, lengths):
    prompt = f"""
    Onderwerp: {topic}
    
    Genereer content in deze lengtes:
    
    1. Micro (Tweet-length): {lengths['micro']} karakters
       - Kernboodschap only
       - Call-to-action indien mogelijk
    
    2. Short (Email subject): {lengths['short']} woorden
       - Attention-grabbing
       - Complete gedachte
    
    3. Medium (Blog intro): {lengths['medium']} woorden
       - Hook + context
       - Preview van waarde
    
    4. Long (Full article): {lengths['long']} woorden
       - Complete behandeling
       - Voorbeelden en details
       - Conclusie en CTA
    
    Consistente tone en message across alle lengtes.
    """
    return prompt

# Gebruik
lengths = {
    'micro': 140,
    'short': 10,
    'medium': 150,
    'long': 800
}
prompt = create_scalable_content_prompt("AI in Healthcare", lengths)
\`\`\`

### Style en Tone Aanpassingen

#### Tone Spectrum Control

**Formeel naar Informeel Spectrum:**
\`\`\`
"Herschrijf deze boodschap in 5 verschillende tones:

Origineel: 'Ons bedrijf lanceert een nieuw product voor data-analyse.'

1. Ultra-formeel (juridisch/corporate):
   [Gebruik volledig uitgeschreven zinnen, passieve vorm, vakjargon]

2. Professioneel (B2B):
   [Helder, direct, focus op waarde en ROI]

3. Conversational (B2C):
   [Vriendelijk, toegankelijk, gebruik 'je' vorm]

4. Casual (social media):
   [Emoji's toegestaan, korte zinnen, enthousiast]

5. Gen-Z/Trendy:
   [Internet slang, memes references, zeer informeel]"
\`\`\`

#### Industry-Specific Style Guides

**Financiële Sector:**
\`\`\`
"Schrijf in financial services stijl:

Kenmerken:
- Conservatief en betrouwbaar
- Cijfer-gedreven
- Risk-aware taalgebruik
- Compliance-friendly formuleringen

Vermijd:
- Garanties of beloftes
- Speculatieve taal
- Informele uitdrukkingen

Voorbeeld output voor: 'Investering opportunity communicatie'"
\`\`\`

**Healthcare Communicatie:**
\`\`\`
"Pas healthcare communication standards toe:

Must-haves:
- Empathische toon
- Evidence-based claims only
- Disclaimer waar nodig
- Patiënt-eerste perspectief
- Heldere, jargon-vrije taal

Template voor: Nieuwe behandeling aankondiging"
\`\`\`

**Tech Startup Voice:**
\`\`\`
"Schrijf in moderne tech startup stijl:

Voice karakteristieken:
- Innovatief en forward-thinking
- Data-driven maar menselijk
- Problem-solving focus
- Inclusief en divers
- Actieve vorm, korte zinnen

Creëer: Product launch announcement"
\`\`\`

### Multi-Language Output Management

#### Simultaneous Multi-Language Generation

\`\`\`
"Genereer deze marketing message in 5 talen simultaan:

Core message: [Product launch announcement]

Output format:
{
  "nl": {
    "title": "[Nederlandse titel]",
    "body": "[Nederlandse body text]",
    "cta": "[Nederlandse call-to-action]"
  },
  "en": {
    "title": "[English title]",
    "body": "[English body text]",
    "cta": "[English call-to-action]"
  },
  "de": {
    "title": "[Deutsche Titel]",
    "body": "[Deutscher Haupttext]",
    "cta": "[Deutscher Call-to-Action]"
  },
  "fr": {
    "title": "[Titre français]",
    "body": "[Texte principal français]",
    "cta": "[Appel à l'action français]"
  },
  "es": {
    "title": "[Título español]",
    "body": "[Texto principal español]",
    "cta": "[Llamada a la acción español]"
  }
}

Zorg voor:
- Cultureel appropriate vertalingen (geen letterlijke vertalingen)
- Consistente tone across languages
- Locale-specific formatting (datums, valuta, etc.)"
\`\`\`

#### Cultural Adaptation Framework

\`\`\`
"Pas deze content aan voor verschillende markten:

Original (US): 'Our 24/7 customer service guarantees your satisfaction!'

Adapteer voor:

Nederland:
- Minder superlatieven
- Focus op kwaliteit en betrouwbaarheid
- Directe communicatie

Japan:
- Respectvolle, indirecte taal
- Nadruk op service en bescheidenheid
- Groeps-georiënteerde benadering

Duitsland:
- Technische details en specificaties
- Efficiency en precisie benadrukken
- Formele maar directe toon

Output: Aangepaste versies met culturele notes"
\`\`\`

### Error Handling in Outputs

#### Graceful Degradation Patterns

\`\`\`
"Implementeer error handling in je response:

Bij onvolledige informatie:
{
  "status": "partial_success",
  "message": "Verwerkt met beschikbare data",
  "data": {
    // Wat wel beschikbaar is
  },
  "warnings": [
    "Missende velden: [lijst]",
    "Gebruikte defaults voor: [lijst]"
  ],
  "suggestions": [
    "Voor complete results, gelieve X aan te leveren"
  ]
}

Bij conflicterende requirements:
{
  "status": "conflict_detected",
  "conflicts": [
    {
      "requirement_1": "[beschrijving]",
      "requirement_2": "[beschrijving]",
      "resolution": "[gekozen oplossing]",
      "rationale": "[waarom deze keuze]"
    }
  ],
  "output": {
    // Best effort result
  }
}"
\`\`\`

#### Validation en Feedback Loops

\`\`\`python
# Output validation template
"""
Genereer output met ingebouwde validatie:

1. Primaire output:
   [Je hoofdcontent hier]

2. Zelf-validatie checklist:
   ✓ Voldoet aan length requirement: [Ja/Nee - actual vs requested]
   ✓ Correct format: [Ja/Nee - welke afwijkingen]
   ✓ Tone consistency: [Score 1-10]
   ✓ Completeness: [Percentage complete]

3. Potential improvements:
   - [Suggestie 1]
   - [Suggestie 2]

4. Alternative versions indien gewenst:
   - Optie A: [Korte beschrijving]
   - Optie B: [Korte beschrijving]
"""
\`\`\`

### Consistency Maintenance Techniques

#### Style Memory Systems

\`\`\`
"Creëer een style guide memory:

BRAND VOICE PROFILE:
{
  "brandName": "TechCorp",
  "personality": {
    "traits": ["innovative", "approachable", "expert"],
    "voice": "confident but not arrogant",
    "tone": "professional with personality"
  },
  "language": {
    "preferred_words": ["oplossing", "innovatie", "partnership"],
    "avoid_words": ["probleem", "issue", "failure"],
    "sentence_structure": "short_and_punchy",
    "pronoun_use": "we/ons voor bedrijf, je/jouw voor klant"
  },
  "formatting": {
    "headers": "sentence_case",
    "lists": "bullet_points_preferred",
    "emphasis": "bold_not_caps"
  }
}

Gebruik dit profiel voor alle content generatie."
\`\`\`

#### Version Control for Outputs

\`\`\`
"Implementeer output versioning:

Version 1.0 (Original):
[Basis content]

Version 1.1 (Marketing feedback):
- Toegevoegd: [lijst van aanpassingen]
- Verwijderd: [wat is weggehaald]
- Gewijzigd: [wat is aangepast]
[Nieuwe versie]

Version 2.0 (Major revision):
- Nieuwe structuur
- Andere tone
- Uitgebreide examples
[Complete nieuwe versie]

Change log:
- v1.0: Initial draft
- v1.1: Marketing optimizations  
- v2.0: Complete rewrite voor nieuwe doelgroep"
\`\`\`

### Advanced Output Patterns

#### Conditional Output Generation

\`\`\`
"Genereer conditionele output based op parameters:

IF audience = "technical":
  - Include code examples
  - Use technical terminology
  - Deep dive into implementation
  - Add performance metrics

ELSEIF audience = "executive":
  - Focus on business impact
  - Use visualisation descriptions
  - Include ROI calculations
  - High-level overview only

ELSEIF audience = "end-user":
  - Step-by-step instructions
  - Screenshots descriptions
  - Common problems/solutions
  - Non-technical language

Output voor audience = [parameter]"
\`\`\`

#### Progressive Enhancement Outputs

\`\`\`
"Creëer progressive enhancement content:

LEVEL 1 - Core Message (iedereen):
[Basis informatie die iedereen moet weten]

LEVEL 2 - Enhanced (geïnteresseerden):
[Level 1 + extra context en voorbeelden]

LEVEL 3 - Deep Dive (professionals):
[Level 1 + 2 + technische details, edge cases]

LEVEL 4 - Expert (specialisten):
[Alles + geavanceerde topics, research links]

Markeer duidelijk waar elk level begint."
\`\`\`

### Praktische Implementatie Templates

#### Complete Output Control Systeem

\`\`\`python
class OutputController:
    def __init__(self):
        self.format = "json"
        self.language = "nl"
        self.tone = "professional"
        self.max_length = 1000
        self.style_guide = {}
    
    def generate_prompt(self, content_request):
        prompt = f"""
        Genereer output volgens deze specificaties:
        
        FORMAT: {self.format}
        TAAL: {self.language}
        TONE: {self.tone}
        MAX LENGTH: {self.max_length} karakters
        
        Content verzoek: {content_request}
        
        Style guide rules:
        {json.dumps(self.style_guide, indent=2)}
        
        Output moet voldoen aan:
        1. Exact format zonder afwijkingen
        2. Taal en culturele conventies van {self.language}
        3. Consistente {self.tone} tone throughout
        4. Binnen length limit blijven
        5. Style guide strikt volgen
        
        Bij conflicts: Prioriteit format > length > tone > style
        """
        return prompt

# Gebruik voorbeeld
controller = OutputController()
controller.format = "markdown"
controller.language = "en"
controller.tone = "casual"
controller.max_length = 500

prompt = controller.generate_prompt("Product beschrijving voor smartphone")
\`\`\`

### Best Practices Checklist

#### Voor Structured Output:
- [ ] Expliciet format voorbeeld geven
- [ ] Edge cases specificeren
- [ ] Escape characters uitleggen
- [ ] Encoding requirements aangeven
- [ ] Validatie criteria meegeven

#### Voor Length Control:
- [ ] Exacte getallen gebruiken
- [ ] Eenheid specificeren (woorden/karakters/zinnen)
- [ ] Buffer inbouwen voor variatie
- [ ] Prioriteiten aangeven bij space issues
- [ ] Truncation strategie definiëren

#### Voor Style Control:
- [ ] Concrete voorbeelden geven
- [ ] Do's en don'ts lijsten
- [ ] Industry standards refereren
- [ ] Consistentie markers gebruiken
- [ ] Feedback loops inbouwen

#### Voor Multi-Language:
- [ ] Locale specificeren (nl-NL vs nl-BE)
- [ ] Culturele adaptatie vragen
- [ ] Format conventies meegeven
- [ ] Character encoding specificeren
- [ ] Fallback taal definiëren

### Conclusie

Advanced output control geeft je de macht om AI-gegenereerde content exact te laten aansluiten bij jouw requirements. Door het beheersen van format specifications, length control, style management, en multi-language capabilities kun je AI inzetten voor complexe, professionele toepassingen.

De technieken in deze les - van structured data formats tot cultural adaptation - maken het mogelijk om AI te integreren in enterprise workflows, automated systems, en multi-channel content strategies. Begin met het implementeren van basis output controls en bouw geleidelijk meer sophistication in naarmate je use cases complexer worden.

Met deze foundation ben je klaar om AI-generated content naadloos te integreren in elk professioneel systeem of workflow, met volledige controle over elk aspect van de output.
  `,
  resources: [
    {
      title: 'Output Format Templates Library',
      url: 'https://example.com/output-templates',
      type: 'template'
    },
    {
      title: 'Style Guide Generator',
      url: 'https://example.com/style-generator',
      type: 'tool'
    },
    {
      title: 'Multi-Language Best Practices',
      url: 'https://example.com/multilingual-guide',
      type: 'guide'
    }
  ],
  assignments: [
    {
      id: 'create-output-system',
      title: 'Bouw een Complete Output Control System',
      description: 'Ontwikkel een output control systeem voor jouw use case. Include: Format templates voor 3 output types, Length control voor 5 verschillende platforms, Style guide voor je brand voice, Error handling protocollen.',
      difficulty: 'medium',
      type: 'project'
    },
    {
      id: 'multi-format-converter',
      title: 'Multi-Format Content Converter',
      description: 'Creëer een systeem dat content kan converteren tussen JSON, CSV, XML, en Markdown met behoud van data integriteit en betekenis.',
      difficulty: 'hard',
      type: 'technical'
    },
    {
      id: 'style-consistency-test',
      title: 'Style Consistency Challenge',
      description: 'Genereer 10 verschillende content pieces in exact dezelfde stijl en tone. Meet consistency met specifieke metrics.',
      difficulty: 'medium',
      type: 'experiment'
    }
  ]
};