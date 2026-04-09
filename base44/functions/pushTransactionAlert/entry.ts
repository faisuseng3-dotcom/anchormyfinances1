import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import webpush from 'npm:web-push@3.6.7';

webpush.setVapidDetails(
  Deno.env.get('VAPID_EMAIL'),
  Deno.env.get('VAPID_PUBLIC_KEY'),
  Deno.env.get('VAPID_PRIVATE_KEY')
);

async function sendPush(subscriptions, payload) {
  await Promise.allSettled(
    subscriptions.map(sub =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload)
      )
    )
  );
}

// Triggered via entity automation on Transaction create
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { data: transaction, event } = body;

    if (!transaction || transaction.type !== 'expense') {
      return Response.json({ skipped: true, reason: 'not_expense' });
    }

    const userEmail = transaction.created_by;
    if (!userEmail) return Response.json({ skipped: true });

    // Hämta användarens subscriptions
    const subs = await base44.asServiceRole.entities.PushSubscription.filter({
      user_email: userEmail,
      active: true
    });
    if (subs.length === 0) return Response.json({ skipped: true, reason: 'no_subscriptions' });

    // Hämta senaste 30 transaktioner för att räkna snitt
    const recentTxs = await base44.asServiceRole.entities.Transaction.filter({ created_by: userEmail });
    const expenses = recentTxs
      .filter(t => t.type === 'expense' && t.id !== transaction.id)
      .slice(0, 30);

    if (expenses.length < 5) {
      return Response.json({ skipped: true, reason: 'not_enough_history' });
    }

    const avg = expenses.reduce((s, t) => s + Math.abs(t.amount || 0), 0) / expenses.length;
    const currentAmount = Math.abs(transaction.amount || 0);

    // Trigga om beloppet är > 200% av snittet
    if (currentAmount < avg * 2) {
      return Response.json({ skipped: true, reason: 'within_normal_range', avg, current: currentAmount });
    }

    const vendor = transaction.vendor || transaction.label || 'okänd plats';
    const formattedAmount = currentAmount.toLocaleString('sv-SE');

    const payload = {
      title: '🛡️ Säkerhetskoll',
      body: `En ovanligt stor dragning (${formattedAmount} kr) gjordes hos ${vendor}. Var det du?`,
      icon: '/icon-192.png',
      badge: '/icon-96.png',
      category: 'security',
      url: '/TransactionHistory',
      timestamp: Date.now(),
      actions: [
        { action: 'confirm', title: 'Ja, det var jag' },
        { action: 'investigate', title: 'Undersök' }
      ]
    };

    await sendPush(subs, payload);

    return Response.json({ success: true, alert_sent: true, amount: currentAmount, avg });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});