import { Module } from '@/lib/data/courses';
import { lesson3_1 } from './lesson-3-1';
import { lesson3_2 } from './lesson-3-2';
import { lesson3_3 } from './lesson-3-3';

// Export individual lessons
export { lesson3_1 as lesson31 } from './lesson-3-1';
export { lesson3_2 as lesson32 } from './lesson-3-2';
export { lesson3_3 as lesson33 } from './lesson-3-3';

// Export complete module
export const module3: Module = {
  id: 'module-3',
  title: 'Module 3: Geavanceerde AI integratie',
  description: 'Diepgaande technieken voor AI integratie in workflows met prompt engineering en function calling',
  lessons: [lesson3_1, lesson3_2, lesson3_3]
};