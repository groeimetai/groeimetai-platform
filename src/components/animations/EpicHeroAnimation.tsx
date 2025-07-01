'use client';

import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Text3D, Points, PointMaterial, Float } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { Zap, Brain, Code2, Activity } from 'lucide-react';

// Particle system component
function ParticleField({ count = 5000 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return pos;
  });

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.05;
      ref.current.rotation.y = state.clock.elapsedTime * 0.075;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial
        transparent
        color="#8b5cf6"
        size={0.1}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
}

// Neural network visualization
function NeuralNetwork() {
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  
  const nodes = useRef<{ position: THREE.Vector3; connections: number[] }[]>([]);
  
  useEffect(() => {
    // Create nodes
    const nodeCount = 20;
    for (let i = 0; i < nodeCount; i++) {
      nodes.current.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10
        ),
        connections: Array.from({ length: 3 }, () => Math.floor(Math.random() * nodeCount))
      });
    }
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {nodes.current.map((node, i) => (
        <Float key={i} speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
          <Sphere position={node.position} args={[0.2, 16, 16]}>
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={0.5}
            />
          </Sphere>
        </Float>
      ))}
    </group>
  );
}

// Main 3D Scene
function Scene() {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.z = 15;
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      
      {/* Background particles */}
      <ParticleField count={10000} />
      
      {/* Neural network */}
      <NeuralNetwork />
      
      {/* Central AI Core */}
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <Box args={[2, 2, 2]}>
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={0.5}
            wireframe
          />
        </Box>
      </Float>
    </>
  );
}

// Holographic UI Overlay
function HolographicUI() {
  const [metrics, setMetrics] = useState([
    { label: 'Processing', value: 0, target: 94 },
    { label: 'Accuracy', value: 0, target: 98 },
    { label: 'Efficiency', value: 0, target: 87 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(current => 
        current.map(metric => ({
          ...metric,
          value: Math.min(metric.value + Math.random() * 5, metric.target)
        }))
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top left - Status */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute top-8 left-8"
      >
        <div className="bg-black/50 backdrop-blur-xl border border-cyan-500/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-cyan-400 text-sm font-mono">AI SYSTEM ONLINE</span>
          </div>
          <div className="text-xs text-gray-400 font-mono">Neural Network Active</div>
        </div>
      </motion.div>

      {/* Top right - Metrics */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7 }}
        className="absolute top-8 right-8 space-y-3"
      >
        {metrics.map((metric, i) => (
          <div key={metric.label} className="bg-black/50 backdrop-blur-xl border border-purple-500/50 rounded-lg p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-purple-400 text-xs font-mono">{metric.label}</span>
              <span className="text-white text-sm font-bold">{Math.round(metric.value)}%</span>
            </div>
            <div className="w-32 h-1 bg-purple-900/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${metric.value}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        ))}
      </motion.div>

      {/* Bottom center - Title */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
              GroeimetAI
            </span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base font-mono">Intelligence Evolved</p>
        </div>
      </motion.div>

      {/* Scanning line effect */}
      <motion.div
        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
        initial={{ top: 0 }}
        animate={{ top: '100%' }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

// Main component
export function EpicHeroAnimation() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <div className="text-cyan-400 animate-pulse">Loading AI System...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* 3D Canvas */}
      <Suspense fallback={null}>
        <Canvas>
          <Scene />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </Suspense>

      {/* Holographic UI */}
      <HolographicUI />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}