'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Masonry from 'react-masonry-css';
import PostCard from './PostCard';
import { useWall } from './WallContext';

export default function Feed({ mood = 'all' }) {
  const { posts, setPosts } = useWall();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);
  const currentMoodRef = useRef(mood);

  const fetchPosts = useCallback(async (pageNum, reset = false) => {
    if (loading && !reset) return;
    setLoading(true);

    try {
      const moodParam = mood !== 'all' ? `&mood=${encodeURIComponent(mood)}` : '';
      const res = await fetch(`/api/posts?page=${pageNum}&limit=12${moodParam}`);
      const data = await res.json();

      if (res.ok) {
        setPosts((prev) => {
          if (reset) return data.posts;
          const existingIds = new Set(prev.map((p) => p._id));
          const newPosts = data.posts.filter((p) => !existingIds.has(p._id));
          return [...prev, ...newPosts];
        });
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood, setPosts]);

  // Initial load + mood change
  useEffect(() => {
    if (currentMoodRef.current !== mood) {
      currentMoodRef.current = mood;
      setPage(1);
    }
    setInitialLoading(true);
    fetchPosts(1, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood]);

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => {
            const nextPage = prev + 1;
            fetchPosts(nextPage);
            return nextPage;
          });
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasMore, loading, fetchPosts]);

  const handleDelete = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  const handleLike = (postId, data) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId ? { ...p, likes: data.likes } : p
      )
    );
  };

  // Initial loading state
  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="w-14 h-14 border-2 border-dark-border rounded-full animate-spin border-t-neon-cyan" />
          <div
            className="absolute inset-0 w-14 h-14 border-2 border-transparent rounded-full animate-spin border-b-neon-magenta"
            style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
          />
        </div>
        <p className="mt-6 text-white/30 font-body text-sm animate-pulse">
          Loading the wall...
        </p>
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-5xl mb-6"
        >
          🌙
        </motion.div>
        <h3 className="font-display text-xl text-white/60 mb-2">
          {mood !== 'all' ? 'No posts with this mood yet' : 'The wall awaits your words'}
        </h3>
        <p className="text-white/25 font-body text-sm max-w-md">
          {mood !== 'all'
            ? 'Be the first to share your thoughts with this mood.'
            : 'Be the first to share your thoughts, confessions, or feelings. Your anonymity is guaranteed.'}
        </p>
      </motion.div>
    );
  }

  const breakpointColumnsObj = {
    default: 3,
    1100: 3,
    768: 2,
    500: 1,
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="popLayout">
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="masonry-grid"
          columnClassName="masonry-grid-column"
        >
          {posts.map((post, index) => (
            <PostCard
              key={post._id}
              post={post}
              index={index}
              onLike={handleLike}
              onDelete={handleDelete}
            />
          ))}
        </Masonry>
      </AnimatePresence>

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="py-6">
        {loading && (
          <div className="flex justify-center">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-dark-border rounded-full animate-spin border-t-neon-cyan" />
              <span className="text-white/25 text-xs font-body">Loading more...</span>
            </div>
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-white/15 text-xs font-body py-4"
          >
            ✨ You&apos;ve reached the beginning ✨
          </motion.p>
        )}
      </div>
    </div>
  );
}
