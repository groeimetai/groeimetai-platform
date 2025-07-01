'use client';

import { motion } from 'framer-motion';
import { Target, Activity, Cpu, Wifi, Shield, Zap } from 'lucide-react';

export function HUDElements() {
  return (
    <>
      {/* Crosshair target */}
      <motion.div
        className="absolute top-[30%] left-[40%] pointer-events-none"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1.5 }}
      >
        <div className="relative w-32 h-32">
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            <Target className="w-full h-full text-cyan-500/30" strokeWidth={1} />
          </motion.div>
          <div className="absolute inset-4">
            <motion.div
              className="w-full h-full border-2 border-cyan-500/50 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full" />
          </div>
        </div>
      </motion.div>

      {/* Status indicators - Top Right */}
      <motion.div
        className="absolute top-4 right-4 space-y-2 z-30"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/30">
          <Wifi className="w-4 h-4 text-green-400" />
          <span className="text-xs text-gray-300 font-mono">CONNECTED</span>
        </div>
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/30">
          <Shield className="w-4 h-4 text-green-400" />
          <span className="text-xs text-gray-300 font-mono">SECURE</span>
        </div>
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/30">
          <Activity className="w-4 h-4 text-yellow-400 animate-pulse" />
          <span className="text-xs text-gray-300 font-mono">PROCESSING</span>
        </div>
      </motion.div>

      {/* System stats - Bottom Left */}
      <motion.div
        className="absolute bottom-4 left-4 z-30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <div className="bg-black/40 backdrop-blur-md rounded-lg border border-cyan-500/30 p-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-xs text-gray-400">CPU</div>
                <div className="text-sm text-cyan-300 font-mono">47%</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <div>
                <div className="text-xs text-gray-400">POWER</div>
                <div className="text-sm text-yellow-300 font-mono">82%</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Radar sweep */}
      <motion.div
        className="absolute bottom-[15%] right-[15%] w-40 h-40 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <div className="relative w-full h-full">
          {/* Radar circles */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute inset-0 border border-cyan-500/20 rounded-full"
              style={{
                width: `${(i / 3) * 100}%`,
                height: `${(i / 3) * 100}%`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
          
          {/* Sweep line */}
          <motion.div
            className="absolute top-1/2 left-1/2 w-20 h-px origin-left"
            style={{
              background: 'linear-gradient(to right, transparent, #06B6D4)',
              transform: 'translateY(-50%)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />

          {/* Blips */}
          <motion.div
            className="absolute w-2 h-2 bg-cyan-400 rounded-full"
            style={{ top: '20%', left: '60%' }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
          <motion.div
            className="absolute w-2 h-2 bg-purple-400 rounded-full"
            style={{ top: '70%', left: '30%' }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          />
        </div>
      </motion.div>

      {/* Corner frames */}
      <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-cyan-500/30 pointer-events-none" />
      <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-cyan-500/30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-cyan-500/30 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-cyan-500/30 pointer-events-none" />

      {/* Scanning lines */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent pointer-events-none"
        initial={{ top: '0%' }}
        animate={{ top: '100%' }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-purple-500/50 to-transparent pointer-events-none"
        initial={{ left: '0%' }}
        animate={{ left: '100%' }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </>
  );
}