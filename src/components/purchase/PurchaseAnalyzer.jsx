import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Upload, Loader2, CheckCircle, ShoppingBag, Clock, TrendingDown, Star, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';

const fmt = (v) => Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const VERDICT_STYLE = {
  'Köp':           { color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', emoji: '✅' },
  'Vänta':         { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)', emoji: '⏳' },
  'Hitta billigare': { color: '#6366F1', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.3)', emoji: '🔍' },
};

export default function PurchaseAnalyzer({ profile }) {
  const [url, setUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [result, setResult] = useState(null);
  const fileRef = useRef();

  const handleImageChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
    setUrl('');
  };

  const handleAnalyze = async () => {
    if (!url && !imageFile) return;
    setLoading(true);
    setResult(null);

    const steps = [
      'Identifierar objektet...',
      'Söker marknadspris...',
      'Beräknar ekonomisk påverkan...',
      'Genererar AI-omdöme...',
    ];
    for (const msg of steps) {
      setLoadingMsg(msg);
      await new Promise(r => setTimeout(r, 700));
    }

    const income = profile?.income || 30000;
    const housing = profile?.housingCost || 10000;
    const subs = (profile?.subscriptions || []).reduce((s, x) => s + x.amount, 0);
    const margin = income - housing - subs;

    let fileUrls = [];
    if (imageFile) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: imageFile });
      fileUrls = [file_url];
    }

    const prompt = `Du är en ekonomisk AI-assistent i en personlig finans-app.
${url ? `Användaren har klistrat in denna URL: ${url}` : 'Användaren har laddat upp en bild på en produkt/prislapp.'}

Analysera detta köp och ge svar i detta exakta JSON-format:
{
  "productName": "Produktnamn och modell",
  "price": 4500,
  "category": "möbel|elektronik|fordon|kläder|övrigt",
  "priceAssessment": "Bra pris|Högt pris|Normalt pris",
  "verdict": "Köp|Vänta|Hitta billigare",
  "verdictReason": "En mening om varför",
  "budgetImpact": 18,
  "daysDelayedGoal": 14,
  "opportunityCost": "Vad du istället kunde spara/köpa",
  "aiInsight": "Personlig reflektion baserat på ekonomin (2-3 meningar, SVENSKA)",
  "maintenanceCost": 0,
  "maintenanceNote": "Om det finns löpande kostnader"
}

Användarens ekonomi: Inkomst ${income} kr, Marginal ${margin} kr/mån.
Svara ENDAST med JSON, inget annat.`;

    const res = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: !!url,
      response_json_schema: {
        type: 'object',
        properties: {
          productName: { type: 'string' },
          price: { type: 'number' },
          category: { type: 'string' },
          priceAssessment: { type: 'string' },
          verdict: { type: 'string' },
          verdictReason: { type: 'string' },
          budgetImpact: { type: 'number' },
          daysDelayedGoal: { type: 'number' },
          opportunityCost: { type: 'string' },
          aiInsight: { type: 'string' },
          maintenanceCost: { type: 'number' },
          maintenanceNote: { type: 'string' },
        }
      },
      file_urls: fileUrls.length > 0 ? fileUrls : null,
    });

    setResult({ ...res, margin });
    setLoading(false);
  };

  const vs = result ? (VERDICT_STYLE[result.verdict] || VERDICT_STYLE['Vänta']) : null;

  return (
    <div className="space-y-4">
      {/* Input area */}
      <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(17,24,39,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Klistra in länk eller ladda upp bild</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="https://blocket.se/..."
              value={url}
              onChange={(e) => { setUrl(e.target.value); setImageFile(null); setImagePreview(null); }}
              className="pl-9 h-11 rounded-xl text-sm"
            />
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <Upload className="w-4 h-4 text-slate-400" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </div>

        {imagePreview && (
          <div className="relative">
            <img src={imagePreview} alt="Uppladdad bild" className="w-full max-h-32 object-cover rounded-xl" />
            <button
              onClick={() => { setImageFile(null); setImagePreview(null); }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center"
            >✕</button>
          </div>
        )}

        <Button
          onClick={handleAnalyze}
          disabled={(!url && !imageFile) || loading}
          className="w-full h-11 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {loadingMsg}</>
          ) : (
            <><ShoppingBag className="w-4 h-4 mr-2" /> Analysera köpet</>
          )}
        </Button>
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Product header */}
            <div className="rounded-2xl p-4" style={{ background: 'rgba(17,24,39,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-bold text-white">{result.productName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{result.priceAssessment}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-bold text-white">{fmt(result.price)} kr</p>
                </div>
              </div>

              {/* Impact-o-meter */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Budgetpåverkan</span>
                  <span className="text-rose-400 font-semibold">{result.budgetImpact}% av marginalen</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(result.budgetImpact, 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: result.budgetImpact > 50 ? '#EF4444' : result.budgetImpact > 25 ? '#F59E0B' : '#10B981' }}
                  />
                </div>
              </div>
            </div>

            {/* Before/After bars */}
            <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(17,24,39,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ekonomi före vs efter</p>
              {[
                { label: 'Innan köp', value: result.margin, max: result.margin, color: '#10B981' },
                { label: 'Efter köp', value: Math.max(result.margin - result.price, 0), max: result.margin, color: result.margin - result.price < 0 ? '#EF4444' : '#F59E0B' },
              ].map(bar => (
                <div key={bar.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{bar.label}</span>
                    <span className="font-semibold text-white">{fmt(bar.value)} kr kvar</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((bar.value / bar.max) * 100, 100)}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full rounded-full"
                      style={{ background: bar.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Opportunity cost & goal delay */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <Clock className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{result.daysDelayedGoal}d</p>
                <p className="text-[10px] text-slate-500">senare till ditt mål</p>
              </div>
              <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <TrendingDown className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-xs font-semibold text-white leading-tight">{result.opportunityCost}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">alternativkostnad</p>
              </div>
            </div>

            {/* Maintenance */}
            {result.maintenanceCost > 0 && (
              <div className="rounded-xl p-3 flex items-start gap-3" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-rose-300">{result.maintenanceNote} <span className="font-bold text-white">+{fmt(result.maintenanceCost)} kr/år</span></p>
              </div>
            )}

            {/* AI Verdict */}
            <div className="rounded-2xl p-4" style={{ background: vs.bg, border: `1px solid ${vs.border}` }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{vs.emoji}</span>
                <span className="text-sm font-bold" style={{ color: vs.color }}>AI-omdöme: {result.verdict}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{result.aiInsight}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}