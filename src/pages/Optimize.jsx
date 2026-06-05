import React, { useState } from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tv, Car, Heart, Apple, Shield, Music, MoreHorizontal, ExternalLink, Loader2, ArrowLeftRight,
} from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import {
  DashboardDivider,
  DashboardSection,
  DashboardStatStrip,
} from '@/components/dashboard/DashboardChrome';
import {
  anchorPrimaryButtonClass,
  anchorSecondaryButtonClass,
  sectionMetaClass,
  sectionSubtitleClass,
} from '@/lib/anchorTheme';
import { useAdvisorContext } from '@/hooks/useAdvisorContext';
import { askPersonalAdvisor } from '@/lib/personalAdvisor';

const CATEGORY_ICONS = {
  entertainment: Music,
  transport: Car,
  health: Heart,
  streaming: Tv,
  food: Apple,
  insurance: Shield,
  other: MoreHorizontal,
};

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

export default function Optimize() {
  const [optimizingId, setOptimizingId] = useState(null);
  const [suggestions, setSuggestions] = useState({});
  const { profile, transactions, isDemoMode } = useAdvisorContext();

  const subscriptions = profile?.subscriptions || [];
  const totalCost = subscriptions.reduce((sum, s) => sum + (s.amount || 0), 0);

  const findAlternatives = async (subscription, index) => {
    setOptimizingId(index);
    try {
      const response = await askPersonalAdvisor(
        {
          scenario: 'subscription_alternatives',
          subscription: {
            name: subscription.name,
            amount: subscription.amount,
            category: subscription.category,
          },
        },
        { profile, transactions, isDemoMode },
      );
      setSuggestions((prev) => ({ ...prev, [index]: response }));
    } catch {
      setSuggestions((prev) => ({
        ...prev,
        [index]: {
          alternatives: [],
          tips: 'Kunde inte hämta förslag just nu. Prova igen om en stund.',
        },
      }));
    }
    setOptimizingId(null);
  };

  return (
    <PageShell
      title="Sänk fasta kostnader"
      subtitle="Abonnemang"
      backHref={createPageUrl('Dashboard')}
    >
      <DashboardStatStrip
        items={[
          { label: 'Totalt per månad', value: `${fmt(totalCost)} kr` },
          { label: 'Antal', value: String(subscriptions.length) },
        ]}
      />

      {subscriptions.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-[17px] font-semibold text-white mb-1">Inga abonnemang ännu</p>
          <p className={sectionSubtitleClass}>
            Lägg till dem under inställningar så kan vi jämföra priser här.
          </p>
          <Link to={createPageUrl('Settings')} className={`${anchorPrimaryButtonClass} inline-flex mt-6 px-6 no-underline`}>
            Gå till inställningar
          </Link>
        </div>
      ) : (
        <DashboardSection nested title="Dina abonnemang">
          {subscriptions.map((sub, i) => {
            const Icon = CATEGORY_ICONS[sub.category] || MoreHorizontal;
            const suggestion = suggestions[i];
            const loading = optimizingId === i;

            return (
              <React.Fragment key={`${sub.name}-${i}`}>
                {i > 0 && <DashboardDivider className="my-2" />}
                <div className="py-3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-white/80" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-medium text-white">{sub.name}</p>
                      <p className={sectionMetaClass}>{fmt(sub.amount)} kr/mån</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => findAlternatives(sub, i)}
                      disabled={loading}
                      className={`${anchorSecondaryButtonClass} !h-10 !px-3 !text-[13px]`}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <ArrowLeftRight className="w-4 h-4" />
                          Jämför
                        </>
                      )}
                    </button>
                  </div>

                  <AnimatePresence>
                    {suggestion && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-3 space-y-2">
                          {suggestion.alternatives?.length > 0 ? (
                            suggestion.alternatives.map((alt, j) => (
                              <div
                                key={j}
                                className="flex items-start justify-between gap-3 py-2 border-b border-white/[0.06] last:border-0"
                              >
                                <div className="min-w-0">
                                  <p className="text-[14px] font-medium text-white">{alt.name}</p>
                                  {alt.description && (
                                    <p className={`${sectionSubtitleClass} mt-0.5`}>{alt.description}</p>
                                  )}
                                  <p className="text-[13px] text-emerald-300/90 mt-1">
                                    {alt.price}
                                    {alt.savings ? ` · sparar ${alt.savings}` : ''}
                                  </p>
                                </div>
                                {alt.url && (
                                  <a
                                    href={alt.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-white/45 hover:text-white"
                                    aria-label="Öppna länk"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className={`${sectionSubtitleClass} py-1`}>{suggestion.tips}</p>
                          )}
                          {suggestion.tips && suggestion.alternatives?.length > 0 && (
                            <p className={`${sectionSubtitleClass} pt-2 border-t border-white/[0.06]`}>
                              {suggestion.tips}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </React.Fragment>
            );
          })}
        </DashboardSection>
      )}

      <p className={`${sectionMetaClass} text-center mt-6`}>
        Tips: du kan också pausa abonnemang under Pro → Skär ner fasta kostnader.
      </p>
    </PageShell>
  );
}

export const pageSeo = pageSeoFor('Optimize');
