// @ts-nocheck
/**
 * Deterministisk matematik bakom varje "Framtid"-scenario. AI:t klassificerar
 * frågan (intentClassifier) — all uträkning här är ren JS mot riktig profil-
 * och transaktionsdata. Ingen LLM rör siffrorna, så de går aldrig att
 * hallucinera fel.
 */
import { getMonthlyMargin, getTotalFixedCosts, futureValueMonthly } from '@/lib/financialUtils';
import { BUDGET_CATEGORY_META } from '@/lib/budgetCategories';
import {
  estimateMonthsToDebtFree,
  monthsToDebtFreeWithExtra,
  pickBoostLoanIndex,
} from '@/lib/loanMath';

const EXPENSE_TYPES = ['expense', 'savings_deposit', 'transfer_to_savings'];
const INVESTED_RATE = 0.07;
const SAVED_RATE = 0;

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

function monthsAgo(n) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
}

function isExpense(t) {
  return EXPENSE_TYPES.includes(t.type) || (t.type !== 'income' && (t.amount || 0) < 0);
}

/** Snittutgift per månad senaste `months` månader, filtrerad på kategori och/eller vendor-mönster. */
function avgMonthlySpend(transactions, { category, vendorRe } = {}, months = 3) {
  const cutoff = monthsAgo(months);
  const matches = (transactions || []).filter((t) => {
    if (!isExpense(t)) return false;
    const d = new Date(t.created_date || t.date);
    if (d < cutoff) return false;
    if (category && t.category !== category) return false;
    if (vendorRe && !vendorRe.test(`${t.vendor || ''} ${t.label || ''}`)) return false;
    return true;
  });
  if (!matches.length) return 0;
  const total = matches.reduce((s, t) => s + Math.abs(t.amount), 0);
  return total / months;
}

/** Bygger "sparat vs investerat"-serie — den återkommande visualiseringen i hela Framtid. */
export function buildGrowthSeries({ startingAmount = 0, monthlyContribution = 0, months, investedRate = INVESTED_RATE }) {
  const points = [];
  let saved = startingAmount;
  let invested = startingAmount;
  const r = investedRate / 12;

  for (let m = 0; m <= months; m++) {
    if (m > 0) {
      saved += monthlyContribution;
      invested = invested * (1 + r) + monthlyContribution;
    }
    points.push({ month: m, saved: Math.round(saved), invested: Math.round(invested) });
  }
  return points;
}

/** Slår ihop till årsvisa punkter för långa horisonter — annars 120 punkter i en 10-årsgraf. */
function toYearlyPoints(monthlyPoints, unitLabel = 'år') {
  const years = [];
  for (let y = 0; y * 12 < monthlyPoints.length; y++) {
    const idx = Math.min(monthlyPoints.length - 1, y * 12);
    years.push({ ...monthlyPoints[idx], x: `${y} ${unitLabel}` });
  }
  const last = monthlyPoints[monthlyPoints.length - 1];
  if (years[years.length - 1]?.month !== last.month) years.push({ ...last, x: `${Math.round(last.month / 12)} ${unitLabel}` });
  return years;
}

function series(monthlyPoints, { yearly = false } = {}) {
  const points = yearly ? toYearlyPoints(monthlyPoints) : monthlyPoints.map((p) => ({ ...p, x: `Mån ${p.month}` }));
  return points;
}

// ── En kalkylfunktion per intent ────────────────────────────────────────────

