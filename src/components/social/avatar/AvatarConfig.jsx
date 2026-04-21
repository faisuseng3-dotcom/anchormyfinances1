// Avatar Configuration — Default state & type definitions

export const DEFAULT_AVATAR_CONFIG = {
  body: 'standard',
  skinColor: '#FFDBAC',
  faceShape: 'oval',
  eyes: { type: 'almond', color: '#2D3436' },
  eyebrows: { type: 'natural' },
  eyelashes: { type: 'natural' },
  nose: { type: 'button' },
  mouth: { type: 'smile', lipColor: '#C48A8A' },
  hair: { style: 'short_clean', color: '#1C1008', isLong: false },
  outfit: { style: 'tshirt', color: '#0D7377' },
  accessory: 'none',
  bg: '#0D7377',
  expression: 'neutral', // 'neutral' | 'happy' | 'excited' | 'focused'
};

export const HAIR_LONG_STYLES = ['long_straight', 'curly_big', 'ponytail'];

export const SKIN_COLORS = [
  '#FFDBAC', '#FDDBB4', '#F5C89A', '#E8A87C', '#D4874E',
  '#C47A3A', '#A0611A', '#8B4E1A', '#6B3410', '#F1C27D',
];

export const HAIR_STYLES = [
  { id: 'short_clean',   label: 'Kort',       isLong: false },
  { id: 'medium_wave',   label: 'Vågigt',     isLong: false },
  { id: 'undercut',      label: 'Undercut',   isLong: false },
  { id: 'long_straight', label: 'Rakt långt', isLong: true  },
  { id: 'curly_big',     label: 'Lockigt',    isLong: true  },
  { id: 'afro',          label: 'Afro',       isLong: false },
  { id: 'bun_top',       label: 'Toppknut',   isLong: false },
  { id: 'bob',           label: 'Bob',        isLong: true  },
  { id: 'ponytail',      label: 'Hästsvans',  isLong: true  },
  { id: 'bald',          label: 'Skallig',    isLong: false },
];

export const HAIR_COLORS = [
  '#1C1008', '#3D2B1F', '#6B3A2A', '#8B4513', '#A0522D',
  '#C8860A', '#D4A017', '#F5DEB3', '#FF6B6B', '#FF4499',
  '#A78BFA', '#60A5FA', '#34D399', '#F97316',
];

export const EYE_TYPES = [
  { id: 'almond',    label: 'Mandel'   },
  { id: 'round',     label: 'Runda'    },
  { id: 'cat',       label: 'Katt'     },
  { id: 'hooded',    label: 'Drömiga'  },
  { id: 'wide',      label: 'Vida'     },
];

export const EYE_COLORS = [
  '#2D3436', '#3B2314', '#4A7C59', '#2E86AB', '#7B68EE', '#8B4513',
];

export const EYEBROW_TYPES = [
  { id: 'natural', label: 'Naturliga' },
  { id: 'arched',  label: 'Bågiga'   },
  { id: 'thick',   label: 'Tjocka'   },
  { id: 'thin',    label: 'Tunna'    },
];

export const EYELASH_TYPES = [
  { id: 'none',      label: 'Inga'        },
  { id: 'natural',   label: 'Naturliga'   },
  { id: 'dramatic',  label: 'Dramatiska'  },
];

export const NOSE_TYPES = [
  { id: 'button',   label: 'Knappnäsa' },
  { id: 'wide',     label: 'Bred'      },
  { id: 'narrow',   label: 'Smal'      },
  { id: 'upturned', label: 'Uppåt'     },
];

export const MOUTH_TYPES = [
  { id: 'smile',  label: 'Leende' },
  { id: 'smirk',  label: 'Smirk'  },
  { id: 'open',   label: 'Öppen'  },
  { id: 'pouty',  label: 'Pouty'  },
];

export const LIP_COLORS = [
  '#C48A8A', '#E57373', '#E91E63', '#9C27B0',
  '#FF7043', '#F06292', '#AD1457', '#B71C1C', '#8B4513',
];

export const OUTFIT_STYLES = [
  { id: 'tshirt',     label: 'T-shirt'       },
  { id: 'hoodie',     label: 'Hoodie'        },
  { id: 'blazer',     label: 'Blazer'        },
  { id: 'suit',       label: 'Kostym'        },
  { id: 'turtleneck', label: 'Polotröja'     },
  { id: 'bomber',     label: 'Bomber jacket' },
  { id: 'denim',      label: 'Denim'         },
  { id: 'sport',      label: 'Sport'         },
];

export const OUTFIT_COLORS = [
  '#0D7377', '#4B7CF3', '#E53E3E', '#D69E2E', '#A78BFA',
  '#0FDEBD', '#1a1a2e', '#2D3748', '#F6AD55', '#FC8181',
  '#ED64A6', '#ECC94B', '#48BB78', '#4299E1',
];

export const ACCESSORIES = [
  { id: 'none',           label: 'Ingen'           },
  { id: 'glasses_round',  label: 'Runda glasögon'  },
  { id: 'glasses_square', label: 'Fyrkantiga'      },
  { id: 'sunglasses',     label: 'Solglasögon'     },
  { id: 'cap',            label: 'Keps'            },
  { id: 'beanie',         label: 'Mössa'           },
  { id: 'earrings',       label: 'Örhängen'        },
  { id: 'headband',       label: 'Pannband'        },
];

export const BG_COLORS = [
  '#0D7377', '#4B7CF3', '#A78BFA', '#F6AD55', '#FC8181',
  '#0FDEBD', '#1a1a2e', '#F687B3', '#68D391', '#ECC94B',
];

// Expression overrides mouth type
export const EXPRESSION_MOUTH_MAP = {
  neutral:  'smile',
  happy:    'open',
  excited:  'open',
  focused:  'smirk',
};