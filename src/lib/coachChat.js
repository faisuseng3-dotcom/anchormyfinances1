/**
 * Coach-chatt — svarar om hela användarens ekonomi och kan uppdatera profilen.
 */
import { base44 } from '@/api/base44Client';
import { invokeLlmForTask } from '@/lib/aiModelRouter';
import { buildAdvisorSnapshot, getAdvisorSystemRules } from '@/lib/buildAdvisorContext';
import { formatCoachText } from '@/lib/coachingCopy';
import { canUseAiCoachClient, currentMonthKey } from '@/lib/billingPlans';
import { BUDGET_CATEGORY_META, TRACKED_BUDGET_CATEGORIES } from '@/lib/budgetCategories';
import { getMonthlyMargin } from '@/lib/financialUtils';
import { recallRelevantMemories, formatMemoryContext } from '@/lib/aiMemory';

export const COACH_OFF_TOPIC =
  'Jag är Anchors ekonomicoach och svarar bara på frågor om din privatekonomi — budget, sparande, lån, prenumerationer, inkomst och utgifter. Ställ en ekonomifråga så hjälper jag dig.';

export const COACH_CHAT_SCHEMA = {
  type: 'object',
  properties: {
    off_topic: { type: 'boolean', description: 'true om frågan INTE handlar om ekonomi' },
    answer: { type: 'string', description: 'Svar till användaren på svenska' },
    profile_patch: {
      type: 'object',
      description: 'Fält att uppdatera i profilen om användaren ber om ändringar',
      properties: {
        income: { type: 'number' },
        housingCost: { type: 'number' },
        buffer: { type: 'number' },
        savingsGoal: { type: 'number' },
        savingsGoalName: { type: 'string' },
        savingsCurrentBalance: { type: 'number' },
        incomeDay: { type: 'number' },
        budgetLimits: {
          type: 'object',
          additionalProperties: { type: 'number' },
        },
        subscription_changes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              action: { type: 'string', enum: ['add', 'update', 'remove'] },
              name: { type: 'string' },
              amount: { type: 'number' },
              category: { type: 'string' },
            },
            required: ['action', 'name'],
          },
        },
        loan_changes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              action: { type: 'string', enum: ['add', 'update', 'remove'] },
              name: { type: 'string' },
              monthlyPayment: { type: 'number' },
              totalAmount: { type: 'number' },
              interestRate: { type: 'number' },
            },
            required: ['action', 'name'],
          },
        },
      },
    },
    changes_summary: {
      type: 'array',
      items: { type: 'string' },
      description: 'Korta beskrivningar av vad som ändrades',
    },
  },
  required: ['off_topic', 'answer'],
};

const BUDGET_KEYS_DOC = TRACKED_BUDGET_CATEGORIES.map(
  (k) => `${k} (${BUDGET_CATEGORY_META[k]?.label || k})`,
).join(', ');

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

/** Bygg säker profil-patch från LLM-svar. */
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
      if (TRACKED_BUDGET_CATEGORIES.includes(cat) && Number(amt) >= 0) {
        merged[cat] = Math.round(Number(amt));
      }
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

