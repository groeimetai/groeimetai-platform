import { Module } from '@/lib/data/courses'
import { lesson4_1 } from './lesson-4-1'
import { lesson4_2 } from './lesson-4-2'
import { lesson4_3 } from './lesson-4-3'
import { lesson4_4 } from './lesson-4-4'

export { lesson4_1, lesson4_2, lesson4_3, lesson4_4 }

export const module4: Module = {
  id: 'module-4',
  title: 'Bouw een bedrijfs-chatbot',
  description: 'Complete RAG implementatie voor je organisatie',
  lessons: [lesson4_1, lesson4_2, lesson4_3, lesson4_4],
  moduleProject: {
    id: 'rag-chatbot-project',
    title: 'Bouw een Complete RAG Chatbot',
    description: 'Implementeer een production-ready RAG chatbot voor je organisatie met alle geleerde technieken',
    difficulty: 'expert',
    type: 'project',
    estimatedTime: '10-12 uur',
    requirements: [
      'Document ingestion pipeline voor meerdere formaten',
      'Vector database met semantic search',
      'Conversational memory en chat history',
      'Security en access control',
      'UI/UX met streaming responses',
      'Deployment naar cloud platform',
      'Monitoring en analytics'
    ]
  }
}