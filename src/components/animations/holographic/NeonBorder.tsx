'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface NeonBorderProps {
  children: ReactNode;
  color?: 'cyan' | 'purple' | 'pink' | 'green';
  animated?: boolean;
}

const colorMap = {
  cyan: {
    primary: '#06B6D4',
    secondary: '#0891B2',
    glow: 'rgba(6,182,212,0.5)',
  },
  purple: {
    primary: '#A855F7',
    secondary: '#9333EA',
    glow: 'rgba(168,85,247,0.5)',
  },
  pink: {
    primary: '#EC4899',
    secondary: '#DB2777',
    glow: 'rgba(236,72,153,0.5)',
  },
  green: {
    primary: '#22C55E',
    secondary: '#16A34A',
    glow: 'rgba(34,197,94,0.5)',
  },
};

export function NeonBorder({ children, color = 'cyan', animated = true }: NeonBorderProps) {
  const colors = colorMap[color];

  return (
    <div className="relative">
      {/* Animated border */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ filter: `drop-shadow(0 0 10px ${colors.glow})` }}
      >
        <defs>
          <linearGradient id={`neon-gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="50%" stopColor={colors.secondary} />
            <stop offset="100%" stopColor={colors.primary} />
          </linearGradient>
        </defs>

        <motion.rect
          x="1"
          y="1"
          width="calc(100% - 2px)"
          height="calc(100% - 2px)"
          rx="8"
          fill="none"
          stroke={`url(#neon-gradient-${color})`}
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={animated ? {
            pathLength: [0, 1, 1, 0],
            strokeDasharray: ['0 100', '100 0', '100 0', '0 100'],
          } : {
            pathLength: 1,
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Corner highlights */}
        <motion.circle
          cx="8"
          cy="8"
          r="3"
          fill={colors.primary}
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.circle
          cx="calc(100% - 8px)"
          cy="8"
          r="3"
          fill={colors.primary}
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
        <motion.circle
          cx="8"
          cy="calc(100% - 8px)"
          r="3"
          fill={colors.primary}
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.circle
          cx="calc(100% - 8px)"
          cy="calc(100% - 8px)"
          r="3"
          fill={colors.primary}
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          }}
        />
      </svg>

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Inner glow */}
      <div 
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${colors.glow} 0%, transparent 70%)`,
          opacity: 0.3,
        }}
      />
    </div>
  );
}