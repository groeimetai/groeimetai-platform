'use client';

import { useRef, useMemo, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Stats,
  Preload,
  AdaptiveDpr,
  AdaptiveEvents,
  BakeShadows,
  PerformanceMonitor,
  useDetectGPU,
  Effects,
  MeshTransmissionMaterial,
  Float,
  PerspectiveCamera
} from '@react-three/drei';
import * as THREE from 'three';
import { 
  createShaderMaterial, 
  digitalRainShader, 
  energyFieldShader,
  quantumParticleShader,
  matrixGridShader,
  warpTunnelShader
} from './shaders';

// GPU Detection Hook
function useOptimalSettings() {
  const GPUTier = useDetectGPU();
  
  return useMemo(() => {
    const tier = GPUTier.tier || 1;
    
    return {
      particleCount: tier === 1 ? 10000 : tier === 2 ? 30000 : 50000,
      shadowMapSize: tier === 1 ? 512 : tier === 2 ? 1024 : 2048,
      bloomEnabled: tier >= 2,
      reflectionsEnabled: tier >= 2,
      postProcessing: tier >= 2,
      maxLODLevel: tier === 1 ? 2 : tier === 2 ? 3 : 4,
    };
  }, [GPUTier]);
}

// Optimized Neural Network with LOD
function OptimizedNeuralNetwork({ position = [0, 0, 0] }) {
  const meshRef = useRef<THREE.LOD>(null);
  const settings = useOptimalSettings();
  
  // Create different LOD levels
  const lodMeshes = useMemo(() => {
    const meshes = [];
    
    // High detail (close)
    const highDetail = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2, 4),
      createShaderMaterial(energyFieldShader)
    );
    meshes.push({ mesh: highDetail, distance: 10 });
    
    // Medium detail
    const mediumDetail = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2, 2),
      createShaderMaterial(energyFieldShader)
    );
    meshes.push({ mesh: mediumDetail, distance: 20 });
    
    // Low detail (far)
    const lowDetail = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2, 1),
      new THREE.MeshBasicMaterial({ 
        color: 0x4080ff, 
        wireframe: true, 
        opacity: 0.5, 
        transparent: true 
      })
    );
    meshes.push({ mesh: lowDetail, distance: 50 });
    
    return meshes;
  }, []);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      
      // Update shader uniforms
      lodMeshes.forEach(({ mesh }) => {
        if (mesh.material instanceof THREE.ShaderMaterial) {
          mesh.material.uniforms.time.value = state.clock.elapsedTime;
        }
      });
    }
  });
  
  return (
    <Lod ref={meshRef} position={position}>
      {lodMeshes.map(({ mesh, distance }, index) => (
        <primitive key={index} object={mesh} />
      ))}
    </Lod>
  );
}

// Instanced Particle System with Frustum Culling
function InstancedParticles({ count = 50000 }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const settings = useOptimalSettings();
  const actualCount = Math.min(count, settings.particleCount);
  
  const { positions, colors, scales } = useMemo(() => {
    const positions = [];
    const colors = [];
    const scales = [];
    
    for (let i = 0; i < actualCount; i++) {
      positions.push(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40
      );
      
      colors.push(
        Math.random() * 0.5 + 0.5,
        Math.random() * 0.5 + 0.5,
        1
      );
      
      scales.push(Math.random() * 0.5 + 0.5);
    }
    
    return { positions, colors, scales };
  }, [actualCount]);
  
  useEffect(() => {
    if (!meshRef.current) return;
    
    const mesh = meshRef.current;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    
    for (let i = 0; i < actualCount; i++) {
      dummy.position.set(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2]
      );
      dummy.scale.setScalar(scales[i]);
      dummy.updateMatrix();
      
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, color.setRGB(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]));
    }
    
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [actualCount, positions, colors, scales]);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.elapsedTime;
    const dummy = new THREE.Object3D();
    
    for (let i = 0; i < actualCount; i++) {
      meshRef.current.getMatrixAt(i, dummy.matrix);
      dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
      
      // Animate Y position
      dummy.position.y += Math.sin(time + i * 0.001) * 0.01;
      
      // Wrap around
      if (dummy.position.y > 20) dummy.position.y = -20;
      if (dummy.position.y < -20) dummy.position.y = 20;
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, actualCount]} frustumCulled>
      <sphereGeometry args={[0.05, 6, 6]} />
      <meshBasicMaterial color="white" />
    </instancedMesh>
  );
}

