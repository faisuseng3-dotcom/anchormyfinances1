// @ts-nocheck
import React, { useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  X, Shield, PiggyBank, Wallet, ArrowLeftRight, Settings2, TrendingUp, Sparkles,
} from 'lucide-react';
import CopilotProgressRing from '@/components/ui-premium/copilot/CopilotProgressRing';
import { copilotPrimaryBtnClass, copilotGhostBtnClass } from '@/lib/copilotTheme';
import { planeraTabHref } from '@/lib/planeraTabs';
import { drawerPanel, drawerPanelExit, sheetBackdrop } from '@/lib/motionPresets';
import { zIndex } from '@/lib/designTokens';
import { triggerHaptic } from '@/lib/haptics';
import {
  getAccountTransferHistory,
  buildMarginBreakdown,
  getPeerSavingsPercentile,
  accountGoalPct,
  fmtKr,
} from './accountDrawerUtils';

const ACCOUNT_META = {
  buffer: {
    icon: Shield,
    accent: '#4fc3f7',
    gradient: 'linear-gradient(135deg, rgba(79,195,247,0.18) 0%, rgba(74,122,255,0.1) 100%)',
    subtitle: 'Din trygghetsreserv',
  },
  savings: {
    icon: PiggyBank,
    accent: '#22d97a',
    gradient: 'linear-gradient(135deg, rgba(34,217,122,0.18) 0%, rgba(74,122,255,0.08) 100%)',
    subtitle: 'Mot ditt sparmål',
  },
  margin: {
    icon: Wallet,
    accent: '#4a7aff',
    gradient: 'linear-gradient(135deg, rgba(74,122,255,0.2) 0%, rgba(109,74,255,0.1) 100%)',
    subtitle: 'Kvar efter fasta kostnader',
  },
};

function TransferRow({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
      className="flex items-center gap-3 p-3.5 rounded-2xl organic-surface"
      style={{ background: `rgba(255,255,255,${0.04 + (index % 3) * 0.02})` }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: item.incoming ? 'rgba(34,217,122,0.12)' : 'rgba(244,114,182,0.1)',
          boxShadow: 'var(--anchor-shadow-1)',
        }}
      >
        <ArrowLeftRight
          className="w-4 h-4"
          style={{ color: item.incoming ? '#22d97a' : '#f472b6' }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-white truncate">{item.label}</p>
        <p className="text-[12px] text-[var(--copilot-text-muted)]">{item.dateLabel}</p>
      </div>
      <p
        className="text-[14px] font-semibold tabular-nums shrink-0"
        style={{ color: item.incoming ? '#22d97a' : 'var(--copilot-text-secondary)' }}
      >
        {item.signed}{fmtKr(item.amount)}
      </p>
    </motion.div>
  );
}

function MarginBreakdown({ profile }) {
  const breakdown = useMemo(() => buildMarginBreakdown(profile), [profile]);
  const peerPct = useMemo(() => getPeerSavingsPercentile(profile), [profile]);

  return (
    <>
      <div className="space-y-2">
        {breakdown.rows.map((row) => (
          <div
            key={row.key}
            className="flex items-center justify-between gap-3 p-3.5 rounded-2xl organic-surface bg-[var(--copilot-bg-card)]"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="text-[11px] font-bold w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: row.sign === '+' ? 'rgba(34,217,122,0.15)' : 'rgba(244,114,182,0.12)',
                  color: row.sign === '+' ? '#22d97a' : '#f472b6',
                }}
              >
                {row.sign}
              </span>
              <span className="text-[14px] text-[var(--copilot-text-secondary)]">{row.label}</span>
            </div>
            <span className="text-[14px] font-semibold text-white tabular-nums">
              {fmtKr(row.amount)}
            </span>
          </div>
        ))}
        <div
          className="flex items-center justify-between gap-3 p-4 rounded-3xl border-[rgba(74,122,255,0.35)]"
          style={{ background: 'rgba(74,122,255,0.12)' }}
        >
          <span className="text-[14px] font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--copilot-accent-green)]" />
            Kvar att leva på
          </span>
          <span className="text-[20px] font-bold text-[var(--copilot-accent-green)] tabular-nums">
            {fmtKr(breakdown.afterAuto > 0 && breakdown.autoSave > 0 ? breakdown.afterAuto : breakdown.margin)}
          </span>
        </div>
      </div>

      <div
        className="mt-5 p-4 rounded-3xl border-[rgba(34,217,122,0.25)]"
        style={{ background: 'rgba(34,217,122,0.08)' }}
      >
        <p className="text-[14px] text-[var(--copilot-text-secondary)] leading-relaxed flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-[var(--copilot-accent-green)] shrink-0 mt-0.5" />
          <span>
            Du sparar mer än{' '}
            <strong className="text-white">{peerPct}%</strong>
            {' '}av liknande användare denna månad. Snyggt jobbat!
          </span>
        </p>
      </div>

      <Link
        to={planeraTabHref('framtid')}
        onClick={() => triggerHaptic('light')}
        className={`mt-5 ${copilotGhostBtnClass} w-full no-underline`}
      >
        <Settings2 className="w-4 h-4" />
        Justera din månadsplan
      </Link>
    </>
  );
}

