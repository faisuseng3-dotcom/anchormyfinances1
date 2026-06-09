// @ts-nocheck
import React, { useState } from 'react';
import { X, Check, MapPin, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQueryClient } from '@tanstack/react-query';
import ProfileAvatar from './ProfileAvatar';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { DashboardDivider } from '@/components/dashboard/DashboardChrome';
import {
  anchorIconButtonClass,
  sectionMetaClass,
  sectionSubtitleClass,
  sectionTitleClass,
} from '@/lib/anchorTheme';
import { applyEconomyTemplate } from '@/lib/galaxyEconomy';
import {
  compareWithUser,
  fmtKr,
  formatMatchLabel,
  getSpendItems,
  insightLine,
} from '@/lib/galaxyProfiles';
import AnchorSheet from '@/components/ui-premium/AnchorSheet';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';

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

export default function ExpandedProfile({ profile, onClose, userFinancialProfile, matchScore = 0 }) {
  const [activated, setActivated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { updateProfile, isPersisted } = useFinancialProfile();
  const queryClient = useQueryClient();

  const items = getSpendItems(profile);
  const showKr = profile.privacy_level === 'full' && profile.finance?.income;
  const comparison = compareWithUser(userFinancialProfile, profile);
  const tip = insightLine(comparison);
  const userIncome = comparison.userIncome;
  const isOwn = profile.isOwn;
  const matchLabel = !isOwn && matchScore > 0 ? formatMatchLabel(matchScore) : null;

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
    <AnchorSheet
      isOpen={Boolean(profile)}
      onClose={onClose}
      title={profile.display_name}
      subtitle={isOwn ? 'Din publicering' : matchLabel ? `${matchLabel} · @${profile.username}` : `@${profile.username}`}
      maxHeight="min(92dvh, 720px)"
      headerRight={
        <AnchorPressable onClick={onClose} className={anchorIconButtonClass} aria-label="Stäng">
          <X className="w-4 h-4" />
        </AnchorPressable>
      }
    >
      <div className="space-y-6 -mx-1">
        <div className="flex items-start gap-4">
          <ProfileAvatar profile={profile} size={56} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-3 mt-1">
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
            {profile.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {profile.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/[0.06] text-white/55 shadow-[var(--anchor-shadow-1)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {profile.bio && <p className={sectionSubtitleClass}>{profile.bio}</p>}

        {profile.isDemo && (
          <p className="text-[12px] text-white/40 rounded-[var(--anchor-radius-md)] px-3 py-2 bg-white/[0.03] ring-1 ring-white/[0.06]">
            Exempelprofil — illustration, inte en riktig användare.
          </p>
        )}

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
                <div className="mt-4 rounded-[var(--anchor-radius-md)] px-4 py-3 shadow-[var(--anchor-shadow-1)] bg-white/[0.03] anchor-elev-1">
                  <p className="text-[14px] text-white/85 leading-relaxed">{tip}</p>
                </div>
              )}
            </div>
          </>
        )}

        {!userIncome && !isOwn && (
          <div className="rounded-[var(--anchor-radius-md)] px-4 py-3 shadow-[var(--anchor-shadow-1)] bg-white/[0.03]">
            <p className={sectionSubtitleClass}>
              Lägg in din månadsinkomst under inställningar för att se belopp i kronor och kopiera budgeten.
            </p>
            <Link
              to={createPageUrl('Settings')}
              className="inline-flex mt-3 h-11 px-5 rounded-full bg-white/[0.08] text-white/90 font-semibold items-center no-underline ring-1 ring-white/[0.1]"
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
            <AnchorPressable
              type="button"
              disabled={activated || saving}
              onClick={applyTemplate}
              className="w-full h-12 rounded-full bg-[var(--color-text-primary)] text-[#050d28] font-semibold disabled:opacity-40 anchor-elev-2 flex items-center justify-center gap-2"
            >
              {activated ? (
                <>
                  <Check className="w-5 h-5" />
                  Budget kopierad till din profil
                </>
              ) : saving ? (
                <span className="w-5 h-5 rounded-full skeleton" />
              ) : (
                'Kopiera till min månadsbudget'
              )}
            </AnchorPressable>
            {activated && (
              <Link
                to="/Budget"
                onClick={onClose}
                className="w-full h-12 rounded-full bg-white/[0.08] text-white/90 font-semibold flex items-center justify-center no-underline ring-1 ring-white/[0.1]"
              >
                Öppna budgetöversikt
              </Link>
            )}
          </div>
        )}
      </div>
    </AnchorSheet>
  );
}
