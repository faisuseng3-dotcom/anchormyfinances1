import React, { useEffect, useState } from 'react';
import { Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { scanSubscriptions } from '@/lib/anchorBrain';
import { askPersonalAdvisor } from '@/lib/personalAdvisor';
import { createPageUrl } from '@/utils';
import {
  dashRailCard,
  dashRailCardBorder,
  dashRailCardInner,
  dashLabel,
} from '@/lib/dashboardTheme';

export default function SubscriptionScannerCard({ profile, transactions, variant = 'default' }) {
  const scan = scanSubscriptions(profile, transactions);
  const [copy, setCopy] = useState(null);

  useEffect(() => {
    if (scan.total_kr < 100) return;
    let cancelled = false;
    askPersonalAdvisor({ scenario: 'subscription_scan' }, { profile, transactions })
      .then((res) => {
        if (!cancelled) setCopy(res);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [profile, transactions, scan.total_kr]);

  const handleShare = async () => {
    const text = copy?.share_caption || scan.share_line;
    if (navigator.share) {
      try {
        await navigator.share({ text, title: 'Lago' });
        return;
      } catch {
        /* cancelled */
      }
    }
    await navigator.clipboard.writeText(text);
  };

  if (variant === 'rail') {
    if (scan.subscription_count === 0 && scan.total_kr === 0) {
      return (
        <div className={dashRailCard}>
          <div className={dashRailCardInner} />
          <div className={dashRailCardBorder} />
          <div className="relative z-10 h-full flex flex-col justify-between min-h-[148px]">
            <p className={dashLabel}>Prenumerationer</p>
            <p className="text-[14px] text-[var(--color-text-secondary)] leading-snug">Lägg till under Inställningar</p>
            <Link to={createPageUrl('Settings')} className="text-[13px] font-medium text-[var(--color-accent)]">
              Öppna →
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className={dashRailCard}>
        <div
          className={dashRailCardInner}
          style={{
            background:
              'linear-gradient(135deg, rgba(94, 234, 212, 0.12) 0%, rgba(37, 99, 235, 0.03) 55%)',
          }}
        />
        <div className={dashRailCardBorder} />
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <p className={dashLabel}>Flöden / mån</p>
            <button type="button" onClick={handleShare} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[36px] font-light tracking-tight text-[var(--color-text-primary)] tabular-nums mt-3 leading-none">
            {scan.total_kr.toLocaleString('sv-SE')}
          </p>
          <p className="text-[13px] text-[var(--color-text-secondary)] mt-2">
            {scan.subscription_count} tjänster
          </p>
          {copy?.insight && (
            <p className="text-[12px] text-[var(--color-text-secondary)] mt-3 line-clamp-3 leading-relaxed">{copy.insight}</p>
          )}
        </div>
      </div>
    );
  }

  return null;
}
