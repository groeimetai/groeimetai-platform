/**
 * Custom GLSL shaders for AI-themed hero animations
 * Optimized for performance with spectacular visual effects
 */

export const HolographicBrainVertexShader = `
  precision highp float;
  
  attribute vec3 position;
  attribute vec3 normal;
  attribute vec2 uv;
  
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform mat3 normalMatrix;
  uniform float uTime;
  uniform float uPulseIntensity;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  varying float vNeuronPulse;
  
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    
    // Create pulsing neuron effect
    vec3 pos = position;
    float neuronNoise = random(uv + uTime * 0.1);
    float pulse = sin(uTime * 2.0 + neuronNoise * 6.28) * 0.5 + 0.5;
    vNeuronPulse = pulse * uPulseIntensity;
    
    // Slight vertex displacement for organic feel
    pos += normal * pulse * 0.02;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vPosition = mvPosition.xyz;
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const HolographicBrainFragmentShader = `
  precision highp float;
  
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform float uTime;
  uniform float uOpacity;
  uniform float uScanlineIntensity;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  varying float vNeuronPulse;
  
  void main() {
    // Holographic rim lighting
    vec3 viewDirection = normalize(-vPosition);
    float rimLight = 1.0 - max(0.0, dot(viewDirection, vNormal));
    rimLight = pow(rimLight, 2.0);
    
    // Neuron network pattern
    float neuronPattern = sin(vUv.x * 50.0) * sin(vUv.y * 50.0);
    neuronPattern = smoothstep(0.8, 0.9, neuronPattern + vNeuronPulse);
    
    // Scanline effect
    float scanline = sin(vUv.y * 200.0 + uTime * 5.0) * 0.5 + 0.5;
    scanline = mix(1.0, scanline, uScanlineIntensity);
    
    // Color mixing
    vec3 color = mix(uColor1, uColor2, rimLight + neuronPattern);
    color *= scanline;
    
    // Holographic transparency
    float alpha = (rimLight + neuronPattern * 0.5) * uOpacity;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

export const DataStreamVertexShader = `
  precision highp float;
  
  attribute vec3 position;
  attribute vec2 uv;
  attribute float instanceId;
  
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uFlowSpeed;
  uniform float uStreamWidth;
  
  varying vec2 vUv;
  varying float vFlow;
  varying float vInstanceId;
  
  void main() {
    vUv = uv;
    vInstanceId = instanceId;
    
    // Create flowing motion
    vec3 pos = position;
    float flowOffset = instanceId * 0.1;
    vFlow = fract(uTime * uFlowSpeed + flowOffset);
    
    // Stream path with sine wave
    pos.x += sin(uTime * 2.0 + flowOffset * 3.14) * uStreamWidth;
    pos.y -= vFlow * 5.0;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const DataStreamFragmentShader = `
  precision highp float;
  
  uniform vec3 uColor;
  uniform float uTime;
  uniform sampler2D uBinaryTexture;
  uniform float uGlowIntensity;
  
  varying vec2 vUv;
  varying float vFlow;
  varying float vInstanceId;
  
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }
  
  void main() {
    // Binary code pattern
    vec2 binaryUv = vec2(vUv.x, vUv.y + uTime * 0.5);
    float binary = step(0.5, random(floor(binaryUv * 20.0)));
    
    // Flow fade
    float flowFade = 1.0 - vFlow;
    flowFade = pow(flowFade, 2.0);
    
    // Glow effect
    float glow = smoothstep(0.0, 0.5, vUv.x) * smoothstep(1.0, 0.5, vUv.x);
    glow *= uGlowIntensity;
    
    // Final color
    vec3 color = uColor * (binary + glow);
    float alpha = flowFade * (binary * 0.8 + 0.2);
    
    gl_FragColor = vec4(color, alpha);
  }
