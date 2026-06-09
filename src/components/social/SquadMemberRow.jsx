import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileAvatar from './ProfileAvatar';
import { Eye, BarChart2, Ghost, HandHeart, Briefcase, Cake, Wallet } from 'lucide-react';
import { StreakIcon } from '@/lib/anchorIcons';

const PRIVACY = {
  full:   { label: 'Full', color: '#0FDEBD', Icon: Eye },
  hybrid: { label: 'Hybrid', color: '#A78BFA', Icon: BarChart2 },
  ghost:  { label: 'Ghost', color: '#9AA5B4', Icon: Ghost },
};

// Position the avatar along a progress bar based on their savings %
export default function SquadMemberRow({ member, goalAmount, isMe, onPepp, onDram }) {
  const [peek, setPeek] = useState(false);
  const privacy = member.privacy_level || 'ghost';
  const pInfo = PRIVACY[privacy];
  const PIcon = pInfo.Icon;

  // Calculate member progress
  const saved = member.savings_amount || 0;
  const memberGoal = goalAmount / Math.max(1, 1); // per-member share, simplified to full goal
  const pct = goalAmount > 0 ? Math.min(100, (saved / goalAmount) * 100) : 0;

  const showKr = privacy === 'full';
  const showPct = privacy === 'full' || privacy === 'hybrid';

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        {/* Avatar */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => privacy !== 'ghost' && setPeek(v => !v)}
          className="relative flex-shrink-0"
        >
          <ProfileAvatar profile={member} size={48} />
          {isMe && (
            <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[8px] font-black flex items-center justify-center text-white"
              style={{ background: 'var(--color-accent)' }}>Du</div>
          )}
        </motion.button>

        <div className="flex-1 min-w-0">
          {/* Name + privacy badge */}
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
              {member.username ? `@${member.username}` : 'Anonym'}
            </p>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ background: `${pInfo.color}15`, border: `1px solid ${pInfo.color}35` }}>
              <PIcon className="w-2.5 h-2.5" style={{ color: pInfo.color }} />
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: `linear-gradient(90deg, ${pInfo.color}90, ${pInfo.color})` }}
            />
            {/* Avatar on progress bar */}
            <motion.div
              initial={{ left: '0%' }}
              animate={{ left: `${Math.max(0, pct - 4)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute top-0 -translate-y-1/4"
              style={{ width: 14, height: 14 }}
            >
              <ProfileAvatar profile={member} size={14} />
            </motion.div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2 mt-1">
            {showPct && (
              <span className="text-xs font-bold" style={{ color: pInfo.color }}>{Math.round(pct)}%</span>
            )}
            {showKr && (
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {saved.toLocaleString('sv-SE')} kr
              </span>
            )}
            {privacy === 'ghost' && (
              <span className="text-xs italic" style={{ color: 'var(--color-text-muted)' }}>Aktiv</span>
            )}
          </div>
        </div>

        {/* Nudge buttons (not on own card) */}
        {!isMe && (
          <div className="flex flex-col gap-1 flex-shrink-0">
            <motion.button whileTap={{ scale: 0.88 }} onClick={() => onPepp?.(member)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-base"
              style={{ background: 'rgba(15,222,189,0.12)', border: '1px solid rgba(15,222,189,0.3)' }}
              title="Pepp!">
              <HandHeart className="w-4 h-4 text-[#0FDEBD]" aria-hidden />
            </motion.button>
            <motion.button whileTap={{ scale: 0.88 }} onClick={() => onDram?.(member)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-base"
              style={{ background: 'rgba(246,173,85,0.12)', border: '1px solid rgba(246,173,85,0.3)' }}
              title="Dra på!">
              <StreakIcon variant="fire" size={16} className="text-amber-400" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Profile Peek (if not ghost) */}
      <AnimatePresence>
        {peek && privacy !== 'ghost' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-15 overflow-hidden"
            style={{ marginLeft: 60 }}
          >
            <div className="p-3 rounded-2xl mb-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {member.bio && <p className="text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>"{member.bio}"</p>}
              <div className="flex flex-wrap gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {member.occupation && <span className="inline-flex items-center gap-1"><Briefcase className="w-3 h-3" aria-hidden /> {member.occupation}</span>}
                {member.age && <span className="inline-flex items-center gap-1"><Cake className="w-3 h-3" aria-hidden /> {member.age} år</span>}
                {privacy === 'full' && <span className="inline-flex items-center gap-1"><Wallet className="w-3 h-3" aria-hidden /> {saved.toLocaleString('sv-SE')} kr sparat</span>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}