function SavingsAccountPanel({ account, profile, transactions, onOpenSwipe }) {
  const meta = ACCOUNT_META[account.id] || ACCOUNT_META.savings;
  const Icon = meta.icon;
  const pct = accountGoalPct(account.amount, account.goalTarget);
  const transfers = useMemo(
    () => getAccountTransferHistory(account.id, transactions),
    [account.id, transactions],
  );

  return (
    <>
      <div
        className="rounded-2xl organic-surface p-5 mb-6"
        style={{ background: meta.gradient }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: `${meta.accent}22`, border: `1px solid ${meta.accent}40` }}
          >
            <Icon className="w-7 h-7" style={{ color: meta.accent }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--copilot-text-muted)]">
              {meta.subtitle}
            </p>
            <p className="text-[32px] font-bold text-white tabular-nums leading-none mt-1">
              {fmtKr(account.amount)}
            </p>
            <p className="text-[13px] text-[var(--copilot-text-secondary)] mt-2">{account.name}</p>
          </div>
        </div>
      </div>

      {pct != null && (
        <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl organic-surface bg-[var(--copilot-bg-card)]">
          <CopilotProgressRing
            value={pct}
            max={100}
            size={80}
            stroke={6}
            color={meta.accent}
            label={`${pct}%`}
            sublabel="av mål"
          />
          <div>
            <p className="text-[13px] text-[var(--copilot-text-muted)]">Mål</p>
            <p className="text-[18px] font-bold text-white tabular-nums">{fmtKr(account.goalTarget)}</p>
            <p className="text-[12px] text-[var(--copilot-text-secondary)] mt-1">
              {fmtKr(Math.max(0, account.goalTarget - account.amount))} kvar
            </p>
          </div>
        </div>
      )}

      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--copilot-text-muted)] mb-3">
        Senaste överföringar
      </p>
      <div className="space-y-2 mb-6">
        {transfers.length === 0 ? (
          <p className="text-[13px] text-[var(--copilot-text-muted)] py-6 text-center">
            Inga överföringar registrerade än.
          </p>
        ) : (
          transfers.map((t, i) => <TransferRow key={t.id} item={t} index={i} />)
        )}
      </div>

      <button
        type="button"
        onClick={() => { triggerHaptic('medium'); onOpenSwipe?.(); }}
        className={`${copilotPrimaryBtnClass} flex items-center justify-center gap-2`}
      >
        <ArrowLeftRight className="w-4 h-4" />
        Flytta pengar till/från konto
      </button>
    </>
  );
}

export default function AccountDetailDrawer({
  account,
  profile,
  transactions = [],
  isOpen,
  onClose,
  onOpenSwipe,
}) {
  const reduceMotion = useReducedMotion();

  if (!account) return null;

  const isMargin = account.id === 'margin';
  const panelMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : drawerPanel;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            key="account-drawer-backdrop"
            aria-label="Stäng panel"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            style={{ zIndex: zIndex.sheet }}
            {...sheetBackdrop}
            onClick={onClose}
          />
          <motion.aside
            key="account-drawer-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-drawer-title"
            className="fixed inset-y-0 right-0 w-full max-w-md flex flex-col border-l  shadow-2xl overflow-hidden"
            style={{
              zIndex: zIndex.sheet + 1,
              background: 'linear-gradient(180deg, #0a0f6b 0%, #0d1a9e 55%, #1228cc 100%)',
            }}
            {...panelMotion}
            {...(reduceMotion ? {} : drawerPanelExit)}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
              <h2 id="account-drawer-title" className="text-[18px] font-bold text-white">
                {account.name}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--copilot-bg-card)] organic-surface text-[var(--copilot-text-secondary)] hover:text-white transition-colors"
                aria-label="Stäng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-8">
              {isMargin ? (
                <MarginBreakdown profile={profile} />
              ) : (
                <SavingsAccountPanel
                  account={account}
                  profile={profile}
                  transactions={transactions}
                  onOpenSwipe={onOpenSwipe}
                />
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
