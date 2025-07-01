'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const testimonials = [
  {
    id: 1,
    name: 'Emma van der Veen',
    role: 'Marketing Manager',
    company: 'TechStart Amsterdam',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    rating: 5,
    content: 'De ChatGPT & Gemini cursus heeft mijn werkwijze compleet getransformeerd. Ik bespaar nu 3 uur per dag op content creatie en mijn campagnes presteren 40% beter. De praktijkgerichte aanpak was precies wat ik nodig had.',
    course: 'ChatGPT & Gemini Masterclass',
  },
  {
    id: 2,
    name: 'Pieter Janssen',
    role: 'CEO',
    company: 'InnovatieHuis Utrecht',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pieter',
    rating: 5,
    content: 'Als ondernemer zonder technische achtergrond vond ik het lastig om AI te begrijpen. Deze cursus gaf me de strategische inzichten om AI succesvol in te zetten. We hebben nu 2 AI-projecten lopen die €100k+ besparen.',
    course: 'AI voor Ondernemers',
  },
  {
    id: 3,
    name: 'Sophie de Wit',
    role: 'Data Analyst',
    company: 'FinTech Rotterdam',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
    rating: 4.5,
    content: 'De Claude Code Mastery cursus bracht mijn carrière naar een hoger niveau. Binnen 2 maanden promoveerde ik naar Lead Developer. De Nederlandse voorbeelden en support maakten het verschil.',
    course: 'Claude Code Mastery',
  },
  {
    id: 4,
    name: 'Thomas van den Berg',
    role: 'Freelance Developer',
    company: 'Zelfstandig',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas',
    rating: 5,
    content: 'N8n en Make hebben mijn freelance business getransformeerd. Ik automatiseer nu 70% van mijn repetitieve taken en kan meer klanten bedienen. Mijn omzet is verdubbeld in 6 maanden!',
    course: 'N8n & Make Automatisering',
  },
  {
    id: 5,
    name: 'Lisa Bakker',
    role: 'HR Director',
    company: 'People First Nederland',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    rating: 4.5,
    content: 'We gebruikten de AI Customer Service Bot cursus om ons hele HR-team op te leiden. De resulaten zijn indrukwekkend: 50% minder repetitieve vragen en veel tevredener medewerkers.',
    course: 'AI Customer Service Bot',
  },
  {
    id: 6,
    name: 'Mark de Jong',
    role: 'Product Manager',
    company: 'Digital Solutions BV',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mark',
    rating: 5,
    content: 'CrewAI Agent Teams was een eye-opener. We bouwen nu AI-agents die complexe taken autonoom uitvoeren. De tijdsbesparing is enorm en de kwaliteit is consistent hoog.',
    course: 'CrewAI Agent Teams',
  },
  {
    id: 7,
    name: 'Anna Vermeer',
    role: 'Content Creator',
    company: 'Creative Media Agency',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna',
    rating: 4.5,
    content: 'De AI Marketing Content cursus was een game-changer. Ik creëer nu 5x meer content in dezelfde tijd, met betere resultaten. Mijn klanten zijn onder de indruk van de kwaliteit en snelheid.',
    course: 'AI Marketing Content Creation',
  },
  {
    id: 8,
    name: 'Robert Visser',
    role: 'CTO',
    company: 'StartupHub Eindhoven',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
    rating: 5,
    content: 'RAG Knowledge Systems heeft ons geholpen een intelligent kennismanagement systeem te bouwen. De cursus was diepgaand maar toegankelijk. Nu hebben we een AI die al onze bedrijfskennis kan doorzoeken.',
    course: 'RAG Knowledge Systems',
  },
]

