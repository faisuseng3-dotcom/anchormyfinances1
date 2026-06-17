/**
 * Base44 editor/preview runs the app in a sandboxed iframe. Using 100vh + fixed
 * bottom nav often places the bar below the visible iframe area. Embedded mode
 * uses a full-height flex column with the nav in document flow.
 */
export function isEmbeddedApp() {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export function initEmbeddedLayout() {
  document.documentElement.classList.add('anchor-fixed-viewport');
  if (!isEmbeddedApp()) return;
  document.documentElement.classList.add('anchor-embedded');
}
