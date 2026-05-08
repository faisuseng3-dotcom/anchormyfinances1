import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

// Klassificera en transaktion i brus / investering / socialt
export function classifyTransaction(tx) {
  const amount = Math.abs(tx.amount || 0);
  const label = (tx.label || '').toLowerCase();
  const vendor = (tx.vendor || '').toLowerCase();
  const combined = label + ' ' + vendor;

  const socialKeywords = ['restaurang', 'lunch', 'middag', 'bar', 'pub', 'sushi', 'pizza',
    'urban deli', 'boulebar', 'kafé', 'café', 'kafe', 'brunch', 'after work'];
  const investKeywords = ['gym', 'gymshark', 'sats', 'actic', 'nike', 'adidas', 'bokus',
    'kjell', 'elgiganten', 'akademibokhandeln', 'kurs', 'utbildning'];

  if (socialKeywords.some(k => combined.includes(k))) return 'social';
  if (investKeywords.some(k => combined.includes(k))) return 'invest';
  if (amount < 150) return 'brus';
  if (amount >= 400) return 'invest';
  return 'brus';
}

const CLUSTERS = {
  brus: {
    emoji: '☕',
    label: 'Brus',
    subtitle: 'Småköp under 150 kr',
    color: '#E9A825',
    bg: 'rgba(233,168,37,0.08)',
    border: 'rgba(233,168,37,0.22)',
  },
  invest: {
    emoji: '🛍️',
    label: 'Investeringar i dig',
    subtitle: 'Större sällanköp',
    color: '#0FDEBD',
    bg: 'rgba(15,222,189,0.07)',
    border: 'rgba(15,222,189,0.20)',
  },
  social: {
    emoji: '🥂',
    label: 'Livskvalitet',
    subtitle: 'Utekvällar & middag',
    color: '#A78BFA',
    bg: 'rgba(167,139,250,0.08)',
    border: 'rgba(167,139,250,0.22)',
  },
};

function ClusterInsight({ type, txs }) {
  const [open, setOpen] = useState(false);
  const cfg = CLUSTERS[type];
  const total = txs.reduce((s, t) => s + Math.abs(t.amount), 0);
  const count = txs.length;
  const fmt = (n) => Math.round(n).toLocaleString('sv-SE');

  const insights = {
    brus: `Du har gjort ${count} småköp denna månad. Det känns som ingenting när du blippar kortet, men tillsammans har de kostat dig ${fmt(total)} kr. Det är en weekendresa till Berlin som rann ut i sanden.`,
    invest: `Du har gjort ${count} större köp denna månad för totalt ${fmt(total)} kr. Anchor ser detta som investeringar i dig själv — hälsa, kunskap och utrustning är positiva val.`,
    social: `Dina utekvällar och middagar landade på totalt ${fmt(total)} kr (${count} tillfällen). Det är här ditt "sociala batteri" laddas. Anchor klassar detta som livskvalitet, inte slöseri.`,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <button
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
        onClick={() => setOpen(v => !v)}
      >
        <span className="text-3xl flex-shrink-0">{cfg.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black" style={{ color: '#1A2332' }}>{cfg.label}</p>
          <p className="text-xs" style={{ color: '#6B7E96' }}>{cfg.subtitle}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-base font-black" style={{ color: cfg.color }}>{fmt(total)} kr</p>
          <p className="text-[10px]" style={{ color: '#8896A5' }}>{count} köp</p>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 ml-2" style={{ color: '#8896A5' }} />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4">
              <p className="text-sm leading-relaxed" style={{ color: '#4A5568', lineHeight: 1.75 }}>
                {insights[type]}
              </p>
              {txs.slice(0, 5).map((tx, i) => (
                <div key={i} className="flex justify-between items-center mt-2 pt-2"
                  style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                  <span className="text-xs truncate mr-2" style={{ color: '#6B7E96' }}>
                    {tx.vendor || tx.label}
                  </span>
                  <span className="text-xs font-bold flex-shrink-0" style={{ color: '#1A2332' }}>
                    {Math.abs(tx.amount).toLocaleString('sv-SE')} kr
                  </span>
                </div>
              ))}
              {txs.length > 5 && (
                <p className="text-xs mt-2 text-center" style={{ color: '#8896A5' }}>
                  + {txs.length - 5} fler transaktioner
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function TransactionClusters({ transactions }) {
  const expenses = (transactions || []).filter(tx => tx.amount < 0 && tx.type !== 'transfer_to_savings');

  const clusters = { brus: [], invest: [], social: [] };
  expenses.forEach(tx => {
    const type = classifyTransaction(tx);
    clusters[type].push(tx);
  });

  return (
    <div className="space-y-3">
      <p className="text-xs font-black uppercase tracking-widest px-1" style={{ color: '#8896A5' }}>
        Anchor grupperar dina köp
      </p>
      {Object.entries(clusters).map(([type, txs]) =>
        txs.length > 0 ? (
          <ClusterInsight key={type} type={type} txs={txs} />
        ) : null
      )}
    </div>
  );
}