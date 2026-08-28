// @ts-nocheck
import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { sheetBackdrop, sheetPanel } from '@/lib/motionPresets';
import { zIndex } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

/**
 * Premium bottom sheet — spring slide-up, blur overlay, drag handle.
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {import('react').ReactNode} props.children
 * @param {string} [props.title]
 * @param {string} [props.subtitle]
 * @param {import('react').ReactNode} [props.headerRight]
 * @param {string} [props.maxHeight]
 * @param {string} [props.className]
 * @param {number} [props.z]
 */
export default function AnchorSheet({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  headerRight,
  maxHeight = 'min(82dvh, 640px)',
  className,
  z = zIndex.sheet,
}) {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="anchor-sheet-backdrop"
            role="presentation"
            className="anchor-overlay fixed inset-0"
            style={{ zIndex: z }}
            {...sheetBackdrop}
            onClick={onClose}
          />
          <motion.div
            key="anchor-sheet-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'anchor-sheet-title' : undefined}
            className={cn(
              'anchor-sheet-panel fixed bottom-0 left-0 right-0 mx-auto w-full max-w-lg flex flex-col',
              className,
            )}
            style={{ zIndex: z + 1, maxHeight }}
            {...sheetPanel}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-2 shrink-0">
              <div className="w-10 h-1 rounded-full bg-[var(--color-border)]" />
            </div>
            {(title || headerRight) && (
              <div className="px-5 sm:px-6 pb-3 shrink-0 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {title && (
                    <h2 id="anchor-sheet-title" className="anchor-type-headline">
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="anchor-type-body-sm mt-0.5 text-[var(--color-text-secondary)]">{subtitle}</p>
                  )}
                </div>
                {headerRight}
              </div>
            )}
            <div className="overflow-y-auto overscroll-contain flex-1 px-5 sm:px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
