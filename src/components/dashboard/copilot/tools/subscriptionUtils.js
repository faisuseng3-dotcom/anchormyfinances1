import { getUpcomingSubscriptions } from '../copilotDashboardUtils';

const STREAMING = /streaming|netflix|spotify|disney|hbo|viaplay|youtube|apple tv/i;

/** Abonnemang som sannolikt inte använts på 14+ dagar */
export function getUnusedStreamingSubs(profile, transactions = []) {
  const subs = profile?.subscriptions || [];
  const cutoff = Date.now() - 14 * 86400000;

  return subs.filter((sub) => {
    if (sub.aiNote && /ej använt|inte använt|avsluta/i.test(sub.aiNote)) return true;
    const name = (sub.name || '').toLowerCase();
    const isStreaming = sub.category === 'streaming' || STREAMING.test(name);
    if (!isStreaming) return false;

    const hasRecentTx = (transactions || []).some((tx) => {
      const label = `${tx.vendor || ''} ${tx.label || ''} ${tx.description || ''}`.toLowerCase();
      if (!label.includes(name.split(' ')[0])) return false;
      const d = new Date(tx.created_date || tx.date).getTime();
      return d >= cutoff;
    });
    return !hasRecentTx;
  });
}

export function getWeeklyActiveSubs(profile, transactions = []) {
  const subs = profile?.subscriptions || [];
  const weekStart = Date.now() - 7 * 86400000;

  const activeNames = new Set();
  (transactions || []).forEach((tx) => {
    const d = new Date(tx.created_date || tx.date).getTime();
    if (d < weekStart) return;
    const label = `${tx.vendor || ''} ${tx.label || ''}`.toLowerCase();
    subs.forEach((sub) => {
      const key = (sub.name || '').toLowerCase().split(' ')[0];
      if (key && label.includes(key)) activeNames.add(sub.name);
    });
  });

  if (activeNames.size === 0) {
    return subs.filter((s) => s.category === 'streaming').slice(0, 3);
  }
  return subs.filter((s) => activeNames.has(s.name));
}

export { getUpcomingSubscriptions };
