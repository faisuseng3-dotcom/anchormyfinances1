// @ts-nocheck
/**
 * financialEngine — enda källan till sanning för "vad kan jag spendera / göra
 * med pengarna" i hela appen. Räknar INTE om det som redan fungerar: den
 * komponerar befintlig, beprövad logik (financialUtils, insightEngine,
 * economicHealth, futurePulseEngine, savingsGoalValidation, scenarioMath) och
 * lägger bara till det som saknades — ett transparent "tryggt att spendera"-
 * breakdown, sparmålsprognos, köpkonsekvens och "bästa datum att köpa".
 *
 * Regel: AI får aldrig räkna ut de här talen själv — den får bara förklara
 * dem i ord. Allt nedan är ren, deterministisk JS.
 */
import { getTotalFixedCosts, getMonthlyMargin, getFixedCostBreakdown } from '@/lib/financialUtils';
import { getBufferRunwayMonths, getEconomicHealth } from '@/lib/economicHealth';
import { calcLiquidityForecast } from '@/lib/insightEngine';
import { computeLocalFuturePulse } from '@/lib/futurePulseEngine';
import { computeScenario } from '@/lib/futureQuestions/scenarioMath';
import { getSavingsGoalProjection } from '@/lib/goalProjectionEngine';

export { getTotalFixedCosts, getMonthlyMargin, getFixedCostBreakdown, getBufferRunwayMonths, getEconomicHealth, calcLiquidityForecast };
// Sparmåls-projektion flyttad till goalProjectionEngine.js (scenarioMath.js
// behöver kunna importera den utan att skapa ett cirkulärt beroende via
// financialEngine, som redan importerar scenarioMath ovan). Re-exporteras
// oförändrat så alla befintliga importställen fortsätter fungera.
export { projectGoal, getSavingsGoalProjection, whatIfExtraSavings, getRequiredMonthlyRate, getGoalInsight } from '@/lib/goalProjectionEngine';

const SAFETY_MARGIN_KR = 500;

/**
 * Tryggt att spendera — transparent breakdown, inte bara ett tal.
 * Saldo − kommande fasta kostnader − förväntade utgifter − sparande − säkerhetsmarginal.
 * Vi lägger INTE till framtida lön: pengar som inte kommit in än är inte
 * trygga att spendera nu, och det håller talet konservativt och pålitligt.
 */
export function getSafeToSpend(profile, transactions = []) {
  if (!profile?.income) {
    return {
      amount: 0,
      breakdown: [],
      isReady: false,
      message: 'Fyll i din inkomst och dina fasta kostnader för att se vad du tryggt kan spendera.',
    };
  }

  const liquidity = calcLiquidityForecast(profile, transactions) || {
    currentBuffer: profile.buffer || 0,
    remainingFixed: 0,
    projectedVariableSpend: 0,
    daysLeft: 30,
  };

  const monthlyTarget = profile.savingsGoalMonthlyTarget > 0 ? profile.savingsGoalMonthlyTarget : 0;
  const savingsReservation = Math.round(monthlyTarget * Math.max(0, liquidity.daysLeft) / 30);

  const breakdown = [
    { label: 'Saldo', value: liquidity.currentBuffer },
    { label: 'Fasta kostnader som kommer', value: -liquidity.remainingFixed },
    { label: 'Förväntade utgifter', value: -liquidity.projectedVariableSpend },
  ];
  if (savingsReservation > 0) {
    breakdown.push({ label: 'Sparande', value: -savingsReservation });
  }
  breakdown.push({ label: 'Säkerhetsmarginal', value: -SAFETY_MARGIN_KR });

  const amount = Math.max(
    0,
    Math.round(liquidity.currentBuffer - liquidity.remainingFixed - liquidity.projectedVariableSpend - savingsReservation - SAFETY_MARGIN_KR),
  );

  return {
    amount,
    breakdown,
    isReady: true,
    daysLeft: liquidity.daysLeft,
    avgDailySpend: liquidity.avgDailySpend,
  };
}

/**
 * Deterministisk köpkonsekvens — traffic light + påverkan på buffert och sparmål.
 * 🟢 grön: köpet ryms inom "tryggt att spendera" utan att röra bufferten.
 * 🟡 gul: köpet äter av bufferten men den går inte under noll.
 * 🔴 röd: köpet trycker bufferten under noll.
 */
export function getPurchaseImpact(profile, transactions, price) {
  const amount = Math.max(0, Number(price) || 0);
  const safeToSpend = getSafeToSpend(profile, transactions);
  const buffer = profile?.buffer || 0;
  const bufferAfter = Math.round(buffer - amount);
  const margin = Math.max(0, getMonthlyMargin(profile));
  const monthsToRebuild = bufferAfter < buffer && margin > 0
    ? Math.ceil((buffer - Math.max(0, bufferAfter)) / margin)
    : 0;
  const runwayAfter = getBufferRunwayMonths({ ...profile, buffer: Math.max(0, bufferAfter) });

  let verdict = 'green';
  if (bufferAfter < 0) verdict = 'red';
  else if (amount > safeToSpend.amount) verdict = 'yellow';

  const goalBefore = getSavingsGoalProjection(profile);
  let goalDelayMonths = 0;
  let goalAfter = goalBefore;
  if (goalBefore && amount > buffer) {
    const shortfall = amount - buffer;
    goalAfter = getSavingsGoalProjection({
      ...profile,
      savingsCurrentBalance: Math.max(0, (profile.savingsCurrentBalance || 0) - shortfall),
    });
    if (goalAfter?.monthsToGoal != null && goalBefore.monthsToGoal != null) {
      goalDelayMonths = Math.max(0, goalAfter.monthsToGoal - goalBefore.monthsToGoal);
    }
  }

  return {
    price: amount,
    verdict,
    safeToSpend: safeToSpend.amount,
    bufferBefore: buffer,
    bufferAfter,
    monthsToRebuild,
    runwayAfterMonths: runwayAfter,
    goalBefore,
    goalAfter,
    goalDelayMonths,
  };
}

/**
 * Bästa datum att köpa — dagvis simulering (samma motor som Framtidspuls)
 * tills bufferten + säkerhetsmarginal klarar priset.
 */
export function getBestPurchaseDate(profile, transactions, price, { horizonDays = 90 } = {}) {
  const amount = Math.max(0, Number(price) || 0);
  const forecast = computeLocalFuturePulse(profile, transactions, horizonDays);
  const timeline = forecast?.tidslinje || [];
  const hit = timeline.find((day) => (day.saldo - amount) >= SAFETY_MARGIN_KR);
  if (!hit) {
    return { found: false, horizonDays };
  }
  return {
    found: true,
    dayOffset: hit.dag,
    dateLabel: new Date(hit.datum).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' }),
    balanceThen: hit.saldo,
  };
}

/** Tunn wrapper runt scenarioMath — samma "vad händer om"-motor Coach/Dashboard kan dela. */
export function runWhatIf(intent, params, profile, transactions) {
  return computeScenario(intent, params, profile, transactions);
}
