import React from 'react';
import { AudioVisualizer } from './AudioVisualizer';

export const AudioVisualizerExample: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">
          AI Audio Visualizer
        </h1>
        <p className="text-gray-400 mb-8">
          Interactive 3D audio visualization with frequency analysis, beat detection, and particle effects
        </p>

        {/* Main Visualizer */}
        <div className="mb-8">
          <AudioVisualizer
            width={1200}
            height={700}
            simulateData={true}
            enableMicrophone={false}
          />
        </div>

        {/* Feature List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-white">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3 text-purple-400">
              3D Frequency Bars
            </h3>
            <p className="text-gray-300">
              Real-time frequency spectrum analysis displayed as animated 3D bars with dynamic colors
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3 text-green-400">
              Waveform Visualization
            </h3>
            <p className="text-gray-300">
              Live waveform display showing audio amplitude over time with color-coded frequency mapping
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3 text-blue-400">
              Beat-Reactive Particles
            </h3>
            <p className="text-gray-300">
              5000+ particles that explode and react to beat detection with dynamic color changes
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3 text-yellow-400">
              WebAudio Integration
            </h3>
            <p className="text-gray-300">
              Full WebAudio API integration with FFT analysis and real-time audio processing
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3 text-red-400">
              Microphone Input
            </h3>
            <p className="text-gray-300">
              Live microphone input support for real-time visualization of ambient sound
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3 text-indigo-400">
              AI Sound Effects
            </h3>
            <p className="text-gray-300">
              Pre-loaded AI-themed sound effects for demonstration and testing
            </p>
          </div>
        </div>

        {/* Usage Example */}
        <div className="mt-12 bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Usage Example</h2>
          <pre className="bg-gray-900 p-4 rounded overflow-x-auto">
            <code className="text-gray-300">{`import { AudioVisualizer } from './components/animations/AudioVisualizer';

function App() {
  return (
    <AudioVisualizer
      width={1200}
      height={700}
      audioUrl="/path/to/audio.mp3"  // Optional audio file
      enableMicrophone={true}         // Enable mic input
      simulateData={false}            // Use real audio data
    />
  );
}`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};