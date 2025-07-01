import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InstructorBadge } from '@/components/ui/InstructorBadge';
import { Clock, Users, Star, ArrowRight } from 'lucide-react';
import { formatPrice, formatDuration } from '@/lib/utils';
import { ClientFormattedNumber } from '@/components/ui/ClientFormattedNumber';

const featuredCourses = [
  {
    id: 'prompt-engineering',
    title: 'Prompt Engineering - De Essentiële Vaardigheid',
    description: 'Beheers de kunst van het schrijven van effectieve prompts voor AI-systemen. Deze cursus behandelt de fundamentele principes van prompt engineering.',
    instructor: 'GroeimetAI Team',
    duration: 480, // 8 uur in minuten
    level: 'Beginner',
    price: 99,
    rating: 4.9,
    studentCount: 2847,
    thumbnail: '/images/courses/prompt-engineering-hero.jpg',
    category: 'Fundamenten',
    highlights: ['Zero-shot technieken', 'Chain-of-thought', 'Direct toepasbaar'],
  },
  {
    id: 'n8n-make-basics',
    title: 'De Basis van Automations - N8N/Make',
    description: 'Start je automation journey met N8N of Make. Leer de fundamenten van triggers, acties en het verbinden van apps.',
    instructor: 'GroeimetAI Team',
    duration: 600, // 10 uur in minuten
    level: 'Beginner',
    price: 199,
    rating: 4.7,
    studentCount: 1456,
    thumbnail: '/images/courses/n8n-make-basics-hero.jpg',
    category: 'Automation',
    highlights: ['5 bedrijfsautomations', 'Geen code vereist', 'ROI binnen 2 weken'],
  },
  {
    id: 'claude-simple-setup',
    title: 'Claude: Opzetten en Simpel Gebruiken',
    description: 'Ontdek het Claude platform, leer de juiste modellen kiezen en schrijf effectieve prompts. De perfecte start voor je Claude journey.',
    instructor: 'GroeimetAI Team',
    duration: 480, // 8 uur in minuten
    level: 'Beginner',
    price: 299,
    rating: 4.8,
    studentCount: 1123,
    thumbnail: '/images/courses/claude-simple-setup-hero.jpg',
    category: 'Development',
    highlights: ['API integratie', 'Model selectie', 'Best practices'],
  },
];

export function CoursesPreview() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container-width section-padding">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
            <Star className="w-4 h-4" />
            <span>Populaire cursussen</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Begin je AI-reis met onze
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              meest gewaardeerde cursussen
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ontdek waarom duizenden Nederlandse professionals kiezen voor GroeimetAI 
            om hun AI-vaardigheden te ontwikkelen.
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCourses.map((course) => (
            <Card key={course.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white">
              {/* Course Thumbnail */}
              <div className="relative overflow-hidden rounded-t-lg">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                {/* Level Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm ${
                    course.level === 'Beginner' 
                      ? 'bg-green-100/90 text-green-800'
                      : course.level === 'Intermediate'
                      ? 'bg-yellow-100/90 text-yellow-800'
                      : 'bg-red-100/90 text-red-800'
                  }`}>
                    {course.level}
                  </span>
                </div>

                {/* Price Badge */}
                <div className="absolute top-4 right-4">
                  <span className="bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                    {formatPrice(course.price)}
                  </span>
                </div>
              </div>

              <CardHeader className="pb-4">
                <div className="space-y-2">
                  <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 line-clamp-2">
                    {course.description}
                  </CardDescription>
                </div>
                
                {/* Instructor */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Door</span>
                  <InstructorBadge name={course.instructor} size="sm" />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Course Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(course.duration)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span><ClientFormattedNumber value={course.studentCount} /> studenten</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{course.rating}</span>
                  </div>
                </div>

                {/* Highlights */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">Wat je leert:</h4>
                  <div className="flex flex-wrap gap-1">
                    {course.highlights.map((highlight, index) => (
                      <span 
                        key={index}
                        className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <Button 
                  className="w-full group-hover:bg-blue-600 transition-colors" 
                  asChild
                >
                  <Link href={`/cursussen/${course.id}`} className="flex items-center justify-center space-x-2">
                    <span>Bekijk cursus</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Courses CTA */}
        <div className="text-center mt-12">
          <Button size="lg" variant="outline" className="border-2" asChild>
            <Link href="/cursussen" className="flex items-center space-x-2">
              <span>Bekijk alle cursussen</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            50+ cursussen beschikbaar in verschillende categorieën
          </p>
        </div>
      </div>
    </section>
  );
}