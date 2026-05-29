import React from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import MinimalAvatar from './avatar/MinimalAvatar';
import { resolveAvatarConfig, profileAccent as accentFromProfile } from './avatar/avatarConfig';

export { accentFromProfile as profileAccent };

function initialsFrom(profile, name, username) {
  const raw = (profile?.display_name || name || profile?.username || username || '')
    .replace('@', '')
    .trim();
  if (!raw) return null;
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase();
  return parts[0][0].toUpperCase();
}

/** Profilbild — minimal 2D avatar om sparad, annars initialer. */
export default function ProfileAvatar({
  profile,
  name,
  username,
  size = 48,
  className,
  style,
}) {
  const config = resolveAvatarConfig(profile);

  if (config) {
    return (
      <MinimalAvatar
        config={config}
        size={size}
        className={cn('rounded-full', className)}
        style={style}
      />
    );
  }

  const accent = accentFromProfile(profile || { username, display_name: name });
  const initials = initialsFrom(profile, name, username);
  const showText = size >= 28 && initials;
  const iconSize = Math.max(10, Math.round(size * 0.42));
  const fontSize = Math.max(10, Math.round(size * 0.34));

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center flex-shrink-0 font-bold select-none',
        className,
      )}
      style={{
        width: size,
        height: size,
        background: `${accent}22`,
        border: `2px solid ${accent}55`,
        color: accent,
        fontSize,
        ...style,
      }}
      aria-hidden={!initials}
    >
      {showText ? initials : <User style={{ width: iconSize, height: iconSize }} strokeWidth={2.2} />}
    </div>
  );
}
