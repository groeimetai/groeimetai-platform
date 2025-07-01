import type { Lesson } from '@/lib/data/courses'

export const lesson5_1: Lesson = {
  id: 'lesson-5-1',
  title: 'CRM Integration met ChatGPT',
  duration: '90 minuten',
  content: `# CRM Integration met ChatGPT

## Salesforce Integration Example

In deze les leren we hoe je ChatGPT integreert met populaire CRM systemen zoals Salesforce, HubSpot en Microsoft Dynamics.

### Wat je gaat leren:
- API integratie tussen ChatGPT en CRM systemen
- Automatische lead kwalificatie met AI
- Intelligente customer insights generatie
- Geautomatiseerde follow-up suggesties

## Salesforce AI Service Architectuur

### Core Components:
1. **OpenAI Service Layer**: Handles alle ChatGPT API calls
2. **Salesforce Connector**: JSforce library voor Salesforce API
3. **Integration Middleware**: Express server voor request handling
4. **Security Layer**: OAuth2 authentication en token management

### Key Features:

#### 1. Lead Scoring Automation
- Analyseer lead interacties met ChatGPT
- Genereer automatische lead scores
- Prioriteer sales follow-ups

#### 2. Customer Insight Generation
- Analyseer customer history
- Genereer persoonlijke talking points
- Voorspel customer needs

#### 3. Email Personalization
- Genereer gepersonaliseerde emails
- A/B test verschillende approaches
- Track engagement metrics

## Implementation Stappen

### Stap 1: Setup Environment
\`\`\`bash
npm install openai jsforce express dotenv
npm install @types/node typescript ts-node
\`\`\`

### Stap 2: Configure Salesforce OAuth
1. Ga naar Salesforce Setup
2. Create Connected App
3. Enable OAuth Settings
4. Kopieer Client ID en Secret

### Stap 3: Environment Variables
\`\`\`env
OPENAI_API_KEY=sk-...
SF_INSTANCE_URL=https://your-instance.salesforce.com
SF_CLIENT_ID=your-client-id
SF_CLIENT_SECRET=your-client-secret
SF_USERNAME=your-username
SF_PASSWORD=your-password
\`\`\`

### Stap 4: Basic Integration Code

#### OpenAI Service
\`\`\`typescript
import { OpenAI } from 'openai';

class OpenAIService {
  private openai: OpenAI;
  
  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }
  
  async analyzeLead(leadData: any) {
    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "Je bent een expert sales AI assistant..."
      }, {
        role: "user",
        content: JSON.stringify(leadData)
      }],
      temperature: 0.7
    });
    
    return response.choices[0].message.content;
  }
}
\`\`\`

#### Salesforce Connector
\`\`\`typescript
import jsforce from 'jsforce';

class SalesforceConnector {
  private conn: jsforce.Connection;
  
  async connect() {
    this.conn = new jsforce.Connection({
      oauth2: {
        clientId: process.env.SF_CLIENT_ID,
        clientSecret: process.env.SF_CLIENT_SECRET,
        redirectUri: 'http://localhost:3000/oauth2/callback'
      }
    });
    
    await this.conn.login(
      process.env.SF_USERNAME!,
      process.env.SF_PASSWORD!
    );
  }
  
  async getLeads() {
    return await this.conn.query(
      "SELECT Id, Name, Company, Email FROM Lead"
    );
  }
}
\`\`\`

## Best Practices

### 1. Rate Limiting
- Implementeer rate limiting voor beide APIs
- Cache responses waar mogelijk
- Gebruik webhooks voor real-time updates

### 2. Error Handling
- Comprehensive error logging
- Graceful fallbacks
- Retry mechanisms met exponential backoff

### 3. Security
- Encrypt alle API keys
- Gebruik environment variables
- Implementeer proper access controls

## Praktische Use Cases

### Use Case 1: Automated Lead Qualification
Wanneer een nieuwe lead binnenkomt:
1. Fetch lead data uit Salesforce
2. Analyseer met ChatGPT
3. Update lead score in Salesforce
4. Trigger automated workflows

### Use Case 2: Meeting Preparation
Voor elke sales meeting:
1. Verzamel customer history
2. Genereer talking points met ChatGPT
3. Push naar sales rep's mobile
4. Track meeting outcomes

### Use Case 3: Customer Success Automation
- Monitor customer health scores
- Generate proactive outreach suggestions
- Automate check-in emails
- Predict churn risk

## Oefening: Build Your First Integration

### Opdracht:
Bouw een simpele integratie die:
1. Nieuwe leads uit Salesforce haalt
2. Ze analyseert met ChatGPT
3. Een kwalificatie score toevoegt
4. De lead update in Salesforce

### Starter Template:
\`\`\`typescript
// main.ts
async function processNewLeads() {
  const sf = new SalesforceConnector();
  const ai = new OpenAIService(process.env.OPENAI_API_KEY!);
  
  await sf.connect();
  const leads = await sf.getLeads();
  
  for (const lead of leads.records) {
    const analysis = await ai.analyzeLead(lead);
    // TODO: Parse analysis and update lead
  }
}
\`\`\`

## Resources
- [Salesforce Developer Docs](https://developer.salesforce.com)
- [JSforce Documentation](https://jsforce.github.io)
- [OpenAI API Reference](https://platform.openai.com/docs)

## Volgende Stappen
In de volgende les gaan we dieper in op:
- HubSpot integraties
- Microsoft Dynamics 365
- Custom CRM solutions
- Advanced AI workflows`,
  quiz: {
    questions: [
      {
        question: "Wat is de belangrijkste reden om ChatGPT met een CRM te integreren?",
        options: [
          "Om handmatige data entry te verminderen",
          "Om intelligente insights en automatisering toe te voegen",
          "Om de CRM goedkoper te maken",
          "Om meer data op te slaan"
        ],
        correctAnswer: 1,
        explanation: "ChatGPT voegt intelligentie toe aan je CRM data, enabling better insights en automation."
      },
      {
        question: "Welke authenticatie methode gebruik je best voor Salesforce integraties?",
        options: [
          "Basic Authentication met username/password",
          "API Key authentication",
          "OAuth 2.0 flow",
          "No authentication needed"
        ],
        correctAnswer: 2,
        explanation: "OAuth 2.0 is de recommended approach voor secure Salesforce integraties."
      }
    ]
  },
  exercises: [
    {
      title: "Lead Scoring Automation",
      description: "Implementeer een systeem dat automatisch leads scoort op basis van hun interacties en bedrijfsdata.",
      difficulty: "intermediate",
      estimatedTime: "45 minuten"
    }
  ]
}