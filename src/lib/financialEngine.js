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

export { getTotalFixedCosts, getMonthlyMargin, getFixedCostBreakdown, getBufferRunwayMonths, getEconomicHealth, calcLiquidityForecast };

const SAFETY_MARGIN_KR = 500;

function fmtMonthYear(date) {
  return date.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' });
}

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

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
 * Ren sparmåls-projektion — inget profil-beroende, funkar för vilket mål som
 * helst (primärt sparmål, buffertmål, sekundärt mål) från t.ex. buildSavingsGoals().
 */
export function projectGoal({ current = 0, target = 0, goalName = 'sparmål' } = {}, monthlyRate = 0) {
  if (!target || target <= 0) return null;

  const remaining = Math.max(0, target - current);
  const rate = Math.max(0, monthlyRate);
  const monthsToGoal = rate > 0 ? Math.ceil(remaining / rate) : (remaining <= 0 ? 0 : null);
  const targetDate = monthsToGoal != null ? addMonths(new Date(), monthsToGoal) : null;

  return {
    goalName,
    current,
    target,
    remaining,
    monthlyRate: rate,
    monthsToGoal,
    targetDateLabel: targetDate ? fmtMonthYear(targetDate) : null,
    pctComplete: Math.min(100, Math.round((current / target) * 100)),
  };
}

/**
 * Sparmålsprognos vid nuvarande takt + "vad händer om jag sparar X mer" — för
 * profilens primära sparmål. Tunt skal ovanpå projectGoal().
 */
export function getSavingsGoalProjection(profile, extraMonthlyKr = 0) {
  if (!profile?.savingsGoal || profile.savingsGoal <= 0) return null;

  const baseRate = profile.savingsGoalMonthlyTarget > 0
    ? profile.savingsGoalMonthlyTarget
    : Math.max(0, Math.round(getMonthlyMargin(profile) * 0.3));
  const rate = baseRate + Math.max(0, extraMonthlyKr);

  const proj = projectGoal(
    { current: profile.savingsCurrentBalance || 0, target: profile.savingsGoal, goalName: profile.savingsGoalName || 'sparmål' },
    rate,
  );
  if (!proj) return null;

  return { ...proj, isRateAssumed: !(profile.savingsGoalMonthlyTarget > 0) };
}

/** "Spara X kr mer/mån → nås Y månader tidigare." */
export function whatIfExtraSavings(profile, extraMonthlyKr) {
  const before = getSavingsGoalProjection(profile, 0);
  const after = getSavingsGoalProjection(profile, extraMonthlyKr);
  if (!before || !after || before.monthsToGoal == null || after.monthsToGoal == null) return null;
  return {
    before,
    after,
    monthsEarlier: Math.max(0, before.monthsToGoal - after.monthsToGoal),
  };
}

/**
 * Baklängesberäkning: "jag vill nå detta senast <datum>" → kr/mån som krävs.
 * Om det inte är realistiskt vid nuvarande takt returneras tre konkreta
 * alternativ (spara mer / flytta måldatum / sänk målbelopp) som strukturerad
 * data — UI:t formulerar texten.
 */
export function getRequiredMonthlyRate(goal, deadlineDate, currentMonthlyRate = 0) {
  if (!goal?.target || goal.target <= 0 || !deadlineDate) return null;

  const today = new Date();
  const deadline = new Date(deadlineDate);
  const monthsUntil = Math.max(
    1,
    (deadline.getFullYear() - today.getFullYear()) * 12 + (deadline.getMonth() - today.getMonth()),
  );
  const remaining = Math.max(0, goal.target - (goal.current || 0));
  const requiredMonthly = Math.ceil(remaining / monthsUntil);
  const isRealistic = currentMonthlyRate <= 0 ? requiredMonthly <= 0 : requiredMonthly <= currentMonthlyRate * 1.001;

  const result = { monthsUntil, requiredMonthly, remaining, deadlineLabel: fmtMonthYear(deadline), isRealistic };
  if (isRealistic) return result;

  const rate = Math.max(0, currentMonthlyRate);
  const monthsAtCurrentRate = rate > 0 ? Math.ceil(remaining / rate) : null;
  const achievableTarget = Math.round((goal.current || 0) + rate * monthsUntil);

  return {
    ...result,
    alternatives: {
      saveMore: { monthlyRate: requiredMonthly },
      laterDate: monthsAtCurrentRate != null
        ? { monthsNeeded: monthsAtCurrentRate, dateLabel: fmtMonthYear(addMonths(today, monthsAtCurrentRate)) }
        : null,
      lowerTarget: { achievableTarget: Math.max(goal.current || 0, achievableTarget) },
    },
  };
}

/**
 * Klassificerar ett måls status: i fas, kan nås tidigare, eller riskerar att
 * missas (kräver deadlineDate för att avgöra risk). Föreslår en rimlig
 * extra-summa (15 % av tillgänglig marginal, minst 200 kr, annars 300 kr).
 */
export function getGoalInsight(goal, currentMonthlyRate, { deadlineDate, marginAvailable } = {}) {
  const proj = projectGoal(goal, currentMonthlyRate);
  if (!proj || proj.monthsToGoal == null) return null;
  if (proj.pctComplete >= 100) {
    return { status: 'reached', goalName: proj.goalName, ...proj };
  }

  const suggestedExtra = marginAvailable > 0 ? Math.max(200, Math.round(marginAvailable * 0.15)) : 300;
  const withExtra = projectGoal(goal, currentMonthlyRate + suggestedExtra);
  const monthsEarlier = withExtra?.monthsToGoal != null
    ? Math.max(0, proj.monthsToGoal - withExtra.monthsToGoal)
    : 0;

  let status = 'on_track';
  if (deadlineDate) {
    const req = getRequiredMonthlyRate(goal, deadlineDate, currentMonthlyRate);
    if (req && !req.isRealistic) status = 'at_risk';
    else if (req && currentMonthlyRate > req.requiredMonthly * 1.1) status = 'ahead';
  } else if (monthsEarlier >= 1) {
    status = 'reachable_earlier';
  }

  return { status, suggestedExtra, monthsEarlier, ...proj };
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
