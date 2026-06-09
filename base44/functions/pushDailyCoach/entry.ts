import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import webpush from 'npm:web-push@3.6.7';

webpush.setVapidDetails(
  Deno.env.get('VAPID_EMAIL'),
  Deno.env.get('VAPID_PUBLIC_KEY'),
  Deno.env.get('VAPID_PRIVATE_KEY')
);

function isQuietHours() {
  const now = new Date();
  // Stockholm timezone offset (UTC+1 or UTC+2 in summer)
  const stockholmOffset = 1; // approximate — use UTC+1
  const hour = (now.getUTCHours() + stockholmOffset) % 24;
  return hour >= 22 || hour < 7.5;
}

function getTotalFixedCosts(profile) {
  if (profile.fixedCostItems?.length > 0) {
    return profile.fixedCostItems.reduce((s, i) => s + (i.amount || 0), 0);
  }
  const housing = profile.housingCost || 0;
  const subs = (profile.subscriptions || []).reduce((s: number, x: { amount?: number }) => s + (x.amount || 0), 0);
  const loans = (profile.loans || []).reduce((s: number, l: { monthlyPayment?: number }) => s + (l.monthlyPayment || 0), 0);
  return housing + subs + loans;
}

/** Fasta utgifter kommande 7 dagar — proaktiv förutsägelse. */
function getNextWeekFixedAlert(profile) {
  const items: { name: string; amount: number; dayOffset: number }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const push = (name: string, amount: number, dueDay: number) => {
    if (!amount || amount <= 0) return;
    for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
      const d = new Date(today);
      d.setDate(today.getDate() + dayOffset);
      if (d.getDate() === dueDay) {
        items.push({ name, amount, dayOffset });
        break;
      }
    }
  };

  if (profile.housingCost > 0) push('Hyra', profile.housingCost, profile.housingDueDay || 27);
  (profile.loans || []).forEach((l: { name?: string; monthlyPayment?: number }, i: number) => {
    push(l.name || 'Lån', l.monthlyPayment || 0, 5 + i);
  });
  (profile.subscriptions || []).forEach((s: { name?: string; amount?: number; billingDay?: number }, i: number) => {
    push(s.name || 'Abonnemang', s.amount || 0, s.billingDay || 10 + i);
  });

  if (items.length < 2) return null;

  items.sort((a, b) => a.dayOffset - b.dayOffset);
  const total = items.reduce((s, x) => s + x.amount, 0);
  const fmt = (n: number) => Math.round(n).toLocaleString('sv-SE');

  return {
    title: `${items.length} fasta utgifter väntar`,
    body: `Nästa vecka har du ${items.length} fasta utgifter på totalt ${fmt(total)} kr — se till att du har dem på kontot.`,
    url: '/FuturePulse',
  };
}

async function sendToUser(subscriptions, payload) {
  const results = await Promise.allSettled(
    subscriptions.map(sub =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload)
      )
    )
  );
  return results.filter(r => r.status === 'fulfilled').length;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    if (isQuietHours()) {
      return Response.json({ skipped: true, reason: 'quiet_hours' });
    }

    // Hämta alla aktiva subscriptions
    const allSubs = await base44.asServiceRole.entities.PushSubscription.filter({ active: true });
    if (allSubs.length === 0) return Response.json({ sent: 0 });

    // Gruppera per användare
    const byUser = {};
    for (const sub of allSubs) {
      if (!byUser[sub.user_id]) byUser[sub.user_id] = [];
      byUser[sub.user_id].push(sub);
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    let totalSent = 0;

    for (const [userId, subs] of Object.entries(byUser)) {
      // Hämta profil för användaren
      const profiles = await base44.asServiceRole.entities.FinancialProfile.filter({ created_by: subs[0].user_email });
      const profile = profiles[0];
      if (!profile) continue;

      const income = profile.income || 0;
      const fixedCosts = getTotalFixedCosts(profile);
      const monthlyMargin = income - fixedCosts;
      const dailyBudget = Math.round(monthlyMargin / 30);

      // Räkna ut vad som spenderats idag
      const todayExpenses = await base44.asServiceRole.entities.Transaction.filter({ created_by: subs[0].user_email });
      const todayTotal = todayExpenses
        .filter(t => t.type === 'expense' && t.created_date?.startsWith(todayStr))
        .reduce((s, t) => s + Math.abs(t.amount || 0), 0);

      const remaining = dailyBudget - todayTotal;
      const spentPct = dailyBudget > 0 ? todayTotal / dailyBudget : 0;

      // Typ: morgon-pepp (skickas av cron kl 08:30) eller budget-varning
      const { type } = await req.json().catch(() => ({ type: 'morning' }));

      let payload;

      if (type === 'morning') {
        payload = {
          title: 'God morgon',
          body: `Du har ${Math.max(0, remaining).toLocaleString('sv-SE')} kr att leva på idag — lugnt och förutsägbart.`,
          icon: '/icon-192.png',
          badge: '/icon-96.png',
          category: 'coaching',
          url: '/',
          timestamp: Date.now()
        };
      } else if (type === 'week_ahead') {
        const alert = getNextWeekFixedAlert(profile);
        if (!alert) continue;
        payload = {
          title: alert.title,
          body: alert.body,
          icon: '/icon-192.png',
          badge: '/icon-96.png',
          category: 'forecast',
          url: alert.url,
          timestamp: Date.now(),
        };
      } else if (type === 'budget_warning') {
        // Kolla om > 80% spenderat
        if (spentPct < 0.8) continue;
        // Kolla att klockan är före 18:00 Stockholm
        const hour = (now.getUTCHours() + 1) % 24;
        if (hour >= 18) continue;

        payload = {
          title: 'Lite kvar idag',
          body: 'Du närmar dig dagens utrymme — en lugn kväll hemma räcker långt.',
          icon: '/icon-192.png',
          badge: '/icon-96.png',
          category: 'coaching',
          url: '/Expenses',
          timestamp: Date.now(),
          actions: [
            { action: 'view', title: 'Se utgifter' },
            { action: 'dismiss', title: 'Ignorera' }
          ]
        };
      }

      if (payload) {
        const sent = await sendToUser(subs, payload);
        totalSent += sent;
      }
    }

    return Response.json({ success: true, sent: totalSent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});