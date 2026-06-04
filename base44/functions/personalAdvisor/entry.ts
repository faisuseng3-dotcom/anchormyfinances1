import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ADVISOR_RULES = `Du är Anchors personliga ekonomirådgivare — som en erfaren privatekonomisk rådgivare.

KRITISKT:
- Varje svar MÅSTE vara unikt för denna persons siffror (inkomst, marginal, buffert, utgifter).
- Referera alltid minst ett konkret belopp i kronor från snapshot.
- Ge aldrig generiska råd utan koppling till deras marginal eller mål.
- Svenska, lugn och tydlig ton.
- Gissa inte siffror som inte finns i kontexten.`;

function getTotalFixedCosts(profile) {
  if (!profile) return 0;
  const fixedItems = (profile.fixedCostItems || []).reduce((s, i) => s + (i.amount || 0), 0);
  const housing = fixedItems === 0 ? profile.housingCost || 0 : 0;
  const subs = (profile.subscriptions || []).reduce((s, x) => s + (x.amount || 0), 0);
  const loans = (profile.loans || []).reduce((s, l) => s + (l.monthlyPayment || 0), 0);
  return fixedItems + housing + subs + loans;
}

function buildSnapshot(profile, transactions) {
  const income = profile.income || 0;
  const fixed = getTotalFixedCosts(profile);
  const margin = income - fixed;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekAgo = new Date(now.getTime() - 7 * 86400000);

  const monthExpenses = (transactions || []).filter((t) => {
    if (t.type !== 'expense') return false;
    const d = new Date(t.created_date || t.date || 0);
    return d >= monthStart;
  });

  const spentThisMonth = monthExpenses.reduce((s, t) => s + Math.abs(t.amount || 0), 0);
  const spentLast7 = monthExpenses
    .filter((t) => new Date(t.created_date || t.date) >= weekAgo)
    .reduce((s, t) => s + Math.abs(t.amount || 0), 0);

  const byCat = {};
  monthExpenses.forEach((t) => {
    const c = t.category || 'other';
    byCat[c] = (byCat[c] || 0) + Math.abs(t.amount || 0);
  });

  const topCategories = Object.entries(byCat)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, kr]) => ({ category, kr: Math.round(kr) }));

  const buffer = profile.buffer || 0;
  const daysLeft = Math.max(1, 30 - now.getDate());

  return {
    income_kr: income,
    fixed_costs_kr: Math.round(fixed),
    monthly_margin_kr: Math.round(margin),
    margin_percent: income > 0 ? Math.round((margin / income) * 1000) / 10 : 0,
    buffer_kr: Math.round(buffer),
    buffer_months: fixed > 0 ? Math.round((buffer / fixed) * 10) / 10 : 0,
    savings_goal_kr: profile.savingsGoal || 0,
    savings_goal_name: profile.savingsGoalName || '',
    spent_this_month_kr: Math.round(spentThisMonth),
    spent_last_7_days_kr: Math.round(spentLast7),
    spent_percent_of_margin: margin > 0 ? Math.round((spentThisMonth / margin) * 100) : 0,
    remaining_this_month_kr: Math.round(margin - spentThisMonth),
    suggested_daily_spend_kr: margin > 0 ? Math.round(Math.max(0, margin - spentThisMonth) / daysLeft) : 0,
    top_spending_categories: topCategories,
    subscriptions: (profile.subscriptions || []).map((s) => ({
      name: s.name,
      kr: s.amount || 0,
      category: s.category,
    })),
    loans: (profile.loans || []).map((l) => ({
      name: l.name,
      payment_kr: l.monthlyPayment || 0,
    })),
    budget_limits: profile.budgetLimits || {},
    session_mood: profile.sessionMood || null,
    tone_mode: profile.toneMode || null,
    communication_style: profile.communicationStyle || 'balanced',
    city: profile.city || null,
    top_concern: profile.topConcern || null,
    pengometer: {
      remaining_week_kr: Math.max(0, Math.round((margin / 30) * 7 - spentLast7)),
      remaining_this_month_kr: Math.round(margin - spentThisMonth),
      spent_last_7_days_kr: Math.round(spentLast7),
    },
    subscription_scan: {
      total_kr: Math.round(
        (profile.subscriptions || []).reduce((s: number, x: { amount?: number }) => s + (x.amount || 0), 0),
      ),
    },
  };
}

