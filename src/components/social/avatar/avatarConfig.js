/** Clean minimal 2D avatar — flat Memoji-inspirerad config */

export const DEFAULT_AVATAR_CONFIG = {
  skin: '#F2D3C5',
  hairStyle: 'short',
  hairColor: '#3A2A22',
  eyeStyle: 'round',
  eyeColor: '#1E2430',
  browStyle: 'soft',
  mouth: 'soft',
  accessory: 'none',
  topStyle: 'crew',
  topColor: '#0D7377',
  bg: '#E4EBF2',
  faceShape: 'round',
};

export const SKIN_TONES = ['#FDEBE0', '#F2D3C5', '#E8B796', '#C68642', '#8D5524', '#5C3D2E'];
export const HAIR_COLORS = ['#1C1C1C', '#3A2A22', '#6B4423', '#B8860B', '#D4A574', '#E8D5B7', '#C0392B', '#7B68EE'];
export const TOP_COLORS = ['#0D7377', '#4B7CF3', '#A78BFA', '#FF6B6B', '#F6AD55', '#2D3436', '#FFFFFF', '#9AE6B4'];
export const BG_COLORS = ['#E4EBF2', '#DDE8F5', '#E8F5E9', '#FFF3E0', '#F3E5F5', '#E0F7FA', '#FFF8E1', '#1E2430'];

export const HAIR_STYLES = [
  { id: 'short', label: 'Kort' },
  { id: 'medium', label: 'Medel' },
  { id: 'long', label: 'Långt' },
  { id: 'bun', label: 'Knuten' },
  { id: 'curly', label: 'Lockigt' },
  { id: 'bald', label: 'Skallig' },
];

export const EYE_STYLES = [
  { id: 'round', label: 'Rund' },
  { id: 'almond', label: 'Mandel' },
];

export const BROW_STYLES = [
  { id: 'soft', label: 'Mjuk' },
  { id: 'arc', label: 'Båge' },
  { id: 'flat', label: 'Rak' },
];

export const MOUTH_STYLES = [
  { id: 'soft', label: 'Mild' },
  { id: 'smile', label: 'Leende' },
  { id: 'neutral', label: 'Neutral' },
];

export const ACCESSORIES = [
  { id: 'none', label: 'Ingen' },
  { id: 'glasses', label: 'Glasögon' },
  { id: 'earrings', label: 'Örhängen' },
];

export const TOP_STYLES = [
  { id: 'crew', label: 'T-shirt' },
  { id: 'vneck', label: 'V-ringning' },
  { id: 'hoodie', label: 'Hoodie' },
];

export const FACE_SHAPES = [
  { id: 'round', label: 'Rund' },
  { id: 'oval', label: 'Oval' },
];

export function randomAvatarConfig() {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  return {
    ...DEFAULT_AVATAR_CONFIG,
    skin: pick(SKIN_TONES),
    hairStyle: pick(HAIR_STYLES).id,
    hairColor: pick(HAIR_COLORS),
    eyeStyle: pick(EYE_STYLES).id,
    browStyle: pick(BROW_STYLES).id,
    mouth: pick(MOUTH_STYLES).id,
    accessory: pick(ACCESSORIES).id,
    topStyle: pick(TOP_STYLES).id,
    topColor: pick(TOP_COLORS),
    bg: pick(BG_COLORS),
    faceShape: pick(FACE_SHAPES).id,
  };
}

const HAIR_LEGACY = {
  short_clean: 'short',
  long_straight: 'long',
  curly_big: 'curly',
  ponytail: 'bun',
  bob: 'medium',
  bun_top: 'bun',
};

const TOP_LEGACY = {
  tshirt: 'crew',
  hoodie: 'hoodie',
  blazer: 'vneck',
  tank: 'crew',
};

export function normalizeAvatarConfig(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (raw.version === 2 || raw.skin != null) {
    const hairStyle = HAIR_LEGACY[raw.hairStyle] || raw.hairStyle || DEFAULT_AVATAR_CONFIG.hairStyle;
    const topStyle = TOP_LEGACY[raw.topStyle] || raw.topStyle || DEFAULT_AVATAR_CONFIG.topStyle;
    return { ...DEFAULT_AVATAR_CONFIG, ...raw, hairStyle, topStyle };
  }
  const legacyHair = raw.hair?.style || raw.hairStyle;
  const legacyTop = raw.outfit?.style || raw.topStyle;
  return {
    ...DEFAULT_AVATAR_CONFIG,
    skin: raw.skinColor || raw.skin || DEFAULT_AVATAR_CONFIG.skin,
    hairStyle: HAIR_LEGACY[legacyHair] || legacyHair || DEFAULT_AVATAR_CONFIG.hairStyle,
    hairColor: raw.hair?.color || raw.hairColor || DEFAULT_AVATAR_CONFIG.hairColor,
    topStyle: TOP_LEGACY[legacyTop] || legacyTop || DEFAULT_AVATAR_CONFIG.topStyle,
    topColor: raw.outfit?.color || raw.topColor || DEFAULT_AVATAR_CONFIG.topColor,
    bg: raw.bg || DEFAULT_AVATAR_CONFIG.bg,
    eyeStyle: raw.eyes?.type === 'hooded' ? 'almond' : (raw.eyes?.type || raw.eyeStyle || DEFAULT_AVATAR_CONFIG.eyeStyle),
    eyeColor: raw.eyes?.color || raw.eyeColor || DEFAULT_AVATAR_CONFIG.eyeColor,
    accessory: raw.accessory === 'glasses_round' ? 'glasses' : (raw.accessory || DEFAULT_AVATAR_CONFIG.accessory),
    version: 2,
  };
}

export function resolveAvatarConfig(profile) {
  if (!profile) return null;
  return normalizeAvatarConfig(profile.avatar_config || profile.avatar_style);
}

export function configForSave(config) {
  return { ...config, version: 2 };
}

const ACCENTS = ['#4B7CF3', '#0D7377', '#A78BFA', '#F6AD55', '#7FA0FF', '#9AE6B4', '#FF6B6B'];

function hashSeed(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function profileAccent(profile) {
  const cfg = resolveAvatarConfig(profile);
  if (cfg?.bg) return cfg.bg;
  const seed = profile?.username || profile?.display_name || profile?.user_id || profile?.id || '';
  if (!seed) return '#7FA0FF';
  return ACCENTS[hashSeed(String(seed)) % ACCENTS.length];
}
