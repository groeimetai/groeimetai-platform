import type { Module } from '@/lib/data/courses';
import { lesson21 } from './lesson-2-1';
import { lesson22 } from './lesson-2-2';
import { lesson23 } from './lesson-2-3';
import { lesson24 } from './lesson-2-4';

export const module2: Module = {
  id: 'module-2',
  title: 'Module 2: Architectuur en componenten',
  description: 'Duik diep in de technische architectuur van Claude Flow. Leer over de core componenten, agent lifecycle management, memory systemen, en tool integratie via het Model Context Protocol (MCP).',
  lessons: [lesson21, lesson22, lesson23, lesson24]
};