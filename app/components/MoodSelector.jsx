'use client';

import { motion } from 'framer-motion';

const MOODS = [
  { key: 'all', emoji: '✨', label: 'All', color: 'rgba(255,255,255,0.15)' },
  { key: '🔥', emoji: '🔥', label: 'Hot Take', color: 'rgba(255,100,50,0.2)' },
  { key: '💡', emoji: '💡', label: 'Idea', color: 'rgba(255,230,0,0.2)' },
  { key: '🤔', emoji: '🤔', label: 'Deep', color: 'rgba(0,240,255,0.2)' },
  { key: '🌊', emoji: '🌊', label: 'Calm', color: 'rgba(100,180,255,0.2)' },
  { key: '💕', emoji: '💕', label: 'Love', color: 'rgba(255,0,127,0.2)' },
  { key: '😤', emoji: '😤', label: 'Rant', color: 'rgba(255,80,20,0.2)' },
];

export const MOOD_OPTIONS = MOODS.filter((m) => m.key !== 'all');

export default function MoodSelector({ value, onChange, mode = 'filter' }) {
  const items = mode === 'filter' ? MOODS : MOOD_OPTIONS;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((mood) => {
        const isActive = value === mood.key;
        return (
          <motion.button
            key={mood.key}
            type="button"
            onClick={() => onChange(mood.key)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-body font-medium transition-all duration-300 ${
              isActive
                ? 'bg-white/10 border border-white/20 text-white shadow-lg'
                : 'bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/60 hover:border-white/15'
            }`}
            style={isActive ? {
              boxShadow: `0 0 15px ${mood.color}, 0 0 30px ${mood.color.replace('0.2', '0.05')}`,
              borderColor: mood.color.replace('0.2', '0.4'),
            } : {}}
          >
            <span className="text-base">{mood.emoji}</span>
            <span className="hidden sm:inline">{mood.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
