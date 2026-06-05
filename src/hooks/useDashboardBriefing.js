import { useCallback, useEffect, useState } from 'react';
import { askPersonalAdvisor } from '@/lib/personalAdvisor';
import { hasAdvisorProfileData } from '@/lib/advisorProfile';
import { buildLocalBriefingFallback } from '@/lib/localBriefingFallback';
import { useAdvisorContext } from '@/hooks/useAdvisorContext';
import {
  getCachedAnalysis,
  setCachedAnalysis,
  invalidateCachedAnalysis,
  formatCacheTime,
} from '@/lib/aiAnalysisCache';

const SCENARIO = 'dashboard_briefing';

export function useDashboardBriefing(refreshKey = 0) {
  const { profile, transactions, isDemoMode } = useAdvisorContext();
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  const profileId = profile?.id;

  const applyBriefing = useCallback((data, at, fallback = false) => {
    setBriefing(data);
    setUpdatedAt(at);
    setUsedFallback(fallback);
    setError(false);
  }, []);

  const load = useCallback(
    async (force = false) => {
      if (!hasAdvisorProfileData(profile)) {
        setLoading(false);
        setBriefing(null);
        setUpdatedAt(null);
        return;
      }

      if (!force) {
        const cached = getCachedAnalysis(profileId, SCENARIO);
        if (cached) {
          applyBriefing(cached.data, cached.updatedAt, false);
          setLoading(false);
          return;
        }
      } else {
        invalidateCachedAnalysis(profileId, SCENARIO);
        setRefreshing(true);
      }

      setLoading(true);
      setError(false);

      try {
        const data = await askPersonalAdvisor(
          { scenario: SCENARIO },
          { profile, transactions, isDemoMode },
        );

        let result = data;
        let fallback = false;

        if (data?.needs_profile && hasAdvisorProfileData(profile)) {
          result = buildLocalBriefingFallback(profile, transactions);
          fallback = true;
        }

        const at = Date.now();
        if (!fallback && result && !result.needs_profile) {
          setCachedAnalysis(profileId, SCENARIO, result);
        }
        applyBriefing(result, at, fallback);
      } catch {
        const fallback = buildLocalBriefingFallback(profile, transactions);
        applyBriefing(fallback, Date.now(), true);
        setError(true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [profile, transactions, isDemoMode, profileId, applyBriefing],
  );

  useEffect(() => {
    load(false);
  }, [load, refreshKey]);

  const refresh = useCallback(() => load(true), [load]);

  return {
    profile,
    briefing,
    loading,
    refreshing,
    error,
    usedFallback,
    updatedAt,
    updatedAtLabel: formatCacheTime(updatedAt),
    retry: refresh,
    refresh,
    hasProfile: hasAdvisorProfileData(profile),
    fromCache: Boolean(updatedAt && !refreshing && !loading),
  };
}
