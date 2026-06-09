import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ThumbsUp, ThumbsDown } from 'lucide-react';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

export default function PurchaseCheck({ safeToSpend, nextCritical, currentBalance }) {
  const [input, setInput] = useState('');
  const [answer, setAnswer] = useState(null);

  const check = () => {
    const amount = parseFloat(input.replace(/\s/g, '').replace(',', '.'));
    if (!amount || amount <= 0) return;

    const afterBuy = safeToSpend - amount;
    const afterCritical = nextCritical ? currentBalance - amount - (nextCritical.amount || 0) : null;

    const canAfford = afterBuy >= 0;
    const criticalOk = afterCritical === null || afterCritical >= 0;
    const ok = canAfford && criticalOk;

    let reason;
    if (!canAfford) {
      reason = `Du har bara ${fmt(safeToSpend)} kr säkert att röra. Det räcker inte.`;
    } else if (!criticalOk) {
      reason = `Om du köper detta för ${fmt(amount)} kr kommer du ha ${fmt(afterCritical)} kr kvar när ${nextCritical.name} ska betalas om ${nextCritical.dayOffset} dagar.`;
    } else if (nextCritical) {
      reason = `Du har ${fmt(afterBuy)} kr kvar och klarar ändå ${nextCritical.name} om ${nextCritical.dayOffset} dagar. `;
    } else {
      reason = `Du har ${fmt(afterBuy)} kr kvar efteråt. Inga räkningar på väg.`;
    }

    setAnswer({ ok, amount, reason });
  };

  const reset = () => { setAnswer(null); setInput(''); };

  return (
    <div className="rounded-3xl p-5"
      style={{ background: 'rgba(6,8,18,0.95)', boxShadow: 'var(--anchor-shadow-1)' }}>

      <p className="text-[9px] font-black tracking-widest mb-3 flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.22)' }}>
        <Wallet className="w-3.5 h-3.5" /> KOLLA ETT KÖP
      </p>

      <p className="text-base font-black mb-4" style={{ color: 'rgba(255,255,255,0.75)' }}>
        Kan jag köpa detta?
      </p>

      <AnimatePresence mode="wait">
        {!answer ? (
          <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && check()}
                  placeholder="Skriv beloppet..."
                  className="w-full rounded-2xl px-4 py-3 text-lg font-black outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    boxShadow: 'var(--anchor-shadow-1)',
                    color: '#fff',
                  }}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>kr</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={check}
                disabled={!input}
                className="px-5 py-3 rounded-2xl text-sm font-black disabled:opacity-30"
                style={{ background: 'rgba(15,222,189,0.18)', color: '#0FDEBD', boxShadow: 'var(--anchor-shadow-1)' }}>
                Kolla
              </motion.button>
            </div>

            {/* Quick amounts */}
            <div className="flex gap-2 mt-3 flex-wrap">
              {[100, 500, 1000, 2000].map(v => (
                <button key={v}
                  onClick={() => setInput(String(v))}
                  className="px-3 py-1 rounded-full text-[10px] font-bold"
                  style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', boxShadow: 'var(--anchor-shadow-1)' }}>
                  {fmt(v)} kr
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="answer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl p-4"
            style={{
              background: answer.ok ? 'rgba(15,222,189,0.08)' : 'rgba(255,68,102,0.08)',
              boxShadow: 'var(--anchor-shadow-1)',
            }}>

            {/* Verdict */}
            <div className="flex items-center gap-3 mb-3">
              {answer.ok
                ? <ThumbsUp className="w-9 h-9 text-[#0FDEBD] flex-shrink-0" aria-hidden />
                : <ThumbsDown className="w-9 h-9 text-[#FF4466] flex-shrink-0" aria-hidden />}
              <p className="text-2xl font-black" style={{ color: answer.ok ? '#0FDEBD' : '#FF4466' }}>
                {answer.ok ? 'Ja, det klarar du!' : 'Nej, vänta.'}
              </p>
            </div>

            <p className="text-sm leading-relaxed font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {answer.reason}
            </p>

            <button onClick={reset}
              className="mt-4 w-full py-2.5 rounded-xl text-sm font-black"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', boxShadow: 'var(--anchor-shadow-1)' }}>
              Kolla ett annat köp
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}