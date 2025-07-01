import { Module } from '@/lib/data/courses'
import { lesson2_1 } from './lesson-2-1'
import { lesson2_2 } from './lesson-2-2'
import { lesson2_3 } from './lesson-2-3'

export { lesson2_1, lesson2_2, lesson2_3 }

export const module2: Module = {
  id: 'module-2',
  title: 'Agent rollen en specialisaties',
  description: 'Ontwerp effectieve agent personas',
  lessons: [lesson2_1, lesson2_2, lesson2_3]
}