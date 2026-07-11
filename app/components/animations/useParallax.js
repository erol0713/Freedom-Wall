'use client';

import { useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

/**
 * useParallax - Creates a parallax scroll effect based on element position in the viewport.
 */
export function useParallax(distance = 100) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance]);

  return { ref, y };
}
