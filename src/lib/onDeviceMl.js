// @ts-nocheck
/**
 * On-device ML-lager — regler, mönster och anomalier utan API-anrop.
 * Ersätts gradvis av TFLite/Core ML; samma gränssnitt behålls.
 */
import { categorizeLocal, categorizeBatchLocal } from '@/lib/categoryRouter';
import { scanSubscriptions } from '@/lib/anchorBrain';

const EXPENSE_TYPES = new Set(['expense', 'shopping']);

function txDate(t) {
  return new Date(t.created_date || t.date || 0);
}

/** Kategorisera direkt på enheten — <10ms */
export function categorizeOnDevice(vendorOrLabel, { amount } = {}) {
  const result = categorizeLocal(vendorOrLabel, { amount });
  return { ...result, layer: 'local_ml', latency: 'on_device' };
}

export function categorizeBatchOnDevice(items) {
  return categorizeBatchLocal(items);
}

/** Detektera ovanligt köp jämfört med historik */
export function detectUnusualPurchase(transactions, newTx) {
  const amount = Math.abs(newTx?.amount || 0);
  const category = newTx?.category || 'other';
  if (!amount) return { unusual: false, reason: null };

  const recent = (transactions || [])
    .filter((t) => EXPENSE_TYPES.has(t.type) || t.amount < 0)
    .filter((t) => (t.category || 'other') === category)
    .slice(0, 60);

  if (recent.length < 3) return { unusual: false, reason: null };

  const amounts = recent.map((t) => Math.abs(t.amount || 0)).sort((a, b) => a - b);
  const median = amounts[Math.floor(amounts.length / 2)];
  const p90 = amounts[Math.floor(amounts.length * 0.9)] || median;

  if (amount > p90 * 2.5 && amount > median * 4) {
    return {
      unusual: true,
      reason: `Ovanligt högt för ${category} (median ${Math.round(median)} kr)`,
      median,
      amount,
      layer: 'local_ml',
    };
  }

  return { unusual: false, reason: null, layer: 'local_ml' };
}

/** Prenumerationsscanner + dolda återkommande betalningar */
export function scanSubscriptionsOnDevice(profile, transactions) {
  return { ...scanSubscriptions(profile, transactions), layer: 'local_ml' };
}

/** Säsongs-/veckodagsmönster från transaktioner */
export function detectSpendingPatterns(transactions) {
  const byDow = Array(7).fill(0);
  const byMonth = Array(12).fill(0);
  let count = 0;

  (transactions || []).forEach((t) => {
    if (!EXPENSE_TYPES.has(t.type) && t.amount >= 0) return;
    const d = txDate(t);
    if (Number.isNaN(d.getTime())) return;
    const amt = Math.abs(t.amount || 0);
    byDow[d.getDay()] += amt;
    byMonth[d.getMonth()] += amt;
    count += 1;
  });

  if (count < 8) return { patterns: [], layer: 'local_ml' };

  const dowLabels = ['sön', 'mån', 'tis', 'ons', 'tors', 'fre', 'lör'];
  const maxDow = byDow.indexOf(Math.max(...byDow));
  const patterns = [];

  if (byDow[maxDow] > 0) {
    patterns.push({
      type: 'weekday_peak',
      label: `Mest utgifter på ${dowLabels[maxDow]}`,
      confidence: 0.75,
    });
  }

  const monthNames = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  const maxMonth = byMonth.indexOf(Math.max(...byMonth));
  const minMonth = byMonth.indexOf(Math.min(...byMonth.filter((v) => v > 0).length ? byMonth : [0]));
  if (byMonth[maxMonth] > byMonth[minMonth] * 1.4) {
    patterns.push({
      type: 'seasonal',
      label: `Högre utgifter i ${monthNames[maxMonth]}`,
      confidence: 0.7,
    });
  }

  return { patterns, layer: 'local_ml' };
}
