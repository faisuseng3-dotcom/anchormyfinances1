import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, X, Loader2 } from 'lucide-react';
import {
  getTriggeredAcademyLesson,
  calculatePengometer,
  scanSubscriptions,
} from '@/lib/anchorBrain';
import { askPersonalAdvisor } from '@/lib/personalAdvisor';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  sectionMetaClass,
  sectionSubtitleClass,
  anchorPrimaryButtonClass,
  anchorIconButtonClass,
  elevatedSheet,
} from '@/lib/anchorTheme';

export default function AnchorAcademyCard({ profile, transactions, onLessonComplete }) {
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
        body: 'Sverige är kontantlöst — små köp blir lätt osynliga. Anchor visar vad som är kvar så du slipper överraskningar i slutet av månaden.',
        takeaway: 'Kolla din pengometer varje vecka.',
        cta: 'Öppna budget',
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

  return (
    <>
      <button
        type="button"
        onClick={openLesson}
        className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4 text-left active:opacity-80"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-emerald-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className={sectionMetaClass}>Anchor Academy · ~{lesson.durationSec}s</p>
            <p className="text-[15px] font-semibold text-white mt-0.5">{lesson.title}</p>
            <p className={`${sectionSubtitleClass} mt-0.5`}>
              Skolan lärde inte det här — vi förklarar utifrån din situation.
            </p>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end justify-center bg-black/65"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-[22px] px-5 pt-4 pb-10 max-h-[85vh] overflow-y-auto"
              style={elevatedSheet()}
            >
              <div className="flex justify-between items-start mb-4">
                <p className={sectionMetaClass}>60-sekunders lektion</p>
                <button type="button" onClick={() => setOpen(false)} className={anchorIconButtonClass}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              {loading ? (
                <div className="flex items-center gap-2 py-8 text-white/50">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Skräddarsyr lektion…
                </div>
              ) : (
                <>
                  <h3 className="text-[20px] font-semibold text-white">{content?.title || lesson.title}</h3>
                  <p className={`${sectionSubtitleClass} mt-3 leading-relaxed whitespace-pre-wrap`}>
                    {content?.body}
                  </p>
                  {content?.takeaway && (
                    <p className="text-[14px] text-[#9FB5FF] mt-4 font-medium">{content.takeaway}</p>
                  )}
                  <button type="button" onClick={handleDone} className={`${anchorPrimaryButtonClass} w-full mt-6`}>
                    {content?.cta || 'Klar — visa mig mer'}
                  </button>
                  <Link
                    to={createPageUrl('AnchorAcademy')}
                    className="block text-center text-[13px] text-white/45 mt-3"
                    onClick={() => setOpen(false)}
                  >
                    Alla lektioner
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
