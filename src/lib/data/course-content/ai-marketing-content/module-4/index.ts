import { Module } from '@/lib/data/courses'
import { lesson4_1 } from './lesson-4-1'
import { lesson4_2 } from './lesson-4-2'
import { lesson4_3 } from './lesson-4-3'
import { lesson4_4 } from './lesson-4-4'

export { lesson4_1, lesson4_2, lesson4_3, lesson4_4 }

export const module4: Module = {
  id: 'module-4',
  title: 'Campaign automation',
  description: 'Complete marketing flows met AI',
  lessons: [lesson4_1, lesson4_2, lesson4_3, lesson4_4],
  moduleProject: {
    id: 'ai-marketing-campaign-project',
    title: 'Bouw een Complete AI Marketing Campagne',
    description: 'Ontwerp en implementeer een volledig geautomatiseerde marketingcampagne met AI',
    difficulty: 'medium',
    type: 'project',
    estimatedTime: '6-8 uur',
    requirements: [
      'Content strategie ontwikkelen met AI',
      'Automatisch blog posts genereren',
      'Social media content voor 30 dagen',
      'Email campagne met personalisatie',
      'SEO optimalisatie voor alle content',
      'Performance tracking en reporting',
      'A/B testing met AI'
    ]
  }
}