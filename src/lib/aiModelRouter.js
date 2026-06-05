/**
 * Anchor AI Stack — central routing för modellval per uppgift.
 *
 * Claude Sonnet 4  → coaching, empati, faktabaserade råd
 * Gemini 2.5 Pro   → mönster, FuturePulse, långa kontexter
 * GPT-5.5          → röst, snabba svar, volym
 * Lokal ML         → on-device kategorisering (categoryRouter)
 * Embeddings       → semantiskt minne (aiMemory)
 */

export const AI_MODELS = {
  claude_sonnet_4_6: {
    id: 'claude_sonnet_4_6',
    label: 'Claude Sonnet 4',
    role: 'primary',
    tagline: 'Empati, coaching, låg hallucinationsrisk',
    contextTokens: '200K',
  },
  gemini_2_5_pro: {
    id: 'gemini_2_5_pro',
    label: 'Gemini 2.5 Pro',
    role: 'specialist',
    tagline: 'Mönster, prognos, långa dataserier',
    contextTokens: '2M',
  },
  gpt_5_5: {
    id: 'gpt_5_5',
    label: 'GPT-5.5',
    role: 'secondary',
    tagline: 'Röst, snabba svar, multimodal',
    contextTokens: '1M',
  },
  gpt_5_mini: {
    id: 'gpt_5_mini',
    label: 'GPT-5 Mini',
    role: 'volume',
    tagline: 'Snabb kategorisering och enkla svar',
    contextTokens: '128K',
  },
  local_ml: {
    id: 'local_ml',
    label: 'Lokal ML',
    role: 'on_device',
    tagline: 'Kategorisering & mönster utan nätverk',
    contextTokens: '—',
  },
  embeddings: {
    id: 'embeddings',
    label: 'Sentence Transformers',
    role: 'infrastructure',
    tagline: 'Semantiskt minne & kontextsökning',
    contextTokens: '—',
  },
};

/** Uppgiftsprofiler med primär + fallback-modell */
export const AI_TASKS = {
  coaching: {
    id: 'coaching',
    label: 'Coaching & empati',
    primary: 'claude_sonnet_4_6',
    fallback: 'gpt_5_5',
    uses: ['AI-coach', 'Emotionell incheckning', 'Anchor Academy', 'Avdragsrådgivning'],
  },
  pattern_forecast: {
    id: 'pattern_forecast',
    label: 'Mönster & prognos',
    primary: 'gemini_2_5_pro',
    fallback: 'claude_sonnet_4_6',
    uses: ['FuturePulse', 'Beteendemönster', 'Säsongsanalys', 'Anomalidetektering'],
  },
  voice_fast: {
    id: 'voice_fast',
    label: 'Röst & realtid',
    primary: 'gpt_5_5',
    fallback: 'gpt_5_mini',
    uses: ['Röstinmatning', 'Snabba fakta-svar', 'Realtidsnotiser'],
  },
  categorize: {
    id: 'categorize',
    label: 'Kategorisering',
    primary: 'gpt_5_mini',
    fallback: 'gpt_5_5',
    uses: ['Transaktionskategorier', 'Clipboard-klassificering'],
  },
  precision_parse: {
    id: 'precision_parse',
    label: 'Precision & parsing',
    primary: 'claude_sonnet_4_6',
    fallback: 'gpt_5_5',
    uses: ['Banktext', 'Skatteoptimering', 'Köprådgivning'],
  },
};

/** personalAdvisor-scenarier → uppgift */
export const SCENARIO_TASK_MAP = {
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

export const AI_STACK_LAYERS = [
  {
    model: 'claude_sonnet_4_6',
    badge: 'Primär',
    title: 'Claude Sonnet 4 — Anchors hjärna',
    subtitle: 'Huvudmodell för coaching, analys och empati',
    stats: [
      { label: 'Empati & ton', value: 'Bäst' },
      { label: 'Hallucinationer', value: 'Lägst' },
      { label: 'Kontextfönster', value: '200K' },
    ],
  },
  {
    model: 'gemini_2_5_pro',
    badge: 'Specialist',
    title: 'Gemini 2.5 Pro — Mönster & prognos',
    subtitle: 'Beteendeanalys, FuturePulse, trenddetektering',
    stats: [
      { label: 'Reasoning', value: 'Bäst' },
      { label: 'Token-fönster', value: '2M' },
      { label: 'Långa kontexter', value: 'Bäst' },
    ],
    chips: ['FuturePulse-scenarier', 'Beteendemönster', 'Säsongsanalys', 'Anomalidetektering'],
  },
  {
    model: 'local_ml',
    badge: 'On-device',
    title: 'Litet lokalt ML-modell — Realtidsmönster',
    subtitle: 'On-device kategorisering, offline-läge',
    stats: [
      { label: 'Svarstid', value: '<10ms' },
      { label: 'Per anrop', value: '0 kr' },
      { label: 'Offline', value: '100%' },
    ],
    chips: ['Offline kategorisering', 'Realtidsmönster', 'Prenumerationsscanner', 'Snabbnotiser'],
  },
  {
    model: 'embeddings',
    badge: 'Infrastruktur',
    title: 'Sentence Transformers — Semantisk sökning',
    subtitle: 'Minne, kontextsökning, personalisering',
    stats: [
      { label: 'Minne', value: 'Lång' },
      { label: 'Kostnad', value: 'Mycket låg' },
      { label: 'Sökning', value: 'Snabb' },
    ],
    chips: ['AI-minne', 'Personalisering', 'Kontextsökning', 'Mål-tracking'],
  },
  {
    model: 'gpt_5_5',
    badge: 'Sekundär',
    title: 'GPT-5.5 — Realtid & röst',
    subtitle: 'Snabb respons, röstinteraktion, multimodal',
    stats: [
      { label: 'Snabbare svar', value: '94%' },
      { label: 'Röst & ljud', value: 'Bäst' },
      { label: 'Token-fönster', value: '1M' },
    ],
    chips: ['Röstinmatning', 'Snabba fakta-svar', 'Kategorisering', 'Realtidsnotiser'],
  },
];

export function getTaskForScenario(scenario) {
  return SCENARIO_TASK_MAP[scenario] || 'coaching';
}

export function getModelsForTask(taskId) {
  const task = AI_TASKS[taskId] || AI_TASKS.coaching;
  return { primary: task.primary, fallback: task.fallback, task };
}

export function getModelsForScenario(scenario) {
  return getModelsForTask(getTaskForScenario(scenario));
}

/**
 * Anropa LLM med rätt modell för uppgift/scenario.
 * @param {object} base44 - base44 client
 * @param {object} opts - { prompt, response_json_schema, task, scenario }
 */
export async function invokeLlmForTask(base44, opts) {
  const { prompt, response_json_schema, task, scenario } = opts;
  const { primary, fallback } = task
    ? getModelsForTask(task)
    : getModelsForScenario(scenario || 'coaching');

  const callOpts = { prompt, model: primary };
  if (response_json_schema) callOpts.response_json_schema = response_json_schema;

  try {
    const result = await base44.integrations.Core.InvokeLLM(callOpts);
    return { result, model: primary };
  } catch (err) {
    console.warn(`AI ${primary} failed (${task || scenario}):`, err?.message);
    const fallbackOpts = { ...callOpts, model: fallback };
    const result = await base44.integrations.Core.InvokeLLM(fallbackOpts);
    return { result, model: `${fallback}_fallback` };
  }
}
