import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Check, X, MapPin, Briefcase } from 'lucide-react';
import { AvatarSVG } from './AvatarBuilder';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

// ── Demo profiles ──────────────────────────────────────────────────────────
const DEMO_PROFILES = [
  {
    id: 'demo_elias',
    username: 'elias_kth',
    display_name: 'Elias',
    age: 22,
    occupation: 'Student',
    city: 'Stockholm',
    bio: 'Lever på CSN och extrajobb. Sparar till en resa efter examen.',
    trait: 'Spar-expert',
    tags: ['Student', 'Stockholm'],
    privacy_level: 'full',
    savings_rate: 8,
    main_stat: '1 200 kr/mån sparande',
    avatar_style: { skin: '#FDBCB4', hair: 'short', hairColor: '#3D2B1F', top: 'tshirt', topColor: '#4B7CF3', bg: '#4B7CF3' },
    finance: {
      income: 14500,
      items: [
        { label: 'Inkomst (CSN + jobb)', amount: 14500, pct: 100, color: '#0FDEBD', icon: '💰', detail: 'CSN 9 000 kr + extrajobb 5 500 kr' },
        { label: 'Hyra',                 amount: 5200,  pct: 36,  color: '#FF4466', icon: '🏠', detail: 'Korridor på Lappis, allt inkl.' },
        { label: 'Mat & Livsmedel',      amount: 3100,  pct: 21,  color: '#F6AD55', icon: '🛒', detail: 'Mestadels matlådor och billigt kaffe.' },
        { label: 'Sparande (resa)',       amount: 1200,  pct: 8,   color: '#A78BFA', icon: '✈️', detail: 'Autopilot till Savelyst varje månad.' },
        { label: 'Övrigt',               amount: 5000,  pct: 35,  color: '#4B7CF3', icon: '📦', detail: 'Transport, nöje, kläder, prylar.' },
      ],
    },
  },
  {
    id: 'demo_sarah',
    username: 'sarah_design',
    display_name: 'Sarah',
    age: 31,
    occupation: 'Egenföretagare',
    city: 'Göteborg',
    bio: 'Bygger min designbyrå. Optimerar för låga fasta kostnader.',
    trait: 'Bolag-builder',
    tags: ['Egenföretagare', 'Göteborg'],
    privacy_level: 'hybrid',
    savings_rate: 20,
    main_stat: '20% Marginal',
    avatar_style: { skin: '#C68642', hair: 'bun', hairColor: '#1A0A00', top: 'blazer', topColor: '#A78BFA', bg: '#A78BFA' },
    finance: {
      income: null,
      items: [
        { label: 'Boende',                pct: 25, color: '#FF4466', icon: '🏠', detail: 'Andrahand centralt i Göteborg.' },
        { label: 'Investering i bolaget', pct: 40, color: '#0FDEBD', icon: '🚀', detail: 'Design-verktyg, kurser, marknadsföring.' },
        { label: 'Livsstil',              pct: 15, color: '#F6AD55', icon: '☕', detail: 'Mat, nöje och träning — budgetvänligt.' },
        { label: 'Buffert',               pct: 20, color: '#A78BFA', icon: '🛡️', detail: '3 månaders buffert som prioritet.' },
      ],
    },
  },
  {
    id: 'demo_marcus',
    username: 'marcus_tech',
    display_name: 'Marcus',
    age: 34,
    occupation: 'Programmerare',
    city: 'Stockholm',
    bio: 'Senior dev. Maxar pensionssparandet och lever enkelt.',
    trait: 'FIRE-fokuserad',
    tags: ['Programmerare', 'Stockholm', 'Höginkomsttagare'],
    privacy_level: 'hybrid',
    savings_rate: 40,
    main_stat: '40% Sparkvot',
    avatar_style: { skin: '#8D5524', hair: 'short', hairColor: '#1C1C1C', top: 'hoodie', topColor: '#0FDEBD', bg: '#0FDEBD' },
    finance: {
      income: null,
      items: [
        { label: 'Boende',       pct: 20, color: '#FF4466', icon: '🏠', detail: 'Äger bostadsrätt, liten månadsavgift.' },
        { label: 'Sparande',     pct: 40, color: '#0FDEBD', icon: '📈', detail: 'ISK + IPS för tidig pension.' },
        { label: 'Levnadskostn.', pct: 25, color: '#F6AD55', icon: '🛒', detail: 'Enkel livsstil, matlagning hemma.' },
        { label: 'Övrigt',      pct: 15, color: '#A78BFA', icon: '📦', detail: 'Teknikprylar och semesterfond.' },
      ],
    },
  },
];

const ALL_TAGS = ['Student', 'Egenföretagare', 'Programmerare', 'Designer', 'Höginkomsttagare', 'Stockholm', 'Göteborg', 'Malmö'];

