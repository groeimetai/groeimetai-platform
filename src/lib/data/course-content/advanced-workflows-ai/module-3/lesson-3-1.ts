import { Lesson } from '@/lib/data/courses';

export const lesson3_1: Lesson = {
  id: 'lesson-3-1',
  title: 'OpenAI API setup in N8N/Make',
  duration: '30 min',
  content: `
# OpenAI API setup in N8N/Make

## Introductie

OpenAI's API biedt toegang tot krachtige AI-modellen zoals GPT-4, DALL-E en Whisper. Een goede setup is cruciaal voor veilige, efficiënte en kosteneffectieve integratie. In deze les leer je hoe je de OpenAI API correct configureert in zowel N8N als Make.com, met focus op security, rate limiting en kostenbeheersing.

## API Key Management en Security

### API Key aanmaken

1. **OpenAI Platform Account**
   - Ga naar [platform.openai.com](https://platform.openai.com)
   - Navigeer naar API Keys in je account settings
   - Klik op "Create new secret key"
   - Geef de key een beschrijvende naam (bijv. "n8n-production" of "make-development")
   - **BELANGRIJK**: Kopieer de key direct - deze wordt maar één keer getoond!

### Security Best Practices

**Wat NIET te doen:**
- API keys hardcoden in workflows
- Keys delen via email of chat
- Dezelfde key voor productie en development gebruiken
- Keys in version control opslaan

**Wat WEL te doen:**
- Gebruik environment variables
- Roteer keys regelmatig (minimaal elke 90 dagen)
- Gebruik verschillende keys per omgeving
- Monitor API key gebruik in OpenAI dashboard
- Stel spending limits in

### Key Rotation Strategy

\`\`\`javascript
// Voorbeeld key rotation schema
const keyRotation = {
  production: {
    current: "sk-prod-...",
    rotation_date: "2024-03-01",
    expiry_warning: 7 // dagen voor expiry
  },
  staging: {
    current: "sk-stage-...",
    rotation_date: "2024-02-15"
  }
}
\`\`\`

## Authentication Setup in N8N

### Methode 1: OpenAI Credentials (Aanbevolen)

1. **Credentials aanmaken**
   - Ga naar Credentials in N8N
   - Klik op "Add Credential"
   - Selecteer "OpenAI Api"
   - Voer je API key in
   - Geef de credential een naam (bijv. "OpenAI Production")

2. **Environment Variables gebruiken**
   \`\`\`bash
   # .env file in N8N
   OPENAI_API_KEY=sk-...
   N8N_ENCRYPTION_KEY=your-encryption-key
   \`\`\`

3. **N8N configuratie**
   \`\`\`javascript
   // In N8N OpenAI node
   {
     "authentication": "apiKey",
     "apiKey": "={\{\$env.OPENAI_API_KEY}}",
     "organizationId": "org-...", // Optioneel
     "baseURL": "https://api.openai.com/v1" // Custom endpoint mogelijk
   }
   \`\`\`

### Methode 2: HTTP Request Node (Geavanceerd)

Voor meer controle over API calls:

\`\`\`javascript
// HTTP Request node configuratie
{
  "method": "POST",
  "url": "https://api.openai.com/v1/chat/completions",
  "authentication": {
    "type": "headerAuth",
    "properties": {
      "headerName": "Authorization",
      "headerValue": "Bearer {{\$credentials.openai.apiKey}}"
    }
  },
  "headers": {
    "Content-Type": "application/json",
    "OpenAI-Organization": "{{\$credentials.openai.orgId}}" // Optioneel
  }
}
\`\`\`

## Authentication Setup in Make

### Stap 1: OpenAI Module toevoegen

1. **Module configuratie**
   - Voeg een OpenAI module toe aan je scenario
   - Klik op "Create a connection"
   - Geef de connectie een naam
   - Voer je API key in

### Stap 2: Connection Security

\`\`\`javascript
// Make.com connection settings
{
  "connection": {
    "name": "OpenAI Production",
    "apiKey": "sk-...",
    "timeout": 60, // seconds
    "retries": 3,
    "organization": "org-..." // Optioneel
  }
}
\`\`\`

### Stap 3: Omgevingsvariabelen in Make

Make ondersteunt geen directe environment variables, maar je kunt Data Stores gebruiken:

\`\`\`javascript
// Data Store voor veilige key opslag
{
  "dataStore": "API_Keys",
  "structure": {
    "openai_key": {
      "type": "text",
      "encrypted": true
    },
    "last_rotation": {
      "type": "date"
    }
  }
}
\`\`\`

## Rate Limiting en Quotas

### OpenAI Rate Limits begrijpen

OpenAI hanteert verschillende rate limits:

1. **Requests Per Minute (RPM)**
   - GPT-4: 200 RPM (Tier 1)
   - GPT-3.5: 3,500 RPM (Tier 1)
   
2. **Tokens Per Minute (TPM)**
   - GPT-4: 10,000 TPM
   - GPT-3.5: 90,000 TPM

3. **Requests Per Day (RPD)**
   - Afhankelijk van je tier

### Rate Limiting in N8N

\`\`\`javascript
// Rate limiter implementatie
const rateLimiter = {
  "nodes": [{
    "name": "Rate Limiter",
    "type": "n8n-nodes-base.wait",
    "parameters": {
      "amount": 0.3, // 300ms tussen requests
      "unit": "seconds"
    }
  }],
  
  // Batch processing voor efficiëntie
  "batchConfig": {
    "batchSize": 10,
    "batchInterval": 1000 // 1 seconde
  }
}
\`\`\`

### Rate Limiting in Make

Make's ingebouwde rate limiting:

\`\`\`javascript
// Scenario settings
{
  "scheduling": {
    "interval": 1, // minuten
    "maxOperations": 50 // per run
  },
  
  "errorHandling": {
    "retry": {
      "attempts": 3,
      "interval": "exponential", // 1s, 2s, 4s
      "on": ["rate_limit_exceeded"]
    }
  }
}
\`\`\`

### Custom Rate Limiter Pattern

\`\`\`javascript
// Geavanceerde rate limiting met queue
class OpenAIRateLimiter {
  constructor(rpm = 200, tpm = 10000) {
    this.requestsPerMinute = rpm;
    this.tokensPerMinute = tpm;
    this.requestQueue = [];
    this.tokenCount = 0;
    this.lastReset = Date.now();
  }
  
  async executeRequest(request) {
    await this.waitForSlot();
    
    try {
      const response = await this.makeRequest(request);
      this.updateTokenCount(response.usage.total_tokens);
      return response;
    } catch (error) {
      if (error.code === 'rate_limit_exceeded') {
        // Exponential backoff
        await this.delay(Math.pow(2, this.retryCount) * 1000);
        return this.executeRequest(request);
      }
      throw error;
    }
  }
}
\`\`\`

## Cost Management

### Kosten Monitoring

1. **OpenAI Dashboard**
   - Monitor daily usage
   - Set up usage alerts
   - Track cost per API key

2. **Spending Limits instellen**
   \`\`\`javascript
   // OpenAI account settings
   {
     "billing": {
       "hard_limit": 100, // USD per maand
       "soft_limit": 80,  // Waarschuwing bij 80%
       "auto_recharge": false
     }
   }
   \`\`\`

### Cost Optimization Strategies

1. **Model Selection**
   \`\`\`javascript
   // Kies het juiste model voor de taak
   const modelSelection = {
     "simple_tasks": "gpt-3.5-turbo", // $0.0015/1K tokens
     "complex_reasoning": "gpt-4", // $0.03/1K tokens
     "code_generation": "gpt-3.5-turbo-16k",
     "embeddings": "text-embedding-ada-002" // $0.0001/1K tokens
   }
   \`\`\`

2. **Token Optimization**
   \`\`\`javascript
   // Minimaliseer token gebruik
   const optimization = {
     // Gebruik kortere prompts
     "system_message": "You are a helpful assistant", // Niet: "You are an extremely helpful..."
     
     // Beperk response length
     "max_tokens": 150, // Alleen wat nodig is
     
     // Cache veelgebruikte responses
     "enable_caching": true
   }
   \`\`\`

3. **Batch Processing**
   \`\`\`javascript
   // Combineer meerdere requests waar mogelijk
   const batchRequest = {
     "messages": [
       { "role": "system", "content": "Process these items efficiently" },
       { "role": "user", "content": items.join('\\n') }
     ]
   }
   \`\`\`

### Cost Tracking in Workflows

\`\`\`javascript
// N8N cost tracking node
{
  "name": "Track API Costs",
  "type": "n8n-nodes-base.function",
  "parameters": {
    "functionCode": \`
      const usage = \$input.first().json.usage;
      const costs = {
        prompt_tokens: usage.prompt_tokens,
        completion_tokens: usage.completion_tokens,
        total_tokens: usage.total_tokens,
        estimated_cost: (usage.total_tokens / 1000) * 0.002 // GPT-3.5 pricing
      };
      
      // Log naar database of monitoring tool
      await \$workflow.logger.log('api_cost', costs);
      
      return costs;
    \`
  }
}
\`\`\`

## Praktische Setup Checklist

### Voor N8N

- [ ] OpenAI account aangemaakt
- [ ] API key gegenereerd met descriptieve naam
- [ ] Credentials in N8N geconfigureerd
- [ ] Environment variables ingesteld
- [ ] Rate limiting geïmplementeerd
- [ ] Error handling toegevoegd
- [ ] Cost monitoring actief
- [ ] Test workflow gemaakt

### Voor Make.com

- [ ] OpenAI connection aangemaakt
- [ ] API key veilig opgeslagen
- [ ] Scenario scheduling geconfigureerd
- [ ] Error handlers toegevoegd
- [ ] Rate limits ingesteld
- [ ] Data store voor key management
- [ ] Cost tracking module toegevoegd
- [ ] Test scenario uitgevoerd

## Troubleshooting

### Veelvoorkomende problemen

1. **"Invalid API key"**
   - Controleer of de key correct is gekopieerd
   - Verifieer dat de key actief is in OpenAI dashboard
   - Check voor extra spaties of karakters

2. **"Rate limit exceeded"**
   - Implementeer exponential backoff
   - Verlaag aantal requests per minuut
   - Upgrade je OpenAI tier indien nodig

3. **"Insufficient quota"**
   - Controleer je billing status
   - Verhoog spending limit
   - Monitor token usage

## Best Practices Samenvatting

1. **Security First**: Behandel API keys als wachtwoorden
2. **Monitor Altijd**: Track usage en kosten continue
3. **Plan voor Fouten**: Implementeer robuuste error handling
4. **Optimaliseer Kosten**: Kies het juiste model voor elke taak
5. **Test Grondig**: Test met kleine batches eerst
6. **Documenteer**: Houd bij welke key waar gebruikt wordt
        `,
  codeExamples: [
    {
      id: 'n8n-openai-chat',
      title: 'N8N OpenAI Chat Completion',
      language: 'javascript',
      code: `// Complete N8N workflow voor OpenAI integratie
{
  "nodes": [
    {
      "name": "Trigger",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "openai-chat",
        "responseMode": "onReceived",
        "options": {}
      }
    },
    {
      "name": "Validate Input",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{\$json.message}}",
              "operation": "isNotEmpty"
            }
          ]
        }
      }
    },
    {
      "name": "Rate Limiter",
      "type": "n8n-nodes-base.wait",
      "parameters": {
        "amount": 0.5,
        "unit": "seconds"
      }
    },
    {
      "name": "OpenAI Chat",
      "type": "@n8n/n8n-nodes-langchain.openAi",
      "parameters": {
        "model": "gpt-3.5-turbo",
        "messages": {
          "values": [
            {
              "role": "system",
              "content": "You are a helpful assistant"
            },
            {
              "role": "user",
              "content": "={{\$json.message}}"
            }
          ]
        },
        "options": {
          "temperature": 0.7,
          "maxTokens": 150,
          "topP": 1,
          "frequencyPenalty": 0,
          "presencePenalty": 0,
          "timeout": 30000
        }
      },
      "credentials": {
        "openAiApi": {
          "id": "1",
          "name": "OpenAI Production"
        }
      }
    },
    {
      "name": "Cost Calculator",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": \`
const usage = items[0].json.usage;
const model = items[0].json.model;

// Pricing per 1K tokens (update as needed)
const pricing = {
  'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 }
};

const modelPricing = pricing[model] || pricing['gpt-3.5-turbo'];

const cost = {
  prompt_cost: (usage.prompt_tokens / 1000) * modelPricing.input,
  completion_cost: (usage.completion_tokens / 1000) * modelPricing.output,
  total_cost: 0
};

cost.total_cost = cost.prompt_cost + cost.completion_cost;

// Add cost data to output
items[0].json.cost_analysis = cost;

// Log to external service if needed
const logData = {
  timestamp: new Date().toISOString(),
  model: model,
  tokens: usage,
  cost: cost,
  workflow_id: \$workflow.id,
  execution_id: \$execution.id
};

// Optional: Send to monitoring service
// await \$http.post('https://your-monitoring.com/api/costs', logData);

return items;
        \`
      }
    },
    {
      "name": "Error Handler",
      "type": "n8n-nodes-base.errorTrigger",
      "parameters": {}
    },
    {
      "name": "Log Error",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": \`
const error = items[0].json;

// Categorize error
let errorType = 'unknown';
let shouldRetry = false;
let retryDelay = 1000;

if (error.message.includes('rate_limit_exceeded')) {
  errorType = 'rate_limit';
  shouldRetry = true;
  retryDelay = 60000; // 1 minute
} else if (error.message.includes('insufficient_quota')) {
  errorType = 'quota_exceeded';
  shouldRetry = false;
} else if (error.message.includes('invalid_api_key')) {
  errorType = 'auth_error';
  shouldRetry = false;
}

const errorLog = {
  timestamp: new Date().toISOString(),
  error_type: errorType,
  message: error.message,
  should_retry: shouldRetry,
  retry_delay: retryDelay,
  workflow_id: \$workflow.id,
  execution_id: \$execution.id
};

// Send alert if critical
if (!shouldRetry) {
  // Send email/Slack notification
}

return [{json: errorLog}];
        \`
      }
    }
  ]
}`
    },
    {
      id: 'make-openai-scenario',
      title: 'Make.com OpenAI Scenario',
      language: 'json',
      code: `// Make.com OpenAI integration scenario
{
  "name": "OpenAI Chat Integration",
  "flow": [
    {
      "id": 1,
      "module": "gateway:CustomWebHook",
      "parameters": {
        "hook": "openai-chat",
        "maxResults": 1
      }
    },
    {
      "id": 2,
      "module": "util:SetVariable",
      "parameters": {
        "variables": [
          {
            "name": "request_timestamp",
            "value": "{{now}}"
          },
          {
            "name": "max_retries",
            "value": 3
          }
        ]
      }
    },
    {
      "id": 3,
      "module": "openai:ChatCompletion",
      "parameters": {
        "model": "gpt-3.5-turbo",
        "messages": [
          {
            "role": "system",
            "content": "You are a helpful assistant"
          },
          {
            "role": "user",
            "content": "{{1.message}}"
          }
        ],
        "temperature": 0.7,
        "max_tokens": 150,
        "n": 1,
        "stop": null
      },
      "error": {
        "id": 4,
        "module": "builtin:BasicRouter",
        "routes": [
          {
            "flow": [
              {
                "id": 5,
                "module": "util:Sleep",
                "parameters": {
                  "duration": 60
                },
                "filter": {
                  "name": "Rate Limit Error",
                  "conditions": [
                    {
                      "a": "{{4.error.message}}",
                      "o": "text:contains",
                      "b": "rate_limit"
                    }
                  ]
                }
              }
            ]
          },
          {
            "flow": [
              {
                "id": 6,
                "module": "slack:CreateMessage",
                "parameters": {
                  "channel": "#alerts",
                  "text": "OpenAI API Error: {{4.error.message}}"
                },
                "filter": {
                  "name": "Critical Error",
                  "conditions": [
                    {
                      "a": "{{4.error.message}}",
                      "o": "text:contains",
                      "b": "invalid_api_key"
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    },
    {
      "id": 7,
      "module": "datastore:AddRecord",
      "parameters": {
        "datastore": "api_usage_log",
        "record": {
          "timestamp": "{{2.request_timestamp}}",
          "model": "{{3.model}}",
          "prompt_tokens": "{{3.usage.prompt_tokens}}",
          "completion_tokens": "{{3.usage.completion_tokens}}",
          "total_tokens": "{{3.usage.total_tokens}}",
          "estimated_cost": "{{3.usage.total_tokens / 1000 * 0.002}}"
        }
      }
    }
  ],
  "settings": {
    "executionTimeout": 40,
    "maxErrors": 3,
    "dlq": true,
    "sequential": true
  }
}`
    },
    {
      id: 'env-vars-setup',
      title: 'Environment Variables Setup',
      language: 'bash',
      code: `# .env file voor N8N
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
OPENAI_ORG_ID=org-xxxxxxxxxxxxx
N8N_ENCRYPTION_KEY=your-encryption-key-here

# Rate limiting settings
OPENAI_RPM_LIMIT=200
OPENAI_TPM_LIMIT=10000
OPENAI_RETRY_ATTEMPTS=3
OPENAI_RETRY_DELAY=1000

# Cost management
OPENAI_DAILY_BUDGET=10
OPENAI_ALERT_THRESHOLD=0.8
ALERT_EMAIL=admin@company.com

# Monitoring
ENABLE_COST_TRACKING=true
ENABLE_USAGE_LOGGING=true
LOG_LEVEL=info

# Security
API_KEY_ROTATION_DAYS=90
ENABLE_IP_WHITELIST=true
ALLOWED_IPS=10.0.0.0/8,172.16.0.0/12`
    }
  ],
  assignments: [
    {
      id: 'setup-openai-basic',
      title: 'Basis OpenAI Setup',
      description: 'Configureer een werkende OpenAI integratie in N8N of Make. Checklist: Maak een OpenAI account aan, genereer een API key met descriptieve naam, configureer de API key in N8N of Make, test de connectie met een simpele chat completion, en implementeer basis error handling.',
      difficulty: 'easy',
      type: 'project'
    },
    {
      id: 'implement-rate-limiting',
      title: 'Rate Limiting Implementeren',
      description: 'Voeg rate limiting toe aan je OpenAI workflow. Checklist: Analyseer je verwachte API usage, implementeer een rate limiter (wait nodes of custom logic), test met bulk requests, monitor rate limit errors, en implementeer exponential backoff voor retries.',
      difficulty: 'medium',
      type: 'project'
    },
    {
      id: 'cost-optimization',
      title: 'Kosten Optimalisatie',
      description: 'Optimaliseer je OpenAI gebruik voor minimale kosten. Checklist: Implementeer cost tracking in je workflow, vergelijk kosten tussen verschillende modellen, optimaliseer prompt length, implementeer response caching waar mogelijk, en stel daily spending limits in.',
      difficulty: 'medium',
      type: 'project'
    }
  ],
  resources: [
    {
      title: 'OpenAI API Documentation',
      url: 'https://platform.openai.com/docs/api-reference',
      type: 'documentation'
    },
    {
      title: 'OpenAI Pricing Calculator',
      url: 'https://openai.com/pricing',
      type: 'tool'
    },
    {
      title: 'N8N OpenAI Integration Guide',
      url: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/',
      type: 'guide'
    },
    {
      title: 'Make.com OpenAI Modules',
      url: 'https://www.make.com/en/integrations/openai',
      type: 'documentation'
    },
    {
      title: 'API Key Best Practices',
      url: 'https://platform.openai.com/docs/guides/production-best-practices',
      type: 'guide'
    }
  ]
};