/**
 * Coach-chatt — svarar om hela användarens ekonomi och kan uppdatera profilen.
 */
import { askPersonalAdvisor } from '@/lib/personalAdvisor';
import { formatCoachText } from '@/lib/coachingCopy';
import { canUseAiCoachClient, currentMonthKey } from '@/lib/billingPlans';
import { BUDGET_CATEGORY_META } from '@/lib/budgetCategories';
import { getMonthlyMargin } from '@/lib/financialUtils';
import { tryLocalCoachAction } from '@/lib/coachLocalActions';
import { routeCoachDecision } from '@/lib/coachDecisionRouter';

export const COACH_OFF_TOPIC =
  'Jag är Lagos ekonomicoach och svarar bara på frågor om din privatekonomi — budget, sparande, lån, prenumerationer, inkomst och utgifter. Ställ en ekonomifråga så hjälper jag dig.';

const BUDGET_FIELD_MAP = {
  budget_food: 'food',
  budget_transport: 'transport',
  budget_entertainment: 'entertainment',
  budget_travel: 'travel',
  budget_health: 'health',
  budget_home: 'home',
  budget_shopping: 'shopping',
  budget_other: 'other',
};

function normalizeName(s) {
  return String(s || '').trim().toLowerCase();
}

function applySubscriptionChanges(subs, changes = []) {
  let list = [...(subs || [])];
  changes.forEach((ch) => {
    const idx = list.findIndex((s) => normalizeName(s.name) === normalizeName(ch.name));
    if (ch.action === 'remove') {
      if (idx >= 0) list.splice(idx, 1);
      return;
    }
    if (ch.action === 'add') {
      if (idx < 0) {
        list.push({
          name: ch.name,
          amount: Math.max(0, ch.amount || 0),
          category: ch.category || 'other',
        });
      } else {
        list[idx] = { ...list[idx], amount: ch.amount ?? list[idx].amount };
      }
      return;
    }
    if (ch.action === 'update' && idx >= 0) {
      list[idx] = {
        ...list[idx],
        ...(ch.amount != null ? { amount: Math.max(0, ch.amount) } : {}),
        ...(ch.category ? { category: ch.category } : {}),
        ...(ch.name ? { name: ch.name } : {}),
      };
    }
  });
  return list;
}

function applyLoanChanges(loans, changes = []) {
  let list = [...(loans || [])];
  changes.forEach((ch) => {
    const idx = list.findIndex((l) => normalizeName(l.name) === normalizeName(ch.name));
    if (ch.action === 'remove') {
      if (idx >= 0) list.splice(idx, 1);
      return;
    }
    if (ch.action === 'add') {
      if (idx < 0) {
        list.push({
          name: ch.name,
          monthlyPayment: Math.max(0, ch.monthlyPayment || 0),
          totalAmount: Math.max(0, ch.totalAmount || 0),
          interestRate: ch.interestRate || 0,
        });
      }
      return;
    }
    if (ch.action === 'update' && idx >= 0) {
      list[idx] = {
        ...list[idx],
        ...(ch.monthlyPayment != null ? { monthlyPayment: Math.max(0, ch.monthlyPayment) } : {}),
        ...(ch.totalAmount != null ? { totalAmount: Math.max(0, ch.totalAmount) } : {}),
        ...(ch.interestRate != null ? { interestRate: ch.interestRate } : {}),
      };
    }
  });
  return list;
}

/**
 * Konvertera platt coach_chat-svar till profil-patch.
 * OBS: income/housingCost/buffer/savingsGoal sätts medvetet INTE här längre
 * — det är grundläggande fält som AI:t inte ska kunna ändra fritt från en
 * chattext utan tydlig bekräftelse. Explicita kommandon ("sätt min inkomst
 * till X") hanteras redan säkert och deterministiskt av tryLocalCoachAction
 * i coachLocalActions.js. Endast budgetkategorier (lägre risk, redan
 * dubbelbevakade av samma lokala regelmotor) får sättas härifrån.
 */
export function coachChatResultToProfilePatch(result = {}) {
  const patch = {};
  const budgetLimits = {};

  Object.entries(BUDGET_FIELD_MAP).forEach(([field, cat]) => {
    if (result[field] != null && !Number.isNaN(Number(result[field]))) {
      budgetLimits[cat] = Math.round(Number(result[field]));
    }
  });

  if (Object.keys(budgetLimits).length) patch.budgetLimits = budgetLimits;

  return Object.keys(patch).length ? patch : null;
}

/** Bygg säker profil-patch från LLM eller lokalt svar. */
export function buildProfilePatchFromCoach(profile, patch = {}) {
  if (!patch || typeof patch !== 'object') return null;

  const out = {};
  const scalarFields = [
    'income', 'housingCost', 'buffer', 'savingsGoal',
    'savingsGoalName', 'savingsCurrentBalance', 'incomeDay',
  ];
  scalarFields.forEach((key) => {
    if (patch[key] != null && patch[key] !== '') {
      const val = key === 'savingsGoalName' ? String(patch[key]) : Number(patch[key]);
      if (key === 'savingsGoalName' || (!Number.isNaN(val) && val >= 0)) {
        out[key] = val;
      }
    }
  });

  if (patch.budgetLimits && typeof patch.budgetLimits === 'object') {
    const merged = { ...(profile.budgetLimits || {}) };
    Object.entries(patch.budgetLimits).forEach(([cat, amt]) => {
      if (Number(amt) >= 0) merged[cat] = Math.round(Number(amt));
    });
    out.budgetLimits = merged;
  }

  if (Array.isArray(patch.subscription_changes) && patch.subscription_changes.length) {
    out.subscriptions = applySubscriptionChanges(profile.subscriptions, patch.subscription_changes);
  }

  if (Array.isArray(patch.loan_changes) && patch.loan_changes.length) {
    out.loans = applyLoanChanges(profile.loans, patch.loan_changes);
  }

  return Object.keys(out).length ? out : null;
}

