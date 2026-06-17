/**
 * Konkreta handlings-scenarier för Framtid — A/B/C med 30-dagars saldo.
 */
import { computeLocalFuturePulse } from '@/lib/futurePulseEngine';

function parse30DayBalance(forecast) {
  const m = String(forecast?.prognos_30_dagar || '').match(/([\d\s]+)/);
  return m ? parseInt(m[1].replace(/\s/g, ''), 10) : 0;
}

function buildScenario(profile, transactions, { spendMult = 1, profilePatch = {} } = {}) {
  const adjusted = { ...profile, ...profilePatch };
  const forecast = computeLocalFuturePulse(adjusted, transactions, 60, 2, { spendMult });
  return {
    balance: parse30DayBalance(forecast),
    forecast,
  };
}

/** Tre tydliga scenarier med verklig profildata. */
export function buildActionScenarios(profile, transactions) {
  if (!profile?.income) return [];

  const subs = [...(profile.subscriptions || [])].sort((a, b) => (b.amount || 0) - (a.amount || 0));
  const pausedSubs = subs.slice(0, 2);
  const pausedTotal = pausedSubs.reduce((s, x) => s + (x.amount || 0), 0);
  const remainingSubs = subs.slice(2);

  const scenarioA = buildScenario(profile, transactions, { spendMult: 1 });
  const scenarioB = buildScenario(profile, transactions, { spendMult: 0.72 });
  const scenarioC = buildScenario(profile, transactions, {
    profilePatch: { subscriptions: remainingSubs },
    spendMult: 1,
  });

  const fmt = (n) => `${Math.round(n).toLocaleString('sv-SE')} kr`;

  return [
    {
      id: 'continue',
      label: 'Fortsätt som nu',
      balance: scenarioA.balance,
      balanceLabel: fmt(scenarioA.balance),
      delta: 0,
      accent: '#8fa8d8',
    },
    {
      id: 'restaurants',
      label: 'Minska restaurangutgifter',
      balance: scenarioB.balance,
      balanceLabel: fmt(scenarioB.balance),
      delta: scenarioB.balance - scenarioA.balance,
      accent: '#4fc3f7',
    },
    {
      id: 'subscriptions',
      label: pausedSubs.length >= 2
        ? `Pausa ${pausedSubs[0].name} & ${pausedSubs[1].name}`
        : 'Pausa två abonnemang',
      balance: scenarioC.balance,
      balanceLabel: fmt(scenarioC.balance),
      delta: scenarioC.balance - scenarioA.balance,
      accent: '#22d97a',
      hint: pausedTotal > 0 ? `Sparar ${fmt(pausedTotal)}/mån` : null,
    },
  ];
}
