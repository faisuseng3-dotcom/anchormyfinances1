import React, { useMemo, useState } from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import PageShell from '@/components/layout/PageShell';
import { createPageUrl } from '@/utils';
import { Scissors, Target, PiggyBank, Users } from 'lucide-react';
import { DashboardDivider, DashboardListRow, DashboardSection } from '@/components/dashboard/DashboardChrome';
import { dashLabel } from '@/lib/appSurface';
import { PROTOOLS_SCENARIOS, PROTOOLS_EXPLORE, sortTools, toolPageHref } from '@/lib/toolCatalog';
import ProToolsHero from '@/components/protools/ProToolsHero';
import AIGuru from '@/components/protools/mastery/AIGuru';
import FutureSimulator from '@/components/protools/mastery/FutureSimulator';
import MarginMaxer from '@/components/protools/mastery/MarginMaxer';
import LifePuzzle from '@/components/protools/mastery/LifePuzzle';

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
    title: 'Effekt av extra sparande',
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
    <div className="w-10 h-10 rounded-2xl bg-white/[0.06] flex items-center justify-center ring-1 ring-white/[0.08]">
      <Icon className="w-5 h-5 text-cyan-300/80" />
    </div>
  );
}

export default function ProTools() {
  const [activeModule, setActiveModule] = useState(null);
  const { profile } = useFinancialProfile();

  const scenarios = useMemo(
    () => sortTools(PROTOOLS_SCENARIOS, profile?.topConcern),
    [profile?.topConcern],
  );

  const active = DEEP_MODULES.find((m) => m.id === activeModule);
  const ActiveComponent = active?.component;

  if (activeModule && ActiveComponent) {
    return (
      <PageShell title={active.title} subtitle={active.hint} onBack={() => setActiveModule(null)}>
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
      <ProToolsHero profile={profile} />

      {profile?.topConcern && (
        <p className={`${dashLabel} -mt-1 mb-4`}>
          Prioriterat utifrån ditt fokus
        </p>
      )}

      <DashboardSection title="Räkna på" subtitle="Vanliga frågor om din ekonomi">
        {scenarios.map((item, i) => {
          const Icon = item.icon;
          return (
            <React.Fragment key={item.id}>
              {i > 0 && <DashboardDivider />}
              <DashboardListRow
                href={toolPageHref(item)}
                leading={<ToolIcon icon={Icon} />}
                title={item.question}
                subtitle={item.hint}
              />
            </React.Fragment>
          );
        })}
      </DashboardSection>

      <DashboardSection title="Utforska">
        {PROTOOLS_EXPLORE.map((item, i) => {
          const Icon = item.icon;
          return (
            <React.Fragment key={item.id}>
              {i > 0 && <DashboardDivider />}
              <DashboardListRow
                href={toolPageHref(item)}
                leading={<ToolIcon icon={Icon} />}
                title={item.question}
                subtitle={item.hint}
              />
            </React.Fragment>
          );
        })}
      </DashboardSection>

      <DashboardSection title="Gå djupare" subtitle="Bygger på din profil i Anchor">
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

export const pageSeo = pageSeoFor('ProTools');
