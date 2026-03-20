import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const POINT_RULES = {
  onboarding_complete: { points: 1000, cap_type: 'ever' },
  pulse_open:          { points: 50,   cap_type: 'daily', daily_cap: 2 },
  expense_register:    { points: 30,   cap_type: 'daily', daily_cap: 5 },
  expense_categorize:  { points: 20,   cap_type: 'daily', daily_cap: 5 },
  hero_card_click:     { points: 10,   cap_type: 'daily', daily_cap: 4 },
  ai_coach_question:   { points: 100,  cap_type: 'daily', daily_cap: 1 },
  resell_scanner:      { points: 300,  cap_type: 'daily', daily_cap: 2 },
  whatif_simulation:   { points: 200,  cap_type: 'daily', daily_cap: 1 },
  savings_goal_setup:  { points: 250,  cap_type: 'weekly', weekly_cap: 1 },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const event_type = body.event_type;
    const rule = POINT_RULES[event_type];
    if (!rule) return Response.json({ error: 'Unknown event type' }, { status: 400 });

    const today = new Date().toISOString().split('T')[0];

    // Fetch all existing events for this user+type for cap checking
    const existingEvents = await base44.asServiceRole.entities.ChallengeEvent.filter({
      user_id: user.id,
      event_type
    });

    // Check caps
    if (rule.cap_type === 'ever' && existingEvents.length > 0) {
      return Response.json({ points: 0, reason: 'already_earned' });
    }

    if (rule.cap_type === 'daily') {
      const todaysEvents = existingEvents.filter(e => e.date === today);
      if (todaysEvents.length >= rule.daily_cap) {
        return Response.json({ points: 0, reason: 'daily_cap_reached' });
      }
    }

    if (rule.cap_type === 'weekly') {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - daysFromMonday);
      const weekStartStr = weekStart.toISOString().split('T')[0];
      const thisWeeksEvents = existingEvents.filter(e => e.date >= weekStartStr);
      if (thisWeeksEvents.length >= rule.weekly_cap) {
        return Response.json({ points: 0, reason: 'weekly_cap_reached' });
      }
    }

    // Log the event
    await base44.asServiceRole.entities.ChallengeEvent.create({
      user_id: user.id,
      user_email: user.email,
      event_type,
      points: rule.points,
      date: today,
    });

    // Update UserPoints record
    const records = await base44.asServiceRole.entities.UserPoints.filter({ user_id: user.id });
    if (records.length > 0) {
      const rec = records[0];
      await base44.asServiceRole.entities.UserPoints.update(rec.id, {
        weekly_points: (rec.weekly_points || 0) + rule.points,
        total_points: (rec.total_points || 0) + rule.points,
        user_email: user.email,
        user_name: user.full_name,
      });
    } else {
      await base44.asServiceRole.entities.UserPoints.create({
        user_id: user.id,
        user_email: user.email,
        user_name: user.full_name,
        weekly_points: rule.points,
        total_points: rule.points,
      });
    }

    return Response.json({ points: rule.points, event_type });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});