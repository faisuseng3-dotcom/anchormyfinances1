// @ts-nocheck
import React from 'react';
import { motion } from 'framer-motion';
import ProfileAvatar from './ProfileAvatar';
import { Eye, BarChart2, Ghost, X } from 'lucide-react';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';

const PRIVACY_ICONS = {
  full: { Icon: Eye, className: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/25', label: 'Full' },
  hybrid: { Icon: BarChart2, className: 'bg-[var(--color-accent)]/15 text-[var(--color-accent)] ring-[var(--color-accent)]/25', label: 'Hybrid' },
  ghost: { Icon: Ghost, className: 'bg-white/10 text-white/55 ring-white/15', label: 'Ghost' },
};

export default function SocialFriendCard({ friend, onRemove, index = 0 }) {
  const privacy = PRIVACY_ICONS[friend.privacy_level || 'ghost'];
  const Ic = privacy.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 p-3 min-h-[4.5rem] rounded-[var(--anchor-radius-lg)] anchor-elev-1 bg-[var(--color-surface-raised)] ring-1 ring-white/[0.08]"
    >
      <ProfileAvatar profile={friend} size={48} />

      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-white truncate">
          @{friend.username || 'anonym'}
        </p>
        {friend.bio && (
          <p className="anchor-type-body-sm truncate mt-0.5">{friend.bio}</p>
        )}
      </div>

      <div className={`flex items-center gap-1 px-2 py-1 rounded-full flex-shrink-0 ring-1 ${privacy.className}`}>
        <Ic className="w-3 h-3" />
        <span className="text-[10px] font-bold">{privacy.label}</span>
      </div>

      {onRemove && (
        <AnchorPressable
          type="button"
          minTouch={false}
          onClick={() => onRemove(friend)}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-rose-500/10 text-rose-300"
          aria-label="Ta bort vän"
        >
          <X className="w-4 h-4" />
        </AnchorPressable>
      )}
    </motion.div>
  );
}
