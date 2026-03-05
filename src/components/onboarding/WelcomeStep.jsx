import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { TrendingUp, Shield, Zap, Eye } from 'lucide-react';
import { setGuestMode } from '@/components/guestStorage';

export default function WelcomeStep({ onNext, onGuest }) {
  const handleGuest = () => {
    setGuestMode(true);
    onGuest?.();
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 py-8"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md"
      >
        {/* Logo/Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-indigo-500/50"
        >
          <TrendingUp className="w-10 h-10 text-white" />
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-4xl font-bold text-white text-center mb-4 leading-tight"
        >
          Ta kontroll över din ekonomi
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg text-slate-400 text-center mb-12"
        >
          och se din framtid i klartext
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-4 mb-12"
        >
          {[
            { icon: Shield, text: 'Få full kontroll över dina pengar' },
            { icon: Zap, text: 'Se vad du kan spara varje månad' },
            { icon: TrendingUp, text: 'Planera din ekonomiska framtid' }
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-indigo-400" />
                </div>
                <p className="text-slate-300">{feature.text}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Button
            onClick={onNext}
            className="w-full h-16 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-lg shadow-lg shadow-indigo-500/30"
          >
            Kom igång – tar 60 sekunder
          </Button>
          <p className="text-xs text-slate-500 text-center mt-3">
            Ingen BankID behövs • Inga fasta åtaganden
          </p>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            onClick={handleGuest}
            className="w-full mt-4 py-3 rounded-xl text-slate-400 text-sm flex items-center justify-center gap-2 hover:text-slate-300 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Testa utan konto (data sparas temporärt)
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}