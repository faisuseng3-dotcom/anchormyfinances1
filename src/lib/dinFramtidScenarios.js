/**
 * Din Framtid — optimistisk / realistisk / pessimistisk + slider-justeringar.
 */
import { computeLocalFuturePulse, enrichFuturePulseDetail } from '@/lib/futurePulseEngine';

export const SCENARIO_MODES = [
  {
    id: 'optimistic',
    label: 'Optimistisk',
    icon: 'optimistic',
    incomeMult: 1.05,
    spendMult: 0.82,
    saveBoostKr: 400,
    blurb: 'Du håller i utgifterna och får lite mer att röra dig med.',
  },
  {
    id: 'realistic',
    label: 'Realistisk',
    icon: 'realistic',
    incomeMult: 1,
    spendMult: 1,
    saveBoostKr: 0,
    blurb: 'Utifrån hur du faktiskt spenderat senaste veckorna.',
  },
  {
    id: 'pessimistic',
    label: 'Pessimistisk',
    icon: 'pessimistic',
    incomeMult: 0.93,
    spendMult: 1.2,
    saveBoostKr: 0,
    blurb: 'Om utgifterna tickar upp eller inkomsten sjunker lite.',
  },
];

export function normalizeScenarioMode(raw) {
  const id = (raw || 'realistic').toLowerCase();
  return SCENARIO_MODES.some((m) => m.id === id) ? id : 'realistic';
}

/** Applicera scenario + slider på profil och spend-mult. */
export function buildScenarioInputs(profile, modeId, sliders = {}) {
  const mode = SCENARIO_MODES.find((m) => m.id === modeId) || SCENARIO_MODES[1];
  const incomePct = Number(sliders.incomePct) || 0;
  const spendPct = Number(sliders.spendPct) || 0;
  const saveKr = Number(sliders.saveKr) || 0;

  const incomeFactor = mode.incomeMult * (1 + incomePct / 100);
  const spendMult = mode.spendMult * (1 + spendPct / 100);
  const saveBoostKr = mode.saveBoostKr + saveKr;

  const adjustedProfile = {
    ...profile,
    income: Math.round((profile?.income || 0) * incomeFactor),
  };

  return { adjustedProfile, spendMult, saveBoostKr, mode };
}

/** Lokal prognos för valt scenario (snabb, ingen LLM). */
export function computeScenarioForecast(profile, transactions, modeId, sliders = {}) {
  if (!profile) return null;
  const { adjustedProfile, spendMult, saveBoostKr } = buildScenarioInputs(profile, modeId, sliders);
  const raw = computeLocalFuturePulse(adjustedProfile, transactions, 60, 6, { spendMult, saveBoostKr });
  return enrichFuturePulseDetail(raw, adjustedProfile);
}

/** Delbar enrad för social delning. */
export function scenarioShareLine(forecast, mode) {
  const label = mode?.label || 'Realistisk';
  const bal = forecast?.prognos_30_dagar || forecast?._meta?.day30Balance;
  if (!bal) return `${label} scenario — öppna Din Framtid i Lago`;
  return `${label}: ${bal} om 30 dagar (simulerat i Lago)`;
}
