import React, { useState } from 'react';
import { GraduationCap, Check } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import { createPageUrl } from '@/utils';
import { ACADEMY_LESSONS } from '@/lib/anchorBrain';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useTransactions } from '@/hooks/useTransactions';
import { askPersonalAdvisor } from '@/lib/personalAdvisor';
import { dashLabel, techInset, techInsetBg, techCta } from '@/lib/appSurface';
import { anchorIconButtonClass, elevatedSheet } from '@/lib/anchorTheme';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';

export default function AnchorAcademy() {
  const { profile, updateProfile } = useFinancialProfile();
  const { transactions = [] } = useTransactions();
  const completed = profile?.academyCompleted || [];
  const [active, setActive] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);

  const openLesson = async (lesson) => {
    setActive(lesson);
    setLoading(true);
    try {
      const res = await askPersonalAdvisor(
        { scenario: 'academy_lesson', lesson },
        { profile, transactions },
      );
      setContent(res);
    } finally {
      setLoading(false);
    }
  };

  const markDone = async (lessonId) => {
    const next = [...new Set([...completed, lessonId])];
    await updateProfile({ academyCompleted: next });
    setActive(null);
  };

  return (
    <PageShell
      title="Lektioner"
      subtitle="Grundkunskap kopplad till din ekonomi"
      backHref={createPageUrl('Dashboard')}
    >
      <p className="text-[15px] text-white/50 font-light leading-relaxed -mt-2">
        Korta förklaringar om svensk inflation, ränta, buffert och ISK — utan skolbokston.
      </p>

      <ul className="space-y-2">
        {ACADEMY_LESSONS.map((lesson) => {
          const done = completed.includes(lesson.id);
          return (
            <li key={lesson.id}>
              <button
                type="button"
                onClick={() => openLesson(lesson)}
                className={`${techInset} w-full text-left p-4`}
              >
                <div className={techInsetBg} />
                <div className="relative z-10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-violet-500/15 flex items-center justify-center ring-1 ring-violet-400/25">
                    <GraduationCap className="w-5 h-5 text-violet-300/90" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-white">{lesson.title}</p>
                    <p className={dashLabel}>{lesson.topic}</p>
                  </div>
                  {done && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-[#030610]/80 backdrop-blur-lg"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-[32px] px-6 py-6 max-h-[80vh] overflow-y-auto"
              style={elevatedSheet()}
            >
              <div className="flex justify-between items-center mb-4">
                <p className={dashLabel}>~{active.durationSec} sek</p>
                <button type="button" onClick={() => setActive(null)} className={anchorIconButtonClass}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              {loading ? (
                <div className="flex items-center gap-2 py-8 text-white/45">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Laddar…
                </div>
              ) : (
                <>
                  <h3 className="text-[24px] font-light text-white">{content?.title || active.title}</h3>
                  <p className="text-[15px] text-white/55 mt-4 leading-relaxed font-light whitespace-pre-wrap">
                    {content?.body}
                  </p>
                  {content?.takeaway && (
                    <p className="text-[14px] text-cyan-300/80 mt-4">{content.takeaway}</p>
                  )}
                  <button type="button" onClick={() => markDone(active.id)} className={`${techCta} w-full mt-8`}>
                    Klar
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