function calcEliminateRecurring(profile, transactions, params) {
  const { target = {}, amountKr } = params;
  let monthly = amountKr || 0;

  if (!monthly && target.isSubscriptions) {
    monthly = (profile?.subscriptions || []).reduce((s, sub) => s + (sub.amount || 0), 0);
  } else if (!monthly && target.vendorRe) {
    monthly = avgMonthlySpend(transactions, { vendorRe: target.vendorRe });
    if (!monthly) {
      const sub = (profile?.subscriptions || []).find((s) => target.vendorRe.test(s.name || ''));
      if (sub) monthly = sub.amount || 0;
    }
  } else if (!monthly && target.category) {
    monthly = avgMonthlySpend(transactions, { category: target.category });
  }

  const label = target.label || 'det här';

  if (!monthly) {
    return {
      title: `Sluta med ${label}`,
      narrative: `Jag hittade inga transaktioner som matchar ${label} de senaste månaderna, så jag kan inte räkna på ett verkligt belopp. Skriv frågan med en ungefärlig kostnad, t.ex. "vad händer om jag slutar spendera 500 kr/mån på ${label}?".`,
      metrics: [],
      chart: null,
    };
  }

  const growth = buildGrowthSeries({ monthlyContribution: monthly, months: 120 });
  const tenYearInvested = growth[growth.length - 1].invested;
  const tenYearSaved = growth[growth.length - 1].saved;

  return {
    title: `Sluta med ${label}`,
    narrative: `Du lägger ungefär ${fmt(monthly)} kr/månad på ${label} — det blir ${fmt(monthly * 12)} kr per år. Lägger du undan det istället blir det ${fmt(tenYearSaved)} kr om 10 år, eller ${fmt(tenYearInvested)} kr om du investerar det i ett globalt indexfonder (7% årlig avkastning, historiskt snitt).`,
    metrics: [
      { label: 'Per månad', value: monthly, format: 'kr' },
      { label: 'Per år', value: monthly * 12, format: 'kr' },
      { label: 'Om 10 år, investerat', value: tenYearInvested, format: 'kr', accent: true },
    ],
    chart: {
      type: 'line',
      data: series(growth, { yearly: true }),
      lines: [
        { key: 'saved', label: 'Sparat i låda', color: 'muted' },
        { key: 'invested', label: 'Investerat (7%/år)', color: 'accent' },
      ],
    },
  };
}

function calcIncreaseSavings(profile, transactions, params) {
  const monthly = params.amountKr || 1000;
  const assumption = params.amountKr ? null : 'Räknat på 1 000 kr/mån eftersom inget belopp angavs.';
  const growth = buildGrowthSeries({ startingAmount: profile?.savingsCurrentBalance || 0, monthlyContribution: monthly, months: 60 });
  const fiveYear = growth[growth.length - 1];

  let goalLine = '';
  if (profile?.savingsGoal > 0) {
    const current = profile.savingsCurrentBalance || 0;
    const remaining = Math.max(0, profile.savingsGoal - current);
    // Samma antagande som financialEngine.getSavingsGoalProjection när inget
    // uttryckligt månadsmål är satt — annars blandas "nuvarande takt" ihop
    // med den extra summan som just testas.
    const existingRate = profile.savingsGoalMonthlyTarget > 0
      ? profile.savingsGoalMonthlyTarget
      : Math.max(0, Math.round(getMonthlyMargin(profile) * 0.3));
    const monthsNow = existingRate > 0 ? Math.ceil(remaining / existingRate) : null;
    const monthsWithExtra = Math.ceil(remaining / (existingRate + monthly));
    if (monthsNow) {
      goalLine = ` Ditt sparmål "${profile.savingsGoalName || 'sparmål'}" nås ${monthsNow - monthsWithExtra} månader tidigare.`;
    }
  }

  return {
    title: `Spara ${fmt(monthly)} kr extra/mån`,
    assumption,
    narrative: `Om du sparar ${fmt(monthly)} kr extra varje månad har du ${fmt(fiveYear.saved)} kr om 5 år — eller ${fmt(fiveYear.invested)} kr om pengarna investeras istället.${goalLine}`,
    metrics: [
      { label: 'Per år', value: monthly * 12, format: 'kr' },
      { label: 'Om 5 år, sparat', value: fiveYear.saved, format: 'kr' },
      { label: 'Om 5 år, investerat', value: fiveYear.invested, format: 'kr', accent: true },
    ],
    chart: {
      type: 'line',
      data: series(growth, { yearly: true }),
      lines: [
        { key: 'saved', label: 'Sparat', color: 'muted' },
        { key: 'invested', label: 'Investerat (7%/år)', color: 'accent' },
      ],
    },
  };
}

