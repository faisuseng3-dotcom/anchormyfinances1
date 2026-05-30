import { base44 } from '@/api/base44Client';

/**
 * Anropa Anchors personliga rådgivare (server-side, Claude Sonnet + fallback).
 * @param {object} params
 * @param {string} params.scenario - dashboard_briefing | weekly_summary | coach_message | subscription_alternatives | question | expense_feedback
 * @param {string} [params.question]
 * @param {object} [params.transaction]
 * @param {object} [params.subscription]
 */
export async function askPersonalAdvisor(params) {
  const res = await base44.functions.invoke('personalAdvisor', params);
  const payload = res?.data ?? res;
  if (payload?.error) throw new Error(payload.error);
  return payload;
}
