import React from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Lock, Bot, Smartphone, ChevronRight, CheckCircle } from 'lucide-react';

const valuePoints = [
  {
    icon: Lock,
    color: 'from-indigo-500 to-purple-600',
    glow: 'shadow-indigo-500/30',
    title: 'Permanent minne',
    description: 'Din ekonomi raderas aldrig. Se din utveckling över månader och år.',
  },
  {
    icon: Bot,
    color: 'from-emerald-500 to-teal-600',
    glow: 'shadow-emerald-500/30',
    title: 'Personliga AI-Botar',
    description: 'Dina botar lär känna ditt beteende och ger bättre råd ju längre du använder appen.',
  },
  {
    icon: Smartphone,
    color: 'from-blue-500 to-cyan-600',
    glow: 'shadow-blue-500/30',
    title: 'Multi-enhet',
    description: 'Börja på datorn, fortsätt i mobilen. Din data är alltid synkad.',
  },
];

const bullets = [
  'Se vad du kan spara varje månad',
  'Få full kontroll över dina pengar',
  'Planera din ekonomiska framtid',
];

export default function Landing() {
  const handleCTA = () =>
    base44.auth.redirectToLogin(window.location.origin + '/Onboarding');

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-x-hidden"
      style={{ background: 'linear-gradient(160deg, #07090f 0%, #0d1321 50%, #0b1120 100%)' }}
    >
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-120px] left-[-100px] w-96 h-96 rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
        <div className="absolute top-[40%] right-[-80px] w-72 h-72 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)' }} />
      </div>

      {/* ── HERO ── */}
      <section className="relative z-10 flex flex-col items-center px-6 pt-16 pb-12 text-center">
        {/* Logo pill */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm text-slate-400"
        >
          <span className="text-base">⚓</span>
          <span className="font-semibold tracking-wider text-white">ANCHOR</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-4xl font-black text-white leading-tight mb-4 max-w-xs"
        >
          Ta kontroll över din ekonomi och se din{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            framtid i klartext
          </span>
        </motion.h1>

        {/* Bullet list */}
        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="space-y-2 mb-8 text-left w-full max-w-xs"
        >
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-2.5 text-slate-300 text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              {b}
            </li>
          ))}
        </motion.ul>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="w-full max-w-xs space-y-3"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            onClick={handleCTA}
            className="relative w-full h-14 rounded-2xl font-bold text-white text-base overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
              boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
            }}
          >
            {/* shimmer */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 opacity-20"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)', width: '50%' }}
            />
            <span className="relative flex items-center justify-center gap-2">
              Kom igång – tar 60 sekunder
              <ChevronRight className="w-4 h-4" />
            </span>
          </motion.button>

          <p className="text-center text-xs text-slate-500">
            Ingen BankID behövs &nbsp;•&nbsp; Inga fasta åtaganden
          </p>
        </motion.div>
      </section>

      {/* ── VALUE POINTS ── */}
      <section className="relative z-10 px-6 pb-16 space-y-4 max-w-sm mx-auto w-full">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs font-semibold tracking-widest text-slate-500 uppercase mb-6"
        >
          Varför ANCHOR?
        </motion.h2>

        {valuePoints.map(({ icon: Icon, color, glow, title, description }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55 + i * 0.1, duration: 0.5 }}
            className="flex items-start gap-4 p-4 rounded-2xl border border-white/8 bg-white/4"
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0 shadow-lg ${glow}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm mb-0.5">{title}</p>
              <p className="text-slate-400 text-xs leading-relaxed">{description}</p>
            </div>
          </motion.div>
        ))}

        {/* Secondary CTA */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleCTA}
          className="w-full mt-4 h-12 rounded-2xl font-semibold text-white text-sm border border-indigo-500/50 bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors"
        >
          Skapa konto gratis
        </motion.button>
      </section>
    </div>
  );
}