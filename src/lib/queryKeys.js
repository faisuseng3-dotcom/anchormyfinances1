/** Centrala React Query-nycklar — samma nycklar vid fetch och prefetch. */
export const queryKeys = {
  financialProfile: () => ['financialProfile'],
  transactions: (order = '-created_date', limit = 500, personalOnly = false) =>
    ['transactions', order, limit, personalOnly],
  futurePulse: (profileId, txCount, compact) =>
    ['futurePulse', profileId, txCount, compact ? 'compact' : 'full'],
  insightsBundle: (profileId, txCount) => ['insightsBundle', profileId, txCount],
};
