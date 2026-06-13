// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, Users, Shield, User, Check, Copy } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import PageShell, { GlassSection } from '@/components/layout/PageShell';
import { createPageUrl } from '@/utils';
import ProfilePhotoUpload from '@/components/social/ProfilePhotoUpload';
import ProfileAvatar from '@/components/social/ProfileAvatar';
import PrivacyMatrix from '@/components/social/PrivacyMatrix';
import SocialFriendCard from '@/components/social/SocialFriendCard';
import SocialPrivacySummary from '@/components/social/SocialPrivacySummary';
import SocialSquadsLink from '@/components/social/SocialSquadsLink';
import SegmentTabs from '@/components/ui/SegmentTabs';
import { useSocialProfile } from '@/hooks/useSocialProfile';
import {
  anchorInputClass,
  anchorIconButtonClass,
  sectionMetaClass,
  sectionSubtitleClass,
} from '@/lib/anchorTheme';
import { pageEnter } from '@/lib/motionPresets';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';
import PageShellSkeleton from '@/components/loading/PageShellSkeleton';

const TABS = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'friends', label: 'Vänner', icon: Users },
  { id: 'privacy', label: 'Integritet', icon: Shield },
];

const EMPTY_FORM = {
  username: '',
  display_name: '',
  city: '',
  bio: '',
  occupation: '',
  age: '',
  interests: [],
  profile_photo_url: null,
  privacy_level: 'hybrid',
  shared_categories: [],
  friends: [],
};

function profileToForm(profile) {
  if (!profile) return { ...EMPTY_FORM };
  return { ...EMPTY_FORM, ...profile, age: profile.age ?? '' };
}

