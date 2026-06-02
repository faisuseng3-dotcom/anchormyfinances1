import React from 'react';
import { motion } from 'framer-motion';
import ProfileAvatar from './ProfileAvatar';
import { Eye, BarChart2, Ghost, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRIVACY_ICONS = {
  full: { Icon: Eye, color: '#34D399', label: 'Full' },
  hybrid: { Icon: BarChart2, color: '#9FB5FF', label: 'Hybrid' },
  ghost: { Icon: Ghost, color: '#94A3B8', label: 'Ghost' },
};

export default function SocialFriendCard({ friend, onRemove, index = 0 }) {
  const privacy = PRIVACY_ICONS[friend.privacy_level || 'ghost'];
  const Ic = privacy.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 p-3 rounded-2xl border border-white/[0.08] bg-white/[0.03]"
    >
      <ProfileAvatar profile={friend} size={48} />

      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-white truncate">
          @{friend.username || 'anonym'}
        </p>
        {friend.bio && (
          <p className="text-[13px] text-white/45 truncate mt-0.5">{friend.bio}</p>
        )}
      </div>

      <div
        className="flex items-center gap-1 px-2 py-1 rounded-full flex-shrink-0"
        style={{ background: `${privacy.color}15`, border: `1px solid ${privacy.color}30` }}
      >
        <Ic className="w-3 h-3" style={{ color: privacy.color }} />
        <span className="text-[10px] font-bold" style={{ color: privacy.color }}>
          {privacy.label}
        </span>
      </div>

      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(friend)}
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
            'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition-colors',
          )}
          aria-label="Ta bort vän"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}
