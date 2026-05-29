import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, MapPin, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQueryClient } from '@tanstack/react-query';
import { AvatarSVG } from './avatar/PBREngine';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { DashboardDivider } from '@/components/dashboard/DashboardChrome';
import {
  anchorIconButtonClass,
  anchorPrimaryButtonClass,
  anchorSecondaryButtonClass,
  elevatedSheet,
  sectionMetaClass,
  sectionSubtitleClass,
  sectionTitleClass,
} from '@/lib/anchorTheme';
import { applyEconomyTemplate } from '@/lib/galaxyEconomy';
import {
  compareWithUser,
  fmtKr,
  getSpendItems,
  insightLine,
} from '@/lib/galaxyProfiles';

function BudgetRow({ label, pct, amountKr, showKr, color }) {
  return (
    <div className="py-2.5">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <span className="text-[15px] font-medium text-white">{label}</span>
        <span className="text-[15px] font-semibold tabular-nums text-white">
          {showKr && amountKr != null ? fmtKr(amountKr) : `${pct} %`}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${Math.min(pct, 100)}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function ExpandedProfile({ profile, onClose, userFinancialProfile }) {
  const [activated, setActivated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { updateProfile, isPersisted } = useFinancialProfile();
  const queryClient = useQueryClient();

  const accent = profile.avatar_config?.bg || profile.avatar_style?.bg || '#7FA0FF';
  const items = getSpendItems(profile);
  const showKr = profile.privacy_level === 'full' && profile.finance?.income;
  const comparison = compareWithUser(userFinancialProfile, profile);
  const tip = insightLine(comparison);
  const userIncome = comparison.userIncome;
  const isOwn = profile.isOwn;

  const applyTemplate = async () => {
    if (!userIncome) return;
    setSaving(true);
    setError(null);
    try {
      const budgetLimits = applyEconomyTemplate(profile, userIncome);
      if (Object.keys(budgetLimits).length === 0) {
        setError('Den här profilen har inga budgetkategorier att kopiera.');
        return;
      }
      if (isPersisted) {
        await updateProfile({ budgetLimits });
      } else {
        setError('Skapa konto för att spara budgeten i din profil.');
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ['financialProfile'] });
      setActivated(true);
    } catch {
      setError('Kunde inte spara budgeten. Försök igen.');
    } finally {
      setSaving(false);
    }
  };

  const appliedPreview = userIncome > 0 ? applyEconomyTemplate(profile, userIncome) : {};

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center"
        style={{ background: 'rgba(0,0,0,0.65)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl"
          style={elevatedSheet()}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-[rgba(12,18,38,0.98)]">
            <p className={sectionMetaClass}>{isOwn ? 'Din publicering' : 'Profil'}</p>
            <button type="button" onClick={onClose} className={anchorIconButtonClass} aria-label="Stäng">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-5 pt-4 pb-6 space-y-6">
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: `${accent}22`, border: `1px solid ${accent}44` }}
              >
                <AvatarSVG config={profile.avatar_config || profile.avatar_style} size={48} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className={sectionTitleClass}>{profile.display_name}</h2>
                <p className={sectionSubtitleClass}>@{profile.username}</p>
                <div className="flex flex-wrap gap-3 mt-2">
                  {profile.occupation && (
                    <span className={`${sectionMetaClass} inline-flex items-center gap-1`}>
                      <Briefcase className="w-3.5 h-3.5" />
                      {profile.occupation}
                    </span>
                  )}
                  {profile.city && (
                    <span className={`${sectionMetaClass} inline-flex items-center gap-1`}>
                      <MapPin className="w-3.5 h-3.5" />
                      {profile.city}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {profile.bio && <p className={sectionSubtitleClass}>{profile.bio}</p>}

            {items.length > 0 ? (
              <div>
                <h3 className={`${sectionTitleClass} mb-1`}>Så fördelas pengarna</h3>
                <p className={`${sectionSubtitleClass} mb-4`}>
                  {showKr
                    ? `Utifrån ${fmtKr(profile.finance.income)} i månaden.`
                    : 'Procent av inkomsten (anonym delning).'}
                </p>
                {items.map((item) => (
                  <BudgetRow
                    key={item.label}
                    label={item.label}
                    pct={item.pct}
                    amountKr={
                      item.amount ??
                      (profile.finance?.income
                        ? Math.round((item.pct / 100) * profile.finance.income)
                        : null)
                    }
                    showKr={showKr}
                    color={item.color}
                  />
                ))}
                <p className={`${sectionMetaClass} mt-3`}>
                  Resterande cirka {comparison.theirSavingsPct} % går till sparande eller buffert.
                </p>
              </div>
            ) : (
              <p className={sectionSubtitleClass}>Den här profilen har inte delat sin budget ännu.</p>
            )}

            {userIncome > 0 && items.length > 0 && !isOwn && (
              <>
                <DashboardDivider />
                <div>
                  <h3 className={`${sectionTitleClass} mb-1`}>På din inkomst ({fmtKr(userIncome)})</h3>
                  <p className={`${sectionSubtitleClass} mb-4`}>
                    Så här skulle kategorigränserna se ut om du använder samma fördelning:
                  </p>
                  {Object.keys(appliedPreview).length === 0 ? (
                    <p className={sectionSubtitleClass}>
                      Profilen har ingen kopierbar kategoribudget (bara fasta kostnader/sparande).
                    </p>
                  ) : (
                    Object.entries(appliedPreview).map(([key, kr]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between py-2 border-b border-white/[0.06] last:border-0"
                      >
                        <span className="text-[14px] text-white/70">
                          {{
                            food: 'Mat',
                            transport: 'Transport',
                            entertainment: 'Nöje',
                            travel: 'Resor',
                            health: 'Hälsa',
                            home: 'Boende',
                            shopping: 'Shopping',
                            other: 'Övrigt',
                          }[key] || key}
                        </span>
                        <span className="text-[14px] font-semibold tabular-nums text-white">
                          {fmtKr(kr)}/mån
                        </span>
                      </div>
                    ))
                  )}
                  {tip && (
                    <div className="mt-4 rounded-xl px-4 py-3 border border-white/[0.08] bg-white/[0.03]">
                      <p className="text-[14px] text-white/85 leading-relaxed">{tip}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {!userIncome && !isOwn && (
              <div className="rounded-xl px-4 py-3 border border-white/[0.08] bg-white/[0.03]">
                <p className={sectionSubtitleClass}>
                  Lägg in din månadsinkomst under inställningar för att se belopp i kronor och
                  kopiera budgeten.
                </p>
                <Link
                  to={createPageUrl('Settings')}
                  className={`${anchorSecondaryButtonClass} inline-flex mt-3 px-5 no-underline`}
                  onClick={onClose}
                >
                  Gå till inställningar
                </Link>
              </div>
            )}

            {isOwn && (
              <p className={sectionSubtitleClass}>
                Det här är hur andra ser din publicerade fördelning. Uppdatera via knappen
                &quot;Uppdatera publicering&quot; högst upp på sidan.
              </p>
            )}

            {error && <p className="text-[14px] text-rose-300/90">{error}</p>}

            {userIncome > 0 && items.length > 0 && !isOwn && (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={activated || saving}
                  onClick={applyTemplate}
                  className={`w-full ${anchorPrimaryButtonClass} disabled:opacity-60`}
                >
                  {activated ? (
                    <>
                      <Check className="w-5 h-5" />
                      Budget kopierad till din profil
                    </>
                  ) : saving ? (
                    'Sparar…'
                  ) : (
                    'Kopiera till min månadsbudget'
                  )}
                </button>
                {activated && (
                  <Link
                    to={createPageUrl('BudgetDashboard')}
                    onClick={onClose}
                    className={`w-full ${anchorSecondaryButtonClass} no-underline`}
                  >
                    Öppna budgetöversikt
                  </Link>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
