import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  GitBranch,
  PieChart,
  Landmark,
  TrendingUp,
  History,
  ChevronRight,
  X,
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { getTotalFixedCosts } from '@/lib/financialUtils';
import {
  anchorIconButtonClass,
  anchorInputClass,
  anchorZoneClass,
  elevatedSheet,
  sectionSubtitleClass,
} from '@/lib/anchorTheme';
import { DashboardDivider, DashboardListRow } from './DashboardChrome';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

const CALC_ITEMS = [
  {
    id: 'purchase',
    question: 'Kan jag köpa det här?',
    hint: 'Bil, bostad, resa eller annat större köp',
    icon: ShoppingBag,
    page: 'PurchaseSimulator',
  },
  {
    id: 'whatif',
    question: 'Vad händer om…?',
    hint: 'Lön, sjukdagar eller pausa utgifter',
    icon: GitBranch,
    page: 'WhatIf',
  },
  {
    id: 'budget',
    question: 'Hur mycket har jag kvar i månaden?',
    hint: 'Plan mot utfall per kategori',
    icon: PieChart,
    page: 'Budget',
  },
  {
    id: 'loans',
    question: 'Ska jag lägga om lånet?',
    hint: 'Jämför ränta och månadskostnad',
    icon: Landmark,
    page: 'Loans',
  },
  {
    id: 'future',
    question: 'Hur ser nästa månader ut?',
    hint: 'Prognos och kommande händelser',
    icon: TrendingUp,
    page: 'FuturePulse',
  },
  {
    id: 'history',
    question: 'Hur har det gått över tid?',
    hint: 'Din ekonomi månad för månad',
    icon: History,
    page: 'FinancialHistory',
  },
];

function getSafeToSpend(profile) {
  if (!profile) return 0;
  const totalFixed = getTotalFixedCosts(profile);
  const monthlyMargin = (profile.income || 0) - totalFixed;
  const expenses = (profile.monthlyExpenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  return Math.max(0, monthlyMargin - expenses);
}

export default function KalkylatornSheet({ isOpen, onClose, profile }) {
  const [quickAmount, setQuickAmount] = useState('');

  const safeToSpend = useMemo(() => getSafeToSpend(profile), [profile]);

  const quickInsight = useMemo(() => {
    const amount = parseFloat(String(quickAmount).replace(/\s/g, '').replace(',', '.'));
    if (!amount || amount <= 0) return null;
    if (safeToSpend <= 0) {
      return 'Du har inget utrymme kvar den här månaden enligt din profil.';
    }
    const pct = Math.round((amount / safeToSpend) * 100);
    if (pct >= 100) {
      return `Det överstiger ditt kvarvarande utrymme (${fmt(safeToSpend)} kr).`;
    }
    return `Det är ${pct} % av det du har kvar till lön (${fmt(safeToSpend)} kr).`;
  }, [quickAmount, safeToSpend]);

  const handleClose = () => {
    setQuickAmount('');
    onClose?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="kalk-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            key="kalk-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[24px] overflow-hidden max-h-[78vh] flex flex-col"
            style={elevatedSheet()}
          >
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-9 h-1 rounded-full bg-white/20" />
            </div>

            <div className={`${anchorZoneClass} shrink-0 flex items-center justify-between pb-3`}>
              <div>
                <h2 className="text-[17px] font-semibold text-white tracking-tight">Kalkylator</h2>
                <p className={`${sectionSubtitleClass} mt-0.5`}>Vad vill du räkna på?</p>
              </div>
              <button type="button" onClick={handleClose} aria-label="Stäng" className={anchorIconButtonClass}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className={`${anchorZoneClass} overflow-y-auto pb-10`}>
              {profile && (
                <>
                  <p className="text-[13px] font-medium text-white/45 mb-2">Snabbräkning</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="Vad kostar det?"
                      value={quickAmount}
                      onChange={(e) => setQuickAmount(e.target.value)}
                      className={`${anchorInputClass} flex-1`}
                    />
                    <span className="flex items-center text-[15px] text-white/40 pr-1">kr</span>
                  </div>
                  {quickInsight && (
                    <p className="text-[14px] text-white/65 leading-relaxed mt-2.5">{quickInsight}</p>
                  )}
                  <DashboardDivider className="my-5" />
                </>
              )}

              {CALC_ITEMS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <React.Fragment key={item.id}>
                    {i > 0 && <DashboardDivider />}
                    <DashboardListRow
                      href={createPageUrl(item.page)}
                      onClick={handleClose}
                      leading={
                        <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center">
                          <Icon className="w-5 h-5 text-white/85" />
                        </div>
                      }
                      title={item.question}
                      subtitle={item.hint}
                    />
                  </React.Fragment>
                );
              })}

              <DashboardDivider className="my-4" />
              <Link
                to={createPageUrl('ProTools')}
                onClick={handleClose}
                className="flex items-center justify-center gap-1 py-2 text-[14px] font-medium text-white/45 hover:text-white/65 no-underline"
              >
                Fler verktyg
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
