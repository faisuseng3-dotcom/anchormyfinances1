import React from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Lock, Bot, Smartphone, ChevronRight, CheckCircle } from 'lucide-react';

const valuePoints = [
  {
    icon: Lock,
    color: 'from-indigo-500 to-purple-600',
    title: 'Permanent minne',
    description: 'Din ekonomi raderas aldrig. Se din utveckling över månader och år.',
  },
  {
    icon: Bot,
    color: 'from-emerald-500 to-teal-600',
    title: 'Personliga AI-Botar',
    description: 'Dina botar lär känna ditt beteende och ger bättre råd ju längre du använder appen.',
  },
  {
    icon: Smartphone,
    color: 'from-blue-500 to-cyan-600',
    title: 'Multi-enhet',
    description: 'Börja på datorn, fortsätt i mobilen. Din data är alltid synkad.',
  },
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

      {/* Flow indicator */}
      <div className="relative z-10 flex justify-center pt-8 pb-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">1</div>
            <span className="text-slate-300 font-medium">Skapa konto</span>
          </div>
          <div className="w-8 h-px bg-white/20" />
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-slate-500 text-[10px] font-bold">2</div>
            <span>Dina mål</span>
          </div>
          <div className="w-8 h-px bg-white/20" />
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-slate-500 text-[10px] font-bold">3</div>
            <span>Din ekonomi</span>
          </div>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="relative z-10 flex flex-col items-center px-6 pt-8 pb-10 text-center">
        {/* Logo pill */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm text-slate-400"
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
          Ta kontroll över din ekonomi – se din{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            framtid i klartext
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-slate-400 text-sm mb-8 max-w-xs"
        >
          Skapa ett gratis konto på 60 sekunder – appen fylls direkt med dina siffror och AI-analyser.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
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
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 opacity-20"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)', width: '50%' }}
            />
            <span className="relative flex items-center justify-center gap-2">
              Skapa konto gratis
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

        {valuePoints.map(({ icon: Icon, color, title, description }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55 + i * 0.1, duration: 0.5 }}
            className="flex items-start gap-4 p-4 rounded-2xl border border-white/8 bg-white/4"
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0 shadow-lg`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm mb-0.5">{title}</p>
              <p className="text-slate-400 text-xs leading-relaxed">{description}</p>
            </div>
          </motion.div>
        ))}

        {/* Already have account */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center text-xs text-slate-600 pt-2"
        >
          Har du redan ett konto?{' '}
          <button onClick={handleCTA} className="text-indigo-400 underline underline-offset-2">
            Logga in
          </button>
        </motion.p>
      </section>
    </div>
  );
}