import React, { useMemo, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { DashboardDivider, DashboardListRow, DashboardSection } from '@/components/dashboard/DashboardChrome';
import { sectionMetaClass, sectionSubtitleClass } from '@/lib/anchorTheme';
import { cn } from '@/lib/utils';
import { GALAXY_DEMO_PROFILES, GALAXY_FILTER_TAGS, matchScore } from '@/lib/galaxyProfiles';
import { socialProfileToGalaxy } from '@/lib/galaxyEconomy';
import ExpandedProfile from './ExpandedProfile';
import { AvatarSVG } from './avatar/PBREngine';

function ProfileRow({ profile, subtitle, onOpen, badge }) {
  const accent = profile.avatar_config?.bg || '#7FA0FF';

  return (
    <button type="button" onClick={() => onOpen(profile)} className="w-full text-left">
      <DashboardListRow
        leading={
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: `${accent}22`, border: `1px solid ${accent}44` }}
          >
            <AvatarSVG config={profile.avatar_config} size={40} />
          </div>
        }
        title={badge ? `${profile.display_name} (${badge})` : profile.display_name}
        subtitle={subtitle}
        trailing={profile.highlight || `${profile.savings_rate || 0} % sparar`}
        trailingClassName="text-[13px] font-medium text-white/70 tabular-nums text-right max-w-[42%] truncate"
      />
    </button>
  );
}

export default function GalaxyExplorer({ userFinancialProfile, currentUserId }) {
  const [searchText, setSearchText] = useState('');
  const [activeTags, setActiveTags] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const { data: publishedSocial = [] } = useQuery({
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
  const rest = filtered.filter(
    (p) => !p.isOwn && !suggested.find((s) => s.id === p.id),
  );

  const rowSubtitle = (p) =>
    [p.occupation, p.age ? `${p.age} år` : null, p.city, p.isDemo ? 'Exempel' : null]
      .filter(Boolean)
      .join(' · ');

  const userCount = publishedSocial.length;

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35" />
        <input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Sök yrke, stad eller @namn"
          className="w-full rounded-xl pl-10 pr-4 py-3 text-[15px] outline-none bg-white/[0.08] border border-white/10 text-white placeholder:text-white/35"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {GALAXY_FILTER_TAGS.map((tag) => {
          const active = activeTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() =>
                setActiveTags((prev) =>
                  prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
                )
              }
              className={cn(
                'px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors',
                active
                  ? 'bg-white text-[#0a1628]'
                  : 'bg-white/[0.06] text-white/55 border border-white/10',
              )}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {userCount > 0 && (
        <p className={sectionMetaClass}>
          {userCount} {userCount === 1 ? 'person har' : 'personer har'} publicerat sin ekonomi
        </p>
      )}

      {ownPublished.length > 0 && (
        <DashboardSection nested title="Din publicering">
          {ownPublished.map((p, i) => (
            <React.Fragment key={p.id}>
              {i > 0 && <DashboardDivider />}
              <ProfileRow
                profile={p}
                subtitle={rowSubtitle(p)}
                onOpen={setSelectedProfile}
                badge="du"
              />
            </React.Fragment>
          ))}
        </DashboardSection>
      )}

      {suggested.length > 0 && userFinancialProfile?.income > 0 && (
        <DashboardSection nested title="Liknar din situation">
          <p className={`${sectionSubtitleClass} -mt-2 mb-2`}>
            Baserat på inkomst och profil — börja här.
          </p>
          {suggested.map((p, i) => (
            <React.Fragment key={p.id}>
              {i > 0 && <DashboardDivider />}
              <ProfileRow profile={p} subtitle={rowSubtitle(p)} onOpen={setSelectedProfile} />
            </React.Fragment>
          ))}
        </DashboardSection>
      )}

      <DashboardSection
        nested
        title={
          suggested.length || ownPublished.length
            ? 'Fler profiler'
            : `${filtered.length} profiler`
        }
      >
        {(rest.length ? rest : filtered.filter((p) => !p.isOwn)).length === 0 ? (
          <div className="py-10 text-center">
            <Users className="w-8 h-8 mx-auto text-white/25 mb-3" />
            <p className="text-[15px] font-medium text-white">Inga träffar</p>
            <p className={sectionSubtitleClass}>
              {userCount === 0
                ? 'Ingen har publicerat än — bli först, eller prova exempelprofilerna.'
                : 'Prova ett annat filter eller sökord.'}
            </p>
          </div>
        ) : (
          (rest.length ? rest : filtered.filter((p) => !p.isOwn)).map((p, i) => (
            <React.Fragment key={p.id}>
              {i > 0 && <DashboardDivider />}
              <ProfileRow profile={p} subtitle={rowSubtitle(p)} onOpen={setSelectedProfile} />
            </React.Fragment>
          ))
        )}
      </DashboardSection>

      <p className={`${sectionMetaClass} text-center`}>
        Exempelprofiler är illustrationer. Publicerade profiler visar det användaren valt att dela.
      </p>

      {selectedProfile && (
        <ExpandedProfile
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          userFinancialProfile={userFinancialProfile}
        />
      )}
    </div>
  );
}
