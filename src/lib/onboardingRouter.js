/**
 * En väg in till onboarding — privat vs företag styrs av anchor_mode.
 */

export function getStoredMode() {
  if (typeof window === 'undefined') return 'personal';
  return localStorage.getItem('anchor_mode') || 'personal';
}

export function isBusinessMode(mode = getStoredMode()) {
  return mode === 'business';
}

export function isBusinessOnboarded() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('anchor_biz_onboarded') === 'true';
}

export function getOnboardingPath(mode = getStoredMode()) {
  return isBusinessMode(mode) ? '/BusinessOnboarding' : '/Onboarding';
}

export function getDashboardPath(mode = getStoredMode()) {
  return isBusinessMode(mode) ? '/BusinessDashboard' : '/Dashboard';
}

/** Säkerställ rätt instans innan onboarding startar. */
export function ensureOnboardingMode(expected) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('anchor_mode', expected);
  document.documentElement.setAttribute('data-mode', expected);
}
