import { Module } from '@/lib/data/courses'
import { lesson2_1 } from './lesson-2-1'
import { lesson2_2 } from './lesson-2-2'

// Export individual lessons
export { lesson2_1, lesson2_2 }

// Export the complete module
export const module2: Module = {
  id: 'module-2',
  title: 'API authenticatie en security',
  description: 'OAuth, API keys, en veilige verbindingen',
  lessons: [lesson2_1, lesson2_2]
}