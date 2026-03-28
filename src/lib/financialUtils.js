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