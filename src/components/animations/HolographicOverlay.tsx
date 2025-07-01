'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FloatingDataPanel } from './holographic/FloatingDataPanel';
import { CircularProgress } from './holographic/CircularProgress';
import { CodeTyper } from './holographic/CodeTyper';
import { GlitchText } from './holographic/GlitchText';
import { NeonBorder } from './holographic/NeonBorder';
import { AnimatedChart } from './holographic/AnimatedChart';
import { HUDElements } from './holographic/HUDElements';
import { ParticleField } from './holographic/ParticleField';
import { GridBackground } from './holographic/GridBackground';

export function HolographicOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Parallax transforms
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.3]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ perspective: '1000px' }}
    >
      {/* Background layers */}
      <GridBackground />
      <ParticleField />

      {/* Main holographic container */}
      <motion.div 
        className="absolute inset-0"
        style={{ opacity }}
      >
        {/* Floating data panels with parallax */}
        <motion.div 
          className="absolute top-[10%] left-[5%] z-20"
          style={{ y: y1 }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <FloatingDataPanel 
            title="System Performance"
            metrics={[
              { label: "CPU Usage", value: 76, trend: "+12%" },
              { label: "Memory", value: 4.2, unit: "GB", trend: "-5%" },
              { label: "Network", value: 892, unit: "Mbps", trend: "+23%" }
            ]}
          />
        </motion.div>

        <motion.div 
          className="absolute top-[50%] right-[10%] z-20"
          style={{ y: y2 }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <FloatingDataPanel 
            title="AI Model Status"
            metrics={[
              { label: "Accuracy", value: 98.7, unit: "%", trend: "+2.3%" },
              { label: "Latency", value: 42, unit: "ms", trend: "-15%" },
              { label: "Throughput", value: 1200, unit: "req/s", trend: "+8%" }
            ]}
            variant="purple"
          />
        </motion.div>

        {/* Circular progress indicators */}
        <motion.div 
          className="absolute bottom-[20%] left-[15%] z-20"
          style={{ y: y1 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <div className="flex gap-6">
            <CircularProgress 
              value={87} 
              label="Training" 
              size="lg"
              color="cyan"
            />
            <CircularProgress 
              value={92} 
              label="Validation" 
              size="lg"
              color="purple"
            />
            <CircularProgress 
              value={95} 
              label="Deployment" 
              size="lg"
              color="pink"
            />
          </div>
        </motion.div>

        {/* Code snippet that types itself */}
        <motion.div 
          className="absolute top-[25%] right-[5%] z-20 max-w-md"
          style={{ y: y3 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <NeonBorder color="green">
            <CodeTyper />
          </NeonBorder>
        </motion.div>

        {/* Glitch text effect */}
        <motion.div 
          className="absolute top-[10%] left-[50%] transform -translate-x-1/2 z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <GlitchText 
            text="NEURAL NETWORK ACTIVE" 
            size="2xl"
          />
        </motion.div>

        {/* Animated charts */}
        <motion.div 
          className="absolute bottom-[10%] right-[20%] z-20"
          style={{ y: y2 }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <AnimatedChart />
        </motion.div>

        {/* HUD elements */}
        <HUDElements />

        {/* Center focus element */}
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        >
          <div className="relative">
            <motion.div
              className="w-64 h-64 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)',
                boxShadow: '0 0 60px rgba(6,182,212,0.5), inset 0 0 60px rgba(6,182,212,0.2)',
              }}
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 360],
              }}
              transition={{
                scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 20, repeat: Infinity, ease: "linear" }
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <GlitchText text="AI" size="6xl" />
            </div>
          </div>
        </motion.div>

        {/* Floating mini panels */}
        <motion.div 
          className="absolute top-[60%] left-[10%] z-25"
          style={{ y: y1 }}
          animate={{ 
            y: [0, -10, 0],
            rotate: [-2, 2, -2]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="bg-black/30 backdrop-blur-md border border-cyan-500/50 rounded-lg p-3 shadow-[0_0_20px_rgba(6,182,212,0.5)]">
            <div className="text-cyan-400 text-xs font-mono">STATUS: ONLINE</div>
            <div className="text-white text-sm mt-1">Neural Processing Active</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}