async function incrementCoachUsage(profile, updateProfile) {
  if (!profile?.id || !updateProfile) return;
  const month = currentMonthKey();
  const count = profile.aiCoachMonth === month ? (profile.aiCoachCount || 0) + 1 : 1;
  await updateProfile({ aiCoachMonth: month, aiCoachCount: count });
}

async function applyCoachPatch({ profile, patch, updateProfile, answer }) {
  let profileUpdated = false;
  let appliedPatch = null;
  let finalAnswer = answer;

  const safePatch = buildProfilePatchFromCoach(profile, patch);
  if (!safePatch || !updateProfile) {
    return { answer: finalAnswer, profileUpdated, patch: appliedPatch };
  }

  try {
    await updateProfile(safePatch);
    profileUpdated = true;
    appliedPatch = safePatch;

    const margin = getMonthlyMargin({ ...profile, ...safePatch });
    if (safePatch.budgetLimits) {
      const cats = Object.entries(safePatch.budgetLimits)
        .filter(([k]) => safePatch.budgetLimits[k] !== profile.budgetLimits?.[k])
        .map(([k, v]) => `${BUDGET_CATEGORY_META[k]?.label || k}budget ${v.toLocaleString('sv-SE')} kr`);
      if (cats.length && !finalAnswer.toLowerCase().includes('uppdater')) {
        finalAnswer = `${finalAnswer} Jag har uppdaterat ${cats.join(' och ')}.`;
      }
    }
    if (margin > 0 && (safePatch.income || safePatch.housingCost || safePatch.subscriptions || safePatch.loans)) {
      finalAnswer = `${finalAnswer} Din nya månadsmarginal är ${Math.round(margin).toLocaleString('sv-SE')} kr.`;
    }
  } catch (err) {
    console.error('coachChat profile update failed:', err);
    finalAnswer = `${finalAnswer} Jag kunde tyvärr inte spara ändringen just nu — prova under Inställningar eller försök igen.`;
  }

  return { answer: finalAnswer, profileUpdated, patch: appliedPatch };
}

/**
 * Skicka meddelande till coach — returnerar { answer, profileUpdated, patch }.
 */
export async function askCoachChat({
  question,
  profile,
  transactions = [],
  history = '',
  appMemory = '',
  updateProfile,
}) {
  if (!profile?.income) {
    return {
      answer: 'Lägg in din inkomst under Inställningar eller via onboarding så kan jag ge personliga svar och göra ändringar åt dig.',
      profileUpdated: false,
    };
  }

  const access = canUseAiCoachClient(profile);
  if (!access.allowed) {
    return {
      answer: `Du har använt alla ${access.limit} Coach-frågor den här månaden. Uppgradera till Pro för obegränsad coach.`,
      profileUpdated: false,
      limitReached: true,
    };
  }

  const local = tryLocalCoachAction(question, profile);
  if (local.handled) {
    const applied = await applyCoachPatch({
      profile,
      patch: local.profile_patch,
      updateProfile,
      answer: formatCoachText(local.answer || ''),
    });
    await incrementCoachUsage(profile, updateProfile);
    return applied;
  }

  // Köpfrågor och "vad händer om"-frågor räknas alltid deterministiskt av
  // financialEngine/scenario-motorn — aldrig av AI. Inget LLM-anrop här.
  const decision = routeCoachDecision(question, profile, transactions);
  if (decision.handled) {
    await incrementCoachUsage(profile, updateProfile);
    return { answer: decision.answer, actions: decision.actions, profileUpdated: false };
  }

  let result;
  try {
    result = await askPersonalAdvisor(
      {
        scenario: 'coach_chat',
        question,
        history: [history, appMemory ? `APP-AKTIVITET:\n${appMemory}` : ''].filter(Boolean).join('\n'),
      },
      { profile, transactions },
    );
  } catch (err) {
    console.error('coachChat personalAdvisor error:', err);
    try {
      result = await askPersonalAdvisor(
        { scenario: 'question', question },
        { profile, transactions },
      );
    } catch (fallbackErr) {
      console.error('coachChat question fallback error:', fallbackErr);
      throw new Error('coach_unavailable');
    }
  }

  if (result?.error === 'ai_coach_limit') {
    return {
      answer: result.message || `Du har använt alla ${access.limit} Coach-frågor den här månaden.`,
      profileUpdated: false,
      limitReached: true,
    };
  }

  if (result?.off_topic) {
    await incrementCoachUsage(profile, updateProfile);
    return { answer: COACH_OFF_TOPIC, profileUpdated: false };
  }

  const llmPatch = coachChatResultToProfilePatch(result);
  const applied = await applyCoachPatch({
    profile,
    patch: llmPatch,
    updateProfile,
    answer: formatCoachText(result?.answer || result?.message || ''),
  });

  await incrementCoachUsage(profile, updateProfile);

  return {
    answer: applied.answer || 'Jag kunde inte formulera ett svar — försök omformulera frågan.',
    profileUpdated: applied.profileUpdated,
    patch: applied.patch,
  };
}
