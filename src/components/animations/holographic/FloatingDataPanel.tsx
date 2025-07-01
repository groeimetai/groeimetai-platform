'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Metric {
  label: string;
  value: number;
  unit?: string;
  trend: string;
}

interface FloatingDataPanelProps {
  title: string;
  metrics: Metric[];
  variant?: 'cyan' | 'purple' | 'pink' | 'green';
}

const variantStyles = {
  cyan: {
    border: 'border-cyan-500/50',
    glow: 'shadow-[0_0_30px_rgba(6,182,212,0.5)]',
    titleColor: 'text-cyan-400',
    valueColor: 'text-cyan-300',
    bgGradient: 'from-cyan-500/10 to-transparent',
  },
  purple: {
    border: 'border-purple-500/50',
    glow: 'shadow-[0_0_30px_rgba(168,85,247,0.5)]',
    titleColor: 'text-purple-400',
    valueColor: 'text-purple-300',
    bgGradient: 'from-purple-500/10 to-transparent',
  },
  pink: {
    border: 'border-pink-500/50',
    glow: 'shadow-[0_0_30px_rgba(236,72,153,0.5)]',
    titleColor: 'text-pink-400',
    valueColor: 'text-pink-300',
    bgGradient: 'from-pink-500/10 to-transparent',
  },
  green: {
    border: 'border-green-500/50',
    glow: 'shadow-[0_0_30px_rgba(34,197,94,0.5)]',
    titleColor: 'text-green-400',
    valueColor: 'text-green-300',
    bgGradient: 'from-green-500/10 to-transparent',
  },
};

export function FloatingDataPanel({ 
  title, 
  metrics, 
  variant = 'cyan' 
}: FloatingDataPanelProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      className={`
        relative bg-black/40 backdrop-blur-xl border ${styles.border} 
        rounded-xl p-6 ${styles.glow} min-w-[280px]
      `}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${styles.bgGradient} rounded-xl`} />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Title */}
        <h3 className={`${styles.titleColor} text-sm font-mono mb-4 uppercase tracking-wider`}>
          {title}
        </h3>

        {/* Metrics */}
        <div className="space-y-3">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between"
            >
              <span className="text-gray-400 text-sm">{metric.label}</span>
              <div className="flex items-center gap-2">
                <span className={`${styles.valueColor} font-mono text-lg font-bold`}>
                  {metric.value}{metric.unit}
                </span>
                <div className={`flex items-center text-xs ${
                  metric.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'
                }`}>
                  {metric.trend.startsWith('+') ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span className="ml-1">{metric.trend}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Animated scan line */}
        <motion.div
          className={`absolute left-0 right-0 h-px bg-gradient-to-r ${styles.bgGradient} opacity-50`}
          initial={{ top: 0 }}
          animate={{ top: '100%' }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Corner decorations */}
      <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 ${styles.border}`} />
      <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 ${styles.border}`} />
      <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 ${styles.border}`} />
      <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 ${styles.border}`} />
    </motion.div>
  );
}