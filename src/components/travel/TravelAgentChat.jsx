import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Send, Plane, Loader2, MapPin, Calendar, Wallet, Star, Zap, CheckCircle, Hotel, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';

const formatNumber = (v) => (v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// Destination hero images (Unsplash, Nyhavn / Copenhagen)
const DEST_IMAGES = {
  default: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=800&q=80',
  copenhagen: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=800&q=80',
  stockholm: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=800&q=80',
  london: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  berlin: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&q=80',
};

const VIBE_THEMES = {
  experience: {
    emoji: '🎒',
    vibe: 'The Urban Backpacker',
    gradient: 'from-orange-600 to-rose-600',
    glow: 'rgba(234,88,12,0.3)',
    tag: 'Maxad Upplevelse',
    tagColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  },
  balance: {
    emoji: '🏛️',
    vibe: 'The Cultural Strategist',
    gradient: 'from-blue-600 to-indigo-600',
    glow: 'rgba(59,130,246,0.3)',
    tag: 'Mest Prisvärd',
    tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  },
  safety: {
    emoji: '🥂',
    vibe: 'The Copenhagen High-Life',
    gradient: 'from-purple-600 to-pink-600',
    glow: 'rgba(147,51,234,0.3)',
    tag: 'Säkrast Marginal',
    tagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  },
};

// Mini donut chart for budget split
function BudgetDonut({ accommodationCost, activitiesCost, otherCosts, totalCost }) {
  const size = 64;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const acc = ((accommodationCost || 0) / totalCost) * circ;
  const act = ((activitiesCost || 0) / totalCost) * circ;
  const oth = Math.max(0, circ - acc - act);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
      {/* Accommodation */}
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="#6366f1" strokeWidth={stroke}
        strokeDasharray={`${acc} ${circ - acc}`}
        strokeDashoffset={circ * 0.25}
        strokeLinecap="round"
      />
      {/* Activities */}
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="#f59e0b" strokeWidth={stroke}
        strokeDasharray={`${act} ${circ - act}`}
        strokeDashoffset={circ * 0.25 - acc}
        strokeLinecap="round"
      />
      {/* Other */}
      {oth > 0 && (
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="#10b981" strokeWidth={stroke}
          strokeDasharray={`${oth} ${circ - oth}`}
          strokeDashoffset={circ * 0.25 - acc - act}
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

// Individual Discovery Card
function DiscoveryCard({ pkg, destImage, selected, onSelect, index }) {
  const theme = VIBE_THEMES[pkg.tag] || VIBE_THEMES.balance;
  const [expanded, setExpanded] = useState(false);

  const handleChoose = (e) => {
    e.stopPropagation();
    setExpanded(true);
    onSelect(pkg);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{
        opacity: 1, y: 0, scale: selected ? 1.02 : 1,
        boxShadow: selected ? `0 0 32px ${theme.glow}` : '0 4px 20px rgba(0,0,0,0.3)'
      }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 300, damping: 25 }}
      className={`rounded-2xl overflow-hidden border cursor-pointer transition-all ${
        selected ? 'border-white/30' : 'border-white/10'
      }`}
      onClick={() => onSelect(pkg)}
    >
      {/* Hero image */}
      <div className="relative h-36 overflow-hidden">
        <img
          src={destImage}
          alt={pkg.accommodation}
          className="w-full h-full object-cover"
          style={{ filter: selected ? 'brightness(0.85)' : 'brightness(0.65)' }}
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${theme.gradient} opacity-40`} />
        {/* Vibe overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-2xl">{theme.emoji}</span>
              <div className="text-white font-bold text-sm leading-tight mt-0.5">{theme.vibe}</div>
              <div className="text-white/70 text-xs">{pkg.name}</div>
            </div>
            <div className="text-right">
              <div className="text-white font-black text-xl">{formatNumber(pkg.totalCost)}</div>
              <div className="text-white/70 text-xs">kr totalt</div>
            </div>
          </div>
        </div>
        {/* Tag badge */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border backdrop-blur-sm ${theme.tagColor}`}>
            <Star className="w-2.5 h-2.5" />
            {theme.tag}
          </span>
        </div>
        {selected && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30">
              <CheckCircle className="w-2.5 h-2.5" />
              Vald
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className={`p-4 space-y-3 ${selected ? `bg-gradient-to-b ${theme.gradient} bg-opacity-10` : 'bg-[#1a2235]'}`}>
        {/* Budget donut + breakdown */}
        <div className="flex items-center gap-4">
          <BudgetDonut
            accommodationCost={pkg.accommodationCost}
            activitiesCost={pkg.activitiesCost}
            otherCosts={pkg.otherCosts}
            totalCost={pkg.totalCost}
          />
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-400"><span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"/>Boende</span>
              <span className="text-white font-medium">{formatNumber(pkg.accommodationCost)} kr</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-400"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"/>Aktiviteter</span>
              <span className="text-white font-medium">{formatNumber(pkg.activitiesCost)} kr</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-400"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>Marginal</span>
              <span className={`font-medium ${pkg.margin < 500 ? 'text-rose-400' : 'text-emerald-400'}`}>{formatNumber(pkg.margin)} kr</span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-1.5 text-xs border-t border-white/5 pt-3">
          <div className="flex items-start gap-2 text-slate-300">
            <Hotel className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
            <span>{pkg.accommodation}</span>
          </div>
          <div className="flex items-start gap-2 text-slate-300">
            <Zap className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
            <span>{pkg.activities}</span>
          </div>
        </div>

        {/* AI comment */}
        <div className="text-xs italic text-slate-400 bg-white/5 rounded-xl px-3 py-2">
          {theme.emoji} {pkg.aiComment}
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleChoose}
          className={`w-full h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            selected
              ? `bg-gradient-to-r ${theme.gradient} text-white shadow-lg`
              : 'bg-white/8 hover:bg-white/15 text-white border border-white/10'
          }`}
        >
          {selected ? (
            <><CheckCircle className="w-3.5 h-3.5" />Vald plan ✓</>
          ) : (
            <>Välj denna plan <Plane className="w-3.5 h-3.5" /></>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

// Swipeable card carousel
function DiscoveryCarousel({ packages, selectedPkg, onSelect, destination }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const destKey = Object.keys(DEST_IMAGES).find(k => destination?.toLowerCase().includes(k)) || 'default';
  const destImage = DEST_IMAGES[destKey];

  const prev = () => setActiveIndex(i => Math.max(0, i - 1));
  const next = () => setActiveIndex(i => Math.min(packages.length - 1, i + 1));

  return (
    <div className="space-y-3">
      {/* Dot indicators + navigation */}
      <div className="flex items-center justify-between px-1">
        <button onClick={prev} disabled={activeIndex === 0} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center disabled:opacity-30">
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
        <div className="flex gap-1.5">
          {packages.map((_, i) => (
            <button key={i} onClick={() => setActiveIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === activeIndex ? 'w-6 bg-indigo-400' : 'w-1.5 bg-white/20'}`}
            />
          ))}
        </div>
        <button onClick={next} disabled={activeIndex === packages.length - 1} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center disabled:opacity-30">
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Active card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <DiscoveryCard
            pkg={packages[activeIndex]}
            destImage={destImage}
            selected={selectedPkg?.id === packages[activeIndex]?.id}
            onSelect={onSelect}
            index={0}
          />
        </motion.div>
      </AnimatePresence>

      {/* Comparison mini-table */}
      <div className="rounded-2xl border border-white/8 overflow-hidden">
        <div className="grid grid-cols-4 text-xs bg-white/5 px-3 py-2 text-slate-400 font-medium">
          <span>Alternativ</span>
          <span className="text-center">Boende</span>
          <span className="text-center">Aktiviteter</span>
          <span className="text-center">Fickpeng/dag</span>
        </div>
        {packages.map((pkg, i) => {
          const theme = VIBE_THEMES[pkg.tag] || VIBE_THEMES.balance;
          const nights = 4; // approximate
          const pocketMoney = Math.round((pkg.margin) / nights);
          return (
            <div
              key={i}
              onClick={() => { setActiveIndex(i); onSelect(pkg); }}
              className={`grid grid-cols-4 text-xs px-3 py-2.5 cursor-pointer transition-all border-t border-white/5 ${
                selectedPkg?.id === pkg.id ? 'bg-indigo-500/10' : 'hover:bg-white/5'
              }`}
            >
              <span className="text-white font-medium flex items-center gap-1">{theme.emoji} Alt {i+1}</span>
              <span className="text-center text-slate-300">{formatNumber(pkg.accommodationCost)}</span>
              <span className="text-center text-slate-300">{formatNumber(pkg.activitiesCost)}</span>
              <span className={`text-center font-medium ${pocketMoney < 150 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {formatNumber(pocketMoney)} kr
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// CFO status bubble
function CFOBubble({ budgetCheck }) {
  if (!budgetCheck) return null;
  const tight = budgetCheck.marginPerDay < 200;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: 20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      className={`flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-semibold ${
        tight
          ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
          : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
      }`}
      style={{ boxShadow: tight ? '0 0 12px rgba(239,68,68,0.2)' : '0 0 12px rgba(16,185,129,0.2)' }}
    >
      <div className={`w-2 h-2 rounded-full ${tight ? 'bg-rose-400' : 'bg-emerald-400'}`}
        style={{ boxShadow: tight ? '0 0 6px rgba(239,68,68,0.8)' : '0 0 6px rgba(16,185,129,0.8)' }}
      />
      <TrendingUp className="w-3 h-3" />
      {tight ? `Tajt! ${formatNumber(budgetCheck.marginPerDay)} kr/dag` : `OK • ${formatNumber(budgetCheck.marginPerDay)} kr/dag`}
    </motion.div>
  );
}

// Loading thinking animation
function ThinkingBubble() {
  const icons = [Plane, Hotel, Wallet];
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
        <Loader2 className="w-4 h-4 text-white animate-spin" />
      </div>
      <div className="flex-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">Analyserar din resa...</div>
        <div className="flex gap-3">
          {icons.map((Icon, i) => (
            <motion.div
              key={i}
              animate={{ y: [-4, 0, -4], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              className="w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center"
            >
              <Icon className="w-4 h-4 text-indigo-400" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TravelAgentChat({ profile }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '✈️ Hej! Jag är din **Anchor Travel Agent**. Beskriv din resa — destination, datum, budget och vad du vill göra. Jag bygger tre skräddarsydda resplaner åt dig!',
      type: 'text'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [goalSaved, setGoalSaved] = useState(false);
  const [latestBudgetCheck, setLatestBudgetCheck] = useState(null);
  const [latestDestination, setLatestDestination] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg, type: 'text' }]);
    setLoading(true);
    setSelectedPkg(null);
    setGoalSaved(false);

    const income = profile?.income || 0;
    const fixedCosts = (profile?.housingCost || 0) +
      (profile?.subscriptions || []).reduce((s, x) => s + x.amount, 0) +
      (profile?.loans || []).reduce((s, x) => s + x.monthlyPayment, 0);
    const margin = income - fixedCosts;

    const prompt = `Du är "Anchor Travel Agent", en smart rese-AI med CFO-instinkt.

Användaren skriver: "${userMsg}"

Användarens ekonomi:
- Månadsinkomst: ${income} kr
- Månatlig marginal: ${margin} kr
- Buffert: ${profile?.buffer || 0} kr

Steg 1 – Smart Analys: Identifiera destination, datum, antal nätter, total budget, eventuell aktivitetsbudget.

Steg 2 – Generera EXAKT 3 respaket. De ska ha id:n "explorer", "chill", "ninja" och tags "experience", "balance", "safety". Namnge dem gärna med "vibe"-känsla. Alla ska rymmas inom angivna budget. Använd REALISTISKA prisnivåer för destinationen i mars 2026.

Steg 3 – Budget-koll: Beräkna marginalen per dag.

Svara med JSON:

{
  "analysis": {
    "destination": "Köpenhamn, Danmark",
    "dates": "12–16 mars",
    "nights": 4,
    "totalBudget": 7000,
    "activityBudget": 3000,
    "summary": "Kort sammanfattning av vad vi hittade"
  },
  "timeline": {
    "destination": "Köpenhamn",
    "dates": [
      { "label": "12 mar", "event": "Ankomst", "highlight": false },
      { "label": "13 mar", "event": "Utforska", "highlight": false },
      { "label": "14 mar", "event": "Aktiviteter", "highlight": true },
      { "label": "15 mar", "event": "Aktiviteter", "highlight": true },
      { "label": "16 mar", "event": "Hemresa", "highlight": false }
    ]
  },
  "packages": [
    {
      "id": "explorer",
      "name": "The Urban Backpacker",
      "tag": "experience",
      "accommodation": "Steel House Copenhagen (sovsal)",
      "accommodationCost": 1800,
      "activities": "Tivoli + Street Food Tour + Christiania-cyklar",
      "activitiesCost": 3000,
      "otherCosts": 500,
      "totalCost": 5300,
      "margin": 1700,
      "aiComment": "Energi, folkliv och sena kvällar – perfekt för den äventyrslystne!"
    },
    {
      "id": "chill",
      "name": "The Cultural Strategist",
      "tag": "balance",
      "accommodation": "CityHub Cabin-room",
      "accommodationCost": 3200,
      "activities": "Kanalturné + Glyptoteket + dansk middag",
      "activitiesCost": 2500,
      "otherCosts": 300,
      "totalCost": 6000,
      "margin": 1000,
      "aiComment": "Museum, bra kaffe och smarta kulturval – den balanserade resenären!"
    },
    {
      "id": "ninja",
      "name": "The Copenhagen High-Life",
      "tag": "safety",
      "accommodation": "Zleep Hotel",
      "accommodationCost": 2500,
      "activities": "Nyhavn-middag + Designmuseet + kanalbåt",
      "activitiesCost": 2200,
      "otherCosts": 300,
      "totalCost": 5000,
      "margin": 2000,
      "aiComment": "Kvalitet över kvantitet – en lyxmiddag och de bästa upplevelserna!"
    }
  ],
  "budgetCheck": {
    "breakdown": [
      { "label": "Boende", "amount": 2500 },
      { "label": "Aktiviteter", "amount": 2500 },
      { "label": "Marginal", "amount": 2000 }
    ],
    "marginPerDay": 400,
    "verdict": "Du har ca 400 kr/dag kvar – bra marginal för Köpenhamn!"
  },
  "goalName": "Köpenhamnsresa",
  "goalEndDate": "2026-03-12"
}

Anpassa ALL data (priser, platsnamn, datum, kommentarer) efter vad användaren faktiskt frågade om!`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          analysis: { type: 'object' },
          timeline: { type: 'object' },
          packages: { type: 'array' },
          budgetCheck: { type: 'object' },
          goalName: { type: 'string' },
          goalEndDate: { type: 'string' }
        }
      }
    });

    setLatestBudgetCheck(result.budgetCheck);
    setLatestDestination(result.analysis?.destination || '');

    setMessages(prev => [...prev,
      { role: 'assistant', type: 'analysis', content: result.analysis?.summary || '', analysis: result.analysis },
      { role: 'assistant', type: 'timeline', timeline: result.timeline },
      { role: 'assistant', type: 'packages', packages: result.packages, goalName: result.goalName, goalEndDate: result.goalEndDate, destination: result.analysis?.destination },
      { role: 'assistant', type: 'budgetcheck', budgetCheck: result.budgetCheck }
    ]);

    setLoading(false);
  };

  const handleSaveGoal = async () => {
    if (!selectedPkg || goalSaved) return;
    const lastPkgMsg = [...messages].reverse().find(m => m.type === 'packages');
    const goalName = lastPkgMsg?.goalName || selectedPkg.name;

    const profiles = await base44.entities.FinancialProfile.list();
    if (profiles.length > 0) {
      await base44.entities.FinancialProfile.update(profiles[0].id, {
        savingsGoalName: goalName,
        savingsGoal: selectedPkg.totalCost,
      });
    }

    setGoalSaved(true);
    setMessages(prev => [...prev, {
      role: 'assistant', type: 'text',
      content: `✅ Sparmålet **"${goalName}"** har skapats på din Dashboard med ett mål på **${formatNumber(selectedPkg.totalCost)} kr**! Bon voyage! ✈️`
    }]);
  };

  const renderMessage = (msg, i) => {
    if (msg.role === 'user') {
      return (
        <div key={i} className="flex justify-end">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] text-sm shadow-lg shadow-indigo-500/20">
            {msg.content}
          </div>
        </div>
      );
    }

    if (msg.type === 'text') {
      return (
        <div key={i} className="flex gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-blue-500/20">
            <Plane className="w-4 h-4 text-white" />
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] text-sm text-slate-200 leading-relaxed">
            {msg.content.split('**').map((part, j) =>
              j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : part
            )}
          </div>
        </div>
      );
    }

    if (msg.type === 'analysis') {
      const a = msg.analysis;
      return (
        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-blue-500/20">
            <Plane className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] text-indigo-400 font-bold mb-1.5 uppercase tracking-widest">Steg 1 · Smart Analys</div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {a?.destination && <div className="bg-white/5 rounded-xl p-2.5 text-xs"><div className="text-slate-500 mb-0.5">Destination</div><div className="text-white font-semibold">{a.destination}</div></div>}
                {a?.dates && <div className="bg-white/5 rounded-xl p-2.5 text-xs"><div className="text-slate-500 mb-0.5">Datum</div><div className="text-white font-semibold">{a.dates}</div></div>}
                {a?.totalBudget && <div className="bg-white/5 rounded-xl p-2.5 text-xs"><div className="text-slate-500 mb-0.5">Total budget</div><div className="text-white font-semibold">{formatNumber(a.totalBudget)} kr</div></div>}
                {a?.activityBudget && <div className="bg-white/5 rounded-xl p-2.5 text-xs"><div className="text-slate-500 mb-0.5">Aktivitetsbudget</div><div className="text-white font-semibold">{formatNumber(a.activityBudget)} kr</div></div>}
              </div>
              {msg.content && <p className="text-sm text-slate-300 pt-1 border-t border-white/5">{msg.content}</p>}
            </div>
          </div>
        </motion.div>
      );
    }

    if (msg.type === 'timeline') {
      if (!msg.timeline?.dates?.length) return null;
      return (
        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="ml-11">
          <div className="text-[10px] text-indigo-400 font-bold mb-1.5 uppercase tracking-widest">Steg 2 · Reseplan</div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-sm font-semibold text-white">{msg.timeline.destination}</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {msg.timeline.dates.map((d, di) => (
                <div key={di} className={`flex-shrink-0 rounded-xl px-3 py-2.5 text-center min-w-[72px] ${
                  d.highlight
                    ? 'bg-indigo-500/30 border border-indigo-400/50 shadow-sm shadow-indigo-500/20'
                    : 'bg-white/5 border border-white/8'
                }`}>
                  <div className="text-slate-400 text-[10px]">{d.label}</div>
                  <div className="text-white font-medium text-xs mt-0.5">{d.event}</div>
                  {d.highlight && <div className="mt-1 text-indigo-300 text-[9px]">★</div>}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      );
    }

    if (msg.type === 'packages') {
      return (
        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="ml-11 space-y-3">
          <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Dina 3 resvägar</div>
          <DiscoveryCarousel
            packages={msg.packages || []}
            selectedPkg={selectedPkg}
            onSelect={setSelectedPkg}
            destination={msg.destination || latestDestination}
          />
          <AnimatePresence>
            {selectedPkg && !goalSaved && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Button
                  onClick={handleSaveGoal}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-bold text-sm shadow-lg shadow-indigo-500/30"
                >
                  ✨ Skapa sparmål — {selectedPkg.name} · {formatNumber(selectedPkg.totalCost)} kr
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      );
    }

    if (msg.type === 'budgetcheck') {
      if (!msg.budgetCheck) return null;
      const tight = msg.budgetCheck.marginPerDay < 200;
      return (
        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="ml-11">
          <div className="text-[10px] text-indigo-400 font-bold mb-1.5 uppercase tracking-widest">Steg 3 · Budget-koll</div>
          <div className={`rounded-2xl p-4 border ${tight ? 'bg-rose-500/8 border-rose-500/25' : 'bg-emerald-500/8 border-emerald-500/25'}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${tight ? 'bg-rose-400' : 'bg-emerald-400'}`}
                style={{ boxShadow: tight ? '0 0 6px rgba(239,68,68,0.8)' : '0 0 6px rgba(16,185,129,0.8)' }}
              />
              <span className="text-sm font-bold text-white">CFO-koll</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {msg.budgetCheck.breakdown?.map((item, bi) => (
                <div key={bi} className="bg-white/8 rounded-xl p-2 text-center">
                  <div className="text-[10px] text-slate-400">{item.label}</div>
                  <div className="text-white font-bold text-sm">{formatNumber(item.amount)} kr</div>
                </div>
              ))}
            </div>
            <p className={`text-xs font-medium ${tight ? 'text-rose-300' : 'text-emerald-300'}`}>
              {msg.budgetCheck.verdict}
            </p>
          </div>
        </motion.div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] min-h-[520px]">
      {/* CFO status bubble — floats top right when active */}
      <AnimatePresence>
        {latestBudgetCheck && (
          <div className="flex justify-end mb-3">
            <CFOBubble budgetCheck={latestBudgetCheck} />
          </div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1">
        {messages.map(renderMessage)}
        {loading && <ThinkingBubble />}
        <div ref={bottomRef} />
      </div>

      {/* Glassmorphism input */}
      <div className="pt-3 border-t border-white/8">
        <div className="relative flex gap-2 items-end">
          <div className="flex-1 relative">
            {/* Floating icons when loading */}
            <AnimatePresence>
              {loading && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex gap-2 z-10 pointer-events-none">
                  {[Plane, Hotel, Wallet].map((Icon, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5], y: [-4, 0, -4] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                    >
                      <Icon className="w-4 h-4 text-indigo-400" />
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Beskriv din resa... t.ex. 'Köpenhamn 12–16 mars, 7000 kr, aktiviteter den 14–15'"
              rows={2}
              className="w-full resize-none bg-white/8 backdrop-blur-xl border border-white/15 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/20 transition-all"
              style={{ backdropFilter: 'blur(20px)' }}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 flex-shrink-0 shadow-lg shadow-indigo-500/30 disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[10px] text-slate-600 mt-1.5 px-1">↵ Enter för att skicka · Shift+Enter för ny rad</p>
      </div>
    </div>
  );
}