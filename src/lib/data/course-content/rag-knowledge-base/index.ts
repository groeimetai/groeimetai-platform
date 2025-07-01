import { Course } from '@/lib/data/courses';
import { module1 } from './module-1';
import { module2 } from './module-2';
import { module3 } from './module-3';
import { module4 } from './module-4';

export const ragKnowledgeBase: Course = {
  id: 'rag-knowledge-base',
  title: 'Jouw Data als Kennisbank (RAG)',
  modules: [module1, module2, module3, module4]
};