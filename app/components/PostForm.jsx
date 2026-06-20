'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import SongSearch from './SongSearch';

const POST_TYPES = [
  { key: 'confession', emoji: '💕', label: 'Confession' },
  { key: 'rant', emoji: '😤', label: 'Rant' },
  { key: 'thought', emoji: '💭', label: 'Thought' },
  { key: 'message', emoji: '📨', label: 'Message' },
];

const MAX_CHARS = 2000;

export default function PostForm({ onPostCreated }) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState('thought');
  const [selectedSong, setSelectedSong] = useState(null);
  const [toAlias, setToAlias] = useState('');
  const [fromAlias, setFromAlias] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const charCount = content.length;
  const charPercent = (charCount / MAX_CHARS) * 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      const body = {
        content: content.trim(),
        contentType,
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
        setContent('');
        setContentType('thought');
        setSelectedSong(null);
        setToAlias('');
        setFromAlias('');
        if (onPostCreated) onPostCreated();
        router.push('/');
        router.refresh();
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
      transition={{ duration: 0.5 }}
      className="bg-dark-card/80 backdrop-blur-md border border-dark-border rounded-2xl p-5 sm:p-6 space-y-5"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <span className="text-sm">✍️</span>
        </div>
        <h2 className="font-display text-lg text-white/90">Share your thoughts</h2>
      </div>

      {/* Type Selector */}
      <div className="flex flex-wrap gap-2">
        {POST_TYPES.map((type) => (
          <motion.button
            key={type.key}
            type="button"
            onClick={() => setContentType(type.key)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-body transition-all duration-200 ${
              contentType === type.key
                ? 'bg-primary/20 border border-primary/50 text-primary-light shadow-lg shadow-primary/10'
                : 'bg-dark-bg/50 border border-dark-border text-white/50 hover:text-white/70 hover:border-white/20'
            }`}
          >
            <span>{type.emoji}</span>
            <span>{type.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Optional To/From fields for Message or Confession */}
      {(contentType === 'confession' || contentType === 'message') && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            value={toAlias}
            onChange={(e) => setToAlias(e.target.value)}
            placeholder="To: (optional)"
            className="flex-1 bg-dark-bg/50 border border-dark-border rounded-xl p-3 font-body text-sm text-white placeholder-white/25 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
            maxLength={100}
          />
          <input
            type="text"
            value={fromAlias}
            onChange={(e) => setFromAlias(e.target.value)}
            placeholder="From: (alias optional)"
            className="flex-1 bg-dark-bg/50 border border-dark-border rounded-xl p-3 font-body text-sm text-white placeholder-white/25 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
            maxLength={100}
          />
        </motion.div>
      )}

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CHARS) {
              setContent(e.target.value);
            }
          }}
          placeholder="What's on your mind? Your identity stays hidden..."
          rows={4}
          className="w-full bg-dark-bg/50 border border-dark-border rounded-xl p-4 font-handwriting text-lg text-white placeholder-white/25 resize-none focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
        />
        {/* Character count */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <div className="w-16 h-1.5 bg-dark-border rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full transition-colors ${
                charPercent > 90 ? 'bg-red-500' : charPercent > 70 ? 'bg-yellow-500' : 'bg-secondary'
              }`}
              style={{ width: `${Math.min(charPercent, 100)}%` }}
            />
          </div>
          <span className={`text-xs font-body ${charPercent > 90 ? 'text-red-400' : 'text-white/30'}`}>
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
          className="text-red-400 text-sm font-body"
        >
          {error}
        </motion.p>
      )}

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={!content.trim() || isSubmitting}
        whileHover={{ scale: content.trim() ? 1.02 : 1 }}
        whileTap={{ scale: content.trim() ? 0.98 : 1 }}
        className={`w-full py-3.5 rounded-xl font-body font-semibold text-sm tracking-wide transition-all duration-300 ${
          content.trim()
            ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/25 hover:shadow-primary/40'
            : 'bg-dark-border text-white/30 cursor-not-allowed'
        }`}
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
          'Post Anonymously ✨'
        )}
      </motion.button>
    </motion.form>
  );
}
