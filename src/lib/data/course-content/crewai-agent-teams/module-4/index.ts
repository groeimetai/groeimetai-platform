import { Module } from '@/lib/data/courses'
import { lesson as lesson4_1 } from './lesson-4-1'
import lesson4_2 from './lesson-4-2'
import lesson4_3 from './lesson-4-3'
import lesson4_4 from './lesson-4-4'

export { lesson4_1, lesson4_2, lesson4_3, lesson4_4 }

export const module4: Module = {
  id: 'module-4',
  title: 'Productie & Scaling',
  description: 'Docker deployment, Kubernetes orchestration, monitoring en optimization',
  lessons: [lesson4_1, lesson4_2, lesson4_3, lesson4_4],
  moduleProject: {
    id: 'production-deployment-project',
    title: 'Deploy CrewAI naar Production',
    description: 'Implementeer een volledig production-ready CrewAI systeem met monitoring, scaling en cost optimization',
    difficulty: 'expert',
    type: 'project',
    estimatedTime: '12-15 uur',
    requirements: [
      'Docker containers voor alle agents',
      'Kubernetes deployment met auto-scaling',
      'Prometheus/Grafana monitoring dashboard',
      'Cost optimization strategies',
      'Error recovery en resilience patterns',
      'Performance benchmarking en tuning',
      'CI/CD pipeline voor automated deployments'
    ]
  }
}