// Simulated business data for demo/presentation mode

export const SIMULATED_BUSINESS = {
  companyName: 'Lago AB',
  orgNr: '556901-2345',
  vatRate: 0.25,
  bankBalance: 284700,
  runwayMonths: 5.2,

  vatReserved: 71175, // 25% of last invoiced income

  monthlyFixedCosts: [
    { label: 'Kontorshyra', amount: 12500 },
    { label: 'Löner & sociala avgifter', amount: 85000 },
    { label: 'Programvarulicenser', amount: 4200 },
    { label: 'Telefoni & IT', amount: 1800 },
    { label: 'Revisionsarvode', amount: 3500 },
  ],

  unpaidInvoices: [
    { id: 'INV-2024-041', client: 'Spotify AB', amount: 45000, due: '2026-04-15', status: 'overdue', daysLeft: -3 },
    { id: 'INV-2024-042', client: 'IKEA Sverige', amount: 128500, due: '2026-04-30', status: 'pending', daysLeft: 21 },
    { id: 'INV-2024-043', client: 'Klarna Bank', amount: 67200, due: '2026-05-10', status: 'pending', daysLeft: 31 },
    { id: 'INV-2024-044', client: 'Vattenfall AB', amount: 23900, due: '2026-05-20', status: 'pending', daysLeft: 41 },
  ],

  vatDeadlines: [
    { label: 'Momsdeklaration Q1', date: '2026-05-12', amount: 71175, status: 'upcoming' },
    { label: 'Preliminärskatt', date: '2026-04-25', amount: 14200, status: 'soon' },
  ],

  runwayData: [
    { month: 'Apr', balance: 284700 },
    { month: 'Maj', balance: 238100 },
    { month: 'Jun', balance: 192500 + 45000 }, // INV-041 paid
    { month: 'Jul', balance: 196000 + 128500 }, // INV-042 paid
    { month: 'Aug', balance: 221500 + 67200 }, // INV-043 paid
    { month: 'Sep', balance: 189000 },
  ],

  recentTransactions: [
    { label: 'Klarna – faktura betalad', amount: 67200, type: 'income', date: '2026-04-08', deductible: false },
    { label: 'Adobe CC – team license', amount: -2490, type: 'expense', date: '2026-04-07', deductible: true },
    { label: 'Konferens Stockholm', amount: -8500, type: 'expense', date: '2026-04-05', deductible: true },
    { label: 'Spotify AB – delbetald', amount: 20000, type: 'income', date: '2026-04-04', deductible: false },
    { label: 'Serverhosting (AWS)', amount: -3200, type: 'expense', date: '2026-04-03', deductible: true },
  ],
};

export function calcMonthlyBurn(data) {
  return data.monthlyFixedCosts.reduce((sum, c) => sum + c.amount, 0);
}