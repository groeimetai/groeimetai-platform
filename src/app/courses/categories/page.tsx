import React from 'react';
import { getCoursesByCategory, getAllCoursesByCategory, getCourseStatistics } from '@/lib/data/courses';
import CategoryCard from '@/components/courses/CategoryCard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Users, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Cursus Categorieën - GroeimetAI',
  description: 'Ontdek onze AI-cursussen verdeeld over 4 categorieën: Fundamenten, Automation, Development en Praktijk',
};

export default function CategoriesPage() {
  const categoriesData = getAllCoursesByCategory();
  const statistics = getCourseStatistics();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <Link href="/cursussen" className="inline-flex items-center text-blue-100 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug naar alle cursussen
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Ontdek je Learning Path
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Van AI-beginner tot expert developer - kies de categorie die past bij jouw doelen 
            en start vandaag nog met het transformeren van je carrière.
          </p>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="bg-white shadow-lg">
            <CardContent className="p-6 text-center">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-3xl font-bold">{statistics.totalCourses}</p>
              <p className="text-sm text-gray-600">Cursussen</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-3xl font-bold">{statistics.totalStudents.toLocaleString('nl-NL')}</p>
              <p className="text-sm text-gray-600">Studenten</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg">
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-3xl font-bold">{statistics.averageRating.toFixed(1)}</p>
              <p className="text-sm text-gray-600">Gemiddelde rating</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="text-3xl font-bold">5-50x</p>
              <p className="text-sm text-gray-600">ROI garantie</p>
            </CardContent>
          </Card>
        </div>

        {/* Categories Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Kies je Focus Gebied
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {categoriesData.map(({ category, courses, description }) => {
              // Get top courses sorted by rating and student count
              const topCourses = [...courses]
                .sort((a, b) => {
                  const scoreA = (a.rating || 0) * 1000 + (a.studentsCount || 0);
                  const scoreB = (b.rating || 0) * 1000 + (b.studentsCount || 0);
                  return scoreB - scoreA;
                })
                .slice(0, 3);

              return (
                <CategoryCard
                  key={category}
                  category={category}
                  description={description}
                  courseCount={courses.length}
                  topCourses={topCourses}
                />
              );
            })}
          </div>
        </div>

        {/* Learning Path Section */}
        <div className="bg-white rounded-xl p-8 mb-16 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Aanbevolen Learning Paths
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <Badge className="mb-3" variant="outline">Beginner Path</Badge>
              <h3 className="font-semibold mb-2">AI Foundations</h3>
              <p className="text-sm text-gray-600 mb-4">
                Start met Prompt Engineering → ChatGPT Masterclass → N8N Basics
              </p>
              <Link href="/cursussen?level=Beginner">
                <Button variant="outline" size="sm">
                  Start journey
                </Button>
              </Link>
            </div>
            
            <div className="text-center">
              <Badge className="mb-3" variant="outline">Professional Path</Badge>
              <h3 className="font-semibold mb-2">Automation Expert</h3>
              <p className="text-sm text-gray-600 mb-4">
                N8N Basics → Advanced Workflows → Webhooks & APIs
              </p>
              <Link href="/cursussen?category=Automation">
                <Button variant="outline" size="sm">
                  Word expert
                </Button>
              </Link>
            </div>
            
            <div className="text-center">
              <Badge className="mb-3" variant="outline">Developer Path</Badge>
              <h3 className="font-semibold mb-2">AI Developer</h3>
              <p className="text-sm text-gray-600 mb-4">
                Claude Setup → LangChain → CrewAI Agent Teams
              </p>
              <Link href="/cursussen?category=Development">
                <Button variant="outline" size="sm">
                  Start coderen
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Niet zeker waar te beginnen?
          </h2>
          <p className="text-lg mb-6 text-blue-100">
            Doe onze AI-readiness assessment en krijg een persoonlijk leerpad aanbevolen
          </p>
          <Link href="/assessment">
            <Button size="lg" variant="secondary">
              Start gratis assessment
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}