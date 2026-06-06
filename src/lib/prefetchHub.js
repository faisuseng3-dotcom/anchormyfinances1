// @ts-nocheck
/**
 * Prefetch kärndata och route-chunks när Hem öppnas — sidbyten ska kännas omedelbara.
 */
import { queryKeys } from '@/lib/queryKeys';
import {
  fetchFinancialProfile,
  fetchTransactions,
  fetchFuturePulse,
  buildInsightsBundle,
} from '@/lib/dataFetchers';

const STALE_MS = 5 * 60 * 1000;

/** Route-chunks som laddas i bakgrunden (Vite cachar modulen). */
export const PREFETCH_ROUTE_IMPORTS = {
  FuturePulse: () => import('@/pages/FuturePulse'),
  Budget: () => import('@/pages/BudgetDashboard'),
  TransactionHistory: () => import('@/pages/TransactionHistory'),
  ProTools: () => import('@/pages/ProTools'),
};

let hubPrefetchForProfileId = null;
let hubPrefetchStarted = false;

function scheduleIdle(task, { timeout = 2800 } = {}) {
  if (typeof window === 'undefined') return;
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(() => task(), { timeout });
  } else {
    window.setTimeout(task, 320);
  }
}

/** Ladda en route-chunk (t.ex. vid hover i nav). */
export function prefetchRoute(pageName) {
  const loader = PREFETCH_ROUTE_IMPORTS[pageName];
  if (loader) return loader();
  return Promise.resolve();
}

/**
 * Prefetch transaktioner, insikter, framtidspuls och route-chunks.
 * Körs en gång per session när dashboarden har profil.
 */
export async function prefetchDashboardHub(queryClient, { profile, isDemoMode } = {}) {
  if (isDemoMode || !profile?.id || hubPrefetchStarted) return;
  hubPrefetchStarted = true;

  const txsKey = queryKeys.transactions('-created_date', 1000, false);
  const txsPersonalKey = queryKeys.transactions('-created_date', 1000, true);

  scheduleIdle(() => {
    Promise.all(Object.values(PREFETCH_ROUTE_IMPORTS).map((load) => load())).catch(() => {});
  }, { timeout: 4000 });

  scheduleIdle(async () => {
    try {
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: queryKeys.financialProfile(),
          queryFn: fetchFinancialProfile,
          staleTime: STALE_MS,
        }),
        queryClient.prefetchQuery({
          queryKey: txsKey,
          queryFn: () => fetchTransactions({ limit: 1000, personalOnly: false }),
          staleTime: STALE_MS,
        }),
        queryClient.prefetchQuery({
          queryKey: txsPersonalKey,
          queryFn: () => fetchTransactions({ limit: 1000, personalOnly: true }),
          staleTime: STALE_MS,
        }),
      ]);

      const transactions =
        queryClient.getQueryData(txsKey) ||
        (await fetchTransactions({ limit: 1000, personalOnly: false }));
      const personalTxs =
        queryClient.getQueryData(txsPersonalKey) ||
        transactions.filter((t) => t.context !== 'BUSINESS');
      const txCount = personalTxs.length;

      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: queryKeys.futurePulse(profile.id, txCount, true),
          queryFn: () => fetchFuturePulse(profile, transactions, { compact: true }),
          staleTime: STALE_MS,
        }),
        queryClient.prefetchQuery({
          queryKey: queryKeys.futurePulse(profile.id, txCount, false),
          queryFn: () => fetchFuturePulse(profile, transactions, { compact: false }),
          staleTime: STALE_MS,
        }),
        queryClient.prefetchQuery({
          queryKey: queryKeys.insightsBundle(profile.id, txCount),
          queryFn: () => buildInsightsBundle(profile, personalTxs),
          staleTime: STALE_MS,
        }),
      ]);
    } catch {
      /* prefetch ska aldrig störa dashboard */
    }
  }, { timeout: 3500 });
}

/** Nollställ vid utloggning / demo-byte (valfritt). */
export function resetPrefetchHub() {
  hubPrefetchForProfileId = null;
}