import React, { useMemo, useState, useEffect } from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import PageShell, { GlassSection } from '@/components/layout/PageShell';
import { createPageUrl } from '@/utils';
import { Scissors, Target, PiggyBank, Users } from 'lucide-react';
import { PROTOOLS_SCENARIOS, PROTOOLS_EXPLORE, sortTools, toolPageHref } from '@/lib/toolCatalog';
import ProToolsHero from '@/components/protools/ProToolsHero';
import TintIconCard from '@/components/ui-premium/copilot/TintIconCard';
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
    category: 'subscription',
    component: MarginMaxer,
  },
  {
    id: 'future',
    title: 'När når jag mina mål?',
    hint: 'Buffert, skuldfri och sparande',
    icon: Target,
    category: 'savings',
    component: FutureSimulator,
  },
  {
    id: 'ai_guru',
    title: 'Effekt av extra sparande',
    hint: 'Se effekten per månad och per år',
    icon: PiggyBank,
    category: 'savings',
    component: AIGuru,
  },
  {
    id: 'puzzle',
    title: 'Planera tillsammans',
    hint: 'Gemensamma mål med partner',
    icon: Users,
    category: 'other',
    component: LifePuzzle,
  },
];

export default function ProTools() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeModule, setActiveModule] = useState(null);
  const { profile } = useFinancialProfile();

  useEffect(() => {
    const deep = searchParams.get('deep');
    if (!deep || !DEEP_MODULES.some((m) => m.id === deep)) return;
    setActiveModule(deep);
    const next = new URLSearchParams(searchParams);
    next.delete('deep');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- körs vid landning med ?deep=
  }, []);

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

  const renderToolRow = (item) => {
    const Icon = item.icon;
    return (
      <TintIconCard
        key={item.id}
        category={item.category || 'other'}
        icon={<Icon className="w-[18px] h-[18px]" style={{ color: 'var(--copilot-accent-blue)' }} />}
        title={item.question}
        subtitle={item.hint}
        onClick={() => navigate(toolPageHref(item))}
      />
    );
  };

  return (
    <PageShell
      title="Verktyg"
      subtitle="Räkna, simulera och följ upp"
      backHref={createPageUrl('Dashboard')}
    >
      <ProToolsHero profile={profile} />

      {profile?.topConcern && (
        <p className="text-[11px] uppercase tracking-wide text-[var(--copilot-text-muted)] -mt-2 mb-4">
          Prioriterat utifrån ditt fokus
        </p>
      )}

      <GlassSection title="Räkna på" subtitle="Vanliga frågor om din ekonomi">
        <div className="space-y-2">
          {scenarios.map(renderToolRow)}
        </div>
      </GlassSection>

      <GlassSection title="Utforska">
        <div className="space-y-2">
          {PROTOOLS_EXPLORE.map(renderToolRow)}
        </div>
      </GlassSection>

      <GlassSection title="Gå djupare" subtitle="Bygger på din profil i Lago">
        <div className="space-y-2">
          {DEEP_MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <TintIconCard
                key={mod.id}
                category={mod.category}
                icon={<Icon className="w-[18px] h-[18px]" style={{ color: 'var(--copilot-accent-blue)' }} />}
                title={mod.title}
                subtitle={mod.hint}
                onClick={() => setActiveModule(mod.id)}
              />
            );
          })}
        </div>
      </GlassSection>
    </PageShell>
  );
}

export const pageSeo = pageSeoFor('ProTools');
