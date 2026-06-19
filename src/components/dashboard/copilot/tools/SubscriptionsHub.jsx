// @ts-nocheck
import React, { useMemo, useState, useCallback } from 'react';
import { Lightbulb, CalendarClock, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSubscriptionTotal, fmtKr } from '../copilotDashboardUtils';
import {
  getUnusedStreamingSubs,
  getWeeklyActiveSubs,
  getUpcomingSubscriptions,
} from './subscriptionUtils';
import { staggerItem } from '@/lib/motionPresets';
import { copilotInputClass, copilotChipClass } from '@/lib/copilotTheme';
import { SUBSCRIPTION_CATEGORIES, subscriptionCategoryLabel } from '@/lib/subscriptionCategories';
import { getCategoryTint } from '@/lib/copilotTheme';
import { CategoryIcon } from '@/lib/anchorIcons';
import CopilotToolShell from './CopilotToolShell';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';
import DayPicker from '@/components/onboarding/DayPicker';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { triggerHaptic } from '@/lib/haptics';
import { toast } from 'sonner';

const EMPTY_FORM = { name: '', amount: '', category: 'streaming', billingDay: '15', frequency: 'monthly' };

function SubscriptionCard({
  sub,
  index,
  variant = 'list',
  onEdit,
  onRemove,
  saving,
}) {
  const tint = getCategoryTint(sub.category === 'streaming' ? 'subscription' : sub.category || 'other');

  return (
    <motion.div
      {...staggerItem(index)}
      className="organic-surface organic-surface--sm rounded-3xl p-4 flex items-center gap-3"
      style={{ background: 'var(--copilot-bg-card)' }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: tint.bg, boxShadow: 'var(--anchor-shadow-1)' }}
      >
        <CategoryIcon category={sub.category || 'subscription'} size={20} color={tint.accent} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium text-white truncate">{sub.name}</p>
        <p className="text-[12px] text-[var(--copilot-text-muted)] mt-0.5">
          {variant === 'upcoming' && sub.nextDate
            ? `Dras ${sub.nextDate.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })}`
            : `${subscriptionCategoryLabel(sub.category)}${sub.billingDay ? ` · dag ${sub.billingDay}` : ''}`}
        </p>
      </div>
      <p className="text-[15px] font-semibold text-white tabular-nums shrink-0 mr-1">
        {fmtKr(sub.amount || 0)}
      </p>
      {variant === 'list' && (
        <div className="flex items-center gap-1 shrink-0">
          <AnchorPressable
            type="button"
            onClick={() => { triggerHaptic('light'); onEdit?.(index); }}
            className="w-12 h-12 rounded-full bg-white/[0.06] text-white/70 hover:text-white hover:bg-white/[0.1] active:scale-[0.97]"
            aria-label={`Redigera ${sub.name}`}
          >
            <Pencil className="w-4 h-4" />
          </AnchorPressable>
          <AnchorPressable
            type="button"
            onClick={() => { triggerHaptic('medium'); onRemove?.(index); }}
            disabled={saving}
            className="w-12 h-12 rounded-full bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 active:scale-[0.97] disabled:opacity-40"
            aria-label={`Ta bort ${sub.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </AnchorPressable>
        </div>
      )}
    </motion.div>
  );
}

export default function SubscriptionsHub({ profile, transactions, updateProfile }) {
  const subs = profile?.subscriptions || [];
  const total = getSubscriptionTotal(profile);
  const [showAdd, setShowAdd] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const weeklyActive = useMemo(
    () => getWeeklyActiveSubs(profile, transactions),
    [profile, transactions],
  );
  const upcoming = useMemo(() => getUpcomingSubscriptions(profile, 6), [profile]);
  const unused = useMemo(
    () => getUnusedStreamingSubs(profile, transactions),
    [profile, transactions],
  );

  const persist = useCallback(async (nextSubs) => {
    if (!updateProfile?.mutateAsync) return;
    setSaving(true);
    try {
      await updateProfile.mutateAsync({ subscriptions: nextSubs });
      triggerHaptic('success');
    } catch {
      toast.error('Kunde inte spara prenumerationer');
    } finally {
      setSaving(false);
    }
  }, [updateProfile]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setShowAdd(false);
    setEditIndex(null);
  };

  const startEdit = (index) => {
    const sub = subs[index];
    if (!sub) return;
    setEditIndex(index);
    setShowAdd(false);
    setForm({
      name: sub.name || '',
      amount: String(sub.amount || ''),
      category: sub.category || 'other',
      billingDay: String(sub.billingDay || 15),
      frequency: sub.frequency || 'monthly',
    });
  };

  const handleSave = async () => {
    if (!form.name?.trim() || !form.amount) {
      toast.error('Fyll i namn och belopp');
      return;
    }
    const entry = {
      name: form.name.trim(),
      amount: parseInt(String(form.amount).replace(/\s/g, ''), 10) || 0,
      category: form.category || 'other',
      billingDay: parseInt(form.billingDay, 10) || null,
      frequency: form.frequency || 'monthly',
    };
    const next = [...subs];
    if (editIndex != null) {
      next[editIndex] = { ...next[editIndex], ...entry };
    } else {
      next.push(entry);
    }
    await persist(next);
    resetForm();
  };

  const handleRemove = async (index) => {
    const next = subs.filter((_, i) => i !== index);
    await persist(next);
    if (editIndex === index) resetForm();
  };

  return (
    <CopilotToolShell
      title="Prenumerationer"
      subtitle="Hantera dina abonnemang — se tysta utgifter och optimera det som inte ger värde."
      action={
        <AnchorPressable
          type="button"
          onClick={() => { triggerHaptic('light'); setShowAdd(true); setEditIndex(null); setForm(EMPTY_FORM); }}
          className="h-12 px-5 rounded-full bg-gradient-to-r from-[#4a7aff] to-[#6d4aff] text-white text-[14px] font-semibold shadow-[0_8px_32px_rgba(74,122,255,0.35)] active:scale-[0.97]"
        >
          <Plus className="w-4 h-4 mr-1.5 inline" />
          Lägg till
        </AnchorPressable>
      }
    >
      <div
        className="anchor-premium-hero organic-surface--hero rounded-3xl p-6 mb-8"
        style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.16) 0%, rgba(74,122,255,0.1) 100%)' }}
      >
        <h2 className="anchor-card-title">Tysta utgifter</h2>
        <p className="text-[36px] font-bold text-white tabular-nums leading-none mt-2">
          {fmtKr(total)}
          <span className="text-[16px] font-medium text-[var(--copilot-text-secondary)] ml-2">/mån</span>
        </p>
        <p className="text-[13px] text-[var(--copilot-text-secondary)] mt-3">
          {subs.length} abonnemang registrerade
        </p>
        {unused.length > 0 && (
          <p className="text-[13px] text-[var(--copilot-text-secondary)] mt-4 flex items-start gap-2 leading-relaxed">
            <Lightbulb className="w-4 h-4 text-[var(--copilot-accent-green)] shrink-0 mt-0.5" />
            <span>
              Tips: {unused.length} strömningstjänst{unused.length > 1 ? 'er' : ''} verkar oanvända
              på 14 dagar — värt att granska.
            </span>
          </p>
        )}
      </div>

      <section className="mb-8">
        <h2 className="anchor-card-title mb-3">
          Dina abonnemang
        </h2>
        <div className="space-y-3">
          {subs.length === 0 ? (
            <div className="organic-surface organic-surface--sm rounded-3xl p-8 text-center">
              <p className="text-[14px] text-[var(--copilot-text-muted)]">
                Inga prenumerationer ännu. Tryck på &quot;Lägg till&quot; ovan.
              </p>
            </div>
          ) : (
            subs.map((sub, i) => (
              <SubscriptionCard
                key={`${sub.name}-${i}`}
                sub={sub}
                index={i}
                onEdit={startEdit}
                onRemove={handleRemove}
                saving={saving}
              />
            ))
          )}
        </div>
      </section>

      <AnimatePresence>
        {(showAdd || editIndex != null) && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="organic-surface organic-surface--hero rounded-3xl p-5 mb-8"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-[15px] font-semibold text-white">
                {editIndex != null ? 'Redigera abonnemang' : 'Nytt abonnemang'}
              </h3>
              <AnchorPressable
                type="button"
                onClick={resetForm}
                className="w-12 h-12 rounded-full bg-white/[0.06] text-white/60 active:scale-[0.97]"
                aria-label="Stäng formulär"
              >
                <X className="w-4 h-4" />
              </AnchorPressable>
            </div>
            <div className="space-y-3">
              <Input
                placeholder="Namn, t.ex. Netflix"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={copilotInputClass}
              />
              <Input
                type="number"
                placeholder="Belopp (kr/mån)"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className={copilotInputClass}
              />
              <DayPicker
                value={parseInt(form.billingDay, 10) || 15}
                onChange={(d) => setForm((f) => ({ ...f, billingDay: String(d) }))}
                label="Dragningsdag"
                hint="Standard: 15"
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger className={`${copilotInputClass} flex-1`}>
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBSCRIPTION_CATEGORIES.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={form.frequency} onValueChange={(v) => setForm((f) => ({ ...f, frequency: v }))}>
                  <SelectTrigger className={`${copilotInputClass} flex-1`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Månad</SelectItem>
                    <SelectItem value="quarterly">Kvartal</SelectItem>
                    <SelectItem value="yearly">År</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-1">
                <AnchorPressable
                  type="button"
                  onClick={resetForm}
                  className={`flex-1 h-12 rounded-full text-[14px] font-semibold active:scale-[0.97] ${copilotChipClass(false)}`}
                >
                  Avbryt
                </AnchorPressable>
                <AnchorPressable
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 h-12 rounded-full text-[14px] font-semibold bg-gradient-to-r from-[#4a7aff] to-[#6d4aff] text-white active:scale-[0.97] disabled:opacity-40"
                >
                  <Check className="w-4 h-4 mr-1.5 inline" />
                  {saving ? 'Sparar…' : 'Spara'}
                </AnchorPressable>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {weeklyActive.length > 0 && (
        <section className="mb-8">
          <h2 className="anchor-card-title mb-3">
            Aktivitet denna vecka
          </h2>
          <div className="space-y-3">
            {weeklyActive.map((sub, i) => (
              <SubscriptionCard key={`wa-${sub.name}`} sub={sub} index={i} variant="upcoming" />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="anchor-card-title mb-3 flex items-center gap-2">
          <CalendarClock className="w-3.5 h-3.5" />
          Kommande dragningar
        </h2>
        <div className="space-y-3">
          {upcoming.length === 0 ? (
            <p className="text-[13px] text-[var(--copilot-text-muted)] py-4 px-1">Inga kommande dragningar.</p>
          ) : (
            upcoming.map((sub, i) => (
              <SubscriptionCard key={`up-${sub.name}-${i}`} sub={sub} index={i} variant="upcoming" />
            ))
          )}
        </div>
      </section>
    </CopilotToolShell>
  );
}
