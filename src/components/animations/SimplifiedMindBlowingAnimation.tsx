'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Cpu, Network, Sparkles, Zap, Binary, Database, Activity, Code2, Waves } from 'lucide-react';
import { AITextEffects } from './AITextEffects';

// Floating particles background
function FloatingParticles() {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 20 + 10
  }));

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full opacity-20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size * 10,
            height: particle.size * 10
          }}
          animate={{
            x: [0, 100, -100, 0],
            y: [0, -100, 100, 0],
            scale: [1, 1.5, 1, 1.5, 1]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
}

// Neural network connections
function NeuralConnections() {
  const [connections, setConnections] = useState<Array<{ x1: number; y1: number; x2: number; y2: number }>>([]);
  
  useEffect(() => {
    const newConnections = [];
    for (let i = 0; i < 10; i++) {
      newConnections.push({
        x1: Math.random() * 100,
        y1: Math.random() * 100,
        x2: Math.random() * 100,
        y2: Math.random() * 100
      });
    }
    setConnections(newConnections);
  }, []);

  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00ffff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {connections.map((conn, i) => (
        <motion.line
          key={i}
          x1={conn.x1}
          y1={conn.y1}
          x2={conn.x2}
          y2={conn.y2}
          stroke="url(#connectionGradient)"
          strokeWidth="0.2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 0.5, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.3
          }}
        />
      ))}
    </svg>
  );
}

// Central AI visualization
function CentralAI() {
  return (
    <motion.div
      className="relative"
      animate={{
        rotate: 360,
        scale: [1, 1.1, 1]
      }}
      transition={{
        rotate: { duration: 20, repeat: Infinity, ease: "linear" },
        scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
      }}
    >
      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 w-64 h-64 border-4 border-cyan-400/30 rounded-full"
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Middle ring */}
      <motion.div
        className="absolute inset-4 w-56 h-56 border-2 border-purple-500/50 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Inner core */}
      <motion.div
        className="absolute inset-8 w-48 h-48 bg-gradient-to-br from-cyan-400 via-purple-600 to-pink-600 rounded-full opacity-20 blur-xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Brain className="w-24 h-24 text-cyan-400 drop-shadow-[0_0_30px_rgba(0,255,255,0.8)]" />
      </div>
    </motion.div>
  );
}

// Status display
function StatusBar() {
  const [values, setValues] = useState({
    neural: 0,
    quantum: 0,
    processing: 0,
    intelligence: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setValues(prev => ({
        neural: Math.min(prev.neural + Math.random() * 5, 96),
        quantum: Math.min(prev.quantum + Math.random() * 4, 94),
        processing: Math.min(prev.processing + Math.random() * 6, 98),
        intelligence: Math.min(prev.intelligence + Math.random() * 3, 95)
      }));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const items = [
    { key: 'neural', label: 'Neural Network', icon: Network, color: 'cyan' },
    { key: 'quantum', label: 'Quantum Core', icon: Cpu, color: 'purple' },
    { key: 'processing', label: 'Processing', icon: Activity, color: 'green' },
    { key: 'intelligence', label: 'AI Intelligence', icon: Brain, color: 'pink' }
  ];

  return (
    <motion.div
      className="absolute top-8 right-8 space-y-3"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, staggerChildren: 0.1 }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const value = values[item.key as keyof typeof values];
        
        return (
          <motion.div
            key={item.key}
            className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-lg p-3 min-w-[200px]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 text-${item.color}-400`} />
                <span className="text-xs font-mono text-gray-300">{item.label}</span>
              </div>
              <span className="text-sm font-bold text-white">{Math.round(value)}%</span>
            </div>
            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r from-${item.color}-500 to-${item.color}-600`}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// Main component
export function SimplifiedMindBlowingAnimation() {
  const [textEffect, setTextEffect] = useState<'typewriter' | 'glitch' | 'morph' | 'rotate' | 'dissolve' | 'binary' | 'neural'>('neural');
  const [language, setLanguage] = useState<'en' | 'nl'>('nl');

  useEffect(() => {
    // Cycle through text effects
    const effects = ['typewriter', 'glitch', 'morph', 'rotate', 'dissolve', 'binary', 'neural'] as const;
    let index = 0;
    
    const interval = setInterval(() => {
      index = (index + 1) % effects.length;
      setTextEffect(effects[index]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20" />
      <FloatingParticles />
      <NeuralConnections />
      
      {/* Matrix rain effect */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-green-400 font-mono text-xs"
            style={{ left: `${i * 5}%` }}
            initial={{ y: -100 }}
            animate={{ y: '110%' }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          >
            {Array.from({ length: 20 }).map((_, j) => (
              <div key={j} style={{ opacity: 1 - j * 0.05 }}>
                {String.fromCharCode(33 + Math.floor(Math.random() * 94))}
              </div>
            ))}
          </motion.div>
        ))}
      </div>

      {/* Central content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center">
        {/* Central AI visualization */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, type: "spring" }}
        >
          <CentralAI />
        </motion.div>

        {/* Animated text */}
        <motion.div
          className="absolute bottom-20 text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <AITextEffects
            effect={textEffect}
            language={language}
            text={{
              nl: 'GroeimetAI - Intelligentie Geëvolueerd',
              en: 'GroeimetAI - Intelligence Evolved'
            }}
            duration={5000}
          />
          
          {/* Effect indicator */}
          <motion.p
            className="text-xs text-gray-500 font-mono mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Effect: {textEffect.toUpperCase()}
          </motion.p>
        </motion.div>
      </div>

      {/* UI Elements */}
      <StatusBar />
      
      {/* Language toggle */}
      <motion.button
        className="absolute top-8 left-8 z-20 bg-black/60 backdrop-blur-xl border border-white/20 rounded-lg px-4 py-2 text-xs font-mono text-white hover:bg-white/10 transition-all"
        onClick={() => setLanguage(lang => lang === 'en' ? 'nl' : 'en')}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {language === 'en' ? '🇳🇱 NL' : '🇬🇧 EN'}
      </motion.button>

      {/* Corner frames */}
      <div className="absolute top-4 left-4 w-20 h-20 border-l-2 border-t-2 border-cyan-400/50" />
      <div className="absolute top-4 right-4 w-20 h-20 border-r-2 border-t-2 border-cyan-400/50" />
      <div className="absolute bottom-4 left-4 w-20 h-20 border-l-2 border-b-2 border-cyan-400/50" />
      <div className="absolute bottom-4 right-4 w-20 h-20 border-r-2 border-b-2 border-cyan-400/50" />

      {/* Scan line */}
      <motion.div
        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
        initial={{ top: 0 }}
        animate={{ top: '100%' }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}