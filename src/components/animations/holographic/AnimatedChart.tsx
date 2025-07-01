'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export function AnimatedChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 300;
    canvas.height = 150;

    let animationId: number;
    let offset = 0;

    // Generate data points
    const generateData = (offset: number) => {
      const points = [];
      for (let i = 0; i < 50; i++) {
        const x = (i / 49) * canvas.width;
        const y = 
          canvas.height / 2 + 
          Math.sin((i + offset) * 0.1) * 30 +
          Math.sin((i + offset) * 0.05) * 20;
        points.push({ x, y });
      }
      return points;
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      
      // Horizontal lines
      for (let i = 0; i <= 5; i++) {
        const y = (i / 5) * canvas.height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Vertical lines
      for (let i = 0; i <= 10; i++) {
        const x = (i / 10) * canvas.width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Draw main line
      const points = generateData(offset);
      
      // Gradient for the line
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#06B6D4');
      gradient.addColorStop(0.5, '#A855F7');
      gradient.addColorStop(1, '#EC4899');

      // Draw the line
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#06B6D4';
      
      ctx.beginPath();
      points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();

      // Draw area under the curve
      ctx.fillStyle = 'rgba(6, 182, 212, 0.1)';
      ctx.beginPath();
      ctx.moveTo(points[0].x, canvas.height);
      points.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.lineTo(points[points.length - 1].x, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Draw data points
      ctx.shadowBlur = 10;
      points.forEach((point, index) => {
        if (index % 5 === 0) {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      offset += 0.5;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <motion.div
      className="relative bg-black/40 backdrop-blur-xl border border-cyan-500/50 rounded-xl p-4 shadow-[0_0_30px_rgba(6,182,212,0.5)]"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Title */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-cyan-400 text-sm font-mono uppercase tracking-wider">
          Neural Activity
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400">LIVE</span>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ imageRendering: 'crisp-edges' }}
      />

      {/* Stats */}
      <div className="flex justify-between mt-2 text-xs">
        <div>
          <span className="text-gray-400">Peak: </span>
          <span className="text-cyan-300 font-mono">847.3</span>
        </div>
        <div>
          <span className="text-gray-400">Avg: </span>
          <span className="text-cyan-300 font-mono">523.1</span>
        </div>
        <div>
          <span className="text-gray-400">Min: </span>
          <span className="text-cyan-300 font-mono">201.7</span>
        </div>
      </div>
    </motion.div>
  );
}