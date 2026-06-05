import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { DashboardDivider } from '@/components/dashboard/DashboardChrome';
import { sectionMetaClass, sectionSubtitleClass } from '@/lib/anchorTheme';

export function classifyTransaction(tx) {
  const amount = Math.abs(tx.amount || 0);
  const label = (tx.label || '').toLowerCase();
  const vendor = (tx.vendor || '').toLowerCase();
  const combined = label + ' ' + vendor;

  const socialKeywords = ['restaurang', 'lunch', 'middag', 'bar', 'pub', 'sushi', 'pizza',
    'urban deli', 'boulebar', 'kafé', 'café', 'kafe', 'brunch', 'after work'];
  const investKeywords = ['gym', 'gymshark', 'sats', 'actic', 'nike', 'adidas', 'bokus',
    'kjell', 'elgiganten', 'akademibokhandeln', 'kurs', 'utbildning'];

  if (socialKeywords.some((k) => combined.includes(k))) return 'social';
  if (investKeywords.some((k) => combined.includes(k))) return 'invest';
  if (amount < 150) return 'brus';
  if (amount >= 400) return 'invest';
  return 'brus';
}

const CLUSTERS = {
  brus: {
    emoji: '☕',
    label: 'Småköp',
    subtitle: 'Under cirka 150 kr',
    color: '#FCD34D',
  },
  invest: {
    emoji: '🛍️',
    label: 'Större köp',
    subtitle: 'Sällan men tydligt',
    color: '#9FB5FF',
  },
  social: {
    emoji: '🥂',
    label: 'Ute & middag',
    subtitle: 'Socialt',
    color: '#C4B5FD',
  },
};

function ClusterInsight({ type, txs }) {
  const [open, setOpen] = useState(false);
  const cfg = CLUSTERS[type];
  const total = txs.reduce((s, t) => s + Math.abs(t.amount), 0);
  const count = txs.length;
  const fmt = (n) => Math.round(n).toLocaleString('sv-SE');

  const perPurchase = count > 0 ? Math.round(total / count) : 0;
  const insights = {
    brus: count > 0
      ? `${count} småköp blev ${fmt(total)} kr tillsammans — runt ${fmt(perPurchase)} kr i snitt. Varje köp känns harmlöst, men tillsammans är det ${total >= 1500 ? 'nästan en extra hyresrad' : 'mer än de flesta tror'}.`
      : null,
    invest: count > 0
      ? `${count} större köp på ${fmt(total)} kr. Det här är ofta medvetna val — frågan är om de passar det du ville spara till den här månaden.`
      : null,
    social: count > 0
      ? `${fmt(total)} kr på umgänge och uteätning (${count} gånger). Det är inte fel att leva — men det är värt att veta vad det kostar i kronor.`
      : null,
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.03]">
      <button
        type="button"
        className="w-full flex items-center gap-4 px-4 py-4 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-2xl flex-shrink-0">{cfg.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-medium text-white">{cfg.label}</p>
          <p className={sectionMetaClass}>{cfg.subtitle}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[17px] font-semibold tabular-nums" style={{ color: cfg.color }}>
            {fmt(total)} kr
          </p>
          <p className={sectionMetaClass}>{count} köp</p>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-white/40" />
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
            <DashboardDivider className="mx-4" />
            <div className="px-4 pb-4 pt-2">
              {insights[type] && (
                <p className={`${sectionSubtitleClass}`}>{insights[type]}</p>
              )}
              {txs.slice(0, 5).map((tx, i) => (
                <div key={tx.id || i} className="flex justify-between items-center mt-3 pt-3 border-t border-white/[0.06]">
                  <span className="text-[13px] text-white/55 truncate mr-2">
                    {tx.vendor || tx.label}
                  </span>
                  <span className="text-[13px] font-medium text-white/85 tabular-nums flex-shrink-0">
                    {Math.abs(tx.amount).toLocaleString('sv-SE')} kr
                  </span>
                </div>
              ))}
              {txs.length > 5 && (
                <p className={`${sectionMetaClass} mt-2 text-center`}>
                  + {txs.length - 5} till
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TransactionClusters({ transactions }) {
  const expenses = (transactions || []).filter(
    (tx) => tx.amount < 0 && tx.type !== 'transfer_to_savings',
  );

  const clusters = { brus: [], invest: [], social: [] };
  expenses.forEach((tx) => {
    const type = classifyTransaction(tx);
    clusters[type].push(tx);
  });

  const hasAny = Object.values(clusters).some((arr) => arr.length > 0);

  if (!hasAny) {
    return (
      <p className={sectionSubtitleClass}>
        Lägg till eller importera transaktioner så kan vi gruppera dina köp här.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className={sectionMetaClass}>Grupperade köp</p>
      {Object.entries(clusters).map(([type, txs]) =>
        txs.length > 0 ? <ClusterInsight key={type} type={type} txs={txs} /> : null,
      )}
    </div>
  );
}
