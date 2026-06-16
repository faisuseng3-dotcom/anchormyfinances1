import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/**
 * Visuell indikator för pull-to-refresh.
 * Visas när pullDistance > 0 eller isRefreshing === true.
 */
export default function PullToRefreshIndicator({ pullDistance, isRefreshing }) {
  const visible = pullDistance > 0 || isRefreshing;
  const progress = Math.min(1, pullDistance / 72);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.18 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            paddingTop: 12,
            zIndex: 50,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'var(--color-surface-raised)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              transform: `scale(${0.6 + progress * 0.4})`,
              transition: 'transform 0.1s',
            }}
          >
            <Loader2
              size={16}
              className="text-[var(--color-accent)]"
              style={{
                animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none',
                transform: isRefreshing ? undefined : `rotate(${progress * 270}deg)`,
                transition: isRefreshing ? 'none' : 'transform 0.1s',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
