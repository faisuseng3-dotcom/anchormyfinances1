import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Anchor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const POINTS = [
  {
    icon: '🚀',
    title: 'Låga fasta kostnader',
    text: 'Din största styrka är att du håller dina fasta utgifter nere. Det ger dig en enorm frihet varje månad och skapar utrymme för det som verkligen betyder något.',
  },
  {
    icon: '✅',
    title: 'Budgetdisciplin',
    text: 'Du håller din budget stenhårt denna månad. Du har full kontroll på dina flöden och inga tecken på onödigt läckage i vardagen.',
  },
  {
    icon: '📈',
    title: 'Sparhjälte',
    text: 'Din förmåga att prioritera ditt sparande till Japan gör att du ligger före din plan. Du är på väg att nå målet snabbare än beräknat.',
  },
];

export default function AnchorAnalysis() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(170deg, #f0fafa 0%, #e8f4f8 40%, #f5f0ff 100%)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold"
          style={{ color: '#0D7377' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Tillbaka
        </button>
        <div className="flex items-center gap-2">
          <Anchor className="w-4 h-4" style={{ color: '#0D7377' }} />
          <span className="text-sm font-black" style={{ color: '#0D7377' }}>Anchor Analys</span>
        </div>
        <div style={{ width: 64 }} />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-10">

        {/* Hero headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5"
            style={{ background: 'rgba(13,115,119,0.10)', border: '2px solid rgba(13,115,119,0.18)' }}
          >
            <Anchor className="w-7 h-7" style={{ color: '#0D7377' }} />
          </div>
          <h1 className="text-3xl font-black leading-tight" style={{ color: '#1A2332', letterSpacing: '-0.02em' }}>
            Din ekonomi är<br />stark, Alex.
          </h1>
          <p className="mt-3 text-sm" style={{ color: '#6B7E96' }}>
            Baserat på din aktivitet denna månad
          </p>
        </motion.div>

        {/* Bullet points */}
        <div className="space-y-6 mb-12">
          {POINTS.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.45 }}
              className="flex items-start gap-5"
            >
              <span className="text-3xl flex-shrink-0 mt-1">{point.icon}</span>
              <div>
                <p className="text-base font-black mb-1" style={{ color: '#1A2332' }}>
                  {point.title}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: '#5A6B7E', lineHeight: 1.7 }}>
                  {point.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Closing quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="rounded-2xl px-6 py-5 mb-10"
          style={{ background: 'rgba(13,115,119,0.07)', border: '1px solid rgba(13,115,119,0.12)' }}
        >
          <p className="text-sm leading-relaxed text-center font-medium" style={{ color: '#2D5A5C' }}>
            "Du har byggt en trygg maskin. Fortsätt prioritera de fasta kostnaderna och du har total frihet."
          </p>
          <p className="text-[11px] text-center mt-2 font-bold" style={{ color: 'rgba(13,115,119,0.5)' }}>
            — ⚓ Anchor
          </p>
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(-1)}
          className="w-full py-5 rounded-2xl text-base font-black text-white shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #0D7377 0%, #0FDEBD 100%)',
            boxShadow: '0 8px 24px rgba(13,115,119,0.28)',
          }}
        >
          Tillbaka till översikt
        </motion.button>
      </div>
    </div>
  );
}