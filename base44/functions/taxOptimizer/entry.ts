import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// High-Precision Engine — Claude Sonnet for Swedish tax rules
const SYSTEM_PROMPT = `Du är en auktoriserad skatterådgivare specialiserad på svenska skatteregler 2026 för Enskild Firma och Aktiebolag.

Du har tillgång till följande aktuella gränsvärden (2026):
- Statlig inkomstskatt: 20% på inkomst över 643 100 kr (kommunal ~30% nedan)
- Tjänstepension (Enskild firma): Avdrag upp till 35% av inkomst, max 604 000 kr
- Periodiseringsfond (Enskild firma): Avsättning upp till 30% av vinsten, max 1 060 000 kr ackumulerat
- Räntefördelning: Positiv räntefördelning vid positivt kapitalunderlag
- AB: Bolagsskatt 20,6%, utdelning via 3:12-regler, löneunderlag
- Grundavdrag: 15 700–48 900 kr beroende på inkomst
- F-skatt egenavgifter: 28,97% (under 65 år)

Analysera användarens ekonomi och returnera STRIKT JSON — inga pratiga svar, bara strukturerad data:

{
  "entityType": "enskild|ab",
  "currentTaxBurden": 95000,
  "optimizedTaxBurden": 72000,
  "potentialSaving": 23000,
  "distanceToStatligSkatt": 120000,
  "recommendations": [
    {
      "title": "Tjänstepensionsavsättning",
      "description": "Kort konkret förklaring",
      "savingAmount": 15000,
      "priority": "high|medium|low",
      "action": "Konkret handlingsanvisning"
    }
  ],
  "breakpointAnalysis": {
    "currentIncome": 580000,
    "statligSkattThreshold": 643100,
    "distanceKr": 63100,
    "recommendation": "Du är 63 100 kr från statlig skatt. Avsätt till pension för att stanna under gränsen."
  },
  "summary": "2 meningar max."
}`;

async function invokeWithFallback(base44, prompt, schema) {
  try {
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: 'claude_sonnet_4_6',
      response_json_schema: schema,
    });
    return { result, model: 'claude_sonnet_4_6' };
  } catch (err) {
    console.warn('Tax optimizer primary model failed, retrying:', err.message);
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: 'gpt_5_5',
      response_json_schema: schema,
    });
    return { result, model: 'gpt_5_5_fallback' };
  }
}

const SCHEMA = {
  type: 'object',
  properties: {
    entityType: { type: 'string' },
    currentTaxBurden: { type: 'number' },
    optimizedTaxBurden: { type: 'number' },
    potentialSaving: { type: 'number' },
    distanceToStatligSkatt: { type: 'number' },
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          savingAmount: { type: 'number' },
          priority: { type: 'string' },
          action: { type: 'string' },
        },
        required: ['title', 'description', 'savingAmount', 'priority', 'action'],
      },
    },
    breakpointAnalysis: {
      type: 'object',
      properties: {
        currentIncome: { type: 'number' },
        statligSkattThreshold: { type: 'number' },
        distanceKr: { type: 'number' },
        recommendation: { type: 'string' },
      },
    },
    summary: { type: 'string' },
  },
  required: ['entityType', 'currentTaxBurden', 'optimizedTaxBurden', 'potentialSaving', 'recommendations', 'summary'],
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Inform AI about reset state so it doesn't reference deleted data
    const { entityType, annualRevenue, annualExpenses, transactions, isReset } = await req.json();

    const resetNote = isReset
      ? '\n\nVIKTIGT: Databasen har återställts. Referera INTE till tidigare transaktioner. Basera analysen enbart på de angivna siffrorna nedan.\n'
      : '';

    const prompt = `${SYSTEM_PROMPT}${resetNote}

Användardata:
- Bolagsform: ${entityType === 'ab' ? 'Aktiebolag (AB)' : 'Enskild Firma'}
- Beräknad årsomsättning: ${annualRevenue ?? 0} SEK
- Beräknade årskostnader: ${annualExpenses ?? 0} SEK
- Beräknad nettovinst: ${(annualRevenue ?? 0) - (annualExpenses ?? 0)} SEK
- Senaste transaktioner: ${JSON.stringify((transactions ?? []).slice(0, 10))}

Analysera och returnera skatteoptimering enligt JSON-schema.`;

    const { result, model } = await invokeWithFallback(base44, prompt, SCHEMA);
    return Response.json({ ...result, model });
  } catch (error) {
    console.error('taxOptimizer error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});