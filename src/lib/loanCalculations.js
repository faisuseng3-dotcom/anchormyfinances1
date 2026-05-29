/** Primary loan — highest interest first (avalanche). */
export function getPrimaryLoan(profile) {
  const loans = profile?.loans || [];
  if (!loans.length) return null;
  return [...loans].sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0))[0];
}

/** How much of this month's payment is principal vs interest. */
export function getMonthlyPaymentSplit(loan) {
  if (!loan) return { amortization: 0, interest: 0, payment: 0, amortPercent: 0 };
  const balance = loan.totalAmount || 0;
  const payment = loan.monthlyPayment || 0;
  const interest = balance * ((loan.interestRate || 0) / 100 / 12);
  const amortization = Math.max(0, payment - interest);
  const amortPercent = payment > 0 ? Math.round((amortization / payment) * 100) : 0;
  return { amortization, interest, payment, amortPercent };
}

/** Months to payoff and total interest paid. */
export function calcPayoff(loan, extraMonthly = 0) {
  if (!loan?.monthlyPayment) {
    return { months: 0, totalInterest: 0, years: 0 };
  }
  const monthlyRate = (loan.interestRate || 0) / 100 / 12;
  const payment = (loan.monthlyPayment || 0) + extraMonthly;
  let balance = loan.totalAmount || 0;
  let totalInterest = 0;
  let months = 0;

  while (balance > 0.5 && months < 600) {
    const interestThisMonth = balance * monthlyRate;
    totalInterest += interestThisMonth;
    const principal = Math.min(Math.max(payment - interestThisMonth, 0), balance);
    if (principal <= 0 && payment <= interestThisMonth) break;
    balance -= principal;
    months++;
  }

  return { months, totalInterest, years: months / 12 };
}

export function comparePayoff(loan, extraMonthly) {
  const base = calcPayoff(loan, 0);
  const boosted = calcPayoff(loan, extraMonthly);
  return {
    base,
    boosted,
    yearsSaved: Math.max(0, base.years - boosted.years),
    interestSaved: Math.max(0, base.totalInterest - boosted.totalInterest),
  };
}

export function getLoanInsight(loan) {
  const rate = loan?.interestRate || 0;
  if (rate <= 0) {
    return 'Du betalar ingen ränta — hela månadsbeloppet minskar skulden direkt.';
  }
  if (rate < 1) {
    return 'Räntan är mycket låg. Det mesta av betalningen går till att minska skulden, inte till banken.';
  }
  if (rate < 4) {
    return 'Räntan är måttlig. Extra betalningar kan fortfarande spara både tid och pengar.';
  }
  return 'Räntan är hög relativt sparkonton. Det kan löna sig att betala extra när du har utrymme.';
}

export function getLoanRateLabel(rate) {
  if (rate <= 0) return 'Räntefritt';
  if (rate < 1) return 'Låg ränta';
  if (rate < 4) return 'Normal ränta';
  return 'Hög ränta';
}
