/**
 * Stripe-konfiguration för Base44-funktioner.
 *
 * TEST MODE (default):
 *   STRIPE_SECRET_KEY=sk_test_...
 *   STRIPE_WEBHOOK_SECRET=whsec_...
 *   STRIPE_PRICE_BASIC=price_... (99 kr/mån SEK)
 *   STRIPE_PRICE_PRO=price_... (149 kr/mån SEK)
 *   STRIPE_PRICE_BUSINESS=price_... (299 kr/mån SEK)
 *
 * LIVE MODE — byt till live-nycklar i Base44 function secrets:
 *   STRIPE_SECRET_KEY=sk_live_...
 *   STRIPE_WEBHOOK_SECRET=whsec_... (live endpoint)
 *   STRIPE_PRICE_* = live price IDs från Stripe Dashboard
 */
import Stripe from 'npm:stripe@17.7.0';

export type PlanId = 'free' | 'basic' | 'pro' | 'business';

const PLAN_TO_PRICE_ENV: Record<Exclude<PlanId, 'free'>, string> = {
  basic: 'STRIPE_PRICE_BASIC',
  pro: 'STRIPE_PRICE_PRO',
  business: 'STRIPE_PRICE_BUSINESS',
};

export function getStripe(): Stripe {
  const key = Deno.env.get('STRIPE_SECRET_KEY');
  if (!key) throw new Error('STRIPE_SECRET_KEY saknas');
  return new Stripe(key, { apiVersion: '2024-11-20.acacia' });
}

export function getPriceIdForPlan(plan: PlanId): string {
  if (plan === 'free') throw new Error('Gratisplan har inget Stripe-pris');
  const envKey = PLAN_TO_PRICE_ENV[plan];
  const priceId = Deno.env.get(envKey);
  if (!priceId) throw new Error(`${envKey} saknas`);
  return priceId;
}

export function planFromPriceId(priceId: string): PlanId | null {
  const entries: [PlanId, string][] = [
    ['basic', Deno.env.get('STRIPE_PRICE_BASIC') || ''],
    ['pro', Deno.env.get('STRIPE_PRICE_PRO') || ''],
    ['business', Deno.env.get('STRIPE_PRICE_BUSINESS') || ''],
  ];
  const hit = entries.find(([, id]) => id && id === priceId);
  return hit ? hit[0] : null;
}

export function planToMode(plan: PlanId): string {
  switch (plan) {
    case 'pro':
    case 'business':
      return 'pro';
    case 'basic':
      return 'smart';
    default:
      return 'basic';
  }
}

export async function findProfileByEmail(
  base44: { asServiceRole: { entities: { FinancialProfile: { filter: (q: object) => Promise<Array<{ id: string }>> } } } },
  email: string,
) {
  const profiles = await base44.asServiceRole.entities.FinancialProfile.filter({ created_by: email });
  return profiles[0] || null;
}

export async function findProfileByStripeCustomer(
  base44: { asServiceRole: { entities: { FinancialProfile: { filter: (q: object) => Promise<Array<{ id: string }>> } } } },
  customerId: string,
) {
  const profiles = await base44.asServiceRole.entities.FinancialProfile.filter({
    stripeCustomerId: customerId,
  });
  return profiles[0] || null;
}

export async function sendPaymentFailedEmail(to: string, plan: string) {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('BILLING_EMAIL_FROM') || 'Anchor <billing@anchor.app>';

  if (!apiKey) {
    console.warn('[stripeWebhook] RESEND_API_KEY saknas — hoppar över e-post till', to);
    return { sent: false };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: 'Betalningen misslyckades — uppdatera ditt kort',
      html: `<p>Hej!</p>
<p>Vi kunde inte dra din Anchor ${plan}-prenumeration. Uppdatera betalningsmetoden i Inställningar så att du behåller tillgång till dina funktioner.</p>
<p><a href="https://anchor.app/Settings">Gå till Inställningar</a></p>
<p>Hälsningar,<br/>Anchor</p>`,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[stripeWebhook] E-post misslyckades:', err);
    return { sent: false, error: err };
  }

  return { sent: true };
}
