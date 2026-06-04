import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Repeat } from 'lucide-react';
import { Link } from 'react-router-dom';
import { scanSubscriptions } from '@/lib/anchorBrain';
import { askPersonalAdvisor } from '@/lib/personalAdvisor';
import { createPageUrl } from '@/utils';
import { sectionMetaClass, sectionSubtitleClass, anchorSecondaryButtonClass } from '@/lib/anchorTheme';

export default function SubscriptionScannerCard({ profile, transactions }) {
  const scan = scanSubscriptions(profile, transactions);
  const [ai, setAi] = useState(null);

  useEffect(() => {
    if (scan.total_kr < 100) return;
    let cancelled = false;
    askPersonalAdvisor({ scenario: 'subscription_scan' }, { profile, transactions })
      .then((res) => {
        if (!cancelled) setAi(res);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [profile, transactions, scan.total_kr]);

  const handleShare = async () => {
    const text = ai?.share_caption || scan.share_line;
    if (navigator.share) {
      try {
        await navigator.share({ text, title: 'Anchor — prenumerationer' });
        return;
      } catch {
        /* fallback */
      }
    }
    await navigator.clipboard.writeText(text);
  };

  if (scan.subscription_count === 0 && scan.total_kr === 0) {
    return (
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4">
        <p className={sectionMetaClass}>Prenumerationsscanner</p>
        <p className={`${sectionSubtitleClass} mt-1`}>
          Lägg till abonnemang under Inställningar — vi visar många-bäckar-små-effekten.
        </p>
        <Link to={createPageUrl('Settings')} className={`${anchorSecondaryButtonClass} inline-flex mt-3 text-[13px] h-10 px-4`}>
          Lägg till abonnemang
        </Link>
      </section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-2xl border border-[#6B9FFF]/20 bg-gradient-to-br from-[#6B9FFF]/10 to-transparent px-4 py-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Repeat className="w-4 h-4 text-[#9FB5FF]" />
          <p className={sectionMetaClass}>Många bäckar små</p>
        </div>
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1 text-[12px] font-medium text-[#9FB5FF]"
        >
          <Share2 className="w-3.5 h-3.5" />
          Dela
        </button>
      </div>

      <p className="text-[28px] font-semibold text-white tabular-nums mt-2 leading-none">
        {scan.total_kr.toLocaleString('sv-SE')}
        <span className="text-[16px] text-white/45 ml-1.5">kr/mån</span>
      </p>
      <p className="text-[14px] text-white/50 mt-1">
        {scan.subscription_count} abonnemang · {scan.profile_subs_kr.toLocaleString('sv-SE')} kr registrerade
      </p>

      {ai?.headline && (
        <p className="text-[15px] font-medium text-white mt-3">{ai.headline}</p>
      )}
      {ai?.insight && (
        <p className={`${sectionSubtitleClass} mt-1 leading-relaxed`}>{ai.insight}</p>
      )}
    </motion.section>
  );
}
