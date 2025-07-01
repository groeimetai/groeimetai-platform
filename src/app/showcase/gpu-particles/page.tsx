'use client';

import { useState } from 'react';
import { GPUParticleSystemAdvanced } from '@/components/animations/GPUParticleSystemAdvanced';
import Link from 'next/link';
import { ArrowLeft, Cpu, Zap, Activity } from 'lucide-react';

export default function GPUParticlesShowcasePage() {
  const [showInfo, setShowInfo] = useState(true);

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      {/* Navigation */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Activity className="w-4 h-4" />
          <span>{showInfo ? 'Hide' : 'Show'} Info</span>
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Title and Info Panel */}
      {showInfo && (
        <div className="absolute top-20 right-4 z-20 bg-black/80 backdrop-blur-xl rounded-xl p-6 max-w-md space-y-4 border border-white/10">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
              <Cpu className="w-6 h-6 text-blue-500" />
              GPU Particle System
            </h1>
            <p className="text-gray-300 text-sm">
              Advanced WebGL-powered particle simulation running entirely on your GPU
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <div>
                <h3 className="text-white font-medium">Massive Scale</h3>
                <p className="text-gray-400 text-sm">
                  Render up to 300,000 particles at 60fps using GPU instancing and optimized shaders
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <div>
                <h3 className="text-white font-medium">Dynamic Behaviors</h3>
                <p className="text-gray-400 text-sm">
                  Three unique modes: Orbiting with trails, Streaming flow fields, and Explosive physics
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">3</span>
              </div>
              <div>
                <h3 className="text-white font-medium">Interactive Forces</h3>
                <p className="text-gray-400 text-sm">
                  Mouse-controlled force fields, turbulence, and curl noise for realistic motion
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">4</span>
              </div>
              <div>
                <h3 className="text-white font-medium">Visual Effects</h3>
                <p className="text-gray-400 text-sm">
                  HDR glow, motion blur, color gradients, and distance-based LOD optimization
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>Powered by Three.js + Custom GLSL Shaders</span>
            </div>
          </div>
        </div>
      )}

      {/* GPU Particle System */}
      <GPUParticleSystemAdvanced />

      {/* Performance Tips */}
      <div className="absolute bottom-4 right-4 z-10 bg-black/70 backdrop-blur rounded-lg p-3 max-w-xs">
        <p className="text-white text-xs">
          <span className="font-medium text-yellow-400">Tip:</span> For best performance, use a dedicated GPU. 
          Integrated graphics may experience lower framerates with high particle counts.
        </p>
      </div>
    </div>
  );
}