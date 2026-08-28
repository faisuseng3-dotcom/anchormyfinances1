// @ts-nocheck
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Upload, Loader2, ShoppingBag, AlertTriangle, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  anchorInputClass,
  anchorPrimaryButtonClass,
  anchorSecondaryButtonClass,
  anchorIconButtonClass,
  sectionMetaClass,
  sectionSubtitleClass,
} from '@/lib/anchorTheme';
import { recordAIExchange, saveSemanticMemory } from '@/lib/anchorMemory';
import { AI_FEATURES, MEMORY_TYPES } from '@/lib/anchorMemory/types';
import { DashboardDivider } from '@/components/dashboard/DashboardChrome';
import { useTransactions } from '@/hooks/useTransactions';
import { getMonthlyMargin, getPurchaseImpact, getBestPurchaseDate } from '@/lib/financialEngine';

/** AI:n får bara tolka fritext/bild till ett pris och en produktbeskrivning —
 * själva köpkonsekvensen (budgetpåverkan, sparmålspåverkan, verdikt) räknas
 * alltid lokalt av financialEngine, aldrig av AI-svaret. */
const VERDICT_FROM_ENGINE = { green: 'Köp', yellow: 'Vänta', red: 'Hitta billigare' };

function applyEngineVerdict(payload, profile, transactions) {
  const price = Number(payload?.price) || 0;
  const margin = getMonthlyMargin(profile);
  const impact = getPurchaseImpact(profile, transactions, price);
  const bestDate = getBestPurchaseDate(profile, transactions, price);
  return {
    ...payload,
    price,
    margin,
    budgetImpact: Math.min(100, Math.round((price / Math.max(1, margin)) * 100)),
    daysDelayedGoal: Math.round((impact.goalDelayMonths || 0) * 30),
    verdict: VERDICT_FROM_ENGINE[impact.verdict] || 'Vänta',
    _impact: impact,
    _bestDate: bestDate,
  };
}

const fmt = (v) => Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const VERDICT_LABEL = {
  Köp: { text: 'text-[var(--color-success)]', label: 'Går bra' },
  Vänta: { text: 'text-[var(--color-warning)]', label: 'Vänta lite' },
  'Hitta billigare': { text: 'text-[var(--color-text-secondary)]', label: 'Leta alternativ' },
};

function computeBuyScore(result, profile) {
  if (!result) return { score: 0, recommendation: 'VÄNTA', reasons: [] };

  const impact = Math.min(100, result.budgetImpact || 0);
  const delayPenalty = Math.min(40, (result.daysDelayedGoal || 0) * 3);
  const threshold = profile?.impulseThreshold || 700;
  const pricePenalty = (result.price || 0) > threshold ? 15 : 0;
  const score = Math.max(0, Math.min(100, Math.round(100 - impact - delayPenalty - pricePenalty)));

  let recommendation = 'VÄNTA';
  if (score >= 75) recommendation = 'KÖP';
  else if (score < 40) recommendation = 'AVVAKTA';

  const reasons = [];
  if ((result.daysDelayedGoal || 0) < 3) reasons.push('Påverkar inte ditt sparmål');
  else if ((result.daysDelayedGoal || 0) < 10) reasons.push('Påverkar sparmålet marginellt');
  else reasons.push('Försenar ditt sparmål märkbart');

  if ((result.budgetImpact || 0) <= 15) reasons.push('Ligger inom din budget');
  else if ((result.budgetImpact || 0) <= 35) reasons.push('Tar en del av månadsmarginalen');
  else reasons.push('Överstiger din rekommenderade marginal');

  if (result.priceAssessment?.toLowerCase().includes('bra') || result.verdict === 'Köp') {
    reasons.push('Bra pris jämfört med alternativ');
  } else {
    reasons.push('Jämför pris innan du bestämmer dig');
  }

  return { score, recommendation, reasons: reasons.slice(0, 3) };
}

function getRisk(result, profile) {
  if (!result) return { level: 'low', reason: '' };
  const threshold = profile?.impulseThreshold || 700;
  const hardSignals = (result?.budgetImpact || 0) >= 35 || (result?.daysDelayedGoal || 0) >= 10;
  const thresholdSignal = (result?.price || 0) >= threshold;
  if (hardSignals && thresholdSignal) {
    return { level: 'high', reason: `Köpet överstiger din impulsgräns (${fmt(threshold)} kr).` };
  }
  if (hardSignals || thresholdSignal) {
    return { level: 'medium', reason: 'Köpet påverkar ditt sparmål tydligt.' };
  }
  return { level: 'low', reason: 'Köpet ryms inom din nuvarande plan.' };
}

function getCooldownEnd(hours) {
  const end = new Date(Date.now() + hours * 60 * 60 * 1000);
  return end.toISOString();
}

