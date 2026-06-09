import React from 'react';
import {
  Home,
  PieChart,
  Sparkles,
  Bot,
  Wrench,
  Target,
  RefreshCw,
  Building2,
  Users,
  GraduationCap,
  Anchor,
  Settings,
  Menu,
  Search,
  Bell,
  ShoppingCart,
  Car,
  Film,
  Plane,
  Heart,
  ShoppingBag,
  Package,
  Wallet,
  PiggyBank,
  Music,
  Utensils,
  Shield,
  Leaf,
  CloudRain,
  Zap,
  TrendingUp,
  Flame,
  Smartphone,
  Plus,
  Check,
  Star,
  Circle,
  Sun,
  BarChart3,
  Rocket,
  Globe,
  Minus,
  Ban,
  Sparkle,
} from 'lucide-react';
import { BUDGET_CATEGORY_META } from '@/lib/budgetCategories';

const SIZE_DEFAULT = 18;

/** Lucide-komponenter för sidomeny */
export const NAV_ICON_MAP = {
  home: Home,
  budget: PieChart,
  future: Sparkles,
  coach: Bot,
  tools: Wrench,
  goals: Target,
  subscriptions: RefreshCw,
  business: Building2,
  squads: Users,
  academy: GraduationCap,
  settings: Settings,
  menu: Menu,
  search: Search,
  bell: Bell,
  plus: Plus,
};

/** Kategori → Lucide (delar med budgetCategories där det finns) */
export const CATEGORY_ICON_MAP = {
  food: Utensils,
  transport: Car,
  entertainment: Film,
  travel: Plane,
  health: Heart,
  home: Home,
  shopping: ShoppingBag,
  income: Wallet,
  savings: PiggyBank,
  savings_deposit: PiggyBank,
  subscription: Music,
  subscriptions: Music,
  other: Package,
  ...Object.fromEntries(
    Object.entries(BUDGET_CATEGORY_META).map(([k, v]) => [k, v.Icon]),
  ),
};

/** Sparmål / måltyper */
export const GOAL_ICON_MAP = {
  travel: Plane,
  vacation: Plane,
  home: Home,
  house: Home,
  transport: Car,
  buffer: Shield,
  emergency: Shield,
  savings: PiggyBank,
  entertainment: Film,
  shopping: ShoppingBag,
  income: Wallet,
  other: Globe,
  goals: Rocket,
  default: Target,
};

/** Humör */
export const MOOD_ICON_MAP = {
  calm: Leaf,
  stressed: CloudRain,
  motivated: Zap,
};

/** Streak-varianter */
export const STREAK_ICON_MAP = {
  fire: Flame,
  save: PiggyBank,
  budget: Check,
};

/** Färgad statuspunkt (grön / gul / röd) */
export const STATUS_DOT_COLORS = {
  grön: '#22d97a',
  gul: '#fcd34d',
  röd: '#f87171',
  ok: '#22d97a',
  warning: '#fcd34d',
  danger: '#f87171',
  default: '#8fa8d8',
};

export function AnchorLogoMark({ size = 16, className = '' }) {
  return <Anchor size={size} className={className} strokeWidth={2.2} />;
}

export function NavIcon({ name, size = SIZE_DEFAULT, className = '' }) {
  const Icon = NAV_ICON_MAP[name] || Circle;
  return <Icon size={size} className={className} strokeWidth={2} aria-hidden />;
}

export function CategoryIcon({ category = 'other', size = SIZE_DEFAULT, className = '', color = undefined }) {
  const Icon = CATEGORY_ICON_MAP[category] || Package;
  return (
    <Icon
      size={size}
      className={className}
      strokeWidth={2}
      style={color ? { color } : undefined}
      aria-hidden
    />
  );
}

export function GoalIcon({ type = 'default', size = SIZE_DEFAULT, className = '', color = undefined }) {
  const Icon = GOAL_ICON_MAP[type] || GOAL_ICON_MAP.default;
  return (
    <Icon
      size={size}
      className={className}
      strokeWidth={2}
      style={color ? { color } : undefined}
      aria-hidden
    />
  );
}

export function MoodIcon({ mood, size = SIZE_DEFAULT, className = '' }) {
  const Icon = MOOD_ICON_MAP[mood] || Leaf;
  return <Icon size={size} className={className} strokeWidth={2} aria-hidden />;
}

