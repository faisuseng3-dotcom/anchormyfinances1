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
              Skapa konto med e-post
              <ChevronRight className="w-4 h-4" />
            </span>
          </motion.button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-slate-600 text-xs">eller</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            onClick={handleCTA}
            className="w-full h-12 rounded-2xl font-semibold text-white text-sm flex items-center justify-center gap-2 border border-white/15"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Fortsätt med Google
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