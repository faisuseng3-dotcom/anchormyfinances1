import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, Landmark } from 'lucide-react';
import OnboardingStep from './OnboardingStep';
import { anchorInputClass } from '@/lib/anchorTheme';
import { onboardingFieldLabel } from './onboardingUi';

export default function LoansStep({ data, onChange, onNext, onBack }) {
  const [newLoan, setNewLoan] = useState({ name: '', totalAmount: '', interestRate: '', monthlyPayment: '', billingDay: '' });
  const [showForm, setShowForm] = useState(false);

  const formatNumber = (value) => {
    return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '';
  };

  const parseNumber = (value) => {
    return parseInt(value.replace(/\s/g, '')) || 0;
  };

  const addLoan = () => {
    if (newLoan.name && newLoan.totalAmount) {
      onChange({
        ...data,
        loans: [...(data.loans || []), {
          name: newLoan.name,
          totalAmount: parseNumber(newLoan.totalAmount),
          interestRate: parseFloat(newLoan.interestRate) || 0,
          monthlyPayment: parseNumber(newLoan.monthlyPayment),
          billingDay: parseInt(newLoan.billingDay) || null
        }]
      });
      setNewLoan({ name: '', totalAmount: '', interestRate: '', monthlyPayment: '', billingDay: '' });
      setShowForm(false);
    }
  };

  const removeLoan = (index) => {
    const newLoans = [...data.loans];
    newLoans.splice(index, 1);
    onChange({ ...data, loans: newLoans });
  };

  const totalDebt = (data.loans || []).reduce((sum, l) => sum + l.totalAmount, 0);
  const totalMonthly = (data.loans || []).reduce((sum, l) => sum + l.monthlyPayment, 0);

  return (
    <OnboardingStep
      step={2}
      totalSteps={5}
      title="Lån & krediter"
      subtitle="Har du några lån? Lägg till dem så kan vi hjälpa dig optimera."
    >
      <div className="space-y-4">
        {/* Existing loans */}
        {(data.loans || []).map((loan, i) => (
          <div
            key={i}
            className="p-4 dark-card"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <Landmark className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.7)' }} />
                </div>
                <div>
                  <p className="font-medium text-white">{loan.name}</p>
                  <p className="text-sm text-white/45">{loan.interestRate}% ränta</p>
                </div>
              </div>
              <button
                onClick={() => removeLoan(i)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-white/45" />
              </button>
            </div>
            <div className="flex justify-between text-sm">
              <div>
                <p className="text-white/45">Totalt</p>
                <p className="font-semibold text-white">{formatNumber(loan.totalAmount)} kr</p>
              </div>
              <div className="text-right">
                <p className="text-white/45">Månadskostnad</p>
                <p className="font-semibold text-white">{formatNumber(loan.monthlyPayment)} kr</p>
              </div>
            </div>
          </div>
        ))}

        {/* Add new form */}
        {showForm ? (
          <div className="p-4 dark-card rounded-xl space-y-4">
            <div>
              <label className={`${onboardingFieldLabel} block mb-1`}>Namn på lån</label>
              <Input
                placeholder="t.ex. Billån, CSN, Privatlån"
                value={newLoan.name}
                onChange={(e) => setNewLoan({ ...newLoan, name: e.target.value })}
                className={anchorInputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`${onboardingFieldLabel} block mb-1`}>Totalt belopp</label>
                <Input
                  type="text"
                  placeholder="100 000"
                  value={newLoan.totalAmount}
                  onChange={(e) => setNewLoan({ ...newLoan, totalAmount: e.target.value })}
                  className={anchorInputClass}
                />
              </div>
              <div>
                <label className={`${onboardingFieldLabel} block mb-1`}>Ränta %</label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="5.5"
                  value={newLoan.interestRate}
                  onChange={(e) => setNewLoan({ ...newLoan, interestRate: e.target.value })}
                  className={anchorInputClass}
                />
              </div>
            </div>
            <div>
              <label className={`${onboardingFieldLabel} block mb-1`}>Månadskostnad</label>
              <Input
                type="text"
                placeholder="2 500"
                value={newLoan.monthlyPayment}
                onChange={(e) => setNewLoan({ ...newLoan, monthlyPayment: e.target.value })}
                className={anchorInputClass}
              />
            </div>
            <div>
              <label className={`${onboardingFieldLabel} block mb-1`}>Förfallodag (1–31)</label>
              <Input
                type="number"
                placeholder="t.ex. 25"
                min="1"
                max="31"
                value={newLoan.billingDay}
                onChange={(e) => setNewLoan({ ...newLoan, billingDay: e.target.value })}
                className={anchorInputClass}
              />
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
                onClick={addLoan}
                className="flex-1 h-11 rounded-lg"
                style={{ background: '#4fae82', color: '#08110c' }}
              >
                Lägg till
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full p-4 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center gap-2 text-white/45 hover:border-[#4fae82]/50 hover:text-[#4fae82] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Lägg till lån
          </button>
        )}

        {/* Summary */}
        {totalDebt > 0 && (
          <div className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(226,133,122,0.08)', border: '1px solid rgba(226,133,122,0.15)' }}>
            <div className="flex justify-between items-center">
              <span style={{ color: '#e2857a' }}>Total skuld</span>
              <span className="font-semibold" style={{ color: '#e2857a' }}>{formatNumber(totalDebt)} kr</span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: '#e2857a' }}>Månadskostnad lån</span>
              <span className="font-semibold" style={{ color: '#e2857a' }}>{formatNumber(totalMonthly)} kr/mån</span>
            </div>
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
          className="flex-1 h-14 rounded-xl"
          style={{ background: '#4fae82', color: '#08110c' }}
        >
          {(data.loans || []).length === 0 ? 'Hoppa över' : 'Fortsätt'}
        </Button>
      </div>
    </OnboardingStep>
  );
}