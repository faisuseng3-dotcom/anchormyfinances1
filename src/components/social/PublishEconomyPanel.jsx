import React, { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Radio, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { useSocialProfile } from '@/hooks/useSocialProfile';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { isGuestMode } from '@/components/guestStorage';
import {
  sectionMetaClass,
  sectionSubtitleClass,
  sectionTitleClass,
} from '@/lib/anchorTheme';
import { surface } from '@/lib/designTokens';
import {
  buildEconomySnapshot,
  canPublishEconomy,
  fmtKr,
  highlightFromSnapshot,
  inferGalaxyTags,
} from '@/lib/galaxyEconomy';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';
import { cn } from '@/lib/utils';

export default function PublishEconomyPanel({ defaultCollapsed = false }) {
  const queryClient = useQueryClient();
  const { socialProfile, isLoading: socialLoading, saveSocialProfile } = useSocialProfile();
  const { profile: financialProfile, isPersisted } = useFinancialProfile();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [expanded, setExpanded] = useState(!defaultCollapsed);

  useEffect(() => {
    setExpanded(!defaultCollapsed);
  }, [defaultCollapsed]);

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
      queryClient.invalidateQueries({ queryKey: ['galaxyProfiles'] });
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
      queryClient.invalidateQueries({ queryKey: ['galaxyProfiles'] });
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
      queryClient.invalidateQueries({ queryKey: ['galaxyProfiles'] });
    } catch {
      setMessage('Kunde inte uppdatera.');
    } finally {
      setBusy(false);
    }
  };

  if (socialLoading) {
    return (
      <div className={`${surface.card} px-4 py-6 mb-6`}>
        <div className="h-4 w-1/3 rounded-full skeleton mb-3" />
        <div className="h-10 rounded-[var(--anchor-radius-md)] skeleton" />
      </div>
    );
  }

  if (isGuest || !isPersisted) {
    return (
      <div className={`${surface.card} px-4 py-4 mb-6`}>
        <p className={sectionTitleClass}>Dela din ekonomi</p>
        <p className={`${sectionSubtitleClass} mt-1`}>
          Skapa ett konto och fyll i inkomst och budget för att publicera din fördelning här.
        </p>
        <Link
          to={createPageUrl('CreateAccount')}
          className="inline-flex mt-4 h-12 px-6 rounded-full bg-[var(--color-text-primary)] text-white font-semibold items-center anchor-elev-2 no-underline"
        >
          Skapa konto
        </Link>
      </div>
    );
  }

  const snap = socialProfile?.economy_snapshot;
  const privacy = socialProfile?.privacy_level || 'hybrid';
  const toggleExpanded = () => setExpanded((v) => !v);

  return (
    <div
      className={cn(
        `${surface.card} px-4 py-4 space-y-4 mb-6`,
        published && 'ring-emerald-500/20 bg-emerald-500/[0.04]',
      )}
    >
      {published ? (
        <AnchorPressable
          type="button"
          onClick={toggleExpanded}
          minTouch={false}
          className="w-full flex items-start gap-3 text-left"
        >
          <HeaderContent
            published={published}
            socialProfile={socialProfile}
            snap={snap}
            expanded={expanded}
          />
        </AnchorPressable>
      ) : (
        <div className="w-full flex items-start gap-3 text-left">
          <HeaderContent
            published={published}
            socialProfile={socialProfile}
            snap={snap}
            expanded={expanded}
          />
        </div>
      )}

      {(!published || expanded) && (
        <>
          <div className="rounded-[var(--anchor-radius-md)] px-3 py-2.5 bg-[var(--color-background-secondary)] ring-1 ring-[var(--color-border)]">
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
              to={`${createPageUrl('Social')}?tab=privacy`}
              className="text-[13px] font-medium text-[var(--color-accent)] mt-1 inline-block no-underline anchor-pressable"
            >
              Ändra under Social → Integritet
            </Link>
          </div>

          {!check.ok && !published && (
            <p className="text-[14px] text-amber-200/90 leading-relaxed">{check.reason}</p>
          )}

          {published && snap?.income && (
            <p className={sectionMetaClass}>
              Referensinkomst i publiceringen: {fmtKr(snap.income)}/mån
            </p>
          )}

          {message && (
            <p className="text-[14px] text-emerald-200/90 leading-relaxed">{message}</p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            {!published ? (
              <AnchorPressable
                type="button"
                disabled={busy || !check.ok}
                onClick={handlePublish}
                className="flex-1 h-12 rounded-full bg-[var(--color-text-primary)] text-white font-semibold disabled:opacity-40 anchor-elev-2"
              >
                {busy ? <span className="w-5 h-5 rounded-full skeleton mx-auto block" /> : 'Publicera min ekonomi'}
              </AnchorPressable>
            ) : (
              <>
                <AnchorPressable
                  type="button"
                  disabled={busy || !check.ok}
                  onClick={handleRefresh}
                  className="flex-1 h-12 rounded-full bg-[var(--color-text-primary)] text-white font-semibold disabled:opacity-40 anchor-elev-2"
                >
                  {busy ? <span className="w-5 h-5 rounded-full skeleton mx-auto block" /> : 'Uppdatera publicering'}
                </AnchorPressable>
                <AnchorPressable
                  type="button"
                  disabled={busy}
                  onClick={handleUnpublish}
                  className="flex-1 h-12 rounded-full bg-white text-[var(--color-text-primary)] font-semibold ring-1 ring-[var(--color-border)]"
                >
                  Ta bort
                </AnchorPressable>
              </>
            )}
          </div>

          {!socialProfile?.username && (
            <Link
              to={createPageUrl('Social')}
              className="w-full h-12 rounded-full bg-white text-[var(--color-text-primary)] font-semibold flex items-center justify-center no-underline ring-1 ring-[var(--color-border)]"
            >
              Skapa @användarnamn först
            </Link>
          )}
        </>
      )}
    </div>
  );
}

function HeaderContent({ published, socialProfile, snap, expanded }) {
  return (
    <>
      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
          published ? 'bg-emerald-500/15' : 'bg-[var(--color-background-secondary)]'
        }`}
      >
        {published ? (
          <Radio className="w-5 h-5 text-emerald-300" />
        ) : (
          <EyeOff className="w-5 h-5 text-[var(--color-text-muted)]" />
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
      {published && (
        <span className="text-[var(--color-text-muted)] mt-1 flex-shrink-0">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </span>
      )}
    </>
  );
}
