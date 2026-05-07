import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SYSTEM_RECONCILE = `Du är en auktoriserad revisor som hjälper svenska småföretag med bankavstämning. 
Analysera differensen och ge ett konkret, handlingsorienterat råd på svenska. 
Svara med max 2 meningar. Om differensen är 0, bekräfta att allt stämmer.`;

const SYSTEM_CLOSING = `Du är en expert på svensk bokföring (BAS-kontoplanen). 
Skapa ett korrekt resultatregleringsverifikat för årets slut. 
Om vinst: Debet 8999, Kredit 2099. Om förlust: Debet 2099, Kredit 8999.
Svara ALLTID med valid JSON i exakt det angivna schemat.`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    if (action === 'reconcile') {
      const { bankBalance, bookBalance, diff } = body;

      const prompt = `Bankbalans: ${bankBalance} kr. Bokförd balans (konto 1930): ${bookBalance} kr. Differens: ${diff} kr.
${diff === 0 ? 'Allt stämmer.' : `Det är en differens på ${diff} kr. Analysera vad som kan orsaka detta och ge ett råd.`}`;

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        model: 'claude_sonnet_4_6',
        response_json_schema: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      });

      return Response.json({ message: result?.message || (diff === 0 ? 'Bokföringen stämmer exakt med banken.' : `Differens på ${diff} kr — kontrollera om det saknas en transaktion.`) });
    }

    if (action === 'closing_voucher') {
      const { result, isAB, companyName } = body;
      const profit = result || 0;

      const prompt = `Företag: ${companyName}. Årets resultat: ${profit} kr. ${isAB ? 'Aktiebolag.' : 'Enskild firma.'}
Skapa ett resultatregleringsverifikat som stänger konto 8999 mot 2099.`;

      const voucher = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        model: 'claude_sonnet_4_6',
        response_json_schema: {
          type: 'object',
          properties: {
            description: { type: 'string' },
            summary: { type: 'string' },
            lines: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  account: { type: 'string' },
                  label: { type: 'string' },
                  debit: { type: 'number' },
                  credit: { type: 'number' },
                },
              },
            },
          },
        },
      });

      return Response.json(voucher);
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});