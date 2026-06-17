import { base44 } from '@/api/base44Client';
import { getDashboardPath } from '@/lib/onboardingRouter';
import { isBusinessUserType } from '@/lib/onboardingWizard';

export async function fetchOnboardingProfile() {
  try {
    const profiles = await base44.entities.FinancialProfile.list('-updated_date', 1);
    return profiles[0] || null;
  } catch {
    return null;
  }
}

export async function bootstrapUserProfile() {
  const existing = await fetchOnboardingProfile();
  if (existing) return existing;

  return base44.entities.FinancialProfile.create({
    income: 0,
    plan: 'free',
    mode: 'basic',
    onboardingCompleted: false,
  });
}

export function isOnboardingComplete(profile) {
  return Boolean(profile?.onboardingCompleted);
}

/** Personlig onboarding klar när ekonomiska grunddata finns. */
export function isPersonalWizardComplete(profile) {
  return Boolean(profile?.income > 0);
}

/** Var ska användaren efter inloggning / om de redan är inloggade? */
export async function resolvePostAuthPath() {
  const profile = await fetchOnboardingProfile();

  if (!isOnboardingComplete(profile)) {
    if (isPersonalWizardComplete(profile) && isBusinessUserType(profile.userType)) {
      return '/BusinessOnboarding';
    }
    return '/Onboarding';
  }

  return getDashboardPath();
}