async function invokeWithFallback(base44, prompt, schema) {
  const opts = { prompt, model: 'claude_sonnet_4_6' };
  if (schema) opts.response_json_schema = schema;
  try {
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM(opts);
    return { result, model: 'claude_sonnet_4_6' };
  } catch (err) {
    console.warn('personalAdvisor primary failed:', err?.message);
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      ...opts,
      model: 'gpt_5_5',
    });
    return { result, model: 'gpt_5_5_fallback' };
  }
}

const SCHEMAS = {
  dashboard_briefing: {
    type: 'object',
    properties: {
      headline: { type: 'string' },
      message: { type: 'string' },
      actions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            detail: { type: 'string' },
            impact_kr: { type: 'number' },
          },
          required: ['title', 'detail'],
        },
      },
    },
    required: ['headline', 'message', 'actions'],
  },
  weekly_summary: {
    type: 'object',
    properties: {
      summary: { type: 'string' },
      highlight: { type: 'string' },
      next_step: { type: 'string' },
    },
    required: ['summary', 'highlight', 'next_step'],
  },
  subscription_alternatives: {
    type: 'object',
    properties: {
      alternatives: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            price: { type: 'string' },
            savings: { type: 'string' },
            description: { type: 'string' },
            url: { type: 'string' },
          },
        },
      },
      tips: { type: 'string' },
    },
    required: ['alternatives', 'tips'],
  },
  coach_message: {
    type: 'object',
    properties: { message: { type: 'string' } },
    required: ['message'],
  },
  expense_feedback: {
    type: 'object',
    properties: { message: { type: 'string' } },
    required: ['message'],
  },
  question: {
    type: 'object',
    properties: { answer: { type: 'string' } },
    required: ['answer'],
  },
  subscription_scan: {
    type: 'object',
    properties: {
      headline: { type: 'string' },
      insight: { type: 'string' },
      share_caption: { type: 'string' },
    },
    required: ['headline', 'insight', 'share_caption'],
  },
  academy_lesson: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      body: { type: 'string' },
      takeaway: { type: 'string' },
      cta: { type: 'string' },
    },
    required: ['title', 'body', 'takeaway', 'cta'],
  },
  pengometer_line: {
    type: 'object',
    properties: {
      feeling_line: { type: 'string' },
      tip: { type: 'string' },
    },
    required: ['feeling_line', 'tip'],
  },
  passivity_wake: {
    type: 'object',
    properties: {
      headline: { type: 'string' },
      story: { type: 'string' },
      wake_line: { type: 'string' },
    },
    required: ['headline', 'story', 'wake_line'],
  },
};

