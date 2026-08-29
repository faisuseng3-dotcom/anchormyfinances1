// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { Search, Users, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { DashboardDivider, DashboardSection } from '@/components/dashboard/DashboardChrome';
import { anchorInputClass, sectionMetaClass, sectionSubtitleClass } from '@/lib/anchorTheme';
import { cn } from '@/lib/utils';
import { GALAXY_DEMO_PROFILES, GALAXY_FILTER_TAGS, matchScore } from '@/lib/galaxyProfiles';
import { socialProfileToGalaxy } from '@/lib/galaxyEconomy';
import ExpandedProfile from './ExpandedProfile';
import GalaxyProfileRow from './GalaxyProfileRow';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';
import { GlassSection } from '@/components/layout/PageShell';

export default function GalaxyExplorer({
  userFinancialProfile,
  currentUserId,
  onStatsChange,
}) {
  const [searchText, setSearchText] = useState('');
  const [activeTags, setActiveTags] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const { data: publishedSocial = [], isError } = useQuery({
    queryKey: ['galaxyProfiles'],
    queryFn: async () => {
      const all = await base44.entities.SocialProfile.list();
      return all.filter(
        (p) =>
          p.username &&
          p.economy_published &&
          p.privacy_level !== 'ghost' &&
          p.economy_snapshot?.items?.length,
      );
    },
  });

  const allProfiles = useMemo(() => {
    const fromUsers = publishedSocial
      .map((p) => socialProfileToGalaxy(p, currentUserId))
      .filter(Boolean);
    const demo = GALAXY_DEMO_PROFILES.map((p) => ({ ...p, isDemo: true }));
    return [...fromUsers, ...demo];
  }, [publishedSocial, currentUserId]);

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return allProfiles
      .filter((p) => {
        const textMatch =
          !q ||
          p.username?.toLowerCase().includes(q) ||
          p.display_name?.toLowerCase().includes(q) ||
          p.occupation?.toLowerCase().includes(q) ||
          p.bio?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q));
        const tagMatch = activeTags.length === 0 || activeTags.some((t) => p.tags?.includes(t));
        return textMatch && tagMatch;
      })
      .map((p) => ({ ...p, _match: matchScore(userFinancialProfile, p) }))
      .sort((a, b) => {
        if (a.isOwn && !b.isOwn) return -1;
        if (!a.isOwn && b.isOwn) return 1;
        return b._match - a._match;
      });
  }, [allProfiles, searchText, activeTags, userFinancialProfile]);

  const ownPublished = filtered.filter((p) => p.isOwn);
  const suggested = filtered.filter((p) => !p.isOwn && p._match > 0).slice(0, 3);
  const rest = filtered.filter((p) => !p.isOwn && !suggested.find((s) => s.id === p.id));

  const rowSubtitle = (p) =>
    [p.occupation, p.age ? `${p.age} år` : null, p.city].filter(Boolean).join(' · ');

  const userCount = publishedSocial.length;
  const exampleCount = GALAXY_DEMO_PROFILES.length;
  const hasIncome = (userFinancialProfile?.income || 0) > 0;

  React.useEffect(() => {
    onStatsChange?.({ publishedCount: userCount, exampleCount });
  }, [userCount, exampleCount, onStatsChange]);

  const clearFilters = () => {
    setSearchText('');
    setActiveTags([]);
  };

  const listProfiles = (list, showMatch = false) =>
    list.map((p, i) => (
      <React.Fragment key={p.id}>
        {i > 0 && <DashboardDivider />}
        <GalaxyProfileRow
          profile={p}
          subtitle={rowSubtitle(p)}
          onOpen={setSelectedProfile}
          matchScore={p._match}
          showMatch={showMatch}
        />
      </React.Fragment>
    ));

  if (isError) {
    return (
      <div className="text-center py-10 text-sm text-[var(--color-text-muted)]">
        Kunde inte ladda Galaxy just nu. Kontrollera din anslutning och ladda om sidan.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GlassSection>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Sök yrke, stad eller @namn"
            className={`${anchorInputClass} pl-10`}
          />
          {searchText && (
            <AnchorPressable
              type="button"
              minTouch={false}
              onClick={() => setSearchText('')}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-text-muted)]"
              aria-label="Rensa sökning"
            >
              <X className="w-4 h-4" />
            </AnchorPressable>
          )}
        </div>

        <div className="flex gap-2 flex-wrap items-center mt-4">
          {GALAXY_FILTER_TAGS.map((tag) => {
            const active = activeTags.includes(tag);
            return (
              <AnchorPressable
                key={tag}
                type="button"
                minTouch={false}
                onClick={() =>
                  setActiveTags((prev) =>
                    prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
                  )
                }
                className={cn(
                  'px-3 py-2 min-h-10 rounded-full text-[13px] font-medium',
                  active
                    ? 'bg-[var(--color-text-primary)] text-white anchor-elev-1'
                    : 'bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)] ring-1 ring-[var(--color-border)]',
                )}
              >
                {tag}
              </AnchorPressable>
            );
          })}
          {(activeTags.length > 0 || searchText) && (
            <AnchorPressable
              type="button"
              minTouch={false}
              onClick={clearFilters}
              className="text-[13px] font-medium text-[var(--color-text-muted)] px-2 min-h-10"
            >
              Rensa
            </AnchorPressable>
          )}
        </div>
      </GlassSection>

      {ownPublished.length > 0 && (
        <DashboardSection nested title="Din publicering">
          {listProfiles(ownPublished)}
        </DashboardSection>
      )}

      {suggested.length > 0 && hasIncome && (
        <DashboardSection nested title="Liknar din situation">
          <p className={`${sectionSubtitleClass} -mt-2 mb-2`}>
            Matchar din inkomst och profil — bra startpunkt.
          </p>
          {listProfiles(suggested, true)}
        </DashboardSection>
      )}

      {!hasIncome && filtered.some((p) => !p.isOwn && p._match > 0) && (
        <p className={sectionMetaClass}>
          Tips: fyll i inkomst under inställningar för att se kronbelopp och kopiera budgeter.
        </p>
      )}

      <DashboardSection
        nested
        title={suggested.length || ownPublished.length ? 'Fler profiler' : `${filtered.length} profiler`}
      >
        {(rest.length ? rest : filtered.filter((p) => !p.isOwn)).length === 0 ? (
          <div className="py-10 text-center rounded-[var(--anchor-radius-lg)] anchor-elev-1 bg-[var(--color-surface-raised)] shadow-[var(--anchor-shadow-1)]">
            <Users className="w-8 h-8 mx-auto text-[var(--color-text-muted)] mb-3" />
            <p className="text-[15px] font-medium text-[var(--color-text-primary)]">Inga träffar</p>
            <p className={sectionSubtitleClass}>
              {userCount === 0
                ? 'Ingen har publicerat än — bli först, eller prova exempelprofilerna.'
                : 'Prova ett annat filter eller sökord.'}
            </p>
            {(activeTags.length > 0 || searchText) && (
              <AnchorPressable
                type="button"
                minTouch={false}
                onClick={clearFilters}
                className="mt-3 text-[14px] font-semibold text-[var(--color-accent)] min-h-11 px-3"
              >
                Rensa filter
              </AnchorPressable>
            )}
          </div>
        ) : (
          listProfiles(rest.length ? rest : filtered.filter((p) => !p.isOwn))
        )}
      </DashboardSection>

      {selectedProfile && (
        <ExpandedProfile
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          userFinancialProfile={userFinancialProfile}
          matchScore={selectedProfile._match}
        />
      )}
    </div>
  );
}
