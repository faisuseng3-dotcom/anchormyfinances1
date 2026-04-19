import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, X } from 'lucide-react';
import { saveOverride } from '@/lib/enrichmentEngine';

/**
 * Visas när användaren manuellt ändrar en transaktinskategori.
 * Frågar om alla framtida transaktioner från samma avsändare ska få samma kategori.
 */
export default function CategoryOverridePrompt({ vendor, newCategory, categoryLabel, onDismiss }) {
  if (!vendor || !newCategory) return null;

  const handleAccept = () => {
    saveOverride(vendor, newCategory);
    onDismiss(true);
  };

  const handleDecline = () => {
    onDismiss(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="fixed bottom-28 left-4 right-4 z-50 rounded-2xl shadow-xl p-4"
        style={{ background: 'var(--color-surface)', border: '1px solid rgba(13,115,119,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(13,115,119,0.1)' }}>
            <Sparkles className="w-4 h-4" style={{ color: '#0D7377' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
              Lär sig av din korrigering
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Vill du att alla framtida köp från <strong>"{vendor}"</strong> automatiskt kategoriseras som <strong>{categoryLabel}</strong>?
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleDecline}
            className="flex-1 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
            style={{ background: '#F4F6F8', color: 'var(--color-text-secondary)' }}
          >
            <X className="w-3.5 h-3.5" /> Bara denna gång
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 h-9 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5"
            style={{ background: '#0D7377' }}
          >
            <Check className="w-3.5 h-3.5" /> Ja, kom ihåg det
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}