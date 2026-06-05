// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell,
} from 'recharts';
import { X, ChevronRight, ArrowRight, AlertTriangle, AlertCircle, Info, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardDivider } from './DashboardChrome';
import {
  anchorIconButtonClass,
  anchorPrimaryButtonClass,
  anchorSecondaryButtonClass,
  elevatedSheet,
  sectionMetaClass,
  sectionSubtitleClass,
  sectionTitleClass,
} from '@/lib/anchorTheme';
import InsightWhyButton from '@/components/insights/InsightWhyButton';
import ContextualLessonLink from '@/components/anchorBrain/ContextualLessonLink';

const SEVERITY_STYLES = {
  danger: { iconColor: '#FCA5A5', label: 'Kritiskt', Icon: AlertCircle },
  warning: { iconColor: '#FCD34D', label: 'Varning', Icon: AlertTriangle },
  info: { iconColor: '#9FB5FF', label: 'Tips', Icon: Info },
  success: { iconColor: '#9AE6B4', label: 'Bra', Icon: TrendingUp },
};

const CAT_LABELS = {
  food: 'Mat', entertainment: 'Nöje', shopping: 'Shopping',
  travel: 'Resor', health: 'Hälsa', other: 'Övrigt',
};

function fmtKr(v) { return `${Math.round(v).toLocaleString('sv-SE')} kr`; }

function getMonthLabel(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('sv-SE', { month: 'short' });
}

function groupTxsByMonth(txs, category) {
  const relevant = category
    ? txs.filter((t) => ['expense', 'savings_deposit', 'transfer_to_savings'].includes(t.type) && t.category === category)
    : txs.filter((t) => ['expense', 'savings_deposit', 'transfer_to_savings'].includes(t.type));
  const byMonth = {};
  relevant.forEach((t) => {
    const d = new Date(t.created_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!byMonth[key]) byMonth[key] = { month: getMonthLabel(t.created_date), total: 0, txs: [] };
    byMonth[key].total += Math.abs(t.amount);
    byMonth[key].txs.push(t);
  });
  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([, v]) => ({ ...v, total: Math.round(v.total) }));
}

const BarTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#1a2233] border border-white/10 text-white">
      {payload[0].value.toLocaleString('sv-SE')} kr
    </div>
  );
};

