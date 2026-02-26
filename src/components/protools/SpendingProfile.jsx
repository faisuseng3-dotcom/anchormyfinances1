import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

export default function SpendingProfile({ profile }) {
  const [personality, setPersonality] = useState(null);

  useEffect(() => {
    if (!profile?.monthlyExpenses) return;

    const entertainmentExpenses = profile.monthlyExpenses.filter(e => 
      e.category === 'entertainment' || e.category === 'Nöjen'
    );

    if (entertainmentExpenses.length === 0) {
      setPersonality({ type: 'no_data' });
      return;
    }

    // Count evening/night purchases (after 20:00)
    const eveningPurchases = entertainmentExpenses.filter(e => {
      const date = new Date(e.date);
      const hour = date.getHours();
      return hour >= 20 || hour < 6;
    });

    // Count weekend purchases
    const weekendPurchases = entertainmentExpenses.filter(e => {
      const date = new Date(e.date);
      const day = date.getDay();
      return day === 0 || day === 6;
    });

    const eveningPercent = (eveningPurchases.length / entertainmentExpenses.length) * 100;
    const weekendPercent = (weekendPurchases.length / entertainmentExpenses.length) * 100;

    let type = '';
    let description = '';

    if (eveningPercent > 40) {
      type = 'night_owl';
      description = 'Du tenderar att spendera på nöjen sent på kvällen. Detta kan tyda på impulsköp.';
    } else if (weekendPercent > 40) {
      type = 'weekend_warrior';
      description = 'Majoriteten av dina nöjesutgifter sker på helger. Planera budgeten i förväg!';
    } else {
      type = 'balanced';
      description = 'Du har ett balanserat spendingsmönster över veckan.';
    }

    setPersonality({
      type,
      description,
      eveningPercent: eveningPercent.toFixed(1),
      weekendPercent: weekendPercent.toFixed(1)
    });
  }, [profile]);

  if (!personality) return null;

  if (personality.type === 'no_data') {
    return (
      <div className="dark-card p-6 rounded-2xl">
        <p className="text-slate-400 text-sm">Inte tillräckligt med data för att analysera</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="dark-card p-6 rounded-2xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-6 h-6 text-purple-400" />
        <h3 className="font-semibold text-white">Din Ekonomiska Personlighet</h3>
      </div>

      <div className="mb-6">
        <div className={`inline-block px-4 py-2 rounded-full ${
          personality.type === 'night_owl' ? 'bg-purple-500/20 text-purple-400' :
          personality.type === 'weekend_warrior' ? 'bg-blue-500/20 text-blue-400' :
          'bg-emerald-500/20 text-emerald-400'
        } font-medium`}>
          {personality.type === 'night_owl' ? '🌙 Nattuggle' :
           personality.type === 'weekend_warrior' ? '🎉 Helgkonsument' :
           '✓ Balanserad'}
        </div>
      </div>

      <p className="text-slate-300 text-sm mb-6">{personality.description}</p>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white/5">
          <p className="text-xs text-slate-400 mb-1">Kvällsköp (20:00+)</p>
          <p className="text-2xl font-bold text-purple-400">{personality.eveningPercent}%</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5">
          <p className="text-xs text-slate-400 mb-1">Helgköp</p>
          <p className="text-2xl font-bold text-blue-400">{personality.weekendPercent}%</p>
        </div>
      </div>
    </motion.div>
  );
}