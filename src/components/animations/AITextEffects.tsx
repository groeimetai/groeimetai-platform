import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation, Variants } from 'framer-motion';
import styled, { keyframes, css } from 'styled-components';

interface TextContent {
  nl: string;
  en: string;
}

interface AITextEffectsProps {
  language?: 'nl' | 'en';
  effect?: 'typewriter' | 'glitch' | 'morph' | 'rotate3d' | 'particles' | 'binary' | 'neural';
  text?: TextContent;
  duration?: number;
  className?: string;
}

// Default AI terms for morphing effect
const aiTerms: TextContent[] = [
  { nl: 'Kunstmatige Intelligentie', en: 'Artificial Intelligence' },
  { nl: 'Machine Learning', en: 'Machine Learning' },
  { nl: 'Neurale Netwerken', en: 'Neural Networks' },
  { nl: 'Deep Learning', en: 'Deep Learning' },
  { nl: 'Natuurlijke Taalverwerking', en: 'Natural Language Processing' },
  { nl: 'Computer Visie', en: 'Computer Vision' }
];

// Styled Components
const glitchAnimation = keyframes`
  0% {
    text-shadow: 0.05em 0 0 rgba(255, 0, 0, 0.75),
                -0.05em -0.025em 0 rgba(0, 255, 0, 0.75),
                0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
  }
  14% {
    text-shadow: 0.05em 0 0 rgba(255, 0, 0, 0.75),
                -0.05em -0.025em 0 rgba(0, 255, 0, 0.75),
                0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
  }
  15% {
    text-shadow: -0.05em -0.025em 0 rgba(255, 0, 0, 0.75),
                0.025em 0.025em 0 rgba(0, 255, 0, 0.75),
                -0.05em -0.05em 0 rgba(0, 0, 255, 0.75);
  }
  49% {
    text-shadow: -0.05em -0.025em 0 rgba(255, 0, 0, 0.75),
                0.025em 0.025em 0 rgba(0, 255, 0, 0.75),
                -0.05em -0.05em 0 rgba(0, 0, 255, 0.75);
  }
  50% {
    text-shadow: 0.025em 0.05em 0 rgba(255, 0, 0, 0.75),
                0.05em 0 0 rgba(0, 255, 0, 0.75),
                0 -0.05em 0 rgba(0, 0, 255, 0.75);
  }
  99% {
    text-shadow: 0.025em 0.05em 0 rgba(255, 0, 0, 0.75),
                0.05em 0 0 rgba(0, 255, 0, 0.75),
                0 -0.05em 0 rgba(0, 0, 255, 0.75);
  }
  100% {
    text-shadow: -0.025em 0 0 rgba(255, 0, 0, 0.75),
                -0.025em -0.025em 0 rgba(0, 255, 0, 0.75),
                -0.025em -0.05em 0 rgba(0, 0, 255, 0.75);
  }
`;

const StyledGlitchText = styled.div<{ isAnimating: boolean }>`
  font-size: 3rem;
  font-weight: bold;
  text-transform: uppercase;
  position: relative;
  ${props => props.isAnimating && css`
    animation: ${glitchAnimation} 0.2s infinite;
  `}
  
  &::before,
  &::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  
  &::before {
    animation: ${props => props.isAnimating ? css`glitch-1 0.3s infinite` : 'none'};
    color: #ff0080;
    z-index: -1;
  }
  
  &::after {
    animation: ${props => props.isAnimating ? css`glitch-2 0.3s infinite` : 'none'};
    color: #00ff88;
    z-index: -2;
  }
  
  @keyframes glitch-1 {
    0% {
      clip: rect(132px, auto, 101px, 0);
    }
    20% {
      clip: rect(20px, auto, 66px, 0);
    }
    40% {
      clip: rect(87px, auto, 24px, 0);
    }
    60% {
      clip: rect(9px, auto, 95px, 0);
    }
    80% {
      clip: rect(45px, auto, 13px, 0);
    }
    100% {
      clip: rect(76px, auto, 48px, 0);
    }
  }
  
  @keyframes glitch-2 {
    0% {
      clip: rect(29px, auto, 84px, 0);
    }
    20% {
      clip: rect(65px, auto, 2px, 0);
    }
    40% {
      clip: rect(98px, auto, 43px, 0);
    }
    60% {
      clip: rect(17px, auto, 77px, 0);
    }
    80% {
      clip: rect(51px, auto, 35px, 0);
    }
    100% {
      clip: rect(88px, auto, 19px, 0);
    }
  }
`;

