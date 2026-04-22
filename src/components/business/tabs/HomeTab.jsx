import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, ArrowUpRight, ArrowDownLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const FLOW_DATA = [
  { v: 42000 }, { v: 38000 }, { v: 51000 },
  { v: 44000 }, { v: 56000 }, { v: 48000 }, { v: 52000 },
];

const RECENT_TX = [
  { vendor: 'Adobe Creative Cloud', amount: -599, date: 'Idag', category: 'Programvara', emoji: '🎨' },
  { vendor: 'Kund: Eriksson AB', amount: 18500, date: 'Igår', category: 'Inkomst', emoji: '🏢' },
  { vendor: 'SJ AB', amount: -1240, date: '10 apr', category: 'Resor', emoji: '🚆' },
];

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

export default function HomeTab({ safeToSpend, label, onScannerOpen }) {
  const fileRef = useRef();

  const handleCamera = () => {
    if (onScannerOpen) { onScannerOpen(); return; }
    fileRef.current?.click();
  };

  return (
    <div className="px-5 space-y-4">

      {/* ── HERO: SAFE TO SPEND ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl overflow-hidden relative"
        style={{
          background: 'linear-gradient(145deg, #0D7377 0%, #074f52 100%)',
          boxShadow: '0 16px 48px rgba(13,115,119,0.25)',
        }}
      >
        <div className="px-6 pt-7 pb-2">
          <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Ditt att röra dig med
          </p>
          <div className="flex items-end gap-2 mt-1">
            <p className="font-black leading-none" style={{ fontSize: 52, color: '#fff', letterSpacing: '-2px' }}>
              {fmt(safeToSpend)}
            </p>
            <span className="text-xl font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>kr</span>
          </div>
          <p className="text-xs mt-1 mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</p>
        </div>
        <div style={{ height: 60, opacity: 0.35 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={FLOW_DATA} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="htGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fff" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#fff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="#fff" strokeWidth={2} fill="url(#htGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ── SCAN RECEIPT CTA ── */}
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleCamera}
        className="w-full rounded-3xl overflow-hidden flex items-center gap-4 p-5 text-left"
        style={{
          background: '#fff',
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          border: '1px solid rgba(13,115,119,0.12)',
        }}
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(13,115,119,0.09)' }}>
          <Camera className="w-7 h-7" style={{ color: '#0D7377' }} />
        </div>
        <div className="flex-1">
          <p className="text-base font-bold" style={{ color: '#1A2332' }}>Fota ett kvitto</p>
          <p className="text-xs mt-0.5" style={{ color: '#9AA5B4' }}>AI analyserar och kategoriserar automatiskt</p>
        </div>
        <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: '#9AA5B4' }} />
      </motion.button>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" />

      {/* ── RECENT TRANSACTIONS ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.13 }}
        className="rounded-3xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
      >
        <div className="px-5 pt-4 pb-3 flex items-center justify-between"
          style={{ borderBottom: '1px solid #F4F6F8' }}>
          <p className="text-sm font-bold" style={{ color: '#1A2332' }}>Senaste händelser</p>
          <button className="text-xs font-semibold flex items-center gap-0.5" style={{ color: '#0D7377' }}>
            Se alla <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {RECENT_TX.map((tx, i) => {
          const isIncome = tx.amount > 0;
          return (
            <div key={i}
              className="px-5 py-3.5 flex items-center justify-between"
              style={{ borderBottom: i < RECENT_TX.length - 1 ? '1px solid #F9F8F6' : 'none' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg"
                  style={{ background: isIncome ? 'rgba(13,115,119,0.09)' : '#F4F6F8' }}>
                  {tx.emoji}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#1A2332' }}>{tx.vendor}</p>
                  <p className="text-xs" style={{ color: '#9AA5B4' }}>{tx.category} · {tx.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {isIncome
                  ? <ArrowDownLeft className="w-3.5 h-3.5" style={{ color: '#0D7377' }} />
                  : <ArrowUpRight className="w-3.5 h-3.5" style={{ color: '#9AA5B4' }} />}
                <p className="text-sm font-bold" style={{ color: isIncome ? '#0D7377' : '#1A2332' }}>
                  {isIncome ? '+' : ''}{tx.amount.toLocaleString('sv-SE')} kr
                </p>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* ── CASHFLOW SUMMARY ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="grid grid-cols-2 gap-3"
      >
        <div className="rounded-3xl p-4" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
            style={{ background: 'rgba(13,115,119,0.1)' }}>
            <TrendingUp className="w-4 h-4" style={{ color: '#0D7377' }} />
          </div>
          <p className="text-xs" style={{ color: '#9AA5B4' }}>Intäkter</p>
          <p className="text-lg font-black mt-0.5" style={{ color: '#1A2332', letterSpacing: '-0.5px' }}>
            {(18500).toLocaleString('sv-SE')} kr
          </p>
          <p className="text-[10px] mt-1" style={{ color: '#0D7377' }}>↑ denna månad</p>
        </div>
        <div className="rounded-3xl p-4" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
            style={{ background: 'rgba(229,62,62,0.09)' }}>
            <TrendingDown className="w-4 h-4" style={{ color: '#E53E3E' }} />
          </div>
          <p className="text-xs" style={{ color: '#9AA5B4' }}>Utgifter</p>
          <p className="text-lg font-black mt-0.5" style={{ color: '#1A2332', letterSpacing: '-0.5px' }}>
            {(1839).toLocaleString('sv-SE')} kr
          </p>
          <p className="text-[10px] mt-1" style={{ color: '#E53E3E' }}>↓ denna månad</p>
        </div>
      </motion.div>

    </div>
  );
}