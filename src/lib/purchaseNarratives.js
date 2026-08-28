/**
 * Delad text/etikett-logik för köpverdikter — samma ord i Purchase Simulator
 * (PurchaseVerdictCard) och Coach (coachDecisionRouter), byggd uteslutande
 * från financialEngine.getPurchaseImpact()/getBestPurchaseDate(). Ingen AI.
 */
const fmt = (v) => Math.round(v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export const VERDICT_META = {
  green: { emoji: '🟢', label: 'DU HAR RÅD', color: '#16A34A', shortAnswer: 'Ja, du har råd.' },
  yellow: {
    emoji: '🟡',
    label: 'DU KAN KÖPA DEN — MEN JAG SKULLE VÄNTA',
    color: '#D97706',
    shortAnswer: 'Ja, du kan köpa den — men jag skulle vänta.',
  },
  red: {
    emoji: '🔴',
    label: 'JAG SKULLE INTE KÖPA DEN JUST NU',
    color: '#DC2626',
    shortAnswer: 'Nej, jag skulle inte köpa den just nu.',
  },
};

export function purchaseConsequenceLine(impact) {
  if (!impact) return '';
  const { verdict, bufferBefore, bufferAfter, monthsToRebuild, goalDelayMonths } = impact;

  if (verdict === 'green') {
    return 'Köpet ryms inom vad du tryggt kan spendera den här månaden — det rör varken bufferten eller sparmålet.';
  }
  if (verdict === 'yellow') {
    let line = `Köpet påverkar ditt sparande. Bufferten går från ${fmt(bufferBefore)} kr till ${fmt(bufferAfter)} kr.`;
    if (goalDelayMonths > 0) line += ` Sparmålet skjuts upp ungefär ${goalDelayMonths} månad${goalDelayMonths === 1 ? '' : 'er'}.`;
    return line;
  }
  let line = `Köpet skulle göra att din buffert hamnar under din säkerhetsgräns (${fmt(bufferBefore)} kr → ${fmt(bufferAfter)} kr).`;
  if (monthsToRebuild > 0) line += ` Det tar ungefär ${monthsToRebuild} månad${monthsToRebuild === 1 ? '' : 'er'} att bygga upp den igen.`;
  return line;
}

export function purchaseWhyLine(impact) {
  if (!impact) return '';
  return `Du har ${fmt(impact.safeToSpend)} kr tryggt att spendera den här månaden, och bufferten går från ${fmt(impact.bufferBefore)} kr till ${fmt(impact.bufferAfter)} kr om du köper nu.`;
}

export function purchaseSuggestion(impact, bestDate) {
  if (!impact) return '';
  if (impact.verdict === 'green') return 'Inga ändringar behövs — köpet ryms redan i din plan.';
  if (bestDate?.found) return `vänta till ${bestDate.dateLabel} — då har bufferten hunnit återhämta sig.`;
  return 'bygg upp bufferten innan du bestämmer dig — det finns inget bra köpdatum inom de närmaste 90 dagarna än.';
}

export { fmt as fmtKr };
