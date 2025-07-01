import { Lesson } from '@/lib/data/courses'

export const lesson1_4: Lesson = {
  id: 'lesson-1-4',
  title: 'Crews: Teams samenstellen en coördineren',
  duration: '40 min',
  content: `# Crews: Teams samenstellen en coördineren

## Wat is een Crew?

Een Crew in CrewAI is een georganiseerd team van AI agents die samenwerken om complexe doelen te bereiken. Het is het orkestratieniveau waar agents, taken, en workflows samenkomen. Denk aan een Crew als een projectteam waarbij elke agent een specialist is met eigen verantwoordelijkheden, maar allemaal werken ze naar een gemeenschappelijk doel.

## Crew architectuur

### Core componenten van een Crew

#### 1. Agents Collection
De teamleden - elke agent brengt specifieke vaardigheden:

\`\`\`python
crew = Crew(
    agents=[
        lead_developer,
        frontend_specialist, 
        backend_engineer,
        qa_tester,
        devops_engineer
    ]
)
\`\`\`

#### 2. Tasks Pipeline
De werk items die uitgevoerd moeten worden:

\`\`\`python
crew = Crew(
    agents=agents,
    tasks=[
        architecture_task,
        implementation_task,
        testing_task,
        deployment_task
    ]
)
\`\`\`

#### 3. Process Type
Hoe het werk georganiseerd wordt:

\`\`\`python
# Sequential: taken worden één voor één uitgevoerd
crew = Crew(process="sequential")

# Hierarchical: een manager delegeert werk
crew = Crew(process="hierarchical")
\`\`\`

#### 4. Memory System
Gedeelde kennis tussen agents:

\`\`\`python
crew = Crew(
    agents=agents,
    tasks=tasks,
    memory=True,
    embedder={
        "provider": "openai",
        "config": {"model": "text-embedding-ada-002"}
    }
)
\`\`\`

## Crew configuratie opties

### Execution parameters

\`\`\`python
crew = Crew(
    agents=agents,
    tasks=tasks,
    
    # Verbosity en debugging
    verbose=2,  # 0=quiet, 1=normal, 2=detailed
    
    # Process configuratie
    process="sequential",
    
    # Manager voor hierarchical process
    manager_llm=ChatOpenAI(model="gpt-4"),
    
    # Memory settings
    memory=True,
    short_term_memory=True,
    long_term_memory=True,
    
    # Performance settings
    max_rpm=100,  # Rate limiting
    max_execution_time=3600,  # 1 hour timeout
    
    # Output settings
    output_log_file="crew_execution.log",
    
    # Callbacks voor monitoring
    callbacks=[ExecutionLogger(), PerformanceTracker()],
    
    # Language settings
    language="nl",  # Nederlands
    
    # Retry configuratie
    retry_on_failure=True,
    max_retries=3
)
\`\`\`

### Manager configuratie (Hierarchical mode)

Bij hierarchical process neemt een manager agent de leiding:

\`\`\`python
crew = Crew(
    agents=[developer, designer, tester],
    tasks=tasks,
    process="hierarchical",
    manager_llm=ChatOpenAI(
        model="gpt-4",
        temperature=0.7
    ),
    manager_callbacks=[ManagerDecisionLogger()],
    planning_llm=ChatOpenAI(  # Voor planning phase
        model="gpt-4",
        temperature=0.5
    )
)
\`\`\`

## Team compositie strategieën

### 1. Specialized Teams
Highly focused teams met duidelijke expertise gebieden:

\`\`\`python
def create_research_crew():
    """Specialized research team voor marktanalyse"""
    
    # Diverse research specialisten
    market_analyst = Agent(
        role="Market Research Analyst",
        goal="Analyze market trends en opportunities"
    )
    
    competitor_analyst = Agent(
        role="Competitive Intelligence Specialist",
        goal="Deep dive competitor strategies"
    )
    
    data_scientist = Agent(
        role="Data Scientist",
        goal="Extract insights from complex datasets"
    )
    
    report_writer = Agent(
        role="Research Report Writer",
        goal="Synthesize findings into actionable reports"
    )
    
    return Crew(
        agents=[market_analyst, competitor_analyst, data_scientist, report_writer],
        tasks=research_tasks,
        process="sequential"  # Clear handoffs tussen specialisten
    )
\`\`\`

### 2. Cross-functional Teams
Teams die end-to-end verantwoordelijkheid hebben:

\`\`\`python
def create_product_crew():
    """Cross-functional product development team"""
    
    return Crew(
        agents=[
            product_manager,
            ux_designer,
            frontend_dev,
            backend_dev,
            qa_engineer,
            devops_specialist
        ],
        tasks=product_tasks,
        process="hierarchical",  # PM coordineert
        manager_llm=ChatOpenAI(model="gpt-4")
    )
\`\`\`

### 3. Swarm Teams
Grote teams voor parallelle verwerking:

\`\`\`python
def create_data_processing_swarm(num_processors=10):
    """Swarm voor large-scale data processing"""
    
    # Create multiple processor agents
    processors = [
        Agent(
            role=f"Data Processor {i}",
            goal="Process data chunks efficiently"
        ) for i in range(num_processors)
    ]
    
    # Add coordinator
    coordinator = Agent(
        role="Swarm Coordinator",
        goal="Distribute work en aggregate results"
    )
    
    return Crew(
        agents=[coordinator] + processors,
        tasks=processing_tasks,
        process="hierarchical",
        parallel_execution=True
    )
\`\`\`

## Advanced Crew patterns

### Dynamic Crew Assembly
Crews die zich aanpassen aan de situatie:

\`\`\`python
class AdaptiveCrew:
    def __init__(self):
        self.agent_pool = {
            "researcher": research_agent,
            "developer": dev_agent,
            "designer": design_agent,
            "analyst": analyst_agent,
            "writer": writer_agent
        }
        
    def assemble_crew(self, project_type: str) -> Crew:
        """Assemble crew based on project needs"""
        
        if project_type == "technical_blog":
            selected_agents = [
                self.agent_pool["researcher"],
                self.agent_pool["developer"],
                self.agent_pool["writer"]
            ]
        elif project_type == "ui_redesign":
            selected_agents = [
                self.agent_pool["designer"],
                self.agent_pool["developer"],
                self.agent_pool["analyst"]
            ]
        else:
            selected_agents = list(self.agent_pool.values())
            
        return Crew(
            agents=selected_agents,
            tasks=self.generate_tasks(project_type),
            process="sequential"
        )
\`\`\`

### Multi-stage Crews
Crews die in fases werken:

\`\`\`python
class MultiStagePipeline:
    def __init__(self):
        self.stages = {
            "research": self.create_research_crew(),
            "development": self.create_dev_crew(),
            "testing": self.create_qa_crew(),
            "deployment": self.create_ops_crew()
        }
        
    def execute_pipeline(self, project_spec):
        results = {}
        context = []
        
        for stage_name, crew in self.stages.items():
            print(f"\\nExecuting stage: {stage_name}")
            
            # Pass context from previous stages
            for task in crew.tasks:
                task.context.extend(context)
            
            # Execute stage
            stage_result = crew.kickoff()
            results[stage_name] = stage_result
            
            # Add to context for next stage
            context.append(stage_result)
            
            # Check if we should continue
            if self.should_halt(stage_result):
                break
                
        return results
\`\`\`

### Collaborative Crews
Meerdere crews die samenwerken:

\`\`\`python
class CollaborativeSystem:
    def __init__(self):
        self.research_crew = Crew(
            agents=[researcher1, researcher2],
            tasks=research_tasks
        )
        
        self.analysis_crew = Crew(
            agents=[analyst1, analyst2],
            tasks=analysis_tasks
        )
        
        self.synthesis_crew = Crew(
            agents=[synthesizer, writer],
            tasks=synthesis_tasks
        )
        
    def collaborate(self, topic):
        # Parallel research
        research_results = []
        with ThreadPoolExecutor(max_workers=2) as executor:
            future1 = executor.submit(
                self.research_crew.kickoff,
                inputs={"focus": "academic_sources", "topic": topic}
            )
            future2 = executor.submit(
                self.research_crew.kickoff,
                inputs={"focus": "industry_sources", "topic": topic}
            )
            
            research_results = [future1.result(), future2.result()]
        
        # Sequential analysis
        analysis_input = {"research": research_results}
        analysis_result = self.analysis_crew.kickoff(inputs=analysis_input)
        
        # Final synthesis
        synthesis_input = {
            "research": research_results,
            "analysis": analysis_result
        }
        final_output = self.synthesis_crew.kickoff(inputs=synthesis_input)
        
        return final_output
\`\`\`

## Performance optimalisatie

### 1. Agent pooling
Hergebruik agents across multiple crews:

\`\`\`python
class AgentPool:
    def __init__(self):
        self._agents = {}
        self._available = set()
        
    def get_agent(self, role: str) -> Agent:
        if role not in self._agents:
            self._agents[role] = self._create_agent(role)
        
        # Wait if agent is busy
        while role not in self._available:
            time.sleep(0.1)
            
        self._available.remove(role)
        return self._agents[role]
    
    def release_agent(self, role: str):
        self._available.add(role)
\`\`\`

### 2. Caching strategies
Vermijd dubbel werk:

\`\`\`python
crew = Crew(
    agents=agents,
    tasks=tasks,
    cache=True,
    cache_handler=CustomCacheHandler(
        cache_dir="./crew_cache",
        ttl=3600,  # 1 hour
        max_size_mb=1000
    )
)
\`\`\`

### 3. Resource management
Beheer API calls en resources:

\`\`\`python
from crewai.utilities import RPMController

crew = Crew(
    agents=agents,
    tasks=tasks,
    rpm_controller=RPMController(
        max_rpm=100,
        max_concurrent=5
    )
)
\`\`\`

## Monitoring en observability

### Execution tracking
Monitor crew performance:

\`\`\`python
class CrewMonitor:
    def __init__(self, crew: Crew):
        self.crew = crew
        self.metrics = {
            "start_time": None,
            "end_time": None,
            "task_durations": {},
            "agent_utilization": {},
            "errors": []
        }
        
    def start_monitoring(self):
        self.metrics["start_time"] = time.time()
        
        # Add callbacks
        for task in self.crew.tasks:
            task.callback = self.task_callback
            
    def task_callback(self, task_output):
        task_id = task_output.task_id
        self.metrics["task_durations"][task_id] = task_output.duration
        self.metrics["agent_utilization"][task_output.agent] = \
            self.metrics["agent_utilization"].get(task_output.agent, 0) + 1
\`\`\`

### Health checks
Ensure crew gezondheid:

\`\`\`python
def crew_health_check(crew: Crew) -> Dict[str, Any]:
    health_status = {
        "agents_ready": all(agent.ready() for agent in crew.agents),
        "tasks_valid": all(task.validate() for task in crew.tasks),
        "memory_available": crew.memory_health() if crew.memory else True,
        "resources_sufficient": check_resources()
    }
    
    health_status["overall"] = all(health_status.values())
    return health_status
\`\`\`

## Best practices voor Crew management

### 1. Team sizing
- **Klein (2-4 agents)**: Voor focused, specifieke taken
- **Medium (5-8 agents)**: Voor complexe projecten met duidelijke fases
- **Groot (9+ agents)**: Voor large-scale processing met parallelisatie

### 2. Communication patterns
- **Sequential**: Voor duidelijke handoffs en dependencies
- **Hierarchical**: Voor complexe coördinatie en decision making
- **Mesh**: Voor collaborative problem solving

### 3. Error handling
Implementeer robuuste foutafhandeling:

\`\`\`python
crew = Crew(
    agents=agents,
    tasks=tasks,
    error_handling="continue_on_error",  # of "halt_on_error"
    fallback_crew=backup_crew,  # Backup team
    error_callbacks=[
        lambda e: logger.error(f"Crew error: {e}"),
        lambda e: notify_admin(e) if is_critical(e) else None
    ]
)
\`\`\`

### 4. Testing strategies
Test je crews grondig:

\`\`\`python
def test_crew_integration():
    # Test met mock agents
    mock_agents = [MockAgent(role) for role in required_roles]
    test_crew = Crew(agents=mock_agents, tasks=test_tasks)
    
    # Test verschillende scenarios
    test_cases = [
        {"input": "normal_case", "expected": "success"},
        {"input": "edge_case", "expected": "handled"},
        {"input": "error_case", "expected": "recovered"}
    ]
    
    for test in test_cases:
        result = test_crew.kickoff(inputs=test["input"])
        assert evaluate_result(result, test["expected"])
\`\`\``,
  codeExamples: [
    {
      id: 'example-1',
      title: 'Complete software development crew',
      language: 'python',
      code: `from crewai import Agent, Task, Crew
from crewai_tools import GithubSearchTool, CodeDocsSearchTool, CodeInterpreterTool
from typing import List
import json

# Initialize tools
github_tool = GithubSearchTool()
docs_tool = CodeDocsSearchTool()
code_tool = CodeInterpreterTool()

# Create specialized development agents
tech_lead = Agent(
    role='Technical Lead',
    goal='Architect scalable solutions and guide technical decisions',
    backstory="""You are a seasoned technical lead with 15 years of experience
    in building distributed systems. You have a keen eye for architecture patterns,
    performance optimization, and making pragmatic technical decisions. You believe
    in evolutionary architecture and are skilled at balancing technical excellence
    with business needs.""",
    tools=[github_tool, docs_tool],
    allow_delegation=True,
    verbose=True
)

backend_developer = Agent(
    role='Senior Backend Developer',
    goal='Implement robust and efficient backend services',
    backstory="""You are an expert backend developer specializing in Python and Node.js.
    With deep knowledge of microservices, API design, and database optimization,
    you write clean, testable code. You're passionate about performance and have
    experience with high-traffic applications.""",
    tools=[code_tool, github_tool],
    max_iter=5
)

frontend_developer = Agent(
    role='Frontend Architect',
    goal='Create intuitive and performant user interfaces',
    backstory="""As a frontend specialist, you excel in React, Vue, and modern CSS.
    You have a strong understanding of UX principles and accessibility standards.
    You're known for creating smooth, responsive interfaces that delight users
    while maintaining excellent performance scores.""",
    tools=[code_tool, docs_tool]
)

devops_engineer = Agent(
    role='DevOps Engineer',
    goal='Ensure reliable deployment and infrastructure',
    backstory="""You are a DevOps expert who lives by "Infrastructure as Code".
    Proficient in Kubernetes, Terraform, and CI/CD pipelines, you automate
    everything that can be automated. You have prevented countless production
    issues through proper monitoring and alerting.""",
    tools=[github_tool]
)

qa_engineer = Agent(
    role='QA Automation Engineer',
    goal='Guarantee software quality through comprehensive testing',
    backstory="""You are a quality advocate who believes testing is everyone's
    responsibility. Expert in test automation, you write comprehensive test
    suites that catch bugs before they reach production. You champion TDD
    and have a sixth sense for edge cases.""",
    tools=[code_tool]
)

security_engineer = Agent(
    role='Security Engineer',
    goal='Identify and mitigate security vulnerabilities',
    backstory="""As a former ethical hacker, you think like an attacker to
    defend systems. You're well-versed in OWASP top 10, secure coding practices,
    and compliance requirements. Security isn't a feature for you - it's a
    fundamental requirement.""",
    tools=[github_tool, code_tool]
)

# Define project specification
project_spec = """
Build a secure user authentication service with the following requirements:
1. JWT-based authentication
2. OAuth2 integration (Google, GitHub)
3. Role-based access control (RBAC)
4. Rate limiting and brute force protection
5. Audit logging
6. Multi-factor authentication (MFA) support
7. RESTful API with OpenAPI documentation
8. React-based admin dashboard
9. Kubernetes deployment ready
10. Comprehensive test coverage (>90%)
"""

# Create tasks for the development process
architecture_task = Task(
    description=f"""
    Design the architecture for the authentication service:
    
    {project_spec}
    
    Create:
    1. High-level architecture diagram
    2. API specification (OpenAPI format)
    3. Database schema design
    4. Security threat model
    5. Technology stack recommendations
    6. Deployment architecture
    """,
    expected_output="""
    Complete architecture document including:
    - System design with components and interactions
    - API endpoints specification
    - Database schema with relationships
    - Security considerations and mitigations
    - Tech stack justification
    - Deployment strategy
    """,
    agent=tech_lead
)

backend_implementation_task = Task(
    description="""
    Implement the backend authentication service based on the architecture:
    1. Set up project structure and dependencies
    2. Implement JWT token management
    3. Create OAuth2 integration modules
    4. Build RBAC system with permissions
    5. Add rate limiting middleware
    6. Implement audit logging
    7. Create MFA support
    8. Write API documentation
    """,
    expected_output="Complete backend code with all features implemented and documented",
    agent=backend_developer,
    context=[architecture_task]
)

frontend_implementation_task = Task(
    description="""
    Build the React admin dashboard:
    1. Create responsive UI components
    2. Implement authentication flow
    3. Build user management interface
    4. Create role and permission management
    5. Add audit log viewer
    6. Implement MFA setup flow
    7. Ensure accessibility compliance
    """,
    expected_output="Complete React application with all admin features",
    agent=frontend_developer,
    context=[architecture_task, backend_implementation_task]
)

testing_task = Task(
    description="""
    Create comprehensive test suite:
    1. Write unit tests for all components (aim for >90% coverage)
    2. Create integration tests for API endpoints
    3. Build E2E tests for critical user flows
    4. Implement performance tests
    5. Add security tests (penetration testing)
    6. Create load tests for rate limiting
    7. Document test strategies
    """,
    expected_output="Complete test suite with coverage reports and test documentation",
    agent=qa_engineer,
    context=[backend_implementation_task, frontend_implementation_task]
)

security_audit_task = Task(
    description="""
    Perform security audit:
    1. Review code for security vulnerabilities
    2. Check OWASP top 10 compliance
    3. Validate JWT implementation
    4. Test rate limiting effectiveness
    5. Verify audit logging completeness
    6. Check for secrets in code
    7. Validate RBAC implementation
    8. Create security report with findings
    """,
    expected_output="Security audit report with findings, risk levels, and remediation steps",
    agent=security_engineer,
    context=[backend_implementation_task, frontend_implementation_task, testing_task]
)

deployment_task = Task(
    description="""
    Prepare for production deployment:
    1. Create Dockerfile for application
    2. Write Kubernetes manifests (deployment, service, ingress)
    3. Set up Helm chart
    4. Create CI/CD pipeline (GitHub Actions)
    5. Configure monitoring and alerting
    6. Write deployment documentation
    7. Create runbooks for common issues
    """,
    expected_output="Complete deployment package with automation and documentation",
    agent=devops_engineer,
    context=[backend_implementation_task, testing_task, security_audit_task]
)

# Create the development crew
dev_crew = Crew(
    agents=[
        tech_lead,
        backend_developer,
        frontend_developer,
        qa_engineer,
        security_engineer,
        devops_engineer
    ],
    tasks=[
        architecture_task,
        backend_implementation_task,
        frontend_implementation_task,
        testing_task,
        security_audit_task,
        deployment_task
    ],
    process="sequential",  # Tasks build on each other
    verbose=2,  # Detailed output
    memory=True,  # Enable memory for context sharing
    embedder={
        "provider": "openai",
        "config": {"model": "text-embedding-ada-002"}
    },
    max_rpm=60,  # Rate limiting
    callbacks=[
        lambda output: print(f"✓ Completed: {output.task_description[:50]}..."),
        lambda output: save_artifact(output)  # Save intermediate results
    ]
)

# Function to save artifacts
def save_artifact(output):
    """Save task outputs as artifacts"""
    import os
    os.makedirs("artifacts", exist_ok=True)
    
    filename = f"artifacts/{output.task_id}_{output.agent}.json"
    with open(filename, 'w') as f:
        json.dump({
            "task": output.task_description,
            "agent": output.agent,
            "output": output.result,
            "timestamp": output.timestamp
        }, f, indent=2)

# Execute the development process
print("🚀 Starting development crew for authentication service...")
print(f"Team size: {len(dev_crew.agents)} agents")
print(f"Tasks to complete: {len(dev_crew.tasks)}")
print("-" * 60)

result = dev_crew.kickoff()

print("\\n✅ Development completed!")
print(f"Final output: {result[:200]}...")

# Generate summary report
summary = {
    "project": "Authentication Service",
    "team_size": len(dev_crew.agents),
    "tasks_completed": len(dev_crew.tasks),
    "memory_usage": dev_crew.memory.usage() if dev_crew.memory else "N/A",
    "execution_time": dev_crew.execution_time,
    "status": "completed"
}

print(f"\\n📊 Summary: {json.dumps(summary, indent=2)}")`
    },
    {
      id: 'example-2',
      title: 'Dynamic crew met adaptive behavior',
      language: 'python',
      code: `from crewai import Agent, Task, Crew
from typing import Dict, List, Any, Optional
import time
from enum import Enum

class ProjectComplexity(Enum):
    SIMPLE = "simple"
    MODERATE = "moderate"
    COMPLEX = "complex"
    CRITICAL = "critical"

class AdaptiveCrew:
    """
    Een crew die zich aanpast aan project complexiteit en requirements
    """
    
    def __init__(self):
        # Agent pool - alle beschikbare agents
        self.agent_pool = self._initialize_agent_pool()
        
        # Crew templates voor verschillende scenarios
        self.crew_templates = {
            ProjectComplexity.SIMPLE: ["generalist"],
            ProjectComplexity.MODERATE: ["analyst", "developer", "tester"],
            ProjectComplexity.COMPLEX: ["architect", "senior_dev", "frontend_dev", 
                                       "backend_dev", "qa_lead", "devops"],
            ProjectComplexity.CRITICAL: ["tech_lead", "architect", "senior_dev",
                                        "security_expert", "qa_lead", "devops",
                                        "performance_engineer", "reviewer"]
        }
        
        # Performance metrics
        self.metrics = {
            "total_projects": 0,
            "success_rate": 0.0,
            "avg_completion_time": 0.0,
            "agent_performance": {}
        }
    
    def _initialize_agent_pool(self) -> Dict[str, Agent]:
        """Initialize all available agents"""
        return {
            "generalist": Agent(
                role="Full-Stack Generalist",
                goal="Handle simple tasks end-to-end",
                backstory="Jack of all trades, perfect for small projects"
            ),
            "analyst": Agent(
                role="Business Analyst",
                goal="Understand requirements and create specifications",
                backstory="Expert at translating business needs to technical specs"
            ),
            "architect": Agent(
                role="Solution Architect",
                goal="Design scalable and maintainable architectures",
                backstory="Veteran architect with experience in complex systems"
            ),
            "tech_lead": Agent(
                role="Technical Lead",
                goal="Guide technical decisions and mentor team",
                backstory="Experienced leader who balances tech and people"
            ),
            "senior_dev": Agent(
                role="Senior Developer",
                goal="Implement complex features with high quality",
                backstory="10+ years building production systems"
            ),
            "frontend_dev": Agent(
                role="Frontend Developer",
                goal="Create responsive and intuitive interfaces",
                backstory="UI/UX focused developer with modern framework expertise"
            ),
            "backend_dev": Agent(
                role="Backend Developer",
                goal="Build robust APIs and services",
                backstory="Specializes in scalable backend systems"
            ),
            "qa_lead": Agent(
                role="QA Lead",
                goal="Ensure comprehensive quality through testing",
                backstory="Quality advocate with automation expertise"
            ),
            "security_expert": Agent(
                role="Security Expert",
                goal="Identify and mitigate security risks",
                backstory="Former ethical hacker turned security architect"
            ),
            "devops": Agent(
                role="DevOps Engineer",
                goal="Automate deployment and ensure reliability",
                backstory="Infrastructure automation specialist"
            ),
            "performance_engineer": Agent(
                role="Performance Engineer",
                goal="Optimize system performance and scalability",
                backstory="Expert in profiling and optimization"
            ),
            "reviewer": Agent(
                role="Code Reviewer",
                goal="Ensure code quality and standards compliance",
                backstory="Meticulous reviewer with eye for detail"
            )
        }
    
    def analyze_project(self, project_description: str) -> Dict[str, Any]:
        """Analyze project to determine complexity and requirements"""
        
        # Simple analysis based on keywords (in production, use NLP)
        analysis = {
            "complexity": ProjectComplexity.SIMPLE,
            "estimated_effort": 0,
            "required_skills": [],
            "risk_factors": []
        }
        
        # Complexity indicators
        complexity_indicators = {
            "simple": ["basic", "simple", "small", "prototype"],
            "moderate": ["standard", "typical", "medium"],
            "complex": ["advanced", "large", "integrated", "distributed"],
            "critical": ["mission-critical", "high-traffic", "financial", "healthcare"]
        }
        
        description_lower = project_description.lower()
        
        # Determine complexity
        for level, indicators in complexity_indicators.items():
            if any(indicator in description_lower for indicator in indicators):
                analysis["complexity"] = ProjectComplexity(level)
                break
        
        # Estimate effort (in hours)
        effort_map = {
            ProjectComplexity.SIMPLE: 20,
            ProjectComplexity.MODERATE: 80,
            ProjectComplexity.COMPLEX: 200,
            ProjectComplexity.CRITICAL: 400
        }
        analysis["estimated_effort"] = effort_map[analysis["complexity"]]
        
        # Identify required skills
        skill_keywords = {
            "frontend": ["ui", "frontend", "react", "vue", "angular"],
            "backend": ["api", "backend", "database", "microservice"],
            "security": ["security", "authentication", "encryption"],
            "performance": ["performance", "scale", "optimization"],
            "devops": ["deployment", "kubernetes", "docker", "ci/cd"]
        }
        
        for skill, keywords in skill_keywords.items():
            if any(keyword in description_lower for keyword in keywords):
                analysis["required_skills"].append(skill)
        
        # Identify risk factors
        risk_keywords = {
            "tight_deadline": ["urgent", "asap", "quickly"],
            "high_visibility": ["executive", "public", "customer-facing"],
            "technical_debt": ["legacy", "refactor", "migration"],
            "compliance": ["compliance", "regulation", "audit"]
        }
        
        for risk, keywords in risk_keywords.items():
            if any(keyword in description_lower for keyword in keywords):
                analysis["risk_factors"].append(risk)
        
        return analysis
    
    def assemble_crew(self, project_analysis: Dict[str, Any]) -> Crew:
        """Assemble optimal crew based on project analysis"""
        
        complexity = project_analysis["complexity"]
        required_skills = project_analysis["required_skills"]
        risk_factors = project_analysis["risk_factors"]
        
        # Start with base team for complexity level
        selected_roles = self.crew_templates[complexity].copy()
        
        # Add specialists based on required skills
        skill_to_role = {
            "frontend": "frontend_dev",
            "backend": "backend_dev",
            "security": "security_expert",
            "performance": "performance_engineer",
            "devops": "devops"
        }
        
        for skill in required_skills:
            if skill in skill_to_role:
                role = skill_to_role[skill]
                if role not in selected_roles:
                    selected_roles.append(role)
        
        # Add roles based on risk factors
        if "compliance" in risk_factors and "reviewer" not in selected_roles:
            selected_roles.append("reviewer")
        
        if "high_visibility" in risk_factors and "tech_lead" not in selected_roles:
            selected_roles.insert(0, "tech_lead")
        
        # Create agent list
        agents = [self.agent_pool[role] for role in selected_roles 
                 if role in self.agent_pool]
        
        # Determine process type
        if len(agents) <= 3:
            process = "sequential"
        elif "tech_lead" in selected_roles:
            process = "hierarchical"
        else:
            process = "sequential"
        
        # Create tasks dynamically
        tasks = self._generate_tasks(project_analysis, agents)
        
        # Configure crew with adaptive settings
        crew_config = {
            "agents": agents,
            "tasks": tasks,
            "process": process,
            "verbose": True,
            "memory": complexity in [ProjectComplexity.COMPLEX, ProjectComplexity.CRITICAL],
            "max_rpm": 100 if "tight_deadline" in risk_factors else 60,
            "callbacks": [self._performance_callback]
        }
        
        # Add manager for hierarchical process
        if process == "hierarchical":
            crew_config["manager_llm"] = ChatOpenAI(model="gpt-4")
        
        return Crew(**crew_config)
    
    def _generate_tasks(self, analysis: Dict[str, Any], 
                       agents: List[Agent]) -> List[Task]:
        """Generate tasks based on project analysis and available agents"""
        
        tasks = []
        agent_roles = [agent.role for agent in agents]
        
        # Always start with analysis/planning
        if "Business Analyst" in agent_roles or "Technical Lead" in agent_roles:
            tasks.append(Task(
                description="Analyze requirements and create detailed specifications",
                agent=next(a for a in agents if a.role in ["Business Analyst", "Technical Lead"]),
                expected_output="Detailed project specifications and requirements"
            ))
        
        # Architecture design if complex
        if "Solution Architect" in agent_roles:
            tasks.append(Task(
                description="Design system architecture and technical approach",
                agent=next(a for a in agents if a.role == "Solution Architect"),
                expected_output="Architecture design document with diagrams"
            ))
        
        # Development tasks
        dev_agents = [a for a in agents if "Developer" in a.role]
        if dev_agents:
            for agent in dev_agents:
                task_desc = f"Implement {agent.role.split()[0].lower()} components"
                tasks.append(Task(
                    description=task_desc,
                    agent=agent,
                    expected_output=f"Working {agent.role.split()[0].lower()} code"
                ))
        
        # Quality assurance
        if "QA Lead" in agent_roles:
            tasks.append(Task(
                description="Create and execute comprehensive test suite",
                agent=next(a for a in agents if a.role == "QA Lead"),
                expected_output="Test results and coverage report"
            ))
        
        # Security review if needed
        if "Security Expert" in agent_roles:
            tasks.append(Task(
                description="Perform security audit and penetration testing",
                agent=next(a for a in agents if a.role == "Security Expert"),
                expected_output="Security audit report with recommendations"
            ))
        
        # Performance optimization if needed
        if "Performance Engineer" in agent_roles:
            tasks.append(Task(
                description="Profile and optimize system performance",
                agent=next(a for a in agents if a.role == "Performance Engineer"),
                expected_output="Performance report with optimizations"
            ))
        
        # Deployment
        if "DevOps Engineer" in agent_roles:
            tasks.append(Task(
                description="Prepare deployment pipeline and infrastructure",
                agent=next(a for a in agents if a.role == "DevOps Engineer"),
                expected_output="Deployment scripts and documentation"
            ))
        
        # Final review
        if "Code Reviewer" in agent_roles:
            tasks.append(Task(
                description="Perform final code review and quality check",
                agent=next(a for a in agents if a.role == "Code Reviewer"),
                expected_output="Review report with approval status"
            ))
        
        return tasks
    
    def _performance_callback(self, output):
        """Track performance metrics"""
        agent_role = output.agent
        
        if agent_role not in self.metrics["agent_performance"]:
            self.metrics["agent_performance"][agent_role] = {
                "tasks_completed": 0,
                "avg_quality": 0.0,
                "avg_time": 0.0
            }
        
        self.metrics["agent_performance"][agent_role]["tasks_completed"] += 1
    
    def execute_project(self, project_description: str) -> Dict[str, Any]:
        """Execute a project with adaptive crew assembly"""
        
        print(f"\\n🔍 Analyzing project requirements...")
        analysis = self.analyze_project(project_description)
        
        print(f"📊 Project Analysis:")
        print(f"   Complexity: {analysis['complexity'].value}")
        print(f"   Estimated Effort: {analysis['estimated_effort']} hours")
        print(f"   Required Skills: {', '.join(analysis['required_skills'])}")
        print(f"   Risk Factors: {', '.join(analysis['risk_factors'])}")
        
        print(f"\\n👥 Assembling optimal crew...")
        crew = self.assemble_crew(analysis)
        
        print(f"   Team Size: {len(crew.agents)} agents")
        print(f"   Process Type: {crew.process}")
        print(f"   Agents: {', '.join([a.role for a in crew.agents])}")
        
        print(f"\\n🚀 Executing project...")
        start_time = time.time()
        
        try:
            result = crew.kickoff()
            execution_time = time.time() - start_time
            
            # Update metrics
            self.metrics["total_projects"] += 1
            self.metrics["success_rate"] = (
                (self.metrics["success_rate"] * (self.metrics["total_projects"] - 1) + 1) 
                / self.metrics["total_projects"]
            )
            self.metrics["avg_completion_time"] = (
                (self.metrics["avg_completion_time"] * (self.metrics["total_projects"] - 1) + execution_time)
                / self.metrics["total_projects"]
            )
            
            return {
                "status": "success",
                "result": result,
                "analysis": analysis,
                "crew_composition": [a.role for a in crew.agents],
                "execution_time": execution_time,
                "metrics": self.metrics
            }
            
        except Exception as e:
            print(f"❌ Project failed: {str(e)}")
            
            # Update failure metrics
            self.metrics["total_projects"] += 1
            self.metrics["success_rate"] = (
                self.metrics["success_rate"] * (self.metrics["total_projects"] - 1) 
                / self.metrics["total_projects"]
            )
            
            return {
                "status": "failed",
                "error": str(e),
                "analysis": analysis,
                "crew_composition": [a.role for a in crew.agents]
            }

# Usage example
adaptive_crew = AdaptiveCrew()

# Test with different project types
test_projects = [
    {
        "description": "Create a simple landing page for our product",
        "expected_complexity": "simple"
    },
    {
        "description": "Build a standard e-commerce website with payment integration",
        "expected_complexity": "moderate"
    },
    {
        "description": "Develop a distributed microservices architecture for high-traffic financial application with strict security requirements",
        "expected_complexity": "critical"
    }
]

for project in test_projects:
    print(f"\\n{'='*80}")
    print(f"Project: {project['description']}")
    print(f"{'='*80}")
    
    result = adaptive_crew.execute_project(project['description'])
    
    print(f"\\n✅ Project completed!")
    print(f"   Status: {result['status']}")
    print(f"   Execution Time: {result.get('execution_time', 0):.2f} seconds")
    print(f"   Team Used: {', '.join(result['crew_composition'])}")

# Show overall metrics
print(f"\\n📈 Overall Performance Metrics:")
print(f"   Total Projects: {adaptive_crew.metrics['total_projects']}")
print(f"   Success Rate: {adaptive_crew.metrics['success_rate']*100:.1f}%")
print(f"   Avg Completion Time: {adaptive_crew.metrics['avg_completion_time']:.2f} seconds")`
    },
    {
      id: 'example-3',
      title: 'Multi-crew collaboration system',
      language: 'python',
      code: `from crewai import Agent, Task, Crew
from typing import Dict, List, Any
from concurrent.futures import ThreadPoolExecutor, as_completed
import asyncio
import json

class CrewOrchestrator:
    """
    Orchestreert meerdere crews die samenwerken aan een groot project
    """
    
    def __init__(self):
        self.crews = {}
        self.shared_memory = {}
        self.communication_bus = MessageBus()
        
    def register_crew(self, name: str, crew: Crew):
        """Register a crew in the orchestration system"""
        self.crews[name] = crew
        
        # Add inter-crew communication callbacks
        for task in crew.tasks:
            original_callback = task.callback
            
            def wrapped_callback(output):
                # Execute original callback if exists
                if original_callback:
                    original_callback(output)
                
                # Publish to message bus
                self.communication_bus.publish(f"{name}_completed", {
                    "crew": name,
                    "task": output.task_description,
                    "result": output.result
                })
                
                # Update shared memory
                self.shared_memory[f"{name}_{output.task_id}"] = output.result
            
            task.callback = wrapped_callback
    
    def orchestrate(self, execution_plan: Dict[str, Any]) -> Dict[str, Any]:
        """Execute crews according to plan"""
        
        results = {}
        execution_phases = execution_plan.get("phases", [])
        
        for phase in execution_phases:
            phase_name = phase["name"]
            phase_type = phase["type"]  # parallel or sequential
            phase_crews = phase["crews"]
            
            print(f"\\n📋 Executing Phase: {phase_name} ({phase_type})")
            
            if phase_type == "parallel":
                phase_results = self._execute_parallel(phase_crews)
            else:
                phase_results = self._execute_sequential(phase_crews)
            
            results[phase_name] = phase_results
            
            # Check phase gates
            if "gate" in phase:
                if not self._evaluate_gate(phase["gate"], phase_results):
                    print(f"❌ Phase gate failed for {phase_name}")
                    break
        
        return results
    
    def _execute_parallel(self, crew_names: List[str]) -> Dict[str, Any]:
        """Execute multiple crews in parallel"""
        results = {}
        
        with ThreadPoolExecutor(max_workers=len(crew_names)) as executor:
            future_to_crew = {
                executor.submit(self.crews[name].kickoff): name
                for name in crew_names if name in self.crews
            }
            
            for future in as_completed(future_to_crew):
                crew_name = future_to_crew[future]
                try:
                    result = future.result()
                    results[crew_name] = {"status": "success", "output": result}
                    print(f"✅ {crew_name} completed")
                except Exception as e:
                    results[crew_name] = {"status": "failed", "error": str(e)}
                    print(f"❌ {crew_name} failed: {e}")
        
        return results
    
    def _execute_sequential(self, crew_names: List[str]) -> Dict[str, Any]:
        """Execute crews sequentially"""
        results = {}
        
        for crew_name in crew_names:
            if crew_name not in self.crews:
                continue
            
            try:
                # Pass previous results as context
                crew = self.crews[crew_name]
                
                # Inject shared memory into crew context
                crew.shared_context = self.shared_memory
                
                result = crew.kickoff()
                results[crew_name] = {"status": "success", "output": result}
                print(f"✅ {crew_name} completed")
                
            except Exception as e:
                results[crew_name] = {"status": "failed", "error": str(e)}
                print(f"❌ {crew_name} failed: {e}")
                break  # Stop sequence on failure
        
        return results
    
    def _evaluate_gate(self, gate_config: Dict[str, Any], 
                      phase_results: Dict[str, Any]) -> bool:
        """Evaluate if phase gate conditions are met"""
        
        gate_type = gate_config.get("type", "all_success")
        
        if gate_type == "all_success":
            return all(r["status"] == "success" for r in phase_results.values())
        
        elif gate_type == "any_success":
            return any(r["status"] == "success" for r in phase_results.values())
        
        elif gate_type == "custom":
            # Custom gate evaluation logic
            return gate_config["evaluator"](phase_results)
        
        return True


class MessageBus:
    """Simple message bus for inter-crew communication"""
    
    def __init__(self):
        self.subscribers = {}
    
    def subscribe(self, topic: str, callback):
        if topic not in self.subscribers:
            self.subscribers[topic] = []
        self.subscribers[topic].append(callback)
    
    def publish(self, topic: str, message: Any):
        if topic in self.subscribers:
            for callback in self.subscribers[topic]:
                callback(message)


# Create specialized crews for a large software project
def create_project_crews():
    """Create multiple specialized crews for different aspects of development"""
    
    # Research and Planning Crew
    research_crew = Crew(
        agents=[
            Agent(role="Market Researcher", goal="Analyze market and competition"),
            Agent(role="Product Manager", goal="Define product requirements"),
            Agent(role="UX Researcher", goal="Understand user needs")
        ],
        tasks=[
            Task(description="Research market trends and competitor analysis"),
            Task(description="Define product vision and roadmap"),
            Task(description="Create user personas and journey maps")
        ],
        process="sequential"
    )
    
    # Architecture and Design Crew
    design_crew = Crew(
        agents=[
            Agent(role="System Architect", goal="Design scalable architecture"),
            Agent(role="Database Architect", goal="Design data models"),
            Agent(role="UI/UX Designer", goal="Create user interface designs")
        ],
        tasks=[
            Task(description="Create system architecture blueprint"),
            Task(description="Design database schema and data flow"),
            Task(description="Create wireframes and design system")
        ],
        process="sequential"
    )
    
    # Frontend Development Crew
    frontend_crew = Crew(
        agents=[
            Agent(role="Frontend Lead", goal="Coordinate frontend development"),
            Agent(role="React Developer", goal="Build React components"),
            Agent(role="CSS Specialist", goal="Implement responsive designs")
        ],
        tasks=[
            Task(description="Set up frontend architecture and tooling"),
            Task(description="Develop React component library"),
            Task(description="Implement responsive layouts and animations")
        ],
        process="hierarchical"
    )
    
    # Backend Development Crew
    backend_crew = Crew(
        agents=[
            Agent(role="Backend Lead", goal="Coordinate backend development"),
            Agent(role="API Developer", goal="Build RESTful APIs"),
            Agent(role="Database Developer", goal="Implement data layer")
        ],
        tasks=[
            Task(description="Design and implement API architecture"),
            Task(description="Develop API endpoints and business logic"),
            Task(description="Implement database operations and optimization")
        ],
        process="hierarchical"
    )
    
    # Quality Assurance Crew
    qa_crew = Crew(
        agents=[
            Agent(role="QA Lead", goal="Ensure product quality"),
            Agent(role="Test Automation Engineer", goal="Build test suites"),
            Agent(role="Performance Tester", goal="Ensure performance")
        ],
        tasks=[
            Task(description="Create comprehensive test strategy"),
            Task(description="Implement automated test suites"),
            Task(description="Conduct performance and load testing")
        ],
        process="sequential"
    )
    
    # DevOps and Deployment Crew
    devops_crew = Crew(
        agents=[
            Agent(role="DevOps Lead", goal="Manage infrastructure"),
            Agent(role="Cloud Engineer", goal="Set up cloud resources"),
            Agent(role="Security Engineer", goal="Ensure security compliance")
        ],
        tasks=[
            Task(description="Design deployment architecture"),
            Task(description="Set up CI/CD pipelines"),
            Task(description="Implement security measures and monitoring")
        ],
        process="sequential"
    )
    
    return {
        "research": research_crew,
        "design": design_crew,
        "frontend": frontend_crew,
        "backend": backend_crew,
        "qa": qa_crew,
        "devops": devops_crew
    }


# Example: Orchestrating a complete product development
orchestrator = CrewOrchestrator()

# Register all crews
crews = create_project_crews()
for name, crew in crews.items():
    orchestrator.register_crew(name, crew)

# Set up inter-crew communication
message_bus = orchestrator.communication_bus

# Frontend crew subscribes to design completion
def on_design_complete(message):
    print(f"📨 Frontend crew received design specs from {message['crew']}")

message_bus.subscribe("design_completed", on_design_complete)

# QA crew subscribes to development completion
def on_dev_complete(message):
    print(f"📨 QA crew received build from {message['crew']}")

message_bus.subscribe("frontend_completed", on_dev_complete)
message_bus.subscribe("backend_completed", on_dev_complete)

# Define execution plan
execution_plan = {
    "project": "E-commerce Platform Development",
    "phases": [
        {
            "name": "Discovery Phase",
            "type": "sequential",
            "crews": ["research"],
            "gate": {"type": "all_success"}
        },
        {
            "name": "Design Phase",
            "type": "sequential",
            "crews": ["design"],
            "gate": {"type": "all_success"}
        },
        {
            "name": "Development Phase",
            "type": "parallel",
            "crews": ["frontend", "backend"],
            "gate": {"type": "all_success"}
        },
        {
            "name": "Testing Phase",
            "type": "sequential",
            "crews": ["qa"],
            "gate": {"type": "all_success"}
        },
        {
            "name": "Deployment Phase",
            "type": "sequential",
            "crews": ["devops"],
            "gate": {"type": "all_success"}
        }
    ]
}

# Execute the orchestrated project
print(f"🚀 Starting orchestrated project: {execution_plan['project']}")
print(f"   Total phases: {len(execution_plan['phases'])}")
print(f"   Total crews: {len(crews)}")
print("-" * 60)

results = orchestrator.orchestrate(execution_plan)

# Generate project summary
print(f"\\n📊 Project Summary")
print("=" * 60)

for phase_name, phase_results in results.items():
    print(f"\\nPhase: {phase_name}")
    for crew_name, crew_result in phase_results.items():
        status_icon = "✅" if crew_result["status"] == "success" else "❌"
        print(f"  {status_icon} {crew_name}: {crew_result['status']}")

# Access shared results
print(f"\\n💾 Shared Memory Contents:")
for key, value in list(orchestrator.shared_memory.items())[:5]:
    print(f"  {key}: {str(value)[:100]}...")

print(f"\\n✨ Project orchestration completed!")`
    }
  ],
  assignments: [
    {
      id: 'assignment-1',
      title: 'Bouw een volledig functional crew systeem',
      type: 'project',
      difficulty: 'hard',
      description: `Ontwikkel een complete CrewAI implementatie voor een real-world scenario:

1. **Kies een complex domein**:
   - Automated news aggregation en writing
   - Investment research en portfolio management
   - Software security audit systeem
   - E-learning content generation

2. **Design het crew systeem**:
   - Minimaal 5 verschillende agent rollen
   - Zowel sequential als parallel workflows
   - Inter-agent communicatie
   - Error handling en recovery

3. **Implementeer advanced features**:
   - Dynamic crew assembly
   - Performance monitoring
   - Result caching
   - Quality gates tussen fases

4. **Test en optimaliseer**:
   - Verschillende input scenarios
   - Performance benchmarks
   - Failure recovery testing
   - Scalability testing`,
      hints: [
        'Begin met een duidelijke system design',
        'Implementeer logging voor debugging',
        'Test componenten individueel voor integratie',
        'Documenteer agent interacties en dependencies'
      ]
    },
    {
      id: 'assignment-2',
      title: 'Crew performance optimalisatie challenge',
      type: 'project',
      difficulty: 'expert',
      description: `Optimaliseer een bestaand crew systeem voor maximale performance:

1. **Baseline meting**:
   - Meet execution time per task
   - Track API calls en kosten
   - Monitor memory usage
   - Identify bottlenecks

2. **Implementeer optimalisaties**:
   - Parallel execution waar mogelijk
   - Intelligent caching strategy
   - Agent pooling en reuse
   - Optimize prompts voor snelheid

3. **Advanced patterns**:
   - Predictive task scheduling
   - Dynamic resource allocation
   - Adaptive timeout management
   - Smart retry strategies

4. **Vergelijk resultaten**:
   - Performance improvements
   - Cost reductions
   - Quality maintenance
   - Scalability gains`,
      hints: [
        'Profile eerst om bottlenecks te vinden',
        'Niet alle optimalisaties zijn worth it',
        'Quality mag niet lijden onder speed',
        'Consider trade-offs carefully'
      ]
    }
  ],
  resources: [
    {
      title: 'CrewAI Crews Documentation',
      url: 'https://docs.crewai.com/core-concepts/crews',
      type: 'documentation'
    },
    {
      title: 'Building Production-Ready AI Teams',
      url: 'https://crewai.com/production-guide',
      type: 'guide'
    },
    {
      title: 'Multi-Agent Orchestration Patterns',
      url: 'https://arxiv.org/abs/2310.03302',
      type: 'guide'
    },
    {
      title: 'CrewAI Advanced Examples',
      url: 'https://github.com/joaomdmoura/crewai-examples',
      type: 'code'
    },
    {
      title: 'Crew Performance Optimization',
      url: 'https://www.youtube.com/watch?v=crew-optimization',
      type: 'video'
    }
  ]
}