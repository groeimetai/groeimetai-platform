import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

interface ExplosionParticle {
  id: number;
  x: number;
  y: number;
  angle: number;
  velocity: number;
  size: number;
  color: string;
}

export const InteractiveEffects: React.FC = () => {
  // Mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  // Scroll tracking
  const scrollY = useMotionValue(0);
  const scrollProgress = useTransform(scrollY, [0, 1000], [0, 1]);
  
  // Transform values for animations
  const rotateZ = useTransform(scrollProgress, [0, 1], [0, 360]);
  const scale = useTransform(scrollProgress, [0, 0.5, 1], [1, 1.5, 0.8]);
  const opacity = useTransform(scrollProgress, [0, 0.5, 1], [1, 0.5, 1]);

  // State
  const [particles, setParticles] = useState<Particle[]>([]);
  const [explosions, setExplosions] = useState<ExplosionParticle[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  // Initialize particles
  useEffect(() => {
    const initialParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 4 + 2,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    }));
    setParticles(initialParticles);
  }, []);

  // Mouse movement handler
  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  }, [mouseX, mouseY]);

  // Scroll handler
  const handleScroll = useCallback(() => {
    scrollY.set(window.scrollY);
  }, [scrollY]);

  // Touch handlers
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStart) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    
    // Update mouse position for particle effects
    mouseX.set(touch.clientX);
    mouseY.set(touch.clientY);
    
    // Trigger effects based on swipe distance
    if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
      createExplosion(touch.clientX, touch.clientY);
      setTouchStart({ x: touch.clientX, y: touch.clientY });
    }
  }, [touchStart, mouseX, mouseY]);

  const handleTouchEnd = useCallback(() => {
    setTouchStart(null);
  }, []);

  // Click explosion effect
  const createExplosion = useCallback((x: number, y: number) => {
    const newExplosions: ExplosionParticle[] = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      angle: (i * 360) / 20,
      velocity: Math.random() * 5 + 5,
      size: Math.random() * 6 + 4,
      color: `hsl(${Math.random() * 60 + 20}, 100%, 50%)`,
    }));
    
    setExplosions(prev => [...prev, ...newExplosions]);
    
    // Remove explosion particles after animation
    setTimeout(() => {
      setExplosions(prev => prev.filter(p => !newExplosions.includes(p)));
    }, 1000);
  }, []);

  // Update particles based on mouse position
  const updateParticles = useCallback(() => {
    const currentMouseX = smoothMouseX.get();
    const currentMouseY = smoothMouseY.get();
    
    setParticles(prevParticles => 
      prevParticles.map(particle => {
        const dx = currentMouseX - particle.x;
        const dy = currentMouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 200;
        
        if (distance < maxDistance) {
          const force = (1 - distance / maxDistance) * 0.5;
          const angle = Math.atan2(dy, dx);
          
          return {
            ...particle,
            vx: particle.vx - Math.cos(angle) * force,
            vy: particle.vy - Math.sin(angle) * force,
          };
        }
        
        // Update position
        let newX = particle.x + particle.vx;
        let newY = particle.y + particle.vy;
        
        // Bounce off walls
        if (newX < 0 || newX > window.innerWidth) {
          particle.vx *= -0.9;
          newX = Math.max(0, Math.min(window.innerWidth, newX));
        }
        if (newY < 0 || newY > window.innerHeight) {
          particle.vy *= -0.9;
          newY = Math.max(0, Math.min(window.innerHeight, newY));
        }
        
        // Apply friction
        particle.vx *= 0.99;
        particle.vy *= 0.99;
        
        return {
          ...particle,
          x: newX,
          y: newY,
          vx: particle.vx,
          vy: particle.vy,
        };
      })
    );
    
    animationFrameRef.current = requestAnimationFrame(updateParticles);
  }, [smoothMouseX, smoothMouseY]);

  // Setup event listeners
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    
    // Start particle animation
    animationFrameRef.current = requestAnimationFrame(updateParticles);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [handleMouseMove, handleScroll, handleTouchStart, handleTouchMove, handleTouchEnd, updateParticles]);

  // Parallax layers
  const parallaxY1 = useTransform(scrollY, [0, 1000], [0, -200]);
  const parallaxY2 = useTransform(scrollY, [0, 1000], [0, -400]);
  const parallaxY3 = useTransform(scrollY, [0, 1000], [0, -600]);

  return (
    <div ref={containerRef} className="relative w-full min-h-screen overflow-hidden">
      {/* Background particles */}
      <div className="fixed inset-0 pointer-events-none">
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              x: particle.x,
              y: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
            }}
            animate={{
              x: particle.x,
              y: particle.y,
            }}
            transition={{
              type: "spring",
              stiffness: 50,
              damping: 10,
            }}
          />
        ))}
      </div>

      {/* Explosion particles */}
      <AnimatePresence>
        {explosions.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              x: particle.x,
              y: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{
              x: particle.x + Math.cos(particle.angle * Math.PI / 180) * particle.velocity * 50,
              y: particle.y + Math.sin(particle.angle * Math.PI / 180) * particle.velocity * 50,
              scale: [0, 1.5, 0],
              opacity: [1, 0.8, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      {/* Parallax layers */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-purple-900/20"
        style={{ y: parallaxY1 }}
      />
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-green-900/10 to-yellow-900/10"
        style={{ y: parallaxY2 }}
      />
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-red-900/5 to-pink-900/5"
        style={{ y: parallaxY3 }}
      />

      {/* Interactive content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Scroll-based rotating element */}
        <motion.div
          className="relative mb-16"
          style={{
            rotateZ,
            scale,
            opacity,
          }}
        >
          <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-2xl" />
        </motion.div>

        {/* Hover reveal effect */}
        <motion.div
          className="relative p-8 cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={(e) => createExplosion(e.clientX, e.clientY)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-20"
            animate={{
              opacity: isHovered ? 0.4 : 0.2,
              scale: isHovered ? 1.1 : 1,
            }}
            transition={{ duration: 0.3 }}
          />
          
          <h2 className="relative text-3xl md:text-4xl font-bold text-white mb-4">
            Interactive Zone
          </h2>
          
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="relative space-y-2"
              >
                <p className="text-white/80">Click to trigger explosion</p>
                <p className="text-white/60 text-sm">Move your mouse to affect particles</p>
                <p className="text-white/60 text-sm">Scroll to see transformations</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Mouse follower */}
        <motion.div
          className="fixed w-8 h-8 bg-white/20 rounded-full pointer-events-none mix-blend-screen"
          style={{
            x: smoothMouseX,
            y: smoothMouseY,
            translateX: "-50%",
            translateY: "-50%",
          }}
        />

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-1">
            <motion.div
              className="w-1 h-3 bg-white/50 rounded-full"
              animate={{
                y: [0, 20, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Additional content for scrolling */}
      <div className="relative z-10 py-32 px-4 bg-black/20">
        <motion.div
          className="max-w-4xl mx-auto text-white"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4">Scroll to Experience</h3>
          <p className="text-white/70 mb-8">
            Watch as elements transform, rotate, and scale based on your scroll position.
            The parallax layers create depth while particles respond to your mouse movement.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-6"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
              >
                <h4 className="text-xl font-semibold mb-2">Feature {i}</h4>
                <p className="text-white/60">
                  Interactive elements that respond to your actions and create engaging experiences.
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};