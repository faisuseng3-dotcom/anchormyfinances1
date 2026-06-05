/**
 * Coaching-ton — konkreta belopp, vardagsjämförelser, inbjudan (inte observationsrapporter).
 */

import { stripDisclaimerFromText } from '@/lib/disclaimerCopy';

const MONTH_NAMES = [
  'januari', 'februari', 'mars', 'april', 'maj', 'juni',
  'juli', 'augusti', 'september', 'oktober', 'november', 'december',
];

export function fmtKr(n) {
  return Math.round(n || 0).toLocaleString('sv-SE');
}

export function monthLabel(yyyyMM) {
  if (!yyyyMM) return 'den här månaden';
  const [y, m] = yyyyMM.split('-').map(Number);
  if (!m || m < 1 || m > 12) return 'den här månaden';
  const name = MONTH_NAMES[m - 1];
  const now = new Date();
  return now.getFullYear() === y ? name : `${name} ${y}`;
}

/** Hitta en vardagsjämförelse för ett belopp (gym, streaming, luncher …). */
export function findMoneyComparison(amountKr, profile, hint) {
  const kr = Math.round(amountKr || 0);
  if (kr <= 0) return null;

  const subs = profile?.subscriptions || [];
  const gym = subs.find((s) => /gym|sats|actic|friskis|nordic/i.test(s.name || ''));
  if (gym?.amount && kr >= gym.amount * 0.65) {
    return `nästan ditt ${gym.name}-medlemskap på ${fmtKr(gym.amount)} kr — kanske ett du knappt hinner använda`;
  }

  const streaming = subs.find((s) => /netflix|spotify|hbo|viaplay|disney|tv4/i.test(s.name || ''));
  if (streaming?.amount && kr >= streaming.amount * 0.8) {
    return `ungefär som ${streaming.name} (${fmtKr(streaming.amount)} kr/mån)`;
  }

  const lunchCount = Math.max(2, Math.round(kr / 120));
  if (hint === 'food' || kr >= 400) {
    return `cirka ${lunchCount} luncher ute du kanske inte minns`;
  }

  if (kr >= 800) return `ett par abonnemang du glömde bort`;
  if (kr >= 300) return `flera småköp som var för sig känns harmlösa`;
  return `mer än du kanske märker i vardagen`;
}

export function coachInvite(action = 'titta på det') {
  return `Vill du ${action}?`;
}

/** Gör LLM-/bullet-text till flytande prosa (klok vän, inte rapport). */
export function formatCoachText(text) {
  if (!text || typeof text !== 'string') return text;
  text = stripDisclaimerFromText(text);
  const lines = text.trim().split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return text;

  const isBulletBlock = lines.length > 1 && lines.every((l) => /^[-•*]\s/.test(l) || /^\d+[.)]\s/.test(l));
  if (isBulletBlock) {
    return lines
      .map((l) => l.replace(/^[-•*]\s*/, '').replace(/^\d+[.)]\s*/, '').trim())
      .filter(Boolean)
      .map((s) => (s.endsWith('.') || s.endsWith('?') || s.endsWith('!') ? s : `${s}.`))
      .join(' ');
  }

  return text
    .replace(/\n[-•*]\s+/g, ' ')
    .replace(/\s+[-•*]\s+/g, ', ')
    .replace(/\n{2,}/g, '\n\n')
    .trim();
}

/** Rensa rådgivarsvar från punktlistor i alla textfält. */
export function sanitizeAdvisorResponse(data) {
  if (!data || typeof data !== 'object') return data;
  const out = { ...data };
  const keys = [
    'body', 'message', 'answer', 'takeaway', 'summary', 'highlight', 'next_step',
    'insight', 'story', 'feeling_line', 'tip', 'headline', 'wake_line', 'share_caption', 'cta',
  ];
  keys.forEach((k) => {
    if (typeof out[k] === 'string') out[k] = formatCoachText(out[k]);
  });
  if (Array.isArray(out.actions)) {
    out.actions = out.actions.map((a) => ({
      ...a,
      title: typeof a.title === 'string' ? formatCoachText(a.title) : a.title,
      detail: typeof a.detail === 'string' ? formatCoachText(a.detail) : a.detail,
    }));
  }
  return out;
}
