import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Trash2, Plus, X, Wallet, Home, PiggyBank, Target, LogOut } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categories = [
  { id: 'entertainment', label: 'Nöje' },
  { id: 'transport', label: 'Transport' },
  { id: 'health', label: 'Hälsa' },
  { id: 'streaming', label: 'Streaming' },
  { id: 'food', label: 'Mat' },
  { id: 'insurance', label: 'Försäkring' },
  { id: 'other', label: 'Övrigt' },
];

export default function Settings() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newSub, setNewSub] = useState({ name: '', amount: '', category: 'other', billingDay: '', frequency: 'monthly' });
  const [showAddSub, setShowAddSub] = useState(false);
  const [newLoan, setNewLoan] = useState({ name: '', totalAmount: '', interestRate: '', monthlyPayment: '' });
  const [showAddLoan, setShowAddLoan] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['financialProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.FinancialProfile.list();
      return profiles[0] || null;
    }
  });

  useEffect(() => {
    if (profile) {
      setFormData({ ...profile });
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: async (data) => {
      await base44.entities.FinancialProfile.update(profile.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialProfile'] });
      setSaving(false);
    }
  });

  const formatNumber = (value) => {
    return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '';
  };

  const parseNumber = (value) => {
    return parseInt(value.replace(/\s/g, '')) || 0;
  };

  const handleSave = async () => {
    setSaving(true);
    await updateProfile.mutateAsync(formData);
  };

  const addSubscription = () => {
    if (newSub.name && newSub.amount) {
      setFormData(prev => ({
        ...prev,
        subscriptions: [...(prev.subscriptions || []), {
          name: newSub.name,
          amount: parseInt(newSub.amount),
          category: newSub.category,
          billingDay: parseInt(newSub.billingDay) || null,
          frequency: newSub.frequency,
        }]
      }));
      setNewSub({ name: '', amount: '', category: 'other', billingDay: '', frequency: 'monthly' });
      setShowAddSub(false);
    }
  };

  const removeSubscription = (index) => {
    setFormData(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.filter((_, i) => i !== index)
    }));
  };

  const addLoan = () => {
    if (newLoan.name && newLoan.totalAmount) {
      setFormData(prev => ({
        ...prev,
        loans: [...(prev.loans || []), {
          name: newLoan.name,
          totalAmount: parseNumber(newLoan.totalAmount),
          interestRate: parseFloat(newLoan.interestRate) || 0,
          monthlyPayment: parseNumber(newLoan.monthlyPayment)
        }]
      }));
      setNewLoan({ name: '', totalAmount: '', interestRate: '', monthlyPayment: '' });
      setShowAddLoan(false);
    }
  };

  const removeLoan = (index) => {
    setFormData(prev => ({
      ...prev,
      loans: prev.loans.filter((_, i) => i !== index)
    }));
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  if (isLoading || !formData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-white">Inställningar</h1>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-emerald-500 hover:bg-emerald-600 rounded-xl"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Sparar...' : 'Spara'}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Basic info */}
          <div className="dark-card p-5">
            <h3 className="font-semibold text-white mb-4">Grundläggande</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-600 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-500" />
                  Månatlig nettoinkomst
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    value={formatNumber(formData.income)}
                    onChange={(e) => setFormData({ ...formData, income: parseNumber(e.target.value) })}
                    className="h-12 pr-12 rounded-xl"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">kr</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600 flex items-center gap-2">
                  <Home className="w-4 h-4 text-emerald-500" />
                  Boendekostnad
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    value={formatNumber(formData.housingCost)}
                    onChange={(e) => setFormData({ ...formData, housingCost: parseNumber(e.target.value) })}
                    className="h-12 pr-12 rounded-xl"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">kr</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600 flex items-center gap-2">
                  <PiggyBank className="w-4 h-4 text-emerald-500" />
                  Buffert
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    value={formatNumber(formData.buffer)}
                    onChange={(e) => setFormData({ ...formData, buffer: parseNumber(e.target.value) })}
                    className="h-12 pr-12 rounded-xl"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">kr</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-600 flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-500" />
                    Sparmål
                  </Label>
                  <Input
                    placeholder="Namn"
                    value={formData.savingsGoalName || ''}
                    onChange={(e) => setFormData({ ...formData, savingsGoalName: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600">Belopp</Label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={formatNumber(formData.savingsGoal)}
                      onChange={(e) => setFormData({ ...formData, savingsGoal: parseNumber(e.target.value) })}
                      className="h-12 pr-12 rounded-xl"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">kr</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subscriptions */}
          <div className="dark-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Abonnemang</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddSub(true)}
                className="rounded-lg"
              >
                <Plus className="w-4 h-4 mr-1" />
                Lägg till
              </Button>
            </div>

            <div className="space-y-2">
              {(formData.subscriptions || []).map((sub, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                >
                  <div>
                    <p className="font-medium text-white">{sub.name}</p>
                    <p className="text-sm text-slate-400">
                      {categories.find(c => c.id === sub.category)?.label || 'Övrigt'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-white">{sub.amount} kr</span>
                    <button
                      onClick={() => removeSubscription(i)}
                      className="p-1 hover:bg-slate-200 rounded-lg"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              ))}

              {showAddSub && (
                <div className="p-4 bg-emerald-50 rounded-xl space-y-3">
                  <Input
                    placeholder="Namn"
                    value={newSub.name}
                    onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
                    className="h-10 rounded-lg"
                  />
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Belopp"
                      value={newSub.amount}
                      onChange={(e) => setNewSub({ ...newSub, amount: e.target.value })}
                      className="h-10 rounded-lg flex-1"
                    />
                    <Select
                      value={newSub.category}
                      onValueChange={(val) => setNewSub({ ...newSub, category: val })}
                    >
                      <SelectTrigger className="w-32 h-10 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddSub(false)}
                      className="flex-1 h-10 rounded-lg"
                    >
                      Avbryt
                    </Button>
                    <Button
                      onClick={addSubscription}
                      className="flex-1 h-10 rounded-lg bg-emerald-500 hover:bg-emerald-600"
                    >
                      Lägg till
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Loans */}
          <div className="dark-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Lån</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddLoan(true)}
                className="rounded-lg"
              >
                <Plus className="w-4 h-4 mr-1" />
                Lägg till
              </Button>
            </div>

            <div className="space-y-2">
              {(formData.loans || []).map((loan, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                >
                  <div>
                    <p className="font-medium text-white">{loan.name}</p>
                    <p className="text-sm text-slate-400">
                      {loan.interestRate}% ränta
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-medium text-white">{formatNumber(loan.totalAmount)} kr</p>
                      <p className="text-xs text-slate-400">{formatNumber(loan.monthlyPayment)} kr/mån</p>
                    </div>
                    <button
                      onClick={() => removeLoan(i)}
                      className="p-1 hover:bg-slate-200 rounded-lg"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              ))}

              {showAddLoan && (
                <div className="p-4 bg-amber-50 rounded-xl space-y-3">
                  <Input
                    placeholder="Namn på lån"
                    value={newLoan.name}
                    onChange={(e) => setNewLoan({ ...newLoan, name: e.target.value })}
                    className="h-10 rounded-lg"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Totalt belopp"
                      value={newLoan.totalAmount}
                      onChange={(e) => setNewLoan({ ...newLoan, totalAmount: e.target.value })}
                      className="h-10 rounded-lg"
                    />
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Ränta %"
                      value={newLoan.interestRate}
                      onChange={(e) => setNewLoan({ ...newLoan, interestRate: e.target.value })}
                      className="h-10 rounded-lg"
                    />
                  </div>
                  <Input
                    placeholder="Månadskostnad"
                    value={newLoan.monthlyPayment}
                    onChange={(e) => setNewLoan({ ...newLoan, monthlyPayment: e.target.value })}
                    className="h-10 rounded-lg"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddLoan(false)}
                      className="flex-1 h-10 rounded-lg"
                    >
                      Avbryt
                    </Button>
                    <Button
                      onClick={addLoan}
                      className="flex-1 h-10 rounded-lg bg-amber-500 hover:bg-amber-600"
                    >
                      Lägg till
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Logout */}
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full h-14 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logga ut
          </Button>
        </div>
      </div>
    </div>
  );
}