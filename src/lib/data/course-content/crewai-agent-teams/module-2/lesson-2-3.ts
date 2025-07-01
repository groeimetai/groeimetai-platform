import { Lesson } from '@/lib/data/courses'

export const lesson2_3: Lesson = {
  id: 'lesson-2-3',
  title: 'Agent communicatie: Delegation en collaboration',
  duration: '40 min',
  content: `
# Agent Communicatie: Delegation en Collaboration

Effectieve communicatie tussen agents is de ruggengraat van succesvolle AI teams. In deze les duiken we diep in delegation patterns, collaboration protocols, en communicatie strategieën.

## Fundamenten van Agent Communicatie

### Waarom Communicatie Cruciaal Is
- **Kennisdeling**: Agents delen expertise en insights
- **Taak coördinatie**: Efficiënte werkverdeling
- **Probleemoplossing**: Gezamenlijke aanpak van complexe uitdagingen
- **Kwaliteitscontrole**: Peer review en validatie

### Communicatie Uitdagingen
1. **Context verlies**: Informatie gaat verloren in overdracht
2. **Miscommunicatie**: Onduidelijke instructies of verwachtingen
3. **Overhead**: Te veel communicatie vertraagt het proces
4. **Conflicten**: Tegenstrijdige adviezen of aanpakken

## Delegation Patterns

### 1. Hierarchical Delegation
**Structuur**: Top-down commando keten
- Manager → Team Lead → Specialist
- Duidelijke verantwoordelijkheden
- Geschikt voor grote, complexe projecten

### 2. Peer-to-Peer Delegation
**Structuur**: Gelijkwaardige agents delegeren onderling
- Specialist ↔ Specialist
- Flexibele taakverdeling
- Geschikt voor dynamische taken

### 3. Skill-Based Delegation
**Structuur**: Taken naar meest gekwalificeerde agent
- Automatische routing op expertise
- Optimale resource benutting
- Geschikt voor diverse teams

### 4. Load-Balanced Delegation
**Structuur**: Verdeling op basis van beschikbaarheid
- Even werklast verdeling
- Voorkomt bottlenecks
- Geschikt voor high-volume taken

## Collaboration Protocols

### Sequential Collaboration
Agents werken in vaste volgorde:
\`\`\`
Research → Design → Implementation → Testing → Deployment
\`\`\`
**Voordelen**: Duidelijke flow, makkelijk te debuggen
**Nadelen**: Geen parallelisatie, bottlenecks

### Parallel Collaboration
Agents werken simultaan:
\`\`\`
    ┌─→ Frontend Team
Task ├─→ Backend Team
    └─→ Database Team
\`\`\`
**Voordelen**: Sneller, efficiënt
**Nadelen**: Synchronisatie uitdagingen

### Consensus Collaboration
Agents bereiken gezamenlijk besluit:
\`\`\`
Agent A ─┐
Agent B ─┼→ Discussion → Consensus → Action
Agent C ─┘
\`\`\`
**Voordelen**: Betere beslissingen, buy-in
**Nadelen**: Tijdrovend, mogelijk geen consensus

### Adaptive Collaboration
Collaboration type past zich aan:
- Start parallel voor snelheid
- Switch naar consensus bij conflicts
- Escaleer naar hierarchical indien nodig

## Communication Formats

### Structured Messages
Gestandaardiseerde message formats:
\`\`\`python
{
    "from": "agent_id",
    "to": "agent_id",
    "type": "request|response|notification",
    "priority": "high|medium|low",
    "content": {
        "task": "...",
        "context": "...",
        "constraints": "..."
    },
    "metadata": {
        "timestamp": "...",
        "thread_id": "...",
        "deadline": "..."
    }
}
\`\`\`

### Natural Language
Agents communiceren in natuurlijke taal:
- Flexibeler en expressiever
- Makkelijker te debuggen
- Risico op ambiguïteit

### Hybrid Approach
Combinatie van structured en natural:
- Structured voor metadata
- Natural language voor content
- Best of both worlds

## Effective Delegation Strategies

### 1. Clear Task Definition
- **Specifiek**: Exact wat moet gebeuren
- **Meetbaar**: Duidelijke success criteria
- **Achievable**: Realistisch voor ontvanger
- **Relevant**: Past bij agent expertise
- **Time-bound**: Duidelijke deadline

### 2. Context Preservation
Behoud belangrijke informatie:
- Project achtergrond
- Eerdere beslissingen
- Constraints en requirements
- Stakeholder verwachtingen

### 3. Delegation Criteria
Wanneer en wat delegeren:
- **Complexity**: Te complex voor één agent
- **Expertise**: Specialistische kennis vereist
- **Capacity**: Huidige agent overbelast
- **Efficiency**: Andere agent sneller/beter

### 4. Follow-up Protocols
- Status updates op key milestones
- Escalatie procedures bij problemen
- Quality checks op deliverables
- Feedback loops voor verbetering

## Collaboration Best Practices

### 1. Establish Communication Norms
- Response time expectations
- Preferred communication channels
- Escalation procedures
- Meeting cadences

### 2. Define Roles Clearly
- Primary responsibilities
- Decision making authority
- Collaboration boundaries
- Accountability measures

### 3. Create Shared Understanding
- Common terminology
- Shared goals en KPIs
- Aligned working methods
- Cultural considerations

### 4. Handle Conflicts Constructively
- Identify root causes
- Focus op gemeenschappelijke doelen
- Seek win-win oplossingen
- Learn from disagreements

## Advanced Communication Patterns

### Broadcasting
Één agent naar alle relevante agents:
- Announcements
- Status updates
- Knowledge sharing

### Request-Response Chains
Complex queries door multiple agents:
\`\`\`
Client → Orchestrator → Specialist A → Specialist B → Orchestrator → Client
\`\`\`

### Pub-Sub Patterns
Agents subscriben op relevante topics:
- Event-driven communication
- Loose coupling
- Scalable architecture

### Feedback Loops
Continuous improvement via feedback:
- Performance metrics sharing
- Lesson learned sessions
- Iterative refinement

## Common Communication Pitfalls

### 1. Information Overload
Te veel onnodige communicatie

### 2. Context Switching
Agents constant onderbroken

### 3. Unclear Ownership
Onduidelijk wie verantwoordelijk is

### 4. Communication Silos
Teams communiceren niet cross-functioneel

## Measuring Communication Effectiveness

### Key Metrics
- **Response Time**: Hoe snel agents reageren
- **Resolution Rate**: Succesvol afgeronde taken
- **Handoff Efficiency**: Soepele overdrachten
- **Collaboration Score**: Kwaliteit van samenwerking

### Optimization Strategies
- Regular retrospectives
- Communication audits
- Process refinements
- Tool improvements`,
  codeExamples: [
    {
      id: 'example-1',
      title: 'Advanced Delegation System',
      language: 'python',
      code: `from crewai import Agent, Task, Crew
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import json

@dataclass
class DelegationContext:
    """Context voor task delegation"""
    original_task: Task
    delegation_reason: str
    parent_agent: Agent
    constraints: Dict
    deadline: Optional[datetime] = None
    priority: str = "medium"
    thread_id: str = None

class DelegationManager:
    """Beheer delegation tussen agents"""
    
    def __init__(self):
        self.delegation_history = []
        self.active_delegations = {}
        self.agent_workload = {}
        
    def can_delegate(self, from_agent: Agent, to_agent: Agent, task: Task) -> Tuple[bool, str]:
        """Check of delegation mogelijk is"""
        
        # Check workload
        if self.get_agent_workload(to_agent) > 0.8:
            return False, "Target agent overloaded"
        
        # Check expertise match
        if not self._matches_expertise(to_agent, task):
            return False, "Expertise mismatch"
        
        # Check delegation depth (prevent infinite delegation)
        if self._get_delegation_depth(task) > 3:
            return False, "Max delegation depth reached"
        
        # Check circular delegation
        if self._would_create_cycle(from_agent, to_agent, task):
            return False, "Would create circular delegation"
        
        return True, "Delegation allowed"
    
    def delegate_task(self, context: DelegationContext, to_agent: Agent) -> Optional[str]:
        """Delegeer task naar andere agent"""
        
        can_delegate, reason = self.can_delegate(
            context.parent_agent, 
            to_agent, 
            context.original_task
        )
        
        if not can_delegate:
            return f"Delegation failed: {reason}"
        
        # Create delegation record
        delegation_id = f"del_{datetime.now().timestamp()}"
        
        delegation_record = {
            "id": delegation_id,
            "from": context.parent_agent.role,
            "to": to_agent.role,
            "task": context.original_task.description,
            "reason": context.delegation_reason,
            "timestamp": datetime.now().isoformat(),
            "status": "active",
            "context": context
        }
        
        self.active_delegations[delegation_id] = delegation_record
        self.delegation_history.append(delegation_record)
        
        # Update workload
        self._update_workload(to_agent, 0.2)  # Add 20% workload
        
        # Create delegated task
        delegated_task = Task(
            description=f"""
            DELEGATED TASK:
            Original: {context.original_task.description}
            
            Delegation Context:
            - From: {context.parent_agent.role}
            - Reason: {context.delegation_reason}
            - Constraints: {json.dumps(context.constraints)}
            - Priority: {context.priority}
            - Deadline: {context.deadline}
            
            Please complete this task and report back with results.
            """,
            expected_output=context.original_task.expected_output,
            agent=to_agent
        )
        
        # Execute delegated task
        result = to_agent.execute(delegated_task)
        
        # Update delegation status
        self.active_delegations[delegation_id]["status"] = "completed"
        self.active_delegations[delegation_id]["result"] = result
        
        # Update workload
        self._update_workload(to_agent, -0.2)  # Remove workload
        
        return result
    
    def _matches_expertise(self, agent: Agent, task: Task) -> bool:
        """Check of agent expertise matcht met task"""
        # Simplified - in reality would use NLP/embedding similarity
        task_keywords = task.description.lower().split()
        agent_keywords = agent.backstory.lower().split() + agent.role.lower().split()
        
        overlap = len(set(task_keywords) & set(agent_keywords))
        return overlap > 3  # Arbitrary threshold
    
    def _get_delegation_depth(self, task: Task) -> int:
        """Bereken hoe diep deze task al gedelegeerd is"""
        depth = 0
        for record in self.delegation_history:
            if task.description in record["task"]:
                depth += 1
        return depth
    
    def _would_create_cycle(self, from_agent: Agent, to_agent: Agent, task: Task) -> bool:
        """Check voor circular delegation"""
        # Check if to_agent previously delegated to from_agent
        for record in self.delegation_history:
            if (record["from"] == to_agent.role and 
                record["to"] == from_agent.role and
                task.description in record["task"]):
                return True
        return False
    
    def get_agent_workload(self, agent: Agent) -> float:
        """Get current workload (0.0 - 1.0)"""
        return self.agent_workload.get(agent.role, 0.0)
    
    def _update_workload(self, agent: Agent, delta: float):
        """Update agent workload"""
        current = self.agent_workload.get(agent.role, 0.0)
        self.agent_workload[agent.role] = max(0.0, min(1.0, current + delta))

# Voorbeeld: Smart Delegation
delegation_manager = DelegationManager()

# Create agents with delegation capabilities
project_manager = Agent(
    role="Project Manager",
    goal="Coordinate project execution and ensure timely delivery",
    backstory="Experienced PM with strong delegation and coordination skills",
    allow_delegation=True
)

senior_developer = Agent(
    role="Senior Developer", 
    goal="Implement complex technical solutions",
    backstory="Expert developer specializing in backend systems and architecture",
    allow_delegation=True
)

junior_developer = Agent(
    role="Junior Developer",
    goal="Implement features under guidance",
    backstory="Eager learner with growing programming skills",
    allow_delegation=False  # Cannot delegate further
)

# Complex task requiring delegation
complex_task = Task(
    description="Build a real-time chat system with user authentication and message persistence",
    expected_output="Working chat system with documentation"
)

# PM decides to delegate
delegation_context = DelegationContext(
    original_task=complex_task,
    delegation_reason="Technical implementation requires developer expertise",
    parent_agent=project_manager,
    constraints={
        "technology": "Python/WebSockets",
        "deadline": "2 weeks",
        "requirements": ["scalable", "secure", "tested"]
    },
    priority="high"
)

# Delegate to senior developer
result = delegation_manager.delegate_task(delegation_context, senior_developer)

# Senior developer might further delegate parts
junior_task_context = DelegationContext(
    original_task=Task(
        description="Implement user authentication module",
        expected_output="Working auth module with tests"
    ),
    delegation_reason="Good learning opportunity for junior developer",
    parent_agent=senior_developer,
    constraints={"framework": "FastAPI", "auth_type": "JWT"},
    priority="medium"
)

# Check if can delegate to junior
can_delegate, reason = delegation_manager.can_delegate(
    senior_developer, 
    junior_developer,
    junior_task_context.original_task
)

if can_delegate:
    junior_result = delegation_manager.delegate_task(junior_task_context, junior_developer)`,
      explanation: 'Een sophisticated delegation system die workload, expertise, en delegation depth tracked om intelligente delegation beslissingen te maken.'
    },
    {
      id: 'example-2',
      title: 'Collaboration Protocol Implementation',
      language: 'python',
      code: `from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from concurrent.futures import ThreadPoolExecutor, Future
import asyncio
from dataclasses import dataclass

@dataclass 
class Message:
    """Structured message tussen agents"""
    sender: str
    recipient: str
    message_type: str  # request, response, notification, broadcast
    content: Dict[str, Any]
    thread_id: str
    timestamp: datetime
    priority: str = "medium"
    
class CollaborationProtocol(ABC):
    """Abstract base voor collaboration protocols"""
    
    @abstractmethod
    async def execute(self, agents: List[Agent], task: Task) -> Any:
        pass

class SequentialCollaboration(CollaborationProtocol):
    """Agents werken in sequence"""
    
    async def execute(self, agents: List[Agent], task: Task) -> Any:
        results = []
        context = {"task": task.description, "previous_results": []}
        
        for agent in agents:
            # Build task with accumulated context
            agent_task = Task(
                description=f"""
                Original task: {task.description}
                
                Your role: {agent.role}
                Previous work: {json.dumps(context['previous_results'])}
                
                Please contribute your expertise to this task.
                """,
                expected_output=f"{agent.role} contribution",
                agent=agent
            )
            
            result = await self._execute_with_timeout(agent, agent_task)
            results.append({
                "agent": agent.role,
                "contribution": result,
                "timestamp": datetime.now()
            })
            
            # Update context for next agent
            context["previous_results"].append({
                "agent": agent.role,
                "result": result
            })
        
        return self._synthesize_results(results)
    
    async def _execute_with_timeout(self, agent: Agent, task: Task, timeout: int = 300):
        """Execute met timeout"""
        try:
            return await asyncio.wait_for(
                asyncio.to_thread(agent.execute, task),
                timeout=timeout
            )
        except asyncio.TimeoutError:
            return f"Timeout: {agent.role} did not complete in {timeout}s"

class ParallelCollaboration(CollaborationProtocol):
    """Agents werken parallel"""
    
    async def execute(self, agents: List[Agent], task: Task) -> Any:
        tasks = []
        
        for agent in agents:
            agent_task = Task(
                description=f"""
                Task: {task.description}
                
                Provide your {agent.role} perspective on this task.
                Work independently and focus on your area of expertise.
                """,
                expected_output=f"{agent.role} analysis",
                agent=agent
            )
            
            tasks.append(self._execute_async(agent, agent_task))
        
        # Wait for all agents to complete
        results = await asyncio.gather(*tasks)
        
        return self._merge_parallel_results(results, agents)
    
    async def _execute_async(self, agent: Agent, task: Task):
        """Execute agent task asynchronously"""
        return await asyncio.to_thread(agent.execute, task)
    
    def _merge_parallel_results(self, results: List[str], agents: List[Agent]) -> Dict:
        """Merge results van parallel execution"""
        merged = {
            "execution_type": "parallel",
            "contributions": {}
        }
        
        for agent, result in zip(agents, results):
            merged["contributions"][agent.role] = {
                "result": result,
                "timestamp": datetime.now().isoformat()
            }
        
        return merged

class ConsensusCollaboration(CollaborationProtocol):
    """Agents bereiken consensus via discussion"""
    
    def __init__(self, max_rounds: int = 3):
        self.max_rounds = max_rounds
        self.discussion_history = []
    
    async def execute(self, agents: List[Agent], task: Task) -> Any:
        consensus_reached = False
        round_num = 0
        proposals = {}
        
        while not consensus_reached and round_num < self.max_rounds:
            round_num += 1
            
            # Round 1: Initial proposals
            if round_num == 1:
                proposals = await self._gather_initial_proposals(agents, task)
            else:
                # Subsequent rounds: Respond to other proposals
                proposals = await self._discussion_round(agents, task, proposals)
            
            # Check for consensus
            consensus_reached = self._check_consensus(proposals)
            
            self.discussion_history.append({
                "round": round_num,
                "proposals": proposals.copy(),
                "consensus": consensus_reached
            })
        
        if consensus_reached:
            return self._extract_consensus(proposals)
        else:
            # If no consensus, use voting or moderator
            return await self._resolve_without_consensus(agents, proposals)
    
    async def _gather_initial_proposals(self, agents: List[Agent], task: Task) -> Dict:
        """Gather initial proposals from all agents"""
        proposals = {}
        
        tasks = []
        for agent in agents:
            proposal_task = Task(
                description=f"""
                Task: {task.description}
                
                Provide your initial proposal for solving this task.
                Be specific and justify your approach.
                """,
                expected_output="Detailed proposal",
                agent=agent
            )
            tasks.append((agent.role, self._execute_async(agent, proposal_task)))
        
        # Execute all proposals in parallel
        for role, task_future in tasks:
            result = await task_future
            proposals[role] = {
                "proposal": result,
                "supporters": [role],  # Initially support own proposal
                "critiques": []
            }
        
        return proposals
    
    async def _discussion_round(self, agents: List[Agent], task: Task, current_proposals: Dict) -> Dict:
        """Conduct discussion round"""
        updated_proposals = current_proposals.copy()
        
        for agent in agents:
            review_task = Task(
                description=f"""
                Original task: {task.description}
                
                Current proposals:
                {json.dumps(current_proposals, indent=2)}
                
                Review all proposals and either:
                1. Support an existing proposal (state which one and why)
                2. Critique proposals and suggest improvements
                3. Maintain your original proposal with justification
                """,
                expected_output="Your position after reviewing proposals",
                agent=agent
            )
            
            response = await self._execute_async(agent, review_task)
            
            # Parse response and update proposals
            # (Simplified - in reality would use NLP to parse)
            if "support" in response.lower():
                # Agent supports another proposal
                for role, proposal in updated_proposals.items():
                    if role in response:
                        proposal["supporters"].append(agent.role)
            elif "critique" in response.lower():
                # Agent critiques proposals
                updated_proposals[agent.role]["critiques"].append(response)
        
        return updated_proposals
    
    def _check_consensus(self, proposals: Dict) -> bool:
        """Check if consensus is reached"""
        # Consensus = one proposal has majority support
        total_agents = sum(len(p["supporters"]) for p in proposals.values())
        
        for proposal in proposals.values():
            if len(proposal["supporters"]) > total_agents / 2:
                return True
        
        return False

# Advanced Communication Hub
class CommunicationHub:
    """Central hub voor agent communication"""
    
    def __init__(self):
        self.message_queue = asyncio.Queue()
        self.subscribers = {}  # topic -> [agents]
        self.message_history = []
        self.active_threads = {}
        
    async def send_message(self, message: Message):
        """Send message via hub"""
        # Log message
        self.message_history.append(message)
        
        # Route message
        if message.message_type == "broadcast":
            await self._broadcast(message)
        elif message.message_type == "request":
            await self._route_request(message)
        else:
            await self._direct_message(message)
    
    async def _broadcast(self, message: Message):
        """Broadcast naar alle relevante agents"""
        topic = message.content.get("topic", "general")
        
        if topic in self.subscribers:
            for agent in self.subscribers[topic]:
                await agent.receive_message(message)
    
    def subscribe(self, agent: Agent, topics: List[str]):
        """Subscribe agent aan topics"""
        for topic in topics:
            if topic not in self.subscribers:
                self.subscribers[topic] = []
            self.subscribers[topic].append(agent)

# Practical implementation
async def collaborative_problem_solving():
    """Complex problem solving met multiple collaboration patterns"""
    
    # Create diverse team
    architect = Agent(
        role="Software Architect",
        goal="Design scalable system architectures",
        backstory="Expert in distributed systems and design patterns"
    )
    
    security_expert = Agent(
        role="Security Expert",
        goal="Ensure system security and compliance",
        backstory="Specialized in threat modeling and secure design"
    )
    
    performance_engineer = Agent(
        role="Performance Engineer",
        goal="Optimize system performance and scalability",
        backstory="Expert in profiling, caching, and optimization"
    )
    
    # Complex task requiring multiple perspectives
    system_design_task = Task(
        description="""Design a high-performance authentication system that can:
        - Handle 1M+ concurrent users
        - Provide <100ms response time
        - Ensure military-grade security
        - Support multiple auth methods (OAuth, SAML, MFA)
        - Scale horizontally
        """,
        expected_output="Complete system design with architecture, security model, and performance strategy"
    )
    
    # Try different collaboration patterns
    protocols = {
        "sequential": SequentialCollaboration(),
        "parallel": ParallelCollaboration(),
        "consensus": ConsensusCollaboration(max_rounds=3)
    }
    
    results = {}
    for name, protocol in protocols.items():
        print(f"\\nTrying {name} collaboration...")
        result = await protocol.execute(
            [architect, security_expert, performance_engineer],
            system_design_task
        )
        results[name] = result
    
    return results

# Run collaborative problem solving
if __name__ == "__main__":
    results = asyncio.run(collaborative_problem_solving())
    print(json.dumps(results, indent=2))`,
      explanation: 'Verschillende collaboration protocols (sequential, parallel, consensus) implementeren verschillende manieren waarop agents kunnen samenwerken aan complexe taken.'
    },
    {
      id: 'example-3',
      title: 'Inter-Agent Communication System',
      language: 'python',
      code: `from typing import Dict, List, Optional, Callable
from enum import Enum
import queue
import threading
from datetime import datetime, timedelta

class MessagePriority(Enum):
    """Message priority levels"""
    URGENT = 1
    HIGH = 2
    MEDIUM = 3
    LOW = 4

class CommunicationProtocol:
    """Define hoe agents communiceren"""
    
    def __init__(self):
        self.message_formats = {
            "task_delegation": {
                "required_fields": ["task_id", "task_description", "deadline", "requirements"],
                "optional_fields": ["context", "resources", "constraints"]
            },
            "status_update": {
                "required_fields": ["task_id", "status", "progress"],
                "optional_fields": ["blockers", "eta", "notes"]
            },
            "knowledge_share": {
                "required_fields": ["topic", "content", "relevance"],
                "optional_fields": ["sources", "confidence", "applications"]
            },
            "help_request": {
                "required_fields": ["issue", "attempted_solutions", "urgency"],
                "optional_fields": ["context", "impact", "suggestions"]
            }
        }
        
        self.response_protocols = {
            "acknowledge": "Confirm message receipt",
            "accept": "Accept task or proposal",
            "decline": "Decline with reason",
            "clarify": "Request more information",
            "complete": "Task completed successfully"
        }

class AgentCommunicator:
    """Enhanced agent met communication capabilities"""
    
    def __init__(self, agent: Agent, communication_style: Dict):
        self.agent = agent
        self.communication_style = communication_style
        self.inbox = queue.PriorityQueue()
        self.outbox = queue.Queue()
        self.active_conversations = {}
        self.communication_history = []
        
        # Start message processing thread
        self.processing = True
        self.processor_thread = threading.Thread(target=self._process_messages)
        self.processor_thread.daemon = True
        self.processor_thread.start()
    
    def send_message(self, recipient: str, message_type: str, content: Dict, 
                    priority: MessagePriority = MessagePriority.MEDIUM) -> str:
        """Send structured message naar andere agent"""
        
        message_id = f"msg_{datetime.now().timestamp()}"
        
        message = {
            "id": message_id,
            "from": self.agent.role,
            "to": recipient,
            "type": message_type,
            "content": content,
            "priority": priority,
            "timestamp": datetime.now(),
            "thread_id": content.get("thread_id", message_id),
            "requires_response": message_type in ["task_delegation", "help_request"]
        }
        
        # Validate message format
        if not self._validate_message(message):
            raise ValueError(f"Invalid message format for type: {message_type}")
        
        # Apply communication style
        message = self._apply_communication_style(message)
        
        # Queue for sending
        self.outbox.put(message)
        self.communication_history.append(message)
        
        return message_id
    
    def _validate_message(self, message: Dict) -> bool:
        """Validate message format"""
        protocol = CommunicationProtocol()
        
        if message["type"] not in protocol.message_formats:
            return False
        
        required_fields = protocol.message_formats[message["type"]]["required_fields"]
        
        for field in required_fields:
            if field not in message["content"]:
                return False
        
        return True
    
    def _apply_communication_style(self, message: Dict) -> Dict:
        """Apply agent's communication style"""
        
        # Add personality to message
        if self.communication_style.get("formal", True):
            # Formal communication
            message["content"]["greeting"] = f"Dear {message['to']},"
            message["content"]["closing"] = "Best regards,"
        else:
            # Casual communication
            message["content"]["greeting"] = f"Hey {message['to']}!"
            message["content"]["closing"] = "Cheers,"
        
        # Add verbosity level
        if self.communication_style.get("verbose", False):
            message["content"]["additional_context"] = self._generate_context()
        
        # Add urgency indicators
        if message["priority"] == MessagePriority.URGENT:
            message["content"]["urgency_note"] = "URGENT: Immediate attention required"
        
        return message
    
    def _process_messages(self):
        """Background thread voor message processing"""
        while self.processing:
            try:
                # Get highest priority message
                priority, message = self.inbox.get(timeout=1)
                
                # Process based on message type
                if message["type"] == "task_delegation":
                    self._handle_task_delegation(message)
                elif message["type"] == "help_request":
                    self._handle_help_request(message)
                elif message["type"] == "status_update":
                    self._handle_status_update(message)
                elif message["type"] == "knowledge_share":
                    self._handle_knowledge_share(message)
                
            except queue.Empty:
                continue
    
    def _handle_task_delegation(self, message: Dict):
        """Handle incoming task delegation"""
        
        # Evaluate if can accept task
        can_accept = self._evaluate_task_acceptance(message["content"])
        
        if can_accept:
            response = self.send_message(
                recipient=message["from"],
                message_type="response",
                content={
                    "thread_id": message["thread_id"],
                    "response_type": "accept",
                    "message": f"I'll handle the {message['content']['task_description']}",
                    "estimated_completion": self._estimate_completion_time(message["content"])
                }
            )
            
            # Start working on task
            self._execute_delegated_task(message["content"])
        else:
            response = self.send_message(
                recipient=message["from"],
                message_type="response",
                content={
                    "thread_id": message["thread_id"],
                    "response_type": "decline",
                    "message": "Unable to accept task at this time",
                    "reason": "Current workload too high",
                    "suggestion": "Try delegating to another specialist"
                }
            )

# Team Communication Manager
class TeamCommunicationManager:
    """Manage communication voor hele team"""
    
    def __init__(self, agents: List[AgentCommunicator]):
        self.agents = {agent.agent.role: agent for agent in agents}
        self.communication_metrics = {
            "messages_sent": 0,
            "messages_received": 0,
            "avg_response_time": timedelta(0),
            "delegation_success_rate": 0.0
        }
        self.communication_rules = self._setup_communication_rules()
        
    def _setup_communication_rules(self) -> Dict:
        """Define team communication rules"""
        return {
            "escalation_path": ["Junior", "Senior", "Lead", "Manager"],
            "max_delegation_depth": 3,
            "response_sla": {
                MessagePriority.URGENT: timedelta(minutes=15),
                MessagePriority.HIGH: timedelta(hours=1),
                MessagePriority.MEDIUM: timedelta(hours=4),
                MessagePriority.LOW: timedelta(days=1)
            },
            "broadcast_topics": ["system_update", "policy_change", "emergency"],
            "require_acknowledgment": ["task_delegation", "policy_change"]
        }
    
    def route_message(self, message: Dict):
        """Route message naar juiste recipient(s)"""
        
        if message["to"] == "broadcast":
            # Broadcast naar alle agents
            for agent in self.agents.values():
                if agent.agent.role != message["from"]:
                    agent.inbox.put((message["priority"].value, message))
        elif message["to"] in self.agents:
            # Direct message
            self.agents[message["to"]].inbox.put((message["priority"].value, message))
        else:
            # Find best recipient based on expertise
            best_recipient = self._find_best_recipient(message)
            if best_recipient:
                self.agents[best_recipient].inbox.put((message["priority"].value, message))
        
        # Update metrics
        self.communication_metrics["messages_sent"] += 1
    
    def _find_best_recipient(self, message: Dict) -> Optional[str]:
        """Find best recipient based op message content"""
        
        # Simple keyword matching (in reality: use embeddings)
        keywords = message["content"].get("keywords", [])
        
        best_match = None
        best_score = 0
        
        for role, agent in self.agents.items():
            score = self._calculate_expertise_match(agent, keywords)
            if score > best_score:
                best_score = score
                best_match = role
        
        return best_match

# Practical Example: Complex Project Coordination
def coordinate_complex_project():
    """Coordinate complex project met team communication"""
    
    # Create team with communication styles
    pm_communicator = AgentCommunicator(
        agent=Agent(
            role="Project Manager",
            goal="Coordinate team and deliver project on time",
            backstory="Experienced PM with excellent communication skills"
        ),
        communication_style={
            "formal": True,
            "verbose": True,
            "proactive": True
        }
    )
    
    architect_communicator = AgentCommunicator(
        agent=Agent(
            role="Software Architect",
            goal="Design robust system architecture",
            backstory="Technical expert who values clarity"
        ),
        communication_style={
            "formal": True,
            "verbose": False,
            "technical": True
        }
    )
    
    developer_communicator = AgentCommunicator(
        agent=Agent(
            role="Senior Developer",
            goal="Implement high-quality code",
            backstory="Pragmatic developer who gets things done"
        ),
        communication_style={
            "formal": False,
            "verbose": False,
            "direct": True
        }
    )
    
    # Create team manager
    team_manager = TeamCommunicationManager([
        pm_communicator,
        architect_communicator,
        developer_communicator
    ])
    
    # PM delegates initial task
    pm_communicator.send_message(
        recipient="Software Architect",
        message_type="task_delegation",
        content={
            "task_id": "ARCH-001",
            "task_description": "Design microservices architecture for e-commerce platform",
            "deadline": datetime.now() + timedelta(days=3),
            "requirements": [
                "Support 100k concurrent users",
                "Sub-second response time",
                "Fault tolerant"
            ],
            "context": "New greenfield project for major client"
        },
        priority=MessagePriority.HIGH
    )
    
    # Architect needs help and collaborates
    architect_communicator.send_message(
        recipient="Senior Developer",
        message_type="help_request",
        content={
            "issue": "Need input on API gateway selection",
            "attempted_solutions": ["Evaluated Kong", "Reviewed AWS API Gateway"],
            "urgency": "medium",
            "context": "Part of microservices architecture design"
        },
        priority=MessagePriority.MEDIUM
    )
    
    # Knowledge sharing
    developer_communicator.send_message(
        recipient="broadcast",
        message_type="knowledge_share",
        content={
            "topic": "API Gateway Performance Comparison",
            "content": "Based on our load tests: Kong handles 50k req/s, AWS manages 30k req/s",
            "relevance": "Critical for architecture decision",
            "sources": ["Internal benchmarks", "Production metrics"],
            "confidence": 0.9
        },
        priority=MessagePriority.LOW
    )
    
    return team_manager

# Execute team coordination
team = coordinate_complex_project()
print(f"Team communication metrics: {team.communication_metrics}")`,
      explanation: 'Een comprehensive communication system dat structured messages, priority handling, communication styles, en team coordination implementeert.'
    },
    {
      id: 'example-4',
      title: 'Adaptive Collaboration Framework',
      language: 'python',
      code: `from typing import List, Dict, Optional, Tuple
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from dataclasses import dataclass, field

@dataclass
class CollaborationContext:
    """Track collaboration context en history"""
    task_complexity: float  # 0.0 - 1.0
    time_pressure: float    # 0.0 - 1.0
    team_harmony: float     # 0.0 - 1.0
    success_rate: float     # 0.0 - 1.0
    conflict_history: List[Dict] = field(default_factory=list)
    successful_patterns: List[str] = field(default_factory=list)

class AdaptiveCollaborationManager:
    """Kies optimale collaboration strategy based op context"""
    
    def __init__(self):
        self.collaboration_strategies = {
            "hierarchical": self._hierarchical_collaboration,
            "consensus": self._consensus_collaboration,
            "parallel": self._parallel_collaboration,
            "swarm": self._swarm_collaboration,
            "pair": self._pair_collaboration
        }
        
        self.strategy_effectiveness = {
            strategy: {"attempts": 0, "successes": 0, "avg_time": 0}
            for strategy in self.collaboration_strategies
        }
        
        self.context_history = []
        
    def select_collaboration_strategy(
        self, 
        context: CollaborationContext,
        available_agents: List[Agent]
    ) -> Tuple[str, Callable]:
        """Select beste collaboration strategy voor context"""
        
        # Calculate strategy scores
        strategy_scores = {}
        
        for strategy in self.collaboration_strategies:
            score = self._calculate_strategy_score(strategy, context, available_agents)
            strategy_scores[strategy] = score
        
        # Select best strategy
        best_strategy = max(strategy_scores, key=strategy_scores.get)
        
        # Add randomness for exploration (epsilon-greedy)
        if np.random.random() < 0.1:  # 10% exploration
            best_strategy = np.random.choice(list(self.collaboration_strategies.keys()))
        
        return best_strategy, self.collaboration_strategies[best_strategy]
    
    def _calculate_strategy_score(
        self, 
        strategy: str, 
        context: CollaborationContext,
        agents: List[Agent]
    ) -> float:
        """Calculate strategy effectiveness score"""
        
        score = 0.0
        
        # Historical performance
        if self.strategy_effectiveness[strategy]["attempts"] > 0:
            success_rate = (
                self.strategy_effectiveness[strategy]["successes"] / 
                self.strategy_effectiveness[strategy]["attempts"]
            )
            score += success_rate * 0.3
        
        # Context suitability
        if strategy == "hierarchical":
            # Good for high complexity, low time pressure
            score += (context.task_complexity * 0.4)
            score += ((1 - context.time_pressure) * 0.3)
            
        elif strategy == "parallel":
            # Good for low complexity, high time pressure
            score += ((1 - context.task_complexity) * 0.4)
            score += (context.time_pressure * 0.3)
            
        elif strategy == "consensus":
            # Good for high team harmony, medium complexity
            score += (context.team_harmony * 0.5)
            score += (abs(context.task_complexity - 0.5) * 0.2)
            
        elif strategy == "swarm":
            # Good for very complex tasks with many agents
            score += (context.task_complexity * 0.3)
            score += (min(len(agents) / 10, 1.0) * 0.4)
            
        elif strategy == "pair":
            # Good for medium complexity, learning opportunities
            score += (abs(context.task_complexity - 0.5) * 0.4)
            score += (0.3)  # Consistent moderate score
        
        # Penalize strategies with recent conflicts
        recent_conflicts = [
            c for c in context.conflict_history[-5:] 
            if c.get("strategy") == strategy
        ]
        score -= (len(recent_conflicts) * 0.1)
        
        return max(0, min(1, score))  # Clamp to [0, 1]
    
    def _hierarchical_collaboration(
        self, 
        agents: List[Agent], 
        task: Task,
        context: CollaborationContext
    ) -> Dict:
        """Top-down hierarchical collaboration"""
        
        # Sort agents by seniority/expertise
        sorted_agents = sorted(
            agents, 
            key=lambda a: self._extract_seniority(a),
            reverse=True
        )
        
        lead_agent = sorted_agents[0]
        team_agents = sorted_agents[1:]
        
        # Lead creates plan
        planning_task = Task(
            description=f"Create execution plan for: {task.description}",
            expected_output="Detailed task breakdown with assignments",
            agent=lead_agent
        )
        
        plan = lead_agent.execute(planning_task)
        
        # Distribute subtasks
        results = {"plan": plan, "executions": {}}
        
        for i, agent in enumerate(team_agents):
            subtask = Task(
                description=f"Execute your part of the plan: {plan}",
                expected_output="Completed subtask",
                agent=agent
            )
            
            results["executions"][agent.role] = agent.execute(subtask)
        
        # Lead reviews and integrates
        review_task = Task(
            description=f"Review and integrate results: {results['executions']}",
            expected_output="Final integrated solution",
            agent=lead_agent
        )
        
        results["final"] = lead_agent.execute(review_task)
        
        return results
    
    def _swarm_collaboration(
        self, 
        agents: List[Agent], 
        task: Task,
        context: CollaborationContext
    ) -> Dict:
        """Swarm intelligence - emergent collaboration"""
        
        swarm_state = {
            "pheromones": {},  # Shared knowledge/signals
            "solutions": [],
            "convergence": False
        }
        
        max_iterations = 5
        iteration = 0
        
        while not swarm_state["convergence"] and iteration < max_iterations:
            iteration += 1
            
            # Each agent works independently but influenced by pheromones
            iteration_results = []
            
            for agent in agents:
                # Agent perceives swarm state
                swarm_task = Task(
                    description=f"""
                    Task: {task.description}
                    
                    Swarm knowledge: {swarm_state['pheromones']}
                    Previous solutions: {len(swarm_state['solutions'])}
                    
                    Contribute your unique perspective or build on others.
                    """,
                    expected_output="Your contribution to swarm solution",
                    agent=agent
                )
                
                result = agent.execute(swarm_task)
                iteration_results.append({
                    "agent": agent.role,
                    "contribution": result
                })
                
                # Update pheromones (simplified)
                key_concepts = self._extract_key_concepts(result)
                for concept in key_concepts:
                    swarm_state["pheromones"][concept] = \
                        swarm_state["pheromones"].get(concept, 0) + 1
            
            swarm_state["solutions"].append(iteration_results)
            
            # Check convergence (simplified)
            if len(swarm_state["pheromones"]) > 10 and \
               max(swarm_state["pheromones"].values()) > len(agents) * 2:
                swarm_state["convergence"] = True
        
        return {
            "iterations": swarm_state["solutions"],
            "final_pheromones": swarm_state["pheromones"],
            "converged": swarm_state["convergence"]
        }
    
    def _pair_collaboration(
        self, 
        agents: List[Agent], 
        task: Task,
        context: CollaborationContext
    ) -> Dict:
        """Pair programming style collaboration"""
        
        # Select best pair based on complementary skills
        best_pair = self._select_optimal_pair(agents, task)
        
        if not best_pair:
            # Fallback to first two agents
            best_pair = agents[:2]
        
        driver, navigator = best_pair
        
        # Multiple rounds of pair collaboration
        rounds = []
        
        for round_num in range(3):
            # Driver proposes solution
            driver_task = Task(
                description=f"""
                Round {round_num + 1}: {task.description}
                
                As driver, propose a concrete solution or improvement.
                Previous rounds: {rounds}
                """,
                expected_output="Concrete solution proposal",
                agent=driver
            )
            
            driver_proposal = driver.execute(driver_task)
            
            # Navigator reviews and suggests
            navigator_task = Task(
                description=f"""
                Review this proposal: {driver_proposal}
                
                As navigator, identify issues, suggest improvements, or validate approach.
                """,
                expected_output="Review with specific feedback",
                agent=navigator
            )
            
            navigator_review = navigator.execute(navigator_task)
            
            rounds.append({
                "round": round_num + 1,
                "driver": driver.role,
                "proposal": driver_proposal,
                "navigator": navigator.role,
                "review": navigator_review
            })
            
            # Swap roles
            driver, navigator = navigator, driver
        
        # Final integration
        integration_task = Task(
            description=f"Integrate insights from pair collaboration: {rounds}",
            expected_output="Final integrated solution",
            agent=driver  # Current driver does final integration
        )
        
        final_solution = driver.execute(integration_task)
        
        return {
            "rounds": rounds,
            "final_solution": final_solution,
            "pair": [best_pair[0].role, best_pair[1].role]
        }
    
    def _select_optimal_pair(
        self, 
        agents: List[Agent], 
        task: Task
    ) -> Optional[Tuple[Agent, Agent]]:
        """Select optimal pair based op complementary skills"""
        
        if len(agents) < 2:
            return None
        
        # Calculate skill complementarity matrix
        skill_matrix = np.zeros((len(agents), len(agents)))
        
        for i, agent1 in enumerate(agents):
            for j, agent2 in enumerate(agents):
                if i != j:
                    # Calculate complementarity score
                    score = self._calculate_complementarity(agent1, agent2, task)
                    skill_matrix[i][j] = score
        
        # Find best pair
        best_score = 0
        best_pair = None
        
        for i in range(len(agents)):
            for j in range(i + 1, len(agents)):
                pair_score = skill_matrix[i][j] + skill_matrix[j][i]
                if pair_score > best_score:
                    best_score = pair_score
                    best_pair = (agents[i], agents[j])
        
        return best_pair
    
    def update_effectiveness(
        self, 
        strategy: str, 
        success: bool, 
        time_taken: float
    ):
        """Update strategy effectiveness metrics"""
        
        self.strategy_effectiveness[strategy]["attempts"] += 1
        if success:
            self.strategy_effectiveness[strategy]["successes"] += 1
        
        # Update average time (running average)
        old_avg = self.strategy_effectiveness[strategy]["avg_time"]
        attempts = self.strategy_effectiveness[strategy]["attempts"]
        new_avg = ((old_avg * (attempts - 1)) + time_taken) / attempts
        self.strategy_effectiveness[strategy]["avg_time"] = new_avg

# Example usage
async def adaptive_collaboration_example():
    """Demonstrate adaptive collaboration"""
    
    # Create diverse team
    agents = [
        Agent(role="Tech Lead", backstory="Senior technical leader"),
        Agent(role="Backend Dev", backstory="API and database expert"),
        Agent(role="Frontend Dev", backstory="UI/UX specialist"),
        Agent(role="Data Scientist", backstory="ML and analytics expert"),
        Agent(role="DevOps", backstory="Infrastructure specialist")
    ]
    
    # Create collaboration manager
    collab_manager = AdaptiveCollaborationManager()
    
    # Different scenarios with different contexts
    scenarios = [
        {
            "task": Task(
                description="Design real-time analytics dashboard",
                expected_output="Complete technical design"
            ),
            "context": CollaborationContext(
                task_complexity=0.7,
                time_pressure=0.3,
                team_harmony=0.8,
                success_rate=0.9
            )
        },
        {
            "task": Task(
                description="Fix critical production bug",
                expected_output="Bug fix and deployment"
            ),
            "context": CollaborationContext(
                task_complexity=0.4,
                time_pressure=0.9,
                team_harmony=0.7,
                success_rate=0.8
            )
        },
        {
            "task": Task(
                description="Plan new microservices architecture",
                expected_output="Architecture proposal"
            ),
            "context": CollaborationContext(
                task_complexity=0.9,
                time_pressure=0.2,
                team_harmony=0.6,
                success_rate=0.7
            )
        }
    ]
    
    # Execute scenarios with adaptive strategy selection
    for scenario in scenarios:
        print(f"\\nTask: {scenario['task'].description}")
        
        # Select strategy
        strategy, executor = collab_manager.select_collaboration_strategy(
            scenario["context"],
            agents
        )
        
        print(f"Selected strategy: {strategy}")
        
        # Execute collaboration
        start_time = datetime.now()
        result = executor(agents, scenario["task"], scenario["context"])
        time_taken = (datetime.now() - start_time).total_seconds()
        
        # Evaluate success (simplified)
        success = len(str(result)) > 100  # Simple success metric
        
        # Update effectiveness
        collab_manager.update_effectiveness(strategy, success, time_taken)
        
        print(f"Success: {success}, Time: {time_taken:.2f}s")
    
    # Show learned effectiveness
    print("\\nLearned Strategy Effectiveness:")
    for strategy, metrics in collab_manager.strategy_effectiveness.items():
        if metrics["attempts"] > 0:
            success_rate = metrics["successes"] / metrics["attempts"]
            print(f"{strategy}: {success_rate:.2%} success, {metrics['avg_time']:.2f}s avg")

# Run adaptive collaboration
if __name__ == "__main__":
    import asyncio
    asyncio.run(adaptive_collaboration_example())`,
      explanation: 'Adaptive collaboration framework dat leert welke collaboration strategies het beste werken in verschillende contexten en zich aanpast aan team dynamics.'
    }
  ],
  assignments: [
    {
      id: 'assignment-2-3',
      title: 'Implementeer een Multi-Agent Negotiation System',
      description: 'Bouw een systeem waar agents onderhandelen over resource allocatie en conflicten oplossen.',
      difficulty: 'hard',
      type: 'code',
      initialCode: `from crewai import Agent, Task
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
import json

@dataclass
class Resource:
    """Resource die agents nodig hebben"""
    name: str
    quantity: int
    priority: str  # high, medium, low
    divisible: bool  # Kan resource gedeeld worden?

@dataclass
class Proposal:
    """Negotiation proposal"""
    proposer: str
    allocation: Dict[str, Dict[str, int]]  # {agent: {resource: quantity}}
    justification: str
    compromises: List[str]

class NegotiationAgent(Agent):
    """Agent met negotiation capabilities"""
    
    def __init__(self, negotiation_style: str, **kwargs):
        super().__init__(**kwargs)
        self.negotiation_style = negotiation_style  # competitive, collaborative, compromising
        self.resources_needed = {}
        self.current_resources = {}
        self.negotiation_history = []
    
    def set_resource_needs(self, needs: Dict[str, int]):
        """Define welke resources deze agent nodig heeft"""
        self.resources_needed = needs
    
    def create_proposal(self, available_resources: List[Resource], 
                       other_agents: List['NegotiationAgent']) -> Proposal:
        """Creëer een resource allocation proposal"""
        
        # Jouw implementatie hier
        # Hint: Negotiation style moet proposal beïnvloeden
        pass
    
    def evaluate_proposal(self, proposal: Proposal) -> Tuple[bool, str]:
        """Evalueer een proposal van andere agent"""
        
        # Return (accept: bool, reason: str)
        # Jouw implementatie hier
        pass
    
    def counter_proposal(self, original: Proposal) -> Optional[Proposal]:
        """Maak counter-proposal als je het niet eens bent"""
        
        # Jouw implementatie hier
        pass

class MultiAgentNegotiationSystem:
    """Orchestreer multi-agent negotiations"""
    
    def __init__(self, agents: List[NegotiationAgent], resources: List[Resource]):
        self.agents = agents
        self.resources = resources
        self.negotiation_rounds = []
        self.final_allocation = None
        
    def negotiate(self, max_rounds: int = 5) -> Dict[str, Dict[str, int]]:
        """Run negotiation process"""
        
        current_allocation = None
        consensus = False
        round_num = 0
        
        while not consensus and round_num < max_rounds:
            round_num += 1
            round_results = {"round": round_num, "proposals": [], "votes": {}}
            
            # Fase 1: Collect proposals
            # Jouw implementatie hier
            
            # Fase 2: Vote on proposals  
            # Jouw implementatie hier
            
            # Fase 3: Check consensus or continue
            # Jouw implementatie hier
            
            self.negotiation_rounds.append(round_results)
        
        self.final_allocation = current_allocation or self._fallback_allocation()
        return self.final_allocation
    
    def _fallback_allocation(self) -> Dict[str, Dict[str, int]]:
        """Fallback als geen consensus bereikt wordt"""
        
        # Implementeer fair fallback allocation
        pass
    
    def _check_allocation_validity(self, allocation: Dict[str, Dict[str, int]]) -> bool:
        """Check of allocation valid is (niet meer dan available)"""
        
        # Jouw implementatie hier
        pass

# Test scenario: Development team negotieert over resources
# Creëer 4 agents met verschillende negotiation styles
frontend_agent = NegotiationAgent(
    negotiation_style="collaborative",
    role="Frontend Team Lead",
    goal="Secure resources for UI development",
    backstory="___"  # Vul backstory in
)

backend_agent = NegotiationAgent(
    negotiation_style="competitive", 
    role="Backend Team Lead",
    goal="Get maximum resources for API development",
    backstory="___"  # Vul backstory in
)

qa_agent = NegotiationAgent(
    negotiation_style="compromising",
    role="QA Team Lead", 
    goal="Ensure adequate testing resources",
    backstory="___"  # Vul backstory in
)

devops_agent = NegotiationAgent(
    negotiation_style="___",  # Kies style
    role="DevOps Lead",
    goal="___",
    backstory="___"
)

# Define available resources
resources = [
    Resource("senior_developers", 8, "high", True),
    Resource("cloud_budget", 50000, "high", True),
    Resource("testing_devices", 20, "medium", True),
    Resource("ci_cd_runners", 10, "medium", False),
    Resource("dedicated_servers", 5, "high", False)
]

# Set resource needs voor elke agent
frontend_agent.set_resource_needs({
    "senior_developers": 3,
    "cloud_budget": 15000,
    "testing_devices": 10
})

backend_agent.set_resource_needs({
    "senior_developers": 4,
    "cloud_budget": 25000,
    "dedicated_servers": 3
})

qa_agent.set_resource_needs({
    "senior_developers": 2,
    "testing_devices": 15,
    "ci_cd_runners": 5
})

devops_agent.set_resource_needs({
    # Define needs
})

# Bonus: Implementeer mediation
class MediatorAgent(Agent):
    """Neutrale mediator voor moeilijke negotiations"""
    
    def mediate(self, agents: List[NegotiationAgent], 
                conflict: Dict) -> Optional[Proposal]:
        """Probeer compromise te vinden"""
        
        # Jouw implementatie hier
        pass

# Test het systeem
negotiation_system = MultiAgentNegotiationSystem(
    agents=[frontend_agent, backend_agent, qa_agent, devops_agent],
    resources=resources
)

# Run negotiation
final_allocation = negotiation_system.negotiate()

# Analyse resultaten
def analyze_negotiation_results(system: MultiAgentNegotiationSystem):
    """Analyseer hoe de negotiation verliep"""
    
    # Implementeer analyse:
    # - Welke agent kreeg meeste resources?
    # - Hoe veel rondes waren nodig?
    # - Welke negotiation style was meest succesvol?
    # - Waren er win-win situaties?
    pass`,
      solution: `from crewai import Agent, Task
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
import json

@dataclass
class Resource:
    """Resource die agents nodig hebben"""
    name: str
    quantity: int
    priority: str  # high, medium, low
    divisible: bool

@dataclass 
class Proposal:
    """Negotiation proposal"""
    proposer: str
    allocation: Dict[str, Dict[str, int]]
    justification: str
    compromises: List[str]

class NegotiationAgent(Agent):
    """Agent met negotiation capabilities"""
    
    def __init__(self, negotiation_style: str, **kwargs):
        super().__init__(**kwargs)
        self.negotiation_style = negotiation_style
        self.resources_needed = {}
        self.current_resources = {}
        self.negotiation_history = []
        self.satisfaction_threshold = 0.6  # Min satisfaction om te accepteren
    
    def set_resource_needs(self, needs: Dict[str, int]):
        """Define resource needs"""
        self.resources_needed = needs
    
    def create_proposal(self, available_resources: List[Resource], 
                       other_agents: List['NegotiationAgent']) -> Proposal:
        """Create resource allocation proposal"""
        
        allocation = {}
        
        if self.negotiation_style == "competitive":
            # Try to maximize own gain
            allocation[self.role] = {}
            for resource in available_resources:
                if resource.name in self.resources_needed:
                    # Claim what we need (or more)
                    wanted = min(
                        int(self.resources_needed[resource.name] * 1.2),
                        resource.quantity
                    )
                    allocation[self.role][resource.name] = wanted
            
            # Minimal allocation voor anderen
            remaining = self._calculate_remaining(available_resources, allocation)
            for agent in other_agents:
                allocation[agent.role] = {}
                for resource_name, quantity in remaining.items():
                    if resource_name in agent.resources_needed:
                        allocation[agent.role][resource_name] = \
                            min(quantity // len(other_agents), 
                                agent.resources_needed[resource_name] // 2)
            
            justification = "I need these resources for critical project deliverables"
            compromises = ["Willing to share cloud budget if absolutely necessary"]
            
        elif self.negotiation_style == "collaborative":
            # Try to find win-win
            total_needs = self._calculate_total_needs(
                [self] + other_agents
            )
            
            for agent in [self] + other_agents:
                allocation[agent.role] = {}
                for resource in available_resources:
                    if resource.name in agent.resources_needed:
                        # Proportional allocation based on needs
                        if total_needs.get(resource.name, 0) > 0:
                            ratio = (agent.resources_needed[resource.name] / 
                                   total_needs[resource.name])
                            allocation[agent.role][resource.name] = \
                                int(resource.quantity * ratio)
            
            justification = "Fair distribution based on everyone's stated needs"
            compromises = ["Happy to adjust if someone has urgent deadline",
                         "Can share testing devices on schedule"]
            
        else:  # compromising
            # Middle ground approach
            allocation[self.role] = {}
            for resource in available_resources:
                if resource.name in self.resources_needed:
                    # Ask for 80% of needs
                    allocation[self.role][resource.name] = \
                        int(self.resources_needed[resource.name] * 0.8)
            
            # Fair split of remaining
            remaining = self._calculate_remaining(available_resources, allocation)
            for agent in other_agents:
                allocation[agent.role] = {}
                for resource_name, quantity in remaining.items():
                    if resource_name in agent.resources_needed:
                        fair_share = quantity // len(other_agents)
                        allocation[agent.role][resource_name] = \
                            min(fair_share, agent.resources_needed[resource_name])
            
            justification = "Balanced approach considering everyone's needs"
            compromises = ["Can work with 80% of requested resources",
                         "Flexible on timing of resource usage"]
        
        return Proposal(
            proposer=self.role,
            allocation=allocation,
            justification=justification,
            compromises=compromises
        )
    
    def evaluate_proposal(self, proposal: Proposal) -> Tuple[bool, str]:
        """Evaluate proposal"""
        
        my_allocation = proposal.allocation.get(self.role, {})
        satisfaction = self._calculate_satisfaction(my_allocation)
        
        if self.negotiation_style == "competitive":
            # Only accept if we get most of what we want
            threshold = 0.8
            if satisfaction >= threshold:
                return True, f"Acceptable - meets {satisfaction:.0%} of my needs"
            else:
                return False, f"Unacceptable - only meets {satisfaction:.0%} of needs"
                
        elif self.negotiation_style == "collaborative":
            # Check if everyone gets fair share
            total_satisfaction = 0
            agent_count = len(proposal.allocation)
            
            for agent_role, alloc in proposal.allocation.items():
                # Estimate satisfaction (simplified)
                total_satisfaction += len(alloc) / max(len(self.resources_needed), 1)
            
            avg_satisfaction = total_satisfaction / agent_count
            
            if satisfaction >= 0.5 and avg_satisfaction >= 0.6:
                return True, "Fair distribution that helps everyone"
            else:
                return False, "Not equitable enough for all parties"
                
        else:  # compromising
            if satisfaction >= self.satisfaction_threshold:
                return True, f"Acceptable compromise at {satisfaction:.0%}"
            else:
                return False, f"Below minimum threshold of {self.satisfaction_threshold:.0%}"
    
    def counter_proposal(self, original: Proposal) -> Optional[Proposal]:
        """Create counter-proposal"""
        
        my_allocation = original.allocation.get(self.role, {})
        satisfaction = self._calculate_satisfaction(my_allocation)
        
        if satisfaction >= 0.9:
            return None  # Good enough
        
        # Adjust original proposal
        counter_allocation = original.allocation.copy()
        
        if self.negotiation_style == "competitive":
            # Demand more
            for resource_name, needed in self.resources_needed.items():
                current = my_allocation.get(resource_name, 0)
                if current < needed:
                    # Take from others
                    for other_role, other_alloc in counter_allocation.items():
                        if other_role != self.role and resource_name in other_alloc:
                            transfer = min(
                                needed - current,
                                other_alloc[resource_name] // 2
                            )
                            counter_allocation[other_role][resource_name] -= transfer
                            if self.role not in counter_allocation:
                                counter_allocation[self.role] = {}
                            counter_allocation[self.role][resource_name] = \
                                current + transfer
                            break
            
            justification = "My team's deliverables are critical path"
            
        elif self.negotiation_style == "collaborative":
            # Suggest more balanced distribution
            under_served = []
            over_served = []
            
            for role, alloc in counter_allocation.items():
                agent_satisfaction = len(alloc) / 3  # Simplified
                if agent_satisfaction < 0.5:
                    under_served.append(role)
                elif agent_satisfaction > 0.8:
                    over_served.append(role)
            
            # Rebalance
            justification = "More balanced distribution benefits project success"
            
        else:  # compromising
            # Meet in the middle
            for resource_name, needed in self.resources_needed.items():
                current = my_allocation.get(resource_name, 0) 
                if current < needed * 0.7:
                    counter_allocation[self.role][resource_name] = \
                        int(needed * 0.75)
            
            justification = "Small adjustment to meet minimum viable needs"
        
        return Proposal(
            proposer=self.role,
            allocation=counter_allocation,
            justification=justification,
            compromises=original.compromises + ["Willing to negotiate further"]
        )
    
    def _calculate_satisfaction(self, allocation: Dict[str, int]) -> float:
        """Calculate satisfaction with allocation"""
        if not self.resources_needed:
            return 1.0
        
        satisfaction_sum = 0
        for resource, needed in self.resources_needed.items():
            allocated = allocation.get(resource, 0)
            satisfaction_sum += min(allocated / needed, 1.0) if needed > 0 else 1.0
        
        return satisfaction_sum / len(self.resources_needed)
    
    def _calculate_remaining(self, resources: List[Resource], 
                           allocation: Dict[str, Dict[str, int]]) -> Dict[str, int]:
        """Calculate remaining resources"""
        remaining = {r.name: r.quantity for r in resources}
        
        for agent_alloc in allocation.values():
            for resource, quantity in agent_alloc.items():
                remaining[resource] = remaining.get(resource, 0) - quantity
        
        return remaining
    
    def _calculate_total_needs(self, agents: List['NegotiationAgent']) -> Dict[str, int]:
        """Calculate total needs across agents"""
        total = {}
        for agent in agents:
            for resource, quantity in agent.resources_needed.items():
                total[resource] = total.get(resource, 0) + quantity
        return total

class MultiAgentNegotiationSystem:
    """Orchestrate multi-agent negotiations"""
    
    def __init__(self, agents: List[NegotiationAgent], resources: List[Resource]):
        self.agents = agents
        self.resources = resources
        self.negotiation_rounds = []
        self.final_allocation = None
        
    def negotiate(self, max_rounds: int = 5) -> Dict[str, Dict[str, int]]:
        """Run negotiation process"""
        
        current_allocation = None
        consensus = False
        round_num = 0
        
        while not consensus and round_num < max_rounds:
            round_num += 1
            round_results = {"round": round_num, "proposals": [], "votes": {}}
            
            # Phase 1: Collect proposals
            proposals = []
            for agent in self.agents:
                other_agents = [a for a in self.agents if a != agent]
                proposal = agent.create_proposal(self.resources, other_agents)
                proposals.append(proposal)
                round_results["proposals"].append({
                    "proposer": proposal.proposer,
                    "allocation": proposal.allocation,
                    "justification": proposal.justification
                })
            
            # Phase 2: Vote on proposals
            votes = {p.proposer: [] for p in proposals}
            
            for agent in self.agents:
                for proposal in proposals:
                    accept, reason = agent.evaluate_proposal(proposal)
                    votes[proposal.proposer].append({
                        "voter": agent.role,
                        "accept": accept,
                        "reason": reason
                    })
            
            round_results["votes"] = votes
            
            # Phase 3: Check consensus
            for proposal in proposals:
                acceptances = sum(1 for v in votes[proposal.proposer] if v["accept"])
                if acceptances >= len(self.agents) * 0.75:  # 75% agreement
                    consensus = True
                    current_allocation = proposal.allocation
                    break
            
            # Phase 4: Counter-proposals if no consensus
            if not consensus and round_num < max_rounds:
                # Agent with lowest satisfaction makes counter
                satisfactions = []
                for agent in self.agents:
                    best_satisfaction = 0
                    for proposal in proposals:
                        my_alloc = proposal.allocation.get(agent.role, {})
                        sat = agent._calculate_satisfaction(my_alloc)
                        best_satisfaction = max(best_satisfaction, sat)
                    satisfactions.append((agent, best_satisfaction))
                
                least_satisfied = min(satisfactions, key=lambda x: x[1])[0]
                counter = least_satisfied.counter_proposal(proposals[0])
                if counter:
                    proposals = [counter]  # Replace with counter for next round
            
            self.negotiation_rounds.append(round_results)
        
        self.final_allocation = current_allocation or self._fallback_allocation()
        return self.final_allocation
    
    def _fallback_allocation(self) -> Dict[str, Dict[str, int]]:
        """Fair fallback allocation"""
        allocation = {}
        
        # Equal split as fallback
        for agent in self.agents:
            allocation[agent.role] = {}
            
        for resource in self.resources:
            agents_needing = [a for a in self.agents 
                            if resource.name in a.resources_needed]
            
            if agents_needing:
                per_agent = resource.quantity // len(agents_needing)
                for agent in agents_needing:
                    allocation[agent.role][resource.name] = per_agent
        
        return allocation

# Create agents
frontend_agent = NegotiationAgent(
    negotiation_style="collaborative",
    role="Frontend Team Lead",
    goal="Secure resources for UI development",
    backstory="Sarah Chen leads frontend with focus on user experience and team collaboration"
)

backend_agent = NegotiationAgent(
    negotiation_style="competitive",
    role="Backend Team Lead", 
    goal="Get maximum resources for API development",
    backstory="Mike Johnson pushes hard for backend resources, knowing API performance is critical"
)

qa_agent = NegotiationAgent(
    negotiation_style="compromising",
    role="QA Team Lead",
    goal="Ensure adequate testing resources", 
    backstory="Lisa Park balances testing needs with project constraints"
)

devops_agent = NegotiationAgent(
    negotiation_style="collaborative",
    role="DevOps Lead",
    goal="Enable smooth deployments with adequate infrastructure",
    backstory="Alex Kumar focuses on shared infrastructure benefiting all teams"
)

# Set needs
devops_agent.set_resource_needs({
    "senior_developers": 2,
    "cloud_budget": 20000,
    "ci_cd_runners": 8,
    "dedicated_servers": 2
})

# Mediator implementation
class MediatorAgent(Agent):
    """Neutral mediator"""
    
    def mediate(self, agents: List[NegotiationAgent], 
                conflict: Dict) -> Optional[Proposal]:
        """Find compromise"""
        
        # Analyze needs vs available
        total_available = {r.name: r.quantity for r in conflict["resources"]}
        total_needs = {}
        
        for agent in agents:
            for resource, quantity in agent.resources_needed.items():
                total_needs[resource] = total_needs.get(resource, 0) + quantity
        
        # Create balanced proposal
        allocation = {}
        for agent in agents:
            allocation[agent.role] = {}
            for resource, needed in agent.resources_needed.items():
                available = total_available.get(resource, 0)
                if total_needs.get(resource, 0) > 0:
                    # Proportional with minimum guarantee
                    ratio = needed / total_needs[resource]
                    base_allocation = int(available * ratio * 0.8)
                    min_allocation = int(needed * 0.5)
                    allocation[agent.role][resource] = \
                        max(base_allocation, min_allocation)
        
        return Proposal(
            proposer="Mediator",
            allocation=allocation,
            justification="Balanced allocation ensuring minimum viable resources for all",
            compromises=["All teams get at least 50% of needs",
                        "Remaining 20% held for urgent requests"]
        )`,
      hints: [
        'Negotiation styles moeten echt verschillend gedrag vertonen',
        'Denk aan win-win scenarios voor collaborative agents',
        'Competitive agents kunnen concessies doen als het moet',
        'Track satisfaction levels om goede proposals te identificeren',
        'Implementeer een fair fallback voor als consensus faalt'
      ]
    }
  ],
  resources: [
    {
      title: 'Multi-Agent Communication Protocols',
      url: 'https://www.agents.dev/communication-patterns',
      type: 'guide'
    },
    {
      title: 'Delegation Patterns in AI Systems',
      url: 'https://arxiv.org/delegation-patterns-ai',
      type: 'research'
    },
    {
      title: 'Building Collaborative AI Teams',
      url: 'https://www.oreilly.com/collaborative-ai-teams',
      type: 'book'
    }
  ]
}