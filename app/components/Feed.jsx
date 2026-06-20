'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Masonry from 'react-masonry-css';
import PostCard from './PostCard';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  const fetchPosts = useCallback(async (pageNum, reset = false) => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/posts?page=${pageNum}&limit=9`);
      const data = await res.json();

      if (res.ok) {
        setPosts((prev) => {
          if (reset) return data.posts;
          // Avoid duplicates
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
  }, [loading]);

  // Initial load
  useEffect(() => {
    fetchPosts(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



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
          <div className="w-16 h-16 border-4 border-dark-border rounded-full animate-spin border-t-primary" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-spin border-b-secondary" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
        <p className="mt-6 text-white/50 font-body text-sm animate-pulse">Loading confessions...</p>
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
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-6xl mb-6"
        >
          🌙
        </motion.div>
        <h3 className="font-display text-2xl text-white/80 mb-2">
          The wall awaits your words
        </h3>
        <p className="text-white/40 font-body max-w-md">
          Be the first to share your thoughts, confessions, or feelings. 
          Your anonymity is guaranteed.
        </p>
      </motion.div>
    );
  }

  const breakpointColumnsObj = {
    default: 3,
    1024: 3,
    768: 2,
    640: 1
  };

  return (
    <div className="w-full">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex w-auto -ml-4 sm:-ml-6"
        columnClassName="pl-4 sm:pl-6 bg-clip-padding"
      >
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onLike={handleLike}
            onDelete={handleDelete}
          />
        ))}
      </Masonry>

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="py-4">
        {loading && (
          <div className="flex justify-center">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-dark-border rounded-full animate-spin border-t-primary" />
              <span className="text-white/40 text-sm font-body">Loading more...</span>
            </div>
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-white/30 text-sm font-body py-4"
          >
            ✨ You&apos;ve reached the beginning ✨
          </motion.p>
        )}
      </div>
    </div>
  );
}
