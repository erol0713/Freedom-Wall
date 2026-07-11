'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PostCard from './PostCard';

export default function FeaturedCarousel() {
  const [posts, setPosts] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopPosts() {
      try {
        const response = await fetch('/api/posts?sort=likes&limit=5');
        if (response.ok) {
          const data = await response.json();
          // Sort explicitly by likes just in case
          const sorted = data.posts.sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5);
          setPosts(sorted);
        }
      } catch (error) {
        console.error('Failed to fetch top posts:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTopPosts();
  }, []);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % posts.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + posts.length) % posts.length);
  };

  if (loading || posts.length === 0) return null;

  return (
    <div className="w-full py-12 flex flex-col items-center overflow-hidden">
      <div className="mb-8 flex items-center gap-3 w-full max-w-6xl px-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neon-magenta/50 to-transparent" />
        <span className="font-display text-lg uppercase tracking-[0.2em] text-neon-magenta font-bold drop-shadow-[0_0_8px_rgba(255,0,255,0.8)]">
          Hall of Fame
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-neon-magenta/50 to-transparent" />
      </div>

      <div 
        className="relative w-full max-w-5xl min-h-[500px] flex items-start justify-center pt-8"
        style={{ perspective: 1200 }}
      >
        <AnimatePresence initial={false}>
          {posts.map((post, index) => {
            // Calculate relative position
            const isActive = index === activeIndex;
            let offset = index - activeIndex;
            
            // Handle wrap-around for smooth infinite feeling if we want
            // For 5 items, offset can be -2, -1, 0, 1, 2
            if (offset < -2) offset += posts.length;
            if (offset > 2) offset -= posts.length;

            const isLeft = offset < 0;
            const isRight = offset > 0;
            const absOffset = Math.abs(offset);

            // 3D Cover Flow Math
            const xPos = offset * 180; // horizontal spacing
            const zPos = absOffset * -150; // push back
            const rotateY = isLeft ? 35 : isRight ? -35 : 0;
            const scale = isActive ? 1 : 1 - absOffset * 0.1;
            const opacity = isActive ? 1 : 1 - absOffset * 0.3;
            const zIndex = 10 - absOffset;

            // Only render items close to the active one to prevent crazy overlaps
            if (absOffset > 2) return null;

            return (
              <motion.div
                key={post._id}
                className="absolute w-full max-w-md cursor-pointer"
                initial={false}
                animate={{
                  x: xPos,
                  z: zPos,
                  rotateY: rotateY,
                  scale: scale,
                  opacity: opacity,
                  zIndex: zIndex,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                  mass: 1,
                }}
                style={{ transformStyle: 'preserve-3d' }}
                onClick={() => {
                  if (!isActive) setActiveIndex(index);
                }}
              >
                {/* Disable interaction on non-active cards so they don't intercept clicks */}
                <div className={isActive ? '' : 'pointer-events-none'}>
                  <PostCard post={post} index={0} />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Navigation Controls */}
        {posts.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute top-[40%] -translate-y-1/2 left-4 md:left-12 z-50 p-3 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white hover:bg-white/20 hover:scale-110 transition-all shadow-[0_0_15px_rgba(0,255,255,0.3)]"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              className="absolute top-[40%] -translate-y-1/2 right-4 md:right-12 z-50 p-3 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white hover:bg-white/20 hover:scale-110 transition-all shadow-[0_0_15px_rgba(0,255,255,0.3)]"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
