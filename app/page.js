'use client';

import { motion } from 'framer-motion';
import Feed from './components/Feed';
import Link from 'next/link';
import ConfettiEffect from './components/ConfettiEffect';
import { useWall } from './components/WallContext';
import { useMouseTilt } from './components/animations/useMouseTilt';
import ScrollReveal from './components/animations/ScrollReveal';
import FeaturedCarousel from './components/FeaturedCarousel';

export default function Home() {
  const { setConfettiTrigger } = useWall();
  const { rotateX, rotateY, handleMouseMove, handleMouseLeave } = useMouseTilt(10);

  return (
    <main className="min-h-screen relative z-10">
      {/* Confetti overlay */}
      <ConfettiEffect registerTrigger={setConfettiTrigger} />

      {/* Hero Header */}
      <header 
        className="relative pt-10 sm:pt-14 pb-6 sm:pb-8 px-4"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: 1200 }}
      >
        <motion.div 
          className="max-w-2xl mx-auto text-center"
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1
              className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-gradient-neon"
            >
              Freedom Wall
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="font-body text-slate-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed"
            >
              Speak freely. Stay anonymous. Share your thoughts
              with the world.
            </motion.p>
          </motion.div>

          {/* Decorative divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-6 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"
          />
        </motion.div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pb-8 space-y-8">
        {/* Create Message Button */}
        <ScrollReveal delay={0.2} direction="up" distance={30}>
          <div className="flex justify-center -mt-4 mb-4">
            <Link href="/create">
              <motion.div
                whileHover={{ scale: 1.05, y: -2, boxShadow: "0px 10px 20px rgba(0, 255, 200, 0.2)" }}
                whileTap={{ scale: 0.95 }}
                className="neon-button py-3 px-8 rounded-full font-body font-semibold text-sm tracking-wide flex items-center gap-2 cursor-pointer transition-shadow"
              >
                <span>✍️</span>
                <span>Create Message</span>
              </motion.div>
            </Link>
          </div>
        </ScrollReveal>

        {/* 3D Cover Flow Carousel for Top Posts */}
        <ScrollReveal delay={0.25} direction="up" distance={30}>
          <FeaturedCarousel />
        </ScrollReveal>

        {/* Section Header */}
        <ScrollReveal delay={0.3} direction="up" distance={20}>
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
              <span className="font-body text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">
                Today's Wall
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-600 to-transparent" />
            </div>
          </div>
        </ScrollReveal>

        {/* Feed */}
        <ScrollReveal delay={0.4} direction="up" distance={40}>
          <Feed dateFilter="today" />
        </ScrollReveal>
      </div>
    </main>
  );
}
