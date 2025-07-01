import { Module } from '@/lib/data/courses'
import { lesson1_1 } from './lesson-1-1'
import { lesson1_2 } from './lesson-1-2'
import { lesson1_3 } from './lesson-1-3'

// Export individual lessons
export { lesson1_1 as lesson11, lesson1_2 as lesson12, lesson1_3 as lesson13 }

// Export the complete module
export const module1: Module = {
  id: 'module-1',
  title: 'Conditionele logica en beslisbomen',
  description: 'Leer hoe je complexe workflows bouwt met conditionele logica en beslissingsstructuren',
  lessons: [lesson1_1, lesson1_2, lesson1_3]
}