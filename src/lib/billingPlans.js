/** Betalplaner — priser i SEK. Stripe price IDs sätts i Base44-funktioner (test/live). */

export const PLANS = {
  free: {
    id: 'free',
    name: 'Gratis',
    priceKr: 0,
    period: 'för alltid',
    stripePriceEnv: null,
    aiCoachLimit: 5,
    features: [
      'Översikt & pengometer',
      'Transaktionshistorik',
      'Budget per kategori',
      'Coach (5 gånger/månad)',
    ],
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    priceKr: 99,
    period: 'per månad',
    stripePriceEnv: 'STRIPE_PRICE_BASIC',
    aiCoachLimit: 20,
    features: [
      'Allt i Gratis',
      'Scenarier & läckagedetektor',
      'Lago Academy',
      'Coach (20 gånger/månad)',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceKr: 149,
    period: 'per månad',
    stripePriceEnv: 'STRIPE_PRICE_PRO',
    aiCoachLimit: null,
    features: [
      'Allt i Basic',
      'Obegränsad Coach',
      'Din Framtid (FuturePulse)',
    ],
  },
  business: {
    id: 'business',
    name: 'Business',
    priceKr: 299,
    period: 'per månad',
    stripePriceEnv: 'STRIPE_PRICE_BUSINESS',
    aiCoachLimit: null,
    features: [
      'Allt i Pro',
      'Företagsdashboard',
      'Kvitton, moms & verifikat',
      'Årsbokslut-stöd',
    ],
  },
};

export const PLAN_ORDER = ['free', 'basic', 'pro', 'business'];

export const FEATURE_MIN_PLAN = {
  ai_coach_unlimited: 'pro',
  future_pulse: 'pro',
  squads: 'pro',
  business_dashboard: 'business',
};

const PLAN_RANK = Object.fromEntries(PLAN_ORDER.map((id, i) => [id, i]));

export function normalizePlan(plan) {
  return PLANS[plan] ? plan : 'free';
}

export function planRank(plan) {
  return PLAN_RANK[normalizePlan(plan)] ?? 0;
}

export function hasPlanAccess(userPlan, requiredPlan) {
  return planRank(userPlan) >= planRank(requiredPlan);
}

export function canUseFeature(userPlan, feature) {
  const min = FEATURE_MIN_PLAN[feature];
  if (!min) return true;
  return hasPlanAccess(userPlan, min);
}

export function getAiCoachLimit(plan) {
  const p = PLANS[normalizePlan(plan)];
  return p?.aiCoachLimit ?? null;
}

export function hasUnlimitedAiCoach(plan) {
  return canUseFeature(plan, 'ai_coach_unlimited');
}

export function planToMode(plan) {
  switch (normalizePlan(plan)) {
    case 'pro':
    case 'business':
      return 'pro';
    case 'basic':
      return 'smart';
    default:
      return 'basic';
  }
}

export function formatPlanLabel(plan) {
  return PLANS[normalizePlan(plan)]?.name ?? 'Gratis';
}

export function formatRenewalDate(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return null;
  }
}

export function formatPriceKr(kr) {
  return `${kr.toLocaleString('sv-SE')} kr`;
}

export function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getAiCoachUsage(profile) {
  const month = currentMonthKey();
  const count = profile?.aiCoachMonth === month ? (profile?.aiCoachCount || 0) : 0;
  return { month, count };
}

export function canUseAiCoachClient(profile) {
  const plan = normalizePlan(profile?.plan);
  const limit = getAiCoachLimit(plan);
  if (limit === null) return { allowed: true, remaining: null, limit: null };
  const { count } = getAiCoachUsage(profile);
  const remaining = Math.max(0, limit - count);
  return { allowed: remaining > 0, remaining, limit };
}

export const PRICING_PLANS = PLAN_ORDER.map((id) => PLANS[id]);
