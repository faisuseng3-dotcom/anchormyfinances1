/**
 * Juridisk ansvarsfriskrivning — visas endast i Inställningar / Användarvillkor,
 * aldrig som avbrott i coach-svar.
 */

export const ANCHOR_COACH_DISCLAIMER =
  'Lago är ett planeringsverktyg, inte licensierad finansiell rådgivning. ' +
  'Beräkningar och coach-texter bygger på de siffror du anger och är simuleringar — ' +
  'inte rekommendationer att köpa, sälja eller omstrukturera tillgångar eller skulder. ' +
  'Vid större ekonomiska beslut, kontakta en certifierad rådgivare eller auktoriserad revisor.';

const DISCLAIMER_PATTERNS = [
  /detta är inte finansiell rådgivning\.?/gi,
  /inte finansiell rådgivning\.?/gi,
  /anchor tillhandahåller inte licensierad finansiell rådgivning\.?/gi,
  /lago tillhandahåller inte licensierad finansiell rådgivning\.?/gi,
  /all[aä] beräkningar[^.]*simuleringar[^.]*\./gi,
  /ska inte betraktas som rekommendationer[^.]*\./gi,
  /kontakta (en )?certifierad[^.]*\./gi,
  /observera att[^.]*\./gi,
  /tänk på att detta (inte|är)[^.]*\./gi,
  /endast (till )?informationsändamål\.?/gi,
  /en vägledning, inte[^.]*\./gi,
];

/** Ta bort ansvarsfriskrivningar som LLM ibland stoppar in i svar. */
export function stripDisclaimerFromText(text) {
  if (!text || typeof text !== 'string') return text;
  let out = text;
  DISCLAIMER_PATTERNS.forEach((re) => {
    out = out.replace(re, '');
  });
  return out
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.!?])/g, '$1')
    .trim();
}
