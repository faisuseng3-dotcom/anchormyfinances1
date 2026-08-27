/**
 * Deterministisk beslutsrouting för Coach — körs innan LLM:et. Om frågan är
 * en köpfråga eller en "vad händer om"-fråga räknas svaret alltid av
 * financialEngine, aldrig av AI. AI:n tolkar frågan (regex/lokal
 * klassificering här, LLM bara som reserv i intentClassifier), men hittar
 * aldrig på siffrorna själv.
 *
 * Arkitektur: User question → tolka intent → Financial/Scenario Engine →
 * deterministisk beräkning → strukturerat svar → (valfri action).
 */
import { extractPriceKr, isAffordabilityQuestion } from '@/lib/purchaseTextParsing';
import { getPurchaseImpact, getBestPurchaseDate, runWhatIf } from '@/lib/financialEngine';
import { VERDICT_META, purchaseWhyLine, purchaseConsequenceLine, purchaseSuggestion } from '@/lib/purchaseNarratives';
import { classifyQuestionLocally } from '@/lib/futureQuestions/intentClassifier';
import { createPageUrl } from '@/utils';

function buildStructuredAnswer({ kortSvar, varfor, konsekvens, forslag }) {
  return [
    kortSvar,
    '',
    'Varför',
    varfor,
    '',
    'Konsekvens',
    konsekvens,
    '',
    'Mitt förslag',
    forslag,
  ].join('\n');
}

function routeAffordabilityQuestion(question, profile, transactions) {
  const price = extractPriceKr(question);
  if (!price) return null;

  const impact = getPurchaseImpact(profile, transactions, price);
  const bestDate = getBestPurchaseDate(profile, transactions, price);
  const meta = VERDICT_META[impact.verdict] || VERDICT_META.yellow;

  const answer = buildStructuredAnswer({
    kortSvar: meta.shortAnswer,
    varfor: purchaseWhyLine(impact),
    konsekvens: purchaseConsequenceLine(impact),
    forslag: purchaseSuggestion(impact, bestDate),
  });

  return {
    handled: true,
    answer,
    actions: [{ label: 'Öppna Köpsimulatorn', href: createPageUrl('PurchaseSimulator') }],
  };
}

// classifyQuestionLocally tolkar ALLT som en scenariofråga (rimligt på
// Framtid-sidans dedikerade "fråga om scenarier"-ruta) — i Coach-chatten är
// de flesta meddelanden inte det, så vi kräver en tydlig hypotetisk fras
// innan vi ens frågar klassificeraren, för att inte kapa vanliga frågor.
const SCENARIO_PHRASE_RE = /vad händer om|om jag (slutar|börjar|sparar|köper|flyttar|får|skulle)|hur (kan jag|snabbt|länge|mycket) (spara|nå|bli)/i;

function routeWhatIfQuestion(question, profile, transactions) {
  if (!SCENARIO_PHRASE_RE.test(question)) return null;

  const classified = classifyQuestionLocally(question);
  if (!classified) return null;

  const scenario = runWhatIf(classified.intent, classified, profile, transactions);
  if (!scenario) return null;

  const parts = [scenario.title, '', scenario.narrative];
  if (scenario.assumption) parts.push('', scenario.assumption);

  return {
    handled: true,
    answer: parts.join('\n'),
    actions: [{ label: 'Öppna Framtid', href: createPageUrl('FuturePulse') }],
  };
}

/**
 * @returns {{ handled: boolean, answer?: string, actions?: {label:string, href:string}[] }}
 */
export function routeCoachDecision(question, profile, transactions = []) {
  if (!question?.trim() || !profile?.income) return { handled: false };

  if (isAffordabilityQuestion(question)) {
    const result = routeAffordabilityQuestion(question, profile, transactions);
    if (result) return result;
  }

  const whatIf = routeWhatIfQuestion(question, profile, transactions);
  if (whatIf) return whatIf;

  return { handled: false };
}
