import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Anchor, Sparkles, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import TransactionClusters, { classifyTransaction } from '@/components/analysis/TransactionClusters';
import DualPathChart from '@/components/analysis/DualPathChart';
import ScenarioCards from '@/components/analysis/ScenarioCards';

// --- Demo data for Alex Mode ---
const ALEX_DEMO_TRANSACTIONS = [
  { id: 'a1', amount: -89, label: 'Kaffe', vendor: 'Espresso House', category: 'food', type: 'expense' },
  { id: 'a2', amount: -49, label: 'Lunch', vendor: 'Pressbyrån', category: 'food', type: 'expense' },
  { id: 'a3', amount: -79, label: 'Snacks', vendor: '7-Eleven', category: 'food', type: 'expense' },
  { id: 'a4', amount: -129, label: 'Kaffe & Bulle', vendor: 'Waynes Coffee', category: 'food', type: 'expense' },
  { id: 'a5', amount: -45, label: 'Godis', vendor: 'ICA', category: 'food', type: 'expense' },
  { id: 'a6', amount: -69, label: 'Lunch', vendor: 'Meny', category: 'food', type: 'expense' },
  { id: 'a7', amount: -99, label: 'Fika', vendor: 'Drop Coffee', category: 'food', type: 'expense' },
  { id: 'a8', amount: -890, label: 'Träningskläder', vendor: 'Gymshark', category: 'shopping', type: 'expense' },
  { id: 'a9', amount: -549, label: 'Gym', vendor: 'SATS', category: 'health', type: 'expense' },
  { id: 'a10', amount: -299, label: 'Bok', vendor: 'Akademibokhandeln', category: 'shopping', type: 'expense' },
  { id: 'a11', amount: -890, label: 'Middag', vendor: 'Urban Deli', category: 'food', type: 'expense' },
  { id: 'a12', amount: -780, label: 'Kväll ute', vendor: 'Boulebar', category: 'entertainment', type: 'expense' },
  { id: 'a13', amount: -1230, label: 'Restaurang', vendor: 'Sushi Bar', category: 'food', type: 'expense' },
  { id: 'a14', amount: -500, label: 'Bar', vendor: 'Monks', category: 'entertainment', type: 'expense' },
  { id: 'a15', amount: -59, label: 'Kaffe', vendor: 'Espresso House', category: 'food', type: 'expense' },
  { id: 'a16', amount: -39, label: 'Snack', vendor: 'Pressbyrån', category: 'food', type: 'expense' },
  { id: 'a17', amount: -119, label: 'Lunch', vendor: 'Max', category: 'food', type: 'expense' },
  { id: 'a18', amount: -89, label: 'Kaffe', vendor: 'Starbucks', category: 'food', type: 'expense' },
  { id: 'a19', amount: -75, label: 'Snabb mat', vendor: 'McDonald\'s', category: 'food', type: 'expense' },
  { id: 'a20', amount: -109, label: 'Lunch', vendor: 'Subway', category: 'food', type: 'expense' },
];

function useAnalysisData(isAlexMode) {
  const { data: dbTransactions = [] } = useQuery({
    queryKey: ['transactions', 'analysis'],
    queryFn: () => base44.entities.Transaction.list('-created_date', 200),
    enabled: !isAlexMode,
  });
  const { data: profile } = useQuery({
    queryKey: ['financialProfile'],
    queryFn: async () => {
      const list = await base44.entities.FinancialProfile.list();
      return list?.[0] || null;
    },
    enabled: !isAlexMode,
  });
  return { transactions: isAlexMode ? ALEX_DEMO_TRANSACTIONS : dbTransactions, profile };
}

