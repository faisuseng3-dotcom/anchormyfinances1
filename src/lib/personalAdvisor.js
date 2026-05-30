import { base44 } from '@/api/base44Client';
import {
  ADVISOR_SCHEMAS,
  buildAdvisorScenarioPrompt,
  buildAdvisorSnapshot,
  getNeedsProfileResponse,
} from '@/lib/personalAdvisorPrompts';

async function invokeLlmWithFallback(prompt, schema) {
  const opts = { prompt, model: 'claude_sonnet_4_6', response_json_schema: schema };
  try {
    const result = await base44.integrations.Core.InvokeLLM(opts);
    return { ...result, model: 'claude_sonnet_4_6' };
  } catch (err) {
    console.warn('personalAdvisor client primary model failed:', err?.message);
    const result = await base44.integrations.Core.InvokeLLM({
      ...opts,
      model: 'gpt_5_5',
    });
    return { ...result, model: 'gpt_5_5_fallback' };
  }
}

async function loadAdvisorContext() {
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

async function askPersonalAdvisorClient(params) {
  const {
    scenario = 'dashboard_briefing',
    question,
    transaction,
    subscription,
    coachType,
    payload,
  } = params;

  const { profile, transactions } = await loadAdvisorContext();

  if (!profile?.income) {
    return getNeedsProfileResponse();
  }

  const snapshot = buildAdvisorSnapshot(profile, transactions);
  const schema = ADVISOR_SCHEMAS[scenario] || ADVISOR_SCHEMAS.coach_message;
  const prompt = buildAdvisorScenarioPrompt(scenario, snapshot, {
    question,
    transaction,
    subscription,
    coachType,
    payload,
  });

  const result = await invokeLlmWithFallback(prompt, schema);
  return {
    ...result,
    snapshot_summary: { margin: snapshot.monthly_margin_kr },
    _source: 'client_fallback',
  };
}

/**
 * Anropa Anchors personliga rådgivare.
 * Försöker serverfunktionen personalAdvisor först; faller tillbaka till klient om den inte är deployad.
 */
export async function askPersonalAdvisor(params) {
  try {
    const res = await base44.functions.invoke('personalAdvisor', params);
    const payload = res?.data ?? res;
    if (payload?.error) throw new Error(payload.error);
    return payload;
  } catch (err) {
    console.warn('personalAdvisor server unavailable, client fallback:', err?.message);
    return askPersonalAdvisorClient(params);
  }
}
