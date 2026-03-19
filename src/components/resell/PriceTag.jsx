import React from 'react';
import { motion } from 'framer-motion';
import { Tag } from 'lucide-react';

export default function PriceTag({ result }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', delay: 0.2, damping: 18, stiffness: 250 }}
      className="absolute top-4 right-4 z-10"
    >
      {/* AR price tag */}
      <div
        className="relative rounded-2xl px-4 py-3 text-right shadow-2xl min-w-[130px]"
        style={{
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(52,211,153,0.5)',
          boxShadow: '0 0 20px rgba(52,211,153,0.3), inset 0 0 20px rgba(52,211,153,0.05)'
        }}
      >
        {/* Glow dot */}
        <motion.div
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute top-2 left-2 w-2 h-2 rounded-full bg-emerald-400"
        />

        <p className="text-[9px] text-emerald-400 font-mono tracking-widest uppercase mb-0.5">Marknadspris</p>
        <p className="text-2xl font-black text-white leading-none">{result.avgPrice}<span className="text-sm ml-1 text-slate-400">kr</span></p>
        <p className="text-[9px] text-slate-500 mt-0.5">{result.quickSalePrice}–{result.maxPrice} kr</p>

        <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-1 justify-end">
          <Tag className="w-3 h-3 text-slate-400" />
          <p className="text-[9px] text-slate-400 font-mono">{result.brand?.toUpperCase()}</p>
        </div>

        {/* Confidence badge */}
        <div className={`absolute -top-2 -left-2 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${
          result.confidence === 'hög' ? 'bg-emerald-500 text-white' :
          result.confidence === 'medel' ? 'bg-amber-500 text-white' :
          'bg-slate-600 text-slate-200'
        }`}>
          {result.confidence}
        </div>
      </div>

      {/* AR connector line */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="w-px h-4 bg-emerald-400/50" />
        <div className="w-2 h-2 rounded-full bg-emerald-400/70" />
      </div>
    </motion.div>
  );
}