`;

export const QuantumParticleVertexShader = `
  precision highp float;
  
  attribute vec3 position;
  attribute vec3 velocity;
  attribute float particleId;
  attribute float entanglementId;
  
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uQuantumField;
  uniform float uEntanglementStrength;
  
  varying float vParticleId;
  varying float vEntanglement;
  varying vec3 vVelocity;
  
  vec3 quantumOscillation(vec3 pos, float phase) {
    float quantum = sin(uTime * 3.0 + phase) * cos(uTime * 2.0 + phase * 0.5);
    return pos + vec3(
      quantum * 0.1,
      cos(quantum * 3.14) * 0.1,
      sin(quantum * 3.14) * 0.1
    ) * uQuantumField;
  }
  
  void main() {
    vParticleId = particleId;
    vVelocity = velocity;
    
    // Quantum position with uncertainty
    vec3 pos = position + velocity * uTime;
    pos = quantumOscillation(pos, particleId);
    
    // Entanglement effect
    float entanglementPhase = entanglementId * 3.14159;
    vEntanglement = sin(uTime * 4.0 + entanglementPhase) * uEntanglementStrength;
    pos.x += cos(entanglementPhase) * vEntanglement * 0.2;
    pos.z += sin(entanglementPhase) * vEntanglement * 0.2;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = (300.0 / -mvPosition.z) * (1.0 + vEntanglement);
  }
