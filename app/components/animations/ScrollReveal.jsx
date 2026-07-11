'use client';

import { motion } from 'framer-motion';

/**
 * ScrollReveal - A wrapper that fades and slides elements up when they enter the viewport.
 */
export default function ScrollReveal({ 
  children, 
  delay = 0, 
  className = "", 
  direction = "up", // up, down, left, right
  distance = 50,
  duration = 0.6
}) {
  const directions = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
  };

  const initialTransform = directions[direction];

  return (
    <motion.div
      initial={{ opacity: 0, ...initialTransform }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration, 
        delay, 
        ease: "easeOut",
        type: "spring",
        stiffness: 100,
        damping: 20
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
