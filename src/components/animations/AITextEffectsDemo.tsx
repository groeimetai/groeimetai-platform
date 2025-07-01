import React, { useState } from 'react';
import styled from 'styled-components';
import {
  TypewriterText,
  GlitchText,
  MorphingText,
  Rotate3DText,
  ParticleText,
  BinaryText,
  NeuralText,
  AITextEffects
} from './AITextEffects';

const DemoContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
  color: white;
  padding: 2rem;
  overflow-x: hidden;
`;

const Header = styled.h1`
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  background: linear-gradient(45deg, #00ff88, #0088ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const EffectSection = styled.section`
  margin: 4rem 0;
  padding: 2rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const EffectTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #00ff88;
`;

const EffectDemo = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 150px;
  position: relative;
`;

const Controls = styled.div`
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: rgba(0, 0, 0, 0.8);
  padding: 1.5rem;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 100;
`;

const LanguageToggle = styled.button`
  background: linear-gradient(45deg, #00ff88, #0088ff);
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const EffectButton = styled.button<{ active: boolean }>`
  display: block;
  width: 100%;
  background: ${props => props.active ? 'linear-gradient(45deg, #00ff88, #0088ff)' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${props => props.active ? 'transparent' : 'rgba(255, 255, 255, 0.2)'};
  padding: 0.6rem 1rem;
  margin: 0.5rem 0;
  border-radius: 10px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: ${props => props.active ? 'linear-gradient(45deg, #00ff88, #0088ff)' : 'rgba(255, 255, 255, 0.2)'};
  }
`;

export const AITextEffectsDemo: React.FC = () => {
  const [language, setLanguage] = useState<'nl' | 'en'>('en');
  const [selectedEffect, setSelectedEffect] = useState<string>('all');

  const effects = [
    { id: 'typewriter', name: 'Typewriter Effect', component: TypewriterText },
    { id: 'glitch', name: 'Glitch Effect', component: GlitchText },
    { id: 'morph', name: 'Morphing Text', component: MorphingText },
    { id: 'rotate3d', name: '3D Rotation', component: Rotate3DText },
    { id: 'particles', name: 'Particle Dissolution', component: ParticleText },
    { id: 'binary', name: 'Binary Transform', component: BinaryText },
    { id: 'neural', name: 'Neural Network', component: NeuralText }
  ];

  const customTexts = {
    typewriter: { nl: 'Welkom bij AI Teksteffecten', en: 'Welcome to AI Text Effects' },
    glitch: { nl: 'SYSTEEM STORING', en: 'SYSTEM ERROR' },
    morph: { nl: 'Transformerende Tekst', en: 'Transforming Text' },
    rotate3d: { nl: '3D Rotatie', en: '3D Rotation' },
    particles: { nl: 'Deeltjes Effecten', en: 'Particle Effects' },
    binary: { nl: 'Binaire Transformatie', en: 'Binary Transform' },
    neural: { nl: 'Neuraal Netwerk', en: 'Neural Network' }
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'nl' : 'en');
  };

  const renderEffect = (effect: typeof effects[0]) => {
    const EffectComponent = effect.component;
    return (
      <EffectSection key={effect.id}>
        <EffectTitle>{effect.name}</EffectTitle>
        <EffectDemo>
          <EffectComponent
            language={language}
            text={customTexts[effect.id as keyof typeof customTexts]}
            duration={3000}
          />
        </EffectDemo>
      </EffectSection>
    );
  };

  return (
    <DemoContainer>
      <Header>AI Text Effects Showcase</Header>
      
      <Controls>
        <LanguageToggle onClick={toggleLanguage}>
          {language === 'en' ? 'Switch to Dutch' : 'Wissel naar Engels'}
        </LanguageToggle>
        
        <div style={{ marginTop: '1rem' }}>
          <EffectButton
            active={selectedEffect === 'all'}
            onClick={() => setSelectedEffect('all')}
          >
            Show All Effects
          </EffectButton>
          {effects.map(effect => (
            <EffectButton
              key={effect.id}
              active={selectedEffect === effect.id}
              onClick={() => setSelectedEffect(effect.id)}
            >
              {effect.name}
            </EffectButton>
          ))}
        </div>
      </Controls>

      {selectedEffect === 'all' 
        ? effects.map(renderEffect)
        : effects.filter(e => e.id === selectedEffect).map(renderEffect)
      }
    </DemoContainer>
  );
};

export default AITextEffectsDemo;