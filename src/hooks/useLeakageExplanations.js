import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Hämtar korta AI-förklaringar för läckage som regelmotorn hittat.
 */
export function useLeakageExplanations(leaks, enabled = true) {
  const leakKey = (leaks || []).map((l) => l.id).join(',');

  return useQuery({
    queryKey: ['leakageExplain', leakKey],
    queryFn: async () => {
      const res = await base44.functions.invoke('explainLeakage', {
        leaks: (leaks || []).map((l) => ({
          id: l.id,
          type: l.type,
          title: l.title,
          description: l.description,
          monthlyAmount: l.monthlyAmount,
        })),
      });

      const map = {};
      (res.data?.explanations || []).forEach((row) => {
        if (row.id && row.text) map[row.id] = row.text;
      });
      return map;
    },
    enabled: enabled && (leaks?.length ?? 0) > 0,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}
