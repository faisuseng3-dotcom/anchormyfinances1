import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Platform mapping by category
function getPlatforms(category, brand) {
  const cat = (category || '').toLowerCase();
  const br = (brand || '').toLowerCase();

  if (cat.includes('elektronik') || cat.includes('spel') || cat.includes('dator') || cat.includes('mobil') || cat.includes('telefon')) {
    return [
      { name: 'Tradera', reason: 'Högst pris för elektronik', priceMultiplier: 1.05, url: 'https://www.tradera.com/search?q=' },
      { name: 'Blocket', reason: 'Snabb lokal affär', priceMultiplier: 0.97, url: 'https://www.blocket.se/annonser?q=' },
      { name: 'eBay', reason: 'Internationell räckvidd', priceMultiplier: 1.1, currency: 'USD', url: 'https://www.ebay.com/sch/i.html?_nkw=' },
    ];
  }
  if (cat.includes('kläder') || cat.includes('mode') || br.includes('zara') || br.includes('h&m') || br.includes('hm')) {
    return [
      { name: 'Vinted', reason: 'Störst för fast fashion', priceMultiplier: 0.95, url: 'https://www.vinted.se/catalog?search_text=' },
      { name: 'Sellpy', reason: 'Enklast – de säljer åt dig', priceMultiplier: 0.85, url: 'https://www.sellpy.se/search?q=' },
      { name: 'Blocket', reason: 'Bra för lokal försäljning', priceMultiplier: 0.9, url: 'https://www.blocket.se/annonser?q=' },
    ];
  }
  if (cat.includes('skor') || cat.includes('sneakers')) {
    return [
      { name: 'Plick', reason: 'Stor marknad för skor', priceMultiplier: 1.0, url: 'https://www.plick.se/s?query=' },
      { name: 'Vinted', reason: 'Hög volym och snabba affärer', priceMultiplier: 0.92, url: 'https://www.vinted.se/catalog?search_text=' },
      { name: 'Tradera', reason: 'Bra för vintage och märkesskor', priceMultiplier: 1.03, url: 'https://www.tradera.com/search?q=' },
    ];
  }
  if (cat.includes('väska') || cat.includes('lyxig') || cat.includes('designer') || cat.includes('lyx')) {
    return [
      { name: 'Vestiaire Collective', reason: 'Premium-plattform för lyx', priceMultiplier: 1.2, url: 'https://www.vestiairecollective.com/search/#q=' },
      { name: 'Plick', reason: 'Stor nordisk marknad', priceMultiplier: 1.05, url: 'https://www.plick.se/s?query=' },
      { name: 'Sellpy', reason: 'Trygg och enkel', priceMultiplier: 0.88, url: 'https://www.sellpy.se/search?q=' },
    ];
  }
  if (cat.includes('möbler') || cat.includes('heminredning') || cat.includes('bil') || cat.includes('fordon')) {
    return [
      { name: 'Facebook Marketplace', reason: 'Bäst för tunga/stora saker', priceMultiplier: 0.93, url: 'https://www.facebook.com/marketplace/search/?query=' },
      { name: 'Blocket', reason: 'Landets största andrahandsmarknad', priceMultiplier: 0.97, url: 'https://www.blocket.se/annonser?q=' },
    ];
  }
  // Default
  return [
    { name: 'Tradera', reason: 'Bra för de flesta kategorier', priceMultiplier: 1.0, url: 'https://www.tradera.com/search?q=' },
    { name: 'Blocket', reason: 'Snabb lokal försäljning', priceMultiplier: 0.95, url: 'https://www.blocket.se/annonser?q=' },
    { name: 'Vinted', reason: 'Stor aktiv köpargrupp', priceMultiplier: 0.9, url: 'https://www.vinted.se/catalog?search_text=' },
  ];
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { imageUrl } = await req.json();
  if (!imageUrl) return Response.json({ error: 'No image provided' }, { status: 400 });

  const aiResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
    model: 'claude_sonnet_4_6',
    prompt: `Du är en expertbedömare av begagnade varor för andrahandsmarknaden i Sverige.

Analysera bilden noggrant. Leta efter:
- Logotyper, text, produktnamn
- Form och design (t.ex. PS-logga, joystickar = PlayStation-kontroll)
- Färg och material
- Synliga skador eller slitage

Svara ALLTID på svenska med exakt detta JSON-format:

{
  "identified": true,
  "brand": "Märke (t.ex. Sony, Apple, Nike)",
  "model": "Exakt modell om möjlig (t.ex. DualSense, iPhone 14, Air Force 1)",
  "category": "En av: Elektronik, Kläder, Skor, Väska, Möbler, Leksaker, Sport, Övrigt",
  "condition": "Nyskick / Mycket bra / Bra / Acceptabelt / Slitet",
  "conditionNote": "Kort beskrivning av synligt skick baserat på bilden",
  "quickSalePrice": 250,
  "avgPrice": 340,
  "maxPrice": 450,
  "currency": "SEK",
  "topPlatform": "Den bästa plattformen för denna vara",
  "topPlatformReason": "Varför den plattformen är bäst för detta objekt",
  "sellingTips": "Konkret tips för att maximera priset (max 1 mening)",
  "confidence": "hög/medel/låg",
  "uncertainAboutModel": false
}

Om du är osäker på modellen men vet kategorin: sätt uncertainAboutModel: true och gör en rimlig prisuppskattning baserat på kategorin.
Om bilden är helt otydlig: sätt identified: false.
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
        topPlatform: { type: 'string' },
        topPlatformReason: { type: 'string' },
        sellingTips: { type: 'string' },
        confidence: { type: 'string' },
        uncertainAboutModel: { type: 'boolean' },
      }
    }
  });

  if (!aiResult.identified) {
    return Response.json({ identified: false });
  }

  // Build platform price comparison
  const platforms = getPlatforms(aiResult.category, aiResult.brand);
  const platformPrices = platforms.map(p => ({
    name: p.name,
    reason: p.reason,
    estimatedPrice: Math.round(aiResult.avgPrice * p.priceMultiplier),
    currency: p.currency || 'SEK',
    searchUrl: p.url + encodeURIComponent(`${aiResult.brand} ${aiResult.model}`),
  }));

  // Top platform is the one with highest SEK price
  const topPlatform = platformPrices
    .filter(p => p.currency === 'SEK')
    .sort((a, b) => b.estimatedPrice - a.estimatedPrice)[0];

  return Response.json({
    ...aiResult,
    platformPrices,
    recommendedPlatform: topPlatform?.name || aiResult.topPlatform,
    recommendedPlatformReason: topPlatform ? `AI ser att du får ${topPlatform.estimatedPrice} kr här — ${topPlatform.reason.toLowerCase()}` : aiResult.topPlatformReason,
    marketplaces: platformPrices.map(p => p.name),
  });
});