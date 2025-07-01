// Web Audio API type extensions for better TypeScript support

interface Window {
  AudioContext: typeof AudioContext;
  webkitAudioContext: typeof AudioContext;
}

// Extend MediaDevices for better getUserMedia support
interface MediaDevices {
  getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;
}

// Additional audio visualization types
export interface AudioVisualizationConfig {
  fftSize: number;
  smoothingTimeConstant: number;
  minDecibels: number;
  maxDecibels: number;
}

export interface BeatDetectionConfig {
  threshold: number;
  decay: number;
  minInterval: number;
}

export interface VisualizationTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  particleColor: string;
  barGradient: string[];
}