// @ts-nocheck
/**
 * businessTaxEngine — Skatte-ångest-lösaren för Lago Business.
 * Räknar ut vad som är "dina" pengar vs moms/skatt-reserv.
 */

const ENTITY = {
  enskild: {
    label: 'Enskild firma',
    egenavgifter: 0.2897,
    prelimSkatt: 0.30,
    transferLabel: 'Nettolön — säkert att föra över till privat',
  },
  ab: {
    label: 'Aktiebolag',
    bolagsskatt: 0.206,
    arbgivaravgift: 0.12,
    transferLabel: 'Utdelning / lön — säkert att föra över till privat',
  },
};

function fmt(n) {
  return Math.round(n || 0).toLocaleString('sv-SE');
}

/** Moms inkluderad i bruttobelopp (svensk standard 25 %) */
export function splitDeposit(grossInclVat, entityType = 'enskild', vatRate = 0.25) {
  const gross = Math.max(0, grossInclVat);
  const vatAmount = Math.round(gross - gross / (1 + vatRate));
  const exVat = gross - vatAmount;
  const cfg = ENTITY[entityType] || ENTITY.enskild;

  let taxReserve = 0;
  let yours = 0;
  const rows = [
    { key: 'gross', label: 'Inbetalt (inkl. moms)', amount: gross, sign: '' },
    { key: 'vat', label: `Moms ${Math.round(vatRate * 100)}% (tillhör staten)`, amount: vatAmount, sign: '−' },
  ];

  if (entityType === 'ab') {
    const bolagsskatt = Math.round(exVat * cfg.bolagsskatt);
    const arbgivar = Math.round(exVat * cfg.arbgivaravgift);
    taxReserve = bolagsskatt + arbgivar;
    yours = Math.max(0, exVat - taxReserve);
    rows.push(
      { key: 'corp_tax', label: 'Bolagsskatt 20,6% (reserv)', amount: bolagsskatt, sign: '−' },
      { key: 'employer', label: 'Arbetsgivaravgifter (reserv)', amount: arbgivar, sign: '−' },
    );
  } else {
    const egenavgifter = Math.round(exVat * cfg.egenavgifter);
    const prelimSkatt = Math.round((exVat - egenavgifter) * cfg.prelimSkatt);
    taxReserve = egenavgifter + prelimSkatt;
    yours = Math.max(0, exVat - taxReserve);
    rows.push(
      { key: 'egen', label: 'Egenavgifter 28,97%', amount: egenavgifter, sign: '−' },
      { key: 'f_skatt', label: 'Prelim. F-skatt ~30%', amount: prelimSkatt, sign: '−' },
    );
  }

  rows.push({ key: 'yours', label: 'Dina rena pengar', amount: yours, sign: '=', highlight: true });

  return {
    gross,
    vatAmount,
    exVat,
    taxReserve,
    reservedTotal: vatAmount + taxReserve,
    yours,
    rows,
    yoursPct: gross > 0 ? Math.round((yours / gross) * 100) : 0,
    transferLabel: cfg.transferLabel,
  };
}

/** Kontonivå — använder faktisk moms-reserv från bokföring */
export function calcAccountTaxBreakdown(grossBalance, vatReserved, entityType = 'enskild') {
  const gross = Math.max(0, grossBalance);
  const vat = Math.max(0, Math.min(vatReserved, gross));
  const netAfterVat = gross - vat;
  const cfg = ENTITY[entityType] || ENTITY.enskild;

  let taxReserve = 0;
  if (entityType === 'ab') {
    taxReserve = Math.round(netAfterVat * cfg.bolagsskatt) + Math.round(netAfterVat * cfg.arbgivaravgift);
  } else {
    const egen = Math.round(netAfterVat * cfg.egenavgifter);
    taxReserve = egen + Math.round((netAfterVat - egen) * cfg.prelimSkatt);
  }

  const yours = Math.max(0, gross - vat - taxReserve);

  const rows = [
    { key: 'gross', label: 'Totalt på banken', amount: gross, sign: '' },
    { key: 'vat', label: 'Moms-sköld (tillhör staten)', amount: vat, sign: '−' },
  ];

  if (entityType === 'ab') {
    rows.push(
      { key: 'corp_tax', label: 'Bolagsskatt 20,6% (reserv)', amount: Math.round(netAfterVat * cfg.bolagsskatt), sign: '−' },
      { key: 'employer', label: 'Arbetsgivaravgifter (reserv)', amount: Math.round(netAfterVat * cfg.arbgivaravgift), sign: '−' },
    );
  } else {
    const egen = Math.round(netAfterVat * cfg.egenavgifter);
    rows.push(
      { key: 'egen', label: 'Egenavgifter 28,97%', amount: egen, sign: '−' },
      { key: 'f_skatt', label: 'Prelim. F-skatt ~30%', amount: Math.round((netAfterVat - egen) * cfg.prelimSkatt), sign: '−' },
    );
  }

  rows.push({ key: 'yours', label: cfg.transferLabel, amount: yours, sign: '=', highlight: true });

  return {
    gross,
    vatReserved: vat,
    taxReserve,
    yours,
    reservedTotal: vat + taxReserve,
    rows,
    yoursPct: gross > 0 ? Math.round((yours / gross) * 100) : 0,
    transferLabel: cfg.transferLabel,
    entityLabel: cfg.label,
  };
}

