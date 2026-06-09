/** Delade kategorier för prenumerationer — Settings, onboarding, hub. */
export const SUBSCRIPTION_CATEGORIES = [
  { id: 'entertainment', label: 'Nöje' },
  { id: 'transport', label: 'Transport' },
  { id: 'health', label: 'Hälsa' },
  { id: 'streaming', label: 'Streaming' },
  { id: 'food', label: 'Mat' },
  { id: 'insurance', label: 'Försäkring' },
  { id: 'other', label: 'Övrigt' },
];

export function subscriptionCategoryLabel(id) {
  return SUBSCRIPTION_CATEGORIES.find((c) => c.id === id)?.label || 'Övrigt';
}
