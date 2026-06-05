/** Din Framtid — en samlad sida (Pulse + WhatIf + FuturePulse). */
export const PLANERA_TABS = [
  { id: 'framtid', label: 'Din Framtid' },
  { id: 'kalender', label: 'Kalender' },
];

export const DEFAULT_PLANERA_TAB = 'framtid';

export function normalizePlaneraTab(raw) {
  const id = (raw || '').toLowerCase();
  if (id === 'kalender') return 'kalender';
  if (['nu', 'prognos', 'scenario', 'framtid'].includes(id)) return 'framtid';
  return DEFAULT_PLANERA_TAB;
}

export function planeraTabHref(tab) {
  const id = normalizePlaneraTab(tab);
  if (id === 'kalender') return '/FuturePulse?view=kalender';
  return '/FuturePulse';
}
