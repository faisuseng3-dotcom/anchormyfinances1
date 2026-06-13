import { createPageUrl } from '@/utils';

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

/** Kanonisk URL per verktygsvy. Prenumerationer har egen route — inte ?view= på Dashboard. */
export function copilotToolHref(view) {
  if (view === COPILOT_VIEWS.subscriptions) return createPageUrl('Subscriptions');
  if (!TOOL_VIEW_IDS.has(view)) return createPageUrl('Dashboard');
  return `${createPageUrl('Dashboard')}?${COPILOT_VIEW_PARAM}=${encodeURIComponent(view)}`;
}

/** Vilken copilot-vy som är aktiv utifrån pathname + query. */
export function resolveCopilotToolView(pathname, search) {
  const page = pathname.split('/').filter(Boolean).pop() || 'Dashboard';
  if (page === 'Subscriptions') return COPILOT_VIEWS.subscriptions;
  if (page === 'Dashboard') return parseCopilotViewFromSearch(search);
  return null;
}

export function parseCopilotViewFromSearch(search) {
  const raw = new URLSearchParams(search).get(COPILOT_VIEW_PARAM);
  return raw && TOOL_VIEW_IDS.has(raw) ? raw : null;
}

export function isCopilotToolView(view) {
  return TOOL_VIEW_IDS.has(view);
}
