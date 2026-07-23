import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Play } from 'lucide-react';
import {
  getTriggeredAcademyLesson,
  calculatePengometer,
  scanSubscriptions,
} from '@/lib/anchorBrain';
import { askPersonalAdvisor } from '@/lib/personalAdvisor';
import {
  dashRailCard,
  dashRailCardBorder,
  dashRailCardInner,
  dashLabel,
} from '@/lib/dashboardTheme';
import { anchorIconButtonClass, elevatedSheet } from '@/lib/anchorTheme';
import { formatCoachText } from '@/lib/coachingCopy';

export default function AnchorAcademyCard({
  profile,
  transactions,
  onLessonComplete,
  variant = 'default',
}) {
  const pengometer = calculatePengometer(profile, transactions);
  const subScan = scanSubscriptions(profile, transactions);
  const lesson = getTriggeredAcademyLesson(profile, pengometer, subScan);
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);

  const openLesson = async () => {
    setOpen(true);
    setLoading(true);
    try {
      const res = await askPersonalAdvisor(
        { scenario: 'academy_lesson', lesson },
        { profile, transactions },
      );
      setContent(res);
    } catch {
      setContent({
        title: lesson.title,
        body: 'Sverige är kontantlöst — små köp blir lätt osynliga. Håll koll på veckosaldot så inget överraskar i slutet av månaden.',
        takeaway: 'Öppna pengometern varje måndag.',
        cta: 'Stäng',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    const completed = [...new Set([...(profile?.academyCompleted || []), lesson.id])];
    onLessonComplete?.({ academyCompleted: completed, lastAcademyLessonId: lesson.id });
    setOpen(false);
  };

  const modal = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-[#030610]/80 backdrop-blur-lg"
          onClick={() => setOpen(false)}
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
              <div className="w-10 h-1 rounded-full bg-white/15" />
            </div>
            <div className="flex justify-between items-start mb-5">
              <p className={dashLabel}>~{lesson.durationSec} sek</p>
              <button type="button" onClick={() => setOpen(false)} className={anchorIconButtonClass}>
                <X className="w-4 h-4" />
              </button>
            </div>
            {loading ? (
              <div className="flex items-center gap-2 py-10 text-white/45">
                <Loader2 className="w-5 h-5 animate-spin" />
                Laddar…
              </div>
            ) : (
              <>
                <h3 className="text-[24px] font-light text-white tracking-tight">
                  {content?.title || lesson.title}
                </h3>
                <p className="text-[15px] text-white/55 mt-4 leading-relaxed font-light">
                  {formatCoachText(content?.body)}
                </p>
                {content?.takeaway && (
                  <p className="text-[14px] text-cyan-300/80 mt-5 leading-relaxed">
                    {formatCoachText(content.takeaway)}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleDone}
                  className="w-full mt-8 h-12 rounded-full bg-white text-[#050d28] font-semibold text-[15px]"
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

  if (variant === 'rail') {
    return (
      <>
        <button type="button" onClick={openLesson} className={`${dashRailCard} text-left`}>
          <div
            className={dashRailCardInner}
            style={{
              background:
                'linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0%, rgba(255,255,255,0.02) 60%)',
            }}
          />
          <div className={dashRailCardBorder} />
          <div className="relative z-10 flex flex-col justify-between min-h-[148px]">
            <p className={dashLabel}>Lektion</p>
            <p className="text-[20px] font-medium text-white leading-snug mt-2">{lesson.title}</p>
            <span className="inline-flex items-center gap-1.5 text-[13px] text-white/50 mt-4">
              <Play className="w-3.5 h-3.5 fill-white/50" />
              Spela
            </span>
          </div>
        </button>
        {modal}
      </>
    );
  }

  return null;
}
