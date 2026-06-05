/** En historik-sida — transaktioner, insikter, trender och verifikat (företag). */
export const HISTORY_TABS = [
  { id: 'list', label: 'Lista' },
  { id: 'insights', label: 'Insikter' },
  { id: 'trends', label: 'Trender' },
];

export const HISTORY_LEDGER_TAB = { id: 'ledger', label: 'Verifikat' };

export const DEFAULT_HISTORY_TAB = 'list';

export function normalizeHistoryTab(raw, { includeLedger = false } = {}) {
  const id = (raw || '').toLowerCase();
  const allowed = includeLedger
    ? [...HISTORY_TABS.map((t) => t.id), 'ledger']
    : HISTORY_TABS.map((t) => t.id);
  return allowed.includes(id) ? id : DEFAULT_HISTORY_TAB;
}

export function historyTabHref(tab, { includeLedger = false } = {}) {
  const id = normalizeHistoryTab(tab, { includeLedger });
  if (id === DEFAULT_HISTORY_TAB) return '/TransactionHistory';
  return `/TransactionHistory?tab=${id}`;
}