// ── Mini Donut for grid card ───────────────────────────────────────────────
function MiniDonut({ items, size = 64 }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 7;
  let angle = -90;
  const toRad = (d) => (d * Math.PI) / 180;

  const arcs = items.map(item => {
    const deg = Math.max((item.pct / 100) * 360, 2);
    const x1 = cx + r * Math.cos(toRad(angle));
    const y1 = cy + r * Math.sin(toRad(angle));
    const x2 = cx + r * Math.cos(toRad(angle + deg - 1));
    const y2 = cy + r * Math.sin(toRad(angle + deg - 1));
    const large = deg > 180 ? 1 : 0;
    const path = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
    angle += deg;
    return { ...item, path };
  });

  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
      {arcs.map((a, i) => (
        <path key={i} d={a.path} fill="none" stroke={a.color} strokeWidth="5" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${a.color}80)` }} />
      ))}
    </svg>
  );
}

// ── Full Orbit system for expanded view ────────────────────────────────────
function OrbitSystem({ profile, accentColor }) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const isHybrid = profile.privacy_level === 'hybrid';
  const items = profile.finance.items;

  const orbitRadii = [60, 95, 128, 158, 185];

  return (
    <div className="relative flex items-center justify-center" style={{ height: 320 }}>
      {/* Planet (income / center) */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 pointer-events-none"
        style={{ borderRadius: '50%' }}
      />

      {/* Center orb */}
      <div className="absolute z-10 w-16 h-16 rounded-full flex items-center justify-center"
        style={{
          background: `radial-gradient(circle, ${accentColor}40, ${accentColor}10)`,
          border: `2px solid ${accentColor}60`,
          boxShadow: `0 0 24px ${accentColor}40, 0 0 48px ${accentColor}15`,
        }}>
        <AvatarSVG style={profile.avatar_style} size={52} />
      </div>

      {/* Orbit rings + moons */}
      {items.map((item, i) => {
        const rad = orbitRadii[i] || 185 + i * 20;
        const isHovered = hoveredItem === i;
        // Place moons at various fixed angles for visual spread
        const moonAngle = (i * 72 - 90) * (Math.PI / 180);
        const mx = Math.cos(moonAngle) * rad;
        const my = Math.sin(moonAngle) * rad;

        return (
          <React.Fragment key={i}>
            {/* Orbit track */}
            <div className="absolute rounded-full pointer-events-none"
              style={{
                width: rad * 2, height: rad * 2,
                border: `1px solid rgba(255,255,255,0.04)`,
                transform: 'translate(-50%, -50%)',
                left: '50%', top: '50%',
                marginLeft: -(rad), marginTop: -(rad),
              }} />

            {/* Moon */}
            <motion.div
              className="absolute cursor-pointer z-20"
              style={{ left: '50%', top: '50%', transform: `translate(${mx - 16}px, ${my - 16}px)` }}
              animate={{ scale: isHovered ? 1.15 : 1 }}
              onMouseEnter={() => setHoveredItem(i)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={(e) => { e.stopPropagation(); setHoveredItem(isHovered ? null : i); }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{
                  background: `${item.color}20`,
                  border: `1.5px solid ${item.color}60`,
                  boxShadow: isHovered ? `0 0 12px ${item.color}80` : `0 0 5px ${item.color}30`,
                }}>
                {item.icon}
              </div>

              {/* Tooltip on hover */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: -12 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 w-44 p-2.5 rounded-xl text-center pointer-events-none"
                    style={{
                      background: 'rgba(5,8,20,0.95)',
                      border: `1px solid ${item.color}40`,
                      boxShadow: `0 8px 24px rgba(0,0,0,0.5)`,
                    }}>
                    <p className="text-[10px] font-black mb-0.5" style={{ color: item.color }}>{item.label}</p>
                    <p className="text-base font-black text-white">
                      {isHybrid || !item.amount ? `${item.pct}%` : `${fmt(item.amount)} kr`}
                    </p>
                    {item.detail && (
                      <p className="text-[9px] mt-1 leading-tight" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.detail}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Expanded fullscreen overlay ────────────────────────────────────────────
function ExpandedProfile({ profile, onClose, onAdopt, userFinancialProfile }) {
  const [adopted, setAdopted] = useState(false);
  const isHybrid = profile.privacy_level === 'hybrid';
  const accentColor = profile.avatar_style?.bg || '#4B7CF3';

  const handleAdopt = async (e) => {
    e.stopPropagation();
    const income = userFinancialProfile?.income || 14000;
    const newLimits = {};
    for (const item of profile.finance.items) {
      if (item.label !== 'Inkomst (CSN + jobb)') {
        const catKey = item.label.toLowerCase().replace(/[\s&()\/]/g, '_').replace(/_+/g, '_');
        newLimits[catKey] = Math.round((item.pct / 100) * income);
      }
    }
    if (userFinancialProfile?.id) {
      await base44.entities.FinancialProfile.update(userFinancialProfile.id, { budgetLimits: newLimits });
    }
    setAdopted(true);
    setTimeout(() => setAdopted(false), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: 'rgba(2,4,12,0.92)', backdropFilter: 'blur(16px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="relative flex flex-col h-full overflow-y-auto"
        onClick={e => e.stopPropagation()}
        style={{
          background: `linear-gradient(180deg, rgba(5,8,20,0.98) 0%, rgba(8,12,28,0.98) 100%)`,
          borderTop: `1px solid ${accentColor}25`,
        }}
      >
        {/* Close */}
        <button onClick={onClose}
          className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <X className="w-4 h-4 text-white" />
        </button>

        {/* Header */}
        <div className="px-6 pt-8 pb-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: `${accentColor}20`, border: `2px solid ${accentColor}50`, boxShadow: `0 0 20px ${accentColor}30` }}>
            <AvatarSVG style={profile.avatar_style} size={56} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-black text-white">@{profile.username}</h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black"
                style={{ background: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}35` }}>
                {isHybrid ? '% PROCENT' : '🔓 KRONOR'}
              </span>
            </div>
            <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {profile.display_name}, {profile.age}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1">
                <Briefcase className="w-3 h-3" style={{ color: accentColor }} />
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{profile.occupation}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" style={{ color: accentColor }} />
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{profile.city}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="px-6 mb-2">
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{profile.bio}</p>
        </div>

        {/* Trait badge */}
        <div className="px-6 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black"
            style={{ background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}30` }}>
            <Sparkles className="w-3 h-3" /> {profile.trait}
          </span>
        </div>

        {/* Orbit label */}
        <p className="px-6 text-[9px] font-black tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.18)' }}>
          EKONOMISKT SOLSYSTEM — TRYCK PÅ EN PLANET FÖR DETALJER
        </p>

        {/* Orbit system */}
        <div className="px-2">
          <OrbitSystem profile={profile} accentColor={accentColor} />
        </div>

        {/* Legend */}
        <div className="px-6 space-y-2 mt-2">
          <p className="text-[9px] font-black tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.18)' }}>
            BUDGETFÖRDELNING
          </p>
          {profile.finance.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-base">{item.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.label}</p>
                  <p className="text-xs font-black" style={{ color: item.color }}>
                    {isHybrid || !item.amount ? `${item.pct}%` : `${fmt(item.amount)} kr`}
                  </p>
                </div>
                <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.pct}%` }}
                    transition={{ duration: 0.9, delay: i * 0.08, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Adopt button */}
        <div className="px-6 pt-6 pb-10">
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            onClick={handleAdopt}
            className="w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              background: adopted
                ? 'linear-gradient(135deg, rgba(15,222,189,0.2), rgba(15,222,189,0.1))'
                : `linear-gradient(135deg, ${accentColor}30, ${accentColor}15)`,
              color: adopted ? '#0FDEBD' : accentColor,
              border: `1.5px solid ${adopted ? 'rgba(15,222,189,0.5)' : `${accentColor}50`}`,
              boxShadow: adopted
                ? '0 0 24px rgba(15,222,189,0.2)'
                : `0 0 24px ${accentColor}15`,
            }}>
            {adopted
              ? <><Check className="w-4 h-4" /> Budget adopterad från @{profile.username}</>
              : <><Sparkles className="w-4 h-4" /> HÄRMA DENNA BUDGET</>
            }
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Vinted-style grid card ─────────────────────────────────────────────────
function MarketplaceCard({ profile, onOpen, index }) {
  const isHybrid = profile.privacy_level === 'hybrid';
  const accentColor = profile.avatar_style?.bg || '#4B7CF3';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 300, damping: 28 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onOpen(profile)}
      className="cursor-pointer overflow-hidden rounded-2xl flex flex-col"
      style={{
        background: 'rgba(6,9,22,0.9)',
        border: `1px solid ${accentColor}20`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
    >
      {/* Hero avatar area */}
      <div className="relative flex items-center justify-center py-6"
        style={{ background: `radial-gradient(ellipse at 50% 80%, ${accentColor}18 0%, transparent 70%)` }}>
        {/* Privacy badge top-right */}
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[8px] font-black"
          style={{
            background: isHybrid ? 'rgba(167,139,250,0.15)' : 'rgba(15,222,189,0.15)',
            color: isHybrid ? '#A78BFA' : '#0FDEBD',
            border: `1px solid ${isHybrid ? 'rgba(167,139,250,0.3)' : 'rgba(15,222,189,0.3)'}`,
          }}>
          {isHybrid ? '% PROCENT' : '🔓 KRONOR'}
        </div>

        {/* Floating avatar */}
        <motion.div
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: index * 0.5 }}
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: `${accentColor}20`,
            border: `2px solid ${accentColor}45`,
            boxShadow: `0 0 20px ${accentColor}30`,
          }}>
          <AvatarSVG style={profile.avatar_style} size={54} />
        </motion.div>

        {/* Mini donut bottom-left */}
        <div className="absolute bottom-1 left-1">
          <MiniDonut items={profile.finance.items} size={44} />
        </div>
      </div>

      {/* Info */}
      <div className="px-3 pt-2 pb-3 flex-1 flex flex-col gap-1">
        <p className="text-xs font-black text-white">@{profile.username}</p>
        <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {profile.display_name}, {profile.age} · {profile.city}
        </p>
        <p className="text-[9px] font-semibold truncate" style={{ color: 'rgba(255,255,255,0.25)' }}>
          {profile.occupation}
        </p>

        {/* Trait chip */}
        <div className="mt-1">
          <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black"
            style={{ background: `${accentColor}15`, color: `${accentColor}cc`, border: `1px solid ${accentColor}25` }}>
            {profile.trait}
          </span>
        </div>

        {/* "Price tag" = main stat */}
        <div className="mt-auto pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-xs font-black" style={{ color: accentColor }}>{profile.main_stat}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Galaxy Explorer main ───────────────────────────────────────────────────
