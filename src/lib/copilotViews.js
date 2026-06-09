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