function calcSalaryChange(profile, transactions, params) {
  const delta = params.amountKr || 3000;
  const assumption = params.amountKr ? null : `Räknat på ${fmt(delta)} kr/mån eftersom inget belopp angavs.`;
  const currentMargin = getMonthlyMargin(profile);
  const newMargin = currentMargin + delta;
  const growth = buildGrowthSeries({ monthlyContribution: delta, months: 120 });
  const tenYear = growth[growth.length - 1];

  return {
    title: `${fmt(delta)} kr högre lön`,
    assumption,
    narrative: `Din månadsmarginal går från ${fmt(currentMargin)} kr till ${fmt(newMargin)} kr. Om du investerar hela ökningen blir det ${fmt(tenYear.invested)} kr om 10 år — annars ${fmt(delta * 12)} kr extra att röra dig med varje år.`,
    metrics: [
      { label: 'Marginal idag', value: currentMargin, format: 'kr' },
      { label: 'Ny marginal', value: newMargin, format: 'kr', accent: true },
      { label: 'Extra per år', value: delta * 12, format: 'kr' },
    ],
    chart: {
      type: 'bar',
      data: [
        { x: 'Idag', value: currentMargin },
        { x: 'Med löneökning', value: newMargin, accent: true },
      ],
    },
  };
}

const PURCHASE_DEFAULTS = { bil: 150000, möbler: 20000, resa: 25000, dator: 15000 };

function calcOneTimePurchase(profile, transactions, params) {
  const label = params.label || params.target?.label || 'köpet';
  const amount = params.amountKr || PURCHASE_DEFAULTS[label] || 50000;
  const assumption = params.amountKr ? null : `Räknat på ett pris på ${fmt(amount)} kr eftersom inget belopp angavs — fråga igen med exakt pris för en säkrare kalkyl.`;

  const buffer = profile?.buffer || 0;
  const margin = Math.max(1, getMonthlyMargin(profile));
  const newBuffer = buffer - amount;
  const monthsToRebuild = newBuffer < buffer ? Math.ceil(Math.abs(Math.min(0, newBuffer)) / margin) + Math.ceil((buffer - Math.max(0, newBuffer)) / margin) : 0;

  const timeline = [];
  let bal = buffer;
  const totalMonths = Math.min(36, Math.max(6, monthsToRebuild + 3));
  for (let m = 0; m <= totalMonths; m++) {
    if (m === 0) bal = buffer - amount;
    else bal += margin;
    timeline.push({ month: m, x: `Mån ${m}`, saldo: Math.round(bal) });
  }

  return {
    title: `Köpa ${label} för ${fmt(amount)} kr`,
    assumption,
    narrative: newBuffer < 0
      ? `Ett köp på ${fmt(amount)} kr tar din buffert under noll (${fmt(newBuffer)} kr). Med din nuvarande marginal på ${fmt(margin)} kr/mån tar det ungefär ${monthsToRebuild} månader att bygga upp bufferten igen.`
      : `Din buffert går från ${fmt(buffer)} kr till ${fmt(newBuffer)} kr. Med ${fmt(margin)} kr/mån i marginal är du tillbaka på dagens nivå om ungefär ${monthsToRebuild || 1} månader.`,
    metrics: [
      { label: 'Buffert idag', value: buffer, format: 'kr' },
      { label: 'Buffert efter köp', value: newBuffer, format: 'kr', tone: newBuffer < 0 ? 'critical' : 'accent' },
      { label: 'Månader att återhämta', value: monthsToRebuild, format: 'months' },
    ],
    chart: {
      type: 'line',
      data: timeline,
      lines: [{ key: 'saldo', label: 'Buffert', color: newBuffer < 0 ? 'critical' : 'accent' }],
    },
  };
}

