import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, ArrowLeftRight, PiggyBank, CalendarDays } from 'lucide-react';
import { sheetBackdrop } from '@/lib/motionPresets';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';

const ACTIONS = [
  { id: 'register', label: 'Registrera', icon: PlusCircle, color: 'var(--color-accent)' },
  { id: 'plan', label: 'Planera', icon: CalendarDays, color: 'var(--color-accent-hover)' },
  { id: 'transfer', label: 'Flytta', icon: ArrowLeftRight, color: 'var(--color-success)' },
  { id: 'save', label: 'Spara', icon: PiggyBank, color: 'var(--color-warning)' },
];

export default function ActionMenu({ isOpen, onClose, onAction }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            {...sheetBackdrop}
            onClick={onClose}
            className="anchor-overlay fixed inset-0 z-40"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="anchor-action-menu-pills fixed bottom-24 left-0 right-0 z-50 flex justify-center gap-4 px-4"
          >
            {ACTIONS.map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 24, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.85 }}
                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 400, damping: 28 }}
                >
                  <AnchorPressable
                    onClick={() => { onAction(action.id); onClose(); }}
                    minTouch={false}
                    className="flex flex-col items-center gap-2 min-w-[4.5rem]"
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center anchor-elev-2"
                      style={{
                        background: `color-mix(in srgb, ${action.color} 14%, transparent)`,
                        border: `1.5px solid color-mix(in srgb, ${action.color} 28%, transparent)`,
                      }}
                    >
                      <Icon className="w-6 h-6" style={{ color: action.color }} />
                    </div>
                    <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                      {action.label}
                    </span>
                  </AnchorPressable>
                </motion.div>
              );
            })}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
