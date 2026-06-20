'use client';

import { motion } from 'framer-motion';
import Feed from './components/Feed';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Header */}
      <header className="relative pt-12 sm:pt-16 pb-8 sm:pb-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1
              className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-4"
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 8, repeat: Infinity }}
              style={{
                background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #FF6B6B, #4ECDC4)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Freedom Wall
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="font-body text-white/50 text-sm sm:text-base max-w-md mx-auto leading-relaxed"
            >
              Speak freely. Stay anonymous. Share your confessions, rants, 
              thoughts, and messages with the world.
            </motion.p>
          </motion.div>

          {/* Decorative divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-8 mb-2 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pb-24 space-y-8">

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-3"
        >
          <div className="h-px flex-1 bg-gradient-to-r from-dark-border to-transparent" />
          <span className="font-body text-xs uppercase tracking-widest text-white/30">
            Recent Posts
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-dark-border to-transparent" />
        </motion.div>

        {/* Feed */}
        <Feed />
      </div>
    </main>
  );
}
