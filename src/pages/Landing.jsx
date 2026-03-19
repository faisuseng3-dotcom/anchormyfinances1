import React from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Shield, Zap, Brain, TrendingUp } from 'lucide-react';

const perks = [
  { icon: Brain, text: 'Gratis AI-coach ingår' },
  { icon: Shield, text: '100% säker & krypterad' },
  { icon: Zap, text: 'Klar på 2 minuter' },
  { icon: TrendingUp, text: 'Ingen bank krävs' },
];

export default function Landing() {
  const goToSignup = () => base44.auth.redirectToLogin(window.location.origin + '/Onboarding');
  const goToLogin = () => base44.auth.redirectToLogin(window.location.origin + '/Dashboard');

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0e1a 0%, #111827 60%, #0f172a 100%)' }}>

      {/* Ambient glow blobs */}
      <div className="absolute top-[-100px] left-[-80px] w-80 h-80 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-80px] right-[-60px] w-64 h-64 rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)' }} />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center gap-3 mt-4"
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40">
          <span className="text-4xl font-black text-white">⚓</span>
        </div>
        <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
          ANCHOR
        </h1>
        <p className="text-slate-400 text-sm text-center">Din personliga AI-ekonomicoach</p>
      </motion.div>

      {/* Hero text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-center space-y-4 max-w-xs"
      >
        <h2 className="text-2xl font-bold text-white leading-snug">
          Börja din resa mot<br />
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            ekonomisk frihet
          </span>
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Koppla din ekonomi, sätt mål och få AI-drivna insikter — helt gratis.
        </p>

        {/* Perks */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {perks.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/8">
              <Icon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="text-xs text-slate-300">{text}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="w-full max-w-xs space-y-3"
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={goToSignup}
          className="w-full h-14 rounded-2xl font-bold text-white text-base relative overflow-hidden shadow-lg shadow-indigo-500/30"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)' }}
        >
          <motion.div
            animate={{ x: ['0%', '100%', '0%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 opacity-20"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }}
          />
          <span className="relative">Bli vän med din ekonomi →</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={goToLogin}
          className="w-full h-12 rounded-2xl font-semibold text-slate-300 text-sm border border-white/15 hover:bg-white/5 transition-colors"
        >
          Logga in
        </motion.button>

        <p className="text-center text-xs text-slate-600 pb-2">
          Genom att fortsätta godkänner du våra användarvillkor
        </p>
      </motion.div>
    </div>
  );
}