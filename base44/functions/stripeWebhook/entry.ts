import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@17.7.0';

// ── inlined from _shared/stripeConfig.ts ───────────────────────────────────
type PlanId = 'free' | 'basic' | 'pro' | 'business';
function getStripe() { const k = Deno.env.get('STRIPE_SECRET_KEY'); if (!k) throw new Error('STRIPE_SECRET_KEY saknas'); return new Stripe(k, { apiVersion: '2024-11-20.acacia' }); }
function planFromPriceId(priceId: string): PlanId | null { const e: [PlanId, string][] = [['basic', Deno.env.get('STRIPE_PRICE_BASIC')||''],['pro', Deno.env.get('STRIPE_PRICE_PRO')||''],['business', Deno.env.get('STRIPE_PRICE_BUSINESS')||'']]; const h = e.find(([, id]) => id && id === priceId); return h ? h[0] : null; }
function planToMode(plan: PlanId) { return (plan === 'pro' || plan === 'business') ? 'pro' : plan === 'basic' ? 'smart' : 'basic'; }
async function findProfileByEmail(base44: any, email: string) { const p = await base44.asServiceRole.entities.FinancialProfile.filter({ created_by: email }); return p[0] || null; }
async function findProfileByStripeCustomer(base44: any, customerId: string) { const p = await base44.asServiceRole.entities.FinancialProfile.filter({ stripeCustomerId: customerId }); return p[0] || null; }
async function sendPaymentFailedEmail(to: string, plan: string) {
  const apiKey = Deno.env.get('RESEND_API_KEY'); const from = Deno.env.get('BILLING_EMAIL_FROM') || 'Lago <billing@anchor.app>';
  if (!apiKey) { console.warn('[stripeWebhook] RESEND_API_KEY saknas'); return { sent: false }; }
  const res = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to: [to], subject: 'Betalningen misslyckades — uppdatera ditt kort', html: `<p>Vi kunde inte dra din Lago ${plan}-prenumeration. <a href="https://anchor.app/Settings">Gå till Inställningar</a></p>` }) });
  if (!res.ok) return { sent: false }; return { sent: true };
}
// ───────────────────────────────────────────────────────────────────────────

function renewalFromSubscription(sub: { current_period_end?: number }) {
  if (!sub?.current_period_end) return null;
  return new Date(sub.current_period_end * 1000).toISOString();
}

async function upgradeProfile(
  base44: ReturnType<typeof createClientFromRequest>,
  profileId: string,
  patch: Record<string, unknown>,
) {
  await base44.asServiceRole.entities.FinancialProfile.update(profileId, {
    ...patch,
    paymentFailed: false,
  });
}

async function resolvePlanFromSession(session: {
  metadata?: Record<string, string>;
  subscription?: string | { id: string };
}): Promise<PlanId> {
  const metaPlan = session.metadata?.plan as PlanId | undefined;
  if (metaPlan && metaPlan !== 'free') return metaPlan;

  const stripe = getStripe();
  const subId = typeof session.subscription === 'string'
    ? session.subscription
    : session.subscription?.id;
  if (!subId) return 'basic';

  const sub = await stripe.subscriptions.retrieve(subId);
  const priceId = sub.items.data[0]?.price?.id;
  return planFromPriceId(priceId || '') || 'basic';
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const stripe = getStripe();
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!webhookSecret) {
    return Response.json({ error: 'STRIPE_WEBHOOK_SECRET saknas' }, { status: 500 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return Response.json({ error: 'Saknar stripe-signature' }, { status: 400 });
  }

  const body = await req.text();
  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('[stripeWebhook] Signatur ogiltig:', err.message);
    return Response.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const email = session.metadata?.user_email || session.customer_details?.email;
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
        const subscriptionId = typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id;

        const plan = await resolvePlanFromSession(session);
        let profile = customerId
          ? await findProfileByStripeCustomer(base44, customerId)
          : null;
        if (!profile && email) {
          profile = await findProfileByEmail(base44, email);
        }
        if (!profile) {
          console.warn('[stripeWebhook] Ingen profil för checkout', email, customerId);
          break;
        }

        let renewalDate: string | null = null;
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          renewalDate = renewalFromSubscription(sub);
        }

        await upgradeProfile(base44, profile.id, {
          plan,
          mode: planToMode(plan),
          stripeCustomerId: customerId || profile.stripeCustomerId,
          subscriptionId: subscriptionId || null,
          renewalDate,
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer?.id;
        const profile = customerId
          ? await findProfileByStripeCustomer(base44, customerId)
          : null;
        if (!profile) break;

        await upgradeProfile(base44, profile.id, {
          plan: 'free',
          mode: 'basic',
          subscriptionId: null,
          renewalDate: null,
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = typeof invoice.customer === 'string'
          ? invoice.customer
          : invoice.customer?.id;
        const email = invoice.customer_email;
        const profile = customerId
          ? await findProfileByStripeCustomer(base44, customerId)
          : email
            ? await findProfileByEmail(base44, email)
            : null;

        if (profile) {
          await base44.asServiceRole.entities.FinancialProfile.update(profile.id, {
            paymentFailed: true,
          });
        }

        if (email) {
          const planLabel = profile?.plan || 'Lago';
          await sendPaymentFailedEmail(email, planLabel);
        }
        break;
      }

      default:
        break;
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('[stripeWebhook]', error);
    return Response.json({ error: error.message || 'Webhook handler failed' }, { status: 500 });
  }
});
