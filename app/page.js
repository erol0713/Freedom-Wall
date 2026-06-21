'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Feed from './components/Feed';
import PostForm from './components/PostForm';
import MoodSelector from './components/MoodSelector';
import ConfettiEffect from './components/ConfettiEffect';
import { useWall } from './components/WallContext';

export default function Home() {
  const [activeMood, setActiveMood] = useState('all');
  const { setConfettiTrigger } = useWall();

  return (
    <main className="min-h-screen relative z-10">
      {/* Confetti overlay */}
      <ConfettiEffect registerTrigger={setConfettiTrigger} />

      {/* Hero Header */}
      <header className="relative pt-10 sm:pt-14 pb-6 sm:pb-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
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
              className="font-body text-white/35 text-sm sm:text-base max-w-md mx-auto leading-relaxed"
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
            className="mt-6 h-px bg-gradient-to-r from-transparent via-neon-cyan/15 to-transparent"
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pb-8 space-y-8">
        {/* Post Form */}
        <div className="max-w-2xl mx-auto">
          <PostForm />
        </div>

        {/* Mood Filter + Section Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-dark-border to-transparent" />
            <span className="font-body text-[10px] uppercase tracking-[0.2em] text-white/20">
              The Wall
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-dark-border to-transparent" />
          </div>

          <div className="flex justify-center">
            <MoodSelector value={activeMood} onChange={setActiveMood} mode="filter" />
          </div>
        </motion.div>

        {/* Feed */}
        <Feed mood={activeMood} />
      </div>
    </main>
  );
}
