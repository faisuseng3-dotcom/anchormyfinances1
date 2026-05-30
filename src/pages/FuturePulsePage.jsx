import React, { useState } from 'react';
import PageShell from '@/components/layout/PageShell';
import PlanCalendar from '@/components/calendar/PlanCalendar';
import FuturePulseDetail from '@/components/futurepulse/FuturePulseDetail';
import { createPageUrl } from '@/utils';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useTransactions } from '@/hooks/useTransactions';
import { anchorDividerClass } from '@/lib/anchorTheme';

export default function FuturePulsePage() {
  const { profile, updateProfile } = useFinancialProfile();
  const { transactions } = useTransactions({ limit: 1000 });
  const [showPrognos, setShowPrognos] = useState(false);

  return (
    <PageShell
      title="Planera"
      subtitle="Ekonomikalender"
      backHref={createPageUrl('Dashboard')}
    >
      <PlanCalendar profile={profile} onUpdateProfile={updateProfile} />

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
