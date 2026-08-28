// @ts-nocheck
/**
 * Sparmåls-projektion — bruten ut ur financialEngine.js så att den kan
 * importeras av futureQuestions/scenarioMath.js utan cirkulärt beroende
 * (financialEngine importerar redan scenarioMath). Ingen egen logik ändrad
 * här, bara flyttad — financialEngine.js re-exporterar allt oförändrat.
 */
import { getMonthlyMargin } from '@/lib/financialUtils';

function fmtMonthYear(date) {
  return date.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' });
}

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
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
