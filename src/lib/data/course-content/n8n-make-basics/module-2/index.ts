import type { Module } from '@/lib/data/courses';
import { lesson2_1 } from './lesson-2-1';
import { lesson2_2 } from './lesson-2-2';
import { lesson2_3 } from './lesson-2-3';
import { lesson2_4 } from './lesson-2-4';
import { lesson2_5 } from './lesson-2-5';

export const module2: Module = {
  id: 'module-2',
  title: 'API authenticatie en beveiliging',
  description: 'Leer hoe je veilig verbinding maakt met externe systemen',
  lessons: [
    lesson2_1,
    lesson2_2,
    lesson2_3,
    lesson2_4,
    lesson2_5
  ]
};