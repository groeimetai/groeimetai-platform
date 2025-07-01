'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, Stats } from '@react-three/drei';

// Advanced vertex shader with multiple effects
const advancedVertexShader = /* glsl */`
  uniform float uTime;
  uniform float uMode;
  uniform vec2 uMouse;
  uniform float uScale;
  uniform float uSpeed;
  uniform float uTurbulence;
  uniform float uForceFieldStrength;
  uniform float uNoiseScale;
  uniform float uNoiseSpeed;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  
  attribute float aLife;
  attribute float aSize;
  attribute vec3 aVelocity;
  attribute vec3 aColor;
  attribute float aType;
  attribute float aOrbitRadius;
  attribute float aOrbitSpeed;
  attribute float aPhase;
  attribute float aEmitTime;
  
  varying vec3 vColor;
  varying float vLife;
  varying float vSize;
  varying float vDistance;
  
  // Improved 4D noise for smoother turbulence
  vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }
  
  float cnoise(vec3 P) {
    vec3 Pi0 = floor(P);
    vec3 Pi1 = Pi0 + vec3(1.0);
    Pi0 = mod(Pi0, 289.0);
    Pi1 = mod(Pi1, 289.0);
    vec3 Pf0 = fract(P);
    vec3 Pf1 = Pf0 - vec3(1.0);
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;
    
    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);
    
    vec4 gx0 = ixy0 / 7.0;
    vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);
    
    vec4 gx1 = ixy1 / 7.0;
    vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);
    
    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
    
    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;
    
    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);
    
    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 2.2 * n_xyz;
  }
  
  // Curl noise for realistic turbulence
  vec3 curlNoise(vec3 p) {
    const float e = 0.1;
    vec3 dx = vec3(e, 0.0, 0.0);
    vec3 dy = vec3(0.0, e, 0.0);
    vec3 dz = vec3(0.0, 0.0, e);
    
    float x0 = cnoise(p - dx);
    float x1 = cnoise(p + dx);
    float y0 = cnoise(p - dy);
    float y1 = cnoise(p + dy);
    float z0 = cnoise(p - dz);
    float z1 = cnoise(p + dz);
    
    float x = y1 - y0 - z1 + z0;
    float y = z1 - z0 - x1 + x0;
    float z = x1 - x0 - y1 + y0;
    
    return normalize(vec3(x, y, z)) * (1.0 / (2.0 * e));
  }
  
  void main() {
    vLife = aLife;
    
    vec3 pos = position;
    vec3 velocity = aVelocity;
    float time = uTime * uSpeed;
    float particleTime = time - aEmitTime;
    
    // Mode 0: Advanced Orbiting with trails
    if (uMode < 0.5) {
      float orbitAngle = particleTime * aOrbitSpeed + aPhase;
      float radiusVariation = sin(particleTime * 2.0 + aPhase) * 0.3 + 
                             sin(particleTime * 5.0 + aPhase * 2.0) * 0.1;
      float radius = aOrbitRadius * (1.0 + radiusVariation);
      
      // 3D orbital motion
      float inclination = aPhase * 0.5;
      pos.x = cos(orbitAngle) * radius * cos(inclination);
      pos.z = sin(orbitAngle) * radius * cos(inclination);
      pos.y = sin(inclination) * radius + sin(particleTime * 3.0 + aPhase * 2.0) * radius * 0.3;
      
      // Add curl noise turbulence
      vec3 noisePos = pos * uNoiseScale + particleTime * uNoiseSpeed;
      vec3 curl = curlNoise(noisePos) * uTurbulence * 20.0;
      pos += curl;
      
      // Trail effect based on velocity
      vec3 trailVec = normalize(vec3(-sin(orbitAngle), 0.0, cos(orbitAngle))) * radius * aOrbitSpeed;
      float trailLength = aType * 0.2 + 0.1;
      pos -= trailVec * trailLength * 5.0;
      
      // Color based on position and speed
      float speed = length(trailVec + curl);
      float colorMix = speed * 0.1 + aType * 0.3;
      vColor = mix(uColorA, mix(uColorB, uColorC, colorMix), sin(particleTime + aPhase));
    }
    
    // Mode 1: Streaming flow field
    else if (uMode < 1.5) {
      // Flow field simulation
      vec3 flowPos = position + velocity * particleTime * 20.0;
      
      // Multiple octaves of curl noise for complex flow
      vec3 flow = vec3(0.0);
      float amplitude = 1.0;
      float frequency = uNoiseScale;
      
      for (int i = 0; i < 3; i++) {
        flow += curlNoise(flowPos * frequency + particleTime * uNoiseSpeed) * amplitude;
        amplitude *= 0.5;
        frequency *= 2.0;
      }
      
      pos = flowPos + flow * uTurbulence * 30.0;
      
      // Spiral motion
      float spiral = particleTime * 2.0 + aPhase;
      pos.x += sin(spiral) * 15.0 * aType;
      pos.z += cos(spiral) * 15.0 * aType;
      
      // Boundary wrapping with smooth transition
      vec3 bounds = vec3(150.0);
      pos = mod(pos + bounds, bounds * 2.0) - bounds;
      
      // Color based on flow direction
      float flowAngle = atan(flow.y, flow.x);
      vColor = mix(uColorA, uColorB, sin(flowAngle + particleTime) * 0.5 + 0.5);
    }
    
    // Mode 2: Explosive burst with physics
    else {
      float explosionCycle = mod(particleTime * 0.3, 4.0);
      float explosionPhase = smoothstep(0.0, 0.5, explosionCycle) * smoothstep(4.0, 2.0, explosionCycle);
      
      // Initial explosion direction with variation
      vec3 explosionDir = normalize(position + velocity * 2.0);
      explosionDir += curlNoise(explosionDir * 5.0 + aPhase) * 0.3;
      
      // Speed variation based on particle type
      float explosionSpeed = 80.0 + aType * 40.0 + sin(aPhase * 10.0) * 20.0;
      
      // Position with gravity and drag
      pos = explosionDir * explosionSpeed * explosionPhase;
      pos.y -= explosionPhase * explosionPhase * 50.0; // Gravity
      pos *= 1.0 - explosionPhase * 0.1; // Air drag
      
      // Secondary explosions
      if (explosionCycle > 2.0) {
        float secondaryPhase = smoothstep(2.0, 2.5, explosionCycle) * smoothstep(4.0, 3.5, explosionCycle);
        vec3 secondaryDir = normalize(explosionDir + vec3(sin(aPhase * 20.0), cos(aPhase * 15.0), sin(aPhase * 25.0)));
        pos += secondaryDir * explosionSpeed * secondaryPhase * 0.5;
      }
      
      // Swirling motion
      float swirl = particleTime * aOrbitSpeed * 3.0;
      mat2 rot = mat2(cos(swirl), -sin(swirl), sin(swirl), cos(swirl));
      pos.xz = rot * pos.xz;
      
      // Color transitions during explosion
      float colorPhase = explosionPhase + secondaryPhase * 0.5;
      vColor = mix(uColorC, mix(uColorB, uColorA, colorPhase), smoothstep(0.0, 1.0, colorPhase));
    }
    
    // Advanced mouse interaction
    vec2 mouseWorld = uMouse * 200.0 - 100.0;
    vec3 mousePos = vec3(mouseWorld.x, 0.0, mouseWorld.y);
    vec3 toMouse = pos - mousePos;
    float mouseDistance = length(toMouse);
    
    if (mouseDistance < 80.0) {
      float influence = smoothstep(80.0, 0.0, mouseDistance);
      vec3 forceDir = normalize(toMouse + vec3(0.0, 1.0, 0.0));
      
      // Vortex effect near mouse
      float vortexAngle = atan(toMouse.z, toMouse.x) + particleTime * 5.0;
      vec3 vortexPos = vec3(
        cos(vortexAngle) * mouseDistance,
        sin(particleTime * 10.0) * influence * 20.0,
        sin(vortexAngle) * mouseDistance
      );
      
      pos = mix(pos, mousePos + vortexPos, influence * 0.5);
      pos += forceDir * uForceFieldStrength * influence * 30.0;
      
      // Color shift near mouse
      vColor = mix(vColor, vec3(1.0, 0.8, 0.2), influence * 0.5);
    }
    
    // Calculate final position
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    vDistance = length(mvPosition.xyz);
    
    // Advanced size calculation
    float lifeFactor = smoothstep(0.0, 0.1, vLife) * smoothstep(1.0, 0.8, vLife);
    float sizePulse = 1.0 + sin(particleTime * 10.0 + aPhase * 5.0) * 0.2;
    float distanceFactor = 1.0 / (1.0 + vDistance * 0.001);
    
    vSize = aSize * uScale * lifeFactor * sizePulse * distanceFactor;
    
    // Motion blur stretching
    vec3 screenVelocity = (modelViewMatrix * vec4(velocity, 0.0)).xyz;
    float velocityMagnitude = length(screenVelocity);
    vSize *= (1.0 + velocityMagnitude * 0.02);
    
    gl_PointSize = vSize * (300.0 / -mvPosition.z);
    gl_PointSize = clamp(gl_PointSize, 1.0, 64.0);
  }
`;

