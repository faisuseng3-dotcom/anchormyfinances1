import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Analytical Engine — GPT-4o for math/forecasting
const SYSTEM_PROMPT = `Du är en CFO-assistent specialiserad på kassaflödesanalys för svenska småföretag.
Du analyserar historiska transaktionsdata och returnerar STRIKT JSON utan extra text.

Din uppgift:
1. Beräkna Burn Rate (genomsnittlig nettoutgift per månad de senaste 3–6 månaderna)
2. Beräkna Runway = Total Likviditet / Burn Rate (avrundat till 1 decimal)
3. Identifiera anomalier: Utgifter som avviker >20% från föregående period för samma leverantör/kategori
4. Skapa 6 framtida prognosdatapunkter baserat på trend (linjär regression med säsongjustering)
5. Ge 3 konkreta åtgärdsförslag

JSON-schema:
{
  "burnRate": 45000,
  "runway": 8.2,
  "anomalies": [
    { "vendor": "Adobe", "previousAmount": 599, "currentAmount": 799, "delta": 200, "message": "Din Adobe-faktura var 200 kr högre denna månad. Har du uppgraderat?" }
  ],
  "forecast": [
    { "month": "Jun 2026", "balance": 320000 },
    { "month": "Jul 2026", "balance": 275000 }
  ],
  "recommendations": [
    "Overväg att förhandla om Adobe-prenumerationen — du betalar 33% mer än förra månaden.",
    "Din runway är 8 månader. Säkra ny intäkt eller minska burn rate med 15% för att nå 12 månader.",
    "Momsdeklaration på 18 500 kr förfaller om 23 dagar — håll likviditetsbuffert."
  ],
  "summary": "Kort sammanfattning på 1–2 meningar."
}`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { cashflowHistory, totalLiquidity, vatReserved, vatDeadlines } = await req.json();

    if (!cashflowHistory || cashflowHistory.length === 0) {
      return Response.json({
        burnRate: 0, runway: 0, anomalies: [], forecast: [],
        recommendations: ['Bokför transaktioner för att aktivera kassaflödesanalysen.'],
        summary: 'Inga data ännu.',
      });
    }

    const prompt = `${SYSTEM_PROMPT}

Indata:
- Total likviditet (banksaldo): ${totalLiquidity ?? 0} SEK
- Momsreservat: ${vatReserved ?? 0} SEK
- Momsdatum: ${JSON.stringify(vatDeadlines ?? [])}
- Kassaflödeshistorik (senaste 6 månader): ${JSON.stringify(cashflowHistory)}

Beräkna och returnera JSON enligt schema.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: 'gpt_5_5',
      response_json_schema: {
        type: 'object',
        properties: {
          burnRate: { type: 'number' },
          runway: { type: 'number' },
          anomalies: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                vendor: { type: 'string' },
                previousAmount: { type: 'number' },
                currentAmount: { type: 'number' },
                delta: { type: 'number' },
                message: { type: 'string' },
              },
            },
          },
          forecast: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                month: { type: 'string' },
                balance: { type: 'number' },
              },
            },
          },
          recommendations: { type: 'array', items: { type: 'string' } },
          summary: { type: 'string' },
        },
        required: ['burnRate', 'runway', 'anomalies', 'forecast', 'recommendations', 'summary'],
      },
    });

    return Response.json(result);
  } catch (error) {
    console.error('runwayEngine error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});