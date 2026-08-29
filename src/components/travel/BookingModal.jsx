// @ts-nocheck
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Shield, Plane, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

const AFFILIATE_PARAMS = 'ref=anchor&utm_source=anchor&utm_medium=affiliate&utm_campaign=travel';

export function buildAffiliateUrl(rawUrl) {
  if (!rawUrl) return null;
  try {
    const url = new URL(rawUrl);
    const params = new URLSearchParams(AFFILIATE_PARAMS);
    params.forEach((v, k) => url.searchParams.set(k, v));
    return url.toString();
  } catch {
    const sep = rawUrl.includes('?') ? '&' : '?';
    return `${rawUrl}${sep}${AFFILIATE_PARAMS}`;
  }
}

export default function BookingModal({ pkg, onClose }) {
  const [confirmed, setConfirmed] = useState(false);

  if (!pkg) return null;

  const affiliateUrl = buildAffiliateUrl(pkg.bookingUrl);
  const provider = pkg.provider || 'bokningssidan';

  const handleBook = () => {
    setConfirmed(true);
    setTimeout(() => {
      window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
    }, 800);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        style={{ background: 'rgba(11,18,32,0.45)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="w-full max-w-sm rounded-3xl overflow-hidden"
          style={{ background: 'var(--color-surface)', boxShadow: 'var(--anchor-shadow-1)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Hero strip */}
          <div className="relative h-32 bg-[var(--color-accent)] flex items-center justify-center">
            <Plane className="w-10 h-10 text-white/30 absolute right-6 bottom-4 rotate-12" />
            <div className="text-center z-10 px-4">
              <div className="text-white font-black text-xl">{pkg.name}</div>
              <div className="text-white/70 text-sm mt-0.5">{pkg.accommodation}</div>
            </div>
            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Price match confirmation */}
            <div className="flex items-center gap-3 bg-[var(--color-success-soft)] border border-[rgba(22,163,74,0.25)] rounded-2xl px-4 py-3">
              <Shield className="w-4 h-4 text-[var(--color-success)] flex-shrink-0" />
              <div>
                <div className="text-xs font-bold text-[var(--color-success)]">Prismatch bekräftad</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {pkg.totalCost?.toLocaleString('sv-SE')} kr ryms i din budget med {pkg.margin?.toLocaleString('sv-SE')} kr marginal
                </div>
              </div>
            </div>

            {/* Exit notice */}
            <div className="text-center space-y-1">
              <p className="text-sm text-[var(--color-text-primary)] font-semibold">
                Du skickas nu till <span className="text-[var(--color-accent)]">{provider}</span>
              </p>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Din reseplan väntar här när du är klar!<br/>
                Stäng fliken för att komma tillbaka till Lago.
              </p>
            </div>

            {/* Affiliate disclosure */}
            <p className="text-[10px] text-[var(--color-text-muted)] text-center">
              Lago kan få provision om du bokar via denna länk. Priset påverkas inte.
            </p>

            {/* CTA */}
            {!confirmed ? (
              <Button
                onClick={handleBook}
                className="w-full h-12 rounded-2xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] font-bold text-sm shadow-lg  flex items-center justify-center gap-2"
              >
                Fortsätt till {provider}
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-12 rounded-2xl bg-[var(--color-success-soft)] border border-[rgba(22,163,74,0.4)] flex items-center justify-center gap-2 text-[var(--color-success)] font-semibold text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Öppnar {provider}...
              </motion.div>
            )}

            <button onClick={onClose} className="w-full text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] py-1">
              Avbryt — gå tillbaka
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}