import React from 'react';
import { motion } from 'framer-motion';
import { Users, TreePalm, Plus } from 'lucide-react';
import { copilotPrimaryBtnClass, copilotGhostBtnClass } from '@/lib/copilotTheme';
import { fmtKr } from '../copilotDashboardUtils';
import { staggerItem } from '@/lib/motionPresets';
import CopilotToolShell from './CopilotToolShell';
import PlanGate from '@/components/billing/PlanGate';

const DEMO_SQUADS = [
  {
    id: 'midsommar',
    name: 'Midsommar 2026',
    icon: TreePalm,
    target: 15000,
    current: 8200,
    members: ['Alex', 'Sara', 'Erik', 'Maja'],
    colors: ['#4a7aff', '#22d97a', '#a78bfa', '#4fc3f7'],
  },
  {
    id: 'weekend',
    name: 'Stockholm-weekend',
    icon: Users,
    target: 6000,
    current: 4100,
    members: ['Du', 'Linnea'],
    colors: ['#4a7aff', '#f472b6'],
  },
];

function AvatarStack({ members, colors }) {
  return (
    <div className="flex items-center">
      {members.map((name, i) => (
        <div
          key={name}
          className="w-9 h-9 rounded-full border-2 border-[#0a0f6b] flex items-center justify-center text-[11px] font-bold text-white"
          style={{
            background: colors[i % colors.length],
            marginLeft: i > 0 ? -10 : 0,
            zIndex: members.length - i,
          }}
          title={name}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      ))}
      <div
        className="w-9 h-9 rounded-full border-2 border-dashed  flex items-center justify-center text-[var(--copilot-text-muted)]"
        style={{ marginLeft: -10 }}
      >
        <Plus className="w-3.5 h-3.5" />
      </div>
    </div>
  );
}

function SquadCard({ squad, index }) {
  const Icon = squad.icon;
  const pct = squad.target > 0 ? Math.min(100, Math.round((squad.current / squad.target) * 100)) : 0;

  return (
    <motion.article
      {...staggerItem(index)}
      className="rounded-2xl organic-surface p-5"
      style={{ background: 'var(--copilot-bg-card)' }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(74,122,255,0.15)', boxShadow: 'var(--anchor-shadow-1)' }}
          >
            <Icon className="w-5 h-5 text-[var(--copilot-accent-blue)]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-[17px] font-bold text-white truncate">{squad.name}</h3>
            <p className="text-[12px] text-[var(--copilot-text-muted)] mt-0.5">
              {squad.members.length} medlemmar · gemensam pott
            </p>
          </div>
        </div>
        <span className="text-[15px] font-bold text-[var(--copilot-accent-green)] tabular-nums shrink-0">
          {pct}%
        </span>
      </div>

      <AvatarStack members={squad.members} colors={squad.colors} />

      <div className="mt-5">
        <div className="flex justify-between text-[12px] text-[var(--copilot-text-secondary)] mb-2">
          <span className="tabular-nums">{fmtKr(squad.current)}</span>
          <span className="tabular-nums">Mål {fmtKr(squad.target)}</span>
        </div>
        <div className="h-2.5 rounded-full bg-white/[0.08] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #4a7aff, #22d97a)' }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
    </motion.article>
  );
}

export default function SquadsHub() {
  return (
    <PlanGate feature="squads">
      <SquadsHubContent />
    </PlanGate>
  );
}

function SquadsHubContent() {
  return (
    <CopilotToolShell
      title="Squads"
      subtitle="Spara tillsammans — gemensamma pottar med tydlig grupprogress."
      action={(
        <button type="button" className={`${copilotPrimaryBtnClass} !w-auto !px-5 !h-11 !text-[13px] shrink-0`}>
          <Plus className="w-4 h-4 inline mr-1.5" />
          Skapa Squad
        </button>
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {DEMO_SQUADS.map((squad, i) => (
          <SquadCard key={squad.id} squad={squad} index={i} />
        ))}
      </div>
      <button type="button" className={`${copilotGhostBtnClass} w-full`}>
        Bjud in vänner till en ny spargrupp
      </button>
    </CopilotToolShell>
  );
}
