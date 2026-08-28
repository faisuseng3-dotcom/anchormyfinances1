/**
 * Delad, deterministisk fritext-tolkning för köpfrågor — används av både
 * Köpchecks snabbsvar (PurchaseAnalyzer.jsx) och Coachens
 * köpfråge-routing (coachDecisionRouter.js). Ingen AI behövs för det här.
 */

/** Extraherar ett kr-belopp ur fritext, t.ex. "en TV för 8000 kr" → 8000. */
export function extractPriceKr(text) {
  if (!text) return null;
  const match = text.match(/(\d[\d\s.,]{0,9})\s*(kr\b|:-)/i);
  if (!match) return null;
  const raw = match[1].trim().replace(/[,.](\d{2})$/, '');
  const value = parseInt(raw.replace(/[^\d]/g, ''), 10);
  return Number.isFinite(value) && value > 0 ? value : null;
}

const AFFORDABILITY_RE = /\b(har jag råd|har jag råd med|kan jag köpa|kan jag ha råd|råd med)\b/i;

/** Känns igen som en köp-/råd-fråga med ett kr-belopp i sig? */
export function isAffordabilityQuestion(text) {
  return AFFORDABILITY_RE.test(text || '') && extractPriceKr(text) != null;
}
