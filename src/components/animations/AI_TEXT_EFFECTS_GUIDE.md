# AI Text Effects Component Guide

## Overview
A collection of spectacular text animation effects designed specifically for AI-themed interfaces, supporting both Dutch and English languages.

## Available Effects

### 1. Typewriter Effect
Simulates AI typing with a gradient cursor.
```tsx
import { TypewriterText } from '@/components/animations';

<TypewriterText 
  language="en"
  text={{ nl: "Kunstmatige Intelligentie", en: "Artificial Intelligence" }}
  duration={3000}
/>
```

### 2. Glitch Effect
Creates a digital glitch effect with RGB channel separation.
```tsx
import { GlitchText } from '@/components/animations';

<GlitchText 
  language="nl"
  text={{ nl: "SYSTEEM STORING", en: "SYSTEM ERROR" }}
/>
```

### 3. Morphing Text
Smoothly transitions between different AI-related terms.
```tsx
import { MorphingText } from '@/components/animations';

<MorphingText 
  language="en"
  duration={2000}
/>
```

### 4. 3D Rotation
Rotates text in 3D space continuously.
```tsx
import { Rotate3DText } from '@/components/animations';

<Rotate3DText 
  language="en"
  text={{ nl: "3D Tekst", en: "3D Text" }}
  duration={5000}
/>
```

### 5. Particle Dissolution
Text dissolves into particles that float away.
```tsx
import { ParticleText } from '@/components/animations';

<ParticleText 
  language="en"
  text={{ nl: "Deeltjes Effect", en: "Particle Effect" }}
/>
```

### 6. Binary Transform
Shows binary code transforming into readable text.
```tsx
import { BinaryText } from '@/components/animations';

<BinaryText 
  language="en"
  text={{ nl: "Binaire Code", en: "Binary Code" }}
  duration={3000}
/>
```

### 7. Neural Network
Creates animated connections around text like neural pathways.
```tsx
import { NeuralText } from '@/components/animations';

<NeuralText 
  language="en"
  text={{ nl: "Neuraal Netwerk", en: "Neural Network" }}
/>
```

## Using the Main Component

You can also use the main `AITextEffects` component with dynamic effect selection:

```tsx
import { AITextEffects } from '@/components/animations';

<AITextEffects 
  effect="glitch"
  language="en"
  text={{ nl: "Nederlandse tekst", en: "English text" }}
  duration={3000}
  className="my-custom-class"
/>
```

## Props

### Common Props
- `language`: 'nl' | 'en' - Language selection
- `text`: { nl: string, en: string } - Text content in both languages
- `duration`: number - Animation duration in milliseconds
- `className`: string - Optional CSS class for styling

### Effect Types
- `typewriter`: Typing animation with cursor
- `glitch`: Digital glitch effect
- `morph`: Morphing between AI terms
- `rotate3d`: 3D rotation animation
- `particles`: Particle dissolution effect
- `binary`: Binary to text transformation
- `neural`: Neural network connections

## Demo Component

To see all effects in action:

```tsx
import { AITextEffectsDemo } from '@/components/animations';

// In your page or component
<AITextEffectsDemo />
```

## Styling

All components can be styled using styled-components or regular CSS:

```tsx
import styled from 'styled-components';
import { GlitchText } from '@/components/animations';

const StyledGlitch = styled(GlitchText)`
  font-size: 4rem;
  color: #ff0080;
`;
```

## Performance Tips

1. **Typewriter**: Lightweight, minimal performance impact
2. **Glitch**: Uses CSS animations, very performant
3. **Morph**: Smooth transitions with Framer Motion
4. **3D Rotation**: GPU-accelerated transforms
5. **Particles**: Limit particle count for better performance
6. **Binary**: Adjust update frequency if needed
7. **Neural**: Reduce connection count on lower-end devices

## Integration Example

```tsx
import React, { useState } from 'react';
import { TypewriterText, GlitchText, MorphingText } from '@/components/animations';

const AIHero = () => {
  const [language, setLanguage] = useState<'nl' | 'en'>('en');

  return (
    <div>
      <TypewriterText 
        language={language}
        text={{ 
          nl: "Welkom bij de toekomst", 
          en: "Welcome to the future" 
        }}
      />
      
      <button onClick={() => setLanguage(lang => lang === 'en' ? 'nl' : 'en')}>
        Toggle Language
      </button>
    </div>
  );
};
```