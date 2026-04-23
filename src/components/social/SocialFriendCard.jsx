import React from 'react';
import { motion } from 'framer-motion';
import { AvatarSVG } from './avatar/PBREngine';
import { Eye, BarChart2, Ghost, UserCheck } from 'lucide-react';

const PRIVACY_ICONS = {
  full:   { Icon: Eye,       color: '#0FDEBD', label: 'Full' },
  hybrid: { Icon: BarChart2, color: '#A78BFA', label: 'Hybrid' },
  ghost:  { Icon: Ghost,     color: '#9AA5B4', label: 'Ghost' },
};

export default function SocialFriendCard({ friend, onRemove, index = 0 }) {
  const privacy = PRIVACY_ICONS[friend.privacy_level || 'ghost'];
  const Ic = privacy.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-center gap-3 p-3 rounded-2xl"
      style={{ background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: `${friend.avatar_style?.bg || '#0D7377'}20` }}>
        <AvatarSVG config={friend.avatar_config || friend.avatar_style} size={44} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
            {friend.username || 'Anonym'}
          </p>
          <UserCheck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#0D7377' }} />
        </div>
        {friend.bio && (
          <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{friend.bio}</p>
        )}
      </div>

      {/* Privacy indicator */}
      <div className="flex items-center gap-1 px-2 py-1 rounded-full"
        style={{ background: `${privacy.color}15`, border: `1px solid ${privacy.color}35` }}>
        <Ic className="w-3 h-3" style={{ color: privacy.color }} />
        <span className="text-[10px] font-bold" style={{ color: privacy.color }}>{privacy.label}</span>
      </div>

      {onRemove && (
        <button onClick={() => onRemove(friend)} className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(217,95,95,0.12)', color: '#E53E3E' }}>
          <span className="text-xs font-bold">✕</span>
        </button>
      )}
    </motion.div>
  );
}