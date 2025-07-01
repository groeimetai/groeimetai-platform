'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Code, Sparkles, Zap, Layers } from 'lucide-react';
import { ParticleBackground } from '@/components/animations/ParticleBackground';
import { GPUParticleSystem } from '@/components/animations/GPUParticleSystem';

export default function ParticleSystemsExamplePage() {
  const [activeExample, setActiveExample] = useState<'background' | 'hero' | 'interactive'>('background');
  const [showCode, setShowCode] = useState(false);

  const examples = {
    background: {
      title: 'Subtle Background',
      description: 'Lightweight particle effect for page backgrounds',
      code: `import { ParticleBackground } from '@/components/animations/ParticleBackground';

function MyPage() {
  return (
    <div className="relative min-h-screen">
      <ParticleBackground particleCount={1000} />
      <div className="relative z-10">
        {/* Your content here */}
      </div>
    </div>
  );
}`
    },
    hero: {
      title: 'Hero Section',
      description: 'High-impact particle animation for hero sections',
      code: `import { GPUParticleSystem } from '@/components/animations/GPUParticleSystem';

function HeroSection() {
  return (
    <div className="relative h-[600px]">
      <GPUParticleSystem />
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="text-6xl font-bold text-white">
          Your Title Here
        </h1>
      </div>
    </div>
  );
}`
    },
    interactive: {
      title: 'Interactive Showcase',
      description: 'Full-featured particle system with user controls',
      code: `import { GPUParticleSystemAdvanced } from '@/components/animations/GPUParticleSystemAdvanced';

function InteractiveDemo() {
  return (
    <div className="w-full h-screen">
      <GPUParticleSystemAdvanced />
    </div>
  );
}`
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Particle Background */}
      {activeExample === 'background' && (
        <ParticleBackground particleCount={800} className="opacity-30" />
      )}

      {/* Header */}
      <header className="relative z-10 border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              GPU Particle Systems
            </h1>
          </div>
          <button
            onClick={() => setShowCode(!showCode)}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
          >
            <Code className="w-4 h-4" />
            <span>{showCode ? 'Hide' : 'Show'} Code</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Example Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {Object.entries(examples).map(([key, example]) => (
            <button
              key={key}
              onClick={() => setActiveExample(key as any)}
              className={`p-6 rounded-xl border transition-all ${
                activeExample === key
                  ? 'bg-white/10 border-purple-500'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                {key === 'background' && <Layers className="w-5 h-5 text-blue-500" />}
                {key === 'hero' && <Zap className="w-5 h-5 text-purple-500" />}
                {key === 'interactive' && <Sparkles className="w-5 h-5 text-pink-500" />}
                <h3 className="font-semibold">{example.title}</h3>
              </div>
              <p className="text-sm text-white/70 text-left">{example.description}</p>
            </button>
          ))}
        </div>

        {/* Code Example */}
        {showCode && (
          <div className="mb-8 bg-black/50 backdrop-blur rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Code className="w-5 h-5" />
              Implementation
            </h3>
            <pre className="overflow-x-auto">
              <code className="text-sm text-gray-300">
                {examples[activeExample].code}
              </code>
            </pre>
          </div>
        )}

        {/* Demo Area */}
        <div className="bg-black/30 backdrop-blur rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-semibold">{examples[activeExample].title} Demo</h3>
          </div>
          
          <div className="relative" style={{ height: activeExample === 'background' ? '400px' : '600px' }}>
            {activeExample === 'background' && (
              <div className="p-8 flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-bold">Subtle Background Effect</h2>
                  <p className="text-xl text-white/70">
                    Low-impact particles that add depth without distraction
                  </p>
                  <p className="text-sm text-white/50">
                    Perfect for content-heavy pages
                  </p>
                </div>
              </div>
            )}
            
            {activeExample === 'hero' && (
              <div className="relative h-full bg-gray-800">
                <GPUParticleSystem />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <h2 className="text-5xl font-bold">Hero Animation</h2>
                    <p className="text-xl text-white/80">
                      High-performance GPU particles
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {activeExample === 'interactive' && (
              <div className="h-full bg-gray-800 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-bold">Interactive Demo</h2>
                  <p className="text-white/70">
                    Visit the full showcase for the interactive experience
                  </p>
                  <Link
                    href="/showcase/gpu-particles"
                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Open Full Showcase</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Performance Tips */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Performance Tips
            </h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>• Use fewer particles for mobile devices</li>
              <li>• Enable GPU acceleration in browser settings</li>
              <li>• Limit particle count based on device capabilities</li>
              <li>• Use simpler shaders for background effects</li>
            </ul>
          </div>
          
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-500" />
              Customization Options
            </h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>• Adjust particle count for performance</li>
              <li>• Customize colors and gradients</li>
              <li>• Control animation speed and turbulence</li>
              <li>• Add custom force fields and behaviors</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}