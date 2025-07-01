import * as THREE from 'three';

// Digital Rain Shader
export const digitalRainShader = {
  uniforms: {
    time: { value: 0 },
    resolution: { value: new THREE.Vector2() },
    color: { value: new THREE.Color(0x00ff00) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec2 resolution;
    uniform vec3 color;
    varying vec2 vUv;
    
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    
    void main() {
      vec2 st = vUv * vec2(50.0, 100.0);
      vec2 ipos = floor(st);
      vec2 fpos = fract(st);
      
      float rain = step(0.95, random(vec2(ipos.x, ipos.y - time * 10.0)));
      float fade = 1.0 - fpos.y;
      
      vec3 finalColor = color * rain * fade;
      gl_FragColor = vec4(finalColor, rain * fade);
    }
  `,
};

// Energy Field Shader
export const energyFieldShader = {
  uniforms: {
    time: { value: 0 },
    color1: { value: new THREE.Color(0x00ffff) },
    color2: { value: new THREE.Color(0xff00ff) },
    noiseScale: { value: 2.0 },
    speed: { value: 1.0 },
  },
  vertexShader: `
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
  fragmentShader: `
    uniform float time;
    uniform vec3 color1;
    uniform vec3 color2;
    uniform float noiseScale;
    uniform float speed;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m;
      m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }
    
    void main() {
      float noise = snoise(vPosition.xy * noiseScale + time * speed);
      float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
      
      vec3 color = mix(color1, color2, noise * 0.5 + 0.5);
      float alpha = fresnel * (0.5 + noise * 0.5);
      
      gl_FragColor = vec4(color, alpha);
    }
  `,
};

// Quantum Particle Shader
export const quantumParticleShader = {
  uniforms: {
    time: { value: 0 },
    particleSize: { value: 0.1 },
  },
  vertexShader: `
    attribute float size;
    attribute vec3 color;
    
    varying vec3 vColor;
    varying float vAlpha;
    
    uniform float time;
    uniform float particleSize;
    
    void main() {
      vColor = color;
      
      vec3 pos = position;
      
      // Quantum fluctuation
      float quantum = sin(time * 2.0 + position.x * 10.0) * 0.1;
      pos.y += quantum;
      
      // Distance-based alpha
      float dist = length(pos);
      vAlpha = 1.0 - smoothstep(10.0, 30.0, dist);
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = size * particleSize * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;
    
    void main() {
      // Circular particle shape
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      
      if (dist > 0.5) discard;
      
      // Soft edges
      float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
      
      gl_FragColor = vec4(vColor, alpha * vAlpha);
    }
  `,
};

// Matrix Grid Shader
export const matrixGridShader = {
  uniforms: {
    time: { value: 0 },
    gridSize: { value: 50.0 },
    lineWidth: { value: 0.02 },
    color: { value: new THREE.Color(0x00ff00) },
    opacity: { value: 0.5 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform float gridSize;
    uniform float lineWidth;
    uniform vec3 color;
    uniform float opacity;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      vec2 grid = abs(fract(vUv * gridSize - time * 0.1) - 0.5);
      float line = smoothstep(0.0, lineWidth, grid.x) * smoothstep(0.0, lineWidth, grid.y);
      line = 1.0 - line;
      
      // Pulse effect
      float pulse = sin(time * 2.0 + vPosition.x * 0.5) * 0.5 + 0.5;
      
      gl_FragColor = vec4(color * pulse, line * opacity);
    }
  `,
};

// Warp Tunnel Shader
export const warpTunnelShader = {
  uniforms: {
    time: { value: 0 },
    speed: { value: 1.0 },
    rings: { value: 20.0 },
    color1: { value: new THREE.Color(0x0080ff) },
    color2: { value: new THREE.Color(0xff0080) },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform float speed;
    uniform float rings;
    uniform vec3 color1;
    uniform vec3 color2;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      vec2 center = vUv - 0.5;
      float dist = length(center);
      float angle = atan(center.y, center.x);
      
      // Spiral pattern
      float spiral = sin(dist * rings - time * speed + angle * 2.0) * 0.5 + 0.5;
      
      // Radial fade
      float fade = 1.0 - smoothstep(0.0, 0.5, dist);
      
      vec3 color = mix(color1, color2, spiral);
      
      gl_FragColor = vec4(color, spiral * fade);
    }
  `,
};

// Create shader material helper
export function createShaderMaterial(shader: any, additionalUniforms = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...shader.uniforms,
      ...additionalUniforms,
    },
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}