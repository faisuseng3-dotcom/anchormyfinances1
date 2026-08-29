// @ts-nocheck
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, CheckCircle, DollarSign, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SCRIPT = `Hej! Jag har varit kund hos er länge men har nyligen sett att konkurrenten Hallon erbjuder samma tjänst för 199 kr/mån – vilket är 300 kr billigare. Jag är nöjd med er service men kan inte ignorera en besparing på 1 200 kr/år. Kan ni matcha detta erbjudande, eller ska jag avsluta mitt abonnemang?`;

export default function NegotiationHubModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4"
        style={{ background: 'rgba(11,18,32,0.45)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 24 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm rounded-3xl overflow-hidden bg-white border border-[var(--color-border)]"
          style={{
            boxShadow: '0 0 60px rgba(34,197,94,0.2), 0 20px 60px rgba(11,18,32,0.25)'
          }}
        >
          <div className="h-1 bg-[var(--color-success)]" />
          <div className="p-6">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[var(--color-success)]" />
                <h2 className="text-base font-bold text-[var(--color-text-primary)]">Besparingsmöjlighet</h2>
              </div>
              <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mb-5">Mobilabonnemang · Identifierad av AI</p>

            {/* Comparison table */}
            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-danger-soft)] border border-[var(--color-danger)]/20">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-danger)]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-[var(--color-danger)]">T2</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[var(--color-text-muted)]">Nuvarande</p>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">Tele2</p>
                </div>
                <span className="text-[var(--color-danger)] font-bold text-sm">499 kr/mån</span>
              </div>

              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-success-soft)] border border-[var(--color-success)]/30">
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--color-success)]" />
                  <span className="text-xs text-[var(--color-success)] font-semibold">Spara 1 200 kr/år</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-success-soft)] border border-[var(--color-success)]/20">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-success)]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-[var(--color-success)]">H</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[var(--color-text-muted)]">Förslag</p>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">Hallon</p>
                </div>
                <span className="text-[var(--color-success)] font-bold text-sm">199 kr/mån</span>
              </div>
            </div>

            {/* AI Script */}
            <div className="mb-5">
              <p className="text-xs text-[var(--color-text-muted)] mb-2 tracking-wide">Förhandlingsmanus</p>
              <div
                className="p-3 rounded-xl text-xs text-[var(--color-text-secondary)] leading-relaxed"
                style={{ background: 'var(--color-background-secondary)', boxShadow: 'var(--anchor-shadow-1)' }}
              >
                {SCRIPT}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button onClick={handleCopy} className="flex-1 rounded-xl bg-[var(--color-accent)] hover:opacity-90 text-white text-sm">
                {copied ? <CheckCircle className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
                {copied ? 'Kopierat!' : 'Kopiera manus'}
              </Button>
              <Button onClick={onClose} variant="outline" className="flex-1 rounded-2xl border border-[var(--color-border)] hover:bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)] text-sm">
                Stäng
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}