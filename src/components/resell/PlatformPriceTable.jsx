import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Trophy } from 'lucide-react';

export default function PlatformPriceTable({ platformPrices = [], recommendedPlatform, result }) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Prisbevis · Live-data</p>

      {platformPrices.map((platform, i) => {
        const isTop = platform.name === recommendedPlatform;
        return (
          <motion.a
            key={platform.name}
            href={platform.searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-2xl border transition-all active:scale-98 cursor-pointer"
            style={isTop ? {
              background: 'rgba(16,185,129,0.1)',
              borderColor: 'rgba(52,211,153,0.4)',
              boxShadow: '0 0 12px rgba(16,185,129,0.15)'
            } : {
              background: 'rgba(255,255,255,0.03)',
              borderColor: 'rgba(255,255,255,0.08)'
            }}
          >
            {/* Rank */}
            <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{ background: isTop ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)' }}>
              {isTop ? <Trophy className="w-3.5 h-3.5 text-emerald-400" /> : <span className="text-xs text-slate-500">#{i + 1}</span>}
            </div>

            {/* Name & reason */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className={`text-sm font-semibold ${isTop ? 'text-emerald-300' : 'text-slate-200'}`}>{platform.name}</p>
                {isTop && <span className="text-[9px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full uppercase">Bäst</span>}
              </div>
              <p className="text-xs text-slate-500 truncate">{platform.reason}</p>
            </div>

            {/* Price */}
            <div className="text-right flex-shrink-0">
              <p className={`text-base font-bold ${isTop ? 'text-emerald-400' : 'text-white'}`}>
                {platform.estimatedPrice.toLocaleString('sv-SE')}
                <span className="text-xs font-normal text-slate-400 ml-0.5">{platform.currency}</span>
              </p>
              <ExternalLink className="w-3 h-3 text-slate-600 ml-auto mt-0.5" />
            </div>
          </motion.a>
        );
      })}

      {/* AI recommendation */}
      {result?.recommendedPlatformReason && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-3 p-3 rounded-2xl border border-purple-400/20"
          style={{ background: 'rgba(139,92,246,0.08)' }}
        >
          <p className="text-xs text-purple-300">🤖 {result.recommendedPlatformReason}</p>
        </motion.div>
      )}
    </div>
  );
}