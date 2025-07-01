'use client';

import { GPUParticleSystem } from '@/components/animations/GPUParticleSystem';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ParticlesDemoPage() {
  return (
    <div className="relative w-full h-screen bg-gray-900">
      {/* Back button */}
      <div className="absolute top-4 left-4 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Terug naar home</span>
        </Link>
      </div>

      {/* Title */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <h1 className="text-white text-2xl font-bold">GPU Particle System Demo</h1>
        <p className="text-white/70 text-center text-sm mt-1">100,000+ particles rendered at 60fps</p>
      </div>

      {/* Particle System */}
      <GPUParticleSystem />
    </div>
  );
}