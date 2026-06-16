import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ── inlined from _shared/aiModelRouter.ts ──────────────────────────────────
const AI_TASKS = { categorize: { primary: 'gpt_5_mini', fallback: 'gpt_5_5' }, coaching: { primary: 'claude_sonnet_4_6', fallback: 'gpt_5_5' }, pattern_forecast: { primary: 'gemini_2_5_pro', fallback: 'claude_sonnet_4_6' }, voice_fast: { primary: 'gpt_5_5', fallback: 'gpt_5_mini' }, precision_parse: { primary: 'claude_sonnet_4_6', fallback: 'gpt_5_5' } } as const;
type TaskKey = keyof typeof AI_TASKS;
async function invokeLlmForTask(base44: any, opts: { prompt: string; response_json_schema?: any; task?: TaskKey }) {
  const { primary, fallback } = AI_TASKS[opts.task || 'categorize'];
  const callOpts: any = { prompt: opts.prompt, model: primary };
  if (opts.response_json_schema) callOpts.response_json_schema = opts.response_json_schema;
  try { return { result: await base44.asServiceRole.integrations.Core.InvokeLLM(callOpts), model: primary }; }
  catch { return { result: await base44.asServiceRole.integrations.Core.InvokeLLM({ ...callOpts, model: fallback }), model: `${fallback}_fallback` }; }
}
// ───────────────────────────────────────────────────────────────────────────

const VALID_CATEGORIES = [
  'food',
  'transport',
  'entertainment',
  'travel',
  'health',
  'home',
  'shopping',
  'income',
  'savings',
  'other',
];

const SYSTEM_PROMPT = `Du är en svensk transaktionskategoriserare för privat ekonomi.

Kategorier (välj exakt en): ${VALID_CATEGORIES.join(', ')}.

Regler:
- Matbutiker, restaurang, café → food
- SL, SJ, bensin, parkering, taxi → transport
- Netflix, Spotify, bio, spel → entertainment
- Hotell, flyg, Airbnb → travel
- Apotek, gym, vård → health
- Hyra, el, möbler, IKEA → home
- Kläder, H&M, Amazon shopping → shopping
- Positivt belopp / lön → income
- Sparkonto, överföring till spar → savings
- Försäkring, okänt → other

Returnera confidence 0.0–1.0. Sätt needs_review: true om confidence < 0.75.
Returnera ENDAST JSON enligt schema.`;

const RESULT_SCHEMA = {
  type: 'object',
  properties: {
    results: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: ['string', 'number'] },
          category: { type: 'string' },
          confidence: { type: 'number' },
          needs_review: { type: 'boolean' },
        },
        required: ['id', 'category', 'confidence', 'needs_review'],
      },
    },
  },
  required: ['results'],
};

function clampCategory(cat: string) {
  const c = (cat || 'other').toLowerCase().trim();
  return VALID_CATEGORIES.includes(c) ? c : 'other';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { items, recentTransactions } = await req.json();
    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({ results: [], model: null });
    }

    const batch = items.slice(0, 40);
    const contextBlock = recentTransactions?.length
      ? `\nTidigare kategoriseringar från användaren:\n${JSON.stringify(recentTransactions.slice(0, 15))}\n`
      : '';

    const listBlock = batch
      .map(
        (item, i) =>
          `${i + 1}. id=${JSON.stringify(item.id)} desc="${item.description}" amount=${item.amount ?? 'null'} normalized="${item.normalizedVendor || ''}"`,
      )
      .join('\n');

    const prompt = `${SYSTEM_PROMPT}${contextBlock}\n\nKategorisera varje rad. Returnera results med samma id.\n\n${listBlock}`;

    const { result, model } = await invokeLlmForTask(base44, {
      prompt,
      response_json_schema: RESULT_SCHEMA,
      task: 'categorize',
    });

    const results = (result.results || []).map((row) => ({
      id: row.id,
      category: clampCategory(row.category),
      confidence: typeof row.confidence === 'number' ? row.confidence : 0.7,
      needs_review: row.needs_review ?? (row.confidence ?? 0.7) < 0.75,
      model,
    }));

    return Response.json({ results, model });
  } catch (error) {
    console.error('categorizeTransactions error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
