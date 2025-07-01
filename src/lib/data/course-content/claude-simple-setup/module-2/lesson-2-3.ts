import type { Lesson } from '@/lib/data/courses';

export const lesson2_3: Lesson = {
  id: 'lesson-2-3',
  title: 'API configuratie optimalisatie',
  duration: '35 min',
  content: `
# API Configuratie Optimalisatie

Leer hoe je Claude's API parameters optimaal configureert voor verschillende use cases. Deze les behandelt alle belangrijke configuratie-opties met praktische templates die je direct kunt gebruiken.

## 1. Temperature en Top_p Settings

### Temperature: Creativiteit vs Consistentie

Temperature bepaalt hoe "creatief" of "willekeurig" Claude's antwoorden zijn.

**Range**: 0.0 tot 1.0
- **0.0**: Maximaal deterministisch (altijd dezelfde output)
- **0.3-0.5**: Gebalanceerd (licht gevarieerd maar consistent)
- **0.7-0.9**: Creatief (meer variatie en originaliteit)
- **1.0**: Maximaal willekeurig

### Use Case Templates

#### Template 1: Technische Documentatie
\`\`\`python
# Consistente, accurate technische output
config_technical = {
    "model": "claude-3-5-sonnet-20241022",
    "temperature": 0.1,
    "max_tokens": 2000,
    "system": "Je bent een technische documentatie specialist. Genereer accurate, gestructureerde documentatie."
}
\`\`\`

#### Template 2: Creatief Schrijven
\`\`\`python
# Gevarieerde, originele content
config_creative = {
    "model": "claude-3-5-sonnet-20241022",
    "temperature": 0.8,
    "max_tokens": 3000,
    "system": "Je bent een creatieve schrijver. Genereer originele, boeiende content met unieke perspectieven."
}
\`\`\`

#### Template 3: Customer Support
\`\`\`python
# Behulpzaam maar consistent
config_support = {
    "model": "claude-3-5-sonnet-20241022",
    "temperature": 0.3,
    "max_tokens": 500,
    "system": "Je bent een vriendelijke customer support agent. Geef heldere, behulpzame antwoorden."
}
\`\`\`

### Top_p: Nucleus Sampling

Top_p is een alternatief voor temperature dat de waarschijnlijkheidsmassa beperkt.

**Range**: 0.0 tot 1.0
- **0.1**: Alleen meest waarschijnlijke tokens (zeer consistent)
- **0.5**: Top 50% waarschijnlijke tokens
- **0.9**: Top 90% waarschijnlijke tokens (gevarieerd)
- **1.0**: Alle mogelijke tokens

**Best Practice**: Gebruik óf temperature óf top_p, niet beide tegelijk.

### Vergelijking Temperature vs Top_p
\`\`\`python
# Temperature aanpak
response_temp = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    temperature=0.7,
    # top_p niet instellen
    messages=[{"role": "user", "content": prompt}]
)

# Top_p aanpak
response_top_p = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    top_p=0.9,
    temperature=0,  # Zet op 0 bij gebruik van top_p
    messages=[{"role": "user", "content": prompt}]
)
\`\`\`

## 2. Max Tokens Optimization

Max tokens bepaalt de maximale lengte van Claude's response. Optimalisatie is cruciaal voor kosten en performance.

### Token Estimatie Guide
- **1 token** ≈ 4 karakters (Engels)
- **1 token** ≈ 2-3 karakters (Nederlands)
- **100 tokens** ≈ 75 woorden
- **1000 tokens** ≈ 750 woorden

### Use Case Configuraties

#### Korte Antwoorden (Chat/Q&A)
\`\`\`javascript
const shortAnswerConfig = {
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 150,  // ~100 woorden
  temperature: 0.3,
  system: "Geef beknopte, directe antwoorden. Vermijd onnodige uitleg."
};
\`\`\`

#### Medium Content (Emails/Summaries)
\`\`\`javascript
const mediumContentConfig = {
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 500,  // ~375 woorden
  temperature: 0.5,
  system: "Schrijf duidelijke, goed gestructureerde content met voldoende detail."
};
\`\`\`

#### Lange Content (Articles/Reports)
\`\`\`javascript
const longContentConfig = {
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 4000,  // ~3000 woorden
  temperature: 0.6,
  system: "Creëer uitgebreide, diepgaande content met volledige uitwerking."
};
\`\`\`

### Dynamische Token Allocatie
\`\`\`python
def calculate_max_tokens(task_type, content_length):
    """Bereken optimale max_tokens based op taak"""
    token_map = {
        "summary": min(content_length * 0.2, 500),
        "translation": content_length * 1.2,
        "expansion": content_length * 3,
        "qa": 200,
        "analysis": 1000
    }
    return int(token_map.get(task_type, 500))
\`\`\`

## 3. System Prompts Configuration

System prompts bepalen Claude's "persoonlijkheid" en gedrag voor de hele conversatie.

### Effectieve System Prompt Templates

#### Template: Technische Assistent
\`\`\`python
system_technical = """
Je bent een senior software engineer met expertise in moderne web technologieën.

Kernprincipes:
- Geef werkende, production-ready code
- Leg complexe concepten helder uit
- Denk stap voor stap bij het oplossen van problemen
- Gebruik best practices en design patterns
- Wees eerlijk over beperkingen of onzekerheden

Communicatiestijl:
- Professioneel maar toegankelijk
- Gebruik technische termen met uitleg
- Structureer antwoorden met headers en bullets
- Include code voorbeelden waar relevant
"""
\`\`\`

#### Template: Business Analyst
\`\`\`python
system_analyst = """
Je bent een ervaren business analyst gespecialiseerd in data-driven besluitvorming.

Kerncompetenties:
- Analyseer business requirements grondig
- Identificeer KPIs en success metrics
- Stel kritische vragen om context te begrijpen
- Geef actionable recommendations
- Overweeg verschillende stakeholder perspectieven

Output formaat:
- Begin met executive summary
- Gebruik data visualisatie suggesties
- Include risk assessment
- Eindig met concrete next steps
"""
\`\`\`

#### Template: Educatieve Tutor
\`\`\`python
system_tutor = """
Je bent een geduldige, deskundige tutor die complexe onderwerpen toegankelijk maakt.

Didactische aanpak:
- Pas je uitleg aan op het kennisniveau van de student
- Gebruik analogieën en praktijkvoorbeelden
- Moedig actief leren aan met vragen
- Geef constructieve feedback
- Vier successen en moedig door bij uitdagingen

Structuur:
1. Check voorkennis
2. Introduceer nieuwe concepten gradueel
3. Geef oefeningen met oplopende moeilijkheid
4. Evalueer begrip met controlevragen
"""
\`\`\`

### Multi-Role System Prompts
\`\`\`python
system_multi_role = """
Je bent Claude, een AI-assistent die verschillende rollen kan aannemen:

Als ik zeg "MODE: [rol]", schakel je naar die specifieke expertise:
- MODE: DEVELOPER - Focus op code en technische implementatie
- MODE: ANALYST - Focus op data analyse en business insights  
- MODE: WRITER - Focus op creatieve en overtuigende content
- MODE: REVIEWER - Focus op kritische evaluatie en feedback

Begin elke response met [CURRENT MODE: X] om duidelijkheid te geven.
"""
\`\`\`

## 4. Streaming vs Non-Streaming

### Non-Streaming (Standaard)
Wacht tot de complete response klaar is.

\`\`\`python
# Non-streaming implementatie
response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1000,
    messages=[{"role": "user", "content": "Schrijf een verhaal"}]
)
print(response.content[0].text)  # Complete response in één keer
\`\`\`

**Gebruik voor:**
- Korte responses (<500 tokens)
- Batch processing
- Wanneer latency niet kritiek is

### Streaming
Ontvang response in real-time chunks.

\`\`\`python
# Streaming implementatie
stream = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1000,
    stream=True,
    messages=[{"role": "user", "content": "Schrijf een lang artikel"}]
)

for event in stream:
    if event.type == "content_block_delta":
        print(event.delta.text, end="")  # Print elke chunk direct
\`\`\`

**Gebruik voor:**
- Lange responses (>500 tokens)
- Real-time chat interfaces
- Betere user experience

### Streaming met Progress Indicator
\`\`\`javascript
async function streamWithProgress(messages) {
  const stream = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    stream: true,
    messages: messages
  });

  let totalChars = 0;
  for await (const event of stream) {
    if (event.type === 'content_block_delta') {
      process.stdout.write(event.delta.text);
      totalChars += event.delta.text.length;
      
      // Update progress indicator
      updateProgress(totalChars);
    }
  }
}
\`\`\`

## 5. Error Handling Setup

Robuuste error handling is essentieel voor production applicaties.

### Complete Error Handling Template
\`\`\`python
import time
from typing import Optional, Dict, Any
import logging

class ClaudeAPIHandler:
    def __init__(self, api_key: str, max_retries: int = 3):
        self.client = Anthropic(api_key=api_key)
        self.max_retries = max_retries
        self.logger = logging.getLogger(__name__)
    
    def make_request(
        self, 
        messages: list, 
        **kwargs
    ) -> Optional[Dict[str, Any]]:
        """Make API request met comprehensive error handling"""
        
        for attempt in range(self.max_retries):
            try:
                response = self.client.messages.create(
                    messages=messages,
                    **kwargs
                )
                return response
                
            except anthropic.RateLimitError as e:
                wait_time = self._get_retry_wait_time(e, attempt)
                self.logger.warning(
                    f"Rate limit hit. Waiting {wait_time}s before retry {attempt + 1}"
                )
                time.sleep(wait_time)
                
            except anthropic.APIStatusError as e:
                self.logger.error(f"API Status Error: {e.status_code} - {e.message}")
                
                if e.status_code == 401:
                    raise Exception("Invalid API key")
                elif e.status_code == 400:
                    raise Exception(f"Bad request: {e.message}")
                elif e.status_code >= 500:
                    # Server errors - retry
                    time.sleep(2 ** attempt)
                    continue
                else:
                    raise
                    
            except anthropic.APIConnectionError as e:
                self.logger.error(f"Connection error: {e}")
                time.sleep(2 ** attempt)
                
            except Exception as e:
                self.logger.error(f"Unexpected error: {e}")
                raise
        
        raise Exception(f"Max retries ({self.max_retries}) exceeded")
    
    def _get_retry_wait_time(self, error, attempt: int) -> int:
        """Calculate retry wait time based on error headers"""
        if hasattr(error, 'response') and error.response.headers:
            reset_time = error.response.headers.get('x-ratelimit-reset')
            if reset_time:
                return max(int(reset_time) - int(time.time()), 1)
        
        # Exponential backoff fallback
        return min(2 ** attempt, 60)
\`\`\`

### Error Types en Handling Strategies

\`\`\`python
# Error handling configuratie
error_config = {
    "RateLimitError": {
        "retry": True,
        "wait_strategy": "exponential",
        "max_wait": 60,
        "log_level": "warning"
    },
    "APIStatusError": {
        "retry": lambda status: status >= 500,
        "wait_strategy": "fixed",
        "wait_time": 5,
        "log_level": "error"
    },
    "APIConnectionError": {
        "retry": True,
        "wait_strategy": "exponential",
        "max_retries": 5,
        "log_level": "error"
    },
    "InvalidRequestError": {
        "retry": False,
        "log_level": "error",
        "user_message": "Er is een fout in de request configuratie"
    }
}
\`\`\`

### Production-Ready Error Handler
\`\`\`javascript
class ProductionClaudeClient {
  constructor(apiKey, config = {}) {
    this.client = new Anthropic({ apiKey });
    this.config = {
      maxRetries: 3,
      timeout: 30000,
      fallbackModel: 'claude-3-haiku-20240307',
      ...config
    };
  }

  async createMessage(params) {
    const startTime = Date.now();
    
    try {
      // Timeout wrapper
      const response = await Promise.race([
        this.client.messages.create(params),
        this.timeout(this.config.timeout)
      ]);
      
      // Log success metrics
      this.logMetrics('success', Date.now() - startTime);
      return response;
      
    } catch (error) {
      // Try fallback model for non-critical errors
      if (this.shouldUseFallback(error)) {
        return this.createMessage({
          ...params,
          model: this.config.fallbackModel
        });
      }
      
      // Log error metrics
      this.logMetrics('error', Date.now() - startTime, error);
      throw this.enhanceError(error);
    }
  }
  
  timeout(ms) {
    return new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), ms)
    );
  }
  
  shouldUseFallback(error) {
    return error.status_code === 529 || // Overloaded
           error.message.includes('capacity');
  }
  
  enhanceError(error) {
    error.timestamp = new Date().toISOString();
    error.context = {
      model: this.lastUsedModel,
      retryCount: this.retryCount
    };
    return error;
  }
}
\`\`\`

## Praktijkoefening: Optimale Configuratie

### Scenario
Bouw een customer support chatbot voor een e-commerce platform.

### Requirements
- Snelle response tijd (<2 sec)
- Consistente antwoorden
- Vriendelijke toon
- Error resilience

### Oplossing
\`\`\`python
# Optimale configuratie voor customer support
support_config = {
    "model": "claude-3-5-sonnet-20241022",
    "temperature": 0.3,  # Consistent maar niet robotisch
    "max_tokens": 300,   # Beknopte antwoorden
    "stream": True,      # Real-time feedback
    "system": """
Je bent een vriendelijke customer support medewerker voor ShopEasy.

Richtlijnen:
- Toon empathie en begrip
- Geef concrete oplossingen
- Escaleer complexe issues naar human agents
- Gebruik de klant's naam indien bekend
- Eindig met "Kan ik nog iets anders voor u doen?"

Tone of voice: Professioneel, behulpzaam, warm
"""
}

# Implementatie met error handling
async def handle_support_query(query, customer_name=None):
    try:
        message = f"Klant {customer_name}: {query}" if customer_name else query
        
        response = await client.messages.create(
            **support_config,
            messages=[
                {"role": "user", "content": message}
            ]
        )
        
        return response
        
    except Exception as e:
        # Fallback naar template response
        return {
            "content": [{
                "text": "Excuses voor het ongemak. Ik verbind u door met een medewerker."
            }],
            "error": str(e)
        }
\`\`\`

## Key Takeaways

1. **Temperature**: Lager voor consistentie, hoger voor creativiteit
2. **Max Tokens**: Optimaliseer voor use case om kosten te besparen
3. **System Prompts**: Investeer tijd in goede system prompts
4. **Streaming**: Gebruik voor betere UX bij lange responses
5. **Error Handling**: Plan voor alle mogelijke failure scenarios

## Volgende Stappen

- Test verschillende configuraties voor jouw use case
- Monitor performance metrics
- A/B test temperature settings
- Implementeer comprehensive error handling
- Optimaliseer token usage voor kosten
  `,
};