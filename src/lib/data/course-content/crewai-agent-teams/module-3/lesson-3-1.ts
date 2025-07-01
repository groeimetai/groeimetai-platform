import { Lesson } from '@/lib/data/courses';

export const lesson31: Lesson = {
  id: 'lesson-3-1',
  title: 'Building Complex Crews',
  duration: '90 min',
  hasApiPlayground: true,
  apiEndpoints: [
    {
      method: 'POST',
      endpoint: '/api/crewai/complex-crew',
      description: 'Deploy complex hierarchical crew structure',
      requestBody: {
        organization: 'string',
        structure: 'hierarchical | matrix | network',
        agents: 'Agent[]',
        consensusRequired: 'boolean'
      }
    },
    {
      method: 'POST',
      endpoint: '/api/crewai/inter-agent-comm',
      description: 'Configure inter-agent communication channels',
      requestBody: {
        communicationType: 'broadcast | direct | hierarchical',
        agents: 'string[]',
        message: 'string'
      }
    }
  ],
  content: `
# Building Complex Crews with CrewAI

Learn how to architect sophisticated multi-agent systems with hierarchical structures, specialized roles, advanced communication patterns, and consensus mechanisms for enterprise applications.

## 🏗️ Hierarchical Crew Structure

### Foundation: Dutch Banking System Example

\`\`\`python
from crewai import Agent, Task, Crew, Process
from typing import List, Dict, Any, Optional
from datetime import datetime
import json
import logging

class DutchBankingHierarchy:
    """Complex hierarchical structure for ABN AMRO operations"""
    
    def __init__(self, bank_name: str = "ABN AMRO"):
        self.bank_name = bank_name
        self.hierarchy_levels = {
            'executive': 1,
            'director': 2,
            'manager': 3,
            'specialist': 4
        }
        
    def build_hierarchy(self) -> Dict[str, Agent]:
        """Build complete banking hierarchy with clear reporting lines"""
        
        # Level 1: Executive
        ceo = Agent(
            role="Chief Executive Officer",
            goal="Strategic leadership and regulatory compliance",
            backstory=f"""CEO of {self.bank_name} Nederland.
            Reports to Board and ECB. 20+ years banking experience.
            Focus on digital transformation and sustainability.""",
            verbose=True,
            allow_delegation=True,
            max_iter=5,
            llm="gpt-4-turbo-preview"
        )
        
        # Level 2: Directors
        directors = self._create_director_level()
        
        # Level 3: Department Managers
        managers = self._create_manager_level()
        
        # Level 4: Specialists
        specialists = self._create_specialist_level()
        
        # Establish reporting relationships
        hierarchy = {
            'ceo': ceo,
            **directors,
            **managers,
            **specialists
        }
        
        # Configure delegation chains
        self._configure_delegation_chains(hierarchy)
        
        return hierarchy
    
    def _create_director_level(self) -> Dict[str, Agent]:
        """Create director-level agents"""
        
        risk_director = Agent(
            role="Director Risk & Compliance",
            goal="Ensure full DNB and ECB regulatory compliance",
            backstory="""Expert in Basel III/IV, CRD V, and Dutch banking law.
            Direct contact with DNB supervisors. Oversees all risk frameworks.
            Reports directly to CEO and Board Risk Committee.""",
            verbose=True,
            allow_delegation=True,
            tools=["risk_dashboard", "compliance_scanner", "dnb_reporter"]
        )
        
        digital_director = Agent(
            role="Director Digital Banking",
            goal="Lead digital transformation and innovation",
            backstory="""Former fintech founder. Expert in PSD2, Open Banking.
            Manages digital channels serving 8M+ customers.
            Focus on mobile-first strategy and AI implementation.""",
            verbose=True,
            allow_delegation=True,
            tools=["analytics_platform", "ab_testing", "customer_insights"]
        )
        
        operations_director = Agent(
            role="Director Operations & IT",
            goal="Ensure 24/7 banking operations and security",
            backstory="""IT veteran with focus on resilience and security.
            Manages core banking systems and payment infrastructure.
            Zero-downtime mandate for critical systems.""",
            verbose=True,
            allow_delegation=True,
            tools=["monitoring_suite", "incident_manager", "capacity_planner"]
        )
        
        return {
            'risk_director': risk_director,
            'digital_director': digital_director,
            'operations_director': operations_director
        }
    
    def _create_manager_level(self) -> Dict[str, Agent]:
        """Create department managers"""
        
        # Under Risk Director
        aml_manager = Agent(
            role="AML/KYC Manager",
            goal="Prevent money laundering and ensure KYC compliance",
            backstory="""Certified anti-money laundering specialist.
            Manages team of 50+ analysts. Direct reporting to AMLC.
            Implements AI-based transaction monitoring.""",
            verbose=True,
            allow_delegation=True,
            tools=["transaction_monitor", "sanctions_checker", "kyc_system"]
        )
        
        # Under Digital Director  
        product_manager = Agent(
            role="Digital Product Manager",
            goal="Develop innovative banking products",
            backstory="""Product expert with fintech background.
            Launched award-winning mobile banking app.
            Focus on Gen-Z and millennial segments.""",
            verbose=True,
            allow_delegation=True,
            tools=["user_research", "feature_flags", "analytics"]
        )
        
        # Under Operations Director
        security_manager = Agent(
            role="Cybersecurity Manager",
            goal="Protect bank and customer assets from cyber threats",
            backstory="""CISSP certified security expert.
            Manages SOC and incident response team.
            Zero tolerance for security breaches.""",
            verbose=True,
            allow_delegation=True,
            tools=["siem", "vulnerability_scanner", "threat_intel"]
        )
        
        return {
            'aml_manager': aml_manager,
            'product_manager': product_manager,
            'security_manager': security_manager
        }
    
    def _create_specialist_level(self) -> Dict[str, Agent]:
        """Create specialist agents"""
        
        # Payment specialists
        ideal_specialist = Agent(
            role="iDEAL Payment Specialist",
            goal="Optimize iDEAL payment processing",
            backstory="""Expert in Dutch payment systems.
            Manages 500M+ iDEAL transactions annually.
            99.95% uptime requirement.""",
            verbose=True,
            allow_delegation=False,
            tools=["ideal_api", "payment_router", "settlement_engine"]
        )
        
        # Risk specialists
        model_validator = Agent(
            role="Risk Model Validator",
            goal="Validate and improve risk models",
            backstory="""PhD in quantitative finance.
            Specializes in credit risk and IFRS9 models.
            Independent model validation mandate.""",
            verbose=True,
            allow_delegation=False,
            tools=["model_validator", "backtesting_suite", "stress_tester"]
        )
        
        return {
            'ideal_specialist': ideal_specialist,
            'model_validator': model_validator
        }
    
    def _configure_delegation_chains(self, hierarchy: Dict[str, Agent]):
        """Set up proper delegation chains"""
        
        # CEO can delegate to all directors
        hierarchy['ceo'].subordinates = [
            hierarchy['risk_director'],
            hierarchy['digital_director'],
            hierarchy['operations_director']
        ]
        
        # Directors can delegate to their managers
        hierarchy['risk_director'].subordinates = [hierarchy['aml_manager']]
        hierarchy['digital_director'].subordinates = [hierarchy['product_manager']]
        hierarchy['operations_director'].subordinates = [hierarchy['security_manager']]
        
        # Managers can delegate to specialists
        hierarchy['aml_manager'].subordinates = [hierarchy['model_validator']]
        hierarchy['product_manager'].subordinates = [hierarchy['ideal_specialist']]

# Initialize banking hierarchy
banking_hierarchy = DutchBankingHierarchy()
agents_dict = banking_hierarchy.build_hierarchy()

# Create hierarchical crew
banking_crew = Crew(
    agents=list(agents_dict.values()),
    tasks=[],  # Tasks added dynamically
    process=Process.hierarchical,
    manager_llm="gpt-4-turbo-preview",
    memory=True,
    cache=True,
    max_rpm=100,
    share_crew=True
)
\`\`\`

## 🎯 Role Specialization Patterns

### Advanced Role Design for Complex Organizations

\`\`\`python
class RoleSpecializationFramework:
    """Framework for creating specialized agent roles"""
    
    def __init__(self):
        self.specializations = {
            'technical': ['architect', 'developer', 'tester', 'devops'],
            'business': ['analyst', 'product_owner', 'consultant'],
            'compliance': ['legal', 'risk', 'audit', 'privacy'],
            'operations': ['support', 'monitoring', 'incident']
        }
        
    def create_specialized_agent(self, 
                               specialty: str,
                               domain: str,
                               seniority: str = 'senior') -> Agent:
        """Create agent with deep specialization"""
        
        # Build role definition
        role_components = {
            'junior': {
                'experience': '2-5 years',
                'delegation': False,
                'max_iter': 3
            },
            'senior': {
                'experience': '5-10 years', 
                'delegation': True,
                'max_iter': 5
            },
            'principal': {
                'experience': '10+ years',
                'delegation': True,
                'max_iter': 10
            }
        }
        
        config = role_components[seniority]
        
        # Domain-specific backstory
        backstories = {
            'payments': f"""Payments expert with {config['experience']} experience.
                Specialized in European payment systems and PSD2.
                Deep knowledge of SEPA, iDEAL, and instant payments.""",
            'security': f"""Security professional with {config['experience']} experience.
                Certified in ISO27001 and Dutch cybersecurity frameworks.
                Focus on zero-trust architecture and threat prevention.""",
            'data': f"""Data specialist with {config['experience']} experience.
                Expert in GDPR/AVG compliance and data governance.
                Advanced skills in ML/AI for banking applications."""
        }
        
        # Create specialized agent
        agent = Agent(
            role=f"{seniority.capitalize()} {specialty} - {domain}",
            goal=f"Excel in {domain} {specialty} responsibilities",
            backstory=backstories.get(domain, f"{specialty} expert in {domain}"),
            verbose=True,
            allow_delegation=config['delegation'],
            max_iter=config['max_iter'],
            tools=self._get_specialized_tools(specialty, domain)
        )
        
        return agent
    
    def _get_specialized_tools(self, specialty: str, domain: str) -> List[str]:
        """Get tools based on specialization"""
        
        tool_matrix = {
            ('architect', 'payments'): ['payment_flow_designer', 'api_modeler', 'sequence_diagram'],
            ('developer', 'payments'): ['ideal_sdk', 'payment_gateway', 'testing_framework'],
            ('analyst', 'security'): ['threat_modeler', 'risk_scorer', 'vulnerability_db'],
            ('consultant', 'data'): ['privacy_assessor', 'data_mapper', 'compliance_checker']
        }
        
        return tool_matrix.get((specialty, domain), ['general_tool'])

# Create specialized teams
specialization_framework = RoleSpecializationFramework()

# Payment team with different seniority levels
payment_team = [
    specialization_framework.create_specialized_agent('architect', 'payments', 'principal'),
    specialization_framework.create_specialized_agent('developer', 'payments', 'senior'),
    specialization_framework.create_specialized_agent('developer', 'payments', 'junior'),
    specialization_framework.create_specialized_agent('analyst', 'payments', 'senior')
]
\`\`\`

## 💬 Inter-Agent Communication

### Advanced Communication Patterns

\`\`\`python
class InterAgentCommunicationSystem:
    """Sophisticated communication system for agent crews"""
    
    def __init__(self, crew: Crew):
        self.crew = crew
        self.message_queue = []
        self.communication_log = []
        
    def setup_communication_channels(self):
        """Initialize communication infrastructure"""
        
        # Create communication graph
        self.comm_graph = self._build_communication_graph()
        
        # Set up message handlers
        for agent in self.crew.agents:
            agent.message_handler = self._create_message_handler(agent)
            
    def broadcast_message(self, sender: Agent, message: Dict[str, Any], 
                         priority: str = 'normal'):
        """Broadcast message to all agents"""
        
        broadcast_msg = {
            'type': 'broadcast',
            'sender': sender.role,
            'content': message,
            'timestamp': datetime.now(),
            'priority': priority
        }
        
        for agent in self.crew.agents:
            if agent != sender:
                agent.receive_message(broadcast_msg)
                
        self.communication_log.append(broadcast_msg)
        
    def hierarchical_cascade(self, initiator: Agent, message: Dict[str, Any]):
        """Cascade message through hierarchy"""
        
        # Find initiator's level
        level = self._get_hierarchy_level(initiator)
        
        # Cascade down the hierarchy
        for agent in self.crew.agents:
            agent_level = self._get_hierarchy_level(agent)
            if agent_level > level:  # Lower in hierarchy
                cascaded_msg = {
                    'type': 'cascade',
                    'original_sender': initiator.role,
                    'content': message,
                    'cascade_level': agent_level
                }
                agent.receive_message(cascaded_msg)
                
    def direct_communication(self, sender: Agent, receiver: Agent, 
                           message: Dict[str, Any], require_ack: bool = False):
        """Direct agent-to-agent communication"""
        
        direct_msg = {
            'type': 'direct',
            'sender': sender.role,
            'receiver': receiver.role,
            'content': message,
            'require_ack': require_ack,
            'timestamp': datetime.now()
        }
        
        # Send message
        response = receiver.receive_message(direct_msg)
        
        # Handle acknowledgment
        if require_ack:
            ack = {
                'type': 'acknowledgment',
                'original_message': direct_msg,
                'response': response,
                'acknowledged_at': datetime.now()
            }
            sender.receive_message(ack)
            
        self.communication_log.append(direct_msg)
        
    def setup_dutch_consensus_protocol(self):
        """Implement Dutch 'polder model' consensus building"""
        
        class ConsensusProtocol:
            def __init__(self, participants: List[Agent]):
                self.participants = participants
                self.consensus_threshold = 0.8  # 80% agreement needed
                
            def seek_consensus(self, proposal: Dict[str, Any]) -> Dict[str, Any]:
                """Run consensus protocol"""
                
                votes = {}
                discussions = []
                
                # Round 1: Initial positions
                for agent in self.participants:
                    initial_position = agent.evaluate_proposal(proposal)
                    votes[agent.role] = initial_position
                    
                consensus_reached = False
                rounds = 0
                
                # Discussion rounds
                while not consensus_reached and rounds < 5:
                    # Share positions
                    for agent in self.participants:
                        others_positions = {k: v for k, v in votes.items() 
                                          if k != agent.role}
                        
                        # Reconsider based on others' input
                        new_position = agent.reconsider_proposal(
                            proposal, 
                            others_positions
                        )
                        votes[agent.role] = new_position
                        
                    # Check consensus
                    agreement_count = sum(1 for v in votes.values() if v['support'])
                    consensus_reached = agreement_count / len(votes) >= self.consensus_threshold
                    
                    discussions.append({
                        'round': rounds + 1,
                        'votes': votes.copy(),
                        'consensus': consensus_reached
                    })
                    rounds += 1
                    
                return {
                    'consensus_reached': consensus_reached,
                    'final_votes': votes,
                    'discussion_history': discussions,
                    'rounds_needed': rounds
                }
                
        return ConsensusProtocol
\`\`\`

## 🏢 Dutch Enterprise Example: Port of Rotterdam

### Complex Logistics Coordination Crew

\`\`\`python
class PortOfRotterdamCrew:
    """Multi-agent system for Europe's largest port"""
    
    def __init__(self):
        self.port_stats = {
            'annual_teu': 14.5e6,  # TEU containers
            'vessels_per_year': 30000,
            'rail_connections': 150,
            'employees': 180000
        }
        
    def create_port_management_crew(self) -> Crew:
        """Create comprehensive port management system"""
        
        # Harbor Master - Top of hierarchy
        harbor_master = Agent(
            role="Harbor Master Rotterdam",
            goal="Ensure safe and efficient port operations 24/7",
            backstory="""Senior maritime professional with 25+ years.
            Authority over all vessel movements in port.
            Direct line to Mayor and Transport Ministry.""",
            verbose=True,
            allow_delegation=True,
            max_iter=10,
            tools=["vessel_tracker", "weather_system", "emergency_protocol"]
        )
        
        # Specialized departments
        departments = {
            'nautical': self._create_nautical_department(),
            'logistics': self._create_logistics_department(),
            'customs': self._create_customs_department(),
            'sustainability': self._create_sustainability_department()
        }
        
        # Create integrated crew
        all_agents = [harbor_master]
        for dept_agents in departments.values():
            all_agents.extend(dept_agents)
            
        # Configure matrix organization
        crew = Crew(
            agents=all_agents,
            tasks=[],
            process=Process.hierarchical,
            manager_llm="gpt-4-turbo-preview",
            memory=True,
            cache=True,
            max_rpm=200,
            share_crew=True
        )
        
        # Set up communication system
        comm_system = InterAgentCommunicationSystem(crew)
        comm_system.setup_communication_channels()
        
        return crew
    
    def _create_nautical_department(self) -> List[Agent]:
        """Nautical operations agents"""
        
        pilot_coordinator = Agent(
            role="Pilot Coordination Manager",
            goal="Coordinate harbor pilots for safe vessel navigation",
            backstory="""Former ship captain with deep knowledge of Nieuwe Waterweg.
            Manages 300+ pilots. Coordinates with Vessel Traffic Management.""",
            verbose=True,
            allow_delegation=True,
            tools=["pilot_roster", "vessel_scheduler", "tide_calculator"]
        )
        
        vts_operator = Agent(
            role="Vessel Traffic Service Operator",
            goal="Monitor and direct all vessel movements",
            backstory="""Certified VTS operator for Rotterdam-Rijnmond area.
            Monitors radar and AIS 24/7. Prevents collisions and incidents.""",
            verbose=True,
            allow_delegation=False,
            tools=["radar_system", "ais_tracker", "vhf_radio", "incident_logger"]
        )
        
        return [pilot_coordinator, vts_operator]
    
    def _create_logistics_department(self) -> List[Agent]:
        """Container and cargo logistics"""
        
        terminal_planner = Agent(
            role="Terminal Planning Specialist",
            goal="Optimize container terminal operations",
            backstory="""Industrial engineer specializing in port logistics.
            Manages Maasvlakte I & II automated terminals.
            Focus on 30% efficiency improvement by 2030.""",
            verbose=True,
            allow_delegation=True,
            tools=["terminal_optimizer", "crane_scheduler", "yard_planner"]
        )
        
        rail_coordinator = Agent(
            role="Rail Logistics Coordinator",
            goal="Maximize rail transport share to 20%",
            backstory="""Intermodal transport expert.
            Coordinates with ProRail and European rail operators.
            Manages Betuweroute capacity.""",
            verbose=True,
            allow_delegation=False,
            tools=["rail_scheduler", "betuweroute_system", "intermodal_planner"]
        )
        
        return [terminal_planner, rail_coordinator]
    
    def handle_vessel_arrival(self, vessel_data: Dict[str, Any]) -> Dict[str, Any]:
        """Complex workflow for vessel arrival"""
        
        tasks = []
        
        # Pre-arrival planning
        pre_arrival_task = Task(
            description=f"""
            Plan arrival for vessel: {vessel_data['name']}
            - Type: {vessel_data['type']}
            - Length: {vessel_data['length']}m
            - Draft: {vessel_data['draft']}m
            - Cargo: {vessel_data['cargo_type']}
            
            Requirements:
            1. Check berth availability at {vessel_data['terminal']}
            2. Verify tide windows for deep draft
            3. Assign qualified pilot
            4. Coordinate with tugboats
            5. Notify customs if non-EU origin
            """,
            expected_output="Complete arrival plan with timeline",
            agent=pilot_coordinator
        )
        
        # Customs clearance (if needed)
        if vessel_data.get('origin_country') not in EU_COUNTRIES:
            customs_task = Task(
                description=f"""
                Prepare customs clearance for {vessel_data['name']}:
                - Origin: {vessel_data['origin_country']}
                - Manifest review
                - Risk assessment
                - Document verification
                - Coordination with NVWA if agricultural products
                """,
                expected_output="Customs clearance status and requirements",
                agent=customs_officer,
                context=[pre_arrival_task]
            )
            tasks.append(customs_task)
            
        # Terminal operations
        terminal_task = Task(
            description=f"""
            Prepare terminal for vessel operations:
            - Allocate {vessel_data['container_count']} TEU capacity
            - Schedule {vessel_data['crane_moves']} crane movements
            - Plan yard positions
            - Coordinate inland connections
            """,
            expected_output="Terminal operation plan",
            agent=terminal_planner,
            context=[pre_arrival_task]
        )
        
        tasks.extend([pre_arrival_task, terminal_task])
        
        # Execute with consensus for large vessels
        if vessel_data['length'] > 300:  # Large vessel requiring consensus
            consensus_protocol = ConsensusProtocol([
                harbor_master,
                pilot_coordinator,
                terminal_planner
            ])
            
            consensus_result = consensus_protocol.seek_consensus({
                'vessel': vessel_data,
                'proposed_berth': vessel_data['terminal'],
                'arrival_time': vessel_data['eta']
            })
            
            if consensus_result['consensus_reached']:
                result = crew.kickoff(tasks)
            else:
                # Escalation procedure
                result = self._escalate_to_harbor_master(vessel_data, consensus_result)
                
        else:
            result = crew.kickoff(tasks)
            
        return result
\`\`\`

## 🤝 Consensus Mechanisms

### Dutch Polder Model Implementation

\`\`\`python
class DutchConsensusFramework:
    """Implement Dutch consensus-building approach in AI crews"""
    
    def __init__(self, cultural_weight: float = 0.8):
        self.cultural_weight = cultural_weight  # Weight for consensus vs efficiency
        
    def create_polder_model_crew(self, stakeholders: List[Dict[str, Any]]) -> Crew:
        """Create crew that operates on consensus principles"""
        
        agents = []
        
        # Create agent for each stakeholder
        for stakeholder in stakeholders:
            agent = Agent(
                role=stakeholder['role'],
                goal=stakeholder['goal'],
                backstory=f"""Representing {stakeholder['organization']}.
                Committed to finding mutual beneficial solutions.
                Values: {', '.join(stakeholder['values'])}""",
                verbose=True,
                allow_delegation=False,  # Equal participation
                consensus_weight=stakeholder.get('weight', 1.0)
            )
            agents.append(agent)
            
        # Special consensus facilitator
        facilitator = Agent(
            role="Consensus Facilitator",
            goal="Guide group to mutually acceptable decisions",
            backstory="""Expert in Dutch polder model facilitation.
            Neutral mediator focused on win-win outcomes.
            Ensures all voices are heard equally.""",
            verbose=True,
            allow_delegation=True,
            tools=["voting_system", "discussion_tracker", "compromise_finder"]
        )
        
        agents.append(facilitator)
        
        # Create consensus-based crew
        consensus_crew = Crew(
            agents=agents,
            tasks=[],
            process=Process.sequential,  # Equal turns for input
            manager_llm="gpt-4-turbo-preview",
            memory=True,
            consensus_mode=True,  # Special consensus mode
            consensus_threshold=0.75  # 75% agreement needed
        )
        
        return consensus_crew
    
    def run_consensus_decision(self, crew: Crew, decision: Dict[str, Any]) -> Dict[str, Any]:
        """Execute consensus decision-making process"""
        
        rounds = []
        consensus_reached = False
        
        # Phase 1: Information sharing
        info_task = Task(
            description=f"""
            Share perspectives on: {decision['topic']}
            Each stakeholder should provide:
            1. Their organization's position
            2. Key concerns
            3. Potential compromises
            4. Red lines (non-negotiables)
            """,
            expected_output="Stakeholder position papers",
            agent=facilitator
        )
        
        # Phase 2: Find common ground
        common_ground_task = Task(
            description="""
            Identify shared interests and values:
            1. Common goals
            2. Shared concerns
            3. Mutual benefits
            4. Areas of flexibility
            """,
            expected_output="Common ground analysis",
            agent=facilitator,
            context=[info_task]
        )
        
        # Phase 3: Build compromise
        compromise_task = Task(
            description="""
            Develop compromise proposal that:
            1. Addresses major concerns of all parties
            2. Provides benefits to each stakeholder
            3. Respects red lines
            4. Is practically implementable
            """,
            expected_output="Compromise proposal with implementation plan",
            agent=facilitator,
            context=[info_task, common_ground_task]
        )
        
        # Execute consensus process
        result = crew.kickoff([info_task, common_ground_task, compromise_task])
        
        # Voting round
        votes = {}
        for agent in crew.agents:
            if agent.role != "Consensus Facilitator":
                vote = agent.vote_on_proposal(result['compromise_proposal'])
                votes[agent.role] = vote
                
        # Calculate consensus
        support_rate = sum(v['support'] for v in votes.values()) / len(votes)
        consensus_reached = support_rate >= crew.consensus_threshold
        
        return {
            'consensus_reached': consensus_reached,
            'support_rate': support_rate,
            'votes': votes,
            'final_proposal': result['compromise_proposal'],
            'implementation_plan': result.get('implementation_plan')
        }
\`\`\`

## 🎯 Complete Implementation Example

### Dutch Healthcare System Integration

\`\`\`python
# Full implementation combining all concepts
class DutchHealthcareIntegrationCrew:
    """Complex crew for healthcare system integration"""
    
    def __init__(self):
        self.systems = ['HiX', 'Epic', 'ChipSoft', 'Nexus']
        self.regulations = ['NEN7510', 'AVG/GDPR', 'Wgbo', 'BIG']
        
    def build_integration_crew(self) -> Crew:
        """Build complete healthcare integration crew"""
        
        # Create hierarchical structure
        hierarchy = {
            'cio': self._create_healthcare_cio(),
            'managers': self._create_department_managers(),
            'specialists': self._create_technical_specialists()
        }
        
        # Add consensus mechanism for patient data decisions
        ethics_committee = self._create_ethics_committee()
        
        # Combine all agents
        all_agents = [hierarchy['cio']]
        all_agents.extend(hierarchy['managers'])
        all_agents.extend(hierarchy['specialists'])
        all_agents.extend(ethics_committee)
        
        # Create crew with mixed process
        healthcare_crew = Crew(
            agents=all_agents,
            tasks=[],
            process=Process.hierarchical,
            manager_llm="gpt-4-turbo-preview",
            memory=True,
            cache=True,
            consensus_required_for=['patient_data', 'privacy_decisions']
        )
        
        # Set up communication
        comm_system = InterAgentCommunicationSystem(healthcare_crew)
        comm_system.setup_communication_channels()
        comm_system.setup_dutch_consensus_protocol()
        
        return healthcare_crew

# Deploy the complete system
healthcare_crew = DutchHealthcareIntegrationCrew()
crew = healthcare_crew.build_integration_crew()

# Execute complex healthcare integration
integration_result = crew.kickoff()
print(f"Integration completed: {integration_result}")
\`\`\`

## 🏆 Best Practices

### 1. **Hierarchy Design**
- Match organizational structure
- Clear delegation paths
- Appropriate span of control
- Emergency escalation procedures

### 2. **Role Specialization**
- Deep domain expertise
- Clear responsibilities
- Avoid role overlap
- Tool specialization

### 3. **Communication Patterns**
- Choose appropriate channels
- Log all communications
- Implement acknowledgments
- Handle communication failures

### 4. **Consensus Building**
- Define clear thresholds
- Time-box discussions
- Document decisions
- Implement vetoes carefully

### 5. **Performance Optimization**
- Cache frequent decisions
- Parallelize where possible
- Monitor token usage
- Implement circuit breakers

## 💡 Key Takeaways

1. **Structure Mirrors Organization**: Design crews that reflect real organizational hierarchies
2. **Specialization Drives Efficiency**: Deep expertise in agents improves outcomes
3. **Communication is Critical**: Well-designed communication prevents bottlenecks
4. **Consensus Has Its Place**: Use consensus for high-stakes decisions
5. **Monitor and Iterate**: Continuously improve based on performance metrics

Ready to build sophisticated multi-agent systems!
  `,
  assignments: [
    {
      id: 'assignment-3-1',
      title: 'Design Rotterdam Port Authority Crew',
      description: 'Create a hierarchical CrewAI system for Rotterdam Port Authority. Include vessel traffic management, customs coordination, terminal operations, and environmental compliance. Implement consensus mechanism for berth allocation during peak times.',
      difficulty: 'expert',
      type: 'project',
      hints: [
        'Use hierarchical structure with Harbor Master at top',
        'Include specialized agents for pilots, customs, terminals',
        'Implement communication for vessel arrivals',
        'Add consensus protocol for conflicting berth requests'
      ]
    },
    {
      id: 'assignment-3-2',
      title: 'Build ASML Supply Chain Crew',
      description: 'Design a matrix organization crew for ASML supply chain management. Handle component sourcing (Zeiss optics, Cymer lasers), production planning, quality control, and customer delivery coordination with consensus-based decision making.',
      difficulty: 'hard',
      type: 'implementation',
      hints: [
        'Matrix structure with functional and project teams',
        'Specialized agents for critical components',
        'Inter-agent communication for supply updates',
        'Consensus required for allocation decisions'
      ]
    }
  ],
  resources: [
    {
      title: 'CrewAI Hierarchical Processes',
      url: 'https://docs.crewai.com/core-concepts/Processes/#hierarchical-process',
      type: 'documentation'
    },
    {
      title: 'Agent Communication Patterns',
      url: 'https://crewai.com/blog/agent-communication',
      type: 'article'
    },
    {
      title: 'Building Enterprise Crews',
      url: 'https://github.com/crewai/enterprise-examples',
      type: 'github'
    }
  ]
};