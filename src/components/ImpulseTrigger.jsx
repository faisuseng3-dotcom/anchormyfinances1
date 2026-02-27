import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowRight, AlertTriangle, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Persona resilience scores (matching ProfileSwitcher data)
const PERSONA_DATA = {
  Student: {
    resilienceBefore: 15,
    resilienceDrop: 3,
    color: 'from-rose-500 to-red-600',
    borderColor: 'border-rose-500/40',
    icon: '⚠️',
    headline: 'Varning! Budget i riskzonen',
    message: 'Detta köp på 800 kr gör att din budget spricker om 4 dagar. Vill du ångra köpet för att ha råd med hyran?',
    badge: 'KRITISK VARNING',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    dropText: 'Din ekonomiska motståndskraft sjönk med 3 enheter.'
  },
  Mamma: {
    resilienceBefore: 40,
    resilienceDrop: 3,
    color: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-500/40',
    icon: '🧐',
    headline: 'Tänk efter innan du köper',
    message: '800 kr motsvarar 15% av din kvarvarande buffert denna månad. Din trygghetssiffra (Resilience Score) sjönk precis från 40 till 37.',
    badge: 'SMART INSIKT',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    dropText: 'Din ekonomiska motståndskraft sjönk med 3 enheter.'
  },
  Knegare: {
    resilienceBefore: 85,
    resilienceDrop: 3,
    color: 'from-indigo-500 to-purple-600',
    borderColor: 'border-indigo-500/40',
    icon: '💡',
    headline: 'Pro-insikt: Alternativkostnad',
    message: 'Om du investerat dessa 800 kr istället hade de varit värda 1 570 kr om 10 år. Köpet fördröjer ditt mål "Ny Bil" med 3 dagar.',
    badge: 'PRO ANALYS',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    dropText: 'Din ekonomiska motståndskraft sjönk med 3 enheter.'
  }
};

// Global event bus for shake effect
export const triggerShake = () => {
  window.dispatchEvent(new CustomEvent('anchor:impulse-shake'));
};

export default function ImpulseTrigger() {
  const queryClient = useQueryClient();
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const handleKeyPress = async (e) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();

        const profiles = await base44.entities.FinancialProfile.list();
        if (!profiles.length) return;

        const profile = profiles[0];
        const expenses = profile.monthlyExpenses || [];

        // Add impulse purchase
        const newExpense = {
          name: 'Impulsköp',
          amount: 800,
          date: new Date().toISOString().split('T')[0],
          category: 'entertainment'
        };
        await base44.entities.FinancialProfile.update(profile.id, {
          monthlyExpenses: [...expenses, newExpense]
        });
        queryClient.invalidateQueries({ queryKey: ['financialProfile'] });

        // Determine persona name by matching income
        let personaName = 'Knegare';
        if (profile.income <= 14000) personaName = 'Student';
        else if (profile.income <= 30000) personaName = 'Mamma';

        const personaData = PERSONA_DATA[personaName];

        // Trigger shake
        triggerShake();

        setNotification({ personaName, ...personaData });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [queryClient]);

  if (!notification) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4"
        onClick={() => setNotification(null)}
      >
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 22, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-sm rounded-3xl overflow-hidden`}
          style={{
            background: 'rgba(10, 14, 26, 0.97)',
            border: `1px solid rgba(255,255,255,0.12)`,
            boxShadow: '0 0 60px rgba(99,102,241,0.25), 0 20px 60px rgba(0,0,0,0.5)'
          }}
        >
          {/* Glow bar */}
          <div className={`h-1 bg-gradient-to-r ${notification.color} w-full`} />

          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${notification.color} flex items-center justify-center shadow-lg text-2xl`}
                  style={{ boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}
                >
                  <Brain className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${notification.badgeColor} mb-1`}>
                    <Sparkles className="w-3 h-3" />
                    {notification.badge}
                  </div>
                  <p className="text-sm font-bold text-white leading-tight">{notification.headline}</p>
                </div>
              </div>
              <button onClick={() => setNotification(null)} className="text-slate-500 hover:text-white transition-colors mt-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Purchase info */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/8 mb-4">
              <div className="text-2xl">🛍️</div>
              <div className="flex-1">
                <p className="text-xs text-slate-400">Registrerat köp</p>
                <p className="text-sm font-semibold text-white">Impulsköp · Nöje</p>
              </div>
              <span className="text-rose-400 font-black text-lg">-800 kr</span>
            </div>

            {/* Message */}
            <p className="text-sm text-slate-300 leading-relaxed mb-3">{notification.message}</p>

            {/* Resilience drop */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 mb-5"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-rose-300">{notification.dropText}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: `${(notification.resilienceBefore / 100) * 100}%` }}
                      animate={{ width: `${((notification.resilienceBefore - notification.resilienceDrop) / 100) * 100}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                      className={`h-full rounded-full bg-gradient-to-r ${
                        (notification.resilienceBefore - notification.resilienceDrop) > 60
                          ? 'from-emerald-500 to-green-500'
                          : (notification.resilienceBefore - notification.resilienceDrop) > 35
                          ? 'from-amber-500 to-yellow-500'
                          : 'from-rose-500 to-red-500'
                      }`}
                    />
                  </div>
                  <span className="text-xs text-rose-400 font-bold flex-shrink-0">
                    {notification.resilienceBefore} → {notification.resilienceBefore - notification.resilienceDrop}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setNotification(null)}
                className="flex-1 rounded-xl border-white/10 hover:bg-white/5 text-slate-300 text-sm"
              >
                Ok, jag förstår
              </Button>
              <Button
                onClick={() => setNotification(null)}
                className={`flex-1 rounded-xl bg-gradient-to-r ${notification.color} hover:opacity-90 text-white text-sm font-semibold shadow-lg`}
              >
                Analysera mer
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}