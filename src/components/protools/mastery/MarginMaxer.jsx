import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Scissors, Check } from 'lucide-react';

const CATEGORY_LABELS = {
  entertainment: 'Underhållning',
  transport: 'Transport',
  health: 'Hälsa',
  streaming: 'Streaming',
  food: 'Mat',
  insurance: 'Försäkring',
  other: 'Övrigt',
};

export default function MarginMaxer({ profile }) {
  const queryClient = useQueryClient();
  const [killed, setKilled] = useState([]);
  const [loading, setLoading] = useState(null);

  const subs = (profile?.subscriptions || []).filter((_, i) => !killed.includes(i));
  const killedSubs = (profile?.subscriptions || []).filter((_, i) => killed.includes(i));
  const totalKilled = killedSubs.reduce((s, sub) => s + (sub.amount || 0), 0);

  const handleKill = async (idx) => {
    if (!profile?.id) return;
    setLoading(idx);
    const newSubs = (profile.subscriptions || []).filter((_, i) => i !== idx);
    await base44.entities.FinancialProfile.update(profile.id, { subscriptions: newSubs });
    setKilled(prev => [...prev, idx]);
    queryClient.invalidateQueries({ queryKey: ['financialProfile'] });
    setLoading(null);
  };

  return (
    <div className="space-y-5">
      {/* Impact banner */}
      {totalKilled > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-4 border border-emerald-500/30 text-center"
          style={{ background: 'rgba(16,185,129,0.1)' }}
        >
          <p className="text-xs text-slate-400">Du har återtagit</p>
          <p className="text-2xl font-bold text-emerald-400">+{totalKilled.toLocaleString('sv-SE')} kr/mån</p>
          <p className="text-xs text-slate-500">= {Math.round(totalKilled * 12).toLocaleString('sv-SE')} kr/år tillbaka i din ficka</p>
        </motion.div>
      )}

      {subs.length === 0 && totalKilled === 0 && (
        <div className="rounded-2xl p-6 border border-white/8 text-center">
          <p className="text-slate-400 text-sm">Inga abonnemang registrerade.</p>
          <p className="text-xs text-slate-600 mt-1">Lägg till i Inställningar → Abonnemang.</p>
        </div>
      )}

      {subs.length === 0 && totalKilled > 0 && (
        <div className="rounded-2xl p-6 border border-emerald-500/20 text-center" style={{ background: 'rgba(16,185,129,0.05)' }}>
          <p className="text-2xl mb-2">🎉</p>
          <p className="text-white font-semibold">Alla onödiga kostnader borta!</p>
          <p className="text-xs text-slate-400 mt-1">Du har maximerat din marginal.</p>
        </div>
      )}

      {/* Subscription cards */}
      <div className="space-y-3">
        <AnimatePresence>
          {subs.map((sub, i) => {
            const yearlyWaste = (sub.amount || 0) * 12;
            const realIdx = (profile?.subscriptions || []).findIndex((s, idx) => s === sub && !killed.includes(idx));

            return (
              <motion.div
                key={`${sub.name}-${i}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl p-4 border border-rose-500/20 relative overflow-hidden"
                style={{ background: 'rgba(244,63,94,0.06)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-white">{sub.name}</p>
                      {sub.category && (
                        <span className="text-xs text-rose-400 bg-rose-500/15 px-1.5 py-0.5 rounded-full">
                          {CATEGORY_LABELS[sub.category] || sub.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {(sub.amount || 0).toLocaleString('sv-SE')} kr/mån
                      <span className="text-slate-600"> · {yearlyWaste.toLocaleString('sv-SE')} kr/år</span>
                    </p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleKill(realIdx === -1 ? i : realIdx)}
                    disabled={loading !== null}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs text-white"
                    style={{ background: 'linear-gradient(135deg, #ef4444, #be123c)' }}
                  >
                    {loading === (realIdx === -1 ? i : realIdx) ? (
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <><Scissors className="w-3 h-3" /> Klipp</>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {killedSubs.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-600 uppercase tracking-wider font-semibold">Borttagna</p>
          {killedSubs.map((sub, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 opacity-50">
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-slate-400 line-through">{sub.name}</span>
              <span className="text-xs text-emerald-400 ml-auto">-{sub.amount} kr/mån</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}