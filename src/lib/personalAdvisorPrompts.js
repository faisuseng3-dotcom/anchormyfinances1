import { ADVISOR_SYSTEM_RULES, buildAdvisorSnapshot } from '@/lib/buildAdvisorContext';

export const ADVISOR_SCHEMAS = {
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
};

export function buildAdvisorScenarioPrompt(scenario, snapshot, extras = {}) {
  const base = `${ADVISOR_SYSTEM_RULES}\n\nEkonomisk snapshot (ENDA sanning — använd dessa siffror):\n${JSON.stringify(snapshot, null, 2)}\n`;

  switch (scenario) {
    case 'dashboard_briefing':
      return `${base}
Scenario: Daglig personlig briefing på dashboard.
Skriv headline (max 8 ord), message (2–3 meningar med deras marginal/buffert/utgifter), och 2–3 actions med konkret impact_kr där möjligt.
Returnera JSON enligt schema.`;

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

    default:
      return `${base}\nScenario: ${scenario}\nReturnera JSON med message.`;
  }
}

export function getNeedsProfileResponse() {
  return {
    headline: 'Komplettera din profil',
    message: 'Lägg in inkomst och fasta kostnader under Inställningar så kan jag ge dig personliga råd utifrån din marginal.',
    actions: [{ title: 'Gå till inställningar', detail: 'Fyll i inkomst, boende och abonnemang' }],
    model: null,
    needs_profile: true,
  };
}

export { buildAdvisorSnapshot };