function buildCoachChatPrompt(profile, transactions, history, appMemory) {
  const snapshot = buildAdvisorSnapshot(profile, transactions);
  const rules = getAdvisorSystemRules(profile);
  const memories = formatMemoryContext(recallRelevantMemories(history, { limit: 6 }));

  return `${rules}

DU ÄR I COACH-CHATTEN. Du kan både svara och UTFÖRA ändringar i användarens profil.

OMFATTNING — svara utförligt om ALLT som rör användarens ekonomi:
- Inkomst, marginal, "säkert att spendera", buffert, sparande
- Budget per kategori, utgiftsmönster, transaktioner
- Lån, räntor, amortering, skuldsättning
- Prenumerationer och fasta kostnader
- Sparmål, köpbedömningar, ekonomiska beslut
- Skatter, CSN, bolån, försäkringar — om det påverkar plånboken

OFF-TOPIC: Om frågan inte handlar om ekonomi (sport, politik, recept, kod, väder m.m.) — sätt off_topic: true och svara kort med att du bara hjälper med ekonomi.

ÄNDRINGAR I PROFILEN:
När användaren ber dig ändra något (t.ex. "sätt matbudget till 500 kr", "ändra inkomst till 32 000", "ta bort Netflix", "lägg till billån 2500 kr/mån"):
1. Fyll i profile_patch med exakta ändringar.
2. Bekräfta i answer vad du gjorde med deras siffror.
3. Fyll changes_summary med korta rader om varje ändring.

Budgetkategorier (nycklar för budgetLimits): ${BUDGET_KEYS_DOC}

Marginal beräknas: inkomst − boende − abonnemang − lån. Du kan inte sätta "marginal" direkt — ändra inkomst eller kostnader.

SNAPSHOT (sanning — basera svar på detta):
${JSON.stringify(snapshot, null, 2)}

${appMemory ? `APP-AKTIVITET:\n${appMemory}\n` : ''}
${memories ? `${memories}\n` : ''}
SAMTAL:
${history}

Svara med JSON enligt schema. answer: 2–5 meningar, flytande prosa, inga punktlistor.`;
}

async function incrementCoachUsage(profile, updateProfile) {
  if (!profile?.id || !updateProfile) return;
  const month = currentMonthKey();
  const count = profile.aiCoachMonth === month ? (profile.aiCoachCount || 0) + 1 : 1;
  await updateProfile({ aiCoachMonth: month, aiCoachCount: count });
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
      answer: `Du har använt alla ${access.limit} AI-coach-frågor den här månaden. Uppgradera till Pro för obegränsad coach.`,
      profileUpdated: false,
      limitReached: true,
    };
  }

  const prompt = buildCoachChatPrompt(profile, transactions, history, appMemory);

  let result;
  try {
    const res = await invokeLlmForTask(base44, {
      prompt: `${prompt}\n\nAnvändarens senaste meddelande: "${question}"`,
      response_json_schema: COACH_CHAT_SCHEMA,
      scenario: 'coaching',
    });
    result = res.result;
  } catch (err) {
    console.error('coachChat LLM error:', err);
    throw new Error('llm_failed');
  }

  if (result?.off_topic) {
    await incrementCoachUsage(profile, updateProfile);
    return { answer: COACH_OFF_TOPIC, profileUpdated: false };
  }

  let answer = formatCoachText(result?.answer || '');
  let profileUpdated = false;
  let appliedPatch = null;

  const patch = buildProfilePatchFromCoach(profile, result?.profile_patch);
  if (patch && updateProfile) {
    try {
      await updateProfile(patch);
      profileUpdated = true;
      appliedPatch = patch;
      const margin = getMonthlyMargin({ ...profile, ...patch });
      const summaries = result?.changes_summary || [];
      if (summaries.length && !answer.toLowerCase().includes('uppdater')) {
        answer = `${answer} ${summaries.join(' ')}`;
      }
      if (patch.budgetLimits && !summaries.length) {
        const cats = Object.entries(patch.budgetLimits)
          .filter(([k]) => patch.budgetLimits[k] !== profile.budgetLimits?.[k])
          .map(([k, v]) => `${BUDGET_CATEGORY_META[k]?.label || k}budget ${v.toLocaleString('sv-SE')} kr`);
        if (cats.length) answer = `${answer} Jag har uppdaterat ${cats.join(' och ')}.`;
      }
      if (margin > 0 && (patch.income || patch.housingCost || patch.subscriptions || patch.loans)) {
        answer = `${answer} Din nya månadsmarginal är ${Math.round(margin).toLocaleString('sv-SE')} kr.`;
      }
    } catch (err) {
      console.error('coachChat profile update failed:', err);
      answer = `${answer} Jag kunde tyvärr inte spara ändringen just nu — prova under Inställningar eller försök igen.`;
    }
  }

  await incrementCoachUsage(profile, updateProfile);

  return { answer: answer || 'Jag kunde inte formulera ett svar — försök omformulera frågan.', profileUpdated, patch: appliedPatch };
}
