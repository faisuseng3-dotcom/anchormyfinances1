import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Droplets, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { runLeakageDetector, fmtLeakageSek } from '@/lib/leakageEngine';
import { createPageUrl } from '@/utils';
import { glassSurface } from '@/lib/anchorTheme';

const TYPE_ICON = {
  subscription: '📱',
  duplicate: '🎬',
  habit: '☕',
  forgotten: '💸',
};

function LeakRow({ leak, index, compact }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`rounded-2xl border border-white/10 ${compact ? 'p-3' : 'p-4'}`}
      style={{ background: 'rgba(255,255,255,0.05)' }}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0 mt-0.5">{TYPE_ICON[leak.type] || '💸'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`font-semibold text-white ${compact ? 'text-sm' : 'text-base'}`}>
              {leak.title}
            </p>
            <p className="text-sm font-black text-amber-200 flex-shrink-0">
              {fmtLeakageSek(leak.monthlyAmount)}/mån
            </p>
          </div>
          {!compact && (
            <p className="text-xs text-white/55 mt-1 leading-relaxed">{leak.description}</p>
          )}
          {leak.actionLink && (
            <Link
              to={leak.actionLink.startsWith('/') ? leak.actionLink : `/${leak.actionLink}`}
              className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-[#9FB5FF] hover:text-white transition-colors"
            >
              {leak.action}
              <ChevronRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Läckagedetektorn — dashboard + insikter.
 * @param {'dashboard'|'full'} variant
 */
export default function LeakageDetector({ profile, transactions, variant = 'dashboard', className = '' }) {
  const result = useMemo(
    () => runLeakageDetector(profile, transactions),
    [profile, transactions],
  );

  const { leaks, totalMonthlyLeak, headline, savingsStory, hasLeaks } = result;
  const showCount = variant === 'dashboard' ? 2 : leaks.length;
  const visibleLeaks = leaks.slice(0, showCount);

  if (!transactions?.length) {
    return (
      <section className={`mx-4 sm:mx-5 ${className}`}>
        <div className="rounded-[26px] p-5 border border-white/14" style={glassSurface()}>
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-4 h-4 text-[#0FDEBD]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
              Läckagedetektorn
            </p>
          </div>
          <p className="text-sm text-white/60 leading-relaxed">
            Importera transaktioner — vi hittar dolda abonnemang och onödiga utgifter åt dig.
          </p>
          <Link to="/Import" className="inline-block mt-4">
            <span className="anchor-btn-primary inline-flex px-5 py-2.5 text-sm font-bold">
              Importera bank-data
            </span>
          </Link>
        </div>
      </section>
    );
  }

  if (!hasLeaks && variant === 'dashboard') {
    return (
      <section className={`mx-4 sm:mx-5 ${className}`}>
        <div
          className="rounded-[26px] p-5 border border-emerald-400/20"
          style={{ ...glassSurface(), boxShadow: '0 0 40px rgba(15,222,189,0.08)' }}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white">Inga uppenbara läckage</p>
              <p className="text-xs text-white/50 mt-0.5">
                Vi hittar inga glömda abonnemang eller onödiga dubbletter just nu.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!hasLeaks) return null;

  return (
    <section id="leakage-detector" className={`mx-4 sm:mx-5 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[28px] overflow-hidden border border-amber-400/15"
        style={{
          ...glassSurface(),
          boxShadow: '0 22px 48px rgba(2,8,26,0.42), 0 0 48px rgba(246,173,85,0.1)',
        }}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Droplets className="w-4 h-4 text-amber-300" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                  Läckagedetektorn
                </p>
              </div>
              <h2 className="text-lg font-bold text-white leading-tight">{headline}</h2>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] uppercase tracking-wide text-white/40">Potential</p>
              <p className="text-xl font-black text-amber-200">{fmtLeakageSek(totalMonthlyLeak)}</p>
              <p className="text-[10px] text-white/40">kr/mån</p>
            </div>
          </div>

          <div
            className="rounded-2xl px-4 py-3 mb-4 flex items-start gap-2"
            style={{ background: 'rgba(246,173,85,0.1)', border: '1px solid rgba(246,173,85,0.2)' }}
          >
            <Sparkles className="w-4 h-4 text-amber-200 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-white/75 leading-relaxed">{savingsStory}</p>
          </div>

          <div className="space-y-2.5">
            {visibleLeaks.map((leak, i) => (
              <LeakRow key={leak.id} leak={leak} index={i} compact={variant === 'dashboard'} />
            ))}
          </div>

          {variant === 'dashboard' && leaks.length > 2 && (
            <Link
              to={`${createPageUrl('TransactionHistory')}?tab=insights#leakage-detector`}
              className="mt-4 flex items-center justify-center gap-1 text-sm font-semibold text-[#9FB5FF] hover:text-white transition-colors"
            >
              Se alla {leaks.length} läckage
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}

          {variant === 'full' && (
            <div
              className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between"
            >
              <p className="text-xs text-white/45">
                Totalt {fmtLeakageSek(totalMonthlyLeak)} kr/mån · {fmtLeakageSek(totalMonthlyLeak * 12)} kr/år
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
