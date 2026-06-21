'use client';

import { useEffect, useRef, useCallback } from 'react';

const NEON_COLORS = ['#00F0FF', '#FF007F', '#39FF14', '#FFE600', '#FF4DA6', '#66F5FF'];

function createConfettiPiece(width) {
  return {
    x: Math.random() * width,
    y: -10,
    size: Math.random() * 6 + 3,
    color: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
    speedX: (Math.random() - 0.5) * 4,
    speedY: Math.random() * 3 + 2,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 12,
    gravity: 0.08,
    drag: 0.98,
    opacity: 1,
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
    width: Math.random() * 8 + 4,
    height: Math.random() * 4 + 2,
  };
}

export default function ConfettiEffect({ registerTrigger }) {
  const canvasRef = useRef(null);
  const piecesRef = useRef([]);
  const animRef = useRef(null);
  const activeRef = useRef(false);

  const launch = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    piecesRef.current = Array.from({ length: 80 }, () => createConfettiPiece(width));
    activeRef.current = true;

    const ctx = canvas.getContext('2d');
    let frame = 0;

    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      let alive = false;

      for (const p of piecesRef.current) {
        p.speedY += p.gravity;
        p.speedX *= p.drag;
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.008;

        if (p.opacity <= 0 || p.y > height + 20) continue;
        alive = true;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      if (alive) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        activeRef.current = false;
        ctx.clearRect(0, 0, width, height);
      }
    };

    if (animRef.current) cancelAnimationFrame(animRef.current);
    animate();
  }, []);

  useEffect(() => {
    if (registerTrigger) {
      registerTrigger(launch);
    }
  }, [launch, registerTrigger]);

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[100] pointer-events-none"
    />
  );
}
