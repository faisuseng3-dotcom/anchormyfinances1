import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SYSTEM_PROMPT = `Du är Anchors läckage-coach. Regler har redan hittat dolda utgifter.
Skriv EN kort förklaring per läckage (max 100 tecken, svenska, lugn ton).
Fokusera på varför det kostar och vad användaren kan göra — gissa inte nya belopp.

Returnera ENDAST JSON: { "explanations": [{ "id": "...", "text": "..." }] }`;

const SCHEMA = {
  type: 'object',
  properties: {
    explanations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          text: { type: 'string' },
        },
        required: ['id', 'text'],
      },
    },
  },
  required: ['explanations'],
};

async function invokeWithFallback(base44, prompt) {
  try {
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: 'claude_sonnet_4_6',
      response_json_schema: SCHEMA,
    });
    return { result, model: 'claude_sonnet_4_6' };
  } catch (err) {
    console.warn('explainLeakage primary failed:', err.message);
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: 'gpt_5_5',
      response_json_schema: SCHEMA,
    });
    return { result, model: 'gpt_5_5_fallback' };
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { leaks } = await req.json();
    if (!Array.isArray(leaks) || leaks.length === 0) {
      return Response.json({ explanations: [], model: null });
    }

    const batch = leaks.slice(0, 8);
    const list = batch
      .map(
        (l, i) =>
          `${i + 1}. id="${l.id}" typ=${l.type} titel="${l.title}" beskrivning="${l.description}" belopp=${l.monthlyAmount} kr/mån`,
      )
      .join('\n');

    const prompt = `${SYSTEM_PROMPT}\n\nLäckage att förklara:\n${list}`;

    const { result, model } = await invokeWithFallback(base44, prompt);

    return Response.json({
      explanations: result.explanations || [],
      model,
    });
  } catch (error) {
    console.error('explainLeakage error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