// Advanced fragment shader with effects
const advancedFragmentShader = /* glsl */`
  uniform float uTime;
  uniform sampler2D uTexture;
  uniform float uGlow;
  uniform float uSaturation;
  
  varying vec3 vColor;
  varying float vLife;
  varying float vSize;
  varying float vDistance;
  
  // HSL to RGB conversion
  vec3 hsl2rgb(vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0);
    return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
  }
  
  void main() {
    vec2 uv = gl_PointCoord;
    vec2 center = vec2(0.5);
    float dist = length(uv - center);
    
    // Discard pixels outside circle
    if (dist > 0.5) discard;
    
    // Multi-layer particle effect
    float innerCore = 1.0 - smoothstep(0.0, 0.2, dist);
    float midGlow = 1.0 - smoothstep(0.1, 0.4, dist);
    float outerGlow = 1.0 - smoothstep(0.2, 0.5, dist);
    
    // Composite alpha
    float alpha = innerCore + midGlow * 0.5 + outerGlow * 0.3;
    alpha *= vLife;
    alpha *= smoothstep(1.0, 0.0, vDistance / 500.0); // Distance fog
    
    // Enhanced color with saturation control
    vec3 color = vColor;
    
    // Add inner bright core
    color += vec3(0.3, 0.4, 0.5) * innerCore;
    
    // Glow effect
    float glowIntensity = uGlow * (midGlow + outerGlow * 0.5);
    color += color * glowIntensity;
    
    // Saturation adjustment
    float gray = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(gray), color, uSaturation);
    
    // Sparkle effect
    float sparkle = sin(uTime * 20.0 + vSize * 50.0 + vDistance) * 0.5 + 0.5;
    sparkle *= innerCore;
    color += vec3(sparkle * 0.3);
    
    // HDR tone mapping
    color = color / (color + vec3(1.0));
    color = pow(color, vec3(1.0/2.2)); // Gamma correction
    
    gl_FragColor = vec4(color, alpha * 0.9);
  }
`;

