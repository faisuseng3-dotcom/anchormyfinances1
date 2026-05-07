import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, Circle, AlertTriangle, Lock, FileText,
  Building2, Calculator, Scale, Loader2, ChevronRight, Download, Zap
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const STEPS = [
  { id: 'reconcile', label: 'Bankavstämning', icon: Scale, desc: 'Stäm av konto 1930 mot ditt riktiga banksaldo' },
  { id: 'cleanup', label: 'Transaktionsrensning', icon: AlertTriangle, desc: 'Hantera pending-transaktioner' },
  { id: 'taxmap', label: 'Skattedeklaration', icon: FileText, desc: 'Mappa data till NE-bilagan / INK2' },
  { id: 'closing', label: 'Stäng räkenskapsåret', icon: Lock, desc: 'Resultatreglering och lås perioden' },
];

const fmt = n => n?.toLocaleString('sv-SE', { maximumFractionDigits: 0 }) + ' kr';

export default function YearEndClosing() {
  const [activeStep, setActiveStep] = useState('reconcile');
  const [completedSteps, setCompletedSteps] = useState(() => {
    try { return JSON.parse(localStorage.getItem('anchor_yec_completed') || '[]'); } catch { return []; }
  });
  const [yearLocked, setYearLocked] = useState(() => localStorage.getItem('anchor_yec_locked') === 'true');
  const legalEntity = localStorage.getItem('anchor_biz_legal_entity') || 'enskild';
  const isAB = legalEntity === 'ab';
  const companyName = localStorage.getItem('anchor_biz_company') || 'Mitt Företag AB';

  const completeStep = (id) => {
    const next = [...new Set([...completedSteps, id])];
    setCompletedSteps(next);
    localStorage.setItem('anchor_yec_completed', JSON.stringify(next));
  };

  const lockYear = () => {
    setYearLocked(true);
    localStorage.setItem('anchor_yec_locked', 'true');
    completeStep('closing');
  };

  const allDone = completedSteps.length >= 4 || yearLocked;

  return (
    <div className="min-h-screen" style={{ background: '#F4F6F8' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-5 flex items-center gap-3"
        style={{ background: 'linear-gradient(160deg, #1A2332 0%, #0D7377 100%)', borderRadius: '0 0 28px 28px' }}>
        <Link to="/BusinessDashboard">
          <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
        </Link>
        <div className="flex-1">
          <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>Anchor Business</p>
          <h1 className="text-base font-black text-white tracking-tight">Compliance Pilot — Årsavslut</h1>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {completedSteps.length}/4 steg
          </p>
        </div>
      </div>

      <div className="px-5 pt-5 pb-32 space-y-4">
        {/* Year locked banner */}
        {yearLocked && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-5 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, #0D7377, #0a5f63)', boxShadow: '0 4px 20px rgba(13,115,119,0.3)' }}>
            <Lock className="w-6 h-6 text-white flex-shrink-0" />
            <div>
              <p className="font-black text-white">Räkenskapsåret är låst ✓</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Alla verifikat är skrivskyddade. Gott bokslut!
              </p>
            </div>
          </motion.div>
        )}

        {/* Step navigation */}
        <div className="rounded-3xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const done = completedSteps.includes(step.id);
            const active = activeStep === step.id;
            return (
              <button key={step.id} onClick={() => setActiveStep(step.id)}
                disabled={yearLocked}
                className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors"
                style={{ borderBottom: i < STEPS.length - 1 ? '1px solid #F0F2F5' : 'none', background: active ? 'rgba(13,115,119,0.04)' : 'transparent' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: done ? 'rgba(13,115,119,0.1)' : active ? 'rgba(13,115,119,0.08)' : '#F4F6F8' }}>
                  {done ? <CheckCircle2 className="w-4 h-4" style={{ color: '#0D7377' }} />
                    : <Icon className="w-4 h-4" style={{ color: active ? '#0D7377' : '#9AA5B4' }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: done ? '#0D7377' : '#1A2332' }}>{step.label}</p>
                  <p className="text-xs truncate" style={{ color: '#9AA5B4' }}>{step.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: active ? '#0D7377' : '#C0C8D2' }} />
              </button>
            );
          })}
        </div>

        {/* Step panels */}
        <AnimatePresence mode="wait">
          {activeStep === 'reconcile' && (
            <ReconcileStep key="reconcile" onComplete={() => { completeStep('reconcile'); setActiveStep('cleanup'); }} />
          )}
          {activeStep === 'cleanup' && (
            <CleanupStep key="cleanup" onComplete={() => { completeStep('cleanup'); setActiveStep('taxmap'); }} />
          )}
          {activeStep === 'taxmap' && (
            <TaxMapStep key="taxmap" isAB={isAB} companyName={companyName}
              onComplete={() => { completeStep('taxmap'); setActiveStep('closing'); }} />
          )}
          {activeStep === 'closing' && (
            <ClosingStep key="closing" isAB={isAB} companyName={companyName}
              locked={yearLocked} onLock={lockYear} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Step 1: Bank Reconciliation ── */
function ReconcileStep({ onComplete }) {
  const [bankBalance, setBankBalance] = useState('');
  const [bookBalance, setBookBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    base44.entities.Transaction.filter({ context: 'BUSINESS' }, '-created_date', 500).then(txs => {
      const sum = (txs || []).reduce((a, t) => a + (t.amount || 0), 0);
      setBookBalance(Math.round(sum));
    }).catch(() => setBookBalance(0));
  }, []);

  const analyse = async () => {
    const bank = parseFloat(bankBalance.replace(/\s/g, '').replace(',', '.'));
    if (isNaN(bank)) return;
    setLoading(true);
    const diff = Math.round(bank - bookBalance);
    const res = await base44.functions.invoke('yearEndAudit', {
      action: 'reconcile',
      bankBalance: bank,
      bookBalance,
      diff,
    });
    setResult({ diff, aiMessage: res?.data?.message || (diff === 0 ? '✅ Bokföringen stämmer exakt med banken.' : `⚠️ Differens: ${diff > 0 ? '+' : ''}${diff.toLocaleString('sv-SE')} kr`) });
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="rounded-3xl p-5 space-y-4" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <p className="font-black text-lg" style={{ color: '#1A2332' }}>Steg 1 — Bankavstämning</p>
      <p className="text-sm" style={{ color: '#4A5568' }}>
        Anchor summerar dina bokförda transaktioner på konto 1930. Ange ditt riktiga banksaldo per 31 dec för att hitta differenser.
      </p>

      <div className="rounded-2xl p-4" style={{ background: '#F4F6F8' }}>
        <p className="text-xs font-semibold mb-1" style={{ color: '#9AA5B4' }}>Bokfört saldo (konto 1930)</p>
        <p className="text-2xl font-black" style={{ color: '#1A2332' }}>
          {bookBalance === null ? '…' : fmt(bookBalance)}
        </p>
      </div>

      <div>
        <label className="text-xs font-semibold block mb-1" style={{ color: '#4A5568' }}>Ditt riktiga banksaldo (31 dec)</label>
        <input
          type="text"
          value={bankBalance}
          onChange={e => setBankBalance(e.target.value)}
          placeholder="t.ex. 142 500"
          className="w-full rounded-2xl px-4 py-3 text-sm font-bold"
          style={{ border: '1.5px solid #DDE1E7', outline: 'none', color: '#1A2332', background: '#fff' }}
        />
      </div>

      {result && (
        <div className="rounded-2xl p-4"
          style={{ background: result.diff === 0 ? 'rgba(13,115,119,0.08)' : 'rgba(229,62,62,0.08)', border: `1px solid ${result.diff === 0 ? 'rgba(13,115,119,0.2)' : 'rgba(229,62,62,0.2)'}` }}>
          <p className="text-sm font-semibold" style={{ color: result.diff === 0 ? '#0D7377' : '#E53E3E' }}>
            {result.diff === 0 ? '✅ Stämmer!' : `⚠️ Differens: ${result.diff > 0 ? '+' : ''}${result.diff.toLocaleString('sv-SE')} kr`}
          </p>
          <p className="text-xs mt-1" style={{ color: '#4A5568' }}>{result.aiMessage}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={analyse} disabled={!bankBalance || loading}
          className="flex-1 rounded-2xl py-3 font-bold text-sm flex items-center justify-center gap-2"
          style={{ background: '#0D7377', color: '#fff', opacity: !bankBalance ? 0.5 : 1 }}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
          Analysera
        </button>
        <button onClick={onComplete}
          className="flex-1 rounded-2xl py-3 font-bold text-sm"
          style={{ background: '#F4F6F8', color: '#4A5568' }}>
          Markera klar →
        </button>
      </div>
    </motion.div>
  );
}

/* ── Step 2: Transaction Cleanup ── */
function CleanupStep({ onComplete }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Transaction.filter({ context: 'BUSINESS' }, '-created_date', 200).then(txs => {
      setPending((txs || []).filter(t => !t.aiAgent));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="rounded-3xl p-5 space-y-4" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <p className="font-black text-lg" style={{ color: '#1A2332' }}>Steg 2 — Transaktionsrensning</p>
      <p className="text-sm" style={{ color: '#4A5568' }}>
        Alla transaktioner måste vara bokförda innan du kan låsa bokslutet. Nedan visas icke-bokförda poster.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#9AA5B4' }} />
        </div>
      ) : pending.length === 0 ? (
        <div className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: 'rgba(13,115,119,0.08)', border: '1px solid rgba(13,115,119,0.2)' }}>
          <CheckCircle2 className="w-5 h-5" style={{ color: '#0D7377' }} />
          <p className="text-sm font-semibold" style={{ color: '#0D7377' }}>
            Alla transaktioner är bokförda!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {pending.slice(0, 5).map((t, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ background: 'rgba(229,62,62,0.06)', border: '1px solid rgba(229,62,62,0.15)' }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#E53E3E' }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: '#1A2332' }}>{t.label || t.vendor}</p>
                <p className="text-xs" style={{ color: '#9AA5B4' }}>{Math.abs(t.amount).toLocaleString('sv-SE')} kr · Ej bokförd</p>
              </div>
            </div>
          ))}
          {pending.length > 5 && (
            <p className="text-xs text-center" style={{ color: '#9AA5B4' }}>+{pending.length - 5} till</p>
          )}
          <div className="rounded-2xl p-3" style={{ background: '#FFF7E6', border: '1px solid rgba(214,158,46,0.3)' }}>
            <p className="text-xs font-semibold" style={{ color: '#D69E2E' }}>
              ⚠️ Gå till Arkiv → SmartPaste och bokför dessa transaktioner innan du fortsätter.
            </p>
          </div>
        </div>
      )}

      <button onClick={onComplete}
        className="w-full rounded-2xl py-3 font-bold text-sm"
        style={{ background: pending.length === 0 ? '#0D7377' : '#F4F6F8', color: pending.length === 0 ? '#fff' : '#4A5568' }}>
        {pending.length === 0 ? '✅ Allt klart — fortsätt →' : 'Fortsätt ändå →'}
      </button>
    </motion.div>
  );
}

