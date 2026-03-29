import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getTotalFixedCosts } from '@/lib/financialUtils';

const MILESTONE_TARGETS = [
  { label: '1 månads buffert', amount: 0, type: 'buffer_1m' },
  { label: '3 månaders buffert', amount: 0, type: 'buffer_3m' },
  { label: 'Kontantinsats (10%)', amount: 500000, type: 'custom' },
  { label: 'Skuldfri', amount: 0, type: 'debt_free' },
  { label: 'FIRE (ekonomiskt fri)', amount: 0, type: 'fire' },
];

export default function FutureSimulator({ profile }) {
  const income = profile?.income || 0;
  const fixed = getTotalFixedCosts(profile || {});
  const margin = Math.max(0, income - fixed);
  const savingsRate = margin * 0.5; // konservativ 50% av marginalen
  const loans = profile?.loans || [];
  const totalDebt = loans.reduce((s, l) => s + (l.totalAmount || 0), 0);
  const currentBuffer = profile?.buffer || 0;

  const milestones = useMemo(() => {
    const results = [];
    const now = new Date();

    // Buffer 1 månad
    const target1m = fixed;
    const months1m = currentBuffer >= target1m ? 0 : Math.ceil((target1m - currentBuffer) / (savingsRate || 1));
    const date1m = new Date(now);
    date1m.setMonth(date1m.getMonth() + months1m);
    results.push({ label: '🛡️ 1 månads buffert', date: date1m, months: months1m, color: '#10b981', reached: months1m === 0 });

    // Buffer 3 månader
    const target3m = fixed * 3;
    const months3m = currentBuffer >= target3m ? 0 : Math.ceil((target3m - currentBuffer) / (savingsRate || 1));
    const date3m = new Date(now);
    date3m.setMonth(date3m.getMonth() + months3m);
    results.push({ label: '🏦 3 månaders buffert', date: date3m, months: months3m, color: '#3b82f6', reached: months3m === 0 });

    // Skuldfri
    if (totalDebt > 0) {
      const totalMonthlyLoan = loans.reduce((s, l) => s + (l.monthlyPayment || 0), 0);
      const effectivePay = Math.max(totalMonthlyLoan, savingsRate * 0.3);
      const monthsDebt = Math.ceil(totalDebt / (effectivePay || 1));
      const dateDebt = new Date(now);
      dateDebt.setMonth(dateDebt.getMonth() + monthsDebt);
      results.push({ label: '🔓 Skuldfri', date: dateDebt, months: monthsDebt, color: '#f59e0b' });
    }

    // Kontantinsats (500k)
    const kontant = 500000;
    const monthsKontant = Math.ceil(kontant / (savingsRate || 1));
    const dateKontant = new Date(now);
    dateKontant.setMonth(dateKontant.getMonth() + monthsKontant);
    results.push({ label: '🏠 Kontantinsats 500k', date: dateKontant, months: monthsKontant, color: '#8b5cf6' });

    // FIRE (25x årsutgifter)
    const fire = fixed * 12 * 25;
    const monthsFire = Math.ceil(fire / (savingsRate || 1));
    const dateFire = new Date(now);
    dateFire.setMonth(dateFire.getMonth() + monthsFire);
    results.push({ label: '🚀 Ekonomisk frihet (FIRE)', date: dateFire, months: monthsFire, color: '#ec4899' });

    return results;
  }, [profile, savingsRate]);

  const formatDate = (d) => d.toLocaleDateString('sv-SE', { year: 'numeric', month: 'short' });
  const formatMonths = (m) => m === 0 ? 'Redan uppnått!' : m < 12 ? `${m} mån` : `${Math.floor(m / 12)} år ${m % 12} mån`;

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl p-3 border border-emerald-500/20 text-center"
        style={{ background: 'rgba(16,185,129,0.07)' }}
      >
        <p className="text-xs text-slate-400">Baserat på att du sparar</p>
        <p className="text-lg font-bold text-emerald-400">{Math.round(savingsRate).toLocaleString('sv-SE')} kr/mån</p>
        <p className="text-xs text-slate-500">(50% av din marginal på {Math.round(margin).toLocaleString('sv-SE')} kr)</p>
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-white/10" />
        <div className="space-y-4">
          {milestones.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.12 }}
              className="relative flex items-start gap-4 pl-2"
            >
              {/* Dot */}
              <div
                className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-slate-900 z-10 relative"
                style={{ background: m.color, boxShadow: `0 0 12px ${m.color}80` }}
              />

              {/* Card */}
              <div
                className="flex-1 rounded-xl p-4 border border-white/8"
                style={{ background: `${m.color}10`, borderColor: `${m.color}25` }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">{m.label}</p>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ color: m.color, background: `${m.color}20` }}
                  >
                    {m.reached ? '✓ Klart' : formatDate(m.date)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{formatMonths(m.months)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-xs text-slate-600 pt-2"
      >
        * Beräkningar baserade på din nuvarande inkomst och marginalen.<br />
        Öka din sparandel i inställningar för att påskynda milstolparna.
      </motion.div>
    </div>
  );
}