'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useWall } from './WallContext';
import SongSearch from './SongSearch';

const MAX_CHARS = 2000;

export default function PostForm() {
  const router = useRouter();
  const { isAnonymous, userHandle, triggerConfetti, addPost, trackPost } = useWall();
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('💭');
  const [toAlias, setToAlias] = useState('');
  const [fromAlias, setFromAlias] = useState('');
  const [selectedSong, setSelectedSong] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const charCount = content.length;
  const charPercent = (charCount / MAX_CHARS) * 100;

  // Map mood emoji to a mood key for the mood selector
  const MOOD_KEY_MAP = {
    '🔥': '🔥', '💡': '💡', '🤔': '🤔',
    '🌊': '🌊', '💕': '💕', '😤': '😤',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      const body = {
        content: content.trim(),
        contentType: (toAlias.trim() || fromAlias.trim()) ? 'message' : 'thought',
        mood,
        isAnonymous,
        userHandle: !isAnonymous ? userHandle : null,
        songId: selectedSong ? selectedSong.id : null,
        songName: selectedSong ? selectedSong.name : null,
        songArtist: selectedSong ? selectedSong.artists : null,
        songCover: selectedSong && selectedSong.album.images.length > 0 ? selectedSong.album.images[0].url : null,
        songPreviewUrl: selectedSong ? selectedSong.previewUrl : null,
        toAlias: toAlias.trim() || null,
        fromAlias: fromAlias.trim() || null,
      };

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const newPost = await res.json();
        setContent('');
        setMood('💭');
        setToAlias('');
        setFromAlias('');
        setSelectedSong(null);
        setIsFocused(false);
        addPost(newPost);
        if (trackPost) trackPost(newPost._id);
        triggerConfetti();
        router.push('/');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create post');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: -20, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: -0.5 }}
      whileHover={{ rotate: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`relative p-6 sm:p-10 pt-10 transition-all duration-500 max-w-2xl mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)]`}
      style={{
        backgroundColor: '#f4ebd0', // Old bond paper look
        borderRadius: '4px',
      }}
    >
      {/* Paper texture overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.08] z-0 mix-blend-multiply" 
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', 
          backgroundSize: '128px 128px' 
        }} 
      />

      {/* Pushpin at the top */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-3xl drop-shadow-md z-20 pointer-events-none">
        📍
      </div>

      {/* Header */}
      <div className="text-center relative z-10 mb-6 mt-4">
        <h2 className="font-handwriting font-bold text-4xl text-slate-800">
          Freedom Wall /
        </h2>
        <p className="font-handwriting text-2xl text-slate-700">
          Confessions • Messages • Thoughts
        </p>
      </div>

      {/* To / From Inputs */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 relative z-10 mb-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={fromAlias}
            onChange={(e) => setFromAlias(e.target.value)}
            placeholder="From (Optional)"
            maxLength={50}
            className="w-full bg-transparent border-b-2 border-dotted border-slate-400 px-1 py-1 font-handwriting text-2xl text-slate-800 placeholder-slate-700 focus:outline-none focus:border-slate-600 transition-all"
          />
        </div>
        <div className="flex-1 relative">
          <input
            type="text"
            value={toAlias}
            onChange={(e) => setToAlias(e.target.value)}
            placeholder="To (Optional)"
            maxLength={50}
            className="w-full bg-transparent border-b-2 border-dotted border-slate-400 px-1 py-1 font-handwriting text-2xl text-slate-800 placeholder-slate-700 focus:outline-none focus:border-slate-600 transition-all"
          />
        </div>
      </div>

      {/* Textarea */}
      <div className="relative z-10 mt-4">
        <textarea
          value={content}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CHARS) {
              setContent(e.target.value);
            }
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => !content && setIsFocused(false)}
          placeholder="Write your message here..."
          rows={10}
          className="w-full bg-transparent border-none p-0 pr-4 font-handwriting text-[26px] text-slate-800 placeholder-slate-400 resize-none focus:outline-none transition-all duration-300"
          style={{ 
            lineHeight: '36px',
            backgroundImage: 'linear-gradient(to bottom, transparent 35px, rgba(0, 0, 0, 0.12) 35px)',
            backgroundSize: '100% 36px',
            backgroundAttachment: 'local',
            backgroundPosition: '0 0',
          }}
        />
        {/* Character count */}
        <div className="absolute bottom-2 right-4 flex items-center gap-2 px-2 bg-[#fefce8]/80 backdrop-blur-sm rounded">
          <span
            className={`text-sm font-handwriting tabular-nums ${
              charPercent > 90 ? 'text-red-500' : 'text-slate-600'
            }`}
          >
            {charCount}/{MAX_CHARS}
          </span>
        </div>
      </div>

      {/* Song Search */}
      <div className="relative z-50 pt-4 mt-2">
        <div className="pb-2 w-full sm:w-3/4 mx-auto">
          <SongSearch
            onSelect={setSelectedSong}
            selectedSong={selectedSong}
            onClear={() => setSelectedSong(null)}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 text-sm font-body font-bold relative z-10 text-center mt-4"
        >
          {error}
        </motion.p>
      )}

      {/* Submit Button */}
      <div className="relative z-10 flex justify-center mt-8 mb-2">
        <motion.button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          whileHover={{ scale: content.trim() ? 1.05 : 1, rotate: 0 }}
          whileTap={{ scale: content.trim() ? 0.95 : 1 }}
          className={`px-8 py-2 bg-[#fdfbf7] text-slate-800 font-handwriting font-bold text-2xl shadow-[2px_4px_12px_rgba(0,0,0,0.15)] border border-slate-300`}
          style={{ transform: 'rotate(-2deg)' }}
        >
          {isSubmitting ? 'Pinning...' : 'Pin to Wall 📌'}
        </motion.button>
      </div>
    </motion.form>
  );
}
