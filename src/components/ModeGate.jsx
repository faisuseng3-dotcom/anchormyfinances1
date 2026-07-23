import React from 'react';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

/**
 * Feature access map.
 * basic  = Budget mode
 * smart  = Smart mode
 * pro    = Pro mode
 */
const FEATURE_ACCESS = {
  // All modes
  expenses:            ['basic', 'smart', 'pro'],
  budget:              ['basic', 'smart', 'pro'],
  savings:             ['basic', 'smart', 'pro'],

  // Smart+
  opportunity_scanner: ['smart', 'pro'],
  shadow_inflation:    ['smart', 'pro'],
  tax_simple:          ['smart', 'pro'],
  subscription_hunter: ['smart', 'pro'],

  // Pro only – technically unavailable at lower modes
  purchase_simulator:  ['pro'],
  what_if:             ['pro'],
  cfo_report:          ['pro'],
  agent_hub:           ['pro'],
  decision_engine:     ['pro'],
  net_worth:           ['pro'],
  pro_tools_full:      ['pro'],
  precision_tax:       ['pro'],
  crisis_assistant:    ['pro'],
  legacy_planner:      ['pro'],
  family_finances:     ['pro'],
};

const MODE_LABELS = { basic: 'Budget', smart: 'Smart', pro: 'Pro' };

export function canAccess(feature, mode = 'basic') {
  const allowed = FEATURE_ACCESS[feature];
  if (!allowed) return true; // unknown features are open by default
  return allowed.includes(mode);
}

export function getModeName(mode) {
  return MODE_LABELS[mode] || 'Budget';
}

export function getUpgradeMessage(mode) {
  if (mode === 'basic') return 'Uppgradera till Smart eller Pro i Inställningar.';
  if (mode === 'smart') return 'Uppgradera till Pro i Inställningar.';
  return '';
}

/**
 * ModeGate wraps children and shows a lock screen if the user's mode
 * doesn't have access to the given feature.
 */
export default function ModeGate({ feature, mode, children }) {
  if (canAccess(feature, mode)) return <>{children}</>;

  const needed = FEATURE_ACCESS[feature]?.[0];
  const neededLabel = getModeName(needed);
  const upgradeMsg = getUpgradeMessage(mode);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
      <div className="rounded-2xl p-8 flex flex-col items-center gap-4 text-center max-w-sm w-full"
        style={{ background: 'rgba(17,24,39,0.7)', boxShadow: 'var(--anchor-shadow-1)' }}>
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
          <Lock className="w-8 h-8 text-white/40" />
        </div>
        <div>
          <p className="text-lg font-bold text-white mb-1">Kräver {neededLabel}-läge</p>
          <p className="text-sm text-white/45 leading-relaxed">{upgradeMsg}</p>
        </div>
        <Link
          to={createPageUrl('Pricing')}
          className="w-full py-3 rounded-xl text-sm font-bold text-[#08110c] text-center bg-[#4fae82] hover:opacity-90"
        >
          Uppgradera →
        </Link>
      </div>
    </div>
  );
}