export function StreakIcon({ variant = 'fire', size = 14, className = '' }) {
  const Icon = STREAK_ICON_MAP[variant] || Flame;
  return <Icon size={size} className={className} strokeWidth={2.5} aria-hidden />;
}

/** Färgad statuspunkt istället för emoji-cirklar */
export function StatusDot({ status = 'default', size = 10, className = '' }) {
  const color = STATUS_DOT_COLORS[status] || STATUS_DOT_COLORS.default;
  return (
    <span
      className={`inline-block rounded-full flex-shrink-0 ${className}`}
      style={{ width: size, height: size, background: color }}
      aria-hidden
    />
  );
}

export function IconBadge({ children, bg, className = '' }) {
  return (
    <div
      className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ background: bg }}
    >
      {children}
    </div>
  );
}

/** Din Framtid-scenarier */
export const SCENARIO_ICON_MAP = {
  optimistic: Sun,
  realistic: BarChart3,
  pessimistic: CloudRain,
};

export function ScenarioIcon({ mode = 'realistic', size = SIZE_DEFAULT, className = '' }) {
  const Icon = SCENARIO_ICON_MAP[mode] || BarChart3;
  return <Icon size={size} className={className} strokeWidth={2} aria-hidden />;
}

/** Sparmål-ikonväljare */
export const DREAM_GOAL_ICON_OPTIONS = [
  { id: 'travel', Icon: Plane },
  { id: 'home', Icon: Home },
  { id: 'transport', Icon: Car },
  { id: 'default', Icon: Target },
  { id: 'buffer', Icon: Shield },
  { id: 'savings', Icon: PiggyBank },
  { id: 'entertainment', Icon: Film },
  { id: 'shopping', Icon: ShoppingBag },
  { id: 'income', Icon: Wallet },
  { id: 'other', Icon: Globe },
  { id: 'goals', Icon: Rocket },
];

/** Squad-ikonväljare */
export const SQUAD_ICON_OPTIONS = [
  { id: 'rocket', Icon: Rocket },
  { id: 'travel', Icon: Plane },
  { id: 'home', Icon: Home },
  { id: 'entertainment', Icon: Film },
  { id: 'default', Icon: Target },
  { id: 'health', Icon: Heart },
  { id: 'savings', Icon: PiggyBank },
  { id: 'globe', Icon: Globe },
  { id: 'shield', Icon: Shield },
  { id: 'users', Icon: Users },
];

const SQUAD_ICON_LOOKUP = Object.fromEntries(SQUAD_ICON_OPTIONS.map((o) => [o.id, o.Icon]));

export function SquadIcon({ name = 'rocket', size = SIZE_DEFAULT, className = '', color = undefined }) {
  const Icon = SQUAD_ICON_LOOKUP[name] || Rocket;
  return (
    <Icon
      size={size}
      className={className}
      strokeWidth={2}
      style={color ? { color } : undefined}
      aria-hidden
    />
  );
}

/** Mappar ikonnyckel; legacy emoji-fält renderas aldrig som text. */
export function resolveSquadIconName(iconOrLegacy) {
  if (!iconOrLegacy) return 'rocket';
  if (SQUAD_ICON_LOOKUP[iconOrLegacy]) return iconOrLegacy;
  return 'rocket';
}

/** Pulse-/kalenderhändelser */
export function resolveEventCategory(event) {
  if (!event) return 'other';
  if (event.priority === 'income') return 'income';
  const key = event.category || event.icon;
  if (key && CATEGORY_ICON_MAP[key]) return key;
  if (key === 'streaming') return 'subscription';
  if (key === 'loans') return 'other';
  return 'other';
}

export function EventCategoryIcon({ event, size = SIZE_DEFAULT, className = '', color = undefined }) {
  return (
    <CategoryIcon
      category={resolveEventCategory(event)}
      size={size}
      className={className}
      color={color}
    />
  );
}

/** Känslo-/feedbackikoner */
export const FEELING_ICON_MAP = {
  star: Star,
  sparkle: Sparkle,
  neutral: Minus,
  skip: Ban,
};

export function FeelingIcon({ type = 'neutral', size = 16, className = '' }) {
  const Icon = FEELING_ICON_MAP[type] || Minus;
  return <Icon size={size} className={className} strokeWidth={2} aria-hidden />;
}
