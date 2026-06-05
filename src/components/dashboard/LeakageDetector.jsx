import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Smartphone, Copy, Coffee, Wallet } from 'lucide-react';
import { runLeakageDetector, fmtLeakageSek } from '@/lib/leakageEngine';
import { createPageUrl } from '@/utils';
import { useLeakageExplanations } from '@/hooks/useLeakageExplanations';
import { DashboardDivider, DashboardListRow, DashboardSection } from './DashboardChrome';
import { dashLabel } from '@/lib/appSurface';
import InsightWhyButton from '@/components/insights/InsightWhyButton';

const TYPE_ICON = {
  subscription: Smartphone,
  duplicate: Copy,
  habit: Coffee,
  forgotten: Wallet,
};

function LeakIcon({ type }) {
  const Icon = TYPE_ICON[type] || Wallet;
  return (
    <div className="w-10 h-10 rounded-2xl bg-amber-400/10 flex items-center justify-center ring-1 ring-amber-400/20">
      <Icon className="w-4 h-4 text-amber-200/90" />
    </div>
  );
}

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
      <DashboardSection nested={nested} title="Dolda flöden" subtitle="Hitta återkommande utgifter" className={className}>
        <p className="text-[14px] text-white/45 font-light">
          Importera transaktioner så skannar vi mönster.
        </p>
        <Link
          to="/Import"
          className="inline-flex mt-4 h-10 px-5 rounded-full text-[14px] font-medium text-white/85 bg-white/[0.07] ring-1 ring-white/[0.08] no-underline items-center"
        >
          Importera
        </Link>
      </DashboardSection>
    );
  }

  if (!hasLeaks && variant === 'dashboard') {
    return (
      <DashboardSection nested={nested} title="Dolda flöden" className={className}>
        <div className="flex items-center gap-3 py-1">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="text-[15px] text-white/75 font-light">Inga uppenbara läckage just nu.</p>
        </div>
      </DashboardSection>
    );
  }

  if (!hasLeaks) return null;

  return (
    <DashboardSection
      nested={nested}
      id="leakage-detector"
      title="Dolda flöden"
      subtitle={headline}
      className={className}
      actionHref={
        variant === 'dashboard' && leaks.length > showCount
          ? `${createPageUrl('TransactionHistory')}?tab=insights#leakage-detector`
          : undefined
      }
      actionLabel={variant === 'dashboard' ? `Alla ${leaks.length}` : undefined}
    >
      <p className={`${dashLabel} mb-3`}>
        <span className="text-amber-200/90">{fmtLeakageSek(totalMonthlyLeak)} kr/mån</span>
        {' · '}
        {savingsStory}
      </p>

      <div>
        {visibleLeaks.map((leak, i) => {
          const note = explanations[leak.id];
          const subtitle =
            variant === 'full'
              ? leak.description
              : note
                ? note.slice(0, 72) + (note.length > 72 ? '…' : '')
                : leak.action;

          const rowProps = {
            leading: <LeakIcon type={leak.type} />,
            title: leak.title,
            subtitle,
            trailing: (
              <span className="text-[15px] font-semibold text-amber-200/90 tabular-nums">
                {fmtLeakageSek(leak.monthlyAmount)}/mån
              </span>
            ),
          };

          return (
            <React.Fragment key={leak.id}>
              {i > 0 && <DashboardDivider />}
              {leak.actionLink ? (
                <DashboardListRow
                  href={leak.actionLink.startsWith('/') ? leak.actionLink : `/${leak.actionLink}`}
                  {...rowProps}
                />
              ) : (
                <DashboardListRow {...rowProps} />
              )}
              {variant === 'full' && (
                <div className="pb-2 pl-14">
                  {note && (
                    <p className="text-[13px] text-white/45 font-light leading-relaxed">{note}</p>
                  )}
                  <InsightWhyButton why={leak.why} className="mt-1" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {variant === 'full' && (
        <p className="text-[12px] text-white/35 mt-4 pt-3 border-t border-white/[0.08] tabular-nums">
          {fmtLeakageSek(totalMonthlyLeak)} kr/mån · {fmtLeakageSek(totalMonthlyLeak * 12)} kr/år
        </p>
      )}
    </DashboardSection>
  );
}
