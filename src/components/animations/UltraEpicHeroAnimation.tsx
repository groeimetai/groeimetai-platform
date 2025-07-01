'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Brain, Cpu, Network, Sparkles, Zap, Binary, Database } from 'lucide-react';

// Matrix rain effect
function MatrixRain() {
  const [drops, setDrops] = useState<Array<{ x: number; speed: number; chars: string[] }>>([]);
  
  useEffect(() => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+-=[]{}|;:,.<>?';
    const newDrops = Array.from({ length: 30 }, () => ({
      x: Math.random() * 100,
      speed: 0.5 + Math.random() * 1.5,
      chars: Array.from({ length: 20 }, () => characters[Math.floor(Math.random() * characters.length)])
    }));
    setDrops(newDrops);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      {drops.map((drop, i) => (
        <motion.div
          key={i}
          className="absolute text-green-400 font-mono text-xs"
          style={{ left: `${drop.x}%` }}
          initial={{ y: -100 }}
          animate={{ y: '110%' }}
          transition={{
            duration: 5 / drop.speed,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 0.1
          }}
        >
          {drop.chars.map((char, j) => (
            <div key={j} style={{ opacity: 1 - j * 0.05 }}>
              {char}
            </div>
          ))}
        </motion.div>
      ))}
    </div>
  );
}

// Particle connections
function ParticleNetwork() {
  const [particles] = useState(() => 
    Array.from({ length: 50 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2
    }))
  );

  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="particleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00ffff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      
      {particles.map((particle, i) => (
        <motion.circle
          key={i}
          r="0.3"
          fill="url(#particleGradient)"
          initial={{ cx: particle.x, cy: particle.y }}
          animate={{
            cx: [particle.x, particle.x + particle.vx * 200, particle.x],
            cy: [particle.y, particle.y + particle.vy * 200, particle.y]
          }}
          transition={{
            duration: 20 + i * 0.5,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      ))}
      
      {/* Connection lines */}
      {particles.slice(0, 20).map((p1, i) => (
        particles.slice(i + 1, i + 3).map((p2, j) => (
          <motion.line
            key={`${i}-${j}`}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke="url(#particleGradient)"
            strokeWidth="0.05"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))
      ))}
    </svg>
  );
}

// 3D rotating cube with AI brain
function AICube() {
  const cubeRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  useEffect(() => {
    animate(rotateX, 360, {
      duration: 20,
      repeat: Infinity,
      ease: 'linear'
    });
    animate(rotateY, 360, {
      duration: 30,
      repeat: Infinity,
      ease: 'linear'
    });
  }, [rotateX, rotateY]);

  return (
    <motion.div
      ref={cubeRef}
      className="relative w-64 h-64"
      style={{
        transformStyle: 'preserve-3d',
        rotateX,
        rotateY
      }}
    >
      {/* Cube faces */}
      {[
        { transform: 'translateZ(128px)', gradient: 'from-cyan-500 to-blue-600' },
        { transform: 'rotateY(180deg) translateZ(128px)', gradient: 'from-purple-500 to-pink-600' },
        { transform: 'rotateY(90deg) translateZ(128px)', gradient: 'from-green-500 to-emerald-600' },
        { transform: 'rotateY(-90deg) translateZ(128px)', gradient: 'from-orange-500 to-red-600' },
        { transform: 'rotateX(90deg) translateZ(128px)', gradient: 'from-yellow-500 to-amber-600' },
        { transform: 'rotateX(-90deg) translateZ(128px)', gradient: 'from-indigo-500 to-violet-600' }
      ].map((face, i) => (
        <div
          key={i}
          className={`absolute inset-0 bg-gradient-to-br ${face.gradient} opacity-20 backdrop-blur-xl border border-white/20 rounded-lg flex items-center justify-center`}
          style={{ transform: face.transform }}
        >
          <Brain className="w-20 h-20 text-white/50" />
        </div>
      ))}
      
      {/* Central brain */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <Brain className="w-32 h-32 text-cyan-400 drop-shadow-[0_0_30px_rgba(0,255,255,0.8)]" />
        </motion.div>
      </div>
    </motion.div>
  );
}

// Data flow visualization
function DataFlow() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
          style={{
            left: 0,
            right: 0,
            top: `${20 + i * 15}%`
          }}
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'linear'
          }}
        />
      ))}
    </div>
  );
}

// Main ultra epic animation
export function UltraEpicHeroAnimation() {
  const [activeScene, setActiveScene] = useState(0);
  const scenes = ['neural', 'data', 'quantum'];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveScene((prev) => (prev + 1) % scenes.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [scenes.length]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Base layers */}
      <MatrixRain />
      <ParticleNetwork />
      <DataFlow />

      {/* Main content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <motion.div
          key={activeScene}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.2, opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <AICube />
        </motion.div>
      </div>

      {/* UI Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Corner frames */}
        <div className="absolute top-4 left-4 w-20 h-20 border-l-2 border-t-2 border-cyan-400" />
        <div className="absolute top-4 right-4 w-20 h-20 border-r-2 border-t-2 border-cyan-400" />
        <div className="absolute bottom-4 left-4 w-20 h-20 border-l-2 border-b-2 border-cyan-400" />
        <div className="absolute bottom-4 right-4 w-20 h-20 border-r-2 border-b-2 border-cyan-400" />

        {/* Status indicators */}
        <motion.div
          className="absolute top-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-4 bg-black/50 backdrop-blur-xl px-6 py-3 rounded-full border border-cyan-400/50">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-mono">Neural Network</span>
            </div>
            <div className="w-px h-4 bg-cyan-400/50" />
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 text-sm font-mono">Data Processing</span>
            </div>
            <div className="w-px h-4 bg-purple-400/50" />
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span className="text-pink-400 text-sm font-mono">Quantum AI</span>
            </div>
          </div>
        </motion.div>

        {/* Bottom text */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-pulse">
              GroeimetAI
            </span>
          </h1>
          <p className="text-gray-400 text-lg font-mono tracking-wider">
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Intelligence Evolved
            </motion.span>
          </p>
        </motion.div>
      </div>

      {/* Overlay effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,black_100%)] pointer-events-none" />
    </div>
  );
}