import type { Lesson } from '@/lib/data/courses';

export const lesson1_3: Lesson = {
  id: 'lesson-1-3',
  title: 'API toegang en platforms',
  duration: '30 min',
  content: `
# API Toegang en Platforms

Leer hoe je toegang krijgt tot Claude via verschillende platforms en interfaces. Deze les bevat stap-voor-stap handleidingen voor het opzetten van je Claude toegang.

## 1. Getting API Access

### Stap 1: Account aanmaken
1. Ga naar [console.anthropic.com](https://console.anthropic.com)
2. Klik op "Sign up"
3. Vul je gegevens in:
   - Email adres
   - Wachtwoord (minimaal 8 karakters)
   - Organisatienaam (optioneel)
4. Bevestig je email adres

### Stap 2: API Key genereren
1. Log in op de Anthropic Console
2. Navigeer naar "API Keys" in het linkermenu
3. Klik op "Create Key"
4. Geef je key een beschrijvende naam (bijv. "Production App")
5. Kopieer de key **direct** - deze wordt maar één keer getoond!

### Stap 3: Billing setup
1. Ga naar "Billing" in de Console
2. Voeg een betaalmethode toe
3. Stel optioneel een spending limit in
4. Bekijk de gratis credits voor nieuwe accounts ($5)

**Belangrijk:** Bewaar je API key veilig! Behandel het als een wachtwoord.

## 2. Claude.ai Web Interface

### Toegang krijgen
1. Bezoek [claude.ai](https://claude.ai)
2. Maak een account aan (apart van API account)
3. Kies een subscription:
   - **Free**: Beperkt gebruik, Claude 3.5 Sonnet
   - **Pro ($20/maand)**: Meer berichten, prioriteit toegang
   - **Team ($25/gebruiker/maand)**: Centrale billing, admin tools

### Features van Claude.ai
- **Projects**: Organiseer gesprekken per project
- **Artifacts**: Genereer en bewerk code/documenten
- **Custom Instructions**: Stel standaard gedrag in
- **File Upload**: Upload tot 5 bestanden per bericht

### Wanneer gebruik je Claude.ai vs API?
| Use Case | Claude.ai | API |
|----------|-----------|-----|
| Prototyping | ✅ Ideaal | ❌ Overhead |
| Productie apps | ❌ Niet geschikt | ✅ Ontworpen voor |
| Team collaboratie | ✅ Met Team plan | ⚠️ Zelf bouwen |
| Kosten controle | ⚠️ Vaste prijs | ✅ Pay-per-use |

## 3. API Console Overview

### Dashboard Features
1. **Usage Metrics**
   - Token verbruik per model
   - Kosten overzicht
   - Request volume grafiek

2. **API Keys Management**
   - Meerdere keys per organisatie
   - Key rotatie mogelijkheden
   - Toegangscontrole per key

3. **Rate Limits Monitor**
   - Huidige limits bekijken
   - Usage percentage
   - Upgrade opties

### Organisatie Settings
- Team members toevoegen
- Rollen toewijzen (Admin, Developer, Viewer)
- Audit logs bekijken
- Compliance documentatie

## 4. Available SDKs en Libraries

### Officiële SDKs

#### Python SDK
\`\`\`bash
pip install anthropic
\`\`\`

\`\`\`python
from anthropic import Anthropic

client = Anthropic(api_key="your-api-key")
response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1000,
    messages=[
        {"role": "user", "content": "Hallo Claude!"}
    ]
)
\`\`\`

#### TypeScript/JavaScript SDK
\`\`\`bash
npm install @anthropic-ai/sdk
\`\`\`

\`\`\`typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const response = await client.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1000,
  messages: [
    { role: 'user', content: 'Hallo Claude!' }
  ],
});
\`\`\`

### Community Libraries
- **LangChain**: Multi-LLM framework
- **LlamaIndex**: Data framework voor LLMs
- **Vercel AI SDK**: Voor Next.js applicaties
- **Ruby**, **Go**, **Java**: Community-maintained

### REST API Direct
\`\`\`bash
curl https://api.anthropic.com/v1/messages \\
  -H "content-type: application/json" \\
  -H "x-api-key: \$ANTHROPIC_API_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 1000,
    "messages": [
      {"role": "user", "content": "Hallo Claude!"}
    ]
  }'
\`\`\`

## 5. Pricing en Rate Limits

### Prijsmodel (December 2024)
| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|------------------------|
| Claude 3.5 Sonnet | $3.00 | $15.00 |
| Claude 3 Opus | $15.00 | $75.00 |
| Claude 3 Haiku | $0.25 | $1.25 |
| Claude 3.5 Haiku | Coming soon | Coming soon |

### Token Berekening
- 1 token ≈ 4 karakters Engels
- 1 token ≈ 2-3 karakters Nederlands
- 1000 tokens ≈ 750 woorden

**Voorbeeld kosten berekening:**
\`\`\`
Chatbot gesprek (gemiddeld):
- Input: 500 tokens
- Output: 1000 tokens
- Kosten met Sonnet 3.5: $0.0165 per gesprek
- 1000 gesprekken = $16.50
\`\`\`

### Rate Limits

#### Gratis Tier (eerste $5 credits)
- 5 requests per minuut
- 300K tokens per dag

#### Standaard Tier (betaalde accounts)
- 50 requests per minuut (Sonnet)
- 20 requests per minuut (Opus)
- 5M tokens per dag

#### Enterprise
- Custom limits
- Dedicated support
- SLA garanties

### Rate Limit Headers
\`\`\`http
x-ratelimit-limit: 50
x-ratelimit-remaining: 47
x-ratelimit-reset: 1701936000
\`\`\`

## Best Practices

### 1. API Key Security
\`\`\`python
# GOED: Environment variables
import os
api_key = os.environ.get('ANTHROPIC_API_KEY')

# FOUT: Hardcoded keys
api_key = "sk-ant-..." # Nooit doen!
\`\`\`

### 2. Error Handling
\`\`\`python
try:
    response = client.messages.create(...)
except anthropic.RateLimitError:
    # Wacht en probeer opnieuw
    time.sleep(60)
except anthropic.APIError as e:
    # Log error en handle gracefully
    logger.error(f"API Error: {e}")
\`\`\`

### 3. Kosten Optimalisatie
- Cache veelvoorkomende vragen
- Gebruik streaming voor lange responses
- Monitor token usage per user/feature
- Implementeer usage limits per gebruiker

## Oefening: Je Eerste API Call

1. Maak een Anthropic account aan
2. Genereer een API key
3. Installeer de SDK voor je favoriete taal
4. Maak een simpel script dat:
   - Een vraag stelt aan Claude
   - Het antwoord print
   - De gebruikte tokens toont

Dit geeft je hands-on ervaring met het platform!
  `,
};