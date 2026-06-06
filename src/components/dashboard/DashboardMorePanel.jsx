import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Layers } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { dashZone, dashLabel } from '@/lib/dashboardTheme';
import { DashboardDivider } from './DashboardChrome';
import FuturePulse from './FuturePulse';
import MoneyOverview from './MoneyOverview';
import DebtCheck from './DebtCheck';
import SavingsAndBudget from './SavingsAndBudget';
import SpendingHubModule from './SpendingHubModule';
import LeakageDetector from './LeakageDetector';
import WeeklySummary from './WeeklySummary';
import SignalStrip from './SignalStrip';
import PassivityCalculator from '@/components/anchorBrain/PassivityCalculator';

export default function DashboardMorePanel({ profile, transactions }) {
  const [open, setOpen] = useState(false);

  React.useEffect(() => {
    if (window.location.hash !== '#passivity') return;
    setOpen(true);
    const t = window.setTimeout(() => {
      document.getElementById('passivity')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className={dashZone}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-white/35" />
          <span className="text-[15px] font-medium text-white/70 group-hover:text-white transition-colors">
            Djupdyk
          </span>
        </span>
        <ChevronDown
          className={`w-5 h-5 text-white/35 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="space-y-10 pb-6 pt-2">
          <Link
            to={createPageUrl('Import')}
            className="w-full h-11 rounded-full text-[14px] font-medium text-white/85 bg-white/[0.07] ring-1 ring-white/[0.08] flex items-center justify-center no-underline"
          >
            Importera transaktioner
          </Link>

          <SignalStrip profile={profile} transactions={transactions} />

          <div id="passivity">
            <p className={`${dashLabel} mb-3`}>Framtidskostnad</p>
            <PassivityCalculator profile={profile} variant="inset" />
          </div>

          <WeeklySummary />

          <DashboardDivider className="opacity-30" />

          <FuturePulse profile={profile} transactions={transactions} />
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
