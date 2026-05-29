import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';
import TransactionClusters, { classifyTransaction } from '@/components/analysis/TransactionClusters';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/lib/AuthContext';
import { getTotalFixedCosts } from '@/lib/financialUtils';
import DualPathChart from '@/components/analysis/DualPathChart';
import ScenarioCards from '@/components/analysis/ScenarioCards';
import PageShell from '@/components/layout/PageShell';
import { DashboardSection } from '@/components/dashboard/DashboardChrome';
import { createPageUrl } from '@/utils';
import {
  anchorPrimaryButtonClass,
  sectionMetaClass,
  sectionSubtitleClass,
} from '@/lib/anchorTheme';

export default function AnchorAnalysis() {
  const { user } = useAuth();
  const { profile } = useFinancialProfile();
  const { transactions } = useTransactions({ limit: 200, personalOnly: true });
  const [optimized, setOptimized] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [sliderPct, setSliderPct] = useState(50);

  const firstName = user?.full_name?.split(' ')[0];
  const headline = firstName
    ? `${firstName}, så här ser dina köp ut`
    : 'Så här ser dina köp ut';

  const brusTxs = useMemo(
    () => transactions.filter((tx) => tx.amount < 0 && classifyTransaction(tx) === 'brus'),
    [transactions],
  );
  const brusTotal = useMemo(
    () => brusTxs.reduce((s, t) => s + Math.abs(t.amount), 0),
    [brusTxs],
  );
  const brusSavings = Math.round(brusTotal * 0.5);

  const monthlyMargin = profile
    ? (profile.income || 0) - getTotalFixedCosts(profile)
    : 0;

  const handleOptimize = async () => {
    setOptimizing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setOptimized(true);
    setOptimizing(false);
  };

  return (
    <PageShell
      title="Min ekonomi"
      subtitle="Analys"
      backHref={createPageUrl('Dashboard')}
      className="!pb-32"
    >
      <div className="-mt-2 mb-6">
        <h2 className="text-[22px] font-semibold text-white leading-tight">{headline}</h2>
        <p className={`${sectionSubtitleClass} mt-2`}>
          Vi grupperar dina senaste köp och visar vad små utgifter kan betyda på sikt.
        </p>
      </div>

      <TransactionClusters transactions={transactions} />

      {brusTotal > 0 && (
        <div className="mt-6 rounded-xl px-4 py-3 border border-amber-400/25 bg-amber-400/10">
          <p className="text-[15px] font-medium text-amber-200/95">
            Småköp den här perioden: {brusTotal.toLocaleString('sv-SE')} kr
          </p>
          <p className={`${sectionSubtitleClass} mt-1`}>
            Om du lägger undan hälften ({brusSavings.toLocaleString('sv-SE')} kr/mån) till sparande
            märker du skillnad över tid.
          </p>
        </div>
      )}

      <DashboardSection nested title="Två vägar framåt" className="mt-8">
        <DualPathChart
          currentMonthlyNet={Math.max(0, monthlyMargin * 0.25)}
          brusSavings={brusSavings}
          sliderPct={sliderPct}
        />
      </DashboardSection>

      <div className="mt-8">
        <ScenarioCards
          profile={profile}
          brusSavings={brusSavings}
          brusTotal={brusTotal}
          onSliderChange={setSliderPct}
        />
      </div>

      {brusTotal > 0 && (
        <div className="mt-6 rounded-xl px-4 py-3 border border-white/[0.08] bg-white/[0.03]">
          <p className={sectionMetaClass}>Kort sammanfattning</p>
          <p className="text-[14px] text-white/75 leading-relaxed mt-2">
            Dina småköp är inte bara {brusTotal.toLocaleString('sv-SE')} kr — de påverkar också hur
            snabbt du når {profile?.savingsGoalName || 'ditt sparmål'}. Mindre spontanköp ger mer
            utrymme varje månad.
          </p>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-30 px-4 sm:px-6 pb-10 pt-4 pointer-events-none">
        <div className="max-w-lg mx-auto pointer-events-auto">
          <AnimatePresence mode="wait">
            {!optimized ? (
              <motion.button
                key="optimize"
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleOptimize}
                disabled={optimizing}
                className={`w-full ${anchorPrimaryButtonClass}`}
              >
                {optimizing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sparar plan…
                  </>
                ) : (
                  'Sätt undan småköps-budget'
                )}
              </motion.button>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full rounded-xl px-4 py-4 flex items-center gap-3 border border-emerald-400/30 bg-emerald-400/10"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                <div>
                  <p className="text-[15px] font-medium text-white">
                    {brusSavings.toLocaleString('sv-SE')} kr/mån kan gå till{' '}
                    {profile?.savingsGoalName || 'ditt sparmål'}
                  </p>
                  <p className={sectionMetaClass}>Du kan justera detta under sparmål.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageShell>
  );
}
