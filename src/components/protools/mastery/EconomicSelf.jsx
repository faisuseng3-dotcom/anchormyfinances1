import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QUESTIONS = [
  { id: 'q1', text: 'Du ser en rea på något du velat ha länge. Vad gör du?', options: ['Köper direkt, priset är rätt!', 'Väntar en dag och tänker om', 'Kollar om det faktiskt behövs', 'Skippar det, sparar istället'] },
  { id: 'q2', text: 'Hur känns det när kontot är lågt?', options: ['Panik, jag kan inte sova', 'Orolig men hanterbar', 'Lugn, det löser sig', 'Jag märker knappt av det'] },
  { id: 'q3', text: 'Hur hanterar du oväntade utgifter?', options: ['Kortet går ut, löser sig sen', 'Tar från buffertkontot', 'Omfördelar budgeten direkt', 'Har en plan för allt sådant'] },
  { id: 'q4', text: 'Vad motiverar dig mest ekonomiskt?', options: ['Friheten att köpa vad jag vill', 'Att slippa oroa mig', 'Att nå ett specifikt mål', 'Att bygga långsiktig trygghet'] },
];

const PROFILES = {
  impulse: {
    title: '⚡ Impuls-shopparen',
    desc: 'Du lever i nuet och köper när det känns rätt. Din styrka är spontanitet, men det kostar dig mer än du tror.',
    tips: ['Prova 24-timmarsregeln: Vänta alltid en dag innan köp över 500 kr', 'Sätt upp auto-sparande så pengarna är borta innan frestelsen slår till', 'Spåra dina spontanköp i 1 månad — summan kommer förvåna dig'],
    color: '#f97316',
    glow: 'rgba(249,115,22,0.3)',
  },
  worrier: {
    title: '😰 Oros-spararen',
    desc: 'Du är försiktig och tänker framåt, men rädslan för att förlora kontroll kan blockera dig från att ta välgrundade risker.',
    tips: ['Bygg en "Peace-of-Mind"-buffert på 3 månader, sen kan du andas', 'Automatisera betalningar så du slipper manuell kontroll', 'Tillåt dig en "fribudget" varje månad utan skuldkänslor'],
    color: '#6366f1',
    glow: 'rgba(99,102,241,0.3)',
  },
  planner: {
    title: '📋 Strategi-planeraren',
    desc: 'Du tänker long-term och sätter upp mål. Du är i minoritet — de flesta lyckas inte med det här.',
    tips: ['Nästa steg: Investera överskottet, inte bara spara det', 'Optimera skatt och avkastning — du är redo för det steget', 'Dela din strategi med en partner för att hålla motivationen uppe'],
    color: '#10b981',
    glow: 'rgba(16,185,129,0.3)',
  },
  drifter: {
    title: '🌊 Driftaren',
    desc: 'Ekonomin är inte din prioritet — och det är okej. Men det kostar dig frihet du inte ens vet du missar.',
    tips: ['Börja med ett enda mål: spara 1 000 kr. Det skapar momentum', 'Hitta en konkret "varför" — vad skulle du göra med 50k extra?', 'Sätt upp automatiska regler så ekonomin sköter sig själv'],
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.3)',
  },
};

function classifyAnswers(answers) {
  const score = { impulse: 0, worrier: 0, planner: 0, drifter: 0 };
  const [a1, a2, a3, a4] = answers;

  if (a1 === 0) score.impulse += 3;
  else if (a1 === 1) score.worrier += 2;
  else if (a1 === 2) score.planner += 2;
  else score.drifter += 2;

  if (a2 === 0) score.worrier += 3;
  else if (a2 === 1) score.worrier += 1;
  else if (a2 === 3) score.drifter += 2;

  if (a3 === 0) score.impulse += 2;
  else if (a3 === 1) score.planner += 1;
  else if (a3 === 3) score.planner += 2;
  else score.worrier += 1;

  if (a4 === 0) score.impulse += 1;
  else if (a4 === 1) score.worrier += 2;
  else if (a4 === 2) score.planner += 2;
  else score.planner += 3;

  return Object.entries(score).sort((a, b) => b[1] - a[1])[0][0];
}

export default function EconomicSelf() {
  const [step, setStep] = useState(0); // 0 = intro, 1-4 = questions, 5 = result
  const [answers, setAnswers] = useState([]);

  const profile = useMemo(() => answers.length === QUESTIONS.length ? PROFILES[classifyAnswers(answers)] : null, [answers]);

  const handleAnswer = (idx) => {
    const next = [...answers, idx];
    setAnswers(next);
    if (next.length < QUESTIONS.length) {
      setStep(step + 1);
    } else {
      setStep(5);
    }
  };

  const reset = () => { setAnswers([]); setStep(0); };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="rounded-2xl p-5 border border-amber-500/20 text-center" style={{ background: 'rgba(245,158,11,0.07)' }}>
              <p className="text-2xl mb-2">🧠</p>
              <p className="text-white font-semibold">4 frågor. Din ekonomiska personlighet.</p>
              <p className="text-xs text-slate-400 mt-2">Baserat på beteendeekonomisk forskning från MIT och Duke University.</p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="w-full py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-600"
            >
              Starta testet →
            </button>
          </motion.div>
        )}

        {step >= 1 && step <= 4 && (
          <motion.div key={`q${step}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
            {/* Progress */}
            <div className="flex gap-1.5">
              {QUESTIONS.map((_, i) => (
                <div key={i} className="flex-1 h-1 rounded-full" style={{ background: i < step ? '#fbbf24' : 'rgba(255,255,255,0.1)' }} />
              ))}
            </div>

            <p className="text-xs text-slate-500">Fråga {step} av {QUESTIONS.length}</p>
            <p className="text-base font-semibold text-white leading-snug">{QUESTIONS[step - 1].text}</p>

            <div className="space-y-2">
              {QUESTIONS[step - 1].options.map((opt, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleAnswer(i)}
                  className="w-full text-left p-4 rounded-xl border border-white/10 text-sm text-slate-200 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all"
                >
                  {opt}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 5 && profile && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
            <div className="rounded-2xl p-5 border" style={{ background: `${profile.color}10`, borderColor: `${profile.color}30`, boxShadow: `0 0 30px ${profile.glow}` }}>
              <p className="text-xl font-bold text-white mb-2">{profile.title}</p>
              <p className="text-sm text-slate-300 leading-relaxed">{profile.desc}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dina 3 åtgärder</p>
              {profile.tips.map((tip, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
                  className="flex gap-3 p-3 rounded-xl border border-white/8" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span className="text-sm font-bold" style={{ color: profile.color }}>{i + 1}</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{tip}</p>
                </motion.div>
              ))}
            </div>

            <button onClick={reset} className="w-full py-2.5 rounded-xl text-sm text-slate-400 border border-white/10 hover:border-white/20">
              Gör om testet
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}