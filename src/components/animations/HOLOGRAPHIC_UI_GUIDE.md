# Holographic UI Overlay Integration Guide

## Overview
This holographic UI overlay system provides futuristic, cyberpunk-styled components with smooth 60fps animations, glassmorphism effects, and responsive design.

## Components

### 1. **HolographicOverlay**
Main container component that orchestrates all holographic elements with parallax scrolling effects.

### 2. **FloatingDataPanel**
Real-time metric displays with animated trends and glowing borders.
- Variants: cyan, purple, pink, green
- Features: Live data updates, trend indicators, scan line effects

### 3. **CircularProgress**
Animated circular progress indicators with gradient fills.
- Sizes: sm, md, lg
- Colors: cyan, purple, pink, green
- Features: Animated fill, orbiting particles, glow effects

### 4. **CodeTyper**
Self-typing code snippets with syntax highlighting.
- Languages: Python, JavaScript, TypeScript
- Features: Typewriter effect, line numbers, scan lines

### 5. **GlitchText**
Text with cyberpunk glitch effects.
- Sizes: sm to 6xl
- Colors: cyan, purple, pink, white
- Features: Random glitching, RGB split, scanlines

### 6. **NeonBorder**
Animated neon borders for containers.
- Colors: cyan, purple, pink, green
- Features: Animated stroke, corner highlights, inner glow

### 7. **AnimatedChart**
Real-time data visualization with Canvas API.
- Features: Live waveform, gradient lines, grid background

### 8. **HUDElements**
Collection of heads-up display elements.
- Features: Crosshairs, status indicators, radar, corner frames

### 9. **ParticleField**
Interactive 3D particle system with mouse tracking.
- Features: 3D perspective, particle connections, mouse influence

### 10. **GridBackground**
Cyberpunk-styled animated backgrounds.
- Features: Perspective grid, digital rain, floating squares

## Integration Examples

### Basic Usage
```tsx
import { HolographicOverlay } from '@/components/animations/HolographicOverlay';

export function HeroSection() {
  return (
    <section className="relative min-h-screen bg-black">
      <HolographicOverlay />
      {/* Your content here */}
    </section>
  );
}
```

### Using Individual Components
```tsx
import { 
  FloatingDataPanel, 
  CircularProgress, 
  GlitchText 
} from '@/components/animations/holographic';

export function Dashboard() {
  return (
    <div className="p-8 bg-black">
      <GlitchText text="SYSTEM STATUS" size="2xl" />
      
      <FloatingDataPanel 
        title="Performance Metrics"
        metrics={[
          { label: "CPU", value: 76, trend: "+12%" },
          { label: "Memory", value: 4.2, unit: "GB", trend: "-5%" }
        ]}
        variant="cyan"
      />
      
      <CircularProgress 
        value={87} 
        label="Progress" 
        size="lg"
        color="purple"
      />
    </div>
  );
}
```

### Replacing Existing Hero Animation
```tsx
// In HeroSection.tsx, replace SmoothHeroAnimation with:
import { HolographicOverlay } from '@/components/animations/HolographicOverlay';

// Inside the animation container:
<div className="aspect-video bg-black rounded-lg shadow-lg overflow-hidden">
  <HolographicOverlay />
</div>
```

## Performance Considerations

1. **GPU Acceleration**: All animations use CSS transforms and will-change for optimal performance
2. **Canvas Optimization**: Particle and chart animations use requestAnimationFrame for 60fps
3. **Responsive Design**: Components scale appropriately on mobile devices
4. **Reduced Motion**: Respects user preferences for accessibility

## Customization

### Colors
The system uses a consistent color palette:
- Cyan: #06B6D4
- Purple: #A855F7
- Pink: #EC4899
- Green: #22C55E

### Adding New Metrics
```tsx
<FloatingDataPanel 
  title="Custom Metrics"
  metrics={[
    { label: "Custom 1", value: 123, unit: "ms", trend: "+5%" },
    { label: "Custom 2", value: 45.6, unit: "%", trend: "-2%" }
  ]}
  variant="purple"
/>
```

### Adjusting Animation Speed
Most components accept transition durations. For example:
```tsx
// In component files, adjust transition durations
transition={{ duration: 2, repeat: Infinity }}
```

## Browser Support
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (with -webkit prefixes)
- Mobile: Optimized for touch devices

## Accessibility
- Respects prefers-reduced-motion
- High contrast text on backgrounds
- Semantic HTML structure
- ARIA labels where appropriate