function buildScenarioPrompt(scenario, snapshot, extras) {
  const base = `${ADVISOR_RULES}\n\nEkonomisk snapshot (ENDA sanning — använd dessa siffror):\n${JSON.stringify(snapshot, null, 2)}\n`;

  switch (scenario) {
    case 'dashboard_briefing': {
      const soft = snapshot.tone_mode === 'soft';
      return `${base}
Scenario: Daglig personlig briefing på Hem.
${soft ? 'Stressad användare — mjuk ton, max 1 kort action.' : 'headline (max 8 ord), message (2–3 meningar), 2–3 actions med impact_kr.'}
Nämn pengometer.remaining_week_kr om relevant. Aldrig skuldbeläggning.
Returnera JSON.`;
    }

    case 'weekly_summary':
      return `${base}
Scenario: Veckosammanfattning.
Fokusera på spent_last_7_days_kr och top_spending_categories. summary (3 meningar), highlight (1 mening), next_step (1 konkret handling).
Returnera JSON.`;

    case 'subscription_alternatives': {
      const sub = extras.subscription || {};
      return `${base}
Scenario: Jämför abonnemang "${sub.name}" (${sub.amount} kr/mån, ${sub.category}).
Med tanke på deras marginal ${snapshot.monthly_margin_kr} kr: ge 2–3 svenska alternativ billigare/likvärdiga. tips ska nämna deras marginal.
Returnera JSON.`;
    }

    case 'expense_feedback': {
      const tx = extras.transaction || {};
      return `${base}
Scenario: Användaren registrerade precis "${tx.name}" ${tx.amount} kr (${tx.category}).
remaining_this_month_kr: ${snapshot.remaining_this_month_kr}. spent_percent_of_margin: ${snapshot.spent_percent_of_margin}%.
message: max 2 meningar, referera kvarvarande marginal eller dagligt utrymme (${snapshot.suggested_daily_spend_kr} kr/dag).
Returnera JSON.`;
    }

    case 'coach_message':
      return `${base}
Scenario: ${extras.coachType || 'general'}.
Extra: ${JSON.stringify(extras.payload || {})}
message: max 2 meningar, personligt till deras snapshot.
Returnera JSON.`;

    case 'question':
      return `${base}
Användarens fråga: "${extras.question || ''}"
Svara som personlig rådgivare med deras siffror. answer: 2–4 meningar.
Returnera JSON.`;

    case 'subscription_scan':
      return `${base}
Scenario: Prenumerationsscanner. subscription_scan.total_kr är sanning.
headline med total_kr (delbar). insight: 2 meningar. share_caption: kort delningstext.
Returnera JSON.`;

    case 'academy_lesson':
      return `${base}
Scenario: Anchor Academy 60s lektion. Enkelt språk om grundbegrepp. body max 120 ord. Returnera JSON.`;

    case 'pengometer_line':
      return `${base}
Scenario: Pengometer känslolinje. feeling_line: 1 mening om remaining_week_kr. tip: 1 råd.
Returnera JSON.`;

    case 'passivity_wake':
      return `${base}
Scenario: Passivitetsväckarklocka. payload: ${JSON.stringify(extras.payload || {})}.
story 2–3 meningar, wake_line 1 stark mening. Returnera JSON.`;

    default:
      return `${base}\nScenario: ${scenario}\nReturnera JSON med message.`;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      scenario = 'dashboard_briefing',
      question,
      transaction,
      subscription,
      coachType,
      payload,
      lesson,
    } = body;

    const profiles = await base44.entities.FinancialProfile.list('-updated_date', 5);
    const profile = profiles[0];

    if (!profile?.income) {
      return Response.json({
        headline: 'Komplettera din profil',
        message: 'Lägg in inkomst och fasta kostnader under Inställningar så kan jag ge dig personliga råd utifrån din marginal.',
        actions: [{ title: 'Gå till inställningar', detail: 'Fyll i inkomst, boende och abonnemang' }],
        model: null,
        needs_profile: true,
      });
    }

    let transactions = [];
    try {
      transactions = await base44.entities.Transaction.list('-created_date', 500);
    } catch {
      transactions = profile.monthlyExpenses?.map((e, i) => ({
        type: 'expense',
        amount: e.amount,
        category: e.category,
        description: e.name,
        created_date: e.date,
        id: `legacy-${i}`,
      })) || [];
    }

    const snapshot = buildSnapshot(profile, transactions);
    const schema = SCHEMAS[scenario] || SCHEMAS.coach_message;
    const prompt = buildScenarioPrompt(scenario, snapshot, {
      question,
      transaction,
      subscription,
      coachType,
      payload,
      lesson,
    });

    const { result, model } = await invokeWithFallback(base44, prompt, schema);

    if (scenario === 'question') {
      return Response.json({ ...result, model, snapshot_summary: { margin: snapshot.monthly_margin_kr } });
    }

    return Response.json({ ...result, model, snapshot_summary: { margin: snapshot.monthly_margin_kr } });
  } catch (error) {
    console.error('personalAdvisor error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
