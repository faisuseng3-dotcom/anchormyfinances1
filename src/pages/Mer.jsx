// @ts-nocheck
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { pageSeoFor } from '@/lib/pageSeo';
import { createPageUrl } from '@/utils';
import PageShell from '@/components/layout/PageShell';
import {
  Settings, BookOpen, Users, Globe, Plane, Target,
  CreditCard, MessageSquare, ChevronRight, Building2,
  Shield, BarChart2, ShoppingBag, FileUp, Wrench,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { DashboardSection, DashboardListRow, DashboardDivider } from '@/components/dashboard/DashboardChrome';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';

const SECTION = ({ title, children }) => (
  <DashboardSection nested title={title}>
    <div className="rounded-2xl overflow-hidden bg-white border border-[var(--color-border)]">
      {children}
    </div>
  </DashboardSection>
);

const ROW = ({ icon: Icon, label, sublabel, onPress, color = 'var(--color-accent)', last = false }) => (
  <React.Fragment>
    <DashboardListRow
      onClick={onPress}
      className="px-4 min-h-[56px]"
      leading={
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `color-mix(in srgb, ${color} 15%, transparent)` }}>
          <Icon size={16} style={{ color }} />
        </div>
      }
      title={label}
      subtitle={sublabel}
    />
    {!last && <DashboardDivider className="ml-[4.25rem]" />}
  </React.Fragment>
);

export default function Mer() {
  const navigate = useNavigate();

  const handleFeedback = () => {
    const subject = encodeURIComponent('Feedback — Lago');
    const body = encodeURIComponent('Hej!\n\nJag vill rapportera:\n\n[ ] Bugg\n[ ] Förslag\n[ ] Problem\n\nBeskrivning:\n');
    window.location.href = `mailto:hello@anchormyfinances.com?subject=${subject}&body=${body}`;
  };

  return (
    <PageShell title="Mer" subtitle="Allt utöver kärnflödet">
      <div className="space-y-5 pb-8">

        <button
          type="button"
          onClick={() => navigate(createPageUrl('Import'))}
          className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left touch-manipulation bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/20"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[var(--color-accent)]/15">
            <FileUp size={18} className="text-[var(--color-accent)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">Importera från banken</p>
            <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">Ladda upp CSV — Lago analyserar allt</p>
          </div>
          <ChevronRight size={16} className="text-[var(--color-text-muted)] shrink-0" />
        </button>

        <SECTION title="Konto">
          <ROW icon={Settings} label="Inställningar" sublabel="Profil, lön, abonnemang" onPress={() => navigate(createPageUrl('Settings'))} />
          <ROW icon={CreditCard} label="Prenumeration" sublabel="Hantera din Lago-plan" onPress={() => navigate(createPageUrl('Pricing'))} />
          <ROW icon={Shield} label="Säkerhet & integritet" sublabel="GDPR, lösenord" onPress={() => navigate(createPageUrl('SecurityInfo'))} last />
        </SECTION>

        <SECTION title="Ekonomiverktyg">
          <ROW icon={Target} label="Sparmål" sublabel="Sätt och följ dina mål" onPress={() => navigate(createPageUrl('SavingsGoals'))} />
          <ROW icon={ShoppingBag} label="Köpanalys" sublabel="Kan jag köpa det här?" onPress={() => navigate(createPageUrl('PurchaseSimulator'))} />
          <ROW icon={BarChart2} label="Insikter" sublabel="Trender och mönster" onPress={() => navigate(createPageUrl('Insights'))} />
          <ROW icon={Building2} label="Business" sublabel="Företagsläge" onPress={() => navigate('/BusinessDashboard')} last />
        </SECTION>

        <SECTION title="Utforska">
          <ROW icon={Wrench} label="ProTools" sublabel="Avancerade verktyg" onPress={() => navigate(createPageUrl('ProTools'))} />
          <ROW icon={Globe} label="Galaxy" sublabel="Se ekonomiska mönster" onPress={() => navigate(createPageUrl('Insights'))} />
          <ROW icon={Users} label="Social" sublabel="Dela och jämför" onPress={() => navigate(createPageUrl('Social'))} />
          <ROW icon={Plane} label="Reseplanering" sublabel="AI-agent för din nästa resa" onPress={() => navigate(createPageUrl('TravelPlanner'))} />
          <ROW icon={BookOpen} label="Lago Academy" sublabel="Lär dig mer om ekonomi" onPress={() => navigate(createPageUrl('AnchorAcademy'))} last />
        </SECTION>

        <SECTION title="Hjälp oss bli bättre">
          <ROW
            icon={MessageSquare}
            label="Ge feedback"
            sublabel="Buggar, förslag eller problem"
            onPress={handleFeedback}
            last
          />
        </SECTION>

        <AnchorPressable
          type="button"
          onClick={() => base44.auth.logout(window.location.origin)}
          className="w-full py-3.5 rounded-2xl text-[15px] font-semibold touch-manipulation bg-[var(--color-danger-soft)] border border-[var(--color-danger)]/20 text-[var(--color-danger)]"
        >
          Logga ut
        </AnchorPressable>

        <p className="text-[11px] text-[var(--color-text-muted)] text-center">
          Lago · hello@anchormyfinances.com
        </p>
      </div>
    </PageShell>
  );
}

export const pageSeo = pageSeoFor('Settings');