function calcStartInvesting(profile, transactions, params) {
  const margin = getMonthlyMargin(profile);
  const monthly = params.amountKr || Math.max(0, Math.round(margin * 0.2));
  const assumption = params.amountKr ? null : `Räknat på 20% av din marginal (${fmt(monthly)} kr/mån) eftersom inget belopp angavs.`;
  const years = params.years || 10;
  const growth = buildGrowthSeries({ monthlyContribution: monthly, months: years * 12 });
  const end = growth[growth.length - 1];
  const contributed = monthly * years * 12;
  const growthAmount = end.invested - contributed;

  return {
    title: `Investera ${fmt(monthly)} kr/mån`,
    assumption,
    narrative: `Om du investerar ${fmt(monthly)} kr/månad i ${years} år (7% årlig avkastning, historiskt snitt för globala indexfonder) har du satt in ${fmt(contributed)} kr totalt — men kontot är värt ${fmt(end.invested)} kr. Avkastningen står för ${fmt(growthAmount)} kr av det.`,
    metrics: [
      { label: 'Insatt totalt', value: contributed, format: 'kr' },
      { label: `Värde om ${years} år`, value: end.invested, format: 'kr', accent: true },
      { label: 'Varav avkastning', value: growthAmount, format: 'kr' },
    ],
    chart: {
      type: 'line',
      data: series(growth, { yearly: true }),
      lines: [
        { key: 'saved', label: 'Insatt', color: 'muted' },
        { key: 'invested', label: 'Marknadsvärde', color: 'accent' },
      ],
    },
  };
}

function calcRelocate(profile, transactions, params) {
  const housingCost = profile?.housingCost || 0;
  const delta = params.amountKr != null ? params.amountKr : Math.round(housingCost * 0.15);
  const assumption = params.amountKr != null ? null : `Räknat på 15% högre hyra (${fmt(delta)} kr) eftersom du inte angav en ny hyra — fråga igen med exakt belopp för en säkrare kalkyl.`;
  const currentMargin = getMonthlyMargin(profile);
  const newMargin = currentMargin - delta;

  return {
    title: 'Flytta',
    assumption,
    narrative: `Med ${fmt(delta)} kr högre boendekostnad går din marginal från ${fmt(currentMargin)} kr till ${fmt(newMargin)} kr/mån — det är ${fmt(delta * 12)} kr mindre per år att röra dig med.`,
    metrics: [
      { label: 'Marginal idag', value: currentMargin, format: 'kr' },
      { label: 'Ny marginal', value: newMargin, format: 'kr', tone: newMargin < 0 ? 'critical' : undefined },
      { label: 'Skillnad per år', value: -delta * 12, format: 'kr' },
    ],
    chart: {
      type: 'bar',
      data: [
        { x: 'Idag', value: currentMargin },
        { x: 'Efter flytt', value: newMargin, tone: newMargin < currentMargin ? 'critical' : 'accent' },
      ],
    },
  };
}

function calcTravelBudget(profile, transactions) {
  const margin = getMonthlyMargin(profile);
  const variableSpend = ['food', 'entertainment', 'shopping'].reduce(
    (s, cat) => s + avgMonthlySpend(transactions, { category: cat }),
    0,
  );
  const discretionary = Math.max(0, margin - variableSpend);
  const travelAnnual = Math.round(discretionary * 12 * 0.3);

  return {
    title: 'Hur mycket kan jag resa om året?',
    narrative: `Din marginal är ${fmt(margin)} kr/mån. Efter dina vanliga vardagsutgifter (mat, nöje, shopping — ca ${fmt(variableSpend)} kr/mån) har du ${fmt(discretionary)} kr kvar. Öronmärker du 30% av det för resor får du en reskassa på ${fmt(travelAnnual)} kr/år utan att det påverkar sparandet.`,
    metrics: [
      { label: 'Marginal/mån', value: margin, format: 'kr' },
      { label: 'Kvar efter vardagen', value: discretionary, format: 'kr' },
      { label: 'Reskassa/år', value: travelAnnual, format: 'kr', accent: true },
    ],
    chart: {
      type: 'bar',
      data: [
        { x: 'Marginal', value: margin },
        { x: 'Efter vardagsutgifter', value: discretionary },
        { x: 'Reskassa (30%)', value: travelAnnual, accent: true },
      ],
    },
  };
}

