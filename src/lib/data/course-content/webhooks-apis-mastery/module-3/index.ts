import { Module } from '@/lib/data/courses';
import { lesson3_1 } from './lesson-3-1';
import { lesson3_2 } from './lesson-3-2';
import { lesson3_3 } from './lesson-3-3';
import { lesson3_4 } from './lesson-3-4';

export const module3 = {
  id: 'module-3',
  title: 'Data parsing en transformatie',
  description: 'Werk met JSON, XML en andere formaten',
  lessons: [
    lesson3_1,
    lesson3_2,
    lesson3_3,
    lesson3_4
  ]
};

// Export individual lessons for direct access if needed
export {
  lesson3_1,
  lesson3_2,
  lesson3_3,
  lesson3_4
};