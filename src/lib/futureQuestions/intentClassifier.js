// @ts-nocheck
/**
 * Tolkar en fri Framtid-fråga till ett av de kända scenarierna + parametrar.
 * Lokala nyckelordsregler först (gratis, deterministiskt) — LLM bara som
 * reservlösning när inget mönster känns igen. Samma princip som
 * categoryRouter: regler → LLM, aldrig tvärtom.
 */
import { invokeLlmForTask } from '@/lib/aiModelRouter';

export const INTENTS = [
  'eliminate_recurring',
  'increase_savings',
  'salary_change',
  'one_time_purchase',
  'start_investing',
  'relocate',
  'travel_budget',
  'home_purchase_timing',
  'net_worth_projection',
  'inflation_stress',
  'job_loss',
  'extra_amortization',
  'have_child',
  'micro_spending_audit',
];

const KEYWORD_TARGETS = [
  { label: 'kaffe/fika', vendorRe: /kaffe|espresso|fika|café|kafe|coffee|latte/i, triggerRe: /kaffe|fika|espresso|latte/i },
  { label: 'gymmet', vendorRe: /gym|fitness|sats|nordic wellness|actic/i, triggerRe: /gym(?:met|kort)?|fitness|träningskort/i },
  { label: 'restaurangbesök', category: 'food', triggerRe: /restaurang|äta ute|krogen|lunch ute|takeaway|hämtmat/i },
  { label: 'shopping', category: 'shopping', triggerRe: /shopping|kläder|impulsköp/i },
  { label: 'prenumerationer', isSubscriptions: true, triggerRe: /prenumeration|abonnemang/i },
];

function extractYears(text) {
  const m = text.match(/(\d{1,2})\s*år\b/i);
  if (m) return parseInt(m[1], 10);
  if (/\bett år\b/i.test(text)) return 1;
  return null;
}

function extractMonths(text) {
  const m = text.match(/(\d{1,2})\s*m[åa]n(?:ad(?:er)?)?\b/i);
  if (m) return parseInt(m[1], 10);
  if (/\ben m[åa]nad\b/i.test(text)) return 1;
  return null;
}

function extractAmountKr(text) {
  const withUnit = text.match(/(\d[\d\s]{0,6})\s*(?:kr|kronor)\b/i);
  if (withUnit) return parseInt(withUnit[1].replace(/\s/g, ''), 10);
  const stripped = text
    .replace(/\d{1,2}\s*år\b/gi, '')
    .replace(/\d{1,2}\s*m[åa]n(?:ad(?:er)?)?\b/gi, '');
  const bare = stripped.match(/\b(\d{3,7})\b/);
  return bare ? parseInt(bare[1].replace(/\s/g, ''), 10) : null;
}

/** Försöker klassificera lokalt. Returnerar null om inget mönster känns igen. */
export function classifyQuestionLocally(question) {
  const q = (question || '').toLowerCase();
  if (!q.trim()) return null;

  const amountKr = extractAmountKr(q);
  const years = extractYears(q);
  const months = extractMonths(q);

  if (/arbetslös|förlorar jobbet|blir uppsagd|mister jobbet/.test(q)) {
    return { intent: 'job_loss', months: months || 6 };
  }
  if (/amorter/.test(q)) {
    return { intent: 'extra_amortization', amountKr };
  }
  if (/\bbarn\b|graviditet|föräldraledig/.test(q)) {
    return { intent: 'have_child' };
  }
  if (/inflation/.test(q)) {
    return { intent: 'inflation_stress' };
  }
  if (/(bostad|lägenhet|hus)\b/.test(q) && /när|köpa|råd/.test(q)) {
    return { intent: 'home_purchase_timing' };
  }
  if (/\bflytta/.test(q) || /hyran (höjs|går upp)/.test(q)) {
    return { intent: 'relocate', amountKr };
  }
  if (/res(a|or)|semester/.test(q) && /hur mycket|budget|råd har jag/.test(q)) {
    return { intent: 'travel_budget' };
  }
  if (/investera|index|aktier|fond(er)?\b/.test(q)) {
    return { intent: 'start_investing', amountKr, years };
  }
  if (/lön(en)?|löneökning|höjning|höjd lön/.test(q)) {
    return { intent: 'salary_change', amountKr };
  }
  if (/köp(a|er|te)?\s*(en |ny )?bil\b|bil för/.test(q)) {
    return { intent: 'one_time_purchase', amountKr, label: 'bil' };
  }
  if (/(rikare|hur mycket pengar|om jag har)/.test(q) && years) {
    return { intent: 'net_worth_projection', years };
  }
  if (/rikare|hur mycket pengar/.test(q)) {
    return { intent: 'net_worth_projection', years: years || 10 };
  }
  if (/småköp|småutgifter|impulsköp kostar/.test(q)) {
    return { intent: 'micro_spending_audit' };
  }
  if (/spara(r)?\s*(\d[\d\s]*)?\s*(kr|kronor)?\s*(extra|mer|per|varje|i månad)/.test(q) && amountKr) {
    return { intent: 'increase_savings', amountKr };
  }

  for (const target of KEYWORD_TARGETS) {
    if (target.triggerRe.test(q)) {
      return { intent: 'eliminate_recurring', target, amountKr };
    }
  }

  return null;
}

const CLASSIFY_SCHEMA = {
  type: 'object',
  properties: {
    intent: { type: 'string', enum: INTENTS },
    amountKr: { type: ['number', 'null'] },
    years: { type: ['number', 'null'] },
    months: { type: ['number', 'null'] },
    targetLabel: { type: ['string', 'null'] },
    targetCategory: {
      type: ['string', 'null'],
      enum: ['food', 'transport', 'entertainment', 'travel', 'health', 'home', 'shopping', 'other', null],
    },
  },
  required: ['intent'],
};

/** LLM-reserv — extraherar bara struktur, räknar aldrig ut belopp själv. */
export async function classifyQuestionWithLLM(base44, question) {
  const prompt = `Klassificera en svensk fråga om personlig ekonomi till EN av dessa kategorier: ${INTENTS.join(', ')}.
Extrahera även eventuellt belopp (amountKr), antal år (years), antal månader (months), och vad frågan handlar om (targetLabel, targetCategory om det är en utgiftskategori).
Gissa INGA finansiella resultat — bara klassificering och extraherade parametrar.
Fråga: "${question}"
Returnera JSON enligt schema.`;

  const { result } = await invokeLlmForTask(base44, {
    prompt,
    response_json_schema: CLASSIFY_SCHEMA,
    scenario: 'future_whatif_classify',
  });

  if (!result?.intent || !INTENTS.includes(result.intent)) return null;

  const target = result.targetLabel || result.targetCategory
    ? { label: result.targetLabel || result.targetCategory, category: result.targetCategory || null }
    : undefined;

  return {
    intent: result.intent,
    amountKr: result.amountKr ?? null,
    years: result.years ?? null,
    months: result.months ?? null,
    target,
  };
}
