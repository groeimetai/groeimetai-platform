'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Float, 
  OrbitControls, 
  MeshTransmissionMaterial,
  Environment,
  PointMaterial,
  Points,
  Sparkles,
  Trail,
  PerspectiveCamera,
  useTexture,
  shaderMaterial
} from '@react-three/drei';
import * as THREE from 'three';
import { extend } from '@react-three/fiber';

// Custom shader for holographic effect
const HolographicMaterial = shaderMaterial(
  {
    time: 0,
    color: new THREE.Color(0.2, 0.5, 1.0),
    opacity: 0.8,
  },
  // Vertex shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float time;
    uniform vec3 color;
    uniform float opacity;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    void main() {
      // Holographic effect
      float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
      
      // Scanline effect
      float scanline = sin(vPosition.y * 50.0 + time * 2.0) * 0.1 + 0.9;
      
      // Glitch effect
      float glitch = step(0.98, sin(time * 10.0)) * 0.2;
      
      // Color variation
      vec3 finalColor = color + vec3(
        sin(time + vPosition.x * 2.0) * 0.1,
        cos(time + vPosition.y * 2.0) * 0.1,
        sin(time + vPosition.z * 2.0) * 0.1
      );
      
      gl_FragColor = vec4(finalColor, opacity * fresnel * scanline + glitch);
    }
  `
);

extend({ HolographicMaterial });

// Neural Network Brain Component
function NeuralNetworkBrain({ position = [0, 0, 0] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const neuronsRef = useRef<THREE.Points>(null);
  const connectionsRef = useRef<THREE.LineSegments>(null);
  
  // Generate neurons
  const neurons = useMemo(() => {
    const positions = new Float32Array(300 * 3);
    const colors = new Float32Array(300 * 3);
    
    for (let i = 0; i < 300; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 2 + Math.random() * 0.5;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      colors[i * 3] = 0.5 + Math.random() * 0.5;
      colors[i * 3 + 1] = 0.5 + Math.random() * 0.5;
      colors[i * 3 + 2] = 1;
    }
    
    return { positions, colors };
  }, []);
  
  // Generate connections
  const connections = useMemo(() => {
    const positions = new Float32Array(600 * 3);
    
    for (let i = 0; i < 300; i += 2) {
      const idx1 = Math.floor(Math.random() * 100) * 3;
      const idx2 = Math.floor(Math.random() * 100) * 3;
      
      positions[i * 3] = neurons.positions[idx1];
      positions[i * 3 + 1] = neurons.positions[idx1 + 1];
      positions[i * 3 + 2] = neurons.positions[idx1 + 2];
      
      positions[(i + 1) * 3] = neurons.positions[idx2];
      positions[(i + 1) * 3 + 1] = neurons.positions[idx2 + 1];
      positions[(i + 1) * 3 + 2] = neurons.positions[idx2 + 2];
    }
    
    return positions;
  }, [neurons]);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
    }
    if (neuronsRef.current) {
      neuronsRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
    if (connectionsRef.current) {
      connectionsRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });
  
  return (
    <group position={position}>
      {/* Brain mesh */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2, 3]} />
        <holographicMaterial 
          time={0} 
          color={new THREE.Color(0.2, 0.5, 1.0)} 
          opacity={0.3}
          transparent
          wireframe
        />
      </mesh>
      
      {/* Neurons */}
      <points ref={neuronsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={neurons.positions.length / 3}
            array={neurons.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={neurons.colors.length / 3}
            array={neurons.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.05} vertexColors sizeAttenuation />
      </points>
      
      {/* Connections */}
      <lineSegments ref={connectionsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={connections.length / 3}
            array={connections}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={0x4080ff} opacity={0.3} transparent />
      </lineSegments>
    </group>
  );
}

// Particle System Component
function ParticleSystem({ count = 50000 }) {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
      
      colors[i * 3] = Math.random() * 0.5 + 0.5;
      colors[i * 3 + 1] = Math.random() * 0.5 + 0.5;
      colors[i * 3 + 2] = 1;
      
      sizes[i] = Math.random() * 0.02 + 0.01;
    }
    
    return { positions, colors, sizes };
  }, [count]);
  
  useFrame((state) => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      const time = state.clock.elapsedTime;
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += Math.sin(time + i * 0.001) * 0.01;
        
        // Wrap around
        if (positions[i3 + 1] > 25) positions[i3 + 1] = -25;
        if (positions[i3 + 1] < -25) positions[i3 + 1] = 25;
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return (
    <points ref={pointsRef} frustumCulled>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particles.colors.length / 3}
          array={particles.colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particles.sizes.length}
          array={particles.sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.02} 
        vertexColors 
        transparent 
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Data Stream Visualization
function DataStream() {
  const meshRef = useRef<THREE.Mesh>(null);
  const tubeRef = useRef<THREE.TubeGeometry>(null);
  
  const curve = useMemo(() => {
    const points = [];
    for (let i = 0; i < 100; i++) {
      const t = i / 100;
      const x = Math.sin(t * Math.PI * 4) * 3;
      const y = (t - 0.5) * 10;
      const z = Math.cos(t * Math.PI * 4) * 3;
      points.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.CatmullRomCurve3(points);
  }, []);
  
  useFrame((state) => {
    if (meshRef.current && meshRef.current.material instanceof THREE.ShaderMaterial) {
      meshRef.current.material.uniforms.time.value = state.clock.elapsedTime;
    }
  });
  
  return (
    <mesh ref={meshRef}>
      <tubeGeometry ref={tubeRef} args={[curve, 100, 0.2, 8, false]} />
      <shaderMaterial
        uniforms={{
          time: { value: 0 },
          color1: { value: new THREE.Color(0x00ffff) },
          color2: { value: new THREE.Color(0xff00ff) },
        }}
        vertexShader={`
          varying vec2 vUv;
          varying vec3 vPosition;
          
          void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float time;
          uniform vec3 color1;
          uniform vec3 color2;
          
          varying vec2 vUv;
          varying vec3 vPosition;
          
          void main() {
            float flow = mod(vUv.x - time * 0.2, 1.0);
            vec3 color = mix(color1, color2, flow);
            float alpha = pow(flow, 2.0) * 0.8;
            
            gl_FragColor = vec4(color, alpha);
          }
        `}
        transparent
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Lightning Effect Component
function LightningEffect() {
  const lightningRef = useRef<THREE.Group>(null);
  const [bolts, setBolts] = useState<THREE.Vector3[][]>([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const newBolts = [];
      for (let i = 0; i < 3; i++) {
        const start = new THREE.Vector3(
          (Math.random() - 0.5) * 10,
          5,
          (Math.random() - 0.5) * 10
        );
        const end = new THREE.Vector3(
          start.x + (Math.random() - 0.5) * 5,
          -5,
          start.z + (Math.random() - 0.5) * 5
        );
        
        const points = [start];
        const segments = 10;
        
        for (let j = 1; j < segments; j++) {
          const t = j / segments;
          const point = new THREE.Vector3().lerpVectors(start, end, t);
          point.x += (Math.random() - 0.5) * 1;
          point.z += (Math.random() - 0.5) * 1;
          points.push(point);
        }
        points.push(end);
        
        newBolts.push(points);
      }
      setBolts(newBolts);
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <group ref={lightningRef}>
      {bolts.map((bolt, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={bolt.length}
              array={new Float32Array(bolt.flatMap(p => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={0xffffff} linewidth={2} />
        </line>
      ))}
    </group>
  );
}

// Main Scene Component
function Scene() {
  const { mouse } = useThree();
  const [sceneIndex, setSceneIndex] = useState(0);
  const groupRef = useRef<THREE.Group>(null);
  
  // Mouse interaction
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = mouse.x * 0.2;
      groupRef.current.rotation.x = -mouse.y * 0.1;
    }
  });
  
  // Scene transitions
  useEffect(() => {
    const interval = setInterval(() => {
      setSceneIndex((prev) => (prev + 1) % 3);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={60} />
      <fog attach="fog" args={['#000', 10, 50]} />
      
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#4080ff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff0080" />
      
      <group ref={groupRef}>
        {/* Scene 1: Neural Network */}
        {sceneIndex === 0 && (
          <>
            <NeuralNetworkBrain />
            <Sparkles count={200} scale={[10, 10, 10]} size={2} speed={0.5} />
          </>
        )}
        
        {/* Scene 2: Data Flow */}
        {sceneIndex === 1 && (
          <>
            <DataStream />
            <ParticleSystem count={30000} />
          </>
        )}
        
        {/* Scene 3: Lightning Network */}
        {sceneIndex === 2 && (
          <>
            <LightningEffect />
            <Float speed={2} rotationIntensity={1} floatIntensity={2}>
              <mesh>
                <torusKnotGeometry args={[2, 0.5, 100, 16]} />
                <MeshTransmissionMaterial
                  backside
                  samples={16}
                  thickness={0.2}
                  roughness={0.1}
                  transmission={1}
                  ior={1.5}
                  chromaticAberration={0.1}
                  color="#4080ff"
                />
              </mesh>
            </Float>
          </>
        )}
        
        {/* Always visible particles */}
        <ParticleSystem count={20000} />
      </group>
      
      {/* Post-processing effects would go here */}
    </>
  );
}

// Main Component
export function WebGLHeroAnimation() {
  return (
    <div className="relative w-full h-full bg-black">
      <Canvas
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
        dpr={[1, 2]}
        style={{ background: 'black' }}
      >
        <Scene />
      </Canvas>
      
      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 text-white">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            GroeimetAI
          </h1>
          <p className="text-gray-400">Next-Generation AI Platform</p>
        </div>
        
        <div className="absolute bottom-4 right-4 text-white text-sm">
          <p className="opacity-60">Powered by WebGL & Three.js</p>
        </div>
      </div>
    </div>
  );
}