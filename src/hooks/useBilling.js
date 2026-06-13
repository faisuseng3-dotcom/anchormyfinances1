import { useMemo, useCallback } from 'react';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import {
  normalizePlan,
  canUseFeature,
  getAiCoachLimit,
  hasUnlimitedAiCoach,
  formatPlanLabel,
  formatRenewalDate,
  planToMode,
} from '@/lib/billingPlans';

export function useBilling() {
  const { isAuthenticated } = useAuth();
  const { profile, isLoading, isDemoMode, updateProfile } = useFinancialProfile();

  const plan = useMemo(() => {
    if (isDemoMode) return 'pro';
    return normalizePlan(profile?.plan);
  }, [profile?.plan, isDemoMode]);

  const billing = useMemo(() => ({
    plan,
    planLabel: formatPlanLabel(plan),
    stripeCustomerId: profile?.stripeCustomerId || null,
    subscriptionId: profile?.subscriptionId || null,
    renewalDate: profile?.renewalDate || null,
    renewalLabel: formatRenewalDate(profile?.renewalDate),
    paymentFailed: Boolean(profile?.paymentFailed),
    aiCoachCount: profile?.aiCoachCount || 0,
    aiCoachLimit: getAiCoachLimit(plan),
    aiCoachUnlimited: hasUnlimitedAiCoach(plan),
    mode: planToMode(plan),
  }), [plan, profile]);

  const canAccess = useCallback(
    (feature) => isDemoMode || canUseFeature(plan, feature),
    [plan, isDemoMode],
  );

  const aiCoachRemaining = useMemo(() => {
    if (billing.aiCoachUnlimited) return null;
    const limit = billing.aiCoachLimit ?? 0;
    return Math.max(0, limit - billing.aiCoachCount);
  }, [billing.aiCoachCount, billing.aiCoachLimit, billing.aiCoachUnlimited]);

  const canUseAiCoach = billing.aiCoachUnlimited || (aiCoachRemaining ?? 0) > 0;

  const startCheckout = useCallback(async (targetPlan, { successUrl, cancelUrl } = {}) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const res = await base44.functions.invoke('createCheckoutSession', {
      plan: targetPlan,
      successUrl: successUrl || `${origin}/Pricing?checkout=success`,
      cancelUrl: cancelUrl || `${origin}/Pricing?checkout=canceled`,
    });
    const url = res?.data?.url ?? res?.url;
    if (!url) throw new Error(res?.data?.error || res?.error || 'Kunde inte starta betalning');
    window.location.href = url;
  }, []);

  const openBillingPortal = useCallback(async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const res = await base44.functions.invoke('createPortalSession', {
      returnUrl: `${origin}/Settings`,
    });
    const url = res?.data?.url ?? res?.url;
    if (!url) throw new Error(res?.data?.error || res?.error || 'Kunde inte öppna kundportalen');
    window.location.href = url;
  }, []);

  const dismissPaymentFailed = useCallback(async () => {
    if (!profile?.id) return;
    await updateProfile({ paymentFailed: false });
  }, [profile?.id, updateProfile]);

  return {
    ...billing,
    isLoading,
    isAuthenticated,
    isDemoMode,
    canAccess,
    canUseAiCoach,
    aiCoachRemaining,
    startCheckout,
    openBillingPortal,
    dismissPaymentFailed,
  };
}
