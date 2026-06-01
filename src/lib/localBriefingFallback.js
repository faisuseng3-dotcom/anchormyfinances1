import { buildAdvisorSnapshot } from '@/lib/buildAdvisorContext';

/** Regelbaserad briefing när AI inte svarar — samma siffror som dashboard. */
export function buildLocalBriefingFallback(profile, transactions = []) {
  const s = buildAdvisorSnapshot(profile, transactions);
  const remaining = s.remaining_this_month_kr;
  const margin = s.monthly_margin_kr;

  let headline = 'Bra koll den här månaden';
  if (remaining < margin * 0.2 && margin > 0) headline = 'Tight mot månadsslutet';
  if (margin <= 0) headline = 'Fasta kostnader äter upp inkomsten';

  const message =
    margin > 0
      ? `Du har ungefär ${remaining.toLocaleString('sv-SE')} kr kvar att fördela den här månaden efter fasta kostnader (${margin.toLocaleString('sv-SE')} kr marginal).`
      : `Dina fasta kostnader är ${s.fixed_costs_kr.toLocaleString('sv-SE')} kr mot inkomst ${s.income_kr.toLocaleString('sv-SE')} kr — justera budget eller kostnader under Inställningar.`;

  const actions = [];
  if (s.spent_percent_of_margin > 70 && margin > 0) {
    actions.push({
      title: 'Sänk tempot denna vecka',
      detail: `Du har använt ${s.spent_percent_of_margin} % av marginalen hittills.`,
      impact_kr: 0,
    });
  }
  if (s.buffer_months < 2 && s.buffer_kr > 0) {
    actions.push({
      title: 'Stärk bufferten',
      detail: `Bufferten räcker cirka ${s.buffer_months} månader vid nuvarande kostnader.`,
      impact_kr: 0,
    });
  }
  actions.push({
    title: 'Planera kommande utgifter',
    detail: 'Lägg middagar, räkningar och resor i kalendern så inget överraskar dig.',
    impact_kr: 0,
  });

  return {
    headline,
    message,
    actions: actions.slice(0, 3),
    _source: 'local_fallback',
  };
}
