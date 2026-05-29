import React from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

const ACCENTS = ['#4B7CF3', '#0D7377', '#A78BFA', '#F6AD55', '#7FA0FF', '#9AE6B4', '#FF6B6B'];

function hashSeed(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function profileAccent(profile) {
  const seed =
    profile?.username ||
    profile?.display_name ||
    profile?.user_id ||
    profile?.id ||
    '';
  if (!seed) return '#7FA0FF';
  return ACCENTS[hashSeed(String(seed)) % ACCENTS.length];
}

function initialsFrom(profile, name, username) {
  const raw = (profile?.display_name || name || profile?.username || username || '')
    .replace('@', '')
    .trim();
  if (!raw) return null;
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase();
  return parts[0][0].toUpperCase();
}

/** Tillfällig profilbild — ersätter avatar-systemet tills nytt byggs. */
export default function ProfileAvatar({
  profile,
  name,
  username,
  size = 48,
  className,
  style,
}) {
  const accent = profileAccent(profile || { username, display_name: name });
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
      {showText ? (
        initials
      ) : (
        <User style={{ width: iconSize, height: iconSize }} strokeWidth={2.2} />
      )}
    </div>
  );
}
