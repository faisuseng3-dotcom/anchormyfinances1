import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertTriangle, Info, AlertCircle, TrendingUp, ChevronRight, Brain, RefreshCw } from 'lucide-react';
import { runInsightEngine, calcLiquidityForecast } from '@/lib/insightEngine';

const SEVERITY_STYLES = {
  danger:  { bg: 'rgba(229,62,62,0.08)',   border: 'rgba(229,62,62,0.22)',   icon: AlertCircle,   iconColor: '#E53E3E', label: 'Kritiskt' },
  warning: { bg: 'rgba(214,158,46,0.08)',  border: 'rgba(214,158,46,0.22)',  icon: AlertTriangle, iconColor: '#D69E2E', label: 'Varning' },
  info:    { bg: 'rgba(13,115,119,0.06)',  border: 'rgba(13,115,119,0.18)',  icon: Info,          iconColor: '#0D7377', label: 'Tips' },
  success: { bg: 'rgba(13,115,119,0.06)',  border: 'rgba(13,115,119,0.18)',  icon: TrendingUp,    iconColor: '#0D7377', label: 'Bra' },
};

function InsightCard({ insight, index }) {
  const [expanded, setExpanded] = useState(false);
  const style = SEVERITY_STYLES[insight.type] || SEVERITY_STYLES.info;
  const Icon = style.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: style.bg, border: `1px solid ${style.border}` }}
    >
      {/* Header row */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-start gap-3 p-4 text-left"
      >
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${style.iconColor}20` }}>
          <Icon className="w-4 h-4" style={{ color: style.iconColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: style.iconColor }}>{style.label}</span>
          </div>
          <p className="text-sm font-bold leading-snug" style={{ color: 'var(--color-text-primary)' }}>
            {insight.title}
          </p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {insight.description}
          </p>
        </div>
        <ChevronRight
          className="w-4 h-4 flex-shrink-0 mt-1 transition-transform"
          style={{ color: 'var(--color-text-muted)', transform: expanded ? 'rotate(90deg)' : 'none' }}
        />
      </button>

      {/* Expanded: consequence + action */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {insight.consequence && (
                <div className="p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.04)' }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Konsekvens</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    {insight.consequence}
                  </p>
                </div>
              )}
              {insight.action && insight.actionLink && (
                <Link to={insight.actionLink}>
                  <button className="w-full py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5"
                    style={{ background: style.iconColor }}>
                    {insight.action} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function LiquidityCard({ forecast }) {
  if (!forecast) return null;
  const isRisk = forecast.isNegative || forecast.daysToZero < 14;
  const style = isRisk ? SEVERITY_STYLES.danger : SEVERITY_STYLES.success;
  const Icon = style.icon;

  return (
    <div className="rounded-2xl p-4" style={{ background: style.bg, border: `1px solid ${style.border}` }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${style.iconColor}20` }}>
          <Icon className="w-4 h-4" style={{ color: style.iconColor }} />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: style.iconColor }}>
            {isRisk ? 'Likviditetsrisk' : 'Likviditet'}
          </span>
          <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {isRisk ? 'Pengarna räcker knapp' : 'Likviditeten ser OK ut'}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl p-2" style={{ background: 'rgba(0,0,0,0.04)' }}>
          <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Prognos 30d</p>
          <p className="text-sm font-bold" style={{ color: forecast.projectedBalance < 0 ? '#E53E3E' : '#0D7377' }}>
            {forecast.projectedBalance.toLocaleString('sv-SE')} kr
          </p>
        </div>
        <div className="rounded-xl p-2" style={{ background: 'rgba(0,0,0,0.04)' }}>
          <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Daglig snitt</p>
          <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {forecast.avgDailySpend.toLocaleString('sv-SE')} kr
          </p>
        </div>
        <div className="rounded-xl p-2" style={{ background: 'rgba(0,0,0,0.04)' }}>
          <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Fasta kvar</p>
          <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {forecast.remainingFixed.toLocaleString('sv-SE')} kr
          </p>
        </div>
      </div>
    </div>
  );
}

export default function InsightEngineCards({ profile, transactions }) {
  const [showAll, setShowAll] = useState(false);

  const insights = useMemo(() => runInsightEngine(profile, transactions), [profile, transactions]);
  const forecast = useMemo(() => calcLiquidityForecast(profile, transactions), [profile, transactions]);

  const visible = showAll ? insights : insights.slice(0, 3);
  const hasMore = insights.length > 3;

  if (!profile) return null;

  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'var(--shadow-sm)' }}>
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center gap-3" style={{ borderBottom: '1px solid #F0F2F5' }}>
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(13,115,119,0.1)' }}>
          <Brain className="w-4 h-4" style={{ color: '#0D7377' }} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold" style={{ color: '#1A2332' }}>Insiktsmotor</p>
          <p className="text-xs" style={{ color: '#9AA5B4' }}>
            {insights.length > 0 ? `${insights.length} mönster hittade` : 'Analyserar din ekonomi...'}
          </p>
        </div>
        {insights.length > 0 && (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{
            background: insights.some(i => i.type === 'danger') ? 'rgba(229,62,62,0.12)' : 'rgba(214,158,46,0.12)',
            color: insights.some(i => i.type === 'danger') ? '#E53E3E' : '#D69E2E'
          }}>
            {insights.filter(i => i.type === 'danger').length + insights.filter(i => i.type === 'warning').length} varningar
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Liquidity forecast */}
        {forecast && <LiquidityCard forecast={forecast} />}

        {/* Insight cards */}
        {insights.length === 0 && (
          <div className="py-6 text-center">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Allt ser bra ut!</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Importera transaktioner för djupare analys.
            </p>
          </div>
        )}

        <AnimatePresence>
          {visible.map((ins, i) => (
            <InsightCard key={ins.id} insight={ins} index={i} />
          ))}
        </AnimatePresence>

        {hasMore && (
          <button
            onClick={() => setShowAll(v => !v)}
            className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
            style={{ background: '#F4F6F8', color: '#9AA5B4' }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {showAll ? 'Visa färre' : `Visa ${insights.length - 3} till`}
          </button>
        )}
      </div>
    </div>
  );
}