export default function Social() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    TABS.some((t) => t.id === tabParam) ? tabParam : 'profile',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const { socialProfile, isLoading, saveSocialProfile } = useSocialProfile();
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (socialProfile) setForm(profileToForm(socialProfile));
  }, [socialProfile?.id]);

  useEffect(() => {
    if (tabParam && TABS.some((t) => t.id === tabParam)) setActiveTab(tabParam);
  }, [tabParam]);

  const setTab = (id) => {
    setActiveTab(id);
    setSearchParams(id === 'profile' ? {} : { tab: id }, { replace: true });
  };

  const saveMutation = useMutation({
    mutationFn: async (data) => saveSocialProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendProfiles'] });
      setSaving(false);
    },
    onError: () => {
      setSaving(false);
      toast.error('Kunde inte spara. Försök igen.');
    },
  });

  const handleSave = () => {
    if (!form.username?.trim()) {
      toast.error('Användarnamn krävs');
      setTab('profile');
      return;
    }
    setSaving(true);
    saveMutation.mutate(form, { onSuccess: () => toast.success('Profil sparad') });
  };

  const savePrivacy = useCallback(
    (patch) => {
      const next = { ...form, ...patch };
      setForm(next);
      setSaving(true);
      saveMutation.mutate(next);
    },
    [form, saveMutation],
  );

  const handlePhotoChange = (url) => {
    const next = { ...form, profile_photo_url: url || null };
    setForm(next);
    setSaving(true);
    saveMutation.mutate(next);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResult(null);
    try {
      const results = await base44.entities.SocialProfile.filter({
        username: searchQuery.trim().replace('@', ''),
      });
      setSearchResult(results[0] || 'not_found');
    } finally {
      setSearching(false);
    }
  };

  const addFriend = (friendProfile) => {
    if (!friendProfile?.user_id) return;
    const updatedFriends = [...new Set([...(form.friends || []), friendProfile.user_id])];
    const next = { ...form, friends: updatedFriends };
    setForm(next);
    saveMutation.mutate(next);
    setSearchResult(null);
    setSearchQuery('');
    toast.success(`@${friendProfile.username} tillagd`);
  };

  const removeFriend = (friendProfile) => {
    const updatedFriends = (form.friends || []).filter((id) => id !== friendProfile.user_id);
    const next = { ...form, friends: updatedFriends };
    setForm(next);
    saveMutation.mutate(next);
  };

  const { data: friendProfiles = [] } = useQuery({
    queryKey: ['friendProfiles', form.friends],
    queryFn: async () => {
      if (!form.friends?.length) return [];
      const results = await Promise.all(
        form.friends.map((uid) =>
          base44.entities.SocialProfile.filter({ user_id: uid }).then((r) => r[0]),
        ),
      );
      return results.filter(Boolean);
    },
    enabled: (form.friends?.length || 0) > 0,
  });

  const copyUsername = () => {
    if (!form.username) return;
    navigator.clipboard.writeText(`@${form.username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Användarnamn kopierat');
  };

  if (isLoading) {
    return <PageShellSkeleton sections={3} />;
  }

  return (
    <PageShell
      title="Vänner"
      subtitle="Profil, vänner och integritet"
      backHref={createPageUrl('Dashboard')}
      action={
        <AnchorPressable
          type="button"
          minTouch={false}
          onClick={handleSave}
          disabled={saving}
          className="h-10 px-4 rounded-full bg-[var(--color-text-primary)] text-[#050d28] text-[14px] font-semibold disabled:opacity-40 anchor-elev-2"
        >
          {saving ? <span className="w-4 h-4 rounded-full skeleton inline-block" /> : 'Spara'}
        </AnchorPressable>
      }
      className="!pb-28"
    >
      <SocialSquadsLink />

      <SegmentTabs value={activeTab} onChange={setTab} tabs={TABS} className="-mt-1 mb-4" />

      <AnimatePresence mode="wait">
        {activeTab === 'profile' && (
          <motion.div key="profile" {...pageEnter} className="space-y-4">
            <GlassSection>
              <div className="flex items-center gap-4 mb-5">
                <ProfilePhotoUpload
                  profile={form}
                  size={64}
                  onPhotoChange={handlePhotoChange}
                  disabled={saving}
                />
                <div className="flex-1 min-w-0">
                  <p className="anchor-type-headline truncate">
                    {form.username ? `@${form.username}` : 'Sätt ett användarnamn'}
                  </p>
                  {form.display_name && (
                    <p className={sectionSubtitleClass}>{form.display_name}</p>
                  )}
                  <p className={`${sectionMetaClass} mt-1`}>
                    Tryck på kameran för att byta profilbild
                  </p>
                </div>
                <AnchorPressable
                  type="button"
                  onClick={copyUsername}
                  disabled={!form.username}
                  className={`${anchorIconButtonClass} anchor-elev-1`}
                  aria-label="Kopiera användarnamn"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-300" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </AnchorPressable>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className={sectionMetaClass}>Användarnamn</span>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-white/40">@</span>
                    <input
                      value={form.username}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          username: e.target.value.replace(/\s/g, '').toLowerCase(),
                        }))
                      }
                      placeholder="ankare123"
                      className={`${anchorInputClass} pl-8`}
                    />
                  </div>
                </label>
                <label className="block">
                  <span className={sectionMetaClass}>Visningsnamn</span>
                  <input
                    value={form.display_name}
                    onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
                    placeholder="t.ex. Alex"
                    className={`${anchorInputClass} mt-1.5`}
                  />
                </label>
                <label className="block">
                  <span className={sectionMetaClass}>Bio</span>
                  <input
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                    placeholder="Vad håller du på med just nu?"
                    className={`${anchorInputClass} mt-1.5`}
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className={sectionMetaClass}>Yrke / studier</span>
                    <input
                      value={form.occupation}
                      onChange={(e) => setForm((f) => ({ ...f, occupation: e.target.value }))}
                      placeholder="Student"
                      className={`${anchorInputClass} mt-1.5`}
                    />
                  </label>
                  <label className="block">
                    <span className={sectionMetaClass}>Ålder</span>
                    <input
                      type="number"
                      value={form.age}
                      onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                      placeholder="25"
                      className={`${anchorInputClass} mt-1.5`}
                    />
                  </label>
                </div>
                <label className="block">
                  <span className={sectionMetaClass}>Stad</span>
                  <input
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    placeholder="Stockholm"
                    className={`${anchorInputClass} mt-1.5`}
                  />
                </label>
              </div>
            </GlassSection>

            <p className={sectionMetaClass}>
              Yrke och stad används i Jämför för att matcha dig med liknande profiler.
            </p>
          </motion.div>
        )}

        {activeTab === 'friends' && (
          <motion.div key="friends" {...pageEnter} className="space-y-4">
            <GlassSection title="Hitta vänner">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="@användarnamn"
                    className={`${anchorInputClass} pl-10`}
                  />
                </div>
                <AnchorPressable
                  type="button"
                  minTouch={false}
                  onClick={handleSearch}
                  disabled={searching}
                  className="h-12 px-4 rounded-full bg-[var(--color-text-primary)] text-[#050d28] font-semibold shrink-0 anchor-elev-1"
                >
                  {searching ? <span className="w-4 h-4 rounded-full skeleton" /> : 'Sök'}
                </AnchorPressable>
              </div>

              {searchResult === 'not_found' && (
                <p className={`${sectionSubtitleClass} mt-3 text-center`}>Ingen användare hittades</p>
              )}
              {searchResult && searchResult !== 'not_found' && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center gap-3 p-3 rounded-[var(--anchor-radius-lg)] bg-[var(--color-accent)]/10 ring-1 ring-[var(--color-accent)]/25 anchor-elev-1"
                >
                  <ProfileAvatar profile={searchResult} size={48} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-white">@{searchResult.username}</p>
                    {searchResult.bio && <p className={sectionSubtitleClass}>{searchResult.bio}</p>}
                  </div>
                  <AnchorPressable
                    type="button"
                    minTouch={false}
                    onClick={() => addFriend(searchResult)}
                    className="h-10 px-3 rounded-full bg-[var(--color-text-primary)] text-[#050d28] text-[13px] font-semibold flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Lägg till
                  </AnchorPressable>
                </motion.div>
              )}
            </GlassSection>

            <div>
              <p className={sectionMetaClass}>Dina vänner ({friendProfiles.length})</p>
              {friendProfiles.length === 0 ? (
                <div className="py-10 text-center rounded-[var(--anchor-radius-lg)] anchor-elev-1 bg-[var(--color-surface-raised)] shadow-[var(--anchor-shadow-1)] mt-2">
                  <Users className="w-8 h-8 mx-auto text-white/25 mb-2" />
                  <p className="text-[15px] font-medium text-white">Inga vänner ännu</p>
                  <p className={sectionSubtitleClass}>Sök på @användarnamn för att lägga till någon</p>
                </div>
              ) : (
                <div className="space-y-2 mt-2">
                  {friendProfiles.map((fp, i) => (
                    <SocialFriendCard key={fp.id} friend={fp} index={i} onRemove={removeFriend} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'privacy' && (
          <motion.div key="privacy" {...pageEnter} className="space-y-4">
            <SocialPrivacySummary
              privacyLevel={form.privacy_level}
              isPublished={Boolean(socialProfile?.economy_published)}
              username={form.username}
            />

            <GlassSection title="Integritetsinställningar">
              <PrivacyMatrix
                privacyLevel={form.privacy_level}
                sharedCategories={form.shared_categories}
                onPrivacyChange={(level) => {
                  savePrivacy({
                    privacy_level: level,
                    ...(level === 'ghost' ? { economy_published: false } : {}),
                  });
                  if (level === 'ghost') toast.message('Ghost-läge — ekonomi dold i Jämför');
                }}
                onCategoriesChange={(cats) => savePrivacy({ shared_categories: cats })}
              />
            </GlassSection>

            {form.privacy_level === 'ghost' && socialProfile?.economy_published && (
              <p className="text-[14px] text-amber-200/90 leading-relaxed rounded-[var(--anchor-radius-lg)] px-4 py-3 ring-1 ring-amber-400/20 bg-amber-400/10 anchor-elev-1">
                Ghost-läge avpublicerade din ekonomi i Jämför automatiskt.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}

export const pageSeo = pageSeoFor('Social');
