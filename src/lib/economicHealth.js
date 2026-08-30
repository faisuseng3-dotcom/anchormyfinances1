import { getTotalFixedCosts, getMonthlyMargin } from '@/lib/financialUtils';

/**
 * Omvänd MLI (belastning) → "Ekonomisk ro" 0–100.
 */
export function getEconomicHealth(mli = 0) {
  const score = Math.max(0, Math.min(100, 100 - Math.round(mli)));
  if (score >= 75) {
    return {
      score,
      label: 'Bra koll',
      hint: 'Du har överblick över inkomst, utgifter och buffert.',
      color: 'var(--color-success)',
    };
  }
  if (score >= 50) {
    return {
      score,
      label: 'Stabil',
      hint: 'Några saker kan optimeras — vi visar vad som hjälper mest.',
      color: 'var(--color-success)',
    };
  }
  if (score >= 30) {
    return {
      score,
      label: 'Spänd',
      hint: 'Fokusera på det viktigaste den närmaste veckan.',
      color: 'var(--color-warning)',
    };
  }
  return {
    score,
    label: 'Tight läge',
    hint: 'Ta det lugnt — små steg ger kontroll snabbt.',
    color: 'var(--color-danger)',
  };
}

/** Hur många månader bufferten täcker fasta kostnader. */
export function getBufferRunwayMonths(profile) {
  if (!profile) return null;
  const buffer = profile.buffer || 0;
  const fixed = getTotalFixedCosts(profile);
  if (fixed <= 0 || buffer <= 0) return null;
  return Math.round((buffer / fixed) * 10) / 10;
}

export function buildFallbackBriefing(profile) {
  const margin = getMonthlyMargin(profile);
  const buffer = profile?.buffer || 0;
  const runway = getBufferRunwayMonths(profile);

  const actions = [];
  if (margin > 0) {
    actions.push({
      title: 'Håll dig inom marginalen',
      detail: `Du har cirka ${Math.round(margin).toLocaleString('sv-SE')} kr kvar den här månaden efter fasta kostnader.`,
      impact_kr: 0,
    });
  }
  if (runway != null && runway < 3) {
    actions.push({
      title: 'Stärk bufferten',
      detail: `Din buffert täcker cirka ${runway} månaders fasta kostnader — sikta på minst 3.`,
      impact_kr: 0,
    });
  }
  actions.push({
    title: 'Planera kommande utgifter',
    detail: 'Lägg in abonnemang och planerade köp i kalendern så inget överraskar.',
    impact_kr: 0,
  });

  return {
    headline: margin > 0 ? 'Du har koll på grunderna' : 'Dags att stämma av kostnaderna',
    message:
      margin > 0
        ? `Med ${Math.round(profile.income || 0).toLocaleString('sv-SE')} kr i inkomst och en marginal på ${Math.round(margin).toLocaleString('sv-SE')} kr kan du fatta trygga beslut den här månaden.${buffer > 0 ? ` Buffert: ${Math.round(buffer).toLocaleString('sv-SE')} kr.` : ''}`
        : 'Dina fasta kostnader äter upp inkomsten just nu. Börja med att granska abonnemang och boende under Inställningar.',
    actions: actions.slice(0, 3),
    _fallback: true,
  };
}
