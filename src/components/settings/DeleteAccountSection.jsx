// @ts-nocheck
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Trash2, AlertTriangle } from 'lucide-react';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';

export default function DeleteAccountSection({ profile }) {
  const [step, setStep] = useState('idle');

  const deleteAllOf = async (entity) => {
    // Fetch and delete in batches until no records remain
    while (true) {
      const batch = await entity.list('-created_date', 500);
      if (!batch || batch.length === 0) break;
      for (const item of batch) {
        await entity.delete(item.id);
      }
    }
  };

  const handleDelete = async () => {
    setStep('deleting');
    try {
      await deleteAllOf(base44.entities.Transaction);
      await deleteAllOf(base44.entities.SavingsDeposit);
      if (profile?.id) {
        await base44.entities.FinancialProfile.delete(profile.id);
      }
      setStep('done');
      setTimeout(() => base44.auth.logout(), 2000);
    } catch {
      setStep('error');
    }
  };

  if (step === 'done') {
    return (
      <div className="p-4 rounded-[var(--anchor-radius-lg)] text-center text-sm text-emerald-300 ring-1 ring-emerald-400/30 bg-emerald-500/10 anchor-elev-1">
        Ditt konto och all data har raderats. Du loggas ut…
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="p-4 rounded-[var(--anchor-radius-lg)] ring-1 ring-rose-400/30 bg-rose-500/10 space-y-3 anchor-elev-1">
        <div className="flex items-center gap-2 text-rose-300">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <p className="text-sm font-semibold">Radering misslyckades</p>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
          Något gick fel. Försök igen eller kontakta oss på hello@anchormyfinances.com så hjälper vi dig att radera ditt konto.
        </p>
        <AnchorPressable
          type="button"
          minTouch={false}
          onClick={() => setStep('idle')}
          className="w-full h-11 rounded-full text-sm font-semibold bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)] ring-1 ring-[var(--color-border)]"
        >
          Stäng
        </AnchorPressable>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="p-4 rounded-[var(--anchor-radius-lg)] ring-1 ring-rose-400/30 bg-rose-500/10 space-y-3 anchor-elev-1">
        <div className="flex items-center gap-2 text-rose-300">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <p className="text-sm font-semibold">Är du säker?</p>
        </div>
        <p className="text-xs text-white/45 leading-relaxed">
          All din data raderas permanent och kan inte återställas. Din rätt att bli glömd (GDPR art. 17) uppfylls omedelbart.
        </p>
        <div className="flex gap-2">
          <AnchorPressable
            type="button"
            minTouch={false}
            onClick={() => setStep('idle')}
            className="flex-1 h-11 rounded-full text-sm font-semibold bg-white/[0.06] text-white/70 ring-1 ring-white/[0.1]"
          >
            Avbryt
          </AnchorPressable>
          <AnchorPressable
            type="button"
            minTouch={false}
            onClick={handleDelete}
            disabled={step === 'deleting'}
            className="flex-1 h-11 rounded-full text-sm font-semibold bg-rose-500/80 text-white"
          >
            {step === 'deleting' ? 'Raderar…' : 'Ja, radera allt'}
          </AnchorPressable>
        </div>
      </div>
    );
  }

  return (
    <AnchorPressable
      type="button"
      onClick={() => setStep('confirm')}
      className="w-full flex items-center justify-center gap-2 min-h-12 py-3 rounded-[var(--anchor-radius-lg)] text-sm text-rose-300/80 ring-1 ring-rose-400/25 bg-rose-500/10"
    >
      <Trash2 className="w-4 h-4" />
      Radera mitt konto och all min data
    </AnchorPressable>
  );
}
