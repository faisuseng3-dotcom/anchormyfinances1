// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useTransactions } from '@/hooks/useTransactions';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import {
  Plus, X, Wallet, Home, PiggyBank, Target, LogOut, Shield, ChevronRight,
  RefreshCw, TrendingUp, Users, GitBranch, Info, Brain,
} from 'lucide-react';
import { ANCHOR_COACH_DISCLAIMER } from '@/lib/disclaimerCopy';
import PageShell, { GlassSection } from '@/components/layout/PageShell';
import {
  DashboardDivider,
  DashboardListRow,
  DashboardSection,
} from '@/components/dashboard/DashboardChrome';
import { sectionSubtitleClass } from '@/lib/anchorTheme';
import { copilotInputClass, copilotSecondaryBtnClass } from '@/lib/copilotTheme';
import { staggerItem } from '@/lib/motionPresets';
import { useModeContext } from '@/components/modes/ModeContext';
import InviteUserSection from '@/components/settings/InviteUserSection';
import DeleteAccountSection from '@/components/settings/DeleteAccountSection';
import GamificationSection from '@/components/goals/GamificationSection';
import ContextualLessonLink from '@/components/anchorBrain/ContextualLessonLink';
import AppStructurePanel from '@/components/settings/AppStructurePanel';
import BillingPlanSection from '@/components/settings/BillingPlanSection';
import AnchorAIStackPanel from '@/components/settings/AnchorAIStackPanel';
import { SettingsRowIcon } from '@/components/settings/SettingsPanel';
import PageShellSkeleton from '@/components/loading/PageShellSkeleton';
import DayPicker from '@/components/onboarding/DayPicker';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GoalVisualPicker from '@/components/goals/GoalVisualPicker';
import { validateSavingsGoal } from '@/lib/savingsGoalValidation';
import { toast } from 'sonner';
import { useCountUp } from '@/hooks/useCountUp';

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
        {Icon && <Icon className="w-3.5 h-3.5 text-[var(--color-accent)]" />}
        <Label className="anchor-type-body-sm text-white/50">{label}</Label>
      </div>
      {children}
    </div>
  );
}

function SettingsHero({ formData, formatNumber }) {
  const subCount = formData.subscriptions?.length || 0;
  const loanCount = formData.loans?.length || 0;
  const displayedIncome = useCountUp(formData.income || 0, 800);

  return (
    <div className="anchor-premium-hero">
      <div className="relative z-10 anchor-hero-asymmetric">
        <div className="min-w-0">
          <p className="anchor-type-body-sm text-white/45">Din profil</p>
          <div className="relative inline-block">
            <div
              className="absolute inset-[-10px_-16px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, rgba(79,174,130,0.22), transparent 70%)', filter: 'blur(6px)' }}
              aria-hidden="true"
            />
            <p className="relative anchor-type-headline text-[20px] mt-1 tabular-nums">
              {formatNumber(displayedIncome) || '0'} kr/mån
            </p>
          </div>
          <p className="anchor-type-body-sm mt-2">
            Buffert {formatNumber(formData.buffer) || '0'} kr · {subCount} abonnemang · {loanCount} lån
          </p>
        </div>
        <div className="w-12 h-12 rounded-[var(--anchor-radius-lg)] bg-[var(--color-accent)]/10 ring-1 ring-[var(--color-accent)]/20 flex items-center justify-center anchor-elev-1 shrink-0">
          <Wallet className="w-5 h-5 text-[var(--color-accent)]" />
        </div>
      </div>
    </div>
  );
}

function StaggerBlock({ index, children }) {
  return <motion.div {...staggerItem(index)}>{children}</motion.div>;
}

