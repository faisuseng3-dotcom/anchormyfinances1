import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { askPersonalAdvisor } from '@/lib/personalAdvisor';
import { formatCoachText } from '@/lib/coachingCopy';
import { anchorIconButtonClass, elevatedSheet } from '@/lib/anchorTheme';
import { dashLabel } from '@/lib/dashboardTheme';

export default function AcademyLessonSheet({
  open,
  onClose,
  lesson,
  profile,
  transactions,
  onComplete,
}) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!open || !lesson) return;
    let cancelled = false;
    setLoading(true);
    setContent(null);
    askPersonalAdvisor({ scenario: 'academy_lesson', lesson }, { profile, transactions })
      .then((res) => { if (!cancelled) setContent(res); })
      .catch(() => {
        if (!cancelled) {
          setContent({
            title: lesson.title,
            body: 'Korta förklaringar kopplade till din situation — utan skolbokston.',
            takeaway: 'Stäng när du känner dig redo.',
            cta: 'Klar',
          });
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, lesson, profile, transactions]);

  const handleDone = () => {
    onComplete?.(lesson?.id);
    onClose();
  };

  if (!lesson) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-[rgba(11,18,32,0.45)] backdrop-blur-lg"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-[32px] px-6 pt-5 pb-12 max-h-[85vh] overflow-y-auto"
            style={elevatedSheet()}
          >
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-[var(--color-border)]" />
            </div>
            <div className="flex justify-between items-start mb-5">
              <p className={dashLabel}>~{lesson.durationSec} sek</p>
              <button type="button" onClick={onClose} className={anchorIconButtonClass}>
                <X className="w-4 h-4" />
              </button>
            </div>
            {loading ? (
              <div className="flex items-center gap-2 py-10 text-[var(--color-text-secondary)]">
                <Loader2 className="w-5 h-5 animate-spin" />
                Laddar…
              </div>
            ) : (
              <>
                <h3 className="text-[24px] font-light text-[var(--color-text-primary)] tracking-tight">
                  {content?.title || lesson.title}
                </h3>
                <p className="text-[15px] text-[var(--color-text-secondary)] mt-4 leading-relaxed font-light">
                  {formatCoachText(content?.body)}
                </p>
                {content?.takeaway && (
                  <p className="text-[14px] text-[var(--color-accent)] mt-5 leading-relaxed">
                    {formatCoachText(content.takeaway)}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleDone}
                  className="w-full mt-8 h-12 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold text-[15px]"
                >
                  {content?.cta || 'Klar'}
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
