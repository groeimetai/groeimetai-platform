import { Module } from '@/lib/data/courses'
import { lesson31 as lesson3_1 } from './lesson-3-1'
import { lesson32 as lesson3_2 } from './lesson-3-2'
import { lesson33 as lesson3_3 } from './lesson-3-3'
import { lesson34 as lesson3_4 } from './lesson-3-4'

export { lesson3_1, lesson3_2, lesson3_3, lesson3_4 }

export const module3: Module = {
  id: 'module-3',
  title: 'Complexe Crews',
  description: 'Hierarchical structures, role specialization en workflow orchestration',
  lessons: [lesson3_1, lesson3_2, lesson3_3, lesson3_4]
}