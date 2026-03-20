import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow scheduled calls (no user) or admin users
    let authorized = false;
    try {
      const user = await base44.auth.me();
      authorized = user?.role === 'admin';
    } catch {
      // No auth = scheduled call, allow
      authorized = true;
    }

    if (!authorized) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const allRecords = await base44.asServiceRole.entities.UserPoints.list('', 1000);
    await Promise.all(allRecords.map(rec =>
      base44.asServiceRole.entities.UserPoints.update(rec.id, { weekly_points: 0 })
    ));

    return Response.json({ reset: allRecords.length, timestamp: new Date().toISOString() });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});