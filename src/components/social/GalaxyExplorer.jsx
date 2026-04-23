import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { AvatarSVG } from './avatar/PBREngine';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import ExpandedProfile from './ExpandedProfile';

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
    avatar_config: { skinColor:'#FDBCB4', hair:{style:'short_clean',color:'#3D2B1F'}, outfit:{style:'tshirt',color:'#4B7CF3'}, bg:'#4B7CF3', eyes:{type:'almond',color:'#2D3436'}, eyebrows:{type:'natural'}, eyelashes:{type:'natural'}, nose:{type:'button'}, mouth:{type:'smile',lipColor:'#C48A8A'}, faceShape:'oval', accessory:'none', expression:'neutral' },
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
    avatar_config: { skinColor:'#C68642', hair:{style:'bun_top',color:'#1A0A00'}, outfit:{style:'blazer',color:'#A78BFA'}, bg:'#A78BFA', eyes:{type:'round',color:'#4A7C59'}, eyebrows:{type:'arched'}, eyelashes:{type:'dramatic'}, nose:{type:'narrow'}, mouth:{type:'pouty',lipColor:'#E91E63'}, faceShape:'heart', accessory:'earrings', expression:'happy' },
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
    avatar_config: { skinColor:'#8D5524', hair:{style:'short_clean',color:'#1C1C1C'}, outfit:{style:'hoodie',color:'#0FDEBD'}, bg:'#0FDEBD', eyes:{type:'hooded',color:'#3B2314'}, eyebrows:{type:'thick'}, eyelashes:{type:'none'}, nose:{type:'wide'}, mouth:{type:'smile',lipColor:'#C48A8A'}, faceShape:'square', accessory:'glasses_round', expression:'neutral' },
    finance: {
      income: null,
      items: [
        { label: 'Boende',        pct: 20, color: '#FF4466', icon: '🏠', detail: 'Äger bostadsrätt, liten månadsavgift.' },
        { label: 'Sparande',      pct: 40, color: '#0FDEBD', icon: '📈', detail: 'ISK + IPS för tidig pension.' },
        { label: 'Levnadskostn.', pct: 25, color: '#F6AD55', icon: '🛒', detail: 'Enkel livsstil, matlagning hemma.' },
        { label: 'Övrigt',       pct: 15, color: '#A78BFA', icon: '📦', detail: 'Teknikprylar och semesterfond.' },
      ],
    },
  },
];

const ALL_TAGS = ['Student', 'Egenföretagare', 'Programmerare', 'Designer', 'Höginkomsttagare', 'Stockholm', 'Göteborg', 'Malmö'];

function MiniDonut({ items, size = 44 }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 6;
  let angle = -90;
  const toRad = (d) => (d * Math.PI) / 180;
  const arcs = items.map(item => {
    const deg = Math.max((item.pct / 100) * 360, 2);
    const x1 = cx + r * Math.cos(toRad(angle));
    const y1 = cy + r * Math.sin(toRad(angle));
    const x2 = cx + r * Math.cos(toRad(angle + deg - 1));
    const y2 = cy + r * Math.sin(toRad(angle + deg - 1));
    const path = `M ${x1} ${y1} A ${r} ${r} 0 ${deg > 180 ? 1 : 0} 1 ${x2} ${y2}`;
    angle += deg;
    return { ...item, path };
  });
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
      {arcs.map((a, i) => (
        <path key={i} d={a.path} fill="none" stroke={a.color} strokeWidth="4" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 3px ${a.color}80)` }} />
      ))}
    </svg>
  );
}

function MarketplaceCard({ profile, onOpen, index }) {
  const isHybrid = profile.privacy_level === 'hybrid';
  const accentColor = (profile.avatar_config || profile.avatar_style)?.bg || '#4B7CF3';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 300, damping: 28 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => onOpen(profile)}
      className="cursor-pointer overflow-hidden rounded-2xl flex flex-col"
      style={{
        background: 'rgba(6,9,22,0.9)',
        border: `1px solid ${accentColor}20`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
    >
      {/* Hero area */}
      <div className="relative flex items-center justify-center py-6"
        style={{ background: `radial-gradient(ellipse at 50% 80%, ${accentColor}18 0%, transparent 70%)` }}>
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[8px] font-black"
          style={{
            background: isHybrid ? 'rgba(167,139,250,0.15)' : 'rgba(15,222,189,0.15)',
            color: isHybrid ? '#A78BFA' : '#0FDEBD',
            border: `1px solid ${isHybrid ? 'rgba(167,139,250,0.3)' : 'rgba(15,222,189,0.3)'}`,
          }}>
          {isHybrid ? '% PROCENT' : '🔓 KRONOR'}
        </div>

        <motion.div
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: index * 0.5 }}
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: `${accentColor}20`, border: `2px solid ${accentColor}45`, boxShadow: `0 0 20px ${accentColor}30` }}>
          <AvatarSVG config={profile.avatar_config || profile.avatar_style} size={54} />
        </motion.div>

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
        <div className="mt-1">
          <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black"
            style={{ background: `${accentColor}15`, color: `${accentColor}cc`, border: `1px solid ${accentColor}25` }}>
            {profile.trait}
          </span>
        </div>
        <div className="mt-auto pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-xs font-black" style={{ color: accentColor }}>{profile.main_stat}</p>
        </div>
      </div>
    </motion.div>
  );
}

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
      avatar_config: p.avatar_config || p.avatar_style || {},
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

      <div className="flex gap-2 flex-wrap">
        {ALL_TAGS.map(tag => {
          const active = activeTags.includes(tag);
          return (
            <motion.button key={tag} whileTap={{ scale: 0.88 }} onClick={() => toggleTag(tag)}
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

      <p className="text-[9px] font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.18)' }}>
        {filtered.length} EKONOMISKA PROFILER HITTADE
      </p>

      <div className="grid grid-cols-2 gap-3">
        {filtered.map((profile, i) => (
          <MarketplaceCard key={profile.id} profile={profile} index={i} onOpen={setSelectedProfile} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-2xl mb-2">🌌</p>
          <p className="text-sm font-black" style={{ color: 'rgba(255,255,255,0.3)' }}>Inga galaxer hittades</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.15)' }}>Prova att ändra filter</p>
        </div>
      )}

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