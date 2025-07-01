import { Lesson } from '@/lib/data/courses';

export const lesson3_2: Lesson = {
  id: 'lesson-3-2',
  title: 'Advanced prompt engineering voor automations',
  duration: '35 min',
  content: `
# Advanced prompt engineering voor automations

## Introductie

Effectieve prompt engineering is cruciaal voor het bouwen van betrouwbare AI-gestuurde workflows. In deze les leer je geavanceerde technieken om consistente, contextuele en gestructureerde outputs te genereren voor automatiseringsprocessen. We behandelen system prompts, dynamische templates, context injection, output formatting en chain-of-thought reasoning.

## System prompts voor consistentie

System prompts definiëren de rol en het gedrag van de AI voor de gehele conversatie of workflow. Ze zorgen voor consistente outputs ongeacht de variaties in user inputs.

### Basis system prompt structuur

\`\`\`
You are [ROLE] with expertise in [DOMAIN].
Your primary objective is [GOAL].
You must always [CONSTRAINTS].
Your outputs should be [FORMAT/STYLE].
\`\`\`

### Customer service system prompt

\`\`\`
You are a professional customer service representative for an e-commerce platform.
Your primary objective is to resolve customer issues efficiently while maintaining a friendly and helpful tone.

You must always:
- Address customers by name when provided
- Acknowledge their concerns empathetically
- Provide clear, actionable solutions
- Follow company policies strictly
- Escalate complex issues when necessary

Your responses should be:
- Professional yet warm
- Concise (max 150 words unless explaining procedures)
- Solution-oriented
- Free of technical jargon
\`\`\`

### Content generation system prompt

\`\`\`
You are an expert content writer specializing in SEO-optimized blog posts.
Your primary objective is to create engaging, informative content that ranks well in search engines.

You must always:
- Include the target keyword naturally 3-5 times
- Write in active voice
- Use short paragraphs (max 3 sentences)
- Include relevant statistics and examples
- Maintain a conversational yet authoritative tone

Your outputs should follow this structure:
1. Engaging introduction with hook
2. Clear H2 and H3 subheadings
3. Bullet points for easy scanning
4. Strong call-to-action conclusion
\`\`\`

## Dynamische prompt templates

Dynamische templates maken het mogelijk om variabele data in prompts te injecteren terwijl de structuur consistent blijft.

### Template structuur

\`\`\`javascript
const promptTemplate = \`
Analyze the following customer feedback:
Customer: {{customerName}}
Product: {{productName}}
Rating: {{rating}}/5
Comment: {{comment}}

Based on this feedback:
1. Identify the main concern
2. Determine sentiment (positive/neutral/negative)
3. Suggest appropriate response
4. Flag if escalation needed
\`;

// Gebruik in workflow
const filledPrompt = promptTemplate
  .replace('{{customerName}}', data.customer_name)
  .replace('{{productName}}', data.product)
  .replace('{{rating}}', data.rating)
  .replace('{{comment}}', data.feedback_text);
\`\`\`

### Geavanceerde template met condities

\`\`\`javascript
const advancedTemplate = \`
Generate a personalized email for:
Customer: {{customerName}}
Account Type: {{accountType}}
Last Purchase: {{lastPurchase}}
{{#if isVIP}}
VIP Status: Gold Member
Special Offers: Include exclusive VIP discount
{{/if}}

{{#if hasAbandonedCart}}
Cart Items: {{cartItems}}
Reminder: Mention items in cart
{{/if}}

Tone: {{accountType === 'premium' ? 'formal' : 'casual'}}
Length: {{accountType === 'premium' ? 'detailed' : 'brief'}}
\`;
\`\`\`

## Context injection technieken

Context injection voegt relevante achtergrondinfomatie toe aan prompts voor betere resultaten.

### Historische context

\`\`\`javascript
const contextualPrompt = \`
Previous interactions summary:
\${previousInteractions.map(i => \`- \${i.date}: \${i.summary}\`).join('\\n')}

Current customer message: "\${currentMessage}"

Based on the interaction history and current message:
1. Reference relevant past interactions
2. Provide continuity in the conversation
3. Address any unresolved issues
4. Maintain consistent tone from previous agents
\`;
\`\`\`

### Domein-specifieke context

\`\`\`javascript
const domainContext = {
  companyPolicies: loadPolicies(),
  productCatalog: loadProducts(),
  commonIssues: loadFAQ(),
  seasonalInfo: getCurrentPromotions()
};

const enrichedPrompt = \`
System context:
- Return window: \${domainContext.companyPolicies.returnDays} days
- Current promotions: \${domainContext.seasonalInfo.active}
- Product availability: Check catalog

Customer query: "\${query}"

Respond using the above context to provide accurate information.
\`;
\`\`\`

## Output formatting technieken

Gestructureerde output formatting zorgt voor consistente, parsebare resultaten.

### JSON output format

\`\`\`javascript
const jsonFormatPrompt = \`
Analyze the customer support ticket and respond in the following JSON format:

{
  "ticketAnalysis": {
    "category": "technical|billing|shipping|other",
    "priority": "low|medium|high|critical",
    "sentiment": "positive|neutral|negative",
    "mainIssue": "brief description",
    "suggestedActions": ["action1", "action2", "action3"]
  },
  "customerResponse": {
    "greeting": "personalized greeting",
    "acknowledgment": "empathetic acknowledgment",
    "solution": "proposed solution",
    "nextSteps": "clear next steps",
    "closing": "professional closing"
  },
  "internalNotes": {
    "escalationNeeded": boolean,
    "estimatedResolutionTime": "time estimate",
    "additionalResourcesNeeded": ["resource1", "resource2"]
  }
}

Ensure all fields are populated and the JSON is valid.
\`;
\`\`\`

### Markdown output format

\`\`\`javascript
const markdownFormatPrompt = \`
Create a customer FAQ entry in markdown format:

# [Question as main heading]

## Quick Answer
[1-2 sentence direct answer]

## Detailed Explanation
[Comprehensive explanation with examples]

### Steps to Resolve (if applicable)
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Additional Resources
- [Link to related article]
- [Link to video tutorial]
- [Contact support if needed]

**Keywords:** [relevant, search, terms]
\`;
\`\`\`

## Chain-of-thought voor workflows

Chain-of-thought prompting verbetert de kwaliteit van complexe redeneringen in workflows.

### Basis chain-of-thought

\`\`\`javascript
const chainOfThoughtPrompt = \`
Customer complaint: "\${complaint}"

Let's analyze this step by step:

1. **Identify the core issue:**
   Think: What is the customer really upset about?
   
2. **Check for previous issues:**
   Think: Has this customer had similar problems before?
   
3. **Evaluate severity:**
   Think: How urgent is this? What's the potential impact?
   
4. **Consider solutions:**
   Think: What are all possible solutions? Which is most appropriate?
   
5. **Determine escalation need:**
   Think: Can this be resolved at current level or needs escalation?

Based on this analysis, provide:
- Issue summary
- Recommended solution
- Escalation decision
- Customer response draft
\`;
\`\`\`

### Complex workflow reasoning

\`\`\`javascript
const workflowReasoningPrompt = \`
New order details:
- Customer tier: \${customerTier}
- Order value: \${orderValue}
- Shipping destination: \${destination}
- Special requirements: \${requirements}

Step-by-step workflow determination:

1. **Customer Tier Analysis:**
   - If VIP → Priority processing path
   - If Regular → Standard processing path
   - If New → First-order welcome path

2. **Order Value Consideration:**
   - If > $500 → Add fraud check step
   - If > $1000 → Add manual review step
   - If < $50 → Express processing eligible

3. **Shipping Complexity:**
   - International? → Add customs documentation
   - Fragile items? → Add special packaging step
   - Express shipping? → Route to priority fulfillment

4. **Special Requirements Check:**
   - Gift wrapping? → Add gift service step
   - Custom message? → Add personalization step
   - B2B order? → Add invoice generation step

Based on this analysis, recommend the optimal workflow path and list all required steps in order.
\`;
\`\`\`

## Praktijkvoorbeelden

### Customer service automation

\`\`\`javascript
// Complete customer service workflow prompt
const customerServiceWorkflow = \`
System: You are an AI customer service agent for TechStore.com.

Context:
- Current date: \${new Date().toISOString()}
- Customer data: \${JSON.stringify(customerData)}
- Order history: \${JSON.stringify(orderHistory)}
- Current inventory: \${JSON.stringify(inventory)}

Task: Handle the following customer inquiry:
"\${customerInquiry}"

Required analysis:
1. Categorize the inquiry type
2. Check relevant policies
3. Verify customer information
4. Propose solution(s)
5. Draft response

Output format:
{
  "analysis": {
    "inquiryType": "",
    "customerStatus": "",
    "applicablePolicies": [],
    "possibleSolutions": []
  },
  "response": {
    "greeting": "",
    "acknowledgment": "",
    "solution": "",
    "additionalInfo": "",
    "closing": ""
  },
  "followUp": {
    "required": boolean,
    "timeline": "",
    "assignTo": ""
  }
}
\`;
\`\`\`

### Content generation automation

\`\`\`javascript
// Blog post generation workflow
const contentGenerationWorkflow = \`
Role: Expert content strategist and SEO specialist

Content brief:
- Topic: \${topic}
- Target keyword: \${keyword}
- Word count: \${wordCount}
- Target audience: \${audience}
- Competitor URLs: \${competitorArticles}

Step-by-step content creation:

1. **Research Phase:**
   - Analyze competitor articles for gaps
   - Identify unique angles
   - List must-include subtopics

2. **Outline Creation:**
   - H1: Compelling title with keyword
   - H2s: 4-6 main sections
   - H3s: Supporting subsections

3. **Content Development:**
   - Introduction: Hook + preview
   - Body: Comprehensive coverage
   - Examples: Real-world applications
   - Conclusion: Summary + CTA

4. **SEO Optimization:**
   - Keyword density: 1-2%
   - Meta description: 155 chars
   - Internal linking opportunities
   - Schema markup suggestions

Generate the complete article following these guidelines.
\`;
\`\`\`

## Best practices voor automation prompts

1. **Iteratieve verfijning**: Test en verbeter prompts continu
2. **Versiecontrole**: Houd verschillende versies bij voor A/B testing
3. **Error handling**: Bouw fallbacks in voor onverwachte outputs
4. **Monitoring**: Track performance metrics van verschillende prompts
5. **Documentatie**: Documenteer prompt changes en rationale

## Oefening: Bouw je eigen automation prompt

Creëer een complete prompt engineering setup voor een van deze use cases:
1. Geautomatiseerde product review analyse
2. Lead qualification workflow
3. Content curation systeem
4. Meeting notes summarizer

Include system prompt, dynamic templates, context injection, output formatting, en chain-of-thought elementen.
        `,
  codeExamples: [
    {
      id: 'customer-service-prompt',
      title: 'Customer Service System Prompt Implementation',
      language: 'javascript',
      code: `// N8N Function Node - Customer Service System
const systemPrompt = \`You are a professional customer service AI assistant for TechStore.
Your role is to help customers with product inquiries, order issues, and technical support.

Core principles:
- Always be helpful, empathetic, and professional
- Acknowledge customer emotions before providing solutions
- Use simple language, avoid technical jargon
- Escalate when: refund > $200, legal issues, repeated complaints
- Maximum response length: 150 words unless explaining procedures\`;

const customerData = {
  name: items[0].json.customerName,
  email: items[0].json.customerEmail,
  orderHistory: items[0].json.orders,
  previousTickets: items[0].json.supportHistory,
  vipStatus: items[0].json.customerTier === 'VIP'
};

const enhancedPrompt = \`
\${systemPrompt}

Customer Information:
- Name: \${customerData.name}
- Account Type: \${customerData.vipStatus ? 'VIP Gold' : 'Standard'}
- Previous Issues: \${customerData.previousTickets.length}
- Total Orders: \${customerData.orderHistory.length}

Current Issue: "\${items[0].json.customerMessage}"

Provide a response that:
1. Addresses the customer by name
2. Shows understanding of their issue
3. Offers a clear solution or next steps
4. Maintains our brand voice
\`;

return { prompt: enhancedPrompt };`
    },
    {
      id: 'dynamic-template-engine',
      title: 'Dynamic Template Engine for Content Generation',
      language: 'javascript',
      code: `// Make.com Custom JavaScript Module
const contentTemplate = {
  blogPost: \`Write a {{wordCount}}-word blog post about {{topic}}.

Target audience: {{audience}}
Primary keyword: "{{keyword}}"
Secondary keywords: {{secondaryKeywords}}
Tone: {{tone}}
Call-to-action: {{cta}}

Structure requirements:
- Introduction with compelling hook
- {{sectionCount}} main sections with H2 headings
- Include {{exampleCount}} real-world examples
- Add statistics from reputable sources
- Conclusion with clear CTA

SEO requirements:
- Use primary keyword in first paragraph
- Include keyword naturally {{keywordDensity}} times
- Meta description (155 chars): focus on {{metaFocus}}
- Suggest {{internalLinks}} internal linking opportunities\`,

  socialMedia: \`Create {{platform}} content for {{campaign}}.

Brand voice: {{brandVoice}}
Hashtags: {{hashtags}}
Media type: {{mediaType}}
Character limit: {{charLimit}}

Content should:
- Grab attention in first {{hookLength}} characters
- Include {{emojiCount}} relevant emojis
- Drive engagement through {{engagementType}}
- Include trackable link: {{trackingUrl}}\`,

  email: \`Draft a {{emailType}} email for {{segment}}.

Subject line requirements:
- Maximum {{subjectLength}} characters
- Include {{personalization}} element
- Create urgency: {{urgencyType}}

Email body:
- Greeting: {{greetingStyle}}
- Main message: {{messageGoal}}
- Supporting points: {{bulletPoints}}
- CTA: {{ctaText}}
- Sign-off: {{signOffStyle}}\`
};

// Template processor function
function processTemplate(templateType, variables) {
  let template = contentTemplate[templateType];
  
  if (!template) {
    throw new Error(\`Template type "\${templateType}" not found\`);
  }
  
  // Replace all variables
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(\`{{\\\\s*\${key}\\\\s*}}\`, 'g');
    template = template.replace(regex, variables[key]);
  });
  
  // Check for missing variables
  const missingVars = template.match(/{{\\s*\\w+\\s*}}/g);
  if (missingVars) {
    console.warn('Missing variables:', missingVars);
  }
  
  return template;
}

// Example usage
const blogPrompt = processTemplate('blogPost', {
  wordCount: 1500,
  topic: 'AI in Customer Service',
  audience: 'Business decision makers',
  keyword: 'AI customer service',
  secondaryKeywords: ['chatbots', 'automation', 'customer experience'],
  tone: 'professional yet conversational',
  cta: 'Schedule a demo',
  sectionCount: 5,
  exampleCount: 3,
  keywordDensity: 6,
  metaFocus: 'ROI and efficiency',
  internalLinks: 3
});

return { processedPrompt: blogPrompt };`
    },
    {
      id: 'context-aware-prompt',
      title: 'Context-Aware Prompt with Memory',
      language: 'javascript',
      code: `// Advanced context injection system
class ContextAwarePromptBuilder {
  constructor() {
    this.context = {
      conversation: [],
      customerProfile: {},
      companyKnowledge: {},
      currentSession: {}
    };
  }
  
  // Load historical context
  async loadContext(customerId) {
    // Fetch from database/API
    this.context.customerProfile = await this.fetchCustomerProfile(customerId);
    this.context.conversation = await this.fetchConversationHistory(customerId);
    this.context.companyKnowledge = await this.loadCompanyKB();
    
    return this;
  }
  
  // Build context summary
  buildContextSummary() {
    const recentInteractions = this.context.conversation
      .slice(-5)
      .map(c => \`\${c.date}: \${c.summary}\`)
      .join('\\n');
    
    const relevantPolicies = this.extractRelevantPolicies();
    const customerPreferences = this.extractPreferences();
    
    return \`
HISTORICAL CONTEXT:
Recent Interactions:
\${recentInteractions}

Customer Preferences:
- Communication style: \${customerPreferences.communicationStyle}
- Product interests: \${customerPreferences.interests.join(', ')}
- Pain points: \${customerPreferences.painPoints.join(', ')}

Relevant Policies:
\${relevantPolicies.map(p => \`- \${p.name}: \${p.summary}\`).join('\\n')}

Current Context:
- Session duration: \${this.context.currentSession.duration} minutes
- Previous topics: \${this.context.currentSession.topics.join(', ')}
- Sentiment trend: \${this.context.currentSession.sentimentTrend}
    \`;
  }
  
  // Generate contextual prompt
  generatePrompt(userMessage, requirements = {}) {
    const contextSummary = this.buildContextSummary();
    const systemInstructions = this.getSystemInstructions(requirements);
    
    return \`
\${systemInstructions}

\${contextSummary}

Current Customer Message: "\${userMessage}"

Based on the context and history:
1. Reference relevant past interactions naturally
2. Acknowledge any ongoing issues
3. Personalize based on known preferences
4. Maintain continuity with previous conversations
5. Proactively address likely follow-up questions

Response Requirements:
- Tone: \${requirements.tone || 'Maintain previous tone'}
- Length: \${requirements.maxLength || '150 words'}
- Include: \${requirements.mustInclude || 'Relevant information'}
- Format: \${requirements.format || 'Conversational'}
    \`;
  }
  
  // Extract relevant policies based on message
  extractRelevantPolicies() {
    // Smart extraction logic
    return this.context.companyKnowledge.policies
      .filter(policy => this.isRelevant(policy))
      .slice(0, 3);
  }
  
  // Extract customer preferences
  extractPreferences() {
    const messages = this.context.conversation;
    return {
      communicationStyle: this.detectCommunicationStyle(messages),
      interests: this.detectInterests(messages),
      painPoints: this.detectPainPoints(messages)
    };
  }
}

// Usage in workflow
const promptBuilder = new ContextAwarePromptBuilder();
await promptBuilder.loadContext(customerId);

const contextualPrompt = promptBuilder.generatePrompt(
  customerMessage,
  {
    tone: 'empathetic',
    maxLength: 200,
    mustInclude: ['next steps', 'timeline'],
    format: 'structured'
  }
);

return { 
  prompt: contextualPrompt,
  context: promptBuilder.context 
};`
    },
    {
      id: 'chain-of-thought-engine',
      title: 'Chain-of-Thought Reasoning Engine',
      language: 'javascript',
      code: `// Chain-of-thought prompt system for complex decision making
const chainOfThoughtSystem = {
  // Main reasoning prompt
  analyzeCustomerRequest: (request, context) => \`
Let me analyze this customer request step by step.

CUSTOMER REQUEST: "\${request}"

THINKING PROCESS:

Step 1: Understanding the Core Issue
- What is the customer explicitly asking for?
- What might they be implying but not directly stating?
- What emotions are they expressing?

Initial thoughts: [Reasoning about the above]

Step 2: Context Analysis
- Customer history: \${context.previousIssues} previous issues
- Account value: $\${context.lifetimeValue}
- Current status: \${context.accountStatus}

How does this context affect our approach? [Reasoning]

Step 3: Solution Exploration
Let me consider possible solutions:
- Option A: [Description] - Pros: [List] Cons: [List]
- Option B: [Description] - Pros: [List] Cons: [List]
- Option C: [Description] - Pros: [List] Cons: [List]

Best option analysis: [Reasoning for choice]

Step 4: Risk Assessment
- What could go wrong with the chosen solution?
- What are the business implications?
- Does this need escalation?

Risk evaluation: [Detailed reasoning]

Step 5: Implementation Plan
Based on my analysis:
1. Immediate action: [What to do now]
2. Follow-up required: [What needs to happen next]
3. Documentation: [What to record]

FINAL RECOMMENDATION:
[Clear, actionable recommendation based on the analysis above]
  \`,
  
  // Content strategy reasoning
  planContentStrategy: (brief, data) => \`
Let's develop a content strategy through systematic reasoning.

CONTENT BRIEF: \${JSON.stringify(brief)}
MARKET DATA: \${JSON.stringify(data)}

STRATEGIC THINKING:

Phase 1: Audience Analysis
- Who exactly are we targeting? [Define personas]
- What are their pain points? [List and prioritize]
- Where do they consume content? [Channels and formats]
- When are they most active? [Timing insights]

Audience insights: [Synthesized understanding]

Phase 2: Competitive Landscape
- What content already exists? [Gap analysis]
- What's performing well? [Success patterns]
- What's missing? [Opportunities]

Competitive advantage: [How we'll differentiate]

Phase 3: Content Pillar Development
Considering our audience and competition:
- Pillar 1: [Topic] because [reasoning]
- Pillar 2: [Topic] because [reasoning]
- Pillar 3: [Topic] because [reasoning]

Content calendar logic: [How pillars interconnect]

Phase 4: Format and Channel Strategy
For each pillar, optimal formats:
- Blog posts: [Which topics and why]
- Videos: [Which topics and why]
- Infographics: [Which topics and why]
- Social media: [Which topics and why]

Distribution reasoning: [Channel-specific strategies]

Phase 5: Measurement Framework
Success metrics by objective:
- Awareness: [Metrics and targets]
- Engagement: [Metrics and targets]
- Conversion: [Metrics and targets]

KPI justification: [Why these metrics matter]

STRATEGIC RECOMMENDATION:
[Comprehensive strategy based on the analysis]
  \`,
  
  // Workflow optimization reasoning
  optimizeWorkflow: (currentWorkflow, constraints) => \`
I'll analyze this workflow for optimization opportunities.

CURRENT WORKFLOW: \${JSON.stringify(currentWorkflow)}
CONSTRAINTS: \${JSON.stringify(constraints)}

OPTIMIZATION ANALYSIS:

Step 1: Bottleneck Identification
Looking at each step:
\${currentWorkflow.steps.map((step, i) => \`
- Step \${i + 1} (\${step.name}):
  Duration: \${step.duration}
  Dependencies: \${step.dependencies}
  Bottleneck score: [Calculate based on duration and dependencies]
\`).join('\\n')}

Critical path: [Identify the longest necessary sequence]

Step 2: Parallel Processing Opportunities
Can any steps run simultaneously?
- [Step A] and [Step B] because [no dependencies]
- [Step C] and [Step D] because [different resources]

Parallelization impact: [Time savings calculation]

Step 3: Automation Potential
Which manual steps can be automated?
\${currentWorkflow.steps.filter(s => s.manual).map(s => \`
- \${s.name}: 
  Automation feasibility: [High/Medium/Low]
  Required tools: [List]
  ROI estimate: [Time/cost savings]
\`).join('\\n')}

Step 4: Resource Optimization
Current resource allocation:
- Over-utilized: [Resources working > 80%]
- Under-utilized: [Resources working < 50%]
- Rebalancing opportunities: [Specific suggestions]

Step 5: Error Reduction Strategy
Common failure points:
- [Failure point 1]: Prevention strategy: [Approach]
- [Failure point 2]: Prevention strategy: [Approach]

Reliability improvement: [Expected reduction in errors]

OPTIMIZED WORKFLOW PROPOSAL:
[Detailed new workflow with reasoning for each change]

EXPECTED IMPROVEMENTS:
- Time reduction: [X]%
- Cost savings: $[Y]
- Error rate decrease: [Z]%
- Resource utilization: [Optimized distribution]
  \`
};

// Usage example
const reasoningResult = chainOfThoughtSystem.analyzeCustomerRequest(
  "I ordered 3 items but only received 2, and the website won't let me report it",
  {
    previousIssues: 2,
    lifetimeValue: 3500,
    accountStatus: 'VIP Gold'
  }
);

return { 
  analysis: reasoningResult,
  confidence: 0.92,
  requiresReview: false 
};`
    }
  ],
  assignments: [
    {
      id: 'assignment-3-2-1',
      title: 'Customer Service Automation System',
      description: 'Bouw een complete customer service automation workflow met geavanceerde prompt engineering. Het systeem moet tickets categoriseren, sentiment analyseren, en gepersonaliseerde responses genereren. Requirements: Implementeer system prompts voor verschillende service scenarios, creëer dynamische templates voor email responses, bouw context injection voor customer history, gebruik chain-of-thought voor complexe issues, en implementeer JSON output formatting voor integratie.',
      difficulty: 'medium',
      type: 'project',
      hints: [
        'Begin met het definiëren van verschillende customer service categorieën',
        'Gebruik conditional logic in je templates voor personalisatie',
        'Test verschillende prompt variaties voor optimale resultaten'
      ]
    },
    {
      id: 'assignment-3-2-2',
      title: 'Content Generation Pipeline',
      description: 'Ontwikkel een geavanceerde content generation pipeline die SEO-geoptimaliseerde blog posts genereert op basis van keywords en competitor analyse. Requirements: Creëer system prompts voor verschillende content types, bouw template engine met variable injection, implementeer competitor gap analysis, gebruik chain-of-thought voor content strategie, en genereer gestructureerde output met metadata.',
      difficulty: 'hard',
      type: 'project',
      hints: [
        'Maak gebruik van iteratieve prompting voor betere kwaliteit',
        'Implementeer quality checks in je workflow',
        'Gebruik examples in je prompts voor betere resultaten'
      ]
    }
  ],
  resources: [
    {
      title: 'OpenAI Prompt Engineering Guide',
      url: 'https://platform.openai.com/docs/guides/prompt-engineering',
      type: 'documentation'
    },
    {
      title: 'Anthropic Prompt Engineering Interactive Tutorial',
      url: 'https://github.com/anthropics/prompt-engineering-interactive-tutorial',
      type: 'tutorial'
    },
    {
      title: 'Chain-of-Thought Prompting Research Paper',
      url: 'https://arxiv.org/abs/2201.11903',
      type: 'research'
    },
    {
      title: 'Prompt Engineering Best Practices',
      url: 'https://www.promptingguide.ai/',
      type: 'guide'
    }
  ]
};