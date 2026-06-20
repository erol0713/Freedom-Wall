'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';

export default function SongSearch({ onSelect, selectedSong, onClear }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery || searchQuery.trim().length < 2) {
        setResults([]);
        setShowDropdown(false);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (res.ok && data.tracks) {
          setResults(data.tracks);
          setShowDropdown(data.tracks.length > 0);
        }
      } catch (error) {
        console.error('Spotify search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
    return () => debouncedSearch.cancel();
  }, [query, debouncedSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (track) => {
    onSelect(track);
    setQuery('');
    setResults([]);
    setShowDropdown(false);
  };

  const handleClear = () => {
    onClear();
    setQuery('');
    setResults([]);
  };

  // Show selected song badge
  if (selectedSong) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 bg-secondary/10 border border-secondary/30 rounded-xl px-4 py-3"
      >
        {selectedSong.album?.images?.[0] ? (
          <img src={selectedSong.album.images[0].url} alt="Cover" className="w-8 h-8 rounded object-cover shadow-sm flex-shrink-0" />
        ) : (
          <span className="text-xl">🎵</span>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-body text-white font-medium truncate">{selectedSong.name}</p>
          <p className="text-xs font-body text-white/50 truncate">{selectedSong.artists}</p>
        </div>
        <button
          onClick={handleClear}
          className="text-white/40 hover:text-white/70 transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </motion.div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">🎵</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          placeholder="Search for a song... (optional)"
          className="w-full bg-dark-bg/50 border border-dark-border rounded-xl pl-10 pr-10 py-3 text-sm font-body text-white placeholder-white/30 focus:outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/30 transition-all"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-dark-border rounded-full animate-spin border-t-secondary" />
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      <AnimatePresence>
        {showDropdown && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 top-full mt-2 w-full bg-dark-card border border-dark-border rounded-xl shadow-2xl overflow-hidden"
          >
            {results.map((track) => (
              <button
                key={track.id}
                onClick={() => handleSelect(track)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
              >
                {track.album.images?.[0] && (
                  <img
                    src={track.album.images[0]?.url}
                    alt={track.name}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body text-white truncate">{track.name}</p>
                  <p className="text-xs font-body text-white/40 truncate">{track.artists}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