function calcHomePurchaseTiming(profile, transactions) {
  const hasGoal = profile?.savingsGoal > 0;
  const target = hasGoal ? profile.savingsGoal : 300000;
  const assumption = hasGoal ? null : 'Räknat på en kontantinsats på 300 000 kr — sätt ett riktigt sparmål under Sparmål för en säkrare kalkyl.';
  const current = profile?.savingsCurrentBalance || 0;
  const margin = getMonthlyMargin(profile);
  const monthlyRate = profile?.savingsGoalMonthlyTarget > 0 ? profile.savingsGoalMonthlyTarget : Math.max(500, Math.round(margin * 0.3));
  const remaining = Math.max(0, target - current);
  const monthsLeft = monthlyRate > 0 ? Math.ceil(remaining / monthlyRate) : null;

  const months = Math.min(120, (monthsLeft || 24) + 6);
  const growth = buildGrowthSeries({ startingAmount: current, monthlyContribution: monthlyRate, months, investedRate: 0 });
  const timeline = growth.map((p) => ({ ...p, x: `Mån ${p.month}`, saldo: p.saved, mål: target }));

  return {
    title: 'När kan jag köpa bostad?',
    assumption,
    narrative: monthsLeft
      ? `Med ${fmt(current)} kr sparat och ${fmt(monthlyRate)} kr/mån når du din kontantinsats på ${fmt(target)} kr om ungefär ${monthsLeft} månader (${Math.round(monthsLeft / 12 * 10) / 10} år).`
      : `Du behöver sätta ett månatligt sparbelopp för att jag ska kunna räkna ut en tidslinje.`,
    metrics: [
      { label: 'Mål', value: target, format: 'kr' },
      { label: 'Sparat idag', value: current, format: 'kr' },
      { label: 'Månader kvar', value: monthsLeft || 0, format: 'months', accent: true },
    ],
    chart: {
      type: 'line',
      data: timeline,
      lines: [
        { key: 'saldo', label: 'Sparat', color: 'accent' },
        { key: 'mål', label: 'Mål', color: 'muted', dashed: true },
      ],
    },
  };
}

function calcNetWorthProjection(profile, transactions, params) {
  const years = params.years || 10;
  const buffer = profile?.buffer || 0;
  const saved = profile?.savingsCurrentBalance || 0;
  const debt = (profile?.loans || []).reduce((s, l) => s + (l.totalAmount || 0), 0);
  const startingNetWorth = buffer + saved - debt;
  const margin = Math.max(0, getMonthlyMargin(profile));

  const growth = buildGrowthSeries({ startingAmount: startingNetWorth, monthlyContribution: margin, months: years * 12 });
  const end = growth[growth.length - 1];

  return {
    title: `Nettoförmögenhet om ${years} år`,
    assumption: `Antar att hela din nuvarande marginal (${fmt(margin)} kr/mån) sparas eller investeras framåt.`,
    narrative: `Du har ${fmt(startingNetWorth)} kr i nettoförmögenhet idag (buffert + sparande − skulder). Sparar du hela din marginal varje månad har du ${fmt(end.saved)} kr om ${years} år — investerar du den istället blir det ${fmt(end.invested)} kr.`,
    metrics: [
      { label: 'Idag', value: startingNetWorth, format: 'kr' },
      { label: `Om ${years} år, sparat`, value: end.saved, format: 'kr' },
      { label: `Om ${years} år, investerat`, value: end.invested, format: 'kr', accent: true },
    ],
    chart: {
      type: 'line',
      data: series(growth, { yearly: true }),
      lines: [
        { key: 'saved', label: 'Sparat', color: 'muted' },
        { key: 'invested', label: 'Investerat', color: 'accent' },
      ],
    },
  };
}

function calcInflationStress(profile, transactions, params) {
  const pct = params.amountKr && params.amountKr <= 30 ? params.amountKr : 5;
  const fixed = getTotalFixedCosts(profile);
  const newFixed = Math.round(fixed * (1 + pct / 100));
  const margin = getMonthlyMargin(profile);
  const newMargin = (profile?.income || 0) - newFixed;

  return {
    title: `Inflation +${pct}%`,
    assumption: `Räknat på ${pct}% högre fasta kostnader — ett rimligt stresstest-antagande.`,
    narrative: `Om dina fasta kostnader (${fmt(fixed)} kr/mån) stiger ${pct}% blir de ${fmt(newFixed)} kr/mån. Din marginal krymper från ${fmt(margin)} kr till ${fmt(newMargin)} kr — ${fmt(margin - newMargin)} kr mindre per månad.`,
    metrics: [
      { label: 'Fasta kostnader idag', value: fixed, format: 'kr' },
      { label: `Vid +${pct}% inflation`, value: newFixed, format: 'kr' },
      { label: 'Ny marginal', value: newMargin, format: 'kr', tone: newMargin < margin ? 'critical' : 'accent' },
    ],
    chart: {
      type: 'bar',
      data: [
        { x: 'Marginal idag', value: margin },
        { x: 'Marginal vid inflation', value: newMargin, tone: 'critical' },
      ],
    },
  };
}

