'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useWall } from './WallContext';

export default function Navbar() {
  const { isAnonymous, setIsAnonymous, userHandle, setUserHandle } = useWall();

  return (
    <nav className="sticky top-0 z-50 w-full bg-dark-bg/70 backdrop-blur-xl border-b border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-magenta/20 border border-neon-cyan/20 flex items-center justify-center group-hover:border-neon-cyan/40 transition-all duration-300">
              <span className="text-sm">🗽</span>
            </div>
            <motion.span
              className="font-display font-bold text-lg tracking-tight text-gradient-neon"
              whileHover={{ scale: 1.02 }}
            >
              FREEDOM WALL
            </motion.span>
          </Link>

          {/* Anonymous Toggle */}
          <div className="flex items-center gap-3">
            {!isAnonymous && (
              <motion.input
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                type="text"
                value={userHandle}
                onChange={(e) => setUserHandle(e.target.value.slice(0, 50))}
                placeholder="Your handle..."
                className="w-28 sm:w-36 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs font-body text-white placeholder-white/25 focus:outline-none focus:border-neon-cyan/30 transition-all"
              />
            )}

            <button
              onClick={() => setIsAnonymous(!isAnonymous)}
              className="flex items-center gap-2 group/toggle"
              title={isAnonymous ? 'Posting anonymously' : 'Posting with handle'}
            >
              <span className="text-xs font-body text-white/40 hidden sm:inline">
                {isAnonymous ? 'Anonymous' : 'Named'}
              </span>

              {/* Toggle switch */}
              <div className={`w-10 h-5.5 rounded-full p-0.5 transition-all duration-300 ${
                isAnonymous 
                  ? 'bg-neon-cyan/20 border border-neon-cyan/30' 
                  : 'bg-neon-magenta/20 border border-neon-magenta/30'
              }`}>
                <motion.div
                  className={`w-4 h-4 rounded-full ${
                    isAnonymous ? 'bg-neon-cyan' : 'bg-neon-magenta'
                  }`}
                  animate={{ x: isAnonymous ? 0 : 18 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  style={{ boxShadow: isAnonymous 
                    ? '0 0 8px rgba(0,240,255,0.5)' 
                    : '0 0 8px rgba(255,0,127,0.5)' 
                  }}
                />
              </div>

              <span className="text-base">
                {isAnonymous ? '🎭' : '👤'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
