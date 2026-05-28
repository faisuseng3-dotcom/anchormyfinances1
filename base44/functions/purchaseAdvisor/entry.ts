import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SCHEMA = {
  type: 'object',
  properties: {
    productName: { type: 'string' },
    price: { type: 'number' },
    category: { type: 'string' },
    priceAssessment: { type: 'string' },
    verdict: { type: 'string' },
    verdictReason: { type: 'string' },
    budgetImpact: { type: 'number' },
    daysDelayedGoal: { type: 'number' },
    opportunityCost: { type: 'string' },
    aiInsight: { type: 'string' },
    maintenanceCost: { type: 'number' },
    maintenanceNote: { type: 'string' },
  },
  required: [
    'productName',
    'price',
    'category',
    'priceAssessment',
    'verdict',
    'verdictReason',
    'budgetImpact',
    'daysDelayedGoal',
    'opportunityCost',
    'aiInsight',
    'maintenanceCost',
    'maintenanceNote',
  ],
};

function buildPrompt({
  source,
  income,
  margin,
  savingsGoalName,
  dailyTarget,
}: {
  source: string;
  income: number;
  margin: number;
  savingsGoalName: string;
  dailyTarget: number;
}) {
  return `Du är en svensk privatekonomisk köp-rådgivare.
${source}

Mål: ge exakta, nyktra siffror för köpbeslut utan hype.

Returnera ENDAST JSON enligt schema med:
{
  "productName": "Produktnamn och modell",
  "price": 4500,
  "category": "möbel|elektronik|fordon|kläder|övrigt",
  "priceAssessment": "Bra pris|Högt pris|Normalt pris",
  "verdict": "Köp|Vänta|Hitta billigare",
  "verdictReason": "En tydlig mening",
  "budgetImpact": 18,
  "daysDelayedGoal": 14,
  "opportunityCost": "Vad användaren kan göra istället",
  "aiInsight": "Max 2 meningar, konkret svenska",
  "maintenanceCost": 0,
  "maintenanceNote": "Löpande kostnader om relevant, annars tom sträng"
}

Användarens ekonomi:
- Inkomst: ${income} kr/mån
- Marginal: ${margin} kr/mån
- Sparmål: ${savingsGoalName}
- Dagligt mål: ${dailyTarget} kr/dag

Regler:
- Var konservativ med råd om köp.
- Om information saknas: välj "Vänta".
- Inga emojis, inga extra fält, inget utanför JSON.`;
}

async function invokeWithFallback(base44, prompt, addContextFromInternet, fileUrls) {
  try {
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: 'claude_sonnet_4_6',
      add_context_from_internet: addContextFromInternet,
      response_json_schema: SCHEMA,
      file_urls: fileUrls?.length ? fileUrls : null,
    });
    return { result, model: 'claude_sonnet_4_6' };
  } catch (primaryErr) {
    console.warn('purchaseAdvisor primary model failed:', primaryErr?.message);
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: 'gpt_5_5',
      add_context_from_internet: addContextFromInternet,
      response_json_schema: SCHEMA,
      file_urls: fileUrls?.length ? fileUrls : null,
    });
    return { result, model: 'gpt_5_5_fallback' };
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      url,
      income = 0,
      margin = 0,
      savingsGoalName = 'sparmålet',
      dailyTarget = 25,
      fileUrls = [],
    } = body || {};

    if (!url && (!Array.isArray(fileUrls) || fileUrls.length === 0)) {
      return Response.json({ error: 'Missing input' }, { status: 400 });
    }

    const source = url
      ? `Användaren har klistrat in denna URL: ${url}`
      : 'Användaren har laddat upp en bild på en produkt/prislapp.';

    const prompt = buildPrompt({
      source,
      income: Number(income) || 0,
      margin: Number(margin) || 0,
      savingsGoalName: String(savingsGoalName || 'sparmålet'),
      dailyTarget: Number(dailyTarget) || 25,
    });

    const { result, model } = await invokeWithFallback(base44, prompt, !!url, fileUrls);
    return Response.json({ ...result, model });
  } catch (error) {
    console.error('purchaseAdvisor error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