// Interactive Mouse Trail
function MouseTrail() {
  const { mouse, camera } = useThree();
  const trailRef = useRef<THREE.Points>(null);
  const trailPositions = useRef<number[]>([]);
  const maxTrailLength = 50;
  
  useFrame(() => {
    if (!trailRef.current) return;
    
    // Convert mouse to 3D position
    const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    vector.unproject(camera);
    
    const dir = vector.sub(camera.position).normalize();
    const distance = 10;
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));
    
    // Add to trail
    trailPositions.current.unshift(pos.x, pos.y, pos.z);
    
    // Limit trail length
    if (trailPositions.current.length > maxTrailLength * 3) {
      trailPositions.current = trailPositions.current.slice(0, maxTrailLength * 3);
    }
    
    // Update geometry
    const positions = new Float32Array(trailPositions.current);
    trailRef.current.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
  });
  
  return (
    <points ref={trailRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={maxTrailLength}
          array={new Float32Array(maxTrailLength * 3)}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color={0x00ffff}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Performance Monitor Component
function PerformanceOverlay() {
  const [dpr, setDpr] = useState(1);
  const [showStats, setShowStats] = useState(false);
  
  return (
    <>
      <PerformanceMonitor
        onIncline={() => setDpr(Math.min(2, dpr + 0.1))}
        onDecline={() => setDpr(Math.max(1, dpr - 0.1))}
        flipflops={3}
        onFallback={() => setShowStats(false)}
      />
      {showStats && <Stats className="stats-panel" />}
    </>
  );
}

// Main Scene with Morphing Transitions
function MorphingScene() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const settings = useOptimalSettings();
  
  // Scene transition with morphing
  useEffect(() => {
    const interval = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setSceneIndex((prev) => (prev + 1) % 3);
        setTransitioning(false);
      }, 500);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Mouse interaction
  const { mouse } = useThree();
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += (mouse.x * 0.5 - groupRef.current.rotation.y) * 0.05;
      groupRef.current.rotation.x += (-mouse.y * 0.3 - groupRef.current.rotation.x) * 0.05;
    }
  });
  
  return (
    <group ref={groupRef}>
      {/* Scene 1: Neural Network */}
      <group visible={sceneIndex === 0} scale={transitioning ? 0.8 : 1}>
        {/* <OptimizedNeuralNetwork /> */}
        <InstancedParticles count={settings.particleCount} />
      </group>
      
      {/* Scene 2: Data Matrix */}
      <group visible={sceneIndex === 1} scale={transitioning ? 0.8 : 1}>
        <mesh>
          <planeGeometry args={[20, 20]} />
          <primitive object={createShaderMaterial(matrixGridShader)} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[5, 5, 10, 32]} />
          <primitive object={createShaderMaterial(digitalRainShader)} />
        </mesh>
      </group>
      
      {/* Scene 3: Quantum Field */}
      <group visible={sceneIndex === 2} scale={transitioning ? 0.8 : 1}>
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
          <mesh>
            <torusKnotGeometry args={[3, 1, 128, 16]} />
            <MeshTransmissionMaterial
              backside
              samples={settings.reflectionsEnabled ? 16 : 4}
              thickness={0.2}
              roughness={0.1}
              transmission={1}
              ior={1.5}
              chromaticAberration={0.1}
              color="#4080ff"
            />
          </mesh>
        </Float>
        <mesh>
          <sphereGeometry args={[8, 32, 32]} />
          <primitive object={createShaderMaterial(warpTunnelShader)} attach="material" />
        </mesh>
      </group>
      
      {/* Always visible elements */}
      <MouseTrail />
    </group>
  );
}

// Main Optimized Component
export function OptimizedWebGLHero() {
  return (
    <div className="relative w-full h-full bg-black">
      <Canvas
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        }}
        camera={{ position: [0, 0, 15], fov: 60 }}
        dpr={[1, 2]}
      >
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={60} />
          
          {/* Lighting */}
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#4080ff" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff0080" />
          
          {/* Main Scene */}
          <MorphingScene />
          
          <BakeShadows />
          <Preload all />
        </Suspense>
        
        <PerformanceOverlay />
      </Canvas>
      
      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 text-white">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            GroeimetAI
          </h1>
          <p className="text-gray-400">AI-Powered Learning Platform</p>
        </div>
        
        <div className="absolute bottom-4 left-4 text-white text-xs opacity-60">
          <p>Move your mouse to interact</p>
        </div>
        
        <div className="absolute bottom-4 right-4 text-white text-xs opacity-60">
          <p>WebGL Performance Optimized</p>
        </div>
      </div>
    </div>
  );
}