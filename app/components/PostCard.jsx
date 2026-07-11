'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import HeartBurst from './HeartBurst';
import { useWall } from './WallContext';

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
  const { userHandle, myPostIds } = useWall();
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

  const isAuthor = (myPostIds && myPostIds.includes(post._id)) || (!post.isAnonymous && post.userHandle && post.userHandle === userHandle);

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
          scale: 1.02,
          rotate: 0,
          transition: { duration: 0.25 },
        }}
        className={`group relative w-full flex flex-col mb-6 sm:mb-8 shadow-[2px_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300 hover:shadow-[4px_8px_25px_rgba(0,0,0,0.2)]`}
        style={{
          backgroundColor: '#f4ebd0',
          borderRadius: '4px',
          transform: `rotate(${rotation}deg)`,
        }}
      >
        {/* Paper texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.08] z-0 mix-blend-multiply rounded-[4px]"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
            backgroundSize: '128px 128px'
          }}
        />

        {/* Pushpin */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-2xl drop-shadow-md z-20 pointer-events-none">
          📍
        </div>

        {/* Card content */}
        <div className="p-5 sm:p-6 flex flex-col flex-1 relative z-10 pt-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl drop-shadow-sm">{post.mood || '💭'}</span>
              {!post.isAnonymous && post.userHandle && (
                <span className="text-sm font-handwriting font-bold text-slate-700 bg-white/30 px-2 py-0.5 rounded shadow-sm border border-slate-300">
                  @{post.userHandle}
                </span>
              )}
            </div>
            <span className="text-xs font-handwriting font-bold text-slate-500">
              {timeAgo}
            </span>
          </div>

          {/* To/From */}
          {(post.contentType === 'confession' || post.contentType === 'message') &&
            (post.toAlias || post.fromAlias) && (
              <div className="mb-4 border-b-2 border-dotted border-slate-400 pb-2 flex flex-col gap-1">
                {post.toAlias && (
                  <p className="text-lg font-handwriting text-slate-800">
                    <span className="text-slate-500 font-bold mr-2 uppercase text-[10px] tracking-wider">
                      To:
                    </span>
                    {post.toAlias}
                  </p>
                )}
                {post.fromAlias && (
                  <p className="text-lg font-handwriting text-slate-800">
                    <span className="text-slate-500 font-bold mr-2 uppercase text-[10px] tracking-wider">
                      From:
                    </span>
                    {post.fromAlias}
                  </p>
                )}
              </div>
            )}

          {/* Content */}
          <div className="flex-1 mb-4"
            style={{
              backgroundImage: `
                   repeating-linear-gradient(
                     transparent,
                     transparent 31px,
                     rgba(0, 0, 0, 0.12) 31px,
                     rgba(0, 0, 0, 0.12) 32px
                   )
                 `,
              backgroundAttachment: 'local',
              backgroundPosition: '0 4px',
            }}
          >
            <p className="font-handwriting text-[22px] sm:text-[24px] text-slate-800 leading-relaxed whitespace-pre-wrap break-words"
              style={{ lineHeight: '32px' }}>
              {displayText}
            </p>
            {isLongText && (
              <button
                onClick={() => setShowFullTextModal(true)}
                className="mt-2 text-sm font-handwriting text-teal-600 hover:text-teal-800 transition-colors font-bold bg-white/50 px-2 py-1 rounded shadow-sm"
              >
                Read more →
              </button>
            )}
          </div>

          {/* Song Attachment */}
          {post.songId && (
            <div className="mb-4 border-t border-slate-300 pt-3">
              <button
                onClick={() => setShowEmbed(!showEmbed)}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors text-sm font-handwriting font-bold"
              >
                {post.songCover ? (
                  <img
                    src={post.songCover}
                    alt="Cover"
                    className="w-6 h-6 rounded shadow-sm object-cover flex-shrink-0"
                  />
                ) : (
                  <span className="text-base drop-shadow-sm">🎵</span>
                )}
                <span className="truncate max-w-[150px]">
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
                    <div className="bg-[#fefce8] border border-slate-300 shadow-inner rounded-xl p-3 flex items-center gap-3">
                      {post.songCover ? (
                        <div
                          className="relative w-12 h-12 rounded-lg shadow-sm overflow-hidden group/cover cursor-pointer flex-shrink-0 border border-slate-300"
                          onClick={post.songPreviewUrl ? togglePlay : undefined}
                        >
                          <img
                            src={post.songCover}
                            alt="Album cover"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover/cover:scale-110"
                          />
                          {post.songPreviewUrl && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity duration-200">
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
                        <div className="w-12 h-12 rounded-lg bg-white/50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-xl opacity-60">🎵</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-handwriting font-bold text-slate-800 truncate">
                          {post.songName}
                        </p>
                        <p className="text-xs font-handwriting text-slate-500 truncate mb-1.5">
                          {post.songArtist}
                        </p>
                        {post.songPreviewUrl ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={togglePlay}
                              className="w-6 h-6 flex-shrink-0 rounded-full bg-teal-100 hover:bg-teal-200 text-teal-700 flex items-center justify-center transition-colors shadow-sm"
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
                            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                              <motion.div
                                className="h-full bg-teal-400"
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
                          <p className="text-[10px] font-handwriting text-slate-400 italic">
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
          <div className="flex items-center justify-between pt-3 border-t border-slate-300">
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
                className="text-xl drop-shadow-sm"
              >
                {liked ? '❤️' : '🤍'}
              </motion.span>
              <span
                className={`text-sm font-handwriting font-bold tabular-nums transition-colors ${liked
                    ? 'text-red-500'
                    : 'text-slate-500 group-hover/like:text-slate-800'
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
              className="text-slate-400 hover:text-slate-700 transition-colors"
              title="Copy link"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </button>

            {/* Delete */}
            {isAuthor && (
              <motion.button
                onClick={handleDelete}
                disabled={isDeleting}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                {isDeleting ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                )}
              </motion.button>
            )}
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
                  className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
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
                    className={`w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#f4ebd0] rounded shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative`}
                  >
                    {/* Paper texture overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-[0.08] z-0 mix-blend-multiply"
                      style={{
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
                        backgroundSize: '128px 128px'
                      }}
                    />

                    <div className="relative z-10 p-6 sm:p-10 pt-12">
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-3xl drop-shadow-md z-20 pointer-events-none">
                        📍
                      </div>

                      <button
                        onClick={() => setShowFullTextModal(false)}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-200/50 flex items-center justify-center text-slate-600 hover:text-slate-800 hover:bg-slate-300 transition-all z-20"
                      >
                        ✕
                      </button>

                      <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-dotted border-slate-400">
                        <span className="text-4xl drop-shadow-sm">{post.mood || '💭'}</span>
                        <div>
                          {!post.isAnonymous && post.userHandle && (
                            <span className="text-sm font-handwriting font-bold text-slate-700 bg-white/40 px-2 rounded shadow-sm border border-slate-300 block w-fit mb-1">
                              @{post.userHandle}
                            </span>
                          )}
                          <span className="text-xs font-handwriting font-bold text-slate-500">
                            {timeAgo}
                          </span>
                        </div>
                      </div>

                      {(post.contentType === 'confession' ||
                        post.contentType === 'message') &&
                        (post.toAlias || post.fromAlias) && (
                          <div className="mb-6 p-4 bg-white/30 rounded border border-slate-300 flex flex-col gap-2 shadow-sm">
                            {post.toAlias && (
                              <p className="text-xl font-handwriting text-slate-800">
                                <span className="text-slate-500 font-bold mr-2 uppercase text-xs tracking-wider">
                                  To:
                                </span>
                                {post.toAlias}
                              </p>
                            )}
                            {post.fromAlias && (
                              <p className="text-xl font-handwriting text-slate-800">
                                <span className="text-slate-500 font-bold mr-2 uppercase text-xs tracking-wider">
                                  From:
                                </span>
                                {post.fromAlias}
                              </p>
                            )}
                          </div>
                        )}

                      <div
                        style={{
                          backgroundImage: 'linear-gradient(to bottom, transparent 35px, rgba(0, 0, 0, 0.12) 35px)',
                          backgroundSize: '100% 36px',
                          backgroundAttachment: 'local',
                          backgroundPosition: '0 0',
                        }}
                      >
                        <p className="font-handwriting text-2xl sm:text-3xl text-slate-800 leading-relaxed whitespace-pre-wrap break-words"
                          style={{ lineHeight: '36px' }}>
                          {post.content}
                        </p>
                      </div>
                    </div>
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
