import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import webpush from 'npm:web-push@3.6.7';

webpush.setVapidDetails(
  Deno.env.get('VAPID_EMAIL'),
  Deno.env.get('VAPID_PUBLIC_KEY'),
  Deno.env.get('VAPID_PRIVATE_KEY')
);

function isQuietHours() {
  const now = new Date();
  const hour = (now.getUTCHours() + 1) % 24; // Stockholm UTC+1
  return hour >= 22 || hour < 7.5;
}

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

// Körs via schemalagd automation (varje dag) — skannar alla användares subscriptions
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    if (isQuietHours()) {
      return Response.json({ skipped: true, reason: 'quiet_hours' });
    }

    // Hämta alla aktiva subscriptions
    const allSubs = await base44.asServiceRole.entities.PushSubscription.filter({ active: true });
    if (allSubs.length === 0) return Response.json({ sent: 0 });

    // Gruppera per e-post
    const byEmail = {};
    for (const sub of allSubs) {
      if (!byEmail[sub.user_email]) byEmail[sub.user_email] = [];
      byEmail[sub.user_email].push(sub);
    }

    let totalSent = 0;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    for (const [email, subs] of Object.entries(byEmail)) {
      const profiles = await base44.asServiceRole.entities.FinancialProfile.filter({ created_by: email });
      const profile = profiles[0];
      if (!profile?.subscriptions?.length) continue;

      // Hämta transaktioner senaste 30 dagar
      const txs = await base44.asServiceRole.entities.Transaction.filter({ created_by: email });
      const recentTxs = txs.filter(t => t.created_date >= thirtyDaysAgo);

      for (const sub of profile.subscriptions) {
        const subNameLower = sub.name?.toLowerCase() || '';

        // Kolla om det finns en transaktion som matchar prenumerationsnamnet
        const hasUsed = recentTxs.some(t => {
          const vendor = (t.vendor || t.label || '').toLowerCase();
          return vendor.includes(subNameLower) || subNameLower.includes(vendor.split(' ')[0]);
        });

        if (!hasUsed && sub.amount > 0) {
          const payload = {
            title: 'Besparing hittad',
            body: `Du betalar för ${sub.name} men har inte använt den på 30 dagar. Vill du pausa den?`,
            icon: '/icon-192.png',
            badge: '/icon-96.png',
            category: 'pengajakten',
            url: '/Settings',
            timestamp: Date.now(),
            actions: [
              { action: 'fix', title: 'Ja, fixa det' },
              { action: 'dismiss', title: 'Ignorera' }
            ]
          };

          await sendPush(subs, payload);
          totalSent++;
          break; // Max en notis per användare per körning
        }
      }

      // Kolla resell-möjligheter (priceWatches)
      if (profile.priceWatches?.length) {
        for (const watch of profile.priceWatches) {
          if (!watch.productName || !watch.currentLowestPrice) continue;

          // Simulera prisökning: om inget uppdateringsdatum, skip
          // I produktion skulle man jämföra mot ett referenspris
          // Här triggar vi om priset är satt och objektet lagts till > 7 dagar sedan
          const addedDate = new Date(watch.addedDate || 0);
          const daysSinceAdded = (now - addedDate) / (1000 * 60 * 60 * 24);

          if (daysSinceAdded > 7 && watch.currentLowestPrice > 100) {
            const potentialEarning = Math.round(watch.currentLowestPrice * 0.75);
            const payload = {
              title: 'Säljläge',
              body: `Marknadspriset på ${watch.productName} är ${watch.currentLowestPrice.toLocaleString('sv-SE')} kr. Sälj nu och tjäna ca ${potentialEarning.toLocaleString('sv-SE')} kr.`,
              icon: '/icon-192.png',
              badge: '/icon-96.png',
              category: 'pengajakten',
              url: '/ResellScanner',
              timestamp: Date.now(),
              actions: [
                { action: 'sell', title: 'Sälj nu' },
                { action: 'dismiss', title: 'Senare' }
              ]
            };

            await sendPush(subs, payload);
            totalSent++;
            break;
          }
        }
      }
    }

    return Response.json({ success: true, sent: totalSent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});