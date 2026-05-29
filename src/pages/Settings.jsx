import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useTransactions } from '@/hooks/useTransactions';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Plus, X, Wallet, Home, PiggyBank, Target, LogOut, Shield, ChevronRight, RefreshCw, TrendingUp, Users } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import {
  DashboardDivider,
  DashboardListRow,
  DashboardSection,
} from '@/components/dashboard/DashboardChrome';
import {
  anchorInputClass,
  anchorPrimaryButtonClass,
  anchorSecondaryButtonClass,
  sectionSubtitleClass,
} from '@/lib/anchorTheme';
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

function FieldRow({ label, icon: Icon, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-3.5 h-3.5 text-[#9FB5FF]" />}
        <Label className="text-[13px] font-medium text-white/50">{label}</Label>
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

  const { profile, isLoading, isPersisted } = useFinancialProfile();
  const { transactions = [] } = useTransactions();

  useEffect(() => { if (profile) setFormData({ ...profile }); }, [profile]);

  const updateProfile = useMutation({
    mutationFn: async (data) => {
      if (!isPersisted || !profile?.id) return;
      await base44.entities.FinancialProfile.update(profile.id, data);
    },
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
    if (isPersisted && profile?.id) {
      await base44.entities.FinancialProfile.update(profile.id, { loans: updatedLoans });
      queryClient.invalidateQueries({ queryKey: ['financialProfile'] });
    }
  };

  const removeLoan = async (i) => {
    const updatedLoans = formData.loans.filter((_, idx) => idx !== i);
    setFormData(prev => ({ ...prev, loans: updatedLoans }));
    if (!isPersisted || !profile?.id) return;
    await base44.entities.FinancialProfile.update(profile.id, { loans: updatedLoans });
    queryClient.invalidateQueries({ queryKey: ['financialProfile'] });
  };

  if (isLoading || !formData) {
    return (
      <div className="anchor-page min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 rounded-full animate-spin border-white/20 border-t-white/80" />
      </div>
    );
  }

  const inputStyle = anchorInputClass;

  return (
    <PageShell
      title="Inställningar"
      subtitle="Konto"
      backHref={createPageUrl('Dashboard')}
      action={
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={`${anchorPrimaryButtonClass} !h-10 !px-5 !text-sm whitespace-nowrap`}
        >
          {saving ? 'Sparar...' : 'Spara'}
        </button>
      }
    >
        <DashboardSection nested title="Budget">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        </DashboardSection>

        <DashboardSection nested title="Abonnemang">
          <div className="space-y-2">
            {(formData.subscriptions || []).map((sub, i) => (
              <React.Fragment key={i}>
                {i > 0 && <DashboardDivider />}
                <div className="flex items-center gap-3 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-white">{sub.name}</p>
                    <p className="text-[13px] text-white/45 mt-0.5">
                      {categories.find(c => c.id === sub.category)?.label || 'Övrigt'}
                      {sub.billingDay ? ` · dag ${sub.billingDay}` : ''}
                    </p>
                  </div>
                  <span className="text-[15px] font-semibold text-white tabular-nums">{sub.amount} kr</span>
                  <button type="button" onClick={() => removeSubscription(i)} className="w-8 h-8 rounded-full flex items-center justify-center bg-rose-500/15 text-rose-300">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </React.Fragment>
            ))}

            {showAddSub ? (
              <div className="py-4 space-y-3 border-t border-white/[0.08] mt-2">
                <Input placeholder="Namn" value={newSub.name} onChange={(e) => setNewSub({ ...newSub, name: e.target.value })} className="h-11 rounded-xl text-sm" />
                <Input type="number" placeholder="Belopp (kr)" value={newSub.amount} onChange={(e) => setNewSub({ ...newSub, amount: e.target.value })} className="h-11 rounded-xl text-sm" />
                <DayPicker value={parseInt(newSub.billingDay) || 15} onChange={(d) => setNewSub({ ...newSub, billingDay: String(d) })} label="Dragningsdag" hint="Standard: 15" />
                <div className="flex flex-col sm:flex-row gap-2">
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
                <div className="flex flex-col sm:flex-row gap-2">
                  <button onClick={() => setShowAddSub(false)} className="flex-1 h-11 rounded-full text-sm font-semibold" style={{ background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text-secondary)' }}>Avbryt</button>
                  <button onClick={addSubscription} className="flex-1 h-11 rounded-full text-sm font-semibold text-white" style={{ background: 'var(--color-accent)' }}>Lägg till</button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setShowAddSub(true)} className="w-full flex items-center justify-center gap-2 py-3 text-[14px] font-medium text-white/55 hover:text-white/80">
                <Plus className="w-4 h-4" /> Lägg till abonnemang
              </button>
            )}
          </div>
        </DashboardSection>

        <DashboardSection nested title="Lån">
          <div className="space-y-2">
            {(formData.loans || []).map((loan, i) => (
              <React.Fragment key={i}>
                {i > 0 && <DashboardDivider />}
                <div className="flex items-center gap-3 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-white">{loan.name}</p>
                    <p className="text-[13px] text-white/45">{loan.interestRate}% ränta · {formatNumber(loan.monthlyPayment)} kr/mån</p>
                  </div>
                  <span className="text-[15px] font-semibold text-white tabular-nums">{formatNumber(loan.totalAmount)} kr</span>
                  <button type="button" onClick={() => removeLoan(i)} className="w-8 h-8 rounded-full flex items-center justify-center bg-rose-500/15 text-rose-300">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </React.Fragment>
            ))}

            {showAddLoan ? (
              <div className="py-4 space-y-3 border-t border-white/[0.08] mt-2">
                <Input placeholder="Namn på lån" value={newLoan.name} onChange={(e) => setNewLoan({ ...newLoan, name: e.target.value })} className="h-11 rounded-xl text-sm" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input placeholder="Totalt (kr)" value={newLoan.totalAmount} onChange={(e) => setNewLoan({ ...newLoan, totalAmount: e.target.value })} className="h-11 rounded-xl text-sm" />
                  <Input type="number" step="0.1" placeholder="Ränta %" value={newLoan.interestRate} onChange={(e) => setNewLoan({ ...newLoan, interestRate: e.target.value })} className="h-11 rounded-xl text-sm" />
                </div>
                <Input placeholder="Månadskostnad (kr)" value={newLoan.monthlyPayment} onChange={(e) => setNewLoan({ ...newLoan, monthlyPayment: e.target.value })} className="h-11 rounded-xl text-sm" />
                <div className="flex flex-col sm:flex-row gap-2">
                  <button onClick={() => setShowAddLoan(false)} className="flex-1 h-11 rounded-full text-sm font-semibold" style={{ background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text-secondary)' }}>Avbryt</button>
                  <button onClick={addLoan} className="flex-1 h-11 rounded-full text-sm font-semibold text-white" style={{ background: 'var(--color-warning)' }}>Lägg till</button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setShowAddLoan(true)} className="w-full flex items-center justify-center gap-2 py-3 text-[14px] font-medium text-white/55 hover:text-white/80">
                <Plus className="w-4 h-4" /> Lägg till lån
              </button>
            )}
          </div>
        </DashboardSection>

        <DashboardSection nested title="Mer">
          <DashboardListRow
            href="/Social"
            leading={<Users className="w-5 h-5 text-[#9FB5FF]" />}
            title="Anchor Social"
            subtitle="Profil, vänner & integritet"
          />
          <DashboardDivider />
          <DashboardListRow
            href={`${createPageUrl('TransactionHistory')}?tab=insights`}
            leading={<TrendingUp className="w-5 h-5 text-[#9FB5FF]" />}
            title="Ekonomiska insikter"
            subtitle="Kategorier & trender"
          />
          <DashboardDivider />
          <DashboardListRow
            href={createPageUrl('SecurityInfo')}
            leading={<Shield className="w-5 h-5 text-[#9FB5FF]" />}
            title="Säkerhet & data"
            subtitle="Hur vi skyddar din information"
          />
        </DashboardSection>

        <DashboardSection nested title="Utmaningar & poäng">
          <GamificationSection profile={profile} transactions={transactions} />
        </DashboardSection>

        {/* Invite */}
        <InviteUserSection />

        {/* Legal */}
        <div className="flex justify-center gap-4 sm:gap-6 py-2 flex-wrap">
          <Link to="/TermsOfService" className="text-xs text-white/45 hover:text-white/70 transition-colors">Användarvillkor</Link>
          <Link to="/PrivacyPolicy" className="text-xs text-white/45 hover:text-white/70 transition-colors">Integritetspolicy</Link>
        </div>

        <button
          type="button"
          onClick={() => {
            if (isBusiness) setPersonal(); else setBusiness();
            base44.auth.logout(window.location.origin);
          }}
          className={`w-full ${anchorSecondaryButtonClass}`}
        >
          <span className="flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Byt till {isBusiness ? 'Personal' : 'Business'} &amp; logga ut
          </span>
        </button>

        <button
          type="button"
          onClick={() => base44.auth.logout(window.location.origin)}
          className="w-full h-14 rounded-2xl text-sm font-semibold text-red-200 bg-red-500/15 border border-red-400/25 hover:bg-red-500/25 transition-colors"
        >
          <span className="flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" /> Logga ut
          </span>
        </button>

        <DeleteAccountSection profile={profile} />
    </PageShell>
  );
}