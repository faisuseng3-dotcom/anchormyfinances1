import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// BAS account mapping with confidence thresholds
const SYSTEM_PROMPT = `Du är en certifierad svensk redovisningskonsult (auktoriserad revisor) och expert på BAS-kontoplanen.
Din uppgift: Extrahera transaktioner från råtext och returnera STRIKT JSON enligt schema nedan.

REGLER (följ exakt):

1. DATUM: Returnera ISO-8601 (YYYY-MM-DD). Om år saknas, använd innevarande år.

2. MOMS — räkna baklänges från bruttobelopp:
   Nettobelopp = Bruttobelopp / (1 + momssats)
   Momsbelopp = Bruttobelopp - Nettobelopp
   
   Momssatser per leverantörstyp:
   - SJ, Vy, flyg, persontransport → 6%
   - Restaurang, café, mat, hotell → 12%
   - Programvara, SaaS, elektronik, konsulttjänster, reklam → 25%
   - Försäkring, löner, skatter, banker → 0%
   - Övrigt okänt → 25% (standard)

3. BAS-KONTON (matcha mot rätt konto):
   - Programvara/SaaS/licenser (Adobe, Microsoft, Figma, Slack, etc.) → 5420
   - Representation/restaurang (affärsrelaterat) → 6071
   - Resekostnader tåg/flyg/buss → 5800
   - Hotell/logi → 5820
   - Bil/fordonskostnader → 5610
   - Kontorsmaterial → 6110
   - Marknadsföring/reklam/annonsering → 6410
   - Telefon/mobilabonnemang → 6212
   - El/värme/vatten → 5020
   - Hyra/lokaler → 5010
   - Varuinköp för återförsäljning → 4000
   - Löner/arvoden → 7010
   - Försäkring → 6310
   - Bankkostnader/kortavgifter → 6570
   - Försäljning/kundbetalning (inkomst) → 3000
   - Övrigt/okänt → 6990

4. CONFIDENCE: Sätt confidence (0.0–1.0) baserat på hur säker du är på BAS-kontoklassificeringen.
   Om confidence < 0.9 → sätt needs_review: true

5. OUTPUT: Returnera ENDAST valid JSON. INGA kommentarer, INGEN extra text, INGA markdown-block.

JSON-schema för varje transaktion:
{
  "date": "YYYY-MM-DD",
  "vendor": "Leverantörsnamn",
  "description": "Kort beskrivning",
  "grossAmount": 1250.00,
  "currency": "SEK",
  "vatRate": 25,
  "vatAmount": 250.00,
  "netAmount": 1000.00,
  "accountCode": "5420",
  "accountName": "Programvara och licenser",
  "confidence": 0.95,
  "needs_review": false,
  "category": "other",
  "type": "expense"
}`;

async function invokeWithFallback(base44, prompt, schema) {
  // Primary: claude_sonnet_4_6 (High-Precision Engine)
  try {
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: 'claude_sonnet_4_6',
      response_json_schema: schema,
    });
    return { result, model: 'claude_sonnet_4_6' };
  } catch (primaryErr) {
    console.warn('Primary model failed, falling back to gpt_5_5:', primaryErr.message);
    // Fallback: GPT-4o
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: 'gpt_5_5',
      response_json_schema: schema,
    });
    return { result, model: 'gpt_5_5_fallback' };
  }
}

const TX_SCHEMA = {
  type: 'object',
  properties: {
    transactions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: { type: 'string' },
          vendor: { type: 'string' },
          description: { type: 'string' },
          grossAmount: { type: 'number' },
          currency: { type: 'string' },
          vatRate: { type: 'number' },
          vatAmount: { type: 'number' },
          netAmount: { type: 'number' },
          accountCode: { type: 'string' },
          accountName: { type: 'string' },
          confidence: { type: 'number' },
          needs_review: { type: 'boolean' },
          category: { type: 'string' },
          type: { type: 'string' },
        },
        required: ['vendor', 'description', 'grossAmount', 'accountCode', 'accountName', 'vatRate', 'confidence', 'needs_review'],
      },
    },
  },
  required: ['transactions'],
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { rawText, recentTransactions } = body;
    if (!rawText?.trim()) return Response.json({ error: 'No text provided' }, { status: 400 });

    // Build context from recent transactions for better categorization
    const contextBlock = recentTransactions?.length
      ? `\nKontext — senaste 10 bokförda transaktioner för bättre kategorisering:\n${JSON.stringify(recentTransactions.slice(0, 10))}\n`
      : '';

    const prompt = `${SYSTEM_PROMPT}${contextBlock}\n\nAnalysera och extrahera ALLA transaktioner från följande text. Tillämpa alla regler ovan strikt:\n\n${rawText}`;

    const { result, model } = await invokeWithFallback(base44, prompt, TX_SCHEMA);

    const transactions = (result.transactions || []).map(tx => ({
      ...tx,
      // Enforce needs_review if confidence below threshold
      needs_review: tx.needs_review || tx.confidence < 0.9,
      // Ensure amount field for backward compat (negative = expense)
      amount: tx.type === 'income' ? Math.abs(tx.grossAmount) : -Math.abs(tx.grossAmount),
    }));

    return Response.json({ transactions, model });
  } catch (error) {
    console.error('parseBankText error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});