'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { generateFingerprint, getCookie } from '../utils/fingerprint';

/**
 * VisitorTracker — Silent client-side tracking component.
 * 
 * Renders nothing. On every page load/navigation:
 * 1. Generates a browser fingerprint
 * 2. Reads _fbp / _fbc cookies (if Meta Pixel sets them)
 * 3. Sends tracking data to /api/visitors/track
 * 4. Sends heartbeat every 30 seconds
 * 5. Sends beacon on page unload to end session
 */
export default function VisitorTracker() {
  const pathname = usePathname();
  const fingerprintRef = useRef(null);
  const heartbeatRef = useRef(null);
  const hasTrackedRef = useRef(false);
  const lastPathRef = useRef(null);

  const sendTrack = useCallback(async (fp) => {
    try {
      await fetch('/api/visitors/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fingerprintId: fp.fingerprintId,
          screenRes: fp.screenRes,
          language: fp.language,
          timezone: fp.timezone,
          referrer: document.referrer || null,
          currentPath: window.location.pathname,
          currentTitle: document.title || '',
          fbpCookie: getCookie('_fbp'),
          fbcCookie: getCookie('_fbc'),
        }),
      });
    } catch {
      // Silent fail — don't disrupt the user experience
    }
  }, []);

  const sendHeartbeat = useCallback(async () => {
    if (!fingerprintRef.current) return;
    try {
      await fetch('/api/visitors/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fingerprintId: fingerprintRef.current.fingerprintId,
          currentPath: window.location.pathname,
          currentTitle: document.title || '',
        }),
      });
    } catch {
      // Silent fail
    }
  }, []);

  // Initial tracking on mount
  useEffect(() => {
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;

    (async () => {
      try {
        const fp = await generateFingerprint();
        fingerprintRef.current = fp;
        lastPathRef.current = pathname;
        await sendTrack(fp);
      } catch {
        // Silent fail
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Track page navigation (SPA route changes)
  useEffect(() => {
    if (!fingerprintRef.current) return;
    if (pathname === lastPathRef.current) return;
    
    lastPathRef.current = pathname;
    sendTrack(fingerprintRef.current);
  }, [pathname, sendTrack]);

  // Heartbeat interval
  useEffect(() => {
    heartbeatRef.current = setInterval(sendHeartbeat, 30000);
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, [sendHeartbeat]);

  // Beacon on page unload (mark offline)
  useEffect(() => {
    const handleUnload = () => {
      if (!fingerprintRef.current) return;
      
      const data = JSON.stringify({
        fingerprintId: fingerprintRef.current.fingerprintId,
      });

      // navigator.sendBeacon is the most reliable way to send data on unload
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          '/api/visitors/heartbeat',
          new Blob([data], { type: 'application/json' })
        );
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  // This component renders nothing — it's purely a tracking script
  return null;
}