export default function PurchaseAnalyzer({ profile }) {
  const { transactions = [] } = useTransactions({ personalOnly: true, limit: 1000 });
  const [url, setUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [result, setResult] = useState(null);
  const [shieldChoice, setShieldChoice] = useState(null);
  const [wishlistSaved, setWishlistSaved] = useState(false);
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
    setShieldChoice(null);
    setWishlistSaved(false);

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

    try {
      const res = await base44.functions.invoke('purchaseAdvisor', {
        url: url || null,
        income,
        margin,
        savingsGoalName: profile?.savingsGoalName || 'sparmål',
        dailyTarget: profile?.savingsGoalDailyTarget || profile?.savingsDailyMicroAmount || 25,
        fileUrls,
      });
      const payload = res?.data || res;
      setResult(applyEngineVerdict(payload, profile, transactions));
      const productName = payload?.productName || url || 'köp';
      const userMsg = `Jag funderar på att köpa ${productName}`;
      const aiReply = payload?.aiInsight || payload?.verdictReason || payload?.verdict || '';
      void recordAIExchange({
        profile,
        feature: AI_FEATURES.PURCHASE,
        message: userMsg,
        response: aiReply,
      });
      if (productName && productName !== 'köp') {
        void saveSemanticMemory({
          profile,
          type: MEMORY_TYPES.MAJOR_PURCHASE,
          value: `Funderar på att köpa ${productName}`,
          sourceFeature: AI_FEATURES.PURCHASE,
          keywords: [productName.toLowerCase()],
          metadata: { price: payload?.price, verdict: payload?.verdict },
        });
      }
    } catch (err) {
      console.warn('purchaseAdvisor unavailable, fallback to direct InvokeLLM', err);
      const fallback = await base44.integrations.Core.InvokeLLM({
        model: 'claude_sonnet_4_6',
        prompt: `Analysera köpet kort på svenska och returnera ENDAST JSON med fält:
productName, price, category, priceAssessment, verdict, verdictReason, budgetImpact, daysDelayedGoal, opportunityCost, aiInsight, maintenanceCost, maintenanceNote.
Källa: ${url ? `URL ${url}` : 'uppladdad bild'}.
Inkomst ${income} kr, marginal ${margin} kr.`,
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
          },
        },
        file_urls: fileUrls.length > 0 ? fileUrls : null,
      });
      setResult(applyEngineVerdict({ ...fallback, model: 'direct_fallback' }, profile, transactions));
      const productName = fallback?.productName || url || 'köp';
      void recordAIExchange({
        profile,
        feature: AI_FEATURES.PURCHASE,
        message: `Jag funderar på att köpa ${productName}`,
        response: fallback?.aiInsight || fallback?.verdict || '',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveToWishlist = () => {
    if (!result) return;
    const cooldownHours = profile?.impulseCooldownHours || 48;
    const item = {
      id: `${Date.now()}`,
      productName: result.productName,
      price: result.price,
      sourceUrl: url || null,
      cooldownEnd: getCooldownEnd(cooldownHours),
      createdAt: new Date().toISOString(),
    };
    const key = 'anchor_impulse_wishlist';
    const prev = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify([item, ...prev].slice(0, 40)));
    setWishlistSaved(true);
    setShieldChoice('wait');
  };

  const vs = result ? (VERDICT_LABEL[result.verdict] || VERDICT_LABEL.Vänta) : null;
  const buyScore = computeBuyScore(result, profile);
  const risk = getRisk(result, profile);
  const shieldEnabled = profile?.impulseShieldEnabled !== false;
  const showShield = !!result && shieldEnabled && risk.level !== 'low';

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
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
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[rgba(11,18,32,0.55)] flex items-center justify-center"
              aria-label="Ta bort bild"
            >
              <X className="w-3.5 h-3.5 text-white" />
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
            className="relative rounded-[26px] shadow-[var(--anchor-shadow-1)] bg-white border border-[var(--color-border)] px-4 py-4 space-y-3 overflow-hidden"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[17px] font-semibold text-[var(--color-text-primary)]">{result.productName}</p>
                <p className={sectionMetaClass}>{result.priceAssessment}</p>
              </div>
              <p className="text-[20px] font-semibold text-[var(--color-text-primary)] tabular-nums shrink-0">
                {fmt(result.price)} kr
              </p>
            </div>

            {/* Köp-score */}
            <div
              className="mt-5 rounded-2xl px-5 py-5 text-center"
              style={{
                background: buyScore.recommendation === 'KÖP'
                  ? 'var(--color-success-soft)'
                  : buyScore.recommendation === 'AVVAKTA'
                    ? 'var(--color-danger-soft)'
                    : 'var(--color-warning-soft)',
                border: '1px solid var(--color-border)',
              }}
            >
              <h2 className="anchor-card-title">Köp-score</h2>
              <p className="text-[56px] font-bold text-[var(--color-text-primary)] tabular-nums leading-none mt-2">
                {buyScore.score}
                <span className="text-[22px] text-[var(--color-text-muted)] font-medium">/100</span>
              </p>
              <p
                className="text-[18px] font-bold mt-3 tracking-wide"
                style={{
                  color: buyScore.recommendation === 'KÖP' ? 'var(--color-success)'
                    : buyScore.recommendation === 'AVVAKTA' ? 'var(--color-danger)' : 'var(--color-warning)',
                }}
              >
                {buyScore.recommendation}
              </p>
              <ul className="mt-4 space-y-1.5 text-left max-w-xs mx-auto">
                {buyScore.reasons.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-[13px] text-[var(--color-text-secondary)]">
                    <span className="text-[var(--color-text-muted)] mt-0.5">•</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <div className="flex justify-between mb-1">
                <span className={sectionMetaClass}>Av din marginal</span>
                <span className={sectionMetaClass}>{result.budgetImpact} %</span>
              </div>
              <div className="h-1 rounded-full bg-[var(--color-background-secondary)] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(result.budgetImpact, 100)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full bg-[var(--color-accent)]"
                />
              </div>
            </div>

            <DashboardDivider className="my-5" />

            <p className="text-[13px] font-medium text-[var(--color-text-secondary)] mb-3">Före och efter köpet</p>
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
                    <span className="text-[15px] font-medium text-[var(--color-text-primary)] tabular-nums">
                      {fmt(bar.value)} kr kvar
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-[var(--color-background-secondary)] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${bar.max ? Math.min((bar.value / bar.max) * 100, 100) : 0}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full rounded-full bg-[var(--color-accent)]/60"
                    />
                  </div>
                </div>
              ))}
            </div>

            <DashboardDivider className="my-5" />

            <div className="flex gap-6">
              <div>
                <p className={sectionMetaClass}>Till sparmål</p>
                <p className="text-[17px] font-semibold text-[var(--color-text-primary)] tabular-nums mt-0.5">
                  +{result.daysDelayedGoal} dagar
                </p>
              </div>
              <div className="flex-1 min-w-0">
                <p className={sectionMetaClass}>I stället för</p>
                <p className="text-[14px] text-[var(--color-text-secondary)] mt-0.5 leading-snug">{result.opportunityCost}</p>
              </div>
            </div>

            {result.maintenanceCost > 0 && (
              <>
                <DashboardDivider className="my-5" />
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
                  <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed">
                    {result.maintenanceNote}{' '}
                    <span className="text-[var(--color-text-primary)] font-medium">+{fmt(result.maintenanceCost)} kr/år</span>
                  </p>
                </div>
              </>
            )}

            <DashboardDivider className="my-5" />

            <div>
              <p className={`text-[15px] font-semibold ${vs.text}`}>{vs.label}</p>
              <p className={`${sectionSubtitleClass} mt-2`}>{result.verdictReason}</p>
              <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed mt-2">{result.aiInsight}</p>
            </div>

            {result.verdict !== 'Köp' && result._bestDate?.found && (
              <>
                <DashboardDivider className="my-5" />
                <div>
                  <p className={sectionMetaClass}>Bättre datum att köpa</p>
                  <p className="text-[15px] font-semibold text-[var(--color-text-primary)] mt-1">{result._bestDate.dateLabel}</p>
                  <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">
                    Då har din buffert hunnit återhämta sig till minst {fmt(result._bestDate.balanceThen)} kr.
                  </p>
                </div>
              </>
            )}

            {showShield && (
              <>
                <DashboardDivider className="my-5" />
                <div className="space-y-3">
                  <p className="text-[15px] font-semibold text-[var(--color-warning)]">Impulse Shield</p>
                  <p className="text-[14px] text-[var(--color-text-secondary)]">{risk.reason}</p>
                  <p className="text-[13px] text-[var(--color-text-secondary)]">
                    Detta köp försenar ditt mål med cirka {result.daysDelayedGoal} dagar.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={saveToWishlist}
                      className={`${anchorPrimaryButtonClass} h-10 px-4 text-[13px]`}
                    >
                      Vänta {profile?.impulseCooldownHours || 48}h
                    </button>
                    <button
                      type="button"
                      onClick={() => setShieldChoice('cheaper')}
                      className={`${anchorSecondaryButtonClass} h-10 px-3 text-[13px]`}
                    >
                      Hitta billigare
                    </button>
                    <button
                      type="button"
                      onClick={() => setShieldChoice('buy')}
                      className={`${anchorSecondaryButtonClass} h-10 px-3 text-[13px]`}
                    >
                      Köp ändå
                    </button>
                  </div>
                  {wishlistSaved && (
                    <p className="text-[13px] text-[var(--color-success)]">
                      Sparad i wishlist med cooldown. Du kan kolla senare när impulsen lagt sig.
                    </p>
                  )}
                  {shieldChoice === 'cheaper' && (
                    <p className="text-[13px] text-[var(--color-text-secondary)]">
                      Tips: sök samma modell begagnad eller med prisbevakning innan köp.
                    </p>
                  )}
                  {shieldChoice === 'buy' && (
                    <p className="text-[13px] text-[var(--color-warning)]">
                      Okej, men håll koll på månadsutrymmet så sparmålet inte glider.
                    </p>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}