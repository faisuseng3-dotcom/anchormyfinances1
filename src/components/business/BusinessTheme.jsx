import { useEffect } from 'react';
import { useModeContext } from '@/components/modes/ModeContext';

// Personal mode uses the base tokens defined in index.css :root — nothing to
// inject. Business mode gets one deliberate variation (gold accent, same
// neutral-black family) to read as a distinct tier without introducing a
// second unrelated color system.
const BUSINESS_OVERRIDES = {
  '--color-background-primary': '#0d0f0c',
  '--color-background-secondary': 'rgba(16, 18, 15, 0.9)',
  '--color-surface': 'rgba(255, 255, 255, 0.05)',
  '--color-card': 'rgba(255, 255, 255, 0.04)',
  '--color-accent': '#c9a24b',
  '--color-accent-hover': '#d9b25c',
  '--color-success': '#4fae82',
  '--color-danger': '#e2857a',
  '--color-warning': '#c9a24b',
  '--color-text-primary': 'rgba(255, 255, 255, 0.95)',
  '--color-text-secondary': 'rgba(255, 255, 255, 0.62)',
  '--color-text-muted': 'rgba(255, 255, 255, 0.38)',
};

export default function BusinessTheme() {
  const { isBusiness } = useModeContext();

  useEffect(() => {
    const root = document.documentElement;
    const keys = Object.keys(BUSINESS_OVERRIDES);
    if (isBusiness) {
      keys.forEach((key) => root.style.setProperty(key, BUSINESS_OVERRIDES[key]));
    } else {
      keys.forEach((key) => root.style.removeProperty(key));
    }
  }, [isBusiness]);

  return null;
}