import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, ChevronRight, Landmark } from 'lucide-react';
import { createPageUrl } from '@/utils';
import {
  DashboardDivider,
  DashboardListRow,
  DashboardSection,
} from './DashboardChrome';
import {
  anchorIconButtonClass,
  anchorZoneClass,
  elevatedSheet,
  sectionMetaClass,
  sectionSubtitleClass,
} from '@/lib/anchorTheme';
import {
  comparePayoff,
  getLoanInsight,
  getLoanRateLabel,
  getMonthlyPaymentSplit,
  getPrimaryLoan,
} from '@/lib/loanCalculations';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

export default function DebtAnalysisView({ profile, onClose }) {
  const [extra, setExtra] = useState(200);
  const loan = useMemo(() => getPrimaryLoan(profile), [profile]);
  const split = useMemo(() => getMonthlyPaymentSplit(loan), [loan]);
  const comparison = useMemo(
    () => (loan ? comparePayoff(loan, extra) : null),
    [loan, extra],
  );

  if (!loan) {
    return (
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 300 }}
        className="fixed inset-0 z-50 flex flex-col"
        style={{ ...elevatedSheet(), borderRadius: 0 }}
      >
        <header className={`${anchorZoneClass} pt-12 pb-4 flex items-center justify-between shrink-0`}>
          <div>
            <h2 className="text-[20px] font-semibold text-white">Skuld</h2>
            <p className={sectionSubtitleClass}>Inget lån i profilen ännu</p>
          </div>
          <button type="button" onClick={onClose} className={anchorIconButtonClass} aria-label="Stäng">
            <X className="w-4 h-4" />
          </button>
        </header>
        <div className={`${anchorZoneClass} flex-1 pb-10`}>
          <p className="text-[15px] text-white/65 leading-relaxed mb-6">
            Lägg till ditt lån under inställningar, eller öppna låneverktyget om du vill jämföra räntor.
          </p>
          <Link
            to={createPageUrl('Loans')}
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full h-[52px] rounded-xl text-[15px] font-semibold text-[#0a1628] bg-white no-underline"
          >
            Gå till lån
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    );
  }

  const rateLabel = getLoanRateLabel(loan.interestRate || 0);
  const insight = getLoanInsight(loan);

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 32, stiffness: 300 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ ...elevatedSheet(), borderRadius: 0 }}
    >
      <header className={`${anchorZoneClass} pt-12 pb-3 flex items-start justify-between gap-3 shrink-0`}>
        <div className="min-w-0">
          <p className={sectionMetaClass}>Skuld</p>
          <h2 className="text-[20px] font-semibold text-white truncate mt-0.5">{loan.name}</h2>
          <p className={`${sectionSubtitleClass} mt-1`}>
            {fmt(loan.totalAmount)} kr · {(loan.interestRate || 0).toString().replace('.', ',')}% ränta ·{' '}
            {fmt(loan.monthlyPayment)} kr/mån
          </p>
        </div>
        <button type="button" onClick={onClose} className={`${anchorIconButtonClass} shrink-0`} aria-label="Stäng">
          <X className="w-4 h-4" />
        </button>
      </header>

      <div className={`${anchorZoneClass} flex-1 overflow-y-auto pb-10`}>
        <div className="flex items-end justify-between gap-3 mb-6">
          <div>
            <p className={sectionMetaClass}>Kvar att betala</p>
            <p className="text-[32px] font-semibold text-white tabular-nums leading-none mt-1">
              {fmt(loan.totalAmount)} <span className="text-lg text-white/50">kr</span>
            </p>
          </div>
          <span className="text-[13px] font-medium text-emerald-300/90 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08]">
            {rateLabel}
          </span>
        </div>

        <DashboardSection nested title="Vad går till lånet varje månad?">
          <div className="h-2 rounded-full overflow-hidden bg-white/[0.08] flex">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${split.amortPercent}%` }}
              transition={{ duration: 0.8 }}
              className="h-full bg-white/70"
            />
            <div className="h-full flex-1 bg-white/20" />
          </div>
          <div className="flex justify-between mt-2 mb-4">
            <p className={sectionMetaClass}>{split.amortPercent}% minskar skulden</p>
            <p className={sectionMetaClass}>{100 - split.amortPercent}% är ränta</p>
          </div>
          <DashboardListRow
            title="Amortering"
            subtitle="Det som minskar skulden"
            trailing={`${fmt(split.amortization)} kr`}
            className="!py-2"
          />
          <DashboardDivider />
          <DashboardListRow
            title="Ränta"
            subtitle="Kostnad till banken den här månaden"
            trailing={`${fmt(split.interest)} kr`}
            className="!py-2"
          />
        </DashboardSection>

        <div className="mt-6 rounded-xl px-4 py-3 border border-white/[0.08] bg-white/[0.03]">
          <p className="text-[14px] text-white/75 leading-relaxed">{insight}</p>
        </div>

        <DashboardSection nested title="Om du betalar extra varje månad" className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[14px] text-white/55">Extra per månad</p>
            <p className="text-[17px] font-semibold text-white tabular-nums">+{fmt(extra)} kr</p>
          </div>
          <input
            type="range"
            min={0}
            max={2000}
            step={100}
            value={extra}
            onChange={(e) => setExtra(Number(e.target.value))}
            className="w-full accent-white"
          />
          <div className="flex justify-between mt-1">
            <span className={sectionMetaClass}>0 kr</span>
            <span className={sectionMetaClass}>2 000 kr</span>
          </div>

          {extra === 0 ? (
            <p className={`${sectionSubtitleClass} mt-4 text-center`}>
              Dra reglaget för att se hur snabbt du blir skuldfri.
            </p>
          ) : comparison && (
            <motion.div
              key={extra}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-white/[0.08]"
            >
              <div>
                <p className={sectionMetaClass}>Skuldfri om</p>
                <p className="text-[26px] font-semibold text-white tabular-nums mt-1">
                  {comparison.boosted.years.toFixed(1)} år
                </p>
                {comparison.yearsSaved > 0.05 && (
                  <p className="text-[13px] text-emerald-300/90 mt-1">
                    {comparison.yearsSaved.toFixed(1)} år snabbare
                  </p>
                )}
              </div>
              <div>
                <p className={sectionMetaClass}>Mindre ränta totalt</p>
                <p className="text-[26px] font-semibold text-white tabular-nums mt-1">
                  {fmt(comparison.interestSaved)} kr
                </p>
                <p className="text-[13px] text-white/45 mt-1">jämfört med idag</p>
              </div>
            </motion.div>
          )}
        </DashboardSection>

        <DashboardDivider className="my-6" />
        <DashboardListRow
          href={createPageUrl('Loans')}
          onClick={onClose}
          leading={
            <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center">
              <Landmark className="w-5 h-5 text-white/85" />
            </div>
          }
          title="Jämför och optimera lån"
          subtitle="Se alla lån och räkna på omläggning"
        />

        {comparison && extra > 0 && (
          <p className={`${sectionMetaClass} text-center mt-4`}>
            Utan extra: skuldfri om cirka {comparison.base.years.toFixed(1)} år
          </p>
        )}
      </div>
    </motion.div>
  );
}
