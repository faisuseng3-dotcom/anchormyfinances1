import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GitBranch } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import PlanCalendar from '@/components/calendar/PlanCalendar';
import FuturePulseDetail from '@/components/futurepulse/FuturePulseDetail';
import { createPageUrl } from '@/utils';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { usePlannedEvents } from '@/hooks/usePlannedEvents';
import { useTransactions } from '@/hooks/useTransactions';
import { anchorDividerClass, sectionSubtitleClass } from '@/lib/anchorTheme';
import { getBufferRunwayMonths } from '@/lib/economicHealth';

export default function FuturePulsePage() {
  const { profile } = useFinancialProfile();
  const { profileWithEvents, savePlannedEvents, syncFromLocalIfEmpty } = usePlannedEvents();
  const { transactions } = useTransactions({ limit: 1000 });
  const [showPrognos, setShowPrognos] = useState(false);

  const runwayMonths = getBufferRunwayMonths(profile);

  useEffect(() => {
    syncFromLocalIfEmpty();
  }, [syncFromLocalIfEmpty]);

  return (
    <PageShell
      title="Planera"
      subtitle="Ekonomikalender"
      backHref={createPageUrl('Dashboard')}
    >
      {runwayMonths != null && runwayMonths > 0 && (
        <p className={`${sectionSubtitleClass} -mt-2 mb-4 rounded-xl px-4 py-3 border border-white/[0.08] bg-white/[0.04]`}>
          Med nuvarande buffert klarar du ungefär{' '}
          <span className="text-white font-medium tabular-nums">{runwayMonths}</span>
          {' '}månad{runwayMonths === 1 ? '' : 'er'} utan ny inkomst (utifrån fasta kostnader).
        </p>
      )}

      <PlanCalendar
        profile={profileWithEvents || profile}
        onSavePlannedEvents={savePlannedEvents}
      />

      <Link
        to={createPageUrl('WhatIf')}
        className="mt-5 flex items-center gap-3 rounded-2xl px-4 py-3.5 border border-white/[0.1] bg-white/[0.04] no-underline hover:bg-white/[0.07] transition-colors"
      >
        <span className="w-10 h-10 rounded-xl bg-[#6B9FFF]/15 flex items-center justify-center border border-[#6B9FFF]/20">
          <GitBranch className="w-5 h-5 text-[#9FB5FF]" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[15px] font-semibold text-white">Vad händer om…?</span>
          <span className="block text-[13px] text-white/45 mt-0.5">
            Simulera lön, pausa utgifter eller andra scenarier
          </span>
        </span>
        <span className="text-white/40 text-sm">→</span>
      </Link>

      <div className={`${anchorDividerClass} my-8`} />

      <section>
        <button
          type="button"
          onClick={() => setShowPrognos((v) => !v)}
          className="w-full flex items-center justify-between py-2 text-left group"
        >
          <div>
            <h2 className="text-[17px] font-semibold text-white">60-dagarsprognos</h2>
            <p className="text-[13px] text-white/45 mt-0.5">
              Simulerad saldo utifrån dina fasta kostnader
            </p>
          </div>
          <span className="text-[14px] font-medium text-white/45 group-hover:text-white/70 transition-colors">
            {showPrognos ? 'Dölj' : 'Visa'}
          </span>
        </button>

        {showPrognos && (
          <div className="mt-4 -mx-1">
            <FuturePulseDetail profile={profile} transactions={transactions} />
          </div>
        )}
      </section>
    </PageShell>
  );
}
