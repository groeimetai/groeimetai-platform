'use client';

import { useRef, useState, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { Brain, Cpu, Network, Sparkles, Zap, Binary, Database, Activity, Code2, Waves, Volume2 } from 'lucide-react';
import { InteractiveEffects } from './InteractiveEffects';
import { AITextEffects } from './AITextEffects';
import { AudioVisualizer } from './AudioVisualizer';
import { ShaderMaterials, updateShaderTime } from './shaders/AIShaders';

// Custom mesh components using our shaders
function HolographicBrain() {
  const meshRef = useRef<THREE.Mesh>(null);
  const material = useMemo(() => new THREE.ShaderMaterial(ShaderMaterials.holographicBrain), []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
      updateShaderTime(material.uniforms, delta);
    }
  });

  return (
    <mesh ref={meshRef} material={material}>
      <sphereGeometry args={[3, 64, 64]} />
    </mesh>
  );
}

function QuantumParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const material = useMemo(() => new THREE.ShaderMaterial(ShaderMaterials.quantumParticle), []);
  
  const particles = useMemo(() => {
    const count = 5000;
    const positions = new Float32Array(count * 3);
    const spins = new Float32Array(count);
    const entanglements = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
      spins[i] = Math.random();
      entanglements[i] = Math.random();
    }
    
    return { positions, spins, entanglements };
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      updateShaderTime(material.uniforms, delta);
    }
  });

  return (
    <points ref={pointsRef} material={material}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-spin"
          count={particles.spins.length}
          array={particles.spins}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-entanglement"
          count={particles.entanglements.length}
          array={particles.entanglements}
          itemSize={1}
        />
      </bufferGeometry>
    </points>
  );
}

function EnergyField() {
  const meshRef = useRef<THREE.Mesh>(null);
  const material = useMemo(() => new THREE.ShaderMaterial(ShaderMaterials.energyField), []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.1;
      meshRef.current.rotation.z += delta * 0.15;
      updateShaderTime(material.uniforms, delta);
    }
  });

  return (
    <mesh ref={meshRef} material={material}>
      <torusKnotGeometry args={[2, 0.6, 128, 16]} />
    </mesh>
  );
}

// 3D Scene with all shader effects
function ShaderScene() {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 0, 20);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#00ffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      
      <HolographicBrain />
      <QuantumParticles />
      <EnergyField />
    </>
  );
}

// Scene selector buttons
function SceneSelector({ activeScene, setActiveScene }: { activeScene: string; setActiveScene: (scene: string) => void }) {
  const scenes = [
    { id: 'shaders', name: 'Quantum AI', icon: Cpu, color: 'from-cyan-500 to-blue-600' },
    { id: 'text', name: 'Neural Text', icon: Brain, color: 'from-purple-500 to-pink-600' },
    { id: 'audio', name: 'Audio Vision', icon: Waves, color: 'from-green-500 to-emerald-600' },
    { id: 'interactive', name: 'Interactive', icon: Sparkles, color: 'from-orange-500 to-red-600' }
  ];

  return (
    <motion.div 
      className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="bg-black/80 backdrop-blur-xl rounded-full shadow-2xl p-1 flex gap-1 border border-white/10">
        {scenes.map((scene) => {
          const Icon = scene.icon;
          const isActive = activeScene === scene.id;
          
          return (
            <motion.button
              key={scene.id}
              onClick={() => setActiveScene(scene.id)}
              className={`relative px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-2 ${
                isActive ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isActive && (
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${scene.color} rounded-full`}
                  layoutId="activeScene"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline">{scene.name}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

// Status display
function StatusDisplay() {
  const [status, setStatus] = useState({
    processing: 0,
    neural: 0,
    quantum: 0,
    sync: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => ({
        processing: Math.min(prev.processing + Math.random() * 5, 98),
        neural: Math.min(prev.neural + Math.random() * 4, 96),
        quantum: Math.min(prev.quantum + Math.random() * 3, 94),
        sync: Math.min(prev.sync + Math.random() * 6, 99)
      }));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="absolute top-20 right-4 space-y-2"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.7 }}
    >
      {Object.entries(status).map(([key, value]) => (
        <div key={key} className="bg-black/60 backdrop-blur-xl border border-cyan-500/30 rounded-lg p-3 min-w-[150px]">
          <div className="flex justify-between items-center mb-1">
            <span className="text-cyan-400 text-xs font-mono capitalize">{key}</span>
            <span className="text-white text-sm font-bold">{Math.round(value)}%</span>
          </div>
          <div className="w-full h-1 bg-cyan-900/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${value}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      ))}
    </motion.div>
  );
}

// Main component
export function MindBlowingHeroAnimation() {
  const [activeScene, setActiveScene] = useState('shaders');
  const [language, setLanguage] = useState<'en' | 'nl'>('nl');
  const [textEffect, setTextEffect] = useState<'typewriter' | 'glitch' | 'morph' | 'rotate' | 'dissolve' | 'binary' | 'neural'>('neural');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Cpu className="w-12 h-12 text-cyan-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      </div>

      {/* Scene content */}
      <AnimatePresence mode="wait">
        {activeScene === 'shaders' && (
          <motion.div
            key="shaders"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Suspense fallback={null}>
              <Canvas>
                <ShaderScene />
                <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
              </Canvas>
            </Suspense>
          </motion.div>
        )}

        {activeScene === 'text' && (
          <motion.div
            key="text"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center space-y-8">
              <AITextEffects
                effect={textEffect}
                language={language}
                text={{
                  nl: 'GroeimetAI - De Toekomst van Leren',
                  en: 'GroeimetAI - The Future of Learning'
                }}
                duration={5000}
              />
              
              {/* Effect selector */}
              <div className="flex flex-wrap justify-center gap-2">
                {(['typewriter', 'glitch', 'morph', 'rotate', 'dissolve', 'binary', 'neural'] as const).map((effect) => (
                  <button
                    key={effect}
                    onClick={() => setTextEffect(effect)}
                    className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                      textEffect === effect
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                        : 'bg-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    {effect}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeScene === 'audio' && (
          <motion.div
            key="audio"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AudioVisualizer
              simulateData={true}
              width={window.innerWidth}
              height={window.innerHeight}
            />
          </motion.div>
        )}

        {activeScene === 'interactive' && (
          <motion.div
            key="interactive"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <InteractiveEffects />
          </motion.div>
        )}
      </AnimatePresence>

      {/* UI Overlays */}
      <SceneSelector activeScene={activeScene} setActiveScene={setActiveScene} />
      <StatusDisplay />

      {/* Language toggle */}
      <motion.button
        className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-xl border border-white/20 rounded-lg px-4 py-2 text-xs font-mono text-white hover:bg-white/10 transition-all"
        onClick={() => setLanguage(lang => lang === 'en' ? 'nl' : 'en')}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
      >
        {language === 'en' ? '🇳🇱 NL' : '🇬🇧 EN'}
      </motion.button>

      {/* Title */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center pointer-events-none"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-pulse">
            GroeimetAI
          </span>
        </h1>
        <p className="text-gray-400 text-lg font-mono tracking-wider">
          {language === 'en' ? 'Intelligence Evolved' : 'Intelligentie Geëvolueerd'}
        </p>
      </motion.div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-cyan-400 opacity-50" />
      <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-cyan-400 opacity-50" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-cyan-400 opacity-50" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-cyan-400 opacity-50" />
    </div>
  );
}