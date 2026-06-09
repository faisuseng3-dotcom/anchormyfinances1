/** SPA-vyer inom Copilot-shell — växlas via sidomenyn utan full sidladdning. */
export const COPILOT_VIEWS = {
  home: 'home',
  goals: 'goals',
  subscriptions: 'subscriptions',
  squads: 'squads',
  academy: 'academy',
};

export const TOOL_VIEW_IDS = new Set([
  COPILOT_VIEWS.goals,
  COPILOT_VIEWS.subscriptions,
  COPILOT_VIEWS.squads,
  COPILOT_VIEWS.academy,
]);

export const COPILOT_VIEW_PARAM = 'view';

/** Kanonisk Dashboard-URL för en verktygsvy i copilot-main. */
export function copilotToolHref(view) {
  if (!TOOL_VIEW_IDS.has(view)) return '/Dashboard';
  return `/Dashboard?${COPILOT_VIEW_PARAM}=${encodeURIComponent(view)}`;
}

export function parseCopilotViewFromSearch(search) {
  const raw = new URLSearchParams(search).get(COPILOT_VIEW_PARAM);
  return raw && TOOL_VIEW_IDS.has(raw) ? raw : null;
}

export function isCopilotToolView(view) {
  return TOOL_VIEW_IDS.has(view);
}
