import { Question } from '@/components/Quiz';
import { Challenge } from '@/components/LiveCoding';

// Quiz questions for lesson 1-1
export const lesson1_1Quiz: Question[] = [
  {
    id: 'q1',
    type: 'multiple-choice',
    question: 'Welk o3 model is het beste voor dagelijkse taken met snelle responstijden?',
    options: [
      'o3-pro - voor maximale intelligentie',
      'o3-mini - voor snelle intelligentie',
      'o3 - de gouden standaard',
      'Alle modellen zijn even snel'
    ],
    correctAnswer: 'o3-mini - voor snelle intelligentie',
    explanation: 'o3-mini is geoptimaliseerd voor snelheid (2-5 seconden responstijd) en is ideaal voor dagelijkse taken zoals email drafts en basis data-analyse.',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'q2',
    type: 'multiple-choice',
    question: 'Wat is het context window voor alle o3 modellen?',
    options: [
      '32K tokens',
      '64K tokens',
      '128K tokens',
      '256K tokens'
    ],
    correctAnswer: '128K tokens',
    explanation: 'Alle o3 modellen (mini, standaard, en pro) hebben een context window van 128K tokens, wat ruimte biedt voor uitgebreide conversaties en documenten.',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'q3',
    type: 'drag-drop',
    question: 'Rangschik de o3 modellen van snelste naar langzaamste responstijd:',
    items: [
      { id: 'mini', content: 'o3-mini (2-5 seconden)' },
      { id: 'standard', content: 'o3 (10-30 seconden)' },
      { id: 'pro', content: 'o3-pro (1-5 minuten)' }
    ],
    correctOrder: ['mini', 'standard', 'pro'],
    explanation: 'De modellen zijn gerangschikt op snelheid versus intelligentie: o3-mini is het snelst, o3 biedt een goede balans, en o3-pro levert maximale intelligentie maar heeft meer tijd nodig.',
    points: 15,
    difficulty: 'medium'
  },
  {
    id: 'q4',
    type: 'multiple-choice',
    question: 'Voor welke taak zou je o3-pro kiezen boven o3-mini?',
    options: [
      'Het schrijven van een eenvoudige email',
      'Het oplossen van complexe wiskundige problemen',
      'Het genereren van een shopping lijst',
      'Het beantwoorden van basis vragen'
    ],
    correctAnswer: 'Het oplossen van complexe wiskundige problemen',
    explanation: 'o3-pro is ontworpen voor complexe taken zoals onderzoek, wiskunde en architectuur design waar maximale intelligentie vereist is.',
    points: 15,
    difficulty: 'medium'
  },
  {
    id: 'q5',
    type: 'code-completion',
    question: 'Schrijf een Python functie die het juiste o3 model selecteert op basis van de taak complexiteit (1-10 schaal):',
    codeTemplate: `def select_o3_model(complexity_score):
    """
    Selecteer het juiste o3 model op basis van complexiteit.
    
    Args:
        complexity_score (int): Complexiteit van 1-10
        
    Returns:
        str: Aanbevolen model naam
    """
    # Schrijf je code hier
    pass`,
    testCases: [
      { input: '2', expectedOutput: 'o3-mini' },
      { input: '5', expectedOutput: 'o3' },
      { input: '9', expectedOutput: 'o3-pro' }
    ],
    hint: 'Gebruik if-elif statements om te checken: 1-3 = mini, 4-7 = standaard, 8-10 = pro',
    explanation: 'Deze functie helpt automatisch het juiste model te kiezen op basis van de complexiteit van de taak.',
    points: 20,
    difficulty: 'hard'
  }
];

