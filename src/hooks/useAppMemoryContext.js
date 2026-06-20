/**
 * Samlar app-aktivitet och semantiskt minne för AI-prompts.
 */
import { useMemo, useState, useEffect } from 'react';
import { buildMemoryPromptContext } from '@/lib/anchorMemory';
import { useAdvisorContext } from '@/hooks/useAdvisorContext';

export function useAppMemoryContext(query = '') {
  const { profile } = useAdvisorContext();
  const [context, setContext] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const block = await buildMemoryPromptContext({
        profile,
        query,
      });
      if (!cancelled) setContext(block);
    })();
    return () => { cancelled = true; };
  }, [profile, query]);

  return useMemo(() => context.replace(/^\n+/, ''), [context]);
}
