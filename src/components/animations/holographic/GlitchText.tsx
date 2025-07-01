'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface GlitchTextProps {
  text: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  color?: 'cyan' | 'purple' | 'pink' | 'white';
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
  '6xl': 'text-6xl',
};

const colorClasses = {
  cyan: 'text-cyan-400',
  purple: 'text-purple-400',
  pink: 'text-pink-400',
  white: 'text-white',
};

export function GlitchText({ text, size = 'xl', color = 'cyan' }: GlitchTextProps) {
  const [glitchText, setGlitchText] = useState(text);
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      // Random chance to glitch
      if (Math.random() > 0.9) {
        const glitchedArray = text.split('').map((char, index) => {
          if (char === ' ') return ' ';
          return Math.random() > 0.7 
            ? characters[Math.floor(Math.random() * characters.length)]
            : char;
        });
        setGlitchText(glitchedArray.join(''));
        
        // Reset after short time
        setTimeout(() => setGlitchText(text), 100);
      }
    }, 100);

    return () => clearInterval(glitchInterval);
  }, [text]);

  return (
    <div className="relative">
      {/* Main text */}
      <motion.h1 
        className={`${sizeClasses[size]} ${colorClasses[color]} font-bold tracking-wider uppercase font-mono relative z-10`}
        style={{
          textShadow: `
            0 0 10px currentColor,
            0 0 20px currentColor,
            0 0 30px currentColor
          `
        }}
      >
        {glitchText}
      </motion.h1>

      {/* Glitch layers */}
      <motion.div
        className={`absolute inset-0 ${sizeClasses[size]} ${colorClasses[color]} font-bold tracking-wider uppercase font-mono`}
        style={{
          textShadow: '2px 2px 0 rgba(255,0,0,0.8)',
          clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)',
        }}
        animate={{
          x: [-2, 2, -2],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 0.2,
          repeat: Infinity,
          repeatDelay: 2,
        }}
      >
        {text}
      </motion.div>

      <motion.div
        className={`absolute inset-0 ${sizeClasses[size]} ${colorClasses[color]} font-bold tracking-wider uppercase font-mono`}
        style={{
          textShadow: '-2px -2px 0 rgba(0,255,255,0.8)',
          clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)',
        }}
        animate={{
          x: [2, -2, 2],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 0.2,
          repeat: Infinity,
          repeatDelay: 3,
        }}
      >
        {text}
      </motion.div>

      {/* Scanlines */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255,255,255,0.03) 2px,
            rgba(255,255,255,0.03) 4px
          )`,
        }}
      />
    </div>
  );
}