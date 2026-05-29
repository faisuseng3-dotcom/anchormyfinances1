// Avatar Configuration — Bitmoji-inspirerad palett

export const DEFAULT_AVATAR_CONFIG = {
  body: 'standard',
  skinColor: '#FFDBAC',
  faceShape: 'oval',
  eyes: { type: 'round', color: '#4A3728' },
  eyebrows: { type: 'natural' },
  eyelashes: { type: 'natural' },
  nose: { type: 'button' },
  mouth: { type: 'smile', lipColor: '#E07A7A' },
  hair: { style: 'short_clean', color: '#2C1810', isLong: false },
  outfit: { style: 'hoodie', color: '#5AC8FA' },
  accessory: 'none',
  bg: '#FF6B8A',
  expression: 'neutral',
};

export const HAIR_LONG_STYLES = ['long_straight', 'curly_big', 'ponytail', 'bob'];

export const SKIN_COLORS = [
  '#FFEBD4', '#FFCC9A', '#F5B07A', '#E8A06A', '#D4895A',
  '#C67A4E', '#A8653A', '#8D5524', '#6B3E1F', '#5C3317',
];

export const HAIR_STYLES = [
  { id: 'short_clean', label: 'Kort', isLong: false },
  { id: 'medium_wave', label: 'Vågigt', isLong: false },
  { id: 'undercut', label: 'Undercut', isLong: false },
  { id: 'long_straight', label: 'Långt rakt', isLong: true },
  { id: 'curly_big', label: 'Lockigt', isLong: true },
  { id: 'afro', label: 'Afro', isLong: false },
  { id: 'bun_top', label: 'Knut', isLong: false },
  { id: 'bob', label: 'Bob', isLong: true },
  { id: 'ponytail', label: 'Hästsvans', isLong: true },
  { id: 'bald', label: 'Skallig', isLong: false },
];

export const HAIR_COLORS = [
  '#1C1008', '#3D2914', '#6B3A2A', '#8B4513', '#B87333',
  '#D4A017', '#F0D58C', '#FF6B6B', '#FF4D9D', '#9B59FF',
  '#3498DB', '#2ECC71', '#FF9500', '#E8E8E8',
];

export const EYE_TYPES = [
  { id: 'round', label: 'Runda' },
  { id: 'almond', label: 'Mandel' },
  { id: 'wide', label: 'Stora' },
  { id: 'cat', label: 'Katt' },
  { id: 'hooded', label: 'Sömniga' },
];

export const EYE_COLORS = ['#4A3728', '#2E5E8C', '#3D7A4A', '#5C4033', '#6B4C9A', '#1a1a1a'];

export const EYEBROW_TYPES = [
  { id: 'natural', label: 'Naturliga' },
  { id: 'arched', label: 'Bågiga' },
  { id: 'thick', label: 'Tjocka' },
  { id: 'thin', label: 'Tunna' },
];

export const EYELASH_TYPES = [
  { id: 'none', label: 'Inga' },
  { id: 'natural', label: 'Lätt' },
  { id: 'dramatic', label: 'Tydliga' },
];

export const NOSE_TYPES = [
  { id: 'button', label: 'Liten' },
  { id: 'wide', label: 'Bred' },
  { id: 'narrow', label: 'Smal' },
  { id: 'upturned', label: 'Uppåt' },
];

export const MOUTH_TYPES = [
  { id: 'smile', label: 'Leende' },
  { id: 'open', label: 'Glad' },
  { id: 'smirk', label: 'Smirk' },
  { id: 'pouty', label: 'Pout' },
];

export const LIP_COLORS = [
  '#E07A7A', '#FF6B8A', '#D4537A', '#C48A8A', '#FF8A65', '#E91E63',
];

export const OUTFIT_STYLES = [
  { id: 'tshirt', label: 'T-shirt' },
  { id: 'hoodie', label: 'Hoodie' },
  { id: 'blazer', label: 'Kavaj' },
  { id: 'sport', label: 'Träning' },
  { id: 'suit', label: 'Kostym' },
];

export const OUTFIT_COLORS = [
  '#5AC8FA', '#FF6B8A', '#FFE566', '#7C5CFF', '#34C759',
  '#FF9500', '#FF3B30', '#1C1C1E', '#FFFFFF', '#A8D8FF',
  '#FFB3C7', '#B8F397',
];

export const ACCESSORIES = [
  { id: 'none', label: 'Ingen' },
  { id: 'glasses_round', label: 'Glasögon' },
  { id: 'glasses_square', label: 'Fyrkantiga' },
  { id: 'sunglasses', label: 'Solglas' },
  { id: 'cap', label: 'Keps' },
  { id: 'beanie', label: 'Mössa' },
  { id: 'earrings', label: 'Örhängen' },
  { id: 'headband', label: 'Pannband' },
];

/** Bitmoji-lika bakgrunder — starka pasteller */
export const BG_COLORS = [
  '#5AC8FA', '#FFE566', '#FF6B8A', '#7C5CFF', '#34C759',
  '#FF9500', '#FFB3C7', '#A8D8FF', '#B8F397', '#1C1C1E',
];

export const EXPRESSION_MOUTH_MAP = {
  neutral: 'smile',
  happy: 'open',
  excited: 'open',
  focused: 'smirk',
};
