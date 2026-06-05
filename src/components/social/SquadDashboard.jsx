import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileAvatar from './ProfileAvatar';
import SquadMemberRow from './SquadMemberRow';
import NudgeToast from './NudgeToast';
import { Users, Calendar, ChevronDown, Filter, Copy } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  { id: 'all',           label: 'Allt' },
  { id: 'food',          label: 'Mat' },
  { id: 'entertainment', label: 'Nöje' },
  { id: 'transport',     label: 'Transport' },
  { id: 'health',        label: 'Hälsa' },
  { id: 'shopping',      label: 'Shopping' },
  { id: 'savings',       label: 'Sparande' },
];

export default function SquadDashboard({ squad, memberProfiles, myProfile, myFinancialProfile }) {
  const [nudge, setNudge] = useState(null);
  const [filterCat, setFilterCat] = useState('all');
  const [showFilter, setShowFilter] = useState(false);

  const goalAmount = squad.goal_amount || 0;
  const deadline = squad.deadline ? new Date(squad.deadline) : null;
  const daysLeft = deadline ? Math.ceil((deadline - new Date()) / 86400000) : null;

  // Build enriched member list: merge SocialProfile with a simulated savings_amount
  const enrichedMembers = useMemo(() => {
    return memberProfiles.map(mp => {
      // In a real system you'd fetch each member's SavingsDeposit. We simulate here.
      const seed = mp.username?.charCodeAt(0) || 65;
      const savings_amount = Math.round((seed / 90) * goalAmount * 0.6);
      return { ...mp, savings_amount };
    });
  }, [memberProfiles, goalAmount]);

  // Aggregate total group savings
  const totalSaved = useMemo(() => enrichedMembers.reduce((s, m) => s + (m.savings_amount || 0), 0), [enrichedMembers]);
  const groupPct = goalAmount > 0 ? Math.min(100, (totalSaved / goalAmount) * 100) : 0;

  const handlePepp = (member) => {
    setNudge({ type: 'pepp', message: `Du gav @${member.username || 'vännen'} en high-five! 👏` });
  };
  const handleDram = (member) => {
    setNudge({ type: 'dram', message: `@${member.username || 'vännen'} är påmind om målet! 💪` });
  };

  return (
    <div className="space-y-4">
      <NudgeToast nudge={nudge} onDismiss={() => setNudge(null)} />

      {/* Squad hero card */}
      <div className="rounded-3xl p-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(13,115,119,0.15) 0%, rgba(75,124,243,0.1) 100%)', border: '1px solid rgba(13,115,119,0.25)' }}>
        {/* Title */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{squad.emoji || '🚀'}</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-black" style={{ color: 'var(--color-text-primary)' }}>{squad.name}</h3>
            {squad.description && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{squad.description}</p>}
          </div>
        </div>

        {squad.invite_code && (
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(squad.invite_code);
              toast.success('Inbjudningskod kopierad');
            }}
            className="w-full flex items-center justify-center gap-2 mb-4 py-2.5 rounded-xl text-xs font-bold"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-accent)' }}
          >
            <Copy className="w-3.5 h-3.5" />
            Bjud in: {squad.invite_code}
          </button>
        )}

        {/* Big progress */}
        <div className="mb-2">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-2xl font-black" style={{ color: 'var(--color-text-primary)' }}>
              {Math.round(groupPct)}%
            </span>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {totalSaved.toLocaleString('sv-SE')} / {goalAmount.toLocaleString('sv-SE')} kr
            </span>
          </div>
          <div className="relative h-5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${groupPct}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: 'linear-gradient(90deg, #0D7377, #0FDEBD)' }}
            />
            {/* Member avatars on bar */}
            {enrichedMembers.map((m, i) => {
              const mPct = goalAmount > 0 ? Math.min(98, ((m.savings_amount || 0) / goalAmount) * 100) : 0;
              return (
                <div key={m.id} className="absolute top-0 -translate-y-1/4"
                  style={{ left: `${Math.max(0, mPct - 3)}%`, zIndex: enrichedMembers.length - i }}>
                  <ProfileAvatar profile={m} size={20} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{enrichedMembers.length} medlemmar</span>
          </div>
          {daysLeft !== null && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" style={{ color: daysLeft < 30 ? '#E53E3E' : 'var(--color-text-muted)' }} />
              <span className="text-xs" style={{ color: daysLeft < 30 ? '#E53E3E' : 'var(--color-text-muted)' }}>
                {daysLeft > 0 ? `${daysLeft} dagar kvar` : 'Deadline passerad'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Category filter */}
      <div>
        <button onClick={() => setShowFilter(v => !v)}
          className="flex items-center gap-2 text-xs font-bold mb-2"
          style={{ color: 'var(--color-text-muted)' }}>
          <Filter className="w-3.5 h-3.5" /> Filtrera kategori
          <ChevronDown className="w-3.5 h-3.5" style={{ transform: showFilter ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
        </button>
        <AnimatePresence>
          {showFilter && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <div className="flex flex-wrap gap-2 pb-2">
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => setFilterCat(c.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: filterCat === c.id ? 'var(--color-accent)' : 'var(--color-surface)',
                      color: filterCat === c.id ? 'white' : 'var(--color-text-muted)',
                    }}>
                    {c.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Members */}
      <div className="rounded-2xl p-4 space-y-4" style={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Medlemmar</p>
        {enrichedMembers.map((m) => (
          <SquadMemberRow
            key={m.id}
            member={m}
            goalAmount={goalAmount}
            isMe={m.user_id === myProfile?.user_id}
            onPepp={handlePepp}
            onDram={handleDram}
          />
        ))}
        {enrichedMembers.length === 0 && (
          <p className="text-xs text-center py-4" style={{ color: 'var(--color-text-muted)' }}>Bjud in vänner till squaden!</p>
        )}
      </div>
    </div>
  );
}