'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';

// Vertex shader for GPU particle computation
const vertexShader = /* glsl */`
  uniform float uTime;
  uniform float uMode;
  uniform vec2 uMouse;
  uniform float uScale;
  uniform float uSpeed;
  uniform float uTurbulence;
  uniform float uForceFieldStrength;
  
  attribute float aLife;
  attribute float aSize;
  attribute vec3 aVelocity;
  attribute vec3 aColor;
  attribute float aType;
  attribute float aOrbitRadius;
  attribute float aOrbitSpeed;
  attribute float aPhase;
  
  varying vec3 vColor;
  varying float vLife;
  varying float vSize;
  
  // Simplex 3D noise function
  vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      
    float n_ = 1.0/7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  
  void main() {
    vColor = aColor;
    vLife = aLife;
    
    vec3 pos = position;
    vec3 velocity = aVelocity;
    float time = uTime * uSpeed;
    
    // Mode 0: Orbiting particles
    if (uMode < 0.5) {
      float orbitAngle = time * aOrbitSpeed + aPhase;
      float radius = aOrbitRadius * (1.0 + sin(time * 2.0 + aPhase) * 0.2);
      
      pos.x = cos(orbitAngle) * radius;
      pos.z = sin(orbitAngle) * radius;
      pos.y = sin(time * 3.0 + aPhase * 2.0) * radius * 0.5;
      
      // Add turbulence
      vec3 noisePos = pos * 0.1 + time * 0.1;
      float noise = snoise(noisePos) * uTurbulence;
      pos += vec3(noise, noise * 0.5, noise) * 10.0;
      
      // Add trail effect
      float trailOffset = aType * 0.1;
      pos -= normalize(velocity) * trailOffset * 20.0;
    }
    
    // Mode 1: Streaming particles
    else if (uMode < 1.5) {
      // Flow along velocity with turbulence
      pos += velocity * time * 10.0;
      
      // Add spiral motion
      float spiral = time * 2.0 + aPhase;
      pos.x += sin(spiral) * 10.0 * aType;
      pos.z += cos(spiral) * 10.0 * aType;
      
      // Add turbulence field
      vec3 turbulence = vec3(
        snoise(pos * 0.02 + time),
        snoise(pos * 0.02 + time + 100.0),
        snoise(pos * 0.02 + time + 200.0)
      ) * uTurbulence * 20.0;
      pos += turbulence;
      
      // Wrap around bounds
      pos = mod(pos + 100.0, 200.0) - 100.0;
    }
    
    // Mode 2: Explosive particles
    else {
      // Explosion from center
      float explosionTime = mod(time * 0.5, 3.0);
      float explosionPhase = smoothstep(0.0, 1.0, explosionTime);
      
      vec3 explosionDir = normalize(position + velocity);
      float explosionSpeed = 50.0 + aType * 30.0;
      
      pos = explosionDir * explosionSpeed * explosionPhase;
      
      // Add secondary explosion waves
      if (explosionTime > 1.5) {
        float secondaryPhase = smoothstep(1.5, 2.5, explosionTime);
        pos += explosionDir * explosionSpeed * secondaryPhase * 0.5;
      }
      
      // Add rotation
      float rotation = time * aOrbitSpeed;
      mat2 rot = mat2(cos(rotation), -sin(rotation), sin(rotation), cos(rotation));
      pos.xz = rot * pos.xz;
      
      // Gravity effect
      pos.y -= explosionPhase * explosionPhase * 20.0;
    }
    
    // Mouse interaction - attraction/repulsion
    vec2 mouseOffset = pos.xy - uMouse * 100.0;
    float mouseDistance = length(mouseOffset);
    if (mouseDistance < 50.0) {
      vec2 forceDir = normalize(mouseOffset);
      float forceMagnitude = (1.0 - mouseDistance / 50.0) * uForceFieldStrength;
      pos.xy += forceDir * forceMagnitude * 10.0;
    }
    
    // Calculate final position
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Dynamic size based on life and distance
    float sizeMultiplier = 1.0 + sin(time * 5.0 + aPhase) * 0.3;
    vSize = aSize * uScale * sizeMultiplier * aLife;
    
    // Add motion blur effect by stretching particles along velocity
    float speed = length(velocity);
    vSize *= (1.0 + speed * 0.1);
    
    gl_PointSize = vSize * (300.0 / -mvPosition.z);
  }
`;

// Fragment shader for particle rendering
const fragmentShader = /* glsl */`
  uniform float uTime;
  uniform sampler2D uTexture;
  uniform float uGlow;
  
  varying vec3 vColor;
  varying float vLife;
  varying float vSize;
  
  void main() {
    vec2 uv = gl_PointCoord;
    
    // Create circular particle with soft edges
    float dist = length(uv - vec2(0.5));
    if (dist > 0.5) discard;
    
    // Soft particle edges
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    alpha *= vLife; // Fade based on life
    
    // Add glow effect
    float glow = exp(-dist * 5.0) * uGlow;
    
    // Color with gradient
    vec3 color = vColor;
    color += vec3(0.2, 0.3, 0.5) * (1.0 - dist); // Add center brightness
    color += vec3(glow * 0.5, glow * 0.3, glow * 0.8); // Add glow color
    
    // Add sparkle effect
    float sparkle = sin(uTime * 10.0 + vSize * 100.0) * 0.5 + 0.5;
    color += sparkle * 0.2 * (1.0 - dist);
    
    gl_FragColor = vec4(color, alpha * 0.8);
  }
`;