export function calcSafeToSpend(grossBalance, vatReserved, entityType = 'enskild') {
  const b = calcAccountTaxBreakdown(grossBalance, vatReserved, entityType);
  return { safeToSpend: b.yours, label: b.transferLabel };
}

function parseTxDate(str) {
  if (!str) return null;
  const lower = String(str).toLowerCase().trim();
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  if (lower === 'idag') return today;
  if (lower === 'igår' || lower === 'igar') {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    return d;
  }
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) return parsed;
  return null;
}

function relativeDateLabel(dateObj) {
  if (!dateObj) return 'nyligen';
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const d = new Date(dateObj);
  d.setHours(12, 0, 0, 0);
  const diff = Math.round((today - d) / 86400000);
  if (diff <= 0) return 'idag';
  if (diff === 1) return 'igår';
  if (diff <= 7) return `för ${diff} dagar sedan`;
  return d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
}

/** Senaste inkomstinbetalning (för narrativ) */
export function findRecentIncome(transactions, maxDays = 14) {
  const today = new Date();
  const candidates = (transactions || [])
    .filter((t) => t.amount > 0 || t.type === 'income')
    .map((t) => ({
      ...t,
      gross: Math.abs(t.amount),
      name: t.vendor || t.label || t.client || 'Inbetalning',
      dateObj: parseTxDate(t.date || t.created_date),
    }))
    .filter((t) => t.gross > 0);

  const recent = candidates
    .filter((t) => {
      if (!t.dateObj) return candidates.length <= 3;
      return (today - t.dateObj) / 86400000 <= maxDays;
    })
    .sort((a, b) => (b.dateObj || 0) - (a.dateObj || 0));

  return recent[0] || null;
}

/** Lugn coach-text — skatte-ångest-lösaren */
export function buildTaxClarityMessage(accountBreakdown, recentIncome, entityType = 'enskild') {
  const { yours, gross, reservedTotal, transferLabel } = accountBreakdown;

  if (gross <= 0) {
    return 'När pengar kommer in på företagskontot visar vi direkt hur mycket som är dina — och hur mycket som ska ligga kvar till moms och skatt.';
  }

  if (recentIncome) {
    const split = splitDeposit(recentIncome.gross, entityType);
    const when = relativeDateLabel(recentIncome.dateObj);
    return (
      `Av de ${fmt(recentIncome.gross)} kr som kom in ${when} (${recentIncome.name}) ` +
      `är cirka ${fmt(split.yours)} kr dina rena, skattade pengar. ` +
      `De kan du flytta till privatkontot med gott samvete. ` +
      `Resten (${fmt(split.reservedTotal)} kr) låter du ligga kvar till moms och skatt.`
    );
  }

  return (
    `Du har ${fmt(gross)} kr på företagskontot. ` +
    `Efter moms och skatt är ${fmt(yours)} kr ${transferLabel.toLowerCase()}. ` +
    `Resten (${fmt(reservedTotal)} kr) ska ligga kvar — då slipper du skatte-ångest senare.`
  );
}

export { fmt as fmtSek };
