import { Metadata } from 'next'
import { getAllCoursesByCategory } from '@/lib/data/courses'
import { CourseCategory } from '@/components/courses'

export const metadata: Metadata = {
  title: 'Ons Cursusaanbod | GroeimetAI',
  description: 'Ontdek onze uitgebreide collectie AI, automatisering, en development cursussen. Van fundamenten tot geavanceerde praktijktoepassingen.',
  keywords: [
    'AI cursussen',
    'machine learning',
    'data science',
    'automation',
    'web development',
    'online leren',
    'certificaten',
    'GroeimetAI'
  ],
  openGraph: {
    title: 'Ons Cursusaanbod | GroeimetAI',
    description: 'Ontdek onze uitgebreide collectie AI, automatisering, en development cursussen.',
    type: 'website',
    locale: 'nl_NL',
  },
  alternates: {
    canonical: '/cursussen'
  }
}

export default function CoursesPage() {
  const coursesByCategory = getAllCoursesByCategory()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Ons Cursusaanbod
            </h1>
            <p className="mt-3 max-w-3xl mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl">
              Ontdek onze uitgebreide collectie cursussen in AI, automatisering, en development. 
              Van fundamentele concepten tot geavanceerde praktijktoepassingen.
            </p>
            <div className="mt-6 flex justify-center items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>
                  {coursesByCategory.reduce((total, category) => total + category.courses.length, 0)} cursussen
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>4 categorieën</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Certificaten beschikbaar</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {coursesByCategory.map(({ category, courses, description }) => (
          <CourseCategory 
            key={category} 
            category={category} 
            courses={courses}
            description={description}
          />
        ))}
      </div>

      {/* CTA Section */}
      <div className="bg-blue-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Klaar om te beginnen?
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Start vandaag nog met je eerste cursus en bouw aan je toekomst in AI en technologie.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-white rounded-lg p-6 shadow-sm border text-left">
                <h3 className="font-semibold text-gray-900 text-lg">Voor beginners</h3>
                <p className="text-gray-600 mt-1">Start met onze fundamentele cursussen</p>
                <p className="text-blue-600 font-medium mt-2">Vanaf €249</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border text-left">
                <h3 className="font-semibold text-gray-900 text-lg">Voor professionals</h3>
                <p className="text-gray-600 mt-1">Verdiep je kennis met geavanceerde cursussen</p>
                <p className="text-blue-600 font-medium mt-2">Vanaf €449</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border text-left">
                <h3 className="font-semibold text-gray-900 text-lg">Volledig pakket</h3>
                <p className="text-gray-600 mt-1">Toegang tot alle cursussen en materialen</p>
                <p className="text-blue-600 font-medium mt-2">Vanaf €899</p>
              </div>
            </div>
            <div className="mt-8 text-sm text-gray-500">
              <p>✓ Certificaten bij voltooiing</p>
              <p>✓ Levenslange toegang</p>
              <p>✓ 30 dagen geld-terug-garantie</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}