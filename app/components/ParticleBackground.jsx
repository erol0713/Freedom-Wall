'use client';

import { useEffect, useRef, useCallback } from 'react';

const PARTICLE_COUNT = 30;
const MESSAGING_COLORS = [
  'rgba(56, 189, 248, 0.4)',   // light blue
  'rgba(167, 139, 250, 0.4)',  // purple
  'rgba(244, 114, 182, 0.4)',  // pink
  'rgba(52, 211, 153, 0.4)',   // emerald
];

const SHAPES = ['bubble'];

function createParticle(width, height) {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 15 + 10,
    speedX: (Math.random() - 0.5) * 0.8,
    speedY: (Math.random() - 0.5) * 0.8 - 0.2,
    color: MESSAGING_COLORS[Math.floor(Math.random() * MESSAGING_COLORS.length)],
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    opacity: Math.random() * 0.6 + 0.2,
    pulseSpeed: Math.random() * 0.01 + 0.005,
    pulseOffset: Math.random() * Math.PI * 2,
    isFlipped: Math.random() > 0.5,
  };
}

function drawParticle(ctx, p, time) {
  const pulse = Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.2 + 0.8;
  ctx.globalAlpha = p.opacity * pulse;
  ctx.fillStyle = p.color;

  // Draw chat bubble
  const w = p.size * 2.5;
  const h = p.size * 1.6;
  const r = p.size * 0.6;
  
  ctx.save();
  ctx.translate(p.x, p.y);
  if (p.isFlipped) {
    ctx.scale(-1, 1);
  }

  // Draw rounded rect (with fallback)
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(0, 0, w, h, r);
  } else {
    ctx.rect(0, 0, w, h);
  }
  ctx.fill();

  // Draw tail
  ctx.beginPath();
  ctx.moveTo(r, h - 1);
  ctx.lineTo(-p.size * 0.3, h + p.size * 0.5);
  ctx.lineTo(p.size * 0.8, h - 1);
  ctx.fill();
  
  ctx.restore();
}

export default function ParticleBackground() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);
  const animFrameRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    mouseRef.current = {
      x: (e.clientX / window.innerWidth - 0.5) * 2,
      y: (e.clientY / window.innerHeight - 0.5) * 2,
    };
  }, []);

  const handleScroll = useCallback(() => {
    scrollRef.current = window.scrollY;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Init particles
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () =>
      createParticle(width, height)
    );

    let time = 0;
    const animate = () => {
      time++;
      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const sy = scrollRef.current;

      for (const p of particlesRef.current) {
        // Parallax offset based on mouse
        const parallaxX = mx * p.size * -3;
        const parallaxY = my * p.size * -3;
        
        // Multi-layer scroll parallax (larger = faster = closer)
        const scrollParallaxY = sy * (p.size * 0.03);

        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around base coordinates
        if (p.x < -100) p.x = width + 100;
        if (p.x > width + 100) p.x = -100;
        if (p.y < -100) p.y = height + 100;
        if (p.y > height + 100) p.y = -100;

        let drawX = p.x + parallaxX;
        let drawY = p.y + parallaxY - scrollParallaxY;

        // Wrap around drawing coordinates so they don't vanish on scroll
        drawY = ((drawY % height) + height) % height;

        const saved = { x: p.x, y: p.y };
        p.x = drawX;
        p.y = drawY;
        drawParticle(ctx, p, time);
        p.x = saved.x;
        p.y = saved.y;
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [handleMouseMove]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}
