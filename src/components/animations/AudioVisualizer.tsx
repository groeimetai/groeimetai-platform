import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface AudioVisualizerProps {
  width?: number;
  height?: number;
  audioUrl?: string;
  enableMicrophone?: boolean;
  simulateData?: boolean;
}

interface AudioData {
  frequencyData: Uint8Array;
  waveformData: Uint8Array;
  beatDetected: boolean;
  dominantFrequency: number;
}

const AI_SOUND_EFFECTS = [
  '/sounds/ai-boot.mp3',
  '/sounds/data-process.mp3',
  '/sounds/neural-pulse.mp3',
  '/sounds/quantum-compute.mp3',
];

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  width = 800,
  height = 600,
  audioUrl,
  enableMicrophone = false,
  simulateData = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const controlsRef = useRef<OrbitControls>();
  const audioContextRef = useRef<AudioContext>();
  const analyserRef = useRef<AnalyserNode>();
  const sourceRef = useRef<AudioBufferSourceNode | MediaStreamAudioSourceNode>();
  const animationIdRef = useRef<number>();
  
  // 3D objects
  const barsRef = useRef<THREE.Mesh[]>([]);
  const particlesRef = useRef<THREE.Points>();
  const waveformRef = useRef<THREE.Line>();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMicrophoneActive, setIsMicrophoneActive] = useState(false);
  const [selectedSound, setSelectedSound] = useState(0);
  const [audioData, setAudioData] = useState<AudioData>({
    frequencyData: new Uint8Array(128),
    waveformData: new Uint8Array(512),
    beatDetected: false,
    dominantFrequency: 0,
  });

  // Initialize Three.js scene
  const initializeScene = useCallback(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 50, 200);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    );
    camera.position.set(0, 20, 60);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 150;
    controls.minDistance = 20;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);

    // Create frequency bars
    createFrequencyBars(scene);

    // Create particle system
    createParticleSystem(scene);

    // Create waveform
    createWaveform(scene);

    // Add grid
    const gridHelper = new THREE.GridHelper(100, 20, 0x444444, 0x222222);
    scene.add(gridHelper);
  }, [width, height]);

  // Create 3D frequency bars
  const createFrequencyBars = (scene: THREE.Scene) => {
    const barCount = 64;
    const barWidth = 1.2;
    const barDepth = 1.2;
    const spacing = 1.5;

    barsRef.current = [];

    for (let i = 0; i < barCount; i++) {
      const geometry = new THREE.BoxGeometry(barWidth, 1, barDepth);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(i / barCount, 0.7, 0.5),
        emissive: new THREE.Color().setHSL(i / barCount, 0.7, 0.3),
        emissiveIntensity: 0.5,
      });

      const bar = new THREE.Mesh(geometry, material);
      bar.position.x = (i - barCount / 2) * spacing;
      bar.position.y = 0.5;
      bar.castShadow = true;
      bar.receiveShadow = true;

      scene.add(bar);
      barsRef.current.push(bar);
    }
  };

  // Create particle system
  const createParticleSystem = (scene: THREE.Scene) => {
    const particleCount = 5000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 100;
      positions[i3 + 1] = Math.random() * 50;
      positions[i3 + 2] = (Math.random() - 0.5) * 100;

      colors[i3] = Math.random();
      colors[i3 + 1] = Math.random();
      colors[i3 + 2] = Math.random();

      sizes[i] = Math.random() * 2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geometry, material);
    particlesRef.current = particles;
    scene.add(particles);
  };

  // Create waveform visualization
  const createWaveform = (scene: THREE.Scene) => {
    const points = [];
    const segments = 256;
    
    for (let i = 0; i < segments; i++) {
      const x = (i / segments - 0.5) * 80;
      points.push(new THREE.Vector3(x, 0, -20));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0x00ff88,
      linewidth: 2,
      transparent: true,
      opacity: 0.8,
    });

    const line = new THREE.Line(geometry, material);
    waveformRef.current = line;
    scene.add(line);
  };

  // Initialize Web Audio API
  const initializeAudio = useCallback(async () => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }, []);

  // Load and play audio file
  const loadAudioFile = useCallback(async (url: string) => {
    if (!audioContextRef.current || !analyserRef.current) return;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      
      source.start();
      sourceRef.current = source;
      setIsPlaying(true);

      source.onended = () => {
        setIsPlaying(false);
      };
    } catch (error) {
      console.error('Failed to load audio file:', error);
    }
  }, []);

  // Enable microphone input
  const enableMicrophoneInput = useCallback(async () => {
    if (!audioContextRef.current || !analyserRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      sourceRef.current = source;
      setIsMicrophoneActive(true);
    } catch (error) {
      console.error('Failed to access microphone:', error);
    }
  }, []);

  // Simulate audio data when no audio source
  const simulateAudioData = useCallback(() => {
    const time = Date.now() * 0.001;
    const frequencyData = new Uint8Array(128);
    const waveformData = new Uint8Array(512);

    // Simulate frequency data
    for (let i = 0; i < frequencyData.length; i++) {
      frequencyData[i] = Math.sin(time * (i + 1) * 0.1) * 127 + 128;
    }

    // Simulate waveform data
    for (let i = 0; i < waveformData.length; i++) {
      waveformData[i] = Math.sin(time * 5 + i * 0.05) * 64 + 128;
    }

    // Simulate beat detection
    const beatDetected = Math.sin(time * 2) > 0.8;
    
    // Simulate dominant frequency
    const dominantFrequency = (Math.sin(time * 0.5) + 1) * 1000;

    return {
      frequencyData,
      waveformData,
      beatDetected,
      dominantFrequency,
    };
  }, []);

  // Get audio data from analyser
  const getAudioData = useCallback((): AudioData => {
    if (!analyserRef.current || simulateData) {
      return simulateAudioData();
    }

    const frequencyData = new Uint8Array(analyserRef.current.frequencyBinCount);
    const waveformData = new Uint8Array(analyserRef.current.fftSize);
    
    analyserRef.current.getByteFrequencyData(frequencyData);
    analyserRef.current.getByteTimeDomainData(waveformData);

    // Simple beat detection
    const average = frequencyData.reduce((a, b) => a + b) / frequencyData.length;
    const beatDetected = average > 100;

    // Find dominant frequency
    let maxValue = 0;
    let maxIndex = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      if (frequencyData[i] > maxValue) {
        maxValue = frequencyData[i];
        maxIndex = i;
      }
    }
    const dominantFrequency = (maxIndex / frequencyData.length) * 20000;

    return {
      frequencyData,
      waveformData,
      beatDetected,
      dominantFrequency,
    };
  }, [simulateData, simulateAudioData]);

  // Animation loop
  const animate = useCallback(() => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current) return;

    animationIdRef.current = requestAnimationFrame(animate);

    // Get audio data
    const data = getAudioData();
    setAudioData(data);

    // Update frequency bars
    if (barsRef.current.length > 0) {
      const barCount = Math.min(barsRef.current.length, data.frequencyData.length / 2);
      
      for (let i = 0; i < barCount; i++) {
        const bar = barsRef.current[i];
        const value = data.frequencyData[i * 2] / 255;
        
        // Animate bar height
        bar.scale.y = 1 + value * 30;
        bar.position.y = bar.scale.y / 2;

        // Update bar color based on frequency
        const hue = (i / barCount + value * 0.2) % 1;
        (bar.material as THREE.MeshPhongMaterial).color.setHSL(hue, 0.8, 0.5 + value * 0.3);
        (bar.material as THREE.MeshPhongMaterial).emissiveIntensity = value;
      }
    }

    // Update particles on beat
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const colors = particlesRef.current.geometry.attributes.color.array as Float32Array;
      
      if (data.beatDetected) {
        // Explode particles on beat
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += (Math.random() - 0.5) * 2;
          positions[i + 1] += Math.random() * 2;
          positions[i + 2] += (Math.random() - 0.5) * 2;
        }
      } else {
        // Slowly drift particles back
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] *= 0.98;
          positions[i + 1] *= 0.98;
          positions[i + 2] *= 0.98;
          
          // Reset if too close to origin
          if (Math.abs(positions[i]) < 1) {
            positions[i] = (Math.random() - 0.5) * 100;
            positions[i + 1] = Math.random() * 50;
            positions[i + 2] = (Math.random() - 0.5) * 100;
          }
        }
      }

      // Update particle colors based on dominant frequency
      const hue = (data.dominantFrequency / 20000) % 1;
      for (let i = 0; i < colors.length; i += 3) {
        colors[i] = hue;
        colors[i + 1] = 0.8;
        colors[i + 2] = 0.5 + Math.random() * 0.5;
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      particlesRef.current.geometry.attributes.color.needsUpdate = true;
      particlesRef.current.rotation.y += 0.001;
    }

    // Update waveform
    if (waveformRef.current) {
      const positions = waveformRef.current.geometry.attributes.position.array as Float32Array;
      const waveformSegments = Math.min(256, data.waveformData.length);
      
      for (let i = 0; i < waveformSegments; i++) {
        const value = (data.waveformData[i] - 128) / 128;
        positions[i * 3 + 1] = value * 15;
      }
      
      waveformRef.current.geometry.attributes.position.needsUpdate = true;
      
      // Color based on frequency
      const material = waveformRef.current.material as THREE.LineBasicMaterial;
      material.color.setHSL((data.dominantFrequency / 20000) % 1, 1, 0.5);
    }

    // Update controls
    if (controlsRef.current) {
      controlsRef.current.update();
    }

    // Render
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, [getAudioData]);

  // Initialize everything
  useEffect(() => {
    initializeScene();
    initializeAudio();
    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [initializeScene, initializeAudio, animate]);

  // Handle audio URL changes
  useEffect(() => {
    if (audioUrl && audioContextRef.current) {
      loadAudioFile(audioUrl);
    }
  }, [audioUrl, loadAudioFile]);

  // Handle microphone toggle
  useEffect(() => {
    if (enableMicrophone && !isMicrophoneActive) {
      enableMicrophoneInput();
    }
  }, [enableMicrophone, isMicrophoneActive, enableMicrophoneInput]);

  // UI Controls
  const handleSoundSelect = (index: number) => {
    setSelectedSound(index);
    if (audioContextRef.current) {
      loadAudioFile(AI_SOUND_EFFECTS[index]);
    }
  };

  const toggleMicrophone = () => {
    if (!isMicrophoneActive) {
      enableMicrophoneInput();
    } else {
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      setIsMicrophoneActive(false);
    }
  };

  return (
    <div className="relative">
      <div ref={mountRef} className="rounded-lg overflow-hidden shadow-2xl" />
      
      {/* Controls */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 space-y-3">
        <h3 className="text-white font-semibold mb-2">Audio Controls</h3>
        
        {/* Sound Effects */}
        <div className="space-y-2">
          <p className="text-gray-300 text-sm">AI Sound Effects:</p>
          <div className="grid grid-cols-2 gap-2">
            {AI_SOUND_EFFECTS.map((sound, index) => (
              <button
                key={index}
                onClick={() => handleSoundSelect(index)}
                className={`px-3 py-1 rounded text-sm transition-all ${
                  selectedSound === index
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Effect {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Microphone Toggle */}
        <button
          onClick={toggleMicrophone}
          className={`w-full px-4 py-2 rounded transition-all ${
            isMicrophoneActive
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
        >
          {isMicrophoneActive ? 'Stop Microphone' : 'Use Microphone'}
        </button>

        {/* Status */}
        <div className="text-xs text-gray-400 space-y-1">
          <p>Status: {isPlaying ? 'Playing' : isMicrophoneActive ? 'Microphone Active' : simulateData ? 'Simulating' : 'Idle'}</p>
          <p>Beat: {audioData.beatDetected ? '🔴' : '⚪'}</p>
          <p>Frequency: {Math.round(audioData.dominantFrequency)}Hz</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-xs text-gray-300 max-w-xs">
        <p>• Drag to rotate view</p>
        <p>• Scroll to zoom</p>
        <p>• Bars show frequency spectrum</p>
        <p>• Particles react to beats</p>
        <p>• Colors change with dominant frequency</p>
      </div>
    </div>
  );
};