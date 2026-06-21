'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import HeartBurst from './HeartBurst';

const MOOD_STYLES = {
  '🔥': { gradient: 'from-orange-500/10 to-red-500/10', border: 'border-orange-500/15', glow: 'rgba(255,100,50,0.12)' },
  '💡': { gradient: 'from-yellow-500/10 to-amber-500/10', border: 'border-yellow-500/15', glow: 'rgba(255,230,0,0.12)' },
  '🤔': { gradient: 'from-cyan-500/10 to-blue-500/10', border: 'border-cyan-500/15', glow: 'rgba(0,240,255,0.12)' },
  '🌊': { gradient: 'from-blue-400/10 to-indigo-500/10', border: 'border-blue-400/15', glow: 'rgba(100,180,255,0.12)' },
  '💕': { gradient: 'from-pink-500/10 to-rose-500/10', border: 'border-pink-500/15', glow: 'rgba(255,0,127,0.12)' },
  '😤': { gradient: 'from-red-500/10 to-orange-600/10', border: 'border-red-500/15', glow: 'rgba(255,50,20,0.12)' },
  '💭': { gradient: 'from-violet-500/10 to-purple-500/10', border: 'border-violet-500/15', glow: 'rgba(140,100,255,0.12)' },
};

// Consistent random values per post ID
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash;
}

