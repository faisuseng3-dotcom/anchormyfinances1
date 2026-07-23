import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { GUEST_MODE_ONLY } from '@/lib/authRoutes';

export default function GuestBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -48, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-[100] border-b"
        style={{
          background: 'var(--color-background-secondary)',
          borderColor: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="max-w-md mx-auto px-4 py-2.5 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-warning)' }} />
          <p className="text-xs flex-1 leading-tight" style={{ color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>Gästläge.</strong> Data sparas bara i den här webbläsaren.
            {!GUEST_MODE_ONLY && (
              <>
                {' '}
                <button className="underline font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Skapa konto för att säkra den →
                </button>
              </>
            )}
          </p>
          <button onClick={() => setDismissed(true)} style={{ color: 'var(--color-text-muted)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}