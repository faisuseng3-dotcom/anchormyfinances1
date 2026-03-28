import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Clock, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

function getDaysLeft(endDateStr) {
  const end = new Date(endDateStr);
  const now = new Date();
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
}

function formatDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

export default function TrialTimer({ profile, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [newTrial, setNewTrial] = useState({ name: '', days: '', amount: '' });
  const [saving, setSaving] = useState(false);

  const trials = (profile?.subscriptions || []).filter(s => s.isTrial && s.trialEndDate);

  const addTrial = async () => {
    if (!newTrial.name || !newTrial.days) return;
    setSaving(true);
    const trialSub = {
      name: newTrial.name,
      amount: parseInt(newTrial.amount) || 0,
      category: 'other',
      billingDay: null,
      isTrial: true,
      trialEndDate: formatDate(parseInt(newTrial.days)),
    };
    const updated = [...(profile.subscriptions || []), trialSub];
    await base44.entities.FinancialProfile.update(profile.id, { subscriptions: updated });
    setNewTrial({ name: '', days: '', amount: '' });
    setShowForm(false);
    setSaving(false);
    onUpdate?.();
  };

  const removeTrial = async (idx) => {
    // Find the actual index in subscriptions
    const trialNames = trials.map(t => t.name);
    const updated = profile.subscriptions.filter((_, i) => {
      const sub = profile.subscriptions[i];
      return !(sub.isTrial && sub.name === trialNames[idx]);
    });
    await base44.entities.FinancialProfile.update(profile.id, { subscriptions: updated });
    onUpdate?.();
  };

  return (
    <div className="dark-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white">Trial-Timer</h3>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Startat provperiod?
        </button>
      </div>

      {trials.length === 0 && !showForm && (
        <p className="text-xs text-slate-500">Ingen aktiv provperiod. Tryck "Startat provperiod?" för att spåra den.</p>
      )}

      <div className="space-y-2">
        {trials.map((trial, i) => {
          const daysLeft = getDaysLeft(trial.trialEndDate);
          const isUrgent = daysLeft <= 3;
          const isExpired = daysLeft <= 0;
          return (
            <div
              key={i}
              className={`flex items-center justify-between p-3 rounded-xl border ${
                isExpired ? 'border-rose-500/40 bg-rose-500/10' :
                isUrgent ? 'border-amber-500/40 bg-amber-500/10' :
                'border-white/10 bg-white/4'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  {isUrgent && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                  <p className="text-sm font-medium text-white">{trial.name}</p>
                </div>
                <p className={`text-xs mt-0.5 ${isExpired ? 'text-rose-400' : isUrgent ? 'text-amber-400' : 'text-slate-400'}`}>
                  {isExpired
                    ? '⚠️ Provperioden är slut – kolla om du blivit debiterad!'
                    : `${daysLeft} dag${daysLeft === 1 ? '' : 'ar'} kvar att säga upp`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {trial.amount > 0 && (
                  <span className="text-xs text-slate-400">{trial.amount} kr/mån</span>
                )}
                <button onClick={() => removeTrial(i)} className="p-1 hover:bg-white/10 rounded-lg">
                  <X className="w-3 h-3 text-slate-500" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30"
          >
            <Input
              placeholder="Tjänstens namn, t.ex. Shopify"
              value={newTrial.name}
              onChange={e => setNewTrial({ ...newTrial, name: e.target.value })}
              className="h-10 rounded-lg text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Input
                  type="number"
                  placeholder="Dagar gratis"
                  value={newTrial.days}
                  onChange={e => setNewTrial({ ...newTrial, days: e.target.value })}
                  className="h-10 rounded-lg text-sm"
                />
              </div>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="Pris efter (kr)"
                  value={newTrial.amount}
                  onChange={e => setNewTrial({ ...newTrial, amount: e.target.value })}
                  className="h-10 rounded-lg text-sm pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">kr</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1 h-9 rounded-lg text-xs">Avbryt</Button>
              <Button onClick={addTrial} disabled={saving} className="flex-1 h-9 rounded-lg bg-amber-500 hover:bg-amber-600 text-xs">
                {saving ? 'Sparar...' : 'Starta timer'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}