/**
 * Kontextuella Academy-lektioner — dyker upp i rätt ögonblick, inte som menyval.
 */
import { ACADEMY_LESSONS } from '@/lib/anchorBrain';

export const LESSON_INVITES = {
  compound_interest: 'Vill du förstå hur ränta på ränta påverkar dig?',
  many_streams: 'Vill du se var de dolda abonnemangspengarna tar vägen?',
  inflation_basics: 'Vill du förstå vad inflation gör med din lön?',
  buffer_why: 'Vill du veta varför buffert slår ner stressen?',
  cashless_blindness: 'Vill du förstå varför pengar känns osynliga i Sverige?',
  swedish_economy_basics: 'Vill du ha grunderna om svensk privatekonomi?',
};

/** Aktiva kontextuella lektioner (prioriterad lista). */
export function getContextualLessons(profile, pengometer, subScan) {
  if (!profile) return [];
  const completed = profile.academyCompleted || [];
  const out = [];

  const push = (id, trigger) => {
    if (completed.includes(id)) return;
    const lesson = ACADEMY_LESSONS.find((l) => l.id === id);
    if (!lesson) return;
    out.push({
      lesson,
      invite: LESSON_INVITES[id] || `Vill du lära dig mer om ${lesson.topic}?`,
      trigger,
    });
  };

  if ((profile.loans || []).length > 0) push('compound_interest', 'loan_added');
  if (subScan?.total_kr >= 1500) push('many_streams', 'subscriptions_high');
  if (profile.topConcern === 'plan') push('inflation_basics', 'concern_plan');
  if (profile.topConcern === 'debt') push('buffer_why', 'concern_debt');
  if (pengometer?.status === 'low' || pengometer?.status === 'empty') {
    push('cashless_blindness', 'pengometer_low');
  }

  const foundations = profile.foundationsCompleted || [];
  if (foundations.includes('school_gap')) push('swedish_economy_basics', 'foundations');

  return out;
}

/** Högst prioriterad lektion för en inline-länk. */
export function getPrimaryContextualLesson(profile, pengometer, subScan) {
  const lessons = getContextualLessons(profile, pengometer, subScan);
  return lessons[0] || null;
}
