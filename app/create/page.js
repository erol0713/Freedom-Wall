'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import PostForm from '../components/PostForm';

export default function CreatePostPage() {
  return (
    <main className="min-h-screen relative z-10 pt-10 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <h1 className="font-display text-3xl font-bold text-gradient-neon">
            New Message
          </h1>
          <Link 
            href="/"
            className="text-white/40 hover:text-white/80 transition-colors text-sm font-body flex items-center gap-2"
          >
            ← Back to Wall
          </Link>
        </motion.div>
        
        <PostForm />
      </div>
    </main>
  );
}