function calcJobLoss(profile, transactions, params) {
  const months = params.months || 6;
  const fixed = getTotalFixedCosts(profile);
  const variableSpend = avgMonthlySpend(transactions, {}, 3) || Math.round((profile?.income || 0) * 0.15);
  const monthlyBurn = fixed + variableSpend;
  const buffer = profile?.buffer || 0;
  const monthsUntilZero = monthlyBurn > 0 ? buffer / monthlyBurn : Infinity;

  const timeline = [];
  let bal = buffer;
  for (let m = 0; m <= months; m++) {
    if (m > 0) bal -= monthlyBurn;
    timeline.push({ month: m, x: `Mån ${m}`, saldo: Math.round(bal) });
  }
  const survives = monthsUntilZero >= months;

  return {
    title: `Arbetslös i ${months} månader`,
    narrative: survives
      ? `Din buffert på ${fmt(buffer)} kr räcker till dina fasta kostnader och vanliga utgifter (${fmt(monthlyBurn)} kr/mån) i minst ${months} månader.`
      : `Med ${fmt(monthlyBurn)} kr/mån i fasta + rörliga kostnader tar din buffert på ${fmt(buffer)} kr slut efter ungefär ${Math.floor(monthsUntilZero)} månader — innan de ${months} månaderna är slut.`,
    metrics: [
      { label: 'Buffert idag', value: buffer, format: 'kr' },
      { label: 'Förbrukning/mån', value: monthlyBurn, format: 'kr' },
      { label: 'Månader bufferten räcker', value: Math.floor(monthsUntilZero) === Infinity ? months : Math.floor(monthsUntilZero), format: 'months', tone: survives ? 'accent' : 'critical' },
    ],
    chart: {
      type: 'line',
      data: timeline,
      lines: [{ key: 'saldo', label: 'Buffert', color: survives ? 'accent' : 'critical' }],
    },
  };
}

function calcExtraAmortization(profile, transactions, params) {
  const loans = profile?.loans || [];
  if (!loans.length) {
    return {
      title: 'Amortera mer',
      narrative: 'Du har inga registrerade lån att amortera extra på.',
      metrics: [],
      chart: null,
    };
  }
  const margin = getMonthlyMargin(profile);
  const extra = params.amountKr || Math.max(0, Math.round(Math.min(margin * 0.2, 500)));
  const assumption = params.amountKr ? null : `Räknat på ${fmt(extra)} kr/mån extra (en del av din marginal) eftersom inget belopp angavs.`;
  const boostIndex = pickBoostLoanIndex(loans);
  const monthsNow = estimateMonthsToDebtFree(loans);
  const monthsWithExtra = monthsToDebtFreeWithExtra(loans, boostIndex, extra);
  const monthsSaved = Math.max(0, monthsNow - monthsWithExtra);

  return {
    title: `Amortera ${fmt(extra)} kr extra/mån`,
    assumption,
    narrative: `Med ${fmt(extra)} kr extra i amortering varje månad på ${loans[boostIndex]?.name || 'ditt lån med högst ränta'} blir du skuldfri ${monthsSaved} månader tidigare — ${monthsWithExtra} månader istället för ${monthsNow}.`,
    metrics: [
      { label: 'Månader kvar idag', value: monthsNow, format: 'months' },
      { label: 'Med extra amortering', value: monthsWithExtra, format: 'months', accent: true },
      { label: 'Månader sparade', value: monthsSaved, format: 'months' },
    ],
    chart: {
      type: 'bar',
      data: [
        { x: 'Idag', value: monthsNow },
        { x: 'Med extra amortering', value: monthsWithExtra, accent: true },
      ],
    },
  };
}

