import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import { AI_STACK_LAYERS, AI_MODELS } from '@/lib/aiModelRouter';
import { DashboardDivider } from '@/components/dashboard/DashboardChrome';
import SettingsPanel from './SettingsPanel';

const BADGE_STYLES = {
  Primär: 'bg-[var(--color-accent)]/15 text-[var(--color-accent)] ring-[var(--color-accent)]/25',
  Specialist: 'bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)] ring-[var(--color-border)]',
  'On-device': 'bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)] ring-[var(--color-border)]',
  Infrastruktur: 'bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)] ring-[var(--color-border)]',
  Sekundär: 'bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)] ring-[var(--color-border)]',
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
                  <p className="text-[14px] font-medium text-[var(--color-text-primary)] leading-snug">{layer.title}</p>
                  <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">{layer.subtitle}</p>
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
                      className="text-[11px] text-[var(--color-text-secondary)] px-2 py-0.5 rounded-full bg-[var(--color-background-secondary)] ring-1 ring-[var(--color-border)]"
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
                    className="rounded-[var(--anchor-radius-md)] bg-[var(--color-background-secondary)] ring-1 ring-[var(--color-border)] px-2.5 py-2 text-center anchor-elev-1"
                  >
                    <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">{stat.label}</p>
                    <p className="text-[13px] font-semibold text-[var(--color-text-secondary)] tabular-nums mt-0.5">{stat.value}</p>
                  </div>
                ))}
              </div>

              {meta?.tagline && (
                <p className="text-[11px] text-[var(--color-text-muted)]">{meta.tagline}</p>
              )}
            </div>
          </div>
        );
      })}

      <p className="anchor-type-body-sm text-[var(--color-text-muted)] leading-relaxed pt-1">
        Claude hanterar coaching och empati. Gemini analyserar mönster och FuturePulse.
        GPT driver röst och snabba svar. Lokal ML kategoriserar offline. Embeddings minns det viktigaste.
      </p>
    </SettingsPanel>
  );
}
