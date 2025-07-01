// GroeimetAI Platform - Course Data Structure
// Complete cursusaanbod voor GenAI/LLM kennis en automation

// Default Author for GroeimetAI courses
export const DEFAULT_AUTHOR_GROEIMETAI = {
  id: 'groeimetai-default',
  name: 'GroeimetAI Team',
  bio: 'Het GroeimetAI team bestaat uit experts in AI, machine learning en automation. Wij maken geavanceerde AI-technologie toegankelijk voor iedereen.',
  avatar: '/images/authors/groeimetai-team.jpg',
  revenueSharePercentage: 100,
  email: 'info@groeimetai.com',
  expertise: ['AI/ML', 'Automation', 'LLM Development', 'Prompt Engineering', 'No-Code/Low-Code'],
  linkedIn: 'https://linkedin.com/company/groeimetai',
  website: 'https://groeimetai.com',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date()
};

// Default instructor name for GroeimetAI courses
export const DEFAULT_INSTRUCTOR = 'GroeimetAI Team';

// Lesson types voor verschillende content
export interface CodeExample {
  id: string;
  title: string;
  language: string;
  code: string;
  explanation?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  type: 'code' | 'quiz' | 'project';
  initialCode?: string;
  solution?: string;
  tests?: string[];
  hints?: string[];
  checklist?: string[];
}

