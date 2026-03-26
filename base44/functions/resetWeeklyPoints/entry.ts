import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const COMPETITION_START = '2026-03-24';
const COMPETITION_END   = '2026-03-31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow scheduled calls (no user) or admin users
    let authorized = false;
    let isAdmin = false;
    try {
      const user = await base44.auth.me();
      authorized = user?.role === 'admin';
      isAdmin = authorized;
    } catch {
      // No auth = scheduled call, allow
      authorized = true;
    }

    if (!authorized) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const today = new Date().toISOString().split('T')[0];

    // Skip automatic reset during competition period (unless manually triggered by admin)
    if (!isAdmin && today >= COMPETITION_START && today <= COMPETITION_END) {
      return Response.json({
        skipped: true,
        reason: 'competition_active',
        message: 'Nollställning hoppas över under tävlingsperioden 24/3–31/3.',
      });
    }

    const allRecords = await base44.asServiceRole.entities.UserPoints.list('', 1000);
    await Promise.all(allRecords.map(rec =>
      base44.asServiceRole.entities.UserPoints.update(rec.id, { weekly_points: 0 })
    ));

    return Response.json({ reset: allRecords.length, timestamp: new Date().toISOString() });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});