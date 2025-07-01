import type { Module } from '@/lib/data/courses';
import { lesson4_1 } from './lesson-4-1';
import { lesson4_2 } from './lesson-4-2';
import { lesson4_3 } from './lesson-4-3';
import { lesson4_4 } from './lesson-4-4';
import { lesson4_5 } from './lesson-4-5';

export const module4: Module = {
  id: 'module-4',
  title: 'Troubleshooting en best practices',
  description: 'Leer problemen oplossen en volg de beste werkwijzen',
  lessons: [
    lesson4_1,
    lesson4_2,
    lesson4_3,
    lesson4_4,
    lesson4_5
  ]
};