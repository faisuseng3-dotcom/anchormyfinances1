// @ts-nocheck
import React, { useState } from 'react';
import { toast } from 'sonner';
import AnchorSheet from '@/components/ui-premium/AnchorSheet';
import { anchorPrimaryButtonClass, anchorSecondaryButtonClass } from '@/lib/anchorTheme';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

/**
 * Gemensam bekräftelse innan en plan-ändring genomförs. Uppdragets
 * säkerhetsregel: en handling som förändrar användardata får ALDRIG
 * genomföras direkt — den här sheeten är den enda vägen dit.
 *
 * change: { label, before, after, suffix? }. impactLine: t.ex. "Målet nås 2 månader tidigare."
 */
export default function ConfirmPlanChangeSheet({ isOpen, onClose, title = 'Din nya plan', change, impactLine, onConfirm }) {
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onConfirm();
      toast.success('Klart — planen är uppdaterad.');
      onClose();
    } catch {
      toast.error('Kunde inte spara ändringen just nu. Försök igen.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnchorSheet isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4 pb-2">
        {change && (
          <div className="rounded-2xl p-4 bg-white/[0.04] border border-white/[0.07]">
            <p className="text-[13px] text-white/50 mb-1">{change.label}</p>
            <p className="text-[18px] font-bold text-white">
              {fmt(change.before)} {change.suffix || 'kr'} <span className="text-white/40 mx-1">→</span> {fmt(change.after)} {change.suffix || 'kr'}
            </p>
          </div>
        )}
        {impactLine && (
          <div>
            <p className="text-[12px] uppercase tracking-wide text-white/35 mb-1">Beräknad effekt</p>
            <p className="text-[14px] text-white/75 leading-relaxed">{impactLine}</p>
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} disabled={busy} className={`${anchorSecondaryButtonClass} flex-1`}>
            Avbryt
          </button>
          <button type="button" onClick={handleConfirm} disabled={busy} className={`${anchorPrimaryButtonClass} flex-1 disabled:opacity-50`}>
            Bekräfta
          </button>
        </div>
      </div>
    </AnchorSheet>
  );
}