export default function Settings() {
  const queryClient = useQueryClient();
  const { isBusiness, setPersonal } = useModeContext();
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
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['financialProfile'] }); setSaving(false); },
  });

  const parseNumber = (v) => parseInt(v.replace(/\s/g, ''), 10) || 0;
  const formatNumber = (v) => (v ? v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '');

  const handleSave = async () => {
    if (formData.savingsGoal > 0) {
      const v = validateSavingsGoal({
        name: formData.savingsGoalName,
        amount: formData.savingsGoal,
        imageUrl: formData.savingsGoalVisualType === 'image' ? formData.savingsGoalImageUrl : null,
        iconId: formData.savingsGoalIcon,
        visualType: formData.savingsGoalVisualType,
      });
      if (!v.ok) {
        toast.error(v.errors[0]);
        return;
      }
    }
    setSaving(true);
    await updateProfile.mutateAsync(formData);
  };

  const addSubscription = () => {
    if (!newSub.name || !newSub.amount) return;
    const amount = parseInt(newSub.amount, 10);
    if (isNaN(amount) || amount <= 0) { toast.error('Ange ett giltigt belopp (> 0 kr).'); return; }
    setFormData((prev) => ({
      ...prev,
      subscriptions: [...(prev.subscriptions || []), {
        name: newSub.name,
        amount,
        category: newSub.category,
        billingDay: parseInt(newSub.billingDay, 10) || null,
        frequency: newSub.frequency,
      }],
    }));
    setNewSub({ name: '', amount: '', category: 'other', billingDay: '', frequency: 'monthly' });
    setShowAddSub(false);
  };

  const removeSubscription = (i) =>
    setFormData((prev) => ({ ...prev, subscriptions: prev.subscriptions.filter((_, idx) => idx !== i) }));

  const addLoan = async () => {
    if (!newLoan.name || !newLoan.totalAmount) return;
    if (parseNumber(newLoan.totalAmount) <= 0) { toast.error('Ange ett giltigt lånebelopp (> 0 kr).'); return; }
    if (newLoan.monthlyPayment && parseNumber(newLoan.monthlyPayment) <= 0) { toast.error('Månadsbetalning måste vara > 0 kr.'); return; }
    const updatedLoans = [...(formData.loans || []), {
      name: newLoan.name,
      totalAmount: parseNumber(newLoan.totalAmount),
      interestRate: parseFloat(newLoan.interestRate) || 0,
      monthlyPayment: parseNumber(newLoan.monthlyPayment),
    }];
    setFormData((prev) => ({ ...prev, loans: updatedLoans }));
    setNewLoan({ name: '', totalAmount: '', interestRate: '', monthlyPayment: '' });
    setShowAddLoan(false);
    if (isPersisted && profile?.id) {
      await base44.entities.FinancialProfile.update(profile.id, { loans: updatedLoans });
      queryClient.invalidateQueries({ queryKey: ['financialProfile'] });
    }
  };

  const removeLoan = async (i) => {
    const updatedLoans = formData.loans.filter((_, idx) => idx !== i);
    setFormData((prev) => ({ ...prev, loans: updatedLoans }));
    if (!isPersisted || !profile?.id) return;
    await base44.entities.FinancialProfile.update(profile.id, { loans: updatedLoans });
    queryClient.invalidateQueries({ queryKey: ['financialProfile'] });
  };

  if (isLoading) {
    return <PageShellSkeleton sections={4} />;
  }

  if (!profile || !formData) {
    return (
      <div className="min-h-full flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Ingen profil att visa än
          </p>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            Slutför uppstarten för att låsa upp inställningar.
          </p>
          <Link
            to={createPageUrl('Onboarding')}
            className="inline-flex px-6 py-3 rounded-full text-sm font-semibold"
            style={{ background: 'var(--color-accent)', color: '#08110c' }}
          >
            Kom igång
          </Link>
        </div>
      </div>
    );
  }

  const krSuffix = <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/40">kr</span>;

  return (
    <PageShell
      title="Inställningar"
      subtitle="Konto"
      action={
        <AnchorPressable
          type="button"
          minTouch={false}
          onClick={handleSave}
          disabled={saving}
          className="h-10 px-5 rounded-full bg-[var(--color-text-primary)] text-[#050d28] text-sm font-semibold disabled:opacity-40 anchor-elev-2 whitespace-nowrap"
        >
          {saving ? 'Sparar…' : 'Spara'}
        </AnchorPressable>
      }
    >
      <StaggerBlock index={0}>
        <SettingsHero formData={formData} formatNumber={formatNumber} />
      </StaggerBlock>

      <StaggerBlock index={1}>
        <BillingPlanSection />
      </StaggerBlock>

      <StaggerBlock index={2}>
        <GlassSection title="Budget">
          <div className="space-y-4">
            <FieldRow label="Månatlig nettoinkomst" icon={Wallet}>
              <div className="relative">
                <Input
                  type="text"
                  inputMode="numeric"
                  value={formatNumber(formData.income)}
                  onChange={(e) => setFormData({ ...formData, income: parseNumber(e.target.value) })}
                  className={`${copilotInputClass} pr-10`}
                />
                {krSuffix}
              </div>
            </FieldRow>
            <FieldRow label="Boendekostnad" icon={Home}>
              <div className="relative">
                <Input
                  type="text"
                  inputMode="numeric"
                  value={formatNumber(formData.housingCost)}
                  onChange={(e) => setFormData({ ...formData, housingCost: parseNumber(e.target.value) })}
                  className={`${copilotInputClass} pr-10`}
                />
                {krSuffix}
              </div>
            </FieldRow>
            <FieldRow label="Buffert" icon={PiggyBank}>
              <div className="relative">
                <Input
                  type="text"
                  inputMode="numeric"
                  value={formatNumber(formData.buffer)}
                  onChange={(e) => setFormData({ ...formData, buffer: parseNumber(e.target.value) })}
                  className={`${copilotInputClass} pr-10`}
                />
                {krSuffix}
              </div>
            </FieldRow>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FieldRow label="Sparmål (namn)" icon={Target}>
                <Input
                  placeholder="ex. Thailand-resa, Min första bil"
                  value={formData.savingsGoalName || ''}
                  onChange={(e) => setFormData({ ...formData, savingsGoalName: e.target.value })}
                  className={copilotInputClass}
                />
              </FieldRow>
              <FieldRow label="Belopp">
                <div className="relative">
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={formatNumber(formData.savingsGoal)}
                    onChange={(e) => setFormData({ ...formData, savingsGoal: parseNumber(e.target.value) })}
                    className={`${copilotInputClass} pr-10`}
                  />
                  {krSuffix}
                </div>
              </FieldRow>
            </div>
            {formData.savingsGoal > 0 && (
              <FieldRow label="Bild eller symbol för sparmålet">
                <GoalVisualPicker
                  imageUrl={formData.savingsGoalImageUrl}
                  iconId={formData.savingsGoalIcon || 'default'}
                  visualType={formData.savingsGoalVisualType}
                  previewPct={
                    formData.savingsGoal > 0 && formData.savingsCurrentBalance
                      ? Math.min(100, (formData.savingsCurrentBalance / formData.savingsGoal) * 100)
                      : 10
                  }
                  onChange={({ imageUrl, iconId, visualType }) =>
                    setFormData({
                      ...formData,
                      savingsGoalImageUrl: imageUrl,
                      savingsGoalIcon: iconId,
                      savingsGoalVisualType: visualType,
                    })
                  }
                />
              </FieldRow>
            )}
          </div>
        </GlassSection>
      </StaggerBlock>

      <StaggerBlock index={2}>
        <GlassSection title="Abonnemang">
          <div className="space-y-2">
            {(formData.subscriptions || []).map((sub, i) => (
              <React.Fragment key={i}>
                {i > 0 && <DashboardDivider />}
                <div className="flex items-center gap-3 py-3 min-h-12">
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-white">{sub.name}</p>
                    <p className="anchor-type-body-sm mt-0.5">
                      {categories.find((c) => c.id === sub.category)?.label || 'Övrigt'}
                      {sub.billingDay ? ` · dag ${sub.billingDay}` : ''}
                    </p>
                  </div>
                  <span className="text-[15px] font-semibold text-white tabular-nums">{sub.amount} kr</span>
                  <AnchorPressable
                    type="button"
                    minTouch={false}
                    onClick={() => removeSubscription(i)}
                    className="w-10 h-10 rounded-full bg-rose-500/15 text-rose-300 flex items-center justify-center"
                  >
                    <X className="w-3.5 h-3.5" />
                  </AnchorPressable>
                </div>
              </React.Fragment>
            ))}

            {showAddSub ? (
              <div className="py-4 space-y-3 border-t border-white/[0.08] mt-2">
                <Input placeholder="Namn" value={newSub.name} onChange={(e) => setNewSub({ ...newSub, name: e.target.value })} className={copilotInputClass} />
                <Input type="number" placeholder="Belopp (kr)" value={newSub.amount} onChange={(e) => setNewSub({ ...newSub, amount: e.target.value })} className={copilotInputClass} />
                <DayPicker value={parseInt(newSub.billingDay, 10) || 15} onChange={(d) => setNewSub({ ...newSub, billingDay: String(d) })} label="Dragningsdag" hint="Standard: 15" />
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={newSub.category} onValueChange={(v) => setNewSub({ ...newSub, category: v })}>
                    <SelectTrigger className={`${copilotInputClass} flex-1`}><SelectValue /></SelectTrigger>
                    <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={newSub.frequency} onValueChange={(v) => setNewSub({ ...newSub, frequency: v })}>
                    <SelectTrigger className={`${copilotInputClass} flex-1`}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Månad</SelectItem>
                      <SelectItem value="quarterly">Kvartal</SelectItem>
                      <SelectItem value="yearly">År</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <AnchorPressable type="button" minTouch={false} onClick={() => setShowAddSub(false)} className="flex-1 h-11 rounded-full text-sm font-semibold bg-white/[0.06] text-white/70 ring-1 ring-white/[0.1]">
                    Avbryt
                  </AnchorPressable>
                  <AnchorPressable type="button" minTouch={false} onClick={addSubscription} className="flex-1 h-11 rounded-full text-sm font-semibold bg-[var(--color-text-primary)] text-[#050d28] anchor-elev-1">
                    Lägg till
                  </AnchorPressable>
                </div>
              </div>
            ) : (
              <AnchorPressable
                type="button"
                onClick={() => setShowAddSub(true)}
                className="w-full flex items-center justify-center gap-2 py-3 min-h-12 text-[14px] font-medium text-white/55"
              >
                <Plus className="w-4 h-4" /> Lägg till abonnemang
              </AnchorPressable>
            )}
          </div>
        </GlassSection>
      </StaggerBlock>

      <StaggerBlock index={3}>
        <GlassSection title="Lån">
          {(formData.loans || []).length > 0 && (
            <ContextualLessonLink profile={formData} transactions={transactions} className="block mb-4" />
          )}
          <div className="space-y-2">
            {(formData.loans || []).map((loan, i) => (
              <React.Fragment key={i}>
                {i > 0 && <DashboardDivider />}
                <div className="flex items-center gap-3 py-3 min-h-12">
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-white">{loan.name}</p>
                    <p className="anchor-type-body-sm">
                      {loan.interestRate}% ränta · {formatNumber(loan.monthlyPayment)} kr/mån
                    </p>
                  </div>
                  <span className="text-[15px] font-semibold text-white tabular-nums">{formatNumber(loan.totalAmount)} kr</span>
                  <AnchorPressable
                    type="button"
                    minTouch={false}
                    onClick={() => removeLoan(i)}
                    className="w-10 h-10 rounded-full bg-rose-500/15 text-rose-300 flex items-center justify-center"
                  >
                    <X className="w-3.5 h-3.5" />
                  </AnchorPressable>
                </div>
              </React.Fragment>
            ))}

            {showAddLoan ? (
              <div className="py-4 space-y-3 border-t border-white/[0.08] mt-2">
                <Input placeholder="Namn på lån" value={newLoan.name} onChange={(e) => setNewLoan({ ...newLoan, name: e.target.value })} className={copilotInputClass} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input placeholder="Totalt (kr)" value={newLoan.totalAmount} onChange={(e) => setNewLoan({ ...newLoan, totalAmount: e.target.value })} className={copilotInputClass} />
                  <Input type="number" step="0.1" placeholder="Ränta %" value={newLoan.interestRate} onChange={(e) => setNewLoan({ ...newLoan, interestRate: e.target.value })} className={copilotInputClass} />
                </div>
                <Input placeholder="Månadskostnad (kr)" value={newLoan.monthlyPayment} onChange={(e) => setNewLoan({ ...newLoan, monthlyPayment: e.target.value })} className={copilotInputClass} />
                <div className="flex gap-2">
                  <AnchorPressable type="button" minTouch={false} onClick={() => setShowAddLoan(false)} className="flex-1 h-11 rounded-full text-sm font-semibold bg-white/[0.06] text-white/70 ring-1 ring-white/[0.1]">
                    Avbryt
                  </AnchorPressable>
                  <AnchorPressable type="button" minTouch={false} onClick={addLoan} className="flex-1 h-11 rounded-full text-sm font-semibold bg-[var(--color-warning)] text-[#050d28]">
                    Lägg till
                  </AnchorPressable>
                </div>
              </div>
            ) : (
              <AnchorPressable
                type="button"
                onClick={() => setShowAddLoan(true)}
                className="w-full flex items-center justify-center gap-2 py-3 min-h-12 text-[14px] font-medium text-white/55"
              >
                <Plus className="w-4 h-4" /> Lägg till lån
              </AnchorPressable>
            )}
          </div>
        </GlassSection>
      </StaggerBlock>

      <StaggerBlock index={4}>
        <AppStructurePanel />
      </StaggerBlock>

      <StaggerBlock index={5}>
        <AnchorAIStackPanel />
      </StaggerBlock>

      <StaggerBlock index={6}>
        <DashboardSection nested title="AI-minne">
          <DashboardListRow
            href={createPageUrl('AIMemoryProfile')}
            leading={<SettingsRowIcon icon={Brain} />}
            title="Min AI-profil"
            subtitle="Se, redigera och radera vad Lago kommer ihåg"
          />
        </DashboardSection>
      </StaggerBlock>

      <StaggerBlock index={7}>
        <DashboardSection nested title="Mer">
          <DashboardListRow
            href={createPageUrl('Galaxy')}
            leading={<SettingsRowIcon icon={GitBranch} />}
            title="Jämför"
            subtitle="Se hur andra fördelar lönen — publicera anonymt om du vill"
          />
          <DashboardDivider />
          <DashboardListRow
            href={createPageUrl('Social')}
            leading={<SettingsRowIcon icon={Users} muted />}
            title="Vänner & profil"
            subtitle="@användarnamn, vänner och integritet"
          />
          <DashboardDivider />
          <DashboardListRow
            href={`${createPageUrl('TransactionHistory')}?tab=insights`}
            leading={<SettingsRowIcon icon={TrendingUp} />}
            title="Historik & insikter"
            subtitle="Transaktioner, trender och kategorier"
          />
          <DashboardDivider />
          <DashboardListRow
            href={createPageUrl('SecurityInfo')}
            leading={<SettingsRowIcon icon={Shield} />}
            title="Säkerhet & data"
            subtitle="Hur vi skyddar din information"
          />
        </DashboardSection>
      </StaggerBlock>

      <StaggerBlock index={7}>
        <DashboardSection nested title="Utmaningar & poäng">
          <GamificationSection profile={profile} transactions={transactions} />
        </DashboardSection>
      </StaggerBlock>

      <StaggerBlock index={8}>
        <InviteUserSection />
      </StaggerBlock>

      <StaggerBlock index={9}>
        <GlassSection title="Om coachningen">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-[var(--color-accent)] flex-shrink-0 mt-0.5" />
            <div>
              <p className={`${sectionSubtitleClass} leading-relaxed`}>{ANCHOR_COACH_DISCLAIMER}</p>
              <Link
                to="/TermsOfService"
                className="inline-flex items-center gap-1 min-h-11 text-[13px] text-white/55 hover:text-white/80 mt-2 no-underline anchor-pressable"
              >
                Läs användarvillkor
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </GlassSection>
      </StaggerBlock>

      <div className="flex justify-center gap-4 sm:gap-6 py-2 flex-wrap">
        <Link to="/TermsOfService" className="text-xs text-white/45 hover:text-white/70 anchor-pressable px-2 py-1">Användarvillkor</Link>
        <Link to="/PrivacyPolicy" className="text-xs text-white/45 hover:text-white/70 anchor-pressable px-2 py-1">Integritetspolicy</Link>
      </div>

      {isBusiness && (
        <AnchorPressable
          type="button"
          onClick={() => {
            setPersonal();
            base44.auth.logout(window.location.origin);
          }}
          className={`w-full ${copilotSecondaryBtnClass} rounded-[var(--anchor-radius-lg)]`}
        >
          <span className="flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Logga ut och välj Personal
          </span>
        </AnchorPressable>
      )}

      <AnchorPressable
        type="button"
        onClick={() => base44.auth.logout(window.location.origin)}
        className="w-full min-h-12 rounded-[var(--anchor-radius-lg)] text-sm font-semibold text-rose-200 bg-rose-500/15 ring-1 ring-rose-400/25"
      >
        <span className="flex items-center justify-center gap-2">
          <LogOut className="w-4 h-4" /> Logga ut
        </span>
      </AnchorPressable>

      <DeleteAccountSection profile={profile} />
    </PageShell>
  );
}

export const pageSeo = pageSeoFor('Settings');
