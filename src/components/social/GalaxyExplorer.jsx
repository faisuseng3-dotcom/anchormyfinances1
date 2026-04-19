import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Copy, Check } from 'lucide-react';
import { AvatarSVG } from './AvatarBuilder';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

// ── Demo profiles ──────────────────────────────────────────────────────────
const DEMO_PROFILES = [
  {
    id: 'demo_elias',
    username: 'elias_kth',
    display_name: 'Elias',
    age: 22,
    occupation: 'Student, KTH',
    bio: 'Lever på CSN och extrajobb. Sparar till en resa efter examen.',
    tags: ['Student', 'Stockholm'],
    privacy_level: 'full',
    avatar_style: { skin: '#FDBCB4', hair: 'short', hairColor: '#3D2B1F', top: 'tshirt', topColor: '#4B7CF3', bg: '#4B7CF3' },
    finance: {
      income: 14500,
      items: [
        { label: 'Inkomst (CSN + jobb)', amount: 14500, pct: 100, color: '#0FDEBD', icon: '💰' },
        { label: 'Hyra',                 amount: 5200,  pct: 36,  color: '#FF4466', icon: '🏠' },
        { label: 'Mat & Livsmedel',      amount: 3100,  pct: 21,  color: '#F6AD55', icon: '🛒' },
        { label: 'Sparande (resa)',       amount: 1200,  pct: 8,   color: '#A78BFA', icon: '✈️' },
        { label: 'Övrigt',               amount: 5000,  pct: 35,  color: '#4B7CF3', icon: '📦' },
      ],
    },
  },
  {
    id: 'demo_sarah',
    username: 'sarah_design',
    display_name: 'Sarah',
    age: 31,
    occupation: 'Egenföretagare, Design',
    bio: 'Bygger min designbyrå. Optimerar för låga fasta kostnader.',
    tags: ['Egenföretagare', 'Göteborg'],
    privacy_level: 'hybrid',
    avatar_style: { skin: '#C68642', hair: 'bun', hairColor: '#1A0A00', top: 'blazer', topColor: '#A78BFA', bg: '#A78BFA' },
    finance: {
      income: null, // hidden
      items: [
        { label: 'Boende',                pct: 25, color: '#FF4466', icon: '🏠' },
        { label: 'Investering i bolaget', pct: 40, color: '#0FDEBD', icon: '🚀' },
        { label: 'Livsstil',              pct: 15, color: '#F6AD55', icon: '☕' },
        { label: 'Buffert',               pct: 20, color: '#A78BFA', icon: '🛡️' },
      ],
    },
  },
];

const ALL_TAGS = ['Student', 'Egenföretagare', 'Småbarnsförälder', 'Höginkomsttagare', 'Stockholm', 'Göteborg', 'Malmö', 'Programmerare', 'Designer'];

