import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock, Bot, Smartphone, ArrowRight, Eye } from 'lucide-react';
import { createPageUrl } from '@/utils';

const perks = [
  {
    icon: Lock,
    emoji: '🔒',
    title: 'Permanent minne',
    desc: 'Din ekonomi raderas aldrig. Se din utveckling över månader och år.',
    color: 'from-indigo-500 to-blue-600',
  },
  {
    icon: Bot,
    emoji: '🤖',
    title: 'Personliga signaler',
    desc: 'Anchor lär känna ditt beteende och ger skarpare insikter ju längre du använder appen.',
    color: 'from-purple-500 to-pink-600',
  },
  {
    icon: Smartphone,
    emoji: '📱',
    title: 'Multi-enhet',
    desc: 'Börja på datorn, fortsätt i mobilen. Din data är alltid synkad.',
    color: 'from-emerald-500 to-teal-600',
  },
];

export default function SignupValueScreen({ onContinue, onGuest }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="text-5xl mb-4">⚓</div>
          <h1 className="text-3xl font-bold text-white mb-2">Skapa ditt konto</h1>
          <p className="text-slate-400">Lås upp hela Anchor-upplevelsen</p>
        </motion.div>

        {/* Perks */}
        <div className="space-y-4 mb-10">
          {perks.map((perk, i) => (
            <motion.div
              key={i}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.12 }}
              className="flex items-start gap-4 p-4 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${perk.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                <span className="text-xl">{perk.emoji}</span>
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{perk.title}</p>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">{perk.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <button
            onClick={onContinue}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 transition-all"
          >
            Skapa konto gratis
            <ArrowRight className="w-5 h-5" />
          </button>

          <Link
            to={createPageUrl('Login')}
            className="block w-full mt-4 py-3 text-slate-400 text-sm text-center hover:text-white transition-colors no-underline"
          >
            Har du redan konto? Logga in
          </Link>
          <Link
            to="/Pricing"
            className="block w-full py-2 text-slate-500 text-xs text-center hover:text-slate-300 transition-colors no-underline"
          >
            Se priser
          </Link>

          {onGuest && (
            <button
              onClick={onGuest}
              className="w-full py-3 text-slate-500 text-sm flex items-center justify-center gap-2 hover:text-slate-300 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Testa utan konto istället
            </button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}