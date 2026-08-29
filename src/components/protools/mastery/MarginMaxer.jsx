import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Scissors, Check } from 'lucide-react';
import { DashboardDivider, DashboardListRow } from '@/components/dashboard/DashboardChrome';
import {
  anchorSecondaryButtonClass,
  sectionMetaClass,
  sectionSubtitleClass,
} from '@/lib/anchorTheme';

const CATEGORY_LABELS = {
  entertainment: 'Underhållning',
  transport: 'Transport',
  health: 'Hälsa',
  streaming: 'Streaming',
  food: 'Mat',
  insurance: 'Försäkring',
  other: 'Övrigt',
};

export default function MarginMaxer({ profile }) {
  const queryClient = useQueryClient();
  const [killed, setKilled] = useState([]);
  const [loading, setLoading] = useState(null);

  const subs = (profile?.subscriptions || []).filter((_, i) => !killed.includes(i));
  const killedSubs = (profile?.subscriptions || []).filter((_, i) => killed.includes(i));
  const totalKilled = killedSubs.reduce((s, sub) => s + (sub.amount || 0), 0);

  const handleKill = async (idx) => {
    if (!profile?.id) return;
    setLoading(idx);
    const newSubs = (profile.subscriptions || []).filter((_, i) => i !== idx);
    await base44.entities.FinancialProfile.update(profile.id, { subscriptions: newSubs });
    setKilled((prev) => [...prev, idx]);
    queryClient.invalidateQueries({ queryKey: ['financialProfile'] });
    setLoading(null);
  };

  return (
    <div className="space-y-5">
      {totalKilled > 0 && (
        <div className="text-center py-2">
          <p className={sectionMetaClass}>Du sparar nu</p>
          <p className="text-[28px] font-semibold text-[var(--color-success)] tabular-nums mt-1">
            +{totalKilled.toLocaleString('sv-SE')} kr/mån
          </p>
          <p className={sectionSubtitleClass}>
            {Math.round(totalKilled * 12).toLocaleString('sv-SE')} kr per år
          </p>
        </div>
      )}

      {subs.length === 0 && totalKilled === 0 && (
        <p className={sectionSubtitleClass}>Inga abonnemang i profilen. Lägg till under Inställningar.</p>
      )}

      {subs.length === 0 && totalKilled > 0 && (
        <p className="text-[15px] text-[var(--color-text-secondary)] text-center">Alla listade abonnemang är borttagna.</p>
      )}

      {subs.map((sub, i) => {
        const realIdx = (profile?.subscriptions || []).findIndex(
          (s, idx) => s === sub && !killed.includes(idx),
        );
        const idx = realIdx === -1 ? i : realIdx;

        return (
          <React.Fragment key={`${sub.name}-${i}`}>
            {i > 0 && <DashboardDivider />}
            <div className="flex items-center gap-3 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium text-[var(--color-text-primary)]">{sub.name}</p>
                <p className={sectionMetaClass}>
                  {(sub.amount || 0).toLocaleString('sv-SE')} kr/mån
                  {sub.category && ` · ${CATEGORY_LABELS[sub.category] || sub.category}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleKill(idx)}
                disabled={loading !== null}
                className={`${anchorSecondaryButtonClass} h-10 px-4 text-[13px] shrink-0`}
              >
                {loading === idx ? (
                  <span className="w-4 h-4 border-2 border-[var(--color-border)] border-t-[var(--color-text-primary)] rounded-full animate-spin" />
                ) : (
                  <>
                    <Scissors className="w-3.5 h-3.5" /> Pausa
                  </>
                )}
              </button>
            </div>
          </React.Fragment>
        );
      })}

      {killedSubs.length > 0 && (
        <>
          <DashboardDivider />
          <p className="text-[13px] font-medium text-[var(--color-text-muted)] mb-2">Borttagna</p>
          {killedSubs.map((sub, i) => (
            <DashboardListRow
              key={i}
              leading={<Check className="w-4 h-4 text-[var(--color-success)]" />}
              title={sub.name}
              subtitle={`−${sub.amount} kr/mån`}
            />
          ))}
        </>
      )}
    </div>
  );
}
