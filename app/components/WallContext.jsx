'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const WallContext = createContext(null);

export function WallProvider({ children }) {
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [userHandle, setUserHandle] = useState('');
  const [activeMood, setActiveMood] = useState('all');
  const [posts, setPosts] = useState([]);
  const confettiRef = useRef(null);

  // Load persisted state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('freedom-wall-prefs');
      if (saved) {
        const prefs = JSON.parse(saved);
        if (typeof prefs.isAnonymous === 'boolean') setIsAnonymous(prefs.isAnonymous);
        if (prefs.userHandle) setUserHandle(prefs.userHandle);
      }
    } catch (e) {
      // Ignore parse errors
    }
  }, []);

  // Persist preferences
  useEffect(() => {
    try {
      localStorage.setItem(
        'freedom-wall-prefs',
        JSON.stringify({ isAnonymous, userHandle })
      );
    } catch (e) {
      // Ignore storage errors
    }
  }, [isAnonymous, userHandle]);

  const triggerConfetti = useCallback(() => {
    if (confettiRef.current) {
      confettiRef.current();
    }
  }, []);

  const setConfettiTrigger = useCallback((fn) => {
    confettiRef.current = fn;
  }, []);

  const addPost = useCallback((newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  }, []);

  const removePost = useCallback((postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  }, []);

  const updatePostLike = useCallback((postId, data) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId ? { ...p, likes: data.likes } : p
      )
    );
  }, []);

  return (
    <WallContext.Provider
      value={{
        isAnonymous,
        setIsAnonymous,
        userHandle,
        setUserHandle,
        activeMood,
        setActiveMood,
        posts,
        setPosts,
        addPost,
        removePost,
        updatePostLike,
        triggerConfetti,
        setConfettiTrigger,
      }}
    >
      {children}
    </WallContext.Provider>
  );
}

export function useWall() {
  const context = useContext(WallContext);
  if (!context) {
    throw new Error('useWall must be used within a WallProvider');
  }
  return context;
}
