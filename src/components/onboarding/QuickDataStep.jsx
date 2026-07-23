import React, { useState } from 'react';
import { Wallet, Home, PiggyBank, CreditCard, ChevronRight, Plus, X } from 'lucide-react';
import OnboardingStep from './OnboardingStep';
import { copilotInputClass } from '@/lib/copilotTheme';
import {
  onboardingPrimaryBtn,
  onboardingBackBtn,
  onboardingFieldLabel,
} from './onboardingUi';
import { anchorInputAmountClass, anchorInputSuffixClass } from '@/lib/anchorTheme';
import SubscriptionDetective from './SubscriptionDetective';
import OnboardingHistoryImport from './OnboardingHistoryImport';
import { CITY_PRESETS } from '@/lib/anchorBrain';

const DEFAULT_COST_ITEMS = [
  { id: 'housing', label: 'Hyra / Boende', amount: '', placeholder: '10 000' },
];

const COST_SUGGESTIONS = [
  { label: 'El & Värme', placeholder: '500' },
  { label: 'Internet', placeholder: '300' },
  { label: 'Gym', placeholder: '400' },
  { label: 'Försäkringar', placeholder: '600' },
  { label: 'Övrigt', placeholder: '500' },
];

const formatNumber = (value) => {
  if (value === 0 || value === '0') return '0';
  return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '';
};

const parseNumber = (value) => {
  const cleaned = value.replace(/\s/g, '');
  if (cleaned === '') return 0;
  return parseInt(cleaned) || 0;
};

