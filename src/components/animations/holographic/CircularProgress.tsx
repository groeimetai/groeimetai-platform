'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface CircularProgressProps {
  value: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'cyan' | 'purple' | 'pink' | 'green';
}

const sizeMap = {
  sm: { width: 80, height: 80, strokeWidth: 3 },
  md: { width: 100, height: 100, strokeWidth: 4 },
  lg: { width: 120, height: 120, strokeWidth: 5 },
};

const colorMap = {
  cyan: {
    gradient: ['#06B6D4', '#0891B2'],
    glow: 'drop-shadow(0 0 20px rgba(6,182,212,0.5))',
    text: 'text-cyan-400',
  },
  purple: {
    gradient: ['#A855F7', '#9333EA'],
    glow: 'drop-shadow(0 0 20px rgba(168,85,247,0.5))',
    text: 'text-purple-400',
  },
  pink: {
    gradient: ['#EC4899', '#DB2777'],
    glow: 'drop-shadow(0 0 20px rgba(236,72,153,0.5))',
    text: 'text-pink-400',
  },
  green: {
    gradient: ['#22C55E', '#16A34A'],
    glow: 'drop-shadow(0 0 20px rgba(34,197,94,0.5))',
    text: 'text-green-400',
  },
};

export function CircularProgress({ 
  value, 
  label, 
  size = 'md', 
  color = 'cyan' 
}: CircularProgressProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const { width, height, strokeWidth } = sizeMap[size];
  const { gradient, glow, text } = colorMap[color];
  
  const radius = (width - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (displayValue / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setDisplayValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="relative">
      <svg
        width={width}
        height={height}
        className={`transform -rotate-90 ${glow}`}
      >
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <defs>
          <linearGradient id={`progress-gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradient[0]} />
            <stop offset="100%" stopColor={gradient[1]} />
          </linearGradient>
        </defs>
        
        <motion.circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          stroke={`url(#progress-gradient-${label})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />

        {/* Animated pulse effect */}
        <motion.circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          stroke={gradient[0]}
          strokeWidth={1}
          fill="none"
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{ 
            opacity: [0.8, 0, 0.8],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          className={`text-2xl font-bold ${text} font-mono`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {displayValue}%
        </motion.div>
        <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">
          {label}
        </div>
      </div>

      {/* Orbiting particle */}
      <motion.div
        className="absolute"
        style={{
          top: height / 2 - radius,
          left: width / 2,
          width: 4,
          height: 4,
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div 
          className="w-1 h-1 rounded-full"
          style={{ 
            backgroundColor: gradient[0],
            boxShadow: `0 0 10px ${gradient[0]}`,
          }}
        />
      </motion.div>
    </div>
  );
}