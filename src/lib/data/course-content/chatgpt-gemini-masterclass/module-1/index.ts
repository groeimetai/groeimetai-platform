import type { Module } from '@/lib/data/courses'
import { lesson1_1 } from './lesson-1-1'
import { lesson1_2 } from './lesson-1-2'
import { lesson1_3 } from './lesson-1-3'
import { lesson1_4 } from './lesson-1-4'
import { lesson1_5 } from './lesson-1-5'

export const module1: Module = {
  id: 'module-1',
  title: 'De basis voorbij: geavanceerde functies',
  description: 'Beheers de nieuwste AI-modellen en hun unieke mogelijkheden voor maximale productiviteit',
  lessons: [
    lesson1_1,
    lesson1_2,
    lesson1_3,
    lesson1_4,
    lesson1_5
  ]
}