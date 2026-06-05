// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, X, BookOpen } from 'lucide-react';
import OnboardingStep from './OnboardingStep';
import {
  MODULE_SCHOOL_GAP,
  gradeFoundationQuiz,
} from '@/lib/swedishEconomyFoundations';
import {
  onboardingPrimaryBtn,
  onboardingBackBtn,
  onboardingChoiceCard,
  onboardingChoiceCheck,
} from './onboardingUi';
import { cn } from '@/lib/utils';

const MODULE = MODULE_SCHOOL_GAP;

export default function SwedishBasicsFoundationStep({ data, onChange, onNext, onBack, testMode = false }) {
  const [phase, setPhase] = useState('read');
  const [cardIndex, setCardIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [qIndex, setQIndex] = useState(0);

  const grade = useMemo(
    () => (submitted ? gradeFoundationQuiz(MODULE, answers) : null),
    [submitted, answers],
  );

  const currentQ = MODULE.questions[qIndex];
  const allAnswered = MODULE.questions.every((q) => answers[q.id]);

  const handleSelect = (questionId, optionId) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmitQuiz = () => {
    if (!allAnswered) return;
    setSubmitted(true);
    const result = gradeFoundationQuiz(MODULE, answers);
    if (result.passed) {
      const completed = [...new Set([...(data.foundationsCompleted || []), MODULE.id])];
      onChange({ ...data, foundationsCompleted: completed });
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setQIndex(0);
  };

  const card = MODULE.readCards[cardIndex];

  return (
    <OnboardingStep
      title={MODULE.title}
      subtitle={phase === 'read' ? MODULE.subtitle : MODULE.quizIntro}
    >
      <AnimatePresence mode="wait">
        {phase === 'read' && (
          <motion.div
            key="read"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            <div className="flex items-center gap-2 text-[12px] text-white/40">
              <BookOpen className="w-3.5 h-3.5" />
              <span>
                Läs {cardIndex + 1} av {MODULE.readCards.length}
              </span>
            </div>

            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-5 bg-white/[0.06] ring-1 ring-white/[0.1]"
            >
              <p className="text-[17px] font-semibold text-white">{card.title}</p>
              <p className="text-[14px] text-white/65 leading-relaxed mt-3">{card.body}</p>
              <p className="text-[13px] text-cyan-200/80 leading-relaxed mt-4 pt-4 border-t border-white/[0.08]">
                <span className="font-medium text-cyan-300/90">Varför det gynnar dig: </span>
                {card.benefit}
              </p>
            </motion.div>

            <p className="text-[12px] text-white/35 leading-relaxed">{MODULE.sourceNote}</p>

            <div className="flex gap-3 pt-2">
              {cardIndex > 0 ? (
                <button
                  type="button"
                  onClick={() => setCardIndex((i) => i - 1)}
                  className={onboardingBackBtn}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Föregående
                </button>
              ) : (
                <button type="button" onClick={onBack} className={onboardingBackBtn}>
                  Tillbaka
                </button>
              )}
              {cardIndex < MODULE.readCards.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCardIndex((i) => i + 1)}
                  className={`${onboardingPrimaryBtn} flex-1`}
                >
                  Nästa
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setPhase('quiz');
                    setQIndex(0);
                  }}
                  className={`${onboardingPrimaryBtn} flex-1`}
                >
                  Till quiz
                </button>
              )}
            </div>
          </motion.div>
        )}

        {phase === 'quiz' && !submitted && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            <p className="text-[12px] text-white/40">
              Fråga {qIndex + 1} av {MODULE.questions.length}
            </p>
            <p className="text-[16px] font-medium text-white leading-snug">{currentQ.prompt}</p>
            <div className="space-y-2">
              {currentQ.options.map((opt) => {
                const selected = answers[currentQ.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect(currentQ.id, opt.id)}
                    className={onboardingChoiceCard(selected)}
                  >
                    <div className="flex items-center gap-3">
                      <span className={onboardingChoiceCheck(selected)}>
                        {selected && <Check className="w-3.5 h-3.5 text-[#0a1628]" />}
                      </span>
                      <span className="text-[15px] text-white/90 text-left">{opt.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (qIndex === 0) setPhase('read');
                  else setQIndex((i) => i - 1);
                }}
                className={onboardingBackBtn}
              >
                Tillbaka
              </button>
              {qIndex < MODULE.questions.length - 1 ? (
                <button
                  type="button"
                  disabled={!answers[currentQ.id]}
                  onClick={() => setQIndex((i) => i + 1)}
                  className={`${onboardingPrimaryBtn} flex-1 disabled:opacity-40`}
                >
                  Nästa fråga
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!allAnswered}
                  onClick={handleSubmitQuiz}
                  className={`${onboardingPrimaryBtn} flex-1 disabled:opacity-40`}
                >
                  Rätta svar
                </button>
              )}
            </div>
          </motion.div>
        )}

        {phase === 'quiz' && submitted && grade && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div
              className={cn(
                'rounded-2xl p-5 ring-1',
                grade.passed
                  ? 'bg-emerald-500/10 ring-emerald-400/30'
                  : 'bg-rose-500/10 ring-rose-400/30',
              )}
            >
              <p className="text-[18px] font-semibold text-white">
                {grade.passed ? 'Godkänt — du kan gå vidare' : 'Inte riktigt än'}
              </p>
              <p className="text-[14px] text-white/60 mt-2">
                {grade.correct} av {grade.total} rätt
                {grade.passed
                  ? ' — du har koll på svenska grunderna.'
                  : ` — minst ${MODULE.passCount} rätt krävs. Läs igen och försök på nytt.`}
              </p>
            </div>

            <ul className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
              {grade.results.map((r, i) => {
                const q = MODULE.questions.find((x) => x.id === r.questionId);
                return (
                  <li
                    key={r.questionId}
                    className={cn(
                      'rounded-xl p-3 text-[13px] ring-1',
                      r.correct
                        ? 'bg-white/[0.04] ring-white/[0.08]'
                        : 'bg-white/[0.06] ring-amber-400/25',
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {r.correct ? (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="text-white/80 font-medium">{q?.prompt}</p>
                        {!r.correct && (
                          <p className="text-white/50 mt-1 leading-relaxed">{r.explanation}</p>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="flex gap-3 pt-2">
              {grade.passed ? (
                <button type="button" onClick={onNext} className={`${onboardingPrimaryBtn} w-full`}>
                  {testMode ? 'Spara och tillbaka till appen' : 'Fortsätt'}
                </button>
              ) : (
                <>
                  <button type="button" onClick={() => setPhase('read')} className={onboardingBackBtn}>
                    Läs igen
                  </button>
                  <button type="button" onClick={handleRetry} className={`${onboardingPrimaryBtn} flex-1`}>
                    Nytt försök
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </OnboardingStep>
  );
}
