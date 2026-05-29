import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { X, Loader2, ChevronRight, ChevronLeft, Sparkles, BookOpen } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TriggerLibrary from './TriggerLibrary';
import AccountTypeAdvisor from './AccountTypeAdvisor';

const EMOJIS = ['✈️', '🏠', '🚗', '🎓', '💍', '🌴', '🎸', '🏋️', '💻', '🚀', '🌍', '🎯'];
const STRATEGIES = [
  { id: 'fixed', icon: '💳', title: 'Fast överföring', desc: 'Dra ett fast belopp varje månad.' },
  { id: 'dopamine', icon: '⚡', title: 'Dopamin-spararen', desc: 'Spara varje gång du hoppar över ett impulsinköp.' },
  { id: 'leftover', icon: '🌙', title: 'Rest-spararen', desc: 'Flytta det som är kvar dagen innan lön hit.' },
  { id: 'custom', icon: '🛠️', title: 'Eget Schema', desc: 'Bygg din egen spar-regel med AI-triggers.' },
];

const FREQUENCIES = [
  { id: 'daily', label: 'Varje dag', multiplier: 30.4 },
  { id: 'weekly', label: 'Varje vecka', multiplier: 4.33 },
  { id: 'biweekly', label: 'Varannan vecka', multiplier: 2.17 },
  { id: 'monthly', label: 'Månadsvis', multiplier: 1 },
  { id: 'per_purchase', label: 'Per köp', multiplier: null },
];



function PlantVisual({ progress }) {
  // 0-100 progress → plant growth
  const height = 20 + (progress / 100) * 60;
  const leafOpacity = Math.min(1, progress / 30);
  const flowerOpacity = Math.min(1, (progress - 60) / 40);
  return (
    <div className="flex flex-col items-center justify-end" style={{ height: 90 }}>
      {/* Flower */}
      {progress > 60 && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: flowerOpacity }} className="text-2xl mb-1">🌸</motion.div>
      )}
      {/* Leaves */}
      {progress > 20 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: leafOpacity }} className="flex gap-1 mb-0.5">
          <span className="text-green-400 text-sm">🌿</span>
          <span className="text-green-400 text-sm">🌿</span>
        </motion.div>
      )}
      {/* Stem */}
      <motion.div
        animate={{ height }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="w-1.5 bg-gradient-to-t from-green-700 to-green-500 rounded-full"
        style={{ height: 20 }}
      />
      {/* Ground */}
      <div className="w-10 h-2 bg-amber-800/60 rounded-full mt-0.5" />
    </div>
  );
}

