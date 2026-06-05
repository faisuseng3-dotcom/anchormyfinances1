import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, CheckCircle2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from "@/components/ui/button";

const fmt = (v) => Math.round(v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

function getDaysUntil(dayOfMonth) {
  const today = new Date();
  const todayDay = today.getDate();
  if (dayOfMonth >= todayDay) return dayOfMonth - todayDay;
  // next month
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, dayOfMonth);
  return Math.round((nextMonth - today) / (1000 * 60 * 60 * 24));
}

function getUpcomingPayments(profile) {
  const today = new Date().getDate();
  // Look 14 days ahead
  const upcoming = [];

  // Subscriptions with billingDay
  (profile.subscriptions || []).forEach(sub => {
    if (!sub.billingDay) return;
    const daysUntil = getDaysUntil(sub.billingDay);
    if (daysUntil <= 14) {
      upcoming.push({
        name: sub.name,
        amount: sub.amount,
        daysUntil,
        dayOfMonth: sub.billingDay,
        frequency: sub.frequency || 'monthly',
        type: 'subscription'
      });
    }
  });

  // Loans: assume 25th by default
  (profile.loans || []).forEach(loan => {
    const billingDay = loan.billingDay || 25;
    const daysUntil = getDaysUntil(billingDay);
    if (daysUntil <= 14) {
      upcoming.push({
        name: loan.name,
        amount: loan.monthlyPayment,
        daysUntil,
        dayOfMonth: billingDay,
        type: 'loan'
      });
    }
  });

  return upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
}

export default function CashFlowCalendar({ profile }) {
  const [expanded, setExpanded] = useState(false);
  const [aiWarning, setAiWarning] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!profile) return null;

  const upcoming = getUpcomingPayments(profile);
  if (upcoming.length === 0) return null;

  const totalUpcoming = upcoming.reduce((s, p) => s + p.amount, 0);
  const totalFixedCosts = (profile.housingCost || 0) +
    (profile.subscriptions || []).reduce((s, x) => s + x.amount, 0) +
    (profile.loans || []).reduce((s, x) => s + x.monthlyPayment, 0);
  const margin = (profile.income || 0) - totalFixedCosts;
  const buffer = profile.buffer || 0;
  const isCritical = (buffer - totalUpcoming) < 0;
  const isTight = !isCritical && (buffer - totalUpcoming) < margin * 0.5;

  const statusColor = isCritical ? 'from-rose-500/20 to-rose-600/10' :
    isTight ? 'from-amber-500/20 to-amber-600/10' :
    'from-emerald-500/10 to-emerald-600/5';
  const statusBorder = isCritical ? 'rgba(239,68,68,0.35)' :
    isTight ? 'rgba(245,158,11,0.35)' :
    'rgba(16,185,129,0.25)';
  const StatusIcon = isCritical ? AlertTriangle : isTight ? AlertTriangle : CheckCircle2;
  const statusIconColor = isCritical ? 'text-rose-400' : isTight ? 'text-amber-400' : 'text-emerald-400';
  const statusText = isCritical ? 'Likviditetsvarning' : isTight ? 'Tight nästa 14 dagarna' : 'Betalningskalender';

  const handleAiAnalysis = async () => {
    setLoading(true);
    const paymentList = upcoming.map(p => `${p.name}: ${fmt(p.amount)} kr (om ${p.daysUntil} dag${p.daysUntil === 1 ? '' : 'ar'})`).join('\n');
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Du är CFO-Analytikern. Analysera användarens betalningssituation de närmaste 14 dagarna.

Kommande betalningar:
${paymentList}

Total kommande: ${fmt(totalUpcoming)} kr
Nuvarande buffert: ${fmt(buffer)} kr
Buffert efter betalningar: ${fmt(buffer - totalUpcoming)} kr
Månadsmarginal: ${fmt(margin)} kr

${isCritical ? 'KRITISKT: Bufferten täcker inte de kommande betalningarna!' : isTight ? 'TIGHT: Marginalen är låg efter kommande betalningar.' : 'Situationen ser OK ut men ge råd.'}

Ge en KONKRET rekommendation på svenska (2-3 meningar). Var specifik om belopp och datum. Avsluta med en handlingsbar åtgärd.`,
      response_json_schema: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          action: { type: 'string' }
        }
      }
    });
    setAiWarning(res);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-4 bg-gradient-to-br ${statusColor}`}
      style={{ border: `1px solid ${statusBorder}` }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-4 h-4 ${statusIconColor}`} />
          <span className="text-sm font-semibold text-white">{statusText}</span>
          {upcoming.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
              {upcoming.length} betalning{upcoming.length > 1 ? 'ar' : ''} · {fmt(totalUpcoming)} kr
            </span>
          )}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-2">
              {upcoming.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-sm text-white font-medium">{p.name}</p>
                    <p className="text-xs text-slate-400">
                      {p.daysUntil === 0 ? 'Idag' : p.daysUntil === 1 ? 'Imorgon' : `Om ${p.daysUntil} dagar`}
                      {' · '}{p.frequency === 'quarterly' ? 'kvartal' : p.frequency === 'yearly' ? 'år' : 'månad'}ligen
                    </p>
                  </div>
                  <span className={`text-sm font-bold ${isCritical ? 'text-rose-300' : 'text-white'}`}>
                    {fmt(p.amount)} kr
                  </span>
                </div>
              ))}
            </div>

            {/* Buffer impact summary */}
            <div className="mt-3 p-3 rounded-xl bg-white/5 flex items-center justify-between">
              <span className="text-xs text-slate-400">Buffert efter betalningar</span>
              <span className={`text-sm font-bold ${isCritical ? 'text-rose-400' : isTight ? 'text-amber-400' : 'text-emerald-400'}`}>
                {fmt(buffer - totalUpcoming)} kr
              </span>
            </div>

            {/* AI Analysis */}
            {aiWarning ? (
              <div className="mt-3 p-3 rounded-xl bg-white/5 space-y-1">
                <p className="text-xs text-slate-300 leading-relaxed">{aiWarning.message}</p>
                {aiWarning.action && (
                  <p className="text-xs font-semibold text-indigo-300">→ {aiWarning.action}</p>
                )}
              </div>
            ) : (
              <Button
                onClick={handleAiAnalysis}
                disabled={loading}
                size="sm"
                className="w-full mt-3 h-9 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs"
              >
                {loading ? <><Loader2 className="w-3 h-3 mr-2 animate-spin" />Analyserar…</> : 'Analysera perioden'}
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}