import { Module } from '@/lib/data/courses';
import { lesson2_1 } from './lesson-2-1';
import { lesson2_2 } from './lesson-2-2';
import { lesson2_3 } from './lesson-2-3';

export { lesson2_1 as lesson21 } from './lesson-2-1';
export { lesson2_2 as lesson22 } from './lesson-2-2';
export { lesson2_3 as lesson23 } from './lesson-2-3';

export const module2: Module = {
  id: 'module-2',
  title: 'Data-manipulatie en transformatie',
  description: 'Beheers geavanceerde technieken voor het manipuleren en transformeren van data in workflows',
  lessons: [
    lesson2_1,
    lesson2_2,
    lesson2_3
  ]
};