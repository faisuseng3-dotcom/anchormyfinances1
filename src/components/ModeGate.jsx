/**
 * Feature gating based on user mode (basic / smart / pro).
 */

const FEATURE_ACCESS = {
  // Available to all
  expenses: ['basic', 'smart', 'pro'],
  budget: ['basic', 'smart', 'pro'],
  savings: ['basic', 'smart', 'pro'],

  // Smart+
  opportunity_scanner: ['smart', 'pro'],
  shadow_inflation: ['smart', 'pro'],
  tax_simple: ['smart', 'pro'],
  subscription_hunter: ['smart', 'pro'],

  // Pro only
  purchase_simulator: ['pro'],
  what_if: ['pro'],
  cfo_report: ['pro'],
  agent_hub: ['pro'],
  decision_engine: ['pro'],
  net_worth: ['pro'],
  pro_tools_full: ['pro'],
};

export function canAccess(feature, mode = 'basic') {
  const allowed = FEATURE_ACCESS[feature];
  if (!allowed) return true;
  return allowed.includes(mode);
}

export function getModeName(mode) {
  return { basic: 'Budget', smart: 'Smart', pro: 'Pro' }[mode] || 'Budget';
}

export function getUpgradeMessage(mode) {
  if (mode === 'basic') return 'Uppgradera till Smart eller Pro i Inställningar.';
  if (mode === 'smart') return 'Uppgradera till Pro i Inställningar.';
  return '';
}

// React component: wraps children, shows lock if no access
import React from 'react';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ModeGate({ feature, mode, children }) {
  if (canAccess(feature, mode)) return children;
  const msg = getUpgradeMessage(mode);
  const needed = FEATURE_ACCESS[feature]?.[0];
  const modeLabel = getModeName(needed);
  return (
    <div className="rounded-2xl p-6 flex flex-col items-center gap-3 text-center"
      style={{ background: 'rgba(17,24,39,0.5)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
        <Lock className="w-6 h-6 text-slate-500" />
      </div>
      <p className="text-sm font-semibold text-slate-300">Kräver {modeLabel}-läge</p>
      <p className="text-xs text-slate-500">{msg}</p>
      <Link to={createPageUrl('Settings')}
        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90">
        Ändra läge
      </Link>
    </div>
  );
}