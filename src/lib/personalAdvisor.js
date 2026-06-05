import { base44 } from '@/api/base44Client';
import {
  ADVISOR_SCHEMAS,
  buildAdvisorScenarioPrompt,
  buildAdvisorSnapshot,
  getNeedsProfileResponse,
} from '@/lib/personalAdvisorPrompts';
import { hasAdvisorProfileData, isLocalAdvisorProfile } from '@/lib/advisorProfile';
import { sanitizeAdvisorResponse } from '@/lib/coachingCopy';
import { invokeLlmForTask } from '@/lib/aiModelRouter';
import { recallRelevantMemories, formatMemoryContext, rememberInsight } from '@/lib/aiMemory';

async function invokeLlmWithFallback(prompt, schema, scenario) {
  const { result, model } = await invokeLlmForTask(base44, {
    prompt,
    response_json_schema: schema,
    scenario,
  });
  return { ...result, model };
}

async function loadAdvisorContextFromApi() {
  const profiles = await base44.entities.FinancialProfile.list();
  const profile = profiles[0] || null;

  let transactions = [];
  try {
    transactions = await base44.entities.Transaction.list('-created_date', 500);
  } catch {
    transactions = profile?.monthlyExpenses?.map((e, i) => ({
      type: 'expense',
      amount: e.amount,
      category: e.category,
      description: e.name,
      created_date: e.date,
      id: `legacy-${i}`,
    })) || [];
  }

  return { profile, transactions };
}

function resolveTransactions(profile, transactions) {
  if (transactions?.length) return transactions;
  return profile?.monthlyExpenses?.map((e, i) => ({
    type: 'expense',
    amount: e.amount,
    category: e.category,
    description: e.name,
    created_date: e.date,
    id: `legacy-${i}`,
  })) || [];
}

async function askPersonalAdvisorClient(params, profile, transactions) {
  const {
    scenario = 'dashboard_briefing',
    question,
    transaction,
    subscription,
    coachType,
    payload,
  } = params;

  let activeProfile = profile;
  let activeTransactions = transactions;

  if (!hasAdvisorProfileData(activeProfile)) {
    const loaded = await loadAdvisorContextFromApi();
    activeProfile = loaded.profile;
    activeTransactions = loaded.transactions;
  } else {
    activeTransactions = resolveTransactions(activeProfile, activeTransactions);
  }

  if (!hasAdvisorProfileData(activeProfile)) {
    return getNeedsProfileResponse();
  }

  const snapshot = buildAdvisorSnapshot(activeProfile, activeTransactions);
  const schema = ADVISOR_SCHEMAS[scenario] || ADVISOR_SCHEMAS.coach_message;
  const memoryQuery = question || transaction?.name || scenario;
  const memories = recallRelevantMemories(memoryQuery, { limit: 4 });
  const memoryBlock = formatMemoryContext(memories);

  const prompt = buildAdvisorScenarioPrompt(scenario, snapshot, {
    profile: activeProfile,
    question,
    transaction,
    subscription,
    coachType,
    payload,
    lesson: params.lesson,
  }) + memoryBlock;

  const result = await invokeLlmWithFallback(prompt, schema, scenario);

  const headline = result.headline || result.message || result.answer;
  if (headline && scenario !== 'voice_expense_parse') {
    rememberInsight({ text: headline.slice(0, 280), type: 'coach', tags: [scenario] });
  }
  if (question) {
    rememberInsight({ text: question.slice(0, 200), type: 'question', tags: [scenario] });
  }

  return sanitizeAdvisorResponse({
    ...result,
    snapshot_summary: { margin: snapshot.monthly_margin_kr },
    _source: 'client',
    _memories_used: memories.length,
  });
}

/**
 * Anropa Anchors personliga rådgivare.
 * @param {object} params - scenario, question, transaction, etc.
 * @param {object} [options]
 * @param {object} [options.profile] - aktiv profil (demo/onboarding/dashboard)
 * @param {object[]} [options.transactions]
 * @param {boolean} [options.isDemoMode]
 */
export async function askPersonalAdvisor(params, options = {}) {
  const { profile, transactions, isDemoMode } = options;

  // Demo/Alex eller profil utan DB-id: använd alltid klienten med visad profil
  if (hasAdvisorProfileData(profile) && isLocalAdvisorProfile(profile, isDemoMode)) {
    return askPersonalAdvisorClient(params, profile, transactions);
  }

  try {
    const res = await base44.functions.invoke('personalAdvisor', params);
    const payload = res?.data ?? res;
    if (payload?.error) throw new Error(payload.error);

    // Server saknar profil men UI har data (t.ex. onboarding sparad lokalt)
    if (payload?.needs_profile && hasAdvisorProfileData(profile)) {
      return askPersonalAdvisorClient(params, profile, transactions);
    }

    return payload;
  } catch (err) {
    console.warn('personalAdvisor server unavailable, client fallback:', err?.message);
    if (hasAdvisorProfileData(profile)) {
      return sanitizeAdvisorResponse(await askPersonalAdvisorClient(params, profile, transactions));
    }
    return sanitizeAdvisorResponse(await askPersonalAdvisorClient(params));
  }
}