export interface ModuleProject extends Assignment {
  estimatedTime?: string;
  requirements?: string[];
  deliverables?: string[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  content: string; // Markdown content
  videoUrl?: string;
  codeExamples?: CodeExample[];
  assignments?: Assignment[];
  resources?: { title: string; url: string; type: string }[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  moduleProject?: ModuleProject;
}

// Simplified Course interface for course content modules
export interface Course {
  id: string;
  title: string;
  modules: Module[];
}

export interface CourseData {
  id: string;
  title: string;
  level: 'Beginner' | 'Gevorderd' | 'Expert';
  category: 'Fundamenten' | 'Automation' | 'Development' | 'Praktijk';
  targetAudience: string;
  modules: Module[];
  isLearningPath: boolean;
  pathTitle?: string;
  // Additional properties for complete course data
  description: string;
  duration: string;
  price: number;
  currency: string;
  instructor: string;
  authorId: string; // Author reference
  thumbnailUrl?: string;
  tags: string[];
  prerequisites: string[];
  learningOutcomes: string[];
  // Display properties for course cards
  shortDescription?: string;
  studentsCount?: number;
  rating?: number;
  // ROI and efficiency metrics
  efficiencyGains?: {
    timePerWeek?: string;
    costSavings?: string;
    productivityBoost?: string;
    roi?: string;
  };
  // Course specific settings
  enableIDE?: boolean;
  ideConfig?: {
    defaultLanguage: string;
    availableLanguages: string[];
    defaultImports?: string;
    sandboxEnvironment?: 'python' | 'node' | 'browser';
  };
  // Preview and purchase properties
  previewLessons?: string[]; // Array of lesson IDs that are free to preview
  isPurchased?: boolean; // Calculated field to check if user has purchased course
}

export const courses: CourseData[] = [
  // Categorie 1: Fundamenten van AI & Prompting
  {
    id: 'prompt-engineering',
    title: 'Prompt Engineering - De Essentiële Vaardigheid',
    level: 'Beginner',
    category: 'Fundamenten',
    targetAudience: 'Iedereen die met AI wil beginnen, van marketeers tot managers',
    description: 'Beheers de kunst van het schrijven van effectieve prompts voor AI-systemen. Deze cursus behandelt de fundamentele principes van prompt engineering en leert je hoe je het maximale uit AI-tools haalt.',
    shortDescription: 'Leer de basis van effectieve AI-communicatie',
    duration: '8 uur',
    price: 99,
    currency: 'EUR',
    instructor: DEFAULT_INSTRUCTOR,
    authorId: 'groeimetai',
    thumbnailUrl: '/images/courses/prompt-engineering-hero.jpg',
    tags: ['Prompt Engineering', 'AI Basics', 'ChatGPT', 'Productivity'],
    prerequisites: [],
    studentsCount: 2847,
    rating: 4.9,
    learningOutcomes: [
      'Begrijp hoe Large Language Models werken',
      'Schrijf effectieve prompts voor verschillende doeleinden',
      'Pas zero-shot, few-shot en chain-of-thought technieken toe',
      'Optimaliseer AI-output voor jouw specifieke behoeften'
    ],
    modules: [
      {
        id: 'intro-llm',
        title: 'Introductie tot Large Language Models (LLMs)',
        description: 'Ontdek hoe LLMs werken, hun mogelijkheden en beperkingen',
        lessons: []
      },
      {
        id: 'perfect-prompt',
        title: 'De anatomie van een perfecte prompt',
        description: 'Leer de componenten: Context, Instructie, Persona, en Formaat',
        lessons: []
      },
      {
        id: 'prompt-techniques',
        title: 'Essentiële Prompt Technieken',
        description: 'Beheers Zero-shot, Few-shot, en Chain-of-Thought prompting',
        lessons: []
      },
      {
        id: 'practice-assignments',
        title: 'Praktijkopdrachten',
        description: 'Pas je kennis toe op tekstgeneratie, samenvatten en analyseren',
        lessons: []
      }
    ],
    isLearningPath: false,
    efficiencyGains: {
      timePerWeek: '5-10 uur tijdsbesparing',
      productivityBoost: '2x sneller content creëren',
      roi: 'ROI binnen 1 week'
    },
    enableIDE: true,
    ideConfig: {
      defaultLanguage: 'python',
      availableLanguages: ['python', 'javascript', 'text'],
      defaultImports: `import openai\nimport anthropic\nfrom langchain import LLMChain, PromptTemplate`,
      sandboxEnvironment: 'browser'
    },
    previewLessons: ['intro-llm-lesson-1', 'intro-llm-lesson-2'] // First two lessons are free to preview
  },
  {
    id: 'chatgpt-gemini-masterclass',
    title: 'Masterclass ChatGPT/Gemini voor Professionals',
    level: 'Beginner',
    category: 'Fundamenten',
    targetAudience: 'Professionals die ChatGPT en Gemini willen inzetten voor zakelijke doeleinden',
    description: 'Een diepgaande masterclass over het professioneel gebruik van ChatGPT en Google Gemini. Leer geavanceerde functies, data-analyse, en hoe je Custom GPTs bouwt zonder code.',
    shortDescription: 'Maximaliseer je productiviteit met AI-assistenten',
    duration: '12 uur',
    price: 149,
    currency: 'EUR',
    instructor: DEFAULT_INSTRUCTOR,
    authorId: 'groeimetai',
    thumbnailUrl: '/images/courses/chatgpt-gemini-masterclass-hero.jpg',
    tags: ['ChatGPT', 'Gemini', 'Productivity', 'Custom GPTs'],
    prerequisites: ['Basis computervaardigheden'],
    studentsCount: 1934,
    rating: 4.8,
    learningOutcomes: [
      'Beheers geavanceerde ChatGPT en Gemini functies',
      'Analyseer data met Advanced Data Analysis',
      'Creëer professionele presentaties en rapporten',
      'Bouw je eigen Custom GPT zonder programmeerkennis'
    ],
    modules: [
      {
        id: 'advanced-features',
        title: 'De basis voorbij: geavanceerde functies',
        description: 'Ontdek verborgen features en power-user tips',
        lessons: []
      },
      {
        id: 'data-analysis',
        title: 'Data-analyse met Advanced Data Analysis',
        description: 'Werk met spreadsheets, grafieken en complexe analyses',
        lessons: []
      },
      {
        id: 'presentations-reports',
        title: 'Presentaties, rapporten en visuals',
        description: 'Creëer professionele output met AI-ondersteuning',
        lessons: []
      },
      {
        id: 'custom-gpt',
        title: 'Bouw je eigen Custom GPT',
        description: 'Ontwikkel specifieke AI-assistenten zonder code',
        lessons: []
      }
    ],
    isLearningPath: false,
    efficiencyGains: {
      timePerWeek: '8-12 uur tijdsbesparing',
      costSavings: '€500-1000 per maand aan uitbesteed werk',
      productivityBoost: '3x sneller rapporten en analyses',
      roi: 'ROI binnen 5 dagen'
    }
  },

  // Categorie 2: Automation Platforms (No-Code/Low-Code)
  {
    id: 'n8n-make-basics',
    title: 'De Basis van Automations - N8N/Make',
    level: 'Beginner',
    category: 'Automation',
    targetAudience: 'Ondernemers, marketeers en procesverbeteraars die taken willen automatiseren zonder diep te programmeren',
    description: 'Start je automation journey met N8N of Make. Leer de fundamenten van triggers, acties en het verbinden van apps. Bouw direct 5 cruciale bedrijfsautomations.',
    shortDescription: 'Automatiseer je bedrijfsprocessen zonder code',
    duration: '10 uur',
    price: 199,
    currency: 'EUR',
    instructor: DEFAULT_INSTRUCTOR,
    authorId: 'groeimetai',
    thumbnailUrl: '/images/courses/n8n-make-basics-hero.jpg',
    tags: ['N8N', 'Make', 'Automation', 'No-Code', 'Workflows'],
    prerequisites: [],
    studentsCount: 1456,
    rating: 4.7,
    learningOutcomes: [
      'Begrijp triggers, acties en app-verbindingen',
      'Bouw 5 essentiële bedrijfsautomations',
      'Automatiseer repetitieve taken',
      'Integreer populaire tools en platforms'
    ],
    modules: [
      {
        id: 'triggers-actions',
        title: 'Introductie tot triggers en acties',
        description: 'De bouwstenen van elke automation begrijpen',
        lessons: []
      },
      {
        id: 'app-connections',
        title: 'Apps verbinden en data doorsturen',
        description: 'Leer verschillende platforms naadloos te integreren',
        lessons: []
      },
      {
        id: 'business-automations',
        title: '5 Cruciale bedrijfsautomations',
        description: 'Mail-naar-taak, formulier-naar-CRM, en meer praktische flows',
        lessons: []
      },
      {
        id: 'troubleshooting',
        title: 'Troubleshooting en best practices',
        description: 'Los problemen op en optimaliseer je workflows',
        lessons: []
      }
    ],
    isLearningPath: true,
    pathTitle: 'N8N/Make - Van Idee tot Autopilot',
    efficiencyGains: {
      timePerWeek: '10-15 uur automatisering van handwerk',
      costSavings: '€1000-2500 per maand aan arbeidskosten',
      productivityBoost: '5x sneller repetitieve taken',
      roi: 'ROI binnen 2 weken'
    }
  },
  {
    id: 'advanced-workflows-ai',
    title: 'Geavanceerde Workflows & AI-integraties',
    level: 'Gevorderd',
    category: 'Automation',
    targetAudience: 'Automation professionals die complexe workflows willen bouwen met AI-integraties',
    description: 'Til je automations naar een hoger niveau met conditionele logica, data-manipulatie en AI-koppelingen. Leer N8N/Make te verbinden met OpenAI voor intelligente workflows.',
    shortDescription: 'Bouw intelligente workflows met AI-integraties',
    duration: '15 uur',
    price: 299,
    currency: 'EUR',
    instructor: DEFAULT_INSTRUCTOR,
    authorId: 'groeimetai',
    thumbnailUrl: '/images/courses/advanced-workflows-ai-hero.jpg',
    tags: ['Advanced Automation', 'AI Integration', 'OpenAI', 'Complex Workflows'],
    prerequisites: ['De Basis van Automations cursus', 'Basis API kennis'],
    studentsCount: 892,
    rating: 4.8,
    learningOutcomes: [
      'Implementeer conditionele logica met routers en filters',
      'Manipuleer en transformeer complexe data',
      'Integreer OpenAI API voor slimme automations',
      'Bouw schaalbare en onderhoudbare workflows'
    ],
    modules: [
      {
        id: 'conditional-logic',
        title: 'Conditionele logica en beslisbomen',
        description: 'Werk met routers, filters en complexe condities',
        lessons: []
      },
      {
        id: 'data-manipulation',
        title: 'Data-manipulatie en transformatie',
        description: 'Geavanceerde technieken voor data processing',
        lessons: []
      },
      {
        id: 'openai-integration',
        title: 'OpenAI API integratie',
        description: 'Koppel N8N/Make aan AI voor intelligente verrijking',
        lessons: []
      },
      {
        id: 'scheduling-error-handling',
        title: 'Scheduling en error handling',
        description: 'Automatisch plannen en foutafhandeling',
        lessons: []
      }
    ],
    isLearningPath: true,
    pathTitle: 'N8N/Make - Van Idee tot Autopilot',
    efficiencyGains: {
      timePerWeek: '20-30 uur door intelligente automation',
      costSavings: '€2500-5000 per maand',
      productivityBoost: '10x efficiëntie bij complexe processen',
      roi: 'ROI binnen 10 dagen'
    }
  },
  {
    id: 'webhooks-apis-mastery',
    title: 'Werken met Webhooks & APIs',
    level: 'Gevorderd',
    category: 'Automation',
    targetAudience: 'Tech-savvy professionals die custom integraties willen bouwen',
    description: 'Beheers de kunst van webhooks en API-integraties. Leer data te ontvangen en versturen, en bouw custom koppelingen met platforms zonder standaard integraties.',
    shortDescription: 'Custom integraties bouwen met webhooks & APIs',
    duration: '12 uur',
    price: 249,
    currency: 'EUR',
    instructor: DEFAULT_INSTRUCTOR,
    authorId: 'groeimetai',
    thumbnailUrl: '/images/courses/webhooks-apis-hero.jpg',
    tags: ['Webhooks', 'APIs', 'Custom Integration', 'Technical'],
    prerequisites: ['Basis HTTP kennis', 'JSON begrip'],
    studentsCount: 654,
    rating: 4.6,
    learningOutcomes: [
      'Configureer en gebruik webhooks effectief',
      'Werk met verschillende API authenticatie methodes',
      'Parse en transformeer API responses',
      'Bouw custom integraties voor elk platform'
    ],
    modules: [
      {
        id: 'webhooks-fundamentals',
        title: 'Webhooks fundamenten',
        description: 'Ontvang real-time data van externe systemen',
        lessons: []
      },
      {
        id: 'api-authentication',
        title: 'API authenticatie en security',
        description: 'OAuth, API keys, en veilige verbindingen',
        lessons: []
      },
      {
        id: 'data-parsing',
        title: 'Data parsing en transformatie',
        description: 'Werk met JSON, XML en andere formaten',
        lessons: []
      },
      {
        id: 'custom-integration',
        title: 'Custom platform integratie',
        description: 'Bouw een koppeling met een platform zonder standaard integratie',
        lessons: []
      }
    ],
    isLearningPath: true,
    pathTitle: 'N8N/Make - Van Idee tot Autopilot',
    efficiencyGains: {
      timePerWeek: '15-20 uur door custom integraties',
      costSavings: '€2000-4000 aan development kosten',
      productivityBoost: 'Onbeperkte integratiemogelijkheden',
      roi: 'ROI binnen 1 project'
    }
  },
  {
    id: 'blockchain-fundamentals',
    title: 'Blockchain Fundamentals voor Developers',
    level: 'Gevorderd',
    category: 'Development',
    targetAudience: 'Developers die blockchain technologie willen begrijpen en toepassen',
    description: 'Leer de fundamenten van blockchain technologie, smart contracts, en Web3 development. Van consensus mechanismen tot het bouwen van DApps.',
    shortDescription: 'Master blockchain development van concept tot implementatie',
    duration: '20 uur',
    price: 399,
    currency: 'EUR',
    instructor: DEFAULT_INSTRUCTOR,
    authorId: 'groeimetai',
    thumbnailUrl: '/images/courses/blockchain-fundamentals-hero.jpg',
    tags: ['Blockchain', 'Smart Contracts', 'Web3', 'Ethereum', 'DApps'],
    prerequisites: ['JavaScript kennis', 'Basis programmeer ervaring'],
    studentsCount: 892,
    rating: 4.8,
    previewLessons: ['wat-is-blockchain', 'ethereum-ecosystem'],
    learningOutcomes: [
      'Begrijp blockchain technologie en consensus mechanismen',
      'Schrijf veilige smart contracts in Solidity',
      'Ontwikkel Web3 applicaties met moderne tools',
      'Bouw je eigen DApps en DeFi applicaties'
    ],
    modules: [
      {
        id: 'blockchain-basics',
        title: 'Blockchain Fundamentals',
        description: 'Begrijp de core concepten van blockchain technologie',
        lessons: []
      },
      {
        id: 'consensus-mechanisms',
        title: 'Consensus Mechanismen',
        description: 'Proof of Work, Proof of Stake, en andere consensus protocollen',
        lessons: []
      },
      {
        id: 'smart-contracts',
        title: 'Smart Contracts met Solidity',
        description: 'Schrijf, test en deploy veilige smart contracts',
        lessons: []
      },
      {
        id: 'web3-development',
        title: 'Web3 Development',
        description: 'Bouw DApps met Web3.js, Ethers.js en moderne tools',
        lessons: []
      },
      {
        id: 'defi-dapps',
        title: 'DeFi en DApp Development',
        description: 'Ontwikkel decentralized finance applicaties',
        lessons: []
      }
    ],
    isLearningPath: false,
    efficiencyGains: {
      timePerWeek: '10-15 uur development tijd',
      costSavings: '€5000-10000 aan blockchain consultant kosten',
      productivityBoost: 'Direct blockchain projecten kunnen starten',
      roi: 'ROI binnen eerste blockchain project'
    }
  },

  // Categorie 3: AI Development & Agents (Premium)
  {
    id: 'claude-simple-setup',
    title: 'Claude: Opzetten en Simpel Gebruiken',
    level: 'Beginner',
    category: 'Development',
    targetAudience: 'Developers en tech professionals die willen starten met Claude',
    description: 'Ontdek het Claude platform, leer de juiste modellen kiezen en schrijf effectieve prompts. De perfecte start voor je Claude journey.',
    shortDescription: 'Start je Claude AI development journey',
    duration: '8 uur',
    price: 299,
    currency: 'EUR',
    instructor: DEFAULT_INSTRUCTOR,
    authorId: 'groeimetai',
    thumbnailUrl: '/images/courses/claude-simple-setup-hero.jpg',
    tags: ['Claude', 'AI Development', 'Getting Started'],
    prerequisites: ['Basis programmeerkennis'],
    studentsCount: 567,
    rating: 4.9,
    learningOutcomes: [
      'Begrijp het Claude ecosysteem',
      'Kies het juiste model voor jouw use case',
      'Schrijf geoptimaliseerde Claude prompts',
      'Implementeer basis Claude integraties'
    ],
    modules: [
      {
        id: 'claude-platform',
        title: 'Het Claude platform begrijpen',
        description: 'Overzicht van modellen, capabilities en use cases',
        lessons: []
      },
      {
        id: 'model-selection',
        title: 'Model selectie en configuratie',
        description: 'Wanneer gebruik je Opus, Sonnet of Haiku?',
        lessons: []
      },
      {
        id: 'claude-prompts',
        title: 'Effectieve Claude prompts',
        description: 'Specifieke technieken voor Claude modellen',
        lessons: []
      },
      {
        id: 'first-integration',
        title: 'Eerste integratie bouwen',
        description: 'Implementeer Claude in je applicatie',
        lessons: []
      }
    ],
    isLearningPath: true,
    pathTitle: 'Claude - Van Tool naar AI Workforce',
    efficiencyGains: {
      timePerWeek: '20-30 uur development tijd',
      costSavings: '€3000-5000 per maand aan dev kosten',
      productivityBoost: '5x sneller prototypes bouwen',
      roi: 'ROI binnen 1 week'
    }
  },
  {
    id: 'claude-code-commands',
    title: 'Claude Code: Codebases & Commands',
    level: 'Gevorderd',
    category: 'Development',
    targetAudience: 'Senior developers die Claude willen gebruiken voor complexe development taken',
    description: 'Leer Claude Code te gebruiken voor het analyseren, debuggen en verbeteren van complete codebases. Master custom commands en de workbench voor maximale productiviteit.',
    shortDescription: 'Ontwikkel 10x sneller met Claude Code',
    duration: '16 uur',
    price: 599,
    currency: 'EUR',
    instructor: DEFAULT_INSTRUCTOR,
    authorId: 'groeimetai',
    thumbnailUrl: '/images/courses/claude-code-mastery-hero.jpg',
    tags: ['Claude Code', 'Advanced Development', 'Code Analysis', 'Productivity'],
    prerequisites: ['Claude basis cursus', 'Ervaring met software development'],
    studentsCount: 423,
    rating: 4.9,
    learningOutcomes: [
      'Analyseer complete codebases met Claude',
      'Debug complexe issues met AI-assistentie',
      'Refactor en optimaliseer code automatisch',
      'Bouw custom commands voor repetitieve taken'
    ],
    modules: [
      {
        id: 'claude-code-deepdive',
        title: 'Claude Code deep dive',
        description: 'Alle features en mogelijkheden van Claude Code',
        lessons: []
      },
      {
        id: 'codebase-analysis',
        title: 'Codebase analyse en understanding',
        description: 'Laat Claude je codebase begrijpen en documenteren',
        lessons: []
      },
      {
        id: 'ai-debugging',
        title: 'AI-powered debugging en testing',
        description: 'Vind en fix bugs sneller dan ooit',
        lessons: []
      },
      {
        id: 'custom-commands',
        title: 'Custom commands en workbench mastery',
        description: 'Automatiseer je development workflow',
        lessons: []
      }
    ],
    isLearningPath: true,
    pathTitle: 'Claude - Van Tool naar AI Workforce',
    efficiencyGains: {
      timePerWeek: '30-40 uur development tijd',
      costSavings: '€5000-10000 per maand (vervangt 1-2 developers)',
      productivityBoost: '10x output van een senior developer',
      roi: 'ROI binnen 3 dagen'
    }
  },
  {
    id: 'claude-flow-ai-swarming',
    title: 'Claude Flow: AI Swarming in de Praktijk',
    level: 'Expert',
    category: 'Development',
    targetAudience: 'CTOs, Tech Leads en AI Architects die schaalbare AI-systemen willen bouwen',
    description: 'Master het concept van Agentic Swarming met Claude Flow. Leer teams van AI-agents te orchestreren voor complexe taken zoals marktanalyse, product development en meer.',
    shortDescription: 'Orchestreer AI agent teams voor complexe taken',
    duration: '24 uur',
    price: 999,
    currency: 'EUR',
    instructor: DEFAULT_INSTRUCTOR,
    authorId: 'groeimetai',
    thumbnailUrl: '/images/courses/claude-flow-swarming-hero.jpg',
    tags: ['Claude Flow', 'AI Swarming', 'Multi-Agent Systems', 'Advanced AI'],
    prerequisites: ['Claude Code cursus', 'Ervaring met systeem architectuur'],
    studentsCount: 234,
    rating: 5.0,
    learningOutcomes: [
      'Ontwerp multi-agent AI systemen',
      'Implementeer Claude Flow voor team orchestratie',
      'Bouw schaalbare AI swarms voor complexe taken',
      'Monitor en optimaliseer agent performance'
    ],
    modules: [
      {
        id: 'agentic-swarming',
        title: 'Concept van Agentic Swarming',
        description: 'Theorie en praktijk van multi-agent systemen',
        lessons: []
      },
      {
        id: 'claude-flow-architecture',
        title: 'Claude Flow architectuur',
        description: 'Ontwerp patterns voor AI agent teams',
        lessons: []
      },
      {
        id: 'market-analysis-swarm',
        title: 'Praktijk: Marktanalyse met AI Swarm',
        description: 'Bouw een team van specialized research agents',
        lessons: []
      },
      {
        id: 'scaling-monitoring',
        title: 'Scaling en monitoring',
        description: 'Productie-ready AI swarm systemen',
        lessons: []
      }
    ],
    isLearningPath: true,
    pathTitle: 'Claude - Van Tool naar AI Workforce',
    efficiencyGains: {
      timePerWeek: '50+ uur aan complex analytical werk',
      costSavings: '€10000-25000 per maand (vervangt heel team)',
      productivityBoost: '50x throughput voor complexe taken',
      roi: 'ROI binnen 1 groot project'
    }
  },
  {
    id: 'langchain-basics',
    title: 'LangChain - De Basis',
    level: 'Gevorderd',
    category: 'Development',
    targetAudience: 'Python developers die LLM-applicaties willen bouwen',
    description: 'Start met LangChain, het leading framework voor LLM-applicaties. Leer de kernconcepten en bouw je eerste LLM-keten in Python.',
    shortDescription: 'Bouw LLM-applicaties met Python',
    duration: '14 uur',
    price: 399,
    currency: 'EUR',
    instructor: DEFAULT_INSTRUCTOR,
    authorId: 'groeimetai',
    thumbnailUrl: '/images/courses/langchain-basics-hero.jpg',
    tags: ['LangChain', 'Python', 'LLM Development', 'AI Applications'],
    prerequisites: ['Python programmeerervaring', 'Basis AI kennis'],
    studentsCount: 789,
    rating: 4.7,
    learningOutcomes: [
      'Beheers LangChain kernconcepten',
      'Werk met Models, Prompt Templates en Output Parsers',
      'Bouw je eerste LLM-keten',
      'Integreer verschillende LLM providers'
    ],
    modules: [
      {
        id: 'langchain-fundamentals',
        title: 'LangChain fundamenten',
        description: 'Models, prompts, chains en agents',
        lessons: []
      },
      {
        id: 'prompt-templates',
        title: 'Prompt Templates en Output Parsers',
        description: 'Structureer je LLM interacties',
        lessons: []
      },
      {
        id: 'chains-processing',
        title: 'Chains en sequential processing',
        description: 'Bouw complexe LLM workflows',
        lessons: []
      },
      {
        id: 'first-llm-app',
        title: 'Je eerste LLM applicatie',
        description: 'Complete implementatie van idee tot deployment',
        lessons: []
      }
    ],
    isLearningPath: true,
    pathTitle: 'LangChain & CrewAI - Bouw je Eigen AI Agents',
    efficiencyGains: {
      timePerWeek: '25-35 uur development tijd',
      costSavings: '€4000-7000 aan development kosten',
      productivityBoost: '8x sneller LLM apps bouwen',
      roi: 'ROI binnen eerste applicatie'
    }
  },
  {
    id: 'rag-knowledge-base',
    title: 'Jouw Data als Kennisbank (RAG)',
    level: 'Expert',
    category: 'Development',
    targetAudience: 'AI engineers die eigen data willen ontsluiten via AI',
    description: 'Master Retrieval-Augmented Generation (RAG). Bouw een chatbot die antwoorden geeft op basis van jouw eigen documenten, PDFs en databases.',
    shortDescription: 'Ontsluit je eigen data met AI',
    duration: '20 uur',
    price: 599,
    currency: 'EUR',
    instructor: DEFAULT_INSTRUCTOR,
    authorId: 'groeimetai',
    thumbnailUrl: '/images/courses/rag-knowledge-systems-hero.jpg',
    tags: ['RAG', 'Vector Databases', 'Knowledge Management', 'Advanced AI'],
    prerequisites: ['LangChain basis', 'Database kennis'],
    studentsCount: 456,
    rating: 4.8,
    learningOutcomes: [
      'Begrijp RAG architectuur en componenten',
      'Implementeer vector databases',
      'Bouw document processing pipelines',
      'Creëer intelligente Q&A systemen'
    ],
    modules: [
      {
        id: 'rag-theory',
        title: 'Hoe werkt Retrieval-Augmented Generation?',
        description: 'Theorie en architectuur van RAG systemen',
        lessons: []
      },
      {
        id: 'vector-databases',
        title: 'Vector databases en embeddings',
        description: 'Chromadb, Pinecone en embedding strategies',
        lessons: []
      },
      {
        id: 'document-processing',
        title: 'Document processing pipeline',
        description: 'Van PDF naar searchable knowledge',
        lessons: []
      },
      {
        id: 'business-chatbot',
        title: 'Bouw een bedrijfs-chatbot',
        description: 'Complete RAG implementatie voor je organisatie',
        lessons: []
      }
    ],
    isLearningPath: true,
    pathTitle: 'LangChain & CrewAI - Bouw je Eigen AI Agents',
    efficiencyGains: {
      timePerWeek: '30-40 uur aan manual search & research',
      costSavings: '€5000-10000 aan knowledge management',
      productivityBoost: 'Instant toegang tot alle bedrijfskennis',
      roi: 'ROI binnen 2 weken'
    }
  },
  {
    id: 'crewai-agent-teams',
    title: 'CrewAI - Laat AI Agents Samenwerken',
    level: 'Expert',
    category: 'Development',
    targetAudience: 'AI architects die autonome agent teams willen bouwen',
    description: 'Leer CrewAI gebruiken om teams van gespecialiseerde AI agents te bouwen. Creëer een autonoom AI-marketingteam dat complete campagnes opzet.',
    shortDescription: 'Bouw autonome AI agent teams',
    duration: '24 uur',
    price: 799,
    currency: 'EUR',
    instructor: DEFAULT_INSTRUCTOR,
    authorId: 'groeimetai',
    thumbnailUrl: '/images/courses/crewai-agent-teams-hero.jpg',
    tags: ['CrewAI', 'Multi-Agent', 'Autonomous AI', 'Advanced Development'],
    prerequisites: ['LangChain kennis', 'Python gevorderd'],
    studentsCount: 312,
    rating: 4.9,
    learningOutcomes: [
      'Definieer agents met specifieke rollen en tools',
      'Orchestreer agent samenwerking',
      'Implementeer autonomous decision making',
      'Bouw production-ready agent teams'
    ],
    modules: [
      {
        id: 'crewai-deepdive',
        title: 'CrewAI framework deep dive',
        description: 'Agents, tasks, tools en crews',
        lessons: []
      },
      {
        id: 'agent-roles',
        title: 'Agent rollen en specialisaties',
        description: 'Ontwerp effectieve agent personas',
        lessons: []
      },
      {
        id: 'tools-integrations',
        title: 'Tools en integraties',
        description: 'Geef agents de juiste capabilities',
        lessons: []
      },
      {
        id: 'ai-marketing-team',
        title: 'Bouw een AI-marketingteam',
        description: 'Analist, copywriter en social media manager agents',
        lessons: []
      }
    ],
    isLearningPath: true,
    pathTitle: 'LangChain & CrewAI - Bouw je Eigen AI Agents',
    efficiencyGains: {
      timePerWeek: '40-60 uur aan team taken',
      costSavings: '€8000-15000 per maand (vervangt junior team)',
      productivityBoost: '24/7 autonomous operation',
      roi: 'ROI binnen 1 week'
    }
  },

  // Categorie 4: AI in de Praktijk
  {
    id: 'ai-marketing-content',
    title: 'AI voor Marketing & Content Creatie',
    level: 'Beginner',
    category: 'Praktijk',
    targetAudience: 'Marketeers, content creators en social media managers',
    description: 'Transformeer je marketing met AI. Leer automatisch content genereren, SEO optimaliseren en complete campagnes opzetten met AI-tools.',
    shortDescription: 'Revolutioneer je marketing met AI',
    duration: '10 uur',
    price: 149,
    currency: 'EUR',
    instructor: DEFAULT_INSTRUCTOR,
    authorId: 'groeimetai',
    thumbnailUrl: '/images/courses/ai-marketing-content-hero.jpg',
    tags: ['Marketing', 'Content Creation', 'SEO', 'Social Media'],
    prerequisites: [],
    studentsCount: 2156,
    rating: 4.8,
    learningOutcomes: [
      'Genereer social media content op schaal',
      'Schrijf SEO-geoptimaliseerde blogs met AI',
      'Creëer complete email campagnes',
      'Analyseer en optimaliseer content performance'
    ],
    modules: [
      {
        id: 'ai-content-basics',
        title: 'AI Content Generation Basics',
        description: 'Van idee naar publicatie-klare content',
        lessons: []
      },
      {
        id: 'social-media-automation',
        title: 'Social Media op Autopilot',
        description: 'Plan en genereer maanden aan content vooruit',
        lessons: []
      },
      {
        id: 'seo-optimization',
        title: 'SEO-analyse en optimalisatie',
        description: 'Rank hoger met AI-powered SEO',
        lessons: []
      },
      {
        id: 'campaign-automation',
        title: 'Campaign automation',
        description: 'Complete marketing flows met AI',
        lessons: []
      }
    ],
    isLearningPath: false,
    efficiencyGains: {
      timePerWeek: '15-20 uur content creatie',
      costSavings: '€1500-3000 aan content kosten',
      productivityBoost: '10x meer content output',
      roi: 'ROI binnen 1 week'
    }
  },
  {
    id: 'ai-customer-service-bot',
    title: 'Bouw je Eigen AI Klantenservice Bot',
    level: 'Gevorderd',
    category: 'Praktijk',
    targetAudience: 'Customer service managers en business owners',
    description: 'Creëer een intelligente klantenservice bot met platforms zoals Voiceflow of Botpress. Integreer met je kennisbank voor accurate antwoorden.',
    shortDescription: 'Automatiseer customer support met AI',
    duration: '16 uur',
    price: 299,
    currency: 'EUR',
    instructor: DEFAULT_INSTRUCTOR,
    authorId: 'groeimetai',
    thumbnailUrl: '/images/courses/ai-customer-service-bot-hero.jpg',
    tags: ['Customer Service', 'Chatbots', 'Voiceflow', 'Automation'],
    prerequisites: ['Basis automation kennis'],
    studentsCount: 967,
    rating: 4.7,
    learningOutcomes: [
      'Design conversational flows',
      'Implementeer natural language understanding',
      'Integreer met CRM en kennisbanken',
      'Monitor en verbeter bot performance'
    ],
    modules: [
      {
        id: 'chatbot-design',
        title: 'Chatbot design principles',
        description: 'User experience en conversation design',
        lessons: []
      },
      {
        id: 'platform-selection',
        title: 'Platform keuze: Voiceflow vs Botpress',
        description: 'Selecteer de juiste tool voor jouw use case',
        lessons: []
      },
      {
        id: 'knowledge-integration',
        title: 'Kennisbank integratie',
        description: 'Verbind je bot met bestaande documentatie',
        lessons: []
      },
      {
        id: 'launch-optimization',
        title: 'Launch en optimalisatie',
        description: 'Deploy, monitor en continuous improvement',
        lessons: []
      }
    ],
    isLearningPath: false,
    efficiencyGains: {
      timePerWeek: '30-40 uur aan support tickets',
      costSavings: '€3000-6000 per maand aan support kosten',
      productivityBoost: '24/7 beschikbaarheid',
      roi: 'ROI binnen 2 weken'
    }
  },
  {
    id: 'ai-data-analysis-beginners',
    title: 'Data-analyse voor Beginners met AI',
    level: 'Beginner',
    category: 'Praktijk',
    targetAudience: 'Business analysts, managers en iedereen die met data werkt',
    description: 'Analyseer Excel en CSV bestanden met natuurlijke taal. Geen formules meer nodig - laat AI je data analyseren en visualiseren.',
    shortDescription: 'Data-analyse zonder technische kennis',
    duration: '8 uur',
    price: 129,
    currency: 'EUR',
    instructor: DEFAULT_INSTRUCTOR,
    authorId: 'groeimetai',
    thumbnailUrl: '/images/courses/data-analysis-ai-hero.jpg',
    tags: ['Data Analysis', 'Excel', 'Visualization', 'Business Intelligence'],
    prerequisites: ['Basis Excel kennis'],
    studentsCount: 3421,
    rating: 4.9,
    learningOutcomes: [
      'Analyseer data met natuurlijke taal queries',
      'Genereer automatische insights',
      'Creëer professionele visualisaties',
      'Bouw interactive dashboards'
    ],
    modules: [
      {
        id: 'ai-analysis-tools',
        title: 'AI-powered data analysis tools',
        description: 'Overview van beschikbare platforms',
        lessons: []
      },
      {
        id: 'excel-to-insights',
        title: 'Van Excel naar Insights',
        description: 'Upload, vraag, en begrijp je data',
        lessons: []
      },
      {
        id: 'ai-visualization',
        title: 'Visualisatie met AI',
        description: 'Automatisch de juiste grafieken genereren',
        lessons: []
      },
      {
        id: 'reporting-storytelling',
        title: 'Reporting en storytelling',
        description: 'Communiceer insights effectief',
        lessons: []
      }
    ],
    isLearningPath: false,
    efficiencyGains: {
      timePerWeek: '10-15 uur aan manual analysis',
      costSavings: '€1000-2500 aan analyst tijd',
      productivityBoost: '5x sneller insights genereren',
      roi: 'ROI binnen 3 dagen'
    }
  },
  {
    id: 'blockchain-fake-news-prevention',
    title: 'Blockchain tegen Fake News - Verificatie Systemen',
    level: 'Gevorderd',
    category: 'Praktijk',
    targetAudience: 'Journalisten, fact-checkers, en content verificatie professionals',
    description: 'Leer hoe blockchain technologie ingezet kan worden om de authenticiteit van nieuws en content te garanderen. Bouw verificatiesystemen die niet te manipuleren zijn.',
    shortDescription: 'Garandeer content authenticiteit met blockchain',
    duration: '12 uur',
    price: 249,
    currency: 'EUR',
    instructor: DEFAULT_INSTRUCTOR,
    authorId: 'groeimetai',
    thumbnailUrl: '/images/courses/blockchain-fake-news-hero.jpg',
    tags: ['Blockchain', 'Fake News', 'Verification', 'Web3'],
    prerequisites: ['Basis blockchain begrip', 'Interesse in media integriteit'],
    studentsCount: 543,
    rating: 4.6,
    learningOutcomes: [
      'Begrijp blockchain verificatie principes',
      'Implementeer content hashing en timestamping',
      'Bouw een proof-of-authenticity systeem',
      'Integreer met bestaande publishing platforms'
    ],
    modules: [
      {
        id: 'blockchain-basics',
        title: 'Blockchain basics voor content verificatie',
        description: 'Immutability, consensus, en trust',
        lessons: []
      },
      {
        id: 'content-hashing',
        title: 'Content hashing en digital signatures',
        description: 'Technische implementatie van verificatie',
        lessons: []
      },
      {
        id: 'decentralized-verification',
        title: 'Decentralized content verification',
        description: 'Bouw een werkend verificatie systeem',
        lessons: []
      },
      {
        id: 'media-integration',
        title: 'Integratie met media platforms',
        description: 'Praktische implementatie voor publishers',
        lessons: []
      }
    ],
    isLearningPath: false,
    efficiencyGains: {
      timePerWeek: '5-10 uur aan fact-checking',
      costSavings: '€2000-4000 aan verificatie kosten',
      productivityBoost: 'Instant content verificatie',
      roi: 'Onbetaalbare reputatie bescherming'
    }
  }
];

// Helper functions voor course data manipulatie
export const getCourseById = (id: string): CourseData | undefined => {
  return courses.find(course => course.id === id);
};

export const getCoursesByCategory = (category: CourseData['category']): CourseData[] => {
  return courses.filter(course => course.category === category);
};

export const getCoursesByLevel = (level: CourseData['level']): CourseData[] => {
  return courses.filter(course => course.level === level);
};

export const getLearningPaths = (): CourseData[] => {
  return courses.filter(course => course.isLearningPath);
};

export const getCoursesForBeginners = (): CourseData[] => {
  return courses.filter(course => course.level === 'Beginner');
};

export const getPremiumCourses = (): CourseData[] => {
  return courses.filter(course => course.price >= 500);
};

export const getCoursesByPriceRange = (min: number, max: number): CourseData[] => {
  return courses.filter(course => course.price >= min && course.price <= max);
};

// Helper function voor het groeperen van cursussen per categorie
export const getAllCoursesByCategory = () => {
  const categories: CourseData['category'][] = ['Fundamenten', 'Automation', 'Development', 'Praktijk'];
  
  return categories.map(category => ({
    category,
    courses: courses.filter(course => course.category === category),
    description: getCategoryDescription(category)
  }));
};

// Helper function voor categorie beschrijvingen
const getCategoryDescription = (category: CourseData['category']): string => {
  const descriptions = {
    'Fundamenten': 'Start je AI-reis met essentiële kennis over prompting, ChatGPT en AI-tools',
    'Automation': 'Automatiseer bedrijfsprocessen met no-code/low-code platforms zoals N8N en Make',
    'Development': 'Bouw geavanceerde AI-applicaties met Claude, LangChain en multi-agent systemen',
    'Praktijk': 'Pas AI direct toe in marketing, customer service, data-analyse en meer'
  };
  return descriptions[category] || '';
};

export const getCategories = (): CourseData['category'][] => {
  return Array.from(new Set(courses.map(course => course.category)));
};

export const getLevels = (): CourseData['level'][] => {
  return Array.from(new Set(courses.map(course => course.level)));
};

// Statistieken functies
export const getCourseStatistics = () => {
  return {
    totalCourses: courses.length,
    totalStudents: courses.reduce((sum, course) => sum + (course.studentsCount || 0), 0),
    averageRating: courses.reduce((sum, course) => sum + (course.rating || 0), 0) / courses.length,
    priceRange: {
      min: Math.min(...courses.map(c => c.price)),
      max: Math.max(...courses.map(c => c.price))
    },
    categoryCounts: getCategories().map(cat => ({
      category: cat,
      count: getCoursesByCategory(cat).length
    }))
  };
};

// Export default courses array
export default courses;