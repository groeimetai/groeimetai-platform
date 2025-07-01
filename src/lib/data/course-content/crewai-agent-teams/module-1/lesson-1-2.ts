import { Lesson } from '@/lib/data/courses'

export const lesson1_2: Lesson = {
  id: 'lesson-1-2',
  title: 'Agents: Autonome actoren met persoonlijkheid',
  duration: '40 min',
  content: `# Agents: Autonome actoren met persoonlijkheid

## Wat zijn Agents in CrewAI?

Agents zijn de kern van elk CrewAI systeem. Ze zijn autonome entiteiten die specifieke rollen vervullen, beslissingen nemen, en samenwerken om complexe taken uit te voeren. Denk aan agents als hooggespecialiseerde teamleden, elk met hun eigen expertise, persoonlijkheid en werkstijl.

## Anatomie van een Agent

### Core attributen

Elke CrewAI agent heeft essentiële eigenschappen die hun gedrag en capaciteiten bepalen:

#### 1. Role (Rol)
De functietitel of specialisatie van de agent. Dit geeft context aan de LLM over welke expertise de agent heeft.

\`\`\`python
role = "Senior Data Scientist"
role = "UX Research Specialist"
role = "DevOps Engineer"
\`\`\`

#### 2. Goal (Doel)
Het primaire doel dat de agent nastreeft. Dit stuurt alle acties en beslissingen.

\`\`\`python
goal = "Analyseer data om actionable insights te vinden"
goal = "Optimaliseer de gebruikerservaring door grondig onderzoek"
goal = "Zorg voor betrouwbare en schaalbare deployments"
\`\`\`

#### 3. Backstory (Achtergrondverhaal)
Een rijke context die de agent's persoonlijkheid en aanpak vormgeeft.

\`\`\`python
backstory = """Je hebt 15 jaar ervaring in machine learning en bent 
gepassioneerd over het vinden van patronen in complexe datasets. 
Je bent bekend om je grondige aanpak en heldere visualisaties."""
\`\`\`

### Geavanceerde eigenschappen

#### Memory (Geheugen)
Agents kunnen informatie onthouden tussen taken:

- **Short-term memory**: Informatie binnen een sessie
- **Long-term memory**: Persistente kennis over sessies heen

#### Tools (Gereedschappen)
Agents kunnen tools gebruiken om hun capaciteiten uit te breiden:

- Web search tools
- File system access
- API integraties
- Custom tools

#### Delegation (Delegatie)
Sommige agents kunnen taken delegeren aan andere agents wanneer nodig.

## Agent persoonlijkheden en gedrag

### Persoonlijkheid engineering

De manier waarop je een agent configureert bepaalt sterk hun effectiviteit:

1. **De Precisionist**
   - Focust op accuraatheid en detail
   - Controleert werk meerdere keren
   - Ideaal voor kritieke taken

2. **De Innovator**
   - Denkt out-of-the-box
   - Probeert creatieve oplossingen
   - Goed voor brainstorming en conceptualisatie

3. **De Uitvoerder**
   - Actie-georiënteerd
   - Focust op snelle resultaten
   - Perfect voor implementatietaken

### Communicatiestijlen

Agents communiceren verschillend op basis van hun configuratie:

\`\`\`python
# Formele, technische communicatie
agent = Agent(
    role="Senior Software Architect",
    communication_style="formal, technical, precise"
)

# Vriendelijke, toegankelijke communicatie  
agent = Agent(
    role="Customer Success Manager",
    communication_style="friendly, empathetic, clear"
)
\`\`\`

## Best practices voor agent design

### 1. Single Responsibility Principle
Elke agent moet één duidelijke verantwoordelijkheid hebben. Vermijd agents die te veel verschillende taken proberen uit te voeren.

### 2. Clear boundaries
Definieer duidelijk wat een agent wel en niet kan doen. Dit voorkomt overlap en conflicten.

### 3. Appropriate autonomy
Geef agents genoeg vrijheid om effectief te zijn, maar met duidelijke grenzen.

### 4. Tool selection
Kies tools die passen bij de agent's rol. Een research agent heeft andere tools nodig dan een code writer.

## Agent configuratie patterns

### The Specialist Pattern
Highly focused agents met diepe expertise:

\`\`\`python
security_expert = Agent(
    role="Cybersecurity Specialist",
    goal="Identificeer en mitigeer security vulnerabilities",
    backstory="Former ethical hacker met expertise in OWASP top 10",
    tools=[security_scanner, vulnerability_db],
    max_iter=5  # Grondige analyse
)
\`\`\`

### The Coordinator Pattern
Agents die andere agents aansturen:

\`\`\`python
project_manager = Agent(
    role="Project Manager",
    goal="Coördineer team efforts en zorg voor tijdige delivery",
    allow_delegation=True,
    delegation_agents=[developer, tester, designer]
)
\`\`\`

### The Validator Pattern
Agents die werk van anderen controleren:

\`\`\`python
qa_engineer = Agent(
    role="Quality Assurance Engineer",
    goal="Valideer alle output op kwaliteit en correctheid",
    validation_mode=True,
    strict_mode=True
)
\`\`\`

## Performance optimalisatie

### Response snelheid
- Gebruik \`max_iter\` om het aantal denkstappen te beperken
- Implementeer caching voor veelvoorkomende queries
- Overweeg kleinere, snellere modellen voor simpele taken

### Kwaliteit vs snelheid trade-offs
- Meer iteraties = betere kwaliteit maar langzamer
- Specifiekere prompts = consistentere output
- Balanceer based op use case requirements

## Foutafhandeling en resilience

Agents moeten robuust zijn:

\`\`\`python
resilient_agent = Agent(
    role="Data Processor",
    error_handling="retry_with_backoff",
    max_retries=3,
    fallback_behavior="return_partial_results"
)
\`\`\`

## Agent interactie patronen

### Peer review
Agents die elkaars werk beoordelen:

\`\`\`python
writer = Agent(role="Content Writer")
reviewer = Agent(role="Content Reviewer")
# Reviewer controleert writer's output
\`\`\`

### Mentor-student
Senior agents die junior agents begeleiden:

\`\`\`python
senior_dev = Agent(role="Senior Developer", can_teach=True)
junior_dev = Agent(role="Junior Developer", learning_mode=True)
\`\`\`

### Competitive collaboration
Agents die verschillende approaches proberen:

\`\`\`python
optimizer_a = Agent(role="Performance Optimizer", approach="aggressive")
optimizer_b = Agent(role="Performance Optimizer", approach="conservative")
# Beste resultaat wint
\`\`\``,
  codeExamples: [
    {
      id: 'example-1',
      title: 'Complete agent configuratie',
      language: 'python',
      code: `from crewai import Agent
from crewai_tools import SerperDevTool, FileReadTool, MDXSearchTool

# Initialiseer tools
search_tool = SerperDevTool()
file_tool = FileReadTool()
docs_tool = MDXSearchTool()

# Creëer een volledig geconfigureerde research agent
research_agent = Agent(
    role='Senior Research Analyst',
    goal='Verzamel accurate, relevante en actuele informatie over complexe onderwerpen',
    backstory="""Je bent een award-winning research analyst met 20 jaar ervaring 
    in technologie en business intelligence. Je bent bekend om je methodische aanpak,
    het vermogen om complexe informatie te synthetiseren, en je talent voor het
    identificeren van belangrijke trends voordat ze mainstream worden.
    
    Je hebt een PhD in Information Science en hebt gewerkt voor top consultancy firms.
    Je motto is: "Data zonder context is slechts ruis." Je streeft er altijd naar om
    niet alleen feiten te verzamelen, maar ook de onderliggende patronen en 
    implicaties te begrijpen.""",
    
    # Tools configuratie
    tools=[search_tool, file_tool, docs_tool],
    
    # Gedrag configuratie
    verbose=True,  # Toon denkproces
    allow_delegation=True,  # Kan taken delegeren indien nodig
    max_iter=5,  # Maximum denkstappen per taak
    
    # Memory configuratie
    memory=True,  # Activeer geheugen
    
    # LLM configuratie (optioneel)
    llm_config={
        "temperature": 0.7,  # Creativiteit niveau
        "model": "gpt-4",    # Model selectie
    },
    
    # Execution configuratie
    execution_timeout=300,  # 5 minuten timeout
    
    # Custom attributen
    expertise_areas=["AI/ML", "Business Strategy", "Market Analysis"],
    preferred_sources=["Academic papers", "Industry reports", "Expert interviews"],
    output_format="structured_report"
)

# Test de agent met een complexe onderzoekstaak
from crewai import Task

research_task = Task(
    description="""
    Onderzoek de huidige staat van quantum computing in enterprise omgevingen.
    Focus op:
    1. Praktische toepassingen die nu al in productie zijn
    2. Belangrijkste spelers en hun offerings
    3. ROI en business cases
    4. Technische uitdagingen en beperkingen
    5. Verwachte ontwikkelingen komende 2-3 jaar
    
    Lever een executive summary plus gedetailleerde bevindingen.
    """,
    expected_output="Uitgebreid rapport met executive summary, key findings, en aanbevelingen",
    agent=research_agent
)

# Voer de taak uit
result = research_agent.execute(research_task)
print(result)`
    },
    {
      id: 'example-2',
      title: 'Gespecialiseerde agent rollen',
      language: 'python',
      code: `from crewai import Agent, Crew, Task
from typing import List

def create_specialized_team() -> List[Agent]:
    """Creëer een team van gespecialiseerde agents voor software development"""
    
    # Software Architect
    architect = Agent(
        role='Software Architect',
        goal='Design schaalbare en maintainable software architectuur',
        backstory="""Je bent een seasoned architect met expertise in microservices,
        cloud-native architectuur, en enterprise patterns. Je hebt systemen ontworpen
        die miljoenen gebruikers bedienen en bent een voorstander van pragmatische,
        evolutionaire architectuur.""",
        tools=[],  # Gebruikt vooral kennis en ervaring
        allow_delegation=True,
        thinking_style="systematic"
    )
    
    # Backend Developer
    backend_dev = Agent(
        role='Senior Backend Developer',
        goal='Implementeer robuuste en performante backend services',
        backstory="""Met 10+ jaar ervaring in Python, Go, en Java, ben je een expert
        in het bouwen van high-performance APIs en distributed systems. Je bent 
        gepassioneerd over clean code, testing, en continuous improvement.""",
        tools=[],  # Code generation tools kunnen hier
        execution_style="methodical",
        code_quality_standards="high"
    )
    
    # Frontend Developer
    frontend_dev = Agent(
        role='Frontend Architect',
        goal='Creëer intuïtieve en responsive user interfaces',
        backstory="""Als frontend specialist met een achtergrond in UX design,
        bouw je niet alleen mooie interfaces maar zorg je ook voor uitstekende
        performance en accessibility. Expert in React, Vue, en modern CSS.""",
        tools=[],
        focus_areas=["performance", "accessibility", "user_experience"]
    )
    
    # DevOps Engineer
    devops = Agent(
        role='DevOps Engineer',
        goal='Automatiseer deployment en zorg voor system reliability',
        backstory="""Infrastructure as Code evangelist met diepe kennis van
        Kubernetes, Terraform, en CI/CD pipelines. Je mantra: "Alles wat meer
        dan één keer gebeurt, moet geautomatiseerd worden." """,
        tools=[],
        automation_first=True
    )
    
    # Security Specialist
    security = Agent(
        role='Security Engineer',
        goal='Identificeer en mitigeer security vulnerabilities',
        backstory="""Former ethical hacker die nu organisaties helpt veilig te
        blijven. Expert in OWASP, penetration testing, en secure coding practices.
        Je ziet security niet als blocker maar als enabler.""",
        tools=[],
        paranoia_level="healthy"
    )
    
    # QA Engineer
    qa_engineer = Agent(
        role='QA Automation Engineer',
        goal='Garandeer software kwaliteit door comprehensive testing',
        backstory="""Test automation expert die gelooft dat kwaliteit ieders
        verantwoordelijkheid is. Specialist in TDD, BDD, en continuous testing.
        "If it's not tested, it's broken." """,
        tools=[],
        testing_philosophy="shift_left"
    )
    
    return [architect, backend_dev, frontend_dev, devops, security, qa_engineer]

# Voorbeeld van hoe deze agents samenwerken
def build_feature_with_team():
    team = create_specialized_team()
    
    # Definieer taken voor elke specialist
    tasks = [
        Task(
            description="Ontwerp de architectuur voor een nieuwe payment service",
            agent=team[0],  # architect
            expected_output="Architectuur document met componenten, APIs, en data flow"
        ),
        Task(
            description="Implementeer de payment processing API volgens het architectuur design",
            agent=team[1],  # backend_dev
            expected_output="Werkende API met tests en documentatie"
        ),
        Task(
            description="Bouw de payment UI componenten met form validatie en error handling",
            agent=team[2],  # frontend_dev
            expected_output="React componenten met Storybook documentatie"
        ),
        Task(
            description="Setup CI/CD pipeline en Kubernetes deployment voor payment service",
            agent=team[3],  # devops
            expected_output="Volledig geautomatiseerde deployment pipeline"
        ),
        Task(
            description="Voer security audit uit op de payment implementation",
            agent=team[4],  # security
            expected_output="Security rapport met findings en mitigaties"
        ),
        Task(
            description="Creëer comprehensive test suite voor payment functionaliteit",
            agent=team[5],  # qa_engineer
            expected_output="Automated test suite met 90%+ coverage"
        )
    ]
    
    # Creëer crew voor sequentiële uitvoering
    dev_crew = Crew(
        agents=team,
        tasks=tasks,
        verbose=True,
        process="sequential"  # Taken worden in volgorde uitgevoerd
    )
    
    return dev_crew

# Gebruik het team
crew = build_feature_with_team()
result = crew.kickoff()
print(f"Project voltooid: {result}")`
    },
    {
      id: 'example-3',
      title: 'Agent met custom tools en memory',
      language: 'python',
      code: `from crewai import Agent
from crewai_tools import BaseTool
from typing import Type, Any
from pydantic import BaseModel, Field
import json

# Custom tool voor agent
class DatabaseQueryTool(BaseTool):
    name: str = "Database Query Tool"
    description: str = "Query the application database for information"
    
    def _run(self, query: str) -> str:
        """Simuleer database query"""
        # In productie zou dit een echte DB query zijn
        mock_results = {
            "users": "15,234 active users",
            "revenue": "$2.3M monthly recurring revenue",
            "churn": "3.2% monthly churn rate"
        }
        return json.dumps(mock_results, indent=2)

class AnalyticsTool(BaseTool):
    name: str = "Analytics Tool"
    description: str = "Analyze data and generate insights"
    
    def _run(self, data: str) -> str:
        """Genereer analytics insights"""
        return f"Key insights from data: Growth trending upward, engagement increasing"

# Agent met memory en custom tools
data_analyst = Agent(
    role='Business Intelligence Analyst',
    goal='Transform raw data into actionable business insights',
    backstory="""Je bent een data wizard die complexe datasets kan omzetten in 
    heldere business insights. Met een achtergrond in statistiek en business,
    bridge je de gap tussen technische data en strategische beslissingen.
    
    Je gebruikt een combinatie van SQL, Python, en visualisatie tools om
    patterns te ontdekken die anderen missen. Je presentaties hebben al
    meerdere keren geleid tot significante business pivots.""",
    
    # Tools
    tools=[DatabaseQueryTool(), AnalyticsTool()],
    
    # Memory configuratie
    memory=True,
    memory_config={
        "provider": "local",  # of "redis" voor distributed
        "embedding_model": "text-embedding-ada-002"
    },
    
    # Execution parameters
    verbose=True,
    max_iter=4,
    
    # Custom methods voor deze agent
    analysis_framework="CRISP-DM",
    visualization_preferences=["dashboards", "storytelling", "interactive"],
    
    # Callbacks voor monitoring
    callbacks=[
        lambda agent, task, result: print(f"Task completed: {task.description[:50]}..."),
        lambda agent, task, error: print(f"Error occurred: {error}") if error else None
    ]
)

# Gebruik agent met memory
from crewai import Task

# Eerste analyse
initial_analysis = Task(
    description="""
    Analyseer de huidige business metrics:
    1. Haal user data, revenue, en churn metrics op
    2. Identificeer trends en patronen
    3. Geef top 3 areas voor improvement
    """,
    agent=data_analyst,
    expected_output="Business metrics analyse met aanbevelingen"
)

result1 = data_analyst.execute(initial_analysis)
print("Eerste analyse:", result1)

# Tweede taak - agent herinnert context van eerste analyse
followup_analysis = Task(
    description="""
    Gebaseerd op je eerdere analyse, zoom in op de churn problematiek:
    1. Wat zijn mogelijke oorzaken van de churn?
    2. Welke user segments zijn het meest at risk?
    3. Stel concrete acties voor om churn te verminderen
    
    Gebruik insights van je vorige analyse.
    """,
    agent=data_analyst,
    expected_output="Gedetailleerd churn reduction plan"
)

result2 = data_analyst.execute(followup_analysis)
print("\\nFollowup analyse:", result2)

# Agent herinnert context en bouwt voort op eerdere analyses
print("\\nAgent memory bevat nu insights van beide analyses")`
    }
  ],
  assignments: [
    {
      id: 'assignment-1',
      title: 'Bouw een gespecialiseerd agent team',
      type: 'project',
      difficulty: 'medium',
      description: `Creëer een team van minstens 4 agents voor een specifiek domein naar keuze:

1. **Kies een domein** (voorbeelden):
   - E-commerce customer service team
   - News article production team
   - Investment analysis team
   - Educational content creation team

2. **Ontwerp elke agent met**:
   - Unieke rol en verantwoordelijkheden
   - Passende backstory die hun expertise reflecteert
   - Specifieke goals die niet overlappen
   - Relevante tools (maak desnoods mock tools)

3. **Implementeer interactie patronen**:
   - Hoe werken de agents samen?
   - Wie controleert wiens werk?
   - Hoe worden conflicten opgelost?

4. **Test met een realistische use case**`,
      hints: [
        'Denk aan echte teams: welke rollen zijn essentieel?',
        'Backstories moeten personality en approach informeren',
        'Test eerst individuele agents voordat je ze combineert',
        'Overweeg edge cases: wat als agents het oneens zijn?'
      ]
    },
    {
      id: 'assignment-2',
      title: 'Agent personality experiment',
      type: 'project',
      difficulty: 'hard',
      description: `Onderzoek hoe verschillende personality configuraties de output beïnvloeden:

1. **Creëer 3 versies van dezelfde agent rol** (bijv. "Software Developer"):
   - Versie A: Conservative, detail-oriented, risk-averse
   - Versie B: Innovative, fast-moving, experimental
   - Versie C: Balanced, pragmatic, collaborative

2. **Geef alle drie dezelfde taak**, bijvoorbeeld:
   - "Ontwerp een login systeem"
   - "Optimaliseer database performance"
   - "Refactor legacy code"

3. **Analyseer de verschillen**:
   - Welke approaches kiezen ze?
   - Hoe verschillen hun oplossingen?
   - Welke trade-offs maken ze?

4. **Documenteer best practices**:
   - Wanneer werkt welke personality het beste?
   - Hoe kun je personality matchen met taak type?`,
      hints: [
        'Houd andere variabelen constant (tools, goals, etc)',
        'Documenteer niet alleen wat ze doen maar ook hoe',
        'Kijk naar zowel output kwaliteit als process'
      ]
    }
  ],
  resources: [
    {
      title: 'CrewAI Agent Documentation',
      url: 'https://docs.crewai.com/core-concepts/agents',
      type: 'documentation'
    },
    {
      title: 'Building Effective AI Agents',
      url: 'https://www.youtube.com/watch?v=agent-design',
      type: 'video'
    },
    {
      title: 'The Psychology of AI Agents',
      url: 'https://arxiv.org/abs/2309.12345',
      type: 'guide'
    },
    {
      title: 'CrewAI Tools Library',
      url: 'https://github.com/joaomdmoura/crewai-tools',
      type: 'code'
    },
    {
      title: 'Agent Design Patterns',
      url: 'https://patterns.crewai.com',
      type: 'guide'
    }
  ]
};