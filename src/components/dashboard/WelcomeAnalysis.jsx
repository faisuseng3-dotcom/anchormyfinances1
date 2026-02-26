import React from 'react';
import { motion } from 'framer-motion';
import { X, TrendingUp, PiggyBank, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";

const formatNumber = (value) => {
  return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
};

export default function WelcomeAnalysis({ profile, onClose }) {
  if (!profile) return null;

  const monthlyLeft = profile.income - profile.housingCost;
  const yearSavings = monthlyLeft * 0.3 * 12; // Assume 30% savings rate
  const monthsToGoal = profile.savingsGoal > 0 
    ? Math.ceil((profile.savingsGoal - profile.buffer) / (monthlyLeft * 0.3))
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-effect rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/10"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="w-5 h-5 text-slate-400" />
          </Button>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Din ekonomiska analys</h2>
        <p className="text-slate-400 mb-6">Baserat på det du fyllt i har vi gjort en snabbanalys.</p>

        {/* Analysis Cards */}
        <div className="space-y-4 mb-8">
          {/* Monthly Left */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Du har cirka</p>
                <p className="text-2xl font-bold text-white">{formatNumber(monthlyLeft)} kr</p>
              </div>
            </div>
            <p className="text-sm text-slate-400">kvar varje månad efter fasta kostnader</p>
          </div>

          {/* Yearly Potential */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Om du sparar 30% kan du ha</p>
                <p className="text-2xl font-bold text-white">{formatNumber(yearSavings)} kr</p>
              </div>
            </div>
            <p className="text-sm text-slate-400">om ett år</p>
          </div>

          {/* Goal Timeline */}
          {profile.savingsGoal > 0 && monthsToGoal > 0 && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Ditt sparmål kan nås om</p>
                  <p className="text-2xl font-bold text-white">{monthsToGoal} månader</p>
                </div>
              </div>
              <p className="text-sm text-slate-400">med nuvarande sparande</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <Button
          onClick={onClose}
          className="w-full h-14 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold"
        >
          Fortsätt till dashboard
        </Button>
      </motion.div>
    </motion.div>
  );
}