import React, { useState } from 'react';
import AcademyLessonSheet from '@/components/anchorBrain/AcademyLessonSheet';
import { getPrimaryContextualLesson } from '@/lib/contextualLessons';
import { calculatePengometer, scanSubscriptions } from '@/lib/anchorBrain';

/**
 * Kontextuell lektionslänk — en rad, inget avbrott. Öppnar sheet vid klick.
 */
export default function ContextualLessonLink({
  profile,
  transactions,
  lesson: lessonProp,
  invite: inviteProp,
  onLessonComplete,
  className = '',
}) {
  const [open, setOpen] = useState(false);

  const detected = React.useMemo(() => {
    if (lessonProp) return { lesson: lessonProp, invite: inviteProp };
    const pengometer = calculatePengometer(profile, transactions);
    const subScan = scanSubscriptions(profile, transactions);
    return getPrimaryContextualLesson(profile, pengometer, subScan);
  }, [profile, transactions, lessonProp, inviteProp]);

  if (!detected?.lesson) return null;

  const handleComplete = (lessonId) => {
    const completed = [...new Set([...(profile?.academyCompleted || []), lessonId])];
    onLessonComplete?.({ academyCompleted: completed, lastAcademyLessonId: lessonId });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`text-left text-[13px] text-violet-300/85 hover:text-violet-200 underline-offset-2 hover:underline transition-colors ${className}`}
      >
        {detected.invite}
      </button>
      <AcademyLessonSheet
        open={open}
        onClose={() => setOpen(false)}
        lesson={detected.lesson}
        profile={profile}
        transactions={transactions}
        onComplete={handleComplete}
      />
    </>
  );
}
