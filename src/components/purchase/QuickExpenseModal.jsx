import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { suggestCategory } from '@/lib/smartCategorization';
import { useState } from 'react';

const categories = [
  { id: 'food', label: 'Mat & Dryck' },
  { id: 'entertainment', label: 'Nöje' },
  { id: 'transport', label: 'Transport' },
  { id: 'shopping', label: 'Shopping & Kläder' },
  { id: 'subscriptions', label: 'Abonnemang' },
  { id: 'other', label: 'Övrigt' },
];

export default function QuickExpenseModal({ isOpen, onClose, onSuccess, profile, prefilledName = '', prefilledAmount = '' }) {
  const [name, setName] = useState(prefilledName);
  const [amount, setAmount] = useState(prefilledAmount);
  const [category, setCategory] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);

  // Safe-to-Spend beräkning
  const safeToSpend = (() => {
    if (!profile) return 0;
    const todayDay = new Date().getDate();
    const DUE_DAYS = [8, 12, 15, 18, 22, 27];
    let remaining = 0;
    const housingDay = profile.housingDueDay || 27;
    if (housingDay > todayDay) remaining += (profile.housingCost || 0);
    (profile.loans || []).forEach((l, i) => { if ((5 + i) > todayDay) remaining += (l.monthlyPayment || 0); });
    (profile.subscriptions || []).forEach((s, i) => {
      const d = s.billingDay || DUE_DAYS[i % DUE_DAYS.length];
      if (d > todayDay) remaining += (s.amount || 0);
    });
    return Math.max(0, Math.round((profile.buffer || 0) - remaining - 500));
  })();

  const amountNum = parseInt(amount?.toString().replace(/\s/g, '')) || 0;
  const exceedsSafe = amountNum > 0 && amountNum > safeToSpend;

  const formatNumber = (value) => {
    return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '';
  };

  const parseNumber = (value) => {
    return parseInt(value.replace(/\s/g, '')) || 0;
  };

  const handleRegister = async () => {
    if (!name || !amount || !category) return;

    setAnalyzing(true);

    const newExpense = {
      name,
      amount: parseNumber(amount),
      date: new Date().toISOString().split('T')[0],
      category
    };

    const newExpenses = [...(profile.monthlyExpenses || []), newExpense];

    // Update profile
    await base44.entities.FinancialProfile.update(profile.id, { 
      monthlyExpenses: newExpenses 
    });

    // Generate AI insight
    const totalSpent = newExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalSubscriptions = (profile.subscriptions || []).reduce((sum, s) => sum + s.amount, 0);
    const totalLoanPayments = (profile.loans || []).reduce((sum, l) => sum + l.monthlyPayment, 0);
    const totalFixedCosts = profile.housingCost + totalSubscriptions + totalLoanPayments;
    const monthlyMargin = profile.income - totalFixedCosts;
    const remaining = monthlyMargin - totalSpent;

    try {
      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `Du är en ekonomicoach. Användaren registrerade just ett köp:
- Köp: ${name}
- Belopp: ${parseNumber(amount)} kr
- Kategori: ${category}

Ekonomisk situation:
- Månadsinkomst: ${profile.income} kr
- Fasta kostnader: ${totalFixedCosts} kr
- Total spenderat denna månad: ${totalSpent} kr
- Kvar att spendera: ${remaining} kr

Ge ett kort råd (max 2 meningar) på SVENSKA. Var uppmuntrande om det är OK, varnande om det börjar bli tight.`,
      });

      setAiInsight({
        text: aiResponse,
        remaining,
        totalSpent
      });
    } catch (error) {
      console.error('AI insight error:', error);
    }

    base44.analytics.track({
      eventName: 'expense_registered',
      properties: { category, amount: parseNumber(amount) }
    });

    setAnalyzing(false);
  };

  const handleClose = () => {
    setName('');
    setAmount('');
    setCategory('');
    setAiInsight(null);
    onClose();
    if (aiInsight && onSuccess) {
      onSuccess();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end"
      onClick={handleClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full glass-effect rounded-t-3xl p-6 pb-24 max-h-[90vh] overflow-y-auto"
      >
        {!aiInsight ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Registrera köp</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Vad köpte du?</label>
                <Input
                  placeholder="t.ex. Lunch på ICA"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 rounded-xl"
                  disabled={analyzing}
                />
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">Belopp</label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="0"
                    value={formatNumber(parseNumber(amount))}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-12 rounded-xl pr-12"
                    disabled={analyzing}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">kr</span>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">Kategori</label>
                <Select value={category} onValueChange={setCategory} disabled={analyzing}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Välj kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Safe-to-Spend varning */}
              {exceedsSafe && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl text-xs leading-relaxed"
                  style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)' }}
                >
                  ⚠️ <strong className="text-amber-300">Kommande räkningar:</strong>
                  <span className="text-amber-400"> Du har {safeToSpend.toLocaleString('sv-SE')} kr kvar att spendera säkert denna månad. Det här köpet överstiger den gränsen.</span>
                </motion.div>
              )}

              <Button
                onClick={handleRegister}
                disabled={!name || !amount || !category || analyzing}
                className="w-full h-14 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-lg font-semibold shadow-lg mt-6"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Registrerar...
                  </>
                ) : (
                  'Registrera köp'
                )}
              </Button>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-4"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl"
              >
                ✓
              </motion.div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">
              Köp registrerat!
            </h3>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-purple-900 mb-2">AI-analys</p>
                  <p className="text-sm text-purple-700 leading-relaxed">{aiInsight.text}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-4 bg-slate-50 rounded-xl text-center">
                <p className="text-xs text-slate-500 mb-1">Kvar denna månad</p>
                <p className="text-xl font-bold text-slate-900">
                  {aiInsight.remaining.toLocaleString()} kr
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl text-center">
                <p className="text-xs text-slate-500 mb-1">Total spenderat</p>
                <p className="text-xl font-bold text-slate-900">
                  {aiInsight.totalSpent.toLocaleString()} kr
                </p>
              </div>
            </div>

            <Button
              onClick={handleClose}
              className="w-full h-12 rounded-xl bg-slate-800 hover:bg-slate-900"
            >
              Stäng
            </Button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}