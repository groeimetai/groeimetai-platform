import { Module } from '@/lib/data/courses'
import { lesson41 as lesson4_1 } from './lesson-4-1'

export { lesson4_1 }

export const module4: Module = {
  id: 'module-4',
  title: 'Launch en optimalisatie',
  description: 'Deploy, monitor en continuous improvement',
  lessons: [lesson4_1],
  moduleProject: {
    id: 'customer-service-bot-project',
    title: 'Bouw een Complete AI Customer Service Bot',
    description: 'Ontwikkel en deploy een volledig functionele klantenservice bot voor een echte business case',
    difficulty: 'medium',
    estimatedTime: '8-10 uur',
    type: 'project',
    requirements: [
      'Conversation design voor 10+ use cases',
      'Multi-language support (NL/EN)',
      'Integratie met kennisbank/FAQ',
      'Live chat handoff functionaliteit',
      'Analytics dashboard',
      'A/B testing voor responses',
      'Production deployment op Voiceflow/Botpress'
    ]
  }
}