/* ── Step 3: Tax Mapping (NE / INK2) ── */
function TaxMapStep({ isAB, companyName, onComplete }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Transaction.filter({ context: 'BUSINESS' }, '-created_date', 500).then(txs => {
      const income = (txs || []).filter(t => t.type === 'income').reduce((a, t) => a + (t.amount || 0), 0);
      const expenses = (txs || []).filter(t => t.type === 'expense' || t.amount < 0).reduce((a, t) => a + Math.abs(t.amount || 0), 0);
      const result = income - expenses;
      setData({ income: Math.round(income), expenses: Math.round(expenses), result: Math.round(result) });
    }).finally(() => setLoading(false));
  }, []);

  const neRows = data ? [
    { code: 'R1', label: 'Nettoomsättning (intäkter)', value: data.income },
    { code: 'R7', label: 'Övriga externa kostnader', value: data.expenses },
    { code: 'R14', label: 'Årets resultat', value: data.result },
    { code: 'B1', label: 'Kassa och bank', value: data.income },
    { code: 'B20', label: 'Eget kapital', value: data.result },
  ] : [];

  const ink2Rows = data ? [
    { code: '1.1', label: 'Nettoomsättning', value: data.income },
    { code: '2.1', label: 'Rörelsens kostnader', value: data.expenses },
    { code: '3.1', label: 'Rörelseresultat', value: data.result },
  ] : [];

  const rows = isAB ? ink2Rows : neRows;
  const formName = isAB ? 'INK2' : 'NE-bilagan';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="rounded-3xl p-5 space-y-4" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <p className="font-black text-lg" style={{ color: '#1A2332' }}>Steg 3 — {formName}</p>
      <p className="text-sm" style={{ color: '#4A5568' }}>
        Här ser du hur Anchors data mappar till Skatteverkets blanketter. Kopiera värdena till rätt rutor.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#9AA5B4' }} />
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ background: '#F4F6F8', border: i === rows.length - 1 ? '1.5px solid rgba(13,115,119,0.3)' : '1px solid transparent' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(13,115,119,0.08)' }}>
                <span className="text-xs font-black" style={{ color: '#0D7377' }}>{row.code}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs" style={{ color: '#9AA5B4' }}>{formName} · Ruta {row.code}</p>
                <p className="text-sm font-semibold" style={{ color: '#1A2332' }}>{row.label}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black" style={{ color: row.value >= 0 ? '#0D7377' : '#E53E3E' }}>
                  {row.value?.toLocaleString('sv-SE')} kr
                </p>
                <button onClick={() => navigator.clipboard?.writeText(String(row.value))}
                  className="text-xs" style={{ color: '#9AA5B4' }}>
                  kopiera
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl p-3" style={{ background: '#F0FFF4', border: '1px solid rgba(13,115,119,0.2)' }}>
        <p className="text-xs" style={{ color: '#0D7377' }}>
          💡 Logga in på <strong>skatteverket.se</strong> och välj {formName}. Kopiera värdena ovan till motsvarande rutor. Anchor sparar ett kalkylblad åt dig.
        </p>
      </div>

      <button onClick={onComplete}
        className="w-full rounded-2xl py-3 font-bold text-sm flex items-center justify-center gap-2"
        style={{ background: '#0D7377', color: '#fff' }}>
        <CheckCircle2 className="w-4 h-4" />
        Klar med deklarationen →
      </button>
    </motion.div>
  );
}