interface ParticleSystemProps {
  mode: 'orbiting' | 'streaming' | 'explosive';
  particleCount?: number;
  mouseInteraction?: boolean;
}

function ParticleSystem({ mode, particleCount = 100000, mouseInteraction = true }: ParticleSystemProps) {
  const meshRef = useRef<THREE.Points>(null);
  const mouseRef = useRef(new THREE.Vector2());
  const { gl, size } = useThree();
  
  // Create particle attributes
  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);
    const life = new Float32Array(particleCount);
    const types = new Float32Array(particleCount);
    const orbitRadius = new Float32Array(particleCount);
    const orbitSpeed = new Float32Array(particleCount);
    const phases = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Random positions
      positions[i3] = (Math.random() - 0.5) * 100;
      positions[i3 + 1] = (Math.random() - 0.5) * 100;
      positions[i3 + 2] = (Math.random() - 0.5) * 100;
      
      // Color gradients
      const hue = (i / particleCount) * 360;
      const color = new THREE.Color().setHSL(hue / 360, 0.8, 0.6);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      
      // Particle properties
      sizes[i] = Math.random() * 3 + 1;
      life[i] = Math.random();
      types[i] = Math.floor(Math.random() * 3);
      
      // Velocities
      velocities[i3] = (Math.random() - 0.5) * 2;
      velocities[i3 + 1] = (Math.random() - 0.5) * 2;
      velocities[i3 + 2] = (Math.random() - 0.5) * 2;
      
      // Orbit properties
      orbitRadius[i] = Math.random() * 40 + 10;
      orbitSpeed[i] = Math.random() * 2 + 0.5;
      phases[i] = Math.random() * Math.PI * 2;
    }
    
    return {
      positions,
      colors,
      sizes,
      velocities,
      life,
      types,
      orbitRadius,
      orbitSpeed,
      phases
    };
  }, [particleCount]);
  
  // Create shader material
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMode: { value: mode === 'orbiting' ? 0 : mode === 'streaming' ? 1 : 2 },
    uMouse: { value: new THREE.Vector2() },
    uScale: { value: 1 },
    uSpeed: { value: 0.5 },
    uTurbulence: { value: 0.5 },
    uForceFieldStrength: { value: 1 },
    uGlow: { value: 1 },
    uTexture: { value: null }
  }), [mode]);
  
  // Handle mouse movement
  useEffect(() => {
    if (!mouseInteraction) return;
    
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / size.width) * 2 - 1;
      mouseRef.current.y = -(event.clientY / size.height) * 2 + 1;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [size, mouseInteraction]);
  
  // Animation loop
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const material = meshRef.current.material as THREE.ShaderMaterial;
    material.uniforms.uTime.value = state.clock.elapsedTime;
    
    if (mouseInteraction) {
      material.uniforms.uMouse.value.lerp(mouseRef.current, 0.1);
    }
    
    // Update life values for continuous animation
    const lifeAttribute = meshRef.current.geometry.attributes.aLife as THREE.BufferAttribute;
    const lifeArray = lifeAttribute.array as Float32Array;
    
    for (let i = 0; i < particleCount; i++) {
      lifeArray[i] = (Math.sin(state.clock.elapsedTime * 0.5 + i * 0.01) + 1) * 0.5;
    }
    lifeAttribute.needsUpdate = true;
  });
  
  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aColor"
          count={particleCount}
          array={particles.colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          count={particleCount}
          array={particles.sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aVelocity"
          count={particleCount}
          array={particles.velocities}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aLife"
          count={particleCount}
          array={particles.life}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aType"
          count={particleCount}
          array={particles.types}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aOrbitRadius"
          count={particleCount}
          array={particles.orbitRadius}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aOrbitSpeed"
          count={particleCount}
          array={particles.orbitSpeed}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aPhase"
          count={particleCount}
          array={particles.phases}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function GPUParticleSystem() {
  const [mode, setMode] = useState<'orbiting' | 'streaming' | 'explosive'>('orbiting');
  const [particleCount, setParticleCount] = useState(100000);
  
  return (
    <div className="relative w-full h-full">
      {/* Three.js Canvas */}
      <Canvas
        camera={{ position: [0, 0, 100], fov: 60 }}
        gl={{ antialias: false, alpha: true }}
        className="absolute inset-0"
      >
        <ParticleSystem mode={mode} particleCount={particleCount} />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
      
      {/* Controls */}
      <div className="absolute top-4 left-4 space-y-2 z-10">
        <div className="bg-black/50 backdrop-blur rounded-lg p-3 space-y-2">
          <h3 className="text-white text-sm font-medium mb-2">Particle Mode</h3>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setMode('orbiting')}
              className={`px-3 py-1 rounded text-xs transition ${
                mode === 'orbiting' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              Orbiting
            </button>
            <button
              onClick={() => setMode('streaming')}
              className={`px-3 py-1 rounded text-xs transition ${
                mode === 'streaming' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              Streaming
            </button>
            <button
              onClick={() => setMode('explosive')}
              className={`px-3 py-1 rounded text-xs transition ${
                mode === 'explosive' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              Explosive
            </button>
          </div>
        </div>
        
        <div className="bg-black/50 backdrop-blur rounded-lg p-3">
          <p className="text-white text-xs mb-1">Particles: {particleCount.toLocaleString()}</p>
          <input
            type="range"
            min="10000"
            max="200000"
            step="10000"
            value={particleCount}
            onChange={(e) => setParticleCount(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
      
      {/* Info */}
      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur rounded-lg px-3 py-2">
        <p className="text-white text-xs">Move mouse to interact • Drag to rotate view</p>
      </div>
    </div>
  );
}