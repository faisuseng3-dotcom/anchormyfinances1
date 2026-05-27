import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, ArrowRightLeft, ShieldCheck } from 'lucide-react';
import {
  calcAccountTaxBreakdown,
  splitDeposit,
  findRecentIncome,
  buildTaxClarityMessage,
  fmtSek,
} from '@/lib/businessTaxEngine';

/**
 * TaxClarityHero — "Skatte-ångest-lösaren"
 * Visar tydligt: av X kr på kontot är Y kr dina.
 */
export default function TaxClarityHero({
  grossBalance = 0,
  vatReserved = 0,
  entityType = 'enskild',
  transactions = [],
  isReset = false,
}) {
  const [expanded, setExpanded] = useState(false);

  const breakdown = calcAccountTaxBreakdown(
    isReset ? 0 : grossBalance,
    isReset ? 0 : vatReserved,
    entityType,
  );

  const recentIncome = !isReset ? findRecentIncome(transactions) : null;
  const depositSplit = recentIncome ? splitDeposit(recentIncome.gross, entityType) : null;
  const coachMessage = buildTaxClarityMessage(breakdown, recentIncome, entityType);

  const { yours, vatReserved: vat, taxReserve, gross, yoursPct } = breakdown;
  const momsPct = gross > 0 ? Math.round((vat / gross) * 100) : 0;
  const skattPct = gross > 0 ? Math.round((taxReserve / gross) * 100) : 0;

  if (isReset || gross <= 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl overflow-hidden px-6 py-8"
        style={{
          background: 'linear-gradient(145deg, #0D7377 0%, #074f52 100%)',
          boxShadow: '0 12px 40px rgba(13,115,119,0.25)',
        }}
      >
        <p className="text-[15px] text-white/55 mb-2">Skatte-klarhet</p>
        <p className="text-[20px] font-semibold text-white leading-snug mb-2">
          Hur mycket är faktiskt dina?
        </p>
        <p className="text-sm text-white/60 leading-relaxed">
          Importera kontoutdrag eller registrera en inbetalning — då visar vi exakt hur mycket du kan flytta till privatkontot, och hur mycket som ska ligga kvar till moms och skatt.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #0D7377 0%, #085f63 55%, #074f52 100%)',
        boxShadow: '0 16px 48px rgba(13,115,119,0.35)',
      }}
    >
      {/* Coach narrative */}
      <div className="px-6 pt-6 pb-4">
        <p className="text-[14px] text-white/70 leading-relaxed mb-5">{coachMessage}</p>

        <p className="text-[15px] text-white/55 mb-1">Säkert att föra över till privat</p>
        <p
          className="font-black leading-none"
          style={{ fontSize: 52, color: '#fff', letterSpacing: '-2px' }}
        >
          {fmtSek(yours)}
          <span className="text-2xl font-semibold ml-2 text-white/50">kr</span>
        </p>
        <p className="text-xs text-white/45 mt-2">
          Av {fmtSek(gross)} kr på kontot · {yoursPct}% är dina
        </p>

        <div className="flex justify-between gap-4 mt-5 pt-4 border-t border-white/10">
          {[
            { label: 'Dina', amount: yours },
            { label: 'Moms', amount: vat },
            { label: 'Skatt', amount: taxReserve },
          ].map((pill) => (
            <div key={pill.label} className="flex-1 text-center">
              <p className="text-[12px] text-white/50">{pill.label}</p>
              <p className="text-[14px] font-semibold text-white tabular-nums mt-0.5">{fmtSek(pill.amount)}</p>
            </div>
          ))}
        </div>

        {/* Stacked bar */}
        <div className="mt-4 h-2 rounded-full overflow-hidden flex bg-white/10">
          <div className="h-full bg-white/85" style={{ width: `${yoursPct}%` }} />
          <div className="h-full bg-amber-400/80" style={{ width: `${momsPct}%` }} />
          <div className="h-full bg-rose-400/70 flex-1" />
        </div>
      </div>

      {/* Recent deposit detail */}
      {depositSplit && recentIncome && (
        <div className="mx-6 mb-4 pt-4 border-t border-white/10">
          <p className="text-[13px] text-white/45 mb-2 flex items-center gap-1.5">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Senaste inbetalning
          </p>
          <p className="text-sm font-semibold text-white mb-1">{recentIncome.name}</p>
          <div className="flex justify-between text-xs text-white/55 mb-2">
            <span>Brutto inbetalt</span>
            <span className="font-bold text-white">{fmtSek(depositSplit.gross)} kr</span>
          </div>
          <div className="flex justify-between text-xs text-emerald-200/90">
            <span>→ Dina rena pengar</span>
            <span className="font-black">{fmtSek(depositSplit.yours)} kr ({depositSplit.yoursPct}%)</span>
          </div>
          <div className="flex justify-between text-xs text-white/40 mt-1">
            <span>→ Reserverat moms + skatt</span>
            <span>{fmtSek(depositSplit.reservedTotal)} kr</span>
          </div>
        </div>
      )}

      <div className="mx-6 mb-4 flex items-start gap-3 py-2">
        <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-200/80" />
        <p className="text-[13px] text-white/65 leading-relaxed">
          Flytta <strong className="text-white">{fmtSek(yours)} kr</strong> till privatkontot när du vill —
          resten ligger tryggt reserverat till Skatteverket och momsdeklarationen.
        </p>
      </div>

      {/* Expandable full breakdown */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <span className="text-xs font-semibold text-white/45">Visa hela uträkningen</span>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-white/35" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-white/35" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div
              className="px-6 pb-5 space-y-2"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              {breakdown.rows.map((row) => (
                <div
                  key={row.key}
                  className={`flex items-center justify-between py-2 ${
                    row.highlight ? 'border-t border-emerald-400/25 pt-3 mt-1' : 'border-b border-white/5'
                  }`}
                >
                  <span className={`text-xs ${row.highlight ? 'font-bold text-emerald-200' : 'text-white/50'}`}>
                    {row.sign && row.sign !== '=' && (
                      <span className="text-rose-300 mr-1">{row.sign}</span>
                    )}
                    {row.label}
                  </span>
                  <span
                    className={`text-sm font-bold ${row.highlight ? 'text-emerald-200' : 'text-white/80'}`}
                  >
                    {fmtSek(row.amount)} kr
                  </span>
                </div>
              ))}
              <p className="text-[10px] text-white/30 pt-2 leading-relaxed">
                Uppskattning baserad på {breakdown.entityLabel}. Exakta belopp beror på avdrag,
                periodisering och total årsinkomst — men du får en trygg riktlinje direkt.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
