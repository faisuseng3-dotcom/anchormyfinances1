import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { runLeakageDetector, fmtLeakageSek } from '@/lib/leakageEngine';
import { createPageUrl } from '@/utils';
import { useLeakageExplanations } from '@/hooks/useLeakageExplanations';
import { DashboardDivider, DashboardListRow, DashboardSection } from './DashboardChrome';
import { sectionSubtitleClass } from '@/lib/anchorTheme';

const TYPE_ICON = {
  subscription: '📱',
  duplicate: '🎬',
  habit: '☕',
  forgotten: '💸',
};

export default function LeakageDetector({ profile, transactions, variant = 'dashboard', className = '', nested = false }) {
  const result = useMemo(
    () => runLeakageDetector(profile, transactions),
    [profile, transactions],
  );

  const { leaks, totalMonthlyLeak, headline, savingsStory, hasLeaks } = result;
  const showCount = variant === 'dashboard' ? 3 : leaks.length;
  const visibleLeaks = leaks.slice(0, showCount);

  const { data: explanations = {} } = useLeakageExplanations(
    visibleLeaks,
    hasLeaks && visibleLeaks.length > 0,
  );

  if (!transactions?.length) {
    return (
      <DashboardSection nested={nested} title="Läckage" subtitle="Hitta dolda abonnemang" className={className}>
        <p className={sectionSubtitleClass}>
          Importera transaktioner så skannar vi efter onödiga utgifter.
        </p>
        <Link to="/Import" className="anchor-btn-primary inline-flex mt-4 px-5 text-sm">
          Importera
        </Link>
      </DashboardSection>
    );
  }

  if (!hasLeaks && variant === 'dashboard') {
    return (
      <DashboardSection nested={nested} title="Läckage" className={className}>
        <div className="flex items-center gap-3 py-1">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="text-[15px] text-white/80">Inga uppenbara läckage just nu.</p>
        </div>
      </DashboardSection>
    );
  }

  if (!hasLeaks) return null;

  return (
    <DashboardSection
      nested={nested}
      id="leakage-detector"
      title="Läckage"
      subtitle={headline}
      className={className}
      actionHref={
        variant === 'dashboard' && leaks.length > showCount
          ? `${createPageUrl('TransactionHistory')}?tab=insights#leakage-detector`
          : undefined
      }
      actionLabel={variant === 'dashboard' ? `Alla ${leaks.length}` : undefined}
    >
      <p className={`${sectionSubtitleClass} mb-3`}>
        <span className="text-amber-200/90 font-semibold">{fmtLeakageSek(totalMonthlyLeak)} kr/mån</span>
        {' · '}
        {savingsStory}
      </p>

      <div>
        {visibleLeaks.map((leak, i) => {
          const aiText = explanations[leak.id];
          const subtitle =
            variant === 'full'
              ? leak.description
              : aiText
                ? aiText.slice(0, 72) + (aiText.length > 72 ? '…' : '')
                : leak.action;

          return (
          <React.Fragment key={leak.id}>
            {i > 0 && <DashboardDivider />}
            {leak.actionLink ? (
              <DashboardListRow
                href={leak.actionLink.startsWith('/') ? leak.actionLink : `/${leak.actionLink}`}
                leading={<span className="text-lg">{TYPE_ICON[leak.type] || '💸'}</span>}
                title={leak.title}
                subtitle={subtitle}
                trailing={
                  <span className="text-[15px] font-semibold text-amber-200/90 tabular-nums">
                    {fmtLeakageSek(leak.monthlyAmount)}/mån
                  </span>
                }
              />
            ) : (
              <DashboardListRow
                leading={<span className="text-lg">{TYPE_ICON[leak.type] || '💸'}</span>}
                title={leak.title}
                subtitle={subtitle}
                trailing={
                  <span className="text-[15px] font-semibold text-amber-200/90 tabular-nums">
                    {fmtLeakageSek(leak.monthlyAmount)}/mån
                  </span>
                }
              />
            )}
            {variant === 'full' && aiText && (
              <p className="text-[13px] text-white/50 pb-2 pl-12 flex items-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#9FB5FF] flex-shrink-0 mt-0.5" />
                {aiText}
              </p>
            )}
          </React.Fragment>
          );
        })}
      </div>

      {variant === 'full' && (
        <p className="text-[12px] text-white/40 mt-4 pt-3 border-t border-white/[0.08]">
          {fmtLeakageSek(totalMonthlyLeak)} kr/mån · {fmtLeakageSek(totalMonthlyLeak * 12)} kr/år
        </p>
      )}
    </DashboardSection>
  );
}
