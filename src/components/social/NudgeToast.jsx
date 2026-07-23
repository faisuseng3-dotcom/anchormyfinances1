import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HandHeart } from 'lucide-react';
import { StreakIcon } from '@/lib/anchorIcons';

export default function NudgeToast({ nudge, onDismiss }) {
  useEffect(() => {
    if (!nudge) return;
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [nudge]);

  return (
    <AnimatePresence>
      {nudge && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.9 }}
          className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 max-w-xs w-full"
          style={{ background: nudge.type === 'pepp' ? 'rgba(15,222,189,0.15)' : 'rgba(255, 255, 255, 0.15)', boxShadow: 'var(--anchor-shadow-1)', backdropFilter: 'blur(12px)' }}
        >
          {nudge.type === 'pepp'
            ? <HandHeart className="w-6 h-6 text-[#0FDEBD] flex-shrink-0" aria-hidden />
            : <StreakIcon variant="fire" size={24} className="text-amber-400 flex-shrink-0" />}
          <p className="text-sm font-bold flex-1" style={{ color: 'var(--color-text-primary)' }}>{nudge.message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
