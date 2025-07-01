import { Module } from '@/lib/data/courses';
import { lesson4_1 } from './lesson-4-1';
import { lesson4_2 } from './lesson-4-2';
import { lesson4_3 } from './lesson-4-3';

export const module4: Module = {
  id: 'module-4',
  title: 'Scheduling en error handling',
  description: 'Implementeer robuuste scheduling en error handling voor betrouwbare workflows',
  lessons: [lesson4_1, lesson4_2, lesson4_3]
};

// Export individual lessons
export { lesson4_1 } from './lesson-4-1';
export { lesson4_2 } from './lesson-4-2';
export { lesson4_3 } from './lesson-4-3';