export default function GalaxyExplorer({ userFinancialProfile }) {
  const [searchText, setSearchText] = useState('');
  const [activeTags, setActiveTags] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const { data: realProfiles = [] } = useQuery({
    queryKey: ['galaxyProfiles'],
    queryFn: async () => {
      const all = await base44.entities.SocialProfile.list();
      return all.filter(p => p.privacy_level !== 'ghost' && p.username);
    }
  });

  const toggleTag = (tag) => {
    setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const allProfiles = useMemo(() => {
    const real = realProfiles.map(p => ({
      id: p.id,
      username: p.username,
      display_name: p.username,
      age: p.age,
      occupation: p.occupation || '',
      city: '',
      bio: p.bio || '',
      trait: p.occupation || 'Ekonom',
      tags: [p.occupation || ''].filter(Boolean),
      privacy_level: p.privacy_level || 'hybrid',
      avatar_style: p.avatar_style || {},
      main_stat: '',
      savings_rate: 0,
      finance: { items: [] },
    }));
    return [...DEMO_PROFILES, ...real];
  }, [realProfiles]);

  const filtered = useMemo(() => {
    return allProfiles.filter(p => {
      const q = searchText.toLowerCase();
      const textMatch = !q || p.username.includes(q) || p.occupation?.toLowerCase().includes(q) || p.bio?.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q));
      const tagMatch = activeTags.length === 0 || activeTags.some(t => p.tags.includes(t));
      return textMatch && tagMatch;
    });
  }, [allProfiles, searchText, activeTags]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
        <input
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          placeholder="Sök efter yrke, stad, livsstil..."
          className="w-full rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
        />
      </div>

      {/* Neon filter chips */}
      <div className="flex gap-2 flex-wrap">
        {ALL_TAGS.map(tag => {
          const active = activeTags.includes(tag);
          return (
            <motion.button key={tag} whileTap={{ scale: 0.88 }}
              onClick={() => toggleTag(tag)}
              className="px-3 py-1 rounded-full text-[10px] font-black transition-all"
              style={{
                background: active ? 'rgba(15,222,189,0.12)' : 'rgba(255,255,255,0.04)',
                color: active ? '#0FDEBD' : 'rgba(255,255,255,0.3)',
                border: active ? '1px solid rgba(15,222,189,0.4)' : '1px solid rgba(255,255,255,0.07)',
                boxShadow: active ? '0 0 10px rgba(15,222,189,0.2)' : 'none',
              }}>
              {tag}
            </motion.button>
          );
        })}
      </div>

      {/* Count */}
      <p className="text-[9px] font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.18)' }}>
        {filtered.length} EKONOMISKA PROFILER HITTADE
      </p>

      {/* Vinted 2-column grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((profile, i) => (
          <MarketplaceCard
            key={profile.id}
            profile={profile}
            index={i}
            onOpen={setSelectedProfile}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-2xl mb-2">🌌</p>
          <p className="text-sm font-black" style={{ color: 'rgba(255,255,255,0.3)' }}>Inga galaxer hittades</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.15)' }}>Prova att ändra filter</p>
        </div>
      )}

      {/* Expanded fullscreen overlay */}
      <AnimatePresence>
        {selectedProfile && (
          <ExpandedProfile
            profile={selectedProfile}
            onClose={() => setSelectedProfile(null)}
            userFinancialProfile={userFinancialProfile}
          />
        )}
      </AnimatePresence>
    </div>
  );
}