import { Lesson } from '@/lib/data/courses';

export const lesson33: Lesson = {
  id: 'lesson-3-3',
  title: 'Task Delegation & Workflow Orchestration',
  duration: '60 min',
  content: `
# Task Delegation & Workflow Orchestration

Effectieve task delegation en workflow orchestration zijn cruciaal voor complexe crew operations. Deze les behandelt geavanceerde patterns voor het coördineren van taken tussen agents.

## Task Delegation Fundamentals

### Intelligent Task Router

\`\`\`python
from crewai import Agent, Task, Crew, Process
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import json
from datetime import datetime, timedelta
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class TaskRequirements:
    """Requirements voor een task"""
    skills: List[str]
    priority: int  # 1-5, 5 is highest
    deadline: Optional[datetime] = None
    estimated_hours: float = 1.0
    dependencies: List[str] = None
    resource_needs: Dict[str, int] = None

class TaskRouter:
    """Intelligent task routing naar de juiste agents"""
    
    def __init__(self):
        self.agents: Dict[str, Agent] = {}
        self.agent_skills: Dict[str, List[str]] = {}
        self.agent_workload: Dict[str, float] = {}
        self.task_history: List[Dict] = []
        
    def register_agent(self, agent: Agent, skills: List[str]):
        """Register agent met skills"""
        agent_id = agent.role
        self.agents[agent_id] = agent
        self.agent_skills[agent_id] = skills
        self.agent_workload[agent_id] = 0.0
        logger.info(f"Registered agent {agent_id} with skills: {skills}")
        
    def find_best_agent(self, requirements: TaskRequirements) -> Optional[Agent]:
        """Find best matching agent voor task"""
        candidates = []
        
        for agent_id, skills in self.agent_skills.items():
            # Check skill match
            skill_match = len(set(requirements.skills) & set(skills))
            if skill_match == 0:
                continue
                
            # Calculate suitability score
            skill_coverage = skill_match / len(requirements.skills)
            workload_factor = 1 / (1 + self.agent_workload[agent_id])
            
            score = skill_coverage * workload_factor
            
            candidates.append((agent_id, score))
        
        # Sort by score
        candidates.sort(key=lambda x: x[1], reverse=True)
        
        if candidates:
            best_agent_id = candidates[0][0]
            logger.info(f"Selected agent {best_agent_id} with score {candidates[0][1]}")
            return self.agents[best_agent_id]
        
        return None
    
    def delegate_task(
        self, 
        task_description: str, 
        requirements: TaskRequirements
    ) -> Optional[Task]:
        """Delegate task naar best suited agent"""
        
        # Find best agent
        agent = self.find_best_agent(requirements)
        if not agent:
            logger.warning(f"No suitable agent found for task: {task_description}")
            return None
        
        # Create task
        task = Task(
            description=f"""
            Priority: {requirements.priority}/5
            Deadline: {requirements.deadline or 'None'}
            
            Task: {task_description}
            
            Required skills: {', '.join(requirements.skills)}
            Estimated time: {requirements.estimated_hours} hours
            """,
            expected_output="Completed task deliverables",
            agent=agent
        )
        
        # Update workload
        self.agent_workload[agent.role] += requirements.estimated_hours
        
        # Log delegation
        self.task_history.append({
            'timestamp': datetime.now(),
            'task': task_description,
            'agent': agent.role,
            'requirements': requirements
        })
        
        return task

# Usage example
router = TaskRouter()

# Register specialized agents
data_analyst = Agent(
    role="Data Analyst",
    goal="Analyze data and create insights",
    backstory="Expert in data analysis and visualization"
)

developer = Agent(
    role="Software Developer", 
    goal="Develop software solutions",
    backstory="Experienced full-stack developer"
)

designer = Agent(
    role="UX Designer",
    goal="Design user experiences",
    backstory="Creative designer with eye for detail"
)

router.register_agent(data_analyst, ["data_analysis", "sql", "visualization", "statistics"])
router.register_agent(developer, ["python", "javascript", "api", "database", "testing"])
router.register_agent(designer, ["ui_design", "ux", "prototyping", "user_research"])

# Delegate tasks
analysis_task = router.delegate_task(
    "Analyze customer churn data and create dashboard",
    TaskRequirements(
        skills=["data_analysis", "visualization"],
        priority=4,
        deadline=datetime.now() + timedelta(days=2),
        estimated_hours=8.0
    )
)
\`\`\`

## Advanced Delegation Patterns

### Skill-Based Delegation

\`\`\`python
from typing import Set
import numpy as np

class SkillBasedDelegator:
    """Advanced skill matching voor task delegation"""
    
    def __init__(self):
        self.skill_hierarchy = self._build_skill_hierarchy()
        self.agent_profiles = {}
        
    def _build_skill_hierarchy(self) -> Dict[str, Set[str]]:
        """Build skill hierarchy met related skills"""
        return {
            'programming': {'python', 'javascript', 'java', 'sql'},
            'data_science': {'statistics', 'ml', 'data_analysis', 'visualization'},
            'design': {'ui_design', 'ux', 'graphics', 'prototyping'},
            'management': {'planning', 'coordination', 'reporting', 'strategy'},
            'communication': {'writing', 'presentation', 'documentation', 'support'}
        }
    
    def calculate_skill_similarity(self, required: List[str], 
                                 available: List[str]) -> float:
        """Calculate skill similarity score"""
        direct_match = len(set(required) & set(available))
        
        # Check for related skills
        related_match = 0
        for req_skill in required:
            for category, skills in self.skill_hierarchy.items():
                if req_skill in skills:
                    # Count related skills
                    related_match += len(set(available) & skills) * 0.5
                    
        total_score = direct_match + related_match
        max_score = len(required)
        
        return min(total_score / max_score, 1.0) if max_score > 0 else 0.0
    
    def create_agent_profile(self, agent: Agent, skills: List[str], 
                           experience_levels: Dict[str, float]):
        """Create detailed agent profile"""
        self.agent_profiles[agent.role] = {
            'agent': agent,
            'skills': skills,
            'experience': experience_levels,
            'performance_history': [],
            'availability': 1.0
        }
    
    def delegate_with_learning(
        self, 
        task_desc: str, 
        required_skills: List[str],
        complexity: float = 0.5
    ) -> Tuple[Agent, float]:
        """Delegate with learning opportunities"""
        
        best_agent = None
        best_score = 0
        
        for role, profile in self.agent_profiles.items():
            # Calculate base skill match
            skill_score = self.calculate_skill_similarity(
                required_skills, 
                profile['skills']
            )
            
            # Factor in experience
            avg_experience = np.mean([
                profile['experience'].get(skill, 0) 
                for skill in required_skills
            ])
            
            # Learning opportunity bonus
            learning_bonus = 0
            if 0.6 <= skill_score <= 0.8:  # Partial match = learning opportunity
                learning_bonus = 0.2
            
            # Calculate final score
            final_score = (
                skill_score * 0.5 + 
                avg_experience * 0.3 + 
                profile['availability'] * 0.2 +
                learning_bonus
            )
            
            if final_score > best_score:
                best_score = final_score
                best_agent = profile['agent']
        
        return best_agent, best_score
\`\`\`

## Workflow Orchestration

### Sequential Workflow Engine

\`\`\`python
class WorkflowEngine:
    """Orchestrates complex multi-step workflows"""
    
    def __init__(self):
        self.workflows = {}
        self.execution_history = []
        self.checkpoint_manager = CheckpointManager()
        
    def define_workflow(self, name: str, steps: List[Dict]):
        """Define reusable workflow"""
        self.workflows[name] = {
            'name': name,
            'steps': steps,
            'created': datetime.now()
        }
    
    def execute_workflow(
        self, 
        workflow_name: str, 
        context: Dict,
        agents: Dict[str, Agent]
    ) -> Dict:
        """Execute complete workflow"""
        
        if workflow_name not in self.workflows:
            raise ValueError(f"Unknown workflow: {workflow_name}")
        
        workflow = self.workflows[workflow_name]
        execution_id = str(uuid.uuid4())
        
        results = {
            'execution_id': execution_id,
            'workflow': workflow_name,
            'start_time': datetime.now(),
            'steps': {},
            'status': 'running'
        }
        
        try:
            for i, step in enumerate(workflow['steps']):
                step_id = f"step_{i}_{step['name']}"
                
                # Create checkpoint
                self.checkpoint_manager.save_checkpoint(
                    execution_id, 
                    step_id, 
                    context
                )
                
                # Execute step
                step_result = self._execute_step(
                    step, 
                    context, 
                    agents,
                    previous_results=results['steps']
                )
                
                results['steps'][step_id] = step_result
                
                # Update context with results
                context.update(step_result.get('outputs', {}))
                
                # Check for early termination
                if step_result.get('status') == 'failed':
                    results['status'] = 'failed'
                    break
            
            else:
                results['status'] = 'completed'
                
        except Exception as e:
            results['status'] = 'error'
            results['error'] = str(e)
            
        results['end_time'] = datetime.now()
        results['duration'] = (results['end_time'] - results['start_time']).total_seconds()
        
        self.execution_history.append(results)
        return results
    
    def _execute_step(
        self, 
        step: Dict, 
        context: Dict, 
        agents: Dict[str, Agent],
        previous_results: Dict
    ) -> Dict:
        """Execute single workflow step"""
        
        step_type = step.get('type', 'task')
        
        if step_type == 'task':
            return self._execute_task_step(step, context, agents)
        elif step_type == 'parallel':
            return self._execute_parallel_step(step, context, agents)
        elif step_type == 'conditional':
            return self._execute_conditional_step(step, context, agents, previous_results)
        elif step_type == 'loop':
            return self._execute_loop_step(step, context, agents)
        else:
            raise ValueError(f"Unknown step type: {step_type}")
    
    def _execute_task_step(self, step: Dict, context: Dict, 
                          agents: Dict[str, Agent]) -> Dict:
        """Execute single task step"""
        agent_role = step.get('agent')
        if agent_role not in agents:
            return {'status': 'failed', 'error': f'Agent {agent_role} not found'}
        
        agent = agents[agent_role]
        
        # Create task with context
        task_description = step['description'].format(**context)
        
        task = Task(
            description=task_description,
            expected_output=step.get('expected_output', 'Task output'),
            agent=agent
        )
        
        # Execute task (simplified - in practice would use Crew)
        # crew = Crew(agents=[agent], tasks=[task])
        # result = crew.kickoff()
        
        return {
            'status': 'completed',
            'outputs': {'task_result': f"Completed: {task_description}"},
            'agent': agent_role
        }

class CheckpointManager:
    """Manages workflow checkpoints voor recovery"""
    
    def __init__(self, storage_path: str = "./checkpoints"):
        self.storage_path = storage_path
        os.makedirs(storage_path, exist_ok=True)
        
    def save_checkpoint(self, execution_id: str, step_id: str, context: Dict):
        """Save workflow checkpoint"""
        checkpoint = {
            'execution_id': execution_id,
            'step_id': step_id,
            'context': context,
            'timestamp': datetime.now().isoformat()
        }
        
        filepath = os.path.join(
            self.storage_path, 
            f"{execution_id}_{step_id}.json"
        )
        
        with open(filepath, 'w') as f:
            json.dump(checkpoint, f, indent=2)
    
    def load_checkpoint(self, execution_id: str, step_id: str) -> Optional[Dict]:
        """Load checkpoint for recovery"""
        filepath = os.path.join(
            self.storage_path,
            f"{execution_id}_{step_id}.json"
        )
        
        if os.path.exists(filepath):
            with open(filepath, 'r') as f:
                return json.load(f)
        return None
\`\`\`

## Parallel Task Execution

### Parallel Workflow Orchestrator

\`\`\`python
import asyncio
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Callable

class ParallelOrchestrator:
    """Orchestrates parallel task execution"""
    
    def __init__(self, max_workers: int = 5):
        self.max_workers = max_workers
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        
    def execute_parallel_tasks(
        self, 
        tasks: List[Task],
        timeout: Optional[float] = None
    ) -> Dict[str, Any]:
        """Execute tasks in parallel"""
        
        results = {
            'total_tasks': len(tasks),
            'completed': 0,
            'failed': 0,
            'task_results': {},
            'execution_time': 0
        }
        
        start_time = time.time()
        
        # Submit all tasks
        future_to_task = {
            self.executor.submit(self._execute_task, task): task 
            for task in tasks
        }
        
        # Collect results
        for future in as_completed(future_to_task, timeout=timeout):
            task = future_to_task[future]
            task_id = f"{task.agent.role}_{id(task)}"
            
            try:
                result = future.result()
                results['task_results'][task_id] = {
                    'status': 'completed',
                    'result': result,
                    'agent': task.agent.role
                }
                results['completed'] += 1
                
            except Exception as e:
                results['task_results'][task_id] = {
                    'status': 'failed',
                    'error': str(e),
                    'agent': task.agent.role
                }
                results['failed'] += 1
        
        results['execution_time'] = time.time() - start_time
        return results
    
    def _execute_task(self, task: Task) -> Any:
        """Execute single task"""
        # In practice, this would create a Crew and execute
        # For now, simulate execution
        time.sleep(0.5)  # Simulate work
        return f"Result from {task.agent.role}"
    
    async def execute_async_workflow(
        self,
        workflow_steps: List[Dict],
        agents: Dict[str, Agent]
    ) -> Dict:
        """Execute workflow with async/await pattern"""
        
        results = []
        
        for step in workflow_steps:
            if step['type'] == 'parallel':
                # Execute parallel tasks
                parallel_results = await self._execute_parallel_async(
                    step['tasks'], 
                    agents
                )
                results.append(parallel_results)
                
            else:
                # Execute sequential task
                result = await self._execute_single_async(step, agents)
                results.append(result)
        
        return {
            'workflow_results': results,
            'total_steps': len(workflow_steps)
        }
    
    async def _execute_parallel_async(
        self, 
        task_configs: List[Dict], 
        agents: Dict[str, Agent]
    ) -> List[Any]:
        """Execute tasks in parallel using asyncio"""
        
        tasks = []
        for config in task_configs:
            agent = agents[config['agent']]
            task = Task(
                description=config['description'],
                agent=agent
            )
            tasks.append(asyncio.create_task(
                self._async_task_executor(task)
            ))
        
        return await asyncio.gather(*tasks)
    
    async def _async_task_executor(self, task: Task) -> Dict:
        """Async task executor"""
        # Simulate async execution
        await asyncio.sleep(0.5)
        return {
            'task': task.description,
            'agent': task.agent.role,
            'result': 'Completed'
        }
\`\`\`

## Dynamic Workflow Adaptation

### Adaptive Workflow Controller

\`\`\`python
class AdaptiveWorkflowController:
    """Dynamically adapts workflows based on conditions"""
    
    def __init__(self):
        self.adaptation_rules = []
        self.performance_metrics = {}
        
    def add_adaptation_rule(
        self, 
        condition: Callable[[Dict], bool],
        adaptation: Callable[[Dict], Dict]
    ):
        """Add rule for workflow adaptation"""
        self.adaptation_rules.append({
            'condition': condition,
            'adaptation': adaptation
        })
    
    def execute_adaptive_workflow(
        self,
        base_workflow: List[Dict],
        context: Dict,
        agents: Dict[str, Agent]
    ) -> Dict:
        """Execute workflow with dynamic adaptation"""
        
        adapted_workflow = base_workflow.copy()
        execution_results = []
        
        for i, step in enumerate(adapted_workflow):
            # Check adaptation rules
            for rule in self.adaptation_rules:
                if rule['condition'](context):
                    # Apply adaptation
                    adaptation = rule['adaptation'](context)
                    
                    if adaptation.get('insert_step'):
                        # Insert new step
                        adapted_workflow.insert(
                            i + 1, 
                            adaptation['insert_step']
                        )
                    
                    if adaptation.get('modify_current'):
                        # Modify current step
                        step.update(adaptation['modify_current'])
                    
                    if adaptation.get('skip_next'):
                        # Skip next N steps
                        for _ in range(adaptation['skip_next']):
                            if i + 1 < len(adapted_workflow):
                                adapted_workflow.pop(i + 1)
            
            # Execute step
            result = self._execute_adaptive_step(step, context, agents)
            execution_results.append(result)
            
            # Update context with results
            context.update(result.get('outputs', {}))
            
            # Update performance metrics
            self._update_metrics(step, result)
        
        return {
            'original_steps': len(base_workflow),
            'executed_steps': len(execution_results),
            'adaptations_applied': len(adapted_workflow) - len(base_workflow),
            'results': execution_results
        }
    
    def _execute_adaptive_step(
        self, 
        step: Dict, 
        context: Dict, 
        agents: Dict[str, Agent]
    ) -> Dict:
        """Execute step with performance tracking"""
        
        start_time = time.time()
        
        # Execute based on step type
        if step['type'] == 'quality_check':
            result = self._quality_check(step, context)
        else:
            # Regular task execution
            agent = agents[step['agent']]
            task = Task(
                description=step['description'],
                agent=agent
            )
            # Execute task
            result = {'status': 'completed', 'outputs': {}}
        
        execution_time = time.time() - start_time
        
        return {
            'step_name': step.get('name', 'unnamed'),
            'execution_time': execution_time,
            'status': result.get('status', 'completed'),
            'outputs': result.get('outputs', {})
        }
    
    def _quality_check(self, step: Dict, context: Dict) -> Dict:
        """Perform quality check on previous results"""
        
        check_type = step.get('check_type', 'threshold')
        
        if check_type == 'threshold':
            value = context.get(step['metric'], 0)
            threshold = step.get('threshold', 0.8)
            
            passed = value >= threshold
            
            return {
                'status': 'completed',
                'outputs': {
                    'quality_passed': passed,
                    'quality_score': value
                }
            }
        
        return {'status': 'completed', 'outputs': {}}

# Example adaptive rules
def performance_degradation_rule(context: Dict) -> bool:
    """Check if performance is degrading"""
    return context.get('quality_score', 1.0) < 0.7

def add_review_step(context: Dict) -> Dict:
    """Add review step when quality is low"""
    return {
        'insert_step': {
            'name': 'quality_review',
            'type': 'task',
            'agent': 'reviewer',
            'description': 'Review and improve quality of previous output'
        }
    }

# Setup adaptive controller
controller = AdaptiveWorkflowController()
controller.add_adaptation_rule(
    performance_degradation_rule,
    add_review_step
)
\`\`\`

## Workflow Monitoring & Analytics

### Workflow Analytics Engine

\`\`\`python
class WorkflowAnalytics:
    """Analytics engine voor workflow performance"""
    
    def __init__(self):
        self.metrics_store = []
        self.kpis = self._define_kpis()
        
    def _define_kpis(self) -> Dict[str, Callable]:
        """Define Key Performance Indicators"""
        return {
            'avg_task_duration': lambda m: np.mean([x['duration'] for x in m]),
            'success_rate': lambda m: sum(1 for x in m if x['status'] == 'completed') / len(m),
            'agent_utilization': self._calculate_utilization,
            'bottleneck_detection': self._detect_bottlenecks
        }
    
    def track_execution(self, workflow_name: str, execution_data: Dict):
        """Track workflow execution metrics"""
        
        metrics = {
            'workflow': workflow_name,
            'timestamp': datetime.now(),
            'duration': execution_data.get('duration', 0),
            'status': execution_data.get('status'),
            'step_count': len(execution_data.get('steps', {})),
            'agent_usage': self._extract_agent_usage(execution_data)
        }
        
        self.metrics_store.append(metrics)
    
    def generate_report(self, time_window: timedelta = None) -> Dict:
        """Generate analytics report"""
        
        # Filter metrics by time window
        if time_window:
            cutoff = datetime.now() - time_window
            relevant_metrics = [
                m for m in self.metrics_store 
                if m['timestamp'] > cutoff
            ]
        else:
            relevant_metrics = self.metrics_store
        
        if not relevant_metrics:
            return {'error': 'No metrics available'}
        
        report = {
            'period': {
                'start': min(m['timestamp'] for m in relevant_metrics),
                'end': max(m['timestamp'] for m in relevant_metrics)
            },
            'total_executions': len(relevant_metrics),
            'kpis': {}
        }
        
        # Calculate KPIs
        for kpi_name, calculator in self.kpis.items():
            try:
                report['kpis'][kpi_name] = calculator(relevant_metrics)
            except Exception as e:
                report['kpis'][kpi_name] = f"Error: {str(e)}"
        
        # Add workflow-specific stats
        report['workflow_stats'] = self._workflow_breakdown(relevant_metrics)
        
        return report
    
    def _calculate_utilization(self, metrics: List[Dict]) -> Dict:
        """Calculate agent utilization rates"""
        
        agent_time = {}
        total_time = sum(m['duration'] for m in metrics)
        
        for metric in metrics:
            for agent, time in metric.get('agent_usage', {}).items():
                agent_time[agent] = agent_time.get(agent, 0) + time
        
        return {
            agent: (time / total_time) if total_time > 0 else 0
            for agent, time in agent_time.items()
        }
    
    def _detect_bottlenecks(self, metrics: List[Dict]) -> List[Dict]:
        """Detect workflow bottlenecks"""
        
        bottlenecks = []
        
        # Analyze step durations
        step_times = {}
        for metric in metrics:
            for step_id, step_data in metric.get('steps', {}).items():
                if step_id not in step_times:
                    step_times[step_id] = []
                step_times[step_id].append(step_data.get('execution_time', 0))
        
        # Find outliers
        for step_id, times in step_times.items():
            avg_time = np.mean(times)
            std_time = np.std(times)
            
            if std_time > avg_time * 0.5:  # High variance
                bottlenecks.append({
                    'step': step_id,
                    'avg_time': avg_time,
                    'variance': std_time,
                    'severity': 'high' if std_time > avg_time else 'medium'
                })
        
        return bottlenecks

# Real-time monitoring
class WorkflowMonitor:
    """Real-time workflow monitoring"""
    
    def __init__(self):
        self.active_workflows = {}
        self.alerts = []
        
    def start_monitoring(self, workflow_id: str, workflow_name: str):
        """Start monitoring a workflow"""
        self.active_workflows[workflow_id] = {
            'name': workflow_name,
            'start_time': datetime.now(),
            'status': 'running',
            'current_step': None,
            'completed_steps': 0
        }
    
    def update_progress(self, workflow_id: str, step_name: str, 
                       status: str = 'in_progress'):
        """Update workflow progress"""
        if workflow_id in self.active_workflows:
            workflow = self.active_workflows[workflow_id]
            workflow['current_step'] = step_name
            
            if status == 'completed':
                workflow['completed_steps'] += 1
            
            # Check for alerts
            self._check_alerts(workflow_id, workflow)
    
    def _check_alerts(self, workflow_id: str, workflow: Dict):
        """Check for alert conditions"""
        
        # Long running workflow
        duration = (datetime.now() - workflow['start_time']).total_seconds()
        if duration > 3600:  # 1 hour
            self.alerts.append({
                'workflow_id': workflow_id,
                'type': 'long_running',
                'message': f"Workflow running for {duration/3600:.1f} hours",
                'severity': 'warning'
            })
\`\`\`

Deze advanced patterns voor task delegation en workflow orchestration maken het mogelijk om complexe multi-agent workflows effectief te managen.
  `,
  assignments: [
    {
      id: 'ex1',
      title: 'Dynamic Workflow Builder',
      description: 'Bouw een systeem dat workflows dynamisch kan aanpassen based op runtime conditions',
      difficulty: 'hard',
      type: 'project',
      hints: [
        'Implementeer condition-based branching',
        'Add rollback capabilities',
        'Include performance-based adaptations'
      ]
    },
    {
      id: 'ex2',
      title: 'Parallel Task Orchestrator',
      description: 'Creëer een orchestrator die 10+ agents parallel kan aansturen met dependency management',
      difficulty: 'expert',
      type: 'project',
      hints: [
        'Handle task dependencies',
        'Implement resource locking',
        'Add progress tracking and visualization'
      ]
    }
  ],
  resources: [
    {
      title: 'Workflow Patterns',
      url: 'https://www.workflowpatterns.com/',
      type: 'documentation'
    },
    {
      title: 'Task Scheduling Algorithms',
      url: 'https://en.wikipedia.org/wiki/Scheduling_(computing)',
      type: 'article'
    }
  ]
};