function calcHaveChild(profile, transactions) {
  const estimatedCost = 3500;
  const childBenefit = 1250;
  const netCost = estimatedCost - childBenefit;
  const margin = getMonthlyMargin(profile);
  const newMargin = margin - netCost;

  return {
    title: 'Få barn',
    assumption: `Räknat på ett schablonbelopp: ~${fmt(estimatedCost)} kr/mån i extra kostnader, minus barnbidrag (${fmt(childBenefit)} kr) — verklig kostnad varierar mycket.`,
    narrative: `Efter barnbidrag landar den extra månadskostnaden på ungefär ${fmt(netCost)} kr. Din marginal skulle gå från ${fmt(margin)} kr till ${fmt(newMargin)} kr/mån.`,
    metrics: [
      { label: 'Marginal idag', value: margin, format: 'kr' },
      { label: 'Extra kostnad, netto', value: netCost, format: 'kr' },
      { label: 'Ny marginal', value: newMargin, format: 'kr', tone: newMargin < 0 ? 'critical' : undefined },
    ],
    chart: {
      type: 'bar',
      data: [
        { x: 'Idag', value: margin },
        { x: 'Med barn', value: newMargin, tone: newMargin < margin ? 'critical' : 'accent' },
      ],
    },
  };
}

function calcMicroSpendingAudit(profile, transactions) {
  const threshold = 150;
  const cutoff = monthsAgo(3);
  const micro = (transactions || []).filter((t) => {
    if (!isExpense(t)) return false;
    const d = new Date(t.created_date || t.date);
    return d >= cutoff && Math.abs(t.amount) < threshold;
  });
  const total = micro.reduce((s, t) => s + Math.abs(t.amount), 0);
  const monthly = total / 3;
  const annual = monthly * 12;

  if (!micro.length) {
    return {
      title: 'Vad kostar mina småköp?',
      narrative: 'Jag hittade inga köp under 150 kr de senaste tre månaderna att räkna på.',
      metrics: [],
      chart: null,
    };
  }

  const byCategory = {};
  micro.forEach((t) => {
    const cat = t.category || 'other';
    byCategory[cat] = (byCategory[cat] || 0) + Math.abs(t.amount);
  });
  const chartData = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, val]) => ({ x: BUDGET_CATEGORY_META[cat]?.label || cat, value: Math.round(val) }));

  return {
    title: 'Vad kostar mina småköp?',
    narrative: `Du gjorde ${micro.length} köp under ${threshold} kr de senaste tre månaderna — tillsammans ${fmt(total)} kr, eller ${fmt(monthly)} kr/mån. Det blir ${fmt(annual)} kr per år om mönstret håller i sig.`,
    metrics: [
      { label: 'Antal köp (3 mån)', value: micro.length, format: 'count' },
      { label: 'Per månad', value: monthly, format: 'kr' },
      { label: 'Per år', value: annual, format: 'kr', accent: true },
    ],
    chart: { type: 'bar', data: chartData },
  };
}

const CALCULATORS = {
  eliminate_recurring: calcEliminateRecurring,
  increase_savings: calcIncreaseSavings,
  salary_change: calcSalaryChange,
  one_time_purchase: calcOneTimePurchase,
  start_investing: calcStartInvesting,
  relocate: calcRelocate,
  travel_budget: calcTravelBudget,
  home_purchase_timing: calcHomePurchaseTiming,
  net_worth_projection: calcNetWorthProjection,
  inflation_stress: calcInflationStress,
  job_loss: calcJobLoss,
  extra_amortization: calcExtraAmortization,
  have_child: calcHaveChild,
  micro_spending_audit: calcMicroSpendingAudit,
};

/** Kör rätt kalkyl för ett klassificerat intent. Returnerar null om intentet är okänt. */
export function computeScenario(intent, params, profile, transactions) {
  const calc = CALCULATORS[intent];
  if (!calc) return null;
  return calc(profile, transactions || [], params || {});
}
