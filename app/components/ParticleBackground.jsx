'use client';

import { useEffect, useRef, useCallback } from 'react';

const PARTICLE_COUNT = 50;
const NEON_COLORS = [
  'rgba(0, 240, 255, 0.35)',   // cyan
  'rgba(255, 0, 127, 0.3)',    // magenta
  'rgba(57, 255, 20, 0.25)',   // lime
  'rgba(255, 230, 0, 0.25)',   // yellow
  'rgba(0, 240, 255, 0.2)',    // cyan dim
  'rgba(255, 0, 127, 0.15)',   // magenta dim
];

const SHAPES = ['circle', 'circle', 'circle', 'diamond', 'triangle'];

function createParticle(width, height) {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 3 + 1,
    speedX: (Math.random() - 0.5) * 0.3,
    speedY: (Math.random() - 0.5) * 0.2 - 0.1,
    color: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    opacity: Math.random() * 0.5 + 0.2,
    pulseSpeed: Math.random() * 0.02 + 0.005,
    pulseOffset: Math.random() * Math.PI * 2,
  };
}

function drawParticle(ctx, p, time) {
  const pulse = Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.3 + 0.7;
  ctx.globalAlpha = p.opacity * pulse;
  ctx.fillStyle = p.color;

  switch (p.shape) {
    case 'diamond':
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2);
      ctx.restore();
      break;
    case 'triangle':
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - p.size * 1.5);
      ctx.lineTo(p.x - p.size * 1.3, p.y + p.size);
      ctx.lineTo(p.x + p.size * 1.3, p.y + p.size);
      ctx.closePath();
      ctx.fill();
      break;
    default:
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
  }
}

export default function ParticleBackground() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    mouseRef.current = {
      x: (e.clientX / window.innerWidth - 0.5) * 2,
      y: (e.clientY / window.innerHeight - 0.5) * 2,
    };
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

      for (const p of particlesRef.current) {
        // Parallax offset based on mouse
        const parallaxX = mx * p.size * -3;
        const parallaxY = my * p.size * -3;

        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        const drawX = p.x + parallaxX;
        const drawY = p.y + parallaxY;

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
