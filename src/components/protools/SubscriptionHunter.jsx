import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, AlertCircle } from 'lucide-react';

const formatNumber = (value) => {
  return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
};

export default function SubscriptionHunter({ profile }) {
  const [leaks, setLeaks] = useState([]);

  useEffect(() => {
    if (!profile?.monthlyExpenses) return;

    // Group expenses by amount
    const amountGroups = {};
    
    profile.monthlyExpenses.forEach(expense => {
      const amount = expense.amount;
      if (!amountGroups[amount]) {
        amountGroups[amount] = [];
      }
      amountGroups[amount].push(expense);
    });

    // Find recurring amounts (3+ times with similar dates)
    const potentialLeaks = [];
    
    Object.entries(amountGroups).forEach(([amount, expenses]) => {
      if (expenses.length >= 3) {
        // Check if they're roughly monthly (25-35 days apart)
        const sortedDates = expenses
          .map(e => new Date(e.date))
          .sort((a, b) => a - b);
        
        let isRecurring = true;
        for (let i = 1; i < sortedDates.length && i < 3; i++) {
          const daysDiff = Math.abs((sortedDates[i] - sortedDates[i-1]) / (1000 * 60 * 60 * 24));
          if (daysDiff < 25 || daysDiff > 35) {
            isRecurring = false;
            break;
          }
        }

        if (isRecurring) {
          // Check if it's not already in subscriptions
          const isKnown = (profile.subscriptions || []).some(s => 
            Math.abs(s.amount - parseFloat(amount)) < 1
          );

          if (!isKnown && parseFloat(amount) > 10) {
            potentialLeaks.push({
              amount: parseFloat(amount),
              name: expenses[0].name,
              occurrences: expenses.length
            });
          }
        }
      }
    });

    setLeaks(potentialLeaks);
  }, [profile]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="dark-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Search className="w-6 h-6 text-blue-400" />
          <h3 className="font-semibold text-white">Subscription Hunter</h3>
        </div>

        <p className="text-sm text-slate-400 mb-6">
          Hittar dolda abonnemang genom att analysera återkommande transaktioner.
        </p>

        {leaks.length === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <p className="text-sm text-emerald-400">
              ✓ Inga dolda läckor hittade! Alla dina återkommande utgifter är registrerade.
            </p>
          </div>
        ) : (
          <>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <p className="text-sm font-semibold text-amber-400">
                  {leaks.length} potentiell{leaks.length > 1 ? 'a' : ''} läck{leaks.length > 1 ? 'or' : 'a'} hittad{leaks.length > 1 ? 'e' : ''}!
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {leaks.map((leak, i) => (
                <div key={i} className="p-4 rounded-xl dark-card border border-amber-500/20">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-white">{leak.name}</p>
                      <p className="text-xs text-slate-400">
                        {leak.occurrences} återkommande transaktioner
                      </p>
                    </div>
                    <p className="font-bold text-amber-400">{formatNumber(leak.amount)} kr/mån</p>
                  </div>
                  <button className="w-full mt-3 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium">
                    Lägg till i abonnemang
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-white/5">
              <p className="text-sm text-slate-400 mb-1">Total kostnad för läckor:</p>
              <p className="text-2xl font-bold text-rose-400">
                {formatNumber(leaks.reduce((sum, l) => sum + l.amount, 0))} kr/mån
              </p>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}