export default function PostCard({ post, onLike, onDelete, index = 0 }) {
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [showFullTextModal, setShowFullTextModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const likeButtonRef = useRef(null);
  const heartBurst = HeartBurst({ originRef: likeButtonRef });

  useEffect(() => setMounted(true), []);

  // Generate consistent random values from post ID
  const { rotation, textureOpacity, entryDelay } = useMemo(() => {
    const hash = hashCode(post._id || '');
    return {
      rotation: ((hash % 10) - 5) * 0.15,
      textureOpacity: 0.015 + (Math.abs(hash % 20) / 1000),
      entryDelay: Math.min(index * 0.06, 0.5),
    };
  }, [post._id, index]);

  const moodStyle = MOOD_STYLES[post.mood] || MOOD_STYLES['💭'];

  const maxLength = 180;
  const isLongText = post.content.length > maxLength;
  const displayText = isLongText
    ? post.content.substring(0, maxLength).trim() + '...'
    : post.content;

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

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    heartBurst.trigger();
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
    <>
      {heartBurst.element}
      <motion.div
        layout
        initial={{ opacity: 0, y: -30, scale: 0.92, rotate: rotation * 3 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate: rotation }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{
          type: 'spring',
          stiffness: 350,
          damping: 25,
          delay: entryDelay,
        }}
        whileHover={{
          y: -6,
          scale: 1.01,
          transition: { duration: 0.25 },
        }}
        className={`group relative w-full flex flex-col mb-4 sm:mb-5 rounded-2xl overflow-hidden paper-texture bg-gradient-to-br ${moodStyle.gradient} border ${moodStyle.border} transition-shadow duration-300 hover:shadow-lg`}
        style={{
          transform: `rotate(${rotation}deg)`,
          ['--card-glow']: moodStyle.glow,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 8px 32px ${moodStyle.glow}, 0 0 20px ${moodStyle.glow}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '';
        }}
      >
        {/* Card content */}
        <div className="p-5 sm:p-6 flex flex-col flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{post.mood || '💭'}</span>
              {!post.isAnonymous && post.userHandle && (
                <span className="text-xs font-body text-white/40 bg-white/[0.04] px-2 py-0.5 rounded-full">
                  @{post.userHandle}
                </span>
              )}
            </div>
            <span className="text-[11px] font-body text-white/25 tabular-nums">
              {timeAgo}
            </span>
          </div>

          {/* To/From (for old confession/message posts) */}
          {(post.contentType === 'confession' || post.contentType === 'message') &&
            (post.toAlias || post.fromAlias) && (
              <div className="mb-3 p-2.5 bg-white/[0.03] rounded-xl border border-white/[0.05] flex flex-col gap-0.5">
                {post.toAlias && (
                  <p className="text-sm font-body text-white/70">
                    <span className="text-white/30 font-medium mr-1.5 uppercase text-[10px] tracking-wider">
                      To:
                    </span>
                    {post.toAlias}
                  </p>
                )}
                {post.fromAlias && (
                  <p className="text-sm font-body text-white/70">
                    <span className="text-white/30 font-medium mr-1.5 uppercase text-[10px] tracking-wider">
                      From:
                    </span>
                    {post.fromAlias}
                  </p>
                )}
              </div>
            )}

          {/* Content */}
          <div className="flex-1 mb-4">
            <p className="font-handwriting text-xl sm:text-2xl text-white/85 leading-relaxed whitespace-pre-wrap break-words">
              {displayText}
            </p>
            {isLongText && (
              <button
                onClick={() => setShowFullTextModal(true)}
                className="mt-2 text-sm font-body text-neon-cyan/70 hover:text-neon-cyan transition-colors font-medium"
              >
                Read more →
              </button>
            )}
          </div>

          {/* Song Attachment */}
          {post.songId && (
            <div className="mb-3">
              <button
                onClick={() => setShowEmbed(!showEmbed)}
                className="flex items-center gap-2 text-neon-cyan/60 hover:text-neon-cyan/80 transition-colors text-sm font-body"
              >
                {post.songCover ? (
                  <img
                    src={post.songCover}
                    alt="Cover"
                    className="w-5 h-5 rounded shadow-sm object-cover flex-shrink-0"
                  />
                ) : (
                  <span className="text-base">🎵</span>
                )}
                <span className="font-medium truncate max-w-[150px]">
                  {post.songName}
                </span>
                <motion.svg
                  className="w-3 h-3 ml-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ rotate: showEmbed ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
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
                    <div className="bg-dark-bg/40 border border-white/[0.06] rounded-xl p-3 flex items-center gap-3">
                      {post.songCover ? (
                        <div
                          className="relative w-12 h-12 rounded-lg shadow-lg overflow-hidden group/cover cursor-pointer flex-shrink-0"
                          onClick={post.songPreviewUrl ? togglePlay : undefined}
                        >
                          <img
                            src={post.songCover}
                            alt="Album cover"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover/cover:scale-110"
                          />
                          {post.songPreviewUrl && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity duration-200">
                              {isPlaying ? (
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                          <span className="text-xl opacity-40">🎵</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white/80 truncate">
                          {post.songName}
                        </p>
                        <p className="text-xs text-white/35 truncate mb-1.5">
                          {post.songArtist}
                        </p>
                        {post.songPreviewUrl ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={togglePlay}
                              className="w-6 h-6 flex-shrink-0 rounded-full bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan flex items-center justify-center transition-colors"
                            >
                              {isPlaying ? (
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                </svg>
                              ) : (
                                <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              )}
                            </button>
                            <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-neon-cyan/50"
                                initial={{ width: '0%' }}
                                animate={isPlaying ? { width: '100%' } : { width: '0%' }}
                                transition={{ duration: 30, ease: 'linear' }}
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
                          <p className="text-[10px] text-white/25 italic">
                            Preview not available
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
            <motion.button
              ref={likeButtonRef}
              onClick={handleLike}
              disabled={isLiking}
              whileTap={{ scale: 0.8 }}
              className="flex items-center gap-1.5 group/like"
            >
              <motion.span
                animate={liked ? { scale: [1, 1.5, 1] } : {}}
                transition={{ duration: 0.3 }}
                className="text-lg"
              >
                {liked ? '❤️' : '🤍'}
              </motion.span>
              <span
                className={`text-xs font-body tabular-nums transition-colors ${
                  liked
                    ? 'text-neon-magenta'
                    : 'text-white/30 group-hover/like:text-white/50'
                }`}
              >
                {likeCount}
              </span>
            </motion.button>

            {/* Share */}
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
              }}
              className="text-white/20 hover:text-white/40 transition-colors"
              title="Copy link"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </button>

            {/* Delete */}
            <motion.button
              onClick={handleDelete}
              disabled={isDeleting}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1 text-white/15 hover:text-red-400/70 transition-colors text-xs font-body opacity-0 group-hover:opacity-100"
            >
              {isDeleting ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              )}
            </motion.button>
          </div>
        </div>

        {/* Full Text Modal */}
        {mounted &&
          createPortal(
            <AnimatePresence>
              {showFullTextModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFullTextModal(false);
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.92, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.92, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className={`w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-gradient-to-br ${moodStyle.gradient} bg-dark-card border ${moodStyle.border} rounded-2xl p-6 sm:p-8 shadow-2xl relative`}
                    style={{
                      boxShadow: `0 0 40px ${moodStyle.glow}, 0 25px 50px rgba(0,0,0,0.5)`,
                    }}
                  >
                    <button
                      onClick={() => setShowFullTextModal(false)}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.1] transition-all"
                    >
                      ✕
                    </button>

                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/[0.06]">
                      <span className="text-4xl">{post.mood || '💭'}</span>
                      <div>
                        {!post.isAnonymous && post.userHandle && (
                          <span className="text-xs font-body text-white/40 block mb-1">
                            @{post.userHandle}
                          </span>
                        )}
                        <span className="text-xs font-body text-white/25">
                          {timeAgo}
                        </span>
                      </div>
                    </div>

                    {(post.contentType === 'confession' ||
                      post.contentType === 'message') &&
                      (post.toAlias || post.fromAlias) && (
                        <div className="mb-6 p-4 bg-white/[0.03] rounded-xl border border-white/[0.06] flex flex-col gap-2">
                          {post.toAlias && (
                            <p className="text-base font-body text-white/80">
                              <span className="text-white/35 font-medium mr-2 uppercase text-xs tracking-wider">
                                To:
                              </span>
                              {post.toAlias}
                            </p>
                          )}
                          {post.fromAlias && (
                            <p className="text-base font-body text-white/80">
                              <span className="text-white/35 font-medium mr-2 uppercase text-xs tracking-wider">
                                From:
                              </span>
                              {post.fromAlias}
                            </p>
                          )}
                        </div>
                      )}

                    <p className="font-handwriting text-2xl sm:text-3xl text-white/85 leading-relaxed whitespace-pre-wrap break-words">
                      {post.content}
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )}
      </motion.div>
    </>
  );
}
