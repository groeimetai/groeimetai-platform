import type { Module } from '@/lib/data/courses';
import { lesson3_1 } from './lesson-3-1';
import { lesson3_2 } from './lesson-3-2';
import { lesson3_3 } from './lesson-3-3';
import { lesson3_4 } from './lesson-3-4';

export { lesson3_1, lesson3_2, lesson3_3, lesson3_4 };

export const module3: Module = {
  id: 'module-3',
  title: 'Advanced Claude Code Techniques',
  description: 'Master advanced features and workflows',
  lessons: [lesson3_1, lesson3_2, lesson3_3, lesson3_4]
};