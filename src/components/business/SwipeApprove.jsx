import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Check, X, ChevronRight } from 'lucide-react';

const PENDING = [
  { id: 1, vendor: 'Apple Store', amount: -14900, vatRate: 25, account: '5420', accountLabel: 'Programvaror & IT', date: '2026-04-10' },
  { id: 2, vendor: 'SJ AB', amount: -1240, vatRate: 6, account: '5800', accountLabel: 'Resekostnader', date: '2026-04-09' },
  { id: 3, vendor: 'Elite Hotels', amount: -3800, vatRate: 12, account: '5900', accountLabel: 'Representation', date: '2026-04-08' },
  { id: 4, vendor: 'Adobe Inc', amount: -1095, vatRate: 25, account: '5420', accountLabel: 'Programvaror & IT', date: '2026-04-07' },
];

function SwipeCard({ tx, onApprove, onReject }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-150, 150], [-15, 15]);
  const approveOpacity = useTransform(x, [0, 80], [0, 1]);
  const rejectOpacity = useTransform(x, [-80, 0], [1, 0]);

  const vat = tx.amount * (tx.vatRate / (100 + tx.vatRate));
  const net = tx.amount - vat;

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 100) onApprove(tx.id);
    else if (info.offset.x < -100) onReject(tx.id);
  };

  return (
    <motion.div
      drag="x"
      style={{ x, rotate }}
      dragConstraints={{ left: -200, right: 200 }}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
      className="absolute w-full rounded-2xl p-5 cursor-grab select-none"
      style={{ background: '#1E2D42', border: '1px solid rgba(255,255,255,0.1)', touchAction: 'none' }}
    >
      {/* Approve overlay */}
      <motion.div className="absolute top-4 left-4 px-3 py-1 rounded-full border-2 border-green-500 rotate-[-20deg]"
        style={{ opacity: approveOpacity }}>
        <span className="text-green-400 font-black text-sm">GODKÄND ✓</span>
      </motion.div>
      {/* Reject overlay */}
      <motion.div className="absolute top-4 right-4 px-3 py-1 rounded-full border-2 border-red-500 rotate-[20deg]"
        style={{ opacity: rejectOpacity }}>
        <span className="text-red-400 font-black text-sm">ÄNDRA ✗</span>
      </motion.div>

      <div className="mt-2">
        <p className="text-lg font-black" style={{ color: '#F0EAD6' }}>{tx.vendor}</p>
        <p className="text-2xl font-black mt-1" style={{ color: '#D95F5F' }}>
          {Math.abs(tx.amount).toLocaleString('sv-SE')} kr
        </p>
        <p className="text-xs mt-1" style={{ color: 'rgba(155,173,184,0.5)' }}>{tx.date}</p>

        <div className="mt-4 p-3 rounded-xl space-y-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="flex justify-between">
            <span className="text-xs" style={{ color: 'rgba(155,173,184,0.6)' }}>AI-konto</span>
            <span className="text-xs font-bold" style={{ color: '#4B7CF3' }}>{tx.account} — {tx.accountLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs" style={{ color: 'rgba(155,173,184,0.6)' }}>Moms {tx.vatRate}%</span>
            <span className="text-xs font-bold" style={{ color: '#D4AF37' }}>{Math.abs(vat).toFixed(0)} kr tillbaka</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs" style={{ color: 'rgba(155,173,184,0.6)' }}>Netto</span>
            <span className="text-xs font-bold" style={{ color: '#3DAA7A' }}>{Math.abs(net).toFixed(0)} kr</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5" style={{ color: 'rgba(155,173,184,0.4)' }}>
            <X className="w-4 h-4 text-red-400" />
            <span className="text-[11px]">Swajpa vänster för att ändra</span>
          </div>
          <div className="flex items-center gap-1.5" style={{ color: 'rgba(155,173,184,0.4)' }}>
            <span className="text-[11px]">Godkänn</span>
            <Check className="w-4 h-4 text-green-400" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function SwipeApprove() {
  const [cards, setCards] = useState(PENDING);
  const [approved, setApproved] = useState(0);
  const [open, setOpen] = useState(false);

  const handleApprove = (id) => { setCards(c => c.filter(t => t.id !== id)); setApproved(a => a + 1); };
  const handleReject = (id) => setCards(c => c.filter(t => t.id !== id));

  const remaining = cards.length;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-card)', border: '1px solid rgba(75,124,243,0.25)' }}>
      <button onClick={() => setOpen(v => !v)}
        className="w-full px-4 py-3.5 flex items-center justify-between"
        style={{ borderBottom: open ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
        <div className="flex items-center gap-2">
          <span className="text-base">🃏</span>
          <div className="text-left">
            <p className="text-xs font-bold" style={{ color: '#4B7CF3' }}>SWAJPA & GODKÄNN</p>
            <p className="text-[11px]" style={{ color: 'rgba(155,173,184,0.5)' }}>
              {remaining} transaktioner väntar · {approved} godkända
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4" style={{ color: 'rgba(155,173,184,0.4)', transform: open ? 'rotate(90deg)' : 'none', transition: '0.2s' }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="px-4 py-4">
              {remaining === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-2xl mb-2">🎉</p>
                  <p className="text-sm font-bold" style={{ color: '#3DAA7A' }}>Alla transaktioner är behandlade!</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(155,173,184,0.4)' }}>{approved} bokförda</p>
                </div>
              ) : (
                <div className="relative h-56">
                  {cards.slice(0, 3).map((tx, i) => (
                    <div key={tx.id} style={{ zIndex: 3 - i, transform: `scale(${1 - i * 0.03}) translateY(${i * 8}px)`, position: 'absolute', width: '100%' }}>
                      {i === 0
                        ? <SwipeCard tx={tx} onApprove={handleApprove} onReject={handleReject} />
                        : <div className="w-full rounded-2xl" style={{ height: '100%', background: '#1E2D42', border: '1px solid rgba(255,255,255,0.06)', minHeight: 80 }} />
                      }
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}