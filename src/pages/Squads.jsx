import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Users, Swords } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SquadDashboard from '@/components/social/SquadDashboard';
import SquadCreateModal from '@/components/social/SquadCreateModal';
import { AvatarSVG } from '@/components/social/AvatarBuilder';

export default function Squads() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [activeSquadId, setActiveSquadId] = useState(null);

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  // Get my social profile
  const { data: myProfile } = useQuery({
    queryKey: ['socialProfile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const results = await base44.entities.SocialProfile.filter({ user_id: user.id });
      return results[0] || null;
    },
  });

  // Get my squads
  const { data: squads = [], isLoading } = useQuery({
    queryKey: ['squads'],
    queryFn: () => base44.entities.Squad.list('-created_date', 50),
  });

  // My squad ids from my profile
  const mySquads = squads.filter(s =>
    s.admin_id === currentUser?.id ||
    (s.member_ids || []).includes(currentUser?.id)
  );

  // Friends profiles for invite
  const { data: friendProfiles = [] } = useQuery({
    queryKey: ['friendProfiles', myProfile?.friends],
    queryFn: async () => {
      if (!myProfile?.friends?.length) return [];
      const results = await Promise.all(
        myProfile.friends.map(uid => base44.entities.SocialProfile.filter({ user_id: uid }).then(r => r[0]))
      );
      return results.filter(Boolean);
    },
    enabled: (myProfile?.friends?.length || 0) > 0,
  });

  const createSquad = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      return base44.entities.Squad.create({
        ...data,
        admin_id: user.id,
        member_ids: [user.id, ...data.member_ids],
        invite_code: inviteCode,
      });
    },
    onSuccess: (squad) => {
      queryClient.invalidateQueries({ queryKey: ['squads'] });
      setShowCreate(false);
      setActiveSquadId(squad.id);
    },
  });

  // Load member profiles for the active squad
  const activeSquad = mySquads.find(s => s.id === activeSquadId);

  const { data: squadMemberProfiles = [] } = useQuery({
    queryKey: ['squadMembers', activeSquadId],
    queryFn: async () => {
      if (!activeSquad?.member_ids?.length) return [];
      const results = await Promise.all(
        activeSquad.member_ids.map(uid => base44.entities.SocialProfile.filter({ user_id: uid }).then(r => r[0]))
      );
      return results.filter(Boolean);
    },
    enabled: !!activeSquad,
  });

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
          {activeSquadId ? (
            <button onClick={() => setActiveSquadId(null)}
              className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
              <ArrowLeft className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
            </button>
          ) : (
            <Link to="/Social">
              <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
                <ArrowLeft className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
              </button>
            </Link>
          )}
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {activeSquad ? activeSquad.name : 'Savings Squads'}
            </h1>
            {activeSquad && (
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Kod: {activeSquad.invite_code}
              </p>
            )}
          </div>
        </div>
        {!activeSquadId && (
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white"
            style={{ background: 'var(--color-accent)' }}>
            <Plus className="w-4 h-4" /> Ny Squad
          </button>
        )}
      </div>

      <div className="px-5">
        <AnimatePresence mode="wait">
          {/* ── Squad dashboard view ── */}
          {activeSquadId && activeSquad ? (
            <motion.div key="squad-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}>
              <SquadDashboard
                squad={activeSquad}
                memberProfiles={squadMemberProfiles}
                myProfile={myProfile}
              />
            </motion.div>
          ) : (
            /* ── Squad list ── */
            <motion.div key="squad-list"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4">

              {mySquads.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16">
                  <div className="text-5xl mb-4">🚀</div>
                  <h3 className="text-lg font-black mb-2" style={{ color: 'var(--color-text-primary)' }}>Inga squads ännu</h3>
                  <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
                    Skapa en squad med vänner och spara ihop mot ett gemensamt mål.
                  </p>
                  <button onClick={() => setShowCreate(true)}
                    className="px-6 py-3 rounded-2xl text-sm font-black text-white"
                    style={{ background: 'var(--color-accent)' }}>
                    Skapa din första Squad
                  </button>
                </motion.div>
              ) : (
                mySquads.map((squad, i) => {
                  const memberCount = (squad.member_ids || []).length;
                  const progress = squad.goal_amount ? Math.min(100, Math.round(Math.random() * 60 + 10)) : 0;
                  return (
                    <motion.button
                      key={squad.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveSquadId(squad.id)}
                      className="w-full text-left rounded-3xl p-5 transition-all"
                      style={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-3xl">{squad.emoji || '🚀'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-black" style={{ color: 'var(--color-text-primary)' }}>{squad.name}</p>
                          {squad.description && <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{squad.description}</p>}
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl" style={{ background: 'var(--color-surface)' }}>
                          <Users className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
                          <span className="text-xs font-bold" style={{ color: 'var(--color-text-muted)' }}>{memberCount}</span>
                        </div>
                      </div>
                      {/* Progress */}
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #0D7377, #0FDEBD)' }} />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{progress}% av målet</span>
                        {squad.goal_amount && (
                          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{squad.goal_amount.toLocaleString('sv-SE')} kr</span>
                        )}
                      </div>
                    </motion.button>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create modal */}
      <SquadCreateModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={data => createSquad.mutate(data)}
        friendProfiles={friendProfiles}
      />
    </div>
  );
}