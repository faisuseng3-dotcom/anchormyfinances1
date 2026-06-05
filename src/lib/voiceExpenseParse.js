/**
 * Snabb röst-tolkning av utgifter — regex först, GPT som backup.
 */
import { categorizeOnDevice } from '@/lib/onDeviceMl';

const EXPENSE_RE = /(?:spenderade|spenderat|köpte|betalade|la ut|gav ut|handlade).{0,40}?(\d[\d\s]*)\s*(?:kr|kronor|:-)/i;
const SIMPLE_QUESTION_RE = /^(hur mycket|vad har jag|hur går det|hur ser det ut)/i;

export function isVoiceExpenseUtterance(text) {
  return EXPENSE_RE.test(text);
}

export function isVoiceQuickQuestion(text) {
  return SIMPLE_QUESTION_RE.test(text?.trim());
}

/** Parsa belopp + beskrivning lokalt (<1ms) */
export function parseVoiceExpenseLocal(text) {
  const match = text.match(EXPENSE_RE);
  if (!match) return null;

  const amount = parseInt(match[1].replace(/\s/g, ''), 10);
  if (!amount || amount <= 0) return null;

  const afterAmount = text.slice(match.index + match[0].length).trim();
  const beforeAmount = text.slice(0, match.index);
  const context = `${beforeAmount} ${afterAmount}`.replace(EXPENSE_RE, '').trim();
  const onMatch = text.match(/(?:på|hos|från|i)\s+(.+?)(?:\s+\d|\s*$)/i);
  const vendor = (onMatch?.[1] || context || 'Utgift').trim().slice(0, 60);

  const { category } = categorizeOnDevice(vendor, { amount });

  return {
    amount,
    vendor,
    category,
    label: vendor,
    source: 'voice_local',
  };
}
