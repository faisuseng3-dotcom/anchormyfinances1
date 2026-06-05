/**
 * Proaktiva förutsägelser — vad som väntar, inte vad som hänt.
 */
import { buildUpcomingExpenses } from '@/components/pulse/pulseEngine';

const fmt = (n) => Math.round(n || 0).toLocaleString('sv-SE');

/** Fasta utgifter de kommande 7 dagarna. */
export function getNextWeekFixedExpenses(profile, horizonDays = 7) {
  if (!profile) return null;

  const expenses = buildUpcomingExpenses(profile);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const items = [];

  for (let dayOffset = 0; dayOffset <= horizonDays; dayOffset++) {
    const d = new Date(today);
    d.setDate(today.getDate() + dayOffset);
    const dayOfMonth = d.getDate();

    expenses.forEach((exp) => {
      if (dayOfMonth === exp.dueDay) {
        items.push({
          ...exp,
          date: d,
          dayOffset,
          dayLabel: dayOffset === 0 ? 'Idag' : dayOffset === 1 ? 'Imorgon' : `Om ${dayOffset} dagar`,
        });
      }
    });
  }

  items.sort((a, b) => a.dayOffset - b.dayOffset);

  const totalKr = items.reduce((s, i) => s + (i.amount || 0), 0);
  const count = items.length;

  if (count === 0) return null;

  const names = items.slice(0, 3).map((i) => i.name).join(', ');
  const extra = count > 3 ? ` och ${count - 3} till` : '';

  const pushTitle = count === 1 ? 'En fast utgift väntar' : `${count} fasta utgifter väntar`;
  const pushBody =
    count === 1
      ? `${items[0].name} på ${fmt(items[0].amount)} kr ${items[0].dayLabel.toLowerCase()} — se till att du har det på kontot.`
      : `Nästa vecka har du ${count} fasta utgifter på totalt ${fmt(totalKr)} kr (${names}${extra}) — se till att du har dem på kontot.`;

  const inAppLine =
    count === 1
      ? `${items[0].name} (${fmt(items[0].amount)} kr) ${items[0].dayLabel.toLowerCase()}.`
      : `${count} fasta utgifter på ${fmt(totalKr)} kr nästa vecka.`;

  return {
    count,
    totalKr,
    items,
    pushTitle,
    pushBody,
    inAppLine,
    urgency: totalKr > (profile.buffer || 0) * 0.4 ? 'high' : 'normal',
  };
}