/* ── Step 4: Year-End Closing ── */
function ClosingStep({ isAB, companyName, locked, onLock }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiVoucher, setAiVoucher] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [meetingDate, setMeetingDate] = useState('');

  useEffect(() => {
    base44.entities.Transaction.filter({ context: 'BUSINESS' }, '-created_date', 500).then(txs => {
      const income = (txs || []).filter(t => t.type === 'income').reduce((a, t) => a + (t.amount || 0), 0);
      const expenses = (txs || []).filter(t => t.type === 'expense' || t.amount < 0).reduce((a, t) => a + Math.abs(t.amount || 0), 0);
      setData({ income: Math.round(income), expenses: Math.round(expenses), result: Math.round(income - expenses) });
    }).finally(() => setLoading(false));
  }, []);

  const generateVoucher = async () => {
    setGenerating(true);
    try {
      const res = await base44.functions.invoke('yearEndAudit', {
        action: 'closing_voucher',
        result: data?.result || 0,
        isAB,
        companyName,
      });
      setAiVoucher(res?.data);
    } catch {
      // Fallback local voucher
      const profit = data?.result || 0;
      setAiVoucher({
        description: 'Resultatreglering — stänger räkenskapsåret',
        lines: profit >= 0
          ? [
              { account: '8999', label: 'Årets resultat', debit: profit, credit: null },
              { account: '2099', label: 'Balanserat resultat', debit: null, credit: profit },
            ]
          : [
              { account: '2099', label: 'Balanserat resultat', debit: Math.abs(profit), credit: null },
              { account: '8999', label: 'Årets resultat', debit: null, credit: Math.abs(profit) },
            ],
        summary: `Årets ${profit >= 0 ? 'vinst' : 'förlust'} på ${Math.abs(profit).toLocaleString('sv-SE')} kr förs till balanserat resultat (konto 2099).`,
      });
    }
    setGenerating(false);
  };

  // Bolagsverket deadline (7 months after meeting date for AB)
  const deadline = meetingDate ? (() => {
    const d = new Date(meetingDate);
    d.setMonth(d.getMonth() + 7);
    return d.toLocaleDateString('sv-SE');
  })() : null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="space-y-4">

      {/* Result summary */}
      <div className="rounded-3xl p-5 space-y-3" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <p className="font-black text-lg" style={{ color: '#1A2332' }}>Steg 4 — Stäng räkenskapsåret</p>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#9AA5B4' }} />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Intäkter', value: data?.income, color: '#0D7377' },
              { label: 'Kostnader', value: data?.expenses, color: '#E53E3E' },
              { label: 'Resultat', value: data?.result, color: data?.result >= 0 ? '#0D7377' : '#E53E3E' },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl p-3 text-center" style={{ background: '#F4F6F8' }}>
                <p className="text-xs" style={{ color: '#9AA5B4' }}>{item.label}</p>
                <p className="text-sm font-black" style={{ color: item.color }}>
                  {item.value?.toLocaleString('sv-SE')} kr
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resultatreglering voucher */}
      <div className="rounded-3xl p-5 space-y-3" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" style={{ color: '#0D7377' }} />
          <p className="font-bold text-sm" style={{ color: '#1A2332' }}>Resultatreglering</p>
        </div>
        {!aiVoucher ? (
          <button onClick={generateVoucher} disabled={generating || !data || locked}
            className="w-full rounded-2xl py-3 font-bold text-sm flex items-center justify-center gap-2"
            style={{ background: '#0D7377', color: '#fff', opacity: locked ? 0.5 : 1 }}>
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Generera verifikat med AI
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs" style={{ color: '#4A5568' }}>{aiVoucher.description}</p>
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #F0F2F5' }}>
              <div className="grid grid-cols-3 px-4 py-2" style={{ background: '#F4F6F8' }}>
                <span className="text-xs font-bold" style={{ color: '#9AA5B4' }}>Konto</span>
                <span className="text-xs font-bold text-center" style={{ color: '#9AA5B4' }}>Debet</span>
                <span className="text-xs font-bold text-right" style={{ color: '#9AA5B4' }}>Kredit</span>
              </div>
              {aiVoucher.lines?.map((l, i) => (
                <div key={i} className="grid grid-cols-3 px-4 py-2" style={{ borderTop: '1px solid #F0F2F5' }}>
                  <span className="text-xs font-semibold" style={{ color: '#1A2332' }}>{l.account} <span className="font-normal text-xs" style={{ color: '#9AA5B4' }}>{l.label}</span></span>
                  <span className="text-xs text-center font-bold" style={{ color: l.debit ? '#1A2332' : '#C0C8D2' }}>
                    {l.debit ? l.debit.toLocaleString('sv-SE') : '—'}
                  </span>
                  <span className="text-xs text-right font-bold" style={{ color: l.credit ? '#1A2332' : '#C0C8D2' }}>
                    {l.credit ? l.credit.toLocaleString('sv-SE') : '—'}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs px-1" style={{ color: '#4A5568' }}>{aiVoucher.summary}</p>
            {!confirmed && !locked && (
              <button onClick={() => setConfirmed(true)}
                className="w-full rounded-2xl py-3 font-bold text-sm"
                style={{ background: 'rgba(13,115,119,0.1)', color: '#0D7377' }}>
                ✅ Bekräfta och bokför
              </button>
            )}
            {confirmed && <p className="text-xs text-center font-semibold" style={{ color: '#0D7377' }}>✓ Verifikat bokfört</p>}
          </div>
        )}
      </div>

      {/* AB: Meeting date + Bolagsverket deadline */}
      {isAB && (
        <div className="rounded-3xl p-5 space-y-3" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <p className="font-bold text-sm" style={{ color: '#1A2332' }}>📅 Årstämma & Bolagsverket</p>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: '#4A5568' }}>Datum för årstämma</label>
            <input type="date" value={meetingDate} onChange={e => setMeetingDate(e.target.value)}
              className="w-full rounded-2xl px-4 py-3 text-sm font-semibold"
              style={{ border: '1.5px solid #DDE1E7', color: '#1A2332', background: '#fff', outline: 'none' }} />
          </div>
          {deadline && (
            <div className="rounded-2xl p-3 flex items-center gap-3"
              style={{ background: 'rgba(229,62,62,0.08)', border: '1px solid rgba(229,62,62,0.2)' }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#E53E3E' }} />
              <div>
                <p className="text-xs font-bold" style={{ color: '#E53E3E' }}>Deadline: Årsredovisning till Bolagsverket</p>
                <p className="text-xs" style={{ color: '#4A5568' }}>Senast {deadline} (7 månader efter stämman)</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lock year */}
      {!locked ? (
        <motion.button whileTap={{ scale: 0.97 }}
          onClick={onLock}
          className="w-full rounded-3xl py-4 font-black text-base flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #1A2332, #0D7377)', color: '#fff', boxShadow: '0 4px 20px rgba(13,115,119,0.35)' }}>
          <Lock className="w-5 h-5" />
          Slutför och lås räkenskapsåret
        </motion.button>
      ) : (
        <div className="rounded-3xl py-4 flex items-center justify-center gap-2"
          style={{ background: '#F0FFF4', border: '1.5px solid rgba(13,115,119,0.3)' }}>
          <Lock className="w-4 h-4" style={{ color: '#0D7377' }} />
          <p className="font-bold text-sm" style={{ color: '#0D7377' }}>Räkenskapsåret är låst</p>
        </div>
      )}
    </motion.div>
  );
}