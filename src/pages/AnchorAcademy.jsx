import React, { useState } from 'react';
import { GraduationCap, Check } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import { createPageUrl } from '@/utils';
import { ACADEMY_LESSONS } from '@/lib/anchorBrain';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useTransactions } from '@/hooks/useTransactions';
import { askPersonalAdvisor } from '@/lib/personalAdvisor';
import { sectionMetaClass, sectionSubtitleClass, elevatedSheet } from '@/lib/anchorTheme';
import { motion, AnimatePresence } from 'framer-motion';

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
      title="Anchor Academy"
      subtitle="60 sekunder — rätt kunskap, rätt tillfälle"
      backHref={createPageUrl('Dashboard')}
    >
      <p className={`${sectionSubtitleClass} -mt-2 mb-4`}>
        Endast var femte ung vuxen klarar grundfrågor om ränta och inflation. Vi fyller
        gapet med lektioner kopplade till din ekonomi — inte generisk skoltavla.
      </p>

      <div className="space-y-2">
        {ACADEMY_LESSONS.map((lesson) => {
          const done = completed.includes(lesson.id);
          return (
            <button
              key={lesson.id}
              type="button"
              onClick={() => openLesson(lesson)}
              className="w-full flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-left"
            >
              <GraduationCap className="w-5 h-5 text-emerald-300 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium text-white">{lesson.title}</p>
                <p className={sectionMetaClass}>{lesson.topic}</p>
              </div>
              {done && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-[22px] px-5 py-6 max-h-[80vh] overflow-y-auto"
              style={elevatedSheet()}
            >
              <p className={sectionMetaClass}>{active.title}</p>
              {loading ? (
                <p className="text-white/50 py-6">Laddar lektion…</p>
              ) : (
                <>
                  <p className="text-[16px] text-white mt-3 leading-relaxed whitespace-pre-wrap">
                    {content?.body}
                  </p>
                  {content?.takeaway && (
                    <p className="text-[14px] text-[#9FB5FF] mt-4">{content.takeaway}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => markDone(active.id)}
                    className="w-full mt-6 h-11 rounded-xl bg-white text-[#0a1628] font-semibold text-[15px]"
                  >
                    Markera som klar
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
