import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Star, Flame, Target, Shield, Trophy } from 'lucide-react';

const BADGE_CONFIGS = {
  first_thousand: {
    Icon: Star,
    title: 'Första tusenlappen!',
    description: 'Du sparade första 1000 kr',
    color: 'from-yellow-500 to-amber-600'
  },
  debt_destroyer: {
    Icon: Flame,
    title: 'Skuld-Slayer!',
    description: 'Du betalade av ett helt lån',
    color: 'from-red-500 to-pink-600'
  },
  streak_master: {
    Icon: Flame,
    title: 'Streak Master!',
    description: '7 dagars inloggningsstreak',
    color: 'from-orange-500 to-red-600'
  },
  expense_tracker: {
    Icon: Target,
    title: 'Spenderbjörn!',
    description: 'Du registrerade 20 utgifter',
    color: 'from-cyan-500 to-blue-600'
  },
  buffer_builder: {
    Icon: Shield,
    title: 'Buffer Builder!',
    description: 'Din buffert är 3+ månaders lön',
    color: 'from-purple-500 to-indigo-600'
  }
};

export default function BadgeUnlock({ badgeId, isVisible, onClose }) {
  useEffect(() => {
    if (isVisible && badgeId) {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#9370DB']
      });
    }
  }, [isVisible, badgeId]);

  const badge = badgeId ? BADGE_CONFIGS[badgeId] : null;

  if (!badge || !isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.8, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 100 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 text-center"
          >
            {/* Badge Circle */}
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.1, 1] }}
              transition={{
                rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
                scale: { duration: 2, repeat: Infinity }
              }}
              className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${badge.color} shadow-2xl flex items-center justify-center mb-6`}
            >
              <badge.Icon className="w-14 h-14 text-white" />
            </motion.div>

            {/* Text */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-black text-white mb-2"
            >
              {badge.title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-slate-300 text-lg mb-8"
            >
              {badge.description}
            </motion.p>

            {/* Tap to close hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-xs text-slate-500"
            >
              Tryck för att stänga
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}