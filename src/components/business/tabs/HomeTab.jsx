import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, ArrowUpRight, ArrowDownLeft, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
const RECENT_TX = [
  { vendor: 'Adobe Creative Cloud', amount: -599, date: 'Idag', category: 'Programvara' },
  { vendor: 'Kund: Eriksson AB', amount: 18500, date: 'Igår', category: 'Inkomst' },
  { vendor: 'SJ AB', amount: -1240, date: '10 apr', category: 'Resor' },
];

const FLOW_DATA = [
  { m: 'Nov', v: 42000 }, { m: 'Dec', v: 38000 }, { m: 'Jan', v: 51000 },
  { m: 'Feb', v: 44000 }, { m: 'Mar', v: 56000 }, { m: 'Apr', v: 48000 },
];

export default function HomeTab({ safeToSpend, label, onScannerOpen }) {
  const fileRef = useRef();

  const handleCamera = () => {
    if (onScannerOpen) { onScannerOpen(); return; }
    fileRef.current?.click();
  };

  return (
    <div className="px-5 space-y-4">
      {/* Safe to spend hero */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0D7377 0%, #074f52 100%)', boxShadow: '0 12px 40px rgba(13,115,119,0.3)' }}>
        <div className="px-6 pt-7 pb-3">
          <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>Ditt att röra dig med</p>
          <p className="font-black leading-none mt-1" style={{ fontSize: 56, color: '#fff', letterSpacing: '-2px' }}>
            {safeToSpend.toLocaleString('sv-SE')}
            <span className="text-2xl font-medium ml-2" style={{ color: 'rgba(255,255,255,0.5)' }}>kr</span>
          </p>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</p>
        </div>
        {/* Mini cashflow sparkline */}
        <div style={{ height: 64, opacity: 0.4 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={FLOW_DATA} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fff" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#fff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="#fff" strokeWidth={1.5} fill="url(#sg)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Scan receipt CTA */}
      <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        onClick={handleCamera}
        className="w-full h-14 rounded-2xl flex items-center justify-center gap-3 font-bold text-base"
        style={{ background: '#0D7377', color: '#fff', boxShadow: '0 4px 16px rgba(13,115,119,0.3)' }}>
        <Camera className="w-5 h-5" />
        Fota ett kvitto
      </motion.button>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" />

      {/* Recent transactions */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="rounded-3xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div className="px-5 pt-4 pb-3 flex items-center justify-between"
          style={{ borderBottom: '1px solid #F0F2F5' }}>
          <p className="text-sm font-bold" style={{ color: '#1A2332' }}>Senaste händelser</p>
          <button className="text-xs font-semibold" style={{ color: '#0D7377' }}>Se alla</button>
        </div>
        <div className="divide-y" style={{ borderColor: '#F0F2F5' }}>
          {RECENT_TX.map((tx, i) => (
            <div key={i} className="px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
                  style={{ background: tx.amount > 0 ? 'rgba(13,115,119,0.1)' : '#F4F6F8' }}>
                  {tx.amount > 0
                    ? <ArrowDownLeft className="w-4 h-4" style={{ color: '#0D7377' }} />
                    : <ArrowUpRight className="w-4 h-4" style={{ color: '#9AA5B4' }} />}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#1A2332' }}>{tx.vendor}</p>
                  <p className="text-xs" style={{ color: '#9AA5B4' }}>{tx.category} · {tx.date}</p>
                </div>
              </div>
              <p className="text-sm font-bold" style={{ color: tx.amount > 0 ? '#0D7377' : '#1A2332' }}>
                {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('sv-SE')} kr
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}