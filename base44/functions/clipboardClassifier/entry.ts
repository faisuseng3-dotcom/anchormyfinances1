import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Fast Engine — GPT-4o-mini, latency-optimized (<500ms target)
const SYSTEM_PROMPT = `Du är en binär klassificerare. Avgör om texten innehåller finansiell transaktionsdata.

Finansiell data = betalningar, köp, kvitton, bankutdrag, fakturor, belopp + leverantör.
INTE finansiell = nyheter, recept, sociala medier, koder, adresser.

Om finansiell data hittas: Skapa en kort (max 10 ord) push-notis på svenska.

Returnera ENDAST JSON:
{ "isFinancial": true/false, "notification": "kort text här eller null", "vendor": "leverantör eller null", "amount": 0 }`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { text } = await req.json();
    if (!text?.trim() || text.length < 5) {
      return Response.json({ isFinancial: false, notification: null, vendor: null, amount: 0 });
    }

    // Cap text length for speed
    const truncated = text.slice(0, 500);

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `${SYSTEM_PROMPT}\n\nText att klassificera:\n${truncated}`,
      model: 'gpt_5_mini',
      response_json_schema: {
        type: 'object',
        properties: {
          isFinancial: { type: 'boolean' },
          notification: { type: ['string', 'null'] },
          vendor: { type: ['string', 'null'] },
          amount: { type: 'number' },
        },
        required: ['isFinancial'],
      },
    });

    return Response.json(result);
  } catch (error) {
    console.error('clipboardClassifier error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});