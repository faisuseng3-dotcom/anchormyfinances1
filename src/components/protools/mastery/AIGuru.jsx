import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { getTotalFixedCosts } from '@/lib/financialUtils';
import { Loader2 } from 'lucide-react';

export default function AIGuru({ profile }) {
  const income = profile?.income || 0;
  const fixed = getTotalFixedCosts(profile || {});
  const margin = Math.max(0, income - fixed);

  const [extra, setExtra] = useState(500);
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);

  const newMargin = margin + extra;
  const monthsFreed = extra > 0 && fixed > 0 ? (extra / fixed).toFixed(1) : 0;
  const yearsSaved = extra > 0 ? (extra * 12 / 100000).toFixed(1) : 0;

  const fetchAIResponse = async (value) => {
    if (!profile) return;
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Du är en kort och träffsäker AI-ekonomicoach. Svara PÅ SVENSKA i max 2 meningar med en konkret, inspirerande insikt.

Användaren sparar ${value} kr extra per månad. Inkomst: ${income} kr, Fasta kostnader: ${fixed} kr, Nuvarande marginal: ${margin} kr.

Exempel: "Med ${value} kr extra sparar du ${Math.round(value * 12)} kr per år — det är ${Math.round(value * 12 / 1000)} resor till London."

Gör insikten personlig och konkret. Använd symboler som 🚀 eller ✨ för att göra det levande.`,
      });
      setAiResponse(result);
    } catch {
      setAiResponse(`Med ${value} kr extra per månad sparar du ${Math.round(value * 12).toLocaleString('sv-SE')} kr på ett år. Det frigör ${monthsFreed} månaders kostnader om krisen slår till.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    const t = setTimeout(() => fetchAIResponse(extra), 600);
    setDebounceTimer(t);
    return () => clearTimeout(t);
  }, [extra]);

  return (
    <div className="space-y-6">
      {/* Slider */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 border border-blue-500/20"
        style={{ background: 'rgba(59,130,246,0.06)' }}
      >
        <p className="text-sm text-slate-400 mb-4">Om jag sparar extra varje månad...</p>
        <div className="text-center mb-4">
          <motion.span
            key={extra}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-bold text-blue-400"
          >
            {extra.toLocaleString('sv-SE')}
          </motion.span>
          <span className="text-xl text-blue-300 ml-1">kr/mån</span>
        </div>
        <input
          type="range"
          min={100}
          max={Math.max(10000, Math.round(margin * 0.9))}
          step={100}
          value={extra}
          onChange={e => setExtra(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: '#60a5fa' }}
        />
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>100 kr</span>
          <span>{Math.max(10000, Math.round(margin * 0.9)).toLocaleString('sv-SE')} kr</span>
        </div>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Per år', value: `${Math.round(extra * 12).toLocaleString('sv-SE')} kr`, color: '#60a5fa' },
          { label: 'Ny marginal', value: `${newMargin.toLocaleString('sv-SE')} kr`, color: '#34d399' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl p-4 border border-white/8 text-center"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
            <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* AI Response */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl p-5 border border-indigo-500/20 min-h-[100px] flex items-center"
        style={{ background: 'rgba(99,102,241,0.08)' }}
      >
        {loading ? (
          <div className="flex items-center gap-3 w-full justify-center">
            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
            <span className="text-sm text-slate-400">AI analyserar...</span>
          </div>
        ) : (
          <motion.p
            key={aiResponse}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-slate-200 leading-relaxed"
          >
            {aiResponse || 'Dra i slidern för att få AI-analys...'}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}