'use client';

import { useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Cpu } from 'lucide-react';

// Lazy load animations for performance
const SmoothHeroAnimation = lazy(() => import('./SmoothHeroAnimation').then(m => ({ default: m.SmoothHeroAnimation })));
const EpicHeroAnimation = lazy(() => import('./EpicHeroAnimation').then(m => ({ default: m.EpicHeroAnimation })));
const UltraEpicHeroAnimation = lazy(() => import('./UltraEpicHeroAnimation').then(m => ({ default: m.UltraEpicHeroAnimation })));
const MindBlowingHeroAnimation = lazy(() => import('./SimplifiedMindBlowingAnimation').then(m => ({ default: m.SimplifiedMindBlowingAnimation })));

// Loading component
function AnimationLoader() {
  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <Cpu className="w-12 h-12 text-cyan-400" />
      </motion.div>
    </div>
  );
}

export function HeroAnimationShowcase() {
  const [activeAnimation, setActiveAnimation] = useState<'smooth' | 'epic' | 'ultra' | 'mindblowing'>('mindblowing');

  const animations = [
    {
      id: 'smooth',
      name: 'Smooth Flow',
      icon: Sparkles,
      gradient: 'from-blue-500 to-purple-600',
      description: 'Clean & Professional'
    },
    {
      id: 'epic',
      name: '3D WebGL',
      icon: Zap,
      gradient: 'from-purple-500 to-pink-600',
      description: 'Interactive 3D Scene'
    },
    {
      id: 'ultra',
      name: 'Ultra Epic',
      icon: Cpu,
      gradient: 'from-cyan-500 to-purple-600',
      description: 'Maximum Visual Impact'
    },
    {
      id: 'mindblowing',
      name: 'Mind Blowing',
      icon: Cpu,
      gradient: 'from-red-500 via-purple-600 to-cyan-500',
      description: '🤯 All Effects Combined'
    }
  ];

  return (
    <div className="relative w-full h-full">
      {/* Animation Container */}
      <div className="w-full h-full">
        <Suspense fallback={<AnimationLoader />}>
          {activeAnimation === 'smooth' && <SmoothHeroAnimation />}
          {activeAnimation === 'epic' && <EpicHeroAnimation />}
          {activeAnimation === 'ultra' && <UltraEpicHeroAnimation />}
          {activeAnimation === 'mindblowing' && <MindBlowingHeroAnimation />}
        </Suspense>
      </div>

      {/* Animation Selector */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
        <motion.div 
          className="bg-black/80 backdrop-blur-xl rounded-full shadow-2xl p-1 flex gap-1 border border-white/10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {animations.map((anim) => {
            const Icon = anim.icon;
            const isActive = activeAnimation === anim.id;
            
            return (
              <motion.button
                key={anim.id}
                onClick={() => setActiveAnimation(anim.id as any)}
                className={`relative px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-2 ${
                  isActive 
                    ? 'text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isActive && (
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${anim.gradient} rounded-full`}
                    layoutId="activeAnimation"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{anim.name}</span>
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* Animation Info */}
      <motion.div
        className="absolute bottom-2 left-2 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="bg-black/60 backdrop-blur-md rounded-lg px-3 py-2 text-xs text-gray-400">
          <p className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            {animations.find(a => a.id === activeAnimation)?.description}
          </p>
        </div>
      </motion.div>

      {/* Performance tip */}
      {activeAnimation === 'epic' && (
        <motion.div
          className="absolute bottom-2 right-2 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <div className="bg-yellow-500/20 backdrop-blur-md rounded-lg px-3 py-2 text-xs text-yellow-400 border border-yellow-500/30">
            <p>💡 WebGL mode - Requires modern GPU</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}