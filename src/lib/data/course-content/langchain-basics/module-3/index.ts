import { Module } from '@/lib/data/courses'
import { lesson31 } from './lesson-3-1'
import { lesson3_2 as lesson32 } from './lesson-3-2'
import { lesson3_3 as lesson33 } from './lesson-3-3'

export const module3: Module = {
  id: 'module-3',
  title: 'Chains en Sequential Processing',
  description: 'Leer hoe je complexe workflows bouwt met LangChain chains',
  lessons: [lesson31, lesson32, lesson33]
}

// Export lessons individueel voor makkelijke toegang
export { lesson31, lesson32, lesson33 }
