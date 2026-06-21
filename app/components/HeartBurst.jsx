'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function createHeart(originX, originY) {
  const angle = Math.random() * Math.PI * 2;
  const velocity = Math.random() * 60 + 40;
  return {
    id: Math.random().toString(36).substr(2, 9),
    x: originX,
    y: originY,
    targetX: originX + Math.cos(angle) * velocity,
    targetY: originY + Math.sin(angle) * velocity - 30,
    size: Math.random() * 10 + 8,
    rotation: Math.random() * 40 - 20,
    opacity: Math.random() * 0.4 + 0.6,
    color: ['#FF007F', '#FF4DA6', '#00F0FF', '#FFE600', '#39FF14'][
      Math.floor(Math.random() * 5)
    ],
  };
}

export default function HeartBurst({ originRef }) {
  const [hearts, setHearts] = useState([]);

  const trigger = useCallback(() => {
    if (!originRef?.current) return;
    const rect = originRef.current.getBoundingClientRect();
    const ox = rect.left + rect.width / 2;
    const oy = rect.top + rect.height / 2;

    const newHearts = Array.from({ length: 14 }, () => createHeart(ox, oy));
    setHearts(newHearts);

    setTimeout(() => setHearts([]), 900);
  }, [originRef]);

  return {
    trigger,
    element: (
      <AnimatePresence>
        {hearts.map((heart) => (
          <motion.div
            key={heart.id}
            initial={{
              position: 'fixed',
              left: heart.x,
              top: heart.y,
              opacity: heart.opacity,
              scale: 0.3,
              rotate: 0,
              zIndex: 9999,
              pointerEvents: 'none',
            }}
            animate={{
              left: heart.targetX,
              top: heart.targetY,
              opacity: 0,
              scale: 1,
              rotate: heart.rotation,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{
              fontSize: heart.size,
              color: heart.color,
            }}
          >
            ❤
          </motion.div>
        ))}
      </AnimatePresence>
    ),
  };
}
