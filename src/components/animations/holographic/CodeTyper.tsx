'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const codeSnippets = [
  {
    language: 'python',
    code: `# AI Model Training
import tensorflow as tf
from transformers import GPT2Model

model = GPT2Model.from_pretrained('gpt2')
optimizer = tf.keras.optimizers.Adam(lr=0.001)

for epoch in range(epochs):
    loss = train_step(model, data)
    print(f"Epoch {epoch}: {loss:.4f}")`,
  },
  {
    language: 'javascript',
    code: `// Neural Network API
async function analyzeData(input) {
  const response = await fetch('/api/ai/analyze', {
    method: 'POST',
    body: JSON.stringify({ data: input }),
  });
  
  const result = await response.json();
  return result.predictions;
}`,
  },
  {
    language: 'typescript',
    code: `// Real-time Processing
interface AIResponse {
  confidence: number;
  predictions: Array<{
    label: string;
    probability: number;
  }>;
}

const processStream = async (
  data: DataStream
): Promise<AIResponse> => {
  return await model.predict(data);
}`,
  },
];

export function CodeTyper() {
  const [currentSnippet, setCurrentSnippet] = useState(0);
  const [displayedCode, setDisplayedCode] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const snippet = codeSnippets[currentSnippet];

  useEffect(() => {
    if (currentIndex < snippet.code.length) {
      const timeout = setTimeout(() => {
        setDisplayedCode(snippet.code.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 30);
      return () => clearTimeout(timeout);
    } else {
      // Wait before switching to next snippet
      const timeout = setTimeout(() => {
        setCurrentSnippet((prev) => (prev + 1) % codeSnippets.length);
        setDisplayedCode('');
        setCurrentIndex(0);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, snippet.code, currentSnippet]);

  return (
    <div className="relative bg-black/60 backdrop-blur-xl rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-gray-400 font-mono">{snippet.language}</span>
      </div>

      {/* Code content */}
      <div className="p-4 font-mono text-sm">
        <pre className="text-green-400 whitespace-pre-wrap">
          {displayedCode}
          <motion.span
            className="inline-block w-2 h-4 bg-green-400 ml-1"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        </pre>
      </div>

      {/* Scan line effect */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent"
        initial={{ top: 0 }}
        animate={{ top: '100%' }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Line numbers */}
      <div className="absolute left-0 top-0 h-full w-12 bg-black/20 border-r border-gray-700/30">
        <div className="pt-10 px-2 text-gray-500 text-xs">
          {displayedCode.split('\n').map((_, i) => (
            <div key={i} className="leading-5">{i + 1}</div>
          ))}
        </div>
      </div>
    </div>
  );
}