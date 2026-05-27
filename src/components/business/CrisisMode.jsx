import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, TrendingDown } from 'lucide-react';
import { BusinessDivider } from '@/components/business/BusinessChrome';

const CUTS = [
  { label: 'Adobe Creative Cloud', amount: 1095, tip: 'Använd Canva gratis-tiers' },
  { label: 'Slack Pro', amount: 380, tip: 'Gratis-planen räcker för <10 pers' },
  { label: 'Kontorslokal', amount: 8500, tip: 'Co-working 2 dgr/vecka = 2 800 kr' },
  { label: 'LinkedIn Premium', amount: 749, tip: 'Pausa under krisperioden' },
  { label: 'Representationsmiddagar', amount: 3200, tip: 'Digitala möten istället' },
];

export default function CrisisMode({ monthlyBurn = 45000 }) {
  const [open, setOpen] = useState(false);
  const [cut, setCut] = useState([]);

  const totalSaved = CUTS.filter((c) => cut.includes(c.label)).reduce((s, c) => s + c.amount, 0);
  const newBurn = monthlyBurn - totalSaved;
  const newRunway = Math.round((150000 / newBurn) * 10) / 10;

  const toggle = (label) =>
    setCut((c) => (c.includes(label) ? c.filter((x) => x !== label) : [...c, label]));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 py-3.5 text-left active:opacity-60"
      >
        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-red-500/10">
          <AlertTriangle className="w-4 h-4 text-[#E53E3E]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-medium text-[#1A2332]">Krissimulatorn</p>
          <p className="text-[13px] text-[#9AA5B4]">Simulera om intäkterna dippar</p>
        </div>
        <TrendingDown className="w-4 h-4 text-[#9AA5B4]" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 80 }}
              animate={{ y: 0 }}
              exit={{ y: 80 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-3xl overflow-hidden bg-[#F4F6F8] max-h-[85vh] overflow-y-auto"
            >
              <div className="px-5 pt-5 pb-4 flex items-center justify-between bg-white border-b border-[#E8ECF0]">
                <div>
                  <p className="text-[15px] font-medium text-[#1A2332]">Krissimulatorn</p>
                  <p className="text-[13px] text-[#9AA5B4] mt-0.5">Vad kan du skära om försäljningen stannar?</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#F4F6F8] flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-[#9AA5B4]" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 px-5 py-4 bg-white border-b border-[#E8ECF0]">
                <div className="text-center">
                  <p className="text-[12px] text-[#9AA5B4]">Burn/mån</p>
                  <p className="text-[15px] font-semibold text-[#E53E3E] tabular-nums">
                    {monthlyBurn.toLocaleString('sv-SE')} kr
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[12px] text-[#9AA5B4]">Du sparar</p>
                  <p className="text-[15px] font-semibold text-[#0D7377] tabular-nums">
                    -{totalSaved.toLocaleString('sv-SE')} kr
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[12px] text-[#9AA5B4]">Ny runway</p>
                  <p className="text-[15px] font-semibold text-[#1A2332]">{newRunway} mån</p>
                </div>
              </div>

              <div className="px-5 py-3">
                {CUTS.map((c, i) => {
                  const selected = cut.includes(c.label);
                  return (
                    <React.Fragment key={c.label}>
                      {i > 0 && <BusinessDivider />}
                      <button
                        type="button"
                        onClick={() => toggle(c.label)}
                        className="w-full py-3.5 text-left"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${selected ? 'bg-[#0D7377]' : 'border border-[#E8ECF0]'}`}
                            >
                              {selected && <span className="text-[10px] text-white font-bold">✓</span>}
                            </div>
                            <span className="text-[15px] font-medium text-[#1A2332] truncate">{c.label}</span>
                          </div>
                          <span
                            className={`text-[15px] font-semibold tabular-nums flex-shrink-0 ${selected ? 'text-[#0D7377]' : 'text-[#E53E3E]'}`}
                          >
                            {c.amount.toLocaleString('sv-SE')} kr/mån
                          </span>
                        </div>
                        {selected && <p className="text-[13px] mt-2 ml-7 text-[#0D7377]">{c.tip}</p>}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>

              {cut.length > 0 && (
                <div className="px-5 pb-6">
                  <p className="text-center text-[15px] font-medium text-[#0D7377]">
                    {newRunway} månaders runway med dessa åtgärder
                  </p>
                  <p className="text-center text-[13px] mt-1 text-[#9AA5B4]">
                    Ny månadskostnad: {newBurn.toLocaleString('sv-SE')} kr
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
