# WebGL Animation Setup Guide

## Required Dependencies

To use the WebGL animations, you need to install the following packages:

```bash
npm install @react-three/fiber @react-three/drei
# or
yarn add @react-three/fiber @react-three/drei
```

Note: `three` is already installed in your package.json.

## Component Overview

### 1. WebGLHeroAnimation
- Full-featured WebGL animation with neural networks, particle systems, and shader effects
- 50,000+ particles with advanced shader materials
- Mouse interactivity and scene morphing
- Best for high-end desktop experiences

### 2. OptimizedWebGLHero
- Performance-optimized version with adaptive quality
- LOD (Level of Detail) system for better performance
- GPU detection and automatic quality adjustment
- Frustum culling for efficient rendering
- Best for general use across different devices

### 3. SmoothHeroAnimation (existing)
- Framer Motion based animation
- Lightweight and mobile-friendly
- CSS-based animations
- Best for mobile and low-end devices

## Usage Examples

### Basic Implementation
```tsx
import { OptimizedWebGLHero } from '@/components/animations';

export function HomePage() {
  return (
    <div className="h-screen">
      <OptimizedWebGLHero />
    </div>
  );
}
```

### With Animation Type Detection
```tsx
import { useState, useEffect } from 'react';
import { OptimizedWebGLHero } from '@/components/animations/OptimizedWebGLHero';
import { SmoothHeroAnimation } from '@/components/animations/SmoothHeroAnimation';

export function AdaptiveHero() {
  const [useWebGL, setUseWebGL] = useState(true);

  useEffect(() => {
    // Detect device capabilities
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (isMobile || prefersReducedMotion) {
      setUseWebGL(false);
    }
  }, []);

  return useWebGL ? <OptimizedWebGLHero /> : <SmoothHeroAnimation />;
}
```

## Performance Considerations

1. **GPU Detection**: The OptimizedWebGLHero automatically detects GPU capabilities and adjusts:
   - Particle count (10k to 50k)
   - Shadow quality
   - Post-processing effects
   - Reflection quality

2. **LOD System**: Objects have multiple detail levels based on distance:
   - High detail: Close range (< 10 units)
   - Medium detail: Mid range (10-20 units)
   - Low detail: Far range (> 20 units)

3. **Frustum Culling**: Objects outside the camera view are not rendered

4. **Adaptive DPR**: Device pixel ratio adjusts based on performance

## Customization

### Custom Shaders
The animations use custom shaders located in `/src/components/animations/shaders/`:
- Digital Rain Shader
- Energy Field Shader
- Quantum Particle Shader
- Matrix Grid Shader
- Warp Tunnel Shader

### Adding New Effects
```tsx
import { createShaderMaterial } from '@/components/animations/shaders';

const customShader = {
  uniforms: {
    time: { value: 0 },
    color: { value: new THREE.Color(0xff0000) }
  },
  vertexShader: `...`,
  fragmentShader: `...`
};

const material = createShaderMaterial(customShader);
```

## Browser Support

- Chrome 90+: Full support
- Firefox 88+: Full support
- Safari 14+: Full support (may need fallback for some effects)
- Edge 90+: Full support

Mobile browsers have automatic fallback to SmoothHeroAnimation.

## Troubleshooting

1. **Black Screen**: Check WebGL support in browser
2. **Low Performance**: The system automatically reduces quality
3. **Memory Issues**: Reduce particle count in OptimizedWebGLHero settings

## Next Steps

1. Test the animations in your development environment
2. Monitor performance metrics using the built-in Stats component
3. Customize colors and effects to match your brand
4. Consider A/B testing between WebGL and Smooth animations