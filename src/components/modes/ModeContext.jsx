import React, { createContext, useContext, useState, useEffect } from 'react';
import { syncThemeColor } from '@/lib/themeMeta';

const ModeContext = createContext(null);

export function ModeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    // Alex Mode tvingar personal
    if (localStorage.getItem('anchor_alex_mode') === 'true') return 'personal';
    return localStorage.getItem('anchor_mode') || 'personal';
  });

  // Lyssna på Alex Mode-events för att låsa till personal
  useEffect(() => {
    const handler = (e) => {
      if (e.detail.active) {
        setMode('personal');
        localStorage.setItem('anchor_mode', 'personal');
      }
    };
    window.addEventListener('anchor:alex_mode', handler);
    return () => window.removeEventListener('anchor:alex_mode', handler);
  }, []);

  const isAlexLocked = localStorage.getItem('anchor_alex_mode') === 'true';

  /** In-app byte är avstängt — välj instans på landningssidan efter utloggning. */
  const toggleMode = () => {};

  const setPersonal = () => { setMode('personal'); localStorage.setItem('anchor_mode', 'personal'); };
  const setBusiness = () => {
    if (isAlexLocked) return;
    setMode('business');
    localStorage.setItem('anchor_mode', 'business');
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode);
    syncThemeColor(mode);
  }, [mode]);

  return (
    <ModeContext.Provider value={{ mode, toggleMode, setPersonal, setBusiness, isBusiness: mode === 'business', isPersonalLocked: isAlexLocked }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useModeContext() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error('useModeContext must be used within ModeProvider');
  return ctx;
}