interface AdvancedParticleSystemProps {
  mode: 'orbiting' | 'streaming' | 'explosive';
  particleCount?: number;
  mouseInteraction?: boolean;
  showStats?: boolean;
}

function AdvancedParticleSystem({ 
  mode, 
  particleCount = 150000, 
  mouseInteraction = true,
  showStats = true 
}: AdvancedParticleSystemProps) {
  const meshRef = useRef<THREE.Points>(null);
  const mouseRef = useRef(new THREE.Vector2());
  const { gl, size, camera } = useThree();
  const [fps, setFps] = useState(60);
  
  // Performance monitoring
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  
  // Create optimized particle attributes
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
    const emitTimes = new Float32Array(particleCount);
    
    // Stratified initialization for better distribution
    const gridSize = Math.ceil(Math.cbrt(particleCount));
    const cellSize = 200 / gridSize;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Grid-based initial positions with jitter
      const gridX = i % gridSize;
      const gridY = Math.floor(i / gridSize) % gridSize;
      const gridZ = Math.floor(i / (gridSize * gridSize));
      
      positions[i3] = (gridX - gridSize/2) * cellSize + (Math.random() - 0.5) * cellSize;
      positions[i3 + 1] = (gridY - gridSize/2) * cellSize + (Math.random() - 0.5) * cellSize;
      positions[i3 + 2] = (gridZ - gridSize/2) * cellSize + (Math.random() - 0.5) * cellSize;
      
      // Gradient colors
      const t = i / particleCount;
      const hue = t * 240 + 180; // Blue to purple range
      const color = new THREE.Color().setHSL(hue / 360, 0.8, 0.6);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      
      // Varied particle properties
      sizes[i] = Math.pow(Math.random(), 2) * 4 + 0.5; // More small particles
      life[i] = Math.random();
      types[i] = i % 3;
      
      // Directional velocities
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 0.5;
      velocities[i3] = Math.cos(angle) * speed;
      velocities[i3 + 1] = (Math.random() - 0.5) * speed;
      velocities[i3 + 2] = Math.sin(angle) * speed;
      
      // Orbit properties with variation
      orbitRadius[i] = Math.pow(Math.random(), 0.5) * 50 + 10;
      orbitSpeed[i] = Math.random() * 3 + 0.5;
      phases[i] = Math.random() * Math.PI * 2;
      emitTimes[i] = Math.random() * 10; // Staggered emission
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
      phases,
      emitTimes
    };
  }, [particleCount]);
  
  // Enhanced shader uniforms
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMode: { value: mode === 'orbiting' ? 0 : mode === 'streaming' ? 1 : 2 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uScale: { value: 1 },
    uSpeed: { value: 0.5 },
    uTurbulence: { value: 0.8 },
    uForceFieldStrength: { value: 1.5 },
    uNoiseScale: { value: 0.01 },
    uNoiseSpeed: { value: 0.2 },
    uGlow: { value: 1.2 },
    uSaturation: { value: 1.2 },
    uColorA: { value: new THREE.Color(0x4169e1) },
    uColorB: { value: new THREE.Color(0x9370db) },
    uColorC: { value: new THREE.Color(0xff69b4) },
    uTexture: { value: null }
  }), [mode]);
  
  // Mouse handling with smoothing
  useEffect(() => {
    if (!mouseInteraction) return;
    
    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / size.width);
      const y = 1 - (event.clientY / size.height);
      mouseRef.current.set(x, y);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [size, mouseInteraction]);
  
  // Main animation loop with FPS counter
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // FPS calculation
    frameCount.current++;
    const currentTime = performance.now();
    if (currentTime - lastTime.current >= 1000) {
      setFps(frameCount.current);
      frameCount.current = 0;
      lastTime.current = currentTime;
    }
    
    const material = meshRef.current.material as THREE.ShaderMaterial;
    material.uniforms.uTime.value = state.clock.elapsedTime;
    
    // Smooth mouse interpolation
    if (mouseInteraction) {
      material.uniforms.uMouse.value.lerp(mouseRef.current, 0.05);
    }
    
    // Dynamic life update for animation
    const lifeAttribute = meshRef.current.geometry.attributes.aLife as THREE.BufferAttribute;
    const lifeArray = lifeAttribute.array as Float32Array;
    const emitTimes = meshRef.current.geometry.attributes.aEmitTime.array as Float32Array;
    
    for (let i = 0; i < particleCount; i++) {
      const t = (state.clock.elapsedTime - emitTimes[i]) * 0.1;
      lifeArray[i] = Math.max(0, Math.min(1, Math.sin(t) * 0.5 + 0.5));
    }
    lifeAttribute.needsUpdate = true;
    
    // LOD-like behavior - reduce computation for distant particles
    const cameraDistance = camera.position.length();
    material.uniforms.uScale.value = 1 + (cameraDistance - 100) * 0.001;
  });
  
  return (
    <>
      <points ref={meshRef} frustumCulled={false}>
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
          <bufferAttribute
            attach="attributes-aEmitTime"
            count={particleCount}
            array={particles.emitTimes}
            itemSize={1}
          />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={advancedVertexShader}
          fragmentShader={advancedFragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexColors
        />
      </points>
      
      {/* FPS Display */}
      {showStats && (
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur rounded px-3 py-1">
          <p className="text-white text-sm font-mono">{fps} FPS</p>
        </div>
      )}
    </>
  );
}

