import { Module } from '@/lib/data/courses'
import { lesson5_1 } from './lesson-5-1'
import { lesson5_2 } from './lesson-5-2'
import { lesson5_3 } from './lesson-5-3'
import { lesson5_4 } from './lesson-5-4'
import { lesson5_5 } from './lesson-5-5'

// Export individual lessons
export { lesson5_1 as lesson51, lesson5_2 as lesson52, lesson5_3 as lesson53, lesson5_4 as lesson54, lesson5_5 as lesson55 }

// Export the complete module
export const module5: Module = {
  id: 'module-5',
  title: 'ChatGPT Business Applications',
  description: 'Implementeer ChatGPT voor customer service, sales automation, content creation en meer',
  lessons: [lesson5_1, lesson5_2, lesson5_3, lesson5_4, lesson5_5]
}