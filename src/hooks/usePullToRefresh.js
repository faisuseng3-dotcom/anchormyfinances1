import { useRef, useState, useCallback, useEffect } from 'react';

const THRESHOLD = 72;   // px to pull before triggering
const MAX_PULL  = 100;  // px max visual drag

/**
 * Pull-to-refresh for mobile.
 * Returns { containerRef, pullDistance, isRefreshing } — attach containerRef
 * to the scrollable container.
 *
 * @param {() => Promise<void>} onRefresh  async function to call on release
 */
export function usePullToRefresh(onRefresh) {
  const containerRef = useRef(null);
  const startYRef    = useRef(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleTouchStart = useCallback((e) => {
    const el = containerRef.current;
    if (!el || el.scrollTop > 0) return;
    startYRef.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e) => {
    const el = containerRef.current;
    if (!el || el.scrollTop > 0 || isRefreshing) return;
    const delta = e.touches[0].clientY - startYRef.current;
    if (delta <= 0) return;
    // rubber-band resistance
    const dist = Math.min(MAX_PULL, delta * 0.45);
    setPullDistance(dist);
  }, [isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(0);
      try {
        await onRefresh?.();
      } finally {
        setIsRefreshing(false);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, isRefreshing, onRefresh]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove',  handleTouchMove,  { passive: true });
    el.addEventListener('touchend',   handleTouchEnd,   { passive: true });
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove',  handleTouchMove);
      el.removeEventListener('touchend',   handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { containerRef, pullDistance, isRefreshing };
}
