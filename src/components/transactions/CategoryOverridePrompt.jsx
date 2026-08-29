import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanLine, Check, X } from 'lucide-react';
import { saveOverride } from '@/lib/enrichmentEngine';
import { copilotPrimaryBtnClass, copilotSecondaryBtnClass } from '@/lib/copilotTheme';
import { triggerHaptic } from '@/lib/haptics';

export default function CategoryOverridePrompt({ vendor, newCategory, categoryLabel, onDismiss }) {
  if (!vendor || !newCategory) return null;

  const handleAccept = () => {
    saveOverride(vendor, newCategory);
    triggerHaptic('success');
    onDismiss(true);
  };

  const handleDecline = () => {
    triggerHaptic('light');
    onDismiss(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="rounded-2xl organic-surface p-4 bg-[var(--copilot-bg-card)]"
      >
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--color-accent-soft)', boxShadow: 'var(--anchor-shadow-1)' }}
          >
            <ScanLine className="w-4 h-4 text-[var(--copilot-accent-blue)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold mb-1 text-[var(--color-text-primary)]">Lär sig av din korrigering</p>
            <p className="text-xs leading-relaxed text-[var(--copilot-text-secondary)]">
              Ska alla framtida köp från <strong className="text-[var(--color-text-primary)]">&quot;{vendor}&quot;</strong> kategoriseras som <strong className="text-[var(--color-text-primary)]">{categoryLabel}</strong>?
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button type="button" onClick={handleDecline} className={`flex-1 !h-10 !text-xs ${copilotSecondaryBtnClass}`}>
            <span className="inline-flex items-center justify-center gap-1.5"><X className="w-3.5 h-3.5" /> Bara denna</span>
          </button>
          <button type="button" onClick={handleAccept} className={`flex-1 !h-10 !text-xs ${copilotPrimaryBtnClass}`}>
            <span className="inline-flex items-center justify-center gap-1.5"><Check className="w-3.5 h-3.5" /> Kom ihåg</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
