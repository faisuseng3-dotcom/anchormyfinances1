import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, UserPlus, Users, Shield, User, ChevronRight, Check, Copy, Smile } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AvatarBuilder, { AvatarSVG } from '@/components/social/AvatarBuilder';
import PrivacyMatrix from '@/components/social/PrivacyMatrix';
import SocialFriendCard from '@/components/social/SocialFriendCard';
import { Input } from '@/components/ui/input';

const TABS = [
  { id: 'profile',  label: 'Profil',    Icon: User },
  { id: 'avatar',   label: 'Avatar',    Icon: Smile },
  { id: 'friends',  label: 'Vänner',    Icon: Users },
  { id: 'privacy',  label: 'Integritet',Icon: Shield },
];

export default function Social() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load current user's SocialProfile
  const { data: socialProfile, isLoading } = useQuery({
    queryKey: ['socialProfile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const results = await base44.entities.SocialProfile.filter({ user_id: user.id });
      return results[0] || null;
    }
  });

  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me()
  });

  const [form, setForm] = useState({
    username: '',
    bio: '',
    occupation: '',
    age: '',
    interests: [],
    avatar_style: {},
    avatar_config: null,
    privacy_level: 'hybrid',
    shared_categories: [],
    friends: [],
  });

  useEffect(() => {
    if (socialProfile) setForm({ ...form, ...socialProfile });
  }, [socialProfile]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      if (socialProfile?.id) {
        return base44.entities.SocialProfile.update(socialProfile.id, data);
      } else {
        return base44.entities.SocialProfile.create({ ...data, user_id: user.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialProfile'] });
      setSaving(false);
    }
  });

  const handleSave = () => {
    setSaving(true);
    saveMutation.mutate(form);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResult(null);
    const results = await base44.entities.SocialProfile.filter({ username: searchQuery.trim().replace('@', '') });
    setSearchResult(results[0] || 'not_found');
    setSearching(false);
  };

  const addFriend = async (friendProfile) => {
    if (!friendProfile?.user_id) return;
    const updatedFriends = [...new Set([...(form.friends || []), friendProfile.user_id])];
    setForm(f => ({ ...f, friends: updatedFriends }));
    saveMutation.mutate({ ...form, friends: updatedFriends });
    setSearchResult(null);
    setSearchQuery('');
  };

  const removeFriend = (friendProfile) => {
    const updatedFriends = (form.friends || []).filter(id => id !== friendProfile.user_id);
    setForm(f => ({ ...f, friends: updatedFriends }));
    saveMutation.mutate({ ...form, friends: updatedFriends });
  };

  const { data: friendProfiles = [] } = useQuery({
    queryKey: ['friendProfiles', form.friends],
    queryFn: async () => {
      if (!form.friends?.length) return [];
      const results = await Promise.all(
        form.friends.map(uid => base44.entities.SocialProfile.filter({ user_id: uid }).then(r => r[0]))
      );
      return results.filter(Boolean);
    },
    enabled: (form.friends?.length || 0) > 0
  });

  const copyUsername = () => {
    if (!form.username) return;
    navigator.clipboard.writeText(`@${form.username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-surface)', borderTopColor: 'var(--color-accent)' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: 'var(--color-background-primary)' }}>
      {/* Header */}
      <div className="px-5 pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('Dashboard')}>
            <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
              <ArrowLeft className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
            </button>
          </Link>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Anchor Social</h1>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="px-5 py-2 rounded-full text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: 'var(--color-accent)' }}>
          {saving ? 'Sparar...' : 'Spara'}
        </button>
      </div>

      {/* Squads CTA */}
      <div className="px-5 mb-4">
        <button onClick={() => navigate('/Squads')}
          className="w-full flex items-center justify-between p-4 rounded-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(75,124,243,0.12), rgba(167,139,250,0.12))', border: '1px solid rgba(75,124,243,0.25)' }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚀</span>
            <div className="text-left">
              <p className="text-sm font-black" style={{ color: 'var(--color-text-primary)' }}>Savings Squads</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Spara ihop med vänner mot gemensamma mål</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
        </button>
      </div>

      {/* Tab bar */}
      <div className="px-5 mb-5">
        <div className="flex rounded-2xl p-1" style={{ background: 'var(--color-surface)' }}>
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            const Ic = tab.Icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: active ? 'var(--color-accent)' : 'transparent',
                  color: active ? 'white' : 'var(--color-text-muted)',
                }}>
                <Ic className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 space-y-5">
        <AnimatePresence mode="wait">

          {/* ── TAB: Profil ── */}
          {activeTab === 'profile' && (
            <motion.div key="profile"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-5">

              {/* Avatar preview + username */}
              <div className="rounded-2xl p-5" style={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: `${(form.avatar_config || form.avatar_style)?.bg || '#0D7377'}20`, border: `2px solid ${(form.avatar_config || form.avatar_style)?.bg || '#0D7377'}` }}>
                    <AvatarSVG config={form.avatar_config} style={form.avatar_style} size={56} />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-black" style={{ color: 'var(--color-text-primary)' }}>
                      {form.username ? `@${form.username}` : 'Sätt ett användarnamn'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {currentUser?.full_name || 'Din profil'}
                    </p>
                  </div>
                  <button onClick={copyUsername} disabled={!form.username}
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--color-surface)' }}>
                    {copied ? <Check className="w-4 h-4" style={{ color: '#0D7377' }} /> : <Copy className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />}
                  </button>
                </div>

                {/* Form fields */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Användarnamn</p>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: 'var(--color-text-muted)' }}>@</span>
                      <Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value.replace(/\s/g, '').toLowerCase() }))}
                        placeholder="ankare123" className="pl-7 h-11 rounded-xl text-sm" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Bio / Status</p>
                    <Input value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                      placeholder="Vad håller du på med just nu?" className="h-11 rounded-xl text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Yrke / Studier</p>
                      <Input value={form.occupation} onChange={e => setForm(f => ({ ...f, occupation: e.target.value }))}
                        placeholder="ex. Student, Ingenjör" className="h-11 rounded-xl text-sm" />
                    </div>
                    <div>
                      <p className="text-xs font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Ålder</p>
                      <Input type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                        placeholder="25" className="h-11 rounded-xl text-sm" />
                    </div>
                  </div>
                </div>
              </div>


            </motion.div>
          )}

          {/* ── TAB: Avatar ── */}
          {activeTab === 'avatar' && (
            <motion.div key="avatar"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}>
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                <AvatarBuilder
                  value={form.avatar_config || form.avatar_style}
                  onChange={cfg => setForm(f => ({ ...f, avatar_config: cfg, avatar_style: cfg }))}
                  onSave={handleSave}
                  saved={saveMutation.isSuccess}
                />
              </div>
            </motion.div>
          )}

          {/* ── TAB: Vänner ── */}
          {activeTab === 'friends' && (
            <motion.div key="friends"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4">

              {/* Search */}
              <div className="rounded-2xl p-4" style={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>Hitta vänner</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                    <Input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                      placeholder="@användarnamn"
                      className="pl-9 h-11 rounded-xl text-sm"
                    />
                  </div>
                  <button onClick={handleSearch} disabled={searching}
                    className="px-4 h-11 rounded-xl text-sm font-bold text-white"
                    style={{ background: 'var(--color-accent)' }}>
                    Sök
                  </button>
                </div>

                {/* Search result */}
                {searching && (
                  <div className="mt-3 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>Söker...</div>
                )}
                {searchResult === 'not_found' && (
                  <p className="mt-3 text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>Ingen användare hittades</p>
                )}
                {searchResult && searchResult !== 'not_found' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 flex items-center gap-3 p-3 rounded-2xl"
                    style={{ background: 'var(--color-surface)', border: '1px solid rgba(13,115,119,0.3)' }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `${searchResult.avatar_style?.bg || '#0D7377'}20` }}>
                      <AvatarSVG style={searchResult.avatar_style} size={44} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>@{searchResult.username}</p>
                      {searchResult.bio && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{searchResult.bio}</p>}
                    </div>
                    <button onClick={() => addFriend(searchResult)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                      style={{ background: 'var(--color-accent)' }}>
                      <UserPlus className="w-3.5 h-3.5" /> Adda
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Friends list */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
                  Dina vänner ({friendProfiles.length})
                </p>
                {friendProfiles.length === 0 ? (
                  <div className="py-8 text-center rounded-2xl" style={{ background: 'var(--color-surface)' }}>
                    <Users className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} />
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Inga vänner ännu</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Sök på deras @användarnamn för att adda dem</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {friendProfiles.map((fp, i) => (
                      <SocialFriendCard key={fp.id} friend={fp} index={i} onRemove={removeFriend} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── TAB: Integritet ── */}
          {activeTab === 'privacy' && (
            <motion.div key="privacy"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}>
              <div className="rounded-2xl p-5" style={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--color-text-muted)' }}>Integritetsinställningar</p>
                <PrivacyMatrix
                  privacyLevel={form.privacy_level}
                  sharedCategories={form.shared_categories}
                  onPrivacyChange={level => setForm(f => ({ ...f, privacy_level: level }))}
                  onCategoriesChange={cats => setForm(f => ({ ...f, shared_categories: cats }))}
                />
              </div>

              {/* Privacy summary */}
              <div className="mt-4 p-4 rounded-2xl" style={{ background: 'rgba(13,115,119,0.06)', border: '1px solid rgba(13,115,119,0.2)' }}>
                <p className="text-xs font-bold mb-1" style={{ color: '#0D7377' }}>Vad dina vänner ser</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {form.privacy_level === 'full' && 'Vänner kan se dina faktiska belopp och fördelning för valda kategorier.'}
                  {form.privacy_level === 'hybrid' && 'Vänner ser bara procentuell fördelning — inga kronbelopp visas.'}
                  {form.privacy_level === 'ghost' && 'Vänner ser bara din avatar och framsteg. Ingen ekonomisk information delas.'}
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}