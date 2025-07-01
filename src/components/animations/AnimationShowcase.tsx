'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Zap, Settings, Play, Pause } from 'lucide-react';
import { SmoothHeroAnimation } from './SmoothHeroAnimation';
import { WebGLHeroAnimation } from './WebGLHeroAnimation';
import { OptimizedWebGLHero } from './OptimizedWebGLHero';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AnimationShowcase() {
  const [activeAnimation, setActiveAnimation] = useState<'smooth' | 'webgl' | 'optimized'>('optimized');
  const [isPaused, setIsPaused] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const animations = {
    smooth: {
      component: SmoothHeroAnimation,
      title: 'Smooth Hero Animation',
      description: 'Framer Motion based animation with smooth transitions',
      features: ['Lightweight', 'Mobile-friendly', 'CSS animations'],
    },
    webgl: {
      component: WebGLHeroAnimation,
      title: 'WebGL Hero Animation',
      description: 'Advanced Three.js animation with particle systems',
      features: ['50k+ particles', 'Neural networks', 'Shader effects'],
    },
    optimized: {
      component: OptimizedWebGLHero,
      title: 'Optimized WebGL Hero',
      description: 'Performance-optimized WebGL with adaptive quality',
      features: ['LOD system', 'GPU detection', 'Frustum culling'],
    },
  };

  const CurrentAnimation = animations[activeAnimation].component;

  return (
    <div className="relative w-full min-h-screen bg-gray-900">
      {/* Animation Container */}
      <div className="relative h-[600px] overflow-hidden">
        <CurrentAnimation />
        
        {/* Overlay Controls */}
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 right-4 z-50"
          >
            <Card className="bg-black/80 backdrop-blur-md border-white/20 p-4">
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setShowControls(false)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-green-400">
                  <Zap className="w-3 h-3" />
                  <span>Performance: Optimal</span>
                </div>
                <div className="flex items-center gap-2 text-blue-400">
                  <Monitor className="w-3 h-3" />
                  <span>FPS: 60</span>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Animation Selector */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeAnimation} onValueChange={(value: any) => setActiveAnimation(value)}>
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="smooth">Smooth Animation</TabsTrigger>
            <TabsTrigger value="webgl">WebGL Animation</TabsTrigger>
            <TabsTrigger value="optimized">Optimized WebGL</TabsTrigger>
          </TabsList>
          
          {Object.entries(animations).map(([key, animation]) => (
            <TabsContent key={key} value={key} className="mt-6">
              <Card className="bg-gray-800 border-gray-700">
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{animation.title}</h3>
                  <p className="text-gray-400 mb-4">{animation.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {animation.features.map((feature, index) => (
                      <div
                        key={index}
                        className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full" />
                          <span className="text-gray-300">{feature}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex gap-4">
                    <Button
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => setActiveAnimation(key as any)}
                    >
                      Use This Animation
                    </Button>
                    <Button
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      View Code
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Integration Guide */}
        <Card className="mt-8 bg-gray-800 border-gray-700">
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">Integration Guide</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-300 mb-2">1. Install Dependencies</h4>
                <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <code className="text-sm text-gray-400">
{`npm install three @react-three/fiber @react-three/drei
# or
yarn add three @react-three/fiber @react-three/drei`}
                  </code>
                </pre>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-300 mb-2">2. Import Component</h4>
                <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <code className="text-sm text-gray-400">
{`import { OptimizedWebGLHero } from '@/components/animations';

export function HomePage() {
  return (
    <div className="h-screen">
      <OptimizedWebGLHero />
    </div>
  );
}`}
                  </code>
                </pre>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-300 mb-2">3. Customize Settings</h4>
                <p className="text-gray-400">
                  Each animation component accepts props for customization. The WebGL components
                  automatically adapt to the user\'s GPU capabilities for optimal performance.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}