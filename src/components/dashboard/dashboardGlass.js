/**
 * Shared Revolut-style surfaces for the dark dashboard.
 * Keeps cards soft, rounded, and consistent without neon “template” chrome.
 */
export function dashboardGlassSurface(overrides = {}) {
  return {
    background:
      'linear-gradient(165deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 38%, rgba(6,14,32,0.78) 100%)',
    backdropFilter: 'blur(22px)',
    WebkitBackdropFilter: 'blur(22px)',
    border: '1px solid rgba(255,255,255,0.14)',
    boxShadow:
      '0 22px 48px rgba(2, 8, 26, 0.42), inset 0 1px 0 rgba(255,255,255,0.08)',
    ...overrides,
  };
}

export const dashboardSectionLabelClass =
  'text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45';
