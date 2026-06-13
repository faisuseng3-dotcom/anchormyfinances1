export type PlanId = 'free' | 'basic' | 'pro' | 'business';

const PLAN_ORDER: PlanId[] = ['free', 'basic', 'pro', 'business'];
const PLAN_RANK = Object.fromEntries(PLAN_ORDER.map((id, i) => [id, i]));

const AI_LIMITS: Record<PlanId, number | null> = {
  free: 5,
  basic: 20,
  pro: null,
  business: null,
};

export function normalizePlan(plan?: string): PlanId {
  if (plan && PLAN_ORDER.includes(plan as PlanId)) return plan as PlanId;
  return 'free';
}

export function hasPlanAccess(userPlan: PlanId, required: PlanId): boolean {
  return (PLAN_RANK[userPlan] ?? 0) >= (PLAN_RANK[required] ?? 0);
}

export function canUseFuturePulse(plan?: string): boolean {
  return hasPlanAccess(normalizePlan(plan), 'pro');
}

export function getAiCoachLimit(plan?: string): number | null {
  return AI_LIMITS[normalizePlan(plan)];
}

export function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function canUseAiCoach(profile: {
  plan?: string;
  aiCoachMonth?: string;
  aiCoachCount?: number;
}): { allowed: boolean; remaining: number | null; limit: number | null } {
  const plan = normalizePlan(profile?.plan);
  const limit = getAiCoachLimit(plan);
  if (limit === null) return { allowed: true, remaining: null, limit: null };

  const month = currentMonthKey();
  const count = profile?.aiCoachMonth === month ? (profile.aiCoachCount || 0) : 0;
  const remaining = Math.max(0, limit - count);
  return { allowed: remaining > 0, remaining, limit };
}

export async function incrementAiCoachUsage(
  base44: {
    entities: {
      FinancialProfile: {
        update: (id: string, data: object) => Promise<unknown>;
      };
    };
  },
  profile: { id: string; plan?: string; aiCoachMonth?: string; aiCoachCount?: number },
) {
  const month = currentMonthKey();
  const count = profile.aiCoachMonth === month ? (profile.aiCoachCount || 0) + 1 : 1;
  await base44.entities.FinancialProfile.update(profile.id, {
    aiCoachMonth: month,
    aiCoachCount: count,
  });
  return count;
}
