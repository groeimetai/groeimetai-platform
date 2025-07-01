'use client';

import { motion } from 'framer-motion';

export function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Perspective grid */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(rgba(6,182,212,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6,182,212,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: 'perspective(500px) rotateX(60deg)',
          transformOrigin: 'center center',
        }}
      />

      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(6,182,212,0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(168,85,247,0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 80%, rgba(236,72,153,0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 20%, rgba(34,197,94,0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(6,182,212,0.15) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Scanline effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(6,182,212,0.03) 2px,
            rgba(6,182,212,0.03) 4px
          )`,
        }}
      />

      {/* Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)`,
        }}
      />

      {/* Floating grid squares */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-px h-px"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            scale: [0, 20, 0],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeOut",
          }}
        >
          <div className="w-full h-full border border-cyan-500/30 rounded-sm" />
        </motion.div>
      ))}

      {/* Digital rain effect */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={`rain-${i}`}
            className="absolute text-cyan-400 font-mono text-xs"
            style={{
              left: `${i * 10}%`,
              writingMode: 'vertical-rl',
            }}
            initial={{ top: '-100%' }}
            animate={{ top: '100%' }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "linear",
            }}
          >
            {Array.from({ length: 20 }).map((_, j) => (
              <span key={j} style={{ opacity: Math.random() }}>
                {Math.random() > 0.5 ? '1' : '0'}
              </span>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}