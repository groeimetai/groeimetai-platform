'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, GraduationCap, Users, BookOpen, Award, Sparkles, ChevronRight, Star } from 'lucide-react';

// Animated learning path visualization
function LearningPath() {
  const milestones = [
    { id: 1, label: 'Start', icon: BookOpen, color: 'from-blue-400 to-blue-600' },
    { id: 2, label: 'Basis', icon: Brain, color: 'from-purple-400 to-purple-600' },
    { id: 3, label: 'Praktijk', icon: Sparkles, color: 'from-pink-400 to-pink-600' },
    { id: 4, label: 'Expert', icon: Award, color: 'from-green-400 to-green-600' }
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg className="absolute w-full h-full" viewBox="0 0 800 400">
        {/* Curved path */}
        <motion.path
          d="M 100 200 Q 300 100 500 200 T 700 200"
          fill="none"
          stroke="url(#pathGradient)"
          strokeWidth="2"
          strokeDasharray="5 5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, ease: "easeInOut" }}
        />
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Milestones */}
      <div className="relative w-full max-w-2xl">
        <div className="flex justify-between items-center">
          {milestones.map((milestone, index) => {
            const Icon = milestone.icon;
            return (
              <motion.div
                key={milestone.id}
                className="relative"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.3, type: "spring" }}
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${milestone.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <motion.p
                  className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-600 whitespace-nowrap"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.3 + 0.2 }}
                >
                  {milestone.label}
                </motion.p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Student avatars showing community
function StudentCommunity() {
  const [students] = useState(() => 
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      delay: Math.random() * 2
    }))
  );

  return (
    <div className="absolute inset-0 pointer-events-none">
      {students.map((student) => (
        <motion.div
          key={student.id}
          className="absolute w-10 h-10"
          style={{ left: `${student.x}%`, top: `${student.y}%` }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.3] }}
          transition={{
            delay: student.delay,
            duration: 3,
            repeat: Infinity,
            repeatDelay: 5
          }}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Floating AI concepts
function FloatingConcepts() {
  const concepts = [
    { text: 'ChatGPT', x: 15, y: 20 },
    { text: 'Prompt Engineering', x: 70, y: 15 },
    { text: 'LLM', x: 80, y: 60 },
    { text: 'Machine Learning', x: 10, y: 70 },
    { text: 'Neural Networks', x: 60, y: 80 },
    { text: 'AI Ethics', x: 25, y: 50 },
    { text: 'GenAI', x: 85, y: 35 },
    { text: 'Deep Learning', x: 45, y: 25 }
  ];

  return (
    <>
      {concepts.map((concept, index) => (
        <motion.div
          key={concept.text}
          className="absolute text-sm font-medium text-gray-500"
          style={{ left: `${concept.x}%`, top: `${concept.y}%` }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0, 0.6, 0],
            scale: [0.8, 1, 0.8],
            y: [0, -20, 0]
          }}
          transition={{
            duration: 4,
            delay: index * 0.5,
            repeat: Infinity,
            repeatDelay: 2
          }}
        >
          {concept.text}
        </motion.div>
      ))}
    </>
  );
}

// Main hero content
function HeroContent() {
  const [currentWord, setCurrentWord] = useState(0);
  const words = ['Leren', 'Groeien', 'Excelleren', 'Innoveren'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <motion.div
      className="relative z-20 text-center space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Badge */}
      <motion.div
        className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
      >
        <Star className="w-4 h-4" />
        <span>Nederlands #1 AI Leerplatform</span>
      </motion.div>

      {/* Main heading */}
      <div className="space-y-4">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
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
          <span className="text-gray-900"> met AI</span>
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Hét platform waar professionals en studenten alles leren over GenAI en LLMs. 
          Van ChatGPT basics tot geavanceerde AI-toepassingen.
        </p>
      </div>

      {/* Stats */}
      <motion.div
        className="flex justify-center gap-8 pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-900">5000+</p>
          <p className="text-sm text-gray-600">Studenten</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-900">50+</p>
          <p className="text-sm text-gray-600">Cursussen</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-900">4.9</p>
          <p className="text-sm text-gray-600">Rating</p>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        className="pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <button className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
          <span>Start je AI-reis</span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>

      {/* Trust indicators */}
      <motion.div
        className="flex items-center justify-center gap-6 pt-8 opacity-60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1 }}
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
  );
}

// Main component
export function PlatformHeroAnimation() {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Background elements */}
      <StudentCommunity />
      <FloatingConcepts />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      {/* Learning path visualization */}
      <div className="absolute inset-0 opacity-20">
        <LearningPath />
      </div>

      {/* Main content */}
      <div className="relative h-full flex items-center justify-center">
        <HeroContent />
      </div>

      {/* Subtle animated gradient */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)'
          ]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
}