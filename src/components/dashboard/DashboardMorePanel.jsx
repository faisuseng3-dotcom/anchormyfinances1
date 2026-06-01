import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { anchorZoneClass, anchorSecondaryButtonClass } from '@/lib/anchorTheme';
import { DashboardDivider } from './DashboardChrome';
import FuturePulse from './FuturePulse';
import MoneyOverview from './MoneyOverview';
import DebtCheck from './DebtCheck';
import SavingsAndBudget from './SavingsAndBudget';
import SpendingHubModule from './SpendingHubModule';
import LeakageDetector from './LeakageDetector';
import AIStoryBar from './AIStoryBar';
import WeeklySummary from './WeeklySummary';

export default function DashboardMorePanel({
  profile,
  transactions,
  onOpenExpense,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={anchorZoneClass}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-3 text-left group"
      >
        <span className="text-[15px] font-semibold text-white/80 group-hover:text-white transition-colors">
          Mer insikter
        </span>
        {open ? (
          <ChevronUp className="w-5 h-5 text-white/40" />
        ) : (
          <ChevronDown className="w-5 h-5 text-white/40" />
        )}
      </button>

      {open && (
        <div className="space-y-8 pb-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={onOpenExpense}
              className={`${anchorSecondaryButtonClass} w-full text-[14px] h-11`}
            >
              Registrera utgift
            </button>
            <Link
              to={createPageUrl('Import')}
              className={`${anchorSecondaryButtonClass} w-full text-center no-underline text-[14px] h-11 flex items-center justify-center`}
            >
              Importera CSV
            </Link>
          </div>

          <AIStoryBar profile={profile} transactions={transactions} />
          <WeeklySummary />

          <DashboardDivider />

          <FuturePulse profile={profile} transactions={transactions} />

          <DashboardDivider />

          <MoneyOverview profile={profile} />
          <DebtCheck profile={profile} />
          <SavingsAndBudget profile={profile} />
          <SpendingHubModule transactions={transactions || []} profile={profile} />
          <LeakageDetector profile={profile} transactions={transactions} variant="dashboard" />
        </div>
      )}
    </div>
  );
}
