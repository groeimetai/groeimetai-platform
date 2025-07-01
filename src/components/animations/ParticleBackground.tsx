'use client';

import { Canvas } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Simplified vertex shader for background particles
const backgroundVertexShader = /* glsl */`
  uniform float uTime;
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aSpeed;
  
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    vColor = aColor;
    
    vec3 pos = position;
    
    // Gentle floating motion
    pos.y += sin(uTime * aSpeed + position.x * 0.01) * 5.0;
    pos.x += cos(uTime * aSpeed * 0.7 + position.z * 0.01) * 3.0;
    
    // Wrap around
    pos.y = mod(pos.y + 50.0, 100.0) - 50.0;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation
    gl_PointSize = aSize * (200.0 / -mvPosition.z);
    gl_PointSize = clamp(gl_PointSize, 1.0, 32.0);
    
    // Fade based on distance
    vAlpha = 1.0 - smoothstep(50.0, 200.0, -mvPosition.z);
  }
`;

// Simplified fragment shader for background particles
const backgroundFragmentShader = /* glsl */`
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    vec2 uv = gl_PointCoord;
    float dist = length(uv - vec2(0.5));
    
    if (dist > 0.5) discard;
    
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    alpha *= vAlpha * 0.6;
    
    gl_FragColor = vec4(vColor, alpha);
  }
`;

interface BackgroundParticlesProps {
  count?: number;
  opacity?: number;
}

function BackgroundParticles({ count = 1000, opacity = 0.6 }: BackgroundParticlesProps) {
  const meshRef = useRef<THREE.Points>(null);
  
  const { positions, colors, sizes, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const speeds = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      positions[i3] = (Math.random() - 0.5) * 100;
      positions[i3 + 1] = (Math.random() - 0.5) * 100;
      positions[i3 + 2] = (Math.random() - 0.5) * 50;
      
      // Soft blue-purple gradient
      const color = new THREE.Color().setHSL(
        200 / 360 + Math.random() * 60 / 360,
        0.5,
        0.6
      );
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      
      sizes[i] = Math.random() * 3 + 1;
      speeds[i] = Math.random() * 0.5 + 0.1;
    }
    
    return { positions, colors, sizes, speeds };
  }, [count]);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }
  }), []);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as THREE.ShaderMaterial;
    material.uniforms.uTime.value = state.clock.elapsedTime;
  });
  
  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aColor"
          count={count}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          count={count}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aSpeed"
          count={count}
          array={speeds}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={backgroundVertexShader}
        fragmentShader={backgroundFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function ParticleBackground({ 
  particleCount = 1000,
  className = "" 
}: { 
  particleCount?: number;
  className?: string;
}) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 50], fov: 60 }}
        gl={{ 
          antialias: false, 
          alpha: true,
          powerPreference: "low-power"
        }}
        style={{ background: 'transparent' }}
      >
        <BackgroundParticles count={particleCount} />
      </Canvas>
    </div>
  );
}