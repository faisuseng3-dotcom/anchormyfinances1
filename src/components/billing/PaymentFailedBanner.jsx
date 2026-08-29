import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useBilling } from '@/hooks/useBilling';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';

export default function PaymentFailedBanner() {
  const { paymentFailed, dismissPaymentFailed, openBillingPortal, subscriptionId } = useBilling();
  const navigate = useNavigate();

  if (!paymentFailed) return null;

  const handleUpdatePayment = async () => {
    if (subscriptionId) {
      try {
        await openBillingPortal();
      } catch {
        navigate(createPageUrl('Settings'));
      }
    } else {
      navigate(createPageUrl('Pricing'));
    }
  };

  return (
    <div
      className="relative z-40 px-4 py-3 text-sm"
      style={{
        background: 'color-mix(in srgb, #ef4444 18%, var(--color-background-primary))',
        borderBottom: '1px solid color-mix(in srgb, #ef4444 35%, transparent)',
      }}
      role="alert"
    >
      <div className="max-w-lg mx-auto flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[var(--color-danger)] shrink-0 mt-0.5" aria-hidden />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[var(--color-danger)]">Betalningen misslyckades</p>
          <p className="text-[var(--color-danger)]/80 mt-0.5 text-[13px] leading-relaxed">
            Uppdatera ditt kort för att behålla din plan. Vi har skickat ett mejl med instruktioner.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <button
              type="button"
              onClick={handleUpdatePayment}
              className="text-[13px] font-semibold text-[var(--color-danger)] underline underline-offset-2"
            >
              Uppdatera betalning
            </button>
            <Link to={createPageUrl('Settings')} className="text-[13px] text-[var(--color-danger)]/80 no-underline">
              Inställningar
            </Link>
          </div>
        </div>
        <AnchorPressable
          type="button"
          minTouch={false}
          onClick={dismissPaymentFailed}
          className="p-1.5 rounded-lg text-[var(--color-danger)]/70 hover:text-[var(--color-danger)]"
          aria-label="Stäng"
        >
          <X className="w-4 h-4" />
        </AnchorPressable>
      </div>
    </div>
  );
}
