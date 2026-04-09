import React, { createContext, useContext, useState, useEffect } from 'react';

const ModeContext = createContext(null);

export function ModeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('anchor_mode') || 'personal';
  });

  const toggleMode = () => {
    const next = mode === 'personal' ? 'business' : 'personal';
    setMode(next);
    localStorage.setItem('anchor_mode', next);
  };

  const setPersonal = () => { setMode('personal'); localStorage.setItem('anchor_mode', 'personal'); };
  const setBusiness = () => { setMode('business'); localStorage.setItem('anchor_mode', 'business'); };

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode);
  }, [mode]);

  return (
    <ModeContext.Provider value={{ mode, toggleMode, setPersonal, setBusiness, isBusiness: mode === 'business' }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useModeContext() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error('useModeContext must be used within ModeProvider');
  return ctx;
}