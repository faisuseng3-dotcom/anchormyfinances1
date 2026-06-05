import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { X, CheckCircle2, Loader2, PiggyBank, Wallet, ArrowDownCircle, CheckSquare, Square } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AccountTypeAdvisor from './AccountTypeAdvisor';

// Coin rain animation
function CoinRain({ active }) {
  if (!active) return null;
  const coins = Array.from({ length: 12 }, (_, i) => i);
  return (
    <div className="fixed inset-0 pointer-events-none z-[70] overflow-hidden">
      {coins.map(i => (
        <motion.div
          key={i}
          initial={{ y: -60, x: `${10 + (i * 7.5)}vw`, opacity: 1, scale: 1 }}
          animate={{ y: '110vh', opacity: 0, scale: 0.6 }}
          transition={{ duration: 1.4 + Math.random() * 0.8, delay: i * 0.06, ease: 'easeIn' }}
          className="absolute text-2xl"
        >
          🪙
        </motion.div>
      ))}
    </div>
  );
}

export default function DepositHub({ isOpen, onClose, profile, type = 'savings' }) {
  const [step, setStep] = useState('input'); // 'input' | 'confirm' | 'success'
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [note, setNote] = useState('');
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCoins, setShowCoins] = useState(false);
  const [depositId, setDepositId] = useState(null);
  const queryClient = useQueryClient();

  const goalName = profile?.savingsGoalName || 'Sparmål';

  // Streak: count consecutive days with deposits from localStorage
  const streak = (() => {
    try {
      const raw = localStorage.getItem('anchor_deposit_dates');
      const dates = raw ? JSON.parse(raw) : [];
      const today = new Date().toISOString().split('T')[0];
      if (!dates.includes(today)) {
        dates.push(today);
        localStorage.setItem('anchor_deposit_dates', JSON.stringify(dates.slice(-30)));
      }
      let count = 0;
      let check = new Date();
      for (let i = 0; i < 30; i++) {
        const d = check.toISOString().split('T')[0];
        if (dates.includes(d)) { count++; check.setDate(check.getDate() - 1); }
        else break;
      }
      return count;
    } catch { return 0; }
  });
  const margin = (() => {
    const fixed = (profile?.housingCost || 0) +
      (profile?.subscriptions || []).reduce((s, x) => s + x.amount, 0) +
      (profile?.loans || []).reduce((s, x) => s + x.monthlyPayment, 0);
    return (profile?.income || 0) - fixed;
  })();

  const suggestedSources = [
    { label: `Från marginal (${Math.round(margin).toLocaleString('sv-SE')} kr)`, value: 'Månadsmarginalen' },
    { label: 'Övrigt inkomst', value: 'Extra inkomst' },
    { label: 'Sparade pengar', value: 'Befintliga sparpengar' },
  ];

  useEffect(() => {
    if (!isOpen) {
      setStep('input');
      setAmount('');
      setSource('');
      setNote('');
      setVerified(false);
      setDepositId(null);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    setLoading(true);
    const dep = await base44.entities.SavingsDeposit.create({
      goalName: type === 'buffer' ? 'Buffert' : goalName,
      amount: parseFloat(amount),
      source: source || 'Manuell insättning',
      note,
      verified: false,
      type,
    });
    setDepositId(dep.id);
    setLoading(false);
    setShowCoins(true);
    setTimeout(() => setShowCoins(false), 2200);
    setStep('success');
    // Update profile balance
    const currentBalance = type === 'buffer'
      ? (profile.buffer || 0) + parseFloat(amount)
      : (profile.savingsCurrentBalance || 0) + parseFloat(amount);
    const updateData = type === 'buffer'
      ? { buffer: currentBalance }
      : { savingsCurrentBalance: currentBalance };
    await base44.entities.FinancialProfile.update(profile.id, updateData);
    queryClient.invalidateQueries({ queryKey: ['financialProfile'] });
    queryClient.invalidateQueries({ queryKey: ['deposits'] });
  };

  const handleVerify = async () => {
    if (!depositId) return;
    await base44.entities.SavingsDeposit.update(depositId, { verified: true });
    setVerified(true);
    queryClient.invalidateQueries({ queryKey: ['deposits'] });
  };

  if (!isOpen) return null;

  return (
    <>
      <CoinRain active={showCoins} />
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          onClick={e => e.stopPropagation()}
          className="w-full rounded-t-3xl p-6 pb-10"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #064e3b 100%)', border: '1px solid rgba(16,185,129,0.3)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-emerald-400 font-semibold tracking-widest uppercase">Insättning</p>
                <h2 className="text-lg font-bold text-white">
                  {type === 'buffer' ? 'Sätt in i bufferten' : `Spara till ${goalName}`}
                </h2>
              </div>
            </div>
            <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
          </div>

          <AnimatePresence mode="wait">
            {/* INPUT STEP */}
            {step === 'input' && (
              <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-5">
                <div>
                  <label className="text-xs text-slate-400 mb-2 block">Belopp att sätta in</label>
                  <div className="relative">
                    <Input type="number" placeholder="500" value={amount} onChange={e => setAmount(e.target.value)}
                      className="h-14 rounded-xl pr-10 text-2xl font-bold" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">kr</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-2 block">Källa – var kommer pengarna ifrån?</label>
                  <div className="space-y-2 mb-2">
                    {suggestedSources.map(s => (
                      <button key={s.value} onClick={() => setSource(s.value)}
                        className={`w-full p-3 rounded-xl text-left text-sm transition-all flex items-center gap-2 ${source === s.value ? 'ring-1 ring-emerald-500 bg-emerald-600/20 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/8'}`}>
                        <Wallet className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        {s.label}
                      </button>
                    ))}
                  </div>
                  <Input placeholder="Eller skriv egen källa…" value={source}
                    onChange={e => setSource(e.target.value)}
                    className="h-10 rounded-xl text-sm" />
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-2 block">Anteckning (valfri)</label>
                  <Input placeholder="T.ex. Hoppa över latte idag" value={note} onChange={e => setNote(e.target.value)}
                    className="h-10 rounded-xl text-sm" />
                </div>

                <Button
                  disabled={!amount || parseFloat(amount) <= 0}
                  onClick={() => setStep('confirm')}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 font-bold text-white text-base"
                >
                  Nästa <ArrowDownCircle className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {/* CONFIRM STEP */}
            {step === 'confirm' && (
              <motion.div key="confirm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-5">
                <div className="text-center py-3">
                  <p className="text-6xl font-black text-emerald-400">+{parseFloat(amount).toLocaleString('sv-SE')} kr</p>
                  <p className="text-slate-400 text-sm mt-2">
                    {type === 'buffer' ? 'läggs till i din buffert' : `läggs till i ${goalName}`}
                  </p>
                  {source && <p className="text-xs text-slate-500 mt-1">Källa: {source}</p>}
                </div>

                <div className="p-4 rounded-2xl" style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)' }}>
                  <p className="text-xs text-amber-300 leading-relaxed">
                    💡 <strong>Glöm inte</strong> att föra över pengarna på riktigt i din bank – jag har registrerat dem här nu! Du kan bekräfta överföringen direkt efter.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep('input')} className="flex-none w-12 h-12 rounded-xl p-0 border-white/10">
                    <X className="w-4 h-4" />
                  </Button>
                  <Button onClick={handleConfirm} disabled={loading}
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 font-bold text-white">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Sparar…</> : '✅ Bekräfta insättning'}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* SUCCESS STEP */}
            {step === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5 text-center">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto"
                >
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </motion.div>

                <div>
                  <h3 className="text-2xl font-bold text-white">Inregistrerat! 🎉</h3>
                  <p className="text-emerald-400 font-bold text-xl mt-1">+{parseFloat(amount).toLocaleString('sv-SE')} kr</p>
                  <p className="text-slate-400 text-sm mt-1">
                    {type === 'buffer' ? 'tillagd i bufferten' : `tillagd i ${goalName}`}
                  </p>
                  {/* Progress towards goal */}
                  {type === 'savings' && profile?.savingsGoal > 0 && (() => {
                    const newBalance = (profile.savingsCurrentBalance || 0) + parseFloat(amount);
                    const pct = Math.min(100, Math.round((newBalance / profile.savingsGoal) * 100));
                    return (
                      <div className="mt-3">
                        <p className="text-xs text-slate-400 mb-1">{goalName}: {pct}% klart</p>
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                          <motion.div
                            initial={{ width: `${Math.max(0, pct - 10)}%` }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                          />
                        </div>
                        {pct >= 100 && <p className="text-emerald-400 font-bold text-sm mt-2">🏆 Mål uppnått!</p>}
                      </div>
                    );
                  })()}
                  {/* Streak */}
                  {streak() >= 7 && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-3 p-2.5 rounded-xl text-center"
                      style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)' }}
                    >
                      <p className="text-amber-300 font-bold text-sm">🔥 {streak()} dagars streak! High-five!</p>
                    </motion.div>
                  )}
                </div>

                {/* Account Type Advisor */}
                <div className="text-left">
                  <p className="text-xs text-slate-500 mb-2 uppercase tracking-widest font-semibold">Var ska pengarna ligga?</p>
                  <AccountTypeAdvisor
                    months={type === 'buffer' ? 0 : null}
                    isBuffer={type === 'buffer'}
                    goalName={type === 'buffer' ? 'Buffert' : goalName}
                    goalAmount={parseFloat(amount)}
                  />
                </div>

                {/* Verification badge */}
                <div
                  onClick={!verified ? handleVerify : undefined}
                  className={`p-4 rounded-2xl cursor-pointer transition-all ${verified ? 'opacity-100' : 'hover:opacity-90'}`}
                  style={{
                    background: verified ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${verified ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)'}`
                  }}
                >
                  <div className="flex items-center gap-3">
                    {verified
                      ? <CheckSquare className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      : <Square className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    }
                    <div className="text-left">
                      <p className={`text-sm font-semibold ${verified ? 'text-emerald-300' : 'text-slate-300'}`}>
                        {verified ? '✓ Verifierad – pengarna är förda!' : 'Jag har fört över pengarna i min riktiga bank'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {verified ? 'Insättningen lyser grönt i din historik.' : 'Tryck för att låsa upp verifierings-badge'}
                      </p>
                    </div>
                  </div>
                </div>

                <Button onClick={onClose} className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 font-bold text-white">
                  Stäng
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
}