// Coding challenges for lesson 1-1
export const lesson1_1Challenges: Challenge[] = [
  {
    id: 'challenge-1',
    title: 'Model Cost Calculator',
    description: 'Bouw een calculator die de maandelijkse kosten berekent voor het gebruik van verschillende o3 modellen op basis van gebruik patronen.',
    difficulty: 'medium',
    category: 'Implementation',
    timeLimit: 600, // 10 minutes
    starterCode: {
      javascript: `// Model pricing information
const modelPricing = {
  'o3-mini': { monthlyBase: 20, included: true },
  'o3': { monthlyBase: 20, included: true },
  'o3-pro': { monthlyBase: 200, included: false }
};

function calculateMonthlyCost(modelUsage) {
  // modelUsage is an object like:
  // { 'o3-mini': 50, 'o3': 30, 'o3-pro': 20 }
  // where values are percentage of usage
  
  // TODO: Calculate total monthly cost
  // Return the total cost and breakdown
}`,
      python: `# Model pricing information
model_pricing = {
    'o3-mini': {'monthly_base': 20, 'included': True},
    'o3': {'monthly_base': 20, 'included': True},
    'o3-pro': {'monthly_base': 200, 'included': False}
}

def calculate_monthly_cost(model_usage):
    """
    Calculate monthly cost based on model usage.
    
    Args:
        model_usage (dict): Usage percentage per model
        
    Returns:
        dict: Total cost and breakdown
    """
    # TODO: Implement cost calculation
    pass`
    },
    testCases: [
      {
        id: 'tc1',
        input: { 'o3-mini': 100, 'o3': 0, 'o3-pro': 0 },
        expectedOutput: { total: 20, breakdown: { 'ChatGPT Plus': 20 } },
        description: 'Only o3-mini usage'
      },
      {
        id: 'tc2',
        input: { 'o3-mini': 0, 'o3': 0, 'o3-pro': 100 },
        expectedOutput: { total: 200, breakdown: { 'ChatGPT Pro': 200 } },
        description: 'Only o3-pro usage'
      },
      {
        id: 'tc3',
        input: { 'o3-mini': 50, 'o3': 30, 'o3-pro': 20 },
        expectedOutput: { total: 220, breakdown: { 'ChatGPT Plus': 20, 'ChatGPT Pro': 200 } },
        description: 'Mixed usage requiring Pro subscription'
      }
    ],
    hints: [
      'Check if any o3-pro usage exists to determine subscription level',
      'ChatGPT Plus includes both o3-mini and o3',
      'ChatGPT Pro is required for any o3-pro usage'
    ],
    points: 50,
    tags: ['calculation', 'conditionals', 'objects']
  },
  {
    id: 'challenge-2',
    title: 'Smart Model Selector',
    description: 'Creëer een intelligente functie die het beste o3 model selecteert op basis van meerdere factoren zoals urgentie, complexiteit en budget.',
    difficulty: 'hard',
    category: 'Algorithm',
    starterCode: {
      javascript: `function selectOptimalModel(task) {
  // task object contains:
  // - complexity: 1-10
  // - urgency: 'low' | 'medium' | 'high'
  // - budget: 'limited' | 'standard' | 'unlimited'
  // - type: 'creative' | 'analytical' | 'coding' | 'research'
  
  // TODO: Implement smart selection logic
  // Return { model: 'model-name', reasoning: 'explanation' }
}`,
      python: `def select_optimal_model(task):
    """
    Select the optimal o3 model based on task requirements.
    
    Args:
        task (dict): Task details including complexity, urgency, budget, type
        
    Returns:
        dict: Selected model and reasoning
    """
    # TODO: Implement selection algorithm
    pass`
    },
    testCases: [
      {
        id: 'tc1',
        input: { complexity: 2, urgency: 'high', budget: 'limited', type: 'creative' },
        expectedOutput: { model: 'o3-mini', reasoning: 'High urgency + low complexity = o3-mini' },
        description: 'Urgent simple task'
      },
      {
        id: 'tc2',
        input: { complexity: 9, urgency: 'low', budget: 'unlimited', type: 'research' },
        expectedOutput: { model: 'o3-pro', reasoning: 'High complexity research with unlimited budget' },
        description: 'Complex research task'
      }
    ],
    hints: [
      'Consider urgency as the primary factor for time-sensitive tasks',
      'Budget constraints might override complexity preferences',
      'Research tasks typically benefit from more advanced models'
    ],
    points: 75,
    tags: ['decision-making', 'algorithms', 'conditionals']
  }
];