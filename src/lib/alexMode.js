/**
 * Alex Mode — Global trigger & state manager
 * Shortcut: Cmd + § (eller Cmd + ` på Mac-tangentbord)
 * Injektionen sker synkront (<100ms) utan API-anrop.
 */

import { ALEX_PROFILE, ALEX_TRANSACTIONS } from './alexDemoData';

const STORAGE_KEY = 'anchor_alex_mode';

export function isAlexMode() {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function activateAlexMode() {
  localStorage.setItem(STORAGE_KEY, 'true');
  // Tvinga personal-only mode, göm business-fliken
  localStorage.setItem('anchor_mode', 'personal');
  localStorage.removeItem('anchor_biz_mode');
  // Tvinga MLI till 72
  localStorage.setItem('anchor_alex_mli', '72');
  // Dispatcha event så alla lyssnare reagerar omedelbart
  window.dispatchEvent(new CustomEvent('anchor:alex_mode', { detail: { active: true } }));
}

export function deactivateAlexMode() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('anchor_alex_mli');
  window.dispatchEvent(new CustomEvent('anchor:alex_mode', { detail: { active: false } }));
}

export function toggleAlexMode() {
  if (isAlexMode()) {
    deactivateAlexMode();
  } else {
    activateAlexMode();
  }
}

/**
 * Registrerar den globala tangentbordsgenvägen Cmd+§.
 * §-tangenten mappar till keyCode 167 på svenska tangentbord, eller key '§'.
 * Returnerar en cleanup-funktion.
 */
export function registerAlexModeShortcut(onToggle) {
  const handler = (e) => {
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    const modKey = isMac ? e.metaKey : e.ctrlKey;
    // § = keyCode 167 eller key '§' / '`'
    const isSection = e.key === '§' || e.key === '`' || e.keyCode === 167;
    if (modKey && isSection) {
      e.preventDefault();
      onToggle();
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}

export { ALEX_PROFILE, ALEX_TRANSACTIONS };