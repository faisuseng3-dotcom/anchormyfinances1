import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, X, Wallet, Home, PiggyBank, Target, LogOut, Shield, ChevronRight, RefreshCw, TrendingUp } from 'lucide-react';
import { useModeContext } from '@/components/modes/ModeContext';
import InviteUserSection from '@/components/settings/InviteUserSection';
import DeleteAccountSection from '@/components/settings/DeleteAccountSection';
import GamificationSection from '@/components/gamification/GamificationSection';
import DayPicker from '@/components/onboarding/DayPicker';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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

function Section({ title, children }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--color-text-muted)' }}>{title}</p>
      {children}
    </div>
  );
}

function FieldRow({ label, icon: Icon, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />}
        <Label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{label}</Label>
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const queryClient = useQueryClient();
  const { isBusiness, setPersonal, setBusiness } = useModeContext();
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

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-created_date', 500)
  });

  useEffect(() => { if (profile) setFormData({ ...profile }); }, [profile]);

  const updateProfile = useMutation({
    mutationFn: async (data) => { await base44.entities.FinancialProfile.update(profile.id, data); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['financialProfile'] }); setSaving(false); }
  });

  const parseNumber = (v) => parseInt(v.replace(/\s/g, '')) || 0;
  const formatNumber = (v) => v ? v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '';

  const handleSave = async () => { setSaving(true); await updateProfile.mutateAsync(formData); };

  const addSubscription = () => {
    if (!newSub.name || !newSub.amount) return;
    setFormData(prev => ({
      ...prev,
      subscriptions: [...(prev.subscriptions || []), {
        name: newSub.name, amount: parseInt(newSub.amount),
        category: newSub.category, billingDay: parseInt(newSub.billingDay) || null, frequency: newSub.frequency,
      }]
    }));
    setNewSub({ name: '', amount: '', category: 'other', billingDay: '', frequency: 'monthly' });
    setShowAddSub(false);
  };

  const removeSubscription = (i) => setFormData(prev => ({ ...prev, subscriptions: prev.subscriptions.filter((_, idx) => idx !== i) }));

  const addLoan = async () => {
    if (!newLoan.name || !newLoan.totalAmount) return;
    const updatedLoans = [...(formData.loans || []), {
      name: newLoan.name, totalAmount: parseNumber(newLoan.totalAmount),
      interestRate: parseFloat(newLoan.interestRate) || 0, monthlyPayment: parseNumber(newLoan.monthlyPayment)
    }];
    setFormData(prev => ({ ...prev, loans: updatedLoans }));
    setNewLoan({ name: '', totalAmount: '', interestRate: '', monthlyPayment: '' });
    setShowAddLoan(false);
    await base44.entities.FinancialProfile.update(profile.id, { loans: updatedLoans });
    queryClient.invalidateQueries({ queryKey: ['financialProfile'] });
  };

  const removeLoan = async (i) => {
    const updatedLoans = formData.loans.filter((_, idx) => idx !== i);
    setFormData(prev => ({ ...prev, loans: updatedLoans }));
    await base44.entities.FinancialProfile.update(profile.id, { loans: updatedLoans });
    queryClient.invalidateQueries({ queryKey: ['financialProfile'] });
  };

  if (isLoading || !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-surface)', borderTopColor: 'var(--color-accent)' }} />
      </div>
    );
  }

  const inputStyle = "h-12 rounded-xl text-sm";

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--color-background-primary)' }}>
      {/* Header */}
      <div className="px-5 pt-8 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('Dashboard')}>
            <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
              <ArrowLeft className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
            </button>
          </Link>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Inställningar</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-opacity disabled:opacity-60"
          style={{ background: 'var(--color-accent)' }}
        >
          {saving ? 'Sparar...' : 'Spara'}
        </button>
      </div>

      <div className="px-5 space-y-4">
        {/* Budget */}
        <Section title="Budget">
          <div className="space-y-4">
            <FieldRow label="Månatlig nettoinkomst" icon={Wallet}>
              <div className="relative">
                <Input type="text" value={formatNumber(formData.income)}
                  onChange={(e) => setFormData({ ...formData, income: parseNumber(e.target.value) })}
                  className={inputStyle + " pr-10"} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--color-text-muted)' }}>kr</span>
              </div>
            </FieldRow>
            <FieldRow label="Boendekostnad" icon={Home}>
              <div className="relative">
                <Input type="text" value={formatNumber(formData.housingCost)}
                  onChange={(e) => setFormData({ ...formData, housingCost: parseNumber(e.target.value) })}
                  className={inputStyle + " pr-10"} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--color-text-muted)' }}>kr</span>
              </div>
            </FieldRow>
            <FieldRow label="Buffert" icon={PiggyBank}>
              <div className="relative">
                <Input type="text" value={formatNumber(formData.buffer)}
                  onChange={(e) => setFormData({ ...formData, buffer: parseNumber(e.target.value) })}
                  className={inputStyle + " pr-10"} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--color-text-muted)' }}>kr</span>
              </div>
            </FieldRow>
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Sparmål (namn)" icon={Target}>
                <Input placeholder="ex. Resa" value={formData.savingsGoalName || ''}
                  onChange={(e) => setFormData({ ...formData, savingsGoalName: e.target.value })}
                  className={inputStyle} />
              </FieldRow>
              <FieldRow label="Belopp">
                <div className="relative">
                  <Input type="text" value={formatNumber(formData.savingsGoal)}
                    onChange={(e) => setFormData({ ...formData, savingsGoal: parseNumber(e.target.value) })}
                    className={inputStyle + " pr-10"} />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--color-text-muted)' }}>kr</span>
                </div>
              </FieldRow>
            </div>
          </div>
        </Section>

        {/* Subscriptions */}
        <Section title="Abonnemang">
          <div className="space-y-2">
            {(formData.subscriptions || []).map((sub, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--color-surface)' }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{sub.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {categories.find(c => c.id === sub.category)?.label || 'Övrigt'}
                    {sub.billingDay ? ` · dag ${sub.billingDay}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{sub.amount} kr</span>
                  <button onClick={() => removeSubscription(i)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(217,95,95,0.15)' }}>
                    <X className="w-3.5 h-3.5" style={{ color: 'var(--color-danger)' }} />
                  </button>
                </div>
              </div>
            ))}

            {showAddSub ? (
              <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--color-surface)', border: '1px solid rgba(75,124,243,0.3)' }}>
                <Input placeholder="Namn" value={newSub.name} onChange={(e) => setNewSub({ ...newSub, name: e.target.value })} className="h-11 rounded-xl text-sm" />
                <Input type="number" placeholder="Belopp (kr)" value={newSub.amount} onChange={(e) => setNewSub({ ...newSub, amount: e.target.value })} className="h-11 rounded-xl text-sm" />
                <DayPicker value={parseInt(newSub.billingDay) || 15} onChange={(d) => setNewSub({ ...newSub, billingDay: String(d) })} label="Dragningsdag" hint="Standard: 15" />
                <div className="flex gap-2">
                  <Select value={newSub.category} onValueChange={(v) => setNewSub({ ...newSub, category: v })}>
                    <SelectTrigger className="h-11 rounded-xl flex-1 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={newSub.frequency} onValueChange={(v) => setNewSub({ ...newSub, frequency: v })}>
                    <SelectTrigger className="h-11 rounded-xl flex-1 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Månad</SelectItem>
                      <SelectItem value="quarterly">Kvartal</SelectItem>
                      <SelectItem value="yearly">År</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowAddSub(false)} className="flex-1 h-11 rounded-full text-sm font-semibold" style={{ background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text-secondary)' }}>Avbryt</button>
                  <button onClick={addSubscription} className="flex-1 h-11 rounded-full text-sm font-semibold text-white" style={{ background: 'var(--color-accent)' }}>Lägg till</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddSub(true)} className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-medium"
                style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1px dashed rgba(255,255,255,0.12)' }}>
                <Plus className="w-4 h-4" /> Lägg till abonnemang
              </button>
            )}
          </div>
        </Section>

        {/* Loans */}
        <Section title="Lån">
          <div className="space-y-2">
            {(formData.loans || []).map((loan, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--color-surface)' }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{loan.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{loan.interestRate}% ränta</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{formatNumber(loan.totalAmount)} kr</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{formatNumber(loan.monthlyPayment)} kr/mån</p>
                  </div>
                  <button onClick={() => removeLoan(i)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(217,95,95,0.15)' }}>
                    <X className="w-3.5 h-3.5" style={{ color: 'var(--color-danger)' }} />
                  </button>
                </div>
              </div>
            ))}

            {showAddLoan ? (
              <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--color-surface)', border: '1px solid rgba(200,146,58,0.3)' }}>
                <Input placeholder="Namn på lån" value={newLoan.name} onChange={(e) => setNewLoan({ ...newLoan, name: e.target.value })} className="h-11 rounded-xl text-sm" />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Totalt (kr)" value={newLoan.totalAmount} onChange={(e) => setNewLoan({ ...newLoan, totalAmount: e.target.value })} className="h-11 rounded-xl text-sm" />
                  <Input type="number" step="0.1" placeholder="Ränta %" value={newLoan.interestRate} onChange={(e) => setNewLoan({ ...newLoan, interestRate: e.target.value })} className="h-11 rounded-xl text-sm" />
                </div>
                <Input placeholder="Månadskostnad (kr)" value={newLoan.monthlyPayment} onChange={(e) => setNewLoan({ ...newLoan, monthlyPayment: e.target.value })} className="h-11 rounded-xl text-sm" />
                <div className="flex gap-2">
                  <button onClick={() => setShowAddLoan(false)} className="flex-1 h-11 rounded-full text-sm font-semibold" style={{ background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text-secondary)' }}>Avbryt</button>
                  <button onClick={addLoan} className="flex-1 h-11 rounded-full text-sm font-semibold text-white" style={{ background: 'var(--color-warning)' }}>Lägg till</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddLoan(true)} className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-medium"
                style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1px dashed rgba(255,255,255,0.12)' }}>
                <Plus className="w-4 h-4" /> Lägg till lån
              </button>
            )}
          </div>
        </Section>

        {/* Insights link */}
        <Link to="/Insights">
          <div className="flex items-center justify-between p-4 rounded-2xl cursor-pointer"
            style={{ background: 'linear-gradient(135deg, rgba(13,115,119,0.1), rgba(75,124,243,0.1))', border: '1px solid rgba(13,115,119,0.2)' }}>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5" style={{ color: '#0D7377' }} />
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Ekonomiska insikter</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Grafer & analys av din ekonomi</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          </div>
        </Link>

        {/* Gamification */}
        <div className="rounded-2xl p-5 space-y-3" style={{ background: 'var(--color-card)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Utmaningar & Poäng</p>
          <GamificationSection profile={profile} transactions={transactions} />
        </div>

        {/* Account */}
        <Section title="Konto">
          <div className="space-y-2">
            <Link to={createPageUrl('SecurityInfo')}>
              <div className="flex items-center justify-between p-3 rounded-xl cursor-pointer" style={{ background: 'var(--color-surface)' }}>
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Säkerhet & Data</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Hur vi skyddar din information</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
              </div>
            </Link>
          </div>
        </Section>

        {/* Invite */}
        <InviteUserSection />

        {/* Legal */}
        <div className="flex justify-center gap-6 py-2">
          <Link to="/TermsOfService" className="text-xs transition-colors" style={{ color: 'var(--color-text-muted)' }}>Användarvillkor</Link>
          <Link to="/PrivacyPolicy" className="text-xs transition-colors" style={{ color: 'var(--color-text-muted)' }}>Integritetspolicy</Link>
        </div>

        {/* Switch mode & logout */}
        <button
          onClick={() => {
            // Switch to other mode, then log out to gateway
            if (isBusiness) setPersonal(); else setBusiness();
            base44.auth.logout(window.location.origin);
          }}
          className="w-full h-14 rounded-full text-sm font-semibold transition-opacity"
          style={{ background: 'rgba(75,124,243,0.1)', color: 'var(--color-accent)', border: '1px solid rgba(75,124,243,0.3)' }}
        >
          <span className="flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Byt till {isBusiness ? 'Personal' : 'Business'} &amp; logga ut
          </span>
        </button>

        {/* Logout */}
        <button
          onClick={() => base44.auth.logout(window.location.origin)}
          className="w-full h-14 rounded-full text-sm font-semibold transition-opacity"
          style={{ background: 'rgba(217,95,95,0.12)', color: 'var(--color-danger)', border: '1px solid rgba(217,95,95,0.3)' }}
        >
          <span className="flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" /> Logga ut
          </span>
        </button>

        <DeleteAccountSection profile={profile} />
      </div>
    </div>
  );
}