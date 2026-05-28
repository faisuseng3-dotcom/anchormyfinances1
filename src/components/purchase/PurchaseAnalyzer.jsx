import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Upload, Loader2, ShoppingBag, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  anchorInputClass,
  anchorPrimaryButtonClass,
  anchorIconButtonClass,
  sectionMetaClass,
  sectionSubtitleClass,
} from '@/lib/anchorTheme';
import { DashboardDivider } from '@/components/dashboard/DashboardChrome';

const fmt = (v) => Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const VERDICT_LABEL = {
  Köp: { text: 'text-emerald-300/90', label: 'Går bra' },
  Vänta: { text: 'text-amber-300/90', label: 'Vänta lite' },
  'Hitta billigare': { text: 'text-white/70', label: 'Leta alternativ' },
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
      'Läser annonsen…',
      'Jämför pris…',
      'Räknar på din budget…',
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

  const vs = result ? (VERDICT_LABEL[result.verdict] || VERDICT_LABEL.Vänta) : null;

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 pointer-events-none" />
            <input
              placeholder="https://blocket.se/…"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setImageFile(null);
                setImagePreview(null);
              }}
              className={`${anchorInputClass} pl-9`}
            />
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={anchorIconButtonClass}
            aria-label="Ladda upp bild"
          >
            <Upload className="w-4 h-4" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </div>

        {imagePreview && (
          <div className="relative">
            <img src={imagePreview} alt="Uppladdad bild" className="w-full max-h-32 object-cover rounded-xl" />
            <button
              type="button"
              onClick={() => {
                setImageFile(null);
                setImagePreview(null);
              }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={(!url && !imageFile) || loading}
          className={`${anchorPrimaryButtonClass} w-full disabled:opacity-50`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> {loadingMsg}
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" /> Räkna på köpet
            </>
          )}
        </button>
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[17px] font-semibold text-white">{result.productName}</p>
                <p className={sectionMetaClass}>{result.priceAssessment}</p>
              </div>
              <p className="text-[20px] font-semibold text-white tabular-nums shrink-0">
                {fmt(result.price)} kr
              </p>
            </div>

            <div className="mt-4">
              <div className="flex justify-between mb-1">
                <span className={sectionMetaClass}>Av din marginal</span>
                <span className={sectionMetaClass}>{result.budgetImpact} %</span>
              </div>
              <div className="h-1 rounded-full bg-white/[0.08] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(result.budgetImpact, 100)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full bg-white/50"
                />
              </div>
            </div>

            <DashboardDivider className="my-5" />

            <p className="text-[13px] font-medium text-white/45 mb-3">Före och efter köpet</p>
            <div className="space-y-3">
              {[
                { label: 'Innan köp', value: result.margin, max: result.margin },
                {
                  label: 'Efter köp',
                  value: Math.max(result.margin - result.price, 0),
                  max: result.margin,
                },
              ].map((bar) => (
                <div key={bar.label}>
                  <div className="flex justify-between mb-1">
                    <span className={sectionMetaClass}>{bar.label}</span>
                    <span className="text-[15px] font-medium text-white tabular-nums">
                      {fmt(bar.value)} kr kvar
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-white/[0.08] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${bar.max ? Math.min((bar.value / bar.max) * 100, 100) : 0}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full rounded-full bg-white/40"
                    />
                  </div>
                </div>
              ))}
            </div>

            <DashboardDivider className="my-5" />

            <div className="flex gap-6">
              <div>
                <p className={sectionMetaClass}>Till sparmål</p>
                <p className="text-[17px] font-semibold text-white tabular-nums mt-0.5">
                  +{result.daysDelayedGoal} dagar
                </p>
              </div>
              <div className="flex-1 min-w-0">
                <p className={sectionMetaClass}>I stället för</p>
                <p className="text-[14px] text-white/75 mt-0.5 leading-snug">{result.opportunityCost}</p>
              </div>
            </div>

            {result.maintenanceCost > 0 && (
              <>
                <DashboardDivider className="my-5" />
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-300/80 flex-shrink-0 mt-0.5" />
                  <p className="text-[14px] text-white/70 leading-relaxed">
                    {result.maintenanceNote}{' '}
                    <span className="text-white font-medium">+{fmt(result.maintenanceCost)} kr/år</span>
                  </p>
                </div>
              </>
            )}

            <DashboardDivider className="my-5" />

            <div>
              <p className={`text-[15px] font-semibold ${vs.text}`}>{vs.label}</p>
              <p className={`${sectionSubtitleClass} mt-2`}>{result.verdictReason}</p>
              <p className="text-[14px] text-white/75 leading-relaxed mt-2">{result.aiInsight}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}