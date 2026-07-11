'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

/**
 * PageTransition - Wrapper for route changes in App Router.
 * Because Next.js 13+ App router preserves layouts, using this inside template.js 
 * or layout.js provides smooth entrance animations.
 */
export default function PageTransition({ children }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20, rotateX: 5, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, rotateX: -5, scale: 0.98 }}
        transition={{ 
          duration: 0.4, 
          ease: "easeInOut",
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
        style={{ transformPerspective: 1200 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
