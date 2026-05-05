import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SYSTEM_PROMPT = `Du är en svensk bokföringsexpert och AI-assistent. Din uppgift är att analysera ostrukturerad banktext och extrahera transaktioner.

För varje transaktion ska du returnera:
- date: datum (YYYY-MM-DD eller som det står i texten, t.ex. "2024-04-15")
- description: kort beskrivning/leverantörnamn
- vendor: leverantörsnamn (om identifierbart)
- amount: belopp i SEK (negativt = utgift, positivt = inkomst/insättning)
- accountCode: BAS-kontonummer (t.ex. 5420, 6071, 3000)
- accountName: kontonamn på svenska (t.ex. "Programvara och licenser", "Representation")
- vatRate: momssats i procent (25, 12, 6, eller 0)
- category: kategori (food, transport, entertainment, health, shopping, income, other)

Kontoguide (BAS-plan):
- Löner/personal: 7010
- Hyra/lokaler: 5010
- El/värme: 5020
- Telefon/internet: 6212
- Programvara/SaaS/licenser: 5420
- Resor (tåg, flyg, bil): 6071
- Hotell/logi: 6072
- Representation (restaurang, mat affärsrelaterat): 6071
- Kontorsmaterial: 6110
- Marknadsföring/reklam: 6410
- Försäkring: 6310
- Bankkostnader: 6570
- Försäljning/inkomst: 3000
- Övrigt: 6990

Momssatsguide:
- Mat, hotell, persontransport: 12%
- Kultur, tidningar, böcker: 6%
- SaaS, programvara, elektronik, tjänster: 25%
- Löner, skatter, försäkringar: 0%

Returnera BARA ett JSON-objekt med ett "transactions" array. Inga kommentarer, ingen extra text.`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rawText } = await req.json();
    if (!rawText || !rawText.trim()) {
      return Response.json({ error: 'No text provided' }, { status: 400 });
    }

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `${SYSTEM_PROMPT}\n\nAnalysera följande banktext och extrahera alla transaktioner:\n\n${rawText}`,
      response_json_schema: {
        type: 'object',
        properties: {
          transactions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date: { type: 'string' },
                description: { type: 'string' },
                vendor: { type: 'string' },
                amount: { type: 'number' },
                accountCode: { type: 'string' },
                accountName: { type: 'string' },
                vatRate: { type: 'number' },
                category: { type: 'string' },
              },
              required: ['description', 'amount', 'accountCode', 'accountName', 'vatRate'],
            },
          },
        },
        required: ['transactions'],
      },
    });

    return Response.json({ transactions: result.transactions || [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});