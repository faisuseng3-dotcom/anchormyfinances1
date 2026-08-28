import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowUp, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { classifyQuestionLocally, classifyQuestionWithLLM } from '@/lib/futureQuestions/intentClassifier';
import { computeScenario } from '@/lib/futureQuestions/scenarioMath';
import { buildProactiveInsights } from '@/lib/futureQuestions/proactiveInsights';
import { dashboardEntryItem } from '@/lib/motionPresets';
import FutureBaseline from './FutureBaseline';
import FutureInsightCards from './FutureInsightCards';
import FutureAnswerCard from './FutureAnswerCard';

const SUGGESTIONS = [
  'Vad händer om jag slutar köpa fika?',
  'Vad händer om jag sparar 2000 kr extra per månad?',
  'Hur mycket pengar har jag om 10 år?',
  'Vad händer om jag blir arbetslös i 6 månader?',
  'Vad händer om jag amorterar mer?',
];

export default function FutureConversation({ profile, transactions }) {
  const [question, setQuestion] = useState('');
  const [thread, setThread] = useState([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const insights = useMemo(() => buildProactiveInsights(profile, transactions), [profile, transactions]);
  const reduced = useReducedMotion();
  const entry = (i) => dashboardEntryItem(i, { reduced });

  const runQuestion = async (rawQuestion) => {
    const q = rawQuestion.trim();
    if (!q || pending) return;
    setPending(true);
    setError(null);

    let classified = classifyQuestionLocally(q);
    if (!classified) {
      try {
        classified = await classifyQuestionWithLLM(base44, q);
      } catch {
        classified = null;
      }
    }

    if (!classified) {
      setError('Jag kunde inte tolka den frågan än. Prova en av förslagen nedan, eller skriv om den med ett ungefärligt belopp.');
      setPending(false);
      return;
    }

    const result = computeScenario(classified.intent, classified, profile, transactions);
    if (!result) {
      setError('Jag kunde inte räkna på det just nu.');
      setPending(false);
      return;
    }

    setThread((prev) => [
      { id: `${Date.now()}`, question: q, result, intent: classified.intent, amountKr: classified.amountKr },
      ...prev,
    ]);
    setQuestion('');
    setPending(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    runQuestion(question);
  };

  return (
    <div className="space-y-6">
      <motion.div {...entry(0)}>
        <FutureBaseline profile={profile} transactions={transactions} />
      </motion.div>

      <motion.form {...entry(1)} onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Fråga vad som helst om din framtid…"
          className="w-full rounded-[20px] px-5 py-4 pr-14 text-[15px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none"
          style={{ background: '#FFFFFF', border: '1px solid var(--color-border)' }}
        />
        <button
          type="submit"
          disabled={pending || !question.trim()}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-30 transition-opacity"
          style={{ background: 'var(--color-accent)' }}
          aria-label="Fråga"
        >
          {pending ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          ) : (
            <ArrowUp className="w-4 h-4 text-white" />
          )}
        </button>
      </motion.form>

      <motion.div {...entry(2)} className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => runQuestion(s)}
            disabled={pending}
            className="text-[12.5px] text-[var(--color-text-secondary)] px-3.5 py-2 rounded-full disabled:opacity-40"
            style={{ background: '#FFFFFF', border: '1px solid var(--color-border)' }}
          >
            {s}
          </button>
        ))}
      </motion.div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[13px] text-[var(--color-danger)]"
        >
          {error}
        </motion.p>
      )}

      {thread.length === 0 && (
        <motion.div {...entry(3)}>
          <FutureInsightCards insights={insights} onSelect={runQuestion} />
        </motion.div>
      )}

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {thread.map((item) => (
            <FutureAnswerCard
              key={item.id}
              question={item.question}
              result={item.result}
              intent={item.intent}
              amountKr={item.amountKr}
              profile={profile}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
