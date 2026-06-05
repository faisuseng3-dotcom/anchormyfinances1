import { buildAdvisorSnapshot } from '@/lib/buildAdvisorContext';

/** Regelbaserad briefing när AI inte svarar — samma siffror som dashboard. */
export function buildLocalBriefingFallback(profile, transactions = []) {
  const s = buildAdvisorSnapshot(profile, transactions);
  const remaining = s.remaining_this_month_kr;
  const margin = s.monthly_margin_kr;

  let headline = 'Du har bra koll';
  if (s.spent_percent_of_margin < 50 && margin > 0) headline = 'Bra jobbat — du ligger före';
  if (remaining < margin * 0.2 && margin > 0) headline = 'Lite tight mot månadsslutet';
  if (margin <= 0) headline = 'Fasta kostnader tar hela lönen';

  const message =
    margin > 0
      ? `Du har ungefär ${remaining.toLocaleString('sv-SE')} kr kvar att leva på den här månaden — det är ditt utrymme efter hyra och räkningar.`
      : `Dina fasta kostnader (${s.fixed_costs_kr.toLocaleString('sv-SE')} kr) är högre än inkomsten just nu. Vi kan titta på det tillsammans under Inställningar.`;

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