`;

export const QuantumParticleFragmentShader = `
  precision highp float;
  
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uTime;
  uniform float uSpinRate;
  
  varying float vParticleId;
  varying float vEntanglement;
  varying vec3 vVelocity;
  
  void main() {
    // Circular particle shape
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;
    
    // Quantum spin visualization
    float spin = atan(center.y, center.x) + uTime * uSpinRate + vParticleId;
    float spinPattern = sin(spin * 4.0) * 0.5 + 0.5;
    
    // Color based on entanglement
    vec3 color = mix(uColorA, uColorB, vEntanglement * 0.5 + 0.5);
    color *= 1.0 + spinPattern * 0.3;
    
    // Soft edges with quantum blur
    float alpha = smoothstep(0.5, 0.0, dist);
    alpha *= 0.8 + vEntanglement * 0.2;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

export const EnergyFieldVertexShader = `
  precision highp float;
  
  attribute vec3 position;
  attribute vec3 normal;
  attribute vec2 uv;
  
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform mat3 normalMatrix;
  uniform float uTime;
  uniform float uFieldIntensity;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  varying float vEnergy;
  
  float noise3D(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 45.543))) * 43758.5453);
  }
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    
    // Energy field distortion
    vec3 pos = position;
    float energy = noise3D(pos + uTime * 0.5);
    vEnergy = energy * uFieldIntensity;
    
    // Electromagnetic wave displacement
    float wave = sin(pos.x * 10.0 + uTime * 3.0) * 
                 cos(pos.y * 10.0 + uTime * 2.0) * 
                 sin(pos.z * 10.0 + uTime * 4.0);
    pos += normal * wave * 0.05 * uFieldIntensity;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vPosition = mvPosition.xyz;
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const EnergyFieldFragmentShader = `
  precision highp float;
  
  uniform vec3 uColorCore;
  uniform vec3 uColorOuter;
  uniform float uTime;
  uniform float uArcIntensity;
  uniform vec2 uResolution;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  varying float vEnergy;
  
  float electricArc(vec2 uv, float seed) {
    float bolt = 0.0;
    float offset = sin(seed * 543.21) * 0.5;
    
    for(float i = 0.0; i < 5.0; i++) {
      float phase = uTime * (2.0 + i * 0.3) + seed * 6.28;
      float deviation = sin(phase + uv.y * 10.0) * 0.1 * (1.0 - uv.y);
      float x = uv.x + offset + deviation;
      float width = 0.001 + i * 0.0005;
      bolt += (1.0 / (abs(x - 0.5) / width + 1.0)) * (1.0 - i / 5.0);
    }
    
    return bolt * uArcIntensity;
  }
  
  void main() {
    // View-dependent effects
    vec3 viewDir = normalize(-vPosition);
    float fresnel = 1.0 - max(0.0, dot(viewDir, vNormal));
    fresnel = pow(fresnel, 1.5);
    
    // Multiple electric arcs
    float arc1 = electricArc(vUv, 1.234);
    float arc2 = electricArc(vec2(vUv.y, vUv.x), 5.678);
    float arc3 = electricArc(vUv * 0.7 + 0.15, 9.012);
    float totalArcs = max(max(arc1, arc2), arc3);
    
    // Energy field gradient
    float fieldGradient = fresnel + vEnergy * 0.5;
    
    // Color mixing
    vec3 coreGlow = uColorCore * (1.0 + totalArcs);
    vec3 outerGlow = uColorOuter * fieldGradient;
    vec3 color = mix(outerGlow, coreGlow, totalArcs * 0.7 + fresnel * 0.3);
    
    // Pulsing intensity
    float pulse = sin(uTime * 3.0) * 0.2 + 0.8;
    color *= pulse;
    
    // Alpha for transparency
    float alpha = (fresnel * 0.3 + totalArcs * 0.7 + vEnergy * 0.2) * 0.9;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

export const MatrixRainVertexShader = `
  precision highp float;
  
  attribute vec3 position;
  attribute vec2 uv;
  attribute float columnId;
  attribute float charId;
  
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uDropSpeed;
  uniform float uColumnSpacing;
  
  varying vec2 vUv;
  varying float vBrightness;
  varying float vCharId;
  varying float vColumnId;
  
  void main() {
    vUv = uv;
    vCharId = charId;
    vColumnId = columnId;
    
    // Matrix rain falling motion
    vec3 pos = position;
    pos.x = (columnId - 25.0) * uColumnSpacing;
    
    // Different fall speeds per column
    float columnSpeed = uDropSpeed * (0.5 + mod(columnId * 1.618, 1.0) * 0.5);
    float fallOffset = mod(uTime * columnSpeed + columnId * 0.1, 30.0);
    pos.y = 15.0 - fallOffset - charId * 0.8;
    
    // Brightness based on position in trail
    vBrightness = 1.0 - (charId / 20.0);
    vBrightness *= smoothstep(-5.0, 5.0, pos.y) * smoothstep(20.0, 10.0, pos.y);
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const MatrixRainFragmentShader = `
  precision highp float;
  
  uniform vec3 uColorBright;
  uniform vec3 uColorDim;
  uniform float uTime;
  uniform sampler2D uMatrixFont;
  uniform float uGlowSize;
  uniform float uCharMutation;
  
  varying vec2 vUv;
  varying float vBrightness;
  varying float vCharId;
  varying float vColumnId;
  
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }
  
  void main() {
    // Character selection with mutation
    float mutation = step(uCharMutation, random(vec2(vColumnId, floor(uTime * 10.0))));
    float charOffset = mod(vCharId + mutation * random(vec2(vCharId, vColumnId)) * 16.0, 16.0);
    
    // Sample matrix character from texture atlas
    vec2 charUv = vUv / 16.0 + vec2(mod(charOffset, 4.0), floor(charOffset / 4.0)) * 0.25;
    float character = texture2D(uMatrixFont, charUv).g;
    
    // Head of the trail is brightest
    float headGlow = smoothstep(0.8, 1.0, vBrightness);
    vec3 color = mix(uColorDim, uColorBright, vBrightness + headGlow);
    
    // Glow effect
    float glow = character;
    for(float i = 1.0; i <= 3.0; i++) {
      vec2 offset = vec2(0.0, i * 0.001) * uGlowSize;
      glow += texture2D(uMatrixFont, charUv + offset).g * (1.0 - i / 3.0) * 0.3;
      glow += texture2D(uMatrixFont, charUv - offset).g * (1.0 - i / 3.0) * 0.3;
    }
    
    // Flickering for variation
    float flicker = 0.9 + sin(uTime * 20.0 + vColumnId * 3.14) * 0.1;
    
    // Final color with glow
    color *= (character + glow * headGlow) * flicker;
    float alpha = (character + glow * 0.5) * vBrightness;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

// Shader uniform configurations for easy use
export const ShaderUniforms = {
  holographicBrain: {
    uTime: { value: 0 },
    uColor1: { value: [0.0, 0.8, 1.0] }, // Cyan
    uColor2: { value: [0.5, 0.0, 1.0] }, // Purple
    uPulseIntensity: { value: 0.8 },
    uOpacity: { value: 0.7 },
    uScanlineIntensity: { value: 0.3 }
  },
  
  dataStream: {
    uTime: { value: 0 },
    uColor: { value: [0.0, 1.0, 0.5] }, // Matrix green
    uFlowSpeed: { value: 0.5 },
    uStreamWidth: { value: 0.3 },
    uGlowIntensity: { value: 1.5 },
    uBinaryTexture: { value: null }
  },
  
  quantumParticle: {
    uTime: { value: 0 },
    uColorA: { value: [1.0, 0.0, 0.5] }, // Magenta
    uColorB: { value: [0.0, 0.5, 1.0] }, // Blue
    uQuantumField: { value: 1.0 },
    uEntanglementStrength: { value: 0.8 },
    uSpinRate: { value: 2.0 }
  },
  
  energyField: {
    uTime: { value: 0 },
    uColorCore: { value: [1.0, 0.8, 0.0] }, // Electric yellow
    uColorOuter: { value: [0.2, 0.5, 1.0] }, // Electric blue
    uFieldIntensity: { value: 1.0 },
    uArcIntensity: { value: 0.8 },
    uResolution: { value: [1920, 1080] }
  },
  
  matrixRain: {
    uTime: { value: 0 },
    uColorBright: { value: [0.5, 1.0, 0.5] }, // Bright green
    uColorDim: { value: [0.0, 0.3, 0.0] }, // Dark green
    uDropSpeed: { value: 2.0 },
    uColumnSpacing: { value: 0.8 },
    uGlowSize: { value: 1.5 },
    uCharMutation: { value: 0.1 },
    uMatrixFont: { value: null }
  }
};

// Helper function to update time-based uniforms
export const updateShaderTime = (uniforms: any, deltaTime: number) => {
  if (uniforms.uTime) {
    uniforms.uTime.value += deltaTime;
  }
};

// Shader material configurations
export const ShaderMaterials = {
  holographicBrain: {
    vertexShader: HolographicBrainVertexShader,
    fragmentShader: HolographicBrainFragmentShader,
    uniforms: ShaderUniforms.holographicBrain,
    transparent: true,
    side: 'DoubleSide',
    depthWrite: false,
    blending: 'AdditiveBlending'
  },
  
  dataStream: {
    vertexShader: DataStreamVertexShader,
    fragmentShader: DataStreamFragmentShader,
    uniforms: ShaderUniforms.dataStream,
    transparent: true,
    depthWrite: false,
    blending: 'AdditiveBlending'
  },
  
  quantumParticle: {
    vertexShader: QuantumParticleVertexShader,
    fragmentShader: QuantumParticleFragmentShader,
    uniforms: ShaderUniforms.quantumParticle,
    transparent: true,
    depthWrite: false,
    blending: 'AdditiveBlending'
  },
  
  energyField: {
    vertexShader: EnergyFieldVertexShader,
    fragmentShader: EnergyFieldFragmentShader,
    uniforms: ShaderUniforms.energyField,
    transparent: true,
    side: 'DoubleSide',
    depthWrite: false,
    blending: 'AdditiveBlending'
  },
  
  matrixRain: {
    vertexShader: MatrixRainVertexShader,
    fragmentShader: MatrixRainFragmentShader,
    uniforms: ShaderUniforms.matrixRain,
    transparent: true,
    depthWrite: false,
    blending: 'AdditiveBlending'
  }
};