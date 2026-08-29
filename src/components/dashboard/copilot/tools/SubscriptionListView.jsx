// @ts-nocheck
/**
 * Dedikerad prenumerationslista — INTE ProTools/verktygspanelen.
 * Visar alla abonnemang som runda kort med pausa/avbryt.
 */
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Plus, Pause, X, Pencil, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSubscriptionTotal, fmtKr, getUpcomingSubscriptions } from '../copilotDashboardUtils';
import { staggerItem } from '@/lib/motionPresets';
import { copilotInputClass, copilotChipClass, getCategoryTint } from '@/lib/copilotTheme';
import { SUBSCRIPTION_CATEGORIES, subscriptionCategoryLabel } from '@/lib/subscriptionCategories';
import { CategoryIcon } from '@/lib/anchorIcons';
import CopilotToolShell from './CopilotToolShell';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';
import DayPicker from '@/components/onboarding/DayPicker';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { triggerHaptic } from '@/lib/haptics';
import { toast } from 'sonner';

const EMPTY_FORM = { name: '', amount: '', category: 'streaming', billingDay: '15', frequency: 'monthly' };

const BRAND_TINTS = {
  netflix: { bg: 'rgba(229,9,20,0.18)', accent: '#e50914' },
  spotify: { bg: 'rgba(30,215,96,0.16)', accent: '#1ed760' },
  hbo: { bg: 'rgba(116,80,162,0.18)', accent: '#7450a2' },
  disney: { bg: 'rgba(17,60,115,0.2)', accent: '#4a9fd4' },
  viaplay: { bg: 'rgba(255,193,7,0.14)', accent: '#ffc107' },
  apple: { bg: 'rgba(11, 18, 32, 0.88)', accent: '#f5f5f7' },
};

function brandTintFor(name = '') {
  const key = Object.keys(BRAND_TINTS).find((k) => name.toLowerCase().includes(k));
  if (key) return BRAND_TINTS[key];
  return null;
}

function nextChargeLabel(sub, upcomingMap) {
  const hit = upcomingMap.get(sub.name);
  if (hit?.nextDate) {
    return hit.nextDate.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
  }
  if (sub.billingDay) return `Dag ${sub.billingDay} varje månad`;
  return 'Datum ej satt';
}