const TypewriterCursor = styled.span`
  display: inline-block;
  width: 3px;
  height: 1.2em;
  background: linear-gradient(180deg, #00ff88 0%, #0088ff 100%);
  margin-left: 2px;
  animation: blink 1s infinite;
  
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
`;

const Rotate3DContainer = styled.div`
  perspective: 1000px;
  font-size: 3rem;
  font-weight: bold;
`;

const StyledBinaryText = styled.span`
  font-family: 'Courier New', monospace;
  color: #00ff00;
  font-size: 0.8em;
  opacity: 0.7;
`;

const NeuralContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const NeuralConnection = styled.div<{ x1: number; y1: number; x2: number; y2: number }>`
  position: absolute;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00ff88, transparent);
  transform-origin: left center;
  ${props => {
    const dx = props.x2 - props.x1;
    const dy = props.y2 - props.y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    return css`
      left: ${props.x1}px;
      top: ${props.y1}px;
      width: ${length}px;
      transform: rotate(${angle}deg);
    `;
  }}
`;

const ParticleContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const Particle = styled.div<{ x: number; y: number; delay: number }>`
  position: absolute;
  width: 4px;
  height: 4px;
  background: #00ff88;
  border-radius: 50%;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  animation: dissolve 2s ${props => props.delay}s ease-out forwards;
  
  @keyframes dissolve {
    0% {
      opacity: 1;
      transform: translate(0, 0) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate(${() => (Math.random() - 0.5) * 200}px, ${() => (Math.random() - 0.5) * 200}px) scale(0);
    }
  }
`;

