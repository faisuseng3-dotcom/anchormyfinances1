import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { pageSeoFor } from '@/lib/pageSeo';
import { useModeContext } from '@/components/modes/ModeContext';

export const pageSeo = pageSeoFor('Landing');

const LETTERS = ['L', 'a', 'g', 'o'];
const LETTER_DELAY = 0.25;
const LETTER_START = 0.2;
const BUTTON_DELAY = LETTER_START + LETTERS.length * LETTER_DELAY + 0.4;

export default function Landing() {
  const navigate = useNavigate();
  const { setPersonal } = useModeContext();

  const goSignup = () => {
    setPersonal();
    navigate(createPageUrl('CreateAccount'));
  };

  return (
    <div
      className="flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#080F0B' }}
    >
      <div
        className="flex items-center"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        {LETTERS.map((letter, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: LETTER_START + i * LETTER_DELAY,
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              color: '#E8F0EA',
              fontSize: 'clamp(64px, 10vw, 80px)',
              lineHeight: 1,
            }}
          >
            {letter}
          </motion.span>
        ))}
      </div>

      <motion.button
        type="button"
        onClick={goSignup}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: BUTTON_DELAY, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="cursor-pointer"
        style={{
          marginTop: '2.5rem',
          padding: '0.75rem 2rem',
          borderRadius: '9999px',
          border: '1px solid rgba(232, 240, 234, 0.35)',
          background: 'transparent',
          color: '#E8F0EA',
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: '16px',
          letterSpacing: '0.02em',
        }}
      >
        Kom igång
      </motion.button>
    </div>
  );
}