function SubscriptionRow({
  sub,
  index,
  nextCharge,
  onPause,
  onCancel,
  onEdit,
  saving,
}) {
  const brand = brandTintFor(sub.name);
  const tint = brand || getCategoryTint(sub.category === 'streaming' ? 'subscription' : sub.category || 'other');
  const paused = Boolean(sub.paused);

  return (
    <motion.article
      {...staggerItem(index)}
      className={`organic-surface rounded-[20px] p-4 flex flex-col gap-3 ${paused ? 'opacity-60' : ''}`}
      style={{ background: 'var(--copilot-bg-card)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-[17px] font-bold text-white"
          style={{ background: tint.bg, boxShadow: 'var(--anchor-shadow-1)' }}
        >
          {brand ? sub.name.charAt(0).toUpperCase() : (
            <CategoryIcon category={sub.category || 'subscription'} size={22} color={tint.accent} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[16px] font-semibold text-[var(--color-text-primary)] truncate">{sub.name}</p>
          <p className="text-[12px] text-[var(--copilot-text-muted)] mt-0.5">
            Nästa dragning · {nextCharge}
          </p>
          <p className="text-[11px] text-[var(--copilot-text-muted)] mt-0.5">
            {subscriptionCategoryLabel(sub.category)}
            {paused ? ' · Pausad' : ''}
          </p>
        </div>
        <p className="text-[17px] font-bold text-[var(--color-text-primary)] tabular-nums shrink-0">
          {fmtKr(sub.amount || 0)}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {!paused && (
          <AnchorPressable
            type="button"
            onClick={() => { triggerHaptic('light'); onPause(index); }}
            disabled={saving}
            className="h-12 px-4 rounded-full bg-white border border-[var(--color-border)] text-[13px] font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] active:scale-[0.97] disabled:opacity-40"
          >
            <Pause className="w-4 h-4 mr-1.5 inline" />
            Pausa
          </AnchorPressable>
        )}
        <AnchorPressable
          type="button"
          onClick={() => { triggerHaptic('medium'); onCancel(index); }}
          disabled={saving}
          className="h-12 px-4 rounded-full bg-rose-500/15 text-[13px] font-semibold text-rose-300 hover:bg-rose-500/22 active:scale-[0.97] disabled:opacity-40"
        >
          <X className="w-4 h-4 mr-1.5 inline" />
          Avbryt
        </AnchorPressable>
        <AnchorPressable
          type="button"
          onClick={() => { triggerHaptic('light'); onEdit(index); }}
          disabled={saving}
          className="h-12 w-12 rounded-full bg-white border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] active:scale-[0.97] disabled:opacity-40"
          aria-label={`Redigera ${sub.name}`}
        >
          <Pencil className="w-4 h-4" />
        </AnchorPressable>
      </div>
    </motion.article>
  );
}

export default function SubscriptionListView({ profile, updateProfile }) {
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[SubscriptionListView] mounted', {
        count: profile?.subscriptions?.length ?? 0,
      });
    }
  }, [profile?.subscriptions?.length]);

  const subs = profile?.subscriptions || [];
  const total = getSubscriptionTotal(profile);
  const [showAdd, setShowAdd] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const upcomingMap = useMemo(() => {
    const list = getUpcomingSubscriptions(profile, 24);
    return new Map(list.map((s) => [s.name, s]));
  }, [profile]);

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
      paused: false,
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

  const handlePause = async (index) => {
    const next = subs.map((s, i) => (i === index ? { ...s, paused: true } : s));
    await persist(next);
  };

  const handleCancel = async (index) => {
    const next = subs.filter((_, i) => i !== index);
    await persist(next);
    if (editIndex === index) resetForm();
  };

  return (
    <CopilotToolShell
      eyebrow="Abonnemang"
      title="Prenumerationer"
      subtitle="Alla dina abonnemang — Netflix, Spotify och övriga tjänster på ett ställe."
      action={
        <AnchorPressable
          type="button"
          onClick={() => { triggerHaptic('light'); setShowAdd(true); setEditIndex(null); setForm(EMPTY_FORM); }}
          className="h-12 px-5 rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent)] text-white text-[14px] font-semibold shadow-[0_8px_32px_rgba(37,99,235,0.35)] active:scale-[0.97]"
        >
          <Plus className="w-4 h-4 mr-1.5 inline" />
          Lägg till
        </AnchorPressable>
      }
    >
      <div
        className="organic-surface rounded-[20px] p-5 mb-6"
        style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0%, rgba(79, 174, 130, 0.08) 100%)' }}
      >
        <h2 className="anchor-card-title">Totalt per månad</h2>
        <p className="text-[32px] font-bold text-white tabular-nums mt-1">
          {fmtKr(total)}
        </p>
      </div>

      <div className="space-y-3">
        {subs.length === 0 ? (
          <div className="organic-surface rounded-[20px] p-10 text-center">
            <p className="text-[14px] text-[var(--copilot-text-muted)]">
              Inga prenumerationer ännu. Lägg till Netflix, Spotify eller andra tjänster.
            </p>
          </div>
        ) : (
          subs.map((sub, i) => (
            <SubscriptionRow
              key={`${sub.name}-${i}`}
              sub={sub}
              index={i}
              nextCharge={nextChargeLabel(sub, upcomingMap)}
              onPause={handlePause}
              onCancel={handleCancel}
              onEdit={startEdit}
              saving={saving}
            />
          ))
        )}
      </div>

      <AnimatePresence>
        {(showAdd || editIndex != null) && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="organic-surface rounded-[20px] p-5 mt-6"
          >
            <h3 className="text-[15px] font-semibold text-white mb-4">
              {editIndex != null ? 'Redigera abonnemang' : 'Nytt abonnemang'}
            </h3>
            <div className="space-y-3">
              <Input placeholder="Namn, t.ex. Netflix" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={copilotInputClass} />
              <Input type="number" placeholder="Belopp (kr/mån)" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} className={copilotInputClass} />
              <DayPicker value={parseInt(form.billingDay, 10) || 15} onChange={(d) => setForm((f) => ({ ...f, billingDay: String(d) }))} label="Dragningsdag" hint="Standard: 15" />
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger className={copilotInputClass}><SelectValue placeholder="Kategori" /></SelectTrigger>
                <SelectContent>
                  {SUBSCRIPTION_CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2 pt-1">
                <AnchorPressable type="button" onClick={resetForm} className={`flex-1 h-12 rounded-full active:scale-[0.97] ${copilotChipClass(false)}`}>
                  Avbryt
                </AnchorPressable>
                <AnchorPressable type="button" onClick={handleSave} disabled={saving} className="flex-1 h-12 rounded-full bg-gradient-to-r from-[#4fae82] to-[#4fae82] text-white font-semibold active:scale-[0.97] disabled:opacity-40">
                  <Check className="w-4 h-4 mr-1.5 inline" />
                  {saving ? 'Sparar…' : 'Spara'}
                </AnchorPressable>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </CopilotToolShell>
  );
}
