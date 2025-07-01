import { Lesson } from '@/lib/data/courses'

export const lesson1_3: Lesson = {
  id: 'lesson-1-3',
  title: 'Tasks en workflows: Werk verdelen tussen agents',
  duration: '35 min',
  content: `# Tasks en workflows: Werk verdelen tussen agents

## Wat zijn Tasks in CrewAI?

Tasks zijn de concrete opdrachten die agents uitvoeren. Ze vormen de brug tussen wat je wilt bereiken (je doel) en hoe agents dat realiseren (uitvoering). Een goed gedefinieerde task is specifiek, meetbaar, en heeft een duidelijk verwacht resultaat.

## Anatomie van een Task

### Core componenten

Elke CrewAI task bestaat uit essentiële elementen:

#### 1. Description (Beschrijving)
Een gedetailleerde omschrijving van wat moet gebeuren. Hoe specifieker, hoe beter de output.

\`\`\`python
description = """
Analyseer de gebruikersreviews van onze mobile app van de laatste 3 maanden.
Focus op:
- Meest genoemde problemen
- Feature requests
- Sentiment per app versie
- Geografische verschillen in feedback
"""
\`\`\`

#### 2. Expected Output (Verwacht Resultaat)
Definieer expliciet wat je als resultaat verwacht. Dit helpt de agent focus te houden.

\`\`\`python
expected_output = """
Een gestructureerd rapport met:
1. Executive summary (max 200 woorden)
2. Top 5 problemen met frequentie en severity
3. Top 10 feature requests gerankt op populariteit
4. Sentiment analyse grafiek per versie
5. Aanbevelingen voor product roadmap
"""
\`\`\`

#### 3. Agent Assignment
Welke agent is verantwoordelijk voor deze task?

\`\`\`python
agent = data_analyst  # De agent die deze task uitvoert
\`\`\`

#### 4. Context (Optioneel)
Extra informatie of resultaten van andere tasks die relevant zijn.

\`\`\`python
context = [previous_analysis_task, market_research_task]
\`\`\`

## Task configuratie opties

### Tools toewijzing
Specificeer welke tools beschikbaar zijn voor deze task:

\`\`\`python
task = Task(
    description="...",
    agent=researcher,
    tools=[search_tool, analysis_tool],  # Alleen deze tools voor deze task
    tool_choice="auto"  # Of "none", "required"
)
\`\`\`

### Output formatting
Bepaal hoe de output gestructureerd moet worden:

\`\`\`python
task = Task(
    description="...",
    expected_output="JSON formatted customer data",
    output_format="json",  # Forces structured output
    output_schema={
        "customers": "array",
        "total_count": "integer",
        "average_satisfaction": "float"
    }
)
\`\`\`

### Execution parameters
Fine-tune hoe de task wordt uitgevoerd:

\`\`\`python
task = Task(
    description="...",
    agent=agent,
    max_attempts=3,  # Retry bij failures
    timeout=600,  # 10 minuten timeout
    requires_human_feedback=True,  # Menselijke review vereist
    priority="high"  # Voor prioritering in workflows
)
\`\`\`

## Workflows: Task orchestratie

### Sequential workflow (Opeenvolgend)
Tasks worden één voor één uitgevoerd, waarbij elke task kan bouwen op de vorige:

\`\`\`python
# Volgorde is belangrijk!
tasks = [
    research_task,    # Eerst: verzamel informatie
    analysis_task,    # Dan: analyseer de data
    report_task,      # Tot slot: schrijf rapport
]

crew = Crew(
    agents=[researcher, analyst, writer],
    tasks=tasks,
    process="sequential"  # Default
)
\`\`\`

**Voordelen:**
- Duidelijke flow en dependencies
- Makkelijk te debuggen
- Output van één task is input voor de volgende

**Nadelen:**
- Langzamer (geen parallelisatie)
- Bottlenecks blokkeren hele flow

### Hierarchical workflow (Hiërarchisch)
Een manager agent coördineert en delegeert werk:

\`\`\`python
crew = Crew(
    agents=[manager, developer, tester, designer],
    tasks=tasks,
    process="hierarchical",
    manager_llm=ChatOpenAI(model="gpt-4")  # Manager gebruikt mogelijk ander model
)
\`\`\`

**Voordelen:**
- Flexibele task toewijzing
- Dynamische aanpassingen mogelijk
- Natuurlijke delegation patterns

**Nadelen:**
- Extra overhead van management layer
- Manager kan bottleneck worden

### Parallel workflow (Custom implementation)
Meerdere tasks tegelijk uitvoeren waar mogelijk:

\`\`\`python
# CrewAI ondersteunt dit via custom process
from concurrent.futures import ThreadPoolExecutor

def parallel_execution(crew, independent_tasks):
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = []
        for task in independent_tasks:
            future = executor.submit(task.agent.execute, task)
            futures.append(future)
        
        results = [f.result() for f in futures]
    return results
\`\`\`

## Task dependencies en data flow

### Expliciet dependencies definiëren
Maak duidelijk welke tasks van elkaar afhangen:

\`\`\`python
# Task 1: Gather data
data_task = Task(
    description="Verzamel sales data van alle channels",
    agent=data_collector,
    task_id="gather_data"
)

# Task 2: Depends on task 1
analysis_task = Task(
    description="Analyseer de sales trends",
    agent=analyst,
    context=[data_task],  # Expliciet dependency
    depends_on=["gather_data"]  # Voor duidelijkheid
)

# Task 3: Depends on task 2
strategy_task = Task(
    description="Ontwikkel sales strategie op basis van analyse",
    agent=strategist,
    context=[data_task, analysis_task]  # Heeft beide nodig
)
\`\`\`

### Data sharing tussen tasks
CrewAI biedt verschillende manieren om data te delen:

1. **Via context**
\`\`\`python
task2 = Task(
    description="Gebruik de data van de vorige task",
    context=[task1]  # Automatisch access tot task1 output
)
\`\`\`

2. **Via crew memory**
\`\`\`python
crew = Crew(
    agents=agents,
    tasks=tasks,
    memory=True,  # Shared memory tussen alle tasks
    embedder={
        "provider": "openai",
        "config": {"model": "text-embedding-ada-002"}
    }
)
\`\`\`

3. **Via custom callbacks**
\`\`\`python
shared_data = {}

def task_callback(task_output):
    shared_data[task_output.task_id] = task_output.result
    
task = Task(
    description="...",
    callback=task_callback
)
\`\`\`

## Advanced workflow patterns

### Conditional branching
Verschillende paths op basis van resultaten:

\`\`\`python
def conditional_workflow(initial_result):
    if "urgent" in initial_result:
        return [urgent_response_task, escalation_task]
    elif "complex" in initial_result:
        return [deep_analysis_task, expert_consultation_task]
    else:
        return [standard_processing_task]

# Dynamic task creation
initial_task = Task(description="Categoriseer het probleem", agent=triage_agent)
result = crew.kickoff(tasks=[initial_task])

# Bepaal volgende tasks
next_tasks = conditional_workflow(result)
crew.kickoff(tasks=next_tasks)
\`\`\`

### Iterative refinement
Tasks die hun eigen output verbeteren:

\`\`\`python
refinement_task = Task(
    description="""
    Review en verbeter het gegenereerde artikel:
    1. Check feiten en bronnen
    2. Verbeter leesbaarheid
    3. Voeg missende secties toe
    4. Optimaliseer voor SEO
    
    Herhaal tot kwaliteitsscore > 90%
    """,
    agent=editor,
    max_iterations=3,
    quality_threshold=0.9
)
\`\`\`

### Pipeline pattern
Gestructureerde multi-stage processing:

\`\`\`python
class DataPipeline:
    def __init__(self):
        self.stages = []
    
    def add_stage(self, name, task):
        self.stages.append({"name": name, "task": task})
    
    def execute(self, crew):
        results = {}
        for stage in self.stages:
            print(f"Executing stage: {stage['name']}")
            stage_result = crew.kickoff(tasks=[stage['task']])
            results[stage['name']] = stage_result
            
            # Pass result to next stage
            if len(self.stages) > self.stages.index(stage) + 1:
                next_stage = self.stages[self.stages.index(stage) + 1]
                next_stage['task'].context.append(stage['task'])
        
        return results

# Gebruik
pipeline = DataPipeline()
pipeline.add_stage("extract", extraction_task)
pipeline.add_stage("transform", transformation_task)
pipeline.add_stage("load", loading_task)
pipeline.execute(crew)
\`\`\`

## Best practices voor task design

### 1. SMART tasks
- **Specific**: Duidelijk gedefinieerd, geen ambiguïteit
- **Measurable**: Succescriteria zijn meetbaar
- **Achievable**: Realistisch voor de assigned agent
- **Relevant**: Past bij agent's expertise
- **Time-bound**: Duidelijke deadlines/timeouts

### 2. Atomicity
Houd tasks klein en focused. Grote taken opsplitsen:

\`\`\`python
# Slecht: Te groot en vaag
big_task = Task(description="Bouw een complete e-commerce site")

# Goed: Opgesplitst in atomaire taken
tasks = [
    Task(description="Ontwerp database schema voor products en orders"),
    Task(description="Implementeer user authentication API"),
    Task(description="Bouw product catalog frontend"),
    Task(description="Creëer checkout flow")
]
\`\`\`

### 3. Clear success criteria
Definieer wanneer een task succesvol is voltooid:

\`\`\`python
task = Task(
    description="Optimaliseer de homepage load time",
    expected_output="Load time onder 2 seconden op 4G verbinding",
    success_criteria={
        "load_time": "< 2s",
        "lighthouse_score": "> 90",
        "no_console_errors": True
    }
)
\`\`\`

### 4. Error handling
Plan voor wanneer dingen mis gaan:

\`\`\`python
task = Task(
    description="Process customer data",
    agent=processor,
    error_handling={
        "on_timeout": "retry_with_smaller_batch",
        "on_error": "log_and_continue",
        "max_retries": 3,
        "fallback_task": manual_processing_task
    }
)
\`\`\``,
  codeExamples: [
    {
      id: 'example-1',
      title: 'Complete content creation workflow',
      language: 'python',
      code: `from crewai import Agent, Task, Crew
from datetime import datetime

# Agents voor content creation workflow
market_researcher = Agent(
    role="Market Research Analyst",
    goal="Identificeer trending topics en audience interesses",
    backstory="Expert in social media trends en content performance analyse"
)

content_strategist = Agent(
    role="Content Strategist", 
    goal="Ontwikkel content strategie gebaseerd op research",
    backstory="Ervaren strategist die data omzet in actionable content plans"
)

writer = Agent(
    role="Content Writer",
    goal="Schrijf engaging content volgens strategie",
    backstory="Creatieve schrijver met expertise in diverse content formats"
)

seo_specialist = Agent(
    role="SEO Specialist",
    goal="Optimaliseer content voor search engines",
    backstory="Technical SEO expert met focus op content optimization"
)

editor = Agent(
    role="Senior Editor",
    goal="Perfect de content kwaliteit en consistentie",
    backstory="Detail-oriented editor met oog voor quality en brand voice"
)

# Task 1: Market Research
research_task = Task(
    description="""
    Onderzoek trending topics in de tech industry voor Q4 2024:
    1. Analyseer social media trends (LinkedIn, Twitter, Reddit)
    2. Identificeer top 10 meest besproken onderwerpen
    3. Bepaal search volume voor elk topic
    4. Analyseer competitor content performance
    5. Identificeer content gaps en opportunities
    """,
    expected_output="""
    Research rapport met:
    - Top 10 trending topics met metrics
    - Competitor analyse (top 5 competitors)
    - Content gap analysis
    - Aanbevolen focus topics (top 3)
    """,
    agent=market_researcher,
    tools=[],  # Add search tools, analytics tools
    deadline=datetime.now().timestamp() + 3600  # 1 hour
)

# Task 2: Content Strategy (depends on research)
strategy_task = Task(
    description="""
    Ontwikkel een content strategie gebaseerd op de research:
    1. Selecteer 3 topics voor deep-dive artikelen
    2. Bepaal content format voor elk topic (blog, video script, infographic)
    3. Creëer content calendar voor komende maand
    4. Definieer key messages en tone of voice per topic
    5. Stel success metrics vast
    """,
    expected_output="""
    Content strategie document met:
    - 3 uitgewerkte content briefs
    - Content calendar (4 weken)
    - Brand voice guidelines
    - Success metrics en KPIs
    """,
    agent=content_strategist,
    context=[research_task],  # Uses research output
    priority="high"
)

# Task 3: Content Creation (depends on strategy)
writing_task = Task(
    description="""
    Schrijf het eerste artikel volgens de content strategie:
    1. Kies het hoogst geprioriteerde topic
    2. Schrijf een comprehensive artikel (1500-2000 woorden)
    3. Include relevante examples en case studies
    4. Voeg data en statistics toe waar relevant
    5. Creëer engaging intro en conclusie
    6. Suggereer 3-5 visuals/graphics
    """,
    expected_output="""
    Volledig artikel met:
    - Catchy headline en sub-headers
    - Well-structured body content
    - Data-backed arguments
    - Call-to-action
    - Visual suggestions met descriptions
    """,
    agent=writer,
    context=[research_task, strategy_task],
    output_format="markdown"
)

# Task 4: SEO Optimization (enhances written content)
seo_task = Task(
    description="""
    Optimaliseer het artikel voor search engines:
    1. Keyword research voor het topic
    2. Optimaliseer title tag en meta description
    3. Verbeter header structuur (H1, H2, H3)
    4. Add internal linking suggesties
    5. Optimaliseer images alt texts
    6. Check keyword density en readability
    7. Creëer SEO checklist
    """,
    expected_output="""
    SEO geoptimaliseerd artikel met:
    - Title tag (max 60 chars)
    - Meta description (max 160 chars)
    - Keyword mapping
    - Internal link suggestions
    - Technical SEO checklist
    """,
    agent=seo_specialist,
    context=[writing_task],
    tools=[]  # SEO analysis tools
)

# Task 5: Final Edit (polishes everything)
editing_task = Task(
    description="""
    Finale review en editing van het artikel:
    1. Check grammatica en spelling
    2. Verbeter flow en leesbaarheid
    3. Ensure brand voice consistency
    4. Fact-check alle claims en data
    5. Optimaliseer voor user engagement
    6. Finale quality score (1-10)
    """,
    expected_output="""
    Publicatie-klaar artikel met:
    - Alle edits geïmplementeerd
    - Fact-checking rapport
    - Quality score met rationale
    - Publicatie checklist
    """,
    agent=editor,
    context=[writing_task, seo_task],
    requires_human_feedback=True
)

# Creëer de workflow crew
content_crew = Crew(
    agents=[
        market_researcher,
        content_strategist,
        writer,
        seo_specialist,
        editor
    ],
    tasks=[
        research_task,
        strategy_task,
        writing_task,
        seo_task,
        editing_task
    ],
    process="sequential",  # Tasks in order
    verbose=True,
    memory=True,  # Share context between tasks
    embedder={
        "provider": "openai",
        "config": {
            "model": "text-embedding-ada-002"
        }
    }
)

# Execute workflow
print("Starting content creation workflow...")
result = content_crew.kickoff()

print(f"\\nWorkflow completed!")
print(f"Final output: {result}")

# Access individual task results
for task in content_crew.tasks:
    print(f"\\nTask: {task.description[:50]}...")
    print(f"Status: {task.status}")
    print(f"Output preview: {task.output[:200]}...")`
    },
    {
      id: 'example-2',
      title: 'Parallel task execution pattern',
      language: 'python',
      code: `from crewai import Agent, Task, Crew
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

# Agents voor parallel data processing
data_collectors = [
    Agent(
        role=f"Data Collector {i}",
        goal=f"Collect data from source {i}",
        backstory=f"Specialist in data source {i} with API expertise"
    ) for i in range(1, 5)
]

data_processor = Agent(
    role="Data Processing Expert",
    goal="Process en combineer data van alle sources",
    backstory="Expert in data transformation en integration"
)

quality_checker = Agent(
    role="Data Quality Analyst",
    goal="Ensure data quality en consistency",
    backstory="Specialist in data validation en quality assurance"
)

# Parallel data collection tasks
collection_tasks = [
    Task(
        description=f"""
        Collect data from API source {i}:
        1. Connect to API endpoint
        2. Fetch last 30 days of data
        3. Validate data completeness
        4. Format according to schema
        """,
        expected_output="Formatted JSON data with metadata",
        agent=data_collectors[i-1],
        task_id=f"collect_source_{i}"
    ) for i in range(1, 5)
]

# Custom parallel execution function
def execute_parallel_tasks(tasks, max_workers=4):
    """Execute multiple tasks in parallel"""
    results = {}
    start_time = time.time()
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Submit all tasks
        future_to_task = {
            executor.submit(task.agent.execute, task): task 
            for task in tasks
        }
        
        # Process completed tasks
        for future in as_completed(future_to_task):
            task = future_to_task[future]
            try:
                result = future.result()
                results[task.task_id] = {
                    "status": "completed",
                    "result": result,
                    "duration": time.time() - start_time
                }
                print(f"✓ Task {task.task_id} completed")
            except Exception as exc:
                results[task.task_id] = {
                    "status": "failed", 
                    "error": str(exc),
                    "duration": time.time() - start_time
                }
                print(f"✗ Task {task.task_id} failed: {exc}")
    
    return results

# Execute collection tasks in parallel
print("Starting parallel data collection...")
collection_results = execute_parallel_tasks(collection_tasks)

# Processing task that depends on all collection tasks
processing_task = Task(
    description=f"""
    Process en integreer alle collected data:
    1. Combine data van alle 4 sources
    2. Remove duplicates en conflicts
    3. Apply business rules en transformations
    4. Create unified dataset
    5. Generate summary statistics
    
    Available data: {list(collection_results.keys())}
    """,
    expected_output="""
    Unified dataset met:
    - Combined records count
    - Data quality metrics
    - Transformation log
    - Summary statistics
    """,
    agent=data_processor,
    context=collection_tasks  # Access to all collection outputs
)

# Quality check task
quality_task = Task(
    description="""
    Valideer de processed data:
    1. Check data completeness (no missing required fields)
    2. Validate data types en formats
    3. Check business rule compliance
    4. Identify anomalies of outliers
    5. Generate quality report
    """,
    expected_output="Quality report with pass/fail status and issues found",
    agent=quality_checker,
    context=[processing_task]
)

# Sequential processing after parallel collection
post_process_crew = Crew(
    agents=[data_processor, quality_checker],
    tasks=[processing_task, quality_task],
    process="sequential"
)

# Execute post-processing
print("\\nStarting data processing and quality check...")
final_result = post_process_crew.kickoff()

# Advanced parallel pattern with dependencies
class ParallelWorkflow:
    def __init__(self):
        self.tasks = {}
        self.dependencies = {}
        
    def add_task(self, task_id, task, depends_on=None):
        self.tasks[task_id] = task
        self.dependencies[task_id] = depends_on or []
        
    def execute(self):
        completed = set()
        results = {}
        
        while len(completed) < len(self.tasks):
            # Find tasks ready to execute
            ready_tasks = []
            for task_id, deps in self.dependencies.items():
                if task_id not in completed and all(d in completed for d in deps):
                    ready_tasks.append(task_id)
            
            if not ready_tasks:
                raise Exception("Circular dependency detected!")
            
            # Execute ready tasks in parallel
            batch_results = execute_parallel_tasks(
                [self.tasks[tid] for tid in ready_tasks]
            )
            
            # Mark as completed
            completed.update(ready_tasks)
            results.update(batch_results)
            
        return results

# Example usage of advanced parallel workflow
workflow = ParallelWorkflow()

# Add tasks with dependencies
workflow.add_task("fetch_users", user_fetch_task)
workflow.add_task("fetch_orders", order_fetch_task)
workflow.add_task("fetch_products", product_fetch_task)
workflow.add_task("analyze_users", user_analysis_task, depends_on=["fetch_users"])
workflow.add_task("analyze_orders", order_analysis_task, depends_on=["fetch_orders", "fetch_products"])
workflow.add_task("generate_report", report_task, depends_on=["analyze_users", "analyze_orders"])

# Execute with automatic parallelization
results = workflow.execute()`
    },
    {
      id: 'example-3',
      title: 'Dynamic workflow met conditional logic',
      language: 'python',
      code: `from crewai import Agent, Task, Crew
from typing import List, Dict, Any

# Agents voor customer support workflow
initial_analyzer = Agent(
    role="Support Ticket Analyzer",
    goal="Categorize en prioritize customer issues",
    backstory="AI specialist in natural language understanding en issue classification"
)

technical_support = Agent(
    role="Technical Support Engineer",
    goal="Resolve technical issues en bugs",
    backstory="Senior engineer met debugging expertise"
)

billing_specialist = Agent(
    role="Billing Specialist", 
    goal="Handle payment en subscription issues",
    backstory="Expert in payment systems en customer accounts"
)

customer_success = Agent(
    role="Customer Success Manager",
    goal="Handle general inquiries en relationship management",
    backstory="Experienced in customer satisfaction en retention"
)

escalation_manager = Agent(
    role="Escalation Manager",
    goal="Handle complex of high-priority issues",
    backstory="Senior manager met authority to make exceptions"
)

# Initial analysis task
def create_analysis_task(ticket_content: str) -> Task:
    return Task(
        description=f"""
        Analyseer deze customer support ticket:
        
        {ticket_content}
        
        Bepaal:
        1. Category (technical/billing/general/urgent)
        2. Priority (low/medium/high/critical)
        3. Sentiment (positive/neutral/negative/angry)
        4. Estimated resolution time
        5. Suggested response approach
        """,
        expected_output="""
        JSON object met:
        - category: string
        - priority: string  
        - sentiment: string
        - estimated_time: integer (minutes)
        - approach: string
        """,
        agent=initial_analyzer,
        output_format="json"
    )

# Dynamic task creation based on analysis
def create_resolution_tasks(analysis_result: Dict[str, Any]) -> List[Task]:
    tasks = []
    
    category = analysis_result.get("category", "general")
    priority = analysis_result.get("priority", "medium")
    sentiment = analysis_result.get("sentiment", "neutral")
    
    # Base resolution task based on category
    if category == "technical":
        resolution_task = Task(
            description=f"""
            Resolve technical issue:
            1. Identify root cause
            2. Provide step-by-step solution
            3. Create knowledge base entry if new issue
            4. Test solution if possible
            Priority: {priority}
            """,
            agent=technical_support,
            expected_output="Technical solution with steps en KB entry"
        )
        tasks.append(resolution_task)
        
    elif category == "billing":
        resolution_task = Task(
            description=f"""
            Resolve billing issue:
            1. Check payment history
            2. Identify discrepancies
            3. Propose resolution (refund/credit/fix)
            4. Update billing system
            Priority: {priority}
            """,
            agent=billing_specialist,
            expected_output="Billing resolution with actions taken"
        )
        tasks.append(resolution_task)
        
    else:  # general
        resolution_task = Task(
            description=f"""
            Handle customer inquiry:
            1. Provide helpful information
            2. Address concerns empathetically
            3. Offer additional resources
            4. Ensure satisfaction
            Sentiment: {sentiment}
            """,
            agent=customer_success,
            expected_output="Customer response with resolution"
        )
        tasks.append(resolution_task)
    
    # Add escalation if high priority or angry sentiment
    if priority in ["high", "critical"] or sentiment == "angry":
        escalation_task = Task(
            description=f"""
            Escalation required:
            - Priority: {priority}
            - Sentiment: {sentiment}
            - Category: {category}
            
            Actions:
            1. Review proposed resolution
            2. Authorize exceptions if needed
            3. Add compensation if appropriate
            4. Ensure VIP treatment
            """,
            agent=escalation_manager,
            expected_output="Escalation decision with special actions"
        )
        tasks.append(escalation_task)
    
    # Add follow-up task for negative sentiment
    if sentiment in ["negative", "angry"]:
        followup_task = Task(
            description="""
            Schedule follow-up:
            1. Set reminder for 24-48 hours
            2. Prepare personalized check-in
            3. Monitor satisfaction improvement
            4. Offer additional support
            """,
            agent=customer_success,
            expected_output="Follow-up plan with timeline"
        )
        tasks.append(followup_task)
    
    return tasks

# Workflow orchestrator
class DynamicSupportWorkflow:
    def __init__(self):
        self.agents = {
            "analyzer": initial_analyzer,
            "technical": technical_support,
            "billing": billing_specialist,
            "success": customer_success,
            "escalation": escalation_manager
        }
        
    def process_ticket(self, ticket_content: str) -> Dict[str, Any]:
        # Step 1: Analyze ticket
        analysis_task = create_analysis_task(ticket_content)
        analysis_crew = Crew(
            agents=[initial_analyzer],
            tasks=[analysis_task],
            verbose=True
        )
        
        print("🔍 Analyzing ticket...")
        analysis_result = analysis_crew.kickoff()
        
        # Parse analysis result (assuming JSON output)
        import json
        try:
            analysis_data = json.loads(analysis_result)
        except:
            analysis_data = {"category": "general", "priority": "medium", "sentiment": "neutral"}
        
        print(f"📊 Analysis complete: {analysis_data}")
        
        # Step 2: Create resolution tasks dynamically
        resolution_tasks = create_resolution_tasks(analysis_data)
        
        if not resolution_tasks:
            return {"status": "no_action_needed", "analysis": analysis_data}
        
        # Step 3: Execute resolution workflow
        resolution_agents = []
        for task in resolution_tasks:
            if task.agent:
                resolution_agents.append(task.agent)
        
        resolution_crew = Crew(
            agents=list(set(resolution_agents)),  # Unique agents
            tasks=resolution_tasks,
            process="sequential",
            verbose=True
        )
        
        print(f"🔧 Executing {len(resolution_tasks)} resolution tasks...")
        resolution_result = resolution_crew.kickoff()
        
        return {
            "status": "resolved",
            "analysis": analysis_data,
            "resolution": resolution_result,
            "tasks_executed": len(resolution_tasks)
        }

# Example usage
workflow = DynamicSupportWorkflow()

# Test with different ticket types
test_tickets = [
    {
        "content": "My app crashes every time I try to upload a photo. This is really frustrating!",
        "expected": "technical + escalation due to frustration"
    },
    {
        "content": "I was charged twice for my subscription this month. Please refund the extra charge.",
        "expected": "billing resolution"
    },
    {
        "content": "Can you tell me more about your enterprise features?",
        "expected": "general inquiry"
    },
    {
        "content": "THIS IS UNACCEPTABLE! I've been waiting for 3 days and no one has helped me!!!",
        "expected": "escalation + follow-up due to anger"
    }
]

for ticket in test_tickets:
    print(f"\\n{'='*60}")
    print(f"Processing: {ticket['content'][:50]}...")
    print(f"Expected: {ticket['expected']}")
    print(f"{'='*60}\\n")
    
    result = workflow.process_ticket(ticket['content'])
    print(f"\\n✅ Result: {result['status']}")
    print(f"Tasks executed: {result.get('tasks_executed', 0)}")`
    }
  ],
  assignments: [
    {
      id: 'assignment-1',
      title: 'Design een complete workflow voor jouw use case',
      type: 'project',
      difficulty: 'medium',
      description: `Ontwerp en implementeer een complete workflow voor een realistische use case:

1. **Kies een domein** (voorbeelden):
   - Blog post productie pipeline
   - Software release workflow
   - Data analyse pipeline
   - Customer onboarding flow

2. **Design de workflow**:
   - Identificeer alle benodigde stappen
   - Bepaal dependencies tussen tasks
   - Kies tussen sequential, hierarchical of parallel execution
   - Design error handling en fallbacks

3. **Implementeer met CrewAI**:
   - Creëer alle benodigde agents
   - Definieer tasks met duidelijke outputs
   - Implementeer data flow tussen tasks
   - Test met realistische input

4. **Optimaliseer**:
   - Meet execution time
   - Identificeer bottlenecks
   - Implementeer parallel execution waar mogelijk`,
      hints: [
        'Start met een diagram van je workflow',
        'Test elke task individueel eerst',
        'Gebruik context sharing voor data flow',
        'Monitor welke tasks het langst duren'
      ]
    },
    {
      id: 'assignment-2',
      title: 'Bouw een adaptive workflow system',
      type: 'project',
      difficulty: 'hard',
      description: `Creëer een workflow systeem dat zich aanpast aan verschillende scenarios:

1. **Implementeer conditional logic**:
   - Workflow past zich aan op basis van input
   - Verschillende paths voor verschillende scenarios
   - Dynamic task creation

2. **Add intelligence**:
   - Laat het systeem leren van eerdere runs
   - Optimaliseer task assignment
   - Voorspel execution time

3. **Build monitoring**:
   - Track success rates per task type
   - Identificeer failure patterns
   - Genereer improvement suggestions

4. **Test robuustheid**:
   - Simuleer failures
   - Test edge cases
   - Measure recovery time`,
      hints: [
        'Begin met 2-3 eenvoudige scenarios',
        'Log alle beslissingen voor analyse',
        'Gebruik A/B testing voor optimalisaties'
      ]
    }
  ],
  resources: [
    {
      title: 'CrewAI Tasks Documentation',
      url: 'https://docs.crewai.com/core-concepts/tasks',
      type: 'documentation'
    },
    {
      title: 'Workflow Orchestration Best Practices',
      url: 'https://crewai.com/workflows',
      type: 'guide'
    },
    {
      title: 'Building Resilient AI Workflows',
      url: 'https://www.youtube.com/watch?v=workflow-patterns',
      type: 'video'
    },
    {
      title: 'Task Dependency Management',
      url: 'https://github.com/crewai/examples/workflows',
      type: 'code'
    }
  ]
}