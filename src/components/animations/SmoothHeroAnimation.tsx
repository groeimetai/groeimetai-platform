'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, BarChart3, Code2, Zap, TrendingUp } from 'lucide-react';

const scenes = [
  {
    id: 'ai-chat',
    duration: 6000,
    title: 'AI Chat Assistant',
    subtitle: 'Natuurlijke conversaties',
    icon: Brain,
    gradient: 'from-blue-500 to-purple-600',
    prompts: [
      { q: 'Schrijf een marketingplan voor mijn startup', a: 'Hier is een 5-stappen strategie voor groei...' },
      { q: 'Analyseer deze verkoopcijfers', a: 'De data toont een stijging van 23% deze maand...' }
    ]
  },
  {
    id: 'data-flow',
    duration: 6000,
    title: 'Data Processing',
    subtitle: 'Real-time analyse',
    icon: BarChart3,
    gradient: 'from-purple-500 to-pink-600',
    metrics: [
      { label: 'Efficiency', value: 94, trend: '+12%' },
      { label: 'Accuracy', value: 98, trend: '+5%' },
      { label: 'Speed', value: 87, trend: '+23%' },
      { label: 'ROI', value: 156, trend: '+45%' }
    ]
  },
  {
    id: 'ai-network',
    duration: 6000,
    title: 'AI Network',
    subtitle: 'Connected intelligence',
    icon: Sparkles,
    gradient: 'from-pink-500 to-orange-600',
    nodes: ['LLM', 'Vision', 'NLP', 'Data', 'Auto', 'ML']
  }
];

export function SmoothHeroAnimation() {
  const [currentScene, setCurrentScene] = useState(0);
  const [progress, setProgress] = useState(0);
  const scene = scenes[currentScene];

  // Scene rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % scenes.length);
      setProgress(0);
    }, scene.duration);

    return () => clearInterval(interval);
  }, [currentScene, scene.duration]);

  // Progress bar
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + (100 / (scene.duration / 100)), 100));
    }, 100);

    return () => clearInterval(progressInterval);
  }, [currentScene, scene.duration]);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden" style={{ willChange: 'transform' }}>
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)',
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800/50">
        <motion.div
          className={`h-full bg-gradient-to-r ${scene.gradient}`}
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Scene indicators */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-20">
        {scenes.map((s, index) => (
          <button
            key={s.id}
            onClick={() => {
              setCurrentScene(index);
              setProgress(0);
            }}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              index === currentScene 
                ? 'w-6 bg-white' 
                : 'bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Main content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={scene.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 h-full flex items-center justify-center p-4 md:p-6"
        >
          {/* Scene 1: AI Chat */}
          {scene.id === 'ai-chat' && (
            <div className="max-w-xl w-full space-y-3">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-center mb-4"
              >
                <div className={`inline-flex p-3 rounded-full bg-gradient-to-r ${scene.gradient} mb-2`}>
                  <scene.icon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-1">{scene.title}</h2>
                <p className="text-gray-400 text-sm">{scene.subtitle}</p>
              </motion.div>

              <div className="space-y-2">
                {scene.prompts?.map((prompt, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 2 }}
                    className="space-y-1.5"
                  >
                    <div className="bg-white/10 backdrop-blur rounded-lg p-2.5 text-white">
                      <p className="text-xs md:text-sm">{prompt.q}</p>
                    </div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 2 + 1 }}
                      className={`bg-gradient-to-r ${scene.gradient} rounded-lg p-2.5 text-white ml-4 md:ml-8`}
                    >
                      <p className="text-xs md:text-sm">{prompt.a}</p>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Scene 2: Data Flow */}
          {scene.id === 'data-flow' && (
            <div className="max-w-2xl w-full">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-center mb-4"
              >
                <div className={`inline-flex p-3 rounded-full bg-gradient-to-r ${scene.gradient} mb-2`}>
                  <scene.icon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-1">{scene.title}</h2>
                <p className="text-gray-400 text-sm">{scene.subtitle}</p>
              </motion.div>

              <div className="grid grid-cols-2 gap-2 md:gap-3">
                {scene.metrics?.map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.2 }}
                    className="bg-white/10 backdrop-blur rounded-lg p-3 md:p-4 border border-white/20"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-white font-medium text-xs md:text-sm">{metric.label}</h3>
                      <span className="text-green-400 text-xs font-medium">{metric.trend}</span>
                    </div>
                    <div className="flex items-end gap-1">
                      <motion.span
                        className="text-2xl md:text-3xl font-bold text-white"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.2 + 0.3 }}
                      >
                        {metric.value}
                      </motion.span>
                      <span className="text-gray-400 text-xs mb-0.5">%</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${scene.gradient}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.value}%` }}
                        transition={{ delay: index * 0.2 + 0.5, duration: 1 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Scene 3: AI Network */}
          {scene.id === 'ai-network' && (
            <div className="max-w-2xl w-full">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-center mb-4"
              >
                <div className={`inline-flex p-3 rounded-full bg-gradient-to-r ${scene.gradient} mb-2`}>
                  <scene.icon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-1">{scene.title}</h2>
                <p className="text-gray-400 text-sm">{scene.subtitle}</p>
              </motion.div>

              <div className="relative h-64 md:h-80">
                {/* Central node */}
                <motion.div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-r ${scene.gradient} flex items-center justify-center`}>
                    <span className="text-white font-bold text-sm md:text-base">GroeimetAI</span>
                  </div>
                </motion.div>

                {/* Orbiting nodes */}
                {scene.nodes?.map((node, index) => {
                  const angle = (index * 360) / scene.nodes.length;
                  const radius = typeof window !== 'undefined' && window.innerWidth < 768 ? 60 : 80; // Responsive radius
                  const x = Math.cos((angle * Math.PI) / 180) * radius;
                  const y = Math.sin((angle * Math.PI) / 180) * radius;
                  
                  return (
                    <motion.div
                      key={node}
                      className="absolute top-1/2 left-1/2"
                      style={{
                        transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="bg-white/10 backdrop-blur rounded-lg p-2 border border-white/20">
                        <p className="text-white text-xs font-medium whitespace-nowrap">{node}</p>
                      </div>
                      <motion.div
                        className="absolute top-1/2 left-1/2 w-px bg-white/20"
                        style={{
                          height: radius,
                          transformOrigin: 'top',
                          transform: `translate(-50%, -50%) rotate(${angle + 180}deg)`,
                        }}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Floating elements */}
      <div className="absolute bottom-2 right-2 z-20">
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-white/10 backdrop-blur rounded-lg px-2 py-1.5 flex items-center gap-1.5"
        >
          <Zap className="w-3 h-3 text-yellow-400" />
          <span className="text-xs text-white">Powered by GroeimetAI</span>
        </motion.div>
      </div>
    </div>
  );
}