export default function DreamBuilder({ isOpen, onClose, profile, onSave }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', emoji: '🎯', amount: '', targetDate: '' });
  const [strategy, setStrategy] = useState('fixed');
  const [aiInsight, setAiInsight] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  // Custom flow state
  const [customFreq, setCustomFreq] = useState('weekly');
  const [customAmount, setCustomAmount] = useState('');
  const [customAmountType, setCustomAmountType] = useState('fixed'); // 'fixed' | 'percent'
  const [customTrigger, setCustomTrigger] = useState(null);
  const [customTriggerText, setCustomTriggerText] = useState('');
  const [customAiMsg, setCustomAiMsg] = useState(null);
  const [loadingCustomAi, setLoadingCustomAi] = useState(false);
  const [showTriggerLib, setShowTriggerLib] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setForm({ name: '', emoji: '🎯', amount: '', targetDate: '' });
      setAiInsight(null);
      setCustomAiMsg(null);
      setCustomAmount('');
      setCustomTrigger(null);
      setCustomTriggerText('');
      setShowTriggerLib(false);
    }
  }, [isOpen]);

  // Monthly equivalent for custom flow
  const customMonthlyEquivalent = () => {
    const amt = customAmountType === 'percent'
      ? ((parseFloat(customAmount) || 0) / 100) * (profile.income || 0)
      : parseFloat(customAmount) || 0;
    const freq = FREQUENCIES.find(f => f.id === customFreq);
    if (!freq || freq.multiplier === null) return amt * 4; // estimate per_purchase as ~4x/month
    return Math.round(amt * freq.multiplier);
  };

  const fetchCustomAi = async () => {
    setLoadingCustomAi(true);
    const monthly = customMonthlyEquivalent();
    const freqLabel = FREQUENCIES.find(f => f.id === customFreq)?.label || customFreq;
    const triggerLabel = customTrigger?.label || customTriggerText || 'ingen trigger vald';
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Du är CFO-Analytikern, en vänlig men ärlig ekonomisk rådgivare.
Användaren vill skapa ett eget spar-schema för sitt mål "${form.name}".

Detaljer:
- Frekvens: ${freqLabel}
- Belopp: ${customAmount} ${customAmountType === 'percent' ? '% av inkomsten' : 'kr'}
- Månadsekvivalent: ~${monthly} kr/mån
- AI-trigger: ${triggerLabel}
- Nuvarande marginal: ${margin} kr/mån

Svara på svenska med 2-3 meningar. Bekräfta om schemat är hållbart, och ge ett smart tips om hur de kan maximera effekten av sin valda trigger. Var entusiastisk men realistisk.`,
      response_json_schema: {
        type: 'object',
        properties: { message: { type: 'string' }, isHealthy: { type: 'boolean' } }
      }
    });
    setCustomAiMsg(res);
    setLoadingCustomAi(false);
  };

  const monthsUntil = () => {
    if (!form.targetDate) return 0;
    const now = new Date();
    const target = new Date(form.targetDate);
    return Math.max(1, (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth()));
  };

  const monthlyNeeded = () => {
    const months = monthsUntil();
    if (!months || !form.amount) return 0;
    return Math.ceil(parseInt(form.amount) / months);
  };

  const totalFixedCosts = (profile.housingCost || 0) +
    (profile.subscriptions || []).reduce((s, x) => s + x.amount, 0) +
    (profile.loans || []).reduce((s, x) => s + x.monthlyPayment, 0);
  const margin = (profile.income || 0) - totalFixedCosts;

  const fetchAiInsight = async () => {
    setLoadingAi(true);
    const needed = monthlyNeeded();
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Du är CFO-Analytikern. Användaren vill spara till "${form.name}" (${form.emoji}).
Målsumma: ${form.amount} kr
Månader kvar: ${monthsUntil()}
Behövs per månad: ${needed} kr
Nuvarande marginal: ${margin} kr/mån

${needed > margin ? 'VARNING: Sparbeloppet överstiger marginalen.' : 'Marginalen räcker.'}

Ge ett kort svar på svenska (2-3 meningar): bekräfta om det är realistiskt, och erbjud ett konkret alternativ om det är tajt (t.ex. förlängd tid eller budget-tips). Avsluta alltid med uppmuntran.`,
      response_json_schema: {
        type: 'object',
        properties: { message: { type: 'string' }, isTight: { type: 'boolean' }, suggestedMonths: { type: 'number' } }
      }
    });
    setAiInsight(res);
    setLoadingAi(false);
  };

  const handleNext = async () => {
    if (step === 1) setStep(2);
    else if (step === 2) { await fetchAiInsight(); setStep(3); }
    else if (step === 3) setStep(4);
    else handleFinish();
  };

  const handleFinish = () => {
    const customConfig = strategy === 'custom' ? {
      customFrequency: customFreq,
      customAmount: parseFloat(customAmount) || 0,
      customAmountType,
      customTrigger: customTrigger?.id || customTriggerText || null,
      customMonthlyEquiv: customMonthlyEquivalent(),
    } : null;
    onSave({
      savingsGoalName: `${form.emoji} ${form.name}`,
      savingsGoal: parseInt(form.amount) || 0,
      savingsTargetDate: form.targetDate,
      savingsStrategy: strategy,
      ...(customConfig && { savingsCustomConfig: customConfig }),
    });
    onClose();
  };

  const canNext1 = form.name && form.amount && parseInt(form.amount) > 0;
  const canNext2 = form.targetDate;

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        onClick={e => e.stopPropagation()}
        className="w-full rounded-t-3xl p-6 pb-10 max-h-[92vh] overflow-y-auto"
        style={{ background: 'rgba(12, 18, 38, 0.98)', borderTop: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[13px] font-medium text-white/45">Nytt sparmål</p>
            <h2 className="text-[20px] font-semibold text-white mt-0.5">
              {step === 1 ? 'Vad sparar du till?' : step === 2 ? 'När vill du vara klar?' : step === 3 ? 'Hur vill du spara?' : 'Klart!'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-white/50 hover:text-white" aria-label="Stäng">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1.5 mb-6">
          {[1,2,3,4].map(s => (
            <div key={s} className={`h-1 rounded-full flex-1 transition-all ${s <= step ? 'bg-purple-500' : 'bg-white/10'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1 */}
          {step === 1 && (
            <motion.div key="s1" initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }} className="space-y-5">
              <div>
                <label className="text-xs text-slate-400 mb-2 block">Vad drömmer du om?</label>
                <Input placeholder="T.ex. Resa till Madrid" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="h-12 rounded-xl text-lg font-medium" />
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-2 block">Välj en ikon</label>
                <div className="grid grid-cols-6 gap-2">
                  {EMOJIS.map(em => (
                    <button key={em} onClick={() => setForm({ ...form, emoji: em })}
                      className={`h-11 rounded-xl text-2xl transition-all ${form.emoji === em ? 'bg-purple-500/30 ring-2 ring-purple-500 scale-110' : 'bg-white/5 hover:bg-white/10'}`}>
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-2 block">Hur mycket behöver du?</label>
                <div className="relative">
                  <Input type="number" placeholder="20 000" value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    className="h-12 rounded-xl pr-12 text-lg font-bold" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">kr</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div key="s2" initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }} className="space-y-5">
              <div className="text-center py-2">
                <span className="text-5xl">{form.emoji}</span>
                <p className="text-white font-bold mt-2">{form.name}</p>
                <p className="text-slate-400 text-sm">{parseInt(form.amount || 0).toLocaleString('sv-SE')} kr</p>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-2 block">När vill du vara klar?</label>
                <Input type="date" value={form.targetDate}
                  onChange={e => setForm({ ...form, targetDate: e.target.value })}
                  className="h-12 rounded-xl" min={new Date().toISOString().split('T')[0]} />
              </div>

              {form.targetDate && form.amount && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">Tid kvar</span>
                    <span className="text-sm font-bold text-white">{monthsUntil()} månader</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Krävs per månad</span>
                    <span className={`text-lg font-bold ${monthlyNeeded() > margin ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {monthlyNeeded().toLocaleString('sv-SE')} kr
                    </span>
                  </div>
                  {monthlyNeeded() > margin && (
                    <p className="text-xs text-rose-300 mt-2">⚠ Överstiger din nuvarande marginal ({margin.toLocaleString('sv-SE')} kr). AI:n ger råd i nästa steg.</p>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 3 – AI Reality Check */}
          {step === 3 && (
            <motion.div key="s3" initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }} className="space-y-5">
              {loadingAi ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                  <p className="text-slate-400 text-sm">CFO-Analytikern räknar på din plan…</p>
                </div>
              ) : aiInsight && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-2xl" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-600/30 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-purple-300" />
                    </div>
                    <div>
                      <p className="text-xs text-purple-300 font-semibold mb-1">CFO-Analytikern</p>
                      <p className="text-sm text-slate-200 leading-relaxed">{aiInsight.message}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              <div>
                <label className="text-xs text-slate-400 mb-3 block">Välj din spar-stil</label>
                <div className="space-y-2">
                  {STRATEGIES.map(s => (
                    <button key={s.id} onClick={() => { setStrategy(s.id); setCustomAiMsg(null); }}
                      className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-3 ${strategy === s.id ? 'ring-2 ring-purple-500' : ''}`}
                      style={{ background: strategy === s.id ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)' }}>
                      <span className="text-2xl">{s.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-white">{s.title}</p>
                        <p className="text-xs text-slate-400">{s.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Flow Builder */}
              {strategy === 'custom' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-2 p-4 rounded-2xl space-y-4" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <p className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">🛠️ Bygg ditt schema</p>

                  {/* Frequency */}
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Frekvens</p>
                    <div className="flex flex-wrap gap-2">
                      {FREQUENCIES.map(f => (
                        <button key={f.id} onClick={() => setCustomFreq(f.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${customFreq === f.id ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amount type + value */}
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Belopp per tillfälle</p>
                    <div className="flex gap-2 mb-2">
                      {[{id:'fixed',label:'Fast kr'},{id:'percent',label:'% av lön'}].map(t => (
                        <button key={t.id} onClick={() => setCustomAmountType(t.id)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${customAmountType === t.id ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-300'}`}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <Input type="number" placeholder={customAmountType === 'percent' ? '5' : '100'}
                        value={customAmount} onChange={e => { setCustomAmount(e.target.value); setCustomAiMsg(null); }}
                        className="h-10 rounded-xl pr-10 text-sm" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                        {customAmountType === 'percent' ? '%' : 'kr'}
                      </span>
                    </div>
                  </div>

                  {/* Real-time simulation */}
                  {customAmount && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <p className="text-xs text-slate-400">CFO-simulering</p>
                      <p className="text-sm font-bold text-emerald-400 mt-0.5">
                        ≈ {customMonthlyEquivalent().toLocaleString('sv-SE')} kr / månad
                      </p>
                      <p className={`text-xs mt-1 ${customMonthlyEquivalent() > margin ? 'text-rose-400' : 'text-emerald-300'}`}>
                        {customMonthlyEquivalent() > margin
                          ? `⚠ Överstiger din marginal (${margin.toLocaleString('sv-SE')} kr)`
                          : `✓ Ryms inom din marginal (${margin.toLocaleString('sv-SE')} kr)`}
                      </p>
                    </motion.div>
                  )}

                  {/* AI Trigger */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-slate-400">AI-trigger (valfri)</p>
                      <button onClick={() => setShowTriggerLib(!showTriggerLib)}
                        className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300">
                        <BookOpen className="w-3 h-3" />
                        {showTriggerLib ? 'Stäng' : 'Öppna bibliotek'}
                      </button>
                    </div>

                    {customTrigger && !showTriggerLib && (
                      <div className="p-3 rounded-xl text-xs flex items-center justify-between"
                        style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}>
                        <span className="text-white font-medium">{customTrigger.label}</span>
                        <button onClick={() => setCustomTrigger(null)} className="text-slate-500 hover:text-white"><X className="w-3 h-3" /></button>
                      </div>
                    )}

                    <AnimatePresence>
                      {showTriggerLib && (
                        <TriggerLibrary
                          activeTrigger={customTrigger?.id}
                          onSelect={(t) => { setCustomTrigger(t); setShowTriggerLib(false); setCustomAiMsg(null); }}
                          onClose={() => setShowTriggerLib(false)}
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Get AI feedback */}
                  {customAmount && (
                    <button onClick={fetchCustomAi} disabled={loadingCustomAi}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center gap-2">
                      {loadingCustomAi ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyserar…</> : <><Sparkles className="w-4 h-4" /> Få CFO-feedback</>}
                    </button>
                  )}

                  {customAiMsg && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}>
                      <p className="text-xs text-purple-300 font-semibold mb-1">🤖 CFO-Analytikern</p>
                      <p className="text-xs text-slate-200 leading-relaxed">{customAiMsg.message}</p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 4 – Confirmation + Plant */}
          {step === 4 && (
            <motion.div key="s4" initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }} className="space-y-5 text-center">
              <div className="flex justify-center">
                <PlantVisual progress={5} />
              </div>
              <div>
                <p className="text-5xl mb-3">{form.emoji}</p>
                <h3 className="text-2xl font-bold text-white">{form.name}</h3>
                <p className="text-slate-400 text-sm mt-1">Din resa börjar nu 🌱</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <p className="text-xs text-slate-400">Mål</p>
                  <p className="text-lg font-bold text-white">{parseInt(form.amount || 0).toLocaleString('sv-SE')} kr</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <p className="text-xs text-slate-400">Per månad</p>
                  <p className="text-lg font-bold text-emerald-400">{monthlyNeeded().toLocaleString('sv-SE')} kr</p>
                </div>
              </div>

              {/* Account Type Advisor */}
              <div className="text-left">
                <p className="text-xs text-slate-500 mb-2 uppercase tracking-widest font-semibold">CFO-råd: Var ska pengarna ligga?</p>
                <AccountTypeAdvisor
                  months={monthsUntil()}
                  isBuffer={false}
                  goalName={form.name}
                  goalAmount={parseInt(form.amount || 0)}
                />
              </div>

              <p className="text-xs text-slate-500 px-4">
                Varje gång du sparar växer din planta. Håll den vid liv! 🌿
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-7">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-none w-12 h-12 rounded-xl p-0">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={(step === 1 && !canNext1) || (step === 2 && !canNext2) || loadingAi}
            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 font-bold text-white text-base"
          >
            {step === 4 ? '🚀 Starta min dröm!' : <>Nästa <ChevronRight className="w-4 h-4 ml-1" /></>}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}