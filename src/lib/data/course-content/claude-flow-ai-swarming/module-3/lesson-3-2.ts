import { Lesson } from '@/lib/data/courses';

export const lesson32: Lesson = {
  id: 'lesson-3-2',
  title: 'Communication Protocols',
  duration: '45 min',
  order: 2,
  content: `
# Communication Protocols in Multi-Agent Systems

In deze les behandelen we de verschillende communicatie protocollen die gebruikt worden in multi-agent systemen.

## Overzicht

Multi-agent systemen vereisen robuuste communicatie protocollen voor effectieve samenwerking tussen agents.

### Wat je gaat leren:

1. **Message Passing Protocollen**
   - Direct messaging tussen agents
   - Broadcast en multicast patterns
   - Queue-based messaging

2. **Event-Driven Architectuur**
   - Event publishing en subscribing
   - Event bus implementatie
   - Asynchrone communicatie patterns

3. **Shared Memory Patterns**
   - Blackboard architectuur
   - Tuple spaces
   - Distributed caching

4. **Protocol Standaarden**
   - FIPA ACL (Agent Communication Language)
   - JSON-RPC voor agent communicatie
   - Custom protocol design

## Praktische Implementatie

### Message Queue Setup

\`\`\`typescript
// Basis message queue voor agent communicatie
interface AgentMessage {
  from: string;
  to: string | string[];
  type: 'request' | 'response' | 'broadcast';
  content: any;
  timestamp: number;
}

class MessageQueue {
  private queues: Map<string, AgentMessage[]> = new Map();

  send(message: AgentMessage) {
    const recipients = Array.isArray(message.to) ? message.to : [message.to];
    
    recipients.forEach(recipient => {
      if (!this.queues.has(recipient)) {
        this.queues.set(recipient, []);
      }
      this.queues.get(recipient)!.push(message);
    });
  }

  receive(agentId: string): AgentMessage | null {
    const queue = this.queues.get(agentId);
    return queue?.shift() || null;
  }
}
\`\`\`

### Event-Driven Communication

\`\`\`typescript
// Event bus voor agent coordinatie
class AgentEventBus {
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  subscribe(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  publish(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    callbacks?.forEach(callback => callback(data));
  }
}
\`\`\`

## Best Practices

1. **Reliability**: Implementeer retry mechanismen en acknowledgments
2. **Scalability**: Gebruik asynchrone patterns voor grote systemen
3. **Security**: Versleutel gevoelige communicatie tussen agents
4. **Monitoring**: Log alle agent communicatie voor debugging

## Opdracht

Implementeer een volledig communicatie systeem voor een multi-agent swarm met:
- Message queue voor direct messaging
- Event bus voor broadcast communicatie
- Protocol voor taak distributie
- Error handling en recovery mechanismen

## Volgende Stap

In de volgende les gaan we dieper in op taak distributie strategieën en load balancing in multi-agent systemen.
`,
  codeExamples: [
    {
      title: 'Complete Agent Communication System',
      language: 'typescript',
      code: `
// Volledig communicatie systeem voor multi-agent swarm
class AgentCommunicationSystem {
  private messageQueue: MessageQueue;
  private eventBus: AgentEventBus;
  private agents: Map<string, Agent> = new Map();

  constructor() {
    this.messageQueue = new MessageQueue();
    this.eventBus = new AgentEventBus();
  }

  registerAgent(agent: Agent) {
    this.agents.set(agent.id, agent);
    
    // Setup message handling
    agent.onMessage = (message) => {
      this.messageQueue.send(message);
    };

    // Setup event subscriptions
    agent.subscribedEvents.forEach(event => {
      this.eventBus.subscribe(event, (data) => {
        agent.handleEvent(event, data);
      });
    });
  }

  processMessages() {
    this.agents.forEach((agent, id) => {
      const message = this.messageQueue.receive(id);
      if (message) {
        agent.processMessage(message);
      }
    });
  }

  broadcastTask(task: Task) {
    this.eventBus.publish('new-task', {
      task,
      timestamp: Date.now(),
      priority: task.priority
    });
  }
}

// Agent base class met communicatie capabilities
abstract class Agent {
  id: string;
  subscribedEvents: string[] = [];
  onMessage?: (message: AgentMessage) => void;

  constructor(id: string) {
    this.id = id;
  }

  abstract processMessage(message: AgentMessage): void;
  abstract handleEvent(event: string, data: any): void;

  sendMessage(to: string, content: any) {
    if (this.onMessage) {
      this.onMessage({
        from: this.id,
        to,
        type: 'request',
        content,
        timestamp: Date.now()
      });
    }
  }
}
`
    }
  ],
  quiz: {
    id: 'quiz-3-2',
    title: 'Communication Protocols Quiz',
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Wat is het belangrijkste voordeel van event-driven communicatie in multi-agent systemen?',
        options: [
          'Synchrone verwerking',
          'Loose coupling tussen agents',
          'Snellere message delivery',
          'Minder geheugengebruik'
        ],
        correctAnswer: 1,
        explanation: 'Event-driven communicatie zorgt voor loose coupling omdat agents niet direct van elkaar hoeven te weten.'
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: 'Welk protocol is specifiek ontworpen voor agent communicatie?',
        options: [
          'HTTP',
          'WebSocket',
          'FIPA ACL',
          'TCP/IP'
        ],
        correctAnswer: 2,
        explanation: 'FIPA ACL (Foundation for Intelligent Physical Agents - Agent Communication Language) is specifiek ontworpen voor communicatie tussen intelligente agents.'
      }
    ]
  }
};