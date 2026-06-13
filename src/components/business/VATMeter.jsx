import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

const VAT_DATA = {
  green: 18400,   // ready to declare
  yellow: 5200,   // missing receipt
  total: 23600,
  deadline: '26 maj 2026',
  daysLeft: 45,
};

export default function VATMeter() {
  const greenPct = (VAT_DATA.green / VAT_DATA.total) * 100;
  const yellowPct = (VAT_DATA.yellow / VAT_DATA.total) * 100;

  return (
    <div className="p-4 rounded-2xl space-y-3"
      style={{ background: 'var(--color-card)', boxShadow: 'var(--anchor-shadow-1)' }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#D4AF37' }}>Moms-klocka</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(155,173,184,0.55)' }}>Deklarationsstatus denna period</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(212,175,55,0.1)', boxShadow: 'var(--anchor-shadow-1)' }}>
          <Clock className="w-3 h-3" style={{ color: '#D4AF37' }} />
          <span className="text-[11px] font-bold" style={{ color: '#D4AF37' }}>{VAT_DATA.daysLeft} dagar kvar</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-3 rounded-full overflow-hidden flex" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${greenPct}%` }}
          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
          className="h-full rounded-l-full"
          style={{ background: 'linear-gradient(90deg, #3DAA7A, #4ade80)' }}
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${yellowPct}%` }}
          transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
          className="h-full"
          style={{ background: 'linear-gradient(90deg, #D4AF37, #fbbf24)' }}
        />
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 p-2.5 rounded-xl"
          style={{ background: 'rgba(61,170,122,0.08)', boxShadow: 'var(--anchor-shadow-1)' }}>
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#3DAA7A' }} />
          <div>
            <p className="text-[11px] font-bold" style={{ color: '#3DAA7A' }}>Redo att deklarera</p>
            <p className="text-xs font-black mt-0.5" style={{ color: '#F0EAD6' }}>{VAT_DATA.green.toLocaleString('sv-SE')} kr</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl"
          style={{ background: 'rgba(212,175,55,0.08)', boxShadow: 'var(--anchor-shadow-1)' }}>
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#D4AF37' }} />
          <div>
            <p className="text-[11px] font-bold" style={{ color: '#D4AF37' }}>Saknar underlag</p>
            <p className="text-xs font-black mt-0.5" style={{ color: '#F0EAD6' }}>{VAT_DATA.yellow.toLocaleString('sv-SE')} kr</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-center" style={{ color: 'rgba(155,173,184,0.45)' }}>
        Deadline: {VAT_DATA.deadline} · Bifoga kvitton för gul status
      </p>
    </div>
  );
}