// @ts-nocheck
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Radio, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AINotificationOverlay({ notification, onAction, onDismiss }) {
  if (!notification) return null;

  const { icon, badge, badgeColor, accentColor, headline, message, actionLabel } = notification;

  return (
    <AnimatePresence>
      <motion.div
        key="notif-overlay"
        initial={{ opacity: 0, y: 60, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.96 }}
        transition={{ type: 'spring', damping: 22, stiffness: 220 }}
        className="fixed bottom-24 left-4 right-4 z-[90] max-w-sm mx-auto"
      >
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(8, 12, 24, 0.92)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: `0 0 60px ${accentColor}30, 0 20px 60px rgba(0,0,0,0.6)`
          }}
        >
          {/* Colored top bar */}
          <div className="h-1" style={{ background: accentColor }} />

          <div className="p-5">
            {/* Header row */}
            <div className="flex items-start gap-3 mb-3">
              {/* AI pulse icon */}
              <div className="relative flex-shrink-0">
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-xl"
                  style={{ background: accentColor, filter: 'blur(8px)' }}
                />
                <div
                  className="relative w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}40` }}
                >
                  {icon}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border mb-1 ${badgeColor}`}>
                  <Radio className="w-2.5 h-2.5" />
                  {badge}
                </div>
                <p className="text-sm font-bold text-white leading-snug">{headline}</p>
              </div>

              <button onClick={onDismiss} className="text-slate-600 hover:text-white transition-colors flex-shrink-0 mt-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message */}
            <p className="text-sm text-slate-300 leading-relaxed mb-4">{message}</p>

            {/* Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={onDismiss}
                variant="ghost"
                size="sm"
                className="flex-1 rounded-xl border border-white/10 hover:bg-white/5 text-slate-400 text-xs"
              >
                Ignorera
              </Button>
              <Button
                onClick={onAction}
                size="sm"
                className="flex-1 rounded-xl text-white text-xs font-semibold shadow-lg"
                style={{ background: accentColor }}
              >
                <Zap className="w-3.5 h-3.5 mr-1" />
                {actionLabel}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}