export default function AnchorAnalysis() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAlexMode = true; // Always use demo in this view for now

  const { transactions, profile } = useAnalysisData(isAlexMode);
  const [optimized, setOptimized] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [sliderPct, setSliderPct] = useState(50);

  // Calculate brus total
  const brusTxs = useMemo(() =>
    transactions.filter(tx => tx.amount < 0 && classifyTransaction(tx) === 'brus'),
    [transactions]
  );
  const brusTotal = useMemo(() =>
    brusTxs.reduce((s, t) => s + Math.abs(t.amount), 0),
    [brusTxs]
  );
  const brusSavings = Math.round(brusTotal * 0.5); // 50% av brus

  const alexProfile = {
    income: 28000,
    savingsGoal: 400000,
    savingsCurrentBalance: 52000,
    savingsGoalName: 'Japan',
    buffer: 15000,
    _alexMode: true,
    ...(profile || {}),
  };

  const handleOptimize = async () => {
    setOptimizing(true);
    await new Promise(r => setTimeout(r, 1800));
    setOptimized(true);
    setOptimizing(false);
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(170deg, #f0fafa 0%, #edf2fb 45%, #f5f0ff 100%)' }}
    >
      {/* Sticky header */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-5 pt-12 pb-4"
        style={{ background: 'rgba(240,250,250,0.92)', backdropFilter: 'blur(12px)' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold"
          style={{ color: '#0D7377' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Tillbaka
        </button>
        <div className="flex items-center gap-2">
          <Anchor className="w-4 h-4" style={{ color: '#0D7377' }} />
          <span className="text-sm font-black" style={{ color: '#0D7377' }}>Den Stora Framtidsanalysen</span>
        </div>
        <div style={{ width: 72 }} />
      </div>

      <div className="px-5 pb-36 space-y-8">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-4"
        >
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ background: 'rgba(13,115,119,0.10)', border: '2px solid rgba(13,115,119,0.18)' }}
          >
            <Anchor className="w-7 h-7" style={{ color: '#0D7377' }} />
          </div>
          <h1 className="text-3xl font-black leading-tight" style={{ color: '#1A2332', letterSpacing: '-0.02em' }}>
            Alex, din ekonomi<br />har en hemlighet.
          </h1>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: '#6B7E96', maxWidth: 300, margin: '12px auto 0' }}>
            Anchor har analyserat dina senaste köp och räknat ut vad de faktiskt kostar dig — i tid, frihet och framtida förmögenhet.
          </p>
        </motion.div>

        {/* Cluster section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <TransactionClusters transactions={transactions} />
        </motion.div>

        {/* Brus insight callout */}
        {brusTotal > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl p-5"
            style={{ background: 'rgba(233,168,37,0.08)', border: '1px solid rgba(233,168,37,0.25)' }}
          >
            <p className="text-sm font-black mb-1" style={{ color: '#B7791F' }}>
              ☕ Brus-pengarna: {brusTotal.toLocaleString('sv-SE')} kr
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#4A5568' }}>
              Om du automatiserar 50% av dessa — <strong>{brusSavings.toLocaleString('sv-SE')} kr/mån</strong> — direkt till en global indexfond, händer något magiskt med din framtid.
            </p>
          </motion.div>
        )}

        {/* Dual Path Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <DualPathChart
            currentMonthlyNet={alexProfile.income * 0.18}
            brusSavings={brusSavings}
            sliderPct={sliderPct}
          />
        </motion.div>

        {/* Scenario Cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ScenarioCards
            profile={alexProfile}
            brusSavings={brusSavings}
            brusTotal={brusTotal}
            onSliderChange={setSliderPct}
          />
        </motion.div>

        {/* r/PrivatEkonomi verdict */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl px-6 py-5"
          style={{ background: 'rgba(13,115,119,0.07)', border: '1px solid rgba(13,115,119,0.14)' }}
        >
          <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#0D7377' }}>
            ⚓ Anchor-domen
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#2D5A5C', lineHeight: 1.8 }}>
            "Din alternativkostnad av Brus-köpen är inte{' '}
            <strong>{brusTotal.toLocaleString('sv-SE')} kr</strong> — det är{' '}
            <strong>hundratusentals kronor</strong> vid pension. r/PrivatEkonomi-rådet är enkelt: automatisera, diversifiera, glöm bort. Låt pengarna jobba medan du lever."
          </p>
          <p className="text-[11px] mt-3 font-bold" style={{ color: 'rgba(13,115,119,0.45)' }}>— ⚓ Anchor</p>
        </motion.div>

      </div>

      {/* Fixed CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 px-5 pb-10 pt-4 z-30"
        style={{ background: 'linear-gradient(to top, rgba(240,250,250,1) 70%, transparent)' }}
      >
        <AnimatePresence mode="wait">
          {!optimized ? (
            <motion.button
              key="optimize"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleOptimize}
              disabled={optimizing}
              className="w-full py-5 rounded-2xl text-base font-black text-white flex items-center justify-center gap-3"
              style={{
                background: 'linear-gradient(135deg, #0D7377 0%, #0FDEBD 100%)',
                boxShadow: '0 8px 28px rgba(13,115,119,0.30)',
                opacity: optimizing ? 0.8 : 1,
              }}
            >
              {optimizing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full"
                  />
                  Anchor optimerar din framtid...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Optimera min framtid
                </>
              )}
            </motion.button>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full py-5 rounded-2xl flex items-center justify-center gap-3"
              style={{ background: 'rgba(15,222,189,0.12)', border: '2px solid rgba(15,222,189,0.35)' }}
            >
              <CheckCircle2 className="w-5 h-5" style={{ color: '#0FDEBD' }} />
              <div>
                <p className="text-sm font-black" style={{ color: '#0D7377' }}>
                  {brusSavings.toLocaleString('sv-SE')} kr/mån flyttas till {alexProfile.savingsGoalName || 'ditt sparmål'}
                </p>
                <p className="text-xs" style={{ color: '#6B7E96' }}>Anchor har tagit hand om framtiden ✓</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}