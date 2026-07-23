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
import {
  buildMemoryPromptContext,
  recordAIExchange,
  isMemoryEnabled,
} from '@/lib/anchorMemory';
import { canUseAiCoachClient } from '@/lib/billingPlans';

function checkClientAiCoachLimit(profile) {
  const access = canUseAiCoachClient(profile);
  if (access.allowed) return null;
  return {
    error: 'ai_coach_limit',
    headline: 'Månadens gräns nådd',
    message: `Du har använt alla ${access.limit} Coach-frågor den här månaden. Uppgradera till Pro för obegränsad coach.`,
    upgrade_plan: 'pro',
    remaining: 0,
  };
}

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
    history,
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

  const limitError = checkClientAiCoachLimit(activeProfile);
  if (limitError) return sanitizeAdvisorResponse(limitError);

  const snapshot = buildAdvisorSnapshot(activeProfile, activeTransactions);
  const schema = ADVISOR_SCHEMAS[scenario] || ADVISOR_SCHEMAS.coach_message;
  const memoryBlock = await buildMemoryPromptContext({
    profile: activeProfile,
    query: question || transaction?.name || scenario,
    feature: scenario,
  });

  const prompt = buildAdvisorScenarioPrompt(scenario, snapshot, {
    profile: activeProfile,
    question,
    history,
    transaction,
    subscription,
    coachType,
    payload,
    lesson: params.lesson,
  }) + memoryBlock;

  const result = await invokeLlmWithFallback(prompt, schema, scenario);

  const responseText = result.answer || result.message || result.headline || '';
  if (question && isMemoryEnabled(activeProfile)) {
    void recordAIExchange({
      profile: activeProfile,
      scenario,
      message: question,
      response: responseText,
    });
  }

  return sanitizeAdvisorResponse({
    ...result,
    snapshot_summary: { margin: snapshot.monthly_margin_kr },
    _source: 'client',
  });
}

/**
 * Anropa Lagos personliga rådgivare.
 * @param {object} params - scenario, question, transaction, etc.
 * @param {object} [options]
 * @param {object} [options.profile] - aktiv profil (demo/onboarding/dashboard)
 * @param {object[]} [options.transactions]
 * @param {boolean} [options.isDemoMode]
 */
export async function askPersonalAdvisor(params, options = {}) {
  const { profile, transactions, isDemoMode } = options;
  const enrichedParams = { ...params };

  if (hasAdvisorProfileData(profile) && isMemoryEnabled(profile)) {
    const memoryBlock = await buildMemoryPromptContext({
      profile,
      query: params.question || params.scenario || '',
      feature: params.scenario,
    });
    if (memoryBlock) {
      enrichedParams.history = [params.history, memoryBlock].filter(Boolean).join('\n\n');
      enrichedParams.memoryEnabled = true;
    }
  }

  if (!isDemoMode && hasAdvisorProfileData(profile)) {
    const limitError = checkClientAiCoachLimit(profile);
    if (limitError) return sanitizeAdvisorResponse(limitError);
  }

  // Demo/Alex eller profil utan DB-id: använd alltid klienten med visad profil
  if (hasAdvisorProfileData(profile) && isLocalAdvisorProfile(profile, isDemoMode)) {
    return askPersonalAdvisorClient(enrichedParams, profile, transactions);
  }

  try {
    const res = await base44.functions.invoke('personalAdvisor', enrichedParams);
    const payload = res?.data ?? res;
    if (payload?.error === 'ai_coach_limit') return sanitizeAdvisorResponse(payload);
    if (payload?.error) throw new Error(payload.error);

    // Server saknar profil men UI har data (t.ex. onboarding sparad lokalt)
    if (payload?.needs_profile && hasAdvisorProfileData(profile)) {
      return askPersonalAdvisorClient(enrichedParams, profile, transactions);
    }

    return payload;
  } catch (err) {
    console.warn('personalAdvisor server unavailable, client fallback:', err?.message);
    if (hasAdvisorProfileData(profile)) {
      return sanitizeAdvisorResponse(await askPersonalAdvisorClient(enrichedParams, profile, transactions));
    }
    return sanitizeAdvisorResponse(await askPersonalAdvisorClient(enrichedParams));
  }
}
