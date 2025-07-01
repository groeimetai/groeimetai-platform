import type { Module } from '@/lib/data/courses';
import { lesson4_1 } from './lesson-4-1';
import { lesson4_2 } from './lesson-4-2';
import { lesson4_3 } from './lesson-4-3';
import { lesson4_4 } from './lesson-4-4';

export const module4: Module = {
  id: 'module-4',
  title: 'Eerste integratie bouwen',
  description: 'Bouw je eerste praktische Claude integratie',
  lessons: [
    lesson4_1,
    lesson4_2,
    lesson4_3,
    lesson4_4
  ]
};

// Export individual lessons for convenience
export { lesson4_1, lesson4_2, lesson4_3, lesson4_4 };