const companies = [
  { name: 'Rabobank', logo: '/logos/rabobank.svg' },
  { name: 'ASML', logo: '/logos/asml.svg' },
  { name: 'Booking.com', logo: '/logos/booking.svg' },
  { name: 'Coolblue', logo: '/logos/coolblue.svg' },
  { name: 'Albert Heijn', logo: '/logos/ah.svg' },
  { name: 'NS', logo: '/logos/ns.svg' },
]

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const handlePrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const handleNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const handleDotClick = (index: number) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
  }

  const visibleTestimonials = isMobile ? 1 : 3
  const maxIndex = Math.max(0, testimonials.length - visibleTestimonials)
  const displayIndex = Math.min(currentIndex, maxIndex)

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    return (
      <div className="flex items-center space-x-1">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star className="w-4 h-4 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        )}
        <span className="text-sm text-gray-600 ml-2">{rating}</span>
      </div>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="container-width section-padding">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium animate-fade-in">
            <Star className="w-4 h-4" />
            <span>4.9 gemiddelde beoordeling</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 animate-fade-in-up">
            Succesverhalen van onze studenten
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-2">
              die voorop lopen met AI
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up delay-100">
            Ontdek hoe 5.000+ Nederlandse professionals hun carrière transformeren 
            met praktische AI-vaardigheden van GroeimetAI.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -ml-4 md:-ml-12">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              className="bg-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 -mr-4 md:-mr-12">
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="bg-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Testimonials Container */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ 
                transform: `translateX(-${displayIndex * (100 / visibleTestimonials)}%)` 
              }}
            >
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className={`w-full md:w-1/3 px-3 flex-shrink-0`}
                >
                  <Card className="h-full relative bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <CardContent className="p-6 flex flex-col h-full">
                      {/* Quote Icon */}
                      <div className="absolute top-4 right-4 text-blue-100">
                        <Quote className="w-8 h-8" />
                      </div>

                      {/* Rating */}
                      <div className="mb-4">
                        {renderStars(testimonial.rating)}
                      </div>

                      {/* Content */}
                      <blockquote className="text-gray-700 mb-6 leading-relaxed flex-grow">
                        "{testimonial.content}"
                      </blockquote>

                      {/* Author Info */}
                      <div className="flex items-center space-x-3 mb-4">
                        {/* Avatar */}
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full"
                        />
                        
                        {/* Details */}
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{testimonial.name}</div>
                          <div className="text-sm text-gray-600">{testimonial.role}</div>
                          <div className="text-sm text-gray-500">{testimonial.company}</div>
                        </div>
                      </div>

                      {/* Course Badge */}
                      <div className="pt-4 border-t border-gray-100">
                        <span className="inline-block bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                          {testimonial.course}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 mt-8">
            {[...Array(Math.ceil(testimonials.length / visibleTestimonials))].map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index * visibleTestimonials)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  Math.floor(displayIndex / visibleTestimonials) === index
                    ? 'bg-blue-600 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial set ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Trusted By Section */}
        <div className="text-center space-y-8 mt-20">
          <h3 className="text-lg font-semibold text-gray-600 animate-fade-in">
            Vertrouwd door professionals van toonaangevende Nederlandse bedrijven
          </h3>
          
          {/* Company Logos */}
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            {companies.map((company, index) => (
              <div 
                key={index} 
                className="flex items-center justify-center w-32 h-16 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-gray-100 rounded-lg px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors duration-300">
                  {company.name}
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8 max-w-4xl mx-auto">
            <div className="text-center animate-fade-in-up">
              <div className="text-3xl font-bold text-gray-900">5.000+</div>
              <div className="text-gray-600">Actieve studenten</div>
            </div>
            <div className="text-center animate-fade-in-up delay-100">
              <div className="text-3xl font-bold text-gray-900">4.9/5</div>
              <div className="text-gray-600">Gemiddelde beoordeling</div>
            </div>
            <div className="text-center animate-fade-in-up delay-200">
              <div className="text-3xl font-bold text-gray-900">87%</div>
              <div className="text-gray-600">Carrière verbetering</div>
            </div>
            <div className="text-center animate-fade-in-up delay-300">
              <div className="text-3xl font-bold text-gray-900">93%</div>
              <div className="text-gray-600">Voltooit de cursus</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        .delay-100 {
          animation-delay: 100ms;
        }

        .delay-200 {
          animation-delay: 200ms;
        }

        .delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </section>
  )
}