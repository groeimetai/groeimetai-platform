import type { Lesson, Module, Assignment } from '@/lib/data/courses';

// Import all lessons
import { lesson4_1 } from './lesson-4-1';
import { lesson4_2 } from './lesson-4-2';
import { lesson4_3 } from './lesson-4-3';
import { lesson4_4 } from './lesson-4-4';

export { lesson4_1, lesson4_2, lesson4_3, lesson4_4 };

// Module project
export const moduleProject: Assignment = {
  id: 'final-project',
  title: 'Bouw een complete Claude Code workflow',
  description: 'Combineer alle geleerde technieken om een geoptimaliseerde AI-powered development workflow te creëren.',
  difficulty: 'hard',
  type: 'project',
  initialCode: `// Final Project: Complete Claude Code Workflow

/*
 * Creëer een complete workflow die:
 * 1. Codebase analyseert
 * 2. Automatisch bugs detecteert
 * 3. Tests genereert
 * 4. Custom commands gebruikt
 * 
 * Placeholder voor uitgebreide projectbeschrijving
 */`,
  hints: [
    'Begin met een analyse van je huidige workflow',
    'Identificeer repetitieve taken die geautomatiseerd kunnen worden',
    'Test incrementeel elke nieuwe functionaliteit',
    'Documenteer je custom commands voor hergebruik'
  ]
};

export const module4: Module = {
  id: 'module-4',
  title: 'Enterprise Claude Code Integration',
  description: 'Production-ready workflows and integrations',
  lessons: [lesson4_1, lesson4_2, lesson4_3, lesson4_4],
  moduleProject
};