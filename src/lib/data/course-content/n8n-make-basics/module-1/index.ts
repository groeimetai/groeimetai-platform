import type { Module } from '@/lib/data/courses';
import { lesson1_1 } from './lesson-1-1';
import { lesson1_2 } from './lesson-1-2';
import { lesson1_3 } from './lesson-1-3';
import { lesson1_4 } from './lesson-1-4';
import { lesson1_5 } from './lesson-1-5';

export const module1: Module = {
  id: 'module-1',
  title: 'Automation Fundamentals',
  description: 'Leer de basis van automation tools, wanneer je welke tool gebruikt, en bouw je eerste werkende workflows',
  lessons: [
    lesson1_1,
    lesson1_2,
    lesson1_3,
    lesson1_4,
    lesson1_5
  ]
};

export {
  lesson1_1,
  lesson1_2,
  lesson1_3,
  lesson1_4,
  lesson1_5
};