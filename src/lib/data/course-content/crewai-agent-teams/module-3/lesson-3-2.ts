import { Lesson } from '@/lib/data/courses';

export const lesson32: Lesson = {
  id: 'lesson-3-2',
  title: 'Role Specialization & Communication Patterns',
  duration: '60 min',
  content: `
# Role Specialization & Communication Patterns

Effectieve agent teams vereisen duidelijke role specialization en gestructureerde communication patterns. Deze les behandelt geavanceerde technieken voor het creëren van gespecialiseerde agents en het implementeren van robuuste communicatie protocols.

## Role Specialization Strategies

### Domain Expert Pattern

\`\`\`python
from crewai import Agent, Task, Crew
from typing import Dict, List, Any, Optional
from abc import ABC, abstractmethod
import json

class DomainExpert(ABC):
    """Abstract base class voor domain experts"""
    
    def __init__(self, name: str, expertise_area: str, llm_config: Dict):
        self.name = name
        self.expertise_area = expertise_area
        self.llm_config = llm_config
        self.knowledge_base = self._load_domain_knowledge()
        
    @abstractmethod
    def _load_domain_knowledge(self) -> Dict:
        """Load domain-specific knowledge"""
        pass
    
    @abstractmethod
    def create_agent(self) -> Agent:
        """Create specialized agent"""
        pass
    
    def enhance_prompt(self, base_prompt: str) -> str:
        """Enhance prompt met domain expertise"""
        return f"""
        Als expert in {self.expertise_area}, met de volgende kennis:
        {json.dumps(self.knowledge_base, indent=2)}
        
        {base_prompt}
        
        Gebruik je expertise om een gedetailleerd en accuraat antwoord te geven.
        """

class DataScienceExpert(DomainExpert):
    """Data Science specialist"""
    
    def _load_domain_knowledge(self) -> Dict:
        return {
            "algorithms": ["Random Forest", "XGBoost", "Neural Networks", "SVM"],
            "tools": ["Python", "R", "TensorFlow", "PyTorch", "Scikit-learn"],
            "techniques": ["Feature Engineering", "Cross-validation", "Hyperparameter tuning"],
            "metrics": ["AUC-ROC", "F1-Score", "RMSE", "MAE", "Precision/Recall"]
        }
    
    def create_agent(self) -> Agent:
        return Agent(
            role="Senior Data Scientist",
            goal="Solve complex data science problems met ML expertise",
            backstory=f"""Je bent een senior data scientist met 15+ jaar ervaring.
            Je expertise omvat: {', '.join(self.knowledge_base['algorithms'])}.
            Je bent bekend met alle moderne ML frameworks en best practices.""",
            verbose=True,
            llm_config=self.llm_config,
            tools=[],  # Add specific tools
            max_iter=5
        )

class SecurityExpert(DomainExpert):
    """Cybersecurity specialist"""
    
    def _load_domain_knowledge(self) -> Dict:
        return {
            "frameworks": ["OWASP", "NIST", "ISO 27001", "CIS Controls"],
            "tools": ["Burp Suite", "Metasploit", "Nmap", "Wireshark"],
            "vulnerabilities": ["SQL Injection", "XSS", "CSRF", "Buffer Overflow"],
            "protocols": ["OAuth 2.0", "JWT", "TLS 1.3", "Zero Trust"]
        }
    
    def create_agent(self) -> Agent:
        return Agent(
            role="Chief Security Officer",
            goal="Identificeer en mitigeer security risks",
            backstory=f"""Je bent een cybersecurity expert met certificeringen in
            CISSP, CEH, en OSCP. Je kent alle OWASP top 10 vulnerabilities
            en moderne security frameworks.""",
            verbose=True,
            llm_config=self.llm_config,
            allow_delegation=True
        )

class BusinessAnalyst(DomainExpert):
    """Business analysis specialist"""
    
    def _load_domain_knowledge(self) -> Dict:
        return {
            "methodologies": ["Agile", "Scrum", "Kanban", "Six Sigma"],
            "tools": ["JIRA", "Confluence", "Tableau", "Power BI"],
            "techniques": ["SWOT", "PESTLE", "Value Stream Mapping", "Process Mining"],
            "metrics": ["ROI", "NPV", "IRR", "Payback Period", "TCO"]
        }
    
    def create_agent(self) -> Agent:
        return Agent(
            role="Senior Business Analyst",
            goal="Analyseer business requirements en optimaliseer processen",
            backstory="""Je bent een ervaren business analyst met MBA en 
            expertise in digital transformation. Je brug tussen business en IT.""",
            verbose=True,
            llm_config=self.llm_config
        )
\`\`\`

## Communication Infrastructure

### Message Bus Architecture

\`\`\`python
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Callable, Set
import asyncio
import uuid

class MessageType(Enum):
    BROADCAST = "broadcast"
    DIRECT = "direct"
    REQUEST = "request"
    RESPONSE = "response"
    EVENT = "event"
    COMMAND = "command"

@dataclass
class Message:
    """Structured message voor inter-agent communication"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    sender: str = ""
    receiver: str = ""  # Empty voor broadcast
    type: MessageType = MessageType.DIRECT
    topic: str = ""
    content: Any = None
    metadata: Dict = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.now)
    correlation_id: Optional[str] = None  # Voor request-response
    
class MessageBus:
    """Central message bus voor agent communication"""
    
    def __init__(self):
        self.subscribers: Dict[str, Set[Callable]] = {}
        self.message_history: List[Message] = []
        self.pending_responses: Dict[str, asyncio.Future] = {}
        
    def subscribe(self, topic: str, handler: Callable):
        """Subscribe to messages on specific topic"""
        if topic not in self.subscribers:
            self.subscribers[topic] = set()
        self.subscribers[topic].add(handler)
        
    def unsubscribe(self, topic: str, handler: Callable):
        """Unsubscribe from topic"""
        if topic in self.subscribers:
            self.subscribers[topic].discard(handler)
            
    async def publish(self, message: Message):
        """Publish message to bus"""
        self.message_history.append(message)
        
        # Route based on type
        if message.type == MessageType.BROADCAST:
            await self._broadcast(message)
        elif message.type == MessageType.DIRECT:
            await self._direct_message(message)
        elif message.type == MessageType.REQUEST:
            return await self._request_response(message)
            
    async def _broadcast(self, message: Message):
        """Broadcast to all subscribers of topic"""
        if message.topic in self.subscribers:
            tasks = []
            for handler in self.subscribers[message.topic]:
                tasks.append(asyncio.create_task(handler(message)))
            await asyncio.gather(*tasks)
            
    async def _request_response(self, message: Message, timeout: float = 30.0):
        """Request-response pattern"""
        future = asyncio.Future()
        self.pending_responses[message.id] = future
        
        # Send request
        await self._broadcast(message)
        
        try:
            # Wait for response
            response = await asyncio.wait_for(future, timeout)
            return response
        except asyncio.TimeoutError:
            del self.pending_responses[message.id]
            raise TimeoutError(f"No response received for request {message.id}")
            
    def respond(self, request_id: str, response: Any):
        """Send response to request"""
        if request_id in self.pending_responses:
            self.pending_responses[request_id].set_result(response)
\`\`\`

### Agent Communication Protocols

\`\`\`python
class CommunicationProtocol:
    """Define communication protocols tussen agents"""
    
    def __init__(self, message_bus: MessageBus):
        self.bus = message_bus
        self.protocols = self._define_protocols()
        
    def _define_protocols(self) -> Dict[str, Dict]:
        """Define standard communication protocols"""
        return {
            "task_delegation": {
                "request_format": {
                    "task_description": str,
                    "priority": int,
                    "deadline": datetime,
                    "requirements": List[str]
                },
                "response_format": {
                    "accepted": bool,
                    "estimated_completion": datetime,
                    "concerns": List[str]
                }
            },
            "status_update": {
                "format": {
                    "task_id": str,
                    "status": str,  # "in_progress", "completed", "blocked"
                    "progress": float,  # 0.0 - 1.0
                    "blockers": List[str]
                }
            },
            "knowledge_share": {
                "format": {
                    "topic": str,
                    "knowledge_type": str,  # "fact", "procedure", "insight"
                    "content": Any,
                    "confidence": float,  # 0.0 - 1.0
                    "source": str
                }
            }
        }
    
    async def delegate_task(
        self, 
        from_agent: str, 
        to_agent: str, 
        task: Dict
    ) -> Dict:
        """Delegate task volgens protocol"""
        
        # Validate format
        required = self.protocols["task_delegation"]["request_format"]
        for key in required:
            if key not in task:
                raise ValueError(f"Missing required field: {key}")
        
        # Create delegation message
        message = Message(
            sender=from_agent,
            receiver=to_agent,
            type=MessageType.REQUEST,
            topic="task_delegation",
            content=task
        )
        
        # Send and wait for response
        response = await self.bus.publish(message)
        return response

class AgentCommunicator:
    """Handles agent-specific communication"""
    
    def __init__(self, agent: Agent, message_bus: MessageBus):
        self.agent = agent
        self.bus = message_bus
        self.inbox: List[Message] = []
        self.outbox: List[Message] = []
        
        # Subscribe to relevant topics
        self._setup_subscriptions()
        
    def _setup_subscriptions(self):
        """Setup message subscriptions"""
        # Subscribe to direct messages
        self.bus.subscribe(f"agent.{self.agent.role}", self._handle_direct_message)
        
        # Subscribe to broadcasts
        self.bus.subscribe("broadcast.all", self._handle_broadcast)
        
        # Subscribe to role-specific topics
        if "manager" in self.agent.role.lower():
            self.bus.subscribe("managers.updates", self._handle_manager_update)
            
    async def _handle_direct_message(self, message: Message):
        """Handle direct messages"""
        self.inbox.append(message)
        
        # Process based on message type
        if message.type == MessageType.REQUEST:
            response = await self._process_request(message)
            self.bus.respond(message.id, response)
            
    async def _process_request(self, message: Message) -> Dict:
        """Process incoming request"""
        if message.topic == "task_delegation":
            # Evaluate if agent can handle task
            task = message.content
            can_handle = self._evaluate_task_fit(task)
            
            return {
                "accepted": can_handle,
                "estimated_completion": datetime.now(),
                "concerns": [] if can_handle else ["Outside expertise area"]
            }
            
    def _evaluate_task_fit(self, task: Dict) -> bool:
        """Evaluate if task fits agent capabilities"""
        # Simple heuristic - can be made more sophisticated
        task_keywords = task.get("task_description", "").lower().split()
        agent_keywords = self.agent.goal.lower().split()
        
        overlap = len(set(task_keywords) & set(agent_keywords))
        return overlap > 2
\`\`\`

## Specialized Team Patterns

### Expert Panel Pattern

\`\`\`python
class ExpertPanel:
    """Coordinated panel of domain experts"""
    
    def __init__(self, experts: List[DomainExpert], llm_config: Dict):
        self.experts = experts
        self.agents = [expert.create_agent() for expert in experts]
        self.moderator = self._create_moderator(llm_config)
        self.message_bus = MessageBus()
        
    def _create_moderator(self, llm_config: Dict) -> Agent:
        """Create panel moderator"""
        return Agent(
            role="Panel Moderator",
            goal="Facilitate expert discussion and synthesize insights",
            backstory="""Je bent een ervaren moderator die expert panels leidt.
            Je zorgt voor gestructureerde discussies en consensus building.""",
            allow_delegation=True,
            llm_config=llm_config
        )
    
    def deliberate(self, question: str) -> Task:
        """Expert panel deliberation process"""
        
        # Phase 1: Individual expert analysis
        expert_tasks = []
        for i, agent in enumerate(self.agents):
            expert_task = Task(
                description=f"""
                Analyseer de volgende vraag vanuit jouw expertise:
                {question}
                
                Geef een gedetailleerde analyse met:
                1. Je expert perspectief
                2. Relevante data/voorbeelden
                3. Potentiële concerns
                4. Aanbevelingen
                """,
                expected_output="Expert analysis report",
                agent=agent
            )
            expert_tasks.append(expert_task)
        
        # Phase 2: Synthesis
        synthesis_task = Task(
            description=f"""
            Synthesize de expert opinions tot een coherent antwoord:
            
            Originele vraag: {question}
            
            Creëer een balanced rapport dat:
            1. Gemeenschappelijke inzichten highlights
            2. Verschillen in perspectief adresseert
            3. Een unified recommendation geeft
            4. Trade-offs en risico's benoemt
            """,
            expected_output="Synthesized expert panel report",
            agent=self.moderator,
            context=expert_tasks
        )
        
        return synthesis_task

# Usage example
def create_technical_review_panel(llm_config: Dict) -> ExpertPanel:
    """Create panel voor technical reviews"""
    
    experts = [
        DataScienceExpert("Dr. ML", "Machine Learning", llm_config),
        SecurityExpert("SecOps", "Cybersecurity", llm_config),
        BusinessAnalyst("BizDev", "Business Strategy", llm_config)
    ]
    
    panel = ExpertPanel(experts, llm_config)
    
    # Review question
    review_task = panel.deliberate(
        "Should we implement a new AI-powered customer service system?"
    )
    
    crew = Crew(
        agents=panel.agents + [panel.moderator],
        tasks=[review_task],
        verbose=True
    )
    
    return crew
\`\`\`

## Communication Patterns

### Consensus Building Protocol

\`\`\`python
class ConsensusProtocol:
    """Implements consensus building tussen agents"""
    
    def __init__(self, participants: List[Agent]):
        self.participants = participants
        self.voting_history = []
        
    async def build_consensus(
        self, 
        proposal: str, 
        rounds: int = 3
    ) -> Dict[str, Any]:
        """Multi-round consensus building"""
        
        consensus_data = {
            "proposal": proposal,
            "rounds": [],
            "final_decision": None,
            "consensus_level": 0.0
        }
        
        for round_num in range(rounds):
            round_data = await self._consensus_round(
                proposal, 
                round_num,
                consensus_data.get("rounds", [])
            )
            consensus_data["rounds"].append(round_data)
            
            # Check for early consensus
            if round_data["agreement_rate"] > 0.8:
                consensus_data["final_decision"] = "approved"
                consensus_data["consensus_level"] = round_data["agreement_rate"]
                break
        
        return consensus_data
    
    async def _consensus_round(
        self, 
        proposal: str, 
        round_num: int,
        previous_rounds: List[Dict]
    ) -> Dict:
        """Single consensus round"""
        
        votes = []
        rationales = []
        
        for agent in self.participants:
            # Create voting task
            vote_task = Task(
                description=f"""
                Round {round_num + 1} - Stem over het volgende voorstel:
                {proposal}
                
                {"Eerdere rondes: " + json.dumps(previous_rounds, indent=2) if previous_rounds else ""}
                
                Geef je stem (approve/reject/abstain) met rationale.
                """,
                expected_output="Vote met uitgebreide rationale",
                agent=agent
            )
            
            # Simulate vote (in practice, this would be async)
            vote_result = {
                "agent": agent.role,
                "vote": "approve",  # Would be extracted from task result
                "rationale": "Based on analysis...",
                "confidence": 0.85
            }
            
            votes.append(vote_result)
        
        # Calculate agreement
        approve_count = sum(1 for v in votes if v["vote"] == "approve")
        agreement_rate = approve_count / len(votes)
        
        return {
            "round": round_num + 1,
            "votes": votes,
            "agreement_rate": agreement_rate,
            "decision": "approve" if agreement_rate > 0.5 else "reject"
        }
\`\`\`

### Information Cascade Pattern

\`\`\`python
class InformationCascade:
    """Implements information flow through specialized agents"""
    
    def __init__(self):
        self.cascade_stages = []
        self.information_graph = {}
        
    def add_stage(
        self, 
        stage_name: str, 
        agents: List[Agent],
        transformation: Callable
    ):
        """Add processing stage to cascade"""
        self.cascade_stages.append({
            "name": stage_name,
            "agents": agents,
            "transformation": transformation
        })
    
    def create_cascade_flow(self, initial_data: Any) -> List[Task]:
        """Create task flow through cascade"""
        tasks = []
        current_data = initial_data
        
        for i, stage in enumerate(self.cascade_stages):
            stage_tasks = []
            
            for agent in stage["agents"]:
                task = Task(
                    description=f"""
                    Stage: {stage['name']}
                    
                    Process the following information:
                    {current_data}
                    
                    Apply your specialized knowledge to enhance,
                    validate, or transform this information.
                    """,
                    expected_output=f"Processed output for {stage['name']}",
                    agent=agent,
                    context=tasks[-len(stage["agents"]):] if tasks else []
                )
                stage_tasks.append(task)
            
            tasks.extend(stage_tasks)
            
            # Transform data for next stage
            if stage["transformation"]:
                current_data = stage["transformation"](current_data)
        
        return tasks

# Example: Research to Implementation cascade
def create_research_cascade(llm_config: Dict) -> Crew:
    """Create research to implementation cascade"""
    
    # Stage 1: Research
    researcher = Agent(
        role="Research Scientist",
        goal="Conduct thorough research",
        llm_config=llm_config
    )
    
    # Stage 2: Analysis
    analyst = Agent(
        role="Data Analyst",
        goal="Analyze research findings",
        llm_config=llm_config
    )
    
    # Stage 3: Architecture
    architect = Agent(
        role="Solution Architect",
        goal="Design implementation architecture",
        llm_config=llm_config
    )
    
    # Stage 4: Implementation
    developer = Agent(
        role="Senior Developer",
        goal="Implement the solution",
        llm_config=llm_config
    )
    
    cascade = InformationCascade()
    cascade.add_stage("Research", [researcher], lambda x: f"Research findings: {x}")
    cascade.add_stage("Analysis", [analyst], lambda x: f"Analysis results: {x}")
    cascade.add_stage("Architecture", [architect], lambda x: f"Architecture design: {x}")
    cascade.add_stage("Implementation", [developer], None)
    
    tasks = cascade.create_cascade_flow("Build an AI recommendation system")
    
    return Crew(
        agents=[researcher, analyst, architect, developer],
        tasks=tasks,
        process="sequential",
        verbose=True
    )
\`\`\`

## Collaborative Patterns

### Pair Programming Pattern

\`\`\`python
class AgentPairProgramming:
    """Implements pair programming tussen AI agents"""
    
    def __init__(self, driver: Agent, navigator: Agent):
        self.driver = driver  # Writes code
        self.navigator = navigator  # Reviews and guides
        self.session_history = []
        
    def create_pair_session(self, feature_request: str) -> List[Task]:
        """Create pair programming session"""
        
        # Navigator plans approach
        planning_task = Task(
            description=f"""
            Als Navigator, plan de implementatie voor:
            {feature_request}
            
            Deliverables:
            1. High-level approach
            2. Key components needed
            3. Potential challenges
            4. Test scenarios
            """,
            expected_output="Implementation plan",
            agent=self.navigator
        )
        
        # Driver implements with navigator guidance
        implementation_task = Task(
            description=f"""
            Als Driver, implementeer de feature volgens het plan.
            
            Feature: {feature_request}
            
            Focus op:
            1. Clean, readable code
            2. Error handling
            3. Performance considerations
            4. Documentation
            """,
            expected_output="Implemented code",
            agent=self.driver,
            context=[planning_task]
        )
        
        # Navigator reviews
        review_task = Task(
            description="""
            Review de implementatie:
            1. Code quality check
            2. Identificeer improvements
            3. Security considerations
            4. Test coverage
            """,
            expected_output="Code review feedback",
            agent=self.navigator,
            context=[implementation_task]
        )
        
        # Driver refactors based on feedback
        refactor_task = Task(
            description="""
            Refactor de code based op review feedback:
            1. Address alle feedback punten
            2. Improve code quality
            3. Add missing tests
            4. Update documentation
            """,
            expected_output="Refactored code",
            agent=self.driver,
            context=[review_task]
        )
        
        return [planning_task, implementation_task, review_task, refactor_task]
\`\`\`

### Swarm Intelligence Pattern

\`\`\`python
class SwarmIntelligence:
    """Implements swarm intelligence voor problem solving"""
    
    def __init__(self, swarm_size: int, llm_config: Dict):
        self.swarm = self._create_swarm(swarm_size, llm_config)
        self.pheromone_trails = {}  # Shared knowledge
        
    def _create_swarm(self, size: int, llm_config: Dict) -> List[Agent]:
        """Create swarm of similar agents"""
        swarm = []
        for i in range(size):
            agent = Agent(
                role=f"Swarm Worker {i}",
                goal="Explore solution space and share findings",
                backstory="Part of collective intelligence swarm",
                llm_config=llm_config,
                max_iter=3
            )
            swarm.append(agent)
        return swarm
    
    def swarm_search(self, problem: str, iterations: int = 3) -> Dict:
        """Swarm search for optimal solution"""
        
        best_solution = None
        best_score = 0
        
        for iteration in range(iterations):
            iteration_solutions = []
            
            # Each agent explores
            for agent in self.swarm:
                explore_task = Task(
                    description=f"""
                    Iteration {iteration + 1}: Explore solutions for:
                    {problem}
                    
                    Current best score: {best_score}
                    Pheromone trails: {json.dumps(self.pheromone_trails, indent=2)}
                    
                    Provide:
                    1. Your solution approach
                    2. Estimated effectiveness (0-100)
                    3. Key insights discovered
                    """,
                    expected_output="Solution exploration report",
                    agent=agent
                )
                
                # Simulate solution (would be extracted from task result)
                solution = {
                    "approach": "Solution approach...",
                    "score": 75,
                    "insights": ["Insight 1", "Insight 2"]
                }
                iteration_solutions.append(solution)
                
                # Update pheromone trails
                for insight in solution["insights"]:
                    if insight not in self.pheromone_trails:
                        self.pheromone_trails[insight] = 0
                    self.pheromone_trails[insight] += solution["score"] / 100
            
            # Update best solution
            for sol in iteration_solutions:
                if sol["score"] > best_score:
                    best_solution = sol
                    best_score = sol["score"]
        
        return {
            "best_solution": best_solution,
            "pheromone_trails": self.pheromone_trails,
            "iterations": iterations
        }
\`\`\`

## Performance Optimization

### Communication Efficiency

\`\`\`python
class EfficientCommunicator:
    """Optimizes inter-agent communication"""
    
    def __init__(self):
        self.message_cache = {}
        self.communication_metrics = {
            "total_messages": 0,
            "cache_hits": 0,
            "avg_message_size": 0
        }
        
    def optimize_message(self, message: Message) -> Message:
        """Optimize message for efficiency"""
        
        # Compress large content
        if len(str(message.content)) > 1000:
            message.content = self._compress_content(message.content)
            
        # Check cache for similar messages
        cache_key = self._generate_cache_key(message)
        if cache_key in self.message_cache:
            self.communication_metrics["cache_hits"] += 1
            return self.message_cache[cache_key]
        
        # Cache new message
        self.message_cache[cache_key] = message
        self.communication_metrics["total_messages"] += 1
        
        return message
    
    def _compress_content(self, content: Any) -> Dict:
        """Compress message content"""
        return {
            "compressed": True,
            "summary": str(content)[:200] + "...",
            "full_content_id": str(uuid.uuid4())
        }
    
    def _generate_cache_key(self, message: Message) -> str:
        """Generate cache key for message"""
        return f"{message.type}:{message.topic}:{hash(str(message.content))}"
\`\`\`

Deze patterns maken het mogelijk om highly specialized agent teams te bouwen met efficiënte communication protocols.
  `,
  assignments: [
    {
      id: 'ex1',
      title: 'Expert Review Board',
      description: 'Bouw een expert review board met minimaal 5 verschillende specialisten die een product launch evalueren',
      difficulty: 'hard',
      type: 'project',
      hints: [
        'Implementeer consensus building protocol',
        'Gebruik structured communication patterns',
        'Add conflict resolution mechanisms'
      ]
    },
    {
      id: 'ex2',
      title: 'Async Communication System',
      description: 'Implementeer een volledig asynchrone communication system voor 10+ agents',
      difficulty: 'expert',
      type: 'project',
      hints: [
        'Use message queuing patterns',
        'Implement priority-based routing',
        'Add message persistence and replay'
      ]
    }
  ],
  resources: [
    {
      title: 'Agent Communication Patterns',
      url: 'https://www.oreilly.com/library/view/designing-distributed-systems/9781491983638/',
      type: 'book'
    },
    {
      title: 'Swarm Intelligence Algorithms',
      url: 'https://link.springer.com/book/10.1007/978-3-319-91086-4',
      type: 'article'
    }
  ]
};