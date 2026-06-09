import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

export default function PaydayCountdown({ incomeDay }) {
  const { daysLeft, totalDays, pct } = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDate();
    const year = today.getFullYear();
    const month = today.getMonth();

    let payday = new Date(year, month, incomeDay);
    if (currentDay >= incomeDay) {
      payday = new Date(year, month + 1, incomeDay);
    }

    const msLeft = payday - today;
    const daysLeft = Math.ceil(msLeft / 86400000);

    // Total days in this pay period
    const prevPayday = new Date(payday);
    prevPayday.setMonth(prevPayday.getMonth() - 1);
    const totalDays = Math.ceil((payday - prevPayday) / 86400000);
    const pct = Math.max(0, Math.min(1, 1 - daysLeft / totalDays));

    return { daysLeft, totalDays, pct };
  }, [incomeDay]);

  const urgency = daysLeft <= 5 ? '#FF4466' : daysLeft <= 12 ? '#F6AD55' : '#0FDEBD';

  // Circle math
  const r = 36;
  const circ = 2 * Math.PI * r;
  const filled = circ * pct;

  return (
    <div className="rounded-3xl p-5"
      style={{ background: 'rgba(6,8,18,0.95)', border: '1px solid rgba(255,255,255,0.07)' }}>

      <p className="text-[9px] font-black tracking-widest mb-4 inline-flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.22)' }}>
        <Calendar className="w-3 h-3" aria-hidden /> DAGAR TILL LÖN
      </p>

      <div className="flex items-center gap-5">
        {/* Ring */}
        <div className="relative flex-shrink-0 w-24 h-24 flex items-center justify-center">
          <svg width="96" height="96" viewBox="0 0 96 96" className="absolute inset-0 -rotate-90">
            <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <motion.circle cx="48" cy="48" r={r} fill="none"
              stroke={urgency} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${circ}`}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: circ - filled }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              style={{ filter: `drop-shadow(0 0 6px ${urgency}60)` }}
            />
          </svg>
          <div className="text-center relative z-10">
            <p className="font-black leading-none" style={{ color: urgency, fontSize: 26 }}>{daysLeft}</p>
            <p className="text-[9px] font-black" style={{ color: 'rgba(255,255,255,0.3)' }}>dagar</p>
          </div>
        </div>

        {/* Text */}
        <div className="flex-1">
          <p className="text-lg font-black leading-snug" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {daysLeft} dagar kvar till lönen.
          </p>
          <p className="text-xs mt-1 font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Lönedag den {incomeDay}:e varje månad.
          </p>

          {/* Bar */}
          <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct * 100}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              style={{
                background: urgency,
                boxShadow: `0 0 8px ${urgency}60`,
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[8px] font-black" style={{ color: 'rgba(255,255,255,0.2)' }}>LÖN BETALD</span>
            <span className="text-[8px] font-black" style={{ color: urgency }}>NÄSTA LÖN</span>
          </div>
        </div>
      </div>
    </div>
  );
}