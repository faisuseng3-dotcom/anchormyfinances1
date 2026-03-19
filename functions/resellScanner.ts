import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { imageUrl } = await req.json();
  if (!imageUrl) return Response.json({ error: 'No image provided' }, { status: 400 });

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    model: 'claude_sonnet_4_6',
    prompt: `Du är en expertbedömare av begagnade varor för andrahandsmarknaden i Sverige.

Analysera bilden och identifiera föremålet. Svara ALLTID på svenska med exakt detta JSON-format:

{
  "identified": true,
  "brand": "Märke (t.ex. Nike, Apple, H&M)",
  "model": "Modell/Produktnamn",
  "category": "Kategori (t.ex. Kläder, Elektronik, Skor, Väska, Möbler)",
  "condition": "Skick: Nyskick / Mycket bra / Bra / Acceptabelt / Slitet",
  "conditionNote": "Kort beskrivning av skicket baserat på bilden",
  "quickSalePrice": 250,
  "maxPrice": 450,
  "avgPrice": 340,
  "currency": "SEK",
  "marketplaces": ["Blocket", "Tradera", "Sellpy"],
  "sellingTips": "Kort tips för att maximera priset (max 1 mening)",
  "confidence": "hög/medel/låg"
}

Basera priserna på faktiska andrahandspriser i Sverige 2024-2025. Om du inte kan identifiera ett specifikt märke/modell, uppskatta ändå baserat på kategori och synligt skick. Om bilden är helt otydlig, sätt identified: false.`,
    file_urls: [imageUrl],
    response_json_schema: {
      type: 'object',
      properties: {
        identified: { type: 'boolean' },
        brand: { type: 'string' },
        model: { type: 'string' },
        category: { type: 'string' },
        condition: { type: 'string' },
        conditionNote: { type: 'string' },
        quickSalePrice: { type: 'number' },
        maxPrice: { type: 'number' },
        avgPrice: { type: 'number' },
        currency: { type: 'string' },
        marketplaces: { type: 'array', items: { type: 'string' } },
        sellingTips: { type: 'string' },
        confidence: { type: 'string' },
      }
    }
  });

  return Response.json(result);
});