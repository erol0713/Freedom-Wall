'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useWall } from './WallContext';

export default function Navbar() {
  const { isAnonymous, setIsAnonymous, userHandle, setUserHandle } = useWall();

  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-900/60 backdrop-blur-xl border-b border-white/10 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.span
              className="font-display font-bold text-lg tracking-tight text-gradient-neon"
              whileHover={{ scale: 1.02 }}
            >
              FREEDOM WALL
            </motion.span>
          </Link>

          {/* Right side links */}
          <div className="flex items-center">
            <Link 
              href="/archive" 
              className="flex items-center gap-2 text-sm font-body text-slate-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 shadow-sm"
            >
              <span className="text-base">🗄️</span>
              Archive
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
