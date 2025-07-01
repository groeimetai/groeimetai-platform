'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlayCircle, CheckCircle, Sparkles, Cpu } from 'lucide-react';
import { SmoothHeroAnimation } from '@/components/animations/SmoothHeroAnimation';
import { GPUParticleSystem } from '@/components/animations/GPUParticleSystem';

const stats = [
  { label: 'Actieve studenten', value: '5,000+' },
  { label: 'Cursussen', value: '50+' },
  { label: 'Certificaten uitgegeven', value: '2,500+' },
  { label: 'Gemiddelde rating', value: '4.8' },
];

const highlights = [
  'Erkende AI-certificaten',
  'Praktische hands-on training',
  'Expert instructeurs',
  'Flexibel online leren',
];

export function HeroSectionAdvanced() {
  const [useGPUParticles, setUseGPUParticles] = useState(false);

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
      
      <div className="container-width section-padding relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[600px] py-12">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <span>Nieuwe cursus: ChatGPT voor Professionals</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Groei mee met de{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI-revolutie
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                Versterk je professionele vaardigheden met onze praktische AI-cursussen. 
                Van ChatGPT tot Machine Learning - leer van Nederlandse AI-experts en 
                ontvang erkende certificaten.
              </p>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-2 gap-3">
              {highlights.map((highlight, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{highlight}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" asChild>
                <Link href="/cursussen" className="flex items-center space-x-2">
                  <span>Ontdek cursussen</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2" asChild>
                <Link href="/demo" className="flex items-center space-x-2">
                  <PlayCircle className="w-4 h-4" />
                  <span>Bekijk demo</span>
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-gray-200">
              {stats.map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            {/* Animation Toggle */}
            <div className="absolute -top-12 right-0 z-10">
              <button
                onClick={() => setUseGPUParticles(!useGPUParticles)}
                className="bg-white/90 backdrop-blur rounded-lg px-3 py-2 shadow-lg border flex items-center gap-2 text-sm hover:bg-gray-50 transition-colors"
              >
                {useGPUParticles ? (
                  <>
                    <Cpu className="w-4 h-4 text-blue-600" />
                    <span>GPU Particles</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Classic Animation</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Animation */}
            <div className="relative bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-2 shadow-2xl">
              <div className={`aspect-video rounded-lg shadow-lg overflow-hidden ${
                useGPUParticles ? 'bg-gray-900' : 'bg-white'
              }`}>
                {useGPUParticles ? (
                  <GPUParticleSystem />
                ) : (
                  <SmoothHeroAnimation />
                )}
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-white rounded-lg p-4 shadow-lg border">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Live cursussen</span>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-white rounded-lg p-4 shadow-lg border">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white"></div>
                  <div className="w-6 h-6 bg-purple-500 rounded-full border-2 border-white"></div>
                  <div className="w-6 h-6 bg-pink-500 rounded-full border-2 border-white"></div>
                </div>
                <span className="text-sm font-medium">1000+ studenten</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}