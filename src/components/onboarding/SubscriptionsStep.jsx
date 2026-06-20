import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Tv, Car, Heart, Apple, Shield, MoreHorizontal, Music } from 'lucide-react';
import OnboardingStep from './OnboardingStep';
import { anchorInputClass } from '@/lib/anchorTheme';

const categories = [
  { id: 'entertainment', label: 'Nöje', icon: Music, color: 'bg-purple-100 text-purple-700' },
  { id: 'transport', label: 'Transport', icon: Car, color: 'bg-blue-100 text-blue-700' },
  { id: 'health', label: 'Hälsa', icon: Heart, color: 'bg-rose-100 text-rose-700' },
  { id: 'streaming', label: 'Streaming', icon: Tv, color: 'bg-indigo-100 text-indigo-700' },
  { id: 'food', label: 'Mat', icon: Apple, color: 'bg-amber-100 text-amber-700' },
  { id: 'insurance', label: 'Försäkring', icon: Shield, color: 'bg-emerald-100 text-emerald-700' },
  { id: 'other', label: 'Övrigt', icon: MoreHorizontal, color: 'bg-slate-100 text-slate-700' },
];

export default function SubscriptionsStep({ data, onChange, onNext, onBack }) {
  const [newSub, setNewSub] = useState({ name: '', amount: '', category: 'other', billingDay: '' });
  const [showForm, setShowForm] = useState(false);

  const addSubscription = () => {
    if (newSub.name && newSub.amount) {
      onChange({
        ...data,
        subscriptions: [...(data.subscriptions || []), {
          name: newSub.name,
          amount: parseInt(newSub.amount),
          category: newSub.category,
          billingDay: parseInt(newSub.billingDay) || null
        }]
      });
      setNewSub({ name: '', amount: '', category: 'other', billingDay: '' });
      setShowForm(false);
    }
  };

  const removeSubscription = (index) => {
    const newSubs = [...data.subscriptions];
    newSubs.splice(index, 1);
    onChange({ ...data, subscriptions: newSubs });
  };

  const getCategoryInfo = (catId) => categories.find(c => c.id === catId) || categories[6];
  const totalCost = (data.subscriptions || []).reduce((sum, s) => sum + s.amount, 0);

  return (
    <OnboardingStep
      step={1}
      totalSteps={5}
      title="Abonnemang & fasta kostnader"
      subtitle="Lägg till dina återkommande kostnader som el, gym, streaming, telefon med mera."
    >
      <div className="space-y-4">
        {/* Existing subscriptions */}
        {(data.subscriptions || []).map((sub, i) => {
          const cat = getCategoryInfo(sub.category);
          const Icon = cat.icon;
          return (
            <div
              key={i}
              className="flex items-center justify-between p-4 dark-card"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${cat.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-white">{sub.name}</p>
                  <p className="text-sm text-slate-400">{cat.label}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-white">{sub.amount} kr</span>
                <button
                  onClick={() => removeSubscription(i)}
                  className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Add new form */}
        {showForm ? (
          <div className="p-4 dark-card rounded-xl space-y-4">
            <Input
              placeholder="Namn (t.ex. Netflix, Gym)"
              value={newSub.name}
              onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
              className={anchorInputClass}
            />
            <Input
              type="number"
              placeholder="Belopp per månad"
              value={newSub.amount}
              onChange={(e) => setNewSub({ ...newSub, amount: e.target.value })}
              className={anchorInputClass}
            />
            <Input
              type="number"
              placeholder="Förfallodag (1–31), t.ex. 27"
              min="1"
              max="31"
              value={newSub.billingDay}
              onChange={(e) => setNewSub({ ...newSub, billingDay: e.target.value })}
              className={anchorInputClass}
            />
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <Badge
                  key={cat.id}
                  variant={newSub.category === cat.id ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all ${
                    newSub.category === cat.id ? 'bg-emerald-500' : ''
                  }`}
                  onClick={() => setNewSub({ ...newSub, category: cat.id })}
                >
                  {cat.label}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                className="flex-1 h-11 rounded-lg"
              >
                Avbryt
              </Button>
              <Button
                onClick={addSubscription}
                className="flex-1 h-11 rounded-lg bg-emerald-500 hover:bg-emerald-600"
              >
                Lägg till
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full p-4 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:border-emerald-500 hover:text-emerald-400 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Lägg till kostnad
          </button>
        )}

        {/* Total */}
        {totalCost > 0 && (
          <div className="p-4 bg-emerald-50 rounded-xl flex justify-between items-center">
            <span className="text-emerald-700">Totala fasta kostnader</span>
            <span className="font-semibold text-emerald-700">{totalCost} kr/mån</span>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-8">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 h-14 rounded-xl"
        >
          Tillbaka
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 h-14 rounded-xl bg-emerald-500 hover:bg-emerald-600"
        >
          Fortsätt
        </Button>
      </div>
    </OnboardingStep>
  );
}