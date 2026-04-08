import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PlusCircle, ArrowLeftRight, PiggyBank } from 'lucide-react';

const ACTIONS = [
  { id: 'register', label: 'Registrera', icon: PlusCircle, color: 'var(--color-accent)' },
  { id: 'transfer', label: 'Flytta', icon: ArrowLeftRight, color: 'var(--color-success)' },
  { id: 'save', label: 'Spara', icon: PiggyBank, color: 'var(--color-warning)' },
];

export default function ActionMenu({ isOpen, onClose, onAction }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
          />

          {/* Action pills — rise up above nav */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-24 left-0 right-0 z-50 flex justify-center gap-4 px-6"
          >
            {ACTIONS.map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, y: 24, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.85 }}
                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 400, damping: 28 }}
                  onClick={() => { onAction(action.id); onClose(); }}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                    style={{ background: `${action.color}22`, border: `1.5px solid ${action.color}44` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: action.color }} />
                  </div>
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                    {action.label}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}