export default function QuickDataStep({ data, onChange, onNext, onBack }) {
  const [costItems, setCostItems] = useState(() => {
    // Restore from data if editing
    if (data.fixedCostItems && data.fixedCostItems.length > 0) {
      return data.fixedCostItems.map((item, i) => ({ ...item, id: item.id || String(i) }));
    }
    // Pre-fill housing from existing housingCost
    return [{ id: 'housing', label: 'Hyra / Boende', amount: data.housingCost ? String(data.housingCost) : '', placeholder: '10 000' }];
  });

  const [showSuggestions, setShowSuggestions] = useState(false);

  // Sync selected detective services to subscriptions in parent data
  const handleDetectiveToggle = (service) => {
    const existing = (data.subscriptions || []);
    const alreadyIn = existing.some(s => s.name === service.name);
    const updated = alreadyIn
      ? existing.filter(s => s.name !== service.name)
      : [...existing, { name: service.name, amount: service.amount, category: service.category, billingDay: null }];
    onChange({ ...data, subscriptions: updated });
  };

  const totalFixed = costItems.reduce((sum, item) => sum + parseNumber(item.amount || ''), 0);

  const updateItem = (id, field, value) => {
    const updated = costItems.map(item => item.id === id ? { ...item, [field]: value } : item);
    setCostItems(updated);
    syncToParent(updated);
  };

  const addItem = (suggestion = null) => {
    const newItem = {
      id: Date.now().toString(),
      label: suggestion?.label || '',
      amount: '',
      placeholder: suggestion?.placeholder || '0',
    };
    const updated = [...costItems, newItem];
    setCostItems(updated);
    setShowSuggestions(false);
  };

  const removeItem = (id) => {
    if (costItems.length <= 1) return;
    const updated = costItems.filter(item => item.id !== id);
    setCostItems(updated);
    syncToParent(updated);
  };

  const syncToParent = (items) => {
    const total = items.reduce((sum, item) => sum + parseNumber(item.amount || ''), 0);
    const housingItem = items.find(i => i.id === 'housing');
    onChange({
      ...data,
      housingCost: housingItem ? parseNumber(housingItem.amount || '') : 0,
      fixedCostItems: items.map(i => ({ id: i.id, label: i.label, amount: parseNumber(i.amount || '') })),
    });
  };

  const isValid = data.income > 0;

  return (
    <OnboardingStep
      step={2}
      totalSteps={4}
      title="Ungefärliga siffror"
      subtitle="Storstad är dyrt — vi utgår från din verklighet, inte perfekt budget."
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <label className={onboardingFieldLabel}>Var bor du?</label>
          <select
            value={data.city || ''}
            onChange={(e) => onChange({ ...data, city: e.target.value })}
            className={`${copilotInputClass} anchor-input`}
          >
            <option value="">Välj stad</option>
            {CITY_PRESETS.map((c) => (
              <option key={c} value={c === 'Övrig stad' ? 'Sverige' : c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Income */}
        <div className="space-y-2">
          <label className={onboardingFieldLabel}>
            <Wallet className="w-4 h-4 text-[#9FB5FF]" />
            Månadsinkomst (efter skatt)
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="25 000"
              value={formatNumber(data.income)}
              onChange={(e) => {
                const val = parseNumber(e.target.value);
                onChange({ ...data, income: Math.max(0, val) });
              }}
              className={`${anchorInputAmountClass} pr-12`}
            />
            <span className={`absolute right-4 top-1/2 -translate-y-1/2 ${anchorInputSuffixClass}`}>kr</span>
          </div>
        </div>

        {/* Fixed Costs — multi-row */}
        <div className="space-y-2">
          <label className={onboardingFieldLabel}>
            <Home className="w-4 h-4 text-[#9FB5FF]" />
            Fasta månadskostnader
          </label>
          <p className="text-[13px] text-white/45 -mt-1">Hyra, el, abonnemang, försäkringar m.m.</p>

          <div className="space-y-2">
            {costItems.map((item) => (
              <div key={item.id} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => updateItem(item.id, 'label', e.target.value)}
                  placeholder="t.ex. Hyra"
                  className={`${copilotInputClass} flex-1`}
                />
                <div className="relative w-32 flex-shrink-0">
                  <input
                    type="text"
                    value={item.amount}
                    onChange={(e) => updateItem(item.id, 'amount', e.target.value)}
                    placeholder={item.placeholder}
                    className={`${copilotInputClass} pr-8`}
                  />
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${anchorInputSuffixClass}`}>kr</span>
                </div>
                {costItems.length > 1 && (
                  <button
                    onClick={() => removeItem(item.id)}
                    className="w-9 h-11 rounded-xl bg-white/5 hover:bg-rose-500/20 flex items-center justify-center flex-shrink-0 transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400 hover:text-rose-400" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add row */}
          <div className="relative">
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="flex items-center gap-2 text-sm text-[#9FB5FF] hover:text-[#C7D6FF] transition-colors py-1"
            >
              <Plus className="w-4 h-4" />
              Lägg till kostnad
            </button>

            {showSuggestions && (
              <div className="absolute top-8 left-0 z-10 border border-white/15 rounded-xl p-2 shadow-xl min-w-48"
                style={{ background: 'linear-gradient(180deg, rgba(12,21,45,0.98), rgba(10,17,34,0.98))' }}>
                {COST_SUGGESTIONS.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => addItem(s)}
                    className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/8 rounded-lg transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
                <div className="border-t border-white/10 mt-1 pt-1">
                  <button
                    onClick={() => addItem()}
                    className="w-full text-left px-3 py-2 text-sm text-[#9FB5FF] hover:bg-white/8 rounded-lg transition-colors"
                  >
                    + Eget fält
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Total */}
          {totalFixed > 0 && (
            <div className="flex justify-between items-center text-sm border-t border-white/10 pt-2 mt-1">
              <span className="text-[#B7C2D9]">Totalt fasta kostnader:</span>
              <span className="text-white font-semibold">{formatNumber(totalFixed)} kr/mån</span>
            </div>
          )}
        </div>

        {/* Subscription Detective */}
        <div className="space-y-2">
          <SubscriptionDetective
            selected={data.subscriptions || []}
            onToggle={handleDetectiveToggle}
          />
          {(data.subscriptions || []).length > 0 && (
            <p className="text-xs text-[#B7C2D9] px-1">
              {(data.subscriptions || []).length} tjänst{(data.subscriptions || []).length > 1 ? 'er' : ''} valda · {(data.subscriptions || []).reduce((s, x) => s + (x.amount || 0), 0)} kr/mån läggs automatiskt till i dina fasta kostnader.
            </p>
          )}
        </div>

        {/* Optional: Savings */}
        <div className="space-y-2">
          <label className={onboardingFieldLabel}>
            <PiggyBank className="w-4 h-4 text-[#9FB5FF]" />
            Buffert / sparande (valfritt)
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="0"
              value={formatNumber(data.buffer)}
              onChange={(e) => onChange({ ...data, buffer: parseNumber(e.target.value) })}
              className={`${copilotInputClass} pr-12`}
            />
            <span className={`absolute right-4 top-1/2 -translate-y-1/2 ${anchorInputSuffixClass}`}>kr</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className={onboardingFieldLabel}>
            <CreditCard className="w-4 h-4 text-[#9FB5FF]" />
            Lån totalt (valfritt)
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="0"
              value={formatNumber(data.totalLoans || 0)}
              onChange={(e) => onChange({ ...data, totalLoans: parseNumber(e.target.value) })}
              className={`${copilotInputClass} pr-12`}
            />
            <span className={`absolute right-4 top-1/2 -translate-y-1/2 ${anchorInputSuffixClass}`}>kr</span>
          </div>
        </div>

        {/* Optional bank history import */}
        <OnboardingHistoryImport
          pendingRows={data.pendingImportRows || []}
          onChange={(rows) => onChange({ ...data, pendingImportRows: rows })}
        />

        {/* Preview */}
        {data.income > 0 && (
          <div className="mt-2 p-4 rounded-3xl border-[#4fae82]/25 bg-[#4fae82]/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] text-white/50">Ungefär kvar per månad</p>
                <p className={`text-[24px] font-semibold mt-1 tabular-nums ${(data.income - totalFixed) < 0 ? 'text-rose-300' : 'text-white'}`}>
                  {formatNumber(data.income - totalFixed)} kr
                </p>
                {totalFixed > 0 && (
                  <p className="text-[12px] text-white/45 mt-0.5">
                    {Math.round((totalFixed / data.income) * 100)}% till fasta kostnader
                  </p>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-white/30" />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-8">
        <button type="button" onClick={onBack} className={onboardingBackBtn}>
          Tillbaka
        </button>
        <button type="button" onClick={onNext} disabled={!isValid} className={`${onboardingPrimaryBtn} flex-1`}>
          Fortsätt
        </button>
      </div>
    </OnboardingStep>
  );
}