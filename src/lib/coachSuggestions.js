import { createPageUrl } from '@/utils';

/** Föreslagna frågor — minskar friktion, ökar Coach-användning. */
export const COACH_SUGGESTIONS = [
  {
    id: 'purchase',
    label: 'Kan jag köpa den här produkten?',
    prompt: 'Kan jag köpa den här produkten? Hjälp mig bedöma utifrån min budget och mitt sparmål.',
    href: createPageUrl('PurchaseSimulator'),
    navigate: true,
  },
  {
    id: 'save-1k',
    label: 'Hur kan jag spara 1 000 kr denna månad?',
    prompt: 'Hur kan jag spara 1 000 kr denna månad utifrån min nuvarande ekonomi?',
  },
  {
    id: 'subs',
    label: 'Vilka prenumerationer kostar mig mest?',
    prompt: 'Vilka prenumerationer kostar mig mest och vilka bör jag överväga att avsluta?',
  },
  {
    id: 'travel',
    label: 'Hur mycket kan jag lägga på resor?',
    prompt: 'Hur mycket kan jag lägga på resor denna månad utan att påverka mitt sparmål?',
  },
];
