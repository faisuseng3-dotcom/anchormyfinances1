import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Layers } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { historyTabHref } from '@/lib/historyTabs';
import { dashZone, dashLabel } from '@/lib/dashboardTheme';
import { DashboardDivider, DashboardListRow } from './DashboardChrome';
import WeeklySummary from './WeeklySummary';
import SignalStrip from './SignalStrip';

/** En länk per funktion — inga inbäddade mini-sidor. */
const DEEP_LINKS = [
  {
    title: 'Din Framtid',
    subtitle: 'Prognos och scenarier',
    href: createPageUrl('FuturePulse'),
  },
  {
    title: 'Ekonomikalender',
    subtitle: 'Planerade händelser',
    href: `${createPageUrl('FuturePulse')}?view=kalender`,
  },
  {
    title: 'Budget',
    subtitle: 'Plan mot utfall per kategori',
    href: '/Budget',
  },
  {
    title: 'Lån & skulder',
    subtitle: 'Ränta och amortering',
    href: createPageUrl('Loans'),
  },
  {
    title: 'Transaktioner',
    subtitle: 'Lista, filter och månader',
    href: createPageUrl('TransactionHistory'),
  },
  {
    title: 'Insikter & läckage',
    subtitle: 'Kategorier och dolda flöden',
    href: `${historyTabHref('insights')}#leakage-detector`,
  },
  {
    title: 'Utveckling över tid',
    subtitle: 'Buffert och trender',
    href: historyTabHref('trends'),
  },
  {
    title: 'Verktyg',
    subtitle: 'Simuleringar och kalkylatorer',
    href: createPageUrl('ProTools'),
  },
  {
    title: 'Framtidskostnad',
    subtitle: 'Priset av att vänta med att spara',
    href: `${createPageUrl('ProTools')}?deep=ai_guru`,
  },
];

export default function DashboardMorePanel({ profile, transactions }) {
  const [open, setOpen] = useState(false);

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
            Fler vyer
          </span>
        </span>
        <ChevronDown
          className={`w-5 h-5 text-white/35 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="space-y-8 pb-6 pt-2">
          <Link
            to="/Import"
            className="w-full h-11 rounded-full text-[14px] font-medium text-white/85 bg-white/[0.07] ring-1 ring-white/[0.08] flex items-center justify-center no-underline"
          >
            Importera transaktioner
          </Link>

          <SignalStrip profile={profile} transactions={transactions} />
          <WeeklySummary />

          <DashboardDivider className="opacity-30" />

          <div>
            <p className={`${dashLabel} mb-3`}>Gå till</p>
            <div className="space-y-0">
              {DEEP_LINKS.map((item, i) => (
                <React.Fragment key={item.href}>
                  {i > 0 && <DashboardDivider />}
                  <DashboardListRow
                    href={item.href}
                    title={item.title}
                    subtitle={item.subtitle}
                  />
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
