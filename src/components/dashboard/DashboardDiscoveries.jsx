// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { runInsightEngine } from '@/lib/insightEngine';

const MAX_SHOWN = 2;
const MIN_TRANSACTIONS_FOR_PATTERN = 10;

function DiscoveryCard({ insight }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="rounded-2xl p-4 organic-surface bg-white/[0.03] border border-white/[0.06]">
      <div className="flex items-start gap-2.5">
        <span className="shrink-0 mt-0.5" aria-hidden>💡</span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-white leading-snug">{insight.title}</p>
          <p className="text-[14px] text-white/60 leading-snug mt-0.5">{insight.description}</p>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-[var(--color-accent)] hover:opacity-80"
          >
            Visa vad det betyder
            <ChevronDown className="w-3.5 h-3.5 transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
          </button>
          {open && (
            <div className="mt-2 space-y-2 text-[13px] text-white/55 leading-relaxed">
              {insight.consequence && <p>{insight.consequence}</p>}
              {insight.actionLink && (
                <Link to={insight.actionLink} className="inline-block font-medium text-white/80 hover:text-white underline underline-offset-2">
                  {insight.action ? `Gå till: ${insight.action}` : 'Visa detaljer'}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export default function DashboardDiscoveries({ profile, transactions }) {
  const insights = useMemo(
    () => runInsightEngine(profile, transactions || []).slice(0, MAX_SHOWN),
    [profile, transactions],
  );

  const hasEnoughData = (transactions?.length || 0) >= MIN_TRANSACTIONS_FOR_PATTERN;

  if (insights.length === 0 && hasEnoughData) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      className="pt-2"
    >
      <h2 className="anchor-dash-heading anchor-dash-heading--section mb-4">Lago har upptäckt</h2>
      {insights.length > 0 ? (
        <ul className="space-y-3">
          {insights.map((insight) => (
            <DiscoveryCard key={insight.id} insight={insight} />
          ))}
        </ul>
      ) : (
        <p className="text-[14px] text-white/45 leading-relaxed">
          Jag behöver ungefär en månads transaktioner innan jag kan identifiera ett tydligt utgiftsmönster.
        </p>
      )}
    </motion.section>
  );
}
