import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Check, X, ChevronRight, CreditCard, PartyPopper } from 'lucide-react';
import { BusinessDivider } from '@/components/business/BusinessChrome';

const PENDING = [
  {
    id: 1,
    vendor: 'Apple Store',
    amount: -14900,
    vatRate: 25,
    account: '5420',
    accountLabel: 'Programvaror & IT',
    date: '2026-04-10',
  },
  {
    id: 2,
    vendor: 'SJ AB',
    amount: -1240,
    vatRate: 6,
    account: '5800',
    accountLabel: 'Resekostnader',
    date: '2026-04-09',
  },
  {
    id: 3,
    vendor: 'Elite Hotels',
    amount: -3800,
    vatRate: 12,
    account: '5900',
    accountLabel: 'Representation',
    date: '2026-04-08',
  },
  {
    id: 4,
    vendor: 'Adobe Inc',
    amount: -1095,
    vatRate: 25,
    account: '5420',
    accountLabel: 'Programvaror & IT',
    date: '2026-04-07',
  },
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
      style={{ x, rotate, touchAction: 'none' }}
      dragConstraints={{ left: -200, right: 200 }}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
      className="absolute w-full rounded-xl p-5 cursor-grab select-none bg-white border border-[#E8ECF0] shadow-sm"
    >
      <motion.div
        className="absolute top-4 left-4 px-3 py-1 rounded-full border-2 border-green-500 -rotate-[20deg]"
        style={{ opacity: approveOpacity }}
      >
        <span className="text-green-500 font-bold text-sm inline-flex items-center gap-1">GODKÄND <Check className="w-3.5 h-3.5" aria-hidden /></span>
      </motion.div>
      <motion.div
        className="absolute top-4 right-4 px-3 py-1 rounded-full border-2 border-red-500 rotate-[20deg]"
        style={{ opacity: rejectOpacity }}
      >
        <span className="text-red-500 font-bold text-sm inline-flex items-center gap-1">ÄNDRA <X className="w-3.5 h-3.5" aria-hidden /></span>
      </motion.div>

      <div className="mt-2">
        <p className="text-[17px] font-medium text-[#1A2332]">{tx.vendor}</p>
        <p className="text-[28px] font-semibold mt-1 text-[#E53E3E] tabular-nums tracking-tight">
          {Math.abs(tx.amount).toLocaleString('sv-SE')} kr
        </p>
        <p className="text-[13px] mt-1 text-[#9AA5B4]">{tx.date}</p>

        <div className="mt-4 p-3 rounded-xl space-y-2 bg-[#F4F6F8]">
          <div className="flex justify-between text-[13px]">
            <span className="text-[#9AA5B4]">Konto</span>
            <span className="font-medium text-[#0D7377]">
              {tx.account} — {tx.accountLabel}
            </span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-[#9AA5B4]">Moms {tx.vatRate}%</span>
            <span className="font-medium text-[#1A2332] tabular-nums">{Math.abs(vat).toFixed(0)} kr</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-[#9AA5B4]">Netto</span>
            <span className="font-medium text-[#1A2332] tabular-nums">{Math.abs(net).toFixed(0)} kr</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-[13px] text-[#9AA5B4]">
          <span className="flex items-center gap-1.5">
            <X className="w-4 h-4 text-[#E53E3E]" />
            Ändra
          </span>
          <span className="flex items-center gap-1.5">
            Godkänn
            <Check className="w-4 h-4 text-[#0D7377]" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function SwipeApprove() {
  const [cards, setCards] = useState(PENDING);
  const [approved, setApproved] = useState(0);
  const [open, setOpen] = useState(false);

  const handleApprove = (id) => {
    setCards((c) => c.filter((t) => t.id !== id));
    setApproved((a) => a + 1);
  };
  const handleReject = (id) => setCards((c) => c.filter((t) => t.id !== id));

  const remaining = cards.length;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 py-3.5 text-left active:opacity-60"
      >
        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#0D7377]/10">
          <CreditCard className="w-4 h-4 text-[#0D7377]" aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-medium text-[#1A2332]">Godkänn transaktioner</p>
          <p className="text-[13px] text-[#9AA5B4]">
            {remaining} väntar · {approved} godkända
          </p>
        </div>
        <ChevronRight
          className="w-4 h-4 text-[#9AA5B4] transition-transform"
          style={{ transform: open ? 'rotate(90deg)' : 'none' }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <BusinessDivider />
            <div className="pt-4 pb-2">
              {remaining === 0 ? (
                <div className="py-8 text-center">
                  <PartyPopper className="w-8 h-8 mx-auto mb-2 text-[#3DAA7A]" aria-hidden />
                  <p className="text-[15px] font-medium text-[#3DAA7A]">Alla transaktioner är behandlade</p>
                  <p className="text-[13px] mt-1 text-[#9AA5B4]">{approved} bokförda</p>
                </div>
              ) : (
                <div className="relative h-56">
                  {cards.slice(0, 3).map((tx, i) => (
                    <div
                      key={tx.id}
                      style={{
                        zIndex: 3 - i,
                        transform: `scale(${1 - i * 0.03}) translateY(${i * 8}px)`,
                        position: 'absolute',
                        width: '100%',
                      }}
                    >
                      {i === 0 ? (
                        <SwipeCard tx={tx} onApprove={handleApprove} onReject={handleReject} />
                      ) : (
                        <div
                          className="w-full rounded-xl min-h-[80px] bg-[#F4F6F8] border border-[#E8ECF0]"
                          style={{ height: '100%' }}
                        />
                      )}
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
