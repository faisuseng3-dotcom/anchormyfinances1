import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Get all UserPoints sorted by weekly_points
    const allPoints = await base44.asServiceRole.entities.UserPoints.list('-weekly_points', 200);

    // For top 10, enrich with recent events (anti-cheat inspection)
    const top10 = allPoints.slice(0, 10);
    const enriched = await Promise.all(top10.map(async (u) => {
      const recentEvents = await base44.asServiceRole.entities.ChallengeEvent.filter(
        { user_id: u.user_id },
        '-created_date',
        5
      );
      return { ...u, recent_events: recentEvents };
    }));

    return Response.json({
      leaderboard: enriched,
      all_users: allPoints,
      total_participants: allPoints.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});