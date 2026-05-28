import React, { useMemo } from 'react';
import { getTotalFixedCosts } from '@/lib/financialUtils';
import { DashboardDivider, DashboardListRow } from '@/components/dashboard/DashboardChrome';
import { sectionMetaClass } from '@/lib/anchorTheme';

export default function FutureSimulator({ profile }) {
  const income = profile?.income || 0;
  const fixed = getTotalFixedCosts(profile || {});
  const margin = Math.max(0, income - fixed);
  const savingsRate = margin * 0.5;
  const loans = profile?.loans || [];
  const totalDebt = loans.reduce((s, l) => s + (l.totalAmount || 0), 0);
  const currentBuffer = profile?.buffer || 0;

  const milestones = useMemo(() => {
    const results = [];
    const now = new Date();

    const target1m = fixed;
    const months1m =
      currentBuffer >= target1m ? 0 : Math.ceil((target1m - currentBuffer) / (savingsRate || 1));
    const date1m = new Date(now);
    date1m.setMonth(date1m.getMonth() + months1m);
    results.push({
      label: '1 månads buffert',
      date: date1m,
      months: months1m,
      reached: months1m === 0,
    });

    const target3m = fixed * 3;
    const months3m =
      currentBuffer >= target3m ? 0 : Math.ceil((target3m - currentBuffer) / (savingsRate || 1));
    const date3m = new Date(now);
    date3m.setMonth(date3m.getMonth() + months3m);
    results.push({
      label: '3 månaders buffert',
      date: date3m,
      months: months3m,
      reached: months3m === 0,
    });

    if (totalDebt > 0) {
      const totalMonthlyLoan = loans.reduce((s, l) => s + (l.monthlyPayment || 0), 0);
      const effectivePay = Math.max(totalMonthlyLoan, savingsRate * 0.3);
      const monthsDebt = Math.ceil(totalDebt / (effectivePay || 1));
      const dateDebt = new Date(now);
      dateDebt.setMonth(dateDebt.getMonth() + monthsDebt);
      results.push({ label: 'Skuldfri', date: dateDebt, months: monthsDebt });
    }

    const kontant = 500000;
    const monthsKontant = Math.ceil(kontant / (savingsRate || 1));
    const dateKontant = new Date(now);
    dateKontant.setMonth(dateKontant.getMonth() + monthsKontant);
    results.push({ label: 'Kontantinsats 500 000 kr', date: dateKontant, months: monthsKontant });

    return results;
  }, [profile, savingsRate, fixed, currentBuffer, totalDebt, loans]);

  const formatDate = (d) => d.toLocaleDateString('sv-SE', { year: 'numeric', month: 'short' });
  const formatMonths = (m) =>
    m === 0 ? 'Redan uppnått' : m < 12 ? `${m} mån` : `${Math.floor(m / 12)} år ${m % 12} mån`;

  return (
    <div className="space-y-6">
      <p className={sectionMetaClass}>
        Antar att du sparar {Math.round(savingsRate).toLocaleString('sv-SE')} kr/mån (hälften av marginalen
        på {Math.round(margin).toLocaleString('sv-SE')} kr).
      </p>

      {milestones.map((m, i) => (
        <React.Fragment key={m.label}>
          {i > 0 && <DashboardDivider />}
          <DashboardListRow
            title={m.label}
            subtitle={formatMonths(m.months)}
            trailing={
              <span className="text-[14px] font-medium text-white/70 tabular-nums">
                {m.reached ? 'Klart' : formatDate(m.date)}
              </span>
            }
          />
        </React.Fragment>
      ))}

      <p className="text-[13px] text-white/40 leading-relaxed pt-2">
        Beräkningarna bygger på din nuvarande profil. Höj sparandet i inställningar för att nå målen
        snabbare.
      </p>
    </div>
  );
}
