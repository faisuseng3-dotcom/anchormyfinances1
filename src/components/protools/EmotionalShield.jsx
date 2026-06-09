import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, MessageCircle, Check, Moon, PartyPopper, Store } from 'lucide-react';

export default function EmotionalShield({ profile }) {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();

  const isRiskTime = (hour >= 20 || hour < 6) || (day === 0 || day === 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-3xl-2 ${
        isRiskTime 
          ? 'border-amber-500 bg-amber-500/10' 
          : 'border-emerald-500 bg-emerald-500/10'
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        <Shield className={`w-6 h-6 ${isRiskTime ? 'text-amber-400' : 'text-emerald-400'}`} />
        <h3 className="font-semibold text-white">Emotional Spending Shield</h3>
      </div>

      {isRiskTime ? (
        <>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-400" />
            <p className="text-amber-400 font-medium">Risk-tid aktiv</p>
          </div>
          <p className="text-sm text-slate-300 mb-4">
            Du är i en risktid för impulsköp (sen kväll eller helg).
          </p>
          <div className="p-4 rounded-xl bg-black/20 border border-amber-500/30">
            <p className="text-sm text-white font-medium mb-2">
              <MessageCircle className="w-4 h-4 inline mr-1" aria-hidden /> Fråga dig själv:
            </p>
            <p className="text-sm text-slate-300">
              "Kommer detta köp göra mig lycklig om 30 dagar?"
            </p>
          </div>
        </>
      ) : (
        <>
          <p className="text-emerald-400 font-medium mb-2 inline-flex items-center gap-1"><Check className="w-4 h-4" aria-hidden /> Säker köptid</p>
          <p className="text-sm text-slate-300">
            Du är inte i en risktid för impulsköp just nu.
          </p>
        </>
      )}

      <div className="mt-6 p-4 rounded-xl bg-white/5">
        <p className="text-xs text-slate-400 mb-2">Dina risktider:</p>
        <div className="space-y-1 text-sm text-slate-300">
          <p className="inline-flex items-center gap-1.5"><Moon className="w-3.5 h-3.5" aria-hidden /> Kvällar efter 20:00</p>
          <p className="inline-flex items-center gap-1.5"><PartyPopper className="w-3.5 h-3.5" aria-hidden /> Helger (lördag & söndag)</p>
          <p className="inline-flex items-center gap-1.5"><Store className="w-3.5 h-3.5" aria-hidden /> Köpcentrum (platsbaserat - kommer snart)</p>
        </div>
      </div>
    </motion.div>
  );
}