import { Module } from '@/lib/data/courses';
import { lesson31 } from './lesson-3-1';
import { lesson32 } from './lesson-3-2';
import { lesson33 } from './lesson-3-3';
import { lesson34 } from './lesson-3-4';

export const module3: Module = {
  id: 'module-3',
  title: 'Multi-Agent Systemen: Architectuur & Implementatie',
  description: 'Ontwerp en bouw geavanceerde multi-agent systemen met Claude Flow. Leer agent architectuur patronen, communicatie protocollen, taak distributie en implementeer 5+ complete swarm voorbeelden.',
  lessons: [
    lesson31, // Agent Architecture Patterns
    lesson32, // Communication Protocols
    lesson33, // Task Distribution
    lesson34  // Complete Swarm Examples
  ]
};