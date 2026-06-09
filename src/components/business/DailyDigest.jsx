import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, TrendingUp, Users, Banknote, ChevronDown, ChevronUp } from 'lucide-react';

const DIGEST = {
  availableAfterTax: 38400,
  salaryHeadroom: 5000,
  unpaidClients: [
    { name: 'Acme AB', amount: 24500, daysLate: 12 },
    { name: 'Stardust Media', amount: 8900, daysLate: 3 },
    { name: 'NordTech Group', amount: 55000, daysLate: 28 },
  ],
  generated: 'Idag 07:00',
};

export default function DailyDigest() {
  const [expanded, setExpanded] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--color-card)', boxShadow: 'var(--anchor-shadow-1)' }}
    >
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full px-4 pt-4 pb-3 flex items-center justify-between"
        style={{ borderBottom: expanded ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(200,146,58,0.2)', boxShadow: 'var(--anchor-shadow-1)' }}>
            <Sun className="w-3.5 h-3.5" style={{ color: '#C8923A' }} />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold" style={{ color: '#C8923A' }}>DAILY DIGEST</p>
            <p className="text-[11px]" style={{ color: 'rgba(155,173,184,0.55)' }}>Genererad {DIGEST.generated}</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4" style={{ color: 'rgba(155,173,184,0.4)' }} /> : <ChevronDown className="w-4 h-4" style={{ color: 'rgba(155,173,184,0.4)' }} />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-3 space-y-3">

              {/* Insight 1 */}
              <div className="p-3 rounded-xl flex items-center gap-3"
                style={{ background: 'rgba(61,170,122,0.08)', boxShadow: 'var(--anchor-shadow-1)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(61,170,122,0.15)' }}>
                  <Banknote className="w-4 h-4" style={{ color: '#3DAA7A' }} />
                </div>
                <div>
                  <p className="text-[11px]" style={{ color: 'rgba(155,173,184,0.6)' }}>Du har på kontot (efter skatt &amp; moms)</p>
                  <p className="text-xl font-black" style={{ color: '#3DAA7A' }}>
                    {DIGEST.availableAfterTax.toLocaleString('sv-SE')} kr
                  </p>
                </div>
              </div>

              {/* Insight 2 */}
              <div className="p-3 rounded-xl flex items-center gap-3"
                style={{ background: 'rgba(75,124,243,0.08)', boxShadow: 'var(--anchor-shadow-1)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(75,124,243,0.15)' }}>
                  <TrendingUp className="w-4 h-4" style={{ color: '#4B7CF3' }} />
                </div>
                <div>
                  <p className="text-[11px]" style={{ color: 'rgba(155,173,184,0.6)' }}>Du har råd att ta ut i extra lön denna månad</p>
                  <p className="text-xl font-black" style={{ color: '#4B7CF3' }}>
                    {DIGEST.salaryHeadroom.toLocaleString('sv-SE')} kr
                  </p>
                </div>
              </div>

              {/* Insight 3 — unpaid clients */}
              <div className="p-3 rounded-xl"
                style={{ background: 'rgba(217,95,95,0.08)', boxShadow: 'var(--anchor-shadow-1)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-3.5 h-3.5" style={{ color: '#D95F5F' }} />
                  <p className="text-[11px] font-bold" style={{ color: '#D95F5F' }}>
                    {DIGEST.unpaidClients.length} kunder har inte betalat
                  </p>
                </div>
                <div className="space-y-1.5">
                  {DIGEST.unpaidClients.map(c => (
                    <div key={c.name} className="flex items-center justify-between">
                      <p className="text-xs" style={{ color: 'rgba(155,173,184,0.8)' }}>{c.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold" style={{ color: '#F0EAD6' }}>
                          {c.amount.toLocaleString('sv-SE')} kr
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                          style={{
                            background: c.daysLate > 14 ? 'rgba(217,95,95,0.2)' : 'rgba(200,146,58,0.15)',
                            color: c.daysLate > 14 ? '#D95F5F' : '#C8923A',
                          }}>
                          +{c.daysLate}d
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}