function ComparisonSection({ insight, transactions }) {
  const cat = insight.data?.cat;
  const chartData = useMemo(() => groupTxsByMonth(transactions, cat), [transactions, cat]);
  const avg = insight.data?.prevAvg || insight.data?.avg || 0;
  const isCurrentMonth = (i) => i === chartData.length - 1;

  if (!chartData.length) return null;

  return (
    <div className="rounded-xl p-4 border border-white/[0.08] bg-white/[0.03]">
      <p className={sectionMetaClass}>
        {cat ? `${CAT_LABELS[cat] || cat} per månad` : 'Utgifter per månad'}
      </p>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={chartData} barCategoryGap="30%">
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.45)' }} axisLine={false} tickLine={false} />
          <Tooltip content={<BarTip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          {avg > 0 && (
            <ReferenceLine
              y={avg}
              stroke="rgba(255,255,255,0.35)"
              strokeDasharray="4 3"
              strokeWidth={1.5}
            />
          )}
          <Bar dataKey="total" radius={[6, 6, 0, 0]}>
            {chartData.map((_, i) => (
              <Cell
                key={i}
                fill={isCurrentMonth(i) ? '#FCA5A5' : 'rgba(255,255,255,0.45)'}
                opacity={isCurrentMonth(i) ? 1 : 0.55}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className={`${sectionMetaClass} mt-2 text-center`}>Röd stapel = innevarande månad</p>
    </div>
  );
}

function AccumulationSection({ insight, profile, reductionPct, onReductionChange }) {
  const current = insight.data?.current || insight.data?.curr || 0;
  const avg = insight.data?.avg || insight.data?.prevAvg || 0;
  const diff = current > avg ? current - avg : 0;
  const reduced = diff * (1 - reductionPct / 100);
  const yearCost = diff * 12;
  const yearSaved = reduced * 12;

  const goalName = profile?.savingsGoalName || 'ditt sparmål';
  const goalTotal = profile?.savingsGoal || 0;
  const monthlySaving = profile?.income
    ? Math.max(0, profile.income - (profile.housingCost || 0)) * 0.2
    : 500;
  const weeksEarlier = monthlySaving > 0 ? Math.round((yearSaved / 12) / monthlySaving * 4.33) : 0;

  return (
    <div className="space-y-3">
      <div className="rounded-xl p-4 border border-rose-400/20 bg-rose-400/10">
        <p className="text-[13px] font-medium text-rose-200/90 mb-2">På ett år</p>
        <div className="flex items-center gap-3">
          <div>
            <p className="text-[24px] font-semibold text-white tabular-nums">{fmtKr(yearCost)}</p>
            <p className={sectionMetaClass}>extra jämfört med ditt snitt</p>
          </div>
          <ArrowRight className="w-5 h-5 flex-shrink-0 text-white/30" />
          <div>
            <p className="text-[14px] font-medium text-white">{goalName}</p>
            {goalTotal > 0 && weeksEarlier > 0 && (
              <p className="text-[13px] text-emerald-300/90 mt-0.5">
                Cirka {weeksEarlier} veckor snabbare om du drar ner
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl p-4 border border-white/[0.08] bg-white/[0.03]">
        <div className="flex items-center justify-between mb-3">
          <p className={sectionMetaClass}>Vad händer om du drar ner?</p>
          <span className="text-[15px] font-semibold text-white">−{reductionPct}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={reductionPct}
          onChange={(e) => onReductionChange(Number(e.target.value))}
          className="w-full accent-white"
        />
        <div className="flex justify-between mt-1">
          <span className={sectionMetaClass}>0%</span>
          <span className={sectionMetaClass}>100%</span>
        </div>
        <div className="mt-3 p-3 rounded-xl flex items-center justify-between border border-white/[0.08] bg-white/[0.04]">
          <div>
            <p className={sectionMetaClass}>Sparar du per år</p>
            <p className="text-[22px] font-semibold text-emerald-300/95 tabular-nums">{fmtKr(yearSaved)}</p>
          </div>
          {goalTotal > 0 && (
            <div className="text-right">
              <p className={sectionMetaClass}>Mot {goalName}</p>
              <p className="text-[14px] font-medium text-white/80">
                {weeksEarlier > 0 ? `${weeksEarlier} v. snabbare` : '—'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EvidenceSection({ insight, transactions }) {
  const cat = insight.data?.cat;
  const names = insight.data?.names || [];

  const evidenceTxs = useMemo(() => {
    if (cat) {
      return transactions
        .filter((t) => t.category === cat && ['expense', 'savings_deposit', 'transfer_to_savings'].includes(t.type))
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
        .slice(0, 8);
    }
    if (names.length > 0) {
      return transactions
        .filter((t) => names.some((n) => (t.vendor || t.label || '').toLowerCase().includes(n)))
        .slice(0, 8);
    }
    return transactions
      .filter((t) => ['expense', 'savings_deposit', 'transfer_to_savings'].includes(t.type))
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 6);
  }, [transactions, cat, names]);

  if (!evidenceTxs.length) return null;

  return (
    <div>
      <p className={`${sectionMetaClass} mb-2`}>
        Exempel ({evidenceTxs.length})
      </p>
      <div className="rounded-xl overflow-hidden border border-white/[0.08]">
        {evidenceTxs.map((t, i) => (
          <div
            key={t.id || i}
            className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02]"
            style={{ borderBottom: i < evidenceTxs.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
          >
            <div className="min-w-0">
              <p className="text-[14px] font-medium text-white truncate">
                {t.vendor || t.label || 'Okänd'}
              </p>
              <p className={sectionMetaClass}>
                {t.created_date ? new Date(t.created_date).toLocaleDateString('sv-SE') : ''}
              </p>
            </div>
            <p className="text-[14px] font-medium text-rose-300/90 ml-3 flex-shrink-0 tabular-nums">
              −{Math.abs(t.amount).toLocaleString('sv-SE')} kr
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InsightDetailModal({ insight, transactions, profile, onClose }) {
  const [reductionPct, setReductionPct] = useState(20);
  const style = SEVERITY_STYLES[insight?.type] || SEVERITY_STYLES.info;
  const { Icon } = style;
  const hasCategoryData = !!(insight?.data?.cat || insight?.data?.current || insight?.data?.curr);

  if (!insight) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center"
        style={{ background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          key="sheet"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg rounded-t-[24px] overflow-hidden max-h-[92vh] overflow-y-auto"
          style={elevatedSheet()}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-9 h-1 rounded-full bg-white/20" />
          </div>

          <div className="px-5 pb-4 pt-2 flex items-start gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${style.iconColor}18` }}
            >
              <Icon className="w-5 h-5" style={{ color: style.iconColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium" style={{ color: style.iconColor }}>
                {style.label}
              </p>
              <h2 className={`${sectionTitleClass} mt-0.5`}>{insight.title}</h2>
              <p className={`${sectionSubtitleClass} mt-1`}>{insight.description}</p>
              <InsightWhyButton why={insight.why} className="mt-2" />
            </div>
            <button type="button" onClick={onClose} className={anchorIconButtonClass} aria-label="Stäng">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-5 pb-8 space-y-4">
            {insight.consequence && (
              <div
                className="p-3 rounded-xl border"
                style={{
                  background: `${style.iconColor}10`,
                  borderColor: `${style.iconColor}30`,
                }}
              >
                <p className="text-[13px] font-medium mb-1" style={{ color: style.iconColor }}>
                  Konsekvens
                </p>
                <p className={`${sectionSubtitleClass}`}>{insight.consequence}</p>
              </div>
            )}

            <ComparisonSection insight={insight} transactions={transactions} />

            {hasCategoryData && (
              <AccumulationSection
                insight={insight}
                profile={profile}
                reductionPct={reductionPct}
                onReductionChange={setReductionPct}
              />
            )}

            <EvidenceSection insight={insight} transactions={transactions} />

            {(insight.id?.includes('buffer') || insight.id?.includes('savings') || insight.data?.cat) && (
              <ContextualLessonLink profile={profile} transactions={transactions} className="block" />
            )}

            <DashboardDivider />

            <div className="space-y-2 pt-1">
              {insight.actionLink && insight.action && (
                <Link to={insight.actionLink} onClick={onClose} className="block no-underline">
                  <button
                    type="button"
                    className={`w-full ${anchorPrimaryButtonClass}`}
                    style={{ background: style.iconColor, color: '#0a1628' }}
                  >
                    {insight.action}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              )}
              <button type="button" onClick={onClose} className={`w-full ${anchorSecondaryButtonClass}`}>
                Stäng
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
