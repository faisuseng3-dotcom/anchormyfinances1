import { getTotalFixedCosts } from '@/lib/financialUtils';

/** Profil har tillräcklig data för personliga råd (samma krav som dashboard). */
export function hasAdvisorProfileData(profile) {
  if (!profile) return false;
  const income = Number(profile.income);
  return Number.isFinite(income) && income > 0;
}

/** Demo/Alex — servern har ingen motsvarande rad i databasen. */
export function isLocalAdvisorProfile(profile, isDemoMode = false) {
  return Boolean(isDemoMode || profile?._alexMode);
}

export function getAdvisorIncome(profile) {
  return Math.round(Number(profile?.income) || 0);
}

export function getAdvisorMargin(profile) {
  if (!profile) return 0;
  return getAdvisorIncome(profile) - getTotalFixedCosts(profile);
}
