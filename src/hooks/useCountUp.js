import { useEffect, useRef, useState } from 'react';

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Animerar ett tal mot ett nytt värde istället för att byta det direkt. */
export function useCountUp(target, duration = 700) {
  const [display, setDisplay] = useState(target);
  const displayRef = useRef(target);
  const rafRef = useRef(null);

  useEffect(() => {
    const from = displayRef.current;
    if (from === target || prefersReducedMotion()) {
      displayRef.current = target;
      setDisplay(target);
      return;
    }

    const start = performance.now();
    cancelAnimationFrame(rafRef.current);

    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const value = Math.round(from + (target - from) * easeOutCubic(t));
      displayRef.current = value;
      setDisplay(value);
      if (t < 1) rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return display;
}
