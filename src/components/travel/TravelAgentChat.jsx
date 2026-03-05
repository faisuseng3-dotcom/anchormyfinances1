import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Plane, Loader2, MapPin, Calendar, Wallet, Star, Zap, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';

const formatNumber = (v) => (v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const TAGS = {
  experience: { label: 'Maxad Upplevelse', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  balance: { label: 'Mest Prisvärd', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  safety: { label: 'Säkrast Marginal', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
};

function TripPackageCard({ pkg, onSelect, selected }) {
  const tag = TAGS[pkg.tag];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-4 space-y-3 transition-all cursor-pointer ${
        selected
          ? 'border-indigo-500 bg-indigo-500/10'
          : 'border-white/10 bg-white/5 hover:border-white/20'
      }`}
      onClick={() => onSelect(pkg)}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-bold text-white text-sm">{pkg.name}</h4>
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border mt-1 ${tag.color}`}>
            <Star className="w-3 h-3" />
            {tag.label}
          </span>
        </div>
        <span className="text-indigo-400 font-bold text-lg">{formatNumber(pkg.totalCost)} kr</span>
      </div>

      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          <span><span className="text-slate-500">Boende:</span> {pkg.accommodation} — <span className="text-white font-medium">{formatNumber(pkg.accommodationCost)} kr</span></span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span><span className="text-slate-500">Aktiviteter:</span> {pkg.activities} — <span className="text-white font-medium">{formatNumber(pkg.activitiesCost)} kr</span></span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <Wallet className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span><span className="text-slate-500">Marginal kvar:</span> <span className={`font-medium ${pkg.margin < 500 ? 'text-rose-400' : 'text-emerald-400'}`}>{formatNumber(pkg.margin)} kr</span></span>
        </div>
      </div>

      <div className="text-xs italic text-slate-400 bg-white/5 rounded-xl px-3 py-2">
        💬 {pkg.aiComment}
      </div>

      <Button
        size="sm"
        onClick={(e) => { e.stopPropagation(); onSelect(pkg); }}
        className={`w-full h-9 rounded-xl text-xs font-medium transition-all ${
          selected
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
            : 'bg-white/10 hover:bg-indigo-500/30 text-white'
        }`}
      >
        {selected ? <><CheckCircle className="w-3.5 h-3.5 mr-1.5" />Vald plan</> : 'Välj denna plan →'}
      </Button>
    </motion.div>
  );
}

function TripTimeline({ tripData }) {
  if (!tripData?.dates?.length) return null;
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-indigo-400" />
        <span className="text-sm font-semibold text-white">Reseplan: {tripData.destination}</span>
      </div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {tripData.dates.map((d, i) => (
          <div key={i} className={`flex-shrink-0 rounded-xl px-3 py-2 text-xs text-center min-w-[70px] ${
            d.highlight ? 'bg-indigo-500/30 border border-indigo-500/50' : 'bg-white/5 border border-white/10'
          }`}>
            <div className="text-slate-400 text-[10px]">{d.label}</div>
            <div className="text-white font-medium mt-0.5">{d.event}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BudgetCheckCard({ analysis }) {
  if (!analysis) return null;
  const tight = analysis.marginPerDay < 200;
  return (
    <div className={`rounded-2xl p-4 border ${tight ? 'bg-rose-500/10 border-rose-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
      <h4 className="text-sm font-bold text-white mb-2">💡 CFO-koll</h4>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {analysis.breakdown.map((item, i) => (
          <div key={i} className="bg-white/10 rounded-xl p-2 text-center">
            <div className="text-xs text-slate-400">{item.label}</div>
            <div className="text-white font-bold text-sm">{formatNumber(item.amount)} kr</div>
          </div>
        ))}
      </div>
      <p className={`text-xs font-medium ${tight ? 'text-rose-300' : 'text-emerald-300'}`}>
        {analysis.verdict}
      </p>
    </div>
  );
}

export default function TravelAgentChat({ profile }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '✈️ Hej! Jag är din **Anchor Travel Agent**. Beskriv din resa — destination, datum, budget och vad du vill göra. Jag analyserar och bygger tre skräddarsydda resplaner åt dig!',
      type: 'text'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [goalSaved, setGoalSaved] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

Steg 2 – Generera EXAKT 3 respaket (packages). Alla ska rymmas inom den angivna totala budgeten. Prisnivåer ska spegla verkligheten för destinationen.

Steg 3 – Budget-koll: Beräkna marginalen per dag och ge ett CFO-omdöme.

Svara med JSON:

{
  "analysis": {
    "destination": "string",
    "dates": "string",
    "nights": number,
    "totalBudget": number,
    "activityBudget": number,
    "summary": "string"
  },
  "timeline": {
    "destination": "string",
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
      "name": "The Urban Explorer",
      "tag": "experience",
      "accommodation": "Steel House Copenhagen (sovsal)",
      "accommodationCost": 1800,
      "activities": "Tivoli + Street Food Tour + Christiania-cyklar",
      "activitiesCost": 3000,
      "otherCosts": 500,
      "totalCost": 5300,
      "margin": 1700,
      "aiComment": "Perfekt för dig som vill uppleva allt av staden!"
    },
    {
      "id": "chill",
      "name": "The Smart Chill",
      "tag": "balance",
      "accommodation": "CityHub Cabin-room",
      "accommodationCost": 3200,
      "activities": "Kanalturné + Glyptoteket + dansk middag",
      "activitiesCost": 2500,
      "otherCosts": 300,
      "totalCost": 6000,
      "margin": 1000,
      "aiComment": "Bra balans mellan privatliv och upplevelser!"
    },
    {
      "id": "ninja",
      "name": "The Budget Ninja",
      "tag": "safety",
      "accommodation": "Zleep Hotel",
      "accommodationCost": 2500,
      "activities": "Gratis stadsvandring + Reffen",
      "activitiesCost": 2000,
      "otherCosts": 200,
      "totalCost": 4700,
      "margin": 2300,
      "aiComment": "Du kommer hem med pengar kvar — lugnt och smart!"
    }
  ],
  "budgetCheck": {
    "breakdown": [
      { "label": "Boende", "amount": 3200 },
      { "label": "Aktiviteter", "amount": 2500 },
      { "label": "Marginal", "amount": 1300 }
    ],
    "marginPerDay": 260,
    "verdict": "Du har ca 260 kr/dag i marginal. Det är ganska tajt för Köpenhamn — välj 'Budget Ninja' om du vill ha säkerhetsmarginal!"
  },
  "goalName": "Danmarksresa",
  "goalEndDate": "2026-03-12"
}

Anpassa all data (priser, datum, platsnamn, kommentarer) efter vad användaren faktiskt frågade om. Använd realistiska prisnivåer.`;

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

    const newMessages = [];

    // Step 1: Analysis
    newMessages.push({
      role: 'assistant',
      type: 'analysis',
      content: result.analysis?.summary || '',
      analysis: result.analysis
    });

    // Step 2: Timeline
    newMessages.push({
      role: 'assistant',
      type: 'timeline',
      timeline: result.timeline
    });

    // Step 3: Packages
    newMessages.push({
      role: 'assistant',
      type: 'packages',
      packages: result.packages,
      goalName: result.goalName,
      goalEndDate: result.goalEndDate
    });

    // Step 4: Budget check
    newMessages.push({
      role: 'assistant',
      type: 'budgetcheck',
      budgetCheck: result.budgetCheck
    });

    setMessages(prev => [...prev, ...newMessages]);
    setLoading(false);
  };

  const handleSelectPackage = (pkg) => {
    setSelectedPkg(pkg);
  };

  const handleSaveGoal = async () => {
    if (!selectedPkg || goalSaved) return;
    const lastPackageMsg = [...messages].reverse().find(m => m.type === 'packages');
    const goalName = lastPackageMsg?.goalName || selectedPkg.name;
    const endDate = lastPackageMsg?.goalEndDate || '';

    const profiles = await base44.entities.FinancialProfile.list();
    if (profiles.length > 0) {
      const p = profiles[0];
      await base44.entities.FinancialProfile.update(p.id, {
        savingsGoalName: goalName,
        savingsGoal: selectedPkg.totalCost,
      });
    }

    setGoalSaved(true);
    setMessages(prev => [...prev, {
      role: 'assistant',
      type: 'text',
      content: `✅ Sparmålet **"${goalName}"** har skapats på din Dashboard med ett mål på **${formatNumber(selectedPkg.totalCost)} kr**! Du hittar det i din ekonomiska översikt.`
    }]);
  };

  const renderMessage = (msg, i) => {
    if (msg.role === 'user') {
      return (
        <div key={i} className="flex justify-end">
          <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] text-sm">
            {msg.content}
          </div>
        </div>
      );
    }

    if (msg.type === 'text') {
      return (
        <div key={i} className="flex gap-3">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-1">
            <Plane className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="bg-white/8 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] text-sm text-slate-200 leading-relaxed">
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
        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-1">
              <Plane className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-indigo-400 font-semibold mb-1 uppercase tracking-wide">Steg 1 · Smart Analys</div>
              <div className="bg-white/8 border border-white/10 rounded-2xl p-4 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {a?.destination && <div className="bg-white/5 rounded-xl p-2 text-xs"><span className="text-slate-400">Destination</span><div className="text-white font-medium mt-0.5">{a.destination}</div></div>}
                  {a?.dates && <div className="bg-white/5 rounded-xl p-2 text-xs"><span className="text-slate-400">Datum</span><div className="text-white font-medium mt-0.5">{a.dates}</div></div>}
                  {a?.totalBudget && <div className="bg-white/5 rounded-xl p-2 text-xs"><span className="text-slate-400">Total budget</span><div className="text-white font-medium mt-0.5">{formatNumber(a.totalBudget)} kr</div></div>}
                  {a?.activityBudget && <div className="bg-white/5 rounded-xl p-2 text-xs"><span className="text-slate-400">Aktivitetsbudget</span><div className="text-white font-medium mt-0.5">{formatNumber(a.activityBudget)} kr</div></div>}
                </div>
                {msg.content && <p className="text-sm text-slate-300 pt-1">{msg.content}</p>}
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    if (msg.type === 'timeline') {
      return (
        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="ml-10">
          <div className="text-xs text-indigo-400 font-semibold mb-1 uppercase tracking-wide">Steg 2 · Reseplan</div>
          <TripTimeline tripData={msg.timeline} />
        </motion.div>
      );
    }

    if (msg.type === 'packages') {
      return (
        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="ml-10 space-y-3">
          <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wide">Dina 3 resvägar</div>
          {(msg.packages || []).map((pkg, pi) => (
            <TripPackageCard
              key={pi}
              pkg={pkg}
              selected={selectedPkg?.id === pkg.id}
              onSelect={handleSelectPackage}
            />
          ))}
          {selectedPkg && !goalSaved && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button
                onClick={handleSaveGoal}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-medium"
              >
                ✨ Skapa sparmål för "{selectedPkg.name}" — {formatNumber(selectedPkg.totalCost)} kr
              </Button>
            </motion.div>
          )}
        </motion.div>
      );
    }

    if (msg.type === 'budgetcheck') {
      return (
        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="ml-10">
          <div className="text-xs text-indigo-400 font-semibold mb-1 uppercase tracking-wide">Steg 3 · Budget-koll</div>
          <BudgetCheckCard analysis={msg.budgetCheck} />
        </motion.div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map(renderMessage)}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
            </div>
            <div className="bg-white/8 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-slate-400">
              Analyserar din resa...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-3 border-t border-white/10">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Beskriv din resa... t.ex. 'Köpenhamn 12–16 mars, 7000 kr budget, aktiviteter den 14–15'"
          className="flex-1 bg-white/8 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="h-12 w-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}