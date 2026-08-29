// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getTotalFixedCosts } from '@/lib/financialUtils';
import { Loader2 } from 'lucide-react';
import { DashboardStatStrip } from '@/components/dashboard/DashboardChrome';
import { anchorDisplayClass, sectionMetaClass, sectionSubtitleClass } from '@/lib/anchorTheme';

export default function AIGuru({ profile }) {
  const income = profile?.income || 0;
  const fixed = getTotalFixedCosts(profile || {});
  const margin = Math.max(0, income - fixed);

  const [extra, setExtra] = useState(500);
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const newMargin = margin + extra;

  const fetchAIResponse = async (value) => {
    if (!profile) return;
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        model: 'claude_sonnet_4_6',
        prompt: `Svara på svenska i max 2 meningar, konkret och utan emojis.
Användaren sparar ${value} kr extra per månad. Inkomst ${income} kr, fasta ${fixed} kr, marginal ${margin} kr.
Ge en tydlig insikt om vad det betyder per år.`,
      });
      setAiResponse(result);
    } catch {
      setAiResponse(
        `Med ${value.toLocaleString('sv-SE')} kr extra per månad blir det ${Math.round(value * 12).toLocaleString('sv-SE')} kr per år.`,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchAIResponse(extra), 600);
    return () => clearTimeout(t);
  }, [extra]);

  return (
    <div className="space-y-6">
      <div>
        <p className={sectionMetaClass}>Extra sparande per månad</p>
        <p className={`${anchorDisplayClass} mt-2`} style={{ fontSize: '2.25rem' }}>
          {extra.toLocaleString('sv-SE')}
          <span className="text-lg font-medium text-[var(--color-text-muted)] ml-1">kr</span>
        </p>
        <input
          type="range"
          min={100}
          max={Math.max(10000, Math.round(margin * 0.9))}
          step={100}
          value={extra}
          onChange={(e) => setExtra(Number(e.target.value))}
          className="w-full mt-4 h-1 rounded-full appearance-none cursor-pointer accent-[var(--color-accent)]"
        />
        <div className="flex justify-between mt-1">
          <span className={sectionMetaClass}>100 kr</span>
          <span className={sectionMetaClass}>
            {Math.max(10000, Math.round(margin * 0.9)).toLocaleString('sv-SE')} kr
          </span>
        </div>
      </div>

      <DashboardStatStrip
        items={[
          { label: 'Per år', value: `${Math.round(extra * 12).toLocaleString('sv-SE')} kr` },
          { label: 'Ny marginal', value: `${newMargin.toLocaleString('sv-SE')} kr` },
        ]}
      />

      <div className="min-h-[72px]">
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-[var(--color-text-secondary)] animate-spin" />
            <p className={sectionSubtitleClass}>Räknar…</p>
          </div>
        ) : (
          <p className="text-[15px] text-[var(--color-text-secondary)] leading-relaxed">
            {aiResponse || 'Dra i reglaget för att se effekten.'}
          </p>
        )}
      </div>
    </div>
  );
}
