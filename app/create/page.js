'use client';

import { motion } from 'framer-motion';
import PostForm from '../components/PostForm';

export default function CreatePost() {
  return (
    <main className="min-h-screen pt-12 sm:pt-16 px-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3 text-white">
            Create a Post
          </h1>
          <p className="font-body text-white/50 text-sm sm:text-base max-w-md mx-auto">
            Your identity is completely hidden. Speak your truth.
          </p>
        </motion.div>

        <PostForm />
      </div>
    </main>
  );
}
