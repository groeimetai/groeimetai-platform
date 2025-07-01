/**
 * Mock Chatbot for Development
 * This provides a working chatbot without requiring Pinecone/OpenAI setup
 */

export interface MockChatResponse {
  answer: string;
  intent: string;
  relatedCourses?: string[];
  recommendations?: any[];
}

const courseDatabase = [
  { id: 'chatgpt-gemini-masterclass', title: 'ChatGPT & Gemini Masterclass', level: 'beginner' },
  { id: 'langchain-basics', title: 'LangChain Basics', level: 'intermediate' },
  { id: 'n8n-make-basics', title: 'N8N/Make Basics', level: 'beginner' },
  { id: 'rag-knowledge-base', title: 'RAG Knowledge Base', level: 'advanced' },
  { id: 'claude-flow-ai-swarming', title: 'Claude Flow AI Swarming', level: 'advanced' },
  { id: 'crewai-agent-teams', title: 'CrewAI Agent Teams', level: 'intermediate' },
];

export async function mockChatQuery(
  message: string,
  context: any = {}
): Promise<MockChatResponse> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const lowerMessage = message.toLowerCase();
  
  // Course recommendations
  if (lowerMessage.includes('cursus') || lowerMessage.includes('aanbevel') || 
      lowerMessage.includes('recommend') || lowerMessage.includes('course')) {
    
    const level = lowerMessage.includes('beginner') ? 'beginner' : 
                  lowerMessage.includes('advanced') ? 'advanced' : 'all';
    
    const filtered = level === 'all' ? courseDatabase : 
                    courseDatabase.filter(c => c.level === level);
    
    return {
      answer: `Ik heb ${filtered.length} cursussen gevonden die bij je passen:\n\n` +
              filtered.map(c => `• **${c.title}** (${c.level})`).join('\n') +
              '\n\nWil je meer weten over een specifieke cursus?',
      intent: 'course_selection',
      recommendations: filtered,
    };
  }
  
  // Learning path
  if (lowerMessage.includes('leerpad') || lowerMessage.includes('learning path')) {
    return {
      answer: 'Voor een complete AI learning path raad ik aan:\n\n' +
              '1. **Start**: ChatGPT & Gemini Masterclass\n' +
              '2. **Automatisering**: N8N/Make Basics\n' +
              '3. **Programmeren**: LangChain Basics\n' +
              '4. **Geavanceerd**: RAG Knowledge Base\n' +
              '5. **Expert**: Claude Flow AI Swarming\n\n' +
              'Deze volgorde bouwt geleidelijk je kennis op!',
      intent: 'learning_path',
    };
  }
  
  // RAG/AI questions
  if (lowerMessage.includes('rag') || lowerMessage.includes('retrieval')) {
    return {
      answer: 'RAG (Retrieval Augmented Generation) is een techniek waarbij AI-modellen ' +
              'toegang krijgen tot externe kennisbronnen. Het combineert:\n\n' +
              '• **Retrieval**: Het zoeken naar relevante informatie\n' +
              '• **Augmentation**: Het verrijken van de AI-context\n' +
              '• **Generation**: Het genereren van accurate antwoorden\n\n' +
              'Onze RAG Knowledge Base cursus leert je alles hierover!',
      intent: 'content_question',
      relatedCourses: ['rag-knowledge-base'],
    };
  }
  
  // Default response
  return {
    answer: 'Interessante vraag! Als AI assistent help ik je graag met:\n\n' +
            '• Cursusaanbevelingen op maat\n' +
            '• Uitleg over AI concepten\n' +
            '• Studieplanning en leerpaden\n' +
            '• Technische vragen over onze cursussen\n\n' +
            'Wat wil je graag weten?',
    intent: 'general',
  };
}

export function createMockChatbot() {
  return {
    query: mockChatQuery,
    searchContent: async (query: string) => {
      // Mock search results
      return courseDatabase
        .filter(course => 
          course.title.toLowerCase().includes(query.toLowerCase())
        )
        .map(course => ({
          content: `${course.title} - ${course.level} niveau cursus`,
          metadata: course,
          score: 0.8,
        }));
    },
  };
}