import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import { AI_STACK_LAYERS, AI_MODELS } from '@/lib/aiModelRouter';
import { DashboardDivider } from '@/components/dashboard/DashboardChrome';
import SettingsPanel from './SettingsPanel';

const BADGE_STYLES = {
  Primär: 'bg-[#4fae82]/15 text-[#4fae82] ring-[#4fae82]/25',
  Specialist: 'bg-white/10 text-white/70 ring-white/15',
  'On-device': 'bg-white/10 text-white/70 ring-white/15',
  Infrastruktur: 'bg-white/10 text-white/70 ring-white/15',
  Sekundär: 'bg-white/10 text-white/70 ring-white/15',
};

export default function AnchorAIStackPanel() {
  const [open, setOpen] = useState(false);

  return (
    <SettingsPanel
      icon={Brain}
      title="Lago AI Stack"
      subtitle="Claude · Gemini · GPT · Lokal ML · Minne"
      open={open}
      onToggle={() => setOpen((v) => !v)}
    >
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
                  <div
                    key={stat.label}
                    className="rounded-[var(--anchor-radius-md)] bg-white/[0.04] ring-1 ring-white/[0.06] px-2.5 py-2 text-center anchor-elev-1"
                  >
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

      <p className="anchor-type-body-sm text-white/35 leading-relaxed pt-1">
        Claude hanterar coaching och empati. Gemini analyserar mönster och FuturePulse.
        GPT driver röst och snabba svar. Lokal ML kategoriserar offline. Embeddings minns det viktigaste.
      </p>
    </SettingsPanel>
  );
}
