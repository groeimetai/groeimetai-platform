'use client';

import { HolographicOverlay } from './HolographicOverlay';
import './holographic-overlay.css';

export function HolographicHeroSection() {
  return (
    <section className="relative min-h-screen bg-black overflow-hidden">
      {/* Main holographic overlay */}
      <HolographicOverlay />

      {/* Content overlay - can be integrated with existing hero content */}
      <div className="relative z-40 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6 px-4">
          <h1 className="text-4xl md:text-6xl font-bold holographic-text">
            Welcome to the Future
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Experience cutting-edge AI education with our immersive holographic interface
          </p>
          
          <div className="flex gap-4 justify-center mt-8">
            <button className="cyber-button">
              Start Learning
            </button>
            <button className="glass-panel px-6 py-3 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/10 transition-colors">
              View Courses
            </button>
          </div>
        </div>
      </div>

      {/* Additional styling layers */}
      <div className="absolute inset-0 circuit-pattern pointer-events-none opacity-20" />
      <div className="absolute inset-0 hex-grid pointer-events-none opacity-10" />
    </section>
  );
}