// ── Mini orbit ring chart ──────────────────────────────────────────────────
function OrbitRing({ items, privacyLevel, size = 80 }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 8;
  let angle = -90;
  const arcs = items.map(item => {
    const deg = (item.pct / 100) * 360;
    const start = angle;
    angle += deg;
    return { ...item, start, deg };
  });

  const toRad = (d) => (d * Math.PI) / 180;
  const arc = (start, deg, radius) => {
    const x1 = cx + radius * Math.cos(toRad(start));
    const y1 = cy + radius * Math.sin(toRad(start));
    const x2 = cx + radius * Math.cos(toRad(start + deg));
    const y2 = cy + radius * Math.sin(toRad(start + deg));
    const large = deg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
  };

  return (
    <svg width={size} height={size}>
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
      {/* Segments */}
      {arcs.map((item, i) => (
        <path key={i} d={arc(item.start, item.deg - 2, r)}
          fill="none" stroke={item.color} strokeWidth="6" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 3px ${item.color}80)` }} />
      ))}
      {/* Center privacy indicator */}
      {privacyLevel === 'hybrid' && (
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="12" fill="rgba(255,255,255,0.4)">%</text>
      )}
    </svg>
  );
}

// ── Profile card (planet) ──────────────────────────────────────────────────
function GalaxyProfileCard({ profile, onAdopt, userFinancialProfile, index }) {
  const [expanded, setExpanded] = useState(false);
  const [adopted, setAdopted] = useState(false);
  const isHybrid = profile.privacy_level === 'hybrid';

  const handleAdopt = async () => {
    if (!userFinancialProfile?.id || !profile.finance?.income) return;
    const income = userFinancialProfile.income || 14000;
    const newLimits = {};
    for (const item of profile.finance.items) {
      if (item.label !== 'Inkomst (CSN + jobb)') {
        const catKey = item.label.toLowerCase().replace(/\s+/g, '_');
        newLimits[catKey] = Math.round((item.pct / 100) * income);
      }
    }
    await base44.entities.FinancialProfile.update(userFinancialProfile.id, { budgetLimits: newLimits });
    setAdopted(true);
    setTimeout(() => setAdopted(false), 3000);
  };

  const accentColor = profile.avatar_style?.bg || '#4B7CF3';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 280, damping: 28 }}
      className="relative overflow-hidden rounded-3xl cursor-pointer"
      style={{
        background: 'rgba(6,8,18,0.85)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${accentColor}25`,
        boxShadow: `0 0 32px ${accentColor}12, inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
      onClick={() => setExpanded(e => !e)}
    >
      {/* Prismatic sweep */}
      <motion.div
        animate={{ x: ['-120%', '120%'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: index * 0.8 }}
        className="absolute inset-0 pointer-events-none"
        style={{ background: `linear-gradient(105deg, transparent 30%, ${accentColor}12 50%, transparent 70%)` }}
      />

      <div className="p-4">
        {/* Top row */}
        <div className="flex items-center gap-3">
          {/* Space Pod avatar */}
          <div className="relative flex-shrink-0">
            <motion.div
              animate={{ y: [-2, 2, -2] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: `radial-gradient(circle, ${accentColor}25 0%, ${accentColor}08 100%)`,
                border: `2px solid ${accentColor}50`,
                boxShadow: `0 0 16px ${accentColor}30`,
              }}
            >
              <AvatarSVG style={profile.avatar_style} size={48} />
            </motion.div>
            {/* Privacy badge */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[8px]"
              style={{ background: accentColor, boxShadow: `0 0 6px ${accentColor}` }}>
              {isHybrid ? '%' : '👁️'}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-black text-white text-sm">@{profile.username}</p>
            <p className="text-[10px] font-semibold" style={{ color: `${accentColor}cc` }}>
              {profile.display_name}, {profile.age} — {profile.occupation}
            </p>
            <p className="text-[10px] mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {profile.bio}
            </p>
          </div>

          {/* Orbit mini-chart */}
          <OrbitRing items={profile.finance.items} privacyLevel={profile.privacy_level} size={56} />
        </div>

        {/* Tags */}
        <div className="flex gap-1.5 flex-wrap mt-3">
          {profile.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded-full text-[9px] font-black"
              style={{ background: `${accentColor}15`, color: `${accentColor}cc`, border: `1px solid ${accentColor}25` }}>
              {tag}
            </span>
          ))}
          <span className="px-2 py-0.5 rounded-full text-[9px] font-black"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {isHybrid ? '% Visning' : '🔓 Full Transparens'}
          </span>
        </div>

        {/* Expanded detail */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 space-y-2"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {profile.finance.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-sm">{item.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.label}</p>
                        <p className="text-[10px] font-black" style={{ color: item.color }}>
                          {isHybrid || !item.amount
                            ? `${item.pct}%`
                            : `${fmt(item.amount)} kr`}
                        </p>
                      </div>
                      <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.pct}%` }}
                          transition={{ duration: 0.8, delay: i * 0.08 }}
                          className="h-full rounded-full"
                          style={{ background: item.color, boxShadow: `0 0 4px ${item.color}` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Adopt button */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => { e.stopPropagation(); handleAdopt(); }}
                  className="w-full mt-3 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2"
                  style={{
                    background: adopted ? 'rgba(15,222,189,0.15)' : `${accentColor}20`,
                    color: adopted ? '#0FDEBD' : accentColor,
                    border: `1px solid ${adopted ? 'rgba(15,222,189,0.35)' : `${accentColor}35`}`,
                  }}
                >
                  {adopted
                    ? <><Check className="w-3.5 h-3.5" /> Budget kopierad!</>
                    : <><Sparkles className="w-3.5 h-3.5" /> Härma denna budget</>
                  }
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Galaxy Explorer main ───────────────────────────────────────────────────
export default function GalaxyExplorer({ userFinancialProfile }) {
  const [searchText, setSearchText] = useState('');
  const [activeTags, setActiveTags] = useState([]);

  const { data: realProfiles = [] } = useQuery({
    queryKey: ['galaxyProfiles'],
    queryFn: async () => {
      const all = await base44.entities.SocialProfile.list();
      // Only show profiles that are NOT in ghost mode
      return all.filter(p => p.privacy_level !== 'ghost' && p.username);
    }
  });

  const toggleTag = (tag) => {
    setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  // Merge demo + real profiles
  const allProfiles = useMemo(() => {
    const real = realProfiles.map(p => ({
      id: p.id,
      username: p.username,
      display_name: p.username,
      age: p.age,
      occupation: p.occupation || '',
      bio: p.bio || '',
      tags: [p.occupation || ''].filter(Boolean),
      privacy_level: p.privacy_level || 'hybrid',
      avatar_style: p.avatar_style || {},
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
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
        <input
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          placeholder="Sök efter yrke, stad, livsstil..."
          className="w-full rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold outline-none"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
          }}
        />
      </div>

      {/* Tag filters */}
      <div className="flex gap-2 flex-wrap">
        {ALL_TAGS.map(tag => (
          <motion.button key={tag} whileTap={{ scale: 0.9 }}
            onClick={() => toggleTag(tag)}
            className="px-3 py-1 rounded-full text-[10px] font-black transition-all"
            style={{
              background: activeTags.includes(tag) ? 'rgba(15,222,189,0.15)' : 'rgba(255,255,255,0.04)',
              color: activeTags.includes(tag) ? '#0FDEBD' : 'rgba(255,255,255,0.35)',
              border: activeTags.includes(tag) ? '1px solid rgba(15,222,189,0.35)' : '1px solid rgba(255,255,255,0.07)',
            }}>
            {tag}
          </motion.button>
        ))}
      </div>

      {/* Count */}
      <p className="text-[9px] font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.22)' }}>
        {filtered.length} STJÄRNSYSTEM FUNNA
      </p>

      {/* Profile cards */}
      <div className="space-y-3">
        {filtered.map((profile, i) => (
          <GalaxyProfileCard
            key={profile.id}
            profile={profile}
            index={i}
            userFinancialProfile={userFinancialProfile}
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
    </div>
  );
}