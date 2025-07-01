import { Lesson } from '@/lib/data/courses'

export const lesson2_1: Lesson = {
  id: 'lesson-2-1',
  title: 'Agent personas: Van rol naar karakter',
  duration: '35 min',
  content: `
# Agent Personas: Van Rol naar Karakter

Het creëren van effectieve agent personas is cruciaal voor het bouwen van productieve AI teams. In deze les transformeren we simpele rollen naar complete karakters met unieke perspectieven en werkstijlen.

## Waarom Agent Personas?

### Het Probleem met Generieke Agents
- **Gebrek aan focus**: Agents zonder duidelijke persona produceren generieke output
- **Inconsistente resultaten**: Zonder karakter variëren responses sterk
- **Slechte samenwerking**: Agents zonder identiteit werken niet effectief samen
- **Moeilijke debugging**: Onduidelijk waarom agents bepaalde beslissingen nemen

### De Kracht van Karakterisering
Een goed ontwikkelde persona zorgt voor:
- 🎯 **Consistente output** die past bij de rol
- 🧠 **Gespecialiseerde expertise** in het domein
- 🤝 **Natuurlijke samenwerking** tussen agents
- 📊 **Voorspelbaar gedrag** voor debugging

## Anatomie van een Agent Persona

### 1. Rol (Role)
De basis functie van de agent:
- **Wat**: Primaire verantwoordelijkheden
- **Waarom**: Doel binnen het team
- **Hoe**: Algemene aanpak

### 2. Achtergrond (Backstory)
Het verhaal dat de agent vorm geeft:
- **Ervaring**: Relevante expertise
- **Motivatie**: Wat drijft de agent
- **Perspectief**: Unieke kijk op problemen

### 3. Doelen (Goals)
Specifieke objectives:
- **Korte termijn**: Directe taken
- **Lange termijn**: Overkoepelende missie
- **Kwaliteitscriteria**: Wat is succes?

### 4. Werkstijl (Working Style)
Hoe de agent opereert:
- **Methodologie**: Systematisch vs creatief
- **Communicatie**: Formeel vs informeel
- **Besluitvorming**: Data-driven vs intuïtief

## Van Rol naar Persona

### Stap 1: Start met de Functie
Begin met een duidelijke functieomschrijving:
- Senior Software Engineer
- Marketing Specialist
- Data Analyst
- Project Manager

### Stap 2: Voeg Context Toe
Bouw een achtergrond:
- Aantal jaren ervaring
- Specialisaties
- Vorige projecten
- Successen en failures

### Stap 3: Definieer Persoonlijkheid
Geef karakter:
- Communicatiestijl
- Probleemaanpak
- Werkvoorkeuren
- Team dynamiek

### Stap 4: Creëer Motivatie
Waarom doet de agent dit werk?
- Persoonlijke drive
- Professionele ambities
- Waarden en principes

## Best Practices voor Persona Design

### 1. Wees Specifiek
❌ "Een ervaren developer"
✅ "Een senior Python developer met 10 jaar ervaring in fintech, gespecialiseerd in high-frequency trading systems"

### 2. Balanceer Realisme en Functionaliteit
- Realistisch genoeg voor natuurlijk gedrag
- Functioneel genoeg voor effectieve output
- Vermijd overdreven karaktertrekken

### 3. Complementaire Personas
Bouw teams met:
- Verschillende expertises
- Complementaire werkstijlen
- Diverse perspectieven
- Natuurlijke rolverdeling

### 4. Test en Itereer
- Monitor agent output
- Verfijn personas based op resultaten
- A/B test verschillende karakters
- Optimaliseer team dynamiek

## Common Persona Archetypes

### De Perfectionist
- **Sterkte**: Hoge kwaliteit output
- **Zwakte**: Kan traag zijn
- **Best voor**: Code review, quality assurance

### De Innovator
- **Sterkte**: Creatieve oplossingen
- **Zwakte**: Kan praktische constraints negeren
- **Best voor**: Brainstorming, concept development

### De Pragmatist
- **Sterkte**: Realistische, implementeerbare oplossingen
- **Zwakte**: Kan innovatie limiteren
- **Best voor**: Project planning, resource management

### De Analyst
- **Sterkte**: Data-driven beslissingen
- **Zwakte**: Kan paralysis by analysis hebben
- **Best voor**: Research, optimization

## Persona Templates

### Technical Expert Template
- **Role**: [Specific technical function]
- **Experience**: [Years] in [domains]
- **Specialization**: [Technologies/methods]
- **Approach**: [Methodical/Creative/Balanced]
- **Communication**: [Technical/Simplified/Adaptive]

### Business Professional Template
- **Role**: [Business function]
- **Background**: [Industry experience]
- **Focus**: [Metrics/Goals]
- **Style**: [Formal/Casual/Adaptive]
- **Decision Making**: [Data/Intuition/Hybrid]

## Vermijd Deze Valkuilen

### 1. Stereotypes
Vermijd platte, eendimensionale karakters

### 2. Tegenstrijdigheden
Zorg voor interne consistentie

### 3. Over-specificatie
Laat ruimte voor flexibiliteit

### 4. Irrelevante Details
Focus op functie-relevante eigenschappen
`,
  codeExamples: [
    {
      id: 'example-1',
      title: 'Basic Agent met Uitgebreide Persona',
      language: 'python',
      code: `from crewai import Agent, Task, Crew
from langchain.chat_models import ChatOpenAI

# Basis agent ZONDER persona
basic_developer = Agent(
    role="Developer",
    goal="Write code",
    llm=ChatOpenAI(model="gpt-4")
)

# Rijke agent MET persona
senior_developer = Agent(
    role="Senior Full-Stack Developer",
    goal="Design and implement scalable, maintainable software solutions while mentoring junior developers",
    backstory="""You are Sarah Chen, a senior full-stack developer with 12 years of experience 
    in building enterprise applications. You started your career at a startup and learned the 
    importance of clean, maintainable code the hard way when technical debt almost killed the company.
    
    Now you're passionate about:
    - Writing code that junior developers can understand and maintain
    - Building systems that scale without rewrites
    - Sharing knowledge through code reviews and documentation
    
    You have expertise in Python, JavaScript, and cloud architectures. You believe that the best 
    code is boring code - predictable, well-tested, and documented. You communicate in a friendly 
    but professional manner, always ready to explain complex concepts simply.""",
    verbose=True,
    allow_delegation=True,
    llm=ChatOpenAI(model="gpt-4", temperature=0.7)
)

# Complementaire agent met andere persona
junior_developer = Agent(
    role="Junior Developer",
    goal="Learn best practices while contributing to the codebase",
    backstory="""You are Alex Kumar, a junior developer with 1 year of experience, eager to learn 
    and improve. You graduated from a coding bootcamp and are passionate about web development.
    
    You ask clarifying questions when needed and always seek to understand the 'why' behind 
    technical decisions. You're not afraid to suggest new ideas but always defer to senior 
    team members' experience. You document everything you learn for future reference.""",
    verbose=True,
    llm=ChatOpenAI(model="gpt-4", temperature=0.8)
)`,
      explanation: 'Let op hoe de uitgebreide backstory direct impact heeft op hoe agents communiceren en beslissingen nemen. Sarah zal gedetailleerde, educatieve responses geven terwijl Alex meer vragen stelt.'
    },
    {
      id: 'example-2',
      title: 'Persona-Driven Team Dynamics',
      language: 'python',
      code: `# Marketing Team met Complementaire Personas
creative_director = Agent(
    role="Creative Director",
    goal="Develop innovative marketing campaigns that resonate emotionally with the target audience",
    backstory="""You are Marcus Williams, an award-winning creative director with 15 years in 
    advertising. You believe that great marketing tells a story that connects with people's hearts.
    
    Your approach:
    - Start with the emotional truth of the brand
    - Build narratives that people want to share
    - Push boundaries while respecting brand guidelines
    - Challenge data with creative intuition when needed
    
    You speak in vivid, descriptive language and often use metaphors to explain concepts.""",
    llm=ChatOpenAI(model="gpt-4", temperature=0.9)
)

data_analyst = Agent(
    role="Marketing Data Analyst", 
    goal="Provide data-driven insights to optimize campaign performance and ROI",
    backstory="""You are Dr. Priya Patel, a data analyst with a PhD in behavioral economics. 
    You transitioned to marketing to apply scientific rigor to understanding consumer behavior.
    
    Your methodology:
    - Every decision must be backed by data
    - A/B test everything, assume nothing
    - Correlation does not imply causation
    - Present data in clear, actionable insights
    
    You communicate precisely, always citing specific metrics and confidence intervals.""",
    llm=ChatOpenAI(model="gpt-4", temperature=0.3)
)

brand_strategist = Agent(
    role="Brand Strategist",
    goal="Ensure all marketing efforts align with brand identity and long-term business goals",
    backstory="""You are Jennifer Liu, a brand strategist who helps companies find their authentic 
    voice. With an MBA and psychology background, you bridge creative vision and business reality.
    
    Your focus:
    - Brand consistency across all touchpoints
    - Long-term brand equity over short-term gains
    - Balancing creativity with strategic objectives
    - Building bridges between creative and analytical minds
    
    You're diplomatic, often mediating between different perspectives to find optimal solutions.""",
    llm=ChatOpenAI(model="gpt-4", temperature=0.6)
)

# Team samenwerking met natuurlijke dynamiek
marketing_task = Task(
    description="Develop a campaign for our new sustainable product line targeting millennials",
    expected_output="Complete campaign strategy with creative concepts and performance projections",
    agents=[creative_director, data_analyst, brand_strategist]
)

# De personas zorgen voor natuurlijke discussie:
# - Marcus zal emotionele storytelling pushen
# - Priya zal data-driven targeting adviseren  
# - Jennifer zal beide perspectieven balanceren`,
      explanation: 'Deze complementaire personas creëren natuurlijke spanningen en discussies die leiden tot betere, meer doordachte oplossingen.'
    },
    {
      id: 'example-3',
      title: 'Adaptive Personas voor Verschillende Contexten',
      language: 'python',
      code: `class AdaptivePersonaAgent(Agent):
    """Agent die persona aanpast aan context"""
    
    def __init__(self, base_config, persona_modes):
        super().__init__(**base_config)
        self.persona_modes = persona_modes
        self.current_mode = "default"
    
    def set_context(self, context_type):
        """Pas persona aan op basis van context"""
        if context_type in self.persona_modes:
            self.current_mode = context_type
            mode_config = self.persona_modes[context_type]
            
            # Update agent eigenschappen
            if "goal_modifier" in mode_config:
                self.goal = f"{self.goal} {mode_config['goal_modifier']}"
            
            if "backstory_addition" in mode_config:
                self.backstory += f"\\n\\n{mode_config['backstory_addition']}"
            
            if "temperature" in mode_config:
                self.llm.temperature = mode_config["temperature"]

# Voorbeeld: Customer Service Agent met modes
persona_modes = {
    "complaint": {
        "goal_modifier": "Focus on empathy and quick resolution",
        "backstory_addition": "In complaint situations, you become extra patient and understanding. You acknowledge frustrations before solving problems.",
        "temperature": 0.6
    },
    "sales": {
        "goal_modifier": "Identify opportunities to provide additional value",
        "backstory_addition": "When sales opportunities arise, you become more enthusiastic and benefit-focused without being pushy.",
        "temperature": 0.8
    },
    "technical": {
        "goal_modifier": "Provide detailed, accurate technical assistance",
        "backstory_addition": "For technical issues, you switch to precise, step-by-step communication with clear explanations.",
        "temperature": 0.3
    }
}

customer_service_agent = AdaptivePersonaAgent(
    base_config={
        "role": "Senior Customer Service Representative",
        "goal": "Provide exceptional customer experience",
        "backstory": """You are Maya Robinson, a customer service expert with 8 years experience.
        You've won 'Employee of the Year' three times for your ability to turn unhappy customers 
        into brand advocates. You believe every interaction is an opportunity to build loyalty.""",
        "llm": ChatOpenAI(model="gpt-4")
    },
    persona_modes=persona_modes
)

# Gebruik in verschillende situaties
customer_service_agent.set_context("complaint")
complaint_response = customer_service_agent.execute(
    Task(description="Customer is angry about late delivery")
)

customer_service_agent.set_context("sales")
sales_response = customer_service_agent.execute(
    Task(description="Customer asking about product features")
)`,
      explanation: 'Adaptive personas kunnen hun gedrag aanpassen aan de situatie terwijl ze hun kernidentiteit behouden.'
    },
    {
      id: 'example-4',
      title: 'Persona Validation en Testing',
      language: 'python',
      code: `import json
from typing import Dict, List
from crewai import Agent, Task

class PersonaValidator:
    """Valideer en test agent personas voor consistentie"""
    
    def __init__(self):
        self.test_scenarios = []
        self.consistency_scores = {}
    
    def add_test_scenario(self, scenario: Dict):
        """Voeg test scenario toe"""
        self.test_scenarios.append(scenario)
    
    def validate_persona(self, agent: Agent) -> Dict:
        """Test persona consistentie"""
        results = {
            "agent_role": agent.role,
            "consistency_score": 0,
            "response_analysis": [],
            "recommendations": []
        }
        
        for scenario in self.test_scenarios:
            # Test agent response
            task = Task(
                description=scenario["prompt"],
                expected_output=scenario["expected_type"],
                agent=agent
            )
            
            response = agent.execute(task)
            
            # Analyseer response
            analysis = self._analyze_response(
                response, 
                scenario["expected_traits"],
                agent.backstory
            )
            
            results["response_analysis"].append({
                "scenario": scenario["name"],
                "trait_match": analysis["trait_match"],
                "consistency": analysis["consistency"]
            })
        
        # Bereken overall score
        results["consistency_score"] = self._calculate_score(results["response_analysis"])
        
        # Genereer aanbevelingen
        if results["consistency_score"] < 0.7:
            results["recommendations"] = self._generate_recommendations(results)
        
        return results
    
    def _analyze_response(self, response: str, expected_traits: List[str], backstory: str) -> Dict:
        """Analyseer of response past bij persona"""
        trait_matches = 0
        
        for trait in expected_traits:
            if self._trait_present(response, trait, backstory):
                trait_matches += 1
        
        return {
            "trait_match": trait_matches / len(expected_traits),
            "consistency": self._check_consistency(response, backstory)
        }
    
    def _trait_present(self, response: str, trait: str, backstory: str) -> bool:
        """Check of trait aanwezig is in response"""
        trait_indicators = {
            "analytical": ["data", "metrics", "analysis", "evidence"],
            "creative": ["imagine", "innovative", "unique", "creative"],
            "empathetic": ["understand", "feel", "appreciate", "perspective"],
            "detail-oriented": ["specifically", "precisely", "detail", "thoroughly"],
            "collaborative": ["together", "team", "collaborate", "we"]
        }
        
        if trait in trait_indicators:
            return any(word in response.lower() for word in trait_indicators[trait])
        return False

# Test persona consistentie
validator = PersonaValidator()

# Definieer test scenarios
validator.add_test_scenario({
    "name": "Problem Solving",
    "prompt": "How would you approach fixing a critical bug in production?",
    "expected_type": "Solution approach",
    "expected_traits": ["analytical", "detail-oriented"]
})

validator.add_test_scenario({
    "name": "Team Conflict",
    "prompt": "Two team members disagree on technical approach. How do you mediate?",
    "expected_type": "Mediation strategy",
    "expected_traits": ["empathetic", "collaborative"]
})

# Valideer agents
developer_results = validator.validate_persona(senior_developer)
print(f"Consistency Score: {developer_results['consistency_score']}")

if developer_results["recommendations"]:
    print("Recommendations for improvement:")
    for rec in developer_results["recommendations"]:
        print(f"- {rec}")`,
      explanation: 'Testing en validatie helpt om te verzekeren dat personas consistent blijven en volgens verwachting functioneren.'
    }
  ],
  assignments: [
    {
      id: 'assignment-2-1',
      title: 'Design een Complementair Agent Team',
      description: 'Creëer drie agent personas voor een software development team die elkaar aanvullen.',
      difficulty: 'medium',
      type: 'code',
      initialCode: `from crewai import Agent
from langchain.chat_models import ChatOpenAI

# Jouw opdracht: Creëer 3 complementaire agent personas voor een software team
# Elke agent moet:
# 1. Een unieke rol en expertise hebben
# 2. Een gedetailleerde backstory met motivatie
# 3. Een specifieke werkstijl en communicatie approach
# 4. Duidelijke sterktes en zwaktes

# Agent 1: Tech Lead
tech_lead = Agent(
    role="___",  # Definieer specifieke rol
    goal="___",  # Wat wil deze agent bereiken?
    backstory="""___""",  # Minimaal 5 zinnen backstory
    verbose=True,
    allow_delegation=___,  # True/False
    llm=ChatOpenAI(model="gpt-4", temperature=___) # 0.0-1.0
)

# Agent 2: ??? (Kies complementaire rol)
agent_2 = Agent(
    role="___",
    goal="___",
    backstory="""___""",
    verbose=True,
    allow_delegation=___,
    llm=ChatOpenAI(model="gpt-4", temperature=___)
)

# Agent 3: ??? (Kies derde complementaire rol)
agent_3 = Agent(
    role="___",
    goal="___",
    backstory="""___""",
    verbose=True,
    allow_delegation=___,
    llm=ChatOpenAI(model="gpt-4", temperature=___)
)

# Bonus: Beschrijf hoe deze agents zouden samenwerken
team_dynamics = """
Agent interacties:
- Tech Lead & Agent 2: ___
- Tech Lead & Agent 3: ___
- Agent 2 & Agent 3: ___

Potentiële conflicten: ___
Synergiën: ___
"""`,
      solution: `from crewai import Agent
from langchain.chat_models import ChatOpenAI

# Agent 1: Tech Lead
tech_lead = Agent(
    role="Principal Software Architect",
    goal="Design robust, scalable systems while ensuring technical excellence and team alignment",
    backstory="""You are David Park, a principal architect with 15 years of experience building 
    distributed systems. You've seen projects fail due to over-engineering and succeed through 
    pragmatic choices. You believe in 'boring technology' - proven solutions over bleeding edge.
    
    You mentor through code reviews and architecture decisions. You communicate complex ideas 
    through simple diagrams and analogies. Your superpower is seeing potential issues before 
    they become problems. You're patient with questions but firm on best practices.""",
    verbose=True,
    allow_delegation=True,
    llm=ChatOpenAI(model="gpt-4", temperature=0.4)
)

# Agent 2: Frontend Specialist
frontend_specialist = Agent(
    role="Senior Frontend Engineer & UX Advocate",
    goal="Create intuitive, performant user interfaces that delight users and respect accessibility",
    backstory="""You are Rosa Martinez, a frontend engineer who started as a designer. With 8 years 
    of experience, you bridge the gap between design and engineering. You've worked on products 
    used by millions and learned that performance and beauty must coexist.
    
    You advocate for users in technical discussions, always asking 'How does this impact the user 
    experience?' You're passionate about web standards, accessibility, and progressive enhancement. 
    You communicate visually, often sketching UI flows during discussions.""",
    verbose=True,
    allow_delegation=False,
    llm=ChatOpenAI(model="gpt-4", temperature=0.7)
)

# Agent 3: DevOps Engineer
devops_engineer = Agent(
    role="Site Reliability Engineer",
    goal="Ensure systems are reliable, observable, and easy to operate while enabling rapid deployment",
    backstory="""You are Sam Chen, an SRE who learned operations the hard way - through 3am 
    incident calls. With 10 years of experience, you've evolved from 'fighting fires' to 
    preventing them. You believe in automation, observability, and blameless postmortems.
    
    You think in systems and failure modes. Every feature discussion includes your question: 
    'How will this fail, and how will we know?' You're calm under pressure and methodical in 
    approach. You document everything because future-you will thank present-you.""",
    verbose=True,
    allow_delegation=True,
    llm=ChatOpenAI(model="gpt-4", temperature=0.3)
)

# Bonus: Team dynamics beschrijving
team_dynamics = """
Agent interacties:
- Tech Lead & Frontend: David respects Rosa's user focus and often asks her input on API design. 
  Rosa appreciates David's system thinking but pushes back on over-complicated solutions.
  
- Tech Lead & DevOps: David and Sam collaborate closely on architecture decisions. Sam provides 
  reality checks on operational complexity. They share a love for boring, proven technology.
  
- Frontend & DevOps: Rosa and Sam sometimes clash on performance vs features, but find common 
  ground in metrics and user impact. Sam helps Rosa understand infrastructure constraints.

Potentiële conflicten: 
- Rosa's push for rich features vs Sam's stability concerns
- David's architectural purity vs time-to-market pressure
- Different perspectives on acceptable technical debt

Synergiën:
- Shared commitment to user success (different angles)
- Complementary expertise covers full stack
- Balance between innovation and stability
- Natural mentorship flows (David → Rosa/Sam on architecture, Rosa → others on UX)
"""`,
      hints: [
        'Denk aan echte team dynamics - niet iedereen hoeft het altijd eens te zijn',
        'Geef elke agent unieke expertise die de anderen niet hebben',
        'Backstory moet verklaren WAAROM ze zo werken, niet alleen WAT ze doen',
        'Temperature settings moeten passen bij de rol (analytical = lager, creative = hoger)'
      ]
    }
  ],
  resources: [
    {
      title: 'CrewAI Agent Documentation',
      url: 'https://docs.crewai.com/core-concepts/Agents/',
      type: 'documentation'
    },
    {
      title: 'Building Believable AI Characters',
      url: 'https://www.youtube.com/watch?v=xyz',
      type: 'video'
    },
    {
      title: 'The Psychology of Effective Teams',
      url: 'https://hbr.org/effective-teams',
      type: 'article'
    }
  ]
}