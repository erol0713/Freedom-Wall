'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

const TYPE_CONFIG = {
  confession: { emoji: '💕', label: 'Confession', gradient: 'from-pink-500/20 to-rose-500/20', border: 'border-pink-500/30' },
  rant: { emoji: '😤', label: 'Rant', gradient: 'from-orange-500/20 to-red-500/20', border: 'border-orange-500/30' },
  thought: { emoji: '💭', label: 'Thought', gradient: 'from-blue-500/20 to-purple-500/20', border: 'border-blue-500/30' },
  message: { emoji: '📨', label: 'Message', gradient: 'from-teal-500/20 to-cyan-500/20', border: 'border-teal-500/30' },
};

export default function PostCard({ post, onLike, onDelete }) {
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);

  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFullTextModal, setShowFullTextModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const maxLength = 100;
  const isLongText = post.content.length > maxLength;
  const displayText = isLongText ? post.content.substring(0, maxLength).trim() + '...' : post.content;

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const typeConfig = TYPE_CONFIG[post.contentType] || TYPE_CONFIG.thought;

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      const res = await fetch(`/api/posts/${post._id}/like`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setLiked(data.liked);
        setLikeCount(data.likes);
        if (onLike) onLike(post._id, data);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    if (!confirm('Are you sure you want to delete this post?')) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts?id=${post._id}`, {
        method: 'DELETE',
      });
      if (res.ok && onDelete) {
        onDelete(post._id);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const timeAgo = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
    : '';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`w-full ${showEmbed ? 'min-h-[350px]' : 'h-[350px]'} flex flex-col mb-4 sm:mb-6 relative bg-gradient-to-br ${typeConfig.gradient} backdrop-blur-sm border ${typeConfig.border} rounded-2xl p-5 sm:p-6 hover:border-primary/40 transition-all duration-300 group`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <motion.span
            className="text-2xl"
            whileHover={{ scale: 1.2, rotate: 10 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {typeConfig.emoji}
          </motion.span>
          <span className="text-xs font-body uppercase tracking-widest text-white/50">
            {typeConfig.label}
          </span>
        </div>
        <span className="text-xs font-body text-white/40">{timeAgo}</span>
      </div>

      {/* Content */}
      <div className="mb-5 flex-1 flex flex-col">
        {(post.contentType === 'confession' || post.contentType === 'message') && (
          <div className="mb-3 p-3 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-1">
            <p className="text-sm font-body text-white/90">
              <span className="text-white/40 font-medium mr-2 uppercase text-xs tracking-wider">To:</span>
              {post.toAlias || 'Anyone'}
            </p>
            <p className="text-sm font-body text-white/90">
              <span className="text-white/40 font-medium mr-2 uppercase text-xs tracking-wider">From:</span>
              {post.fromAlias || 'Anonymous'}
            </p>
          </div>
        )}
        <p className="font-handwriting text-xl sm:text-2xl text-white/90 leading-relaxed whitespace-pre-wrap break-words flex-1">
          {displayText}
        </p>
        {isLongText && (
          <button 
            onClick={() => setShowFullTextModal(true)}
            className="mt-2 text-sm font-body text-primary hover:text-primary-light transition-colors font-medium self-start"
          >
            See more
          </button>
        )}
      </div>

      {/* Song Attachment */}
      {post.songId && (
        <div className="mb-4">
          <button
            onClick={() => setShowEmbed(!showEmbed)}
            className="flex items-center gap-2 text-secondary hover:text-secondary-light transition-colors text-sm font-body"
          >
            {post.songCover ? (
              <img src={post.songCover} alt="Cover" className="w-5 h-5 rounded shadow-sm object-cover flex-shrink-0" />
            ) : (
              <span className="text-lg">🎵</span>
            )}
            <span className="font-medium">{post.songName}</span>
            <span className="text-white/40">by {post.songArtist}</span>
            <motion.svg
              className="w-3 h-3 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ rotate: showEmbed ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>

          <AnimatePresence>
            {showEmbed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mt-3"
              >
                <div className="bg-dark-bg/50 border border-dark-border rounded-xl p-3 flex flex-col sm:flex-row items-center gap-4">
                  {post.songCover ? (
                    <div 
                      className="relative w-16 h-16 rounded-md shadow-lg overflow-hidden group/cover cursor-pointer flex-shrink-0"
                      onClick={post.songPreviewUrl ? togglePlay : undefined}
                    >
                      <img src={post.songCover} alt="Album cover" className="w-full h-full object-cover transition-transform duration-300 group-hover/cover:scale-110" />
                      {post.songPreviewUrl && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity duration-200">
                          {isPlaying ? (
                            <svg className="w-8 h-8 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                            </svg>
                          ) : (
                            <svg className="w-8 h-8 text-white drop-shadow-md ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-md bg-dark-border flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl opacity-50">🎵</span>
                    </div>
                  )}
                  <div className="flex-1 w-full flex flex-col justify-center">
                    <p className="text-sm font-medium text-white line-clamp-1">{post.songName}</p>
                    <p className="text-xs text-white/50 mb-2 line-clamp-1">{post.songArtist}</p>
                    
                    {post.songPreviewUrl ? (
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={togglePlay}
                          className="w-8 h-8 flex-shrink-0 rounded-full bg-primary/20 hover:bg-primary/40 text-primary-light flex items-center justify-center transition-colors"
                        >
                          {isPlaying ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                          ) : (
                            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          )}
                        </button>
                        <div className="flex-1 h-1.5 bg-dark-border rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-primary" 
                            initial={{ width: "0%" }}
                            animate={isPlaying ? { width: "100%" } : { width: "0%" }}
                            transition={{ duration: 30, ease: "linear" }}
                          />
                        </div>
                        <audio 
                          ref={audioRef}
                          src={post.songPreviewUrl} 
                          onEnded={() => setIsPlaying(false)}
                          className="hidden" 
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-white/50 italic">Preview not available</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <motion.button
          onClick={handleLike}
          disabled={isLiking}
          whileTap={{ scale: 0.85 }}
          className="flex items-center gap-2 group/like"
        >
          <motion.span
            animate={liked ? { scale: [1, 1.4, 1] } : {}}
            transition={{ duration: 0.3 }}
            className="text-xl"
          >
            {liked ? '❤️' : '🤍'}
          </motion.span>
          <span className={`text-sm font-body transition-colors ${liked ? 'text-primary' : 'text-white/50 group-hover/like:text-white/70'}`}>
            {likeCount}
          </span>
        </motion.button>

        <motion.button
          onClick={handleDelete}
          disabled={isDeleting}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 text-white/30 hover:text-red-400 transition-colors text-sm font-body opacity-0 group-hover:opacity-100"
        >
          {isDeleting ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
          <span>Delete</span>
        </motion.button>
      </div>

      {/* Full Text Modal */}
      {mounted && createPortal(
        <AnimatePresence>
          {showFullTextModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowFullTextModal(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-gradient-to-br ${typeConfig.gradient} bg-dark-bg border ${typeConfig.border} rounded-2xl p-6 sm:p-8 shadow-2xl relative custom-scrollbar`}
              >
                <button 
                  onClick={() => setShowFullTextModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
                >
                  ✕
                </button>
                
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                  <span className="text-4xl drop-shadow-md">{typeConfig.emoji}</span>
                  <div>
                    <span className="text-sm font-body uppercase tracking-widest text-white/50 block mb-1">
                      {typeConfig.label}
                    </span>
                    <span className="text-xs font-body text-white/40">{timeAgo}</span>
                  </div>
                </div>

                {(post.contentType === 'confession' || post.contentType === 'message') && (
                  <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-2">
                    <p className="text-base font-body text-white/90">
                      <span className="text-white/50 font-medium mr-2 uppercase text-xs tracking-wider">To:</span>
                      {post.toAlias || 'Anyone'}
                    </p>
                    <p className="text-base font-body text-white/90">
                      <span className="text-white/50 font-medium mr-2 uppercase text-xs tracking-wider">From:</span>
                      {post.fromAlias || 'Anonymous'}
                    </p>
                  </div>
                )}

                <p className="font-handwriting text-2xl sm:text-3xl text-white/90 leading-relaxed whitespace-pre-wrap break-words">
                  {post.content}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
}
