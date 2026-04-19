import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell
} from 'recharts';
import { X, ChevronRight, ArrowRight, Target, TrendingDown, AlertTriangle, AlertCircle, Info, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const SEVERITY_STYLES = {
  danger:  { iconColor: '#E53E3E', label: 'Kritiskt', Icon: AlertCircle },
  warning: { iconColor: '#D69E2E', label: 'Varning',  Icon: AlertTriangle },
  info:    { iconColor: '#0D7377', label: 'Tips',     Icon: Info },
  success: { iconColor: '#0D7377', label: 'Bra',      Icon: TrendingUp },
};

const CAT_LABELS = {
  food: 'Mat', entertainment: 'Nöje', shopping: 'Shopping',
  travel: 'Resor', health: 'Hälsa', other: 'Övrigt',
};

// ── Helpers ───────────────────────────────────────────────────────────────
function fmtKr(v) { return Math.round(v).toLocaleString('sv-SE') + ' kr'; }

function getMonthLabel(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('sv-SE', { month: 'short' });
}

function groupTxsByMonth(txs, category) {
  const relevant = category
    ? txs.filter(t => ['expense','savings_deposit','transfer_to_savings'].includes(t.type) && t.category === category)
    : txs.filter(t => ['expense','savings_deposit','transfer_to_savings'].includes(t.type));
  const byMonth = {};
  relevant.forEach(t => {
    const d = new Date(t.created_date);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    if (!byMonth[key]) byMonth[key] = { month: getMonthLabel(t.created_date), total: 0, txs: [] };
    byMonth[key].total += Math.abs(t.amount);
    byMonth[key].txs.push(t);
  });
  return Object.entries(byMonth)
    .sort(([a],[b]) => a.localeCompare(b))
    .slice(-6)
    .map(([, v]) => ({ ...v, total: Math.round(v.total) }));
}

// ── Custom bar tooltip ────────────────────────────────────────────────────
const BarTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl shadow text-xs font-semibold"
      style={{ background: '#fff', border: '1px solid #E2E8F0', color: '#1A2332' }}>
      {payload[0].value.toLocaleString('sv-SE')} kr
    </div>
  );
};

