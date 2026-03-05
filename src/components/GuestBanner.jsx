import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function GuestBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleSignUp = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-[100]"
        style={{
          background: 'linear-gradient(90deg, rgba(245,158,11,0.95) 0%, rgba(217,119,6,0.95) 100%)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-white flex-shrink-0" />
          <p className="text-xs text-white flex-1 leading-tight">
            <strong>Gäst-läge.</strong> Din data sparas bara i denna webbläsare.{' '}
            <button onClick={handleSignUp} className="underline font-bold">
              Skapa konto för att säkra den →
            </button>
          </p>
          <button onClick={() => setDismissed(true)} className="text-white/70 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}