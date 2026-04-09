import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { endpoint, p256dh, auth } = await req.json();

    if (!endpoint || !p256dh || !auth) {
      return Response.json({ error: 'Saknar subscription-data' }, { status: 400 });
    }

    // Kolla om subscription redan finns
    const existing = await base44.entities.PushSubscription.filter({ endpoint });

    if (existing.length > 0) {
      // Uppdatera till aktiv om den var inaktiv
      await base44.entities.PushSubscription.update(existing[0].id, {
        active: true,
        p256dh,
        auth,
        user_id: user.id,
        user_email: user.email
      });
      return Response.json({ success: true, updated: true });
    }

    // Skapa ny subscription
    await base44.entities.PushSubscription.create({
      user_id: user.id,
      user_email: user.email,
      endpoint,
      p256dh,
      auth,
      active: true,
      quiet_hours_enabled: true
    });

    return Response.json({ success: true, created: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});