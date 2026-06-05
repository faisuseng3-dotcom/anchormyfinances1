import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function CrisisAssistant({ profile }) {
  const [crisis, setCrisis] = useState(null);

  useEffect(() => {
    if (!profile) return;

    // Calculate if buffer will reach 0 before payday
    const expenses = profile.monthlyExpenses || [];
    const avgDailySpending = expenses.length > 0 
      ? expenses.reduce((sum, e) => sum + e.amount, 0) / 30 
      : 200;

    const today = new Date();
    const payday = new Date(today.getFullYear(), today.getMonth(), 25);
    if (payday < today) {
      payday.setMonth(payday.getMonth() + 1);
    }
    const daysUntilPayday = Math.ceil((payday - today) / (1000 * 60 * 60 * 24));

    const projectedBalance = profile.buffer - (daysUntilPayday * avgDailySpending);

    if (projectedBalance < 0) {
      // Find non-essential subscriptions to pause
      const nonEssential = (profile.subscriptions || []).filter(s => 
        s.category !== 'insurance' && s.category !== 'transport'
      );

      setCrisis({
        triggered: true,
        deficit: Math.abs(Math.round(projectedBalance)),
        daysUntilPayday,
        suggestions: nonEssential.map(s => ({
          name: s.name,
          amount: s.amount,
          category: s.category
        }))
      });
    } else {
      setCrisis({ triggered: false });
    }
  }, [profile]);

  if (!crisis?.triggered) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      >
        <motion.div
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          className="w-full max-w-md bg-gradient-to-br from-rose-900 to-rose-800 rounded-2xl p-6 border-2 border-rose-500"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-rose-500 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Krislarm!</h3>
              <p className="text-sm text-rose-200">
                Din buffert når 0 kr om {crisis.daysUntilPayday} dagar
              </p>
            </div>
          </div>

          <div className="bg-black/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-rose-200 mb-1">Underskott innan lön:</p>
            <p className="text-3xl font-bold text-white">-{crisis.deficit} kr</p>
          </div>

          <div className="mb-6">
            <p className="text-sm font-semibold text-white mb-3">Förslag: Pausa dessa utgifter</p>
            <div className="space-y-2">
              {crisis.suggestions.slice(0, 3).map((sug, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-black/20">
                  <span className="text-sm text-white">{sug.name}</span>
                  <span className="text-sm font-bold text-rose-200">-{sug.amount} kr</span>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={() => setCrisis({ triggered: false })}
            className="w-full h-12 rounded-xl bg-white text-rose-900 hover:bg-rose-50 font-semibold"
          >
            Jag förstår
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}