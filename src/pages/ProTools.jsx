import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import PageShell from '@/components/layout/PageShell';
import { createPageUrl } from '@/utils';
import {
  ShoppingBag,
  GitBranch,
  PieChart,
  Landmark,
  TrendingUp,
  History,
  Plane,
  ScanLine,
  Scissors,
  Target,
  PiggyBank,
  Users,
} from 'lucide-react';
import { DashboardDivider, DashboardListRow, DashboardSection } from '@/components/dashboard/DashboardChrome';
import AIGuru from '@/components/protools/mastery/AIGuru';
import FutureSimulator from '@/components/protools/mastery/FutureSimulator';
import MarginMaxer from '@/components/protools/mastery/MarginMaxer';
import LifePuzzle from '@/components/protools/mastery/LifePuzzle';

const SCENARIO_TOOLS = [
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
    question: 'Jämför ditt lån',
    hint: 'Ränta, månadskostnad och extra betalningar',
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
    hint: 'Buffert och skuld senaste halvåret',
    icon: History,
    page: 'FinancialHistory',
  },
];

const EXPLORE_TOOLS = [
  {
    id: 'travel',
    question: 'Planera en resa',
    hint: 'Budget och kostnad per dag',
    icon: Plane,
    page: 'TravelPlanner',
  },
  {
    id: 'resell',
    question: 'Sälj något du inte använder',
    hint: 'Skanna och få prisförslag',
    icon: ScanLine,
    page: 'ResellScanner',
  },
];

const DEEP_MODULES = [
  {
    id: 'margin',
    title: 'Skär ner fasta kostnader',
    hint: 'Pausa abonnemang du inte behöver',
    icon: Scissors,
    component: MarginMaxer,
  },
  {
    id: 'future',
    title: 'När når jag mina mål?',
    hint: 'Buffert, skuldfri och sparande',
    icon: Target,
    component: FutureSimulator,
  },
  {
    id: 'ai_guru',
    title: 'Vad ger extra sparande?',
    hint: 'Se effekten per månad och per år',
    icon: PiggyBank,
    component: AIGuru,
  },
  {
    id: 'puzzle',
    title: 'Planera tillsammans',
    hint: 'Gemensamma mål med partner',
    icon: Users,
    component: LifePuzzle,
  },
];

function ToolIcon({ icon: Icon }) {
  return (
    <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center">
      <Icon className="w-5 h-5 text-white/85" />
    </div>
  );
}

export default function ProTools() {
  const [activeModule, setActiveModule] = useState(null);

  const { profile } = useFinancialProfile();

  const active = DEEP_MODULES.find((m) => m.id === activeModule);
  const ActiveComponent = active?.component;

  if (activeModule && ActiveComponent) {
    return (
      <PageShell
        title={active.title}
        subtitle={active.hint}
        onBack={() => setActiveModule(null)}
      >
        <ActiveComponent profile={profile} />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Fler verktyg"
      subtitle="Räkna, simulera och följ upp"
      backHref={createPageUrl('Dashboard')}
    >
      <DashboardSection title="Räkna på" subtitle="Vanliga frågor om din ekonomi">
        {SCENARIO_TOOLS.map((item, i) => {
          const Icon = item.icon;
          return (
            <React.Fragment key={item.id}>
              {i > 0 && <DashboardDivider />}
              <DashboardListRow
                href={createPageUrl(item.page)}
                leading={<ToolIcon icon={Icon} />}
                title={item.question}
                subtitle={item.hint}
              />
            </React.Fragment>
          );
        })}
      </DashboardSection>

      <DashboardSection title="Utforska">
        {EXPLORE_TOOLS.map((item, i) => {
          const Icon = item.icon;
          return (
            <React.Fragment key={item.id}>
              {i > 0 && <DashboardDivider />}
              <DashboardListRow
                href={createPageUrl(item.page)}
                leading={<ToolIcon icon={Icon} />}
                title={item.question}
                subtitle={item.hint}
              />
            </React.Fragment>
          );
        })}
      </DashboardSection>

      <DashboardSection title="Gå djupare" subtitle="Verktyg som bygger på din profil">
        {DEEP_MODULES.map((mod, i) => {
          const Icon = mod.icon;
          return (
            <React.Fragment key={mod.id}>
              {i > 0 && <DashboardDivider />}
              <DashboardListRow
                onClick={() => setActiveModule(mod.id)}
                leading={<ToolIcon icon={Icon} />}
                title={mod.title}
                subtitle={mod.hint}
              />
            </React.Fragment>
          );
        })}
      </DashboardSection>
    </PageShell>
  );
}
