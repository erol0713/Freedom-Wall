'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWall } from './WallContext';
import MoodSelector from './MoodSelector';
import SongSearch from './SongSearch';

const MAX_CHARS = 2000;

export default function PostForm() {
  const { isAnonymous, userHandle, triggerConfetti, addPost } = useWall();
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('💭');
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
        contentType: 'thought',
        mood,
        isAnonymous,
        userHandle: !isAnonymous ? userHandle : null,
        songId: selectedSong ? selectedSong.id : null,
        songName: selectedSong ? selectedSong.name : null,
        songArtist: selectedSong ? selectedSong.artists : null,
        songCover: selectedSong && selectedSong.album.images.length > 0 ? selectedSong.album.images[0].url : null,
        songPreviewUrl: selectedSong ? selectedSong.previewUrl : null,
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
        setSelectedSong(null);
        setIsFocused(false);
        addPost(newPost);
        triggerConfetti();
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
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`relative rounded-2xl p-5 sm:p-6 space-y-4 transition-all duration-500 ${
        isFocused ? 'gradient-border' : 'glass-card-neon'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-magenta/20 flex items-center justify-center">
            <span className="text-xs">✍️</span>
          </div>
          <h2 className="font-display text-base text-white/80">Speak your mind</h2>
        </div>
        <span className="text-xs font-body text-white/25">
          {isAnonymous ? '🎭 Anonymous' : `👤 ${userHandle || 'Named'}`}
        </span>
      </div>

      {/* Mood Selector */}
      <MoodSelector value={mood} onChange={setMood} mode="tag" />

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CHARS) {
              setContent(e.target.value);
            }
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => !content && setIsFocused(false)}
          placeholder="What's on your mind? Your identity stays hidden..."
          rows={isFocused ? 5 : 3}
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 font-handwriting text-lg text-white/90 placeholder-white/20 resize-none focus:outline-none focus:border-neon-cyan/20 focus:bg-white/[0.04] transition-all duration-300"
        />
        {/* Character count */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <div className="w-14 h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full transition-colors duration-300 ${
                charPercent > 90
                  ? 'bg-neon-magenta'
                  : charPercent > 70
                  ? 'bg-neon-yellow'
                  : 'bg-neon-cyan/60'
              }`}
              style={{ width: `${Math.min(charPercent, 100)}%` }}
            />
          </div>
          <span
            className={`text-[10px] font-body tabular-nums ${
              charPercent > 90 ? 'text-neon-magenta' : 'text-white/20'
            }`}
          >
            {charCount}/{MAX_CHARS}
          </span>
        </div>
      </div>

      {/* Song Search */}
      <SongSearch
        onSelect={setSelectedSong}
        selectedSong={selectedSong}
        onClear={() => setSelectedSong(null)}
      />

      {/* Error */}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-neon-magenta text-sm font-body"
        >
          {error}
        </motion.p>
      )}

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={!content.trim() || isSubmitting}
        whileHover={{ scale: content.trim() ? 1.01 : 1 }}
        whileTap={{ scale: content.trim() ? 0.98 : 1 }}
        className={`neon-button w-full py-3.5 rounded-xl font-body font-semibold text-sm tracking-wide`}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Posting...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Post to the Wall
            <span className="text-base">🗽</span>
          </span>
        )}
      </motion.button>
    </motion.form>
  );
}
