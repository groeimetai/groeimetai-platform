import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  TypewriterText, 
  GlitchText, 
  MorphingText,
  Rotate3DText,
  ParticleText,
  BinaryText,
  NeuralText
} from './AITextEffects';

const ExampleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #0a0a0a;
  color: white;
  gap: 3rem;
  padding: 2rem;
`;

const Section = styled.div`
  text-align: center;
  width: 100%;
  max-width: 800px;
`;

const Title = styled.h2`
  font-size: 1.2rem;
  color: #00ff88;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

// Simple example for hero sections
export const HeroExample = () => {
  return (
    <ExampleContainer>
      <TypewriterText 
        language="en"
        text={{ 
          nl: "De Toekomst van Kunstmatige Intelligentie", 
          en: "The Future of Artificial Intelligence" 
        }}
        duration={4000}
      />
    </ExampleContainer>
  );
};

// Error/Warning example
export const ErrorExample = () => {
  return (
    <ExampleContainer>
      <GlitchText 
        language="en"
        text={{ 
          nl: "WAARSCHUWING: SYSTEEM OVERBELAST", 
          en: "WARNING: SYSTEM OVERLOAD" 
        }}
      />
    </ExampleContainer>
  );
};

// Loading screen example
export const LoadingExample = () => {
  return (
    <ExampleContainer>
      <Section>
        <Title>AI Models Loading...</Title>
        <MorphingText language="en" duration={1500} />
      </Section>
    </ExampleContainer>
  );
};

// Interactive showcase
export const InteractiveExample = () => {
  const [effect, setEffect] = useState<'binary' | 'neural' | 'particles'>('binary');
  
  const effects = {
    binary: BinaryText,
    neural: NeuralText,
    particles: ParticleText
  };
  
  const EffectComponent = effects[effect];
  
  return (
    <ExampleContainer>
      <Section>
        <Title>Interactive AI Effects</Title>
        <div style={{ marginBottom: '2rem' }}>
          <button onClick={() => setEffect('binary')}>Binary</button>
          <button onClick={() => setEffect('neural')}>Neural</button>
          <button onClick={() => setEffect('particles')}>Particles</button>
        </div>
        <EffectComponent 
          language="en"
          text={{ 
            nl: "Interactieve AI Demo", 
            en: "Interactive AI Demo" 
          }}
        />
      </Section>
    </ExampleContainer>
  );
};

// Complete landing page example
export const LandingPageExample = () => {
  const [language, setLanguage] = useState<'nl' | 'en'>('en');
  
  return (
    <ExampleContainer>
      <button 
        onClick={() => setLanguage(lang => lang === 'en' ? 'nl' : 'en')}
        style={{ position: 'absolute', top: '1rem', right: '1rem' }}
      >
        {language === 'en' ? 'NL' : 'EN'}
      </button>
      
      <Section>
        <TypewriterText 
          language={language}
          text={{ 
            nl: "Welkom bij GroeiMetAI", 
            en: "Welcome to GroeiMetAI" 
          }}
          duration={3000}
        />
      </Section>
      
      <Section>
        <Title>{language === 'en' ? 'Our Technology' : 'Onze Technologie'}</Title>
        <MorphingText language={language} />
      </Section>
      
      <Section>
        <Title>{language === 'en' ? 'Powered by' : 'Aangedreven door'}</Title>
        <NeuralText 
          language={language}
          text={{ 
            nl: "Geavanceerde AI", 
            en: "Advanced AI" 
          }}
        />
      </Section>
    </ExampleContainer>
  );
};