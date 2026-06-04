import { buildAdvisorSnapshot, getAdvisorSystemRules } from '@/lib/buildAdvisorContext';

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
  const profile = extras.profile || null;
  const rules = getAdvisorSystemRules(profile);
  const base = `${rules}\n\nEkonomisk snapshot (ENDA sanning — använd dessa siffror):\n${JSON.stringify(snapshot, null, 2)}\n`;

  switch (scenario) {
    case 'dashboard_briefing': {
      const soft = snapshot.tone_mode === 'soft';
      return `${base}
Scenario: Daglig personlig briefing på Hem.
${soft ? 'Användaren är stressad — max 1 kort action, mjuk ton.' : 'Skriv headline (max 8 ord), message (2–3 meningar), 2–3 actions med impact_kr.'}
Nämn gärna pengometer.remaining_week_kr om relevant.
Returnera JSON enligt schema.`;
    }

    case 'weekly_summary':
      return `${base}
Scenario: Veckosammanfattning.
Fokusera på spent_last_7_days_kr och pengometer. summary (3 meningar), highlight (1 mening), next_step (1 handling).
Returnera JSON.`;

    case 'subscription_scan':
      return `${base}
Scenario: Prenumerationsscanner — "många bäckar små".
subscription_scan.total_kr och items är sanning. headline ska innehålla total_kr (delbar på sociala medier).
insight: 2 meningar om vad det betyder för marginalen. share_caption: kort text användaren kan dela.
Returnera JSON.`;

    case 'academy_lesson': {
      const lesson = extras.lesson || {};
      return `${base}
Scenario: Anchor Academy — 60 sekunders lektion om "${lesson.topic || lesson.title}".
body: max 120 ord, enkelt språk som förklarar grundbegrepp (Lund-studien: unga saknar ofta ränta/inflation-kunskap).
takeaway: 1 mening. cta: 1 konkret handling i appen.
Returnera JSON.`;
    }

    case 'pengometer_line':
      return `${base}
Scenario: Pengometer — digital sedelbunt.
pengometer.remaining_week_kr är huvudsiffran. feeling_line: 1 mening som gör kvarvarande pengar kännbara (inte teknisk).
tip: 1 kort råd utifrån fill_percent. Returnera JSON.`;

    case 'passivity_wake': {
      const { monthly_kr, fv_kr, wait_cost_kr, years } = extras.payload || {};
      return `${base}
Scenario: Passivitetsväckarklocka.
Användaren sparar ${monthly_kr} kr/mån. Om ${years} år: ${fv_kr} kr. Varje månad de väntar kostar ca ${wait_cost_kr} kr i framtida värde.
story: 2–3 meningar, ingen skuld — visa möjlighet. wake_line: 1 stark mening.
Returnera JSON.`;
    }

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
remaining_this_month_kr: ${snapshot.remaining_this_month_kr}. pengometer.remaining_week_kr: ${snapshot.pengometer?.remaining_week_kr}.
message: max 2 meningar. Returnera JSON.`;
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
