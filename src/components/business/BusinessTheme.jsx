import { useEffect } from 'react';
import { useModeContext } from '@/components/modes/ModeContext';

// Injects business CSS variables when mode === 'business'
export default function BusinessTheme() {
  const { isBusiness } = useModeContext();

  useEffect(() => {
    const root = document.documentElement;
    if (isBusiness) {
      root.style.setProperty('--color-background-primary', '#0D1B2A');
      root.style.setProperty('--color-background-secondary', '#0f2030');
      root.style.setProperty('--color-surface', '#162535');
      root.style.setProperty('--color-card', '#1A2B3C');
      root.style.setProperty('--color-accent', '#D4AF37');
      root.style.setProperty('--color-accent-hover', '#B8962E');
      root.style.setProperty('--color-success', '#34A86A');
      root.style.setProperty('--color-danger', '#C94040');
      root.style.setProperty('--color-warning', '#D4AF37');
      root.style.setProperty('--color-text-primary', '#F0EAD6');
      root.style.setProperty('--color-text-secondary', '#9BADB8');
      root.style.setProperty('--color-text-muted', '#5A7285');
    } else {
      root.style.setProperty('--color-background-primary', '#0F1724');
      root.style.setProperty('--color-background-secondary', '#141E2E');
      root.style.setProperty('--color-surface', '#1C2B3F');
      root.style.setProperty('--color-card', '#1E2D42');
      root.style.setProperty('--color-accent', '#4B7CF3');
      root.style.setProperty('--color-accent-hover', '#3A6ADE');
      root.style.setProperty('--color-success', '#3DAA7A');
      root.style.setProperty('--color-danger', '#D95F5F');
      root.style.setProperty('--color-warning', '#C8923A');
      root.style.setProperty('--color-text-primary', '#EDF0F5');
      root.style.setProperty('--color-text-secondary', '#8B97A8');
      root.style.setProperty('--color-text-muted', '#5C6B7D');
    }
  }, [isBusiness]);

  return null;
}