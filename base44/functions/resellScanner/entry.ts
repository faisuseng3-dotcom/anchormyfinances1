import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function getPlatforms(category, brand) {
  const cat = (category || '').toLowerCase();
  const br = (brand || '').toLowerCase();

  if (cat.includes('elektronik') || cat.includes('spel') || cat.includes('dator') || cat.includes('mobil') || cat.includes('telefon') || cat.includes('kamera') || cat.includes('audio') || cat.includes('headset') || cat.includes('kontroll')) {
    return [
      { name: 'Tradera', reason: 'Högst pris för elektronik', priceMultiplier: 1.05, url: 'https://www.tradera.com/search?q=' },
      { name: 'Blocket', reason: 'Snabb lokal affär', priceMultiplier: 0.97, url: 'https://www.blocket.se/annonser?q=' },
      { name: 'eBay', reason: 'Internationell räckvidd', priceMultiplier: 1.1, currency: 'USD', url: 'https://www.ebay.com/sch/i.html?_nkw=' },
    ];
  }
  if (cat.includes('kläder') || cat.includes('mode') || br.includes('zara') || br.includes('h&m') || br.includes('hm') || br.includes('uniqlo') || br.includes('levi')) {
    return [
      { name: 'Vinted', reason: 'Störst för fast fashion', priceMultiplier: 0.95, url: 'https://www.vinted.se/catalog?search_text=' },
      { name: 'Sellpy', reason: 'Enklast – de säljer åt dig', priceMultiplier: 0.85, url: 'https://www.sellpy.se/search?q=' },
      { name: 'Blocket', reason: 'Bra för lokal försäljning', priceMultiplier: 0.9, url: 'https://www.blocket.se/annonser?q=' },
    ];
  }
  if (cat.includes('skor') || cat.includes('sneakers') || cat.includes('stövlar')) {
    return [
      { name: 'Plick', reason: 'Stor marknad för skor', priceMultiplier: 1.0, url: 'https://www.plick.se/s?query=' },
      { name: 'Vinted', reason: 'Hög volym och snabba affärer', priceMultiplier: 0.92, url: 'https://www.vinted.se/catalog?search_text=' },
      { name: 'Tradera', reason: 'Bra för vintage och märkesskor', priceMultiplier: 1.03, url: 'https://www.tradera.com/search?q=' },
    ];
  }
  if (cat.includes('väska') || cat.includes('designer') || cat.includes('lyx') || br.includes('louis') || br.includes('gucci') || br.includes('prada')) {
    return [
      { name: 'Vestiaire Collective', reason: 'Premium-plattform för lyx', priceMultiplier: 1.2, url: 'https://www.vestiairecollective.com/search/#q=' },
      { name: 'Plick', reason: 'Stor nordisk marknad', priceMultiplier: 1.05, url: 'https://www.plick.se/s?query=' },
      { name: 'Sellpy', reason: 'Trygg och enkel', priceMultiplier: 0.88, url: 'https://www.sellpy.se/search?q=' },
    ];
  }
  if (cat.includes('möbler') || cat.includes('heminredning') || cat.includes('bil') || cat.includes('fordon') || cat.includes('cykel')) {
    return [
      { name: 'Facebook Marketplace', reason: 'Bäst för tunga/stora saker', priceMultiplier: 0.93, url: 'https://www.facebook.com/marketplace/search/?query=' },
      { name: 'Blocket', reason: 'Landets största andrahandsmarknad', priceMultiplier: 0.97, url: 'https://www.blocket.se/annonser?q=' },
    ];
  }
  if (cat.includes('böcker') || cat.includes('spel') || cat.includes('vinyl') || cat.includes('samlarobjekt')) {
    return [
      { name: 'Tradera', reason: 'Bäst för samlarobjekt & böcker', priceMultiplier: 1.08, url: 'https://www.tradera.com/search?q=' },
      { name: 'Blocket', reason: 'Snabb lokal affär', priceMultiplier: 0.9, url: 'https://www.blocket.se/annonser?q=' },
      { name: 'eBay', reason: 'Globalt intresse för sällsynta fynd', priceMultiplier: 1.15, currency: 'USD', url: 'https://www.ebay.com/sch/i.html?_nkw=' },
    ];
  }
  return [
    { name: 'Tradera', reason: 'Bra för de flesta kategorier', priceMultiplier: 1.0, url: 'https://www.tradera.com/search?q=' },
    { name: 'Blocket', reason: 'Snabb lokal försäljning', priceMultiplier: 0.95, url: 'https://www.blocket.se/annonser?q=' },
    { name: 'Vinted', reason: 'Stor aktiv köpargrupp', priceMultiplier: 0.9, url: 'https://www.vinted.se/catalog?search_text=' },
  ];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { imageUrl, manualQuery } = body;

  // ── MANUAL SEARCH MODE ──────────────────────────────────────────
  if (manualQuery && !imageUrl) {
    const manualResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Du är en svensk andrahandsmarknadsexpert. Användaren söker på: "${manualQuery}".

Estimera andrahandsvärde för denna vara i Sverige. Svara med JSON:
{
  "identified": true,
  "brand": "Märke",
  "model": "Modell",
  "category": "Kategori",
  "condition": "Bra",
  "conditionNote": "Okänt skick – uppskattning",
  "quickSalePrice": 200,
  "avgPrice": 300,
  "maxPrice": 400,
  "currency": "SEK",
  "sellingTips": "Tips",
  "confidence": "medel",
  "uncertainAboutModel": false,
  "guesses": []
}`,
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
          avgPrice: { type: 'number' },
          maxPrice: { type: 'number' },
          currency: { type: 'string' },
          sellingTips: { type: 'string' },
          confidence: { type: 'string' },
          uncertainAboutModel: { type: 'boolean' },
          guesses: { type: 'array', items: { type: 'object' } },
        }
      }
    });

    const platforms = getPlatforms(manualResult.category, manualResult.brand);
    const platformPrices = platforms.map(p => ({
      name: p.name,
      reason: p.reason,
      estimatedPrice: Math.round((manualResult.avgPrice || 200) * p.priceMultiplier),
      currency: p.currency || 'SEK',
      searchUrl: p.url + encodeURIComponent(manualQuery),
    }));
    const topPlatform = platformPrices.filter(p => p.currency === 'SEK').sort((a, b) => b.estimatedPrice - a.estimatedPrice)[0];

    return Response.json({
      ...manualResult,
      platformPrices,
      recommendedPlatform: topPlatform?.name,
      recommendedPlatformReason: topPlatform ? `AI ser att du får ${topPlatform.estimatedPrice} kr här — ${topPlatform.reason.toLowerCase()}` : '',
      marketplaces: platformPrices.map(p => p.name),
    });
  }

  if (!imageUrl) return Response.json({ error: 'No image or query provided' }, { status: 400 });

  // ── IMAGE SCAN MODE ─────────────────────────────────────────────
  const aiResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `Du är en AI som kombinerar Google Lens, OCR och marknadsanalys. Din uppgift är att identifiera VARJE objekt i bilden, oavsett vad det är.

STEG 1 – OBJEKTIGENKÄNNING: Vad ser du? Beskriv form, färg, storlek.
STEG 2 – OCR / LOGOTYPLÄSNING: Läs all text och logotyper (t.ex. "Sony", "PS5", "Nike", "IKEA"). Använd detta för att verifiera märke och modell.
STEG 3 – SKICKANALYS: Ser objektet nytt eller slitet ut? Finns det repor, smuts eller defekter?
STEG 4 – VÄRDERING: Vad betalar folk för detta på Tradera och Blocket just nu?

KRITISKA REGLER:
- Du måste ALLTID svara med identified: true om du ser något objekt överhuvudtaget.
- Om du är osäker på exakt modell: ge ditt bästa gissning OCH lista 3 alternativ i "guesses".
- Sätt ALDRIG identified: false om du kan se ett fysiskt objekt.
- Only set identified: false if the image is completely black, blurry beyond recognition, or contains no physical object at all.

Svara på svenska med exakt detta JSON:
{
  "identified": true,
  "brand": "Märke (t.ex. Sony, Apple, Nike, Okänt)",
  "model": "Exakt modell eller bästa gissning",
  "category": "En av: Elektronik, Kläder, Skor, Väska, Möbler, Böcker, Sport, Leksaker, Heminredning, Övrigt",
  "condition": "Nyskick / Mycket bra / Bra / Acceptabelt / Slitet",
  "conditionNote": "Kort beskrivning av synligt skick",
  "quickSalePrice": 250,
  "avgPrice": 340,
  "maxPrice": 450,
  "currency": "SEK",
  "sellingTips": "Konkret tips för att maximera priset (max 1 mening)",
  "confidence": "hög/medel/låg",
  "uncertainAboutModel": false,
  "guesses": [
    { "label": "PS5 DualSense (Vit)", "category": "Elektronik" },
    { "label": "PS4 DualShock 4", "category": "Elektronik" },
    { "label": "Generisk spelkontroll", "category": "Elektronik" }
  ]
}

"guesses" ska vara ifyllt om confidence är "låg" eller "medel". Annars tom array [].
Basera priserna på faktiska svenska andrahandspriser 2024-2025.`,
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
        avgPrice: { type: 'number' },
        maxPrice: { type: 'number' },
        currency: { type: 'string' },
        sellingTips: { type: 'string' },
        confidence: { type: 'string' },
        uncertainAboutModel: { type: 'boolean' },
        guesses: { type: 'array', items: { type: 'object' } },
      }
    }
  });

  // If AI says not identified — still return something useful so user can search manually
  if (!aiResult.identified) {
    console.error('Vision AI returned identified:false. Raw:', JSON.stringify(aiResult));
    return Response.json({ identified: false, needsManualInput: true });
  }

  const platforms = getPlatforms(aiResult.category, aiResult.brand);
  const platformPrices = platforms.map(p => ({
    name: p.name,
    reason: p.reason,
    estimatedPrice: Math.round((aiResult.avgPrice || 200) * p.priceMultiplier),
    currency: p.currency || 'SEK',
    searchUrl: p.url + encodeURIComponent(`${aiResult.brand || ''} ${aiResult.model || ''}`),
  }));

  const topPlatform = platformPrices.filter(p => p.currency === 'SEK').sort((a, b) => b.estimatedPrice - a.estimatedPrice)[0];

  return Response.json({
    ...aiResult,
    platformPrices,
    recommendedPlatform: topPlatform?.name || aiResult.topPlatform,
    recommendedPlatformReason: topPlatform
      ? `AI ser att du får ${topPlatform.estimatedPrice} kr här — ${topPlatform.reason.toLowerCase()}`
      : '',
    marketplaces: platformPrices.map(p => p.name),
  });
  } catch (err) {
    console.error('resellScanner error:', err?.message || err);
    return Response.json({ error: err?.message || 'Unknown error', identified: false }, { status: 500 });
  }
});