export const AITextEffects: React.FC<AITextEffectsProps> = ({
  language = 'en',
  effect = 'typewriter',
  text,
  duration = 3000,
  className
}) => {
  const [displayText, setDisplayText] = useState('');
  const [morphIndex, setMorphIndex] = useState(0);
  const [particles, setParticles] = useState<Array<{x: number; y: number; delay: number}>>([]);
  const [binaryString, setBinaryString] = useState('');
  const [connections, setConnections] = useState<Array<{x1: number; y1: number; x2: number; y2: number}>>([]);
  const textRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  const defaultText: TextContent = {
    nl: 'Kunstmatige Intelligentie',
    en: 'Artificial Intelligence'
  };

  const currentText = text?.[language] || defaultText[language];

  // Typewriter Effect
  useEffect(() => {
    if (effect === 'typewriter') {
      let index = 0;
      const interval = setInterval(() => {
        if (index <= currentText.length) {
          setDisplayText(currentText.slice(0, index));
          index++;
        } else {
          clearInterval(interval);
        }
      }, duration / currentText.length);
      return () => clearInterval(interval);
    }
  }, [effect, currentText, duration]);

  // Morphing Effect
  useEffect(() => {
    if (effect === 'morph') {
      const interval = setInterval(() => {
        setMorphIndex((prev) => (prev + 1) % aiTerms.length);
      }, duration);
      return () => clearInterval(interval);
    }
  }, [effect, duration]);

  // Binary Effect
  useEffect(() => {
    if (effect === 'binary') {
      const generateBinary = () => {
        return Array.from({ length: currentText.length * 8 }, () => 
          Math.random() > 0.5 ? '1' : '0'
        ).join('');
      };
      
      setBinaryString(generateBinary());
      const interval = setInterval(() => {
        setBinaryString(generateBinary());
      }, 100);
      
      setTimeout(() => {
        clearInterval(interval);
      }, duration / 2);
      
      return () => clearInterval(interval);
    }
  }, [effect, currentText, duration]);

  // Particle Effect
  useEffect(() => {
    if (effect === 'particles' && textRef.current) {
      const rect = textRef.current.getBoundingClientRect();
      const newParticles = [];
      
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          delay: Math.random() * 0.5
        });
      }
      
      setParticles(newParticles);
    }
  }, [effect]);

  // Neural Network Effect
  useEffect(() => {
    if (effect === 'neural' && textRef.current) {
      const generateConnections = () => {
        const rect = textRef.current!.getBoundingClientRect();
        const newConnections = [];
        
        for (let i = 0; i < 10; i++) {
          newConnections.push({
            x1: Math.random() * rect.width,
            y1: Math.random() * rect.height,
            x2: Math.random() * rect.width,
            y2: Math.random() * rect.height
          });
        }
        
        setConnections(newConnections);
      };
      
      generateConnections();
      const interval = setInterval(generateConnections, 1000);
      
      return () => clearInterval(interval);
    }
  }, [effect]);

  const renderEffect = () => {
    switch (effect) {
      case 'typewriter':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={className}
          >
            <span style={{ fontSize: '3rem', fontWeight: 'bold' }}>
              {displayText}
              <TypewriterCursor />
            </span>
          </motion.div>
        );

      case 'glitch':
        return (
          <StyledGlitchText
            data-text={currentText}
            isAnimating={true}
            className={className}
          >
            {currentText}
          </StyledGlitchText>
        );

      case 'morph':
        return (
          <AnimatePresence mode="wait">
            <motion.div
              key={morphIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              style={{ fontSize: '3rem', fontWeight: 'bold' }}
              className={className}
            >
              {aiTerms[morphIndex][language]}
            </motion.div>
          </AnimatePresence>
        );

      case 'rotate3d':
        return (
          <Rotate3DContainer className={className}>
            <motion.div
              animate={{
                rotateY: [0, 360],
                rotateX: [0, 360]
              }}
              transition={{
                duration: duration / 1000,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                transformStyle: 'preserve-3d',
                display: 'inline-block'
              }}
            >
              {currentText}
            </motion.div>
          </Rotate3DContainer>
        );

      case 'particles':
        return (
          <ParticleContainer className={className}>
            <motion.div
              ref={textRef}
              initial={{ opacity: 1 }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, delay: 0.5 }}
              style={{ fontSize: '3rem', fontWeight: 'bold' }}
            >
              {currentText}
            </motion.div>
            {particles.map((particle, index) => (
              <Particle
                key={index}
                x={particle.x}
                y={particle.y}
                delay={particle.delay}
              />
            ))}
          </ParticleContainer>
        );

      case 'binary':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={className}
          >
            <motion.div
              animate={{ opacity: [1, 0] }}
              transition={{ duration: duration / 2000, delay: duration / 2000 }}
            >
              <StyledBinaryText>{binaryString}</StyledBinaryText>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: duration / 2000 }}
              style={{ fontSize: '3rem', fontWeight: 'bold', marginTop: '-2rem' }}
            >
              {currentText}
            </motion.div>
          </motion.div>
        );

      case 'neural':
        return (
          <NeuralContainer className={className}>
            <div ref={textRef} style={{ fontSize: '3rem', fontWeight: 'bold', position: 'relative', zIndex: 10 }}>
              {currentText}
            </div>
            {connections.map((conn, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: index * 0.1 }}
              >
                <NeuralConnection {...conn} />
              </motion.div>
            ))}
          </NeuralContainer>
        );

      default:
        return <div>{currentText}</div>;
    }
  };

  return renderEffect();
};

// Export individual effect components for convenience
export const TypewriterText: React.FC<Omit<AITextEffectsProps, 'effect'>> = (props) => (
  <AITextEffects {...props} effect="typewriter" />
);

export const GlitchText: React.FC<Omit<AITextEffectsProps, 'effect'>> = (props) => (
  <AITextEffects {...props} effect="glitch" />
);

export const MorphingText: React.FC<Omit<AITextEffectsProps, 'effect'>> = (props) => (
  <AITextEffects {...props} effect="morph" />
);

export const Rotate3DText: React.FC<Omit<AITextEffectsProps, 'effect'>> = (props) => (
  <AITextEffects {...props} effect="rotate3d" />
);

export const ParticleText: React.FC<Omit<AITextEffectsProps, 'effect'>> = (props) => (
  <AITextEffects {...props} effect="particles" />
);

export const BinaryText: React.FC<Omit<AITextEffectsProps, 'effect'>> = (props) => (
  <AITextEffects {...props} effect="binary" />
);

export const NeuralText: React.FC<Omit<AITextEffectsProps, 'effect'>> = (props) => (
  <AITextEffects {...props} effect="neural" />
);