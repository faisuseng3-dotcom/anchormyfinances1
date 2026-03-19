// Smart kategori-förslag baserat på text-mönster
const categoryPatterns = {
  food: [
    'ica', 'willys', 'hemköp', 'lidl', 'coop', 'max', 'subway', 'kfc',
    'pizza', 'burger', 'mat', 'mat', 'lunch', 'fika', 'mat', 'mat',
    'restaurang', 'café', 'kaffe', 'taco', 'sushi', 'mat', 'mat'
  ],
  transport: [
    'sl', 'sj', 'västtrafik', 'bensin', 'gas', 'diesel', 'parkering',
    'taxi', 'uber', 'swish', 'buss', 'tåg', 'flyg', 'flygbiljett', 'bil'
  ],
  entertainment: [
    'spotify', 'netflix', 'hbo', 'disney', 'steam', 'epic', 'psn', 'xbox',
    'bio', 'film', 'teater', 'konsert', 'event', 'spel', 'game'
  ],
  health: [
    'apoteket', 'tandläkare', 'gym', 'träning', 'yoga', 'medicin',
    'läkare', 'sjukvård', 'hälsa', 'massage', 'wellness'
  ],
  shopping: [
    'h&m', 'zara', 'jeans', 'kläder', 'skor', 'klädaffär', 'ebay',
    'amazon', 'zalando', 'ikea', 'möbler', 'möbel'
  ],
  travel: [
    'airbnb', 'booking', 'hotell', 'hostel', 'resort', 'resort', 'resa'
  ],
  insurance: [
    'försäkring', 'insurance', 'hemförsäkring', 'bilförsäkring',
    'sjukförsäkring', 'liv', 'livförsäkring'
  ]
};

export function suggestCategory(text) {
  if (!text) return 'other';

  const lower = text.toLowerCase().trim();

  for (const [category, patterns] of Object.entries(categoryPatterns)) {
    for (const pattern of patterns) {
      if (lower.includes(pattern)) {
        return category;
      }
    }
  }

  return 'other';
}

// Quick-action kategorier (snabbgenvägar)
export const QUICK_ACTIONS = [
  { label: 'Mat 🍔', category: 'food', icon: '🍔' },
  { label: 'Transport 🚌', category: 'transport', icon: '🚌' },
  { label: 'Nöje 🎬', category: 'entertainment', icon: '🎬' },
  { label: 'Hälsa 💪', category: 'health', icon: '💪' },
  { label: 'Kläder 👕', category: 'shopping', icon: '👕' },
  { label: 'Resor ✈️', category: 'travel', icon: '✈️' },
  { label: 'Försäkring 🛡️', category: 'insurance', icon: '🛡️' },
  { label: 'Övrigt ➕', category: 'other', icon: '➕' }
];