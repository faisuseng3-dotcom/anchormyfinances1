/** Delad logik för CSV/bankimport — onboarding + Import-sida */

export const BANK_COLUMN_MAPS = {
  date: ['datum', 'date', 'bokföringsdag', 'transaktionsdatum', 'bokf.dag'],
  description: ['transaktion', 'text', 'beskrivning', 'referens', 'ändamål', 'mottagare', 'transaction', 'description'],
  amount: ['belopp', 'amount', 'summa', 'debet', 'kredit', 'saldo', 'transaktionsbelopp'],
};

export function detectColumn(headers, candidates) {
  for (const c of candidates) {
    const found = headers.find((h) => h.toLowerCase().trim() === c);
    if (found) return found;
  }
  return null;
}

// Skydd mot patologiskt stora filer, inte en realistisk gräns — ett par års
// dagliga transaktioner ryms gott och väl under detta.
export function normalizeCSVRows(rows, headers, limit = 1000) {
  const dateCol = detectColumn(headers, BANK_COLUMN_MAPS.date);
  const descCol = detectColumn(headers, BANK_COLUMN_MAPS.description);
  const amtCol = detectColumn(headers, BANK_COLUMN_MAPS.amount);

  return rows
    .slice(0, limit)
    .map((r) => ({
      _date: dateCol ? r[dateCol] : r[headers[0]] || '',
      _description: descCol ? r[descCol] : r[headers[1]] || '',
      _amount: amtCol
        ? parseFloat((r[amtCol] || '0').toString().replace(',', '.').replace(/\s/g, ''))
        : 0,
    }))
    .filter((r) => r._description);
}

export function rowsToTransactions(rows) {
  return rows.map((r) => ({
    type: (r._amount || 0) > 0 ? 'income' : 'expense',
    amount: r._amount,
    label: r._description,
    vendor: r._description,
    category: r._category || 'other',
    context: 'PERSONAL',
  }));
}
