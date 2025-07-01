import { Module } from '@/lib/data/courses';
import { lesson4_1 } from './lesson-4-1';
import { lesson4_2 } from './lesson-4-2';

export { lesson4_1 as lesson41, lesson4_2 as lesson42 };

export const module4: Module = {
  id: 'module-4',
  title: 'OpenAI Codex en Gemini CLI',
  description: 'Leer programmeren met AI-assistentie en gebruik de nieuwste code generation tools van OpenAI en Google',
  lessons: [lesson4_1, lesson4_2]
};