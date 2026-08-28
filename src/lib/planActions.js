/**
 * Rena "ändra min plan"-handlingar — inget UI, inget AI. Körs bara efter att
 * användaren uttryckligen bekräftat i ConfirmPlanChangeSheet (aldrig direkt
 * från en Coach- eller FuturePulse-rekommendation).
 */

/** Ändrar den löpande sparplanen (kr/mån) — det FuturePulse:s "spara X mer"-
 * scenario faktiskt innebär: ett nytt löpande mål, ingen engångsöverföring. */
export async function applySavingsRateChange(profile, newMonthlyTarget, { updateProfile }) {
  await updateProfile({ savingsGoalMonthlyTarget: Math.max(0, Math.round(newMonthlyTarget)) });
}

/** Överför ett engångsbelopp från buffert till sparande nu (Dashboardens
 * "Lago rekommenderar"-flöde). */
export async function applySavingsTransfer(profile, amount, { updateProfile, createTransaction, label }) {
  const amt = Math.max(0, Math.round(amount));
  await updateProfile({
    savingsCurrentBalance: (profile.savingsCurrentBalance || 0) + amt,
    buffer: Math.max(0, (profile.buffer || 0) - amt),
  });
  await createTransaction({
    type: 'transfer_to_savings',
    amount: amt,
    label: label || `Lago-plan: +${amt.toLocaleString('sv-SE')} kr till sparandet`,
  });
}
