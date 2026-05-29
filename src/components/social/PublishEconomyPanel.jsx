import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Radio, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useSocialProfile } from '@/hooks/useSocialProfile';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { isGuestMode } from '@/components/guestStorage';
import {
  anchorPrimaryButtonClass,
  anchorSecondaryButtonClass,
  sectionMetaClass,
  sectionSubtitleClass,
  sectionTitleClass,
} from '@/lib/anchorTheme';
import {
  buildEconomySnapshot,
  canPublishEconomy,
  fmtKr,
  highlightFromSnapshot,
  inferGalaxyTags,
} from '@/lib/galaxyEconomy';

export default function PublishEconomyPanel() {
  const { socialProfile, isLoading: socialLoading, saveSocialProfile } = useSocialProfile();
  const { profile: financialProfile, isPersisted } = useFinancialProfile();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const isGuest = isGuestMode();
  const published = Boolean(socialProfile?.economy_published);
  const check = canPublishEconomy(financialProfile, socialProfile);

  const handlePublish = async () => {
    if (!check.ok) return;
    setBusy(true);
    setMessage(null);
    try {
      const snapshot = buildEconomySnapshot(financialProfile, socialProfile.privacy_level);
      await saveSocialProfile({
        economy_published: true,
        economy_snapshot: snapshot,
        galaxy_tags: inferGalaxyTags(socialProfile.occupation, financialProfile),
        display_name:
          socialProfile.display_name ||
          socialProfile.username ||
          financialProfile?.displayName,
      });
      setMessage('Din ekonomi är publicerad. Andra kan nu se och använda din fördelning.');
    } catch {
      setMessage('Kunde inte publicera. Försök igen.');
    } finally {
      setBusy(false);
    }
  };

  const handleUnpublish = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await saveSocialProfile({ economy_published: false });
      setMessage('Din ekonomi är inte längre synlig för andra.');
    } catch {
      setMessage('Kunde inte ta bort publiceringen.');
    } finally {
      setBusy(false);
    }
  };

  const handleRefresh = async () => {
    if (!check.ok) return;
    setBusy(true);
    setMessage(null);
    try {
      const snapshot = buildEconomySnapshot(financialProfile, socialProfile.privacy_level);
      await saveSocialProfile({
        economy_published: true,
        economy_snapshot: snapshot,
        galaxy_tags: inferGalaxyTags(socialProfile.occupation, financialProfile),
      });
      setMessage('Publiceringen är uppdaterad med din senaste budget.');
    } catch {
      setMessage('Kunde inte uppdatera.');
    } finally {
      setBusy(false);
    }
  };

  if (socialLoading) {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-6 flex justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-white/40" />
      </div>
    );
  }

  if (isGuest || !isPersisted) {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-4">
        <p className={sectionTitleClass}>Dela din ekonomi</p>
        <p className={`${sectionSubtitleClass} mt-1`}>
          Skapa ett konto och fyll i inkomst och budget för att publicera din fördelning här.
        </p>
        <Link
          to={createPageUrl('CreateAccount')}
          className={`${anchorPrimaryButtonClass} inline-flex mt-4 px-6 no-underline`}
        >
          Skapa konto
        </Link>
      </div>
    );
  }

  const snap = socialProfile?.economy_snapshot;
  const privacy = socialProfile?.privacy_level || 'hybrid';

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-4 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-white/[0.08] flex items-center justify-center flex-shrink-0">
          {published ? (
            <Radio className="w-5 h-5 text-emerald-300" />
          ) : (
            <EyeOff className="w-5 h-5 text-white/45" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className={sectionTitleClass}>Dela din ekonomi</p>
          <p className={`${sectionSubtitleClass} mt-0.5`}>
            {published
              ? `Synlig som @${socialProfile.username} — ${highlightFromSnapshot(snap)}`
              : 'Publicera hur du fördelar lönen så andra kan jämföra och prova samma mall.'}
          </p>
        </div>
      </div>

      <div className="rounded-lg px-3 py-2.5 bg-white/[0.04] border border-white/[0.06]">
        <p className={sectionMetaClass}>
          {privacy === 'full' && (
            <span className="inline-flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> Andra ser kronor och procent
            </span>
          )}
          {privacy === 'hybrid' && 'Andra ser bara procent — inga kronbelopp'}
          {privacy === 'ghost' && 'Ghost-läge: inget kan publiceras'}
        </p>
        <Link
          to={createPageUrl('Social')}
          className="text-[13px] font-medium text-white/55 hover:text-white/80 mt-1 inline-block"
        >
          Ändra under Social → Integritet
        </Link>
      </div>

      {!check.ok && !published && (
        <p className="text-[14px] text-amber-200/90 leading-relaxed">{check.reason}</p>
      )}

      {published && snap?.income && (
        <p className={sectionMetaClass}>Referensinkomst i publiceringen: {fmtKr(snap.income)}/mån</p>
      )}

      {message && (
        <p className="text-[14px] text-emerald-200/90 leading-relaxed">{message}</p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        {!published ? (
          <button
            type="button"
            disabled={busy || !check.ok}
            onClick={handlePublish}
            className={`${anchorPrimaryButtonClass} flex-1 disabled:opacity-50`}
          >
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publicera min ekonomi'}
          </button>
        ) : (
          <>
            <button
              type="button"
              disabled={busy || !check.ok}
              onClick={handleRefresh}
              className={`${anchorPrimaryButtonClass} flex-1 disabled:opacity-50`}
            >
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Uppdatera publicering'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleUnpublish}
              className={`${anchorSecondaryButtonClass} flex-1`}
            >
              Ta bort
            </button>
          </>
        )}
      </div>

      {!socialProfile?.username && (
        <Link
          to={createPageUrl('Social')}
          className={`${anchorSecondaryButtonClass} w-full no-underline`}
        >
          Skapa @användarnamn först
        </Link>
      )}
    </div>
  );
}
