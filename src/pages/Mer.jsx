// @ts-nocheck
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { pageSeoFor } from '@/lib/pageSeo';
import { createPageUrl } from '@/utils';
import PageShell from '@/components/layout/PageShell';
import {
  Settings, BookOpen, Users, Globe, Plane, Target,
  CreditCard, MessageSquare, ChevronRight, Building2,
  Shield, BarChart2, ShoppingBag,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SECTION = ({ title, children }) => (
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/30 mb-2 px-1">{title}</p>
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
      {children}
    </div>
  </div>
);

const ROW = ({ icon: Icon, label, sublabel, onPress, color = '#6B9FFF', last = false }) => (
  <button
    type="button"
    onClick={onPress}
    className="w-full flex items-center gap-3 px-4 py-3.5 touch-manipulation text-left"
    style={{ borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.05)' }}
  >
    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
      <Icon size={16} style={{ color }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[15px] font-medium text-white">{label}</p>
      {sublabel && <p className="text-[12px] text-white/35 mt-0.5">{sublabel}</p>}
    </div>
    <ChevronRight size={16} className="text-white/20 shrink-0" />
  </button>
);

export default function Mer() {
  const navigate = useNavigate();

  const handleFeedback = () => {
    const subject = encodeURIComponent('Feedback — Anchor');
    const body = encodeURIComponent('Hej!\n\nJag vill rapportera:\n\n[ ] Bugg\n[ ] Förslag\n[ ] Problem\n\nBeskrivning:\n');
    window.location.href = `mailto:hello@anchormyfinances.com?subject=${subject}&body=${body}`;
  };

  return (
    <PageShell title="Mer" subtitle="Verktyg och inställningar">
      <div className="space-y-5 pb-8">

        <SECTION title="Konto">
          <ROW icon={Settings} label="Inställningar" sublabel="Profil, lön, abonnemang" onPress={() => navigate(createPageUrl('Settings'))} />
          <ROW icon={CreditCard} label="Prenumeration" sublabel="Hantera din Anchor-plan" onPress={() => navigate(createPageUrl('Pricing'))} />
          <ROW icon={Shield} label="Säkerhet & integritet" sublabel="GDPR, lösenord" onPress={() => navigate(createPageUrl('SecurityInfo'))} last />
        </SECTION>

        <SECTION title="Ekonomiverktyg">
          <ROW icon={Target} label="Sparmål" sublabel="Sätt och följ dina mål" onPress={() => navigate(createPageUrl('SavingsGoals'))} />
          <ROW icon={ShoppingBag} label="Köpanalys" sublabel="Kan jag köpa det här?" onPress={() => navigate(createPageUrl('PurchaseSimulator'))} />
          <ROW icon={BarChart2} label="Insikter" sublabel="Trender och mönster" onPress={() => navigate(createPageUrl('Insights'))} />
          <ROW icon={Building2} label="Business" sublabel="Företagsläge" onPress={() => navigate('/BusinessDashboard')} last />
        </SECTION>

        <SECTION title="Utforska">
          <ROW icon={Globe} label="Galaxy" sublabel="Se ekonomiska mönster" onPress={() => navigate(createPageUrl('Insights'))} />
          <ROW icon={Users} label="Social" sublabel="Dela och jämför" onPress={() => navigate(createPageUrl('Social'))} />
          <ROW icon={Users} label="Squads" sublabel="Spara tillsammans" onPress={() => navigate(createPageUrl('Squads'))} color="#a78bfa" />
          <ROW icon={Plane} label="Reseplanering" sublabel="AI-agent för din nästa resa" onPress={() => navigate(createPageUrl('TravelPlanner'))} />
          <ROW icon={BookOpen} label="Anchor Academy" sublabel="Lär dig mer om ekonomi" onPress={() => navigate(createPageUrl('AnchorAcademy'))} color="#4fc3f7" last />
        </SECTION>

        <SECTION title="Hjälp oss bli bättre">
          <ROW
            icon={MessageSquare}
            label="Ge feedback"
            sublabel="Buggar, förslag eller problem"
            onPress={handleFeedback}
            color="#22d97a"
            last
          />
        </SECTION>

        <button
          type="button"
          onClick={() => base44.auth.logout(window.location.origin)}
          className="w-full py-3.5 rounded-2xl text-[15px] font-semibold touch-manipulation"
          style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', color: '#f87171' }}
        >
          Logga ut
        </button>

        <p className="text-[11px] text-white/20 text-center">
          Anchor · hello@anchormyfinances.com
        </p>
      </div>
    </PageShell>
  );
}

export const pageSeo = pageSeoFor('Settings');
