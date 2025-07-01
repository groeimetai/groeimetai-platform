import { Lesson } from '@/lib/data/courses'

export const lesson2_2: Lesson = {
  id: 'lesson-2-2',
  title: 'Expertise domains: Specialisatie strategieën',
  duration: '40 min',
  content: `
# Expertise Domains: Specialisatie Strategieën

Het creëren van gespecialiseerde agents is de sleutel tot effectieve AI teams. In deze les leren we hoe je expertise domains definieert en agents traint voor diepe specialisatie.

## Het Belang van Specialisatie

### Waarom Specialiseren?
- **Diepere expertise**: Gefocuste agents leveren betere resultaten
- **Efficiëntere processing**: Minder context switching
- **Betere samenwerking**: Duidelijke verantwoordelijkheden
- **Schaalbaarheid**: Makkelijk nieuwe specialisten toevoegen

### Generalist vs Specialist Trade-offs

| Aspect | Generalist | Specialist |
|--------|------------|------------|
| Breedte | Breed kennisgebied | Smal maar diep |
| Flexibiliteit | Zeer flexibel | Beperkt tot domein |
| Kwaliteit | Goede algemene output | Excellente domein output |
| Training | Simpeler | Complexer maar waardevol |
| Use Case | Coordinatie, overview | Expertise taken |

## Expertise Domain Architectuur

### Level 1: Brede Domeinen
De hoofdcategorieën:
- **Technical**: Development, DevOps, Security
- **Business**: Strategy, Marketing, Sales  
- **Creative**: Design, Content, UX
- **Analytical**: Data, Research, Optimization

### Level 2: Specialisaties
Specifieke expertisegebieden:
- Technical → Backend → Microservices → Kubernetes
- Business → Marketing → Digital → SEO
- Creative → Design → UI → Mobile Design
- Analytical → Data → ML → NLP

### Level 3: Niche Expertise
Ultra-gespecialiseerde kennis:
- Kubernetes → Istio Service Mesh
- SEO → Core Web Vitals Optimization
- Mobile Design → iOS Human Interface Guidelines
- NLP → Transformer Architecture Tuning

## Specialisatie Strategieën

### 1. Domain-Driven Design
Structureer agents volgens business domains:
- **Bounded Contexts**: Duidelijke grenzen
- **Ubiquitous Language**: Domein-specifieke terminologie
- **Domain Events**: Communicatie tussen domains

### 2. Skill-Based Specialization
Focus op specifieke vaardigheden:
- **Technical Skills**: Programmeertalen, frameworks
- **Soft Skills**: Communicatie, leiderschap
- **Tool Mastery**: Specifieke software/platforms

### 3. Industry Specialization
Expertise in specifieke industrieën:
- **Regulations**: Industry-specifieke compliance
- **Best Practices**: Sector standaarden
- **Terminology**: Vakjargon en concepten

### 4. Problem-Type Specialization
Experts voor specifieke probleemtypes:
- **Debugging**: Foutanalyse en oplossingen
- **Optimization**: Performance verbetering
- **Architecture**: Systeem design
- **Integration**: API's en connectivity

## Building Domain Expertise

### Knowledge Base Construction
1. **Domain Documentation**: Verzamel relevante docs
2. **Best Practices**: Industry standards
3. **Case Studies**: Real-world voorbeelden
4. **Expert Interviews**: Insights van professionals

### Training Strategies
1. **Fine-tuning**: Domain-specifieke training data
2. **Prompt Engineering**: Expertise-gerichte prompts
3. **Knowledge Injection**: RAG met domain docs
4. **Feedback Loops**: Continuous improvement

### Validation Methods
- **Domain Expert Review**: Menselijke validatie
- **Benchmark Tests**: Standaard evaluaties
- **A/B Testing**: Vergelijk met generalisten
- **Real-world Performance**: Production metrics

## Multi-Domain Coordination

### The T-Shaped Agent Model
- **Vertical Bar**: Diepe expertise in één domein
- **Horizontal Bar**: Basis kennis andere domeinen
- **Benefits**: Specialisatie + communicatie vermogen

### Cross-Domain Communication
Strategieën voor effectieve samenwerking:
1. **Common Interface**: Gestandaardiseerde communicatie
2. **Translation Layer**: Domain-specifieke vertalingen
3. **Orchestrator Pattern**: Centrale coordinatie
4. **Mesh Pattern**: Direct peer-to-peer

## Expertise Evolution

### Continuous Learning
- **New Information**: Bijhouden van ontwikkelingen
- **Feedback Integration**: Leren van fouten
- **Peer Learning**: Kennis delen tussen agents
- **Version Control**: Track expertise updates

### Expertise Decay Prevention
- **Regular Updates**: Scheduled retraining
- **Knowledge Validation**: Periodieke checks
- **Redundancy**: Multiple experts per domain
- **Documentation**: Vastleggen van learnings

## Common Specialization Patterns

### The Consultant Pattern
- Deep expertise, advisory role
- High-level recommendations
- Strategic thinking

### The Implementer Pattern
- Hands-on expertise
- Practical solutions
- Execution focused

### The Reviewer Pattern
- Quality assurance expertise
- Critical analysis
- Standards enforcement

### The Innovator Pattern
- Cutting-edge knowledge
- Experimental approaches
- Future-focused

## Measuring Expertise Effectiveness

### Key Metrics
1. **Accuracy**: Correctheid van domain output
2. **Depth**: Complexiteit van oplossingen
3. **Speed**: Time to solution
4. **Consistency**: Betrouwbaarheid

### ROI van Specialisatie
- **Quality Improvement**: Betere output
- **Time Savings**: Snellere oplossingen
- **Error Reduction**: Minder fouten
- **Innovation**: Nieuwe mogelijkheden
`,
  codeExamples: [
    {
      id: 'example-1',
      title: 'Domain-Specific Agent Configuration',
      language: 'python',
      code: `from crewai import Agent
from langchain.chat_models import ChatOpenAI
from langchain.tools import Tool
from typing import List, Dict

class DomainSpecialist(Agent):
    """Enhanced Agent class voor domain specialisatie"""
    
    def __init__(self, domain_config: Dict, **kwargs):
        # Extract domain-specific configuration
        self.domain = domain_config["domain"]
        self.expertise_level = domain_config["expertise_level"]
        self.specializations = domain_config["specializations"]
        self.domain_tools = domain_config.get("tools", [])
        
        # Build enhanced backstory with domain expertise
        enhanced_backstory = self._build_domain_backstory(
            kwargs.get("backstory", ""),
            domain_config
        )
        
        # Initialize parent with enhanced config
        super().__init__(
            backstory=enhanced_backstory,
            tools=self._setup_domain_tools(),
            **kwargs
        )
    
    def _build_domain_backstory(self, base_backstory: str, domain_config: Dict) -> str:
        """Enhance backstory met domain expertise"""
        expertise_addon = f"""
        
        Domain Expertise:
        - Primary Domain: {domain_config['domain']}
        - Expertise Level: {domain_config['expertise_level']}
        - Specializations: {', '.join(domain_config['specializations'])}
        - Years of Experience: {domain_config.get('years_experience', 10)}
        
        You stay current with the latest developments in {domain_config['domain']} and 
        apply best practices from {', '.join(domain_config['specializations'])}.
        """
        
        return base_backstory + expertise_addon
    
    def _setup_domain_tools(self) -> List[Tool]:
        """Setup domain-specific tools"""
        tools = []
        
        # Add domain-specific tools based on expertise
        if "kubernetes" in self.specializations:
            tools.append(self._create_k8s_tool())
        
        if "security" in self.specializations:
            tools.append(self._create_security_scan_tool())
            
        if "data_analysis" in self.specializations:
            tools.append(self._create_data_analysis_tool())
        
        return tools + self.domain_tools

# Voorbeeld: Security Specialist
security_domain_config = {
    "domain": "Cybersecurity",
    "expertise_level": "Senior",
    "specializations": ["penetration_testing", "security_architecture", "compliance"],
    "years_experience": 12,
    "certifications": ["CISSP", "CEH", "AWS Security"],
    "tools": []  # Security-specific tools
}

security_specialist = DomainSpecialist(
    domain_config=security_domain_config,
    role="Senior Security Architect",
    goal="Identify and mitigate security vulnerabilities while ensuring compliance",
    backstory="""You are Elena Volkov, a security architect who started as an ethical hacker. 
    After discovering critical vulnerabilities in major systems, you transitioned to defense, 
    helping organizations build secure-by-design systems.""",
    llm=ChatOpenAI(model="gpt-4", temperature=0.2)  # Low temp for security precision
)

# Voorbeeld: Machine Learning Specialist
ml_domain_config = {
    "domain": "Machine Learning",
    "expertise_level": "Expert",
    "specializations": ["deep_learning", "nlp", "model_optimization"],
    "years_experience": 8,
    "frameworks": ["PyTorch", "TensorFlow", "Hugging Face"],
    "publications": 15
}

ml_specialist = DomainSpecialist(
    domain_config=ml_domain_config,
    role="Principal ML Engineer",
    goal="Design and optimize machine learning solutions for production scale",
    backstory="""You are Dr. Yuki Tanaka, a ML engineer with a PhD in deep learning. 
    You've published research on efficient model architectures and now focus on 
    bringing cutting-edge ML to production systems.""",
    llm=ChatOpenAI(model="gpt-4", temperature=0.5)
)`,
      explanation: 'DomainSpecialist class maakt het makkelijk om agents met diepe expertise te creëren door domain-specific configuraties te gebruiken.'
    },
    {
      id: 'example-2',
      title: 'Multi-Level Expertise Hierarchy',
      language: 'python',
      code: `from typing import List, Optional
from crewai import Agent, Task, Crew

class ExpertiseHierarchy:
    """Manage een hiërarchie van expertise levels"""
    
    def __init__(self):
        self.experts = {
            "generalist": [],
            "specialist": [],
            "expert": [],
            "master": []
        }
    
    def add_expert(self, agent: Agent, level: str):
        """Voeg expert toe aan juiste level"""
        if level in self.experts:
            self.experts[level].append(agent)
    
    def find_expert(self, domain: str, min_level: str = "specialist") -> Optional[Agent]:
        """Vind expert voor domain met minimum level"""
        levels = ["master", "expert", "specialist", "generalist"]
        start_idx = levels.index(min_level)
        
        for level in levels[start_idx:]:
            for agent in self.experts[level]:
                if domain in agent.backstory or domain in agent.role:
                    return agent
        return None
    
    def escalate_task(self, task: Task, current_level: str) -> Optional[Agent]:
        """Escaleer task naar hoger expertise level"""
        levels = ["generalist", "specialist", "expert", "master"]
        current_idx = levels.index(current_level)
        
        if current_idx < len(levels) - 1:
            next_level = levels[current_idx + 1]
            if self.experts[next_level]:
                return self.experts[next_level][0]
        return None

# Build expertise hierarchy
hierarchy = ExpertiseHierarchy()

# Generalist Developer
generalist_dev = Agent(
    role="Full-Stack Developer",
    goal="Handle general development tasks across the stack",
    backstory="Broad experience with web development, can work on frontend and backend",
    expertise_indicators={
        "level": "generalist",
        "domains": ["web", "api", "database"],
        "confidence": 0.7
    }
)

# Specialist Frontend Developer  
frontend_specialist = Agent(
    role="React Specialist",
    goal="Build complex React applications with advanced patterns",
    backstory="""Specialized in React ecosystem including Redux, React Query, and Next.js.
    Deep understanding of performance optimization and component architecture.""",
    expertise_indicators={
        "level": "specialist",
        "domains": ["react", "frontend", "performance"],
        "confidence": 0.85
    }
)

# Expert System Architect
system_expert = Agent(
    role="Distributed Systems Expert",
    goal="Design highly scalable distributed architectures",
    backstory="""15 years designing systems at scale for major tech companies.
    Expert in microservices, event-driven architecture, and cloud-native patterns.
    Published author on distributed systems.""",
    expertise_indicators={
        "level": "expert",
        "domains": ["architecture", "distributed_systems", "scalability"],
        "confidence": 0.95
    }
)

# Master Domain Expert
security_master = Agent(
    role="Security Master Architect",
    goal="Define security strategy and architecture for enterprise systems",
    backstory="""20+ years in cybersecurity, former NSA, founded security startup.
    Wrote industry standards for secure architecture. Advised Fortune 500 on security.
    Recognized thought leader in zero-trust architecture.""",
    expertise_indicators={
        "level": "master",
        "domains": ["security", "architecture", "compliance", "zero_trust"],
        "confidence": 0.99
    }
)

# Add to hierarchy
hierarchy.add_expert(generalist_dev, "generalist")
hierarchy.add_expert(frontend_specialist, "specialist")
hierarchy.add_expert(system_expert, "expert")
hierarchy.add_expert(security_master, "master")

# Smart task routing based on complexity
def route_task_by_complexity(task_description: str) -> Agent:
    """Route task naar juiste expertise level"""
    
    complexity_indicators = {
        "simple": ["basic", "simple", "standard", "common"],
        "moderate": ["complex", "advanced", "optimize", "refactor"],
        "complex": ["architecture", "design", "scale", "distribute"],
        "critical": ["security", "compliance", "critical", "vulnerability"]
    }
    
    # Determine complexity
    task_lower = task_description.lower()
    
    if any(word in task_lower for word in complexity_indicators["critical"]):
        return hierarchy.find_expert("security", "master") or security_master
    elif any(word in task_lower for word in complexity_indicators["complex"]):
        return hierarchy.find_expert("architecture", "expert") or system_expert
    elif any(word in task_lower for word in complexity_indicators["moderate"]):
        return hierarchy.find_expert("frontend", "specialist") or frontend_specialist
    else:
        return generalist_dev

# Voorbeeld gebruik
task = Task(
    description="Design secure authentication system for distributed microservices",
    expected_output="Architecture document with security considerations"
)

assigned_expert = route_task_by_complexity(task.description)
print(f"Task assigned to: {assigned_expert.role}")`,
      explanation: 'Een hiërarchisch systeem helpt om taken automatisch naar het juiste expertise niveau te routeren, wat efficiëntie en kwaliteit verhoogt.'
    },
    {
      id: 'example-3',
      title: 'Domain Knowledge Integration',
      language: 'python',
      code: `from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.document_loaders import TextLoader, PDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os

class DomainKnowledgeBase:
    """Beheer domain-specific knowledge voor agents"""
    
    def __init__(self, domain: str):
        self.domain = domain
        self.embeddings = OpenAIEmbeddings()
        self.vector_store = None
        self.documents = []
        
    def load_domain_documents(self, doc_paths: List[str]):
        """Laad domain-specific documenten"""
        
        for path in doc_paths:
            if path.endswith('.txt'):
                loader = TextLoader(path)
            elif path.endswith('.pdf'):
                loader = PDFLoader(path)
            else:
                continue
                
            documents = loader.load()
            
            # Add domain metadata
            for doc in documents:
                doc.metadata["domain"] = self.domain
                doc.metadata["source_type"] = "reference"
            
            self.documents.extend(documents)
        
        # Split documents
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        
        splits = text_splitter.split_documents(self.documents)
        
        # Create vector store
        self.vector_store = Chroma.from_documents(
            documents=splits,
            embedding=self.embeddings,
            collection_name=f"{self.domain}_knowledge"
        )
    
    def query_knowledge(self, query: str, k: int = 5) -> List[str]:
        """Query domain knowledge"""
        if not self.vector_store:
            return []
        
        results = self.vector_store.similarity_search(query, k=k)
        return [doc.page_content for doc in results]

# Specialized Agent met Domain Knowledge
class KnowledgeEnhancedAgent(Agent):
    """Agent met geïntegreerde domain knowledge"""
    
    def __init__(self, knowledge_base: DomainKnowledgeBase, **kwargs):
        self.knowledge_base = knowledge_base
        
        # Enhance prompts met knowledge retrieval
        original_execute = kwargs.get('execute', self.execute)
        kwargs['execute'] = self._knowledge_enhanced_execute
        
        super().__init__(**kwargs)
    
    def _knowledge_enhanced_execute(self, task: Task) -> str:
        """Execute met domain knowledge context"""
        
        # Retrieve relevant knowledge
        relevant_knowledge = self.knowledge_base.query_knowledge(
            task.description,
            k=3
        )
        
        # Enhance task context
        enhanced_context = f"""
        Task: {task.description}
        
        Relevant Domain Knowledge:
        {chr(10).join([f"- {knowledge}" for knowledge in relevant_knowledge])}
        
        Use this domain knowledge to provide accurate, expert-level responses.
        """
        
        # Create enhanced task
        enhanced_task = Task(
            description=enhanced_context,
            expected_output=task.expected_output,
            agent=self
        )
        
        return super().execute(enhanced_task)

# Voorbeeld: Kubernetes Specialist met Knowledge Base
k8s_knowledge = DomainKnowledgeBase("kubernetes")

# Laad Kubernetes documentatie
k8s_knowledge.load_domain_documents([
    "docs/k8s_best_practices.pdf",
    "docs/k8s_security_guide.txt",
    "docs/k8s_networking.pdf"
])

k8s_specialist = KnowledgeEnhancedAgent(
    knowledge_base=k8s_knowledge,
    role="Kubernetes Platform Engineer",
    goal="Design and troubleshoot Kubernetes deployments with best practices",
    backstory="""You are a certified Kubernetes administrator with extensive experience
    in production deployments. You always reference official documentation and 
    industry best practices in your recommendations.""",
    llm=ChatOpenAI(model="gpt-4", temperature=0.3)
)

# Domain-Specific Tool Creation
def create_domain_tools(domain: str) -> List[Tool]:
    """Creëer tools specifiek voor domain"""
    
    tools = []
    
    if domain == "kubernetes":
        tools.extend([
            Tool(
                name="kubectl_helper",
                description="Execute kubectl commands for cluster inspection",
                func=lambda x: f"kubectl {x}"  # Simplified
            ),
            Tool(
                name="helm_chart_analyzer",
                description="Analyze Helm charts for best practices",
                func=lambda x: f"Analyzing Helm chart: {x}"
            )
        ])
    
    elif domain == "security":
        tools.extend([
            Tool(
                name="vulnerability_scanner",
                description="Scan code for security vulnerabilities",
                func=lambda x: f"Scanning for vulnerabilities in: {x}"
            ),
            Tool(
                name="compliance_checker",
                description="Check compliance with security standards",
                func=lambda x: f"Checking compliance for: {x}"
            )
        ])
    
    return tools`,
      explanation: 'Domain knowledge integration via RAG (Retrieval Augmented Generation) geeft agents toegang tot actuele, specifieke expertise.'
    },
    {
      id: 'example-4',
      title: 'Cross-Domain Collaboration Framework',
      language: 'python',
      code: `from typing import Dict, List, Tuple
from crewai import Agent, Task, Crew
import json

class CrossDomainOrchestrator:
    """Orchestreer samenwerking tussen domain specialists"""
    
    def __init__(self):
        self.domain_experts: Dict[str, Agent] = {}
        self.collaboration_patterns = {
            "sequential": self._sequential_collaboration,
            "parallel": self._parallel_collaboration,
            "hierarchical": self._hierarchical_collaboration,
            "consensus": self._consensus_collaboration
        }
    
    def register_expert(self, domain: str, agent: Agent):
        """Registreer domain expert"""
        self.domain_experts[domain] = agent
    
    def analyze_task_domains(self, task_description: str) -> List[str]:
        """Identificeer welke domains nodig zijn"""
        domain_keywords = {
            "frontend": ["ui", "ux", "react", "interface", "design"],
            "backend": ["api", "database", "server", "endpoint"],
            "security": ["authentication", "encryption", "vulnerability", "secure"],
            "devops": ["deployment", "ci/cd", "kubernetes", "infrastructure"],
            "data": ["analytics", "etl", "warehouse", "pipeline"],
            "ml": ["model", "training", "prediction", "neural"]
        }
        
        required_domains = []
        task_lower = task_description.lower()
        
        for domain, keywords in domain_keywords.items():
            if any(keyword in task_lower for keyword in keywords):
                required_domains.append(domain)
        
        return required_domains
    
    def _sequential_collaboration(self, task: Task, domains: List[str]) -> str:
        """Domains werken sequentieel"""
        result = ""
        context = task.description
        
        for domain in domains:
            if domain in self.domain_experts:
                expert = self.domain_experts[domain]
                
                domain_task = Task(
                    description=f"{context}\\n\\nFocus on {domain} aspects",
                    expected_output=f"{domain} analysis and recommendations",
                    agent=expert
                )
                
                domain_result = expert.execute(domain_task)
                result += f"\\n\\n{domain.upper()} ANALYSIS:\\n{domain_result}"
                
                # Update context for next expert
                context += f"\\n\\nPrevious {domain} analysis: {domain_result}"
        
        return result
    
    def _parallel_collaboration(self, task: Task, domains: List[str]) -> str:
        """Domains werken parallel"""
        from concurrent.futures import ThreadPoolExecutor
        
        def execute_domain_task(domain: str) -> Tuple[str, str]:
            if domain not in self.domain_experts:
                return domain, ""
            
            expert = self.domain_experts[domain]
            domain_task = Task(
                description=f"{task.description}\\n\\nFocus on {domain} aspects",
                expected_output=f"{domain} analysis",
                agent=expert
            )
            
            return domain, expert.execute(domain_task)
        
        results = {}
        with ThreadPoolExecutor(max_workers=len(domains)) as executor:
            futures = [executor.submit(execute_domain_task, domain) for domain in domains]
            
            for future in futures:
                domain, result = future.result()
                results[domain] = result
        
        # Combine results
        combined = "MULTI-DOMAIN ANALYSIS:\\n\\n"
        for domain, result in results.items():
            combined += f"{domain.upper()}:\\n{result}\\n\\n"
        
        return combined
    
    def _consensus_collaboration(self, task: Task, domains: List[str]) -> str:
        """Domains bereiken consensus"""
        
        # First round: Individual analyses
        individual_analyses = {}
        for domain in domains:
            if domain in self.domain_experts:
                expert = self.domain_experts[domain]
                domain_task = Task(
                    description=task.description,
                    expected_output=f"{domain} perspective and recommendations",
                    agent=expert
                )
                individual_analyses[domain] = expert.execute(domain_task)
        
        # Second round: Review and consensus
        consensus_prompt = f"""
        Original task: {task.description}
        
        Domain analyses:
        {json.dumps(individual_analyses, indent=2)}
        
        Synthesize these perspectives into a unified recommendation that:
        1. Incorporates insights from all domains
        2. Resolves any conflicts between recommendations
        3. Provides a clear, actionable plan
        """
        
        # Use a coordinator agent for consensus
        if "coordinator" in self.domain_experts:
            coordinator = self.domain_experts["coordinator"]
        else:
            # Use first available expert as coordinator
            coordinator = list(self.domain_experts.values())[0]
        
        consensus_task = Task(
            description=consensus_prompt,
            expected_output="Unified multi-domain recommendation",
            agent=coordinator
        )
        
        return coordinator.execute(consensus_task)

# Praktisch voorbeeld: Full-Stack Project
orchestrator = CrossDomainOrchestrator()

# Register specialists
orchestrator.register_expert("frontend", Agent(
    role="Frontend Architect",
    goal="Design user-friendly, performant interfaces",
    backstory="React specialist with focus on accessibility and performance"
))

orchestrator.register_expert("backend", Agent(
    role="Backend Engineer",
    goal="Build scalable, secure APIs",
    backstory="Microservices expert with distributed systems experience"
))

orchestrator.register_expert("security", Agent(
    role="Security Engineer",
    goal="Ensure application security at all layers",
    backstory="OWASP expert with penetration testing background"
))

orchestrator.register_expert("devops", Agent(
    role="DevOps Engineer",
    goal="Enable reliable, automated deployments",
    backstory="Kubernetes and CI/CD pipeline specialist"
))

# Complex multi-domain task
complex_task = Task(
    description="""Design and implement a secure payment processing system with:
    - User-friendly checkout interface
    - PCI-compliant backend API
    - Real-time fraud detection
    - Automated deployment pipeline""",
    expected_output="Complete implementation plan with all domain considerations"
)

# Identify required domains
required_domains = orchestrator.analyze_task_domains(complex_task.description)
print(f"Required domains: {required_domains}")

# Execute with different collaboration patterns
sequential_result = orchestrator.collaboration_patterns["sequential"](complex_task, required_domains)
parallel_result = orchestrator.collaboration_patterns["parallel"](complex_task, required_domains)
consensus_result = orchestrator.collaboration_patterns["consensus"](complex_task, required_domains)`,
      explanation: 'Cross-domain orchestration patterns maken het mogelijk om complexe taken op te delen en experts effectief te laten samenwerken.'
    }
  ],
  assignments: [
    {
      id: 'assignment-2-2',
      title: 'Bouw een Specialist Team voor E-commerce Platform',
      description: 'Creëer een team van gespecialiseerde agents voor verschillende aspecten van een e-commerce platform.',
      difficulty: 'hard',
      type: 'code',
      initialCode: `from crewai import Agent, Task, Crew
from langchain.chat_models import ChatOpenAI

# Jouw opdracht: Bouw een team van minimaal 5 specialists voor een e-commerce platform
# Elke specialist moet:
# 1. Een uniek expertise domain hebben
# 2. Specifieke tools/kennis voor dat domain
# 3. Duidelijke interfaces voor samenwerking
# 4. Meetbare expertise indicators

# Specialist 1: E-commerce Business Analyst
ecommerce_analyst = Agent(
    role="___",
    goal="___",
    backstory="""___""",
    domain_expertise={
        "primary": "___",
        "secondary": ["___", "___"],
        "tools": ["___"],
        "metrics": ["___"]
    },
    llm=ChatOpenAI(model="gpt-4", temperature=___)
)

# Specialist 2-5: Vul aan met complementaire specialists
# Denk aan: Payment processing, Inventory management, Customer service, 
# Marketing automation, Logistics, Security, etc.

specialist_2 = Agent(
    # Configuratie hier
)

specialist_3 = Agent(
    # Configuratie hier
)

specialist_4 = Agent(
    # Configuratie hier
)

specialist_5 = Agent(
    # Configuratie hier
)

# Definieer hoe deze specialists samenwerken
collaboration_matrix = {
    "payment_flow": {
        "participants": ["___", "___"],
        "interaction_type": "___",  # sequential/parallel/consensus
        "trigger": "___"
    },
    "inventory_update": {
        "participants": ["___", "___", "___"],
        "interaction_type": "___",
        "trigger": "___"
    },
    "customer_issue": {
        "participants": ["___", "___"],
        "interaction_type": "___",
        "trigger": "___"
    }
}

# Test scenario: New product launch
def test_specialist_collaboration():
    """Test hoe specialists samenwerken bij product launch"""
    
    launch_task = Task(
        description="""Plan the launch of a new premium electronics product:
        - Market analysis and pricing strategy
        - Inventory and logistics planning  
        - Payment system configuration
        - Customer support preparation
        - Security audit for high-value items""",
        expected_output="Complete launch plan with all specialist inputs"
    )
    
    # Implementeer collaboration logic
    results = {}
    
    # Jouw implementatie hier
    
    return results

# Bonus: Expertise validation
def validate_specialist_expertise(agent: Agent, test_cases: List[str]) -> float:
    """Valideer dat specialist daadwerkelijk expert is in domain"""
    
    # Implementeer expertise testing
    pass`,
      solution: `from crewai import Agent, Task, Crew
from langchain.chat_models import ChatOpenAI
from typing import Dict, List

# Specialist 1: E-commerce Business Analyst
ecommerce_analyst = Agent(
    role="Senior E-commerce Business Analyst",
    goal="Optimize product positioning, pricing, and market strategy using data-driven insights",
    backstory="""You are Maria Santos, a business analyst with 10 years in e-commerce. 
    You've helped launch 100+ products and understand consumer psychology, market trends, 
    and competitive positioning. You turn data into actionable business strategies.""",
    domain_expertise={
        "primary": "business_analytics",
        "secondary": ["market_research", "pricing_strategy", "consumer_behavior"],
        "tools": ["google_analytics", "market_research_apis", "competitor_analysis"],
        "metrics": ["conversion_rate", "aov", "cart_abandonment", "clv"]
    },
    llm=ChatOpenAI(model="gpt-4", temperature=0.4)
)

# Specialist 2: Payment Systems Expert
payment_specialist = Agent(
    role="Payment Systems Architect",
    goal="Ensure secure, compliant, and frictionless payment processing",
    backstory="""You are James Chen, a payment systems expert with fintech background. 
    You've implemented payment solutions processing millions in transactions. Expert in 
    PCI compliance, fraud prevention, and payment orchestration across multiple providers.""",
    domain_expertise={
        "primary": "payment_processing",
        "secondary": ["fraud_detection", "compliance", "payment_orchestration"],
        "tools": ["stripe_api", "fraud_detection_ml", "pci_compliance_scanner"],
        "metrics": ["transaction_success_rate", "fraud_rate", "payment_latency"]
    },
    llm=ChatOpenAI(model="gpt-4", temperature=0.2)  # Low temp for financial precision
)

# Specialist 3: Inventory & Supply Chain Manager
inventory_specialist = Agent(
    role="Supply Chain Optimization Expert",
    goal="Maintain optimal inventory levels while minimizing costs and stockouts",
    backstory="""You are Dr. Raj Patel, supply chain expert with PhD in Operations Research. 
    You've optimized inventory for Fortune 500 retailers. Expert in demand forecasting, 
    JIT inventory, and multi-warehouse optimization.""",
    domain_expertise={
        "primary": "inventory_management",
        "secondary": ["demand_forecasting", "logistics", "warehouse_optimization"],
        "tools": ["inventory_optimizer", "demand_forecast_ml", "logistics_apis"],
        "metrics": ["inventory_turnover", "stockout_rate", "carrying_cost", "otif"]
    },
    llm=ChatOpenAI(model="gpt-4", temperature=0.3)
)

# Specialist 4: Customer Experience Designer
cx_specialist = Agent(
    role="Customer Experience Architect",
    goal="Design and optimize customer journeys that delight and convert",
    backstory="""You are Lisa Thompson, CX designer with psychology background. You've 
    redesigned experiences for major e-commerce brands, increasing conversions by 40%+. 
    You blend behavioral psychology with data to create intuitive shopping experiences.""",
    domain_expertise={
        "primary": "customer_experience",
        "secondary": ["ux_design", "behavioral_psychology", "conversion_optimization"],
        "tools": ["heatmap_analytics", "ab_testing_platform", "customer_feedback_ai"],
        "metrics": ["nps", "task_completion_rate", "time_to_purchase", "bounce_rate"]
    },
    llm=ChatOpenAI(model="gpt-4", temperature=0.7)
)

# Specialist 5: Security & Compliance Officer
security_specialist = Agent(
    role="E-commerce Security Director",
    goal="Protect customer data and ensure regulatory compliance across all operations",
    backstory="""You are Alex Kim, cybersecurity expert specializing in e-commerce. 
    Former security consultant for major retailers, you've prevented millions in potential 
    losses. Expert in GDPR, PCI-DSS, and emerging e-commerce security threats.""",
    domain_expertise={
        "primary": "security_compliance",
        "secondary": ["data_privacy", "threat_detection", "regulatory_compliance"],
        "tools": ["vulnerability_scanner", "compliance_auditor", "threat_intelligence"],
        "metrics": ["security_incidents", "compliance_score", "data_breach_risk", "audit_findings"]
    },
    llm=ChatOpenAI(model="gpt-4", temperature=0.1)  # Very low temp for security
)

# Collaboration matrix defining specialist interactions
collaboration_matrix = {
    "payment_flow": {
        "participants": ["payment_specialist", "security_specialist", "cx_specialist"],
        "interaction_type": "sequential",
        "trigger": "payment_implementation",
        "flow": "security validates → payment implements → cx optimizes"
    },
    "inventory_update": {
        "participants": ["inventory_specialist", "ecommerce_analyst", "payment_specialist"],
        "interaction_type": "parallel",
        "trigger": "stock_level_change",
        "flow": "all analyze simultaneously then sync"
    },
    "customer_issue": {
        "participants": ["cx_specialist", "security_specialist"],
        "interaction_type": "consensus",
        "trigger": "customer_complaint",
        "flow": "joint investigation and resolution"
    },
    "product_launch": {
        "participants": ["all"],
        "interaction_type": "hierarchical",
        "trigger": "new_product",
        "flow": "analyst leads → others contribute → security validates"
    }
}

# Test scenario implementation
def test_specialist_collaboration():
    """Test specialist collaboration for product launch"""
    
    launch_task = Task(
        description="""Plan the launch of a new premium electronics product:
        - Market analysis and pricing strategy
        - Inventory and logistics planning  
        - Payment system configuration
        - Customer support preparation
        - Security audit for high-value items""",
        expected_output="Complete launch plan with all specialist inputs"
    )
    
    results = {}
    specialists = {
        "analyst": ecommerce_analyst,
        "payment": payment_specialist,
        "inventory": inventory_specialist,
        "cx": cx_specialist,
        "security": security_specialist
    }
    
    # Phase 1: Market Analysis (Analyst leads)
    analyst_task = Task(
        description="Analyze market for premium electronics, recommend pricing and positioning",
        agent=ecommerce_analyst
    )
    results["market_analysis"] = ecommerce_analyst.execute(analyst_task)
    
    # Phase 2: Parallel Planning (based on analyst insights)
    from concurrent.futures import ThreadPoolExecutor
    
    parallel_tasks = {
        "inventory_plan": (inventory_specialist, "Plan inventory levels based on market analysis"),
        "payment_config": (payment_specialist, "Configure payment systems for high-value items"),
        "cx_design": (cx_specialist, "Design premium product shopping experience")
    }
    
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = {}
        for key, (specialist, description) in parallel_tasks.items():
            task = Task(description=description, agent=specialist)
            futures[key] = executor.submit(specialist.execute, task)
        
        for key, future in futures.items():
            results[key] = future.result()
    
    # Phase 3: Security Review (Sequential)
    security_task = Task(
        description=f"Security audit of: {results}",
        agent=security_specialist
    )
    results["security_audit"] = security_specialist.execute(security_task)
    
    # Phase 4: Integration Meeting (Consensus)
    integration_crew = Crew(
        agents=list(specialists.values()),
        tasks=[Task(
            description="Integrate all plans into cohesive launch strategy",
            expected_output="Unified launch plan"
        )]
    )
    
    results["integrated_plan"] = integration_crew.kickoff()
    
    return results

# Expertise validation implementation
def validate_specialist_expertise(agent: Agent, test_cases: List[str]) -> float:
    """Validate specialist expertise in domain"""
    
    correct_responses = 0
    
    for test_case in test_cases:
        task = Task(
            description=test_case,
            agent=agent,
            expected_output="Expert analysis"
        )
        
        response = agent.execute(task)
        
        # Check for domain-specific keywords and depth
        domain_keywords = agent.domain_expertise["secondary"]
        keyword_count = sum(1 for keyword in domain_keywords if keyword in response.lower())
        
        # Score based on keyword presence and response length
        if keyword_count >= 2 and len(response) > 200:
            correct_responses += 1
    
    return correct_responses / len(test_cases)

# Test expertise
test_cases = [
    "How do you handle PCI compliance for high-value transactions?",
    "What's your approach to demand forecasting for new products?",
    "How do you optimize conversion rates for premium items?"
]

for name, specialist in {"payment": payment_specialist, "inventory": inventory_specialist}.items():
    score = validate_specialist_expertise(specialist, test_cases)
    print(f"{name} expertise score: {score:.2%}")`,
      hints: [
        'Denk aan alle aspecten van e-commerce: frontend, backend, payments, logistics, customer service',
        'Specialisten moeten elkaar aanvullen, niet overlappen',
        'Overweeg verschillende collaboration patterns voor verschillende scenarios',
        'Expertise moet meetbaar en testbaar zijn'
      ]
    }
  ],
  resources: [
    {
      title: 'Domain-Driven Design for AI Systems',
      url: 'https://martinfowler.com/articles/ddd-ai.html',
      type: 'article'
    },
    {
      title: 'Building Specialist AI Agents',
      url: 'https://www.deeplearning.ai/short-courses/building-specialist-agents/',
      type: 'course'
    },
    {
      title: 'Multi-Agent Specialization Patterns',
      url: 'https://arxiv.org/abs/2023.specialist-agents',
      type: 'research'
    }
  ]
}