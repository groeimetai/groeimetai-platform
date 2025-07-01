'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlayCircle, CheckCircle, Star, GraduationCap, Award, Users, BookOpen, Brain, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Learning path visualization
function LearningPath() {
  const milestones = [
    { id: 1, label: 'Start', icon: BookOpen, color: 'from-blue-400 to-blue-600' },
    { id: 2, label: 'Basis', icon: Brain, color: 'from-purple-400 to-purple-600' },
    { id: 3, label: 'Praktijk', icon: Sparkles, color: 'from-pink-400 to-pink-600' },
    { id: 4, label: 'Expert', icon: Award, color: 'from-green-400 to-green-600' }
  ];

  return (
    <div className="flex justify-between items-center w-full max-w-md mx-auto">
      {/* Connection line */}
      <div className="absolute h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 w-full" />
      
      {/* Milestones */}
      {milestones.map((milestone, index) => {
        const Icon = milestone.icon;
        return (
          <motion.div
            key={milestone.id}
            className="relative z-10"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.2, type: "spring" }}
          >
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${milestone.color} flex items-center justify-center shadow-lg`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <motion.p
              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-600 whitespace-nowrap"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.2 + 0.1 }}
            >
              {milestone.label}
            </motion.p>
          </motion.div>
        );
      })}
    </div>
  );
}

// Floating AI concepts
function FloatingConcepts() {
  const concepts = [
    { text: 'ChatGPT', delay: 0 },
    { text: 'Prompt Engineering', delay: 0.5 },
    { text: 'LLM', delay: 1 },
    { text: 'Machine Learning', delay: 1.5 },
    { text: 'Neural Networks', delay: 2 },
    { text: 'AI Ethics', delay: 2.5 }
  ];

  return (
    <div className="absolute inset-0 pointer-events-none">
      {concepts.map((concept, index) => (
        <motion.div
          key={concept.text}
          className="absolute text-sm font-medium text-blue-600/30"
          style={{ 
            left: `${20 + (index % 3) * 30}%`, 
            top: `${20 + Math.floor(index / 3) * 40}%` 
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0, 0.6, 0],
            scale: [0.8, 1, 0.8],
            y: [0, -20, 0]
          }}
          transition={{
            duration: 4,
            delay: concept.delay,
            repeat: Infinity,
            repeatDelay: 2
          }}
        >
          {concept.text}
        </motion.div>
      ))}
    </div>
  );
}

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

export function HeroSectionV2() {
  const [currentWord, setCurrentWord] = useState(0);
  const words = ['Leren', 'Groeien', 'Excelleren', 'Innoveren'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
      
      <div className="container-width section-padding relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[700px] py-12">
          {/* Left Column - Content */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Star className="w-4 h-4" />
              <span>Nederlands #1 AI Leerplatform</span>
            </motion.div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentWord}
                    className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    {words[currentWord]}
                  </motion.span>
                </AnimatePresence>
                <span> met AI</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                Hét platform waar professionals en studenten alles leren over GenAI en LLMs. 
                Van ChatGPT basics tot geavanceerde AI-toepassingen.
              </p>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-2 gap-3">
              {highlights.map((highlight, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-center space-x-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{highlight}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white group" asChild>
                <Link href="/cursussen" className="flex items-center space-x-2">
                  <span>Start je AI-reis</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2" asChild>
                <Link href="/demo" className="flex items-center space-x-2">
                  <PlayCircle className="w-4 h-4" />
                  <span>Bekijk demo</span>
                </Link>
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div 
              className="flex items-center gap-6 pt-4 text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                <span className="text-sm">Erkende certificaten</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span className="text-sm">Nederlandse experts</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Visual */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Floating concepts background */}
            <FloatingConcepts />
            
            {/* Learning path */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-100">
              <h3 className="text-center text-2xl font-bold text-gray-900 mb-12">
                Jouw leerpad naar AI-expertise
              </h3>
              <LearningPath />
              
              {/* Active learners indicator */}
              <motion.div 
                className="mt-16 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-full">
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full border-2 border-white flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    1000+ studenten online
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Floating stats */}
            <motion.div 
              className="absolute -top-4 -right-4 bg-white rounded-lg p-4 shadow-lg border"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, type: "spring" }}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">4.9</div>
                <div className="text-sm text-gray-600">Rating</div>
              </div>
            </motion.div>
            
            <motion.div 
              className="absolute -bottom-4 -left-4 bg-white rounded-lg p-4 shadow-lg border"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4, type: "spring" }}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">50+</div>
                <div className="text-sm text-gray-600">Cursussen</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom stats bar */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-12 border-t border-gray-200 mt-12 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          {stats.map((stat, index) => (
            <motion.div 
              key={index} 
              className="text-center lg:text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + index * 0.1 }}
            >
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}