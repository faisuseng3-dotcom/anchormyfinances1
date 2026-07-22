import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import webpush from 'npm:web-push@3.6.7';

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY');
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY');
const VAPID_EMAIL = Deno.env.get('VAPID_EMAIL');

webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, body, icon, category, targetUserId } = await req.json();

    // Admin kan skicka till specifik användare, annars till sig själv
    const userId = (user.role === 'admin' && targetUserId) ? targetUserId : user.id;

    // Hämta aktiva subscriptions för användaren
    const subscriptions = await base44.asServiceRole.entities.PushSubscription.filter({
      user_id: userId,
      active: true
    });

    if (subscriptions.length === 0) {
      return Response.json({ success: false, message: 'Inga aktiva subscriptions' });
    }

    const payload = JSON.stringify({
      title: title || 'Lago',
      body: body || '',
      icon: icon || '/icon-192.png',
      badge: '/icon-96.png',
      category: category || 'general',
      timestamp: Date.now()
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };
        try {
          await webpush.sendNotification(pushSubscription, payload);
          return { success: true, id: sub.id };
        } catch (err) {
          // Subscription är inte längre giltig — markera som inaktiv
          if (err.statusCode === 410 || err.statusCode === 404) {
            await base44.asServiceRole.entities.PushSubscription.update(sub.id, { active: false });
          }
          throw err;
        }
      })
    );

    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return Response.json({ success: true, sent, failed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});