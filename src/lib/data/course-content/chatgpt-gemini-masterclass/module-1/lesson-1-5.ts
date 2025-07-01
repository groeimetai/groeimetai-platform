import type { Lesson } from '@/lib/data/courses'

export const lesson1_5: Lesson = {
  id: 'lesson-1-5',
  title: 'Advanced prompt engineering',
  duration: '90 minuten',
  content: `# Advanced prompt engineering

## Van basics naar meesterschap

Prompt engineering is geëvolueerd van simpele instructies naar een verfijnde discipline. Met de komst van o3, Gemini 2.0, en Claude 3.5, zijn de mogelijkheden exponentieel gegroeid. Deze les leert je de nieuwste technieken.

## Model-specifieke optimalisaties

### GPT-4/o3 Optimalisaties

#### System prompts voor GPT-4
\`\`\`
System: You are an expert [role] with deep knowledge in [domain].
Your responses should be:
- Technically accurate and well-researched
- Structured with clear headings and sections
- Include relevant examples and code when applicable
- Consider edge cases and potential issues
- Cite sources when making factual claims

Personality traits:
- Professional yet approachable
- Detail-oriented but concise
- Proactive in suggesting improvements
- Honest about limitations
\`\`\`

#### o3 Reasoning triggers
\`\`\`
Voor maximale reasoning:
"Think deeply about this problem. Consider multiple approaches,
evaluate trade-offs, and show your reasoning process.
If you notice any inconsistencies in your thinking, correct them.
After reaching a conclusion, double-check your logic."
\`\`\`

### Gemini-specifieke technieken

#### Gemini's JSON mode
\`\`\`python
prompt = """
Extract product information and return as JSON:

{
  "name": "product name",
  "price": numeric value,
  "features": ["feature1", "feature2"],
  "availability": boolean,
  "ratings": {
    "average": float,
    "count": integer
  }
}

Product description: [your text here]
"""

# Gemini zal perfect gestructureerde JSON retourneren
\`\`\`

#### Thinking mode activation
\`\`\`
Voor Gemini 2.0 Flash Thinking:
"I need you to think through this systematically.
Show me your reasoning process in detail.
Consider edge cases and potential issues.
[Your actual question/task]"
\`\`\`

### Claude-specifieke aanpak

#### Claude's XML tags
\`\`\`xml
<task>
Analyze this codebase for security vulnerabilities
</task>

<context>
- Language: Python
- Framework: Django
- Focus areas: Authentication, SQL injection, XSS
</context>

<requirements>
- List vulnerabilities by severity
- Provide code examples
- Suggest fixes with explanations
</requirements>
\`\`\`

## Geavanceerde prompting patterns

### 1. Role-Based Prompting (RBP)

#### Expert Ensemble
\`\`\`
You will play three expert roles to solve this problem:

1. As a [Role 1], analyze the [aspect 1]
2. As a [Role 2], evaluate the [aspect 2]
3. As a [Role 3], synthesize and recommend

Problem: [detailed description]

Provide each expert's perspective, then a unified recommendation.
\`\`\`

#### Dynamic Role Switching
\`\`\`
Start as a strategic consultant to understand the business need.
Switch to a technical architect for the solution design.
Become a project manager for the implementation plan.
Finally, act as a quality analyst to identify risks.

Business need: [description]
\`\`\`

### 2. Structured Output Patterns

#### The STAR Method
\`\`\`
Analyze this case using STAR:

Situation: [Current state and context]
Task: [What needs to be accomplished]
Action: [Specific steps to take]
Result: [Expected outcomes and metrics]

Case: [your scenario]
\`\`\`

#### Decision Matrix Pattern
\`\`\`
Create a decision matrix for [decision]:

| Option | Pros | Cons | Cost | Time | Risk | Score |
|--------|------|------|------|------|------|-------|
| A      |      |      |      |      |      |       |
| B      |      |      |      |      |      |       |
| C      |      |      |      |      |      |       |

Weight factors: Cost (30%), Time (20%), Risk (50%)
Recommend the best option with justification.
\`\`\`

### 3. Iterative Refinement Patterns

#### Progressive Elaboration
\`\`\`
Level 1: Give me a one-sentence summary of [topic]
Level 2: Expand to a paragraph with key points
Level 3: Provide detailed sections with examples
Level 4: Add edge cases and advanced considerations
Level 5: Include implementation guide and best practices
\`\`\`

#### Socratic Method
\`\`\`
Help me understand [concept] through questions:

1. Start with fundamental questions
2. I'll answer each question
3. Based on my answers, ask deeper follow-ups
4. Guide me to discover the key insights
5. Summarize what I've learned

Begin with your first question.
\`\`\`

### 4. Meta-Prompting Patterns

#### Self-Improving Prompts
\`\`\`
Task: [initial task description]

After completing the task:
1. Critique your own response
2. Identify 3 areas for improvement
3. Provide an enhanced version
4. Explain what made v2 better
\`\`\`

#### Prompt Optimization
\`\`\`
Original prompt: "[your basic prompt]"

Optimize this prompt by:
1. Adding clarifying constraints
2. Specifying output format
3. Including quality criteria
4. Adding examples if helpful

Show: Original → Optimized → Explanation
\`\`\`

## System Prompts Mastery

### Layered System Prompts

#### Base Layer
\`\`\`
Core Identity: You are [role] specializing in [domain].
Primary Objective: [main goal]
Key Principles: [list 3-5 principles]
\`\`\`

#### Behavioral Layer
\`\`\`
Communication Style:
- Tone: [professional/casual/academic]
- Detail Level: [high/moderate/summary]
- Examples: [always/when helpful/minimal]

Response Structure:
- Start with: [summary/context/direct answer]
- Include: [examples/visuals/code]
- End with: [next steps/questions/summary]
\`\`\`

#### Constraint Layer
\`\`\`
Boundaries:
- Never: [list prohibited actions]
- Always: [list required actions]
- Verify: [list things to double-check]

Edge Cases:
- If unclear: [ask for clarification]
- If impossible: [explain limitations]
- If harmful: [refuse with explanation]
\`\`\`

### Dynamic System Prompts

#### Context-Aware Systems
\`\`\`python
def generate_system_prompt(context):
    base = "You are an AI assistant specializing in {domain}."
    
    if context.technical_level == "beginner":
        base += " Explain concepts simply with analogies."
    elif context.technical_level == "expert":
        base += " Use technical terminology and assume deep knowledge."
    
    if context.task_type == "analysis":
        base += " Focus on data-driven insights and patterns."
    elif context.task_type == "creative":
        base += " Emphasize innovative solutions and alternatives."
    
    return base.format(domain=context.domain)
\`\`\`

## Advanced Techniques

### 1. Chain Prompting

#### Sequential Processing
\`\`\`
Prompt 1: "List all stakeholders for [project]"
→ Output: Stakeholder list

Prompt 2: "For each stakeholder from above, identify:
- Primary concerns
- Success metrics
- Potential objections"
→ Output: Stakeholder analysis

Prompt 3: "Based on the analysis, create a communication plan
that addresses each stakeholder's needs"
→ Output: Tailored communication strategy
\`\`\`

### 2. Conditional Prompting

#### If-Then Logic
\`\`\`
Analyze this business model:

IF profitable:
  - Suggest scaling strategies
  - Identify growth bottlenecks
  - Recommend investment areas

ELIF break-even:
  - Find efficiency improvements
  - Identify revenue opportunities
  - Suggest cost optimizations

ELSE (losing money):
  - Diagnose root causes
  - Propose pivot options
  - Create turnaround plan

Business data: [details]
\`\`\`

### 3. Recursive Prompting

#### Self-Referential Analysis
\`\`\`
Generate a solution for [problem].

Now:
1. Identify assumptions in your solution
2. Challenge each assumption
3. Generate alternative solution without those assumptions
4. Compare both solutions
5. Create hybrid approach using best elements

Repeat if new assumptions are found.
\`\`\`

### 4. Adversarial Prompting

#### Devil's Advocate
\`\`\`
Proposal: [your idea]

Round 1: Present the strongest case FOR this proposal
Round 2: Present the strongest case AGAINST it
Round 3: Address each criticism with counter-arguments
Round 4: Synthesize a balanced recommendation

Be genuinely critical, not superficial.
\`\`\``,
  assignments: [
    {
      id: 'assignment-1-5-1',
      title: 'Bouw een Master System Prompt',
      description: 'Creëer een herbruikbare system prompt voor een van je eigen use cases.',
      difficulty: 'hard',
      type: 'project',
      initialCode: `// Gebruik de Master System Prompt Template uit de les.

// 1. Kies een specifieke rol en domein (bijv. 'expert software architect in cloud-native applicaties').
// 2. Vul alle secties van de template in met relevante informatie.
// 3. Test de system prompt met een aantal complexe vragen.
// 4. Verfijn de prompt op basis van de resultaten.
`,
      hints: [
        'Wees zo specifiek mogelijk in de beschrijving van de rol en competenties.',
        'De operating principles helpen het model om consistent gedrag te vertonen.',
        'Test de prompt met vragen die de grenzen van de expertise opzoeken.'
      ]
    },
    {
      id: 'assignment-1-5-2',
      title: 'Implementeer een Multi-Stage Reasoning Workflow',
      description: 'Pas het multi-stage reasoning pattern toe op een complex probleem.',
      difficulty: 'expert',
      type: 'project',
      initialCode: `// Kies een complex probleem, bijv. "Hoe kan een bedrijf zijn CO2-uitstoot met 50% verminderen in 5 jaar?".

// 1. Gebruik de 5-staps reasoning prompt template uit de les.
// 2. Voer elke stap uit als een aparte prompt, waarbij je de output van de vorige stap gebruikt als input voor de volgende.
// 3. Analyseer hoe de kwaliteit van het eindresultaat verbetert door de gestructureerde aanpak.
`,
      hints: [
        'Zorg ervoor dat elke stap een duidelijke en afgebakende taak heeft.',
        'De output van de ene stap moet naadloos aansluiten op de input van de volgende.',
        'Vergelijk het eindresultaat met een enkele, ongestructureerde prompt om het verschil te zien.'
      ]
    }
  ],
  codeExamples: [
    {
      id: 'example-1',
      title: 'Master System Prompt Template',
      language: 'text',
      code: `# Ultimate System Prompt Template

You are {role_name}, a {experience_level} expert in {domain_expertise}.

## Core Competencies
- Primary: {main_skill_1}, {main_skill_2}, {main_skill_3}
- Secondary: {support_skill_1}, {support_skill_2}
- Tools: {tool_1}, {tool_2}, {tool_3}

## Operating Principles
1. {principle_1}: {explanation}
2. {principle_2}: {explanation}
3. {principle_3}: {explanation}

## Communication Protocol
- Tone: {tone_descriptor} - {tone_example}
- Structure: {structure_preference}
- Detail Level: {detail_setting}
- Examples: {example_frequency}

## Response Framework
BEGIN each response with:
- Context acknowledgment
- Approach outline (if complex)

BODY should include:
- Clear sections with headers
- Concrete examples when applicable
- Trade-offs for decisions
- Edge case considerations

END each response with:
- Summary of key points
- Actionable next steps
- Relevant follow-up questions

## Quality Standards
- Accuracy: Verify facts, acknowledge uncertainty
- Completeness: Address all aspects of queries
- Clarity: Use appropriate technical level
- Practicality: Provide implementable solutions

## Ethical Guidelines
- Privacy: Never request or store personal data
- Bias: Acknowledge and mitigate biases
- Harm: Refuse requests that could cause harm
- Honesty: Admit limitations and unknowns

## Special Instructions
{any_unique_requirements}

## Example Interaction
User: {example_query}
Assistant: {example_response_style}

Remember: {key_reminder}`,
      explanation: 'Een comprehensive system prompt template die je kunt aanpassen voor elke use case. Vul de {placeholders} in met specifieke waarden.'
    },
    {
      id: 'example-2',
      title: 'Multi-Stage Reasoning Prompt',
      language: 'python',
      code: `# Advanced Multi-Stage Reasoning Pattern

STAGE_1_ANALYSIS = """
Analyze the following business problem:
{problem_description}

Break it down into:
1. Core challenge
2. Stakeholders affected
3. Current constraints
4. Success criteria
5. Risk factors
"""

STAGE_2_IDEATION = """
Based on your analysis, generate 5 diverse solutions:

For each solution provide:
- Approach name
- Key concept (1 sentence)
- Pros (top 3)
- Cons (top 3)
- Rough effort estimate
- Innovation score (1-10)

Ensure solutions range from conservative to innovative.
"""

STAGE_3_EVALUATION = """
Create a decision matrix comparing all 5 solutions:

Criteria (weighted):
- Feasibility (25%)
- Impact (30%)
- Cost (20%)
- Time to Market (15%)
- Risk Level (10%)

Score each 1-10 and calculate weighted totals.
"""

STAGE_4_DEEP_DIVE = """
For the top 2 solutions:

1. Implementation Roadmap
   - Phase 1: [Timeline, deliverables, resources]
   - Phase 2: [Timeline, deliverables, resources]
   - Phase 3: [Timeline, deliverables, resources]

2. Risk Mitigation Plan
   - Risk: [Description] → Mitigation: [Strategy]

3. Success Metrics
   - Short-term (3 months): [KPIs]
   - Medium-term (1 year): [KPIs]
   - Long-term (3 years): [KPIs]
"""

STAGE_5_SYNTHESIS = """
Final Recommendation:

Executive Summary:
- Recommended solution and why
- Expected ROI
- Critical success factors
- First 30-day action plan

Board-ready presentation outline:
1. Problem statement (1 slide)
2. Solution overview (2 slides)
3. Business case (2 slides)
4. Implementation plan (2 slides)
5. Risk & mitigation (1 slide)
6. Ask & next steps (1 slide)
"""

# Usage function
def multi_stage_reasoning(problem):
    results = {}
    
    # Each stage builds on previous
    results['analysis'] = prompt_gpt(STAGE_1_ANALYSIS.format(
        problem_description=problem
    ))
    
    results['solutions'] = prompt_gpt(STAGE_2_IDEATION + 
        f"\\n\\nBased on analysis: {results['analysis']}")
    
    results['evaluation'] = prompt_gpt(STAGE_3_EVALUATION + 
        f"\\n\\nEvaluating: {results['solutions']}")
    
    results['deep_dive'] = prompt_gpt(STAGE_4_DEEP_DIVE + 
        f"\\n\\nTop solutions from: {results['evaluation']}")
    
    results['recommendation'] = prompt_gpt(STAGE_5_SYNTHESIS + 
        f"\\n\\nSynthesizing all findings: {results}")
    
    return results`,
      explanation: 'Dit pattern leidt het model door 5 stages van reasoning, waarbij elke stage bouwt op de vorige. Perfect voor complexe business problemen.'
    },
    {
      id: 'example-3',
      title: 'Dynamic Prompt Adaptation',
      language: 'javascript',
      code: `// Dynamische prompt die zich aanpast aan user expertise en context

class AdaptivePromptGenerator {
  constructor() {
    this.userProfile = {
      expertise: 'unknown',
      preferences: {
        detailLevel: 'medium',
        exampleFrequency: 'moderate',
        visualPreference: false
      },
      history: []
    };
  }

  analyzeUserInput(input) {
    // Detecteer expertise niveau
    const technicalTerms = /API|algorithm|backend|scalability|latency/gi;
    const beginnerTerms = /what is|how do|explain|simple|basic/gi;
    
    const techMatches = input.match(technicalTerms)?.length || 0;
    const beginnerMatches = input.match(beginnerTerms)?.length || 0;
    
    if (techMatches > beginnerMatches * 2) {
      this.userProfile.expertise = 'expert';
    } else if (beginnerMatches > techMatches) {
      this.userProfile.expertise = 'beginner';
    } else {
      this.userProfile.expertise = 'intermediate';
    }
    
    // Detecteer gewenste detail niveau
    if (input.includes('detailed') || input.includes('comprehensive')) {
      this.userProfile.preferences.detailLevel = 'high';
    } else if (input.includes('summary') || input.includes('brief')) {
      this.userProfile.preferences.detailLevel = 'low';
    }
  }

  generatePrompt(userQuery) {
    this.analyzeUserInput(userQuery);
    
    let systemPrompt = this.buildSystemPrompt();
    let enhancedQuery = this.enhanceQuery(userQuery);
    
    return {
      system: systemPrompt,
      user: enhancedQuery
    };
  }

  buildSystemPrompt() {
    const expertisePrompts = {
      beginner: \`You are a patient teacher who explains complex concepts simply.
Use analogies and real-world examples. Avoid jargon unless necessary,
and always define technical terms when you use them.\`,
      
      intermediate: \`You are a knowledgeable consultant who balances depth with clarity.
Provide context for technical concepts but assume basic familiarity.
Include practical examples and implementation considerations.\`,
      
      expert: \`You are a senior expert engaging with a peer. Use precise technical
terminology, discuss trade-offs and edge cases, reference advanced patterns,
and assume deep domain knowledge.\`
    };

    const detailPrompts = {
      low: "Be concise. Focus on key points and actionable insights.",
      medium: "Provide balanced responses with essential details and examples.",
      high: "Be comprehensive. Include edge cases, alternatives, and deep dives."
    };

    return \`\${expertisePrompts[this.userProfile.expertise]}

Detail Level: \${detailPrompts[this.userProfile.preferences.detailLevel]}

Additional Instructions:
- Adapt your language to match the user's expertise level
- \${this.userProfile.preferences.visualPreference ? 
    'Include ASCII diagrams or structured visualizations when helpful' : 
    'Focus on clear textual explanations'}
- Learn from the conversation and adjust your style accordingly\`;
  }

  enhanceQuery(query) {
    const enhancements = {
      beginner: {
        prefix: "Please explain in simple terms: ",
        suffix: " Include a practical example I can relate to."
      },
      intermediate: {
        prefix: "I'd like to understand: ",
        suffix: " Please include implementation considerations."
      },
      expert: {
        prefix: "Analyze the following, considering advanced scenarios: ",
        suffix: " Discuss performance implications and architectural trade-offs."
      }
    };

    const enhancement = enhancements[this.userProfile.expertise];
    
    // Only enhance if the query doesn't already have these elements
    if (!query.toLowerCase().includes('explain') && 
        !query.toLowerCase().includes('analyze')) {
      return enhancement.prefix + query + enhancement.suffix;
    }
    
    return query;
  }

  updateFromFeedback(feedback) {
    // Leer van user feedback
    if (feedback.includes('too technical') || feedback.includes('simpler')) {
      this.userProfile.expertise = 'beginner';
    } else if (feedback.includes('more detail') || feedback.includes('deeper')) {
      this.userProfile.preferences.detailLevel = 'high';
    }
    
    // Track conversation geschiedenis
    this.userProfile.history.push({
      feedback,
      timestamp: new Date(),
      adjustments: this.userProfile
    });
  }
}

// Gebruik:
const promptGen = new AdaptivePromptGenerator();

// Eerste query
let prompt1 = promptGen.generatePrompt(
  "How do I optimize database queries?"
);
// Genereert intermediate-level prompt

// User feedback
promptGen.updateFromFeedback("That's too basic, I need advanced techniques");

// Volgende query
let prompt2 = promptGen.generatePrompt(
  "What about query optimization for distributed systems?"
);
// Genereert expert-level prompt met focus op advanced scenarios`,
      explanation: 'Een intelligent systeem dat prompts dynamisch aanpast op basis van user expertise, preferences, en conversation history.'
    }
  ],
  resources: [
    {
      title: 'Anthropic Prompt Engineering Guide',
      url: 'https://docs.anthropic.com/claude/docs/prompt-engineering',
      type: 'documentation'
    },
    {
      title: 'OpenAI Prompt Engineering',
      url: 'https://platform.openai.com/docs/guides/prompt-engineering',
      type: 'documentation'
    },
    {
      title: 'Google AI Prompt Gallery',
      url: 'https://ai.google.dev/prompts',
      type: 'examples'
    }
  ]
}