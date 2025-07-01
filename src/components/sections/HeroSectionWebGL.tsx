'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlayCircle, CheckCircle, Sparkles } from 'lucide-react';
import { OptimizedWebGLHero } from '@/components/animations/OptimizedWebGLHero';
import { SmoothHeroAnimation } from '@/components/animations/SmoothHeroAnimation';
import { motion } from 'framer-motion';

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

type AnimationType = 'webgl' | 'smooth';

export function HeroSectionWebGL() {
  const [animationType, setAnimationType] = useState<AnimationType>('webgl');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Detect if user prefers reduced motion or has low-end device
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (prefersReducedMotion || isMobile) {
      setAnimationType('smooth');
    }
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
      {/* Background decoration with darker theme */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gradient-to-tr from-purple-600/20 to-pink-600/20 rounded-full blur-3xl"></div>
      
      <div className="container-width section-padding relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[700px] py-12">
          {/* Left Column - Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 z-10"
          >
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-blue-900/50 backdrop-blur-sm text-blue-300 px-4 py-2 rounded-full text-sm font-medium border border-blue-700/50">
              <Sparkles className="w-4 h-4" />
              <span>Powered by Advanced AI Technology</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Groei mee met de{' '}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AI-revolutie
                </span>
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
                Versterk je professionele vaardigheden met onze geavanceerde AI-cursussen. 
                Van ChatGPT tot Machine Learning - leer van Nederlandse AI-experts en 
                ontvang erkende certificaten.
              </p>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-2 gap-3">
              {highlights.map((highlight, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-200 text-sm">{highlight}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg shadow-blue-500/25" asChild>
                <Link href="/cursussen" className="flex items-center space-x-2">
                  <span>Ontdek cursussen</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-gray-600 text-gray-200 hover:bg-gray-800" asChild>
                <Link href="/demo" className="flex items-center space-x-2">
                  <PlayCircle className="w-4 h-4" />
                  <span>Bekijk demo</span>
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-gray-700">
              {stats.map((stat, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="text-center lg:text-left"
                >
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative"
          >
            {/* AI Animation Container */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-video bg-black/80 backdrop-blur-sm border border-white/10">
                {isClient && (
                  animationType === 'webgl' ? (
                    <OptimizedWebGLHero />
                  ) : (
                    <SmoothHeroAnimation />
                  )
                )}
              </div>
              
              {/* Animation type indicator */}
              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1 text-xs text-white/70">
                {animationType === 'webgl' ? 'WebGL Enhanced' : 'Optimized View'}
              </div>
            </div>

            {/* Floating Elements with glow effects */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 -right-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-blue-500/50"
            >
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-white">Live AI Training</span>
              </div>
            </motion.div>
            
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
              className="absolute -bottom-4 -left-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-purple-500/50"
            >
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 bg-blue-400 rounded-full border-2 border-gray-900"></div>
                  <div className="w-6 h-6 bg-purple-400 rounded-full border-2 border-gray-900"></div>
                  <div className="w-6 h-6 bg-pink-400 rounded-full border-2 border-gray-900"></div>
                </div>
                <span className="text-sm font-medium text-white">1000+ studenten</span>
              </div>
            </motion.div>

            {/* Animation switcher for demo purposes */}
            <div className="absolute bottom-4 left-4 flex gap-2">
              <button
                onClick={() => setAnimationType('webgl')}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  animationType === 'webgl' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                WebGL
              </button>
              <button
                onClick={() => setAnimationType('smooth')}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  animationType === 'smooth' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                Smooth
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}