// ── Section: Comparison Chart ─────────────────────────────────────────────
function ComparisonSection({ insight, transactions }) {
  const cat = insight.data?.cat;
  const chartData = useMemo(() => groupTxsByMonth(transactions, cat), [transactions, cat]);
  const avg = insight.data?.prevAvg || insight.data?.avg || 0;
  const isCurrentMonth = (i) => i === chartData.length - 1;

  if (!chartData.length) return null;

  return (
    <div className="rounded-2xl p-4" style={{ background: '#F4F6F8' }}>
      <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#9AA5B4' }}>
        {cat ? `${CAT_LABELS[cat] || cat} — Månadsöversikt` : 'Utgifter per månad'}
      </p>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={chartData} barCategoryGap="30%">
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9AA5B4' }} axisLine={false} tickLine={false} />
          <Tooltip content={<BarTip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          {avg > 0 && (
            <ReferenceLine y={avg} stroke="#0D7377" strokeDasharray="4 3" strokeWidth={1.5}
              label={{ value: 'Snitt', position: 'right', fill: '#0D7377', fontSize: 9 }} />
          )}
          <Bar dataKey="total" radius={[6,6,0,0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={isCurrentMonth(i) ? '#E53E3E' : '#0D7377'} opacity={isCurrentMonth(i) ? 1 : 0.45} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-[10px] mt-1 text-center" style={{ color: '#9AA5B4' }}>
        Röd stapel = innevarande månad
      </p>
    </div>
  );
}

// ── Section: Accumulation Effect ──────────────────────────────────────────
function AccumulationSection({ insight, profile, reductionPct, onReductionChange }) {
  const current = insight.data?.current || insight.data?.curr || 0;
  const avg     = insight.data?.avg     || insight.data?.prevAvg || 0;
  const diff    = current > avg ? current - avg : 0;
  const reduced = diff * (1 - reductionPct / 100);
  const yearCost = diff * 12;
  const yearSaved = reduced * 12;

  const goalName  = profile?.savingsGoalName || 'ditt sparmål';
  const goalTotal = profile?.savingsGoal || 0;
  const monthlySaving = profile?.income ? Math.max(0, profile.income - (profile.housingCost || 0)) * 0.2 : 500;
  const weeksEarlier = monthlySaving > 0 ? Math.round((yearSaved / 12) / monthlySaving * 4.33) : 0;

  return (
    <div className="space-y-3">
      {/* Year cost */}
      <div className="rounded-2xl p-4" style={{ background: 'rgba(229,62,62,0.07)', border: '1px solid rgba(229,62,62,0.18)' }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#E53E3E' }}>Ackumulationseffekt</p>
        <div className="flex items-center gap-3">
          <div>
            <p className="text-2xl font-black" style={{ color: '#E53E3E' }}>{fmtKr(yearCost)}</p>
            <p className="text-xs mt-0.5" style={{ color: '#4A5568' }}>extra per år jämfört med ditt snitt</p>
          </div>
          <ArrowRight className="w-5 h-5 flex-shrink-0" style={{ color: '#CBD5E0' }} />
          <div>
            <p className="text-sm font-bold" style={{ color: '#1A2332' }}>{goalName}</p>
            {goalTotal > 0 && weeksEarlier > 0 && (
              <p className="text-xs mt-0.5" style={{ color: '#0D7377' }}>
                {weeksEarlier} veckor tidigare om du drar ner
              </p>
            )}
          </div>
        </div>
      </div>

      {/* What-if slider */}
      <div className="rounded-2xl p-4" style={{ background: '#F4F6F8' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9AA5B4' }}>Vad händer om?</p>
          <span className="text-sm font-bold" style={{ color: '#0D7377' }}>-{reductionPct}%</span>
        </div>
        <input
          type="range" min={0} max={100} step={5} value={reductionPct}
          onChange={e => onReductionChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: '#0D7377' }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px]" style={{ color: '#CBD5E0' }}>0%</span>
          <span className="text-[10px]" style={{ color: '#CBD5E0' }}>100%</span>
        </div>
        {/* Live result */}
        <div className="mt-3 p-3 rounded-xl flex items-center justify-between"
          style={{ background: 'rgba(13,115,119,0.08)', border: '1px solid rgba(13,115,119,0.15)' }}>
          <div>
            <p className="text-xs" style={{ color: '#9AA5B4' }}>Sparar du per år</p>
            <p className="text-xl font-black" style={{ color: '#0D7377' }}>{fmtKr(yearSaved)}</p>
          </div>
          {goalTotal > 0 && (
            <div className="text-right">
              <p className="text-xs" style={{ color: '#9AA5B4' }}>Mot {goalName}</p>
              <p className="text-sm font-bold" style={{ color: '#1A2332' }}>
                {weeksEarlier > 0 ? `${weeksEarlier} v. snabbare` : 'Ingen effekt'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Section: Evidence list ────────────────────────────────────────────────
function EvidenceSection({ insight, transactions }) {
  const cat = insight.data?.cat;
  const names = insight.data?.names || [];

  // For category spike: show txs from current month in that category
  const evidenceTxs = useMemo(() => {
    if (cat) {
      return transactions
        .filter(t => t.category === cat && ['expense','savings_deposit','transfer_to_savings'].includes(t.type))
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
        .slice(0, 8);
    }
    if (names.length > 0) {
      return transactions
        .filter(t => names.some(n => (t.vendor || t.label || '').toLowerCase().includes(n)))
        .slice(0, 8);
    }
    return transactions
      .filter(t => ['expense','savings_deposit','transfer_to_savings'].includes(t.type))
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 6);
  }, [transactions, cat, names]);

  if (!evidenceTxs.length) return null;

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider mb-2 px-1" style={{ color: '#9AA5B4' }}>
        Transaktionsbevis ({evidenceTxs.length})
      </p>
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
        {evidenceTxs.map((t, i) => (
          <div key={t.id || i}
            className="flex items-center justify-between px-4 py-2.5"
            style={{ borderBottom: i < evidenceTxs.length - 1 ? '1px solid #F0F2F5' : 'none', background: '#fff' }}>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: '#1A2332' }}>
                {t.vendor || t.label || 'Okänd'}
              </p>
              <p className="text-[10px]" style={{ color: '#9AA5B4' }}>
                {t.created_date ? new Date(t.created_date).toLocaleDateString('sv-SE') : ''}
              </p>
            </div>
            <p className="text-xs font-bold ml-3 flex-shrink-0" style={{ color: '#E53E3E' }}>
              -{Math.abs(t.amount).toLocaleString('sv-SE')} kr
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────
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
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      >
        <motion.div
          key="sheet"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 280 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-lg rounded-t-3xl overflow-hidden"
          style={{ background: '#fff', maxHeight: '92vh', overflowY: 'auto' }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full" style={{ background: '#E2E8F0' }} />
          </div>

          {/* Header */}
          <div className="px-5 pb-4 pt-2 flex items-start gap-3">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${style.iconColor}15` }}
            >
              <Icon className="w-5 h-5" style={{ color: style.iconColor }} />
            </motion.div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: style.iconColor }}>
                {style.label}
              </span>
              <h2 className="text-lg font-black leading-tight" style={{ color: '#1A2332' }}>
                {insight.title}
              </h2>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: '#4A5568' }}>
                {insight.description}
              </p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: '#F4F6F8' }}>
              <X className="w-4 h-4" style={{ color: '#9AA5B4' }} />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 pb-8 space-y-4">
            {/* Consequence box */}
            {insight.consequence && (
              <div className="p-3 rounded-2xl" style={{ background: `${style.iconColor}08`, border: `1px solid ${style.iconColor}22` }}>
                <p className="text-xs font-semibold mb-1" style={{ color: style.iconColor }}>Konsekvens</p>
                <p className="text-xs leading-relaxed" style={{ color: '#4A5568' }}>{insight.consequence}</p>
              </div>
            )}

            {/* Comparison chart */}
            <ComparisonSection insight={insight} transactions={transactions} />

            {/* Accumulation + What-if (only for spending insights) */}
            {hasCategoryData && (
              <AccumulationSection
                insight={insight}
                profile={profile}
                reductionPct={reductionPct}
                onReductionChange={setReductionPct}
              />
            )}

            {/* Evidence */}
            <EvidenceSection insight={insight} transactions={transactions} />

            {/* Actions */}
            <div className="space-y-2 pt-1">
              {insight.actionLink && insight.action && (
                <Link to={insight.actionLink} onClick={onClose}>
                  <button className="w-full py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2"
                    style={{ background: style.iconColor }}>
                    {insight.action} <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              )}
              <button onClick={onClose}
                className="w-full py-3 rounded-2xl text-sm font-semibold"
                style={{ background: '#F4F6F8', color: '#9AA5B4' }}>
                Stäng
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}