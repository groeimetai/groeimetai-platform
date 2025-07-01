import { Module } from '@/lib/data/courses'
import { lesson2_1 } from './lesson-2-1'
import { lesson2_2 } from './lesson-2-2'
import { lesson2_3 } from './lesson-2-3'
import { lesson2_4 } from './lesson-2-4'

export { lesson2_1, lesson2_2, lesson2_3, lesson2_4 }

export const module2: Module = {
  id: 'module-2',
  title: 'Social Media & Visual Content AI',
  description: 'Content strategie en visual creation voor social media',
  lessons: [lesson2_1, lesson2_2, lesson2_3, lesson2_4]
}