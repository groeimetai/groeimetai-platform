import type { Module } from '@/lib/data/courses';

// Import all lessons
import { lesson1_1 } from './lesson-1-1';
import { lesson1_2 } from './lesson-1-2';
import { lesson1_3 } from './lesson-1-3';
import { lesson1_4 } from './lesson-1-4';

export const module1: Module = {
  id: 'module-1',
  title: 'Webhooks fundamenten',
  description: 'Ontvang real-time data van externe systemen',
  lessons: [
    lesson1_1,
    lesson1_2,
    lesson1_3,
    lesson1_4
  ]
};