export function GPUParticleSystemAdvanced() {
  const [mode, setMode] = useState<'orbiting' | 'streaming' | 'explosive'>('orbiting');
  const [particleCount, setParticleCount] = useState(150000);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showControls, setShowControls] = useState(true);
  
  return (
    <div className="relative w-full h-full bg-gray-900">
      {/* Three.js Canvas with optimizations */}
      <Canvas
        camera={{ position: [0, 50, 150], fov: 60, near: 1, far: 1000 }}
        gl={{ 
          antialias: false, 
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        }}
        className="absolute inset-0"
        dpr={[1, 2]} // Limit pixel ratio for performance
      >
        <AdvancedParticleSystem 
          mode={mode} 
          particleCount={particleCount}
          showStats={true}
        />
        <OrbitControls 
          enableZoom={true} 
          enablePan={true}
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
          maxDistance={500}
          minDistance={50}
        />
        {/* Performance stats overlay */}
        <Stats className="!absolute !top-16 !right-4" />
      </Canvas>
      
      {/* Advanced Controls */}
      {showControls && (
        <div className="absolute top-4 left-4 space-y-3 z-10 max-w-xs">
          {/* Mode Selection */}
          <div className="bg-black/70 backdrop-blur rounded-lg p-4 space-y-3">
            <h3 className="text-white text-sm font-medium mb-2">Particle Behavior</h3>
            <div className="grid grid-cols-1 gap-2">
              {(['orbiting', 'streaming', 'explosive'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                    mode === m 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Particle Count */}
          <div className="bg-black/70 backdrop-blur rounded-lg p-4">
            <label className="text-white text-sm font-medium">
              Particles: {particleCount.toLocaleString()}
            </label>
            <input
              type="range"
              min="50000"
              max="300000"
              step="10000"
              value={particleCount}
              onChange={(e) => setParticleCount(Number(e.target.value))}
              className="w-full mt-2 accent-purple-600"
            />
            <div className="flex justify-between text-xs text-white/50 mt-1">
              <span>50K</span>
              <span>300K</span>
            </div>
          </div>
          
          {/* Options */}
          <div className="bg-black/70 backdrop-blur rounded-lg p-4 space-y-2">
            <label className="flex items-center text-white text-sm">
              <input
                type="checkbox"
                checked={autoRotate}
                onChange={(e) => setAutoRotate(e.target.checked)}
                className="mr-2"
              />
              Auto Rotate
            </label>
          </div>
        </div>
      )}
      
      {/* Toggle Controls Button */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur rounded p-2 text-white hover:bg-black/70 transition-colors"
        style={{ display: showControls ? 'none' : 'block' }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      </button>
      
      {/* Instructions */}
      <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur rounded-lg px-4 py-3 max-w-lg mx-auto">
        <p className="text-white text-sm text-center">
          <span className="font-medium">Mouse:</span> Interact with particles • 
          <span className="font-medium"> Scroll:</span> Zoom • 
          <span className="font-medium"> Drag:</span> Rotate view
        </p>
      </div>
    </div>
  );
}