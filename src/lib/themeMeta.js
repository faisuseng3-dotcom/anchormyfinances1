/** Mobil adressfält / PWA — samma färg på alla sidor. */
export const THEME_COLORS = {
  personal: '#050d28',
  business: '#0D1B2A',
};

export function getThemeColor(mode) {
  const resolved =
    mode ||
    (typeof document !== 'undefined'
      ? document.documentElement.getAttribute('data-mode')
      : null) ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('anchor_mode') : null) ||
    'personal';
  return THEME_COLORS[resolved] || THEME_COLORS.personal;
}

function setMeta(name, content) {
  if (!content || typeof document === 'undefined') return;
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** Synka theme-color så adressfältet inte blinkar mellan sidor. */
export function syncThemeColor(mode) {
  const color = getThemeColor(mode);
  setMeta('theme-color', color);
  setMeta('msapplication-navbutton-color', color);
}
