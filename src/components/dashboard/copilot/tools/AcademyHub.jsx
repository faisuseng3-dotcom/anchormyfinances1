// @ts-nocheck
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, TrendingUp, Droplets, Flame, BookOpen, GraduationCap, Check, Lock,
} from 'lucide-react';
import { ACADEMY_LESSONS } from '@/lib/anchorBrain';
import AcademyLessonSheet from '@/components/anchorBrain/AcademyLessonSheet';
import { staggerItem } from '@/lib/motionPresets';
import CopilotToolShell from './CopilotToolShell';

const CHAPTER_META = {
  buffer_why: {
    title: 'Bli en mästare på buffert',
    subtitle: 'Atomic Habits — små steg, stor trygghet',
    icon: Shield,
    accent: '#2563EB',
  },
  compound_interest: {
    title: 'Så fungerar ränta-på-ränta',
    subtitle: 'Förstå kraften i tid och avkastning',
    icon: TrendingUp,
    accent: '#2563EB',
  },
  many_streams: {
    title: 'Många bäckar små',
    subtitle: 'Dolda abonnemang som äter marginalen',
    icon: Droplets,
    accent: '#64748B',
  },
  inflation_basics: {
    title: 'Inflation i praktiken',
    subtitle: 'Köpkraft, lön och framtidsplan',
    icon: Flame,
    accent: '#64748B',
  },
  cashless_blindness: {
    title: 'Osynliga pengar',
    subtitle: 'Kontantlöst samhälle och impulser',
    icon: BookOpen,
    accent: '#2563EB',
  },
  swedish_economy_basics: {
    title: 'Sverige — grunderna',
    subtitle: 'Inflation, ränta och risk på svenska',
    icon: GraduationCap,
    accent: '#2563EB',
  },
};

const DISPLAY_ORDER = [
  'buffer_why',
  'compound_interest',
  'many_streams',
  'inflation_basics',
  'cashless_blindness',
  'swedish_economy_basics',
];

function ChapterCard({ lesson, meta, completed, index, onOpen }) {
  const Icon = meta.icon;
  const done = completed;

  return (
    <motion.button
      type="button"
      {...staggerItem(index)}
      onClick={() => onOpen(lesson)}
      className="w-full text-left rounded-2xl organic-surface p-4 transition-all hover:bg-[var(--copilot-bg-card-hover)] active:scale-[0.98]"
      style={{
        background: done ? `color-mix(in srgb, ${meta.accent} 10%, var(--copilot-bg-card))` : 'var(--copilot-bg-card)',
        borderColor: done ? `${meta.accent}40` : undefined,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 relative"
          style={{
            background: `${meta.accent}18`,
            border: `1px solid ${meta.accent}35`,
            boxShadow: done ? `0 0 20px ${meta.accent}30` : 'none',
          }}
        >
          <Icon className="w-5 h-5" style={{ color: meta.accent }} />
          {done && (
            <span
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: meta.accent }}
            >
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-[var(--copilot-text-primary)]">{meta.title}</p>
          <p className="text-[12px] text-[var(--copilot-text-muted)] mt-0.5">{meta.subtitle}</p>
          <div className="mt-3 h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: done ? '100%' : '12%',
                background: `linear-gradient(90deg, ${meta.accent}, var(--copilot-accent-green))`,
              }}
            />
          </div>
          <p className="text-[11px] text-[var(--copilot-text-muted)] mt-2 flex items-center gap-1.5">
            {done ? (
              <><Check className="w-3 h-3 text-[var(--copilot-accent-green)]" /> Mastery upplåst</>
            ) : (
              <><Lock className="w-3 h-3" /> {lesson.durationSec}s micro-lektion</>
            )}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

export default function AcademyHub({ profile, transactions, updateProfile }) {
  const [activeLesson, setActiveLesson] = useState(null);
  const completed = profile?.academyCompleted || [];

  const chapters = DISPLAY_ORDER
    .map((id) => ACADEMY_LESSONS.find((l) => l.id === id))
    .filter(Boolean);

  const handleComplete = (payload) => {
    updateProfile?.(payload);
    setActiveLesson(null);
  };

  const mastered = chapters.filter((l) => completed.includes(l.id)).length;

  return (
    <CopilotToolShell
      title="Lago Academy"
      subtitle="Micro-learning i korta kapitel — bygg vanor som håller, ett steg i taget."
    >
      <div
        className="rounded-2xl organic-surface px-5 py-4 mb-6 flex items-center justify-between"
        style={{ background: 'var(--color-accent-soft)' }}
      >
        <div>
          <p className="text-[12px] text-[var(--copilot-text-muted)]">Din mastery</p>
          <p className="text-[22px] font-bold text-[var(--copilot-text-primary)] tabular-nums">
            {mastered}/{chapters.length} kapitel
          </p>
        </div>
        <GraduationCap className="w-8 h-8 text-[var(--copilot-accent-blue)] opacity-80" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {chapters.map((lesson, i) => {
          const meta = CHAPTER_META[lesson.id] || {
            title: lesson.title,
            subtitle: lesson.topic,
            icon: BookOpen,
            accent: '#2563EB',
          };
          return (
            <ChapterCard
              key={lesson.id}
              lesson={lesson}
              meta={meta}
              completed={completed.includes(lesson.id)}
              index={i}
              onOpen={setActiveLesson}
            />
          );
        })}
      </div>

      <AcademyLessonSheet
        open={Boolean(activeLesson)}
        onClose={() => setActiveLesson(null)}
        lesson={activeLesson}
        profile={profile}
        transactions={transactions}
        onComplete={handleComplete}
      />
    </CopilotToolShell>
  );
}
