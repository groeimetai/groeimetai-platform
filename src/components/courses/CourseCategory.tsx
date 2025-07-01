'use client'

import { CourseData } from '@/lib/data/courses'
import { CourseCard } from './CourseCard'

interface CourseCategoryProps {
  category: string
  courses: CourseData[]
}

export function CourseCategory({ category, courses }: CourseCategoryProps) {
  if (courses.length === 0) {
    return null
  }

  // Get category description
  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'Fundamenten':
        return 'Start je AI-reis met essentiële kennis over prompting, ChatGPT en AI-tools. Perfect voor beginners die snel resultaat willen zien.'
      case 'Automation':
        return 'Automatiseer bedrijfsprocessen met no-code/low-code platforms zoals N8N en Make. Bespaar tientallen uren per week zonder te programmeren.'
      case 'Development':
        return 'Bouw geavanceerde AI-applicaties met Claude, LangChain en multi-agent systemen. Voor developers die de grenzen willen verleggen.'
      case 'Praktijk':
        return 'Pas AI direct toe in marketing, customer service, data-analyse en meer. Praktische cursussen voor directe business impact.'
      default:
        return 'Ontdek onze cursussen in deze categorie.'
    }
  }

  return (
    <section className="mb-12">
      {/* Category Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          {category}
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl">
          {getCategoryDescription(category)}
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          <span>{courses.length} cursus{courses.length !== 1 ? 'sen' : ''}</span>
          <span>•</span>
          <span>
            {courses.reduce((total, course) => total + (course.studentsCount || 0), 0)} studenten
          </span>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  )
}