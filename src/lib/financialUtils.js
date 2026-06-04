/**
 * Beräknar totala fasta kostnader för en profil.
 * Prioriterar fixedCostItems (ny nedbrytning) men faller tillbaka på housingCost (legacy).
 */
export function getTotalFixedCosts(profile) {
  if (!profile) return 0;
  const fixedItemsTotal = (profile.fixedCostItems || []).reduce((sum, item) => sum + (item.amount || 0), 0);
  const housingFallback = fixedItemsTotal === 0 ? (profile.housingCost || 0) : 0;
  const subscriptionCosts = (profile.subscriptions || []).reduce((sum, s) => sum + (s.amount || 0), 0);
  const loanPayments = (profile.loans || []).reduce((sum, l) => sum + (l.monthlyPayment || 0), 0);
  return fixedItemsTotal + housingFallback + subscriptionCosts + loanPayments;
}

/**
 * Returnerar månatlig marginal (inkomst - alla fasta kostnader).
 */
export function getMonthlyMargin(profile) {
  if (!profile) return 0;
  return (profile.income || 0) - getTotalFixedCosts(profile);
}

/**
 * Returnerar nedbrytning av fasta kostnader som array { label, amount }.
 */
export function getFixedCostBreakdown(profile) {
  if (!profile) return [];
  const items = [];

  if (profile.fixedCostItems && profile.fixedCostItems.length > 0) {
    profile.fixedCostItems.forEach(item => {
      if (item.amount > 0) items.push({ label: item.label || 'Kostnad', amount: item.amount });
    });
  } else if (profile.housingCost > 0) {
    items.push({ label: 'Boende', amount: profile.housingCost });
  }

  (profile.subscriptions || []).forEach(s => {
    if (s.amount > 0) items.push({ label: s.name || 'Abonnemang', amount: s.amount });
  });

  (profile.loans || []).forEach(l => {
    if (l.monthlyPayment > 0) items.push({ label: l.name || 'Lån', amount: l.monthlyPayment });
  });

  return items;
}

/** Framtida värde: månadssparande i månader med årlig avkastning (decimal, t.ex. 0.07). */
export function futureValueMonthly(monthlyKr, months, annualRate = 0.07) {
  const m = Math.max(0, months);
  const pmt = Math.max(0, monthlyKr);
  if (m === 0 || pmt === 0) return 0;
  const r = annualRate / 12;
  if (r === 0) return pmt * m;
  return Math.round(pmt * ((Math.pow(1 + r, m) - 1) / r));
}

/** Kostnad av att vänta X månader innan man börjar spara monthlyKr/mån. */
export function costOfWaiting(monthlyKr, waitMonths, horizonMonths = 360, annualRate = 0.07) {
  const withNow = futureValueMonthly(monthlyKr, horizonMonths, annualRate);
  const withDelay = futureValueMonthly(monthlyKr, Math.max(0, horizonMonths - waitMonths), annualRate);
  return Math.max(0, withNow - withDelay);
}