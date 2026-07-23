/** Delad lånematematik — Loans-sidan och skuldfrihetshjälten. */

export function estimateMonthsToDebtFree(loans) {
  if (!loans?.length) return 0;
  let maxMonths = 0;
  loans.forEach((loan) => {
    const balance = loan.totalAmount || 0;
    const payment = loan.monthlyPayment || 0;
    const interest = balance * ((loan.interestRate || 0) / 100 / 12);
    const principal = Math.max(0, payment - interest);
    if (principal <= 0 || balance <= 0) return;
    maxMonths = Math.max(maxMonths, Math.ceil(balance / principal));
  });
  return maxMonths;
}

/** Samma som ovan, men med extra kronor lagda på ett specifikt lån (avalanche-metoden). */
export function monthsToDebtFreeWithExtra(loans, boostLoanIndex, extra) {
  if (!loans?.length) return 0;
  let maxMonths = 0;
  loans.forEach((loan, i) => {
    const balance = loan.totalAmount || 0;
    const payment = (loan.monthlyPayment || 0) + (i === boostLoanIndex ? Math.max(0, extra) : 0);
    const interest = balance * ((loan.interestRate || 0) / 100 / 12);
    const principal = Math.max(0, payment - interest);
    if (principal <= 0 || balance <= 0) return;
    maxMonths = Math.max(maxMonths, Math.ceil(balance / principal));
  });
  return maxMonths;
}

/** Lånet extra kronor bör läggas på — högst ränta vinner, annars störst skuld. */
export function pickBoostLoanIndex(loans) {
  if (!loans?.length) return -1;
  let best = 0;
  loans.forEach((loan, i) => {
    const current = loans[best];
    const rate = loan.interestRate || 0;
    const bestRate = current.interestRate || 0;
    if (rate > bestRate || (rate === bestRate && (loan.totalAmount || 0) > (current.totalAmount || 0))) {
      best = i;
    }
  });
  return best;
}
