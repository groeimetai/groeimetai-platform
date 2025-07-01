import { Lesson } from '@/lib/data/courses'

export const lesson1_1: Lesson = {
  id: 'lesson-1-1',
  title: 'Introductie tot CrewAI: Multi-agent orchestratie',
  duration: '35 min',
  content: `# Introductie tot CrewAI: Multi-agent orchestratie

## Wat is CrewAI?

CrewAI is een krachtig framework voor het bouwen van autonome AI-teams die samenwerken om complexe taken uit te voeren. In tegenstelling tot traditionele single-agent systemen, maakt CrewAI het mogelijk om meerdere gespecialiseerde AI-agents te creëren die elk hun eigen rol, verantwoordelijkheden en persoonlijkheid hebben.

### Waarom multi-agent systemen?

In de echte wereld werken experts samen in teams om complexe problemen op te lossen. CrewAI brengt dit concept naar de wereld van AI:

- **Specialisatie**: Elke agent kan zich focussen op specifieke taken
- **Parallelle verwerking**: Meerdere agents kunnen tegelijkertijd werken
- **Flexibiliteit**: Teams kunnen dynamisch worden samengesteld
- **Schaalbaarheid**: Nieuwe agents kunnen eenvoudig worden toegevoegd

## Core concepten

### 1. Agents
Autonome actoren met specifieke rollen, doelen en gereedschappen. Elke agent heeft:
- Een duidelijke rol (bijv. "Senior Python Developer")
- Een doel dat hun acties stuurt
- Een backstory die context geeft
- Toegang tot specifieke tools

### 2. Tasks
Concrete opdrachten die agents moeten uitvoeren. Tasks hebben:
- Een beschrijving van wat moet gebeuren
- Een verwacht resultaat
- Een toegewezen agent
- Optionele tools die gebruikt kunnen worden

### 3. Crews
Teams van agents die samenwerken. Een crew:
- Coördineert de samenwerking tussen agents
- Beheert de workflow (sequentieel of parallel)
- Verzamelt en combineert resultaten

## Vergelijking met andere frameworks

### CrewAI vs LangChain
- **LangChain**: Focus op chains en individuele LLM interacties
- **CrewAI**: Focus op multi-agent samenwerking en rolgebaseerde taken

### CrewAI vs AutoGPT
- **AutoGPT**: Eén agent die alles probeert te doen
- **CrewAI**: Meerdere gespecialiseerde agents met duidelijke rollen

### CrewAI vs Microsoft AutoGen
- **AutoGen**: Conversatie-gebaseerde multi-agent interacties
- **CrewAI**: Taak-georiënteerde teams met gestructureerde workflows

## Praktische toepassingen

CrewAI excelleert in scenario's waar:

1. **Complexe onderzoekstaken**: Een team van researchers, fact-checkers en writers
2. **Software ontwikkeling**: Architecten, developers, testers en reviewers
3. **Content creatie**: Schrijvers, editors, SEO-specialisten
4. **Data analyse**: Data scientists, visualisatie experts, business analisten

## Installatie en setup

Voor we beginnen met het bouwen van onze eerste crew, moeten we CrewAI installeren:

\`\`\`bash
pip install crewai
pip install 'crewai[tools]'  # Voor extra tools
\`\`\`

Je hebt ook een OpenAI API key nodig (of een andere LLM provider):

\`\`\`bash
export OPENAI_API_KEY="jouw-api-key"
\`\`\`

## Best practices vanaf het begin

1. **Begin klein**: Start met 2-3 agents en bouw uit
2. **Duidelijke rollen**: Geef agents specifieke, niet-overlappende verantwoordelijkheden
3. **Test iteratief**: Test elke agent individueel voordat je ze combineert
4. **Monitor prestaties**: Houd bij hoe agents presteren en pas aan

In de volgende lessen duiken we dieper in elk van deze concepten en bouwen we onze eerste werkende crew!`,
  codeExamples: [
    {
      id: 'example-1',
      title: 'Je eerste CrewAI setup',
      language: 'python',
      code: `from crewai import Agent, Task, Crew
import os

# Zorg dat je API key is ingesteld
os.environ["OPENAI_API_KEY"] = "jouw-api-key"

# Creëer je eerste agent
researcher = Agent(
    role='Senior Research Analyst',
    goal='Vind accurate en relevante informatie over onderwerpen',
    backstory="""Je bent een ervaren research analyst met een scherp oog voor detail.
    Je excelleert in het vinden van betrouwbare bronnen en het samenvatten van complexe informatie.""",
    verbose=True,
    allow_delegation=False
)

# Creëer een taak voor de agent
research_task = Task(
    description="""Onderzoek de laatste trends in AI multi-agent systemen.
    Focus op praktische toepassingen en succesvolle implementaties.""",
    expected_output="Een gedetailleerd rapport met trends, voorbeelden en aanbevelingen",
    agent=researcher
)

# Stel een crew samen
crew = Crew(
    agents=[researcher],
    tasks=[research_task],
    verbose=2  # Zie wat er gebeurt tijdens uitvoering
)

# Voer de crew uit
result = crew.kickoff()
print(result)`
    },
    {
      id: 'example-2',
      title: 'Multi-agent samenwerking',
      language: 'python',
      code: `from crewai import Agent, Task, Crew

# Creëer meerdere agents met verschillende rollen
researcher = Agent(
    role='Research Specialist',
    goal='Verzamel relevante informatie en data',
    backstory="Expert in online research en data gathering"
)

writer = Agent(
    role='Content Writer',
    goal='Creëer heldere en engaging content',
    backstory="Ervaren schrijver met focus op technische onderwerpen"
)

editor = Agent(
    role='Senior Editor',
    goal='Verbeter en polijst content tot publicatie-kwaliteit',
    backstory="Detailgerichte editor met jaren ervaring"
)

# Definieer taken voor elke agent
research_task = Task(
    description="Onderzoek best practices voor multi-agent AI systemen",
    agent=researcher
)

writing_task = Task(
    description="Schrijf een artikel gebaseerd op het onderzoek",
    agent=writer
)

editing_task = Task(
    description="Review en verbeter het artikel voor publicatie",
    agent=editor
)

# Creëer een crew met sequentiële workflow
blog_crew = Crew(
    agents=[researcher, writer, editor],
    tasks=[research_task, writing_task, editing_task],
    verbose=True
)

# Start de samenwerking
final_article = blog_crew.kickoff()
print(final_article)`
    }
  ],
  assignments: [
    {
      id: 'assignment-1',
      title: 'Ontwerp je eerste AI-team',
      type: 'project',
      difficulty: 'easy',
      description: `Ontwerp een CrewAI team voor een specifiek doel naar keuze. Denk aan:
      
1. Identificeer een probleem dat baat heeft bij multi-agent aanpak
2. Definieer 3-4 agents met duidelijke rollen
3. Beschrijf hun taken en hoe ze samenwerken
4. Implementeer een basis versie met CrewAI

Voorbeelden: 
- Een team voor het analyseren van klantreviews
- Een development team voor het bouwen van een simpele app
- Een content creatie team voor social media posts`,
      hints: [
        'Begin met het probleem: welke verschillende expertises zijn nodig?',
        'Maak agents complementair, niet overlappend',
        'Test eerst met simpele taken voordat je complex gaat'
      ]
    },
    {
      id: 'assignment-2',
      title: 'Vergelijk single vs multi-agent',
      type: 'project',
      difficulty: 'medium',
      description: `Implementeer dezelfde taak twee keer:
      
1. Eén keer met een enkele agent die alles doet
2. Eén keer met meerdere gespecialiseerde agents

Vergelijk:
- Kwaliteit van de output
- Uitvoeringstijd
- Complexiteit van de code
- Flexibiliteit voor aanpassingen

Documenteer je bevindingen en conclusies.`,
      hints: [
        'Kies een taak met duidelijk verschillende stappen',
        'Meet objectieve metrics waar mogelijk',
        'Let op edge cases en foutafhandeling'
      ]
    }
  ],
  resources: [
    {
      title: 'CrewAI Officiële Documentatie',
      url: 'https://docs.crewai.com',
      type: 'documentation'
    },
    {
      title: 'CrewAI GitHub Repository',
      url: 'https://github.com/joaomdmoura/crewAI',
      type: 'code'
    },
    {
      title: 'Multi-Agent Systems: A Modern Approach',
      url: 'https://arxiv.org/abs/2308.00352',
      type: 'guide'
    },
    {
      title: 'CrewAI Community Discord',
      url: 'https://discord.gg/crewai',
      type: 'code'
    }
  ]
}