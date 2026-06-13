import React from 'react';
import { motion } from 'framer-motion';
import AnchorKey from './AnchorKey';
import { ArrowRight, Compass, Star, Sparkles, PartyPopper, Zap } from 'lucide-react';

const CONFETTI_ICONS = [Star, Sparkles, PartyPopper, Sparkles, Star, Zap];

export default function SignupConfirmation({ profile, persona, onContinue }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
    >
      <div className="w-full max-w-md text-center">
        {/* Confetti-like sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 0, x: 0 }}
            animate={{
              opacity: [0, 1, 0],
              y: [-20, -80],
              x: [0, (i % 2 === 0 ? 1 : -1) * (20 + i * 15)],
            }}
            transition={{ delay: i * 0.1, duration: 1.2 }}
            className="absolute pointer-events-none text-xl"
            style={{ left: '50%', top: '30%' }}
          >
            {(() => {
              const Icon = CONFETTI_ICONS[i];
              return <Icon className="w-5 h-5 text-indigo-300" />;
            })()}
          </motion.div>
        ))}

        {/* Anchor Key */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <AnchorKey profile={profile} persona={persona} />
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-white mb-3">
            Välkommen till<br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent text-3xl">
              Anchor-familjen
            </span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Din ekonomiska framtid är nu säkrad.<br />
            Ovan är din unika <strong className="text-white">Anchor Key</strong> — ett exklusivt fingeravtryck genererat från just din ekonomiprofil.
          </p>
        </motion.div>

        {/* Stats preview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          {[
            { label: 'Minne', value: '∞', sub: 'månaders historia' },
            { label: 'Signaler', value: '3', sub: 'aktiva spår' },
            { label: 'Enheter', value: '∞', sub: 'alltid synkad' },
          ].map((stat, i) => (
            <div
              key={i}
              className="rounded-2xl p-3 text-center"
              style={{ background: 'rgba(255,255,255,0.04)', boxShadow: 'var(--anchor-shadow-1)' }}
            >
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{stat.sub}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          onClick={onContinue}
          whileTap={{ scale: 0.97 }}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30"
        >
          <Compass className="w-5 h-5" />
          Utforska din dashboard
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}