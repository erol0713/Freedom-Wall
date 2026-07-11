'use client';

import { useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * useMouseTilt - Creates a 3D perspective tilt effect based on mouse position.
 * Returns Framer Motion values (rotateX, rotateY) and event handlers.
 * Disables itself on touch devices.
 */
export function useMouseTilt(maxTilt = 12) {
  const [isTouch, setIsTouch] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useMotionValue(0); // Raw pixel coordinates for glare
  const mouseY = useMotionValue(0);

  // Check if device supports hover (mouse vs touch)
  useEffect(() => {
    const checkTouch = () => {
      setIsTouch(window.matchMedia('(pointer: coarse)').matches);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  const springConfig = { damping: 25, stiffness: 250 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);

  // Map normalized mouse position (-0.5 to 0.5) to degrees (-maxTilt to +maxTilt)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-maxTilt, maxTilt]);

  const handleMouseMove = (e) => {
    if (isTouch) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    
    // Raw pixel position
    mouseX.set(mouseXPos);
    mouseY.set(mouseYPos);
    
    // Normalize to -0.5 to 0.5
    x.set(mouseXPos / width - 0.5);
    y.set(mouseYPos / height - 0.5);
  };

  const handleMouseLeave = () => {
    if (isTouch) return;
    x.set(0);
    y.set(0);
    mouseX.set(0);
    mouseY.set(0);
  };

  return {
    x,
    y,
    mouseX,
    mouseY,
    rotateX: isTouch ? 0 : rotateX,
    rotateY: isTouch ? 0 : rotateY,
    handleMouseMove,
    handleMouseLeave,
    isTouch
  };
}
