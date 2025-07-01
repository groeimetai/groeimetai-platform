import { Module } from '@/lib/data/courses'
import { lesson21 } from './lesson-2-1'
import { lesson22 } from './lesson-2-2'
import { lesson23 } from './lesson-2-3'
import { lesson24 } from './lesson-2-4'

export const module2: Module = {
  id: 'module-2',
  title: 'Prompt Templates en Output Parsers',
  description: 'Beheers prompts professioneel en parse AI output naar structured data',
  lessons: [lesson21, lesson22, lesson23, lesson24]
}

// Export lessons individueel voor makkelijke toegang
export { lesson21, lesson22, lesson23, lesson24 }
