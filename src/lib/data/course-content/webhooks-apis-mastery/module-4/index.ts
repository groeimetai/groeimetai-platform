import { Module } from '@/lib/data/courses';
import { lesson4_1 } from './lesson-4-1';
import { lesson4_2 } from './lesson-4-2';
import { lesson4_3 } from './lesson-4-3';
import { lesson4_4 } from './lesson-4-4';

export const module4: Module = {
  id: 'module-4',
  title: 'Custom platform integratie',
  description: 'Bouw een koppeling met een platform zonder standaard integratie',
  lessons: [
    lesson4_1,
    lesson4_2,
    lesson4_3,
    lesson4_4
  ]
};