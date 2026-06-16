/** Server-side Anchor AI routing (speglar src/lib/aiModelRouter.js). */

export const AI_TASKS = {
  coaching: { primary: 'claude_sonnet_4_6', fallback: 'gpt_5_5' },
  pattern_forecast: { primary: 'gemini_3_1_pro', fallback: 'claude_sonnet_4_6' },
  voice_fast: { primary: 'gpt_5_5', fallback: 'gpt_5_mini' },
  categorize: { primary: 'gpt_5_mini', fallback: 'gpt_5_5' },
  precision_parse: { primary: 'claude_sonnet_4_6', fallback: 'gpt_5_5' },
} as const;

export const SCENARIO_TASK_MAP: Record<string, keyof typeof AI_TASKS> = {
  dashboard_briefing: 'coaching',
  weekly_summary: 'coaching',
  subscription_scan: 'coaching',
  subscription_alternatives: 'coaching',
  academy_lesson: 'coaching',
  pengometer_line: 'coaching',
  passivity_wake: 'coaching',
  coach_message: 'coaching',
  expense_feedback: 'coaching',
  question: 'coaching',
  analysis_coach: 'coaching',
  voice_expense_parse: 'voice_fast',
  voice_quick_answer: 'voice_fast',
};

export function getTaskForScenario(scenario?: string): keyof typeof AI_TASKS {
  if (!scenario) return 'coaching';
  return SCENARIO_TASK_MAP[scenario] || 'coaching';
}

export async function invokeLlmForTask(
  base44: { asServiceRole: { integrations: { Core: { InvokeLLM: (o: Record<string, unknown>) => Promise<unknown> } } } },
  opts: {
    prompt: string;
    response_json_schema?: Record<string, unknown>;
    task?: keyof typeof AI_TASKS;
    scenario?: string;
  },
) {
  const taskKey = opts.task || getTaskForScenario(opts.scenario);
  const { primary, fallback } = AI_TASKS[taskKey];

  const callOpts: Record<string, unknown> = { prompt: opts.prompt, model: primary };
  if (opts.response_json_schema) callOpts.response_json_schema = opts.response_json_schema;

  try {
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM(callOpts);
    return { result, model: primary };
  } catch (err) {
    console.warn(`AI ${primary} failed (${taskKey}):`, (err as Error)?.message);
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      ...callOpts,
      model: fallback,
    });
    return { result, model: `${fallback}_fallback` };
  }
}
