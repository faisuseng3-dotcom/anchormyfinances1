/** Wrapper — Bitmoji-studio i inbäddat läge (t.ex. Social-fliken) */
import AvatarStudioEditor from './avatar/AvatarStudioEditor';
import { AvatarSVG } from './avatar/BitmojiEngine';
import { DEFAULT_AVATAR_CONFIG } from './avatar/AvatarConfig';

function legacyToConfig(style) {
  if (!style || typeof style !== 'object') return null;
  if (style.skinColor != null || style.eyes) return style;
  return {
    ...DEFAULT_AVATAR_CONFIG,
    skinColor: style.skin || DEFAULT_AVATAR_CONFIG.skinColor,
    hair: { style: style.hair || 'short_clean', color: style.hairColor || '#2C1810' },
    outfit: { style: style.top || 'hoodie', color: style.topColor || '#5AC8FA' },
    bg: style.bg || DEFAULT_AVATAR_CONFIG.bg,
  };
}

export function AvatarSVGCompat({ style, config, size = 96, expression }) {
  const resolved = config || legacyToConfig(style) || DEFAULT_AVATAR_CONFIG;
  return <AvatarSVG config={resolved} size={size} expression={expression} />;
}

export { AvatarSVGCompat as AvatarSVG };

export default function AvatarBuilder(props) {
  return <AvatarStudioEditor embedded {...props} />;
}
