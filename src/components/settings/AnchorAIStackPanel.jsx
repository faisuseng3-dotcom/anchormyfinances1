import React, { useState } from 'react';
import { Brain, ChevronDown } from 'lucide-react';
import { AI_STACK_LAYERS, AI_MODELS } from '@/lib/aiModelRouter';
import { DashboardDivider } from '@/components/dashboard/DashboardChrome';

const BADGE_STYLES = {
  Primär: 'bg-violet-500/20 text-violet-200 ring-violet-400/25',
  Specialist: 'bg-cyan-500/15 text-cyan-200 ring-cyan-400/20',
  'On-device': 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/20',
  Infrastruktur: 'bg-amber-500/15 text-amber-200 ring-amber-400/20',
  Sekundär: 'bg-white/10 text-white/70 ring-white/15',
};

/**
 * Visar Anchors flerlager-AI-arkitektur i Inställningar.
 */
export default function AnchorAIStackPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl ring-1 ring-white/[0.08] bg-white/[0.03] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <Brain className="w-4 h-4 text-violet-300/80 shrink-0" />
          <span>
            <span className="block text-[14px] font-medium text-white/85">Anchor AI Stack</span>
            <span className="block text-[12px] text-white/45 mt-0.5">
              Claude · Gemini · GPT · Lokal ML · Minne
            </span>
          </span>
        </span>
        <ChevronDown className={`w-4 h-4 text-white/35 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/[0.06]">
          {AI_STACK_LAYERS.map((layer, idx) => {
            const meta = AI_MODELS[layer.model];
            const badgeClass = BADGE_STYLES[layer.badge] || BADGE_STYLES.Sekundär;

            return (
              <div key={layer.model}>
                {idx > 0 && <DashboardDivider className="opacity-20 mb-4" />}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-white/90 leading-snug">{layer.title}</p>
                      <p className="text-[12px] text-white/45 mt-0.5">{layer.subtitle}</p>
                    </div>
                    <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ring-1 ${badgeClass}`}>
                      {layer.badge}
                    </span>
                  </div>

                  {layer.chips && (
                    <div className="flex flex-wrap gap-1.5">
                      {layer.chips.map((chip) => (
                        <span
                          key={chip}
                          className="text-[11px] text-white/50 px-2 py-0.5 rounded-full bg-white/[0.05] ring-1 ring-white/[0.06]"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {layer.stats.map((stat) => (
                      <div key={stat.label} className="rounded-xl bg-white/[0.04] ring-1 ring-white/[0.06] px-2.5 py-2 text-center">
                        <p className="text-[10px] text-white/40 uppercase tracking-wide">{stat.label}</p>
                        <p className="text-[13px] font-semibold text-white/80 tabular-nums mt-0.5">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {meta?.tagline && (
                    <p className="text-[11px] text-white/35">{meta.tagline}</p>
                  )}
                </div>
              </div>
            );
          })}

          <p className="text-[11px] text-white/35 leading-relaxed pt-1">
            Claude hanterar coaching och empati. Gemini analyserar mönster och FuturePulse.
            GPT driver röst och snabba svar. Lokal ML kategoriserar offline. Embeddings minns det viktigaste.
          </p>
        </div>
      )}
    </div>
  );
}
