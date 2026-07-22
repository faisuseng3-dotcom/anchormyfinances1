/** Semantiska minnestyper — delas av alla AI-funktioner. */
export const MEMORY_TYPES = {
  GOAL: 'goal',
  MAJOR_PURCHASE: 'major_purchase',
  TRAVEL_PLAN: 'travel_plan',
  SAVINGS_GOAL: 'savings_goal',
  LOAN: 'loan',
  FAMILY: 'family',
  BUSINESS: 'business',
  SUBSCRIPTION: 'subscription',
  BUDGET_PREFERENCE: 'budget_preference',
  AI_DECISION: 'ai_decision',
  INSIGHT: 'insight',
};

export const MEMORY_TYPE_LABELS = {
  goal: 'Mål',
  major_purchase: 'Större köp',
  travel_plan: 'Reseplan',
  savings_goal: 'Sparmål',
  loan: 'Lån',
  family: 'Familj',
  business: 'Företag',
  subscription: 'Prenumeration',
  budget_preference: 'Budgetpreferens',
  ai_decision: 'Tidigare råd',
  insight: 'Insikt',
};

/** AI-funktioner som delar globalt minne. */
export const AI_FEATURES = {
  COACH: 'coach',
  VOICE: 'voice_assistant',
  PURCHASE: 'purchase_analysis',
  FUTURE_PULSE: 'future_pulse',
  TRAVEL: 'travel_planner',
  BUSINESS: 'business_assistant',
  ACADEMY: 'academy',
  OTHER: 'other',
};

/** Mappa personalAdvisor-scenario → feature. */
export const SCENARIO_TO_FEATURE = {
  coach_chat: AI_FEATURES.COACH,
  question: AI_FEATURES.COACH,
  voice_expense_parse: AI_FEATURES.VOICE,
  voice_quick_answer: AI_FEATURES.VOICE,
  dashboard_briefing: AI_FEATURES.COACH,
  pengometer_line: AI_FEATURES.COACH,
  subscription_scan: AI_FEATURES.COACH,
  academy_lesson: AI_FEATURES.ACADEMY,
  passivity_wake: AI_FEATURES.COACH,
  purchase_analysis: AI_FEATURES.PURCHASE,
  future_pulse: AI_FEATURES.FUTURE_PULSE,
  travel_planner: AI_FEATURES.TRAVEL,
  business_assistant: AI_FEATURES.BUSINESS,
};

export function scenarioToFeature(scenario) {
  return SCENARIO_TO_FEATURE[scenario] || AI_FEATURES.OTHER;
}

export const MEMORY_UX_NOTICE =
  'Lago kommer ihåg tidigare diskussioner för att ge mer personliga råd.';
